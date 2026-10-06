'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  KanjiItemData,
  COMMON_KANJI_DISTRACTORS,
  shuffleArray,
  KanjiWritingRiddle,
  fetchKanjiWritingRiddles,
  KanjiRecognitionQuizQuestion,
  fetchKanjiRecognitionQuestions
} from '../../../utils/kanjiPracticeHelper';
import { playAudioWithFallback } from '../../../utils/audioHelper';
import { getKanjiForm } from '../../../utils/kanjiFormLookup';

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
      const kForm = getKanjiForm(v.hiragana, kanjiList);
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

interface KanjiPracticeTabProps {
  kanjiItems: KanjiItemData[];
  vocabItems?: any[];
  selectedLessonId: number;
  lessonTitle: string;
  onUpdateKanjiStatus?: (id: number, status: 'not_learned' | 'learning' | 'mastered') => void;
  onBackToVocabPractice?: () => void;
}

export default function KanjiPracticeTab({
  kanjiItems,
  vocabItems,
  selectedLessonId,
  lessonTitle,
  onUpdateKanjiStatus,
  onBackToVocabPractice
}: KanjiPracticeTabProps) {
  // Main Tab Navigation: 'recognition' | 'speedrun' | 'ai_writing'
  const [activeTab, setActiveTab] = useState<'recognition' | 'speedrun' | 'ai_writing'>('recognition');

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
  // 0. TÍNH NĂNG 0: NHẬN DIỆN MẶT CHỮ & TỪ VỰNG THỰC CHIẾN (100% TIẾNG NHẬT)
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

  // Fetch AI Recognition Quiz when entering tab or changing lesson/filter
  useEffect(() => {
    if (activeTab !== 'recognition' || eligibleKanji.length === 0) return;

    let isMounted = true;
    setIsLoadingQuiz(true);

    fetchKanjiRecognitionQuestions(selectedLessonId, eligibleKanji, false, vocabItems)
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
  }, [activeTab, selectedLessonId, eligibleKanji, vocabItems]);

  // Xáo trộn ngẫu nhiên toàn bộ danh sách câu hỏi
  const handleShuffleQuiz = () => {
    if (quizQuestions.length <= 1) return;
    setQuizQuestions(shuffleArray(quizQuestions));
    setQuizIndex(0);
    setSelectedOptionIdx(null);
    setIsQuizSubmitted(false);
  };

  // Yêu cầu AI sinh bộ câu hỏi nhận diện mới hoàn toàn (bỏ qua cache)
  const loadFreshQuiz = async () => {
    if (eligibleKanji.length === 0) return;
    setIsLoadingQuiz(true);
    try {
      const freshQuestions = await fetchKanjiRecognitionQuestions(selectedLessonId, eligibleKanji, true, vocabItems);
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
      const audioToPlay = currentQuizQ.target_word || currentQuizQ.target_kanji;
      handlePlayAudio(audioToPlay, currentQuizQ.target_word_reading || audioToPlay);
    } else {
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
  // 1. TÍNH NĂNG 1: SPEEDRUN LUYỆN PHẢN XẠ KANJI
  // =========================================================================
  const [speedrunActive, setSpeedrunActive] = useState<boolean>(false);
  const [speedrunGameOver, setSpeedrunGameOver] = useState<boolean>(false);
  const [speedrunScore, setSpeedrunScore] = useState<number>(0);
  const [speedrunHighScore, setSpeedrunHighScore] = useState<number>(0);
  const [speedrunStreak, setSpeedrunStreak] = useState<number>(0);
  const [speedrunMaxStreak, setSpeedrunMaxStreak] = useState<number>(0);
  const [speedrunTimeLeft, setSpeedrunTimeLeft] = useState<number>(20);
  const [speedrunMaxTime, setSpeedrunMaxTime] = useState<number>(20);
  const [speedrunDirection, setSpeedrunDirection] = useState<'kanji-to-meaning' | 'meaning-to-kanji' | 'kanji-vocab' | 'both'>('both');
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

  const speedrunTimerRef = useRef<any>(null);
  const speedrunScoreRef = useRef<number>(0);
  const speedrunMaxTimeRef = useRef<number>(20);

  // Load Speedrun high score from localStorage
  useEffect(() => {
    try {
      const savedHigh = localStorage.getItem(`kanji_speedrun_high_${selectedLessonId}`);
      if (savedHigh) {
        setSpeedrunHighScore(parseInt(savedHigh, 10) || 0);
      }
    } catch (e) {
      // ignore
    }
  }, [selectedLessonId]);

  // Calculate dynamic max time based on streak (similar to vocab speedrun: 10% reduction every 3 streaks, min 2s)
  const getDynamicTimeForStreak = (streak: number): number => {
    const reductionCount = Math.floor(streak / 3);
    return Math.max(2, Math.round(20 * Math.pow(0.9, reductionCount) * 10) / 10);
  };

  // Generate next Speedrun Question
  const generateSpeedrunQuestion = useCallback((): SpeedrunQ | null => {
    if (eligibleKanji.length === 0) return null;

    // Pick random target Kanji
    const target = eligibleKanji[Math.floor(Math.random() * eligibleKanji.length)];

    // 0. Nếu có câu hỏi nhận diện mặt chữ AI, ưu tiên xuất hiện ngẫu nhiên trong Speedrun để đa dạng
    if (quizQuestions.length > 0 && (speedrunDirection === 'both' || speedrunDirection === 'kanji-vocab') && Math.random() < 0.6) {
      const q = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
      const targetKanjiItem = eligibleKanji.find(k => k.character === q.target_kanji) || target;
      return {
        subject: q.context_sentence || q.target_word || q.target_kanji,
        subText: undefined,
        promptText: q.question_text,
        correctKanji: targetKanjiItem,
        audioWord: q.target_word_reading || q.target_word,
        correctAnswerText: q.options[q.correct_index],
        options: q.options.map((opt, idx) => ({
          text: opt,
          isCorrect: idx === q.correct_index
        })),
        direction: 'kanji-to-vocab'
      };
    }

    // Decide question direction
    let dir: 'kanji-to-meaning' | 'meaning-to-kanji' | 'kanji-to-vocab' | 'vocab-to-kanji' = 'kanji-to-meaning';
    if (speedrunDirection === 'kanji-to-meaning') {
      dir = 'kanji-to-meaning';
    } else if (speedrunDirection === 'meaning-to-kanji') {
      dir = 'meaning-to-kanji';
    } else if (speedrunDirection === 'kanji-vocab') {
      dir = Math.random() > 0.5 ? 'kanji-to-vocab' : 'vocab-to-kanji';
    } else {
      const allModes: ('kanji-to-meaning' | 'meaning-to-kanji' | 'kanji-to-vocab' | 'vocab-to-kanji')[] = [
        'kanji-to-meaning',
        'meaning-to-kanji',
        'kanji-to-vocab',
        'vocab-to-kanji'
      ];
      dir = allModes[Math.floor(Math.random() * allModes.length)];
    }

    // Pick 3 distractors
    const pool = eligibleKanji.filter(k => k.id !== target.id);
    const combinedPool = pool.length >= 3 ? pool : [...pool, ...COMMON_KANJI_DISTRACTORS.filter(d => d.character !== target.character)];
    const shuffledPool = shuffleArray(combinedPool);
    const distractors = shuffledPool.slice(0, 3);

    // 1. Dạng Kanji độc lập ➔ Từ vựng Hiragana (+ Nghĩa)
    if (dir === 'kanji-to-vocab') {
      const linked = getLinkedVocabForKanji(target.character, vocabItems, kanjiItems);
      if (linked.length > 0) {
        const chosen = linked[Math.floor(Math.random() * linked.length)];
        const targetAns = `${chosen.hiragana}: ${chosen.meaning}`.trim();

        // 3 distractor vocabs that do NOT use this Kanji
        let wrongVocabs = (vocabItems || [])
          .filter(v => v.hiragana && v.hiragana !== chosen.hiragana && !getKanjiForm(v.hiragana, kanjiItems).includes(target.character))
          .map(v => ({ hiragana: v.hiragana, meaning: v.vietnamese_meaning || '' }));

        if (wrongVocabs.length < 3) {
          for (const k of COMMON_KANJI_DISTRACTORS) {
            if (wrongVocabs.length >= 3) break;
            wrongVocabs.push({ hiragana: k.kunyomi || k.character, meaning: k.vietnamese_meaning });
          }
        }
        const shuffledWrong = shuffleArray(wrongVocabs).slice(0, 3);
        const options = shuffleArray([
          { text: targetAns, isCorrect: true },
          ...shuffledWrong.map(w => ({
            text: `${w.hiragana}: ${w.meaning}`.trim(),
            isCorrect: false
          }))
        ]);

        return {
          subject: target.character, // Chữ Hán HOÀN TOÀN ĐỘC LẬP
          subText: undefined,
          promptText: 'Từ vựng nào trong bài sử dụng chữ Hán trên?',
          correctKanji: target,
          audioWord: chosen.hiragana,
          correctAnswerText: targetAns,
          options,
          direction: 'kanji-to-vocab'
        };
      }
      // If no linked vocab found, fall back to kanji-to-meaning
      dir = 'kanji-to-meaning';
    }

    // 2. Dạng Từ vựng Hiragana ➔ Chọn Chữ Hán độc lập
    if (dir === 'vocab-to-kanji') {
      const linked = getLinkedVocabForKanji(target.character, vocabItems, kanjiItems);
      if (linked.length > 0) {
        const chosen = linked[Math.floor(Math.random() * linked.length)];
        const targetAns = target.character;
        const options = shuffleArray([
          { text: targetAns, isCorrect: true },
          ...distractors.map(d => ({
            text: d.character, // Chữ Hán độc lập
            isCorrect: false
          }))
        ]);

        return {
          subject: chosen.hiragana,
          subText: chosen.meaning,
          promptText: 'Chữ Hán nào xuất hiện trong từ vựng trên?',
          correctKanji: target,
          audioWord: chosen.hiragana,
          correctAnswerText: targetAns,
          options,
          direction: 'vocab-to-kanji'
        };
      }
      // If no linked vocab found, fall back to meaning-to-kanji
      dir = 'meaning-to-kanji';
    }

    if (dir === 'kanji-to-meaning') {
      const targetAns = `${target.sino_vietnamese ? target.sino_vietnamese + ': ' : ''}${target.vietnamese_meaning}`.trim();
      const options = shuffleArray([
        { text: targetAns, isCorrect: true },
        ...distractors.map(d => ({
          text: `${d.sino_vietnamese ? d.sino_vietnamese + ': ' : ''}${d.vietnamese_meaning}`.trim(),
          isCorrect: false
        }))
      ]);

      return {
        subject: target.character, // Chữ Hán HOÀN TOÀN ĐỘC LẬP
        subText: undefined,
        promptText: 'Chọn Nghĩa đúng cho chữ Hán:',
        correctKanji: target,
        correctAnswerText: targetAns,
        options,
        direction: dir
      };
    } else {
      const targetAns = target.character;
      const options = shuffleArray([
        { text: targetAns, isCorrect: true },
        ...distractors.map(d => ({
          text: d.character, // Chữ Hán HOÀN TOÀN ĐỘC LẬP
          isCorrect: false
        }))
      ]);

      return {
        subject: target.vietnamese_meaning,
        subText: undefined, // Không mớm âm Hán
        promptText: 'Chọn Chữ Hán đúng cho Nghĩa:',
        correctKanji: target,
        correctAnswerText: targetAns,
        options,
        direction: dir
      };
    }
  }, [eligibleKanji, speedrunDirection, vocabItems, kanjiItems, quizQuestions]);

  // Start Speedrun Game
  const startSpeedrun = () => {
    setSpeedrunActive(true);
    setSpeedrunGameOver(false);
    setSpeedrunScore(0);
    speedrunScoreRef.current = 0;
    setSpeedrunStreak(0);
    setSpeedrunMaxStreak(0);
    setSpeedrunWrongList([]);
    const initialTime = 20;
    speedrunMaxTimeRef.current = initialTime;
    setSpeedrunMaxTime(initialTime);
    setSpeedrunTimeLeft(initialTime);

    const firstQ = generateSpeedrunQuestion();
    setCurrentSpeedrunQ(firstQ);
  };

  // Speedrun Countdown Timer (High-precision Date.now() timer at 50ms interval, same as vocab)
  useEffect(() => {
    if (!speedrunActive || speedrunGameOver || !currentSpeedrunQ) {
      if (speedrunTimerRef.current) clearInterval(speedrunTimerRef.current);
      return;
    }

    const maxTime = speedrunMaxTimeRef.current || 20;
    const startTime = Date.now();

    speedrunTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, maxTime - elapsed);
      setSpeedrunTimeLeft(remaining);

      if (remaining <= 0) {
        if (speedrunTimerRef.current) clearInterval(speedrunTimerRef.current);
        setSpeedrunActive(false);
        setSpeedrunGameOver(true);
        if (currentSpeedrunQ) {
          setSpeedrunWrongList(list => [...list, currentSpeedrunQ.correctKanji]);
        }
      }
    }, 50);

    return () => {
      if (speedrunTimerRef.current) clearInterval(speedrunTimerRef.current);
    };
  }, [speedrunActive, speedrunGameOver, currentSpeedrunQ]);

  // Answer handling in Speedrun
  const handleSpeedrunAnswer = (opt: { text: string; isCorrect: boolean }) => {
    if (!speedrunActive || !currentSpeedrunQ) return;

    if (speedrunTimerRef.current) {
      clearInterval(speedrunTimerRef.current);
    }

    if (opt.isCorrect) {
      // Audio cue (plays vocab audio if available, else kanji audio)
      const audioToPlay = currentSpeedrunQ.audioWord || currentSpeedrunQ.correctKanji.character;
      handlePlayAudio(audioToPlay, currentSpeedrunQ.audioWord || currentSpeedrunQ.correctKanji.kunyomi || currentSpeedrunQ.correctKanji.character);

      // Score calculation: 10 base + streak bonus
      const bonus = Math.min(speedrunStreak * 2, 20);
      const points = 10 + bonus;
      const newScore = speedrunScoreRef.current + points;
      speedrunScoreRef.current = newScore;
      setSpeedrunScore(newScore);

      const nextStreak = speedrunStreak + 1;
      setSpeedrunStreak(nextStreak);
      setSpeedrunMaxStreak(m => Math.max(m, nextStreak));

      // Dynamic time for next question (vocab style reduction)
      const nextTime = getDynamicTimeForStreak(nextStreak);
      speedrunMaxTimeRef.current = nextTime;
      setSpeedrunMaxTime(nextTime);
      setSpeedrunTimeLeft(nextTime);

      // Save high score
      if (newScore > speedrunHighScore) {
        setSpeedrunHighScore(newScore);
        try {
          localStorage.setItem(`kanji_speedrun_high_${selectedLessonId}`, newScore.toString());
        } catch (e) {
          // ignore
        }
      }

      // Next question
      const nextQ = generateSpeedrunQuestion();
      setCurrentSpeedrunQ(nextQ);
    } else {
      // Wrong choice -> Game Over
      setSpeedrunActive(false);
      setSpeedrunGameOver(true);
      setSpeedrunWrongList(list => [...list, currentSpeedrunQ.correctKanji]);
    }
  };

  // =========================================================================
  // 2. TÍNH NĂNG 2: TẬP VIẾT AI RA ĐỀ & HỌC VIÊN TỰ VẼ ĐÁP ÁN
  // =========================================================================
  // 2. TÍNH NĂNG 2: TẬP VIẾT KANJI (ĐA DẠNG CÂU HỎI & HIỆN ĐÁP ÁN ĐỐI CHIẾU)
  // =========================================================================
  const [riddles, setRiddles] = useState<KanjiWritingRiddle[]>([]);
  const [isLoadingRiddles, setIsLoadingRiddles] = useState<boolean>(false);
  const [riddleIndex, setRiddleIndex] = useState<number>(0);
  const [showRiddleHint, setShowRiddleHint] = useState<boolean>(false);
  const [showGhostGuide, setShowGhostGuide] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [userEvaluations, setUserEvaluations] = useState<Record<number, 'correct' | 'wrong'>>({});
  const [isRiddleFinished, setIsRiddleFinished] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Array<Array<{ x: number; y: number }>>>([]);
  const currentStrokeRef = useRef<Array<{ x: number; y: number }>>([]);

  // Fetch AI Riddles when entering tab or changing lesson/filter
  useEffect(() => {
    if (activeTab !== 'ai_writing' || eligibleKanji.length === 0) return;

    let isMounted = true;
    setIsLoadingRiddles(true);

    fetchKanjiWritingRiddles(selectedLessonId, eligibleKanji, false, vocabItems)
      .then(fetchedRiddles => {
        if (!isMounted) return;
        setRiddles(shuffleArray(fetchedRiddles));
        setRiddleIndex(0);
        setShowRiddleHint(false);
        setShowGhostGuide(false);
        setIsAnswerRevealed(false);
        setUserEvaluations({});
        setIsRiddleFinished(false);
      })
      .finally(() => {
        if (isMounted) setIsLoadingRiddles(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, selectedLessonId, eligibleKanji, vocabItems]);

  // Xáo trộn ngẫu nhiên toàn bộ danh sách câu đố AI
  const handleShuffleRiddles = () => {
    if (riddles.length <= 1) return;
    setRiddles(shuffleArray(riddles));
    setRiddleIndex(0);
    setShowRiddleHint(false);
    setShowGhostGuide(false);
    setIsAnswerRevealed(false);
    setUserEvaluations({});
  };

  // Yêu cầu AI sinh bộ câu đố mới hoàn toàn (bỏ qua cache)
  const loadFreshRiddles = async () => {
    if (eligibleKanji.length === 0) return;
    setIsLoadingRiddles(true);
    try {
      const freshRiddles = await fetchKanjiWritingRiddles(selectedLessonId, eligibleKanji, true, vocabItems);
      setRiddles(shuffleArray(freshRiddles));
      setRiddleIndex(0);
      setShowRiddleHint(false);
      setShowGhostGuide(false);
      setIsAnswerRevealed(false);
      setUserEvaluations({});
      setIsRiddleFinished(false);
    } finally {
      setIsLoadingRiddles(false);
    }
  };

  const currentRiddle = riddles[riddleIndex] || null;

  // Matching Kanji item for current riddle
  const currentRiddleKanji = useMemo(() => {
    if (!currentRiddle) return null;
    return eligibleKanji.find(k => k.character === currentRiddle.target_character) || null;
  }, [currentRiddle, eligibleKanji]);

  // Replay user's strokes on canvas
  const renderStrokes = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2dd4bf'; // Teal-400
    ctx.setLineDash([]);
    for (const stroke of strokesRef.current) {
      if (stroke.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    }
  }, []);

  // Tian Zi Ge Grid Painter
  const drawGridAndGuide = useCallback((targetChar?: string, ghostVisible = false, preserveStrokes = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const h = canvas.height;

    // Dark canvas background
    ctx.fillStyle = '#090d1f';
    ctx.fillRect(0, 0, w, h);

    // Outer boundary
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(1, 1, w - 2, h - 2);

    // Inner dashed crosslines (Tian Zi Ge)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);

    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();

    // Subtle diagonal dashed guides
    ctx.strokeStyle = '#151d2f';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, h);
    ctx.moveTo(w, 0);
    ctx.lineTo(0, h);
    ctx.stroke();

    ctx.setLineDash([]);

    // Ghost template guide (if user requested peek)
    if (ghostVisible && targetChar) {
      ctx.fillStyle = 'rgba(45, 212, 191, 0.22)';
      ctx.font = '900 150px "Noto Sans JP", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(targetChar, w / 2, h / 2 + 5);
    }

    // Replay user's drawing if requested
    if (preserveStrokes) {
      renderStrokes(ctx);
    }
  }, [renderStrokes]);

  // Reset strokes and initialize canvas on riddle change
  useEffect(() => {
    if (activeTab === 'ai_writing' && currentRiddle) {
      strokesRef.current = [];
      currentStrokeRef.current = [];
      setHasDrawn(false);
      const t = setTimeout(() => {
        drawGridAndGuide(currentRiddle.target_character, showGhostGuide, false);
        const existing = userEvaluations[riddleIndex];
        setIsAnswerRevealed(!!existing);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [activeTab, riddleIndex, currentRiddle?.target_character, drawGridAndGuide]);

  // Re-draw grid and guide when ghost guide is toggled while PRESERVING existing strokes
  useEffect(() => {
    if (activeTab === 'ai_writing' && currentRiddle) {
      drawGridAndGuide(currentRiddle.target_character, showGhostGuide, true);
    }
  }, [showGhostGuide, drawGridAndGuide, activeTab, currentRiddle]);

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2dd4bf'; // Teal-400
    ctx.setLineDash([]);

    let x = 0;
    let y = 0;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    currentStrokeRef.current = [{ x, y }];
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const drawStroke = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x = 0;
    let y = 0;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    currentStrokeRef.current.push({ x, y });
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (currentStrokeRef.current.length > 0) {
      strokesRef.current.push([...currentStrokeRef.current]);
      currentStrokeRef.current = [];
    }
  };

  const clearCanvas = () => {
    if (!currentRiddle) return;
    strokesRef.current = [];
    currentStrokeRef.current = [];
    drawGridAndGuide(currentRiddle.target_character, showGhostGuide, false);
    setHasDrawn(false);
    setIsAnswerRevealed(false);
  };

  // Hiện đáp án đúng tức thì, lồng chữ mẫu lên canvas và phát âm thanh
  const handleRevealAnswer = () => {
    if (!currentRiddle) return;
    setIsAnswerRevealed(true);
    setShowGhostGuide(true);
    handlePlayAudio(
      currentRiddle.target_character,
      currentRiddleKanji?.kunyomi || currentRiddle.target_character
    );
  };

  const handleSelfEvaluate = (status: 'correct' | 'wrong') => {
    setUserEvaluations(prev => ({ ...prev, [riddleIndex]: status }));
  };

  // Navigate riddles
  const handleNextRiddle = () => {
    if (riddleIndex + 1 < riddles.length) {
      setRiddleIndex(prev => prev + 1);
      setShowRiddleHint(false);
      setShowGhostGuide(false);
      setIsAnswerRevealed(false);
    } else {
      setIsRiddleFinished(true);
    }
  };

  const handlePrevRiddle = () => {
    if (riddleIndex > 0) {
      setRiddleIndex(prev => prev - 1);
      setShowRiddleHint(false);
      setShowGhostGuide(false);
      setIsAnswerRevealed(false);
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
                Luyện phản xạ nhanh giảm thời gian và Tập viết đố chữ AI.
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

        {/* 2 Trọng tâm: Mode Switcher & Status Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Main 3 Tab Switcher */}
          <div className="w-full sm:w-auto grid grid-cols-3 sm:flex bg-slate-100 dark:bg-slate-950/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-inner gap-1">
            <button
              onClick={() => {
                setActiveTab('recognition');
                setSpeedrunActive(false);
                setSpeedrunGameOver(false);
              }}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'recognition'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>🎯</span>
              <span className="hidden sm:inline">Nhận diện mặt chữ</span>
              <span className="sm:hidden">Nhận diện</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('speedrun');
                setSpeedrunActive(false);
                setSpeedrunGameOver(false);
              }}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'speedrun'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>⚡</span>
              <span className="hidden sm:inline">Luyện phản xạ</span>
              <span className="sm:hidden">Phản xạ</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('ai_writing');
                setSpeedrunActive(false);
                setSpeedrunGameOver(false);
              }}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'ai_writing'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>✍️</span>
              <span className="hidden sm:inline">Tập viết AI</span>
              <span className="sm:hidden">Tập viết</span>
            </button>
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
      {/* 0. TAB 0: NHẬN DIỆN MẶT CHỮ & TỪ VỰNG THỰC CHIẾN (100% TIẾNG NHẬT)         */}
      {/* ========================================================================= */}
      {activeTab === 'recognition' && (
        <div className="space-y-6">
          {isLoadingQuiz ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <span className="text-4xl animate-spin inline-block">🤖</span>
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  AI đang chuẩn bị bộ câu hỏi nhận diện mặt chữ & hội thoại tự nhiên...
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Đề bài viết 100% bằng tiếng Nhật thuần túy, kích thích ghi nhớ mặt chữ trực quan.
                </p>
              </div>
            </div>
          ) : quizQuestions.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <span className="text-4xl">📭</span>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Không có câu hỏi nhận diện cho nhóm chữ Hán này.
              </p>
              <button
                type="button"
                onClick={loadFreshQuiz}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                ✨ AI Thử tạo lại bộ đề
              </button>
            </div>
          ) : isQuizFinished ? (
            /* Summary Screen */
            <div className="p-6 sm:p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center text-4xl shadow-md">
                🎉
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  HOÀN THÀNH BÀI ÔN NHẬN DIỆN!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bạn đã hoàn thành thử thách nhận diện {quizQuestions.length} tình huống chữ Hán trong bài.
                </p>
              </div>

              {/* Scorecard */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">SỐ CÂU ĐÚNG</span>
                  <span className="text-3xl font-black text-emerald-500">
                    {quizScore} <span className="text-base text-slate-400 font-semibold">/ {quizQuestions.length}</span>
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">TỶ LỆ CHÍNH XÁC</span>
                  <span className="text-3xl font-black text-blue-500">
                    {Math.round((quizScore / quizQuestions.length) * 100)}%
                  </span>
                </div>
              </div>

              {/* Performance Label */}
              <div className={`p-2.5 rounded-xl text-xs font-black border ${
                quizScore === quizQuestions.length
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  : quizScore >= quizQuestions.length * 0.7
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
              }`}>
                {quizScore === quizQuestions.length
                  ? '🌟 Xuất sắc! Bạn đã nhận diện chính xác 100% các mặt chữ và từ vựng.'
                  : quizScore >= quizQuestions.length * 0.7
                  ? '👏 Rất tốt! Bạn đã nắm vững hầu hết các từ vựng chữ Hán trong bài.'
                  : '💪 Cần rèn thêm! Hãy xem lại danh sách từ vựng bên dưới và luyện tập lại.'}
              </div>

              {/* Missed questions review */}
              {quizWrongList.length > 0 && (
                <div className="text-left space-y-2 bg-rose-500/5 p-4 rounded-2xl border border-rose-500/20">
                  <span className="text-xs font-bold text-rose-500 block">
                    Từ vựng / Chữ Hán cần chú ý ôn lại ({quizWrongList.length} câu):
                  </span>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                    {quizWrongList.map((q, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-500/20 text-xs flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-black text-rose-500 font-['Noto_Sans_JP'] text-base shrink-0">
                            {q.target_kanji}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-100 truncate font-['Noto_Sans_JP']">
                            {q.target_word}
                          </span>
                          {q.target_word_reading && (
                            <span className="text-slate-400 text-[11px] truncate shrink-0">
                              ({q.target_word_reading})
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0 text-right">
                          {q.target_word_meaning || '-'}
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
                  onClick={loadFreshQuiz}
                  disabled={isLoadingQuiz}
                  className="py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-blue-500/20 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span>✨</span>
                  <span>AI Tạo bộ đề mới</span>
                </button>

                {quizWrongList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRetryWrongQuestions}
                    className="py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <span>↺</span>
                    <span>Luyện lại câu sai ({quizWrongList.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setQuizQuestions(shuffleArray(quizQuestions));
                    setQuizIndex(0);
                    setSelectedOptionIdx(null);
                    setIsQuizSubmitted(false);
                    setQuizScore(0);
                    setUserQuizAnswers({});
                    setIsQuizFinished(false);
                    setQuizWrongList([]);
                  }}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  🔀 Làm lại bộ đề này
                </button>
              </div>
            </div>
          ) : currentQuizQ && (
            /* Active Question Screen */
            <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-200">
              {/* Question Header Tool Bar */}
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-black text-xs">
                    Câu {quizIndex + 1} / {quizQuestions.length}
                  </span>

                  {/* Badge dạng câu hỏi */}
                  {(() => {
                    const badgeMap: Record<string, { label: string; cls: string }> = {
                      dialogue_fill: { label: '💬 会話・Điền hội thoại', cls: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
                      reading_in_context: { label: '📖 読み方・Cách đọc', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                      kanji_orthography: { label: '🔤 漢字・Chọn chữ Hán', cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
                      word_formation: { label: '🧩 熟語・Ghép từ', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                      meaning_choice: { label: '💡 意味・Ý nghĩa', cls: 'bg-teal-500/10 text-teal-400 border-teal-500/20' }
                    };
                    const b = badgeMap[currentQuizQ.question_type || ''] || badgeMap.dialogue_fill;
                    return (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.cls}`}>
                        {b.label}
                      </span>
                    );
                  })()}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={loadFreshQuiz}
                    disabled={isLoadingQuiz}
                    className="py-1 px-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 disabled:opacity-50"
                    title="Yêu cầu AI tạo bộ câu hỏi tình huống mới hoàn toàn"
                  >
                    <span>✨</span>
                    <span className="hidden sm:inline">Đổi đề mới</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShuffleQuiz}
                    className="py-1 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                    title="Xáo trộn câu hỏi"
                  >
                    <span>🔀</span>
                    <span className="hidden sm:inline">Tráo câu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const audioWord = currentQuizQ.target_word || currentQuizQ.target_kanji;
                      handlePlayAudio(audioWord, currentQuizQ.target_word_reading || audioWord);
                    }}
                    className="p-1.5 px-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 text-xs font-bold transition-colors cursor-pointer active:scale-95"
                    title="Nghe phát âm chuẩn"
                  >
                    🔊
                  </button>
                </div>
              </div>

              {/* Question Text Box (100% Japanese immersion - pure character recognition) */}
              <div className="p-5 sm:p-7 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl shadow-md space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                  <span>NHẬN DIỆN MẶT CHỮ (日本語)</span>
                  <span className="font-['Noto_Sans_JP'] text-blue-500 font-black">
                    漢字: {currentQuizQ.target_kanji}
                  </span>
                </div>

                <div className="font-['Noto_Sans_JP'] text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-line py-1">
                  {currentQuizQ.question_text}
                </div>
              </div>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {currentQuizQ.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx); // A, B, C, D
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
                        <span className="font-['Noto_Sans_JP'] text-base sm:text-lg font-bold truncate">
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

              {/* Post-Answer Feedback Card (Hiển thị giải thích chi tiết bằng tiếng Việt) */}
              {isQuizSubmitted && (
                <div className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-lg space-y-3 animate-in fade-in duration-150 border-blue-500/30">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black flex items-center gap-1.5 ${
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
                        className="py-1 px-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>🔊 Phát âm</span>
                      </button>
                    </div>
                  </div>

                  {/* Target Word Breakdown */}
                  <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-bold">Từ vựng:</span>
                      <span className="font-['Noto_Sans_JP'] font-black text-blue-500 text-sm">
                        {currentQuizQ.target_word}
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
                    <span className="text-slate-400 text-[11px] ml-auto">
                      Kanji: <b className="font-['Noto_Sans_JP'] text-slate-700 dark:text-slate-200">{currentQuizQ.target_kanji}</b>
                    </span>
                  </div>

                  {/* Detailed Explanation */}
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-200 block">💡 Giải thích từ vựng & ngữ cảnh:</span>
                    <p className="bg-slate-50/50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      {currentQuizQ.explanation}
                    </p>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handlePrevQuizQuestion}
                      disabled={quizIndex === 0}
                      className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                    >
                      ← Câu trước
                    </button>

                    <button
                      type="button"
                      onClick={handleNextQuizQuestion}
                      className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{quizIndex + 1 < quizQuestions.length ? 'Câu tiếp theo ➔' : 'Xem tổng kết ➔'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TAB 1: SPEEDRUN LUYỆN PHẢN XẠ (GIẢM THỜI GIAN & CHUYỂN ĐỔI 2 CHIỀU)     */}
      {/* ========================================================================= */}
      {activeTab === 'speedrun' && (
        <div className="space-y-6">
          {!speedrunActive && !speedrunGameOver && (
            <div className="p-4 sm:p-8 lg:p-12 text-center bg-white dark:bg-slate-900/60 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-amber-500/20 text-white animate-bounce">
                ⚡
              </div>

              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100">
                  Thử Thách Phản Xạ Kanji Siêu Tốc
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                  Tương tự luyện phản xạ từ vựng: Thời gian sẽ <b>giảm dần khi streak tăng</b> (mỗi 3 câu đúng giảm 10%).
                  Chữ Hán hiển thị độc lập, kích thích phản xạ gắn kết trực tiếp với từ vựng bài học!
                </p>
              </div>

              {/* Chuyển đổi chiều phản xạ */}
              <div className="space-y-2 text-left bg-slate-50 dark:bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Chiều câu hỏi phản xạ:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSpeedrunDirection('kanji-to-meaning')}
                    className={`py-2 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center truncate ${
                      speedrunDirection === 'kanji-to-meaning'
                        ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    🇯🇵 ➔ 🇻🇳 Kanji ➔ Nghĩa
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeedrunDirection('meaning-to-kanji')}
                    className={`py-2 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center truncate ${
                      speedrunDirection === 'meaning-to-kanji'
                        ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    🇻🇳 ➔ 🇯🇵 Nghĩa ➔ Kanji
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeedrunDirection('kanji-vocab')}
                    className={`py-2 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center truncate ${
                      speedrunDirection === 'kanji-vocab'
                        ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    📖 Kanji ⟷ Từ vựng
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeedrunDirection('both')}
                    className={`py-2 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center truncate ${
                      speedrunDirection === 'both'
                        ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    🔄 Toàn diện
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
                  onClick={startSpeedrun}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white font-black text-sm shadow-lg shadow-rose-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🚀 BẮT ĐẦU SPEEDRUN</span>
                </button>
              </div>
            </div>
          )}

          {/* Speedrun Playing Interface */}
          {speedrunActive && currentSpeedrunQ && (
            <div className="max-w-xl mx-auto space-y-4 animate-in fade-in duration-200">
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
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-extrabold text-xs uppercase tracking-wider">
                  <span>⏱️</span>
                  <span>Thời gian</span>
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
              <div className="p-8 text-center bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  {currentSpeedrunQ.promptText || 'Chọn đáp án đúng:'}
                </div>

                <div className={`font-black font-['Noto_Sans_JP'] text-slate-900 dark:text-white ${
                  currentSpeedrunQ.direction === 'kanji-to-meaning' || currentSpeedrunQ.direction === 'kanji-to-vocab'
                    ? 'text-7xl sm:text-8xl py-2'
                    : 'text-3xl sm:text-4xl py-3'
                }`}>
                  {currentSpeedrunQ.subject}
                </div>

                {currentSpeedrunQ.subText && (
                  <div className="text-sm font-bold text-blue-500">
                    {currentSpeedrunQ.subText}
                  </div>
                )}
              </div>

              {/* 4 Speedrun Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentSpeedrunQ.options.map((opt, idx) => {
                  const isSingleKanji = opt.text.length <= 2 && /[\u4e00-\u9faf]/.test(opt.text);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSpeedrunAnswer(opt)}
                      className={`p-4 rounded-2xl border-2 font-bold text-center transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 ${
                        isSingleKanji
                          ? 'text-3xl sm:text-4xl font-black font-[\'Noto_Sans_JP\'] py-5'
                          : 'text-xs sm:text-sm py-4 px-4 text-left sm:text-center'
                      } bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-400 text-slate-800 dark:text-slate-100 hover:bg-amber-500/5`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Speedrun Game Over Screen */}
          {speedrunGameOver && (
            <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg mx-auto space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center text-4xl">
                💥
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  LƯỢT CHƠI KẾT THÚC!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {speedrunTimeLeft <= 0.05 ? 'Bạn đã hết thời gian phản xạ!' : 'Bạn đã chọn sai đáp án!'}
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

              {/* High Score Celebration */}
              {speedrunScore >= speedrunHighScore && speedrunScore > 0 && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-black">
                  🎉 KỶ LỤC MỚI CỦA BẠN!
                </div>
              )}

              {/* List of wrong kanji review */}
              {speedrunWrongList.length > 0 && (
                <div className="text-left space-y-2 bg-rose-500/5 p-3 rounded-xl border border-rose-500/20">
                  <span className="text-xs font-bold text-rose-500 block">Chữ Hán cần chú ý ôn lại:</span>
                  <div className="flex flex-wrap gap-2">
                    {speedrunWrongList.map((k, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 font-bold text-xs border border-rose-500/20">
                        {k.character} ({k.sino_vietnamese}: {k.vietnamese_meaning})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={startSpeedrun}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  ⚡ Chơi lại ngay
                </button>
                <button
                  type="button"
                  onClick={() => setSpeedrunGameOver(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Đổi cài đặt
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB 2: TẬP VIẾT AI RA ĐỀ & HỌC VIÊN TỰ VẼ ĐÁP ÁN (GEMINI VISION)       */}
      {/* ========================================================================= */}
      {activeTab === 'ai_writing' && (
        <div className="space-y-6">
          {isLoadingRiddles ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-4xl animate-spin inline-block">🤖</span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                AI đang chuẩn bị bộ câu hỏi tập viết thực chiến mới...
              </p>
            </div>
          ) : riddles.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-4xl">📭</span>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Không tìm thấy câu hỏi tập viết cho bài học này.
              </p>
            </div>
          ) : isRiddleFinished ? (
            /* Summary screen */
            <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl mx-auto space-y-6">
              <span className="text-5xl">🎉</span>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  HOÀN THÀNH TẬP VIẾT KANJI!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bạn đã hoàn thành thử thách suy luận và vẽ nét toàn bộ {riddles.length} chữ Hán trong bài.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Kết quả tự đối chiếu nét vẽ của bạn:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {riddles.map((r, i) => {
                    const evalItem = userEvaluations[i];
                    return (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="font-bold font-['Noto_Sans_JP'] text-base text-teal-400">
                          {r.target_character}
                        </span>
                        <span className="text-slate-400 text-[11px]">{r.sino_vietnamese}</span>
                        <span className={`font-black text-xs ${
                          evalItem === 'correct' 
                            ? 'text-emerald-400' 
                            : evalItem === 'wrong'
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}>
                          {evalItem === 'correct' ? '✓ Viết đúng' : evalItem === 'wrong' ? '↺ Cần luyện' : 'Chưa đánh giá'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={loadFreshRiddles}
                  disabled={isLoadingRiddles}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-teal-500/20 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span>✨</span>
                  <span>AI Tạo bộ đề mới & Luyện tập</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRiddles(shuffleArray(riddles));
                    setIsRiddleFinished(false);
                    setRiddleIndex(0);
                    setShowRiddleHint(false);
                    setShowGhostGuide(false);
                    setIsAnswerRevealed(false);
                    setUserEvaluations({});
                  }}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  🔀 Tráo lại bộ đề này
                </button>
              </div>
            </div>
          ) : currentRiddle && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Riddle Question Header */}
              <div className="p-4 sm:p-6 bg-gradient-to-br from-teal-950/40 via-slate-900 to-slate-900 border-2 border-teal-500/30 rounded-2xl sm:rounded-3xl shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl">✍️</span>
                    <span className="text-xs font-black text-teal-400 uppercase tracking-wider">
                      Câu {riddleIndex + 1} / {riddles.length}
                    </span>
                    {/* Badge loại câu hỏi */}
                    {(() => {
                      const badgeMap: Record<string, { label: string; cls: string }> = {
                        vocab_context: { label: '📚 Từ vựng trong bài', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                        compound_fill: { label: '🧩 Điền từ ghép khuyết', cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
                        situational: { label: '💡 Ngữ cảnh đối tượng', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                        sino_meaning: { label: '🎯 Hán Việt & Nghĩa', cls: 'bg-teal-500/10 text-teal-400 border-teal-500/20' }
                      };
                      const b = badgeMap[currentRiddle.question_type || ''] || badgeMap.sino_meaning;
                      return (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.cls}`}>
                          {b.label}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={loadFreshRiddles}
                      disabled={isLoadingRiddles}
                      className="py-1 px-2.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 disabled:opacity-50"
                      title="Yêu cầu AI sinh bộ câu đố mới hoàn toàn"
                    >
                      <span>✨</span>
                      <span className="hidden sm:inline">Tạo đề mới</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShuffleRiddles}
                      className="py-1 px-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                      title="Xáo trộn ngẫu nhiên thứ tự câu đố"
                    >
                      <span>🔀</span>
                      <span className="hidden sm:inline">Xáo trộn</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRiddleHint(!showRiddleHint)}
                      className="text-xs font-bold text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>💡 {showRiddleHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}</span>
                    </button>
                  </div>
                </div>

                {/* Riddle Text - No reveal of target Kanji */}
                <p className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">
                  "{currentRiddle.riddle_question}"
                </p>

                {/* Hint Box */}
                {showRiddleHint && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1 animate-in fade-in duration-150">
                    <div className="font-bold flex items-center gap-1">
                      <span>💡 Gợi ý:</span>
                      <span>{currentRiddle.hint}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Tian Zi Ge Canvas Drawing Board */}
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center justify-between w-full max-w-[340px]">
                  <span className="text-xs font-bold text-slate-400">
                    Bảng vẽ ô chữ điền (Tian Zi Ge):
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowGhostGuide(!showGhostGuide)}
                    className="text-[11px] font-bold text-teal-400 hover:underline cursor-pointer"
                  >
                    {showGhostGuide ? '👁️ Ẩn chữ mẫu' : '👁️ Xem chữ mẫu'}
                  </button>
                </div>

                <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-[#090d1f] touch-none">
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={320}
                    onMouseDown={startDrawing}
                    onMouseMove={drawStroke}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={drawStroke}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full cursor-crosshair"
                  />
                </div>

                {/* Canvas Controls */}
                <div className="flex items-center gap-2.5 w-full max-w-[340px]">
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>🗑️</span>
                    <span>Vẽ lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRevealAnswer}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>👁️</span>
                    <span>{isAnswerRevealed ? 'Đã hiện đáp án' : 'Xem đáp án & Đối chiếu'}</span>
                  </button>
                </div>

                {/* Revealed Answer Card & Self-Evaluation Display */}
                {isAnswerRevealed && (
                  <div className="w-full max-w-[340px] p-4 rounded-2xl border border-teal-500/40 bg-teal-950/40 text-slate-100 space-y-3 animate-in fade-in duration-150 shadow-lg backdrop-blur-md">
                    <div className="flex items-center justify-between pb-2 border-b border-teal-500/20">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl font-black font-['Noto_Sans_JP'] text-teal-300 leading-none">
                          {currentRiddle.target_character}
                        </span>
                        <div>
                          <span className="text-sm font-black text-amber-400 block">
                            {currentRiddle.sino_vietnamese}
                          </span>
                          <span className="text-xs text-slate-300 font-medium">
                            {currentRiddle.meaning}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePlayAudio(currentRiddle.target_character, currentRiddleKanji?.kunyomi || currentRiddle.target_character)}
                        className="p-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-sm transition-colors cursor-pointer active:scale-95"
                        title="Nghe phát âm chuẩn"
                      >
                        🔊
                      </button>
                    </div>

                    {/* Readings info */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <span className="text-purple-400 font-bold block">Âm On (Onyomi):</span>
                        <span className="text-slate-200 font-medium">{currentRiddleKanji?.onyomi || '-'}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-emerald-400 font-bold block">Âm Kun (Kunyomi):</span>
                        <span className="text-slate-200 font-medium">{currentRiddleKanji?.kunyomi || '-'}</span>
                      </div>
                    </div>

                    {/* Related Compounds / Vocab if any */}
                    {currentRiddleKanji?.compounds && (
                      <div className="text-[11px] bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 font-bold block mb-1">Từ ghép trong bài:</span>
                        <span className="text-slate-300 leading-tight block">
                          {currentRiddleKanji.compounds.split(';').slice(0, 2).join(' • ')}
                        </span>
                      </div>
                    )}

                    {/* Self Evaluation Buttons */}
                    <div className="pt-2 border-t border-teal-500/20 space-y-2">
                      <span className="text-[11px] text-slate-300 block font-medium">
                        👉 Đối chiếu với chữ mẫu mờ trên ô Canvas:
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelfEvaluate('correct')}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 ${
                            userEvaluations[riddleIndex] === 'correct'
                              ? 'bg-emerald-500 text-white shadow-md'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          <span>✓</span>
                          <span>Tôi đã viết đúng</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelfEvaluate('wrong')}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 ${
                            userEvaluations[riddleIndex] === 'wrong'
                              ? 'bg-rose-500 text-white shadow-md'
                              : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          <span>↺</span>
                          <span>Cần luyện lại</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons for Riddles */}
                <div className="flex items-center justify-between w-full max-w-[340px] pt-2">
                  <button
                    type="button"
                    onClick={handlePrevRiddle}
                    disabled={riddleIndex === 0}
                    className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                  >
                    ← Câu trước
                  </button>

                  <button
                    type="button"
                    onClick={handleNextRiddle}
                    className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <span>{riddleIndex + 1 < riddles.length ? 'Câu tiếp theo ➔' : 'Xem tổng kết ➔'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
