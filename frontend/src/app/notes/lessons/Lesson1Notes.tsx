'use client';

import React, { useCallback, useRef, useState } from 'react';
import Lesson1PracticeArena from './Lesson1PracticeArena';
import { PracticeTopic } from './lesson1PracticeGenerator';

interface BaseNumberRow {
  num: string;
  kanji: string;
  reading: string;
  tts: string;
  preferred?: string;
  note: string;
}

interface AgeRow {
  label: string;
  kanji: string;
  ageReading: string;
  tts: string;
  ordinalReading: string;
  type: 'normal' | 'geminate' | 'special' | 'caution' | 'question';
  note: string;
}

const BASE_NUMBERS: BaseNumberRow[] = [
  {
    num: '0',
    kanji: '零 / 〇',
    reading: 'ゼロ / れい',
    tts: 'ゼロ',
    preferred: 'ゼロ',
    note: 'Giao tiếp hằng ngày hay dùng ゼロ; れい hay gặp trong điểm số, nhiệt độ, thông báo.',
  },
  { num: '1', kanji: '一', reading: 'いち', tts: 'いち', note: 'Số đếm gốc chuẩn.' },
  { num: '2', kanji: '二', reading: 'に', tts: 'に', note: 'Số đếm gốc chuẩn.' },
  { num: '3', kanji: '三', reading: 'さん', tts: 'さん', note: 'Số đếm gốc chuẩn.' },
  {
    num: '4',
    kanji: '四',
    reading: 'よん / し',
    tts: 'よん',
    preferred: 'よん',
    note: 'Luôn ưu tiên よん khi ghép lượng từ (tuổi, người, thứ tự...); し chủ yếu dùng trong tháng 4 (しがつ).',
  },
  { num: '5', kanji: '五', reading: 'ご', tts: 'ご', note: 'Số đếm gốc chuẩn.' },
  { num: '6', kanji: '六', reading: 'ろく', tts: 'ろく', note: 'Số đếm gốc chuẩn.' },
  {
    num: '7',
    kanji: '七',
    reading: 'なな / しち',
    tts: 'なな',
    preferred: 'なな',
    note: 'Ưu tiên なな để tránh nghe nhầm với いち (1); しち dùng cố định trong tháng 7 (しちがつ), 7 giờ (しちじ).',
  },
  { num: '8', kanji: '八', reading: 'はち', tts: 'はち', note: 'Số đếm gốc chuẩn.' },
  {
    num: '9',
    kanji: '九',
    reading: 'きゅう / く',
    tts: 'きゅう',
    preferred: 'きゅう',
    note: 'Ưu tiên きゅう trong hầu hết trường hợp; く dùng cố định trong tháng 9 (くがつ), 9 giờ (くじ).',
  },
  { num: '10', kanji: '十', reading: 'じゅう', tts: 'じゅう', note: 'Mốc tròn chục đầu tiên.' },
];

