'use client';

import React, { useState, useEffect } from 'react';
import { formatStudyTimeShort, getVietnamDateString } from '../utils/studyTimeHelper';
import DailyReportModal from './DailyReportModal';
import StudyTimeHistoryModal from './StudyTimeHistoryModal';
import { api } from '../utils/api';

interface StudyTimeBadgeProps {
  className?: string;
  onClick?: () => void;
  showModalOnClick?: boolean;
}

export default function StudyTimeBadge({
  className = '',
  onClick,
  showModalOnClick = true
}: StudyTimeBadgeProps) {
  const [seconds, setSeconds] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const today = getVietnamDateString();
      return parseInt(localStorage.getItem(`study_time_${today}`) || '0', 10);
    }
    return 0;
  });
  const [isLive, setIsLive] = useState<boolean>(true);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isHistoryTableOpen, setIsHistoryTableOpen] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const handleSync = (e: any) => {
      if (e.detail) {
        if (e.detail.seconds !== undefined) {
          setSeconds(e.detail.seconds);
        }
        if (e.detail.isLive !== undefined) {
          setIsLive(e.detail.isLive);
        }
      }
    };

    window.addEventListener('study-time-sync', handleSync);
    return () => window.removeEventListener('study-time-sync', handleSync);
  }, []);

  const handleClick = async () => {
    if (onClick) {
      onClick();
      return;
    }

    if (showModalOnClick) {
      // Load study overview to populate report modal
      try {
        const res: any = await api.get('/api/user/study-overview');
        if (res && res.success) {
          setReportData(res);
        }
      } catch {}
      setIsReportOpen(true);
    }
  };

  const formattedShort = formatStudyTimeShort(seconds);
  const user = typeof window !== 'undefined' ? api.getUser() : null;

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer shrink-0 ${className}`}
        title="Thời gian học thực tế hôm nay (Bấm xem Báo cáo ngày)"
        type="button"
      >
        <span className="text-sm">⏱️</span>
        <span className="tracking-tight">{formattedShort}</span>
        {isLive ? (
          <span className="relative flex h-2 w-2" title="Đang tính giờ học (Active)">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        ) : (
          <span className="h-2 w-2 rounded-full bg-amber-400" title="Tạm dừng do không tương tác (Idle)" />
        )}
      </button>

      {/* Internal Daily Report Modal when clicked directly */}
      {showModalOnClick && !onClick && isReportOpen && (
        <DailyReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          userName={user?.display_name || user?.user_metadata?.display_name || 'Học viên'}
          lessonTitle={reportData?.current_position?.title || 'Minna no Nihongo'}
          lessonId={reportData?.current_position?.lesson || 1}
          vocabTotal={reportData?.overview?.totalVocab || 1500}
          vocabMastered={reportData?.overview?.masteredVocab || 0}
          kanjiTotal={reportData?.overview?.totalKanji || 255}
          kanjiMastered={reportData?.overview?.masteredKanji || 0}
          grammarTotal={reportData?.overview?.totalGrammar || 204}
          grammarMastered={reportData?.overview?.masteredGrammar || 0}
          startDateStr={reportData?.planMetadata?.startDate || ''}
          endDateStr={reportData?.planMetadata?.endDate || ''}
          totalDays={reportData?.pace?.totalDays || 30}
          daysElapsed={reportData?.pace?.daysElapsed || 1}
          daysRemaining={reportData?.pace?.daysRemaining || 29}
          targetVocabToday={10}
          vocabBehind={0}
          calculatedVocabTargetPerDay={5}
          studyTimeSeconds={seconds}
          onOpenHistoryTable={() => setIsHistoryTableOpen(true)}
          onContinueStudy={() => setIsReportOpen(false)}
        />
      )}

      {/* Study Time History Modal */}
      {isHistoryTableOpen && (
        <StudyTimeHistoryModal
          isOpen={isHistoryTableOpen}
          onClose={() => setIsHistoryTableOpen(false)}
        />
      )}
    </>
  );
}
