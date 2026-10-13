'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '../utils/api';
import StudyTimeBadge from './StudyTimeBadge';

/**
 * Global Floating Study Time Widget
 * Hiển thị cố định tại góc dưới bên phải màn hình (fixed bottom-5 right-5 z-40)
 * Bấm vào mở ngay popup Thời gian học hôm nay & Bảng thống kê các ngày trước
 */
export default function GlobalStudyTimeWidget() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = api.getUser();
    setIsLoggedIn(!!(user && user.id));
  }, [pathname]);

  if (!mounted) return null;

  // Ẩn trên các trang đăng nhập / đăng ký / khôi phục mật khẩu
  const isAuthPage = 
    pathname?.startsWith('/login') || 
    pathname?.startsWith('/register') || 
    pathname?.startsWith('/forgot-password') || 
    pathname?.startsWith('/reset-password');

  if (isAuthPage || !isLoggedIn) return null;

  return (
    <div 
      className="fixed bottom-5 right-5 z-40 animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-auto"
      id="global-study-time-widget"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-700/80 hover:shadow-2xl transition-all hover:scale-105 active:scale-95">
        <StudyTimeBadge 
          className="!px-3 !py-2 !text-xs !bg-transparent !border-0 !shadow-none hover:!bg-slate-100/70 dark:hover:!bg-slate-800/70"
        />
      </div>
    </div>
  );
}
