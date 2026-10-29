'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from '../../utils/api';
import { playAudioWithFallback, playSpeedrunSound } from '../../utils/audioHelper';
import QuickLookupModal from '../../components/QuickLookupModal';

interface JlptMondaiMeta {
  key: string;
  code: string;
  section: string;
  no: number;
  ja: string;
  name: string;
  instr: string;
  level?: string;
  totalInBank: number;
  blueprintCount: number;
  isActive: boolean;
}

interface JlptSectionMeta {
  key: string;
  ja: string;
  name: string;
  minutes: number;
  totalInBank: number;
  blueprintCount: number;
  mondaiList: JlptMondaiMeta[];
}

interface JlptPassage {
  id: string;
  kind: 'cloze' | 'short' | 'medium' | 'info' | 'dialogue' | string;
  title?: string;
  body_kanji?: string;
  body_kana?: string;
  table_kanji?: { headers: string[]; rows: string[][] };
  table_kana?: { headers: string[]; rows: string[][] };
  intro_kana?: string;
  script?: Array<{ speaker: string; text_kanji: string; text_kana: string }>;
  audio_url?: string | null;
  vi?: string;
}

interface JlptQuestion {
  id: string;
  lesson_id?: number;
  mondai: string;
  section: string;
  section_ja: string;
  section_name: string;
  mondai_no: number;
  mondai_ja: string;
  mondai_name: string;
  mondai_instr: string;
  stem_kanji?: string;
  stem_kana?: string;
  choices?: string[];
  choices_kanji?: string[];
  choices_kana?: string[];
  answer: number;
  wrong_notes?: Array<string | null>;
  pieces?: {
    items: string[];
    order: number[];
    star: number;
  };
  forms?: string;
  situation_vi?: string;
  audio?: {
    question_kana?: string;
    prompt_kana?: string;
    passage?: string;
    choices_spoken?: boolean;
    audio_url?: string | null;
  };
  audio_url?: string | null;
  passage?: string;
  explanation?: string;
  related?: {
    vocab?: number[];
    kanji?: string[];
    grammar?: number[];
  };
}

type CardId = 'moji_goi' | 'bunpou' | 'choukai' | 'full_exam';

interface SavedCardSession {
  card: CardId;
  scope: string;
  lessonKey: string;
  lessonIds: number[];
  step: 'test' | 'result';
  questions: JlptQuestion[];
  passages: Record<string, JlptPassage>;
  currentIndex: number;
  answers: Record<string, number>;
  graded: Record<string, boolean>;
  flagged: Record<string, boolean>;
  score: number;
  updatedAt: string;
}

interface HistoryRecord {
  id: string;
  date: string;
  card: string;
  label: string;
  lessonsLabel: string;
  score: number;
  total: number;
  percent: number;
  sectionSummary?: Array<{ key: string; name: string; score: number; total: number }>;
}

interface PersistedGlobalJlptStorage {
  selectedLessons: number[];
  viewRange: 'level' | 'all_50';
  cards: Partial<Record<CardId, SavedCardSession>>;
  cardScopes: Record<CardId, string>;
  masteredIds: string[];
  wrongIds: string[];
  history: HistoryRecord[];
}

interface LessonBankStat {
  lesson_id: number;
  level: string;
  totalQuestions: number;
  totalPassages: number;
}

interface GlobalJlptExamTabProps {
  level: 'N5' | 'N4';
  vocabItems: any[];
  kanjiItems: any[];
  grammarItems: any[];
}

const STORAGE_KEY = 'nihongo_jlpt_global_exam';

const DEFAULT_SCOPES: Record<CardId, string> = {
  moji_goi: 'blueprint',
  bunpou: 'blueprint',
  choukai: 'blueprint',
  full_exam: 'blueprint'
};

function formatLessonRangeLabel(ids: number[]): string {
  if (!ids || ids.length === 0) return 'Chưa chọn bài';
  const sorted = [...ids].sort((a, b) => a - b);
  if (sorted.length <= 5) {
    return `Bài ${sorted.join(', ')}`;
  }
  const isContiguous = sorted.every((val, idx) => idx === 0 || val === sorted[idx - 1] + 1);
  if (isContiguous) {
    return `Bài ${sorted[0]} – ${sorted[sorted.length - 1]} (${sorted.length} bài)`;
  }
  return `${sorted.length} bài (Bài ${sorted.slice(0, 3).join(', ')}... Bài ${sorted[sorted.length - 1]})`;
}

