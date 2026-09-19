'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  RADICALS_DICT,
  RadicalInfo,
  RADICAL_LESSONS,
  RadicalLesson,
  getRadicalSemanticDetails
} from '../utils/kanjiRadicals';
import { api } from '../utils/api';

export type RadicalStatus = 'not_learned' | 'learning' | 'mastered';

export default function RadicalsPage() {
  const router = useRouter();
  
  // Tab states: 'browse' (Học & Tra cứu) | 'quiz' (Ôn tập & Luyện tập)
  const [activeTab, setActiveTab] = useState<'browse' | 'quiz'>('browse');
  
  // Radical Learning Status State (character -> 'not_learned' | 'learning' | 'mastered')
  const [radicalStatusMap, setRadicalStatusMap] = useState<Record<string, RadicalStatus>>({});
  const [filterStatus, setFilterStatus] = useState<'all' | RadicalStatus>('all');

  // Practice Multi-Select Status Filter
  const [practiceFilterStatuses, setPracticeFilterStatuses] = useState<Record<RadicalStatus, boolean>>({
    not_learned: false,
    learning: false,
    mastered: false,
  });
  const [practiceDropdownOpen, setPracticeDropdownOpen] = useState(false);
  const [lessonDropdownOpen, setLessonDropdownOpen] = useState(false);


  // Lesson and search filter states for Browse Tab
  const [selectedLessonId, setSelectedLessonId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRadical, setSelectedRadical] = useState<RadicalInfo | null>(null);

  // State for AI in-depth radical explanation in modal
  const [aiRadicalExplain, setAiRadicalExplain] = useState<{
    loading: boolean;
    data: {
      origin_story?: string;
      kanji_role?: string;
      cultural_meaning?: string;
      mnemonic_tip?: string;
      common_kanji_breakdown?: {
        kanji: string;
        romaji: string;
        meaning: string;
        role_explanation: string;
      }[];
    } | null;
    error: string | null;
  }>({ loading: false, data: null, error: null });

  // Reset AI explanation whenever selectedRadical changes
  useEffect(() => {
    setAiRadicalExplain({ loading: false, data: null, error: null });
  }, [selectedRadical?.character]);

  const fetchAiRadicalExplain = async (rad: RadicalInfo) => {
    try {
      setAiRadicalExplain({ loading: true, data: null, error: null });
      const res: any = await api.post('/api/ai/radical-explain', {
        character: rad.character,
        sinoVietnamese: rad.sinoVietnamese,
        meaning: rad.meaning,
        description: rad.description
      });
      if (res && res.success && res.data) {
        setAiRadicalExplain({ loading: false, data: res.data, error: null });
      } else {
        setAiRadicalExplain({
          loading: false,
          data: null,
          error: res?.error || 'Không thể tải phân tích AI lúc này.'
        });
      }
    } catch (err: any) {
      setAiRadicalExplain({
        loading: false,
        data: null,
        error: err?.response?.data?.error || err?.message || 'Có lỗi khi kết nối tới dịch vụ AI.'
      });
    }
  };

  // Convert dict to list
  const radicalsList = useMemo(() => {
    return Object.values(RADICALS_DICT);
  }, []);

  // Currently selected lesson object
  const currentLesson = useMemo(() => {
    if (selectedLessonId === 'all') return null;
    return RADICAL_LESSONS.find(l => l.id === selectedLessonId) || null;
  }, [selectedLessonId]);

  // Filtered radicals list based on selected lesson, search query, and status filter
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
        
      if (!lessonMatch || !textMatch) return false;

      // Filter by learning status
      if (filterStatus !== 'all') {
        const radStatus = radicalStatusMap[rad.character] || 'not_learned';
        if (radStatus !== filterStatus) return false;
      }

      return true;
    });
  }, [radicalsList, selectedLessonId, searchQuery, filterStatus, radicalStatusMap]);

  // Counts by status
  const statusCounts = useMemo(() => {
    let notLearned = 0;
    let learning = 0;
    let mastered = 0;
    radicalsList.forEach(r => {
      const st = radicalStatusMap[r.character] || 'not_learned';
      if (st === 'mastered') mastered++;
      else if (st === 'learning') learning++;
      else notLearned++;
    });
    return { total: radicalsList.length, notLearned, learning, mastered };
  }, [radicalsList, radicalStatusMap]);

  // Close practice dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#radical-practice-dropdown-container')) {
        setPracticeDropdownOpen(false);
      }
      if (!target.closest('#radical-lesson-dropdown-container')) {
        setLessonDropdownOpen(false);
      }
    };
    if (practiceDropdownOpen || lessonDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [practiceDropdownOpen, lessonDropdownOpen]);


  // Load status from LocalStorage and Cloud Server
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('radicals_status_map');
      if (saved) {
        try {
          setRadicalStatusMap(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse radicals_status_map:', e);
        }
      }
    }

    // Cloud multi-device progress sync
    api.get('/api/user/progress?item_type=radical')
      .then((res: any) => {
        if (Array.isArray(res) && res.length > 0) {
          setRadicalStatusMap(prev => {
            const updated = { ...prev };
            res.forEach(item => {
              const idx = Number(item.item_id) - 1;
              if (idx >= 0 && idx < radicalsList.length) {
                const char = radicalsList[idx].character;
                if (['not_learned', 'learning', 'mastered'].includes(item.status)) {
                  updated[char] = item.status as RadicalStatus;
                }
              }
            });
            if (typeof window !== 'undefined') {
              localStorage.setItem('radicals_status_map', JSON.stringify(updated));
            }
            return updated;
          });
        }
      })
      .catch(() => {
        // Silently ignore if offline or demo
      });
  }, [radicalsList]);

  // Update status handler
  const handleStatusChange = async (character: string, newStatus: RadicalStatus) => {
    setRadicalStatusMap(prev => {
      const updated = { ...prev, [character]: newStatus };
      if (typeof window !== 'undefined') {
        localStorage.setItem('radicals_status_map', JSON.stringify(updated));
      }
      return updated;
    });

    const idx = radicalsList.findIndex(r => r.character === character);
    if (idx !== -1) {
      try {
        await api.post('/api/user/progress', {
          item_type: 'radical',
          item_id: idx + 1,
          status: newStatus
        });
      } catch (e) {
        console.error('Failed to sync radical status:', e);
      }
    }
  };

  // --- PRACTICE / QUIZ STATES ---
  const [quizState, setQuizState] = useState<'menu' | 'meaning' | 'write' | 'speedrun' | 'finished'>('menu');
  const [practiceType, setPracticeType] = useState<'meaning' | 'write' | 'speedrun'>('meaning');
  const [practiceLimit, setPracticeLimit] = useState<number>(15);
  const [selectedQuizLessons, setSelectedQuizLessons] = useState<string[]>([]);
  
  const [quizList, setQuizList] = useState<RadicalInfo[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [choiceOptions, setChoiceOptions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [maxTime, setMaxTime] = useState<number>(10);
  const [streak, setStreak] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);

  // 2-Row Meaning Quiz States (Row 1: Sino-Vietnamese, Row 2: Vietnamese Meaning with Partial Recall)
  const [inputSino, setInputSino] = useState('');
  const [inputMeaning, setInputMeaning] = useState('');
  const [isGradingMeaning, setIsGradingMeaning] = useState(false);
  const [meaningAIResult, setMeaningAIResult] = useState<{
    is_correct: boolean;
    score: number;
    status: 'correct' | 'partially_correct' | 'incorrect';
    status_label: string;
    sino_is_correct: boolean;
    sino_feedback: string;
    meaning_is_correct: boolean;
    meaning_feedback: string;
    matched_meanings: string[];
    missing_meanings: string[];
    suggested_sino: string;
    suggested_meaning: string;
  } | null>(null);

  const sinoInputRef = useRef<HTMLInputElement | null>(null);
  const meaningInputRef = useRef<HTMLInputElement | null>(null);

  // Eligible radicals count for quiz based on selected lessons & status filter
  const eligiblePracticeCount = useMemo(() => {
    let eligible = radicalsList;
    if (selectedQuizLessons.length > 0) {
      eligible = eligible.filter(r => {
        const clean = r.character.split(' ')[0];
        return selectedQuizLessons.some(lessonId => {
          const lesson = RADICAL_LESSONS.find(l => l.id === lessonId);
          return (lesson && lesson.radicals.includes(clean)) || r.lessonId === lessonId;
        });
      });
    }
    const activeStatuses = Object.keys(practiceFilterStatuses).filter(
      (k) => practiceFilterStatuses[k as RadicalStatus]
    );
    if (activeStatuses.length > 0) {
      eligible = eligible.filter((r) => {
        const st = radicalStatusMap[r.character] || 'not_learned';
        return practiceFilterStatuses[st as RadicalStatus];
      });
    }
    return eligible.length;
  }, [radicalsList, selectedQuizLessons, practiceFilterStatuses, radicalStatusMap]);

  // Auto-sync practiceLimit whenever eligiblePracticeCount changes
  useEffect(() => {
    if (eligiblePracticeCount > 0) {
      setPracticeLimit(prev => {
        // If previous limit was higher than total available, clamp it to eligiblePracticeCount
        if (prev > eligiblePracticeCount || prev === 0) {
          return eligiblePracticeCount;
        }
        return prev;
      });
    }
  }, [eligiblePracticeCount]);

  // Smart quick preset pills for question limit
  const presetPills = useMemo(() => {
    const total = eligiblePracticeCount;
    if (total <= 0) return [];
    const candidates = total <= 15 ? [5, 10] : total <= 30 ? [10, 15, 20] : [15, 30, 50];
    const valid = candidates.filter(c => c < total);
    return [...valid, total];
  }, [eligiblePracticeCount]);


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

  // Auto-focus Row 1 (Sino input) when a new question in 'meaning' mode is loaded
  useEffect(() => {
    if (quizState === 'meaning' && !isAnswerChecked) {
      const t = setTimeout(() => {
        sinoInputRef.current?.focus();
      }, 80);
      return () => clearTimeout(t);
    }
  }, [quizState, currentQuizIndex, isAnswerChecked]);

  // Global Enter Key to advance to next question when answer has been checked
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && quizState === 'meaning' && isAnswerChecked && !isGradingMeaning) {
        e.preventDefault();
        handleNextQuestion();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizState, isAnswerChecked, isGradingMeaning, currentQuizIndex, quizList.length]);


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
    if (selectedQuizLessons.length > 0) {
      eligible = eligible.filter(r => {
        const clean = r.character.split(' ')[0];
        return selectedQuizLessons.some(lessonId => {
          const lesson = RADICAL_LESSONS.find(l => l.id === lessonId);
          return (lesson && lesson.radicals.includes(clean)) || r.lessonId === lessonId;
        });
      });
    }
    
    // Filter by selected statuses
    const activeStatuses = Object.keys(practiceFilterStatuses).filter(
      (k) => practiceFilterStatuses[k as RadicalStatus]
    );
    if (activeStatuses.length > 0) {
      eligible = eligible.filter((r) => {
        const st = radicalStatusMap[r.character] || 'not_learned';
        return practiceFilterStatuses[st as RadicalStatus];
      });
    }

    if (eligible.length === 0) {
      alert('Không có bộ thủ nào phù hợp với phạm vi bài học và trạng thái đã chọn. Vui lòng chọn lại trạng thái khác hoặc để "Học hết"!');
      return;
    }

    const limitVal = Math.min(practiceLimit, eligible.length);
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
    } else if (practiceType === 'meaning') {
      setQuizState('meaning');
      setIsAnswerChecked(false);
      setInputSino('');
      setInputMeaning('');
      setMeaningAIResult(null);
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
    setSelectedQuizLessons([lessonId]);
    const lesson = RADICAL_LESSONS.find(l => l.id === lessonId);
    const lessonCount = lesson && lesson.radicals.length > 0 ? lesson.radicals.length : 15;
    setPracticeLimit(lessonCount);
    setActiveTab('quiz');
    setQuizState('menu');
  };


  // Local fallback meaning evaluator if AI is busy or offline
  const calculateLocalMeaningGrade = (radical: RadicalInfo, userSino: string, userMeaning: string) => {
    const cleanStr = (s: string) => (s || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    
    // Check Sino-Vietnamese
    const targetSinoClean = cleanStr(radical.sinoVietnamese);
    const userSinoClean = cleanStr(userSino);
    const sinoCorrect = targetSinoClean.length > 0 && userSinoClean.length > 0 && 
      (targetSinoClean === userSinoClean || targetSinoClean.includes(userSinoClean) || userSinoClean.includes(targetSinoClean));

    // Split target meanings by comma / semicolon / slash
    const targetMeanings = (radical.meaning || '').split(/[,;\/]/).map(m => m.trim()).filter(Boolean);
    const userMeaningClean = cleanStr(userMeaning);
    
    const matched: string[] = [];
    const missing: string[] = [];

    targetMeanings.forEach(m => {
      const mClean = cleanStr(m);
      if (userMeaningClean && (userMeaningClean.includes(mClean) || (mClean.length >= 2 && userMeaningClean.includes(mClean.slice(0, 3))))) {
        matched.push(m);
      } else {
        missing.push(m);
      }
    });

    const meaningCorrect = matched.length > 0;
    const is_correct = sinoCorrect && meaningCorrect;
    const is_partially_correct = !is_correct && (sinoCorrect || meaningCorrect);
    const score = (sinoCorrect && matched.length === targetMeanings.length) 
      ? 100 
      : is_correct 
      ? 90 
      : is_partially_correct 
      ? 65 
      : 20;

    const status: 'correct' | 'partially_correct' | 'incorrect' = 
      score >= 85 ? 'correct' : (is_partially_correct ? 'partially_correct' : 'incorrect');

    return {
      is_correct: score >= 60,
      score,
      status,
      status_label: score === 100 
        ? 'Chính xác hoàn hảo! (100/100)' 
        : score >= 85 
        ? 'Rất tốt! (' + score + '/100)' 
        : is_partially_correct 
        ? 'Đúng một phần (' + score + '/100)' 
        : 'Cần cố gắng thêm (' + score + '/100)',
      sino_is_correct: sinoCorrect,
      sino_feedback: sinoCorrect 
        ? 'Chính xác âm Hán Việt!' 
        : `Âm Hán Việt chuẩn là: ${radical.sinoVietnamese}`,
      meaning_is_correct: meaningCorrect,
      meaning_feedback: meaningCorrect 
        ? `Rất tốt! Bạn đã nhớ đúng nét nghĩa: "${matched.join(', ')}".` 
        : `Ý nghĩa chuẩn của bộ thủ là: ${radical.meaning}.`,
      matched_meanings: matched,
      missing_meanings: missing,
      suggested_sino: radical.sinoVietnamese,
      suggested_meaning: radical.meaning
    };
  };

  // Grade 2-row meaning input using Gemini AI
  const handleGradeMeaning = async () => {
    const currentRadical = quizList[currentQuizIndex];
    if (!currentRadical || isGradingMeaning || isAnswerChecked) return;

    const trimmedSino = inputSino.trim();
    const trimmedMeaning = inputMeaning.trim();

    if (!trimmedSino && !trimmedMeaning) {
      alert('Vui lòng nhập Tên Hán Việt hoặc Ý nghĩa bộ thủ trước khi kiểm tra!');
      sinoInputRef.current?.focus();
      return;
    }

    setIsGradingMeaning(true);

    try {
      const res: any = await api.post('/api/ai/grade-radical-full', {
        character: currentRadical.character.split(' ')[0],
        sinoVietnamese: currentRadical.sinoVietnamese,
        meaning: currentRadical.meaning,
        description: currentRadical.description,
        userSino: trimmedSino,
        userMeaning: trimmedMeaning
      });

      if (res && res.success && res.data) {
        setMeaningAIResult(res.data);
        setIsAnswerChecked(true);
        if (res.data.is_correct || res.data.score >= 70) {
          setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
        } else {
          setScore(prev => ({ ...prev, total: prev.total + 1 }));
        }
      } else {
        const localRes = calculateLocalMeaningGrade(currentRadical, trimmedSino, trimmedMeaning);
        setMeaningAIResult(localRes);
        setIsAnswerChecked(true);
        if (localRes.is_correct) {
          setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
        } else {
          setScore(prev => ({ ...prev, total: prev.total + 1 }));
        }
      }
    } catch (err) {
      console.warn('AI Grade Radical Full error, falling back to local check:', err);
      const localRes = calculateLocalMeaningGrade(currentRadical, trimmedSino, trimmedMeaning);
      setMeaningAIResult(localRes);
      setIsAnswerChecked(true);
      if (localRes.is_correct) {
        setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      } else {
        setScore(prev => ({ ...prev, total: prev.total + 1 }));
      }
    } finally {
      setIsGradingMeaning(false);
      speakText(currentRadical.character.split(' ')[0]);
    }
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
      setInputSino('');
      setInputMeaning('');
      setMeaningAIResult(null);
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
            <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl backdrop-blur-md space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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

                {/* Status Dropdown Filter */}
                <div className="flex items-center gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer font-bold shrink-0 shadow-sm"
                  >
                    <option value="all">🌟 Tất cả trạng thái ({statusCounts.total})</option>
                    <option value="not_learned">🔴 Chưa học ({statusCounts.notLearned})</option>
                    <option value="learning">🟡 Đang học ({statusCounts.learning})</option>
                    <option value="mastered">🟢 Đã thuộc ({statusCounts.mastered})</option>
                  </select>

                  {/* Count info */}
                  <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5 whitespace-nowrap">
                    <span>Hiển thị:</span>
                    <span className="text-teal-400 font-extrabold">{filteredRadicals.length}</span>
                    <span>bộ</span>
                  </div>
                </div>
              </div>

              {/* Status pills quick filters */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Tất cả ({statusCounts.total})
                </button>
                <button
                  onClick={() => setFilterStatus('not_learned')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterStatus === 'not_learned'
                      ? 'bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/40 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                  Chưa học ({statusCounts.notLearned})
                </button>
                <button
                  onClick={() => setFilterStatus('learning')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterStatus === 'learning'
                      ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/40 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                  Đang học ({statusCounts.learning})
                </button>
                <button
                  onClick={() => setFilterStatus('mastered')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterStatus === 'mastered'
                      ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Đã thuộc ({statusCounts.mastered})
                </button>
              </div>
            </div>

            {/* Radicals Grid */}
            {filteredRadicals.length === 0 ? (
              <div className="text-center py-16 text-slate-400 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20 space-y-2">
                <div className="text-3xl">📭</div>
                <p className="text-xs font-bold">
                  {selectedLessonId === 'intro' 
                    ? 'Bài mở đầu tập trung vào phương pháp tư duy và định hướng. Hãy chọn Bài 1.1 để bắt đầu học bộ thủ!' 
                    : 'Không tìm thấy bộ thủ nào trùng khớp với từ khóa tìm kiếm hoặc bộ lọc trạng thái.'}
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
                {filteredRadicals.map((rad) => {
                  const currentStatus = radicalStatusMap[rad.character] || 'not_learned';
                  return (
                    <div
                      key={rad.character}
                      onClick={() => setSelectedRadical(rad)}
                      className="group bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 p-3.5 rounded-2xl flex flex-col items-center justify-between gap-2.5 text-center cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(20,184,166,0.1)] shadow-sm"
                    >
                      {/* Big radical character */}
                      <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-3xl font-black text-slate-900 dark:text-white group-hover:text-teal-400 group-hover:border-teal-900 transition-colors shadow-inner">
                        {rad.character.split(' ')[0]}
                      </div>
                      {/* Sino-Vietnamese & meaning */}
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-extrabold text-teal-500 dark:text-teal-400 uppercase tracking-wider">
                          {rad.sinoVietnamese}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 line-clamp-1">
                          {rad.meaning}
                        </p>
                      </div>

                      {/* Status indicator / quick changer select */}
                      <div 
                        className="w-full flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(rad.character, e.target.value as RadicalStatus)}
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg border outline-none cursor-pointer transition-all ${
                            currentStatus === 'mastered'
                              ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/30'
                              : currentStatus === 'learning'
                              ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/30'
                              : 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/30'
                          }`}
                        >
                          <option value="not_learned" className="bg-white dark:bg-slate-900 text-red-500">🔴 Chưa</option>
                          <option value="learning" className="bg-white dark:bg-slate-900 text-amber-500">🟡 Đang</option>
                          <option value="mastered" className="bg-white dark:bg-slate-900 text-emerald-500">🟢 Thuộc</option>
                        </select>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider group-hover:text-teal-400 transition-colors">
                          Chi tiết 🔍
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: PRACTICE INTERFACE --- */}
        {activeTab === 'quiz' && (
          <div className="max-w-2xl mx-auto py-2">
            
            {/* Control Bar during Active Play */}
            {(quizState === 'write' || quizState === 'meaning' || quizState === 'speedrun') && (
              <div className="flex items-center justify-between mb-4 bg-slate-900/40 border border-slate-800 p-3 rounded-2xl backdrop-blur-md">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                    Chế độ: {practiceType === 'write' ? '✍️ Luyện viết bộ thủ (AI Chấm điểm)' : practiceType === 'meaning' ? '💡 Ôn Tên & Ý nghĩa (AI Chấm 2 Hàng)' : '⚡ Phản xạ nhanh'}
                  </span>
                  {practiceType === 'meaning' && (
                    <span className="text-[9px] text-teal-400 font-bold">
                      Nhập Tên Hán Việt & Ý nghĩa • AI tự động khen nghĩa đã nhớ & nhắc nghĩa còn thiếu
                    </span>
                  )}
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
                  {/* Mode Meaning (2 Rows AI Grading) */}
                  <div
                    onClick={() => setPracticeType('meaning')}
                    className={`p-4 rounded-2xl border cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-36 ${
                      practiceType === 'meaning'
                        ? 'bg-teal-950/30 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.15)]'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xl">💡</span>
                      <span className="text-[8px] font-black bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        AI Chấm 2 Hàng
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider">Ôn Tên & Ý nghĩa</h3>
                      <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">Nhập Tên Hán Việt và Ý nghĩa. AI chấm thông minh, khen nghĩa đã nhớ & nhắc nghĩa còn thiếu.</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Select Lesson Multi-select Checkbox (15 video lessons) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                        Phạm vi bài học (Chọn nhiều bài)
                      </label>
                      {selectedQuizLessons.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedQuizLessons([])}
                          className="text-[9px] text-teal-400 hover:text-teal-300 font-bold cursor-pointer transition-colors"
                        >
                          Chọn tất cả
                        </button>
                      )}
                    </div>
                    <div id="radical-lesson-dropdown-container" className="relative z-30">
                      <button
                        type="button"
                        onClick={() => setLessonDropdownOpen(!lessonDropdownOpen)}
                        className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 hover:border-slate-700 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-200 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-slate-400">📚:</span>
                          <span className="text-teal-400 truncate">
                            {selectedQuizLessons.length === 0
                              ? `Tất cả các bài (${radicalsList.length} bộ)`
                              : selectedQuizLessons.length === 1
                              ? `${RADICAL_LESSONS.find(l => l.id === selectedQuizLessons[0])?.lessonNumber || ''} (${RADICAL_LESSONS.find(l => l.id === selectedQuizLessons[0])?.radicals.length || 0} bộ)`
                              : `Đã chọn ${selectedQuizLessons.length} bài (${eligiblePracticeCount} bộ)`}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 ml-1">▼</span>
                      </button>

                      {lessonDropdownOpen && (
                        <div className="absolute left-0 right-0 mt-2 bg-[#0c1328] border border-slate-800 shadow-2xl rounded-2xl z-50 p-2.5 space-y-1.5 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 animate-in fade-in zoom-in-95 duration-150">
                          <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-800 px-1 text-[10px]">
                            <span className="text-slate-400 font-bold uppercase tracking-wider">
                              Tích chọn kết hợp:
                            </span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedQuizLessons([])}
                                className="text-teal-400 hover:underline font-bold cursor-pointer"
                              >
                                Tất cả
                              </button>
                              <span className="text-slate-600">•</span>
                              <button
                                type="button"
                                onClick={() => setSelectedQuizLessons(['1-1'])}
                                className="text-slate-400 hover:underline font-bold cursor-pointer"
                              >
                                Chỉ Bài 1.1
                              </button>
                            </div>
                          </div>

                          {RADICAL_LESSONS.filter(l => l.radicals.length > 0).map(lesson => {
                            const isChecked = selectedQuizLessons.includes(lesson.id);
                            return (
                              <label
                                key={lesson.id}
                                className="flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-900/60 rounded-xl cursor-pointer text-xs text-slate-300 hover:text-white transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setSelectedQuizLessons(prev => {
                                        if (checked) {
                                          return [...prev, lesson.id];
                                        } else {
                                          return prev.filter(id => id !== lesson.id);
                                        }
                                      });
                                    }}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-500 shrink-0"
                                  />
                                  <span className="font-bold text-white shrink-0">{lesson.lessonNumber}:</span>
                                  <span className="text-slate-400 text-[11px] truncate">{lesson.title.split(':')[0]}</span>
                                </div>
                                <span className="text-[10px] font-bold text-teal-400/90 bg-teal-500/10 px-1.5 py-0.5 rounded-md shrink-0">
                                  {lesson.radicals.length} bộ
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Practice Status Multi-select Filter */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                      Lọc trạng thái muốn ôn
                    </label>
                    <div id="radical-practice-dropdown-container" className="relative z-30">
                      <button
                        type="button"
                        onClick={() => setPracticeDropdownOpen(!practiceDropdownOpen)}
                        className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 hover:border-slate-700 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-200 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-slate-400">🔍:</span>
                          <span className="text-teal-400">
                            {Object.values(practiceFilterStatuses).filter(Boolean).length === 0
                              ? 'Học hết'
                              : Object.keys(practiceFilterStatuses)
                                  .filter((k) => practiceFilterStatuses[k as RadicalStatus])
                                  .map((k) =>
                                    k === 'not_learned'
                                      ? 'Chưa học'
                                      : k === 'learning'
                                      ? 'Đang học'
                                      : 'Đã thuộc'
                                  )
                                  .join(', ')}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 ml-1">▼</span>
                      </button>

                      {practiceDropdownOpen && (
                        <div className="absolute left-0 right-0 mt-2 bg-[#0c1328] border border-slate-800 shadow-2xl rounded-2xl z-50 p-2.5 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                          <label className="flex items-center space-x-2.5 px-2.5 py-1.5 hover:bg-slate-900/60 rounded-xl cursor-pointer text-xs text-slate-300 hover:text-white transition-colors">
                            <input
                              type="checkbox"
                              checked={practiceFilterStatuses.not_learned}
                              onChange={(e) =>
                                setPracticeFilterStatuses((prev) => ({
                                  ...prev,
                                  not_learned: e.target.checked,
                                }))
                              }
                              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-500"
                            />
                            <span className="flex items-center gap-1.5">
                              <span>🔴</span>
                              <span>Chưa học ({statusCounts.notLearned})</span>
                            </span>
                          </label>

                          <label className="flex items-center space-x-2.5 px-2.5 py-1.5 hover:bg-slate-900/60 rounded-xl cursor-pointer text-xs text-slate-300 hover:text-white transition-colors">
                            <input
                              type="checkbox"
                              checked={practiceFilterStatuses.learning}
                              onChange={(e) =>
                                setPracticeFilterStatuses((prev) => ({
                                  ...prev,
                                  learning: e.target.checked,
                                }))
                              }
                              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-500"
                            />
                            <span className="flex items-center gap-1.5">
                              <span>🟡</span>
                              <span>Đang học ({statusCounts.learning})</span>
                            </span>
                          </label>

                          <label className="flex items-center space-x-2.5 px-2.5 py-1.5 hover:bg-slate-900/60 rounded-xl cursor-pointer text-xs text-slate-300 hover:text-white transition-colors">
                            <input
                              type="checkbox"
                              checked={practiceFilterStatuses.mastered}
                              onChange={(e) =>
                                setPracticeFilterStatuses((prev) => ({
                                  ...prev,
                                  mastered: e.target.checked,
                                }))
                              }
                              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-500"
                            />
                            <span className="flex items-center gap-1.5">
                              <span>🟢</span>
                              <span>Đã thuộc ({statusCounts.mastered})</span>
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Question limits (Dynamic Stepper & Smart Preset Pills) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                        Số lượng câu hỏi
                      </label>
                      <span className="text-[10px] font-bold text-teal-400">
                        Tối đa: {eligiblePracticeCount}
                      </span>
                    </div>

                    {/* Stepper controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPracticeLimit(prev => Math.max(1, prev - 1))}
                        disabled={practiceLimit <= 1 || eligiblePracticeCount === 0}
                        className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-black flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95 transition-all text-sm shrink-0"
                        title="Giảm 1 câu"
                      >
                        -
                      </button>
                      
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          min={1}
                          max={Math.max(1, eligiblePracticeCount)}
                          value={practiceLimit}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setPracticeLimit(Math.min(Math.max(1, val), Math.max(1, eligiblePracticeCount)));
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-center text-teal-400 font-black focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setPracticeLimit(prev => Math.min(eligiblePracticeCount, prev + 1))}
                        disabled={practiceLimit >= eligiblePracticeCount || eligiblePracticeCount === 0}
                        className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-black flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95 transition-all text-sm shrink-0"
                        title="Tăng 1 câu"
                      >
                        +
                      </button>

                      <button
                        type="button"
                        onClick={() => setPracticeLimit(eligiblePracticeCount)}
                        disabled={eligiblePracticeCount === 0}
                        className="px-2.5 py-2 rounded-xl bg-teal-500/10 border border-teal-500/30 hover:bg-teal-500/20 text-teal-400 text-[10px] font-black uppercase cursor-pointer active:scale-95 transition-all shrink-0"
                        title="Làm toàn bộ số bộ thủ đã chọn"
                      >
                        Toàn bộ
                      </button>
                    </div>

                    {/* Quick Preset Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {presetPills.map(cnt => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setPracticeLimit(cnt)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            practiceLimit === cnt
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                              : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {cnt === eligiblePracticeCount ? `Toàn bộ (${cnt})` : `${cnt} câu`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>


                {/* Available Radicals Indicator */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
                  <span className="text-slate-400 font-bold">Số bộ thủ phù hợp với tiêu chí lọc:</span>
                  <span className={`font-black ${eligiblePracticeCount > 0 ? 'text-teal-400' : 'text-red-400'}`}>
                    {eligiblePracticeCount} bộ thủ
                  </span>
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

            {/* 3. PRACTICE MODE: MEANING (ÔN TÊN & Ý NGHĨA - AI CHẤM 2 HÀNG) */}
            {quizState === 'meaning' && (
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

                {/* Radical Character Display Card */}
                <div className="bg-slate-950/40 border border-slate-800 p-6 sm:p-8 rounded-3xl backdrop-blur-xl flex flex-col items-center justify-center gap-3 text-center relative overflow-hidden shadow-xl">
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      onClick={() => speakText(quizList[currentQuizIndex]?.character.split(' ')[0] || '')}
                      className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-teal-500 text-teal-400 hover:text-teal-300 text-sm transition-all cursor-pointer active:scale-95"
                      title="Phát âm tiếng Nhật"
                    >
                      🔊
                    </button>
                    <span className="px-2.5 py-1 bg-slate-900/80 border border-slate-800 text-[10px] font-bold text-slate-400 rounded-lg">
                      {currentQuizIndex + 1} / {quizList.length}
                    </span>
                  </div>

                  <span className="text-[10px] text-teal-400 font-black uppercase tracking-wider block">
                    Nhập Tên Hán Việt và Ý nghĩa bộ thủ
                  </span>

                  <div className="w-24 h-24 bg-slate-950/80 border border-slate-800 rounded-3xl flex items-center justify-center text-5xl font-black text-white shadow-inner">
                    {quizList[currentQuizIndex]?.character.split(' ')[0]}
                  </div>

                  <p className="text-[11px] text-slate-400 max-w-md">
                    Gợi ý: Nhấn <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-teal-300 font-mono">Enter</kbd> ở Hàng 1 để chuyển nhanh sang Hàng 2, và <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-teal-300 font-mono">Enter</kbd> ở Hàng 2 để AI chấm điểm.
                  </p>
                </div>

                {/* 2-Row Inputs Form */}
                <div className="bg-slate-950/40 border border-slate-800 p-5 sm:p-6 rounded-3xl space-y-4">
                  {/* Row 1: Sino-Vietnamese */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>🏷️</span>
                        <span>HÀNG 1: TÊN HÁN VIỆT</span>
                      </span>
                      <span className="text-[10px] font-normal text-slate-500">
                        Ví dụ: Nhất, Nhân, Nhật, Nguyệt...
                      </span>
                    </label>
                    <input
                      ref={sinoInputRef}
                      type="text"
                      disabled={isAnswerChecked || isGradingMeaning}
                      value={inputSino}
                      onChange={(e) => setInputSino(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          meaningInputRef.current?.focus();
                        }
                      }}
                      placeholder="Gõ tên Hán Việt (Nhấn Enter để sang hàng 2)..."
                      className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 rounded-2xl px-4 py-3 text-sm font-bold text-white placeholder-slate-500 transition-all outline-none"
                    />
                  </div>

                  {/* Row 2: Meaning */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>💡</span>
                        <span>HÀNG 2: Ý NGHĨA TIẾNG VIỆT</span>
                      </span>
                      <span className="text-[10px] font-normal text-slate-500">
                        Ví dụ: Số một, thứ nhất, khởi đầu...
                      </span>
                    </label>
                    <input
                      ref={meaningInputRef}
                      type="text"
                      disabled={isAnswerChecked || isGradingMeaning}
                      value={inputMeaning}
                      onChange={(e) => setInputMeaning(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!isAnswerChecked && !isGradingMeaning) {
                            handleGradeMeaning();
                          }
                        }
                      }}
                      placeholder="Gõ ý nghĩa của bộ thủ (Nhớ 1 nghĩa vẫn được chấm đúng & bổ sung nghĩa)..."
                      className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 rounded-2xl px-4 py-3 text-sm font-bold text-white placeholder-slate-500 transition-all outline-none"
                    />
                  </div>

                  {/* Action Button */}
                  {!isAnswerChecked && (
                    <button
                      onClick={handleGradeMeaning}
                      disabled={isGradingMeaning}
                      className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-95 shadow-lg flex items-center justify-center gap-2"
                    >
                      {isGradingMeaning ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>AI ĐANG PHÂN TÍCH & CHẤM ĐIỂM...</span>
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          <span>KIỂM TRA (AI CHẤM ĐIỂM)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Result Display Card (AI Grading Feedback) */}
                {isAnswerChecked && meaningAIResult && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
                    {/* Overall Score Banner */}
                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                      meaningAIResult.score >= 80
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                        : meaningAIResult.score >= 50
                        ? 'bg-amber-950/30 border-amber-500/50 text-amber-300'
                        : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {meaningAIResult.score >= 80 ? '🌟' : meaningAIResult.score >= 50 ? '💡' : '⚠️'}
                        </span>
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider block">
                            {meaningAIResult.status_label || (meaningAIResult.is_correct ? 'Đạt yêu cầu' : 'Chưa chính xác')}
                          </span>
                          <span className="text-[10px] opacity-80">
                            Điểm đánh giá thông minh: {meaningAIResult.score}/100
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black font-mono">
                          {meaningAIResult.score}
                        </span>
                        <span className="text-xs opacity-60">/100</span>
                      </div>
                    </div>

                    {/* 2 Comparison Cards (Sino & Meaning) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Card 1: Hán Việt */}
                      <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            🏷️ Tên Hán Việt
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            meaningAIResult.sino_is_correct
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {meaningAIResult.sino_is_correct ? '✅ Đúng' : '❌ Chưa chuẩn'}
                          </span>
                        </div>
                        <div className="text-xs space-y-1">
                          <p className="text-slate-400">
                            Bạn nhập: <strong className="text-white">{inputSino || '(để trống)'}</strong>
                          </p>
                          <p className="text-teal-400 font-bold">
                            Đáp án chuẩn: {meaningAIResult.suggested_sino}
                          </p>
                        </div>
                        {meaningAIResult.sino_feedback && (
                          <p className="text-[11px] text-slate-300 italic border-t border-slate-800/80 pt-2">
                            {meaningAIResult.sino_feedback}
                          </p>
                        )}
                      </div>

                      {/* Card 2: Ý nghĩa */}
                      <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            💡 Ý nghĩa bộ thủ
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            meaningAIResult.meaning_is_correct
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {meaningAIResult.meaning_is_correct ? '✅ Đã nhớ' : '❌ Chưa chính xác'}
                          </span>
                        </div>
                        <div className="text-xs space-y-1">
                          <p className="text-slate-400">
                            Bạn nhập: <strong className="text-white">{inputMeaning || '(để trống)'}</strong>
                          </p>
                          <p className="text-teal-400 font-bold">
                            Đáp án chuẩn: {meaningAIResult.suggested_meaning}
                          </p>
                        </div>
                        {meaningAIResult.meaning_feedback && (
                          <p className="text-[11px] text-slate-300 italic border-t border-slate-800/80 pt-2">
                            {meaningAIResult.meaning_feedback}
                          </p>
                        )}
                        {/* Matched Meanings Tags */}
                        {meaningAIResult.matched_meanings && meaningAIResult.matched_meanings.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-1">
                            {meaningAIResult.matched_meanings.map((m, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-md">
                                ✓ Đã nhớ: {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* PEDAGOGICAL FEATURE: Missing Meanings Proactive Reminder Alert */}
                    {meaningAIResult.missing_meanings && meaningAIResult.missing_meanings.length > 0 && (
                      <div className="bg-amber-950/20 border border-amber-500/40 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-start gap-3">
                          <span className="text-xl">💡</span>
                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                              Mở rộng kiến thức: Bộ này còn mang các nét nghĩa khác
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              Bạn đã nhớ rất tốt nghĩa trên! Ngoài ra, bộ <strong className="text-white font-bold">{quizList[currentQuizIndex]?.character.split(' ')[0]}</strong> còn có thêm nét nghĩa sau, hãy ghi nhớ thêm nhé:
                            </p>
                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                              {meaningAIResult.missing_meanings.map((m, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-lg"
                                >
                                  ➕ {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mnemonic Story & Context */}
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
                      <span className="text-[10px] text-teal-400 uppercase font-black tracking-wider block">
                        📖 Mẹo nhớ & Câu chuyện hình tượng
                      </span>
                      <p className="text-slate-300 font-sans leading-relaxed">
                        {quizList[currentQuizIndex]?.description}
                      </p>
                      {quizList[currentQuizIndex]?.examples && quizList[currentQuizIndex].examples.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/80">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
                            Các chữ Kanji tiêu biểu chứa bộ này:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {quizList[currentQuizIndex].examples.map((ex, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-slate-900 border border-slate-700/60 rounded-lg text-xs font-mono text-slate-200 flex items-center gap-1.5"
                              >
                                <strong className="text-teal-300 font-bold">{ex.char}</strong>
                                <span className="text-slate-400 text-[11px]">{ex.meaning} ({ex.romaji})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Next Question Button */}
                    <button
                      autoFocus
                      onClick={handleNextQuestion}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-95 shadow-lg flex items-center justify-center gap-2"
                    >
                      <span>{currentQuizIndex + 1 < quizList.length ? 'CÂU TIẾP THEO (Enter) ➔' : 'XEM KẾT QUẢ TỔNG KẾT ➔'}</span>
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

                {/* Practiced Radicals List & Quick Status Changer */}
                {quizList.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-800 text-left">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-teal-400">
                        📝 Danh sách bộ thủ trong bài ôn ({quizList.length})
                      </h3>
                      <span className="text-[10px] text-slate-500 font-bold">Nhấp để cập nhật trạng thái thuộc</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                      {quizList.map((rad) => {
                        const st = radicalStatusMap[rad.character] || 'not_learned';
                        return (
                          <div
                            key={rad.character}
                            onClick={() => setSelectedRadical(rad)}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-900/60 transition-all cursor-pointer group/item shadow-sm"
                            title="Nhấp để xem mô tả ý nghĩa chi tiết"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-lg font-black text-white group-hover/item:text-teal-400 shrink-0 transition-colors">
                                {rad.character.split(' ')[0]}
                              </span>
                              <div className="min-w-0">
                                <span className="text-xs font-black text-teal-400 block truncate group-hover/item:text-teal-300">{rad.sinoVietnamese}</span>
                                <span className="text-[10px] text-slate-400 block truncate">{rad.meaning}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={st}
                                onChange={(e) => handleStatusChange(rad.character, e.target.value as RadicalStatus)}
                                className={`text-[10px] font-black px-2 py-1 rounded-lg border outline-none cursor-pointer transition-all ${
                                  st === 'mastered'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : st === 'learning'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                                }`}
                              >
                                <option value="not_learned" className="bg-slate-900 text-red-400">🔴 Chưa học</option>
                                <option value="learning" className="bg-slate-900 text-amber-400">🟡 Đang học</option>
                                <option value="mastered" className="bg-slate-900 text-emerald-400">🟢 Đã thuộc</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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
      {selectedRadical && (() => {
        const semanticDetails = getRadicalSemanticDetails(
          selectedRadical.character,
          selectedRadical.meaning,
          selectedRadical.description
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
            <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#0b1226] border border-teal-500/25 rounded-3xl p-5 sm:p-7 space-y-5 shadow-[0_0_60px_rgba(20,184,166,0.18)] animate-in fade-in zoom-in-95 duration-200 custom-scrollbar">
              
              {/* Close button */}
              <button
                onClick={() => setSelectedRadical(null)}
                className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-sm transition-colors cursor-pointer z-10"
              >
                ✕
              </button>

              {/* Modal Head: Character, Audio, Title, Lesson */}
              <div className="flex items-start sm:items-center gap-4 border-b border-slate-800/80 pb-4 pr-8">
                <div className="relative group/head-char shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-teal-500/30 flex items-center justify-center text-4xl sm:text-5xl font-black text-white shadow-inner">
                    {selectedRadical.character.split(' ')[0]}
                  </div>
                  <button
                    onClick={() => speakText(selectedRadical.character.split(' ')[0])}
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-teal-600 hover:bg-teal-500 text-white text-xs shadow-md transition-transform active:scale-90 cursor-pointer"
                    title="Nghe phát âm tiếng Nhật"
                  >
                    🔊
                  </button>
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-teal-400 tracking-wider">
                      Bộ {selectedRadical.sinoVietnamese}
                    </h2>
                    {selectedRadical.lessonId && (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-950/60 text-teal-300 border border-teal-700/60">
                        Bài {selectedRadical.lessonId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Ký tự gốc: <span className="text-white font-mono font-bold text-sm">{selectedRadical.character}</span>
                  </p>
                </div>
              </div>

              {/* Status selection bar in Modal */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <span>Trạng thái:</span>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                    (radicalStatusMap[selectedRadical.character] || 'not_learned') === 'mastered'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : (radicalStatusMap[selectedRadical.character] || 'not_learned') === 'learning'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {(radicalStatusMap[selectedRadical.character] || 'not_learned') === 'mastered'
                      ? '🟢 Đã thuộc'
                      : (radicalStatusMap[selectedRadical.character] || 'not_learned') === 'learning'
                      ? '🟡 Đang học'
                      : '🔴 Chưa học'}
                  </span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedRadical.character, 'not_learned')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      (radicalStatusMap[selectedRadical.character] || 'not_learned') === 'not_learned'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    🔴 Chưa học
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedRadical.character, 'learning')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      (radicalStatusMap[selectedRadical.character] || 'not_learned') === 'learning'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    🟡 Đang học
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedRadical.character, 'mastered')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      (radicalStatusMap[selectedRadical.character] || 'not_learned') === 'mastered'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    🟢 Đã thuộc
                  </button>
                </div>
              </div>

              {/* 1. Core Meaning Badges */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-teal-950/20 border border-teal-500/25">
                <span className="text-[10px] text-teal-400 font-black uppercase tracking-wider block flex items-center gap-1.5">
                  <span>🎯</span> CÁC NÉT NGHĨA CHÍNH CỦA BỘ THỦ
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {semanticDetails.meaningBadges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-200 font-extrabold text-xs shadow-sm"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* 2. Pictographic & Symbolic Origin */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider block flex items-center gap-1.5">
                  <span>🗿</span> Ý NGHĨA TƯỢNG HÌNH & NGUỒN GỐC
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                  {semanticDetails.origin}
                </p>
              </div>

              {/* 3. Role in Kanji Composition */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/25">
                <span className="text-[10px] text-indigo-300 font-black uppercase tracking-wider block flex items-center gap-1.5">
                  <span>🧩</span> Ý NGHĨA KHI GHÉP VÀO CHỮ KANJI (GỢI Ý NGỮ NGHĨA)
                </span>
                <p className="text-xs text-indigo-100 leading-relaxed font-sans font-medium">
                  {semanticDetails.kanjiRole}
                </p>
              </div>

              {/* 4. Mnemonic Story */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider block flex items-center gap-1.5">
                  <span>💡</span> MẸO GHI NHỚ TRỰC QUAN & CHIẾT TỰ
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {selectedRadical.description}
                </p>
              </div>

              {/* 5. AI In-depth Explanation Section (Toggle / On-demand) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✨</span>
                    <span className="text-[11px] font-black text-slate-200 uppercase tracking-wider">
                      Phân tích chuyên sâu từ AI Gemini
                    </span>
                  </div>
                  {!aiRadicalExplain.data && !aiRadicalExplain.loading && (
                    <button
                      onClick={() => fetchAiRadicalExplain(selectedRadical)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-[10px] font-black transition-all cursor-pointer active:scale-95 shadow-md flex items-center gap-1"
                    >
                      <span>✨</span> Khám phá cội nguồn
                    </button>
                  )}
                </div>

                {/* Loading state */}
                {aiRadicalExplain.loading && (
                  <div className="py-4 flex items-center justify-center gap-3 text-xs font-bold text-teal-400 animate-pulse">
                    <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                    <span>AI đang tra cứu giáp cốt văn và triết lý cổ xưa...</span>
                  </div>
                )}

                {/* Error state */}
                {aiRadicalExplain.error && (
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-[11px] text-rose-300 flex items-center justify-between">
                    <span>{aiRadicalExplain.error}</span>
                    <button
                      onClick={() => fetchAiRadicalExplain(selectedRadical)}
                      className="text-xs font-bold text-teal-400 hover:underline cursor-pointer ml-2"
                    >
                      Thử lại
                    </button>
                  </div>
                )}

                {/* Result data */}
                {aiRadicalExplain.data && (
                  <div className="space-y-3 pt-2 text-xs text-slate-300 border-t border-slate-800/80 animate-in fade-in duration-300">
                    {aiRadicalExplain.data.cultural_meaning && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                          📜 Triết lý nhân sinh phương Đông:
                        </span>
                        <p className="text-slate-200 leading-relaxed">
                          {aiRadicalExplain.data.cultural_meaning}
                        </p>
                      </div>
                    )}

                    {aiRadicalExplain.data.origin_story && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block">
                          🏺 Cội nguồn hình ảnh cổ đại:
                        </span>
                        <p className="text-slate-300 leading-relaxed">
                          {aiRadicalExplain.data.origin_story}
                        </p>
                      </div>
                    )}

                    {aiRadicalExplain.data.common_kanji_breakdown && aiRadicalExplain.data.common_kanji_breakdown.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                          🔍 Phân tích chiết tự chữ Kanji tiêu biểu:
                        </span>
                        <div className="grid grid-cols-1 gap-2">
                          {aiRadicalExplain.data.common_kanji_breakdown.map((item, i) => (
                            <div key={i} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                              <span className="text-xl font-black text-white shrink-0">{item.kanji}</span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-teal-400">{item.meaning}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">/{item.romaji}/</span>
                                </div>
                                <p className="text-[11px] text-slate-300 mt-0.5">{item.role_explanation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 6. Kanji Examples */}
              {selectedRadical.examples && selectedRadical.examples.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-[10px] text-teal-400 font-black uppercase tracking-wider block">
                    📚 Chữ Hán ví dụ chứa bộ thủ này (Nhấp để nghe âm đọc)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {selectedRadical.examples.map(ex => (
                      <div 
                        key={ex.char}
                        onClick={() => speakText(ex.char)}
                        className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-teal-500/50 hover:bg-slate-900/60 cursor-pointer active:scale-95 transition-all text-center group/ex flex sm:flex-col justify-between sm:justify-center items-center gap-1.5 shadow-sm"
                        title="Nhấp để nghe âm đọc Nhật"
                      >
                        <div className="flex items-center sm:flex-col gap-1.5">
                          <span className="text-2xl font-black text-white group-hover/ex:text-teal-400 transition-colors">
                            {ex.char}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold lowercase">
                            /{ex.romaji}/
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-200 truncate max-w-full">
                          {ex.meaning}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedRadical(null)}
                  className="px-6 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-black rounded-xl cursor-pointer active:scale-95 transition-all"
                >
                  Đóng lại
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
