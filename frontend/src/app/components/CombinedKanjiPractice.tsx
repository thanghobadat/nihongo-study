'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  KanjiItemData,
  COMMON_KANJI_DISTRACTORS,
  shuffleArray
} from '../utils/kanjiPracticeHelper';
import { playAudioWithFallback, playSpeedrunSound } from '../utils/audioHelper';
import { buildVocabKanjiExplanation } from '../utils/kanjiOverhaulHelper';

interface CombinedKanjiPracticeProps {
  kanjiList: KanjiItemData[];
  vocabList?: any[];
  grammarList?: any[];
  currentLevel?: 'N5' | 'N4';
  onUpdateKanjiStatus?: (id: number, type: 'vocabulary' | 'kanji' | 'grammar', status: 'not_learned' | 'learning' | 'mastered') => void;
}

export type VocabReflexDirection = 'kanji_to_hira' | 'hira_to_kanji' | 'complete_compound' | 'all';

export interface VocabReflexQuestion {
  id: string;
  targetVocab: any;
  subject: string;
  subSubject?: string;
  promptText: string;
  correctAnswerText: string;
  options: { text: string; isCorrect: boolean }[];
  type: 'kanji_to_hira' | 'hira_to_kanji' | 'complete_compound';
  explanation: string;
}

export default function CombinedKanjiPractice({
  kanjiList,
  vocabList = [],
  currentLevel = 'N5',
  onUpdateKanjiStatus
}: CombinedKanjiPracticeProps) {
  // Scope filter: 'level' (N5/N4) | 'all_50' (toàn bộ 50 bài) | mã bài cụ thể '1'..'50'
  const [scopeFilter, setScopeFilter] = useState<'level' | 'all_50' | string>('level');

  // Status Filter: 'all' | 'not_learned' | 'learning' | 'mastered'
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_learned' | 'learning' | 'mastered'>('all');

  // Toggle ma trận tiến độ 50 bài
  const [showLessonMatrix, setShowLessonMatrix] = useState<boolean>(false);

  // Chiều câu hỏi phản xạ: Đọc âm (Kanji->Hira), Nhận diện (Hira->Kanji), Hoàn thiện từ ghép, hoặc Tổng hợp
  const [direction, setDirection] = useState<VocabReflexDirection>('all');

  // Trạng thái gameplay Speedrun
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [maxTime, setMaxTime] = useState<number>(10);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Câu hỏi hiện tại, câu hỏi vừa làm sai và danh sách các câu làm sai để ôn lại
  const [currentQ, setCurrentQ] = useState<VocabReflexQuestion | null>(null);
  const [failedQuestion, setFailedQuestion] = useState<VocabReflexQuestion | null>(null);
  const [wrongVocabList, setWrongVocabList] = useState<any[]>([]);
  const [expandedExplanationIds, setExpandedExplanationIds] = useState<Record<string, boolean>>({});

  const timerRef = useRef<any>(null);
  const scoreRef = useRef<number>(0);
  const maxTimeRef = useRef<number>(10);

  // Helper phát âm thanh
  const handlePlayAudio = useCallback((charOrWord: string, reading?: string) => {
    playAudioWithFallback(charOrWord, reading || charOrWord);
  }, []);

  // 1. Lọc kho từ vựng CÓ CHỨA CHỮ HÁN theo phạm vi (N5 / N4 / Toàn bộ 50 bài / Bài cụ thể)
  const scopedVocabs = useMemo(() => {
    const list = (vocabList || []).filter(v => {
      if (!v || !v.hiragana) return false;
      const kWord = (v.kanji_form || v.kanji || '').trim();
      return kWord && kWord !== v.hiragana && /[\u4E00-\u9FAF]/.test(kWord);
    });

    if (scopeFilter === 'all_50') return list;
    if (scopeFilter === 'level') {
      const start = currentLevel === 'N5' ? 1 : 26;
      const end = currentLevel === 'N5' ? 25 : 50;
      return list.filter(v => v.lesson_id >= start && v.lesson_id <= end);
    }
    const lId = parseInt(scopeFilter, 10);
    if (!isNaN(lId)) {
      return list.filter(v => v.lesson_id === lId);
    }
    return list;
  }, [vocabList, scopeFilter, currentLevel]);

  // 2. Lọc tiếp theo trạng thái học tập
  const eligibleVocabs = useMemo(() => {
    if (statusFilter === 'all') return scopedVocabs;
    return scopedVocabs.filter(v => (v.status || 'not_learned') === statusFilter);
  }, [scopedVocabs, statusFilter]);

  // Thống kê số lượng từ vựng Hán tự trong phạm vi
  const totalCount = scopedVocabs.length;
  const masteredCount = scopedVocabs.filter(v => v.status === 'mastered').length;
  const learningCount = scopedVocabs.filter(v => v.status === 'learning').length;
  const notLearnedCount = scopedVocabs.filter(v => (v.status || 'not_learned') === 'not_learned').length;
  const scopedMasteredPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  // Thống kê ma trận tiến độ theo 50 bài học
  const perLessonVocabStats = useMemo(() => {
    const stats: Record<number, { total: number; mastered: number; learning: number; notLearned: number; percent: number }> = {};
    for (let i = 1; i <= 50; i++) {
      const inLesson = (vocabList || []).filter(v => {
        if (!v || v.lesson_id !== i || !v.hiragana) return false;
        const kWord = (v.kanji_form || v.kanji || '').trim();
        return kWord && kWord !== v.hiragana && /[\u4E00-\u9FAF]/.test(kWord);
      });
      const total = inLesson.length;
      const mastered = inLesson.filter(v => v.status === 'mastered').length;
      const learning = inLesson.filter(v => v.status === 'learning').length;
      const notLearned = inLesson.filter(v => (v.status || 'not_learned') === 'not_learned').length;
      const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;
      stats[i] = { total, mastered, learning, notLearned, percent };
    }
    return stats;
  }, [vocabList]);

  // Nạp kỷ lục High Score theo tổ hợp bộ lọc
  useEffect(() => {
    try {
      const key = `vocab_kanji_high_${scopeFilter}_${statusFilter}_${direction}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setHighScore(parseInt(saved, 10) || 0);
      } else {
        setHighScore(0);
      }
    } catch (e) {
      // ignore
    }
  }, [scopeFilter, statusFilter, direction]);

  // Thời gian động theo streak: bắt đầu 10s, giảm 10% mỗi 3 streak đúng, tối thiểu 2s
  const getDynamicTimeForStreak = (currentStreak: number): number => {
    const reductionCount = Math.floor(currentStreak / 3);
    return Math.max(2, Math.round(10 * Math.pow(0.9, reductionCount) * 10) / 10);
  };

  // =========================================================================
  // TRÌNH SINH CÂU HỎI PHẢN XẠ TỪ VỰNG HÁN TỰ THỰC CHIẾN
  // =========================================================================
  const generateNextQuestion = useCallback((): VocabReflexQuestion | null => {
    if (eligibleVocabs.length === 0) return null;

    // Chọn ngẫu nhiên từ vựng mục tiêu
    const target = eligibleVocabs[Math.floor(Math.random() * eligibleVocabs.length)];
    const kWord = (target.kanji_form || target.kanji || '').trim();

    // Xác định dạng câu hỏi
    let qType: 'kanji_to_hira' | 'hira_to_kanji' | 'complete_compound' = 'kanji_to_hira';
    if (direction === 'kanji_to_hira') qType = 'kanji_to_hira';
    else if (direction === 'hira_to_kanji') qType = 'hira_to_kanji';
    else if (direction === 'complete_compound') qType = 'complete_compound';
    else {
      // Khi chọn 'all': Kiểm tra nếu từ có >= 2 chữ Kanji thì chia đều 3 dạng, nếu từ đơn thì chia 2 dạng đầu
      const kanjiCount = (kWord.match(/[\u4E00-\u9FAF]/g) || []).length;
      if (kanjiCount >= 2) {
        const rand = Math.random();
        if (rand < 0.34) qType = 'kanji_to_hira';
        else if (rand < 0.67) qType = 'hira_to_kanji';
        else qType = 'complete_compound';
      } else {
        qType = Math.random() < 0.5 ? 'kanji_to_hira' : 'hira_to_kanji';
      }
    }

    const explanation = buildVocabKanjiExplanation({
      targetVocab: {
        kanjiWord: kWord,
        hiragana: target.hiragana,
        meaning: target.vietnamese_meaning || '',
        romaji: target.romaji
      },
      allLessonKanji: kanjiList
    });

    const otherVocabs = eligibleVocabs.filter(v => v.id !== target.id);

    // -----------------------------------------------------------------------
    // DẠNG 1: 🈸 ➔ 🇯🇵 ĐỌC ÂM KANJI (Kanji ➔ Hiragana)
    // -----------------------------------------------------------------------
    if (qType === 'kanji_to_hira') {
      const correctAns = target.hiragana;

      // Thu thập 3 phương án Hiragana gây nhiễu
      const distractorHiras = new Set<string>();

      // Lấy từ các từ vựng khác trong bài/kho
      for (const ov of shuffleArray(otherVocabs)) {
        if (ov.hiragana && ov.hiragana !== correctAns) {
          distractorHiras.add(ov.hiragana);
        }
        if (distractorHiras.size >= 3) break;
      }

      // Tạo các bẫy biến âm nếu thiếu
      const phonologicalVariants: string[] = [];
      if (correctAns.includes('で')) phonologicalVariants.push(correctAns.replace(/で/g, 'て'));
      if (correctAns.includes('て')) phonologicalVariants.push(correctAns.replace(/て/g, 'で'));
      if (correctAns.includes('じ')) phonologicalVariants.push(correctAns.replace(/じ/g, 'ち'));
      if (correctAns.includes('ば')) phonologicalVariants.push(correctAns.replace(/ば/g, 'は'));
      if (correctAns.includes('う')) phonologicalVariants.push(correctAns.replace(/う/g, ''));
      if (correctAns.includes('っ')) phonologicalVariants.push(correctAns.replace(/っ/g, 'つ'));

      for (const pv of shuffleArray(phonologicalVariants)) {
        if (distractorHiras.size >= 3) break;
        if (pv !== correctAns) distractorHiras.add(pv);
      }

      // Fallback
      const FALLBACK_HIRAS = ['かいしゃ', 'でんわ', 'きょうしつ', 'へや', 'せんせい', 'がくせい', 'じむしょ', 'しょくどう', 'びょういん', 'ぎんこう'];
      for (const fh of shuffleArray(FALLBACK_HIRAS)) {
        if (distractorHiras.size >= 3) break;
        if (fh !== correctAns) distractorHiras.add(fh);
      }

      const options = shuffleArray([
        { text: correctAns, isCorrect: true },
        ...Array.from(distractorHiras).slice(0, 3).map(h => ({ text: h, isCorrect: false }))
      ]);

      return {
        id: `q_k2h_${target.id}_${Date.now()}`,
        targetVocab: target,
        subject: `【 ${kWord} 】`,
        promptText: '👉 Chọn cách đọc Hiragana đúng của từ vựng:',
        correctAnswerText: correctAns,
        options,
        type: 'kanji_to_hira',
        explanation
      };
    }

    // -----------------------------------------------------------------------
    // DẠNG 2: 🇯🇵 ➔ 🈸 NHẬN DIỆN KANJI (Hiragana ➔ Kanji, KHÔNG CÓ NGHĨA)
    // -----------------------------------------------------------------------
    if (qType === 'hira_to_kanji') {
      const correctAns = kWord;

      // Thu thập 3 từ Kanji gây nhiễu (100% Kanji, tuyệt đối không dính Hiragana)
      const distractorKanjis = new Set<string>();

      for (const ov of shuffleArray(otherVocabs)) {
        const okw = (ov.kanji_form || ov.kanji || '').trim();
        if (okw && okw !== correctAns && !/[\u3040-\u309F]/.test(okw)) {
          distractorKanjis.add(okw);
        }
        if (distractorKanjis.size >= 3) break;
      }

      const FALLBACK_KANJIS = [
        '会社', '部屋', '教室', '食堂', '電話', '事務所', '会議', '受付', '外国',
        '時間', '毎日', '病院', '銀行', '先生', '学生', '学校', '時計', '本', '車'
      ];
      for (const fk of shuffleArray(FALLBACK_KANJIS)) {
        if (distractorKanjis.size >= 3) break;
        if (fk !== correctAns) distractorKanjis.add(fk);
      }

      const options = shuffleArray([
        { text: correctAns, isCorrect: true },
        ...Array.from(distractorKanjis).slice(0, 3).map(k => ({ text: k, isCorrect: false }))
      ]);

      return {
        id: `q_h2k_${target.id}_${Date.now()}`,
        targetVocab: target,
        subject: `「 ${target.hiragana} 」`,
        promptText: '👉 Chọn từ vựng chữ Hán tương ứng với cách đọc:',
        correctAnswerText: correctAns,
        options,
        type: 'hira_to_kanji',
        explanation
      };
    }

    // -----------------------------------------------------------------------
    // DẠNG 3: 🧩 HOÀN THIỆN TỪ GHÉP (Từ vựng khuyết 1 chữ Hán kèm cách đọc)
    // -----------------------------------------------------------------------
    // Tìm các vị trí chứa chữ Kanji trong từ
    const kanjiIndices: number[] = [];
    for (let i = 0; i < kWord.length; i++) {
      if (/[\u4E00-\u9FAF]/.test(kWord[i])) {
        kanjiIndices.push(i);
      }
    }

    // Nếu từ không có chữ Kanji nào, fallback về dạng 1
    if (kanjiIndices.length === 0) {
      return {
        id: `q_k2h_${target.id}_${Date.now()}`,
        targetVocab: target,
        subject: `【 ${kWord} 】`,
        promptText: '👉 Chọn cách đọc Hiragana đúng của từ vựng:',
        correctAnswerText: target.hiragana,
        options: shuffleArray([
          { text: target.hiragana, isCorrect: true },
          { text: 'かいしゃ', isCorrect: false },
          { text: 'でんわ', isCorrect: false },
          { text: 'せんせい', isCorrect: false }
        ]),
        type: 'kanji_to_hira',
        explanation
      };
    }

    // Chọn ngẫu nhiên 1 vị trí chữ Kanji để khuyết
    const maskIdx = kanjiIndices[Math.floor(Math.random() * kanjiIndices.length)];
    const targetChar = kWord[maskIdx];
    const maskedWord = kWord.split('').map((c: string, i: number) => (i === maskIdx ? '【 ? 】' : c)).join('');

    // Thu thập 3 chữ Hán đơn lẻ gây nhiễu
    const distractorChars = new Set<string>();

    // Ưu tiên lấy từ kanjiList
    for (const k of shuffleArray(kanjiList)) {
      if (k.character && k.character !== targetChar) {
        distractorChars.add(k.character);
      }
      if (distractorChars.size >= 3) break;
    }

    // Lấy từ COMMON_KANJI_DISTRACTORS nếu thiếu
    if (distractorChars.size < 3) {
      for (const d of shuffleArray(COMMON_KANJI_DISTRACTORS)) {
        if (d.character !== targetChar) distractorChars.add(d.character);
        if (distractorChars.size >= 3) break;
      }
    }

    const FALLBACK_SINGLES = ['会', '社', '電', '話', '教', '室', '食', '堂', '所', '時', '計', '校', '生', '先', '学', '員', '国', '駅'];
    for (const fs of shuffleArray(FALLBACK_SINGLES)) {
      if (distractorChars.size >= 3) break;
      if (fs !== targetChar) distractorChars.add(fs);
    }

    const options = shuffleArray([
      { text: targetChar, isCorrect: true },
      ...Array.from(distractorChars).slice(0, 3).map(c => ({ text: c, isCorrect: false }))
    ]);

    return {
      id: `q_comp_${target.id}_${Date.now()}`,
      targetVocab: target,
      subject: `「 ${maskedWord} 」`,
      subSubject: `＝ ${target.hiragana}`,
      promptText: '👉 Chọn chữ Hán thích hợp điền vào 【 ? 】:',
      correctAnswerText: targetChar,
      options,
      type: 'complete_compound',
      explanation
    };
  }, [eligibleVocabs, direction, kanjiList]);

  // Bắt đầu game Speedrun
  const startGame = () => {
    if (eligibleVocabs.length === 0) return;
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    scoreRef.current = 0;
    setStreak(0);
    setMaxStreak(0);
    setWrongVocabList([]);
    setFailedQuestion(null);
    setSelectedIdx(null);
    setIsEvaluating(false);

    const initialTime = 10;
    setMaxTime(initialTime);
    maxTimeRef.current = initialTime;
    setTimeLeft(initialTime);

    const q = generateNextQuestion();
    setCurrentQ(q);
  };

  // Đồng hồ đếm ngược
  useEffect(() => {
    if (!gameActive || gameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return Math.round((prev - 0.1) * 10) / 10;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameActive, gameOver, currentQ]);

  // Xử lý khi hết giờ
  const handleTimeout = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    playSpeedrunSound('wrong');
    setGameOver(true);
    setGameActive(false);

    if (currentQ) {
      setFailedQuestion(currentQ);
      setWrongVocabList(list => {
        if (list.some(v => v.id === currentQ.targetVocab.id)) return list;
        return [...list, currentQ.targetVocab];
      });
    }

    const currentScore = scoreRef.current;
    if (currentScore > highScore) {
      setHighScore(currentScore);
      try {
        localStorage.setItem(`vocab_kanji_high_${scopeFilter}_${statusFilter}_${direction}`, currentScore.toString());
      } catch (e) {
        // ignore
      }
    }
  };

  // Người chơi chọn phương án
  const handleSelectAnswer = (idx: number) => {
    if (isEvaluating || !currentQ || gameOver) return;
    setIsEvaluating(true);
    setSelectedIdx(idx);

    const chosenOpt = currentQ.options[idx];
    const isCorrect = chosenOpt.isCorrect;

    if (isCorrect) {
      playSpeedrunSound('correct');
      // Phát âm từ vựng
      handlePlayAudio(currentQ.targetVocab.kanji_form || currentQ.targetVocab.kanji || currentQ.targetVocab.hiragana, currentQ.targetVocab.hiragana);

      const newScore = score + 1;
      setScore(newScore);
      scoreRef.current = newScore;

      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }

      if (newScore > highScore) {
        setHighScore(newScore);
        try {
          localStorage.setItem(`vocab_kanji_high_${scopeFilter}_${statusFilter}_${direction}`, newScore.toString());
        } catch (e) {
          // ignore
        }
      }

      setTimeout(() => {
        const nextTime = getDynamicTimeForStreak(newStreak);
        setMaxTime(nextTime);
        maxTimeRef.current = nextTime;
        setTimeLeft(nextTime);
        setSelectedIdx(null);
        setIsEvaluating(false);

        const nextQ = generateNextQuestion();
        setCurrentQ(nextQ);
      }, 500);
    } else {
      playSpeedrunSound('wrong');
      setGameOver(true);
      setGameActive(false);
      setFailedQuestion(currentQ);
      setWrongVocabList(list => {
        if (list.some(v => v.id === currentQ.targetVocab.id)) return list;
        return [...list, currentQ.targetVocab];
      });

      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Toggle xem giải thích chi tiết của một từ trong danh sách sai
  const toggleExplanation = (vocabId: string) => {
    setExpandedExplanationIds(prev => ({
      ...prev,
      [vocabId]: !prev[vocabId]
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ========================================================================= */}
      {/* THANH ĐIỀU KHIỂN & BỘ LỌC PHẠM VI HỌC TẬP                                 */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Hàng 1: Tiêu đề & Tiến độ tổng thể */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-rose-500/20">
              ⚡
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Luyện Phản Xạ Từ Vựng Hán Tự (Thi JLPT)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ôn luyện các từ vựng chữ Hán xuất hiện trong đề thi JLPT N5 / N4 dưới áp lực 10s
              </p>
            </div>
          </div>

          {/* Nút bấm mở Ma trận 50 bài */}
          <button
            type="button"
            onClick={() => setShowLessonMatrix(prev => !prev)}
            className="self-start sm:self-auto py-2 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>📊</span>
            <span>{showLessonMatrix ? 'Ẩn ma trận tiến độ' : 'Xem tiến độ 50 bài'}</span>
          </button>
        </div>

        {/* Hàng 2: Thanh tiến độ tổng quan */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-300">
              Tiến độ từ vựng Kanji phạm vi đang chọn:
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-black">
              {masteredCount}/{totalCount} từ đã thuộc ({scopedMasteredPercent}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
            <div
              style={{ width: `${scopedMasteredPercent}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              title={`Đã thuộc: ${masteredCount}`}
            />
            <div
              style={{ width: `${totalCount > 0 ? (learningCount / totalCount) * 100 : 0}%` }}
              className="h-full bg-amber-400 transition-all duration-300"
              title={`Đang học: ${learningCount}`}
            />
          </div>
        </div>

        {/* Ma trận tiến độ từng bài (nếu mở rộng) */}
        {showLessonMatrix && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                🎯 Nhấp vào bài học để chọn nhanh phạm vi luyện tập:
              </span>
              <span className="text-[11px] text-slate-400">
                (🟢 100% • 🟡 &gt;0% • ⚪ 0%)
              </span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {Array.from({ length: 50 }, (_, i) => i + 1).map(lId => {
                const s = perLessonVocabStats[lId] || { total: 0, mastered: 0, percent: 0 };
                const isSelected = scopeFilter === lId.toString();
                let statusColor = 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800';
                if (s.percent === 100 && s.total > 0) {
                  statusColor = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800';
                } else if (s.percent > 0) {
                  statusColor = 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800';
                }
                if (isSelected) {
                  statusColor += ' ring-2 ring-indigo-500 shadow-md font-black';
                }

                return (
                  <button
                    key={lId}
                    type="button"
                    onClick={() => {
                      setScopeFilter(lId.toString());
                      setShowLessonMatrix(false);
                    }}
                    className={`p-1.5 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer hover:scale-105 ${statusColor}`}
                    title={`Bài ${lId}: ${s.mastered}/${s.total} từ thuộc (${s.percent}%)`}
                  >
                    <div>B.{lId}</div>
                    <div className="text-[9px] opacity-75">{s.mastered}/{s.total}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Hàng 3: Bộ chọn Phạm vi & Trạng thái */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Bộ chọn Phạm vi */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold">Phạm vi:</span>
            <select
              value={scopeFilter}
              onChange={e => setScopeFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
            >
              <optgroup label="Cấp độ chuẩn JLPT">
                <option value="level">Cấp độ {currentLevel} ({currentLevel === 'N5' ? 'Bài 1-25' : 'Bài 26-50'})</option>
                <option value="all_50">Toàn bộ 50 bài học (N5 + N4)</option>
              </optgroup>
              <optgroup label="Từng bài học cụ thể">
                {Array.from({ length: 50 }, (_, i) => i + 1).map(lNum => {
                  const st = perLessonVocabStats[lNum];
                  return (
                    <option key={lNum} value={lNum.toString()}>
                      Bài {lNum} ({st ? `${st.mastered}/${st.total} từ thuộc` : '0 từ'})
                    </option>
                  );
                })}
              </optgroup>
            </select>
          </div>

          {/* Bộ chọn Trạng thái */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
            >
              <option value="all">Tất cả ({scopedVocabs.length})</option>
              <option value="not_learned">🔴 Chưa học ({scopedVocabs.filter(v => (v.status || 'not_learned') === 'not_learned').length})</option>
              <option value="learning">🟡 Đang học ({scopedVocabs.filter(v => v.status === 'learning').length})</option>
              <option value="mastered">🟢 Đã thuộc ({scopedVocabs.filter(v => v.status === 'mastered').length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VÙNG CHƠI SPEEDRUN PHẢN XẠ TỪ VỰNG HÁN TỰ                                  */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {/* MÀN HÌNH 1: SẴN SÀNG & CẤU HÌNH CHIỀU CÂU HỎI */}
        {!gameActive && !gameOver && (
          <div className="p-6 sm:p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-amber-500/20 text-white animate-bounce">
              ⚡
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100">
                Thử Thách Phản Xạ Từ Vựng Hán Tự Thi JLPT
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                Luyện phản xạ tốc độ cao giúp bạn nhận diện tức thời cách đọc và chữ viết của <b>{eligibleVocabs.length} từ vựng chữ Hán</b>.
                Thời gian xuất phát từ 10s, mỗi chuỗi 3 câu đúng giảm 10%.
              </p>
            </div>

            {/* Bộ chọn 3 dạng câu hỏi + Tổng hợp */}
            <div className="space-y-2 text-left bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Dạng câu hỏi phản xạ:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('kanji_to_hira')}
                  className={`p-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                    direction === 'kanji_to_hira'
                      ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[13px] mb-0.5">🈸 ➔ 🇯🇵 Đọc âm Kanji</div>
                  <div className="text-[10px] opacity-75 font-normal">Cho chữ Hán ➔ Chọn Hiragana</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDirection('hira_to_kanji')}
                  className={`p-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                    direction === 'hira_to_kanji'
                      ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[13px] mb-0.5">🇯🇵 ➔ 🈸 Nhận diện Kanji</div>
                  <div className="text-[10px] opacity-75 font-normal">Cho Hiragana ➔ Chọn chữ Hán</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDirection('complete_compound')}
                  className={`p-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                    direction === 'complete_compound'
                      ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[13px] mb-0.5">🧩 Hoàn thiện từ ghép</div>
                  <div className="text-[10px] opacity-75 font-normal">Điền chữ Hán vào từ khuyết</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDirection('all')}
                  className={`p-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                    direction === 'all'
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm font-extrabold'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[13px] mb-0.5">🔀 Đề thi tổng hợp</div>
                  <div className="text-[10px] opacity-75 font-normal">Trộn đều cả 3 dạng trên</div>
                </button>
              </div>
            </div>

            {/* Kỷ lục hiện tại */}
            <div className="flex items-center justify-between px-2 text-xs">
              <span className="text-slate-400 font-bold">Kỷ lục hiện tại:</span>
              <span className="text-amber-500 font-black text-sm">{highScore} điểm</span>
            </div>

            {/* Nút Bắt đầu */}
            <button
              type="button"
              disabled={eligibleVocabs.length === 0}
              onClick={startGame}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-black text-sm shadow-xl shadow-rose-500/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {eligibleVocabs.length === 0 ? 'Chưa có từ vựng nào phù hợp bộ lọc' : '⚡ BẮT ĐẦU PHẢN XẠ NHANH (10S)'}
            </button>
          </div>
        )}

        {/* MÀN HÌNH 2: ĐANG CHƠI GAME */}
        {gameActive && currentQ && (
          <div className="p-4 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md max-w-xl mx-auto space-y-6">
            {/* Header: Điểm, Streak & Đồng hồ đếm ngược */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                  Điểm: {score}
                </span>
                {streak > 1 && (
                  <span className="text-xs font-extrabold text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20 animate-pulse">
                    🔥 Chuỗi: {streak}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 font-mono text-sm font-black text-slate-700 dark:text-slate-200">
                <span>⏱️</span>
                <span className={timeLeft <= 3 ? 'text-rose-500 font-black animate-ping' : ''}>
                  {timeLeft.toFixed(1)}s
                </span>
              </div>
            </div>

            {/* Thanh thời gian co lại */}
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${(timeLeft / maxTime) * 100}%` }}
                className={`h-full transition-all duration-100 ${
                  timeLeft <= 3 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'
                }`}
              />
            </div>

            {/* Khung Câu hỏi */}
            <div className="text-center py-6 px-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-400">
                {currentQ.promptText}
              </div>

              {/* Đối tượng câu hỏi lớn */}
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Noto_Sans_JP'] tracking-wide">
                {currentQ.subject}
              </div>

              {currentQ.subSubject && (
                <div className="text-sm sm:text-base font-bold text-indigo-600 dark:text-indigo-400 font-['Noto_Sans_JP']">
                  {currentQ.subSubject}
                </div>
              )}
            </div>

            {/* 4 Phương án lựa chọn A, B, C, D */}
            <div className="grid grid-cols-2 gap-3">
              {currentQ.options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isChosen = selectedIdx === idx;
                const isCorrect = opt.isCorrect;

                let btnStyle = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 text-slate-800 dark:text-slate-200';
                let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';

                if (selectedIdx !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/50';
                    badgeStyle = 'bg-white/20 text-white';
                  } else if (isChosen && !isCorrect) {
                    btnStyle = 'bg-rose-500 text-white border-rose-600 shadow-md';
                    badgeStyle = 'bg-white/20 text-white';
                  } else {
                    btnStyle = 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isEvaluating}
                    onClick={() => handleSelectAnswer(idx)}
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 font-bold text-left transition-all duration-150 cursor-pointer shadow-sm flex items-center justify-between gap-2 active:scale-[0.98] ${btnStyle}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${badgeStyle}`}>
                        {letter}
                      </span>
                      <span className={`font-['Noto_Sans_JP'] truncate ${
                        currentQ.type === 'complete_compound' ? 'text-2xl font-black' : 'text-sm sm:text-base font-bold'
                      }`}>
                        {opt.text}
                      </span>
                    </div>

                    {selectedIdx !== null && isCorrect && (
                      <span className="text-white text-base font-black shrink-0">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MÀN HÌNH 3: GAME OVER (KẾT THÚC & THẺ GIẢI THÍCH CHI TIẾT) */}
        {gameOver && (
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
            {/* Header kết thúc */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center text-3xl shadow-md">
                💥
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                KẾT THÚC LƯỢT CHƠI!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {timeLeft <= 0 ? 'Đã hết thời gian phản xạ (10s)!' : 'Bạn đã chọn đáp án chưa chính xác.'}
              </p>
            </div>

            {/* Bảng điểm */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">ĐIỂM ĐẠT ĐƯỢC</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-500">{score}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">CHUỖI ĐÚNG DÀI NHẤT</span>
                <span className="text-2xl sm:text-3xl font-black text-rose-500">{maxStreak}</span>
              </div>
            </div>

            {/* THẺ GIẢI THÍCH CHI TIẾT CỦA CÂU BỊ SAI (NỔI BẬT) */}
            {failedQuestion && (
              <div className="p-4 sm:p-5 rounded-2xl border border-indigo-500/30 bg-indigo-50/20 dark:bg-indigo-950/20 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20">
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    💡 Phân tích câu hỏi vừa sai: {failedQuestion.subject}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(
                      failedQuestion.targetVocab.kanji_form || failedQuestion.targetVocab.kanji || failedQuestion.targetVocab.hiragana,
                      failedQuestion.targetVocab.hiragana
                    )}
                    className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    🔊 Nghe phát âm
                  </button>
                </div>

                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Đáp án chính xác: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{failedQuestion.correctAnswerText}</span>
                </div>

                {/* Thẻ Giải Thích Bóc Tách Hán Tự */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 font-medium whitespace-pre-line leading-relaxed shadow-sm">
                  {failedQuestion.explanation}
                </div>
              </div>
            )}

            {/* DANH SÁCH TẤT CẢ CÁC TỪ LÀM SAI TRONG LƯỢT */}
            {wrongVocabList.length > 0 && (
              <div className="space-y-2 text-left bg-rose-500/5 p-4 rounded-2xl border border-rose-500/20">
                <span className="text-xs font-bold text-rose-500 block">
                  Danh sách từ vựng cần chú ý ôn lại ({wrongVocabList.length} từ):
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {wrongVocabList.map(v => {
                    const kWord = v.kanji_form || v.kanji;
                    const isExp = expandedExplanationIds[v.id];
                    const expText = buildVocabKanjiExplanation({
                      targetVocab: {
                        kanjiWord: kWord,
                        hiragana: v.hiragana,
                        meaning: v.vietnamese_meaning || '',
                        romaji: v.romaji
                      },
                      allLessonKanji: kanjiList
                    });

                    return (
                      <div
                        key={v.id}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-500/20 text-xs space-y-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="font-black text-rose-500 font-['Noto_Sans_JP'] text-lg">
                              {kWord}
                            </span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              ({v.hiragana}) • {v.vietnamese_meaning}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handlePlayAudio(kWord, v.hiragana)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer text-xs"
                              title="Nghe phát âm"
                            >
                              🔊
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleExplanation(v.id.toString())}
                              className="py-1 px-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 text-[11px] transition-colors cursor-pointer"
                            >
                              {isExp ? 'Ẩn phân tích' : '📖 Phân tích Hán tự'}
                            </button>
                          </div>
                        </div>

                        {/* Mở rộng giải thích cấu tạo */}
                        {isExp && (
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-[11px] whitespace-pre-line leading-relaxed border border-slate-200 dark:border-slate-800 animate-in fade-in duration-150">
                            {expText}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nút Hành động */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={startGame}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                🔄 Chơi lại lượt mới
              </button>

              <button
                type="button"
                onClick={() => {
                  setGameActive(false);
                  setGameOver(false);
                }}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Quay lại màn hình thiết lập
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
