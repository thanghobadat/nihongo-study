'use client';

import React, { useCallback, useRef, useState } from 'react';
import Lesson5PracticeArena from './Lesson5PracticeArena';
import { Lesson5Topic } from './lesson5PracticeGenerator';

interface MonthItem {
  month: number;
  kanji: string;
  reading: string;
  special?: boolean;
  caution?: string;
}

interface SpecialDayItem {
  day: string;
  kanji: string;
  reading: string;
  tts: string;
  group: 'kun_1_10' | 'special_11_31';
  highlightTone: 'rose' | 'amber' | 'indigo';
  note: string;
}

interface CombinedDateExample {
  kanji: string;
  vn: string;
  monthPart: string;
  dayPart: string;
  fullReading: string;
  tts: string;
  trapTip: string;
}

interface ParticleRuleRow {
  id: string;
  particleBadge: string;
  roleTitle: string;
  questionWord: string;
  formula: string;
  exampleKanji: string;
  exampleHira: string;
  exampleTts: string;
  exampleVn: string;
  exceptionTitle: string;
  exceptionGoodKanji: string;
  exceptionGoodHira: string;
  exceptionGoodTts: string;
  exceptionBad: string;
  exceptionNote: string;
}

const MONTH_LIST: MonthItem[] = [
  { month: 1, kanji: '1月', reading: 'いちがつ' },
  { month: 2, kanji: '2月', reading: 'にがつ' },
  { month: 3, kanji: '3月', reading: 'さんがつ' },
  {
    month: 4,
    kanji: '4月',
    reading: 'しがつ',
    special: true,
    caution: '❌ Cấm đọc よんがつ',
  },
  { month: 5, kanji: '5月', reading: 'ごがつ' },
  { month: 6, kanji: '6月', reading: 'ろくがつ' },
  {
    month: 7,
    kanji: '7月',
    reading: 'しちがつ',
    special: true,
    caution: '❌ Cấm đọc なながつ',
  },
  { month: 8, kanji: '8月', reading: 'はちがつ' },
  {
    month: 9,
    kanji: '9月',
    reading: 'くがつ',
    special: true,
    caution: '❌ Cấm đọc きゅうがつ',
  },
  { month: 10, kanji: '10月', reading: 'じゅうがつ' },
  { month: 11, kanji: '11月', reading: 'じゅういちがつ' },
  { month: 12, kanji: '12月', reading: 'じゅうにがつ' },
];

const KUN_DAYS_1_TO_10: SpecialDayItem[] = [
  {
    day: 'Mùng 1',
    kanji: '1日',
    reading: 'ついたち',
    tts: 'ついたち',
    group: 'kun_1_10',
    highlightTone: 'rose',
    note: 'Mùng 1 đầu tháng = ついたち (khác với "1 ngày" thời lượng = いちにち).',
  },
  {
    day: 'Mùng 2',
    kanji: '2日',
    reading: 'ふつか',
    tts: 'ふつか',
    group: 'kun_1_10',
    highlightTone: 'amber',
    note: 'Cặp dễ nhầm: 2日 (ふつか) ↔ 20日 (はつか).',
  },
  {
    day: 'Mùng 3',
    kanji: '3日',
    reading: 'みっか',
    tts: 'みっか',
    group: 'kun_1_10',
    highlightTone: 'indigo',
    note: 'Có âm ngắt っ (みっか), tránh nhầm với Mùng 6 (むいか).',
  },
  {
    day: 'Mùng 4',
    kanji: '4日',
    reading: 'よっか',
    tts: 'よっか',
    group: 'kun_1_10',
    highlightTone: 'rose',
    note: 'Bẫy số 1 JLPT: 4日 = よっか (âm ngắt っ) ↔ 8日 = ようか (trường âm う).',
  },
  {
    day: 'Mùng 5',
    kanji: '5日',
    reading: 'いつか',
    tts: 'いつか',
    group: 'kun_1_10',
    highlightTone: 'indigo',
    note: 'Mẹo nhớ: Giống từ để hỏi いつ (khi nào) + か.',
  },
  {
    day: 'Mùng 6',
    kanji: '6日',
    reading: 'むいか',
    tts: 'むいか',
    group: 'kun_1_10',
    highlightTone: 'amber',
    note: 'Cặp dễ nhầm: 6日 (むいか) ↔ 7日 (なのか) và 3日 (みっか).',
  },
  {
    day: 'Mùng 7',
    kanji: '7日',
    reading: 'なのか',
    tts: 'なのか',
    group: 'kun_1_10',
    highlightTone: 'amber',
    note: 'Mùng 7 đọc là なのか (nhưng 17日, 27日 lại đọc là ～しちにち!).',
  },
  {
    day: 'Mùng 8',
    kanji: '8日',
    reading: 'ようか',
    tts: 'ようか',
    group: 'kun_1_10',
    highlightTone: 'rose',
    note: 'Bẫy số 1 JLPT: 8日 = ようか (trường âm う) ↔ 4日 = よっか (âm ngắt っ).',
  },
  {
    day: 'Mùng 9',
    kanji: '9日',
    reading: 'ここのか',
    tts: 'ここのか',
    group: 'kun_1_10',
    highlightTone: 'indigo',
    note: '4 âm tiết ここのか (nhưng 19日, 29日 đọc là ～くにち).',
  },
  {
    day: 'Mùng 10',
    kanji: '10日',
    reading: 'とおか',
    tts: 'とおか',
    group: 'kun_1_10',
    highlightTone: 'amber',
    note: 'Trường âm とお + か (chú ý viết chữ お, không phải う).',
  },
];

