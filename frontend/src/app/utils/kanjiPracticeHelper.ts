// website/frontend/src/app/utils/kanjiPracticeHelper.ts

export interface KanjiItemData {
  id: number;
  lesson_id: number;
  character: string;
  stroke_count?: string;
  onyomi?: string;
  kunyomi?: string;
  sino_vietnamese?: string;
  vietnamese_meaning: string;
  mnemonic_tip?: string;
  compounds?: string;
  status?: 'not_learned' | 'learning' | 'mastered';
}

export type KanjiQuestionType = 
  | 'kanji_to_sino_meaning' // Nhìn Kanji -> Chọn Hán Việt & Nghĩa
  | 'meaning_to_kanji'      // Nhìn Hán Việt & Nghĩa -> Chọn Kanji
  | 'compound_fill'         // Điền Kanji vào từ ghép
  | 'reading_choice';       // Nhìn Kanji -> Chọn cách đọc chuẩn

export interface KanjiPracticeQuestion {
  id: string;
  kanjiId: number;
  character: string;
  type: KanjiQuestionType;
  questionPrompt: string;
  displaySubject: string;
  subInfo?: string;
  options: string[];
  correctAnswer: string;
  sinoVietnamese: string;
  vietnameseMeaning: string;
  onyomi?: string;
  kunyomi?: string;
  compounds?: string;
  mnemonicTip?: string;
}

// Hàm xáo trộn mảng Fisher-Yates
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Bóc tách danh sách từ ghép từ chuỗi compounds
export function parseCompounds(compoundsStr?: string): { word: string; reading: string; meaning: string }[] {
  if (!compoundsStr) return [];
  const results: { word: string; reading: string; meaning: string }[] = [];
  
  // Các từ ghép thường phân cách bởi dấu chấm phẩy ';' hoặc xuống dòng
  const rawParts = compoundsStr.split(/[;\n]/).map(s => s.trim()).filter(Boolean);
  for (const part of rawParts) {
    // Format dạng: "私 (わたし): Tôi" hoặc "日本 (nihon): Nhật Bản" hoặc "日本人: Người Nhật"
    const match = part.match(/^([^\(:\s]+)(?:\s*\(([^)]+)\))?\s*[:：]\s*(.+)$/);
    if (match) {
      results.push({
        word: match[1].trim(),
        reading: match[2]?.trim() || '',
        meaning: match[3]?.trim() || ''
      });
    } else {
      // Fallback format
      const colonSplit = part.split(/[:：]/);
      if (colonSplit.length >= 2) {
        results.push({
          word: colonSplit[0].trim(),
          reading: '',
          meaning: colonSplit.slice(1).join(':').trim()
        });
      }
    }
  }
  return results;
}

