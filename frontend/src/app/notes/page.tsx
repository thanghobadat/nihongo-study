'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { api } from '../utils/api';
import SidebarSettings from '../components/SidebarSettings';
import {
  LESSON_NOTES_LIST,
  LessonNoteConfig,
  hasLessonNoteContent,
} from './data/lessonNotesData';

interface LessonMeta {
  id: number;
  title: string;
  description?: string;
}

function extractLessonSubtitle(lessonId: number, rawTitle?: string): string {
  if (!rawTitle) return '';
  const cleaned = rawTitle
    .replace(new RegExp(`^Bài\\s*${lessonId}\\s*[:：\\-]\\s*`, 'i'), '')
    .trim();
  if (!cleaned || cleaned.toLowerCase() === `bài ${lessonId}`) return '';
  return cleaned;
}

export default function LessonNotesSummaryPage() {
  const [level, setLevel] = useState<'N5' | 'N4'>('N5');
  const [filterMode, setFilterMode] = useState<'all' | 'has_content'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [lessons, setLessons] = useState<LessonMeta[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Sync active lesson context & optional ?level=N4|N5 query on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('selectedLessonId');
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) {
        setSelectedLessonId(parsed);
        setLevel(parsed >= 26 ? 'N4' : 'N5');
      }
    }

    const params = new URLSearchParams(window.location.search);
    const queryLevel = params.get('level');
    if (queryLevel === 'N5' || queryLevel === 'N4') {
      setLevel(queryLevel);
    }
  }, []);

  // Hydrate lesson titles with 0ms cache + background refresh
  useEffect(() => {
    let cancelled = false;
    async function loadLessons() {
      const lessonsPath = '/api/user/lessons?course=minna';
      const cached = api.peekCache(lessonsPath);
      if (Array.isArray(cached) && !cancelled) {
        setLessons(cached);
      }
      try {
        const fresh = await api.get(lessonsPath);
        if (Array.isArray(fresh) && !cancelled) {
          setLessons(fresh);
        }
      } catch {
        // Fallback static lesson numbers still work cleanly offline
      }
    }
    loadLessons();
    return () => {
      cancelled = true;
    };
  }, []);

  const lessonTitleMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const item of lessons) {
      if (item && typeof item.id === 'number') {
        map[item.id] = item.title || '';
      }
    }
    return map;
  }, [lessons]);

  const stats = useMemo(() => {
    let n5Total = 0;
    let n4Total = 0;
    let n5WithContent = 0;
    let n4WithContent = 0;
    for (const cfg of LESSON_NOTES_LIST) {
      if (cfg.level === 'N5') {
        n5Total++;
        if (hasLessonNoteContent(cfg)) n5WithContent++;
      } else {
        n4Total++;
        if (hasLessonNoteContent(cfg)) n4WithContent++;
      }
    }
    return {
      n5Total,
      n4Total,
      totalActive: n5Total + n4Total,
      n5WithContent,
      n4WithContent,
      totalWithContent: n5WithContent + n4WithContent,
    };
  }, []);

  const levelConfigs = useMemo(
    () => LESSON_NOTES_LIST.filter((cfg) => cfg.level === level),
    [level]
  );

  const levelReadyCount = level === 'N5' ? stats.n5WithContent : stats.n4WithContent;

  const filteredConfigs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return levelConfigs.filter((cfg) => {
      if (filterMode === 'has_content' && !hasLessonNoteContent(cfg)) {
        return false;
      }
      if (!q) return true;

      const rawTitle = lessonTitleMap[cfg.lessonId] || '';
      const labelNum = `bài ${cfg.lessonId}`;
      const matchLessonNum =
        labelNum.includes(q) || String(cfg.lessonId) === q;
      const matchTitle = rawTitle.toLowerCase().includes(q);
      const matchHighlights = cfg.highlights.some(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          (h.tag && h.tag.toLowerCase().includes(q)) ||
          (h.brief && h.brief.toLowerCase().includes(q))
      );

      return matchLessonNum || matchTitle || matchHighlights;
    });
  }, [levelConfigs, filterMode, searchQuery, lessonTitleMap]);

  const menuItems = [
    { name: 'Tiến độ học', id: 'dashboard', icon: '📊' },
    { name: 'Ngữ pháp', id: 'roadmap', icon: '🗺️' },
    { name: 'Từ vựng', id: 'vocab', icon: '📚' },
    { name: 'Chữ Hán (Kanji)', id: 'kanji', icon: '🉐' },
    { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️' },
    { name: 'Luyện đề JLPT', id: 'jlpt', icon: '🎓' },
  ];

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/50 dark:from-[#0b1329] dark:via-[#090d1a] dark:to-[#050811] text-slate-800 dark:text-slate-100 font-sans relative">
      {/* Mobile Hamburger toggle button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Mở menu điều hướng"
        className="lg:hidden absolute top-4 left-4 z-40 p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer backdrop-blur-md active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar backdrop overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/20 z-40 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* 1. Left Sidebar Navigation Menu */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-slate-950/95 shadow-lg shadow-slate-200/40 border-r border-slate-200 dark:border-slate-800 dark:border-r-slate-900/50 flex flex-col justify-between p-6 backdrop-blur-xl shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-8 px-2 shrink-0">
            <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Minna Nihongo
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xl p-1 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <nav className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-0 select-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-100 hover:[&::-webkit-scrollbar-thumb]:bg-slate-450 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {menuItems.map((item) => {
              const targetHref =
                item.id === 'dashboard'
                  ? '/dashboard'
                  : item.id === 'roadmap'
                  ? '/roadmap'
                  : `/lessons/${selectedLessonId}?tab=${item.id}`;
              return (
                <Link
                  key={item.id}
                  href={targetHref}
                  prefetch
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:shadow-none"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <SidebarSettings />
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-20 lg:p-10 space-y-6 md:space-y-8 relative">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-300 text-xs font-bold mb-2.5">
              <span>📌</span>
              <span>Sổ tay tổng kết theo bài</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
              TỔNG KẾT KIẾN THỨC CẦN NHỚ
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Hệ thống hóa các bảng quy tắc, điểm trọng tâm và lưu ý riêng cho từng bài từ Bài 1 đến Bài 50.
            </p>
          </div>

          {/* Overall Compilation Counter */}
          <div className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm shrink-0 self-start md:self-auto">
            <div className="text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-200">
                Đã có nội dung:{' '}
                <span className="text-indigo-600 dark:text-indigo-400">
                  {stats.totalWithContent}/{stats.totalActive} bài
                </span>
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                N5: {stats.n5WithContent}/{stats.n5Total} • N4: {stats.n4WithContent}/{stats.n4Total}
              </p>
            </div>
          </div>
        </div>

        {/* Controls Bar: Level Switcher + Filter Mode + Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3.5 sm:p-4 shadow-sm backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Level Tabs: N5 / N4 */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setLevel('N5')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  level === 'N5'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                N5 (Bài 1–25)
              </button>
              <button
                type="button"
                onClick={() => setLevel('N4')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  level === 'N4'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                N4 (Bài 26–50)
              </button>
            </div>

            {/* Content Status Filter */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Tất cả ({levelConfigs.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('has_content')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterMode === 'has_content'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Đã có nội dung ({levelReadyCount})
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm số bài, tiêu đề, nội dung..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
              🔍
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Xóa từ khóa"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Lesson Cards Grid or Empty Filter Notice */}
        {filteredConfigs.length === 0 ? (
          <div className="rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-10 text-center space-y-3 shadow-sm">
            <div className="text-3xl">📭</div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
              {filterMode === 'has_content' && !searchQuery
                ? `Chưa có bài học nào thuộc cấp độ ${level} có nội dung kiến thức cần nhớ`
                : 'Không tìm thấy bài học phù hợp với bộ lọc hiện tại'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {filterMode === 'has_content' && !searchQuery
                ? `Bạn có thể chuyển sang chế độ "Tất cả (${levelConfigs.length})" để xem danh sách các bài thuộc cấp độ này.`
                : 'Hãy thử đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc để xem danh sách bài học.'}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setFilterMode('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                Hiển thị tất cả {levelConfigs.length} bài {level}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 pb-8">
            {filteredConfigs.map((cfg: LessonNoteConfig) => {
              const rawTitle = lessonTitleMap[cfg.lessonId];
              const subtitle = extractLessonSubtitle(cfg.lessonId, rawTitle);
              const hasContent = hasLessonNoteContent(cfg);

              return (
                <div
                  key={cfg.lessonId}
                  className={`group rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 shadow-sm ${
                    hasContent
                      ? 'bg-white dark:bg-slate-900/90 border-indigo-200/80 dark:border-indigo-800/60 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md'
                      : 'bg-white/85 dark:bg-slate-900/55 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Card Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold">
                          Bài {cfg.lessonId}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {cfg.level}
                        </span>
                      </div>

                      {hasContent ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300">
                          ✓ {cfg.highlights.length > 0 ? `${cfg.highlights.length} mục cần nhớ` : 'Đã có nội dung'}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500">
                          Chưa có nội dung
                        </span>
                      )}
                    </div>

                    {/* Lesson Title */}
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mb-3 line-clamp-1">
                      {subtitle ? `Bài ${cfg.lessonId}: ${subtitle}` : `Bài ${cfg.lessonId}`}
                    </h2>

                    {/* Highlights Summary List or Empty Slot */}
                    {cfg.highlights.length > 0 ? (
                      <ul className="space-y-2 mb-5">
                        {cfg.highlights.map((h) => (
                          <li
                            key={h.id}
                            className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                          >
                            <span className="text-indigo-500 dark:text-indigo-400 font-bold mt-0.5 shrink-0">
                              •
                            </span>
                            <div className="min-w-0">
                              {h.tag && (
                                <span className="inline-block mr-1.5 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                                  {h.tag}
                                </span>
                              )}
                              <span className="font-medium">{h.title}</span>
                              {h.brief && (
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                  {h.brief}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : hasContent ? (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 py-2.5 px-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                        Đã có bảng tổng hợp kiến thức chi tiết cho Bài {cfg.lessonId}.
                      </p>
                    ) : (
                      <div className="mb-5 py-3 px-3.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-xs text-slate-400 dark:text-slate-500">
                        Chưa thêm kiến thức cần nhớ cho bài này.
                      </div>
                    )}
                  </div>

                  {/* Card Footer Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <Link
                      href={`/notes/${cfg.lessonId}`}
                      prefetch
                      className={`flex-1 inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        hasContent
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-700 hover:text-indigo-700 dark:text-slate-200 dark:hover:text-indigo-300 border border-slate-200/80 dark:border-slate-700/80'
                      }`}
                    >
                      <span>📌</span>
                      <span>Kiến thức Bài {cfg.lessonId} ➔</span>
                    </Link>

                    <Link
                      href={`/lessons/${cfg.lessonId}`}
                      prefetch
                      title={`Mở trang học chính Bài ${cfg.lessonId}`}
                      className="inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors shrink-0"
                    >
                      <span>📚</span>
                      <span>Học bài</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

