'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  RADICALS_DICT,
  RadicalInfo,
  RADICAL_LESSONS,
  RadicalLesson
} from '../utils/kanjiRadicals';
import { api } from '../utils/api';

export default function RadicalsPage() {
  const router = useRouter();
  
  // Tab states: 'browse' (Học & Tra cứu) | 'quiz' (Ôn tập & Luyện tập)
  const [activeTab, setActiveTab] = useState<'browse' | 'quiz'>('browse');
  
  // Lesson and search filter states for Browse Tab
  const [selectedLessonId, setSelectedLessonId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRadical, setSelectedRadical] = useState<RadicalInfo | null>(null);

  // Convert dict to list
  const radicalsList = useMemo(() => {
    return Object.values(RADICALS_DICT);
  }, []);

  // Currently selected lesson object
  const currentLesson = useMemo(() => {
    if (selectedLessonId === 'all') return null;
    return RADICAL_LESSONS.find(l => l.id === selectedLessonId) || null;
  }, [selectedLessonId]);

  // Filtered radicals list based on selected lesson and search query
  const filteredRadicals = useMemo(() => {
    return radicalsList.filter(rad => {
      // Filter by lesson
      let lessonMatch = true;
      if (selectedLessonId !== 'all') {
        const lesson = RADICAL_LESSONS.find(l => l.id === selectedLessonId);
        if (lesson) {
          if (lesson.radicals.length === 0) {
            lessonMatch = false; // Bài mở đầu không chứa danh sách bộ thủ riêng
          } else {
            const cleanChar = rad.character.split(' ')[0];
            lessonMatch = lesson.radicals.includes(cleanChar) || rad.lessonId === selectedLessonId;
          }
        }
      }

      // Filter by search query
      const query = searchQuery.toLowerCase().trim();
      const textMatch = !query || 
        rad.character.toLowerCase().includes(query) ||
        rad.sinoVietnamese.toLowerCase().includes(query) ||
        rad.meaning.toLowerCase().includes(query) ||
        rad.description.toLowerCase().includes(query);
        
      return lessonMatch && textMatch;
    });
  }, [radicalsList, selectedLessonId, searchQuery]);

  // --- PRACTICE / QUIZ STATES ---
  const [quizState, setQuizState] = useState<'menu' | 'write' | 'choice' | 'speedrun' | 'finished'>('menu');
  const [practiceType, setPracticeType] = useState<'write' | 'choice' | 'speedrun'>('choice');
  const [practiceLimit, setPracticeLimit] = useState<number>(10);
  const [selectedQuizLesson, setSelectedQuizLesson] = useState<string>('all');
  
  const [quizList, setQuizList] = useState<RadicalInfo[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [choiceOptions, setChoiceOptions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [maxTime, setMaxTime] = useState<number>(10);
  const [streak, setStreak] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);

  // --- CANVAS & AI HANDWRITING STATES ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showGhostGuide, setShowGhostGuide] = useState(false);
  const [isGradingAI, setIsGradingAI] = useState(false);
  const [aiGradingResult, setAiGradingResult] = useState<{
    is_correct: boolean;
    score: number;
    status: 'excellent' | 'acceptable' | 'needs_improvement' | 'incorrect';
    status_label: string;
    feedback: string;
    stroke_tips?: string;
  } | null>(null);
  const [userDrawingSnapshot, setUserDrawingSnapshot] = useState<string>('');

  // Speedrun high score local storage load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('radicals_speedrun_high_score');
      if (saved) {
        setHighScore(parseInt(saved) || 0);
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'quiz') {
      setQuizState('menu');
    }
  }, [activeTab]);

  // Robust Back Handler: Exit active quiz first, or safely navigate back/fallback to home
  const handleBack = () => {
    if (activeTab === 'quiz' && quizState !== 'menu') {
      setQuizState('menu');
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1 && window.history.state?.idx > 0) {
      router.back();
    } else {
      router.push('/');
    }
  };

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
      ctx.font = '900 170px "Noto Sans JP", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(targetChar, w / 2, h / 2 + 5);
    }
  }, []);

  // Synchronize canvas when radical changes or ghost guide toggles
  useEffect(() => {
    if (quizState === 'write' && quizList[currentQuizIndex]) {
      const char = quizList[currentQuizIndex].character.split(' ')[0];
      const t = setTimeout(() => {
        drawGridAndGuide(char, showGhostGuide);
        setHasDrawn(false);
        setAiGradingResult(null);
        setUserDrawingSnapshot('');
      }, 50);
      return () => clearTimeout(t);
    }
  }, [quizState, currentQuizIndex, showGhostGuide, drawGridAndGuide, quizList]);

  // Canvas drawing events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isAnswerChecked || isGradingAI) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2dd4bf'; // Teal-400
    ctx.setLineDash([]);

    let x, y;
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

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isAnswerChecked || isGradingAI) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x, y;
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
    const char = quizList[currentQuizIndex]?.character.split(' ')[0];
    drawGridAndGuide(char, showGhostGuide);
    setHasDrawn(false);
    setAiGradingResult(null);
    setUserDrawingSnapshot('');
    setIsAnswerChecked(false);
  };

  // Local fallback stroke similarity evaluator (in case Gemini API is busy/offline)
  const calculateLocalSimilarity = (targetChar: string) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return {
        score: 75,
        is_correct: true,
        status: 'acceptable' as const,
        status_label: 'Đạt yêu cầu (75/100)',
        feedback: 'Nét vẽ cơ bản nhận diện được bộ thủ mục tiêu.'
      };
    }
    
    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const oCtx = offscreen.getContext('2d');
    if (!oCtx) {
      return {
        score: 75,
        is_correct: true,
        status: 'acceptable' as const,
        status_label: 'Đạt yêu cầu (75/100)',
        feedback: 'Nét vẽ cơ bản nhận diện được bộ thủ mục tiêu.'
      };
    }
    
    oCtx.fillStyle = '#090d1f';
    oCtx.fillRect(0, 0, offscreen.width, offscreen.height);
    oCtx.fillStyle = '#2dd4bf';
    oCtx.font = '900 170px "Noto Sans JP", sans-serif';
    oCtx.textAlign = 'center';
    oCtx.textBaseline = 'middle';
    oCtx.fillText(targetChar, offscreen.width / 2, offscreen.height / 2 + 5);

    const userCtx = canvas.getContext('2d');
    if (!userCtx) {
      return {
        score: 75,
        is_correct: true,
        status: 'acceptable' as const,
        status_label: 'Đạt yêu cầu (75/100)',
        feedback: 'Nét vẽ cơ bản nhận diện được bộ thủ mục tiêu.'
      };
    }

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

    if (userFilled < 12) {
      return {
        score: 20,
        is_correct: false,
        status: 'incorrect' as const,
        status_label: 'Chưa đủ nét (20/100)',
        feedback: 'Nét vẽ quá ít hoặc chưa hoàn thành. Hãy vẽ đầy đủ nét của bộ thủ nhé.'
      };
    }

    const precision = overlap / Math.max(1, userFilled);
    const recall = overlap / Math.max(1, targetFilled);
    const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    const rawScore = Math.min(100, Math.max(30, Math.round(f1 * 130) + 18));

    let status: 'excellent' | 'acceptable' | 'needs_improvement' | 'incorrect' = 'acceptable';
    let status_label = `Đạt yêu cầu (${rawScore}/100)`;
    let feedback = 'Nét vẽ tương đối chuẩn xác với bộ thủ mẫu. Tiếp tục phát huy!';

    if (rawScore >= 85) {
      status = 'excellent';
      status_label = `Xuất sắc! (${rawScore}/100)`;
      feedback = 'Nét vẽ rất chuẩn xác, cân đối và đúng tỷ lệ bộ thủ!';
    } else if (rawScore < 60) {
      status = 'needs_improvement';
      status_label = `Cần rèn thêm (${rawScore}/100)`;
      feedback = 'Hình dáng bộ thủ còn hơi lệch hoặc chưa cân đối, hãy thử bật gợi ý chữ mờ để đồ theo nhé.';
    }

    return {
      score: rawScore,
      is_correct: rawScore >= 60,
      status,
      status_label,
      feedback
    };
  };

  // Submit handwriting to Gemini Multimodal Vision AI for evaluation
  const handleAIGrading = async () => {
    const canvas = canvasRef.current;
    const currentRadical = quizList[currentQuizIndex];
    if (!canvas || !currentRadical || isGradingAI) return;

    const char = currentRadical.character.split(' ')[0];
    const imageBase64 = canvas.toDataURL('image/png');
    setUserDrawingSnapshot(imageBase64);
    setIsGradingAI(true);

    try {
      const res: any = await api.post('/api/ai/grade-radical', {
        targetRadical: char,
        sinoVietnamese: currentRadical.sinoVietnamese,
        meaning: currentRadical.meaning,
        imageBase64
      });

      if (res && res.success && res.data) {
        setAiGradingResult(res.data);
        setIsAnswerChecked(true);
        if (res.data.is_correct || res.data.score >= 70) {
          setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
        } else {
          setScore(prev => ({ ...prev, total: prev.total + 1 }));
        }
      } else {
        const localRes = calculateLocalSimilarity(char);
        setAiGradingResult(localRes);
        setIsAnswerChecked(true);
        if (localRes.is_correct) {
          setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
        } else {
          setScore(prev => ({ ...prev, total: prev.total + 1 }));
        }
      }
    } catch (err) {
      console.warn('AI Grading API call error, falling back to local evaluation:', err);
      const localRes = calculateLocalSimilarity(char);
      setAiGradingResult(localRes);
      setIsAnswerChecked(true);
      if (localRes.is_correct) {
        setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      } else {
        setScore(prev => ({ ...prev, total: prev.total + 1 }));
      }
    } finally {
      setIsGradingAI(false);
      speakText(char);
    }
  };

  // Generate choice options for multiple-choice mode
  const generateChoices = useCallback((correctRadical: RadicalInfo, sourcePool: RadicalInfo[]) => {
    if (!correctRadical) return;
    
    const formatOption = (rad: RadicalInfo) => 
      `${rad.sinoVietnamese.toLowerCase()} (${rad.meaning.toLowerCase()})`;
    
    const correctOption = formatOption(correctRadical);
    
    // Distractors pool: exclude the correct radical
    let pool = sourcePool.filter(r => r.character !== correctRadical.character);
    if (pool.length < 3) {
      pool = radicalsList.filter(r => r.character !== correctRadical.character);
    }
    
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    const distractors = shuffledPool.slice(0, 3).map(formatOption);
    
    const allOptions = [correctOption, ...distractors].sort(() => 0.5 - Math.random());
    setChoiceOptions(allOptions);
  }, [radicalsList]);

  // Start practice session
  const startPractice = () => {
    let eligible = radicalsList;
    if (selectedQuizLesson !== 'all') {
      const lesson = RADICAL_LESSONS.find(l => l.id === selectedQuizLesson);
      if (lesson && lesson.radicals.length > 0) {
        eligible = radicalsList.filter(r => {
          const clean = r.character.split(' ')[0];
          return lesson.radicals.includes(clean) || r.lessonId === selectedQuizLesson;
        });
      }
    }
    
    if (eligible.length === 0) {
      eligible = radicalsList;
    }

    const limitVal = practiceLimit === 999 ? eligible.length : Math.min(practiceLimit, eligible.length);
    const shuffled = [...eligible].sort(() => 0.5 - Math.random()).slice(0, limitVal);
    setQuizList(shuffled);
    setCurrentQuizIndex(0);
    setScore({ correct: 0, total: 0 });
    setIsAnswerChecked(false);
    
    if (practiceType === 'write') {
      setQuizState('write');
      setIsAnswerChecked(false);
      setAiGradingResult(null);
      setUserDrawingSnapshot('');
      setHasDrawn(false);
    } else if (practiceType === 'choice') {
      setQuizState('choice');
      generateChoices(shuffled[0], eligible);
    } else if (practiceType === 'speedrun') {
      setQuizState('speedrun');
      setStreak(0);
      setTimeLeft(10);
      setMaxTime(10);
      generateChoices(shuffled[0], radicalsList);
    }
  };

  // Quick switch from Lesson Card to Quiz
  const handleQuickPracticeLesson = (lessonId: string) => {
    setSelectedQuizLesson(lessonId);
    setActiveTab('quiz');
    setQuizState('menu');
  };



  const handleChoiceSelect = (selectedOption: string) => {
    if (isAnswerChecked) return;
    setIsAnswerChecked(true);
    
    const correctRadical = quizList[currentQuizIndex];
    const correctOption = `${correctRadical.sinoVietnamese.toLowerCase()} (${correctRadical.meaning.toLowerCase()})`;
    const isCorrect = selectedOption === correctOption;
    
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    speakText(correctRadical.character.split(' ')[0]);
  };

  const handleSpeedrunGameOver = useCallback(() => {
    setQuizState('finished');
    if (score.correct > highScore) {
      setHighScore(score.correct);
      if (typeof window !== 'undefined') {
        localStorage.setItem('radicals_speedrun_high_score', score.correct.toString());
      }
    }
  }, [score.correct, highScore]);

  const handleSpeedrunChoiceSelect = (selectedOption: string) => {
    const correctRadical = quizList[currentQuizIndex];
    const correctOption = `${correctRadical.sinoVietnamese.toLowerCase()} (${correctRadical.meaning.toLowerCase()})`;
    const isCorrect = selectedOption === correctOption;
    
    if (isCorrect) {
      const newScore = score.correct + 1;
      setScore(prev => ({
        correct: newScore,
        total: prev.total + 1
      }));
      setStreak(prev => prev + 1);
      
      speakText(correctRadical.character.split(' ')[0]);
      
      const newMaxTime = Math.max(3, 10 - Math.floor(newScore / 2) * 0.5);
      setMaxTime(newMaxTime);
      setTimeLeft(newMaxTime);
      
      const nextIdx = currentQuizIndex + 1;
      if (nextIdx < quizList.length) {
        setCurrentQuizIndex(nextIdx);
        generateChoices(quizList[nextIdx], radicalsList);
      } else {
        setQuizState('finished');
        if (newScore > highScore) {
          setHighScore(newScore);
          if (typeof window !== 'undefined') {
            localStorage.setItem('radicals_speedrun_high_score', newScore.toString());
          }
        }
      }
    } else {
      handleSpeedrunGameOver();
    }
  };

  const handleNextQuestion = () => {
    const nextIdx = currentQuizIndex + 1;
    if (nextIdx < quizList.length) {
      setCurrentQuizIndex(nextIdx);
      setIsAnswerChecked(false);
      setAiGradingResult(null);
      setUserDrawingSnapshot('');
      setHasDrawn(false);
      
      let eligible = radicalsList;
      if (selectedQuizLesson !== 'all') {
        const lesson = RADICAL_LESSONS.find(l => l.id === selectedQuizLesson);
        if (lesson && lesson.radicals.length > 0) {
          eligible = radicalsList.filter(r => {
            const clean = r.character.split(' ')[0];
            return lesson.radicals.includes(clean) || r.lessonId === selectedQuizLesson;
          });
        }
      }
      if (eligible.length === 0) eligible = radicalsList;

      if (practiceType === 'choice') {
        generateChoices(quizList[nextIdx], eligible);
      }
    } else {
      setQuizState('finished');
    }
  };

  // Speedrun timer effect
  useEffect(() => {
    let timerId: any = null;
    if (quizState === 'speedrun' && currentQuizIndex < quizList.length) {
      timerId = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            clearInterval(timerId);
            handleSpeedrunGameOver();
            return 0;
          }
          return Number((prev - 0.1).toFixed(2));
        });
      }, 100);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [quizState, currentQuizIndex, quizList, handleSpeedrunGameOver]);

  // Speech helper
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f24] to-[#040714] text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* Header section */}
      <header className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="px-4 py-2 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            title="Quay lại"
          >
            <span>⬅️</span> Quay lại
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 tracking-wider">
              CẨM NANG 176 BỘ THỦ KANJI
            </h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-bold tracking-widest">
              Lộ trình học & ôn tập bám sát 15 Video Bài Giảng Minato
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-50 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start md:self-center">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            📚 Học & Tra cứu theo bài
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            ⚡ Ôn tập & Kiểm tra
          </button>
        </div>
      </header>

      {/* Main container */}
      <main className="max-w-7xl mx-auto space-y-6">

        {/* --- LESSON SELECTOR BAR (15 VIDEO LESSONS) --- */}
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 dark:text-slate-500">
              Chọn bài học theo 15 Video (Từ 1 nét đến 17 nét)
            </span>
            <span className="text-[10px] font-bold text-teal-500">
              {selectedLessonId === 'all' ? 'Tất cả 176 bộ thủ' : currentLesson?.lessonNumber}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
            {/* All lessons option */}
            <button
              onClick={() => setSelectedLessonId('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                selectedLessonId === 'all'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-900 dark:text-white border-teal-500 shadow-md scale-105'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              🌟 Tất cả ({radicalsList.length} bộ)
            </button>

            {/* 15 Individual Lessons */}
            {RADICAL_LESSONS.map(lesson => {
              const isSelected = selectedLessonId === lesson.id;
              const hasRadicals = lesson.radicals.length > 0;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLessonId(lesson.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-900 dark:text-white border-teal-500 shadow-md scale-105'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span>{lesson.id === 'intro' ? '📌' : '📖'}</span>
                  <span>{lesson.lessonNumber}</span>
                  {hasRadicals && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected ? 'bg-slate-900/30 text-white' : 'bg-slate-200 dark:bg-slate-800 text-teal-400'
                    }`}>
                      {lesson.radicals.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* --- TAB 1: BROWSE RADICALS --- */}
        {activeTab === 'browse' && (
          <div className="space-y-6">

            {/* --- LESSON SUMMARY BANNER: CORE IDEAS & MEMORY METHOD --- */}
            {currentLesson ? (
              <div className="bg-slate-900/60 border border-teal-500/30 rounded-3xl p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-5 animate-in fade-in duration-300">
                {/* Header: Title, Stroke & Direct YouTube link */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">
                        {currentLesson.lessonNumber} • {currentLesson.strokesDescription}
                      </span>
                      {currentLesson.radicals.length > 0 && (
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {currentLesson.radicals.length} bộ thủ
                        </span>
                      )}
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-white">
                      {currentLesson.title}
                    </h2>
                  </div>

                  {/* Direct YouTube Video Link */}
                  <a
                    href={currentLesson.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition-all shadow-md hover:shadow-red-600/30 flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
                    title="Mở xem video bài giảng trực tiếp trên YouTube"
                  >
                    <span>▶️</span> Xem video trên YouTube ↗
                  </a>
                </div>

                {/* 2-Column Grid: Core Ideas & Memory Method */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Core Ideas */}
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🎯</span>
                      <h3 className="text-xs font-black uppercase tracking-wider text-teal-400">
                        Ý chính của bài học
                      </h3>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {currentLesson.keyIdeas.map((idea, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-teal-400 font-black mt-0.5">•</span>
                          <span>{idea}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right: Memory Method */}
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">💡</span>
                        <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
                          Phương pháp ôn nhớ đặc thù
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {currentLesson.memoryMethod}
                      </p>
                    </div>

                    {/* Quick Practice Button for this lesson */}
                    {currentLesson.radicals.length > 0 && (
                      <div className="pt-3 border-t border-slate-800/60 flex justify-end">
                        <button
                          onClick={() => handleQuickPracticeLesson(currentLesson.id)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
                        >
                          <span>⚡</span> Luyện tập {currentLesson.radicals.length} bộ thủ bài này
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Overview Welcome Banner when "All" is selected */
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      TỔNG HỢP 15 BÀI HỌC • 176 BỘ THỦ KANJI
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-black text-white">
                    Phương pháp học bộ thủ chiết tự & liên tưởng hình ảnh
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Hệ thống hóa toàn diện các bộ thủ từ 1 nét đến 17 nét theo giáo trình 15 video của cô Ngọc Tiệp Minato. Hãy chọn từng bài ở thanh trên để xem ý chính, phương pháp ôn nhớ và làm bài kiểm tra!
                  </p>
                </div>
                <button
                  onClick={() => { setActiveTab('quiz'); setQuizState('menu'); }}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg active:scale-95 whitespace-nowrap shrink-0 flex items-center gap-1.5"
                >
                  <span>⚡</span> Bắt đầu làm bài test tổng hợp
                </button>
              </div>
            )}
            
            {/* Search and Quick Filters bar */}
            <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search box */}
              <div className="relative w-full md:max-w-md">
                <input
                  type="text"
                  placeholder="Tìm kiếm bộ thủ, Hán Việt, ý nghĩa, ví dụ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                />
                <span className="absolute left-3.5 top-3 text-slate-400 text-xs">🔍</span>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status info */}
              <div className="text-xs text-slate-400 font-bold flex items-center gap-2">
                <span>Hiển thị:</span>
                <span className="text-teal-400 font-extrabold">{filteredRadicals.length}</span>
                <span>bộ thủ</span>
                {selectedLessonId !== 'all' && currentLesson && (
                  <span className="text-slate-500 font-medium">({currentLesson.lessonNumber})</span>
                )}
              </div>
            </div>

            {/* Radicals Grid */}
            {filteredRadicals.length === 0 ? (
              <div className="text-center py-16 text-slate-400 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20 space-y-2">
                <div className="text-3xl">📭</div>
                <p className="text-xs font-bold">
                  {selectedLessonId === 'intro' 
                    ? 'Bài mở đầu tập trung vào phương pháp tư duy và định hướng. Hãy chọn Bài 1.1 để bắt đầu học bộ thủ!' 
                    : 'Không tìm thấy bộ thủ nào trùng khớp với từ khóa tìm kiếm.'}
                </p>
                {selectedLessonId === 'intro' && (
                  <button
                    onClick={() => setSelectedLessonId('1-1')}
                    className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Chuyển sang Bài 1.1 ➔
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredRadicals.map((rad) => (
                  <div
                    key={rad.character}
                    onClick={() => setSelectedRadical(rad)}
                    className="group bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 p-4 rounded-2xl flex flex-col items-center justify-between gap-3 text-center cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(20,184,166,0.1)] shadow-sm"
                  >
                    {/* Big radical character */}
                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-3xl font-black text-slate-900 dark:text-white group-hover:text-teal-400 group-hover:border-teal-900 transition-colors shadow-inner">
                      {rad.character.split(' ')[0]}
                    </div>
                    {/* Sino-Vietnamese & meaning */}
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-extrabold text-teal-400 uppercase tracking-wider">
                        {rad.sinoVietnamese}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 line-clamp-1">
                        {rad.meaning}
                      </p>
                    </div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider group-hover:text-teal-400 transition-colors">
                      Xem chi tiết 🔍
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: PRACTICE INTERFACE --- */}
        {activeTab === 'quiz' && (
          <div className="max-w-2xl mx-auto py-2">
            
            {/* Control Bar during Active Play */}
            {(quizState === 'write' || quizState === 'choice' || quizState === 'speedrun') && (
              <div className="flex items-center justify-between mb-4 bg-slate-900/40 border border-slate-800 p-3 rounded-2xl backdrop-blur-md">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                    Chế độ: {practiceType === 'write' ? '✍️ Luyện viết bộ thủ (AI Chấm điểm)' : practiceType === 'choice' ? '🎯 Trắc nghiệm' : '⚡ Phản xạ nhanh'}
                  </span>
                  {practiceType === 'write' && (
                    <span className="text-[9px] text-teal-400 font-bold">
                      Vẽ trực tiếp lên bảng vẽ • AI Gemini phân tích nét & chấm điểm
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setQuizState('menu')}
                  className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-sm font-sans"
                >
                  <span>⬅️</span> Thoát bài ôn
                </button>
              </div>
            )}

            {/* 1. CONFIGURATION MENU SCREEN */}
            {quizState === 'menu' && (
              <div className="bg-slate-950/40 border border-slate-800 p-6 sm:p-8 rounded-3xl backdrop-blur-xl space-y-6 shadow-2xl animate-in fade-in duration-300">
                <div className="text-center space-y-1.5">
                  <h2 className="text-lg sm:text-xl font-black text-white">ÔN TẬP & KIỂM TRA BỘ THỦ KANJI</h2>
                  <p className="text-xs text-slate-400">Chọn chế độ luyện tập và phạm vi bài học tương ứng với video</p>
                </div>

                {/* Practice Mode Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Mode Choices */}
                  <div
                    onClick={() => setPracticeType('choice')}
                    className={`p-4 rounded-2xl border cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-36 ${
                      practiceType === 'choice'
                        ? 'bg-teal-950/30 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.15)]'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xl">🎯</div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider">Trắc nghiệm</h3>
                      <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">Chọn đáp án đúng từ 4 phương án gợi ý.</p>
                    </div>
                  </div>

                  {/* Mode Write */}
                  <div
                    onClick={() => setPracticeType('write')}
                    className={`p-4 rounded-2xl border cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-36 ${
                      practiceType === 'write'
                        ? 'bg-teal-950/30 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.15)]'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xl">✍️</span>
                      <span className="text-[8px] font-black bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        AI Chấm điểm
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider">Luyện viết bộ thủ</h3>
                      <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">Vẽ trực tiếp nét chữ trên bảng vẽ, AI Gemini chấm điểm độ chuẩn xác & dáng nét.</p>
                    </div>
                  </div>

                  {/* Mode Speedrun */}
                  <div
                    onClick={() => setPracticeType('speedrun')}
                    className={`p-4 rounded-2xl border cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-36 ${
                      practiceType === 'speedrun'
                        ? 'bg-amber-950/30 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xl">⚡</span>
                      {highScore > 0 && (
                        <span className="text-[8px] font-black bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full uppercase">
                          Kỷ lục: {highScore}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider">Phản xạ nhanh</h3>
                      <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">Trả lời trắc nghiệm dưới áp lực thời gian 10s.</p>
                    </div>
                  </div>
                </div>

                {/* Scope Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Lesson (15 video lessons) */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                      Phạm vi bài học (Theo 15 Video)
                    </label>
                    <select
                      value={selectedQuizLesson}
                      onChange={(e) => setSelectedQuizLesson(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer font-bold"
                    >
                      <option value="all">🌟 Tất cả các bài (176 bộ thủ)</option>
                      {RADICAL_LESSONS.filter(l => l.radicals.length > 0).map(l => (
                        <option key={l.id} value={l.id}>
                          {l.lessonNumber}: {l.title} ({l.radicals.length} bộ)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Question limits */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Số lượng câu hỏi</label>
                    <select
                      value={practiceLimit}
                      onChange={(e) => setPracticeLimit(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value={10}>10 câu hỏi</option>
                      <option value={15}>15 câu hỏi</option>
                      <option value={20}>20 câu hỏi</option>
                      <option value={30}>30 câu hỏi</option>
                      <option value={999}>Toàn bộ bộ thủ trong bài</option>
                    </select>
                  </div>
                </div>

                {/* Write Mode AI Guide Banner */}
                {practiceType === 'write' && (
                  <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-3 animate-in slide-in-from-top-1 duration-200">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <span className="font-black block text-[11px] uppercase tracking-wide text-teal-400">Trợ lý chấm điểm thư pháp Gemini AI</span>
                      <p className="text-[10px] text-slate-300 leading-relaxed mt-0.5">
                        Đề bài sẽ đưa ra tên Hán Việt & ý nghĩa của bộ thủ. Bạn hãy vẽ nét chữ lên bảng vẽ để AI phân tích cấu trúc nét, độ cân đối và chấm điểm.
                      </p>
                    </div>
                  </div>
                )}

                {/* Start Button */}
                <button
                  onClick={startPractice}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg active:scale-95 text-center tracking-widest uppercase"
                >
                  BẮT ĐẦU ÔN TẬP 🚀
                </button>
              </div>
            )}

            {/* 2. PRACTICE MODE: WRITE (LUYỆN VIẾT BỘ THỦ & AI CHẤM ĐIỂM) */}
            {quizState === 'write' && (
              <div className="space-y-6 animate-in fade-in duration-300 max-w-xl mx-auto">
                {/* Header score / progress */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                  <span>Câu hỏi: {currentQuizIndex + 1} / {quizList.length}</span>
                  <span className="text-teal-400 font-extrabold">Đúng: {score.correct} / {score.total}</span>
                </div>
                
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuizIndex) / quizList.length) * 100}%` }}
                  />
                </div>

                {/* Question Prompt Card */}
                <div className="bg-slate-950/40 border border-slate-800 p-5 sm:p-6 rounded-3xl backdrop-blur-xl space-y-2 text-center shadow-lg">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                      Hãy viết bộ thủ
                    </span>
                    <button
                      onClick={() => speakText(quizList[currentQuizIndex]?.character.split(' ')[0] || '')}
                      className="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Nghe phát âm"
                    >
                      🔊
                    </button>
                  </div>
                  
                  <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-200">
                    {quizList[currentQuizIndex]?.sinoVietnamese}
                  </div>
                  
                  <div className="text-xs font-bold text-slate-300">
                    Ý nghĩa: <span className="text-white font-black">{quizList[currentQuizIndex]?.meaning}</span>
                  </div>

                  {quizList[currentQuizIndex]?.description && (
                    <p className="text-[11px] text-slate-400 italic max-w-md mx-auto pt-1 leading-relaxed border-t border-slate-900 mt-2">
                      💡 {quizList[currentQuizIndex]?.description}
                    </p>
                  )}
                </div>

                {/* Drawing Board Canvas (Tian Zi Ge) */}
                <div className="flex flex-col items-center gap-3">
                  {/* Canvas Toolbar */}
                  <div className="w-full max-w-[320px] flex items-center justify-between text-xs px-1">
                    <button
                      onClick={() => setShowGhostGuide(prev => !prev)}
                      className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer text-[11px] border ${
                        showGhostGuide 
                          ? 'bg-teal-950/60 border-teal-500/60 text-teal-300' 
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{showGhostGuide ? '👁️ Tắt nét mẫu' : '👁️ Hiện nét mẫu'}</span>
                    </button>

                    <button
                      onClick={clearCanvas}
                      disabled={isGradingAI}
                      className="px-3 py-1 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer text-[11px] active:scale-95 disabled:opacity-50"
                    >
                      <span>🧹 Xóa bảng vẽ</span>
                    </button>
                  </div>

                  {/* Interactive Canvas */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 bg-[#090d1f]">
                    <canvas
                      ref={canvasRef}
                      width={320}
                      height={320}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="cursor-crosshair touch-none select-none block"
                    />

                    {!hasDrawn && !isAnswerChecked && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <span className="text-[11px] text-slate-600 font-bold bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800/80">
                          ✍️ Dùng chuột hoặc ngón tay để vẽ bộ thủ
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Grading & Feedback Area */}
                {!isAnswerChecked ? (
                  <button
                    onClick={handleAIGrading}
                    disabled={!hasDrawn || isGradingAI}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 disabled:from-slate-900 disabled:via-slate-900 disabled:to-slate-900 disabled:text-slate-600 text-white rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-95 shadow-xl flex items-center justify-center gap-2 tracking-wider uppercase"
                  >
                    {isGradingAI ? (
                      <>
                        <span className="animate-spin text-base">⚙️</span>
                        <span>AI ĐANG PHÂN TÍCH NÉT VẼ...</span>
                      </>
                    ) : (
                      <>
                        <span>🤖</span>
                        <span>CHẤM ĐIỂM BẰNG AI GEMINI</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-4 animate-in zoom-in-95 duration-200">
                    {/* Evaluation Result Card */}
                    {aiGradingResult && (
                      <div className={`p-5 rounded-3xl border backdrop-blur-xl space-y-4 shadow-xl ${
                        aiGradingResult.score >= 80
                          ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-300'
                          : aiGradingResult.score >= 55
                          ? 'bg-amber-950/25 border-amber-500/40 text-amber-300'
                          : 'bg-rose-950/25 border-rose-500/40 text-rose-300'
                      }`}>
                        <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {aiGradingResult.score >= 80 ? '🌟' : aiGradingResult.score >= 55 ? '👌' : '💪'}
                            </span>
                            <div>
                              <span className="text-xs font-black uppercase tracking-wider block">
                                {aiGradingResult.status_label || (aiGradingResult.score >= 80 ? 'Xuất sắc' : 'Đạt yêu cầu')}
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold">
                                Đánh giá bởi Gemini Vision AI
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-3xl font-black block">
                              {aiGradingResult.score}
                              <span className="text-xs font-bold text-slate-400">/100</span>
                            </span>
                          </div>
                        </div>

                        {/* AI Feedback Content */}
                        <div className="space-y-1.5 text-xs text-slate-200 leading-relaxed font-medium">
                          <p className="flex items-start gap-2">
                            <span className="text-base shrink-0">💬</span>
                            <span>{aiGradingResult.feedback}</span>
                          </p>
                          {aiGradingResult.stroke_tips && (
                            <p className="flex items-start gap-2 text-[11px] text-teal-300/90 pt-1">
                              <span className="text-sm shrink-0">💡</span>
                              <span>{aiGradingResult.stroke_tips}</span>
                            </p>
                          )}
                        </div>

                        {/* Visual Comparison: User drawing vs Target Radical */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-2.5 text-center flex flex-col items-center">
                            <span className="text-[9px] text-slate-400 font-bold uppercase mb-1.5">Nét vẽ của bạn</span>
                            {userDrawingSnapshot ? (
                              <img
                                src={userDrawingSnapshot}
                                alt="Nét vẽ học viên"
                                className="w-16 h-16 object-contain rounded-xl border border-slate-800 bg-[#090d1f]"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-xl border border-slate-800 bg-[#090d1f]" />
                            )}
                          </div>

                          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-2.5 text-center flex flex-col items-center">
                            <span className="text-[9px] text-slate-400 font-bold uppercase mb-1.5">Bộ thủ chuẩn</span>
                            <div className="w-16 h-16 rounded-xl border border-slate-800 bg-[#090d1f] flex items-center justify-center text-3xl font-black text-teal-400 shadow-inner">
                              {quizList[currentQuizIndex]?.character.split(' ')[0]}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={clearCanvas}
                        className="py-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                      >
                        <span>🔄</span>
                        <span>VẼ LẠI NÉT NÀY</span>
                      </button>

                      <button
                        onClick={handleNextQuestion}
                        className="py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-95 shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <span>{currentQuizIndex + 1 < quizList.length ? 'CÂU TIẾP THEO' : 'XEM KẾT QUẢ'}</span>
                        <span>➡️</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. PRACTICE MODE: CHOICE (TRẮC NGHIỆM) */}
            {quizState === 'choice' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Header score / progress */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                  <span>Câu hỏi: {currentQuizIndex + 1} / {quizList.length}</span>
                  <span className="text-teal-400">Đúng: {score.correct} / {score.total}</span>
                </div>
                
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuizIndex) / quizList.length) * 100}%` }}
                  />
                </div>

                {/* Radical Display Card */}
                <div className="bg-slate-950/40 border border-slate-800 p-8 sm:p-12 rounded-3xl backdrop-blur-xl flex flex-col items-center justify-center gap-4 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Hãy chọn Hán Việt và Nghĩa đúng</span>
                  <div className="w-24 h-24 bg-slate-950/60 border border-slate-800 rounded-3xl flex items-center justify-center text-5xl font-black text-white shadow-inner animate-pulse">
                    {quizList[currentQuizIndex]?.character.split(' ')[0]}
                  </div>
                </div>

                {/* Choice Buttons Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {choiceOptions.map(option => {
                    const correctOption = quizList[currentQuizIndex]
                      ? `${quizList[currentQuizIndex].sinoVietnamese.toLowerCase()} (${quizList[currentQuizIndex].meaning.toLowerCase()})`
                      : '';
                    const isOptionCorrect = option === correctOption;
                    
                    let btnStyle = "bg-slate-950/20 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900/40";
                    if (isAnswerChecked) {
                      if (isOptionCorrect) {
                        btnStyle = "bg-emerald-950/30 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
                      } else {
                        btnStyle = "bg-slate-950/20 border-slate-800 text-slate-500 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={option}
                        onClick={() => handleChoiceSelect(option)}
                        disabled={isAnswerChecked}
                        className={`w-full py-4 px-4 rounded-xl border text-xs font-black transition-all cursor-pointer active:scale-95 text-center ${btnStyle}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {/* Description and Next Button */}
                {isAnswerChecked && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-xs space-y-1">
                      <span className="text-[10px] text-teal-400 uppercase font-black tracking-wider block">
                        💡 Mẹo nhớ & Ý nghĩa
                      </span>
                      <p className="text-slate-300 font-sans leading-relaxed">
                        {quizList[currentQuizIndex]?.description}
                      </p>
                    </div>

                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 shadow-md"
                    >
                      {currentQuizIndex + 1 < quizList.length ? 'CÂU TIẾP THEO' : 'XEM KẾT QUẢ'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 4. PRACTICE MODE: SPEEDRUN (PHẢN XẠ NHANH) */}
            {quizState === 'speedrun' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Timer Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="text-amber-400 flex items-center gap-1">
                      🔥 Streak: {streak}
                    </span>
                    <span className="text-slate-400">
                      Điểm: <strong className="text-white">{score.correct}</strong>
                    </span>
                    <span className={`font-mono text-sm font-black ${timeLeft <= 3 ? 'text-red-500 animate-bounce' : 'text-teal-400'}`}>
                      ⏱️ {timeLeft.toFixed(1)}s
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-100 ${
                        timeLeft <= 3 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      }`}
                      style={{ width: `${(timeLeft / maxTime) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Radical Card */}
                <div className="bg-slate-950/40 border border-slate-800 p-8 sm:p-12 rounded-3xl backdrop-blur-xl flex flex-col items-center justify-center gap-4 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Chọn thật nhanh!</span>
                  <div className="w-24 h-24 bg-slate-950/60 border border-slate-800 rounded-3xl flex items-center justify-center text-5xl font-black text-white shadow-inner animate-pulse">
                    {quizList[currentQuizIndex]?.character.split(' ')[0]}
                  </div>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {choiceOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => handleSpeedrunChoiceSelect(option)}
                      className="w-full py-4 px-4 bg-slate-950/20 border border-slate-800 hover:border-teal-500 hover:bg-slate-900/60 text-slate-200 text-xs font-black rounded-xl transition-all cursor-pointer active:scale-95 text-center"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. FINISHED SCREEN */}
            {quizState === 'finished' && (
              <div className="bg-slate-950/40 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 mx-auto rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-4xl">
                  {practiceType === 'speedrun' ? '⚡' : '🏆'}
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-black text-white">HOÀN THÀNH ÔN TẬP!</h2>
                  <p className="text-xs text-slate-400">
                    {practiceType === 'speedrun' 
                      ? 'Bạn đã hoàn thành thử thách phản xạ nhanh!' 
                      : 'Chúc mừng bạn đã hoàn thành bài kiểm tra bộ thủ!'}
                  </p>
                </div>

                {/* Score badge */}
                <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-2xl flex justify-center items-center gap-6">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Đúng</span>
                    <span className="text-3xl font-black text-teal-400">{score.correct}</span>
                  </div>
                  <div className="w-px h-10 bg-slate-800" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Tổng số</span>
                    <span className="text-3xl font-black text-slate-300">{score.total}</span>
                  </div>
                  <div className="w-px h-10 bg-slate-800" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Tỷ lệ</span>
                    <span className="text-3xl font-black text-emerald-400">
                      {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={() => setQuizState('menu')}
                    className="py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-black rounded-xl cursor-pointer active:scale-95 transition-all"
                  >
                    ⚙️ Menu chính
                  </button>
                  <button
                    onClick={startPractice}
                    className="py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl cursor-pointer active:scale-95 transition-all shadow-lg"
                  >
                    🔄 Luyện tập lại
                  </button>
                  <button
                    onClick={() => { setActiveTab('browse'); setQuizState('menu'); }}
                    className="py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-teal-400 hover:text-teal-300 text-xs font-black rounded-xl cursor-pointer active:scale-95 transition-all"
                  >
                    📚 Danh sách bộ thủ
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* --- RADICAL DETAIL MODAL --- */}
      {selectedRadical && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
          <div className="relative w-full max-w-lg bg-[#0c1328] border border-teal-500/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(20,184,166,0.15)] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedRadical(null)}
              className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Head: character and main meanings */}
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-center text-4xl font-black text-white shrink-0 shadow-inner">
                {selectedRadical.character.split(' ')[0]}
              </div>
              <div>
                <h2 className="text-xl font-black text-teal-400 uppercase tracking-widest">
                  Bộ {selectedRadical.sinoVietnamese}
                </h2>
                <p className="text-xs font-extrabold text-slate-200">
                  Nghĩa: {selectedRadical.meaning}
                </p>
                {selectedRadical.lessonId && (
                  <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded bg-teal-950/40 text-teal-400 border border-teal-800">
                    Thuộc Bài {selectedRadical.lessonId}
                  </span>
                )}
              </div>
            </div>

            {/* Detailed Mnemonic description */}
            <div className="space-y-2">
              <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider block">
                💡 Mẹo nhớ & Ý nghĩa bộ thủ
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60 font-sans">
                {selectedRadical.description}
              </p>
            </div>

            {/* Examples list */}
            {selectedRadical.examples && selectedRadical.examples.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] text-teal-400 font-black uppercase tracking-wider block">
                  📚 Chữ Hán ví dụ chứa bộ thủ này
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedRadical.examples.map(ex => (
                    <div 
                      key={ex.char}
                      onClick={() => speakText(ex.char)}
                      className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl hover:border-teal-500/40 cursor-pointer active:scale-95 transition-all text-center group/ex flex sm:flex-col justify-between sm:justify-center items-center gap-1.5"
                      title="Nhấp để nghe âm đọc Nhật"
                    >
                      <div className="flex items-center sm:flex-col gap-2">
                        <span className="text-xl font-black text-white group-hover/ex:text-teal-400 transition-colors">
                          {ex.char}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold lowercase sm:block">
                          /{ex.romaji}/
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-300 truncate max-w-full">
                        {ex.meaning}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer buttons */}
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedRadical(null)}
                className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl cursor-pointer active:scale-95 transition-all"
              >
                Đóng lại
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
