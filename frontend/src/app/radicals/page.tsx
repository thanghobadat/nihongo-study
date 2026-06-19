'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RADICALS_DICT, RadicalInfo } from '../utils/kanjiRadicals';

// Group definitions (Move outside component to optimize render and avoid dependencies issues)
const groupFilters = [
  { id: 'all', name: 'Tất cả' },
  { id: 'nature', name: 'Tự nhiên & Nguyên tố' },
  { id: 'human', name: 'Con người & Cơ thể' },
  { id: 'action', name: 'Hành động & Trạng thái' },
  { id: 'tools', name: 'Nhà cửa & Đồ vật' }
];

// Map radicals to groups (Move outside component to optimize render and avoid dependencies issues)
const getRadicalGroup = (char: string): string => {
  const cleanChar = char.split(' ')[0]; // Handle '人 (亻)' => '人'
  
  const natureList = ['日', '月', '山', '川', '水', '火', '土', '木', '金', '雨', '青', '白', '赤', '黒'];
  const humanList = ['人', '女', '子', '口', '目', '耳', '手', '足', '心', '父', '母'];
  const actionList = ['力', '言', '行', '見', '食', '刀', '辶', '示'];
  
  if (natureList.includes(cleanChar)) return 'nature';
  if (humanList.includes(cleanChar)) return 'human';
  if (actionList.includes(cleanChar)) return 'action';
  return 'tools';
};

