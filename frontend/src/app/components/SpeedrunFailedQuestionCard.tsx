'use client';

import { playAudioWithFallback } from '../utils/audioHelper';

export interface SpeedrunFailedQuestionInfo {
  reason: 'wrong' | 'timeout';
  questionLabel: string;
  questionText: string;
  readingSub?: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  audio?: {
    kanji?: string;
    kana: string;
  };
  example?: {
    japanese: string;
    vietnamese?: string;
  };
}

interface SpeedrunFailedQuestionCardProps {
  info: SpeedrunFailedQuestionInfo;
}

/**
 * Displays the missed question, user choice (or timeout status), and correct answer on Speedrun Game Over screens.
 */
export default function SpeedrunFailedQuestionCard({ info }: SpeedrunFailedQuestionCardProps) {
  const isTimeout = info.reason === 'timeout';

  return (
    <div className="text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/70 p-4 sm:p-5 space-y-3.5 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black border ${
              isTimeout
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
            }`}
          >
            <span>{isTimeout ? '⏰' : '❌'}</span>
            <span>{isTimeout ? 'Hết giờ' : 'Chọn sai'}</span>
          </span>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {info.questionLabel}
          </span>
        </div>

        {info.audio && (info.audio.kana || info.audio.kanji) && (
          <button
            type="button"
            onClick={() => playAudioWithFallback(info.audio!.kanji || info.audio!.kana, info.audio!.kana)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-all active:scale-95 cursor-pointer shrink-0"
            title="Nghe lại phát âm"
          >
            <span>🔊</span>
            <span>Nghe lại</span>
          </button>
        )}
      </div>

      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
          Câu hỏi vừa rồi
        </span>
        <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white break-words">
          {info.questionText}
        </p>
        {info.readingSub && (
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 break-words">
            {info.readingSub}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div
          className={`rounded-xl px-3.5 py-2.5 border ${
            isTimeout || !info.selectedAnswer
              ? 'bg-amber-50/80 dark:bg-amber-950/25 border-amber-200 dark:border-amber-800/60'
              : 'bg-rose-50/80 dark:bg-rose-950/25 border-rose-200 dark:border-rose-800/60'
          }`}
        >
          <span
            className={`text-[10px] font-bold uppercase tracking-wider block ${
              isTimeout || !info.selectedAnswer
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            Bạn đã chọn
          </span>
          <p
            className={`text-xs sm:text-sm font-bold break-words mt-0.5 ${
              isTimeout || !info.selectedAnswer
                ? 'text-amber-700 dark:text-amber-300 italic'
                : 'text-rose-700 dark:text-rose-300'
            }`}
          >
            {isTimeout || !info.selectedAnswer ? 'Chưa kịp chọn đáp án (Hết thời gian)' : `✗ ${info.selectedAnswer}`}
          </p>
        </div>

        <div className="rounded-xl px-3.5 py-2.5 border bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            Đáp án đúng
          </span>
          <p className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-300 break-words mt-0.5">
            ✓ {info.correctAnswer}
          </p>
        </div>
      </div>

      {info.example && info.example.japanese && (
        <div className="pt-1 border-t border-slate-200/70 dark:border-slate-800/70 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          <span className="font-bold text-slate-600 dark:text-slate-300">Ví dụ: </span>
          <span>{info.example.japanese}</span>
          {info.example.vietnamese && (
            <span className="block text-slate-400 dark:text-slate-500">{info.example.vietnamese}</span>
          )}
        </div>
      )}
    </div>
  );
}

