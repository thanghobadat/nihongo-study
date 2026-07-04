'use client';

import { useState, useEffect, useCallback } from 'react';
import { playAudioWithFallback } from '../../../utils/audioHelper';

interface VocabItem {
  id: number;
  hiragana: string;
  romaji: string;
  kanji_word?: string;
  vietnamese_meaning: string;
}

interface GrammarExample {
  japanese: string;
  romaji: string;
  vietnamese: string;
}

interface GrammarItem {
  id: number;
  title: string;
  meaning: string;
  japanese_example: string;
  example_meaning: string;
  romaji_example?: string;
  examples_json?: GrammarExample[] | string;
}

interface ListeningQuizProps {
  vocabItems: VocabItem[];
  grammarItems: GrammarItem[];
}

interface Question {
  audioText: string;
  romaji: string;
  correctAnswer: string;
  options: string[];
}

export default function ListeningQuiz({ vocabItems, grammarItems }: ListeningQuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Tạo câu hỏi từ danh sách từ vựng và câu ví dụ
  const generateQuestions = useCallback(() => {
    const pool: { audioText: string; romaji: string; meaning: string }[] = [];

    // 1. Thêm từ vựng vào pool
    vocabItems.forEach(v => {
      pool.push({
        audioText: v.kanji_word || v.hiragana,
        romaji: v.romaji,
        meaning: v.vietnamese_meaning
      });
    });

    // 2. Thêm câu ví dụ ngữ pháp vào pool
    grammarItems.forEach(g => {
      let examples: GrammarExample[] = [];
      if (g.examples_json) {
        try {
          examples = typeof g.examples_json === 'string' 
            ? JSON.parse(g.examples_json) 
            : g.examples_json;
        } catch (e) {
          examples = [];
        }
      }
      
      if (examples.length > 0) {
        examples.forEach(exp => {
          pool.push({
            audioText: exp.japanese,
            romaji: exp.romaji,
            meaning: exp.vietnamese
          });
        });
      } else if (g.japanese_example) {
        pool.push({
          audioText: g.japanese_example,
          romaji: g.romaji_example || '',
          meaning: g.example_meaning
        });
      }
    });

    if (pool.length === 0) return;

    // Tráo ngẫu nhiên pool và chọn tối đa 10 câu
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    const selectedPool = shuffledPool.slice(0, Math.min(10, shuffledPool.length));

    // Lấy tất cả nghĩa tiếng Việt làm đáp án nhiễu
    const allMeanings = pool.map(p => p.meaning);

    const generated: Question[] = selectedPool.map(item => {
      const correct = item.meaning;
      // Lọc các đáp án nhiễu khác đáp án đúng
      const incorrectOptions = allMeanings.filter(m => m !== correct);
      // Tráo và chọn 3 đáp án nhiễu
      const shuffledIncorrect = [...new Set(incorrectOptions)].sort(() => Math.random() - 0.5).slice(0, 3);
      
      // Nếu không đủ đáp án nhiễu, điền thêm placeholder
      while (shuffledIncorrect.length < 3) {
        shuffledIncorrect.push("Đáp án mẫu " + (shuffledIncorrect.length + 1));
      }

      const options = [...shuffledIncorrect, correct].sort(() => Math.random() - 0.5);

      return {
        audioText: item.audioText,
        romaji: item.romaji,
        correctAnswer: correct,
        options
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setQuizFinished(false);
  }, [vocabItems, grammarItems]);

  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  const playCurrentAudio = useCallback(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      const q = questions[currentIndex];
      // Phát âm text tiếng Nhật
      playAudioWithFallback(q.audioText, q.audioText);
    }
  }, [questions, currentIndex]);

  // Tự động phát âm khi chuyển câu hỏi
  useEffect(() => {
    if (questions.length > 0 && !quizFinished && !isAnswered) {
      const timer = setTimeout(() => {
        playCurrentAudio();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, questions, quizFinished, isAnswered, playCurrentAudio]);

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const q = questions[currentIndex];
    if (option === q.correctAnswer) {
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center">
        <p className="text-slate-500 dark:text-slate-400">Không có đủ dữ liệu từ vựng/ví dụ để tạo bài trắc nghiệm nghe.</p>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center max-w-xl mx-auto shadow-sm">
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-4xl mb-6">
          🏆
        </div>
        <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">Hoàn thành Trắc nghiệm Nghe!</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Điểm số của bạn: <span className="text-emerald-500 font-bold text-xl">{score}</span> / {questions.length * 10}
        </p>
        <button
          onClick={generateQuestions}
          className="px-6 py-3 bg-[#b5179e] hover:bg-[#7209b7] text-white font-bold rounded-xl active:scale-[0.98] transition-all"
        >
          🔄 Luyện tập lại
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
      {/* Progress Header */}
      <div className="flex justify-between items-center mb-6 text-sm text-slate-400 dark:text-slate-500">
        <span>Câu hỏi {currentIndex + 1} / {questions.length}</span>
        <div className="flex items-center gap-4">
          <span className="text-emerald-500 font-bold">✨ Điểm: {score}</span>
          {streak > 1 && (
            <span className="text-amber-500 font-bold">🔥 Streak: {streak}</span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#b5179e] to-[#7209b7] transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Audio Play Area */}
      <div className="flex flex-col items-center justify-center mb-8">
        <button
          onClick={playCurrentAudio}
          className="w-24 h-24 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all text-4xl"
          title="Nghe phát âm"
        >
          🔊
        </button>
        <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Bấm nút để nghe lại</span>
        {isAnswered && (
          <span className="mt-2 text-lg font-medium text-slate-400 dark:text-slate-500 select-all">
            {currentQuestion.romaji}
          </span>
        )}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-3.5 mb-8">
        {currentQuestion.options.map((option, idx) => {
          let btnClass = "w-full p-4 text-left border rounded-2xl font-medium transition-all duration-200 ";
          
          if (!isAnswered) {
            btnClass += "border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 dark:hover:border-indigo-800 text-slate-700 dark:text-slate-200 active:scale-[0.99]";
          } else {
            // Đúng/Sai styles
            if (option === currentQuestion.correctAnswer) {
              btnClass += "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold";
            } else if (selectedOption === option) {
              btnClass += "border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400";
            } else {
              btnClass += "border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-60";
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleSelectOption(option)}
              className={btnClass}
            >
              <span className="mr-3 text-slate-400 dark:text-slate-500 font-bold">{idx + 1}.</span>
              {option}
            </button>
          );
        })}
      </div>

      {/* Action Footer */}
      {isAnswered && (
        <button
          onClick={handleNext}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-2xl active:scale-[0.98] transition-all text-center shadow-lg dark:shadow-none"
        >
          {currentIndex + 1 < questions.length ? 'Câu tiếp theo ➔' : 'Xem kết quả ➔'}
        </button>
      )}
    </div>
  );
}