export const COMMON_KANJI_DISTRACTORS: KanjiItemData[] = [
  { id: 9001, lesson_id: 0, character: '日', sino_vietnamese: 'NHẬT', vietnamese_meaning: 'Mặt trời, ngày', onyomi: 'ニチ, ジツ', kunyomi: 'ひ, -び, -か' },
  { id: 9002, lesson_id: 0, character: '月', sino_vietnamese: 'NGUYỆT', vietnamese_meaning: 'Mặt trăng, tháng', onyomi: 'ゲツ, ガツ', kunyomi: 'つき' },
  { id: 9003, lesson_id: 0, character: '火', sino_vietnamese: 'HỎA', vietnamese_meaning: 'Lửa', onyomi: 'カ', kunyomi: 'ひ' },
  { id: 9004, lesson_id: 0, character: '水', sino_vietnamese: 'THỦY', vietnamese_meaning: 'Nước', onyomi: 'スイ', kunyomi: 'みず' },
  { id: 9005, lesson_id: 0, character: '木', sino_vietnamese: 'MỘC', vietnamese_meaning: 'Cây, gỗ', onyomi: 'モク, ボク', kunyomi: 'き' },
  { id: 9006, lesson_id: 0, character: '金', sino_vietnamese: 'KIM', vietnamese_meaning: 'Vàng, tiền', onyomi: 'キン', kunyomi: 'かね' },
  { id: 9007, lesson_id: 0, character: '土', sino_vietnamese: 'THỔ', vietnamese_meaning: 'Đất', onyomi: 'ド, ト', kunyomi: 'つち' },
  { id: 9008, lesson_id: 0, character: '山', sino_vietnamese: 'SƠN', vietnamese_meaning: 'Núi', onyomi: 'サン', kunyomi: 'やま' },
  { id: 9009, lesson_id: 0, character: '川', sino_vietnamese: 'XUYÊN', vietnamese_meaning: 'Sông', onyomi: 'セン', kunyomi: 'かわ' },
  { id: 9010, lesson_id: 0, character: '田', sino_vietnamese: 'ĐIỀN', vietnamese_meaning: 'Ruộng', onyomi: 'デン', kunyomi: 'た' },
  { id: 9011, lesson_id: 0, character: '一', sino_vietnamese: 'NHẤT', vietnamese_meaning: 'Một', onyomi: 'イチ', kunyomi: 'ひと-つ' },
  { id: 9012, lesson_id: 0, character: '二', sino_vietnamese: 'NHỊ', vietnamese_meaning: 'Hai', onyomi: 'ニ', kunyomi: 'ふた-つ' },
  { id: 9013, lesson_id: 0, character: '三', sino_vietnamese: 'TAM', vietnamese_meaning: 'Ba', onyomi: 'サン', kunyomi: 'みっ-つ' },
  { id: 9014, lesson_id: 0, character: '四', sino_vietnamese: 'TỨ', vietnamese_meaning: 'Bốn', onyomi: 'シ', kunyomi: 'よっ-つ, よん' },
  { id: 9015, lesson_id: 0, character: '五', sino_vietnamese: 'NGŨ', vietnamese_meaning: 'Năm', onyomi: 'ゴ', kunyomi: 'いつ-つ' },
  { id: 9016, lesson_id: 0, character: '六', sino_vietnamese: 'LỤC', vietnamese_meaning: 'Sáu', onyomi: 'ロク', kunyomi: 'むっ-つ' },
  { id: 9017, lesson_id: 0, character: '七', sino_vietnamese: 'THẤT', vietnamese_meaning: 'Bảy', onyomi: 'シチ', kunyomi: 'なな-つ' },
  { id: 9018, lesson_id: 0, character: '八', sino_vietnamese: 'BÁT', vietnamese_meaning: 'Tám', onyomi: 'ハチ', kunyomi: 'やっ-つ' },
  { id: 9019, lesson_id: 0, character: '九', sino_vietnamese: 'CỬU', vietnamese_meaning: 'Chín', onyomi: 'キュウ, ク', kunyomi: 'ここの-つ' },
  { id: 9020, lesson_id: 0, character: '十', sino_vietnamese: 'THẬP', vietnamese_meaning: 'Mười', onyomi: 'ジュウ', kunyomi: 'とお' },
  { id: 9021, lesson_id: 0, character: '百', sino_vietnamese: 'BÁCH', vietnamese_meaning: 'Trăm', onyomi: 'ヒャク', kunyomi: 'もも' },
  { id: 9022, lesson_id: 0, character: '千', sino_vietnamese: 'THIÊN', vietnamese_meaning: 'Nghìn', onyomi: 'セン', kunyomi: 'ち' },
  { id: 9023, lesson_id: 0, character: '万', sino_vietnamese: 'VẠN', vietnamese_meaning: 'Mười nghìn', onyomi: 'マン, バン', kunyomi: '-' },
  { id: 9024, lesson_id: 0, character: '年', sino_vietnamese: 'NIÊN', vietnamese_meaning: 'Năm, tuổi', onyomi: 'ネン', kunyomi: 'とし' },
  { id: 9025, lesson_id: 0, character: '円', sino_vietnamese: 'VIÊN', vietnamese_meaning: 'Đồng Yên, tròn', onyomi: 'エン', kunyomi: 'まる-い' },
  { id: 9026, lesson_id: 0, character: '学', sino_vietnamese: 'HỌC', vietnamese_meaning: 'Học tập', onyomi: 'ガク', kunyomi: 'まな-ぶ' },
  { id: 9027, lesson_id: 0, character: '生', sino_vietnamese: 'SINH', vietnamese_meaning: 'Sống, sinh ra', onyomi: 'セイ, ショウ', kunyomi: 'い-きる, う-まれる' },
  { id: 9028, lesson_id: 0, character: '先', sino_vietnamese: 'TIÊN', vietnamese_meaning: 'Trước, đi đầu', onyomi: 'セン', kunyomi: 'さき' },
  { id: 9029, lesson_id: 0, character: '会', sino_vietnamese: 'HỘI', vietnamese_meaning: 'Gặp gỡ, hội họp', onyomi: 'カイ', kunyomi: 'あ-う' },
  { id: 9030, lesson_id: 0, character: '社', sino_vietnamese: 'XÃ', vietnamese_meaning: 'Công ty, đền thờ', onyomi: 'シャ', kunyomi: 'やしろ' },
  { id: 9031, lesson_id: 0, character: '校', sino_vietnamese: 'HIỆU', vietnamese_meaning: 'Trường học', onyomi: 'コウ', kunyomi: '-' },
  { id: 9032, lesson_id: 0, character: '本', sino_vietnamese: 'BẢN', vietnamese_meaning: 'Sách, gốc rễ', onyomi: 'ホン', kunyomi: 'もと' },
  { id: 9033, lesson_id: 0, character: '中', sino_vietnamese: 'TRUNG', vietnamese_meaning: 'Ở trong, giữa', onyomi: 'チュウ', kunyomi: 'なか' },
  { id: 9034, lesson_id: 0, character: '大', sino_vietnamese: 'ĐẠI', vietnamese_meaning: 'To lớn', onyomi: 'ダイ, タイ', kunyomi: 'おお-きい' },
  { id: 9035, lesson_id: 0, character: '小', sino_vietnamese: 'TIỂU', vietnamese_meaning: 'Nhỏ bé', onyomi: 'ショウ', kunyomi: 'ちい-さい' },
  { id: 9036, lesson_id: 0, character: '上', sino_vietnamese: 'THƯỢNG', vietnamese_meaning: 'Ở trên', onyomi: 'ジョウ', kunyomi: 'うえ' },
  { id: 9037, lesson_id: 0, character: '下', sino_vietnamese: 'HẠ', vietnamese_meaning: 'Ở dưới', onyomi: 'カ, ゲ', kunyomi: 'した' },
  { id: 9038, lesson_id: 0, character: '左', sino_vietnamese: 'TẢ', vietnamese_meaning: 'Bên trái', onyomi: 'サ', kunyomi: 'ひだり' },
  { id: 9039, lesson_id: 0, character: '右', sino_vietnamese: 'HỮU', vietnamese_meaning: 'Bên phải', onyomi: 'ウ, ユウ', kunyomi: 'みぎ' },
  { id: 9040, lesson_id: 0, character: '前', sino_vietnamese: 'TIỀN', vietnamese_meaning: 'Trước, phía trước', onyomi: 'ゼン', kunyomi: 'まえ' },
  { id: 9041, lesson_id: 0, character: '後', sino_vietnamese: 'HẬU', vietnamese_meaning: 'Sau, phía sau', onyomi: 'ゴ, コウ', kunyomi: 'うし-ろ, あと' },
  { id: 9042, lesson_id: 0, character: '名', sino_vietnamese: 'DANH', vietnamese_meaning: 'Tên, danh tiếng', onyomi: 'メイ, ミョウ', kunyomi: 'な' },
  { id: 9043, lesson_id: 0, character: '車', sino_vietnamese: 'XA', vietnamese_meaning: 'Xe cộ, ô tô', onyomi: 'シャ', kunyomi: 'くるま' },
  { id: 9044, lesson_id: 0, character: '何', sino_vietnamese: 'HÀ', vietnamese_meaning: 'Cái gì', onyomi: 'カ', kunyomi: 'なに, なん' },
  { id: 9045, lesson_id: 0, character: '語', sino_vietnamese: 'NGỮ', vietnamese_meaning: 'Ngôn ngữ, tiếng', onyomi: 'ゴ', kunyomi: 'かた-る' },
  { id: 9046, lesson_id: 0, character: '聞', sino_vietnamese: 'VĂN', vietnamese_meaning: 'Nghe, hỏi', onyomi: 'ブン, モン', kunyomi: 'き-く' },
  { id: 9047, lesson_id: 0, character: '読', sino_vietnamese: 'ĐỘC', vietnamese_meaning: 'Đọc', onyomi: 'ドク', kunyomi: 'よ-む' },
  { id: 9048, lesson_id: 0, character: '書', sino_vietnamese: 'THƯ', vietnamese_meaning: 'Viết, cuốn sách', onyomi: 'ショ', kunyomi: 'か-く' },
  { id: 9049, lesson_id: 0, character: '話', sino_vietnamese: 'THOẠI', vietnamese_meaning: 'Nói chuyện', onyomi: 'ワ', kunyomi: 'はな-す' },
  { id: 9050, lesson_id: 0, character: '買', sino_vietnamese: 'MÃI', vietnamese_meaning: 'Mua', onyomi: 'バイ', kunyomi: 'か-う' },
  { id: 9051, lesson_id: 0, character: '食', sino_vietnamese: 'THỰC', vietnamese_meaning: 'Ăn', onyomi: 'ショク', kunyomi: 'た-べる' },
  { id: 9052, lesson_id: 0, character: '飲', sino_vietnamese: 'ẨM', vietnamese_meaning: 'Uống', onyomi: 'イン', kunyomi: 'の-む' },
  { id: 9053, lesson_id: 0, character: '行', sino_vietnamese: 'HÀNH', vietnamese_meaning: 'Đi', onyomi: 'コウ, ギョウ', kunyomi: 'い-く' },
  { id: 9054, lesson_id: 0, character: '来', sino_vietnamese: 'LAI', vietnamese_meaning: 'Đến', onyomi: 'ライ', kunyomi: 'く-る' },
  { id: 9055, lesson_id: 0, character: '帰', sino_vietnamese: 'QUY', vietnamese_meaning: 'Trở về', onyomi: 'キ', kunyomi: 'かえ-る' },
  { id: 9056, lesson_id: 0, character: '見', sino_vietnamese: 'KIẾN', vietnamese_meaning: 'Nhìn, xem', onyomi: 'ケン', kunyomi: 'み-る' },
  { id: 9057, lesson_id: 0, character: '休', sino_vietnamese: 'HƯU', vietnamese_meaning: 'Nghỉ ngơi', onyomi: 'キュウ', kunyomi: 'やす-む' },
  { id: 9058, lesson_id: 0, character: '友', sino_vietnamese: 'HỮU', vietnamese_meaning: 'Bạn bè', onyomi: 'ユウ', kunyomi: 'とも' },
  { id: 9059, lesson_id: 0, character: '時', sino_vietnamese: 'THỜI', vietnamese_meaning: 'Thời gian, giờ', onyomi: 'ジ', kunyomi: 'とき' },
  { id: 9060, lesson_id: 0, character: '分', sino_vietnamese: 'PHÂN', vietnamese_meaning: 'Phút, chia phần', onyomi: 'フン, ブン', kunyomi: 'わ-かる' }
];

