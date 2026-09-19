const path = require('path');
const fs = require('fs');

// Ensure environment variables are loaded
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Multi-model Fallback Pool for high-demand / 503 / 429 resiliency
const MODEL_POOL = [
  'gemini-2.5-flash',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest'
];
const REQUEST_TIMEOUT_MS = 8000; // 8 seconds timeout per model attempt

/**
 * Call Gemini API with JSON Schema and resilient Multi-model Failover Pool
 */
async function callGemini(partsInput, customSchema = null) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in backend/.env');
  }

  let parts = [];
  if (typeof partsInput === 'string') {
    parts = [{ text: partsInput }];
  } else if (Array.isArray(partsInput)) {
    parts = partsInput;
  }

  const defaultSchema = {
    type: "OBJECT",
    properties: {
      is_correct: { type: "BOOLEAN" },
      score: { type: "INTEGER" },
      status: { 
        type: "STRING", 
        enum: ["exact", "acceptable", "minor_mistake", "incorrect"] 
      },
      status_label: { type: "STRING" },
      feedback: { type: "STRING" },
      grammar_analysis: { type: "STRING" },
      suggested_answer: { type: "STRING" }
    },
    required: ["is_correct", "score", "status", "status_label", "feedback", "suggested_answer"]
  };

  let lastError = null;

  for (const model of MODEL_POOL) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
      contents: [
        {
          parts: parts
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 600,
        thinkingConfig: {
          thinkingBudget: 0
        },
        responseMimeType: "application/json",
        responseSchema: customSchema || defaultSchema
      }
    };

    try {
      console.log(`[aiGradingService] Attempting model: ${model}...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        console.warn(`[aiGradingService] Model ${model} returned HTTP ${response.status}: ${errorBody.substring(0, 120)}... Retrying next model in pool.`);
        lastError = new Error(`HTTP ${response.status} from ${model}`);
        continue; // Try next model in pool!
      }

      const data = await response.json();
      const candidate = data.candidates && data.candidates[0];
      if (!candidate || !candidate.content || !candidate.content.parts) {
        console.warn(`[aiGradingService] Model ${model} returned empty content. Retrying next model.`);
        lastError = new Error(`Empty content from ${model}`);
        continue;
      }

      let jsonText = candidate.content.parts[0].text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      const parsed = JSON.parse(jsonText);

      console.log(`[aiGradingService] Successfully evaluated with model: ${model}`);
      return {
        result: parsed,
        modelUsed: model,
        usageMetadata: data.usageMetadata || {
          promptTokenCount: 100,
          candidatesTokenCount: 50,
          totalTokenCount: 150
        }
      };
    } catch (err) {
      const isTimeout = err.name === 'AbortError';
      console.warn(`[aiGradingService] Model ${model} failed (${isTimeout ? 'Timeout > 8s' : err.message}). Retrying next model in pool...`);
      lastError = err;
    }
  }

  throw new Error(`All Gemini models in pool failed. Last error: ${lastError ? lastError.message : 'Unknown'}`);
}

/**
 * Grade a student answer using Gemini AI
 */
async function gradeJapaneseAnswer({
  direction = 'vi-to-ja', // 'vi-to-ja' or 'ja-to-vi'
  question = '',
  userAnswer = '',
  correctAnswer = '',
  lessonTitle = '',
  context = ''
}) {
  const prompt = `
Bạn là một chuyên gia giảng dạy tiếng Nhật giàu kinh nghiệm (trình độ N5 - N4).
Nhiệm vụ của bạn là chấm điểm và nhận xét câu trả lời của học viên trong một bài tập tự luận.

THÔNG TIN BÀI TẬP:
- Hướng dịch: ${direction === 'vi-to-ja' ? 'Tiếng Việt ➔ Tiếng Nhật' : 'Tiếng Nhật ➔ Tiếng Việt'}
- Đề bài: "${question}"
- Câu trả lời của học viên: "${userAnswer}"
- Đáp án tham khảo chuẩn: "${correctAnswer}"
${lessonTitle ? `- Bài học: "${lessonTitle}"` : ''}
${context ? `- Ngữ cảnh / Ghi chú: "${context}"` : ''}

TIÊU CHÍ CHẤM ĐIỂM SƯ PHẠM:
1. Đánh giá tính chính xác về nghĩa, ngữ pháp, trợ từ (は, が, を, に, で, へ, と, も, から, まで, より...), chia thể động từ/tính từ, và độ tự nhiên.
2. Hãy bao dung và khuyến khích: Nếu học viên dịch đúng nghĩa, dùng từ đồng nghĩa hợp lý hoặc đảo trật tự các cụm từ một cách tự nhiên (ví dụ trạng từ chỉ thời gian đứng trước hay sau chủ ngữ), hãy chấm ĐÚNG (is_correct: true, score: 85 - 100, status: "exact" hoặc "acceptable").
3. Nếu học viên có lỗi nhỏ (nhầm trợ từ như に thay vì で, gõ thiếu trường âm nhẹ, chia sai nhẹ thể): status: "minor_mistake", score: 60 - 75, giải thích rõ lỗi sai trợ từ hoặc cấu trúc đó.
4. Nếu sai nghĩa hoặc sai cấu trúc nghiêm trọng: is_correct: false, status: "incorrect", score: 0 - 45.
5. Mọi lời giải thích trong "feedback" và "grammar_analysis" phải viết bằng TIẾNG VIỆT súc tích, dễ hiểu, mang tính sư phạm khuyến khích (dưới 80 từ).
6. "suggested_answer": Cung cấp câu tiếng Nhật (hoặc Việt) tự nhiên, chuẩn mực nhất theo đúng trình độ N5/N4.
`;

  return await callGemini(prompt);
}

/**
 * Grade handwriting of a Japanese Kanji radical using Gemini Vision AI
 */
async function gradeRadicalHandwriting({
  targetRadical = '',
  sinoVietnamese = '',
  meaning = '',
  imageBase64 = ''
}) {
  const cleanBase64 = (imageBase64 || '').replace(/^data:image\/[a-z]+;base64,/, '');

  const prompt = `
Bạn là một chuyên gia thư pháp và giảng dạy chữ Hán / Kanji tiếng Nhật.
Học viên vừa vẽ một bộ thủ trên bảng vẽ cảm ứng/chuột.
Thông tin bộ thủ mục tiêu cần vẽ:
- Bộ thủ chuẩn: "${targetRadical}"
- Tên Hán Việt: "${sinoVietnamese}"
- Ý nghĩa: "${meaning}"

Hình ảnh đính kèm là nét vẽ thực tế của học viên (nét vẽ màu sáng trên nền sẫm).
Hãy quan sát kỹ hình ảnh và đánh giá khách quan, sư phạm:
1. Đánh giá nhận diện: Chữ học viên vẽ có đúng là bộ thủ "${targetRadical}" không?
2. Đánh giá bố cục nét: Độ thẳng/cong của nét sổ, độ nghiêng của nét phẩy, nét móc, độ khép kín của các khung vuông/hộp, tỷ lệ cân đối giữa các nét.
3. Chấm điểm theo thang 100:
   - 90 - 100: Xuất sắc! Nét vẽ rất đẹp, chuẩn xác, cân đối.
   - 75 - 89: Đạt chuẩn! Vẽ đúng chữ, hình thái nhận diện rõ ràng, có thể nét còn hơi rung nhẹ nhưng chuẩn xác.
   - 50 - 74: Cần cải thiện! Nhận diện được chữ nhưng tỷ lệ nét bị méo, thiếu/thừa nét hoặc lệch vị trí.
   - 0 - 49: Không đạt! Vẽ sai chữ hoàn toàn, hoặc vẽ nguệch ngoạc không đúng bộ thủ "${targetRadical}".
4. Lời nhận xét sư phạm: Viết bằng TIẾNG VIỆT súc tích (1-2 câu ngắn gọn, dưới 60 từ), mang tính khích lệ, chỉ ra điểm đẹp và mẹo để nét bút hoàn thiện hơn.
`;

  const parts = [];
  if (cleanBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: cleanBase64
      }
    });
  }
  parts.push({ text: prompt });

  const handwritingSchema = {
    type: "OBJECT",
    properties: {
      is_correct: { type: "BOOLEAN" },
      score: { type: "INTEGER" },
      status: {
        type: "STRING",
        enum: ["excellent", "acceptable", "needs_improvement", "incorrect"]
      },
      status_label: { type: "STRING" },
      feedback: { type: "STRING" },
      stroke_tips: { type: "STRING" }
    },
    required: ["is_correct", "score", "status", "status_label", "feedback"]
  };

  return await callGemini(parts, handwritingSchema);
}

module.exports = {
  gradeJapaneseAnswer,
  gradeRadicalHandwriting
};
