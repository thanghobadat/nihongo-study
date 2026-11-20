'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AlertCircleSvg,
  AudioIconButton,
  CloseSvg,
  RefreshSvg,
  SlidersSvg,
  TrophySvg,
} from '../components/NotesUI';
import {
  CONJUGATION_TRAP_BANK,
  Lesson4Mode,
  Lesson4PracticeQuestion,
  Lesson4Topic,
  QA_REPLY_TRAP_BANK,
  buildConjugationPracticeQuestion,
  buildQaReplyPracticeQuestion,
  fisherYatesShuffle,
} from './lesson4PracticeGenerator';

interface Lesson4PracticeArenaProps {
  topic: Lesson4Topic;
  onTopicChange: (next: Lesson4Topic) => void;
}

const MODE_CONFIG: {
  id: Lesson4Mode;
  badge: string;
  title: string;
  desc: string;
}[] = [
  {
    id: 'hira',
    badge: 'あ → ます',
    title: 'Hiragana → Chọn',
    desc: 'Nhìn câu chữ mềm chọn nhanh đuôi đúng',
  },
  {
    id: 'kanji',
    badge: '漢 → ます',
    title: 'Kanji → Chọn',
    desc: 'Nhìn chữ Hán (昨日・毎日・明日...) chia đuôi',
  },
  {
    id: 'mixed',
    badge: 'Tổng hợp',
    title: 'Kết hợp Hira & Kanji',
    desc: 'Trộn ngẫu nhiên câu Hiragana và Kanji',
  },
];