/**
 * Sinh danh sách câu hỏi trắc nghiệm Kanji
 * @param lessonKanji Danh sách Kanji của bài đang học
 * @param allKanjiPool Danh sách toàn bộ Kanji (dùng làm phương án nhiễu nếu bài ít hơn 4 chữ)
 * @param limit Số lượng câu hỏi cần sinh
 * @param enabledTypes Các dạng câu hỏi được kích hoạt
 */
export function generateKanjiPracticeQuestions(
  lessonKanji: KanjiItemData[],
  allKanjiPool: KanjiItemData[] = [],
  limit: number = 10,
  enabledTypes: KanjiQuestionType[] = ['kanji_to_sino_meaning', 'meaning_to_kanji', 'compound_fill']
): KanjiPracticeQuestion[] {
  if (!lessonKanji || lessonKanji.length === 0) return [];

  // Gộp allKanjiPool và COMMON_KANJI_DISTRACTORS để luôn có kho đáp án nhiễu phong phú
  const pool = [...lessonKanji, ...allKanjiPool, ...COMMON_KANJI_DISTRACTORS];
  const questions: KanjiPracticeQuestion[] = [];
  const shuffledItems = shuffleArray(lessonKanji);

  let itemIdx = 0;
  let attempts = 0;
  const maxAttempts = limit * 4;

  while (questions.length < limit && attempts < maxAttempts) {
    attempts++;
    const current = shuffledItems[itemIdx % shuffledItems.length];
    itemIdx++;

    // Chọn ngẫu nhiên 1 dạng câu hỏi trong danh sách enabledTypes
    const availableTypes = [...enabledTypes];
    
    // Nếu chữ không có compounds thì loại bỏ dạng compound_fill cho chữ này
    const compounds = parseCompounds(current.compounds);
    const validCompounds = compounds.filter(c => c.word.includes(current.character));
    if (validCompounds.length === 0) {
      const fillIdx = availableTypes.indexOf('compound_fill');
      if (fillIdx !== -1) availableTypes.splice(fillIdx, 1);
    }

    if (availableTypes.length === 0) continue;
    const chosenType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    if (chosenType === 'kanji_to_sino_meaning') {
      const correct = `${current.sino_vietnamese || ''} • ${current.vietnamese_meaning}`.trim().replace(/^•\s*/, '');
      // Lấy 3 đáp án sai từ pool
      const otherItems = pool.filter(k => k.id !== current.id && k.character !== current.character);
      const shuffledOthers = shuffleArray(otherItems);
      const wrongOptions = shuffledOthers.slice(0, 3).map(k => `${k.sino_vietnamese || ''} • ${k.vietnamese_meaning}`.trim().replace(/^•\s*/, ''));
      
      if (wrongOptions.length < 3) continue;

      const options = shuffleArray([correct, ...wrongOptions]);
      questions.push({
        id: `q_${current.id}_k2sm_${attempts}`,
        kanjiId: current.id,
        character: current.character,
        type: 'kanji_to_sino_meaning',
        questionPrompt: 'Chọn Âm Hán Việt và Ý nghĩa đúng của chữ Hán sau:',
        displaySubject: current.character,
        subInfo: current.stroke_count ? `Số nét: ${current.stroke_count}` : undefined,
        options,
        correctAnswer: correct,
        sinoVietnamese: current.sino_vietnamese || '',
        vietnameseMeaning: current.vietnamese_meaning,
        onyomi: current.onyomi,
        kunyomi: current.kunyomi,
        compounds: current.compounds,
        mnemonicTip: current.mnemonic_tip
      });

    } else if (chosenType === 'meaning_to_kanji') {
      const correct = current.character;
      const otherItems = pool.filter(k => k.id !== current.id && k.character !== current.character);
      const shuffledOthers = shuffleArray(otherItems);
      const wrongOptions = shuffledOthers.slice(0, 3).map(k => k.character);

      if (wrongOptions.length < 3) continue;

      const options = shuffleArray([correct, ...wrongOptions]);
      const subjectText = `${current.sino_vietnamese ? current.sino_vietnamese + ' • ' : ''}${current.vietnamese_meaning}`;

      questions.push({
        id: `q_${current.id}_m2k_${attempts}`,
        kanjiId: current.id,
        character: current.character,
        type: 'meaning_to_kanji',
        questionPrompt: 'Chọn chữ Hán (Kanji) tương ứng với nghĩa và Hán Việt:',
        displaySubject: subjectText,
        options,
        correctAnswer: correct,
        sinoVietnamese: current.sino_vietnamese || '',
        vietnameseMeaning: current.vietnamese_meaning,
        onyomi: current.onyomi,
        kunyomi: current.kunyomi,
        compounds: current.compounds,
        mnemonicTip: current.mnemonic_tip
      });

    } else if (chosenType === 'compound_fill') {
      const targetCompound = validCompounds[Math.floor(Math.random() * validCompounds.length)];
      // Thay thế chữ Kanji trong từ ghép bằng '___'
      const maskedWord = targetCompound.word.replace(current.character, '【 ? 】');
      const subInfoText = targetCompound.reading 
        ? `Cách đọc: ${targetCompound.reading} • Ý nghĩa: ${targetCompound.meaning}`
        : `Ý nghĩa: ${targetCompound.meaning}`;

      const correct = current.character;
      const otherItems = pool.filter(k => k.id !== current.id && k.character !== current.character);
      const shuffledOthers = shuffleArray(otherItems);
      const wrongOptions = shuffledOthers.slice(0, 3).map(k => k.character);

      if (wrongOptions.length < 3) continue;

      const options = shuffleArray([correct, ...wrongOptions]);

      questions.push({
        id: `q_${current.id}_cfill_${attempts}`,
        kanjiId: current.id,
        character: current.character,
        type: 'compound_fill',
        questionPrompt: 'Điền chữ Hán thích hợp vào vị trí còn thiếu trong từ ghép:',
        displaySubject: maskedWord,
        subInfo: subInfoText,
        options,
        correctAnswer: correct,
        sinoVietnamese: current.sino_vietnamese || '',
        vietnameseMeaning: current.vietnamese_meaning,
        onyomi: current.onyomi,
        kunyomi: current.kunyomi,
        compounds: current.compounds,
        mnemonicTip: current.mnemonic_tip
      });
    }
  }

  return questions.slice(0, limit);
}

