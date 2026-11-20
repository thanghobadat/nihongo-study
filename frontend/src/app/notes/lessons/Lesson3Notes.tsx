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
import Lesson3PracticeArena from './Lesson3PracticeArena';
import { Lesson3Topic } from './lesson3PracticeGenerator';

interface HundredThousandRow {
  digit: number;
  hundredNum: string;
  hundredKanji: string;
  hundredReading: string;
  hundredMutated?: boolean;
  thousandNum: string;
  thousandKanji: string;
  thousandReading: string;
  thousandMutated?: boolean;
  thousandCaution?: string;
}

interface FloorRow {
  floor: string;
  kanji: string;
  reading: string;
  tts: string;
  type: 'normal' | 'geminate' | 'voiced' | 'basement' | 'question';
  note: string;
}

const HUNDRED_THOUSAND_ROWS: HundredThousandRow[] = [
  {
    digit: 1,
    hundredNum: '100',
    hundredKanji: '百',
    hundredReading: 'ひゃく',
    thousandNum: '1,000',
    thousandKanji: '千',
    thousandReading: 'せん',
    thousandCaution: 'Không thêm いち ở đầu (trừ 11,000 = いちまん いっせん)',
  },
  {
    digit: 2,
    hundredNum: '200',
    hundredKanji: '二百',
    hundredReading: 'にひゃく',
    thousandNum: '2,000',
    thousandKanji: '二千',
    thousandReading: 'にせん',
  },
  {
    digit: 3,
    hundredNum: '300',
    hundredKanji: '三百',
    hundredReading: 'さんびゃく',
    hundredMutated: true,
    thousandNum: '3,000',
    thousandKanji: '三千',
    thousandReading: 'さんぜん',
    thousandMutated: true,
  },
  {
    digit: 4,
    hundredNum: '400',
    hundredKanji: '四百',
    hundredReading: 'よんひゃく',
    thousandNum: '4,000',
    thousandKanji: '四千',
    thousandReading: 'よんせん',
  },
  {
    digit: 5,
    hundredNum: '500',
    hundredKanji: '五百',
    hundredReading: 'ごひゃく',
    thousandNum: '5,000',
    thousandKanji: '五千',
    thousandReading: 'ごせん',
  },
  {
    digit: 6,
    hundredNum: '600',
    hundredKanji: '六百',
    hundredReading: 'ろっぴゃく',
    hundredMutated: true,
    thousandNum: '6,000',
    thousandKanji: '六千',
    thousandReading: 'ろくせん',
    thousandCaution: 'Giữ nguyên ろくせん (không biến âm)',
  },
  {
    digit: 7,
    hundredNum: '700',
    hundredKanji: '七百',
    hundredReading: 'ななひゃく',
    thousandNum: '7,000',
    thousandKanji: '七千',
    thousandReading: 'ななせん',
  },
  {
    digit: 8,
    hundredNum: '800',
    hundredKanji: '八百',
    hundredReading: 'はっぴゃく',
    hundredMutated: true,
    thousandNum: '8,000',
    thousandKanji: '八千',
    thousandReading: 'はっせん',
    thousandMutated: true,
  },
  {
    digit: 9,
    hundredNum: '900',
    hundredKanji: '九百',
    hundredReading: 'きゅうひゃく',
    thousandNum: '9,000',
    thousandKanji: '九千',
    thousandReading: 'きゅうせん',
  },
];

const MAN_CONVERSION_ROWS = [
  {
    yen: '10,000¥',
    split4: '1 | 0000',
    kanji: '一万円',
    reading: 'いちまんえん',
    vnHint: '1 vạn = 10 nghìn (bắt buộc có いち trước まん)',
  },
  {
    yen: '38,000¥',
    split4: '3 | 8000',
    kanji: '三万八千円',
    reading: 'さんまん はっせんえん',
    vnHint: '3 vạn + 8 nghìn (biến âm はっせん)',
  },
  {
    yen: '100,000¥',
    split4: '10 | 0000',
    kanji: '十万円',
    reading: 'じゅうまんえん',
    vnHint: '10 vạn = 100 nghìn (bẫy lệch số 0 hay nhầm nhất)',
  },
  {
    yen: '250,000¥',
    split4: '25 | 0000',
    kanji: '二十五万円',
    reading: 'にじゅうごまんえん',
    vnHint: '25 vạn = 250 nghìn',
  },
  {
    yen: '1,000,000¥',
    split4: '100 | 0000',
    kanji: '百万円',
    reading: 'ひゃくまんえん',
    vnHint: '100 vạn = 1 triệu (không thêm いち trước ひゃく)',
  },
];