export default function Lesson4PracticeArena({
  topic,
  onTopicChange,
}: Lesson4PracticeArenaProps) {
  const [mode, setMode] = useState<Lesson4Mode>('mixed');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');

  const [currentQ, setCurrentQ] = useState<Lesson4PracticeQuestion | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  const [selectedWrongLabel, setSelectedWrongLabel] = useState<string | null>(null);
  const [flashCorrectId, setFlashCorrectId] = useState<string | null>(null);

  const arenaRef = useRef<HTMLElement | null>(null);
  const conjugationDeckRef = useRef<number[]>([]);
  const qaDeckRef = useRef<number[]>([]);
  const isTransitioningRef = useRef<boolean>(false);
  const scoreRef = useRef<number>(0);

  const storageKey = `lesson4_note_reflex_high_${topic}_${mode}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(storageKey);
      setHighScore(saved ? parseInt(saved, 10) || 0 : 0);
    } catch {
      setHighScore(0);
    }
  }, [storageKey]);

  const drawNextQuestion = useCallback(
    (activeTopic: Lesson4Topic, activeMode: Lesson4Mode): Lesson4PracticeQuestion => {
      if (activeTopic === 'conjugation') {
        if (conjugationDeckRef.current.length === 0) {
          conjugationDeckRef.current = fisherYatesShuffle(
            CONJUGATION_TRAP_BANK.map((_, idx) => idx)
          );
        }
        const nextIdx = conjugationDeckRef.current.pop()!;
        return buildConjugationPracticeQuestion(CONJUGATION_TRAP_BANK[nextIdx], activeMode);
      } else {
        if (qaDeckRef.current.length === 0) {
          qaDeckRef.current = fisherYatesShuffle(QA_REPLY_TRAP_BANK.map((_, idx) => idx));
        }
        const nextIdx = qaDeckRef.current.pop()!;
        return buildQaReplyPracticeQuestion(QA_REPLY_TRAP_BANK[nextIdx], activeMode);
      }
    },
    []
  );

  const finishGame = useCallback(
    (wrongLabel: string | null) => {
      isTransitioningRef.current = false;
      setSelectedWrongLabel(wrongLabel);
      setGameState('gameover');

      const finalScore = scoreRef.current;
      try {
        const prevBest = parseInt(localStorage.getItem(storageKey) || '0', 10) || 0;
        if (finalScore > prevBest) {
          localStorage.setItem(storageKey, String(finalScore));
          setHighScore(finalScore);
          setIsNewRecord(true);
        } else {
          setIsNewRecord(false);
        }
      } catch {
        setIsNewRecord(false);
      }
    },
    [storageKey]
  );

  const startGame = useCallback(() => {
    isTransitioningRef.current = false;
    conjugationDeckRef.current = [];
    qaDeckRef.current = [];

    scoreRef.current = 0;
    setScore(0);
    setStreak(0);
    setIsNewRecord(false);
    setSelectedWrongLabel(null);
    setFlashCorrectId(null);

    const firstQ = drawNextQuestion(topic, mode);
    setCurrentQ(firstQ);
    setGameState('playing');

    setTimeout(() => {
      arenaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }, [drawNextQuestion, mode, topic]);

  const stopToIdle = useCallback(() => {
    isTransitioningRef.current = false;
    setGameState('idle');
  }, []);

  const handleSelectTopic = (nextTopic: Lesson4Topic) => {
    if (nextTopic === topic) return;
    stopToIdle();
    onTopicChange(nextTopic);
  };

  const handleAnswer = useCallback(
    (optionId: string, optionLabel: string) => {
      if (gameState !== 'playing' || !currentQ || isTransitioningRef.current) return;

      if (optionId === currentQ.correctId) {
        isTransitioningRef.current = true;
        setFlashCorrectId(optionId);

        const nextScore = scoreRef.current + 1;
        scoreRef.current = nextScore;
        const nextStreak = streak + 1;

        setScore(nextScore);
        setStreak(nextStreak);

        setTimeout(() => {
          const nextQ = drawNextQuestion(topic, mode);
          setFlashCorrectId(null);
          setCurrentQ(nextQ);
          isTransitioningRef.current = false;
        }, 160);
      } else {
        finishGame(optionLabel);
      }
    },
    [currentQ, drawNextQuestion, finishGame, gameState, mode, streak, topic]
  );

  useEffect(() => {
    if (gameState !== 'playing' || !currentQ) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key, 10) - 1;
        const opt = currentQ.options[idx];
        if (opt) {
          e.preventDefault();
          handleAnswer(opt.id, opt.label);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, currentQ, handleAnswer]);

  return (
    <section
      ref={arenaRef}
      className="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-5"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-slate-200/90 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Bài tập thực hành Thì & Thể động từ (～ます)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Không giới hạn thời gian · Rèn phân biệt mốc thời gian và đuôi khẳng định / phủ định
          </p>
        </div>

        <div className="grid grid-cols-2 lg:inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => handleSelectTopic('conjugation')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer touch-manipulation ${
              topic === 'conjugation'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Chia Thì & Thể
          </button>
          <button
            type="button"
            onClick={() => handleSelectTopic('qa_reply')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer touch-manipulation ${
              topic === 'qa_reply'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Đáp câu hỏi (はい/いいえ)
          </button>
        </div>
      </div>

      {/* IDLE */}
      {gameState === 'idle' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {MODE_CONFIG.map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  aria-pressed={active}
                  className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    active
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500'
                      : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {m.badge}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {m.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {m.desc}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 tabular-nums">
              <span>
                Kỷ lục: <strong className="text-slate-900 dark:text-white">{highScore} câu</strong>
              </span>
              <span className="hidden md:inline text-xs text-slate-400">
                · Phím tắt 1 – 4 để chọn đáp án
              </span>
            </div>

            <button
              type="button"
              onClick={startGame}
              className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer touch-manipulation active:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Bắt đầu làm bài
            </button>
          </div>
        </div>
      )}

      {/* PLAYING */}
      {gameState === 'playing' && currentQ && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 text-xs tabular-nums">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              {currentQ.promptType === 'hira' ? 'Hiragana' : 'Chữ Hán'}
            </span>

            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Điểm: <strong className="text-blue-600 dark:text-blue-400">{score}</strong>
              </span>
              <span className="text-slate-500 dark:text-slate-400">Chuỗi: {streak}</span>
              <button
                type="button"
                onClick={stopToIdle}
                className="min-h-[34px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1 font-medium cursor-pointer touch-manipulation"
              >
                <CloseSvg className="w-3.5 h-3.5" />
                <span>Dừng</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 py-5 px-4 text-center space-y-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                currentQ.badgeTone === 'affirmative'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
              }`}
            >
              {currentQ.badgeText}
            </span>

            <div className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white break-words">
              {currentQ.promptType === 'hira' ? currentQ.promptHira : currentQ.promptKanji}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {currentQ.contextHint}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {currentQ.options.map((opt, idx) => {
              const isFlashing = flashCorrectId === opt.id;
              return (
                <button
                  key={`${opt.id}-${idx}`}
                  type="button"
                  onClick={() => handleAnswer(opt.id, opt.label)}
                  className={`relative min-h-[58px] sm:min-h-[68px] py-3 px-3 sm:px-4 rounded-xl border font-bold text-sm sm:text-lg leading-snug transition-colors cursor-pointer select-none touch-manipulation active:opacity-85 flex flex-col items-center justify-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    isFlashing
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-900 dark:text-white'
                  }`}
                >
                  <span
                    className={`hidden sm:inline absolute top-2 left-3 text-[11px] font-medium ${
                      isFlashing ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="block break-words w-full">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {gameState === 'gameover' && currentQ && (
        <div className="space-y-4">
          <div className="rounded-xl bg-rose-50/60 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/60 p-4 sm:p-5 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <AlertCircleSvg className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-rose-700 dark:text-rose-300">
                    Bạn đã chọn nhầm:「{selectedWrongLabel}」
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                    Điểm lượt này: <strong>{score} câu</strong> · Kỷ lục:{' '}
                    <strong>{highScore} câu</strong>
                  </p>
                </div>
              </div>

              {isNewRecord && score > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-600 text-white text-xs font-semibold">
                  <TrophySvg />
                  <span>Kỷ lục mới</span>
                </span>
              )}
            </div>

            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-baseline gap-2 text-sm">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Đáp án đúng:
                    </span>
                    <strong className="font-bold text-slate-900 dark:text-white">
                      {currentQ.correctDisplay}
                    </strong>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {currentQ.fullSentenceKanji}{' '}
                    <span className="font-normal text-slate-500">
                      （{currentQ.fullSentenceHira}）
                    </span>
                  </p>
                </div>
                <AudioIconButton tts={currentQ.ttsFullAnswer} label="Nghe câu chuẩn" />
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                <strong className="text-slate-900 dark:text-white">Lưu ý: </strong>
                {currentQ.trapNote}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={stopToIdle}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
            >
              <SlidersSvg />
              <span>Đổi chế độ</span>
            </button>
            <button
              type="button"
              onClick={startGame}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
            >
              <RefreshSvg />
              <span>Làm lại</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
