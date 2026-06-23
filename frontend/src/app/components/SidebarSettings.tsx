'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../utils/api';
import { useTheme } from './ThemeProvider';

// SVG Helper to generate consistent animal avatars matching index.js
function getAvatarSvg(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 5;
  const svgs = [
    // Panda
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#f8fafc" stroke="#334155" stroke-width="3"/><circle cx="30" cy="30" r="10" fill="#1e293b"/><circle cx="70" cy="30" r="10" fill="#1e293b"/><ellipse cx="32" cy="52" rx="7" ry="9" fill="#1e293b"/><ellipse cx="68" cy="52" rx="7" ry="9" fill="#1e293b"/><circle cx="32" cy="50" r="2" fill="#ffffff"/><circle cx="68" cy="50" r="2" fill="#ffffff"/><ellipse cx="50" cy="65" rx="5" ry="3" fill="#1e293b"/><circle cx="28" cy="58" r="4" fill="#fecdd3"/><circle cx="72" cy="58" r="4" fill="#fecdd3"/></svg>`,
    // Bear
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#d97706" stroke="#b45309" stroke-width="3"/><circle cx="25" cy="25" r="12" fill="#b45309"/><circle cx="75" cy="25" r="12" fill="#b45309"/><circle cx="25" cy="25" r="6" fill="#fef3c7"/><circle cx="75" cy="25" r="6" fill="#fef3c7"/><circle cx="35" cy="48" r="3" fill="#000000"/><circle cx="65" cy="48" r="3" fill="#000000"/><ellipse cx="50" cy="62" rx="12" ry="9" fill="#fef3c7"/><polygon points="50,58 45,54 55,54" fill="#000000"/></svg>`,
    // Cat
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#94a3b8" stroke="#64748b" stroke-width="3"/><polygon points="20,25 35,5 45,28" fill="#64748b"/><polygon points="80,25 65,5 55,28" fill="#64748b"/><polygon points="23,23 33,9 41,25" fill="#fecdd3"/><polygon points="77,23 67,9 59,25" fill="#fecdd3"/><circle cx="35" cy="50" r="3" fill="#000000"/><circle cx="65" cy="50" r="3" fill="#000000"/><polygon points="50,60 46,55 54,55" fill="#fecdd3"/><path d="M46,65 Q50,68 54,65" fill="none" stroke="#000000" stroke-width="2"/></svg>`,
    // Fox
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#ea580c" stroke="#c2410c" stroke-width="3"/><polygon points="15,25 32,5 42,30" fill="#c2410c"/><polygon points="85,25 68,5 58,30" fill="#c2410c"/><ellipse cx="30" cy="55" rx="14" ry="18" fill="#ffffff"/><ellipse cx="70" cy="55" rx="14" ry="18" fill="#ffffff"/><circle cx="32" cy="52" r="3.5" fill="#000000"/><circle cx="68" cy="52" r="3.5" fill="#000000"/><ellipse cx="50" cy="68" rx="6" ry="4" fill="#000000"/></svg>`,
    // Rabbit
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="55" r="40" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3"/><ellipse cx="35" cy="25" rx="9" ry="22" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3"/><ellipse cx="65" cy="25" rx="9" ry="22" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3"/><ellipse cx="35" cy="25" rx="5" ry="16" fill="#f1f5f9"/><ellipse cx="65" cy="25" rx="5" ry="16" fill="#f1f5f9"/><circle cx="35" cy="52" r="3" fill="#000000"/><circle cx="65" cy="52" r="3" fill="#000000"/><ellipse cx="50" cy="62" rx="4" ry="2.5" fill="#fecdd3"/><circle cx="28" cy="60" r="4" fill="#fecdd3"/><circle cx="72" cy="60" r="4" fill="#fecdd3"/></svg>`
  ];
  return svgs[index];
}

export default function SidebarSettings() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Fetch user info on client side
    setUser(api.getUser());
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    api.clearAuth();
    router.replace('/login');
  };

  return (
    <div className="relative w-full pt-4 border-t border-slate-200/60 dark:border-slate-900/80 shrink-0" ref={popoverRef}>
      {/* Popover Settings panel */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 right-0 z-50 mb-2 p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-2xl shadow-2xl animate-fade-in space-y-4">
          {/* User profile card */}
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0"
              dangerouslySetInnerHTML={{ __html: getAvatarSvg(user?.id || 'default') }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Học viên'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-900" />

          {/* Theme mode toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Giao diện tối</span>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6.5 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${
                theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-1 left-1 flex items-center justify-center w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform duration-300 text-[10px] ${
                  theme === 'dark' ? 'translate-x-5.5' : ''
                }`}
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </span>
            </button>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-900" />

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 transition-all duration-300 text-xs sm:text-sm font-semibold active:scale-[0.98] cursor-pointer"
          >
            <span>🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      )}

      {/* Settings trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-100/60 hover:bg-slate-200/60 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-200 text-sm font-bold active:scale-[0.98] cursor-pointer"
      >
        <span className="flex items-center space-x-2.5">
          <span>⚙️</span>
          <span>Cài đặt</span>
        </span>
        <span className={`text-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▲
        </span>
      </button>
    </div>
  );
}
