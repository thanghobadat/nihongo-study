'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../utils/api';
import SidebarSettings from '../components/SidebarSettings';
import DailyReportModal from '../components/DailyReportModal';
import StudyTimeBadge from '../components/StudyTimeBadge';
import { formatStudyTime, getVietnamDateString, evaluateStudyTime } from '../utils/studyTimeHelper';
import VisualRoadmapModal from '../components/VisualRoadmapModal';
import DayDetailModal, { DayHistoryItem } from '../components/DayDetailModal';
import UnfinishedDebtModal, { DebtItem } from '../components/UnfinishedDebtModal';
import RebatchTasksModal, { RebatchConfig } from '../components/RebatchTasksModal';
import ReplanConfirmModal from '../components/ReplanConfirmModal';
import StudyTimeHistoryModal from '../components/StudyTimeHistoryModal';

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
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDailyReportOpen, setIsDailyReportOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);

  // Modals state
  const [isVisualRoadmapOpen, setIsVisualRoadmapOpen] = useState<boolean>(false);
  const [roadmapInitialTab, setRoadmapInitialTab] = useState<'overview' | 'master_plan'>('overview');
  const [selectedHistoryDay, setSelectedHistoryDay] = useState<DayHistoryItem | null>(null);
  const [isStudyTimeHistoryOpen, setIsStudyTimeHistoryOpen] = useState<boolean>(false);

  // Collapsible Accordion States (Auxiliary sections default collapsed; Main sections always open)
  const [isTomorrowOpen, setIsTomorrowOpen] = useState<boolean>(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(true);
  const [isPushSettingsOpen, setIsPushSettingsOpen] = useState<boolean>(false);

  // Debt Modal State
  const [debtData, setDebtData] = useState<{ hasDebt: boolean; debtItems: DebtItem[]; yesterdayDate: string | null } | null>(null);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState<boolean>(false);
  const [isReplanningDebt, setIsReplanningDebt] = useState<boolean>(false);

  // Replan Confirm Modal State (Pedagogical guard & counter)
  const [isReplanConfirmOpen, setIsReplanConfirmOpen] = useState<boolean>(false);
  const [pendingReplanType, setPendingReplanType] = useState<'debt' | 'timeline'>('debt');
  const [replanCount, setReplanCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('nihongo_replan_count') || '0', 10);
    }
    return 0;
  });

  // Rebatch Modal State
  const [isRebatchModalOpen, setIsRebatchModalOpen] = useState<boolean>(false);
  const [isRebatching, setIsRebatching] = useState<boolean>(false);
  const [rebatchTargetDate, setRebatchTargetDate] = useState<string>('');

  // Fixed Timeline state (Vietnam Timezone: Asia/Ho_Chi_Minh)
  const [startDateStr, setStartDateStr] = useState<string>(() => {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
  });
  const [endDateStr, setEndDateStr] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(d);
  });

  // Study Plan & Overview data
  const [studyPlan, setStudyPlan] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('nihongo_cached_study_plan');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return null;
  });
  const [studyOverview, setStudyOverview] = useState<any>(null);
  const [dailyHistory, setDailyHistory] = useState<DayHistoryItem[]>([]);
  const [todayStudyTimeSeconds, setTodayStudyTimeSeconds] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const today = getVietnamDateString();
      return parseInt(localStorage.getItem(`study_time_${today}`) || '0', 10);
    }
    return 0;
  });

  // Plan Generation State
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);

  // Web Push State (iOS / Mobile)
  const [isPushSupported, setIsPushSupported] = useState<boolean>(false);
  const [isPushSubscribed, setIsPushSubscribed] = useState<boolean>(false);
  const [pushLoading, setPushLoading] = useState<boolean>(false);
  const [pushDeviceInfo, setPushDeviceInfo] = useState<{ deviceName: string; updatedAt: string } | null>(null);

  const showNotification = (msg: string) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage(null);
    }, 3500);
  };

  // Check Web Push support and auto-sync subscription on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsPushSupported(true);

      // 1. Check status from server
      api.get('/api/user/push-subscription-status').then((statusRes: any) => {
        if (statusRes && statusRes.success && statusRes.hasSubscription) {
          setIsPushSubscribed(true);
          setPushDeviceInfo({
            deviceName: statusRes.deviceName || 'Thiết bị di động',
            updatedAt: statusRes.updatedAt
          });
        }
      }).catch(() => {});

      // 2. Register service worker and auto-sync PushManager subscription to backend
      navigator.serviceWorker.register('/sw.js').then(async (reg) => {
        let sub = await reg.pushManager.getSubscription();
        // If permission is already granted but browser lost subscription, auto-resubscribe silently
        if (!sub && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
            const keyRes = await api.get('/api/user/vapid-public-key');
            if (keyRes && keyRes.publicKey) {
              const convertedKey = urlBase64ToUint8Array(keyRes.publicKey);
              sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedKey
              });
            }
          } catch (subErr) {
            console.warn('[Push] Auto-resubscribe error:', subErr);
          }
        }
        if (sub) {
          setIsPushSubscribed(true);
          const deviceName = navigator.userAgent.includes('iPhone') 
            ? 'iPhone Safari (PWA)' 
            : (navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Trình duyệt Web');
          
          // Silent auto-sync token to server to keep it fresh
          api.post('/api/user/push-subscription', {
            subscription: sub,
            deviceName
          }).then((syncRes: any) => {
            if (syncRes && syncRes.success && syncRes.data) {
              setPushDeviceInfo({
                deviceName: syncRes.data.deviceName || deviceName,
                updatedAt: syncRes.data.updatedAt
              });
            }
          }).catch(() => {});
        }
      }).catch((err) => {
        console.warn('SW auto-registration error:', err);
      });
    }

    const handleSync = (e: any) => {
      if (e.detail && e.detail.seconds !== undefined) {
        setTodayStudyTimeSeconds(e.detail.seconds);
      }
    };
    window.addEventListener('study-time-sync', handleSync);
    return () => window.removeEventListener('study-time-sync', handleSync);
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
        if (overviewRes.todayStudyTime?.seconds) {
          setTodayStudyTimeSeconds(overviewRes.todayStudyTime.seconds);
        }
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
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('nihongo_cached_study_plan', JSON.stringify(planRes.plan));
          } catch (e) {}
        }
        if (planRes.plan.startDate) setStartDateStr(planRes.plan.startDate);
        if (planRes.plan.endDate) setEndDateStr(planRes.plan.endDate);
        if (typeof planRes.plan.replanCount === 'number') {
          setReplanCount(prev => Math.max(prev, planRes.plan.replanCount));
          if (typeof window !== 'undefined') {
            const cur = parseInt(localStorage.getItem('nihongo_replan_count') || '0', 10);
            if (planRes.plan.replanCount > cur) {
              localStorage.setItem('nihongo_replan_count', String(planRes.plan.replanCount));
            }
          }
        }
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

  // Check daily notifications (New Day, Pre-due, Overdue, Streak alert)
  const triggerDailyNotificationCheck = useCallback(async () => {
    try {
      const now = new Date();
      const localTimeStr = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
      const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(now);
      await api.post('/api/user/check-daily-notification', {
        date: dateStr,
        localTimeStr
      });
    } catch (e) {
      // Non-blocking background check
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    triggerDailyNotificationCheck();

    // Check periodically every 5 minutes for pre-due and overdue task notifications
    const interval = setInterval(() => {
      triggerDailyNotificationCheck();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchDashboardData, triggerDailyNotificationCheck]);

  // Trigger Replan Confirmation Modal
  const triggerReplanConfirm = (type: 'debt' | 'timeline') => {
    setPendingReplanType(type);
    setIsReplanConfirmOpen(true);
  };

  // Execute Replan after user confirmed in modal
  const handleExecuteConfirmedReplan = async () => {
    setIsReplanConfirmOpen(false);
    const nextCount = replanCount + 1;
    setReplanCount(nextCount);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nihongo_replan_count', String(nextCount));
    }
    if (pendingReplanType === 'debt') {
      await handleReplanDebt();
    } else {
      await handleGeneratePlan();
    }
  };

  // Handle Replan Debt
  const handleReplanDebt = async () => {
    try {
      setIsReplanningDebt(true);
      const res = await api.post('/api/user/replan-debt', {});
      if (res && res.success && res.plan) {
        setStudyPlan(res.plan);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('nihongo_cached_study_plan', JSON.stringify(res.plan));
          } catch (e) {}
        }
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

  // Handle Rebatch Tasks for a day
  const handleApplyRebatch = async (configs: RebatchConfig[], targetDate?: string) => {
    const dateToUse = targetDate || rebatchTargetDate || todayStr;
    try {
      setIsRebatching(true);
      const res: any = await api.post('/api/user/daily-tasks/rebatch', {
        date: dateToUse,
        configs
      });
      if (res && res.success) {
        showNotification(`✨ Đã phân chia lại công việc ${dateToUse === todayStr ? 'hôm nay' : 'ngày mai'} thành công!`);
        setIsRebatchModalOpen(false);
        fetchDashboardData();
      } else {
        showNotification(res?.error || 'Không thể phân chia lại công việc lúc này.');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Lỗi khi phân chia lại công việc';
      showNotification(errorMsg);
    } finally {
      setIsRebatching(false);
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
        currentProgress: {},
        currentPlan: studyPlan
      });

      if (res && res.success && res.plan) {
        const nextReplanCount = replanCount + 1;
        const planWithCount = { ...res.plan, replanCount: nextReplanCount };
        setStudyPlan(planWithCount);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('nihongo_cached_study_plan', JSON.stringify(planWithCount));
          } catch (e) {}
        }
        if (res.plan.startDate) setStartDateStr(res.plan.startDate);
        if (res.plan.endDate) setEndDateStr(res.plan.endDate);
        await api.post('/api/user/study-plan', { plan: planWithCount });
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



  // Update task due time
  const handleUpdateTaskDueTime = async (taskId: string, due_time: string, date?: string) => {
    // 1. Optimistic update local studyPlan state immediately so user sees new time instantly without losing focus
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

    // 2. Also update dailyHistory immediately so any components relying on dailyHistory are immediately in sync
    setDailyHistory(prev => (prev || []).map((day: any) => {
      if (!date || day.date === date) {
        return {
          ...day,
          tasks_detail: (day.tasks_detail || []).map((t: any) => t.id === taskId ? { ...t, due_time } : t)
        };
      }
      return day;
    }));

    // 3. Persist silently to backend without triggering full-page reload
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

  // Toggle task completed status (specifically for review / practice tasks or manual marking)
  const handleToggleTaskStatus = async (taskId: string | string[], completed: boolean, date?: string) => {
    const targetDate = date || todayStr;
    const taskIdsList = Array.isArray(taskId) ? taskId : [taskId];

    // 1. Optimistic update local studyPlan state immediately (0ms delay)
    if (studyPlan && studyPlan.days) {
      const updatedDays = studyPlan.days.map((day: any) => {
        if (!date || day.date === targetDate) {
          const updatedTasks = (day.tasks || []).map((t: any) => {
            if (taskIdsList.includes(t.id)) {
              return {
                ...t,
                completed,
                completed_at: completed ? new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : undefined,
                currentCount: completed ? (t.targetCount || 1) : 0,
                progressPct: completed ? 100 : 0
              };
            }
            return t;
          });
          const completedCount = updatedTasks.filter((t: any) => t.completed).length;
          const plannedCount = day.plannedCount || updatedTasks.length;
          return {
            ...day,
            tasks: updatedTasks,
            completedCount,
            completionRate: plannedCount > 0 ? Math.round((completedCount / plannedCount) * 100) : (completedCount > 0 ? 100 : 0)
          };
        }
        return day;
      });
      setStudyPlan({ ...studyPlan, days: updatedDays });
    }

    // 2. Also optimistic update dailyHistory immediately
    setDailyHistory(prev => (prev || []).map((day: any) => {
      if (!date || day.date === targetDate) {
        const updatedTasks = (day.tasks_detail || []).map((t: any) => {
          if (taskIdsList.includes(t.id)) {
            return {
              ...t,
              completed,
              completed_at: completed ? new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : undefined,
              currentCount: completed ? (t.targetCount || 1) : 0,
              progressPct: completed ? 100 : 0
            };
          }
          return t;
        });
        const completedCount = updatedTasks.filter((t: any) => t.completed).length;
        const plannedCount = day.planned_count || updatedTasks.length;
        return {
          ...day,
          tasks_detail: updatedTasks,
          completed_count: completedCount,
          completion_rate: plannedCount > 0 ? Math.round((completedCount / plannedCount) * 100) : (completedCount > 0 ? 100 : 0)
        };
      }
      return day;
    }));

    // 3. Also optimistic update debtData immediately (0ms delay)
    if (completed) {
      setDebtData(prev => {
        if (!prev || !prev.debtItems) return prev;
        const remainingDebt = prev.debtItems.filter((item: any) => {
          if (item.taskIds && Array.isArray(item.taskIds)) {
            return !item.taskIds.some((id: string) => taskIdsList.includes(id));
          }
          return !taskIdsList.includes(item.taskId);
        });
        return {
          ...prev,
          hasDebt: remainingDebt.length > 0,
          debtItems: remainingDebt
        };
      });
    }

    // 4. Persist to backend silently
    try {
      await api.post('/api/user/daily-tasks/schedule', {
        taskId: Array.isArray(taskId) ? taskId.join(',') : taskId,
        taskIds: taskIdsList,
        completed,
        date: targetDate
      });
      showNotification(completed ? '✅ Đã hoàn thành nhiệm vụ ôn luyện!' : '🔄 Đã chuyển nhiệm vụ về Chưa hoàn thành!');
      // Silently sync debt with server to ensure accuracy
      api.get('/api/user/study-debt').then((res: any) => {
        if (res && res.success) {
          setDebtData(res);
        }
      }).catch(() => {});
    } catch (err: any) {
      showNotification('Lỗi cập nhật trạng thái nhiệm vụ: ' + err.message);
      fetchDashboardData();
    }
  };

  // Enable Web Push on iPhone / Browser (or force re-sync)
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
      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        });
      }

      const deviceName = navigator.userAgent.includes('iPhone') 
        ? 'iPhone Safari (PWA)' 
        : (navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Trình duyệt Web');

      const saveRes = await api.post('/api/user/push-subscription', {
        subscription,
        deviceName
      });

      setIsPushSubscribed(true);
      if (saveRes && saveRes.data) {
        setPushDeviceInfo({
          deviceName: saveRes.data.deviceName || deviceName,
          updatedAt: saveRes.data.updatedAt
        });
      }
      showNotification('🔔 Đã kết nối thông báo thành công! Thiết bị đã sẵn sàng nhận tin.');
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
        showNotification('📲 Đã bắn chuông thông báo thử nghiệm về điện thoại của bạn!');
      } else {
        if (res?.error && res.error.includes('Chưa tìm thấy thiết bị')) {
          setIsPushSubscribed(false);
          showNotification('⚠️ Chưa tìm thấy thiết bị trên máy chủ. Vui lòng bấm "Kết nối lại"!');
        } else {
          showNotification(res?.error || 'Chưa gửi được thông báo. Hãy bật thông báo trước.');
        }
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Chưa tìm thấy thiết bị')) {
        setIsPushSubscribed(false);
      }
      showNotification('Lỗi gửi thử chuông: ' + err.message);
    } finally {
      setPushLoading(false);
    }
  };

  // Send Study Plan Push Notification
  const handleSendStudyPlanPush = async () => {
    try {
      setPushLoading(true);
      const res = await api.post('/api/user/send-study-plan-notification', {
        tasks: todayTasks
      });
      if (res && res.success) {
        showNotification('📲 Đã gửi thông báo kế hoạch học tập hôm nay về điện thoại!');
      } else {
        if (res?.error && res.error.includes('Chưa tìm thấy thiết bị')) {
          setIsPushSubscribed(false);
          showNotification('⚠️ Chưa tìm thấy thiết bị trên máy chủ. Vui lòng bấm "Kết nối lại"!');
        } else {
          showNotification(res?.error || 'Chưa gửi được thông báo kế hoạch.');
        }
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Chưa tìm thấy thiết bị')) {
        setIsPushSubscribed(false);
      }
      showNotification('Lỗi gửi thông báo kế hoạch: ' + err.message);
    } finally {
      setPushLoading(false);
    }
  };

  // Current today's date in YYYY-MM-DD (Vietnam Timezone: Asia/Ho_Chi_Minh)
  const todayStr = (() => {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
  })();
  const todayTasks = (studyPlan?.days || []).find((d: any) => d.date === todayStr)?.tasks || [];

  // Tomorrow calculations & Tasks for Accordion (Vietnam Timezone)
  const tomorrowDateStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(d);
  })();

  const tomorrowFormatted = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit' }).format(d);
  })();

  const tomorrowDayPlan = (studyPlan?.days || []).find((d: any) => d.date === tomorrowDateStr);
  const todayDayPlan = (studyPlan?.days || []).find((d: any) => d.date === todayStr);
  const tomorrowTasks = tomorrowDayPlan?.tasks || [];

  const tomorrowDay = (() => {
    let day = dailyHistory.find(d => d.date === tomorrowDateStr);
    if (day && tomorrowDayPlan) {
      return {
        ...day,
        tasks_detail: tomorrowDayPlan.tasks || day.tasks_detail || [],
        dayRationale: tomorrowDayPlan.dayRationale || day.dayRationale,
        workloadPoints: tomorrowDayPlan.workloadPoints || day.workloadPoints
      };
    }
    if (!day && tomorrowDayPlan) {
      const planned = tomorrowDayPlan.plannedCount || (tomorrowDayPlan.tasks ? tomorrowDayPlan.tasks.length : 0);
      const completed = tomorrowDayPlan.completedCount || (tomorrowDayPlan.tasks ? tomorrowDayPlan.tasks.filter((t: any) => t.completed).length : 0);
      day = {
        date: tomorrowDayPlan.date,
        dayIndex: tomorrowDayPlan.dayIndex,
        isBufferDay: tomorrowDayPlan.isBufferDay,
        isPracticeDay: tomorrowDayPlan.isPracticeDay,
        planned_count: planned,
        completed_count: completed,
        completion_rate: planned > 0 ? Math.round((completed / planned) * 100) : 0,
        pace_status: 'scheduled',
        pace_label: tomorrowDayPlan.isPracticeDay ? 'Ngày thực hành chuyên biệt 🛡️' : 'Sắp tới 📅',
        tasks_detail: tomorrowDayPlan.tasks || [],
        dayRationale: tomorrowDayPlan.dayRationale,
        workloadPoints: tomorrowDayPlan.workloadPoints
      } as any;
    }
    return day;
  })();

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
  const totalDebtEstMinutes = (debtData?.debtItems || []).reduce((sum: number, item: any) => sum + (item.estimatedMinutes || 25), 0);

  // Status checks for knowledge sections in today's lesson(s)
  const isVocabDone = todayTasks.some((t: any) => t.itemType === 'vocabulary') && todayTasks.filter((t: any) => t.itemType === 'vocabulary').every((t: any) => t.completed);
  const isKanjiDone = todayTasks.some((t: any) => t.itemType === 'kanji') && todayTasks.filter((t: any) => t.itemType === 'kanji').every((t: any) => t.completed);
  const isGrammarDone = todayTasks.some((t: any) => t.itemType === 'grammar') && todayTasks.filter((t: any) => t.itemType === 'grammar').every((t: any) => t.completed);

  // Countdown calculations
  const calculateDaysRemaining = () => {
    const targetEnd = studyPlan?.endDate || endDateStr;
    const end = new Date(targetEnd);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
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
              Nihongo Flow
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white text-xl p-1 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <nav className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-0 select-none scrollbar-thin scrollbar-thumb-slate-800">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setIsSidebarOpen(false);
                  if (item.id === 'roadmap') router.push('/roadmap');
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
            <StudyTimeBadge onClick={() => setIsDailyReportOpen(true)} />
            <button
              onClick={() => setIsDailyReportOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-500 hover:to-pink-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all duration-200 active:scale-95 border border-purple-400/30 cursor-pointer"
              title="Báo cáo tiến độ hôm nay"
            >
              <span>📊</span>
              <span>Báo Cáo Ngày</span>
            </button>
            <button
              onClick={() => setIsStudyTimeHistoryOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition-all duration-200 active:scale-95 border border-amber-400/30 cursor-pointer"
              title="Xem bảng đánh giá thời gian học từng ngày (ngày X học Y tiếng)"
            >
              <span>⏱️</span>
              <span>Bảng Thời Gian Học</span>
            </button>
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
                  Khóa ngày kết thúc: <strong className="text-slate-200">{studyPlan?.startDate || startDateStr}</strong> ➔ <strong className="text-emerald-400">{studyPlan?.endDate || endDateStr}</strong>
                  {studyPlan && (startDateStr !== studyPlan.startDate || endDateStr !== studyPlan.endDate) && (
                    <span className="ml-2 text-amber-400 font-semibold">(Đã đổi mốc ngày - bấm Tạo lại để áp dụng)</span>
                  )}
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
                    onClick={() => triggerReplanConfirm('timeline')}
                    disabled={isGeneratingPlan}
                    className={`px-4 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer ${
                      studyPlan && (startDateStr !== studyPlan.startDate || endDateStr !== studyPlan.endDate)
                        ? 'bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 border-amber-400 text-white shadow-lg shadow-amber-500/20 animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                    }`}
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

        {/* 1.5. BÀI TẬP CÒN NỢ (NẰM TRÊN BÀI HỌC HÔM NAY VÀ DƯỚI PHẦN PLAN) */}
        {debtData?.hasDebt && debtData.debtItems && debtData.debtItems.length > 0 ? (
          <div className="p-5 sm:p-6 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/30 pb-3.5">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <span>Bài Tập Còn Nợ ({debtData.debtItems.length} nhiệm vụ)</span>
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    🚨 Chưa hoàn thành
                  </span>
                  {totalDebtEstMinutes > 0 && (
                    <span className="text-xs font-bold text-amber-200 bg-amber-950/80 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span>⏱️</span>
                      <span>Ước tính: ~{totalDebtEstMinutes} phút</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Nhiệm vụ còn tồn đọng trước hôm nay. Hãy học bù ngay hoặc nhờ AI Replan dàn trải đều vào các ngày tới (giữ nguyên hạn chót)!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => triggerReplanConfirm('debt')}
                  disabled={isReplanningDebt}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white border border-amber-400/40 shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Nhờ AI dàn trải bài nợ vào các ngày tiếp theo mà không kéo dài ngày kết thúc"
                >
                  <span>✨</span>
                  <span>{isReplanningDebt ? 'AI đang dàn trải nợ...' : 'Nhờ AI Replan (Giữ Deadline)'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {debtData.debtItems.map((item, idx) => {
                const isReviewTask = item.itemType === 'single_review' || item.itemType === 'cumulative_review';
                const getDebtDestination = () => {
                  if (item.itemType === 'vocabulary') return `/lessons/${item.lesson}?tab=vocab`;
                  if (item.itemType === 'kanji') return `/lessons/${item.lesson}?tab=kanji`;
                  if (item.itemType === 'grammar') return `/roadmap`;
                  if (item.itemType === 'single_review') return `/lessons/${item.lesson}?tab=review`;
                  if (item.itemType === 'cumulative_review') return `/knowledge?tab=review`;
                  return `/lessons/${item.lesson}`;
                };

                return (
                  <div
                    key={item.taskId || idx}
                    className="p-4 rounded-xl border border-amber-500/35 bg-slate-950/90 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md hover:border-amber-400/50 transition-all"
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="text-2xl mt-0.5">{getTaskIcon(item.itemType)}</span>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${getTaskBadgeStyle(item.itemType)}`}>
                            {getTaskTypeName(item.itemType)}
                          </span>
                          {item.date && (
                            <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                              📅 Giao ngày: {item.date}
                            </span>
                          )}
                          <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                            Thiếu {item.missingCount} {item.itemType === 'vocabulary' ? 'từ' : item.itemType === 'kanji' ? 'chữ' : item.itemType === 'grammar' ? 'mẫu' : 'lượt'}
                          </span>
                        </div>

                        <div className="text-sm font-bold text-white">
                          Bài {item.lesson}: {item.title}
                        </div>

                        {item.scopeDetails && (
                          <div className="text-xs text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 leading-relaxed max-w-xl">
                            <span className="font-semibold text-amber-300 mr-1">🔍 Chi tiết phạm vi:</span>
                            <span>{item.scopeDetails}</span>
                          </div>
                        )}

                        <div className="text-xs text-slate-400 pt-0.5">
                          Đã thuộc: <strong className="text-emerald-400">{item.completedCount}</strong> / <strong className="text-slate-200">{item.targetCount}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                      {isReviewTask && (
                        <button
                          type="button"
                          onClick={() => handleToggleTaskStatus(item.taskIds || item.taskId, true, item.date || debtData.yesterdayDate || todayStr)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-emerald-500/20 text-amber-200 hover:text-emerald-200 border border-amber-500/40 hover:border-emerald-500/40 transition-all cursor-pointer"
                          title="Bấm để đánh dấu đã ôn tập bù xong"
                        >
                          <span>✓ Đánh dấu xong</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => router.push(getDebtDestination())}
                        className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-md shadow-rose-500/20 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>🚀 Vào học bù ngay</span>
                        <span>➔</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl">🎉</span>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Bài Tập Còn Nợ</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Sạch nợ 🟢
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tuyệt vời! Bạn không có bài tập nào bị nợ đọng từ các ngày trước. Toàn bộ tiến độ đang được hoàn thành đúng hạn.
                </p>
              </div>
            </div>
            <div className="self-end sm:self-center">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                ✓ 0 bài nợ (100%)
              </span>
            </div>
          </div>
        )}

        {/* 2. TODAY'S MISSIONS (ALWAYS OPEN - LUÔN MỞ) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🎯</span> Nhiệm Vụ Hôm Nay ({todayStr})
                </h2>
                <button
                  type="button"
                  onClick={() => setIsStudyTimeHistoryOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-bold shadow-sm cursor-pointer transition-all hover:scale-105 active:scale-95"
                  title="Bấm để xem bảng đánh giá thời gian học các ngày (ngày X học Y tiếng)"
                >
                  <span>⏱️ Hôm nay:</span>
                  <span className="text-white font-extrabold">{formatStudyTime(todayStudyTimeSeconds)}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Đang đo thực tế" />
                  <span className="text-[10px] text-amber-300 ml-1 underline">Lịch sử ➔</span>
                </button>
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
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => {
                  setRebatchTargetDate(todayStr);
                  setIsRebatchModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600/30 to-cyan-600/30 hover:from-indigo-600/50 hover:to-cyan-600/50 text-indigo-200 border border-indigo-500/40 hover:border-cyan-400 transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                title="Chủ động chia nhỏ hoặc gộp các phần học trong ngày (1 batch hoặc N batches)"
              >
                <span>⚡</span>
                <span>Tùy chỉnh chia Batch</span>
              </button>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
                {todayTasks.filter((t: any) => t.completed).length} / {todayTasks.length} việc hoàn thành
              </span>
            </div>
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

                        {/* Live Auto-Tracking Progress Badge / Manual Review Status Toggle */}
                        <div className="flex flex-wrap items-center gap-2.5 text-xs mt-2">
                          {isReviewTask ? (
                            isDone ? (
                              <div className="inline-flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 text-emerald-300 font-bold bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/40 shadow-sm">
                                  <span>✓</span>
                                  <span>ĐÃ HOÀN THÀNH {task.completed_at ? `(${task.completed_at})` : ''}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleTaskStatus(task.id, false, todayStr)}
                                  className="text-[11px] font-semibold text-slate-400 hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
                                  title="Bấm để chuyển lại Chưa hoàn thành"
                                >
                                  ↺ Đặt lại chưa xong
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleTaskStatus(task.id, true, todayStr)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-200 hover:text-emerald-200 bg-amber-500/15 hover:bg-emerald-500/20 px-3 py-1 rounded-full border border-amber-500/35 hover:border-emerald-500/45 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                                title="Bấm để đánh dấu đã hoàn thành phần ôn luyện này"
                              >
                                <span className="text-amber-400">⭕</span>
                                <span>Chưa hoàn thành • <strong>Bấm đánh dấu đã xong ✓</strong></span>
                              </button>
                            )
                          ) : (
                            isDone ? (
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
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center">
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

                      {/* Quick Status Toggle Button for Review Tasks */}
                      {isReviewTask && (
                        <button
                          type="button"
                          onClick={() => handleToggleTaskStatus(task.id, !isDone, todayStr)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${
                            isDone
                              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40 hover:border-emerald-400'
                              : 'bg-amber-500/20 hover:bg-emerald-500/25 text-amber-200 hover:text-emerald-200 border-amber-500/40 hover:border-emerald-500/45'
                          }`}
                          title={isDone ? 'Bấm để đánh dấu chưa xong' : 'Bấm để đánh dấu đã hoàn thành'}
                        >
                          <span>{isDone ? '✓ Đã xong' : '⭕ Đánh dấu xong'}</span>
                        </button>
                      )}

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
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsTomorrowOpen(!isTomorrowOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsTomorrowOpen(!isTomorrowOpen);
                  }
                }}
                className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors cursor-pointer select-none"
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

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRebatchTargetDate(tomorrowDateStr);
                      setIsRebatchModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600/30 to-cyan-600/30 hover:from-indigo-600/50 hover:to-cyan-600/50 text-indigo-200 border border-indigo-500/40 hover:border-cyan-400 transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                    title="Chủ động chia nhỏ hoặc gộp các phần học cho ngày mai"
                  >
                    <span>⚡</span>
                    <span>Tùy chỉnh chia Batch</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 px-3 py-1.5 rounded-xl border border-indigo-500/30 transition-all">
                    <span>{isTomorrowOpen ? 'Thu gọn' : 'Xổ ra xem chi tiết'}</span>
                    <span>{isTomorrowOpen ? '▲' : '▼'}</span>
                  </div>
                </div>
              </div>

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
                        const isDone = !!task.completed;
                        const isReviewTask = task.itemType === 'single_review' || task.itemType === 'cumulative_review' || task.type === 'practice';
                        return (
                          <div
                            key={task.id}
                            className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isDone
                                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100 shadow-md shadow-emerald-950/30'
                                : isReviewTask
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

                                <div className={`text-sm font-semibold mt-1.5 ${isDone ? 'line-through text-emerald-200/80' : 'text-white'}`}>
                                  {task.title}
                                </div>

                                {task.scopeDetails && (
                                  <div className="mt-1.5 text-xs text-indigo-300 font-medium bg-slate-900/90 px-3 py-1.5 rounded-lg border border-indigo-500/25 max-w-2xl leading-relaxed">
                                    <span className="text-indigo-400 font-bold mr-1">🔍 Chi tiết phạm vi:</span>
                                    <span>{task.scopeDetails}</span>
                                  </div>
                                )}

                                {/* Tomorrow Review Status Toggle */}
                                {isReviewTask && (
                                  <div className="flex items-center gap-2 text-xs mt-2">
                                    {isDone ? (
                                      <div className="inline-flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 text-emerald-300 font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-sm">
                                          <span>✓</span>
                                          <span>ĐÃ HOÀN THÀNH {task.completed_at ? `(${task.completed_at})` : ''}</span>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleToggleTaskStatus(task.id, false, tomorrowDateStr)}
                                          className="text-[11px] font-semibold text-slate-400 hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
                                          title="Bấm để chuyển lại Chưa hoàn thành"
                                        >
                                          ↺ Đặt lại chưa xong
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleTaskStatus(task.id, true, tomorrowDateStr)}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-200 hover:text-emerald-200 bg-amber-500/15 hover:bg-emerald-500/20 px-3 py-1 rounded-full border border-amber-500/35 hover:border-emerald-500/45 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                                        title="Bấm để đánh dấu đã hoàn thành phần ôn luyện này trước"
                                      >
                                        <span className="text-amber-400">⭕</span>
                                        <span>Chưa hoàn thành • <strong>Bấm đánh dấu đã xong ✓</strong></span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 self-end sm:self-center">
                              <div
                                onClick={(e) => {
                                  const input = (e.currentTarget as HTMLElement).querySelector('input');
                                  if (input) {
                                    try { (input as any).showPicker?.(); } catch {}
                                  }
                                }}
                                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                                title="Click để chọn giờ hẹn deadline ngày mai"
                              >
                                <span className="text-xs text-slate-400 select-none">⏰ Hẹn xong:</span>
                                <input
                                  type="time"
                                  value={task.due_time || '10:00'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    try { (e.currentTarget as any).showPicker?.(); } catch {}
                                  }}
                                  onChange={(e) => handleUpdateTaskDueTime(task.id, e.target.value, tomorrowDateStr)}
                                  className="bg-transparent text-xs font-bold text-amber-300 focus:outline-none cursor-pointer"
                                />
                              </div>

                              {isReviewTask && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleTaskStatus(task.id, !isDone, tomorrowDateStr)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${
                                    isDone
                                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40 hover:border-emerald-400'
                                      : 'bg-amber-500/20 hover:bg-emerald-500/25 text-amber-200 hover:text-emerald-200 border-amber-500/40 hover:border-emerald-500/45'
                                  }`}
                                  title={isDone ? 'Bấm để đánh dấu chưa xong' : 'Bấm để đánh dấu đã hoàn thành'}
                                >
                                  <span>{isDone ? '✓ Đã xong' : '⭕ Đánh dấu xong'}</span>
                                </button>
                              )}

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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-300">
                  💡 Bảng hiển thị song song <strong className="text-white">tiến độ hoàn thành nhiệm vụ</strong> và <strong className="text-amber-300">thời gian học thực tế (ngày X học Y tiếng)</strong>.
                </div>
                <button
                  type="button"
                  onClick={() => setIsStudyTimeHistoryOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <span>⏱️</span>
                  <span>Mở Bảng Đánh Giá Thời Gian Học Chuyên Biệt</span>
                </button>
              </div>

              {dailyHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Ngày</th>
                        <th className="py-3 px-4">⏱️ Thời gian học</th>
                        <th className="py-3 px-4">Đánh giá nỗ lực</th>
                        <th className="py-3 px-4">Mục tiêu</th>
                        <th className="py-3 px-4">Đã xong</th>
                        <th className="py-3 px-4">Tốc độ (Pace)</th>
                        <th className="py-3 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {dailyHistory.slice(0, 15).map((day) => {
                        const isToday = day.date === todayStr;
                        const evalInfo = day.studyTimeEvaluation || evaluateStudyTime(day.studyTimeSeconds || 0);

                        return (
                          <tr
                            key={day.date}
                            className={`hover:bg-slate-800/40 transition-colors ${
                              isToday ? 'bg-indigo-950/20 font-semibold' : ''
                            }`}
                          >
                            {/* Cột 1: Ngày */}
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

                            {/* Cột 2: Thời gian học (Ngày X học Y tiếng) */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {day.studyTimeSeconds && day.studyTimeSeconds > 0 ? (
                                <div className="flex items-baseline gap-1">
                                  <span className="text-amber-300 font-black text-sm">
                                    {day.studyTimeHours !== undefined ? day.studyTimeHours : Number((day.studyTimeSeconds / 3600).toFixed(1))}
                                  </span>
                                  <span className="text-xs text-slate-300 font-bold">tiếng</span>
                                  <span className="text-[10px] text-slate-400">({day.studyTimeFormatted})</span>
                                </div>
                              ) : (
                                <span className="text-slate-500 text-xs">0.0 giờ</span>
                              )}
                            </td>

                            {/* Cột 3: Đánh giá nỗ lực */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                evalInfo.level === 'excellent'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : evalInfo.level === 'standard'
                                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                                  : evalInfo.level === 'moderate'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : evalInfo.level === 'starter'
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}>
                                <span>{evalInfo.badge}</span>
                                <span>{evalInfo.label}</span>
                              </span>
                            </td>

                            {/* Cột 4: Mục tiêu */}
                            <td className="py-3.5 px-4 text-slate-300">
                              {day.planned_count} việc
                            </td>

                            {/* Cột 5: Đã xong */}
                            <td className="py-3.5 px-4">
                              <span className={day.completed_count >= day.planned_count && day.planned_count > 0 ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                                {day.completed_count} / {day.planned_count} ({day.completion_rate}%)
                              </span>
                            </td>

                            {/* Cột 6: Tốc độ */}
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

                            {/* Cột 7: Thao tác */}
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

                <div className="flex flex-wrap items-center gap-2.5">
                  {isPushSubscribed ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        {pushDeviceInfo?.deviceName ? `Đã kết nối: ${pushDeviceInfo.deviceName}` : 'Đã kết nối iPhone'}
                      </span>
                      <button
                        onClick={handleEnablePush}
                        disabled={pushLoading}
                        title="Đồng bộ lại token thiết bị với máy chủ"
                        className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all active:scale-95 cursor-pointer"
                      >
                        🔄 Kết nối lại
                      </button>
                    </div>
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
                    onClick={handleSendStudyPlanPush}
                    disabled={pushLoading}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>📅</span>
                    <span>Gửi kế hoạch hôm nay</span>
                  </button>

                  <button
                    onClick={handleSendTestPush}
                    disabled={pushLoading}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🔔</span>
                    <span>Thử chuông</span>
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
        onReplan={() => triggerReplanConfirm('debt')}
        onCatchUpToday={() => setIsDebtModalOpen(false)}
        isReplanning={isReplanningDebt}
        onToggleTaskStatus={handleToggleTaskStatus}
      />

      {/* Replan Confirmation Modal with Counter & Pedagogical Guard */}
      <ReplanConfirmModal
        isOpen={isReplanConfirmOpen}
        onClose={() => setIsReplanConfirmOpen(false)}
        onConfirm={handleExecuteConfirmedReplan}
        isLoading={isReplanningDebt || isGeneratingPlan}
        replanType={pendingReplanType}
        replanCount={replanCount}
        targetEndDate={studyPlan?.endDate || endDateStr}
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
        studyTimeSeconds={todayStudyTimeSeconds}
        onOpenHistoryTable={() => setIsStudyTimeHistoryOpen(true)}
        onContinueStudy={() => {
          setIsDailyReportOpen(false);
          router.push(`/lessons/${selectedLessonId}`);
        }}
      />

      {/* Rebatch Tasks Modal (Custom Daily Task Batching) */}
      <RebatchTasksModal
        isOpen={isRebatchModalOpen}
        onClose={() => setIsRebatchModalOpen(false)}
        date={rebatchTargetDate || todayStr}
        dayTasks={(rebatchTargetDate || todayStr) === todayStr ? todayTasks : tomorrowTasks}
        onApplyRebatch={(configs) => handleApplyRebatch(configs, rebatchTargetDate || todayStr)}
        isRebatching={isRebatching}
      />

      {/* Study Time History Modal (Lưu trữ & Đánh giá ngày X học Y tiếng) */}
      <StudyTimeHistoryModal
        isOpen={isStudyTimeHistoryOpen}
        onClose={() => setIsStudyTimeHistoryOpen(false)}
        onContinueStudy={() => {
          setIsStudyTimeHistoryOpen(false);
          router.push(`/lessons/${selectedLessonId}`);
        }}
      />
    </div>
  );
}
