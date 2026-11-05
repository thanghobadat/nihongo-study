export type Lesson3Topic = 'money' | 'floors';
export type Lesson3Mode = 'hira' | 'kanji' | 'audio' | 'mixed';
export type Lesson3ConcretePrompt = 'hira' | 'kanji' | 'audio';

export interface Lesson3Option {
  id: string;
  label: string;
  subLabel?: string;
}

export interface Lesson3PracticeQuestion {
  topic: Lesson3Topic;
  promptType: Lesson3ConcretePrompt;
  correctId: string;
  correctDisplay: string;
  hira: string;
  kanji: string;
  tts: string;
  options: Lesson3Option[];
  trapNote: string;
}

interface MoneyBankItem {
  yen: number;
  hira: string;
  kanji: string;
  tts: string;
  trapPool: number[];
  trapNote: string;
}

interface FloorBankItem {
  id: string;
  hira: string;
  kanji: string;
  tts: string;
  trapPool: string[];
  trapNote: string;
}

export function fisherYatesShuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function formatYenDisplay(yen: number): string {
  return `${yen.toLocaleString('en-US')}¥`;
}

export function formatFloorDisplay(id: string): { label: string; subLabel: string } {
  if (id.startsWith('B')) {
    const num = id.slice(1);
    return { label: `Hầm B${num}`, subLabel: `Tầng hầm ${num}` };
  }
  const num = id.replace('F', '');
  return { label: `Tầng ${num}`, subLabel: `${num}F` };
}

/**
 * Ngân hàng 30 mốc Tiền tệ & Số lớn thực chiến (gài bẫy 5 biến âm 300/600/800/3000/8000,
 * bẫy 6000 không biến âm, bẫy khuyết số 0 ở giữa và bẫy lệch hàng Vạn まん 4 số 0)
 */