const SPECIAL_DAYS_11_TO_31: SpecialDayItem[] = [
  {
    day: 'Ngày 14',
    kanji: '14日',
    reading: 'じゅうよっか',
    tts: 'じゅうよっか',
    group: 'special_11_31',
    highlightTone: 'rose',
    note: '10 (じゅう) + 4日 (よっか) → ❌ Cấm đọc じゅうよんにち!',
  },
  {
    day: 'Ngày 20',
    kanji: '20日',
    reading: 'はつか',
    tts: 'はつか',
    group: 'special_11_31',
    highlightTone: 'rose',
    note: 'Ngoại lệ đặc biệt nhất: 20日 = はつか → ❌ Cấm đọc にじゅうにち!',
  },
  {
    day: 'Ngày 24',
    kanji: '24日',
    reading: 'にじゅうよっか',
    tts: 'にじゅうよっか',
    group: 'special_11_31',
    highlightTone: 'rose',
    note: '20 (にじゅう) + 4日 (よっか) → ❌ Cấm đọc にじゅうよんにち!',
  },
  {
    day: 'Ngày 17 & 27',
    kanji: '17日 / 27日',
    reading: 'じゅうしちにち / にじゅうしちにち',
    tts: 'じゅうしちにち',
    group: 'special_11_31',
    highlightTone: 'amber',
    note: 'Số 7 ghép với にち bắt buộc đọc là しちにち (không dùng ななにち hay なのか).',
  },
  {
    day: 'Ngày 19 & 29',
    kanji: '19日 / 29日',
    reading: 'じゅうくにち / にじゅうくにち',
    tts: 'じゅうくにち',
    group: 'special_11_31',
    highlightTone: 'amber',
    note: 'Số 9 ghép với にち đọc là くにち (không dùng きゅうにち hay ここのか).',
  },
  {
    day: 'Các ngày còn lại',
    kanji: '11日, 12日, 13日, 15日... 31日',
    reading: 'Số đếm + にち (VD: 11日 = じゅういちにち)',
    tts: 'じゅういちにち',
    group: 'special_11_31',
    highlightTone: 'indigo',
    note: 'Lưu ý: 11日, 21日, 31日 đọc bình thường là ～いちにち (chỉ 1日 mới đọc ついたち).',
  },
];

