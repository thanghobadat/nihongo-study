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
  FLOOR_TRAP_BANK,
  Lesson3Mode,
  Lesson3PracticeQuestion,
  Lesson3Topic,
  MONEY_TRAP_BANK,
  buildFloorPracticeQuestion,
  buildMoneyPracticeQuestion,
  fisherYatesShuffle,
} from './lesson3PracticeGenerator';

interface Lesson3PracticeArenaProps {
  topic: Lesson3Topic;
  onTopicChange: (next: Lesson3Topic) => void;
}

const INITIAL_TIME_SEC = 10;
const MIN_TIME_SEC = 2.5;

function getDynamicTimeLimit(streak: number): number {
  const step = Math.floor(streak / 3);
  return Math.max(
    MIN_TIME_SEC,
    Math.round(INITIAL_TIME_SEC * Math.pow(0.9, step) * 10) / 10
  );
}

const MODE_CONFIG: {
  id: Lesson3Mode;
  badge: string;
  title: string;
  desc: string;
}[] = [
  {
    id: 'hira',
    badge: 'あ → 123',
    title: 'Hiragana → Chọn',
    desc: 'Đọc chữ mềm chọn nhanh giá / tầng',
  },
  {
    id: 'kanji',
    badge: '漢 → 123',
    title: 'Kanji → Chọn',
    desc: 'Nhìn chữ Hán chọn giá tiền / tầng',
  },
  {
    id: 'audio',
    badge: 'Nghe → 123',
    title: 'Nghe → Chọn',
    desc: 'Ẩn chữ, nghe âm phản xạ mua sắm',
  },
  {
    id: 'mixed',
    badge: 'Tổng hợp',
    title: 'Kết hợp cả 3',
    desc: 'Trộn ngẫu nhiên Hira, Kanji & Nghe',
  },
];