export const MONEY_TRAP_BANK: MoneyBankItem[] = [
  {
    yen: 100,
    hira: 'ひゃくえん',
    kanji: '百円',
    tts: 'ひゃくえん',
    trapPool: [1000, 800, 600, 10],
    trapNote: '100 yên = ひゃくえん (百円) — tuyệt đối KHÔNG thêm いち thành いちひゃく!',
  },
  {
    yen: 300,
    hira: 'さんびゃくえん',
    kanji: '三百円',
    tts: 'さんびゃくえん',
    trapPool: [3000, 600, 800, 30000],
    trapNote: 'Biến âm đục hàng trăm: 300 yên = さんびゃくえん (三百円). Tránh nhầm với 3,000¥ (さんぜんえん)!',
  },
  {
    yen: 600,
    hira: 'ろっぴゃくえん',
    kanji: '六百円',
    tts: 'ろっぴゃくえん',
    trapPool: [800, 6000, 300, 100],
    trapNote: 'Biến âm っ + ぴゃく: 600 yên = ろっぴゃくえん (六百円). Rất dễ nhầm âm & chữ Hán với 800¥ (はっぴゃくえん / 八百円)!',
  },
  {
    yen: 800,
    hira: 'はっぴゃくえん',
    kanji: '八百円',
    tts: 'はっぴゃくえん',
    trapPool: [600, 8000, 100, 300],
    trapNote: 'Biến âm っ + ぴゃく: 800 yên = はっぴゃくえん (八百円). Cẩn thận nhầm với 600¥ (ろっぴゃくえん / 六百円) và 8,000¥ (はっせんえん)!',
  },
  {
    yen: 900,
    hira: 'きゅうひゃくえん',
    kanji: '九百円',
    tts: 'きゅうひゃくえん',
    trapPool: [9000, 700, 100, 990],
    trapNote: '900 yên = きゅうひゃくえん (九百円) — giữ nguyên ひゃく, không biến âm.',
  },
  {
    yen: 1000,
    hira: 'せんえん',
    kanji: '千円',
    tts: 'せんえん',
    trapPool: [10000, 100, 3000, 2000],
    trapNote: '1,000 yên đứng đầu đọc là せんえん (千円), không đọc いちせんえん. Đừng nhầm với 10,000¥ (いちまんえん)!',
  },
  {
    yen: 3000,
    hira: 'さんぜんえん',
    kanji: '三千円',
    tts: 'さんぜんえん',
    trapPool: [300, 30000, 8000, 5000],
    trapNote: 'Biến âm đục hàng nghìn: 3,000 yên = さんぜんえん (三千円 — không đọc さんせん). Cẩn thận nhầm sang 300¥ hoặc 30,000¥!',
  },
  {
    yen: 6000,
    hira: 'ろくせんえん',
    kanji: '六千円',
    tts: 'ろくせんえん',
    trapPool: [8000, 600, 60000, 3000],
    trapNote: 'Bẫy JLPT kinh điển: 6,000 yên GIỮ NGUYÊN là ろくせんえん (六千円 — không biến âm như 600 ろっぴゃく)!',
  },
  {
    yen: 8000,
    hira: 'はっせんえん',
    kanji: '八千円',
    tts: 'はっせんえん',
    trapPool: [800, 6000, 80000, 1000],
    trapNote: 'Biến âm ngắt hàng nghìn: 8,000 yên = はっせんえん (八千円). Rất dễ nhầm với 800¥ (はっぴゃくえん) và Kanji 六千円 (6,000¥)!',
  },
  {
    yen: 1600,
    hira: 'せんろっぴゃくえん',
    kanji: '千六百円',
    tts: 'せんろっぴゃくえん',
    trapPool: [1800, 16000, 6100, 600],
    trapNote: '1,600¥ = せん (1000) + ろっぴゃく (600) → 千六百円. Cẩn thận nhầm với 1,800¥ (せんはっぴゃくえん)!',
  },
  {
    yen: 2080,
    hira: 'にせんはちじゅうえん',
    kanji: '二千八十円',
    tts: 'にせんはちじゅうえん',
    trapPool: [2800, 20800, 280, 2600],
    trapNote: 'Bẫy khuyết hàng trăm: にせん (2000) + はちじゅう (80) = 2,080¥ (二千八十円), KHÔNG phải 2,800¥!',
  },
  {
    yen: 2800,
    hira: 'にせんはっぴゃくえん',
    kanji: '二千八百円',
    tts: 'にせんはっぴゃくえん',
    trapPool: [2600, 2080, 28000, 8200],
    trapNote: '2,800¥ = にせん (2000) + はっぴゃく (800) → 二千八百円. Phân biệt rõ với 2,600¥ và 2,080¥!',
  },
  {
    yen: 3600,
    hira: 'さんぜんろっぴゃくえん',
    kanji: '三千六百円',
    tts: 'さんぜんろっぴゃくえん',
    trapPool: [3800, 6300, 36000, 3060],
    trapNote: 'Biến âm kép cả nghìn lẫn trăm: さんぜん (3000) + ろっぴゃく (600) = 3,600¥ (三千六百円).',
  },
  {
    yen: 4800,
    hira: 'よんせんはっぴゃくえん',
    kanji: '四千八百円',
    tts: 'よんせんはっぴゃくえん',
    trapPool: [4600, 8400, 48000, 4080],
    trapNote: '4,800¥ = よんせん (4000) + はっぴゃく (800) → 四千八百円.',
  },
  {
    yen: 8300,
    hira: 'はっせんさんびゃくえん',
    kanji: '八千三百円',
    tts: 'はっせんさんびゃくえん',
    trapPool: [3800, 6300, 83000, 8030],
    trapNote: 'Biến âm kép: はっせん (8000) + さんびゃく (300) = 8,300¥ (八千三百円). Cẩn thận bẫy đảo ngược 3,800¥!',
  },
  {
    yen: 10000,
    hira: 'いちまんえん',
    kanji: '一万円',
    tts: 'いちまんえん',
    trapPool: [1000, 100000, 1000000, 11000],
    trapNote: 'Mốc Vạn (4 số 0): 10,000¥ BẮT BUỘC có いち → いちまんえん (一万円, 1 vạn = 10 nghìn). Tuyệt đối không nói まんえん hay じゅうせんえん!',
  },
  {
    yen: 10500,
    hira: 'いちまんごひゃくえん',
    kanji: '一万五百円',
    tts: 'いちまんごひゃくえん',
    trapPool: [15000, 1500, 105000, 10050],
    trapNote: 'Bẫy khuyết hàng nghìn cực hay nhầm khi nghe: いちまん (10,000) + ごひゃく (500) = 10,500¥ (KHÔNG phải 15,000¥)!',
  },
  {
    yen: 11000,
    hira: 'いちまんいっせんえん',
    kanji: '一万一千円',
    tts: 'いちまんいっせんえん',
    trapPool: [10100, 1100, 101000, 10000],
    trapNote: 'Khi 1,000 nằm sau hàng Vạn, người Nhật thường đọc rõ いっせん: いちまん いっせんえん = 11,000¥ (一万一千円).',
  },
  {
    yen: 12800,
    hira: 'いちまんにせんはっぴゃくえん',
    kanji: '一万二千八百円',
    tts: 'いちまんにせんはっぴゃくえん',
    trapPool: [12600, 128000, 21800, 1280],
    trapNote: 'Tách 4 số cuối (1 | 2800): 1 vạn (いちまん) + 2,800 (にせんはっぴゃく) = 12,800¥.',
  },
  {
    yen: 15000,
    hira: 'いちまんごせんえん',
    kanji: '一万五千円',
    tts: 'いちまんごせんえん',
    trapPool: [1500, 150000, 10500, 51000],
    trapNote: 'Tách 4 số cuối (1 | 5000): いちまん (10,000) + ごせん (5,000) = 15,000¥ (一万五千円). Đừng lệch số 0 sang 1,500¥ hay 150,000¥!',
  },
  {
    yen: 23000,
    hira: 'にまんさんぜんえん',
    kanji: '二万三千円',
    tts: 'にまんさんぜんえん',
    trapPool: [2300, 230000, 32000, 20300],
    trapNote: 'Tách 4 số cuối (2 | 3000): にまん (20,000) + さんぜん (3,000) = 23,000¥ (二万三千円).',
  },
  {
    yen: 38000,
    hira: 'さんまんはっせんえん',
    kanji: '三万八千円',
    tts: 'さんまんはっせんえん',
    trapPool: [3800, 380000, 30800, 36000],
    trapNote: 'Tách 4 số cuối (3 | 8000): さんまん (30,000) + はっせん (8,000) = 38,000¥ (三万八千円).',
  },
  {
    yen: 40600,
    hira: 'よんまんろっぴゃくえん',
    kanji: '四万六百円',
    tts: 'よんまんろっぴゃくえん',
    trapPool: [46000, 4600, 40800, 406000],
    trapNote: 'Bẫy khuyết hàng nghìn: よんまん (40,000) + ろっぴゃく (600) = 40,600¥ (四万六百円 — KHÔNG phải 46,000¥)!',
  },
  {
    yen: 50000,
    hira: 'ごまんえん',
    kanji: '五万円',
    tts: 'ごまんえん',
    trapPool: [5000, 500000, 500, 15000],
    trapNote: '5 vạn = 5 × 10,000 = 50,000¥ (ごまんえん / 五万円).',
  },
  {
    yen: 98000,
    hira: 'きゅうまんはっせんえん',
    kanji: '九万八千円',
    tts: 'きゅうまんはっせんえん',
    trapPool: [9800, 980000, 90800, 96000],
    trapNote: 'Tách 4 số cuối (9 | 8000): きゅうまん (90,000) + はっせん (8,000) = 98,000¥ (九万八千円).',
  },
  {
    yen: 100000,
    hira: 'じゅうまんえん',
    kanji: '十万円',
    tts: 'じゅうまんえん',
    trapPool: [10000, 1000000, 110000, 1000],
    trapNote: 'Bẫy số 1 của người Việt: 100,000¥ tách 4 số 0 là 10 | 0000 → 10 vạn = じゅうまんえん (十万円)! Đừng nhầm với 10,000¥ (いちまんえん)!',
  },
  {
    yen: 150000,
    hira: 'じゅうごまんえん',
    kanji: '十五万円',
    tts: 'じゅうごまんえん',
    trapPool: [15000, 1500000, 105000, 50000],
    trapNote: 'Tách 4 số 0 từ phải sang (15 | 0000): 15 vạn = じゅうごまんえん (十五万円) = 150,000¥!',
  },
  {
    yen: 300000,
    hira: 'さんじゅうまんえん',
    kanji: '三十万円',
    tts: 'さんじゅうまんえん',
    trapPool: [30000, 3000000, 3000, 330000],
    trapNote: 'Tách 4 số 0 (30 | 0000): 30 vạn = さんじゅうまんえん (三十万円) = 300,000¥!',
  },
  {
    yen: 800000,
    hira: 'はちじゅうまんえん',
    kanji: '八十万円',
    tts: 'はちじゅうまんえん',
    trapPool: [80000, 8000000, 8000, 600000],
    trapNote: 'Tách 4 số 0 (80 | 0000): 80 vạn = はちじゅうまんえん (八十万円) = 800,000¥ (chú ý 80 không biến âm, đọc はちじゅう)!',
  },
  {
    yen: 1000000,
    hira: 'ひゃくまんえん',
    kanji: '百万円',
    tts: 'ひゃくまんえん',
    trapPool: [100000, 10000, 10000000, 1100000],
    trapNote: '1 triệu Yên tách 4 số 0 là 100 | 0000 → 100 vạn = ひゃくまんえん (百万円)!',
  },
];