const COMBINED_DATE_EXAMPLES: CombinedDateExample[] = [
  {
    kanji: '4月20日',
    vn: 'Ngày 20 tháng 4',
    monthPart: 'しがつ (4月)',
    dayPart: 'はつか (20日)',
    fullReading: 'しがつ はつか',
    tts: 'しがつはつか',
    trapTip: 'Bẫy kép: Tháng 4 (しがつ) + Ngày 20 (はつか)',
  },
  {
    kanji: '7月4日',
    vn: 'Ngày 4 tháng 7',
    monthPart: 'しちがつ (7月)',
    dayPart: 'よっか (4日)',
    fullReading: 'しちがつ よっか',
    tts: 'しちがつよっか',
    trapTip: 'Bẫy kép: Tháng 7 (しちがつ) + Mùng 4 (よっか)',
  },
  {
    kanji: '9月8日',
    vn: 'Ngày 8 tháng 9',
    monthPart: 'くがつ (9月)',
    dayPart: 'ようか (8日)',
    fullReading: 'くがつ ようか',
    tts: 'くがつようか',
    trapTip: 'Bẫy kép: Tháng 9 (くがつ) + Mùng 8 (ようか)',
  },
  {
    kanji: '1月1日',
    vn: 'Ngày 1 tháng 1',
    monthPart: 'いちがつ (1月)',
    dayPart: 'ついたち (1日)',
    fullReading: 'いちがつ ついたち',
    tts: 'いちがつついたち',
    trapTip: 'Tết Dương lịch: Mùng 1 đọc là ついたち',
  },
  {
    kanji: '8月14日',
    vn: 'Ngày 14 tháng 8',
    monthPart: 'はちがつ (8月)',
    dayPart: 'じゅうよっか (14日)',
    fullReading: 'はちがつ じゅうよっか',
    tts: 'はちがつじゅうよっか',
    trapTip: 'Ngày 14 kết thúc bằng 4 → じゅうよっか',
  },
  {
    kanji: '12月24日',
    vn: 'Ngày 24 tháng 12',
    monthPart: 'じゅうにがつ (12月)',
    dayPart: 'にじゅうよっか (24日)',
    fullReading: 'じゅうにがつ にじゅうよっか',
    tts: 'じゅうにがつにじゅうよっか',
    trapTip: 'Ngày 24 kết thúc bằng 4 → にじゅうよっか',
  },
];

