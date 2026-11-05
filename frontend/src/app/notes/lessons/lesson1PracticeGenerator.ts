export type PracticeTopic = 'numbers' | 'age';
export type PracticeMode = 'hira' | 'kanji' | 'audio' | 'mixed';
export type ConcretePromptType = 'hira' | 'kanji' | 'audio';

export interface PracticeQuestion {
  topic: PracticeTopic;
  promptType: ConcretePromptType;
  targetValue: number;
  hira: string;
  kanji: string;
  tts: string;
  options: number[]; // 4 shuffled numbers (1 correct + 3 smart traps)
  trapNote: string;
}

interface AgeBankItem {
  value: number;
  hira: string;
  kanji: string;
  tts: string;
  trapPool: number[];
  trapNote: string;
}

const DIGIT_HIRA: Record<number, string> = {
  1: 'いち',
  2: 'に',
  3: 'さん',
  4: 'よん',
  5: 'ご',
  6: 'ろく',
  7: 'なな',
  8: 'はち',
  9: 'きゅう',
};

const DIGIT_KANJI: Record<number, string> = {
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
  7: '七',
  8: '八',
  9: '九',
};

// Cặp chữ số dễ nhầm về ÂM ĐỌC (Hiragana / Nghe)
const PHONETIC_CONFUSION: Record<number, number[]> = {
  1: [7, 8, 2],      // いち ↔ しち/なな, はち
  2: [5, 1, 4],      // に ↔ ご, いち
  3: [6, 4, 7],      // さん ↔ ろく, よん
  4: [8, 7, 9],      // よん ↔ はち, なな, きゅう
  5: [2, 9, 6],      // ご ↔ に, きゅう
  6: [8, 3, 9],      // ろく ↔ はち, さん
  7: [1, 4, 8, 9],   // なな/しち ↔ いち, よん, はち
  8: [1, 7, 6, 4],   // はち ↔ いち, しち, ろく
  9: [7, 4, 5],      // きゅう ↔ なな, よん
};

// Cặp chữ số dễ nhầm về MẶT CHỮ HÁN (Kanji)
const KANJI_CONFUSION: Record<number, number[]> = {
  1: [2, 3, 7],      // 一 ↔ 二, 三, 七
  2: [3, 1, 5],      // 二 ↔ 三, 一, 五
  3: [2, 5, 8],      // 三 ↔ 二, 五
  4: [6, 8, 9],      // 四 ↔ 六, 八, 九
  5: [3, 6, 2],      // 五 ↔ 三, 六
  6: [8, 4, 9],      // 六 ↔ 八, 四
  7: [9, 1, 4],      // 七 ↔ 九, 一
  8: [6, 4, 2],      // 八 ↔ 六, 四
  9: [7, 4, 6],      // 九 ↔ 七, 四
};

export function fisherYatesShuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function numberToHiragana(n: number): string {
  if (n < 1 || n > 99) return String(n);
  if (n < 10) return DIGIT_HIRA[n];
  if (n === 10) return 'じゅう';
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const tensStr = tens === 1 ? 'じゅう' : `${DIGIT_HIRA[tens]}じゅう`;
  const onesStr = ones === 0 ? '' : DIGIT_HIRA[ones];
  return `${tensStr}${onesStr}`;
}

export function numberToKanji(n: number): string {
  if (n < 1 || n > 99) return String(n);
  if (n < 10) return DIGIT_KANJI[n];
  if (n === 10) return '十';
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const tensStr = tens === 1 ? '十' : `${DIGIT_KANJI[tens]}十`;
  const onesStr = ones === 0 ? '' : DIGIT_KANJI[ones];
  return `${tensStr}${onesStr}`;
}

/**
 * Thuật toán sinh 3 đáp án nhiễu có bẫy ngôn ngữ cho số đếm 1 - 99
 * (Đảo chục-đơn vị, bẫy 1X <-> X0, giữ chục đổi đơn vị dễ nhầm, giữ đơn vị đổi chục dễ nhầm)
 */
