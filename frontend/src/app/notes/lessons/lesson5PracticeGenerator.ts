export type Lesson5Topic = 'dates_combined' | 'particles';
export type Lesson5Mode = 'hira' | 'kanji' | 'mixed';
export type Lesson5ConcretePrompt = 'hira' | 'kanji';

export interface Lesson5Option {
  id: string;
  label: string;
  subLabel?: string;
}

export interface Lesson5PracticeQuestion {
  topic: Lesson5Topic;
  promptType: Lesson5ConcretePrompt;
  badgeText: string;
  badgeTone: 'indigo' | 'amber' | 'emerald' | 'rose';
  promptMain: string;
  promptSub: string;
  contextHint: string;
  ttsFullAnswer: string;
  correctId: string;
  correctDisplay: string;
  fullExplanationTitle: string;
  fullExplanationSub: string;
  options: Lesson5Option[];
  trapNote: string;
}

export interface CombinedDateBankItem {
  id: string;
  month: number;
  day: number;
  kanjiDate: string; // e.g. '4月20日'
  vnDate: string; // e.g. 'Ngày 20/04'
  monthHira: string; // e.g. 'しがつ'
  dayHira: string; // e.g. 'はつか'
  fullHira: string; // e.g. 'しがつ はつか'
  ttsText: string; // e.g. 'しがつはつか'
  hiraTraps: [string, string, string];
  dateTraps: [
    { kanji: string; vn: string },
    { kanji: string; vn: string },
    { kanji: string; vn: string },
  ];
  trapNote: string;
}

interface ParticlePair {
  id: string;
  hira: string;
  kanji: string;
}

