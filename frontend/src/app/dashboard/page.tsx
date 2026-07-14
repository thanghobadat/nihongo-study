'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../utils/api';
import CourseSwitcher from '../components/CourseSwitcher';
import SidebarSettings from '../components/SidebarSettings';
import DailyReportModal from '../components/DailyReportModal';

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



export default function UserDashboard() {
  const router = useRouter();
  const user = api.getUser();



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
  const [isDailyReportOpen, setIsDailyReportOpen] = useState<boolean>(false);

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

    // Check if daily progress report should be displayed
    async function checkDailyReport() {
      const todayStr = new Date().toISOString().split('T')[0];
      try {
        const token = api.getToken();
        if (!token) {
          const localAck = localStorage.getItem('last_daily_report_date');
          if (localAck !== todayStr) {
            setIsDailyReportOpen(true);
          }
          return;
        }

        const statusRes = await api.get('/api/user/daily-report-status');
        if (statusRes && statusRes.last_daily_report_date !== todayStr) {
          setIsDailyReportOpen(true);
        }
      } catch (e) {
        console.warn("API check for daily report status failed, using local fallback:", e);
        const localAck = localStorage.getItem('last_daily_report_date');
        if (localAck !== todayStr) {
          setIsDailyReportOpen(true);
        }
      }
    }
    checkDailyReport();

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



  // Navigation Items corresponding to the 7 Sheets
  const menuItems = activeCourse === 'marugoto' ? [
    { name: 'Từ vựng', id: 'vocab', icon: '📚', active: false },
    { name: 'Ngữ pháp', id: 'grammar', icon: '📖', active: false },
    { name: 'Luyện tập 4 kỹ năng', id: 'practice', icon: '⚡', active: false },
    { name: 'Tổng hợp kiến thức', id: 'summary', icon: '📝', active: false }
  ] : [
    { name: 'Cẩm nang học', id: 'guide', icon: '📖', active: false },
    { name: 'Tiến độ học', id: 'dashboard', icon: '📊', active: true },
    { name: 'Lộ trình học', id: 'roadmap', icon: '🗺️', active: false },
    { name: 'Từ vựng', id: 'vocab', icon: '📚', active: false },
    { name: 'Chữ Hán (Kanji)', id: 'kanji', icon: '🉐', active: false },
    { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️', active: false }
  ];

  // Filter lessons matching active Level
  const filteredLessons = lessons.filter(l => {
    if (activeCourse === 'marugoto') return true;
    if (level === 'N5') return l.id >= 1 && l.id <= 25;
    return l.id >= 26 && l.id <= 50;
  });

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/50 dark:from-[#0b1329] dark:via-[#090d1a] dark:to-[#050811] dark:from-[#0b1329] dark:via-[#090d1a] dark:to-[#050811] text-slate-800 dark:text-slate-100 font-sans relative">
      
      {/* Mobile Hamburger toggle button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden absolute top-4 left-4 z-40 p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer backdrop-blur-md active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar backdrop overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/20 z-40 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* 1. Left Sidebar Navigation Menu */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-slate-950/95 shadow-lg shadow-slate-200/40 border-r border-slate-200 dark:border-slate-800 dark:border-r-slate-900/50 flex flex-col justify-between p-6 backdrop-blur-xl shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0 ${
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
              className="lg:hidden text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200 text-xl p-1 font-bold cursor-pointer"
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
          <nav className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-0 select-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-100 hover:[&::-webkit-scrollbar-thumb]:bg-slate-450 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {menuItems.map((item) => (
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
                  } else if (item.id === 'mock-test') {
                    router.push('/mock-test');
                  } else if (item.id === 'knowledge') {
                    router.push('/knowledge');
                  } else if (item.id !== 'dashboard') {
                    router.push(`/lessons/${selectedLessonId}?tab=${item.id}`);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium ${
                  item.active
                    ? 'bg-indigo-50/80 dark:bg-gradient-to-r dark:from-blue-950/40 dark:to-slate-900 border border-indigo-100/50 dark:border-blue-900/40 text-indigo-600 dark:text-blue-400 shadow-sm dark:shadow-[0_0_15px_rgba(29,78,216,0.15)]'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <SidebarSettings />
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-20 lg:p-10 space-y-6 md:space-y-8">
        
        {/* Toast Notification message */}
        {message && (
          <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm rounded-xl shadow-2xl backdrop-blur-xl animate-fade-in flex items-center space-x-2">
            <span>ℹ️</span>
            <span>{message}</span>
          </div>
        )}

        {/* Header Title with level selections */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
              TIẾN ĐỘ HỌC TIẾNG NHẬT BÀI {selectedLessonId}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
              Quản lý kế hoạch học tập cá nhân và theo dõi chỉ tiêu hàng ngày
            </p>
          </div>
          
          {/* Level Switcher N5/N4 & Lesson Dropdown Selector */}
          <div className="flex items-center space-x-3 self-start sm:self-auto">
            {activeCourse === 'minna' && (
              <div className="bg-slate-50 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex">
                <button
                  onClick={() => handleLevelChange('N5')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    level === 'N5'
                      ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'
                  }`}
                >
                  N5
                </button>
                <button
                  onClick={() => handleLevelChange('N4')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    level === 'N4'
                      ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'
                  }`}
                >
                  N4
                </button>
              </div>
            )}



            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(parseInt(e.target.value))}
              className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-700/60 cursor-pointer min-w-[130px]"
            >
              {filteredLessons.map((l) => (
                <option key={l.id} value={l.id} className="bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200">
                  {l.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 space-y-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs">Đang tải dữ liệu học tập...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

            {/* 1. KHỐI TIẾN ĐỘ & CHỈ TIÊU HÀNG NGÀY (DAILY PROGRESS & TARGETS) */}
            <div className="lg:col-span-12 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl backdrop-blur-md">
              <h2 className="text-sm sm:text-md font-bold text-slate-700 dark:text-slate-200 mb-5 border-b border-slate-200 dark:border-slate-800/60 pb-3 flex items-center space-x-2">
                <span>🎯</span>
                <span>TIẾN ĐỘ & CHỈ TIÊU HỌC TẬP HÔM NAY</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Từ vựng Card */}
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/50 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-md">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1.5">
                        <span>📚</span>
                        <span>Từ vựng</span>
                      </h3>
                      {vocabBehind > 0 ? (
                        <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-[9px] sm:text-[10px] font-bold text-red-650 dark:text-red-400 rounded-lg">🔴 Chậm {vocabBehind}</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 rounded-lg">🟢 Đạt chỉ tiêu</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Tiến trình học từ vựng bài {selectedLessonId}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/40">
                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <span className="text-[10px] block text-slate-400 dark:text-slate-500">Hôm nay cần học</span>
                        <span className="text-lg font-black text-slate-800 dark:text-slate-200">{calculatedVocabTargetPerDay} từ</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] block text-slate-400 dark:text-slate-500">Đã thuộc</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {vocabMastered}/{vocabTotal} ({vocabPercentage}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200/60 dark:bg-slate-950/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${vocabPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Chữ Hán Card */}
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/50 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-md">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
                        <span>🉐</span>
                        <span>Chữ Hán (Kanji)</span>
                      </h3>
                      {kanjiBehind > 0 ? (
                        <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-[9px] sm:text-[10px] font-bold text-red-650 dark:text-red-400 rounded-lg">🔴 Chậm {kanjiBehind}</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 rounded-lg">🟢 Đạt chỉ tiêu</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Tiến trình học Kanji bài {selectedLessonId}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/40">
                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <span className="text-[10px] block text-slate-400 dark:text-slate-500">Hôm nay cần học</span>
                        <span className="text-lg font-black text-slate-800 dark:text-slate-200">{calculatedKanjiTargetPerDay} chữ</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] block text-slate-400 dark:text-slate-500">Đã thuộc</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {kanjiMastered}/{kanjiTotal} ({kanjiPercentage}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200/60 dark:bg-slate-950/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${kanjiPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Ngữ pháp Card */}
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/50 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-md">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-sky-600 dark:text-sky-400 flex items-center space-x-1.5">
                        <span>📖</span>
                        <span>Ngữ pháp</span>
                      </h3>
                      {grammarBehind > 0 ? (
                        <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-[9px] sm:text-[10px] font-bold text-red-650 dark:text-red-400 rounded-lg">🔴 Chậm {grammarBehind}</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 rounded-lg">🟢 Đạt chỉ tiêu</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Tiến trình học Ngữ pháp bài {selectedLessonId}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/40">
                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <span className="text-[10px] block text-slate-400 dark:text-slate-500">Hôm nay cần học</span>
                        <span className="text-lg font-black text-slate-800 dark:text-slate-200">{calculatedGrammarTargetPerDay} mẫu</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] block text-slate-400 dark:text-slate-500">Đã thuộc</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {grammarMastered}/{grammarTotal} ({grammarPercentage}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200/60 dark:bg-slate-950/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-sky-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${grammarPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. KHỐI KẾ HOẠCH & THỜI GIAN HOÀN THÀNH (PLANNING & FORECAST) */}
            <div className="lg:col-span-12 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl backdrop-blur-md">
              <h2 className="text-sm sm:text-md font-bold text-slate-700 dark:text-slate-200 mb-5 border-b border-slate-200 dark:border-slate-800/60 pb-3 flex items-center space-x-2">
                <span>📅</span>
                <span>DỰ BÁO TIẾN ĐỘ & KẾ HOẠCH THỜI GIAN - BÀI {selectedLessonId}</span>
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Bên trái: Thời gian hoàn thành */}
                <div className="lg:col-span-7 p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-slate-950/40 dark:to-slate-900/40 border border-blue-100/50 dark:border-blue-900/30 flex flex-col justify-center gap-3">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Dự báo hoàn thành bài học hiện tại
                  </span>
                  
                  {vocabMastered === vocabTotal && kanjiMastered === kanjiTotal && grammarMastered === grammarTotal ? (
                    <div className="space-y-1">
                      <p className="text-2xl sm:text-3xl font-black text-emerald-650 dark:text-emerald-400 flex items-center space-x-2">
                        <span>🎉</span>
                        <span>Đã học xong bài này!</span>
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Chúc mừng bạn đã thuộc 100% học liệu của Bài {selectedLessonId}. Hãy chuyển sang bài mới nhé!</p>
                    </div>
                  ) : today > endDate ? (
                    <div className="space-y-1">
                      <p className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">
                        🔴 Quá hạn {getDaysDiff(endDate, today)} ngày
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Kế hoạch kết thúc vào ngày: <span className="font-bold text-slate-700 dark:text-slate-350">{startDateStr.split('-').reverse().join('/')} - {endDateStr.split('-').reverse().join('/')}</span>. Hãy tập trung học bù nhé!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
                        ⏳ Còn {daysRemaining} ngày để học xong
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Hạn chót hoàn thành: <span className="font-semibold text-indigo-650 dark:text-indigo-400">{endDateStr.split('-').reverse().join('/')}</span> (Kế hoạch {totalDays} ngày).
                      </p>
                    </div>
                  )}

                  {/* Tiến độ tổng thể của bài hiện tại */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-medium text-slate-500 dark:text-slate-400">Tiến độ bài học chung:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {Math.round((vocabPercentage + kanjiPercentage + grammarPercentage) / 3)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/50 dark:bg-slate-950/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.round((vocabPercentage + kanjiPercentage + grammarPercentage) / 3)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bên phải: Thiết lập ngày */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                        Ngày bắt đầu
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
                        className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-600/50 cursor-pointer"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                        Ngày hoàn thành
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
                        className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-600/50 cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/40 text-xs text-slate-400 dark:text-slate-500 space-y-1.5">
                    <div className="flex justify-between">
                      <span>📆 Kế hoạch học tập:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{totalDays} ngày</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🏃 Số ngày đã trôi qua:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{daysElapsed} ngày</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dự báo Level N5/N4 (Widget nhỏ thu gọn) */}
              <details className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/40 group">
                <summary className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer list-none flex items-center justify-between select-none">
                  <span>📈 Dự báo tiến độ cả cấp độ ({activeCourse === 'marugoto' ? 'Marugoto A1' : level})</span>
                  <span className="transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-200 dark:border-slate-800/30 text-xs">
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-600 dark:text-slate-400">Dự báo ngày hoàn thành cấp độ:</p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{forecastDateString}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">(Dựa trên tốc độ trung bình {daysPerLesson} ngày/bài)</p>
                  </div>
                  <div className="space-y-2 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-slate-500">Đã học xong:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        Bài {activeCourse === 'marugoto' ? (selectedLessonId - 100) : selectedLessonId} / {activeCourse === 'marugoto' ? '18' : (level === 'N5' ? '25' : '50')}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-950/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${((activeCourse === 'marugoto' ? (selectedLessonId - 100) : selectedLessonId) / (activeCourse === 'marugoto' ? 18 : (level === 'N5' ? 25 : 50))) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Cần thêm {totalDaysToCompleteLevel} ngày cho {remainingLessons + 1} bài còn lại.</p>
                  </div>
                </div>
              </details>
            </div>




            {/* Quick links to Study Tabs */}
            <div className="md:col-span-2 lg:col-span-12">
              <h2 className="text-sm sm:text-md font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center space-x-2">
                <span>🔗</span>
                <span>DANH MỤC TRUY CẬP NHANH BÀI {selectedLessonId}</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <button
                  onClick={() => router.push(`/lessons/${selectedLessonId}?tab=vocab`)}
                  className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:border-blue-800/50 dark:border-blue-800/40 text-center transition-all duration-300 cursor-pointer active:scale-[0.98]"
                >
                  <span className="block text-xl sm:text-2xl mb-1">📚</span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">Bảng Từ Vựng</span>
                </button>
                <button
                  onClick={() => router.push(`/lessons/${selectedLessonId}?tab=kanji`)}
                  className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:border-blue-800/50 dark:border-blue-800/40 text-center transition-all duration-300 cursor-pointer active:scale-[0.98]"
                >
                  <span className="block text-xl sm:text-2xl mb-1">🉐</span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">Bảng Chữ Hán</span>
                </button>
                <button
                  onClick={() => router.push(`/lessons/${selectedLessonId}?tab=grammar`)}
                  className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:border-blue-800/50 dark:border-blue-800/40 text-center transition-all duration-300 cursor-pointer active:scale-[0.98]"
                >
                  <span className="block text-xl sm:text-2xl mb-1">📝</span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">Ngữ Pháp & Ví Dụ</span>
                </button>
                <button
                  onClick={() => router.push(`/lessons/${selectedLessonId}?tab=practice`)}
                  className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:border-blue-800/50 dark:border-blue-800/40 text-center transition-all duration-300 cursor-pointer active:scale-[0.98]"
                >
                  <span className="block text-xl sm:text-2xl mb-1">✏️</span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">Luyện Tập Từ Vựng</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Daily Progress Report Modal */}
      <DailyReportModal
        isOpen={isDailyReportOpen}
        onClose={async () => {
          setIsDailyReportOpen(false);
          const todayStr = new Date().toISOString().split('T')[0];
          localStorage.setItem('last_daily_report_date', todayStr);
          try {
            const token = api.getToken();
            if (token) {
              await api.post('/api/user/daily-report-ack', { date: todayStr });
            }
          } catch (e) {
            console.warn("Failed to ack daily report to server:", e);
          }
        }}
        userName={user?.display_name || 'Học viên'}
        lessonTitle={lessons.find(l => l.id === selectedLessonId)?.title || `Bài ${selectedLessonId}`}
        lessonId={selectedLessonId}
        vocabTotal={vocabTotal}
        vocabMastered={vocabMastered}
        kanjiTotal={kanjiTotal}
        kanjiMastered={kanjiMastered}
        grammarTotal={grammarTotal}
        grammarMastered={grammarMastered}
        startDateStr={startDateStr}
        endDateStr={endDateStr}
        totalDays={totalDays}
        daysElapsed={daysElapsed}
        daysRemaining={daysRemaining}
        targetVocabToday={targetVocabToday}
        vocabBehind={vocabBehind}
        calculatedVocabTargetPerDay={calculatedVocabTargetPerDay}
        onContinueStudy={async () => {
          setIsDailyReportOpen(false);
          const todayStr = new Date().toISOString().split('T')[0];
          localStorage.setItem('last_daily_report_date', todayStr);
          try {
            const token = api.getToken();
            if (token) {
              await api.post('/api/user/daily-report-ack', { date: todayStr });
            }
          } catch (e) {
            console.warn("Failed to ack daily report to server:", e);
          }
          router.push(`/lessons/${selectedLessonId}`);
        }}
      />

    </div>
  );
}
