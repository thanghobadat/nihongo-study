'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../utils/api';
import { getGrammarVocabMapping, getGrammarKanjiMapping } from '../utils/roadmapMapping';

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

function getAvatarSvg(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 5;
  const svgs = [
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#f8fafc" stroke="#334155" stroke-width="3"/><circle cx="30" cy="30" r="10" fill="#1e293b"/><circle cx="70" cy="30" r="10" fill="#1e293b"/><ellipse cx="32" cy="52" rx="7" ry="9" fill="#1e293b"/><ellipse cx="68" cy="52" rx="7" ry="9" fill="#1e293b"/><circle cx="32" cy="50" r="2" fill="#ffffff"/><circle cx="68" cy="50" r="2" fill="#ffffff"/><ellipse cx="50" cy="65" rx="5" ry="3" fill="#1e293b"/><circle cx="28" cy="58" r="4" fill="#fecdd3"/><circle cx="72" cy="58" r="4" fill="#fecdd3"/></svg>`,
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#d97706" stroke="#b45309" stroke-width="3"/><circle cx="25" cy="25" r="12" fill="#b45309"/><circle cx="75" cy="25" r="12" fill="#b45309"/><circle cx="25" cy="25" r="6" fill="#fef3c7"/><circle cx="75" cy="25" r="6" fill="#fef3c7"/><circle cx="35" cy="48" r="3" fill="#000000"/><circle cx="65" cy="48" r="3" fill="#000000"/><ellipse cx="50" cy="62" rx="12" ry="9" fill="#fef3c7"/><polygon points="50,58 45,54 55,54" fill="#000000"/></svg>`,
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#94a3b8" stroke="#64748b" stroke-width="3"/><polygon points="20,25 35,5 45,28" fill="#64748b"/><polygon points="80,25 65,5 55,28" fill="#64748b"/><polygon points="23,23 33,9 41,25" fill="#fecdd3"/><polygon points="77,23 67,9 59,25" fill="#fecdd3"/><circle cx="35" cy="50" r="3" fill="#000000"/><circle cx="65" cy="50" r="3" fill="#000000"/><polygon points="50,60 46,55 54,55" fill="#fecdd3"/><path d="M46,65 Q50,68 54,65" fill="none" stroke="#000000" stroke-width="2"/></svg>`,
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#ea580c" stroke="#c2410c" stroke-width="3"/><polygon points="15,25 32,5 42,30" fill="#c2410c"/><polygon points="85,25 68,5 58,30" fill="#c2410c"/><ellipse cx="30" cy="55" rx="14" ry="18" fill="#ffffff"/><ellipse cx="70" cy="55" rx="14" ry="18" fill="#ffffff"/><circle cx="32" cy="52" r="3.5" fill="#000000"/><circle cx="68" cy="52" r="3.5" fill="#000000"/><ellipse cx="50" cy="68" rx="6" ry="4" fill="#000000"/></svg>`,
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="55" r="40" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3"/><ellipse cx="35" cy="25" rx="9" ry="22" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3"/><ellipse cx="65" cy="25" rx="9" ry="22" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3"/><ellipse cx="35" cy="25" rx="5" ry="16" fill="#f1f5f9"/><ellipse cx="65" cy="25" rx="5" ry="16" fill="#f1f5f9"/><circle cx="35" cy="52" r="3" fill="#000000"/><circle cx="65" cy="52" r="3" fill="#000000"/><ellipse cx="50" cy="62" rx="4" ry="2.5" fill="#fecdd3"/><circle cx="28" cy="60" r="4" fill="#fecdd3"/><circle cx="72" cy="60" r="4" fill="#fecdd3"/></svg>`
  ];
  return svgs[index];
}

