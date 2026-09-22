'use client';

import React from 'react';
import Link from 'next/link';

export interface TaskDetail {
  id: string;
  title: string;
  scopeDetails?: string;
  itemType?: string;
  type?: string;
  lesson?: number;
  link?: string;
  isBuffer?: boolean;
  estimatedMinutes?: number;
  due_time?: string;
  completed?: boolean;
  completed_at?: string;
}

export interface DayHistoryItem {
  date: string;
  dayIndex?: number;
  isBufferDay?: boolean;
  isPracticeDay?: boolean;
  planned_count: number;
  completed_count: number;
  completion_rate: number;
  pace_status: 'ahead' | 'on_track' | 'behind' | 'scheduled';
  pace_label: string;
  tasks_detail: TaskDetail[];
  dayRationale?: string;
  workloadPoints?: number;
}

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayData: DayHistoryItem | null;
  onToggleTask?: (taskId: string, completed: boolean, date: string) => void;
}

export default function DayDetailModal({
  isOpen,
  onClose,
  dayData,
  onToggleTask
}: DayDetailModalProps) {
  if (!isOpen || !dayData) return null;

  // Format date display
  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[d.getDay()];
      const dayNum = String(d.getDate()).padStart(2, '0');
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${dayName}, ${dayNum}/${monthNum}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const getTaskLink = (task: TaskDetail) => {
    if (task.link) return task.link;
    const lesson = task.lesson || 1;
    const type = ((task.itemType || task.type) || '').toLowerCase();
    if (type.includes('vocab')) return `/lessons/${lesson}?tab=vocab`;
    if (type.includes('grammar')) return `/lessons/${lesson}?tab=grammar`;
    if (type.includes('kanji')) return `/lessons/${lesson}?tab=kanji`;
    if (type.includes('review') || type.includes('practice')) return `/lessons/${lesson}?tab=review`;
    return `/lessons/${lesson}`;
  };

  const getTaskIcon = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('vocab')) return '📖';
    if (t.includes('grammar')) return '⛩️';
    if (t.includes('kanji')) return '✍️';
    if (t.includes('single_review') || t.includes('cumulative_review') || t.includes('review') || t.includes('practice')) return '🔄';
    if (t.includes('buffer')) return '🛡️';
    return '🎯';
  };

  const getTaskBadgeStyle = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('vocab')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    if (t.includes('grammar')) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    if (t.includes('kanji')) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    if (t.includes('review') || t.includes('practice')) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-7 text-white space-y-5 scrollbar-thin scrollbar-thumb-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📅</span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Chi Tiết Ngày Học: {formatDateDisplay(dayData.date)}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ngày thứ {dayData.dayIndex || 1} trong kế hoạch
                  {dayData.isBufferDay && <span className="ml-2 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[11px]">🛡️ Ngày đệm dự phòng</span>}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Daily Pace & Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Tiến độ ngày</div>
            <div className="text-base font-bold text-white mt-0.5">
              {dayData.completed_count} / {dayData.planned_count} việc
            </div>
            <div className="text-xs text-indigo-400 font-semibold">{dayData.completion_rate}%</div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Đánh giá ngày</div>
            <div className="mt-1">
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                dayData.pace_status === 'ahead'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : dayData.pace_status === 'behind'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              }`}>
                {dayData.pace_label}
              </span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Trạng thái hoàn thành</div>
            <div className="text-xs text-slate-300 mt-1">
              {dayData.completion_rate === 100 ? (
                <span className="text-emerald-400 font-semibold">✓ Đã xong toàn bộ mục tiêu</span>
              ) : dayData.completion_rate > 0 ? (
                <span className="text-cyan-400 font-semibold">Đang thực hiện dở dang</span>
              ) : (
                <span className="text-slate-400">Chưa bắt đầu học</span>
              )}
            </div>
          </div>
        </div>

        {/* Day Rationale explanation */}
        {dayData.dayRationale && (
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-xs space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs">
                <span>📐</span> Cơ sở phân bổ lộ trình ngày
              </span>
              {dayData.workloadPoints !== undefined && dayData.workloadPoints > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 font-bold border border-indigo-500/30 text-[10px]">
                  Tải trọng: {dayData.workloadPoints} WP
                </span>
              )}
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              {dayData.dayRationale}
            </p>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-1.5">
            <span>📝</span> Danh Sách Nhiệm Vụ Chi Tiết
          </h4>

          {dayData.tasks_detail && dayData.tasks_detail.length > 0 ? (
            <div className="space-y-2.5">
              {dayData.tasks_detail.map((task, idx) => {
                const isDone = !!task.completed;
                return (
                  <div
                    key={task.id || idx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isDone
                        ? 'bg-slate-900/60 border-emerald-500/30 text-slate-300'
                        : 'bg-slate-950/80 border-slate-800 text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {onToggleTask && (
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={(e) => onToggleTask(task.id, e.target.checked, dayData.date)}
                            className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        )}
                        <div>
                          {(() => {
                            const rawType = (task.itemType || task.type || 'task').toLowerCase();
                            const badgeName = rawType.includes('vocab') ? 'TỪ VỰNG' :
                              rawType.includes('kanji') ? 'KANJI' :
                              rawType.includes('grammar') ? 'NGỮ PHÁP' :
                              rawType.includes('single_review') ? 'THỰC HÀNH BÀI' :
                              rawType.includes('cumulative_review') ? 'ÔN TÍCH LŨY' :
                              rawType.includes('buffer') ? 'NGÀY ĐỆM' : 'NHIỆM VỤ';
                            return (
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{getTaskIcon(rawType)}</span>
                                <span className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold ${getTaskBadgeStyle(rawType)}`}>
                                  {badgeName}
                                </span>
                                {task.isBuffer && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                    Buffer
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                          <div className={`text-sm font-semibold mt-1.5 ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                            {task.title}
                          </div>

                          {task.scopeDetails && (
                            <div className="mt-1 text-xs text-indigo-300 font-medium bg-slate-900/80 px-2.5 py-1 rounded-md border border-indigo-500/20 max-w-xl leading-relaxed">
                              <span className="text-indigo-400 font-bold mr-1">🔍 Chi tiết:</span>
                              <span>{task.scopeDetails}</span>
                            </div>
                          )}
                          
                          {/* Timing info */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                            {task.due_time && (
                              <span className="flex items-center gap-1 text-slate-300">
                                <span>⏰ Hạn xong:</span>
                                <span className="font-bold text-amber-300">{task.due_time}</span>
                              </span>
                            )}
                            {task.completed_at && (
                              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                                <span>⚡ Xong lúc:</span>
                                <span>{task.completed_at}</span>
                              </span>
                            )}
                            {task.estimatedMinutes && (
                              <span>~{task.estimatedMinutes} phút</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Jump Button */}
                      <Link
                        href={getTaskLink(task)}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                      >
                        {isDone ? 'Ôn lại ➔' : 'Vào học ➔'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs rounded-xl bg-slate-950/40 border border-slate-800">
              Không có nhiệm vụ chi tiết cho ngày này.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
}
