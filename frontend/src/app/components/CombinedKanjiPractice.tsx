'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  KanjiItemData,
  COMMON_KANJI_DISTRACTORS,
  shuffleArray,
  KanjiRecognitionQuizQuestion,
  fetchKanjiRecognitionQuestions
} from '../utils/kanjiPracticeHelper';
import { playAudioWithFallback, playSpeedrunSound } from '../utils/audioHelper';
import { getKanjiForm, getGlobalKanjiForm } from '../utils/kanjiFormLookup';

interface LinkedVocab {
  hiragana: string;
  meaning: string;
  kanjiForm: string;
}

const getLinkedVocabForKanji = (
  kanjiChar: string,
  vocabList?: any[],
  kanjiList: KanjiItemData[] = []
): LinkedVocab[] => {
  const results: LinkedVocab[] = [];
  const seenHira = new Set<string>();

  if (Array.isArray(vocabList)) {
    for (const v of vocabList) {
      if (!v || !v.hiragana) continue;
      const kForm = v.kanji_form || getGlobalKanjiForm(v.hiragana, kanjiList);
      if (kForm && kForm.includes(kanjiChar) && !seenHira.has(v.hiragana)) {
        seenHira.add(v.hiragana);
        results.push({
          hiragana: v.hiragana,
          meaning: v.vietnamese_meaning || '',
          kanjiForm: kForm
        });
      }
    }
  }

  // Fallback: check kanji compounds if vocabList doesn't have it
  if (results.length === 0) {
    const targetKanji = kanjiList.find(k => k.character === kanjiChar);
    if (targetKanji && targetKanji.compounds) {
      const parts = targetKanji.compounds.split(';');
      for (const p of parts) {
        const m = p.match(/([^\(\)\s:;]+)\s*\(([^)]+)\)\s*[:：]\s*(.+)/);
        if (m) {
          const kWord = m[1].trim();
          const hWord = m[2].trim();
          const mean = m[3].trim();
          if (kWord.includes(kanjiChar) && !seenHira.has(hWord)) {
            seenHira.add(hWord);
            results.push({
              hiragana: hWord,
              meaning: mean,
              kanjiForm: kWord
            });
          }
        }
      }
    }
  }

  return results;
};

interface CombinedKanjiPracticeProps {
  kanjiList: KanjiItemData[];
  vocabList?: any[];
  currentLevel?: 'N5' | 'N4';
  onUpdateKanjiStatus?: (id: number, type: 'vocabulary' | 'kanji' | 'grammar', status: 'not_learned' | 'learning' | 'mastered') => void;
}

