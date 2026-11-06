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

const N5_LESSONS = Array.from({ length: 25 }, (_, i) => i + 1);
const N4_LESSONS = Array.from({ length: 25 }, (_, i) => i + 26);
const ALL_50_LESSONS = Array.from({ length: 50 }, (_, i) => i + 1);

export default function CombinedKanjiPractice({
  kanjiList,
  vocabList = [],
  currentLevel = 'N5',
  onUpdateKanjiStatus
}: CombinedKanjiPracticeProps) {
  // Danh sách các bài học đang được tích chọn (hỗ trợ chọn nhiều bài tùy ý, ví dụ [1, 3, 5])
  const [selectedLessons, setSelectedLessons] = useState<number[]>(() =>
    currentLevel === 'N5' ? N5_LESSONS : N4_LESSONS
  );
  const [followGlobalLevel, setFollowGlobalLevel] = useState<boolean>(true);
  const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState<boolean>(false);
  const [pickerTab, setPickerTab] = useState<'all' | 'n5' | 'n4' | 'selected'>('all');
  const scopePickerRef = useRef<HTMLDivElement | null>(null);

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
  const [compoundQueue, setCompoundQueue] = useState<any[]>([]);
  const [compoundIndex, setCompoundIndex] = useState<number>(0);
  const [compoundAnsweredCount, setCompoundAnsweredCount] = useState<number>(0);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  const isCompoundRoundMode = direction === 'complete_compound';

  const timerRef = useRef<any>(null);
  const scoreRef = useRef<number>(0);
  const maxTimeRef = useRef<number>(10);

  // Helper phát âm thanh
  const handlePlayAudio = useCallback((charOrWord: string, reading?: string) => {
    playAudioWithFallback(charOrWord, reading || charOrWord);
  }, []);

  // Bản đồ bài học của từng chữ Hán trong chương trình 285 chữ (1..50)
  const kanjiLessonMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const k of (kanjiList || [])) {
      if (k && k.character) {
        map.set(k.character, Number((k as any).lesson_id) || 1);
      }
    }
    return map;
  }, [kanjiList]);

  // Kiểm tra từ vựng có tất cả chữ Hán thuộc phạm vi bài <= maxLesson (hoặc thuộc 285 chữ khi maxLesson = 50)
  const isWordWithinKanjiScope = useCallback((kWord: string, maxLesson: number) => {
    const chars = kWord.match(/[\u4E00-\u9FAF]/g);
    if (!chars || chars.length === 0) return false;
    if (kanjiLessonMap.size === 0) return true;
    return chars.every(c => {
      const kL = kanjiLessonMap.get(c);
      return kL !== undefined && kL <= maxLesson;
    });
  }, [kanjiLessonMap]);

  // Đồng bộ tự động khi đổi nút N5 / N4 ở đầu trang nếu người dùng chưa tùy chỉnh bài lẻ
  const prevLevelRef = useRef(currentLevel);
  useEffect(() => {
    if (prevLevelRef.current !== currentLevel) {
      prevLevelRef.current = currentLevel;
      if (followGlobalLevel) {
        setSelectedLessons(currentLevel === 'N5' ? N5_LESSONS : N4_LESSONS);
      }
    }
  }, [currentLevel, followGlobalLevel]);

  // Đóng Popover chọn bài khi click ra ngoài (Desktop) hoặc bấm phím Escape
  useEffect(() => {
    if (!isScopeDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (scopePickerRef.current && !scopePickerRef.current.contains(e.target as Node)) {
        setIsScopeDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsScopeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isScopeDropdownOpen]);

  // Dừng phiên chơi đang chạy nếu người dùng thay đổi phạm vi bài học
  const resetActiveSessionIfNeeded = useCallback(() => {
    if (gameActive || gameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameActive(false);
      setGameOver(false);
      setSelectedIdx(null);
      setLastAnswerCorrect(null);
      setIsEvaluating(false);
    }
  }, [gameActive, gameOver]);

  const sortedSelectedLessons = useMemo(
    () => [...selectedLessons].sort((a, b) => a - b),
    [selectedLessons]
  );

  const selectedLessonSet = useMemo(
    () => new Set(sortedSelectedLessons),
    [sortedSelectedLessons]
  );

  const isExactN5 =
    sortedSelectedLessons.length === 25 &&
    sortedSelectedLessons[0] === 1 &&
    sortedSelectedLessons[24] === 25;
  const isExactN4 =
    sortedSelectedLessons.length === 25 &&
    sortedSelectedLessons[0] === 26 &&
    sortedSelectedLessons[24] === 50;
  const isExactAll50 = sortedSelectedLessons.length === 50;
  const isCustomSelection =
    !isExactN5 && !isExactN4 && !isExactAll50 && sortedSelectedLessons.length > 0;

  const toggleLesson = useCallback(
    (lessonId: number) => {
      setFollowGlobalLevel(false);
      resetActiveSessionIfNeeded();
      setSelectedLessons(prev =>
        prev.includes(lessonId)
          ? prev.filter(id => id !== lessonId)
          : [...prev, lessonId].sort((a, b) => a - b)
      );
    },
    [resetActiveSessionIfNeeded]
  );

  const applyLessonPreset = useCallback(
    (preset: 'n5' | 'n4' | 'all_50' | 'clear') => {
      resetActiveSessionIfNeeded();
      if (preset === 'n5') {
        setSelectedLessons(N5_LESSONS);
        setFollowGlobalLevel(currentLevel === 'N5');
      } else if (preset === 'n4') {
        setSelectedLessons(N4_LESSONS);
        setFollowGlobalLevel(currentLevel === 'N4');
      } else if (preset === 'all_50') {
        setSelectedLessons(ALL_50_LESSONS);
        setFollowGlobalLevel(false);
      } else {
        setSelectedLessons([]);
        setFollowGlobalLevel(false);
      }
    },
    [currentLevel, resetActiveSessionIfNeeded]
  );

  const scopeSummaryLabel = useMemo(() => {
    if (sortedSelectedLessons.length === 0) return 'Chưa chọn bài nào (Bấm để chọn)';
    if (isExactAll50) return 'Toàn bộ 50 bài (N5 + N4)';
    if (isExactN5) return 'Cấp độ N5 (Bài 1–25)';
    if (isExactN4) return 'Cấp độ N4 (Bài 26–50)';
    if (sortedSelectedLessons.length === 1) return `Bài ${sortedSelectedLessons[0]} (1 bài)`;
    if (sortedSelectedLessons.length <= 5) {
      return `Đã chọn ${sortedSelectedLessons.length} bài: Bài ${sortedSelectedLessons.join(', ')}`;
    }
    return `Đã chọn ${sortedSelectedLessons.length} bài: Bài ${sortedSelectedLessons.slice(0, 4).join(', ')}...`;
  }, [sortedSelectedLessons, isExactAll50, isExactN5, isExactN4]);

  const visiblePickerLessons = useMemo(() => {
    if (pickerTab === 'n5') return N5_LESSONS;
    if (pickerTab === 'n4') return N4_LESSONS;
    if (pickerTab === 'selected') return sortedSelectedLessons;
    return ALL_50_LESSONS;
  }, [pickerTab, sortedSelectedLessons]);

  // Tiền tính toán danh sách từ vựng Hán tự hợp lệ của từng bài (1..50)
  const perLessonVocabs = useMemo(() => {
    const validVocabs = (vocabList || []).filter(v => {
      if (!v || !v.hiragana) return false;
      const kWord = (v.kanji_word || v.kanji_form || v.kanji || '').trim();
      return kWord && kWord !== v.hiragana && /[\u4E00-\u9FAF]/.test(kWord);
    });

    const byLesson: Record<number, any[]> = {};
    for (let i = 1; i <= 50; i++) {
      const lessonChars = new Set(
        (kanjiList || [])
          .filter(k => (Number((k as any).lesson_id) || 1) === i)
          .map(k => k.character)
      );
      byLesson[i] = validVocabs.filter(v => {
        if (v.lesson_id > i) return false;
        const kWord = (v.kanji_word || v.kanji_form || v.kanji || '').trim();
        if (!isWordWithinKanjiScope(kWord, i)) return false;
        if (v.lesson_id === i) return true;
        const chars = kWord.match(/[\u4E00-\u9FAF]/g) || [];
        return chars.some((c: string) => lessonChars.has(c));
      });
    }
    return byLesson;
  }, [vocabList, kanjiList, isWordWithinKanjiScope]);

  // Danh sách chữ Hán đơn trong phạm vi đang chọn (dùng làm phương án nhiễu đúng cấp độ/bài)
  const scopedKanjiItems = useMemo(() => {
    const all = kanjiList || [];
    if (sortedSelectedLessons.length === 0) return [];
    if (isExactAll50) return all;
    const exact = all.filter(k => selectedLessonSet.has(Number((k as any).lesson_id) || 1));
    if (exact.length >= 4) return exact;
    const maxL = sortedSelectedLessons[sortedSelectedLessons.length - 1];
    return all.filter(k => (Number((k as any).lesson_id) || 1) <= maxL);
  }, [kanjiList, sortedSelectedLessons, selectedLessonSet, isExactAll50]);

  // 1. Lọc kho từ vựng CÓ CHỨA CHỮ HÁN theo tập hợp các bài đã tích chọn (khử trùng lặp)
  const scopedVocabs = useMemo(() => {
    if (sortedSelectedLessons.length === 0) return [];
    const seenIds = new Set<any>();
    const combined: any[] = [];
    for (const lId of sortedSelectedLessons) {
      const items = perLessonVocabs[lId] || [];
      for (const v of items) {
        const key = v.id ?? `${v.lesson_id}_${v.hiragana}`;
        if (!seenIds.has(key)) {
          seenIds.add(key);
          combined.push(v);
        }
      }
    }
    return combined;
  }, [perLessonVocabs, sortedSelectedLessons]);

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

  // Thống kê ma trận tiến độ theo 50 bài học (khớp đúng phạm vi chữ Hán đã học tới bài i)
  const perLessonVocabStats = useMemo(() => {
    const stats: Record<number, { total: number; mastered: number; learning: number; notLearned: number; percent: number }> = {};
    for (let i = 1; i <= 50; i++) {
      const inLesson = perLessonVocabs[i] || [];
      const total = inLesson.length;
      const mastered = inLesson.filter(v => v.status === 'mastered').length;
      const learning = inLesson.filter(v => v.status === 'learning').length;
      const notLearned = inLesson.filter(v => (v.status || 'not_learned') === 'not_learned').length;
      const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;
      stats[i] = { total, mastered, learning, notLearned, percent };
    }
    return stats;
  }, [perLessonVocabs]);

  // Khóa lưu kỷ lục High Score tương thích ngược theo phạm vi đang tích chọn
  const scopeStorageKey = useMemo(() => {
    if (sortedSelectedLessons.length === 0) return 'none';
    if (isExactAll50) return 'all_50';
    if (isExactN5) return 'level_N5';
    if (isExactN4) return 'level_N4';
    if (sortedSelectedLessons.length === 1) return sortedSelectedLessons[0].toString();
    return `lessons_${sortedSelectedLessons.join('-')}`;
  }, [sortedSelectedLessons, isExactAll50, isExactN5, isExactN4]);

  // Nạp kỷ lục High Score theo tổ hợp bộ lọc
  useEffect(() => {
    try {
      const primaryKey = `vocab_kanji_high_${scopeStorageKey}_${statusFilter}_${direction}`;
      let saved = localStorage.getItem(primaryKey);
      if (!saved && ((isExactN5 && currentLevel === 'N5') || (isExactN4 && currentLevel === 'N4'))) {
        saved = localStorage.getItem(`vocab_kanji_high_level_${statusFilter}_${direction}`);
      }
      if (saved) {
        setHighScore(parseInt(saved, 10) || 0);
      } else {
        setHighScore(0);
      }
    } catch (e) {
      // ignore
    }
  }, [scopeStorageKey, statusFilter, direction, isExactN5, isExactN4, currentLevel]);

  // Thời gian động theo streak: bắt đầu 10s, giảm 10% mỗi 3 streak đúng, tối thiểu 2s
  const getDynamicTimeForStreak = (currentStreak: number): number => {
    const reductionCount = Math.floor(currentStreak / 3);
    return Math.max(2, Math.round(10 * Math.pow(0.9, reductionCount) * 10) / 10);
  };

  // =========================================================================
  // TRÌNH SINH CÂU HỎI PHẢN XẠ TỪ VỰNG HÁN TỰ THỰC CHIẾN
  // =========================================================================
  const generateNextQuestion = useCallback((forcedTarget?: any): VocabReflexQuestion | null => {
    if (!forcedTarget && eligibleVocabs.length === 0) return null;

    // Chọn từ vựng mục tiêu (theo lượt cố định nếu truyền forcedTarget, hoặc ngẫu nhiên cho Speedrun)
    const target = forcedTarget || eligibleVocabs[Math.floor(Math.random() * eligibleVocabs.length)];
    const kWord = (target.kanji_word || target.kanji_form || target.kanji || '').trim();

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
        const okw = (ov.kanji_word || ov.kanji_form || ov.kanji || '').trim();
        if (okw && okw !== correctAns && /[\u4E00-\u9FAF]/.test(okw)) {
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

    // Ưu tiên lấy từ chữ Hán trong phạm vi đang chọn trước, rồi mới tới kanjiList toàn cục
    for (const k of shuffleArray(scopedKanjiItems)) {
      if (k.character && k.character !== targetChar) {
        distractorChars.add(k.character);
      }
      if (distractorChars.size >= 3) break;
    }
    if (distractorChars.size < 3) {
      for (const k of shuffleArray(kanjiList)) {
        if (k.character && k.character !== targetChar) {
          distractorChars.add(k.character);
        }
        if (distractorChars.size >= 3) break;
      }
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
      subSubject: `＝ ${target.hiragana}${target.vietnamese_meaning ? ' • ' + target.vietnamese_meaning : ''}`,
      promptText: '👉 Chọn chữ Hán thích hợp điền vào 【 ? 】:',
      correctAnswerText: targetChar,
      options,
      type: 'complete_compound',
      explanation
    };
  }, [eligibleVocabs, direction, kanjiList, scopedKanjiItems]);

  // Bắt đầu game Speedrun hoặc Lượt Hoàn thiện từ ghép không đếm ngược
  const startGame = (customPool?: any[]) => {
    const poolToUse = Array.isArray(customPool) && customPool.length > 0 ? customPool : eligibleVocabs;
    if (poolToUse.length === 0) return;

    setGameActive(true);
    setGameOver(false);
    setScore(0);
    scoreRef.current = 0;
    setStreak(0);
    setMaxStreak(0);
    setWrongVocabList([]);
    setFailedQuestion(null);
    setSelectedIdx(null);
    setLastAnswerCorrect(null);
    setIsEvaluating(false);

    if (isCompoundRoundMode) {
      if (timerRef.current) clearInterval(timerRef.current);
      const shuffledQueue = shuffleArray([...poolToUse]);
      setCompoundQueue(shuffledQueue);
      setCompoundIndex(0);
      setCompoundAnsweredCount(0);
      const firstQ = generateNextQuestion(shuffledQueue[0]);
      setCurrentQ(firstQ);
    } else {
      const initialTime = 10;
      setMaxTime(initialTime);
      maxTimeRef.current = initialTime;
      setTimeLeft(initialTime);

      const q = generateNextQuestion();
      setCurrentQ(q);
    }
  };

  // Đồng hồ đếm ngược (chỉ kích hoạt cho các chế độ phản xạ 10s, tắt hoàn toàn ở Hoàn thiện từ ghép)
  useEffect(() => {
    if (!gameActive || gameOver || isCompoundRoundMode) {
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
  }, [gameActive, gameOver, currentQ, isCompoundRoundMode]);

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
        localStorage.setItem(`vocab_kanji_high_${scopeStorageKey}_${statusFilter}_${direction}`, currentScore.toString());
      } catch (e) {
        // ignore
      }
    }
  };

  // Chuyển sang câu tiếp theo trong chế độ Hoàn thiện từ ghép theo lượt
  const handleNextCompoundQuestion = () => {
    const nextIdx = compoundIndex + 1;
    if (nextIdx < compoundQueue.length) {
      setCompoundIndex(nextIdx);
      setSelectedIdx(null);
      setLastAnswerCorrect(null);
      setIsEvaluating(false);
      const nextQ = generateNextQuestion(compoundQueue[nextIdx]);
      setCurrentQ(nextQ);
    } else {
      setGameActive(false);
      setGameOver(true);
      setSelectedIdx(null);
      setLastAnswerCorrect(null);
      setIsEvaluating(false);
    }
  };

  // Kết thúc sớm lượt Hoàn thiện từ ghép để xem tổng kết
  const handleFinishCompoundRoundEarly = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameActive(false);
    setGameOver(true);
    setSelectedIdx(null);
    setLastAnswerCorrect(null);
    setIsEvaluating(false);
  };

  // Người chơi chọn phương án
  const handleSelectAnswer = (idx: number) => {
    if (isEvaluating || !currentQ || gameOver) return;
    setIsEvaluating(true);
    setSelectedIdx(idx);

    const chosenOpt = currentQ.options[idx];
    const isCorrect = chosenOpt.isCorrect;
    setLastAnswerCorrect(isCorrect);

    // Chế độ Hoàn thiện từ ghép: Không đếm ngược, không dừng ngang khi sai, luôn hiện giải thích chi tiết
    if (isCompoundRoundMode) {
      playSpeedrunSound(isCorrect ? 'correct' : 'wrong');
      handlePlayAudio(
        currentQ.targetVocab.kanji_word || currentQ.targetVocab.kanji_form || currentQ.targetVocab.kanji || currentQ.targetVocab.hiragana,
        currentQ.targetVocab.hiragana
      );
      setCompoundAnsweredCount(c => c + 1);

      if (isCorrect) {
        const newScore = scoreRef.current + 1;
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
            localStorage.setItem(`vocab_kanji_high_${scopeStorageKey}_${statusFilter}_${direction}`, newScore.toString());
          } catch (e) {
            // ignore
          }
        }
      } else {
        setStreak(0);
        setWrongVocabList(list => {
          if (list.some(v => v.id === currentQ.targetVocab.id)) return list;
          return [...list, currentQ.targetVocab];
        });
      }
      return;
    }

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
          localStorage.setItem(`vocab_kanji_high_${scopeStorageKey}_${statusFilter}_${direction}`, newScore.toString());
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                🎯 Nhấp vào các bài học để bật/tắt chọn nhiều bài cùng lúc:
              </span>
              <span className="text-[11px] text-slate-400">
                (🟢 100% • 🟡 &gt;0% • ⚪ 0%)
              </span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {ALL_50_LESSONS.map(lId => {
                const s = perLessonVocabStats[lId] || { total: 0, mastered: 0, percent: 0 };
                const isSelected = selectedLessonSet.has(lId);
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
                    onClick={() => toggleLesson(lId)}
                    className={`p-1.5 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer touch-manipulation active:scale-95 sm:hover:scale-105 ${statusColor}`}
                    title={`Bài ${lId}: ${s.mastered}/${s.total} từ thuộc (${s.percent}%)`}
                  >
                    <div>{isSelected ? `✓ B.${lId}` : `B.${lId}`}</div>
                    <div className="text-[9px] opacity-75">{s.mastered}/{s.total}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Hàng 3: Bộ chọn Phạm vi (Checkbox đa bài) & Trạng thái */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
          {/* Bộ chọn Phạm vi đa bài bằng Checkbox */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <span className="text-xs text-slate-500 font-bold shrink-0">Phạm vi:</span>
            <div ref={scopePickerRef} className="relative flex-1 sm:flex-initial min-w-0">
              <button
                type="button"
                onClick={() => setIsScopeDropdownOpen(prev => !prev)}
                className={`w-full sm:w-auto sm:min-w-[260px] min-h-[42px] px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-between gap-2.5 shadow-sm transition-all cursor-pointer touch-manipulation active:scale-[0.99] ${
                  sortedSelectedLessons.length === 0
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                    : isScopeDropdownOpen
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0 truncate">
                  <span className="shrink-0">☑️</span>
                  <span className="truncate">{scopeSummaryLabel}</span>
                </span>
                <span className="text-[10px] opacity-70 shrink-0">
                  {isScopeDropdownOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* Bảng Checkbox chọn nhiều bài (Bottom Sheet trên iPhone 15 Pro / Popover trên Desktop) */}
              {isScopeDropdownOpen && (
                <>
                  {/* Lớp nền mờ trên điện thoại (< 640px) */}
                  <div
                    className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[1px] sm:hidden"
                    onClick={() => setIsScopeDropdownOpen(false)}
                  />

                  <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl max-h-[82dvh] flex flex-col bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:absolute sm:inset-auto sm:left-0 sm:top-full sm:mt-2 sm:w-[540px] sm:max-w-[calc(100vw-3rem)] sm:max-h-[480px] sm:rounded-2xl animate-in fade-in duration-150">
                    {/* Thanh gạt chỉ báo trên iPhone */}
                    <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-2.5 sm:hidden shrink-0" />

                    {/* Tiêu đề bảng chọn */}
                    <div className="shrink-0 flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                          Chọn bài học muốn ôn
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                          {sortedSelectedLessons.length}/50 bài
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsScopeDropdownOpen(false)}
                        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-black cursor-pointer touch-manipulation shrink-0"
                        aria-label="Đóng bảng chọn bài"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Hàng nút chọn nhanh theo nhóm */}
                    <div className="shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2.5">
                      <button
                        type="button"
                        onClick={() => applyLessonPreset('n5')}
                        className={`min-h-[36px] px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer touch-manipulation active:scale-95 ${
                          isExactN5
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                      >
                        Chọn N5 (1–25)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyLessonPreset('n4')}
                        className={`min-h-[36px] px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer touch-manipulation active:scale-95 ${
                          isExactN4
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                      >
                        Chọn N4 (26–50)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyLessonPreset('all_50')}
                        className={`min-h-[36px] px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer touch-manipulation active:scale-95 ${
                          isExactAll50
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                      >
                        Tất cả 50 bài
                      </button>
                      <button
                        type="button"
                        disabled={sortedSelectedLessons.length === 0}
                        onClick={() => applyLessonPreset('clear')}
                        className="min-h-[36px] px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 disabled:opacity-40 transition-all cursor-pointer touch-manipulation active:scale-95"
                      >
                        🗑️ Bỏ chọn hết
                      </button>
                    </div>

                    {/* Thanh tab lọc danh sách hiển thị */}
                    <div className="shrink-0 grid grid-cols-4 gap-1 p-1 mt-2.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/70 dark:border-slate-800">
                      {([
                        { id: 'all', label: 'Tất cả' },
                        { id: 'n5', label: 'N5 (1-25)' },
                        { id: 'n4', label: 'N4 (26-50)' },
                        { id: 'selected', label: `Đã tích (${sortedSelectedLessons.length})` }
                      ] as const).map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setPickerTab(t.id)}
                          className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer touch-manipulation truncate ${
                            pickerTab === t.id
                              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Lưới Checkbox Bài 1..50 (2 cột trên iPhone 15 Pro, 3 cột trên Desktop) */}
                    <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 my-2.5 pr-0.5">
                      {visiblePickerLessons.length === 0 ? (
                        <div className="py-8 px-4 text-center space-y-2.5">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                            Chưa có bài học nào được tích chọn.
                          </p>
                          <button
                            type="button"
                            onClick={() => setPickerTab('all')}
                            className="py-2 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold border border-indigo-200 dark:border-indigo-800 cursor-pointer touch-manipulation"
                          >
                            Xem danh sách 50 bài để chọn
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {visiblePickerLessons.map(lNum => {
                            const st = perLessonVocabStats[lNum];
                            const isChecked = selectedLessonSet.has(lNum);
                            const dot =
                              !st || st.total === 0
                                ? '⚪'
                                : st.percent === 100
                                  ? '🟢'
                                  : st.percent > 0
                                    ? '🟡'
                                    : '⚪';

                            return (
                              <label
                                key={lNum}
                                className={`min-h-[48px] px-2.5 py-2 rounded-xl border flex items-center gap-2.5 cursor-pointer select-none touch-manipulation transition-all active:scale-[0.98] ${
                                  isChecked
                                    ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 ring-1 ring-indigo-500/30 shadow-xs'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleLesson(lNum)}
                                  className="w-4 h-4 rounded accent-indigo-600 cursor-pointer shrink-0"
                                />
                                <div className="min-w-0 flex-1 leading-tight">
                                  <div className="flex items-center justify-between gap-1">
                                    <span
                                      className={`text-xs font-extrabold ${
                                        isChecked
                                          ? 'text-indigo-700 dark:text-indigo-300'
                                          : 'text-slate-800 dark:text-slate-200'
                                      }`}
                                    >
                                      Bài {lNum}
                                    </span>
                                    <span className="text-[10px] shrink-0">{dot}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                    {st ? `${st.mastered}/${st.total} từ thuộc` : '0 từ'}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Chân bảng cố định */}
                    <div className="shrink-0 pt-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:pb-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        Tổng kho ôn:{' '}
                        <strong className="text-indigo-600 dark:text-indigo-400 font-black">
                          {scopedVocabs.length} từ Kanji
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsScopeDropdownOpen(false)}
                        className="min-h-[40px] py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer touch-manipulation shrink-0"
                      >
                        Xác nhận ({sortedSelectedLessons.length} bài)
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bộ chọn Trạng thái */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="text-xs text-slate-500 font-bold">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={e => {
                resetActiveSessionIfNeeded();
                setStatusFilter(e.target.value as any);
              }}
              className="w-full sm:w-auto min-h-[42px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm touch-manipulation"
            >
              <option value="all">Tất cả ({scopedVocabs.length})</option>
              <option value="not_learned">🔴 Chưa học ({notLearnedCount})</option>
              <option value="learning">🟡 Đang học ({learningCount})</option>
              <option value="mastered">🟢 Đã thuộc ({masteredCount})</option>
            </select>
          </div>
        </div>

        {/* Dải chip hiển thị trực quan các bài lẻ đang tích chọn (ví dụ Bài 1, Bài 3, Bài 5) */}
        {isCustomSelection && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 mr-0.5">
              Đang gộp ({sortedSelectedLessons.length}):
            </span>
            {sortedSelectedLessons.slice(0, 12).map(lId => (
              <button
                key={lId}
                type="button"
                onClick={() => toggleLesson(lId)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-indigo-700 dark:text-indigo-300 hover:text-rose-600 dark:hover:text-rose-400 border border-indigo-200/80 dark:border-indigo-800/70 text-[11px] font-extrabold transition-colors cursor-pointer touch-manipulation"
                title={`Bấm để bỏ chọn Bài ${lId}`}
              >
                <span>Bài {lId}</span>
                <span className="text-[10px] opacity-70">✕</span>
              </button>
            ))}
            {sortedSelectedLessons.length > 12 && (
              <button
                type="button"
                onClick={() => {
                  setPickerTab('selected');
                  setIsScopeDropdownOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold cursor-pointer touch-manipulation"
              >
                +{sortedSelectedLessons.length - 12} bài khác...
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsScopeDropdownOpen(true)}
              className="px-2.5 py-1 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-[11px] font-bold cursor-pointer touch-manipulation"
            >
              + Chọn thêm
            </button>
            <button
              type="button"
              onClick={() => applyLessonPreset('clear')}
              className="px-2 py-1 text-[11px] font-bold text-rose-500 hover:underline cursor-pointer touch-manipulation ml-auto"
            >
              Bỏ chọn hết
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VÙNG CHƠI SPEEDRUN PHẢN XẠ TỪ VỰNG HÁN TỰ                                  */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {/* MÀN HÌNH 1: SẴN SÀNG & CẤU HÌNH CHIỀU CÂU HỎI */}
        {!gameActive && !gameOver && (
          <div className="p-6 sm:p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto space-y-6">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl flex items-center justify-center text-3xl sm:text-4xl shadow-lg text-white animate-bounce ${
              isCompoundRoundMode
                ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-indigo-500/20'
                : 'bg-gradient-to-tr from-amber-500 to-rose-500 shadow-amber-500/20'
            }`}>
              {isCompoundRoundMode ? '🧩' : '⚡'}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100">
                {isCompoundRoundMode ? 'Luyện Hoàn Thiện Từ Ghép Hán Tự' : 'Thử Thách Phản Xạ Từ Vựng Hán Tự Thi JLPT'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                {isCompoundRoundMode ? (
                  <>
                    Luyện điền chữ Hán vào từ khuyết <b>không giới hạn thời gian</b> qua trọn bộ <b>{eligibleVocabs.length} từ vựng chữ Hán</b> trong phạm vi đang chọn.
                    Mọi câu dù đúng hay sai đều kèm giải thích chi tiết cấu tạo Hán tự.
                  </>
                ) : (
                  <>
                    Luyện phản xạ tốc độ cao giúp bạn nhận diện tức thời cách đọc và chữ viết của <b>{eligibleVocabs.length} từ vựng chữ Hán</b>.
                    Thời gian xuất phát từ 10s, mỗi chuỗi 3 câu đúng giảm 10%.
                  </>
                )}
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
                  <div className="text-[10px] opacity-75 font-normal">Không đếm ngược • Giải thích mọi câu</div>
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

            {/* Kỷ lục hiện tại / Số câu lượt học */}
            <div className="flex items-center justify-between px-2 text-xs">
              {isCompoundRoundMode ? (
                <>
                  <span className="text-slate-400 font-bold">Số từ trong lượt luyện:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black text-sm">
                    {eligibleVocabs.length} câu (Không đếm ngược)
                  </span>
                </>
              ) : (
                <>
                  <span className="text-slate-400 font-bold">Kỷ lục hiện tại:</span>
                  <span className="text-amber-500 font-black text-sm">{highScore} điểm</span>
                </>
              )}
            </div>

            {/* Nút Bắt đầu */}
            <button
              type="button"
              disabled={eligibleVocabs.length === 0}
              onClick={() => startGame()}
              className={`w-full py-4 rounded-2xl text-white font-black text-sm shadow-xl transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 ${
                isCompoundRoundMode
                  ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/20'
                  : 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 shadow-rose-500/20'
              }`}
            >
              {sortedSelectedLessons.length === 0
                ? '⚠️ Hãy tích chọn ít nhất 1 bài học ở mục Phạm vi'
                : eligibleVocabs.length === 0
                  ? 'Chưa có từ vựng nào phù hợp bộ lọc trạng thái'
                  : isCompoundRoundMode
                    ? `🧩 BẮT ĐẦU HOÀN THIỆN TỪ GHÉP (${eligibleVocabs.length} CÂU)`
                    : '⚡ BẮT ĐẦU PHẢN XẠ NHANH (10S)'}
            </button>
          </div>
        )}

        {/* MÀN HÌNH 2: ĐANG CHƠI GAME / ĐANG LUYỆN TỪ GHÉP */}
        {gameActive && currentQ && (
          <div className="p-4 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md max-w-xl mx-auto space-y-6">
            {/* Header: Điểm, Streak & Tiến độ / Đồng hồ */}
            <div className="flex items-center justify-between gap-2">
              {isCompoundRoundMode ? (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                      🧩 Câu {compoundIndex + 1} / {compoundQueue.length}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                      ✅ Đúng: {score}
                    </span>
                    {streak > 1 && (
                      <span className="text-xs font-extrabold text-amber-500 bg-amber-500/10 px-2.5 py-1.5 rounded-full border border-amber-500/20">
                        🔥 {streak}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleFinishCompoundRoundEarly}
                    className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    🏁 Kết thúc
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Thanh tiến độ lượt học (cho Hoàn thiện từ ghép) hoặc Thanh thời gian co lại (cho Phản xạ 10s) */}
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              {isCompoundRoundMode ? (
                <div
                  style={{
                    width: `${compoundQueue.length > 0
                      ? Math.max(0, Math.min(100, ((compoundIndex + (selectedIdx !== null ? 1 : 0)) / compoundQueue.length) * 100))
                      : 0}%`
                  }}
                  className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 ease-out"
                />
              ) : (
                <div
                  style={{ width: `${(timeLeft / maxTime) * 100}%` }}
                  className={`h-full transition-all duration-100 ${
                    timeLeft <= 3 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'
                  }`}
                />
              )}
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
                    {selectedIdx !== null && isChosen && !isCorrect && (
                      <span className="text-white text-base font-black shrink-0">✗</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Thẻ Giải thích chi tiết ngay sau MỌI câu hỏi (Đúng hoặc Sai) cho Hoàn thiện từ ghép */}
            {isCompoundRoundMode && selectedIdx !== null && (
              <div className={`p-4 sm:p-5 rounded-2xl border bg-slate-50/70 dark:bg-slate-950/70 space-y-3 animate-in fade-in duration-150 ${
                lastAnswerCorrect ? 'border-emerald-500/40' : 'border-rose-500/40'
              }`}>
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                  <span className={`text-sm font-black flex items-center gap-1.5 ${
                    lastAnswerCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                  }`}>
                    {lastAnswerCorrect
                      ? `✅ Chính xác! Đáp án: ${currentQ.correctAnswerText}`
                      : `❌ Chưa chính xác — Đáp án đúng: ${currentQ.correctAnswerText}`}
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePlayAudio(
                      currentQ.targetVocab.kanji_word || currentQ.targetVocab.kanji_form || currentQ.targetVocab.kanji || currentQ.targetVocab.hiragana,
                      currentQ.targetVocab.hiragana
                    )}
                    className="py-1 px-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    🔊 Nghe phát âm
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs shadow-sm">
                  <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <span>💡</span>
                    <span>Giải thích chi tiết cấu tạo & ý nghĩa Hán tự:</span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-200 font-medium whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                    {currentQ.explanation}
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleNextCompoundQuestion}
                    className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-black shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    {compoundIndex + 1 < compoundQueue.length
                      ? `Câu tiếp theo (${compoundIndex + 2}/${compoundQueue.length}) ➔`
                      : '🏆 Hoàn thành & Xem tổng kết ➔'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MÀN HÌNH 3: TỔNG KẾT LƯỢT HỌC / GAME OVER */}
        {gameOver && (
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
            {/* Header kết thúc */}
            <div className="text-center space-y-2">
              <div className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center text-3xl shadow-md border ${
                isCompoundRoundMode
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}>
                {isCompoundRoundMode ? '🎉' : '💥'}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {isCompoundRoundMode ? 'HOÀN THÀNH LƯỢT LUYỆN TỪ GHÉP!' : 'KẾT THÚC LƯỢT CHƠI!'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isCompoundRoundMode
                  ? `Bạn đã trả lời đúng ${score} / ${compoundAnsweredCount || compoundQueue.length} câu hỏi (${
                      (compoundAnsweredCount || compoundQueue.length) > 0
                        ? Math.round((score / (compoundAnsweredCount || compoundQueue.length)) * 100)
                        : 0
                    }%).`
                  : timeLeft <= 0
                    ? 'Đã hết thời gian phản xạ (10s)!'
                    : 'Bạn đã chọn đáp án chưa chính xác.'}
              </p>
            </div>

            {/* Bảng điểm */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">
                  {isCompoundRoundMode ? 'SỐ CÂU ĐÚNG' : 'ĐIỂM ĐẠT ĐƯỢC'}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-500">
                  {isCompoundRoundMode
                    ? `${score}/${compoundAnsweredCount || compoundQueue.length}`
                    : score}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">CHUỖI ĐÚNG DÀI NHẤT</span>
                <span className="text-2xl sm:text-3xl font-black text-rose-500">{maxStreak}</span>
              </div>
            </div>

            {/* THẺ GIẢI THÍCH CHI TIẾT CỦA CÂU BỊ SAI (NỔI BẬT CHO CHẾ ĐỘ PHẢN XẠ 10S) */}
            {!isCompoundRoundMode && failedQuestion && (
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
                    const kWord = v.kanji_word || v.kanji_form || v.kanji;
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
                onClick={() => startGame()}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {isCompoundRoundMode ? `🔄 Luyện lại toàn bộ (${eligibleVocabs.length} câu)` : '🔄 Chơi lại lượt mới'}
              </button>

              {isCompoundRoundMode && wrongVocabList.length > 0 && (
                <button
                  type="button"
                  onClick={() => startGame([...wrongVocabList])}
                  className="py-3 px-5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  ↺ Ôn lại riêng từ sai ({wrongVocabList.length} từ)
                </button>
              )}

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
