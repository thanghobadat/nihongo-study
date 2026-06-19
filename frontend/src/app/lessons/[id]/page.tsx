'use client';

import { useState, useEffect, useCallback, use, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../utils/api';
import { getGrammarVocabMapping, getGrammarKanjiMapping } from '../../utils/roadmapMapping';
import { VOCAB_IMAGES } from '../../utils/vocabImages';
import CourseSwitcher from '../../components/CourseSwitcher';
import { getRadicalsString } from '../../utils/kanjiRadicals';

// Defined types
interface Lesson {
  id: number;
  title: string;
  description: string;
  roleplay_options?: {
    names: string[];
    countries: string[];
    occupations: string[];
    organizations: string[];
  };
}

interface VocabItem {
  id: number;
  lesson_id: number;
  hiragana: string;
  romaji: string;
  vietnamese_meaning: string;
  word_type: string;
  japanese_example: string;
  example_meaning: string;
  mnemonic_tip: string;
  image_url: string;
  status: 'not_learned' | 'learning' | 'mastered';
}

interface KanjiItem {
  id: number;
  lesson_id: number;
  character: string;
  stroke_count: string;
  onyomi: string;
  kunyomi: string;
  sino_vietnamese: string;
  vietnamese_meaning: string;
  mnemonic_tip: string;
  compounds: string;
  status: 'not_learned' | 'learning' | 'mastered';
}

interface GrammarItem {
  id: number;
  lesson_id: number;
  title: string;
  meaning: string;
  structure: string;
  vietnamese_explanation: string;
  japanese_example: string;
  example_meaning: string;
  notes: string;
  status: 'not_learned' | 'learning' | 'mastered';
}

interface DialogueItem {
  id: number;
  lesson_id: number;
  speaker: string;
  japanese: string;
  romaji: string;
  vietnamese: string;
  topic?: string;
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

const lesson1Romaji: Record<number, string> = {
  1: "Hajimemashite. Watashi wa Namu desu. Betonamu kara kimashita. Douzo yoroshiku.",
  2: "Hajimemashite. Mira- desu. Kochira koso douzo yoroshiku.",
  3: "Shitsurei desu ga, Mira- san wa oikutsu (nansai) desu ka.",
  4: "Watashi wa 30-sai desu. Namu-san wa gakusei desu ka.",
  5: "Iie, watashi wa gakusei ja arimasen. Enjinia desu.",
  6: "Ano hito wa donata desu ka.",
  7: "Ano hito wa Santosu-san desu. Burajiru-jin desu."
};

const jaToVnDict: Record<string, string> = {
  // Names
  'ナム': 'Nam',
  'タイン': 'Thanh',
  'アン': 'An',
  'リン': 'Linh',
  'クオン': 'Cường',
  
  // Countries
  'ベトナム': 'Việt Nam',
  'アメリカ': 'Mỹ',
  '日本': 'Nhật Bản',
  'イギリス': 'Anh',
  'フランス': 'Pháp',
  'ブラジル': 'Brasil',
  'インド': 'Ấn Độ',
  'インドネシア': 'Indonesia',
  '韓国': 'Hàn Quốc',
  '中国': 'Trung Quốc',
  'ドイツ': 'Đức',
  'タイ': 'Thái Lan',
  
  // Occupations
  'エンジニア': 'kỹ sư',
  '学生': 'học sinh',
  '教師': 'giáo viên',
  '会社員': 'nhân viên công ty',
  '医者': 'bác sĩ',
  '研究者': 'nhà nghiên cứu',
  '銀行員': 'nhân viên ngân hàng',
  '公務員': 'công chức',
  
  // Organizations
  'さくら大学': 'Đại học Sakura',
  'さくら病院': 'Bệnh viện Sakura',
  '富士大学': 'Đại học Fuji',
  '富士病院': 'Bệnh viện Fuji',
  '神戸病院': 'Bệnh viện Kobe',
  'パワー電気': 'Điện lực Power',
  'ブラジルエアー': 'Hàng không Brazil',
  'トヨタ': 'Toyota',
  'マック': 'Mac',
  'FPT': 'FPT',
  'IMC': 'IMC',
  'AKC': 'AKC',
  'Kobe Hospital': 'Bệnh viện Kobe'
};

const jaToRomajiDict: Record<string, string> = {
  // Names
  'ナム': 'Namu',
  'タイン': 'Tain',
  'アン': 'An',
  'リン': 'Rin',
  'クオン': 'Kuon',
  
  // Countries
  'ベトナム': 'Betonamu',
  'アメリカ': 'Amerika',
  '日本': 'Nihon',
  'イギリス': 'Igirisu',
  'フランス': 'Furansu',
  'ブラジル': 'Burajiru',
  'インド': 'Indo',
  'インドネシア': 'Indoneshia',
  '韓国': 'Kankoku',
  '中国': 'Chuugoku',
  'ドイツ': 'Doitsu',
  'タイ': 'Tai',
  
  // Occupations
  'エンジニア': 'enjinia',
  '学生': 'gakusei',
  '教師': 'kyoushi',
  '会社員': 'kaishain',
  '医者': 'isha',
  '研究者': 'kenkyuusha',
  '銀行員': 'ginkouin',
  '公務員': 'koumuin',
  
  // Organizations
  'さくら大学': 'Sakura daigaku',
  'さくら病院': 'Sakura byouin',
  '富士大学': 'Fuji daigaku',
  '富士病院': 'Fuji byouin',
  '神戸病院': 'Kobe byouin',
  'パワー電気': 'Pawaa denki',
  'ブラジルエアー': 'Burajiru eaa',
  'トヨタ': 'Toyota',
  'マック': 'Makku',
  'FPT': 'FPT',
  'IMC': 'IMC',
  'AKC': 'AKC',
  'Kobe Hospital': 'Kobe Hospital'
};

export default function LessonDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const selectedLessonId = parseInt(id);
  const router = useRouter();
  const searchParams = useSearchParams();
  let currentTab = searchParams.get('tab') || 'vocab';
  if (currentTab === 'grammar') {
    currentTab = 'vocab';
  }
  const grammarIndexParam = searchParams.get('grammarIndex');
  const grammarIndex = grammarIndexParam !== null ? parseInt(grammarIndexParam) : null;
  const user = api.getUser();

  const [activeCourse, setActiveCourse] = useState<'minna' | 'marugoto'>('minna');

  useEffect(() => {
    const isMarugoto = selectedLessonId >= 101;
    setActiveCourse(isMarugoto ? 'marugoto' : 'minna');
    localStorage.setItem('activeCourse', isMarugoto ? 'marugoto' : 'minna');
  }, [selectedLessonId]);

  // Navigation Items corresponding to the 9 Sheets / Areas
  const isMarugoto = selectedLessonId >= 101;
  const isEvenMarugoto = isMarugoto && selectedLessonId % 2 === 0;

  const menuItems = [
    ...(isMarugoto ? [] : [
      { name: 'Cẩm nang học', id: 'guide', icon: '📖', active: false }
    ]),
    { name: 'Tiến độ học', id: 'dashboard', icon: '📊', active: false },
    { name: 'Lộ trình học', id: 'roadmap', icon: '🗺️', active: false },
    { name: 'Từ vựng', id: 'vocab', icon: '📚', active: currentTab === 'vocab' },
    { name: 'Chữ Hán (Kanji)', id: 'kanji', icon: '🉐', active: currentTab === 'kanji' },
    { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️', active: currentTab === 'practice' },
    ...(isMarugoto ? [
      { name: 'Tự đánh giá (Can-do)', id: 'cando', icon: '🎯', active: currentTab === 'cando' },
      ...(isEvenMarugoto ? [
        { name: 'Văn hóa & Cuộc sống', id: 'culture', icon: '🗾', active: currentTab === 'culture' }
      ] : [])
    ] : [
      { name: 'Flashcards', id: 'flashcards', icon: '🃏', active: currentTab === 'flashcards' },
      { name: 'Luyện nói (Kaiwa)', id: 'kaiwa', icon: '💬', active: currentTab === 'kaiwa' }
    ]),
    ...(isMarugoto ? [] : [
      { name: 'Ôn bảng chữ cái', id: 'kana', icon: '🔤', active: false }
    ])
  ];

  const level = selectedLessonId <= 25 ? 'N5' : 'N4';

  // Save selectedLessonId to localStorage to persist state across navigations
  useEffect(() => {
    if (selectedLessonId && !isNaN(selectedLessonId)) {
      localStorage.setItem('selectedLessonId', selectedLessonId.toString());
    }
  }, [selectedLessonId]);

  // UI States
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [vocabItems, setVocabItems] = useState<VocabItem[]>([]);
  const [kanjiItems, setKanjiItems] = useState<KanjiItem[]>([]);
  const [grammarItems, setGrammarItems] = useState<GrammarItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);

  // Active Lesson Title & Details
  const activeLesson = lessons.find(l => l.id === selectedLessonId);
  const lessonTitle = activeLesson ? activeLesson.title : `Bài ${selectedLessonId}`;

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_learned' | 'learning' | 'mastered'>('all');
  const [showRadicals, setShowRadicals] = useState<boolean>(false);

  // Flashcards States
  const [flashcardType, setFlashcardType] = useState<'vocab' | 'kanji'>('vocab');
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);

  // Mobile navigation drawer toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Kaiwa States
  const [dialogueItems, setDialogueItems] = useState<DialogueItem[]>([]);
  const [charName, setCharName] = useState<string>('ナム');
  const [charCountry, setCharCountry] = useState<string>('ベトナム');
  const [charOccupation, setCharOccupation] = useState<string>('エンジニア');
  const [charOrganization, setCharOrganization] = useState<string>('FPT');
  const [showRomaji, setShowRomaji] = useState<boolean>(false);
  const [showVietnamese, setShowVietnamese] = useState<boolean>(true);
  const [scriptMode, setScriptMode] = useState<'kanji' | 'hiragana'>('kanji');
  const [collapsedTopics, setCollapsedTopics] = useState<Record<string, boolean>>({});

  // Cando & Culture States
  const [candoChecks, setCandoChecks] = useState<any[]>([]);
  const [cultureData, setCultureData] = useState<any[]>([]);

  // Flashcards Status Filter
  const [flashcardFilterStatuses, setFlashcardFilterStatuses] = useState<Record<string, boolean>>({
    not_learned: false,
    learning: false,
    mastered: false
  });
  const [flashcardDropdownOpen, setFlashcardDropdownOpen] = useState<boolean>(false);

  // Luyện tập (Practice) States
  const [practiceMode, setPracticeMode] = useState<'vocab' | 'kanji'>('vocab');
  const [practiceLimit, setPracticeLimit] = useState<number>(10);
  const [practiceType, setPracticeType] = useState<'write' | 'image' | 'speedrun'>('write');
  const [useRomaji, setUseRomaji] = useState<boolean>(false);
  const [baseShuffledList, setBaseShuffledList] = useState<any[]>([]);
  const [practiceList, setPracticeList] = useState<any[]>([]);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [isGraded, setIsGraded] = useState<boolean>(false);
  const [visibleAnswers, setVisibleAnswers] = useState<Record<string, boolean>>({});
  const [practiceDirection, setPracticeDirection] = useState<'vi-to-ja' | 'ja-to-vi'>('vi-to-ja');

  // Practice Status Filter
  const [practiceFilterStatuses, setPracticeFilterStatuses] = useState<Record<string, boolean>>({
    not_learned: false,
    learning: false,
    mastered: false
  });
  const [practiceDropdownOpen, setPracticeDropdownOpen] = useState<boolean>(false);

  // Image Practice States
  const [imageQuizIndex, setImageQuizIndex] = useState<number>(0);
  const [imageQuizSelectedAnswer, setImageQuizSelectedAnswer] = useState<string | null>(null);
  const [imageQuizTypedAnswer, setImageQuizTypedAnswer] = useState<string>('');
  const [imageQuizChecked, setImageQuizChecked] = useState<boolean>(false);
  const [imageQuizScore, setImageQuizScore] = useState<number>(0);
  const [imageQuizPlayed, setImageQuizPlayed] = useState<number>(0);
  const [imageQuizList, setImageQuizList] = useState<VocabItem[]>([]);
  const [imageQuizChoices, setImageQuizChoices] = useState<string[]>([]);
  const [imageQuizFeedbackMsg, setImageQuizFeedbackMsg] = useState<string>('');
  const [imagePracticeSubMode, setImagePracticeSubMode] = useState<'choices' | 'write'>('choices');

  // Speedrun Practice States
  const [speedrunActive, setSpeedrunActive] = useState<boolean>(false);
  const [speedrunGameOver, setSpeedrunGameOver] = useState<boolean>(false);
  const [speedrunScore, setSpeedrunScore] = useState<number>(0);
  const [speedrunHighScore, setSpeedrunHighScore] = useState<number>(0);
  const [speedrunQuestion, setSpeedrunQuestion] = useState<VocabItem | null>(null);
  const [speedrunOptions, setSpeedrunOptions] = useState<string[]>([]);
  const [speedrunTimeLeft, setSpeedrunTimeLeft] = useState<number>(10);
  const [speedrunMaxTime, setSpeedrunMaxTime] = useState<number>(10);
  const [speedrunDirection, setSpeedrunDirection] = useState<'ja-to-vi' | 'vi-to-ja'>('ja-to-vi');
  
  const speedrunTimerRef = useRef<any>(null);
  const speedrunScoreRef = useRef<number>(0);
  const practiceResultRef = useRef<HTMLDivElement>(null);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const practiceEl = document.getElementById('practice-dropdown-container');
      if (practiceEl && !practiceEl.contains(event.target as Node)) {
        setPracticeDropdownOpen(false);
      }
      const flashcardsEl = document.getElementById('flashcards-dropdown-container');
      if (flashcardsEl && !flashcardsEl.contains(event.target as Node)) {
        setFlashcardDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Memoized filtered source list based on selection
  const currentSourceList = useMemo(() => {
    const list = practiceMode === 'vocab' ? vocabItems : kanjiItems;
    const activeStatuses = Object.keys(practiceFilterStatuses).filter(key => practiceFilterStatuses[key]);
    if (activeStatuses.length === 0) {
      return list;
    }
    return list.filter(item => practiceFilterStatuses[item.status]);
  }, [practiceMode, vocabItems, kanjiItems, practiceFilterStatuses]);

  useEffect(() => {
    setPracticeAnswers({});
    setIsGraded(false);
    setVisibleAnswers({});
  }, [practiceDirection]);

  // Accordion Collapse States for Vocab & Kanji
  const [collapsedVocabSections, setCollapsedVocabSections] = useState<Record<string, boolean>>({});
  const [collapsedKanjiSections, setCollapsedKanjiSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (grammarItems.length === 0) return;

    const initialVocabCollapse: Record<string, boolean> = {};
    const initialKanjiCollapse: Record<string, boolean> = {};

    if (grammarIndex !== null) {
      // Collapse all sections except the one corresponding to grammarIndex
      grammarItems.forEach((_, idx) => {
        initialVocabCollapse[idx.toString()] = idx !== grammarIndex;
        initialKanjiCollapse[idx.toString()] = idx !== grammarIndex;
      });
      initialVocabCollapse['supplemental'] = true;
      initialKanjiCollapse['supplemental'] = true;
    } else {
      // If grammarIndex is null, expand all sections by default
      grammarItems.forEach((_, idx) => {
        initialVocabCollapse[idx.toString()] = false;
        initialKanjiCollapse[idx.toString()] = false;
      });
      initialVocabCollapse['supplemental'] = false;
      initialKanjiCollapse['supplemental'] = false;
    }

    setCollapsedVocabSections(initialVocabCollapse);
    setCollapsedKanjiSections(initialKanjiCollapse);
  }, [grammarIndex, grammarItems]);

  const toggleVocabSection = (key: string) => {
    setCollapsedVocabSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleKanjiSection = (key: string) => {
    setCollapsedKanjiSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };


  // Play audio voice
  const playAudio = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (isIOS) {
        showNotification('Lưu ý: Hãy tắt chế độ Im lặng (gạt nút sườn) để nghe thấy tiếng phát âm.');
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

  // Fetch initial lessons
  useEffect(() => {
    async function loadLessons() {
      try {
        const course = selectedLessonId >= 101 ? 'marugoto' : 'minna';
        const lessonData = await api.get(`/api/user/lessons?course=${course}`);
        if (Array.isArray(lessonData)) {
          setLessons(lessonData);
        }
      } catch (error) {
        console.error('Failed to load lessons:', error);
      }
    }
    loadLessons();
  }, [selectedLessonId]);

  // Fetch vocabulary data when lesson updates
  const loadVocabData = useCallback(async () => {
    setLoading(true);
    try {
      const vocabData = await api.get(`/api/user/lessons/${selectedLessonId}/vocabulary`);
      if (Array.isArray(vocabData)) {
        setVocabItems(vocabData);
      }
    } catch (error) {
      console.error('Failed to load vocabulary:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedLessonId]);

  // Fetch kanji data when lesson updates
  const loadKanjiData = useCallback(async () => {
    setLoading(true);
    try {
      const kanjiData = await api.get(`/api/user/lessons/${selectedLessonId}/kanji`);
      if (Array.isArray(kanjiData)) {
        setKanjiItems(kanjiData);
      }
    } catch (error) {
      console.error('Failed to load kanji:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedLessonId]);

  // Fetch grammar data when lesson updates
  const loadGrammarData = useCallback(async () => {
    setLoading(true);
    try {
      const grammarData = await api.get(`/api/user/lessons/${selectedLessonId}/grammar`);
      if (Array.isArray(grammarData)) {
        setGrammarItems(grammarData);
      }
    } catch (error) {
      console.error('Failed to load grammar:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedLessonId]);

  // Fetch dialogue data when lesson updates
  const loadDialogueData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/user/lessons/${selectedLessonId}/kaiwa`);
      if (Array.isArray(data)) {
        setDialogueItems(data);
      }
    } catch (error) {
      console.error('Failed to load dialogue:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedLessonId]);

  // Fetch cando data when lesson updates
  const loadCandoData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/user/lessons/${selectedLessonId}/cando`);
      if (Array.isArray(data)) {
        setCandoChecks(data);
      }
    } catch (error) {
      console.error('Failed to load cando checks:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedLessonId]);

  // Fetch culture data when lesson updates
  const loadCultureData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/user/lessons/${selectedLessonId}/culture`);
      if (Array.isArray(data)) {
        setCultureData(data);
      }
    } catch (error) {
      console.error('Failed to load culture content:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedLessonId]);

  // Handle Can-do status changes
  const handleCandoStatusChange = async (itemId: number, newStatus: 'not_learned' | 'learning' | 'mastered') => {
    try {
      await api.post('/api/user/progress', {
        item_type: 'cando',
        item_id: itemId,
        status: newStatus
      });
      setCandoChecks(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item));
      showNotification('Đã lưu đánh giá Can-do! 🎯');
    } catch (error) {
      console.error('Failed to update cando status:', error);
      showNotification('Lỗi lưu trạng thái đánh giá.');
    }
  };

  // Dynamic Dialogue Substitution Helper
  const hasRoleplay = useMemo(() => {
    return !!(
      activeLesson?.roleplay_options &&
      (
        (activeLesson.roleplay_options.names && activeLesson.roleplay_options.names.length > 0) ||
        (activeLesson.roleplay_options.countries && activeLesson.roleplay_options.countries.length > 0) ||
        (activeLesson.roleplay_options.occupations && activeLesson.roleplay_options.occupations.length > 0) ||
        (activeLesson.roleplay_options.organizations && activeLesson.roleplay_options.organizations.length > 0)
      )
    );
  }, [activeLesson]);

  const substituteText = (text: string) => {
    if (!text) return '';
    if (!hasRoleplay) return text;
    let result = text;
    const opts = activeLesson?.roleplay_options;

    // 1. Substitute Country
    if (opts?.countries && opts.countries.length > 0) {
      result = result.replace(/ベトナム/g, '__MASK_COUNTRY_JA__');
      result = result.replace(/nước Việt Nam/g, '__MASK_COUNTRY_VN_FULL__');
      result = result.replace(/Việt Nam/g, '__MASK_COUNTRY_VN__');
      result = result.replace(/Betonamu/g, '__MASK_COUNTRY_ROM__');
    }

    // 2. Substitute Name
    if (opts?.names && opts.names.length > 0) {
      result = result.replace(/ナム/g, charName);
      const romName = jaToRomajiDict[charName] || charName;
      result = result.replace(/Namu/g, romName);
      const vnName = jaToVnDict[charName] || charName;
      result = result.replace(/Nam/g, vnName);
    }

    // 3. Substitute Occupation
    if (opts?.occupations && opts.occupations.length > 0) {
      result = result.replace(/エンジニア/g, charOccupation);
      const vnOcc = jaToVnDict[charOccupation] || charOccupation;
      result = result.replace(/kỹ sư/g, vnOcc);
      const romOcc = jaToRomajiDict[charOccupation] || charOccupation;
      result = result.replace(/Enjinia/g, romOcc.charAt(0).toUpperCase() + romOcc.slice(1));
      result = result.replace(/enjinia/g, romOcc);
    }

    // 4. Substitute Organization
    if (opts?.organizations && opts.organizations.length > 0) {
      const romOrg = jaToRomajiDict[charOrganization] || charOrganization;
      result = result.replace(/FPT/g, romOrg);
    }

    // 5. Unmask Country/Nationality with selected values
    if (opts?.countries && opts.countries.length > 0) {
      result = result.replace(/__MASK_COUNTRY_JA__/g, charCountry);
      const vnCountry = jaToVnDict[charCountry] || charCountry;
      const vnCountryFull = jaToVnDict[charCountry] ? 'nước ' + jaToVnDict[charCountry] : charCountry;
      result = result.replace(/__MASK_COUNTRY_VN_FULL__/g, vnCountryFull);
      result = result.replace(/__MASK_COUNTRY_VN__/g, vnCountry);
      const romCountry = jaToRomajiDict[charCountry] || charCountry;
      result = result.replace(/__MASK_COUNTRY_ROM__/g, romCountry);
    }

    return result;
  };

  // Toggle Topic Collapse/Expand Helper
  const toggleTopic = (topicName: string) => {
    setCollapsedTopics((prev) => ({
      ...prev,
      [topicName]: !prev[topicName],
    }));
  };

  // Group Dialogue Items by Topic
  const groupedDialogues = useMemo(() => {
    const groups: { topic: string; items: DialogueItem[] }[] = [];
    dialogueItems.forEach((item) => {
      const topicName = item.topic || 'Chủ đề chung';
      let group = groups.find((g) => g.topic === topicName);
      if (!group) {
        group = { topic: topicName, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    });
    return groups;
  }, [dialogueItems]);

  // Convert Kanji to Hiragana Helper for Dialogue Script Mode
  const convertKanjiToHira = (text: string) => {
    if (!text) return '';
    let result = text;
    const kanjiMap: Record<string, string> = {
      '私は': 'わたしは',
      '私': 'わたし',
      '学生': 'がくせい',
      '教師': 'きょうし',
      '何歳': 'なんさい',
      'おいくつ（何歳）': 'おいくつ（なんさい）',
      '歳': 'さい',
      'あの人': 'あのひと',
      'ブラジル人': 'ブラジルじん',
      'アメリカ人': 'アメリカじん',
      '日本人': 'にほんじん',
      'ベトナム人': 'ベトナムじん',
      'イギリス人': 'イギリスじん',
      'フランス人': 'フランスじん',
      '失礼': 'しつれい',
      '名前': 'なまえ'
    };
    for (const [key, val] of Object.entries(kanjiMap)) {
      const regex = new RegExp(key, 'g');
      result = result.replace(regex, val);
    }
    return result;
  };

  // Việt hóa Từ loại
  const getWordTypeVietnamese = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'noun': return 'Danh từ';
      case 'verb': return 'Động từ';
      case 'adjective': return 'Tính từ';
      case 'adverb': return 'Trạng từ';
      case 'pronoun': return 'Đại từ';
      case 'particle': return 'Trợ từ';
      case 'conjunction': return 'Liên từ';
      case 'expression': return 'Thành ngữ';
      default: return type || 'Từ loại';
    }
  };

  // Tính % Đúng (Accuracy)
  const calculateAccuracy = (input: string, correct: string) => {
    const cleanInput = (input || '').trim().toLowerCase();
    const cleanCorrect = (correct || '').trim().toLowerCase();
    if (!cleanInput) return 0;
    if (cleanInput === cleanCorrect) return 100;
    
    // Handle parentheses options like "techou (techō)"
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

  // Text khích lệ
  const getEncouragementText = (pct: number) => {
    if (pct === 100) return 'Xuất sắc! 🎉';
    if (pct >= 80) return 'Tuyệt vời! 🌟';
    if (pct >= 50) return 'Cố lên một chút nữa! 💪';
    if (pct > 0) return 'Hãy cố gắng nhé! 👍';
    return 'Chưa đúng, hãy thử lại! ✏️';
  };

  // Sinh đề thi lặp lại ngẫu nhiên các từ cho đủ giới hạn câu hỏi
  const generatePracticeList = (sourceList: any[], limit: number) => {
    if (sourceList.length === 0) return [];
    
    let repeatedList: any[] = [];
    while (repeatedList.length < limit) {
      // Tráo ngẫu nhiên mỗi lượt lặp để phân phối từ đều đặn hơn
      const batch = [...sourceList].sort(() => Math.random() - 0.5);
      repeatedList = [...repeatedList, ...batch];
    }
    
    const selection = repeatedList.slice(0, limit);
    return selection.map((item, idx) => ({
      ...item,
      uniqueId: `${item.id}-${idx}-${Math.random().toString(36).substr(2, 9)}`
    }));
  };

  // Tráo đề (Shuffle)
  const handleShufflePractice = () => {
    if (currentSourceList.length === 0) return;

    const newList = generatePracticeList(currentSourceList, practiceLimit);
    setBaseShuffledList(newList);
    setPracticeList(newList);
    setPracticeAnswers({});
    setIsGraded(false);
    setVisibleAnswers({});
    setMessage('Đã xáo trộn danh sách câu hỏi! 🔀');
    setTimeout(() => setMessage(null), 3000);
  };

  // Thay đổi giới hạn câu hỏi
  const handleLimitChange = (val: string) => {
    const num = parseInt(val) || 0;
    const maxVal = practiceMode === 'vocab' ? vocabItems.length : kanjiItems.length;
    const cleanNum = Math.max(1, Math.min(num, maxVal));
    setPracticeLimit(cleanNum);
    if (currentSourceList.length > 0) {
      const newList = generatePracticeList(currentSourceList, cleanNum);
      setBaseShuffledList(newList);
      setPracticeList(newList);
      setPracticeAnswers({});
      setIsGraded(false);
      setVisibleAnswers({});
    }
  };

  useEffect(() => {
    if (currentTab === 'vocab') {
      loadVocabData();
      loadGrammarData();
    } else if (currentTab === 'kanji') {
      loadKanjiData();
      loadGrammarData();
    } else if (currentTab === 'grammar') {
      loadGrammarData();
    } else if (currentTab === 'flashcards') {
      loadVocabData();
      loadKanjiData();
    } else if (currentTab === 'kaiwa') {
      loadDialogueData();
    } else if (currentTab === 'practice') {
      loadVocabData();
      loadKanjiData();
    } else if (currentTab === 'cando') {
      loadCandoData();
    } else if (currentTab === 'culture') {
      loadCultureData();
    }
  }, [currentTab, loadVocabData, loadKanjiData, loadGrammarData, loadDialogueData, loadCandoData, loadCultureData]);

  // Load initial practice list once vocabulary or kanji is available
  useEffect(() => {
    if (currentTab === 'practice') {
      if (currentSourceList.length > 0 && baseShuffledList.length === 0) {
        const newList = generatePracticeList(currentSourceList, practiceLimit);
        setBaseShuffledList(newList);
        setPracticeList(newList);
      }
    }
  }, [currentTab, currentSourceList, practiceLimit, baseShuffledList.length]);

  // Reset practice state when practice mode or status filter changes
  useEffect(() => {
    setBaseShuffledList([]);
    setPracticeList([]);
    setPracticeAnswers({});
    setIsGraded(false);
    setVisibleAnswers({});
    setUseRomaji(false);
  }, [practiceMode, practiceFilterStatuses]);

  const activeList = useMemo(() => {
    const list = flashcardType === 'vocab' ? vocabItems : kanjiItems;
    const activeStatuses = Object.keys(flashcardFilterStatuses).filter(key => flashcardFilterStatuses[key]);
    if (activeStatuses.length === 0) {
      return list;
    }
    return list.filter(item => flashcardFilterStatuses[item.status]);
  }, [flashcardType, vocabItems, kanjiItems, flashcardFilterStatuses]);

  const totalItemsCount = activeList.length;
  const rangedList = activeList;

  useEffect(() => {
    if (currentTab === 'flashcards') {
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setIsShuffle(false);
      setShuffledIndices([]);
    }
  }, [flashcardType, totalItemsCount, currentTab]);

  const toggleShuffle = () => {
    const nextShuffle = !isShuffle;
    setIsShuffle(nextShuffle);
    if (nextShuffle && rangedList.length > 0) {
      const indices = Array.from({ length: rangedList.length }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setShuffledIndices(indices);
      setCurrentCardIndex(0);
    } else {
      setCurrentCardIndex(0);
    }
    setIsFlipped(false);
  };

  const getActiveCard = () => {
    if (rangedList.length === 0) return null;
    const index = isShuffle && shuffledIndices.length === rangedList.length
      ? shuffledIndices[currentCardIndex]
      : currentCardIndex;
    const safeIndex = Math.min(Math.max(0, index), rangedList.length - 1);
    return rangedList[safeIndex];
  };

  const activeCard = getActiveCard();

  const handleNextCard = () => {
    if (rangedList.length === 0) return;
    const nextFn = () => {
      setCurrentCardIndex((prev) => (prev + 1) % rangedList.length);
    };
    if (isFlipped) {
      setIsFlipped(false);
      setTimeout(nextFn, 150);
    } else {
      nextFn();
    }
  };

  const handlePrevCard = () => {
    if (rangedList.length === 0) return;
    const prevFn = () => {
      setCurrentCardIndex((prev) => (prev - 1 + rangedList.length) % rangedList.length);
    };
    if (isFlipped) {
      setIsFlipped(false);
      setTimeout(prevFn, 150);
    } else {
      prevFn();
    }
  };

  // Update study status
  const handleStatusChange = async (itemId: number, newStatus: 'not_learned' | 'learning' | 'mastered') => {
    try {
      await api.post('/api/user/progress', {
        item_type: 'vocabulary',
        item_id: itemId,
        status: newStatus
      });
      setVocabItems(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item));
      showNotification('Đã cập nhật trạng thái học tập!');
    } catch (error) {
      console.error('Failed to update status:', error);
      showNotification('Lỗi cập nhật trạng thái học tập.');
    }
  };

  // Update kanji study status
  const handleKanjiStatusChange = async (itemId: number, newStatus: 'not_learned' | 'learning' | 'mastered') => {
    try {
      await api.post('/api/user/progress', {
        item_type: 'kanji',
        item_id: itemId,
        status: newStatus
      });
      setKanjiItems(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item));
      showNotification('Đã cập nhật trạng thái học tập chữ Hán!');
    } catch (error) {
      console.error('Failed to update kanji status:', error);
      showNotification('Lỗi cập nhật trạng thái học tập.');
    }
  };

  // Update grammar study status
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

  const showNotification = (msg: string) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage(null);
    }, 2500);
  };

  const handleLevelChange = (selectedLevel: 'N5' | 'N4') => {
    const targetId = selectedLevel === 'N5' ? 1 : 26;
    router.push(`/lessons/${targetId}?tab=${currentTab}`);
  };

  const handleLessonChange = (newId: number) => {
    router.push(`/lessons/${newId}?tab=${currentTab}`);
  };

  const handleLogout = () => {
    api.clearAuth();
    router.replace('/login');
  };

  // Image Practice Handlers
  const generateImageQuizChoices = useCallback((currentQuestion: VocabItem, allEligible: VocabItem[]) => {
    if (!currentQuestion) return;
    
    const correct = currentQuestion.hiragana;
    const distractors = allEligible
      .filter(item => item.hiragana !== correct)
      .map(item => item.hiragana);
      
    const shuffledDistractors = [...distractors].sort(() => Math.random() - 0.5).slice(0, 3);
    const choices = [...shuffledDistractors, correct].sort(() => Math.random() - 0.5);
    setImageQuizChoices(choices);
  }, []);

  const startImagePractice = useCallback(() => {
    const eligible = vocabItems.filter(item => VOCAB_IMAGES[item.hiragana] || VOCAB_IMAGES[item.romaji]);
    if (eligible.length < 4) {
      setImageQuizList([]);
      return;
    }
    
    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    setImageQuizList(shuffled);
    setImageQuizIndex(0);
    setImageQuizScore(0);
    setImageQuizPlayed(0);
    setImageQuizSelectedAnswer(null);
    setImageQuizTypedAnswer('');
    setImageQuizChecked(false);
    setImageQuizFeedbackMsg('');
    
    generateImageQuizChoices(shuffled[0], eligible);
  }, [vocabItems, generateImageQuizChoices]);

  const checkImageAnswer = (answer: string) => {
    if (imageQuizChecked) return;
    
    const current = imageQuizList[imageQuizIndex];
    const isCorrect = calculateAccuracy(answer, current.hiragana) === 100 || 
                      calculateAccuracy(answer, current.romaji) === 100;
                      
    setImageQuizChecked(true);
    setImageQuizPlayed(prev => prev + 1);
    
    if (isCorrect) {
      setImageQuizScore(prev => prev + 1);
      setImageQuizFeedbackMsg('Đúng rồi! 🎉');
      playAudio(current.hiragana);
    } else {
      setImageQuizFeedbackMsg(`Chưa đúng! Đáp án đúng là: ${current.hiragana} (${current.romaji})`);
      playAudio(current.hiragana);
    }
  };

  const nextImageQuiz = () => {
    const nextIdx = imageQuizIndex + 1;
    const eligible = vocabItems.filter(item => VOCAB_IMAGES[item.hiragana] || VOCAB_IMAGES[item.romaji]);
    if (nextIdx < imageQuizList.length && nextIdx < practiceLimit) {
      setImageQuizIndex(nextIdx);
      setImageQuizSelectedAnswer(null);
      setImageQuizTypedAnswer('');
      setImageQuizChecked(false);
      setImageQuizFeedbackMsg('');
      generateImageQuizChoices(imageQuizList[nextIdx], eligible);
    } else {
      setImageQuizChecked(true);
      setImageQuizFeedbackMsg(`Hoàn thành! Bạn đạt ${imageQuizScore}/${imageQuizPlayed} câu đúng.`);
    }
  };

  // Speedrun Practice Game Logic
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`vocab_speedrun_high_score_${selectedLessonId}_${speedrunDirection}`);
      if (saved) {
        setSpeedrunHighScore(parseInt(saved) || 0);
      } else {
        setSpeedrunHighScore(0);
      }
    }
  }, [selectedLessonId, speedrunDirection]);

  const nextSpeedrunQuestion = useCallback((currentScore: number) => {
    const randomQuestion = vocabItems[Math.floor(Math.random() * vocabItems.length)];
    setSpeedrunQuestion(randomQuestion);

    const distractors = vocabItems
      .filter(item => item.id !== randomQuestion.id)
      .map(item => speedrunDirection === 'ja-to-vi' ? item.vietnamese_meaning : item.hiragana);
    const shuffledDist = [...distractors].sort(() => Math.random() - 0.5).slice(0, 3);
    const correctOption = speedrunDirection === 'ja-to-vi' ? randomQuestion.vietnamese_meaning : randomQuestion.hiragana;
    const choices = [...shuffledDist, correctOption].sort(() => Math.random() - 0.5);
    setSpeedrunOptions(choices);

    const maxTime = Math.max(3, 10 - Math.floor(currentScore / 2) * 0.5);
    setSpeedrunMaxTime(maxTime);
    setSpeedrunTimeLeft(maxTime);

    if (speedrunTimerRef.current) {
      clearInterval(speedrunTimerRef.current);
    }

    const startTime = Date.now();
    speedrunTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, maxTime - elapsed);
      setSpeedrunTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(speedrunTimerRef.current);
        setSpeedrunGameOver(true);
        setSpeedrunActive(false);
        // Save high score
        const finalScore = speedrunScoreRef.current;
        const key = `vocab_speedrun_high_score_${selectedLessonId}_${speedrunDirection}`;
        const savedHigh = localStorage.getItem(key);
        const currentHigh = savedHigh ? parseInt(savedHigh) || 0 : 0;
        if (finalScore > currentHigh) {
          setSpeedrunHighScore(finalScore);
          localStorage.setItem(key, finalScore.toString());
          setMessage(`Kỷ lục mới: ${finalScore} điểm! 🎉`);
          setTimeout(() => setMessage(null), 2500);
        }
      }
    }, 50);
  }, [vocabItems, selectedLessonId, speedrunDirection]);

  const startSpeedrun = () => {
    if (vocabItems.length < 4) {
      showNotification('Không đủ từ vựng để chơi phản xạ.');
      return;
    }
    setSpeedrunActive(true);
    setSpeedrunGameOver(false);
    setSpeedrunScore(0);
    speedrunScoreRef.current = 0;
    setSpeedrunTimeLeft(10);
    setSpeedrunMaxTime(10);
    nextSpeedrunQuestion(0);
  };

  const stopSpeedrun = useCallback(() => {
    setSpeedrunActive(false);
    setSpeedrunGameOver(false);
    if (speedrunTimerRef.current) {
      clearInterval(speedrunTimerRef.current);
    }
  }, []);

  const checkSpeedrunAnswer = (selected: string) => {
    if (!speedrunQuestion) return;
    
    if (speedrunTimerRef.current) {
      clearInterval(speedrunTimerRef.current);
    }

    const isCorrect = speedrunDirection === 'ja-to-vi'
      ? calculateAccuracy(selected, speedrunQuestion.vietnamese_meaning) === 100
      : selected === speedrunQuestion.hiragana;
      
    if (isCorrect) {
      const nextScore = speedrunScoreRef.current + 1;
      speedrunScoreRef.current = nextScore;
      setSpeedrunScore(nextScore);
      playAudio(speedrunQuestion.hiragana);
      nextSpeedrunQuestion(nextScore);
    } else {
      setSpeedrunGameOver(true);
      setSpeedrunActive(false);
      // Save high score
      const finalScore = speedrunScoreRef.current;
      const key = `vocab_speedrun_high_score_${selectedLessonId}_${speedrunDirection}`;
      const savedHigh = localStorage.getItem(key);
      const currentHigh = savedHigh ? parseInt(savedHigh) || 0 : 0;
      if (finalScore > currentHigh) {
        setSpeedrunHighScore(finalScore);
        localStorage.setItem(key, finalScore.toString());
        setMessage(`Kỷ lục mới: ${finalScore} điểm! 🎉`);
        setTimeout(() => setMessage(null), 2500);
      }
    }
  };

  // Clean up speedrun timer on unmount
  useEffect(() => {
    return () => {
      if (speedrunTimerRef.current) {
        clearInterval(speedrunTimerRef.current);
      }
    };
  }, []);

  // Filtered lists matching current level
  const filteredLessons = lessons.filter(l => {
    if (isMarugoto) return true;
    if (level === 'N5') return l.id >= 1 && l.id <= 25;
    return l.id >= 26 && l.id <= 50;
  });


  // Set default roleplay options when lesson changes
  useEffect(() => {
    if (activeLesson && activeLesson.roleplay_options) {
      const opts = activeLesson.roleplay_options;
      setCharName(opts.names && opts.names.length > 0 ? opts.names[0] : 'ナム');
      setCharCountry(opts.countries && opts.countries.length > 0 ? opts.countries[0] : 'ベトナム');
      setCharOccupation(opts.occupations && opts.occupations.length > 0 ? opts.occupations[0] : 'エンジニア');
      setCharOrganization(opts.organizations && opts.organizations.length > 0 ? opts.organizations[0] : 'FPT');
    } else {
      // Defaults if not defined
      setCharName('ナム');
      setCharCountry('ベトナム');
      setCharOccupation('エンジニア');
      setCharOrganization('FPT');
    }
  }, [selectedLessonId, lessons, activeLesson]);

  // Group vocabulary by grammar pattern
  const groupedVocab = useMemo(() => {
    if (vocabItems.length === 0) return { groups: [], supplementalItems: [] };
    
    const groups = grammarItems.map((grammar, idx) => {
      const mapping = getGrammarVocabMapping(selectedLessonId, idx, vocabItems);
      return {
        grammarIndex: idx,
        grammarTitle: grammar.title,
        grammarMeaning: grammar.meaning,
        newItems: mapping.newItems,
        copiedItems: mapping.copiedItems,
        associatedItems: mapping.associatedItems,
      };
    });

    const associatedIds = new Set<number>();
    groups.forEach(g => {
      g.associatedItems.forEach(item => {
        associatedIds.add(item.id);
      });
    });

    const supplementalItems = vocabItems.filter(item => !associatedIds.has(item.id));

    return { groups, supplementalItems };
  }, [selectedLessonId, grammarItems, vocabItems]);

  // Group Kanji by grammar pattern
  const groupedKanji = useMemo(() => {
    if (kanjiItems.length === 0) return { groups: [], supplementalItems: [] };
    
    const groups = grammarItems.map((grammar, idx) => {
      const mapping = getGrammarKanjiMapping(selectedLessonId, idx, kanjiItems);
      return {
        grammarIndex: idx,
        grammarTitle: grammar.title,
        grammarMeaning: grammar.meaning,
        newItems: mapping.newItems,
        copiedItems: mapping.copiedItems,
        associatedItems: mapping.associatedItems,
      };
    });

    const associatedIds = new Set<number>();
    groups.forEach(g => {
      g.associatedItems.forEach(item => {
        associatedIds.add(item.id);
      });
    });

    const supplementalItems = kanjiItems.filter(item => !associatedIds.has(item.id));

    return { groups, supplementalItems };
  }, [selectedLessonId, grammarItems, kanjiItems]);

  // Filtered grouped vocabulary items
  const processedVocabGroups = useMemo(() => {
    const filterVocab = (item: VocabItem) => {
      const matchesSearch = 
        item.hiragana.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.romaji.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vietnamese_meaning.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;
      return matchesSearch && matchesStatus;
    };

    const filteredGroups = groupedVocab.groups.map(g => ({
      ...g,
      newItems: g.newItems.filter(filterVocab),
      copiedItems: g.copiedItems.filter(filterVocab),
    }));

    const filteredSupplemental = groupedVocab.supplementalItems.filter(filterVocab);

    const totalVisible = filteredGroups.reduce((acc, g) => acc + g.newItems.length + g.copiedItems.length, 0) + filteredSupplemental.length;

    return {
      groups: filteredGroups,
      supplemental: filteredSupplemental,
      totalVisible
    };
  }, [groupedVocab, searchQuery, statusFilter]);

  // Filtered grouped Kanji items
  const processedKanjiGroups = useMemo(() => {
    const filterKanji = (item: KanjiItem) => {
      const matchesSearch = 
        item.character.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sino_vietnamese.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vietnamese_meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.onyomi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kunyomi.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;
      return matchesSearch && matchesStatus;
    };

    const filteredGroups = groupedKanji.groups.map(g => ({
      ...g,
      newItems: g.newItems.filter(filterKanji),
      copiedItems: g.copiedItems.filter(filterKanji),
    }));

    const filteredSupplemental = groupedKanji.supplementalItems.filter(filterKanji);

    const totalVisible = filteredGroups.reduce((acc, g) => acc + g.newItems.length + g.copiedItems.length, 0) + filteredSupplemental.length;

    return {
      groups: filteredGroups,
      supplemental: filteredSupplemental,
      totalVisible
    };
  }, [groupedKanji, searchQuery, statusFilter]);

  // Vocab progress calculated dynamically
  const vocabTotalCount = vocabItems.length;
  const vocabMasteredCount = vocabItems.filter(v => v.status === 'mastered').length;
  const vocabLearningCount = vocabItems.filter(v => v.status === 'learning').length;
  const progressPercent = vocabTotalCount ? Math.round((vocabMasteredCount / vocabTotalCount) * 100) : 0;

  // Kanji progress calculated dynamically
  const kanjiTotalCount = kanjiItems.length;
  const kanjiMasteredCount = kanjiItems.filter(k => k.status === 'mastered').length;
  const kanjiLearningCount = kanjiItems.filter(k => k.status === 'learning').length;
  const kanjiProgressPercent = kanjiTotalCount ? Math.round((kanjiMasteredCount / kanjiTotalCount) * 100) : 0;

  // Filtered Grammar items
  const processedGrammar = grammarItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.structure.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vietnamese_explanation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Grammar progress calculated dynamically
  const grammarTotalCount = grammarItems.length;
  const grammarMasteredCount = grammarItems.filter(g => g.status === 'mastered').length;
  const grammarLearningCount = grammarItems.filter(g => g.status === 'learning').length;
  const grammarProgressPercent = grammarTotalCount ? Math.round((grammarMasteredCount / grammarTotalCount) * 100) : 0;

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
          {/* Logo Title & Mobile Close button */}
          <div className="flex items-center justify-between mb-8 px-2 shrink-0">
            <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              {activeCourse === 'marugoto' ? 'Marugoto A1' : 'Minna Nihongo'}
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-200 text-xl p-1 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Course Switcher */}
          <CourseSwitcher
            activeCourse={activeCourse}
            onSwitch={(course) => {
              localStorage.setItem('activeCourse', course);
              const nextLessonId = course === 'minna' ? 1 : 101;
              router.push(`/lessons/${nextLessonId}?tab=${currentTab}`);
            }}
          />

          {/* Navigation Menu */}
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
      <main className="flex-1 overflow-y-auto p-6 pt-20 md:p-8 lg:p-10 space-y-6 md:space-y-8">
        
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
              {currentTab === 'vocab' && 'TỪ VỰNG'}
              {currentTab === 'kanji' && 'CHỮ HÁN'}
              {currentTab === 'grammar' && 'NGỮ PHÁP'}
              {currentTab === 'flashcards' && 'THẺ NHỚ'}
              {currentTab === 'kaiwa' && 'LUYỆN NÓI'}
              {currentTab === 'practice' && 'LUYỆN TẬP'}
              {currentTab === 'cando' && 'TỰ ĐÁNH GIÁ (CAN-DO)'}
              {currentTab === 'culture' && 'VĂN HÓA & CUỘC SỐNG'}
              <span className="text-blue-400 ml-2">{lessonTitle}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Học liệu chi tiết bài học và cập nhật tiến độ học tập cá nhân
            </p>
          </div>
          
          {/* Level Switcher N5/N4 & Lesson Dropdown Selector */}
          <div className="flex items-center space-x-3 self-start sm:self-auto">
            {!isMarugoto && (
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
              onChange={(e) => handleLessonChange(parseInt(e.target.value))}
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

        {/* Tab content area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs">Đang tải dữ liệu học tập...</p>
          </div>
        ) : (
          <div>
            {currentTab === 'vocab' && (
              <div className="space-y-6">
                
                {/* 1. Vocabulary Progress Card */}
                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 space-y-2">
                    <h2 className="text-md font-bold text-slate-200 flex items-center space-x-2">
                      <span>📊</span>
                      <span>Tiến độ từ vựng bài học</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Thuộc từ vựng giúp bạn tăng cường từ vựng và tự tin Kaiwa
                    </p>
                  </div>

                  {/* Progress values */}
                  <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-slate-950/65 border border-slate-800/50 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-slate-400">Tổng từ vựng</span>
                      <span className="text-sm font-black text-slate-200">{vocabTotalCount} từ</span>
                    </div>

                    <div className="p-3 bg-slate-950/65 border border-slate-800/50 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-slate-400">Đã thuộc</span>
                      <span className="text-sm font-black text-emerald-400">{vocabMasteredCount} từ</span>
                    </div>

                    <div className="p-3 bg-slate-950/65 border border-slate-800/50 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-slate-400">Đang học</span>
                      <span className="text-sm font-black text-amber-400">{vocabLearningCount} từ</span>
                    </div>

                    {/* Progress Bar overall */}
                    <div className="sm:col-span-3 pt-2">
                      <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold mb-1.5">
                        <span className="text-slate-500 uppercase">Tỷ lệ hoàn thành</span>
                        <span className="text-blue-400">{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/40">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  {/* Search box */}
                  <div className="relative w-full sm:max-w-md">
                    <input
                      type="text"
                      placeholder="Tìm từ vựng, Romaji, Nghĩa Việt..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-base md:text-xs text-slate-200 focus:outline-none focus:border-blue-600/60"
                    />
                    <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm">🔍</span>
                  </div>

                  {/* Status filters */}
                  <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-900 w-full sm:w-auto shrink-0 overflow-x-auto max-w-full justify-between sm:justify-start">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        statusFilter === 'all'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Tất cả ({vocabTotalCount})
                    </button>
                    <button
                      onClick={() => setStatusFilter('not_learned')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        statusFilter === 'not_learned'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Chưa học ({vocabItems.filter(v => v.status === 'not_learned').length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('learning')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        statusFilter === 'learning'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Đang học ({vocabItems.filter(v => v.status === 'learning').length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('mastered')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        statusFilter === 'mastered'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Đã thuộc ({vocabItems.filter(v => v.status === 'mastered').length})
                    </button>
                  </div>
                </div>

                {/* 3. Vocabulary Cards Grouped by Grammar (Collapsible Accordions) */}
                {processedVocabGroups.totalVisible === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                    📭 Không tìm thấy từ vựng nào phù hợp với điều kiện tìm kiếm.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {processedVocabGroups.groups.map((group) => {
                      const idx = group.grammarIndex;
                      const isCollapsedBool = collapsedVocabSections[idx.toString()] === true;
                      
                      // Skip rendering this accordion if total items inside is 0 and we are searching/filtering
                      if (group.newItems.length === 0 && group.copiedItems.length === 0 && (searchQuery || statusFilter !== 'all')) {
                        return null;
                      }

                      return (
                        <div key={idx} className="space-y-4 border border-slate-800/60 rounded-2xl p-4 bg-slate-900/10 backdrop-blur-md">
                          {/* Accordion Header */}
                          <div 
                            onClick={() => toggleVocabSection(idx.toString())}
                            className="flex flex-col md:flex-row md:items-center justify-between py-3.5 px-4 rounded-xl bg-slate-950/40 border border-slate-900 cursor-pointer hover:bg-slate-900/60 hover:border-slate-800 transition-all select-none gap-3 group/header active:scale-[0.995]"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-lg shrink-0 text-blue-400 group-hover/header:scale-110 transition-transform">
                                {isCollapsedBool ? '📁' : '📂'}
                              </span>
                              <div className="min-w-0">
                                <h3 className="text-sm sm:text-base font-black text-slate-100 flex flex-wrap items-center gap-2">
                                  <span className="text-blue-500 text-xs uppercase tracking-wider">Mẫu {idx + 1}:</span>
                                  <span className="text-slate-200 truncate">{group.grammarTitle}</span>
                                  <div className="flex items-center gap-1.5 ml-1 sm:ml-2">
                                    <span className="px-1.5 py-0.2 bg-emerald-950/80 border border-emerald-900/40 text-[9px] font-black text-emerald-400 rounded-md">
                                      {group.newItems.length} mới
                                    </span>
                                    {group.copiedItems.length > 0 && (
                                      <span className="px-1.5 py-0.2 bg-blue-950/80 border border-blue-900/40 text-[9px] font-black text-blue-400 rounded-md">
                                        {group.copiedItems.length} trùng lặp
                                      </span>
                                    )}
                                  </div>
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5 truncate italic">
                                  {group.grammarMeaning || 'Không có dịch nghĩa'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end">
                              {/* Luyện tập button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/roadmap/practice?lessonId=${selectedLessonId}&grammarIndex=${idx}&from=lessons`);
                                }}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                              >
                                <span>⚡</span> Luyện thế câu
                              </button>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">
                                  {isCollapsedBool ? 'Mở rộng' : 'Thu gọn'}
                                </span>
                                <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center text-xs font-black text-blue-400">
                                  {isCollapsedBool ? '▼' : '▲'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Accordion Content */}
                          {!isCollapsedBool && (
                            <div className="space-y-4 pt-2">
                              {/* Warning overlaps / Copied Items */}
                              {group.copiedItems.length > 0 && (
                                <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl space-y-1.5">
                                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    Các từ vựng đã được học ở phần trước nhưng được dùng ở mẫu này:
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {group.copiedItems.map((c) => (
                                      <span 
                                        key={c.id} 
                                        onClick={() => playAudio(c.hiragana)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-950/80 border border-slate-850 hover:border-slate-700 text-xs rounded-lg text-slate-350 cursor-pointer active:scale-95 transition-all" 
                                        title={`${c.vietnamese_meaning} - Nhấp để nghe`}
                                      >
                                        <span>{c.hiragana}</span>
                                        <span className="text-[10px] text-slate-500">({c.romaji})</span>
                                        <span className="text-[10px] text-blue-450">🔊</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Cards Grid for new items */}
                              {group.newItems.length === 0 ? (
                                <div className="text-center py-6 text-slate-550 text-xs border border-dashed border-slate-850 rounded-xl bg-slate-900/5">
                                  📝 Không có từ vựng mới nào trong mẫu ngữ pháp này.
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {group.newItems.map((item) => {
                                    let borderClass = 'border-slate-850';
                                    let statusBg = 'bg-slate-950/40';
                                    let shadowClass = '';
                                    if (item.status === 'mastered') {
                                      borderClass = 'border-emerald-800/30 hover:border-emerald-600/50';
                                      statusBg = 'bg-emerald-950/5';
                                      shadowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.02)]';
                                    } else if (item.status === 'learning') {
                                      borderClass = 'border-amber-800/30 hover:border-amber-600/50';
                                      statusBg = 'bg-amber-950/5';
                                      shadowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.02)]';
                                    }

                                    return (
                                      <div
                                        key={item.id}
                                        className={`p-4 rounded-xl border backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.005] hover:bg-slate-900/20 ${borderClass} ${statusBg} ${shadowClass}`}
                                      >
                                        <div>
                                          {/* Card Top Row */}
                                          <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-2.5">
                                            <span className="px-2 py-0.5 bg-slate-950/80 border border-slate-800 text-[10px] font-bold uppercase rounded-md text-blue-400">
                                              {item.word_type === 'noun' && 'Danh từ'}
                                              {item.word_type === 'pronoun' && 'Đại từ'}
                                              {item.word_type === 'verb' && 'Động từ'}
                                              {item.word_type === 'adjective' && 'Tính từ'}
                                              {item.word_type === 'greeting' && 'Chào hỏi'}
                                              {!['noun','pronoun','verb','adjective','greeting'].includes(item.word_type) && (item.word_type || 'Từ vựng')}
                                            </span>

                                            <select
                                              value={item.status}
                                              onChange={(e) => handleStatusChange(item.id, e.target.value as any)}
                                              className={`bg-slate-950 border rounded-lg px-2 py-0.5 text-[11px] font-bold focus:outline-none cursor-pointer transition-colors duration-200 ${
                                                item.status === 'mastered'
                                                  ? 'border-emerald-900 text-emerald-400 bg-emerald-950/20'
                                                  : item.status === 'learning'
                                                  ? 'border-amber-900 text-amber-400 bg-amber-950/20'
                                                  : 'border-slate-800 text-slate-400 bg-slate-950'
                                              }`}
                                            >
                                              <option value="not_learned" className="bg-[#0b1329] text-slate-400">⚪ Chưa học</option>
                                              <option value="learning" className="bg-[#0b1329] text-amber-400">🟡 Đang học</option>
                                              <option value="mastered" className="bg-[#0b1329] text-emerald-400">🟢 Đã thuộc</option>
                                            </select>
                                          </div>

                                          {/* Card Japanese Word */}
                                          <div className="flex items-center space-x-2.5 mb-3">
                                            <h4 className="text-lg sm:text-xl font-black text-white tracking-wide">
                                              {item.hiragana}
                                            </h4>
                                            <button
                                              onClick={() => playAudio(item.hiragana)}
                                              className="p-1 rounded-lg bg-slate-950 border border-slate-850 text-xs text-slate-350 hover:text-blue-400 hover:border-blue-800/40 transition-colors cursor-pointer active:scale-90"
                                              title="Nghe phát âm"
                                            >
                                              🔊
                                            </button>
                                          </div>

                                          {/* Card translations */}
                                          <div className="space-y-0.5 mb-3 text-[11px] sm:text-xs">
                                            <p className="text-slate-400 font-semibold tracking-wide">
                                              <span className="text-[9px] text-slate-500 uppercase mr-1">Romaji:</span>
                                              {item.romaji}
                                            </p>
                                            <p className="text-slate-200 font-bold">
                                              <span className="text-[9px] text-slate-500 uppercase mr-1">Nghĩa:</span>
                                              {item.vietnamese_meaning}
                                            </p>
                                          </div>

                                          {/* Mnemonic card */}
                                          {item.mnemonic_tip && (
                                            <div className="mb-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-900/60 flex items-start space-x-2">
                                              <span className="text-xs shrink-0">💡</span>
                                              <div className="space-y-0.5">
                                                <span className="block text-[8px] font-black text-indigo-400 uppercase tracking-wider">Mẹo ghi nhớ</span>
                                                <p className="text-[10px] text-slate-400 leading-relaxed">{item.mnemonic_tip}</p>
                                              </div>
                                            </div>
                                          )}

                                          {/* Sentence example section */}
                                          {item.japanese_example && (
                                            <div className="pt-2.5 border-t border-slate-900/60 space-y-1">
                                              <div className="flex items-center space-x-1.5">
                                                <span className="text-[8px] font-black text-emerald-400 bg-emerald-950/20 border border-emerald-900/20 px-1.5 py-0.2 rounded uppercase tracking-wider">Ví dụ</span>
                                                <button
                                                  onClick={() => playAudio(item.japanese_example)}
                                                  className="text-[9px] text-slate-550 hover:text-blue-400 cursor-pointer"
                                                  title="Nghe câu ví dụ"
                                                >
                                                  🔊 Nghe
                                                </button>
                                              </div>
                                              <p className="text-[11px] sm:text-xs text-slate-200 font-medium leading-relaxed">
                                                {item.japanese_example}
                                              </p>
                                              <p className="text-[10px] text-slate-400 italic leading-relaxed">
                                                {item.example_meaning}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Supplemental Words Accordion */}
                    {processedVocabGroups.supplemental.length > 0 && (() => {
                      const isCollapsedBool = collapsedVocabSections['supplemental'] === true;
                      return (
                        <div className="space-y-4 border border-slate-800/60 rounded-2xl p-4 bg-slate-900/10 backdrop-blur-md">
                          {/* Accordion Header */}
                          <div 
                            onClick={() => toggleVocabSection('supplemental')}
                            className="flex items-center justify-between py-3.5 px-4 rounded-xl bg-slate-950/40 border border-slate-900 cursor-pointer hover:bg-slate-900/60 hover:border-slate-800 transition-all select-none group/header active:scale-[0.995]"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg shrink-0 text-blue-400 group-hover/header:scale-110 transition-transform">
                                {isCollapsedBool ? '📁' : '📂'}
                              </span>
                              <div>
                                <h3 className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-2">
                                  <span className="text-slate-200">Từ vựng bổ sung / Khác</span>
                                  <span className="px-1.5 py-0.2 bg-slate-900 border border-slate-800 text-[9px] font-black text-slate-450 rounded-md">
                                    {processedVocabGroups.supplemental.length} từ
                                  </span>
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5 italic">
                                  Các từ vựng bổ sung bổ trợ thêm cho bài học
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/roadmap/practice?lessonId=${selectedLessonId}&grammarIndex=${grammarItems.length}&from=lessons`);
                                }}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                              >
                                <span>⚡</span> Luyện thế câu
                              </button>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">
                                  {isCollapsedBool ? 'Mở rộng' : 'Thu gọn'}
                                </span>
                                <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center text-xs font-black text-blue-400">
                                  {isCollapsedBool ? '▼' : '▲'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Accordion Content */}
                          {!isCollapsedBool && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                              {processedVocabGroups.supplemental.map((item) => {
                                let borderClass = 'border-slate-850';
                                let statusBg = 'bg-slate-950/40';
                                let shadowClass = '';
                                if (item.status === 'mastered') {
                                  borderClass = 'border-emerald-800/30 hover:border-emerald-600/50';
                                  statusBg = 'bg-emerald-950/5';
                                  shadowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.02)]';
                                } else if (item.status === 'learning') {
                                  borderClass = 'border-amber-800/30 hover:border-amber-600/50';
                                  statusBg = 'bg-amber-950/5';
                                  shadowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.02)]';
                                }

                                return (
                                  <div
                                    key={item.id}
                                    className={`p-4 rounded-xl border backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.005] hover:bg-slate-900/20 ${borderClass} ${statusBg} ${shadowClass}`}
                                  >
                                    <div>
                                      {/* Card Top Row */}
                                      <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-2.5">
                                        <span className="px-2 py-0.5 bg-slate-950/80 border border-slate-800 text-[10px] font-bold uppercase rounded-md text-blue-400">
                                          {item.word_type === 'noun' && 'Danh từ'}
                                          {item.word_type === 'pronoun' && 'Đại từ'}
                                          {item.word_type === 'verb' && 'Động từ'}
                                          {item.word_type === 'adjective' && 'Tính từ'}
                                          {item.word_type === 'greeting' && 'Chào hỏi'}
                                          {!['noun','pronoun','verb','adjective','greeting'].includes(item.word_type) && (item.word_type || 'Từ vựng')}
                                        </span>

                                        <select
                                          value={item.status}
                                          onChange={(e) => handleStatusChange(item.id, e.target.value as any)}
                                          className={`bg-slate-950 border rounded-lg px-2 py-0.5 text-[11px] font-bold focus:outline-none cursor-pointer transition-colors duration-200 ${
                                            item.status === 'mastered'
                                              ? 'border-emerald-900 text-emerald-400 bg-emerald-950/20'
                                              : item.status === 'learning'
                                              ? 'border-amber-900 text-amber-400 bg-amber-950/20'
                                              : 'border-slate-800 text-slate-400 bg-slate-950'
                                          }`}
                                        >
                                          <option value="not_learned" className="bg-[#0b1329] text-slate-400">⚪ Chưa học</option>
                                          <option value="learning" className="bg-[#0b1329] text-amber-400">🟡 Đang học</option>
                                          <option value="mastered" className="bg-[#0b1329] text-emerald-400">🟢 Đã thuộc</option>
                                        </select>
                                      </div>

                                      {/* Card Japanese Word */}
                                      <div className="flex items-center space-x-2.5 mb-3">
                                        <h4 className="text-lg sm:text-xl font-black text-white tracking-wide">
                                          {item.hiragana}
                                        </h4>
                                        <button
                                          onClick={() => playAudio(item.hiragana)}
                                          className="p-1 rounded-lg bg-slate-950 border border-slate-850 text-xs text-slate-350 hover:text-blue-400 hover:border-blue-800/40 transition-colors cursor-pointer active:scale-90"
                                          title="Nghe phát âm"
                                        >
                                          🔊
                                        </button>
                                      </div>

                                      {/* Card translations */}
                                      <div className="space-y-0.5 mb-3 text-[11px] sm:text-xs">
                                        <p className="text-slate-400 font-semibold tracking-wide">
                                          <span className="text-[9px] text-slate-500 uppercase mr-1">Romaji:</span>
                                          {item.romaji}
                                        </p>
                                        <p className="text-slate-200 font-bold">
                                          <span className="text-[9px] text-slate-500 uppercase mr-1">Nghĩa:</span>
                                          {item.vietnamese_meaning}
                                        </p>
                                      </div>

                                      {/* Mnemonic card */}
                                      {item.mnemonic_tip && (
                                        <div className="mb-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-900/60 flex items-start space-x-2">
                                          <span className="text-xs shrink-0">💡</span>
                                          <div className="space-y-0.5">
                                            <span className="block text-[8px] font-black text-indigo-400 uppercase tracking-wider">Mẹo ghi nhớ</span>
                                            <p className="text-[10px] text-slate-400 leading-relaxed">{item.mnemonic_tip}</p>
                                          </div>
                                        </div>
                                      )}

                                      {/* Sentence example section */}
                                      {item.japanese_example && (
                                        <div className="pt-2.5 border-t border-slate-900/60 space-y-1">
                                          <div className="flex items-center space-x-1.5">
                                            <span className="text-[8px] font-black text-emerald-400 bg-emerald-950/20 border border-emerald-900/20 px-1.5 py-0.2 rounded uppercase tracking-wider">Ví dụ</span>
                                            <button
                                              onClick={() => playAudio(item.japanese_example)}
                                              className="text-[9px] text-slate-550 hover:text-blue-400 cursor-pointer"
                                              title="Nghe câu ví dụ"
                                            >
                                              🔊 Nghe
                                            </button>
                                          </div>
                                          <p className="text-[11px] sm:text-xs text-slate-200 font-medium leading-relaxed">
                                            {item.japanese_example}
                                          </p>
                                          <p className="text-[10px] text-slate-405 italic leading-relaxed">
                                            {item.example_meaning}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {currentTab === 'kanji' && (
              <div className="space-y-6">
                
                {/* 1. Kanji Progress Card */}
                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 space-y-2">
                    <h2 className="text-md font-bold text-slate-200 flex items-center space-x-2">
                      <span>📊</span>
                      <span>Tiến độ chữ Hán bài học</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Học chữ Hán giúp bạn làm chủ mặt chữ và hiểu sâu nghĩa từ vựng
                    </p>
                  </div>

                  {/* Progress values */}
                  <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-slate-950/65 border border-slate-800/50 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-slate-400">Tổng chữ Hán</span>
                      <span className="text-sm font-black text-slate-200">{kanjiTotalCount} chữ</span>
                    </div>

                    <div className="p-3 bg-slate-950/65 border border-slate-800/50 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-slate-400">Đã thuộc</span>
                      <span className="text-sm font-black text-emerald-400">{kanjiMasteredCount} chữ</span>
                    </div>

                    <div className="p-3 bg-slate-950/65 border border-slate-800/50 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-slate-400">Đang học</span>
                      <span className="text-sm font-black text-amber-400">{kanjiLearningCount} chữ</span>
                    </div>

                    {/* Progress Bar overall */}
                    <div className="sm:col-span-3 pt-2">
                      <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold mb-1.5">
                        <span className="text-slate-500 uppercase">Tỷ lệ hoàn thành</span>
                        <span className="text-blue-400">{kanjiProgressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/40">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${kanjiProgressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Search & Filters */}
                <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 items-center w-full xl:w-auto flex-1">
                    {/* Search box */}
                    <div className="relative w-full sm:max-w-md">
                      <input
                        type="text"
                        placeholder="Tìm chữ Hán, Hán Việt, Nghĩa, Onyomi, Kunyomi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-base md:text-xs text-slate-200 focus:outline-none focus:border-blue-600/60"
                      />
                      <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm">🔍</span>
                    </div>

                    {/* Học bộ thủ button */}
                    <button
                      onClick={() => router.push('/radicals')}
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl border border-emerald-500/20 shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <span>🉐</span> Ôn bộ thủ
                    </button>

                    {/* Toggle hiển thị bộ thủ */}
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-400 cursor-pointer shrink-0 select-none hover:text-slate-200 py-1 sm:py-0">
                      <input
                        type="checkbox"
                        checked={showRadicals}
                        onChange={(e) => setShowRadicals(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-800 text-blue-650 bg-slate-950 focus:ring-blue-600 cursor-pointer"
                      />
                      <span>Hiển thị bộ thủ</span>
                    </label>
                  </div>

                  {/* Status filters */}
                  <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-900 w-full sm:w-auto shrink-0 overflow-x-auto max-w-full justify-between sm:justify-start">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        statusFilter === 'all'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Tất cả ({kanjiTotalCount})
                    </button>
                    <button
                      onClick={() => setStatusFilter('not_learned')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        statusFilter === 'not_learned'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Chưa học ({kanjiItems.filter(v => v.status === 'not_learned').length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('learning')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        statusFilter === 'learning'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Đang học ({kanjiItems.filter(v => v.status === 'learning').length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('mastered')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        statusFilter === 'mastered'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Đã thuộc ({kanjiItems.filter(v => v.status === 'mastered').length})
                    </button>
                  </div>
                </div>

                {/* 2.5 Grammar Filter Indicator / Already Learned Kanji Notice */}
                {/* 3. Kanji Cards Grouped by Grammar (Collapsible Accordions) */}
                {processedKanjiGroups.totalVisible === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                    📭 Không tìm thấy chữ Hán nào phù hợp với điều kiện tìm kiếm.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {processedKanjiGroups.groups.map((group) => {
                      const idx = group.grammarIndex;
                      const isCollapsedBool = collapsedKanjiSections[idx.toString()] === true;

                      // Skip rendering if search/filter is active and no items are inside
                      if (group.newItems.length === 0 && group.copiedItems.length === 0 && (searchQuery || statusFilter !== 'all')) {
                        return null;
                      }

                      return (
                        <div key={idx} className="space-y-4 border border-slate-800/60 rounded-2xl p-4 bg-slate-900/10 backdrop-blur-md">
                          {/* Accordion Header */}
                          <div 
                            onClick={() => toggleKanjiSection(idx.toString())}
                            className="flex flex-col md:flex-row md:items-center justify-between py-3.5 px-4 rounded-xl bg-slate-950/40 border border-slate-900 cursor-pointer hover:bg-slate-900/60 hover:border-slate-800 transition-all select-none gap-3 group/header active:scale-[0.995]"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-lg shrink-0 text-blue-400 group-hover/header:scale-110 transition-transform">
                                {isCollapsedBool ? '📁' : '📂'}
                              </span>
                              <div className="min-w-0">
                                <h3 className="text-sm sm:text-base font-black text-slate-100 flex flex-wrap items-center gap-2">
                                  <span className="text-blue-500 text-xs uppercase tracking-wider">Mẫu {idx + 1}:</span>
                                  <span className="text-slate-200 truncate">{group.grammarTitle}</span>
                                  <div className="flex items-center gap-1.5 ml-1 sm:ml-2">
                                    <span className="px-1.5 py-0.2 bg-emerald-950/80 border border-emerald-900/40 text-[9px] font-black text-emerald-400 rounded-md">
                                      {group.newItems.length} mới
                                    </span>
                                    {group.copiedItems.length > 0 && (
                                      <span className="px-1.5 py-0.2 bg-blue-950/80 border border-blue-900/40 text-[9px] font-black text-blue-400 rounded-md">
                                        {group.copiedItems.length} trùng lặp
                                      </span>
                                    )}
                                  </div>
                                </h3>
                                <p className="text-xs text-slate-450 mt-0.5 truncate italic">
                                  {group.grammarMeaning || 'Không có dịch nghĩa'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end">
                              {/* Luyện tập button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/roadmap/practice?lessonId=${selectedLessonId}&grammarIndex=${idx}&from=lessons`);
                                }}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                              >
                                <span>⚡</span> Luyện thế câu
                              </button>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">
                                  {isCollapsedBool ? 'Mở rộng' : 'Thu gọn'}
                                </span>
                                <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center text-xs font-black text-blue-400">
                                  {isCollapsedBool ? '▼' : '▲'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Accordion Content */}
                          {!isCollapsedBool && (
                            <div className="space-y-4 pt-2">
                              {/* Warning overlaps / Copied Items */}
                              {group.copiedItems.length > 0 && (
                                <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl space-y-1.5">
                                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    Các chữ Hán đã được học ở phần trước nhưng được dùng ở mẫu này:
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {group.copiedItems.map((c) => (
                                      <span 
                                        key={c.id} 
                                        onClick={() => playAudio(c.character)}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-950/80 border border-slate-850 hover:border-slate-700 text-sm font-black rounded-lg text-slate-300 cursor-pointer active:scale-95 transition-all" 
                                        title={`${c.vietnamese_meaning} - Nhấp để nghe`}
                                      >
                                        <span>{c.character}</span>
                                        <span className="text-[10px] text-blue-455">🔊</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Cards Grid for new items */}
                              {group.newItems.length === 0 ? (
                                <div className="text-center py-6 text-slate-550 text-xs border border-dashed border-slate-850 rounded-xl bg-slate-900/5">
                                  📝 Không có chữ Hán mới nào trong mẫu ngữ pháp này.
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {group.newItems.map((item) => {
                                    let borderClass = 'border-slate-850';
                                    let statusBg = 'bg-slate-950/40';
                                    let shadowClass = '';
                                    if (item.status === 'mastered') {
                                      borderClass = 'border-emerald-800/30 hover:border-emerald-600/50';
                                      statusBg = 'bg-emerald-950/5';
                                      shadowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.02)]';
                                    } else if (item.status === 'learning') {
                                      borderClass = 'border-amber-800/30 hover:border-amber-600/50';
                                      statusBg = 'bg-amber-950/5';
                                      shadowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.02)]';
                                    }

                                    return (
                                      <div
                                        key={item.id}
                                        className={`p-4 rounded-xl border backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.005] hover:bg-slate-900/20 ${borderClass} ${statusBg} ${shadowClass}`}
                                      >
                                        <div>
                                          {/* Card Top Row: stroke count and dropdown status */}
                                          <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-2.5">
                                            <span className="px-2 py-0.5 bg-slate-950/80 border border-slate-800 text-[10px] font-bold uppercase rounded-md text-blue-400">
                                              {item.stroke_count} nét
                                            </span>

                                            <select
                                              value={item.status}
                                              onChange={(e) => handleKanjiStatusChange(item.id, e.target.value as any)}
                                              className={`bg-slate-950 border rounded-lg px-2 py-0.5 text-[11px] font-bold focus:outline-none cursor-pointer transition-colors duration-200 ${
                                                item.status === 'mastered'
                                                  ? 'border-emerald-900 text-emerald-400 bg-emerald-950/20'
                                                  : item.status === 'learning'
                                                  ? 'border-amber-900 text-amber-400 bg-amber-950/20'
                                                  : 'border-slate-800 text-slate-400 bg-slate-950'
                                              }`}
                                            >
                                              <option value="not_learned" className="bg-[#0b1329] text-slate-400">⚪ Chưa học</option>
                                              <option value="learning" className="bg-[#0b1329] text-amber-400">🟡 Đang học</option>
                                              <option value="mastered" className="bg-[#0b1329] text-emerald-400">🟢 Đã thuộc</option>
                                            </select>
                                          </div>

                                          {/* Card Character & readings row */}
                                          <div className="flex items-start gap-3.5 mb-3">
                                            {/* Large Kanji Display */}
                                            <div className="w-16 h-16 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-center relative shrink-0">
                                              <span className="text-3xl font-black text-white select-none">
                                                {item.character}
                                              </span>
                                              <button
                                                onClick={() => playAudio(item.character)}
                                                className="absolute bottom-0.5 right-0.5 p-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-450 hover:text-blue-400 hover:border-blue-800/40 transition-colors cursor-pointer active:scale-90"
                                                title="Nghe phát âm"
                                              >
                                                🔊
                                              </button>
                                            </div>

                                            {/* Sino-Vietnamese & Vietnamese Meaning */}
                                            <div className="flex-1 space-y-0.5">
                                              <h4 className="text-base font-black text-emerald-400 uppercase tracking-wider">
                                                {item.sino_vietnamese}
                                              </h4>
                                              <p className="text-xs font-extrabold text-slate-100 leading-tight">
                                                {item.vietnamese_meaning}
                                              </p>
                                            </div>
                                          </div>

                                          {/* Onyomi & Kunyomi */}
                                          <div className="grid grid-cols-2 gap-3 mt-3 border-t border-slate-900 pb-2.5 pt-2.5 text-[11px]">
                                            <div className="space-y-0.5">
                                              <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Onyomi</span>
                                              <span className="font-semibold text-slate-350">{item.onyomi || '-'}</span>
                                            </div>
                                            <div className="space-y-0.5">
                                              <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Kunyomi</span>
                                              <span className="font-semibold text-slate-355">{item.kunyomi || '-'}</span>
                                            </div>
                                          </div>

                                          {/* Radicals mapping display */}
                                          {showRadicals && (
                                            <div className="mt-3 p-2.5 rounded-lg bg-teal-950/20 border border-teal-900/35 flex items-start space-x-2">
                                              <span className="text-xs shrink-0">🉐</span>
                                              <div className="space-y-0.5">
                                                <span className="block text-[8px] font-black text-teal-400 uppercase tracking-wider">Bộ thủ cấu thành</span>
                                                <p className="text-[10px] text-slate-300 leading-relaxed">
                                                  {getRadicalsString(item.character)}
                                                </p>
                                              </div>
                                            </div>
                                          )}

                                          {/* Mnemonic tip */}
                                          {item.mnemonic_tip && (
                                            <div className="mt-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-900/60 flex items-start space-x-2">
                                              <span className="text-xs shrink-0">💡</span>
                                              <div className="space-y-0.5">
                                                <span className="block text-[8px] font-black text-indigo-400 uppercase tracking-wider">Mẹo ghi nhớ</span>
                                                <p className="text-[10px] text-slate-450 leading-relaxed">{item.mnemonic_tip}</p>
                                              </div>
                                            </div>
                                          )}

                                          {/* Compounds section */}
                                          {item.compounds && (
                                            <div className="mt-3 pt-2.5 border-t border-slate-900 pb-1.5 space-y-1">
                                              <span className="text-[8px] font-black text-emerald-400 bg-emerald-950/20 border border-emerald-900/20 px-1.5 py-0.2 rounded uppercase tracking-wider inline-block">
                                                Từ ghép ví dụ
                                              </span>
                                              <p className="text-[11px] text-slate-350 leading-relaxed font-serif whitespace-pre-line">
                                                {item.compounds}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Supplemental Kanji Accordion */}
                    {processedKanjiGroups.supplemental.length > 0 && (() => {
                      const isCollapsedBool = collapsedKanjiSections['supplemental'] === true;
                      return (
                        <div className="space-y-4 border border-slate-800/60 rounded-2xl p-4 bg-slate-900/10 backdrop-blur-md">
                          {/* Accordion Header */}
                          <div 
                            onClick={() => toggleKanjiSection('supplemental')}
                            className="flex items-center justify-between py-3.5 px-4 rounded-xl bg-slate-950/40 border border-slate-900 cursor-pointer hover:bg-slate-900/60 hover:border-slate-800 transition-all select-none group/header active:scale-[0.995]"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg shrink-0 text-blue-400 group-hover/header:scale-110 transition-transform">
                                {isCollapsedBool ? '📁' : '📂'}
                              </span>
                              <div>
                                <h3 className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-2">
                                  <span className="text-slate-200">Chữ Hán bổ sung / Khác</span>
                                  <span className="px-1.5 py-0.2 bg-slate-900 border border-slate-800 text-[9px] font-black text-slate-450 rounded-md">
                                    {processedKanjiGroups.supplemental.length} chữ
                                  </span>
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5 italic">
                                  Các chữ Hán bổ sung hỗ trợ thêm cho bài học
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">
                                {isCollapsedBool ? 'Mở rộng' : 'Thu gọn'}
                              </span>
                              <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center text-xs font-black text-blue-400">
                                {isCollapsedBool ? '▼' : '▲'}
                              </span>
                            </div>
                          </div>

                          {/* Accordion Content */}
                          {!isCollapsedBool && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                              {processedKanjiGroups.supplemental.map((item) => {
                                let borderClass = 'border-slate-850';
                                let statusBg = 'bg-slate-950/40';
                                let shadowClass = '';
                                if (item.status === 'mastered') {
                                  borderClass = 'border-emerald-800/30 hover:border-emerald-600/50';
                                  statusBg = 'bg-emerald-950/5';
                                  shadowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.02)]';
                                } else if (item.status === 'learning') {
                                  borderClass = 'border-amber-800/30 hover:border-amber-600/50';
                                  statusBg = 'bg-amber-950/5';
                                  shadowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.02)]';
                                }

                                return (
                                  <div
                                    key={item.id}
                                    className={`p-4 rounded-xl border backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.005] hover:bg-slate-900/20 ${borderClass} ${statusBg} ${shadowClass}`}
                                  >
                                    <div>
                                      {/* Card Top Row */}
                                      <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-2.5">
                                        <span className="px-2 py-0.5 bg-slate-950/80 border border-slate-800 text-[10px] font-bold uppercase rounded-md text-blue-400">
                                          {item.stroke_count} nét
                                        </span>

                                        <select
                                          value={item.status}
                                          onChange={(e) => handleKanjiStatusChange(item.id, e.target.value as any)}
                                          className={`bg-slate-950 border rounded-lg px-2 py-0.5 text-[11px] font-bold focus:outline-none cursor-pointer transition-colors duration-200 ${
                                            item.status === 'mastered'
                                              ? 'border-emerald-900 text-emerald-400 bg-emerald-950/20'
                                              : item.status === 'learning'
                                              ? 'border-amber-900 text-amber-400 bg-amber-950/20'
                                              : 'border-slate-800 text-slate-400 bg-slate-950'
                                          }`}
                                        >
                                          <option value="not_learned" className="bg-[#0b1329] text-slate-400">⚪ Chưa học</option>
                                          <option value="learning" className="bg-[#0b1329] text-amber-400">🟡 Đang học</option>
                                          <option value="mastered" className="bg-[#0b1329] text-emerald-400">🟢 Đã thuộc</option>
                                        </select>
                                      </div>

                                      {/* Card Character & readings row */}
                                      <div className="flex items-start gap-3.5 mb-3">
                                        {/* Large Kanji Display */}
                                        <div className="w-16 h-16 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-center relative shrink-0">
                                          <span className="text-3xl font-black text-white select-none">
                                            {item.character}
                                          </span>
                                          <button
                                            onClick={() => playAudio(item.character)}
                                            className="absolute bottom-0.5 right-0.5 p-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-450 hover:text-blue-400 hover:border-blue-800/40 transition-colors cursor-pointer active:scale-90"
                                            title="Nghe phát âm"
                                          >
                                            🔊
                                          </button>
                                        </div>

                                        {/* Sino-Vietnamese & Vietnamese Meaning */}
                                        <div className="flex-1 space-y-0.5">
                                          <h4 className="text-base font-black text-emerald-400 uppercase tracking-wider">
                                            {item.sino_vietnamese}
                                          </h4>
                                          <p className="text-xs font-extrabold text-slate-100 leading-tight">
                                            {item.vietnamese_meaning}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Onyomi & Kunyomi */}
                                      <div className="grid grid-cols-2 gap-3 mt-3 border-t border-slate-900 pb-2.5 pt-2.5 text-[11px]">
                                        <div className="space-y-0.5">
                                          <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Onyomi</span>
                                          <span className="font-semibold text-slate-350">{item.onyomi || '-'}</span>
                                        </div>
                                        <div className="space-y-0.5">
                                          <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Kunyomi</span>
                                          <span className="font-semibold text-slate-355">{item.kunyomi || '-'}</span>
                                        </div>
                                      </div>

                                      {/* Radicals mapping display */}
                                      {showRadicals && (
                                        <div className="mt-3 p-2.5 rounded-lg bg-teal-950/20 border border-teal-900/35 flex items-start space-x-2">
                                          <span className="text-xs shrink-0">🉐</span>
                                          <div className="space-y-0.5">
                                            <span className="block text-[8px] font-black text-teal-400 uppercase tracking-wider">Bộ thủ cấu thành</span>
                                            <p className="text-[10px] text-slate-300 leading-relaxed">
                                              {getRadicalsString(item.character)}
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      {/* Mnemonic tip */}
                                      {item.mnemonic_tip && (
                                        <div className="mt-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-900/60 flex items-start space-x-2">
                                          <span className="text-xs shrink-0">💡</span>
                                          <div className="space-y-0.5">
                                            <span className="block text-[8px] font-black text-indigo-400 uppercase tracking-wider">Mẹo ghi nhớ</span>
                                            <p className="text-[10px] text-slate-450 leading-relaxed">{item.mnemonic_tip}</p>
                                          </div>
                                        </div>
                                      )}

                                      {/* Compounds section */}
                                      {item.compounds && (
                                        <div className="mt-3 pt-2.5 border-t border-slate-900 pb-1.5 space-y-1">
                                          <span className="text-[8px] font-black text-emerald-400 bg-emerald-950/20 border border-emerald-900/20 px-1.5 py-0.2 rounded uppercase tracking-wider inline-block">
                                            Từ ghép ví dụ
                                          </span>
                                          <p className="text-[11px] text-slate-355 leading-relaxed font-serif whitespace-pre-line">
                                            {item.compounds}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {currentTab === 'flashcards' && (
              <div className="space-y-6">
                
                {/* 1. Header & Controls Toolbar */}
                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md flex flex-col md:flex-row gap-5 items-center justify-between">
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    {/* Card Type Selector */}
                    <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-900 flex w-full sm:w-auto">
                      <button
                        onClick={() => setFlashcardType('vocab')}
                        className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5 whitespace-nowrap ${
                          flashcardType === 'vocab'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>📚</span>
                        <span>Từ vựng</span>
                      </button>
                      <button
                        onClick={() => setFlashcardType('kanji')}
                        className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5 whitespace-nowrap ${
                          flashcardType === 'kanji'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>🉐</span>
                        <span>Chữ Hán</span>
                      </button>
                    </div>

                    {/* Dropdown: Lọc trạng thái Flashcard */}
                    <div id="flashcards-dropdown-container" className="relative w-full sm:w-auto">
                      <button
                        onClick={() => setFlashcardDropdownOpen(!flashcardDropdownOpen)}
                        className="w-full sm:w-auto flex items-center justify-between sm:justify-start space-x-2 bg-slate-950/40 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-350 cursor-pointer hover:text-white transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <span>🔍 Lọc:</span>
                          <span className="text-blue-400">
                            {Object.values(flashcardFilterStatuses).filter(Boolean).length === 0
                              ? 'Học hết'
                              : Object.keys(flashcardFilterStatuses)
                                  .filter((k) => flashcardFilterStatuses[k])
                                  .map((k) =>
                                    k === 'not_learned'
                                      ? 'Chưa học'
                                      : k === 'learning'
                                      ? 'Đang học'
                                      : 'Đã thuộc'
                                  )
                                  .join(', ')}
                          </span>
                        </div>
                        <span className="text-[10px]">▼</span>
                      </button>
                      {flashcardDropdownOpen && (
                        <div className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 p-2 space-y-1">
                          <label className="flex items-center space-x-2 px-2 py-1.5 hover:bg-slate-850 rounded-lg cursor-pointer text-xs text-slate-300 hover:text-white transition-colors">
                            <input
                              type="checkbox"
                              checked={flashcardFilterStatuses.not_learned}
                              onChange={(e) =>
                                setFlashcardFilterStatuses((prev) => ({
                                  ...prev,
                                  not_learned: e.target.checked,
                                }))
                              }
                              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                            />
                            <span>Chưa học</span>
                          </label>
                          <label className="flex items-center space-x-2 px-2 py-1.5 hover:bg-slate-850 rounded-lg cursor-pointer text-xs text-slate-300 hover:text-white transition-colors">
                            <input
                              type="checkbox"
                              checked={flashcardFilterStatuses.learning}
                              onChange={(e) =>
                                setFlashcardFilterStatuses((prev) => ({
                                  ...prev,
                                  learning: e.target.checked,
                                }))
                              }
                              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                            />
                            <span>Đang học</span>
                          </label>
                          <label className="flex items-center space-x-2 px-2 py-1.5 hover:bg-slate-850 rounded-lg cursor-pointer text-xs text-slate-300 hover:text-white transition-colors">
                            <input
                              type="checkbox"
                              checked={flashcardFilterStatuses.mastered}
                              onChange={(e) =>
                                setFlashcardFilterStatuses((prev) => ({
                                  ...prev,
                                  mastered: e.target.checked,
                                }))
                              }
                              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                            />
                            <span>Đã thuộc</span>
                          </label>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Shuffle switch */}
                  <div className="flex items-center space-x-3 self-end md:self-auto">
                    <button
                      onClick={toggleShuffle}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center space-x-2 cursor-pointer active:scale-95 ${
                        isShuffle
                          ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>🔀</span>
                      <span>Tráo thẻ: {isShuffle ? 'Bật' : 'Tắt'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Centered Flipping Card */}
                {rangedList.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                    📭 Không có thẻ nào phù hợp với bộ lọc hiện tại. Vui lòng chọn lại bộ lọc trạng thái.
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    {/* The 3D Flip Card */}
                    <div 
                      className="w-full max-w-xl aspect-[1.6/1] md:aspect-[1.8/1] cursor-pointer relative" 
                      style={{ perspective: '1200px' }}
                      onClick={() => setIsFlipped(!isFlipped)}
                    >
                      <div 
                        className="relative w-full h-full duration-500 transition-transform" 
                        style={{ 
                          transformStyle: 'preserve-3d', 
                          transform: isFlipped ? 'rotateY(180deg)' : 'none' 
                        }}
                      >
                        {/* FRONT FACE (Clean centered word) */}
                        <div 
                          className="absolute inset-0 w-full h-full rounded-[32px] border border-blue-500/20 bg-gradient-to-b from-[#0e162e] to-[#080d1a] backdrop-blur-xl flex flex-col justify-between p-6 sm:p-8 text-center"
                          style={{ 
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            boxShadow: '0 0 35px rgba(59, 130, 246, 0.1)'
                          }}
                        >
                          {/* Top row */}
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>MẶT TRƯỚC</span>
                            <span>{flashcardType === 'vocab' ? 'Từ vựng' : 'Chữ Hán'}</span>
                          </div>

                          {/* Center character display */}
                          <div className="my-auto py-2">
                            {flashcardType === 'vocab' ? (
                              <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-wider select-none">
                                {(activeCard as VocabItem)?.hiragana}
                              </h3>
                            ) : (
                              <h3 className="text-5xl sm:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 select-none">
                                {(activeCard as KanjiItem)?.character}
                              </h3>
                            )}
                          </div>

                          {/* Bottom instruction */}
                          <span className="text-[10px] text-slate-500 font-bold tracking-wide uppercase select-none animate-pulse">
                            Click vào thẻ để lật xem đáp án 🔄
                          </span>
                        </div>

                        {/* BACK FACE (All details display) */}
                        <div 
                          className="absolute inset-0 w-full h-full rounded-[32px] border border-emerald-500/20 bg-gradient-to-b from-[#0e162e] to-[#080d1a] backdrop-blur-xl flex flex-col justify-between p-6 sm:p-8 text-left"
                          style={{ 
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            boxShadow: '0 0 35px rgba(16, 185, 129, 0.1)'
                          }}
                        >
                          {/* Vocab Back Face details */}
                          {flashcardType === 'vocab' ? (
                            <div className="h-full flex flex-col justify-between overflow-y-auto space-y-2.5 pr-1 select-none font-sans">
                              <div className="flex justify-between items-start border-b border-slate-800/40 pb-2">
                                <div>
                                  <h4 className="text-2xl font-black text-white">{(activeCard as VocabItem)?.hiragana}</h4>
                                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{(activeCard as VocabItem)?.romaji}</p>
                                </div>
                                <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[9px] font-bold text-blue-400 uppercase rounded">
                                  {(activeCard as VocabItem)?.word_type}
                                </span>
                              </div>

                              <div className="flex-1 space-y-2">
                                <p className="text-md font-bold text-slate-100">
                                  <span className="text-[9px] text-slate-500 uppercase font-black mr-2">Nghĩa Việt:</span>
                                  <span className="text-emerald-400 text-lg font-black">{(activeCard as VocabItem)?.vietnamese_meaning}</span>
                                </p>
                                
                                {(activeCard as VocabItem)?.mnemonic_tip && (
                                  <p className="text-[11px] text-slate-400 leading-normal bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 flex items-start gap-1">
                                    <span>💡</span>
                                    <span>{(activeCard as VocabItem)?.mnemonic_tip}</span>
                                  </p>
                                )}

                                {(activeCard as VocabItem)?.japanese_example && (
                                  <div className="text-xs pt-1 border-t border-slate-800/20">
                                    <span className="text-[9px] text-slate-500 font-black uppercase block mb-0.5">Ví dụ:</span>
                                    <p className="text-slate-200 font-serif leading-relaxed">{(activeCard as VocabItem)?.japanese_example}</p>
                                    <p className="text-slate-400 italic">{(activeCard as VocabItem)?.example_meaning}</p>
                                  </div>
                                )}
                              </div>

                              <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center mt-2">
                                Click để quay lại mặt trước 🔄
                              </div>
                            </div>
                          ) : (
                            /* Kanji Back Face details */
                            <div className="h-full flex flex-col justify-between overflow-y-auto space-y-2.5 pr-1 select-none font-sans">
                              <div className="flex justify-between items-start border-b border-slate-800/40 pb-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl font-black text-white shrink-0">
                                    {(activeCard as KanjiItem)?.character}
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-black text-emerald-400 uppercase">{(activeCard as KanjiItem)?.sino_vietnamese}</h4>
                                    <p className="text-xs text-slate-400 font-bold">{(activeCard as KanjiItem)?.vietnamese_meaning}</p>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[9px] font-bold text-blue-400 uppercase rounded">
                                  {(activeCard as KanjiItem)?.stroke_count} nét
                                </span>
                              </div>

                              <div className="flex-1 space-y-2 text-xs">
                                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/40 rounded-lg border border-slate-800/30">
                                  <div>
                                    <span className="block text-[8px] text-slate-500 font-bold uppercase">Onyomi:</span>
                                    <span className="font-semibold text-slate-300 font-sans">{(activeCard as KanjiItem)?.onyomi || '-'}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[8px] text-slate-500 font-bold uppercase">Kunyomi:</span>
                                    <span className="font-semibold text-slate-300 font-sans">{(activeCard as KanjiItem)?.kunyomi || '-'}</span>
                                  </div>
                                </div>

                                {showRadicals && (
                                  <div className="p-2 bg-teal-950/20 border border-teal-900/35 rounded-lg flex items-start gap-1">
                                    <span className="text-xs shrink-0">🉐</span>
                                    <div>
                                      <span className="block text-[8px] text-teal-400 font-bold uppercase">Bộ thủ cấu thành:</span>
                                      <span className="text-[10px] text-slate-200">
                                        {getRadicalsString((activeCard as KanjiItem)?.character)}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {(activeCard as KanjiItem)?.mnemonic_tip && (
                                  <p className="text-[11px] text-slate-400 leading-normal bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 flex items-start gap-1">
                                    <span>💡</span>
                                    <span>{(activeCard as KanjiItem)?.mnemonic_tip}</span>
                                  </p>
                                )}

                                {(activeCard as KanjiItem)?.compounds && (
                                  <div className="text-[11px] leading-relaxed">
                                    <span className="text-[8px] text-slate-500 font-black uppercase block">Từ ghép:</span>
                                    <p className="text-slate-300 whitespace-pre-line font-serif">{(activeCard as KanjiItem)?.compounds}</p>
                                  </div>
                                )}
                              </div>

                              <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center mt-2">
                                Click để quay lại mặt trước 🔄
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 3. Navigation Buttons */}
                    <div className="flex items-center justify-center space-x-4 mt-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevCard();
                        }}
                        className="p-3.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-blue-400 hover:border-blue-800/40 transition-all duration-300 cursor-pointer active:scale-90"
                        title="Thẻ trước đó"
                      >
                        ⬅️
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFlipped(!isFlipped);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all duration-300 cursor-pointer active:scale-95 flex items-center space-x-2"
                      >
                        <span>🔄</span>
                        <span>Lật thẻ</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const word = flashcardType === 'vocab' ? (activeCard as VocabItem)?.hiragana : (activeCard as KanjiItem)?.character;
                          if (word) playAudio(word);
                        }}
                        className="p-3.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-blue-400 hover:border-blue-800/40 transition-all duration-300 cursor-pointer active:scale-90"
                        title="Nghe giọng đọc"
                      >
                        🔊
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextCard();
                        }}
                        className="p-3.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-blue-400 hover:border-blue-800/40 transition-all duration-300 cursor-pointer active:scale-90"
                        title="Thẻ tiếp theo"
                      >
                        ➡️
                      </button>
                    </div>

                    {/* Page counter below controls */}
                    <div className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                      Thẻ {currentCardIndex + 1} / {rangedList.length}
                    </div>
                  </div>
                )}

              </div>
            )}

            {currentTab === 'kaiwa' && (
              <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
                {/* 1. Character Setup Card */}
                {hasRoleplay ? (
                  <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                      <h2 className="text-md font-bold text-slate-200 flex items-center space-x-2">
                        <span>🎭</span>
                        <span>Thiết lập nhân vật nhập vai</span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        Thay đổi thông tin nhân vật để tùy chỉnh hội thoại sinh động
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {/* Name selector */}
                      {activeLesson?.roleplay_options?.names && activeLesson.roleplay_options.names.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Tên Katakana</span>
                          <select
                            value={charName}
                            onChange={(e) => setCharName(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 cursor-pointer transition-all duration-200"
                          >
                            {activeLesson.roleplay_options.names.map(name => (
                              <option key={name} value={name}>{name} {jaToVnDict[name] ? `(${jaToVnDict[name]})` : ''}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Country selector */}
                      {activeLesson?.roleplay_options?.countries && activeLesson.roleplay_options.countries.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Quốc tịch</span>
                          <select
                            value={charCountry}
                            onChange={(e) => setCharCountry(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 cursor-pointer transition-all duration-200"
                          >
                            {activeLesson.roleplay_options.countries.map(country => (
                              <option key={country} value={country}>{country} {jaToVnDict[country] ? `(${jaToVnDict[country]})` : ''}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Occupation selector */}
                      {activeLesson?.roleplay_options?.occupations && activeLesson.roleplay_options.occupations.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Nghề nghiệp</span>
                          <select
                            value={charOccupation}
                            onChange={(e) => setCharOccupation(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 cursor-pointer transition-all duration-205"
                          >
                            {activeLesson.roleplay_options.occupations.map(job => (
                              <option key={job} value={job}>{job} {jaToVnDict[job] ? `(${jaToVnDict[job]})` : ''}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Organization selector */}
                      {activeLesson?.roleplay_options?.organizations && activeLesson.roleplay_options.organizations.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Tổ chức</span>
                          <select
                            value={charOrganization}
                            onChange={(e) => setCharOrganization(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 cursor-pointer transition-all duration-200"
                          >
                            {activeLesson.roleplay_options.organizations.map(org => (
                              <option key={org} value={org}>{org} {jaToVnDict[org] ? `(${jaToVnDict[org]})` : ''}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Switches toolbar */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-2 border-t border-slate-800/40 text-xs text-slate-300">
                      <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={showRomaji}
                          onChange={(e) => setShowRomaji(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                        />
                        <span className="font-medium">Hiện phiên âm Romaji</span>
                      </label>

                      <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={showVietnamese}
                          onChange={(e) => setShowVietnamese(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                        />
                        <span className="font-medium">Hiện bản dịch tiếng Việt</span>
                      </label>

                      <div className="flex items-center space-x-2.5">
                        <span className="font-medium">Chế độ hiển thị:</span>
                        <div className="bg-slate-950/60 p-0.5 rounded-lg border border-slate-800/60 flex">
                          <button
                            onClick={() => setScriptMode('kanji')}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                              scriptMode === 'kanji'
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Chữ Kanji
                          </button>
                          <button
                            onClick={() => setScriptMode('hiragana')}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                              scriptMode === 'hiragana'
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Hira / Kata
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Smaller toolbar when no roleplay exists */
                  <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl backdrop-blur-md flex flex-wrap items-center gap-3 sm:gap-6 justify-between text-xs text-slate-300">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                      <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={showRomaji}
                          onChange={(e) => setShowRomaji(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                        />
                        <span className="font-medium">Hiện phiên âm Romaji</span>
                      </label>

                      <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={showVietnamese}
                          onChange={(e) => setShowVietnamese(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                        />
                        <span className="font-medium">Hiện bản dịch tiếng Việt</span>
                      </label>
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <span className="font-medium">Chế độ hiển thị:</span>
                      <div className="bg-slate-950/60 p-0.5 rounded-lg border border-slate-800/60 flex">
                        <button
                          onClick={() => setScriptMode('kanji')}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                            scriptMode === 'kanji'
                              ? 'bg-blue-600 text-white shadow'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Chữ Kanji
                        </button>
                        <button
                          onClick={() => setScriptMode('hiragana')}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                            scriptMode === 'hiragana'
                              ? 'bg-blue-600 text-white shadow'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Hira / Kata
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Dialogue Chat Screen */}
                {groupedDialogues.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                    📭 Không tìm thấy kịch bản hội thoại nào cho bài học này.
                  </div>
                ) : (
                  <div className="bg-slate-950/30 border border-slate-900 rounded-2xl p-4 md:p-6 space-y-6 shadow-inner">
                    {groupedDialogues.map((group) => {
                      const isCollapsed = collapsedTopics[group.topic] || false;

                      return (
                        <div key={group.topic} className="space-y-4 w-full">
                          {/* Clickable Header for Collapse/Expand */}
                          <div 
                            onClick={() => toggleTopic(group.topic)}
                            className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-900/80 border border-slate-800/80 cursor-pointer hover:bg-slate-850/80 hover:border-slate-700/80 transition-all select-none shadow-md group active:scale-[0.99]"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-indigo-400 text-xs sm:text-sm animate-pulse">✨</span>
                              <span className="text-[11px] sm:text-xs font-black text-slate-200 tracking-wider uppercase">
                                {group.topic}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-slate-500 font-bold tracking-tight uppercase group-hover:text-slate-400">
                                {isCollapsed ? 'Nhấp để mở' : 'Nhấp để ẩn'}
                              </span>
                              <span className="text-xs text-indigo-400 font-black transition-transform duration-200">
                                {isCollapsed ? '▼' : '▲'}
                              </span>
                            </div>
                          </div>

                          {/* Dialogue list in this topic */}
                          {!isCollapsed && (
                            <div className="space-y-6 pt-2">
                              {group.items.map((item) => {
                                const isUser = item.speaker === 'ナム';
                                const displayName = isUser ? charName : item.speaker;
                                const displayJapanese = scriptMode === 'hiragana'
                                  ? convertKanjiToHira(substituteText(item.japanese))
                                  : substituteText(item.japanese);
                                const displayVietnamese = substituteText(item.vietnamese);
                                const displayRomaji = item.romaji && item.romaji !== "🙈 Đang ẩn (Tích chọn hiện)"
                                  ? substituteText(item.romaji)
                                  : "";

                                return (
                                  <div
                                    key={item.id}
                                    className={`flex items-start gap-3.5 max-w-[85%] ${
                                      isUser ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'
                                    }`}
                                  >
                                    {/* Cute avatar icon */}
                                    <div
                                      className="w-10 h-10 rounded-full border border-slate-800/80 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 shadow-md select-none"
                                      dangerouslySetInnerHTML={{ __html: getAvatarSvg(isUser ? (user?.id || 'user') : item.speaker) }}
                                    />

                                    {/* Bubble content */}
                                    <div className="space-y-1">
                                      <span className="text-xs font-black text-slate-400 px-1 block">
                                        {displayName}
                                      </span>
                                      
                                      <div
                                        className={`p-4 rounded-2xl relative shadow-lg text-left group ${
                                          isUser
                                            ? 'bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-800/40 text-slate-100 rounded-tr-none'
                                            : 'bg-slate-900/60 border border-slate-800/60 text-slate-200 rounded-tl-none'
                                        }`}
                                      >
                                        {/* Audio icon for easy speak */}
                                        <button
                                          onClick={() => playAudio(displayJapanese)}
                                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/50 text-slate-400 hover:text-blue-400 hover:border-blue-800/40 transition-all opacity-0 group-hover:opacity-100 duration-200 cursor-pointer active:scale-90"
                                          title="Phát âm câu thoại"
                                        >
                                          <span className="text-[10px] block leading-none">🔊</span>
                                        </button>

                                        <p className="text-sm sm:text-base font-medium leading-relaxed pr-6 select-all font-sans">
                                          {displayJapanese}
                                        </p>

                                        {showRomaji && displayRomaji && (
                                          <p className="text-[11px] text-slate-400 italic font-mono mt-1 border-t border-slate-800/30 pt-1">
                                            {displayRomaji}
                                          </p>
                                        )}

                                        {showVietnamese && displayVietnamese && (
                                          <p className="text-xs text-emerald-400/90 italic font-sans mt-1.5 border-t border-slate-800/30 pt-1">
                                            {displayVietnamese}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Completion status card */}
                    <div className="pt-4 flex justify-center">
                      <div className="bg-gradient-to-r from-emerald-950/20 to-teal-950/20 border border-emerald-900/30 px-6 py-4 rounded-xl text-center space-y-2 max-w-md">
                        <span className="text-2xl">🎉</span>
                        <h4 className="text-sm font-black text-slate-200">Hoàn thành đoạn kịch bản!</h4>
                        <p className="text-xs text-slate-400 leading-normal">
                          Hãy nghe đi nghe lại các câu thoại bằng nút phát âm 🔊 để rèn luyện khả năng phản xạ và nhại giọng (shadowing) nhé!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentTab === 'practice' && (
              <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
                {/* 1. Header Toolbar Controls */}
                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-3">
                    <h2 className="text-md font-bold text-slate-200 flex items-center space-x-2">
                      <span>✏️</span>
                      <span>Bảng Luyện Tập & Đảo Đề Tương Tác</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Kiểm tra kiến thức từ vựng và chữ Hán bằng cách nhập câu trả lời
                    </p>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Control settings */}
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Select practiceType: Tự luận / Luyện hình ảnh / Phản xạ nhanh */}
                      <div className="bg-slate-950/60 p-1 rounded-xl border border-slate-800 flex">
                        <button
                          onClick={() => setPracticeType('write')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                            practiceType === 'write'
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          ✍️ Tự luận
                        </button>
                        <button
                          onClick={() => {
                            setPracticeType('image');
                            startImagePractice();
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                            practiceType === 'image'
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          🖼️ Hình ảnh
                        </button>
                        <button
                          onClick={() => {
                            setPracticeType('speedrun');
                            stopSpeedrun();
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                            practiceType === 'speedrun'
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          ⚡ Phản xạ nhanh
                        </button>
                      </div>

                      {practiceType === 'write' && (
                        <>
                          {/* Select type: Vocab / Kanji */}
                          <div className="bg-slate-950/60 p-1 rounded-xl border border-slate-800 flex">
                            <button
                              onClick={() => setPracticeMode('vocab')}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                                practiceMode === 'vocab'
                                  ? 'bg-blue-600 text-white shadow-lg'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              Luyện Từ Vựng
                            </button>
                            <button
                              onClick={() => setPracticeMode('kanji')}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                                practiceMode === 'kanji'
                                  ? 'bg-blue-600 text-white shadow-lg'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              Luyện Chữ Hán
                            </button>
                          </div>

                          {/* Select direction: Việt-Nhật / Nhật-Việt */}
                          <div className="bg-slate-950/60 p-1 rounded-xl border border-slate-800 flex">
                            <button
                              onClick={() => setPracticeDirection('vi-to-ja')}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                                practiceDirection === 'vi-to-ja'
                                  ? 'bg-blue-600 text-white shadow-lg'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              🇻🇳 ➔ 🇯🇵
                            </button>
                            <button
                              onClick={() => setPracticeDirection('ja-to-vi')}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                                practiceDirection === 'ja-to-vi'
                                  ? 'bg-blue-600 text-white shadow-lg'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              🇯🇵 ➔ 🇻🇳
                            </button>
                          </div>
                        </>
                      )}

                      {practiceType !== 'speedrun' && (
                        <>
                          {/* Dropdown: Lọc trạng thái ôn tập */}
                          <div id="practice-dropdown-container" className="relative">
                            <button
                              onClick={() => setPracticeDropdownOpen(!practiceDropdownOpen)}
                              className="flex items-center space-x-2 bg-slate-950/40 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-350 cursor-pointer hover:text-white transition-colors"
                            >
                              <span>🔍 Lọc:</span>
                              <span className="text-blue-400">
                                {Object.values(practiceFilterStatuses).filter(Boolean).length === 0
                                  ? 'Học hết'
                                  : Object.keys(practiceFilterStatuses)
                                      .filter((k) => practiceFilterStatuses[k])
                                      .map((k) =>
                                        k === 'not_learned'
                                          ? 'Chưa học'
                                          : k === 'learning'
                                          ? 'Đang học'
                                          : 'Đã thuộc'
                                      )
                                      .join(', ')}
                              </span>
                              <span className="text-[10px]">▼</span>
                            </button>
                            {practiceDropdownOpen && (
                              <div className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 p-2 space-y-1">
                                <label className="flex items-center space-x-2 px-2 py-1.5 hover:bg-slate-850 rounded-lg cursor-pointer text-xs text-slate-300 hover:text-white transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={practiceFilterStatuses.not_learned}
                                    onChange={(e) =>
                                      setPracticeFilterStatuses((prev) => ({
                                        ...prev,
                                        not_learned: e.target.checked,
                                      }))
                                    }
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span>Chưa học</span>
                                </label>
                                <label className="flex items-center space-x-2 px-2 py-1.5 hover:bg-slate-850 rounded-lg cursor-pointer text-xs text-slate-300 hover:text-white transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={practiceFilterStatuses.learning}
                                    onChange={(e) =>
                                      setPracticeFilterStatuses((prev) => ({
                                        ...prev,
                                        learning: e.target.checked,
                                      }))
                                    }
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span>Đang học</span>
                                </label>
                                <label className="flex items-center space-x-2 px-2 py-1.5 hover:bg-slate-850 rounded-lg cursor-pointer text-xs text-slate-300 hover:text-white transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={practiceFilterStatuses.mastered}
                                    onChange={(e) =>
                                      setPracticeFilterStatuses((prev) => ({
                                        ...prev,
                                        mastered: e.target.checked,
                                      }))
                                    }
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span>Đã thuộc</span>
                                </label>
                              </div>
                            )}
                          </div>

                          {/* Number of questions input */}
                          <div className="flex items-center space-x-2 bg-slate-950/40 border border-slate-800 px-3.5 py-1.5 rounded-xl">
                            <span className="text-xs text-slate-400 font-bold">Số câu:</span>
                            <input
                              type="number"
                              value={practiceLimit}
                              onChange={(e) => handleLimitChange(e.target.value)}
                              className="w-12 bg-slate-900 border border-slate-700 rounded-lg text-center text-base md:text-xs font-extrabold text-white py-1 focus:outline-none focus:border-blue-500"
                            />
                            <span className="text-xs text-slate-500 font-bold">
                              / {currentSourceList.length}
                            </span>
                          </div>
                        </>
                      )}

                      {/* Romaji Checkbox (Việt-Nhật Vocab only) */}
                      {practiceType === 'write' && practiceMode === 'vocab' && practiceDirection === 'vi-to-ja' && (
                        <label className="flex items-center space-x-2 bg-slate-950/40 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-350 cursor-pointer hover:text-white transition-colors">
                          <input
                            type="checkbox"
                            checked={useRomaji}
                            onChange={(e) => setUseRomaji(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                          />
                          <span>Trả lời bằng Romaji</span>
                        </label>
                      )}
                    </div>

                    {/* Shuffle button */}
                    {practiceType === 'write' && (
                      <div className="flex items-center space-x-3 w-full lg:w-auto justify-end">
                        <button
                          onClick={handleShufflePractice}
                          className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-bold flex items-center space-x-2 shadow-md cursor-pointer active:scale-95"
                          title="Xáo trộn thứ tự câu hỏi"
                        >
                          <span>🔀</span>
                          <span>Tráo đề</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Practice Modes Conditional Content */}
                {practiceType === 'write' && (
                  <>
                    {practiceList.length === 0 ? (
                      <div className="text-center py-20 text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                        📭 Đang tải học liệu hoặc không tìm thấy dữ liệu luyện tập.
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Desktop View Table */}
                        <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-900 bg-slate-950/20 backdrop-blur-md shadow-xl">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-900/60 border-b border-slate-800/80">
                                <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center w-12">STT</th>
                                <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center w-12">Nghe</th>
                                <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Câu hỏi</th>
                                {practiceMode === 'vocab' && (
                                  <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center w-28">Từ loại</th>
                                )}
                                <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center w-64">Câu trả lời của bạn</th>
                                <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center w-28">Kết quả</th>
                                <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center w-36">% Đúng</th>
                                <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center w-48">Đáp án đúng</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900">
                              {practiceList.map((item, idx) => {
                                const isVocab = practiceMode === 'vocab';
                                const isViToJa = practiceDirection === 'vi-to-ja';

                                // Define question text and placeholder
                                let questionText = '';
                                let placeholderText = '';
                                let correctAnswer = '';
                                
                                if (isVocab) {
                                  questionText = isViToJa ? item.vietnamese_meaning : item.hiragana;
                                  placeholderText = isViToJa 
                                    ? (useRomaji ? 'Nhập Romaji...' : 'Nhập Hiragana...') 
                                    : 'Nhập nghĩa tiếng Việt...';
                                  correctAnswer = isViToJa 
                                    ? (useRomaji ? item.romaji : item.hiragana) 
                                    : item.vietnamese_meaning;
                                } else {
                                  questionText = isViToJa ? `${item.sino_vietnamese} (${item.vietnamese_meaning})` : item.character;
                                  placeholderText = isViToJa ? 'Nhập chữ Hán...' : 'Nhập âm Hán Việt...';
                                  correctAnswer = isViToJa ? item.character : item.sino_vietnamese;
                                }

                                const userAnswer = practiceAnswers[item.uniqueId] || '';
                                const pct = calculateAccuracy(userAnswer, correctAnswer);
                                const isVisible = visibleAnswers[item.uniqueId] || false;

                                return (
                                  <tr key={item.uniqueId} className="hover:bg-slate-900/10 transition-colors">
                                    <td className="py-4 px-4 text-xs font-bold text-slate-500 text-center">{idx + 1}</td>
                                    <td className="py-4 px-4 text-center">
                                      <button
                                        onClick={() => playAudio(isVocab ? item.hiragana : item.character)}
                                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-blue-400 transition-all cursor-pointer"
                                        title="Nghe câu hỏi"
                                      >
                                        🔊
                                      </button>
                                    </td>
                                    <td className="py-4 px-4 text-sm font-semibold text-slate-200 font-sans">
                                      {questionText}
                                    </td>
                                    {isVocab && (
                                      <td className="py-4 px-4 text-center">
                                        <span className="inline-block px-2 py-0.5 bg-slate-900/60 border border-slate-850 text-[10px] font-bold text-blue-400 rounded-md">
                                          {getWordTypeVietnamese(item.word_type)}
                                        </span>
                                      </td>
                                    )}
                                    <td className="py-4 px-4">
                                      <input
                                        type="text"
                                        placeholder={placeholderText}
                                        value={userAnswer}
                                        disabled={isGraded}
                                        onChange={(e) => setPracticeAnswers(prev => ({ ...prev, [item.uniqueId]: e.target.value }))}
                                        className={`w-full bg-[#FCF3CF] text-slate-900 font-extrabold text-base md:text-xs px-3.5 py-2 rounded-xl border border-slate-700/60 focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder:text-slate-500 ${isGraded ? 'opacity-80' : ''}`}
                                      />
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                      {isGraded && (
                                        pct === 100 ? (
                                          <span className="inline-block px-2.5 py-0.5 bg-emerald-950/40 border border-emerald-900/60 text-[10px] font-bold text-emerald-400 rounded-md">
                                            🟢 Đúng
                                          </span>
                                        ) : (
                                          <span className="inline-block px-2.5 py-0.5 bg-red-950/40 border border-red-900/60 text-[10px] font-bold text-red-400 rounded-md">
                                            🔴 Sai
                                          </span>
                                        )
                                      )}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                      {isGraded && (
                                        <div className="space-y-0.5">
                                          <span className={`text-xs font-black ${pct === 100 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                            {pct}%
                                          </span>
                                          <span className="block text-[9px] text-slate-500 leading-none">{getEncouragementText(pct)}</span>
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-4 px-4">
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() => setVisibleAnswers(prev => ({ ...prev, [item.uniqueId]: !isVisible }))}
                                          className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                                          title={isVisible ? 'Ẩn đáp án' : 'Hiện đáp án'}
                                        >
                                          {isVisible ? '👁' : '🙈'}
                                        </button>
                                        <span className={`text-xs break-all ${isVisible ? 'text-blue-400 font-extrabold' : 'text-slate-700 font-mono select-none blur-[4px]'}`}>
                                          {isVisible ? correctAnswer : '••••••••'}
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
                          {practiceList.map((item, idx) => {
                            const isVocab = practiceMode === 'vocab';
                            const isViToJa = practiceDirection === 'vi-to-ja';

                            let questionText = '';
                            let placeholderText = '';
                            let correctAnswer = '';
                            
                            if (isVocab) {
                              questionText = isViToJa ? item.vietnamese_meaning : item.hiragana;
                              placeholderText = isViToJa 
                                ? (useRomaji ? 'Nhập Romaji...' : 'Nhập Hiragana...') 
                                : 'Nhập nghĩa tiếng Việt...';
                              correctAnswer = isViToJa 
                                ? (useRomaji ? item.romaji : item.hiragana) 
                                : item.vietnamese_meaning;
                            } else {
                              questionText = isViToJa ? `${item.sino_vietnamese} (${item.vietnamese_meaning})` : item.character;
                              placeholderText = isViToJa ? 'Nhập chữ Hán...' : 'Nhập âm Hán Việt...';
                              correctAnswer = isViToJa ? item.character : item.sino_vietnamese;
                            }

                            const userAnswer = practiceAnswers[item.uniqueId] || '';
                            const pct = calculateAccuracy(userAnswer, correctAnswer);
                            const isVisible = visibleAnswers[item.uniqueId] || false;

                            return (
                              <div key={item.uniqueId} className="bg-slate-900/40 border border-slate-800 p-4.5 rounded-2xl space-y-3.5 backdrop-blur-sm">
                                {/* Card Header */}
                                <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
                                  <span className="text-xs font-bold text-slate-500">Câu {idx + 1}</span>
                                  <div className="flex items-center space-x-2">
                                    {isVocab && (
                                      <span className="px-2 py-0.5 bg-slate-950/80 border border-slate-900 text-[9px] font-bold uppercase rounded-md text-blue-400">
                                        {getWordTypeVietnamese(item.word_type)}
                                      </span>
                                    )}
                                    <button
                                      onClick={() => playAudio(isVocab ? item.hiragana : item.character)}
                                      className="p-1 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 hover:text-blue-400 cursor-pointer"
                                    >
                                      🔊 Nghe
                                    </button>
                                  </div>
                                </div>

                                {/* Question */}
                                <div className="space-y-1">
                                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Câu hỏi</span>
                                  <p className="text-sm font-semibold text-slate-200 font-sans">{questionText}</p>
                                </div>

                                {/* User Answer Input */}
                                <div className="space-y-1">
                                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Câu trả lời</span>
                                  <input
                                    type="text"
                                    placeholder={placeholderText}
                                    value={userAnswer}
                                    disabled={isGraded}
                                    onChange={(e) => setPracticeAnswers(prev => ({ ...prev, [item.uniqueId]: e.target.value }))}
                                    className={`w-full bg-[#FCF3CF] text-slate-900 font-extrabold text-base md:text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-500 ${isGraded ? 'opacity-80' : ''}`}
                                  />
                                </div>

                                {/* Results under Grading */}
                                {isGraded && (
                                  <div className="grid grid-cols-2 gap-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                                    <div>
                                      <span className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Kết quả</span>
                                      {pct === 100 ? (
                                        <span className="inline-block px-2 py-0.5 bg-emerald-950/30 border border-emerald-900/50 text-[9px] font-bold text-emerald-400 rounded-md">
                                          🟢 Đúng
                                        </span>
                                      ) : (
                                        <span className="inline-block px-2 py-0.5 bg-red-950/30 border border-red-900/50 text-[9px] font-bold text-red-400 rounded-md">
                                          🔴 Sai
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <span className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">% Đúng</span>
                                      <span className={`text-xs font-black ${pct === 100 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                        {pct}%
                                      </span>
                                      <span className="block text-[8px] text-slate-500 mt-0.5">{getEncouragementText(pct)}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Correct Answer reveal */}
                                <div className="pt-2 border-t border-slate-800/40 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Đáp án đúng</span>
                                    <button
                                      onClick={() => setVisibleAnswers(prev => ({ ...prev, [item.uniqueId]: !isVisible }))}
                                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer flex items-center space-x-1"
                                    >
                                      <span>{isVisible ? '👁️' : '🙈'}</span>
                                      <span>{isVisible ? 'Ẩn' : 'Hiện'}</span>
                                    </button>
                                  </div>
                                  <div className="bg-slate-950/40 border border-slate-900/60 p-2.5 rounded-xl">
                                    <p className={`font-serif text-xs sm:text-sm tracking-wide break-all break-words transition-all leading-relaxed ${isVisible ? 'text-blue-400 font-bold' : 'text-slate-650 select-none blur-[4px] font-mono'}`}>
                                      {isVisible ? correctAnswer : '••••••••'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* 3. Action Buttons & Grading Summary */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-900">
                          <div>
                            {isGraded && (
                              <p className="text-xs sm:text-sm font-semibold text-indigo-400">
                                🎉 Bạn đã hoàn thành chấm điểm! Hãy rà soát lại các câu sai để ôn tập nhé.
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 self-end sm:self-auto">
                            <button
                              onClick={() => {
                                setPracticeAnswers({});
                                setIsGraded(false);
                                setVisibleAnswers({});
                              }}
                              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-slate-100 text-xs font-bold text-slate-400 transition-all duration-300 cursor-pointer active:scale-95"
                            >
                              Làm lại
                            </button>
                            <button
                              onClick={() => setIsGraded(true)}
                              disabled={isGraded}
                              className={`px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black transition-all duration-300 shadow-md active:scale-95 cursor-pointer flex items-center space-x-2 ${isGraded ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <span>📋</span>
                              <span>Chấm điểm</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {practiceType === 'image' && (
                  <div className="space-y-6">
                    {/* Sub Mode Selector & Stats */}
                    <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-bold text-slate-400">Kiểu câu hỏi:</span>
                        <select
                          value={imagePracticeSubMode}
                          onChange={(e) => {
                            setImagePracticeSubMode(e.target.value as 'choices' | 'write');
                            setImageQuizSelectedAnswer(null);
                            setImageQuizTypedAnswer('');
                            setImageQuizChecked(false);
                            setImageQuizFeedbackMsg('');
                          }}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-600 cursor-pointer"
                        >
                          <option value="choices">🎯 Trắc nghiệm (Chọn đáp án)</option>
                          <option value="write">✍️ Tự luận (Nhập kết quả)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className="text-xs text-slate-400">
                          Tiến độ: <strong className="text-blue-400">{imageQuizIndex + 1}</strong> / {Math.min(imageQuizList.length, practiceLimit)}
                        </span>
                        <span className="text-xs text-slate-400">
                          Đúng: <strong className="text-emerald-400">{imageQuizScore}</strong> / {imageQuizPlayed}
                        </span>
                        <button
                          onClick={startImagePractice}
                          className="px-3 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95"
                        >
                          🔄 Chơi lại
                        </button>
                      </div>
                    </div>

                    {imageQuizList.length === 0 ? (
                      <div className="text-center py-20 text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                        📭 Không có từ vựng có hình ảnh trong bài học hoặc bộ lọc hiện tại. (Cần ít nhất 4 từ có ảnh).
                      </div>
                    ) : (
                      <div className="max-w-2xl mx-auto bg-slate-900/40 border border-slate-850 p-6 rounded-3xl backdrop-blur-md space-y-6 shadow-2xl">
                        {/* Image Panel */}
                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-850 bg-slate-950/80 flex items-center justify-center group shadow-inner">
                          {(() => {
                            const current = imageQuizList[imageQuizIndex];
                            const imgUrl = current ? (VOCAB_IMAGES[current.hiragana] || VOCAB_IMAGES[current.romaji]) : '';
                            return current && imgUrl ? (
                              <img
                                src={imgUrl}
                                alt="Practice vocabulary illustration"
                                className="object-cover max-h-full max-w-full transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <span className="text-slate-500 text-xs">Không tìm thấy ảnh</span>
                            );
                          })()}
                        </div>

                        {/* Answer reveal when checked */}
                        {imageQuizChecked && imageQuizList[imageQuizIndex] && (
                          <div className="text-center bg-slate-950/40 border border-slate-850 p-4 rounded-2xl animate-fade-in space-y-1">
                            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Từ vựng</span>
                            <div className="flex items-center justify-center space-x-2">
                              <h4 className="text-lg font-bold text-blue-400">
                                {imageQuizList[imageQuizIndex].hiragana}
                              </h4>
                              <span className="text-xs text-slate-400 font-mono">({imageQuizList[imageQuizIndex].romaji})</span>
                              <button
                                onClick={() => playAudio(imageQuizList[imageQuizIndex].hiragana)}
                                className="p-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:text-blue-400 cursor-pointer"
                              >
                                🔊
                              </button>
                            </div>
                            <p className="text-sm text-slate-300 font-medium">{imageQuizList[imageQuizIndex].vietnamese_meaning}</p>
                          </div>
                        )}

                        {/* Interaction Panel */}
                        <div className="space-y-4">
                          {imagePracticeSubMode === 'choices' ? (
                            /* Submode Choices: 4 buttons */
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {imageQuizChoices.map((choice, idx) => {
                                const current = imageQuizList[imageQuizIndex];
                                const isSelected = imageQuizSelectedAnswer === choice;
                                const isCorrectAnswer = current && choice === current.hiragana;
                                
                                let buttonClass = "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-blue-600 hover:text-white";
                                if (imageQuizChecked) {
                                  if (isCorrectAnswer) {
                                    buttonClass = "bg-emerald-950/60 border-emerald-500 text-emerald-400 font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.15)]";
                                  } else if (isSelected) {
                                    buttonClass = "bg-red-950/60 border-red-500 text-red-400 font-extrabold shadow-[0_0_15px_rgba(239,68,68,0.15)]";
                                  } else {
                                    buttonClass = "bg-slate-950/20 border-slate-900 text-slate-500 opacity-60";
                                  }
                                }

                                return (
                                  <button
                                    key={idx}
                                    disabled={imageQuizChecked}
                                    onClick={() => {
                                      setImageQuizSelectedAnswer(choice);
                                      checkImageAnswer(choice);
                                    }}
                                    className={`w-full py-4.5 px-4 rounded-2xl border text-sm font-bold text-center transition-all duration-300 cursor-pointer active:scale-98 ${buttonClass}`}
                                  >
                                    {choice}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            /* Submode Write: input box */
                            <div className="space-y-4">
                              <div className="flex gap-3">
                                <input
                                  type="text"
                                  placeholder="Nhập Hiragana hoặc Romaji..."
                                  value={imageQuizTypedAnswer}
                                  disabled={imageQuizChecked}
                                  onChange={(e) => setImageQuizTypedAnswer(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && imageQuizTypedAnswer.trim() !== '') {
                                      checkImageAnswer(imageQuizTypedAnswer.trim());
                                    }
                                  }}
                                  className={`flex-1 bg-[#FCF3CF] text-slate-900 font-extrabold text-sm px-4.5 py-3 rounded-2xl border focus:outline-none placeholder:text-slate-500 transition-all ${
                                    imageQuizChecked && imageQuizList[imageQuizIndex]
                                      ? (calculateAccuracy(imageQuizTypedAnswer, imageQuizList[imageQuizIndex].hiragana) === 100 || 
                                         calculateAccuracy(imageQuizTypedAnswer, imageQuizList[imageQuizIndex].romaji) === 100)
                                        ? 'border-emerald-500 focus:ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                        : 'border-red-500 focus:ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                                      : 'border-slate-700/60 focus:ring-2 focus:ring-blue-600'
                                  }`}
                                />
                                {!imageQuizChecked && (
                                  <button
                                    onClick={() => checkImageAnswer(imageQuizTypedAnswer.trim())}
                                    disabled={imageQuizTypedAnswer.trim() === ''}
                                    className="px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer"
                                  >
                                    Kiểm tra
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Feedback & Navigation */}
                        {imageQuizFeedbackMsg && (
                          <div className={`p-4 rounded-2xl text-center text-xs font-bold animate-fade-in border ${
                            imageQuizFeedbackMsg.includes('Đúng')
                              ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400'
                              : imageQuizFeedbackMsg.includes('Hoàn thành')
                              ? 'bg-indigo-950/30 border-indigo-900/50 text-indigo-400'
                              : 'bg-red-950/30 border-red-900/50 text-red-400'
                          }`}>
                            {imageQuizFeedbackMsg}
                          </div>
                        )}

                        {imageQuizChecked && (
                          <div className="flex justify-end pt-2">
                            <button
                              onClick={nextImageQuiz}
                              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs transition-all duration-300 shadow-md active:scale-95 cursor-pointer flex items-center space-x-1.5"
                            >
                              <span>
                                {imageQuizIndex + 1 < imageQuizList.length && imageQuizIndex + 1 < practiceLimit
                                  ? 'Câu tiếp theo ➔'
                                  : 'Kết quả ôn tập ➔'}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {practiceType === 'speedrun' && (
                  <div className="space-y-6">
                    {/* 1. Preparation Screen */}
                    {!speedrunActive && !speedrunGameOver && (
                      <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl text-center space-y-6 max-w-lg mx-auto backdrop-blur-md shadow-2xl animate-fade-in">
                        <div className="space-y-2">
                          <span className="text-5xl block animate-bounce">⚡</span>
                          <h3 className="text-xl font-black text-slate-200">Trò chơi Phản Xạ Nhanh</h3>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                            Trắc nghiệm phản xạ từ vựng giới hạn thời gian (10 giây). Mỗi 2 câu đúng liên tục sẽ rút ngắn thời gian suy nghĩ của các câu tiếp theo!
                          </p>
                        </div>

                        {/* Direction Selection */}
                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Chọn hướng dịch câu hỏi</span>
                          <div className="bg-slate-950/60 p-1.5 rounded-2xl border border-slate-850 flex max-w-xs mx-auto">
                            <button
                              onClick={() => setSpeedrunDirection('ja-to-vi')}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                                speedrunDirection === 'ja-to-vi'
                                  ? 'bg-blue-600 text-white shadow-lg'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              🇯🇵 Nhật ➔ 🇻🇳 Việt
                            </button>
                            <button
                              onClick={() => setSpeedrunDirection('vi-to-ja')}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                                speedrunDirection === 'vi-to-ja'
                                  ? 'bg-blue-600 text-white shadow-lg'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              🇻🇳 Việt ➔ 🇯🇵 Nhật
                            </button>
                          </div>
                        </div>

                        <div className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-2xl space-y-1 inline-block min-w-[200px]">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Kỷ lục hiện tại</span>
                          <span className="text-3xl font-black text-blue-400">{speedrunHighScore} điểm</span>
                        </div>

                        <div>
                          <button
                            onClick={startSpeedrun}
                            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] active:scale-95 cursor-pointer"
                          >
                            Bắt đầu chơi ngay 🚀
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 2. Playing Screen */}
                    {speedrunActive && speedrunQuestion && (
                      <div className="max-w-xl mx-auto bg-slate-900/40 border border-slate-850 p-6 rounded-3xl backdrop-blur-md space-y-6 shadow-2xl animate-fade-in">
                        {/* Game Header */}
                        <div className="flex justify-between items-center border-b border-slate-850 pb-4">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Điểm số</span>
                            <span className="text-xl font-black text-blue-400">{speedrunScore}</span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Kỷ lục</span>
                            <span className="text-xs font-bold text-slate-300">{speedrunHighScore} điểm</span>
                          </div>
                        </div>

                        {/* Timer Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                            <span>Thời gian còn lại</span>
                            <span className={speedrunTimeLeft <= 3 ? 'text-red-400 font-black animate-pulse' : ''}>
                              {speedrunTimeLeft.toFixed(1)}s
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                            <div
                              className={`h-full transition-all duration-100 ${
                                speedrunTimeLeft <= 3
                                  ? 'bg-gradient-to-r from-red-500 to-rose-600'
                                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                              }`}
                              style={{ width: `${(speedrunTimeLeft / speedrunMaxTime) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Question Panel */}
                        <div className="py-10 text-center bg-slate-950/60 border border-slate-850/80 rounded-2xl shadow-inner space-y-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Câu hỏi</span>
                          {speedrunDirection === 'ja-to-vi' ? (
                            <div className="space-y-1">
                              <h3 className="text-3xl font-black text-white leading-relaxed font-sans select-none">
                                {speedrunQuestion.hiragana}
                              </h3>
                              {speedrunQuestion.romaji && (
                                <p className="text-xs text-slate-400 font-mono select-none">({speedrunQuestion.romaji})</p>
                              )}
                            </div>
                          ) : (
                            <h3 className="text-xl font-black text-white leading-relaxed px-4 select-none">
                              {speedrunQuestion.vietnamese_meaning}
                            </h3>
                          )}
                        </div>

                        {/* Options Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {speedrunOptions.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => checkSpeedrunAnswer(option)}
                              className="w-full py-4 px-4 bg-slate-950/60 hover:bg-slate-950/90 border border-slate-850 hover:border-blue-600 text-slate-200 hover:text-white rounded-2xl text-xs font-bold text-center transition-all duration-200 cursor-pointer active:scale-98 shadow-md"
                            >
                              {option}
                            </button>
                          ))}
                        </div>

                        {/* Cancel Button */}
                        <div className="text-center pt-2">
                          <button
                            onClick={stopSpeedrun}
                            className="px-4 py-2 border border-slate-800 text-slate-500 hover:text-slate-300 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95"
                          >
                            Dừng trò chơi
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 3. Game Over Screen */}
                    {!speedrunActive && speedrunGameOver && (
                      <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl text-center space-y-6 max-w-lg mx-auto backdrop-blur-md shadow-2xl animate-fade-in">
                        <div className="space-y-2">
                          <span className="text-5xl block animate-bounce">🏁</span>
                          <h3 className="text-xl font-black text-red-400">Trò chơi kết thúc!</h3>
                          <p className="text-xs text-slate-400">
                            Bạn đã trả lời chưa chính xác hoặc hết thời gian. Hãy thử lại để vượt qua kỷ lục của chính mình!
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Điểm đạt được</span>
                            <span className="text-2xl font-black text-white">{speedrunScore}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Kỷ lục hiện tại</span>
                            <span className="text-2xl font-black text-blue-400">{speedrunHighScore}</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                          <button
                            onClick={() => {
                              setSpeedrunGameOver(false);
                            }}
                            className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-white text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95"
                          >
                            Quay lại màn hình chuẩn bị
                          </button>
                          <button
                            onClick={startSpeedrun}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs transition-all duration-300 shadow-md active:scale-95 cursor-pointer"
                          >
                            Chơi lại ngay ⚡
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentTab === 'cando' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header card */}
                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md space-y-2">
                  <h2 className="text-sm sm:text-md font-bold text-slate-200 flex items-center space-x-2">
                    <span>🎯</span>
                    <span>TỰ ĐÁNH GIÁ NĂNG LỰC (CAN-DO CHECK)</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Hãy đánh giá mức độ đạt được của bạn đối với các mục tiêu giao tiếp của bài học này theo chuẩn JF Standard.
                  </p>
                </div>

                {/* Checklist items */}
                <div className="space-y-4">
                  {candoChecks.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl">
                      📭 Chưa có danh sách mục tiêu Can-do cho bài học này.
                    </div>
                  ) : (
                    candoChecks.map((item, idx) => (
                      <div
                        key={item.id}
                        className="bg-slate-900/20 border border-slate-850 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-sm"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-md bg-blue-950/60 border border-blue-900/40 text-blue-400 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <h3 className="text-sm font-bold text-slate-200">{item.text_vi}</h3>
                          </div>
                          <p className="text-xs text-slate-500 italic pl-7">{item.text}</p>
                        </div>

                        {/* Status controllers */}
                        <div className="flex items-center gap-2 self-start md:self-auto pl-7 md:pl-0">
                          <button
                            onClick={() => handleCandoStatusChange(item.id, 'not_learned')}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-200 cursor-pointer ${
                              item.status === 'not_learned'
                                ? 'bg-red-950/30 border-red-800/80 text-red-400 shadow-md shadow-red-900/20'
                                : 'bg-slate-950/20 border-slate-900 text-slate-500 hover:text-slate-400 hover:border-slate-800'
                            }`}
                          >
                            🔴 Chưa đạt
                          </button>
                          <button
                            onClick={() => handleCandoStatusChange(item.id, 'learning')}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-200 cursor-pointer ${
                              item.status === 'learning'
                                ? 'bg-amber-950/30 border-amber-800/80 text-amber-400 shadow-md shadow-amber-900/20'
                                : 'bg-slate-950/20 border-slate-900 text-slate-500 hover:text-slate-400 hover:border-slate-800'
                            }`}
                          >
                            🟡 Đạt một phần
                          </button>
                          <button
                            onClick={() => handleCandoStatusChange(item.id, 'mastered')}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-200 cursor-pointer ${
                              item.status === 'mastered'
                                ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-400 shadow-md shadow-emerald-900/20'
                                : 'bg-slate-950/20 border-slate-900 text-slate-500 hover:text-slate-400 hover:border-slate-800'
                            }`}
                          >
                            🟢 Đạt tốt
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {currentTab === 'culture' && (
              <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
                {/* Header info */}
                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md space-y-1 text-center font-sans">
                  <span className="text-xs font-black text-rose-500 uppercase tracking-widest block">Tìm hiểu văn hoá</span>
                  <h2 className="text-xl font-black text-slate-100">CÂU CHUYỆN VĂN HÓA & CUỘC SỐNG NHẬT BẢN</h2>
                </div>

                {/* Culture contents */}
                {cultureData.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl">
                    📭 Chưa có nội dung Văn hóa & Cuộc sống cho bài học này.
                  </div>
                ) : (
                  cultureData.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-900/20 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm space-y-6"
                    >
                      {/* Image header */}
                      {item.image_url && (
                        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden group">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex items-end p-6 md:p-8">
                            <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-lg leading-tight">
                              {item.title}
                            </h3>
                          </div>
                        </div>
                      )}

                      {/* Content text */}
                      <div className="p-6 md:p-8 pt-0 space-y-4">
                        {!item.image_url && (
                          <h3 className="text-xl md:text-2xl font-black text-white leading-tight border-b border-slate-850 pb-4">
                            {item.title}
                          </h3>
                        )}
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans text-justify whitespace-pre-line">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {!['vocab', 'kanji', 'grammar', 'flashcards', 'kaiwa', 'practice', 'cando', 'culture'].includes(currentTab) && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4 border border-dashed border-slate-800 rounded-2xl">
                <span className="text-3xl">🚧</span>
                <div className="text-center">
                  <h3 className="text-md font-bold text-slate-200">Phân hệ đang được xây dựng</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Giao diện tab "{currentTab}" cho {lessonTitle} sẽ được bổ sung tiếp theo.
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/lessons/${selectedLessonId}?tab=vocab`)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all duration-300"
                >
                  Quay lại Học Từ vựng
                </button>
              </div>
            )}
          </div>
        )}

      </main>

    </div>
  );
}
