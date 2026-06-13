'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../utils/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Vui lòng điền địa chỉ email.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      if (response && response.mockToken) {
        setSuccess('Yêu cầu đặt lại mật khẩu thành công (Local Mock)! Đang tự động chuyển hướng...');
        setEmail('');
        setTimeout(() => {
          router.push(`/reset-password?token=${response.mockToken}`);
        }, 1500);
      } else {
        setSuccess('Yêu cầu đã được gửi! Vui lòng kiểm tra hộp thư email của bạn để đặt lại mật khẩu.');
        setEmail('');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Yêu cầu thất bại. Vui lòng thử lại sau.');
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

        <div className="text-slate-300">
          <h2 className="text-2xl font-semibold text-slate-100">Khôi phục mật khẩu tài khoản của bạn</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Minna Nihongo sử dụng công cụ mã hóa cao của Supabase để hỗ trợ bảo vệ mật khẩu và dữ liệu tiến trình học tập của bạn.
          </p>
        </div>
      </div>

      {/* Right Side: Forgot Password Form */}
      <div className="flex flex-col items-center justify-center w-full px-6 py-12 lg:w-1/2 bg-[#09111e]">
        <div className="flex items-center gap-3 mb-10 lg:hidden">
          <span className="text-xl font-bold tracking-wider text-slate-100 uppercase">Minna Nihongo</span>
        </div>

        <div className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl shadow-2xl">
          <div className="mb-6 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Quên mật khẩu</h1>
            <p className="mt-2 text-sm text-slate-400">
              Nhập email liên kết với tài khoản của bạn để nhận liên kết khôi phục.
            </p>
          </div>

          {error && (
            <div className="p-4 mb-5 text-sm text-rose-200 bg-rose-950/40 border border-rose-800/60 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="p-4 mb-5 text-sm text-emerald-200 bg-emerald-950/40 border border-emerald-800/60 rounded-xl">
              📬 {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">📧</span>
                <input
                  type="email"
                  required
                  placeholder="Nhập email đăng ký của bạn..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1F4E78] focus:border-transparent transition-all duration-200"
                />
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
                  <span>Đang gửi yêu cầu...</span>
                </div>
              ) : (
                'Gửi yêu cầu'
              )}
            </button>
          </form>

          <div className="mt-8 text-center flex justify-between items-center text-sm text-slate-400">
            <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              ← Đăng nhập
            </Link>
            <Link href="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Đăng ký tài khoản →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
