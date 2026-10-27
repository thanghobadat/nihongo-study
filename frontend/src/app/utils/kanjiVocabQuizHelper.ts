// Utility to generate Lesson Kanji Vocabulary Quiz Questions (4 diverse A-B-C-D multiple-choice types)
// Extracts lesson vocabulary words that use the lesson's taught Kanji characters.

import { getGlobalKanjiForm } from './kanjiFormLookup';
import { parseCompounds, COMMON_KANJI_DISTRACTORS, shuffleArray } from './kanjiPracticeHelper';

export type KanjiVocabQuizType = 'kanji_to_meaning' | 'meaning_to_kanji' | 'complete_word' | 'context_fill';

export interface KanjiVocabQuizQuestion {
  id: string;
  questionType: KanjiVocabQuizType;
  prompt: string;
  displaySubject: string;
  subInfo?: string;
  targetWord: string;
  targetReading: string;
  targetMeaning: string;
  audioWord: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  contextSentence?: string;
}

export interface LessonKanjiVocabItem {
  kanjiWord: string;
  hiragana: string;
  meaning: string;
  sinoVietnamese?: string;
  example?: string;
  exampleMeaning?: string;
  kanjiChars: string[];
}

/**
 * Extracts all vocabulary words from the current lesson that use the lesson's taught Kanji,
 * plus representative compound words from kanji.compounds.
 */
export function extractLessonKanjiVocabs(
  kanjiItems: any[] = [],
  vocabItems: any[] = [],
  allKanjiList: any[] = []
): LessonKanjiVocabItem[] {
  if (!Array.isArray(kanjiItems) || kanjiItems.length === 0) return [];

  const lessonKanjiMap = new Map<string, any>();
  kanjiItems.forEach(k => {
    if (k && k.character) {
      lessonKanjiMap.set(k.character, k);
    }
  });

  const results: LessonKanjiVocabItem[] = [];
  const seenWords = new Set<string>();

  // 1. Scan vocabulary items in the lesson
  if (Array.isArray(vocabItems)) {
    for (const v of vocabItems) {
      if (!v || !v.hiragana) continue;
      const kForm = v.kanji_word || v.kanji_form || getGlobalKanjiForm(v.hiragana, allKanjiList.length > 0 ? allKanjiList : kanjiItems, v.kanji_word);
      if (!kForm || kForm === v.hiragana) continue;

      // Check if kForm contains any Kanji character from this lesson
      const matchingChars: string[] = [];
      for (const char of kForm) {
        if (lessonKanjiMap.has(char) && !matchingChars.includes(char)) {
          matchingChars.push(char);
        }
      }

      if (matchingChars.length > 0 && !seenWords.has(kForm)) {
        seenWords.add(kForm);

        // Build Sino-Vietnamese text for the Kanji in this word
        const sinoParts = matchingChars
          .map(c => lessonKanjiMap.get(c)?.sino_vietnamese)
          .filter(Boolean);

        results.push({
          kanjiWord: kForm,
          hiragana: v.hiragana,
          meaning: v.vietnamese_meaning || '',
          sinoVietnamese: sinoParts.join(' '),
          example: v.japanese_example,
          exampleMeaning: v.example_meaning,
          kanjiChars: matchingChars
        });
      }
    }
  }

  // 2. Scan compound words defined directly on the Kanji items of this lesson
  for (const k of kanjiItems) {
    if (!k || !k.compounds) continue;
    const parsed = parseCompounds(k.compounds);
    for (const p of parsed) {
      if (!p.word || !p.word.includes(k.character)) continue;
      if (seenWords.has(p.word)) continue;

      seenWords.add(p.word);
      results.push({
        kanjiWord: p.word,
        hiragana: p.reading,
        meaning: p.meaning,
        sinoVietnamese: k.sino_vietnamese,
        kanjiChars: [k.character]
      });
    }
  }

  return results;
}

/**
 * Generates an interactive, balanced set of multiple-choice (A, B, C, D) quiz questions
 * covering the 4 core exercise types for the lesson's Kanji vocabulary.
 */
