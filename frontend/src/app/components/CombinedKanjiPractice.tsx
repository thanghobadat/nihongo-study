'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  KanjiItemData,
  COMMON_KANJI_DISTRACTORS,
  shuffleArray
} from '../utils/kanjiPracticeHelper';
import { playAudioWithFallback, playSpeedrunSound } from '../utils/audioHelper';
import {
  generatePracticeQuestions,
  PracticeCategory,
  PracticeExerciseQuestion
} from '../utils/kanjiOverhaulHelper';

interface CombinedKanjiPracticeProps {
  kanjiList: KanjiItemData[];
  vocabList?: any[];
  grammarList?: any[];
  currentLevel?: 'N5' | 'N4';
  onUpdateKanjiStatus?: (id: number, type: 'vocabulary' | 'kanji' | 'grammar', status: 'not_learned' | 'learning' | 'mastered') => void;
}

export default function CombinedKanjiPractice({
  kanjiList,
  vocabList = [],
  grammarList = [],
  currentLevel = 'N5',
  onUpdateKanjiStatus
}: CombinedKanjiPracticeProps) {
  // Main Tab: 'memorize' (Nhớ mặt chữ) | 'practice' (Luyện tập)
  const [activeTab, setActiveTab] = useState<'memorize' | 'practice'>('memorize');

  // Scope filter: 'level' (current N5/N4) | 'all_50' (all 50 lessons) | specific lesson number '1'..'50'
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

  // Eligible Kanji after applying status filter (Nguồn đề từ TẤT CẢ các bài thỏa mãn)
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

  // Target lesson ID passed to generator
  const targetLessonId = useMemo(() => {
    if (scopeFilter !== 'level' && scopeFilter !== 'all_50') {
      const n = parseInt(scopeFilter, 10);
      if (!isNaN(n)) return n;
    }
    return currentLevel === 'N5' ? 25 : 50;
  }, [scopeFilter, currentLevel]);

  // =========================================================================
  // 1. PHÂN HỆ 1: 🧠 NHỚ MẶT CHỮ (SPEEDRUN PHẢN XẠ NHANH ĐA BÀI HỌC)
  // =========================================================================
  const [memorizeActive, setMemorizeActive] = useState<boolean>(false);
  const [memorizeGameOver, setMemorizeGameOver] = useState<boolean>(false);
  const [memorizeScore, setMemorizeScore] = useState<number>(0);
  const [memorizeHighScore, setMemorizeHighScore] = useState<number>(0);
  const [memorizeStreak, setMemorizeStreak] = useState<number>(0);
  const [memorizeMaxStreak, setMemorizeMaxStreak] = useState<number>(0);
  const [memorizeTimeLeft, setMemorizeTimeLeft] = useState<number>(10);
  const [memorizeMaxTime, setMemorizeMaxTime] = useState<number>(10);
  const [memorizeDirection, setMemorizeDirection] = useState<'jp-to-vn' | 'vn-to-jp' | 'both'>('both');
  const [memorizeWrongList, setMemorizeWrongList] = useState<KanjiItemData[]>([]);

  interface MemorizeQ {
    subject: string;
    subText?: string;
    promptText: string;
    correctKanji: KanjiItemData;
    correctAnswerText: string;
    options: { text: string; isCorrect: boolean }[];
    direction: 'jp-to-vn' | 'vn-to-jp';
  }

  const [currentMemorizeQ, setCurrentMemorizeQ] = useState<MemorizeQ | null>(null);
  const [memorizeSelectedIdx, setMemorizeSelectedIdx] = useState<number | null>(null);
  const [isEvaluatingChoice, setIsEvaluatingChoice] = useState<boolean>(false);

  const timerRef = useRef<any>(null);
  const scoreRef = useRef<number>(0);
  const maxTimeRef = useRef<number>(10);

  // Nạp high score
  useEffect(() => {
    try {
      const savedHigh = localStorage.getItem(`kanji_memorize_high_combined_${scopeFilter}_${statusFilter}`);
      if (savedHigh) {
        setMemorizeHighScore(parseInt(savedHigh, 10) || 0);
      } else {
        setMemorizeHighScore(0);
      }
    } catch (e) {
      // ignore
    }
  }, [scopeFilter, statusFilter]);

  // Dynamic time: xuất phát 10s, giảm 10% mỗi 3 streak, tối thiểu 2s
  const getDynamicTimeForStreak = (streak: number): number => {
    const reductionCount = Math.floor(streak / 3);
    return Math.max(2, Math.round(10 * Math.pow(0.9, reductionCount) * 10) / 10);
  };

  // Sinh câu hỏi Nhớ mặt chữ đa bài học
  const generateNextMemorizeQuestion = useCallback((): MemorizeQ | null => {
    if (eligibleKanji.length === 0) return null;

    const target = eligibleKanji[Math.floor(Math.random() * eligibleKanji.length)];

    let dir: 'jp-to-vn' | 'vn-to-jp' = 'jp-to-vn';
    if (memorizeDirection === 'jp-to-vn') dir = 'jp-to-vn';
    else if (memorizeDirection === 'vn-to-jp') dir = 'vn-to-jp';
    else dir = Math.random() > 0.5 ? 'jp-to-vn' : 'vn-to-jp';

    const pool = eligibleKanji.filter(k => k.id !== target.id);
    const combinedPool = pool.length >= 3 ? pool : [...pool, ...COMMON_KANJI_DISTRACTORS.filter(d => d.character !== target.character)];
    const shuffledPool = shuffleArray(combinedPool);
    const distractors = shuffledPool.slice(0, 3);

    // Chiều 1: 🈸 ➔ 🇻🇳 (Chữ Hán -> Chọn Nghĩa & Âm Hán)
    if (dir === 'jp-to-vn') {
      const targetAns = `${target.sino_vietnamese ? target.sino_vietnamese + ' • ' : ''}${target.vietnamese_meaning}`.trim();
      const options = shuffleArray([
        { text: targetAns, isCorrect: true },
        ...distractors.map(d => ({
          text: `${d.sino_vietnamese ? d.sino_vietnamese + ' • ' : ''}${d.vietnamese_meaning}`.trim(),
          isCorrect: false
        }))
      ]);

      return {
        subject: target.character,
        promptText: '👉 Chọn âm Hán Việt và nghĩa của chữ Hán:',
        correctKanji: target,
        correctAnswerText: targetAns,
        options,
        direction: 'jp-to-vn'
      };
    }

    // Chiều 2: 🇻🇳 ➔ 🈸 (Nghĩa -> Chọn Chữ Hán)
    const targetAns = target.character;
    const options = shuffleArray([
      { text: targetAns, isCorrect: true },
      ...distractors.map(d => ({
        text: d.character,
        isCorrect: false
      }))
    ]);

    const subjectText = `${target.vietnamese_meaning}${target.sino_vietnamese ? ' (' + target.sino_vietnamese + ')' : ''}`;

    return {
      subject: subjectText,
      promptText: '👉 Chọn chữ Hán tương ứng với nghĩa trên:',
      correctKanji: target,
      correctAnswerText: targetAns,
      options,
      direction: 'vn-to-jp'
    };
  }, [eligibleKanji, memorizeDirection]);

  // Bắt đầu game Speedrun Nhớ mặt chữ
  const startMemorizeGame = () => {
    if (eligibleKanji.length === 0) return;
    setMemorizeActive(true);
    setMemorizeGameOver(false);
    setMemorizeScore(0);
    scoreRef.current = 0;
    setMemorizeStreak(0);
    setMemorizeMaxStreak(0);
    setMemorizeWrongList([]);
    setMemorizeSelectedIdx(null);
    setIsEvaluatingChoice(false);

    const initialTime = 10;
    setMemorizeMaxTime(initialTime);
    maxTimeRef.current = initialTime;
    setMemorizeTimeLeft(initialTime);

    const q = generateNextMemorizeQuestion();
    setCurrentMemorizeQ(q);
  };

  // Timer đồng hồ đếm ngược
  useEffect(() => {
    if (!memorizeActive || memorizeGameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setMemorizeTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timerRef.current);
          handleMemorizeTimeout();
          return 0;
        }
        return Math.round((prev - 0.1) * 10) / 10;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [memorizeActive, memorizeGameOver, currentMemorizeQ]);

  // Xử lý khi hết giờ
  const handleMemorizeTimeout = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    playSpeedrunSound('wrong');
    setMemorizeGameOver(true);
    setMemorizeActive(false);

    if (currentMemorizeQ) {
      setMemorizeWrongList(list => [...list, currentMemorizeQ.correctKanji]);
    }

    const currentScore = scoreRef.current;
    if (currentScore > memorizeHighScore) {
      setMemorizeHighScore(currentScore);
      try {
        localStorage.setItem(`kanji_memorize_high_combined_${scopeFilter}_${statusFilter}`, currentScore.toString());
      } catch (e) {
        // ignore
      }
    }
  };

  // Xử lý khi người dùng chọn đáp án Nhớ mặt chữ
  const handleSelectMemorizeAnswer = (idx: number) => {
    if (isEvaluatingChoice || !currentMemorizeQ || memorizeGameOver) return;
    setIsEvaluatingChoice(true);
    setMemorizeSelectedIdx(idx);

    const chosenOpt = currentMemorizeQ.options[idx];
    const isCorrect = chosenOpt.isCorrect;

    if (isCorrect) {
      playSpeedrunSound('correct');
      handlePlayAudio(currentMemorizeQ.correctKanji.character, currentMemorizeQ.correctKanji.onyomi || currentMemorizeQ.correctKanji.kunyomi);

      const newScore = memorizeScore + 1;
      setMemorizeScore(newScore);
      scoreRef.current = newScore;

      const newStreak = memorizeStreak + 1;
      setMemorizeStreak(newStreak);
      if (newStreak > memorizeMaxStreak) {
        setMemorizeMaxStreak(newStreak);
      }

      if (newScore > memorizeHighScore) {
        setMemorizeHighScore(newScore);
        try {
          localStorage.setItem(`kanji_memorize_high_combined_${scopeFilter}_${statusFilter}`, newScore.toString());
        } catch (e) {
          // ignore
        }
      }

      setTimeout(() => {
        const nextTime = getDynamicTimeForStreak(newStreak);
        setMemorizeMaxTime(nextTime);
        maxTimeRef.current = nextTime;
        setMemorizeTimeLeft(nextTime);

        setMemorizeSelectedIdx(null);
        setIsEvaluatingChoice(false);
        const nextQ = generateNextMemorizeQuestion();
        setCurrentMemorizeQ(nextQ);
      }, 400);
    } else {
      playSpeedrunSound('wrong');
      if (timerRef.current) clearInterval(timerRef.current);
      setMemorizeWrongList(list => [...list, currentMemorizeQ.correctKanji]);

      setTimeout(() => {
        setMemorizeGameOver(true);
        setMemorizeActive(false);
        setIsEvaluatingChoice(false);
      }, 600);
    }
  };

  // =========================================================================
  // 2. PHÂN HỆ 2: 🎯 LUYỆN TẬP (3 DẠNG BÀI TẬP THỰC CHIẾN ĐA BÀI HỌC)
  // =========================================================================
  const [selectedCategories, setSelectedCategories] = useState<PracticeCategory[]>([
    'type1_vocab',
    'type2_partial',
    'type3_sentence'
  ]);

  const [practiceQuestions, setPracticeQuestions] = useState<PracticeExerciseQuestion[]>([]);
  const [practiceIndex, setPracticeIndex] = useState<number>(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isQuestionSubmitted, setIsQuestionSubmitted] = useState<boolean>(false);
  const [practiceScore, setPracticeScore] = useState<number>(0);
  const [userPracticeAnswers, setUserPracticeAnswers] = useState<Record<number, { chosenIdx: number; isCorrect: boolean }>>({});
  const [isPracticeFinished, setIsPracticeFinished] = useState<boolean>(false);
  const [practiceWrongList, setPracticeWrongList] = useState<PracticeExerciseQuestion[]>([]);

  // Tái tạo hoặc sinh mới bộ câu hỏi Luyện tập đa bài học
  const generateNewPracticeSet = useCallback(() => {
    if (eligibleKanji.length === 0) {
      setPracticeQuestions([]);
      return;
    }
    const questions = generatePracticeQuestions({
      eligibleKanji,
      vocabItems: vocabList,
      grammarItems: grammarList,
      allLessonKanji: kanjiList,
      selectedCategories: selectedCategories.length > 0 ? selectedCategories : ['type1_vocab', 'type2_partial', 'type3_sentence'],
      currentLessonId: targetLessonId,
      limit: 15
    });
    setPracticeQuestions(questions);
    setPracticeIndex(0);
    setSelectedOptionIdx(null);
    setIsQuestionSubmitted(false);
    setPracticeScore(0);
    setUserPracticeAnswers({});
    setIsPracticeFinished(false);
    setPracticeWrongList([]);
  }, [eligibleKanji, vocabList, grammarList, kanjiList, selectedCategories, targetLessonId]);

  // Tự động sinh câu hỏi khi đổi tab sang practice hoặc đổi bộ lọc
  useEffect(() => {
    if (activeTab === 'practice') {
      generateNewPracticeSet();
    }
  }, [activeTab, scopeFilter, statusFilter, eligibleKanji.length]);

  // Bật/tắt 1 danh mục dạng bài tập
  const toggleCategory = (cat: PracticeCategory) => {
    setSelectedCategories(prev => {
      let next: PracticeCategory[];
      if (prev.includes(cat)) {
        if (prev.length === 1) return prev;
        next = prev.filter(c => c !== cat);
      } else {
        next = [...prev, cat];
      }
      return next;
    });
  };

  const selectAllCategories = () => {
    setSelectedCategories(['type1_vocab', 'type2_partial', 'type3_sentence']);
  };

  const currentQ = practiceQuestions[practiceIndex] || null;

  // Người dùng chọn phương án A, B, C, D
  const handleSelectPracticeOption = (idx: number) => {
    if (isQuestionSubmitted || !currentQ) return;
    setSelectedOptionIdx(idx);
    setIsQuestionSubmitted(true);

    const isCorrect = idx === currentQ.correctIndex;
    setUserPracticeAnswers(prev => ({
      ...prev,
      [practiceIndex]: { chosenIdx: idx, isCorrect }
    }));

    if (isCorrect) {
      setPracticeScore(s => s + 1);
      handlePlayAudio(currentQ.targetWord, currentQ.targetWordReading || currentQ.targetWord);
    } else {
      setPracticeWrongList(list => {
        if (list.some(q => q.id === currentQ.id)) return list;
        return [...list, currentQ];
      });
    }
  };

  const handleNextQuestion = () => {
    if (practiceIndex + 1 < practiceQuestions.length) {
      const nextIdx = practiceIndex + 1;
      setPracticeIndex(nextIdx);
      const existing = userPracticeAnswers[nextIdx];
      if (existing) {
        setSelectedOptionIdx(existing.chosenIdx);
        setIsQuestionSubmitted(true);
      } else {
        setSelectedOptionIdx(null);
        setIsQuestionSubmitted(false);
      }
    } else {
      setIsPracticeFinished(true);
    }
  };

  const handlePrevQuestion = () => {
    if (practiceIndex > 0) {
      const prevIdx = practiceIndex - 1;
      setPracticeIndex(prevIdx);
      const existing = userPracticeAnswers[prevIdx];
      if (existing) {
        setSelectedOptionIdx(existing.chosenIdx);
        setIsQuestionSubmitted(true);
      } else {
        setSelectedOptionIdx(null);
        setIsQuestionSubmitted(false);
      }
    }
  };

  const handleShufflePractice = () => {
    if (practiceQuestions.length <= 1) return;
    setPracticeQuestions(shuffleArray([...practiceQuestions]));
    setPracticeIndex(0);
    setSelectedOptionIdx(null);
    setIsQuestionSubmitted(false);
    setPracticeScore(0);
    setUserPracticeAnswers({});
    setIsPracticeFinished(false);
  };

  const handleRetryPracticeWrongs = () => {
    if (practiceWrongList.length === 0) return;
    setPracticeQuestions(shuffleArray([...practiceWrongList]));
    setPracticeIndex(0);
    setSelectedOptionIdx(null);
    setIsQuestionSubmitted(false);
    setPracticeScore(0);
    setUserPracticeAnswers({});
    setIsPracticeFinished(false);
    setPracticeWrongList([]);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in pb-12">
      {/* ========================================================================= */}
      {/* TOP HEADER CONTROLS (PHẠM VI & TRẠNG THÁI & SUB-TAB SWITCHER)            */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm space-y-4">
        {/* Banner Title & Progress Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px] border border-indigo-500/20">
                🈸 Luyện Hán Tự Tổng Hợp
              </span>
              <span className="text-xs font-bold text-slate-400">
                • {eligibleKanji.length} chữ làm nguồn đề
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Trung Tâm Luyện Chữ Hán (Kanji Practice Center)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Luyện phản xạ nhanh & giải bài tập thực chiến tổng hợp theo phạm vi và trạng thái đã thuộc.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 block">ĐÃ THUỘC TRONG PHẠM VI</span>
              <span className="text-base sm:text-lg font-black text-emerald-500">
                {masteredCount} / {totalCount} chữ ({scopedMasteredPercent}%)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowLessonMatrix(!showLessonMatrix)}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>📊 Ma trận 50 bài</span>
              <span className="text-[10px]">{showLessonMatrix ? '▲' : '▼'}</span>
            </button>
          </div>
        </div>

        {/* Per-Lesson Matrix Expandable Card */}
        {showLessonMatrix && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-700 dark:text-slate-300">
                Tiến độ chữ Hán đã thuộc từng bài (Bài 1 - 50):
              </span>
              <span className="text-[11px] text-slate-400">
                🟢 100% | 🟡 Đang học | ⚪ Chưa học
              </span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {Array.from({ length: 50 }, (_, i) => i + 1).map(lId => {
                const st = perLessonKanjiStats[lId];
                if (!st || st.total === 0) return null;
                const isSelected = scopeFilter === lId.toString();
                const colorBg = st.percent === 100 ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : st.mastered > 0 ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800';
                return (
                  <button
                    key={lId}
                    type="button"
                    onClick={() => setScopeFilter(isSelected ? 'level' : lId.toString())}
                    className={`p-1.5 rounded-lg border text-center text-[10px] font-bold transition-all cursor-pointer ${colorBg} ${isSelected ? 'ring-2 ring-indigo-500 scale-105' : 'hover:opacity-80'}`}
                    title={`Bài ${lId}: ${st.mastered}/${st.total} chữ (${st.percent}%)`}
                  >
                    <div>B.{lId}</div>
                    <div className="text-[9px] font-black">{st.mastered}/{st.total}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Toolbar: Sub-tab switcher + Scope + Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Sub-tab Navigation (Nhớ mặt chữ ĐỨNG ĐẦU) */}
          <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('memorize');
                setMemorizeActive(false);
                setMemorizeGameOver(false);
              }}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'memorize'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>🧠</span>
              <span>Nhớ mặt chữ</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('practice');
                setMemorizeActive(false);
                setMemorizeGameOver(false);
              }}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'practice'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>🎯</span>
              <span>Luyện tập</span>
            </button>
          </div>

          {/* Filters: Scope & Status */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Scope Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-bold">Phạm vi:</span>
              <select
                value={scopeFilter}
                onChange={e => setScopeFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm max-w-[190px] truncate"
              >
                <option value="level">
                  Trình độ {currentLevel} ({currentLevel === 'N5' ? 'Bài 1 - 25' : 'Bài 26 - 50'})
                </option>
                <option value="all_50">Toàn bộ 50 bài học (N5 & N4)</option>
                <optgroup label="Từng bài cụ thể:">
                  {Array.from({ length: 50 }, (_, i) => i + 1).map(lId => {
                    const st = perLessonKanjiStats[lId];
                    if (!st || st.total === 0) return null;
                    return (
                      <option key={lId} value={lId.toString()}>
                        Bài {lId} ({st.mastered}/{st.total} chữ đã thuộc)
                      </option>
                    );
                  })}
                </optgroup>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-bold">Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
              >
                <option value="all">Tất cả ({scopedKanji.length})</option>
                <option value="not_learned">🔴 Chưa học ({scopedKanji.filter(k => (k.status || 'not_learned') === 'not_learned').length})</option>
                <option value="learning">🟡 Đang học ({scopedKanji.filter(k => k.status === 'learning').length})</option>
                <option value="mastered">🟢 Đã thuộc ({scopedKanji.filter(k => k.status === 'mastered').length})</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PHÂN HỆ 1: 🧠 NHỚ MẶT CHỮ (SPEEDRUN PHẢN XẠ NHANH ĐA BÀI HỌC)          */}
      {/* ========================================================================= */}
      {activeTab === 'memorize' && (
        <div className="space-y-6">
          {!memorizeActive && !memorizeGameOver && (
            <div className="p-6 sm:p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-amber-500/20 text-white animate-bounce">
                🧠
              </div>

              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100">
                  Thử Thách Nhớ Mặt Chữ Kanji Tổng Hợp
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                  Luyện phản xạ nhanh giúp bạn nhận diện mặt chữ Hán và ý nghĩa từ <b>{eligibleKanji.length} chữ Hán</b> trong phạm vi đã chọn.
                  Thời gian giảm dần theo chuỗi đúng (xuất phát từ 10s, mỗi 3 câu đúng giảm 10%).
                </p>
              </div>

              {/* Chuyển đổi 2 chiều phản xạ + Tổng hợp */}
              <div className="space-y-2 text-left bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Chiều câu hỏi phản xạ:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMemorizeDirection('jp-to-vn')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate ${
                      memorizeDirection === 'jp-to-vn'
                        ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    🈸 ➔ 🇻🇳 Chữ Hán
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemorizeDirection('vn-to-jp')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate ${
                      memorizeDirection === 'vn-to-jp'
                        ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    🇻🇳 ➔ 🈸 Nghĩa
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemorizeDirection('both')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate ${
                      memorizeDirection === 'both'
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm font-extrabold'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    🔀 Tổng hợp
                  </button>
                </div>
              </div>

              {/* High Score & Start */}
              <div className="flex items-center justify-between px-2 text-xs">
                <span className="text-slate-400 font-bold">Kỷ lục hiện tại:</span>
                <span className="text-amber-500 font-black text-sm">{memorizeHighScore} điểm</span>
              </div>

              <button
                type="button"
                disabled={eligibleKanji.length === 0}
                onClick={startMemorizeGame}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-black text-sm shadow-xl shadow-rose-500/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {eligibleKanji.length === 0 ? 'Chưa có chữ Hán nào phù hợp bộ lọc' : '⚡ BẮT ĐẦU PHẢN XẠ NHANH'}
              </button>
            </div>
          )}

          {/* Active Gameplay */}
          {memorizeActive && currentMemorizeQ && (
            <div className="max-w-xl mx-auto space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-amber-500">
                    {memorizeScore} <span className="text-xs text-slate-400 font-bold">điểm</span>
                  </span>
                  {memorizeStreak >= 3 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-black animate-pulse">
                      🔥 Streak {memorizeStreak}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400">Thời gian: </span>
                  <span className={`text-sm font-black ${memorizeTimeLeft <= 3 ? 'text-rose-500 animate-ping' : 'text-slate-700 dark:text-slate-200'}`}>
                    {memorizeTimeLeft.toFixed(1)}s
                  </span>
                </div>
              </div>

              {/* Timer Progress Bar */}
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-100 ease-linear rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, (memorizeTimeLeft / memorizeMaxTime) * 100))}%` }}
                />
              </div>

              {/* Question Box */}
              <div className="p-6 sm:p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 block">
                  {currentMemorizeQ.promptText}
                </span>

                <div className={`font-['Noto_Sans_JP'] font-black text-slate-900 dark:text-white leading-relaxed ${
                  currentMemorizeQ.direction === 'jp-to-vn'
                    ? 'text-6xl sm:text-7xl py-4'
                    : 'text-2xl sm:text-3xl py-2'
                }`}>
                  {currentMemorizeQ.subject}
                </div>
              </div>

              {/* 4 Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {currentMemorizeQ.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isChosen = idx === memorizeSelectedIdx;
                  const isCorrect = opt.isCorrect;

                  let btnStyle = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-indigo-500 hover:bg-indigo-500/5';
                  let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-500';

                  if (memorizeSelectedIdx !== null) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/50';
                      badgeStyle = 'bg-white/20 text-white';
                    } else if (isChosen && !isCorrect) {
                      btnStyle = 'bg-rose-500 text-white border-rose-600 shadow-md animate-shake';
                      badgeStyle = 'bg-white/20 text-white';
                    } else {
                      btnStyle = 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isEvaluatingChoice}
                      onClick={() => handleSelectMemorizeAnswer(idx)}
                      className={`p-4 rounded-2xl border-2 font-bold text-left transition-all duration-150 cursor-pointer shadow-sm flex items-center justify-between gap-3 active:scale-[0.98] ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${badgeStyle}`}>
                          {letter}
                        </span>
                        <span className={`font-['Noto_Sans_JP'] font-bold truncate ${
                          currentMemorizeQ.direction === 'vn-to-jp' ? 'text-2xl sm:text-3xl font-black' : 'text-sm sm:text-base'
                        }`}>
                          {opt.text}
                        </span>
                      </div>

                      {memorizeSelectedIdx !== null && isCorrect && (
                        <span className="text-white text-base font-black shrink-0">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {memorizeGameOver && (
            <div className="p-6 sm:p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center text-4xl shadow-md">
                💥
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  KẾT THÚC LƯỢT CHƠI!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {memorizeTimeLeft <= 0 ? 'Đã hết thời gian phản xạ!' : 'Bạn đã chọn chưa chính xác.'}
                </p>
              </div>

              {/* Score summary */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">ĐIỂM ĐẠT ĐƯỢC</span>
                  <span className="text-3xl font-black text-amber-500">
                    {memorizeScore}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">CHUỖI ĐÚNG DÀI NHẤT</span>
                  <span className="text-3xl font-black text-rose-500">
                    {memorizeMaxStreak}
                  </span>
                </div>
              </div>

              {/* Chữ Hán sai */}
              {memorizeWrongList.length > 0 && (
                <div className="text-left space-y-2 bg-rose-500/5 p-4 rounded-2xl border border-rose-500/20">
                  <span className="text-xs font-bold text-rose-500 block">
                    Chữ Hán cần chú ý ôn lại ({memorizeWrongList.length} chữ):
                  </span>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                    {memorizeWrongList.map((k, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-500/20 text-xs flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-rose-500 font-['Noto_Sans_JP'] text-xl shrink-0">
                            {k.character}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">
                            {k.sino_vietnamese ? `[${k.sino_vietnamese}] ` : ''}{k.vietnamese_meaning}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={startMemorizeGame}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  🔄 Chơi lại lượt mới
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMemorizeActive(false);
                    setMemorizeGameOver(false);
                  }}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Quay lại màn hình chuẩn bị
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PHÂN HỆ 2: 🎯 LUYỆN TẬP (3 DẠNG THỰC CHIẾN ĐA BÀI HỌC)                 */}
      {/* ========================================================================= */}
      {activeTab === 'practice' && (
        <div className="space-y-5">
          {/* Category Selector Chips */}
          <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Dạng bài:</span>
              <button
                type="button"
                onClick={selectAllCategories}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategories.length === 3
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Tất cả dạng
              </button>

              <button
                type="button"
                onClick={() => toggleCategory('type1_vocab')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategories.includes('type1_vocab')
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <span>📖</span>
                <span>Dạng 1: Từ vựng Hán tự</span>
              </button>

              <button
                type="button"
                onClick={() => toggleCategory('type2_partial')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategories.includes('type2_partial')
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <span>🧩</span>
                <span>Dạng 2: Từ vựng nửa vời</span>
              </button>

              <button
                type="button"
                onClick={() => toggleCategory('type3_sentence')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategories.includes('type3_sentence')
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <span>📝</span>
                <span>Dạng 3: Hán tự trong câu</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShufflePractice}
                disabled={practiceQuestions.length <= 1}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-40"
                title="Tráo đổi ngẫu nhiên câu hỏi"
              >
                🔀
              </button>
              <button
                type="button"
                onClick={generateNewPracticeSet}
                className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm active:scale-95"
              >
                ✨ Đổi bộ đề ({practiceQuestions.length} câu)
              </button>
            </div>
          </div>

          {/* Practice Questions Screen */}
          {practiceQuestions.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <span className="text-4xl">📭</span>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Không tìm thấy chữ Hán nào phù hợp với bộ lọc hiện tại.
              </p>
              <button
                type="button"
                onClick={generateNewPracticeSet}
                className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                ✨ Tạo lại bộ đề
              </button>
            </div>
          ) : isPracticeFinished ? (
            /* Summary Screen */
            <div className="p-6 sm:p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center text-4xl shadow-md">
                🎉
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  HOÀN THÀNH BÀI LUYỆN TẬP TỔNG HỢP!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bạn đã hoàn thành thử thách toàn bộ {practiceQuestions.length} câu hỏi bài tập thực chiến đa bài học.
                </p>
              </div>

              {/* Scorecard */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">SỐ CÂU ĐÚNG</span>
                  <span className="text-3xl font-black text-emerald-500">
                    {practiceScore} <span className="text-base text-slate-400 font-semibold">/ {practiceQuestions.length}</span>
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">TỶ LỆ CHÍNH XÁC</span>
                  <span className="text-3xl font-black text-indigo-500">
                    {Math.round((practiceScore / practiceQuestions.length) * 100)}%
                  </span>
                </div>
              </div>

              {/* Missed questions review */}
              {practiceWrongList.length > 0 && (
                <div className="text-left space-y-2 bg-rose-500/5 p-4 rounded-2xl border border-rose-500/20">
                  <span className="text-xs font-bold text-rose-500 block">
                    Câu hỏi cần chú ý ôn lại ({practiceWrongList.length} câu):
                  </span>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                    {practiceWrongList.map((q, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-500/20 text-xs flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-black text-rose-500 font-['Noto_Sans_JP'] text-sm mr-2">
                            {q.badgeLabel}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-100 truncate font-['Noto_Sans_JP']">
                            {q.displaySubject}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-500 shrink-0">
                          Đáp án: {q.options[q.correctIndex]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={generateNewPracticeSet}
                  className="py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-500/20 cursor-pointer transition-all active:scale-95"
                >
                  ✨ Đổi bộ đề mới
                </button>

                {practiceWrongList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRetryPracticeWrongs}
                    className="py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    ↺ Luyện lại câu sai ({practiceWrongList.length})
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setPracticeIndex(0);
                    setSelectedOptionIdx(null);
                    setIsQuestionSubmitted(false);
                    setPracticeScore(0);
                    setUserPracticeAnswers({});
                    setIsPracticeFinished(false);
                    setPracticeWrongList([]);
                  }}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  🔀 Làm lại đề này
                </button>
              </div>
            </div>
          ) : currentQ && (
            /* Active Question Card */
            <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-200">
              {/* Question Header Toolbar */}
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-black text-xs">
                    Câu {practiceIndex + 1} / {practiceQuestions.length}
                  </span>

                  {/* Badge dạng bài tập */}
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    currentQ.category === 'type1_vocab'
                      ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                      : currentQ.category === 'type2_partial'
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  }`}>
                    {currentQ.badgeLabel}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlayAudio(currentQ.targetWord, currentQ.targetWordReading)}
                  className="p-1.5 px-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 border border-indigo-500/20 text-xs font-bold transition-colors cursor-pointer active:scale-95 flex items-center gap-1"
                  title="Nghe phát âm"
                >
                  <span>🔊</span>
                  <span className="hidden sm:inline">Phát âm</span>
                </button>
              </div>

              {/* Question Prompt & Display Box */}
              <div className="p-5 sm:p-7 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl shadow-md space-y-3">
                <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {currentQ.prompt}
                  </span>
                </div>

                {/* Main Subject Text */}
                <div className="font-['Noto_Sans_JP'] text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-relaxed whitespace-pre-line py-2">
                  {currentQ.displaySubject}
                </div>
              </div>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {currentQ.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isCorrect = idx === currentQ.correctIndex;
                  const isChosen = idx === selectedOptionIdx;

                  let btnStyle = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-500/5';
                  let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';

                  if (isQuestionSubmitted) {
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
                      disabled={isQuestionSubmitted}
                      onClick={() => handleSelectPracticeOption(idx)}
                      className={`p-4 rounded-2xl border-2 font-bold text-left transition-all duration-150 cursor-pointer shadow-sm flex items-center justify-between gap-3 active:scale-[0.98] ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${badgeStyle}`}>
                          {letter}
                        </span>
                        <span className={`font-['Noto_Sans_JP'] font-bold truncate ${opt.length <= 2 ? 'text-xl sm:text-2xl font-black' : 'text-base sm:text-lg'}`}>
                          {opt}
                        </span>
                      </div>

                      {isQuestionSubmitted && isCorrect && (
                        <span className="text-white text-base font-black shrink-0">✓</span>
                      )}
                      {isQuestionSubmitted && isChosen && !isCorrect && (
                        <span className="text-white text-base font-black shrink-0">✗</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Detailed Post-Answer Explanation Card */}
              {isQuestionSubmitted && (
                <div className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-lg space-y-3 animate-in fade-in duration-150 border-indigo-500/30">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className={`text-sm font-black flex items-center gap-1.5 ${
                      selectedOptionIdx === currentQ.correctIndex ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {selectedOptionIdx === currentQ.correctIndex ? '✅ Chính xác! (正解)' : '❌ Chưa đúng (不正解)'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handlePlayAudio(currentQ.targetWord, currentQ.targetWordReading)}
                      className="py-1 px-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>🔊 Phát âm</span>
                    </button>
                  </div>

                  {/* Chi tiết phân tích chữ Hán và sự kết hợp */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <span>💡</span>
                      <span>Giải thích chi tiết cấu tạo & ý nghĩa Hán tự:</span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-line text-xs sm:text-sm pl-1">
                      {currentQ.explanation}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handlePrevQuestion}
                      disabled={practiceIndex === 0}
                      className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                    >
                      ← Câu trước
                    </button>

                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{practiceIndex + 1 < practiceQuestions.length ? 'Câu tiếp theo ➔' : 'Xem tổng kết ➔'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
