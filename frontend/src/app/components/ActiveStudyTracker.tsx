'use client';

import { useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { getVietnamDateString } from '../utils/studyTimeHelper';

/**
 * Global Active Study Time Tracker
 * - Tự động đo thời gian học tích cực (Anti-Idle & Active Tab)
 * - Tạm dừng ngay khi chuyển tab hoặc không tương tác quá 60s
 * - Đồng bộ vi phân (Incremental Delta Sync) đa thiết bị lên backend
 */
export default function ActiveStudyTracker() {
  const currentDateRef = useRef<string>(getVietnamDateString());
  const totalSecondsRef = useRef<number>(0);
  const unsyncedDeltaRef = useRef<number>(0);
  const isTabVisibleRef = useRef<boolean>(true);
  const isUserActiveRef = useRef<boolean>(true);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef<boolean>(false);

  // Broadcast current time to UI components (Badges, Dashboard, Settings)
  const broadcastUpdate = (isLive: boolean) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('study-time-sync', {
        detail: {
          seconds: totalSecondsRef.current,
          date: currentDateRef.current,
          isLive
        }
      })
    );
  };

  // Push accumulated delta to server
  const flushDeltaToServer = async () => {
    const delta = unsyncedDeltaRef.current;
    if (delta <= 0 || isSyncingRef.current) return;

    const user = api.getUser();
    if (!user || !user.id) return;

    try {
      isSyncingRef.current = true;
      const res: any = await api.post('/api/user/study-time', {
        date: currentDateRef.current,
        deltaSeconds: delta
      });

      if (res && res.success && res.data) {
        unsyncedDeltaRef.current = Math.max(0, unsyncedDeltaRef.current - delta);
        if (res.data.totalSeconds && res.data.totalSeconds > totalSecondsRef.current) {
          totalSecondsRef.current = res.data.totalSeconds;
          broadcastUpdate(isTabVisibleRef.current && isUserActiveRef.current);
        }
      }
    } catch {
      // Giữ nguyên delta để lần sau thử lại
    } finally {
      isSyncingRef.current = false;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dateToday = getVietnamDateString();
    currentDateRef.current = dateToday;

    // Load initial cached time from localStorage
    try {
      const cached = localStorage.getItem(`study_time_${dateToday}`);
      if (cached) {
        totalSecondsRef.current = parseInt(cached, 10) || 0;
        broadcastUpdate(false);
      }
    } catch {}

    // Fetch authoritative initial time from server (Multi-device initial sync)
    const user = api.getUser();
    if (user && user.id) {
      api.get(`/api/user/study-time/today?date=${dateToday}`).then((res: any) => {
        if (res && res.success && res.data) {
          const serverSec = res.data.totalSeconds || 0;
          if (serverSec > totalSecondsRef.current) {
            totalSecondsRef.current = serverSec;
            try {
              localStorage.setItem(`study_time_${dateToday}`, String(serverSec));
            } catch {}
            broadcastUpdate(isTabVisibleRef.current && isUserActiveRef.current);
          }
        }
      }).catch(() => {});
    }

    // 1. Idle Detection (Threshold: 60 seconds)
    const resetIdleTimer = () => {
      if (!isUserActiveRef.current) {
        isUserActiveRef.current = true;
        broadcastUpdate(isTabVisibleRef.current);
      }
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        isUserActiveRef.current = false;
        broadcastUpdate(false);
      }, 60000); // 60s
    };

    resetIdleTimer();

    const activityEvents = ['mousemove', 'keydown', 'scroll', 'touchstart', 'pointerdown'];
    activityEvents.forEach((ev) => {
      window.addEventListener(ev, resetIdleTimer, { passive: true });
    });

    // 2. Page Visibility API
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      isTabVisibleRef.current = isVisible;
      if (!isVisible) {
        // Tab bị ẩn -> Ngay lập tức tạm dừng và flush delta lên server
        broadcastUpdate(false);
        flushDeltaToServer();
      } else {
        // Tab hiển thị lại -> Reset idle timer
        resetIdleTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Main Tick Interval: Counts every 1 second when active
    const tickInterval = setInterval(() => {
      // Check date rollover (qua ngày mới lúc 00:00 Việt Nam)
      const nowVN = getVietnamDateString();
      if (nowVN !== currentDateRef.current) {
        flushDeltaToServer();
        currentDateRef.current = nowVN;
        totalSecondsRef.current = 0;
        unsyncedDeltaRef.current = 0;
      }

      const isLive = isTabVisibleRef.current && isUserActiveRef.current;
      if (isLive) {
        totalSecondsRef.current += 1;
        unsyncedDeltaRef.current += 1;

        // Lưu tạm vào localStorage mỗi giây
        try {
          localStorage.setItem(`study_time_${currentDateRef.current}`, String(totalSecondsRef.current));
        } catch {}

        broadcastUpdate(true);
      }
    }, 1000);

    // 4. Periodic Server Sync: Every 30 seconds
    const syncInterval = setInterval(() => {
      if (unsyncedDeltaRef.current >= 5) {
        flushDeltaToServer();
      }
    }, 30000);

    // 5. Cleanup on tab unload / close
    const handleBeforeUnload = () => {
      const delta = unsyncedDeltaRef.current;
      const user = api.getUser();
      if (delta > 0 && user && user.id) {
        try {
          const token = api.getToken();
          const payload = JSON.stringify({
            date: currentDateRef.current,
            deltaSeconds: delta
          });
          const url = '/api/user/study-time';
          // Use fetch with keepalive for reliable background request on close
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: payload,
            keepalive: true
          }).catch(() => {});
        } catch {}
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      activityEvents.forEach((ev) => {
        window.removeEventListener(ev, resetIdleTimer);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      clearInterval(tickInterval);
      clearInterval(syncInterval);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      flushDeltaToServer();
    };
  }, []);

  return null; // Silent global background tracker
}