/**
 * Chuẩn hóa chuỗi so khớp tự luận
 */
export function normalizeAnswerText(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()？?！!，、。：；]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Chấm điểm tự luận Kanji
 * Học viên có thể nhập:
 * 1. Âm Hán Việt (ví dụ: "TƯ", "tu", "nhân")
 * 2. Ý nghĩa tiếng Việt (ví dụ: "tôi", "riêng tư", "người")
 * 3. Cách đọc Hiragana / Romaji (ví dụ: "watashi", "わたし", "hito")
 */
export function gradeKanjiWritten(
  userInput: string,
  kanji: KanjiItemData
): {
  isCorrect: boolean;
  score: number;
  matchedType: 'sino' | 'meaning' | 'reading' | null;
  feedback: string;
} {
  const rawInput = normalizeAnswerText(userInput);
  if (!rawInput) {
    return {
      isCorrect: false,
      score: 0,
      matchedType: null,
      feedback: 'Vui lòng nhập câu trả lời của bạn.'
    };
  }

  // 1. Kiểm tra khớp Âm Hán Việt
  if (kanji.sino_vietnamese) {
    const sinoNorm = normalizeAnswerText(kanji.sino_vietnamese);
    if (rawInput === sinoNorm || rawInput.includes(sinoNorm) || sinoNorm.includes(rawInput)) {
      return {
        isCorrect: true,
        score: 100,
        matchedType: 'sino',
        feedback: `Chính xác! Bạn đã ghi nhớ đúng âm Hán Việt: ${kanji.sino_vietnamese}.`
      };
    }
  }

  // 2. Kiểm tra khớp Nghĩa tiếng Việt
  if (kanji.vietnamese_meaning) {
    const meaningNorm = normalizeAnswerText(kanji.vietnamese_meaning);
    const meaningParts = meaningNorm.split(/[ ,;/]/).map(s => s.trim()).filter(s => s.length > 1);
    
    // Nếu trùng trực tiếp toàn bộ chuỗi nghĩa
    if (rawInput === meaningNorm || meaningNorm.includes(rawInput)) {
      return {
        isCorrect: true,
        score: 100,
        matchedType: 'meaning',
        feedback: `Rất tốt! Bạn đã nêu đúng nghĩa: ${kanji.vietnamese_meaning}.`
      };
    }

    // Nếu trùng một trong các nét nghĩa chính
    for (const part of meaningParts) {
      if (rawInput === part || rawInput.includes(part)) {
        return {
          isCorrect: true,
          score: 100,
          matchedType: 'meaning',
          feedback: `Chính xác! Nghĩa đầy đủ của chữ là: ${kanji.vietnamese_meaning}.`
        };
      }
    }
  }

  // 3. Kiểm tra khớp Cách đọc (Onyomi / Kunyomi / Romaji)
  const readings: string[] = [];
  if (kanji.kunyomi && kanji.kunyomi !== '-') {
    readings.push(kanji.kunyomi);
  }
  if (kanji.onyomi && kanji.onyomi !== '-') {
    readings.push(kanji.onyomi);
  }

  for (const r of readings) {
    const rNorm = normalizeAnswerText(r);
    // Bóc tách cả Romaji trong ngoặc đơn nếu có
    const parts = rNorm.split(/[\(\)]/).map(s => s.trim()).filter(Boolean);
    for (const p of parts) {
      if (rawInput === p || (p.length >= 2 && (rawInput.includes(p) || p.includes(rawInput)))) {
        return {
          isCorrect: true,
          score: 100,
          matchedType: 'reading',
          feedback: `Tuyệt vời! Bạn nhớ chính xác cách đọc: ${r}.`
        };
      }
    }
  }

  return {
    isCorrect: false,
    score: 0,
    matchedType: null,
    feedback: `Chưa chính xác. Đáp án chuẩn: Hán Việt: ${kanji.sino_vietnamese || '-'} | Nghĩa: ${kanji.vietnamese_meaning}.`
  };
}

export interface KanjiWritingRiddle {
  target_character: string;
  sino_vietnamese: string;
  meaning: string;
  stroke_count: number;
  question_type?: 'sino_meaning' | 'vocab_context' | 'compound_fill' | 'situational';
  riddle_question: string;
  hint: string;
  radicals_hint?: string;
}

export interface KanjiGradingResult {
  score: number;
  is_correct: boolean;
  status: 'excellent' | 'acceptable' | 'needs_improvement' | 'incorrect';
  status_label: string;
  feedback: string;
  improvement_tip: string;
  detected_character?: string;
  isAIGraded?: boolean;
}

/**
 * Sinh câu đố đặc trưng cục bộ (Local Fallback) theo 4 dạng thực chiến đa dạng, TUYỆT ĐỐI không mớm bộ thủ
 */
