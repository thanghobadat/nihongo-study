'use client';

import React, { useCallback, useRef, useState } from 'react';
import Lesson4PracticeArena from './Lesson4PracticeArena';
import { Lesson4Topic } from './lesson4PracticeGenerator';

interface Lesson4VerbItem {
  id: string;
  meaning: string;
  nonPastAffKanji: string;
  nonPastAffHira: string;
  nonPastNegKanji: string;
  nonPastNegHira: string;
  pastAffKanji: string;
  pastAffHira: string;
  pastNegKanji: string;
  pastNegHira: string;
}

const LESSON4_VERBS: Lesson4VerbItem[] = [
  {
    id: 'hatarakimasu',
    meaning: 'làm việc',
    nonPastAffKanji: '働きます',
    nonPastAffHira: 'はたらきます',
    nonPastNegKanji: '働きません',
    nonPastNegHira: 'はたらきません',
    pastAffKanji: '働きました',
    pastAffHira: 'はたらきました',
    pastNegKanji: '働きませんでした',
    pastNegHira: 'はたらきませんでした',
  },
  {
    id: 'okimasu',
    meaning: 'thức dậy',
    nonPastAffKanji: '起きます',
    nonPastAffHira: 'おきます',
    nonPastNegKanji: '起きません',
    nonPastNegHira: 'おきません',
    pastAffKanji: '起きました',
    pastAffHira: 'おきました',
    pastNegKanji: '起きませんでした',
    pastNegHira: 'おきませんでした',
  },
  {
    id: 'nemasu',
    meaning: 'ngủ',
    nonPastAffKanji: '寝ます',
    nonPastAffHira: 'ねます',
    nonPastNegKanji: '寝ません',
    nonPastNegHira: 'ねません',
    pastAffKanji: '寝ました',
    pastAffHira: 'ねました',
    pastNegKanji: '寝ませんでした',
    pastNegHira: 'ねませんでした',
  },
  {
    id: 'yasumimasu',
    meaning: 'nghỉ ngơi',
    nonPastAffKanji: '休みます',
    nonPastAffHira: 'やすみます',
    nonPastNegKanji: '休みません',
    nonPastNegHira: 'やすみません',
    pastAffKanji: '休みました',
    pastAffHira: 'やすみました',
    pastNegKanji: '休みませんでした',
    pastNegHira: 'やすみませんでした',
  },
  {
    id: 'benkyoushimasu',
    meaning: 'học tập',
    nonPastAffKanji: '勉強します',
    nonPastAffHira: 'べんきょうします',
    nonPastNegKanji: '勉強しません',
    nonPastNegHira: 'べんきょうしません',
    pastAffKanji: '勉強しました',
    pastAffHira: 'べんきょうしました',
    pastNegKanji: '勉強しませんでした',
    pastNegHira: 'べんきょうしませんでした',
  },
  {
    id: 'owarimasu',
    meaning: 'kết thúc',
    nonPastAffKanji: '終わります',
    nonPastAffHira: 'おわります',
    nonPastNegKanji: '終わりません',
    nonPastNegHira: 'おわりません',
    pastAffKanji: '終わりました',
    pastAffHira: 'おわりました',
    pastNegKanji: '終わりませんでした',
    pastNegHira: 'おわりませんでした',
  },
];