const AGE_TABLE: AgeRow[] = [
  {
    label: '1',
    kanji: '一歳 (一才)',
    ageReading: 'いっさい',
    tts: 'いっさい',
    ordinalReading: 'いちばん',
    type: 'geminate',
    note: 'Biến âm いち → いっさい (số thứ tự vẫn là いちばん).',
  },
  {
    label: '2',
    kanji: '二歳 (二才)',
    ageReading: 'にさい',
    tts: 'にさい',
    ordinalReading: 'にばん',
    type: 'normal',
    note: 'Ghép thẳng số gốc + さい.',
  },
  {
    label: '3',
    kanji: '三歳 (三才)',
    ageReading: 'さんさい',
    tts: 'さんさい',
    ordinalReading: 'さんばん',
    type: 'normal',
    note: 'Ghép thẳng số gốc + さい.',
  },
  {
    label: '4',
    kanji: '四歳 (四才)',
    ageReading: 'よんさい',
    tts: 'よんさい',
    ordinalReading: 'よんばん',
    type: 'caution',
    note: 'Chỉ dùng よんさい (tuyệt đối không đọc しさい).',
  },
  {
    label: '5',
    kanji: '五歳 (五才)',
    ageReading: 'ごさい',
    tts: 'ごさい',
    ordinalReading: 'ごばん',
    type: 'normal',
    note: 'Ghép thẳng số gốc + さい.',
  },
  {
    label: '6',
    kanji: '六歳 (六才)',
    ageReading: 'ろくさい',
    tts: 'ろくさい',
    ordinalReading: 'ろくばん',
    type: 'caution',
    note: 'Giữ nguyên ろくさい — KHÔNG biến âm thành ろっさい.',
  },
  {
    label: '7',
    kanji: '七歳 (七才)',
    ageReading: 'ななさい',
    tts: 'ななさい',
    ordinalReading: 'ななばん',
    type: 'caution',
    note: 'Dùng ななさい (không đọc しちさい).',
  },
  {
    label: '8',
    kanji: '八歳 (八才)',
    ageReading: 'はっさい',
    tts: 'はっさい',
    ordinalReading: 'はちばん',
    type: 'geminate',
    note: 'Biến âm はち → はっさい (số thứ tự vẫn là はちばん).',
  },
  {
    label: '9',
    kanji: '九歳 (九才)',
    ageReading: 'きゅうさい',
    tts: 'きゅうさい',
    ordinalReading: 'きゅうばん',
    type: 'caution',
    note: 'Chỉ dùng きゅうさい (không đọc くさい).',
  },
  {
    label: '10',
    kanji: '十歳 (十才)',
    ageReading: 'じゅっさい (じっさい)',
    tts: 'じゅっさい',
    ordinalReading: 'じゅうばん',
    type: 'geminate',
    note: 'Biến âm じゅう → じゅっさい (hoặc じっさい).',
  },
  {
    label: '11',
    kanji: '十一歳',
    ageReading: 'じゅういっさい',
    tts: 'じゅういっさい',
    ordinalReading: 'じゅういちばん',
    type: 'geminate',
    note: 'Hàng đơn vị là 1 nên vẫn biến âm → いっさい.',
  },
  {
    label: '18',
    kanji: '十八歳',
    ageReading: 'じゅうはっさい',
    tts: 'じゅうはっさい',
    ordinalReading: 'じゅうはちばん',
    type: 'geminate',
    note: 'Hàng đơn vị là 8 nên vẫn biến âm → はっさい.',
  },
  {
    label: '20',
    kanji: '二十歳',
    ageReading: 'はたち',
    tts: 'はたち',
    ordinalReading: 'にじゅうばん',
    type: 'special',
    note: 'Ngoại lệ duy nhất! Không đọc にじゅっさい và KHÔNG thêm さい sau はたち.',
  },
  {
    label: '21',
    kanji: '二十一歳',
    ageReading: 'にじゅういっさい',
    tts: 'にじゅういっさい',
    ordinalReading: 'にじゅういちばん',
    type: 'geminate',
    note: 'Từ 21 tuổi quay lại quy tắc ghép bình thường + biến âm ở số 1.',
  },
  {
    label: '30',
    kanji: '三十歳',
    ageReading: 'さんじゅっさい',
    tts: 'さんじゅっさい',
    ordinalReading: 'さんじゅうばん',
    type: 'geminate',
    note: 'Các mốc tròn chục (30, 40, 50...) đều biến âm じゅう → じゅっさい.',
  },
  {
    label: 'Hỏi',
    kanji: '何歳 / おいくつ',
    ageReading: 'なんさい / おいくつ',
    tts: 'おいくつですか',
    ordinalReading: 'なんばん',
    type: 'question',
    note: 'なんさい (thông thường) • おいくつ (lịch sự/kính trọng với người lớn, người mới quen).',
  },
];

const TWO_DIGIT_EXAMPLES = [
  { num: '14', reading: 'じゅうよん', desc: '10 (じゅう) + 4 (よん)' },
  { num: '19', reading: 'じゅうきゅう', desc: '10 (じゅう) + 9 (きゅう)' },
  { num: '20', reading: 'にじゅう', desc: '2 (に) × 10 (じゅう)' },
  { num: '40', reading: 'よんじゅう', desc: 'Luôn dùng よん (không đọc しじゅう)' },
  { num: '75', reading: 'ななじゅうご', desc: '70 (ななじゅう) + 5 (ご)' },
  { num: '99', reading: 'きゅうじゅうきゅう', desc: '90 (きゅうじゅう) + 9 (きゅう)' },
];