export function generateLocalKanjiRiddles(
  kanjis: KanjiItemData[],
  vocabList: any[] = []
): KanjiWritingRiddle[] {
  return kanjis.map((k, idx) => {
    const sino = k.sino_vietnamese || '';
    const meaning = k.vietnamese_meaning || '';
    const strokes = parseInt(k.stroke_count || '0', 10) || 4;
    const mode = idx % 4;

    // Tìm từ ghép hoặc từ vựng trong bài chứa chữ này
    const parsedCompounds = parseCompounds(k.compounds);
    const validCompound = parsedCompounds.find(c => c.word && c.word.includes(k.character));
    
    // Tìm từ vựng trong bài
    const relatedVocab = vocabList.find(v => v && v.hiragana && (v.kanji || '').includes(k.character));

    let question = '';
    let question_type: 'sino_meaning' | 'vocab_context' | 'compound_fill' | 'situational' = 'sino_meaning';

    if (mode === 1 && relatedVocab) {
      question_type = 'vocab_context';
      question = `Từ vựng "${relatedVocab.hiragana}" trong bài mang ý nghĩa "${relatedVocab.vietnamese_meaning || meaning}". Hãy viết chữ Hán của từ vựng này!`;
    } else if (mode === 2 && validCompound) {
      question_type = 'compound_fill';
      const masked = validCompound.word.replace(k.character, '【 ? 】');
      question = `Điền chữ Hán còn thiếu vào từ ghép: ${masked} (Cách đọc: ${validCompound.reading || 'chuẩn'}, Nghĩa: ${validCompound.meaning}).`;
    } else if (mode === 3) {
      question_type = 'situational';
      question = `Khái niệm hoặc đối tượng mang ý nghĩa "${meaning}" (Âm Hán Việt: ${sino}). Hãy nhớ lại cấu trúc nét và viết chữ Hán này.`;
    } else {
      question_type = 'sino_meaning';
      question = `Hãy viết chữ Hán có âm Hán Việt là "${sino}", biểu thị ý nghĩa cốt lõi: "${meaning}".`;
    }

    return {
      target_character: k.character,
      sino_vietnamese: sino,
      meaning: meaning,
      stroke_count: strokes,
      question_type,
      riddle_question: question,
      hint: `Gồm ${strokes} nét vẽ • Âm Hán: ${sino}`,
      radicals_hint: `Ý nghĩa cốt lõi: ${meaning}`
    };
  });
}

/**
 * Gọi API backend lấy bộ câu đố AI ra đề (kèm cache vĩnh viễn), fallback sang local nếu lỗi
 */
export async function fetchKanjiWritingRiddles(
  lessonId: number,
  kanjis: KanjiItemData[],
  forceRefresh: boolean = false,
  vocabItems: any[] = []
): Promise<KanjiWritingRiddle[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, 800));
      }
      const res = await fetch('/api/ai/kanji-writing-riddles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, kanjis, vocabItems, forceRefresh })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.riddles) && data.riddles.length > 0) {
          return data.riddles;
        }
      }
    } catch (e) {
      console.warn(`[fetchKanjiWritingRiddles] Attempt ${attempt + 1} failed:`, e);
    }
  }
  return generateLocalKanjiRiddles(kanjis, vocabItems);
}

export interface KanjiRecognitionQuizQuestion {
  id: string;
  question_type: 'dialogue_fill' | 'reading_in_context' | 'kanji_orthography' | 'word_formation' | 'meaning_choice';
  question_text: string;
  context_sentence?: string;
  question_translation?: string;
  target_kanji: string;
  target_word: string;
  target_word_reading?: string;
  target_word_meaning?: string;
  target_word_hint?: string;
  options: string[];
  options_meanings?: string[];
  options_analysis?: string[];
  correct_index: number;
  explanation: string;
}

/**
 * Sinh bộ câu hỏi trắc nghiệm nhận diện chữ Hán cục bộ (Local Fallback)
 * TUYỆT ĐỐI KHÔNG dùng Kanji chưa học trong đề bài mẫu và các lựa chọn
 */
