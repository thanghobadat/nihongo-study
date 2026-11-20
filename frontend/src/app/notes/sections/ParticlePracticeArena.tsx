'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AlertCircleSvg,
  AudioIconButton,
  ChevronDownSvg,
  CloseSvg,
  RefreshSvg,
  SlidersSvg,
  TrophySvg,
} from '../components/NotesUI';
import { PARTICLE_FILTER_OPTIONS, ParticleFilterId } from './ParticleSection';
import { fisherYatesShuffle } from './noteUtils';
import {
  ParticleQuizMode,
  ParticleQuizQuestion,
  ParticleQuizScope,
  buildParticleQuizQuestion,
  getParticlePoolByScope,
} from './particlePracticeGenerator';

interface ParticlePracticeArenaProps {
  activeFilter: ParticleFilterId;
}

const MODE_CONFIG: {
  id: ParticleQuizMode;
  badge: string;
  title: string;
  desc: string;
}[] = [
  {
    id: 'hira',
    badge: 'あ → 助詞',
    title: 'Hiragana → Chọn',
    desc: 'Nhìn câu chữ mềm chọn trợ từ hoặc ngoại lệ đúng',
  },
  {
    id: 'kanji',
    badge: '漢 → 助詞',
    title: 'Kanji → Chọn',
    desc: 'Nhìn câu có chữ Hán Bài 1–7 điền trợ từ chuẩn',
  },
  {
    id: 'mixed',
    badge: 'Tổng hợp',
    title: 'Kết hợp Hira & Kanji',
    desc: 'Trộn ngẫu nhiên câu Hiragana và Kanji',
  },
];

export default function ParticlePracticeArena({
  activeFilter,
}: ParticlePracticeArenaProps) {
  const [scope, setScope] = useState<ParticleQuizScope>(activeFilter);
  const [mode, setMode] = useState<ParticleQuizMode>('mixed');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');

  const [currentQ, setCurrentQ] = useState<ParticleQuizQuestion | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  const [selectedWrongLabel, setSelectedWrongLabel] = useState<string | null>(null);
  const [flashCorrectId, setFlashCorrectId] = useState<string | null>(null);

  const arenaRef = useRef<HTMLElement | null>(null);
  const deckRef = useRef<number[]>([]);
  const isTransitioningRef = useRef<boolean>(false);
  const scoreRef = useRef<number>(0);

  // Sync scope with upper filter pill when idle
  useEffect(() => {
    if (gameState === 'idle') {
      setScope(activeFilter);
    }
  }, [activeFilter, gameState]);

  const storageKey = `notes_particle_quiz_high_${scope}_${mode}`;

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
    (targetScope: ParticleQuizScope, targetMode: ParticleQuizMode): ParticleQuizQuestion => {
      const pool = getParticlePoolByScope(targetScope);
      if (deckRef.current.length === 0) {
        deckRef.current = fisherYatesShuffle(pool.map((_, idx) => idx));
      }
      const nextIdx = deckRef.current.pop()!;
      const safeItem = pool[nextIdx] ?? pool[0];
      return buildParticleQuizQuestion(safeItem, targetMode);
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
    deckRef.current = [];

    scoreRef.current = 0;
    setScore(0);
    setStreak(0);
    setIsNewRecord(false);
    setSelectedWrongLabel(null);
    setFlashCorrectId(null);

    const firstQ = drawNextQuestion(scope, mode);
    setCurrentQ(firstQ);
    setGameState('playing');

    setTimeout(() => {
      arenaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }, [drawNextQuestion, mode, scope]);

  const stopToIdle = useCallback(() => {
    isTransitioningRef.current = false;
    setGameState('idle');
  }, []);

  const handleSelectScope = (nextScope: ParticleQuizScope) => {
    if (nextScope === scope) return;
    stopToIdle();
    setScope(nextScope);
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
          const nextQ = drawNextQuestion(scope, mode);
          setFlashCorrectId(null);
          setCurrentQ(nextQ);
          isTransitioningRef.current = false;
        }, 160);
      } else {
        finishGame(optionLabel);
      }
    },
    [currentQ, drawNextQuestion, finishGame, gameState, mode, scope, streak]
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

  const poolCount = getParticlePoolByScope(scope).length;

  return (
    <section
      ref={arenaRef}
      className="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-5"
    >
      {/* Header + Scope Dropdown */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-slate-200/90 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Luyện tập phân biệt Trợ từ (Bài 1 – Bài 7)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
            Không giới hạn thời gian · {poolCount} câu bẫy chọn lọc theo phạm vi đang chọn
          </p>
        </div>

        <div className="relative flex items-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 min-h-[42px] w-full lg:w-auto">
          <label
            htmlFor="particle-quiz-scope-select"
            className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap mr-1.5 shrink-0"
          >
            Phạm vi:
          </label>
          <select
            id="particle-quiz-scope-select"
            value={scope}
            onChange={(e) => handleSelectScope(e.target.value as ParticleQuizScope)}
            className="appearance-none flex-1 min-w-0 pr-6 py-1 bg-transparent dark:bg-slate-900 text-[15px] sm:text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer truncate"
          >
            {PARTICLE_FILTER_OPTIONS.map((opt) => (
              <option
                key={opt.id}
                value={opt.id}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                {opt.dropdownLabel}
              </option>
            ))}
          </select>
          <ChevronDownSvg className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3" />
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
              Bắt đầu luyện tập
            </button>
          </div>
        </div>
      )}

      {/* PLAYING */}
      {gameState === 'playing' && currentQ && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 text-xs tabular-nums">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                {currentQ.promptType === 'hira' ? 'Hiragana' : 'Chữ Hán'}
              </span>
              <span className="text-slate-500 dark:text-slate-400">{currentQ.lessonTag}</span>
            </div>

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

          {/* Question Box */}
          <div className="rounded-xl bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 py-5 px-4 text-center space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chọn phương án đúng điền vào chỗ trống
            </p>
            <div className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white break-words leading-relaxed">
              {currentQ.promptText}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {currentQ.vnMeaning}
            </p>
          </div>

          {/* 4 Options */}
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
                <div className="space-y-0.5 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2 text-sm">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Đáp án đúng:
                    </span>
                    <strong className="font-bold text-slate-900 dark:text-white">
                      {currentQ.correctDisplay}
                    </strong>
                    <span className="text-xs text-slate-400">({currentQ.lessonTag})</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 break-words">
                    {currentQ.fullSentenceKanji}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {currentQ.fullSentenceHira} · {currentQ.vnMeaning}
                  </p>
                </div>
                <AudioIconButton tts={currentQ.ttsFullAnswer} label="Nghe câu chuẩn" />
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                <strong className="text-slate-900 dark:text-white">Phân biệt: </strong>
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
