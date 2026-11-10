'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    badge: '📅 → あ',
    title: 'Ngày/Tháng → Chọn Hiragana',
    desc: 'Nhìn 4月20日, 7月4日, 9月8日... chọn cách đọc ghép chuẩn',
  },
  {
    id: 'hira',
    badge: 'あ → 📅',
    title: 'Hiragana → Chọn Ngày/Tháng',
    desc: 'Nhìn しがつ はつか... chọn đúng mốc lịch (chống nhầm ngược Ngày/Tháng)',
  },
  {
    id: 'mixed',
    badge: '🔀 Cả 2',
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
    desc: 'Nhìn câu chữ Hán (歩いて・一人で・来月...) chọn đáp án',
  },
  {
    id: 'mixed',
    badge: '🔀 Cả 2',
    title: 'Kết hợp Hira & Kanji',
    desc: 'Trộn ngẫu nhiên câu Hiragana và Kanji',
  },
];

export default function Lesson5PracticeArena({
  topic,
  onTopicChange,
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
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.94;
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

  const handleSelectTopic = (nextTopic: Lesson5Topic) => {
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
          handleAnswer(opt.id, opt.subLabel ? `${opt.label} (${opt.subLabel})` : opt.label);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, currentQ, handleAnswer]);

  const activeModeList = topic === 'dates_combined' ? DATE_MODE_CONFIG : PARTICLE_MODE_CONFIG;

  const badgeToneClasses: Record<Lesson5PracticeQuestion['badgeTone'], string> = {
    indigo:
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800/70',
    amber:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/70',
    emerald:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/70',
    rose:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/70',
  };

  return (
    <section
      ref={arenaRef}
      className="rounded-2xl bg-white dark:bg-slate-900/90 border-2 border-indigo-200/80 dark:border-indigo-800/60 p-3.5 sm:p-7 shadow-md space-y-4 sm:space-y-6"
    >
      {/* Header + Topic Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 dark:border-slate-800 pb-3.5 sm:pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-[11px] sm:text-xs font-extrabold mb-1.5">
            <span>⚡</span>
            <span>Bài tập thực hành • Không giới hạn thời gian</span>
          </div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
            3. Bài tập thực hành Kết hợp Ngày–Tháng &amp; Trợ từ Bài 5
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => handleSelectTopic('dates_combined')}
            className={`min-h-[40px] px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer touch-manipulation ${
              topic === 'dates_combined'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📅 Kết hợp Ngày &amp; Tháng
          </button>
          <button
            type="button"
            onClick={() => handleSelectTopic('particles')}
            className={`min-h-[40px] px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer touch-manipulation ${
              topic === 'particles'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🎯 Trợ từ &amp; Ngoại lệ
          </button>
        </div>
      </div>

      {/* IDLE */}
      {gameState === 'idle' && (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-2.5 sm:mb-3 leading-relaxed">
              {topic === 'dates_combined'
                ? 'Chọn chiều luyện tập kết hợp [Tháng + Ngày] (bẫy 4月/7月/9月 + ngày đặc biệt 1–10, 14, 20, 24):'
                : 'Chọn chế độ chữ hiển thị (bẫy 歩いて không で • 一人で không と • どこへも • có/không có に):'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {activeModeList.map((m) => {
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`text-left p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer touch-manipulation active:scale-[0.98] ${
                      active
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="inline-block px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-black text-indigo-600 dark:text-indigo-300 mb-1 sm:mb-1.5">
                      {m.badge}
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                      {m.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {m.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between sm:justify-start sm:space-x-4 text-xs sm:text-sm">
              <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Kỷ lục hiện tại: </span>
                <strong className="text-amber-600 dark:text-amber-400 font-black">
                  {highScore} câu
                </strong>
              </div>
              <span className="hidden md:inline text-xs text-slate-400 dark:text-slate-500">
                Mẹo: Bấm nhanh phím 1 – 4 trên bàn phím
              </span>
            </div>

            <button
              type="button"
              onClick={startGame}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:opacity-95 text-white text-xs sm:text-sm font-black tracking-wide shadow-md transition-all active:scale-[0.98] cursor-pointer touch-manipulation"
            >
              ⚡ BẮT ĐẦU LÀM BÀI
            </button>
          </div>
        </div>
      )}

      {/* PLAYING */}
      {gameState === 'playing' && currentQ && (
        <div className="space-y-3.5 sm:space-y-5">
          <div className="flex items-center justify-between gap-1.5 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/70 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] sm:text-xs whitespace-nowrap">
                {topic === 'dates_combined'
                  ? currentQ.promptType === 'kanji'
                    ? '📅 Ngày/Tháng → あ'
                    : 'あ Hiragana → 📅'
                  : currentQ.promptType === 'hira'
                  ? 'あ Hiragana'
                  : '漢 Chữ Hán'}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <span className="font-extrabold text-slate-700 dark:text-slate-200 text-xs sm:text-sm">
                Điểm:{' '}
                <span className="text-indigo-600 dark:text-indigo-400 text-sm sm:text-base">
                  {score}
                </span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/60 border border-orange-200/70 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-[11px] sm:text-xs font-extrabold">
                🔥 {streak}
              </span>
              <button
                type="button"
                onClick={stopToIdle}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs font-bold cursor-pointer touch-manipulation"
              >
                Đổi chế độ
              </button>
            </div>
          </div>

          {/* Question Box */}
          <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-indigo-50/35 dark:from-slate-950 dark:to-indigo-950/25 border border-indigo-100 dark:border-indigo-900/60 p-4 sm:p-6 text-center space-y-2.5">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-extrabold border ${
                  badgeToneClasses[currentQ.badgeTone]
                }`}
              >
                {currentQ.badgeText}
              </span>
              {currentQ.topic === 'dates_combined' && currentQ.promptType === 'hira' && (
                <button
                  type="button"
                  onClick={() => speakJapanese(currentQ.ttsFullAnswer)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 cursor-pointer touch-manipulation"
                >
                  🔊 Nghe phát âm
                </button>
              )}
            </div>

            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide py-0.5 leading-relaxed break-words">
              {currentQ.promptMain}
            </div>

            <p className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300 leading-snug">
              {currentQ.promptSub}
            </p>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
              {currentQ.contextHint}
            </p>
          </div>

          {/* 4 Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {currentQ.options.map((opt, idx) => {
              const isFlashing = flashCorrectId === opt.id;
              const displayLabel = opt.subLabel ? `${opt.label} (${opt.subLabel})` : opt.label;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleAnswer(opt.id, displayLabel)}
                  className={`relative min-h-[54px] sm:min-h-[64px] p-3 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer select-none touch-manipulation flex items-center justify-between gap-2 ${
                    isFlashing
                      ? 'bg-emerald-500 border-emerald-600 text-white scale-[1.01] shadow-md'
                      : 'bg-white dark:bg-slate-950 border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 active:scale-[0.98]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-sm sm:text-base font-extrabold leading-snug break-words ${
                        isFlashing ? 'text-white' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {opt.label}
                    </div>
                    {opt.subLabel && (
                      <div
                        className={`text-[11px] sm:text-xs font-bold mt-0.5 ${
                          isFlashing
                            ? 'text-emerald-100'
                            : 'text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {opt.subLabel}
                      </div>
                    )}
                  </div>
                  <span
                    className={`hidden md:inline-block shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isFlashing
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    [{idx + 1}]
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {gameState === 'gameover' && currentQ && (
        <div className="space-y-4 sm:space-y-5">
          <div className="rounded-2xl bg-rose-50/80 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-800/70 p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-600 text-white text-xs font-black">
                  ❌ CHỌN NHẦM BẪY!
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mt-1.5">
                  Bạn vừa chọn:{' '}
                  <strong className="text-rose-600 dark:text-rose-400">
                    {selectedWrongLabel}
                  </strong>
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Điểm lượt này</div>
                  <div className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {score} câu
                  </div>
                </div>
                <div className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Kỷ lục</div>
                  <div className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
                    {highScore} {isNewRecord && '🏆'}
                  </div>
                </div>
              </div>
            </div>

            {/* Answer & Trap Breakdown */}
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/60 p-3.5 sm:p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Đáp án đúng
                  </span>
                  <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
                    <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {currentQ.correctDisplay}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                    {currentQ.fullExplanationTitle}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {currentQ.fullExplanationSub}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => speakJapanese(currentQ.ttsFullAnswer)}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold transition-colors cursor-pointer touch-manipulation shrink-0"
                >
                  🔊 Nghe phát âm
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                <strong className="text-amber-700 dark:text-amber-300">💡 Giải mã bẫy: </strong>
                {currentQ.trapNote}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={stopToIdle}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer touch-manipulation"
            >
              ← Đổi chế độ / Chủ đề
            </button>

            <button
              type="button"
              onClick={startGame}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-black tracking-wide shadow-md transition-all active:scale-[0.98] cursor-pointer touch-manipulation"
            >
              🔄 Chơi lại ngay
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

