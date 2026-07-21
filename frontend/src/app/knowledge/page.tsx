'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../utils/api';
import SidebarSettings from '../components/SidebarSettings';
import ReviewTab from '../lessons/[id]/ReviewTab';
import { playAudioWithFallback, speakTTS } from '../utils/audioHelper';

interface Lesson {
  id: number;
  title: string;
  description: string;
  course: string;
}

interface VocabItem {
  id: number;
  lesson_id: number;
  hiragana: string;
  romaji: string;
  vietnamese_meaning: string;
  word_type: string;
  japanese_example?: string;
  example_meaning?: string;
  mnemonic_tip?: string;
  status?: 'not_learned' | 'learning' | 'mastered';
  kanji_form?: string;
}

interface KanjiItem {
  id: number;
  lesson_id: number;
  character: string;
  stroke_count?: string;
  onyomi?: string;
  kunyomi?: string;
  sino_vietnamese?: string;
  vietnamese_meaning: string;
  mnemonic_tip?: string;
  compounds?: string;
  status?: 'not_learned' | 'learning' | 'mastered';
}

interface GrammarItem {
  id: number;
  lesson_id: number;
  title: string;
  meaning: string;
  structure?: string;
  vietnamese_explanation?: string;
  japanese_example?: string;
  example_meaning?: string;
  romaji_example?: string;
  notes?: string;
  status?: 'not_learned' | 'learning' | 'mastered';
}

