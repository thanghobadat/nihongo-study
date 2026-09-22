'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../utils/api';
import CourseSwitcher from '../components/CourseSwitcher';
import SidebarSettings from '../components/SidebarSettings';
import DailyReportModal from '../components/DailyReportModal';
import VisualRoadmapModal from '../components/VisualRoadmapModal';
import DayDetailModal, { DayHistoryItem } from '../components/DayDetailModal';
import UnfinishedDebtModal, { DebtItem } from '../components/UnfinishedDebtModal';

// Helper for VAPID base64 conversion
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function UserDashboard() {
  const router = useRouter();
  const user = api.getUser();

  // Navigation & Level State
  const [level, setLevel] = useState<'N5' | 'N4'>('N5');
  const [activeCourse, setActiveCourse] = useState<'minna' | 'marugoto'>('minna');
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDailyReportOpen, setIsDailyReportOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);

  // Modals state
  const [isVisualRoadmapOpen, setIsVisualRoadmapOpen] = useState<boolean>(false);
  const [roadmapInitialTab, setRoadmapInitialTab] = useState<'overview' | 'master_plan'>('overview');
  const [selectedHistoryDay, setSelectedHistoryDay] = useState<DayHistoryItem | null>(null);

  // Collapsible Accordion States (Auxiliary sections default collapsed; Main sections always open)
  const [isTomorrowOpen, setIsTomorrowOpen] = useState<boolean>(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState<boolean>(false);
  const [isRefinementOpen, setIsRefinementOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isPushSettingsOpen, setIsPushSettingsOpen] = useState<boolean>(false);

  // Debt Modal State
  const [debtData, setDebtData] = useState<{ hasDebt: boolean; debtItems: DebtItem[]; yesterdayDate: string | null } | null>(null);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState<boolean>(false);
  const [isReplanningDebt, setIsReplanningDebt] = useState<boolean>(false);

  // Fixed Timeline state
  const [startDateStr, setStartDateStr] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [endDateStr, setEndDateStr] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // Study Plan & Overview data
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [studyOverview, setStudyOverview] = useState<any>(null);
  const [dailyHistory, setDailyHistory] = useState<DayHistoryItem[]>([]);

  // AI Refinement State
  const [refinementComment, setRefinementComment] = useState<string>('');
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  // Web Push State (iOS / Mobile)
  const [isPushSupported, setIsPushSupported] = useState<boolean>(false);
  const [isPushSubscribed, setIsPushSubscribed] = useState<boolean>(false);
  const [pushLoading, setPushLoading] = useState<boolean>(false);

  const showNotification = (msg: string) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage(null);
    }, 3500);
  };

  // Check Web Push support on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsPushSupported(true);
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setIsPushSubscribed(true);
          }
        });
      }).catch(() => {});
    }
  }, []);

  // Fetch Study Plan, Overview, Daily History and Unfinished Debt
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewRes, planRes, historyRes, debtRes] = await Promise.all([
        api.get('/api/user/study-overview').catch(() => null),
        api.get('/api/user/study-plan').catch(() => null),
        api.get('/api/user/daily-history').catch(() => null),
        api.get('/api/user/study-debt').catch(() => null)
      ]);

      if (overviewRes && overviewRes.success) {
        setStudyOverview(overviewRes);
        if (overviewRes.planMetadata) {
          if (overviewRes.planMetadata.startDate) setStartDateStr(overviewRes.planMetadata.startDate);
          if (overviewRes.planMetadata.endDate) setEndDateStr(overviewRes.planMetadata.endDate);
        }
        if (overviewRes.current_position?.lesson) {
          setSelectedLessonId(overviewRes.current_position.lesson);
          setLevel(overviewRes.current_position.lesson >= 26 ? 'N4' : 'N5');
        }
      }

      if (planRes && planRes.success && planRes.plan) {
        setStudyPlan(planRes.plan);
        if (planRes.plan.startDate) setStartDateStr(planRes.plan.startDate);
        if (planRes.plan.endDate) setEndDateStr(planRes.plan.endDate);
        if (planRes.plan.refinementNote) setAiNote(planRes.plan.refinementNote);
      }

      if (historyRes && historyRes.success && Array.isArray(historyRes.history)) {
        setDailyHistory(historyRes.history);
      }

      // Check yesterday's debt: Auto-open if debt exists, Auto-dismiss if debt is 0
      if (debtRes && debtRes.hasDebt && debtRes.debtItems && debtRes.debtItems.length > 0) {
        setDebtData(debtRes);
        setIsDebtModalOpen(true);
      } else {
        setDebtData(null);
        setIsDebtModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Replan Debt
  const handleReplanDebt = async () => {
    try {
      setIsReplanningDebt(true);
      const res = await api.post('/api/user/replan-debt', {});
      if (res && res.success && res.plan) {
        setStudyPlan(res.plan);
        setIsDebtModalOpen(false);
        showNotification('🎯 AI đã tái phân bổ bài nợ vào các ngày tới và GIỮ NGUYÊN ngày kết thúc!');
        fetchDashboardData();
      } else {
        showNotification(res?.error || 'Không thể replan bài nợ lúc này.');
      }
    } catch (err: any) {
      showNotification('Lỗi khi replan bài nợ: ' + err.message);
    } finally {
      setIsReplanningDebt(false);
    }
  };

  // Generate initial plan with AI
  const handleGeneratePlan = async () => {
    try {
      setIsGeneratingPlan(true);
      const res = await api.post('/api/ai/generate-study-plan', {
        startDate: startDateStr,
        endDate: endDateStr,
        targetLevel: 'All',
        currentProgress: {
          currentLesson: selectedLessonId
        }
      });

      if (res && res.success && res.plan) {
        setStudyPlan(res.plan);
        await api.post('/api/user/study-plan', { plan: res.plan });
        showNotification('✨ AI đã làm mới hoàn toàn kế hoạch trọn vẹn 50 bài bám sát mốc thời gian!');
        fetchDashboardData();
      } else {
        showNotification(res?.error || 'Không thể tạo kế hoạch lúc này.');
      }
    } catch (err: any) {
      showNotification('Lỗi khi kết nối AI tạo kế hoạch: ' + err.message);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // AI Refine Plan keeping endDate
  const handleRefinePlan = async () => {
    if (!refinementComment.trim()) {
      showNotification('Vui lòng nhập mong muốn điều chỉnh để AI xử lý.');
      return;
    }

    try {
      setIsRefining(true);
      const res = await api.post('/api/ai/refine-study-plan', {
        currentPlan: studyPlan,
        userComment: refinementComment,
        startDate: startDateStr,
        endDate: endDateStr,
        targetLevel: 'All',
        currentProgress: {
          currentLesson: selectedLessonId
        }
      });

      if (res && res.success && res.plan) {
        setStudyPlan(res.plan);
        setAiNote(res.plan.refinementNote || null);
        await api.post('/api/user/study-plan', { plan: res.plan });
        setRefinementComment('');
        showNotification('🎯 AI đã làm mới hoàn toàn kế hoạch 50 bài và GIỮ NGUYÊN 100% ngày kết thúc!');
        fetchDashboardData();
      } else {
        showNotification(res?.error || 'Không thể tinh chỉnh kế hoạch lúc này.');
      }
    } catch (err: any) {
      showNotification('Lỗi khi tinh chỉnh kế hoạch: ' + err.message);
    } finally {
      setIsRefining(false);
    }
  };

  // Update task due time
  const handleUpdateTaskDueTime = async (taskId: string, due_time: string, date?: string) => {
    // 1. Optimistic update local state immediately so user sees new time instantly without losing focus
    if (studyPlan && studyPlan.days) {
      const updatedDays = studyPlan.days.map((day: any) => {
        if (!date || day.date === date) {
          return {
            ...day,
            tasks: (day.tasks || []).map((t: any) => t.id === taskId ? { ...t, due_time } : t)
          };
        }
        return day;
      });
      setStudyPlan({ ...studyPlan, days: updatedDays });
    }

    // 2. Persist silently to backend without triggering full-page reload
    try {
      await api.post('/api/user/daily-tasks/schedule', {
        taskId,
        due_time,
        date
      });
      showNotification(`⏰ Đã lưu mốc giờ hẹn: ${due_time}`);
    } catch (err: any) {
      showNotification('Lỗi lưu giờ hẹn: ' + err.message);
    }
  };

  // Enable Web Push on iPhone / Browser
  const handleEnablePush = async () => {
    if (!isPushSupported) {
      showNotification('Vui lòng làm theo hướng dẫn Safari để thêm ra màn hình chính trước.');
      return;
    }

    try {
      setPushLoading(true);
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        showNotification('Bạn cần cấp quyền Thông báo (Allow) để nhận chuông nhắc bài.');
        setPushLoading(false);
        return;
      }

      const keyRes = await api.get('/api/user/vapid-public-key');
      if (!keyRes || !keyRes.publicKey) {
        throw new Error('Không lấy được VAPID public key từ server');
      }

      const convertedKey = urlBase64ToUint8Array(keyRes.publicKey);
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });

      await api.post('/api/user/push-subscription', {
        subscription,
        deviceName: navigator.userAgent.includes('iPhone') ? 'iPhone Safari (PWA)' : 'Trình duyệt Web'
      });

      setIsPushSubscribed(true);
      showNotification('🔔 Đã bật thông báo thành công! iPhone đã sẵn sàng nhận tin.');
    } catch (err: any) {
      console.error('Push error:', err);
      showNotification('Không thể kích hoạt thông báo: ' + err.message);
    } finally {
      setPushLoading(false);
    }
  };

  // Test Push Notification
  const handleSendTestPush = async () => {
    try {
      setPushLoading(true);
      const res = await api.post('/api/user/send-test-push', {});
      if (res && res.success) {
        showNotification('📲 Đã bắn chuông thông báo thử nghiệm về iPhone của bạn!');
      } else {
        showNotification(res?.error || 'Chưa gửi được thông báo. Hãy bật thông báo trước.');
      }
    } catch (err: any) {
      showNotification('Lỗi gửi thử chuông: ' + err.message);
    } finally {
      setPushLoading(false);
    }
  };

  // Current today's date in YYYY-MM-DD (Local Timezone)
  const todayStr = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();
  const todayTasks = (studyPlan?.days || []).find((d: any) => d.date === todayStr)?.tasks || [];

  // Tomorrow calculations & Tasks for Accordion
  const tomorrowDateStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const tomorrowFormatted = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();

  const tomorrowDay = (() => {
    let day = dailyHistory.find(d => d.date === tomorrowDateStr);
    if (!day && studyPlan?.days) {
      const planDay = studyPlan.days.find((d: any) => d.date === tomorrowDateStr);
      if (planDay) {
        const planned = planDay.plannedCount || (planDay.tasks ? planDay.tasks.length : 0);
        const completed = planDay.completedCount || (planDay.tasks ? planDay.tasks.filter((t: any) => t.completed).length : 0);
        day = {
          date: planDay.date,
          dayIndex: planDay.dayIndex,
          isBufferDay: planDay.isBufferDay,
          isPracticeDay: planDay.isPracticeDay,
          planned_count: planned,
          completed_count: completed,
          completion_rate: planned > 0 ? Math.round((completed / planned) * 100) : 0,
          pace_status: 'scheduled',
          pace_label: planDay.isPracticeDay ? 'Ngày thực hành chuyên biệt 🛡️' : 'Sắp tới 📅',
          tasks_detail: planDay.tasks || [],
          dayRationale: planDay.dayRationale,
          workloadPoints: planDay.workloadPoints
        } as any;
      }
    }
    return day;
  })();

  const tomorrowDayPlan = (studyPlan?.days || []).find((d: any) => d.date === tomorrowDateStr);
  const todayDayPlan = (studyPlan?.days || []).find((d: any) => d.date === todayStr);
  const tomorrowTasks = tomorrowDay?.tasks_detail || tomorrowDayPlan?.tasks || [];

  // Lessons today details for Overview Card 2
  const lessonsToday = studyOverview?.todayLessonsDetails || [];

  // Estimated time formatting helper
  const formatEstimatedTime = (mins: number) => {
    if (!mins || mins <= 0) return '';
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours > 0 && remainingMins > 0) return `~${hours}h ${remainingMins}p (${mins} phút)`;
    if (hours > 0) return `~${hours} giờ (${mins} phút)`;
    return `~${mins} phút`;
  };

  const todayTotalEstMinutes = todayTasks.reduce((sum: number, t: any) => sum + (t.estimatedMinutes || 0), 0);

  // Status checks for knowledge sections in today's lesson(s)
  const isVocabDone = todayTasks.some((t: any) => t.itemType === 'vocabulary') && todayTasks.filter((t: any) => t.itemType === 'vocabulary').every((t: any) => t.completed);
  const isKanjiDone = todayTasks.some((t: any) => t.itemType === 'kanji') && todayTasks.filter((t: any) => t.itemType === 'kanji').every((t: any) => t.completed);
  const isGrammarDone = todayTasks.some((t: any) => t.itemType === 'grammar') && todayTasks.filter((t: any) => t.itemType === 'grammar').every((t: any) => t.completed);

  // Dynamic breakdown of today's active tasks (vocabulary, kanji, grammar, review)
  const todayBreakdown = (() => {
    const list: Array<{
      key: string;
      name: string;
      icon: string;
      current: number;
      target: number;
      remaining: number;
      unit: string;
    }> = [];

    // 1. Vocabulary
    const vocabTasks = todayTasks.filter((t: any) => (t.itemType || t.type) === 'vocabulary');
    if (vocabTasks.length > 0) {
      const current = vocabTasks.reduce((sum: number, t: any) => sum + (t.currentCount || 0), 0);
      const target = vocabTasks.reduce((sum: number, t: any) => sum + (t.targetCount || 1), 0);
      list.push({
        key: 'vocabulary',
        name: 'Từ vựng',
        icon: '📚',
        current,
        target,
        remaining: Math.max(0, target - current),
        unit: 'từ'
      });
    }

    // 2. Kanji
    const kanjiTasks = todayTasks.filter((t: any) => (t.itemType || t.type) === 'kanji');
    if (kanjiTasks.length > 0) {
      const current = kanjiTasks.reduce((sum: number, t: any) => sum + (t.currentCount || 0), 0);
      const target = kanjiTasks.reduce((sum: number, t: any) => sum + (t.targetCount || 1), 0);
      list.push({
        key: 'kanji',
        name: 'Chữ Hán (Kanji)',
        icon: '🉐',
        current,
        target,
        remaining: Math.max(0, target - current),
        unit: 'chữ'
      });
    }

    // 3. Grammar
    const grammarTasks = todayTasks.filter((t: any) => (t.itemType || t.type) === 'grammar');
    if (grammarTasks.length > 0) {
      const current = grammarTasks.reduce((sum: number, t: any) => sum + (t.currentCount || 0), 0);
      const target = grammarTasks.reduce((sum: number, t: any) => sum + (t.targetCount || 1), 0);
      list.push({
        key: 'grammar',
        name: 'Ngữ pháp',
        icon: '⛩️',
        current,
        target,
        remaining: Math.max(0, target - current),
        unit: 'mẫu câu'
      });
    }

    // 4. Single Review (Thực hành bài)
    const singleReviewTasks = todayTasks.filter((t: any) => (t.itemType || t.type) === 'single_review');
    if (singleReviewTasks.length > 0) {
      const current = singleReviewTasks.reduce((sum: number, t: any) => sum + (t.currentCount || (t.completed ? 1 : 0)), 0);
      const target = singleReviewTasks.length;
      list.push({
        key: 'single_review',
        name: 'Thực hành bài',
        icon: '🛡️',
        current,
        target,
        remaining: Math.max(0, target - current),
        unit: 'bài'
      });
    }

    // 5. Cumulative Review (Ôn tích lũy)
    const cumulativeReviewTasks = todayTasks.filter((t: any) => (t.itemType || t.type) === 'cumulative_review');
    if (cumulativeReviewTasks.length > 0) {
      const current = cumulativeReviewTasks.reduce((sum: number, t: any) => sum + (t.currentCount || (t.completed ? 1 : 0)), 0);
      const target = cumulativeReviewTasks.length;
      list.push({
        key: 'cumulative_review',
        name: 'Ôn tích lũy',
        icon: '🔄',
        current,
        target,
        remaining: Math.max(0, target - current),
        unit: 'bài'
      });
    }

    return list;
  })();

  const todayRemainingTotal = todayBreakdown.reduce((sum, item) => sum + item.remaining, 0);
  const todayTargetTotal = todayBreakdown.reduce((sum, item) => sum + item.target, 0);
  const todayCurrentTotal = todayBreakdown.reduce((sum, item) => sum + item.current, 0);
  const todayPercentage = todayTargetTotal > 0 ? Math.round((todayCurrentTotal / todayTargetTotal) * 100) : 0;
  const todayUnitLabel = todayBreakdown.length === 1 ? todayBreakdown[0].unit : 'mục';

  // Countdown calculations
  const calculateDaysRemaining = () => {
    const end = new Date(endDateStr);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'vocabulary': return '📖';
      case 'kanji': return '✍️';
      case 'grammar': return '⛩️';
      case 'single_review': return '📝';
      case 'cumulative_review': return '🔄';
      default: return '🎯';
    }
  };

  const getTaskBadgeStyle = (type: string) => {
    switch (type) {
      case 'vocabulary': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'kanji': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'grammar': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'single_review': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'cumulative_review': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getTaskTypeName = (type: string) => {
    switch (type) {
      case 'vocabulary': return 'TỪ VỰNG';
      case 'kanji': return 'CHỮ HÁN (KANJI)';
      case 'grammar': return 'NGỮ PHÁP';
      case 'single_review': return 'ÔN TẬP BÀI (30p)';
      case 'cumulative_review': return 'ÔN TÍCH LŨY 1->HIỆN TẠI (30p)';
      default: return 'NHIỆM VỤ';
    }
  };

  const menuItems = [
    { name: 'Cẩm nang học', id: 'guide', icon: '📖', active: false },
    { name: 'Tiến độ học', id: 'dashboard', icon: '📊', active: true },
    { name: 'Ngữ pháp', id: 'roadmap', icon: '🗺️', active: false },
    { name: 'Từ vựng', id: 'vocab', icon: '📚', active: false },
    { name: 'Chữ Hán (Kanji)', id: 'kanji', icon: '🉐', active: false },
    { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️', active: false },
    { name: 'Ôn tập tổng hợp', id: 'review', icon: '📝', active: false }
  ];

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-[#0a0f1d] text-slate-100 font-sans relative">
      {/* Mobile Hamburger toggle button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden absolute top-4 left-4 z-40 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 cursor-pointer backdrop-blur-md active:scale-95 shadow-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* 1. Left Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950/95 border-r border-slate-800/80 flex flex-col justify-between p-6 backdrop-blur-xl shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-8 px-2 shrink-0">
            <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {activeCourse === 'marugoto' ? 'Marugoto A1' : 'Nihongo Flow'}
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white text-xl p-1 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <CourseSwitcher
            activeCourse={activeCourse}
            onSwitch={(course) => {
              setActiveCourse(course);
              localStorage.setItem('activeCourse', course);
              setSelectedLessonId(course === 'minna' ? 1 : 101);
            }}
          />

          <nav className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-0 select-none scrollbar-thin scrollbar-thumb-slate-800">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setIsSidebarOpen(false);
                  if (item.id === 'guide') router.push('/guide');
                  else if (item.id === 'roadmap') router.push('/roadmap');
                  else if (item.id !== 'dashboard') router.push(`/lessons/${selectedLessonId}?tab=${item.id}`);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium ${
                  item.active
                    ? 'bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 text-indigo-400 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-slate-900/40'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
        <SidebarSettings />
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 space-y-6 pt-16 lg:pt-8 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Toast Notification */}
        {message && (
          <div className="fixed top-6 right-6 z-50 px-5 py-3.5 bg-slate-900/95 border border-indigo-500/50 text-white text-xs sm:text-sm rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200">
            <span className="text-indigo-400">💡</span>
            <span>{message}</span>
          </div>
        )}

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
                Tiến Độ & Kế Hoạch Học Tập
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                AI Planner (Theo Khối Lượng Thực Tế)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Lý thuyết kết hợp thực hành 4 dạng & ôn tích lũy • Hoàn thành trọn vẹn 50 bài • Tự động tracking
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => {
                setRoadmapInitialTab('overview');
                setIsVisualRoadmapOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all duration-200 active:scale-95 border border-indigo-400/30 cursor-pointer"
            >
              <span>🗺️</span>
              <span>Sơ Đồ Tiến Độ</span>
            </button>
            <button
              onClick={() => {
                setRoadmapInitialTab('master_plan');
                setIsVisualRoadmapOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-teal-600/30 flex items-center gap-2 transition-all duration-200 active:scale-95 border border-teal-400/30 cursor-pointer"
            >
              <span>📅</span>
              <span>Master Plan 50 Bài</span>
            </button>
          </div>
        </div>

        {/* 1. KHUNG THỜI GIAN MỤC TIÊU (CỐ ĐỊNH - ĐƯA LÊN TRÊN CÙNG) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden transition-all shadow-xl">
          <button
            type="button"
            onClick={() => setIsTimelineOpen(!isTimelineOpen)}
            className="w-full p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">⏱️</span>
              <div>
                <div className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
                  <span>Khung Thời Gian Mục Tiêu (Cố Định)</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    ⏳ Còn {calculateDaysRemaining()} ngày
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Khóa ngày kết thúc: <strong className="text-slate-200">{startDateStr}</strong> ➔ <strong className="text-emerald-400">{endDateStr}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition-all self-end sm:self-center">
              <span>{isTimelineOpen ? 'Thu gọn' : 'Chỉnh sửa / Tạo lại plan'}</span>
              <span>{isTimelineOpen ? '▲' : '▼'}</span>
            </div>
          </button>

          {isTimelineOpen && (
            <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-950/60 space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-300">
                    Khóa chặt mốc ngày kết thúc. Phân bổ khoa học Từ vựng, Chữ Hán, Ngữ pháp kết hợp <strong className="text-slate-100">ôn tập thực hành 4 dạng trọn vẹn 50 bài</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 font-semibold">🏁 Bắt đầu:</span>
                    <input
                      type="date"
                      value={startDateStr}
                      onChange={(e) => setStartDateStr(e.target.value)}
                      className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 font-semibold">🎯 Kết thúc:</span>
                    <input
                      type="date"
                      value={endDateStr}
                      onChange={(e) => setEndDateStr(e.target.value)}
                      className="bg-transparent text-xs text-emerald-400 font-bold focus:outline-none cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={handleGeneratePlan}
                    disabled={isGeneratingPlan}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isGeneratingPlan ? 'Đang tính toán...' : '✨ Tạo lại plan theo mốc này'}
                  </button>
                </div>
              </div>

              {studyPlan?.workloadRationale && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <span>📐</span> Cơ sở phân bổ khoa học (Khối lượng thực tế & 1 Ngày Thực Hành Chuyên Biệt):
                  </span>
                  <p className="text-slate-300 leading-relaxed">{studyPlan.workloadRationale}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. OVERVIEW CARDS (ALWAYS OPEN - 2 CỘT CÂN ĐỐI) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Đánh giá tốc độ & Tiến độ các mảng hôm nay */}
          <div className={`p-5 rounded-2xl border space-y-3 flex flex-col justify-between ${
            studyOverview?.pace?.status === 'completed'
              ? 'bg-gradient-to-br from-emerald-950/50 via-slate-900 to-indigo-950/40 border-emerald-400/50 shadow-lg shadow-emerald-500/10'
              : studyOverview?.pace?.status === 'ahead'
              ? 'bg-gradient-to-br from-emerald-950/30 to-slate-900 border-emerald-500/40'
              : studyOverview?.pace?.status === 'behind'
              ? 'bg-gradient-to-br from-amber-950/30 to-slate-900 border-amber-500/40'
              : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>Đánh giá tốc độ & Tiến độ hôm nay</span>
                </span>
                <span className="text-xs">
                  {studyOverview?.pace?.status === 'completed' ? '🏆' : studyOverview?.pace?.status === 'ahead' ? '🚀' : studyOverview?.pace?.status === 'behind' ? '⚠️' : '⚡'}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  {studyOverview?.pace?.label || 'Đang bám sát kế hoạch 🟢'}
                </div>
                <div className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                  Tiến độ hôm nay: <strong className="text-cyan-400">{todayCurrentTotal}</strong> / {todayTargetTotal} {todayUnitLabel} ({todayPercentage}%)
                </div>
              </div>

              {/* Dynamic Active Breakdown: Từ vựng xx/xx, Kanji yy/yy, Ngữ pháp aa/bb (Chỉ hiển thị mảng có học hôm nay) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>Mục tiêu cần hoàn thành hôm nay:</span>
                  </span>
                  {todayRemainingTotal > 0 ? (
                    <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                      Còn lại: {todayRemainingTotal} mục
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ✓ Đã xong toàn bộ mục tiêu hôm nay
                    </span>
                  )}
                </div>

                {todayBreakdown.length > 0 ? (
                  <div className={`grid gap-2 ${todayBreakdown.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {todayBreakdown.map((item) => {
                      const isFinished = item.current >= item.target;
                      return (
                        <div
                          key={item.key}
                          className={`p-2.5 rounded-xl border transition-all space-y-1.5 ${
                            isFinished
                              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                              : 'bg-slate-950/70 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-200 flex items-center gap-1.5">
                              <span>{item.icon}</span>
                              <span>{item.name}:</span>
                            </span>
                            <span className={`font-black ${isFinished ? 'text-emerald-300' : 'text-cyan-300'}`}>
                              {item.current} / {item.target} {item.unit}
                            </span>
                          </div>

                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFinished ? 'bg-emerald-400' : 'bg-cyan-400'
                              }`}
                              style={{ width: `${Math.min(100, item.target > 0 ? Math.round((item.current / item.target) * 100) : 0)}%` }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">
                              {isFinished ? (
                                <span className="text-emerald-400 font-bold">✓ Đã hoàn thành</span>
                              ) : (
                                <span>Chưa xong: <strong className="text-amber-300 font-bold">còn {item.remaining} {item.unit}</strong></span>
                              )}
                            </span>
                            <span className={`${isFinished ? 'text-emerald-300 font-bold' : 'text-slate-400 font-medium'}`}>
                              {item.target > 0 ? Math.round((item.current / item.target) * 100) : 0}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400 text-center">
                    Hôm nay chưa có bài tập cụ thể. Hãy bấm "Chỉnh sửa / Tạo lại plan" để AI phân bổ nhé!
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80">
              {studyOverview?.pace?.message || 'Tiến độ học tập ổn định theo đúng dự kiến.'}
            </p>
          </div>

          {/* Card 3: Nội dung bài đang học (Detailed Lesson Content - Supports 1 or 2 Lessons) */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">📖</span>
                  <span>Nội dung bài đang học</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {lessonsToday.length > 1 ? `Hôm nay: 2 bài (Gối đầu)` : `Bài ${lessonsToday[0]?.lesson || selectedLessonId}`}
                </span>
              </div>

              {lessonsToday.length <= 1 ? (
                // Single Lesson View
                (() => {
                  const item = lessonsToday[0] || {
                    lesson: selectedLessonId,
                    vocabCount: 32,
                    kanjiCount: 5,
                    grammarCount: 4,
                    vocabScope: 'Toàn bộ từ vựng',
                    kanjiChars: '',
                    grammarTitlesList: [],
                    isPracticeDay: false
                  };
                  return (
                    <div className="space-y-2 text-xs pt-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-white">Bài {item.lesson}</span>
                        {item.isPracticeDay ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            🛡️ Thực hành chuyên biệt
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            🎯 Học tuần tự
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className={`p-2 rounded-xl flex items-start gap-2 border transition-all ${
                          isVocabDone ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm shadow-emerald-500/10' : 'bg-slate-950/60 border-slate-800/80'
                        }`}>
                          <span className="text-cyan-400 text-xs mt-0.5">📚</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-slate-200 text-xs">
                                Từ vựng: <span className="text-cyan-400 font-extrabold">{item.vocabCount} từ</span>
                              </div>
                              {isVocabDone ? (
                                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/30">✓ Đã xong</span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Chưa xong</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate" title={item.vocabScope}>
                              {item.firstVocab && item.lastVocab 
                                ? `Từ #1: ${item.firstVocab} ➔ #${item.vocabCount}: ${item.lastVocab}`
                                : item.vocabScope || 'Toàn bộ từ vựng bài'}
                            </div>
                          </div>
                        </div>

                        <div className={`p-2 rounded-xl flex items-start gap-2 border transition-all ${
                          isKanjiDone ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm shadow-emerald-500/10' : 'bg-slate-950/60 border-slate-800/80'
                        }`}>
                          <span className="text-amber-400 text-xs mt-0.5">🉐</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-slate-200 text-xs">
                                Chữ Hán: <span className="text-amber-400 font-extrabold">{item.kanjiCount} chữ</span>
                              </div>
                              {isKanjiDone ? (
                                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/30">✓ Đã xong</span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Chưa xong</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate" title={item.kanjiChars || item.kanjiScope}>
                              {item.kanjiChars ? `Ký tự: ${item.kanjiChars}` : item.kanjiScope || 'Toàn bộ chữ Hán bài'}
                            </div>
                          </div>
                        </div>

                        <div className={`p-2 rounded-xl flex items-start gap-2 border transition-all ${
                          isGrammarDone ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm shadow-emerald-500/10' : 'bg-slate-950/60 border-slate-800/80'
                        }`}>
                          <span className="text-purple-400 text-xs mt-0.5">⛩️</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-slate-200 text-xs">
                                Ngữ pháp: <span className="text-purple-400 font-extrabold">{item.grammarCount} mẫu câu</span>
                              </div>
                              {isGrammarDone ? (
                                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/30">✓ Đã xong</span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Chưa xong</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate" title={item.grammarTitlesList?.join(' • ') || item.grammarScope}>
                              {item.grammarTitlesList && item.grammarTitlesList.length > 0 
                                ? item.grammarTitlesList.slice(0, 2).join(' • ') + (item.grammarTitlesList.length > 2 ? ` (+${item.grammarTitlesList.length - 2})` : '')
                                : item.grammarScope || 'Toàn bộ mẫu ngữ pháp bài'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                // 2 Lessons View (Rollover Split Day)
                <div className="space-y-2 pt-0.5 max-h-[195px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                  {lessonsToday.map((item: any, idx: number) => {
                    const lessonVocabDone = todayTasks.some((t: any) => t.lesson === item.lesson && t.itemType === 'vocabulary') && todayTasks.filter((t: any) => t.lesson === item.lesson && t.itemType === 'vocabulary').every((t: any) => t.completed);
                    const lessonKanjiDone = todayTasks.some((t: any) => t.lesson === item.lesson && t.itemType === 'kanji') && todayTasks.filter((t: any) => t.lesson === item.lesson && t.itemType === 'kanji').every((t: any) => t.completed);
                    const lessonGrammarDone = todayTasks.some((t: any) => t.lesson === item.lesson && t.itemType === 'grammar') && todayTasks.filter((t: any) => t.lesson === item.lesson && t.itemType === 'grammar').every((t: any) => t.completed);

                    return (
                      <div key={item.lesson || idx} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="text-indigo-400 font-black">#{idx + 1}</span> Bài {item.lesson}
                          </span>
                          {item.isPracticeDay ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              🛡️ Thực hành
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              🎯 Học mới
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className={`p-1.5 rounded-lg border transition-all ${lessonVocabDone ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-slate-900/90 border-slate-800'}`}>
                            <span className="text-slate-400 block text-[9px]">{lessonVocabDone ? '✓ Từ vựng' : 'Từ vựng'}</span>
                            <span className={`font-extrabold text-xs ${lessonVocabDone ? 'text-emerald-300' : 'text-cyan-400'}`}>{item.vocabCount}</span>
                          </div>
                          <div className={`p-1.5 rounded-lg border transition-all ${lessonKanjiDone ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-slate-900/90 border-slate-800'}`}>
                            <span className="text-slate-400 block text-[9px]">{lessonKanjiDone ? '✓ Kanji' : 'Kanji'}</span>
                            <span className={`font-extrabold text-xs ${lessonKanjiDone ? 'text-emerald-300' : 'text-amber-400'}`}>{item.kanjiCount}</span>
                          </div>
                          <div className={`p-1.5 rounded-lg border transition-all ${lessonGrammarDone ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-slate-900/90 border-slate-800'}`}>
                            <span className="text-slate-400 block text-[9px]">{lessonGrammarDone ? '✓ Ngữ pháp' : 'Ngữ pháp'}</span>
                            <span className={`font-extrabold text-xs ${lessonGrammarDone ? 'text-emerald-300' : 'text-purple-400'}`}>{item.grammarCount}</span>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-400 truncate" title={item.kanjiChars || item.vocabScope}>
                          {item.kanjiChars ? `Kanji: ${item.kanjiChars}` : item.vocabScope}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsVisualRoadmapOpen(true)}
              className="w-full pt-1.5 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors text-right block border-t border-slate-800/80 cursor-pointer"
            >
              Xem sơ đồ & tiến độ tổng quan ➔
            </button>
          </div>
        </div>

        {/* 2. TODAY'S MISSIONS (ALWAYS OPEN - LUÔN MỞ) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🎯</span> Nhiệm Vụ Hôm Nay ({todayStr})
                </h2>
                {todayTotalEstMinutes > 0 && (
                  <span className="text-xs font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <span>⏱️</span>
                    <span>Ước tính: {formatEstimatedTime(todayTotalEstMinutes)}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Tuân thủ dứt điểm: <strong className="text-slate-200">Từ vựng ➔ Kanji ➔ Ngữ pháp ➔ Ôn tập bài (30p) ➔ Ôn tập tích lũy (30p)</strong>. Tự động ghi nhận theo trạng thái học.
              </p>
            </div>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              {todayTasks.filter((t: any) => t.completed).length} / {todayTasks.length} việc hoàn thành
            </span>
          </div>

          {todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.map((task: any) => {
                const isDone = !!task.completed;
                const isReviewTask = task.itemType === 'single_review' || task.itemType === 'cumulative_review';
                const inProgress = !isDone && task.currentCount > 0;

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isDone
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100 shadow-md shadow-emerald-950/30'
                        : inProgress
                        ? 'bg-amber-950/25 border-amber-500/40 text-amber-100'
                        : isReviewTask
                        ? 'bg-gradient-to-r from-slate-950 to-indigo-950/30 border-indigo-500/40 text-white'
                        : 'bg-slate-950/80 border-slate-800 text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="text-xl mt-0.5">{getTaskIcon(task.itemType)}</span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${getTaskBadgeStyle(task.itemType)}`}>
                            {getTaskTypeName(task.itemType)}
                          </span>
                          {task.estimatedMinutes && (
                            <span className={`text-xs font-semibold ${isDone ? 'text-emerald-300' : inProgress ? 'text-amber-300' : 'text-slate-400'}`}>
                              ~{task.estimatedMinutes >= 60 ? `${Math.floor(task.estimatedMinutes / 60)}h${task.estimatedMinutes % 60 > 0 ? `${task.estimatedMinutes % 60}p` : ''}` : `${task.estimatedMinutes} phút`}
                            </span>
                          )}
                          {isReviewTask && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                              🛡️ Bài mới đã giảm tải tương ứng
                            </span>
                          )}
                        </div>

                        <div className={`text-sm font-semibold mt-1.5 ${isDone ? 'line-through text-emerald-200/80' : 'text-white'}`}>
                          {task.title}
                        </div>

                        {/* Granular Scope Details */}
                        {task.scopeDetails && (
                          <div className={`mt-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border max-w-2xl leading-relaxed ${
                            isDone 
                              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-200/90' 
                              : 'bg-slate-900/90 border-indigo-500/25 text-indigo-300'
                          }`}>
                            <span className="font-bold mr-1">{isDone ? '✓ Chi tiết phạm vi:' : '🔍 Chi tiết phạm vi:'}</span>
                            <span>{task.scopeDetails}</span>
                          </div>
                        )}

                        {/* Live Auto-Tracking Progress Badge */}
                        <div className="flex items-center gap-3 text-xs mt-1.5">
                          {isDone ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-sm">
                              ✓ ĐÃ HOÀN THÀNH (Tự động ghi nhận)
                            </span>
                          ) : inProgress ? (
                            <span className="inline-flex items-center gap-1.5 text-amber-300 font-semibold bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                              Đang học: {task.currentCount} / {task.targetCount} ({task.progressPct || 0}%)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-slate-400 bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-slate-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                              Mục tiêu: {task.targetCount} mục • Chưa hoàn thành
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div
                        onClick={(e) => {
                          const input = (e.currentTarget as HTMLElement).querySelector('input');
                          if (input) {
                            try { (input as any).showPicker?.(); } catch {}
                          }
                        }}
                        className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                        title="Click để chọn giờ hẹn deadline"
                      >
                        <span className="text-xs text-slate-400 select-none">⏰ Hẹn xong:</span>
                        <input
                          type="time"
                          value={task.due_time || '10:00'}
                          onClick={(e) => {
                            e.stopPropagation();
                            try { (e.currentTarget as any).showPicker?.(); } catch {}
                          }}
                          onChange={(e) => handleUpdateTaskDueTime(task.id, e.target.value, todayStr)}
                          className="bg-transparent text-xs font-bold text-amber-300 focus:outline-none cursor-pointer"
                        />
                      </div>

                      <Link
                        href={task.link || `/lessons/${task.lesson || selectedLessonId}?tab=vocab`}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95 border ${
                          isReviewTask
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-indigo-400/40 shadow-md'
                            : 'bg-indigo-600/30 hover:bg-indigo-600/50 border-indigo-500/40 text-indigo-200'
                        }`}
                      >
                        {isDone ? 'Ôn lại ➔' : 'Vào học ngay ➔'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 space-y-2">
              <span className="text-3xl">🎉</span>
              <p className="text-sm text-slate-300 font-semibold">Chưa có nhiệm vụ cụ thể cho hôm nay.</p>
              <p className="text-xs text-slate-400">Bấm mục "Khung Thời Gian Mục Tiêu" ở dưới và chọn "Tạo lại plan theo mốc này" để AI tạo danh sách bài học nhé!</p>
            </div>
          )}

          {/* ACCORDION: MỤC TIÊU & NHIỆM VỤ NGÀY MAI (ĐÓNG/MỞ TRỰC TIẾP - KHÔNG POPUP) */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="rounded-xl border border-indigo-500/30 bg-slate-950/60 overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setIsTomorrowOpen(!isTomorrowOpen)}
                className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📅</span>
                  <div>
                    <div className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
                      <span>Mục Tiêu & Nhiệm Vụ Ngày Mai ({tomorrowFormatted})</span>
                      {tomorrowDay?.isPracticeDay ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          🛡️ Ngày thực hành chuyên biệt
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {tomorrowTasks.length} nhiệm vụ sắp tới
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {tomorrowDay?.isPracticeDay 
                        ? 'Dành trọn vẹn 1 ngày cho bài tập tổng hợp và ôn tập tích lũy, không nhồi kiến thức mới.'
                        : 'Chuẩn bị trước tinh thần và khối lượng bài học cho ngày mai.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 px-3 py-1.5 rounded-xl border border-indigo-500/30 transition-all">
                  <span>{isTomorrowOpen ? 'Thu gọn' : 'Xổ ra xem chi tiết'}</span>
                  <span>{isTomorrowOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {isTomorrowOpen && (
                <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 space-y-3 animate-in fade-in duration-200">
                  {/* Rationale: Định hướng & Cơ sở lộ trình ngày mai */}
                  {tomorrowDayPlan?.dayRationale && (
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/20 text-xs text-slate-300 space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                          <span>📐</span> Định hướng & Cơ sở lộ trình ngày mai
                        </span>
                        {tomorrowDayPlan.workloadPoints !== undefined && tomorrowDayPlan.workloadPoints > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 font-bold border border-cyan-500/30 text-[11px]">
                            Tải trọng: {tomorrowDayPlan.workloadPoints} điểm tải (WP)
                          </span>
                        )}
                      </div>
                      <p className="leading-relaxed text-slate-300">
                        {tomorrowDayPlan.dayRationale}
                      </p>
                    </div>
                  )}

                  {tomorrowTasks.length > 0 ? (
                    <div className="space-y-3">
                      {tomorrowTasks.map((task: any) => {
                        const isReviewTask = task.itemType === 'single_review' || task.itemType === 'cumulative_review' || task.type === 'practice';
                        return (
                          <div
                            key={task.id}
                            className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isReviewTask
                                ? 'bg-gradient-to-r from-slate-950 to-indigo-950/30 border-indigo-500/40 text-white'
                                : 'bg-slate-950/80 border-slate-800 text-white'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-xl mt-0.5">{getTaskIcon(task.itemType || task.type)}</span>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${getTaskBadgeStyle(task.itemType || task.type)}`}>
                                    {getTaskTypeName(task.itemType || task.type)}
                                  </span>
                                  {task.estimatedMinutes && (
                                    <span className="text-xs text-slate-400">~{task.estimatedMinutes} phút</span>
                                  )}
                                  {isReviewTask && (
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                                      🛡️ Bài tập củng cố
                                    </span>
                                  )}
                                </div>

                                <div className="text-sm font-semibold mt-1.5 text-white">
                                  {task.title}
                                </div>

                                {task.scopeDetails && (
                                  <div className="mt-1.5 text-xs text-indigo-300 font-medium bg-slate-900/90 px-3 py-1.5 rounded-lg border border-indigo-500/25 max-w-2xl leading-relaxed">
                                    <span className="text-indigo-400 font-bold mr-1">🔍 Chi tiết phạm vi:</span>
                                    <span>{task.scopeDetails}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-center">
                              <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-amber-300 font-bold">
                                <span className="text-slate-400 font-normal">⏰ Giờ dự kiến:</span>
                                <span>{task.due_time || '10:00'}</span>
                              </div>

                              <Link
                                href={task.link || `/lessons/${task.lesson || selectedLessonId}?tab=vocab`}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 transition-all hover:scale-105 active:scale-95"
                              >
                                Xem trước ➔
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
                      Chưa có danh sách nhiệm vụ cụ thể cho ngày mai. Bạn có thể bấm "Tạo lại plan theo mốc này" để AI cập nhật!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>


        {/* 4. COLLAPSIBLE: TINH CHỈNH KẾ HOẠCH VỚI AI */}
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/80 overflow-hidden transition-all shadow-xl">
          <button
            type="button"
            onClick={() => setIsRefinementOpen(!isRefinementOpen)}
            className="w-full p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">✨</span>
              <div>
                <div className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
                  <span>Tinh Chỉnh Kế Hoạch Với AI (Giữ Chặt Deadline & Thứ Tự Tuần Tự)</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    🔒 Khóa Ngày Kết Thúc
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tái phân bổ khi bận việc đột xuất, mệt, hoặc muốn dồn bài mà không làm thay đổi hạn chót ({endDateStr}).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 px-3 py-1.5 rounded-xl border border-indigo-500/30 transition-all self-end sm:self-center">
              <span>{isRefinementOpen ? 'Thu gọn' : 'Nhập yêu cầu điều chỉnh'}</span>
              <span>{isRefinementOpen ? '▲' : '▼'}</span>
            </div>
          </button>

          {isRefinementOpen && (
            <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-950/60 space-y-3 animate-in fade-in duration-200">
              <p className="text-xs text-slate-300">
                Nếu bạn bận đột xuất, mệt, hoặc muốn dồn bài, hãy comment mong muốn. AI sẽ tự động tái phân bổ vào ngày đệm hoặc các ngày tới, đảm bảo giữ nguyên mốc ngày kết thúc ({endDateStr}) và giữ đúng thứ tự dứt điểm từng mảng.
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <input
                  type="text"
                  value={refinementComment}
                  onChange={(e) => setRefinementComment(e.target.value)}
                  placeholder="💬 Nhập lý do (vd: hôm nay bận giảm bài, muốn hoàn thành sớm 5 ngày...)"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRefinePlan();
                  }}
                />
                <button
                  onClick={handleRefinePlan}
                  disabled={isRefining}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isRefining ? 'AI đang tính toán...' : 'Cập nhật kế hoạch ➔'}
                </button>
              </div>

              {aiNote && (
                <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-xs text-indigo-200 flex items-start gap-2.5 mt-2">
                  <span className="text-base">🤖</span>
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">Lời nhắn từ AI Cố Vấn:</span>
                    <p className="leading-relaxed">{aiNote}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. COLLAPSIBLE: BẢNG LỊCH SỬ TỪNG NGÀY */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden transition-all shadow-xl">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="w-full p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📋</span>
              <div>
                <div className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
                  <span>Bảng Lịch Sử & Đánh Giá Tiến Độ Từng Ngày</span>
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    {dailyHistory.length} ngày trong kế hoạch
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tra cứu tiến độ, tỷ lệ hoàn thành và tốc độ học của từng ngày trong quá khứ.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition-all self-end sm:self-center">
              <span>{isHistoryOpen ? 'Thu gọn' : 'Xem chi tiết lịch sử'}</span>
              <span>{isHistoryOpen ? '▲' : '▼'}</span>
            </div>
          </button>

          {isHistoryOpen && (
            <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-950/60 space-y-4 animate-in fade-in duration-200">
              {dailyHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Ngày</th>
                        <th className="py-3 px-4">Mục tiêu</th>
                        <th className="py-3 px-4">Đã xong</th>
                        <th className="py-3 px-4">Tốc độ (Pace)</th>
                        <th className="py-3 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {dailyHistory.slice(0, 15).map((day) => {
                        const isToday = day.date === todayStr;
                        return (
                          <tr
                            key={day.date}
                            className={`hover:bg-slate-800/40 transition-colors ${
                              isToday ? 'bg-indigo-950/20 font-semibold' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-bold">{day.date}</span>
                                {isToday && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    Hôm nay
                                  </span>
                                )}
                                {day.isBufferDay && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                    Buffer
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">
                              {day.planned_count} nhiệm vụ
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={day.completed_count >= day.planned_count && day.planned_count > 0 ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                                {day.completed_count} / {day.planned_count} ({day.completion_rate}%)
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                day.pace_status === 'ahead'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : day.pace_status === 'behind'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              }`}>
                                {day.pace_label}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => setSelectedHistoryDay(day)}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95 border border-slate-700 cursor-pointer"
                              >
                                Chi tiết 🔍
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {dailyHistory.length > 15 && (
                    <div className="p-3 text-center text-xs text-slate-500 border-t border-slate-800">
                      Hiển thị 15 ngày gần nhất trong toàn bộ lộ trình {dailyHistory.length} ngày.
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-950/30 rounded-xl border border-slate-800">
                  Chưa có lịch sử học tập. Hãy bắt đầu hoàn thành các bài học hôm nay nhé!
                </div>
              )}
            </div>
          )}
        </div>

        {/* 6. COLLAPSIBLE: CÀI ĐẶT THÔNG BÁO IPHONE (WEB PUSH) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden transition-all shadow-xl">
          <button
            type="button"
            onClick={() => setIsPushSettingsOpen(!isPushSettingsOpen)}
            className="w-full p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🔔</span>
              <div>
                <div className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
                  <span>Thông Báo Đẩy Nhắc Bài Về iPhone (iOS 16.4+) / Web Push</span>
                  {isPushSubscribed ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✓ Đã kết nối iPhone
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Chưa bật
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nhận chuông và banner nhắc nhở ngay trên màn hình khóa iPhone đúng theo các mốc giờ deadline.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition-all self-end sm:self-center">
              <span>{isPushSettingsOpen ? 'Thu gọn' : 'Cài đặt chuông báo'}</span>
              <span>{isPushSettingsOpen ? '▲' : '▼'}</span>
            </div>
          </button>

          {isPushSettingsOpen && (
            <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-950/60 space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-slate-300">
                  Kích hoạt dịch vụ thông báo nền Web Push để nhận thông báo đúng giờ học trên iPhone.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  {isPushSubscribed ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Đã kết nối iPhone
                    </span>
                  ) : (
                    <button
                      onClick={handleEnablePush}
                      disabled={pushLoading}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {pushLoading ? 'Đang kết nối...' : 'Bật thông báo iPhone 🔔'}
                    </button>
                  )}

                  <button
                    onClick={handleSendTestPush}
                    disabled={pushLoading}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>📲</span>
                    <span>Gửi thử chuông ngay</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                <span className="font-bold text-slate-300 block">
                  💡 Hướng dẫn nhận thông báo như App trên iPhone (chỉ mất 15 giây):
                </span>
                <ol className="list-decimal list-inside text-slate-400 space-y-1 leading-relaxed">
                  <li>Mở Safari trên iPhone ➔ Bấm nút Chia sẻ (biểu tượng hình vuông có mũi tên <span className="text-white font-bold">⎋</span> ở dưới cùng).</li>
                  <li>Chọn <span className="text-white font-bold">"Thêm vào Màn hình chính" (Add to Home Screen ⊕)</span>.</li>
                  <li>Mở web từ biểu tượng ngoài màn hình chính ➔ Bấm nút <span className="text-indigo-400 font-bold">"Bật thông báo iPhone"</span> ở trên và chọn <span className="text-emerald-400 font-bold">Cho phép (Allow)</span>.</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Unfinished Debt Modal (Alerts on yesterday's unfinished items, auto-dismisses when caught up) */}
      <UnfinishedDebtModal
        isOpen={isDebtModalOpen}
        onClose={() => setIsDebtModalOpen(false)}
        yesterdayDate={debtData?.yesterdayDate || null}
        debtItems={debtData?.debtItems || []}
        onReplan={handleReplanDebt}
        onCatchUpToday={() => setIsDebtModalOpen(false)}
        isReplanning={isReplanningDebt}
      />

      {/* Visual Roadmap Modal */}
      <VisualRoadmapModal
        isOpen={isVisualRoadmapOpen}
        onClose={() => setIsVisualRoadmapOpen(false)}
        startDate={startDateStr}
        endDate={endDateStr}
        currentLesson={studyOverview?.current_position?.lesson || selectedLessonId}
        overview={studyOverview?.overview}
        pace={studyOverview?.pace}
        milestones={studyOverview?.milestones}
        studyPlan={studyPlan}
        initialTab={roadmapInitialTab}
      />

      {/* Daily Detail Modal */}
      <DayDetailModal
        isOpen={!!selectedHistoryDay}
        onClose={() => setSelectedHistoryDay(null)}
        dayData={selectedHistoryDay}
      />

      {/* Daily Report Modal */}
      <DailyReportModal
        isOpen={isDailyReportOpen}
        onClose={() => setIsDailyReportOpen(false)}
        userName={user?.display_name || 'Học viên'}
        lessonTitle={`Bài ${selectedLessonId}`}
        lessonId={selectedLessonId}
        vocabTotal={studyOverview?.overview?.totalVocab || 40}
        vocabMastered={studyOverview?.overview?.masteredVocab || 0}
        kanjiTotal={studyOverview?.overview?.totalKanji || 11}
        kanjiMastered={studyOverview?.overview?.masteredKanji || 0}
        grammarTotal={studyOverview?.overview?.totalGrammar || 5}
        grammarMastered={studyOverview?.overview?.masteredGrammar || 0}
        startDateStr={startDateStr}
        endDateStr={endDateStr}
        totalDays={studyOverview?.pace?.totalDays || 30}
        daysElapsed={studyOverview?.pace?.daysElapsed || 1}
        daysRemaining={studyOverview?.pace?.daysRemaining || 29}
        targetVocabToday={10}
        vocabBehind={0}
        calculatedVocabTargetPerDay={5}
        onContinueStudy={() => {
          setIsDailyReportOpen(false);
          router.push(`/lessons/${selectedLessonId}`);
        }}
      />
    </div>
  );
}