const FLOOR_ROWS: FloorRow[] = [
  {
    floor: '1F',
    kanji: '一階',
    reading: 'いっかい',
    tts: 'いっかい',
    type: 'geminate',
    note: 'Biến âm いち → いっかい.',
  },
  {
    floor: '2F',
    kanji: '二階',
    reading: 'にかい',
    tts: 'にかい',
    type: 'normal',
    note: 'Ghép thẳng số gốc + かい.',
  },
  {
    floor: '3F',
    kanji: '三階',
    reading: 'さんがい',
    tts: 'さんがい',
    type: 'voiced',
    note: 'Biến âm đục đặc biệt かい → がい (rất hay ra đề JLPT N5).',
  },
  {
    floor: '4F',
    kanji: '四階',
    reading: 'よんかい',
    tts: 'よんかい',
    type: 'normal',
    note: 'Chỉ dùng よんかい (không đọc しかい).',
  },
  {
    floor: '5F',
    kanji: '五階',
    reading: 'ごかい',
    tts: 'ごかい',
    type: 'normal',
    note: 'Ghép thẳng số gốc + かい.',
  },
  {
    floor: '6F',
    kanji: '六階',
    reading: 'ろっかい',
    tts: 'ろっかい',
    type: 'geminate',
    note: 'Biến âm ろく → ろっかい (khác 6 tuổi ろくさい và 6,000 ろくせん).',
  },
  {
    floor: '7F',
    kanji: '七階',
    reading: 'ななかい',
    tts: 'ななかい',
    type: 'normal',
    note: 'Dùng ななかい (không đọc しちかい).',
  },
  {
    floor: '8F',
    kanji: '八階',
    reading: 'はっかい',
    tts: 'はっかい',
    type: 'geminate',
    note: 'Biến âm はち → はっかい.',
  },
  {
    floor: '9F',
    kanji: '九階',
    reading: 'きゅうかい',
    tts: 'きゅうかい',
    type: 'normal',
    note: 'Chỉ dùng きゅうかい (không đọc くかい).',
  },
  {
    floor: '10F',
    kanji: '十階',
    reading: 'じゅっかい',
    tts: 'じゅっかい',
    type: 'geminate',
    note: 'Biến âm じゅう → じゅっかい (hoặc じっかい).',
  },
  {
    floor: 'B1 / B2',
    kanji: '地下一階 / 二階',
    reading: 'ちか いっかい / にかい',
    tts: 'ちかいっかい',
    type: 'basement',
    note: 'Thêm ちか (地下 — tầng hầm) phía trước số tầng.',
  },
  {
    floor: 'Hỏi',
    kanji: '何階',
    reading: 'なんがい',
    tts: 'なんがいですか',
    type: 'question',
    note: 'Biến âm đục がい giống tầng 3: ～は なんがいですか。',
  },
];

