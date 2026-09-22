'use client';

import React from 'react';

export interface DebtItem {
  taskId: string;
  title: string;
  itemType: string;
  lesson: number;
  targetCount: number;
  completedCount: number;
  missingCount: number;
}

interface UnfinishedDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  yesterdayDate: string | null;
  debtItems: DebtItem[];
  onReplan: () => Promise<void>;
  onCatchUpToday: () => void;
  isReplanning?: boolean;
}

export default function UnfinishedDebtModal({
  isOpen,
  onClose,
  yesterdayDate,
  debtItems = [],
  onReplan,
  onCatchUpToday,
  isReplanning = false
}: UnfinishedDebtModalProps) {
  if (!isOpen || debtItems.length === 0) return null;

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'vocabulary': return '📖';
      case 'kanji': return '✍️';
      case 'grammar': return '⛩️';
      case 'single_review': return '📝';
      case 'cumulative_review': return '🔄';
      default: return '📌';
    }
  };

  const getItemTypeName = (type: string) => {
    switch (type) {
      case 'vocabulary': return 'Từ vựng';
      case 'kanji': return 'Chữ Hán';
      case 'grammar': return 'Ngữ pháp';
      case 'single_review': return 'Ôn tập bài';
      case 'cumulative_review': return 'Ôn tập tích lũy';
      default: return 'Nhiệm vụ';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-amber-500/50 rounded-2xl shadow-2xl p-6 sm:p-7 text-white space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with warning badge */}
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 text-2xl shrink-0 border border-amber-500/40">
            ⚠️
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Bạn Còn Bài Chưa Hoàn Thành Từ Hôm Qua!
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Tiến độ ngày <span className="text-amber-300 font-semibold">{yesterdayDate}</span> chưa đạt 100%. Hãy chọn cách xử lý để đảm bảo không bị dồn ứ nhé:
            </p>
          </div>
        </div>

        {/* Debt list */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
            Danh sách kiến thức còn thiếu:
          </div>
          {debtItems.map((item, idx) => (
            <div
              key={item.taskId || idx}
              className="p-3 rounded-lg bg-slate-900/90 border border-amber-500/30 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{getItemIcon(item.itemType)}</span>
                <div>
                  <div className="font-semibold text-white">
                    Bài {item.lesson}: {getItemTypeName(item.itemType)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Đã thuộc: {item.completedCount} / {item.targetCount}
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/40 whitespace-nowrap">
                Thiếu {item.missingCount}
              </span>
            </div>
          ))}
        </div>

        {/* Action Choice Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={onReplan}
            disabled={isReplanning}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-indigo-400/30"
          >
            <span>✨</span>
            <span>{isReplanning ? 'AI đang phân bổ lại...' : 'Nhờ AI Replan (Dàn trải nợ, Giữ Deadline)'}</span>
          </button>

          <button
            onClick={onCatchUpToday}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-colors active:scale-[0.98] cursor-pointer"
          >
            💪 Tôi sẽ tự học bù hôm nay
          </button>
        </div>

        {/* Tip footer */}
        <div className="pt-1 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            💡 <em>Ngay khi bạn học bù đủ số lượng còn thiếu hôm nay, hệ thống sẽ tự động cập nhật và popup này sẽ không bao giờ xuất hiện lại!</em>
          </p>
        </div>
      </div>
    </div>
  );
}
