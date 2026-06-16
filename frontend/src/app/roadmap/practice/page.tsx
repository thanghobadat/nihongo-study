'use client';

import { useState, useEffect, useCallback, useMemo, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../utils/api';
import { getSubstitutionTemplate, getGrammarVocabMapping, SubstitutionSlot } from '../../utils/roadmapMapping';

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
  word_type: string;
}

interface GrammarItem {
  id: number;
  lesson_id: number;
  title: string;
  meaning: string;
  structure: string;
  vietnamese_explanation: string;
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

export default function SubstitutionPracticePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = api.getUser();

  const lessonIdParam = searchParams.get('lessonId');
  const lessonId = lessonIdParam ? parseInt(lessonIdParam) : 1;
  const grammarIndexParam = searchParams.get('grammarIndex');
  const initialGrammarIndex = grammarIndexParam ? parseInt(grammarIndexParam) : 0;
  const from = searchParams.get('from') || 'roadmap';

  // Sidebar Menu list (all active = false since we are in a practice page)
  const menuItems = [
    { name: 'Cẩm nang học', id: 'guide', icon: '📖', active: false },
    { name: 'Tiến độ học', id: 'dashboard', icon: '📊', active: false },
    { name: 'Lộ trình học', id: 'roadmap', icon: '🗺️', active: true },
    { name: 'Từ vựng', id: 'vocab', icon: '📚', active: false },
    { name: 'Chữ Hán (Kanji)', id: 'kanji', icon: '🉐', active: false },
    { name: 'Flashcards', id: 'flashcards', icon: '🃏', active: false },
    { name: 'Luyện nói (Kaiwa)', id: 'kaiwa', icon: '💬', active: false },
    { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️', active: false },
    { name: 'Ôn bảng chữ cái', id: 'kana', icon: '🔤', active: false }
  ];

  // States
  const [grammarIndex, setGrammarIndex] = useState<number>(initialGrammarIndex);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [vocabItems, setVocabItems] = useState<VocabItem[]>([]);
  const [grammarItems, setGrammarItems] = useState<GrammarItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [slotValues, setSlotValues] = useState<Record<string, { ja: string; vi: string; romaji: string }>>({});
  const [showRomaji, setShowRomaji] = useState<boolean>(true);
  const [showVietnamese, setShowVietnamese] = useState<boolean>(true);
  const [showQuestionRomaji, setShowQuestionRomaji] = useState<boolean>(true);
  const [showQuestionVietnamese, setShowQuestionVietnamese] = useState<boolean>(true);

  // Randomize all slot selections and hide answers
  const handleRandomize = () => {
    if (!template || !template.slots) return;
    const randomVals: Record<string, { ja: string; vi: string; romaji: string }> = {};
    template.slots.forEach(slot => {
      if (slot.options && slot.options.length > 0) {
        const randomIndex = Math.floor(Math.random() * slot.options.length);
        randomVals[slot.id] = slot.options[randomIndex];
      }
    });
    setSlotValues(randomVals);
    setShowRomaji(false);
    setShowVietnamese(false);
    setShowQuestionRomaji(false);
    setShowQuestionVietnamese(false);
  };

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

  // Fetch vocabulary & grammar items
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const vocabData = await api.get(`/api/user/lessons/${lessonId}/vocabulary`);
        const grammarData = await api.get(`/api/user/lessons/${lessonId}/grammar`);
        if (Array.isArray(vocabData)) setVocabItems(vocabData);
        if (Array.isArray(grammarData)) setGrammarItems(grammarData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [lessonId]);

  // Load substitution template based on current lesson & active grammar index
  const template = useMemo(() => {
    return getSubstitutionTemplate(lessonId, grammarIndex, vocabItems, grammarItems);
  }, [lessonId, grammarIndex, vocabItems, grammarItems]);

  // Initialize selected values for slots when template changes
  useEffect(() => {
    if (template && template.slots) {
      const initialVals: Record<string, { ja: string; vi: string; romaji: string }> = {};
      template.slots.forEach(slot => {
        if (slot.options && slot.options.length > 0) {
          initialVals[slot.id] = slot.options[0];
        }
      });
      setSlotValues(initialVals);
      setShowRomaji(true);
      setShowVietnamese(true);
      setShowQuestionRomaji(true);
      setShowQuestionVietnamese(true);
    }
  }, [template]);

  // Synthesize sentence outputs
  const synthesizedSentence = useMemo(() => {
    if (!template) return { ja: '', vi: '', romaji: '' };
    if (template.slots && template.slots.length > 0) {
      const hasAllSlots = template.slots.every(slot => slotValues[slot.id]);
      if (!hasAllSlots) return { ja: '', vi: '', romaji: '' };
    }
    return template.getSynthesis(slotValues);
  }, [template, slotValues]);

  // Change slot selection
  const handleSlotChange = (slotId: string, valueJa: string) => {
    const slot = template.slots.find(s => s.id === slotId);
    if (!slot) return;
    const option = slot.options.find(o => o.ja === valueJa);
    if (option) {
      setSlotValues(prev => ({ ...prev, [slotId]: option }));
    }
  };

  // Play synthesized audio for answer
  const playSynthesisAudio = () => {
    if (synthesizedSentence.ja && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(synthesizedSentence.ja);
      utterance.lang = 'ja-JP';
      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
      if (jaVoice) utterance.voice = jaVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Play synthesized audio for question
  const playQuestionAudio = () => {
    if (synthesizedSentence.questionJa && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(synthesizedSentence.questionJa);
      utterance.lang = 'ja-JP';
      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
      if (jaVoice) utterance.voice = jaVoice;
      window.speechSynthesis.speak(utterance);
    }
  };
  // Handle Smart Back Button click
  const handleBack = () => {
    if (from === 'lessons') {
      router.push(`/lessons/${lessonId}?tab=vocab&grammarIndex=${grammarIndex}`);
    } else {
      router.push(`/roadmap`);
    }
  };

  const handleLogout = () => {
    api.clearAuth();
    router.replace('/login');
  };

  const activeLesson = lessons.find(l => l.id === lessonId);
  const activeGrammar = grammarItems[grammarIndex];

  const selectorOptions = useMemo(() => {
    const options = grammarItems.map((g, idx) => ({
      value: idx,
      label: `Mẫu ${idx + 1}: ${g.title}`
    }));
    
    if (vocabItems.length > 0 && grammarItems.length > 0) {
      const associatedIds = new Set<number>();
      grammarItems.forEach((_, idx) => {
        const mapping = getGrammarVocabMapping(lessonId, idx, vocabItems);
        mapping.associatedItems.forEach(item => {
          associatedIds.add(item.id);
        });
      });
      const hasSupplemental = vocabItems.some(item => !associatedIds.has(item.id));
      if (hasSupplemental) {
        options.push({
          value: grammarItems.length,
          label: lessonId === 1 
            ? "Giao tiếp: Chào hỏi & Giới thiệu bản thân" 
            : "Giao tiếp: Các cụm từ & Từ vựng khác"
        });
      }
    }
    return options;
  }, [grammarItems, vocabItems, lessonId]);

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
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-8 px-2 shrink-0">
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

          <nav className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-0 select-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-800 hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setIsSidebarOpen(false);
                  if (item.id === 'guide') {
                    router.push('/guide');
                  } else if (item.id === 'dashboard') {
                    router.push('/dashboard');
                  } else if (item.id === 'roadmap') {
                    router.push('/roadmap');
                  } else if (item.id === 'kana') {
                    router.push('/kana');
                  } else {
                    router.push(`/lessons/${lessonId}?tab=${item.id}`);
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
      <main className="flex-1 overflow-y-auto p-6 pt-20 md:p-8 lg:p-10 space-y-6 md:space-y-8">
        
        {/* Header Back & Info row */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer hover:bg-slate-900 shadow-sm flex items-center space-x-1.5 active:scale-95"
            >
              <span>←</span>
              <span>Quay lại</span>
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                LUYỆN TẬP THẾ CÂU
              </h1>
              <p className="text-[11px] text-slate-400">
                Thay đổi các từ trong ngoặc để xem cấu trúc biến đổi linh hoạt ra sao.
              </p>
            </div>
          </div>
          
          <div className="text-xs font-semibold text-slate-400 bg-slate-900/60 border border-slate-800/80 px-3.5 py-1.5 rounded-xl">
            {activeLesson?.title || `Bài ${lessonId}`}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs">Đang tải câu mẫu tương tác...</p>
          </div>
        ) : (
          <div className="space-y-8 max-w-4xl mx-auto">
            
            {/* Grammar Selector & Details */}
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/50 pb-3">
                <h3 className="text-sm font-bold text-slate-200">
                  📚 Chọn Mẫu Câu Ngữ Pháp
                </h3>
                <select
                  value={grammarIndex}
                  onChange={(e) => setGrammarIndex(parseInt(e.target.value))}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-bold focus:outline-none cursor-pointer"
                >
                  {selectorOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {grammarIndex === grammarItems.length ? (
                <div className="space-y-1.5 text-xs text-slate-400">
                  <p><strong className="text-slate-300">Cấu trúc:</strong> <code className="text-blue-300 font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-900">{lessonId === 1 ? "はじめまして。[Tên] です。[Đất nước] から来ました。どうぞよろしく。" : "[Cụm từ giao tiếp / Từ vựng]"}</code></p>
                  <p><strong className="text-slate-300">Giải thích:</strong> Luyện tập phát âm, ghi nhớ nghĩa và phiên âm của các câu chào hỏi giao tiếp và từ vựng bổ trợ trong Bài {lessonId}.</p>
                </div>
              ) : activeGrammar && (
                <div className="space-y-1.5 text-xs text-slate-400">
                  <p><strong className="text-slate-300">Công thức câu:</strong> <code className="text-blue-300 font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-900">{activeGrammar.structure}</code></p>
                  <p><strong className="text-slate-300">Giải thích:</strong> {activeGrammar.vietnamese_explanation}</p>
                </div>
              )}
            </div>

            {/* Substitution Playground area */}
            <div className="bg-slate-900/30 border border-slate-800/80 p-6 sm:p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 shadow-2xl">
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Japanese Sentence Template / Q&A rendering */}
              {synthesizedSentence.questionJa ? (
                /* CHẾ ĐỘ 1: GIAO DIỆN HỘI THOẠI HỎI - ĐÁP (Q&A DIALOGUE) */
                <div className="w-full space-y-6 sm:space-y-8 py-4">
                  {/* Bong bóng Câu hỏi (Q) */}
                  <div className="flex items-start space-x-3 text-left max-w-[85%] mr-auto">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center text-xs shadow-md flex-shrink-0 font-bold text-slate-400">
                      Q
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl rounded-tl-none relative shadow-lg flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-2 border-b border-slate-800/40 pb-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">CÂU HỎI NHẬN DIỆN</span>
                        <button
                          onClick={playQuestionAudio}
                          className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer text-xs"
                          title="Nghe câu hỏi"
                        >
                          🔊
                        </button>
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-slate-100 tracking-wide font-sans leading-relaxed">
                        {synthesizedSentence.questionJa}
                      </p>
                      
                      {/* Q Romaji */}
                      {synthesizedSentence.questionRomaji && (
                        <p 
                          onClick={() => setShowQuestionRomaji(true)}
                          className={`font-mono text-xs font-bold tracking-wide mt-2.5 pt-2 border-t border-slate-800/20 cursor-pointer select-none transition-all duration-300 ${
                            showQuestionRomaji ? 'text-blue-400/90 blur-none' : 'text-slate-500 blur-[4px]'
                          }`}
                        >
                          {showQuestionRomaji ? synthesizedSentence.questionRomaji : 'Nhấp để hiện Romaji câu hỏi'}
                        </p>
                      )}
                      
                      {/* Q Vietnamese Meaning */}
                      {synthesizedSentence.questionVi && (
                        <p 
                          onClick={() => setShowQuestionVietnamese(true)}
                          className={`text-xs font-semibold mt-1.5 cursor-pointer select-none transition-all duration-300 ${
                            showQuestionVietnamese ? 'text-slate-300/95 blur-none' : 'text-slate-500 blur-[4px]'
                          }`}
                        >
                          {showQuestionVietnamese ? synthesizedSentence.questionVi : 'Nhấp để hiện nghĩa câu hỏi'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bong bóng Trả lời (A) */}
                  <div className="flex items-start space-x-3 text-left max-w-[90%] ml-auto flex-row-reverse space-x-reverse">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 border border-indigo-500/50 flex items-center justify-center text-xs shadow-md flex-shrink-0 text-white font-bold">
                      A
                    </div>
                    <div className="bg-indigo-950/20 border border-indigo-500/30 p-5 rounded-3xl rounded-tr-none relative shadow-xl flex-1">
                      <div className="flex items-center justify-between gap-4 mb-2 border-b border-indigo-900/10 pb-1.5">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">CÂU TRẢ LỜI (THẾ TỪ)</span>
                        <button
                          onClick={playSynthesisAudio}
                          className="w-7 h-7 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-400 hover:text-white flex items-center justify-center transition-all cursor-pointer text-xs"
                          title="Nghe câu trả lời"
                        >
                          🔊
                        </button>
                      </div>
                      
                       {/* Trả lời Japanese Sentence (Dropdowns) */}
                       <div className="w-full flex flex-wrap items-center gap-y-3 gap-x-2 py-2">
                         {(() => {
                           const parts: React.ReactNode[] = [];
                           const slotsMap = new Map<string, SubstitutionSlot>();
                           template.slots.forEach(s => slotsMap.set(s.id, s));

                           template.templateParts.forEach((part, index) => {
                             if (part) {
                               parts.push(
                                 <span key={`txt-${index}`} className="text-xl sm:text-2xl font-black text-slate-200 tracking-wide font-sans leading-normal">
                                   {part}
                                 </span>
                               );
                             }
                             
                             const slotId = template.slots[index]?.id;
                             if (slotId) {
                               const slot = slotsMap.get(slotId);
                               const selectedVal = slotValues[slotId]?.ja || '';
                               
                               parts.push(
                                 <div key={`slot-${slotId}`} className="inline-block relative">
                                   <select
                                     value={selectedVal}
                                     onChange={(e) => handleSlotChange(slotId, e.target.value)}
                                     className="appearance-none bg-indigo-950/40 hover:bg-indigo-900/50 border-2 border-indigo-500/50 hover:border-indigo-400/80 text-white font-extrabold text-base sm:text-lg px-3.5 py-2 pr-7 rounded-xl focus:outline-none cursor-pointer text-center shadow-lg transition-all duration-300"
                                     title={slot?.label}
                                   >
                                     {slot?.options.map(o => (
                                       <option key={o.ja} value={o.ja} className="bg-[#0b1329] text-left text-xs font-bold">
                                         {o.ja}
                                       </option>
                                     ))}
                                   </select>
                                   <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-indigo-400/80 pointer-events-none">▼</span>
                                 </div>
                               );
                             }
                           });
                           return parts;
                         })()}
                       </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* CHẾ ĐỘ 2: GIAO DIỆN CÂU ĐƠN GIẢN NHƯ CŨ (TƯƠNG THÍCH NGƯỢC) */
                <>
                  <div className="w-full flex flex-wrap items-center justify-center gap-y-4 gap-x-2.5 py-6">
                    {(() => {
                      const parts: React.ReactNode[] = [];
                      const slotsMap = new Map<string, SubstitutionSlot>();
                      template.slots.forEach(s => slotsMap.set(s.id, s));

                      template.templateParts.forEach((part, index) => {
                        if (part) {
                          parts.push(
                            <span key={`txt-${index}`} className="text-2xl sm:text-3xl font-black text-slate-200 tracking-wide font-sans">
                              {part}
                            </span>
                          );
                        }
                        
                        const slotId = template.slots[index]?.id;
                        if (slotId) {
                          const slot = slotsMap.get(slotId);
                          const selectedVal = slotValues[slotId]?.ja || '';
                          
                          parts.push(
                            <div key={`slot-${slotId}`} className="inline-block relative">
                              <select
                                value={selectedVal}
                                onChange={(e) => handleSlotChange(slotId, e.target.value)}
                                className="appearance-none bg-indigo-950/40 hover:bg-indigo-900/50 border-2 border-indigo-500/50 hover:border-indigo-400/80 text-white font-extrabold text-lg sm:text-xl px-4 py-2.5 pr-8 rounded-2xl focus:outline-none cursor-pointer text-center shadow-lg transition-all duration-300"
                                title={slot?.label}
                              >
                                {slot?.options.map(o => (
                                  <option key={o.ja} value={o.ja} className="bg-[#0b1329] text-left text-sm font-bold">
                                    {o.ja}
                                  </option>
                                ))}
                              </select>
                              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-indigo-400/80 pointer-events-none">▼</span>
                            </div>
                          );
                        }
                      });
                      return parts;
                    })()}
                  </div>
                  
                  {/* Loa phát âm trung tâm chỉ xuất hiện ở chế độ câu đơn */}
                  <button
                    onClick={playSynthesisAudio}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.35)] active:scale-90 transition-all cursor-pointer"
                    title="Nghe câu hoàn chỉnh"
                  >
                    🔊
                  </button>
                </>
              )}

              {/* Controls: Randomize & Toggle Visibility */}
              <div className="flex flex-wrap items-center justify-center gap-4 py-3 border-t border-b border-slate-800/40 w-full">
                <button
                  onClick={handleRandomize}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl border border-purple-500/20 hover:border-purple-400/30 transition-all duration-300 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                >
                  <span>🎲</span> Random từ vựng
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowRomaji(!showRomaji);
                      setShowQuestionRomaji(!showRomaji);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                      showRomaji 
                        ? 'bg-blue-600/25 border border-blue-500/40 text-blue-400' 
                        : 'bg-slate-950/80 border border-slate-850 text-slate-400'
                    }`}
                  >
                    {showRomaji ? '👁️ Romaji: Hiện' : '🙈 Romaji: Ẩn'}
                  </button>

                  <button
                    onClick={() => {
                      setShowVietnamese(!showVietnamese);
                      setShowQuestionVietnamese(!showVietnamese);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                      showVietnamese 
                        ? 'bg-emerald-600/25 border border-emerald-500/40 text-emerald-400' 
                        : 'bg-slate-950/80 border border-slate-850 text-slate-400'
                    }`}
                  >
                    {showVietnamese ? '👁️ Nghĩa: Hiện' : '🙈 Nghĩa: Ẩn'}
                  </button>
                </div>
              </div>

              {/* Outputs: Romaji & Vietnamese (Chỉ hiển thị khi có dữ liệu) */}
              <div className="w-full space-y-4 pt-6 border-t border-slate-800/40">
                {synthesizedSentence.romaji && (
                  <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-2xl">
                    <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Phiên âm Romaji trả lời</span>
                    <p 
                      onClick={() => setShowRomaji(true)}
                      className={`font-mono text-sm sm:text-base font-bold tracking-wide cursor-pointer select-none transition-all duration-300 ${
                        showRomaji ? 'text-blue-400 blur-none' : 'text-slate-500 blur-[4px]'
                      }`}
                    >
                      {showRomaji ? synthesizedSentence.romaji : 'Nhấp để hiển thị phiên âm Romaji'}
                    </p>
                  </div>
                )}

                <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-2xl">
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Bản dịch nghĩa Việt trả lời</span>
                  <p 
                    onClick={() => setShowVietnamese(true)}
                    className={`text-sm sm:text-base font-extrabold cursor-pointer select-none transition-all duration-300 ${
                      showVietnamese ? 'text-slate-100 blur-none' : 'text-slate-500 blur-[4px]'
                    }`}
                  >
                    {showVietnamese ? synthesizedSentence.vi : 'Nhấp để hiển thị bản dịch tiếng Việt'}
                  </p>
                </div>
              </div>
            </div>

            {/* Substitution Guide */}
            <div className="p-5 sm:p-6 bg-indigo-950/15 border border-indigo-900/30 rounded-2xl flex items-start space-x-4">
              <span className="text-2xl mt-0.5">💡</span>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wide">
                  HƯỚNG DẪN LUYỆN TẬP SUB-DRILL
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Thay thế từ vựng sẽ giúp bạn hiểu được cách danh từ lồng vào các cấu trúc câu. Khi đã thế từ, hãy bấm nút loa 🔊 ở trên để luyện nghe phát âm câu đó nhiều lần, hoặc tự đọc to câu đó lên để tăng phản xạ nhịp điệu của tiếng Nhật.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
