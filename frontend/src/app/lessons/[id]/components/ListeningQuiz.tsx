'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
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
  const params = useParams();
  const lessonId = params ? (params.id as string) : 'unknown';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // New States for Speedrun Mode
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [baseTime, setBaseTime] = useState<number>(10);
  const [baseTimeInput, setBaseTimeInput] = useState<string>('10');
  const [maxTime, setMaxTime] = useState<number>(10);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [highScore, setHighScore] = useState<number>(0);

  const timerRef = useRef<any>(null);
  const scoreRef = useRef<number>(0);

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

    // Tráo ngẫu nhiên pool và sử dụng toàn bộ số câu (không giới hạn 10 câu)
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    const selectedPool = shuffledPool;

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
    scoreRef.current = 0;
    setStreak(0);
    setQuizFinished(false);

    // Nạp highScore từ localStorage
    const savedHigh = localStorage.getItem(`listening_quiz_high_score_${lessonId}`);
    if (savedHigh) {
      setHighScore(parseInt(savedHigh) || 0);
    } else {
      setHighScore(0);
    }
  }, [vocabItems, grammarItems, lessonId]);

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

  // Tự động phát âm khi chuyển câu hỏi (chỉ khi đang chơi game)
  useEffect(() => {
    if (gameStarted && questions.length > 0 && !quizFinished && !isAnswered) {
      const timer = setTimeout(() => {
        playCurrentAudio();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, questions, quizFinished, isAnswered, playCurrentAudio, gameStarted]);

  // Bộ đếm ngược thời gian
  useEffect(() => {
    if (!gameStarted || quizFinished) return;

    // Reset timeLeft về maxTime hiện tại của câu
    setTimeLeft(maxTime);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, maxTime - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        handleGameOver();
      }
    }, 50);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex, gameStarted, quizFinished, maxTime]);

  const handleGameOver = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setQuizFinished(true);
    setGameStarted(false);

    // Lưu kỷ lục mới nếu có
    const finalScore = scoreRef.current;
    const savedHigh = localStorage.getItem(`listening_quiz_high_score_${lessonId}`);
    const currentHigh = savedHigh ? parseInt(savedHigh) || 0 : 0;
    if (finalScore > currentHigh) {
      setHighScore(finalScore);
      localStorage.setItem(`listening_quiz_high_score_${lessonId}`, finalScore.toString());
    }
  }, [lessonId]);

  const startGame = () => {
    setGameStarted(true);
    setQuizFinished(false);
    setScore(0);
    scoreRef.current = 0;
    setStreak(0);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setMaxTime(baseTime);
    setTimeLeft(baseTime);
  };

  const handleSelectOption = (option: string) => {
    if (isAnswered || !gameStarted) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const q = questions[currentIndex];
    if (option === q.correctAnswer) {
      const nextScore = scoreRef.current + 1;
      scoreRef.current = nextScore;
      setScore(nextScore);

      const nextStreak = streak + 1;
      setStreak(nextStreak);

      playAudioWithFallback(q.audioText, q.audioText);

      // Giảm 10% thời gian hiện tại sau mỗi 3 câu đúng liên tiếp
      let nextMaxTime = maxTime;
      if (nextStreak > 0 && nextStreak % 3 === 0) {
        nextMaxTime = Math.max(2, maxTime * 0.9);
      }

      setTimeout(() => {
        if (currentIndex + 1 < questions.length) {
          setMaxTime(nextMaxTime);
          setCurrentIndex(prev => prev + 1);
          setSelectedOption(null);
          setIsAnswered(false);
        } else {
          handleGameOver();
        }
      }, 1000);
    } else {
      setStreak(0);
      setTimeout(() => {
        handleGameOver();
      }, 1000);
    }
  };

  // Hủy bộ đếm khi unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center">
        <p className="text-slate-500 dark:text-slate-400">Không có đủ dữ liệu từ vựng/ví dụ để tạo bài trắc nghiệm nghe.</p>
      </div>
    );
  }

  // 1. Màn hình Bắt đầu (Start Screen)
  if (!gameStarted && !quizFinished) {
    return (
      <div className="w-full max-w-xl mx-auto p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm text-center space-y-6 animate-fade-in">
        <div className="space-y-2">
          <span className="text-5xl block animate-bounce">🎧</span>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">Luyện Nghe Phản Xạ</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
            Nghe phát âm tiếng Nhật và chọn nghĩa tiếng Việt chính xác. Mỗi 3 câu đúng liên tiếp sẽ giảm 10% thời gian suy nghĩ! Trả lời sai hoặc hết giờ sẽ kết thúc trò chơi.
          </p>
        </div>

        {/* Base Time Settings */}
        <div className="space-y-3 max-w-sm mx-auto">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Thời gian suy nghĩ cơ bản (giây)</span>
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            {/* Quick buttons */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex w-full sm:w-auto">
              {[5, 10, 15, 20].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setBaseTime(t);
                    setBaseTimeInput(t.toString());
                  }}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    baseTime === t
                      ? 'bg-blue-600 text-white shadow-md font-black'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
            {/* Numeric input */}
            <div className="relative w-full sm:w-28">
              <input
                type="number"
                min="2"
                max="60"
                placeholder="Tự nhập..."
                value={baseTimeInput}
                onChange={(e) => setBaseTimeInput(e.target.value)}
                onBlur={() => {
                  const val = parseInt(baseTimeInput);
                  if (isNaN(val) || val < 2) {
                    setBaseTime(10);
                    setBaseTimeInput("10");
                  } else if (val > 60) {
                    setBaseTime(60);
                    setBaseTimeInput("60");
                  } else {
                    setBaseTime(val);
                    setBaseTimeInput(val.toString());
                  }
                }}
                className="w-full text-center bg-slate-50 dark:bg-slate-950/60 text-slate-800 dark:text-slate-200 font-bold text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 placeholder:text-slate-400 dark:placeholder:text-slate-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 pointer-events-none">giây</span>
            </div>
          </div>
        </div>

        {/* High Score Panel */}
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 inline-block min-w-[200px]">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Kỷ lục hiện tại</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{highScore} điểm</span>
        </div>

        <div>
          <button
            onClick={startGame}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] active:scale-95 cursor-pointer"
          >
            Bắt đầu chơi ngay 🚀
          </button>
        </div>
      </div>
    );
  }

  // 2. Màn hình Kết thúc (Game Over Screen)
  if (quizFinished) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center max-w-xl mx-auto shadow-sm animate-fade-in">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center text-4xl mb-6">
          🏁
        </div>
        <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">Trò chơi kết thúc!</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mb-6 leading-relaxed">
          Bạn đã trả lời chưa chính xác hoặc hết thời gian suy nghĩ. Hãy thử lại để thiết lập kỷ lục mới!
        </p>

        <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 w-full mb-6 max-w-sm">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block mb-1">Điểm đạt được</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{score}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block mb-1">Kỷ lục hiện tại</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{highScore}</span>
          </div>
        </div>

        <button
          onClick={startGame}
          className="px-6 py-3 bg-[#b5179e] hover:bg-[#7209b7] text-white font-bold rounded-xl active:scale-[0.98] transition-all"
        >
          🔄 Luyện tập lại
        </button>
      </div>
    );
  }

  // 3. Màn hình Chơi (Playing Screen)
  const currentQuestion = questions[currentIndex];

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm animate-fade-in">
      {/* Progress Header */}
      <div className="flex justify-between items-center mb-6 text-sm text-slate-400 dark:text-slate-500">
        <span>Câu số {currentIndex + 1} / {questions.length}</span>
        <div className="flex items-center gap-4">
          <span className="text-blue-600 dark:text-blue-400 font-bold">✨ Điểm: {score}</span>
          {streak > 1 && (
            <span className="text-amber-500 font-bold">🔥 Streak: {streak}</span>
          )}
        </div>
      </div>

      {/* Timer Progress Bar */}
      <div className="space-y-1.5 mb-8">
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold">
          <span>Thời gian còn lại</span>
          <span className={timeLeft <= 3 ? 'text-red-600 dark:text-red-400 font-black animate-pulse' : ''}>
            {timeLeft.toFixed(1)}s
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
          <div 
            className={`h-full transition-all duration-100 ${
              timeLeft <= 3
                ? 'bg-gradient-to-r from-red-500 to-rose-600 animate-pulse'
                : 'bg-gradient-to-r from-[#b5179e] to-[#7209b7]'
            }`}
            style={{ width: `${(timeLeft / maxTime) * 100}%` }}
          />
        </div>
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
      <div className="grid grid-cols-1 gap-3.5">
        {currentQuestion.options.map((option, idx) => {
          let btnClass = "w-full p-4 text-left border rounded-2xl font-medium transition-all duration-200 ";
          
          if (!isAnswered) {
            btnClass += "border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/10 dark:hover:bg-blue-950/10 dark:hover:border-blue-800 text-slate-700 dark:text-slate-200 active:scale-[0.99] cursor-pointer";
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

      {/* Cancel Button */}
      <div className="text-center pt-6">
        <button
          onClick={handleGameOver}
          className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95"
        >
          Dừng trò chơi
        </button>
      </div>
    </div>
  );
}
