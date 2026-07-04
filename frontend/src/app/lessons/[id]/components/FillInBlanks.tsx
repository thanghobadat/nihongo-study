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

interface FillInBlanksProps {
  vocabItems: VocabItem[];
  grammarItems: GrammarItem[];
}

interface BlankQuestion {
  originalSentence: string;
  romaji: string;
  meaning: string;
  blankWord: string;
  sentenceWithBlank: string; // ví dụ: "わたしは ___ です。"
  options: string[];
}

export default function FillInBlanks({ vocabItems, grammarItems }: FillInBlanksProps) {
  const [questions, setQuestions] = useState<BlankQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Sinh câu hỏi điền vào chỗ trống bằng cách đục lỗ từ vựng trong câu ví dụ
  const generateQuestions = useCallback(() => {
    const list: BlankQuestion[] = [];

    // Lấy tất cả các câu ví dụ từ ngữ pháp
    const sentences: { japanese: string; romaji: string; vietnamese: string }[] = [];
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
        sentences.push(...examples);
      } else if (g.japanese_example) {
        sentences.push({
          japanese: g.japanese_example,
          romaji: g.romaji_example || '',
          vietnamese: g.example_meaning
        });
      }
    });

    if (sentences.length === 0 || vocabItems.length === 0) return;

    // Duyệt qua từng câu ví dụ để tìm xem có chứa từ vựng nào không
    sentences.forEach(s => {
      // Sắp xếp từ vựng theo chiều dài giảm dần để tránh đục lỗ từ ngắn hơn trước
      const sortedVocab = [...vocabItems].sort((a, b) => {
        const lenA = a.kanji_word?.length || a.hiragana.length;
        const lenB = b.kanji_word?.length || b.hiragana.length;
        return lenB - lenA;
      });

      for (const vocab of sortedVocab) {
        const wordToFind = vocab.kanji_word && s.japanese.includes(vocab.kanji_word)
          ? vocab.kanji_word
          : (s.japanese.includes(vocab.hiragana) ? vocab.hiragana : null);

        if (wordToFind) {
          // Tìm thấy từ vựng trong câu! Tiến hành đục lỗ
          const parts = s.japanese.split(wordToFind);
          // Để đảm bảo chỉ đục lỗ 1 từ đầu tiên khớp
          const sentenceWithBlank = parts[0] + " 【 ___ 】 " + parts.slice(1).join(wordToFind);

          // Tạo 3 đáp án nhiễu từ các từ vựng khác
          const otherVocab = vocabItems.filter(v => v.id !== vocab.id);
          const incorrectOptions = otherVocab.map(v => v.kanji_word || v.hiragana);
          const shuffledIncorrect = [...new Set(incorrectOptions)].sort(() => Math.random() - 0.5).slice(0, 3);
          
          while (shuffledIncorrect.length < 3) {
            shuffledIncorrect.push("Đáp án mẫu " + (shuffledIncorrect.length + 1));
          }

          const options = [...shuffledIncorrect, wordToFind].sort(() => Math.random() - 0.5);

          list.push({
            originalSentence: s.japanese,
            romaji: s.romaji,
            meaning: s.vietnamese,
            blankWord: wordToFind,
            sentenceWithBlank,
            options
          });

          break; // Chỉ đục lỗ 1 từ cho mỗi câu ví dụ
        }
      }
    });

    if (list.length === 0) return;

    // Tráo và chọn tối đa 10 câu
    const shuffledQuestions = list.sort(() => Math.random() - 0.5).slice(0, Math.min(10, list.length));

    setQuestions(shuffledQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  }, [vocabItems, grammarItems]);

  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const q = questions[currentIndex];
    if (option === q.blankWord) {
      setScore(prev => prev + 10);
      playAudioWithFallback(q.originalSentence, q.originalSentence); // Phát âm câu hoàn chỉnh nếu đúng
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
        <p className="text-slate-500 dark:text-slate-400">Không tìm thấy từ vựng tương ứng trong các câu ví dụ để tạo bài tập điền từ.</p>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center max-w-xl mx-auto shadow-sm">
        <div className="w-20 h-20 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center text-4xl mb-6">
          🌟
        </div>
        <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">Hoàn thành Điền từ!</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Điểm số của bạn: <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">{score}</span> / {questions.length * 10}
        </p>
        <button
          onClick={generateQuestions}
          className="px-6 py-3 bg-[#b5179e] hover:bg-[#7209b7] text-white font-bold rounded-xl active:scale-[0.98] transition-all"
        >
          🔄 Làm lại vòng mới
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
        <span className="text-indigo-500 font-bold">✨ Điểm: {score}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#b5179e] to-[#7209b7] transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-6 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-center mb-8">
        <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-wide mb-4 leading-relaxed">
          {currentQuestion.sentenceWithBlank}
        </h4>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-1">{currentQuestion.romaji}</p>
        <p className="text-base text-slate-500 dark:text-slate-400 font-medium">{currentQuestion.meaning}</p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {currentQuestion.options.map((option, idx) => {
          let btnClass = "p-4 text-center border rounded-xl font-bold transition-all duration-150 ";
          
          if (!isAnswered) {
            btnClass += "border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 dark:hover:border-indigo-800 text-slate-700 dark:text-slate-200 active:scale-[0.97]";
          } else {
            if (option === currentQuestion.blankWord) {
              btnClass += "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400";
            } else if (selectedOption === option) {
              btnClass += "border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400";
            } else {
              btnClass += "border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-700 opacity-50";
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleSelectOption(option)}
              className={btnClass}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Action Footer */}
      {isAnswered && (
        <div className="flex gap-4">
          <button
            onClick={() => playAudioWithFallback(currentQuestion.originalSentence, currentQuestion.originalSentence)}
            className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl active:scale-[0.98] transition-all text-center"
          >
            🔊 Nghe câu đọc
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-2xl active:scale-[0.98] transition-all text-center"
          >
            {currentIndex + 1 < questions.length ? 'Câu tiếp theo ➔' : 'Xem kết quả ➔'}
          </button>
        </div>
      )}
    </div>
  );
}
