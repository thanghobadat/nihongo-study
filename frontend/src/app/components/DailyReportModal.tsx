'use client';

import React from 'react';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  lessonTitle: string;
  lessonId: number;
  vocabTotal: number;
  vocabMastered: number;
  kanjiTotal: number;
  kanjiMastered: number;
  grammarTotal: number;
  grammarMastered: number;
  startDateStr: string;
  endDateStr: string;
  totalDays: number;
  daysElapsed: number;
  daysRemaining: number;
  targetVocabToday: number;
  vocabBehind: number;
  calculatedVocabTargetPerDay: number;
  onContinueStudy: () => void;
}

export default function DailyReportModal({
  isOpen,
  onClose,
  userName,
  lessonTitle,
  lessonId,
  vocabTotal,
  vocabMastered,
  kanjiTotal,
  kanjiMastered,
  grammarTotal,
  grammarMastered,
  startDateStr,
  endDateStr,
  totalDays,
  daysElapsed,
  daysRemaining,
  targetVocabToday,
  vocabBehind,
  calculatedVocabTargetPerDay,
  onContinueStudy,
}: DailyReportModalProps) {
  if (!isOpen) return null;

  // Format dates for display
  const formatDateStr = (dStr: string) => {
    const parts = dStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dStr;
  };

  const todayFormatted = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Calculate percentages
  const vocabPct = vocabTotal ? Math.round((vocabMastered / vocabTotal) * 100) : 0;
  const kanjiPct = kanjiTotal ? Math.round((kanjiMastered / kanjiTotal) * 100) : 0;
  const grammarPct = grammarTotal ? Math.round((grammarMastered / grammarTotal) * 100) : 0;
  const overallPct = Math.round((vocabPct + kanjiPct + grammarPct) / 3);

  // Keep plan calculations
  // Target needed today to be on track = vocabBehind + calculatedVocabTargetPerDay
  const vocabNeededToday = vocabBehind + calculatedVocabTargetPerDay;

  // Motivational quotes list
  const quotes = [
    "Mỗi ngày học 10 phút hơn 1 tuần học 1 lần. Cùng hoàn thành mục tiêu hôm nay nhé! 💪🌸",
    "Chỉ cần học thuộc thêm 5 từ mới hôm nay, bạn đã tiến gần hơn rất nhiều đến tấm bằng N5/N4! 🚀",
    "Hành trình vạn dặm bắt đầu từ một bước chân. Bạn đang làm rất tốt! ✨",
    "Kỷ luật là cầu nối giữa mục tiêu và thành tựu. Cố lên nhé! 🔥",
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white/90 dark:bg-slate-900/95 p-6 md:p-8 shadow-2xl border border-slate-200/60 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 transition-all transform duration-300 scale-100"
        style={{ boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 30px rgba(99, 102, 241, 0.2)' }}
      >
        {/* Background Decorative Gradient Blobs */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Đóng"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2 shadow-sm border border-indigo-200/50 dark:border-indigo-800/50">
            <span>✨ Nhật ký học tập</span>
            <span>•</span>
            <span>{todayFormatted}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Báo Cáo Tiến Độ Hôm Nay
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Xin chào <span className="font-semibold text-indigo-600 dark:text-indigo-400">{userName || 'Học viên'}</span>! 🖐️ Chúc bạn một ngày học tập hiệu quả.
          </p>
        </div>

        {/* Current Active Lesson Pill */}
        <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <div className="text-xs text-slate-400 font-medium">Bài học hiện tại</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-[220px]">
                {lessonTitle || `Bài ${lessonId}`}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs font-bold">
              {overallPct}% Hoàn thành
            </span>
          </div>
        </div>

        {/* Learning Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-center">
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">Từ vựng</div>
            <div className="text-lg md:text-xl font-black text-indigo-700 dark:text-indigo-300">
              {vocabMastered}<span className="text-xs font-normal text-indigo-400">/{vocabTotal}</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{vocabPct}%</div>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 text-center">
            <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">Chữ Hán</div>
            <div className="text-lg md:text-xl font-black text-purple-700 dark:text-purple-300">
              {kanjiMastered}<span className="text-xs font-normal text-purple-400">/{kanjiTotal}</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{kanjiPct}%</div>
          </div>

          <div className="p-3 rounded-2xl bg-pink-50/70 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-900/50 text-center">
            <div className="text-xs text-pink-600 dark:text-pink-400 font-semibold mb-1">Ngữ pháp</div>
            <div className="text-lg md:text-xl font-black text-pink-700 dark:text-pink-300">
              {grammarMastered}<span className="text-xs font-normal text-pink-400">/{grammarTotal}</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{grammarPct}%</div>
          </div>
        </div>

        {/* Plan Pacing & Target Tracking Card */}
        <div className="mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200 dark:border-slate-700/60">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>🎯 Kế hoạch bài học</span>
              <span className="text-[11px] font-normal text-slate-400">({formatDateStr(startDateStr)} ➔ {formatDateStr(endDateStr)})</span>
            </span>
            <span className="text-xs font-semibold text-indigo-500">
              Ngày {daysElapsed}/{totalDays}
            </span>
          </div>

          {vocabBehind > 0 ? (
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                <span className="text-base leading-none">⚠️</span>
                <span>Bạn đang bị trễ <strong className="text-amber-700 dark:text-amber-300 underline font-extrabold">{vocabBehind} từ vựng</strong> so với kế hoạch!</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                💡 <strong>Để giữ vững kế hoạch (Keep Plan):</strong> Hôm nay bạn nên học bù <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{vocabNeededToday} từ vựng</strong> (gồm {vocabBehind} từ học bù + {calculatedVocabTargetPerDay} từ mới hôm nay) để đưa tiến độ về đúng mốc ngày {formatDateStr(endDateStr)}!
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <span className="text-base leading-none">🟢</span>
                <span>Tuyệt vời! Bạn đang theo đúng kế hoạch bài học.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                🎯 <strong>Mục tiêu hôm nay:</strong> Học thuộc thêm khoảng <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{calculatedVocabTargetPerDay} từ vựng mới</strong> để tiếp tục duy trì phong độ xuất sắc nhé!
              </div>
            </div>
          )}
        </div>

        {/* Motivational Quote */}
        <div className="mb-6 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 text-center text-xs italic text-indigo-600 dark:text-indigo-300 border border-indigo-100/50 dark:border-indigo-900/30">
          "{randomQuote}"
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onContinueStudy}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center"
          >
            🚀 Tiếp tục học ngay
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-colors text-center"
          >
            ☕ Để sau / Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
