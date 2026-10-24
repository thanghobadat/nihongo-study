'use client';

import React, { useRef, useEffect } from 'react';
import { AVAILABLE_FUNDAMENTAL_LESSONS, KNOWLEDGE_UNITS } from '../data/knowledgeUnits';

interface LessonSelectorProps {
  activeLesson: number;
  onSelectLesson: (lessonId: number) => void;
  viewMode: 'lesson' | 'topic';
  onToggleViewMode: (mode: 'lesson' | 'topic') => void;
}

export default function LessonSelector({
  activeLesson,
  onSelectLesson,
  viewMode,
  onToggleViewMode,
}: LessonSelectorProps) {
  const [levelFilter, setLevelFilter] = React.useState<'all' | 'n5' | 'n4'>('all');
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Count units per lesson
  const unitCountsByLesson = React.useMemo(() => {
    const counts: Record<number, number> = {};
    KNOWLEDGE_UNITS.forEach(u => {
      counts[u.lesson] = (counts[u.lesson] || 0) + 1;
    });
    return counts;
  }, []);

  // Filter lessons by N5/N4
  const filteredLessons = React.useMemo(() => {
    return AVAILABLE_FUNDAMENTAL_LESSONS.filter(lesson => {
      if (levelFilter === 'n5') return lesson <= 25;
      if (levelFilter === 'n4') return lesson >= 26;
      return true;
    });
  }, [levelFilter]);

  // Auto-scroll active chip into view
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeChip = scrollContainerRef.current.querySelector<HTMLButtonElement>(`[data-lesson="${activeLesson}"]`);
    if (activeChip) {
      activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeLesson]);

  return (
    <div className="space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs">
      {/* Top row: View Mode Switch + Level Filter */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
        {/* View Mode Toggle */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => onToggleViewMode('lesson')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'lesson'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            📚 Theo bài học ({AVAILABLE_FUNDAMENTAL_LESSONS.length} bài)
          </button>
          <button
            type="button"
            onClick={() => onToggleViewMode('topic')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'topic'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            🧭 Theo chủ đề (Tra cứu)
          </button>
        </div>

        {/* N5 / N4 Filter pills (only active in lesson mode) */}
        {viewMode === 'lesson' && (
          <div className="flex items-center space-x-1.5 text-xs font-medium">
            <span className="text-[11px] text-slate-400">Trình độ:</span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'n5', label: 'N5 (Bài 1-25)' },
              { id: 'n4', label: 'N4 (Bài 26-50)' },
            ].map(lvl => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setLevelFilter(lvl.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  levelFilter === lvl.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lesson Chips Row (when in lesson mode) */}
      {viewMode === 'lesson' && (
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
        >
          {filteredLessons.map(lesson => {
            const isSelected = activeLesson === lesson;
            const count = unitCountsByLesson[lesson] || 0;

            return (
              <button
                key={lesson}
                type="button"
                data-lesson={lesson}
                onClick={() => onSelectLesson(lesson)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <span>Bài {lesson}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
