'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../utils/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Extract access_token from URL hash (standard Supabase redirect format)
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const token = params.get('access_token');
      if (token) {
        setAccessToken(token);
      } else {
        setError('Liên kết khôi phục mật khẩu không khả dụng hoặc đã hết hạn.');
      }
    } else {
      // Fallback to query parameters just in case
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token') || params.get('access_token');
      if (token) {
        setAccessToken(token);
      } else {
        setError('Không tìm thấy mã xác thực. Vui lòng truy cập lại liên kết từ email của bạn.');
      }
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ mật khẩu mới.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải tối thiểu 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!accessToken) {
      setError('Mã xác thực không hợp lệ. Vui lòng gửi lại yêu cầu quên mật khẩu.');
      return;
    }

    setLoading(true);

    try {
      // Call backend to update password using the parsed accessToken in header
      await api.post('/api/auth/reset-password', {
        password
      }, {
        token: accessToken // Send this token explicitly as Bearer
      });

      setSuccess('Mật khẩu đã được cập nhật thành công! Đang chuyển hướng về trang Đăng nhập...');
      setPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        router.replace('/login');
      }, 3000);
    } catch (err: any) {
      console.warn('Reset password failure:', err);
      setError(err.message || 'Cập nhật mật khẩu thất bại. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 min-h-screen bg-[#0d1b2a] font-sans">
      {/* Left Side: Visual Illustration Panel (Hidden on Mobile) */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-tr from-[#0f172a] via-[#1E293B] to-[#1F4E78] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-wider text-slate-800 dark:text-slate-100 uppercase">Minna Nihongo</span>
        </div>
        
        {/* Japanese Themed SVG Artwork */}
        <div className="flex items-center justify-center flex-1 my-8">
          <svg className="w-4/5 max-h-[360px] drop-shadow-[0_0_25px_rgba(59,130,246,0.35)]" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M70 240L200 60L330 240H70Z" fill="url(#fujiGrad)" opacity="0.85"/>
            <path d="M165 110L200 60L235 110H165Z" fill="#F8FAFC" />
            <circle cx="200" cy="150" r="45" fill="url(#sunGrad)" opacity="0.9" style={{ mixBlendMode: 'screen' }} />
            <g stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
              <path d="M150 180C170 176 230 176 250 180" />
              <path d="M140 172C170 166 230 166 260 172" />
              <line x1="160" y1="195" x2="240" y2="195" />
              <line x1="175" y1="180" x2="175" y2="240" />
              <line x1="225" y1="180" x2="225" y2="240" />
              <rect x="194" y="180" width="12" height="15" fill="#1F4E78" />
            </g>
            <line x1="50" y1="240" x2="350" y2="240" stroke="#E2E8F0" strokeWidth="2.5" strokeDasharray="6 6" opacity="0.6"/>
            
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

        <div className="text-slate-600 dark:text-slate-300">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Thiết lập mật khẩu an toàn mới</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400 dark:text-slate-500">
            Hãy lựa chọn mật khẩu mới có chứa chữ hoa, số và ký hiệu đặc biệt để bảo vệ tài khoản tốt nhất.
          </p>
        </div>
      </div>

      {/* Right Side: Reset Password Form */}
      <div className="flex flex-col items-center justify-center w-full px-6 py-12 lg:w-1/2 bg-slate-50 dark:bg-slate-950/60">
        <div className="flex items-center gap-3 mb-10 lg:hidden">
          <span className="text-xl font-bold tracking-wider text-slate-800 dark:text-slate-100 uppercase">Minna Nihongo</span>
        </div>

        <div className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-2xl">
          <div className="mb-6 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Đặt lại mật khẩu</h1>
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">Nhập mật khẩu mới cho tài khoản của bạn</p>
          </div>

          {error && (
            <div className="p-4 mb-5 text-sm text-rose-200 bg-rose-950/40 border border-rose-800/60 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="p-4 mb-5 text-sm text-emerald-200 bg-emerald-950/40 border border-emerald-800/60 rounded-xl">
              🎉 {success}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">Mật khẩu mới</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập mật khẩu mới..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1F4E78] focus:border-transparent transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 transition-colors"
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
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">🛡️</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập lại mật khẩu mới..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1F4E78] focus:border-transparent transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? (
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
            </div>

            <button
              type="submit"
              disabled={loading || !accessToken}
              className="w-full py-4 bg-[#1F4E78] text-slate-900 dark:text-white font-semibold rounded-xl hover:bg-[#2c6596] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 shadow-[0_4px_20px_rgba(31,78,120,0.35)]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                'Cập nhật mật khẩu'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/login" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-600 dark:text-blue-400 transition-colors">
              Quay lại Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