export function generateSmartNumberTraps(
  target: number,
  promptType: ConcretePromptType
): { distractors: number[]; trapNote: string } {
  const confMap = promptType === 'kanji' ? KANJI_CONFUSION : PHONETIC_CONFUSION;
  const picked = new Set<number>();

  const addValid = (cand: number): boolean => {
    if (cand >= 1 && cand <= 99 && cand !== target && !picked.has(cand)) {
      picked.add(cand);
      return true;
    }
    return false;
  };

  if (target < 10) {
    // Số 1 chữ số (1 - 9): bẫy sang 1X, X0 hoặc chữ/âm gần giống (7 <-> 9 <-> 10, 6 <-> 8...)
    const structPool = fisherYatesShuffle([
      10 + target,
      target * 10,
      ...(target === 7 || target === 9 || target === 1 ? [10] : []),
    ]);
    if (structPool.length > 0) addValid(structPool[0]);

    for (const d of fisherYatesShuffle(confMap[target] || [])) {
      if (picked.size >= 3) break;
      addValid(d);
    }
  } else if (target === 10) {
    // Mốc 10 (じゅう / 十): bẫy với 9 (きゅう/九), 7 (七), 20 (にじゅう), 11, 19
    const pool =
      promptType === 'kanji'
        ? [7, 9, 20, 11, 17]
        : [9, 20, 11, 19, 7];
    for (const c of fisherYatesShuffle(pool)) {
      if (picked.size >= 3) break;
      addValid(c);
    }
  } else if (target < 20) {
    // Nhóm 11 - 19 (10 + u): Bẫy số 1 là X0 (VD: 14 <-> 40) và X1 (41), tiếp theo là 1u' cùng hàng mười
    const u = target % 10;
    addValid(u * 10); // Bẫy kinh điển: 14 (じゅうよん / 十四) <-> 40 (よんじゅう / 四十)

    const sameTeen = fisherYatesShuffle(
      (confMap[u] || []).map((u2) => 10 + u2)
    );
    if (sameTeen.length > 0) addValid(sameTeen[0]);

    const thirdPool = fisherYatesShuffle([u * 10 + 1, u, 20 + u, ...sameTeen.slice(1)]);
    for (const c of thirdPool) {
      if (picked.size >= 3) break;
      addValid(c);
    }
  } else if (target % 10 === 0) {
    // Tròn chục 20, 30, ..., 90 (t * 10): Bẫy số 1 là 1t (VD: 40 <-> 14), t*10+1 (41), và t'*10
    const t = Math.floor(target / 10);
    addValid(10 + t); // 40 <-> 14

    const confTens = fisherYatesShuffle(
      (confMap[t] || []).map((t2) => t2 * 10)
    );
    if (confTens.length > 0) addValid(confTens[0]);

    const thirdPool = fisherYatesShuffle([target + 1, t, ...confTens.slice(1)]);
    for (const c of thirdPool) {
      if (picked.size >= 3) break;
      addValid(c);
    }
  } else {
    // Số 2 chữ số tổng quát (21 - 99, u != 0):
    // 1) Đảo chục <-> đơn vị (47 <-> 74)
    // 2) Giữ nguyên hàng chục, đổi đơn vị dễ nhầm (47 -> 41/48/49) -> chống nhìn chữ đầu đoán bừa
    // 3) Giữ nguyên đơn vị, đổi hàng chục dễ nhầm (47 -> 87/77/97) -> chống nhìn chữ cuối đoán bừa
    const t = Math.floor(target / 10);
    const u = target % 10;

    if (u !== t) {
      addValid(u * 10 + t);
    } else {
      // Số lặp như 22, 44, 77 -> bẫy với 40 và 14
      addValid(t * 10);
    }

    const sameTensPool = fisherYatesShuffle(
      (confMap[u] || []).map((u2) => t * 10 + u2)
    );
    if (sameTensPool.length > 0) addValid(sameTensPool[0]);

    const sameOnesPool = fisherYatesShuffle(
      (confMap[t] || []).map((t2) => t2 * 10 + u)
    );
    if (sameOnesPool.length > 0) addValid(sameOnesPool[0]);

    const backup = fisherYatesShuffle([
      ...sameTensPool.slice(1),
      ...sameOnesPool.slice(1),
      t * 10,
      10 + u,
    ]);
    for (const c of backup) {
      if (picked.size >= 3) break;
      addValid(c);
    }
  }

  // Dự phòng an toàn (luôn đảm bảo đủ đúng 3 đáp án nhiễu)
  let offset = 1;
  while (picked.size < 3) {
    if (!addValid(target + offset)) {
      addValid(target - offset);
    }
    offset++;
  }

  const hira = numberToHiragana(target);
  const kanji = numberToKanji(target);
  let trapNote = `${target} đọc là 「${hira}」 (${kanji}).`;
  if (target >= 11 && target <= 19) {
    const u = target % 10;
    trapNote = `${target} = 10 (じゅう) + ${u} (${DIGIT_HIRA[u]}) → 「${hira}」 (${kanji}). Chú ý đừng đảo nhầm thành ${u * 10} (${numberToHiragana(u * 10)} / ${numberToKanji(u * 10)})!`;
  } else if (target >= 20 && target % 10 === 0) {
    const t = Math.floor(target / 10);
    trapNote = `${target} = ${t} (${DIGIT_HIRA[t]}) × 10 (じゅう) → 「${hira}」 (${kanji}). Chú ý đừng nhầm với ${10 + t} (${numberToHiragana(10 + t)} / ${numberToKanji(10 + t)})!`;
  } else if (target > 20) {
    const t = Math.floor(target / 10);
    const u = target % 10;
    trapNote = `Tách từng vế: ${t * 10} (${DIGIT_HIRA[t]}じゅう) + ${u} (${DIGIT_HIRA[u]}) = ${target} (${kanji}). Cẩn thận bẫy đảo ngược ${u * 10 + t}!`;
  }

  return {
    distractors: Array.from(picked).slice(0, 3),
    trapNote,
  };
}