/**
 * Ngân hàng 16 mốc Đếm tầng lầu & Tầng hầm (1F - 20F & B1 - B3)
 */
export const FLOOR_TRAP_BANK: FloorBankItem[] = [
  {
    id: '1F',
    hira: 'いっかい',
    kanji: '一階',
    tts: 'いっかい',
    trapPool: ['8F', '6F', '10F', 'B1'],
    trapNote: 'Tầng 1 biến âm いち → いっかい (一階). Tránh nghe nhầm âm っ với 6F (ろっかい), 8F (はっかい) và Hầm B1 (ちかいっかい).',
  },
  {
    id: '2F',
    hira: 'にかい',
    kanji: '二階',
    tts: 'にかい',
    trapPool: ['B2', '12F', '5F', '3F'],
    trapNote: 'Tầng 2 = にかい (二階). Phân biệt với Tầng hầm B2 (ちかにかい / 地下二階) và Tầng 12 (じゅうにかい).',
  },
  {
    id: '3F',
    hira: 'さんがい',
    kanji: '三階',
    tts: 'さんがい',
    trapPool: ['B3', '13F', '6F', '5F'],
    trapNote: 'Trọng tâm JLPT N5: Tầng 3 biến âm đục thành さんがい (三階 — giống từ hỏi なんがい)! Phân biệt với Hầm B3 (ちかさんがい).',
  },
  {
    id: '4F',
    hira: 'よんかい',
    kanji: '四階',
    tts: 'よんかい',
    trapPool: ['8F', '7F', '6F', '9F'],
    trapNote: 'Tầng 4 luôn đọc よんかい (四階 — không đọc しかい).',
  },
  {
    id: '5F',
    hira: 'ごかい',
    kanji: '五階',
    tts: 'ごかい',
    trapPool: ['3F', '2F', '9F', '6F'],
    trapNote: 'Tầng 5 = ごかい (五階). Tránh nhìn nhầm chữ Hán 五 (5) ↔ 三 (3).',
  },
  {
    id: '6F',
    hira: 'ろっかい',
    kanji: '六階',
    tts: 'ろっかい',
    trapPool: ['8F', '1F', '16F', '4F'],
    trapNote: 'Tầng 6 biến âm ろく → ろっかい (六階 — khác với 6 tuổi ろくさい và 6000 ろくせん!). Rất dễ nhầm với 8F (はっかい / 八階)!',
  },
  {
    id: '7F',
    hira: 'ななかい',
    kanji: '七階',
    tts: 'ななかい',
    trapPool: ['9F', '1F', '4F', '10F'],
    trapNote: 'Tầng 7 = ななかい (七階 — không đọc しちかい). Cẩn thận nhìn nhầm Kanji 七 (7) ↔ 九 (9) ↔ 十 (10).',
  },
  {
    id: '8F',
    hira: 'はっかい',
    kanji: '八階',
    tts: 'はっかい',
    trapPool: ['6F', '1F', '18F', '4F'],
    trapNote: 'Tầng 8 biến âm はち → はっかい (八階). Rất dễ nghe và nhìn nhầm sang 6F (ろっかい / 六階) hoặc 1F (いっかい)!',
  },
  {
    id: '9F',
    hira: 'きゅうかい',
    kanji: '九階',
    tts: 'きゅうかい',
    trapPool: ['10F', '7F', '5F', '19F'],
    trapNote: 'Tầng 9 = きゅうかい (九階 — không đọc くかい). Tránh nghe nhầm với 10F (じゅっかい) và Kanji 九 ↔ 七.',
  },
  {
    id: '10F',
    hira: 'じゅっかい',
    kanji: '十階',
    tts: 'じゅっかい',
    trapPool: ['1F', '9F', '11F', '20F'],
    trapNote: 'Tầng 10 biến âm じゅう → じゅっかい (hoặc じっかい / 十階). Cẩn thận nhầm với 11F (じゅういっかい) và 20F (にじゅっかい).',
  },
  {
    id: '11F',
    hira: 'じゅういっかい',
    kanji: '十一階',
    tts: 'じゅういっかい',
    trapPool: ['10F', '1F', '18F', '16F'],
    trapNote: 'Tầng 11 kết thúc bằng 1 nên biến âm → じゅういっかい (十一階). Đừng nghe lướt thành 10F (じゅっかい)!',
  },
  {
    id: '13F',
    hira: 'じゅうさんがい',
    kanji: '十三階',
    tts: 'じゅうさんがい',
    trapPool: ['3F', 'B3', '16F', '20F'],
    trapNote: 'Tầng 13 kết thúc bằng 3 nên vẫn biến âm đục → じゅうさんがい (十三階).',
  },
  {
    id: '20F',
    hira: 'にじゅっかい',
    kanji: '二十階',
    tts: 'にじゅっかい',
    trapPool: ['12F', '10F', '2F', 'B2'],
    trapNote: 'Tầng 20 tròn chục nên biến âm → にじゅっかい (二十階). Tránh nhìn nhầm chữ Hán 二十階 (20F) ↔ 十二階 (12F)!',
  },
  {
    id: 'B1',
    hira: 'ちかいっかい',
    kanji: '地下一階',
    tts: 'ちかいっかい',
    trapPool: ['1F', 'B2', 'B3', '8F'],
    trapNote: 'ちか (地下) = Tầng hầm → ちかいっかい = Hầm B1 (Tầng hầm 1), không phải Tầng 1 (1F)!',
  },
  {
    id: 'B2',
    hira: 'ちかにかい',
    kanji: '地下二階',
    tts: 'ちかにかい',
    trapPool: ['2F', 'B1', 'B3', '12F'],
    trapNote: 'ちかにかい (地下二階) = Hầm B2 (Tầng hầm 2), phân biệt với 2F trên mặt đất (にかい).',
  },
  {
    id: 'B3',
    hira: 'ちかさんがい',
    kanji: '地下三階',
    tts: 'ちかさんがい',
    trapPool: ['3F', 'B1', 'B2', '13F'],
    trapNote: 'ちかさんがい (地下三階) = Hầm B3 (vẫn biến âm đục さんがい cho số 3!).',
  },
];

