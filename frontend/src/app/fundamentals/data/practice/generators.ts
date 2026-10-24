import { PracticeQuestion } from './types';
import { VERB_BANK, ADJ_BANK } from './wordBank';

// Fisher-Yates shuffle array in place and return it
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate 4 randomized options and calculate the new correctIndex
export function buildShuffledOptions(correct: string, distractors: string[]): { options: string[]; correctIndex: number } {
  // Ensure distractors do not contain the correct answer and are unique
  const uniqueDistractors = Array.from(new Set(distractors.filter(d => d !== correct))).slice(0, 3);
  // If fewer than 3 distractors, pad with dummy
  while (uniqueDistractors.length < 3) {
    uniqueDistractors.push(`${correct}（誤）`);
  }
  const allOptions = shuffleArray([correct, ...uniqueDistractors]);
  const correctIndex = allOptions.indexOf(correct);
  return { options: allOptions, correctIndex };
}

// ----------------- Number 0 - 99 Generator -----------------
const NUM_READINGS: Record<number, { kana: string; romaji: string; isSpecial?: boolean }> = {
  0: { kana: 'ゼロ / れい', romaji: 'zero / rei', isSpecial: true },
  1: { kana: 'いち', romaji: 'ichi' },
  2: { kana: 'に', romaji: 'ni' },
  3: { kana: 'さん', romaji: 'san' },
  4: { kana: 'よん / し', romaji: 'yon / shi', isSpecial: true },
  5: { kana: 'ご', romaji: 'go' },
  6: { kana: 'ろく', romaji: 'roku' },
  7: { kana: 'なな / しち', romaji: 'nana / shichi', isSpecial: true },
  8: { kana: 'はち', romaji: 'hachi' },
  9: { kana: 'きゅう / く', romaji: 'kyuu / ku', isSpecial: true },
  10: { kana: 'じゅう', romaji: 'juu' },
  14: { kana: 'じゅうよん', romaji: 'juuyon', isSpecial: true },
  17: { kana: 'じゅうなな / じゅうしち', romaji: 'juunana / juushichi', isSpecial: true },
  19: { kana: 'じゅうきゅう', romaji: 'juukyuu', isSpecial: true },
  20: { kana: 'にじゅう', romaji: 'nijuu' },
  40: { kana: 'よんじゅう', romaji: 'yonjuu', isSpecial: true },
  70: { kana: 'ななじゅう', romaji: 'nanajuu', isSpecial: true },
  90: { kana: 'きゅうじゅう', romaji: 'kyuujuu', isSpecial: true },
};

export function getNumberReading(n: number): string {
  if (n <= 10) {
    if (n === 4) return 'よん';
    if (n === 7) return 'なな';
    if (n === 9) return 'きゅう';
    if (n === 0) return 'ゼロ';
    return NUM_READINGS[n].kana;
  }
  if (n === 14) return 'じゅうよん';
  if (n === 17) return 'じゅうなな';
  if (n === 19) return 'じゅうきゅう';
  if (n === 40) return 'よんじゅう';
  if (n === 70) return 'ななじゅう';
  if (n === 90) return 'きゅうじゅう';

  const tens = Math.floor(n / 10);
  const ones = n % 10;

  const tensStr = tens === 1 ? 'じゅう' : tens === 4 ? 'よんじゅう' : tens === 7 ? 'ななじゅう' : tens === 9 ? 'きゅうじゅう' : `${NUM_READINGS[tens].kana}じゅう`;
  if (ones === 0) return tensStr;
  const onesStr = ones === 4 ? 'よん' : ones === 7 ? 'なな' : ones === 9 ? 'きゅう' : NUM_READINGS[ones].kana;
  return `${tensStr}${onesStr}`;
}