/**
 * Ngân hàng 22 mốc Đếm tuổi (1 - 10 & các số đặc biệt) kèm tập bẫy biên soạn riêng
 */
export const AGE_TRAP_BANK: AgeBankItem[] = [
  {
    value: 1,
    hira: 'いっさい',
    kanji: '一歳',
    tts: 'いっさい',
    trapPool: [8, 10, 11, 7],
    trapNote: '1 tuổi biến âm いち → いっさい. Rất dễ nghe nhầm âm ngắt っ với はっさい (8), じゅっさい (10) hoặc じゅういっさい (11).',
  },
  {
    value: 2,
    hira: 'にさい',
    kanji: '二歳',
    tts: 'にさい',
    trapPool: [12, 20, 5, 3],
    trapNote: '2 tuổi = にさい (二歳). Tránh nhầm với 12 tuổi (じゅうにさい / 十二歳) và ngoại lệ 20 tuổi (はたち).',
  },
  {
    value: 3,
    hira: 'さんさい',
    kanji: '三歳',
    tts: 'さんさい',
    trapPool: [30, 13, 6, 5],
    trapNote: '3 tuổi = さんさい (三歳). Tránh nhầm với 30 tuổi (さんじゅっさい) hoặc mặt chữ Hán 三 (3) ↔ 五 (5).',
  },
  {
    value: 4,
    hira: 'よんさい',
    kanji: '四歳',
    tts: 'よんさい',
    trapPool: [8, 14, 40, 7],
    trapNote: '4 tuổi luôn dùng よんさい (không đọc しさい). Chú ý phân biệt với 14 (じゅうよんさい) và 40 (よんじゅっさい).',
  },
  {
    value: 5,
    hira: 'ごさい',
    kanji: '五歳',
    tts: 'ごさい',
    trapPool: [15, 50, 2, 3],
    trapNote: '5 tuổi = ごさい (五歳). Phân biệt với 50 tuổi (ごじゅっさい) và chữ Hán 五 (5) ↔ 三 (3).',
  },
  {
    value: 6,
    hira: 'ろくさい',
    kanji: '六歳',
    tts: 'ろくさい',
    trapPool: [8, 16, 60, 3],
    trapNote: 'Bẫy hay sai: 6 tuổi giữ nguyên là ろくさい (KHÔNG biến âm thành ろっさい). Cẩn thận nhầm Kanji 六 (6) ↔ 八 (8)!',
  },
  {
    value: 7,
    hira: 'ななさい',
    kanji: '七歳',
    tts: 'ななさい',
    trapPool: [1, 9, 17, 70],
    trapNote: '7 tuổi dùng ななさい (七歳). Chữ Hán 七 (7) rất dễ nhìn lộn sang 九 (9) hoặc 十 (10) khi đếm ngược nhanh.',
  },
  {
    value: 8,
    hira: 'はっさい',
    kanji: '八歳',
    tts: 'はっさい',
    trapPool: [20, 1, 18, 6],
    trapNote: '8 tuổi biến âm はち → はっさい. Âm đầu 「は」 rất dễ nhầm với はたち (20 tuổi), còn Kanji 八 (8) dễ nhầm 六 (6)!',
  },
  {
    value: 9,
    hira: 'きゅうさい',
    kanji: '九歳',
    tts: 'きゅうさい',
    trapPool: [10, 19, 7, 90],
    trapNote: '9 tuổi = きゅうさい (九歳). Khi nghe nhanh rất dễ nhầm きゅうさい (9) với じゅっさい (10), và Kanji 九 (9) ↔ 七 (7).',
  },
  {
    value: 10,
    hira: 'じゅっさい',
    kanji: '十歳',
    tts: 'じゅっさい',
    trapPool: [20, 1, 11, 9],
    trapNote: '10 tuổi biến âm じゅう → じゅっさい (hoặc じっさい). Cẩn thận nhầm với 11 (じゅういっさい), 9 (きゅうさい) và 1 (いっさい).',
  },
  {
    value: 11,
    hira: 'じゅういっさい',
    kanji: '十一歳',
    tts: 'じゅういっさい',
    trapPool: [10, 21, 18, 1],
    trapNote: '11 tuổi kết thúc bằng số 1 nên biến âm → じゅういっさい. Tránh nghe lướt nhầm sang 10 (じゅっさい) hoặc 21 (にじゅういっさい)!',
  },
  {
    value: 14,
    hira: 'じゅうよんさい',
    kanji: '十四歳',
    tts: 'じゅうよんさい',
    trapPool: [40, 4, 24, 18],
    trapNote: 'Bẫy đảo thứ tự: 十四歳 = 14 tuổi (じゅうよんさい), còn 四十歳 = 40 tuổi (よんじゅっさい)!',
  },
  {
    value: 16,
    hira: 'じゅうろくさい',
    kanji: '十六歳',
    tts: 'じゅうろくさい',
    trapPool: [60, 18, 6, 26],
    trapNote: '16 tuổi = じゅうろくさい (số 6 giữ nguyên). Tránh nhầm với 18 (じゅうはっさい / 十八歳) và 60 (ろくじゅっさい).',
  },
  {
    value: 17,
    hira: 'じゅうななさい',
    kanji: '十七歳',
    tts: 'じゅうななさい',
    trapPool: [70, 11, 19, 7],
    trapNote: '17 tuổi = じゅうななさい (十七歳). Tránh đảo nhầm thành 70 (ななじゅっさい / 七十歳) hoặc nhìn lộn 十七 ↔ 十九 (19).',
  },
  {
    value: 18,
    hira: 'じゅうはっさい',
    kanji: '十八歳',
    tts: 'じゅうはっさい',
    trapPool: [80, 8, 28, 16],
    trapNote: '18 tuổi kết thúc bằng 8 nên biến âm → じゅうはっさい (十八歳). Rất dễ nhầm với 8 (はっさい), 28 (にじゅうはっさい) và Kanji 十六 (16).',
  },
  {
    value: 19,
    hira: 'じゅうきゅうさい',
    kanji: '十九歳',
    tts: 'じゅうきゅうさい',
    trapPool: [90, 9, 17, 10],
    trapNote: '19 tuổi = じゅうきゅうさい (十九歳). Đừng đảo nhầm thành 90 (きゅうじゅっさい / 九十歳) hoặc nhìn lộn 十九 ↔ 十七 (17).',
  },
  {
    value: 20,
    hira: 'はたち',
    kanji: '二十歳',
    tts: 'はたち',
    trapPool: [8, 80, 12, 2],
    trapNote: 'Ngoại lệ đặc biệt duy nhất: 20 tuổi (二十歳) đọc là 「はたち」! Đừng nghe nhầm âm đầu は sang 8 (はっさい) / 80 hoặc nhìn lộn 二十歳 ↔ 十二歳 (12)!',
  },
  {
    value: 21,
    hira: 'にじゅういっさい',
    kanji: '二十一歳',
    tts: 'にじゅういっさい',
    trapPool: [11, 20, 12, 28],
    trapNote: 'Từ 21 tuổi quay về quy tắc ghép bình thường + biến âm ở số 1: にじゅういっさい (二十一歳). Tránh nhầm với 11 (じゅういっさい) và 12 (十二歳).',
  },
  {
    value: 24,
    hira: 'にじゅうよんさい',
    kanji: '二十四歳',
    tts: 'にじゅうよんさい',
    trapPool: [42, 14, 28, 40],
    trapNote: '24 tuổi = にじゅうよんさい (二十四歳). Cẩn thận bẫy đảo chữ số 42 và nhầm với 14 (じゅうよんさい).',
  },
  {
    value: 28,
    hira: 'にじゅうはっさい',
    kanji: '二十八歳',
    tts: 'にじゅうはっさい',
    trapPool: [18, 82, 20, 26],
    trapNote: '28 tuổi biến âm ở chữ số 8 cuối → にじゅうはっさい (二十八歳). Tránh nghe lướt nhầm với 18 (じゅうはっさい)!',
  },
  {
    value: 30,
    hira: 'さんじゅっさい',
    kanji: '三十歳',
    tts: 'さんじゅっさい',
    trapPool: [13, 3, 20, 40],
    trapNote: 'Mốc tròn chục 30 tuổi biến âm じゅう → じゅっさい: さんじゅっさい (三十歳). Đừng đảo nhầm với 13 (十三歳)!',
  },
  {
    value: 40,
    hira: 'よんじゅっさい',
    kanji: '四十歳',
    tts: 'よんじゅっさい',
    trapPool: [14, 4, 80, 30],
    trapNote: 'Mốc tròn chục 40 tuổi biến âm → よんじゅっさい (四十歳). Bẫy kinh điển với 14 tuổi (十四歳 - じゅうよんさい)!',
  },
];