export function generateLocalKanjiRecognitionQuestions(
  kanjis: KanjiItemData[],
  vocabItems: any[] = []
): KanjiRecognitionQuizQuestion[] {
  if (!kanjis || kanjis.length === 0) return [];
  const questions: KanjiRecognitionQuizQuestion[] = [];
  const isSmallScope = kanjis.length <= 4;
  const targetCount = isSmallScope ? Math.min(8, Math.max(5, kanjis.length * 2)) : Math.min(14, Math.max(8, kanjis.length + 2));
  const allowedSet = new Set(kanjis.map(k => k.character));

  // Extract compounds and vocab forms - CHỈ LẤY từ ghép mà 100% chữ Hán cấu thành đều đã học!
  const allCompoundWords: { word: string; reading: string; meaning: string; kanjiChar: string }[] = [];
  kanjis.forEach(k => {
    const parsed = parseCompounds(k.compounds);
    parsed.forEach(p => {
      const chars = p.word.split('');
      const allCharsLearned = chars.every(c => !/[\u4E00-\u9FAF\u3400-\u4DBF]/.test(c) || allowedSet.has(c));
      if (allCharsLearned) {
        allCompoundWords.push({ ...p, kanjiChar: k.character });
      }
    });
  });

  const meaningMap = new Map<string, string>();
  vocabItems.forEach(v => {
    if (v?.kanji) meaningMap.set(v.kanji, v.vietnamese_meaning || '');
    if (v?.hiragana) meaningMap.set(v.hiragana, v.vietnamese_meaning || '');
  });
  kanjis.forEach(k => {
    if (!meaningMap.has(k.character)) meaningMap.set(k.character, k.vietnamese_meaning || '');
    const parsed = parseCompounds(k.compounds);
    parsed.forEach(p => {
      if (p.word && p.meaning && !meaningMap.has(p.word)) meaningMap.set(p.word, p.meaning);
    });
  });
  const getMeaning = (w: string) => meaningMap.get(w) || '';

  const lessonVocabMatches: { hiragana: string; meaning: string; example?: string; kanjiWord?: string; char: string }[] = [];
  kanjis.forEach(k => {
    vocabItems.forEach(v => {
      if (v && v.hiragana && ((v.kanji || '').includes(k.character) || (v.japanese_example || '').includes(k.character))) {
        lessonVocabMatches.push({
          hiragana: v.hiragana,
          meaning: v.vietnamese_meaning || '',
          example: v.japanese_example || '',
          kanjiWord: v.kanji || '',
          char: k.character
        });
      }
    });
  });

  let index = 0;
  while (questions.length < targetCount && index < targetCount * 3) {
    const k = kanjis[index % kanjis.length];
    const mode = (index + questions.length) % 4;
    index++;

    if (mode === 0) {
      const match = lessonVocabMatches.find(m => m.char === k.character && m.example) ||
                    lessonVocabMatches.find(m => m.example);
      const compound = allCompoundWords.find(c => c.kanjiChar === k.character);
      const targetWord = match?.kanjiWord || compound?.word || k.character;
      const reading = match?.hiragana || compound?.reading || k.kunyomi || k.onyomi || '';
      const meaning = match?.meaning || compound?.meaning || k.vietnamese_meaning;
      
      let sentence = match?.example || `「わたしは 【 ? 】 です。」`;
      if (match?.example && targetWord && sentence.includes(targetWord)) {
        sentence = sentence.replace(targetWord, '【 ? 】');
      } else if (!sentence.includes('【 ? 】')) {
        sentence = `「あのかたは 【 ? 】 です。」`;
      }

      const isCompoundTarget = targetWord.length >= 2;
      const candidateWrong = allCompoundWords
        .filter(c => c.word !== targetWord)
        .map(c => c.word)
        .concat(
          !isCompoundTarget 
            ? kanjis.filter(other => other.character !== k.character).map(o => o.character)
            : []
        );

      const wrongWords = shuffleArray(candidateWrong).filter(w => w !== targetWord).slice(0, 3);
      while (wrongWords.length < 3) {
        const otherK = kanjis.find(o => o.character !== k.character)?.character || k.character;
        const candidate = `${k.character}${otherK}`;
        if (!wrongWords.includes(candidate) && candidate !== targetWord) {
          wrongWords.push(candidate);
        } else {
          wrongWords.push(`${otherK}${k.character}`);
        }
      }

      const options = shuffleArray([targetWord, ...wrongWords.slice(0, 3)]);
      const correctIdx = options.indexOf(targetWord);
      const optionsMeanings = options.map(opt => getMeaning(opt) || (opt === targetWord ? meaning : ''));

      const sentenceTranslation = sentence.includes('わたしは')
        ? '「Tôi là 【 ? 】.」'
        : sentence.includes('あのかたは')
        ? '「Người kia là 【 ? 】.」'
        : `「${sentence.replace('【 ? 】', '...')}」`;

      questions.push({
        id: `local_q_${k.id}_dial_${index}`,
        question_type: 'dialogue_fill',
        question_text: sentence,
        context_sentence: sentence,
        question_translation: `${sentenceTranslation}\nChọn từ thích hợp điền vào chỗ trống 【 ? 】.`,
        target_kanji: k.character,
        target_word: targetWord,
        target_word_reading: reading,
        target_word_meaning: meaning,
        target_word_hint: meaning,
        options,
        options_meanings: optionsMeanings,
        correct_index: correctIdx,
        explanation: `【Dịch nghĩa hoàn chỉnh】: "${sentence.replace('【 ? 】', targetWord)}"\n【Lý do chọn】: Từ phù hợp nhất để điền vào ngữ cảnh là "${targetWord}" (${reading}: ${meaning}).\n【Phân tích Chữ Hán】: Chữ Hán mục tiêu 【${k.character}】 (Hán Việt: ${k.sino_vietnamese || ''} - Nghĩa: ${k.vietnamese_meaning}).`
      });
    } else if (mode === 1) {
      const compound = allCompoundWords.find(c => c.kanjiChar === k.character);
      const targetChar = k.character;
      const correctReading = compound?.reading || k.kunyomi || k.onyomi || '';
      const cleanReading = correctReading.split(/[\s,()（）]/)[0] || correctReading || 'ひと';

      const promptSentence = compound?.word 
        ? `「${compound.word}」の 【${targetChar}】の よみかたは どれですか。`
        : `「${targetChar}」の ただしい よみかたは どれですか。`;

      const otherReadings = kanjis
        .filter(o => o.character !== targetChar)
        .map(o => (o.kunyomi || o.onyomi || '').split(/[\s,()（）]/)[0])
        .filter(r => r && r !== cleanReading);

      const fallbackReadings = ['じん', 'ひと', 'せい', 'せん', 'がく', 'かい', 'しゃ', 'ほん', 'にち'];
      const wrongReadings = shuffleArray([...otherReadings, ...fallbackReadings.filter(r => r !== cleanReading)]).slice(0, 3);

      const options = shuffleArray([cleanReading, ...wrongReadings]);
      const correctIdx = options.indexOf(cleanReading);
      const targetHint = compound?.meaning || k.vietnamese_meaning;

      const qTranslation = compound?.word
        ? `Cách đọc của chữ Hán 【${targetChar}】 trong từ「${compound.word}」là gì?`
        : `Cách đọc Hiragana đúng của chữ Hán 【${targetChar}】 là gì?`;

      questions.push({
        id: `local_q_${k.id}_read_${index}`,
        question_type: 'reading_in_context',
        question_text: promptSentence,
        context_sentence: compound?.word || targetChar,
        question_translation: qTranslation,
        target_kanji: targetChar,
        target_word: compound?.word || targetChar,
        target_word_reading: cleanReading,
        target_word_meaning: targetHint,
        target_word_hint: targetHint,
        options,
        options_meanings: options.map(opt => `Âm đọc: ${opt}`),
        correct_index: correctIdx,
        explanation: `【Dịch nghĩa câu hỏi】: ${qTranslation}\n【Đáp án chính xác】: "${cleanReading}"\n【Giải thích chi tiết】: Chữ Hán 【${targetChar}】 (Hán Việt: ${k.sino_vietnamese || ''} - Nghĩa: ${k.vietnamese_meaning}) trong ngữ cảnh này được đọc là "${cleanReading}". Từ đầy đủ: "${compound?.word || targetChar}" (${cleanReading}: ${targetHint}).`
      });
    } else if (mode === 2) {
      const compound = allCompoundWords.find(c => c.kanjiChar === k.character);
      const match = lessonVocabMatches.find(m => m.char === k.character);
      const targetKanjiWord = compound?.word || match?.kanjiWord || k.character;
      const targetKana = compound?.reading || match?.hiragana || k.kunyomi || '';
      const meaning = compound?.meaning || match?.meaning || k.vietnamese_meaning;

      const wrongOptions = shuffleArray(
        allCompoundWords.filter(c => c.word !== targetKanjiWord).map(c => c.word)
          .concat(kanjis.filter(o => o.character !== k.character).map(o => o.character))
          .concat(targetKanjiWord.length === 2 ? [targetKanjiWord.split('').reverse().join('')] : [])
      ).filter(w => w !== targetKanjiWord).slice(0, 3);

      while (wrongOptions.length < 3) {
        const otherK = kanjis.find(o => o.character !== k.character)?.character || k.character;
        wrongOptions.push(`${otherK}${k.character}`, `${k.character}${otherK}`);
      }

      const options = shuffleArray([targetKanjiWord, ...wrongOptions.slice(0, 3)]);
      const correctIdx = options.indexOf(targetKanjiWord);
      const optionsMeanings = options.map(opt => getMeaning(opt) || (opt === targetKanjiWord ? meaning : ''));

      questions.push({
        id: `local_q_${k.id}_orth_${index}`,
        question_type: 'kanji_orthography',
        question_text: `「${targetKana || targetKanjiWord}」の ただしい かんじは どれですか。`,
        context_sentence: `「${targetKana || targetKanjiWord}」`,
        question_translation: `Chữ Hán chuẩn của từ「${targetKana || targetKanjiWord}」là chữ nào?`,
        target_kanji: k.character,
        target_word: targetKanjiWord,
        target_word_reading: targetKana,
        target_word_meaning: meaning,
        target_word_hint: meaning,
        options,
        options_meanings: optionsMeanings,
        correct_index: correctIdx,
        explanation: `【Dịch nghĩa câu hỏi】: Chữ Hán chuẩn của từ「${targetKana || targetKanjiWord}」là chữ nào?\n【Đáp án chính xác】:「${targetKanjiWord}」\n【Giải thích chi tiết】: Từ「${targetKana || targetKanjiWord}」(Nghĩa: ${meaning}) được viết bằng chữ Hán chuẩn là「${targetKanjiWord}」. Chữ Hán mục tiêu: 【${k.character}】 (Hán Việt: ${k.sino_vietnamese || ''}).`
      });
    } else {
      // Dạng 4: Điền khuyết hoàn thiện từ ghép (Jukugo Completion)
      const compound = allCompoundWords.find(c => c.kanjiChar === k.character && c.word.length >= 2)
        || allCompoundWords.find(c => c.word.includes(k.character) && c.word.length >= 2);
      
      let word = compound?.word || '';
      let reading = compound?.reading || '';
      let meaning = compound?.meaning || k.vietnamese_meaning;

      // If no compound with >= 2 chars, look in lessonVocabMatches
      if (!word) {
        const vMatch = lessonVocabMatches.find(m => m.kanjiWord && m.kanjiWord.length >= 2 && m.kanjiWord.includes(k.character));
        if (vMatch) {
          word = vMatch.kanjiWord!;
          reading = vMatch.hiragana;
          meaning = vMatch.meaning;
        }
      }

      // If still no compound, fallback to pairing targetChar with another learned kanji
      const otherK = kanjis.find(o => o.character !== k.character)?.character || '人';
      if (!word) {
        word = `${k.character}${otherK}`;
        reading = `${k.kunyomi || k.character}${otherK}`;
      }

      // Mask one of the Kanji characters
      const chars = word.split('');
      const targetChar = k.character;
      const maskIdx = chars.includes(targetChar) ? chars.indexOf(targetChar) : 0;
      const correctChar = chars[maskIdx];

      // Build formula: 「学」＋【 ? 】＝ がくせい (Học sinh)
      const formulaParts = chars.map((ch, idx) => (idx === maskIdx ? '【 ? 】' : `「${ch}」`));
      const questionText = `${formulaParts.join('＋')}＝ ${reading ? reading + ' ' : ''}(${meaning})`;

      const otherKanjis = shuffleArray(
        kanjis.filter(o => o.character !== correctChar).map(o => o.character)
          .concat(COMMON_KANJI_DISTRACTORS.filter(d => d.character !== correctChar).map(d => d.character))
      ).slice(0, 3);

      const options = shuffleArray([correctChar, ...otherKanjis]);
      const correctIdx = options.indexOf(correctChar);

      const getKanjiMeaning = (char: string) => {
        const foundK = kanjis.find(item => item.character === char)
          || COMMON_KANJI_DISTRACTORS.find(d => d.character === char);
        if (foundK) {
          return `${foundK.sino_vietnamese ? foundK.sino_vietnamese + ': ' : ''}${foundK.vietnamese_meaning}`.trim();
        }
        return getMeaning(char) || '';
      };

      const optionsMeanings = options.map(opt => getKanjiMeaning(opt));

      questions.push({
        id: `local_q_${k.id}_form_${index}`,
        question_type: 'word_formation',
        question_text: questionText,
        context_sentence: questionText,
        question_translation: `Chọn chữ Hán thích hợp điền vào 【 ? 】 để hoàn thiện từ ghép "${meaning}"${reading ? ' (' + reading + ')' : ''}.`,
        target_kanji: correctChar,
        target_word: correctChar,
        target_word_reading: reading,
        target_word_meaning: meaning,
        target_word_hint: meaning,
        options,
        options_meanings: optionsMeanings,
        correct_index: correctIdx,
        explanation: `【Dịch nghĩa câu hỏi】: Chọn chữ Hán thích hợp điền vào 【 ? 】 để hoàn thiện từ ghép "${meaning}" (${reading}).\n【Đáp án chính xác】:「${correctChar}」\n【Giải thích chi tiết】: Chữ Hán「${correctChar}」khi điền vào vị trí 【 ? 】 sẽ tạo thành từ vựng hoàn chỉnh「${word}」(${reading}: ${meaning}).`
      });
    }
  }

  return questions.slice(0, targetCount);
}

