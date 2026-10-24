'use client';

import React, { useState } from 'react';
import { QuizQuestion } from '../data/fundamentalsQuizData';

interface LessonQuickQuizProps {
  lessonId: number;
  questions: QuizQuestion[];
  isOpen: boolean;
  onClose: () => void;
}

export default function LessonQuickQuiz({
  lessonId,
  questions,
  isOpen,
  onClose,
}: LessonQuickQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);
    if (idx === currentQ.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">⚡</span>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
              Ôn Nhanh Kiến Thức — Bài {lessonId}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Chưa có câu hỏi trắc nghiệm riêng cho bài này. Hãy xem phần lý thuyết chi tiết nhé!
          </div>
        ) : !isCompleted ? (
          <div className="space-y-4">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Câu {currentIndex + 1} / {questions.length}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Đúng: {score}</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="py-1">
              <div className="text-xs uppercase font-bold text-indigo-500 mb-1">
                {currentQ.categoryLabel}
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question}
              </h4>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let btnStyle = 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400';
                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-700 dark:text-red-300 font-bold';
                  } else {
                    btnStyle = 'opacity-40 border-slate-200 dark:border-slate-800';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-5 h-5 rounded-md font-bold text-[10px] flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {isAnswerSubmitted && isCorrect && <span className="text-emerald-600 font-bold">✓</span>}
                    {isAnswerSubmitted && isSelected && !isCorrect && <span className="text-red-600 font-bold">✕</span>}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {isAnswerSubmitted && (
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-xl space-y-1.5 animate-fade-in text-xs">
                <div className="font-bold text-indigo-900 dark:text-indigo-300">
                  💡 Giải thích chi tiết:
                </div>
                <div className="text-indigo-800 dark:text-indigo-200 leading-relaxed text-[11px]">
                  {currentQ.explanation}
                </div>
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                  >
                    {currentIndex < questions.length - 1 ? 'Câu tiếp theo ➔' : 'Xem kết quả'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Score Card */
          <div className="py-4 text-center space-y-4 animate-fade-in">
            <div className="text-4xl">🏆</div>
            <div>
              <h4 className="text-base font-black text-slate-800 dark:text-slate-100">
                Hoàn Thành Ôn Tập Bài {lessonId}!
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Bạn đã trả lời đúng {score} / {questions.length} câu ({Math.round((score / questions.length) * 100)}%).
              </p>
            </div>
            <div className="flex justify-center space-x-2 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                🔄 Luyện lại
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