export function resolveLesson3Prompt(mode: Lesson3Mode): Lesson3ConcretePrompt {
  if (mode !== 'mixed') return mode;
  const r = Math.random();
  if (r < 0.34) return 'hira';
  if (r < 0.67) return 'kanji';
  return 'audio';
}

export function buildMoneyPracticeQuestion(
  item: MoneyBankItem,
  mode: Lesson3Mode
): Lesson3PracticeQuestion {
  const promptType = resolveLesson3Prompt(mode);
  const distractors = fisherYatesShuffle(
    item.trapPool.filter((v) => v !== item.yen)
  ).slice(0, 3);

  const rawValues = fisherYatesShuffle([item.yen, ...distractors]);
  const options: Lesson3Option[] = rawValues.map((val) => ({
    id: String(val),
    label: formatYenDisplay(val),
  }));

  return {
    topic: 'money',
    promptType,
    correctId: String(item.yen),
    correctDisplay: formatYenDisplay(item.yen),
    hira: item.hira,
    kanji: item.kanji,
    tts: item.tts,
    options,
    trapNote: item.trapNote,
  };
}

export function buildFloorPracticeQuestion(
  item: FloorBankItem,
  mode: Lesson3Mode
): Lesson3PracticeQuestion {
  const promptType = resolveLesson3Prompt(mode);
  const distractors = fisherYatesShuffle(
    item.trapPool.filter((f) => f !== item.id)
  ).slice(0, 3);

  const rawIds = fisherYatesShuffle([item.id, ...distractors]);
  const options: Lesson3Option[] = rawIds.map((fid) => {
    const formatted = formatFloorDisplay(fid);
    return {
      id: fid,
      label: formatted.label,
      subLabel: formatted.subLabel,
    };
  });

  const correctFmt = formatFloorDisplay(item.id);

  return {
    topic: 'floors',
    promptType,
    correctId: item.id,
    correctDisplay: `${correctFmt.label} (${correctFmt.subLabel})`,
    hira: item.hira,
    kanji: item.kanji,
    tts: item.tts,
    options,
    trapNote: item.trapNote,
  };
}

