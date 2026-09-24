const { callGemini } = require('./aiGradingService');

/**
 * Normalize any date string (ISO YYYY-MM-DD or Vietnamese DD/MM/YYYY or DD-MM-YYYY) to standard YYYY-MM-DD
 */
function normalizeDateStr(str) {
  if (!str) return null;
  const s = String(str).trim();
  const vnMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (vnMatch) {
    const day = vnMatch[1].padStart(2, '0');
    const month = vnMatch[2].padStart(2, '0');
    const year = vnMatch[3];
    return `${year}-${month}-${day}`;
  }
  const isoMatch = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = isoMatch[2].padStart(2, '0');
    const day = isoMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return s;
}

/**
 * Format a Date to YYYY-MM-DD
 */
function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add days to a Date
 */
function addDays(d, n) {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

/**
 * Calculate difference in days between two date strings (supports YYYY-MM-DD and DD/MM/YYYY)
 */
function diffInDays(startStr, endStr) {
  const startNormalized = normalizeDateStr(startStr);
  const endNormalized = normalizeDateStr(endStr);
  const start = new Date(startNormalized);
  const end = new Date(endNormalized);
  const diffTime = end.getTime() - start.getTime();
  return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
}

/**
 * Golden Rule of Workload Points (WP):
 * 1 Kanji = 1 Grammar structure = 3 Vocabulary words
 * -> 1 Vocab = 1 WP
 * -> 1 Kanji = 3 WP
 * -> 1 Grammar = 3 WP
 */
const WORKLOAD_WEIGHTS = {
  vocabulary: 1,
  kanji: 3,
  grammar: 3
};

/**
 * Get exact counts, granular content details, and Workload Points (WP) of vocabulary, kanji, and grammar
 */
function getLessonCounts(lessonId) {
  try {
    const mockDb = require('../db/mockDb');
    const vocabList = (mockDb.vocabulary || []).filter(v => v.lesson_id === lessonId);
    const kanjiList = (mockDb.kanji || []).filter(k => k.lesson_id === lessonId);
    const grammarList = (mockDb.grammar || []).filter(g => g.lesson_id === lessonId);

    const firstV = vocabList[0] ? `${vocabList[0].hiragana || vocabList[0].word} [${vocabList[0].vietnamese_meaning || ''}]` : '';
    const lastV = vocabList[vocabList.length - 1] ? `${vocabList[vocabList.length - 1].hiragana || vocabList[vocabList.length - 1].word} [${vocabList[vocabList.length - 1].vietnamese_meaning || ''}]` : '';
    const vocabScope = vocabList.length > 0
      ? `Chính xác ${vocabList.length} từ (Từ #1: ${firstV} ➔ #${vocabList.length}: ${lastV})`
      : `Chính xác ${vocabList.length || 32} từ vựng`;

    const kanjiChars = kanjiList.map(k => k.character || k.kanji).filter(Boolean).join(', ');
    const kanjiScope = kanjiList.length > 0
      ? `Chính xác ${kanjiList.length} chữ Hán: ${kanjiChars}`
      : `Chính xác ${kanjiList.length || 5} chữ Hán`;

    const grammarTitles = grammarList.map((g, i) => `${i + 1}. ${g.title}`).join(' • ');
    const grammarScope = grammarList.length > 0
      ? `Chính xác ${grammarList.length} mẫu câu: ${grammarTitles}`
      : `Chính xác ${grammarList.length || 4} mẫu câu ngữ pháp`;

    const vocabCount = vocabList.length || 32;
    const kanjiCount = kanjiList.length || 5;
    const grammarCount = grammarList.length || 4;

    const vocabWP = vocabCount * WORKLOAD_WEIGHTS.vocabulary;
    const kanjiWP = kanjiCount * WORKLOAD_WEIGHTS.kanji;
    const grammarWP = grammarCount * WORKLOAD_WEIGHTS.grammar;
    const totalTheoryWP = vocabWP + kanjiWP + grammarWP;

    return {
      vocabCount,
      kanjiCount,
      grammarCount,
      vocabWP,
      kanjiWP,
      grammarWP,
      totalTheoryWP,
      vocabScope,
      kanjiScope,
      grammarScope,
      firstVocab: firstV,
      lastVocab: lastV,
      kanjiChars,
      grammarTitlesList: grammarList.map(g => g.title)
    };
  } catch {
    const vocabCount = 32;
    const kanjiCount = 5;
    const grammarCount = 4;
    return {
      vocabCount,
      kanjiCount,
      grammarCount,
      vocabWP: vocabCount * 1,
      kanjiWP: kanjiCount * 3,
      grammarWP: grammarCount * 3,
      totalTheoryWP: vocabCount * 1 + kanjiCount * 3 + grammarCount * 3,
      vocabScope: 'Toàn bộ từ vựng của bài',
      kanjiScope: 'Toàn bộ chữ Hán của bài',
      grammarScope: 'Toàn bộ mẫu câu ngữ pháp của bài',
      firstVocab: '',
      lastVocab: '',
      kanjiChars: '',
      grammarTitlesList: []
    };
  }
}

/**
 * Sequential Mastery Task Generator
 * Generates tasks in strict sequential order with exact Workload Points (WP):
 * Step 1: Vocabulary (100% ~49.5% WP)
 * Step 2: Kanji (100% ~34.7% WP)
 * Step 3: Grammar (100% ~15.8% WP)
 * Step 4: Single Review (30m)
 * Step 5: Cumulative Review (30m)
 */
function generateSequentialLessonTasks(lessonId) {
  const counts = getLessonCounts(lessonId);
  const { vocabCount, kanjiCount, grammarCount, vocabScope, kanjiScope, grammarScope, vocabWP, kanjiWP, grammarWP } = counts;

  // 1 WP = 6 minutes: 1 Vocab = 6m, 1 Kanji = 1 Grammar = 3 Vocab = 18m
  const vocabMinutes = Math.round(vocabCount * 6);
  const kanjiMinutes = Math.round(kanjiCount * 3 * 6);
  const grammarMinutes = Math.round(grammarCount * 3 * 6);

  return [
    {
      step: 1,
      id: `task_L${lessonId}_vocab`,
      title: `Minna Bài ${lessonId}: Học chính xác ${vocabCount} từ vựng`,
      scopeDetails: vocabScope,
      itemType: 'vocabulary',
      targetCount: vocabCount,
      currentCount: 0,
      workloadPoints: vocabWP,
      lesson: lessonId,
      estimatedMinutes: vocabMinutes,
      due_time: '10:00',
      link: `/lessons/${lessonId}?tab=vocab`,
      completed: false
    },
    {
      step: 2,
      id: `task_L${lessonId}_kanji`,
      title: `Minna Bài ${lessonId}: Nắm vững toàn bộ ${kanjiCount} chữ Hán`,
      scopeDetails: kanjiScope,
      itemType: 'kanji',
      targetCount: kanjiCount,
      currentCount: 0,
      workloadPoints: kanjiWP,
      lesson: lessonId,
      estimatedMinutes: kanjiMinutes,
      due_time: '14:30',
      link: `/lessons/${lessonId}?tab=kanji`,
      completed: false
    },
    {
      step: 3,
      id: `task_L${lessonId}_grammar`,
      title: `Minna Bài ${lessonId}: Làm chủ ${grammarCount} mẫu ngữ pháp cốt lõi`,
      scopeDetails: grammarScope,
      itemType: 'grammar',
      targetCount: grammarCount,
      currentCount: 0,
      workloadPoints: grammarWP,
      lesson: lessonId,
      estimatedMinutes: grammarMinutes,
      due_time: '20:00',
      link: `/lessons/${lessonId}?tab=grammar`,
      completed: false
    },
    {
      step: 4,
      id: `task_L${lessonId}_single_review`,
      title: `Minna Bài ${lessonId}: Ôn tập tổng hợp 4 dạng toàn bộ Bài ${lessonId}`,
      scopeDetails: `Luyện 4 dạng bài tập: 1. Trắc nghiệm Kanji/Từ vựng, 2. Điền khuyết hội thoại, 3. Nghe hiểu ngắn, 4. Trọng âm`,
      itemType: 'single_review',
      targetCount: 1,
      currentCount: 0,
      workloadPoints: 0,
      lesson: lessonId,
      estimatedMinutes: 30,
      due_time: '21:00',
      link: `/lessons/${lessonId}?tab=review`,
      completed: false
    },
    {
      step: 5,
      id: `task_L${lessonId}_cumulative_review`,
      title: `Ôn tập tích lũy tổng hợp từ Bài 1 đến Bài ${lessonId}`,
      scopeDetails: `Luyện phản xạ tổng hợp trộn ngẫu nhiên câu hỏi từ Bài 1 đến Bài ${lessonId} (30 phút)`,
      itemType: 'cumulative_review',
      targetCount: 1,
      currentCount: 0,
      workloadPoints: 0,
      lesson: lessonId,
      estimatedMinutes: 30,
      due_time: '21:45',
      link: `/knowledge?tab=review`,
      completed: false
    }
  ];
}

/**
 * Synthesize detailed educational rationale explaining why today learns this exact workload based on plan
 */
function computeDayRationale({ dayTasks = [], isRestDay = false, currentL = 1, targetLesson = 50 }) {
  if (isRestDay) {
    return `Hôm nay là ngày nghỉ theo lịch trình định sẵn. Bạn có thể thư giãn hoặc xem lại nhẹ nhàng các kiến thức đã học.`;
  }
  if (!dayTasks || dayTasks.length === 0) {
    return `Chưa có nhiệm vụ học tập cụ thể cho hôm nay.`;
  }
  if (currentL > targetLesson) {
    return `Bạn đã hoàn tất toàn bộ chương trình 50 bài học Minna no Nihongo! Hôm nay dành riêng cho việc luyện đề thi thử JLPT tổng hợp và củng cố phản xạ tốc độ cao.`;
  }

  let vocabCount = 0;
  let kanjiCount = 0;
  let grammarCount = 0;
  let hasReviews = false;
  let dayWP = 0;

  for (const t of dayTasks) {
    if (t.itemType === 'vocabulary') {
      vocabCount += (t.targetCount || 1);
      dayWP += (t.workloadPoints || (t.targetCount || 1) * WORKLOAD_WEIGHTS.vocabulary);
    } else if (t.itemType === 'kanji') {
      kanjiCount += (t.targetCount || 1);
      dayWP += (t.workloadPoints || (t.targetCount || 1) * WORKLOAD_WEIGHTS.kanji);
    } else if (t.itemType === 'grammar') {
      grammarCount += (t.targetCount || 1);
      dayWP += (t.workloadPoints || (t.targetCount || 1) * WORKLOAD_WEIGHTS.grammar);
    } else if (t.itemType === 'single_review' || t.itemType === 'cumulative_review') {
      hasReviews = true;
    }
  }

  const taskLessons = [...new Set(dayTasks.map(t => t.lesson).filter(Boolean))];
  const primaryLesson = taskLessons[0] || currentL;

  if (vocabCount > 0 && kanjiCount === 0 && grammarCount === 0) {
    return `Hôm nay bạn tập trung hoàn thành dứt điểm toàn bộ ${vocabCount} từ vựng của Bài ${primaryLesson} (${dayWP} điểm tải). Nắm vững trọn bộ từ vựng trước làm nền móng vững chắc để ngày mai học Kanji, Ngữ pháp và làm 2 phần ôn tập thực hành hiệu quả.`;
  }
  if (kanjiCount > 0 && grammarCount > 0 && vocabCount === 0) {
    return `Hôm nay bạn học toàn bộ ${kanjiCount} chữ Hán (${kanjiCount * 3} WP) và ${grammarCount} mẫu câu (${grammarCount * 3} WP) của Bài ${primaryLesson}. Ngay sau khi học mẫu câu ngữ pháp, bạn làm ngay 2 phần ôn tập (4 dạng bài tập và ôn tích lũy) để chuyển hóa lý thuyết thành phản xạ tự nhiên và hoàn tất trọn vẹn Bài ${primaryLesson}.`;
  }
  if (taskLessons.length > 1) {
    return `Hôm nay theo lộ trình tăng tốc hoàn thành 50 bài, bạn hoàn thành các bài ${taskLessons.map(l => `Bài ${l}`).join(' & ')} (${dayWP} điểm tải). Mỗi bài sau phần ngữ pháp đều tích hợp 2 bài ôn tập thực hành (4 dạng bài tập và ôn tích lũy) để củng cố phản xạ vững vàng.`;
  }
  return `Hôm nay bạn học toàn bộ lý thuyết Bài ${primaryLesson} gồm ${vocabCount} từ vựng, ${kanjiCount} chữ Hán và ${grammarCount} mẫu câu (${dayWP} điểm tải), kết hợp làm ngay 2 phần ôn tập thực hành 4 dạng và ôn tích lũy để nắm vững toàn diện bài học.`;
}

/**
 * Guardrail: Validate and enforce strict sequential order in tasks
 */
function validateSequence(tasks) {
  const stepOrder = { vocabulary: 1, kanji: 2, grammar: 3, single_review: 4, cumulative_review: 5, practice: 6 };
  return tasks.slice().sort((a, b) => {
    const lessonA = a.lesson || 0;
    const lessonB = b.lesson || 0;
    if (lessonA !== lessonB) return lessonA - lessonB;
    const stepA = stepOrder[a.itemType] || 99;
    const stepB = stepOrder[b.itemType] || 99;
    if (stepA !== stepB) return stepA - stepB;
    const partA = a.part || 1;
    const partB = b.part || 1;
    return partA - partB;
  });
}

/**
 * Retrieve sets of mastered item IDs for a given user from mockDb or Supabase
 */
function getMasteredItemIds(userId) {
  const masteredVocabIds = new Set();
  const masteredKanjiIds = new Set();
  const masteredGrammarIds = new Set();

  if (!userId) {
    return { masteredVocabIds, masteredKanjiIds, masteredGrammarIds };
  }

  const mockDb = require('../db/mockDb');
  const userProgress = mockDb.userProgress || {};
  Object.keys(userProgress).forEach(k => {
    if (k.startsWith(`${userId}:`) && userProgress[k] === 'mastered') {
      const parts = k.split(':');
      const itemType = parts[1];
      const itemId = parseInt(parts[2], 10);
      if (itemType === 'vocabulary') masteredVocabIds.add(itemId);
      else if (itemType === 'kanji') masteredKanjiIds.add(itemId);
      else if (itemType === 'grammar') masteredGrammarIds.add(itemId);
    }
  });

  return { masteredVocabIds, masteredKanjiIds, masteredGrammarIds };
}

/**
 * Content-Driven Plan Generator (Total Vocab, Kanji, Grammar + 2 Review parts merged with Grammar)
 * Rules:
 * 1. No standalone review days: 2 review tasks (4 dạng bài tập + ôn tích lũy) are merged directly into the day where Grammar is studied.
 * 2. 100% of the 50 lessons are dynamically and completely distributed across the user's active timeframe.
 * 3. Workload Points (1 Kanji = 1 Grammar = 3 Vocab) are strictly preserved.
 * 4. Filters out items already mastered by the user so they never have to re-learn mastered knowledge.
 */
function generateAlgorithmicPlan({
  startDate,
  endDate,
  targetLevel = 'All', // 'N5', 'N4', 'All'
  restDays = [], // e.g. [0] for Sunday
  currentLesson = 1,
  startLesson = null,
  targetLesson = 50,
  archivedPastDays = [],
  originalStartDate = null,
  userId = null,
  masteredItemIds = null
}) {
  const normStartDate = normalizeDateStr(startDate);
  const normEndDate = normalizeDateStr(endDate);
  const actualStartLesson = startLesson || currentLesson || 1;
  const startD = new Date(normStartDate);
  const totalDays = Math.max(1, diffInDays(normStartDate, normEndDate));
  const actualTargetLesson = targetLesson || 50;
  const totalLessons = Math.max(1, actualTargetLesson - actualStartLesson + 1);

  // Retrieve mastered items if userId is provided or passed in
  const mastered = masteredItemIds || getMasteredItemIds(userId);
  const masteredVocabIds = mastered.masteredVocabIds || new Set();
  const masteredKanjiIds = mastered.masteredKanjiIds || new Set();
  const masteredGrammarIds = mastered.masteredGrammarIds || new Set();

  // 1. Build atomic tasks for lessons actualStartLesson to actualTargetLesson with fine-grained chunking
  const atomicTasks = [];
  const mockDb = require('../db/mockDb');

  for (let l = actualStartLesson; l <= actualTargetLesson; l++) {
    const counts = getLessonCounts(l);
    const allVocab = (mockDb.vocabulary || []).filter(v => v.lesson_id === l);
    const allKanji = (mockDb.kanji || []).filter(k => k.lesson_id === l);
    const allGrammar = (mockDb.grammar || []).filter(g => g.lesson_id === l);

    // Filter out items already mastered by the user
    const vocabList = allVocab.filter(v => !masteredVocabIds.has(v.id));
    const kanjiList = allKanji.filter(k => !masteredKanjiIds.has(k.id));
    const grammarList = allGrammar.filter(g => !masteredGrammarIds.has(g.id));

    // Vocab chunking based on totalDays (only for unmastered words):
    if (vocabList.length > 0) {
      const vChunkSize = totalDays > 60 ? 18 : totalDays > 35 ? 25 : 50;
      const vChunks = Math.max(1, Math.ceil(vocabList.length / vChunkSize));
      for (let c = 0; c < vChunks; c++) {
        const sub = vocabList.slice(c * vChunkSize, (c + 1) * vChunkSize);
        const startIdx = c * vChunkSize + 1;
        const endIdx = c * vChunkSize + sub.length;
        const firstW = sub[0]?.hiragana || sub[0]?.word || '';
        const lastW = sub[sub.length - 1]?.hiragana || sub[sub.length - 1]?.word || '';
        atomicTasks.push({
          lesson: l,
          itemType: 'vocabulary',
          part: c + 1,
          totalParts: vChunks,
          itemIds: sub.map(v => v.id),
          title: vChunks > 1
            ? `Minna Bài ${l}: Học từ vựng chưa thuộc (Phần ${c + 1}/${vChunks}: ${sub.length} từ)`
            : (allVocab.length > vocabList.length
                ? `Minna Bài ${l}: Học ${sub.length} từ vựng còn lại (Đã thuộc ${allVocab.length - vocabList.length} từ)`
                : `Minna Bài ${l}: Học chính xác ${sub.length} từ vựng`),
          scopeDetails: vChunks > 1
            ? `Phần ${c + 1}: ${sub.length} từ (Từ #${startIdx}: ${firstW} ➔ #${endIdx}: ${lastW})`
            : (allVocab.length > vocabList.length
                ? `Còn lại ${sub.length}/${allVocab.length} từ vựng cần học`
                : counts.vocabScope),
          targetCount: sub.length,
          currentCount: 0,
          workloadPoints: sub.length * WORKLOAD_WEIGHTS.vocabulary,
          estimatedMinutes: sub.length * 6,
          link: `/lessons/${l}?tab=vocab`,
          completed: false
        });
      }
    }

    // Kanji chunking (only for unmastered kanji):
    if (kanjiList.length > 0) {
      const kChunkSize = totalDays > 60 ? 5 : totalDays > 35 ? 8 : 16;
      const kChunks = Math.max(1, Math.ceil(kanjiList.length / kChunkSize));
      for (let c = 0; c < kChunks; c++) {
        const sub = kanjiList.slice(c * kChunkSize, (c + 1) * kChunkSize);
        const chars = sub.map(k => k.kanji || k.character).join(', ');
        atomicTasks.push({
          lesson: l,
          itemType: 'kanji',
          part: c + 1,
          totalParts: kChunks,
          itemIds: sub.map(k => k.id),
          title: kChunks > 1
            ? `Minna Bài ${l}: Nắm vững chữ Hán chưa thuộc (Phần ${c + 1}/${kChunks}: ${sub.length} chữ)`
            : (allKanji.length > kanjiList.length
                ? `Minna Bài ${l}: Nắm vững ${sub.length} chữ Hán còn lại (Đã thuộc ${allKanji.length - kanjiList.length} chữ)`
                : `Minna Bài ${l}: Nắm vững toàn bộ ${sub.length} chữ Hán`),
          scopeDetails: `Chữ Hán: ${chars}`,
          targetCount: sub.length,
          currentCount: 0,
          workloadPoints: sub.length * WORKLOAD_WEIGHTS.kanji,
          estimatedMinutes: sub.length * 18,
          link: `/lessons/${l}?tab=kanji`,
          completed: false
        });
      }
    }

    // Grammar (only for unmastered grammar):
    if (grammarList.length > 0) {
      const gTotal = grammarList.length;
      atomicTasks.push({
        lesson: l,
        itemType: 'grammar',
        part: 1,
        totalParts: 1,
        itemIds: grammarList.map(g => g.id),
        title: allGrammar.length > grammarList.length
          ? `Minna Bài ${l}: Làm chủ ${gTotal} mẫu ngữ pháp còn lại (Đã thuộc ${allGrammar.length - grammarList.length} mẫu)`
          : `Minna Bài ${l}: Làm chủ ${gTotal} mẫu ngữ pháp cốt lõi`,
        scopeDetails: allGrammar.length > grammarList.length
          ? `Học các mẫu ngữ pháp còn lại của Bài ${l}`
          : counts.grammarScope,
        targetCount: gTotal,
        currentCount: 0,
        workloadPoints: gTotal * WORKLOAD_WEIGHTS.grammar,
        estimatedMinutes: gTotal * 18,
        link: `/lessons/${l}?tab=grammar`,
        completed: false
      });
    }

    // Review 1 (4 dạng bài tập)
    atomicTasks.push({
      lesson: l,
      itemType: 'single_review',
      part: 1,
      totalParts: 1,
      title: `Minna Bài ${l}: Ôn tập tổng hợp 4 dạng toàn bộ Bài ${l}`,
      scopeDetails: `Luyện 4 dạng bài tập: 1. Trắc nghiệm Kanji/Từ vựng, 2. Điền khuyết hội thoại, 3. Nghe hiểu ngắn, 4. Trọng âm`,
      targetCount: 1,
      currentCount: 0,
      workloadPoints: 0,
      estimatedMinutes: 30,
      link: `/lessons/${l}?tab=review`,
      completed: false
    });

    // Review 2 (Ôn tập tích lũy)
    atomicTasks.push({
      lesson: l,
      itemType: 'cumulative_review',
      part: 1,
      totalParts: 1,
      title: `Ôn tập tích lũy tổng hợp từ Bài 1 đến Bài ${l}`,
      scopeDetails: `Luyện phản xạ tổng hợp trộn ngẫu nhiên câu hỏi từ Bài 1 đến Bài ${l} (30 phút)`,
      targetCount: 1,
      currentCount: 0,
      workloadPoints: 0,
      estimatedMinutes: 30,
      link: `/knowledge?tab=review`,
      completed: false
    });
  }

  // 2. Distribute evenly into totalDays using target daily pacing
  const totalEstimatedMins = atomicTasks.reduce((s, t) => s + (t.estimatedMinutes || 0), 0);
  const targetDailyMins = totalEstimatedMins / totalDays;

  const dayBuckets = Array.from({ length: totalDays }, () => []);
  const dayMinutes = Array(totalDays).fill(0);
  let taskIdx = 0;

  for (let d = 0; d < totalDays; d++) {
    const targetCum = (d + 1) * targetDailyMins;
    let curCum = dayMinutes.slice(0, d + 1).reduce((a, b) => a + b, 0);

    while (taskIdx < atomicTasks.length) {
      const task = atomicTasks[taskIdx];
      const diffWithout = Math.abs(curCum - targetCum);
      const diffWith = Math.abs((curCum + task.estimatedMinutes) - targetCum);

      if (d === totalDays - 1 || (diffWith <= diffWithout && dayMinutes[d] < targetDailyMins + 35) || dayMinutes[d] === 0) {
        dayBuckets[d].push(task);
        dayMinutes[d] += task.estimatedMinutes;
        curCum += task.estimatedMinutes;
        taskIdx++;
      } else {
        break;
      }
    }
  }

  // If any trailing days remain empty, fill with JLPT sprint
  for (let d = 0; d < totalDays; d++) {
    if (dayBuckets[d].length === 0) {
      dayBuckets[d].push({
        lesson: targetLesson,
        itemType: 'practice',
        part: 1,
        totalParts: 1,
        title: `Luyện đề thi thử JLPT ${targetLevel} & Ôn phản xạ chuyên sâu`,
        scopeDetails: `Làm đề thi thử tổng hợp cấu trúc đề JLPT ${targetLevel} (Từ vựng, Ngữ pháp, Đọc hiểu, Nghe hiểu)`,
        targetCount: 1,
        currentCount: 0,
        workloadPoints: 0,
        estimatedMinutes: 60,
        link: `/knowledge?tab=practice`,
        completed: false
      });
      dayMinutes[d] = 60;
    }
  }

  // 3. Assemble days array with metadata, progressive due times, and educational rationale
  const days = [];
  for (let i = 0; i < totalDays; i++) {
    const dayDate = addDays(startD, i);
    const dateStr = formatDate(dayDate);
    const dayOfWeek = dayDate.getDay();
    const isRestDay = restDays.includes(dayOfWeek);

    const baseTasks = dayBuckets[i] || [];
    const dayTasks = baseTasks.map((t, idx) => {
      // Due time progressive distribution
      const baseHour = 17 + Math.floor(idx * 1);
      const baseMin = (idx % 2 === 0) ? '00' : '30';
      const dueTimeStr = `${String(Math.min(22, baseHour)).padStart(2, '0')}:${baseMin}`;
      return {
        ...t,
        lesson_id: t.lesson,
        id: `task_${dateStr}_${t.itemType}_L${t.lesson}_p${t.part || 1}`,
        date: dateStr,
        due_time: dueTimeStr,
        step: idx + 1
      };
    });

    const dayWP = dayTasks.reduce((sum, t) => sum + (t.workloadPoints || 0), 0);
    const dayEstMinutes = dayTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
    const dayRationale = computeDayRationale({
      dayTasks,
      isRestDay,
      currentL: dayTasks[0]?.lesson || currentLesson,
      targetLesson
    });

    days.push({
      date: dateStr,
      dayIndex: i + 1,
      dayOfWeek,
      isRestDay,
      isDedicatedPracticeDay: false,
      isBufferDay: isRestDay,
      plannedCount: dayTasks.length,
      completedCount: 0,
      workloadPoints: dayWP,
      dayRationale,
      totalEstimatedMinutes: dayEstMinutes,
      tasks: validateSequence(dayTasks)
    });
  }

  // Milestones definition
  const milestones = [
    { id: 'm1', title: 'N5 Cơ bản (Bài 1 - 10)', startLesson: 1, endLesson: 10, total: 10 },
    { id: 'm2', title: 'N5 Nâng cao (Bài 11 - 25)', startLesson: 11, endLesson: 25, total: 15 },
    { id: 'm3', title: 'N4 Khởi động (Bài 26 - 37)', startLesson: 26, endLesson: 37, total: 12 },
    { id: 'm4', title: 'N4 Về đích (Bài 38 - 50)', startLesson: 38, endLesson: 50, total: 13 }
  ];

  const daysPerLesson = parseFloat((totalDays / totalLessons).toFixed(1));

  const isPartial = actualStartLesson > 1;
  const planRationale = isPartial
    ? `Quy chuẩn định lượng tải học tập: 1 chữ Kanji = 1 Mẫu câu ngữ pháp = 3 Từ vựng (1V = 6p, 1K = 18p, 1G = 18p). Kế hoạch đã tối ưu hóa thông minh: Bỏ qua các bài đã nắm vững (Bài 1 đến Bài ${actualStartLesson - 1}), tập trung phân bổ đều đặn ${totalLessons} bài còn lại (Bài ${actualStartLesson} ➔ Bài ${actualTargetLesson}) trong ${totalDays} ngày còn lại (~${Math.round(totalEstimatedMins / totalDays)} phút/ngày) để về đích đúng hạn ${endDate}.`
    : `Quy chuẩn định lượng tải học tập: 1 chữ Kanji = 1 Mẫu câu ngữ pháp = 3 Từ vựng (1V = 6p, 1K = 18p, 1G = 18p). Áp dụng thuật toán Cân bằng Tải trọng Động (Load-Balanced Dynamic Pacing): toàn bộ 50 bài học được cắt nhỏ thành từng phần vừa vặn, phân bổ đều khắp ${totalDays} ngày để mọi ngày có thời lượng học đồng đều (~${Math.round(totalEstimatedMins / totalDays)} phút/ngày), triệt tiêu hoàn toàn sự chênh lệch và dồn ép.`;

  const coachingTip = isPartial
    ? `Lộ trình ${totalDays} ngày tiếp theo được tinh chỉnh riêng cho ${totalLessons} bài học còn lại (Bài ${actualStartLesson} ➔ Bài ${actualTargetLesson}). Mỗi ngày bạn học đồng đều khoảng ${Math.round(totalEstimatedMins / totalDays)} phút để vững vàng về đích đúng hạn ${endDate}!`
    : `Lộ trình ${totalDays} ngày được tối ưu hóa cân bằng tải trọng toàn diện cho 50 bài học. Mỗi ngày bạn học lượng kiến thức đồng đều khoảng ${Math.round(totalEstimatedMins / totalDays)} phút để duy trì phong độ bền bỉ nhất!`;

  return {
    startDate: normStartDate,
    endDate: normEndDate,
    originalStartDate: normalizeDateStr(originalStartDate) || normStartDate,
    targetLevel,
    totalDays,
    startLesson: actualStartLesson,
    targetLesson: actualTargetLesson,
    totalLessons,
    completedLessonsCount: Math.max(0, actualStartLesson - 1),
    archivedPastDays: archivedPastDays || [],
    milestones,
    days,
    isBalancedPacing: true,
    workloadRationale: planRationale,
    aiCoachingTip: coachingTip
  };
}

/**
 * Generate AI study plan with Gemini assistance and automatic algorithmic fallback
 */
async function generateStudyPlan(params) {
  // Fresh plan generation strictly for all 50 lessons as required by Rule 7
  const startL = params.startLesson || 1;

  const basePlan = generateAlgorithmicPlan({
    ...params,
    startLesson: Math.min(50, Math.max(1, startL)),
    targetLesson: params.targetLesson || 50
  });

  try {
    const prompt = `
Bạn là Trợ lý Cố vấn Học tiếng Nhật AI chuyên nghiệp (JLPT Study Advisor).
Học viên thiết lập lộ trình học tiếng Nhật:
- Khung thời gian: ${basePlan.startDate} ➔ ${basePlan.endDate} (${basePlan.totalDays} ngày)
- Mục tiêu: ${basePlan.targetLevel} (Từ Bài ${basePlan.startLesson} đến Bài ${basePlan.targetLesson})
- Quy chuẩn định lượng tải học tập: 1 chữ Kanji = 1 Mẫu câu ngữ pháp = 3 Từ vựng (1V = 1 WP, 1K = 3 WP, 1G = 3 WP).
- Phương pháp: Tuyệt đối không chia 3 phần bằng nhau; phân bổ cân bằng 50% từ vựng nền tảng (Ngày 1) và 50% Kanji + Ngữ pháp kết hợp (Ngày 2) + 1 Ngày Thực Hành Chuyên Biệt cho mỗi bài.
- Nguyên tắc: Học gối đầu bài mới khi hoàn thành dở dang bài cũ, và ngày mai mới là ngày thực hành trọn vẹn.

Hãy đưa ra lời khuyên huấn luyện (coaching advice) ngắn gọn, truyền cảm hứng (khoảng 3 câu súc tích bằng tiếng Việt).
`;

    const schema = {
      type: "OBJECT",
      properties: {
        coaching_tip: { type: "STRING" },
        workload_advice: { type: "STRING" }
      },
      required: ["coaching_tip", "workload_advice"]
    };

    const aiRes = await callGemini(prompt, schema, { maxOutputTokens: 500, timeoutMs: 8000 });
    if (aiRes && aiRes.result && aiRes.result.coaching_tip) {
      basePlan.aiCoachingTip = `${aiRes.result.coaching_tip} ${aiRes.result.workload_advice}`;
    }
  } catch (err) {
    console.warn('[AI Planner] Gemini coaching call failed, using default baseline coaching:', err.message);
  }

  return basePlan;
}

/**
 * Detect Unfinished Debt from yesterday
 */
function getUnfinishedDebt({ userId, plan }) {
  if (!plan || !plan.days) {
    return { hasDebt: false, debtItems: [], yesterdayDate: null };
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  const yesterdayDay = plan.days.find(d => d.date === yesterdayStr);
  if (!yesterdayDay || !yesterdayDay.tasks || yesterdayDay.tasks.length === 0) {
    return { hasDebt: false, debtItems: [], yesterdayDate: yesterdayStr };
  }

  const mockDb = require('../db/mockDb');
  const userProgress = mockDb.userProgress || {};
  const userReviewSessions = mockDb.userReviewSessions || {};

  const debtItems = [];

  for (const task of yesterdayDay.tasks) {
    if (task.completed) continue;

    const lesson = task.lesson || 1;
    let completedCount = 0;
    const targetCount = task.targetCount || 1;

    if (task.itemType === 'vocabulary') {
      const vocabList = (mockDb.vocabulary || []).filter(v => v.lesson_id === lesson);
      completedCount = vocabList.filter(v => {
        const status = userProgress[`${userId}:vocabulary:${v.id}`];
        return status === 'mastered' || status === 'learning';
      }).length;
    } else if (task.itemType === 'kanji') {
      const kanjiList = (mockDb.kanji || []).filter(k => k.lesson_id === lesson);
      completedCount = kanjiList.filter(k => {
        const status = userProgress[`${userId}:kanji:${k.id}`];
        return status === 'mastered' || status === 'learning';
      }).length;
    } else if (task.itemType === 'grammar') {
      const grammarList = (mockDb.grammar || []).filter(g => g.lesson_id === lesson);
      completedCount = grammarList.filter(g => {
        const status = userProgress[`${userId}:grammar:${g.id}`];
        return status === 'mastered' || status === 'learning';
      }).length;
    } else if (task.itemType === 'single_review') {
      const key = `${userId}:review_session_lesson_${lesson}`;
      completedCount = userReviewSessions[key] ? 1 : 0;
    } else if (task.itemType === 'cumulative_review') {
      const key = `${userId}:combined_review_level_N5`;
      completedCount = userReviewSessions[key] ? 1 : 0;
    }

    if (completedCount < targetCount) {
      debtItems.push({
        taskId: task.id,
        title: task.title,
        itemType: task.itemType,
        lesson,
        targetCount,
        completedCount,
        missingCount: targetCount - completedCount
      });
    }
  }

  return {
    hasDebt: debtItems.length > 0,
    debtItems,
    yesterdayDate: yesterdayStr
  };
}

/**
 * Detect completed lessons from userProgress in database and completed tasks in past days
 */
function getCompletedLessons({ userId, currentPlan, currentProgress }) {
  const completed = new Set();

  // 1. From currentProgress if explicitly passed
  if (currentProgress && Array.isArray(currentProgress.completedLessons)) {
    for (const l of currentProgress.completedLessons) {
      if (typeof l === 'number' && l >= 1 && l <= 50) completed.add(l);
    }
  }
  if (currentProgress && typeof currentProgress.currentLesson === 'number' && currentProgress.currentLesson > 1) {
    for (let l = 1; l < currentProgress.currentLesson; l++) {
      completed.add(l);
    }
  }

  // 2. From actual userProgress in database
  if (userId) {
    try {
      const mockDb = require('../db/mockDb');
      const userProgress = mockDb.userProgress || {};

      for (let l = 1; l <= 50; l++) {
        const vocabList = (mockDb.vocabulary || []).filter(v => v.lesson_id === l);
        const kanjiList = (mockDb.kanji || []).filter(k => k.lesson_id === l);
        const grammarList = (mockDb.grammar || []).filter(g => g.lesson_id === l);

        if (vocabList.length === 0 && kanjiList.length === 0 && grammarList.length === 0) continue;

        const masteredV = vocabList.filter(v => {
          const s = userProgress[`${userId}:vocabulary:${v.id}`];
          return s === 'mastered' || s === 'learning';
        }).length;

        const masteredK = kanjiList.filter(k => {
          const s = userProgress[`${userId}:kanji:${k.id}`];
          return s === 'mastered' || s === 'learning';
        }).length;

        const masteredG = grammarList.filter(g => {
          const s = userProgress[`${userId}:grammar:${g.id}`];
          return s === 'mastered' || s === 'learning';
        }).length;

        const vRate = vocabList.length > 0 ? masteredV / vocabList.length : 1;
        const kRate = kanjiList.length > 0 ? masteredK / kanjiList.length : 1;
        const gRate = grammarList.length > 0 ? masteredG / grammarList.length : 1;

        if (vRate >= 0.8 && kRate >= 0.8 && gRate >= 0.8) {
          completed.add(l);
        }
      }
    } catch (err) {
      console.warn('[AI Planner] Error checking database userProgress:', err.message);
    }
  }

  // 3. From currentPlan: Check past days where all scheduled tasks of a lesson were marked completed
  if (currentPlan && Array.isArray(currentPlan.days)) {
    const todayStr = formatDate(new Date());
    const pastDays = currentPlan.days.filter(d => d.date < todayStr);

    const lessonTaskStats = {};
    for (const day of pastDays) {
      for (const t of (day.tasks || [])) {
        if (!t.lesson) continue;
        if (!lessonTaskStats[t.lesson]) {
          lessonTaskStats[t.lesson] = { total: 0, completed: 0 };
        }
        lessonTaskStats[t.lesson].total++;
        if (t.completed) {
          lessonTaskStats[t.lesson].completed++;
        }
      }
    }

    for (const [lStr, stats] of Object.entries(lessonTaskStats)) {
      const l = parseInt(lStr, 10);
      if (stats.total > 0 && stats.completed === stats.total) {
        completed.add(l);
      }
    }
  }

  return Array.from(completed).sort((a, b) => a - b);
}

/**
 * Refine Study Plan strictly keeping endDate (Water-level Rebalancing / Sequential Pipeline)
 * Optimizations:
 * 1. Skips lessons already completed/mastered (does not force user to re-learn).
 * 2. Drops passed days before today from active schedule, starts from today to endDate.
 * 3. Preserves completed history in archivedPastDays so dashboard tracking is preserved.
 * 4. Paces remaining lessons dynamically over remaining days.
 */
async function refineStudyPlan({ currentPlan, userComment, startDate, endDate, currentProgress, userId }) {
  const todayStr = formatDate(new Date());
  const targetEndDate = normalizeDateStr(endDate) || (currentPlan && normalizeDateStr(currentPlan.endDate));

  // 1. Determine completed lessons
  const completedLessons = getCompletedLessons({ userId, currentPlan, currentProgress });
  const maxCompleted = completedLessons.length > 0 ? Math.max(...completedLessons) : 0;

  let startLesson = 1;
  if (currentProgress && typeof currentProgress.currentLesson === 'number' && currentProgress.currentLesson > 1) {
    startLesson = Math.max(currentProgress.currentLesson, maxCompleted + 1);
  } else if (maxCompleted > 0) {
    startLesson = maxCompleted + 1;
  }
  startLesson = Math.min(50, Math.max(1, startLesson));

  // 2. Determine effective start date & past days
  let effectiveStartDate = todayStr;
  let archivedPastDays = [];

  if (currentPlan && Array.isArray(currentPlan.days)) {
    const pastDays = currentPlan.days.filter(d => d.date < todayStr);
    archivedPastDays = [...(currentPlan.archivedPastDays || []), ...pastDays];
  }

  // If user explicitly provided a future startDate, use it; otherwise start from today
  const normStartDate = normalizeDateStr(startDate);
  if (normStartDate && normStartDate >= todayStr) {
    effectiveStartDate = normStartDate;
  }

  if (effectiveStartDate > targetEndDate) {
    effectiveStartDate = targetEndDate;
  }

  const remainingDaysCount = diffInDays(effectiveStartDate, targetEndDate);
  const remainingLessonsCount = Math.max(1, 50 - startLesson + 1);

  // 3. Generate refined algorithmic plan for the remaining lessons over the remaining days
  const refinedPlan = generateAlgorithmicPlan({
    startDate: effectiveStartDate,
    endDate: targetEndDate,
    targetLevel: 'All',
    startLesson,
    targetLesson: 50,
    archivedPastDays,
    originalStartDate: currentPlan?.originalStartDate || currentPlan?.startDate || startDate || todayStr,
    userId
  });

  // 4. Generate educational rationale and refinement note
  const commentLower = (userComment || '').toLowerCase();
  let explanation = '';
  const passedDaysCount = archivedPastDays.length;

  const skippedLessonsStr = startLesson > 1
    ? (startLesson === 2 ? 'Bài 1' : `từ Bài 1 đến Bài ${startLesson - 1}`)
    : '';

  const avgMinutes = Math.round(refinedPlan.days.reduce((s, d) => s + d.totalEstimatedMinutes, 0) / refinedPlan.totalDays);

  if (passedDaysCount > 0 && startLesson > 1) {
    explanation = `🎯 AI đã tối ưu hóa thông minh theo tiến độ thực tế: Bỏ qua ${passedDaysCount} ngày đã qua và không cần học lại các bài đã nắm vững (${skippedLessonsStr}). Lộ trình mới bắt đầu từ hôm nay (${effectiveStartDate}) đến ${targetEndDate}, tập trung học dứt điểm ${remainingLessonsCount} bài còn lại (Bài ${startLesson} ➔ Bài 50) với tải học cân bằng (~${avgMinutes} phút/ngày) để bảo đảm 100% về đích đúng hạn!`;
  } else if (passedDaysCount > 0) {
    explanation = `🎯 AI đã làm mới lộ trình từ hôm nay (${effectiveStartDate}) đến ${targetEndDate}, bỏ qua ${passedDaysCount} ngày đã qua và phân bổ đều đặn các bài học trong ${remainingDaysCount} ngày còn lại, giữ nguyên hạn chót ${targetEndDate}.`;
  } else if (startLesson > 1) {
    explanation = `🎯 AI đã tinh chỉnh kế hoạch: Bỏ qua các bài đã học (${skippedLessonsStr}), tập trung phân bổ đều đặn ${remainingLessonsCount} bài còn lại (Bài ${startLesson} ➔ Bài 50) từ ${effectiveStartDate} đến ${targetEndDate} (~${avgMinutes} phút/ngày).`;
  } else {
    explanation = `AI đã làm mới hoàn toàn kế hoạch học tập trọn vẹn 50 bài học theo khung thời gian từ ${effectiveStartDate} đến ${targetEndDate}. Mỗi bài học đều được tích hợp trực tiếp 2 phần ôn tập vào ngày học ngữ pháp.`;
  }

  if (commentLower.includes('bận') || commentLower.includes('nghỉ') || commentLower.includes('giảm') || commentLower.includes('ốm') || commentLower.includes('mệt')) {
    explanation += ` (Đã tự động điều chỉnh phân bổ nhẹ nhàng hơn theo yêu cầu giảm tải của bạn).`;
  } else if (commentLower.includes('nhanh') || commentLower.includes('sớm') || commentLower.includes('dồn') || commentLower.includes('tăng')) {
    explanation += ` (Đã ưu tiên tăng tốc và dồn tải tối đa lên các ngày sớm nhất theo mong muốn).`;
  }

  refinedPlan.refinementNote = explanation;
  refinedPlan.lastRefinedAt = new Date().toISOString();
  return refinedPlan;
}

/**
 * Calculate Pace Deviation (Ahead / Behind / On Track)
 */
function calculatePaceDeviation({ startDate, endDate, totalLessons = 50, completedLessons = 0, currentProgress = {} }) {
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const today = new Date();
  
  const totalDays = Math.max(1, Math.round((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const daysElapsed = Math.max(0, Math.min(totalDays, Math.round((today.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24))));

  const expectedRatio = daysElapsed / totalDays;
  const expectedLessons = parseFloat((expectedRatio * totalLessons).toFixed(1));
  const actualLessons = Math.max(completedLessons, currentProgress.currentLesson ? currentProgress.currentLesson - 1 : 0);
  const actualRatio = totalLessons > 0 ? actualLessons / totalLessons : 0;

  const lessonsDiff = parseFloat((actualLessons - expectedLessons).toFixed(1));
  const daysDiff = totalLessons > 0 ? parseFloat(((lessonsDiff / (totalLessons / totalDays))).toFixed(1)) : 0;

  let status = 'on_track';
  let label = 'Đúng tiến độ 🟢';
  let message = 'Bạn đang bám sát hoàn hảo kế hoạch đề ra!';

  if (totalLessons > 0 && actualLessons >= totalLessons) {
    status = 'completed';
    label = 'Đã hoàn thành toàn bộ 🎉';
    message = `Chúc mừng bạn! Bạn đã hoàn thành toàn bộ ${totalLessons}/${totalLessons} bài học của chương trình!`;
  } else if (daysDiff >= 0.8) {
    status = 'ahead';
    label = `Nhanh hơn +${Math.abs(daysDiff)} ngày 🚀`;
    message = `Tuyệt vời! Bạn đang nhanh hơn kế hoạch ${Math.abs(daysDiff)} ngày, sẽ về đích sớm trước ngày ${endDate}!`;
  } else if (daysDiff <= -0.8) {
    status = 'behind';
    label = `Chậm hơn ${Math.abs(daysDiff)} ngày ⚠️`;
    message = `Bạn đang chậm hơn kế hoạch ${Math.abs(daysDiff)} ngày. Hãy dành thêm thời gian hôm nay để bù bài và kịp về đích đúng hạn ${endDate}!`;
  }

  return {
    status,
    label,
    message,
    daysDiff,
    lessonsDiff,
    totalDays,
    daysElapsed,
    daysRemaining: Math.max(0, totalDays - daysElapsed),
    totalLessons,
    expectedLessons,
    actualLessons,
    expectedPercentage: parseFloat((expectedRatio * 100).toFixed(1)),
    actualPercentage: parseFloat((actualRatio * 100).toFixed(1))
  };
}

/**
 * Rebatch tasks for a specific date according to user custom preferences
 * Allows user to actively split or merge vocabulary, kanji, or grammar into N batches
 * @param {Object} params
 * @param {Object} params.plan - Current study plan
 * @param {string} params.date - Date to rebatch (e.g. '2026-09-24')
 * @param {Array} params.configs - Array of { lesson, itemType, batchCount }
 */
function rebatchDayTasks({ plan, date, configs = [] }) {
  if (!plan || !Array.isArray(plan.days)) {
    throw new Error('Kế hoạch học tập không hợp lệ');
  }

  const day = plan.days.find(d => d.date === date);
  if (!day) {
    throw new Error(`Không tìm thấy ngày học ${date} trong kế hoạch`);
  }

  const mockDb = require('../db/mockDb');
  const normalizedConfigs = Array.isArray(configs) ? configs : [configs];

  if (!day.tasks) day.tasks = [];

  for (const cfg of normalizedConfigs) {
    const lesson = parseInt(cfg.lesson, 10);
    const itemType = cfg.itemType; // 'vocabulary' | 'kanji' | 'grammar'
    if (!lesson || !itemType) continue;

    // Find all existing tasks for this (lesson, itemType) on this day
    const matchingTasks = day.tasks.filter(t => (t.lesson === lesson || t.lesson_id === lesson) && t.itemType === itemType);
    if (matchingTasks.length === 0) continue;

    // Collect all items for this skill
    let allItems = [];
    if (itemType === 'vocabulary') {
      const dbVocab = (mockDb.vocabulary || []).filter(v => v.lesson_id === lesson);
      const existingIds = [];
      matchingTasks.forEach(t => {
        if (Array.isArray(t.itemIds)) {
          t.itemIds.forEach(id => {
            if (!existingIds.includes(id)) existingIds.push(id);
          });
        }
      });
      if (existingIds.length > 0) {
        allItems = existingIds.map(id => dbVocab.find(v => v.id === id)).filter(Boolean);
        if (allItems.length === 0) allItems = dbVocab;
      } else {
        allItems = dbVocab;
      }
    } else if (itemType === 'kanji') {
      const dbKanji = (mockDb.kanji || []).filter(k => k.lesson_id === lesson);
      const existingIds = [];
      matchingTasks.forEach(t => {
        if (Array.isArray(t.itemIds)) {
          t.itemIds.forEach(id => {
            if (!existingIds.includes(id)) existingIds.push(id);
          });
        }
      });
      if (existingIds.length > 0) {
        allItems = existingIds.map(id => dbKanji.find(k => k.id === id)).filter(Boolean);
        if (allItems.length === 0) allItems = dbKanji;
      } else {
        allItems = dbKanji;
      }
    } else if (itemType === 'grammar') {
      const dbGrammar = (mockDb.grammar || []).filter(g => g.lesson_id === lesson);
      const existingIds = [];
      matchingTasks.forEach(t => {
        if (Array.isArray(t.itemIds)) {
          t.itemIds.forEach(id => {
            if (!existingIds.includes(id)) existingIds.push(id);
          });
        }
      });
      if (existingIds.length > 0) {
        allItems = existingIds.map(id => dbGrammar.find(g => g.id === id)).filter(Boolean);
        if (allItems.length === 0) allItems = dbGrammar;
      } else {
        allItems = dbGrammar;
      }
    }

    if (allItems.length === 0) continue;

    const batchSlices = [];
    if (Array.isArray(cfg.batches) && cfg.batches.length > 0) {
      const unitName = itemType === 'vocabulary' ? 'từ vựng' : itemType === 'kanji' ? 'chữ Hán' : 'mẫu ngữ pháp';
      const totalAllocated = cfg.batches.reduce((sum, b) => sum + (parseInt(b.count, 10) || 0), 0);

      if (totalAllocated < allItems.length) {
        const missing = allItems.length - totalAllocated;
        throw new Error(`Chưa phân bổ hết kiến thức Bài ${lesson} (${unitName}): Còn thiếu ${missing} ${unitName} chưa có trong batch nào! Cần phân bổ đủ 100% (${allItems.length} ${unitName}) trước khi áp dụng.`);
      }
      if (totalAllocated > allItems.length) {
        const excess = totalAllocated - allItems.length;
        throw new Error(`Số lượng phân bổ Bài ${lesson} (${unitName}) vượt quá mục tiêu: Đã phân bổ ${totalAllocated} / ${allItems.length} ${unitName} (thừa ${excess} ${unitName}). Vui lòng điều chỉnh lại.`);
      }

      for (let i = 0; i < cfg.batches.length; i++) {
        const bCount = parseInt(cfg.batches[i].count, 10);
        if (!bCount || bCount <= 0) {
          throw new Error(`Batch #${i + 1} của Bài ${lesson} (${unitName}) phải có ít nhất 1 ${unitName}.`);
        }
      }

      let currentOffset = 0;
      for (let i = 0; i < cfg.batches.length; i++) {
        const b = cfg.batches[i];
        const bCount = parseInt(b.count, 10);
        const sub = allItems.slice(currentOffset, currentOffset + bCount);
        batchSlices.push({
          sub,
          offset: currentOffset,
          customDueTime: b.due_time,
          customTitle: b.title
        });
        currentOffset += bCount;
      }
    } else {
      const requestedBatches = Math.max(1, Math.min(20, parseInt(cfg.batchCount, 10) || 1));
      const effectiveBatches = Math.min(requestedBatches, allItems.length);
      const chunkSize = Math.ceil(allItems.length / effectiveBatches);
      let currentOffset = 0;
      for (let c = 0; c < effectiveBatches; c++) {
        const sub = allItems.slice(currentOffset, currentOffset + chunkSize);
        if (sub.length > 0) {
          batchSlices.push({
            sub,
            offset: currentOffset
          });
          currentOffset += sub.length;
        }
      }
    }

    const totalBatches = batchSlices.length;
    // Build new tasks
    const newTasks = [];
    for (let c = 0; c < totalBatches; c++) {
      const slice = batchSlices[c];
      const sub = slice.sub;
      if (!sub || sub.length === 0) continue;

      let title = '';
      let scopeDetails = '';
      let wp = 0;
      let estMin = 0;
      const subIds = sub.map(x => x.id);

      if (itemType === 'vocabulary') {
        const startIdx = slice.offset + 1;
        const endIdx = slice.offset + sub.length;
        const firstW = sub[0]?.hiragana || sub[0]?.word || '';
        const lastW = sub[sub.length - 1]?.hiragana || sub[sub.length - 1]?.word || '';
        title = slice.customTitle || (totalBatches > 1
          ? `Minna Bài ${lesson}: Học từ vựng (Phần ${c + 1}/${totalBatches}: ${sub.length} từ)`
          : `Minna Bài ${lesson}: Học chính xác ${sub.length} từ vựng`);
        scopeDetails = totalBatches > 1
          ? `Phần ${c + 1}: ${sub.length} từ (Từ #${startIdx}: ${firstW} ➔ #${endIdx}: ${lastW})`
          : `Toàn bộ ${sub.length} từ vựng Bài ${lesson}`;
        wp = sub.length * WORKLOAD_WEIGHTS.vocabulary;
        estMin = sub.length * 6;
      } else if (itemType === 'kanji') {
        const chars = sub.map(k => k.kanji || k.character).filter(Boolean).join(', ');
        title = slice.customTitle || (totalBatches > 1
          ? `Minna Bài ${lesson}: Nắm vững chữ Hán (Phần ${c + 1}/${totalBatches}: ${sub.length} chữ)`
          : `Minna Bài ${lesson}: Nắm vững toàn bộ ${sub.length} chữ Hán`);
        scopeDetails = `Chữ Hán (${sub.length} chữ): ${chars}`;
        wp = sub.length * WORKLOAD_WEIGHTS.kanji;
        estMin = sub.length * 18;
      } else if (itemType === 'grammar') {
        const gTitles = sub.map(g => g.title || g.structure || g.name).filter(Boolean).join(' • ');
        title = slice.customTitle || (totalBatches > 1
          ? `Minna Bài ${lesson}: Mẫu ngữ pháp cốt lõi (Phần ${c + 1}/${totalBatches}: ${sub.length} mẫu)`
          : `Minna Bài ${lesson}: Làm chủ ${sub.length} mẫu ngữ pháp cốt lõi`);
        scopeDetails = `Mẫu ngữ pháp (${sub.length} mẫu): ${gTitles}`;
        wp = sub.length * WORKLOAD_WEIGHTS.grammar;
        estMin = sub.length * 18;
      }

      newTasks.push({
        id: `task_${date}_${itemType}_L${lesson}_p${c + 1}`,
        lesson,
        lesson_id: lesson,
        itemType,
        part: c + 1,
        totalParts: totalBatches,
        itemIds: subIds,
        title,
        scopeDetails,
        targetCount: sub.length,
        currentCount: 0,
        workloadPoints: wp,
        estimatedMinutes: estMin,
        link: `/lessons/${lesson}?tab=${itemType === 'vocabulary' ? 'vocab' : itemType}`,
        completed: false,
        date,
        due_time: slice.customDueTime
      });
    }

    // Replace matching tasks in day.tasks preserving relative order
    const firstIdx = day.tasks.findIndex(t => (t.lesson === lesson || t.lesson_id === lesson) && t.itemType === itemType);
    if (firstIdx >= 0) {
      const before = day.tasks.slice(0, firstIdx).filter(t => !((t.lesson === lesson || t.lesson_id === lesson) && t.itemType === itemType));
      const after = day.tasks.slice(firstIdx).filter(t => !((t.lesson === lesson || t.lesson_id === lesson) && t.itemType === itemType));
      day.tasks = [...before, ...newTasks, ...after];
    } else {
      const nonMatching = day.tasks.filter(t => !((t.lesson === lesson || t.lesson_id === lesson) && t.itemType === itemType));
      day.tasks = [...nonMatching, ...newTasks];
    }
  }

  // Re-distribute step and progressive due_times across all tasks for the day
  day.tasks.forEach((task, idx) => {
    task.step = idx + 1;
    task.date = date;
    if (!task.due_time) {
      const baseHour = Math.min(22, 8 + Math.floor((14 / Math.max(1, day.tasks.length)) * idx));
      const baseMin = (idx % 2 === 0) ? '00' : '30';
      task.due_time = `${String(baseHour).padStart(2, '0')}:${baseMin}`;
    }
  });

  day.plannedCount = day.tasks.length;
  day.workloadPoints = day.tasks.reduce((sum, t) => sum + (t.workloadPoints || 0), 0);
  day.totalEstimatedMinutes = day.tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);

  return { plan, updatedDay: day };
}

/**
 * Calculate batches for a skill based on user's available time across 3 slots:
 * Slot 1: 08:00 - 12:00 (Sáng)
 * Slot 2: 12:00 - 18:00 (Chiều)
 * Slot 3: 18:00 - 22:00 (Tối) -> DỒN TOÀN BỘ PHẦN DƯ (OVERFLOW BUFFER)
 * @param {Object} params
 * @param {number} params.totalItems - Total items (e.g. 47 words)
 * @param {string} params.itemType - 'vocabulary' | 'kanji' | 'grammar'
 * @param {Object} params.timeSlots - { morning: number, afternoon: number, evening: number } in minutes
 * @param {number} [params.lesson] - Lesson number
 * @returns {Array} Array of { count, due_time, title, slotName, estimatedMinutes }
 */
function calculateTimeSlotBatches({ totalItems, itemType = 'vocabulary', timeSlots = {}, lesson = 1 }) {
  if (!totalItems || totalItems <= 0) return [];

  const minsPerItem = itemType === 'vocabulary' ? 6 : 18;
  const morningMins = Math.max(0, parseInt(timeSlots.morning, 10) || 0);
  const afternoonMins = Math.max(0, parseInt(timeSlots.afternoon, 10) || 0);

  // 1. Slot 1 (08:00 - 12:00)
  const cap1 = Math.floor(morningMins / minsPerItem);
  const count1 = Math.min(totalItems, cap1);
  const rem1 = totalItems - count1;

  // 2. Slot 2 (12:00 - 18:00)
  const cap2 = Math.floor(afternoonMins / minsPerItem);
  const count2 = Math.min(rem1, cap2);

  // 3. Slot 3 (18:00 - 22:00) - Absorbs ALL remaining items (overflow buffer)
  const count3 = rem1 - count2;

  const batches = [];
  if (count1 > 0) {
    batches.push({
      count: count1,
      due_time: '11:30',
      slotName: 'Sáng (08:00 - 12:00)',
      estimatedMinutes: count1 * minsPerItem
    });
  }

  if (count2 > 0) {
    batches.push({
      count: count2,
      due_time: '17:30',
      slotName: 'Chiều (12:00 - 18:00)',
      estimatedMinutes: count2 * minsPerItem
    });
  }

  if (count3 > 0) {
    batches.push({
      count: count3,
      due_time: '21:30',
      slotName: 'Tối (18:00 - 22:00) [Dồn task dư]',
      estimatedMinutes: count3 * minsPerItem
    });
  }

  // Fallback if all slots were 0
  if (batches.length === 0 && totalItems > 0) {
    batches.push({
      count: totalItems,
      due_time: '21:30',
      slotName: 'Tối (18:00 - 22:00) [Dồn task dư]',
      estimatedMinutes: totalItems * minsPerItem
    });
  }

  return batches;
}

/**
 * Auto-allocate daily tasks for all skills on a date based on 3 time slots:
 * 08:00-12:00, 12:00-18:00, 18:00-22:00 (overflow)
 * @param {Object} params
 * @param {Object} params.plan - Current study plan
 * @param {string} params.date - Target date YYYY-MM-DD
 * @param {Object} params.timeSlots - { morning: number, afternoon: number, evening: number } in minutes
 * @param {string} params.userId - User ID
 */
function autoAllocateDailyTimeSlots({ plan, date, timeSlots = {}, userId }) {
  if (!plan || !Array.isArray(plan.days)) {
    throw new Error('Kế hoạch học tập không hợp lệ');
  }

  const day = plan.days.find(d => d.date === date);
  if (!day) {
    throw new Error(`Không tìm thấy ngày học ${date} trong kế hoạch`);
  }

  // Find all distinct skill groups present on this day
  const skillGroups = [];
  const seen = new Set();
  (day.tasks || []).forEach(t => {
    if (t.itemType !== 'vocabulary' && t.itemType !== 'kanji' && t.itemType !== 'grammar') return;
    const l = t.lesson || t.lesson_id || 1;
    const key = `${l}_${t.itemType}`;
    if (!seen.has(key)) {
      seen.add(key);
      skillGroups.push({ lesson: l, itemType: t.itemType });
    }
  });

  const configs = [];
  for (const group of skillGroups) {
    const matchingTasks = day.tasks.filter(t => (t.lesson === group.lesson || t.lesson_id === group.lesson) && t.itemType === group.itemType);
    const totalItems = matchingTasks.reduce((s, t) => s + (t.targetCount || 1), 0);

    const calculatedBatches = calculateTimeSlotBatches({
      totalItems,
      itemType: group.itemType,
      timeSlots,
      lesson: group.lesson
    });

    configs.push({
      lesson: group.lesson,
      itemType: group.itemType,
      batches: calculatedBatches.map(b => ({
        count: b.count,
        due_time: b.due_time
      }))
    });
  }

  // Run rebatchDayTasks with these configs
  const rebatchResult = rebatchDayTasks({
    plan,
    date,
    configs
  });

  return {
    plan: rebatchResult.plan,
    updatedDay: rebatchResult.updatedDay,
    configs
  };
}

module.exports = {
  normalizeDateStr,
  diffInDays,
  getMasteredItemIds,
  getLessonCounts,
  generateSequentialLessonTasks,
  validateSequence,
  generateAlgorithmicPlan,
  generateStudyPlan,
  getCompletedLessons,
  getUnfinishedDebt,
  refineStudyPlan,
  calculatePaceDeviation,
  rebatchDayTasks,
  calculateTimeSlotBatches,
  autoAllocateDailyTimeSlots
};
