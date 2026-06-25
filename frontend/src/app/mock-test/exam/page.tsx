'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../utils/api';
import { generateJLPTExam, Question } from '../../utils/examGenerator';
import SidebarSettings from '../../components/SidebarSettings';

function ExamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Params
  const startId = parseInt(searchParams.get('start') || '1');
  const endId = parseInt(searchParams.get('end') || '5');
  const numQuestions = parseInt(searchParams.get('num') || '10');
  const durationMin = parseInt(searchParams.get('time') || '15'); // in minutes

  // State
  const [activeCourse, setActiveCourse] = useState<string>('minna');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(durationMin * 60); // in seconds
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [toast, setToast] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);


  // Time spent tracker
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Toast Helper
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Load Course and Syllabus
  useEffect(() => {
    const course = localStorage.getItem('activeCourse') || 'minna';
    setActiveCourse(course);

    async function loadSyllabusAndGenerate() {
      setLoading(true);
      try {
        const res = await api.get(`/api/user/course-summary?course=${course}`);
        const vocab = res.vocabulary || [];
        const kanji = res.kanji || [];
        const grammar = res.grammar || [];

        // Generate JLPT Mock Exam
        const examQuestions = generateJLPTExam(vocab, kanji, grammar, startId, endId, numQuestions);
        if (examQuestions.length === 0) {
          showToast('Không có đủ dữ liệu học tập trong khoảng bài học này để tạo đề.');
          setTimeout(() => router.push('/mock-test'), 2000);
          return;
        }
        setQuestions(examQuestions);
      } catch (err) {
        console.error('Error generating exam:', err);
        showToast('Có lỗi xảy ra khi tạo đề thi.');
      } finally {
        setLoading(false);
      }
    }

    loadSyllabusAndGenerate();
  }, [startId, endId, numQuestions, router]);

  // Timer Effect
  useEffect(() => {
    if (loading || submitting || durationMin === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto submit
          showToast('Hết giờ làm bài! Hệ thống đang tự động nộp bài...');
          handleAutoSubmit();
          return 0;
        }
        setTimeSpent(t => t + 1);
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, submitting, durationMin]);

  // Untimed spent tracker
  useEffect(() => {
    if (loading || submitting || durationMin !== 0) return;

    const interval = setInterval(() => {
      setTimeSpent(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, submitting, durationMin]);

  // Select answer logic
  const handleSelectAnswer = (choice: string) => {
    const updated = [...questions];
    updated[currentIdx].userAnswer = choice;
    setQuestions(updated);
  };

  const handleAutoSubmit = async () => {
    await submitExam(timeLeft === 0 ? durationMin * 60 : timeSpent);
  };

  const unansweredCount = useMemo(() => {
    return questions.filter(q => !q.userAnswer).length;
  }, [questions]);

  const handleManualSubmit = () => {
    setShowSubmitConfirm(true);
  };

  const confirmSubmitExam = async () => {
    setShowSubmitConfirm(false);
    await submitExam(timeSpent);
  };

  const handleExitExam = () => {
    setShowExitConfirm(true);
  };

  const confirmExitExam = () => {
    setShowExitConfirm(false);
    if (timerRef.current) clearInterval(timerRef.current);
    router.push('/mock-test');
  };


  const getMondaiTitle = (type: string) => {
    switch (type) {
      case 'kanji_reading': return 'Mondai 1: Đọc chữ Hán (漢字読み)';
      case 'orthography': return 'Mondai 2: Chữ viết Kanji (表記)';
      case 'context': return 'Mondai 3: Điền từ ngữ cảnh (文脈規定)';
      case 'grammar_select': return 'Mondai 4: Chọn mẫu ngữ pháp (文法形式)';
      case 'sentence_star': return 'Mondai 5: Sắp xếp câu ngôi sao ★ (文の組み立て)';
      default: return 'Phần thi';
    }
  };

  const getMondaiInstruction = (type: string) => {
    switch (type) {
      case 'kanji_reading': return 'Chọn cách đọc đúng của chữ Kanji được gạch chân.';
      case 'orthography': return 'Chọn chữ viết Kanji đúng cho từ được viết bằng Hiragana/Katakana.';
      case 'context': return 'Chọn từ thích hợp nhất để điền vào chỗ trống hợp ngữ cảnh.';
      case 'grammar_select': return 'Chọn mẫu ngữ pháp hoặc trợ từ phù hợp để hoàn thành câu.';
      case 'sentence_star': return 'Sắp xếp các cụm từ xào trộn để tạo thành câu hoàn chỉnh và chọn cụm từ ở vị trí ngôi sao (★).';
      default: return 'Chọn đáp án đúng nhất.';
    }
  };

  const submitExam = async (finalTimeSpent: number) => {
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      // Grade questions
      const gradedQuestions = questions.map(q => {
        const isCorrect = q.userAnswer === q.correctAnswer;
        return {
          ...q,
          isCorrect
        };
      });

      const score = gradedQuestions.filter(q => q.isCorrect).length;

      // Send to backend API
      const res = await api.post('/api/user/exams', {
        course: activeCourse,
        range_start: startId,
        range_end: endId,
        score,
        total_questions: numQuestions,
        time_spent: finalTimeSpent,
        questions_data: gradedQuestions
      });

      showToast('Nộp bài thi thành công!');
      setTimeout(() => {
        router.push(`/mock-test/review/${res.examId}`);
      }, 1500);
    } catch (err: any) {
      console.error('Error submitting exam:', err);
      showToast(err.message || 'Lỗi khi nộp bài thi.');
      setSubmitting(false);
    }
  };

  // Timer string formatter
  const timerString = useMemo(() => {
    if (durationMin === 0) return '∞';
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [timeLeft, durationMin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-[#09111e]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">
            Đang trộn dữ liệu & sinh đề thi thử...
          </p>
        </div>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-[#09111e]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest">
            Đang lưu trữ đề thi & phân tích kết quả...
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#09111e] text-slate-800 dark:text-slate-200 transition-colors overflow-hidden">
      {/* Sidebar for quick question select */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1626] hidden lg:flex flex-col h-full shrink-0">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-3 shrink-0">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian còn lại</div>
          <div className={`text-3xl font-black font-mono tracking-wider ${
            timeLeft < 60 && durationMin !== 0 ? 'text-red-500 animate-pulse' : 'text-slate-900 dark:text-white'
          }`}>
            {timerString}
          </div>
        </div>

        {/* Question status grid */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 select-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-100 hover:[&::-webkit-scrollbar-thumb]:bg-slate-450 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full border-t border-slate-100 dark:border-slate-850/80">
          <div className="text-[10px] font-black text-slate-450 uppercase tracking-widest mb-2">Bảng câu hỏi (JLPT)</div>
          
          {['kanji_reading', 'orthography', 'context', 'grammar_select', 'sentence_star'].map((type) => {
            const typeQuestions = questions
              .map((q, idx) => ({ q, idx }))
              .filter(item => item.q.type === type);

            if (typeQuestions.length === 0) return null;

            return (
              <div key={type} className="space-y-1.5">
                <div className="text-[9px] font-black text-blue-600 dark:text-blue-450 uppercase tracking-wider font-mono">
                  {type === 'kanji_reading' ? 'Mondai 1: Đọc chữ Hán' :
                   type === 'orthography' ? 'Mondai 2: Chữ viết Kanji' :
                   type === 'context' ? 'Mondai 3: Điền từ ngữ cảnh' :
                   type === 'grammar_select' ? 'Mondai 4: Chọn ngữ pháp' :
                   'Mondai 5: Ghép câu sao ★'}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {typeQuestions.map(({ q, idx }) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        currentIdx === idx
                          ? 'bg-blue-600 text-white shadow-md scale-105 border-2 border-blue-400'
                          : q.userAnswer
                            ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                            : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-2.5">
          <button
            onClick={handleManualSubmit}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <span>🚪 Nộp bài thi</span>
          </button>
          <button
            onClick={handleExitExam}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <span>← Thoát & Hủy bài</span>
          </button>
          <SidebarSettings />
        </div>
      </aside>

      {/* Main Exam Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 flex flex-col h-full">
        {toast && (
          <div className="fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl bg-slate-900 dark:bg-slate-850 border border-slate-850/80 text-white text-xs font-bold shadow-2xl animate-slide-in">
            🔔 {toast}
          </div>
        )}

        {/* Top bar for mobile/tablet containing timer & submit */}
        <div className="flex items-center justify-between lg:hidden border-b border-slate-250 dark:border-slate-800/80 pb-4 shrink-0">
          <button
            onClick={handleExitExam}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold cursor-pointer active:scale-95"
          >
            ← Thoát
          </button>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-400">Thời gian:</span>
            <span className={`text-lg font-black font-mono ${
              timeLeft < 60 && durationMin !== 0 ? 'text-red-500 animate-pulse' : 'text-slate-900 dark:text-white'
            }`}>
              {timerString}
            </span>
          </div>
          <button
            onClick={handleManualSubmit}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer active:scale-95"
          >
            Nộp bài
          </button>
        </div>

        {/* Progress header */}
        <div className="flex items-center justify-between shrink-0">
          <span className="text-[11px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">
            Mondai {currentQuestion.mondaiNumber} / Câu hỏi {currentIdx + 1} trên {questions.length}
          </span>
          <span className="text-xs font-bold text-slate-400">
            Bài {activeCourse === 'marugoto' ? currentQuestion.lessonId - 100 : currentQuestion.lessonId}
          </span>
        </div>

        {/* Mondai Instruction Header Banner */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-150 dark:border-blue-900/40 rounded-2xl p-4 shrink-0 flex items-start space-x-2.5">
          <span className="text-sm">👉</span>
          <div className="space-y-0.5">
            <div className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider font-mono">
              {getMondaiTitle(currentQuestion.type)}
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-350 leading-normal">
              {getMondaiInstruction(currentQuestion.type)}
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="flex-1 bg-white dark:bg-[#0c1626]/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-6">

            {/* Sentence context */}
            {currentQuestion.type !== 'sentence_star' ? (
              <div 
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850/80 text-center text-lg sm:text-xl font-bold text-slate-850 dark:text-slate-200 tracking-wide font-mono"
                dangerouslySetInnerHTML={{ __html: currentQuestion.sentenceContext }}
              />
            ) : (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850/80 text-center text-lg font-bold text-slate-800 dark:text-slate-200 font-mono tracking-widest">
                  {currentQuestion.sentenceContext}
                </div>
                
                {/* Visual feedback of segments for review */}
                <div className="flex flex-wrap gap-2 justify-center py-2">
                  {currentQuestion.choices.map((choice, cIdx) => (
                    <span 
                      key={cIdx} 
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold font-mono"
                    >
                      {cIdx + 1}. {choice}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Multiple choices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {currentQuestion.choices.map((choice, cIdx) => {
                const isSelected = currentQuestion.userAnswer === choice;
                return (
                  <button
                    key={cIdx}
                    onClick={() => handleSelectAnswer(choice)}
                    className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-600 text-blue-600 dark:text-blue-400 shadow-md scale-[1.01]'
                        : 'bg-slate-50/50 dark:bg-slate-950/10 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/10'
                    }`}
                  >
                    <span>{choice}</span>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-700'
                    }`}>
                      {isSelected && <span className="text-[10px]">✓</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Previous / Next buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-150 dark:border-slate-850 shrink-0">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              ← Câu trước
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md transition-all active:scale-95"
              >
                Câu tiếp theo →
              </button>
            ) : (
              <button
                onClick={handleManualSubmit}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-md transition-all active:scale-95 animate-pulse"
              >
                🎉 Hoàn thành & Nộp bài
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 transform transition-all duration-300 scale-100">
            <div className="flex items-center space-x-3 text-red-500">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-black tracking-wide">Hủy bài thi?</h3>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Bạn có chắc chắn muốn hủy bài thi thử này không? Toàn bộ tiến trình và câu trả lời của bài thi này sẽ bị mất và không được lưu lại.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                Quay lại làm bài
              </button>
              <button
                onClick={confirmExitExam}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md shadow-red-500/20"
              >
                Hủy & Thoát
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 transform transition-all duration-300 scale-100">
            <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400">
              <span className="text-2xl">📝</span>
              <h3 className="text-lg font-black tracking-wide">Nộp bài thi</h3>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                Bạn có chắc chắn muốn nộp bài thi thử này không?
              </p>
              {unansweredCount > 0 ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/60 rounded-xl text-xs text-amber-600 dark:text-amber-400 font-bold">
                  ⚠️ Bạn vẫn còn {unansweredCount} câu hỏi chưa trả lời!
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/60 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ Tuyệt vời! Bạn đã hoàn thành tất cả các câu hỏi.
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                Tiếp tục làm bài
              </button>
              <button
                onClick={confirmSubmitExam}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md shadow-indigo-500/20"
              >
                Xác nhận nộp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-[#09111e]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">
            Đang tải dữ liệu thi thử...
          </p>
        </div>
      </div>
    }>
      <ExamContent />
    </Suspense>
  );
}
