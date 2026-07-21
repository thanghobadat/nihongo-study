'use strict';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ReviewTabProps {
  lessonTitle: string;
  reviewData: any;
  reviewLoading: boolean;
  reviewStep: string;
  setReviewStep: any;
  reviewQuestions: any[];
  setReviewQuestions: any;
  reviewAnswers: Record<string, string>;
  setReviewAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  reviewGraded: Record<string, boolean>;
  setReviewGraded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  reviewFeedback: Record<string, string>;
  setReviewFeedback: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  reviewScore: number;
  setReviewScore: React.Dispatch<React.SetStateAction<number>>;
  reviewTotal: number;
  setReviewTotal: React.Dispatch<React.SetStateAction<number>>;
  reviewShowKanji: boolean;
  setReviewShowKanji: (show: boolean) => void;
  loadReviewData: () => void;
  playAudio: any;
  playDialogueAudio: (lines: any[]) => void;
  renderDiff: (userAns: string, correctAns: string) => React.ReactNode;
  selectedLessonId: any;
  calculateAccuracy: (user: string, correct: string) => number;
}

export default function ReviewTab({
  lessonTitle,
  reviewData,
  reviewLoading,
  reviewStep,
  setReviewStep,
  reviewQuestions,
  setReviewQuestions,
  reviewAnswers,
  setReviewAnswers,
  reviewGraded,
  setReviewGraded,
  reviewFeedback,
  setReviewFeedback,
  reviewScore,
  setReviewScore,
  reviewTotal,
  setReviewTotal,
  reviewShowKanji,
  setReviewShowKanji,
  loadReviewData,
  playAudio,
  playDialogueAudio,
  renderDiff,
  selectedLessonId,
  calculateAccuracy,
}: ReviewTabProps) {
  const router = useRouter();
  const [reviewSelectedType, setReviewSelectedType] = useState<string>('translation');
  const [reviewIndex, setReviewIndex] = useState<number>(0);
  const [savedSessions, setSavedSessions] = useState<Record<string, any>>({});
  const [showHistoryTable, setShowHistoryTable] = useState<boolean>(true);

  const storageKey = selectedLessonId ? `nihongo_review_state_lesson_${selectedLessonId}` : `nihongo_review_state_combined`;

  // 1. Tự động nạp danh sách tiến trình các dạng bài từ LocalStorage khi nạp dữ liệu
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedRaw = localStorage.getItem(storageKey);
        if (savedRaw) {
          const map = JSON.parse(savedRaw);
          if (map && typeof map === 'object') {
            setSavedSessions(map);
          } else {
            setSavedSessions({});
          }
        } else {
          setSavedSessions({});
        }
      } catch (err) {
        setSavedSessions({});
      }
    }
  }, [storageKey, reviewData]);

  // 2. Tự động lưu tiến trình của DẠNG BÀI ĐANG CHỌN vào savedSessions và LocalStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined' && (reviewStep === 'test' || reviewStep === 'result') && reviewSelectedType) {
      if (reviewQuestions.length > 0) {
        const typeState = {
          reviewQuestions,
          reviewAnswers,
          reviewGraded,
          reviewFeedback,
          reviewScore,
          reviewTotal,
          reviewIndex,
          reviewStep,
          timestamp: Date.now()
        };
        setSavedSessions(prev => {
          const updated = { ...prev, [reviewSelectedType]: typeState };
          localStorage.setItem(storageKey, JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [reviewQuestions, reviewAnswers, reviewGraded, reviewFeedback, reviewScore, reviewTotal, reviewIndex, reviewStep, reviewSelectedType, storageKey]);

  // 3. Hàm Master Reset xóa sạch cả 4 dạng bài và quay về trang chọn dạng
  const masterResetAll = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
    setSavedSessions({});
    setReviewQuestions([]);
    setReviewAnswers({});
    setReviewGraded({});
    setReviewFeedback({});
    setReviewScore(0);
    setReviewTotal(0);
    setReviewIndex(0);
    setReviewStep('setup');
  };

  // 4. Hàm Reset riêng 1 dạng bài
  const resetSingleType = (type: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedSessions(prev => {
      const updated = { ...prev };
      delete updated[type];
      if (Object.keys(updated).length === 0) {
        if (typeof window !== 'undefined') localStorage.removeItem(storageKey);
      } else {
        if (typeof window !== 'undefined') localStorage.setItem(storageKey, JSON.stringify(updated));
      }
      return updated;
    });
    startFreshType(type);
  };

  // 5. Mở dạng bài tập (Khôi phục nếu có sẵn, hoặc tạo tráo mới từ đầu)
  const startReviewTest = (type: string) => {
    setReviewSelectedType(type);
    if (savedSessions[type] && Array.isArray(savedSessions[type].reviewQuestions) && savedSessions[type].reviewQuestions.length > 0) {
      const saved = savedSessions[type];
      setReviewQuestions(saved.reviewQuestions);
      setReviewAnswers(saved.reviewAnswers || {});
      setReviewGraded(saved.reviewGraded || {});
      setReviewFeedback(saved.reviewFeedback || {});
      setReviewScore(saved.reviewScore || 0);
      setReviewTotal(saved.reviewTotal || 0);
      setReviewIndex(saved.reviewIndex || 0);
      setReviewStep(saved.reviewStep || 'test');
    } else {
      startFreshType(type);
    }
  };

  const startFreshType = (type: string) => {
    setReviewSelectedType(type);
    setReviewIndex(0);
    if (reviewData) {
      let sourceList: any[] = [];
      if (type === 'translation' && Array.isArray(reviewData.translations)) {
        sourceList = reviewData.translations;
      } else if (type === 'dialogue' && Array.isArray(reviewData.dialogues)) {
        sourceList = reviewData.dialogues;
      } else if (type === 'listening' && Array.isArray(reviewData.listenings)) {
        sourceList = reviewData.listenings;
      } else if (type === 'dictation' && Array.isArray(reviewData.dictations)) {
        sourceList = reviewData.dictations;
      }

      const pool = sourceList.map((item: any) => ({
        type,
        originalData: item,
        key: `${type}_${item.id || Math.random()}`
      }));

      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      let totalPoints = 0;
      pool.forEach((q) => {
        if (q.type === 'listening') {
          totalPoints += q.originalData.questions?.length || 0;
        } else {
          totalPoints += 1;
        }
      });

      setReviewQuestions(pool);
      setReviewStep('test');
      setReviewAnswers({});
      setReviewGraded({});
      setReviewFeedback({});
      setReviewScore(0);
      setReviewTotal(totalPoints);
    } else {
      loadReviewData();
    }
  };



  const markAsCorrect = (q: any) => {
    if (!q) return;
    const key = q.key;
    if (q.type === 'translation' || q.type === 'dictation') {
      const wasCorrect = !!reviewGraded[key];
      if (!wasCorrect) {
        setReviewGraded(prev => ({ ...prev, [key]: true }));
        setReviewScore(prev => prev + 1);
      }
    } else if (q.type === 'dialogue') {
      const b1Key = `${key}_b1`;
      const b2Key = `${key}_b2`;
      const b1Was = !!reviewGraded[b1Key];
      const b2Was = !!reviewGraded[b2Key];

      let scoreToAdd = 0;
      if (!b1Was && !b2Was) scoreToAdd = 1;
      else if (!b1Was || !b2Was) scoreToAdd = 0.5;

      setReviewGraded(prev => ({ ...prev, [b1Key]: true, [b2Key]: true }));
      if (scoreToAdd > 0) {
        setReviewScore(prev => prev + scoreToAdd);
      }
    } else if (q.type === 'listening') {
      const current = q.originalData;
      let missingPoints = 0;
      const newGraded: Record<string, boolean> = {};

      current.questions?.forEach((_: any, sIdx: number) => {
        const ansKey = `${key}_q${sIdx}`;
        if (!reviewGraded[ansKey]) {
          missingPoints += 1;
        }
        newGraded[ansKey] = true;
      });

      setReviewGraded(prev => ({ ...prev, ...newGraded }));
      if (missingPoints > 0) {
        setReviewScore(prev => prev + missingPoints);
      }
    }
  };

  const gradeTranslation = (q: any) => {
    const key = q.key;
    if (reviewGraded[key] !== undefined) return;
    
    const current = q.originalData;
    const userAns = (reviewAnswers[key] || '').trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_\`~()?？。、\s]/g, '');
    let isCorrect = false;
    const correctAnswersList = current.correct_answers || current.answers || [];
    correctAnswersList.forEach((ans: string) => {
      const cleanAns = ans.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_\`~()?？.、\s]/g, '');
      if (userAns === cleanAns || (cleanAns.includes(userAns) && userAns.length > 3)) {
        isCorrect = true;
      }
    });
    
    setReviewGraded(prev => ({ ...prev, [key]: isCorrect }));
    setReviewFeedback(prev => ({ ...prev, [key]: `Đáp án đúng: ${correctAnswersList.join(' / ')}` }));
    if (isCorrect) {
      setReviewScore(prev => prev + 1);
    }
  };

  const gradeDialogue = (q: any) => {
    const key1 = `${q.key}_b1`;
    const key2 = `${q.key}_b2`;
    const keyParent = q.key;
    if (reviewGraded[key1] !== undefined) return;

    const current = q.originalData;
    const b1Ans = reviewAnswers[key1];
    const b2Ans = reviewAnswers[key2];

    const b1Correct = current.blanks.blank1.correct === b1Ans;
    const b2Correct = current.blanks.blank2.correct === b2Ans;

    setReviewGraded(prev => ({
      ...prev,
      [key1]: b1Correct,
      [key2]: b2Correct,
      [keyParent]: true
    }));

    let addedScore = 0;
    if (b1Correct && b2Correct) {
      addedScore = 1;
    } else if (b1Correct || b2Correct) {
      addedScore = 0.5;
    }
    setReviewScore(prev => prev + addedScore);
    setReviewFeedback(prev => ({
      ...prev,
      [q.key]: `Đáp án đúng: [1] ${current.blanks.blank1.correct} | [2] ${current.blanks.blank2.correct}`
    }));
  };

  const gradeListening = (q: any) => {
    const keyPrefix = q.key;
    if (reviewGraded[`${keyPrefix}_all`] !== undefined) return;

    const current = q.originalData;
    let addedScore = 0;
    const newGraded: Record<string, boolean> = {};

    current.questions.forEach((subQ: any, subIdx: number) => {
      const ansKey = `${keyPrefix}_q${subIdx}`;
      const isCorrect = reviewAnswers[ansKey] === (subQ.corr || subQ.correct);
      newGraded[ansKey] = isCorrect;
      if (isCorrect) addedScore += 1;
    });
    newGraded[`${keyPrefix}_all`] = true;

    setReviewGraded(prev => ({ ...prev, ...newGraded }));
    setReviewScore(prev => prev + addedScore);
  };

  const gradeDictation = (q: any) => {
    const key = q.key;
    if (reviewGraded[key] !== undefined) return;

    const current = q.originalData;
    const userAnsRaw = (reviewAnswers[key] || '').trim();
    const cleanUserVn = userAnsRaw.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_\`~()?？。、\s]/g, '');
    let isCorrect = false;
    const correctJp = current.question_audio;
    const cleanJp = correctJp.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_\`~()?？.、\s]/g, '');
    const cleanUserJp = userAnsRaw.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_\`~()?？.、\s]/g, '');
    if (cleanUserJp === cleanJp) {
      isCorrect = true;
    }

    const vnAnswers = current.vietnamese_answers || [];
    vnAnswers.forEach((ans: string) => {
      const cleanVnAns = ans.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_\`~()?？.、\s]/g, '');
      if (cleanUserVn === cleanVnAns || calculateAccuracy(userAnsRaw, ans) >= 85) {
        isCorrect = true;
      }
    });

    setReviewGraded(prev => ({ ...prev, [key]: isCorrect }));
    setReviewFeedback(prev => ({
      ...prev,
      [key]: `Đáp án đúng: ${correctJp} ${current.vietnamese_meaning ? `| Ý nghĩa: ${current.vietnamese_meaning}` : ''}`
    }));

    if (isCorrect) {
      setReviewScore(prev => prev + 1);
    }
  };

  const gradeQuestion = (q: any) => {
    if (q.type === 'translation') {
      gradeTranslation(q);
    } else if (q.type === 'dialogue') {
      gradeDialogue(q);
    } else if (q.type === 'listening') {
      gradeListening(q);
    } else if (q.type === 'dictation') {
      gradeDictation(q);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 pb-12 animate-fade-in">
      {/* Header & Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📝 Ôn tập bài học: {lessonTitle}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Luyện tập sâu từ vựng & ngữ pháp qua các dạng bài tập phản xạ chuyên biệt
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {Object.keys(savedSessions).length > 0 && (
            <button
              onClick={() => masterResetAll()}
              title="Xóa tiến trình làm dở của cả 4 dạng bài tập"
              className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
            >
              🔄 Master Reset (Khôi phục 4 dạng)
            </button>
          )}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setReviewShowKanji(false)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${!reviewShowKanji ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Chữ Kana
            </button>
            <button
              onClick={() => setReviewShowKanji(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${reviewShowKanji ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Chữ Hán
            </button>
          </div>
        </div>
      </div>

      {/* SETUP SCREEN */}
      {reviewStep === 'setup' && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-xl text-center space-y-8 animate-scale-in">
          <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto text-3xl">
            🚀
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Bắt đầu lượt ôn tập theo dạng</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Hãy chọn 1 dạng bài tập bên dưới. Hệ thống lưu tiến trình riêng biệt cho từng dạng và cho phép mở lại câu đang làm dở bất kỳ lúc nào.
            </p>
          </div>

          {Object.keys(savedSessions).length > 0 && (
            <div className="bg-indigo-950/60 border border-indigo-800/80 p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap text-left max-w-2xl mx-auto shadow-inner">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <span>✨ Tiến trình bài làm được lưu riêng cho từng dạng bài</span>
                </div>
                <p className="text-slate-400 text-xs">
                  Bấm vào từng dạng bài có đánh dấu huy hiệu dở bên dưới để làm tiếp câu dở, hoặc bấm Master Reset để làm lại cả 4 dạng.
                </p>
              </div>
              <button
                onClick={() => masterResetAll()}
                className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                🔄 Master Reset (Xóa hết 4 dạng)
              </button>
            </div>
          )}

          {reviewLoading ? (
            <div className="text-indigo-400 text-sm font-semibold flex items-center justify-center gap-2 py-4">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Đang tải câu hỏi ôn tập...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  {
                    id: 'translation',
                    title: '🇯🇵 ➔ 🇻🇳 Dịch câu phản xạ',
                    desc: 'Dịch câu hai chiều Nhật - Việt, hỗ trợ nhận diện và phản xạ từ vựng ngữ pháp.',
                    icon: '💬',
                    color: 'border-amber-500/20 hover:border-amber-500/80 hover:bg-amber-500/5 text-amber-400'
                  },
                  {
                    id: 'dialogue',
                    title: '💬 ➔ ✏️ Điền khuyết hội thoại',
                    desc: 'Lựa chọn các đáp án A/B/C/D phù hợp để điền vào chỗ trống trong đoạn thoại.',
                    icon: '📝',
                    color: 'border-sky-500/20 hover:border-sky-500/80 hover:bg-sky-500/5 text-sky-400'
                  },
                  {
                    id: 'listening',
                    title: '🎧 ➔ 📝 Nghe hiểu hội thoại',
                    desc: 'Nghe đoạn hội thoại dài và trả lời các câu hỏi trắc nghiệm A/B/C/D liên quan.',
                    icon: '🎧',
                    color: 'border-indigo-500/20 hover:border-indigo-500/80 hover:bg-indigo-500/5 text-indigo-400'
                  },
                  {
                    id: 'dictation',
                    title: '🔊 ➔ ✍️ Nghe viết chính tả',
                    desc: 'Nghe phát âm tiếng Nhật và gõ lại bằng chữ Kana/Kanji hoặc điền nghĩa tiếng Việt.',
                    icon: '✍️',
                    color: 'border-purple-500/20 hover:border-purple-500/80 hover:bg-purple-500/5 text-purple-400'
                  }
                ].map((item) => {
                  const saved = savedSessions[item.id];
                  const hasProgress = saved && saved.reviewQuestions && saved.reviewQuestions.length > 0;
                  const currentIdx = saved ? saved.reviewIndex + 1 : 0;
                  const totalQ = saved ? saved.reviewQuestions.length : 0;

                  return (
                    <div
                      key={item.id}
                      onClick={() => startReviewTest(item.id)}
                      className={`flex flex-col justify-between p-5 rounded-2xl border bg-slate-900/40 text-left transition-all active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${item.color} relative overflow-hidden group`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-3xl flex-shrink-0">{item.icon}</span>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white flex items-center justify-between gap-2">
                            <span>{item.title}</span>
                          </h4>
                          <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                        </div>
                      </div>

                      {hasProgress ? (
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-extrabold flex items-center gap-1">
                            📍 Đang ở câu {currentIdx}/{totalQ}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-indigo-400 font-bold group-hover:underline">
                              ▶️ Làm tiếp
                            </span>
                            <button
                              onClick={(e) => resetSingleType(item.id, e)}
                              title="Xóa vết riêng dạng này và xáo lại từ đầu"
                              className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 rounded transition-all"
                            >
                              🔄
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 pt-3 border-t border-slate-800/40 text-right">
                          <span className="text-slate-500 text-xs group-hover:text-slate-300 transition-all font-semibold">
                            Bắt đầu ➔
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Test in progress screens */}
      {reviewStep === 'test' && reviewQuestions.length > 0 && (() => {
        const q = reviewQuestions[reviewIndex];
        const current = q.originalData;
        
        const isQuestionGraded = q.type === 'listening'
          ? reviewGraded[`${q.key}_all`] !== undefined
          : (q.type === 'dialogue'
            ? reviewGraded[`${q.key}_b1`] !== undefined
            : reviewGraded[q.key] !== undefined);

        return (
          <div className="space-y-8 animate-scale-in">
            {/* Active filter alert info & Progress bar */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
              <div className="flex justify-between items-center text-xs text-indigo-300">
                <span>
                  🎯 Dạng bài: <strong>{
                    reviewSelectedType === 'translation' ? 'Dịch câu phản xạ' :
                    reviewSelectedType === 'dialogue' ? 'Điền khuyết hội thoại' :
                    reviewSelectedType === 'listening' ? 'Nghe hiểu hội thoại' : 'Nghe viết chính tả'
                  }</strong>
                </span>
                <span className="font-bold text-slate-400">
                  Câu {reviewIndex + 1} / {reviewQuestions.length}
                </span>
              </div>
              <div className="w-full bg-slate-850 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-650 h-full transition-all duration-300"
                  style={{ width: `${((reviewIndex + 1) / reviewQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Single Question Container */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6 relative text-left">
              {/* Question Badge / Header */}
              <div className="flex justify-between items-center border-b border-slate-850 pb-3 flex-wrap gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  q.type === 'translation' 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : q.type === 'dialogue'
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                      : q.type === 'listening'
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                }`}>
                  Câu hỏi hiện tại
                </span>
                {isQuestionGraded && (
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-lg ${
                    q.type === 'listening'
                      ? (current.questions.every((subQ: any, sIdx: number) => reviewAnswers[`${q.key}_q${sIdx}`] === (subQ.corr || subQ.correct)) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')
                      : q.type === 'dialogue'
                        ? ((reviewGraded[`${q.key}_b1`] && reviewGraded[`${q.key}_b2`]) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')
                        : (reviewGraded[q.key] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')
                  }`}>
                    {q.type === 'listening'
                      ? (current.questions.every((subQ: any, sIdx: number) => reviewAnswers[`${q.key}_q${sIdx}`] === (subQ.corr || subQ.correct)) ? '✓ Đúng tất cả' : '✗ Chưa đúng tất cả')
                      : q.type === 'dialogue'
                        ? ((reviewGraded[`${q.key}_b1`] && reviewGraded[`${q.key}_b2`]) ? '✓ Đúng hoàn toàn' : '✗ Chưa đúng hoàn toàn')
                        : (reviewGraded[q.key] ? '✓ Đúng' : '✗ Chưa đúng')
                    }
                  </span>
                )}
              </div>

              {/* RENDER DẠNG 1: TRANSLATION */}
              {q.type === 'translation' && (() => {
                const isJaToVi = current.direction === 'ja-to-vi';
                const key = q.key;
                const questionDisplay = isJaToVi 
                  ? (reviewShowKanji ? (current.question_kanji || current.question) : (current.question_kana || current.question))
                  : current.question;

                return (
                  <div className="space-y-4">
                    <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-900 space-y-3 relative overflow-hidden">
                      <div className="text-slate-400 text-xs">
                        {isJaToVi ? 'Hãy dịch câu tiếng Nhật sau sang tiếng Việt:' : 'Hãy dịch câu Việt sau sang tiếng Nhật:'}
                      </div>
                      <div className="text-lg font-bold text-white select-all">{questionDisplay}</div>
                      {isJaToVi && (
                        <button
                          onClick={() => playAudio(questionDisplay)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        >
                          🔊 Nghe phát âm
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        disabled={isQuestionGraded}
                        value={reviewAnswers[key] || ''}
                        onChange={(e) => setReviewAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={isJaToVi ? "Nhập bản dịch tiếng Việt..." : "Nhập bản dịch tiếng Nhật (Hiragana/Romaji)..."}
                        className="w-full bg-slate-955/60 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isQuestionGraded) {
                            gradeQuestion(q);
                          }
                        }}
                      />
                    </div>

                    {!isQuestionGraded ? (
                      <button
                        onClick={() => gradeQuestion(q)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-xs"
                      >
                        Kiểm tra câu này ➔
                      </button>
                    ) : (
                      <div className="p-3.5 rounded-xl border bg-slate-950/40 border-slate-800 text-xs space-y-2">
                        <p className="text-emerald-400 font-semibold">{reviewFeedback[key]}</p>
                        {!reviewGraded[key] && (
                          <button
                            onClick={() => markAsCorrect(q)}
                            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 text-xs shadow-sm mt-1"
                          >
                            ✔ Tôi nghĩ tôi đã trả lời đúng (Sửa thành Đúng)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* RENDER DẠNG 2: DIALOGUE */}
              {q.type === 'dialogue' && (() => {
                const key1 = `${q.key}_b1`;
                const key2 = `${q.key}_b2`;

                return (
                  <div className="space-y-4">
                    <div className="text-slate-400 text-xs italic">
                      Ngữ cảnh đoạn thoại: {current.context}
                    </div>

                    <div className="space-y-4 bg-slate-950/80 p-5 rounded-xl border border-slate-900">
                      {current.lines.map((line: any, lIdx: number) => {
                        const isSpeakerA = line.speaker === 'A';
                        const textToRender = reviewShowKanji ? (line.text_output || line.text_kanji) : (line.text_kana || line.text);
                        
                        const cleanText = textToRender
                          .replace('[blank1]', '_______ (1)')
                          .replace('[blank2]', '_______ (2)');
                        
                        return (
                          <div key={lIdx} className={`flex ${isSpeakerA ? 'justify-start' : 'justify-end'}`}>
                            <div className={`flex flex-col max-w-[85%] ${isSpeakerA ? 'items-start' : 'items-end'}`}>
                              <div className="flex items-center gap-1.5 mb-1 px-1">
                                <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center border border-slate-700 shadow-sm">
                                  {line.speaker}
                                </span>
                                <span className="text-xs font-semibold text-indigo-300">
                                  {line.speaker === 'A' ? 'Nhân vật A' : 'Nhân vật B'}
                                </span>
                              </div>
                              <div className={`p-3.5 rounded-2xl border text-sm text-white ${
                                isSpeakerA 
                                  ? 'bg-slate-900/80 border-slate-800 rounded-tl-none' 
                                  : 'bg-indigo-950/50 border-indigo-900/50 rounded-tr-none'
                                }`}>
                                <span>{cleanText}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/65 p-5 rounded-xl border border-slate-900 mb-4">
                      {/* Blank 1 Options */}
                      <div className="space-y-2.5">
                        <label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs flex items-center justify-center border border-indigo-500/20 font-bold">1</span>
                          <span>Đáp án cho vị trí (1):</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {current.blanks.blank1.options.map((opt: string, oIdx: number) => {
                            const label = ['A', 'B', 'C', 'D'][oIdx];
                            const isSelected = reviewAnswers[key1] === opt;
                            
                            return (
                              <button
                                key={oIdx}
                                disabled={isQuestionGraded}
                                onClick={() => setReviewAnswers(prev => ({ ...prev, [key1]: opt }))}
                                className={`px-3 py-2 text-left rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-600/20 border-indigo-550 text-white shadow-md'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold border ${
                                  isSelected 
                                    ? 'bg-indigo-650 border-indigo-400 text-white' 
                                    : 'bg-slate-950 border-slate-805 text-slate-500'
                                }`}>
                                  {label}
                                </span>
                                <span className="truncate">{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Blank 2 Options */}
                      <div className="space-y-2.5">
                        <label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs flex items-center justify-center border border-indigo-500/20 font-bold">2</span>
                          <span>Đáp án cho vị trí (2):</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {current.blanks.blank2.options.map((opt: string, oIdx: number) => {
                            const label = ['A', 'B', 'C', 'D'][oIdx];
                            const isSelected = reviewAnswers[key2] === opt;
                            
                            return (
                              <button
                                key={oIdx}
                                disabled={isQuestionGraded}
                                onClick={() => setReviewAnswers(prev => ({ ...prev, [key2]: opt }))}
                                className={`px-3 py-2 text-left rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-600/20 border-indigo-550 text-white shadow-md'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold border ${
                                  isSelected 
                                    ? 'bg-indigo-650 border-indigo-400 text-white' 
                                    : 'bg-slate-950 border-slate-805 text-slate-500'
                                }`}>
                                  {label}
                                </span>
                                <span className="truncate">{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {!isQuestionGraded ? (
                      <button
                        onClick={() => gradeQuestion(q)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-xs"
                      >
                        Kiểm tra câu này ➔
                      </button>
                    ) : (
                      <div className="p-4 rounded-xl border bg-slate-950/60 border-slate-800 text-xs space-y-3">
                        <p className="text-emerald-400 font-semibold">{reviewFeedback[q.key]}</p>
                        
                        {/* 1. KHỐI ĐÁP ÁN ĐÚNG */}
                        {current.blanks && (
                          <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 space-y-1 text-slate-200">
                            <div className="font-bold text-emerald-400 flex items-center gap-1">✅ Đáp án đúng:</div>
                            <p>
                              <strong className="text-emerald-300">(1):</strong> {current.blanks.blank1?.correct}{' '}
                              {current.blanks.blank1?.options_translations?.[current.blanks.blank1.correct]
                                ? `(${current.blanks.blank1.options_translations[current.blanks.blank1.correct]})`
                                : ''}
                            </p>
                            {current.blanks.blank2?.correct && (
                              <p>
                                <strong className="text-emerald-300">(2):</strong> {current.blanks.blank2?.correct}{' '}
                                {current.blanks.blank2?.options_translations?.[current.blanks.blank2.correct]
                                  ? `(${current.blanks.blank2.options_translations[current.blanks.blank2.correct]})`
                                  : ''}
                              </p>
                            )}
                          </div>
                        )}

                        {/* 2. KHỐI GIẢI THÍCH CHI TIẾT & NGỮ PHÁP */}
                        {current.blanks?.blank1?.explanation && (
                          <div className="bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20 space-y-1 text-slate-300">
                            <div className="font-bold text-indigo-400 flex items-center gap-1">💡 Giải thích chi tiết & Ngữ pháp:</div>
                            <p><strong className="text-indigo-200">(1):</strong> {current.blanks.blank1.explanation}</p>
                            {current.blanks.blank2?.explanation && <p><strong className="text-indigo-200">(2):</strong> {current.blanks.blank2.explanation}</p>}
                          </div>
                        )}

                        {/* 3. KHỐI DỊCH NGHĨA HỘI THOẠI */}
                        {current.lines && (
                          <div className="bg-slate-900/40 p-3 rounded-lg space-y-1 text-slate-300 border border-slate-800/80">
                            <div className="font-bold text-slate-400 mb-1">💬 Dịch nghĩa hội thoại:</div>
                            {current.lines.map((line: any, lIdx: number) => (
                              <div key={lIdx}>
                                <strong>{line.speaker}:</strong> {line.vietnamese || line.translation || '(Chưa có bản dịch)'}
                              </div>
                            ))}
                          </div>
                        )}

                        {!(reviewGraded[`${q.key}_b1`] && reviewGraded[`${q.key}_b2`]) && (
                          <button
                            onClick={() => markAsCorrect(q)}
                            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 text-xs shadow-sm mt-2"
                          >
                            ✔ Tôi nghĩ tôi đã trả lời đúng (Sửa thành Đúng)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* RENDER DẠNG 3: LISTENING */}
              {q.type === 'listening' && (() => {
                const keyPrefix = q.key;

                return (
                  <div className="space-y-5">
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-855 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-xs text-slate-400 font-bold uppercase">🎧 Bài nghe đối thoại luân phiên</h4>
                        <p className="text-sm font-semibold text-slate-205">
                          Hãy nghe cuộc trò chuyện giữa 2 nhân vật A và B.
                        </p>
                      </div>
                      <button
                        onClick={() => playDialogueAudio(current.lines || current.audio_text_kana || current.audio_text_kanji)}
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer text-sm"
                      >
                        🔊 Phát bài nghe
                      </button>
                    </div>

                    <div className="space-y-4">
                      {current.questions.map((subQ: any, subIdx: number) => {
                        const ansKey = `${keyPrefix}_q${subIdx}`;
                        const selectedAnswer = reviewAnswers[ansKey];
                        const optionsList = subQ.opts || subQ.options || [];

                        return (
                          <div key={subIdx} className="bg-slate-950/40 p-4 border border-slate-805 rounded-xl space-y-3">
                            <div className="text-xs font-bold text-slate-350 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-855 text-[10px] text-slate-300 border border-slate-700 flex items-center justify-center font-bold">
                                {subIdx + 1}
                              </span>
                              <span>{subQ.q || subQ.question || subQ.question_kanji || subQ.question_kana}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                              {optionsList.map((opt: string, oIdx: number) => {
                                const label = ['A', 'B', 'C', 'D'][oIdx];
                                const isOptSelected = selectedAnswer === opt;
                                
                                return (
                                  <button
                                    key={oIdx}
                                    disabled={isQuestionGraded}
                                    onClick={() => setReviewAnswers(prev => ({ ...prev, [ansKey]: opt }))}
                                    className={`px-3 py-2 text-left rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer ${
                                      isOptSelected
                                        ? 'bg-indigo-600/20 border-indigo-550 text-white shadow'
                                        : 'bg-slate-905 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                    }`}
                                  >
                                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold border ${
                                      isOptSelected 
                                        ? 'bg-indigo-650 border-indigo-400 text-white' 
                                        : 'bg-slate-950 border-slate-800 text-slate-500'
                                    }`}>
                                      {label}
                                    </span>
                                    <span className="truncate">{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {!isQuestionGraded ? (
                      <button
                        onClick={() => gradeQuestion(q)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-xs"
                      >
                        Kiểm tra câu này ➔
                      </button>
                    ) : (
                      <div className="p-4 rounded-xl border bg-slate-950/60 border-slate-800 text-xs space-y-3">
                        <div className="space-y-1.5">
                          <span className="font-bold text-slate-200 block mb-1">Kịch bản bài nghe & dịch nghĩa:</span>
                          {current.lines && current.lines.map((line: any, lIdx: number) => (
                            <p key={lIdx} className="text-slate-355 leading-relaxed">
                              <strong>{line.speaker}:</strong> {line.text} {line.vietnamese ? `(${line.vietnamese})` : ''}
                            </p>
                          ))}
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-850 mt-2">
                          {current.questions.map((subQ: any, subIdx: number) => {
                            const ansKey = `${keyPrefix}_q${subIdx}`;
                            const subCorrect = reviewGraded[ansKey];
                            return (
                              <div key={subIdx} className="pl-2 border-l-2 border-indigo-500/40">
                                <p className="font-semibold text-slate-300">
                                  Câu hỏi {subIdx + 1}: {subCorrect ? '🟢 Đúng' : '🔴 Sai'}
                                </p>
                                <p className="text-emerald-400 font-semibold">Đáp án đúng: {subQ.corr || subQ.correct}</p>
                                {subQ.explanation && <p className="text-slate-455 mt-0.5">💡 Giải thích: {subQ.explanation}</p>}
                              </div>
                            );
                          })}
                        </div>

                        {!current.questions.every((subQ: any, sIdx: number) => reviewGraded[`${keyPrefix}_q${sIdx}`]) && (
                          <button
                            onClick={() => markAsCorrect(q)}
                            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 text-xs shadow-sm mt-2"
                          >
                            ✔ Tôi nghĩ tôi đã trả lời đúng (Sửa thành Đúng)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* RENDER DẠNG 4: DICTATION */}
              {q.type === 'dictation' && (() => {
                const key = q.key;

                return (
                  <div className="space-y-4">
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-xs text-slate-450 font-bold uppercase">🎧 Chính tả âm thanh</h4>
                        <p className="text-sm font-semibold text-slate-205">
                          Hãy nghe câu tiếng Nhật và viết lại bằng Hiragana/Kanji hoặc dịch nghĩa sang tiếng Việt.
                        </p>
                      </div>
                      <button
                        onClick={() => playAudio(current.question_audio)}
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer text-sm"
                      >
                        🔊 Phát loa nghe
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        disabled={isQuestionGraded}
                        value={reviewAnswers[key] || ''}
                        onChange={(e) => setReviewAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder="Nhập câu tiếng Nhật hoặc bản dịch tiếng Việt..."
                        className="w-full bg-slate-950/60 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isQuestionGraded) {
                            gradeQuestion(q);
                          }
                        }}
                      />
                    </div>

                    {!isQuestionGraded ? (
                      <button
                        onClick={() => gradeQuestion(q)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-xs"
                      >
                        Kiểm tra câu này ➔
                      </button>
                    ) : (
                      <div className="p-3.5 rounded-xl border bg-slate-950/40 border-slate-800 text-xs space-y-2">
                        <p className="text-emerald-400 font-semibold">{reviewFeedback[key]}</p>
                        {reviewAnswers[key] && !reviewGraded[key] && (
                          <div className="mt-1 bg-slate-900/60 p-2.5 rounded border border-slate-800 text-[11px]">
                            <span className="block text-slate-400 mb-1">So khớp chính tả:</span>
                            {renderDiff(reviewAnswers[key], current.question_audio)}
                          </div>
                        )}
                        {!reviewGraded[key] && (
                          <button
                            onClick={() => markAsCorrect(q)}
                            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 text-xs shadow-sm mt-2"
                          >
                            ✔ Tôi nghĩ tôi đã trả lời đúng (Sửa thành Đúng)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Footer Action Buttons */}
            <div className="flex justify-between items-center gap-4 pt-4">
              <button
                onClick={() => setReviewStep('setup')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-350 font-bold rounded-xl transition-all active:scale-95 cursor-pointer text-xs"
              >
                ⏮️ Hủy & Chọn dạng khác
              </button>

              {isQuestionGraded && (
                reviewIndex + 1 < reviewQuestions.length ? (
                  <button
                    onClick={() => setReviewIndex(prev => prev + 1)}
                    className="px-8 py-3 bg-indigo-650 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-sm animate-bounce"
                  >
                    Câu tiếp theo ➔
                  </button>
                ) : (
                  <button
                    onClick={() => setReviewStep('result')}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-sm"
                  >
                    Hoàn thành & Xem kết quả 📊
                  </button>
                )
              )}
            </div>

            {/* COLLAPSIBLE ANSWER LOG TABLE (Bảng lịch sử đáp án các câu đã làm) */}
            {(() => {
              const answeredQuestions = reviewQuestions.slice(0, reviewIndex + (isQuestionGraded ? 1 : 0)).filter(q => {
                if (q.type === 'listening') return reviewGraded[`${q.key}_all`] !== undefined;
                if (q.type === 'dialogue') return reviewGraded[`${q.key}_b1`] !== undefined;
                return reviewGraded[q.key] !== undefined || (reviewAnswers[q.key] && reviewAnswers[q.key].trim() !== '');
              });

              if (answeredQuestions.length === 0) return null;

              const correctQuestionsCount = answeredQuestions.filter(q => {
                if (q.type === 'translation' || q.type === 'dictation') return !!reviewGraded[q.key];
                if (q.type === 'dialogue') return !!(reviewGraded[`${q.key}_b1`] && reviewGraded[`${q.key}_b2`]);
                if (q.type === 'listening') {
                  return q.originalData.questions?.every((_: any, sIdx: number) => reviewGraded[`${q.key}_q${sIdx}`]);
                }
                return false;
              }).length;

              const historyAccuracy = Math.round((correctQuestionsCount / answeredQuestions.length) * 100);

              return (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-6">
                  {/* Accordion Header Bar */}
                  <button
                    onClick={() => setShowHistoryTable(!showHistoryTable)}
                    className="w-full p-4 bg-slate-950/80 hover:bg-slate-900 border-b border-slate-800 flex justify-between items-center text-xs font-bold text-slate-200 transition-all cursor-pointer flex-wrap gap-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-indigo-400 text-sm">📋</span>
                      <span>BẢNG LỊCH SỬ CÂU ĐÃ LÀM ({answeredQuestions.length} câu)</span>
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-extrabold text-[11px] ml-1">
                        🎯 Tỉ lệ đúng: {historyAccuracy}% ({correctQuestionsCount}/{answeredQuestions.length} câu)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                      <span>{showHistoryTable ? '▲ Thu gọn' : '▼ Mở rộng xem chi tiết'}</span>
                    </div>
                  </button>

                  {/* Accordion Body Content */}
                  {showHistoryTable && (
                    <div className="p-4 space-y-3">
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                              <th className="py-2.5 px-3 w-16">Câu số</th>
                              <th className="py-2.5 px-3 w-1/4">Câu trả lời của tôi</th>
                              <th className="py-2.5 px-3 w-1/4">Đáp án đúng</th>
                              <th className="py-2.5 px-3">Giải thích chi tiết</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {answeredQuestions.map((q, idx) => {
                              const originalIdx = reviewQuestions.findIndex(item => item.key === q.key);
                              const qNum = originalIdx >= 0 ? originalIdx + 1 : idx + 1;
                              const currentData = q.originalData;

                              let isCorrect = false;
                              let userAnsStr = '';
                              let correctAnsStr = '';
                              let explanationStr = '';

                              if (q.type === 'translation') {
                                isCorrect = !!reviewGraded[q.key];
                                userAnsStr = reviewAnswers[q.key] || '(Chưa gõ)';
                                const list = currentData.correct_answers || currentData.answers || [];
                                correctAnsStr = list.join(' / ');
                                explanationStr = reviewFeedback[q.key] || '';
                              } else if (q.type === 'dialogue') {
                                const b1 = reviewGraded[`${q.key}_b1`];
                                const b2 = reviewGraded[`${q.key}_b2`];
                                isCorrect = !!(b1 && b2);
                                userAnsStr = `(1) ${reviewAnswers[`${q.key}_b1`] || '_'} | (2) ${reviewAnswers[`${q.key}_b2`] || '_'}`;
                                correctAnsStr = `(1) ${currentData.blanks?.blank1?.correct} | (2) ${currentData.blanks?.blank2?.correct}`;
                                explanationStr = currentData.blanks?.blank1?.explanation || '';
                              } else if (q.type === 'listening') {
                                const allSubCorrect = currentData.questions?.every((_: any, sIdx: number) => reviewGraded[`${q.key}_q${sIdx}`]);
                                isCorrect = !!allSubCorrect;
                                const userSubs = currentData.questions?.map((_: any, sIdx: number) => `Q${sIdx+1}: ${reviewAnswers[`${q.key}_q${sIdx}`] || '_'}`);
                                userAnsStr = userSubs?.join(' | ');
                                const corrSubs = currentData.questions?.map((sq: any, sIdx: number) => `Q${sIdx+1}: ${sq.corr || sq.correct}`);
                                correctAnsStr = corrSubs?.join(' | ');
                                const expSubs = currentData.questions?.map((sq: any, sIdx: number) => sq.explanation).filter(Boolean);
                                explanationStr = expSubs?.join(' | ');
                              } else if (q.type === 'dictation') {
                                isCorrect = !!reviewGraded[q.key];
                                userAnsStr = reviewAnswers[q.key] || '(Chưa gõ)';
                                correctAnsStr = `${currentData.question_audio} ${currentData.vietnamese_meaning ? `(${currentData.vietnamese_meaning})` : ''}`;
                                explanationStr = reviewFeedback[q.key] || '';
                              }

                              return (
                                <tr key={idx} className="hover:bg-slate-850/40 transition-all">
                                  <td className="py-3 px-3 font-bold text-white align-top">Câu {qNum}</td>
                                  <td className="py-3 px-3 align-top">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                          {isCorrect ? '🟢 Đúng' : '🔴 Sai'}
                                        </span>
                                        {!isCorrect && (
                                          <button
                                            onClick={() => markAsCorrect(q)}
                                            title="Đánh dấu câu này thành đúng"
                                            className="px-2 py-0.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                                          >
                                            ✔ Đánh dấu đúng
                                          </button>
                                        )}
                                      </div>
                                      <div className="text-slate-200 font-semibold break-all">{userAnsStr}</div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 align-top text-emerald-300 font-semibold break-all">
                                    {correctAnsStr}
                                  </td>
                                  <td className="py-3 px-3 align-top text-slate-350 text-xs leading-relaxed break-all">
                                    {explanationStr || '(Không có giải thích)'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card List View */}
                      <div className="block md:hidden space-y-3">
                        {answeredQuestions.map((q, idx) => {
                          const originalIdx = reviewQuestions.findIndex(item => item.key === q.key);
                          const qNum = originalIdx >= 0 ? originalIdx + 1 : idx + 1;
                          const currentData = q.originalData;

                          let isCorrect = false;
                          let userAnsStr = '';
                          let correctAnsStr = '';
                          let explanationStr = '';

                          if (q.type === 'translation') {
                            isCorrect = !!reviewGraded[q.key];
                            userAnsStr = reviewAnswers[q.key] || '(Chưa gõ)';
                            const list = currentData.correct_answers || currentData.answers || [];
                            correctAnsStr = list.join(' / ');
                            explanationStr = reviewFeedback[q.key] || '';
                          } else if (q.type === 'dialogue') {
                            const b1 = reviewGraded[`${q.key}_b1`];
                            const b2 = reviewGraded[`${q.key}_b2`];
                            isCorrect = !!(b1 && b2);
                            userAnsStr = `(1) ${reviewAnswers[`${q.key}_b1`] || '_'} | (2) ${reviewAnswers[`${q.key}_b2`] || '_'}`;
                            correctAnsStr = `(1) ${currentData.blanks?.blank1?.correct} | (2) ${currentData.blanks?.blank2?.correct}`;
                            explanationStr = currentData.blanks?.blank1?.explanation || '';
                          } else if (q.type === 'listening') {
                            const allSubCorrect = currentData.questions?.every((_: any, sIdx: number) => reviewGraded[`${q.key}_q${sIdx}`]);
                            isCorrect = !!allSubCorrect;
                            const userSubs = currentData.questions?.map((_: any, sIdx: number) => `Q${sIdx+1}: ${reviewAnswers[`${q.key}_q${sIdx}`] || '_'}`);
                            userAnsStr = userSubs?.join(' | ');
                            const corrSubs = currentData.questions?.map((sq: any, sIdx: number) => `Q${sIdx+1}: ${sq.corr || sq.correct}`);
                            correctAnsStr = corrSubs?.join(' | ');
                            const expSubs = currentData.questions?.map((sq: any, sIdx: number) => sq.explanation).filter(Boolean);
                            explanationStr = expSubs?.join(' | ');
                          } else if (q.type === 'dictation') {
                            isCorrect = !!reviewGraded[q.key];
                            userAnsStr = reviewAnswers[q.key] || '(Chưa gõ)';
                            correctAnsStr = `${currentData.question_audio} ${currentData.vietnamese_meaning ? `(${currentData.vietnamese_meaning})` : ''}`;
                            explanationStr = reviewFeedback[q.key] || '';
                          }

                          return (
                            <div key={idx} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-855 space-y-2 text-xs">
                              <div className="flex justify-between items-center flex-wrap gap-2">
                                <span className="font-bold text-white">Câu {qNum}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                    {isCorrect ? '🟢 Đúng' : '🔴 Sai'}
                                  </span>
                                  {!isCorrect && (
                                    <button
                                      onClick={() => markAsCorrect(q)}
                                      title="Đánh dấu câu này thành đúng"
                                      className="px-2 py-0.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                                    >
                                      ✔ Đánh dấu đúng
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-400">Trả lời của tôi:</span>
                                <p className="text-white font-semibold">{userAnsStr}</p>
                              </div>
                              <div>
                                <span className="text-emerald-400 font-semibold">Đáp án đúng:</span>
                                <p className="text-emerald-300 font-medium">{correctAnsStr}</p>
                              </div>
                              {explanationStr && (
                                <div className="text-slate-400 pt-1 border-t border-slate-900">
                                  <span>💡 Giải thích:</span> {explanationStr}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* SCREEN BÁO CÁO KẾT QUẢ */}
      {reviewStep === 'result' && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-xl text-center space-y-6 animate-scale-in text-left">
          <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto text-4xl">
            🏆
          </div>
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-bold text-white">Chúc mừng! Bạn đã hoàn thành lượt ôn tập</h3>
            <p className="text-slate-400 text-sm">
              Dưới đây là báo cáo kết quả ôn tập của bạn
            </p>
          </div>

          {/* Bảng điểm */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto bg-slate-950/60 p-5 rounded-xl border border-slate-900">
            <div className="text-center">
              <div className="text-slate-400 text-xs font-semibold">ĐIỂM SỐ</div>
              <div className="text-2xl font-bold text-indigo-400 mt-1">{reviewScore} / {reviewTotal}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-400 text-xs font-semibold">TỶ LỆ ĐÚNG</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {reviewTotal ? Math.round((reviewScore / reviewTotal) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Detailed review report list */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 border-t border-slate-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-455">Báo cáo đáp án chi tiết</h4>
            {reviewQuestions.map((q, idx) => {
              const isCorrect = q.type === 'listening'
                ? q.originalData.questions.every((_: any, sIdx: number) => reviewGraded[`${q.key}_q${sIdx}`])
                : (q.type === 'dialogue'
                  ? (reviewGraded[`${q.key}_b1`] && reviewGraded[`${q.key}_b2`])
                  : reviewGraded[q.key]);

              let qText = '';
              if (q.type === 'translation') {
                qText = q.originalData.question_kana || q.originalData.question;
              } else if (q.type === 'dialogue') {
                qText = `Hội thoại điền khuyết`;
              } else if (q.type === 'listening') {
                qText = `Nghe hiểu hội thoại`;
              } else if (q.type === 'dictation') {
                qText = `Nghe viết chính tả: ${q.originalData.question_audio}`;
              }

              return (
                <div key={idx} className={`p-4 rounded-xl border ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'} space-y-2`}>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold text-white">
                      Câu {idx + 1}: {q.type === 'translation' ? 'Dịch phản xạ' : q.type === 'dialogue' ? 'Điền hội thoại' : q.type === 'listening' ? 'Nghe hiểu' : 'Nghe viết'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {isCorrect ? 'Đúng' : 'Sai'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold">{qText}</p>
                  
                  {q.type === 'translation' && (
                    <div className="text-xs space-y-1">
                      <p className="text-slate-455">Câu trả lời: <span className="font-semibold text-slate-205">{reviewAnswers[q.key] || '(Để trống)'}</span></p>
                      <p className="text-emerald-400">{reviewFeedback[q.key]}</p>
                    </div>
                  )}

                  {q.type === 'dialogue' && (
                    <div className="text-xs space-y-1">
                      <p className="text-slate-455">Câu trả lời: <span className="font-semibold text-slate-205">[1] {reviewAnswers[`${q.key}_b1`] || '_'} | [2] {reviewAnswers[`${q.key}_b2`] || '_'}</span></p>
                      <p className="text-emerald-400">{reviewFeedback[q.key]}</p>
                    </div>
                  )}

                  {q.type === 'listening' && (
                    <div className="text-xs space-y-1.5">
                      {q.originalData.questions.map((subQ: any, sIdx: number) => {
                        const ansKey = `${q.key}_q${sIdx}`;
                        const subCorrect = reviewGraded[ansKey];
                        return (
                          <div key={sIdx} className="pl-2 border-l border-slate-800">
                            <p className="font-medium text-slate-300">{sIdx + 1}. {subQ.q || subQ.question || subQ.question_kanji || subQ.question_kana}</p>
                            <p className="text-slate-455">Đáp án: <span className="font-semibold text-slate-205">{reviewAnswers[ansKey] || '_'}</span> {subCorrect ? '✅' : '❌'}</p>
                            {!subCorrect && <p className="text-emerald-400 font-mono text-[10px]">Đúng: {subQ.corr || subQ.correct}</p>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'dictation' && (
                    <div className="text-xs space-y-1">
                      <p className="text-slate-455">Câu trả lời: <span className="font-semibold text-slate-205">{reviewAnswers[q.key] || '(Để trống)'}</span></p>
                      <p className="text-emerald-400">{reviewFeedback[q.key]}</p>
                      {reviewAnswers[q.key] && !reviewGraded[q.key] && (
                        <div className="mt-1 bg-slate-900/60 p-2.5 rounded border border-slate-800 text-[11px]">
                          <span className="block text-slate-400 mb-1">So khớp chính tả:</span>
                          {renderDiff(reviewAnswers[q.key], q.originalData.question_audio)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={() => {
                masterResetAll();
              }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all active:scale-95 cursor-pointer text-sm flex items-center justify-center gap-1.5"
            >
              🔄 Reset & Xáo trộn đề mới
            </button>
            <button
              onClick={() => {
                router.push(`/lessons/${selectedLessonId}?tab=vocab`);
              }}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-all active:scale-95 cursor-pointer text-sm"
            >
              🏠 Quay lại từ vựng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
