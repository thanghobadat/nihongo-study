'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../utils/api';
import { formatStudyTime, formatStudyHours, evaluateStudyTime, getVietnamDateString } from '../utils/studyTimeHelper';

interface StudyTimeDayItem {
  date: string;
  totalSeconds: number;
  hours: number;
  formatted: string;
  hoursLabel: string;
  progressPct: number;
  evaluation: {
    level: string;
    label: string;
    badge: string;
    color: string;
    score: number;
    comment: string;
  };
}

interface StudyTimeSummary {
  totalSeconds: number;
  totalHours: number;
  totalHoursFormatted: string;
  activeDays: number;
  averageHoursPerActiveDay: number;
  recordDay: {
    date: string;
    seconds: number;
    hours: number;
    formatted: string;
  } | null;
  standardDays: number;
  standardRate: number;
}

interface StudyTimeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueStudy?: () => void;
}

export default function StudyTimeHistoryModal({
  isOpen,
  onClose,
  onContinueStudy
}: StudyTimeHistoryModalProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [historyList, setHistoryList] = useState<StudyTimeDayItem[]>([]);
  const [summaryData, setSummaryData] = useState<StudyTimeSummary | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<'7days' | '30days' | 'all'>('30days');

  const todayStr = useMemo(() => getVietnamDateString(), []);

  // Fetch history data when opened
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    api.get('/api/user/study-time/history')
      .then((res: any) => {
        if (!isMounted) return;
        if (res && res.success) {
          setHistoryList(res.history || []);
          setSummaryData(res.summary || null);
        }
      })
      .catch((err) => {
        console.warn('Failed to load study time history:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Format date helper: "2026-10-05" -> "T2, 05/10/2026"
  const formatDateLabel = (dStr: string) => {
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const dayOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
        return `${dayOfWeek}, ${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch {}
    return dStr;
  };

  // Filter history based on selected period
  const filteredList = useMemo(() => {
    if (!historyList || historyList.length === 0) return [];
    if (filterPeriod === 'all') return historyList;

    const limit = filterPeriod === '7days' ? 7 : 30;
    return historyList.slice(0, limit);
  }, [historyList, filterPeriod]);

  if (!isOpen) return null;

  // Evaluation badge styling helper
  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10';
      case 'standard':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-teal-500/10';
      case 'moderate':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10';
      case 'starter':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-500/10';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-white overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background ambient gradient glow */}
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        {/* 1. Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 shrink-0 bg-slate-950/40">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0 shadow-lg shadow-indigo-500/10">
              ⏱️
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Bảng Lưu Trữ & Đánh Giá Thời Gian Học
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Ngày X học Y tiếng
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Theo dõi thời lượng học thực tế từng ngày, đánh giá mức độ chuyên cần & nỗ lực hướng tới kỳ thi JLPT.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Đóng bảng"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 2. Overview Stats Cards */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 bg-slate-950/60 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3.5">
            {/* Card 1: Tổng tích lũy */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 flex flex-col justify-between">
              <div className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1.5">
                <span>⏱️</span>
                <span>Tổng tích lũy</span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {summaryData?.totalHours || 0} <span className="text-xs font-semibold text-slate-400">giờ</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  ~{summaryData?.totalHoursFormatted || '0 phút'}
                </div>
              </div>
            </div>

            {/* Card 2: Ngày có học */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <span>📅</span>
                <span>Ngày có học</span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {summaryData?.activeDays || 0} <span className="text-xs font-semibold text-slate-400">ngày</span>
                </div>
                <div className="text-[10px] text-emerald-400 truncate mt-0.5">
                  Đã ghi nhận dữ liệu
                </div>
              </div>
            </div>

            {/* Card 3: Trung bình / ngày */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <span>📊</span>
                <span>Trung bình / ngày</span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-teal-300 tracking-tight">
                  {summaryData?.averageHoursPerActiveDay || 0} <span className="text-xs font-semibold text-slate-400">giờ/ngày</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  Trên các ngày có học
                </div>
              </div>
            </div>

            {/* Card 4: Kỷ lục ngày */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col justify-between">
              <div className="text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
                <span>🏆</span>
                <span>Kỷ lục 1 ngày</span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
                  {summaryData?.recordDay?.hours || 0} <span className="text-xs font-semibold text-slate-400">giờ</span>
                </div>
                <div className="text-[10px] text-amber-200/80 truncate mt-0.5">
                  {summaryData?.recordDay?.date ? formatDateLabel(summaryData.recordDay.date) : 'Chưa có'}
                </div>
              </div>
            </div>

            {/* Card 5: Tỷ lệ đạt chuẩn */}
            <div className="col-span-2 sm:col-span-1 p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex flex-col justify-between">
              <div className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
                <span>🎯</span>
                <span>Đạt chuẩn (≥ 1h)</span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
                  {summaryData?.standardRate || 0}%
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {summaryData?.standardDays || 0}/{summaryData?.activeDays || 0} ngày đạt chuẩn
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Filter Toolbar */}
        <div className="px-5 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/30 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Xem dữ liệu:</span>
            <div className="inline-flex rounded-xl p-1 bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setFilterPeriod('7days')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterPeriod === '7days'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                7 ngày qua
              </button>
              <button
                type="button"
                onClick={() => setFilterPeriod('30days')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterPeriod === '30days'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                30 ngày qua
              </button>
              <button
                type="button"
                onClick={() => setFilterPeriod('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterPeriod === 'all'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Toàn bộ ({historyList.length})
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Mục tiêu khuyến nghị: <strong className="text-teal-300">1.5 giờ - 2.0 giờ / ngày</strong>
          </div>
        </div>

        {/* 4. Table Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-slate-800">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 mx-auto border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Đang tải bảng thời gian học...</p>
            </div>
          ) : filteredList.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60 shadow-inner">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead className="bg-slate-950/90 uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-800 sticky top-0 backdrop-blur z-10">
                  <tr>
                    <th className="py-3 px-4">Ngày học</th>
                    <th className="py-3 px-4">Thời gian học</th>
                    <th className="py-3 px-4 min-w-[140px]">Tiến độ mục tiêu ngày</th>
                    <th className="py-3 px-4">Đánh giá nỗ lực</th>
                    <th className="py-3 px-4 hidden md:table-cell">Nhận xét sư phạm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredList.map((item) => {
                    const isToday = item.date === todayStr;
                    const evalInfo = item.evaluation || evaluateStudyTime(item.totalSeconds);

                    return (
                      <tr 
                        key={item.date}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isToday ? 'bg-indigo-950/20 font-semibold' : ''
                        }`}
                      >
                        {/* Cột 1: Ngày */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {formatDateLabel(item.date)}
                            </span>
                            {isToday && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-bold animate-pulse">
                                Hôm nay 🟢
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.date}
                          </div>
                        </td>

                        {/* Cột 2: Thời gian học (Tiếng & Phút) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base sm:text-lg font-black text-amber-300">
                              {item.hours}
                            </span>
                            <span className="text-xs font-bold text-slate-300">tiếng</span>
                            <span className="text-[11px] text-slate-400">
                              ({item.formatted})
                            </span>
                          </div>
                        </td>

                        {/* Cột 3: Thanh đo tiến độ */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">{item.progressPct}% chuẩn 1.5h</span>
                              {item.totalSeconds >= 5400 && (
                                <span className="text-emerald-400 font-bold">✓ Đạt mục tiêu</span>
                              )}
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  item.totalSeconds >= 7200
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                    : item.totalSeconds >= 3600
                                    ? 'bg-gradient-to-r from-teal-500 to-cyan-400'
                                    : item.totalSeconds >= 1800
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                    : item.totalSeconds > 0
                                    ? 'bg-cyan-500'
                                    : 'bg-slate-700'
                                }`}
                                style={{ width: `${Math.min(100, item.progressPct)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Cột 4: Đánh giá nỗ lực */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-xl border shadow-sm ${getBadgeStyle(evalInfo.level)}`}>
                            <span>{evalInfo.badge}</span>
                            <span>{evalInfo.label}</span>
                          </span>
                        </td>

                        {/* Cột 5: Nhận xét */}
                        <td className="py-3.5 px-4 text-xs text-slate-300 hidden md:table-cell">
                          <span className="line-clamp-2 leading-relaxed">
                            {evalInfo.comment}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 space-y-3">
              <span className="text-4xl block">⏱️</span>
              <h3 className="text-base font-bold text-white">Chưa Có Dữ Liệu Thời Gian Học</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Hệ thống tự động đo thời gian học khi bạn thao tác trên các bài học, từ vựng, chữ Hán và ngữ pháp. Hãy bắt đầu học ngay nhé!
              </p>
            </div>
          )}
        </div>

        {/* 5. Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            💡 <em>Thời gian học được đồng bộ theo thời gian thực (real-time delta sync) và lưu vĩnh viễn trên hệ thống.</em>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onContinueStudy && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onContinueStudy();
                }}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
              >
                🚀 Vào học ngay
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
