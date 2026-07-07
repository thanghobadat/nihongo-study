'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../utils/api';
import SidebarSettings from '../../../components/SidebarSettings';
import CourseSwitcher from '../../../components/CourseSwitcher';

interface Question {
  id: number;
  type: 'kanji_reading' | 'orthography' | 'context' | 'grammar_select' | 'sentence_star';
  mondaiNumber: number;
  questionText: string;
  sentenceContext: string;
  choices: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  lessonId: number;
  explanation?: string;
  starSentenceParts?: string[];
  starCorrectOrder?: string[];
}

interface ExamDetail {
  id: string;
  course: string;
  range_start: number;
  range_end: number;
  score: number;
  total_questions: number;
  time_spent: number;
  questions_data: Question[];
  created_at: string;
}

export default function ExamReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const examId = resolvedParams.id;

  const router = useRouter();
  const user = api.getUser();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // State for responsive sidebar
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [activeCourse, setActiveCourse] = useState<'minna' | 'marugoto'>('minna');

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
    { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️', active: false },
    { name: 'Flashcards', id: 'flashcards', icon: '🃏', active: false },
    { name: 'Luyện nói (Kaiwa)', id: 'kaiwa', icon: '💬', active: false },
    { name: 'Ôn bảng chữ cái', id: 'kana', icon: '🔤', active: false }
  ];

  // Load selected values from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCourse = localStorage.getItem('activeCourse') as 'minna' | 'marugoto';
      if (storedCourse) {
        setActiveCourse(storedCourse);
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

  // State
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);

  // Toast Helper
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Load Exam Details
  useEffect(() => {
    async function loadExam() {
      setLoading(true);
      try {
        const res = await api.get(`/api/user/exams/${examId}`);
        setExam(res);
      } catch (err) {
        console.error('Error loading exam details:', err);
        showToast('Không thể tải chi tiết bài thi.');
      } finally {
        setLoading(false);
      }
    }
    if (examId) loadExam();
  }, [examId]);

  // Analyze wrong questions to suggest specific lesson improvements
  const diagnosticReport = useMemo(() => {
    if (!exam || !exam.questions_data) return { lessonsToImprove: [], sectionScores: { vocab: 0, grammar: 0 } };

    const wrongQuestions = exam.questions_data.filter(q => !q.isCorrect);
    
    // Group wrong questions by lessonId
    const lessonErrorCount: Record<number, number> = {};
    wrongQuestions.forEach(q => {
      lessonErrorCount[q.lessonId] = (lessonErrorCount[q.lessonId] || 0) + 1;
    });

    const lessonsToImprove = Object.keys(lessonErrorCount).map(lIdStr => {
      const lessonId = parseInt(lIdStr);
      return {
        lessonId,
        errorCount: lessonErrorCount[lessonId]
      };
    }).sort((a, b) => b.errorCount - a.errorCount); // Sort by error count desc

    // Calculate section scores
    const vocabTypes = ['kanji_reading', 'orthography', 'context'];
    const grammarTypes = ['grammar_select', 'sentence_star'];

    const vocabQuestions = exam.questions_data.filter(q => vocabTypes.includes(q.type));
    const grammarQuestions = exam.questions_data.filter(q => grammarTypes.includes(q.type));

    const vocabCorrect = vocabQuestions.filter(q => q.isCorrect).length;
    const grammarCorrect = grammarQuestions.filter(q => q.isCorrect).length;

    return {
      lessonsToImprove,
      vocabStats: {
        correct: vocabCorrect,
        total: vocabQuestions.length,
        percentage: vocabQuestions.length ? Math.round((vocabCorrect / vocabQuestions.length) * 100) : 0
      },
      grammarStats: {
        correct: grammarCorrect,
        total: grammarQuestions.length,
        percentage: grammarQuestions.length ? Math.round((grammarCorrect / grammarQuestions.length) * 100) : 0
      }
    };
  }, [exam]);

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

  const getMondaiName = (type: string) => {
    switch (type) {
      case 'kanji_reading': return 'Mondai 1: Đọc chữ Hán (漢字読み)';
      case 'orthography': return 'Mondai 2: Chữ viết Kanji (表記)';
      case 'context': return 'Mondai 3: Điền từ hợp ngữ cảnh (文脈規定)';
      case 'grammar_select': return 'Mondai 4: Chọn ngữ pháp/trợ từ (文法形式)';
      case 'sentence_star': return 'Mondai 5: Sắp xếp câu ngôi sao ★ (文の組み立て)';
      default: return 'Trắc nghiệm tổng hợp';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-[#09111e]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest">
            Đang tải dữ liệu bài thi cũ...
          </p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-[#09111e] text-slate-500">
        ⚠️ Không tìm thấy chi tiết bài thi thử này.
      </div>
    );
  }

  const scorePercentage = Math.round((exam.score / exam.total_questions) * 100);

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
            onSwitch={(course) => {
              setActiveCourse(course);
              localStorage.setItem('activeCourse', course);
              router.push('/mock-test');
            }}
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
                    router.push('/mock-test');
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

      {/* Main Review Workspace */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-20 lg:p-10 space-y-6 md:space-y-8 relative">
        {toast && (
          <div className="fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl bg-slate-900 dark:bg-slate-850 border border-slate-850/80 text-white text-xs font-bold shadow-2xl animate-slide-in">
            🔔 {toast}
          </div>
        )}

        {/* Back and Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/65 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <button
              onClick={() => router.push('/mock-test')}
              className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center space-x-1 cursor-pointer"
            >
              <span>← Quay lại lịch sử</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              📊 Báo cáo kết quả thi thử
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Đề thi làm ngày {formatDate(exam.created_at)} | Phạm vi: Bài {exam.course === 'marugoto' ? `${exam.range_start - 100} - ${exam.range_end - 100}` : `${exam.range_start} - ${exam.range_end}`}
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl shadow-sm">
            <div className="text-center pr-4 border-r border-slate-150 dark:border-slate-800">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Điểm số</div>
              <div className={`text-2xl font-black ${
                scorePercentage >= 80 ? 'text-emerald-600' : scorePercentage >= 50 ? 'text-amber-600' : 'text-red-500'
              }`}>
                {exam.score}/{exam.total_questions}
              </div>
            </div>
            <div className="text-center pl-1">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian làm</div>
              <div className="text-lg font-black text-slate-700 dark:text-slate-300 font-mono mt-0.5">
                {formatDuration(exam.time_spent)}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Improvement & Diagnosis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section Summary Stats */}
          <div className="bg-white dark:bg-[#0c1626]/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4 lg:col-span-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Thống kê phần thi</h3>
            <div className="space-y-4">
              {diagnosticReport.vocabStats && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>📚 Từ vựng & Chữ Hán</span>
                    <span>{diagnosticReport.vocabStats.correct}/{diagnosticReport.vocabStats.total} câu</span>
                  </div>
                  <div className="w-full bg-slate-150 dark:bg-slate-950 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all" 
                      style={{ width: `${diagnosticReport.vocabStats.percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{diagnosticReport.vocabStats.percentage}% chính xác</span>
                </div>
              )}

              {diagnosticReport.grammarStats && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>📝 Ngữ pháp cấu trúc</span>
                    <span>{diagnosticReport.grammarStats.correct}/{diagnosticReport.grammarStats.total} câu</span>
                  </div>
                  <div className="w-full bg-slate-150 dark:bg-slate-950 rounded-full h-2">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full transition-all" 
                      style={{ width: `${diagnosticReport.grammarStats.percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{diagnosticReport.grammarStats.percentage}% chính xác</span>
                </div>
              )}
            </div>
          </div>

          {/* Diagnosis & Recommendations */}
          <div className="bg-white dark:bg-[#0c1626]/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4 lg:col-span-2 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">💡 Chẩn đoán & Gợi ý cải thiện</h3>
              {diagnosticReport.lessonsToImprove.length === 0 ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-2">
                  <span>🎉</span>
                  <span>Tuyệt vời! Bạn không làm sai câu nào hoặc đạt điểm tối đa. Hãy duy trì phong độ nhé!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Hệ thống phân tích thấy bạn làm sai nhiều câu nhất thuộc các bài học sau. Bạn nên bấm vào nút để xem lại chi tiết bài học:
                  </p>
                  <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {diagnosticReport.lessonsToImprove.map(item => {
                      const displayLessonNum = exam.course === 'marugoto' ? item.lessonId - 100 : item.lessonId;
                      return (
                        <div 
                          key={item.lessonId}
                          className="flex items-center justify-between p-3 rounded-2xl bg-red-50/50 dark:bg-red-950/10 border border-red-150 dark:border-red-900/40 text-xs"
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-350">
                            🔴 Bài {displayLessonNum} (Sai {item.errorCount} câu)
                          </span>
                          <button
                            onClick={() => router.push(`/lessons/${item.lessonId}`)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer transition-all active:scale-95 shadow-md text-[10px]"
                          >
                            📖 Ôn tập Bài {displayLessonNum}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Questions Review List Grouped by Mondai */}
        <div className="space-y-6">
          <h2 className="text-sm font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest pt-2">Chi tiết bài thi</h2>
          
          <div className="space-y-8">
            {['kanji_reading', 'orthography', 'context', 'grammar_select', 'sentence_star'].map((type) => {
              const typeQuestions = exam.questions_data
                .map((q, idx) => ({ q, idx }))
                .filter(item => item.q.type === type);

              if (typeQuestions.length === 0) return null;

              return (
                <div key={type} className="space-y-4">
                  {/* Mondai Section Heading */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 dark:from-blue-950/20 dark:to-transparent border border-blue-150/45 dark:border-blue-900/35 rounded-2xl p-4 flex items-center space-x-2.5">
                    <span className="text-base">📝</span>
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest font-mono">
                        {getMondaiName(type)}
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-450">
                        {type === 'kanji_reading' ? 'Chọn cách đọc đúng của chữ Kanji được gạch chân.' :
                         type === 'orthography' ? 'Chọn chữ viết Kanji đúng cho từ được gạch chân.' :
                         type === 'context' ? 'Chọn từ thích hợp nhất để điền vào chỗ trống hợp ngữ cảnh.' :
                         type === 'grammar_select' ? 'Chọn mẫu ngữ pháp hoặc trợ từ phù hợp để hoàn thành câu.' :
                         'Sắp xếp các cụm từ xào trộn để tạo thành câu hoàn chỉnh và chọn cụm từ ở vị trí ngôi sao (★).'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {typeQuestions.map(({ q, idx }) => (
                      <div 
                        key={q.id}
                        className={`p-6 rounded-3xl border shadow-md space-y-4 bg-white dark:bg-[#0c1626]/40 ${
                          q.isCorrect 
                            ? 'border-emerald-250 dark:border-emerald-900/60' 
                            : 'border-red-250 dark:border-red-900/60'
                        }`}
                      >
                        {/* Header question */}
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 dark:border-slate-850/80 pb-2.5">
                          <div className="flex items-center space-x-2">
                            <span className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-black text-white ${
                              q.isCorrect ? 'bg-emerald-500' : 'bg-red-500'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              Câu hỏi {idx + 1}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                            Bài {exam.course === 'marugoto' ? q.lessonId - 100 : q.lessonId}
                          </span>
                        </div>

                        {/* Prompt & Sentence context */}
                        <div className="space-y-3">
                          {q.type !== 'sentence_star' ? (
                            <div 
                              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-850/80 text-center font-bold text-base sm:text-lg tracking-wide font-mono text-slate-750 dark:text-slate-300"
                              dangerouslySetInnerHTML={{ __html: q.sentenceContext }}
                            />
                          ) : (
                            <div className="space-y-2">
                              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-850/80 text-center font-bold text-base tracking-widest font-mono text-slate-750 dark:text-slate-350">
                                {q.sentenceContext}
                              </div>
                              {/* Scrambled options shown under */}
                              <div className="flex flex-wrap gap-1.5 justify-center py-1">
                                {q.choices.map((choice, cIdx) => (
                                  <span 
                                    key={cIdx} 
                                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold font-mono text-slate-500"
                                  >
                                    {cIdx + 1}. {choice}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Choice list showing correct / wrong checks */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.choices.map((choice, cIdx) => {
                            const isSelected = q.userAnswer === choice;
                            const isCorrectChoice = q.correctAnswer === choice;
                            
                            let choiceStyle = 'bg-slate-50/50 dark:bg-slate-950/10 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-350';
                            let dotStyle = 'border-slate-300 dark:border-slate-700';
                            let dotContent = '';

                            if (isCorrectChoice) {
                              choiceStyle = 'bg-emerald-50 dark:bg-emerald-950/25 border-emerald-450 text-emerald-600 dark:text-emerald-400 font-bold';
                              dotStyle = 'border-emerald-500 bg-emerald-500 text-white';
                              dotContent = '✓';
                            } else if (isSelected && !q.isCorrect) {
                              choiceStyle = 'bg-red-50 dark:bg-red-950/25 border-red-450 text-red-600 dark:text-red-400 font-bold';
                              dotStyle = 'border-red-500 bg-red-500 text-white';
                              dotContent = '✗';
                            }

                            return (
                              <div 
                                key={cIdx}
                                className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center justify-between ${choiceStyle}`}
                              >
                                <span>{choice}</span>
                                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] shrink-0 font-bold ${dotStyle}`}>
                                  {dotContent}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Answer explanation details */}
                        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/15 border border-blue-150 dark:border-blue-900/40 text-xs text-slate-650 dark:text-slate-450 leading-relaxed font-medium space-y-1">
                          <p>🔍 <b>Giải thích chi tiết:</b></p>
                          <p className="font-mono whitespace-pre-line">{q.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