export function generateNumberQuestion(lesson = 1): PracticeQuestion {
  // Special numbers weighted x3
  const specials = [0, 4, 7, 9, 14, 17, 19, 40, 70, 90];
  const isSpecialPick = Math.random() < 0.45;
  const num = isSpecialPick ? specials[Math.floor(Math.random() * specials.length)] : Math.floor(Math.random() * 100);

  const correctKana = getNumberReading(num);
  let distractors: string[] = [];

  if (num === 4) distractors = ['し', 'よ', 'よっ'];
  else if (num === 7) distractors = ['しち', 'な', 'ひち'];
  else if (num === 9) distractors = ['く', 'きゅ', 'きゅうっ'];
  else if (num === 14) distractors = ['じゅうし', 'じゅよん', 'とおよん'];
  else if (num === 40) distractors = ['しじゅう', 'よじゅう', 'よっじゅう'];
  else if (num === 70) distractors = ['しちじゅう', 'ななじゅ', 'しちじゅ'];
  else if (num === 90) distractors = ['くじゅう', 'きゅじゅう', 'ここのじゅう'];
  else {
    distractors = [
      getNumberReading(Math.abs(num - 1)),
      getNumberReading(num + 1),
      getNumberReading((num + 10) % 100),
    ];
  }

  const { options, correctIndex } = buildShuffledOptions(correctKana, distractors);

  return {
    id: `gen_num_${num}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    lesson,
    unitId: 'l1_num_0_99',
    format: 'num_to_reading',
    formatLabel: 'Nhìn số chọn cách đọc',
    question_kana: `Số 「 ${num} 」 trong tiếng Nhật được đọc chuẩn là gì?`,
    question_kanji: `Số 「 ${num} 」 trong tiếng Nhật được đọc chuẩn là gì?`,
    options,
    correctIndex,
    explanation: `Số ${num} được đọc là 「${correctKana}」. Cần lưu ý các số 4 (yon), 7 (nana), 9 (kyuu), 40 (yonjuu - không đọc shijuu), 70 (nanajuu), 90 (kyuujuu).`,
    audioText: correctKana,
  };
}

// ----------------- Age Counter Generator -----------------
export function generateAgeQuestion(lesson = 1): PracticeQuestion {
  const specials = [1, 8, 10, 20];
  const isSpecial = Math.random() < 0.5;
  const age = isSpecial ? specials[Math.floor(Math.random() * specials.length)] : Math.floor(Math.random() * 60) + 1;

  let correct = '';
  let distractors: string[] = [];

  if (age === 20) {
    correct = 'はたち (hatachi)';
    distractors = ['にじゅっさい (nijussai)', 'にじゅうさい (nijuusai)', 'はたちさい (hatachisai)'];
  } else if (age === 1) {
    correct = 'いっさい (issai)';
    distractors = ['いちさい (ichisai)', 'いっつさい (ittusai)', 'ひとさい (hitosai)'];
  } else if (age === 8) {
    correct = 'はっさい (hassai)';
    distractors = ['はちさい (hachisai)', 'やっさい (yassai)', 'はちいさい (hachiisai)'];
  } else if (age === 10) {
    correct = 'じゅっさい / じっさい (jussai/jissai)';
    distractors = ['じゅうさい (juusai)', 'とおさい (toosai)', 'じゅういっさい (juuissai)'];
  } else {
    const tens = Math.floor(age / 10);
    const ones = age % 10;
    const base = ones === 1 ? 'いっさい' : ones === 8 ? 'はっさい' : ones === 0 ? 'じゅっさい' : `${getNumberReading(ones)}さい`;
    const prefix = tens === 0 ? '' : tens === 1 ? 'じゅう' : `${getNumberReading(tens)}じゅう`;
    correct = `${prefix}${base}`;
    distractors = [
      `${prefix}${getNumberReading(ones)}さい`,
      `${prefix}はちさい`,
      `${prefix}いちさい`,
    ];
  }

  const { options, correctIndex } = buildShuffledOptions(correct, distractors);

  return {
    id: `gen_age_${age}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    lesson,
    unitId: 'l1_counter_sai',
    format: 'age_counter',
    formatLabel: 'Đếm tuổi tác & Ngoại lệ',
    question_kana: `「 ${age} tuổi 」 trong tiếng Nhật được nói là gì?`,
    question_kanji: `「 ${age} 歳 」 trong tiếng Nhật được nói là gì?`,
    options,
    correctIndex,
    explanation: age === 20
      ? `20 tuổi là mốc trưởng thành tại Nhật, có cách đọc thuần Nhật đặc biệt là 「はたち (hatachi)」, tuyệt đối không có đuôi さい.`
      : `Tuổi ${age} có biến âm âm ngắt: 「${correct}」. Quy tắc: 1 tuổi (いっさい), 8 tuổi (はっさい), 10 tuổi (じゅっさい).`,
    audioText: correct.split(' ')[0],
  };
}

