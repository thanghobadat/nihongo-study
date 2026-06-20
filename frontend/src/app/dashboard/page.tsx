'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../utils/api';
import CourseSwitcher from '../components/CourseSwitcher';

// Defined types
interface Lesson {
  id: number;
  title: string;
  description: string;
}

interface VocabItem {
  id: number;
  lesson_id: number;
  hiragana: string;
  romaji: string;
  vietnamese_meaning: string;
  status: 'not_learned' | 'learning' | 'mastered';
}

interface KanjiItem {
  id: number;
  lesson_id: number;
  character: string;
  status: 'not_learned' | 'learning' | 'mastered';
}

interface SkillEvaluations {
  vocab: string;
  kanji: string;
  grammar: string;
  listening_speaking: string;
  overall: string;
}

// Inline SVG helper to output consistent cute animal avatars
function getAvatarSvg(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 5;
  const svgs = [
    // Panda
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#f8fafc" stroke="#334155" stroke-width="3"/><circle cx="30" cy="30" r="10" fill="#1e293b"/><circle cx="70" cy="30" r="10" fill="#1e293b"/><ellipse cx="32" cy="52" rx="7" ry="9" fill="#1e293b"/><ellipse cx="68" cy="52" rx="7" ry="9" fill="#1e293b"/><circle cx="32" cy="50" r="2" fill="#ffffff"/><circle cx="68" cy="50" r="2" fill="#ffffff"/><ellipse cx="50" cy="65" rx="5" ry="3" fill="#1e293b"/><circle cx="28" cy="58" r="4" fill="#fecdd3"/><circle cx="72" cy="58" r="4" fill="#fecdd3"/></svg>`,
    // Bear
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#d97706" stroke="#b45309" stroke-width="3"/><circle cx="25" cy="25" r="12" fill="#b45309"/><circle cx="75" cy="25" r="12" fill="#b45309"/><circle cx="25" cy="25" r="6" fill="#fef3c7"/><circle cx="75" cy="25" r="6" fill="#fef3c7"/><circle cx="35" cy="48" r="3" fill="#000000"/><circle cx="65" cy="48" r="3" fill="#000000"/><ellipse cx="50" cy="62" rx="12" ry="9" fill="#fef3c7"/><polygon points="50,58 45,54 55,54" fill="#000000"/></svg>`,
    // Cat
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#94a3b8" stroke="#64748b" stroke-width="3"/><polygon points="20,25 35,5 45,28" fill="#64748b"/><polygon points="80,25 65,5 55,28" fill="#64748b"/><polygon points="23,23 33,9 41,25" fill="#fecdd3"/><polygon points="77,23 67,9 59,25" fill="#fecdd3"/><circle cx="35" cy="50" r="3" fill="#000000"/><circle cx="65" cy="50" r="3" fill="#000000"/><polygon points="50,60 46,55 54,55" fill="#fecdd3"/><path d="M46,65 Q50,68 54,65" fill="none" stroke="#000000" stroke-width="2"/></svg>`,
    // Fox
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#ea580c" stroke="#c2410c" stroke-width="3"/><polygon points="15,25 32,5 42,30" fill="#c2410c"/><polygon points="85,25 68,5 58,30" fill="#c2410c"/><ellipse cx="30" cy="55" rx="14" ry="18" fill="#ffffff"/><ellipse cx="70" cy="55" rx="14" ry="18" fill="#ffffff"/><circle cx="32" cy="52" r="3.5" fill="#000000"/><circle cx="68" cy="52" r="3.5" fill="#000000"/><ellipse cx="50" cy="68" rx="6" ry="4" fill="#000000"/></svg>`,
    // Rabbit
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="55" r="40" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3"/><ellipse cx="35" cy="25" rx="9" ry="22" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3"/><ellipse cx="65" cy="25" rx="9" ry="22" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3"/><ellipse cx="35" cy="25" rx="5" ry="16" fill="#f1f5f9"/><ellipse cx="65" cy="25" rx="5" ry="16" fill="#f1f5f9"/><circle cx="35" cy="52" r="3" fill="#000000"/><circle cx="65" cy="52" r="3" fill="#000000"/><ellipse cx="50" cy="62" rx="4" ry="2.5" fill="#fecdd3"/><circle cx="28" cy="60" r="4" fill="#fecdd3"/><circle cx="72" cy="60" r="4" fill="#fecdd3"/></svg>`
  ];
  return svgs[index];
}