/**
 * Gọi API backend lấy bộ câu hỏi nhận diện AI (kèm cache vĩnh viễn), fallback sang local nếu lỗi
 */
export async function fetchKanjiRecognitionQuestions(
  lessonId: number,
  kanjis: KanjiItemData[],
  forceRefresh: boolean = false,
  vocabItems: any[] = []
): Promise<KanjiRecognitionQuizQuestion[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, 800));
      }
      const res = await fetch('/api/ai/kanji-recognition-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, kanjis, vocabItems, forceRefresh })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
          return data.questions;
        }
      }
    } catch (e) {
      console.warn(`[fetchKanjiRecognitionQuestions] Attempt ${attempt + 1} failed:`, e);
    }
  }
  return generateLocalKanjiRecognitionQuestions(kanjis, vocabItems);
}


/**
 * Thuật toán chấm điểm hình học Canvas cục bộ (Fallback) + sinh hướng dẫn hoàn thiện ngắn gọn
 */
export function evaluateKanjiDrawingLocally(
  canvas: HTMLCanvasElement,
  targetChar: string,
  strokeCount?: number
): KanjiGradingResult {
  const offscreen = document.createElement('canvas');
  offscreen.width = canvas.width;
  offscreen.height = canvas.height;
  const oCtx = offscreen.getContext('2d');
  if (!oCtx) {
    return {
      score: 50,
      is_correct: false,
      status: 'needs_improvement',
      status_label: 'Cần rèn thêm',
      feedback: 'Không thể phân tích hình ảnh Canvas.',
      improvement_tip: 'Hãy vẽ lại chữ vào chính giữa ô chữ điền.'
    };
  }

  oCtx.fillStyle = '#090d1f';
  oCtx.fillRect(0, 0, offscreen.width, offscreen.height);
  oCtx.fillStyle = '#2dd4bf';
  oCtx.font = '900 150px "Noto Sans JP", sans-serif';
  oCtx.textAlign = 'center';
  oCtx.textBaseline = 'middle';
  oCtx.fillText(targetChar, offscreen.width / 2, offscreen.height / 2 + 5);

  const userCtx = canvas.getContext('2d');
  if (!userCtx) {
    return {
      score: 0,
      is_correct: false,
      status: 'incorrect',
      status_label: 'Không đạt',
      feedback: 'Chưa có nét vẽ nào.',
      improvement_tip: 'Hãy đặt bút và vẽ chữ vào giữa ô chữ điền.'
    };
  }

  const uImg = userCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const tImg = oCtx.getImageData(0, 0, offscreen.width, offscreen.height).data;

  const W = 40;
  const H = 40;
  const stepX = canvas.width / W;
  const stepY = canvas.height / H;

  let overlap = 0;
  let targetFilled = 0;
  let userFilled = 0;
  let sumUserX = 0;
  let sumUserY = 0;

  for (let gy = 0; gy < H; gy++) {
    for (let gx = 0; gx < W; gx++) {
      const px = Math.floor(gx * stepX);
      const py = Math.floor(gy * stepY);
      const idx = (py * canvas.width + px) * 4;

      const tR = tImg[idx];
      const tG = tImg[idx + 1];
      const isT = (tG > 100 && tR < 100);

      const uG = uImg[idx + 1];
      const uB = uImg[idx + 2];
      const isU = (uG > 150 && uB > 150);

      if (isT) targetFilled++;
      if (isU) {
        userFilled++;
        sumUserX += gx;
        sumUserY += gy;
      }
      if (isT && isU) overlap++;
    }
  }

  if (userFilled < 10) {
    return {
      score: 0,
      is_correct: false,
      status: 'incorrect',
      status_label: 'Chưa đủ nét',
      feedback: 'Nét vẽ quá ít hoặc chưa vẽ hoàn chỉnh chữ.',
      improvement_tip: `Chữ "${targetChar}" có ${strokeCount || 'nhiều'} nét, bạn đang vẽ thiếu nét; hãy vẽ đủ các nét cơ bản.`
    };
  }

  const precision = userFilled > 0 ? overlap / userFilled : 0;
  const recall = targetFilled > 0 ? overlap / targetFilled : 0;
  const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  const finalScore = Math.min(100, Math.max(0, Math.round(f1 * 135)));
  const isCorrect = finalScore >= 60;
  const status: 'excellent' | 'acceptable' | 'needs_improvement' | 'incorrect' =
    finalScore >= 85 ? 'excellent' : finalScore >= 60 ? 'acceptable' : finalScore >= 35 ? 'needs_improvement' : 'incorrect';
  const status_label = finalScore >= 85 ? 'Xuất sắc' : finalScore >= 60 ? 'Đạt chuẩn' : finalScore >= 35 ? 'Cần rèn thêm' : 'Chưa đúng';
  
  let improvement_tip = '';
  const avgUserX = userFilled > 0 ? sumUserX / userFilled : 20;
  const avgUserY = userFilled > 0 ? sumUserY / userFilled : 20;
  const isOffCenter = Math.abs(avgUserX - 20) > 4 || Math.abs(avgUserY - 20) > 4;

  if (finalScore >= 85) {
    improvement_tip = 'Nét vẽ rất chuẩn mực và cân đối! Chú ý thêm nét móc dứt khoát ở điểm dừng bút.';
  } else if (recall < 0.45) {
    improvement_tip = `Chữ này có ${strokeCount || 'nhiều'} nét, bạn đang thiếu nét hoặc nét quá mảnh; hãy vẽ đủ nét và đậm tay hơn.`;
  } else if (precision < 0.40) {
    improvement_tip = 'Nét vẽ bị tràn ra ngoài form mẫu; hãy giữ nét gọn trong các ô của ô chữ điền.';
  } else if (isOffCenter) {
    improvement_tip = 'Cần căn chỉnh chữ vào chính giữa tâm ô chữ điền (giao điểm 2 đường nét đứt).';
  } else if (userFilled < targetFilled * 0.6) {
    improvement_tip = 'Hãy vẽ chữ to hơn (chiếm khoảng 70-80% ô vuông) để nét chữ không bị dính vào nhau.';
  } else {
    improvement_tip = 'Hãy bật nét mờ để đồ theo chữ mẫu thêm 1 lần giúp quen tay hơn nhé.';
  }

  const feedback = finalScore >= 85
    ? 'Tuyệt vời! Dáng nét chữ Kanji rất chuẩn và cân đối.'
    : finalScore >= 60
    ? 'Đạt yêu cầu! Các nét chữ đã vào đúng vị trí của chữ mẫu.'
    : 'Nét chữ còn chệch khỏi chữ mẫu. Hãy xem lại hướng dẫn bên dưới nhé.';

  return {
    score: finalScore,
    is_correct: isCorrect,
    status,
    status_label,
    feedback,
    improvement_tip,
    isAIGraded: false
  };
}