export function generateKanjiVocabQuizQuestions(
  kanjiItems: any[] = [],
  vocabItems: any[] = [],
  allKanjiList: any[] = []
): KanjiVocabQuizQuestion[] {
  const lessonVocabs = extractLessonKanjiVocabs(kanjiItems, vocabItems, allKanjiList);
  if (lessonVocabs.length === 0) return [];

  const questions: KanjiVocabQuizQuestion[] = [];
  const targetCount = Math.max(8, Math.min(20, lessonVocabs.length * 2));

  // Pool of all lesson vocabulary words for distractor generation
  const allWordPool = [...lessonVocabs];
  const allKanjiChars = kanjiItems.map(k => k.character).filter(Boolean);

  // Available question types: 4 diverse types requested by user
  const questionTypeCycle: KanjiVocabQuizType[] = [
    'kanji_to_meaning',
    'meaning_to_kanji',
    'complete_word',
    'context_fill'
  ];

  let loopIndex = 0;
  while (questions.length < targetCount && loopIndex < targetCount * 3) {
    const item = allWordPool[loopIndex % allWordPool.length];
    const qType = questionTypeCycle[loopIndex % questionTypeCycle.length];
    loopIndex++;

    // -------------------------------------------------------------
    // DẠNG 1: CHỌN NGHĨA TỪ VỰNG CHỮ HÁN (Kanji -> Nghĩa tiếng Việt)
    // -------------------------------------------------------------
    if (qType === 'kanji_to_meaning') {
      const correctOption = `${item.meaning}${item.sinoVietnamese ? ` (Hán Việt: ${item.sinoVietnamese})` : ''}`;

      // Pick 3 distractors from other vocabulary items
      const wrongItems = shuffleArray(allWordPool.filter(w => w.kanjiWord !== item.kanjiWord)).slice(0, 3);
      if (wrongItems.length < 3) {
        // Fallback distractors if lesson has few items
        const genericDistractors = ['Thời gian, khoảnh khắc', 'Gia đình, bạn bè', 'Địa điểm, trường học', 'Công việc, học tập'];
        for (const gd of genericDistractors) {
          if (wrongItems.length < 3 && !wrongItems.some(w => w.meaning === gd)) {
            wrongItems.push({ meaning: gd } as any);
          }
        }
      }

      const wrongOptions = wrongItems.map(w => 
        w.sinoVietnamese 
          ? `${w.meaning} (Hán Việt: ${w.sinoVietnamese})`
          : w.meaning
      );

      const uniqueOptions = Array.from(new Set([correctOption, ...wrongOptions]));
      if (uniqueOptions.length < 4) continue;

      const shuffledOptions = shuffleArray(uniqueOptions.slice(0, 4));
      const correctIndex = shuffledOptions.indexOf(correctOption);

      questions.push({
        id: `kv_k2m_${item.kanjiWord}_${loopIndex}`,
        questionType: 'kanji_to_meaning',
        prompt: '👉 Chọn ý nghĩa tiếng Việt đúng của từ vựng chữ Hán sau:',
        displaySubject: item.kanjiWord,
        subInfo: `Cách đọc: /${item.hiragana}/`,
        targetWord: item.kanjiWord,
        targetReading: item.hiragana,
        targetMeaning: item.meaning,
        audioWord: item.kanjiWord,
        options: shuffledOptions,
        correctIndex,
        explanation: `Từ vựng chữ Hán 「${item.kanjiWord}」 đọc là "${item.hiragana}", mang ý nghĩa là "${item.meaning}"${item.sinoVietnamese ? ` (Âm Hán Việt: ${item.sinoVietnamese})` : ''}.`
      });
    }

    // -------------------------------------------------------------
    // DẠNG 2: CHỌN CHỮ HÁN CHUẨN THEO NGHĨA (Nghĩa tiếng Việt -> Kanji)
    // -------------------------------------------------------------
    else if (qType === 'meaning_to_kanji') {
      const correctOption = item.kanjiWord;

      // Distractors: other kanji words in the lesson or mutated kanji
      const otherWords = shuffleArray(allWordPool.filter(w => w.kanjiWord !== item.kanjiWord)).slice(0, 3);
      const wrongOptions: string[] = otherWords.map(w => w.kanjiWord);

      // If we don't have enough words, create smart orthographic distractors by substituting a kanji character
      if (wrongOptions.length < 3 && item.kanjiChars.length > 0) {
        const targetChar = item.kanjiChars[0];
        const distractorPool = shuffleArray(
          allKanjiChars.filter(c => c !== targetChar)
            .concat(COMMON_KANJI_DISTRACTORS.map(d => d.character).filter(c => c !== targetChar))
        );
        for (const distChar of distractorPool) {
          if (wrongOptions.length >= 3) break;
          const fakeWord = item.kanjiWord.replace(targetChar, distChar);
          if (fakeWord !== correctOption && !wrongOptions.includes(fakeWord)) {
            wrongOptions.push(fakeWord);
          }
        }
      }

      const uniqueOptions = Array.from(new Set([correctOption, ...wrongOptions]));
      if (uniqueOptions.length < 4) continue;

      const shuffledOptions = shuffleArray(uniqueOptions.slice(0, 4));
      const correctIndex = shuffledOptions.indexOf(correctOption);

      questions.push({
        id: `kv_m2k_${item.kanjiWord}_${loopIndex}`,
        questionType: 'meaning_to_kanji',
        prompt: '👉 Chọn từ vựng viết bằng chữ Hán chuẩn xác:',
        displaySubject: item.meaning,
        subInfo: `Cách đọc: /${item.hiragana}/${item.sinoVietnamese ? ` • Hán Việt: ${item.sinoVietnamese}` : ''}`,
        targetWord: item.kanjiWord,
        targetReading: item.hiragana,
        targetMeaning: item.meaning,
        audioWord: item.kanjiWord,
        options: shuffledOptions,
        correctIndex,
        explanation: `Ý nghĩa "${item.meaning}" đọc là 「${item.hiragana}」 được viết bằng chữ Hán là 「${item.kanjiWord}」.`
      });
    }

    // -------------------------------------------------------------
    // DẠNG 3: HOÀN THIỆN TỪ VỰNG KHUYẾT HÁN TỰ (Điền chữ Hán vào từ ghép)
    // -------------------------------------------------------------
    else if (qType === 'complete_word') {
      // Must be a multi-character word and contain at least one taught kanji
      if (item.kanjiWord.length < 2 || item.kanjiChars.length === 0) continue;

      const charToMask = item.kanjiChars[Math.floor(Math.random() * item.kanjiChars.length)];
      const maskedSubject = item.kanjiWord.replace(charToMask, '【 ? 】');
      const correctOption = charToMask;

      // Pick 3 distractor kanji characters
      const candidateDistractors = shuffleArray(
        allKanjiChars.filter(c => c !== charToMask)
          .concat(COMMON_KANJI_DISTRACTORS.map(d => d.character).filter(c => c !== charToMask))
      );

      const wrongOptions = candidateDistractors.slice(0, 3);
      const uniqueOptions = Array.from(new Set([correctOption, ...wrongOptions]));
      if (uniqueOptions.length < 4) continue;

      const shuffledOptions = shuffleArray(uniqueOptions.slice(0, 4));
      const correctIndex = shuffledOptions.indexOf(correctOption);

      questions.push({
        id: `kv_cw_${item.kanjiWord}_${loopIndex}`,
        questionType: 'complete_word',
        prompt: '👉 Điền chữ Hán còn thiếu vào vị trí 【 ? 】 để hoàn thiện từ vựng:',
        displaySubject: maskedSubject,
        subInfo: `Cách đọc: /${item.hiragana}/  •  Nghĩa: ${item.meaning}`,
        targetWord: item.kanjiWord,
        targetReading: item.hiragana,
        targetMeaning: item.meaning,
        audioWord: item.kanjiWord,
        options: shuffledOptions,
        correctIndex,
        explanation: `Chữ Hán còn thiếu là 「${charToMask}」. Ghép lại thành từ vựng hoàn chỉnh: 「${item.kanjiWord}」 (${item.hiragana}) mang nghĩa là "${item.meaning}".`
      });
    }

    // -------------------------------------------------------------
    // DẠNG 4: ĐIỀN TỪ HÁN TỰ VÀO CÂU NGỮ CẢNH THỰC TẾ
    // -------------------------------------------------------------
    else if (qType === 'context_fill') {
      let sentence = item.example || '';
      let sentenceMeaning = item.exampleMeaning || '';

      // If no example sentence, synthesize a clean, natural Minna pattern sentence
      if (!sentence) {
        const templates = [
          { ja: `これは【 ... 】です。`, vi: `Đây là ${item.meaning}.` },
          { ja: `【 ... 】をべんきょうします。`, vi: `Học ${item.meaning}.` },
          { ja: `わたしは【 ... 】がすきです。`, vi: `Tôi thích ${item.meaning}.` },
          { ja: `あそこは【 ... 】です。`, vi: `Chỗ kia là ${item.meaning}.` }
        ];
        const chosen = templates[loopIndex % templates.length];
        sentence = chosen.ja;
        sentenceMeaning = chosen.vi;
      } else {
        // Mask the target word in the sentence
        if (sentence.includes(item.kanjiWord)) {
          sentence = sentence.replace(item.kanjiWord, '【 ... 】');
        } else if (sentence.includes(item.hiragana)) {
          sentence = sentence.replace(item.hiragana, '【 ... 】');
        } else {
          sentence = `【 ... 】: ${sentence}`;
        }
      }

      const correctOption = item.kanjiWord;
      const otherWords = shuffleArray(allWordPool.filter(w => w.kanjiWord !== item.kanjiWord)).slice(0, 3);
      const wrongOptions = otherWords.map(w => w.kanjiWord);

      const uniqueOptions = Array.from(new Set([correctOption, ...wrongOptions]));
      if (uniqueOptions.length < 4) continue;

      const shuffledOptions = shuffleArray(uniqueOptions.slice(0, 4));
      const correctIndex = shuffledOptions.indexOf(correctOption);

      questions.push({
        id: `kv_cf_${item.kanjiWord}_${loopIndex}`,
        questionType: 'context_fill',
        prompt: '👉 Chọn từ vựng chữ Hán thích hợp điền vào chỗ trống trong câu:',
        displaySubject: sentence,
        subInfo: sentenceMeaning ? `Ý nghĩa câu: ${sentenceMeaning}` : `Nghĩa của từ cần điền: ${item.meaning}`,
        targetWord: item.kanjiWord,
        targetReading: item.hiragana,
        targetMeaning: item.meaning,
        audioWord: item.kanjiWord,
        options: shuffledOptions,
        correctIndex,
        contextSentence: sentence,
        explanation: `Từ vựng chữ Hán thích hợp nhất là 「${item.kanjiWord}」 (${item.hiragana}) mang nghĩa là "${item.meaning}".`
      });
    }
  }

  return shuffleArray(questions);
}
