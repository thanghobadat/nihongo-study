'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HistoryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/mock-test?tab=history');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-[#09111e]">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest animate-pulse">
          Đang chuyển hướng đến lịch sử thi...
        </p>
      </div>
    </div>
  );
}
