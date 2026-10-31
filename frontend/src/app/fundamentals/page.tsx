'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import SidebarSettings from '../components/SidebarSettings';
import LessonSelector from './components/LessonSelector';
import KnowledgeUnitCard from './components/KnowledgeUnitCard';
import { KNOWLEDGE_UNITS, AVAILABLE_FUNDAMENTAL_LESSONS, FundamentalTopicId, KnowledgeUnit } from './data/knowledgeUnits';
import { getLessonQuestionCount, hasLessonPractice } from './data/practice';

const LessonPracticeModal = dynamic(() => import('./components/LessonPracticeModal'), { ssr: false });

function FundamentalsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL ?lesson=X parsing
  const initialLesson = useMemo(() => {
    const p = searchParams.get('lesson');
    if (p) {
      const parsed = parseInt(p, 10);
      if (AVAILABLE_FUNDAMENTAL_LESSONS.includes(parsed)) {
        return parsed;
      }
    }
    return 1;
  }, [searchParams]);

  const [activeLesson, setActiveLesson] = useState<number>(initialLesson);
  const [viewMode, setViewMode] = useState<'lesson' | 'topic'>('lesson');
  const [selectedTopic, setSelectedTopic] = useState<'all' | FundamentalTopicId>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const [practiceTargetUnitId, setPracticeTargetUnitId] = useState<string | null>(null);

  const handleOpenLessonPractice = () => {
    setPracticeTargetUnitId(null);
    setIsPracticeOpen(true);
  };

  const handleOpenUnitPractice = (unitId: string) => {
    setPracticeTargetUnitId(unitId);
    setIsPracticeOpen(true);
  };

  // Sync activeLesson if URL changes
  useEffect(() => {
    const p = searchParams.get('lesson');
    if (p) {
      const parsed = parseInt(p, 10);
      if (AVAILABLE_FUNDAMENTAL_LESSONS.includes(parsed) && parsed !== activeLesson) {
        setActiveLesson(parsed);
      }
    }
  }, [searchParams]);

  const handleSelectLesson = (lessonId: number) => {
    setActiveLesson(lessonId);
    // Update URL query quietly without page refresh
    const url = new URL(window.location.href);
    url.searchParams.set('lesson', String(lessonId));
    window.history.replaceState({}, '', url.toString());
  };

  // Filter units for the active lesson (or active topic)
  const displayedUnits = useMemo(() => {
    let list: KnowledgeUnit[] = [];

    if (viewMode === 'lesson') {
      list = KNOWLEDGE_UNITS.filter(u => u.lesson === activeLesson);
    } else {
      list = selectedTopic === 'all'
        ? KNOWLEDGE_UNITS
        : KNOWLEDGE_UNITS.filter(u => u.topic === selectedTopic);
    }

    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase();
    return list.filter(u =>
      u.title.toLowerCase().includes(term) ||
      u.summary.toLowerCase().includes(term) ||
      u.topicLabel.toLowerCase().includes(term)
    );
  }, [viewMode, activeLesson, selectedTopic, searchTerm]);


  // Sidebar Menu Items
  const menuItems = [
    { id: 'dashboard', name: 'Tiến độ học tập', icon: '📊' },
    { id: 'roadmap', name: 'Lộ trình 50 bài', icon: '🗺️' },
    { id: 'vocabulary', name: 'Từ vựng', icon: '📖' },
    { id: 'kanji', name: 'Hán tự Kanji', icon: '🉐' },
    { id: 'grammar', name: 'Ngữ pháp', icon: '📝' },
    { id: 'kana', name: 'Ôn bảng chữ cái', icon: '🌸' },
  ];

  const topicsList: { id: 'all' | FundamentalTopicId; label: string }[] = [
    { id: 'all', label: 'Tất cả chủ đề' },
    { id: 'numbers', label: '🔢 Số đếm & Đơn vị' },
    { id: 'time', label: '⏰ Thời gian & Lịch' },
    { id: 'particles', label: '🎯 Trợ từ' },
    { id: 'conjugation', label: '🔄 Chia động từ' },
    { id: 'kosoado', label: '🧭 Ko-so-a-do' },
    { id: 'conjunctions', label: '🔗 Liên từ & Phó từ' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#070d19] text-slate-900 dark:text-slate-100 antialiased overflow-hidden">
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
            type="button"
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
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent cursor-pointer"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <SidebarSettings />
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 lg:p-8 space-y-5">
        {/* Header Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              ☰
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">📘</span>
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                  KIẾN THỨC NỀN TẢNG THEO BÀI HỌC
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kiến thức quan trọng ngoài bài học được sắp xếp tương ứng theo tiến độ Minna (Số đếm, Thời gian, Trợ từ, Thể động từ)
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 text-xs">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm nhanh kiến thức..."
              className="w-full pl-8 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Lesson & View Mode Selector */}
        <LessonSelector
          activeLesson={activeLesson}
          onSelectLesson={handleSelectLesson}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
        />

        {/* Topic Filter Pills (only when in Topic view mode) */}
        {viewMode === 'topic' && (
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            {topicsList.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTopic(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedTopic === t.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Lesson Summary Header & Quick Quiz Button */}
        {viewMode === 'lesson' && (
          <div className="flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 px-4 py-3 rounded-2xl">
            <div className="flex items-center space-x-2.5">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                {activeLesson}
              </span>
              <div>
                <h2 className="text-xs sm:text-sm font-black text-indigo-950 dark:text-indigo-200">
                  Bài {activeLesson} — {displayedUnits.length} Đơn vị kiến thức nền tảng
                </h2>
                <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400/80">
                  Nhấp vào từng mục bên dưới để mở rộng bảng tra cứu chi tiết và nghe phát âm.
                </p>
              </div>
            </div>

            {hasLessonPractice(activeLesson) && (
              <button
                type="button"
                onClick={handleOpenLessonPractice}
                className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer shrink-0"
              >
                <span>📝</span>
                <span className="hidden sm:inline">Ôn tập Bài {activeLesson}</span>
                <span className="px-2 py-0.5 rounded-lg bg-white/20 text-[11px] font-black">
                  {getLessonQuestionCount(activeLesson)} câu
                </span>
              </button>
            )}
          </div>
        )}

        {/* Knowledge Units Accordions List */}
        <div className="space-y-2.5">
          {displayedUnits.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              Không tìm thấy kiến thức phù hợp với từ khóa "{searchTerm}".
            </div>
          ) : (
            displayedUnits.map((unit) => (
              <KnowledgeUnitCard
                key={unit.id}
                unit={unit}
                onPractice={handleOpenUnitPractice}
              />
            ))
          )}
        </div>

        {/* Practice Modal */}
        {isPracticeOpen && (
          <LessonPracticeModal
            lessonId={activeLesson}
            initialUnitId={practiceTargetUnitId}
            isOpen={isPracticeOpen}
            onClose={() => setIsPracticeOpen(false)}
          />
        )}
      </main>
    </div>
  );
}

export default function FundamentalsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#070d19] text-xs text-slate-400">
        Đang tải kiến thức nền tảng...
      </div>
    }>
      <FundamentalsContent />
    </Suspense>
  );
}