export default function Lesson3PracticeArena({
  topic,
  onTopicChange,
}: Lesson3PracticeArenaProps) {
  const [mode, setMode] = useState<Lesson3Mode>('mixed');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');

  const [currentQ, setCurrentQ] = useState<Lesson3PracticeQuestion | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  const [maxTime, setMaxTime] = useState<number>(INITIAL_TIME_SEC);
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME_SEC);
  const [selectedWrongLabel, setSelectedWrongLabel] = useState<string | null>(null);
  const [failReason, setFailReason] = useState<'wrong' | 'timeout'>('wrong');
  const [flashCorrectId, setFlashCorrectId] = useState<string | null>(null);

  const arenaRef = useRef<HTMLElement | null>(null);
  const moneyDeckRef = useRef<number[]>([]);
  const floorDeckRef = useRef<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isTransitioningRef = useRef<boolean>(false);
  const scoreRef = useRef<number>(0);
  const lastSpokenRef = useRef<Lesson3PracticeQuestion | null>(null);

  const storageKey = `lesson3_note_reflex_high_${topic}_${mode}`;

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
    speakJapaneseNote(text, 0.96);
  }, []);

  const drawNextQuestion = useCallback(
    (activeTopic: Lesson3Topic, activeMode: Lesson3Mode): Lesson3PracticeQuestion => {
      if (activeTopic === 'money') {
        if (moneyDeckRef.current.length === 0) {
          moneyDeckRef.current = fisherYatesShuffle(
            MONEY_TRAP_BANK.map((_, idx) => idx)
          );
        }
        const nextIdx = moneyDeckRef.current.pop()!;
        return buildMoneyPracticeQuestion(MONEY_TRAP_BANK[nextIdx], activeMode);
      } else {
        if (floorDeckRef.current.length === 0) {
          floorDeckRef.current = fisherYatesShuffle(
            FLOOR_TRAP_BANK.map((_, idx) => idx)
          );
        }
        const nextIdx = floorDeckRef.current.pop()!;
        return buildFloorPracticeQuestion(FLOOR_TRAP_BANK[nextIdx], activeMode);
      }
    },
    []
  );

  const finishGame = useCallback(
    (reason: 'wrong' | 'timeout', wrongLabel: string | null) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      isTransitioningRef.current = false;
      setFailReason(reason);
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
    if (timerRef.current) clearInterval(timerRef.current);
    isTransitioningRef.current = false;
    moneyDeckRef.current = [];
    floorDeckRef.current = [];

    scoreRef.current = 0;
    setScore(0);
    setStreak(0);
    setIsNewRecord(false);
    setSelectedWrongLabel(null);
    setFlashCorrectId(null);

    const firstLimit = getDynamicTimeLimit(0);
    setMaxTime(firstLimit);
    setTimeLeft(firstLimit);

    const firstQ = drawNextQuestion(topic, mode);
    if (firstQ.promptType === 'audio') {
      lastSpokenRef.current = firstQ;
      speakJapanese(firstQ.tts);
    } else {
      lastSpokenRef.current = null;
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.getVoices();
      }
    }

    setCurrentQ(firstQ);
    setGameState('playing');

    setTimeout(() => {
      arenaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }, [drawNextQuestion, mode, speakJapanese, topic]);

  const stopToIdle = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isTransitioningRef.current = false;
    lastSpokenRef.current = null;
    setGameState('idle');
  }, []);

  const handleSelectTopic = (nextTopic: Lesson3Topic) => {
    if (nextTopic === topic) return;
    stopToIdle();
    onTopicChange(nextTopic);
  };

  useEffect(() => {
    if (
      gameState === 'playing' &&
      currentQ?.promptType === 'audio' &&
      lastSpokenRef.current !== currentQ
    ) {
      lastSpokenRef.current = currentQ;
      speakJapanese(currentQ.tts);
    }
  }, [gameState, currentQ, speakJapanese]);

  useEffect(() => {
    if (gameState !== 'playing' || !currentQ) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      if (isTransitioningRef.current) return;
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          finishGame('timeout', null);
          return 0;
        }
        return Math.round((prev - 0.1) * 10) / 10;
      });
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState, currentQ, finishGame]);

  const handleAnswer = useCallback(
    (optionId: string, optionLabel: string) => {
      if (gameState !== 'playing' || !currentQ || isTransitioningRef.current) return;

      if (optionId === currentQ.correctId) {
        isTransitioningRef.current = true;
        setFlashCorrectId(optionId);

        const nextScore = scoreRef.current + 1;
        scoreRef.current = nextScore;
        const nextStreak = streak + 1;
        const nextLimit = getDynamicTimeLimit(nextStreak);

        setScore(nextScore);
        setStreak(nextStreak);

        setTimeout(() => {
          const nextQ = drawNextQuestion(topic, mode);
          if (nextQ.promptType === 'audio') {
            lastSpokenRef.current = nextQ;
            speakJapanese(nextQ.tts);
          } else {
            lastSpokenRef.current = null;
          }
          setFlashCorrectId(null);
          setMaxTime(nextLimit);
          setTimeLeft(nextLimit);
          setCurrentQ(nextQ);
          isTransitioningRef.current = false;
        }, 160);
      } else {
        finishGame('wrong', optionLabel);
      }
    },
    [currentQ, drawNextQuestion, finishGame, gameState, mode, speakJapanese, streak, topic]
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
      } else if (
        (e.key === 'r' || e.key === 'R' || e.key === ' ') &&
        currentQ.promptType === 'audio'
      ) {
        e.preventDefault();
        speakJapanese(currentQ.tts);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, currentQ, handleAnswer, speakJapanese]);

  const timePct = maxTime > 0 ? Math.max(0, Math.min(100, (timeLeft / maxTime) * 100)) : 0;
  const barColor =
    timePct > 50 ? 'bg-blue-600' : timePct > 25 ? 'bg-amber-500' : 'bg-rose-600';

  return (
    <section
      ref={arenaRef}
      className="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-5"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-slate-200/90 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Luyện phản xạ Đếm tiền (～円) & Đếm tầng (～階)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            10 giây ban đầu · Giảm 10% thời gian sau mỗi 3 câu đúng liên tiếp
          </p>
        </div>

        <div className="grid grid-cols-2 lg:inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => handleSelectTopic('money')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer touch-manipulation ${
              topic === 'money'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Đếm tiền (¥)
          </button>
          <button
            type="button"
            onClick={() => handleSelectTopic('floors')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer touch-manipulation ${
              topic === 'floors'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Đếm tầng (1F–20F)
          </button>
        </div>
      </div>

      {/* IDLE */}
      {gameState === 'idle' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
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
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
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
              Bắt đầu phản xạ (10s)
            </button>
          </div>
        </div>
      )}

      {/* PLAYING */}
      {gameState === 'playing' && currentQ && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full ${barColor} transition-all duration-100 ease-linear motion-reduce:transition-none`}
                style={{ width: `${timePct}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs tabular-nums">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {currentQ.promptType === 'hira'
                    ? 'Hiragana'
                    : currentQ.promptType === 'kanji'
                    ? 'Chữ Hán'
                    : 'Nghe âm'}
                </span>
                <span>·</span>
                <span
                  className={
                    timePct <= 25
                      ? 'text-rose-600 dark:text-rose-400 font-bold'
                      : 'font-semibold'
                  }
                >
                  {timeLeft.toFixed(1)}s / {maxTime.toFixed(1)}s
                </span>
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
          </div>

          <div className="rounded-xl bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 py-5 px-4 flex items-center justify-between gap-3">
            {currentQ.promptType === 'audio' ? (
              <div className="w-full text-center space-y-2.5">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Nghe và chọn {currentQ.topic === 'money' ? 'số tiền Yên' : 'vị trí tầng'} đúng
                </p>
                <button
                  type="button"
                  onClick={() => speakJapanese(currentQ.tts)}
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer touch-manipulation"
                >
                  <SpeakerSvg className="w-4 h-4" />
                  <span>Nghe lại (Phím Space)</span>
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1 min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Chọn nghĩa đúng
                  </p>
                  <div className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white break-words">
                    {currentQ.promptType === 'hira' ? currentQ.hira : currentQ.kanji}
                  </div>
                </div>
                <AudioIconButton tts={currentQ.tts} label="Nghe phát âm" />
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 tabular-nums">
            {currentQ.options.map((opt, idx) => {
              const isFlashing = flashCorrectId === opt.id;
              return (
                <button
                  key={`${opt.id}-${idx}`}
                  type="button"
                  onClick={() => handleAnswer(opt.id, opt.label)}
                  className={`relative min-h-[56px] sm:min-h-[68px] py-3 px-3 sm:px-4 rounded-xl border font-bold text-base sm:text-xl transition-colors cursor-pointer select-none touch-manipulation active:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
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
                  <span className="block truncate">{opt.label}</span>
                  {opt.subLabel && (
                    <span
                      className={`block text-[11px] font-medium mt-0.5 truncate ${
                        isFlashing ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {opt.subLabel}
                    </span>
                  )}
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
                    {failReason === 'timeout'
                      ? 'Hết thời gian'
                      : `Bạn đã chọn nhầm: ${selectedWrongLabel}`}
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
                <div className="flex flex-wrap items-baseline gap-2 text-sm">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Đáp án đúng:
                  </span>
                  <strong className="font-bold text-slate-900 dark:text-white tabular-nums">
                    {currentQ.correctDisplay}
                  </strong>
                  <span className="text-slate-500">·</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {currentQ.kanji}（{currentQ.hira}）
                  </span>
                </div>
                <AudioIconButton tts={currentQ.tts} label="Nghe đáp án đúng" />
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
