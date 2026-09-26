'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  KanjiItemData,
  KanjiQuestionType,
  KanjiPracticeQuestion,
  generateKanjiPracticeQuestions,
  gradeKanjiWritten,
  parseCompounds,
  COMMON_KANJI_DISTRACTORS
} from '../../../utils/kanjiPracticeHelper';
import { getRadicalsString } from '../../../utils/kanjiRadicals';
import { playAudioWithFallback } from '../../../utils/audioHelper';

interface KanjiPracticeTabProps {
  kanjiItems: KanjiItemData[];
  selectedLessonId: number;
  lessonTitle: string;
  onUpdateKanjiStatus?: (id: number, status: 'not_learned' | 'learning' | 'mastered') => void;
  onBackToVocabPractice?: () => void;
}

export default function KanjiPracticeTab({
  kanjiItems,
  selectedLessonId,
  lessonTitle,
  onUpdateKanjiStatus,
  onBackToVocabPractice
}: KanjiPracticeTabProps) {
  // Mode: choice (Trắc nghiệm), written (Tự luận), draw (Tập viết Canvas), speedrun (Phản xạ 10s)
  const [practiceMode, setPracticeMode] = useState<'choice' | 'written' | 'draw' | 'speedrun'>('choice');
  // Direction: 'kanji-to-meaning' (Chữ Hán ➔ Nghĩa), 'meaning-to-kanji' (Nghĩa ➔ Chữ Hán), 'both' (Song song)
  const [practiceDirection, setPracticeDirection] = useState<'kanji-to-meaning' | 'meaning-to-kanji' | 'both'>('both');
  const [isQuestionFlipped, setIsQuestionFlipped] = useState<boolean>(false);
  const [questionLimit, setQuestionLimit] = useState<number | ''>(10);
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_learned' | 'learning' | 'mastered'>('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState<boolean>(false);

  // Filtered Kanji based on status
  const eligibleKanji = useMemo(() => {
    if (statusFilter === 'all') return kanjiItems;
    return kanjiItems.filter(k => (k.status || 'not_learned') === statusFilter);
  }, [kanjiItems, statusFilter]);

  // Choice & Written practice state
  const [questions, setQuestions] = useState<KanjiPracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<Record<number, boolean>>({});
  const [results, setResults] = useState<Record<number, { isCorrect: boolean; feedback: string; score: number }>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Written mode specific state
  const [writtenInput, setWrittenInput] = useState<string>('');
  const writtenInputRef = useRef<HTMLInputElement>(null);

  // Draw mode specific state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [showGhostGuide, setShowGhostGuide] = useState<boolean>(true);
  const [drawIndex, setDrawIndex] = useState<number>(0);
  const [drawResult, setDrawResult] = useState<{
    score: number;
    is_correct: boolean;
    status: 'excellent' | 'acceptable' | 'needs_improvement' | 'incorrect';
    status_label: string;
    feedback: string;
  } | null>(null);
  const [drawEvaluated, setDrawEvaluated] = useState<Record<number, {
    score: number;
    is_correct: boolean;
    status_label: string;
    feedback: string;
  }>>({});
  const [isDrawFinished, setIsDrawFinished] = useState<boolean>(false);

  // Derived list of Kanji for drawing
  const drawKanjiList = useMemo(() => {
    const limitNum = typeof questionLimit === 'number' ? questionLimit : eligibleKanji.length;
    return eligibleKanji.slice(0, Math.min(limitNum, eligibleKanji.length));
  }, [eligibleKanji, questionLimit]);

  const currentDrawKanji = drawKanjiList[drawIndex] || null;

  // Speedrun mode state
  const [speedrunActive, setSpeedrunActive] = useState<boolean>(false);
  const [speedrunGameOver, setSpeedrunGameOver] = useState<boolean>(false);
  const [speedrunScore, setSpeedrunScore] = useState<number>(0);
  const [speedrunHighScore, setSpeedrunHighScore] = useState<number>(0);
  const [speedrunStreak, setSpeedrunStreak] = useState<number>(0);
  const [speedrunTimeLeft, setSpeedrunTimeLeft] = useState<number>(10);
  const [speedrunQuestion, setSpeedrunQuestion] = useState<KanjiPracticeQuestion | null>(null);
  const speedrunTimerRef = useRef<any>(null);
  const speedrunScoreRef = useRef<number>(0);

  // Load Speedrun high score from localStorage
  useEffect(() => {
    try {
      const savedHigh = localStorage.getItem(`kanji_speedrun_high_${selectedLessonId}`);
      if (savedHigh) {
        setSpeedrunHighScore(parseInt(savedHigh) || 0);
      }
    } catch (e) {
      // ignore
    }
  }, [selectedLessonId]);

  // Reset flipped state on question or draw index change
  useEffect(() => {
    setIsQuestionFlipped(false);
  }, [currentIndex, drawIndex]);

  // Generator for Choice & Written modes
  const initPracticeSession = useCallback(() => {
    if (!eligibleKanji || eligibleKanji.length === 0) {
      setQuestions([]);
      return;
    }
    const limitNum = typeof questionLimit === 'number' ? questionLimit : eligibleKanji.length;

    // Filter enabled question types based on practice direction
    let enabledTypes: KanjiQuestionType[] = ['kanji_to_sino_meaning', 'meaning_to_kanji', 'compound_fill'];
    if (practiceDirection === 'kanji-to-meaning') {
      enabledTypes = ['kanji_to_sino_meaning', 'compound_fill'];
    } else if (practiceDirection === 'meaning-to-kanji') {
      enabledTypes = ['meaning_to_kanji'];
    }

    const generated = generateKanjiPracticeQuestions(
      eligibleKanji,
      COMMON_KANJI_DISTRACTORS,
      Math.min(limitNum, Math.max(eligibleKanji.length, 5)),
      enabledTypes
    );

    setQuestions(generated);
    setCurrentIndex(0);
    setUserAnswers({});
    setIsSubmitted({});
    setResults({});
    setIsFinished(false);
    setWrittenInput('');
    setIsQuestionFlipped(false);

    // Reset draw mode session state
    setDrawIndex(0);
    setDrawResult(null);
    setDrawEvaluated({});
    setIsDrawFinished(false);
  }, [eligibleKanji, questionLimit, practiceDirection]);

  // Re-generate on lesson change, status filter change, or direction change
  useEffect(() => {
    initPracticeSession();
  }, [initPracticeSession]);

  // Auto-focus on written input
  useEffect(() => {
    if (practiceMode === 'written' && !isFinished) {
      setTimeout(() => {
        writtenInputRef.current?.focus();
      }, 100);
    }
  }, [practiceMode, currentIndex, isFinished]);

  // Audio player helper
  const handlePlayAudio = (char: string, kana?: string) => {
    const playKana = kana || char;
    playAudioWithFallback(char, playKana);
  };

  // ==================== CHOICE MODE HANDLERS ====================
  const handleSelectChoice = (option: string) => {
    if (isSubmitted[currentIndex]) return; // Đã trả lời rồi

    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const isCorrect = option === currentQ.correctAnswer;
    const score = isCorrect ? 100 : 0;

    setUserAnswers(prev => ({ ...prev, [currentIndex]: option }));
    setIsSubmitted(prev => ({ ...prev, [currentIndex]: true }));
    setResults(prev => ({
      ...prev,
      [currentIndex]: {
        isCorrect,
        score,
        feedback: isCorrect
          ? 'Chính xác! Bạn đã ghi nhớ rất tốt.'
          : `Chưa đúng. Đáp án chính xác là: ${currentQ.correctAnswer}`
      }
    }));

    // Phát âm thanh nếu đúng
    if (isCorrect) {
      handlePlayAudio(currentQ.character, currentQ.kunyomi || currentQ.character);
    }
  };

  // ==================== WRITTEN MODE HANDLERS ====================
  const handleSubmitWritten = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitted[currentIndex]) return;
    if (!writtenInput.trim()) return;

    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const targetKanji = eligibleKanji.find(k => k.id === currentQ.kanjiId) || {
      id: currentQ.kanjiId,
      lesson_id: selectedLessonId,
      character: currentQ.character,
      sino_vietnamese: currentQ.sinoVietnamese,
      vietnamese_meaning: currentQ.vietnameseMeaning,
      onyomi: currentQ.onyomi,
      kunyomi: currentQ.kunyomi,
      compounds: currentQ.compounds,
      mnemonic_tip: currentQ.mnemonicTip
    };

    const grade = gradeKanjiWritten(writtenInput, targetKanji);

    setUserAnswers(prev => ({ ...prev, [currentIndex]: writtenInput.trim() }));
    setIsSubmitted(prev => ({ ...prev, [currentIndex]: true }));
    setResults(prev => ({
      ...prev,
      [currentIndex]: {
        isCorrect: grade.isCorrect,
        score: grade.score,
        feedback: grade.feedback
      }
    }));

    if (grade.isCorrect) {
      handlePlayAudio(currentQ.character, currentQ.kunyomi || currentQ.character);
    }
  };

  // Đánh dấu đúng (Override correct) nếu tự thấy câu trả lời đúng
  const handleOverrideCorrect = () => {
    setResults(prev => ({
      ...prev,
      [currentIndex]: {
        isCorrect: true,
        score: 100,
        feedback: '✓ Bạn đã đánh dấu câu trả lời này là đúng.'
      }
    }));
  };

  // Next Question
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setWrittenInput('');
    } else {
      setIsFinished(true);
    }
  };

  // Calculate total score
  const correctCount = useMemo(() => {
    return Object.values(results).filter(r => r.isCorrect).length;
  }, [results]);

  // ==================== SPEEDRUN MODE HANDLERS ====================
  const generateNextSpeedrunQuestion = useCallback(() => {
    if (!eligibleKanji || eligibleKanji.length === 0) return null;
    let enabledTypes: KanjiQuestionType[] = ['kanji_to_sino_meaning', 'meaning_to_kanji'];
    if (practiceDirection === 'kanji-to-meaning') {
      enabledTypes = ['kanji_to_sino_meaning'];
    } else if (practiceDirection === 'meaning-to-kanji') {
      enabledTypes = ['meaning_to_kanji'];
    }
    const generated = generateKanjiPracticeQuestions(
      eligibleKanji,
      COMMON_KANJI_DISTRACTORS,
      1,
      enabledTypes
    );
    return generated[0] || null;
  }, [eligibleKanji, practiceDirection]);

  const startSpeedrun = () => {
    setSpeedrunActive(true);
    setSpeedrunGameOver(false);
    setSpeedrunScore(0);
    speedrunScoreRef.current = 0;
    setSpeedrunStreak(0);
    setSpeedrunTimeLeft(10);

    const firstQ = generateNextSpeedrunQuestion();
    setSpeedrunQuestion(firstQ);
  };

  // Speedrun countdown timer
  useEffect(() => {
    if (!speedrunActive || speedrunGameOver) {
      if (speedrunTimerRef.current) clearInterval(speedrunTimerRef.current);
      return;
    }

    speedrunTimerRef.current = setInterval(() => {
      setSpeedrunTimeLeft(prev => {
        if (prev <= 1) {
          // Hết giờ -> Game Over
          setSpeedrunActive(false);
          setSpeedrunGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (speedrunTimerRef.current) clearInterval(speedrunTimerRef.current);
    };
  }, [speedrunActive, speedrunGameOver]);

  const handleSpeedrunAnswer = (selectedOpt: string) => {
    if (!speedrunQuestion || !speedrunActive) return;

    if (selectedOpt === speedrunQuestion.correctAnswer) {
      // Đúng: cộng điểm, tăng streak, reset timer về 10s
      const bonus = Math.min(speedrunStreak * 2, 20);
      const points = 10 + bonus;
      const newScore = speedrunScoreRef.current + points;
      speedrunScoreRef.current = newScore;
      setSpeedrunScore(newScore);
      setSpeedrunStreak(prev => prev + 1);
      setSpeedrunTimeLeft(10);

      // Cập nhật High score nếu phá kỷ lục
      if (newScore > speedrunHighScore) {
        setSpeedrunHighScore(newScore);
        try {
          localStorage.setItem(`kanji_speedrun_high_${selectedLessonId}`, newScore.toString());
        } catch (e) {
          // ignore
        }
      }

      // Next question
      const nextQ = generateNextSpeedrunQuestion();
      setSpeedrunQuestion(nextQ);
    } else {
      // Chọn sai -> Game over ngay lập tức
      setSpeedrunActive(false);
      setSpeedrunGameOver(true);
    }
  };

  // Phân tích bộ thủ của câu hỏi hiện tại
  const currentRadicals = useMemo(() => {
    if (!questions[currentIndex]) return '';
    return getRadicalsString(questions[currentIndex].character);
  }, [questions, currentIndex]);

  // Phân tích từ ghép của câu hỏi hiện tại
  const currentCompounds = useMemo(() => {
    if (!questions[currentIndex]) return [];
    return parseCompounds(questions[currentIndex].compounds);
  }, [questions, currentIndex]);

  // ==================== DRAW (TẬP VIẾT) HANDLERS ====================
  // Draw Tian Zi Ge (田字格) grid & optional Ghost guide on canvas
  const drawGridAndGuide = useCallback((targetChar?: string, ghostVisible = false) => {
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

    // Ghost template guide
    if (ghostVisible && targetChar) {
      ctx.fillStyle = 'rgba(20, 184, 166, 0.22)';
      ctx.font = '900 150px "Noto Sans JP", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(targetChar, w / 2, h / 2 + 5);
    }
  }, []);

  // Synchronize canvas when Kanji changes, ghost guide toggles, or direction/flip changes
  useEffect(() => {
    if (practiceMode === 'draw' && currentDrawKanji) {
      const char = currentDrawKanji.character;
      const t = setTimeout(() => {
        const effectiveGhost = practiceDirection === 'meaning-to-kanji' && !isQuestionFlipped ? false : showGhostGuide;
        drawGridAndGuide(char, effectiveGhost);
        setHasDrawn(false);
        const existing = drawEvaluated[drawIndex];
        setDrawResult(existing ? {
          score: existing.score,
          is_correct: existing.is_correct,
          status: existing.score >= 85 ? 'excellent' : existing.score >= 60 ? 'acceptable' : 'needs_improvement',
          status_label: existing.status_label,
          feedback: existing.feedback
        } : null);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [practiceMode, drawIndex, showGhostGuide, drawGridAndGuide, currentDrawKanji, drawEvaluated, practiceDirection, isQuestionFlipped]);

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

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!currentDrawKanji) return;
    drawGridAndGuide(currentDrawKanji.character, showGhostGuide);
    setHasDrawn(false);
    setDrawResult(null);
  };

  // Local stroke similarity evaluation (Tian Zi Ge grid sampling & F1 score)
  const evaluateDrawing = () => {
    if (!currentDrawKanji) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const oCtx = offscreen.getContext('2d');
    if (!oCtx) return;

    oCtx.fillStyle = '#090d1f';
    oCtx.fillRect(0, 0, offscreen.width, offscreen.height);
    oCtx.fillStyle = '#2dd4bf';
    oCtx.font = '900 150px "Noto Sans JP", sans-serif';
    oCtx.textAlign = 'center';
    oCtx.textBaseline = 'middle';
    oCtx.fillText(currentDrawKanji.character, offscreen.width / 2, offscreen.height / 2 + 5);

    const userCtx = canvas.getContext('2d');
    if (!userCtx) return;

    const uImg = userCtx.getImageData(0, 0, canvas.width, canvas.height).data;
    const tImg = oCtx.getImageData(0, 0, offscreen.width, offscreen.height).data;

    const W = 40;
    const H = 40;
    const stepX = canvas.width / W;
    const stepY = canvas.height / H;

    let overlap = 0;
    let targetFilled = 0;
    let userFilled = 0;

    for (let gy = 0; gy < H; gy++) {
      for (let gx = 0; gx < W; gx++) {
        const px = Math.floor(gx * stepX);
        const py = Math.floor(gy * stepY);
        const idx = (py * canvas.width + px) * 4;

        const uIsDrawn = uImg[idx + 1] > 90 && (uImg[idx] !== 9 && uImg[idx + 2] !== 31);
        const tIsDrawn = tImg[idx + 1] > 90 && (tImg[idx] !== 9 && tImg[idx + 2] !== 31);

        if (tIsDrawn) targetFilled++;
        if (uIsDrawn) userFilled++;
        if (uIsDrawn && tIsDrawn) overlap++;
      }
    }

    if (userFilled < 10) {
      const res = {
        score: 20,
        is_correct: false,
        status: 'incorrect' as const,
        status_label: 'Chưa đủ nét (20/100)',
        feedback: 'Nét vẽ quá ít hoặc chưa hoàn thành. Hãy viết đầy đủ các nét của chữ Hán nhé.'
      };
      setDrawResult(res);
      setDrawEvaluated(prev => ({ ...prev, [drawIndex]: res }));
      return;
    }

    const precision = overlap / Math.max(1, userFilled);
    const recall = overlap / Math.max(1, targetFilled);
    const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    const rawScore = Math.min(100, Math.max(30, Math.round(f1 * 130) + 18));

    let status: 'excellent' | 'acceptable' | 'needs_improvement' | 'incorrect' = 'acceptable';
    let status_label = `Đạt yêu cầu (${rawScore}/100)`;
    let feedback = 'Nét vẽ tương đối chuẩn xác với chữ Hán mẫu. Tiếp tục phát huy!';

    if (rawScore >= 85) {
      status = 'excellent';
      status_label = `Xuất sắc! (${rawScore}/100)`;
      feedback = 'Nét vẽ rất chuẩn xác, cân đối và đúng tỷ lệ chữ Hán!';
    } else if (rawScore < 60) {
      status = 'needs_improvement';
      status_label = `Cần rèn thêm (${rawScore}/100)`;
      feedback = 'Hình dáng chữ còn hơi lệch hoặc chưa cân đối, hãy bật chữ mẫu mờ để đồ theo nhé.';
    }

    const res = {
      score: rawScore,
      is_correct: rawScore >= 60,
      status,
      status_label,
      feedback
    };

    setDrawResult(res);
    setDrawEvaluated(prev => ({ ...prev, [drawIndex]: res }));

    if (res.is_correct) {
      handlePlayAudio(currentDrawKanji.character, currentDrawKanji.kunyomi || currentDrawKanji.character);
    }
  };

  const handleNextDraw = () => {
    if (drawIndex + 1 < drawKanjiList.length) {
      setDrawIndex(prev => prev + 1);
    } else {
      setIsDrawFinished(true);
    }
  };

  const handlePrevDraw = () => {
    if (drawIndex > 0) {
      setDrawIndex(prev => prev - 1);
    }
  };

  // Phân tích bộ thủ và từ ghép của chữ Kanji đang vẽ
  const currentDrawRadicals = useMemo(() => {
    if (!currentDrawKanji) return '';
    return getRadicalsString(currentDrawKanji.character);
  }, [currentDrawKanji]);

  const currentDrawCompounds = useMemo(() => {
    if (!currentDrawKanji) return [];
    return parseCompounds(currentDrawKanji.compounds);
  }, [currentDrawKanji]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      {/* 1. Header Toolbar */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm backdrop-blur-md space-y-4">
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
                Luyện nhận diện chữ Hán, Hán Việt, ý nghĩa, từ ghép và phản xạ nhanh 10 giây.
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

        {/* Controls: Mode Switcher & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Practice Mode Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-950/60 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 shrink-0 overflow-x-auto">
            <button
              onClick={() => {
                setPracticeMode('choice');
                initPracticeSession();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                practiceMode === 'choice'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>🎯 Trắc nghiệm</span>
            </button>
            <button
              onClick={() => {
                setPracticeMode('written');
                initPracticeSession();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                practiceMode === 'written'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>✍️ Tự luận viết</span>
            </button>
            <button
              onClick={() => {
                setPracticeMode('draw');
                setDrawIndex(0);
                setDrawResult(null);
                setDrawEvaluated({});
                setIsDrawFinished(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                practiceMode === 'draw'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>🖌️ Tập viết</span>
            </button>
            <button
              onClick={() => {
                setPracticeMode('speedrun');
                setSpeedrunActive(false);
                setSpeedrunGameOver(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                practiceMode === 'speedrun'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>⚡ Phản xạ (10s)</span>
            </button>
          </div>

          {/* Right Toolbar: Direction, Limit & Status Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Direction Switcher: Kanji ➔ Nghĩa / Nghĩa ➔ Kanji / Song song */}
            <div className="flex bg-slate-100 dark:bg-slate-950/60 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs font-bold shrink-0">
              <button
                onClick={() => setPracticeDirection('kanji-to-meaning')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  practiceDirection === 'kanji-to-meaning'
                    ? 'bg-blue-600 text-white shadow-md font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="Chữ Hán ➔ Nghĩa: Nhìn Kanji, đoán Âm Hán & Nghĩa"
              >
                <span>🇯🇵 ➔ 🇻🇳</span>
                <span className="hidden sm:inline">Kanji ➔ Nghĩa</span>
              </button>
              <button
                onClick={() => setPracticeDirection('meaning-to-kanji')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  practiceDirection === 'meaning-to-kanji'
                    ? 'bg-blue-600 text-white shadow-md font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="Nghĩa ➔ Chữ Hán: Nhìn Nghĩa & Hán Việt, đoán/viết Kanji"
              >
                <span>🇻🇳 ➔ 🇯🇵</span>
                <span className="hidden sm:inline">Nghĩa ➔ Kanji</span>
              </button>
              <button
                onClick={() => setPracticeDirection('both')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  practiceDirection === 'both'
                    ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="Song song: Đan xen cả hai chiều câu hỏi"
              >
                <span>🔄</span>
                <span>Song song</span>
              </button>
            </div>

            {practiceMode !== 'speedrun' && (
              <>
                {/* Question Limit Stepper */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-bold">
                  <span className="text-slate-400 px-1 text-[11px]">Số câu:</span>
                  {[5, 10].map(cnt => (
                    <button
                      key={cnt}
                      onClick={() => {
                        setQuestionLimit(cnt);
                        setTimeout(initPracticeSession, 50);
                      }}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        questionLimit === cnt
                          ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setQuestionLimit(eligibleKanji.length);
                      setTimeout(initPracticeSession, 50);
                    }}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      questionLimit === eligibleKanji.length
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Tất cả
                  </button>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <button
                    onClick={() => setFilterDropdownOpen(prev => !prev)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-slate-300 cursor-pointer"
                  >
                    <span>Lọc trạng thái:</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {statusFilter === 'all'
                        ? 'Tất cả'
                        : statusFilter === 'not_learned'
                        ? '🔴 Chưa học'
                        : statusFilter === 'learning'
                        ? '🟡 Đang học'
                        : '🟢 Đã thuộc'}
                    </span>
                    <span className="text-[10px]">▼</span>
                  </button>

                  {filterDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 py-1 text-xs">
                      {[
                        { id: 'all', label: 'Tất cả trạng thái' },
                        { id: 'not_learned', label: '🔴 Chưa học' },
                        { id: 'learning', label: '🟡 Đang học' },
                        { id: 'mastered', label: '🟢 Đã thuộc' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setStatusFilter(opt.id as any);
                            setFilterDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between ${
                            statusFilter === opt.id ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {statusFilter === opt.id && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Refresh button */}
                <button
                  onClick={initPracticeSession}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                  title="Đảo đề / Làm mới danh sách câu hỏi"
                >
                  <span>🔄 Tráo đề</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Content Area based on Mode */}

      {/* NO KANJI AVAILABLE WARNING */}
      {eligibleKanji.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8 space-y-3">
          <span className="text-4xl">📭</span>
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
            Không có chữ Hán nào phù hợp với bộ lọc hiện tại
          </h3>
          <p className="text-xs text-slate-400">
            Hãy đổi bộ lọc trạng thái sang &ldquo;Tất cả&rdquo; để tiếp tục luyện tập.
          </p>
          <button
            onClick={() => setStatusFilter('all')}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            Xem tất cả chữ Hán
          </button>
        </div>
      ) : practiceMode === 'speedrun' ? (
        /* ==================== SPEEDRUN 10S MODE ==================== */
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm backdrop-blur-md space-y-6 text-center">
          {!speedrunActive && !speedrunGameOver ? (
            /* Speedrun Intro Screen */
            <div className="py-10 max-w-md mx-auto space-y-6">
              <span className="text-6xl inline-block animate-bounce">⚡</span>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                  Phản Xạ Nhanh Kanji 10 Giây
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Nhìn chữ Hán và chọn ngay âm Hán Việt hoặc nghĩa đúng trong vòng 10 giây. Trả lời đúng liên tục để nhân đôi điểm thưởng streak!
                </p>
              </div>

              {speedrunHighScore > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-sm">
                  <span>🏆 Kỷ lục cao nhất:</span>
                  <span className="text-base font-extrabold">{speedrunHighScore} điểm</span>
                </div>
              )}

              <div>
                <button
                  onClick={startSpeedrun}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-95 text-white font-extrabold text-base shadow-xl shadow-amber-500/20 active:scale-[0.99] transition-all cursor-pointer"
                >
                  🚀 Bắt đầu Lượt chơi mới
                </button>
              </div>
            </div>
          ) : speedrunGameOver ? (
            /* Speedrun Game Over Screen */
            <div className="py-8 max-w-md mx-auto space-y-6 animate-scale-up">
              <span className="text-6xl">⏱️</span>
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-rose-500">Hết Giờ!</h3>
                <p className="text-sm text-slate-500">Lượt chơi kết thúc.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="text-center space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase">Điểm số</span>
                  <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {speedrunScore}
                  </p>
                </div>
                <div className="text-center space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase">Streak cao nhất</span>
                  <p className="text-3xl font-extrabold text-amber-500">
                    {speedrunStreak}
                  </p>
                </div>
              </div>

              {speedrunScore >= speedrunHighScore && speedrunScore > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold text-xs animate-pulse">
                  🎉 Chúc mừng! Bạn đã xác lập kỷ lục mới!
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={startSpeedrun}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold text-sm shadow-md cursor-pointer"
                >
                  🔄 Chơi lại
                </button>
                <button
                  onClick={() => {
                    setPracticeMode('choice');
                    initPracticeSession();
                  }}
                  className="px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 cursor-pointer"
                >
                  Về Trắc nghiệm
                </button>
              </div>
            </div>
          ) : speedrunQuestion ? (
            /* Speedrun Active Question */
            <div className="space-y-6 max-w-xl mx-auto py-2">
              {/* Stats Bar */}
              <div className="flex items-center justify-between text-xs font-bold px-2">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">🔥 Streak: {speedrunStreak}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-indigo-600 dark:text-indigo-400">⭐ Điểm: {speedrunScore}</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-500 font-mono text-sm font-extrabold">
                  <span>⏱️</span>
                  <span>{speedrunTimeLeft}s</span>
                </div>
              </div>

              {/* Progress bar timer */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${(speedrunTimeLeft / 10) * 100}%` }}
                />
              </div>

              {/* Subject Character */}
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-inner">
                <p className="text-xs font-bold text-slate-400 mb-2">{speedrunQuestion.questionPrompt}</p>
                <h2 className="text-6xl md:text-7xl font-extrabold text-slate-800 dark:text-slate-100 font-serif tracking-wider">
                  {speedrunQuestion.displaySubject}
                </h2>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {speedrunQuestion.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleSpeedrunAnswer(opt)}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 hover:shadow-md text-left font-bold text-sm text-slate-800 dark:text-slate-200 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span className="inline-block w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-center text-xs leading-6 mr-2 font-mono">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : practiceMode === 'draw' ? (
        /* ==================== DRAW (TẬP VIẾT) MODE ==================== */
        isDrawFinished ? (
          /* ==================== DRAW MODE SUMMARY SCREEN ==================== */
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm backdrop-blur-md space-y-6">
            <div className="text-center py-6 space-y-3">
              <span className="text-5xl">🖌️</span>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                Hoàn Thành Luyện Viết Kanji!
              </h3>
              <p className="text-sm text-slate-500">
                Bạn đã luyện viết trọn vẹn <span className="font-extrabold text-teal-600 dark:text-teal-400 text-lg">{drawKanjiList.length}</span> chữ Hán của bài học.
              </p>
            </div>

            {/* List of practiced Kanji with scores and status switchers */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Kết quả đánh giá từng chữ:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {drawKanjiList.map((k, idx) => {
                  const evalRes = drawEvaluated[idx];
                  const currentStatus = k.status || 'not_learned';

                  return (
                    <div
                      key={k.id || idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        evalRes?.is_correct
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : evalRes
                          ? 'bg-amber-500/5 border-amber-500/20'
                          : 'bg-slate-500/5 border-slate-500/20'
                      } flex items-center justify-between gap-3`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-serif font-extrabold text-slate-800 dark:text-slate-100 w-12 text-center">
                          {k.character}
                        </span>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {k.sino_vietnamese ? `${k.sino_vietnamese} • ` : ''}{k.vietnamese_meaning}
                          </p>
                          <p className="text-[11px] font-medium">
                            {evalRes ? (
                              <span className={evalRes.is_correct ? 'text-emerald-500' : 'text-amber-500'}>
                                {evalRes.status_label}
                              </span>
                            ) : (
                              <span className="text-slate-400">Chưa chấm điểm nét vẽ</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Status toggles */}
                      {onUpdateKanjiStatus && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => onUpdateKanjiStatus(k.id, 'learning')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                              currentStatus === 'learning'
                                ? 'bg-amber-500/20 border-amber-500 text-amber-500 font-extrabold'
                                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-amber-500'
                            }`}
                            title="Đang học"
                          >
                            🟡
                          </button>
                          <button
                            onClick={() => onUpdateKanjiStatus(k.id, 'mastered')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                              currentStatus === 'mastered'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 font-extrabold'
                                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500'
                            }`}
                            title="Đã thuộc"
                          >
                            🟢
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setDrawIndex(0);
                  setDrawResult(null);
                  setDrawEvaluated({});
                  setIsDrawFinished(false);
                }}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:opacity-90 text-white font-bold text-sm shadow-md cursor-pointer"
              >
                🔄 Luyện viết lại từ đầu
              </button>
              <button
                onClick={() => {
                  setPracticeMode('choice');
                  initPracticeSession();
                }}
                className="px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm cursor-pointer"
              >
                🎯 Chuyển sang Trắc nghiệm
              </button>
            </div>
          </div>
        ) : currentDrawKanji ? (
          /* ==================== ACTIVE DRAW MODE SCREEN ==================== */
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm backdrop-blur-md space-y-6">
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <span>Chữ {drawIndex + 1} / {drawKanjiList.length}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-bold">
                  🖌️ Tập viết Canvas
                </span>
              </span>
              <span>Đã chấm điểm: {Object.keys(drawEvaluated).length} / {drawKanjiList.length}</span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${((drawIndex + 1) / drawKanjiList.length) * 100}%` }}
              />
            </div>

            {/* Main Practice Workspace: Canvas on left/center, Details on right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Canvas Box & Controls (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center gap-3">
                {/* Canvas Toolbar */}
                <div className="w-full max-w-[280px] flex items-center justify-between text-xs">
                  <button
                    onClick={() => setShowGhostGuide(prev => !prev)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs border ${
                      showGhostGuide
                        ? 'bg-teal-500/15 border-teal-500/40 text-teal-600 dark:text-teal-300'
                        : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <span>{showGhostGuide ? '👁️ Ẩn chữ mẫu' : '👁️ Hiện chữ mẫu'}</span>
                  </button>

                  <button
                    onClick={clearCanvas}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-300 font-bold transition-all flex items-center gap-1 cursor-pointer text-xs active:scale-95"
                    title="Xóa nét vẽ để tập viết lại"
                  >
                    <span>🗑️ Vẽ lại</span>
                  </button>
                </div>

                {/* Tian Zi Ge Canvas */}
                <div className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-slate-700/80 bg-[#090d1f]">
                  <canvas
                    ref={canvasRef}
                    width={280}
                    height={280}
                    onMouseDown={startDrawing}
                    onMouseMove={drawStroke}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={drawStroke}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair touch-none select-none block"
                  />

                  {!hasDrawn && !drawResult && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                      <span className="text-[11px] text-slate-300 font-bold bg-slate-950/80 px-3 py-1.5 rounded-full border border-slate-800 backdrop-blur-sm">
                        ✍️ Dùng ngón tay hoặc chuột để viết
                      </span>
                    </div>
                  )}
                </div>

                {/* Evaluate Stroke Button */}
                <button
                  onClick={evaluateDrawing}
                  disabled={!hasDrawn && !drawResult}
                  className="w-full max-w-[280px] py-3.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-600 hover:opacity-95 disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-slate-400 text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer active:scale-95 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <span>✨ Chấm điểm nét vẽ</span>
                </button>

                {/* Evaluation Result Feedback */}
                {drawResult && (
                  <div className={`w-full max-w-[280px] p-3.5 rounded-2xl border text-xs space-y-1.5 animate-fade-in ${
                    drawResult.score >= 85
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : drawResult.score >= 60
                      ? 'bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                  }`}>
                    <div className="flex items-center justify-between font-extrabold">
                      <span>{drawResult.status_label}</span>
                      <span>{drawResult.score >= 60 ? '✓ Đạt' : '⚠️ Thử lại'}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">{drawResult.feedback}</p>
                  </div>
                )}
              </div>

              {/* Right Column: Kanji Information, Readings, Mnemonic, Compounds & Navigation (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Kanji Card Header */}
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* When direction is meaning-to-kanji and not flipped: Mask Kanji to challenge recall */}
                    {practiceDirection === 'meaning-to-kanji' && !isQuestionFlipped ? (
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col items-center justify-center text-indigo-500 shrink-0">
                        <span className="text-xl font-black">❓</span>
                        <span className="text-[8px] font-bold uppercase tracking-tighter">Nhớ chữ</span>
                      </div>
                    ) : (
                      <span className="text-5xl font-extrabold font-serif text-slate-800 dark:text-slate-100">
                        {currentDrawKanji.character}
                      </span>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                          {currentDrawKanji.sino_vietnamese || '---'}
                        </h3>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {currentDrawKanji.vietnamese_meaning}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {currentDrawKanji.stroke_count ? `${currentDrawKanji.stroke_count} nét • ` : ''}
                        Bài {selectedLessonId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Toggle button to peek at Kanji in meaning-to-kanji mode */}
                    {practiceDirection === 'meaning-to-kanji' && (
                      <button
                        type="button"
                        onClick={() => setIsQuestionFlipped(prev => !prev)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          isQuestionFlipped
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                        }`}
                        title="Bấm để lật mở xem chữ Hán mẫu"
                      >
                        {isQuestionFlipped ? '🙈 Ẩn mẫu' : '👁️ Xem chữ'}
                      </button>
                    )}

                    <button
                      onClick={() => handlePlayAudio(currentDrawKanji.character, currentDrawKanji.kunyomi || currentDrawKanji.character)}
                      className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-teal-600 hover:border-teal-400 transition-colors cursor-pointer text-lg shrink-0"
                      title="Nghe phát âm chữ Hán"
                    >
                      🔊
                    </button>
                  </div>
                </div>

                {/* Readings: Onyomi & Kunyomi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 space-y-1">
                    <span className="font-extrabold uppercase text-[10px] tracking-wider block text-purple-500">
                      Onyomi (Âm Hán):
                    </span>
                    <span className="font-bold text-sm">{currentDrawKanji.onyomi || '-'}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 space-y-1">
                    <span className="font-extrabold uppercase text-[10px] tracking-wider block text-emerald-500">
                      Kunyomi (Âm Nhật):
                    </span>
                    <span className="font-bold text-sm">{currentDrawKanji.kunyomi || '-'}</span>
                  </div>
                </div>

                {/* Radicals Breakdown */}
                {currentDrawRadicals && (
                  <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs flex items-start gap-2">
                    <span className="font-bold shrink-0">🉐 Bộ thủ:</span>
                    <span className="font-medium">{currentDrawRadicals}</span>
                  </div>
                )}

                {/* Mnemonic Tip */}
                {currentDrawKanji.mnemonic_tip && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs leading-relaxed space-y-1">
                    <span className="font-bold block text-amber-600 dark:text-amber-400">💡 Mẹo ghi nhớ:</span>
                    <span>{currentDrawKanji.mnemonic_tip}</span>
                  </div>
                )}

                {/* Compounds (Từ ghép thực tế) */}
                {currentDrawCompounds.length > 0 && (
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-slate-400 block text-[11px] uppercase tracking-wider">
                      📚 Từ ghép xuất hiện trong bài:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentDrawCompounds.map((c, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
                        >
                          <span className="text-teal-600 dark:text-teal-400 font-bold">{c.word}</span>
                          {c.reading ? ` (${c.reading})` : ''}: {c.meaning}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation Toolbar */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <button
                    onClick={handlePrevDraw}
                    disabled={drawIndex === 0}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>← Chữ trước</span>
                  </button>

                  <button
                    onClick={handleNextDraw}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:opacity-90 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{drawIndex + 1 < drawKanjiList.length ? 'Chữ tiếp theo ➔' : 'Hoàn thành bài tập 🏆'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null
      ) : isFinished ? (
        /* ==================== SUMMARY RESULT SCREEN ==================== */
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm backdrop-blur-md space-y-6">
          <div className="text-center py-6 space-y-3">
            <span className="text-5xl">🏆</span>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
              Hoàn Thành Bài Ôn Tập Kanji!
            </h3>
            <p className="text-sm text-slate-500">
              Kết quả: <span className="font-extrabold text-blue-600 dark:text-blue-400 text-lg">{correctCount}</span> / {questions.length} câu đúng ({Math.round((correctCount / questions.length) * 100)}%)
            </p>
          </div>

          {/* List of completed questions with status toggles */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Chi tiết các chữ Hán vừa ôn:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {questions.map((q, idx) => {
                const res = results[idx];
                const kanjiObj = eligibleKanji.find(k => k.id === q.kanjiId);
                const currentStatus = kanjiObj?.status || 'not_learned';

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      res?.isCorrect
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-rose-500/5 border-rose-500/20'
                    } flex items-center justify-between gap-3`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-serif font-extrabold text-slate-800 dark:text-slate-100 w-10 text-center">
                        {q.character}
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {q.sinoVietnamese ? `${q.sinoVietnamese} • ` : ''}{q.vietnameseMeaning}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {res?.isCorrect ? '✓ Đúng' : `✗ Sai: ${q.correctAnswer}`}
                        </p>
                      </div>
                    </div>

                    {/* Quick status switchers */}
                    {onUpdateKanjiStatus && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onUpdateKanjiStatus(q.kanjiId, 'learning')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            currentStatus === 'learning'
                              ? 'bg-amber-500/20 border-amber-500 text-amber-500 font-extrabold'
                              : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-amber-500'
                          }`}
                          title="Đang học"
                        >
                          🟡
                        </button>
                        <button
                          onClick={() => onUpdateKanjiStatus(q.kanjiId, 'mastered')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            currentStatus === 'mastered'
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 font-extrabold'
                              : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500'
                          }`}
                          title="Đã thuộc"
                        >
                          🟢
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={initPracticeSession}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold text-sm shadow-md cursor-pointer"
            >
              🔄 Luyện lại lượt mới
            </button>
            <button
              onClick={() => {
                setPracticeMode(practiceMode === 'choice' ? 'written' : 'choice');
                setTimeout(initPracticeSession, 50);
              }}
              className="px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm cursor-pointer"
            >
              {practiceMode === 'choice' ? '✍️ Chuyển sang Tự luận' : '🎯 Chuyển sang Trắc nghiệm'}
            </button>
          </div>
        </div>
      ) : questions.length > 0 && questions[currentIndex] ? (
        /* ==================== ACTIVE QUESTION SCREEN (CHOICE OR WRITTEN) ==================== */
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm backdrop-blur-md space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <span>Câu {currentIndex + 1} / {questions.length}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                {practiceMode === 'choice' ? '🎯 Trắc nghiệm' : '✍️ Tự luận'}
              </span>
            </span>
            <span>Đúng: {correctCount} câu</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card Box */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-center space-y-3 relative shadow-inner">
            {/* Header row: Question prompt & Instant Flip toggle */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 text-left">
                {isQuestionFlipped
                  ? (questions[currentIndex].type === 'meaning_to_kanji'
                      ? '🔄 Đang lật xem mặt chữ Kanji đối chiếu:'
                      : '🔄 Đang lật xem Nghĩa & Hán Việt đối chiếu:')
                  : questions[currentIndex].questionPrompt}
              </p>

              <button
                type="button"
                onClick={() => setIsQuestionFlipped(prev => !prev)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isQuestionFlipped
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 shadow-sm'
                }`}
                title="Bấm để lật xem mặt đối ứng (Chữ Hán ⇋ Nghĩa) để ôn song song"
              >
                <span>🔄</span>
                <span>{isQuestionFlipped ? 'Quay lại câu hỏi' : 'Lật Kanji ⇋ Nghĩa'}</span>
              </button>
            </div>

            {/* Display Subject */}
            <div className="flex items-center justify-center gap-3">
              {isQuestionFlipped ? (
                /* Flipped content */
                <div className="py-2 space-y-1 animate-fade-in">
                  {questions[currentIndex].type === 'meaning_to_kanji' ? (
                    <div className="space-y-1">
                      <h1 className="text-5xl md:text-7xl font-extrabold text-blue-600 dark:text-blue-400 font-serif tracking-wide">
                        {questions[currentIndex].character}
                      </h1>
                      <span className="text-[11px] text-slate-400 font-medium">
                        (Mặt chữ Kanji của nghĩa trên)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <h2 className="text-2xl md:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                        {questions[currentIndex].sinoVietnamese ? `${questions[currentIndex].sinoVietnamese} • ` : ''}{questions[currentIndex].vietnameseMeaning}
                      </h2>
                      <span className="text-[11px] text-slate-400 font-mono">
                        (Nghĩa & Hán Việt của chữ: {questions[currentIndex].character})
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Normal Subject */
                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-800 dark:text-slate-100 font-serif tracking-wide py-2">
                  {questions[currentIndex].displaySubject}
                </h1>
              )}

              {/* TTS Audio button for Kanji */}
              <button
                onClick={() => handlePlayAudio(questions[currentIndex].character, questions[currentIndex].kunyomi || questions[currentIndex].character)}
                className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-400 transition-colors cursor-pointer"
                title="Nghe phát âm chữ Hán"
              >
                🔊
              </button>
            </div>

            {/* Sub-info if available (e.g. stroke count, compound reading) */}
            {questions[currentIndex].subInfo && !isQuestionFlipped && (
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                {questions[currentIndex].subInfo}
              </p>
            )}
          </div>

          {/* Answer Input Area: CHOICE or WRITTEN */}
          {practiceMode === 'choice' ? (
            /* 4 Options Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {questions[currentIndex].options.map((opt, oIdx) => {
                const hasSubmitted = !!isSubmitted[currentIndex];
                const isSelected = userAnswers[currentIndex] === opt;
                const isTheCorrectOne = opt === questions[currentIndex].correctAnswer;

                let btnStyle = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 text-slate-800 dark:text-slate-200';

                if (hasSubmitted) {
                  if (isTheCorrectOne) {
                    btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-extrabold ring-2 ring-emerald-500/20';
                  } else if (isSelected && !isTheCorrectOne) {
                    btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400 line-through';
                  } else {
                    btnStyle = 'border-slate-200 dark:border-slate-800/40 bg-white/50 dark:bg-slate-900/30 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectChoice(opt)}
                    disabled={hasSubmitted}
                    className={`p-4 rounded-2xl border text-left font-bold text-sm transition-all duration-200 flex items-center gap-3 cursor-pointer ${btnStyle} ${
                      !hasSubmitted ? 'active:scale-[0.99] hover:shadow-md' : ''
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      hasSubmitted && isTheCorrectOne
                        ? 'bg-emerald-500 text-white'
                        : hasSubmitted && isSelected && !isTheCorrectOne
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span className="flex-1 leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Written Input Form */
            <form onSubmit={handleSubmitWritten} className="space-y-4">
              <div className="relative">
                <input
                  ref={writtenInputRef}
                  type="text"
                  value={writtenInput}
                  onChange={e => setWrittenInput(e.target.value)}
                  disabled={!!isSubmitted[currentIndex]}
                  placeholder="Gõ Âm Hán Việt (vd: TƯ), Nghĩa (vd: Tôi), hoặc Cách đọc (vd: watashi)..."
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold text-base focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              {!isSubmitted[currentIndex] && (
                <button
                  type="submit"
                  disabled={!writtenInput.trim()}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
                >
                  🔍 Kiểm tra câu này (Enter)
                </button>
              )}
            </form>
          )}

          {/* Feedback Card (Revealed after answering) */}
          {isSubmitted[currentIndex] && (
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-extrabold flex items-center gap-2 ${
                  results[currentIndex]?.isCorrect ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                  <span>{results[currentIndex]?.isCorrect ? '✓ Đúng hoàn toàn' : '✗ Chưa chính xác'}</span>
                </span>

                {/* Override button if marked wrong in written mode */}
                {!results[currentIndex]?.isCorrect && (
                  <button
                    onClick={handleOverrideCorrect}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    ✔ Tôi nghĩ tôi đã làm đúng
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                {results[currentIndex]?.feedback}
              </p>

              {/* Comprehensive Kanji Details Box */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 space-y-2.5 text-xs">
                {/* 1. Radicals Breakdown */}
                {currentRadicals && (
                  <div className="flex items-start gap-2 text-teal-600 dark:text-teal-400 font-medium">
                    <span className="shrink-0 font-bold">🉐 Bộ thủ:</span>
                    <span>{currentRadicals}</span>
                  </div>
                )}

                {/* 2. Readings On/Kun */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300">
                    <span className="font-extrabold uppercase text-[9px] block">Onyomi (Âm Hán):</span>
                    <span className="font-bold">{questions[currentIndex].onyomi || '-'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    <span className="font-extrabold uppercase text-[9px] block">Kunyomi (Âm thuần Nhật):</span>
                    <span className="font-bold">{questions[currentIndex].kunyomi || '-'}</span>
                  </div>
                </div>

                {/* 3. Mnemonic Tip */}
                {questions[currentIndex].mnemonicTip && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                    <span className="font-bold block mb-0.5">💡 Mẹo ghi nhớ:</span>
                    <span>{questions[currentIndex].mnemonicTip}</span>
                  </div>
                )}

                {/* 4. Compounds (Từ ghép thực tế) */}
                {currentCompounds.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-bold text-slate-400 block text-[11px]">📚 Từ ghép xuất hiện trong bài:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentCompounds.map((c, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200"
                        >
                          <span className="text-blue-600 dark:text-blue-400 font-bold">{c.word}</span>
                          {c.reading ? ` (${c.reading})` : ''}: {c.meaning}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Next Question Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>{currentIndex + 1 < questions.length ? 'Câu tiếp theo ➔' : 'Xem kết quả tổng kết 🏆'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
