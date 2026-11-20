'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  AudioIconButton,
  AudioReadingPill,
  CalloutBar,
  SheetHeader,
  SheetSection,
  StatusTag,
} from '../components/NotesUI';
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
  highlightTone: 'rose' | 'amber' | 'indigo';
  note: string;
}

interface CombinedDateExample {
  kanji: string;
  vn: string;
  fullReading: string;
  tts: string;
  trapTip: string;
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
    caution: 'Sai: よんがつ',
  },
  { month: 5, kanji: '5月', reading: 'ごがつ' },
  { month: 6, kanji: '6月', reading: 'ろくがつ' },
  {
    month: 7,
    kanji: '7月',
    reading: 'しちがつ',
    special: true,
    caution: 'Sai: なながつ',
  },
  { month: 8, kanji: '8月', reading: 'はちがつ' },
  {
    month: 9,
    kanji: '9月',
    reading: 'くがつ',
    special: true,
    caution: 'Sai: きゅうがつ',
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
    highlightTone: 'rose',
    note: 'Mùng 1 = ついたち (khác thời lượng 1 ngày = いちにち).',
  },
  {
    day: 'Mùng 2',
    kanji: '2日',
    reading: 'ふつか',
    tts: 'ふつか',
    highlightTone: 'amber',
    note: 'Cặp dễ nhầm: 2日 (ふつか) ↔ 20日 (はつか).',
  },
  {
    day: 'Mùng 3',
    kanji: '3日',
    reading: 'みっか',
    tts: 'みっか',
    highlightTone: 'indigo',
    note: 'Có âm ngắt っ (みっか), tránh nhầm với 6日 (むいか).',
  },
  {
    day: 'Mùng 4',
    kanji: '4日',
    reading: 'よっか',
    tts: 'よっか',
    highlightTone: 'rose',
    note: 'Bẫy JLPT: 4日 = よっか (âm ngắt) ↔ 8日 = ようか (trường âm).',
  },
  {
    day: 'Mùng 5',
    kanji: '5日',
    reading: 'いつか',
    tts: 'いつか',
    highlightTone: 'indigo',
    note: 'Giống từ hỏi いつ (khi nào) + か.',
  },
  {
    day: 'Mùng 6',
    kanji: '6日',
    reading: 'むいか',
    tts: 'むいか',
    highlightTone: 'amber',
    note: 'Cặp dễ nhầm: 6日 (むいか) ↔ 7日 (なのか).',
  },
  {
    day: 'Mùng 7',
    kanji: '7日',
    reading: 'なのか',
    tts: 'なのか',
    highlightTone: 'amber',
    note: 'Mùng 7 = なのか (nhưng 17日, 27日 đọc là ～しちにち).',
  },
  {
    day: 'Mùng 8',
    kanji: '8日',
    reading: 'ようか',
    tts: 'ようか',
    highlightTone: 'rose',
    note: 'Bẫy JLPT: 8日 = ようか (trường âm) ↔ 4日 = よっか (âm ngắt).',
  },
  {
    day: 'Mùng 9',
    kanji: '9日',
    reading: 'ここのか',
    tts: 'ここのか',
    highlightTone: 'indigo',
    note: '4 âm tiết ここのか (nhưng 19日, 29日 đọc là ～くにち).',
  },
  {
    day: 'Mùng 10',
    kanji: '10日',
    reading: 'とおか',
    tts: 'とおか',
    highlightTone: 'amber',
    note: 'Trường âm とお + か (viết bằng chữ お).',
  },
];

