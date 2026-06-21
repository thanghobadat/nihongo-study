'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../utils/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [expiredMsg, setExpiredMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('expired=true')) {
      setExpiredMsg('Phiên làm việc của bạn đã hết hạn do lâu không hoạt động. Vui lòng đăng nhập lại.');
    }
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập tài khoản và mật khẩu.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      // Save auth state
      api.setToken(response.session.access_token);
      if (response.session.refresh_token) {
        api.setRefreshToken(response.session.refresh_token);
      }
      api.setUser(response.user);

      // Redirect depending on user role (metadata role)
      const role = response.user.user_metadata?.role || 'user';
      if (role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    } catch (err: any) {
      console.warn('Login failure:', err);
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 min-h-screen bg-[#0d1b2a] font-sans">
      {/* Left Side: Visual Illustration Panel (Hidden on Mobile) */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-tr from-[#0f172a] via-[#1E293B] to-[#1F4E78] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-wider text-slate-100 uppercase">Minna Nihongo</span>
        </div>
        
        {/* Japanese Themed SVG Artwork */}
        <div className="flex items-center justify-center flex-1 my-8">
          <svg className="w-4/5 max-h-[360px] drop-shadow-[0_0_25px_rgba(59,130,246,0.35)]" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Mountain Fuji Background */}
            <path d="M70 240L200 60L330 240H70Z" fill="url(#fujiGrad)" opacity="0.85"/>
            {/* Fuji Snowcap */}
            <path d="M165 110L200 60L235 110H165Z" fill="#F8FAFC" />
            {/* Neon Glow Sun */}
            <circle cx="200" cy="150" r="45" fill="url(#sunGrad)" opacity="0.9" style={{ mixBlendMode: 'screen' }} />
            {/* Torii Gate Line Art */}
            <g stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
              {/* Top Curved Beam */}
              <path d="M150 180C170 176 230 176 250 180" />
              <path d="M140 172C170 166 230 166 260 172" />
              {/* Horizontal Support Beam */}
              <line x1="160" y1="195" x2="240" y2="195" />
              {/* Pillars */}
              <line x1="175" y1="180" x2="175" y2="240" />
              <line x1="225" y1="180" x2="225" y2="240" />
              {/* Center Plaque */}
              <rect x="194" y="180" width="12" height="15" fill="#1F4E78" />
            </g>
            {/* Ground Line */}
            <line x1="50" y1="240" x2="350" y2="240" stroke="#E2E8F0" strokeWidth="2.5" strokeDasharray="6 6" opacity="0.6"/>
            {/* Decorative Sakura/Blossoms */}
            <circle cx="100" cy="120" r="4" fill="#F43F5E" className="animate-pulse" />
            <circle cx="290" cy="100" r="3" fill="#F43F5E" opacity="0.7" />
            <circle cx="310" cy="150" r="5" fill="#F43F5E" opacity="0.8" />
            
            {/* Definitions */}
            <defs>
              <linearGradient id="fujiGrad" x1="200" y1="60" x2="200" y2="240" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="sunGrad" x1="200" y1="105" x2="200" y2="195" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FF4B4B" />
                <stop offset="100%" stopColor="#E11D48" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="text-slate-300">
          <h2 className="text-2xl font-semibold text-slate-100">Bắt đầu hành trình tiếng Nhật của bạn</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Học từ vựng, chữ Hán và ngữ pháp một cách khoa học. Theo dõi lộ trình tiến độ cá nhân thông minh và đạt mục tiêu mỗi ngày.
          </p>
        </div>
      </div>

      {/* Right Side: Glassmorphism Login Form */}
      <div className="flex flex-col items-center justify-center w-full px-6 py-12 lg:w-1/2 bg-[#09111e]">
        {/* Mobile Logo Header */}
        <div className="flex items-center gap-3 mb-10 lg:hidden">
          <span className="text-xl font-bold tracking-wider text-slate-100 uppercase">Minna Nihongo</span>
        </div>

        <div className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl shadow-2xl">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Đăng nhập</h1>
            <p className="mt-2 text-sm text-slate-400">Chào mừng bạn quay trở lại lớp học!</p>
          </div>

          {expiredMsg && (
            <div className="p-4 mb-6 text-sm text-amber-200 bg-amber-950/40 border border-amber-800/60 rounded-xl">
              ⚠️ {expiredMsg}
            </div>
          )}

          {error && (
            <div className="p-4 mb-6 text-sm text-rose-200 bg-rose-950/40 border border-rose-800/60 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Tài khoản</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">👤</span>
                <input
                  type="text"
                  required
                  placeholder="Nhập email hoặc tên tài khoản..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1F4E78] focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Mật khẩu</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập mật khẩu của bạn..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1F4E78] focus:border-transparent transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815 3 3m-3-3a9.79 9.79 0 0 1-4.27 1.002c-4.756 0-8.773-3.162-10.065-7.498a9.79 9.79 0 0 1 2.378-4.305m11.486 4.305 3.65 3.65M12 18.75a6.75 6.75 0 1 1 0-13.5 6.75 6.75 0 0 1 0 13.5Z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link href="/forgot-password" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1F4E78] text-white font-semibold rounded-xl hover:bg-[#2c6596] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 shadow-[0_4px_20px_rgba(31,78,120,0.35)]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
