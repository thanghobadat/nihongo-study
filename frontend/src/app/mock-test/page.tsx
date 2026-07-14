'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../utils/api';
import SidebarSettings from '../components/SidebarSettings';
import CourseSwitcher from '../components/CourseSwitcher';

interface Lesson {
  id: number;
  title: string;
  description: string;
  course: string;
}

interface ExamHistoryItem {
  id: string;
  course: string;
  range_start: number;
  range_end: number;
  score: number;
  total_questions: number;
  time_spent: number;
  created_at: string;
}

export default function MockTestPage() {
  const router = useRouter();
  const user = api.getUser();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);



  // State
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // State
  const [activeCourse, setActiveCourse] = useState<'minna' | 'marugoto'>('minna');
  const [level, setLevel] = useState<string>('N5');
  const [activeTab, setActiveTab] = useState<'setup' | 'history'>('setup');
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [history, setHistory] = useState<ExamHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);

  // Setup form states
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(5);
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [duration, setDuration] = useState<number>(15); // in minutes, 0 means no timer

  // Toast Helper
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteExamClick = (id: string) => {
    setExamToDelete(id);
  };

  const handleConfirmDeleteExam = async () => {
    if (!examToDelete) return;
    try {
      await api.delete(`/api/user/exams/${examToDelete}`);
      showToast('Xóa lịch sử bài thi thành công.');
      setHistory(prev => prev.filter(e => e.id !== examToDelete));
    } catch (err: any) {
      console.error('Error deleting exam:', err);
      showToast(err.message || 'Lỗi khi xóa đề thi.');
    } finally {
      setExamToDelete(null);
    }
  };


  // Load Course and selectedLessonId from localStorage and check query params
  useEffect(() => {
    const saved = localStorage.getItem('activeCourse');
    if (saved === 'minna' || saved === 'marugoto') {
      setActiveCourse(saved);
    }
    
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'history') {
        setActiveTab('history');
      }
      const storedLesson = localStorage.getItem('selectedLessonId');
      if (storedLesson) {
        const parsed = parseInt(storedLesson);
        if (!isNaN(parsed)) {
          setSelectedLessonId(parsed);
        }
      }
    }
  }, []);

  const handleCourseChange = (course: 'minna' | 'marugoto') => {
    setActiveCourse(course);
    localStorage.setItem('activeCourse', course);
    // Reset ranges depending on course
    if (course === 'marugoto') {
      setRangeStart(101);
      setRangeEnd(105);
    } else {
      setRangeStart(1);
      setRangeEnd(5);
    }
  };

  // Load Lessons & History
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Get lessons list
      const res = await api.get('/api/user/lessons');
      setLessons(res || []);
    } catch (err) {
      console.error('Error loading lessons:', err);
      showToast('Không thể kết nối với máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get(`/api/user/exams?course=${activeCourse}`);
      setHistory(res || []);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [activeCourse]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, loadHistory]);

  // Filter lessons based on course and N5/N4 levels
  const filteredLessons = useMemo(() => {
    return lessons.filter(l => {
      if ((l.course || 'minna') !== activeCourse) return false;
      if (activeCourse === 'marugoto') return true;
      if (level === 'N5') return l.id >= 1 && l.id <= 25;
      return l.id >= 26 && l.id <= 50;
    });
  }, [lessons, activeCourse, level]);

  // Handle Range start/end logic to keep range valid
  useEffect(() => {
    if (filteredLessons.length > 0) {
      const ids = filteredLessons.map(l => l.id);
      const minId = Math.min(...ids);
      const maxId = Math.max(...ids);

      if (!ids.includes(rangeStart)) {
        setRangeStart(minId);
      }
      if (!ids.includes(rangeEnd) || rangeEnd < rangeStart) {
        setRangeEnd(Math.min(minId + 4, maxId));
      }
    }
  }, [filteredLessons, rangeStart, rangeEnd]);

  const handleStartExam = () => {
    if (rangeEnd < rangeStart) {
      showToast('Bài học kết thúc phải lớn hơn hoặc bằng bài học bắt đầu.');
      return;
    }
    router.push(`/mock-test/exam?start=${rangeStart}&end=${rangeEnd}&num=${numQuestions}&time=${duration}`);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} giây`;
    return `${mins} phút ${secs > 0 ? `${secs} giây` : ''}`;
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  // Sidebar Menu list
  const menuItems = activeCourse === 'marugoto' ? [
    { name: 'Từ vựng', id: 'vocab', icon: '📚', active: false },
    { name: 'Ngữ pháp', id: 'grammar', icon: '📖', active: false },
    { name: 'Luyện tập 4 kỹ năng', id: 'practice', icon: '⚡', active: false },
    { name: 'Tổng hợp kiến thức', id: 'summary', icon: '📝', active: false }
  ] : [
    { name: 'Cẩm nang học', id: 'guide', icon: '📖', active: false },
    { name: 'Tiến độ học', id: 'dashboard', icon: '📊', active: false },
    { name: 'Lộ trình học', id: 'roadmap', icon: '🗺️', active: false },
    { name: 'Từ vựng', id: 'vocab', icon: '📚', active: false },
    { name: 'Chữ Hán (Kanji)', id: 'kanji', icon: '🉐', active: false },
    { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️', active: false }
  ];

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/50 dark:from-[#0b1329] dark:via-[#090d1a] dark:to-[#050811] text-slate-800 dark:text-slate-100 font-sans relative">
      
      {/* Mobile Hamburger toggle button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden absolute top-4 left-4 z-40 p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer backdrop-blur-md active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar backdrop overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/20 z-40 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* 1. Left Sidebar Navigation Menu */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-slate-950/95 shadow-lg shadow-slate-200/40 border-r border-slate-200 dark:border-slate-800 dark:border-r-slate-900/50 flex flex-col justify-between p-6 backdrop-blur-xl shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0 ${
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
              className="lg:hidden text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-250 text-xl p-1 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Course Switcher */}
          <CourseSwitcher
            activeCourse={activeCourse}
            onSwitch={handleCourseChange}
          />

          {/* Category items */}
          <nav className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-0 select-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-100 hover:[&::-webkit-scrollbar-thumb]:bg-slate-450 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setIsSidebarOpen(false);
                  if (item.id === 'guide') {
                    router.push('/guide');
                  } else if (item.id === 'dashboard') {
                    router.push('/dashboard');
                  } else if (item.id === 'roadmap') {
                    router.push('/roadmap');
                  } else if (item.id === 'kana') {
                    router.push('/kana');
                  } else if (item.id === 'mock-test') {
                    // Stay here
                  } else if (item.id === 'knowledge') {
                    router.push('/knowledge');
                  } else {
                    router.push(`/lessons/${selectedLessonId}?tab=${item.id}`);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium ${
                  item.active
                    ? 'bg-indigo-50/80 dark:bg-gradient-to-r dark:from-blue-950/40 dark:to-slate-900 border border-indigo-100/50 dark:border-blue-900/40 text-indigo-600 dark:text-blue-400 shadow-sm dark:shadow-[0_0_15px_rgba(29,78,216,0.15)]'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <SidebarSettings />
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-20 lg:p-10 space-y-6 md:space-y-8 relative">
        {/* Toast Alert */}
        {toast && (
          <div className="fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl bg-slate-900 dark:bg-slate-850 border border-slate-850/80 text-white text-xs font-bold shadow-2xl animate-slide-in">
            🔔 {toast}
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/80 pb-5">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              🏆 Thi thử JLPT
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tạo đề thi trắc nghiệm thử dựa theo kiến thức của các bài học đã chọn.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {activeCourse !== 'marugoto' && (
              <div className="bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl flex space-x-1 border border-slate-200 dark:border-slate-850 shadow-sm">
                <button
                  onClick={() => setLevel('N5')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    level === 'N5'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
                  }`}
                >
                  N5
                </button>
                <button
                  onClick={() => setLevel('N4')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    level === 'N4'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
                  }`}
                >
                  N4
                </button>
              </div>
            )}
             <CourseSwitcher activeCourse={activeCourse} onSwitch={handleCourseChange} />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1.5 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 border-b-2 font-black text-xs transition-all cursor-pointer ${
              activeTab === 'setup'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            ⚙️ Thiết lập đề thi
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 border-b-2 font-black text-xs transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            📜 Lịch sử thi thử
          </button>
        </div>

        {/* Setup Tab View */}
        {activeTab === 'setup' && (
          <div className="max-w-2xl bg-white dark:bg-[#0c1626]/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-md space-y-6">
            <h2 className="text-sm font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">Cấu hình đề thi</h2>

            {loading ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-xs font-semibold text-slate-400">Đang tải danh sách bài học...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Range Start */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500">Từ bài học:</label>
                  <select
                    value={rangeStart}
                    onChange={(e) => setRangeStart(parseInt(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-600 cursor-pointer shadow-sm"
                  >
                    {filteredLessons.map(l => (
                      <option key={l.id} value={l.id}>
                        {activeCourse === 'marugoto' ? `Bài ${l.id - 100}` : `Bài ${l.id}`} - {l.title.split(': ')[1] || l.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Range End */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500">Đến bài học:</label>
                  <select
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(parseInt(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-600 cursor-pointer shadow-sm"
                  >
                    {filteredLessons.filter(l => l.id >= rangeStart).map(l => (
                      <option key={l.id} value={l.id}>
                        {activeCourse === 'marugoto' ? `Bài ${l.id - 100}` : `Bài ${l.id}`} - {l.title.split(': ')[1] || l.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Number of Questions */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500">Số lượng câu hỏi:</label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-600 cursor-pointer shadow-sm"
                  >
                    <option value={10}>10 câu (Đề nhanh)</option>
                    <option value={20}>20 câu (Đề tiêu chuẩn)</option>
                    <option value={30}>30 câu (Đề luyện phản xạ sâu)</option>
                  </select>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500">Thời gian làm bài:</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-600 cursor-pointer shadow-sm"
                  >
                    <option value={10}>10 phút</option>
                    <option value={15}>15 phút</option>
                    <option value={25}>25 phút</option>
                    <option value={0}>Không tính giờ (Thư giãn)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/60 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              💡 <b>Mẹo ôn tập:</b> Đề thi sẽ tự động trộn đều 5 dạng bài JLPT bao gồm: <i>Đọc Kanji, Chọn chữ Kanji viết đúng, Chọn từ hợp ngữ cảnh, Chọn ngữ pháp phù hợp, và Sắp xếp câu ngôi sao ★</i>. Hãy làm quen với cấu trúc này để phản xạ tốt hơn trong phòng thi thật!
            </div>

            <button
              onClick={handleStartExam}
              disabled={loading || filteredLessons.length === 0}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2"
            >
              <span>🚀 Bắt đầu làm bài thi thử</span>
            </button>
          </div>
        )}

        {/* History Tab View */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-[#0c1626]/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
            <h2 className="text-sm font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest pb-2">Lịch sử bài thi đã làm</h2>

            {historyLoading ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-xs font-semibold text-slate-400">Đang tải lịch sử thi...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-20 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/40 dark:bg-slate-900/10 space-y-4">
                <span className="text-4xl block">📋</span>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350">Không tìm thấy lịch sử làm đề</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                    Bạn chưa thực hiện bài thi thử nào cho khóa học này. Hãy thiết lập và làm bài thi đầu tiên để ghi lại lịch sử học tập!
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-555 font-bold uppercase tracking-wider">
                      <th className="p-4">Ngày làm đề</th>
                      <th className="p-4">Phạm vi bài học</th>
                      <th className="p-4">Kết quả đạt</th>
                      <th className="p-4">Thời gian làm</th>
                      <th className="p-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-850/80">
                    {history.map((item) => {
                      const rangeStr = activeCourse === 'marugoto' 
                        ? `Bài ${item.range_start - 100} - ${item.range_end - 100}`
                        : `Bài ${item.range_start} - ${item.range_end}`;
                      const scorePercentage = parseFloat(((item.score / item.total_questions) * 100).toFixed(0));
                      
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="p-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                            {formatDate(item.created_at)}
                          </td>
                          <td className="p-4 whitespace-nowrap text-slate-750 dark:text-slate-300 font-semibold">
                            {rangeStr}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                              scorePercentage >= 80 
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                                : scorePercentage >= 50 
                                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' 
                                  : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                            }`}>
                              {item.score}/{item.total_questions} ({scorePercentage}%)
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                            {formatDuration(item.time_spent)}
                          </td>
                          <td className="p-4 text-right whitespace-nowrap space-x-2">
                            <button
                              onClick={() => router.push(`/mock-test/review/${item.id}`)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-all active:scale-95 shadow-md"
                            >
                              🔍 Xem lại
                            </button>
                            <button
                              onClick={() => handleDeleteExamClick(item.id)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-all active:scale-95 shadow-md"
                            >
                              🗑️ Xóa
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Exam Confirmation Modal */}
      {examToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 transform transition-all duration-300 scale-100 animate-scale-in">
            <div className="flex items-center space-x-3 text-red-500">
              <span className="text-2xl">🗑️</span>
              <h3 className="text-lg font-black tracking-wide">Xóa lịch sử thi?</h3>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Bạn có chắc chắn muốn xóa lịch sử bài thi thử này không? Hành động này sẽ xóa vĩnh viễn kết quả làm bài này khỏi hệ thống và không thể khôi phục lại.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setExamToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDeleteExam}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md shadow-red-500/20"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
