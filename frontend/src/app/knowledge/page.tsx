'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../utils/api';
import SidebarSettings from '../components/SidebarSettings';
import CourseSwitcher from '../components/CourseSwitcher';

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
  isCustom?: boolean;
  status?: 'not_learned' | 'learning' | 'mastered';
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
  isCustom?: boolean;
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
  isCustom?: boolean;
  status?: 'not_learned' | 'learning' | 'mastered';
}

export default function KnowledgeHubPage() {
  const router = useRouter();
  const user = api.getUser();



  // UI / Global states
  const [activeCourse, setActiveCourse] = useState<'minna' | 'marugoto'>('minna');
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'vocab' | 'kanji' | 'grammar'>('overview');
  const [showPracticeSetup, setShowPracticeSetup] = useState<boolean>(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [level, setLevel] = useState<'N5' | 'N4'>('N5');
  const [knowledgeItems, setKnowledgeItems] = useState<{ id?: number; user_id?: string; item_type: string; item_id: number }[]>([]);

  // Filters state for detailed tabs
  const [filterLesson, setFilterLesson] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Core content lists (Syllabus & Custom)
  const [vocabList, setVocabList] = useState<VocabItem[]>([]);
  const [customVocabList, setCustomVocabList] = useState<VocabItem[]>([]);
  const [kanjiList, setKanjiList] = useState<KanjiItem[]>([]);
  const [customKanjiList, setCustomKanjiList] = useState<KanjiItem[]>([]);
  const [grammarList, setGrammarList] = useState<GrammarItem[]>([]);
  const [customGrammarList, setCustomGrammarList] = useState<GrammarItem[]>([]);

  // Modals state
  const [vocabModalOpen, setVocabModalOpen] = useState<boolean>(false);
  const [editingVocabId, setEditingVocabId] = useState<number | null>(null);
  const [vocabForm, setVocabForm] = useState({
    hiragana: '',
    romaji: '',
    vietnamese_meaning: '',
    word_type: '',
    japanese_example: '',
    example_meaning: '',
    mnemonic_tip: ''
  });

  const [kanjiModalOpen, setKanjiModalOpen] = useState<boolean>(false);
  const [editingKanjiId, setEditingKanjiId] = useState<number | null>(null);
  const [kanjiForm, setKanjiForm] = useState({
    character: '',
    stroke_count: '',
    onyomi: '',
    kunyomi: '',
    sino_vietnamese: '',
    vietnamese_meaning: '',
    mnemonic_tip: '',
    compounds: ''
  });

  const [grammarModalOpen, setGrammarModalOpen] = useState<boolean>(false);
  const [editingGrammarId, setEditingGrammarId] = useState<number | null>(null);
  const [grammarForm, setGrammarForm] = useState({
    title: '',
    meaning: '',
    structure: '',
    vietnamese_explanation: '',
    japanese_example: '',
    example_meaning: '',
    romaji_example: '',
    notes: ''
  });

  // Combined Practice Configuration states
  const [practiceConfig, setPracticeConfig] = useState({
    selectedLessons: [] as number[],
    source: 'both' as 'syllabus' | 'custom' | 'both',
    contentType: 'vocab' as 'vocab' | 'kanji' | 'both',
    gameMode: 'speedrun' as 'speedrun' | 'memory' | 'write'
  });

  // Game Workspace active states
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [gameData, setGameData] = useState<any[]>([]); // combined list of questions
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameAnswers, setGameAnswers] = useState<string[]>([]);
  const [gameTimer, setGameTimer] = useState<number>(10);
  const [speedrunChoices, setSpeedrunChoices] = useState<string[]>([]);
  const [memoryCards, setMemoryCards] = useState<any[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]); // indices of flipped cards
  const [matchedCards, setMatchedCards] = useState<number[]>([]); // indices of matched cards
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  // Show a tiny toast alert
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load configuration from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCourse = localStorage.getItem('activeCourse') as 'minna' | 'marugoto';
      if (storedCourse) {
        setActiveCourse(storedCourse);
      }
      const storedLesson = localStorage.getItem('selectedLessonId');
      if (storedLesson) {
        const parsed = parseInt(storedLesson);
        if (!isNaN(parsed)) {
          setSelectedLessonId(parsed);
        }
      } else if (storedCourse === 'marugoto') {
        setSelectedLessonId(101);
      }
    }
  }, []);

  // Combined fetch for course (Syllabus & Custom items for ALL lessons)
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, kItems] = await Promise.all([
        api.get(`/api/user/course-summary?course=${activeCourse}`),
        api.get('/api/user/knowledge-items')
      ]);
      
      setLessons(res.lessons || []);
      setVocabList(res.vocabulary || []);
      setKanjiList(res.kanji || []);
      setGrammarList(res.grammar || []);
      setCustomVocabList((res.customVocabulary || []).map((item: any) => ({ ...item, isCustom: true })));
      setCustomKanjiList((res.customKanji || []).map((item: any) => ({ ...item, isCustom: true })));
      setCustomGrammarList((res.customGrammar || []).map((item: any) => ({ ...item, isCustom: true })));
      setKnowledgeItems(kItems || []);

      // Auto check all lessons for practice config
      const allIds = (res.lessons || []).map((l: any) => l.id);
      setPracticeConfig(prev => ({
        ...prev,
        selectedLessons: allIds
      }));
    } catch (err) {
      console.error('Error loading course summary contents:', err);
      showToast('Có lỗi xảy ra khi tải dữ liệu khóa học.');
    } finally {
      setLoading(false);
    }
  }, [activeCourse]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper lists of syllabus items currently in the knowledge hub
  const vocabInHub = useMemo(() => {
    return vocabList.filter(item => 
      knowledgeItems.some(ki => ki.item_type === 'vocabulary' && ki.item_id === item.id)
    );
  }, [vocabList, knowledgeItems]);

  const kanjiInHub = useMemo(() => {
    return kanjiList.filter(item => 
      knowledgeItems.some(ki => ki.item_type === 'kanji' && ki.item_id === item.id)
    );
  }, [kanjiList, knowledgeItems]);

  const grammarInHub = useMemo(() => {
    return grammarList.filter(item => 
      knowledgeItems.some(ki => ki.item_type === 'grammar' && ki.item_id === item.id)
    );
  }, [grammarList, knowledgeItems]);

  // Mastered items not yet imported to the knowledge hub
  const masteredVocabToImport = useMemo(() => {
    return vocabList.filter(item => 
      item.status === 'mastered' && 
      !knowledgeItems.some(ki => ki.item_type === 'vocabulary' && ki.item_id === item.id)
    );
  }, [vocabList, knowledgeItems]);

  const masteredKanjiToImport = useMemo(() => {
    return kanjiList.filter(item => 
      item.status === 'mastered' && 
      !knowledgeItems.some(ki => ki.item_type === 'kanji' && ki.item_id === item.id)
    );
  }, [kanjiList, knowledgeItems]);

  const masteredGrammarToImport = useMemo(() => {
    return grammarList.filter(item => 
      item.status === 'mastered' && 
      !knowledgeItems.some(ki => ki.item_type === 'grammar' && ki.item_id === item.id)
    );
  }, [grammarList, knowledgeItems]);

  // Filtered lists for tabs based on filters state
  const displayedVocab = useMemo(() => {
    let list = [...customVocabList, ...vocabInHub];
    if (filterLesson !== 'all') {
      const lId = parseInt(filterLesson);
      list = list.filter(v => v.lesson_id === lId);
    }
    if (filterStatus !== 'all') {
      if (filterStatus === 'custom') {
        list = list.filter(v => v.isCustom);
      } else {
        list = list.filter(v => !v.isCustom && v.status === filterStatus);
      }
    }
    return list.sort((a, b) => {
      if (a.lesson_id !== b.lesson_id) return a.lesson_id - b.lesson_id;
      return a.id - b.id;
    });
  }, [customVocabList, vocabInHub, filterLesson, filterStatus]);

  const displayedKanji = useMemo(() => {
    let list = [...customKanjiList, ...kanjiInHub];
    if (filterLesson !== 'all') {
      const lId = parseInt(filterLesson);
      list = list.filter(k => k.lesson_id === lId);
    }
    if (filterStatus !== 'all') {
      if (filterStatus === 'custom') {
        list = list.filter(k => k.isCustom);
      } else {
        list = list.filter(k => !k.isCustom && k.status === filterStatus);
      }
    }
    return list.sort((a, b) => {
      if (a.lesson_id !== b.lesson_id) return a.lesson_id - b.lesson_id;
      return a.id - b.id;
    });
  }, [customKanjiList, kanjiInHub, filterLesson, filterStatus]);

  const displayedGrammar = useMemo(() => {
    let list = [...customGrammarList, ...grammarInHub];
    if (filterLesson !== 'all') {
      const lId = parseInt(filterLesson);
      list = list.filter(g => g.lesson_id === lId);
    }
    if (filterStatus !== 'all') {
      if (filterStatus === 'custom') {
        list = list.filter(g => g.isCustom);
      } else {
        list = list.filter(g => !g.isCustom && g.status === filterStatus);
      }
    }
    return list.sort((a, b) => {
      if (a.lesson_id !== b.lesson_id) return a.lesson_id - b.lesson_id;
      return a.id - b.id;
    });
  }, [customGrammarList, grammarInHub, filterLesson, filterStatus]);

  const filteredLessons = useMemo(() => {
    return lessons.filter(l => {
      if ((l.course || 'minna') !== activeCourse) return false;
      if (activeCourse === 'marugoto') return true;
      if (level === 'N5') return l.id >= 1 && l.id <= 25;
      return l.id >= 26 && l.id <= 50;
    });
  }, [lessons, activeCourse, level]);

  const lessonsInHub = useMemo(() => {
    return filteredLessons.filter(l => {
      const sysVocab = vocabInHub.filter(v => v.lesson_id === l.id).length;
      const sysKanji = kanjiInHub.filter(k => k.lesson_id === l.id).length;
      const sysGrammar = grammarInHub.filter(g => g.lesson_id === l.id).length;
      const custVocab = customVocabList.filter(v => v.lesson_id === l.id).length;
      const custKanji = customKanjiList.filter(k => k.lesson_id === l.id).length;
      const custGrammar = customGrammarList.filter(g => g.lesson_id === l.id).length;
      
      return (sysVocab + sysKanji + sysGrammar + custVocab + custKanji + custGrammar) > 0;
    });
  }, [filteredLessons, vocabInHub, kanjiInHub, grammarInHub, customVocabList, customKanjiList, customGrammarList]);

  // Custom Item Modal actions (CRUD)
  const openVocabModal = (item?: VocabItem) => {
    if (item) {
      setEditingVocabId(item.id);
      setVocabForm({
        hiragana: item.hiragana,
        romaji: item.romaji,
        vietnamese_meaning: item.vietnamese_meaning,
        word_type: item.word_type || '',
        japanese_example: item.japanese_example || '',
        example_meaning: item.example_meaning || '',
        mnemonic_tip: item.mnemonic_tip || ''
      });
    } else {
      setEditingVocabId(null);
      setVocabForm({
        hiragana: '',
        romaji: '',
        vietnamese_meaning: '',
        word_type: '',
        japanese_example: '',
        example_meaning: '',
        mnemonic_tip: ''
      });
    }
    setVocabModalOpen(true);
  };

  const saveVocab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocabForm.hiragana || !vocabForm.romaji || !vocabForm.vietnamese_meaning) {
      showToast('Vui lòng điền đầy đủ Hiragana, Romaji và Nghĩa tiếng Việt.');
      return;
    }
    try {
      const payload = {
        lesson_id: selectedLessonId,
        ...vocabForm
      };
      if (editingVocabId) {
        await api.put(`/api/user/custom/vocabulary/${editingVocabId}`, payload);
        showToast('Cập nhật từ vựng thành công!');
      } else {
        await api.post('/api/user/custom/vocabulary', payload);
        showToast('Thêm từ vựng thành công!');
      }
      setVocabModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu dữ liệu từ vựng.');
    }
  };

  const deleteVocab = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa từ vựng cá nhân này không?')) return;
    try {
      await api.delete(`/api/user/custom/vocabulary/${id}`);
      showToast('Đã xóa từ vựng.');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa từ vựng.');
    }
  };

  // Kanji CRUD actions
  const openKanjiModal = (item?: KanjiItem) => {
    if (item) {
      setEditingKanjiId(item.id);
      setKanjiForm({
        character: item.character,
        stroke_count: item.stroke_count || '',
        onyomi: item.onyomi || '',
        kunyomi: item.kunyomi || '',
        sino_vietnamese: item.sino_vietnamese || '',
        vietnamese_meaning: item.vietnamese_meaning,
        mnemonic_tip: item.mnemonic_tip || '',
        compounds: item.compounds || ''
      });
    } else {
      setEditingKanjiId(null);
      setKanjiForm({
        character: '',
        stroke_count: '',
        onyomi: '',
        kunyomi: '',
        sino_vietnamese: '',
        vietnamese_meaning: '',
        mnemonic_tip: '',
        compounds: ''
      });
    }
    setKanjiModalOpen(true);
  };

  const saveKanji = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kanjiForm.character || !kanjiForm.vietnamese_meaning) {
      showToast('Vui lòng điền đầy đủ Chữ Hán và Nghĩa tiếng Việt.');
      return;
    }
    try {
      const payload = {
        lesson_id: selectedLessonId,
        ...kanjiForm
      };
      if (editingKanjiId) {
        await api.put(`/api/user/custom/kanji/${editingKanjiId}`, payload);
        showToast('Cập nhật chữ Hán thành công!');
      } else {
        await api.post('/api/user/custom/kanji', payload);
        showToast('Thêm chữ Hán thành công!');
      }
      setKanjiModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu chữ Hán.');
    }
  };

  const deleteKanji = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chữ Hán cá nhân này không?')) return;
    try {
      await api.delete(`/api/user/custom/kanji/${id}`);
      showToast('Đã xóa chữ Hán.');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa.');
    }
  };

  // Grammar CRUD actions
  const openGrammarModal = (item?: GrammarItem) => {
    if (item) {
      setEditingGrammarId(item.id);
      setGrammarForm({
        title: item.title,
        meaning: item.meaning,
        structure: item.structure || '',
        vietnamese_explanation: item.vietnamese_explanation || '',
        japanese_example: item.japanese_example || '',
        example_meaning: item.example_meaning || '',
        romaji_example: item.romaji_example || '',
        notes: item.notes || ''
      });
    } else {
      setEditingGrammarId(null);
      setGrammarForm({
        title: '',
        meaning: '',
        structure: '',
        vietnamese_explanation: '',
        japanese_example: '',
        example_meaning: '',
        romaji_example: '',
        notes: ''
      });
    }
    setGrammarModalOpen(true);
  };

  const saveGrammar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grammarForm.title || !grammarForm.meaning) {
      showToast('Vui lòng điền cấu trúc và giải nghĩa mẫu câu.');
      return;
    }
    try {
      const payload = {
        lesson_id: selectedLessonId,
        ...grammarForm
      };
      if (editingGrammarId) {
        await api.put(`/api/user/custom/grammar/${editingGrammarId}`, payload);
        showToast('Cập nhật mẫu câu thành công!');
      } else {
        await api.post('/api/user/custom/grammar', payload);
        showToast('Thêm mẫu câu thành công!');
      }
      setGrammarModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu.');
    }
  };

  const deleteGrammar = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mẫu câu cá nhân này không?')) return;
    try {
      await api.delete(`/api/user/custom/grammar/${id}`);
      showToast('Đã xóa mẫu câu.');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa mẫu câu.');
    }
  };

  // Switch Course
  const handleCourseSwitch = (course: 'minna' | 'marugoto') => {
    setActiveCourse(course);
    localStorage.setItem('activeCourse', course);
    const nextLessonId = course === 'minna' ? 1 : 101;
    setSelectedLessonId(nextLessonId);
    localStorage.setItem('selectedLessonId', nextLessonId.toString());
    setFilterLesson('all');
  };

  const handleLevelChange = (selectedLevel: 'N5' | 'N4') => {
    setLevel(selectedLevel);
    setFilterLesson('all');
  };

  const handleImportBulk = async (itemType: 'vocabulary' | 'kanji' | 'grammar', itemsToImport: any[]) => {
    if (itemsToImport.length === 0) return;
    setLoading(true);
    try {
      const payload = {
        items: itemsToImport.map(item => ({
          item_type: itemType,
          item_id: item.id
        }))
      };
      await api.post('/api/user/knowledge-items/add-bulk', payload);
      showToast(`Đã thêm ${itemsToImport.length} mục vào phòng ôn tập thành công!`);
      const kItems = await api.get('/api/user/knowledge-items');
      setKnowledgeItems(kItems || []);
    } catch (err: any) {
      console.error('Failed to import bulk:', err);
      showToast('Có lỗi xảy ra khi nhập dữ liệu ôn tập.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromHub = async (itemType: 'vocabulary' | 'kanji' | 'grammar', itemId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này khỏi phòng ôn tập không?')) return;
    setLoading(true);
    try {
      await api.delete(`/api/user/knowledge-items/${itemType}/${itemId}`);
      showToast('Đã xóa học liệu khỏi phòng ôn tập.');
      const kItems = await api.get('/api/user/knowledge-items');
      setKnowledgeItems(kItems || []);
    } catch (err: any) {
      console.error('Failed to delete item from hub:', err);
      showToast('Có lỗi xảy ra khi xóa học liệu.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle lesson checklist selection in Practice config
  const togglePracticeLesson = (id: number) => {
    const current = practiceConfig.selectedLessons;
    if (current.includes(id)) {
      setPracticeConfig({ ...practiceConfig, selectedLessons: current.filter(x => x !== id) });
    } else {
      setPracticeConfig({ ...practiceConfig, selectedLessons: [...current, id] });
    }
  };

  const selectAllPracticeLessons = () => {
    const allIds = filteredLessons.map(l => l.id);
    setPracticeConfig({ ...practiceConfig, selectedLessons: allIds });
  };

  const deselectAllPracticeLessons = () => {
    setPracticeConfig({ ...practiceConfig, selectedLessons: [] });
  };

  // Update user progress status directly from the hub page
  const handleItemStatusChange = async (itemId: number, itemType: 'vocabulary' | 'kanji' | 'grammar', newStatus: 'not_learned' | 'learning' | 'mastered') => {
    try {
      await api.post('/api/user/progress', {
        item_type: itemType,
        item_id: itemId,
        status: newStatus
      });
      // Update local memory state immediately
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

  // Start Combined Practice Game
  const startPracticeGame = async () => {
    if (practiceConfig.selectedLessons.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 bài học để làm đề ôn tập.');
      return;
    }

    setLoading(true);
    try {
      let combinedVocab: VocabItem[] = [];
      let combinedKanji: KanjiItem[] = [];
      const selectedIds = practiceConfig.selectedLessons;

      // Extract syllabus items from loaded local memory (only those in the knowledge hub)
      if (practiceConfig.source === 'syllabus' || practiceConfig.source === 'both') {
        combinedVocab = [...combinedVocab, ...vocabInHub.filter(v => selectedIds.includes(v.lesson_id))];
        combinedKanji = [...combinedKanji, ...kanjiInHub.filter(k => selectedIds.includes(k.lesson_id))];
      }
      // Extract custom items from loaded local memory
      if (practiceConfig.source === 'custom' || practiceConfig.source === 'both') {
        combinedVocab = [...combinedVocab, ...customVocabList.filter(v => selectedIds.includes(v.lesson_id))];
        combinedKanji = [...combinedKanji, ...customKanjiList.filter(k => selectedIds.includes(k.lesson_id))];
      }

      let finalDataSet: any[] = [];
      if (practiceConfig.contentType === 'vocab') {
        finalDataSet = combinedVocab;
      } else if (practiceConfig.contentType === 'kanji') {
        finalDataSet = combinedKanji;
      } else {
        // combine both
        finalDataSet = [
          ...combinedVocab.map(v => ({ ...v, practice_type: 'vocab' })),
          ...combinedKanji.map(k => ({ ...k, practice_type: 'kanji' }))
        ];
      }

      if (finalDataSet.length === 0) {
        showToast('Không tìm thấy học liệu nào trong phạm vi bài học và nguồn học liệu đã chọn.');
        setLoading(false);
        return;
      }

      // Shuffle data set
      finalDataSet.sort(() => Math.random() - 0.5);

      // Limit length if it is too long (e.g. max 20 questions)
      if (finalDataSet.length > 20) {
        finalDataSet = finalDataSet.slice(0, 20);
      }

      setGameData(finalDataSet);
      setCurrentQuestionIdx(0);
      setGameScore(0);
      setGameAnswers(Array(finalDataSet.length).fill(''));
      setGameFinished(false);

      if (practiceConfig.gameMode === 'speedrun') {
        setGameActive(true);
        generateSpeedrunChoices(finalDataSet[0], finalDataSet);
        setGameTimer(10);
      } else if (practiceConfig.gameMode === 'memory') {
        // Setup memory grid (needs pairs of 4-6 cards, total 8-12 cards)
        const size = Math.min(6, finalDataSet.length);
        const selected = finalDataSet.slice(0, size);
        
        let cards: any[] = [];
        selected.forEach((item, idx) => {
          const isVocab = item.hiragana !== undefined;
          const labelJP = isVocab ? item.hiragana : item.character;
          const labelVI = item.vietnamese_meaning;
          
          cards.push({ id: idx * 2, pairId: idx, label: labelJP, type: 'jp' });
          cards.push({ id: idx * 2 + 1, pairId: idx, label: labelVI, type: 'vi' });
        });
        
        cards.sort(() => Math.random() - 0.5);
        setMemoryCards(cards);
        setSelectedCards([]);
        setMatchedCards([]);
        setGameActive(true);
      } else {
        // written mode
        setGameActive(true);
      }
    } catch (err) {
      console.error('Failed to initialize combined game:', err);
      showToast('Có lỗi xảy ra khi thiết lập trò chơi.');
    } finally {
      setLoading(false);
    }
  };

  // Speedrun game choice generator
  const generateSpeedrunChoices = (currentItem: any, fullSet: any[]) => {
    const isVocab = currentItem.hiragana !== undefined;
    const correctVal = currentItem.vietnamese_meaning;
    
    // Pick 3 random distractor values
    const distractors = Array.from(new Set(
      fullSet
        .filter(item => item.vietnamese_meaning !== correctVal)
        .map(item => item.vietnamese_meaning)
    )).slice(0, 3);
    
    const choices = [correctVal, ...distractors];
    while (choices.length < 4) {
      choices.push(`Đáp án nhiễu ${choices.length + 1}`);
    }
    choices.sort(() => Math.random() - 0.5);
    setSpeedrunChoices(choices);
  };

  // Speedrun Game Timer effect
  useEffect(() => {
    if (!gameActive || practiceConfig.gameMode !== 'speedrun' || gameFinished) return;
    
    if (gameTimer === 0) {
      // Time is out, score as wrong and go next
      handleSpeedrunAnswer('');
      return;
    }

    const interval = setInterval(() => {
      setGameTimer(t => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameActive, gameTimer, gameFinished, practiceConfig.gameMode]);

  // Handle Speedrun choice submit
  const handleSpeedrunAnswer = (answer: string) => {
    const currentItem = gameData[currentQuestionIdx];
    const isCorrect = answer === currentItem.vietnamese_meaning;
    
    if (isCorrect) {
      setGameScore(s => s + 10);
    }

    const nextIdx = currentQuestionIdx + 1;
    if (nextIdx < gameData.length) {
      setCurrentQuestionIdx(nextIdx);
      generateSpeedrunChoices(gameData[nextIdx], gameData);
      setGameTimer(10);
    } else {
      setGameFinished(true);
    }
  };

  // Handle Memory Card Selection
  const handleCardClick = (cardIdx: number) => {
    if (selectedCards.length >= 2 || matchedCards.includes(cardIdx) || selectedCards.includes(cardIdx)) return;

    const newSelected = [...selectedCards, cardIdx];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const first = memoryCards[newSelected[0]];
      const second = memoryCards[newSelected[1]];
      
      if (first.pairId === second.pairId && first.type !== second.type) {
        // It's a match!
        setTimeout(() => {
          setMatchedCards(m => [...m, newSelected[0], newSelected[1]]);
          setSelectedCards([]);
          setGameScore(s => s + 20);
          
          if (matchedCards.length + 2 === memoryCards.length) {
            setGameFinished(true);
          }
        }, 600);
      } else {
        // No match, flip them back
        setTimeout(() => {
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  // Handle Written practice answer change
  const handleWrittenChange = (idx: number, val: string) => {
    const copy = [...gameAnswers];
    copy[idx] = val;
    setGameAnswers(copy);
  };

  // Submit Written answers for scoring
  const submitWrittenPractice = () => {
    let score = 0;
    gameData.forEach((item, idx) => {
      const correctAnswers = [
        item.hiragana?.toLowerCase().trim(),
        item.character?.toLowerCase().trim()
      ].filter(Boolean);
      
      const userAns = gameAnswers[idx]?.toLowerCase().trim();
      if (correctAnswers.includes(userAns)) {
        score++;
      }
    });

    const percent = Math.round((score / gameData.length) * 100);
    setGameScore(percent);
    setGameFinished(true);
  };

  // Sidebar Menu list
  const menuItems = activeCourse === 'marugoto' ? [
    { name: 'Từ vựng', id: 'vocab', icon: '📚', active: false },
    { name: 'Ngữ pháp', id: 'grammar', icon: '📖', active: false },
    { name: 'Luyện tập 4 kỹ năng', id: 'practice', icon: '⚡', active: false },
    { name: 'Tổng hợp kiến thức', id: 'summary', icon: '📝', active: false }
  ] : [
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
      
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm rounded-xl shadow-xl flex items-center space-x-2 animate-fade-in">
          <span>ℹ️</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Hamburger toggle button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden absolute top-4 left-4 z-40 p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer backdrop-blur-md active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 1. Sidebar Panel */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white dark:bg-[#0c1427]/95 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-5">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">🌸</span>
            <span className="text-sm font-black tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent uppercase">
              {activeCourse === 'marugoto' ? 'Marugoto A1' : 'Minna Nihongo'}
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200 text-xl p-1 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-0 select-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-100 hover:[&::-webkit-scrollbar-thumb]:bg-slate-450 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full px-4">
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
                } else if (item.id === 'mock-test') {
                  router.push('/mock-test');
                } else if (item.id === 'knowledge') {
                  // Stay here
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

        <SidebarSettings />
      </aside>

      {/* 2. Main content screen */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-20 lg:p-10 space-y-6">
        
        {/* Header segment */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
              TỔNG HỢP KIẾN THỨC & TỰ GHI NHỚ
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
              Duyệt tổng quan bài học, quản lý từ vựng, chữ Hán, mẫu ngữ pháp đã học và tự thêm
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto flex-wrap gap-2">
            {/* Level Switcher N5/N4 */}
            {activeCourse === 'minna' && (
              <div className="bg-slate-50 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex">
                <button
                  onClick={() => handleLevelChange('N5')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    level === 'N5'
                      ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  N5
                </button>
                <button
                  onClick={() => handleLevelChange('N4')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    level === 'N4'
                      ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  N4
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs bar */}
        {!gameActive && (
          <div className="flex border-b border-slate-200 dark:border-slate-850 p-1 bg-slate-100/65 dark:bg-slate-900/65 rounded-xl max-w-lg shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 text-center py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              📊 Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('vocab')}
              className={`flex-1 text-center py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'vocab'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              📚 Từ vựng
            </button>
            <button
              onClick={() => setActiveTab('kanji')}
              className={`flex-1 text-center py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'kanji'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              🉐 Chữ Hán
            </button>
            <button
              onClick={() => setActiveTab('grammar')}
              className={`flex-1 text-center py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'grammar'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              📝 Mẫu câu
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-xs font-semibold text-slate-400">Đang đồng bộ dữ liệu...</p>
          </div>
        )}

        {/* Tab 1: Overview Sheet */}
        {!loading && activeTab === 'overview' && !gameActive && (
          <div className="space-y-6 animate-fade-in">
            {/* Import banners panel */}
            {(masteredVocabToImport.length > 0 || masteredKanjiToImport.length > 0 || masteredGrammarToImport.length > 0) && (
              <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 space-y-3.5 shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">💡</span>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">BẠN CÓ HỌC LIỆU MỚI ĐÃ THUỘC</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hệ thống ghi nhận bạn vừa hoàn thành một số học liệu từ danh sách bài học. Bạn có muốn thêm vào phòng ôn tập cá nhân này không?
                </p>
                <div className="flex flex-wrap gap-3">
                  {masteredVocabToImport.length > 0 && (
                    <button
                      onClick={() => handleImportBulk('vocabulary', masteredVocabToImport)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 flex items-center space-x-1.5"
                    >
                      <span>📚 Thêm {masteredVocabToImport.length} từ vựng mới</span>
                    </button>
                  )}
                  {masteredGrammarToImport.length > 0 && (
                    <button
                      onClick={() => handleImportBulk('grammar', masteredGrammarToImport)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 flex items-center space-x-1.5"
                    >
                      <span>📝 Thêm {masteredGrammarToImport.length} mẫu câu mới</span>
                    </button>
                  )}
                  {masteredKanjiToImport.length > 0 && (
                    <button
                      onClick={() => handleImportBulk('kanji', masteredKanjiToImport)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 flex items-center space-x-1.5"
                    >
                      <span>🉐 Thêm {masteredKanjiToImport.length} chữ Hán mới</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pb-2">
              <h2 className="text-sm sm:text-base font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tóm tắt tiến trình phòng ôn tập</h2>
            </div>

            {lessonsInHub.length === 0 ? (
              <div className="text-center py-20 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/10 space-y-4">
                <span className="text-5xl block">📭</span>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350">Phòng ôn tập cá nhân hiện đang trống</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                    Học liệu từ các bài học chính khóa sẽ chỉ xuất hiện ở đây sau khi bạn học xong và chọn thêm vào để ôn tập. Bạn cũng có thể nhấn vào các tab chi tiết để tự thêm học liệu cá nhân tùy ý.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 shadow-md">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4">Bài học</th>
                      <th className="p-4">Từ vựng đã học</th>
                      <th className="p-4">Chữ Hán đã học</th>
                      <th className="p-4">Ngữ pháp đã học</th>
                      <th className="p-4">Học liệu bổ sung (Cá nhân)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                    {lessonsInHub.map((l) => {
                      const sysVocabCount = vocabInHub.filter(v => v.lesson_id === l.id).length;
                      const custVocabCount = customVocabList.filter(v => v.lesson_id === l.id).length;
                      const sysKanjiCount = kanjiInHub.filter(k => k.lesson_id === l.id).length;
                      const custKanjiCount = customKanjiList.filter(k => k.lesson_id === l.id).length;
                      const sysGrammarCount = grammarInHub.filter(g => g.lesson_id === l.id).length;
                      const custGrammarCount = customGrammarList.filter(g => g.lesson_id === l.id).length;

                      const hasCustom = custVocabCount > 0 || custKanjiCount > 0 || custGrammarCount > 0;

                      return (
                        <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="p-4 font-black text-slate-900 dark:text-white whitespace-nowrap">
                            {l.title.toLowerCase().startsWith('bài') ? l.title : `${activeCourse === 'marugoto' ? `Bài ${l.id - 100}` : `Bài ${l.id}`}: ${l.title}`}
                          </td>
                          <td className="p-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                            {sysVocabCount > 0 ? (
                              <span>📚 <span className="font-bold text-blue-600 dark:text-blue-400">{sysVocabCount}</span> từ</span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 font-normal italic">Chưa nhập</span>
                            )}
                          </td>
                          <td className="p-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                            {sysKanjiCount > 0 ? (
                              <span>🉐 <span className="font-bold text-emerald-600 dark:text-emerald-400">{sysKanjiCount}</span> chữ</span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 font-normal italic">Chưa nhập</span>
                            )}
                          </td>
                          <td className="p-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                            {sysGrammarCount > 0 ? (
                              <span>📝 <span className="font-bold text-indigo-600 dark:text-indigo-400">{sysGrammarCount}</span> mẫu</span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 font-normal italic">Chưa nhập</span>
                            )}
                          </td>
                          <td className="p-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                            {hasCustom ? (
                              <div className="flex flex-wrap gap-1.5">
                                {custVocabCount > 0 && (
                                  <span className="px-1.5 py-0.5 text-[10px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded font-bold">
                                    +{custVocabCount} từ vựng
                                  </span>
                                )}
                                {custKanjiCount > 0 && (
                                  <span className="px-1.5 py-0.5 text-[10px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded font-bold">
                                    +{custKanjiCount} Kanji
                                  </span>
                                )}
                                {custGrammarCount > 0 && (
                                  <span className="px-1.5 py-0.5 text-[10px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded font-bold">
                                    +{custGrammarCount} mẫu câu
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">Chưa bổ sung</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Vocabulary Detail */}
        {!loading && activeTab === 'vocab' && !gameActive && (
          <div className="space-y-4 animate-fade-in">
            {/* Filter controls */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">Bài học:</label>
                  <select
                    value={filterLesson}
                    onChange={(e) => setFilterLesson(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-700/60 cursor-pointer min-w-[130px] shadow-sm"
                  >
                    <option value="all">Tất cả các bài</option>
                    {filteredLessons.map(l => (
                      <option key={l.id} value={l.id}>
                        {activeCourse === 'marugoto' ? `Bài ${l.id - 100}` : `Bài ${l.id}`} - {l.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">Trạng thái:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-700/60 cursor-pointer min-w-[130px] shadow-sm"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="not_learned">Chưa học</option>
                    <option value="learning">Đang học</option>
                    <option value="mastered">Đã thuộc</option>
                    <option value="custom">Chỉ học liệu tự thêm</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => openVocabModal()}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5 self-start md:self-auto"
              >
                <span>➕</span>
                <span>Tự thêm từ mới</span>
              </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedVocab.map((v) => (
                <div
                  key={v.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    v.isCustom
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/15 border-indigo-200/80 dark:border-indigo-900/60 shadow-indigo-100/20'
                      : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                  } shadow-md relative group`}
                >
                  <div className="absolute top-3 right-3 flex items-center space-x-2">
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 rounded font-bold">
                      Bài {activeCourse === 'marugoto' ? v.lesson_id - 100 : v.lesson_id}
                    </span>
                    {v.isCustom ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-md">
                        Cá nhân
                      </span>
                    ) : (
                      <select
                        value={v.status || 'not_learned'}
                        onChange={(e) => handleItemStatusChange(v.id, 'vocabulary', e.target.value as any)}
                        className={`text-[10px] font-bold rounded px-1.5 py-0.5 border cursor-pointer focus:outline-none transition-colors ${
                          v.status === 'mastered'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-600 dark:text-emerald-400'
                            : v.status === 'learning'
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-600 dark:text-amber-400'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 text-slate-500 dark:text-slate-450'
                        }`}
                      >
                        <option value="not_learned">Chưa học</option>
                        <option value="learning">Đang học</option>
                        <option value="mastered">Đã thuộc</option>
                      </select>
                    )}
                  </div>

                  <div className="space-y-1 pr-14">
                    <div className="flex items-baseline space-x-2 flex-wrap">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">{v.hiragana}</span>
                      <span className="text-xs text-slate-450 font-medium">[{v.romaji}]</span>
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

                  <div className="absolute bottom-3 right-3 flex items-center space-x-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    {v.isCustom ? (
                      <>
                        <button
                          onClick={() => openVocabModal(v)}
                          className="p-1.5 text-[11px] font-bold text-slate-400 hover:text-blue-500 rounded bg-slate-100 dark:bg-slate-850 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteVocab(v.id)}
                          className="p-1.5 text-[11px] font-bold text-slate-400 hover:text-red-500 rounded bg-slate-100 dark:bg-slate-850 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                          title="Xóa bỏ"
                        >
                          🗑️
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRemoveFromHub('vocabulary', v.id)}
                        className="p-1.5 text-[11px] font-bold text-slate-400 hover:text-red-500 rounded bg-slate-100 dark:bg-slate-850 hover:bg-white dark:hover:bg-slate-800 cursor-pointer flex items-center space-x-1"
                        title="Xóa khỏi ôn tập"
                      >
                        <span>🗑️</span>
                        <span className="text-[10px] hidden md:inline">Bỏ ôn tập</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {displayedVocab.length === 0 && (
              <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/10">
                📭 Không tìm thấy từ vựng nào khớp với bộ lọc.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Kanji Detail */}
        {!loading && activeTab === 'kanji' && !gameActive && (
          <div className="space-y-4 animate-fade-in">
            {/* Filter controls */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">Bài học:</label>
                  <select
                    value={filterLesson}
                    onChange={(e) => setFilterLesson(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-700/60 cursor-pointer min-w-[130px] shadow-sm"
                  >
                    <option value="all">Tất cả các bài</option>
                    {filteredLessons.map(l => (
                      <option key={l.id} value={l.id}>
                        {activeCourse === 'marugoto' ? `Bài ${l.id - 100}` : `Bài ${l.id}`} - {l.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">Trạng thái:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-700/60 cursor-pointer min-w-[130px] shadow-sm"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="not_learned">Chưa học</option>
                    <option value="learning">Đang học</option>
                    <option value="mastered">Đã thuộc</option>
                    <option value="custom">Chỉ chữ Hán tự thêm</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => openKanjiModal()}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5 self-start md:self-auto"
              >
                <span>➕</span>
                <span>Tự thêm chữ mới</span>
              </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayedKanji.map((k) => (
                <div
                  key={k.id}
                  className={`p-4 rounded-2xl border transition-all flex space-x-3.5 ${
                    k.isCustom
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/15 border-indigo-200/80 dark:border-indigo-900/60 shadow-indigo-100/20'
                      : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                  } shadow-md relative group`}
                >
                  <div className="w-16 h-16 flex items-center justify-center bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200/75 dark:border-slate-800/80 text-3xl font-black text-slate-900 dark:text-white shadow-inner">
                    {k.character}
                  </div>
                  
                  <div className="flex-1 space-y-1 pr-10">
                    <div className="flex items-baseline space-x-1.5 flex-wrap">
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {k.sino_vietnamese || 'Hán Việt'}
                      </span>
                      {k.stroke_count && (
                        <span className="text-[10px] text-slate-400 font-semibold">({k.stroke_count} nét)</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-350 font-bold">Nghĩa: {k.vietnamese_meaning}</p>
                    
                    <div className="text-[10px] text-slate-400 font-medium space-y-0.5 pt-1 border-t border-slate-100 dark:border-slate-850">
                      {k.onyomi && <p>On: <span className="text-slate-650 dark:text-slate-400 font-semibold">{k.onyomi}</span></p>}
                      {k.kunyomi && <p>Kun: <span className="text-slate-650 dark:text-slate-400 font-semibold">{k.kunyomi}</span></p>}
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center space-x-2">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                      Bài {activeCourse === 'marugoto' ? k.lesson_id - 100 : k.lesson_id}
                    </span>
                    {k.isCustom ? (
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded">
                        Cá nhân
                      </span>
                    ) : (
                      <select
                        value={k.status || 'not_learned'}
                        onChange={(e) => handleItemStatusChange(k.id, 'kanji', e.target.value as any)}
                        className={`text-[9px] font-bold rounded px-1.5 py-0.5 border cursor-pointer focus:outline-none transition-colors ${
                          k.status === 'mastered'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-250 text-emerald-600 dark:text-emerald-400'
                            : k.status === 'learning'
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-250 text-amber-600 dark:text-amber-400'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <option value="not_learned">Chưa học</option>
                        <option value="learning">Đang học</option>
                        <option value="mastered">Đã thuộc</option>
                      </select>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 flex items-center space-x-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    {k.isCustom ? (
                      <>
                        <button
                          onClick={() => openKanjiModal(k)}
                          className="p-1.5 text-[10px] font-bold text-slate-400 hover:text-blue-500 rounded bg-slate-100 dark:bg-slate-850 cursor-pointer"
                          title="Sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteKanji(k.id)}
                          className="p-1.5 text-[10px] font-bold text-slate-400 hover:text-red-500 rounded bg-slate-100 dark:bg-slate-850 cursor-pointer"
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRemoveFromHub('kanji', k.id)}
                        className="p-1.5 text-[10px] font-bold text-slate-400 hover:text-red-500 rounded bg-slate-100 dark:bg-slate-850 cursor-pointer flex items-center space-x-1"
                        title="Xóa khỏi ôn tập"
                      >
                        <span>🗑️</span>
                        <span className="text-[9px] hidden md:inline">Bỏ ôn tập</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {displayedKanji.length === 0 && (
              <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/10">
                📭 Không tìm thấy chữ Hán nào khớp với bộ lọc.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Grammar Detail */}
        {!loading && activeTab === 'grammar' && !gameActive && (
          <div className="space-y-4 animate-fade-in">
            {/* Filter controls */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">Bài học:</label>
                  <select
                    value={filterLesson}
                    onChange={(e) => setFilterLesson(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-700/60 cursor-pointer min-w-[130px] shadow-sm"
                  >
                    <option value="all">Tất cả các bài</option>
                    {filteredLessons.map(l => (
                      <option key={l.id} value={l.id}>
                        {activeCourse === 'marugoto' ? `Bài ${l.id - 100}` : `Bài ${l.id}`} - {l.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">Trạng thái:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-700/60 cursor-pointer min-w-[130px] shadow-sm"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="not_learned">Chưa học</option>
                    <option value="learning">Đang học</option>
                    <option value="mastered">Đã thuộc</option>
                    <option value="custom">Chỉ ngữ pháp tự thêm</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => openGrammarModal()}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5 self-start md:self-auto"
              >
                <span>➕</span>
                <span>Tự thêm mẫu câu mới</span>
              </button>
            </div>

            {/* List */}
            <div className="space-y-4">
              {displayedGrammar.map((g) => (
                <div
                  key={g.id}
                  className={`p-6 rounded-2xl border transition-all ${
                    g.isCustom
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/15 border-indigo-200/80 dark:border-indigo-900/60 shadow-indigo-100/20'
                      : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                  } shadow-md relative group`}
                >
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500">
                      Bài {activeCourse === 'marugoto' ? g.lesson_id - 100 : g.lesson_id}
                    </span>
                    {g.isCustom ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-md">
                        Cá nhân
                      </span>
                    ) : (
                      <select
                        value={g.status || 'not_learned'}
                        onChange={(e) => handleItemStatusChange(g.id, 'grammar', e.target.value as any)}
                        className={`text-[10px] font-bold rounded px-1.5 py-0.5 border cursor-pointer focus:outline-none transition-colors ${
                          g.status === 'mastered'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-250 text-emerald-600 dark:text-emerald-400'
                            : g.status === 'learning'
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-250 text-amber-600 dark:text-amber-400'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <option value="not_learned">Chưa học</option>
                        <option value="learning">Đang học</option>
                        <option value="mastered">Đã thuộc</option>
                      </select>
                    )}
                  </div>

                  <div className="space-y-2 pr-14">
                    <h3 className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400">{g.title}</h3>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Ý nghĩa: {g.meaning}</p>
                    
                    {g.structure && (
                      <div className="bg-slate-50 dark:bg-slate-950/80 rounded-xl p-3 border border-slate-150 dark:border-slate-850/85">
                        <code className="text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-350">{g.structure}</code>
                      </div>
                    )}

                    {g.vietnamese_explanation && (
                      <p className="text-xs text-slate-500 dark:text-slate-450">{g.vietnamese_explanation}</p>
                    )}

                    {g.japanese_example && (
                      <div className="mt-4 border-l-4 border-slate-250 dark:border-slate-800 pl-3 py-1 space-y-1">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-300">{g.japanese_example}</p>
                        {g.romaji_example && <p className="text-[11px] text-slate-450 dark:text-slate-500">[{g.romaji_example}]</p>}
                        <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">{g.example_meaning}</p>
                      </div>
                    )}

                    {g.notes && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-2">📝 Chú thích: {g.notes}</p>
                    )}
                  </div>

                  <div className="absolute bottom-4 right-4 flex items-center space-x-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    {g.isCustom ? (
                      <>
                        <button
                          onClick={() => openGrammarModal(g)}
                          className="p-1.5 text-[10px] font-bold text-slate-400 hover:text-blue-500 rounded bg-slate-100 dark:bg-slate-850 cursor-pointer"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => deleteGrammar(g.id)}
                          className="p-1.5 text-[10px] font-bold text-slate-400 hover:text-red-500 rounded bg-slate-100 dark:bg-slate-850 cursor-pointer"
                        >
                          🗑️ Xóa
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRemoveFromHub('grammar', g.id)}
                        className="p-1.5 text-[10px] font-bold text-slate-400 hover:text-red-500 rounded bg-slate-100 dark:bg-slate-850 cursor-pointer flex items-center space-x-1"
                        title="Xóa khỏi ôn tập"
                      >
                        <span>🗑️</span>
                        <span className="text-[10px] hidden md:inline">Bỏ ôn tập</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {displayedGrammar.length === 0 && (
              <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/10">
                📭 Không tìm thấy mẫu câu nào khớp với bộ lọc.
              </div>
            )}

            {/* Button Luyện tập tổng hợp */}
            <div className="flex justify-center pt-6">
              <button
                onClick={() => {
                  const allLessonIds = filteredLessons.map(l => l.id);
                  setPracticeConfig(prev => ({
                    ...prev,
                    selectedLessons: allLessonIds
                  }));
                  setShowPracticeSetup(true);
                }}
                className="px-6 py-3 text-sm font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-900 dark:text-white rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center space-x-2"
              >
                <span>🎯</span>
                <span>Luyện tập tổng hợp</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Combined Practice Play Active */}
        {!loading && gameActive && (
          <div className="space-y-6">
              /* --- ACTIVE GAME PLAY WORKSPACE --- */
              <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden min-h-[480px]">
                
                {/* Close game play workspace */}
                <button
                  onClick={() => setGameActive(false)}
                  className="absolute top-4 right-4 z-40 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full hover:bg-slate-700 cursor-pointer"
                  title="Thoát trò chơi"
                >
                  ✕
                </button>

                {/* Finish game dashboard */}
                {gameFinished ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-fade-in text-center">
                    <span className="text-6xl">🏆</span>
                    <div>
                      <h3 className="text-2xl font-black text-white">HOÀN THÀNH BÀI ÔN TẬP!</h3>
                      <p className="text-xs text-slate-400 mt-1">Kết quả luyện tập của bạn đã được ghi nhận</p>
                    </div>

                    <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 flex justify-around w-full max-w-sm">
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Tổng số câu</span>
                        <span className="text-2xl font-black text-white">{gameData.length}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Chế độ</span>
                        <span className="text-xs font-bold text-blue-400 mt-1 block">
                          {practiceConfig.gameMode === 'speedrun' ? 'Speedrun' : practiceConfig.gameMode === 'memory' ? 'Memory' : 'Tự luận'}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Điểm số</span>
                        <span className="text-2xl font-black text-emerald-400">{gameScore}</span>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={startPracticeGame}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 font-bold text-xs cursor-pointer"
                      >
                        🔄 Chơi lại
                      </button>
                      <button
                        onClick={() => setGameActive(false)}
                        className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                      >
                        🏠 Trở về thiết lập
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Game Header: progress tracking */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div className="text-left">
                        <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase block">Tiến độ chơi</span>
                        <span className="text-xs font-black text-slate-200">
                          {practiceConfig.gameMode === 'memory' ? 'Lật ghép thẻ' : `Câu hỏi ${currentQuestionIdx + 1}/${gameData.length}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase block">Điểm số</span>
                        <span className="text-sm font-black text-emerald-400">{gameScore}</span>
                      </div>
                    </div>

                    {/* PROGRESS BAR */}
                    {practiceConfig.gameMode !== 'memory' && (
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${((currentQuestionIdx) / gameData.length) * 100}%` }}
                        />
                      </div>
                    )}

                    {/* MODE 1: SPEEDRUN REFLEX PLAY */}
                    {practiceConfig.gameMode === 'speedrun' && (
                      <div className="space-y-6 animate-fade-in">
                        {/* Countdown circle */}
                        <div className="flex justify-center">
                          <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center text-lg font-black transition-all ${
                            gameTimer <= 3 ? 'border-red-500 text-red-500 animate-pulse' : 'border-blue-500 text-blue-400'
                          }`}>
                            {gameTimer}s
                          </div>
                        </div>

                        {/* Question Panel */}
                        <div className="text-center space-y-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hỏi nghĩa tiếng Việt của:</span>
                          <h3 className="text-3xl font-black text-white">
                            {gameData[currentQuestionIdx]?.character || gameData[currentQuestionIdx]?.hiragana}
                          </h3>
                          {gameData[currentQuestionIdx]?.romaji && (
                            <p className="text-xs text-slate-400">[{gameData[currentQuestionIdx]?.romaji}]</p>
                          )}
                        </div>

                        {/* Options Buttons grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                          {speedrunChoices.map((choice, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSpeedrunAnswer(choice)}
                              className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm text-left transition-all active:scale-[0.98] cursor-pointer"
                            >
                              <span className="text-blue-500 mr-2 font-bold">{idx + 1}.</span>
                              {choice}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* MODE 2: MEMORY MATCH FLIP PLAY */}
                    {practiceConfig.gameMode === 'memory' && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="text-center">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Lật và ghép đôi thẻ tương thích</span>
                          <p className="text-[11px] text-slate-400 mt-1">Nối từ tiếng Nhật với nghĩa tương ứng</p>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
                          {memoryCards.map((card, idx) => {
                            const isSelected = selectedCards.includes(idx);
                            const isMatched = matchedCards.includes(idx);
                            
                            return (
                              <button
                                key={card.id}
                                onClick={() => handleCardClick(idx)}
                                disabled={isMatched}
                                className={`h-24 rounded-2xl border transition-all text-xs font-bold p-2 flex items-center justify-center text-center cursor-pointer ${
                                  isMatched
                                    ? 'bg-emerald-950/20 border-emerald-800 text-emerald-400 opacity-60 shadow-inner'
                                    : isSelected
                                      ? 'bg-blue-600 border-blue-500 text-slate-900 shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-105'
                                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                                }`}
                              >
                                {isMatched || isSelected ? card.label : '❓'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* MODE 3: WRITTEN TEST PLAY */}
                    {practiceConfig.gameMode === 'write' && (
                      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
                        <div className="text-center border-b border-slate-900 pb-3">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Gõ cách viết tiếng Nhật (Hiragana hoặc Kanji)</span>
                        </div>

                        <div className="space-y-4 max-h-96 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
                          {gameData.map((item, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="text-left">
                                <span className="text-[10px] text-blue-500 font-black">CÂU HỎI {idx + 1}</span>
                                <h4 className="text-sm font-bold text-white mt-0.5">{item.vietnamese_meaning}</h4>
                                {item.word_type && <span className="text-[9px] px-1.5 bg-slate-800 text-slate-400 rounded">{item.word_type}</span>}
                              </div>
                              <input
                                type="text"
                                value={gameAnswers[idx] || ''}
                                onChange={(e) => handleWrittenChange(idx, e.target.value)}
                                placeholder="Cách viết tiếng Nhật..."
                                className="bg-slate-950 border border-slate-800 focus:border-blue-700/60 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none w-full sm:w-64 font-bold"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="text-center pt-2">
                          <button
                            onClick={submitWrittenPractice}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 font-black text-xs cursor-pointer active:scale-95 shadow-md"
                          >
                            📝 Nộp bài chấm điểm
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

      </main>

      {/* --- POPUP MODAL FOR ADDING/EDITING VOCABULARY --- */}
      {vocabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl p-6 animate-scale-up space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">
                {editingVocabId ? 'Sửa từ vựng cá nhân' : 'Thêm từ vựng mới'}
              </h3>
              <button
                onClick={() => setVocabModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveVocab} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block">Cách viết (Hiragana)*</label>
                  <input
                    type="text"
                    required
                    value={vocabForm.hiragana}
                    onChange={(e) => setVocabForm({ ...vocabForm, hiragana: e.target.value })}
                    placeholder="わたし"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block">Phiên âm (Romaji)*</label>
                  <input
                    type="text"
                    required
                    value={vocabForm.romaji}
                    onChange={(e) => setVocabForm({ ...vocabForm, romaji: e.target.value })}
                    placeholder="watashi"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Nghĩa tiếng Việt*</label>
                <input
                  type="text"
                  required
                  value={vocabForm.vietnamese_meaning}
                  onChange={(e) => setVocabForm({ ...vocabForm, vietnamese_meaning: e.target.value })}
                  placeholder="Tôi"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Từ loại (Danh từ, động từ...)</label>
                <input
                  type="text"
                  value={vocabForm.word_type}
                  onChange={(e) => setVocabForm({ ...vocabForm, word_type: e.target.value })}
                  placeholder="Đại từ, Danh từ, Động từ..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Câu ví dụ tiếng Nhật</label>
                <input
                  type="text"
                  value={vocabForm.japanese_example}
                  onChange={(e) => setVocabForm({ ...vocabForm, japanese_example: e.target.value })}
                  placeholder="私は学生です。"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Dịch nghĩa câu ví dụ</label>
                <input
                  type="text"
                  value={vocabForm.example_meaning}
                  onChange={(e) => setVocabForm({ ...vocabForm, example_meaning: e.target.value })}
                  placeholder="Tôi là sinh viên."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Mẹo nhớ / Ghi chú</label>
                <textarea
                  value={vocabForm.mnemonic_tip}
                  onChange={(e) => setVocabForm({ ...vocabForm, mnemonic_tip: e.target.value })}
                  placeholder="Mẹo nhớ từ vựng..."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 font-sans"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setVocabModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 font-bold text-xs cursor-pointer shadow-md"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POPUP MODAL FOR ADDING/EDITING KANJI --- */}
      {kanjiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl p-6 animate-scale-up space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">
                {editingKanjiId ? 'Sửa chữ Hán cá nhân' : 'Thêm chữ Hán mới'}
              </h3>
              <button
                onClick={() => setKanjiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveKanji} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block">Chữ Hán (Ký tự)*</label>
                  <input
                    type="text"
                    required
                    value={kanjiForm.character}
                    onChange={(e) => setKanjiForm({ ...kanjiForm, character: e.target.value })}
                    placeholder="私"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block">Số nét vẽ</label>
                  <input
                    type="text"
                    value={kanjiForm.stroke_count}
                    onChange={(e) => setKanjiForm({ ...kanjiForm, stroke_count: e.target.value })}
                    placeholder="7"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block">Âm Hán Việt</label>
                  <input
                    type="text"
                    value={kanjiForm.sino_vietnamese}
                    onChange={(e) => setKanjiForm({ ...kanjiForm, sino_vietnamese: e.target.value })}
                    placeholder="TƯ"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block">Nghĩa tiếng Việt*</label>
                  <input
                    type="text"
                    required
                    value={kanjiForm.vietnamese_meaning}
                    onChange={(e) => setKanjiForm({ ...kanjiForm, vietnamese_meaning: e.target.value })}
                    placeholder="Tôi, tư nhân"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block">Onyomi</label>
                  <input
                    type="text"
                    value={kanjiForm.onyomi}
                    onChange={(e) => setKanjiForm({ ...kanjiForm, onyomi: e.target.value })}
                    placeholder="シ"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block">Kunyomi</label>
                  <input
                    type="text"
                    value={kanjiForm.kunyomi}
                    onChange={(e) => setKanjiForm({ ...kanjiForm, kunyomi: e.target.value })}
                    placeholder="わたし、わたくし"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Từ ghép (Compounds)</label>
                <input
                  type="text"
                  value={kanjiForm.compounds}
                  onChange={(e) => setKanjiForm({ ...kanjiForm, compounds: e.target.value })}
                  placeholder="私立 (しりつ): tư lập..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Mẹo nhớ chữ Hán</label>
                <textarea
                  value={kanjiForm.mnemonic_tip}
                  onChange={(e) => setKanjiForm({ ...kanjiForm, mnemonic_tip: e.target.value })}
                  placeholder="Mẹo nhớ chữ Hán qua hình ảnh/câu chuyện..."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 font-sans"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setKanjiModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 font-bold text-xs cursor-pointer shadow-md"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POPUP MODAL FOR ADDING/EDITING GRAMMAR/SENTENCE PATTERN --- */}
      {grammarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl p-6 animate-scale-up space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">
                {editingGrammarId ? 'Sửa mẫu câu cá nhân' : 'Thêm mẫu câu mới'}
              </h3>
              <button
                onClick={() => setGrammarModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveGrammar} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Cấu trúc ngữ pháp (Ví dụ: N1 は N2 です)*</label>
                <input
                  type="text"
                  required
                  value={grammarForm.title}
                  onChange={(e) => setGrammarForm({ ...grammarForm, title: e.target.value })}
                  placeholder="N1 は N2 です"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Ý nghĩa chính*</label>
                <input
                  type="text"
                  required
                  value={grammarForm.meaning}
                  onChange={(e) => setGrammarForm({ ...grammarForm, meaning: e.target.value })}
                  placeholder="N1 là N2"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Công thức chi tiết (Structure)</label>
                <input
                  type="text"
                  value={grammarForm.structure}
                  onChange={(e) => setGrammarForm({ ...grammarForm, structure: e.target.value })}
                  placeholder="[Danh từ 1] + は + [Danh từ 2] + です"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Giải nghĩa tiếng Việt chi tiết</label>
                <textarea
                  value={grammarForm.vietnamese_explanation}
                  onChange={(e) => setGrammarForm({ ...grammarForm, vietnamese_explanation: e.target.value })}
                  placeholder="Giải thích cách dùng, hoàn cảnh sử dụng..."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block">Ví dụ tiếng Nhật</label>
                  <input
                    type="text"
                    value={grammarForm.japanese_example}
                    onChange={(e) => setGrammarForm({ ...grammarForm, japanese_example: e.target.value })}
                    placeholder="私はマイクです。"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block">Phiên âm ví dụ (Romaji)</label>
                  <input
                    type="text"
                    value={grammarForm.romaji_example}
                    onChange={(e) => setGrammarForm({ ...grammarForm, romaji_example: e.target.value })}
                    placeholder="watashi wa maiku desu."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Dịch nghĩa ví dụ</label>
                <input
                  type="text"
                  value={grammarForm.example_meaning}
                  onChange={(e) => setGrammarForm({ ...grammarForm, example_meaning: e.target.value })}
                  placeholder="Tôi là Mike."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Chú thích thêm</label>
                <input
                  type="text"
                  value={grammarForm.notes}
                  onChange={(e) => setGrammarForm({ ...grammarForm, notes: e.target.value })}
                  placeholder="Lưu ý khi dùng..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setGrammarModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 font-bold text-xs cursor-pointer shadow-md"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- POPUP MODAL FOR COMBINED PRACTICE SETUP --- */}
      {showPracticeSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl p-6 animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">🎯 THIẾT LẬP ÔN TẬP TỔNG HỢP</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Luyện phản xạ từ vựng và chữ Hán qua nhiều bài học</p>
              </div>
              <button
                onClick={() => setShowPracticeSetup(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scope selector */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">1. Chọn phạm vi bài học:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={selectAllPracticeLessons}
                    className="px-2 py-0.5 text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    Chọn tất cả
                  </button>
                  <button
                    onClick={deselectAllPracticeLessons}
                    className="px-2 py-0.5 text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    Bỏ chọn hết
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2.5 border border-slate-100 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-250 dark:[&::-webkit-scrollbar-thumb]:bg-slate-850 [&::-webkit-scrollbar-thumb]:rounded-full">
                {filteredLessons.map(l => {
                  const isSelected = practiceConfig.selectedLessons.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => togglePracticeLesson(l.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-slate-900 dark:text-white shadow-md'
                          : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Bài {activeCourse === 'marugoto' ? l.id - 100 : l.id}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1.5">
              {/* Sources selector */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350 block">2. Nguồn học liệu:</span>
                <div className="bg-slate-50 dark:bg-slate-950/30 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col space-y-1">
                  {[
                    { id: 'syllabus', name: 'Học liệu hệ thống' },
                    { id: 'custom', name: 'Học liệu cá nhân' },
                    { id: 'both', name: 'Kết hợp cả hai' }
                  ].map(src => (
                    <button
                      key={src.id}
                      onClick={() => setPracticeConfig({ ...practiceConfig, source: src.id as any })}
                      className={`w-full py-1.5 px-2.5 text-xs font-bold text-left rounded-xl transition-all cursor-pointer ${
                        practiceConfig.source === src.id
                          ? 'bg-blue-600 text-slate-900 dark:text-white shadow-md'
                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      {src.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content type selector */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350 block">3. Nội dung ôn tập:</span>
                <div className="bg-slate-50 dark:bg-slate-950/30 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col space-y-1">
                  {[
                    { id: 'vocab', name: 'Chỉ Từ vựng' },
                    { id: 'kanji', name: 'Chỉ Chữ Hán' },
                    { id: 'both', name: 'Từ vựng & Chữ Hán' }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setPracticeConfig({ ...practiceConfig, contentType: type.id as any })}
                      className={`w-full py-1.5 px-2.5 text-xs font-bold text-left rounded-xl transition-all cursor-pointer ${
                        practiceConfig.contentType === type.id
                          ? 'bg-blue-600 text-slate-900 dark:text-white shadow-md'
                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Mode selector */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350 block">4. Chế độ luyện tập:</span>
                <div className="bg-slate-50 dark:bg-slate-950/30 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col space-y-1">
                  {[
                    { id: 'speedrun', name: '⚡ Speedrun' },
                    { id: 'memory', name: '🃏 Memory Match' },
                    { id: 'write', name: '✏️ Tự luận' }
                  ].map(gm => (
                    <button
                      key={gm.id}
                      onClick={() => setPracticeConfig({ ...practiceConfig, gameMode: gm.id as any })}
                      className={`w-full py-1.5 px-2.5 text-xs font-bold text-left rounded-xl transition-all cursor-pointer ${
                        practiceConfig.gameMode === gm.id
                          ? 'bg-blue-600 text-slate-900 dark:text-white shadow-md'
                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      {gm.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setShowPracticeSetup(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPracticeSetup(false);
                  startPracticeGame();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-900 dark:text-white font-black text-xs cursor-pointer shadow-md"
              >
                🚀 Bắt đầu ôn tập
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