export interface ParticleBankItem {
  id: string;
  categoryBadge: string;
  badgeTone: 'indigo' | 'amber' | 'emerald' | 'rose';
  promptHira: string;
  promptKanji: string;
  vnMeaning: string;
  ttsFullAnswer: string;
  fullSentenceKanji: string;
  fullSentenceHira: string;
  correct: ParticlePair;
  traps: [ParticlePair, ParticlePair, ParticlePair];
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

function resolvePromptType(mode: Lesson5Mode): Lesson5ConcretePrompt {
  if (mode !== 'mixed') return mode;
  return Math.random() < 0.5 ? 'hira' : 'kanji';
}

/**
 * Ngân hàng 36 tổ hợp Ngày + Tháng kết hợp (1月1日 – 12月31日)
 * Phủ kín 12 tháng (đặc biệt xoáy sâu 4月 しがつ, 7月 しちがつ, 9月 くがつ)
 * và toàn bộ các ngày đặc biệt (1日–10日, 14日, 17日, 19日, 20日, 24日, 27日, 29日, 30日, 31日).
 */
export const COMBINED_DATE_TRAP_BANK: CombinedDateBankItem[] = [
  {
    id: 'd_01_01',
    month: 1,
    day: 1,
    kanjiDate: '1月1日',
    vnDate: 'Ngày 01/01',
    monthHira: 'いちがつ',
    dayHira: 'ついたち',
    fullHira: 'いちがつ ついたち',
    ttsText: 'いちがつついたち',
    hiraTraps: ['いちがつ いちにち', 'いちがつ ふつか', 'しちがつ ついたち'],
    dateTraps: [
      { kanji: '1月2日', vn: 'Ngày 02/01' },
      { kanji: '1月11日', vn: 'Ngày 11/01' },
      { kanji: '7月1日', vn: 'Ngày 01/07' },
    ],
    trapNote:
      '1月 = いちがつ; Mùng 1 của tháng bắt buộc đọc là ついたち (1日), KHÔNG đọc いちにち (いちにち mang nghĩa "1 ngày" về thời lượng).',
  },
  {
    id: 'd_04_20',
    month: 4,
    day: 20,
    kanjiDate: '4月20日',
    vnDate: 'Ngày 20/04',
    monthHira: 'しがつ',
    dayHira: 'はつか',
    fullHira: 'しがつ はつか',
    ttsText: 'しがつはつか',
    hiraTraps: ['よんがつ はつか', 'しがつ にじゅうにち', 'しがつ ふつか'],
    dateTraps: [
      { kanji: '4月2日', vn: 'Ngày 02/04' },
      { kanji: '4月12日', vn: 'Ngày 12/04' },
      { kanji: '7月20日', vn: 'Ngày 20/07' },
    ],
    trapNote:
      'Bẫy kép kinh điển: Tháng 4 = しがつ (cấm よんがつ) + Ngày 20 = はつか (cấm にじゅうにち, và tránh nhầm với Mùng 2 ふつか).',
  },
  {
    id: 'd_07_04',
    month: 7,
    day: 4,
    kanjiDate: '7月4日',
    vnDate: 'Ngày 04/07',
    monthHira: 'しちがつ',
    dayHira: 'よっか',
    fullHira: 'しちがつ よっか',
    ttsText: 'しちがつよっか',
    hiraTraps: ['なながつ よっか', 'しちがつ ようか', 'しちがつ よんにち'],
    dateTraps: [
      { kanji: '7月8日', vn: 'Ngày 08/07' },
      { kanji: '4月7日', vn: 'Ngày 07/04' },
      { kanji: '7月14日', vn: 'Ngày 14/07' },
    ],
    trapNote:
      'Tháng 7 = しちがつ (cấm なながつ) + Mùng 4 = よっか (âm ngắt っ, cực dễ nhầm với Mùng 8 ようか!).',
  },
  {
    id: 'd_09_08',
    month: 9,
    day: 8,
    kanjiDate: '9月8日',
    vnDate: 'Ngày 08/09',
    monthHira: 'くがつ',
    dayHira: 'ようか',
    fullHira: 'くがつ ようか',
    ttsText: 'くがつようか',
    hiraTraps: ['きゅうがつ ようか', 'くがつ よっか', 'くがつ はちにち'],
    dateTraps: [
      { kanji: '9月4日', vn: 'Ngày 04/09' },
      { kanji: '8月9日', vn: 'Ngày 09/08' },
      { kanji: '9月18日', vn: 'Ngày 18/09' },
    ],
    trapNote:
      'Tháng 9 = くがつ (cấm きゅうがつ) + Mùng 8 = ようか (trường âm う, phân biệt rõ với Mùng 4 よっか).',
  },
  {
    id: 'd_02_02',
    month: 2,
    day: 2,
    kanjiDate: '2月2日',
    vnDate: 'Ngày 02/02',
    monthHira: 'にがつ',
    dayHira: 'ふつか',
    fullHira: 'にがつ ふつか',
    ttsText: 'にがつふつか',
    hiraTraps: ['にがつ はつか', 'にがつ ににち', 'にがつ みっか'],
    dateTraps: [
      { kanji: '2月20日', vn: 'Ngày 20/02' },
      { kanji: '2月3日', vn: 'Ngày 03/02' },
      { kanji: '2月12日', vn: 'Ngày 12/02' },
    ],
    trapNote:
      '2月2日 = にがつ ふつか (Mùng 2 = ふつか, tránh nhầm với Ngày 20 = はつか).',
  },
  {
    id: 'd_03_03',
    month: 3,
    day: 3,
    kanjiDate: '3月3日',
    vnDate: 'Ngày 03/03',
    monthHira: 'さんがつ',
    dayHira: 'みっか',
    fullHira: 'さんがつ みっか',
    ttsText: 'さんがつみっか',
    hiraTraps: ['さんがつ むいか', 'さんがつ さんにち', 'さんがつ ふつか'],
    dateTraps: [
      { kanji: '3月6日', vn: 'Ngày 06/03' },
      { kanji: '3月2日', vn: 'Ngày 02/03' },
      { kanji: '3月13日', vn: 'Ngày 13/03' },
    ],
    trapNote:
      '3月3日 = さんがつ みっか (Mùng 3 có âm ngắt っ = みっか, khác với Mùng 6 = むいか).',
  },
  {
    id: 'd_04_08',
    month: 4,
    day: 8,
    kanjiDate: '4月8日',
    vnDate: 'Ngày 08/04',
    monthHira: 'しがつ',
    dayHira: 'ようか',
    fullHira: 'しがつ ようか',
    ttsText: 'しがつようか',
    hiraTraps: ['よんがつ ようか', 'しがつ よっか', 'はちがつ よっか'],
    dateTraps: [
      { kanji: '4月4日', vn: 'Ngày 04/04' },
      { kanji: '8月4日', vn: 'Ngày 04/08' },
      { kanji: '7月8日', vn: 'Ngày 08/07' },
    ],
    trapNote:
      '4月8日 (Ngày 8 tháng 4) = しがつ ようか. Chú ý tiếng Nhật đọc Tháng trước – Ngày sau (đừng nhầm ngược thành 8月4日!).',
  },
  {
    id: 'd_08_04',
    month: 8,
    day: 4,
    kanjiDate: '8月4日',
    vnDate: 'Ngày 04/08',
    monthHira: 'はちがつ',
    dayHira: 'よっか',
    fullHira: 'はちがつ よっか',
    ttsText: 'はちがつよっか',
    hiraTraps: ['はちがつ ようか', 'しがつ ようか', 'はちがつ よんにち'],
    dateTraps: [
      { kanji: '8月8日', vn: 'Ngày 08/08' },
      { kanji: '4月8日', vn: 'Ngày 08/04' },
      { kanji: '8月14日', vn: 'Ngày 14/08' },
    ],
    trapNote:
      '8月4日 (Ngày 4 tháng 8) = はちがつ よっか. Đừng bị chữ 8 (はち) đánh lừa sang ようか (Mùng 8)!',
  },
  {
    id: 'd_05_05',
    month: 5,
    day: 5,
    kanjiDate: '5月5日',
    vnDate: 'Ngày 05/05',
    monthHira: 'ごがつ',
    dayHira: 'いつか',
    fullHira: 'ごがつ いつか',
    ttsText: 'ごがついつか',
    hiraTraps: ['ごがつ ごにち', 'ごがつ むいか', 'ごがつ ふつか'],
    dateTraps: [
      { kanji: '5月6日', vn: 'Ngày 06/05' },
      { kanji: '5月15日', vn: 'Ngày 15/05' },
      { kanji: '5月2日', vn: 'Ngày 02/05' },
    ],
    trapNote:
      '5月5日 = ごがつ いつか (Mùng 5 đọc là いつか, dễ liên tưởng từ để hỏi いつ = khi nào).',
  },
  {
    id: 'd_06_06',
    month: 6,
    day: 6,
    kanjiDate: '6月6日',
    vnDate: 'Ngày 06/06',
    monthHira: 'ろくがつ',
    dayHira: 'むいか',
    fullHira: 'ろくがつ むいか',
    ttsText: 'ろくがつむいか',
    hiraTraps: ['ろくがつ みっか', 'ろくがつ ろくにち', 'ろくがつ なのか'],
    dateTraps: [
      { kanji: '6月3日', vn: 'Ngày 03/06' },
      { kanji: '6月7日', vn: 'Ngày 07/06' },
      { kanji: '6月16日', vn: 'Ngày 16/06' },
    ],
    trapNote:
      '6月6日 = ろくがつ むいか (Mùng 6 = むいか, tránh nhầm với Mùng 3 みっか và Mùng 7 なのか).',
  },
  {
    id: 'd_07_07',
    month: 7,
    day: 7,
    kanjiDate: '7月7日',
    vnDate: 'Ngày 07/07',
    monthHira: 'しちがつ',
    dayHira: 'なのか',
    fullHira: 'しちがつ なのか',
    ttsText: 'しちがつなのか',
    hiraTraps: ['なながつ なのか', 'しちがつ しちにち', 'しちがつ むいか'],
    dateTraps: [
      { kanji: '7月6日', vn: 'Ngày 06/07' },
      { kanji: '7月17日', vn: 'Ngày 17/07' },
      { kanji: '1月7日', vn: 'Ngày 07/01' },
    ],
    trapNote:
      '7月7日 (Lễ Thất tịch Tanabata): Tháng 7 = しちがつ (âm Hán) nhưng Mùng 7 = なのか (âm thuần Nhật)!',
  },
  {
    id: 'd_09_09',
    month: 9,
    day: 9,
    kanjiDate: '9月9日',
    vnDate: 'Ngày 09/09',
    monthHira: 'くがつ',
    dayHira: 'ここのか',
    fullHira: 'くがつ ここのか',
    ttsText: 'くがつここのか',
    hiraTraps: ['きゅうがつ ここのか', 'くがつ くにち', 'くがつ とおか'],
    dateTraps: [
      { kanji: '9月10日', vn: 'Ngày 10/09' },
      { kanji: '9月19日', vn: 'Ngày 19/09' },
      { kanji: '5月9日', vn: 'Ngày 09/05' },
    ],
    trapNote:
      '9月9日: Tháng 9 = くがつ (cấm きゅうがつ) + Mùng 9 = ここのか (4 âm tiết, tránh nhầm với Mùng 10 とおか).',
  },
  {
    id: 'd_10_10',
    month: 10,
    day: 10,
    kanjiDate: '10月10日',
    vnDate: 'Ngày 10/10',
    monthHira: 'じゅうがつ',
    dayHira: 'とおか',
    fullHira: 'じゅうがつ とおか',
    ttsText: 'じゅうがつとおか',
    hiraTraps: ['じゅうがつ じゅうにち', 'じゅうがつ ここのか', 'じゅうがつ はつか'],
    dateTraps: [
      { kanji: '10月20日', vn: 'Ngày 20/10' },
      { kanji: '10月9日', vn: 'Ngày 09/10' },
      { kanji: '10月4日', vn: 'Ngày 04/10' },
    ],
    trapNote:
      '10月10日 = じゅうがつ とおか (Mùng 10 đọc là とおか — có chữ お ở sau と, không đọc じゅうにち!).',
  },
  {
    id: 'd_04_14',
    month: 4,
    day: 14,
    kanjiDate: '4月14日',
    vnDate: 'Ngày 14/04',
    monthHira: 'しがつ',
    dayHira: 'じゅうよっか',
    fullHira: 'しがつ じゅうよっか',
    ttsText: 'しがつじゅうよっか',
    hiraTraps: ['よんがつ じゅうよっか', 'しがつ じゅうよんにち', 'しがつ よっか'],
    dateTraps: [
      { kanji: '4月4日', vn: 'Ngày 04/04' },
      { kanji: '4月24日', vn: 'Ngày 24/04' },
      { kanji: '7月14日', vn: 'Ngày 14/07' },
    ],
    trapNote:
      '4月14日 = しがつ じゅうよっか (Tháng 4 = しがつ + Ngày 14 = じゅう + よっか, cấm đọc じゅうよんにち!).',
  },
  {
    id: 'd_07_20',
    month: 7,
    day: 20,
    kanjiDate: '7月20日',
    vnDate: 'Ngày 20/07',
    monthHira: 'しちがつ',
    dayHira: 'はつか',
    fullHira: 'しちがつ はつか',
    ttsText: 'しちがつはつか',
    hiraTraps: ['なながつ はつか', 'しちがつ にじゅうにち', 'しちがつ ふつか'],
    dateTraps: [
      { kanji: '7月2日', vn: 'Ngày 02/07' },
      { kanji: '4月20日', vn: 'Ngày 20/04' },
      { kanji: '1月20日', vn: 'Ngày 20/01' },
    ],
    trapNote:
      '7月20日 = しちがつ はつか (Tháng 7 = しちがつ + Ngày 20 = はつか, ngoại lệ đặc biệt nhất từ 11–31).',
  },
  {
    id: 'd_09_24',
    month: 9,
    day: 24,
    kanjiDate: '9月24日',
    vnDate: 'Ngày 24/09',
    monthHira: 'くがつ',
    dayHira: 'にじゅうよっか',
    fullHira: 'くがつ にじゅうよっか',
    ttsText: 'くがつにじゅうよっか',
    hiraTraps: ['きゅうがつ にじゅうよっか', 'くがつ にじゅうよんにち', 'くがつ じゅうよっか'],
    dateTraps: [
      { kanji: '9月14日', vn: 'Ngày 14/09' },
      { kanji: '9月4日', vn: 'Ngày 04/09' },
      { kanji: '4月24日', vn: 'Ngày 24/04' },
    ],
    trapNote:
      '9月24日 = くがつ にじゅうよっか (Tháng 9 = くがつ + Ngày 24 kết thúc bằng 4 nên ghép にじゅう + よっか).',
  },
  {
    id: 'd_12_24',
    month: 12,
    day: 24,
    kanjiDate: '12月24日',
    vnDate: 'Ngày 24/12',
    monthHira: 'じゅうにがつ',
    dayHira: 'にじゅうよっか',
    fullHira: 'じゅうにがつ にじゅうよっか',
    ttsText: 'じゅうにがつにじゅうよっか',
    hiraTraps: ['じゅうにがつ にじゅうよんにち', 'じゅうにがつ じゅうよっか', 'にがつ にじゅうよっか'],
    dateTraps: [
      { kanji: '12月14日', vn: 'Ngày 14/12' },
      { kanji: '2月24日', vn: 'Ngày 24/02' },
      { kanji: '12月4日', vn: 'Ngày 04/12' },
    ],
    trapNote:
      '12月24日 (Đêm Giáng sinh) = じゅうにがつ にじゅうよっか (nhớ Ngày 4, 14, 24 luôn có đuôi よっか).',
  },
  {
    id: 'd_08_17',
    month: 8,
    day: 17,
    kanjiDate: '8月17日',
    vnDate: 'Ngày 17/08',
    monthHira: 'はちがつ',
    dayHira: 'じゅうしちにち',
    fullHira: 'はちがつ じゅうしちにち',
    ttsText: 'はちがつじゅうしちにち',
    hiraTraps: ['はちがつ じゅうなのか', 'はちがつ なのか', 'しちがつ じゅうはちにち'],
    dateTraps: [
      { kanji: '8月7日', vn: 'Ngày 07/08' },
      { kanji: '7月18日', vn: 'Ngày 18/07' },
      { kanji: '8月27日', vn: 'Ngày 27/08' },
    ],
    trapNote:
      '8月17日 = はちがつ じゅうしちにち (Ngày 17 dùng しちにち, KHÔNG dùng じゅうなのか!).',
  },
  {
    id: 'd_11_19',
    month: 11,
    day: 19,
    kanjiDate: '11月19日',
    vnDate: 'Ngày 19/11',
    monthHira: 'じゅういちがつ',
    dayHira: 'じゅうくにち',
    fullHira: 'じゅういちがつ じゅうくにち',
    ttsText: 'じゅういちがつじゅうくにち',
    hiraTraps: ['じゅういちがつ じゅうきゅうにち', 'じゅういちがつ ここのか', 'いちがつ じゅうくにち'],
    dateTraps: [
      { kanji: '11月9日', vn: 'Ngày 09/11' },
      { kanji: '11月29日', vn: 'Ngày 29/11' },
      { kanji: '1月19日', vn: 'Ngày 19/01' },
    ],
    trapNote:
      '11月19日 = じゅういちがつ じゅうくにち (Ngày 19 và 29 đọc số 9 là くにち, không đọc きゅうにち).',
  },
  {
    id: 'd_04_01',
    month: 4,
    day: 1,
    kanjiDate: '4月1日',
    vnDate: 'Ngày 01/04',
    monthHira: 'しがつ',
    dayHira: 'ついたち',
    fullHira: 'しがつ ついたち',
    ttsText: 'しがつついたち',
    hiraTraps: ['よんがつ ついたち', 'しがつ いちにち', 'しちがつ ついたち'],
    dateTraps: [
      { kanji: '7月1日', vn: 'Ngày 01/07' },
      { kanji: '1月4日', vn: 'Ngày 04/01' },
      { kanji: '4月11日', vn: 'Ngày 11/04' },
    ],
    trapNote:
      '4月1日 (Cá tháng Tư) = しがつ ついたち (Tháng 4 = しがつ + Mùng 1 = ついたち).',
  },
  {
    id: 'd_09_20',
    month: 9,
    day: 20,
    kanjiDate: '9月20日',
    vnDate: 'Ngày 20/09',
    monthHira: 'くがつ',
    dayHira: 'はつか',
    fullHira: 'くがつ はつか',
    ttsText: 'くがつはつか',
    hiraTraps: ['きゅうがつ はつか', 'くがつ ふつか', 'くがつ にじゅうにち'],
    dateTraps: [
      { kanji: '9月2日', vn: 'Ngày 02/09' },
      { kanji: '9月10日', vn: 'Ngày 10/09' },
      { kanji: '5月20日', vn: 'Ngày 20/05' },
    ],
    trapNote:
      '9月20日 = くがつ はつか (Tháng 9 = くがつ + Ngày 20 = はつか, cẩn thận nhầm với 9月2日 くがつ ふつか).',
  },
  {
    id: 'd_09_02',
    month: 9,
    day: 2,
    kanjiDate: '9月2日',
    vnDate: 'Ngày 02/09',
    monthHira: 'くがつ',
    dayHira: 'ふつか',
    fullHira: 'くがつ ふつか',
    ttsText: 'くがつふつか',
    hiraTraps: ['きゅうがつ ふつか', 'くがつ はつか', 'くがつ ににち'],
    dateTraps: [
      { kanji: '9月20日', vn: 'Ngày 20/09' },
      { kanji: '2月9日', vn: 'Ngày 09/02' },
      { kanji: '9月3日', vn: 'Ngày 03/09' },
    ],
    trapNote:
      '9月2日 (Quốc khánh 2/9) = くがつ ふつか (Tháng 9 = くがつ + Mùng 2 = ふつか, ngược thứ tự với tiếng Việt).',
  },
  {
    id: 'd_04_30',
    month: 4,
    day: 30,
    kanjiDate: '4月30日',
    vnDate: 'Ngày 30/04',
    monthHira: 'しがつ',
    dayHira: 'さんじゅうにち',
    fullHira: 'しがつ さんじゅうにち',
    ttsText: 'しがつさんじゅうにち',
    hiraTraps: ['よんがつ さんじゅうにち', 'しがつ みっか', 'しちがつ さんじゅうにち'],
    dateTraps: [
      { kanji: '4月3日', vn: 'Ngày 03/04' },
      { kanji: '7月30日', vn: 'Ngày 30/07' },
      { kanji: '4月13日', vn: 'Ngày 13/04' },
    ],
    trapNote:
      '4月30日 (Giải phóng 30/4) = しがつ さんじゅうにち (Tháng 4 = しがつ; Ngày 30 đọc bình thường là さんじゅうにち).',
  },
  {
    id: 'd_05_01',
    month: 5,
    day: 1,
    kanjiDate: '5月1日',
    vnDate: 'Ngày 01/05',
    monthHira: 'ごがつ',
    dayHira: 'ついたち',
    fullHira: 'ごがつ ついたち',
    ttsText: 'ごがつついたち',
    hiraTraps: ['ごがつ いちにち', 'ごがつ いつか', 'いちがつ いつか'],
    dateTraps: [
      { kanji: '1月5日', vn: 'Ngày 05/01' },
      { kanji: '5月5日', vn: 'Ngày 05/05' },
      { kanji: '5月11日', vn: 'Ngày 11/05' },
    ],
    trapNote:
      '5月1日 (Quốc tế Lao động 1/5) = ごがつ ついたち. Tránh nhầm ngược thành 1月5日 (いちがつ いつか)!',
  },
  {
    id: 'd_03_08',
    month: 3,
    day: 8,
    kanjiDate: '3月8日',
    vnDate: 'Ngày 08/03',
    monthHira: 'さんがつ',
    dayHira: 'ようか',
    fullHira: 'さんがつ ようか',
    ttsText: 'さんがつようか',
    hiraTraps: ['さんがつ よっか', 'さんがつ はちにち', 'はちがつ みっか'],
    dateTraps: [
      { kanji: '3月4日', vn: 'Ngày 04/03' },
      { kanji: '8月3日', vn: 'Ngày 03/08' },
      { kanji: '3月18日', vn: 'Ngày 18/03' },
    ],
    trapNote:
      '3月8日 (Ngày 8/3) = さんがつ ようか. Tránh nhầm ngược thành 8月3日 (はちがつ みっか) hoặc Mùng 4 (よっか)!',
  },
  {
    id: 'd_10_20',
    month: 10,
    day: 20,
    kanjiDate: '10月20日',
    vnDate: 'Ngày 20/10',
    monthHira: 'じゅうがつ',
    dayHira: 'はつか',
    fullHira: 'じゅうがつ はつか',
    ttsText: 'じゅうがつはつか',
    hiraTraps: ['じゅうがつ とおか', 'じゅうがつ ふつか', 'じゅうがつ にじゅうにち'],
    dateTraps: [
      { kanji: '10月10日', vn: 'Ngày 10/10' },
      { kanji: '10月2日', vn: 'Ngày 02/10' },
      { kanji: '12月10日', vn: 'Ngày 10/12' },
    ],
    trapNote:
      '10月20日 (Ngày 20/10) = じゅうがつ はつか (phân biệt rõ Ngày 20 はつか với Ngày 10 とおか và Ngày 2 ふつか).',
  },
  {
    id: 'd_11_20',
    month: 11,
    day: 20,
    kanjiDate: '11月20日',
    vnDate: 'Ngày 20/11',
    monthHira: 'じゅういちがつ',
    dayHira: 'はつか',
    fullHira: 'じゅういちがつ はつか',
    ttsText: 'じゅういちがつはつか',
    hiraTraps: ['じゅういちがつ にじゅうにち', 'じゅういちがつ ふつか', 'いちがつ はつか'],
    dateTraps: [
      { kanji: '11月2日', vn: 'Ngày 02/11' },
      { kanji: '1月20日', vn: 'Ngày 20/01' },
      { kanji: '11月12日', vn: 'Ngày 12/11' },
    ],
    trapNote:
      '11月20日 (Ngày Nhà giáo 20/11) = じゅういちがつ はつか.',
  },
  {
    id: 'd_02_14',
    month: 2,
    day: 14,
    kanjiDate: '2月14日',
    vnDate: 'Ngày 14/02',
    monthHira: 'にがつ',
    dayHira: 'じゅうよっか',
    fullHira: 'にがつ じゅうよっか',
    ttsText: 'にがつじゅうよっか',
    hiraTraps: ['にがつ じゅうよんにち', 'にがつ よっか', 'にがつ にじゅうよっか'],
    dateTraps: [
      { kanji: '2月4日', vn: 'Ngày 04/02' },
      { kanji: '2月24日', vn: 'Ngày 24/02' },
      { kanji: '12月14日', vn: 'Ngày 14/12' },
    ],
    trapNote:
      '2月14日 (Valentine 14/2) = にがつ じゅうよっか (Ngày 14 bắt buộc đọc là じゅうよっか).',
  },
  {
    id: 'd_06_01',
    month: 6,
    day: 1,
    kanjiDate: '6月1日',
    vnDate: 'Ngày 01/06',
    monthHira: 'ろくがつ',
    dayHira: 'ついたち',
    fullHira: 'ろくがつ ついたち',
    ttsText: 'ろくがつついたち',
    hiraTraps: ['ろくがつ いちにち', 'ろくがつ むいか', 'いちがつ むいか'],
    dateTraps: [
      { kanji: '1月6日', vn: 'Ngày 06/01' },
      { kanji: '6月6日', vn: 'Ngày 06/06' },
      { kanji: '6月11日', vn: 'Ngày 11/06' },
    ],
    trapNote:
      '6月1日 (Quốc tế Thiếu nhi 1/6) = ろくがつ ついたち. Tránh đọc ngược theo tiếng Việt thành 1月6日 (いちがつ むいか)!',
  },
  {
    id: 'd_01_06',
    month: 1,
    day: 6,
    kanjiDate: '1月6日',
    vnDate: 'Ngày 06/01',
    monthHira: 'いちがつ',
    dayHira: 'むいか',
    fullHira: 'いちがつ むいか',
    ttsText: 'いちがつむいか',
    hiraTraps: ['いちがつ なのか', 'いちがつ みっか', 'ろくがつ ついたち'],
    dateTraps: [
      { kanji: '6月1日', vn: 'Ngày 01/06' },
      { kanji: '1月7日', vn: 'Ngày 07/01' },
      { kanji: '1月3日', vn: 'Ngày 03/01' },
    ],
    trapNote:
      '1月6日 (Ngày 6 tháng 1) = いちがつ むいか (Mùng 6 = むいか, khác Mùng 7 = なのか và Mùng 3 = みっか).',
  },
  {
    id: 'd_07_14',
    month: 7,
    day: 14,
    kanjiDate: '7月14日',
    vnDate: 'Ngày 14/07',
    monthHira: 'しちがつ',
    dayHira: 'じゅうよっか',
    fullHira: 'しちがつ じゅうよっか',
    ttsText: 'しちがつじゅうよっか',
    hiraTraps: ['なながつ じゅうよっか', 'しちがつ じゅうよんにち', 'しがつ じゅうよっか'],
    dateTraps: [
      { kanji: '4月14日', vn: 'Ngày 14/04' },
      { kanji: '7月24日', vn: 'Ngày 24/07' },
      { kanji: '7月4日', vn: 'Ngày 04/07' },
    ],
    trapNote:
      '7月14日 = しちがつ じゅうよっか (Tháng 7 = しちがつ, dễ nhầm âm với Tháng 4 しがつ + Ngày 14 = じゅうよっか).',
  },
  {
    id: 'd_07_27',
    month: 7,
    day: 27,
    kanjiDate: '7月27日',
    vnDate: 'Ngày 27/07',
    monthHira: 'しちがつ',
    dayHira: 'にじゅうしちにち',
    fullHira: 'しちがつ にじゅうしちにち',
    ttsText: 'しちがつにじゅうしちにち',
    hiraTraps: ['なながつ にじゅうななにち', 'しちがつ にじゅうなのか', 'しちがつ じゅうしちにち'],
    dateTraps: [
      { kanji: '7月17日', vn: 'Ngày 17/07' },
      { kanji: '7月7日', vn: 'Ngày 07/07' },
      { kanji: '4月27日', vn: 'Ngày 27/04' },
    ],
    trapNote:
      '7月27日 = しちがつ にじゅうしちにち (Ngày 17 và 27 dùng しちにち, KHÔNG dùng なのか).',
  },
  {
    id: 'd_09_29',
    month: 9,
    day: 29,
    kanjiDate: '9月29日',
    vnDate: 'Ngày 29/09',
    monthHira: 'くがつ',
    dayHira: 'にじゅうくにち',
    fullHira: 'くがつ にじゅうくにち',
    ttsText: 'くがつにじゅうくにち',
    hiraTraps: ['きゅうがつ にじゅうきゅうにち', 'くがつ にじゅうここのか', 'くがつ じゅうくにち'],
    dateTraps: [
      { kanji: '9月19日', vn: 'Ngày 19/09' },
      { kanji: '9月9日', vn: 'Ngày 09/09' },
      { kanji: '5月29日', vn: 'Ngày 29/05' },
    ],
    trapNote:
      '9月29日 = くがつ にじゅうくにち (Tháng 9 = くがつ; Ngày 29 đọc số 9 là くにち, không dùng ここのか).',
  },
  {
    id: 'd_08_10',
    month: 8,
    day: 10,
    kanjiDate: '8月10日',
    vnDate: 'Ngày 10/08',
    monthHira: 'はちがつ',
    dayHira: 'とおか',
    fullHira: 'はちがつ とおか',
    ttsText: 'はちがつとおか',
    hiraTraps: ['はちがつ ようか', 'はちがつ じゅうにち', 'はちがつ はつか'],
    dateTraps: [
      { kanji: '8月8日', vn: 'Ngày 08/08' },
      { kanji: '8月20日', vn: 'Ngày 20/08' },
      { kanji: '10月8日', vn: 'Ngày 08/10' },
    ],
    trapNote:
      '8月10日 (Ngày 10 tháng 8) = はちがつ とおか (Mùng 10 = とおか, tránh nhầm với Mùng 8 ようか và Ngày 20 はつか).',
  },
  {
    id: 'd_10_08',
    month: 10,
    day: 8,
    kanjiDate: '10月8日',
    vnDate: 'Ngày 08/10',
    monthHira: 'じゅうがつ',
    dayHira: 'ようか',
    fullHira: 'じゅうがつ ようか',
    ttsText: 'じゅうがつようか',
    hiraTraps: ['じゅうがつ よっか', 'じゅうがつ とおか', 'はちがつ とおか'],
    dateTraps: [
      { kanji: '8月10日', vn: 'Ngày 10/08' },
      { kanji: '10月4日', vn: 'Ngày 04/10' },
      { kanji: '10月10日', vn: 'Ngày 10/10' },
    ],
    trapNote:
      '10月8日 (Ngày 8 tháng 10) = じゅうがつ ようか. Tránh đảo ngược thành 8月10日 (はちがつ とおか)!',
  },
  {
    id: 'd_12_31',
    month: 12,
    day: 31,
    kanjiDate: '12月31日',
    vnDate: 'Ngày 31/12',
    monthHira: 'じゅうにがつ',
    dayHira: 'さんじゅういちにち',
    fullHira: 'じゅうにがつ さんじゅういちにち',
    ttsText: 'じゅうにがつさんじゅういちにち',
    hiraTraps: ['じゅうにがつ さんじゅうついたち', 'じゅうにがつ にじゅういちにち', 'じゅういちがつ さんじゅういちにち'],
    dateTraps: [
      { kanji: '12月21日', vn: 'Ngày 21/12' },
      { kanji: '11月30日', vn: 'Ngày 30/11' },
      { kanji: '12月13日', vn: 'Ngày 13/12' },
    ],
    trapNote:
      '12月31日 = じゅうにがつ さんじゅういちにち. Chỉ riêng Mùng 1 mới đọc là ついたち; còn 11日, 21日, 31日 đều đọc là ～いちにち!',
  },
];

/**
 * Ngân hàng 24 câu trắc nghiệm Trợ từ di chuyển (へ・で・と・に・も) & Ngoại lệ Bài 5
 * Tập trung xoáy sâu vào: 歩いて (cấm で), 一人で (cấm と), どこへも + V-ません, Ngày cụ thể có に vs Mốc tương đối không có に.
 */
export const PARTICLE_TRAP_BANK: ParticleBankItem[] = [
  {
    id: 'p1',
    categoryBadge: '⚠️ Ngoại lệ Đi bộ',
    badgeTone: 'rose',
    promptHira: 'わたしは まいにち あるいて 【 ？ 】 がっこうへ いきます。',
    promptKanji: 'わたしは 毎日 歩いて 【 ？ 】 学校へ 行きます。',
    vnMeaning: 'Mỗi ngày tôi đi bộ đến trường.',
    ttsFullAnswer: 'わたしは まいにち あるいて がっこうへ いきます。',
    fullSentenceKanji: 'わたしは 毎日 歩いて 学校へ 行きます。',
    fullSentenceHira: 'わたしは まいにち あるいて がっこうへ いきます。',
    correct: { id: 'none', hira: '∅ (Không dùng trợ từ)', kanji: '∅ (Không dùng trợ từ)' },
    traps: [
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
      { id: 'to', hira: 'と', kanji: 'と' },
    ],
    trapNote:
      'Ngoại lệ số 1 Bài 5: 歩いて (あるいて - đi bộ) bản thân đã là động từ chia thể て nên TUYỆT ĐỐI KHÔNG thêm trợ từ で ở sau!',
  },
  {
    id: 'p2',
    categoryBadge: '⚠️ Ngoại lệ Một mình',
    badgeTone: 'rose',
    promptHira: 'せんげつ ひとり 【 ？ 】 にほんへ きました。',
    promptKanji: '先月 一人 【 ？ 】 日本へ 来ました。',
    vnMeaning: 'Tháng trước tôi đã đến Nhật Bản một mình.',
    ttsFullAnswer: 'せんげつ ひとりで にほんへ きました。',
    fullSentenceKanji: '先月 一人で 日本へ 来ました。',
    fullSentenceHira: 'せんげつ ひとりで にほんへ きました。',
    correct: { id: 'de', hira: 'で (ひとりで)', kanji: 'で (一人で)' },
    traps: [
      { id: 'to', hira: 'と (ひとりと)', kanji: 'と (一人と)' },
      { id: 'ni', hira: 'に (ひとりに)', kanji: 'に (一人に)' },
      { id: 'none', hira: '∅ (Không dùng trợ từ)', kanji: '∅ (Không dùng trợ từ)' },
    ],
    trapNote:
      'Ngoại lệ số 2 Bài 5: Đi một mình bắt buộc dùng 一人で (ひとりで — trạng thái thực hiện hành động), TUYỆT ĐỐI KHÔNG dùng trợ từ と!',
  },
  {
    id: 'p3',
    categoryBadge: '👥 Đi cùng ai (と)',
    badgeTone: 'emerald',
    promptHira: 'にちようびに かぞく 【 ？ 】 デパートへ いきました。',
    promptKanji: '日曜日に 家族 【 ？ 】 デパートへ 行きました。',
    vnMeaning: 'Chủ nhật tôi đã đi trung tâm thương mại cùng với gia đình.',
    ttsFullAnswer: 'にちようびに かぞくと デパートへ いきました。',
    fullSentenceKanji: '日曜日に 家族と デパートへ 行きました。',
    fullSentenceHira: 'にちようびに かぞくと デパートへ いきました。',
    correct: { id: 'to', hira: 'と', kanji: 'と' },
    traps: [
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
      { id: 'ni', hira: 'に', kanji: 'に' },
    ],
    trapNote:
      'Danh từ chỉ người (家族 - gia đình) + と = thực hiện hành động cùng với ai (家族と 行きました).',
  },
  {
    id: 'p4',
    categoryBadge: '🚄 Phương tiện (で)',
    badgeTone: 'indigo',
    promptHira: 'まいあさ でんしゃ 【 ？ 】 かいしゃへ いきます。',
    promptKanji: '毎朝 電車 【 ？ 】 会社へ 行きます。',
    vnMeaning: 'Mỗi sáng tôi đi đến công ty bằng tàu điện.',
    ttsFullAnswer: 'まいあさ でんしゃで かいしゃへ いきます。',
    fullSentenceKanji: '毎朝 電車で 会社へ 行きます。',
    fullSentenceHira: 'まいあさ でんしゃで かいしゃへ いきます。',
    correct: { id: 'de', hira: 'で', kanji: 'で' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
      { id: 'to', hira: 'と', kanji: 'と' },
    ],
    trapNote:
      'Phương tiện giao thông (電車 - tàu điện) + で = di chuyển bằng phương tiện gì.',
  },
  {
    id: 'p5',
    categoryBadge: '🧭 Hướng di chuyển (へ)',
    badgeTone: 'indigo',
    promptHira: 'らいねん くに 【 ？ 】 かえります。',
    promptKanji: '来年 国 【 ？ 】 帰ります。',
    vnMeaning: 'Năm sau tôi sẽ về nước.',
    ttsFullAnswer: 'らいねん くにへ かえります。',
    fullSentenceKanji: '来年 国へ 帰ります。',
    fullSentenceHira: 'らいねん くにへ かえります。',
    correct: { id: 'he', hira: 'へ (đọc là え)', kanji: 'へ (đọc là え)' },
    traps: [
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'to', hira: 'と', kanji: 'と' },
      { id: 'wo', hira: 'を', kanji: 'を' },
    ],
    trapNote:
      'Địa điểm (国 - đất nước) + へ + 行きます / 来ます / 帰ります = chỉ hướng di chuyển.',
  },
  {
    id: 'p6',
    categoryBadge: '🚫 Phủ định tuyệt đối (どこへも)',
    badgeTone: 'rose',
    promptHira: 'きのうは どこ 【 ？ 】 いきませんでした。',
    promptKanji: '昨日は どこ 【 ？ 】 行きませんでした。',
    vnMeaning: 'Hôm qua tôi đã không đi đâu cả.',
    ttsFullAnswer: 'きのうは どこへも いきませんでした。',
    fullSentenceKanji: '昨日は どこへも 行きませんでした。',
    fullSentenceHira: 'きのうは どこへも いきませんでした。',
    correct: { id: 'hemo', hira: 'へも (hoặc も)', kanji: 'へも (hoặc も)' },
    traps: [
      { id: 'he', hira: 'へ', kanji: 'へ' },
      { id: 'hewa', hira: 'へは', kanji: 'へは' },
      { id: 'de', hira: 'で', kanji: 'で' },
    ],
    trapNote:
      'Công thức phủ định hoàn toàn: どこへも (hoặc どこも) + 行きません / 行きませんでした = Không đi đâu cả.',
  },
  {
    id: 'p7',
    categoryBadge: '📅 Ngày cụ thể (Có に)',
    badgeTone: 'amber',
    promptHira: '4がつ 20か 【 ？ 】 にほんへ きました。',
    promptKanji: '4月20日 【 ？ 】 日本へ 来ました。',
    vnMeaning: 'Tôi đã đến Nhật Bản vào ngày 20 tháng 4.',
    ttsFullAnswer: 'しがつはつかに にほんへ きました。',
    fullSentenceKanji: '4月20日に 日本へ 来ました。',
    fullSentenceHira: '4がつ 20かに にほんへ きました。',
    correct: { id: 'ni', hira: 'に', kanji: 'に' },
    traps: [
      { id: 'none', hira: '∅ (Không dùng trợ từ)', kanji: '∅ (Không dùng trợ từ)' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
    ],
    trapNote:
      'Mốc thời gian chứa con số cụ thể (4月20日 - ngày 20 tháng 4) BẮT BUỘC thêm trợ từ に phía sau!',
  },
  {
    id: 'p8',
    categoryBadge: '⏳ Thời gian tương đối (Cấm に)',
    badgeTone: 'amber',
    promptHira: 'らいげつ 【 ？ 】 くにへ かえります。',
    promptKanji: '来月 【 ？ 】 国へ 帰ります。',
    vnMeaning: 'Tháng sau tôi sẽ về nước.',
    ttsFullAnswer: 'らいげつ くにへ かえります。',
    fullSentenceKanji: '来月 国へ 帰ります。',
    fullSentenceHira: 'らいげつ くにへ かえります。',
    correct: { id: 'none', hira: '∅ (Không dùng に)', kanji: '∅ (Không dùng に)' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
    ],
    trapNote:
      'Các từ chỉ thời gian tương đối (きのう, きょう, あした, せんしゅう, らいげつ, きょねん, らいねん...) KHÔNG đi kèm trợ từ に!',
  },
  {
    id: 'p9',
    categoryBadge: '⏳ Từ để hỏi いつ (Cấm に)',
    badgeTone: 'amber',
    promptHira: 'ミラーさんは いつ 【 ？ 】 にほんへ きましたか。',
    promptKanji: 'ミラーさんは いつ 【 ？ 】 日本へ 来ましたか。',
    vnMeaning: 'Anh Miller đã đến Nhật Bản khi nào?',
    ttsFullAnswer: 'ミラーさんは いつ にほんへ きましたか。',
    fullSentenceKanji: 'ミラーさんは いつ 日本へ 来ましたか。',
    fullSentenceHira: 'ミラーさんは いつ にほんへ きましたか。',
    correct: { id: 'none', hira: '∅ (Không dùng に)', kanji: '∅ (Không dùng に)' },
    traps: [
      { id: 'ni', hira: 'に (いつに)', kanji: 'に (いつに)' },
      { id: 'de', hira: 'で (いつで)', kanji: 'で (いつで)' },
      { id: 'he', hira: 'へ (いつへ)', kanji: 'へ (いつへ)' },
    ],
    trapNote:
      'Từ để hỏi thời gian いつ (khi nào) đứng độc lập, TUYỆT ĐỐI KHÔNG thêm trợ từ に thành ❌ いつに!',
  },
  {
    id: 'p10',
    categoryBadge: '❓ Hỏi phương tiện (何で)',
    badgeTone: 'indigo',
    promptHira: 'あなたも 【 ？ 】 かいしゃへ いきますか。 ── バスで いきます。',
    promptKanji: 'あなたも 【 ？ 】 会社へ 行きますか。 ── バスで 行きます。',
    vnMeaning: 'Bạn đi đến công ty bằng gì? ── Tôi đi bằng xe buýt.',
    ttsFullAnswer: 'あなたも なんで かいしゃへ いきますか。 バスで いきます。',
    fullSentenceKanji: 'あなたも 何で 会社へ 行きますか。 ── バスで 行きます。',
    fullSentenceHira: 'あなたも なんで かいしゃへ いきますか。 ── バスで いきます。',
    correct: { id: 'nande', hira: 'なんで', kanji: '何で (なんで)' },
    traps: [
      { id: 'dareto', hira: 'だれと', kanji: 'だれと' },
      { id: 'dokohe', hira: 'どこへ', kanji: 'どこへ' },
      { id: 'itsu', hira: 'いつ', kanji: 'いつ' },
    ],
    trapNote:
      'Câu trả lời là "バスで (bằng xe buýt)" → Câu hỏi phương tiện phải dùng 何で (なんで = bằng cái gì).',
  },
  {
    id: 'p11',
    categoryBadge: '❓ Hỏi người đi cùng (だれと)',
    badgeTone: 'emerald',
    promptHira: '【 ？ 】 ひろしまへ いきますか。 ── ともだちと いきます。',
    promptKanji: '【 ？ 】 広島へ 行きますか。 ── 友達と 行きます。',
    vnMeaning: 'Bạn đi Hiroshima với ai? ── Tôi đi với bạn bè.',
    ttsFullAnswer: 'だれと ひろしまへ いきますか。 ともだちと いきます。',
    fullSentenceKanji: 'だれと 広島へ 行きますか。 ── 友達と 行きます。',
    fullSentenceHira: 'だれと ひろしまへ いきますか。 ── ともだちと いきます。',
    correct: { id: 'dareto', hira: 'だれと', kanji: 'だれと' },
    traps: [
      { id: 'nande', hira: 'なんで', kanji: '何で' },
      { id: 'dokohe', hira: 'どこへ', kanji: 'どこへ' },
      { id: 'darede', hira: 'だれで', kanji: 'だれで' },
    ],
    trapNote:
      'Câu trả lời là "友達と (cùng với bạn)" → Câu hỏi người đi cùng phải dùng だれと (cùng với ai).',
  },
  {
    id: 'p12',
    categoryBadge: '⚠️ Bẫy Đáp câu hỏi だれと',
    badgeTone: 'rose',
    promptHira: 'だれと にほんへ きましたか。 ── 【 ？ 】 きました。',
    promptKanji: 'だれと 日本へ 来ましたか。 ── 【 ？ 】 来ました。',
    vnMeaning: 'Bạn đã đến Nhật với ai? ── Tôi đến một mình.',
    ttsFullAnswer: 'だれと にほんへ きましたか。 ひとりで きました。',
    fullSentenceKanji: 'だれと 日本へ 来ましたか。 ── 一人で 来ました。',
    fullSentenceHira: 'だれと にほんへ きましたか。 ── ひとりで きました。',
    correct: { id: 'hitoride', hira: 'ひとりで', kanji: '一人で' },
    traps: [
      { id: 'hitorito', hira: 'ひとりと', kanji: '一人と' },
      { id: 'hitorini', hira: 'ひとりに', kanji: '一人に' },
      { id: 'hitorihe', hira: 'ひとりへ', kanji: '一人へ' },
    ],
    trapNote:
      'Dù câu hỏi là だれと (đi với ai), khi trả lời "Đi một mình" vẫn bắt buộc đổi sang 一人で (ひとりで), cấm lặp lại と thành ❌ 一人と!',
  },
  {
    id: 'p13',
    categoryBadge: '⚠️ Bẫy Đáp câu hỏi 何で',
    badgeTone: 'rose',
    promptHira: 'なんで えきへ いきますか。 ── 【 ？ 】 いきます。',
    promptKanji: '何で 駅へ 行きますか。 ── 【 ？ 】 行きます。',
    vnMeaning: 'Bạn đi đến nhà ga bằng gì? ── Tôi đi bộ đến.',
    ttsFullAnswer: 'なんで えきへ いきますか。 あるいて いきます。',
    fullSentenceKanji: '何で 駅へ 行きますか。 ── 歩いて 行きます。',
    fullSentenceHira: 'なんで えきへ いきますか。 ── あるいて いきます。',
    correct: { id: 'aruite', hira: 'あるいて', kanji: '歩いて' },
    traps: [
      { id: 'aruitede', hira: 'あるいてで', kanji: '歩いてで' },
      { id: 'aruiteto', hira: 'あるいてと', kanji: '歩いてと' },
      { id: 'aruiteni', hira: 'あるいてに', kanji: '歩いてに' },
    ],
    trapNote:
      'Dù câu hỏi là 何で (bằng phương tiện gì), khi trả lời "Đi bộ" chỉ dùng 歩いて (あるいて), tuyệt đối cấm thêm で thành ❌ 歩いてで!',
  },
  {
    id: 'p14',
    categoryBadge: '✈️ Phương tiện (飛行機で)',
    badgeTone: 'indigo',
    promptHira: 'せんしゅう ひこうき 【 ？ 】 とうきょうへ いきました。',
    promptKanji: '先週 飛行機 【 ？ 】 東京へ 行きました。',
    vnMeaning: 'Tuần trước tôi đã đi Tokyo bằng máy bay.',
    ttsFullAnswer: 'せんしゅう ひこうきで とうきょうへ いきました。',
    fullSentenceKanji: '先週 飛行機で 東京へ 行きました。',
    fullSentenceHira: 'せんしゅう ひこうきで とうきょうへ いきました。',
    correct: { id: 'de', hira: 'で', kanji: 'で' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
      { id: 'to', hira: 'と', kanji: 'と' },
    ],
    trapNote:
      '飛行機 (ひこうき - máy bay) là phương tiện di chuyển → dùng trợ từ で (飛行機で).',
  },
  {
    id: 'p15',
    categoryBadge: '🚢 Phương tiện (船で)',
    badgeTone: 'indigo',
    promptHira: 'ふね 【 ？ 】 くにへ かえります。',
    promptKanji: '船 【 ？ 】 国へ 帰ります。',
    vnMeaning: 'Tôi về nước bằng tàu thủy.',
    ttsFullAnswer: 'ふねで くにへ かえります。',
    fullSentenceKanji: '船で 国へ 帰ります。',
    fullSentenceHira: 'ふねで くにへ かえります。',
    correct: { id: 'de', hira: 'で', kanji: 'で' },
    traps: [
      { id: 'to', hira: 'と', kanji: 'と' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
      { id: 'ni', hira: 'に', kanji: 'に' },
    ],
    trapNote:
      '船 (ふね - tàu thủy) là phương tiện → dùng trợ từ で (船で). Quốc gia (国) là đích đến → dùng へ (国へ).',
  },
  {
    id: 'p16',
    categoryBadge: '👥 Đi cùng ai (彼女と)',
    badgeTone: 'emerald',
    promptHira: 'きのう かのじょ 【 ？ 】 びじゅつかんへ いきました。',
    promptKanji: '昨日 彼女 【 ？ 】 美術館へ 行きました。',
    vnMeaning: 'Hôm qua tôi đã đi bảo tàng mỹ thuật với bạn gái.',
    ttsFullAnswer: 'きのう かのじょと びじゅつかんへ いきました。',
    fullSentenceKanji: '昨日 彼女と 美術館へ 行きました。',
    fullSentenceHira: 'きのう かのじょと びじゅつかんへ いきました。',
    correct: { id: 'to', hira: 'と', kanji: 'と' },
    traps: [
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
    ],
    trapNote:
      '彼女 (かのじょ - bạn gái) là người đi cùng → dùng trợ từ と (彼女と).',
  },
  {
    id: 'p17',
    categoryBadge: '📅 Ngày tháng cụ thể (Có に)',
    badgeTone: 'amber',
    promptHira: '7がつ 15にち 【 ？ 】 なつやすみです / くにへ かえります。',
    promptKanji: '7月15日 【 ？ 】 国へ 帰ります。',
    vnMeaning: 'Vào ngày 15 tháng 7 tôi sẽ về nước.',
    ttsFullAnswer: 'しちがつじゅうごにちに くにへ かえります。',
    fullSentenceKanji: '7月15日に 国へ 帰ります。',
    fullSentenceHira: '7がつ 15にちに くにへ かえります。',
    correct: { id: 'ni', hira: 'に', kanji: 'に' },
    traps: [
      { id: 'none', hira: '∅ (Không dùng に)', kanji: '∅ (Không dùng に)' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'to', hira: 'と', kanji: 'と' },
    ],
    trapNote:
      '7月15日 (ngày 15 tháng 7) là ngày cụ thể có số → dùng trợ từ に để chỉ thời điểm hành động diễn ra.',
  },
  {
    id: 'p18',
    categoryBadge: '⏳ Thời gian tương đối (Cấm に)',
    badgeTone: 'amber',
    promptHira: 'あした 【 ？ 】 ともだちと スーパーへ いきます。',
    promptKanji: '明日 【 ？ 】 友達と スーパーへ 行きます。',
    vnMeaning: 'Ngày mai tôi sẽ đi siêu thị cùng với bạn.',
    ttsFullAnswer: 'あした ともだちと スーパーへ いきます。',
    fullSentenceKanji: '明日 友達と スーパーへ 行きます。',
    fullSentenceHira: 'あした ともだちと スーパーへ いきます。',
    correct: { id: 'none', hira: '∅ (Không dùng に)', kanji: '∅ (Không dùng に)' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
    ],
    trapNote:
      '明日 (あした - ngày mai) là mốc thời gian tương đối, tuyệt đối KHÔNG thêm trợ từ に!',
  },
  {
    id: 'p19',
    categoryBadge: '⏳ Năm ngoái きょねん (Cấm に)',
    badgeTone: 'amber',
    promptHira: 'きょねん 【 ？ 】 にほんへ きました。',
    promptKanji: '去年 【 ？ 】 日本へ 来ました。',
    vnMeaning: 'Năm ngoái tôi đã đến Nhật Bản.',
    ttsFullAnswer: 'きょねん にほんへ きました。',
    fullSentenceKanji: '去年 日本へ 来ました。',
    fullSentenceHira: 'きょねん にほんへ きました。',
    correct: { id: 'none', hira: '∅ (Không dùng に)', kanji: '∅ (Không dùng に)' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'no', hira: 'の', kanji: 'の' },
    ],
    trapNote:
      '去年 (きょねん - năm ngoái) đứng một mình là mốc tương đối → KHÔNG thêm に (trừ khi nối "Tháng 3 năm ngoái" = 去年の 3月に).',
  },
  {
    id: 'p20',
    categoryBadge: '🔗 Kết hợp Năm + Ngày tháng',
    badgeTone: 'amber',
    promptHira: 'らいねん 【 ？ 】 1がつ 8かに くにへ かえります。',
    promptKanji: '来年 【 ？ 】 1月8日に 国へ 帰ります。',
    vnMeaning: 'Ngày 8 tháng 1 năm sau tôi sẽ về nước.',
    ttsFullAnswer: 'らいねんの いちがつようかに くにへ かえります。',
    fullSentenceKanji: '来年の 1月8日に 国へ 帰ります。',
    fullSentenceHira: 'らいねんの 1がつ 8かに くにへ かえります。',
    correct: { id: 'no', hira: 'の', kanji: 'の' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'to', hira: 'と', kanji: 'と' },
      { id: 'de', hira: 'で', kanji: 'で' },
    ],
    trapNote:
      'Khi ghép danh từ thời gian lớn (来年 - năm sau) với ngày/tháng cụ thể (1月8日), dùng trợ từ の ở giữa: 来年の 1月8日に!',
  },
  {
    id: 'p21',
    categoryBadge: '🚫 Phủ định tuyệt đối + Quá khứ',
    badgeTone: 'rose',
    promptHira: 'せんしゅうの にちようびは どこへも 【 ？ 】。',
    promptKanji: '先週の 日曜日は どこへも 【 ？ 】。',
    vnMeaning: 'Chủ nhật tuần trước tôi đã không đi đâu cả.',
    ttsFullAnswer: 'せんしゅうの にちようびは どこへも いきませんでした。',
    fullSentenceKanji: '先週の 日曜日は どこへも 行きませんでした。',
    fullSentenceHira: 'せんしゅうの にちようびは どこへも いきませんでした。',
    correct: {
      id: 'ikimasendeshita',
      hira: 'いきませんでした',
      kanji: '行きませんでした',
    },
    traps: [
      { id: 'ikimashita', hira: 'いきました', kanji: '行きました' },
      { id: 'ikimasen', hira: 'いきません', kanji: '行きません' },
      { id: 'ikimasu', hira: 'いきます', kanji: '行きます' },
    ],
    trapNote:
      'どこへも bắt buộc đi với động từ PHỦ ĐỊNH + 先週の日曜日 (Chủ nhật tuần trước = Quá khứ) → 行きませんでした!',
  },
  {
    id: 'p22',
    categoryBadge: '🚄 Loại tàu & Sân ga (～番線)',
    badgeTone: 'indigo',
    promptHira: 'すみません、つぎの ふつうは 【 ？ 】 ですか。 ── 3ばんせんです。',
    promptKanji: 'すみません、次の 普通は 【 ？ 】 ですか。 ── 3番線です。',
    vnMeaning: 'Xin lỗi, chuyến tàu thường tiếp theo ở sân ga số mấy? ── Sân ga số 3.',
    ttsFullAnswer: 'すみません、つぎの ふつうは なんばんせんですか。 さんばんせんです。',
    fullSentenceKanji: 'すみません、次の 普通は 何番線ですか。 ── 3番線です。',
    fullSentenceHira: 'すみません、つぎの ふつうは なんばんせんですか。 ── 3ばんせんです。',
    correct: { id: 'nanbansen', hira: 'なんばんせん', kanji: '何番線 (なんばんせん)' },
    traps: [
      { id: 'nangai', hira: 'なんがい', kanji: '何階 (なんがい)' },
      { id: 'nanban', hira: 'なんばん', kanji: '何番 (なんばん)' },
      { id: 'nande', hira: 'なんで', kanji: '何で (なんで)' },
    ],
    trapNote:
      'Hỏi sân ga (đường ray số mấy) dùng 何番線 (なんばんせん) → trả lời ～番線 (～ばんせん). Đừng nhầm với 何階 (なんがい - tầng mấy)!',
  },
  {
    id: 'p23',
    categoryBadge: '🚲 Phương tiện + Đích đến',
    badgeTone: 'indigo',
    promptHira: 'じてんしゃ 【 ① 】 としょかん 【 ② 】 いきました。',
    promptKanji: '自転車 【 ① 】 図書館 【 ② 】 行きました。',
    vnMeaning: 'Tôi đã đi đến thư viện bằng xe đạp.',
    ttsFullAnswer: 'じてんしゃで としょかんへ いきました。',
    fullSentenceKanji: '自転車で 図書館へ 行きました。',
    fullSentenceHira: 'じてんしゃで としょかんへ いきました。',
    correct: { id: 'de_he', hira: '① で ／ ② へ', kanji: '① で ／ ② へ' },
    traps: [
      { id: 'he_de', hira: '① へ ／ ② で', kanji: '① へ ／ ② で' },
      { id: 'to_he', hira: '① と ／ ② へ', kanji: '① と ／ ② へ' },
      { id: 'ni_de', hira: '① に ／ ② で', kanji: '① に ／ ② で' },
    ],
    trapNote:
      '自転車 (xe đạp = phương tiện) đi với で; 図書館 (thư viện = đích đến) đi với へ → 自転車で 図書館へ 行きました.',
  },
  {
    id: 'p24',
    categoryBadge: '👨‍👩‍👧 Người đi cùng + Phương tiện',
    badgeTone: 'emerald',
    promptHira: 'ともだち 【 ① 】 ちかてつ 【 ② 】 きょうとへ いきます。',
    promptKanji: '友達 【 ① 】 地下鉄 【 ② 】 京都へ 行きます。',
    vnMeaning: 'Tôi đi Kyoto với bạn bằng tàu điện ngầm.',
    ttsFullAnswer: 'ともだちと ちかてつで きょうとへ いきます。',
    fullSentenceKanji: '友達と 地下鉄で 京都へ 行きます。',
    fullSentenceHira: 'ともだちと 地下鉄で 京都へ 行きます。',
    correct: { id: 'to_de', hira: '① と ／ ② で', kanji: '① と ／ ② で' },
    traps: [
      { id: 'de_to', hira: '① で ／ ② と', kanji: '① で ／ ② と' },
      { id: 'to_he', hira: '① と ／ ② へ', kanji: '① と ／ ② へ' },
      { id: 'ni_de', hira: '① に ／ ② で', kanji: '① に ／ ② で' },
    ],
    trapNote:
      '友達 (bạn bè = người đi cùng) + と; 地下鉄 (tàu điện ngầm = phương tiện) + で → 友達と 地下鉄で 京都へ 行きます.',
  },
];

