'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    title: 'Hiragana → Chọn đáp án',
    desc: 'Đọc chữ mềm chọn nhanh giá tiền / tầng',
  },
  {
    id: 'kanji',
    badge: '漢 → 123',
    title: 'Kanji → Chọn đáp án',
    desc: 'Nhận diện chữ Hán chọn giá tiền / tầng',
  },
  {
    id: 'audio',
    badge: '🔊 → 123',
    title: 'Nghe → Chọn đáp án',
    desc: 'Ẩn mặt chữ, nghe âm phản xạ như đi mua sắm',
  },
  {
    id: 'mixed',
    badge: '🔀 Cả 3',
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

  const moneyDeckRef = useRef<number[]>([]);
  const floorDeckRef = useRef<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isTransitioningRef = useRef<boolean>(false);
  const scoreRef = useRef<number>(0);

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
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.98;
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find((v) => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
    if (jaVoice) utterance.voice = jaVoice;
    window.speechSynthesis.speak(utterance);
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
    setCurrentQ(firstQ);
    setGameState('playing');
  }, [drawNextQuestion, mode, topic]);

  const stopToIdle = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isTransitioningRef.current = false;
    setGameState('idle');
  }, []);

  const handleSelectTopic = (nextTopic: Lesson3Topic) => {
    if (nextTopic === topic) return;
    stopToIdle();
    onTopicChange(nextTopic);
  };

  useEffect(() => {
    if (gameState === 'playing' && currentQ?.promptType === 'audio') {
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
          setFlashCorrectId(null);
          setMaxTime(nextLimit);
          setTimeLeft(nextLimit);
          setCurrentQ(nextQ);
          isTransitioningRef.current = false;
        }, 180);
      } else {
        finishGame('wrong', optionLabel);
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
    timePct > 50
      ? 'bg-emerald-500'
      : timePct > 25
      ? 'bg-amber-500'
      : 'bg-rose-500';

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900/90 border-2 border-indigo-200/80 dark:border-indigo-800/60 p-5 sm:p-7 shadow-md space-y-6">
      {/* Header + Topic Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-extrabold mb-1.5">
            <span>⚡</span>
            <span>Phòng luyện phản xạ chống bẫy • Giảm 10% thời gian mỗi 3 câu đúng</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            3. Thử thách phản xạ Đếm tiền (～円) &amp; Đếm tầng (～階)
          </h2>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => handleSelectTopic('money')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              topic === 'money'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            💴 Đếm tiền &amp; Số lớn (¥)
          </button>
          <button
            type="button"
            onClick={() => handleSelectTopic('floors')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              topic === 'floors'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🏢 Đếm tầng lầu (1F–20F &amp; Hầm)
          </button>
        </div>
      </div>

      {/* IDLE */}
      {gameState === 'idle' && (
        <div className="space-y-6">
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
              Chọn chế độ ra đề (
              {topic === 'money'
                ? 'Gài bẫy biến âm 300/600/800/3000/8000, khuyết số 0 & lệch hàng Vạn まん'
                : 'Gài bẫy 1F/3F/6F/8F/10F & Tầng hầm B1–B3'}
              ):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {MODE_CONFIG.map((m) => {
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      active
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="inline-block px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-black text-indigo-600 dark:text-indigo-300 mb-2">
                      {m.badge}
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                      {m.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {m.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-4 text-xs sm:text-sm">
              <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Kỷ lục hiện tại: </span>
                <strong className="text-amber-600 dark:text-amber-400 font-black">
                  {highScore} câu
                </strong>
              </div>
              <span className="hidden md:inline text-xs text-slate-400 dark:text-slate-500">
                Mẹo: Hỗ trợ bấm nhanh phím 1 – 4 trên bàn phím
              </span>
            </div>

            <button
              type="button"
              onClick={startGame}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:opacity-95 text-white text-xs sm:text-sm font-black tracking-wide shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              ⚡ BẮT ĐẦU PHẢN XẠ NHANH (10S)
            </button>
          </div>
        </div>
      )}

      {/* PLAYING */}
      {gameState === 'playing' && currentQ && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/70 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                {currentQ.promptType === 'hira'
                  ? 'あ Đọc Hiragana'
                  : currentQ.promptType === 'kanji'
                  ? '漢 Nhìn chữ Hán'
                  : '🔊 Nghe phát âm'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
                Giới hạn: {maxTime.toFixed(1)}s/câu
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-extrabold text-slate-700 dark:text-slate-200">
                Điểm: <span className="text-indigo-600 dark:text-indigo-400 text-base">{score}</span>
              </span>
              <span className="font-extrabold text-amber-600 dark:text-amber-400">
                🔥 Streak: {streak}
              </span>
              <button
                type="button"
                onClick={stopToIdle}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                ✕ Dừng
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400 dark:text-slate-500">Thời gian còn lại</span>
              <span
                className={
                  timePct <= 25
                    ? 'text-rose-600 dark:text-rose-400 font-black'
                    : 'text-slate-700 dark:text-slate-200 font-black'
                }
              >
                {timeLeft.toFixed(1)}s
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full ${barColor} transition-all duration-100 ease-linear`}
                style={{ width: `${timePct}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 py-8 px-4 text-center space-y-3">
            {currentQ.promptType === 'audio' ? (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                  Nghe và chọn {currentQ.topic === 'money' ? 'mức giá Yên' : 'vị trí tầng'} đúng
                </p>
                <button
                  type="button"
                  onClick={() => speakJapanese(currentQ.tts)}
                  className="inline-flex items-center space-x-2.5 px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-2xl">🔊</span>
                  <span>Bấm để nghe lại (Phím Space)</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Chọn {currentQ.topic === 'money' ? 'số tiền Yên' : 'tầng lầu'} tương ứng với
                </p>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide text-slate-900 dark:text-white py-1 select-none break-all">
                  {currentQ.promptType === 'hira' ? currentQ.hira : currentQ.kanji}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {currentQ.options.map((opt, idx) => {
              const isFlashing = flashCorrectId === opt.id;
              return (
                <button
                  key={`${opt.id}-${idx}`}
                  type="button"
                  onClick={() => handleAnswer(opt.id, opt.label)}
                  className={`relative py-4 sm:py-5 px-4 rounded-2xl border-2 font-black text-lg sm:text-2xl transition-all cursor-pointer active:scale-[0.98] ${
                    isFlashing
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                      : 'bg-white hover:bg-indigo-50/70 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-slate-900 dark:text-white shadow-sm'
                  }`}
                >
                  <span
                    className={`absolute top-2 left-3 text-[11px] font-bold ${
                      isFlashing ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    [{idx + 1}]
                  </span>
                  <span>{opt.label}</span>
                  {opt.subLabel && (
                    <span
                      className={`block text-[11px] font-semibold mt-0.5 ${
                        isFlashing ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-400'
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
        <div className="space-y-5">
          <div className="rounded-2xl bg-rose-50/70 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-800/60 p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl">{failReason === 'timeout' ? '⏰' : '💥'}</span>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-rose-700 dark:text-rose-300">
                    {failReason === 'timeout'
                      ? 'Hết thời gian mất rồi!'
                      : `Chọn nhầm ${selectedWrongLabel} rồi!`}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Tổng điểm lượt này: <strong>{score} câu đúng</strong> • Kỷ lục: <strong>{highScore} câu</strong>
                  </p>
                </div>
              </div>

              {isNewRecord && score > 0 && (
                <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-black shadow-sm">
                  🏆 KỶ LỤC MỚI!
                </span>
              )}
            </div>

            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Đáp án đúng
                  </span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">
                    {currentQ.correctDisplay}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {currentQ.kanji}
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-300">
                    （{currentQ.hira}）
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => speakJapanese(currentQ.tts)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 text-xs font-bold cursor-pointer"
                >
                  <span>🔊</span>
                  <span>Nghe lại phát âm</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800">
                <strong className="text-amber-600 dark:text-amber-400">💡 Giải mã bẫy: </strong>
                {currentQ.trapNote}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={stopToIdle}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              ⚙️ Đổi chế độ
            </button>
            <button
              type="button"
              onClick={startGame}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-black shadow-sm transition-colors cursor-pointer"
            >
              ⚡ Chơi lại ngay
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

