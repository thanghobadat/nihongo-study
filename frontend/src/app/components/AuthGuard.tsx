'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, getBaseUrl } from '../utils/api';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];
const CORE_PREFETCH_ROUTES = ['/dashboard', '/roadmap', '/knowledge', '/fundamentals', '/lessons/1'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);
  const hasPrefetchedRoutes = useRef(false);

  // Background wake-up ping for sleeping Render Free tier instances
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        fetch(`${getBaseUrl()}/api/health`, { method: 'GET' }).catch(() => {});
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const scheduleCorePrefetch = () => {
    if (hasPrefetchedRoutes.current || typeof window === 'undefined') return;
    hasPrefetchedRoutes.current = true;
    const runPrefetch = () => {
      for (const route of CORE_PREFETCH_ROUTES) {
        try {
          router.prefetch(route);
        } catch (_) {}
      }
    };
    if (typeof (window as any).requestIdleCallback === 'function') {
      (window as any).requestIdleCallback(runPrefetch, { timeout: 1500 });
    } else {
      setTimeout(runPrefetch, 400);
    }
  };

  const checkAuth = () => {
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
        setInitialChecking(false);
        router.replace('/login');
      } else {
        // Not logged in, public path -> allowed
        setAuthorized(true);
        setInitialChecking(false);
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
          setInitialChecking(false);
          router.replace('/dashboard');
        } else {
          // Correct permissions -> allowed without re-blocking already-mounted transitions!
          setAuthorized(true);
          setInitialChecking(false);
          if (user.role !== 'admin') {
            scheduleCorePrefetch();
          }
        }
      }
    }
  };

  if (initialChecking) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-screen bg-slate-50 dark:bg-[#0d1b2a] text-slate-800 dark:text-slate-200">
        <div className="w-12 h-12 border-4 border-[#1F4E78] dark:border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium tracking-wide">Đang tải...</p>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
