'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../utils/api';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password strength evaluation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { text: '', color: 'bg-slate-100 w-0', textColor: 'text-slate-400 dark:text-slate-500' };
    
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (pwd.length < 6) {
      return { text: 'Quá ngắn', color: 'bg-rose-600 w-1/4', textColor: 'text-rose-500' };
    }
    if (score <= 2) {
      return { text: 'Yếu', color: 'bg-rose-500 w-2/4', textColor: 'text-rose-400' };
    }
    if (score <= 4) {
      return { text: 'Trung bình', color: 'bg-amber-500 w-3/4', textColor: 'text-amber-400' };
    }
    return { text: 'Mạnh', color: 'bg-emerald-500 w-full', textColor: 'text-emerald-600 dark:text-emerald-400' };
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !displayName || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ các thông tin.');
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

    setLoading(true);

    try {
      await api.post('/api/auth/register', {
        email,
        password,
        displayName
      });

      setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập.');
      setEmail('');
      setDisplayName('');
      setPassword('');
      setConfirmPassword('');
      
      // Auto redirect to login after 5 seconds
      setTimeout(() => {
        router.push('/login');
      }, 5000);
    } catch (err: any) {
      console.warn('Registration failure:', err);
      setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
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
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Bắt đầu hành trình tiếng Nhật của bạn</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400 dark:text-slate-500">
            Học từ vựng, chữ Hán và ngữ pháp một cách khoa học. Theo dõi lộ trình tiến độ cá nhân thông minh và đạt mục tiêu mỗi ngày.
          </p>
        </div>
      </div>

      {/* Right Side: Glassmorphism Register Form */}
      <div className="flex flex-col items-center justify-center w-full px-6 py-12 lg:w-1/2 bg-slate-50 dark:bg-slate-950/60">
        <div className="flex items-center gap-3 mb-8 lg:hidden">
          <span className="text-xl font-bold tracking-wider text-slate-800 dark:text-slate-100 uppercase">Minna Nihongo</span>
        </div>

        <div className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-white border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-2xl">
          <div className="mb-6 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Đăng ký</h1>
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">Tạo tài khoản học viên của bạn ngay hôm nay</p>
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

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">📧</span>
                <input
                  type="email"
                  required
                  placeholder="Nhập email của bạn..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1F4E78] focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Tài khoản (Tên hiển thị)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">👤</span>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên tài khoản..."
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1F4E78] focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Mật khẩu</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập mật khẩu..."
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
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-semibold tracking-wide">
                    <span className="text-slate-400 dark:text-slate-500">Độ mạnh mật khẩu:</span>
                    <span className={strength.textColor}>{strength.text}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strength.color}`} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Xác nhận mật khẩu</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">🛡️</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập lại mật khẩu..."
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
              disabled={loading}
              className="w-full py-4 mt-2 bg-[#1F4E78] text-slate-900 dark:text-white font-semibold rounded-xl hover:bg-[#2c6596] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 shadow-[0_4px_20px_rgba(31,78,120,0.35)]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang đăng ký...</span>
                </div>
              ) : (
                'Đăng ký'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Đã có tài khoản?{' '}
              <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-600 dark:text-blue-400 transition-colors">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