export default function GlobalJlptExamTab({
  level,
  vocabItems,
  kanjiItems,
  grammarItems
}: GlobalJlptExamTabProps) {
  // Available _global files across Lessons 1..50
  const [availLoading, setAvailLoading] = useState<boolean>(true);
  const [metaLoading, setMetaLoading] = useState<boolean>(false);
  const [drawLoading, setDrawLoading] = useState<boolean>(false);
  const [availableLessonIds, setAvailableLessonIds] = useState<number[]>([]);
  const [lessonStats, setLessonStats] = useState<Record<number, LessonBankStat>>({});

  // Multi-lesson selection states
  const [viewRange, setViewRange] = useState<'level' | 'all_50'>('level');
  const [selectedLessons, setSelectedLessons] = useState<number[]>([1]);
  const [isSelectorExpanded, setIsSelectorExpanded] = useState<boolean>(true);

  // Aggregated metadata for currently selected available lessons
  const [bankLevel, setBankLevel] = useState<string>(level);
  const [sectionsMeta, setSectionsMeta] = useState<JlptSectionMeta[]>([]);
  const [bankStats, setBankStats] = useState<{
    selectedLessonCount: number;
    totalBankQuestions: number;
    totalBlueprintQuestions: number;
    totalExamMinutes: number;
    totalPassages: number;
  }>({
    selectedLessonCount: 0,
    totalBankQuestions: 0,
    totalBlueprintQuestions: 0,
    totalExamMinutes: 90,
    totalPassages: 0
  });

  // UI & Display preferences
  const [showKanji, setShowKanji] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showQuestionMap, setShowQuestionMap] = useState<boolean>(false);
  const [isQuickLookupOpen, setIsQuickLookupOpen] = useState<boolean>(false);
  const [quickLookupTab, setQuickLookupTab] = useState<'vocab' | 'kanji' | 'grammar' | 'kana'>('vocab');
  const [showHistoryTable, setShowHistoryTable] = useState<boolean>(true);

  // Persisted Data across 4 Cards
  const [isStorageLoaded, setIsStorageLoaded] = useState<boolean>(false);
  const [savedCards, setSavedCards] = useState<Partial<Record<CardId, SavedCardSession>>>({});
  const [cardScopes, setCardScopes] = useState<Record<CardId, string>>(DEFAULT_SCOPES);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [historyList, setHistoryList] = useState<HistoryRecord[]>([]);

  // Active Test Session States
  const [step, setStep] = useState<'setup' | 'test' | 'result'>('setup');
  const [activeCard, setActiveCard] = useState<CardId | 'wrong_retry'>('full_exam');
  const [activeScope, setActiveScope] = useState<string>('blueprint');
  const [activeRunLessons, setActiveRunLessons] = useState<number[]>([]);
  const [questions, setQuestions] = useState<JlptQuestion[]>([]);
  const [passages, setPassages] = useState<Record<string, JlptPassage>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [graded, setGraded] = useState<Record<string, boolean>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState<number>(0);
  const [historyRecordedForRun, setHistoryRecordedForRun] = useState<boolean>(false);

  // Per-question interactive helpers (Kumitate ★ scratchpad & Listening transcript peek)
  const [kumitateSlots, setKumitateSlots] = useState<Record<string, Array<number | null>>>({});
  const [peekTranscript, setPeekTranscript] = useState<Record<string, boolean>>({});

  // Multi-step TTS Audio Sequencer States
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioStepLabel, setAudioStepLabel] = useState<string>('');
  const [audioRate, setAudioRate] = useState<number>(0.9);
  const audioRunIdRef = useRef<number>(0);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopAllAudio = useCallback(() => {
    audioRunIdRef.current += 1;
    setIsAudioPlaying(false);
    setAudioStepLabel('');
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
      htmlAudioRef.current.currentTime = 0;
      htmlAudioRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [stopAllAudio]);

  useEffect(() => {
    stopAllAudio();
  }, [currentIndex, step, stopAllAudio]);

  // Visible lesson numbers in the checkbox picker
  const visibleLessonIds = useMemo(() => {
    if (viewRange === 'all_50') {
      return Array.from({ length: 50 }, (_, i) => i + 1);
    }
    const start = level === 'N5' ? 1 : 26;
    return Array.from({ length: 25 }, (_, i) => start + i);
  }, [viewRange, level]);

  // Quick 5-lesson cluster ranges for current view
  const clusterRanges = useMemo(() => {
    const start = viewRange === 'all_50' ? 1 : level === 'N5' ? 1 : 26;
    const count = viewRange === 'all_50' ? 10 : 5;
    return Array.from({ length: count }, (_, idx) => {
      const from = start + idx * 5;
      const to = from + 4;
      return { from, to };
    });
  }, [viewRange, level]);

  // Filter selected lessons to those visible or all selected, and compute those that actually have _global data
  const activeSelectedLessons = useMemo(() => {
    const base =
      viewRange === 'all_50'
        ? selectedLessons
        : selectedLessons.filter((id) =>
            level === 'N5' ? id >= 1 && id <= 25 : id >= 26 && id <= 50
          );
    return [...base].sort((a, b) => a - b);
  }, [selectedLessons, viewRange, level]);

  const effectiveLessonIds = useMemo(() => {
    const availSet = new Set(availableLessonIds);
    return activeSelectedLessons.filter((id) => availSet.has(id));
  }, [activeSelectedLessons, availableLessonIds]);

  const missingSelectedIds = useMemo(() => {
    const availSet = new Set(availableLessonIds);
    return activeSelectedLessons.filter((id) => !availSet.has(id));
  }, [activeSelectedLessons, availableLessonIds]);

  const currentLessonKey = useMemo(() => effectiveLessonIds.join(','), [effectiveLessonIds]);

  // 1. Discover available _global banks (Lessons 1..50)
  const refreshAvailableGlobalBanks = useCallback(async () => {
    setAvailLoading(true);
    try {
      const res = await api.get(`/api/user/jlpt/global/available?t=${Date.now()}`, {
        skipCache: true
      });
      const ids: number[] = Array.isArray(res?.availableLessonIds) ? res.availableLessonIds : [];
      setAvailableLessonIds(ids);
      setLessonStats(res?.lessonStats || {});
    } catch (err) {
      console.error('[Global JLPT] Failed to scan available _global files:', err);
    } finally {
      setAvailLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAvailableGlobalBanks();
  }, [refreshAvailableGlobalBanks]);

  // 2. Load Persisted Progress (Cloud + LocalStorage fallback)
  useEffect(() => {
    let cancelled = false;
    setIsStorageLoaded(false);

    const loadPersisted = async () => {
      let data: PersistedGlobalJlptStorage | null = null;
      try {
        const res = await api.get(
          `/api/user/review-sessions?storage_key=${encodeURIComponent(STORAGE_KEY)}`,
          { skipCache: true }
        );
        if (res && res.session_data && typeof res.session_data === 'object') {
          data = res.session_data as PersistedGlobalJlptStorage;
        }
      } catch {
        // Fallback to localStorage
      }

      if (!data && typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) data = JSON.parse(raw);
        } catch {
          // Ignore malformed JSON
        }
      }

      if (cancelled) return;

      if (data) {
        if (Array.isArray(data.selectedLessons) && data.selectedLessons.length > 0) {
          setSelectedLessons(data.selectedLessons);
        }
        if (data.viewRange === 'all_50' || data.viewRange === 'level') {
          setViewRange(data.viewRange);
        }
        setSavedCards(data.cards || {});
        setCardScopes({ ...DEFAULT_SCOPES, ...(data.cardScopes || {}) });
        setMasteredIds(Array.isArray(data.masteredIds) ? data.masteredIds : []);
        setWrongIds(Array.isArray(data.wrongIds) ? data.wrongIds : []);
        setHistoryList(Array.isArray(data.history) ? data.history : []);
      }
      setIsStorageLoaded(true);
    };

    loadPersisted();
    return () => {
      cancelled = true;
    };
  }, []);

  // Ensure sensible default selection ONCE when switching N5/N4 (never snap back when user manually unchecks)
  const autoDefaultedLevelRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isStorageLoaded || availLoading || viewRange === 'all_50') return;
    if (autoDefaultedLevelRef.current === level) return;
    autoDefaultedLevelRef.current = level;

    const start = level === 'N5' ? 1 : 26;
    const end = level === 'N5' ? 25 : 50;
    const hasInLevel = selectedLessons.some((id) => id >= start && id <= end);
    if (!hasInLevel) {
      const availInLevel = availableLessonIds.filter((id) => id >= start && id <= end);
      if (availInLevel.length > 0) {
        setSelectedLessons((prev) => Array.from(new Set([...prev, ...availInLevel])).sort((a, b) => a - b));
      }
    }
  }, [level, viewRange, isStorageLoaded, availLoading, availableLessonIds, selectedLessons]);

  // 3. Fetch aggregated metadata whenever effectiveLessonIds changes
  useEffect(() => {
    if (effectiveLessonIds.length === 0) {
      setSectionsMeta([]);
      setBankStats({
        selectedLessonCount: 0,
        totalBankQuestions: 0,
        totalBlueprintQuestions: 0,
        totalExamMinutes: level === 'N4' ? 115 : 90,
        totalPassages: 0
      });
      return;
    }

    let cancelled = false;
    const fetchAggregatedMeta = async () => {
      setMetaLoading(true);
      try {
        const res = await api.get(
          `/api/user/jlpt/global/test?lessons=${encodeURIComponent(currentLessonKey)}&meta_only=1&t=${Date.now()}`,
          { skipCache: true }
        );
        if (cancelled) return;
        if (res && res.available) {
          setBankLevel(res.level || level);
          setSectionsMeta(res.sections || []);
          setBankStats(
            res.stats || {
              selectedLessonCount: effectiveLessonIds.length,
              totalBankQuestions: 0,
              totalBlueprintQuestions: 0,
              totalExamMinutes: 90,
              totalPassages: 0
            }
          );
        }
      } catch (err) {
        console.error('[Global JLPT] Failed to fetch aggregated metadata:', err);
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    };

    fetchAggregatedMeta();
    return () => {
      cancelled = true;
    };
  }, [currentLessonKey, effectiveLessonIds.length, level]);

  // Debounced LocalStorage + Cloud persistence
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistStorage = useCallback(
    (nextData: PersistedGlobalJlptStorage, immediate = false) => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
        } catch {
          // Ignore quota error
        }
      }
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      const syncCloud = () => {
        api
          .post('/api/user/review-sessions', {
            storage_key: STORAGE_KEY,
            session_data: nextData
          })
          .catch(() => {});
      };
      if (immediate) {
        syncCloud();
      } else {
        saveTimerRef.current = setTimeout(syncCloud, 700);
      }
    },
    []
  );

  // Persist lesson selection & viewRange changes (skip initial hydration echo)
  const skipHydrationPersistRef = useRef<boolean>(true);
  useEffect(() => {
    if (!isStorageLoaded) return;
    if (skipHydrationPersistRef.current) {
      skipHydrationPersistRef.current = false;
      return;
    }
    persistStorage({
      selectedLessons,
      viewRange,
      cards: savedCards,
      cardScopes,
      masteredIds,
      wrongIds,
      history: historyList
    });
  }, [
    isStorageLoaded,
    selectedLessons,
    viewRange,
    savedCards,
    cardScopes,
    masteredIds,
    wrongIds,
    historyList,
    persistStorage
  ]);

  // Automatically sync active card session changes into savedCards
  useEffect(() => {
    if (!isStorageLoaded) return;
    if (step === 'setup') return;
    if (activeCard === 'wrong_retry') return;
    if (questions.length === 0) return;

    const runKey = activeRunLessons.join(',');
    const updatedCardSession: SavedCardSession = {
      card: activeCard,
      scope: activeScope,
      lessonKey: runKey,
      lessonIds: activeRunLessons,
      step,
      questions,
      passages,
      currentIndex,
      answers,
      graded,
      flagged,
      score,
      updatedAt: new Date().toISOString()
    };

    setSavedCards((prev) => ({ ...prev, [activeCard]: updatedCardSession }));
  }, [
    isStorageLoaded,
    step,
    activeCard,
    activeScope,
    activeRunLessons,
    questions,
    passages,
    currentIndex,
    answers,
    graded,
    flagged,
    score,
    selectedLessons,
    viewRange,
    cardScopes,
    masteredIds,
    wrongIds,
    historyList,
    persistStorage
  ]);

  // Lesson checkbox toggle helpers
  const handleToggleLesson = (id: number) => {
    setSelectedLessons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id].sort((a, b) => a - b)
    );
  };

  const handleSelectAvailableInView = () => {
    const availSet = new Set(availableLessonIds);
    const inViewAvail = visibleLessonIds.filter((id) => availSet.has(id));
    if (inViewAvail.length === 0) return;
    setSelectedLessons((prev) => {
      const outsideView = prev.filter((id) => !visibleLessonIds.includes(id));
      return Array.from(new Set([...outsideView, ...inViewAvail])).sort((a, b) => a - b);
    });
  };

  const handleSelectAllInView = () => {
    setSelectedLessons((prev) =>
      Array.from(new Set([...prev, ...visibleLessonIds])).sort((a, b) => a - b)
    );
  };

  const handleDeselectAllInView = () => {
    setSelectedLessons((prev) => prev.filter((id) => !visibleLessonIds.includes(id)));
  };

  const handleToggleCluster = (from: number, to: number) => {
    const clusterIds = Array.from({ length: to - from + 1 }, (_, i) => from + i);
    const allChecked = clusterIds.every((id) => selectedLessons.includes(id));
    if (allChecked) {
      setSelectedLessons((prev) => prev.filter((id) => !clusterIds.includes(id)));
    } else {
      setSelectedLessons((prev) =>
        Array.from(new Set([...prev, ...clusterIds])).sort((a, b) => a - b)
      );
    }
  };

  // Build readable label for a Card + Scope combination
  const getSessionLabel = useCallback(
    (card: CardId | 'wrong_retry', scope: string) => {
      if (card === 'wrong_retry') {
        return '🔥 Ôn lại Sổ tay câu sai JLPT Tổng hợp';
      }
      if (card === 'full_exam') {
        return `🏆 Đề Tổng Hợp Thi JLPT (${bankLevel})`;
      }
      const sec = sectionsMeta.find((s) => s.key === card);
      const secTitle = sec ? `${sec.ja} (${sec.name})` : card;
      if (scope === 'blueprint') return `${secTitle} — Đề chuẩn JLPT`;
      if (scope === 'all') return `${secTitle} — Toàn bộ kho câu đã chọn`;
      const m = sec?.mondaiList.find((item) => item.key === scope);
      return m ? `${secTitle} — 問題${m.no}: ${m.name}` : secTitle;
    },
    [sectionsMeta, bankLevel]
  );

  // Start or Resume one of the 4 cards across selected _global lessons
  const handleStartOrResumeCard = async (card: CardId, overrideScope?: string, forceFresh = false) => {
    if (effectiveLessonIds.length === 0) return;

    const targetScope = overrideScope || cardScopes[card] || 'blueprint';
    if (overrideScope && overrideScope !== cardScopes[card]) {
      setCardScopes((prev) => ({ ...prev, [card]: overrideScope }));
    }

    const existing = savedCards[card];
    if (
      !forceFresh &&
      existing &&
      existing.scope === targetScope &&
      existing.lessonKey === currentLessonKey &&
      Array.isArray(existing.questions) &&
      existing.questions.length > 0
    ) {
      setActiveCard(card);
      setActiveScope(existing.scope);
      setActiveRunLessons(existing.lessonIds || effectiveLessonIds);
      setQuestions(existing.questions);
      setPassages(existing.passages || {});
      setCurrentIndex(existing.currentIndex || 0);
      setAnswers(existing.answers || {});
      setGraded(existing.graded || {});
      setFlagged(existing.flagged || {});
      setScore(existing.score || 0);
      setHistoryRecordedForRun(existing.step === 'result');
      setStep(existing.step || 'test');
      setShowQuestionMap(false);
      return;
    }

    // Fetch a freshly shuffled multi-lesson set from _global banks (Round-Robin Fisher-Yates + cache-busting)
    setDrawLoading(true);
    try {
      const res = await api.get(
        `/api/user/jlpt/global/test?lessons=${encodeURIComponent(currentLessonKey)}&card=${encodeURIComponent(card)}&scope=${encodeURIComponent(targetScope)}&t=${Date.now()}`,
        { skipCache: true }
      );
      if (res && res.available && Array.isArray(res.questions) && res.questions.length > 0) {
        setActiveCard(card);
        setActiveScope(targetScope);
        setActiveRunLessons(res.effectiveLessonIds || effectiveLessonIds);
        setQuestions(res.questions);
        setPassages(res.passages || {});
        setCurrentIndex(0);
        setAnswers({});
        setGraded({});
        setFlagged({});
        setScore(0);
        setKumitateSlots({});
        setPeekTranscript({});
        setHistoryRecordedForRun(false);
        setStep('test');
        setShowQuestionMap(false);
      }
    } catch (err) {
      console.error('[Global JLPT] Failed to draw multi-lesson questions:', err);
    } finally {
      setDrawLoading(false);
    }
  };

  // Start Wrong Questions Retry across all _global banks
  const handleStartWrongRetry = async (targetWrongIds?: string[]) => {
    const idsToLoad = targetWrongIds && targetWrongIds.length > 0 ? targetWrongIds : wrongIds;
    if (idsToLoad.length === 0) return;

    setDrawLoading(true);
    try {
      const res = await api.get(
        `/api/user/jlpt/global/test?lessons=${encodeURIComponent(currentLessonKey)}&card=custom_ids&ids=${encodeURIComponent(idsToLoad.join(','))}&t=${Date.now()}`,
        { skipCache: true }
      );
      if (res && res.available && Array.isArray(res.questions) && res.questions.length > 0) {
        setActiveCard('wrong_retry');
        setActiveScope('wrong_retry');
        setActiveRunLessons(res.effectiveLessonIds || effectiveLessonIds);
        setQuestions(res.questions);
        setPassages(res.passages || {});
        setCurrentIndex(0);
        setAnswers({});
        setGraded({});
        setFlagged({});
        setScore(0);
        setKumitateSlots({});
        setPeekTranscript({});
        setHistoryRecordedForRun(false);
        setStep('test');
        setShowQuestionMap(false);
      }
    } catch (err) {
      console.error('[Global JLPT] Failed to load wrong retry set:', err);
    } finally {
      setDrawLoading(false);
    }
  };

  const handleResetCard = (card: CardId, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextCards = { ...savedCards };
    delete nextCards[card];
    setSavedCards(nextCards);
    persistStorage(
      {
        selectedLessons,
        viewRange,
        cards: nextCards,
        cardScopes,
        masteredIds,
        wrongIds,
        history: historyList
      },
      true
    );
    handleStartOrResumeCard(card, cardScopes[card], true);
  };

  const handleMasterResetCards = () => {
    stopAllAudio();
    setSavedCards({});
    setStep('setup');
    persistStorage(
      {
        selectedLessons,
        viewRange,
        cards: {},
        cardScopes,
        masteredIds,
        wrongIds,
        history: historyList
      },
      true
    );
  };

  // INSTANT GRADING HANDLER ("Chấm ngay tức thì" sau mỗi câu chọn!)
  const handleSelectAndGrade = useCallback(
    (q: JlptQuestion, choiceIndex: number) => {
      if (graded[q.id] !== undefined) return;

      const isCorrect = choiceIndex === q.answer;
      if (soundEnabled) {
        playSpeedrunSound(isCorrect ? 'correct' : 'wrong');
      }

      setAnswers((prev) => ({ ...prev, [q.id]: choiceIndex }));
      setGraded((prev) => ({ ...prev, [q.id]: isCorrect }));
      if (isCorrect) {
        setScore((prev) => prev + 1);
      }

      const nextMastered = isCorrect
        ? Array.from(new Set([...masteredIds, q.id]))
        : masteredIds;

      const nextWrong = isCorrect
        ? wrongIds.filter((id) => id !== q.id)
        : Array.from(new Set([...wrongIds, q.id]));

      setMasteredIds(nextMastered);
      setWrongIds(nextWrong);
    },
    [graded, soundEnabled, masteredIds, wrongIds]
  );

  // Transition to Result Summary screen & record run into Global History
  const handleFinishToSummary = useCallback(() => {
    stopAllAudio();
    if (!historyRecordedForRun && questions.length > 0) {
      const total = questions.length;
      const finalScore = questions.reduce((acc, q) => acc + (graded[q.id] ? 1 : 0), 0);
      const percent = total > 0 ? Math.round((finalScore / total) * 100) : 0;

      const secMap = new Map<string, { key: string; name: string; score: number; total: number }>();
      for (const q of questions) {
        if (!secMap.has(q.section)) {
          secMap.set(q.section, {
            key: q.section,
            name: `${q.section_ja} (${q.section_name})`,
            score: 0,
            total: 0
          });
        }
        const entry = secMap.get(q.section)!;
        entry.total += 1;
        if (graded[q.id]) entry.score += 1;
      }

      const newRecord: HistoryRecord = {
        id: `${Date.now()}`,
        date: new Intl.DateTimeFormat('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date()),
        card: activeCard,
        label: getSessionLabel(activeCard, activeScope),
        lessonsLabel: formatLessonRangeLabel(activeRunLessons),
        score: finalScore,
        total,
        percent,
        sectionSummary: Array.from(secMap.values())
      };

      const nextHistory = [newRecord, ...historyList].slice(0, 30);
      setHistoryList(nextHistory);
      setHistoryRecordedForRun(true);
    }
    setStep('result');
  }, [
    stopAllAudio,
    historyRecordedForRun,
    questions,
    graded,
    activeCard,
    activeScope,
    activeRunLessons,
    getSessionLabel,
    historyList
  ]);

  // Keyboard shortcuts (1..4 to pick choice, Left/Right arrows to navigate)
  useEffect(() => {
    if (step !== 'test' || questions.length === 0 || isQuickLookupOpen) return;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const choiceList =
        (showKanji ? currentQ.choices_kanji : currentQ.choices_kana) ||
        currentQ.choices ||
        currentQ.choices_kanji ||
        currentQ.choices_kana ||
        [];

      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx >= 0 && idx < choiceList.length && graded[currentQ.id] === undefined) {
          e.preventDefault();
          handleSelectAndGrade(currentQ, idx);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < questions.length - 1) {
          e.preventDefault();
          setCurrentIndex((i) => i + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          e.preventDefault();
          setCurrentIndex((i) => i - 1);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step, questions, currentIndex, showKanji, graded, isQuickLookupOpen, handleSelectAndGrade]);

  // Smart Kanji/Kana Stem Builder (Protects kanji_yomi 【Kanji】 from leaking reading!)
  const getSmartDisplayStem = useCallback((q: JlptQuestion, preferKanji: boolean): string => {
    const kanjiStem = q.stem_kanji || q.stem_kana || '';
    const kanaStem = q.stem_kana || q.stem_kanji || '';

    if (preferKanji) return kanjiStem;

    if (q.mondai === 'kanji_yomi') {
      const kanjiTargets: string[] = [];
      kanjiStem.replace(/【([^】]+)】/g, (_, inner) => {
        kanjiTargets.push(inner);
        return _;
      });
      if (kanjiTargets.length > 0) {
        let tokenIdx = 0;
        return kanaStem.replace(/【([^】]+)】/g, (fullMatch) => {
          const target = kanjiTargets[tokenIdx++];
          return target ? `【${target}】` : fullMatch;
        });
      }
      return kanjiStem;
    }

    return kanaStem;
  }, []);

  const renderFormattedStem = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(【[^】]+】|（[０-９0-9　\s]+）|\([0-9\s]+\)|＿\s*＿\s*★\s*＿|★)/g);
    return (
      <span>
        {parts.map((part, i) => {
          if (!part) return null;
          if (part.startsWith('【') && part.endsWith('】')) {
            const inner = part.slice(1, -1);
            return (
              <span
                key={i}
                className="inline-block mx-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border-b-2 border-amber-400 text-amber-200 font-black tracking-wide"
              >
                {inner}
              </span>
            );
          }
          if (/^（[０-９0-9　\s]+）$/.test(part) || /^\([0-9\s]+\)$/.test(part)) {
            return (
              <span
                key={i}
                className="inline-block mx-1 px-2.5 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-400/50 text-indigo-200 font-bold"
              >
                {part}
              </span>
            );
          }
          if (part.includes('★')) {
            return (
              <span
                key={i}
                className="inline-block mx-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-dashed border-amber-400/50 text-amber-300 font-extrabold tracking-widest"
              >
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  // Multi-Speaker Web Speech API Sequencer for JLPT Choukai (Listening)
  const playChoukaiSequence = useCallback(
    async (q: JlptQuestion, linkedPassage?: JlptPassage) => {
      stopAllAudio();
      const myRunId = audioRunIdRef.current;

      const directAudioUrl =
        q.audio_url || q.audio?.audio_url || linkedPassage?.audio_url || null;

      if (directAudioUrl && typeof window !== 'undefined') {
        try {
          setIsAudioPlaying(true);
          setAudioStepLabel('🎧 Đang phát tệp âm thanh JLPT...');
          const audio = new Audio(directAudioUrl);
          audio.playbackRate = audioRate;
          htmlAudioRef.current = audio;
          audio.onended = () => {
            if (audioRunIdRef.current === myRunId) {
              setIsAudioPlaying(false);
              setAudioStepLabel('');
            }
          };
          audio.onerror = () => {
            if (audioRunIdRef.current === myRunId) {
              setIsAudioPlaying(false);
              setAudioStepLabel('');
            }
          };
          await audio.play();
          return;
        } catch {
          // Fallback to TTS sequencer below
        }
      }

      if (typeof window === 'undefined' || !window.speechSynthesis) {
        return;
      }

      const segments: Array<{ label: string; text: string; pitch?: number; pauseMs?: number }> = [];
      const spokenChoices = q.choices_kana || q.choices || q.choices_kanji || [];

      if (q.mondai === 'sokuji_outou') {
        if (q.audio?.prompt_kana) {
          segments.push({
            label: '🗣️ Câu nói tình huống',
            text: q.audio.prompt_kana,
            pitch: 1.05,
            pauseMs: 550
          });
        }
        spokenChoices.forEach((cText, idx) => {
          segments.push({
            label: `🔢 Đáp án ${idx + 1}番`,
            text: `${idx + 1}ばん。 ${cText}`,
            pitch: 0.96,
            pauseMs: 420
          });
        });
      } else if (q.mondai === 'hatsuwa_hyougen') {
        spokenChoices.forEach((cText, idx) => {
          segments.push({
            label: `🔢 Câu nói ${idx + 1}番`,
            text: `${idx + 1}ばん。 ${cText}`,
            pitch: 1.0,
            pauseMs: 450
          });
        });
      } else {
        if (linkedPassage?.intro_kana) {
          segments.push({
            label: '📢 Lời dẫn bối cảnh',
            text: linkedPassage.intro_kana,
            pitch: 1.0,
            pauseMs: 450
          });
        }
        const qKana = q.audio?.question_kana || q.stem_kana || q.stem_kanji || '';
        if (qKana) {
          segments.push({
            label: '❓ Câu hỏi (Lần 1)',
            text: qKana,
            pitch: 1.0,
            pauseMs: 550
          });
        }
        if (Array.isArray(linkedPassage?.script)) {
          const speakerPitchMap = new Map<string, number>();
          const pitchPalette = [0.9, 1.14, 1.02, 0.85];
          linkedPassage.script.forEach((turn) => {
            if (!speakerPitchMap.has(turn.speaker)) {
              speakerPitchMap.set(
                turn.speaker,
                pitchPalette[speakerPitchMap.size % pitchPalette.length]
              );
            }
            segments.push({
              label: `💬 Hội thoại — ${turn.speaker}`,
              text: turn.text_kana || turn.text_kanji,
              pitch: speakerPitchMap.get(turn.speaker) || 1.0,
              pauseMs: 360
            });
          });
        } else if (linkedPassage?.body_kana || linkedPassage?.body_kanji) {
          segments.push({
            label: '💬 Nội dung bài nghe',
            text: linkedPassage.body_kana || linkedPassage.body_kanji || '',
            pitch: 1.0,
            pauseMs: 500
          });
        }
        if (qKana) {
          segments.push({
            label: '❓ Lặp lại câu hỏi',
            text: qKana,
            pitch: 1.0,
            pauseMs: 250
          });
        }
      }

      if (segments.length === 0) return;

      setIsAudioPlaying(true);
      const voices = window.speechSynthesis.getVoices();
      const jpVoice = voices.find((v) => v.lang === 'ja-JP' || v.lang.startsWith('ja'));

      const speakOne = (seg: { label: string; text: string; pitch?: number }) =>
        new Promise<void>((resolve) => {
          if (audioRunIdRef.current !== myRunId) {
            resolve();
            return;
          }
          setAudioStepLabel(seg.label);
          const u = new SpeechSynthesisUtterance(seg.text);
          u.lang = 'ja-JP';
          if (jpVoice) u.voice = jpVoice;
          u.rate = audioRate;
          u.pitch = seg.pitch || 1.0;

          (window as any)._activeGlobalJlptUtterances =
            (window as any)._activeGlobalJlptUtterances || [];
          (window as any)._activeGlobalJlptUtterances.push(u);

          const cleanup = () => {
            const arr = (window as any)._activeGlobalJlptUtterances || [];
            const idx = arr.indexOf(u);
            if (idx > -1) arr.splice(idx, 1);
            resolve();
          };
          u.onend = cleanup;
          u.onerror = cleanup;
          window.speechSynthesis.speak(u);
        });

      const waitPause = (ms: number) =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, ms);
        });

      for (const seg of segments) {
        if (audioRunIdRef.current !== myRunId) break;
        await speakOne(seg);
        if (audioRunIdRef.current !== myRunId) break;
        if (seg.pauseMs) await waitPause(seg.pauseMs);
      }

      if (audioRunIdRef.current === myRunId) {
        setIsAudioPlaying(false);
        setAudioStepLabel('');
      }
    },
    [stopAllAudio, audioRate]
  );

  // Group current test questions into 2-tier hierarchy (Section -> Mondai)
  const structuredQuestionTree = useMemo(() => {
    const secOrder: Array<{
      key: string;
      ja: string;
      name: string;
      mondaiGroups: Array<{
        key: string;
        no: number;
        ja: string;
        name: string;
        items: Array<{ q: JlptQuestion; globalIndex: number }>;
      }>;
    }> = [];

    questions.forEach((q, idx) => {
      let sec = secOrder.find((s) => s.key === q.section);
      if (!sec) {
        sec = {
          key: q.section,
          ja: q.section_ja,
          name: q.section_name,
          mondaiGroups: []
        };
        secOrder.push(sec);
      }
      let mGroup = sec.mondaiGroups.find((m) => m.key === q.mondai);
      if (!mGroup) {
        mGroup = {
          key: q.mondai,
          no: q.mondai_no,
          ja: q.mondai_ja,
          name: q.mondai_name,
          items: []
        };
        sec.mondaiGroups.push(mGroup);
      }
      mGroup.items.push({ q, globalIndex: idx });
    });

    return secOrder;
  }, [questions]);

  const gradedCount = useMemo(
    () => questions.reduce((acc, q) => acc + (graded[q.id] !== undefined ? 1 : 0), 0),
    [questions, graded]
  );

  const wrongQuestionsInCurrentRun = useMemo(
    () => questions.filter((q) => graded[q.id] === false),
    [questions, graded]
  );

  // Cross-50-Lesson Related Knowledge Resolver (handles both lesson-scoped 1-based index and global DB ID)
  const resolveRelatedKnowledge = useCallback(
    (related?: JlptQuestion['related'], qLessonId?: number) => {
      if (!related) return { vocabs: [], kanjis: [], grammars: [] };

      const lessonVocabs = qLessonId
        ? vocabItems.filter((v) => v.lesson_id === qLessonId)
        : vocabItems;
      const lessonGrammars = qLessonId
        ? grammarItems.filter((g) => g.lesson_id === qLessonId)
        : grammarItems;

      const vocabs = (related.vocab || [])
        .map((vid) => {
          return (
            lessonVocabs.find((v) => v.id === vid) ||
            (vid >= 1 && vid <= lessonVocabs.length ? lessonVocabs[vid - 1] : null) ||
            vocabItems.find((v) => v.id === vid)
          );
        })
        .filter(Boolean);

      const kanjis = (related.kanji || []).map((ch) => {
        const found =
          (qLessonId && kanjiItems.find((k) => k.character === ch && k.lesson_id === qLessonId)) ||
          kanjiItems.find((k) => k.character === ch);
        return found || { character: ch };
      });

      const grammars = (related.grammar || [])
        .map((gid) => {
          return (
            lessonGrammars.find((g) => g.id === gid) ||
            (gid >= 1 && gid <= lessonGrammars.length ? lessonGrammars[gid - 1] : null) ||
            grammarItems.find((g) => g.id === gid)
          );
        })
        .filter(Boolean);

      return { vocabs, kanjis, grammars };
    },
    [vocabItems, kanjiItems, grammarItems]
  );

  const hasAnySavedCard = Object.keys(savedCards).length > 0;
  const totalGlobalQuestionsAvailable = useMemo(
    () =>
      Object.values(lessonStats).reduce(
        (sum, st) => sum + (st?.totalQuestions || 0),
        0
      ),
    [lessonStats]
  );

  const masteryPercent =
    totalGlobalQuestionsAvailable > 0
      ? Math.min(100, Math.round((masteredIds.length / totalGlobalQuestionsAvailable) * 100))
      : 0;

  const sectionCardStyles: Record<
    string,
    { icon: string; border: string; badge: string; accentText: string }
  > = {
    moji_goi: {
      icon: '🉐',
      border: 'border-amber-500/25 hover:border-amber-400/80 hover:bg-amber-500/5',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      accentText: 'text-amber-300'
    },
    bunpou: {
      icon: '📖',
      border: 'border-sky-500/25 hover:border-sky-400/80 hover:bg-sky-500/5',
      badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      accentText: 'text-sky-300'
    },
    choukai: {
      icon: '🎧',
      border: 'border-indigo-500/25 hover:border-indigo-400/80 hover:bg-indigo-500/5',
      badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      accentText: 'text-indigo-300'
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-14 animate-fade-in">
      {/* TOP HEADER BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>🏆 Luyện Đề Thi JLPT Tổng Hợp Liên Bài</span>
            </h2>
            <span className="px-2.5 py-0.5 text-[11px] font-black rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Kho đề JLPT chung • Chấm ngay từng câu
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            Tích chọn các bài muốn ôn thi (Bài 1 – 50) • Hệ thống tự động rút câu hỏi cân bằng giữa các bài từ kho đề JLPT thống nhất đúng tỷ lệ đề thi thật
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setQuickLookupTab('vocab');
              setIsQuickLookupOpen(true);
            }}
            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 border border-blue-500/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>🔍</span>
            <span>Tra cứu 50 bài</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled((s) => !s)}
            title="Bật/tắt âm báo chấm đúng sai"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 text-emerald-300 border-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            {soundEnabled ? '🔊 Âm báo' : '🔇 Tắt âm'}
          </button>

          {hasAnySavedCard && (
            <button
              type="button"
              onClick={handleMasterResetCards}
              className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/35 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>🔄</span>
              <span>Master Reset (4 mục)</span>
            </button>
          )}

          {/* Smart Kanji / Kana Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setShowKanji(false)}
              title="Hỗ trợ hiển thị Kana cho các từ xung quanh (vẫn giữ nguyên chữ Hán mục tiêu ở Mondai 1 để không lộ đáp án)"
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                !showKanji
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              かな Hỗ trợ Kana
            </button>
            <button
              type="button"
              onClick={() => setShowKanji(true)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                showKanji
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              漢字 Chuẩn JLPT
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SCREEN 1: SETUP HUB (MULTI-LESSON PICKER + 4 JLPT CARDS)              */}
      {/* ===================================================================== */}
      {step === 'setup' && (
        <div className="space-y-6">
          {/* 1. MULTI-LESSON SELECTION PANEL (1..50 _GLOBAL BANKS) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                    1. Chọn bài học tham gia đề thi JLPT tổng hợp
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    ✓ Đã có {availableLessonIds.length}/50 bài ({totalGlobalQuestionsAvailable.toLocaleString()} câu)
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Đang chọn:{' '}
                  <strong className="text-indigo-300">
                    {formatLessonRangeLabel(activeSelectedLessons)}
                  </strong>
                  {effectiveLessonIds.length > 0 && (
                    <span>
                      {' '}
                      • Kho khả dụng:{' '}
                      <strong className="text-emerald-300">
                        {bankStats.totalBankQuestions} câu hỏi
                      </strong>{' '}
                      từ {effectiveLessonIds.length} bài có dấu ✓
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Range Mode Switcher: Current Level vs All 50 Lessons */}
                <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setViewRange('level')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      viewRange === 'level'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cấp {level} ({level === 'N5' ? 'Bài 1–25' : 'Bài 26–50'})
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewRange('all_50')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      viewRange === 'all_50'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🌐 Cả 50 bài (N5+N4)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={refreshAvailableGlobalBanks}
                  disabled={availLoading}
                  title="Quét lại thư mục tai_lieu/bai_tap để nhận ngay các file bộ đề JLPT mới cập nhật"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                >
                  <span className={availLoading ? 'animate-spin' : ''}>🔄</span>
                  <span>Quét 50 file</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSelectorExpanded((v) => !v)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 text-[11px] font-bold cursor-pointer"
                >
                  {isSelectorExpanded ? 'Thu gọn ▲' : 'Mở bảng bài ▼'}
                </button>
              </div>
            </div>

            {isSelectorExpanded && (
              <div className="space-y-3">
                {/* Quick Selection Toolbar & 5-Lesson Clusters */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-bold mr-1">Chọn nhanh:</span>
                    <button
                      type="button"
                      onClick={handleSelectAvailableInView}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-extrabold cursor-pointer"
                    >
                      ☑ Tất cả bài đã có đề (✓)
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectAllInView}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold cursor-pointer"
                    >
                      ☑ Chọn tất cả ({visibleLessonIds.length} bài)
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllInView}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer"
                    >
                      ☐ Bỏ chọn
                    </button>
                  </div>

                  {/* 5-lesson cluster pills */}
                  <div className="flex flex-wrap items-center gap-1">
                    {clusterRanges.map(({ from, to }) => {
                      const clusterIds = Array.from({ length: 5 }, (_, i) => from + i);
                      const isClusterFull = clusterIds.every((id) => selectedLessons.includes(id));
                      return (
                        <button
                          key={`${from}-${to}`}
                          type="button"
                          onClick={() => handleToggleCluster(from, to)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                            isClusterFull
                              ? 'bg-indigo-600 border-indigo-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Bài {from}–{to}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Lesson Checkboxes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-10 gap-2 max-h-60 overflow-y-auto p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                  {visibleLessonIds.map((lId) => {
                    const isChecked = selectedLessons.includes(lId);
                    const stat = lessonStats[lId];
                    const hasGlobalBank = Boolean(stat);

                    return (
                      <label
                        key={lId}
                        title={
                          hasGlobalBank
                            ? `Bài ${lId} (${stat.level}): Đã sẵn sàng ${stat.totalQuestions} câu hỏi JLPT`
                            : `Bài ${lId}: Đang chờ cập nhật tệp bo_cau_hoi_bai${lId}.json`
                        }
                        className={`flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all select-none ${
                          isChecked
                            ? hasGlobalBank
                              ? 'bg-indigo-600/25 border-indigo-400 text-white shadow-sm'
                              : 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                            : hasGlobalBank
                              ? 'bg-slate-900 border-emerald-500/30 text-slate-200 hover:border-emerald-400'
                              : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleLesson(lId)}
                            className="w-3.5 h-3.5 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500 cursor-pointer shrink-0"
                          />
                          <span className="truncate">Bài {lId}</span>
                        </div>
                        {hasGlobalBank && (
                          <span
                            className="text-[10px] font-black text-emerald-400 shrink-0"
                            title={`${stat.totalQuestions} câu`}
                          >
                            ✓
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>

                {/* Informative banner when some checked lessons don't have _global files yet */}
                {effectiveLessonIds.length > 0 && missingSelectedIds.length > 0 && (
                  <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2.5">
                    <span className="text-base shrink-0">💡</span>
                    <div>
                      Đề thi sẽ rút câu hỏi từ{' '}
                      <strong className="text-emerald-300">
                        {formatLessonRangeLabel(effectiveLessonIds)}
                      </strong>{' '}
                      (đã có kho đề với{' '}
                      <strong>{bankStats.totalBankQuestions.toLocaleString()} câu</strong>).{' '}
                      {missingSelectedIds.length} bài đang chờ cập nhật tệp{' '}
                      <code>bo_cau_hoi_baiX.json</code> sẽ tự động được gộp vào ngay khi bạn chép thêm tệp.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. GLOBAL MASTERY BAR & WRONG ANSWER NOTEBOOK */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-white">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5 flex-wrap">
                  <span>🏆 Độ phủ kho đề JLPT Tổng Hợp:</span>
                  <span className="text-emerald-400 font-black">
                    {masteredIds.length} / {totalGlobalQuestionsAvailable.toLocaleString()} câu đã làm đúng ({masteryPercent}%)
                  </span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${masteryPercent}%` }}
                />
              </div>
            </div>

            {wrongIds.length > 0 && (
              <button
                type="button"
                disabled={drawLoading}
                onClick={() => handleStartWrongRetry()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black shadow-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 shrink-0"
              >
                <span>🔥</span>
                <span>Ôn lại Sổ tay câu sai ({wrongIds.length} câu)</span>
              </button>
            )}
          </div>

          {(drawLoading || metaLoading) && (
            <div className="bg-indigo-950/60 border border-indigo-500/30 rounded-2xl p-4 text-center text-indigo-300 text-xs font-bold flex items-center justify-center gap-2">
              <span className="animate-spin text-base">⏳</span>
              <span>
                {drawLoading
                  ? 'Đang rút đề JLPT cân bằng từ kho đề chung của các bài đã chọn...'
                  : 'Đang tổng hợp cấu trúc câu hỏi từ các bài đã chọn...'}
              </span>
            </div>
          )}

          {/* EMPTY SELECTION GUARD */}
          {effectiveLessonIds.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl text-white">
              <div className="text-4xl">📚</div>
              <h4 className="text-lg font-black text-white">
                Chưa có bài học nào có dữ liệu đề JLPT trong danh sách đang tích chọn
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                Hãy tích chọn ít nhất 1 bài học có dấu <strong className="text-emerald-400">✓</strong> ở bảng trên để hệ thống tổng hợp đề thi JLPT. Hiện tại các bài đã sẵn sàng kho đề gồm:{' '}
                <strong className="text-white">
                  {availableLessonIds.length > 0
                    ? formatLessonRangeLabel(availableLessonIds)
                    : 'Đang chờ cập nhật'}
                </strong>
                .
              </p>
              {availableLessonIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setViewRange('all_50');
                    setSelectedLessons([...availableLessonIds]);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-black shadow-lg cursor-pointer active:scale-95"
                >
                  ⚡ Chọn ngay tất cả bài đã có đề ({availableLessonIds.length} bài)
                </button>
              )}
            </div>
          ) : (
            /* 3. 2x2 GRID: 3 INDIVIDUAL JLPT SECTIONS + 1 COMBINED FULL EXAM */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-white">
              {sectionsMeta.map((sec, secIdx) => {
                const cardKey = sec.key as CardId;
                const style = sectionCardStyles[sec.key] || sectionCardStyles.moji_goi;
                const selectedScope = cardScopes[cardKey] || 'blueprint';
                const saved = savedCards[cardKey];
                const matchesCurrentSelection =
                  saved &&
                  saved.scope === selectedScope &&
                  saved.lessonKey === currentLessonKey &&
                  Array.isArray(saved.questions) &&
                  saved.questions.length > 0;
                const doneInSaved = matchesCurrentSelection
                  ? Object.keys(saved!.graded || {}).length
                  : 0;

                return (
                  <div
                    key={sec.key}
                    onClick={() => handleStartOrResumeCard(cardKey)}
                    className={`flex flex-col justify-between p-5 rounded-2xl border bg-slate-900 transition-all cursor-pointer group ${style.border} shadow-lg`}
                  >
                    <div className="space-y-3">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <span className="text-3xl shrink-0">{style.icon}</span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[11px] font-black px-2 py-0.5 rounded-md border ${style.badge}`}>
                                Phần {secIdx + 1} • {sec.ja}
                              </span>
                              <span className="text-[11px] text-slate-400 font-semibold">
                                ⏱ Chuẩn thi {sec.minutes}p
                              </span>
                            </div>
                            <h3 className="text-base font-black text-white mt-1">
                              {sec.name}
                            </h3>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 shrink-0">
                          Đề chuẩn: <strong className={style.accentText}>{sec.blueprintCount} câu</strong>
                        </span>
                      </div>

                      {/* 2nd-Level Sub-Mondai Breakdown Table */}
                      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pb-1 border-b border-slate-800">
                          <span>Gồm {sec.mondaiList.length} dạng bài con (Mondai):</span>
                          <span>Đề thi / Kho đã chọn</span>
                        </div>
                        {sec.mondaiList.map((m) => (
                          <div
                            key={m.key}
                            className="flex items-center justify-between text-xs gap-2"
                          >
                            <span className="text-slate-300 truncate">
                              <strong className={style.accentText}>問題{m.no}</strong> • {m.name}{' '}
                              <span className="text-slate-500 text-[11px]">({m.ja})</span>
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 shrink-0">
                              <strong className="text-white">{m.blueprintCount}</strong> / {m.totalInBank} câu
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Scope Selector Pills */}
                      <div
                        className="pt-1 space-y-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                          <span>🎯 Chọn chế độ rút câu Phần {secIdx + 1}:</span>
                          <span className="text-[10px] text-amber-400">🔀 Chia đều các bài</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartOrResumeCard(cardKey, 'blueprint')}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                              selectedScope === 'blueprint'
                                ? `${style.badge} shadow-sm`
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            🎯 Chuẩn đề thi ({sec.blueprintCount} câu)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartOrResumeCard(cardKey, 'all')}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                              selectedScope === 'all'
                                ? `${style.badge} shadow-sm`
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            📚 Toàn bộ ({sec.totalInBank})
                          </button>
                          {sec.mondaiList.map((m) => (
                            <button
                              key={m.key}
                              type="button"
                              onClick={() => handleStartOrResumeCard(cardKey, m.key)}
                              title={`Chỉ luyện riêng 問題${m.no}: ${m.name} (${m.totalInBank} câu từ các bài đã chọn)`}
                              className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                                selectedScope === m.key
                                  ? `${style.badge} shadow-sm`
                                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                            >
                              問題{m.no} ({m.totalInBank})
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs gap-2">
                      {matchesCurrentSelection ? (
                        <>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-extrabold">
                            📍 Đã chấm {doneInSaved}/{saved!.questions.length} • Đúng {saved!.score}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-indigo-300 font-extrabold group-hover:underline">
                              ▶️ Làm tiếp
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleResetCard(cardKey, e)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 border border-amber-500/30 text-[11px] font-bold cursor-pointer"
                            >
                              🔄 Đề mới
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-slate-300 group-hover:text-white font-bold transition-colors">
                            ⚡ Rút đề từ {effectiveLessonIds.length} bài &amp; chấm ngay ➔
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleResetCard(cardKey, e)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-semibold cursor-pointer"
                          >
                            🔀 Rút đề mới
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* CARD 4: FULL COMBINED JLPT EXAM ACROSS SELECTED LESSONS */}
              {(() => {
                const saved = savedCards.full_exam;
                const matchesCurrentSelection =
                  saved &&
                  saved.lessonKey === currentLessonKey &&
                  Array.isArray(saved.questions) &&
                  saved.questions.length > 0;
                const doneInSaved = matchesCurrentSelection
                  ? Object.keys(saved!.graded || {}).length
                  : 0;

                return (
                  <div
                    onClick={() => handleStartOrResumeCard('full_exam', 'blueprint')}
                    className="flex flex-col justify-between p-5 rounded-2xl border-2 border-emerald-500/40 hover:border-emerald-400 bg-gradient-to-br from-slate-900 via-emerald-950/35 to-indigo-950/45 transition-all cursor-pointer group shadow-xl"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <span className="text-3xl shrink-0">🏆</span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Đề Tổng Hợp Thi • 総合模擬試験
                              </span>
                              <span className="text-[11px] text-emerald-300/80 font-semibold">
                                ⚡ Chấm ngay từng câu
                              </span>
                            </div>
                            <h3 className="text-base font-black text-white mt-1">
                              Đề Thi Tổng Hợp JLPT {bankLevel} ({formatLessonRangeLabel(effectiveLessonIds)})
                            </h3>
                          </div>
                        </div>
                        <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 shrink-0">
                          {bankStats.totalBlueprintQuestions} câu chuẩn
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        Rút câu hỏi <strong>chia đều từ kho <code>_global</code> của {effectiveLessonIds.length} bài đã chọn</strong> cho đủ cả <strong>3 Phần thi lớn</strong> đúng định mức đề thi JLPT thật:
                      </p>

                      <div className="bg-slate-950/80 border border-emerald-500/20 rounded-xl p-3 space-y-2">
                        {sectionsMeta.map((sec, sIdx) => (
                          <div
                            key={sec.key}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs pb-1.5 last:pb-0 border-b last:border-b-0 border-slate-800/70"
                          >
                            <span className="font-bold text-white">
                              Phần {sIdx + 1}: {sec.ja}{' '}
                              <span className="text-slate-400 font-normal">({sec.name})</span>
                            </span>
                            <span className="text-[11px] text-emerald-300 font-mono">
                              {sec.mondaiList.map((m) => `M${m.no}:${m.blueprintCount}`).join(' + ')} ={' '}
                              <strong>{sec.blueprintCount} câu</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs gap-2">
                      {matchesCurrentSelection ? (
                        <>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 font-extrabold">
                            📍 Đã chấm {doneInSaved}/{saved!.questions.length} • Đúng {saved!.score}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-300 font-extrabold group-hover:underline">
                              ▶️ Thi tiếp
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleResetCard('full_exam', e)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 border border-amber-500/30 text-[11px] font-bold cursor-pointer"
                            >
                              🔄 Đề {bankStats.totalBlueprintQuestions} câu mới
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-emerald-300 group-hover:text-emerald-200 font-extrabold">
                            🚀 Bắt đầu Đề tổng hợp ({bankStats.totalBlueprintQuestions} câu) ➔
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleResetCard('full_exam', e)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 text-[11px] font-bold cursor-pointer"
                          >
                            🔀 Tạo đề mới
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* RECENT GLOBAL HISTORY TABLE */}
          {historyList.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 text-white">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <span>📊 Lịch sử thi thử JLPT Tổng Hợp</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {historyList.length} lượt
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowHistoryTable((v) => !v)}
                  className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
                >
                  {showHistoryTable ? 'Thu gọn' : 'Mở rộng'}
                </button>
              </div>

              {showHistoryTable && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2 pr-3">Thời gian</th>
                        <th className="py-2 pr-3">Đề / Phần đã làm</th>
                        <th className="py-2 pr-3">Phạm vi bài</th>
                        <th className="py-2 pr-3">Kết quả</th>
                        <th className="py-2">Chi tiết từng phần</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {historyList.slice(0, 10).map((item) => (
                        <tr key={item.id} className="text-slate-300">
                          <td className="py-2.5 pr-3 whitespace-nowrap text-slate-400">
                            {item.date}
                          </td>
                          <td className="py-2.5 pr-3 font-bold text-white">{item.label}</td>
                          <td className="py-2.5 pr-3 text-indigo-300 font-semibold whitespace-nowrap">
                            {item.lessonsLabel || 'Tổng hợp'}
                          </td>
                          <td className="py-2.5 pr-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full font-extrabold ${
                                item.percent >= 80
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : item.percent >= 55
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {item.score}/{item.total} ({item.percent}%)
                            </span>
                          </td>
                          <td className="py-2.5 text-[11px] text-slate-400">
                            {(item.sectionSummary || [])
                              .map((s) => `${s.name.split(' ')[0]}: ${s.score}/${s.total}`)
                              .join(' • ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 2: ACTIVE TEST & INSTANT GRADING ROOM                          */}
      {/* ===================================================================== */}
      {step === 'test' && questions.length > 0 && (() => {
        const q = questions[currentIndex];
        if (!q) return null;

        const isGraded = graded[q.id] !== undefined;
        const isCorrect = graded[q.id] === true;
        const userChoice = answers[q.id];
        const isFlagged = Boolean(flagged[q.id]);

        const pId = q.passage || q.audio?.passage;
        const linkedPassage = pId ? passages[pId] : undefined;
        const isChoukai = q.section === 'choukai';
        const isReadingWithPassage =
          !isChoukai &&
          Boolean(linkedPassage) &&
          ['cloze', 'short', 'medium', 'info'].includes(linkedPassage?.kind || '');

        const displayChoices =
          q.mondai === 'hyouki' || q.mondai === 'kanji_yomi'
            ? q.choices || []
            : (showKanji ? q.choices_kanji : q.choices_kana) ||
              q.choices ||
              q.choices_kanji ||
              q.choices_kana ||
              [];

        const hideSpokenChoicesText =
          isChoukai &&
          Boolean(q.audio?.choices_spoken) &&
          !isGraded &&
          !peekTranscript[q.id];

        const displayStem = getSmartDisplayStem(q, showKanji);
        const relatedData = isGraded ? resolveRelatedKnowledge(q.related, q.lesson_id) : null;

        const currentSlots = kumitateSlots[q.id] || [null, null, null, null];
        const starSlotIdx = q.pieces?.star ?? 2;
        const placedInStar =
          q.mondai === 'kumitate' && currentSlots[starSlotIdx] !== null
            ? currentSlots[starSlotIdx]
            : null;

        const toggleKumitatePiece = (pieceIdx: number) => {
          if (isGraded) return;
          const existingPos = currentSlots.indexOf(pieceIdx);
          const nextSlots = [...currentSlots];
          if (existingPos > -1) {
            nextSlots[existingPos] = null;
          } else {
            const firstEmpty = nextSlots.indexOf(null);
            if (firstEmpty > -1) nextSlots[firstEmpty] = pieceIdx;
          }
          setKumitateSlots((prev) => ({ ...prev, [q.id]: nextSlots }));
        };

        return (
          <div className="space-y-5 text-white">
            {/* Navigation & 2-Tier Section -> Mondai Status Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      stopAllAudio();
                      setStep('setup');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>⬅️</span>
                    <span>Quay lại chọn bài &amp; 4 mục JLPT</span>
                  </button>
                  <span className="px-2.5 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                    📚 Phạm vi: {formatLessonRangeLabel(activeRunLessons)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-black">
                    🎯 Điểm: {score} / {gradedCount} câu đã chấm (Tổng đề: {questions.length})
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowQuestionMap((v) => !v)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      showQuestionMap
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-indigo-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span>🗺️</span>
                    <span>Bản đồ đề ({gradedCount}/{questions.length})</span>
                  </button>

                  {gradedCount > 0 && (
                    <button
                      type="button"
                      onClick={handleFinishToSummary}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow cursor-pointer"
                    >
                      📊 Xem bảng tổng kết
                    </button>
                  )}
                </div>
              </div>

              {/* 2-TIER HIERARCHY BANNER: SECTION -> MONDAI + INSTRUCTION */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-black">
                      {q.section_ja} • {q.section_name}
                    </span>
                    <span className="text-slate-600">➔</span>
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-black">
                      問題{q.mondai_no}: {q.mondai_ja} ({q.mondai_name})
                    </span>
                    {isGraded && q.lesson_id && (
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-black">
                        📘 Nguồn: Bài {q.lesson_id}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    📌 Yêu cầu: {q.mondai_instr}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setFlagged((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isFlagged
                        ? 'bg-amber-500/25 text-amber-200 border-amber-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {isFlagged ? '🚩 Đã đánh dấu' : '🏳️ Đánh dấu'}
                  </button>
                  <span className="text-xs font-black text-white bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
                    Câu {currentIndex + 1} / {questions.length}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                  style={{
                    width: `${Math.round(((currentIndex + 1) / questions.length) * 100)}%`
                  }}
                />
              </div>

              {/* COLLAPSIBLE 2-TIER QUESTION MAP */}
              {showQuestionMap && (
                <div className="pt-2 border-t border-slate-800 space-y-3 max-h-72 overflow-y-auto pr-1">
                  {structuredQuestionTree.map((sec) => (
                    <div key={sec.key} className="space-y-2">
                      <div className="text-xs font-black text-indigo-300">
                        ■ {sec.ja} ({sec.name})
                      </div>
                      <div className="space-y-2 pl-2">
                        {sec.mondaiGroups.map((mg) => (
                          <div key={mg.key} className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-400 min-w-[140px]">
                              問題{mg.no} {mg.name}:
                            </span>
                            {mg.items.map(({ q: itemQ, globalIndex }) => {
                              const g = graded[itemQ.id];
                              const active = globalIndex === currentIndex;
                              const fl = flagged[itemQ.id];
                              return (
                                <button
                                  key={itemQ.id}
                                  type="button"
                                  onClick={() => setCurrentIndex(globalIndex)}
                                  title={
                                    g !== undefined && itemQ.lesson_id
                                      ? `Câu ${globalIndex + 1} (Bài ${itemQ.lesson_id})`
                                      : `Câu ${globalIndex + 1}`
                                  }
                                  className={`w-8 h-8 rounded-lg text-xs font-black border transition-all cursor-pointer relative ${
                                    active ? 'ring-2 ring-white scale-105 ' : ''
                                  }${
                                    g === true
                                      ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                                      : g === false
                                        ? 'bg-rose-500/25 border-rose-400 text-rose-200'
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {globalIndex + 1}
                                  {fl && (
                                    <span className="absolute -top-1 -right-1 text-[9px]">
                                      🚩
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MAIN WORKSPACE: SPLIT-PANE IF READING/TABLE PASSAGE, SINGLE PANE OTHERWISE */}
            <div
              className={
                isReadingWithPassage
                  ? 'grid grid-cols-1 lg:grid-cols-12 gap-5 items-start'
                  : 'space-y-5'
              }
            >
              {/* LEFT PANE: READING PASSAGE OR INFO TABLE */}
              {isReadingWithPassage && linkedPassage && (
                <div className="lg:col-span-6 lg:sticky lg:top-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                        📄 Ngữ liệu đọc hiểu ({linkedPassage.id})
                      </span>
                      {linkedPassage.title && (
                        <h4 className="text-base font-black text-white mt-0.5">
                          {linkedPassage.title}
                        </h4>
                      )}
                    </div>
                    {(linkedPassage.body_kana || linkedPassage.body_kanji) && (
                      <button
                        type="button"
                        onClick={() =>
                          playAudioWithFallback(
                            linkedPassage.body_kanji || linkedPassage.body_kana || '',
                            linkedPassage.body_kana || linkedPassage.body_kanji || ''
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/30 border border-sky-500/30 text-sky-300 text-xs font-bold cursor-pointer shrink-0"
                      >
                        🔊 Nghe đoạn văn
                      </button>
                    )}
                  </div>

                  {(linkedPassage.body_kanji || linkedPassage.body_kana) && (
                    <div className="text-sm sm:text-base text-slate-100 leading-8 whitespace-pre-line bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-medium">
                      {renderFormattedStem(
                        showKanji
                          ? linkedPassage.body_kanji || linkedPassage.body_kana || ''
                          : linkedPassage.body_kana || linkedPassage.body_kanji || ''
                      )}
                    </div>
                  )}

                  {(linkedPassage.table_kanji || linkedPassage.table_kana) && (() => {
                    const tbl = showKanji
                      ? linkedPassage.table_kanji || linkedPassage.table_kana
                      : linkedPassage.table_kana || linkedPassage.table_kanji;
                    if (!tbl) return null;
                    return (
                      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-950">
                        <table className="w-full text-xs sm:text-sm text-left border-collapse">
                          <thead>
                            <tr className="bg-indigo-950/80 text-indigo-200 border-b border-slate-700">
                              {tbl.headers.map((h, hIdx) => (
                                <th key={hIdx} className="py-2.5 px-3 font-black border-r last:border-r-0 border-slate-800">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {tbl.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-900/60 text-slate-200">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="py-2.5 px-3 border-r last:border-r-0 border-slate-800/80 font-medium">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}

                  {isGraded && linkedPassage.vi && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-slate-200 leading-relaxed space-y-1">
                      <div className="font-black text-emerald-300">
                        🇻🇳 Dịch nghĩa ngữ liệu:
                      </div>
                      <p>{linkedPassage.vi}</p>
                    </div>
                  )}
                </div>
              )}

              {/* RIGHT PANE: QUESTION STEM, AUDIO, KUMITATE, CHOICES & INSTANT FEEDBACK */}
              <div
                className={
                  isReadingWithPassage
                    ? 'lg:col-span-6 space-y-5'
                    : 'space-y-5'
                }
              >
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
                  {/* CHOUKAI AUDIO PLAYER CARD */}
                  {isChoukai && (
                    <div className="bg-indigo-950/50 border border-indigo-500/30 rounded-2xl p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              isAudioPlaying
                                ? stopAllAudio()
                                : playChoukaiSequence(q, linkedPassage)
                            }
                            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-lg transition-all cursor-pointer active:scale-95 flex items-center gap-2 ${
                              isAudioPlaying
                                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white'
                            }`}
                          >
                            <span>{isAudioPlaying ? '⏹️' : '▶️'}</span>
                            <span>
                              {isAudioPlaying
                                ? 'Dừng phát'
                                : 'Phát bài nghe chuẩn JLPT'}
                            </span>
                          </button>

                          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl text-[11px] font-bold">
                            <button
                              type="button"
                              onClick={() => setAudioRate(0.82)}
                              className={`px-2 py-1 rounded-lg cursor-pointer ${
                                audioRate < 0.88
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              0.85x Rõ
                            </button>
                            <button
                              type="button"
                              onClick={() => setAudioRate(0.96)}
                              className={`px-2 py-1 rounded-lg cursor-pointer ${
                                audioRate >= 0.88
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              1.0x Chuẩn
                            </button>
                          </div>
                        </div>

                        {!isGraded && (
                          <button
                            type="button"
                            onClick={() =>
                              setPeekTranscript((prev) => ({
                                ...prev,
                                [q.id]: !prev[q.id]
                              }))
                            }
                            className="text-[11px] font-bold text-indigo-300 hover:underline cursor-pointer"
                          >
                            {peekTranscript[q.id]
                              ? '🙈 Ẩn gợi ý chữ'
                              : '👁️ Gợi ý chữ (nếu thiết bị thiếu giọng đọc)'}
                          </button>
                        )}
                      </div>

                      {audioStepLabel && (
                        <div className="text-xs font-bold text-cyan-300 bg-slate-950 border border-cyan-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2 animate-pulse">
                          <span>🔊</span>
                          <span>{audioStepLabel}</span>
                        </div>
                      )}

                      {q.situation_vi && (
                        <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3.5 text-xs sm:text-sm text-amber-100 leading-relaxed">
                          <span className="font-black text-amber-300 block mb-1">
                            🎭 Tình huống giao tiếp:
                          </span>
                          {q.situation_vi}
                        </div>
                      )}

                      {(isGraded || peekTranscript[q.id]) && (
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                          <div className="font-black text-indigo-300">
                            📜 Lời thoại bài nghe (Transcript):
                          </div>
                          {q.audio?.prompt_kana && (
                            <p className="text-slate-200 font-bold">
                              🗣️ Câu nói: {q.audio.prompt_kana}
                            </p>
                          )}
                          {Array.isArray(linkedPassage?.script) && (
                            <div className="space-y-1.5">
                              {linkedPassage!.script!.map((turn, tIdx) => (
                                <div key={tIdx} className="text-slate-200">
                                  <strong className="text-cyan-300">{turn.speaker}:</strong>{' '}
                                  {showKanji
                                    ? turn.text_kanji || turn.text_kana
                                    : turn.text_kana || turn.text_kanji}
                                </div>
                              ))}
                            </div>
                          )}
                          {isGraded && linkedPassage?.vi && (
                            <p className="text-emerald-300 pt-1.5 border-t border-slate-800">
                              🇻🇳 Dịch: {linkedPassage.vi}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* QUESTION STEM */}
                  {displayStem && (
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-base sm:text-lg font-bold text-white leading-relaxed">
                        <span className="text-indigo-400 font-black mr-2">
                          問{currentIndex + 1}.
                        </span>
                        {renderFormattedStem(displayStem)}
                      </div>

                      {!isChoukai &&
                        (q.mondai !== 'kanji_yomi' || isGraded) &&
                        displayStem.length > 3 && (
                          <button
                            type="button"
                            onClick={() =>
                              playAudioWithFallback(
                                q.stem_kanji || displayStem,
                                q.stem_kana || displayStem
                              )
                            }
                            title="Nghe phát âm câu đề bài"
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold shrink-0 cursor-pointer"
                          >
                            🔊
                          </button>
                        )}
                    </div>
                  )}

                  {/* KUMITATE (★) INTERACTIVE 4-SLOT SCRATCHPAD */}
                  {q.mondai === 'kumitate' && q.pieces && (
                    <div className="bg-slate-950 border border-amber-500/25 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-300">
                          🧩 Bàn nháp lắp ghép 4 vị trí (Bấm mảnh từ bên dưới để xếp thử):
                        </span>
                        {!isGraded && currentSlots.some((s) => s !== null) && (
                          <button
                            type="button"
                            onClick={() =>
                              setKumitateSlots((prev) => ({
                                ...prev,
                                [q.id]: [null, null, null, null]
                              }))
                            }
                            className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                          >
                            Xóa nháp
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[0, 1, 2, 3].map((slotIdx) => {
                          const isStar = slotIdx === starSlotIdx;
                          const pieceIdx = isGraded
                            ? q.pieces!.order[slotIdx]
                            : currentSlots[slotIdx];
                          const pieceLabel =
                            pieceIdx !== null && pieceIdx !== undefined
                              ? q.pieces!.items[pieceIdx]
                              : null;

                          return (
                            <button
                              key={slotIdx}
                              type="button"
                              disabled={isGraded || pieceIdx === null}
                              onClick={() => {
                                if (pieceIdx !== null && pieceIdx !== undefined) {
                                  toggleKumitatePiece(pieceIdx);
                                }
                              }}
                              className={`min-h-[42px] px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                                isStar
                                  ? 'border-amber-400 bg-amber-500/15 text-amber-200 shadow-sm'
                                  : 'border-slate-700 bg-slate-900 text-slate-200'
                              } ${!isGraded && pieceIdx !== null ? 'cursor-pointer hover:opacity-80' : ''}`}
                            >
                              {isStar && <span className="text-amber-400">★</span>}
                              <span>{pieceLabel || `Ô ${slotIdx + 1}`}</span>
                            </button>
                          );
                        })}
                      </div>

                      {!isGraded && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {q.pieces.items.map((itemText, pIdx) => {
                            const used = currentSlots.includes(pIdx);
                            return (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => toggleKumitatePiece(pIdx)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                  used
                                    ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200'
                                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400'
                                }`}
                              >
                                {pIdx + 1}. {itemText}
                              </button>
                            );
                          })}

                          {placedInStar !== null && (
                            <button
                              type="button"
                              onClick={() => handleSelectAndGrade(q, placedInStar)}
                              className="ml-auto px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow cursor-pointer"
                            >
                              ✔ Chốt đáp án ★ ({q.pieces.items[placedInStar]})
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ANSWER CHOICE BUTTONS (1..4 OR 1..3) — INSTANT GRADE ON CLICK */}
                  <div className="space-y-2.5">
                    {displayChoices.map((choiceText, cIdx) => {
                      const isAnswer = cIdx === q.answer;
                      const isPicked = userChoice === cIdx;
                      const wrongNote = q.wrong_notes?.[cIdx];

                      let cardClass =
                        'border-slate-800 bg-slate-950/90 hover:border-indigo-400 hover:bg-indigo-500/10 text-slate-100';
                      if (isGraded) {
                        if (isAnswer) {
                          cardClass =
                            'border-emerald-400 bg-emerald-500/15 text-emerald-100 shadow-md';
                        } else if (isPicked) {
                          cardClass =
                            'border-rose-400 bg-rose-500/15 text-rose-100';
                        } else {
                          cardClass =
                            'border-slate-800/70 bg-slate-950/50 text-slate-400';
                        }
                      }

                      return (
                        <button
                          key={cIdx}
                          type="button"
                          disabled={isGraded}
                          onClick={() => handleSelectAndGrade(q, cIdx)}
                          className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col gap-1.5 ${cardClass} ${
                            isGraded ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                                  isGraded && isAnswer
                                    ? 'bg-emerald-500 text-slate-950'
                                    : isGraded && isPicked
                                      ? 'bg-rose-500 text-white'
                                      : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {cIdx + 1}
                              </span>
                              <span className="text-sm sm:text-base font-bold">
                                {hideSpokenChoicesText
                                  ? `${cIdx + 1}番 — (Nghe câu ${cIdx + 1} và bấm để chấm ngay)`
                                  : choiceText}
                              </span>
                            </div>

                            {isGraded && isAnswer && (
                              <span className="text-xs font-black text-emerald-300 shrink-0">
                                ✔ Đáp án đúng
                              </span>
                            )}
                            {isGraded && isPicked && !isAnswer && (
                              <span className="text-xs font-black text-rose-300 shrink-0">
                                ✖ Bạn chọn
                              </span>
                            )}
                          </div>

                          {isGraded && !isAnswer && wrongNote && (
                            <div className="pl-10 text-xs text-amber-300/90 leading-relaxed">
                              💡 Vì sao sai: {wrongNote}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* INSTANT PEDAGOGICAL EXPLANATION, LESSON SOURCE BADGE & RELATED CHIPS */}
                  {isGraded && (
                    <div
                      className={`p-4 rounded-2xl border space-y-3 animate-fade-in ${
                        isCorrect
                          ? 'bg-emerald-950/30 border-emerald-500/35'
                          : 'bg-rose-950/30 border-rose-500/35'
                      }`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span
                          className={`text-sm font-black flex items-center gap-1.5 ${
                            isCorrect ? 'text-emerald-300' : 'text-rose-300'
                          }`}
                        >
                          <span>{isCorrect ? '🎉 Chính xác!' : '⚠️ Chưa chính xác'}</span>
                          <span>
                            — Đáp án đúng là ({q.answer + 1}){' '}
                            {displayChoices[q.answer]}
                          </span>
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {q.lesson_id && (
                            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-200">
                              📘 Bài {q.lesson_id}
                            </span>
                          )}
                          {q.forms && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                              Thể câu:{' '}
                              {q.forms === 'affirmative'
                                ? 'Khẳng định'
                                : q.forms === 'negative'
                                  ? 'Phủ định'
                                  : q.forms === 'interrogative'
                                    ? 'Nghi vấn'
                                    : q.forms}
                            </span>
                          )}
                        </div>
                      </div>

                      {q.explanation && (
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                          <strong className="text-indigo-300">📌 Giải thích: </strong>
                          {q.explanation}
                        </p>
                      )}

                      {relatedData &&
                        (relatedData.vocabs.length > 0 ||
                          relatedData.kanjis.length > 0 ||
                          relatedData.grammars.length > 0) && (
                          <div className="space-y-1.5 pt-1">
                            <div className="text-[11px] font-bold text-slate-400">
                              🔗 Kiến thức liên quan{q.lesson_id ? ` (Bài ${q.lesson_id})` : ''} — bấm để nghe / tra cứu nhanh:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {relatedData.vocabs.map((v: any) => (
                                <button
                                  key={`v-${v.id}`}
                                  type="button"
                                  onClick={() =>
                                    playAudioWithFallback(
                                      v.kanji_word || v.hiragana,
                                      v.hiragana
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-200 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                                >
                                  <span>📚</span>
                                  <span>
                                    {v.kanji_word ? `${v.kanji_word} (${v.hiragana})` : v.hiragana}:{' '}
                                    {v.vietnamese_meaning}
                                  </span>
                                  <span>🔊</span>
                                </button>
                              ))}

                              {relatedData.kanjis.map((k: any, kIdx: number) => (
                                <button
                                  key={`k-${k.character}-${kIdx}`}
                                  type="button"
                                  onClick={() => {
                                    setQuickLookupTab('kanji');
                                    setIsQuickLookupOpen(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 text-[11px] font-bold cursor-pointer"
                                >
                                  🉐 {k.character}
                                  {k.sino_vietnamese ? ` (${k.sino_vietnamese})` : ''}
                                </button>
                              ))}

                              {relatedData.grammars.map((g: any) => (
                                <button
                                  key={`g-${g.id}`}
                                  type="button"
                                  onClick={() => {
                                    setQuickLookupTab('grammar');
                                    setIsQuickLookupOpen(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 text-[11px] font-bold cursor-pointer"
                                >
                                  🗺️ {g.title}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* PREVIOUS / NEXT NAVIGATION FOOTER */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
                    >
                      ⬅️ Câu trước
                    </button>

                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      Phím tắt: Phím 1–4 để chọn &amp; chấm ngay • ⬅️ ➡️ để chuyển câu
                    </span>

                    {currentIndex < questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
                        }
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md cursor-pointer active:scale-95"
                      >
                        Câu tiếp theo ➡️
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleFinishToSummary}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md cursor-pointer active:scale-95"
                      >
                        🏁 Hoàn thành &amp; Xem tổng kết
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===================================================================== */}
      {/* SCREEN 3: DETAILED 2-TIER RESULT REPORT                               */}
      {/* ===================================================================== */}
      {step === 'result' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in text-white">
          <div className="text-center space-y-2">
            <div className="text-4xl">🏆</div>
            <h3 className="text-2xl font-black text-white">
              Kết quả: {getSessionLabel(activeCard, activeScope)}
            </h3>
            <p className="text-xs font-bold text-indigo-300">
              Phạm vi bài thi: {formatLessonRangeLabel(activeRunLessons)}
            </p>
            <p className="text-sm text-slate-400">
              Đúng <strong className="text-emerald-400">{score}</strong> /{' '}
              <strong>{questions.length}</strong> câu (
              {questions.length > 0
                ? Math.round((score / questions.length) * 100)
                : 0}
              %) • Đã chấm {gradedCount}/{questions.length} câu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {structuredQuestionTree.map((sec) => {
              const secTotal = sec.mondaiGroups.reduce(
                (acc, m) => acc + m.items.length,
                0
              );
              const secScore = sec.mondaiGroups.reduce(
                (acc, m) =>
                  acc +
                  m.items.reduce((s, it) => s + (graded[it.q.id] ? 1 : 0), 0),
                0
              );
              return (
                <div
                  key={sec.key}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-black text-indigo-300">
                      {sec.ja} ({sec.name})
                    </span>
                    <span className="text-xs font-black text-emerald-300">
                      {secScore}/{secTotal}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {sec.mondaiGroups.map((mg) => {
                      const mScore = mg.items.reduce(
                        (s, it) => s + (graded[it.q.id] ? 1 : 0),
                        0
                      );
                      return (
                        <div
                          key={mg.key}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-slate-300">
                            問題{mg.no}: {mg.name}
                          </span>
                          <span className="font-bold text-white">
                            {mScore}/{mg.items.length}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep('test')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
            >
              🔍 Xem lại từng câu trong đề
            </button>

            {wrongQuestionsInCurrentRun.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  handleStartWrongRetry(wrongQuestionsInCurrentRun.map((q) => q.id))
                }
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black shadow-lg cursor-pointer"
              >
                🔥 Làm lại ngay {wrongQuestionsInCurrentRun.length} câu vừa sai
              </button>
            )}

            {activeCard !== 'wrong_retry' && (
              <button
                type="button"
                onClick={() => handleResetCard(activeCard)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg cursor-pointer"
              >
                🔀 Rút đề mới cho mục này
              </button>
            )}

            <button
              type="button"
              onClick={() => setStep('setup')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg cursor-pointer"
            >
              🏆 Về bảng chọn bài &amp; 4 mục JLPT
            </button>
          </div>
        </div>
      )}

      <QuickLookupModal
        isOpen={isQuickLookupOpen}
        onClose={() => setIsQuickLookupOpen(false)}
        initialTab={quickLookupTab}
      />
    </div>
  );
}

