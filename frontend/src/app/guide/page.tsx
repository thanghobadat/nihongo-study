'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../utils/api';
import CourseSwitcher from '../components/CourseSwitcher';

// Inline SVG helper to output consistent cute animal avatars
function getAvatarSvg(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 5;
  const svgs = [
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#f8fafc" stroke="#334155" stroke-width="3"/><circle cx="30" cy="30" r="10" fill="#1e293b"/><circle cx="70" cy="30" r="10" fill="#1e293b"/><ellipse cx="32" cy="52" rx="7" ry="9" fill="#1e293b"/><ellipse cx="68" cy="52" rx="7" ry="9" fill="#1e293b"/><circle cx="32" cy="50" r="2" fill="#ffffff"/><circle cx="68" cy="50" r="2" fill="#ffffff"/><ellipse cx="50" cy="65" rx="5" ry="3" fill="#1e293b"/><circle cx="28" cy="58" r="4" fill="#fecdd3"/><circle cx="72" cy="58" r="4" fill="#fecdd3"/></svg>`,
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#d97706" stroke="#b45309" stroke-width="3"/><circle cx="25" cy="25" r="12" fill="#b45309"/><circle cx="75" cy="25" r="12" fill="#b45309"/><circle cx="25" cy="25" r="6" fill="#fef3c7"/><circle cx="75" cy="25" r="6" fill="#fef3c7"/><circle cx="35" cy="48" r="3" fill="#000000"/><circle cx="65" cy="48" r="3" fill="#000000"/><ellipse cx="50" cy="62" rx="12" ry="9" fill="#fef3c7"/><polygon points="50,58 45,54 55,54" fill="#000000"/></svg>`,
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#94a3b8" stroke="#64748b" stroke-width="3"/><polygon points="20,25 35,5 45,28" fill="#64748b"/><polygon points="80,25 65,5 55,28" fill="#64748b"/><polygon points="23,23 33,9 41,25" fill="#fecdd3"/><polygon points="77,23 67,9 59,25" fill="#fecdd3"/><circle cx="35" cy="50" r="3" fill="#000000"/><circle cx="65" cy="50" r="3" fill="#000000"/><polygon points="50,60 46,55 54,55" fill="#fecdd3"/><path d="M46,65 Q50,68 54,65" fill="none" stroke="#000000" stroke-width="2"/></svg>`,
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="50" r="45" fill="#ea580c" stroke="#c2410c" stroke-width="3"/><polygon points="15,25 32,5 42,30" fill="#c2410c"/><polygon points="85,25 68,5 58,30" fill="#c2410c"/><ellipse cx="30" cy="55" rx="14" ry="18" fill="#ffffff"/><ellipse cx="70" cy="55" rx="14" ry="18" fill="#ffffff"/><circle cx="32" cy="52" r="3.5" fill="#000000"/><circle cx="68" cy="52" r="3.5" fill="#000000"/><ellipse cx="50" cy="68" rx="6" ry="4" fill="#000000"/></svg>`,
    `<svg viewBox="0 0 100 100" class="w-10 h-10"><circle cx="50" cy="55" r="40" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3"/><ellipse cx="35" cy="25" rx="9" ry="22" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3"/><ellipse cx="65" cy="25" rx="9" ry="22" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3"/><ellipse cx="35" cy="25" rx="5" ry="16" fill="#f1f5f9"/><ellipse cx="65" cy="25" rx="5" ry="16" fill="#f1f5f9"/><circle cx="35" cy="52" r="3" fill="#000000"/><circle cx="65" cy="52" r="3" fill="#000000"/><ellipse cx="50" cy="62" rx="4" ry="2.5" fill="#fecdd3"/><circle cx="28" cy="60" r="4" fill="#fecdd3"/><circle cx="72" cy="60" r="4" fill="#fecdd3"/></svg>`
  ];
  return svgs[index];
}

