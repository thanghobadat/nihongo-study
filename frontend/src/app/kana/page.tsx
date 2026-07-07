'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../utils/api';
import { hiraganaData, katakanaData, KanaItem } from './kanaData';
import { combinedWordsData, CombinedWord } from './combinedWords';
import CourseSwitcher from '../components/CourseSwitcher';
import SidebarSettings from '../components/SidebarSettings';

// User structure
interface User {
  id: string;
  email: string;
  user_metadata?: {
    display_name?: string;
  };
}



export default function AlphabetReviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [activeCourse, setActiveCourse] = useState<'minna' | 'marugoto'>('minna');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'charts' | 'speedrun' | 'reaction' | 'writing' | 'combined'>('charts');
  
  // States for interactive popover details
  const [selectedKana, setSelectedKana] = useState<KanaItem | null>(null);
  const [selectedKanaType, setSelectedKanaType] = useState<'hiragana' | 'katakana'>('hiragana');
  const [chartType, setChartType] = useState<'hiragana' | 'katakana'>('hiragana');
  
  // Progress states mapping: character char -> 'mastered' | 'not_learned'
  const [hiraganaProgress, setHiraganaProgress] = useState<Record<number, string>>({});
  const [katakanaProgress, setKatakanaProgress] = useState<Record<number, string>>({});
  
  // Game 1 (Speedrun) States
  const [gameAlphabet, setGameAlphabet] = useState<'hiragana' | 'katakana'>('hiragana');
  const [gameMode, setGameMode] = useState<'confused' | 'random'>('random');
  const [speedrunStartIdx, setSpeedrunStartIdx] = useState(0);
  const [speedrunEndIdx, setSpeedrunEndIdx] = useState(45);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<KanaItem | null>(null);
  const [answerOptions, setAnswerOptions] = useState<string[]>([]);
  const [gameScore, setGameScore] = useState(0);
  const [gameStreak, setGameStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; show: boolean } | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const timeLeftRef = useRef<number>(10);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updateTimeLeft = (time: number) => {
    timeLeftRef.current = time;
    setTimeLeft(time);
  };
  
  // Speedrun game over & high score states
  const [hiraHighScore, setHiraHighScore] = useState<number>(0);
  const [kataHighScore, setKataHighScore] = useState<number>(0);
  const [hiraMaxCorrect, setHiraMaxCorrect] = useState<number>(0);
  const [kataMaxCorrect, setKataMaxCorrect] = useState<number>(0);
  const speedrunHighScore = gameAlphabet === 'hiragana' ? hiraHighScore : kataHighScore;
  const speedrunMaxCorrect = gameAlphabet === 'hiragana' ? hiraMaxCorrect : kataMaxCorrect;
  const [speedrunGameOver, setSpeedrunGameOver] = useState<boolean>(false);
  const [speedrunCorrectCount, setSpeedrunCorrectCount] = useState<number>(0);

  // Refs to prevent stale closure in speedrun timer
  const gameScoreRef = useRef(0);
  const speedrunCorrectCountRef = useRef(0);

  const updateGameScore = (score: number) => {
    gameScoreRef.current = score;
    setGameScore(score);
  };

  const updateCorrectCount = (count: number) => {
    speedrunCorrectCountRef.current = count;
    setSpeedrunCorrectCount(count);
  };

  // Game 2 (Reaction Training / Luyện phản xạ) States
  const [reactionTimeLimit, setReactionTimeLimit] = useState<number | ''>(3);
  const [reactionResultLimit, setReactionResultLimit] = useState<number | ''>(2);
  const [reactionLimit, setReactionLimit] = useState<number | ''>(10);
  const [reactionDifficulty, setReactionDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [reactionStarted, setReactionStarted] = useState(false);
  const [reactionCurrentWord, setReactionCurrentWord] = useState<CombinedWord | null>(null);
  const [reactionStatus, setReactionStatus] = useState<'reading' | 'result' | 'finished'>('reading');
  const [reactionCurrentIndex, setReactionCurrentIndex] = useState(0);
  const [reactionList, setReactionList] = useState<CombinedWord[]>([]);
  
  const [reactionTimeLeft, setReactionTimeLeft] = useState(3);
  const reactionTimeLeftRef = useRef<number>(3);
  const reactionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateReactionTimeLeft = (time: number) => {
    reactionTimeLeftRef.current = time;
    setReactionTimeLeft(time);
  };

  // Canvas Luyện viết states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [writingKana, setWritingKana] = useState<KanaItem>(hiraganaData[0]);
  const [writingAlphabet, setWritingAlphabet] = useState<'hiragana' | 'katakana'>('hiragana');
  const [isDrawing, setIsDrawing] = useState(false);
  const [writingScore, setWritingScore] = useState<number | null>(null);
  const [writingFeedback, setWritingFeedback] = useState<string>('');

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Combined review states
  const [combinedDifficulty, setCombinedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [combinedLimit, setCombinedLimit] = useState<number>(10);
  const [combinedList, setCombinedList] = useState<CombinedWord[]>([]);
  const [combinedAnswers, setCombinedAnswers] = useState<Record<number, string>>({});
  const [combinedIsGraded, setCombinedIsGraded] = useState<boolean>(false);
  const [combinedVisibleAnswers, setCombinedVisibleAnswers] = useState<Record<number, boolean>>({});
  const [combinedIsStarted, setCombinedIsStarted] = useState<boolean>(false);
  const [combinedScore, setCombinedScore] = useState<number | null>(null);
  const [combinedPerfectCount, setCombinedPerfectCount] = useState<number>(0);

  // Combined review functions
  const calculateAccuracy = (input: string, correct: string) => {
    const cleanInput = (input || '').trim().toLowerCase().replace(/\s+/g, '');
    const cleanCorrect = (correct || '').trim().toLowerCase().replace(/\s+/g, '');
    if (!cleanInput) return 0;
    if (cleanInput === cleanCorrect) return 100;
    
    // Handle parentheses options like "techou(techō)"
    if (cleanCorrect.includes('(')) {
      const mainOption = cleanCorrect.split('(')[0].trim();
      const parenOption = cleanCorrect.substring(cleanCorrect.indexOf('(') + 1, cleanCorrect.indexOf(')')).trim();
      
      if (cleanInput === mainOption || cleanInput === parenOption) {
        return 100;
      }
      
      // Calculate matching accuracy against the primary option
      let matches = 0;
      const minLen = Math.min(cleanInput.length, mainOption.length);
      for (let i = 0; i < minLen; i++) {
        if (cleanInput[i] === mainOption[i]) {
          matches++;
        }
      }
      const maxLen = Math.max(cleanInput.length, mainOption.length);
      return Math.round((matches / maxLen) * 100);
    }
    
    let matches = 0;
    const minLen = Math.min(cleanInput.length, cleanCorrect.length);
    for (let i = 0; i < minLen; i++) {
      if (cleanInput[i] === cleanCorrect[i]) {
        matches++;
      }
    }
    const maxLen = Math.max(cleanInput.length, cleanCorrect.length);
    return Math.round((matches / maxLen) * 100);
  };

  const getEncouragementText = (pct: number) => {
    if (pct === 100) return 'Xuất sắc! 🎉';
    if (pct >= 80) return 'Tuyệt vời! 🌟';
    if (pct >= 50) return 'Cố lên một chút nữa! 💪';
    if (pct > 0) return 'Hãy cố gắng nhé! 👍';
    return 'Chưa đúng, hãy thử lại! ✏️';
  };

  const renderDiff = (input: string, correct: string) => {
    const cleanInput = (input || '').trim().toLowerCase().replace(/\s+/g, '');
    const cleanCorrect = (correct || '').trim().toLowerCase().replace(/\s+/g, '');
    
    if (!cleanInput) {
      return <span className="text-red-600 dark:text-red-400 font-bold">{cleanCorrect}</span>;
    }
    
    const result: React.ReactNode[] = [];
    const maxLen = Math.max(cleanInput.length, cleanCorrect.length);
    
    for (let i = 0; i < maxLen; i++) {
      const userChar = cleanInput[i];
      const correctChar = cleanCorrect[i];
      
      if (userChar === correctChar) {
        result.push(
          <span key={i} className="text-emerald-600 dark:text-emerald-400 font-bold">
            {userChar}
          </span>
        );
      } else {
        if (userChar !== undefined) {
          result.push(
            <span key={i} className="text-red-600 dark:text-red-400 font-bold underline decoration-wavy" title={`Đúng ra là: ${correctChar || 'khoảng trống'}`}>
              {userChar}
            </span>
          );
        } else {
          result.push(
            <span key={i} className="text-red-500/60 font-bold line-through" title={`Thiếu ký tự: ${correctChar}`}>
              {correctChar}
            </span>
          );
        }
      }
    }
    return <span className="inline-flex items-center gap-0.5">{result}</span>;
  };

  const startCombinedQuiz = () => {
    const filtered = combinedWordsData.filter(w => w.difficulty === combinedDifficulty);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, combinedLimit);
    setCombinedList(shuffled);
    setCombinedAnswers({});
    setCombinedIsGraded(false);
    setCombinedVisibleAnswers({});
    setCombinedIsStarted(true);
    setCombinedScore(null);
    setCombinedPerfectCount(0);
  };

  const gradeCombinedQuiz = () => {
    let totalAccuracy = 0;
    let perfect = 0;
    combinedList.forEach(item => {
      const userAnswer = combinedAnswers[item.id] || '';
      const acc = calculateAccuracy(userAnswer, item.romaji);
      totalAccuracy += acc;
      if (acc === 100) {
        perfect++;
      }
    });
    const avg = combinedList.length > 0 ? Math.round(totalAccuracy / combinedList.length) : 0;
    setCombinedScore(avg);
    setCombinedPerfectCount(perfect);
    setCombinedIsGraded(true);
  };



  // TTS Speaker
  const speak = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (isIOS) {
        showToast('Lưu ý: Hãy tắt chế độ Im lặng (gạt nút sườn) để nghe thấy tiếng phát âm.');
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      
      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
      if (jaVoice) {
        utterance.voice = jaVoice;
      }
      
      // GC protection for iOS
      (window as any)._activeUtterances = (window as any)._activeUtterances || [];
      (window as any)._activeUtterances.push(utterance);
      utterance.onend = () => {
        const idx = (window as any)._activeUtterances.indexOf(utterance);
        if (idx > -1) (window as any)._activeUtterances.splice(idx, 1);
      };
      utterance.onerror = () => {
        const idx = (window as any)._activeUtterances.indexOf(utterance);
        if (idx > -1) (window as any)._activeUtterances.splice(idx, 1);
      };

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Tự động chuyển hướng về dashboard nếu chuyển sang khoá marugoto
  useEffect(() => {
    if (activeCourse === 'marugoto') {
      localStorage.setItem('activeCourse', 'marugoto');
      localStorage.setItem('selectedLessonId', '101');
      router.push('/dashboard');
    }
  }, [activeCourse, router]);

  // Fetch initial profile & progress data
  useEffect(() => {
    const currentUser = api.getUser();
    setUser(currentUser);
    
    if (typeof window !== 'undefined') {
      const storedCourse = localStorage.getItem('activeCourse') as 'minna' | 'marugoto';
      if (storedCourse) {
        setActiveCourse(storedCourse);
      }
    }
    
    const storedLessonId = localStorage.getItem('selectedLessonId');
    if (storedLessonId) {
      setSelectedLessonId(parseInt(storedLessonId));
    }

    async function loadProgress() {
      try {
        const hProgress = await api.get('/api/user/progress?item_type=hiragana');
        const kProgress = await api.get('/api/user/progress?item_type=katakana');
        
        const hMap: Record<number, string> = {};
        let maxHiraHighScore = 0;
        let maxHiraCorrect = 0;
        if (Array.isArray(hProgress)) {
          hProgress.forEach(p => { 
            const itemId = Number(p.item_id);
            if (itemId >= 200000) {
              const val = itemId - 200000;
              if (val > maxHiraCorrect) maxHiraCorrect = val;
            } else if (itemId >= 100000) {
              const val = itemId - 100000;
              if (val > maxHiraHighScore) maxHiraHighScore = val;
            } else {
              hMap[itemId] = p.status; 
            }
          });
        }
        setHiraHighScore(maxHiraHighScore);
        setHiraMaxCorrect(maxHiraCorrect);
        setHiraganaProgress(hMap);

        const kMap: Record<number, string> = {};
        let maxKataHighScore = 0;
        let maxKataCorrect = 0;
        if (Array.isArray(kProgress)) {
          kProgress.forEach(p => { 
            const itemId = Number(p.item_id);
            if (itemId >= 200000) {
              const val = itemId - 200000;
              if (val > maxKataCorrect) maxKataCorrect = val;
            } else if (itemId >= 100000) {
              const val = itemId - 100000;
              if (val > maxKataHighScore) maxKataHighScore = val;
            } else {
              kMap[itemId] = p.status; 
            }
          });
        }
        setKataHighScore(maxKataHighScore);
        setKataMaxCorrect(maxKataCorrect);
        setKatakanaProgress(kMap);
      } catch (e) {
        console.error("Failed to load progress:", e);
      }
    }
    loadProgress();
  }, []);



  // 1. Toggle Progress State and Sync to Server
  const toggleProgress = async (id: number, type: 'hiragana' | 'katakana') => {
    const currentMap = type === 'hiragana' ? hiraganaProgress : katakanaProgress;
    const setMap = type === 'hiragana' ? setHiraganaProgress : setKatakanaProgress;
    const oldStatus = currentMap[id] || 'not_learned';
    const newStatus = oldStatus === 'mastered' ? 'not_learned' : 'mastered';

    // Optimistic Update
    setMap(prev => ({ ...prev, [id]: newStatus }));

    try {
      await api.post('/api/user/progress', {
        item_type: type,
        item_id: id,
        status: newStatus
      });
      showToast(`Đã ${newStatus === 'mastered' ? 'đánh dấu thuộc' : 'bỏ đánh dấu'} chữ cái!`);
    } catch (e) {
      console.error("Failed to sync progress:", e);
      // Rollback
      setMap(prev => ({ ...prev, [id]: oldStatus }));
      showToast("Lỗi đồng bộ hóa tiến độ lên máy chủ!");
    }
  };

  // 2. SPEEDRUN GAME LOGIC
  const handleGameOver = async (finalScore: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSpeedrunGameOver(true);
    
    // Check and save High Score (Cloud sync)
    const currentHigh = gameAlphabet === 'hiragana' ? hiraHighScore : kataHighScore;
    if (finalScore > currentHigh) {
      if (gameAlphabet === 'hiragana') {
        setHiraHighScore(finalScore);
      } else {
        setKataHighScore(finalScore);
      }
      showToast("🎉 Kỷ lục điểm số mới!");

      try {
        await api.post('/api/user/progress', {
          item_type: gameAlphabet,
          item_id: 100000 + finalScore,
          status: 'mastered'
        });
      } catch (e) {
        console.error("Failed to sync high score to cloud:", e);
        showToast("Lỗi đồng bộ kỷ lục lên máy chủ!");
      }
    }

    // Check and save Max Correct count (Cloud sync)
    const currentMaxCorrect = gameAlphabet === 'hiragana' ? hiraMaxCorrect : kataMaxCorrect;
    const finalCorrect = speedrunCorrectCountRef.current;
    if (finalCorrect > currentMaxCorrect) {
      if (gameAlphabet === 'hiragana') {
        setHiraMaxCorrect(finalCorrect);
      } else {
        setKataMaxCorrect(finalCorrect);
      }
      showToast("🎯 Kỷ lục số câu đúng mới!");

      try {
        await api.post('/api/user/progress', {
          item_type: gameAlphabet,
          item_id: 200000 + finalCorrect,
          status: 'mastered'
        });
      } catch (e) {
        console.error("Failed to sync max correct count to cloud:", e);
      }
    }
  };

  const startSpeedrun = () => {
    updateGameScore(0);
    setGameStreak(0);
    updateCorrectCount(0);
    setSpeedrunGameOver(false);
    setGameStarted(true);
    setFeedback(null);
    nextQuestion(0);
  };

  const stopSpeedrun = () => {
    setGameStarted(false);
    setSpeedrunGameOver(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const nextQuestion = (overrideCorrectCount?: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setFeedback(null);

    const currentCount = overrideCorrectCount !== undefined ? overrideCorrectCount : speedrunCorrectCountRef.current;
    // Max time decreases by 1 second for every 2 correct answers, down to a minimum of 2 seconds
    const maxTime = Math.max(2, 10 - Math.floor(currentCount / 2));
    updateTimeLeft(maxTime);

    const fullList = gameAlphabet === 'hiragana' ? hiraganaData : katakanaData;
    const activeList = fullList.slice(speedrunStartIdx, speedrunEndIdx + 1);
    let chosen: KanaItem;

    if (gameMode === 'confused') {
      const confusedGroup = activeList.filter(item => item.similar && item.similar.length > 0);
      const list = confusedGroup.length > 0 ? confusedGroup : activeList;
      chosen = list[Math.floor(Math.random() * list.length)];
    } else {
      chosen = activeList[Math.floor(Math.random() * activeList.length)];
    }

    const options = new Set<string>();
    options.add(chosen.romaji);

    if (activeList.length >= 4) {
      while (options.size < 4) {
        const randItem = activeList[Math.floor(Math.random() * activeList.length)];
        options.add(randItem.romaji);
      }
    } else {
      while (options.size < 4) {
        const randItem = fullList[Math.floor(Math.random() * fullList.length)];
        options.add(randItem.romaji);
      }
    }

    setCurrentQuestion(chosen);
    setAnswerOptions(Array.from(options).sort(() => Math.random() - 0.5));

    // Launch Timer at 100ms interval for precision mapping
    timerRef.current = setInterval(() => {
      const prev = timeLeftRef.current;
      if (prev <= 0.1) {
        if (timerRef.current) clearInterval(timerRef.current);
        updateTimeLeft(0);
        setFeedback({ isCorrect: false, show: true });
        setTimeout(() => {
          handleGameOver(gameScoreRef.current);
        }, 1500);
      } else {
        updateTimeLeft(parseFloat((prev - 0.1).toFixed(2)));
      }
    }, 100);
  };

  const handleAnswer = (option: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!currentQuestion) return;

    const correct = option === currentQuestion.romaji;
    setFeedback({ isCorrect: correct, show: true });

    if (correct) {
      const currentCount = speedrunCorrectCountRef.current;
      const maxTime = Math.max(2, 10 - Math.floor(currentCount / 2));
      const basePoints = 10 + currentCount * 5;
      const timeBonus = Math.round((timeLeftRef.current / maxTime) * basePoints);
      const scoreGain = basePoints + timeBonus;
      const nextScore = gameScoreRef.current + scoreGain;
      updateGameScore(nextScore);
      setGameStreak(prev => prev + 1);
      
      const nextCorrectCount = currentCount + 1;
      updateCorrectCount(nextCorrectCount);

      setTimeout(() => {
        nextQuestion(nextCorrectCount);
      }, 1500);
    } else {
      setGameStreak(0);
      setTimeout(() => {
        handleGameOver(gameScoreRef.current);
      }, 1500);
    }
  };

  // 3. REACTION TRAINING GAME LOGIC
  const startReactionGame = () => {
    if (reactionTimerRef.current) clearInterval(reactionTimerRef.current);

    const filtered = combinedWordsData.filter(w => w.difficulty === reactionDifficulty);
    if (filtered.length === 0) {
      showToast("Không tìm thấy dữ liệu từ phù hợp!");
      return;
    }
    const limitNum = reactionLimit === '' ? 10 : Number(reactionLimit);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, limitNum);

    setReactionList(shuffled);
    setReactionCurrentIndex(0);
    setReactionStarted(true);
    setReactionStatus('reading');
    setReactionCurrentWord(shuffled[0]);

    const limit = reactionTimeLimit === '' ? 3 : Number(reactionTimeLimit);
    updateReactionTimeLeft(limit);

    startReactionTimer(shuffled, 0, 'reading', limit);
  };

  const stopReactionGame = () => {
    setReactionStarted(false);
    if (reactionTimerRef.current) clearInterval(reactionTimerRef.current);
  };

  const nextReactionQuestion = () => {
    if (reactionTimerRef.current) clearInterval(reactionTimerRef.current);

    const nextIndex = reactionCurrentIndex + 1;
    if (nextIndex < reactionList.length) {
      setReactionCurrentIndex(nextIndex);
      setReactionCurrentWord(reactionList[nextIndex]);
      setReactionStatus('reading');
      const readLimit = reactionTimeLimit === '' ? 3 : Number(reactionTimeLimit);
      startReactionTimer(reactionList, nextIndex, 'reading', readLimit);
    } else {
      setReactionStatus('finished');
      setReactionStarted(false);
    }
  };

  const startReactionTimer = (list: CombinedWord[], index: number, status: 'reading' | 'result', initialTime: number) => {
    if (reactionTimerRef.current) clearInterval(reactionTimerRef.current);

    updateReactionTimeLeft(initialTime);

    reactionTimerRef.current = setInterval(() => {
      const prev = reactionTimeLeftRef.current;
      if (prev <= 0.1) {
        if (reactionTimerRef.current) clearInterval(reactionTimerRef.current);
        updateReactionTimeLeft(0);

        if (status === 'reading') {
          setReactionStatus('result');
          const currentWord = list[index];
          if (currentWord) speak(currentWord.word);

          const resultLimit = reactionResultLimit === '' ? 2 : Number(reactionResultLimit);
          startReactionTimer(list, index, 'result', resultLimit);
        } else {
          const nextIndex = index + 1;
          if (nextIndex < list.length) {
            setReactionCurrentIndex(nextIndex);
            setReactionCurrentWord(list[nextIndex]);
            setReactionStatus('reading');
            const readLimit = reactionTimeLimit === '' ? 3 : Number(reactionTimeLimit);
            startReactionTimer(list, nextIndex, 'reading', readLimit);
          } else {
            setReactionStatus('finished');
            setReactionStarted(false);
          }
        }
      } else {
        updateReactionTimeLeft(parseFloat((prev - 0.1).toFixed(2)));
      }
    }, 100);
  };

  // 4. CANVAS DRAWING LOGIC
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#38bdf8'; // Blue-400

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
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setWritingScore(null);
    setWritingFeedback('');
  };

  const checkDrawingSimilarity = () => {
    const userCanvas = canvasRef.current;
    if (!userCanvas) return;

    // Create offscreen canvas to render target character
    const offscreen = document.createElement('canvas');
    offscreen.width = userCanvas.width;
    offscreen.height = userCanvas.height;
    const oCtx = offscreen.getContext('2d');
    if (!oCtx) return;

    // Draw target character in offscreen canvas
    oCtx.fillStyle = '#ffffff';
    oCtx.font = '900 200px sans-serif';
    oCtx.textAlign = 'center';
    oCtx.textBaseline = 'middle';
    // Offset by -10px to match the trace text alignment
    oCtx.fillText(writingKana.char, offscreen.width / 2, offscreen.height / 2 - 10);

    const userCtx = userCanvas.getContext('2d');
    if (!userCtx) return;

    const userImgData = userCtx.getImageData(0, 0, userCanvas.width, userCanvas.height);
    const targetImgData = oCtx.getImageData(0, 0, offscreen.width, offscreen.height);

    const userPixels = userImgData.data;
    const targetPixels = targetImgData.data;

    // Downsample to 60x60 grid
    const W = 60;
    const H = 60;
    const userGrid = Array(H).fill(0).map(() => Array(W).fill(false));
    const targetGrid = Array(H).fill(0).map(() => Array(W).fill(false));

    let userDrawnCount = 0;
    let targetDrawnCount = 0;

    for (let gy = 0; gy < H; gy++) {
      for (let gx = 0; gx < W; gx++) {
        let userDrawn = false;
        let targetDrawn = false;

        // Check a 5x5 pixel block
        for (let py = 0; py < 5; py++) {
          for (let px = 0; px < 5; px++) {
            const pixelX = gx * 5 + px;
            const pixelY = gy * 5 + py;
            const idx = (pixelY * userCanvas.width + pixelX) * 4;

            if (userPixels[idx + 3] > 30) {
              userDrawn = true;
            }
            if (targetPixels[idx + 3] > 30) {
              targetDrawn = true;
            }
          }
        }

        if (userDrawn) {
          userGrid[gy][gx] = true;
          userDrawnCount++;
        }
        if (targetDrawn) {
          targetGrid[gy][gx] = true;
          targetDrawnCount++;
        }
      }
    }

    if (userDrawnCount === 0) {
      setWritingScore(0);
      setWritingFeedback('Bạn chưa vẽ nét nào cả! Hãy dùng chuột hoặc ngón tay để vẽ lên bảng.');
      return;
    }

    // Proximity check helper
    const checkProximity = (grid: boolean[][], cy: number, cx: number, R: number): boolean => {
      for (let dy = -R; dy <= R; dy++) {
        for (let dx = -R; dx <= R; dx++) {
          const ny = cy + dy;
          const nx = cx + dx;
          if (ny >= 0 && ny < H && nx >= 0 && nx < W) {
            if (grid[ny][nx]) return true;
          }
        }
      }
      return false;
    };

    // Calculate Precision (user stroke falling on/near target)
    let userCorrectCount = 0;
    for (let gy = 0; gy < H; gy++) {
      for (let gx = 0; gx < W; gx++) {
        if (userGrid[gy][gx]) {
          // Lenient check: user stroke must fall within 10px (R=2) of target character template
          if (checkProximity(targetGrid, gy, gx, 2)) {
            userCorrectCount++;
          }
        }
      }
    }
    const precision = userCorrectCount / userDrawnCount;

    // Calculate Recall (target template covered by user stroke)
    let targetCoveredCount = 0;
    for (let gy = 0; gy < H; gy++) {
      for (let gx = 0; gx < W; gx++) {
        if (targetGrid[gy][gx]) {
          // Lenient check: template path covered within 15px (R=3) of user stroke
          if (checkProximity(userGrid, gy, gx, 3)) {
            targetCoveredCount++;
          }
        }
      }
    }
    const recall = targetCoveredCount / targetDrawnCount;

    // Harmonic mean (F1 score)
    const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    
    // Scale score to a percentage
    let score = Math.round(f1 * 100);

    // Scribble defense: if user draws excessively large paths compared to target, penalize the score
    if (userDrawnCount > targetDrawnCount * 1.8) {
      const excessFactor = (targetDrawnCount * 1.8) / userDrawnCount;
      score = Math.round(score * excessFactor);
    }

    score = Math.max(0, Math.min(100, score));

    setWritingScore(score);

    // Set feedback text based on score
    if (score >= 85) {
      setWritingFeedback('Xuất sắc! Chữ viết cực kỳ đẹp và chính xác.');
    } else if (score >= 70) {
      setWritingFeedback('Rất tốt! Chữ viết rõ ràng, đúng hình dáng.');
    } else if (score >= 50) {
      setWritingFeedback('Khá tốt! Bạn hãy đồ sát nét hơn để tăng độ chính xác.');
    } else {
      setWritingFeedback('Cố gắng lên! Hãy đồ theo đúng nét chữ mờ ở nền.');
    }
  };

  // Toggle writing alphabet selection
  useEffect(() => {
    const activeList = writingAlphabet === 'hiragana' ? hiraganaData : katakanaData;
    setWritingKana(activeList[0]);
    clearCanvas();
  }, [writingAlphabet]);

  useEffect(() => {
    clearCanvas();
  }, [writingKana]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (reactionTimerRef.current) clearInterval(reactionTimerRef.current);
    };
  }, []);

  const menuItems = activeCourse === 'marugoto' ? [
    { name: 'Từ vựng', id: 'vocab', icon: '📚', active: false },
    { name: 'Ngữ pháp', id: 'grammar', icon: '📖', active: false },
    { name: 'Luyện tập 4 kỹ năng', id: 'practice', icon: '⚡', active: false },
    { name: 'Tổng hợp kiến thức', id: 'summary', icon: '📝', active: false }
  ] : [
    { name: 'Cẩm nang học', id: 'guide', icon: '📖', active: false },
    { name: 'Tiến độ học', id: 'dashboard', icon: '📊', active: false },
    { name: 'Lộ trình học', id: 'roadmap', icon: '🗺️', active: false },
    { name: 'Từ vựng', id: 'vocab', icon: '📚', active: false },
    { name: 'Chữ Hán (Kanji)', id: 'kanji', icon: '🉐', active: false },
    { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️', active: false },
    { name: 'Flashcards', id: 'flashcards', icon: '🃏', active: false },
    { name: 'Luyện nói (Kaiwa)', id: 'kaiwa', icon: '💬', active: false },
    { name: 'Ôn bảng chữ cái', id: 'kana', icon: '🔤', active: true }
  ];

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/50 dark:from-[#0b1329] dark:via-[#090d1a] dark:to-[#050811] text-slate-800 dark:text-slate-100 font-sans relative">
      
      {/* Mobile Sidebar Hamburger Toggle */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden absolute top-4 left-4 z-40 p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer backdrop-blur-md active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Backdrop overlay */}
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

          <CourseSwitcher
            activeCourse={activeCourse}
            onSwitch={(course) => {
              setActiveCourse(course);
            }}
          />

          <nav className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-0 select-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-100 hover:[&::-webkit-scrollbar-thumb]:bg-slate-450 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
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
                    // Stay here
                  } else if (item.id === 'mock-test') {
                    router.push('/mock-test');
                  } else if (item.id === 'knowledge') {
                    router.push('/knowledge');
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
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-20 lg:p-10 space-y-6 md:space-y-8">
        
        {/* Toast Alerts */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm rounded-xl shadow-2xl backdrop-blur-xl animate-fade-in flex items-center space-x-2">
            <span>ℹ️</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Title & Tab toggler */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
              ÔN BẢNG CHỮ CÁI TIẾNG NHẬT
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
              Học tập và rèn luyện phản xạ nhanh bảng chữ cái Hiragana & Katakana
            </p>
          </div>

          <div className="flex bg-slate-50 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm shrink-0 self-start lg:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => { setActiveTab('charts'); stopSpeedrun(); stopReactionGame(); }}
              className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === 'charts' ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'
              }`}
            >
              📊 Bảng chữ cái
            </button>
            <button
              onClick={() => { setActiveTab('speedrun'); stopSpeedrun(); stopReactionGame(); }}
              className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === 'speedrun' ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'
              }`}
            >
              ⚡ Trắc nghiệm phản xạ
            </button>
            <button
              onClick={() => { setActiveTab('reaction'); stopSpeedrun(); stopReactionGame(); }}
              className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === 'reaction' ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'
              }`}
            >
              ⏱️ Phản xạ chữ ghép
            </button>
            <button
              onClick={() => { setActiveTab('writing'); stopSpeedrun(); stopReactionGame(); }}
              className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === 'writing' ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'
              }`}
            >
              ✍️ Tập viết nét
            </button>
            <button
              onClick={() => { setActiveTab('combined'); stopSpeedrun(); stopReactionGame(); }}
              className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === 'combined' ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'
              }`}
            >
              🔗 Ôn chữ kết hợp
            </button>
          </div>
        </div>

        {/* TAB 1: KANA CHARTS */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="bg-slate-100/60 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex">
                <button
                  onClick={() => setChartType('hiragana')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    chartType === 'hiragana' ? 'bg-indigo-600 text-slate-900 dark:text-white shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'
                  }`}
                >
                  Hiragana (Chữ mềm)
                </button>
                <button
                  onClick={() => setChartType('katakana')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    chartType === 'katakana' ? 'bg-indigo-600 text-slate-900 dark:text-white shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200'
                  }`}
                >
                  Katakana (Chữ cứng)
                </button>
              </div>

              <div className="text-xs text-slate-400 dark:text-slate-500">
                Nhấp chuột vào ô chữ cái để nghe phát âm & xem mẹo ghi nhớ.
              </div>
            </div>

            {/* Grid of characters */}
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
              {(chartType === 'hiragana' ? hiraganaData : katakanaData).map((item) => {
                const map = chartType === 'hiragana' ? hiraganaProgress : katakanaProgress;
                const isMastered = map[item.id] === 'mastered';
                
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedKana(item);
                      setSelectedKanaType(chartType);
                      speak(item.char);
                    }}
                    className={`relative p-4 rounded-xl border transition-all duration-200 cursor-pointer text-center group flex flex-col justify-center items-center h-20 sm:h-24 ${
                      isMastered 
                        ? 'bg-emerald-950/20 border-emerald-800/60 shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:border-emerald-600'
                        : 'bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border-slate-200 dark:border-slate-800 hover:border-blue-700/60 hover:scale-105 shadow-sm'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:text-blue-400 transition-colors">
                      {item.char}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                      {item.romaji}
                    </span>

                    {/* Mastered Badge */}
                    {isMastered && (
                      <span className="absolute top-1 right-1 text-[9px] text-emerald-600 dark:text-emerald-400">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected character modal detail dialog */}
            {selectedKana && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/85 backdrop-blur-sm animate-fade-in">
                <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-100 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col scrollbar-thin">
                  {/* Decorative background glows */}
                  <div className="absolute -right-16 -top-16 w-36 h-36 bg-blue-600/10 rounded-full blur-3xl"></div>
                  <div className="absolute -left-16 -bottom-16 w-36 h-36 bg-indigo-600/10 rounded-full blur-3xl"></div>
                  
                  {/* Close button top right */}
                  <button
                    onClick={() => setSelectedKana(null)}
                    className="absolute top-4 right-4 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-400 dark:text-slate-500 transition-colors text-lg font-bold cursor-pointer z-20"
                    title="Đóng"
                  >
                    ✕
                  </button>

                  {/* Character Main Row */}
                  <div className="flex items-center space-x-5 relative z-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-4xl sm:text-5xl font-black text-blue-600 dark:text-blue-400 shadow-inner">
                      {selectedKana.char}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <span>Phiên âm:</span>
                        <span className="text-blue-600 dark:text-blue-400 font-mono font-black">{selectedKana.romaji}</span>
                      </h3>
                      <button
                        onClick={() => speak(selectedKana.char)}
                        className="mt-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-950/80 hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white dark:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
                        title="Nghe phát âm"
                      >
                        <span>🔊</span>
                        <span>Nghe phát âm</span>
                      </button>
                    </div>
                  </div>

                  {/* Stroke Order Animation Section */}
                  <div className="space-y-3 relative z-10 border-t border-b border-slate-200 dark:border-slate-800/55 dark:border-slate-800/50 py-4 flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest self-start">✍️ Cách viết (Stroke Order)</span>
                    <div className="w-32 h-32 rounded-2xl bg-white border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center shadow-inner relative overflow-hidden">
                      <img
                        id="stroke-order-image"
                        src={`https://commons.wikimedia.org/wiki/Special:Redirect/file/${selectedKanaType === 'hiragana' ? 'Hiragana' : 'Katakana'}_${selectedKana.char}_stroke_order_animation.gif`}
                        alt={`Cách viết chữ ${selectedKana.char}`}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          const imgEl = e.currentTarget as HTMLImageElement;
                          imgEl.style.display = 'none';
                          const fallbackEl = imgEl.parentElement?.querySelector('.fallback-msg') as HTMLElement;
                          if (fallbackEl) fallbackEl.style.display = 'block';
                        }}
                      />
                      <div className="fallback-msg hidden text-center text-xs text-slate-400 dark:text-slate-500 p-2 font-medium">
                        Cách viết cho chữ {selectedKana.char} đang được cập nhật
                      </div>
                    </div>
                  </div>

                  {/* Mnemonic Memory Hint */}
                  <div className="space-y-1.5 relative z-10 bg-indigo-950/10 border border-indigo-900/30 p-4 rounded-2xl text-xs sm:text-sm">
                    <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold mb-1">
                      <span>💡</span>
                      <span>Mẹo ghi nhớ nhanh:</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">{selectedKana.mnemonic}</p>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 relative z-10 pt-2">
                    <button
                      onClick={() => toggleProgress(selectedKana.id, selectedKanaType)}
                      className={`px-5 py-3 rounded-2xl border text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center space-x-2 ${
                        (selectedKanaType === 'hiragana' ? hiraganaProgress : katakanaProgress)[selectedKana.id] === 'mastered'
                          ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-600 dark:text-emerald-400 hover:bg-red-950/20 hover:border-red-200 dark:border-red-800 hover:text-red-600 dark:text-red-400'
                          : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700'
                      }`}
                    >
                      <span>
                        {(selectedKanaType === 'hiragana' ? hiraganaProgress : katakanaProgress)[selectedKana.id] === 'mastered'
                          ? '✓ Đã thuộc'
                          : 'Mark as Mastered'}
                      </span>
                    </button>
                    <button
                      onClick={() => setSelectedKana(null)}
                      className="px-5 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white dark:text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SPEEDRUN REFLEX GAME */}
        {activeTab === 'speedrun' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {speedrunGameOver ? (
              <div className="p-6 sm:p-8 bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-6 animate-fade-in">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-950/50 border border-red-800 flex items-center justify-center text-3xl">
                  💀
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-extrabold text-red-600 dark:text-red-400">TRÒ CHƠI KẾT THÚC</h2>
                  <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
                    Bạn đã trả lời sai hoặc hết thời gian suy nghĩ. Hãy xem kết quả lượt chơi:
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 text-left">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Điểm đạt được</span>
                    <p className="text-2xl font-black text-yellow-400">{gameScore}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Kỷ lục cá nhân</span>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{speedrunHighScore}</p>
                  </div>
                  <div className="col-span-2 border-t border-slate-200 dark:border-slate-800/50 pt-2.5 mt-1 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Số câu đúng lượt này</span>
                      <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{speedrunCorrectCount} câu</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Kỷ lục câu đúng</span>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{speedrunMaxCorrect} câu</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-3">
                  <button
                    onClick={startSpeedrun}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-slate-900 dark:text-white font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Chơi ván mới
                  </button>
                  <button
                    onClick={() => { setSpeedrunGameOver(false); setGameStarted(false); }}
                    className="px-5 py-2.5 bg-white border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    Quay về phòng chờ
                  </button>
                </div>
              </div>
            ) : !gameStarted ? (
              <div className="p-6 sm:p-8 bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-3xl">
                  ⚡
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-200">TRẮC NGHIỆM PHẢN XẠ NHANH KANA</h2>
                  <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 max-w-md mx-auto">
                    Mỗi câu hỏi có tối đa 10 giây để trả lời. Cứ sau mỗi 2 câu đúng, thời gian suy nghĩ sẽ tự động giảm đi 1 giây để thử thách phản xạ của bạn (tối thiểu là 2 giây)!
                  </p>
                  {(speedrunHighScore > 0 || speedrunMaxCorrect > 0) && (
                    <div className="flex flex-col sm:flex-row justify-center gap-2 mt-1.5">
                      <div className="inline-flex items-center space-x-1 px-3 py-1 bg-yellow-950/20 border border-yellow-900/40 rounded-full text-yellow-400 text-xs font-bold">
                        <span>🏆 Kỷ lục:</span>
                        <span>{speedrunHighScore} điểm</span>
                      </div>
                      <div className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-950/20 border border-blue-900/40 rounded-full text-blue-600 dark:text-blue-400 text-xs font-bold">
                        <span>🎯 Kỷ lục câu đúng:</span>
                        <span>{speedrunMaxCorrect} câu</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Chọn bảng ôn tập
                    </label>
                    <select
                      value={gameAlphabet}
                      onChange={(e) => setGameAlphabet(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="hiragana">Bảng Hiragana</option>
                      <option value="katakana">Bảng Katakana</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Chế độ luyện tập
                    </label>
                    <select
                      value={gameMode}
                      onChange={(e) => setGameMode(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="random">Luyện tập ngẫu nhiên</option>
                      <option value="confused">Luyện chữ dễ nhầm lẫn</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Học từ chữ
                    </label>
                    <select
                      value={speedrunStartIdx}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setSpeedrunStartIdx(val);
                        if (val > speedrunEndIdx) {
                          setSpeedrunEndIdx(val);
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                    >
                      {(gameAlphabet === 'hiragana' ? hiraganaData : katakanaData).map((item, idx) => (
                        <option key={item.id} value={idx}>
                          {item.char} ({item.romaji})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Đến chữ
                    </label>
                    <select
                      value={speedrunEndIdx}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setSpeedrunEndIdx(val);
                        if (val < speedrunStartIdx) {
                          setSpeedrunStartIdx(val);
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                    >
                      {(gameAlphabet === 'hiragana' ? hiraganaData : katakanaData).map((item, idx) => (
                        <option key={item.id} value={idx}>
                          {item.char} ({item.romaji})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={startSpeedrun}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-slate-900 dark:text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-900/30 cursor-pointer"
                >
                  Bắt đầu Luyện tập
                </button>
              </div>
            ) : (
              <div className="p-6 sm:p-8 bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6 relative overflow-hidden">
                {/* Score & Streak display */}
                <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-1.5">
                    <span>🏆</span>
                    <span>Điểm số: <strong className="text-yellow-400">{gameScore}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span>🔥</span>
                    <span>Streak: <strong className="text-orange-400">{gameStreak}</strong></span>
                  </div>
                </div>

                {/* Progress countdown bar */}
                <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-100 ease-linear"
                    style={{ width: `${(timeLeft / Math.max(2, 10 - Math.floor(speedrunCorrectCount / 2))) * 100}%` }}
                  />
                </div>

                {/* Character card */}
                <div className="py-8 flex flex-col items-center justify-center">
                  <div className={`w-32 h-32 rounded-3xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-6xl font-black text-blue-600 dark:text-blue-400 shadow-2xl relative transition-transform ${
                    feedback && !feedback.isCorrect ? 'animate-shake' : ''
                  }`}>
                    {currentQuestion?.char}

                    {/* Speech repeat button - only show when feedback is shown to avoid leaking answer */}
                    {feedback && feedback.show && (
                      <button
                        onClick={(e) => { e.stopPropagation(); speak(currentQuestion?.char || ''); }}
                        className="absolute bottom-2 right-2 p-1.5 bg-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-400 dark:text-slate-500 text-xs animate-fade-in"
                        title="Phát lại âm thanh"
                      >
                        🔊
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">Chọn cách đọc Romaji đúng:</p>
                </div>

                {/* Answer Options grid */}
                <div className="grid grid-cols-2 gap-4">
                  {answerOptions.map((opt, idx) => {
                    let btnStyle = "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-700/60 hover:text-slate-900 dark:hover:text-white dark:text-white";
                    
                    if (feedback && feedback.show) {
                      if (opt === currentQuestion?.romaji) {
                        btnStyle = "bg-emerald-950/40 border-emerald-600 text-emerald-600 dark:text-emerald-400 pointer-events-none animate-bounce";
                      } else {
                        btnStyle = "bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 pointer-events-none";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(opt)}
                        disabled={feedback !== null}
                        className={`w-full py-4.5 rounded-2xl border text-center font-black text-lg transition-all active:scale-[0.98] cursor-pointer ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={stopSpeedrun}
                    className="px-4 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-red-200 dark:border-red-800 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:text-red-400 rounded-xl text-xs transition-colors"
                  >
                    Dừng / Thoát game
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REACTION TRAINING GAME */}
        {activeTab === 'reaction' && (
          <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
            {!reactionStarted && (
              <div className="p-6 sm:p-8 bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none rounded-2xl text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-indigo-950/50 border border-indigo-800 flex items-center justify-center text-3xl">
                  ⏱️
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-200">LUYỆN PHẢN XẠ CHỮ GHÉP</h2>
                  <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 max-w-md mx-auto leading-relaxed">
                    Trò chơi rèn luyện phản xạ đọc nhanh các từ kết hợp. Chữ Nhật sẽ xuất hiện trên màn hình, bạn tự đọc to thành tiếng. Hệ thống sẽ tự động phát âm và hiện nghĩa sau một khoảng thời gian, rồi tự động chuyển câu.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg mx-auto text-left">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Độ khó (Độ dài từ)
                    </label>
                    <select
                      value={reactionDifficulty}
                      onChange={(e) => setReactionDifficulty(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="easy">Dễ (3 ~ 5 ký tự)</option>
                      <option value="medium">Trung bình (6 ~ 9 ký tự)</option>
                      <option value="hard">Khó (10 ~ 15 ký tự)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Số lượng câu hỏi
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={reactionLimit}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReactionLimit(val === '' ? '' : parseInt(val));
                      }}
                      onBlur={() => {
                        if (reactionLimit === '' || isNaN(Number(reactionLimit))) {
                          setReactionLimit(10);
                        } else {
                          setReactionLimit(Math.max(5, Math.min(Number(reactionLimit), 100)));
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      T.gian đọc (giây)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={reactionTimeLimit}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReactionTimeLimit(val === '' ? '' : parseInt(val));
                      }}
                      onBlur={() => {
                        if (reactionTimeLimit === '' || isNaN(Number(reactionTimeLimit))) {
                          setReactionTimeLimit(3);
                        } else {
                          setReactionTimeLimit(Math.max(1, Math.min(Number(reactionTimeLimit), 15)));
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      T.gian hiện đáp án (giây)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={reactionResultLimit}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReactionResultLimit(val === '' ? '' : parseInt(val));
                      }}
                      onBlur={() => {
                        if (reactionResultLimit === '' || isNaN(Number(reactionResultLimit))) {
                          setReactionResultLimit(2);
                        } else {
                          setReactionResultLimit(Math.max(1, Math.min(Number(reactionResultLimit), 10)));
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none text-center font-bold"
                    />
                  </div>
                </div>

                <button
                  onClick={startReactionGame}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-slate-900 dark:text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-900/30 cursor-pointer"
                >
                  Bắt đầu Luyện tập
                </button>
              </div>
            )}

            {reactionStarted && reactionCurrentWord && (
              <div className="p-6 sm:p-8 bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none rounded-2xl space-y-6 relative overflow-hidden text-center animate-fade-in">
                {/* Game Header Progress */}
                <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-1.5">
                    <span>📝 Tiến trình:</span>
                    <span><strong className="text-indigo-600 dark:text-indigo-400">{reactionCurrentIndex + 1}</strong> / {reactionList.length} từ</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span>
                      {reactionStatus === 'reading' ? '⏳ Thời gian đọc:' : '👁️ Hiển thị đáp án:'}
                    </span>
                    <strong className={reactionStatus === 'reading' ? 'text-orange-400' : 'text-emerald-500'}>
                      {reactionTimeLeft.toFixed(1)}s
                    </strong>
                  </div>
                </div>

                {/* Progress countdown bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-100 ease-linear ${
                      reactionStatus === 'reading' ? 'bg-gradient-to-r from-orange-500 to-amber-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    style={{ 
                      width: `${(reactionTimeLeft / (reactionStatus === 'reading' ? (reactionTimeLimit || 3) : (reactionResultLimit || 2))) * 100}%` 
                    }}
                  />
                </div>

                {/* Word Display Area */}
                <div className="py-8 flex flex-col items-center justify-center space-y-6">
                  <div className="min-h-[140px] flex items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-wide leading-relaxed block px-4 py-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-inner">
                      {reactionCurrentWord.word}
                    </span>
                  </div>

                  {reactionStatus === 'reading' ? (
                    <div className="space-y-1 animate-pulse">
                      <p className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400">
                        🔔 HÃY ĐỌC TO THÀNH TIẾNG!
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        Đáp án và âm thanh sẽ xuất hiện khi hết thời gian đếm ngược.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in w-full max-w-md mx-auto p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                      <div className="flex items-center justify-center space-x-2.5">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Phiên âm:</span>
                        <strong className="text-xl font-mono font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                          {reactionCurrentWord.romaji}
                        </strong>
                        <button
                          onClick={() => speak(reactionCurrentWord.word)}
                          className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 rounded-lg text-slate-500 dark:text-slate-300 text-xs active:scale-95 cursor-pointer shadow-sm animate-fade-in"
                          title="Phát lại âm thanh"
                        >
                          🔊
                        </button>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-800/50 pt-2.5">
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">Ý nghĩa:</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {reactionCurrentWord.meaning}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Control Action Buttons */}
                <div className="flex justify-center space-x-3 pt-2">
                  <button
                    onClick={stopReactionGame}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-red-200 dark:border-red-800 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    ⏹️ Dừng / Thoát game
                  </button>
                  <button
                    onClick={nextReactionQuestion}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-slate-900 dark:text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
                  >
                    <span>⏭️ Bỏ qua / Câu tiếp</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CANVAS STROKE ORDER WRITING */}
        {activeTab === 'writing' && (
          <div className="space-y-6 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 justify-center">
            
            {/* Writing controls panel */}
            <div className="w-full md:w-80 p-5 bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-2xl space-y-5">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">
                ✍️ THIẾT LẬP LUYỆN VIẾT
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    Chọn loại chữ cái
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80">
                    <button
                      onClick={() => setWritingAlphabet('hiragana')}
                      className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        writingAlphabet === 'hiragana' ? 'bg-indigo-600 text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      Hiragana
                    </button>
                    <button
                      onClick={() => setWritingAlphabet('katakana')}
                      className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        writingAlphabet === 'katakana' ? 'bg-indigo-600 text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      Katakana
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    Chọn chữ cái cần viết
                  </label>
                  <select
                    value={writingKana.id}
                    onChange={(e) => {
                      const list = writingAlphabet === 'hiragana' ? hiraganaData : katakanaData;
                      const found = list.find(item => item.id === parseInt(e.target.value));
                      if (found) setWritingKana(found);
                    }}
                    className="w-full bg-white border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    {(writingAlphabet === 'hiragana' ? hiraganaData : katakanaData).map(item => (
                      <option key={item.id} value={item.id}>
                        {item.char} ({item.romaji})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 rounded-xl space-y-1.5 text-xs text-slate-400 dark:text-slate-500">
                <p>💡 <strong>Mẹo gợi nhớ:</strong></p>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">{writingKana.mnemonic}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={checkDrawingSimilarity}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-slate-900 dark:text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-blue-900/20 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>🎯</span>
                  <span>Chấm điểm chữ viết</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => speak(writingKana.char)}
                    className="py-2.5 bg-white border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white dark:text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <span>🔊</span>
                    <span>Phát âm</span>
                  </button>
                  <button
                    onClick={clearCanvas}
                    className="py-2.5 bg-white border border-slate-200 dark:border-slate-800 hover:border-red-200 dark:border-red-800 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:text-red-400 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <span>🧹</span>
                    <span>Xóa bảng</span>
                  </button>
                </div>
              </div>

              {writingScore !== null && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 rounded-xl space-y-2 animate-fade-in text-center shadow-inner">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                    Độ tương đồng nét vẽ
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                      {writingScore}%
                    </span>
                    <span className="text-xl">
                      {writingScore >= 85 ? '🏆' : writingScore >= 70 ? '⭐' : writingScore >= 50 ? '👍' : '✍️'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                    {writingFeedback}
                  </p>
                </div>
              )}
            </div>

            {/* Drawing Board Canvas */}
            <div className="relative bg-white border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col items-center">
              
              {/* Background trace text */}
              <div 
                className="absolute inset-0 flex items-center justify-center text-slate-200 dark:text-white/20 text-[200px] font-black select-none pointer-events-none"
                style={{ top: '-10px' }}
              >
                {writingKana.char}
              </div>

              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="relative z-10 w-[300px] h-[300px] bg-transparent border border-dashed border-slate-200 dark:border-slate-800/40 dark:border-slate-800/40 rounded-2xl cursor-crosshair touch-none"
              />

              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase mt-3 tracking-widest">
                Khung viết vẽ tay cảm ứng tự do
              </span>
            </div>

          </div>
        )}

        {/* TAB 5: COMBINED CHARACTERS REVIEW */}
        {activeTab === 'combined' && (
          <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
            {!combinedIsStarted ? (
              <div className="p-6 sm:p-8 bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-6 max-w-lg mx-auto">
                <div className="w-16 h-16 mx-auto rounded-full bg-indigo-950/50 border border-indigo-800 flex items-center justify-center text-3xl">
                  🔗
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">ÔN TẬP CHỮ KẾT HỢP</h2>
                  <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 max-w-md mx-auto leading-relaxed">
                    Luyện tập nối từ, làm quen với âm ghép (yoon), âm đục và âm bán đục. Nhìn chữ Nhật viết bằng Kana và điền chính xác phiên âm Romaji.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Độ khó (Độ dài từ)
                    </label>
                    <select
                      value={combinedDifficulty}
                      onChange={(e) => setCombinedDifficulty(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="easy">Dễ (3 ~ 5 ký tự)</option>
                      <option value="medium">Trung bình (6 ~ 9 ký tự)</option>
                      <option value="hard">Khó (10 ~ 15 ký tự)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Số từ mỗi lượt ôn
                    </label>
                    <select
                      value={combinedLimit}
                      onChange={(e) => setCombinedLimit(parseInt(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value={10}>10 câu</option>
                      <option value={20}>20 câu</option>
                      <option value={50}>50 câu</option>
                      <option value={100}>100 câu</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={startCombinedQuiz}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-slate-900 dark:text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-900/30 cursor-pointer"
                >
                  Bắt đầu Luyện tập
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Header info bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/85 p-4 rounded-2xl backdrop-blur-sm">
                  <div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Đang ôn tập</span>
                    <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      <span>🔗 Ôn Chữ Kết Hợp</span>
                      <span className="px-2.5 py-0.5 bg-indigo-950/50 border border-indigo-800 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold rounded-md uppercase">
                        {combinedDifficulty === 'easy' ? 'Dễ' : combinedDifficulty === 'medium' ? 'Trung bình' : 'Khó'}
                      </span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCombinedIsStarted(false)}
                      className="px-4 py-2 bg-white border border-slate-200 dark:border-slate-800 hover:border-red-200 dark:border-red-800 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Quay lại
                    </button>
                    {!combinedIsGraded && (
                      <button
                        onClick={gradeCombinedQuiz}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-slate-900 dark:text-white font-bold rounded-xl text-xs active:scale-95 transition-all shadow-md cursor-pointer"
                      >
                        🎯 Nộp bài & Chấm điểm
                      </button>
                    )}
                  </div>
                </div>

                {/* Score Summary Panel when graded */}
                {combinedIsGraded && combinedScore !== null && (
                  <div className="p-5 bg-gradient-to-r from-slate-50 to-indigo-50/20 dark:from-slate-950/60 dark:to-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in shadow-xl">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center relative shrink-0">
                        <div 
                          className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"
                          style={{ animationDuration: '4s' }}
                        />
                        <span className={`text-xl font-black ${combinedScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : combinedScore >= 50 ? 'text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                          {combinedScore}%
                        </span>
                      </div>
                      <div className="text-left space-y-1">
                        <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Kết quả ôn tập của bạn</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Đúng hoàn toàn: <strong className="text-slate-900 dark:text-white">{combinedPerfectCount} / {combinedList.length}</strong> từ.
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                          Nhận xét: {combinedScore === 100 ? 'Quá xuất sắc! Bạn đã làm chủ hoàn toàn các từ này. 🏆' : combinedScore >= 80 ? 'Rất tuyệt vời! Bạn có phản xạ chữ ghép cực tốt. 🌟' : combinedScore >= 50 ? 'Khá tốt! Luyện tập thêm để thuần thục hơn nhé. 💪' : 'Hãy kiên trì luyện tập! Bạn sẽ tiến bộ nhanh thôi. 👍'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end md:self-auto">
                      <button
                        onClick={startCombinedQuiz}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-slate-900 dark:text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Luyện tập vòng mới 🔄
                      </button>
                    </div>
                  </div>
                )}

                {/* Desktop View Table */}
                <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 backdrop-blur-md shadow-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80">
                        <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center w-12">STT</th>
                        <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center w-12">Nghe</th>
                        <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Từ Nhật (Kana)</th>
                        <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nghĩa tiếng Việt</th>
                        <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center w-64">Phiên âm Romaji của bạn</th>
                        <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center w-28">Kết quả</th>
                        <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center w-32">% Đúng</th>
                        <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center w-48">Đáp án đúng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {combinedList.map((item, idx) => {
                        const userAnswer = combinedAnswers[item.id] || '';
                        const pct = calculateAccuracy(userAnswer, item.romaji);
                        const isVisible = combinedVisibleAnswers[item.id] || false;

                        return (
                          <tr key={item.id} className="hover:bg-slate-100 dark:hover:bg-slate-900/20 dark:bg-slate-900/20 transition-colors">
                            <td className="py-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 text-center">{idx + 1}</td>
                            <td className="py-4 px-4 text-center">
                              <button
                                onClick={() => speak(item.word)}
                                className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:text-blue-400 transition-all cursor-pointer"
                                title="Nghe từ đọc"
                              >
                                🔊
                              </button>
                            </td>
                            <td className="py-4 px-4 text-lg font-black text-slate-800 dark:text-slate-100 font-sans tracking-wide">
                              {item.word}
                            </td>
                            <td className="py-4 px-4 text-xs text-slate-400 dark:text-slate-500 font-medium">
                              {item.meaning}
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-1.5">
                                <input
                                  type="text"
                                  placeholder="Nhập phiên âm Romaji..."
                                  value={userAnswer}
                                  disabled={combinedIsGraded}
                                  onChange={(e) => setCombinedAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
                                  className={`w-full bg-[#FCF3CF] dark:bg-slate-950 text-slate-900 dark:text-white font-extrabold text-base md:text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400 dark:text-slate-500 ${combinedIsGraded ? 'opacity-80' : ''}`}
                                />
                                {combinedIsGraded && pct < 100 && (
                                  <div className="flex items-center gap-1.5 text-[11px] bg-slate-50 dark:bg-slate-950/60 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80">
                                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider shrink-0">Chi tiết lỗi:</span>
                                    <div className="font-mono tracking-wide flex-1 text-left">{renderDiff(userAnswer, item.romaji)}</div>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {combinedIsGraded && (
                                pct === 100 ? (
                                  <span className="inline-block px-2.5 py-0.5 bg-emerald-950/40 border border-emerald-900/60 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 rounded-md animate-bounce">
                                    🟢 Đúng
                                  </span>
                                ) : (
                                  <span className="inline-block px-2.5 py-0.5 bg-red-950/40 border border-red-900/60 text-[10px] font-bold text-red-600 dark:text-red-400 rounded-md">
                                    🔴 Sai
                                  </span>
                                )
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              {combinedIsGraded && (
                                <div className="space-y-0.5">
                                  <span className={`text-xs font-black ${pct === 100 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 50 ? 'text-yellow-555' : 'text-red-600 dark:text-red-400'}`}>
                                    {pct}%
                                  </span>
                                  <span className="block text-[8px] text-slate-400 dark:text-slate-500 leading-none">{getEncouragementText(pct)}</span>
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2 justify-center">
                                <button
                                  onClick={() => setCombinedVisibleAnswers(prev => ({ ...prev, [item.id]: !isVisible }))}
                                  className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200 cursor-pointer"
                                  title={isVisible ? 'Ẩn đáp án' : 'Hiện đáp án'}
                                >
                                  {isVisible ? '👁' : '🙈'}
                                </button>
                                <span className={`text-xs break-all ${isVisible ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-700 dark:text-slate-200 font-mono select-none blur-[4px]'}`}>
                                  {isVisible ? item.romaji : '••••••••'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Cards */}
                <div className="md:hidden space-y-4">
                  {combinedList.map((item, idx) => {
                    const userAnswer = combinedAnswers[item.id] || '';
                    const pct = calculateAccuracy(userAnswer, item.romaji);
                    const isVisible = combinedVisibleAnswers[item.id] || false;

                    return (
                      <div key={item.id} className="bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 p-4.5 rounded-2xl space-y-3.5 backdrop-blur-sm">
                        {/* Card Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/40 dark:border-slate-800/40 pb-2">
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Câu {idx + 1}</span>
                          <button
                            onClick={() => speak(item.word)}
                            className="p-1 rounded-md bg-white border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:text-blue-400 cursor-pointer"
                          >
                            🔊 Nghe đọc
                          </button>
                        </div>

                        {/* Question Word */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Từ Kana</span>
                            <p className="text-base font-black text-slate-800 dark:text-slate-100 font-sans">{item.word}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nghĩa Việt</span>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{item.meaning}</p>
                          </div>
                        </div>

                        {/* User Input */}
                        <div className="space-y-1">
                          <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nhập Romaji</span>
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              placeholder="Nhập phiên âm Romaji..."
                              value={userAnswer}
                              disabled={combinedIsGraded}
                              onChange={(e) => setCombinedAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
                              className={`w-full bg-[#FCF3CF] dark:bg-slate-950 text-slate-900 dark:text-white font-extrabold text-base md:text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 dark:text-slate-500 ${combinedIsGraded ? 'opacity-80' : ''}`}
                            />
                            {combinedIsGraded && pct < 100 && (
                              <div className="flex items-center gap-1.5 text-[11px] bg-slate-50 dark:bg-slate-950/60 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80">
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider shrink-0">Chi tiết lỗi:</span>
                                <div className="font-mono tracking-wide flex-1 text-left">{renderDiff(userAnswer, item.romaji)}</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Results on Mobile */}
                        {combinedIsGraded && (
                          <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/55 dark:border-slate-800/50">
                            <div>
                              <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Kết quả</span>
                              {pct === 100 ? (
                                <span className="inline-block px-2 py-0.5 bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 rounded-md">
                                  🟢 Đúng
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 bg-red-950/30 border border-red-200 dark:border-red-800 text-[9px] font-bold text-red-600 dark:text-red-400 rounded-md">
                                  🔴 Sai
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-0.5">% Đúng</span>
                              <span className={`text-xs font-black ${pct === 100 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 50 ? 'text-yellow-555' : 'text-red-600 dark:text-red-400'}`}>
                                {pct}%
                              </span>
                              <span className="block text-[8px] text-slate-400 dark:text-slate-500 mt-0.5">{getEncouragementText(pct)}</span>
                            </div>
                          </div>
                        )}

                        {/* Reveal Answer on Mobile */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/40 dark:border-slate-800/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Đáp án đúng</span>
                            <button
                              onClick={() => setCombinedVisibleAnswers(prev => ({ ...prev, [item.id]: !isVisible }))}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200 cursor-pointer flex items-center space-x-1"
                            >
                              <span>{isVisible ? '👁️' : '🙈'}</span>
                              <span>{isVisible ? 'Ẩn' : 'Hiện'}</span>
                            </button>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 dark:border-slate-800/60 p-2.5 rounded-xl text-center">
                            <p className={`font-mono text-xs tracking-wide break-all transition-all ${isVisible ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-650 select-none blur-[4px]'}`}>
                              {isVisible ? item.romaji : '••••••••'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Grade bottom actions bar */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setCombinedIsStarted(false)}
                    className="px-5 py-2.5 bg-white border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Dừng ôn tập
                  </button>
                  {!combinedIsGraded && (
                    <button
                      onClick={gradeCombinedQuiz}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-slate-900 dark:text-white font-bold rounded-xl text-xs active:scale-95 transition-all shadow-md cursor-pointer"
                    >
                      🎯 Chấm điểm kết quả
                    </button>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