// ----------------- Verb Form Generator -----------------
export function generateVerbFormQuestion(unitId: string, form: 'te' | 'nai' | 'ta' | 'potential' | 'volitional' | 'ba' | 'passive' | 'causative', lesson: number): PracticeQuestion {
  // Filter verbs learned up to this lesson
  const availableVerbs = VERB_BANK.filter(v => v.lesson <= lesson);
  const verb = availableVerbs[Math.floor(Math.random() * availableVerbs.length)] || VERB_BANK[0];

  let correct = '';
  let distractors: string[] = [];
  let formName = '';

  if (form === 'te') {
    formName = 'Thể て (Te)';
    correct = verb.te_kana;
    distractors = [
      verb.dict_kana + 'て',
      verb.masu_kana.replace('ます', 'て'),
      verb.te_kana.endsWith('んで') ? verb.te_kana.replace('んで', 'いて') : verb.te_kana + 'る',
    ];
  } else if (form === 'nai') {
    formName = 'Thể ない (Nai)';
    correct = verb.nai_kana;
    distractors = [
      verb.masu_kana.replace('ます', 'ない'),
      verb.dict_kana + 'ない',
      verb.nai_kana.replace('ない', 'ぬ'),
    ];
  } else if (form === 'ta') {
    formName = 'Thể た (Ta)';
    correct = verb.ta_kana;
    distractors = [
      verb.masu_kana.replace('ます', 'た'),
      verb.dict_kana + 'た',
      verb.ta_kana.endsWith('んだ') ? verb.ta_kana.replace('んだ', 'いた') : verb.ta_kana + 'る',
    ];
  } else if (form === 'potential') {
    formName = 'Thể Khả Năng (Potential)';
    correct = verb.potential_kana || (verb.masu_kana.replace('ます', 'える'));
    distractors = [
      verb.dict_kana + 'できる',
      verb.masu_kana.replace('ます', 'られる'),
      verb.dict_kana + 'れる',
    ];
  } else if (form === 'volitional') {
    formName = 'Thể Ý Chí (Volitional)';
    correct = verb.volitional_kana || (verb.dict_kana + 'う');
    distractors = [
      verb.masu_kana.replace('ます', 'ましょう'),
      verb.dict_kana + 'よう',
      verb.dict_kana + 'おう',
    ];
  } else if (form === 'ba') {
    formName = 'Thể Điều Kiện (Ba)';
    correct = verb.ba_kana || (verb.dict_kana + 'ば');
    distractors = [
      verb.masu_kana.replace('ます', 'れば'),
      verb.dict_kana + 'なら',
      verb.dict_kana + 'と',
    ];
  } else if (form === 'passive') {
    formName = 'Thể Bị Động (Passive)';
    correct = verb.passive_kana || (verb.dict_kana + 'れる');
    distractors = [
      verb.masu_kana.replace('ます', 'れる'),
      verb.dict_kana + 'られる',
      verb.dict_kana + 'される',
    ];
  } else if (form === 'causative') {
    formName = 'Thể Sai Khiến (Causative)';
    correct = verb.causative_kana || (verb.dict_kana + 'せる');
    distractors = [
      verb.masu_kana.replace('ます', 'せる'),
      verb.dict_kana + 'させる',
      verb.dict_kana + 'らす',
    ];
  }

  const { options, correctIndex } = buildShuffledOptions(correct, distractors);

  return {
    id: `gen_verb_${verb.dict_kana}_${form}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    lesson,
    unitId,
    format: `verb_form_${form}`,
    formatLabel: `Chia ${formName}`,
    question_kana: `Động từ 「${verb.masu_kana}」(${verb.meaning}) chuyển sang ${formName} là gì?`,
    question_kanji: `Động từ 「${verb.masu_kanji}」(${verb.meaning}) chuyển sang ${formName} là gì?`,
    options,
    correctIndex,
    explanation: `Động từ 「${verb.dict_kanji} / ${verb.masu_kana}」 thuộc Nhóm ${verb.group}. Chuyển sang ${formName} là 「${correct}」.${verb.isSpecialException ? ' Đây là động từ ngoại lệ cần đặc biệt ghi nhớ.' : ''}`,
    audioText: correct,
  };
}

// ----------------- Adjective Conjugation Generator -----------------
export function generateAdjQuestion(unitId: string, form: 'present_neg' | 'past_aff' | 'past_neg', lesson: number): PracticeQuestion {
  const adj = ADJ_BANK[Math.floor(Math.random() * ADJ_BANK.length)];
  let correct = '';
  let distractors: string[] = [];
  let formLabel = '';

  if (adj.type === 'i') {
    const stem = adj.kana.slice(0, -1);
    if (adj.kana === 'いい') {
      if (form === 'present_neg') { correct = 'よくない'; distractors = ['いくない', 'いーくない', 'よきない']; formLabel = 'phủ định hiện tại'; }
      else if (form === 'past_aff') { correct = 'よかった'; distractors = ['いった', 'いかった', 'よきでした']; formLabel = 'quá khứ khẳng định'; }
      else { correct = 'よくなかった'; distractors = ['いくなかった', 'いーくなかった', 'よきではありませんでした']; formLabel = 'quá khứ phủ định'; }
    } else {
      if (form === 'present_neg') { correct = `${stem}くない`; distractors = [`${stem}じゃない`, `${adj.kana}くない`, `${stem}くありませんでした`]; formLabel = 'phủ định hiện tại'; }
      else if (form === 'past_aff') { correct = `${stem}かった`; distractors = [`${stem}でした`, `${adj.kana}かった`, `${stem}いでした`]; formLabel = 'quá khứ khẳng định'; }
      else { correct = `${stem}くなかった`; distractors = [`${stem}じゃなかった`, `${adj.kana}くなかった`, `${stem}くないでした`]; formLabel = 'quá khứ phủ định'; }
    }
  } else {
    if (form === 'present_neg') { correct = `${adj.kana}じゃありません / ではない`; distractors = [`${adj.kana}くない`, `${adj.kana}なく`, `${adj.kana}いじゃない`]; formLabel = 'phủ định hiện tại'; }
    else if (form === 'past_aff') { correct = `${adj.kana}でした`; distractors = [`${adj.kana}かった`, `${adj.kana}だった`, `${adj.kana}いでした`]; formLabel = 'quá khứ khẳng định'; }
    else { correct = `${adj.kana}じゃありませんでした`; distractors = [`${adj.kana}くなかった`, `${adj.kana}くありません`, `${adj.kana}なかった`]; formLabel = 'quá khứ phủ định'; }
  }

  const { options, correctIndex } = buildShuffledOptions(correct, distractors);

  return {
    id: `gen_adj_${adj.kana}_${form}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    lesson,
    unitId,
    format: `adj_${form}`,
    formatLabel: `Chia tính từ ${formLabel}`,
    question_kana: `Tính từ 「${adj.kana}」(${adj.meaning}) chuyển sang dạng [${formLabel}] là gì?`,
    question_kanji: `Tính từ 「${adj.kanji}」(${adj.meaning}) chuyển sang dạng [${formLabel}] là gì?`,
    options,
    correctIndex,
    explanation: `Tính từ 「${adj.kanji}」 là tính từ đuôi ${adj.type === 'i' ? '「い」' : '「な」'}. Dạng ${formLabel} là 「${correct}」.${adj.isSpecialException ? ' Lưu ý tính từ いい là ngoại lệ, biến đổi từ stem よ.' : ''}`,
    audioText: correct.split(' ')[0],
  };
}

