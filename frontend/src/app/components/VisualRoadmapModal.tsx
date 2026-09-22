'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';

interface Milestone {
  id: string;
  title: string;
  lessons: string;
  targetLessons: number;
  completedLessons: number;
  percentage: number;
  status: 'completed' | 'in_progress' | 'locked';
}

interface PaceData {
  status: 'ahead' | 'on_track' | 'behind';
  label: string;
  message: string;
  daysDiff: number;
  lessonsDiff: number;
  totalDays: number;
  daysElapsed: number;
  daysRemaining: number;
  expectedLessons: number;
  actualLessons: number;
  expectedPercentage: number;
  actualPercentage: number;
}

interface OverviewData {
  totalVocab: number;
  masteredVocab: number;
  vocabPercentage: number;
  totalKanji: number;
  masteredKanji: number;
  kanjiPercentage: number;
  totalGrammar: number;
  masteredGrammar: number;
  grammarPercentage: number;
  totalLessons: number;
  currentLesson: number;
}

interface VisualRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  currentLesson?: number;
  overview?: OverviewData;
  pace?: PaceData;
  milestones?: Milestone[];
  studyPlan?: any;
  initialTab?: 'overview' | 'master_plan';
}

interface LessonMilestone {
  lesson: number;
  finishDate: string;
  finishDayIndex: number;
  isDedicatedPractice: boolean;
}