export default function Lesson1Notes() {
  const [practiceTopic, setPracticeTopic] = useState<PracticeTopic>('numbers');
  const practiceRef = useRef<HTMLDivElement | null>(null);

  const jumpToPractice = useCallback((targetTopic: PracticeTopic) => {
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

    // Prevent iOS Safari WebKit garbage-collecting active utterance mid-speech
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
      {/* PHẦN 1: SỐ ĐẾM CƠ BẢN (0 - 99)                                        */}
      {/* ===================================================================== */}
      <section className="rounded-2xl bg-white dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-7 shadow-sm space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5 sm:pb-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300 text-xs font-extrabold mb-1.5">
              Phần 1 • Nền tảng bắt buộc
            </span>
            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
              1. Hệ thống số đếm cơ bản (0 – 99)
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
            <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-500">
              Nhấn nút 🔊 để nghe phát âm
            </span>
            <button
              type="button"
              onClick={() => jumpToPractice('numbers')}
              className="w-full sm:w-auto min-h-[42px] inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-sm transition-colors cursor-pointer touch-manipulation active:scale-[0.98]"
            >
              <span>⚡</span>
              <span>Luyện phản xạ Số đếm (1–99)</span>
            </button>
          </div>
        </div>

        {/* MOBILE VIEW (< md): Thẻ dòng gọn chuẩn iPhone 15 Pro (393px) — Không cần kéo ngang */}
        <div className="md:hidden rounded-xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
          {BASE_NUMBERS.map((row) => {
            const isHighlighted = Boolean(row.preferred);
            const showFullNote = row.note !== 'Số đếm gốc chuẩn.';
            return (
              <div
                key={row.num}
                className={`p-3 ${
                  isHighlighted
                    ? 'bg-indigo-50/40 dark:bg-indigo-950/25'
                    : 'bg-white dark:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center font-black text-sm text-slate-900 dark:text-white shrink-0">
                      {row.num}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {row.kanji}
                        </span>
                        {row.preferred ? (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/70 text-[10px] font-bold text-indigo-700 dark:text-indigo-200">
                            Ưu tiên: {row.preferred}
                          </span>
                        ) : !showFullNote ? (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            • Số gốc chuẩn
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => speakJapanese(row.tts)}
                    className="min-h-[36px] px-3 py-1 rounded-xl bg-indigo-50/90 active:bg-indigo-100 dark:bg-slate-800 dark:active:bg-indigo-900/60 border border-indigo-200/70 dark:border-slate-700 inline-flex items-center gap-1.5 shrink-0 cursor-pointer touch-manipulation active:scale-95"
                  >
                    <span className="text-xs">🔊</span>
                    <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                      {row.reading}
                    </span>
                  </button>
                </div>

                {showFullNote && (
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {row.note}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* DESKTOP / TABLET VIEW (>= md): Bảng 4 cột đầy đủ */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full min-w-[620px] text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-3.5 font-extrabold w-16">Số</th>
                <th className="py-3 px-3.5 font-extrabold w-24">Chữ Hán</th>
                <th className="py-3 px-3.5 font-extrabold w-48">Cách đọc (Hiragana)</th>
                <th className="py-3 px-3.5 font-extrabold">Lưu ý sử dụng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {BASE_NUMBERS.map((row) => (
                <tr
                  key={row.num}
                  className={
                    row.preferred
                      ? 'bg-indigo-50/35 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/35 transition-colors'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors'
                  }
                >
                  <td className="py-2.5 px-3.5 font-black text-slate-900 dark:text-white">
                    {row.num}
                  </td>
                  <td className="py-2.5 px-3.5 font-bold text-slate-700 dark:text-slate-200">
                    {row.kanji}
                  </td>
                  <td className="py-2.5 px-3.5">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => speakJapanese(row.tts)}
                        title={`Nghe phát âm ${row.tts}`}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-900/60 text-xs flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      >
                        🔊
                      </button>
                      <span className="font-bold text-indigo-700 dark:text-indigo-300">
                        {row.reading}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-300 leading-relaxed">
                    {row.preferred && (
                      <span className="inline-block mr-1.5 px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/70 text-[10px] font-bold text-indigo-700 dark:text-indigo-200">
                        Ưu tiên: {row.preferred}
                      </span>
                    )}
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Công thức ghép 11 - 99 */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
            📐 Công thức ghép số từ 11 đến 99 (Giống hệt tư duy tiếng Việt)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 text-xs sm:text-sm">
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 sm:p-3.5 space-y-1">
              <p className="font-extrabold text-indigo-600 dark:text-indigo-400">
                ① Từ 11 – 19
              </p>
              <p className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-bold">
                じゅう + [hàng đơn vị]
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                VD: 11 = じゅういち • 14 = じゅうよん • 17 = じゅうなな
              </p>
            </div>

            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 sm:p-3.5 space-y-1">
              <p className="font-extrabold text-indigo-600 dark:text-indigo-400">
                ② Tròn chục 20 – 90
              </p>
              <p className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-bold">
                [hàng chục] + じゅう
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                40 = <strong>よんじゅう</strong>, 70 = <strong>ななじゅう</strong>, 90 = <strong>きゅうじゅう</strong>
              </p>
            </div>

            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 sm:p-3.5 space-y-1">
              <p className="font-extrabold text-indigo-600 dark:text-indigo-400">
                ③ Số lẻ 2 chữ số bất kỳ
              </p>
              <p className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-bold">
                [chục] + じゅう + [đơn vị]
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                VD: 25 = にじゅうご • 48 = よんじゅうはち
              </p>
            </div>
          </div>

          {/* Mẫu nghe nhanh số 2 chữ số — Lưới 2 cột cân đối trên iPhone 15 Pro */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 pt-0.5">
            {TWO_DIGIT_EXAMPLES.map((ex) => (
              <button
                key={ex.num}
                type="button"
                onClick={() => speakJapanese(ex.reading)}
                title={ex.desc}
                className="min-h-[38px] inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 active:bg-indigo-50 dark:bg-slate-900 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-800 text-xs transition-colors cursor-pointer touch-manipulation active:scale-95 min-w-0"
              >
                <span className="shrink-0">🔊</span>
                <span className="font-black text-slate-900 dark:text-white shrink-0">{ex.num}:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-300 truncate">{ex.reading}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PHẦN 2: CÁCH ĐẾM TUỔI (～歳 / ～さい) & ĐỐI CHIẾU SỐ THỨ TỰ           */}
      {/* ===================================================================== */}
      <section className="rounded-2xl bg-white dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-7 shadow-sm space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5 sm:pb-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 text-xs font-extrabold mb-1.5">
              Phần 2 • Trọng tâm Bài 1 (～歳 / giản lược ～才)
            </span>
            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
              2. Cách đếm tuổi (～さい) &amp; Khác biệt với số thứ tự (～ばん)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => jumpToPractice('age')}
            className="w-full sm:w-auto min-h-[42px] inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm transition-colors cursor-pointer shrink-0 touch-manipulation active:scale-[0.98]"
          >
            <span>⚡</span>
            <span>Luyện phản xạ Đếm tuổi</span>
          </button>
        </div>

        {/* 3 Quy tắc vàng */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3.5">
          <div className="rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/60 p-3.5 sm:p-4 space-y-1">
            <p className="text-xs font-extrabold uppercase tracking-wide text-amber-700 dark:text-amber-300">
              ⚠️ Quy tắc 1: Biến âm っ (1, 8, 10)
            </p>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              Số tận cùng bằng <strong>1, 8</strong> hoặc <strong>tròn chục (10, 30, 40...)</strong> đều biến âm thành <strong>っさい</strong>:{' '}
              <span className="font-bold text-amber-800 dark:text-amber-200">
                いっさい (1), はっさい (8), じゅっさい (10)
              </span>
              .
            </p>
          </div>

          <div className="rounded-2xl bg-rose-50/70 dark:bg-rose-950/25 border border-rose-200/80 dark:border-rose-800/60 p-3.5 sm:p-4 space-y-1">
            <p className="text-xs font-extrabold uppercase tracking-wide text-rose-700 dark:text-rose-300">
              ⭐ Quy tắc 2: Ngoại lệ 20 tuổi
            </p>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              Riêng <strong>20 tuổi</strong> đọc đặc biệt là{' '}
              <strong className="text-rose-700 dark:text-rose-300">はたち</strong> (không đọc にじゅっさい). Tuyệt đối <strong>không gắn thêm さい</strong> sau はたち!
            </p>
          </div>

          <div className="rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/25 border border-indigo-200/80 dark:border-indigo-800/60 p-3.5 sm:p-4 space-y-1">
            <p className="text-xs font-extrabold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
              💡 Quy tắc 3: Chống nhầm lẫn
            </p>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              <strong>6 tuổi = ろくさい</strong> (giữ nguyên, không đọc ろっさい). Số 4, 7, 9 luôn dùng{' '}
              <strong>よん・なな・きゅう</strong>. Còn số thứ tự (<strong>～ばん</strong>) <strong>không bao giờ biến âm</strong>.
            </p>
          </div>
        </div>

        {/* MOBILE VIEW (< md): Thẻ tra cứu tuổi gọn chuẩn iPhone 15 Pro (393px) */}
        <div className="md:hidden rounded-xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
          {AGE_TABLE.map((row) => {
            const cardBg =
              row.type === 'special'
                ? 'bg-rose-50/65 dark:bg-rose-950/25'
                : row.type === 'geminate'
                ? 'bg-amber-50/50 dark:bg-amber-950/15'
                : row.type === 'question'
                ? 'bg-indigo-50/55 dark:bg-indigo-950/25'
                : 'bg-white dark:bg-slate-900/40';

            return (
              <div key={row.label} className={`p-3 space-y-1.5 ${cardBg}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <span className="min-w-[36px] h-8 px-2 rounded-lg bg-white/90 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 inline-flex items-center justify-center font-black text-xs text-slate-900 dark:text-white shrink-0">
                      {row.label}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {row.kanji}
                    </span>
                    {row.type === 'geminate' && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-[10px] font-bold text-amber-800 dark:text-amber-200">
                        Biến âm っ
                      </span>
                    )}
                    {row.type === 'special' && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/70 text-[10px] font-bold text-rose-700 dark:text-rose-200">
                        Ngoại lệ
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
                        row.type === 'special'
                          ? 'text-rose-600 dark:text-rose-300'
                          : row.type === 'geminate'
                          ? 'text-amber-700 dark:text-amber-300'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {row.ageReading}
                    </span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Số thứ tự: <strong className="text-slate-700 dark:text-slate-200">{row.ordinalReading}</strong>
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span>{row.note}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP / TABLET VIEW (>= md): Bảng 5 cột đầy đủ */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full min-w-[680px] text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-3.5 font-extrabold w-16">Mốc</th>
                <th className="py-3 px-3.5 font-extrabold w-32">Chữ Hán</th>
                <th className="py-3 px-3.5 font-extrabold w-56">Đếm tuổi (～さい)</th>
                <th className="py-3 px-3.5 font-extrabold w-40">Số thứ tự (～ばん)</th>
                <th className="py-3 px-3.5 font-extrabold">Ghi chú &amp; Khác biệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {AGE_TABLE.map((row) => {
                const rowBg =
                  row.type === 'special'
                    ? 'bg-rose-50/60 dark:bg-rose-950/25'
                    : row.type === 'geminate'
                    ? 'bg-amber-50/45 dark:bg-amber-950/15'
                    : row.type === 'question'
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/25'
                    : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40';

                return (
                  <tr key={row.label} className={`${rowBg} transition-colors`}>
                    <td className="py-2.5 px-3.5 font-black text-slate-900 dark:text-white">
                      {row.label}
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-slate-700 dark:text-slate-300">
                      {row.kanji}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => speakJapanese(row.tts)}
                          title={`Nghe phát âm ${row.tts}`}
                          className="w-7 h-7 rounded-lg bg-white/90 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-900/60 border border-slate-200/70 dark:border-slate-700 text-xs flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        >
                          🔊
                        </button>
                        <span
                          className={`font-extrabold ${
                            row.type === 'special'
                              ? 'text-rose-600 dark:text-rose-300'
                              : row.type === 'geminate'
                              ? 'text-amber-700 dark:text-amber-300'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {row.ageReading}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-slate-500 dark:text-slate-400">
                      {row.ordinalReading}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-300 leading-relaxed">
                      {row.type === 'geminate' && (
                        <span className="inline-block mr-1.5 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-[10px] font-bold text-amber-800 dark:text-amber-200">
                          Biến âm っ
                        </span>
                      )}
                      {row.type === 'special' && (
                        <span className="inline-block mr-1.5 px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/70 text-[10px] font-bold text-rose-700 dark:text-rose-200">
                          Ngoại lệ
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

        {/* Mẫu hội thoại Hỏi & Trả lời tuổi trong Bài 1 */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-5 space-y-3">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            💬 Mẫu câu hỏi &amp; trả lời tuổi trong Bài 1
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 sm:gap-3 text-xs sm:text-sm">
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300">
                  Hỏi thông thường
                </span>
                <button
                  type="button"
                  onClick={() => speakJapanese('たろうちゃんは なんさいですか。はっさいです。')}
                  className="min-h-[32px] text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-100 active:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-900/60 font-bold cursor-pointer touch-manipulation active:scale-95"
                >
                  🔊 Nghe
                </button>
              </div>
              <p className="font-bold text-slate-900 dark:text-white pt-0.5 leading-relaxed">
                たろうちゃんは <span className="text-indigo-600 dark:text-indigo-400">なんさい</span>ですか。
              </p>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                → ８さい（はっさい）です。
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bé Taro mấy tuổi? → Cháu 8 tuổi.
              </p>
            </div>

            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300">
                  Hỏi lịch sự / kính trọng
                </span>
                <button
                  type="button"
                  onClick={() => speakJapanese('ミラーさんは おいくつですか。にじゅうはっさいです。')}
                  className="min-h-[32px] text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-100 active:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-900/60 font-bold cursor-pointer touch-manipulation active:scale-95"
                >
                  🔊 Nghe
                </button>
              </div>
              <p className="font-bold text-slate-900 dark:text-white pt-0.5 leading-relaxed">
                ミラーさんは <span className="text-purple-600 dark:text-purple-400">おいくつ</span>ですか。
              </p>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                → ２８さい（にじゅうはっさい）です。
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Anh Miller bao nhiêu tuổi ạ? → Tôi 28 tuổi.
              </p>
            </div>

            <div className="rounded-xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/50 p-3.5 sm:p-4 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-300">
                  Trả lời mốc 20 tuổi
                </span>
                <button
                  type="button"
                  onClick={() => speakJapanese('わたしは はたちです。')}
                  className="min-h-[32px] text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-100 active:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-900/60 font-bold cursor-pointer touch-manipulation active:scale-95"
                >
                  🔊 Nghe
                </button>
              </div>
              <p className="font-bold text-slate-900 dark:text-white pt-0.5 leading-relaxed">
                わたしは <span className="text-rose-600 dark:text-rose-400">はたち</span>です。
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                ✕ Sai: はたちさいです / にじゅっさいです
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tôi 20 tuổi (từ はたち đã bao hàm nghĩa &ldquo;20 tuổi&rdquo;).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PHẦN 3: PHÒNG LUYỆN PHẢN XẠ CHỐNG BẪY (10S GIẢM DẦN)                 */}
      {/* ===================================================================== */}
      <div ref={practiceRef} className="scroll-mt-4">
        <Lesson1PracticeArena
          topic={practiceTopic}
          onTopicChange={setPracticeTopic}
        />
      </div>
    </div>
  );
}