/**
 * Chấm điểm nét vẽ chữ Hán bằng Gemini Multimodal Vision AI
 * Tự động fallback về thuật toán hình học nếu offline / mất mạng
 */
export async function gradeKanjiWithAI({
  canvas,
  targetKanji,
  strokeCount,
  sinoVietnamese = '',
  meaning = '',
  radicals = []
}: {
  canvas: HTMLCanvasElement;
  targetKanji: string;
  strokeCount?: number;
  sinoVietnamese?: string;
  meaning?: string;
  radicals?: any;
}): Promise<KanjiGradingResult> {
  const imageBase64 = canvas.toDataURL('image/png');

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, 800));
      }
      const res = await fetch('/api/ai/grade-kanji-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          targetKanji,
          strokeCount,
          sinoVietnamese,
          meaning,
          radicals
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.result) {
          const r = data.result;
          return {
            score: typeof r.score === 'number' ? r.score : 70,
            is_correct: Boolean(r.is_correct ?? (r.score >= 60)),
            status: r.status || (r.score >= 85 ? 'excellent' : r.score >= 60 ? 'acceptable' : 'needs_improvement'),
            status_label: r.status_label || (r.score >= 85 ? 'Xuất sắc' : r.score >= 60 ? 'Đạt chuẩn' : 'Cần rèn thêm'),
            feedback: r.feedback || 'AI đã phân tích nét vẽ của bạn.',
            improvement_tip: r.improvement_tip || 'Hãy căn chỉnh các nét vào đúng vị trí ô chữ điền.',
            detected_character: r.detected_character,
            isAIGraded: true
          };
        }
      }
    } catch (e) {
      console.warn(`[gradeKanjiWithAI] Attempt ${attempt + 1} failed:`, e);
    }
  }

  // Graceful Fallback to Local Geometric Grading
  return evaluateKanjiDrawingLocally(canvas, targetKanji, strokeCount);
}

