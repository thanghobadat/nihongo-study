'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AlertCircleSvg,
  AudioIconButton,
  CloseSvg,
  RefreshSvg,
  SlidersSvg,
  SpeakerSvg,
  TrophySvg,
} from '../components/NotesUI';
import { speakJapaneseNote } from '../sections/noteUtils';
import {
  COMBINED_DATE_TRAP_BANK,
  Lesson5Mode,
  Lesson5PracticeQuestion,
  Lesson5Topic,
  PARTICLE_TRAP_BANK,
  buildCombinedDatePracticeQuestion,
  buildParticlePracticeQuestion,
  fisherYatesShuffle,
} from './lesson5PracticeGenerator';

interface Lesson5PracticeArenaProps {
  topic: Lesson5Topic;
  onTopicChange: (next: Lesson5Topic) => void;
}

const DATE_MODE_CONFIG: {
  id: Lesson5Mode;
  badge: string;
  title: string;
  desc: string;
}[] = [
  {
    id: 'kanji',
    badge: '月日 → あ',
    title: 'Ngày/Tháng → Hiragana',
    desc: 'Nhìn 4月20日, 7月4日, 9月8日... chọn cách đọc ghép chuẩn',
  },
  {
    id: 'hira',
    badge: 'あ → 月日',
    title: 'Hiragana → Ngày/Tháng',
    desc: 'Nhìn しがつ はつか... chọn đúng mốc lịch',
  },
  {
    id: 'mixed',
    badge: 'Tổng hợp',
    title: 'Kết hợp cả 2 chiều',
    desc: 'Trộn ngẫu nhiên Ngày/Tháng ↔ Hiragana',
  },
];

const PARTICLE_MODE_CONFIG: {
  id: Lesson5Mode;
  badge: string;
  title: string;
  desc: string;
}[] = [
  {
    id: 'hira',
    badge: 'あ → へ/で/と',
    title: 'Hiragana → Chọn',
    desc: 'Nhìn câu chữ mềm điền trợ từ hoặc ngoại lệ đúng',
  },
  {
    id: 'kanji',
    badge: '漢 → へ/で/と',
    title: 'Kanji → Chọn',
    desc: 'Nhìn câu chữ Hán chọn đáp án đúng',
  },
  {
    id: 'mixed',
    badge: 'Tổng hợp',
    title: 'Kết hợp Hira & Kanji',
    desc: 'Trộn ngẫu nhiên câu Hiragana và Kanji',
  },
];

export default function Lesson5PracticeArena({
  topic,
}: Lesson5PracticeArenaProps) {
  const [mode, setMode] = useState<Lesson5Mode>('mixed');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');

  const [currentQ, setCurrentQ] = useState<Lesson5PracticeQuestion | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  const [selectedWrongLabel, setSelectedWrongLabel] = useState<string | null>(null);
  const [flashCorrectId, setFlashCorrectId] = useState<string | null>(null);

  const arenaRef = useRef<HTMLElement | null>(null);
  const dateDeckRef = useRef<number[]>([]);
  const particleDeckRef = useRef<number[]>([]);
  const isTransitioningRef = useRef<boolean>(false);
  const scoreRef = useRef<number>(0);

  const storageKey = `lesson5_note_practice_high_${topic}_${mode}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(storageKey);
      setHighScore(saved ? parseInt(saved, 10) || 0 : 0);
    } catch {
      setHighScore(0);
    }
  }, [storageKey]);

  const speakJapanese = useCallback((text: string) => {
    speakJapaneseNote(text, 0.94);
  }, []);

  const drawNextQuestion = useCallback(
    (activeTopic: Lesson5Topic, activeMode: Lesson5Mode): Lesson5PracticeQuestion => {
      if (activeTopic === 'dates_combined') {
        if (dateDeckRef.current.length === 0) {
          dateDeckRef.current = fisherYatesShuffle(
            COMBINED_DATE_TRAP_BANK.map((_, idx) => idx)
          );
        }
        const nextIdx = dateDeckRef.current.pop()!;
        return buildCombinedDatePracticeQuestion(COMBINED_DATE_TRAP_BANK[nextIdx], activeMode);
      } else {
        if (particleDeckRef.current.length === 0) {
          particleDeckRef.current = fisherYatesShuffle(
            PARTICLE_TRAP_BANK.map((_, idx) => idx)
          );
        }
        const nextIdx = particleDeckRef.current.pop()!;
        return buildParticlePracticeQuestion(PARTICLE_TRAP_BANK[nextIdx], activeMode);
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
    dateDeckRef.current = [];
    particleDeckRef.current = [];

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
          handleAnswer(opt.id, opt.subLabel ? `${opt.label} (${opt.subLabel})` : opt.label);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, currentQ, handleAnswer]);

  const activeModeList = topic === 'dates_combined' ? DATE_MODE_CONFIG : PARTICLE_MODE_CONFIG;

  return (
    <section
      ref={arenaRef}
      className="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-5"
    >
      <div className="pb-3.5 border-b border-slate-200/90 dark:border-slate-800">
        <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Bài tập thực hành Kết hợp Ngày & Tháng (～月～日)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Không giới hạn thời gian · Luyện đọc đúng các mốc bẫy 4月/7月/9月 & ngày 1–10, 14, 20, 24
        </p>
      </div>

      {/* IDLE */}
      {gameState === 'idle' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {activeModeList.map((m) => {
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
              {currentQ.promptType === 'kanji' ? 'Ngày/Tháng → Hiragana' : 'Hiragana → Ngày/Tháng'}
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
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                {currentQ.badgeText}
              </span>
              {currentQ.topic === 'dates_combined' && currentQ.promptType === 'hira' && (
                <button
                  type="button"
                  onClick={() => speakJapanese(currentQ.ttsFullAnswer)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-50 cursor-pointer touch-manipulation"
                >
                  <SpeakerSvg className="w-3.5 h-3.5" />
                  <span>Nghe</span>
                </button>
              )}
            </div>

            <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white break-words">
              {currentQ.promptMain}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
              {currentQ.promptSub}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{currentQ.contextHint}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 tabular-nums">
            {currentQ.options.map((opt, idx) => {
              const isFlashing = flashCorrectId === opt.id;
              const displayLabel = opt.subLabel ? `${opt.label} (${opt.subLabel})` : opt.label;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleAnswer(opt.id, displayLabel)}
                  className={`min-h-[54px] sm:min-h-[64px] p-3.5 rounded-xl border text-left transition-colors cursor-pointer select-none touch-manipulation active:opacity-85 flex items-center justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    isFlashing
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-900 dark:text-white'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm sm:text-base font-bold leading-snug break-words">
                      {opt.label}
                    </div>
                    {opt.subLabel && (
                      <div
                        className={`text-xs mt-0.5 ${
                          isFlashing ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {opt.subLabel}
                      </div>
                    )}
                  </div>
                  <span
                    className={`hidden md:inline-block shrink-0 text-xs font-medium px-1.5 py-0.5 rounded ${
                      isFlashing ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
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
                    Bạn đã chọn nhầm: {selectedWrongLabel}
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
                    {currentQ.fullExplanationTitle}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {currentQ.fullExplanationSub}
                  </p>
                </div>
                <AudioIconButton tts={currentQ.ttsFullAnswer} label="Nghe đáp án đúng" />
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