export default function Lesson4Notes() {
  const [selectedVerbId, setSelectedVerbId] = useState<string>('hatarakimasu');
  const [practiceTopic, setPracticeTopic] = useState<Lesson4Topic>('conjugation');
  const practiceRef = useRef<HTMLDivElement | null>(null);

  const activeVerb =
    LESSON4_VERBS.find((v) => v.id === selectedVerbId) ?? LESSON4_VERBS[0];

  const jumpToPractice = useCallback((targetTopic: Lesson4Topic) => {
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

  const tenseRows = [
    {
      id: 'past',
      title: '1. Quá khứ',
      sub: 'Hành động đã xảy ra',
      timeSigns: 'きのう (昨日) • おととい (一昨日) • けさ (今朝)',
      accentHeaderBg: 'bg-amber-50/90 dark:bg-amber-950/45',
      accentBorder: 'border-amber-200/80 dark:border-amber-800/60',
      accentText: 'text-amber-800 dark:text-amber-200',
      affFormula: 'V-ました',
      affKanji: `昨日 ${activeVerb.pastAffKanji}`,
      affHira: activeVerb.pastAffHira,
      affTts: `きのう ${activeVerb.pastAffHira}`,
      affVn: `đã ${activeVerb.meaning}`,
      negFormula: 'V-ませんでした',
      negKanji: `昨日 ${activeVerb.pastNegKanji}`,
      negHira: activeVerb.pastNegHira,
      negTts: `きのう ${activeVerb.pastNegHira}`,
      negVn: `đã không ${activeVerb.meaning}`,
      qFormula: 'V-ましたか',
      qKanji: `${activeVerb.pastAffKanji}か`,
      qTts: `${activeVerb.pastAffHira}か`,
      qReplyYes: `はい、${activeVerb.pastAffKanji}`,
      qReplyNo: `いいえ、${activeVerb.pastNegKanji}`,
    },
    {
      id: 'present',
      title: '2. Hiện tại',
      sub: 'Thói quen lặp lại',
      timeSigns: 'まいにち (毎日) • まいあさ (毎朝) • まいばん (毎晩)',
      accentHeaderBg: 'bg-indigo-50/90 dark:bg-indigo-950/45',
      accentBorder: 'border-indigo-200/80 dark:border-indigo-800/60',
      accentText: 'text-indigo-800 dark:text-indigo-200',
      affFormula: 'V-ます',
      affKanji: `毎日 ${activeVerb.nonPastAffKanji}`,
      affHira: activeVerb.nonPastAffHira,
      affTts: `まいにち ${activeVerb.nonPastAffHira}`,
      affVn: activeVerb.meaning,
      negFormula: 'V-ません',
      negKanji: `毎日 ${activeVerb.nonPastNegKanji}`,
      negHira: activeVerb.nonPastNegHira,
      negTts: `まいにち ${activeVerb.nonPastNegHira}`,
      negVn: `không ${activeVerb.meaning}`,
      qFormula: 'V-ますか',
      qKanji: `${activeVerb.nonPastAffKanji}か`,
      qTts: `${activeVerb.nonPastAffHira}か`,
      qReplyYes: `はい、${activeVerb.nonPastAffKanji}`,
      qReplyNo: `いいえ、${activeVerb.nonPastNegKanji}`,
    },
    {
      id: 'future',
      title: '3. Tương lai',
      sub: 'Chia giống hệt Hiện tại',
      timeSigns: 'あした (明日) • あさって (明後日) • こんばん (今晩)',
      accentHeaderBg: 'bg-emerald-50/90 dark:bg-emerald-950/45',
      accentBorder: 'border-emerald-200/80 dark:border-emerald-800/60',
      accentText: 'text-emerald-800 dark:text-emerald-200',
      affFormula: 'V-ます',
      affKanji: `明日 ${activeVerb.nonPastAffKanji}`,
      affHira: activeVerb.nonPastAffHira,
      affTts: `あした ${activeVerb.nonPastAffHira}`,
      affVn: `sẽ ${activeVerb.meaning}`,
      negFormula: 'V-ません',
      negKanji: `明日 ${activeVerb.nonPastNegKanji}`,
      negHira: activeVerb.nonPastNegHira,
      negTts: `あした ${activeVerb.nonPastNegHira}`,
      negVn: `sẽ không ${activeVerb.meaning}`,
      qFormula: 'V-ますか',
      qKanji: `${activeVerb.nonPastAffKanji}か`,
      qTts: `${activeVerb.nonPastAffHira}か`,
      qReplyYes: `はい、${activeVerb.nonPastAffKanji}`,
      qReplyNo: `いいえ、${activeVerb.nonPastNegKanji}`,
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* ===================================================================== */}
      {/* PHẦN 1: BẢNG CHIA THÌ (QUÁ KHỨ • HIỆN TẠI • TƯƠNG LAI) & THỂ (～ます)   */}
      {/* ===================================================================== */}
      <section className="rounded-2xl bg-white dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-7 shadow-sm space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5 sm:pb-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 text-xs font-extrabold mb-1.5">
              Trọng tâm Bài 4 • Động từ lịch sự ～ます
            </span>
            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
              1. Bảng Chia Thì (Quá khứ • Hiện tại • Tương lai) &amp; Thể
            </h2>
          </div>
          <button
            type="button"
            onClick={() => jumpToPractice('conjugation')}
            className="w-full sm:w-auto min-h-[42px] inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-sm transition-colors cursor-pointer shrink-0 touch-manipulation active:scale-[0.98]"
          >
            <span>⚡</span>
            <span>Làm bài tập bên dưới</span>
          </button>
        </div>

        {/* Bộ chọn nhanh 6 động từ Bài 4 */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Chọn động từ Bài 4 để xem ví dụ trực tiếp trong bảng:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {LESSON4_VERBS.map((verb) => {
              const isSelected = verb.id === activeVerb.id;
              return (
                <button
                  key={verb.id}
                  type="button"
                  onClick={() => setSelectedVerbId(verb.id)}
                  className={`min-h-[44px] px-2.5 py-1.5 rounded-xl border text-left transition-all cursor-pointer touch-manipulation active:scale-[0.98] ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50/85 hover:bg-slate-100 dark:bg-slate-950/70 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <span className="block text-xs sm:text-sm font-black leading-tight">
                    {verb.nonPastAffKanji}
                  </span>
                  <span
                    className={`block text-[11px] font-medium mt-0.5 leading-tight ${
                      isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {verb.nonPastAffHira} • {verb.meaning}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MOBILE VIEW (< md): 3 Thẻ Quá khứ / Hiện tại / Tương lai gọn khít iPhone 15 Pro */}
        <div className="md:hidden space-y-3">
          {tenseRows.map((row) => (
            <div
              key={row.id}
              className={`rounded-xl border ${row.accentBorder} overflow-hidden bg-white dark:bg-slate-900/50`}
            >
              <div
                className={`px-3 py-2 ${row.accentHeaderBg} border-b ${row.accentBorder} space-y-0.5`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-extrabold ${row.accentText}`}>
                    {row.title}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {row.sub}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Dấu hiệu: <strong>{row.timeSigns}</strong>
                </p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="p-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 mr-1.5">
                      ➕ Khẳng định
                    </span>
                    <code className="font-black text-emerald-700 dark:text-emerald-300">
                      {row.affFormula}
                    </code>
                    <p className="font-bold text-slate-900 dark:text-white mt-1">
                      {row.affKanji}{' '}
                      <span className="font-normal text-slate-500 dark:text-slate-400">
                        ({row.affHira} • {row.affVn})
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakJapanese(row.affTts)}
                    className="min-h-[34px] px-2.5 py-1 rounded-lg bg-slate-50 active:bg-indigo-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold shrink-0 cursor-pointer touch-manipulation"
                  >
                    🔊
                  </button>
                </div>

                <div className="p-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-[10px] font-extrabold text-rose-700 dark:text-rose-300 mr-1.5">
                      ➖ Phủ định
                    </span>
                    <code className="font-black text-rose-600 dark:text-rose-300">
                      {row.negFormula}
                    </code>
                    <p className="font-bold text-slate-900 dark:text-white mt-1 break-words">
                      {row.negKanji}{' '}
                      <span className="font-normal text-slate-500 dark:text-slate-400">
                        ({row.negHira} • {row.negVn})
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakJapanese(row.negTts)}
                    className="min-h-[34px] px-2.5 py-1 rounded-lg bg-slate-50 active:bg-indigo-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold shrink-0 cursor-pointer touch-manipulation"
                  >
                    🔊
                  </button>
                </div>

                <div className="p-2.5 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-950/40">
                  <div className="min-w-0">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 mr-1.5">
                      ❓ Nghi vấn
                    </span>
                    <code className="font-black text-indigo-700 dark:text-indigo-300">
                      {row.qFormula}
                    </code>
                    <p className="text-slate-700 dark:text-slate-200 mt-1">
                      <strong>{row.qKanji}。</strong> → {row.qReplyYes} / {row.qReplyNo}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakJapanese(row.qTts)}
                    className="min-h-[34px] px-2.5 py-1 rounded-lg bg-white active:bg-indigo-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold shrink-0 cursor-pointer touch-manipulation"
                  >
                    🔊
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP / TABLET VIEW (>= md): Bảng 3 hàng (Quá khứ • Hiện tại • Tương lai) × 3 Thể */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full min-w-[720px] text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/85 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 font-extrabold w-56">Thì &amp; Dấu hiệu thời gian</th>
                <th className="py-3 px-4 font-extrabold border-l border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-300">
                  ➕ Thể Khẳng định
                </th>
                <th className="py-3 px-4 font-extrabold border-l border-slate-200 dark:border-slate-800 text-rose-700 dark:text-rose-300">
                  ➖ Thể Phủ định
                </th>
                <th className="py-3 px-4 font-extrabold border-l border-slate-200 dark:border-slate-800 text-indigo-700 dark:text-indigo-300">
                  ❓ Thể Nghi vấn &amp; Cách trả lời
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tenseRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className={`py-3.5 px-4 ${row.accentHeaderBg}`}>
                    <p className={`font-extrabold ${row.accentText}`}>{row.title}</p>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                      {row.sub}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      {row.timeSigns}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 border-l border-slate-100 dark:border-slate-800">
                    <div className="flex items-start space-x-2">
                      <button
                        type="button"
                        onClick={() => speakJapanese(row.affTts)}
                        className="w-7 h-7 mt-0.5 rounded-lg bg-slate-100 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-900/60 text-xs flex items-center justify-center cursor-pointer shrink-0"
                      >
                        🔊
                      </button>
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-black text-xs mb-1">
                          {row.affFormula}
                        </span>
                        <p className="font-extrabold text-slate-900 dark:text-white">
                          {row.affKanji}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {row.affHira} • {row.affVn}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 border-l border-slate-100 dark:border-slate-800">
                    <div className="flex items-start space-x-2">
                      <button
                        type="button"
                        onClick={() => speakJapanese(row.negTts)}
                        className="w-7 h-7 mt-0.5 rounded-lg bg-slate-100 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-900/60 text-xs flex items-center justify-center cursor-pointer shrink-0"
                      >
                        🔊
                      </button>
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 font-black text-xs mb-1">
                          {row.negFormula}
                        </span>
                        <p className="font-extrabold text-slate-900 dark:text-white">
                          {row.negKanji}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {row.negHira} • {row.negVn}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 border-l border-slate-100 dark:border-slate-800">
                    <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-black text-xs mb-1">
                      {row.qFormula}
                    </span>
                    <div>
                      <button
                        type="button"
                        onClick={() => speakJapanese(row.qTts)}
                        className="inline-flex items-center space-x-1 font-extrabold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300 cursor-pointer"
                      >
                        <span>🔊</span>
                        <span>{row.qKanji}。</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      • {row.qReplyYes}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      • {row.qReplyNo}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3 Lưu ý ngắn gọn ngay chân bảng */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 px-3.5 py-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200 space-y-1">
          <p>
            • <strong>Hiện tại &amp; Tương lai</strong> chia giống hệt nhau (<strong>V-ます / V-ません</strong>), phân biệt nghĩa nhờ từ chỉ thời gian đi kèm.
          </p>
          <p>
            • Phủ định quá khứ bắt buộc là <strong>V-ませんでした</strong> (❌ không dùng <em>V-ませんだった</em>).
          </p>
          <p>
            • Khi trả lời câu hỏi động từ, lặp lại đúng đuôi động từ (❌ cấm dùng <em>そうです / そうじゃありません</em>).
          </p>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PHẦN 2: BÀI TẬP THỰC HÀNH (HIRAGANA & KANJI — KHÔNG GIỚI HẠN GIỜ)     */}
      {/* ===================================================================== */}
      <div ref={practiceRef} className="scroll-mt-4">
        <Lesson4PracticeArena
          topic={practiceTopic}
          onTopicChange={setPracticeTopic}
        />
      </div>
    </div>
  );
}