export default function UserDashboard() {
  const router = useRouter();
  const user = api.getUser();

  // Navigation Items corresponding to the 7 Sheets
  const menuItems = [
    { name: 'Cẩm nang học', id: 'guide', icon: '📖', active: false },
    { name: 'Tiến độ học', id: 'dashboard', icon: '📊', active: true },
    { name: 'Lộ trình học', id: 'roadmap', icon: '🗺️', active: false },
    { name: 'Từ vựng', id: 'vocab', icon: '📚', active: false },
    { name: 'Chữ Hán (Kanji)', id: 'kanji', icon: '🉐', active: false },
    { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️', active: false },
    { name: 'Flashcards', id: 'flashcards', icon: '🃏', active: false },
    { name: 'Luyện nói (Kaiwa)', id: 'kaiwa', icon: '💬', active: false },
    { name: 'Ôn bảng chữ cái', id: 'kana', icon: '🔤', active: false }
  ];

  // UI State
  const [level, setLevel] = useState<'N5' | 'N4'>('N5');
  const [activeCourse, setActiveCourse] = useState<'minna' | 'marugoto'>('minna');
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [isLoadedFromLocalStorage, setIsLoadedFromLocalStorage] = useState<boolean>(false);

  // Load selectedLessonId and activeCourse from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCourse = localStorage.getItem('activeCourse') as 'minna' | 'marugoto';
      if (storedCourse) {
        setActiveCourse(storedCourse);
      }
      
      const stored = localStorage.getItem('selectedLessonId');
      if (stored) {
        const parsed = parseInt(stored);
        if (!isNaN(parsed)) {
          setSelectedLessonId(parsed);
          setLevel(parsed >= 26 ? 'N4' : 'N5');
        }
      } else if (storedCourse === 'marugoto') {
        setSelectedLessonId(101);
      }
      setIsLoadedFromLocalStorage(true);
    }
  }, []);

  // Save selectedLessonId to localStorage whenever it changes
  useEffect(() => {
    if (isLoadedFromLocalStorage && selectedLessonId) {
      localStorage.setItem('selectedLessonId', selectedLessonId.toString());
    }
  }, [selectedLessonId, isLoadedFromLocalStorage]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [vocabItems, setVocabItems] = useState<VocabItem[]>([]);
  const [kanjiItems, setKanjiItems] = useState<KanjiItem[]>([]);
  const [grammarItems, setGrammarItems] = useState<any[]>([]);

  // Mobile navigation drawer toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Plan Configurator States
  const [startDateStr, setStartDateStr] = useState<string>('2026-06-13');
  const [endDateStr, setEndDateStr] = useState<string>('2026-06-20');

  // Evaluations container (still loaded/saved in target plan text field)
  const [evaluations, setEvaluations] = useState<SkillEvaluations>({
    vocab: '🔴 Chưa đạt',
    kanji: '🔴 Chưa đạt',
    grammar: '🔴 Chưa đạt',
    listening_speaking: '🔴 Chưa đạt',
    overall: '🔴 Chưa đạt'
  });

  // Global plans fetched from backend
  const [fullPlansJson, setFullPlansJson] = useState<any>({});
  
  // Loading state indicators
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);

  // Helper date calculators
  const parseDate = (dStr: string) => {
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return new Date();
  };

  const getDaysDiff = (start: Date, end: Date) => {
    const timeDiff = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = parseDate(startDateStr);
  const endDate = parseDate(endDateStr);

  const totalDays = getDaysDiff(startDate, endDate) + 1;
  const daysRemaining = today > endDate ? 0 : getDaysDiff(today, endDate) + 1;
  const daysElapsed = today < startDate ? 0 : Math.min(totalDays, getDaysDiff(startDate, today) + 1);

  // Stats summaries
  const vocabTotal = vocabItems.length || 40;
  const vocabMastered = vocabItems.filter(v => v.status === 'mastered').length;
  const vocabPercentage = vocabTotal ? parseFloat(((vocabMastered / vocabTotal) * 100).toFixed(1)) : 0;

  const kanjiTotal = kanjiItems.length || 11;
  const kanjiMastered = kanjiItems.filter(k => k.status === 'mastered').length;
  const kanjiPercentage = kanjiTotal ? parseFloat(((kanjiMastered / kanjiTotal) * 100).toFixed(1)) : 0;

  const grammarTotal = grammarItems.length || 5;
  const grammarMastered = grammarItems.filter(g => g.status === 'mastered').length;
  const grammarPercentage = grammarTotal ? parseFloat(((grammarMastered / grammarTotal) * 100).toFixed(1)) : 0;

  // Auto-calculated targets
  const calculatedVocabTargetPerDay = Math.ceil(vocabTotal / totalDays) || 5;
  const calculatedKanjiTargetPerDay = Math.ceil(kanjiTotal / totalDays) || 2;
  const calculatedGrammarTargetPerDay = Math.ceil(grammarTotal / totalDays) || 1;

  const targetVocabToday = Math.min(vocabTotal, daysElapsed * calculatedVocabTargetPerDay);
  const targetKanjiToday = Math.min(kanjiTotal, daysElapsed * calculatedKanjiTargetPerDay);
  const targetGrammarToday = Math.min(grammarTotal, daysElapsed * calculatedGrammarTargetPerDay);

  const vocabBehind = Math.max(0, targetVocabToday - vocabMastered);
  const kanjiBehind = Math.max(0, targetKanjiToday - kanjiMastered);
  const grammarBehind = Math.max(0, targetGrammarToday - grammarMastered);

  // Status planning: 🏃 Đang tiến hành, 🔴 Trễ hạn, 🟢 Hoàn thành
  let planStatus = '🏃 Đang tiến hành';
  if (vocabMastered === vocabTotal && kanjiMastered === kanjiTotal && grammarMastered === grammarTotal) {
    planStatus = '🟢 Hoàn thành';
  } else if (today > endDate) {
    planStatus = '🔴 Trễ hạn';
  }

  // Level Completion Forecast calculation
  const endLessonOfLevel = level === 'N5' ? 25 : 50;
  const remainingLessons = Math.max(0, endLessonOfLevel - selectedLessonId);
  const daysPerLesson = totalDays || 8;
  const daysRemainingCurrentLesson = daysRemaining || 0;
  const totalDaysToCompleteLevel = daysRemainingCurrentLesson + (remainingLessons * daysPerLesson);

  const forecastDate = new Date();
  forecastDate.setDate(forecastDate.getDate() + totalDaysToCompleteLevel);
  const forecastDateString = `${forecastDate.getDate().toString().padStart(2, '0')}/${(forecastDate.getMonth() + 1).toString().padStart(2, '0')}/${forecastDate.getFullYear()}`;

  // Fetch initial lessons and user configurations
  const loadInitialData = useCallback(async () => {
    if (!isLoadedFromLocalStorage) return;
    setLoading(true);
    try {
      const lessonData = await api.get(`/api/user/lessons?course=${activeCourse}`);
      if (Array.isArray(lessonData)) {
        setLessons(lessonData);
      }

      const planData = await api.get('/api/user/target-plan');
      if (planData && !planData.message) {
        let parsedPlans: any = {};
        if (planData.self_evaluation) {
          try {
            parsedPlans = JSON.parse(planData.self_evaluation);
          } catch (e) {
            console.error("Failed to parse evaluations JSON, starting fresh:", e);
          }
        }
        setFullPlansJson(parsedPlans);
        
        // Populate plan details for the default selected lesson
        const lessonPlan = parsedPlans.lesson_plans?.[selectedLessonId];
        if (lessonPlan) {
          setStartDateStr(lessonPlan.start_date || '2026-06-13');
          setEndDateStr(lessonPlan.end_date || '2026-06-20');
          if (lessonPlan.evaluations) {
            setEvaluations(lessonPlan.evaluations);
          }
        } else {
          setStartDateStr(planData.start_date || '2026-06-13');
          setEndDateStr(planData.end_date || '2026-06-20');
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard configurations:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedLessonId, activeCourse, isLoadedFromLocalStorage]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load vocabulary & Kanji items when lesson selection updates
  useEffect(() => {
    if (!isLoadedFromLocalStorage) return;
    async function loadLessonStats() {
      try {
        const vocabData = await api.get(`/api/user/lessons/${selectedLessonId}/vocabulary`);
        const kanjiData = await api.get(`/api/user/lessons/${selectedLessonId}/kanji`);
        const grammarData = await api.get(`/api/user/lessons/${selectedLessonId}/grammar`);
        if (Array.isArray(vocabData)) setVocabItems(vocabData);
        if (Array.isArray(kanjiData)) setKanjiItems(kanjiData);
        if (Array.isArray(grammarData)) setGrammarItems(grammarData);
      } catch (error) {
        console.error('Failed to load stats for lesson:', selectedLessonId, error);
      }
    }
    loadLessonStats();

    // Dynamically retrieve stored plan values for this specific lesson
    if (fullPlansJson && fullPlansJson.lesson_plans?.[selectedLessonId]) {
      const lessonPlan = fullPlansJson.lesson_plans[selectedLessonId];
      setStartDateStr(lessonPlan.start_date || '2026-06-13');
      setEndDateStr(lessonPlan.end_date || '2026-06-20');
      if (lessonPlan.evaluations) {
        setEvaluations(lessonPlan.evaluations);
      }
    } else {
      setStartDateStr('2026-06-13');
      setEndDateStr('2026-06-20');
      setEvaluations({
        vocab: '🔴 Chưa đạt',
        kanji: '🔴 Chưa đạt',
        grammar: '🔴 Chưa đạt',
        listening_speaking: '🔴 Chưa đạt',
        overall: '🔴 Chưa đạt'
      });
    }
  }, [selectedLessonId, isLoadedFromLocalStorage]); // ONLY run when selectedLessonId or load status changes, preventing locks

  // Auto-saves target plan when dates change
  const autoSavePlanDates = async (start: string, end: string) => {
    // Only save to API if both dates are valid YYYY-MM-DD strings to prevent partial input errors
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start) || !dateRegex.test(end)) {
      return;
    }

    const startD = parseDate(start);
    const endD = parseDate(end);
    if (isNaN(startD.getTime()) || isNaN(endD.getTime())) {
      return;
    }

    const calculatedDays = getDaysDiff(startD, endD) + 1;

    const newVocabTarget = Math.ceil(vocabTotal / calculatedDays) || 5;
    const newKanjiTarget = Math.ceil(kanjiTotal / calculatedDays) || 2;
    const newGrammarTarget = Math.ceil(grammarTotal / calculatedDays) || 1;

    const updatedPlans = {
      ...fullPlansJson,
      lesson_plans: {
        ...fullPlansJson.lesson_plans,
        [selectedLessonId]: {
          start_date: start,
          end_date: end,
          vocab_target: newVocabTarget,
          kanji_target: newKanjiTarget,
          grammar_target: newGrammarTarget,
          evaluations: evaluations
        }
      }
    };

    try {
      await api.post('/api/user/target-plan', {
        start_date: start,
        end_date: end,
        vocabulary_target: newVocabTarget,
        kanji_target: newKanjiTarget,
        grammar_target: newGrammarTarget,
        self_evaluation: JSON.stringify(updatedPlans)
      });
      setFullPlansJson(updatedPlans);
      showNotification('Kế hoạch đã được tự động cập nhật!');
    } catch (err) {
      console.error('Failed to auto-save plan dates:', err);
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDateStr(val);
    autoSavePlanDates(val, endDateStr);
  };

  const handleEndDateChange = (val: string) => {
    setEndDateStr(val);
    autoSavePlanDates(startDateStr, val);
  };

  // Handle Level switching
  const handleLevelChange = (selectedLevel: 'N5' | 'N4') => {
    setLevel(selectedLevel);
    if (selectedLevel === 'N5') {
      setSelectedLessonId(1);
    } else {
      setSelectedLessonId(26);
    }
  };

  // Helper for progress blocks
  const renderProgressBar = (percentage: number) => {
    const totalBlocks = 10;
    const filledBlocks = Math.round(percentage / 10);
    const emptyBlocks = totalBlocks - filledBlocks;
    const filledStr = '█'.repeat(filledBlocks);
    const emptyStr = '░'.repeat(emptyBlocks);
    return `[${filledStr}${emptyStr}]`;
  };

  const showNotification = (msg: string) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage(null);
    }, 2500);
  };

  const handleLogout = () => {
    api.clearAuth();
    router.replace('/login');
  };

  // Filter lessons matching active Level
  const filteredLessons = lessons.filter(l => {
    if (activeCourse === 'marugoto') return true;
    if (level === 'N5') return l.id >= 1 && l.id <= 25;
    return l.id >= 26 && l.id <= 50;
  });

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-gradient-to-br from-[#0b1329] via-[#090d1a] to-[#050811] text-slate-100 font-sans relative">
      
      {/* Mobile Hamburger toggle button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden absolute top-4 left-4 z-40 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 cursor-pointer backdrop-blur-md active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar backdrop overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* 1. Left Sidebar Navigation Menu */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950/95 border-r border-slate-900 flex flex-col justify-between p-6 backdrop-blur-xl shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Logo Title & Mobile Close button */}
          <div className="flex items-center justify-between mb-8 px-2 shrink-0">
            <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              {activeCourse === 'marugoto' ? 'Marugoto A1' : 'Minna Nihongo'}
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-200 text-xl p-1 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Course Switcher */}
          <CourseSwitcher
            activeCourse={activeCourse}
            onSwitch={(course) => {
              setActiveCourse(course);
              localStorage.setItem('activeCourse', course);
              setSelectedLessonId(course === 'minna' ? 1 : 101);
            }}
          />

          {/* Category items */}
          <nav className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-0 select-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-800 hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {menuItems.filter(item => {
              if (activeCourse === 'marugoto' && (item.id === 'flashcards' || item.id === 'kaiwa' || item.id === 'guide' || item.id === 'kana')) {
                return false;
              }
              return true;
            }).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setIsSidebarOpen(false);
                  if (item.id === 'guide') {
                    router.push('/guide');
                  } else if (item.id === 'dashboard') {
                    // Stay here
                  } else if (item.id === 'roadmap') {
                    router.push('/roadmap');
                  } else if (item.id === 'kana') {
                    router.push('/kana');
                  } else if (item.id !== 'dashboard') {
                    router.push(`/lessons/${selectedLessonId}?tab=${item.id}`);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium ${
                  item.active
                    ? 'bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-900/40 text-blue-400 shadow-[0_0_15px_rgba(29,78,216,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom profile component */}
        <div className="pt-6 border-t border-slate-900/80 space-y-4 shrink-0">
          <div className="flex items-center space-x-3 px-2">
            <div
              className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700/50 flex items-center justify-center overflow-hidden"
              dangerouslySetInnerHTML={{ __html: getAvatarSvg(user?.id || 'default') }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-200 truncate">
                {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Học viên'}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-900/80 hover:bg-red-950/20 border border-slate-800 hover:border-red-900/40 rounded-xl text-slate-400 hover:text-red-400 transition-all duration-300 text-sm font-medium active:scale-[0.98] cursor-pointer"
          >
            <span>🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-20 lg:p-10 space-y-6 md:space-y-8">
        
        {/* Toast Notification message */}
        {message && (
          <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-slate-900 border border-blue-800 text-slate-200 text-xs sm:text-sm rounded-xl shadow-2xl backdrop-blur-xl animate-fade-in flex items-center space-x-2">
            <span>ℹ️</span>
            <span>{message}</span>
          </div>
        )}

        {/* Header Title with level selections */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white mb-1">
              TIẾN ĐỘ HỌC TIẾNG NHẬT BÀI {selectedLessonId}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Quản lý kế hoạch học tập cá nhân và theo dõi chỉ tiêu hàng ngày
            </p>
          </div>
          
          {/* Level Switcher N5/N4 & Lesson Dropdown Selector */}
          <div className="flex items-center space-x-3 self-start sm:self-auto">
            {activeCourse === 'minna' && (
              <div className="bg-slate-950/60 p-1 rounded-xl border border-slate-900 flex">
                <button
                  onClick={() => handleLevelChange('N5')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    level === 'N5'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  N5
                </button>
                <button
                  onClick={() => handleLevelChange('N4')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    level === 'N4'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  N4
                </button>
              </div>
            )}

            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(parseInt(e.target.value))}
              className="bg-slate-950/60 border border-slate-900 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 font-bold focus:outline-none focus:border-blue-700/60 cursor-pointer min-w-[130px]"
            >
              {filteredLessons.map((l) => (
                <option key={l.id} value={l.id} className="bg-[#0b1329] text-slate-200">
                  {l.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs">Đang tải dữ liệu học tập...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8">

            {/* Today's Target Status */}
            <div className="md:col-span-2 lg:col-span-12 bg-slate-900/40 border border-slate-800 p-5 sm:p-6 rounded-2xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-5 border-b border-slate-800/60 pb-3">
                <h2 className="text-sm sm:text-md font-bold text-slate-200 flex items-center space-x-2">
                  <span>🎯</span>
                  <span>TIẾN ĐỘ HÔM NAY</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Vocab target today */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/50 flex flex-col justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-300">Từ vựng tích lũy hôm nay</h3>
                    <p className="text-[10px] text-slate-500">Mục tiêu hàng ngày để hoàn thành đúng lộ trình</p>
                  </div>
                  <div className="flex items-center justify-between w-full pt-3 border-t border-slate-800/40">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <span className="block text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Chỉ tiêu</span>
                        <span className="text-xl sm:text-2xl font-black text-indigo-400">{targetVocabToday}</span>
                      </div>
                      <div className="h-6 w-px bg-slate-800" />
                      <div className="text-center">
                        <span className="block text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Thực tế</span>
                        <span className="text-xl sm:text-2xl font-black text-emerald-400">{vocabMastered}</span>
                      </div>
                    </div>
                    {vocabBehind > 0 ? (
                      <span className="px-2 py-0.5 bg-red-950/30 border border-red-900/50 text-[9px] sm:text-[10px] font-bold text-red-400 rounded-lg whitespace-nowrap">🔴 Chậm {vocabBehind}</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-950/30 border border-emerald-900/50 text-[9px] sm:text-[10px] font-bold text-emerald-400 rounded-lg whitespace-nowrap">🟢 Đạt chỉ tiêu</span>
                    )}
                  </div>
                </div>
 
                {/* Kanji target today */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/50 flex flex-col justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-300">Kanji tích lũy hôm nay</h3>
                    <p className="text-[10px] text-slate-500">Mục tiêu chữ Hán hàng ngày để ghi nhớ mặt chữ</p>
                  </div>
                  <div className="flex items-center justify-between w-full pt-3 border-t border-slate-800/40">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <span className="block text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Chỉ tiêu</span>
                        <span className="text-xl sm:text-2xl font-black text-indigo-400">{targetKanjiToday}</span>
                      </div>
                      <div className="h-6 w-px bg-slate-800" />
                      <div className="text-center">
                        <span className="block text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Thực tế</span>
                        <span className="text-xl sm:text-2xl font-black text-emerald-400">{kanjiMastered}</span>
                      </div>
                    </div>
                    {kanjiBehind > 0 ? (
                      <span className="px-2 py-0.5 bg-red-950/30 border border-red-900/50 text-[9px] sm:text-[10px] font-bold text-red-400 rounded-lg whitespace-nowrap">🔴 Chậm {kanjiBehind}</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-950/30 border border-emerald-900/50 text-[9px] sm:text-[10px] font-bold text-emerald-400 rounded-lg whitespace-nowrap">🟢 Đạt chỉ tiêu</span>
                    )}
                  </div>
                </div>
 
                {/* Grammar target today */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/50 flex flex-col justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-300">Ngữ pháp hôm nay</h3>
                    <p className="text-[10px] text-slate-500">Mục tiêu mẫu câu hàng ngày để nâng cao ngữ pháp</p>
                  </div>
                  <div className="flex items-center justify-between w-full pt-3 border-t border-slate-800/40">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <span className="block text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Chỉ tiêu</span>
                        <span className="text-xl sm:text-2xl font-black text-indigo-400">{targetGrammarToday}</span>
                      </div>
                      <div className="h-6 w-px bg-slate-800" />
                      <div className="text-center">
                        <span className="block text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Thực tế</span>
                        <span className="text-xl sm:text-2xl font-black text-emerald-400">{grammarMastered}</span>
                      </div>
                    </div>
                    {grammarBehind > 0 ? (
                      <span className="px-2 py-0.5 bg-red-950/30 border border-red-900/50 text-[9px] sm:text-[10px] font-bold text-red-400 rounded-lg whitespace-nowrap">🔴 Chậm {grammarBehind}</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-950/30 border border-emerald-900/50 text-[9px] sm:text-[10px] font-bold text-emerald-400 rounded-lg whitespace-nowrap">🟢 Đạt chỉ tiêu</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bars (Vocabulary, Kanji, Grammar) */}
            <div className="md:col-span-2 lg:col-span-12 bg-slate-900/40 border border-slate-800 p-5 sm:p-6 rounded-2xl backdrop-blur-md">
              <h2 className="text-sm sm:text-md font-bold text-slate-200 mb-5 border-b border-slate-800/60 pb-3 flex items-center space-x-2">
                <span>📈</span>
                <span>TIẾN ĐỘ HỌC BÀI {selectedLessonId}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Vocabulary progress row */}
                <div>
                  <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold mb-1.5">
                    <span className="text-slate-400">TỪ VỰNG BÀI {selectedLessonId}</span>
                    <span className="text-blue-400">
                      {vocabMastered}/{vocabTotal} từ ({vocabPercentage}%)
                    </span>
                  </div>
                  <div className="font-mono text-slate-400 text-xs sm:text-sm tracking-wide bg-slate-950/80 px-3 py-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-indigo-400 overflow-hidden text-ellipsis whitespace-nowrap">
                      {renderProgressBar(vocabPercentage)}
                    </span>
                    <span className="text-[10px] text-slate-500 shrink-0">Tiến độ Từ vựng</span>
                  </div>
                </div>

                {/* Kanji progress row */}
                <div>
                  <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold mb-1.5">
                    <span className="text-slate-400">KANJI BÀI {selectedLessonId}</span>
                    <span className="text-blue-400">
                      {kanjiMastered}/{kanjiTotal} chữ ({kanjiPercentage}%)
                    </span>
                  </div>
                  <div className="font-mono text-slate-400 text-xs sm:text-sm tracking-wide bg-slate-950/80 px-3 py-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-emerald-400 overflow-hidden text-ellipsis whitespace-nowrap">
                      {renderProgressBar(kanjiPercentage)}
                    </span>
                    <span className="text-[10px] text-slate-500 shrink-0">Tiến độ Kanji</span>
                  </div>
                </div>

                {/* Grammar progress row */}
                <div>
                  <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold mb-1.5">
                    <span className="text-slate-400">NGỮ PHÁP BÀI {selectedLessonId}</span>
                    <span className="text-blue-400">
                      {grammarMastered}/{grammarTotal} mẫu ({grammarPercentage}%)
                    </span>
                  </div>
                  <div className="font-mono text-slate-400 text-xs sm:text-sm tracking-wide bg-slate-950/80 px-3 py-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-blue-400 overflow-hidden text-ellipsis whitespace-nowrap">
                      {renderProgressBar(grammarPercentage)}
                    </span>
                    <span className="text-[10px] text-slate-500 shrink-0">Tiến độ Ngữ pháp</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Plan Configurator & Overall progress card */}
            
            {/* Plan Configurator (Chỗ chọn plan và bài đang học) */}
            <div className="lg:col-span-6 bg-slate-900/40 border border-slate-800 p-5 sm:p-6 rounded-2xl backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5 border-b border-slate-800/60 pb-3">
                  <h2 className="text-sm sm:text-md font-bold text-slate-200 flex items-center space-x-2">
                    <span>📅</span>
                    <span>MỤC TIÊU & KẾ HOẠCH HỌC TẬP - BÀI {selectedLessonId}</span>
                  </h2>
                  <span className="px-2.5 py-0.5 bg-slate-950/80 border border-slate-800 text-[10px] sm:text-xs font-semibold rounded-full text-blue-400 shrink-0">
                    {planStatus}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Selector bài đang học trong phần Kế hoạch */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Bài đang học
                    </label>
                    <select
                      value={selectedLessonId}
                      onChange={(e) => setSelectedLessonId(parseInt(e.target.value))}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 font-semibold focus:outline-none focus:border-blue-600/50 cursor-pointer"
                    >
                      {filteredLessons.map((l) => (
                        <option key={l.id} value={l.id} className="bg-[#0b1329]">
                          {l.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Ngày bắt đầu học
                      </label>
                      <input
                        type="date"
                        value={startDateStr}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        onClick={(e) => {
                          if (typeof e.currentTarget.showPicker === 'function') {
                            try { e.currentTarget.showPicker(); } catch (err) { console.error(err); }
                          }
                        }}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-600/50 cursor-pointer"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Ngày mong muốn hoàn thành
                      </label>
                      <input
                        type="date"
                        value={endDateStr}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        onClick={(e) => {
                          if (typeof e.currentTarget.showPicker === 'function') {
                            try { e.currentTarget.showPicker(); } catch (err) { console.error(err); }
                          }
                        }}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-600/50 cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  {/* Auto-calculated targets showing as text labels */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-3 bg-slate-950/60 border border-slate-800/40 rounded-xl">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Mục tiêu Từ vựng/ngày
                      </span>
                      <span className="text-sm font-extrabold text-indigo-400">
                        {calculatedVocabTargetPerDay} từ / ngày
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950/60 border border-slate-800/40 rounded-xl">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Mục tiêu Kanji/ngày
                      </span>
                      <span className="text-sm font-extrabold text-emerald-400">
                        {calculatedKanjiTargetPerDay} chữ / ngày
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950/60 border border-slate-800/40 rounded-xl font-sans">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Mục tiêu Ngữ pháp/ngày
                      </span>
                      <span className="text-sm font-extrabold text-blue-400">
                        {calculatedGrammarTargetPerDay} mẫu / ngày
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic calculations details list */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-800/40 text-[10px] sm:text-xs text-slate-400">
                <div>
                  <p>🗓️ Tổng số ngày học: <span className="text-slate-200 font-bold">{totalDays} ngày</span></p>
                  <p>⏳ Thời gian còn lại: <span className="text-slate-200 font-bold">{daysRemaining} ngày</span></p>
                </div>
                <div>
                  <p>🏃 Số ngày đã trôi qua: <span className="text-slate-200 font-bold">{daysElapsed} ngày</span></p>
                  <p>📈 Trạng thái: <span className="text-slate-200 font-bold">{planStatus}</span></p>
                </div>
              </div>
            </div>

            {/* Overall Progress & Forecast Date Card */}
            <div className="lg:col-span-6 bg-slate-900/40 border border-slate-800 p-5 sm:p-6 rounded-2xl backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5 border-b border-slate-800/60 pb-3">
                  <h2 className="text-sm sm:text-md font-bold text-slate-200 flex items-center space-x-2">
                    <span>⚡</span>
                    <span>TỔNG HỢP TIẾN ĐỘ & DỰ BÁO</span>
                  </h2>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/50 mb-4 text-center">
                  <p className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1">
                    Dự báo hoàn thành mốc {activeCourse === 'marugoto' ? 'Marugoto A1' : level}
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                    {forecastDateString}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    (Dựa trên kế hoạch trung bình {daysPerLesson} ngày/bài)
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Đã học hoàn thành bài:</span>
                    <span className="font-bold text-slate-200">
                      Bài {activeCourse === 'marugoto' ? (selectedLessonId - 100) : selectedLessonId} / {activeCourse === 'marugoto' ? '18' : (level === 'N5' ? '25' : '50')}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${((activeCourse === 'marugoto' ? (selectedLessonId - 100) : selectedLessonId) / (activeCourse === 'marugoto' ? 18 : (level === 'N5' ? 25 : 50))) * 100}%` }}
                    />
                  </div>

                  <div className="pt-2 text-xs text-slate-400 space-y-1.5">
                    <p>🎯 <span className="text-slate-300 font-semibold">Tốc độ hiện tại:</span> 1 bài trong khoảng {totalDays} ngày.</p>
                    <p>⏳ <span className="text-slate-300 font-semibold">Ước tính level {level}:</span> Cần thêm {totalDaysToCompleteLevel} ngày để hoàn thành {remainingLessons + 1} bài còn lại.</p>
                  </div>
                </div>
              </div>
            </div>



            {/* Quick links to Study Tabs */}
            <div className="md:col-span-2 lg:col-span-12">
              <h2 className="text-sm sm:text-md font-bold text-slate-200 mb-4 flex items-center space-x-2">
                <span>🔗</span>
                <span>DANH MỤC TRUY CẬP NHANH BÀI {selectedLessonId}</span>
              </h2>
              <div className={`grid grid-cols-2 sm:grid-cols-3 ${activeCourse === 'marugoto' ? 'lg:grid-cols-4' : 'lg:grid-cols-6'} gap-3 sm:gap-4`}>
                <button
                  onClick={() => router.push(`/lessons/${selectedLessonId}?tab=vocab`)}
                  className="p-3 sm:p-4 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-blue-800/40 text-center transition-all duration-300 cursor-pointer active:scale-[0.98]"
                >
                  <span className="block text-xl sm:text-2xl mb-1">📚</span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-300">Bảng Từ Vựng</span>
                </button>
                <button
                  onClick={() => router.push(`/lessons/${selectedLessonId}?tab=kanji`)}
                  className="p-3 sm:p-4 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-blue-800/40 text-center transition-all duration-300 cursor-pointer active:scale-[0.98]"
                >
                  <span className="block text-xl sm:text-2xl mb-1">🉐</span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-300">Bảng Chữ Hán</span>
                </button>
                <button
                  onClick={() => router.push(`/lessons/${selectedLessonId}?tab=grammar`)}
                  className="p-3 sm:p-4 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-blue-800/40 text-center transition-all duration-300 cursor-pointer active:scale-[0.98]"
                >
                  <span className="block text-xl sm:text-2xl mb-1">📝</span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-300">Ngữ Pháp & Ví Dụ</span>
                </button>
                {activeCourse !== 'marugoto' && (
                  <button
                    onClick={() => router.push(`/lessons/${selectedLessonId}?tab=flashcards`)}
                    className="p-3 sm:p-4 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-blue-800/40 text-center transition-all duration-300 cursor-pointer active:scale-[0.98]"
                  >
                    <span className="block text-xl sm:text-2xl mb-1">🃏</span>
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-300">Thẻ Nhớ Ôn Tập</span>
                  </button>
                )}
                {activeCourse !== 'marugoto' && (
                  <button
                    onClick={() => router.push(`/lessons/${selectedLessonId}?tab=kaiwa`)}
                    className="p-3 sm:p-4 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-blue-800/40 text-center transition-all duration-300 cursor-pointer active:scale-[0.98]"
                  >
                    <span className="block text-xl sm:text-2xl mb-1">💬</span>
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-300">Luyện Nói (Kaiwa)</span>
                  </button>
                )}
                <button
                  onClick={() => router.push(`/lessons/${selectedLessonId}?tab=practice`)}
                  className="p-3 sm:p-4 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-blue-800/40 text-center transition-all duration-300 cursor-pointer active:scale-[0.98]"
                >
                  <span className="block text-xl sm:text-2xl mb-1">✏️</span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-300">Luyện Tập Từ Vựng</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