const SPECIAL_DAYS_11_TO_31: SpecialDayItem[] = [
  {
    day: 'Ngày 14',
    kanji: '14日',
    reading: 'じゅうよっか',
    tts: 'じゅうよっか',
    highlightTone: 'rose',
    note: '10 + 4日 (よっか) — không đọc じゅうよんにち.',
  },
  {
    day: 'Ngày 20',
    kanji: '20日',
    reading: 'はつか',
    tts: 'はつか',
    highlightTone: 'rose',
    note: 'Ngoại lệ đặc biệt: 20日 = はつか (không đọc にじゅうにち).',
  },
  {
    day: 'Ngày 24',
    kanji: '24日',
    reading: 'にじゅうよっか',
    tts: 'にじゅうよっか',
    highlightTone: 'rose',
    note: '20 + 4日 (よっか) — không đọc にじゅうよんにち.',
  },
  {
    day: 'Ngày 17 & 27',
    kanji: '17日 / 27日',
    reading: 'じゅうしちにち / にじゅうしちにち',
    tts: 'じゅうしちにち',
    highlightTone: 'amber',
    note: 'Số 7 ghép với にち bắt buộc đọc しちにち.',
  },
  {
    day: 'Ngày 19 & 29',
    kanji: '19日 / 29日',
    reading: 'じゅうくにち / にじゅうくにち',
    tts: 'じゅうくにち',
    highlightTone: 'amber',
    note: 'Số 9 ghép với にち bắt buộc đọc くにち.',
  },
  {
    day: 'Các ngày khác',
    kanji: '11日, 12日... 31日',
    reading: 'Số + にち (11日 = じゅういちにち)',
    tts: 'じゅういちにち',
    highlightTone: 'indigo',
    note: '11日, 21日, 31日 đọc bình thường là ～いちにち.',
  },
];

