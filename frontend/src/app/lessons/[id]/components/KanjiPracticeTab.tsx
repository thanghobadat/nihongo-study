// website/frontend/src/app/lessons/[id]/components/KanjiPracticeTab.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  KanjiItemData,
  COMMON_KANJI_DISTRACTORS,
  shuffleArray
} from '../../../utils/kanjiPracticeHelper';
import { playAudioWithFallback, playSpeedrunSound } from '../../../utils/audioHelper';
import {
  PracticeExerciseQuestion,
  PracticeCategory,
  generatePracticeQuestions,
  getLessonKanjiRomaji
} from '../../../utils/kanjiOverhaulHelper';

interface KanjiPracticeTabProps {
  kanjiItems: KanjiItemData[];
  vocabItems?: any[];
  grammarItems?: any[];
  selectedLessonId: number;
  lessonTitle: string;
  onUpdateKanjiStatus?: (id: number, status: 'not_learned' | 'learning' | 'mastered') => void;
  onBackToVocabPractice?: () => void;
}

export default function KanjiPracticeTab({
  kanjiItems,
  vocabItems = [],
  grammarItems = [],
  selectedLessonId,
  lessonTitle,
  onUpdateKanjiStatus,
  onBackToVocabPractice
}: KanjiPracticeTabProps) {
  // Main Tab Navigation: 'memorize' (Nhớ mặt chữ) | 'practice' (Luyện tập)
  const [activeTab, setActiveTab] = useState<'memorize' | 'practice'>('memorize');

  // Status Filter: 'all' | 'not_learned' | 'learning' | 'mastered'
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_learned' | 'learning' | 'mastered'>('all');

  // Eligible Kanji based on status filter
  const eligibleKanji = useMemo(() => {
    if (statusFilter === 'all') return kanjiItems;
    return kanjiItems.filter(k => (k.status || 'not_learned') === statusFilter);
  }, [kanjiItems, statusFilter]);

  // Audio helper
  const handlePlayAudio = useCallback((char: string, kana?: string) => {
    const playKana = kana || char;
    playAudioWithFallback(char, playKana);
  }, []);

  // =========================================================================
  // 1. PHÂN HỆ 1: 🎯 LUYỆN TẬP (3 DẠNG BÀI TẬP THỰC CHIẾN)
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

  // Tái tạo hoặc sinh mới bộ câu hỏi Luyện tập
  const generateNewPracticeSet = useCallback(() => {
    if (eligibleKanji.length === 0) {
      setPracticeQuestions([]);
      return;
    }
    const questions = generatePracticeQuestions({
      eligibleKanji,
      vocabItems,
      grammarItems,
      allLessonKanji: kanjiItems,
      selectedCategories: selectedCategories.length > 0 ? selectedCategories : ['type1_vocab', 'type2_partial', 'type3_sentence'],
      currentLessonId: selectedLessonId,
      limit: 12
    });
    setPracticeQuestions(questions);
    setPracticeIndex(0);
    setSelectedOptionIdx(null);
    setIsQuestionSubmitted(false);
    setPracticeScore(0);
    setUserPracticeAnswers({});
    setIsPracticeFinished(false);
    setPracticeWrongList([]);
  }, [eligibleKanji, vocabItems, grammarItems, kanjiItems, selectedCategories, selectedLessonId]);

  // Tự động sinh câu hỏi khi đổi bài học hoặc đổi bộ lọc trạng thái
  useEffect(() => {
    if (activeTab === 'practice') {
      generateNewPracticeSet();
    }
  }, [activeTab, selectedLessonId, eligibleKanji.length, statusFilter]);

  // Bật/tắt 1 danh mục dạng bài tập
  const toggleCategory = (cat: PracticeCategory) => {
    setSelectedCategories(prev => {
      let next: PracticeCategory[];
      if (prev.includes(cat)) {
        if (prev.length === 1) return prev; // giữ lại ít nhất 1 dạng
        next = prev.filter(c => c !== cat);
      } else {
        next = [...prev, cat];
      }
      return next;
    });
  };

  // Chọn tất cả các dạng bài tập
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

  // Chuyển sang câu tiếp theo
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

  // Quay lại câu trước
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

  // Xáo trộn thứ tự các câu hỏi hiện tại
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

  // Luyện lại danh sách các câu làm sai
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

  // =========================================================================
  // 2. PHÂN HỆ 2: 🧠 NHỚ MẶT CHỮ (SPEEDRUN PHẢN XẠ NHANH 2 CHIỀU)
  // =========================================================================
  const [memorizeActive, setMemorizeActive] = useState<boolean>(false);
  const [memorizeGameOver, setMemorizeGameOver] = useState<boolean>(false);
  const [memorizeScore, setMemorizeScore] = useState<number>(0);
  const [memorizeHighScore, setMemorizeHighScore] = useState<number>(0);
  const [memorizeStreak, setMemorizeStreak] = useState<number>(0);
  const [memorizeMaxStreak, setMemorizeMaxStreak] = useState<number>(0);
  const [memorizeTimeLeft, setMemorizeTimeLeft] = useState<number>(10);
  const [memorizeMaxTime, setMemorizeMaxTime] = useState<number>(10);
  const [memorizeDirection, setMemorizeDirection] = useState<'jp-to-vn' | 'vn-to-jp' | 'jp-to-romaji' | 'both'>('both');
  const [memorizeWrongList, setMemorizeWrongList] = useState<KanjiItemData[]>([]);

  interface MemorizeQ {
    subject: string;
    subText?: string;
    promptText: string;
    correctKanji: KanjiItemData;
    correctAnswerText: string;
    options: { text: string; isCorrect: boolean }[];
    direction: 'jp-to-vn' | 'vn-to-jp' | 'jp-to-romaji';
  }

  const [currentMemorizeQ, setCurrentMemorizeQ] = useState<MemorizeQ | null>(null);
  const [memorizeSelectedIdx, setMemorizeSelectedIdx] = useState<number | null>(null);
  const [memorizeIsCorrect, setMemorizeIsCorrect] = useState<boolean | null>(null);
  const [isEvaluatingChoice, setIsEvaluatingChoice] = useState<boolean>(false);

  const timerRef = useRef<any>(null);
  const scoreRef = useRef<number>(0);
  const maxTimeRef = useRef<number>(10);

  // Nạp kỷ lục high score từ localStorage
  useEffect(() => {
    try {
      const savedHigh = localStorage.getItem(`kanji_memorize_high_${selectedLessonId}`);
      if (savedHigh) {
        setMemorizeHighScore(parseInt(savedHigh, 10) || 0);
      }
    } catch (e) {
      // ignore
    }
  }, [selectedLessonId]);

  // Tính thời gian động theo streak: bắt đầu 10s (như Luyện từ vựng), giảm 10% sau mỗi 3 câu đúng, min 2s
  const getDynamicTimeForStreak = (streak: number): number => {
    const reductionCount = Math.floor(streak / 3);
    return Math.max(2, Math.round(10 * Math.pow(0.9, reductionCount) * 10) / 10);
  };

  // Sinh câu hỏi Nhớ mặt chữ tiếp theo (100% Kanji độc lập <-> Nghĩa / Romaji)
  const generateNextMemorizeQuestion = useCallback((): MemorizeQ | null => {
    if (eligibleKanji.length === 0) return null;

    // Chọn ngẫu nhiên chữ Kanji mục tiêu
    const target = eligibleKanji[Math.floor(Math.random() * eligibleKanji.length)];

    // Xác định chiều câu hỏi
    let dir: 'jp-to-vn' | 'vn-to-jp' | 'jp-to-romaji' = 'jp-to-vn';
    if (memorizeDirection === 'jp-to-vn') dir = 'jp-to-vn';
    else if (memorizeDirection === 'vn-to-jp') dir = 'vn-to-jp';
    else if (memorizeDirection === 'jp-to-romaji') dir = 'jp-to-romaji';
    else {
      const rand = Math.random();
      if (rand < 0.34) dir = 'jp-to-vn';
      else if (rand < 0.67) dir = 'vn-to-jp';
      else dir = 'jp-to-romaji';
    }

    // 3 phương án gây nhiễu cho Nghĩa và Chữ Hán
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
    if (dir === 'vn-to-jp') {
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
    }

    // Chiều 3: 🈸 ➔ 🔤 Romaji (Chữ Hán -> Chọn Romaji tương ứng trong bài)
    const targetRomaji = getLessonKanjiRomaji(target, selectedLessonId, vocabItems).toLowerCase().trim() ||
      (target.onyomi || target.kunyomi || target.character).split(/[\s,()（）.]+/)[0].toLowerCase();

    // Thu thập kho Romaji gây nhiễu độc nhất
    const distractorRomajis = new Set<string>();
    for (const k of shuffleArray(pool)) {
      const r = getLessonKanjiRomaji(k, selectedLessonId, vocabItems).toLowerCase().trim();
      if (r && r !== targetRomaji) {
        distractorRomajis.add(r);
      }
      if (distractorRomajis.size >= 3) break;
    }

    // Nếu kho chữ của bài ít hơn 4 chữ, lấy thêm từ COMMON_KANJI_DISTRACTORS
    if (distractorRomajis.size < 3) {
      for (const d of shuffleArray(COMMON_KANJI_DISTRACTORS)) {
        const r = getLessonKanjiRomaji(d, 0, []).toLowerCase().trim();
        if (r && r !== targetRomaji) {
          distractorRomajis.add(r);
        }
        if (distractorRomajis.size >= 3) break;
      }
    }

    // Fallback nếu vẫn thiếu
    const FALLBACK_ROMAJIS = ['kai', 'sha', 'in', 'sen', 'sei', 'gaku', 'kou', 'hon', 'ji', 'sho', 'shin', 'bun', 'dou', 'eki'];
    for (const fb of shuffleArray(FALLBACK_ROMAJIS)) {
      if (distractorRomajis.size >= 3) break;
      if (fb !== targetRomaji) {
        distractorRomajis.add(fb);
      }
    }

    const chosenRomajiDistractors = Array.from(distractorRomajis).slice(0, 3);
    const options = shuffleArray([
      { text: targetRomaji, isCorrect: true },
      ...chosenRomajiDistractors.map(r => ({ text: r, isCorrect: false }))
    ]);

    return {
      subject: target.character,
      promptText: '👉 Chọn cách đọc Romaji tương ứng trong bài:',
      correctKanji: target,
      correctAnswerText: targetRomaji,
      options,
      direction: 'jp-to-romaji'
    };
  }, [eligibleKanji, memorizeDirection, selectedLessonId, vocabItems]);

  // Bắt đầu Speedrun Nhớ mặt chữ
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
    setMemorizeIsCorrect(null);
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
          // Hết giờ -> Game Over
          clearInterval(timerRef.current);
          setMemorizeActive(false);
          setMemorizeGameOver(true);
          playSpeedrunSound('wrong');
          if (currentMemorizeQ) {
            setMemorizeWrongList(list => [...list, currentMemorizeQ.correctKanji]);
          }
          return 0;
        }
        return Math.round((prev - 0.1) * 10) / 10;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [memorizeActive, memorizeGameOver, currentMemorizeQ]);

  // Người dùng chọn 1 đáp án trong Speedrun
  const handleSelectMemorizeAnswer = (idx: number) => {
    if (!currentMemorizeQ || isEvaluatingChoice || !memorizeActive) return;

    setIsEvaluatingChoice(true);
    setMemorizeSelectedIdx(idx);
    const chosen = currentMemorizeQ.options[idx];
    const isCorrect = chosen.isCorrect;
    setMemorizeIsCorrect(isCorrect);

    if (isCorrect) {
      playSpeedrunSound('correct');
      const newScore = scoreRef.current + 1;
      scoreRef.current = newScore;
      setMemorizeScore(newScore);

      setMemorizeStreak(s => {
        const nextStreak = s + 1;
        setMemorizeMaxStreak(ms => Math.max(ms, nextStreak));
        const nextTime = getDynamicTimeForStreak(nextStreak);
        maxTimeRef.current = nextTime;
        setMemorizeMaxTime(nextTime);
        setMemorizeTimeLeft(nextTime);
        return nextStreak;
      });

      // Cập nhật kỷ lục
      if (newScore > memorizeHighScore) {
        setMemorizeHighScore(newScore);
        try {
          localStorage.setItem(`kanji_memorize_high_${selectedLessonId}`, newScore.toString());
        } catch (e) {
          // ignore
        }
      }

      // Đổi sang câu mới sau 350ms
      setTimeout(() => {
        setMemorizeSelectedIdx(null);
        setMemorizeIsCorrect(null);
        setIsEvaluatingChoice(false);
        const nextQ = generateNextMemorizeQuestion();
        setCurrentMemorizeQ(nextQ);
      }, 350);
    } else {
      playSpeedrunSound('wrong');
      // Trả lời sai -> Game Over sau 800ms
      setTimeout(() => {
        setMemorizeActive(false);
        setMemorizeGameOver(true);
        setMemorizeWrongList(list => [...list, currentMemorizeQ.correctKanji]);
        setMemorizeSelectedIdx(null);
        setMemorizeIsCorrect(null);
        setIsEvaluatingChoice(false);
      }, 800);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-16 overflow-x-hidden min-w-0 max-w-full w-full">
      {/* 1. Header Toolbar */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
              🉐
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>{lessonTitle} - LUYỆN TẬP KANJI</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {eligibleKanji.length} chữ
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nhớ mặt chữ Hán và Luyện tập các dạng bài thực chiến trong bài học.
              </p>
            </div>
          </div>

          {onBackToVocabPractice && (
            <button
              onClick={onBackToVocabPractice}
              className="text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 flex items-center gap-1.5 self-start sm:self-center transition-colors cursor-pointer"
            >
              <span>← Quay lại Ôn Từ Vựng</span>
            </button>
          )}
        </div>

        {/* 2 Trọng tâm chính: Tab Switcher (Luyện tập vs Nhớ mặt chữ) & Status Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Main 2 Tab Switcher */}
          <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-950/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-inner gap-1">
            <button
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

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
            >
              <option value="all">Tất cả ({kanjiItems.length})</option>
              <option value="not_learned">🔴 Chưa học ({kanjiItems.filter(k => (k.status || 'not_learned') === 'not_learned').length})</option>
              <option value="learning">🟡 Đang học ({kanjiItems.filter(k => k.status === 'learning').length})</option>
              <option value="mastered">🟢 Đã thuộc ({kanjiItems.filter(k => k.status === 'mastered').length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PHÂN HỆ 1: 🎯 LUYỆN TẬP (3 DẠNG BÀI THỰC CHIẾN)                        */}
      {/* ========================================================================= */}
      {activeTab === 'practice' && (
        <div className="space-y-5">
          {/* Category Selector Chips */}
          <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Dạng bài:</span>
              <button
                type="button"
                onClick={selectAllCategories}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategories.length === 3
                    ? 'bg-blue-600 text-white shadow-sm'
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
                <span>💬</span>
                <span>Dạng 3: Hán tự trong câu</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={generateNewPracticeSet}
                className="py-1.5 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                title="Tạo bộ câu hỏi mới"
              >
                <span>✨ Đổi đề mới</span>
              </button>

              <button
                type="button"
                onClick={handleShufflePractice}
                className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                title="Xáo trộn câu hỏi"
              >
                <span>🔀 Tráo câu</span>
              </button>
            </div>
          </div>

          {/* Question Screen */}
          {practiceQuestions.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <span className="text-4xl">📭</span>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Không tìm thấy câu hỏi phù hợp với bộ lọc hiện tại.
              </p>
              <button
                type="button"
                onClick={generateNewPracticeSet}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                ✨ Tạo lại bộ đề
              </button>
            </div>
          ) : isPracticeFinished ? (
            /* Summary Screen */
            <div className="p-6 sm:p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center text-4xl shadow-md">
                🎉
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  HOÀN THÀNH BÀI LUYỆN TẬP!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bạn đã hoàn thành thử thách toàn bộ {practiceQuestions.length} câu hỏi bài tập thực chiến.
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
                  <span className="text-3xl font-black text-blue-500">
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
                  className="py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-blue-500/20 cursor-pointer transition-all active:scale-95"
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
              {/* Question Header Tool Bar */}
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-black text-xs">
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
                  className="p-1.5 px-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 text-xs font-bold transition-colors cursor-pointer active:scale-95 flex items-center gap-1"
                  title="Nghe phát âm"
                >
                  <span>🔊</span>
                  <span className="hidden sm:inline">Phát âm</span>
                </button>
              </div>

              {/* Question Prompt & Display Box */}
              <div className="p-5 sm:p-7 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl shadow-md space-y-3">
                <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400">
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
                  const letter = String.fromCharCode(65 + idx); // A, B, C, D
                  const isCorrect = idx === currentQ.correctIndex;
                  const isChosen = idx === selectedOptionIdx;

                  let btnStyle = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-500/5';
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
                <div className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-lg space-y-3 animate-in fade-in duration-150 border-blue-500/30">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className={`text-sm font-black flex items-center gap-1.5 ${
                      selectedOptionIdx === currentQ.correctIndex ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {selectedOptionIdx === currentQ.correctIndex ? '✅ Chính xác! (正解)' : '❌ Chưa đúng (不正解)'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handlePlayAudio(currentQ.targetWord, currentQ.targetWordReading)}
                      className="py-1 px-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
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
                      className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
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

      {/* ========================================================================= */}
      {/* 2. PHÂN HỆ 2: 🧠 NHỚ MẶT CHỮ (SPEEDRUN PHẢN XẠ NHANH 2 CHIỀU)             */}
      {/* ========================================================================= */}
      {activeTab === 'memorize' && (
        <div className="space-y-6">
          {!memorizeActive && !memorizeGameOver && (
            <div className="p-5 sm:p-8 lg:p-12 text-center bg-white dark:bg-slate-900/60 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-amber-500/20 text-white animate-bounce">
                🧠
              </div>

              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100">
                  Thử Thách Nhớ Mặt Chữ Kanji
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                  Luyện phản xạ nhanh giúp bạn ghi nhớ mặt chữ Hán và ý nghĩa của bài học.
                  Thời gian sẽ <b>giảm dần khi streak tăng</b> (xuất phát từ 10s, mỗi 3 câu đúng giảm 10%).
                </p>
              </div>

              {/* Chuyển đổi các chiều phản xạ + Tổng hợp */}
              <div className="space-y-2 text-left bg-slate-50 dark:bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Chiều câu hỏi phản xạ:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setMemorizeDirection('jp-to-vn')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate ${
                      memorizeDirection === 'jp-to-vn'
                        ? 'bg-blue-600 text-white shadow-sm font-extrabold'
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
                        ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    🇻🇳 ➔ 🈸 Nghĩa
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemorizeDirection('jp-to-romaji')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate ${
                      memorizeDirection === 'jp-to-romaji'
                        ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    🈸 ➔ 🔤 Romaji
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemorizeDirection('both')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate ${
                      memorizeDirection === 'both'
                        ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    🔀 Tổng hợp
                  </button>
                </div>
              </div>

              {/* Kỷ lục High Score */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
                <span>🏆 Kỷ lục cao nhất:</span>
                <span className="text-sm font-black">{memorizeHighScore} điểm</span>
              </div>

              {/* Start Button */}
              <div>
                <button
                  type="button"
                  onClick={startMemorizeGame}
                  className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-black text-sm shadow-xl shadow-rose-500/25 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  ⚡ BẮT ĐẦU NHỚ MẶT CHỮ
                </button>
              </div>
            </div>
          )}

          {/* Active Speedrun Game Screen */}
          {memorizeActive && currentMemorizeQ && (
            <div className="max-w-xl mx-auto space-y-4">
              {/* Speedrun Header Info */}
              <div className="flex items-center justify-between p-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-black">
                <div className="flex items-center gap-1.5 text-blue-500">
                  <span>⏱️</span>
                  <span>{memorizeTimeLeft.toFixed(1)}s</span>
                </div>

                <div className="flex items-center gap-1.5 text-amber-500">
                  <span>🔥 Streak: {memorizeStreak}</span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-500">
                  <span>⭐ Điểm: {memorizeScore}</span>
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
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">
                  {currentMemorizeQ.promptText}
                </span>

                <div className={`font-['Noto_Sans_JP'] font-black text-slate-900 dark:text-white leading-relaxed ${
                  currentMemorizeQ.direction === 'jp-to-vn' || currentMemorizeQ.direction === 'jp-to-romaji'
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

                  let btnStyle = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-blue-500 hover:bg-blue-500/5';
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
                          currentMemorizeQ.direction === 'vn-to-jp'
                            ? 'text-2xl sm:text-3xl font-black'
                            : currentMemorizeQ.direction === 'jp-to-romaji'
                              ? 'text-lg sm:text-xl font-mono font-black lowercase'
                              : 'text-sm sm:text-base'
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
                            {getLessonKanjiRomaji(k, selectedLessonId, vocabItems) && (
                              <span className="ml-1.5 text-blue-500 font-mono font-bold">
                                • Romaji: {getLessonKanjiRomaji(k, selectedLessonId, vocabItems)}
                              </span>
                            )}
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
                  Quay lại màn hình chính
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
