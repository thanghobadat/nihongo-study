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
  
  // State variables for Browse Tab
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

  // --- PRACTICE / QUIZ STATES ---
  const [quizState, setQuizState] = useState<'menu' | 'write' | 'choice' | 'speedrun' | 'finished'>('menu');
  const [practiceType, setPracticeType] = useState<'write' | 'choice' | 'speedrun'>('choice');
  const [writeDirection, setWriteDirection] = useState<'kanji-to-sino' | 'sino-to-kanji'>('kanji-to-sino');
  const [practiceLimit, setPracticeLimit] = useState<number>(10);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [quizList, setQuizList] = useState<RadicalInfo[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [choiceOptions, setChoiceOptions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [maxTime, setMaxTime] = useState<number>(10);
  const [streak, setStreak] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);

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

  const startPractice = () => {
    let eligible = radicalsList;
    if (selectedGroupFilter !== 'all') {
      eligible = radicalsList.filter(r => getRadicalGroup(r.character) === selectedGroupFilter);
    }
    
    if (eligible.length === 0) {
      eligible = radicalsList;
    }

    const limitVal = practiceLimit === 999 ? eligible.length : practiceLimit;
    const shuffled = [...eligible].sort(() => 0.5 - Math.random()).slice(0, limitVal);
    setQuizList(shuffled);
    setCurrentQuizIndex(0);
    setScore({ correct: 0, total: 0 });
    setCurrentAnswer('');
    setIsAnswerChecked(false);
    
    if (practiceType === 'write') {
      setQuizState('write');
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

  const isAnswerCorrect = (input: string, radical: RadicalInfo): boolean => {
    if (!radical) return false;
    
    if (writeDirection === 'sino-to-kanji') {
      return input.trim() === radical.character.split(' ')[0].trim();
    }
    
    const clean = (str: string) => str.toLowerCase().trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]/g, '');
      
    const cleanInput = clean(input);
    const cleanSino = clean(radical.sinoVietnamese);
    const cleanMeaning = clean(radical.meaning);
    
    return cleanInput === cleanSino || cleanInput === cleanMeaning ||
           (cleanMeaning.includes(cleanInput) && cleanInput.length >= 2) ||
           (cleanSino.includes(cleanInput) && cleanInput.length >= 2);
  };

  const handleWriteCheck = () => {
    if (isAnswerChecked) return;
    setIsAnswerChecked(true);
    
    const correctRadical = quizList[currentQuizIndex];
    const isCorrect = isAnswerCorrect(currentAnswer, correctRadical);
    
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    speakText(correctRadical.character.split(' ')[0]);
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
      setCurrentAnswer('');
      setIsAnswerChecked(false);
      
      let eligible = radicalsList;
      if (selectedGroupFilter !== 'all') {
        eligible = radicalsList.filter(r => getRadicalGroup(r.character) === selectedGroupFilter);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!isAnswerChecked) {
        handleWriteCheck();
      } else {
        handleNextQuestion();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f24] to-[#040714] text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* Header section */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white dark:text-white transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>⬅️</span> Quay lại
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 tracking-wider">
              CẨM NANG BỘ THỦ KANJI
            </h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-bold tracking-widest">
              Nền tảng của phương pháp học chiết tự & liên tưởng
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
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'
            }`}
          >
            📚 Tra cứu bộ thủ
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'
            }`}
          >
            ⚡ Luyện tập bộ thủ
          </button>
        </div>
      </header>

      {/* Main container */}
      <main className="max-w-7xl mx-auto">
        
        {/* --- TAB 1: BROWSE RADICALS --- */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            
            {/* Search and Filters tool bar */}
            <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 p-4 rounded-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search box */}
              <div className="relative w-full md:max-w-sm">
                <input
                  type="text"
                  placeholder="Tìm kiếm bộ thủ, Hán Việt, ý nghĩa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                />
                <span className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500 text-xs">🔍</span>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 text-xs"
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
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200 hover:border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Radicals Grid */}
            {filteredRadicals.length === 0 ? (
              <div className="text-center py-20 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-100/20 dark:bg-slate-900/20">
                📭 Không tìm thấy bộ thủ nào trùng khớp với từ khóa tìm kiếm.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredRadicals.map((rad) => (
                  <div
                    key={rad.character}
                    onClick={() => setSelectedRadical(rad)}
                    className="group bg-slate-100/25 border border-slate-200 dark:border-slate-800 hover:border-teal-500/40 p-4 rounded-2xl flex flex-col items-center justify-between gap-3 text-center cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(20,184,166,0.05)] hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none"
                  >
                    {/* Big radical character */}
                    <div className="w-14 h-14 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-3xl font-black text-slate-900 dark:text-white group-hover:text-teal-400 group-hover:border-teal-950 transition-colors shadow-inner">
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
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider group-hover:text-slate-400 dark:text-slate-500">
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
              <div className="flex items-center justify-between mb-4 bg-slate-100/20 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 p-3 rounded-2xl backdrop-blur-md">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                    Chế độ: {practiceType === 'write' ? 'Tự luận' : practiceType === 'choice' ? 'Trắc nghiệm' : 'Phản xạ nhanh'}
                  </span>
                  {practiceType === 'write' && (
                    <span className="text-[9px] text-teal-400 font-bold">
                      {writeDirection === 'kanji-to-sino' ? 'Chữ Hán ➔ Âm Hán-Việt & Ý nghĩa' : 'Âm Hán-Việt & Ý nghĩa ➔ Chữ Hán'}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setQuizState('menu')}
                  className="px-3 py-1.5 bg-white border border-slate-200 dark:border-slate-800 hover:border-slate-200 dark:border-slate-800 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200 text-slate-400 dark:text-slate-500 text-[10px] font-bold rounded-lg transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/60/60 dark:bg-slate-900/60 active:scale-95 flex items-center gap-1 shadow-sm font-sans"
                >
                  ⚙️ Thay đổi chế độ
                </button>
              </div>
            )}

            {/* 1. CONFIGURATION MENU SCREEN */}
            {quizState === 'menu' && (
              <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl backdrop-blur-xl space-y-6 shadow-2xl animate-in fade-in duration-300">
                <div className="text-center space-y-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">LUYỆN TẬP BỘ THỦ KANJI</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Chọn chế độ học tập và phạm vi kiểm tra bộ thủ</p>
                </div>

                {/* Practice Mode Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Mode Choices */}
                  <div
                    onClick={() => setPracticeType('choice')}
                    className={`p-4 rounded-2xl border cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-36 ${
                      practiceType === 'choice'
                        ? 'bg-teal-950/20 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.15)]'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="text-xl">🎯</div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider">Trắc nghiệm</h3>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">Chọn đáp án đúng từ 4 phương án gợi ý.</p>
                    </div>
                  </div>

                  {/* Mode Write */}
                  <div
                    onClick={() => setPracticeType('write')}
                    className={`p-4 rounded-2xl border cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-36 ${
                      practiceType === 'write'
                        ? 'bg-teal-950/20 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.15)]'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="text-xl">✍️</div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider">Tự luận</h3>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">Tự gõ âm Hán-Việt hoặc nghĩa tiếng Việt bộ thủ.</p>
                    </div>
                  </div>

                  {/* Mode Speedrun */}
                  <div
                    onClick={() => setPracticeType('speedrun')}
                    className={`p-4 rounded-2xl border cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-36 ${
                      practiceType === 'speedrun'
                        ? 'bg-amber-950/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-200 dark:border-slate-800'
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
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">Trả lời trắc nghiệm dưới áp lực thời gian 10s.</p>
                    </div>
                  </div>
                </div>

                {/* Scope Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select group */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block">Phạm vi bộ thủ</label>
                    <select
                      value={selectedGroupFilter}
                      onChange={(e) => setSelectedGroupFilter(e.target.value)}
                      className="w-full bg-white border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      {groupFilters.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Question limits */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block">Số lượng câu hỏi</label>
                    <select
                      value={practiceLimit}
                      onChange={(e) => setPracticeLimit(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value={10}>10 câu hỏi</option>
                      <option value={20}>20 câu hỏi</option>
                      <option value={30}>30 câu hỏi</option>
                      <option value={999}>Tất cả bộ thủ khả dụng</option>
                    </select>
                  </div>
                </div>

                {/* Write Mode Direction Options */}
                {practiceType === 'write' && (
                  <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">
                    <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block">Chiều câu hỏi tự luận</label>
                    <select
                      value={writeDirection}
                      onChange={(e) => setWriteDirection(e.target.value as 'kanji-to-sino' | 'sino-to-kanji')}
                      className="w-full bg-white border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer font-bold"
                    >
                      <option value="kanji-to-sino">Chữ Hán ➔ Âm Hán-Việt & Ý nghĩa</option>
                      <option value="sino-to-kanji">Âm Hán-Việt & Ý nghĩa ➔ Chữ Hán</option>
                    </select>
                  </div>
                )}

                {/* Start Button */}
                <button
                  onClick={startPractice}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-900 dark:text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg active:scale-95 text-center tracking-widest uppercase"
                >
                  BẮT ĐẦU LUYỆN TẬP 🚀
                </button>
              </div>
            )}

            {/* 2. PRACTICE MODE: WRITE (TỰ LUẬN) */}
            {quizState === 'write' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Header score / progress */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                  <span>Câu hỏi: {currentQuizIndex + 1} / {quizList.length}</span>
                  <span className="text-teal-400">Đúng: {score.correct} / {score.total}</span>
                </div>
                
                <div className="w-full bg-white rounded-full h-1.5 overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuizIndex) / quizList.length) * 100}%` }}
                  />
                </div>

                {/* Radical Display Card */}
                <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 rounded-3xl backdrop-blur-xl flex flex-col items-center justify-center gap-4 text-center">
                  {writeDirection === 'kanji-to-sino' ? (
                    <>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Hãy gõ Hán Việt hoặc Nghĩa</span>
                      <div className="w-24 h-24 bg-white border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center text-5xl font-black text-slate-900 dark:text-white shadow-inner animate-pulse">
                        {quizList[currentQuizIndex]?.character.split(' ')[0]}
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Hãy gõ Chữ Hán / Bộ thủ</span>
                      <div className="min-h-24 px-6 py-4 bg-white border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-inner">
                        <div className="text-2xl font-black text-teal-400 uppercase tracking-wider">
                          {quizList[currentQuizIndex]?.sinoVietnamese}
                        </div>
                        <div className="text-xs font-bold text-slate-400 dark:text-slate-500">
                          ({quizList[currentQuizIndex]?.meaning})
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Input panel */}
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={writeDirection === 'sino-to-kanji' ? "Gõ chữ Hán/Bộ thủ chính xác..." : "Nhập Hán Việt hoặc ý nghĩa của bộ thủ..."}
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isAnswerChecked}
                      autoFocus
                      className="w-full bg-[#FCF3CF]/10 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-[#FCF3CF] focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600 dark:text-slate-300 disabled:opacity-70 font-bold"
                    />
                    {currentAnswer && !isAnswerChecked && (
                      <button
                        onClick={() => setCurrentAnswer('')}
                        className="absolute right-3.5 top-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Feedback Message */}
                  {isAnswerChecked && (
                    <div className={`p-4 rounded-xl border flex flex-col gap-1 ${
                      isAnswerCorrect(currentAnswer, quizList[currentQuizIndex])
                        ? 'bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                        : 'bg-red-950/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                    }`}>
                      <span className="text-xs font-black uppercase">
                        {isAnswerCorrect(currentAnswer, quizList[currentQuizIndex]) ? 'Chính xác! 🎉' : 'Chưa đúng! ❌'}
                      </span>
                      <p className="text-xs font-medium">
                        Đáp án đúng: {writeDirection === 'sino-to-kanji' ? (
                          <span className="font-extrabold text-base bg-white border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-slate-900 dark:text-white">{quizList[currentQuizIndex]?.character.split(' ')[0]}</span>
                        ) : (
                          <span className="font-extrabold">{quizList[currentQuizIndex]?.sinoVietnamese} ({quizList[currentQuizIndex]?.meaning})</span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 italic">
                        💡 {quizList[currentQuizIndex]?.description}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  {!isAnswerChecked ? (
                    <button
                      onClick={handleWriteCheck}
                      disabled={!currentAnswer.trim()}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-900 disabled:to-slate-900 disabled:text-slate-400 dark:text-slate-500 text-slate-900 dark:text-white rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 shadow-md"
                    >
                      KIỂM TRA ĐÁP ÁN
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-3 bg-white border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white dark:text-white rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 shadow-md"
                    >
                      {currentQuizIndex + 1 < quizList.length ? 'CÂU TIẾP THEO' : 'XEM KẾT QUẢ'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 3. PRACTICE MODE: CHOICE (TRẮC NGHIỆM) */}
            {quizState === 'choice' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Header score / progress */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                  <span>Câu hỏi: {currentQuizIndex + 1} / {quizList.length}</span>
                  <span className="text-teal-400">Đúng: {score.correct} / {score.total}</span>
                </div>
                
                <div className="w-full bg-white rounded-full h-1.5 overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuizIndex) / quizList.length) * 100}%` }}
                  />
                </div>

                {/* Radical Display Card */}
                <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 rounded-3xl backdrop-blur-xl flex flex-col items-center justify-center gap-4 text-center">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Hãy chọn Hán Việt và Nghĩa đúng</span>
                  <div className="w-24 h-24 bg-white border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center text-5xl font-black text-slate-900 dark:text-white shadow-inner animate-pulse">
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
                    
                    let btnStyle = "bg-white border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 dark:bg-slate-950/20";
                    if (isAnswerChecked) {
                      if (isOptionCorrect) {
                        btnStyle = "bg-emerald-950/30 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
                      } else {
                        btnStyle = "bg-white border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 opacity-60";
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
                    <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                      <h4 className="text-xs font-black uppercase text-teal-400 tracking-wider">
                        💡 Giải thích: Bộ {quizList[currentQuizIndex]?.sinoVietnamese} ({quizList[currentQuizIndex]?.meaning})
                      </h4>
                      <p className="text-[11px] leading-relaxed mt-2 text-slate-400 dark:text-slate-500">
                        {quizList[currentQuizIndex]?.description}
                      </p>
                    </div>
                    
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-3 bg-white border border-slate-200 dark:border-slate-800 text-slate-250 hover:text-slate-900 dark:hover:text-white dark:text-white rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 shadow-md"
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
                {/* Header score & timer */}
                <div className="flex items-center justify-between text-xs font-bold uppercase">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 dark:text-slate-500">Streak:</span>
                    <span className="text-amber-500 font-extrabold animate-bounce">🔥 {streak}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-teal-400 font-black">Điểm: {score.correct}</span>
                    <span className="text-slate-400 dark:text-slate-500">Kỷ lục: {highScore}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800 relative">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full transition-all duration-100 ease-linear"
                    style={{ width: `${(timeLeft / maxTime) * 100}%` }}
                  />
                </div>

                {/* Question screen */}
                <div className="bg-gradient-to-b from-[#18112e] to-[#040815] border border-amber-500/20 p-8 sm:p-12 rounded-3xl flex flex-col items-center justify-center gap-4 text-center shadow-[0_0_35px_rgba(245,158,11,0.05)]">
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest block">Trả lời thật nhanh! ⚡</span>
                  <div className="w-24 h-24 bg-white border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center text-5xl font-black text-slate-900 dark:text-white shadow-inner">
                    {quizList[currentQuizIndex]?.character.split(' ')[0]}
                  </div>
                </div>

                {/* Choices buttons - immediate answer checking */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {choiceOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => handleSpeedrunChoiceSelect(option)}
                      className="w-full py-4 px-4 bg-white border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white dark:text-white rounded-xl border text-xs font-black transition-all cursor-pointer active:scale-95 text-center font-bold"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. FINISHED RESULT SCREEN */}
            {quizState === 'finished' && (
              <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl backdrop-blur-xl text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="text-5xl animate-bounce">🏆</div>
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">HOÀN THÀNH LUYỆN TẬP</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Hoàn thành lượt kiểm tra bộ thủ Kanji</p>
                </div>

                <div className="py-6 border-y border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 flex items-center justify-around">
                  {practiceType === 'speedrun' ? (
                    <>
                      <div>
                        <span className="block text-2xl font-black text-amber-400">{score.correct} câu</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Đúng liên tiếp</span>
                      </div>
                      <div>
                        <span className="block text-2xl font-black text-indigo-600 dark:text-indigo-400">{highScore} câu</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Kỷ lục của bạn</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="block text-2xl font-black text-teal-400">{score.correct} / {quizList.length}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Số câu đúng</span>
                      </div>
                      <div>
                        <span className="block text-2xl font-black text-indigo-600 dark:text-indigo-400">{Math.round((score.correct / quizList.length) * 100)}%</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Độ chính xác</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => setQuizState('menu')}
                    className="py-3 bg-white border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white dark:text-white text-xs font-black rounded-xl cursor-pointer active:scale-95 transition-all"
                  >
                    ⚙️ Menu chính
                  </button>
                  <button
                    onClick={startPractice}
                    className="py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-900 dark:text-white text-xs font-black rounded-xl cursor-pointer active:scale-95 transition-all shadow-lg"
                  >
                    🔄 Luyện tập lại
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* --- RADICAL DETAIL MODAL --- */}
      {selectedRadical && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-sm select-none">
          <div className="relative w-full max-w-lg bg-[#0c1328] border border-teal-500/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(20,184,166,0.15)] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedRadical(null)}
              className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white dark:text-white text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Head: character and main meanings */}
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 dark:border-slate-800 flex items-center justify-center text-4xl font-black text-slate-900 dark:text-white shrink-0 shadow-inner">
                {selectedRadical.character.split(' ')[0]}
              </div>
              <div>
                <h2 className="text-xl font-black text-teal-400 uppercase tracking-widest">
                  Bộ {selectedRadical.sinoVietnamese}
                </h2>
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                  Nghĩa: {selectedRadical.meaning}
                </p>
              </div>
            </div>

            {/* Detailed Mnemonic description */}
            <div className="space-y-2">
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-wider block">
                💡 Mẹo nhớ & Ý nghĩa bộ thủ
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 font-sans">
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
                      className="p-3 bg-white border border-slate-200 dark:border-slate-800 rounded-xl hover:border-teal-500/20 cursor-pointer active:scale-95 transition-all text-center group/ex flex sm:flex-col justify-between sm:justify-center items-center gap-1.5"
                      title="Nhấp để nghe âm đọc Nhật"
                    >
                      <div className="flex items-center sm:flex-col gap-2">
                        <span className="text-xl font-black text-slate-900 dark:text-white group-hover/ex:text-teal-400 transition-colors">
                          {ex.char}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold lowercase sm:block">
                          /{ex.romaji}/
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-full">
                        {ex.meaning}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer buttons */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedRadical(null)}
                className="px-5 py-2.5 bg-white border border-slate-200 dark:border-slate-800 hover:border-slate-750 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white dark:text-white text-xs font-bold rounded-xl cursor-pointer active:scale-95 transition-all"
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