const COMBINED_DATE_EXAMPLES: CombinedDateExample[] = [
  {
    kanji: '4月20日',
    vn: '20/04',
    fullReading: 'しがつ はつか',
    tts: 'しがつはつか',
    trapTip: 'Tháng 4 (しがつ) + Ngày 20 (はつか)',
  },
  {
    kanji: '7月4日',
    vn: '04/07',
    fullReading: 'しちがつ よっか',
    tts: 'しちがつよっか',
    trapTip: 'Tháng 7 (しちがつ) + Mùng 4 (よっか)',
  },
  {
    kanji: '9月8日',
    vn: '08/09',
    fullReading: 'くがつ ようか',
    tts: 'くがつようか',
    trapTip: 'Tháng 9 (くがつ) + Mùng 8 (ようか)',
  },
  {
    kanji: '1月1日',
    vn: '01/01',
    fullReading: 'いちがつ ついたち',
    tts: 'いちがつついたち',
    trapTip: 'Mùng 1 đầu tháng đọc là ついたち',
  },
  {
    kanji: '8月14日',
    vn: '14/08',
    fullReading: 'はちがつ じゅうよっか',
    tts: 'はちがつじゅうよっか',
    trapTip: 'Ngày 14 kết thúc bằng 4 → じゅうよっか',
  },
  {
    kanji: '12月24日',
    vn: '24/12',
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

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. 12 THÁNG TRONG NĂM */}
      <SheetSection id="l5-dates-combined">
        <SheetHeader
          title="12 Tháng trong năm (～月) — Hỏi: 何月 (なんがつ)"
          subtitle="Thuộc lòng 3 tháng ngoại lệ: Tháng 4 (しがつ), Tháng 7 (しちがつ), Tháng 9 (くがつ)."
          actionLabel="Luyện kết hợp Ngày & Tháng"
          onAction={() => jumpToPractice('dates_combined')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 tabular-nums">
          {MONTH_LIST.map((m) => (
            <div
              key={m.month}
              className="rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 flex items-center justify-between gap-2 bg-white dark:bg-slate-900/40"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    {m.kanji}
                  </span>
                  {m.special && <StatusTag label="Ngoại lệ" tone="exception" />}
                </div>
                {m.caution && (
                  <p className="text-[11px] line-through text-rose-600 dark:text-rose-400 mt-0.5">
                    {m.caution}
                  </p>
                )}
              </div>

              <AudioReadingPill
                reading={m.reading}
                tone={m.special ? 'exception' : 'default'}
              />
            </div>
          ))}
        </div>
      </SheetSection>

      {/* 2. NGÀY TRONG THÁNG (1日 - 31日) */}
      <SheetSection>
        <SheetHeader
          title="Ngày trong tháng (1日 – 31日) — Hỏi: 何日 (なんにち)"
          subtitle="Mùng 1–10 dùng âm thuần Nhật; từ 11–31 chú ý các ngày 14, 20, 24 và số 7, 9."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 tabular-nums">
          {/* Cột 1: Mùng 1 -> Mùng 10 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Mùng 1 → Mùng 10 (Âm thuần Nhật)
            </h3>
            <div className="divide-y divide-slate-200/80 dark:divide-slate-800 border-t border-b border-slate-200/80 dark:border-slate-800">
              {KUN_DAYS_1_TO_10.map((item) => (
                <div
                  key={item.kanji}
                  className="py-2.5 flex items-center justify-between gap-2.5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-11 font-mono text-sm font-bold text-slate-900 dark:text-white shrink-0">
                        {item.kanji}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {item.day}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                      {item.note}
                    </p>
                  </div>

                  <AudioReadingPill
                    reading={item.reading}
                    tts={item.tts}
                    tone={
                      item.highlightTone === 'rose'
                        ? 'exception'
                        : item.highlightTone === 'amber'
                        ? 'mutation'
                        : 'default'
                    }
                    className="shrink-0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Cột 2: Ngày đặc biệt 11 -> 31 + 4 cặp dễ nhầm */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Các ngày đặc biệt từ 11日 → 31日
              </h3>
              <div className="divide-y divide-slate-200/80 dark:divide-slate-800 border-t border-b border-slate-200/80 dark:border-slate-800">
                {SPECIAL_DAYS_11_TO_31.map((item) => (
                  <div
                    key={item.kanji}
                    className="py-2.5 flex items-center justify-between gap-2.5"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {item.kanji}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                        {item.note}
                      </p>
                    </div>

                    <AudioReadingPill
                      reading={item.reading}
                      tts={item.tts}
                      tone={
                        item.highlightTone === 'rose'
                          ? 'exception'
                          : item.highlightTone === 'amber'
                          ? 'mutation'
                          : 'default'
                      }
                      className="shrink-0 max-w-[180px]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <CalloutBar tone="rose">
              <p className="font-bold text-slate-900 dark:text-white mb-1">
                4 cặp ngày dễ lộn nhất khi nghe & đọc:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                <span>4日 (よっか) ↔ 8日 (ようか)</span>
                <span>2日 (ふつか) ↔ 20日 (はつか)</span>
                <span>6日 (むいか) ↔ 7日 (なのか)</span>
                <span>1日 (ついたち) ↔ 11/21日 (～いちにち)</span>
              </div>
            </CalloutBar>
          </div>
        </div>

        {/* 3. KẾT HỢP THÁNG + NGÀY */}
        <div className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Kết hợp Tháng đứng trước + Ngày đứng sau (～月～日)
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Hỏi: 何月何日ですか (なんがつ なんにちですか)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 tabular-nums">
            {COMBINED_DATE_EXAMPLES.map((ex) => (
              <div
                key={ex.kanji}
                className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between gap-2 bg-white dark:bg-slate-900/40"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                      {ex.kanji}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">({ex.vn})</span>
                  </div>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {ex.fullReading}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{ex.trapTip}</p>
                </div>

                <AudioIconButton tts={ex.tts} label={`Nghe ${ex.fullReading}`} />
              </div>
            ))}
          </div>
        </div>
      </SheetSection>

      {/* 4. PHÒNG LUYỆN TẬP */}
      <div id="l5-practice" ref={practiceRef} className="scroll-mt-20">
        <Lesson5PracticeArena topic={practiceTopic} onTopicChange={setPracticeTopic} />
      </div>
    </div>
  );
}
