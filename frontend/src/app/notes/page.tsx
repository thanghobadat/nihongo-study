'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SidebarSettings from '../components/SidebarSettings';
import NumbersTimeSection, {
  NUMBERS_SUB_OPTIONS,
  NumbersSubTab,
} from './sections/NumbersTimeSection';
import TenseSection from './sections/TenseSection';
import FormSection from './sections/FormSection';

type MainNoteTab = 'numbers' | 'tenses' | 'forms';

const MAIN_PILLARS: {
  id: MainNoteTab;
  shortLabel: string;
  optionLabel: string;
}[] = [
  {
    id: 'numbers',
    shortLabel: 'Số đếm & Ngày tháng',
    optionLabel: 'Phần 1: Số đếm & Ngày tháng (Bài 1, 3, 5)',
  },
  {
    id: 'tenses',
    shortLabel: 'Chia Thì',
    optionLabel: 'Phần 2: Chia Thì (Bài 4)',
  },
  {
    id: 'forms',
    shortLabel: 'Chia Thể',
    optionLabel: 'Phần 3: Chia Thể (Đến Bài 6)',
  },
];

export default function LessonNotesSummaryPage() {
  const [activeTab, setActiveTab] = useState<MainNoteTab>('numbers');
  const [numbersSubTab, setNumbersSubTab] = useState<NumbersSubTab>('lesson1');
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('selectedLessonId');
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) {
        setSelectedLessonId(parsed);
      }
    }

    const params = new URLSearchParams(window.location.search);
    const queryTab = params.get('tab');
    if (queryTab === 'numbers' || queryTab === 'tenses' || queryTab === 'forms') {
      setActiveTab(queryTab);
    }
    const querySub = params.get('sub');
    if (querySub === 'lesson1' || querySub === 'lesson3' || querySub === 'lesson5') {
      setNumbersSubTab(querySub);
    }
  }, []);

  const syncUrlParams = useCallback((nextTab: MainNoteTab, nextSub: NumbersSubTab) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('tab', nextTab);
    if (nextTab === 'numbers') {
      url.searchParams.set('sub', nextSub);
    } else {
      url.searchParams.delete('sub');
    }
    window.history.replaceState(null, '', url.toString());
  }, []);

  const handleSelectTab = useCallback(
    (nextTab: MainNoteTab) => {
      setActiveTab(nextTab);
      syncUrlParams(nextTab, numbersSubTab);
    },
    [numbersSubTab, syncUrlParams]
  );

  const handleSelectNumbersSub = useCallback(
    (nextSub: NumbersSubTab) => {
      setNumbersSubTab(nextSub);
      syncUrlParams('numbers', nextSub);
    },
    [syncUrlParams]
  );

  const activePillar = MAIN_PILLARS.find((p) => p.id === activeTab) ?? MAIN_PILLARS[0];

  const menuItems = [
    { name: 'Tiến độ học', id: 'dashboard', icon: '📊' },
    { name: 'Ngữ pháp', id: 'roadmap', icon: '🗺️' },
    { name: 'Từ vựng', id: 'vocab', icon: '📚' },
    { name: 'Chữ Hán (Kanji)', id: 'kanji', icon: '🉐' },
    { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️' },
    { name: 'Luyện đề JLPT', id: 'jlpt', icon: '🎓' },
  ];

  return (
    <div className="flex h-[100dvh] w-full max-w-full overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/50 dark:from-[#0b1329] dark:via-[#090d1a] dark:to-[#050811] text-slate-800 dark:text-slate-100 font-sans relative [-webkit-tap-highlight-color:transparent]">
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/35 z-40 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* 1. Left Sidebar Navigation Menu */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-slate-950/95 shadow-lg shadow-slate-200/40 border-r border-slate-200 dark:border-slate-800 dark:border-r-slate-900/50 flex flex-col justify-between px-5 sm:px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:py-6 backdrop-blur-xl shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-6 lg:mb-8 px-1 shrink-0">
            <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Minna Nihongo
            </span>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Đóng menu"
              className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-lg font-bold cursor-pointer touch-manipulation active:scale-95"
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
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:shadow-none touch-manipulation"
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

      {/* 2. Right Viewport Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="lg:hidden shrink-0 z-30 flex items-center justify-between gap-2 px-3.5 pt-[max(0.625rem,env(safe-area-inset-top))] pb-2.5 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Mở menu điều hướng"
              className="w-10 h-10 rounded-xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 cursor-pointer touch-manipulation active:scale-95"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="min-w-0">
              <span className="block text-sm font-extrabold text-slate-900 dark:text-white truncate">
                📌 Kiến thức cần nhớ
              </span>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                {activePillar.shortLabel}
              </p>
            </div>
          </div>

          <Link
            href={`/lessons/${selectedLessonId}`}
            prefetch
            className="inline-flex items-center gap-1 px-3 min-h-[38px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-sm shrink-0 touch-manipulation active:scale-95"
          >
            <span>📚</span>
            <span>Bài {selectedLessonId}</span>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-3.5 py-4 sm:p-6 lg:p-10 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-12 space-y-4 sm:space-y-6 relative">
          {/* Page Header + Compact Dropdown Toolbar */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-5">
            <div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
                SỔ TAY KIẾN THỨC CẦN NHỚ
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Tổng hợp các kiến thức trọng tâm đã học (Bài 1 → Bài 6) trong 3 phần chính.
              </p>
            </div>

            {/* Compact Single-Row Dropdown Controls */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5">
              {/* Dropdown 1: Chọn Phần chính */}
              <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 shadow-sm">
                <label
                  htmlFor="notes-main-pillar-select"
                  className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0"
                >
                  Chuyên đề:
                </label>
                <select
                  id="notes-main-pillar-select"
                  value={activeTab}
                  onChange={(e) => handleSelectTab(e.target.value as MainNoteTab)}
                  className="flex-1 min-w-0 min-h-[32px] bg-transparent dark:bg-slate-900 text-[16px] sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer truncate"
                >
                  {MAIN_PILLARS.map((pillar) => (
                    <option
                      key={pillar.id}
                      value={pillar.id}
                      className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    >
                      {pillar.optionLabel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown 2: Chọn Mục con khi đang ở Phần 1 */}
              {activeTab === 'numbers' && (
                <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 shadow-sm">
                  <label
                    htmlFor="notes-sub-topic-select"
                    className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0"
                  >
                    Mục:
                  </label>
                  <select
                    id="notes-sub-topic-select"
                    value={numbersSubTab}
                    onChange={(e) => handleSelectNumbersSub(e.target.value as NumbersSubTab)}
                    className="flex-1 min-w-0 min-h-[32px] bg-transparent dark:bg-slate-900 text-[16px] sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer truncate"
                  >
                    {NUMBERS_SUB_OPTIONS.map((opt) => (
                      <option
                        key={opt.id}
                        value={opt.id}
                        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Link
                href={`/lessons/${selectedLessonId}`}
                prefetch
                className="hidden md:inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm shrink-0 transition-colors"
              >
                <span>📚</span>
                <span>Bài {selectedLessonId}</span>
              </Link>
            </div>
          </div>

          {/* Active Section Content */}
          {activeTab === 'numbers' && <NumbersTimeSection subTab={numbersSubTab} />}
          {activeTab === 'tenses' && <TenseSection />}
          {activeTab === 'forms' && <FormSection />}
        </main>
      </div>
    </div>
  );
}