export default function RadicalsPage() {
  const router = useRouter();
  
  // State variables
  const [activeTab, setActiveTab] = useState<'browse' | 'quiz'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedRadical, setSelectedRadical] = useState<RadicalInfo | null>(null);

  // Convert dict to list
  const radicalsList = useMemo(() => {
    return Object.values(RADICALS_DICT);
  }, []);

  // Filtered radicals list
  const filteredRadicals = useMemo(() => {
    return radicalsList.filter(rad => {
      const groupMatch = selectedGroup === 'all' || getRadicalGroup(rad.character) === selectedGroup;
      
      const query = searchQuery.toLowerCase().trim();
      const textMatch = !query || 
        rad.character.toLowerCase().includes(query) ||
        rad.sinoVietnamese.toLowerCase().includes(query) ||
        rad.meaning.toLowerCase().includes(query) ||
        rad.description.toLowerCase().includes(query);
        
      return groupMatch && textMatch;
    });
  }, [radicalsList, selectedGroup, searchQuery]);


  // --- QUIZ GAME LOGIC ---
  const [quizList, setQuizList] = useState<RadicalInfo[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizFlipped, setQuizFlipped] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const startNewQuiz = useCallback(() => {
    // Shuffle and pick 10 random radicals
    const shuffled = [...radicalsList].sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuizList(shuffled);
    setCurrentQuizIndex(0);
    setQuizFlipped(false);
    setScore({ correct: 0, total: 0 });
  }, [radicalsList]);

  useEffect(() => {
    if (activeTab === 'quiz') {
      startNewQuiz();
    }
  }, [activeTab, startNewQuiz]);

  const handleQuizAnswer = (known: boolean) => {
    setScore(prev => ({
      correct: prev.correct + (known ? 1 : 0),
      total: prev.total + 1
    }));
    
    setQuizFlipped(false);
    setTimeout(() => {
      setCurrentQuizIndex(prev => prev + 1);
    }, 200);
  };

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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f24] to-[#040714] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* Header section */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>⬅️</span> Quay lại
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 tracking-wider">
              CẨM NANG BỘ THỦ KANJI
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
              Nền tảng của phương pháp học chiết tự & liên tưởng
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-900 self-start md:self-center">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📚 Tra cứu bộ thủ
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ Luyện tập phản xạ
          </button>
        </div>
      </header>

      {/* Main container */}
      <main className="max-w-7xl mx-auto">
        
        {/* --- TAB 1: BROWSE RADICALS --- */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            
            {/* Search and Filters tool bar */}
            <div className="bg-slate-900/30 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search box */}
              <div className="relative w-full md:max-w-sm">
                <input
                  type="text"
                  placeholder="Tìm kiếm bộ thủ, Hán Việt, ý nghĩa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                />
                <span className="absolute left-3.5 top-3.5 text-slate-500 text-xs">🔍</span>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Categories */}
              <div className="flex flex-wrap gap-2">
                {groupFilters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedGroup(filter.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-250 cursor-pointer ${
                      selectedGroup === filter.id
                        ? 'bg-teal-950/40 border-teal-500/50 text-teal-400'
                        : 'bg-slate-950/40 border-slate-900 text-slate-450 hover:text-slate-200 hover:border-slate-800'
                    }`}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Radicals Grid */}
            {filteredRadicals.length === 0 ? (
              <div className="text-center py-20 text-slate-550 border border-dashed border-slate-850 rounded-3xl bg-slate-900/10">
                📭 Không tìm thấy bộ thủ nào trùng khớp với từ khóa tìm kiếm.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredRadicals.map((rad) => (
                  <div
                    key={rad.character}
                    onClick={() => setSelectedRadical(rad)}
                    className="group bg-slate-900/25 border border-slate-850 hover:border-teal-500/40 p-4 rounded-2xl flex flex-col items-center justify-between gap-3 text-center cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(20,184,166,0.05)] hover:bg-slate-900/40"
                  >
                    {/* Big radical character */}
                    <div className="w-14 h-14 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-center text-3xl font-black text-white group-hover:text-teal-400 group-hover:border-teal-950 transition-colors shadow-inner">
                      {rad.character.split(' ')[0]}
                    </div>
                    {/* Sino-Vietnamese & meaning */}
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-extrabold text-teal-400 uppercase tracking-wider">
                        {rad.sinoVietnamese}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-300 line-clamp-1">
                        {rad.meaning}
                      </p>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider group-hover:text-slate-400">
                      Xem chi tiết 🔍
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: QUIZ PRACTICE --- */}
        {activeTab === 'quiz' && (
          <div className="max-w-md mx-auto py-4">
            {currentQuizIndex < quizList.length ? (
              <div className="space-y-6">
                
                {/* Score and Progress */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                  <span>Tiến trình: {currentQuizIndex + 1} / {quizList.length}</span>
                  <span className="text-teal-400">Đúng: {score.correct} / {score.total}</span>
                </div>
                
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-900">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuizIndex) / quizList.length) * 100}%` }}
                  />
                </div>

                {/* Card Flip Container */}
                <div 
                  onClick={() => setQuizFlipped(!quizFlipped)}
                  className="w-full h-80 relative cursor-pointer group"
                  style={{ perspective: '1000px' }}
                >
                  <div 
                    className="w-full h-full duration-500 transition-all rounded-3xl shadow-[0_0_35px_rgba(0,0,0,0.3)]"
                    style={{ 
                      transformStyle: 'preserve-3d', 
                      transform: quizFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
                    }}
                  >
                    {/* FRONT SIDE (Character display) */}
                    <div 
                      className="absolute inset-0 w-full h-full rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col justify-between items-center p-8 text-center"
                      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mặt trước - Bộ thủ</span>
                      <div className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 select-none animate-pulse">
                        {quizList[currentQuizIndex]?.character.split(' ')[0]}
                      </div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest animate-bounce">Nhấp thẻ để lật 🔄</span>
                    </div>

                    {/* BACK SIDE (Answers display) */}
                    <div 
                      className="absolute inset-0 w-full h-full rounded-3xl border border-teal-500/25 bg-gradient-to-b from-[#0c152a] to-[#040815] backdrop-blur-xl flex flex-col justify-between p-8 text-center"
                      style={{ 
                        backfaceVisibility: 'hidden', 
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      <span className="text-[10px] text-teal-500 font-bold uppercase tracking-wider">Mặt sau - Đáp án</span>
                      
                      <div className="space-y-2">
                        <div className="text-4xl font-black text-white">{quizList[currentQuizIndex]?.character.split(' ')[0]}</div>
                        <h2 className="text-2xl font-black text-teal-400 uppercase tracking-widest">{quizList[currentQuizIndex]?.sinoVietnamese}</h2>
                        <p className="text-base font-extrabold text-slate-100">{quizList[currentQuizIndex]?.meaning}</p>
                        <p className="text-xs text-slate-450 leading-relaxed max-h-24 overflow-y-auto px-2">{quizList[currentQuizIndex]?.description}</p>
                      </div>

                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Click để lật lại 🔄</span>
                    </div>
                  </div>
                </div>

                {/* Answer Options */}
                {quizFlipped ? (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleQuizAnswer(false)}
                      className="py-3 bg-red-950/20 border border-red-900/40 text-red-400 hover:bg-red-900/30 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95"
                    >
                      ❌ Chưa thuộc
                    </button>
                    <button
                      onClick={() => handleQuizAnswer(true)}
                      className="py-3 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 hover:bg-emerald-900/30 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95"
                    >
                      🟢 Đã thuộc
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setQuizFlipped(true)}
                    className="w-full py-3 bg-slate-900 border border-slate-800 text-slate-350 hover:text-white rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 text-center block"
                  >
                    👀 Xem đáp án
                  </button>
                )}

              </div>
            ) : (
              // Quiz Finished Screen
              <div className="bg-slate-900/20 border border-slate-850 p-8 rounded-3xl backdrop-blur-xl text-center space-y-6 shadow-2xl">
                <div className="text-5xl">🏆</div>
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-white">Kết quả luyện tập</h2>
                  <p className="text-xs text-slate-450">Hoàn thành lượt ôn tập 10 bộ thủ ngẫu nhiên</p>
                </div>

                <div className="py-6 border-y border-slate-850/60 flex items-center justify-around">
                  <div>
                    <span className="block text-2xl font-black text-teal-400">{score.correct} / 10</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Đúng</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-indigo-400">{Math.round((score.correct / 10) * 100)}%</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Độ chính xác</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => router.back()}
                    className="py-3 bg-slate-950 border border-slate-850 text-slate-300 hover:text-white text-xs font-black rounded-xl cursor-pointer active:scale-95 transition-all"
                  >
                    ⬅️ Quay về
                  </button>
                  <button
                    onClick={startNewQuiz}
                    className="py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl cursor-pointer active:scale-95 transition-all shadow-lg"
                  >
                    🔄 Luyện lại
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
              className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 border border-slate-850 text-slate-400 hover:text-white text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Head: character and main meanings */}
            <div className="flex items-center gap-4 border-b border-slate-900 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-850 flex items-center justify-center text-4xl font-black text-white shrink-0 shadow-inner">
                {selectedRadical.character.split(' ')[0]}
              </div>
              <div>
                <h2 className="text-xl font-black text-teal-400 uppercase tracking-widest">
                  Bộ {selectedRadical.sinoVietnamese}
                </h2>
                <p className="text-xs font-extrabold text-slate-200">
                  Nghĩa: {selectedRadical.meaning}
                </p>
              </div>
            </div>

            {/* Detailed Mnemonic description */}
            <div className="space-y-2">
              <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider block">
                💡 Mẹo nhớ & Ý nghĩa bộ thủ
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-900/60 font-sans">
                {selectedRadical.description}
              </p>
            </div>

            {/* Examples list */}
            {selectedRadical.examples && selectedRadical.examples.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] text-teal-500 font-black uppercase tracking-wider block">
                  📚 Chữ Hán ví dụ chứa bộ thủ này
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedRadical.examples.map(ex => (
                    <div 
                      key={ex.char}
                      onClick={() => speakText(ex.char)}
                      className="p-3 bg-slate-950 border border-slate-900 rounded-xl hover:border-teal-500/20 cursor-pointer active:scale-95 transition-all text-center group/ex flex sm:flex-col justify-between sm:justify-center items-center gap-1.5"
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
            <div className="pt-2 border-t border-slate-900 flex justify-end">
              <button
                onClick={() => setSelectedRadical(null)}
                className="px-5 py-2.5 bg-slate-950 border border-slate-850 hover:border-slate-750 text-slate-300 hover:text-white text-xs font-bold rounded-xl cursor-pointer active:scale-95 transition-all"
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
