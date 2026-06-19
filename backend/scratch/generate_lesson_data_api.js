const fs = require('fs');
const path = require('path');

// Load environment variables from website/backend/.env
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const rawDataFile = path.join(__dirname, 'mnn_raw_data.json');
const generatedDataFile = path.join(__dirname, 'mnn_generated_data.json');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.error('\n❌ ERROR: GEMINI_API_KEY is not set in backend/.env or environment!');
  console.error('Vui lòng tạo hoặc điền GEMINI_API_KEY vào tệp: website/backend/.env\n');
  process.exit(1);
}

// Helper to delay execution
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function callGeminiAPI(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${GEMINI_API_KEY}`;
  
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
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            lesson_id: { type: "INTEGER" },
            hiragana: { type: "STRING" },
            romaji: { type: "STRING" },
            vietnamese_meaning: { type: "STRING" },
            word_type: { type: "STRING" },
            japanese_example: { type: "STRING" },
            example_meaning: { type: "STRING" },
            mnemonic_tip: { type: "STRING" }
          },
          required: [
            "lesson_id",
            "hiragana",
            "romaji",
            "vietnamese_meaning",
            "word_type",
            "japanese_example",
            "example_meaning",
            "mnemonic_tip"
          ]
        }
      }
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (Status: ${response.status}): ${errText}`);
  }

  const result = await response.json();
  try {
    const text = result.candidates[0].content.parts[0].text;
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Failed to parse Gemini JSON response: ' + e.message);
  }
}

async function processLesson(lessonId, rawWords, existingGeneratedData) {
  console.log(`\n======================================================`);
  console.log(`🚀 BẮT ĐẦU XỬ LÝ BÀI ${lessonId} (${rawWords.length} từ thô)`);
  console.log(`======================================================`);
  
  const lessonKey = `lesson_${lessonId}`;
  const existingWords = existingGeneratedData[lessonKey] || [];
  const existingHiraganas = new Set(existingWords.map(w => w.hiragana.trim()));
  
  // Filter out already processed words to support resuming
  const wordsToProcess = rawWords.filter(w => !existingHiraganas.has(w.hiragana.trim()));
  
  if (wordsToProcess.length === 0) {
    console.log(`✓ Toàn bộ ${rawWords.length} từ của Bài ${lessonId} đã được sinh trước đó. Bỏ qua.`);
    return existingWords;
  }
  
  console.log(`- Số từ cần sinh mới: ${wordsToProcess.length} / ${rawWords.length}`);
  
  const batchSize = 30;
  const batches = [];
  for (let i = 0; i < wordsToProcess.length; i += batchSize) {
    batches.push(wordsToProcess.slice(i, i + batchSize));
  }
  
  const enrichedResults = [...existingWords];
  
  for (let bIndex = 0; bIndex < batches.length; bIndex++) {
    const batch = batches[bIndex];
    console.log(`\n👉 Đang gửi Batch ${bIndex + 1}/${batches.length} (${batch.length} từ) lên Gemini API...`);
    
    const prompt = `
Bạn là một giáo viên tiếng Nhật chuyên nghiệp và đầy sáng tạo. Hãy làm phong phú danh sách từ vựng Minna no Nihongo (Bài ${lessonId}) dưới đây để lưu vào cơ sở dữ liệu học tập.

Danh sách từ vựng đầu vào (dạng JSON thô):
${JSON.stringify(batch, null, 2)}

Yêu cầu cụ thể cho từng từ:
1. lesson_id: Giữ nguyên giá trị số là ${lessonId}.
2. hiragana: Giữ nguyên từ trường 'hiragana'.
3. romaji: Chuyển trường 'hiragana' sang Romaji. LƯU Ý: Không dùng dấu gạch ngang (macrons/accents) như ō, ū, ā. Thay vào đó dùng nguyên âm đôi chuẩn, ví dụ: 'ou' (cho ō), 'uu' (cho ū), 'ee' (cho ē), 'ii' (cho ī), 'aa' (cho ā). Ví dụ: 'ginkou', 'sensei', 'okimasu'.
4. vietnamese_meaning: Nghĩa tiếng Việt chuẩn, chính xác, ngắn gọn của từ vựng này. Hãy tham khảo nghĩa tiếng Anh của từ trong JSON đầu vào để dịch cho chuẩn xác.
5. word_type: Loại từ, chọn một trong các giá trị: 'noun', 'verb', 'adjective', 'adverb', 'particle', 'counter', 'pronoun', 'phrase', 'interjection'.
6. japanese_example: Một câu ví dụ tiếng Nhật ngắn gọn, thực tế, tự nhiên sử dụng từ vựng này. Bắt buộc có chữ Kanji phổ biến đi kèm Hiragana (như '起きます' thay vì chỉ viết 'おきます').
7. example_meaning: Dịch nghĩa câu ví dụ trên sang tiếng Việt.
8. mnemonic_tip: Một mẹo nhớ (Mnemonic tip) bằng tiếng Việt cực kỳ dí dỏm, độc đáo, sử dụng phương pháp âm thanh tương tự (phần phiên âm Romaji đọc lái đi hoặc gần giống một từ tiếng Việt nào đó) kết hợp với nghĩa của từ để tạo thành một câu chuyện ngắn giúp người học dễ nhớ từ này ngay lập tức. Ví dụ:
   - Thức dậy (okimasu): 'Ô kìa mắt' - Ô kìa mắt mở ra rồi, thức dậy thôi.
   - Ngân hàng (ginkou): 'Gìn của' - Ngân hàng là nơi để gìn giữ của cái.
   - Thư viện (toshokan): 'To số cả' - Thư viện có to số sách cả thảy.
   - Thứ Hai (getsuyoubi): 'Ghét dắt ví' - Thứ Hai đi làm ghét dắt ví đi vì chưa có tiền lương.

Hãy trả về một mảng JSON các đối tượng tuân thủ nghiêm ngặt schema yêu cầu. Không thêm bớt bất kỳ từ ngữ thảo luận nào.
    `;
    
    let retries = 3;
    let success = false;
    let enrichedBatch = [];
    
    while (retries > 0 && !success) {
      try {
        enrichedBatch = await callGeminiAPI(prompt);
        success = true;
      } catch (err) {
        retries--;
        console.error(`❌ Lỗi khi gọi API (Còn ${retries} lần thử lại):`, err.message);
        if (retries > 0) {
          const isRateLimit = err.message.includes('429') || err.message.includes('503');
          const waitTime = isRateLimit ? 60000 : 10000;
          console.log(`Đợi ${waitTime / 1000} giây trước khi thử lại...`);
          await sleep(waitTime);
        } else {
          throw err;
        }
      }
    }
    
    if (success && Array.isArray(enrichedBatch)) {
      console.log(`✅ Sinh thành công ${enrichedBatch.length} từ.`);
      enrichedBatch.forEach(w => {
        // Ensure image_url exists
        w.image_url = "";
        enrichedResults.push(w);
      });
      
      // Save progress immediately after each batch
      existingGeneratedData[lessonKey] = enrichedResults;
      fs.writeFileSync(generatedDataFile, JSON.stringify(existingGeneratedData, null, 2), 'utf8');
      console.log(`💾 Đã cập nhật tiến độ tạm thời vào mnn_generated_data.json`);
    }
    
    // Pause between batches to avoid rate limit (15 RPM -> 4 seconds minimum, use 6 seconds to be safe)
    if (bIndex < batches.length - 1) {
      console.log('Nghỉ 6 giây để tránh giới hạn tốc độ API (Rate Limit)...');
      await sleep(6000);
    }
  }
  
  return enrichedResults;
}

