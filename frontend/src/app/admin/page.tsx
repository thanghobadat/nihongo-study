'use client';

import { useRouter } from 'next/navigation';
import { api } from '../utils/api';

export default function AdminDashboard() {
  const router = useRouter();
  const user = api.getUser();

  const handleLogout = () => {
    api.clearAuth();
    router.replace('/login');
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950/60 text-slate-800 dark:text-slate-100 font-sans p-6">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-2xl text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-[#b5179e]">Quản trị viên (Admin)</h1>
        <p className="text-slate-400 dark:text-slate-500 mb-8">Trang quản trị chính thức của Minna Nihongo</p>

        <div className="p-6 mb-8 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-left space-y-4">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Họ tên quản trị</span>
            <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Admin'}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Địa chỉ Email</span>
            <span className="text-sm text-slate-400 dark:text-slate-500 break-all">{user?.email}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Vai trò hệ thống</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-900/30 text-rose-400 border border-rose-800/50">
              ⚙️ Quản trị viên
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3.5 bg-slate-100 hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white dark:text-white font-semibold rounded-xl active:scale-[0.99] transition-all duration-200"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
