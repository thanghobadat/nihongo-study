export interface Question {
  id: number;
  type: 'kanji_reading' | 'orthography' | 'context' | 'grammar_select' | 'sentence_star';
  mondaiNumber: number;
  questionText: string;
  sentenceContext: string;
  choices: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  lessonId: number;
  explanation?: string;
  starSentenceParts?: string[]; // For star questions
  starCorrectOrder?: string[]; // For star questions
}

// Helper to shuffle array
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Smart sentence chunker for JLPT Star questions
function splitSentenceParticles(sentence: string): string[] | null {
  const clean = sentence.trim().replace(/[。！?]/g, '');
  if (!clean) return null;

  // If sentence has spaces, split by spaces
  if (clean.includes(' ')) {
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 3 && parts.length <= 6) {
      if (parts.length === 3) return [...parts, '。'];
      if (parts.length === 4) return parts;
      if (parts.length === 5) return [parts[0] + ' ' + parts[1], parts[2], parts[3], parts[4]];
      return [parts[0] + ' ' + parts[1], parts[2], parts[3], parts[4] + ' ' + parts[5]];
    }
  }

  // Split by common Japanese particles
  const parts = clean.split(/(\b|は|が|を|に|へ|と|で|から|まで|の|も)/).filter(Boolean);
  
  const cleanParts: string[] = [];
  let temp = '';
  for (const p of parts) {
    if (['は', 'が', 'を', 'に', 'へ', 'と', 'で', 'から', 'まで', 'の', 'も'].includes(p)) {
      temp += p;
      cleanParts.push(temp);
      temp = '';
    } else {
      if (temp) {
        cleanParts.push(temp);
      }
      temp = p;
    }
  }
  if (temp) {
    cleanParts.push(temp);
  }

  const finalParts = cleanParts.filter(p => p.trim().length > 0);
  if (finalParts.length >= 4) {
    while (finalParts.length > 4) {
      let minLen = Infinity;
      let minIdx = 0;
      for (let i = 0; i < finalParts.length - 1; i++) {
        const combinedLen = finalParts[i].length + finalParts[i+1].length;
        if (combinedLen < minLen) {
          minLen = combinedLen;
          minIdx = i;
        }
      }
      finalParts[minIdx] += finalParts[minIdx + 1];
      finalParts.splice(minIdx + 1, 1);
    }
    return finalParts;
  }
  
  // Fallback: character-based slicing
  const len = clean.length;
  if (len < 4) return null;
  const sliceSize = Math.floor(len / 4);
  return [
    clean.substring(0, sliceSize),
    clean.substring(sliceSize, sliceSize * 2),
    clean.substring(sliceSize * 2, sliceSize * 3),
    clean.substring(sliceSize * 3)
  ];
}

/**
 * Dynamically generates a JLPT Mock Exam
 */