export function buildCombinedDatePracticeQuestion(
  item: CombinedDateBankItem,
  mode: Lesson5Mode
): Lesson5PracticeQuestion {
  const promptType = resolvePromptType(mode);

  if (promptType === 'kanji') {
    // Chiều 1: Nhìn Ngày/Tháng (4月20日 • Ngày 20/04) -> Chọn cách đọc Hiragana đúng
    const rawOptions: Lesson5Option[] = [
      { id: 'correct', label: item.fullHira },
      { id: 'trap_1', label: item.hiraTraps[0] },
      { id: 'trap_2', label: item.hiraTraps[1] },
      { id: 'trap_3', label: item.hiraTraps[2] },
    ];

    return {
      topic: 'dates_combined',
      promptType: 'kanji',
      badgeText: '📅 Nhìn Ngày/Tháng → Chọn cách đọc Hiragana',
      badgeTone: 'indigo',
      promptMain: item.kanjiDate,
      promptSub: `${item.vnDate} (Tháng ${item.month} • Ngày ${item.day})`,
      contextHint: 'Chọn cách đọc kết hợp [Tháng + Ngày] chuẩn xác nhất:',
      ttsFullAnswer: item.ttsText,
      correctId: 'correct',
      correctDisplay: item.fullHira,
      fullExplanationTitle: `${item.kanjiDate} ＝ ${item.fullHira}`,
      fullExplanationSub: `${item.vnDate} • Tháng: ${item.monthHira} (${item.month}月) + Ngày: ${item.dayHira} (${item.day}日)`,
      options: fisherYatesShuffle(rawOptions),
      trapNote: item.trapNote,
    };
  } else {
    // Chiều 2: Nhìn Hiragana (しがつ はつか) -> Chọn Ngày/Tháng đúng
    const rawOptions: Lesson5Option[] = [
      { id: 'correct', label: item.kanjiDate, subLabel: item.vnDate },
      { id: 'trap_1', label: item.dateTraps[0].kanji, subLabel: item.dateTraps[0].vn },
      { id: 'trap_2', label: item.dateTraps[1].kanji, subLabel: item.dateTraps[1].vn },
      { id: 'trap_3', label: item.dateTraps[2].kanji, subLabel: item.dateTraps[2].vn },
    ];

    return {
      topic: 'dates_combined',
      promptType: 'hira',
      badgeText: 'あ Nhìn Hiragana → Chọn Ngày & Tháng',
      badgeTone: 'amber',
      promptMain: item.fullHira,
      promptSub: `Tháng (${item.monthHira}) đứng trước • Ngày (${item.dayHira}) đứng sau`,
      contextHint: 'Tổ hợp Hiragana trên tương ứng với ngày tháng nào?',
      ttsFullAnswer: item.ttsText,
      correctId: 'correct',
      correctDisplay: `${item.kanjiDate} (${item.vnDate})`,
      fullExplanationTitle: `${item.fullHira} ＝ ${item.kanjiDate}`,
      fullExplanationSub: `${item.vnDate} • Tháng ${item.month} (${item.monthHira}) + Ngày ${item.day} (${item.dayHira})`,
      options: fisherYatesShuffle(rawOptions),
      trapNote: item.trapNote,
    };
  }
}

