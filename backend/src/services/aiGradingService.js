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
async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in backend/.env');
  }

  let lastError = null;

  for (const model of MODEL_POOL) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 600,
        thinkingConfig: {
          thinkingBudget: 0
        },
        responseMimeType: "application/json",
        responseSchema: {
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
        }
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

module.exports = {
  gradeJapaneseAnswer
};