async function main() {
  if (!fs.existsSync(rawDataFile)) {
    console.error('Error: Raw data file mnn_raw_data.json not found! Run scrape_mnn_data.js first.');
    process.exit(1);
  }
  
  const args = process.argv.slice(2);
  let startLesson = 5;
  let endLesson = 10;
  
  if (args.length === 1) {
    startLesson = parseInt(args[0]);
    endLesson = startLesson;
  } else if (args.length >= 2) {
    startLesson = parseInt(args[0]);
    endLesson = parseInt(args[1]);
  }
  
  console.log(`Cấu hình sinh dữ liệu từ Bài ${startLesson} đến Bài ${endLesson}`);
  
  const rawData = JSON.parse(fs.readFileSync(rawDataFile, 'utf8'));
  let generatedData = {};
  
  if (fs.existsSync(generatedDataFile)) {
    try {
      generatedData = JSON.parse(fs.readFileSync(generatedDataFile, 'utf8'));
    } catch (e) {
      console.warn('Could not parse generated file, starting fresh:', e.message);
    }
  }
  
  let totalTokenSpentEst = 0;
  
  for (let lId = startLesson; lId <= endLesson; lId++) {
    const lessonKey = `lesson_${lId}`;
    const rawWords = rawData[lessonKey];
    
    if (!rawWords) {
      console.warn(`⚠️ Cảnh báo: Không tìm thấy dữ liệu thô cho Bài ${lId} trong mnn_raw_data.json. Bỏ qua.`);
      continue;
    }
    
    // Estimate tokens
    const wordCount = rawWords.length;
    const systemPromptTokens = 800;
    const inputTokensPerWord = 30;
    const outputTokensPerWord = 150;
    const batchesCount = Math.ceil(wordCount / 30);
    const estInput = (batchesCount * systemPromptTokens) + (wordCount * inputTokensPerWord);
    const estOutput = wordCount * outputTokensPerWord;
    totalTokenSpentEst += (estInput + estOutput);
    
    try {
      await processLesson(lId, rawWords, generatedData);
      
      // Pause between lessons to reset API cooldown
      if (lId < endLesson) {
        console.log('\nNghỉ 8 giây trước khi chuyển sang bài tiếp theo...');
        await sleep(8000);
      }
    } catch (err) {
      console.error(`❌ Thất bại khi sinh dữ liệu Bài ${lId}:`, err.message);
      console.log('Dừng tiến trình. Bạn có thể chạy lại để tiếp tục từ điểm dừng.');
      process.exit(1);
    }
  }
  
  console.log(`\n======================================================`);
  console.log(`🎉 HOÀN THÀNH SINH DỮ LIỆU TỪ BÀI ${startLesson} ĐẾN BÀI ${endLesson}!`);
  console.log(`📊 Ước tính tổng lượng token đã tiêu hao: ~${totalTokenSpentEst.toLocaleString()} tokens`);
  console.log(`💾 Kết quả được lưu tại: ${generatedDataFile}`);
  console.log(`======================================================\n`);
}

main().catch(console.error);
