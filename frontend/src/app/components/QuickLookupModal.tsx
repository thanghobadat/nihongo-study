'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { api } from '../utils/api';
import { playAudioWithFallback } from '../utils/audioHelper';
import { 
  RADICALS_DICT, 
  RadicalInfo, 
  getRadicalLevel, 
  N5_RADICALS_SET, 
  N4_RADICALS_SET 
} from '../utils/kanjiRadicals';

interface QuickLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'vocab' | 'radicals';
  currentLessonId?: number;
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

// In-memory cache for course summary to avoid repeated API requests
let cachedVocabList: VocabItem[] | null = null;
let cachedLessonsList: { id: number; title: string }[] | null = null;

export default function QuickLookupModal({
  isOpen,
  onClose,
  initialTab = 'radicals',
  currentLessonId = 1
}: QuickLookupModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'vocab' | 'radicals'>(initialTab);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync initialTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
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
  // 1. VOCABULARY LOOKUP STATE & LOGIC
  // ==============================================================
  const [vocabList, setVocabList] = useState<VocabItem[]>(cachedVocabList || []);
  const [lessons, setLessons] = useState<{ id: number; title: string }[]>(cachedLessonsList || []);
  const [vocabSearch, setVocabSearch] = useState('');
  const [selectedLessonFilter, setSelectedLessonFilter] = useState<string>(
    currentLessonId ? currentLessonId.toString() : 'all'
  );
  const [loadingVocab, setLoadingVocab] = useState(false);

  // Sync currentLessonId to filter when changed
  useEffect(() => {
    if (currentLessonId) {
      setSelectedLessonFilter(currentLessonId.toString());
    }
  }, [currentLessonId]);

  // Fetch course summary when opening vocab tab if not cached yet
  useEffect(() => {
    if (!isOpen || activeTab !== 'vocab' || cachedVocabList !== null) return;

    let isCancelled = false;
    async function fetchCourseSummary() {
      setLoadingVocab(true);
      try {
        const res = await api.get('/api/user/course-summary?course=minna');
        if (res && res.success && res.data && !isCancelled) {
          const loadedLessons = res.data.lessons || [];
          setLessons(loadedLessons);
          cachedLessonsList = loadedLessons;

          // Flatten all vocabularies from lessons
          const allVocabs: VocabItem[] = [];
          loadedLessons.forEach((l: any) => {
            if (Array.isArray(l.vocabulary)) {
              l.vocabulary.forEach((v: any) => {
                allVocabs.push({
                  ...v,
                  lesson_id: l.id
                });
              });
            }
          });
          setVocabList(allVocabs);
          cachedVocabList = allVocabs;
        }
      } catch (err) {
        console.warn('[QuickLookup] Error fetching vocabularies:', err);
      } finally {
        if (!isCancelled) setLoadingVocab(false);
      }
    }

    fetchCourseSummary();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, activeTab]);

  // Filtered vocabulary list
  const filteredVocab = useMemo(() => {
    const q = vocabSearch.trim().toLowerCase();
    return vocabList.filter((item) => {
      // Lesson filter
      if (selectedLessonFilter !== 'all' && item.lesson_id.toString() !== selectedLessonFilter) {
        return false;
      }
      if (!q) return true;

      const matchesHira = item.hiragana?.toLowerCase().includes(q);
      const matchesRomaji = item.romaji?.toLowerCase().includes(q);
      const matchesMeaning = item.vietnamese_meaning?.toLowerCase().includes(q);
      const matchesKanji = item.kanji_form?.toLowerCase().includes(q);
      const matchesExample = item.japanese_example?.toLowerCase().includes(q) || item.example_meaning?.toLowerCase().includes(q);

      return matchesHira || matchesRomaji || matchesMeaning || matchesKanji || matchesExample;
    });
  }, [vocabList, vocabSearch, selectedLessonFilter]);

  // ==============================================================
  // 2. RADICALS LOOKUP STATE & LOGIC
  // ==============================================================
  const [radicalSearch, setRadicalSearch] = useState('');
  const [radicalLevelFilter, setRadicalLevelFilter] = useState<'all' | 'n5' | 'n4' | 'other'>('all');
  const [selectedRadicalDetail, setSelectedRadicalDetail] = useState<RadicalInfo | null>(null);

  const allRadicals = useMemo(() => {
    return Object.values(RADICALS_DICT);
  }, []);

  const filteredRadicals = useMemo(() => {
    const q = radicalSearch.trim().toLowerCase();
    return allRadicals.filter((item) => {
      const cleanChar = item.character.split(' ')[0];
      const level = getRadicalLevel(cleanChar);

      if (radicalLevelFilter === 'n5' && level !== 'N5') return false;
      if (radicalLevelFilter === 'n4' && level !== 'N4') return false;
      if (radicalLevelFilter === 'other' && (level === 'N5' || level === 'N4')) return false;

      if (!q) return true;

      const matchesChar = item.character.toLowerCase().includes(q) || cleanChar.toLowerCase().includes(q);
      const matchesSino = item.sinoVietnamese?.toLowerCase().includes(q);
      const matchesMeaning = item.meaning?.toLowerCase().includes(q);
      const matchesDesc = item.description?.toLowerCase().includes(q);
      return matchesChar || matchesSino || matchesMeaning || matchesDesc;
    });
  }, [allRadicals, radicalSearch, radicalLevelFilter]);

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
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                  {activeTab === 'vocab' ? 'Từ vựng' : 'Bộ thủ Kanji'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Tra cứu tức thời trên toàn màn hình không làm gián đoạn bài học hiện tại
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
                onClick={() => setActiveTab('radicals')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'radicals'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🉐 Bộ Thủ
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
                    placeholder="Nhập chữ Kanji, Hiragana, Romaji hoặc nghĩa tiếng Việt..."
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
              {loadingVocab ? (
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
          {/* TAB 2: TRA CỨU BỘ THỦ KANJI                              */}
          {/* ======================================================== */}
          {activeTab === 'radicals' && (
            <div className="space-y-4 h-full flex flex-col">
              {/* Toolbar Controls */}
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={radicalSearch}
                    onChange={(e) => setRadicalSearch(e.target.value)}
                    placeholder="Tìm theo ký tự, tên Hán Việt (Nhân, Khẩu...), ý nghĩa, số nét..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    autoFocus
                  />
                  <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
                  {radicalSearch && (
                    <button
                      type="button"
                      onClick={() => setRadicalSearch('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Level Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setRadicalLevelFilter('all')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      radicalLevelFilter === 'all'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Tất cả (201)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRadicalLevelFilter('n5')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      radicalLevelFilter === 'n5'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-900/80 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    🟢 N5 ({N5_RADICALS_SET.size})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRadicalLevelFilter('n4')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      radicalLevelFilter === 'n4'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-900/80 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    🟡 N4 ({N4_RADICALS_SET.size})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRadicalLevelFilter('other')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      radicalLevelFilter === 'other'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-900/80 text-purple-600 dark:text-purple-400'
                    }`}
                  >
                    📚 N3-N1 ({allRadicals.length - N5_RADICALS_SET.size - N4_RADICALS_SET.size})
                  </button>
                </div>
              </div>

              {/* Radicals Grid */}
              {filteredRadicals.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20">
                  📭 Không tìm thấy bộ thủ nào phù hợp với từ khóa "{radicalSearch}".
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2.5 sm:gap-3">
                    {filteredRadicals.map((rad) => {
                      const cleanChar = rad.character.split(' ')[0];
                      const level = getRadicalLevel(cleanChar);
                      return (
                        <div
                          key={rad.character}
                          onClick={() => setSelectedRadicalDetail(rad)}
                          className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 hover:border-purple-400/50 dark:hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform">
                              {cleanChar}
                            </span>
                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                              level === 'N5'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                : level === 'N4'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                            }`}>
                              {level.toUpperCase()}
                            </span>
                          </div>

                          <div className="mt-2 min-w-0">
                            <p className="text-xs font-black text-purple-600 dark:text-purple-400 truncate">
                              Bộ {rad.sinoVietnamese}
                            </p>
                            <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5" title={rad.meaning}>
                              {rad.meaning}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Quick Navigation Action */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-400 dark:text-slate-500 text-center sm:text-left">
            {activeTab === 'vocab' ? '💡 Nhấp vào bài học để chuyển ngay tới trang học từ vựng chi tiết' : '💡 Nhấp vào từng bộ thủ để xem chi tiết chiết tự & ví dụ'}
          </span>

          <div className="flex items-center space-x-2">
            {activeTab === 'radicals' ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/radicals');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
              >
                ⚡ Đi đến trang Ôn tập Bộ thủ đầy đủ (Viết Canvas & Speedrun) ➔
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

      {/* Radical Detail Sub-modal */}
      {selectedRadicalDetail && (
        <div 
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
          onClick={() => setSelectedRadicalDetail(null)}
        >
          <div 
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  {selectedRadicalDetail.character.split(' ')[0]}
                </span>
                <div>
                  <h3 className="text-lg font-black text-purple-600 dark:text-purple-400">
                    Bộ {selectedRadicalDetail.sinoVietnamese}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedRadicalDetail.meaning}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRadicalDetail(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/40">
                <span className="block font-black text-purple-700 dark:text-purple-300 mb-1">
                  💡 Mẹo ghi nhớ hình tượng:
                </span>
                <p className="leading-relaxed">{selectedRadicalDetail.description}</p>
              </div>

              {selectedRadicalDetail.origin && (
                <div className="p-3 bg-slate-100/60 dark:bg-slate-800/40 rounded-2xl">
                  <span className="block font-black text-slate-800 dark:text-slate-200 mb-1">
                    🏛️ Nguồn gốc cội nguồn:
                  </span>
                  <p className="leading-relaxed">{selectedRadicalDetail.origin}</p>
                </div>
              )}

              {selectedRadicalDetail.examples && selectedRadicalDetail.examples.length > 0 && (
                <div>
                  <span className="block font-black text-slate-800 dark:text-slate-200 mb-2">
                    ✍️ Chữ Kanji tiêu biểu chứa bộ thủ này:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRadicalDetail.examples.map((ex) => (
                      <div key={ex.char} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
                        <span className="text-xl font-black text-slate-900 dark:text-white">{ex.char}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-[11px] truncate">{ex.meaning}</p>
                          <p className="text-[10px] text-slate-400 truncate">({ex.romaji})</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRadicalDetail(null)}
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
