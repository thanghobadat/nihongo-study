'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '../utils/api';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = () => {
    setLoading(true);
    const token = api.getToken();
    const user = api.getUser();
    
    const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));
    
    // Default root path '/' redirects
    if (pathname === '/') {
      if (token && user) {
        const dest = user.role === 'admin' ? '/admin' : '/dashboard';
        router.replace(dest);
      } else {
        router.replace('/login');
      }
      return;
    }

    if (!token || !user) {
      if (!isPublicPath) {
        // Not logged in, accessing protected path -> redirect to login
        setAuthorized(false);
        router.replace('/login');
      } else {
        // Not logged in, public path -> allowed
        setAuthorized(true);
        setLoading(false);
      }
    } else {
      // Logged in
      if (isPublicPath) {
        // Logged in, trying to access login/register/etc -> redirect to dashboard
        const dest = user.role === 'admin' ? '/admin' : '/dashboard';
        router.replace(dest);
      } else {
        // Logged in, protected path -> check admin restriction
        if (pathname.startsWith('/admin') && user.role !== 'admin') {
          // Normal user trying to access admin -> redirect to student dashboard
          setAuthorized(false);
          router.replace('/dashboard');
        } else {
          // Correct permissions -> allowed
          setAuthorized(true);
          setLoading(false);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-screen bg-[#0d1b2a] text-slate-200">
        <div className="w-12 h-12 border-4 border-[#1F4E78] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium tracking-wide">Đang tải...</p>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