export default function Lesson3Notes() {
  const [practiceTopic, setPracticeTopic] = useState<Lesson3Topic>('money');
  const practiceRef = useRef<HTMLDivElement | null>(null);

  const jumpToPractice = useCallback((targetTopic: Lesson3Topic) => {
    setPracticeTopic(targetTopic);
    setTimeout(() => {
      practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  }, []);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. SỐ ĐẾM LỚN & TIỀN YÊN */}
      <SheetSection>
        <SheetHeader
          title="Số đếm lớn (百・千・万) & Tiền Yên (～円)"
          subtitle="5 mốc biến âm ở Trăm/Nghìn và quy tắc tách 4 số 0 sang hàng Vạn (万)."
          actionLabel="Luyện phản xạ Đếm tiền"
          onAction={() => jumpToPractice('money')}
        />

        <CalloutBar tone="blue">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <div>
              <strong className="text-slate-900 dark:text-white">5 biến âm Trăm/Nghìn:</strong>{' '}
              300 (さんびゃく), 600 (ろっぴゃく), 800 (はっぴゃく), 3,000 (さんぜん), 8,000 (はっせん).
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white">Tách 4 số 0 (万):</strong>{' '}
              10,000 = <strong>いちまん</strong> (bắt buộc có いち); 100,000 = <strong>じゅうまん</strong>.
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white">Đơn vị 円:</strong> Đọc chuẩn là{' '}
              <strong>えん (en)</strong>, hỏi giá dùng <strong>いくらですか</strong>.
            </div>
          </div>
        </CalloutBar>

        {/* Bảng song song Hàng Trăm (百) & Hàng Nghìn (千) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden tabular-nums">
          <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div className="py-2.5 px-3.5">Hàng Trăm (百)</div>
            <div className="py-2.5 px-3.5 border-l border-slate-200 dark:border-slate-800">
              Hàng Nghìn (千)
            </div>
          </div>

          <div className="divide-y divide-slate-200/80 dark:divide-slate-800">
            {HUNDRED_THOUSAND_ROWS.map((row) => (
              <div key={row.digit} className="grid grid-cols-1 sm:grid-cols-2">
                <div className="p-3 sm:px-3.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {row.hundredNum}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({row.hundredKanji})
                    </span>
                    {row.hundredMutated && <StatusTag label="Biến âm" tone="mutation" />}
                  </div>

                  <AudioReadingPill
                    reading={row.hundredReading}
                    tone={row.hundredMutated ? 'mutation' : 'default'}
                  />
                </div>

                <div className="p-3 sm:px-3.5 border-t sm:border-t-0 sm:border-l border-slate-200/80 dark:border-slate-800 flex flex-col justify-center gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {row.thousandNum}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({row.thousandKanji})
                      </span>
                      {row.thousandMutated && <StatusTag label="Biến âm" tone="mutation" />}
                    </div>

                    <AudioReadingPill
                      reading={row.thousandReading}
                      tone={row.thousandMutated ? 'mutation' : 'default'}
                    />
                  </div>
                  {row.thousandCaution && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {row.thousandCaution}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bảng quy đổi Hàng Vạn (万) */}
        <div className="space-y-2.5 pt-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Mẹo quy đổi từ 10,000¥ trở lên (Đếm lùi 4 số 0 đặt vạch |)
          </h3>

          <div className="divide-y divide-slate-200/80 dark:divide-slate-800 border-t border-b border-slate-200/80 dark:border-slate-800 tabular-nums">
            {MAN_CONVERSION_ROWS.map((r) => (
              <div
                key={r.yen}
                className="py-2.5 grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
              >
                <div className="md:col-span-4 flex items-center justify-between md:justify-start gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                      {r.yen}
                    </span>
                    <span className="text-slate-400 text-xs">→</span>
                    <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {r.split4}
                    </code>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {r.kanji}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-4">
                  <AudioReadingPill
                    reading={r.reading}
                    tts={r.reading.replace(/\s+/g, '')}
                  />
                </div>

                <p className="md:col-span-4 text-xs text-slate-600 dark:text-slate-400">
                  {r.vnHint}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 flex items-center justify-between gap-3">
            <div className="space-y-0.5 text-xs sm:text-sm">
              <p className="font-bold text-slate-900 dark:text-white">
                すみません。この ネクタイは いくらですか。
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                → 1万5千円（いちまん ごせんえん）です。 — じゃ、これを ください。
              </p>
            </div>
            <AudioIconButton
              tts="すみません。このネクタイは いくらですか。いちまんごせんえんです。じゃ、これをください。"
              label="Nghe hội thoại mua hàng"
            />
          </div>
        </div>
      </SheetSection>

      {/* 2. CÁCH ĐẾM TẦNG LẦU (～階) */}
      <SheetSection>
        <SheetHeader
          title="Cách đếm tầng lầu (～階) & Tầng hầm (地下)"
          subtitle="Chú ý tầng 3 (さんがい), câu hỏi (なんがい) và các tầng biến âm っ (1, 6, 8, 10)."
          actionLabel="Luyện phản xạ Đếm tầng"
          onAction={() => jumpToPractice('floors')}
        />

        <div className="divide-y divide-slate-200/80 dark:divide-slate-800 border-t border-b border-slate-200/80 dark:border-slate-800 tabular-nums">
          {FLOOR_ROWS.map((row) => {
            const pillTone =
              row.type === 'voiced'
                ? 'exception'
                : row.type === 'geminate'
                ? 'mutation'
                : row.type === 'question' || row.type === 'basement'
                ? 'accent'
                : 'default';

            return (
              <div
                key={row.floor}
                className="py-2.5 grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
              >
                <div className="md:col-span-5 flex items-center justify-between md:justify-start gap-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="w-14 font-mono text-sm font-bold text-slate-900 dark:text-white shrink-0">
                      {row.floor}
                    </span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {row.kanji}
                    </span>
                    {row.type === 'voiced' && <StatusTag label="Âm đục がい" tone="exception" />}
                    {row.type === 'geminate' && <StatusTag label="Biến âm" tone="mutation" />}
                  </div>

                  <div className="md:hidden">
                    <AudioReadingPill
                      reading={row.reading}
                      tts={row.tts}
                      tone={pillTone}
                    />
                  </div>
                </div>

                <div className="hidden md:flex md:col-span-3">
                  <AudioReadingPill reading={row.reading} tts={row.tts} tone={pillTone} />
                </div>

                <p className="md:col-span-4 text-xs text-slate-600 dark:text-slate-400">
                  {row.note}
                </p>
              </div>
            );
          })}
        </div>
      </SheetSection>

      {/* 3. PHÒNG LUYỆN PHẢN XẠ */}
      <div ref={practiceRef} className="scroll-mt-4">
        <Lesson3PracticeArena topic={practiceTopic} onTopicChange={setPracticeTopic} />
      </div>
    </div>
  );
}