export default function KnowledgeHubPage() {
  const router = useRouter();

  const playAudio = (text: string, kana?: string) => {
    playAudioWithFallback(text, kana || text);
  };

  

  


  // Core navigation/UI states
  const [level, setLevel] = useState<'N5' | 'N4'>('N5');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'vocab' | 'kanji' | 'grammar' | 'practice' | 'review'>('vocab');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter states
  const [filterLesson, setFilterLesson] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showKanjiInVocab, setShowKanjiInVocab] = useState<boolean>(false);
  const [hideMastered, setHideMastered] = useState<boolean>(false);

  // Debounced search queries
  const [localSearchQuery, setLocalSearchQuery] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Core data from API
  const [vocabList, setVocabList] = useState<VocabItem[]>([]);
  const [kanjiList, setKanjiList] = useState<KanjiItem[]>([]);
  const [grammarList, setGrammarList] = useState<GrammarItem[]>([]);

  // -------------------------------------------------------------
  // 4. Luyện tập từ vựng (Vocabulary Practice) States
  // -------------------------------------------------------------
  const [practiceLimit, setPracticeLimit] = useState<number | ''>(10);
  const [practiceType, setPracticeType] = useState<'write' | 'speedrun'>('write');
  const [useRomaji, setUseRomaji] = useState<boolean>(false);
  const [practiceList, setPracticeList] = useState<VocabItem[]>([]);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [isGraded, setIsGraded] = useState<boolean>(false);
  const [visibleAnswers, setVisibleAnswers] = useState<Record<string, boolean>>({});
  const [practiceDirection, setPracticeDirection] = useState<'vi-to-ja' | 'ja-to-vi'>('vi-to-ja');
  const [practiceScriptMode, setPracticeScriptMode] = useState<'hiragana' | 'kanji'>('hiragana');
  const [practiceDropdownOpen, setPracticeDropdownOpen] = useState<boolean>(false);
  const [practiceFilterStatuses, setPracticeFilterStatuses] = useState<Record<string, boolean>>({
    not_learned: false,
    learning: false,
    mastered: false,
  });

  // Speedrun states
  const [speedrunActive, setSpeedrunActive] = useState<boolean>(false);
  const [speedrunGameOver, setSpeedrunGameOver] = useState<boolean>(false);
  const [speedrunScore, setSpeedrunScore] = useState<number>(0);
  const [speedrunHighScore, setSpeedrunHighScore] = useState<number>(0);
  const [speedrunQuestion, setSpeedrunQuestion] = useState<VocabItem | null>(null);
  const [speedrunOptions, setSpeedrunOptions] = useState<string[]>([]);
  const [speedrunTimeLeft, setSpeedrunTimeLeft] = useState<number>(10);
  const [speedrunMaxTime, setSpeedrunMaxTime] = useState<number>(10);
  const [speedrunDirection, setSpeedrunDirection] = useState<'ja-to-vi' | 'vi-to-ja' | 'listen-to-select'>('ja-to-vi');
  const [speedrunStreak, setSpeedrunStreak] = useState<number>(0);
  const [speedrunFilterStatuses, setSpeedrunFilterStatuses] = useState<Record<string, boolean>>({
    not_learned: false,
    learning: false,
    mastered: false,
  });
  const [speedrunDropdownOpen, setSpeedrunDropdownOpen] = useState<boolean>(false);

  const speedrunTimerRef = useRef<any>(null);
  const speedrunScoreRef = useRef<number>(0);

  const practiceResultsRef = useRef<HTMLDivElement | null>(null);
  const practiceTopRef = useRef<HTMLDivElement | null>(null);

  // -------------------------------------------------------------
  // 5. Luyện tập tổng hợp (Combined Review) States
  // -------------------------------------------------------------
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [reviewData, setReviewData] = useState<any>(null);
  const [reviewStep, setReviewStep] = useState<'setup' | 'test' | 'result'>('setup');
  const [reviewQuestions, setReviewQuestions] = useState<any[]>([]);
  const [reviewSelectedType, setReviewSelectedType] = useState<string>('translation');
  const [reviewIndex, setReviewIndex] = useState<number>(0);
  const [reviewAnswers, setReviewAnswers] = useState<Record<string, string>>({});
  const [reviewGraded, setReviewGraded] = useState<Record<string, boolean>>({});
  const [reviewFeedback, setReviewFeedback] = useState<Record<string, string>>({});
  const [reviewScore, setReviewScore] = useState<number>(0);
  const [reviewTotal, setReviewTotal] = useState<number>(0);
  const [reviewShowKanji, setReviewShowKanji] = useState<boolean>(false);

  // Toast notifier helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Force Minna course configuration on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeCourse', 'minna');
    }
  }, []);

  // Fetch course summary (Lessons, Vocab, Kanji, Grammar) for minna
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/user/course-summary?course=minna`);
      setLessons(res.lessons || []);
      setVocabList(res.vocabulary || []);
      setKanjiList(res.kanji || []);
      setGrammarList(res.grammar || []);
    } catch (err) {
      console.error('Error loading course summary:', err);
      showToast('Có lỗi xảy ra khi tải dữ liệu học tập.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounce search query input to avoid lag
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [localSearchQuery]);

  // Active level bounds
  const startLessonId = level === 'N5' ? 1 : 26;
  const endLessonId = level === 'N5' ? 25 : 50;

  // Filter lessons based on N5/N4
  const filteredLessons = useMemo(() => {
    return lessons.filter(l => l.id >= startLessonId && l.id <= endLessonId);
  }, [lessons, startLessonId, endLessonId]);

  // Filter lists based on level, lesson, status, query and hideMastered checkbox
  const displayedVocab = useMemo(() => {
    let list = vocabList.filter(v => v.lesson_id >= startLessonId && v.lesson_id <= endLessonId);

    if (filterLesson !== 'all') {
      const lId = parseInt(filterLesson);
      list = list.filter(v => v.lesson_id === lId);
    }
    if (filterStatus !== 'all') {
      list = list.filter(v => v.status === filterStatus);
    }
    if (hideMastered) {
      list = list.filter(v => v.status !== 'mastered');
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(v => 
        v.hiragana.toLowerCase().includes(q) || 
        v.romaji.toLowerCase().includes(q) || 
        v.vietnamese_meaning.toLowerCase().includes(q) ||
        (v.kanji_form && v.kanji_form.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => {
      if (a.lesson_id !== b.lesson_id) return a.lesson_id - b.lesson_id;
      return a.id - b.id;
    });
  }, [vocabList, startLessonId, endLessonId, filterLesson, filterStatus, hideMastered, searchQuery]);

  const displayedKanji = useMemo(() => {
    let list = kanjiList.filter(k => k.lesson_id >= startLessonId && k.lesson_id <= endLessonId);

    if (filterLesson !== 'all') {
      const lId = parseInt(filterLesson);
      list = list.filter(k => k.lesson_id === lId);
    }
    if (filterStatus !== 'all') {
      list = list.filter(k => k.status === filterStatus);
    }
    if (hideMastered) {
      list = list.filter(k => k.status !== 'mastered');
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(k => 
        k.character.includes(q) || 
        (k.sino_vietnamese && k.sino_vietnamese.toLowerCase().includes(q)) || 
        k.vietnamese_meaning.toLowerCase().includes(q) ||
        (k.onyomi && k.onyomi.toLowerCase().includes(q)) ||
        (k.kunyomi && k.kunyomi.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => {
      if (a.lesson_id !== b.lesson_id) return a.lesson_id - b.lesson_id;
      return a.id - b.id;
    });
  }, [kanjiList, startLessonId, endLessonId, filterLesson, filterStatus, hideMastered, searchQuery]);

  const displayedGrammar = useMemo(() => {
    let list = grammarList.filter(g => g.lesson_id >= startLessonId && g.lesson_id <= endLessonId);

    if (filterLesson !== 'all') {
      const lId = parseInt(filterLesson);
      list = list.filter(g => g.lesson_id === lId);
    }
    if (hideMastered) {
      list = list.filter(g => g.status !== 'mastered');
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(g => 
        g.title.toLowerCase().includes(q) || 
        g.meaning.toLowerCase().includes(q) || 
        (g.vietnamese_explanation && g.vietnamese_explanation.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => {
      if (a.lesson_id !== b.lesson_id) return a.lesson_id - b.lesson_id;
      return a.id - b.id;
    });
  }, [grammarList, startLessonId, endLessonId, filterLesson, hideMastered, searchQuery]);

  // Group displayed items by lesson
  const groupedVocab = useMemo(() => {
    const groups: Record<number, VocabItem[]> = {};
    displayedVocab.forEach(v => {
      if (!groups[v.lesson_id]) groups[v.lesson_id] = [];
      groups[v.lesson_id].push(v);
    });
    return groups;
  }, [displayedVocab]);

  const vocabLessonIds = useMemo(() => {
    return Object.keys(groupedVocab).map(Number).sort((a, b) => a - b);
  }, [groupedVocab]);

  const groupedKanji = useMemo(() => {
    const groups: Record<number, KanjiItem[]> = {};
    displayedKanji.forEach(k => {
      if (!groups[k.lesson_id]) groups[k.lesson_id] = [];
      groups[k.lesson_id].push(k);
    });
    return groups;
  }, [displayedKanji]);

  const kanjiLessonIds = useMemo(() => {
    return Object.keys(groupedKanji).map(Number).sort((a, b) => a - b);
  }, [groupedKanji]);

  const groupedGrammar = useMemo(() => {
    const groups: Record<number, GrammarItem[]> = {};
    displayedGrammar.forEach(g => {
      if (!groups[g.lesson_id]) groups[g.lesson_id] = [];
      groups[g.lesson_id].push(g);
    });
    return groups;
  }, [displayedGrammar]);

  const grammarLessonIds = useMemo(() => {
    return Object.keys(groupedGrammar).map(Number).sort((a, b) => a - b);
  }, [groupedGrammar]);

  const getLessonTitle = useCallback((lessonId: number) => {
    const lesson = lessons.find(l => l.id === lessonId);
    return lesson ? `Bài ${lessonId}: ${lesson.title}` : `Bài ${lessonId}`;
  }, [lessons]);

  // Level selector triggers
  const handleLevelChange = (selectedLevel: 'N5' | 'N4') => {
    setLevel(selectedLevel);
    setFilterLesson('all');
    setFilterStatus('all');
    setLocalSearchQuery('');
    stopSpeedrun();
    setPracticeList([]);
    setReviewStep('setup');
    setReviewData(null);
  };

  // Sync state update of item status
  const handleItemStatusChange = async (itemId: number, itemType: 'vocabulary' | 'kanji' | 'grammar', newStatus: 'not_learned' | 'learning' | 'mastered') => {
    try {
      await api.post('/api/user/progress', {
        item_type: itemType,
        item_id: itemId,
        status: newStatus
      });
      if (itemType === 'vocabulary') {
        setVocabList(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item));
      } else if (itemType === 'kanji') {
        setKanjiList(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item));
      } else if (itemType === 'grammar') {
        setGrammarList(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item));
      }
      showToast('Cập nhật trạng thái thành công!');
    } catch (err: any) {
      console.error('Failed to update status:', err);
      showToast('Lỗi cập nhật trạng thái học tập.');
    }
  };

  // Close dropdowns on outside mouse click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const pEl = document.getElementById('practice-dropdown-container');
      if (pEl && !pEl.contains(event.target as Node)) {
        setPracticeDropdownOpen(false);
      }
      const sEl = document.getElementById('speedrun-dropdown-container');
      if (sEl && !sEl.contains(event.target as Node)) {
        setSpeedrunDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // -------------------------------------------------------------
  // 4. Vocabulary Practice implementation
  // -------------------------------------------------------------
  const vocabListForLevel = useMemo(() => {
    return vocabList.filter(v => v.lesson_id >= startLessonId && v.lesson_id <= endLessonId);
  }, [vocabList, startLessonId, endLessonId]);

  const currentSourceList = useMemo(() => {
    const active = Object.keys(practiceFilterStatuses).filter(k => practiceFilterStatuses[k]);
    if (active.length === 0) return vocabListForLevel;
    return vocabListForLevel.filter(item => practiceFilterStatuses[item.status || 'not_learned']);
  }, [vocabListForLevel, practiceFilterStatuses]);

  const generatePracticeList = useCallback(() => {
    const shuffled = [...currentSourceList].sort(() => Math.random() - 0.5);
    const limit = practiceLimit === '' ? 10 : practiceLimit;
    setPracticeList(shuffled.slice(0, limit));
    setPracticeAnswers({});
    setIsGraded(false);
    setVisibleAnswers({});
  }, [currentSourceList, practiceLimit]);

  // Autoload list for practice mode
  useEffect(() => {
    if (activeTab === 'practice' && practiceList.length === 0 && currentSourceList.length > 0) {
      generatePracticeList();
    }
  }, [activeTab, practiceList.length, currentSourceList.length, generatePracticeList]);

  const handleLimitChange = (val: string) => {
    if (val === '') {
      setPracticeLimit('');
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num)) {
      setPracticeLimit(num);
    }
  };

  const handleLimitBlur = () => {
    if (practiceLimit === '') {
      setPracticeLimit(10);
      return;
    }
    const maxVal = currentSourceList.length || 10;
    let clamped = Math.max(1, Math.min(maxVal, practiceLimit));
    setPracticeLimit(clamped);
  };

  const handleShufflePractice = () => {
    generatePracticeList();
    if (practiceTopRef.current) {
      practiceTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWrittenAnswerChange = (idx: number, val: string) => {
    setPracticeAnswers(prev => ({ ...prev, [idx]: val }));
  };

  const submitWrittenPractice = () => {
    setIsGraded(true);
    setTimeout(() => {
      if (practiceResultsRef.current) {
        practiceResultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Grade matching calculation
  const calculateAccuracy = (input: string, correct: string) => {
    const cleanInput = (input || '').trim().toLowerCase();
    if (!cleanInput) return 0;

    // Split synonyms in correct answer by comma, semicolon, slash, "hoặc", "or"
    const synonyms = correct.split(/[,;\/]|hoặc|or/).map(s => s.trim().toLowerCase());
    
    let maxAccuracy = 0;

    for (let syn of synonyms) {
      if (!syn) continue;
      
      // Exact match
      if (cleanInput === syn) {
        return 100;
      }

      // Handle parentheses options like "techou (techō)"
      let mainOption = syn;
      let parenOption = '';
      if (syn.includes('(')) {
        mainOption = syn.split('(')[0].trim();
        const start = syn.indexOf('(');
        const end = syn.indexOf(')');
        if (start !== -1 && end !== -1) {
          parenOption = syn.substring(start + 1, end).trim();
        }
      }

      if (parenOption && (cleanInput === mainOption || cleanInput === parenOption)) {
        return 100;
      }

      // Calculate matching accuracy against the main option
      const targetForMatch = mainOption;
      let matches = 0;
      const minLen = Math.min(cleanInput.length, targetForMatch.length);
      for (let i = 0; i < minLen; i++) {
        if (cleanInput[i] === targetForMatch[i]) {
          matches++;
        }
      }
      const maxLen = Math.max(cleanInput.length, targetForMatch.length);
      const acc = maxLen > 0 ? Math.round((matches / maxLen) * 100) : 0;
      if (acc > maxAccuracy) {
        maxAccuracy = acc;
      }
    }

    return maxAccuracy;
  };

  const renderDiff = (input: string, correct: string) => {
    const cleanInput = (input || '').trim().toLowerCase().replace(/\s+/g, '');
    
    // For correct, match against the closest synonym
    const synonyms = correct.split(/[,;\/]|hoặc|or/).map(s => s.trim().toLowerCase());
    let bestSyn = synonyms[0];
    let maxAcc = 0;
    
    synonyms.forEach(syn => {
      let target = syn;
      if (syn.includes('(')) {
        target = syn.split('(')[0].trim();
      }
      const acc = calculateAccuracy(input, target);
      if (acc > maxAcc) {
        maxAcc = acc;
        bestSyn = target;
      }
    });

    const cleanCorrect = bestSyn.replace(/\s+/g, '');

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

  const getEncouragementText = (pct: number) => {
    if (pct === 100) return 'Xuất sắc! 🎉';
    if (pct >= 80) return 'Tuyệt vời! 🌟';
    if (pct >= 50) return 'Cố lên một chút nữa! 💪';
    return 'Hãy tiếp tục cố gắng nhé! 📚';
  };

  const correctCount = useMemo(() => {
    if (!isGraded) return 0;
    let count = 0;
    practiceList.forEach((item, idx) => {
      const userAnswer = practiceAnswers[idx] || '';
      const isViToJa = practiceDirection === 'vi-to-ja';
      const correctAnswer = isViToJa ? item.hiragana : item.vietnamese_meaning;
      if (calculateAccuracy(userAnswer, correctAnswer) === 100) {
        count++;
      }
    });
    return count;
  }, [isGraded, practiceList, practiceAnswers, practiceDirection]);

  // Speedrun Game implementation
  const speedrunSourceList = useMemo(() => {
    const active = Object.keys(speedrunFilterStatuses).filter(k => speedrunFilterStatuses[k]);
    if (active.length === 0) return vocabListForLevel;
    return vocabListForLevel.filter(item => speedrunFilterStatuses[item.status || 'not_learned']);
  }, [vocabListForLevel, speedrunFilterStatuses]);

  useEffect(() => {
    if (typeof window !== 'undefined' && activeTab === 'practice') {
      const saved = localStorage.getItem(`vocab_speedrun_high_score_all_${level}_${speedrunDirection}`);
      if (saved) {
        setSpeedrunHighScore(parseInt(saved) || 0);
      } else {
        setSpeedrunHighScore(0);
      }
    }
  }, [level, speedrunDirection, activeTab]);

  const stopSpeedrun = () => {
    if (speedrunTimerRef.current) {
      clearInterval(speedrunTimerRef.current);
    }
    setSpeedrunActive(false);
    setSpeedrunGameOver(false);
    setSpeedrunQuestion(null);
    setSpeedrunOptions([]);
    setSpeedrunStreak(0);
  };

  const nextSpeedrunQuestion = useCallback((currentScore: number, customMaxTime?: number) => {
    if (speedrunSourceList.length === 0) {
      showToast('Không có từ vựng nào để chơi Speedrun.');
      return;
    }
    const randomQuestion = speedrunSourceList[Math.floor(Math.random() * speedrunSourceList.length)];
    setSpeedrunQuestion(randomQuestion);
    
    // distractors
    const distractors = speedrunSourceList
      .filter(item => item.vietnamese_meaning !== randomQuestion.vietnamese_meaning)
      .map(item => speedrunDirection === 'vi-to-ja' ? item.hiragana : item.vietnamese_meaning);
    
    const uniqueDistractors = Array.from(new Set(distractors)).sort(() => Math.random() - 0.5).slice(0, 3);
    const correctOption = speedrunDirection === 'vi-to-ja' ? randomQuestion.hiragana : randomQuestion.vietnamese_meaning;
    
    const choices = [correctOption, ...uniqueDistractors];
    while (choices.length < 4) {
      choices.push(`Đáp án nhiễu ${choices.length + 1}`);
    }
    choices.sort(() => Math.random() - 0.5);
    setSpeedrunOptions(choices);
    
    let maxTime = 10;
    if (customMaxTime !== undefined) {
      maxTime = customMaxTime;
    } else {
      const reductionCount = Math.floor(speedrunStreak / 3);
      maxTime = Math.max(2, Math.round(10 * Math.pow(0.9, reductionCount) * 10) / 10);
    }
    
    setSpeedrunMaxTime(maxTime);
    setSpeedrunTimeLeft(maxTime);
    
    if (speedrunDirection === 'listen-to-select' && randomQuestion) {
      playAudioWithFallback(randomQuestion.japanese_example || '', randomQuestion.hiragana);
    }
    
    if (speedrunTimerRef.current) {
      clearInterval(speedrunTimerRef.current);
    }
    
    let remaining = maxTime;
    speedrunTimerRef.current = setInterval(() => {
      remaining = Math.round((remaining - 0.1) * 10) / 10;
      if (remaining <= 0) {
        clearInterval(speedrunTimerRef.current);
        setSpeedrunGameOver(true);
        setSpeedrunActive(false);
        setSpeedrunStreak(0);
        const finalScore = speedrunScoreRef.current;
        const key = `vocab_speedrun_high_score_all_${level}_${speedrunDirection}`;
        const saved = localStorage.getItem(key);
        const currentHigh = saved ? (parseInt(saved) || 0) : 0;
        if (finalScore > currentHigh) {
          localStorage.setItem(key, finalScore.toString());
          setSpeedrunHighScore(finalScore);
          api.post('/api/user/progress', {
            item_type: 'vocabulary',
            item_id: 200000 + (level === 'N5' ? 5 : 4),
            status: 'mastered'
          }).catch(console.error);
        }
      } else {
        setSpeedrunTimeLeft(remaining);
      }
    }, 100);
  }, [speedrunSourceList, speedrunDirection, speedrunStreak, level]);

  const startSpeedrunGame = () => {
    if (speedrunSourceList.length < 4) {
      showToast('Cần ít nhất 4 từ vựng để bắt đầu game Speedrun.');
      return;
    }
    setSpeedrunScore(0);
    speedrunScoreRef.current = 0;
    setSpeedrunStreak(0);
    setSpeedrunActive(true);
    setSpeedrunGameOver(false);
    nextSpeedrunQuestion(0, 10);
  };

  const handleSpeedrunChoice = (choice: string) => {
    if (!speedrunQuestion) return;
    
    const correctVal = speedrunDirection === 'vi-to-ja' ? speedrunQuestion.hiragana : speedrunQuestion.vietnamese_meaning;
    const isCorrect = choice === correctVal;
    
    if (isCorrect) {
      const newScore = speedrunScore + 1;
      setSpeedrunScore(newScore);
      speedrunScoreRef.current = newScore;
      const newStreak = speedrunStreak + 1;
      setSpeedrunStreak(newStreak);
      
      const reductionCount = Math.floor(newStreak / 3);
      const nextMaxTime = Math.max(2, Math.round(10 * Math.pow(0.9, reductionCount) * 10) / 10);
      
      nextSpeedrunQuestion(newScore, nextMaxTime);
    } else {
      if (speedrunTimerRef.current) {
        clearInterval(speedrunTimerRef.current);
      }
      setSpeedrunGameOver(true);
      setSpeedrunActive(false);
      setSpeedrunStreak(0);
      
      const finalScore = speedrunScore;
      const key = `vocab_speedrun_high_score_all_${level}_${speedrunDirection}`;
      const saved = localStorage.getItem(key);
      const currentHigh = saved ? (parseInt(saved) || 0) : 0;
      if (finalScore > currentHigh) {
        localStorage.setItem(key, finalScore.toString());
        setSpeedrunHighScore(finalScore);
        api.post('/api/user/progress', {
          item_type: 'vocabulary',
          item_id: 200000 + (level === 'N5' ? 5 : 4),
          status: 'mastered'
        }).catch(console.error);
      }
    }
  };

  // -------------------------------------------------------------
  // 5. Combined Review (Luyện tập tổng hợp) implementation
  // -------------------------------------------------------------
  const loadReviewData = async () => {
    setReviewLoading(true);
    try {
      const data = await api.get(`/api/user/reviews/combined?level=${level}&_t=${Date.now()}`);
      setReviewData(data);
      if (data && (data.translations?.length || data.dialogues?.length || data.listenings?.length || data.dictations?.length)) {
        showToast('Nạp dữ liệu ngân hàng đề thi thành công!');
      } else {
        showToast('Chưa có đề thi được thiết lập cho cấp độ này.');
      }
    } catch (err) {
      console.error('Error fetching combined review:', err);
      showToast('Có lỗi xảy ra khi tải dữ liệu ôn tập tổng hợp.');
    } finally {
      setReviewLoading(false);
    }
  };

  const startReviewTest = () => {
    if (reviewData) {
      // Gather all items from the 4 lists
      const pool: any[] = [];
      if (reviewSelectedType === 'translation' && Array.isArray(reviewData.translations)) {
        reviewData.translations.forEach((item: any) => {
          pool.push({ type: 'translation', originalData: item, key: `trans_${item.id || Math.random()}` });
        });
      } else if (reviewSelectedType === 'dialogue' && Array.isArray(reviewData.dialogues)) {
        reviewData.dialogues.forEach((item: any) => {
          pool.push({ type: 'dialogue', originalData: item, key: `diag_${item.id || Math.random()}` });
        });
      } else if (reviewSelectedType === 'listening' && Array.isArray(reviewData.listenings)) {
        reviewData.listenings.forEach((item: any) => {
          pool.push({ type: 'listening', originalData: item, key: `list_${item.id || Math.random()}` });
        });
      } else if (reviewSelectedType === 'dictation' && Array.isArray(reviewData.dictations)) {
        reviewData.dictations.forEach((item: any) => {
          pool.push({ type: 'dictation', originalData: item, key: `dict_${item.id || Math.random()}` });
        });
      }

      // Shuffle pool
      const shuffledPool = [...pool].sort(() => Math.random() - 0.5);

      // Select up to 10 questions
      const selected = shuffledPool.slice(0, 10);

      // Calculate total points
      let totalPoints = 0;
      selected.forEach((q) => {
        if (q.type === 'listening') {
          totalPoints += q.originalData.questions?.length || 0;
        } else {
          totalPoints += 1;
        }
      });

      setReviewQuestions(selected);
      setReviewStep('test');
      setReviewIndex(0);
      setReviewAnswers({});
      setReviewGraded({});
      setReviewFeedback({});
      setReviewScore(0);
      setReviewTotal(totalPoints);
    } else {
      loadReviewData();
    }
  };

  const gradeAllQuestions = () => {
    let score = 0;
    const graded: Record<string, boolean> = {};
    const feedback: Record<string, string> = {};

    reviewQuestions.forEach((q) => {
      if (q.type === 'translation') {
        const key = q.key;
        const userAns = (reviewAnswers[key] || '').trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_\`~()?？。、\s]/g, '');
        let isCorrect = false;
        const correctAnswersList = q.originalData.correct_answers || q.originalData.answers || [];
        correctAnswersList.forEach((ans: string) => {
          const cleanAns = ans.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_\`~()?？.、\s]/g, '');
          if (userAns === cleanAns || (cleanAns.includes(userAns) && userAns.length > 3)) {
            isCorrect = true;
          }
        });
        graded[key] = isCorrect;
        if (isCorrect) score += 1;
        feedback[key] = `Đáp án đúng: ${correctAnswersList.join(' / ')}`;
      }
      
      else if (q.type === 'dialogue') {
        const key1 = `${q.key}_b1`;
        const key2 = `${q.key}_b2`;
        const b1Ans = reviewAnswers[key1];
        const b2Ans = reviewAnswers[key2];

        const b1Correct = q.originalData.blanks.blank1.correct === b1Ans;
        const b2Correct = q.originalData.blanks.blank2.correct === b2Ans;

        graded[key1] = b1Correct;
        graded[key2] = b2Correct;

        if (b1Correct && b2Correct) {
          score += 1;
        } else if (b1Correct || b2Correct) {
          score += 0.5;
        }
        feedback[q.key] = `Đáp án đúng: [1] ${q.originalData.blanks.blank1.correct} | [2] ${q.originalData.blanks.blank2.correct}`;
      }
      
      else if (q.type === 'listening') {
        const keyPrefix = q.key;
        q.originalData.questions.forEach((subQ: any, subIdx: number) => {
          const ansKey = `${keyPrefix}_q${subIdx}`;
          const isCorrect = reviewAnswers[ansKey] === (subQ.corr || subQ.correct);
          graded[ansKey] = isCorrect;
          if (isCorrect) score += 1;
        });
        graded[`${keyPrefix}_all`] = true;
      }
      
      else if (q.type === 'dictation') {
        const key = q.key;
        const userAnsRaw = (reviewAnswers[key] || '').trim();
        const cleanUserVn = userAnsRaw.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_\`~()?？。、\s]/g, '');
        let isCorrect = false;
        const correctJp = q.originalData.question_audio;
        const cleanJp = correctJp.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_\`~()?？.、\s]/g, '');
        const cleanUserJp = userAnsRaw.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_\`~()?？.、\s]/g, '');
        if (cleanUserJp === cleanJp) {
          isCorrect = true;
        }

        const vnAnswers = q.originalData.vietnamese_answers || [];
        vnAnswers.forEach((ans: string) => {
          const cleanVnAns = ans.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_\`~()?？。、\s]/g, '');
          if (cleanUserVn === cleanVnAns || calculateAccuracy(userAnsRaw, ans) >= 85) {
            isCorrect = true;
          }
        });

        graded[key] = isCorrect;
        if (isCorrect) score += 1;
        feedback[key] = `Đáp án đúng: ${correctJp} ${q.originalData.vietnamese_meaning ? `| Ý nghĩa: ${q.originalData.vietnamese_meaning}` : ''}`;
      }
    });

    setReviewScore(score);
    setReviewGraded(graded);
    setReviewFeedback(feedback);
    setReviewStep('result');
  };

  // Speech TTS alternating speaker for dialogue Dạng 3
  const playDialogueAudio = async (lines: { speaker: string; text: string }[]) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();
    const jpVoice = voices.find(v => v.lang.startsWith('ja') || v.lang.includes('JP'));

    const speakLine = (index: number) => {
      if (index >= lines.length) return;
      const line = lines[index];
      const cleanLine = line.text.replace(/\[blank\d+\]/g, '_______');
      const utterance = new SpeechSynthesisUtterance(cleanLine);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      if (jpVoice) utterance.voice = jpVoice;

      utterance.onend = () => {
        setTimeout(() => speakLine(index + 1), 800);
      };
      window.speechSynthesis.speak(utterance);
    };

    speakLine(0);
  };

  // Sidebar Menu list (Minna Nihongo static menu)
  const menuItems = [
    { name: 'Cẩm nang học', id: 'guide', icon: '📖', active: false },
    { name: 'Tiến độ học', id: 'dashboard', icon: '📊', active: false },
    { name: 'Ngữ pháp', id: 'roadmap', icon: '🗺️', active: false },
    { name: 'Từ vựng', id: 'vocab', icon: '📚', active: false },
    { name: 'Chữ Hán (Kanji)', id: 'kanji', icon: '🉐', active: false },
    { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️', active: false },
    { name: 'Ôn tập tổng hợp', id: 'review', icon: '📝', active: false }
  ];

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/50 dark:from-[#0b1329] dark:via-[#090d1a] dark:to-[#050811] text-slate-800 dark:text-slate-100 font-sans relative">
      
      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm rounded-xl shadow-xl flex items-center space-x-2 animate-fade-in">
          <span>ℹ️</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Sidebar Hamburger Toggle */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden absolute top-4 left-4 z-40 p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer backdrop-blur-md active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 1. Sidebar Panel */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white dark:bg-[#0c1427]/95 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-5">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">🌸</span>
            <span className="text-sm font-black tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent uppercase">
              Minna Nihongo
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xl p-1 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-0 select-none px-4 py-4">
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
                  router.push(`/lessons/1?tab=${item.id}`);
                }
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-slate-400 dark:text-slate-505 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:shadow-none"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        <SidebarSettings />
      </aside>

      {/* 2. Main content area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-20 lg:p-10 space-y-6">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
              TỔNG HỢP KIẾN THỨC & TỰ GHI NHỚ
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
              Tổng hợp từ vựng, chữ Hán, mẫu câu của 25 bài học N5/N4 và ôn tập liên bài
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto flex-wrap gap-2">
            {/* Level Switcher N5/N4 */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex">
              <button
                onClick={() => handleLevelChange('N5')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  level === 'N5'
                    ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                N5 (Bài 1 - 25)
              </button>
              <button
                onClick={() => handleLevelChange('N4')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  level === 'N4'
                    ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                N4 (Bài 26 - 50)
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        {!speedrunActive && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 p-1 bg-slate-100/65 dark:bg-slate-900/65 rounded-xl max-w-2xl shadow-sm">
            {[
              { id: 'vocab', label: '📚 Từ vựng' },
              { id: 'kanji', label: '🉐 Chữ Hán' },
              { id: 'grammar', label: '📖 Mẫu câu' },
              { id: 'practice', label: '✏️ Luyện từ vựng' },
              { id: 'review', label: '📝 Luyện tổng hợp' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  stopSpeedrun();
                }}
                className={`flex-1 text-center py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-xs font-semibold text-slate-400">Đang tải học liệu...</p>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Tab 1: Từ vựng (vocab) */}
        {/* ------------------------------------------------------------- */}
        {!loading && activeTab === 'vocab' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">Bài học:</label>
                  <select
                    value={filterLesson}
                    onChange={(e) => setFilterLesson(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-500 cursor-pointer min-w-[130px] shadow-sm"
                  >
                    <option value="all">Tất cả các bài</option>
                    {filteredLessons.map(l => (
                      <option key={l.id} value={l.id}>Bài {l.id} - {l.title}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">Trạng thái:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-500 cursor-pointer min-w-[130px] shadow-sm"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="not_learned">Chưa học</option>
                    <option value="learning">Đang học</option>
                    <option value="mastered">Đã thuộc</option>
                  </select>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-400 dark:text-slate-500">
                  <input
                    type="checkbox"
                    checked={showKanjiInVocab}
                    onChange={(e) => setShowKanjiInVocab(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 bg-white text-blue-600 focus:ring-blue-500"
                  />
                  <span>🇯🇵 Học bằng Kanji</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-400 dark:text-slate-500">
                  <input
                    type="checkbox"
                    checked={hideMastered}
                    onChange={(e) => setHideMastered(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 bg-white text-blue-600 focus:ring-blue-500"
                  />
                  <span>Ẩn đã thuộc</span>
                </label>
              </div>

            <input
              type="text"
              placeholder="Tìm từ vựng, Romaji, Hán Việt..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 min-w-[200px]"
            />
          </div>

          <div className="space-y-8">
            {vocabLessonIds.map((lId) => {
              const items = groupedVocab[lId];
              return (
                <div key={lId} className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-sm font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-xl shadow-sm">
                      {getLessonTitle(lId)}
                    </span>
                    <span className="text-xs text-slate-400">({items.length} từ)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((v) => (
                      <div
                        key={v.id}
                        className="p-4 rounded-2xl border bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 shadow-md relative group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded font-bold">
                              Bài {v.lesson_id}
                            </span>
                            <select
                              value={v.status || 'not_learned'}
                              onChange={(e) => handleItemStatusChange(v.id, 'vocabulary', e.target.value as any)}
                              className={`text-[10px] font-bold rounded px-1.5 py-0.5 border cursor-pointer focus:outline-none transition-colors ${
                                v.status === 'mastered'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-600 dark:text-emerald-400'
                                  : v.status === 'learning'
                                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-600 dark:text-amber-400'
                                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              <option value="not_learned">Chưa học</option>
                              <option value="learning">Đang học</option>
                              <option value="mastered">Đã thuộc</option>
                            </select>
                          </div>

                          <div className="space-y-1 pr-14">
                            <div className="flex items-baseline space-x-2 flex-wrap">
                              {showKanjiInVocab && v.kanji_form ? (
                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                  {v.kanji_form} <span className="text-xs font-normal text-slate-400">({v.hiragana})</span>
                                </span>
                              ) : (
                                <span className="text-lg font-bold text-slate-900 dark:text-white">{v.hiragana}</span>
                              )}
                              <span className="text-xs text-slate-400 font-medium">[{v.romaji}]</span>
                              {v.word_type && (
                                <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded font-medium">
                                  {v.word_type}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">{v.vietnamese_meaning}</p>
                            
                            {v.japanese_example && (
                              <div className="mt-2 text-xs border-t border-slate-100 dark:border-slate-800/80 pt-2 space-y-0.5">
                                <p className="text-slate-600 dark:text-slate-400 font-medium">Ví dụ: {v.japanese_example}</p>
                                <p className="text-slate-400 dark:text-slate-500 italic">{v.example_meaning}</p>
                              </div>
                            )}
                            {v.mnemonic_tip && (
                              <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-500 font-medium italic">💡 {v.mnemonic_tip}</p>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => playAudioWithFallback(v.kanji_form || '', v.hiragana)}
                            className="px-2.5 py-1 text-slate-500 hover:text-blue-500 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors flex items-center space-x-1 cursor-pointer text-xs"
                          >
                            <span>🔊 Phát âm</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {vocabLessonIds.length === 0 && (
            <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/10">
              📭 Không tìm thấy từ vựng nào khớp với bộ lọc.
            </div>
          )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Tab 2: Chữ Hán (kanji) */}
        {/* ------------------------------------------------------------- */}
        {!loading && activeTab === 'kanji' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">Bài học:</label>
                  <select
                    value={filterLesson}
                    onChange={(e) => setFilterLesson(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-500 cursor-pointer min-w-[130px] shadow-sm"
                  >
                    <option value="all">Tất cả các bài</option>
                    {filteredLessons.map(l => (
                      <option key={l.id} value={l.id}>Bài {l.id} - {l.title}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">Trạng thái:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-500 cursor-pointer min-w-[130px] shadow-sm"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="not_learned">Chưa học</option>
                    <option value="learning">Đang học</option>
                    <option value="mastered">Đã thuộc</option>
                  </select>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-400 dark:text-slate-500">
                  <input
                    type="checkbox"
                    checked={hideMastered}
                    onChange={(e) => setHideMastered(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 bg-white text-blue-600 focus:ring-blue-500"
                  />
                  <span>Ẩn đã thuộc</span>
                </label>
              </div>

              <input
                type="text"
                placeholder="Tìm chữ Hán, âm đọc, nghĩa Việt..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 min-w-[200px]"
              />
            </div>

            <div className="space-y-8">
              {kanjiLessonIds.map((lId) => {
                const items = groupedKanji[lId];
                return (
                  <div key={lId} className="space-y-4">
                    <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="text-sm font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-xl shadow-sm">
                        {getLessonTitle(lId)}
                      </span>
                      <span className="text-xs text-slate-400">({items.length} chữ Kanji)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {items.map((k) => (
                        <div
                          key={k.id}
                          className="p-4 rounded-2xl border bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 shadow-md relative group flex space-x-3.5"
                        >
                          <div className="w-16 h-16 flex items-center justify-center bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200/75 dark:border-slate-800/80 text-3xl font-black text-slate-900 dark:text-white shadow-inner flex-shrink-0">
                            {k.character}
                          </div>
                          
                          <div className="flex-1 space-y-1 flex flex-col justify-between pr-8">
                            <div>
                              <div className="flex items-baseline space-x-1.5 flex-wrap">
                                <span className="text-base font-bold text-slate-900 dark:text-white">
                                  {k.sino_vietnamese || 'Hán Việt'}
                                </span>
                                {k.stroke_count && (
                                  <span className="text-[10px] text-slate-400 font-semibold">({k.stroke_count} nét)</span>
                                )}
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">Nghĩa: {k.vietnamese_meaning}</p>
                              <div className="text-[10px] text-slate-400 dark:text-slate-400 space-y-0.5 pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                                {k.onyomi && <p>On: <span className="font-semibold text-slate-650 dark:text-slate-350">{k.onyomi}</span></p>}
                                {k.kunyomi && <p>Kun: <span className="font-semibold text-slate-650 dark:text-slate-350">{k.kunyomi}</span></p>}
                              </div>
                            </div>
                          </div>

                          <div className="absolute top-3 right-3 flex flex-col items-end space-y-2">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">Bài {k.lesson_id}</span>
                            <select
                              value={k.status || 'not_learned'}
                              onChange={(e) => handleItemStatusChange(k.id, 'kanji', e.target.value as any)}
                              className={`text-[9px] font-bold rounded px-1.5 py-0.5 border cursor-pointer focus:outline-none transition-colors ${
                                k.status === 'mastered'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-250 text-emerald-600 dark:text-emerald-400'
                                  : k.status === 'learning'
                                    ? 'bg-amber-50 dark:bg-amber-955 border-emerald-255 text-amber-600 dark:text-amber-400'
                                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 text-slate-500 dark:text-slate-455'
                              }`}
                            >
                              <option value="not_learned">Chưa học</option>
                              <option value="learning">Đang học</option>
                              <option value="mastered">Đã thuộc</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {kanjiLessonIds.length === 0 && (
              <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/10">
                📭 Không tìm thấy chữ Hán nào khớp với bộ lọc.
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Tab 3: Mẫu câu (grammar) */}
        {/* ------------------------------------------------------------- */}
        {!loading && activeTab === 'grammar' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">Bài học:</label>
                  <select
                    value={filterLesson}
                    onChange={(e) => setFilterLesson(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-500 cursor-pointer min-w-[130px] shadow-sm"
                  >
                    <option value="all">Tất cả các bài</option>
                    {filteredLessons.map(l => (
                      <option key={l.id} value={l.id}>Bài {l.id} - {l.title}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-400 dark:text-slate-500">
                  <input
                    type="checkbox"
                    checked={hideMastered}
                    onChange={(e) => setHideMastered(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 bg-white text-blue-600 focus:ring-blue-500"
                  />
                  <span>Ẩn đã học</span>
                </label>
              </div>

              <input
                type="text"
                placeholder="Tìm mẫu câu, ý nghĩa..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 min-w-[200px]"
              />
            </div>

            <div className="space-y-8">
              {grammarLessonIds.map((lId) => {
                const items = groupedGrammar[lId];
                return (
                  <div key={lId} className="space-y-4">
                    <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="text-sm font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-xl shadow-sm">
                        {getLessonTitle(lId)}
                      </span>
                      <span className="text-xs text-slate-400">({items.length} mẫu câu)</span>
                    </div>

                    <div className="space-y-4">
                      {items.map((g) => (
                        <div
                          key={g.id}
                          className="p-5 rounded-2xl border bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 shadow-md relative space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded font-bold">
                                Bài {g.lesson_id}
                              </span>
                              <h3 className="text-base sm:text-lg font-bold text-indigo-650 dark:text-indigo-400 mt-1.5">
                                {g.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic">
                                Ý nghĩa: {g.meaning}
                              </p>
                            </div>
                            <select
                              value={g.status || 'not_learned'}
                              onChange={(e) => handleItemStatusChange(g.id, 'grammar', e.target.value as any)}
                              className={`text-[9px] font-bold rounded px-1.5 py-0.5 border cursor-pointer focus:outline-none transition-colors ${
                                g.status === 'mastered'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-250 text-emerald-600 dark:text-emerald-400'
                                  : g.status === 'learning'
                                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-250 text-amber-600 dark:text-amber-400'
                                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 text-slate-500 dark:text-slate-455'
                              }`}
                            >
                              <option value="not_learned">Chưa học</option>
                              <option value="learning">Đang học</option>
                              <option value="mastered">Đã thuộc</option>
                            </select>
                          </div>

                          {g.structure && (
                            <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border-l-4 border-indigo-500 dark:border-indigo-650 rounded-r-xl">
                              <p className="text-xs font-mono text-slate-650 dark:text-slate-350">
                                Cấu trúc: <span className="font-bold">{g.structure}</span>
                              </p>
                            </div>
                          )}

                          {g.vietnamese_explanation && (
                            <p className="text-xs text-slate-605 dark:text-slate-400 leading-relaxed pl-1 border-l-2 border-slate-200 dark:border-slate-800">
                              {g.vietnamese_explanation}
                            </p>
                          )}

                          {g.japanese_example && (
                            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center gap-4">
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{g.japanese_example}</p>
                                {g.romaji_example && <p className="text-xs text-slate-400 dark:text-slate-505 italic">{g.romaji_example}</p>}
                                {g.example_meaning && <p className="text-xs text-slate-600 dark:text-slate-400">{g.example_meaning}</p>}
                              </div>
                              <button
                                onClick={() => speakTTS(g.japanese_example || '')}
                                className="px-2.5 py-1 text-slate-500 hover:text-blue-500 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors flex items-center space-x-1 cursor-pointer text-xs flex-shrink-0"
                              >
                                🔊 Nghe ví dụ
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {grammarLessonIds.length === 0 && (
              <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/10">
                📭 Không tìm thấy mẫu câu nào khớp với bộ lọc.
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Tab 4: Luyện từ vựng (practice) */}
        {/* ------------------------------------------------------------- */}
        {!loading && activeTab === 'practice' && (
          <div className="space-y-6 max-w-6xl mx-auto animate-fade-in" ref={practiceTopRef}>
            {!speedrunActive && (
              <div className="relative z-20 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl backdrop-blur-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h2 className="text-md font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-2">
                    <span>✏️</span>
                    <span>Bảng Luyện Tập & Đảo Đề Tương Tác</span>
                  </h2>
                  <p className="text-xs text-slate-405 dark:text-slate-500">
                    Kiểm tra kiến thức từ vựng bằng cách nhập câu trả lời
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex">
                      <button
                        onClick={() => setPracticeType('write')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                          practiceType === 'write'
                            ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        ✍️ Tự luận
                      </button>
                      <button
                        onClick={() => {
                          setPracticeType('speedrun');
                          stopSpeedrun();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                          practiceType === 'speedrun'
                            ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        ⚡ Phản xạ nhanh
                      </button>
                    </div>

                    {practiceType === 'write' && (
                      <>
                        <div className="bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex">
                          <button
                            onClick={() => setPracticeDirection('vi-to-ja')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                              practiceDirection === 'vi-to-ja'
                                ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg'
                                : 'text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                          >
                            🇻🇳 ➔ 🇯🇵
                          </button>
                          <button
                            onClick={() => setPracticeDirection('ja-to-vi')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                              practiceDirection === 'ja-to-vi'
                                ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg'
                                : 'text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                          >
                            🇯🇵 ➔ 🇻🇳
                          </button>
                        </div>

                        <div id="practice-dropdown-container" className="relative z-30">
                          <button
                            onClick={() => setPracticeDropdownOpen(!practiceDropdownOpen)}
                            className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                          >
                            <span>🔍 Lọc:</span>
                            <span className="text-blue-600 dark:text-blue-400">
                              {Object.values(practiceFilterStatuses).filter(Boolean).length === 0
                                ? 'Học hết'
                                : Object.keys(practiceFilterStatuses)
                                    .filter((k) => practiceFilterStatuses[k])
                                    .map((k) => k === 'not_learned' ? 'Chưa học' : k === 'learning' ? 'Đang học' : 'Đã thuộc')
                                    .join(', ')}
                            </span>
                            <span className="text-[10px]">▼</span>
                          </button>

                          {practiceDropdownOpen && (
                            <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-xl z-50 p-2 space-y-1">
                              {['not_learned', 'learning', 'mastered'].map((status) => (
                                <label key={status} className="flex items-center space-x-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg cursor-pointer text-xs text-slate-600 dark:text-slate-300 transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={practiceFilterStatuses[status]}
                                    onChange={(e) =>
                                      setPracticeFilterStatuses((prev) => ({
                                        ...prev,
                                        [status]: e.target.checked,
                                      }))
                                    }
                                    className="w-4 h-4 rounded border-slate-250 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span>{status === 'not_learned' ? 'Chưa học' : status === 'learning' ? 'Đang học' : 'Đã thuộc'}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl">
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">Số câu:</span>
                          <input
                            type="number"
                            value={practiceLimit}
                            onChange={(e) => handleLimitChange(e.target.value)}
                            onBlur={handleLimitBlur}
                            className="w-12 bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-lg text-center text-xs font-extrabold text-slate-900 dark:text-white py-1 focus:outline-none focus:border-blue-500"
                          />
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                            / {currentSourceList.length}
                          </span>
                        </div>

                        {practiceDirection === 'vi-to-ja' && (
                          <label className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-450 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                            <input
                              type="checkbox"
                              checked={useRomaji}
                              onChange={(e) => setUseRomaji(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-250 text-blue-600 cursor-pointer"
                            />
                            <span>Trả lời bằng Romaji</span>
                          </label>
                        )}

                        {practiceDirection === 'ja-to-vi' && (
                          <div className="bg-slate-50 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex">
                            <button
                              onClick={() => setPracticeScriptMode('hiragana')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                                practiceScriptMode === 'hiragana'
                                  ? 'bg-indigo-600 text-slate-900 dark:text-white shadow-lg'
                                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                              }`}
                            >
                              📖 Hira/Kata
                            </button>
                            <button
                              onClick={() => setPracticeScriptMode('kanji')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                                practiceScriptMode === 'kanji'
                                  ? 'bg-indigo-600 text-slate-900 dark:text-white shadow-lg'
                                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                              }`}
                            >
                              🉐 Kanji
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {practiceType === 'write' && (
                    <button
                      onClick={handleShufflePractice}
                      className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-350 transition-all text-xs font-bold flex items-center space-x-2 shadow-md cursor-pointer active:scale-95"
                    >
                      <span>🔀</span>
                      <span>Tráo đề</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Written practice mode content display */}
            {practiceType === 'write' && (
              <div className="space-y-6">
                {practiceList.length === 0 ? (
                  <div className="text-center py-20 text-slate-450 dark:text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-100/20 dark:bg-slate-900/20">
                    📭 Đang tải học liệu hoặc không tìm thấy dữ liệu ôn tập.
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/35 shadow-md">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                            <th className="py-4 px-4 text-center w-12">STT</th>
                            <th className="py-4 px-4 text-center w-12">Nghe</th>
                            <th className="py-4 px-4 text-center">Câu hỏi</th>
                            <th className="py-4 px-4 text-center w-28">Từ loại</th>
                            <th className="py-4 px-4 text-center w-64">Câu trả lời của bạn</th>
                            <th className="py-4 px-4 text-center w-28">Kết quả</th>
                            <th className="py-4 px-4 text-center w-24">% Đúng</th>
                            <th className="py-4 px-4 text-center w-64">Đáp án đúng</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                          {practiceList.map((item, idx) => {
                            const isViToJa = practiceDirection === 'vi-to-ja';
                            const questionText = isViToJa ? item.vietnamese_meaning : (practiceScriptMode === 'kanji' ? (item.kanji_form || item.hiragana) : item.hiragana);
                            const correctAnswer = isViToJa ? item.hiragana : item.vietnamese_meaning;
                            const userAnswer = practiceAnswers[idx] || '';
                            const pct = calculateAccuracy(userAnswer, correctAnswer);

                            return (
                              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                                <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                                <td className="p-4 text-center">
                                  <button
                                    onClick={() => playAudioWithFallback(item.kanji_form || '', item.hiragana)}
                                    className="p-2 text-slate-400 hover:text-blue-505 rounded bg-slate-50 dark:bg-slate-800 cursor-pointer"
                                  >
                                    🔊
                                  </button>
                                </td>
                                <td className="p-4 font-bold text-slate-850 dark:text-white text-center select-all">{questionText}</td>
                                <td className="p-4 text-center">
                                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded text-[11px] font-medium">
                                    {item.word_type || 'N/A'}
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  <input
                                    type="text"
                                    disabled={isGraded}
                                    value={userAnswer}
                                    onChange={(e) => handleWrittenAnswerChange(idx, e.target.value)}
                                    placeholder={isViToJa ? (useRomaji ? "Gõ bằng Romaji..." : "Gõ bằng tiếng Nhật...") : "Gõ nghĩa Việt..."}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 disabled:opacity-75"
                                  />
                                </td>
                                <td className="p-4 text-center font-bold">
                                  {isGraded ? (
                                    pct === 100 ? (
                                      <span className="text-emerald-500 dark:text-emerald-400">✅ Đúng</span>
                                    ) : (
                                      <span className="text-rose-500 dark:text-rose-400">❌ Sai</span>
                                    )
                                  ) : (
                                    <span className="text-slate-350">-</span>
                                  )}
                                </td>
                                <td className="p-4 text-center font-bold">
                                  {isGraded ? (
                                    <span className={pct >= 80 ? 'text-emerald-500' : pct >= 50 ? 'text-amber-500' : 'text-rose-500'}>
                                      {pct}%
                                    </span>
                                  ) : (
                                    <span className="text-slate-350">-</span>
                                  )}
                                </td>
                                <td className="p-4 text-left">
                                  {isGraded ? (
                                    <div className="space-y-1 text-xs">
                                      <p className="font-bold text-slate-700 dark:text-slate-200 select-all">{correctAnswer}</p>
                                      {isViToJa && item.kanji_form && (
                                        <p className="text-slate-500 dark:text-slate-400">Kanji: {item.kanji_form}</p>
                                      )}
                                      {userAnswer.trim() && pct < 100 && (
                                        <div className="bg-slate-50 dark:bg-slate-900 p-1 px-2 border border-slate-200 dark:border-slate-800 rounded mt-1 select-none">
                                          <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">Chi tiết lỗi:</span>
                                          {renderDiff(userAnswer, correctAnswer)}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setVisibleAnswers(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                      className="text-xs text-blue-500 hover:underline cursor-pointer"
                                    >
                                      {visibleAnswers[idx] ? `Ẩn [ ${correctAnswer} ]` : 'Xem đáp án'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View Cards */}
                    <div className="lg:hidden space-y-4">
                      {practiceList.map((item, idx) => {
                        const isViToJa = practiceDirection === 'vi-to-ja';
                        const questionText = isViToJa ? item.vietnamese_meaning : (practiceScriptMode === 'kanji' ? (item.kanji_form || item.hiragana) : item.hiragana);
                        const correctAnswer = isViToJa ? item.hiragana : item.vietnamese_meaning;
                        const userAnswer = practiceAnswers[idx] || '';
                        const pct = calculateAccuracy(userAnswer, correctAnswer);

                        return (
                          <div
                            key={idx}
                            className="bg-white dark:bg-slate-900/40 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md space-y-3"
                          >
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
                              <span className="text-xs font-bold text-slate-400 font-mono">Câu hỏi {idx + 1}</span>
                              <button
                                onClick={() => playAudioWithFallback(item.kanji_form || '', item.hiragana)}
                                className="p-1.5 text-xs text-slate-500 hover:text-blue-500 rounded bg-slate-50 dark:bg-slate-950"
                              >
                                🔊 Nghe phát âm
                              </button>
                            </div>
                            <div className="text-center py-2">
                              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Câu hỏi</p>
                              <h3 className="text-lg font-black text-slate-900 dark:text-white break-all select-all">{questionText}</h3>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-450 font-bold block uppercase">Câu trả lời:</label>
                              <input
                                type="text"
                                disabled={isGraded}
                                value={userAnswer}
                                onChange={(e) => handleWrittenAnswerChange(idx, e.target.value)}
                                placeholder={isViToJa ? (useRomaji ? "Gõ bằng Romaji..." : "Gõ bằng tiếng Nhật...") : "Gõ nghĩa Việt..."}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                              />
                            </div>

                            {isGraded ? (
                              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                                <div className="flex justify-between items-center text-xs font-bold">
                                  <span>Kết quả:</span>
                                  <span className={pct === 100 ? 'text-emerald-500' : 'text-rose-500'}>
                                    {pct === 100 ? '✅ Đúng (100%)' : `❌ Chưa đúng (${pct}%)`}
                                  </span>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1 text-xs">
                                  <p className="font-bold text-slate-700 dark:text-slate-350 select-all">Đáp án: {correctAnswer}</p>
                                  {isViToJa && item.kanji_form && <p className="text-[10px] text-slate-400">Kanji: {item.kanji_form}</p>}
                                  {userAnswer.trim() && pct < 100 && (
                                    <div className="border-t border-slate-200 dark:border-slate-800 pt-1.5 mt-1.5">
                                      <span className="text-[9px] text-slate-450 block font-bold mb-0.5">Chi tiết lỗi:</span>
                                      {renderDiff(userAnswer, correctAnswer)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-right">
                                <button
                                  onClick={() => setVisibleAnswers(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                  className="text-xs text-blue-500 hover:underline cursor-pointer"
                                >
                                  {visibleAnswers[idx] ? `Ẩn [ ${correctAnswer} ]` : 'Xem đáp án'}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Submit and encouragement footer cards */}
                    {!isGraded ? (
                      <button
                        onClick={submitWrittenPractice}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-extrabold text-sm rounded-2xl shadow-xl hover:shadow-blue-500/10 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        📊 Nộp Bài & Chấm Điểm
                      </button>
                    ) : (
                      <div ref={practiceResultsRef} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-850 pb-4">
                          <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">BẢNG KẾT QUẢ ÔN TẬP</h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {getEncouragementText(Math.round((correctCount / practiceList.length) * 100))}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                              {correctCount} / {practiceList.length}
                            </span>
                            <span className="text-slate-400 text-xs block font-semibold mt-0.5">Số câu chính xác</span>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={handleShufflePractice}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-center"
                          >
                            🔄 Làm đề mới
                          </button>
                          <button
                            onClick={() => {
                              setIsGraded(false);
                              setPracticeAnswers({});
                              setVisibleAnswers({});
                              if (practiceTopRef.current) {
                                practiceTopRef.current.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350 font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-95 cursor-pointer text-center animate-fade-in"
                          >
                            📝 Làm lại đề này
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Speedrun Mode active or setup states */}
            {practiceType === 'speedrun' && (
              <div className="space-y-6">
                {!speedrunActive && !speedrunGameOver && (
                  <div className="max-w-xl mx-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-6 shadow-xl animate-scale-up relative">
                    <div className="w-16 h-16 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
                      ⚡
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Trắc nghiệm phản xạ từ vựng</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed max-w-sm mx-auto">
                        Mỗi câu có tối đa 10 giây để trả lời. Trả lời đúng liên tục sẽ tăng streak và rút ngắn thời gian. Game kết thúc khi hết giờ hoặc chọn sai.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left border-y border-slate-100 dark:border-slate-850 py-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block uppercase">Chiều ôn tập:</label>
                        <select
                          value={speedrunDirection}
                          onChange={(e) => setSpeedrunDirection(e.target.value as any)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
                        >
                          <option value="ja-to-vi">🇯🇵 Nhật ➔ 🇻🇳 Việt</option>
                          <option value="vi-to-ja">🇻🇳 Việt ➔ 🇯🇵 Nhật</option>
                          <option value="listen-to-select">🎧 Nghe ➔ 🇻🇳 Việt</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block uppercase">Lọc trạng thái:</label>
                        <div id="speedrun-dropdown-container" className="relative">
                          <button
                            onClick={() => setSpeedrunDropdownOpen(!speedrunDropdownOpen)}
                            className="w-full text-left bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between cursor-pointer"
                          >
                            <span className="truncate">
                              {Object.values(speedrunFilterStatuses).filter(Boolean).length === 0
                                ? 'Học hết'
                                : Object.keys(speedrunFilterStatuses)
                                    .filter((k) => speedrunFilterStatuses[k])
                                    .map((k) => k === 'not_learned' ? 'Chưa học' : k === 'learning' ? 'Đang học' : 'Đã thuộc')
                                    .join(', ')}
                            </span>
                            <span className="text-[10px]">▼</span>
                          </button>
                          {speedrunDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-xl z-50 p-2 space-y-1">
                              {['not_learned', 'learning', 'mastered'].map((status) => (
                                <label key={status} className="flex items-center space-x-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-xs text-slate-600 dark:text-slate-300 transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={speedrunFilterStatuses[status]}
                                    onChange={(e) =>
                                      setSpeedrunFilterStatuses((prev) => ({
                                        ...prev,
                                        [status]: e.target.checked,
                                      }))
                                    }
                                    className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span>{status === 'not_learned' ? 'Chưa học' : status === 'learning' ? 'Đang học' : 'Đã thuộc'}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                      <span>Kỷ lục cao nhất:</span>
                      <span className="text-blue-600 dark:text-blue-400 font-extrabold text-sm">{speedrunHighScore} điểm</span>
                    </div>

                    <button
                      onClick={startSpeedrunGame}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 text-slate-900 dark:text-white font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      🚀 Bắt Đầu Chơi
                    </button>
                  </div>
                )}

                {/* Speedrun active gameplay screen */}
                {speedrunActive && speedrunQuestion && (
                  <div className="max-w-xl mx-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xl animate-scale-up">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
                      <div>
                        <span className="text-xs text-slate-400 font-bold block uppercase">Điểm số</span>
                        <span className="text-lg font-black text-blue-600 dark:text-blue-400">{speedrunScore}</span>
                      </div>
                      {speedrunStreak > 0 && (
                        <div className="text-right flex items-center space-x-1">
                          <span className="text-xs text-orange-500 font-black animate-pulse">🔥 Streak: {speedrunStreak}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-100 ${
                            speedrunTimeLeft <= 3 ? 'bg-red-500 animate-pulse' : speedrunTimeLeft <= 5 ? 'bg-yellow-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${(speedrunTimeLeft / speedrunMaxTime) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                        <span>Thời gian còn lại:</span>
                        <span>{speedrunTimeLeft.toFixed(1)} giây</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-2xl border border-slate-100 dark:border-slate-850 text-center space-y-4 shadow-inner">
                      {speedrunDirection === 'listen-to-select' ? (
                        <div className="space-y-3">
                          <button
                            onClick={() => playAudioWithFallback(speedrunQuestion.japanese_example || '', speedrunQuestion.hiragana)}
                            className="w-16 h-16 bg-blue-500/10 text-blue-550 dark:text-blue-450 rounded-full flex items-center justify-center mx-auto text-3xl shadow cursor-pointer border border-blue-500/20 active:scale-95"
                          >
                            🔊
                          </button>
                          <p className="text-xs text-slate-450 font-bold">Nghe âm thanh phát ra và chọn nghĩa Việt tương ứng</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">
                            {speedrunDirection === 'ja-to-vi' ? 'Chọn nghĩa dịch tiếng Việt đúng:' : 'Chọn từ tiếng Nhật tương ứng:'}
                          </p>
                          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white break-all select-all">
                            {speedrunDirection === 'ja-to-vi' ? speedrunQuestion.hiragana : speedrunQuestion.vietnamese_meaning}
                          </h2>
                          {speedrunDirection === 'ja-to-vi' && speedrunQuestion.kanji_form && (
                            <p className="text-sm font-semibold text-slate-400">({speedrunQuestion.kanji_form})</p>
                          )}
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {speedrunOptions.map((choice, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleSpeedrunChoice(choice)}
                          className="px-4 py-3.5 text-left rounded-xl text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-slate-900 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-300 cursor-pointer active:scale-95 transition-all shadow-sm break-all"
                        >
                          <span className="inline-block w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-center leading-5 text-slate-500 mr-2 flex-shrink-0">
                            {['A', 'B', 'C', 'D'][oIdx]}
                          </span>
                          {choice}
                        </button>
                      ))}
                    </div>

                    <div className="text-center pt-2">
                      <button
                        onClick={stopSpeedrun}
                        className="text-xs text-red-500 hover:underline font-bold cursor-pointer"
                      >
                        🛑 Dừng chơi & Thoát
                      </button>
                    </div>
                  </div>
                )}

                {/* Speedrun Game Over display screen */}
                {speedrunGameOver && (
                  <div className="max-w-xl mx-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-6 shadow-xl animate-scale-up">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                      💀
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">HẾT LƯỢT CHƠI</h3>
                      <p className="text-xs text-slate-400">Bạn đã chọn sai hoặc hết thời gian phản xạ suy nghĩ.</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 flex justify-around items-center">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Điểm số đạt</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{speedrunScore}</span>
                      </div>
                      <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Kỷ lục hiện tại</span>
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{speedrunHighScore}</span>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={startSpeedrunGame}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        🔄 Chơi lại lượt mới
                      </button>
                      <button
                        onClick={() => {
                          setSpeedrunGameOver(false);
                          setSpeedrunActive(false);
                        }}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-95 cursor-pointer"
                      >
                        🚪 Trở về màn hình chuẩn bị
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Tab 5: Luyện tập tổng hợp (review) */}
        {/* ------------------------------------------------------------- */}
        {!loading && activeTab === 'review' && (
          <ReviewTab
            lessonTitle="Tất cả các bài"
            reviewData={reviewData}
            reviewLoading={reviewLoading}
            reviewStep={reviewStep}
            setReviewStep={setReviewStep}
            reviewQuestions={reviewQuestions}
            setReviewQuestions={setReviewQuestions}
            reviewAnswers={reviewAnswers}
            setReviewAnswers={setReviewAnswers}
            reviewGraded={reviewGraded}
            setReviewGraded={setReviewGraded}
            reviewFeedback={reviewFeedback}
            setReviewFeedback={setReviewFeedback}
            reviewScore={reviewScore}
            setReviewScore={setReviewScore}
            reviewTotal={reviewTotal}
            setReviewTotal={setReviewTotal}
            reviewShowKanji={reviewShowKanji}
            setReviewShowKanji={setReviewShowKanji}
            loadReviewData={loadReviewData}
            playAudio={playAudio}
            playDialogueAudio={playDialogueAudio}
            renderDiff={renderDiff}
            selectedLessonId="all"
            calculateAccuracy={calculateAccuracy}
          />
        )}
      </main>
    </div>
  );
}