export function buildParticlePracticeQuestion(
  item: ParticleBankItem,
  mode: Lesson5Mode
): Lesson5PracticeQuestion {
  const promptType = resolvePromptType(mode);
  const rawOptions: Lesson5Option[] = [
    {
      id: item.correct.id,
      label: promptType === 'hira' ? item.correct.hira : item.correct.kanji,
    },
    ...item.traps.map((t) => ({
      id: t.id,
      label: promptType === 'hira' ? t.hira : t.kanji,
    })),
  ];

  const correctDisplay = promptType === 'hira' ? item.correct.hira : item.correct.kanji;

  return {
    topic: 'particles',
    promptType,
    badgeText: item.categoryBadge,
    badgeTone: item.badgeTone,
    promptMain: promptType === 'hira' ? item.promptHira : item.promptKanji,
    promptSub: `Nghĩa: "${item.vnMeaning}"`,
    contextHint: 'Chọn trợ từ hoặc cụm từ đúng để điền vào 【 ？ 】:',
    ttsFullAnswer: item.ttsFullAnswer,
    correctId: item.correct.id,
    correctDisplay,
    fullExplanationTitle: item.fullSentenceKanji,
    fullExplanationSub: `${item.fullSentenceHira} (${item.vnMeaning})`,
    options: fisherYatesShuffle(rawOptions),
    trapNote: item.trapNote,
  };
}

