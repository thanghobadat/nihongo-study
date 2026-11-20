'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SidebarSettings from '../components/SidebarSettings';
import {
  ChevronDownSvg,
  CloseSvg,
  MenuSvg,
  SidebarNavIconId,
  SidebarNavSvg,
} from './components/NotesUI';
import NumbersTimeSection, {
  NUMBERS_SUB_OPTIONS,
  NumbersSubTab,
} from './sections/NumbersTimeSection';
import TenseSection from './sections/TenseSection';
import FormSection from './sections/FormSection';
import ParticleSection, {
  PARTICLE_FILTER_OPTIONS,
  ParticleFilterId,
} from './sections/ParticleSection';

type MainNoteTab = 'numbers' | 'tenses' | 'forms' | 'particles';

const VALID_PARTICLE_FILTERS: ParticleFilterId[] = [
  'all',
  'de',
  'ni',
  'kara_made',
  'wo',
  'he',
  'to',
  'no',
  'wa_mo',
];

const MAIN_PILLARS: {
  id: MainNoteTab;
  shortLabel: string;
  optionLabel: string;
}[] = [
  {
    id: 'numbers',
    shortLabel: 'Số đếm & Ngày tháng',
    optionLabel: 'Phần 1: Số đếm & Ngày tháng',
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
  {
    id: 'particles',
    shortLabel: 'Trợ từ',
    optionLabel: 'Phần 4: Trợ từ (Bài 1 → 7)',
  },
];

export default function LessonNotesSummaryPage() {
  const [activeTab, setActiveTab] = useState<MainNoteTab>('numbers');
  const [numbersSubTab, setNumbersSubTab] = useState<NumbersSubTab>('lesson1');
  const [particleFilter, setParticleFilter] = useState<ParticleFilterId>('all');
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
    if (
      queryTab === 'numbers' ||
      queryTab === 'tenses' ||
      queryTab === 'forms' ||
      queryTab === 'particles'
    ) {
      setActiveTab(queryTab);
    }
    const querySub = params.get('sub');
    if (querySub === 'lesson1' || querySub === 'lesson3' || querySub === 'lesson5') {
      setNumbersSubTab(querySub);
    }
    const queryParticle = params.get('p') as ParticleFilterId | null;
    if (queryParticle && VALID_PARTICLE_FILTERS.includes(queryParticle)) {
      setParticleFilter(queryParticle);
    }
  }, []);

  const syncUrlParams = useCallback(
    (nextTab: MainNoteTab, nextSub: NumbersSubTab, nextParticle: ParticleFilterId) => {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      url.searchParams.set('tab', nextTab);
      if (nextTab === 'numbers') {
        url.searchParams.set('sub', nextSub);
        url.searchParams.delete('p');
      } else if (nextTab === 'particles') {
        url.searchParams.delete('sub');
        if (nextParticle === 'all') {
          url.searchParams.delete('p');
        } else {
          url.searchParams.set('p', nextParticle);
        }
      } else {
        url.searchParams.delete('sub');
        url.searchParams.delete('p');
      }
      window.history.replaceState(null, '', url.toString());
    },
    []
  );

  const handleSelectTab = useCallback(
    (nextTab: MainNoteTab) => {
      setActiveTab(nextTab);
      syncUrlParams(nextTab, numbersSubTab, particleFilter);
    },
    [numbersSubTab, particleFilter, syncUrlParams]
  );

  const handleSelectNumbersSub = useCallback(
    (nextSub: NumbersSubTab) => {
      setNumbersSubTab(nextSub);
      syncUrlParams('numbers', nextSub, particleFilter);
    },
    [particleFilter, syncUrlParams]
  );

  const handleSelectParticleFilter = useCallback(
    (nextParticle: ParticleFilterId) => {
      setParticleFilter(nextParticle);
      syncUrlParams('particles', numbersSubTab, nextParticle);
    },
    [numbersSubTab, syncUrlParams]
  );

  const activePillar = MAIN_PILLARS.find((p) => p.id === activeTab) ?? MAIN_PILLARS[0];

  const menuItems: { name: string; id: SidebarNavIconId; labelId: string }[] = [
    { name: 'Tiến độ học', id: 'dashboard', labelId: 'dashboard' },
    { name: 'Ngữ pháp', id: 'roadmap', labelId: 'roadmap' },
    { name: 'Từ vựng', id: 'vocab', labelId: 'vocab' },
    { name: 'Chữ Hán', id: 'kanji', labelId: 'kanji' },
    { name: 'Ôn tập', id: 'practice', labelId: 'practice' },
    { name: 'Luyện đề JLPT', id: 'jlpt', labelId: 'jlpt' },
  ];

  return (
    <div className="flex h-[100dvh] w-full max-w-full overflow-hidden bg-[#f8fafc] dark:bg-[#090e1a] text-slate-900 dark:text-slate-100 font-sans relative [-webkit-tap-highlight-color:transparent]">
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/45 z-40 backdrop-blur-xs transition-opacity duration-200 motion-reduce:transition-none"
        />
      )}

      {/* 1. Minimalist Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#0c1322] border-r border-slate-200 dark:border-slate-800/90 flex flex-col justify-between px-4 sm:px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:py-6 shrink-0 transition-transform duration-200 motion-reduce:transition-none lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-6 px-1.5 shrink-0">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Minna Nihongo
            </span>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Đóng menu"
              className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <CloseSvg className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1 overflow-y-auto pr-0.5 flex-1 min-h-0 select-none">
            {menuItems.map((item) => {
              const targetHref =
                item.id === 'dashboard'
                  ? '/dashboard'
                  : item.id === 'roadmap'
                  ? '/roadmap'
                  : `/lessons/${selectedLessonId}?tab=${item.labelId}`;
              return (
                <Link
                  key={item.id}
                  href={targetHref}
                  prefetch
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 text-left text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <SidebarNavSvg id={item.id} className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <SidebarSettings />
      </aside>

      {/* 2. Right Study Notebook Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="lg:hidden shrink-0 z-30 flex items-center justify-between gap-2 px-3.5 pt-[max(0.625rem,env(safe-area-inset-top))] pb-2.5 bg-white/95 dark:bg-[#0c1322]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Mở menu điều hướng"
              className="w-11 h-11 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center shrink-0 cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <MenuSvg className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <span className="block text-base font-bold tracking-tight text-slate-900 dark:text-white truncate">
                Sổ tay kiến thức
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {activePillar.shortLabel}
              </p>
            </div>
          </div>

          <Link
            href={`/lessons/${selectedLessonId}`}
            prefetch
            className="inline-flex items-center justify-center px-3.5 min-h-[38px] rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold shrink-0 touch-manipulation transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Bài {selectedLessonId}
          </Link>
        </header>

        {/* Main Centered Notebook Sheet Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-3.5 py-4 sm:px-6 sm:py-7 lg:px-10 lg:py-8 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-12">
          <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6">
            {/* Desktop Header + Compact Single-Row Dropdown Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
              <div className="hidden lg:block">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Sổ tay kiến thức
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Bài 1 – Bài 7
                </p>
              </div>

              <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2">
                {/* Dropdown 1: Chuyên đề chính */}
                <div className="relative flex items-center rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 px-3 min-h-[44px]">
                  <label
                    htmlFor="notes-main-pillar-select"
                    className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap mr-1.5 shrink-0"
                  >
                    Chuyên đề:
                  </label>
                  <select
                    id="notes-main-pillar-select"
                    value={activeTab}
                    onChange={(e) => handleSelectTab(e.target.value as MainNoteTab)}
                    className="appearance-none flex-1 min-w-0 pr-6 py-1.5 bg-transparent dark:bg-[#0f172a] text-[16px] sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer truncate"
                  >
                    {MAIN_PILLARS.map((pillar) => (
                      <option
                        key={pillar.id}
                        value={pillar.id}
                        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      >
                        {pillar.optionLabel}
                      </option>
                    ))}
                  </select>
                  <ChevronDownSvg className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3" />
                </div>

                {/* Dropdown 2: Mục con Phần 1 */}
                {activeTab === 'numbers' && (
                  <div className="relative flex items-center rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 px-3 min-h-[44px]">
                    <label
                      htmlFor="notes-sub-topic-select"
                      className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap mr-1.5 shrink-0"
                    >
                      Mục:
                    </label>
                    <select
                      id="notes-sub-topic-select"
                      value={numbersSubTab}
                      onChange={(e) => handleSelectNumbersSub(e.target.value as NumbersSubTab)}
                      className="appearance-none flex-1 min-w-0 pr-6 py-1.5 bg-transparent dark:bg-[#0f172a] text-[16px] sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer truncate"
                    >
                      {NUMBERS_SUB_OPTIONS.map((opt) => (
                        <option
                          key={opt.id}
                          value={opt.id}
                          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        >
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDownSvg className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3" />
                  </div>
                )}

                {/* Dropdown 2: Lọc Trợ từ Phần 4 */}
                {activeTab === 'particles' && (
                  <div className="relative flex items-center rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 px-3 min-h-[44px]">
                    <label
                      htmlFor="notes-particle-filter-select"
                      className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap mr-1.5 shrink-0"
                    >
                      Trợ từ:
                    </label>
                    <select
                      id="notes-particle-filter-select"
                      value={particleFilter}
                      onChange={(e) =>
                        handleSelectParticleFilter(e.target.value as ParticleFilterId)
                      }
                      className="appearance-none flex-1 min-w-0 pr-6 py-1.5 bg-transparent dark:bg-[#0f172a] text-[16px] sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer truncate"
                    >
                      {PARTICLE_FILTER_OPTIONS.map((opt) => (
                        <option
                          key={opt.id}
                          value={opt.id}
                          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        >
                          {opt.dropdownLabel}
                        </option>
                      ))}
                    </select>
                    <ChevronDownSvg className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3" />
                  </div>
                )}

                <Link
                  href={`/lessons/${selectedLessonId}`}
                  prefetch
                  className="hidden lg:inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Học Bài {selectedLessonId}
                </Link>
              </div>
            </div>

            {/* Active Pillar Sheet */}
            {activeTab === 'numbers' && <NumbersTimeSection subTab={numbersSubTab} />}
            {activeTab === 'tenses' && <TenseSection />}
            {activeTab === 'forms' && <FormSection />}
            {activeTab === 'particles' && (
              <ParticleSection
                filter={particleFilter}
                onSelectFilter={handleSelectParticleFilter}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