export default function Lesson5Notes() {
  const [practiceTopic, setPracticeTopic] = useState<Lesson5Topic>('dates_combined');
  const practiceRef = useRef<HTMLDivElement | null>(null);

  const jumpToPractice = useCallback((targetTopic: Lesson5Topic) => {
    setPracticeTopic(targetTopic);
    setTimeout(() => {
      practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  }, []);

  const speakJapanese = useCallback((text: string) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.92;
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find((v) => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
    if (jaVoice) utterance.voice = jaVoice;

    const win = window as unknown as { _activeUtterances?: SpeechSynthesisUtterance[] };
    win._activeUtterances = win._activeUtterances || [];
    win._activeUtterances.push(utterance);
    const cleanup = () => {
      if (!win._activeUtterances) return;
      const idx = win._activeUtterances.indexOf(utterance);
      if (idx > -1) win._activeUtterances.splice(idx, 1);
    };
    utterance.onend = cleanup;
    utterance.onerror = cleanup;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.speak(utterance);
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* =====================================================================
          PHẦN 1: ĐẾM THÁNG (1月–12月), NGÀY (1日–31日) & KẾT HỢP NGÀY–THÁNG
          ===================================================================== */}
      <section
        id="l5-dates-combined"
        className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-7 shadow-sm space-y-5 sm:space-y-6"
      >
        {/* Header Phần 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5 sm:pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-[11px] sm:text-xs font-extrabold mb-1.5">
              <span>📅 Phần 1 • Lịch Ngày &amp; Tháng</span>
            </div>
            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
              1. Đếm Tháng (1月–12月), Ngày (1日–31日) &amp; Kết hợp Ngày–Tháng
            </h2>
          </div>

          <button
            type="button"
            onClick={() => jumpToPractice('dates_combined')}
            className="w-full sm:w-auto min-h-[40px] px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/70 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-extrabold transition-colors cursor-pointer touch-manipulation shrink-0"
          >
            ⚡ Luyện kết hợp Ngày &amp; Tháng
          </button>
        </div>

        {/* 1.1. Bảng 12 Tháng (1月 - 12月) */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              1.1. 12 Tháng trong năm (～月 / ～がつ) — Hỏi:{' '}
              <button
                type="button"
                onClick={() => speakJapanese('なんがつ')}
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                何月 (なんがつ) 🔊
              </button>
            </h3>
            <span className="text-[11px] sm:text-xs font-bold text-rose-600 dark:text-rose-400">
              ⚠️ Thuộc lòng 3 tháng tô đỏ: Tháng 4 (しがつ) • Tháng 7 (しちがつ) • Tháng 9 (くがつ)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
            {MONTH_LIST.map((m) => (
              <div
                key={m.month}
                className={`rounded-xl border p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-colors ${
                  m.special
                    ? 'bg-rose-50/80 dark:bg-rose-950/35 border-rose-300 dark:border-rose-800/80'
                    : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      {m.kanji}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      (Tháng {m.month})
                    </span>
                  </div>
                  <div
                    className={`text-xs sm:text-sm font-extrabold mt-0.5 ${
                      m.special
                        ? 'text-rose-700 dark:text-rose-300'
                        : 'text-indigo-700 dark:text-indigo-300'
                    }`}
                  >
                    {m.reading}
                  </div>
                  {m.caution && (
                    <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                      {m.caution}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => speakJapanese(m.reading)}
                  className="min-h-[34px] min-w-[34px] rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/50 cursor-pointer touch-manipulation shrink-0"
                  title={`Nghe ${m.reading}`}
                >
                  🔊
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 1.2. Bảng Ngày trong tháng (1日 - 10日 & Các ngày đặc biệt 11日 - 31日) */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              1.2. Ngày trong tháng (1日–31日) — Hỏi:{' '}
              <button
                type="button"
                onClick={() => speakJapanese('なんにち')}
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                何日 (なんにち) 🔊
              </button>
            </h3>
            <span className="text-[11px] sm:text-xs font-bold text-amber-700 dark:text-amber-300">
              💡 Mùng 1–10 dùng âm thuần Nhật • Từ 11–31 chú ý Ngày 14, 20, 24 và số 7, 9
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
            {/* Cột Trái: Mùng 1 đến Mùng 10 */}
            <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 overflow-hidden bg-white dark:bg-slate-950/60">
              <div className="px-3.5 py-2.5 bg-indigo-50/90 dark:bg-indigo-950/60 border-b border-indigo-200/70 dark:border-indigo-900/60 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-indigo-900 dark:text-indigo-200">
                  🅰️ Mùng 1 → Mùng 10 (Âm thuần Nhật)
                </span>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  Đuôi ～か (trừ 1日)
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {KUN_DAYS_1_TO_10.map((item) => (
                  <div
                    key={item.kanji}
                    className="p-2.5 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white w-11 shrink-0">
                          {item.kanji}
                        </span>
                        <span
                          className={`text-sm sm:text-base font-extrabold ${
                            item.highlightTone === 'rose'
                              ? 'text-rose-600 dark:text-rose-400'
                              : item.highlightTone === 'amber'
                              ? 'text-amber-700 dark:text-amber-300'
                              : 'text-indigo-700 dark:text-indigo-300'
                          }`}
                        >
                          {item.reading}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          ({item.day})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                        {item.note}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => speakJapanese(item.tts)}
                      className="min-h-[34px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-indigo-100 dark:hover:bg-indigo-950 text-xs font-extrabold text-indigo-700 dark:text-indigo-300 cursor-pointer touch-manipulation shrink-0"
                    >
                      🔊
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cột Phải: Các ngày đặc biệt từ 11 đến 31 & Cặp dễ nhầm */}
            <div className="space-y-3.5">
              <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 overflow-hidden bg-white dark:bg-slate-950/60">
                <div className="px-3.5 py-2.5 bg-amber-50/90 dark:bg-amber-950/60 border-b border-amber-200/70 dark:border-amber-900/60 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200">
                    🅱️ Các ngày đặc biệt từ 11日 → 31日
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                    14日 • 20日 • 24日 • 17/27 • 19/29
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {SPECIAL_DAYS_11_TO_31.map((item) => (
                    <div
                      key={item.kanji}
                      className="p-2.5 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                            {item.kanji}
                          </span>
                          <span
                            className={`text-sm font-extrabold ${
                              item.highlightTone === 'rose'
                                ? 'text-rose-600 dark:text-rose-400'
                                : item.highlightTone === 'amber'
                                ? 'text-amber-700 dark:text-amber-300'
                                : 'text-indigo-700 dark:text-indigo-300'
                            }`}
                          >
                            {item.reading}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                          {item.note}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => speakJapanese(item.tts)}
                        className="min-h-[34px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-amber-100 dark:hover:bg-amber-950 text-xs font-extrabold text-amber-700 dark:text-amber-300 cursor-pointer touch-manipulation shrink-0"
                      >
                        🔊
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hộp tóm tắt 4 cặp ngày sinh đôi dễ nhầm nhất */}
              <div className="rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 p-3.5 space-y-2">
                <div className="text-xs font-black text-rose-800 dark:text-rose-200 uppercase tracking-wide">
                  🔥 4 Cặp ngày "sinh đôi" dễ lộn nhất khi làm bài:
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700 dark:text-slate-200">
                  <li className="px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-rose-200/60 dark:border-rose-900/50">
                    <strong>4日 (よっか)</strong> ↔ <strong>8日 (ようか)</strong>
                  </li>
                  <li className="px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-rose-200/60 dark:border-rose-900/50">
                    <strong>2日 (ふつか)</strong> ↔ <strong>20日 (はつか)</strong>
                  </li>
                  <li className="px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-rose-200/60 dark:border-rose-900/50">
                    <strong>6日 (むいか)</strong> ↔ <strong>7日 (なのか)</strong>
                  </li>
                  <li className="px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-rose-200/60 dark:border-rose-900/50">
                    <strong>1日 (ついたち)</strong> ↔ <strong>11/21/31日 (～いちにち)</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 1.3. Quy tắc Kết hợp Tháng + Ngày (～月～日) */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-50/90 via-amber-50/60 to-emerald-50/80 dark:from-indigo-950/50 dark:via-slate-900 dark:to-emerald-950/40 border border-indigo-200/80 dark:border-indigo-800/60 p-3.5 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  1.3. Công thức Kết hợp Tháng &amp; Ngày: 【 Tháng (～月) ＋ Ngày (～日) 】
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Tiếng Nhật luôn viết và đọc <strong>Đơn vị lớn (Tháng) đứng trước</strong> →{' '}
                  <strong>Đơn vị nhỏ (Ngày) đứng sau</strong> (ngược với tiếng Việt!). Hỏi cả tháng
                  lẫn ngày:{' '}
                  <button
                    type="button"
                    onClick={() => speakJapanese('たんじょうびは なんがつ なんにちですか')}
                    className="font-extrabold text-indigo-700 dark:text-indigo-300 hover:underline cursor-pointer"
                  >
                    何月何日ですか (なんがつ なんにちですか) 🔊
                  </button>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {COMBINED_DATE_EXAMPLES.map((ex) => (
                <div
                  key={ex.kanji}
                  className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 flex items-start justify-between gap-2 shadow-2xs"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {ex.kanji}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {ex.vn}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-indigo-700 dark:text-indigo-300">
                      {ex.fullReading}
                    </div>
                    <div className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
                      {ex.trapTip}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => speakJapanese(ex.tts)}
                    className="min-h-[36px] min-w-[36px] rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold cursor-pointer touch-manipulation shrink-0"
                    title={`Nghe ${ex.fullReading}`}
                  >
                    🔊
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          PHẦN 2: BÀI TẬP THỰC HÀNH KẾT HỢP NGÀY–THÁNG (KHÔNG GIỚI HẠN GIỜ)
          ===================================================================== */}
      <div id="l5-practice" ref={practiceRef} className="scroll-mt-20">
        <Lesson5PracticeArena topic={practiceTopic} onTopicChange={setPracticeTopic} />
      </div>
    </div>
  );
}