export default function GuidePage() {
  const router = useRouter();
  const user = api.getUser();

  // Navigation Items with "Cẩm nang học" at the very top (above "Tiến độ học")
  const menuItems = [
    { name: 'Cẩm nang học', id: 'guide', icon: '📖', active: true },
    { name: 'Tiến độ học', id: 'dashboard', icon: '📊', active: false },
    { name: 'Lộ trình học', id: 'roadmap', icon: '🗺️', active: false },
    { name: 'Từ vựng', id: 'vocab', icon: '📚', active: false },
    { name: 'Chữ Hán (Kanji)', id: 'kanji', icon: '🉐', active: false },
    { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️', active: false },
    { name: 'Flashcards', id: 'flashcards', icon: '🃏', active: false },
    { name: 'Luyện nói (Kaiwa)', id: 'kaiwa', icon: '💬', active: false },
    { name: 'Ôn bảng chữ cái', id: 'kana', icon: '🔤', active: false }
  ];

  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [activeCourse, setActiveCourse] = useState<'minna' | 'marugoto'>('minna');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Load selectedLessonId and activeCourse from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCourse = localStorage.getItem('activeCourse') as 'minna' | 'marugoto';
      if (storedCourse) {
        setActiveCourse(storedCourse);
      }
      
      const stored = localStorage.getItem('selectedLessonId');
      if (stored) {
        const parsed = parseInt(stored);
        if (!isNaN(parsed)) {
          setSelectedLessonId(parsed);
        }
      }
    }
  }, []);

  // Tự động chuyển hướng về dashboard nếu chuyển sang khoá marugoto
  useEffect(() => {
    if (activeCourse === 'marugoto') {
      localStorage.setItem('activeCourse', 'marugoto');
      localStorage.setItem('selectedLessonId', '101');
      router.push('/dashboard');
    }
  }, [activeCourse, router]);

  const handleLogout = () => {
    api.clearAuth();
    router.replace('/login');
  };

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-gradient-to-br from-[#0b1329] via-[#090d1a] to-[#050811] text-slate-100 font-sans relative">
      
      {/* Mobile Hamburger toggle button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden absolute top-4 left-4 z-40 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 cursor-pointer backdrop-blur-md active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar backdrop overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* Left Sidebar Navigation Menu */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950/95 border-r border-slate-900 flex flex-col justify-between p-6 backdrop-blur-xl shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Logo Title & Mobile Close button */}
          <div className="flex items-center justify-between mb-8 px-2 shrink-0">
            <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              {activeCourse === 'marugoto' ? 'Marugoto A1' : 'Minna Nihongo'}
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-200 text-xl p-1 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Course Switcher */}
          <CourseSwitcher
            activeCourse={activeCourse}
            onSwitch={(course) => {
              setActiveCourse(course);
            }}
          />

          {/* Category items */}
          <nav className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-0 select-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-800 hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {menuItems.filter(item => {
              if (activeCourse === 'marugoto' && (item.id === 'flashcards' || item.id === 'kaiwa' || item.id === 'guide' || item.id === 'kana')) {
                return false;
              }
              return true;
            }).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setIsSidebarOpen(false);
                  if (item.id === 'guide') {
                    // Already here
                  } else if (item.id === 'dashboard') {
                    router.push('/dashboard');
                  } else if (item.id === 'roadmap') {
                    router.push('/roadmap');
                  } else if (item.id === 'kana') {
                    router.push('/kana');
                  } else {
                    router.push(`/lessons/${selectedLessonId}?tab=${item.id}`);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium ${
                  item.active
                    ? 'bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-900/40 text-blue-400 shadow-[0_0_15px_rgba(29,78,216,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom profile component */}
        <div className="pt-6 border-t border-slate-900/80 space-y-4 shrink-0">
          <div className="flex items-center space-x-3 px-2">
            <div
              className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700/50 flex items-center justify-center overflow-hidden"
              dangerouslySetInnerHTML={{ __html: getAvatarSvg(user?.id || 'default') }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-200 truncate">
                {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Học viên'}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-900/80 hover:bg-red-950/20 border border-slate-800 hover:border-red-900/40 rounded-xl text-slate-400 hover:text-red-400 transition-all duration-300 text-sm font-medium active:scale-[0.98] cursor-pointer"
          >
            <span>🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-20 lg:p-10 space-y-8 relative">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-300 to-slate-400 bg-clip-text text-transparent">
              Cẩm Nang Học Tiếng Nhật
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Khám phá các phân hệ học tập và quy trình tối ưu để làm chủ tiếng Nhật hiệu quả nhất.
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="self-start md:self-auto px-4 py-2 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-[0.97] cursor-pointer flex items-center space-x-1.5"
          >
            <span>🚀</span>
            <span>Bắt đầu học ngay</span>
          </button>
        </div>

        {/* Main Grid Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Side: 7 subsystems introduction */}
          <div className="xl:col-span-7 space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
              <h2 className="text-base sm:text-lg font-bold text-blue-400 mb-6 flex items-center space-x-2">
                <span>🔗</span>
                <span>Khám Phá 7 Phân Hệ Học Tập</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-blue-900/60 transition-all duration-300 group">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
                    <h3 className="text-sm font-bold text-slate-200">Tiến độ học</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Theo dõi tỷ lệ hoàn thành, thiết lập thời gian học để hệ thống tự động phân phối mục tiêu hàng ngày và dự báo ngày hoàn thành N5/N4.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-blue-900/60 transition-all duration-300 group">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform">🗺️</span>
                    <h3 className="text-sm font-bold text-slate-200">Lộ trình học</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Bản đồ ngữ pháp tương tác trực quan. Nơi liên kết ngữ pháp mẫu của từng bài với kho từ vựng và chữ Hán tương ứng.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-blue-900/60 transition-all duration-300 group">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform">📚</span>
                    <h3 className="text-sm font-bold text-slate-200">Từ vựng & Chữ Hán</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Học phát âm giọng bản xứ 🔊, tra cứu nghĩa tiếng Việt và cập nhật trạng thái học tập (Chưa học, Đang học, Đã thuộc) cho từng từ.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-blue-900/60 transition-all duration-300 group">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform">🃏</span>
                    <h3 className="text-sm font-bold text-slate-200">Flashcards</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Học phản xạ nhận diện nhanh qua thẻ lật hai mặt. Hỗ trợ đảo thẻ ngẫu nhiên để rèn luyện trí nhớ hiệu quả nhất.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-blue-900/60 transition-all duration-300 group">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform">✏️</span>
                    <h3 className="text-sm font-bold text-slate-200">Ôn tập từ vựng</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Gõ tự luận câu trả lời (bằng Hiragana hoặc Romaji) với bộ lọc thông minh giúp bạn nhớ sâu, viết chuẩn ngữ pháp chính tả.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-blue-900/60 transition-all duration-300 group">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
                    <h3 className="text-sm font-bold text-slate-200">Luyện nói (Kaiwa)</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Thực hành đóng vai nhân vật hội thoại trong các ngữ cảnh đời thường thực tế, hỗ trợ luyện Shadowing giúp tăng phản xạ nói.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-blue-900/60 transition-all duration-300 group sm:col-span-2">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform">🔤</span>
                    <h3 className="text-sm font-bold text-slate-200">Ôn bảng chữ cái</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Nền tảng vững chắc cho người mới học. Rèn luyện phản xạ ghi nhớ Hiragana/Katakana qua trò chơi phản xạ Speedrun và Lật bài Memory Match thú vị.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Right Side: Optimal Study Flow (5 steps) & Extra Modules */}
          <div className="xl:col-span-5 space-y-6">
            
            {/* 5 Steps timeline */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
              <h2 className="text-base sm:text-lg font-bold text-emerald-400 mb-6 flex items-center space-x-2">
                <span>⚡</span>
                <span>Quy Trình Học Tập Tối Ưu (5 Bước)</span>
              </h2>

              <div className="relative border-l-2 border-slate-800/60 ml-3.5 pl-5 space-y-6">
                
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-0.5">Bước 1</span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200">Xác định mẫu câu chính</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Vào **Lộ trình học** để nắm bắt các cấu trúc ngữ pháp quan trọng và cấu trúc câu cốt lõi của bài.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-0.5">Bước 2</span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200">Học Từ vựng & Kanji tương ứng</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Xem danh sách chi tiết ở tab **Từ vựng** và **Chữ Hán (Kanji)** để ghi nhớ mặt chữ, ngữ nghĩa cùng cách phát âm giọng bản xứ.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-0.5">Bước 3</span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200">Ôn tập từ vựng chuyên sâu</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Chuyển sang tab **Ôn tập từ vựng** để làm bài tự luận gõ phím, trắc nghiệm hình ảnh hoặc chơi game trắc nghiệm phản xạ Speedrun 10 giây.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-0.5">Bước 4</span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200">Rèn luyện phản xạ qua Flashcards</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Lật thẻ trong **Flashcards** để củng cố khả năng nhận diện mặt chữ nhanh và bảo đảm bạn đã thuộc lòng từ vựng trước khi thực hành viết câu.
                  </p>
                </div>

                {/* Step 5 */}
                <div className="relative">
                  <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-0.5">Bước 5</span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200">Thế từ vào mẫu câu & Luyện Kaiwa</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Quay lại **Lộ trình học** để làm bài luyện tập thế từ mẫu câu (Sub-drill), rồi chuyển tiếp sang **Luyện nói (Kaiwa)** để nhập vai đàm thoại. Lặp lại quy trình đến khi làm chủ toàn bộ bài học!
                  </p>
                </div>

              </div>
            </div>

            {/* Extra tips */}
            <div className="bg-gradient-to-r from-blue-950/30 to-indigo-950/20 border border-blue-900/40 p-5 rounded-2xl">
              <h3 className="text-xs sm:text-sm font-bold text-slate-200 mb-2 flex items-center space-x-1.5">
                <span>💡</span>
                <span>Mẹo nhỏ cho bạn</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Đừng quên kiểm tra **Tiến độ học (Dashboard)** mỗi ngày để cập nhật các biểu đồ trực quan, giúp bạn luôn đi đúng lộ trình và đạt mục tiêu thi đỗ N5/N4 đúng hạn!
              </p>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