// ----------------- Dispatcher for Generating Rule-based Questions -----------------
export function generateQuestionForUnit(unitId: string, lesson: number): PracticeQuestion | null {
  if (unitId === 'l1_num_0_99') return generateNumberQuestion(lesson);
  if (unitId === 'l1_counter_sai') return generateAgeQuestion(lesson);
  if (unitId.includes('verb_form_te') || unitId === 'l14_verb_form_te') return generateVerbFormQuestion(unitId, 'te', lesson);
  if (unitId.includes('verb_form_nai') || unitId === 'l17_verb_form_nai') return generateVerbFormQuestion(unitId, 'nai', lesson);
  if (unitId.includes('verb_form_jisho') || unitId === 'l18_verb_form_jisho') return generateVerbFormQuestion(unitId, 'te', lesson); // practice basic
  if (unitId.includes('verb_form_ta') || unitId === 'l19_verb_form_ta') return generateVerbFormQuestion(unitId, 'ta', lesson);
  if (unitId.includes('verb_form_potential') || unitId === 'l27_verb_form_potential') return generateVerbFormQuestion(unitId, 'potential', lesson);
  if (unitId.includes('verb_form_volitional') || unitId === 'l31_verb_form_volitional') return generateVerbFormQuestion(unitId, 'volitional', lesson);
  if (unitId.includes('verb_form_ba') || unitId === 'l35_verb_form_ba') return generateVerbFormQuestion(unitId, 'ba', lesson);
  if (unitId.includes('verb_form_passive') || unitId === 'l37_verb_form_passive') return generateVerbFormQuestion(unitId, 'passive', lesson);
  if (unitId.includes('verb_form_causative') || unitId === 'l48_verb_form_causative') return generateVerbFormQuestion(unitId, 'causative', lesson);
  if (unitId === 'l8_adj_present') return generateAdjQuestion(unitId, 'present_neg', lesson);
  if (unitId === 'l12_adj_past') return generateAdjQuestion(unitId, 'past_aff', lesson);

  // Default fallback for numbers
  return generateNumberQuestion(lesson);
}
