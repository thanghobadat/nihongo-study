'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { api } from '../utils/api';
import { playAudioWithFallback, speakTTS } from '../utils/audioHelper';
import { hiraganaData, katakanaData, KanaItem } from '../kana/kanaData';
import { getGlobalKanjiForm, getRelatedVocabForKanji } from '../utils/kanjiFormLookup';

interface QuickLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'vocab' | 'kanji' | 'grammar' | 'kana' | 'radicals';
  currentLessonId?: number | string;
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
}

// In-memory cache for course summary to avoid repeated API requests
let cachedVocabList: VocabItem[] | null = null;
let cachedKanjiList: KanjiItem[] | null = null;
let cachedGrammarList: GrammarItem[] | null = null;
let cachedLessonsList: { id: number; title: string }[] | null = null;

export default function QuickLookupModal({
  isOpen,
  onClose,
  initialTab = 'vocab',
  currentLessonId = 1
}: QuickLookupModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const normalizedInitialTab = initialTab === 'radicals' ? 'kanji' : initialTab;
  const [activeTab, setActiveTab] = useState<'vocab' | 'kanji' | 'grammar' | 'kana'>(normalizedInitialTab);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync initialTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab === 'radicals' ? 'kanji' : initialTab);
    }
  }, [isOpen, initialTab]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // ==============================================================
  // DATA FETCHING: VOCABULARY & KANJI FROM COURSE SUMMARY
  // ==============================================================
  const [vocabList, setVocabList] = useState<VocabItem[]>(cachedVocabList || []);
  const [kanjiList, setKanjiList] = useState<KanjiItem[]>(cachedKanjiList || []);
  const [grammarList, setGrammarList] = useState<GrammarItem[]>(cachedGrammarList || []);
  const [lessons, setLessons] = useState<{ id: number; title: string }[]>(cachedLessonsList || []);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!isOpen || (cachedVocabList !== null && cachedKanjiList !== null && cachedGrammarList !== null)) return;

    let isCancelled = false;
    async function fetchCourseSummary() {
      setLoadingData(true);
      try {
        const res: any = await api.get('/api/user/course-summary?course=minna');
        if (res && !isCancelled) {
          const loadedLessons = res.lessons || res.data?.lessons || [];
          setLessons(loadedLessons);
          cachedLessonsList = loadedLessons;

          // Parse Kanji (raw + custom)
          const rawKanji = res.kanji || res.data?.kanji || [];
          const customKanji = res.customKanji || res.data?.customKanji || [];
          const allKanji: KanjiItem[] = [...rawKanji, ...customKanji];
          setKanjiList(allKanji);
          cachedKanjiList = allKanji;

          // Parse Vocabulary (raw + custom) with Kanji form enriched
          const rawVocab = res.vocabulary || res.data?.vocabulary || [];
          const customVocab = res.customVocabulary || res.data?.customVocabulary || [];
          const allVocabs: VocabItem[] = [...rawVocab, ...customVocab].map((item: any) => {
            const kForm = getGlobalKanjiForm(item.hiragana, allKanji);
            return {
              ...item,
              kanji_form: kForm && kForm !== item.hiragana ? kForm : undefined
            };
          });
          setVocabList(allVocabs);
          cachedVocabList = allVocabs;

          // Parse Grammar
          const rawGrammar = res.grammar || res.data?.grammar || [];
          setGrammarList(rawGrammar);
          cachedGrammarList = rawGrammar;
        }
      } catch (err) {
        console.warn('[QuickLookup] Error fetching course summary:', err);
      } finally {
        if (!isCancelled) setLoadingData(false);
      }
    }

    fetchCourseSummary();
    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  // ==============================================================
  // 1. VOCABULARY LOOKUP STATE & LOGIC
  // ==============================================================
  const [vocabSearch, setVocabSearch] = useState('');
  const [selectedLessonFilter, setSelectedLessonFilter] = useState<string>(
    currentLessonId ? currentLessonId.toString() : 'all'
  );

  useEffect(() => {
    if (currentLessonId) {
      setSelectedLessonFilter(currentLessonId.toString());
    }
  }, [currentLessonId]);

  const filteredVocab = useMemo(() => {
    const q = vocabSearch.trim().toLowerCase();
    return vocabList.filter((item) => {
      if (selectedLessonFilter !== 'all' && item.lesson_id.toString() !== selectedLessonFilter) {
        return false;
      }
      if (!q) return true;

      const kanjiForm = item.kanji_form || getGlobalKanjiForm(item.hiragana, kanjiList);
      const matchesHira = item.hiragana?.toLowerCase().includes(q);
      const matchesRomaji = item.romaji?.toLowerCase().includes(q);
      const matchesMeaning = item.vietnamese_meaning?.toLowerCase().includes(q);
      const matchesKanji = kanjiForm ? kanjiForm.toLowerCase().includes(q) : false;
      const matchesExample =
        item.japanese_example?.toLowerCase().includes(q) ||
        item.example_meaning?.toLowerCase().includes(q);

      return matchesHira || matchesRomaji || matchesMeaning || matchesKanji || matchesExample;
    });
  }, [vocabList, vocabSearch, selectedLessonFilter, kanjiList]);

  // ==============================================================
  // 2. KANJI VOCABULARY LOOKUP STATE & LOGIC
  // ==============================================================
  const [kanjiSearch, setKanjiSearch] = useState('');
  const [kanjiLessonFilter, setKanjiLessonFilter] = useState<string>('all');
  const [kanjiLevelFilter, setKanjiLevelFilter] = useState<'all' | 'n5' | 'n4'>('all');
  const [selectedKanjiDetail, setSelectedKanjiDetail] = useState<KanjiItem | null>(null);

  const filteredKanji = useMemo(() => {
    const q = kanjiSearch.trim().toLowerCase();
    return kanjiList.filter((item) => {
      // Filter by Lesson
      if (kanjiLessonFilter !== 'all' && item.lesson_id.toString() !== kanjiLessonFilter) {
        return false;
      }
      // Filter by Level (N5: Lesson 1-25, N4: Lesson 26-50)
      if (kanjiLevelFilter === 'n5' && item.lesson_id > 25) return false;
      if (kanjiLevelFilter === 'n4' && item.lesson_id <= 25) return false;

      if (!q) return true;

      const matchesChar = item.character?.toLowerCase().includes(q);
      const matchesSino = item.sino_vietnamese?.toLowerCase().includes(q);
      const matchesMeaning = item.vietnamese_meaning?.toLowerCase().includes(q);
      const matchesOn = item.onyomi?.toLowerCase().includes(q);
      const matchesKun = item.kunyomi?.toLowerCase().includes(q);
      const matchesCompounds = item.compounds?.toLowerCase().includes(q);

      return matchesChar || matchesSino || matchesMeaning || matchesOn || matchesKun || matchesCompounds;
    });
  }, [kanjiList, kanjiSearch, kanjiLessonFilter, kanjiLevelFilter]);

  // ==============================================================
  // 3. KANA (BẢNG CHỮ CÁI) LOOKUP STATE & LOGIC
  // ==============================================================
  const [kanaSearch, setKanaSearch] = useState('');
  const [kanaTypeFilter, setKanaTypeFilter] = useState<'all' | 'hiragana' | 'katakana'>('all');

  const allKanaItems = useMemo(() => {
    const hiras = hiraganaData.map(item => ({ ...item, type: 'hiragana' as const }));
    const katas = katakanaData.map(item => ({ ...item, type: 'katakana' as const }));
    return [...hiras, ...katas];
  }, []);

  const filteredKana = useMemo(() => {
    const q = kanaSearch.trim().toLowerCase();
    return allKanaItems.filter((item) => {
      if (kanaTypeFilter === 'hiragana' && item.type !== 'hiragana') return false;
      if (kanaTypeFilter === 'katakana' && item.type !== 'katakana') return false;

      if (!q) return true;

      const matchesChar = item.char.toLowerCase().includes(q);
      const matchesRomaji = item.romaji.toLowerCase().includes(q);
      const matchesMnemonic = item.mnemonic.toLowerCase().includes(q);

      return matchesChar || matchesRomaji || matchesMnemonic;
    });
  }, [allKanaItems, kanaSearch, kanaTypeFilter]);

  // ==============================================================
  // 4. GRAMMAR (MẪU CÂU) LOOKUP STATE & LOGIC
  // ==============================================================
  const [grammarSearch, setGrammarSearch] = useState('');
  const [grammarLessonFilter, setGrammarLessonFilter] = useState<string>('all');
  const [grammarLevelFilter, setGrammarLevelFilter] = useState<'all' | 'n5' | 'n4'>('all');

  const filteredGrammar = useMemo(() => {
    const q = grammarSearch.trim().toLowerCase();
    return grammarList.filter((item) => {
      // Filter by Lesson
      if (grammarLessonFilter !== 'all' && item.lesson_id.toString() !== grammarLessonFilter) {
        return false;
      }
      // Filter by Level (N5: Lesson 1-25, N4: Lesson 26-50)
      if (grammarLevelFilter === 'n5' && item.lesson_id > 25) return false;
      if (grammarLevelFilter === 'n4' && item.lesson_id <= 25) return false;

      if (!q) return true;

      const matchesTitle = item.title?.toLowerCase().includes(q);
      const matchesMeaning = item.meaning?.toLowerCase().includes(q);
      const matchesStructure = item.structure?.toLowerCase().includes(q);
      const matchesExplanation = item.vietnamese_explanation?.toLowerCase().includes(q);
      const matchesExample = item.japanese_example?.toLowerCase().includes(q);
      const matchesExampleMeaning = item.example_meaning?.toLowerCase().includes(q);

      return matchesTitle || matchesMeaning || matchesStructure || matchesExplanation || matchesExample || matchesExampleMeaning;
    });
  }, [grammarList, grammarSearch, grammarLessonFilter, grammarLevelFilter]);

  if (!isOpen || !mounted) return null;

  const modalContainerClass = isFullscreen
    ? 'w-screen h-screen fixed inset-0 rounded-none border-0'
    : 'w-full sm:w-[96vw] max-w-7xl h-full sm:h-[95vh] sm:rounded-3xl border-0 sm:border border-slate-200 dark:border-slate-800 shadow-2xl';

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-2 md:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div 
        className={`${modalContainerClass} bg-white dark:bg-[#0c1427] overflow-hidden flex flex-col transition-all duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/80 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-2xl shrink-0">🔍</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>Tra Cứu Nhanh</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  activeTab === 'vocab'
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900'
                    : activeTab === 'kanji'
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900'
                    : activeTab === 'grammar'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                }`}>
                  {activeTab === 'vocab' ? 'Từ vựng Minna' : activeTab === 'kanji' ? 'Từ vựng Kanji' : activeTab === 'grammar' ? 'Mẫu câu ngữ pháp' : 'Bảng chữ cái'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Tra cứu tức thời không làm gián đoạn bài học hiện tại
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Segmented control tab switcher */}
            <div className="flex items-center p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('vocab')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'vocab'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📚 Từ Vựng
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('kanji')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'kanji'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🉐 Từ Vựng Kanji
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('grammar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'grammar'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📖 Mẫu Câu
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('kana')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'kana'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🔤 Bảng Chữ Cái
              </button>
            </div>

            {/* Fullscreen Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? '🗗' : '⛶'}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Đóng (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 space-y-4">
          {/* ======================================================== */}
          {/* TAB 1: TRA CỨU TỪ VỰNG                                   */}
          {/* ======================================================== */}
          {activeTab === 'vocab' && (
            <div className="space-y-4 h-full flex flex-col">
              {/* Toolbar Controls */}
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={vocabSearch}
                    onChange={(e) => setVocabSearch(e.target.value)}
                    placeholder="Nhập chữ Kanji, Hiragana, Romaji hoặc nghĩa tiếng Việt (ví dụ: watashi, học, 私)..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    autoFocus
                  />
                  <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
                  {vocabSearch && (
                    <button
                      type="button"
                      onClick={() => setVocabSearch('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedLessonFilter}
                    onChange={(e) => setSelectedLessonFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="all">📚 Tất cả 50 bài học</option>
                    {lessons.length > 0 ? (
                      lessons.map(l => (
                        <option key={l.id} value={l.id.toString()}>
                          Bài {l.id}: {l.title}
                        </option>
                      ))
                    ) : (
                      Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num.toString()}>
                          Bài {num}
                        </option>
                      ))
                    )}
                  </select>

                  <span className="text-xs text-slate-400 font-bold whitespace-nowrap px-2">
                    {filteredVocab.length} từ
                  </span>
                </div>
              </div>

              {/* Vocab List Grid */}
              {loadingData ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
                  <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs">Đang tải toàn bộ kho từ vựng 50 bài...</p>
                </div>
              ) : filteredVocab.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20">
                  📭 Không tìm thấy từ vựng nào phù hợp với từ khóa "{vocabSearch}".
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredVocab.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all flex flex-col justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => playAudioWithFallback(item.kanji_form || item.hiragana, item.hiragana)}
                            className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                            title="Phát âm"
                          >
                            🔊
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                {item.kanji_form || item.hiragana}
                              </span>
                              {item.kanji_form && (
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                                  {item.hiragana}
                                </span>
                              )}
                              <span className="text-xs text-slate-400 font-medium">
                                ({item.romaji})
                              </span>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-500">
                                Bài {item.lesson_id}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">
                              {item.vietnamese_meaning}
                            </p>
                            {item.japanese_example && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 italic line-clamp-2">
                                Ví dụ: {item.japanese_example} - {item.example_meaning}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">
                            {item.word_type || 'Từ vựng'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              router.push(`/lessons/${item.lesson_id}?tab=vocab`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all shrink-0 cursor-pointer"
                            title="Mở bài học này"
                          >
                            Bài {item.lesson_id} ➔
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: TRA CỨU TỪ VỰNG KANJI (THAY THẾ BỘ THỦ)           */}
          {/* ======================================================== */}
          {activeTab === 'kanji' && (
            <div className="space-y-4 h-full flex flex-col">
              {/* Toolbar Controls */}
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={kanjiSearch}
                    onChange={(e) => setKanjiSearch(e.target.value)}
                    placeholder="Tìm theo chữ Hán, âm Hán Việt (Nhật, Bản, Học...), On/Kun, nghĩa tiếng Việt..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    autoFocus
                  />
                  <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
                  {kanjiSearch && (
                    <button
                      type="button"
                      onClick={() => setKanjiSearch('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {/* Lesson Filter */}
                  <select
                    value={kanjiLessonFilter}
                    onChange={(e) => setKanjiLessonFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="all">📚 Tất cả bài</option>
                    {lessons.length > 0 ? (
                      lessons.map(l => (
                        <option key={l.id} value={l.id.toString()}>
                          Bài {l.id}
                        </option>
                      ))
                    ) : (
                      Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num.toString()}>
                          Bài {num}
                        </option>
                      ))
                    )}
                  </select>

                  {/* Level Filter Buttons */}
                  <div className="inline-flex rounded-xl p-1 bg-slate-200/70 dark:bg-slate-800/70">
                    <button
                      type="button"
                      onClick={() => setKanjiLevelFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        kanjiLevelFilter === 'all'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => setKanjiLevelFilter('n5')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        kanjiLevelFilter === 'n5'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      🟢 N5
                    </button>
                    <button
                      type="button"
                      onClick={() => setKanjiLevelFilter('n4')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        kanjiLevelFilter === 'n4'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      🟡 N4
                    </button>
                  </div>

                  <span className="text-xs text-slate-400 font-bold whitespace-nowrap px-1">
                    {filteredKanji.length} chữ
                  </span>
                </div>
              </div>

              {/* Kanji Grid */}
              {loadingData ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
                  <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs">Đang tải toàn bộ kho chữ Kanji...</p>
                </div>
              ) : filteredKanji.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20">
                  📭 Không tìm thấy chữ Kanji nào phù hợp với từ khóa "{kanjiSearch}".
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredKanji.map((kanji) => {
                      const isN5 = kanji.lesson_id <= 25;
                      return (
                        <div
                          key={kanji.id}
                          onClick={() => setSelectedKanjiDetail(kanji)}
                          className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 hover:border-purple-400/50 dark:hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2.5 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white group-hover:scale-105 transition-transform">
                                {kanji.character}
                              </span>
                              <div>
                                <span className="text-sm font-black text-purple-600 dark:text-purple-400 block">
                                  {kanji.sino_vietnamese || 'HÁN TỰ'}
                                </span>
                                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold block line-clamp-1">
                                  {kanji.vietnamese_meaning}
                                </span>
                              </div>
                            </div>

                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${
                              isN5
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            }`}>
                              {isN5 ? 'N5' : 'N4'} • Bài {kanji.lesson_id}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                            {kanji.onyomi && (
                              <p className="truncate">
                                <span className="font-bold text-slate-400">On:</span> {kanji.onyomi}
                              </p>
                            )}
                            {kanji.kunyomi && (
                              <p className="truncate">
                                <span className="font-bold text-slate-400">Kun:</span> {kanji.kunyomi}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playAudioWithFallback(kanji.character);
                              }}
                              className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 text-purple-600 dark:text-purple-400 flex items-center justify-center hover:scale-105 transition-transform text-xs cursor-pointer"
                              title="Phát âm"
                            >
                              🔊
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                                router.push(`/lessons/${kanji.lesson_id}?tab=kanji`);
                              }}
                              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-all cursor-pointer"
                              title="Mở bài học này"
                            >
                              Bài {kanji.lesson_id} ➔
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: TRA CỨU MẪU CÂU NGỮ PHÁP (GRAMMAR)                */}
          {/* ======================================================== */}
          {activeTab === 'grammar' && (
            <div className="space-y-4 h-full flex flex-col">
              {/* Toolbar Controls */}
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={grammarSearch}
                    onChange={(e) => setGrammarSearch(e.target.value)}
                    placeholder="Tìm theo mẫu câu (〜は〜です), ý nghĩa, cấu trúc, giải thích hoặc ví dụ..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    autoFocus
                  />
                  <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
                  {grammarSearch && (
                    <button
                      type="button"
                      onClick={() => setGrammarSearch('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {/* Filter by JLPT Level */}
                  <div className="inline-flex rounded-xl p-1 bg-slate-200/70 dark:bg-slate-800/70">
                    <button
                      type="button"
                      onClick={() => setGrammarLevelFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        grammarLevelFilter === 'all'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => setGrammarLevelFilter('n5')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        grammarLevelFilter === 'n5'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      N5 (Bài 1-25)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGrammarLevelFilter('n4')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        grammarLevelFilter === 'n4'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      N4 (Bài 26-50)
                    </button>
                  </div>

                  {/* Filter by Lesson */}
                  <select
                    value={grammarLessonFilter}
                    onChange={(e) => setGrammarLessonFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                  >
                    <option value="all">Tất cả bài học (50 bài)</option>
                    {lessons.map((lesson) => (
                      <option key={lesson.id} value={lesson.id.toString()}>
                        Bài {lesson.id}: {lesson.title}
                      </option>
                    ))}
                  </select>

                  <span className="text-xs text-slate-400 font-bold whitespace-nowrap px-1">
                    {filteredGrammar.length} mẫu
                  </span>
                </div>
              </div>

              {/* Grammar Cards List */}
              {loadingData ? (
                <div className="py-20 text-center text-slate-400 text-sm">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Đang tải dữ liệu ngữ pháp...
                </div>
              ) : filteredGrammar.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20">
                  📭 Không tìm thấy mẫu câu nào phù hợp với bộ lọc hiện tại.
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filteredGrammar.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 hover:border-amber-400/60 dark:hover:border-amber-500/60 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                              Bài {item.lesson_id} • {item.lesson_id <= 25 ? 'N5' : 'N4'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                router.push(`/lessons/${item.lesson_id}?tab=grammar`);
                              }}
                              className="text-[11px] font-bold text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                              title="Đi đến bài học ngữ pháp này"
                            >
                              Bài {item.lesson_id} ➔
                            </button>
                          </div>

                          <div>
                            <h3 className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
                              {item.title}
                            </h3>
                            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                              {item.meaning}
                            </p>
                          </div>

                          {item.structure && (
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-900 dark:text-amber-200 leading-relaxed">
                              <span className="font-bold text-amber-600 dark:text-amber-400 mr-1.5">📐 Cấu trúc:</span>
                              {item.structure}
                            </div>
                          )}

                          {item.vietnamese_explanation && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {item.vietnamese_explanation}
                            </p>
                          )}
                        </div>

                        {/* Example sentence with TTS */}
                        {item.japanese_example && (
                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                                  {item.japanese_example}
                                </p>
                                {item.example_meaning && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {item.example_meaning}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => speakTTS(item.japanese_example || '')}
                                className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 transition-all text-xs cursor-pointer shrink-0"
                                title="Nghe câu ví dụ"
                              >
                                🔊
                              </button>
                            </div>
                          </div>
                        )}

                        {item.notes && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                            💡 Chú ý: {item.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: TRA CỨU BẢNG CHỮ CÁI (HIRAGANA & KATAKANA)        */}
          {/* ======================================================== */}
          {activeTab === 'kana' && (
            <div className="space-y-4 h-full flex flex-col">
              {/* Toolbar Controls */}
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={kanaSearch}
                    onChange={(e) => setKanaSearch(e.target.value)}
                    placeholder="Tìm theo ký tự (あ, ア), Romaji (a, ka, sa, tsu), hoặc mẹo nhớ..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    autoFocus
                  />
                  <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
                  {kanaSearch && (
                    <button
                      type="button"
                      onClick={() => setKanaSearch('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {/* Filter by Type */}
                  <div className="inline-flex rounded-xl p-1 bg-slate-200/70 dark:bg-slate-800/70">
                    <button
                      type="button"
                      onClick={() => setKanaTypeFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        kanaTypeFilter === 'all'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Tất cả ({allKanaItems.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setKanaTypeFilter('hiragana')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        kanaTypeFilter === 'hiragana'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Hiragana ({hiraganaData.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setKanaTypeFilter('katakana')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        kanaTypeFilter === 'katakana'
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Katakana ({katakanaData.length})
                    </button>
                  </div>

                  <span className="text-xs text-slate-400 font-bold whitespace-nowrap px-1">
                    {filteredKana.length} chữ
                  </span>
                </div>
              </div>

              {/* Kana Grid */}
              {filteredKana.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20">
                  📭 Không tìm thấy chữ cái nào phù hợp với từ khóa "{kanaSearch}".
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {filteredKana.map((item) => (
                      <div
                        key={`${item.type}_${item.id}`}
                        className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-400/50 dark:hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between gap-2 group"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform">
                            {item.char}
                          </span>
                          <button
                            type="button"
                            onClick={() => playAudioWithFallback(item.char)}
                            className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:scale-105 transition-transform text-xs cursor-pointer"
                            title="Phát âm"
                          >
                            🔊
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                              /{item.romaji}/
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              item.type === 'hiragana'
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
                                : 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400'
                            }`}>
                              {item.type === 'hiragana' ? 'Hira' : 'Kata'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed" title={item.mnemonic}>
                            {item.mnemonic}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Quick Navigation Action */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-400 dark:text-slate-500 text-center sm:text-left">
            {activeTab === 'vocab' 
              ? '💡 Nhấp vào bài học để chuyển ngay tới trang học từ vựng chi tiết' 
              : activeTab === 'kanji'
              ? '💡 Bấm vào từng thẻ Kanji để xem chi tiết âm On/Kun, số nét & từ ghép'
              : activeTab === 'grammar'
              ? '💡 Bấm biểu tượng 🔊 để nghe đọc câu ví dụ tiếng Nhật'
              : '💡 Bấm biểu tượng 🔊 để nghe phát âm từng chữ cái chuẩn giọng Nhật'}
          </span>

          <div className="flex items-center space-x-2">
            {activeTab === 'kanji' ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push(`/lessons/${currentLessonId || 1}?tab=kanji`);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
              >
                🉐 Đi đến trang học Kanji đầy đủ ➔
              </button>
            ) : activeTab === 'grammar' ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  const targetLesson = grammarLessonFilter !== 'all' ? grammarLessonFilter : (currentLessonId || 1);
                  router.push(`/lessons/${targetLesson}?tab=grammar`);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
              >
                📖 Đi đến trang học Ngữ pháp đầy đủ ➔
              </button>
            ) : activeTab === 'kana' ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/kana');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
              >
                🔤 Đi đến Bảng Chữ Cái đầy đủ (Luyện viết & Flashcard) ➔
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  const targetLesson = selectedLessonFilter !== 'all' ? selectedLessonFilter : (currentLessonId || 1);
                  router.push(`/lessons/${targetLesson}?tab=vocab`);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
              >
                📖 Đi đến trang học Từ vựng đầy đủ ➔
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanji Detail Sub-modal */}
      {selectedKanjiDetail && (
        <div 
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
          onClick={() => setSelectedKanjiDetail(null)}
        >
          <div 
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  {selectedKanjiDetail.character}
                </span>
                <div>
                  <h3 className="text-lg font-black text-purple-600 dark:text-purple-400">
                    {selectedKanjiDetail.sino_vietnamese || 'HÁN TỰ'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedKanjiDetail.vietnamese_meaning}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedKanjiDetail(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/40">
                  <span className="block font-black text-purple-700 dark:text-purple-300 mb-1">
                    📖 Âm Onyomi:
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedKanjiDetail.onyomi || '—'}</p>
                </div>
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                  <span className="block font-black text-indigo-700 dark:text-indigo-300 mb-1">
                    🗣️ Âm Kunyomi:
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedKanjiDetail.kunyomi || '—'}</p>
                </div>
              </div>

              {selectedKanjiDetail.stroke_count && (
                <div className="p-3 bg-slate-100/60 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between">
                  <span className="font-bold text-slate-600 dark:text-slate-400">Số nét bút:</span>
                  <span className="font-black text-slate-900 dark:text-white">{selectedKanjiDetail.stroke_count} nét</span>
                </div>
              )}

              {selectedKanjiDetail.mnemonic_tip && (
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/40">
                  <span className="block font-black text-amber-700 dark:text-amber-300 mb-1">
                    💡 Mẹo ghi nhớ:
                  </span>
                  <p className="leading-relaxed">{selectedKanjiDetail.mnemonic_tip}</p>
                </div>
              )}

              {selectedKanjiDetail.compounds && (
                <div className="p-3 bg-slate-100/60 dark:bg-slate-800/40 rounded-2xl">
                  <span className="block font-black text-slate-800 dark:text-slate-200 mb-1">
                    🔗 Từ ghép tiêu biểu:
                  </span>
                  <p className="leading-relaxed">{selectedKanjiDetail.compounds}</p>
                </div>
              )}

              {/* Mapping 2 chiều: Các từ vựng trong giáo trình chứa chữ Kanji này */}
              {(() => {
                const relatedVocabs = getRelatedVocabForKanji(selectedKanjiDetail.character, vocabList, kanjiList);
                return (
                  <div className="p-3.5 bg-slate-100/70 dark:bg-slate-800/50 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-700/60">
                    <span className="block font-black text-purple-700 dark:text-purple-300 text-xs flex items-center gap-1.5">
                      <span>📚</span>
                      <span>Từ vựng bài học chứa chữ 【 {selectedKanjiDetail.character} 】 ({relatedVocabs.length} từ)</span>
                    </span>

                    {relatedVocabs.length === 0 ? (
                      <p className="text-slate-400 italic text-[11px]">
                        Chưa có từ vựng cụ thể nào trong bài học sử dụng trực tiếp chữ này.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {relatedVocabs.map((v) => (
                          <div
                            key={v.id}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-2 hover:border-purple-400/50 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-sm text-slate-900 dark:text-white">
                                  {v.kanji_form || v.hiragana}
                                </span>
                                {v.kanji_form && (
                                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.2 rounded">
                                    {v.hiragana}
                                  </span>
                                )}
                                <span className="text-[9px] uppercase font-bold px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                  B{v.lesson_id}
                                </span>
                              </div>
                              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate mt-0.5">
                                {v.vietnamese_meaning}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playAudioWithFallback(v.kanji_form || v.hiragana, v.hiragana);
                              }}
                              className="w-6 h-6 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 text-[11px] cursor-pointer"
                              title="Nghe phát âm"
                            >
                              🔊
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => playAudioWithFallback(selectedKanjiDetail.character)}
                className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span>🔊</span>
                <span>Nghe phát âm</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedKanjiDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
