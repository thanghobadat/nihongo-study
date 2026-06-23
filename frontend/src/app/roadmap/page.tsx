'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../utils/api';
import { getGrammarVocabMapping, getGrammarKanjiMapping } from '../utils/roadmapMapping';
import CourseSwitcher from '../components/CourseSwitcher';
import SidebarSettings from '../components/SidebarSettings';

interface Lesson {
  id: number;
  title: string;
  description: string;
}

interface VocabItem {
  id: number;
  lesson_id: number;
  status: 'not_learned' | 'learning' | 'mastered';
  romaji: string;
  hiragana: string;
}

interface KanjiItem {
  id: number;
  lesson_id: number;
  status: 'not_learned' | 'learning' | 'mastered';
  character: string;
}

interface GrammarItem {
  id: number;
  lesson_id: number;
  title: string;
  meaning: string;
  structure: string;
  vietnamese_explanation: string;
  status: 'not_learned' | 'learning' | 'mastered';
  japanese_example?: string;
  example_meaning?: string;
  notes?: string;
}



export default function RoadmapPage() {
  const router = useRouter();
  const user = api.getUser();

  const menuItems = [
    { name: 'Cẩm nang học', id: 'guide', icon: '📖', active: false },
    { name: 'Tiến độ học', id: 'dashboard', icon: '📊', active: false },
    { name: 'Lộ trình học', id: 'roadmap', icon: '🗺️', active: true },
    { name: 'Từ vựng', id: 'vocab', icon: '📚', active: false },
    { name: 'Chữ Hán (Kanji)', id: 'kanji', icon: '🉐', active: false },
    { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️', active: false },
    { name: 'Flashcards', id: 'flashcards', icon: '🃏', active: false },
    { name: 'Luyện nói (Kaiwa)', id: 'kaiwa', icon: '💬', active: false },
    { name: 'Ôn bảng chữ cái', id: 'kana', icon: '🔤', active: false }
  ];

  // UI States
  const [level, setLevel] = useState<'N5' | 'N4'>('N5');
  const [activeCourse, setActiveCourse] = useState<'minna' | 'marugoto'>('minna');
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [isLoadedFromLocalStorage, setIsLoadedFromLocalStorage] = useState<boolean>(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [vocabItems, setVocabItems] = useState<VocabItem[]>([]);
  const [kanjiItems, setKanjiItems] = useState<KanjiItem[]>([]);
  const [grammarItems, setGrammarItems] = useState<GrammarItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage(null);
    }, 2500);
  };

  const playAudio = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
      if (jaVoice) {
        utterance.voice = jaVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleGrammarStatusChange = async (itemId: number, newStatus: 'not_learned' | 'learning' | 'mastered') => {
    try {
      await api.post('/api/user/progress', {
        item_type: 'grammar',
        item_id: itemId,
        status: newStatus
      });
      setGrammarItems(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item));
      showNotification('Đã cập nhật trạng thái học tập ngữ pháp!');
    } catch (error) {
      console.error('Failed to update grammar status:', error);
      showNotification('Lỗi cập nhật trạng thái học tập.');
    }
  };

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

  // Fetch initial lessons
  useEffect(() => {
    async function loadLessons() {
      try {
        const lessonData = await api.get(`/api/user/lessons?course=${activeCourse}`);
        if (Array.isArray(lessonData)) {
          setLessons(lessonData);
        }
      } catch (error) {
        console.error('Failed to load lessons:', error);
      }
    }
    if (isLoadedFromLocalStorage) {
      loadLessons();
    }
  }, [activeCourse, isLoadedFromLocalStorage]);

  // Fetch data for active lesson
  const loadLessonData = useCallback(async () => {
    if (!isLoadedFromLocalStorage) return;
    setLoading(true);
    try {
      const vocabData = await api.get(`/api/user/lessons/${selectedLessonId}/vocabulary`);
      const kanjiData = await api.get(`/api/user/lessons/${selectedLessonId}/kanji`);
      const grammarData = await api.get(`/api/user/lessons/${selectedLessonId}/grammar`);
      if (Array.isArray(vocabData)) setVocabItems(vocabData);
      if (Array.isArray(kanjiData)) setKanjiItems(kanjiData);
      if (Array.isArray(grammarData)) setGrammarItems(grammarData);
    } catch (error) {
      console.error('Failed to load lesson details:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedLessonId, isLoadedFromLocalStorage]);

  useEffect(() => {
    loadLessonData();
  }, [loadLessonData]);

  // Calculated Progress Stats
  const vocabTotal = vocabItems.length;
  const vocabMastered = vocabItems.filter(v => v.status === 'mastered').length;
  const vocabPercent = vocabTotal ? Math.round((vocabMastered / vocabTotal) * 100) : 0;

  const kanjiTotal = kanjiItems.length;
  const kanjiMastered = kanjiItems.filter(k => k.status === 'mastered').length;
  const kanjiPercent = kanjiTotal ? Math.round((kanjiMastered / kanjiTotal) * 100) : 0;

  const grammarTotal = grammarItems.length;
  const grammarMastered = grammarItems.filter(g => g.status === 'mastered').length;
  const grammarPercent = grammarTotal ? Math.round((grammarMastered / grammarTotal) * 100) : 0;

  const totalPercent = useMemo(() => {
    const weights = [
      vocabTotal ? vocabPercent : 100,
      kanjiTotal ? kanjiPercent : 100,
      grammarTotal ? grammarPercent : 100
    ];
    const activeWeights = [vocabTotal, kanjiTotal, grammarTotal].filter(t => t > 0).length;
    if (activeWeights === 0) return 0;
    const sum = weights.reduce((a, b) => a + b, 0);
    return Math.round(sum / 3);
  }, [vocabTotal, vocabPercent, kanjiTotal, kanjiPercent, grammarTotal, grammarPercent]);

  // Generate pattern breakdown mapping for each grammar item
  const grammarBreakdowns = useMemo(() => {
    return grammarItems.map((g, idx) => {
      const vocabRes = getGrammarVocabMapping(selectedLessonId, idx, vocabItems);
      const kanjiRes = getGrammarKanjiMapping(selectedLessonId, idx, kanjiItems);
      
      const vocabMasteredCount = vocabRes.associatedItems.filter(v => v.status === 'mastered').length;
      const kanjiMasteredCount = kanjiRes.associatedItems.filter(k => k.status === 'mastered').length;

      return {
        vocabNewCount: vocabRes.newItems.length,
        vocabCopiedCount: vocabRes.copiedItems.length,
        vocabTotalCount: vocabRes.associatedItems.length,
        vocabMasteredCount,
        kanjiNewCount: kanjiRes.newItems.length,
        kanjiCopiedCount: kanjiRes.copiedItems.length,
        kanjiTotalCount: kanjiRes.associatedItems.length,
        kanjiMasteredCount,
      };
    });
  }, [selectedLessonId, grammarItems, vocabItems, kanjiItems]);

  const handleLevelChange = (selectedLevel: 'N5' | 'N4') => {
    setLevel(selectedLevel);
    setSelectedLessonId(selectedLevel === 'N5' ? 1 : 26);
  };



  const filteredLessons = lessons.filter(l => {
    if (activeCourse === 'marugoto') return true;
    if (level === 'N5') return l.id >= 1 && l.id <= 25;
    return l.id >= 26 && l.id <= 50;
  });

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/50 dark:from-[#0b1329] dark:via-[#090d1a] dark:to-[#050811] text-slate-800 dark:text-slate-100 font-sans relative">
      
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

          <nav className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-0 select-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-100 hover:[&::-webkit-scrollbar-thumb]:bg-slate-450 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
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
                    router.push('/dashboard');
                  } else if (item.id === 'roadmap') {
                    // Stay here
                  } else if (item.id === 'kana') {
                    router.push('/kana');
                  } else {
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
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-20 lg:p-10 space-y-6 md:space-y-8 relative">
        
        {/* Toast Notification message */}
        {message && (
          <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-slate-100 border border-blue-200 dark:border-blue-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm rounded-xl shadow-2xl backdrop-blur-xl animate-fade-in flex items-center space-x-2">
            <span>ℹ️</span>
            <span>{message}</span>
          </div>
        )}

        {/* Header Title with level selections */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
              LỘ TRÌNH HỌC CHI TIẾT BÀI {activeCourse === 'marugoto' ? selectedLessonId - 100 : selectedLessonId}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
              Học tập thông minh hơn bằng cách kết nối trực tiếp mẫu ngữ pháp với từ vựng & chữ Hán liên quan
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
            <p className="text-xs">Đang tải dữ liệu lộ trình...</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            
            {/* 1. Overall Completion Progress Card */}
            <div className="bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 space-y-1.5">
                <h2 className="text-sm sm:text-md font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-2">
                  <span>📈</span>
                  <span>Tiến độ Bài {activeCourse === 'marugoto' ? selectedLessonId - 100 : selectedLessonId}</span>
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Hoàn thành toàn bộ mục tiêu từ vựng, chữ Hán và ngữ pháp của bài học.
                </p>
              </div>

              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/55 dark:border-slate-800/50 rounded-xl text-center">
                  <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Từ vựng</span>
                  <span className="text-md sm:text-lg font-black text-indigo-600 dark:text-indigo-400">{vocabMastered}/{vocabTotal} từ</span>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">({vocabPercent}%)</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/55 dark:border-slate-800/50 rounded-xl text-center">
                  <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Chữ Hán</span>
                  <span className="text-md sm:text-lg font-black text-emerald-600 dark:text-emerald-400">{kanjiMastered}/{kanjiTotal} chữ</span>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">({kanjiPercent}%)</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/55 dark:border-slate-800/50 rounded-xl text-center">
                  <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Ngữ pháp</span>
                  <span className="text-md sm:text-lg font-black text-blue-600 dark:text-blue-400">{grammarMastered}/{grammarTotal} mẫu</span>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">({grammarPercent}%)</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border border-blue-100 rounded-xl text-center flex flex-col justify-center">
                  <span className="block text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Hoàn thành bài</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">{totalPercent}%</span>
                </div>
              </div>
            </div>

            {/* 2. Roadmap Grammar Lists */}
            <div className="space-y-4">
              <h2 className="text-md font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-2">
                <span>🗺️</span>
                <span>BẢN ĐỒ NGỮ PHÁP & HỌC LIỆU LIÊN QUAN</span>
              </h2>

              {grammarItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  📭 Chưa có ngữ pháp mẫu nào cho bài học này.
                </div>
              ) : (
                <div className="space-y-6">
                  {grammarItems.map((item, idx) => {
                    const breakdown = grammarBreakdowns[idx] || {
                      vocabNewCount: 0,
                      vocabCopiedCount: 0,
                      vocabTotalCount: 0,
                      vocabMasteredCount: 0,
                      kanjiNewCount: 0,
                      kanjiCopiedCount: 0,
                      kanjiTotalCount: 0,
                      kanjiMasteredCount: 0
                    };

                    const vocabPercentMapped = breakdown.vocabTotalCount 
                      ? Math.round((breakdown.vocabMasteredCount / breakdown.vocabTotalCount) * 100) 
                      : 0;
                    
                    const kanjiPercentMapped = breakdown.kanjiTotalCount
                      ? Math.round((breakdown.kanjiMasteredCount / breakdown.kanjiTotalCount) * 100)
                      : 0;

                    return (
                      <div 
                        key={item.id}
                        className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 p-5 sm:p-6 rounded-2xl backdrop-blur-md hover:border-slate-200 dark:border-slate-800 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
                      >
                        {/* Grammar Info Column */}
                        <div className="lg:col-span-5 space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-blue-950/60 border border-blue-900/40 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <h3 className="text-md font-black text-slate-900 dark:text-white leading-tight flex-1">
                              {item.title}
                            </h3>
                            
                            <select
                              value={item.status}
                              onChange={(e) => handleGrammarStatusChange(item.id, e.target.value as any)}
                              className={`bg-white dark:bg-slate-900/60 border rounded-xl px-2 py-0.5 text-[10px] font-bold focus:outline-none cursor-pointer transition-colors duration-200 shrink-0 ${
                                item.status === 'mastered'
                                  ? 'border-emerald-800 text-emerald-600 dark:text-emerald-400 bg-emerald-950/30'
                                  : item.status === 'learning'
                                  ? 'border-amber-800 text-amber-400 bg-amber-950/30'
                                  : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900/60'
                              }`}
                            >
                              <option value="not_learned" className="bg-white text-slate-400 dark:text-slate-500">⚪ Chưa học</option>
                              <option value="learning" className="bg-white text-amber-400">🟡 Đang học</option>
                              <option value="mastered" className="bg-white text-emerald-600 dark:text-emerald-400">🟢 Đã thuộc</option>
                            </select>
                          </div>
                          
                          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <span className="text-slate-400 dark:text-slate-500 uppercase">Ý nghĩa:</span>
                            <span className="px-2 py-0.5 bg-blue-950/40 border border-blue-100 text-blue-600 dark:text-blue-400 rounded-lg">{item.meaning}</span>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-600 dark:text-slate-300">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mb-1">Cấu trúc:</span>
                            {item.structure}
                          </div>

                          <div className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mb-0.5 font-sans">Giải nghĩa:</span>
                            <p className="text-slate-700 dark:text-slate-200 font-medium">{item.vietnamese_explanation}</p>
                          </div>

                          {item.japanese_example && (
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/40 dark:border-slate-800/40 space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 px-1.5 py-0.2 rounded uppercase tracking-wider">Ví dụ mẫu</span>
                                <button
                                  onClick={() => playAudio(item.japanese_example!)}
                                  className="text-[9px] text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:text-blue-400 cursor-pointer flex items-center space-x-1 hover:underline active:scale-95"
                                  title="Nghe câu ví dụ"
                                >
                                  <span>🔊</span>
                                  <span>Nghe ví dụ</span>
                                </button>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-bold font-serif leading-relaxed tracking-wide pl-2 border-l-2 border-emerald-500/50">
                                {item.japanese_example}
                              </p>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic pl-2 leading-relaxed">
                                {item.example_meaning}
                              </p>
                            </div>
                          )}

                          {item.notes && !item.notes.includes('🔊') && (
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 italic flex items-start space-x-1 pt-1.5 border-t border-slate-200 dark:border-slate-800/20">
                              <span>⚠️</span>
                              <span className="leading-normal">{item.notes}</span>
                            </div>
                          )}
                        </div>

                        {/* Associated Study Items Mapped Column */}
                        <div className="lg:col-span-4 space-y-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60">
                          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1.5">
                            📊 Học liệu tương quan trong mẫu này
                          </h4>
                          
                          {/* Vocab details */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400 dark:text-slate-500 font-bold">Từ vựng mẫu:</span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-black">{breakdown.vocabMasteredCount}/{breakdown.vocabTotalCount} đã thuộc</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 dark:text-slate-500">
                              <span>Mới giới thiệu: <strong className="text-indigo-600 dark:text-indigo-400">{breakdown.vocabNewCount} từ</strong></span>
                              <span>Trùng mẫu trước: <strong>{breakdown.vocabCopiedCount} từ</strong></span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${vocabPercentMapped}%` }} />
                            </div>
                          </div>

                          {/* Kanji details */}
                          {breakdown.kanjiTotalCount > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400 dark:text-slate-500 font-bold">Chữ Hán mẫu:</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-black">{breakdown.kanjiMasteredCount}/{breakdown.kanjiTotalCount} đã thuộc</span>
                              </div>
                              <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 dark:text-slate-500">
                                <span>Mới giới thiệu: <strong className="text-emerald-600 dark:text-emerald-400">{breakdown.kanjiNewCount} chữ</strong></span>
                                <span>Trùng mẫu trước: <strong>{breakdown.kanjiCopiedCount} chữ</strong></span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${kanjiPercentMapped}%` }} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action buttons redirects to tab with indexes */}
                        <div className="lg:col-span-3 flex flex-col gap-2.5 h-full justify-center pt-2 lg:pt-8">
                          <button
                            onClick={() => router.push(`/lessons/${selectedLessonId}?tab=vocab&grammarIndex=${idx}`)}
                            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 hover:border-indigo-300/60 text-indigo-600 hover:text-indigo-800 dark:bg-gradient-to-r dark:from-blue-950/40 dark:to-slate-900 dark:hover:from-blue-900/40 dark:border-blue-900/40 dark:hover:border-blue-700/60 dark:text-slate-200 dark:hover:text-white dark:text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                          >
                            <span>📚</span>
                            <span>Học từ vựng mới ({breakdown.vocabNewCount})</span>
                          </button>

                          {breakdown.kanjiTotalCount > 0 ? (
                            <button
                              onClick={() => router.push(`/lessons/${selectedLessonId}?tab=kanji&grammarIndex=${idx}`)}
                              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 hover:border-emerald-300/60 text-emerald-600 hover:text-emerald-800 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:to-slate-900 dark:hover:from-emerald-900/40 dark:border-emerald-900/40 dark:hover:border-emerald-700/60 dark:text-slate-200 dark:hover:text-white dark:text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                            >
                              <span>🉐</span>
                              <span>Học chữ Hán mới ({breakdown.kanjiNewCount})</span>
                            </button>
                          ) : (
                            <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 italic py-2">
                              (Mẫu này không dùng Kanji mới)
                            </div>
                          )}

                          <button
                            onClick={() => router.push(`/roadmap/practice?lessonId=${selectedLessonId}&grammarIndex=${idx}&from=roadmap`)}
                            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-violet-50 hover:bg-violet-100 border border-violet-200/80 hover:border-violet-300/60 text-violet-650 hover:text-violet-850 dark:bg-gradient-to-r dark:from-violet-950/40 dark:to-slate-900 dark:hover:from-violet-900/40 dark:border-violet-900/40 dark:hover:border-violet-700/60 dark:text-slate-200 dark:hover:text-white dark:text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                          >
                            <span>⚡</span>
                            <span>Luyện tập mẫu câu</span>
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* 3. Steps suggestion box */}
            <div className="p-5 sm:p-6 bg-blue-950/15 border border-blue-100 rounded-2xl flex items-start space-x-4">
              <span className="text-2xl mt-0.5">💡</span>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  GỢI Ý LỘ TRÌNH HỌC TẬP HIỆU QUẢ
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                  Để chinh phục Bài {activeCourse === 'marugoto' ? selectedLessonId - 100 : selectedLessonId} tốt nhất, bạn nên thực hiện theo các bước:
                </p>
                <ol className="list-decimal list-inside text-xs text-slate-400 dark:text-slate-500 space-y-1 pl-1">
                  <li>Xem tổng quát các mẫu ngữ pháp để hiểu ý nghĩa cấu trúc.</li>
                  <li>Nhấp chuột vào nút <strong className="text-slate-700 dark:text-slate-200">"Học từ vựng mới"</strong> để học các từ bổ trợ trực tiếp cho mẫu ngữ pháp đó.</li>
                  <li>Làm tương tự với chữ Hán để nắm chắc cách viết.</li>
                  {activeCourse !== 'marugoto' && (
                    <li>Chuyển sang phân hệ <strong className="text-slate-700 dark:text-slate-200">Luyện nói (Kaiwa)</strong> để thực hành nói mẫu câu đã học trong hội thoại thực tế.</li>
                  )}
                </ol>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
