'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { api } from '../utils/api';
import SidebarSettings from '../components/SidebarSettings';
import { playAudioWithFallback, speakTTS, playSpeedrunSound } from '../utils/audioHelper';
import { getRadicalsString, getRadicalsForCharacter } from '../utils/kanjiRadicals';
import { gradeKanjiWithAI, KanjiGradingResult } from '../utils/kanjiPracticeHelper';
import { getGlobalKanjiForm, getRelatedVocabForKanji } from '../utils/kanjiFormLookup';

const KanjiStrokePlayer = dynamic(() => import('../components/KanjiStrokePlayer'), { ssr: false });
const QuickLookupModal = dynamic(() => import('../components/QuickLookupModal'), { ssr: false });
const CombinedKanjiPractice = dynamic(() => import('../components/CombinedKanjiPractice'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});
const GlobalJlptExamTab = dynamic(() => import('./components/GlobalJlptExamTab'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

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
  kanji_word?: string;
  vietnamese_meaning: string;
  word_type: string;
  japanese_example?: string;
  example_meaning?: string;
  mnemonic_tip?: string;
  status?: 'not_learned' | 'learning' | 'mastered' | 'wrong';
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
  status?: 'not_learned' | 'learning' | 'mastered' | 'wrong';
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

  // Kanji Detail & Drawing Modal State
  const [selectedKanjiModal, setSelectedKanjiModal] = useState<KanjiItem | null>(null);
  const [kanjiModalTab, setKanjiModalTab] = useState<'info' | 'draw'>('info');
  const [showModalGhostGuide, setShowModalGhostGuide] = useState<boolean>(true);
  const [isModalDrawing, setIsModalDrawing] = useState<boolean>(false);
  const [hasModalDrawn, setHasModalDrawn] = useState<boolean>(false);
  const [modalDrawResult, setModalDrawResult] = useState<KanjiGradingResult | null>(null);
  const [isModalGradingWithAI, setIsModalGradingWithAI] = useState<boolean>(false);
  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalStrokesRef = useRef<Array<Array<{ x: number; y: number }>>>([]);
  const currentModalStrokeRef = useRef<Array<{ x: number; y: number }>>([]);

  // Kanji AI Explanation & Stroke Player States
  const [isExplainingKanji, setIsExplainingKanji] = useState<boolean>(false);
  const [kanjiAiExplanation, setKanjiAiExplanation] = useState<any>(null);
  const [kanjiAiError, setKanjiAiError] = useState<string | null>(null);
  const [kanjiDrawSubMode, setKanjiDrawSubMode] = useState<'anim' | 'canvas'>('anim');

  const playAudio = (text: string, kana?: string) => {
    playAudioWithFallback(text, kana || text);
  };

  const renderFormattedGrammarText = (text?: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <div className="space-y-1">
        {lines.map((line, idx) => {
          let content: React.ReactNode = line;
          if (line.includes('Khẳng định quá khứ:')) {
            const parts = line.split('Khẳng định quá khứ:');
            content = <><span className="text-emerald-500 font-extrabold">Khẳng định quá khứ:</span>{parts[1]}</>;
          } else if (line.includes('Phủ định quá khứ:')) {
            const parts = line.split('Phủ định quá khứ:');
            content = <><span className="text-rose-500 font-extrabold">Phủ định quá khứ:</span>{parts[1]}</>;
          } else if (line.includes('Nghi vấn quá khứ:')) {
            const parts = line.split('Nghi vấn quá khứ:');
            content = <><span className="text-amber-500 font-extrabold">Nghi vấn quá khứ:</span>{parts[1]}</>;
          } else if (line.includes('Khẳng định:')) {
            const parts = line.split('Khẳng định:');
            content = <><span className="text-emerald-500 font-extrabold">Khẳng định:</span>{parts[1]}</>;
          } else if (line.includes('Phủ định:')) {
            const parts = line.split('Phủ định:');
            content = <><span className="text-rose-500 font-extrabold">Phủ định:</span>{parts[1]}</>;
          } else if (line.includes('Nghi vấn:')) {
            const parts = line.split('Nghi vấn:');
            content = <><span className="text-amber-500 font-extrabold">Nghi vấn:</span>{parts[1]}</>;
          }
          return <div key={idx} className="leading-snug">{content}</div>;
        })}
      </div>
    );
  };

  

  


  // Core navigation/UI states
  const [level, setLevel] = useState<'N5' | 'N4'>('N5');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'practice' | 'kanji_practice' | 'jlpt_exam'>('practice');
  const [isQuickLookupOpen, setIsQuickLookupOpen] = useState<boolean>(false);
  const [quickLookupTab, setQuickLookupTab] = useState<'vocab' | 'kanji' | 'grammar' | 'kana'>('vocab');
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
  // 6. Phân hệ "Bài Kiểm Tra" (Exam System) States
  // -------------------------------------------------------------
  const [practiceLimit, setPracticeLimit] = useState<number | ''>(10);
  const [practiceType, setPracticeType] = useState<'write' | 'speedrun'>('speedrun');
  const [useRomaji, setUseRomaji] = useState<boolean>(false);
  const [practiceList, setPracticeList] = useState<VocabItem[]>([]);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [isGraded, setIsGraded] = useState<boolean>(false);
  const [visibleAnswers, setVisibleAnswers] = useState<Record<string, boolean>>({});
  const [practiceDirection, setPracticeDirection] = useState<'vi-to-ja' | 'ja-to-vi'>('vi-to-ja');
  const [practiceScriptMode, setPracticeScriptMode] = useState<'hiragana' | 'kanji'>('hiragana');
  const [practiceDropdownOpen, setPracticeDropdownOpen] = useState<boolean>(false);
  const [practiceOnlyWrong, setPracticeOnlyWrong] = useState<boolean>(false);
  const [practiceFilterStatuses, setPracticeFilterStatuses] = useState<Record<string, boolean>>({
    not_learned: false,
    learning: false,
    mastered: false,
  });
  const [practiceScopeFilter, setPracticeScopeFilter] = useState<'level' | 'all_50' | string>('level');
  const [showVocabLessonMatrix, setShowVocabLessonMatrix] = useState<boolean>(false);

  // Speedrun states
  const [speedrunTarget, setSpeedrunTarget] = useState<'vocab' | 'kanji'>('vocab');
  const [kanjiSpeedrunDirection, setKanjiSpeedrunDirection] = useState<'kanji-to-meaning' | 'meaning-to-kanji' | 'kanji-to-yomi'>('kanji-to-meaning');
  const [speedrunActive, setSpeedrunActive] = useState<boolean>(false);
  const [speedrunGameOver, setSpeedrunGameOver] = useState<boolean>(false);
  const [speedrunScore, setSpeedrunScore] = useState<number>(0);
  const [speedrunHighScore, setSpeedrunHighScore] = useState<number>(0);
  const [speedrunQuestion, setSpeedrunQuestion] = useState<VocabItem | null>(null);
  const [speedrunKanjiQuestion, setSpeedrunKanjiQuestion] = useState<KanjiItem | null>(null);
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

  // Speedrun interactive feedback states
  const [speedrunSelectedChoice, setSpeedrunSelectedChoice] = useState<string | null>(null);
  const [speedrunChoiceStatus, setSpeedrunChoiceStatus] = useState<'correct' | 'wrong' | null>(null);
  const [isEvaluatingChoice, setIsEvaluatingChoice] = useState<boolean>(false);

  const speedrunTimerRef = useRef<any>(null);
  const speedrunScoreRef = useRef<number>(0);

  const practiceResultsRef = useRef<HTMLDivElement | null>(null);
  const practiceTopRef = useRef<HTMLDivElement | null>(null);



  // Toast notifier helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Force Minna course configuration on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeCourse', 'minna');
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab');
      if (urlTab === 'jlpt_exam' || urlTab === 'jlpt' || urlTab === 'exam' || urlTab === 'review') {
        setActiveTab('jlpt_exam');
      } else if (urlTab === 'kanji_practice') {
        setActiveTab('kanji_practice');
      }
    }
  }, []);

  const applyCourseSummaryPayload = useCallback((res: any) => {
    if (!res) return;
    const rawKanji = res.kanji || [];
    const rawVocab = res.vocabulary || [];
    const enrichedVocab = rawVocab.map((v: any) => {
      const kForm = v.kanji_word || getGlobalKanjiForm(v.hiragana, rawKanji, v.kanji_word);
      return {
        ...v,
        kanji_form: kForm && kForm !== v.hiragana ? kForm : undefined
      };
    });
    setLessons(res.lessons || []);
    setKanjiList(rawKanji);
    setVocabList(enrichedVocab);
    setGrammarList(res.grammar || []);
  }, []);

  // Fetch course summary (Lessons, Vocab, Kanji, Grammar) for minna with 0ms Stale-While-Revalidate
  const loadData = useCallback(async () => {
    const summaryPath = `/api/user/course-summary?course=minna`;
    const cached = api.peekCache(summaryPath);
    if (cached) {
      applyCourseSummaryPayload(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    try {
      const res = await api.get(summaryPath);
      applyCourseSummaryPayload(res);
    } catch (err) {
      console.error('Error loading course summary:', err);
      if (!cached) {
        showToast('Có lỗi xảy ra khi tải dữ liệu học tập.');
      }
    } finally {
      setLoading(false);
    }
  }, [applyCourseSummaryPayload]);

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
    if (showKanjiInVocab) {
      list = list.filter(v => {
        const kForm = v.kanji_word || v.kanji_form || getGlobalKanjiForm(v.hiragana, kanjiList, v.kanji_word);
        return Boolean(kForm && kForm.trim() !== '' && kForm !== v.hiragana);
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(v => {
        const kForm = v.kanji_word || v.kanji_form || getGlobalKanjiForm(v.hiragana, kanjiList, v.kanji_word);
        return (
          v.hiragana.toLowerCase().includes(q) || 
          v.romaji.toLowerCase().includes(q) || 
          v.vietnamese_meaning.toLowerCase().includes(q) ||
          (kForm && kForm.toLowerCase().includes(q))
        );
      });
    }
    return list.sort((a, b) => {
      if (a.lesson_id !== b.lesson_id) return a.lesson_id - b.lesson_id;
      return a.id - b.id;
    });
  }, [vocabList, startLessonId, endLessonId, filterLesson, filterStatus, hideMastered, searchQuery, showKanjiInVocab, kanjiList]);

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
    setPracticeScopeFilter('level');
    setLocalSearchQuery('');
    stopSpeedrun();
    setPracticeList([]);
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

  // ==================== KANJI MODAL DRAWING HANDLERS ====================
  // Replay user's modal strokes on canvas
  const renderModalStrokes = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2dd4bf'; // Teal-400
    ctx.setLineDash([]);
    for (const stroke of modalStrokesRef.current) {
      if (stroke.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    }
  }, []);

  // Draw Tian Zi Ge (田字格) grid & Ghost guide on modal canvas
  const drawModalGridAndGuide = useCallback((targetChar?: string, ghostVisible = true, preserveStrokes = false) => {
    const canvas = modalCanvasRef.current;
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

    // Ghost template guide: Pure Kanji Character (no kunyomi)
    if (ghostVisible && targetChar) {
      ctx.fillStyle = 'rgba(20, 184, 166, 0.25)';
      ctx.font = '900 150px "Noto Sans JP", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(targetChar, w / 2, h / 2 + 5);
    }

    if (preserveStrokes) {
      renderModalStrokes(ctx);
    }
  }, [renderModalStrokes]);

  // Synchronize modal canvas whenever modal opens or tab/char changes
  useEffect(() => {
    if (selectedKanjiModal && kanjiModalTab === 'draw') {
      modalStrokesRef.current = [];
      currentModalStrokeRef.current = [];
      setHasModalDrawn(false);
      setModalDrawResult(null);
      const char = selectedKanjiModal.character;
      const t = setTimeout(() => {
        drawModalGridAndGuide(char, showModalGhostGuide, false);
      }, 60);
      return () => clearTimeout(t);
    }
  }, [selectedKanjiModal?.id, selectedKanjiModal?.character, kanjiModalTab, drawModalGridAndGuide]);

  // Re-draw grid and guide when ghost guide is toggled while PRESERVING existing strokes
  useEffect(() => {
    if (selectedKanjiModal && kanjiModalTab === 'draw') {
      drawModalGridAndGuide(selectedKanjiModal.character, showModalGhostGuide, true);
    }
  }, [showModalGhostGuide, drawModalGridAndGuide, selectedKanjiModal, kanjiModalTab]);

  // Escape key listener for Kanji Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedKanjiModal) {
        setSelectedKanjiModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedKanjiModal]);

  // Reset AI explanation & submode when modal opens/switches
  useEffect(() => {
    if (selectedKanjiModal) {
      setKanjiAiExplanation(null);
      setKanjiAiError(null);
      setKanjiDrawSubMode('anim');
    }
  }, [selectedKanjiModal?.id, selectedKanjiModal?.character]);

  const handleExplainKanji = async (item: KanjiItem) => {
    setIsExplainingKanji(true);
    setKanjiAiError(null);
    const radicals = getRadicalsForCharacter(item.character);

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise(r => setTimeout(r, 800));
        }
        const data = await api.post('/api/ai/kanji-explain', {
          character: item.character,
          sinoVietnamese: item.sino_vietnamese,
          meaning: item.vietnamese_meaning,
          strokeCount: item.stroke_count,
          radicals
        });
        if (data && data.success && data.data) {
          setKanjiAiExplanation(data.data);
          setIsExplainingKanji(false);
          return;
        } else if (attempt === 1) {
          setKanjiAiError(data?.error || 'Dịch vụ AI đang bận, vui lòng thử lại sau.');
        }
      } catch (err: any) {
        if (attempt === 1) {
          setKanjiAiError(err.message || 'Lỗi kết nối máy chủ AI');
        }
      }
    }
    setIsExplainingKanji(false);
  };

  const startModalDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = modalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2dd4bf'; // Teal-400
    ctx.setLineDash([]);

    let x = 0;
    let y = 0;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    currentModalStrokeRef.current = [{ x, y }];
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsModalDrawing(true);
    setHasModalDrawn(true);
  };

  const drawModalStroke = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isModalDrawing) return;
    const canvas = modalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x = 0;
    let y = 0;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    currentModalStrokeRef.current.push({ x, y });
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopModalDrawing = () => {
    setIsModalDrawing(false);
    if (currentModalStrokeRef.current.length > 0) {
      modalStrokesRef.current.push([...currentModalStrokeRef.current]);
      currentModalStrokeRef.current = [];
    }
  };

  const clearModalCanvas = () => {
    if (!selectedKanjiModal) return;
    modalStrokesRef.current = [];
    currentModalStrokeRef.current = [];
    drawModalGridAndGuide(selectedKanjiModal.character, showModalGhostGuide, false);
    setHasModalDrawn(false);
    setModalDrawResult(null);
  };

  // Evaluate Kanji handwriting with Gemini Vision AI + local fallback & concise improvement tip
  const evaluateModalDrawing = async () => {
    if (!selectedKanjiModal) return;
    const canvas = modalCanvasRef.current;
    if (!canvas) return;

    setIsModalGradingWithAI(true);
    setModalDrawResult(null);

    try {
      const strokeCount = parseInt(selectedKanjiModal.stroke_count || '0') || undefined;
      const res = await gradeKanjiWithAI({
        canvas,
        targetKanji: selectedKanjiModal.character,
        strokeCount,
        sinoVietnamese: selectedKanjiModal.sino_vietnamese,
        meaning: selectedKanjiModal.vietnamese_meaning,
        radicals: (selectedKanjiModal as any).radicals
      });

      setModalDrawResult(res);

      if (res.is_correct) {
        playAudio(selectedKanjiModal.character);
      }
    } catch (err) {
      console.error('[evaluateModalDrawing] Error:', err);
    } finally {
      setIsModalGradingWithAI(false);
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
    if (practiceScopeFilter === 'all_50') return vocabList;
    if (practiceScopeFilter === 'level') {
      return vocabList.filter(v => v.lesson_id >= startLessonId && v.lesson_id <= endLessonId);
    }
    const lId = parseInt(practiceScopeFilter, 10);
    if (!isNaN(lId)) {
      return vocabList.filter(v => v.lesson_id === lId);
    }
    return vocabList.filter(v => v.lesson_id >= startLessonId && v.lesson_id <= endLessonId);
  }, [vocabList, practiceScopeFilter, startLessonId, endLessonId]);

  const wrongVocabCount = useMemo(() => {
    return vocabListForLevel.filter(v => v.status === 'wrong').length;
  }, [vocabListForLevel]);

  const currentSourceList = useMemo(() => {
    if (practiceOnlyWrong) {
      return vocabListForLevel.filter(item => item.status === 'wrong');
    }
    const active = Object.keys(practiceFilterStatuses).filter(k => practiceFilterStatuses[k]);
    if (active.length === 0) return vocabListForLevel;
    return vocabListForLevel.filter(item => practiceFilterStatuses[item.status || 'not_learned']);
  }, [vocabListForLevel, practiceFilterStatuses, practiceOnlyWrong]);

  // Statistics for Vocabulary Practice
  const vocabTotalCount = vocabListForLevel.length;
  const vocabMasteredCount = vocabListForLevel.filter(v => v.status === 'mastered').length;
  const vocabLearningCount = vocabListForLevel.filter(v => v.status === 'learning').length;
  const vocabMasteredPercent = vocabTotalCount > 0 ? Math.round((vocabMasteredCount / vocabTotalCount) * 100) : 0;
  const vocabLearningPercent = vocabTotalCount > 0 ? Math.round((vocabLearningCount / vocabTotalCount) * 100) : 0;

  // Per-lesson Vocab statistics mapping: lessonId -> { total, mastered, learning, notLearned, percent }
  const perLessonVocabStats = useMemo(() => {
    const stats: Record<number, { total: number; mastered: number; learning: number; notLearned: number; percent: number }> = {};
    for (let i = 1; i <= 50; i++) {
      const inLesson = vocabList.filter(v => v.lesson_id === i);
      const total = inLesson.length;
      const mastered = inLesson.filter(v => v.status === 'mastered').length;
      const learning = inLesson.filter(v => v.status === 'learning').length;
      const notLearned = inLesson.filter(v => (v.status || 'not_learned') === 'not_learned').length;
      const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;
      stats[i] = { total, mastered, learning, notLearned, percent };
    }
    return stats;
  }, [vocabList]);

  const handleClearWrongWords = async () => {
    try {
      await api.post('/api/user/progress/clear-wrong', { item_type: 'vocabulary' });
      setVocabList(prev => prev.map(v => v.status === 'wrong' ? { ...v, status: 'learning' } : v));
      showToast('Đã dọn dẹp danh sách từ vựng làm sai!');
      setPracticeOnlyWrong(false);
    } catch (err) {
      console.error('Error clearing wrong words:', err);
      showToast('Lỗi khi dọn dẹp danh sách từ sai.');
    }
  };

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
    // Mark wrong / mastered status on backend database for cloud multi-device sync
    practiceList.forEach((item, idx) => {
      const userAnswer = practiceAnswers[idx] || '';
      const isViToJa = practiceDirection === 'vi-to-ja';
      const correctAnswer = isViToJa ? item.hiragana : item.vietnamese_meaning;
      const pct = calculateAccuracy(userAnswer, correctAnswer);

      if (pct < 100) {
        api.post('/api/user/progress', {
          item_type: 'vocabulary',
          item_id: item.id,
          status: 'wrong'
        }).catch(err => console.error('Failed to mark wrong:', err));

        setVocabList(prev => prev.map(v => v.id === item.id ? { ...v, status: 'wrong' } : v));
      } else if (practiceOnlyWrong && pct === 100) {
        api.post('/api/user/progress', {
          item_type: 'vocabulary',
          item_id: item.id,
          status: 'mastered'
        }).catch(err => console.error('Failed to mark mastered:', err));

        setVocabList(prev => prev.map(v => v.id === item.id ? { ...v, status: 'mastered' } : v));
      }
    });

    setTimeout(() => {
      if (practiceResultsRef.current) {
        practiceResultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Punctuation and whitespace normalization helper for flexible grading
  const normalizeJapaneseText = (str: string): string => {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/[\s\u3000.,\/#!$%\^&\*;:{}=\-_\`~()?？!！。、・（）()]/g, '')
      .trim();
  };

  // Grade matching calculation
  const calculateAccuracy = (input: string, correct: string) => {
    const cleanInput = (input || '').trim().toLowerCase();
    if (!cleanInput || !correct) return 0;

    // Split synonyms in correct answer by comma, semicolon, slash, "hoặc", "or"
    const synonyms = (correct || '').split(/[,;\/]|hoặc|or/).map(s => s.trim().toLowerCase());
    
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

  const kanjiListForLevel = useMemo(() => {
    return kanjiList.filter(k => k.lesson_id >= startLessonId && k.lesson_id <= endLessonId);
  }, [kanjiList, startLessonId, endLessonId]);

  const speedrunKanjiSourceList = useMemo(() => {
    const active = Object.keys(speedrunFilterStatuses).filter(k => speedrunFilterStatuses[k]);
    if (active.length === 0) return kanjiListForLevel;
    return kanjiListForLevel.filter(item => speedrunFilterStatuses[item.status || 'not_learned']);
  }, [kanjiListForLevel, speedrunFilterStatuses]);

  useEffect(() => {
    if (typeof window !== 'undefined' && activeTab === 'practice') {
      const dirKey = speedrunTarget === 'kanji' ? kanjiSpeedrunDirection : speedrunDirection;
      const key = `${speedrunTarget}_speedrun_high_score_all_${level}_${dirKey}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setSpeedrunHighScore(parseInt(saved, 10) || 0);
      } else {
        setSpeedrunHighScore(0);
      }
    }
  }, [level, speedrunDirection, kanjiSpeedrunDirection, speedrunTarget, activeTab]);

  const stopSpeedrun = () => {
    if (speedrunTimerRef.current) {
      clearInterval(speedrunTimerRef.current);
    }
    setSpeedrunActive(false);
    setSpeedrunGameOver(false);
    setSpeedrunQuestion(null);
    setSpeedrunKanjiQuestion(null);
    setSpeedrunOptions([]);
    setSpeedrunStreak(0);
    setSpeedrunSelectedChoice(null);
    setSpeedrunChoiceStatus(null);
    setIsEvaluatingChoice(false);
  };

  const getSpeedrunCorrectVal = useCallback(() => {
    if (speedrunTarget === 'vocab') {
      if (!speedrunQuestion) return '';
      return speedrunDirection === 'vi-to-ja' ? speedrunQuestion.hiragana : speedrunQuestion.vietnamese_meaning;
    } else {
      if (!speedrunKanjiQuestion) return '';
      if (kanjiSpeedrunDirection === 'kanji-to-meaning') {
        const sino = speedrunKanjiQuestion.sino_vietnamese ? `[${speedrunKanjiQuestion.sino_vietnamese.toUpperCase()}] ` : '';
        return `${sino}${speedrunKanjiQuestion.vietnamese_meaning}`;
      } else if (kanjiSpeedrunDirection === 'meaning-to-kanji') {
        return speedrunKanjiQuestion.character;
      } else {
        const on = speedrunKanjiQuestion.onyomi ? `On: ${speedrunKanjiQuestion.onyomi}` : '';
        const kun = speedrunKanjiQuestion.kunyomi ? `Kun: ${speedrunKanjiQuestion.kunyomi}` : '';
        return [on, kun].filter(Boolean).join(' | ') || speedrunKanjiQuestion.character;
      }
    }
  }, [speedrunTarget, speedrunQuestion, speedrunKanjiQuestion, speedrunDirection, kanjiSpeedrunDirection]);

  const nextSpeedrunQuestion = useCallback((currentScore: number, customMaxTime?: number, customStreak?: number) => {
    if (speedrunTarget === 'vocab') {
      if (speedrunSourceList.length === 0) {
        showToast('Không có từ vựng nào để chơi Speedrun.');
        return;
      }
      const randomQuestion = speedrunSourceList[Math.floor(Math.random() * speedrunSourceList.length)];
      setSpeedrunQuestion(randomQuestion);
      setSpeedrunKanjiQuestion(null);
      
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

      if (speedrunDirection === 'listen-to-select' && randomQuestion) {
        playAudioWithFallback(randomQuestion.japanese_example || '', randomQuestion.hiragana);
      }
    } else {
      if (speedrunKanjiSourceList.length === 0) {
        showToast('Không có chữ Hán nào để chơi Speedrun.');
        return;
      }
      const randomKanji = speedrunKanjiSourceList[Math.floor(Math.random() * speedrunKanjiSourceList.length)];
      setSpeedrunKanjiQuestion(randomKanji);
      setSpeedrunQuestion(null);

      let correctOption = '';
      let distractors: string[] = [];

      if (kanjiSpeedrunDirection === 'kanji-to-meaning') {
        const formatMeaning = (k: KanjiItem) => {
          const sino = k.sino_vietnamese ? `[${k.sino_vietnamese.toUpperCase()}] ` : '';
          return `${sino}${k.vietnamese_meaning}`;
        };
        correctOption = formatMeaning(randomKanji);
        distractors = speedrunKanjiSourceList
          .filter(k => k.id !== randomKanji.id && k.vietnamese_meaning !== randomKanji.vietnamese_meaning)
          .map(k => formatMeaning(k));
      } else if (kanjiSpeedrunDirection === 'meaning-to-kanji') {
        correctOption = randomKanji.character;
        distractors = speedrunKanjiSourceList
          .filter(k => k.id !== randomKanji.id && k.character !== randomKanji.character)
          .map(k => k.character);
      } else {
        const formatYomi = (k: KanjiItem) => {
          const on = k.onyomi ? `On: ${k.onyomi}` : '';
          const kun = k.kunyomi ? `Kun: ${k.kunyomi}` : '';
          return [on, kun].filter(Boolean).join(' | ') || k.character;
        };
        correctOption = formatYomi(randomKanji);
        distractors = speedrunKanjiSourceList
          .filter(k => k.id !== randomKanji.id)
          .map(k => formatYomi(k));
      }

      const uniqueDistractors = Array.from(new Set(distractors)).sort(() => Math.random() - 0.5).slice(0, 3);
      const choices = [correctOption, ...uniqueDistractors];
      while (choices.length < 4) {
        choices.push(`Đáp án nhiễu ${choices.length + 1}`);
      }
      choices.sort(() => Math.random() - 0.5);
      setSpeedrunOptions(choices);
    }
    
    let maxTime = 10;
    if (customMaxTime !== undefined) {
      maxTime = customMaxTime;
    } else {
      const currentStreakVal = customStreak !== undefined ? customStreak : speedrunStreak;
      const reductionCount = Math.floor(currentStreakVal / 3);
      maxTime = Math.max(2, Math.round(10 * Math.pow(0.9, reductionCount) * 10) / 10);
    }
    
    setSpeedrunMaxTime(maxTime);
    setSpeedrunTimeLeft(maxTime);
    
    if (speedrunTimerRef.current) {
      clearInterval(speedrunTimerRef.current);
    }
    
    let remaining = maxTime;
    speedrunTimerRef.current = setInterval(() => {
      remaining = Math.round((remaining - 0.1) * 10) / 10;
      if (remaining <= 0) {
        clearInterval(speedrunTimerRef.current);
        playSpeedrunSound('wrong');
        setSpeedrunGameOver(true);
        setSpeedrunActive(false);
        setSpeedrunStreak(0);
        setSpeedrunSelectedChoice(null);
        setSpeedrunChoiceStatus(null);
        setIsEvaluatingChoice(false);

        const finalScore = speedrunScoreRef.current;
        const dirKey = speedrunTarget === 'kanji' ? kanjiSpeedrunDirection : speedrunDirection;
        const key = `${speedrunTarget}_speedrun_high_score_all_${level}_${dirKey}`;
        const saved = localStorage.getItem(key);
        const currentHigh = saved ? (parseInt(saved, 10) || 0) : 0;
        if (finalScore > currentHigh) {
          localStorage.setItem(key, finalScore.toString());
          setSpeedrunHighScore(finalScore);
          api.post('/api/user/progress', {
            item_type: speedrunTarget === 'kanji' ? 'kanji' : 'vocabulary',
            item_id: (speedrunTarget === 'kanji' ? 300000 : 200000) + (level === 'N5' ? 5 : 4),
            status: 'mastered'
          }).catch(console.error);
        }
      } else {
        setSpeedrunTimeLeft(remaining);
      }
    }, 100);
  }, [speedrunTarget, speedrunSourceList, speedrunKanjiSourceList, speedrunDirection, kanjiSpeedrunDirection, speedrunStreak, level]);

  const startSpeedrunGame = () => {
    const sourceList = speedrunTarget === 'kanji' ? speedrunKanjiSourceList : speedrunSourceList;
    if (sourceList.length < 4) {
      showToast(`Cần ít nhất 4 ${speedrunTarget === 'kanji' ? 'chữ Hán' : 'từ vựng'} để bắt đầu game Speedrun.`);
      return;
    }
    setSpeedrunScore(0);
    speedrunScoreRef.current = 0;
    setSpeedrunStreak(0);
    setSpeedrunSelectedChoice(null);
    setSpeedrunChoiceStatus(null);
    setIsEvaluatingChoice(false);
    setSpeedrunActive(true);
    setSpeedrunGameOver(false);
    nextSpeedrunQuestion(0, 10, 0);
  };

  const handleSpeedrunChoice = (choice: string) => {
    if (isEvaluatingChoice) return;
    if (speedrunTarget === 'vocab' && !speedrunQuestion) return;
    if (speedrunTarget === 'kanji' && !speedrunKanjiQuestion) return;
    
    const correctVal = getSpeedrunCorrectVal();
    const isCorrect = choice === correctVal;

    setIsEvaluatingChoice(true);
    setSpeedrunSelectedChoice(choice);
    
    if (speedrunTimerRef.current) {
      clearInterval(speedrunTimerRef.current);
    }
    
    if (isCorrect) {
      setSpeedrunChoiceStatus('correct');
      playSpeedrunSound('correct');

      const newScore = speedrunScore + 1;
      setSpeedrunScore(newScore);
      speedrunScoreRef.current = newScore;
      const newStreak = speedrunStreak + 1;
      setSpeedrunStreak(newStreak);
      
      const reductionCount = Math.floor(newStreak / 3);
      const nextMaxTime = Math.max(2, Math.round(10 * Math.pow(0.9, reductionCount) * 10) / 10);
      
      setTimeout(() => {
        setSpeedrunSelectedChoice(null);
        setSpeedrunChoiceStatus(null);
        setIsEvaluatingChoice(false);
        nextSpeedrunQuestion(newScore, nextMaxTime, newStreak);
      }, 350);
    } else {
      setSpeedrunChoiceStatus('wrong');
      playSpeedrunSound('wrong');

      if (speedrunTarget === 'vocab' && speedrunQuestion) {
        api.post('/api/user/progress', {
          item_type: 'vocabulary',
          item_id: speedrunQuestion.id,
          status: 'wrong'
        }).catch(err => console.error('Speedrun mark wrong error:', err));
        setVocabList(prev => prev.map(v => v.id === speedrunQuestion.id ? { ...v, status: 'wrong' } : v));
      } else if (speedrunTarget === 'kanji' && speedrunKanjiQuestion) {
        api.post('/api/user/progress', {
          item_type: 'kanji',
          item_id: speedrunKanjiQuestion.id,
          status: 'wrong'
        }).catch(err => console.error('Speedrun mark wrong kanji error:', err));
        setKanjiList(prev => prev.map(k => k.id === speedrunKanjiQuestion.id ? { ...k, status: 'wrong' } : k));
      }

      setTimeout(() => {
        setSpeedrunGameOver(true);
        setSpeedrunActive(false);
        setSpeedrunStreak(0);
        setSpeedrunSelectedChoice(null);
        setSpeedrunChoiceStatus(null);
        setIsEvaluatingChoice(false);
        
        const finalScore = speedrunScore;
        const dirKey = speedrunTarget === 'kanji' ? kanjiSpeedrunDirection : speedrunDirection;
        const key = `${speedrunTarget}_speedrun_high_score_all_${level}_${dirKey}`;
        const saved = localStorage.getItem(key);
        const currentHigh = saved ? (parseInt(saved, 10) || 0) : 0;
        if (finalScore > currentHigh) {
          localStorage.setItem(key, finalScore.toString());
          setSpeedrunHighScore(finalScore);
          api.post('/api/user/progress', {
            item_type: speedrunTarget === 'kanji' ? 'kanji' : 'vocabulary',
            item_id: (speedrunTarget === 'kanji' ? 300000 : 200000) + (level === 'N5' ? 5 : 4),
            status: 'mastered'
          }).catch(console.error);
        }
      }, 800);
    }
  };

  // -------------------------------------------------------------
  // 6. Phân hệ "Bài Kiểm Tra" (Exam System) Logic & Generator
  // -------------------------------------------------------------
  // Sidebar Menu list (Minna Nihongo static menu)
  const menuItems = [
    { name: 'Tiến độ học', id: 'dashboard', icon: '📊', active: false },
    { name: 'Ngữ pháp', id: 'roadmap', icon: '🗺️', active: false },
    { name: 'Từ vựng', id: 'vocab', icon: '📚', active: false },
    { name: 'Chữ Hán (Kanji)', id: 'kanji', icon: '🉐', active: false },
    { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️', active: false },
    { name: 'Luyện đề JLPT', id: 'jlpt', icon: '🎓', active: false }
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
          {menuItems.map((item) => {
            const targetHref =
              item.id === 'dashboard'
                ? '/dashboard'
                : item.id === 'roadmap'
                ? '/roadmap'
                : item.id === 'kana'
                ? '/kana'
                : `/lessons/1?tab=${item.id}`;
            return (
              <Link
                key={item.id}
                href={targetHref}
                prefetch
                onClick={() => setIsSidebarOpen(false)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-slate-400 dark:text-slate-505 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:shadow-none"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <SidebarSettings />
      </aside>

      {/* 2. Main content area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 lg:p-10 space-y-6">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
              TỔNG HỢP KIẾN THỨC & TỰ GHI NHỚ
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
              Trung tâm luyện thi & ôn tập tổng hợp liên bài N5/N4 (Tra cứu nhanh Từ vựng, Chữ Hán, Mẫu câu, Bảng chữ cái)
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto flex-wrap gap-2">
            {/* Quick Lookup Button */}
            <button
              type="button"
              onClick={() => {
                setQuickLookupTab('vocab');
                setIsQuickLookupOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
              title="Tra cứu nhanh Từ vựng, Kanji, Mẫu câu, Bảng chữ cái"
            >
              <span>🔍</span>
              <span>Tra cứu</span>
            </button>

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
          <div className="flex border-b border-slate-200 dark:border-slate-800 p-1 bg-slate-100/65 dark:bg-slate-900/65 rounded-xl max-w-3xl shadow-sm overflow-x-auto">
            {[
              { id: 'practice', label: '✏️ Luyện từ vựng' },
              { id: 'kanji_practice', label: '🉐 Phản xạ Kanji' },
              { id: 'jlpt_exam', label: '🏆 Luyện đề JLPT' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  stopSpeedrun();
                  if (tab.id === 'practice') {
                    setSpeedrunTarget('vocab');
                  }
                }}
                className={`flex-1 text-center py-2.5 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
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
        {/* Tab 4: Luyện từ vựng (practice) */}
        {/* ------------------------------------------------------------- */}
        {!loading && activeTab === 'practice' && (
          <div className="space-y-6 max-w-6xl mx-auto animate-fade-in overflow-x-hidden min-w-0 max-w-full w-full" ref={practiceTopRef}>
                        <div className="space-y-6">
              {!speedrunActive && !speedrunGameOver && (
                <div className="max-w-xl mx-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-6 shadow-xl animate-scale-up relative">
                  <div className="w-16 h-16 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
                    ⚡
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Trắc nghiệm phản xạ Từ vựng
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed max-w-sm mx-auto">
                      Mỗi câu có tối đa 10 giây để phản xạ. Trả lời đúng liên tục sẽ tăng streak và rút ngắn thời gian. Game kết thúc khi hết giờ hoặc chọn sai.
                    </p>
                  </div>

                  {/* Scope Selector for Vocab Practice */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block uppercase">Phạm vi bài học:</label>
                    <select
                      value={practiceScopeFilter}
                      onChange={(e) => setPracticeScopeFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm truncate"
                    >
                      <option value="level">
                        Trình độ {level} ({level === 'N5' ? 'Bài 1 - 25' : 'Bài 26 - 50'}) • {vocabMasteredPercent}% đã thuộc
                      </option>
                      <option value="all_50">Toàn bộ 50 bài học (N5 & N4)</option>
                      <optgroup label="Từng bài học cụ thể:">
                        {Array.from({ length: 50 }, (_, i) => i + 1).map((lNum) => {
                          const st = perLessonVocabStats[lNum];
                          const badge = !st || st.total === 0 ? '' : st.percent === 100 ? '🟢' : st.mastered > 0 || st.learning > 0 ? '🟡' : '⚪';
                          const text = st && st.total > 0 ? ' (' + st.mastered + '/' + st.total + ' từ • ' + st.percent + '% ' + badge + ')' : ' (0 từ)';
                          return (
                            <option key={lNum} value={lNum.toString()}>
                              Bài {lNum} {lNum <= 25 ? '[N5]' : '[N4]'}{text}
                            </option>
                          );
                        })}
                      </optgroup>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left border-y border-slate-100 dark:border-slate-850 py-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block uppercase">Chiều phản xạ:</label>
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
                            type="button"
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
                      type="button"
                      onClick={startSpeedrunGame}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      🚀 Bắt Đầu Chơi
                    </button>
                  </div>
                )}

                {/* Speedrun active gameplay screen */}
                {speedrunActive && (speedrunQuestion || speedrunKanjiQuestion) && (
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

                    <div className="bg-slate-50 dark:bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-850 text-center space-y-3 shadow-inner">
                      {speedrunTarget === 'vocab' && speedrunQuestion && (
                        speedrunDirection === 'listen-to-select' ? (
                          <div className="space-y-3">
                            <button
                              type="button"
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

                          </>
                        )
                      )}

                      {speedrunTarget === 'kanji' && speedrunKanjiQuestion && (
                        <>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                            {kanjiSpeedrunDirection === 'kanji-to-meaning'
                              ? 'Nhìn chữ Hán chọn nghĩa & âm Hán Việt tương ứng:'
                              : kanjiSpeedrunDirection === 'meaning-to-kanji'
                              ? 'Chọn chữ Hán đúng với nghĩa sau:'
                              : 'Nhìn chữ Hán chọn âm đọc Onyomi / Kunyomi:'}
                          </p>
                          {kanjiSpeedrunDirection === 'meaning-to-kanji' ? (
                            <div className="space-y-1">
                              {speedrunKanjiQuestion.sino_vietnamese && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                  Âm Hán: {speedrunKanjiQuestion.sino_vietnamese.toUpperCase()}
                                </span>
                              )}
                              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                {speedrunKanjiQuestion.vietnamese_meaning}
                              </h2>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <h2 className="text-5xl sm:text-6xl font-black text-indigo-600 dark:text-indigo-400 font-serif my-1 select-all">
                                {speedrunKanjiQuestion.character}
                              </h2>
                              {kanjiSpeedrunDirection === 'kanji-to-meaning' && speedrunKanjiQuestion.stroke_count && (
                                <p className="text-[11px] text-slate-400 font-semibold">({speedrunKanjiQuestion.stroke_count} nét)</p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {speedrunOptions.map((choice, oIdx) => {
                        const correctVal = getSpeedrunCorrectVal();
                        const isSelected = speedrunSelectedChoice === choice;
                        const isCorrectAnswer = choice === correctVal;

                        let btnStyle = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-900';
                        let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700';

                        if (speedrunChoiceStatus === 'correct' && isSelected) {
                          btnStyle = 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.02] ring-2 ring-emerald-300';
                          badgeStyle = 'bg-white text-emerald-600 border-emerald-400';
                        } else if (speedrunChoiceStatus === 'wrong') {
                          if (isSelected) {
                            btnStyle = 'border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-shake ring-2 ring-rose-300';
                            badgeStyle = 'bg-white text-rose-600 border-rose-400';
                          } else if (isCorrectAnswer) {
                            btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold ring-2 ring-emerald-500/50 scale-[1.01]';
                            badgeStyle = 'bg-emerald-500 text-white border-emerald-400';
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => handleSpeedrunChoice(choice)}
                            disabled={isEvaluatingChoice}
                            className={`px-4 py-3.5 text-left rounded-xl text-xs sm:text-sm font-bold border cursor-pointer transition-all shadow-sm break-all flex items-center justify-between ${btnStyle} ${speedrunTarget === 'kanji' && kanjiSpeedrunDirection === 'meaning-to-kanji' ? 'justify-center text-2xl font-serif py-4' : ''}`}
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className={`inline-block w-5 h-5 rounded-md border text-[10px] font-bold text-center leading-5 flex-shrink-0 ${badgeStyle}`}>
                                {['A', 'B', 'C', 'D'][oIdx]}
                              </span>
                              <span className="truncate">{choice}</span>
                            </div>
                            {speedrunChoiceStatus === 'correct' && isSelected && (
                              <span className="text-sm font-black animate-bounce ml-2 flex-shrink-0">✓</span>
                            )}
                            {speedrunChoiceStatus === 'wrong' && isSelected && (
                              <span className="text-sm font-black animate-pulse ml-2 flex-shrink-0">✗</span>
                            )}
                            {speedrunChoiceStatus === 'wrong' && isCorrectAnswer && !isSelected && (
                              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 ml-2 flex-shrink-0">Đúng ✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-center pt-2">
                      <button
                        type="button"
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
                        type="button"
                        onClick={startSpeedrunGame}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        🔄 Chơi lại lượt mới
                      </button>
                      <button
                        type="button"
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
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Tab: Luyện Kanji (kanji_practice) */}
        {/* ------------------------------------------------------------- */}
        {!loading && activeTab === 'kanji_practice' && (
          <CombinedKanjiPractice
            kanjiList={kanjiList as any}
            vocabList={vocabList}
            grammarList={grammarList}
            currentLevel={level}
            onUpdateKanjiStatus={handleItemStatusChange}
          />
        )}



        {/* ------------------------------------------------------------- */}
        {/* Tab 6: Phân hệ Bài Kiểm Tra (exam) */}
        {/* ------------------------------------------------------------- */}
        {!loading && activeTab === 'jlpt_exam' && (
          <GlobalJlptExamTab
            level={level}
            vocabItems={vocabList}
            kanjiItems={kanjiList}
            grammarItems={grammarList}
          />
        )}
      </main>

      {isQuickLookupOpen && (
        <QuickLookupModal
          isOpen={isQuickLookupOpen}
          onClose={() => setIsQuickLookupOpen(false)}
          initialTab={quickLookupTab}
        />
      )}
    </div>
  );
}