export function resolvePromptType(mode: PracticeMode): ConcretePromptType {
  if (mode !== 'mixed') return mode;
  const r = Math.random();
  if (r < 0.34) return 'hira';
  if (r < 0.67) return 'kanji';
  return 'audio';
}

export function buildNumberPracticeQuestion(
  target: number,
  mode: PracticeMode
): PracticeQuestion {
  const promptType = resolvePromptType(mode);
  const hira = numberToHiragana(target);
  const kanji = numberToKanji(target);
  const { distractors, trapNote } = generateSmartNumberTraps(target, promptType);

  return {
    topic: 'numbers',
    promptType,
    targetValue: target,
    hira,
    kanji,
    tts: hira,
    options: fisherYatesShuffle([target, ...distractors]),
    trapNote,
  };
}

export function buildAgePracticeQuestion(
  item: AgeBankItem,
  mode: PracticeMode
): PracticeQuestion {
  const promptType = resolvePromptType(mode);
  const distractors = fisherYatesShuffle(
    item.trapPool.filter((n) => n !== item.value)
  ).slice(0, 3);

  return {
    topic: 'age',
    promptType,
    targetValue: item.value,
    hira: item.hira,
    kanji: item.kanji,
    tts: item.hira,
    options: fisherYatesShuffle([item.value, ...distractors]),
    trapNote: item.trapNote,
  };
}
