'use client';

import React from 'react';

interface ReplanConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
  replanType: 'debt' | 'timeline';
  replanCount: number;
  targetEndDate?: string;
}

export default function ReplanConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  replanType = 'debt',
  replanCount = 0,
  targetEndDate
}: ReplanConfirmModalProps) {
  if (!isOpen) return null;

  const nextCount = replanCount + 1;

  // Pedagogical advice based on replan count
  const getPedagogicalAdvice = () => {
    if (replanCount === 0) {
      return {
        level: 'mild',
        badge: '💡 Lời khuyên khởi đầu',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        boxBg: 'bg-cyan-950/20 border-cyan-500/30 text-cyan-200',
        message: 'Bạn chưa từng Replan lần nào! Hãy cân nhắc xem hôm nay bạn có thể tự học bù một phần bài tập được không trước khi dời bài, để giữ vững tính kỷ luật và thói quen học tập hàng ngày.'
      };
    }
    if (replanCount <= 2) {
      return {
        level: 'notice',
        badge: '💡 Lời khuyên sư phạm',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        boxBg: 'bg-amber-950/20 border-amber-500/30 text-amber-200',
        message: `Bạn đã nhờ AI Replan ${replanCount} lần. Việc dời bài tập sẽ làm khối lượng học tập của các ngày sắp tới tăng lên để bù lại. Hãy cố gắng tự học bù nếu có thể nhé!`
      };
    }
    if (replanCount <= 4) {
      return {
        level: 'warning',
        badge: '⚠️ Cảnh báo tải học tập',
        badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        boxBg: 'bg-orange-950/25 border-orange-500/40 text-orange-200',
        message: `Chú ý: Bạn đã Replan ${replanCount} lần! Các bài học dời sang những ngày tới đang bắt đầu tích tụ và tạo áp lực thời gian lớn hơn cho bạn. Đừng quá ỷ lại vào việc Replan!`
      };
    }
    return {
      level: 'danger',
      badge: '🚨 Cảnh báo nghiêm túc: Chống ỷ lại',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse',
      boxBg: 'bg-rose-950/30 border-rose-500/50 text-rose-200',
      message: `Bạn đã Replan tới ${replanCount} lần! Việc liên tục dời hoãn dễ tạo thói quen ỷ lại và làm tăng nguy cơ vỡ kế hoạch 50 bài. Hãy dừng việc dời bài lại, cam kết học bù ngay hôm nay và kỷ luật hơn với bản thân!`
    };
  };

  const advice = getPedagogicalAdvice();

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl p-6 sm:p-7 text-white space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
            {replanCount >= 5 ? '🚨' : replanCount >= 3 ? '⚠️' : '🤖'}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>Xác Nhận Nhờ AI Replan</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {replanType === 'debt' 
                ? `AI sẽ tính toán và dàn trải các bài nợ vào các ngày tiếp theo mà vẫn giữ nguyên hạn chót${targetEndDate ? ` (${targetEndDate})` : ''}.`
                : `AI sẽ tính toán làm mới lại toàn bộ lộ trình 50 bài bám sát theo mốc thời gian${targetEndDate ? ` kết thúc ${targetEndDate}` : ''}.`}
            </p>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">📊</span>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Lịch sử Replan của bạn
              </div>
              <div className="text-sm font-extrabold text-white">
                Đã Replan: <span className="text-amber-400 text-base">{replanCount}</span> lần
              </div>
            </div>
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Lần này là Lần #{nextCount}
          </span>
        </div>

        {/* Pedagogical Callout Box */}
        <div className={`p-4 rounded-2xl border space-y-1.5 leading-relaxed text-xs ${advice.boxBg}`}>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${advice.badgeColor}`}>
              {advice.badge}
            </span>
          </div>
          <p className="pt-1 font-medium">
            {advice.message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span>💪 Hủy bỏ - Tôi sẽ tự học bù</span>
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 border border-amber-400/40"
          >
            {isLoading ? (
              <>
                <span className="animate-spin text-sm">⏳</span>
                <span>AI đang phân bổ lại...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Xác nhận Replan (Lần #{nextCount})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
