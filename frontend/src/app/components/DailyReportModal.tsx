import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { formatStudyTime, getVietnamDateString } from '../utils/studyTimeHelper';

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
  studyTimeFormatted?: string;
  studyTimeSeconds?: number;
  onOpenHistoryTable?: () => void;
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
  studyTimeFormatted,
  studyTimeSeconds,
  onOpenHistoryTable,
}: DailyReportModalProps) {
  if (!isOpen) return null;

  const [internalStudyTime, setInternalStudyTime] = useState<string>(() => {
    if (studyTimeFormatted) return studyTimeFormatted;
    if (studyTimeSeconds !== undefined) return formatStudyTime(studyTimeSeconds);
    if (typeof window !== 'undefined') {
      const today = getVietnamDateString();
      const sec = parseInt(localStorage.getItem(`study_time_${today}`) || '0', 10);
      return formatStudyTime(sec);
    }
    return '0 phút';
  });

  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historySummary, setHistorySummary] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingHistory(true);
    api.get('/api/user/study-time/history', { skipCache: true })
      .then((res: any) => {
        if (res && res.success) {
          setHistoryList(res.history || []);
          setHistorySummary(res.summary || null);
        }
      })
      .catch((err) => {
        console.warn('Failed to load study time history in DailyReportModal:', err);
      })
      .finally(() => setLoadingHistory(false));
  }, [isOpen]);

  useEffect(() => {
    if (studyTimeFormatted) {
      setInternalStudyTime(studyTimeFormatted);
      return;
    }
    if (studyTimeSeconds !== undefined) {
      setInternalStudyTime(formatStudyTime(studyTimeSeconds));
      return;
    }
    const handleSync = (e: any) => {
      if (e.detail && e.detail.seconds !== undefined) {
        setInternalStudyTime(formatStudyTime(e.detail.seconds));
      }
    };
    window.addEventListener('study-time-sync', handleSync);
    return () => window.removeEventListener('study-time-sync', handleSync);
  }, [studyTimeFormatted, studyTimeSeconds]);

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
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white/95 dark:bg-slate-900/95 p-5 sm:p-7 shadow-2xl border border-slate-200/60 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 transition-all transform duration-300 scale-100 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700"
        style={{ boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 30px rgba(99, 102, 241, 0.2)' }}
      >
        {/* Background Decorative Gradient Blobs */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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

        {/* Actual Study Time Banner */}
        <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/80 to-pink-50/80 dark:from-indigo-950/50 dark:via-purple-950/40 dark:to-pink-950/30 border border-indigo-200/70 dark:border-indigo-800/60 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-indigo-100 dark:border-indigo-900/50">⏱️</span>
            <div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1.5">
                <span>Thời gian học thực tế hôm nay</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Đo thực tế" />
              </div>
              <div className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {internalStudyTime}
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-1.5">
            <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              Đo tích cực 🟢
            </span>
            {onOpenHistoryTable && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHistoryTable();
                }}
                className="text-[11px] font-bold text-amber-500 hover:text-amber-400 dark:text-amber-400 dark:hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                title="Mở bảng lưu trữ và đánh giá thời gian học các ngày (ngày X học Y tiếng)"
              >
                <span>Bảng các ngày ➔</span>
              </button>
            )}
          </div>
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

        {/* Daily Study Time Breakdown (Tổng hợp thời gian học các ngày) */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-slate-900/95 via-indigo-950/40 to-slate-900/95 border border-indigo-500/30 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700/60 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Tổng Hợp Thời Gian Học Các Ngày
                </h4>
                <div className="text-[11px] text-slate-400">
                  Chuẩn sư phạm: 1.5 giờ / ngày
                </div>
              </div>
            </div>
            {onOpenHistoryTable && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHistoryTable();
                }}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                title="Mở bảng phân tích chi tiết toàn bộ các ngày"
              >
                <span>Xem chi tiết & biểu đồ ➔</span>
              </button>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400">Tổng tích lũy</div>
              <div className="text-sm font-extrabold text-indigo-300">
                {historySummary?.totalHoursFormatted || '0 giờ'}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400">Trung bình/ngày</div>
              <div className="text-sm font-extrabold text-emerald-400">
                {historySummary?.averageHoursPerActiveDay ? `${historySummary.averageHoursPerActiveDay}h` : '0h'}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400">Kỷ lục ngày</div>
              <div className="text-sm font-extrabold text-amber-400 truncate" title={historySummary?.recordDay?.formatted}>
                {historySummary?.recordDay?.formatted || '---'}
              </div>
            </div>
          </div>

          {/* Daily List / Table (Recent days up to today) */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {loadingHistory ? (
              <div className="py-4 text-center text-xs text-slate-400 animate-pulse">
                ⏳ Đang tải tổng hợp thời gian học các ngày...
              </div>
            ) : historyList.length === 0 ? (
              <div className="py-3 text-center text-xs text-slate-400">
                Chưa có dữ liệu học tập các ngày trước.
              </div>
            ) : (
              historyList.slice(-7).reverse().map((day) => {
                const isToday = day.date === getVietnamDateString();
                const evalInfo = day.evaluation || { badge: '⚪', label: 'Chưa học', level: 'none' };
                return (
                  <div
                    key={day.date}
                    className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                      isToday
                        ? 'bg-indigo-950/70 border-indigo-500/60 shadow-sm'
                        : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">
                        {formatDateStr(day.date)}
                      </span>
                      {isToday && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                          Hôm nay
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="text-right">
                        <span className="font-bold text-white">
                          {day.formatted || '0 phút'}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({day.hoursLabel || '0.0h'})
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        evalInfo.level === 'excellent'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : evalInfo.level === 'standard' || evalInfo.level === 'good'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : evalInfo.level === 'fair'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {evalInfo.badge} {evalInfo.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
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