export default function RoadmapPage() {
  const router = useRouter();
  const user = api.getUser();

  const menuItems = [
    { name: 'Tiến độ học', id: 'dashboard', icon: '📊', active: false },
    { name: 'Lộ trình học', id: 'roadmap', icon: '🗺️', active: true },
    { name: 'Từ vựng', id: 'vocab', icon: '📚', active: false },
    { name: 'Chữ Hán (Kanji)', id: 'kanji', icon: '🉐', active: false },
    { name: 'Flashcards', id: 'flashcards', icon: '🃏', active: false },
    { name: 'Luyện nói (Kaiwa)', id: 'kaiwa', icon: '💬', active: false },
    { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️', active: false },
    { name: 'Ôn bảng chữ cái', id: 'kana', icon: '🔤', active: false }
  ];

  // UI States
  const [level, setLevel] = useState<'N5' | 'N4'>('N5');
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

  // Load selectedLessonId from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedLessonId');
      if (stored) {
        const parsed = parseInt(stored);
        if (!isNaN(parsed)) {
          setSelectedLessonId(parsed);
          setLevel(parsed >= 26 ? 'N4' : 'N5');
        }
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
        const lessonData = await api.get('/api/user/lessons');
        if (Array.isArray(lessonData)) {
          setLessons(lessonData);
        }
      } catch (error) {
        console.error('Failed to load lessons:', error);
      }
    }
    loadLessons();
  }, []);

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

  const handleLogout = () => {
    api.clearAuth();
    router.replace('/login');
  };

  const filteredLessons = lessons.filter(l => {
    if (level === 'N5') return l.id >= 1 && l.id <= 25;
    return l.id >= 26 && l.id <= 50;
  });

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-gradient-to-br from-[#0b1329] via-[#090d1a] to-[#050811] text-slate-100 font-sans relative">
      
      {/* Mobile Hamburger toggle button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden absolute top-4 left-4 z-40 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 cursor-pointer backdrop-blur-md active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar backdrop overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* 1. Left Sidebar Navigation Menu */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950/95 border-r border-slate-900 flex flex-col justify-between p-6 backdrop-blur-xl shrink-0 transition-transform duration-300 md:relative md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          <div className="flex items-center justify-between mb-8 px-2">
            <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Minna Nihongo
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-200 text-xl p-1 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setIsSidebarOpen(false);
                  if (item.id === 'dashboard') {
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

        <div className="pt-6 border-t border-slate-900/80 space-y-4">
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
      <main className="flex-1 overflow-y-auto p-6 pt-20 md:p-8 lg:p-10 space-y-6 md:space-y-8 relative">
        
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
              LỘ TRÌNH HỌC CHI TIẾT BÀI {selectedLessonId}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Học tập thông minh hơn bằng cách kết nối trực tiếp mẫu ngữ pháp với từ vựng & chữ Hán liên quan
            </p>
          </div>
          
          {/* Level Switcher N5/N4 & Lesson Dropdown Selector */}
          <div className="flex items-center space-x-3 self-start sm:self-auto">
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
            <p className="text-xs">Đang tải dữ liệu lộ trình...</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            
            {/* 1. Overall Completion Progress Card */}
            <div className="bg-slate-900/40 border border-slate-800 p-5 sm:p-6 rounded-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 space-y-1.5">
                <h2 className="text-sm sm:text-md font-bold text-slate-200 flex items-center space-x-2">
                  <span>📈</span>
                  <span>Tiến độ Bài {selectedLessonId}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Hoàn thành toàn bộ mục tiêu từ vựng, chữ Hán và ngữ pháp của bài học.
                </p>
              </div>

              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-950/60 border border-slate-800/50 rounded-xl text-center">
                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Từ vựng</span>
                  <span className="text-md sm:text-lg font-black text-indigo-400">{vocabMastered}/{vocabTotal} từ</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">({vocabPercent}%)</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800/50 rounded-xl text-center">
                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Chữ Hán</span>
                  <span className="text-md sm:text-lg font-black text-emerald-400">{kanjiMastered}/{kanjiTotal} chữ</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">({kanjiPercent}%)</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800/50 rounded-xl text-center">
                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Ngữ pháp</span>
                  <span className="text-md sm:text-lg font-black text-blue-400">{grammarMastered}/{grammarTotal} mẫu</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">({grammarPercent}%)</span>
                </div>

                <div className="p-3 bg-slate-950/80 border border-blue-900/30 rounded-xl text-center flex flex-col justify-center">
                  <span className="block text-[9px] font-black text-blue-400 uppercase tracking-wider mb-1">Hoàn thành bài</span>
                  <span className="text-xl font-extrabold text-white">{totalPercent}%</span>
                </div>
              </div>
            </div>

            {/* 2. Roadmap Grammar Lists */}
            <div className="space-y-4">
              <h2 className="text-md font-bold text-slate-200 flex items-center space-x-2">
                <span>🗺️</span>
                <span>BẢN ĐỒ NGỮ PHÁP & HỌC LIỆU LIÊN QUAN</span>
              </h2>

              {grammarItems.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl">
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
                        className="bg-slate-900/20 border border-slate-800/80 p-5 sm:p-6 rounded-2xl backdrop-blur-md hover:border-slate-800 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
                      >
                        {/* Grammar Info Column */}
                        <div className="lg:col-span-5 space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-blue-950/60 border border-blue-900/40 text-blue-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <h3 className="text-md font-black text-white leading-tight flex-1">
                              {item.title}
                            </h3>
                            
                            <select
                              value={item.status}
                              onChange={(e) => handleGrammarStatusChange(item.id, e.target.value as any)}
                              className={`bg-slate-950 border rounded-xl px-2 py-0.5 text-[10px] font-bold focus:outline-none cursor-pointer transition-colors duration-200 shrink-0 ${
                                item.status === 'mastered'
                                  ? 'border-emerald-800 text-emerald-400 bg-emerald-950/30'
                                  : item.status === 'learning'
                                  ? 'border-amber-800 text-amber-400 bg-amber-950/30'
                                  : 'border-slate-800 text-slate-400 bg-slate-950'
                              }`}
                            >
                              <option value="not_learned" className="bg-[#0b1329] text-slate-400">⚪ Chưa học</option>
                              <option value="learning" className="bg-[#0b1329] text-amber-400">🟡 Đang học</option>
                              <option value="mastered" className="bg-[#0b1329] text-emerald-400">🟢 Đã thuộc</option>
                            </select>
                          </div>
                          
                          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <span className="text-slate-500 uppercase">Ý nghĩa:</span>
                            <span className="px-2 py-0.5 bg-blue-950/40 border border-blue-900/30 text-blue-400 rounded-lg">{item.meaning}</span>
                          </div>

                          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-900 font-mono text-xs text-slate-300">
                            <span className="text-[10px] text-slate-500 font-bold block mb-1">Cấu trúc:</span>
                            {item.structure}
                          </div>

                          <div className="text-xs text-slate-400 leading-relaxed">
                            <span className="text-[10px] text-slate-500 font-bold block mb-0.5 font-sans">Giải nghĩa:</span>
                            <p className="text-slate-200 font-medium">{item.vietnamese_explanation}</p>
                          </div>

                          {item.japanese_example && (
                            <div className="pt-3 border-t border-slate-800/40 space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-[8px] font-black text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-1.5 py-0.2 rounded uppercase tracking-wider">Ví dụ mẫu</span>
                                <button
                                  onClick={() => playAudio(item.japanese_example!)}
                                  className="text-[9px] text-slate-400 hover:text-blue-400 cursor-pointer flex items-center space-x-1 hover:underline active:scale-95"
                                  title="Nghe câu ví dụ"
                                >
                                  <span>🔊</span>
                                  <span>Nghe ví dụ</span>
                                </button>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-100 font-bold font-serif leading-relaxed tracking-wide pl-2 border-l-2 border-emerald-500/50">
                                {item.japanese_example}
                              </p>
                              <p className="text-[11px] text-slate-400 italic pl-2 leading-relaxed">
                                {item.example_meaning}
                              </p>
                            </div>
                          )}

                          {item.notes && !item.notes.includes('🔊') && (
                            <div className="text-[10px] text-slate-500 italic flex items-start space-x-1 pt-1.5 border-t border-slate-800/20">
                              <span>⚠️</span>
                              <span className="leading-normal">{item.notes}</span>
                            </div>
                          )}
                        </div>

                        {/* Associated Study Items Mapped Column */}
                        <div className="lg:col-span-4 space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-900/60">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-900 pb-1.5">
                            📊 Học liệu tương quan trong mẫu này
                          </h4>
                          
                          {/* Vocab details */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400 font-bold">Từ vựng mẫu:</span>
                              <span className="text-indigo-400 font-black">{breakdown.vocabMasteredCount}/{breakdown.vocabTotalCount} đã thuộc</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-[10px] text-slate-500">
                              <span>Mới giới thiệu: <strong className="text-indigo-400">{breakdown.vocabNewCount} từ</strong></span>
                              <span>Trùng mẫu trước: <strong>{breakdown.vocabCopiedCount} từ</strong></span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${vocabPercentMapped}%` }} />
                            </div>
                          </div>

                          {/* Kanji details */}
                          {breakdown.kanjiTotalCount > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-slate-900/60">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-bold">Chữ Hán mẫu:</span>
                                <span className="text-emerald-400 font-black">{breakdown.kanjiMasteredCount}/{breakdown.kanjiTotalCount} đã thuộc</span>
                              </div>
                              <div className="flex items-center justify-between gap-3 text-[10px] text-slate-500">
                                <span>Mới giới thiệu: <strong className="text-emerald-400">{breakdown.kanjiNewCount} chữ</strong></span>
                                <span>Trùng mẫu trước: <strong>{breakdown.kanjiCopiedCount} chữ</strong></span>
                              </div>
                              <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${kanjiPercentMapped}%` }} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action buttons redirects to tab with indexes */}
                        <div className="lg:col-span-3 flex flex-col gap-2.5 h-full justify-center pt-2 lg:pt-8">
                          <button
                            onClick={() => router.push(`/lessons/${selectedLessonId}?tab=vocab&grammarIndex=${idx}`)}
                            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-blue-950/40 to-slate-900 hover:from-blue-900/40 border border-blue-900/40 hover:border-blue-700/60 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                          >
                            <span>📚</span>
                            <span>Học từ vựng mới ({breakdown.vocabNewCount})</span>
                          </button>

                          {breakdown.kanjiTotalCount > 0 ? (
                            <button
                              onClick={() => router.push(`/lessons/${selectedLessonId}?tab=kanji&grammarIndex=${idx}`)}
                              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-emerald-950/40 to-slate-900 hover:from-emerald-900/40 border border-emerald-900/40 hover:border-emerald-700/60 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                            >
                              <span>🉐</span>
                              <span>Học chữ Hán mới ({breakdown.kanjiNewCount})</span>
                            </button>
                          ) : (
                            <div className="text-center text-[10px] text-slate-500 italic py-2">
                              (Mẫu này không dùng Kanji mới)
                            </div>
                          )}

                          <button
                            onClick={() => router.push(`/roadmap/practice?lessonId=${selectedLessonId}&grammarIndex=${idx}&from=roadmap`)}
                            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-violet-950/40 to-slate-900 hover:from-violet-900/40 border border-violet-900/40 hover:border-violet-700/60 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
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
            <div className="p-5 sm:p-6 bg-blue-950/15 border border-blue-900/30 rounded-2xl flex items-start space-x-4">
              <span className="text-2xl mt-0.5">💡</span>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wide">
                  GỢI Ý LỘ TRÌNH HỌC TẬP HIỆU QUẢ
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Để chinh phục Bài {selectedLessonId} tốt nhất, bạn nên thực hiện theo các bước:
                </p>
                <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1 pl-1">
                  <li>Xem tổng quát các mẫu ngữ pháp để hiểu ý nghĩa cấu trúc.</li>
                  <li>Nhấp chuột vào nút <strong className="text-slate-200">"Học từ vựng mới"</strong> để học các từ bổ trợ trực tiếp cho mẫu ngữ pháp đó.</li>
                  <li>Làm tương tự với chữ Hán để nắm chắc cách viết.</li>
                  <li>Chuyển sang phân hệ <strong className="text-slate-200">Luyện nói (Kaiwa)</strong> để thực hành nói mẫu câu đã học trong hội thoại thực tế.</li>
                </ol>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
