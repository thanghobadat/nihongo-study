'use client';

import React, { useCallback, useRef, useState } from 'react';
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
    thousandCaution: 'Giữ nguyên ろくせん (không biến âm!)',
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
    vnHint: '1 vạn = 10 nghìn (BẮT BUỘC có いち đứng trước まん!)',
  },
  {
    yen: '38,000¥',
    split4: '3 | 8000',
    kanji: '三万八千円',
    reading: 'さんまん はっせんえん',
    vnHint: '3 vạn + 8 nghìn (chú ý biến âm はっせん)',
  },
  {
    yen: '100,000¥',
    split4: '10 | 0000',
    kanji: '十万円',
    reading: 'じゅうまんえん',
    vnHint: '10 vạn = 100 nghìn (Bẫy lệch số 0 hay nhầm nhất!)',
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
    note: 'Biến âm đục đặc biệt かい → がい (rất hay ra đề JLPT N5!).',
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
    note: 'Biến âm ろく → ろっかい (khác với 6 tuổi ろくさい và 6000 ろくせん!).',
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
    note: 'Biến âm はち → はっかい (thông dụng nhất; đôi khi gặp はちかい).',
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
    reading: 'じゅっかい (じっかい)',
    tts: 'じゅっかい',
    type: 'geminate',
    note: 'Biến âm じゅう → じゅっかい (hoặc じっかい).',
  },
  {
    floor: 'Hầm B1/B2',
    kanji: '地下一階 / 二階',
    reading: 'ちか いっかい / にかい',
    tts: 'ちかいっかい',
    type: 'basement',
    note: 'Thêm ちか (地下 - tầng hầm) phía trước số tầng.',
  },
  {
    floor: 'Hỏi tầng',
    kanji: '何階',
    reading: 'なんがい',
    tts: 'なんがいですか',
    type: 'question',
    note: 'Biến âm đục がい giống tầng 3 (さんがい): ～は なんがいですか。',
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

  // iOS Safari / iPhone 15 Pro WebKit-hardened Japanese TTS
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
    <div className="space-y-5 sm:space-y-8">
      {/* ===================================================================== */}
      {/* PHẦN 1: ĐẾM SỐ LỚN (百・千・万) & ĐẾM TIỀN YÊN (～円 / いくら)        */}
      {/* ===================================================================== */}
      <section className="rounded-2xl bg-white dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-7 shadow-sm space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5 sm:pb-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 text-xs font-extrabold mb-1.5">
              Phần 1 • Trọng tâm mua sắm &amp; giá tiền Bài 3
            </span>
            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
              1. Số đếm lớn (百・千・万) &amp; Cách đếm tiền Yên (～円 / ～えん)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => jumpToPractice('money')}
            className="w-full sm:w-auto min-h-[42px] inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-sm transition-colors cursor-pointer shrink-0 touch-manipulation active:scale-[0.98]"
          >
            <span>⚡</span>
            <span>Luyện phản xạ Đếm tiền</span>
          </button>
        </div>

        {/* 3 Quy tắc sống còn khi đọc tiền Nhật */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3.5">
          <div className="rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/60 p-3.5 sm:p-4 space-y-1">
            <p className="text-xs font-extrabold uppercase tracking-wide text-amber-700 dark:text-amber-300">
              ⚠️ 5 biến âm ở Trăm &amp; Nghìn
            </p>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              Trăm biến âm ở <strong>300 (さんびゃく), 600 (ろっぴゃく), 800 (はっぴゃく)</strong>. Nghìn chỉ biến âm ở{' '}
              <strong>3,000 (さんぜん) &amp; 8,000 (はっせん)</strong> — riêng <strong>6,000 = ろくせん</strong> giữ nguyên!
            </p>
          </div>

          <div className="rounded-2xl bg-rose-50/70 dark:bg-rose-950/25 border border-rose-200/80 dark:border-rose-800/60 p-3.5 sm:p-4 space-y-1">
            <p className="text-xs font-extrabold uppercase tracking-wide text-rose-700 dark:text-rose-300">
              ⭐ Quy tắc &ldquo;Tách 4 số 0&rdquo; (Vạn - 万)
            </p>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              Tiếng Nhật nhóm theo <strong>4 chữ số (1 万 = 10,000)</strong>, không có &ldquo;mười nghìn = じゅうせん&rdquo;!{' '}
              <strong>10,000 = いちまん</strong> (bắt buộc có いち), <strong>100,000 = じゅうまん</strong>.
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-800/60 p-3.5 sm:p-4 space-y-1">
            <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              💴 Đơn vị Yên: 円 đọc là 「えん」
            </p>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              Chữ <strong>円</strong> đọc chuẩn là <strong>えん (en)</strong>, không có âm &ldquo;y&rdquo; ở đầu. Ghép sau số nào cũng giữ nguyên えん, từ hỏi giá là <strong>いくら</strong>.
            </p>
          </div>
        </div>

        {/* MOBILE VIEW (< md): Lưới 2 ô đối xứng Trái (Trăm) - Phải (Nghìn) chuẩn 393px iPhone 15 Pro */}
        <div className="md:hidden rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-950/85 border-b border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-600 dark:text-slate-300">
            <div className="py-2.5 px-3">Hàng Trăm (百)</div>
            <div className="py-2.5 px-3 border-l border-slate-200 dark:border-slate-800">
              Hàng Nghìn (千)
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {HUNDRED_THOUSAND_ROWS.map((row) => (
              <div key={row.digit} className="grid grid-cols-2">
                {/* Cột Trái: Hàng Trăm */}
                <div
                  className={`p-2.5 flex flex-col justify-between gap-1.5 ${
                    row.hundredMutated
                      ? 'bg-amber-50/65 dark:bg-amber-950/20'
                      : 'bg-white dark:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {row.hundredNum}{' '}
                      <span className="font-semibold text-slate-400 dark:text-slate-500">
                        ({row.hundredKanji})
                      </span>
                    </span>
                    {row.hundredMutated && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-[10px] font-bold text-amber-800 dark:text-amber-200">
                        Biến âm
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => speakJapanese(row.hundredReading)}
                    className="w-full min-h-[34px] px-2.5 py-1 rounded-lg bg-slate-50 active:bg-indigo-50 dark:bg-slate-800/90 dark:active:bg-indigo-900/50 border border-slate-200/80 dark:border-slate-700 inline-flex items-center gap-1.5 cursor-pointer touch-manipulation active:scale-95"
                  >
                    <span className="text-xs shrink-0">🔊</span>
                    <span
                      className={`text-xs font-extrabold truncate ${
                        row.hundredMutated
                          ? 'text-amber-700 dark:text-amber-300'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {row.hundredReading}
                    </span>
                  </button>
                </div>

                {/* Cột Phải: Hàng Nghìn */}
                <div
                  className={`p-2.5 border-l border-slate-100 dark:border-slate-800/80 flex flex-col justify-between gap-1.5 ${
                    row.thousandMutated
                      ? 'bg-amber-50/65 dark:bg-amber-950/20'
                      : 'bg-white dark:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {row.thousandNum}{' '}
                      <span className="font-semibold text-slate-400 dark:text-slate-500">
                        ({row.thousandKanji})
                      </span>
                    </span>
                    {row.thousandMutated && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-[10px] font-bold text-amber-800 dark:text-amber-200">
                        Biến âm
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => speakJapanese(row.thousandReading)}
                    className="w-full min-h-[34px] px-2.5 py-1 rounded-lg bg-slate-50 active:bg-indigo-50 dark:bg-slate-800/90 dark:active:bg-indigo-900/50 border border-slate-200/80 dark:border-slate-700 inline-flex items-center gap-1.5 cursor-pointer touch-manipulation active:scale-95"
                  >
                    <span className="text-xs shrink-0">🔊</span>
                    <span
                      className={`text-xs font-extrabold truncate ${
                        row.thousandMutated
                          ? 'text-amber-700 dark:text-amber-300'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {row.thousandReading}
                    </span>
                  </button>

                  {row.thousandCaution && (
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-300 font-medium leading-snug">
                      {row.thousandCaution}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DESKTOP / TABLET VIEW (>= md): Bảng song song 4 cột */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full min-w-[640px] text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-3.5 font-extrabold">Hàng Trăm (百)</th>
                <th className="py-3 px-3.5 font-extrabold">Cách đọc Trăm</th>
                <th className="py-3 px-3.5 font-extrabold border-l border-slate-200 dark:border-slate-800">
                  Hàng Nghìn (千)
                </th>
                <th className="py-3 px-3.5 font-extrabold">Cách đọc Nghìn &amp; Lưu ý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {HUNDRED_THOUSAND_ROWS.map((row) => (
                <tr
                  key={row.digit}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/35 transition-colors"
                >
                  <td className="py-2.5 px-3.5 font-bold text-slate-800 dark:text-slate-200">
                    {row.hundredNum}{' '}
                    <span className="text-slate-400 font-normal">({row.hundredKanji})</span>
                  </td>
                  <td
                    className={`py-2.5 px-3.5 ${
                      row.hundredMutated ? 'bg-amber-50/65 dark:bg-amber-950/20' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => speakJapanese(row.hundredReading)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-900/60 text-xs flex items-center justify-center cursor-pointer shrink-0"
                      >
                        🔊
                      </button>
                      <span
                        className={`font-extrabold ${
                          row.hundredMutated
                            ? 'text-amber-700 dark:text-amber-300'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {row.hundredReading}
                      </span>
                      {row.hundredMutated && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-[10px] font-bold text-amber-800 dark:text-amber-200">
                          Biến âm
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-2.5 px-3.5 font-bold text-slate-800 dark:text-slate-200 border-l border-slate-200 dark:border-slate-800">
                    {row.thousandNum}{' '}
                    <span className="text-slate-400 font-normal">({row.thousandKanji})</span>
                  </td>
                  <td
                    className={`py-2.5 px-3.5 ${
                      row.thousandMutated ? 'bg-amber-50/65 dark:bg-amber-950/20' : ''
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => speakJapanese(row.thousandReading)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-900/60 text-xs flex items-center justify-center cursor-pointer shrink-0"
                      >
                        🔊
                      </button>
                      <span
                        className={`font-extrabold ${
                          row.thousandMutated
                            ? 'text-amber-700 dark:text-amber-300'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {row.thousandReading}
                      </span>
                      {row.thousandMutated && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-[10px] font-bold text-amber-800 dark:text-amber-200">
                          Biến âm
                        </span>
                      )}
                      {row.thousandCaution && (
                        <span className="text-[11px] text-indigo-600 dark:text-indigo-300 font-medium">
                          • {row.thousandCaution}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mẹo tách 4 số 0 sang Hàng Vạn (万) */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-5 space-y-3 sm:space-y-3.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
            🧭 Mẹo quy đổi tiền Yên từ 10,000¥ trở lên trong 2 giây (Đếm lùi 4 chữ số đặt vạch |)
          </h3>

          {/* MOBILE VIEW (< md): Thẻ công thức Hàng Vạn (万) gọn cho iPhone 15 Pro */}
          <div className="md:hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {MAN_CONVERSION_ROWS.map((r) => (
              <div key={r.yen} className="p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      {r.yen}
                    </span>
                    <span className="text-slate-400 text-xs">➔</span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 border border-rose-200/70 dark:border-rose-800/60 font-mono text-xs font-bold text-rose-600 dark:text-rose-300">
                      {r.split4}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {r.kanji}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => speakJapanese(r.reading.replace(/\s+/g, ''))}
                  className="w-full min-h-[36px] px-3 py-1.5 rounded-xl bg-indigo-50/85 active:bg-indigo-100 dark:bg-slate-800 dark:active:bg-indigo-900/60 border border-indigo-200/70 dark:border-slate-700 inline-flex items-center gap-1.5 cursor-pointer touch-manipulation active:scale-[0.99]"
                >
                  <span className="text-xs shrink-0">🔊</span>
                  <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                    {r.reading}
                  </span>
                </button>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {r.vnHint}
                </p>
              </div>
            ))}
          </div>

          {/* DESKTOP / TABLET VIEW (>= md): Bảng 5 cột đầy đủ */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full min-w-[640px] text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2.5 px-3.5 font-extrabold">Số tiền</th>
                  <th className="py-2.5 px-3.5 font-extrabold">Tách 4 số cuối</th>
                  <th className="py-2.5 px-3.5 font-extrabold">Chữ Hán</th>
                  <th className="py-2.5 px-3.5 font-extrabold">Cách đọc chuẩn</th>
                  <th className="py-2.5 px-3.5 font-extrabold">Mẹo đối chiếu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {MAN_CONVERSION_ROWS.map((r) => (
                  <tr key={r.yen} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3.5 font-black text-slate-900 dark:text-white">
                      {r.yen}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono font-bold text-rose-600 dark:text-rose-400">
                      {r.split4}
                    </td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-700 dark:text-slate-200">
                      {r.kanji}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <button
                        type="button"
                        onClick={() => speakJapanese(r.reading.replace(/\s+/g, ''))}
                        className="inline-flex items-center space-x-1.5 font-extrabold text-indigo-700 dark:text-indigo-300 hover:underline cursor-pointer"
                      >
                        <span>🔊</span>
                        <span>{r.reading}</span>
                      </button>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-300">
                      {r.vnHint}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hội thoại mua hàng Bài 3 */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 text-xs sm:text-sm">
              <p className="font-bold text-slate-900 dark:text-white leading-relaxed">
                💬 Mẫu hỏi giá &amp; mua hàng Bài 3:{' '}
                <span className="text-indigo-600 dark:text-indigo-400">
                  すみません。この ネクタイは いくらですか。
                </span>
              </p>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400 leading-relaxed">
                → １万５千円（いちまん ごせんえん）です。 — じゃ、これを ください。
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Xin lỗi, chiếc cà vạt này bao nhiêu tiền? → 15,000 yên ạ. — Vậy cho tôi lấy cái này.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                speakJapanese(
                  'すみません。このネクタイは いくらですか。いちまんごせんえんです。じゃ、これをください。'
                )
              }
              className="w-full sm:w-auto min-h-[38px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-100 active:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-900/60 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer shrink-0 touch-manipulation active:scale-[0.98]"
            >
              🔊 Nghe hội thoại
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PHẦN 2: CÁCH ĐẾM TẦNG LẦU (～階 / ～かい・～がい & 地下 / ちか)        */}
      {/* ===================================================================== */}
      <section className="rounded-2xl bg-white dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-7 shadow-sm space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5 sm:pb-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 text-xs font-extrabold mb-1.5">
              Phần 2 • Hỏi vị trí quầy hàng &amp; tòa nhà Bài 3
            </span>
            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
              2. Cách đếm tầng lầu (～階 / ～かい・～がい) &amp; Tầng hầm (地下 / ちか)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => jumpToPractice('floors')}
            className="w-full sm:w-auto min-h-[42px] inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm transition-colors cursor-pointer shrink-0 touch-manipulation active:scale-[0.98]"
          >
            <span>⚡</span>
            <span>Luyện phản xạ Đếm tầng</span>
          </button>
        </div>

        {/* MOBILE VIEW (< md): Thẻ tra cứu tầng lầu chuẩn iPhone 15 Pro (393px) */}
        <div className="md:hidden rounded-xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
          {FLOOR_ROWS.map((row) => {
            const cardBg =
              row.type === 'voiced'
                ? 'bg-rose-50/65 dark:bg-rose-950/25'
                : row.type === 'geminate'
                ? 'bg-amber-50/50 dark:bg-amber-950/15'
                : row.type === 'basement' || row.type === 'question'
                ? 'bg-indigo-50/50 dark:bg-indigo-950/20'
                : 'bg-white dark:bg-slate-900/40';
            return (
              <div key={row.floor} className={`p-3 space-y-1.5 ${cardBg}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <span className="min-w-[40px] h-8 px-2 rounded-lg bg-white/90 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 inline-flex items-center justify-center font-black text-xs text-slate-900 dark:text-white shrink-0">
                      {row.floor}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {row.kanji}
                    </span>
                    {row.type === 'voiced' && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/70 text-[10px] font-bold text-rose-700 dark:text-rose-200">
                        Âm đục がい
                      </span>
                    )}
                    {row.type === 'geminate' && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-[10px] font-bold text-amber-800 dark:text-amber-200">
                        Biến âm っ
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => speakJapanese(row.tts)}
                    className="min-h-[36px] px-2.5 py-1 rounded-xl bg-white/95 active:bg-indigo-50 dark:bg-slate-800 dark:active:bg-indigo-900/60 border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5 shrink-0 cursor-pointer touch-manipulation active:scale-95"
                  >
                    <span className="text-xs">🔊</span>
                    <span
                      className={`text-xs font-extrabold ${
                        row.type === 'voiced'
                          ? 'text-rose-600 dark:text-rose-300'
                          : row.type === 'geminate'
                          ? 'text-amber-700 dark:text-amber-300'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {row.reading}
                    </span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {row.note}
                </p>
              </div>
            );
          })}
        </div>

        {/* DESKTOP / TABLET VIEW (>= md): Bảng 4 cột đầy đủ */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full min-w-[640px] text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-3.5 font-extrabold w-28">Ký hiệu</th>
                <th className="py-3 px-3.5 font-extrabold w-40">Chữ Hán</th>
                <th className="py-3 px-3.5 font-extrabold w-56">Cách đọc chuẩn</th>
                <th className="py-3 px-3.5 font-extrabold">Lưu ý quy tắc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {FLOOR_ROWS.map((row) => {
                const bg =
                  row.type === 'voiced'
                    ? 'bg-rose-50/60 dark:bg-rose-950/25'
                    : row.type === 'geminate'
                    ? 'bg-amber-50/45 dark:bg-amber-950/15'
                    : row.type === 'basement' || row.type === 'question'
                    ? 'bg-indigo-50/45 dark:bg-indigo-950/20'
                    : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40';
                return (
                  <tr key={row.floor} className={`${bg} transition-colors`}>
                    <td className="py-2.5 px-3.5 font-black text-slate-900 dark:text-white">
                      {row.floor}
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-slate-700 dark:text-slate-200">
                      {row.kanji}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => speakJapanese(row.tts)}
                          className="w-7 h-7 rounded-lg bg-white/90 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-900/60 border border-slate-200/70 dark:border-slate-700 text-xs flex items-center justify-center cursor-pointer shrink-0"
                        >
                          🔊
                        </button>
                        <span
                          className={`font-extrabold ${
                            row.type === 'voiced'
                              ? 'text-rose-600 dark:text-rose-300'
                              : row.type === 'geminate'
                              ? 'text-amber-700 dark:text-amber-300'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {row.reading}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-300">
                      {row.type === 'voiced' && (
                        <span className="inline-block mr-1.5 px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/70 text-[10px] font-bold text-rose-700 dark:text-rose-200">
                          Âm đục がい
                        </span>
                      )}
                      {row.type === 'geminate' && (
                        <span className="inline-block mr-1.5 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-[10px] font-bold text-amber-800 dark:text-amber-200">
                          Biến âm っ
                        </span>
                      )}
                      {row.note}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PHẦN 3: PHÒNG LUYỆN PHẢN XẠ CHỐNG BẪY (10S GIẢM DẦN)                 */}
      {/* ===================================================================== */}
      <div ref={practiceRef} className="scroll-mt-4">
        <Lesson3PracticeArena
          topic={practiceTopic}
          onTopicChange={setPracticeTopic}
        />
      </div>
    </div>
  );
}