export default function VisualRoadmapModal({
  isOpen,
  onClose,
  startDate,
  endDate,
  currentLesson = 1,
  overview,
  pace,
  milestones = [],
  studyPlan,
  initialTab = 'overview'
}: VisualRoadmapModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'master_plan'>(initialTab);
  const [selectedLessonFilter, setSelectedLessonFilter] = useState<string>('all');
  const [onlyPracticeDays, setOnlyPracticeDays] = useState<boolean>(false);
  const todayRef = useRef<HTMLDivElement | null>(null);

  // Sync activeTab when initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Today string in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Format Vietnamese Full Date
  const formatVnDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const dow = daysOfWeek[d.getDay()];
        return `${dow}, ${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  };

  // Compute lesson completion milestones from studyPlan
  const lessonMilestones = useMemo<LessonMilestone[]>(() => {
    if (!studyPlan?.days || !Array.isArray(studyPlan.days)) return [];
    const map = new Map<number, LessonMilestone>();

    studyPlan.days.forEach((day: any) => {
      const tasks = day.tasks || [];
      // Lesson completion is marked on the day containing single_review or grammar
      tasks.forEach((t: any) => {
        if (!t.lesson) return;
        if (t.itemType === 'single_review' || t.itemType === 'grammar') {
          map.set(t.lesson, {
            lesson: t.lesson,
            finishDate: day.date,
            finishDayIndex: day.dayIndex,
            isDedicatedPractice: true
          });
        } else if (!map.has(t.lesson)) {
          map.set(t.lesson, {
            lesson: t.lesson,
            finishDate: day.date,
            finishDayIndex: day.dayIndex,
            isDedicatedPractice: false
          });
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => a.lesson - b.lesson);
  }, [studyPlan]);

  // Major milestones
  const n5Milestone = useMemo(() => lessonMilestones.find(m => m.lesson === 25), [lessonMilestones]);
  const n4Milestone = useMemo(() => {
    return lessonMilestones.find(m => m.lesson === 50) || (lessonMilestones.length > 0 ? lessonMilestones[lessonMilestones.length - 1] : null);
  }, [lessonMilestones]);

  // Filtered days in Master Plan
  const planDays = useMemo(() => {
    if (!studyPlan?.days || !Array.isArray(studyPlan.days)) return [];
    return studyPlan.days.filter((d: any) => {
      // Filter by review/completion days
      if (onlyPracticeDays) {
        const hasReview = (d.tasks || []).some((t: any) => t.itemType === 'single_review' || t.itemType === 'cumulative_review');
        if (!hasReview) return false;
      }
      // Filter by lesson
      if (selectedLessonFilter !== 'all') {
        const targetL = parseInt(selectedLessonFilter, 10);
        const hasLesson = (d.tasks || []).some((t: any) => t.lesson === targetL);
        if (!hasLesson) return false;
      }
      return true;
    });
  }, [studyPlan, onlyPracticeDays, selectedLessonFilter]);

  // Scroll to today's card
  const handleScrollToToday = () => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      const el = document.getElementById(`master-day-${todayStr}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Scroll to a specific day
  const handleScrollToDay = (dateStr: string) => {
    const el = document.getElementById(`master-day-${dateStr}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (!isOpen) return null;

  const actualPct = pace?.actualPercentage ?? Math.min(100, Math.round((currentLesson / 50) * 100));
  const expectedPct = pace?.expectedPercentage ?? 50;
  const daysDiff = pace?.daysDiff ?? 0;
  const paceStatus = pace?.status ?? 'on_track';

  const getPaceBadge = () => {
    if (paceStatus === 'ahead') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          🚀 Nhanh hơn +{Math.abs(daysDiff)} ngày (Vượt kế hoạch)
        </span>
      );
    }
    if (paceStatus === 'behind') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          ⚠️ Chậm hơn {Math.abs(daysDiff)} ngày so với kỳ vọng
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
        🟢 Đúng tiến độ chuẩn (On Track)
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="shrink-0 p-5 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 rounded-xl bg-slate-800/80 border border-slate-700">🗺️</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-cyan-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  Sơ Đồ Lộ Trình & Master Plan Toàn Khóa
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                  <span>Khung thời gian mục tiêu:</span>
                  <span className="text-slate-200 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{startDate}</span>
                  <span className="text-cyan-400 font-bold">➔</span>
                  <span className="text-emerald-400 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{endDate}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold">
                    Chuẩn 1 Kanji = 1 Ngữ pháp = 3 Từ vựng
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors border border-slate-800 hover:border-slate-700 cursor-pointer"
              title="Đóng modal"
            >
              ✕
            </button>
          </div>

          {/* Navigation Tabs Switcher */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-start">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>📊</span>
              <span>Thước Đo & Đánh Giá Tiến Độ</span>
            </button>
            <button
              onClick={() => setActiveTab('master_plan')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'master_plan'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>📅</span>
              <span>Master Plan Toàn Khóa (50 Bài)</span>
              {studyPlan?.days && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/30 text-emerald-200 font-extrabold">
                  {studyPlan.days.length} ngày
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {activeTab === 'overview' ? (
            /* TAB 1: OVERVIEW & PACE GAUGE */
            <div className="space-y-6">
              {/* 1. Pace Gauge Card */}
              <div className={`p-5 rounded-2xl border transition-all ${
                paceStatus === 'ahead' 
                  ? 'bg-gradient-to-br from-emerald-950/40 to-slate-900/80 border-emerald-500/40'
                  : paceStatus === 'behind'
                  ? 'bg-gradient-to-br from-amber-950/40 to-slate-900/80 border-amber-500/40'
                  : 'bg-gradient-to-br from-indigo-950/40 to-slate-900/80 border-indigo-500/40'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Thước đo tốc độ học tập
                    </div>
                    <div className="mt-1.5 flex items-center gap-3">
                      {getPaceBadge()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs sm:text-sm bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400">Đã qua: </span>
                      <span className="font-bold text-white">{pace?.daysElapsed ?? 0} ngày</span>
                    </div>
                    <div className="w-px h-4 bg-slate-700"></div>
                    <div>
                      <span className="text-slate-400">Còn lại: </span>
                      <span className="font-bold text-cyan-400">{pace?.daysRemaining ?? 0} ngày</span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  {pace?.message || 'Bạn đang học tập theo đúng kế hoạch đề ra. Hãy tiếp tục duy trì nhé!'}
                </p>
              </div>

              {/* 2. Visual Journey Timeline Map */}
              <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span>📍</span> Sơ Đồ Hành Trình Toàn Khóa (Bài 1 - 50)
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Bài hiện tại: {currentLesson}/50
                  </span>
                </div>

                {/* Timeline graphic bar */}
                <div className="relative pt-6 pb-4">
                  {/* Background Line */}
                  <div className="relative w-full h-3.5 bg-slate-800 rounded-full overflow-hidden">
                    {/* Expected progress marker */}
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-slate-700/50 border-r-2 border-dashed border-cyan-400/80"
                      style={{ width: `${Math.min(100, Math.max(0, expectedPct))}%` }}
                      title={`Kỳ vọng hôm nay: ${expectedPct}%`}
                    ></div>
                    {/* Actual progress bar */}
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-700 shadow-lg shadow-indigo-500/30"
                      style={{ width: `${Math.min(100, Math.max(0, actualPct))}%` }}
                    ></div>
                  </div>

                  {/* Nodes: Start, Current Position, Finish */}
                  <div className="relative flex justify-between items-center text-xs mt-3">
                    {/* Start Node */}
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-slate-300">🏁 Xuất phát</span>
                      <span className="text-[11px] text-slate-400">{startDate}</span>
                    </div>

                    {/* Current Position Pin */}
                    <div className="flex flex-col items-center -mt-8">
                      <div className="px-2.5 py-1 rounded-full bg-indigo-600 text-white font-extrabold text-[11px] shadow-lg shadow-indigo-500/50 border border-indigo-400/50 animate-bounce">
                        📍 Bạn đang ở đây (Bài {currentLesson})
                      </div>
                      <span className="text-[11px] font-semibold text-indigo-300 mt-1">
                        {actualPct}% Hoàn thành
                      </span>
                    </div>

                    {/* Finish Node */}
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-emerald-400">🎯 Về đích</span>
                      <span className="text-[11px] text-slate-400">{endDate}</span>
                    </div>
                  </div>
                </div>

                {/* Dual progress comparison */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-800/80">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400">Tiến độ thực tế hiện tại:</span>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">
                      {actualPct}% <span className="text-xs font-normal text-slate-400">({pace?.actualLessons ?? (currentLesson - 1)} bài đã nắm vững)</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400">Tiến độ kỳ vọng đến hôm nay:</span>
                    <div className="text-base font-bold text-cyan-400 mt-0.5">
                      {expectedPct}% <span className="text-xs font-normal text-slate-400">({pace?.expectedLessons ?? 0} bài mục tiêu)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Completed Knowledge Overview */}
              {overview && (
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span>📚</span> Tổng Quan Kiến Thức Đã Nắm Vững
                  </h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs text-slate-400">Từ vựng (Vocabulary)</div>
                      <div className="text-lg sm:text-xl font-extrabold text-white mt-1">
                        {overview.masteredVocab} <span className="text-xs font-normal text-slate-400">/ {overview.totalVocab}</span>
                      </div>
                      <div className="text-xs text-cyan-400 font-semibold mt-0.5">
                        {overview.vocabPercentage}%
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs text-slate-400">Ngữ pháp (Grammar)</div>
                      <div className="text-lg sm:text-xl font-extrabold text-white mt-1">
                        {overview.masteredGrammar} <span className="text-xs font-normal text-slate-400">/ {overview.totalGrammar}</span>
                      </div>
                      <div className="text-xs text-indigo-400 font-semibold mt-0.5">
                        {overview.grammarPercentage}%
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs text-slate-400">Hán tự (Kanji)</div>
                      <div className="text-lg sm:text-xl font-extrabold text-white mt-1">
                        {overview.masteredKanji} <span className="text-xs font-normal text-slate-400">/ {overview.totalKanji}</span>
                      </div>
                      <div className="text-xs text-purple-400 font-semibold mt-0.5">
                        {overview.kanjiPercentage}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: MASTER PLAN TOÀN KHÓA (50 BÀI) */
            <div className="space-y-6">
              {/* 1. Master Plan Highlights & Major Milestone Badges */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <span>🎯</span> Lịch Trình Hoàn Thành Các Mốc Quan Trọng
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tự động tính toán ngày hoàn tất từng bài dựa theo 3 phần lý thuyết & Mẫu câu tích hợp ôn tập
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                      Tổng số ngày: <strong className="text-white">{studyPlan?.days?.length || 0} ngày</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                      Tổng số bài: <strong className="text-white">50 bài</strong>
                    </span>
                  </div>
                </div>

                {/* Major Milestones (N5 & N4) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* N5 Milestone */}
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 flex items-start gap-3.5 relative overflow-hidden">
                    <div className="text-2xl p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30">🎌</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Mốc 1: Sơ cấp N5 (Bài 1 - 25)</div>
                      <div className="text-base font-extrabold text-white mt-0.5">
                        Hoàn thành: <span className="text-cyan-300">{n5Milestone ? formatVnDate(n5Milestone.finishDate) : 'Đang tính toán...'}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Xong toàn bộ 25 bài Minna I gồm Từ vựng, Kanji, Ngữ pháp & các bài ôn tập thực hành
                      </p>
                    </div>
                  </div>

                  {/* N4 Milestone */}
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-start gap-3.5 relative overflow-hidden">
                    <div className="text-2xl p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">🏆</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Mốc 2: Sơ Trung cấp N4 (Bài 26 - 50)</div>
                      <div className="text-base font-extrabold text-white mt-0.5">
                        Hoàn thành: <span className="text-emerald-300">{n4Milestone ? formatVnDate(n4Milestone.finishDate) : formatVnDate(endDate)}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Về đích toàn khóa học 50 bài và sẵn sàng chinh phục các kỳ thi JLPT N5 - N4
                      </p>
                    </div>
                  </div>
                </div>

                {/* Horizontal Lesson Completion Ticker (50 Lessons) */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center justify-between">
                    <span>📌 Xem nhanh ngày hoàn thành từng bài (Nhấp để nhảy đến ngày đó):</span>
                    <span className="text-slate-500 font-normal">Hiển thị {lessonMilestones.length} bài</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                    {lessonMilestones.map((m) => {
                      const isPastOrToday = m.finishDate <= todayStr;
                      const isN5 = m.lesson === 25;
                      const isN4 = m.lesson === 50;

                      return (
                        <button
                          key={m.lesson}
                          onClick={() => {
                            setSelectedLessonFilter(String(m.lesson));
                            handleScrollToDay(m.finishDate);
                          }}
                          className={`shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            isN4
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 hover:bg-emerald-500/30'
                              : isN5
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/50 hover:bg-indigo-500/30'
                              : isPastOrToday
                              ? 'bg-slate-800/80 text-cyan-300 border-slate-700 hover:bg-slate-700'
                              : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Bài {m.lesson}:</span>
                            <span className="font-extrabold text-white">{formatShortDate(m.finishDate)}</span>
                            {m.isDedicatedPractice && <span title="Có ngày thực hành chuyên biệt">🛡️</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 2. Controls & Filter Bar */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Lesson Selector */}
                  <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-400 font-semibold">Lọc theo bài:</span>
                    <select
                      value={selectedLessonFilter}
                      onChange={(e) => setSelectedLessonFilter(e.target.value)}
                      className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="all" className="bg-slate-900 text-white">Tất cả bài học (Bài 1 - 50)</option>
                      {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num} className="bg-slate-900 text-white">
                          Minna Bài {num}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Toggle Practice Days Only */}
                  <button
                    onClick={() => setOnlyPracticeDays(!onlyPracticeDays)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      onlyPracticeDays
                        ? 'bg-purple-600/30 text-purple-200 border-purple-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span>🎯</span>
                    <span>{onlyPracticeDays ? 'Đang lọc: Ngày Hoàn Thành Bài & Ôn Tập' : 'Chỉ xem Ngày Hoàn Thành Bài'}</span>
                  </button>
                </div>

                {/* Jump to Today Button */}
                <button
                  onClick={handleScrollToToday}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <span>🎯</span>
                  <span>Nhảy đến Hôm nay</span>
                </button>
              </div>

              {/* 3. Day-by-Day Master Schedule Timeline */}
              {planDays.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-3xl">📭</span>
                  <p className="text-slate-400 text-sm">Không tìm thấy ngày học nào phù hợp với bộ lọc hiện tại.</p>
                  <button
                    onClick={() => {
                      setSelectedLessonFilter('all');
                      setOnlyPracticeDays(false);
                    }}
                    className="text-xs text-cyan-400 underline hover:text-cyan-300 mt-2 inline-block cursor-pointer"
                  >
                    Đặt lại toàn bộ bộ lọc
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {planDays.map((day: any) => {
                    const isToday = day.date === todayStr;
                    const isDedicatedPractice = day.isDedicatedPracticeDay;
                    const tasks = day.tasks || [];
                    const totalWP = day.workloadPoints || tasks.reduce((sum: number, t: any) => sum + (t.workloadPoints || 0), 0);
                    const totalEstMinutes = tasks.reduce((sum: number, t: any) => sum + (t.estimatedMinutes || 0), 0);

                    // Extract lesson(s) covered
                    const lessonsCovered = [...new Set(tasks.map((t: any) => t.lesson).filter(Boolean))];
                    const completedTasksCount = tasks.filter((t: any) => t.completed).length;

                    // Breakdown of types on this day
                    const vocabTask = tasks.find((t: any) => t.itemType === 'vocabulary');
                    const kanjiTask = tasks.find((t: any) => t.itemType === 'kanji');
                    const grammarTask = tasks.find((t: any) => t.itemType === 'grammar');
                    const practiceTasks = tasks.filter((t: any) => t.itemType === 'single_review' || t.itemType === 'cumulative_review' || t.itemType === 'practice');

                    return (
                      <div
                        key={day.date}
                        id={`master-day-${day.date}`}
                        ref={isToday ? todayRef : null}
                        className={`rounded-2xl border transition-all p-5 space-y-3.5 relative ${
                          isToday
                            ? 'bg-slate-900/95 border-cyan-400 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-400/50'
                            : isDedicatedPractice
                            ? 'bg-slate-950/80 border-purple-500/40 hover:border-purple-500/70'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-750'
                        }`}
                      >
                        {/* Day Top Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800/80">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                              Ngày {day.dayIndex}
                            </span>
                            <span className="text-sm font-extrabold text-white">
                              {formatVnDate(day.date)}
                            </span>

                            {isToday && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 animate-pulse">
                                🔥 HÔM NAY
                              </span>
                            )}

                            {practiceTasks.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-400/40">
                                🎯 Hoàn Thành Bài & Ôn Tập
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-xs">
                            {lessonsCovered.length > 0 && (
                              <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                                {lessonsCovered.map((l: any) => `Bài ${l}`).join(' & ')}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-amber-300 border border-slate-700 font-bold">
                              ⚡ {totalWP} WP
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                              ⏱️ ~{totalEstMinutes} phút
                            </span>
                            <span className={`px-2 py-0.5 rounded-lg font-bold border ${
                              completedTasksCount === tasks.length && tasks.length > 0
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {completedTasksCount}/{tasks.length} xong
                            </span>
                          </div>
                        </div>

                        {/* Breakdown 3 Phần Lý Thuyết & Thực Hành */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                          {/* Vocabulary Mini-Card */}
                          <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                            vocabTask
                              ? 'bg-slate-900/90 border-cyan-500/30 text-slate-200'
                              : 'bg-slate-900/30 border-slate-800/40 text-slate-500'
                          }`}>
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1.5">
                                <span>📚</span> Từ Vựng
                              </span>
                              {vocabTask ? (
                                <span className="text-cyan-400 font-extrabold">{vocabTask.targetCount || 1} từ</span>
                              ) : (
                                <span className="text-slate-600 font-normal">Không có</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1">
                              {vocabTask ? `${vocabTask.estimatedMinutes || 50}p • ${vocabTask.workloadPoints || vocabTask.targetCount} WP` : '-'}
                            </div>
                          </div>

                          {/* Kanji Mini-Card */}
                          <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                            kanjiTask
                              ? 'bg-slate-900/90 border-amber-500/30 text-slate-200'
                              : 'bg-slate-900/30 border-slate-800/40 text-slate-500'
                          }`}>
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1.5">
                                <span>🉐</span> Chữ Hán (Kanji)
                              </span>
                              {kanjiTask ? (
                                <span className="text-amber-400 font-extrabold">{kanjiTask.targetCount || 1} chữ</span>
                              ) : (
                                <span className="text-slate-600 font-normal">Không có</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1">
                              {kanjiTask ? `${kanjiTask.estimatedMinutes || 40}p • ${kanjiTask.workloadPoints || (kanjiTask.targetCount * 3)} WP` : '-'}
                            </div>
                          </div>

                          {/* Grammar Mini-Card */}
                          <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                            grammarTask
                              ? 'bg-slate-900/90 border-purple-500/30 text-slate-200'
                              : 'bg-slate-900/30 border-slate-800/40 text-slate-500'
                          }`}>
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1.5">
                                <span>📝</span> Ngữ Pháp
                              </span>
                              {grammarTask ? (
                                <span className="text-purple-400 font-extrabold">{grammarTask.targetCount || 1} mẫu</span>
                              ) : (
                                <span className="text-slate-600 font-normal">Không có</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1">
                              {grammarTask ? `${grammarTask.estimatedMinutes || 20}p • ${grammarTask.workloadPoints || (grammarTask.targetCount * 3)} WP` : '-'}
                            </div>
                          </div>

                          {/* Dedicated Practice Mini-Card */}
                          <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                            practiceTasks.length > 0
                              ? 'bg-slate-900/90 border-emerald-500/30 text-slate-200'
                              : 'bg-slate-900/30 border-slate-800/40 text-slate-500'
                          }`}>
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1.5">
                                <span>🛡️</span> Luyện Tập / Ôn
                              </span>
                              {practiceTasks.length > 0 ? (
                                <span className="text-emerald-400 font-extrabold">{practiceTasks.length} nhiệm vụ</span>
                              ) : (
                                <span className="text-slate-600 font-normal">Không có</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1">
                              {practiceTasks.length > 0 ? `${practiceTasks.reduce((s: number, t: any) => s + (t.estimatedMinutes || 30), 0)} phút tổng hợp` : '-'}
                            </div>
                          </div>
                        </div>

                        {/* Task List on This Day */}
                        <div className="space-y-1.5 pt-1">
                          {tasks.map((task: any, idx: number) => {
                            return (
                              <div
                                key={task.id || idx}
                                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className={task.completed ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                                    {task.completed ? '✅' : '⏳'}
                                  </span>
                                  <span className={`font-semibold truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                                    {task.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 text-[11px]">
                                  {task.due_time && (
                                    <span className="text-slate-400">⏰ {task.due_time}</span>
                                  )}
                                  <span className="text-cyan-400 font-medium">~{task.estimatedMinutes || 30}p</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Educational Rationale Box */}
                        {day.dayRationale && (
                          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                            <span className="text-base text-cyan-400 shrink-0">💡</span>
                            <div>
                              <strong className="text-cyan-300 font-semibold">Cơ sở phân bổ tải học tập: </strong>
                              <span>{day.dayRationale}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="shrink-0 p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400 hidden sm:block">
            {activeTab === 'master_plan' 
              ? `Hiển thị ${planDays.length} ngày học theo tiến độ phân bổ thực tế.`
              : 'Thước đo tốc độ phản ánh mức độ bám sát kế hoạch.'
            }
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer ml-auto"
          >
            Đã hiểu, quay lại học tập ➔
          </button>
        </div>
      </div>
    </div>
  );
}
