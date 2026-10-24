'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PracticeQuestion, UnitPracticeSummary } from '../data/practice/types';
import { loadLessonPractice, summarizeLessonUnits, generateQuestionForUnit, shuffleArray } from '../data/practice';
import { KNOWLEDGE_UNITS } from '../data/knowledgeUnits';
import { speakTTS } from '../../utils/audioHelper';

interface LessonPracticeModalProps {
  lessonId: number;
  initialUnitId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LessonPracticeModal({
  lessonId,
  initialUnitId,
  isOpen,
  onClose,
}: LessonPracticeModalProps) {
  // Navigation steps
  const [step, setStep] = useState<'config' | 'quiz' | 'summary'>('config');
  const [loading, setLoading] = useState(false);
  const [allQuestions, setAllQuestions] = useState<PracticeQuestion[]>([]);

  // Configuration state
  const [selectedUnitId, setSelectedUnitId] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [questionCountType, setQuestionCountType] = useState<'10' | '20' | '40' | 'all' | 'infinite'>('20');
  const [showKanji, setShowKanji] = useState<boolean>(true);

  // Quiz running state
  const [quizQuestions, setQuizQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [wrongAnswers, setWrongAnswers] = useState<{ question: PracticeQuestion; userSelected: number }[]>([]);
  const [isInfiniteMode, setIsInfiniteMode] = useState<boolean>(false);
  const [infiniteCount, setInfiniteCount] = useState<number>(0);

  // Load lesson questions whenever modal opens or lessonId changes
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setLoading(true);
    setStep('config');
    setSelectedUnitId(initialUnitId || 'all');
    setSelectedFormat('all');
    setQuestionCountType('20');

    loadLessonPractice(lessonId)
      .then((data) => {
        if (mounted) {
          setAllQuestions(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load practice questions for lesson', lessonId, err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, lessonId, initialUnitId]);

  // Summarize units present in this lesson
  const unitSummaries: UnitPracticeSummary[] = useMemo(() => {
    if (!allQuestions.length) return [];
    const baseSummary = summarizeLessonUnits(allQuestions);
    // Enrich with title from KNOWLEDGE_UNITS
    return baseSummary.map((sum) => {
      const match = KNOWLEDGE_UNITS.find((u) => u.id === sum.unitId);
      return {
        ...sum,
        title: match ? match.title : sum.unitId,
      };
    });
  }, [allQuestions]);

  // Filter available questions based on config
  const filteredQuestions = useMemo(() => {
    let pool = allQuestions;
    if (selectedUnitId !== 'all') {
      pool = pool.filter((q) => q.unitId === selectedUnitId);
    }
    if (selectedFormat !== 'all') {
      pool = pool.filter((q) => q.format === selectedFormat);
    }
    return pool;
  }, [allQuestions, selectedUnitId, selectedFormat]);

  // Formats available under currently selected unit
  const availableFormats = useMemo(() => {
    if (selectedUnitId === 'all') {
      const set = new Map<string, string>();
      allQuestions.forEach((q) => set.set(q.format, q.formatLabel));
      return Array.from(set.entries()).map(([id, label]) => ({ id, label }));
    }
    const unitSum = unitSummaries.find((u) => u.unitId === selectedUnitId);
    return unitSum ? unitSum.formats : [];
  }, [allQuestions, selectedUnitId, unitSummaries]);

  // Check if current selected unit supports infinite generation
  const supportsInfinite = useMemo(() => {
    if (selectedUnitId === 'all') return false;
    return (
      selectedUnitId.includes('num_') ||
      selectedUnitId.includes('counter_') ||
      selectedUnitId.includes('verb_') ||
      selectedUnitId.includes('adj_')
    );
  }, [selectedUnitId]);

  // Start Quiz Handler
  const handleStartQuiz = useCallback((customPool?: PracticeQuestion[]) => {
    const pool = customPool || filteredQuestions;
    if (!pool.length && questionCountType !== 'infinite') return;

    if (questionCountType === 'infinite' && supportsInfinite) {
      setIsInfiniteMode(true);
      setInfiniteCount(0);
      setScore(0);
      setWrongAnswers([]);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);

      // Generate first question
      const firstQ = generateQuestionForUnit(selectedUnitId, lessonId) || pool[0];
      setQuizQuestions([firstQ]);
      setStep('quiz');
      return;
    }

    setIsInfiniteMode(false);
    const shuffled = shuffleArray(pool);
    let targetCount = pool.length;
    if (questionCountType === '10') targetCount = Math.min(10, pool.length);
    else if (questionCountType === '20') targetCount = Math.min(20, pool.length);
    else if (questionCountType === '40') targetCount = Math.min(40, pool.length);

    setQuizQuestions(shuffled.slice(0, targetCount));
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setWrongAnswers([]);
    setStep('quiz');
  }, [filteredQuestions, questionCountType, supportsInfinite, selectedUnitId, lessonId]);

  // Current Question
  const currentQuestion = quizQuestions[currentIndex];

  // Option Click Handler
  const handleSelectOption = (idx: number) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQuestion.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      setWrongAnswers((prev) => [...prev, { question: currentQuestion, userSelected: idx }]);
    }
  };

  // Next Question Handler
  const handleNextQuestion = () => {
    if (isInfiniteMode) {
      setInfiniteCount((prev) => prev + 1);
      const nextQ = generateQuestionForUnit(selectedUnitId, lessonId);
      if (nextQ) {
        setQuizQuestions([nextQ]);
        setSelectedOption(null);
        setIsAnswered(false);
      }
      return;
    }

    if (currentIndex + 1 < quizQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Finish Quiz & Save Results
      setStep('summary');
      try {
        const historyItem = {
          lessonId,
          unitId: selectedUnitId,
          score,
          total: quizQuestions.length,
          timestamp: Date.now(),
        };
        const prevHistory = JSON.parse(localStorage.getItem('fundamentals_practice_history') || '[]');
        localStorage.setItem(
          'fundamentals_practice_history',
          JSON.stringify([historyItem, ...prevHistory].slice(0, 50))
        );
      } catch {
        // ignore localStorage errors
      }
    }
  };

  // Determine if audio is safe to play before answering
  const isAudioSafe = useMemo(() => {
    if (!currentQuestion) return false;
    // Reading quizzes or number reading tests reveal the answer if spoken
    const unsafeFormats = ['num_to_reading', 'age_counter', 'reading_to_num', 'kanji_reading'];
    if (unsafeFormats.includes(currentQuestion.format)) {
      return isAnswered; // only safe AFTER answered
    }
    return true;
  }, [currentQuestion, isAnswered]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* ================= MODAL HEADER ================= */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-xs">
              {lessonId}
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                Ôn tập Kiến thức Nền tảng — Bài {lessonId}
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {allQuestions.length} câu hỏi
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Luyện tập sâu theo từng loại kiến thức, ngữ pháp, số đếm & đơn vị
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* ================= MODAL BODY ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-400">Đang nạp ngân hàng câu hỏi Bài {lessonId}...</p>
            </div>
          ) : step === 'config' ? (
            /* ================= 1. CONFIGURATION SCREEN ================= */
            <div className="space-y-6">
              {/* Unit Selector Tabs */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  1. Chọn đơn vị kiến thức cần ôn:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUnitId('all');
                      setSelectedFormat('all');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      selectedUnitId === 'all'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-slate-100">
                        🌟 Tất cả đơn vị kiến thức Bài {lessonId}
                      </div>
                      <div className="text-[11px] text-slate-400">Trộn ngẫu nhiên mọi dạng của bài</div>
                    </div>
                    <span className="text-xs font-black px-2 py-1 rounded-lg bg-indigo-600 text-white">
                      {allQuestions.length} câu
                    </span>
                  </button>

                  {unitSummaries.map((unit) => (
                    <button
                      key={unit.unitId}
                      type="button"
                      onClick={() => {
                        setSelectedUnitId(unit.unitId);
                        setSelectedFormat('all');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        selectedUnitId === unit.unitId
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                          {unit.title}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {unit.formats.length} dạng bài tập chuyên sâu
                        </div>
                      </div>
                      <span className="text-xs font-black px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                        {unit.count} câu
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Format Filter Chips */}
              {availableFormats.length > 1 && (
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    2. Lọc định dạng câu hỏi (Tùy chọn):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedFormat('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedFormat === 'all'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      Tất cả định dạng
                    </button>
                    {availableFormats.map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setSelectedFormat(fmt.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedFormat === fmt.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Session Length / Question Count Selector */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  3. Thời lượng phiên ôn tập:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: '10', label: '10 câu', desc: '⚡ 3 phút nhanh' },
                    { id: '20', label: '20 câu', desc: '🎯 7 phút chuẩn' },
                    { id: '40', label: '40 câu', desc: '🔥 15 phút cày sâu' },
                    { id: 'all', label: `Tất cả (${filteredQuestions.length})`, desc: '📚 Làm trọn vẹn' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setQuestionCountType(opt.id as any)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        questionCountType === opt.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-black">{opt.label}</div>
                      <div className={`text-[10px] mt-0.5 ${questionCountType === opt.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Infinite Generator Option for Rule-based Units */}
                {supportsInfinite && (
                  <button
                    type="button"
                    onClick={() => setQuestionCountType('infinite')}
                    className={`mt-2 w-full p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      questionCountType === 'infinite'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-base">♾️</span>
                      <div className="text-left">
                        <div className="text-xs font-black">Luyện tập không giới hạn (Quy tắc sinh ngẫu nhiên)</div>
                        <div className={`text-[10px] ${questionCountType === 'infinite' ? 'text-amber-100' : 'text-amber-700/80 dark:text-amber-400'}`}>
                          Sinh câu hỏi tự động với trọng số biến âm & số đặc biệt x3, làm đến khi dừng
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-white/20">
                      Vô tận
                    </span>
                  </button>
                )}
              </div>

              {/* Kanji Toggle Option */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                    Hiển thị chữ Hán (Kanji song song)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Bật chữ Hán kèm Hiragana để quen mặt chữ như sách Minna
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKanji(!showKanji)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    showKanji ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showKanji ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleStartQuiz()}
                disabled={filteredQuestions.length === 0 && questionCountType !== 'infinite'}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                🚀 Bắt đầu luyện tập{' '}
                {questionCountType === 'infinite'
                  ? '(Vô hạn câu)'
                  : `(${Math.min(
                      questionCountType === 'all'
                        ? filteredQuestions.length
                        : parseInt(questionCountType, 10),
                      filteredQuestions.length
                    )} câu)`}
              </button>
            </div>
          ) : step === 'quiz' && currentQuestion ? (
            /* ================= 2. QUIZ SCREEN ================= */
            <div className="space-y-4">
              {/* Quiz Progress Header */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-black">
                    {isInfiniteMode ? `Câu ${infiniteCount + 1}` : `Câu ${currentIndex + 1} / ${quizQuestions.length}`}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                    {currentQuestion.formatLabel}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">
                    ✓ {score} đúng
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowKanji(!showKanji)}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                  >
                    {showKanji ? 'Kanji: BẬT' : 'Kanji: TẮT'}
                  </button>
                </div>
              </div>

              {/* Progress bar (hidden in infinite mode) */}
              {!isInfiniteMode && (
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                    style={{
                      width: `${((currentIndex + 1) / quizQuestions.length) * 100}%`,
                    }}
                  />
                </div>
              )}

              {/* Question Card */}
              <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    {showKanji && currentQuestion.question_kanji ? (
                      <>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                          {currentQuestion.question_kanji}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {currentQuestion.question_kana}
                        </p>
                      </>
                    ) : (
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                        {currentQuestion.question_kana}
                      </h3>
                    )}
                  </div>

                  {/* Audio Button with Security Protection */}
                  {currentQuestion.audioText && (
                    <button
                      type="button"
                      disabled={!isAudioSafe}
                      onClick={() => speakTTS(currentQuestion.audioText!)}
                      title={isAudioSafe ? 'Nghe phát âm' : 'Trả lời câu hỏi để mở khóa phát âm'}
                      className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                        isAudioSafe
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-95'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <span className="text-base">🔊</span>
                    </button>
                  )}
                </div>

                {!isAudioSafe && (
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <span>🔒</span>
                    <span>Phát âm bị khóa tạm thời đối với bài kiểm tra đọc để tránh lộ đáp án.</span>
                  </div>
                )}
              </div>

              {/* 4 Interactive Option Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentQuestion.options.map((option, idx) => {
                  let btnStyle =
                    'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30';
                  let icon = <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-black flex items-center justify-center text-slate-500">{String.fromCharCode(65 + idx)}</span>;

                  if (isAnswered) {
                    if (idx === currentQuestion.correctIndex) {
                      btnStyle = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20';
                      icon = <span className="w-5 h-5 rounded-md bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">✓</span>;
                    } else if (idx === selectedOption) {
                      btnStyle = 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20';
                      icon = <span className="w-5 h-5 rounded-md bg-rose-600 text-white text-[11px] font-black flex items-center justify-center">✕</span>;
                    } else {
                      btnStyle = 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm transition-all duration-150 flex items-center justify-between gap-2.5 cursor-pointer disabled:cursor-default ${btnStyle}`}
                    >
                      <span className="flex-1 leading-snug">{option}</span>
                      <span className="shrink-0">{icon}</span>
                    </button>
                  );
                })}
              </div>

              {/* Detailed Explanation Card (Appears after answer) */}
              {isAnswered && (
                <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-black text-amber-900 dark:text-amber-200">
                      <span>💡</span>
                      <span>Giải thích chi tiết & Quy tắc ngữ pháp:</span>
                    </div>

                    {currentQuestion.audioText && (
                      <button
                        type="button"
                        onClick={() => speakTTS(currentQuestion.audioText!)}
                        className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>🔊 Nghe câu mẫu</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed font-medium">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Bottom Action Button */}
              {isAnswered && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-95 flex items-center space-x-2 cursor-pointer"
                  >
                    <span>
                      {isInfiniteMode
                        ? 'Câu tiếp theo ➔'
                        : currentIndex + 1 < quizQuestions.length
                        ? 'Câu tiếp theo ➔'
                        : 'Xem kết quả 🎉'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ================= 3. SUMMARY SCREEN ================= */
            <div className="space-y-6 text-center py-4">
              {/* Score Badge */}
              <div className="space-y-2">
                <span className="text-4xl">
                  {score / quizQuestions.length >= 0.8
                    ? '🎉'
                    : score / quizQuestions.length >= 0.5
                    ? '👍'
                    : '💪'}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {score / quizQuestions.length >= 0.8
                    ? 'Xuất sắc! Bạn đã nắm rất vững kiến thức này!'
                    : score / quizQuestions.length >= 0.5
                    ? 'Làm tốt lắm! Hãy củng cố lại các câu sai nhé.'
                    : 'Hãy kiên trì! Xem lại các lỗi sai bên dưới để ghi nhớ sâu hơn.'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hoàn thành phiên ôn tập Kiến thức Nền tảng Bài {lessonId}
                </p>
              </div>

              {/* Stats Highlights */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400">
                    {score} / {quizQuestions.length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">Số câu đúng</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {Math.round((score / (quizQuestions.length || 1)) * 100)}%
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">Tỷ lệ chính xác</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400">
                    {wrongAnswers.length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">Câu cần sửa</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                {wrongAnswers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleStartQuiz(wrongAnswers.map((w) => w.question))}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5"
                  >
                    <span>🔄</span>
                    <span>Luyện lại {wrongAnswers.length} câu sai</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleStartQuiz()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5"
                >
                  <span>🔁</span>
                  <span>Luyện lại bộ này</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('config')}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-black text-xs rounded-xl transition-all cursor-pointer"
                >
                  ⚙️ Cấu hình lại
                </button>
              </div>

              {/* Wrong Answers Review List */}
              {wrongAnswers.length > 0 && (
                <div className="text-left pt-4 space-y-3 max-w-2xl mx-auto border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Danh sách {wrongAnswers.length} câu cần lưu ý:
                  </h4>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {wrongAnswers.map((w, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
                      >
                        <div className="font-black text-slate-900 dark:text-slate-100">
                          [Câu {idx + 1}] {w.question.question_kanji || w.question.question_kana}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="text-rose-600 dark:text-rose-400 font-bold">
                            ✕ Bạn chọn: {w.question.options[w.userSelected]}
                          </div>
                          <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                            ✓ Đáp án: {w.question.options[w.question.correctIndex]}
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-950 p-2 rounded-xl">
                          💡 {w.question.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