export function generateJLPTExam(
  vocabList: any[],
  kanjiList: any[],
  grammarList: any[],
  rangeStart: number,
  rangeEnd: number,
  totalQuestions: number
): Question[] {
  // 1. Filter lists by lesson range
  const filteredVocab = vocabList.filter(v => v.lesson_id >= rangeStart && v.lesson_id <= rangeEnd);
  const filteredGrammar = grammarList.filter(g => g.lesson_id >= rangeStart && g.lesson_id <= rangeEnd);

  // Pool of items with Kanji
  const vocabWithKanji = filteredVocab.filter(v => v.kanji_word && v.kanji_word !== v.hiragana);

  const questions: Question[] = [];
  let questionId = 1;

  // Determine question type distribution
  // Typically: 30% Kanji Reading, 20% Orthography, 25% Context, 15% Grammar, 10% Star
  const qtyKanjiRead = Math.max(1, Math.floor(totalQuestions * 0.3));
  const qtyOrthography = Math.max(1, Math.floor(totalQuestions * 0.2));
  const qtyContext = Math.max(1, Math.floor(totalQuestions * 0.25));
  const qtyGrammar = Math.max(1, Math.floor(totalQuestions * 0.15));
  const qtyStar = Math.max(1, totalQuestions - (qtyKanjiRead + qtyOrthography + qtyContext + qtyGrammar));

  // Shuffled pools
  const poolKanjiRead = shuffleArray(vocabWithKanji);
  const poolOrthography = shuffleArray(vocabWithKanji);
  const poolContext = shuffleArray(filteredVocab);
  const poolGrammar = shuffleArray(filteredGrammar);
  const poolStar = shuffleArray(filteredGrammar.filter(g => g.japanese_example));

  // --- MONDAI 1: KANJI READING ---
  let kanjiReadAdded = 0;
  for (const item of poolKanjiRead) {
    if (kanjiReadAdded >= qtyKanjiRead) break;

    // Use example sentence or word itself
    let sentence = item.japanese_example || `これは${item.kanji_word}です。`;
    // Underline the target kanji word in example
    if (sentence.includes(item.kanji_word)) {
      sentence = sentence.replace(item.kanji_word, `<u><b>${item.kanji_word}</b></u>`);
    } else {
      sentence = `<u><b>${item.kanji_word}</b></u>`;
    }

    // Select distractors from other Hiragana words in range
    const distractors = shuffleArray(
      filteredVocab.filter(v => v.hiragana !== item.hiragana).map(v => v.hiragana)
    ).slice(0, 3);
    
    // Fallback if not enough distractors
    while (distractors.length < 3) {
      distractors.push(item.hiragana + 'あ');
    }

    const choices = shuffleArray([item.hiragana, ...distractors]);

    questions.push({
      id: questionId++,
      type: 'kanji_reading',
      mondaiNumber: 1,
      questionText: 'Chọn cách đọc đúng của chữ Kanji được gạch chân:',
      sentenceContext: sentence,
      choices,
      correctAnswer: item.hiragana,
      lessonId: item.lesson_id,
      explanation: `Từ: "${item.kanji_word}" (${item.vietnamese_meaning}) đọc là "${item.hiragana}".`
    });

    kanjiReadAdded++;
  }

  // --- MONDAI 2: ORTHOGRAPHY (CHỌN CHỮ KANJI) ---
  let orthoAdded = 0;
  for (const item of poolOrthography) {
    if (orthoAdded >= qtyOrthography) break;

    let sentence = item.japanese_example || `これは${item.kanji_word}です。`;
    // Underline target hiragana in sentence
    if (sentence.includes(item.kanji_word)) {
      sentence = sentence.replace(item.kanji_word, `<u><b>${item.hiragana}</b></u>`);
    } else {
      sentence = `<u><b>${item.hiragana}</b></u>`;
    }

    // Select distractors from other Kanji words
    const distractors = shuffleArray(
      vocabWithKanji.filter(v => v.kanji_word !== item.kanji_word).map(v => v.kanji_word)
    ).slice(0, 3);

    while (distractors.length < 3) {
      distractors.push('漢字');
    }

    const choices = shuffleArray([item.kanji_word, ...distractors]);

    questions.push({
      id: questionId++,
      type: 'orthography',
      mondaiNumber: 2,
      questionText: 'Chọn chữ viết Kanji đúng cho từ được gạch chân:',
      sentenceContext: sentence,
      choices,
      correctAnswer: item.kanji_word,
      lessonId: item.lesson_id,
      explanation: `Từ: "${item.hiragana}" (${item.vietnamese_meaning}) được viết bằng Kanji là "${item.kanji_word}".`
    });

    orthoAdded++;
  }

  // --- MONDAI 3: CONTEXTUAL DEFINITION (ĐIỀN TỪ) ---
  let contextAdded = 0;
  for (const item of poolContext) {
    if (contextAdded >= qtyContext) break;

    const sentence = item.japanese_example;
    if (!sentence) continue; // Needs example sentence

    // Target word to hide (kanji or hiragana)
    const targetToHide = item.kanji_word && sentence.includes(item.kanji_word) ? item.kanji_word : item.hiragana;
    if (!sentence.includes(targetToHide)) continue;

    const blankedSentence = sentence.replace(targetToHide, ' (  　  ) ');

    // Distractors: same word type
    let distractors = filteredVocab
      .filter(v => v.id !== item.id && v.word_type === item.word_type)
      .map(v => v.kanji_word || v.hiragana);
    
    distractors = shuffleArray(distractors).slice(0, 3);

    // Fallback to any words if not enough of same type
    if (distractors.length < 3) {
      const extraDistractors = shuffleArray(
        filteredVocab.filter(v => v.id !== item.id).map(v => v.kanji_word || v.hiragana)
      ).slice(0, 3 - distractors.length);
      distractors = [...distractors, ...extraDistractors];
    }

    const choices = shuffleArray([targetToHide, ...distractors]);

    questions.push({
      id: questionId++,
      type: 'context',
      mondaiNumber: 3,
      questionText: 'Chọn từ thích hợp nhất để điền vào chỗ trống:',
      sentenceContext: blankedSentence,
      choices,
      correctAnswer: targetToHide,
      lessonId: item.lesson_id,
      explanation: `Câu hoàn chỉnh: "${sentence}" (${item.example_meaning}). Điền từ "${targetToHide}" (${item.vietnamese_meaning}).`
    });

    contextAdded++;
  }

  // --- MONDAI 4: GRAMMAR SELECT ---
  let grammarAdded = 0;
  for (const item of poolGrammar) {
    if (grammarAdded >= qtyGrammar) break;

    const sentence = item.japanese_example;
    if (!sentence) continue;

    // We blank out the grammar title / pattern structure
    // Try to find the title in the sentence
    let targetPattern = '';
    if (sentence.includes(item.title)) {
      targetPattern = item.title;
    } else {
      // Find a clean substring
      const cleanTitle = item.title.replace(/[~～]/g, '').trim();
      if (cleanTitle && sentence.includes(cleanTitle)) {
        targetPattern = cleanTitle;
      }
    }

    if (!targetPattern) continue;

    const blankedSentence = sentence.replace(targetPattern, ' (  　  ) ');

    // Distractors: other grammar titles
    const distractors = shuffleArray(
      filteredGrammar.filter(g => g.title !== item.title).map(g => g.title.replace(/[~～]/g, '').trim())
    ).slice(0, 3);

    while (distractors.length < 3) {
      distractors.push('でしょう');
    }

    const choices = shuffleArray([targetPattern, ...distractors]);

    questions.push({
      id: questionId++,
      type: 'grammar_select',
      mondaiNumber: 4,
      questionText: 'Chọn mẫu ngữ pháp / trợ từ thích hợp điền vào chỗ trống:',
      sentenceContext: blankedSentence,
      choices,
      correctAnswer: targetPattern,
      lessonId: item.lesson_id,
      explanation: `Mẫu ngữ pháp: "${item.title}" (${item.meaning}). Giải thích: ${item.vietnamese_explanation || ''}\nCâu ví dụ: "${sentence}" (${item.example_meaning}).`
    });

    grammarAdded++;
  }

  // --- MONDAI 5: STAR SENTENCE COMPOSITION (XẾP TỪ NGÔI SAO ★) ---
  let starAdded = 0;
  for (const item of poolStar) {
    if (starAdded >= qtyStar) break;

    const sentence = item.japanese_example;
    const parts = splitSentenceParticles(sentence);
    if (!parts || parts.length !== 4) continue;

    // Shuffle parts for choices
    const scrambledChoices = shuffleArray(parts);
    // Correct answer for star position (3rd element in order, index 2)
    const starTarget = parts[2];

    questions.push({
      id: questionId++,
      type: 'sentence_star',
      mondaiNumber: 5,
      questionText: 'Sắp xếp các cụm từ xáo trộn để tạo thành câu hoàn chỉnh và chọn cụm từ ở vị trí ngôi sao (★ - vị trí số 3):',
      sentenceContext: `＿＿　＿＿　＿★＿　＿＿`,
      choices: scrambledChoices,
      correctAnswer: starTarget,
      lessonId: item.lesson_id,
      starSentenceParts: scrambledChoices,
      starCorrectOrder: parts,
      explanation: `Câu hoàn chỉnh: "${sentence}" (${item.example_meaning}).\nThứ tự sắp xếp đúng: ${parts.join(' ➔ ')}. Vị trí ngôi sao là: "${starTarget}".`
    });

    starAdded++;
  }

  // If we couldn't generate enough questions due to strict conditions, pad with basic vocabulary questions
  while (questions.length < totalQuestions && filteredVocab.length > 0) {
    const item = shuffleArray(filteredVocab)[0];
    const distractors = shuffleArray(
      filteredVocab.filter(v => v.id !== item.id).map(v => v.vietnamese_meaning)
    ).slice(0, 3);
    while (distractors.length < 3) distractors.push('Đang tải...');
    
    const choices = shuffleArray([item.vietnamese_meaning, ...distractors]);
    
    questions.push({
      id: questionId++,
      type: 'context',
      mondaiNumber: 3,
      questionText: `Từ vựng "${item.hiragana}" (${item.romaji}) có nghĩa tiếng Việt là gì?`,
      sentenceContext: `${item.hiragana}`,
      choices,
      correctAnswer: item.vietnamese_meaning,
      lessonId: item.lesson_id,
      explanation: `"${item.hiragana}" nghĩa là "${item.vietnamese_meaning}".`
    });
  }

  return questions.slice(0, totalQuestions);
}