export default function CombinedKanjiPractice({
  kanjiList,
  vocabList = [],
  currentLevel = 'N5',
  onUpdateKanjiStatus
}: CombinedKanjiPracticeProps) {
  // Main Game Mode: 'recognition' | 'speedrun'
  const [activeGame, setActiveGame] = useState<'recognition' | 'speedrun'>('recognition');

  // Scope filter: 'level' (current N5 or N4) | 'all_50' (all 50 lessons) | specific lesson number
  const [scopeFilter, setScopeFilter] = useState<'level' | 'all_50' | string>('level');

  // Status Filter: 'all' | 'not_learned' | 'learning' | 'mastered'
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_learned' | 'learning' | 'mastered'>('all');

  // Toggle view for per-lesson breakdown matrix
  const [showLessonMatrix, setShowLessonMatrix] = useState<boolean>(false);

  // Scoped Kanji by level or specific lesson
  const scopedKanji = useMemo(() => {
    if (scopeFilter === 'all_50') return kanjiList;
    if (scopeFilter === 'level') {
      const start = currentLevel === 'N5' ? 1 : 26;
      const end = currentLevel === 'N5' ? 25 : 50;
      return kanjiList.filter(k => k.lesson_id >= start && k.lesson_id <= end);
    }
    const lId = parseInt(scopeFilter, 10);
    if (!isNaN(lId)) {
      return kanjiList.filter(k => k.lesson_id === lId);
    }
    return kanjiList;
  }, [kanjiList, scopeFilter, currentLevel]);

  // Eligible Kanji after applying status filter
  const eligibleKanji = useMemo(() => {
    if (statusFilter === 'all') return scopedKanji;
    return scopedKanji.filter(k => (k.status || 'not_learned') === statusFilter);
  }, [scopedKanji, statusFilter]);

  // Statistics counters
  const totalCount = scopedKanji.length;
  const masteredCount = scopedKanji.filter(k => k.status === 'mastered').length;
  const learningCount = scopedKanji.filter(k => k.status === 'learning').length;
  const notLearnedCount = scopedKanji.filter(k => (k.status || 'not_learned') === 'not_learned').length;

  const scopedMasteredPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
  const scopedLearningPercent = totalCount > 0 ? Math.round((learningCount / totalCount) * 100) : 0;

  // Per-lesson Kanji statistics mapping: lessonId -> { total, mastered, learning, notLearned, percent }
  const perLessonKanjiStats = useMemo(() => {
    const stats: Record<number, { total: number; mastered: number; learning: number; notLearned: number; percent: number }> = {};
    for (let i = 1; i <= 50; i++) {
      const inLesson = kanjiList.filter(k => k.lesson_id === i);
      const total = inLesson.length;
      const mastered = inLesson.filter(k => k.status === 'mastered').length;
      const learning = inLesson.filter(k => k.status === 'learning').length;
      const notLearned = inLesson.filter(k => (k.status || 'not_learned') === 'not_learned').length;
      const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;
      stats[i] = { total, mastered, learning, notLearned, percent };
    }
    return stats;
  }, [kanjiList]);

  // Audio helper
  const handlePlayAudio = useCallback((char: string, kana?: string) => {
    const playKana = kana || char;
    playAudioWithFallback(char, playKana);
  }, []);

  // Update status handler
  const handleQuickStatusChange = (kanjiItem: KanjiItemData, newStatus: 'not_learned' | 'learning' | 'mastered') => {
    if (onUpdateKanjiStatus) {
      onUpdateKanjiStatus(kanjiItem.id, 'kanji', newStatus);
    }
  };

  // =========================================================================
  // 1. GAME 1: NHẬN DIỆN MẶT CHỮ (AI RECOGNITION QUIZ)
  // =========================================================================
  const [quizQuestions, setQuizQuestions] = useState<KanjiRecognitionQuizQuestion[]>([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<number, { chosenIdx: number; isCorrect: boolean }>>({});
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);
  const [quizWrongList, setQuizWrongList] = useState<KanjiRecognitionQuizQuestion[]>([]);

  // Target lesson ID passed to API
  const targetLessonId = useMemo(() => {
    if (scopeFilter !== 'level' && scopeFilter !== 'all_50') {
      const n = parseInt(scopeFilter, 10);
      if (!isNaN(n)) return n;
    }
    return currentLevel === 'N5' ? 25 : 50;
  }, [scopeFilter, currentLevel]);

  // Fetch AI Recognition Quiz when entering game or changing scope/filter
  useEffect(() => {
    if (activeGame !== 'recognition' || eligibleKanji.length === 0) return;

    let isMounted = true;
    setIsLoadingQuiz(true);

    const learnedChars = kanjiList
      .filter(k => k.status === 'learning' || k.status === 'mastered')
      .map(k => k.character);

    fetchKanjiRecognitionQuestions(targetLessonId, eligibleKanji, false, vocabList, learnedChars)
      .then(fetchedQuestions => {
        if (!isMounted) return;
        setQuizQuestions(shuffleArray(fetchedQuestions));
        setQuizIndex(0);
        setSelectedOptionIdx(null);
        setIsQuizSubmitted(false);
        setQuizScore(0);
        setUserQuizAnswers({});
        setIsQuizFinished(false);
        setQuizWrongList([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingQuiz(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeGame, targetLessonId, eligibleKanji, vocabList, kanjiList]);

  // Shuffle quiz questions
  const handleShuffleQuiz = () => {
    if (quizQuestions.length <= 1) return;
    setQuizQuestions(shuffleArray(quizQuestions));
    setQuizIndex(0);
    setSelectedOptionIdx(null);
    setIsQuizSubmitted(false);
  };

  // Fresh AI questions (bypass cache via forceRefresh)
  const loadFreshQuiz = async () => {
    if (eligibleKanji.length === 0) return;
    setIsLoadingQuiz(true);
    try {
      const learnedChars = kanjiList
        .filter(k => k.status === 'learning' || k.status === 'mastered')
        .map(k => k.character);
      const freshQuestions = await fetchKanjiRecognitionQuestions(targetLessonId, eligibleKanji, true, vocabList, learnedChars);
      setQuizQuestions(shuffleArray(freshQuestions));
      setQuizIndex(0);
      setSelectedOptionIdx(null);
      setIsQuizSubmitted(false);
      setQuizScore(0);
      setUserQuizAnswers({});
      setIsQuizFinished(false);
      setQuizWrongList([]);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const currentQuizQ = quizQuestions[quizIndex] || null;

  const handleSelectQuizOption = (idx: number) => {
    if (isQuizSubmitted || !currentQuizQ) return;
    setSelectedOptionIdx(idx);
    setIsQuizSubmitted(true);
    const isCorrect = idx === currentQuizQ.correct_index;

    setUserQuizAnswers(prev => ({ ...prev, [quizIndex]: { chosenIdx: idx, isCorrect } }));

    if (isCorrect) {
      setQuizScore(s => s + 1);
      playSpeedrunSound('correct');
      const audioToPlay = currentQuizQ.target_word || currentQuizQ.target_kanji;
      handlePlayAudio(audioToPlay, currentQuizQ.target_word_reading || audioToPlay);
    } else {
      playSpeedrunSound('wrong');
      setQuizWrongList(list => {
        if (list.some(q => q.id === currentQuizQ.id)) return list;
        return [...list, currentQuizQ];
      });
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex + 1 < quizQuestions.length) {
      setQuizIndex(prev => prev + 1);
      setSelectedOptionIdx(null);
      setIsQuizSubmitted(false);
    } else {
      setIsQuizFinished(true);
    }
  };

  const handlePrevQuizQuestion = () => {
    if (quizIndex > 0) {
      setQuizIndex(prev => prev - 1);
      const prevAnswer = userQuizAnswers[quizIndex - 1];
      if (prevAnswer) {
        setSelectedOptionIdx(prevAnswer.chosenIdx);
        setIsQuizSubmitted(true);
      } else {
        setSelectedOptionIdx(null);
        setIsQuizSubmitted(false);
      }
    }
  };

  const handleRetryWrongQuestions = () => {
    if (quizWrongList.length === 0) return;
    setQuizQuestions(shuffleArray(quizWrongList));
    setQuizIndex(0);
    setSelectedOptionIdx(null);
    setIsQuizSubmitted(false);
    setQuizScore(0);
    setUserQuizAnswers({});
    setIsQuizFinished(false);
    setQuizWrongList([]);
  };

  // =========================================================================
  // 2. GAME 2: SPEEDRUN LUYỆN PHẢN XẠ KANJI
  // =========================================================================
  const [speedrunActive, setSpeedrunActive] = useState<boolean>(false);
  const [speedrunGameOver, setSpeedrunGameOver] = useState<boolean>(false);
  const [speedrunScore, setSpeedrunScore] = useState<number>(0);
  const [speedrunHighScore, setSpeedrunHighScore] = useState<number>(0);
  const [speedrunStreak, setSpeedrunStreak] = useState<number>(0);
  const [speedrunMaxStreak, setSpeedrunMaxStreak] = useState<number>(0);
  const [speedrunTimeLeft, setSpeedrunTimeLeft] = useState<number>(15);
  const [speedrunMaxTime, setSpeedrunMaxTime] = useState<number>(15);
  const [speedrunDirection, setSpeedrunDirection] = useState<'both' | 'kanji-to-meaning' | 'meaning-to-kanji' | 'kanji-vocab'>('both');
  const [speedrunWrongList, setSpeedrunWrongList] = useState<KanjiItemData[]>([]);

  interface SpeedrunQ {
    subject: string;
    subText?: string;
    promptText: string;
    correctKanji: KanjiItemData;
    audioWord?: string;
    correctAnswerText: string;
    options: { text: string; isCorrect: boolean }[];
    direction: 'kanji-to-meaning' | 'meaning-to-kanji' | 'kanji-to-vocab' | 'vocab-to-kanji';
  }
  const [currentSpeedrunQ, setCurrentSpeedrunQ] = useState<SpeedrunQ | null>(null);
  const [speedrunSelectedIdx, setSpeedrunSelectedIdx] = useState<number | null>(null);
  const [speedrunIsAnswerCorrect, setSpeedrunIsAnswerCorrect] = useState<boolean | null>(null);

  const speedrunTimerRef = useRef<any>(null);
  const speedrunScoreRef = useRef<number>(0);
  const speedrunMaxTimeRef = useRef<number>(15);

  // Load Speedrun high score from localStorage
  useEffect(() => {
    try {
      const savedHigh = localStorage.getItem('kanji_speedrun_high_combined');
      if (savedHigh) {
        setSpeedrunHighScore(parseInt(savedHigh, 10) || 0);
      }
    } catch {
      // ignore
    }
  }, []);

  // Dynamic time calculation (10% reduction every 3 streak points, minimum 2.5s)
  const getDynamicTimeForStreak = (streak: number): number => {
    const reductionCount = Math.floor(streak / 3);
    return Math.max(2.5, Math.round(15 * Math.pow(0.9, reductionCount) * 10) / 10);
  };

  // Generate next Speedrun question
  const generateSpeedrunQuestion = useCallback((): SpeedrunQ | null => {
    if (eligibleKanji.length === 0) return null;

    const target = eligibleKanji[Math.floor(Math.random() * eligibleKanji.length)];

    // Blend AI situational questions if available (40% probability)
    if (quizQuestions.length > 0 && (speedrunDirection === 'both' || speedrunDirection === 'kanji-vocab') && Math.random() < 0.4) {
      const q = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
      const targetKanjiItem = eligibleKanji.find(k => k.character === q.target_kanji) || target;
      return {
        subject: q.context_sentence || q.question_text || q.target_word || q.target_kanji,
        subText: q.target_word_hint ? `💡 ${q.target_word_hint}` : undefined,
        promptText: q.question_translation ? `👉 ${q.question_translation}` : '👉 Nhận diện chữ Hán trong ngữ cảnh:',
        correctKanji: targetKanjiItem,
        audioWord: q.target_word || q.target_kanji,
        correctAnswerText: q.options[q.correct_index],
        options: q.options.map((opt, idx) => ({
          text: opt,
          isCorrect: idx === q.correct_index
        })),
        direction: 'kanji-to-vocab'
      };
    }

    // Direction selection
    let chosenDir: 'kanji-to-meaning' | 'meaning-to-kanji' | 'kanji-to-vocab' | 'vocab-to-kanji' = 'kanji-to-meaning';
    if (speedrunDirection === 'both') {
      const modes: ('kanji-to-meaning' | 'meaning-to-kanji' | 'kanji-to-vocab')[] = ['kanji-to-meaning', 'meaning-to-kanji'];
      if (vocabList && vocabList.length > 0) modes.push('kanji-to-vocab');
      chosenDir = modes[Math.floor(Math.random() * modes.length)];
    } else if (speedrunDirection === 'kanji-vocab') {
      chosenDir = 'kanji-to-vocab';
    } else {
      chosenDir = speedrunDirection;
    }

    // Mode 1: Kanji -> Meaning / Sino-Vietnamese
    if (chosenDir === 'kanji-to-meaning') {
      const correctText = `${target.sino_vietnamese ? target.sino_vietnamese + ' • ' : ''}${target.vietnamese_meaning}`;
      const pool = eligibleKanji.length >= 4 ? eligibleKanji : kanjiList;
      const otherKanjis = shuffleArray(pool.filter(k => k.character !== target.character)).slice(0, 3);
      const wrongOptions = otherKanjis.map(k => `${k.sino_vietnamese ? k.sino_vietnamese + ' • ' : ''}${k.vietnamese_meaning}`);

      const allOpts = shuffleArray([
        { text: correctText, isCorrect: true },
        ...wrongOptions.map(t => ({ text: t, isCorrect: false }))
      ]);

      return {
        subject: target.character,
        subText: `Âm On: ${target.onyomi || '—'}  |  Âm Kun: ${target.kunyomi || '—'}`,
        promptText: '👉 Chọn âm Hán Việt và ý nghĩa đúng của chữ Hán:',
        correctKanji: target,
        correctAnswerText: correctText,
        options: allOpts,
        direction: 'kanji-to-meaning'
      };
    }

    // Mode 2: Meaning / Sino-Vietnamese -> Kanji
    if (chosenDir === 'meaning-to-kanji') {
      const promptMeaning = `${target.sino_vietnamese ? target.sino_vietnamese + ' : ' : ''}${target.vietnamese_meaning}`;
      const pool = eligibleKanji.length >= 4 ? eligibleKanji : kanjiList;
      const otherKanjis = shuffleArray(
        pool.filter(k => k.character !== target.character)
          .concat(COMMON_KANJI_DISTRACTORS.filter(d => d.character !== target.character))
      ).slice(0, 3);

      const allOpts = shuffleArray([
        { text: target.character, isCorrect: true },
        ...otherKanjis.map(k => ({ text: k.character, isCorrect: false }))
      ]);

      return {
        subject: promptMeaning,
        subText: `Nét bút: ${target.stroke_count || '—'} nét  |  Âm Kun: ${target.kunyomi || '—'}`,
        promptText: '👉 Chọn chữ Hán tương ứng với ý nghĩa:',
        correctKanji: target,
        correctAnswerText: target.character,
        options: allOpts,
        direction: 'meaning-to-kanji'
      };
    }

    // Mode 3: Kanji -> Linked Vocab in Context
    const linked = getLinkedVocabForKanji(target.character, vocabList, kanjiList);
    if (linked.length > 0) {
      const item = linked[Math.floor(Math.random() * linked.length)];
      const pool = eligibleKanji.length >= 4 ? eligibleKanji : kanjiList;
      const wrongList = shuffleArray(
        pool.filter(k => k.character !== target.character)
          .concat(COMMON_KANJI_DISTRACTORS.filter(d => d.character !== target.character))
      ).slice(0, 3);

      const wrongOpts = wrongList.map(w => item.kanjiForm.replace(target.character, w.character));
      const allOpts = shuffleArray([
        { text: item.kanjiForm, isCorrect: true },
        ...wrongOpts.map(t => ({ text: t, isCorrect: false }))
      ]);

      return {
        subject: item.hiragana,
        subText: `Nghĩa: ${item.meaning}  •  Chữ mục tiêu: 【${target.character}】`,
        promptText: '👉 Chọn từ vựng chữ Hán viết chuẩn xác:',
        correctKanji: target,
        audioWord: item.kanjiForm,
        correctAnswerText: item.kanjiForm,
        options: allOpts,
        direction: 'kanji-to-vocab'
      };
    }

    // Default fallback to Kanji -> Meaning
    const correctText = `${target.sino_vietnamese ? target.sino_vietnamese + ' • ' : ''}${target.vietnamese_meaning}`;
    const otherKanjis = shuffleArray(kanjiList.filter(k => k.character !== target.character)).slice(0, 3);
    const wrongOptions = otherKanjis.map(k => `${k.sino_vietnamese ? k.sino_vietnamese + ' • ' : ''}${k.vietnamese_meaning}`);

    return {
      subject: target.character,
      promptText: '👉 Chọn âm Hán Việt và ý nghĩa đúng:',
      correctKanji: target,
      correctAnswerText: correctText,
      options: shuffleArray([
        { text: correctText, isCorrect: true },
        ...wrongOptions.map(t => ({ text: t, isCorrect: false }))
      ]),
      direction: 'kanji-to-meaning'
    };
  }, [eligibleKanji, kanjiList, vocabList, quizQuestions, speedrunDirection]);

  // Start Speedrun Game
  const startSpeedrun = () => {
    if (eligibleKanji.length === 0) return;
    setSpeedrunScore(0);
    speedrunScoreRef.current = 0;
    setSpeedrunStreak(0);
    setSpeedrunMaxStreak(0);
    setSpeedrunWrongList([]);
    setSpeedrunGameOver(false);
    setSpeedrunSelectedIdx(null);
    setSpeedrunIsAnswerCorrect(null);

    const initialTime = getDynamicTimeForStreak(0);
    setSpeedrunTimeLeft(initialTime);
    setSpeedrunMaxTime(initialTime);
    speedrunMaxTimeRef.current = initialTime;

    const firstQ = generateSpeedrunQuestion();
    setCurrentSpeedrunQ(firstQ);
    setSpeedrunActive(true);
  };

  // Speedrun Countdown Timer effect
  useEffect(() => {
    if (!speedrunActive || speedrunGameOver) {
      if (speedrunTimerRef.current) clearInterval(speedrunTimerRef.current);
      return;
    }

    speedrunTimerRef.current = setInterval(() => {
      setSpeedrunTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(speedrunTimerRef.current);
          handleSpeedrunTimeOut();
          return 0;
        }
        return Math.max(0, Math.round((prev - 0.1) * 10) / 10);
      });
    }, 100);

    return () => {
      if (speedrunTimerRef.current) clearInterval(speedrunTimerRef.current);
    };
  }, [speedrunActive, speedrunGameOver]);

  // Handle Timeout
  const handleSpeedrunTimeOut = () => {
    playSpeedrunSound('wrong');
    if (currentSpeedrunQ) {
      setSpeedrunWrongList(list => {
        if (list.some(k => k.id === currentSpeedrunQ.correctKanji.id)) return list;
        return [...list, currentSpeedrunQ.correctKanji];
      });
    }
    endSpeedrun();
  };

  // Handle Option Click
  const handleSpeedrunAnswer = (opt: { text: string; isCorrect: boolean }, idx: number) => {
    if (speedrunSelectedIdx !== null || !speedrunActive || speedrunGameOver) return;
    if (speedrunTimerRef.current) clearInterval(speedrunTimerRef.current);

    setSpeedrunSelectedIdx(idx);
    setSpeedrunIsAnswerCorrect(opt.isCorrect);

    if (opt.isCorrect) {
      playSpeedrunSound('correct');
      if (currentSpeedrunQ?.audioWord) {
        handlePlayAudio(currentSpeedrunQ.audioWord);
      } else if (currentSpeedrunQ?.correctKanji) {
        handlePlayAudio(currentSpeedrunQ.correctKanji.character);
      }

      const timeBonus = Math.round(speedrunTimeLeft * 10);
      const streakMultiplier = Math.min(4, 1 + Math.floor(speedrunStreak / 5) * 0.5);
      const pointsEarned = Math.round((100 + timeBonus) * streakMultiplier);

      const newScore = speedrunScoreRef.current + pointsEarned;
      speedrunScoreRef.current = newScore;
      setSpeedrunScore(newScore);

      const newStreak = speedrunStreak + 1;
      setSpeedrunStreak(newStreak);
      setSpeedrunMaxStreak(prev => Math.max(prev, newStreak));

      // Advance to next question after 350ms
      setTimeout(() => {
        const nextTime = getDynamicTimeForStreak(newStreak);
        setSpeedrunTimeLeft(nextTime);
        setSpeedrunMaxTime(nextTime);
        speedrunMaxTimeRef.current = nextTime;
        setSpeedrunSelectedIdx(null);
        setSpeedrunIsAnswerCorrect(null);

        const nextQ = generateSpeedrunQuestion();
        setCurrentSpeedrunQ(nextQ);
      }, 350);
    } else {
      playSpeedrunSound('wrong');
      if (currentSpeedrunQ) {
        setSpeedrunWrongList(list => {
          if (list.some(k => k.id === currentSpeedrunQ.correctKanji.id)) return list;
          return [...list, currentSpeedrunQ.correctKanji];
        });
      }
      setTimeout(() => {
        endSpeedrun();
      }, 550);
    }
  };

  // End Speedrun & update High Score
  const endSpeedrun = () => {
    setSpeedrunActive(false);
    setSpeedrunGameOver(true);
    setSpeedrunSelectedIdx(null);
    setSpeedrunIsAnswerCorrect(null);

    const finalScore = speedrunScoreRef.current;
    if (finalScore > speedrunHighScore) {
      setSpeedrunHighScore(finalScore);
      try {
        localStorage.setItem('kanji_speedrun_high_combined', finalScore.toString());
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in font-sans pb-12">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & FILTER TOOLBAR                                 */}
      {/* ============================================================== */}
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl">🉐</span>
              <h2 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                Luyện Tập Chữ Hán (Kanji)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Phản xạ đa chiều & Nhận diện mặt chữ thực chiến qua 2 mini-game kịch tính
            </p>
          </div>

          {/* Game Switcher (Segmented Control) */}
          <div className="flex p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl self-start md:self-auto shrink-0 shadow-inner">
            <button
              type="button"
              onClick={() => {
                if (speedrunActive) setSpeedrunActive(false);
                setActiveGame('recognition');
              }}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeGame === 'recognition'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🎯</span>
              <span>Nhận diện mặt chữ</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveGame('speedrun');
              }}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeGame === 'speedrun'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>⚡</span>
              <span>Luyện phản xạ</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Scope Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Phạm vi:</span>
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-[260px] sm:max-w-none truncate"
              >
                <option value="level">
                  Trình độ {currentLevel} ({currentLevel === 'N5' ? 'Bài 1 - 25' : 'Bài 26 - 50'}) • {scopedMasteredPercent}% đã thuộc
                </option>
                <option value="all_50">Toàn bộ 50 bài học (N5 & N4)</option>
                <optgroup label="Từng bài học cụ thể:">
                  {Array.from({ length: 50 }, (_, i) => i + 1).map((lNum) => {
                    const st = perLessonKanjiStats[lNum];
                    const badge = !st || st.total === 0 ? '' : st.percent === 100 ? '🟢' : st.mastered > 0 || st.learning > 0 ? '🟡' : '⚪';
                    const text = st && st.total > 0 ? ` (${st.mastered}/${st.total} chữ • ${st.percent}% ${badge})` : ' (0 chữ)';
                    return (
                      <option key={lNum} value={lNum.toString()}>
                        Bài {lNum} {lNum <= 25 ? '[N5]' : '[N4]'}{text}
                      </option>
                    );
                  })}
                </optgroup>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tất cả ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('not_learned')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'not_learned'
                    ? 'bg-slate-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Chưa học ({notLearnedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('learning')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'learning'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Đang học ({learningCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('mastered')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'mastered'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Đã thuộc ({masteredCount})
              </button>
            </div>
          </div>

          {/* Active Kanji Pool Count Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-xs font-bold text-blue-600 dark:text-blue-400">
            <span>📚 Khả dụng:</span>
            <span className="font-black text-slate-800 dark:text-slate-200">{eligibleKanji.length} chữ</span>
          </div>
        </div>

        {/* Progress Bar & Matrix Toggle Row */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-slate-700 dark:text-slate-200">
                📈 Tiến độ Kanji ({scopeFilter === 'all_50' ? '50 bài' : scopeFilter === 'level' ? `Trình độ ${currentLevel}` : `Bài ${scopeFilter}`}):
              </span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">
                Đã thuộc {masteredCount}/{totalCount} chữ ({scopedMasteredPercent}%)
              </span>
              {learningCount > 0 && (
                <span className="text-amber-500 font-bold">
                  • Đang học: {learningCount} chữ
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowLessonMatrix(!showLessonMatrix)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto border ${
                showLessonMatrix
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>📊</span>
              <span>{showLessonMatrix ? 'Thu gọn bảng tiến độ' : 'Xem tiến độ từng bài'}</span>
              <span className="text-[10px]">{showLessonMatrix ? '▲' : '▼'}</span>
            </button>
          </div>

          {/* Multi-segmented Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex shadow-inner">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${scopedMasteredPercent}%` }}
              title={`Đã thuộc: ${masteredCount} chữ (${scopedMasteredPercent}%)`}
            />
            <div
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${scopedLearningPercent}%` }}
              title={`Đang học: ${learningCount} chữ (${scopedLearningPercent}%)`}
            />
          </div>

          {/* Interactive Per-Lesson Matrix (Collapsible Grid) */}
          {showLessonMatrix && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span>💡</span>
                  <span>Bấm vào bài bất kỳ để chọn nhanh phạm vi học:</span>
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black">
                    <span>🟢</span> 100%
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-black">
                    <span>🟡</span> Đang học
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 font-black">
                    <span>⚪</span> Chưa học
                  </span>
                </div>
              </div>

              {/* Lesson Grid: 25 lessons of current level or 50 lessons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 max-h-72 overflow-y-auto pr-1">
                {Array.from(
                  { length: scopeFilter === 'all_50' ? 50 : 25 },
                  (_, i) => (scopeFilter === 'all_50' ? i + 1 : (currentLevel === 'N5' ? 1 : 26) + i)
                ).map((lNum) => {
                  const st = perLessonKanjiStats[lNum] || { total: 0, mastered: 0, learning: 0, percent: 0 };
                  const isCurrentScope = scopeFilter === lNum.toString();
                  const isDone = st.total > 0 && st.percent === 100;
                  const isLearning = st.total > 0 && (st.mastered > 0 || st.learning > 0) && st.percent < 100;

                  let borderCls = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300';
                  let badgeCls = 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';

                  if (isDone) {
                    borderCls = 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300';
                    badgeCls = 'bg-emerald-500 text-white';
                  } else if (isLearning) {
                    borderCls = 'border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300';
                    badgeCls = 'bg-amber-500 text-white';
                  }

                  if (isCurrentScope) {
                    borderCls += ' ring-2 ring-blue-500 shadow-md font-extrabold';
                  }

                  return (
                    <button
                      key={lNum}
                      type="button"
                      onClick={() => setScopeFilter(lNum.toString())}
                      className={`p-2 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between gap-1.5 ${borderCls}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black">Bài {lNum}</span>
                        <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${badgeCls}`}>
                          {st.total > 0 ? `${st.percent}%` : '0 chữ'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] opacity-80">
                        <span>{st.mastered}/{st.total} chữ</span>
                        <span>{isDone ? '🟢' : isLearning ? '🟡' : '⚪'}</span>
                      </div>
                      {/* Mini lesson progress bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-700/60 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${st.percent}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {scopeFilter !== 'level' && scopeFilter !== 'all_50' && (
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setScopeFilter('level')}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    ↺ Đặt lại: Học toàn bộ trình độ {currentLevel}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. GAME 1 CONTENT: NHẬN DIỆN MẶT CHỮ (AI RECOGNITION QUIZ)     */}
      {/* ============================================================== */}
      {activeGame === 'recognition' && (
        <div className="space-y-4">
          {isLoadingQuiz ? (
            <div className="py-24 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  AI Gemini đang phân tích và sinh câu hỏi nhận diện mặt chữ...
                </p>
                <p className="text-xs text-slate-400">
                  Đang thiết lập tình huống câu đố thực tế và từ vựng liên quan
                </p>
              </div>
            </div>
          ) : eligibleKanji.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-4xl block">📭</span>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                Không tìm thấy chữ Hán nào thỏa mãn bộ lọc hiện tại.
              </p>
              <p className="text-xs text-slate-400">
                Hãy chuyển bộ lọc trạng thái sang "Tất cả" hoặc mở rộng phạm vi bài học.
              </p>
            </div>
          ) : isQuizFinished ? (
            /* Quiz Completion Screen */
            <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 max-w-xl mx-auto animate-fade-in">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center text-4xl">
                🏆
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  HOÀN THÀNH LƯỢT LUYỆN TẬP!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bạn đã hoàn thành toàn bộ {quizQuestions.length} câu đố nhận diện chữ Hán
                </p>
              </div>

              {/* Score breakdown */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">ĐÚNG</span>
                  <span className="text-3xl font-black text-emerald-500">{quizScore} / {quizQuestions.length}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">TỶ LỆ CHÍNH XÁC</span>
                  <span className="text-3xl font-black text-blue-500">
                    {quizQuestions.length > 0 ? Math.round((quizScore / quizQuestions.length) * 100) : 0}%
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {quizWrongList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRetryWrongQuestions}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🔄 Luyện lại {quizWrongList.length} câu làm sai</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={loadFreshQuiz}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>🔀 Đổi lượt câu mới (AI)</span>
                </button>
              </div>
            </div>
          ) : currentQuizQ ? (
            /* Active Question Card */
            <div className="space-y-4">
              {/* Question Navigation Bar */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black text-xs border border-blue-200 dark:border-blue-900">
                    Câu {quizIndex + 1} / {quizQuestions.length}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Đúng: <b className="text-emerald-500">{quizScore}</b>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShuffleQuiz}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                    title="Xáo trộn câu hỏi"
                  >
                    🔀 Xáo trộn
                  </button>
                  <button
                    type="button"
                    onClick={loadFreshQuiz}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-900 transition-all cursor-pointer"
                    title="Yêu cầu AI sinh bộ câu hỏi mới hoàn toàn"
                  >
                    ✨ Đổi câu mới (AI)
                  </button>
                </div>
              </div>

              {/* Main Quiz Question Prompt Card */}
              <div className="p-6 sm:p-8 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4 text-center">
                <div className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {currentQuizQ.question_type === 'reading_in_context'
                    ? '🎯 Nhận diện cách đọc Kana chuẩn'
                    : currentQuizQ.question_type === 'kanji_orthography'
                    ? '🉐 Tìm chữ Hán viết chuẩn xác'
                    : currentQuizQ.question_type === 'word_formation'
                    ? '🧩 Điền chữ Hán vào từ ghép khuyết'
                    : currentQuizQ.question_type === 'dialogue_fill'
                    ? '💬 Điền khuyết hội thoại'
                    : '📖 Nhận diện ý nghĩa & ngữ cảnh'}
                </div>

                <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-relaxed font-['Noto_Sans_JP']">
                  {currentQuizQ.context_sentence || currentQuizQ.question_text}
                </div>

                {currentQuizQ.question_translation && (
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    💡 {currentQuizQ.question_translation}
                  </p>
                )}
              </div>

              {/* 4 Interactive Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuizQ.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isCorrect = idx === currentQuizQ.correct_index;
                  const isChosen = idx === selectedOptionIdx;

                  let btnStyle = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-500/5';
                  let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';

                  if (isQuizSubmitted) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/50';
                      badgeStyle = 'bg-white/20 text-white';
                    } else if (isChosen && !isCorrect) {
                      btnStyle = 'bg-rose-500 text-white border-rose-600 shadow-md';
                      badgeStyle = 'bg-white/20 text-white';
                    } else {
                      btnStyle = 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isQuizSubmitted}
                      onClick={() => handleSelectQuizOption(idx)}
                      className={`p-4 rounded-2xl border-2 font-bold text-left transition-all duration-150 cursor-pointer shadow-sm flex items-center justify-between gap-3 active:scale-[0.98] ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${badgeStyle}`}>
                          {letter}
                        </span>
                        <span className={`font-['Noto_Sans_JP'] font-bold truncate ${opt.length <= 2 ? 'text-2xl sm:text-3xl font-black' : 'text-base sm:text-lg'}`}>
                          {opt}
                        </span>
                      </div>

                      {isQuizSubmitted && isCorrect && (
                        <span className="text-white text-base font-black shrink-0">✓</span>
                      )}
                      {isQuizSubmitted && isChosen && !isCorrect && (
                        <span className="text-white text-base font-black shrink-0">✗</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Post-Answer Detailed Feedback Card */}
              {isQuizSubmitted && (
                <div className="p-4 sm:p-6 rounded-3xl border bg-white dark:bg-slate-900 shadow-lg space-y-4 animate-in fade-in duration-150 border-blue-500/30">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm sm:text-base font-black flex items-center gap-1.5 ${
                        selectedOptionIdx === currentQuizQ.correct_index ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {selectedOptionIdx === currentQuizQ.correct_index ? '✅ Chính xác! (正解)' : '❌ Chưa đúng (不正解)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const audioWord = currentQuizQ.target_word || currentQuizQ.target_kanji;
                          handlePlayAudio(audioWord, currentQuizQ.target_word_reading || audioWord);
                        }}
                        className="py-1 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>🔊 Phát âm</span>
                      </button>
                    </div>
                  </div>

                  {/* Target Word Breakdown */}
                  <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-bold">Mục tiêu:</span>
                      <span className="font-['Noto_Sans_JP'] font-black text-blue-500 text-base">
                        {currentQuizQ.target_word || currentQuizQ.target_kanji}
                      </span>
                      {currentQuizQ.target_word_reading && (
                        <span className="text-slate-500 font-medium">({currentQuizQ.target_word_reading})</span>
                      )}
                    </div>
                    {currentQuizQ.target_word_meaning && (
                      <span className="text-slate-600 dark:text-slate-300 font-bold">
                        • {currentQuizQ.target_word_meaning}
                      </span>
                    )}
                    <span className="text-slate-400 text-xs ml-auto">
                      Hán tự: <b className="font-['Noto_Sans_JP'] text-slate-800 dark:text-slate-100 text-base font-black">{currentQuizQ.target_kanji}</b>
                    </span>
                  </div>

                  {/* Options Comparison (4 Choices Table) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
                      <span>📋</span>
                      <span>Đối chiếu 4 phương án lựa chọn:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {currentQuizQ.options.map((opt, i) => {
                        const isAns = i === currentQuizQ.correct_index;
                        const isUserChoice = i === selectedOptionIdx;
                        const letter = String.fromCharCode(65 + i);
                        const meaning = (currentQuizQ.options_meanings && currentQuizQ.options_meanings[i]) || '';
                        return (
                          <div
                            key={i}
                            className={`p-2.5 rounded-xl text-xs flex items-center justify-between border transition-all ${
                              isAns
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                                : isUserChoice
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                                  isAns
                                    ? 'bg-emerald-500 text-white'
                                    : isUserChoice
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}
                              >
                                {letter}
                              </span>
                              <span className="font-['Noto_Sans_JP'] font-bold truncate text-sm">
                                {opt}
                              </span>
                              {meaning && (
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                                  ({meaning})
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-semibold shrink-0 ml-1">
                              {isAns ? '✓ Đúng' : isUserChoice ? '✗ Đã chọn' : 'Nhiễu'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detailed Explanation */}
                  {currentQuizQ.explanation && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {currentQuizQ.explanation}
                    </div>
                  )}

                  {/* Quick Status Updater */}
                  {(() => {
                    const matchedKanji = kanjiList.find(k => k.character === currentQuizQ.target_kanji);
                    if (!matchedKanji) return null;
                    return (
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-500">
                          Trạng thái chữ Hán 【{matchedKanji.character}】:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickStatusChange(matchedKanji, 'not_learned')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              (matchedKanji.status || 'not_learned') === 'not_learned'
                                ? 'bg-slate-700 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            Chưa học
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickStatusChange(matchedKanji, 'learning')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              matchedKanji.status === 'learning'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            Đang học
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickStatusChange(matchedKanji, 'mastered')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              matchedKanji.status === 'mastered'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            Đã thuộc ⭐
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Navigation Footer */}
                  <div className="pt-2 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handlePrevQuizQuestion}
                      disabled={quizIndex === 0}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      ⬅ Câu trước
                    </button>
                    <button
                      type="button"
                      onClick={handleNextQuizQuestion}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
                    >
                      {quizIndex + 1 < quizQuestions.length ? 'Câu tiếp theo ➔' : 'Xem kết quả tổng kết ➔'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. GAME 2 CONTENT: SPEEDRUN LUYỆN PHẢN XẠ KANJI               */}
      {/* ============================================================== */}
      {activeGame === 'speedrun' && (
        <div className="space-y-6">
          {/* Speedrun Lobby / Start Screen */}
          {!speedrunActive && !speedrunGameOver && (
            <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 max-w-xl mx-auto">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center text-4xl shadow-lg shadow-rose-500/30 animate-pulse">
                ⚡
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  SPEEDRUN LUYỆN PHẢN XẠ KANJI
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Phản xạ nhịp độ cao: Chuỗi combo càng dài thời gian càng rút ngắn!
                </p>
              </div>

              {/* Reflection Direction Options */}
              <div className="space-y-2 text-left bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Chiều câu hỏi phản xạ:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSpeedrunDirection('both')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      speedrunDirection === 'both'
                        ? 'bg-blue-600 text-white shadow-sm font-black'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    🔄 Toàn diện (Hỗn hợp)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeedrunDirection('kanji-to-meaning')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      speedrunDirection === 'kanji-to-meaning'
                        ? 'bg-blue-600 text-white shadow-sm font-black'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    🇯🇵 ➔ 🇻🇳 Kanji ➔ Nghĩa
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeedrunDirection('meaning-to-kanji')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      speedrunDirection === 'meaning-to-kanji'
                        ? 'bg-blue-600 text-white shadow-sm font-black'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    🇻🇳 ➔ 🇯🇵 Nghĩa ➔ Kanji
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeedrunDirection('kanji-vocab')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      speedrunDirection === 'kanji-vocab'
                        ? 'bg-blue-600 text-white shadow-sm font-black'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    📖 Kanji trong từ vựng
                  </button>
                </div>
              </div>

              {/* High Score Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-black">
                <span>🏆 Kỷ lục cao nhất:</span>
                <span className="text-base">{speedrunHighScore} điểm</span>
              </div>

              <div>
                <button
                  type="button"
                  disabled={eligibleKanji.length === 0}
                  onClick={startSpeedrun}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white font-black text-sm shadow-lg shadow-rose-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>🚀 BẮT ĐẦU SPEEDRUN ({eligibleKanji.length} CHỮ)</span>
                </button>
              </div>
            </div>
          )}

          {/* Speedrun Active Playing Interface */}
          {speedrunActive && currentSpeedrunQ && (
            <div className="max-w-xl mx-auto space-y-4 animate-fade-in">
              {/* Dynamic Countdown Bar */}
              <div className="bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className={`h-full transition-all duration-75 rounded-full ${
                    speedrunTimeLeft > speedrunMaxTime * 0.5
                      ? 'bg-emerald-500'
                      : speedrunTimeLeft > speedrunMaxTime * 0.25
                      ? 'bg-amber-500'
                      : 'bg-rose-500 animate-pulse'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, (speedrunTimeLeft / speedrunMaxTime) * 100))}%` }}
                />
              </div>

              {/* Status Header */}
              <div className="flex items-center justify-between px-2 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-slate-400 font-extrabold uppercase tracking-wider">
                  <span>⏱️</span>
                  <span>{speedrunTimeLeft}s</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black">
                    🔥 Streak: {speedrunStreak}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-black">
                    ⭐ Điểm: {speedrunScore}
                  </span>
                </div>
              </div>

              {/* Question Card */}
              <div className="p-6 sm:p-8 text-center bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg space-y-3">
                <div className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">
                  {currentSpeedrunQ.promptText || '👉 Chọn đáp án đúng:'}
                </div>

                <div className={`font-black font-['Noto_Sans_JP'] text-slate-900 dark:text-white ${
                  currentSpeedrunQ.subject.length <= 2
                    ? 'text-6xl sm:text-7xl py-2'
                    : currentSpeedrunQ.subject.length <= 4
                    ? 'text-3xl sm:text-4xl py-2'
                    : 'text-base sm:text-lg md:text-xl py-2 leading-relaxed'
                }`}>
                  {currentSpeedrunQ.subject}
                </div>

                {currentSpeedrunQ.subText && (
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 inline-block">
                    {currentSpeedrunQ.subText}
                  </div>
                )}
              </div>

              {/* 4 Speedrun Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentSpeedrunQ.options.map((opt, idx) => {
                  const isSingleKanji = opt.text.length <= 2 && /[\u4e00-\u9faf]/.test(opt.text);
                  const isSelected = speedrunSelectedIdx === idx;

                  let btnStyle = 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-400 text-slate-800 dark:text-slate-100 hover:bg-amber-500/5';
                  if (isSelected) {
                    if (speedrunIsAnswerCorrect) {
                      btnStyle = 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-400 shadow-lg';
                    } else {
                      btnStyle = 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-400 shadow-lg';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={speedrunSelectedIdx !== null}
                      onClick={() => handleSpeedrunAnswer(opt, idx)}
                      className={`p-4 rounded-2xl border-2 font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 active:scale-95 ${
                        isSingleKanji
                          ? 'text-3xl sm:text-4xl font-black font-[\'Noto_Sans_JP\'] py-5'
                          : 'text-xs sm:text-sm py-4 px-4 text-center'
                      } ${btnStyle}`}
                    >
                      <span>{opt.text}</span>
                      {isSelected && speedrunIsAnswerCorrect && (
                        <span className="text-white text-base font-black shrink-0">✓</span>
                      )}
                      {isSelected && speedrunIsAnswerCorrect === false && (
                        <span className="text-white text-base font-black shrink-0">✗</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Speedrun Game Over Screen */}
          {speedrunGameOver && (
            <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg mx-auto space-y-6 animate-fade-in">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center text-4xl">
                💥
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  LƯỢT CHƠI KẾT THÚC!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {speedrunTimeLeft <= 0.05 ? 'Hết thời gian phản xạ!' : 'Bạn đã chọn sai đáp án!'}
                </p>
              </div>

              {/* Final Scoreboard */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">ĐIỂM ĐẠT ĐƯỢC</span>
                  <span className="text-3xl font-black text-amber-500">{speedrunScore}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">CHUỖI ĐÚNG (MAX)</span>
                  <span className="text-3xl font-black text-rose-500">{speedrunMaxStreak}</span>
                </div>
              </div>

              {/* Review Missed Kanji List */}
              {speedrunWrongList.length > 0 && (
                <div className="text-left space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-400 block">
                    Chữ Hán cần chú ý ôn lại ({speedrunWrongList.length} chữ):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {speedrunWrongList.map(k => (
                      <div
                        key={k.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black font-['Noto_Sans_JP'] text-slate-900 dark:text-white">
                            {k.character}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block">
                              {k.sino_vietnamese || 'HÁN TỰ'}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate max-w-[120px]">
                              {k.vietnamese_meaning}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handlePlayAudio(k.character)}
                          className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-500 flex items-center justify-center text-xs"
                          title="Nghe phát âm"
                        >
                          🔊
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Play Again Button */}
              <button
                type="button"
                onClick={startSpeedrun}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white font-black text-sm shadow-lg shadow-rose-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🔄 CHƠI LẠI NGAY</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
