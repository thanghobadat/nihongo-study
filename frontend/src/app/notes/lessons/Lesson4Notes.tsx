'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  AudioIconButton,
  CalloutBar,
  SheetHeader,
  SheetSection,
} from '../components/NotesUI';
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

  const tenseRows = [
    {
      id: 'past',
      title: 'Quá khứ',
      sub: 'Đã xảy ra',
      timeSigns: 'きのう (昨日) · おととい (一昨日) · けさ (今朝)',
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
      title: 'Hiện tại',
      sub: 'Thói quen lặp lại',
      timeSigns: 'まいにち (毎日) · まいあさ (毎朝) · まいばん (毎晩)',
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
      title: 'Tương lai',
      sub: 'Chia giống Hiện tại',
      timeSigns: 'あした (明日) · あさって (明後日) · こんばん (今晩)',
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
    <div className="space-y-5 sm:space-y-6">
      <SheetSection>
        <SheetHeader
          title="Bảng Chia Thì động từ lịch sự (～ます)"
          subtitle="Chọn một trong 6 động từ Bài 4 bên dưới để xem biến đổi trực tiếp qua 3 thì."
          actionLabel="Làm bài tập thực hành"
          onAction={() => jumpToPractice('conjugation')}
        />

        {/* Bộ chọn nhanh 6 động từ Bài 4 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {LESSON4_VERBS.map((verb) => {
            const isSelected = verb.id === activeVerb.id;
            return (
              <button
                key={verb.id}
                type="button"
                onClick={() => setSelectedVerbId(verb.id)}
                aria-pressed={isSelected}
                className={`min-h-[46px] px-3 py-2 rounded-xl border text-left transition-colors duration-150 cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500'
                    : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                }`}
              >
                <span className="block text-xs sm:text-sm font-bold leading-tight">
                  {verb.nonPastAffKanji}
                </span>
                <span
                  className={`block text-[11px] mt-0.5 truncate ${
                    isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {verb.meaning}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bảng ma trận kẻ dòng phẳng (Mobile xếp dọc từng Thì, Desktop chia 4 cột) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden">
          <div className="hidden lg:grid lg:grid-cols-12 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div className="col-span-3 py-2.5 px-3.5">Thì & Dấu hiệu</div>
            <div className="col-span-3 py-2.5 px-3.5 border-l border-slate-200 dark:border-slate-800">
              Khẳng định
            </div>
            <div className="col-span-3 py-2.5 px-3.5 border-l border-slate-200 dark:border-slate-800">
              Phủ định
            </div>
            <div className="col-span-3 py-2.5 px-3.5 border-l border-slate-200 dark:border-slate-800">
              Nghi vấn & Đáp lại
            </div>
          </div>

          {tenseRows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80 dark:divide-slate-800 bg-white dark:bg-slate-900/40"
            >
              {/* Cột 1: Thì */}
              <div className="lg:col-span-3 p-3.5 bg-slate-50/70 dark:bg-slate-900/80 space-y-1">
                <div className="flex items-baseline justify-between lg:block">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{row.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{row.sub}</p>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {row.timeSigns}
                </p>
              </div>

              {/* Cột 2: Khẳng định */}
              <div className="lg:col-span-3 p-3.5 flex items-center justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="lg:hidden text-[11px] font-medium text-slate-500">
                      Khẳng định:
                    </span>
                    <code className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-xs font-bold">
                      {row.affFormula}
                    </code>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {row.affKanji}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {row.affHira} · {row.affVn}
                  </p>
                </div>
                <AudioIconButton tts={row.affTts} label={`Nghe ${row.affTts}`} />
              </div>

              {/* Cột 3: Phủ định */}
              <div className="lg:col-span-3 p-3.5 flex items-center justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="lg:hidden text-[11px] font-medium text-slate-500">
                      Phủ định:
                    </span>
                    <code className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-xs font-bold">
                      {row.negFormula}
                    </code>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white break-words">
                    {row.negKanji}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {row.negHira} · {row.negVn}
                  </p>
                </div>
                <AudioIconButton tts={row.negTts} label={`Nghe ${row.negTts}`} />
              </div>

              {/* Cột 4: Nghi vấn */}
              <div className="lg:col-span-3 p-3.5 flex items-center justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="lg:hidden text-[11px] font-medium text-slate-500">
                      Nghi vấn:
                    </span>
                    <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold">
                      {row.qFormula}
                    </code>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {row.qKanji}。
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {row.qReplyYes} / {row.qReplyNo}
                  </p>
                </div>
                <AudioIconButton tts={row.qTts} label={`Nghe ${row.qTts}`} />
              </div>
            </div>
          ))}
        </div>

        <CalloutBar tone="blue">
          <div className="space-y-1 text-xs sm:text-sm">
            <p>
              <strong>Hiện tại & Tương lai</strong> chia giống hệt nhau (<strong>V-ます / V-ません</strong>), phân biệt nhờ từ chỉ thời gian đi kèm.
            </p>
            <p>
              Phủ định quá khứ bắt buộc là <strong>V-ませんでした</strong> (không có dạng{' '}
              <span className="line-through text-rose-600 dark:text-rose-400">V-ませんだった</span>).
            </p>
            <p>
              Trả lời câu hỏi động từ phải lặp lại đuôi động từ (không dùng{' '}
              <span className="line-through text-rose-600 dark:text-rose-400">そうです</span>).
            </p>
          </div>
        </CalloutBar>
      </SheetSection>

      <div ref={practiceRef} className="scroll-mt-4">
        <Lesson4PracticeArena topic={practiceTopic} onTopicChange={setPracticeTopic} />
      </div>
    </div>
  );
}
