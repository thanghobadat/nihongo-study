'use client';

import { useState, useEffect, useCallback, use, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../utils/api';

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
  const currentTab = searchParams.get('tab') || 'vocab';
  const user = api.getUser();

  // Navigation Items corresponding to the 8 Sheets / Areas
  const menuItems = [
    { name: 'Tiến độ học', id: 'dashboard', icon: '📊', active: false },
    { name: 'Ôn bảng chữ cái', id: 'kana', icon: '🔤', active: false },
    { name: 'Từ vựng', id: 'vocab', icon: '📚', active: currentTab === 'vocab' },
    { name: 'Chữ Hán (Kanji)', id: 'kanji', icon: '🉐', active: currentTab === 'kanji' },
    { name: 'Ngữ pháp', id: 'grammar', icon: '📝', active: currentTab === 'grammar' },
    { name: 'Flashcards', id: 'flashcards', icon: '🃏', active: currentTab === 'flashcards' },
    { name: 'Luyện nói (Kaiwa)', id: 'kaiwa', icon: '💬', active: currentTab === 'kaiwa' },
    { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️', active: currentTab === 'practice' }
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

  // Flashcards States
  const [flashcardType, setFlashcardType] = useState<'vocab' | 'kanji'>('vocab');
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(1);
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

  // Luyện tập (Practice) States
  const [practiceMode, setPracticeMode] = useState<'vocab' | 'kanji'>('vocab');
  const [practiceLimit, setPracticeLimit] = useState<number>(10);
  const [baseShuffledList, setBaseShuffledList] = useState<any[]>([]);
  const [practiceList, setPracticeList] = useState<any[]>([]);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, string>>({});
  const [isGraded, setIsGraded] = useState<boolean>(false);
  const [visibleAnswers, setVisibleAnswers] = useState<Record<number, boolean>>({});
  const [practiceDirection, setPracticeDirection] = useState<'vi-to-ja' | 'ja-to-vi'>('vi-to-ja');

  useEffect(() => {
    setPracticeAnswers({});
    setIsGraded(false);
    setVisibleAnswers({});
  }, [practiceDirection]);


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

  // Tráo đề (Shuffle)
  const handleShufflePractice = () => {
    const sourceList = practiceMode === 'vocab' ? vocabItems : kanjiItems;
    if (sourceList.length === 0) return;
    const shuffled = [...sourceList].sort(() => Math.random() - 0.5);
    setBaseShuffledList(shuffled);
    setPracticeList(shuffled.slice(0, Math.min(practiceLimit, shuffled.length)));
    setPracticeAnswers({});
    setIsGraded(false);
    setVisibleAnswers({});
    setMessage('Đã xáo trộn danh sách câu hỏi! 🔀');
    setTimeout(() => setMessage(null), 3000);
  };

  // Thay đổi giới hạn câu hỏi
  const handleLimitChange = (val: string) => {
    const num = parseInt(val) || 0;
    const sourceList = practiceMode === 'vocab' ? vocabItems : kanjiItems;
    const maxVal = sourceList.length;
    const cleanNum = Math.max(1, Math.min(num, maxVal));
    setPracticeLimit(cleanNum);
    if (baseShuffledList.length > 0) {
      setPracticeList(baseShuffledList.slice(0, Math.min(cleanNum, baseShuffledList.length)));
    }
  };

  useEffect(() => {
    if (currentTab === 'vocab') {
      loadVocabData();
    } else if (currentTab === 'kanji') {
      loadKanjiData();
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
    }
  }, [currentTab, loadVocabData, loadKanjiData, loadGrammarData, loadDialogueData]);

  // Load initial practice list once vocabulary or kanji is available
  useEffect(() => {
    if (currentTab === 'practice') {
      const sourceList = practiceMode === 'vocab' ? vocabItems : kanjiItems;
      if (sourceList.length > 0 && baseShuffledList.length === 0) {
        const shuffled = [...sourceList].sort(() => Math.random() - 0.5);
        setBaseShuffledList(shuffled);
        setPracticeList(shuffled.slice(0, Math.min(practiceLimit, shuffled.length)));
      }
    }
  }, [currentTab, vocabItems, kanjiItems, practiceMode, practiceLimit, baseShuffledList.length]);

  // Reset practice state when practice mode changes
  useEffect(() => {
    setBaseShuffledList([]);
    setPracticeList([]);
    setPracticeAnswers({});
    setIsGraded(false);
    setVisibleAnswers({});
  }, [practiceMode]);

  const totalItemsCount = flashcardType === 'vocab' ? vocabItems.length : kanjiItems.length;

  useEffect(() => {
    if (currentTab === 'flashcards') {
      setRangeStart(1);
      setRangeEnd(totalItemsCount || 1);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setIsShuffle(false);
      setShuffledIndices([]);
    }
  }, [flashcardType, totalItemsCount, currentTab]);

  const activeList = flashcardType === 'vocab' ? vocabItems : kanjiItems;
  const rangedList = activeList.slice(rangeStart - 1, rangeEnd);

  // Sync index and shuffle states when ranges change
  useEffect(() => {
    setIsShuffle(false);
    setShuffledIndices([]);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [rangeStart, rangeEnd]);

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

  // Filtered lists matching current level
  const filteredLessons = lessons.filter(l => {
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

  // Filtered Vocabulary items
  const processedVocab = vocabItems.filter(item => {
    const matchesSearch = 
      item.hiragana.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.romaji.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vietnamese_meaning.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Vocab progress calculated dynamically
  const vocabTotalCount = vocabItems.length;
  const vocabMasteredCount = vocabItems.filter(v => v.status === 'mastered').length;
  const vocabLearningCount = vocabItems.filter(v => v.status === 'learning').length;
  const progressPercent = vocabTotalCount ? Math.round((vocabMasteredCount / vocabTotalCount) * 100) : 0;

  // Filtered Kanji items
  const processedKanji = kanjiItems.filter(item => {
    const matchesSearch = 
      item.character.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sino_vietnamese.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vietnamese_meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.onyomi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kunyomi.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-[#0b1329] via-[#090d1a] to-[#050811] text-slate-100 font-sans relative">
      
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
          {/* Logo Title & Mobile Close button */}
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

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setIsSidebarOpen(false);
                  if (item.id === 'dashboard') {
                    router.push('/dashboard');
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
              <span className="text-blue-400 ml-2">{lessonTitle}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Học liệu chi tiết bài học và cập nhật tiến độ học tập cá nhân
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
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-600/60"
                    />
                    <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm">🔍</span>
                  </div>

                  {/* Status filters */}
                  <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-900 w-full sm:w-auto overflow-x-auto justify-between sm:justify-start">
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

                {/* 3. Vocabulary Cards Grid */}
                {processedVocab.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl">
                    📭 Không tìm thấy từ vựng nào phù hợp với điều kiện tìm kiếm.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {processedVocab.map((item) => {
                      // Color schemes depending on study status
                      let borderClass = 'border-slate-800/80';
                      let statusBg = 'bg-slate-950/60';
                      let shadowClass = '';
                      if (item.status === 'mastered') {
                        borderClass = 'border-emerald-800/40 hover:border-emerald-600/60';
                        statusBg = 'bg-emerald-950/10';
                        shadowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.04)]';
                      } else if (item.status === 'learning') {
                        borderClass = 'border-amber-800/40 hover:border-amber-600/60';
                        statusBg = 'bg-amber-950/10';
                        shadowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.04)]';
                      }

                      return (
                        <div
                          key={item.id}
                          className={`p-5 rounded-2xl border bg-slate-900/20 backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.005] hover:bg-slate-900/30 ${borderClass} ${statusBg} ${shadowClass}`}
                        >
                          <div>
                            {/* Card Top Row: Word type and dropdown status */}
                            <div className="flex items-center justify-between mb-4 border-b border-slate-800/40 pb-3">
                              <span className="px-2.5 py-0.5 bg-slate-950/80 border border-slate-800 text-[10px] font-bold uppercase rounded-md text-blue-400">
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
                                className={`bg-slate-950 border rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none cursor-pointer transition-colors duration-200 ${
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

                            {/* Card Japanese Word & speaker row */}
                            <div className="flex items-center space-x-3 mb-4">
                              <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                                {item.hiragana}
                              </h3>
                              <button
                                onClick={() => playAudio(item.hiragana)}
                                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-blue-400 hover:border-blue-800/40 transition-colors duration-300 cursor-pointer active:scale-90"
                                title="Nghe phát âm"
                              >
                                🔊
                              </button>
                            </div>

                            {/* Card translations */}
                            <div className="space-y-1 mb-4 text-xs sm:text-sm">
                              <p className="text-slate-400 font-semibold tracking-wide">
                                <span className="text-[10px] text-slate-500 uppercase mr-1.5">Romaji:</span>
                                {item.romaji}
                              </p>
                              <p className="text-slate-100 font-extrabold">
                                <span className="text-[10px] text-slate-500 uppercase mr-1.5">Nghĩa:</span>
                                {item.vietnamese_meaning}
                              </p>
                            </div>

                            {/* Mnemonic card */}
                            {item.mnemonic_tip && (
                              <div className="mb-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start space-x-2.5">
                                <span className="text-sm shrink-0">💡</span>
                                <div className="space-y-1">
                                  <span className="block text-[9px] font-black text-indigo-400 uppercase tracking-wider">Mẹo ghi nhớ</span>
                                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.mnemonic_tip}</p>
                                </div>
                              </div>
                            )}

                            {/* Sentence example section */}
                            {item.japanese_example && (
                              <div className="pt-3 border-t border-slate-800/40 space-y-1.5">
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-1.5 py-0.5 rounded uppercase tracking-wider">Ví dụ</span>
                                  <button
                                    onClick={() => playAudio(item.japanese_example)}
                                    className="text-[10px] text-slate-500 hover:text-blue-400 cursor-pointer"
                                    title="Nghe câu ví dụ"
                                  >
                                    🔊 Nghe
                                  </button>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-200 font-medium font-serif leading-relaxed">
                                  {item.japanese_example}
                                </p>
                                <p className="text-[11px] text-slate-400 italic leading-relaxed">
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
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  {/* Search box */}
                  <div className="relative w-full sm:max-w-md">
                    <input
                      type="text"
                      placeholder="Tìm chữ Hán, Hán Việt, Nghĩa, Onyomi, Kunyomi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-600/60"
                    />
                    <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm">🔍</span>
                  </div>

                  {/* Status filters */}
                  <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-900 w-full sm:w-auto overflow-x-auto justify-between sm:justify-start">
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

                {/* 3. Kanji Cards Grid */}
                {processedKanji.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl">
                    📭 Không tìm thấy chữ Hán nào phù hợp với điều kiện tìm kiếm.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {processedKanji.map((item) => {
                      // Color schemes depending on study status
                      let borderClass = 'border-slate-800/80';
                      let statusBg = 'bg-slate-950/60';
                      let shadowClass = '';
                      if (item.status === 'mastered') {
                        borderClass = 'border-emerald-800/40 hover:border-emerald-600/60';
                        statusBg = 'bg-emerald-950/10';
                        shadowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.04)]';
                      } else if (item.status === 'learning') {
                        borderClass = 'border-amber-800/40 hover:border-amber-600/60';
                        statusBg = 'bg-amber-950/10';
                        shadowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.04)]';
                      }

                      return (
                        <div
                          key={item.id}
                          className={`p-5 rounded-2xl border bg-slate-900/20 backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.005] hover:bg-slate-900/30 ${borderClass} ${statusBg} ${shadowClass}`}
                        >
                          <div>
                            {/* Card Top Row: stroke count and dropdown status */}
                            <div className="flex items-center justify-between mb-4 border-b border-slate-800/40 pb-3">
                              <span className="px-2.5 py-0.5 bg-slate-950/80 border border-slate-800 text-[10px] font-bold uppercase rounded-md text-blue-400">
                                {item.stroke_count} nét
                              </span>

                              <select
                                value={item.status}
                                onChange={(e) => handleKanjiStatusChange(item.id, e.target.value as any)}
                                className={`bg-slate-950 border rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none cursor-pointer transition-colors duration-200 ${
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

                            {/* Card Character & readings row */}
                            <div className="flex items-start gap-4 mb-4">
                              {/* Large Kanji Character display */}
                              <div className="w-20 h-20 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center justify-center relative shrink-0">
                                <span className="text-4xl font-black text-white select-none">
                                  {item.character}
                                </span>
                                <button
                                  onClick={() => playAudio(item.character)}
                                  className="absolute bottom-1 right-1 p-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-blue-400 hover:border-blue-800/40 transition-colors duration-300 cursor-pointer active:scale-90"
                                  title="Nghe phát âm"
                                >
                                  🔊
                                </button>
                              </div>

                              {/* Sino-Vietnamese & Vietnamese Meaning */}
                              <div className="flex-1 space-y-1">
                                <h3 className="text-lg font-black text-emerald-400 uppercase tracking-wider">
                                  {item.sino_vietnamese}
                                </h3>
                                <p className="text-sm font-extrabold text-slate-100 leading-tight">
                                  {item.vietnamese_meaning}
                                </p>
                              </div>
                            </div>

                            {/* Onyomi & Kunyomi */}
                            <div className="grid grid-cols-2 gap-4 mt-4 border-t border-slate-800/40 pt-3 text-xs">
                              <div className="space-y-0.5">
                                <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Onyomi (Âm Ôn)</span>
                                <span className="font-semibold text-slate-300">{item.onyomi || '-'}</span>
                              </div>
                              <div className="space-y-0.5">
                                <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Kunyomi (Âm Cưng)</span>
                                <span className="font-semibold text-slate-300">{item.kunyomi || '-'}</span>
                              </div>
                            </div>

                            {/* Mnemonic card */}
                            {item.mnemonic_tip && (
                              <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start space-x-2.5">
                                <span className="text-sm shrink-0">💡</span>
                                <div className="space-y-1">
                                  <span className="block text-[9px] font-black text-indigo-400 uppercase tracking-wider">Mẹo ghi nhớ</span>
                                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.mnemonic_tip}</p>
                                </div>
                              </div>
                            )}

                            {/* Compounds section */}
                            {item.compounds && (
                              <div className="mt-4 pt-3 border-t border-slate-800/40 space-y-1.5">
                                <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-1.5 py-0.5 rounded uppercase tracking-wider inline-block">
                                  Từ ghép ví dụ
                                </span>
                                <p className="text-xs text-slate-300 leading-relaxed font-serif whitespace-pre-line">
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

            {currentTab === 'grammar' && (
              <div className="space-y-6">
                
                {/* 1. Grammar Progress Card */}
                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 space-y-2">
                    <h2 className="text-md font-bold text-slate-200 flex items-center space-x-2">
                      <span>📊</span>
                      <span>Tiến độ ngữ pháp bài học</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Nắm vững các mẫu câu cơ bản để ghép từ vựng thành câu hoàn chỉnh và chính xác
                    </p>
                  </div>

                  {/* Progress values */}
                  <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-slate-950/65 border border-slate-800/50 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-slate-400">Tổng ngữ pháp</span>
                      <span className="text-sm font-black text-slate-200">{grammarTotalCount} mẫu</span>
                    </div>

                    <div className="p-3 bg-slate-950/65 border border-slate-800/50 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-slate-400">Đã thuộc</span>
                      <span className="text-sm font-black text-emerald-400">{grammarMasteredCount} mẫu</span>
                    </div>

                    <div className="p-3 bg-slate-950/65 border border-slate-800/50 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-slate-400">Đang học</span>
                      <span className="text-sm font-black text-amber-400">{grammarLearningCount} mẫu</span>
                    </div>

                    {/* Progress Bar overall */}
                    <div className="sm:col-span-3 pt-2">
                      <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold mb-1.5">
                        <span className="text-slate-500 uppercase">Tỷ lệ hoàn thành</span>
                        <span className="text-blue-400">{grammarProgressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/40">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${grammarProgressPercent}%` }}
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
                      placeholder="Tìm tiêu đề, cấu trúc, ý nghĩa..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-600/60"
                    />
                    <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm">🔍</span>
                  </div>

                  {/* Status filters */}
                  <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-900 w-full sm:w-auto overflow-x-auto justify-between sm:justify-start">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        statusFilter === 'all'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Tất cả ({grammarTotalCount})
                    </button>
                    <button
                      onClick={() => setStatusFilter('not_learned')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        statusFilter === 'not_learned'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Chưa học ({grammarItems.filter(v => v.status === 'not_learned').length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('learning')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        statusFilter === 'learning'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Đang học ({grammarItems.filter(v => v.status === 'learning').length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('mastered')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        statusFilter === 'mastered'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Đã thuộc ({grammarItems.filter(v => v.status === 'mastered').length})
                    </button>
                  </div>
                </div>

                {/* 3. Grammar Cards List */}
                {processedGrammar.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl">
                    📭 Không tìm thấy mẫu ngữ pháp nào phù hợp với điều kiện tìm kiếm.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {processedGrammar.map((item, idx) => {
                      // Color schemes depending on study status
                      let borderClass = 'border-slate-800/80';
                      let statusBg = 'bg-slate-950/60';
                      let shadowClass = '';
                      if (item.status === 'mastered') {
                        borderClass = 'border-emerald-800/40 hover:border-emerald-600/60';
                        statusBg = 'bg-emerald-950/10';
                        shadowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.04)]';
                      } else if (item.status === 'learning') {
                        borderClass = 'border-amber-800/40 hover:border-amber-600/60';
                        statusBg = 'bg-amber-950/10';
                        shadowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.04)]';
                      }

                      return (
                        <div
                          key={item.id}
                          className={`p-5 sm:p-6 rounded-2xl border bg-slate-900/20 backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.005] hover:bg-slate-900/30 ${borderClass} ${statusBg} ${shadowClass}`}
                        >
                          <div className="space-y-4">
                            {/* Title & dropdown status */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/40 pb-3">
                              <h3 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
                                <span className="text-blue-500 font-mono text-sm">Mẫu {idx + 1}:</span>
                                {item.title}
                              </h3>
                              <div className="flex items-center gap-3 self-start sm:self-auto">
                                <span className="px-3 py-1 bg-blue-950/40 border border-blue-900/30 text-xs font-bold text-blue-400 rounded-xl shadow-sm">
                                  Ý nghĩa: {item.meaning}
                                </span>
                                <select
                                  value={item.status}
                                  onChange={(e) => handleGrammarStatusChange(item.id, e.target.value as any)}
                                  className={`bg-slate-950 border rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none cursor-pointer transition-colors duration-200 ${
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
                            </div>

                            {/* Sentence structure Box */}
                            {item.structure && (
                              <div className="p-3.5 bg-slate-950/65 border border-dashed border-slate-800/80 rounded-xl space-y-1">
                                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest font-sans">Cấu trúc thành lập</span>
                                <p className="text-xs sm:text-sm font-semibold text-slate-300 font-mono">
                                  {item.structure}
                                </p>
                              </div>
                            )}

                            {/* Explanation */}
                            {item.vietnamese_explanation && (
                              <div className="space-y-1 text-xs sm:text-sm">
                                <span className="block text-[9px] font-black text-indigo-400 uppercase tracking-widest font-sans">Giải thích cách dùng</span>
                                <p className="text-slate-200 leading-relaxed font-medium">
                                  {item.vietnamese_explanation}
                                </p>
                              </div>
                            )}

                            {/* Example section */}
                            {item.japanese_example && (
                              <div className="pt-3 border-t border-slate-800/40 space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-1.5 py-0.5 rounded uppercase tracking-wider">Ví dụ mẫu</span>
                                  <button
                                    onClick={() => playAudio(item.japanese_example)}
                                    className="text-[10px] text-slate-400 hover:text-blue-400 cursor-pointer flex items-center space-x-1 hover:underline active:scale-95"
                                    title="Nghe câu ví dụ"
                                  >
                                    <span>🔊</span>
                                    <span>Nghe ví dụ</span>
                                  </button>
                                </div>
                                <p className="text-sm sm:text-base text-slate-100 font-bold font-serif leading-relaxed tracking-wide pl-2 border-l-2 border-emerald-500/50">
                                  {item.japanese_example}
                                </p>
                                <p className="text-xs sm:text-sm text-slate-400 italic pl-2 leading-relaxed">
                                  {item.example_meaning}
                                </p>
                              </div>
                            )}

                            {/* Notes if any */}
                            {item.notes && !item.notes.includes('🔊') && (
                              <div className="text-[11px] text-slate-500 italic flex items-start space-x-1">
                                <span>⚠️</span>
                                <span className="leading-normal">{item.notes}</span>
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

                    {/* Range selectors */}
                    {totalItemsCount > 0 && (
                      <div className="flex items-center space-x-2 w-full sm:w-auto bg-slate-950/60 border border-slate-800/80 px-3 py-1.5 rounded-xl">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0">Từ:</span>
                        <select
                          value={rangeStart}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setRangeStart(val);
                            if (rangeEnd < val) setRangeEnd(val);
                          }}
                          className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer pr-1"
                        >
                          {activeList.map((item, idx) => (
                            <option key={item.id} value={idx + 1} className="bg-[#0b1329] text-slate-200">
                              {idx + 1}. {flashcardType === 'vocab' ? (item as VocabItem).hiragana : (item as KanjiItem).character}
                            </option>
                          ))}
                        </select>
                        
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0 pl-1">Đến:</span>
                        <select
                          value={rangeEnd}
                          onChange={(e) => setRangeEnd(parseInt(e.target.value))}
                          className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer pr-1"
                        >
                          {activeList.map((item, idx) => (
                            <option
                              key={item.id}
                              value={idx + 1}
                              disabled={idx + 1 < rangeStart}
                              className={`bg-[#0b1329] ${idx + 1 < rangeStart ? 'text-slate-600' : 'text-slate-200'}`}
                            >
                              {idx + 1}. {flashcardType === 'vocab' ? (item as VocabItem).hiragana : (item as KanjiItem).character}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
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
                    📭 Không có thẻ nào trong phạm vi lựa chọn. Vui lòng chọn lại phạm vi.
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
                    <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-800/40 text-xs text-slate-300">
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
                  <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl backdrop-blur-md flex flex-wrap items-center gap-6 justify-between text-xs text-slate-300">
                    <div className="flex flex-wrap items-center gap-6">
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

                      {/* Number of questions input */}
                      <div className="flex items-center space-x-2 bg-slate-950/40 border border-slate-800 px-3.5 py-1.5 rounded-xl">
                        <span className="text-xs text-slate-400 font-bold">Số câu hỏi:</span>
                        <input
                          type="number"
                          value={practiceLimit}
                          onChange={(e) => handleLimitChange(e.target.value)}
                          className="w-12 bg-slate-900 border border-slate-700 rounded-lg text-center text-xs font-extrabold text-white py-1 focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-xs text-slate-500 font-bold">
                          / {practiceMode === 'vocab' ? vocabItems.length : kanjiItems.length}
                        </span>
                      </div>
                    </div>

                    {/* Shuffle button */}
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
                  </div>
                </div>

                {/* 2. Practice Lists */}
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
                              placeholderText = isViToJa ? 'Nhập Hiragana...' : 'Nhập nghĩa tiếng Việt...';
                              correctAnswer = isViToJa ? item.hiragana : item.vietnamese_meaning;
                            } else {
                              questionText = isViToJa ? `${item.sino_vietnamese} (${item.vietnamese_meaning})` : item.character;
                              placeholderText = isViToJa ? 'Nhập chữ Hán...' : 'Nhập âm Hán Việt...';
                              correctAnswer = isViToJa ? item.character : item.sino_vietnamese;
                            }

                            const userAnswer = practiceAnswers[item.id] || '';
                            const pct = calculateAccuracy(userAnswer, correctAnswer);
                            const isVisible = visibleAnswers[item.id] || false;

                            return (
                              <tr key={item.id} className="hover:bg-slate-900/10 transition-colors">
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
                                    onChange={(e) => setPracticeAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
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
                                      onClick={() => setVisibleAnswers(prev => ({ ...prev, [item.id]: !isVisible }))}
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
                          placeholderText = isViToJa ? 'Nhập Hiragana...' : 'Nhập nghĩa tiếng Việt...';
                          correctAnswer = isViToJa ? item.hiragana : item.vietnamese_meaning;
                        } else {
                          questionText = isViToJa ? `${item.sino_vietnamese} (${item.vietnamese_meaning})` : item.character;
                          placeholderText = isViToJa ? 'Nhập chữ Hán...' : 'Nhập âm Hán Việt...';
                          correctAnswer = isViToJa ? item.character : item.sino_vietnamese;
                        }

                        const userAnswer = practiceAnswers[item.id] || '';
                        const pct = calculateAccuracy(userAnswer, correctAnswer);
                        const isVisible = visibleAnswers[item.id] || false;

                        return (
                          <div key={item.id} className="bg-slate-900/40 border border-slate-800 p-4.5 rounded-2xl space-y-3.5 backdrop-blur-sm">
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
                                onChange={(e) => setPracticeAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
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
                                  onClick={() => setVisibleAnswers(prev => ({ ...prev, [item.id]: !isVisible }))}
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
              </div>
            )}

            {!['vocab', 'kanji', 'grammar', 'flashcards', 'kaiwa', 'practice'].includes(currentTab) && (
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
