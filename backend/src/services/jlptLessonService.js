const fs = require('fs');
const path = require('path');

const BACKEND_LESSON_DATA_DIR = path.join(__dirname, '../data/jlpt_lessons');
const BACKEND_GLOBAL_DATA_DIR = path.join(__dirname, '../data/jlpt_global');
const WORKSPACE_DOCS_DIR = path.join(__dirname, '../../../../tai_lieu/bai_tap');

// Lightweight mtime-aware cache so newly dropped/updated JSON files on disk apply immediately
const bankCache = new Map();

/**
 * Pick the existing file with the most recent modification time (mtimeMs)
 * among candidate paths so dropping/updating 50 JSON files in tai_lieu/bai_tap/
 * takes effect immediately without manual copying or server restarts.
 */
function pickNewestExistingPath(candidates) {
  let bestPath = null;
  let bestMtime = -1;

  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        if (stat.mtimeMs > bestMtime) {
          bestMtime = stat.mtimeMs;
          bestPath = filePath;
        }
      }
    } catch {
      // Ignore inaccessible candidate
    }
  }

  return bestPath;
}

/**
 * Resolve file path for a single lesson's IN-LESSON JLPT question bank (1..50).
 * Strictly excludes *_global.json files so lesson bank and global bank never mix.
 */
function resolveLessonBankPath(lessonId) {
  const id = parseInt(lessonId, 10);
  if (isNaN(id) || id < 1 || id > 50) return null;

  const candidates = [
    path.join(WORKSPACE_DOCS_DIR, `bo_cau_hoi_bai${id}_full_lesson.json`),
    path.join(WORKSPACE_DOCS_DIR, `bo_cau_hoi_bai${id}_lesson.json`),
    path.join(WORKSPACE_DOCS_DIR, `bo_cau_hoi_bai${id}_full.json`),
    path.join(WORKSPACE_DOCS_DIR, `bo_cau_hoi_bai${id}.json`),
    path.join(BACKEND_LESSON_DATA_DIR, `lesson_${id}.json`)
  ];

  return pickNewestExistingPath(candidates);
}

/**
 * Resolve file path for a lesson's GLOBAL / CROSS-LESSON JLPT question bank (1..50),
 * used exclusively on the Global Review Hub (/knowledge).
 */
function resolveGlobalBankPath(lessonId) {
  const id = parseInt(lessonId, 10);
  if (isNaN(id) || id < 1 || id > 50) return null;

  const candidates = [
    path.join(WORKSPACE_DOCS_DIR, `bo_cau_hoi_bai${id}_full_global.json`),
    path.join(WORKSPACE_DOCS_DIR, `bo_cau_hoi_bai${id}_global.json`),
    path.join(BACKEND_GLOBAL_DATA_DIR, `global_${id}.json`)
  ];

  return pickNewestExistingPath(candidates);
}

/**
 * Generic mtime-cached JSON loader.
 */
function loadBankFromPath(filePath, expectedBankType) {
  if (!filePath) return null;

  try {
    const stat = fs.statSync(filePath);
    const cached = bankCache.get(filePath);
    if (cached && cached.mtimeMs === stat.mtimeMs) {
      return cached.data;
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);

    // Guard against accidental cross-bank file naming (e.g. bo_cau_hoi_baiX_full.json having bank: "global")
    if (expectedBankType === 'lesson' && parsed && parsed.bank === 'global') {
      return null;
    }
    if (expectedBankType === 'global' && parsed && parsed.bank === 'lesson') {
      return null;
    }

    bankCache.set(filePath, { mtimeMs: stat.mtimeMs, data: parsed });
    return parsed;
  } catch (err) {
    console.error(`[JLPT Service] Failed to read JLPT bank at ${filePath}:`, err.message);
    return null;
  }
}

/**
 * Load and parse a single lesson's IN-LESSON JLPT bank JSON.
 */
function loadLessonBank(lessonId) {
  const filePath = resolveLessonBankPath(lessonId);
  const parsed = loadBankFromPath(filePath, 'lesson');
  if (parsed) return parsed;

  // Fallback to backend lesson folder if a generic filename had mismatched bank tag
  const fallbackPath = path.join(BACKEND_LESSON_DATA_DIR, `lesson_${parseInt(lessonId, 10)}.json`);
  if (fallbackPath !== filePath && fs.existsSync(fallbackPath)) {
    return loadBankFromPath(fallbackPath, 'lesson');
  }
  return null;
}

/**
 * Load and parse a single lesson's GLOBAL JLPT bank JSON.
 */
function loadGlobalBank(lessonId) {
  const filePath = resolveGlobalBankPath(lessonId);
  const parsed = loadBankFromPath(filePath, 'global');
  if (parsed) return parsed;

  const fallbackPath = path.join(BACKEND_GLOBAL_DATA_DIR, `global_${parseInt(lessonId, 10)}.json`);
  if (fallbackPath !== filePath && fs.existsSync(fallbackPath)) {
    return loadBankFromPath(fallbackPath, 'global');
  }
  return null;
}

/**
 * Scan lessons 1..50 to discover all lessons that currently have an IN-LESSON JLPT bank JSON.
 */
function getAvailableJlptLessons() {
  const availableLessonIds = [];
  for (let id = 1; id <= 50; id++) {
    if (loadLessonBank(id)) {
      availableLessonIds.push(id);
    }
  }
  const maxLessonId = availableLessonIds.length > 0 ? Math.max(...availableLessonIds) : 1;
  return { availableLessonIds, maxLessonId };
}

/**
 * Scan lessons 1..50 to discover all lessons that currently have a GLOBAL JLPT bank JSON.
 * Returns per-lesson question counts so the /knowledge lesson picker can display rich badges.
 */
function getAvailableGlobalJlptLessons() {
  const availableLessonIds = [];
  const lessonStats = {};

  for (let id = 1; id <= 50; id++) {
    const bank = loadGlobalBank(id);
    if (bank) {
      availableLessonIds.push(id);
      const qCount = Array.isArray(bank.questions) ? bank.questions.length : 0;
      lessonStats[id] = {
        lesson_id: id,
        level: bank.level || (id <= 25 ? 'N5' : 'N4'),
        totalQuestions: qCount,
        totalPassages: Array.isArray(bank.passages) ? bank.passages.length : 0
      };
    }
  }

  const maxLessonId = availableLessonIds.length > 0 ? Math.max(...availableLessonIds) : 1;
  return {
    availableLessonIds,
    maxLessonId,
    lessonStats
  };
}

/**
 * Standard Fisher-Yates shuffle (unbiased random permutation).
 */
function shuffleArray(arr) {
  if (!Array.isArray(arr)) return [];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Synchronously shuffle choices, choices_kanji, choices_kana, wrong_notes, answer,
 * and kumitate pieces (items + order) so correct answers are evenly distributed
 * without breaking audio/star-slot consistency.
 */
function shuffleQuestionChoices(question, passageMap) {
  const q = JSON.parse(JSON.stringify(question));

  const choiceLen = Array.isArray(q.choices)
    ? q.choices.length
    : Array.isArray(q.choices_kanji)
      ? q.choices_kanji.length
      : Array.isArray(q.choices_kana)
        ? q.choices_kana.length
        : 0;

  if (choiceLen <= 1 || typeof q.answer !== 'number') {
    return q;
  }

  // If a pre-recorded audio file already speaks "1番, 2番, 3番" in fixed order, keep order intact
  const linkedPassage = q.passage ? passageMap.get(q.passage) : null;
  const hasPrerecordedSpokenChoices =
    Boolean(q.audio && q.audio.choices_spoken) &&
    Boolean(q.audio_url || (q.audio && q.audio.audio_url) || (linkedPassage && linkedPassage.audio_url));

  if (hasPrerecordedSpokenChoices) {
    return q;
  }

  const indices = Array.from({ length: choiceLen }, (_, idx) => idx);
  const perm = shuffleArray(indices); // perm[newIdx] = oldIdx

  if (Array.isArray(q.choices) && q.choices.length === choiceLen) {
    q.choices = perm.map((oldIdx) => q.choices[oldIdx]);
  }
  if (Array.isArray(q.choices_kanji) && q.choices_kanji.length === choiceLen) {
    q.choices_kanji = perm.map((oldIdx) => q.choices_kanji[oldIdx]);
  }
  if (Array.isArray(q.choices_kana) && q.choices_kana.length === choiceLen) {
    q.choices_kana = perm.map((oldIdx) => q.choices_kana[oldIdx]);
  }
  if (Array.isArray(q.wrong_notes) && q.wrong_notes.length === choiceLen) {
    q.wrong_notes = perm.map((oldIdx) => q.wrong_notes[oldIdx]);
  }

  // Update kumitate (star ★ sentence assembly) pieces in exact mathematical lockstep
  if (
    q.pieces &&
    Array.isArray(q.pieces.items) &&
    q.pieces.items.length === choiceLen &&
    Array.isArray(q.pieces.order)
  ) {
    const oldItems = q.pieces.items;
    const oldOrder = q.pieces.order;
    q.pieces = {
      ...q.pieces,
      items: perm.map((oldIdx) => oldItems[oldIdx]),
      order: oldOrder.map((oldIdx) => perm.indexOf(oldIdx))
    };
  }

  q.answer = perm.indexOf(q.answer);
  return q;
}

/**
 * Group questions into indivisible passage units so multi-question passages
 * (e.g. 4-blank cloze BB or 3-question reading DC) stay together in internal order.
 */
function groupQuestionsByPassageUnits(questions) {
  const units = [];
  const passageUnitMap = new Map();

  for (const q of questions) {
    if (q.passage) {
      if (!passageUnitMap.has(q.passage)) {
        const unit = [];
        passageUnitMap.set(q.passage, unit);
        units.push(unit);
      }
      passageUnitMap.get(q.passage).push(q);
    } else {
      units.push([q]);
    }
  }

  return units;
}

/**
 * Pick targetCount (or all) questions from an ordered list of passage units,
 * keeping passage groups intact and shuffling choices per question.
 */
function pickQuestionsFromOrderedUnits(orderedUnits, targetCount, useAll, passageMap) {
  if (!Array.isArray(orderedUnits) || orderedUnits.length === 0) {
    return [];
  }

  const chosenQuestions = [];
  if (useAll) {
    for (const unit of orderedUnits) {
      chosenQuestions.push(...unit);
    }
  } else {
    const limit = typeof targetCount === 'number' && targetCount > 0 ? targetCount : 0;
    if (limit === 0) return [];

    for (const unit of orderedUnits) {
      if (chosenQuestions.length >= limit) break;
      if (chosenQuestions.length + unit.length <= limit || chosenQuestions.length === 0) {
        chosenQuestions.push(...unit);
      }
    }

    // Fallback top-up if mixed unit sizes left a gap
    if (chosenQuestions.length < limit) {
      const pickedIds = new Set(chosenQuestions.map((item) => item.id));
      for (const unit of orderedUnits) {
        for (const item of unit) {
          if (!pickedIds.has(item.id)) {
            chosenQuestions.push(item);
            pickedIds.add(item.id);
            if (chosenQuestions.length >= limit) break;
          }
        }
        if (chosenQuestions.length >= limit) break;
      }
    }
  }

  return chosenQuestions.map((q) => shuffleQuestionChoices(q, passageMap));
}

/**
 * Single-lesson Mondai selector: group by passage, Fisher-Yates shuffle units, and pick.
 */
function selectMondaiQuestions(mondaiQuestions, targetCount, useAll, passageMap) {
  if (!Array.isArray(mondaiQuestions) || mondaiQuestions.length === 0) {
    return [];
  }
  const units = groupQuestionsByPassageUnits(mondaiQuestions);
  const shuffledUnits = shuffleArray(units);
  return pickQuestionsFromOrderedUnits(shuffledUnits, targetCount, useAll, passageMap);
}

/**
 * Multi-lesson Round-Robin Group-Aware Fisher-Yates selector for Global Exam Hub:
 * Shuffles passage units inside each selected lesson, then interleaves units round-robin
 * across lessons (re-shuffling lesson order at each depth) so every selected lesson
 * contributes evenly while multi-question passages remain 100% intact.
 */
function selectGlobalMondaiQuestionsRoundRobin(loadedBanks, mondaiKey, targetCount, useAll, passageMap) {
  const lessonQueues = [];

  for (const { lessonId, bankData } of shuffleArray(loadedBanks)) {
    const qs = (Array.isArray(bankData.questions) ? bankData.questions : [])
      .filter((q) => q.mondai === mondaiKey)
      .map((q) => ({ ...q, lesson_id: q.lesson_id || lessonId }));

    if (qs.length > 0) {
      const units = groupQuestionsByPassageUnits(qs);
      lessonQueues.push(shuffleArray(units));
    }
  }

  if (lessonQueues.length === 0) return [];

  const interleavedUnits = [];
  let depth = 0;
  let addedAtDepth = true;

  while (addedAtDepth) {
    addedAtDepth = false;
    const roundOrder = shuffleArray(lessonQueues.map((_, idx) => idx));
    for (const qIdx of roundOrder) {
      if (depth < lessonQueues[qIdx].length) {
        interleavedUnits.push(lessonQueues[qIdx][depth]);
        addedAtDepth = true;
      }
    }
    depth += 1;
  }

  return pickQuestionsFromOrderedUnits(interleavedUnits, targetCount, useAll, passageMap);
}

/**
 * Compute full structured metadata (Sections -> Mondai -> Blueprint & Bank counts) for a single lesson.
 */
function buildBankMetadata(bankData) {
  const level = bankData.level || (bankData.lesson_id <= 25 ? 'N5' : 'N4');
  const blueprint = bankData.blueprint || {};
  const allQuestions = Array.isArray(bankData.questions) ? bankData.questions : [];

  const countByMondai = {};
  for (const q of allQuestions) {
    countByMondai[q.mondai] = (countByMondai[q.mondai] || 0) + 1;
  }

  const enrichedMondai = (bankData.mondai || []).map((m) => {
    const totalInBank = countByMondai[m.key] || 0;
    const blueprintCount = typeof blueprint[m.key] === 'number' ? blueprint[m.key] : 0;
    const isActive = totalInBank > 0 || blueprintCount > 0;
    return {
      ...m,
      totalInBank,
      blueprintCount,
      isActive
    };
  });

  const enrichedSections = (bankData.sections || []).map((sec) => {
    const secMondai = enrichedMondai
      .filter((m) => m.section === sec.key && m.isActive)
      .sort((a, b) => (a.no || 0) - (b.no || 0));

    const totalInBank = secMondai.reduce((sum, m) => sum + m.totalInBank, 0);
    const blueprintCount = secMondai.reduce((sum, m) => sum + m.blueprintCount, 0);
    const minutes = level === 'N4' ? (sec.minutes_n4 || 35) : (sec.minutes_n5 || 25);

    return {
      ...sec,
      minutes,
      totalInBank,
      blueprintCount,
      mondaiList: secMondai
    };
  });

  const totalBankQuestions = enrichedSections.reduce((s, sec) => s + sec.totalInBank, 0);
  const totalBlueprintQuestions = enrichedSections.reduce((s, sec) => s + sec.blueprintCount, 0);
  const totalExamMinutes = enrichedSections.reduce((s, sec) => s + sec.minutes, 0);

  return {
    lesson_id: bankData.lesson_id,
    level,
    sections: enrichedSections,
    mondai: enrichedMondai.filter((m) => m.isActive),
    blueprint,
    stats: {
      totalBankQuestions,
      totalBlueprintQuestions,
      totalExamMinutes,
      totalPassages: Array.isArray(bankData.passages) ? bankData.passages.length : 0
    }
  };
}

/**
 * Compute aggregated structured metadata across MULTIPLE selected lessons' GLOBAL banks.
 */
function buildGlobalBanksMetadata(loadedBanks) {
  if (!Array.isArray(loadedBanks) || loadedBanks.length === 0) return null;

  const hasN5 = loadedBanks.some(
    ({ lessonId, bankData }) => (bankData.level || (lessonId <= 25 ? 'N5' : 'N4')) === 'N5'
  );
  const hasN4 = loadedBanks.some(
    ({ lessonId, bankData }) => (bankData.level || (lessonId <= 25 ? 'N5' : 'N4')) === 'N4'
  );
  const level = hasN5 && hasN4 ? 'N5 + N4' : hasN4 ? 'N4' : 'N5';

  const countByMondai = {};
  let totalPassages = 0;
  const mergedBlueprint = {};
  const mondaiMap = new Map();

  for (const { bankData } of loadedBanks) {
    const qs = Array.isArray(bankData.questions) ? bankData.questions : [];
    for (const q of qs) {
      countByMondai[q.mondai] = (countByMondai[q.mondai] || 0) + 1;
    }
    totalPassages += Array.isArray(bankData.passages) ? bankData.passages.length : 0;

    for (const m of bankData.mondai || []) {
      if (!mondaiMap.has(m.key)) {
        mondaiMap.set(m.key, { ...m });
      }
    }

    const bp = bankData.blueprint || {};
    for (const [k, val] of Object.entries(bp)) {
      if (typeof val === 'number') {
        mergedBlueprint[k] = Math.max(mergedBlueprint[k] || 0, val);
      }
    }
  }

  const baseSections = loadedBanks[0].bankData.sections || [];
  const enrichedMondai = Array.from(mondaiMap.values()).map((m) => {
    const totalInBank = countByMondai[m.key] || 0;
    const rawBp = typeof mergedBlueprint[m.key] === 'number' ? mergedBlueprint[m.key] : 0;
    const blueprintCount = totalInBank > 0 ? rawBp : 0;
    const isActive = totalInBank > 0;
    return {
      ...m,
      totalInBank,
      blueprintCount,
      isActive
    };
  });

  const enrichedSections = baseSections.map((sec) => {
    const secMondai = enrichedMondai
      .filter((m) => m.section === sec.key && m.isActive)
      .sort((a, b) => (a.no || 0) - (b.no || 0));

    const totalInBank = secMondai.reduce((sum, m) => sum + m.totalInBank, 0);
    const blueprintCount = secMondai.reduce((sum, m) => sum + m.blueprintCount, 0);
    const minutes = hasN4 ? (sec.minutes_n4 || 35) : (sec.minutes_n5 || 25);

    return {
      ...sec,
      minutes,
      totalInBank,
      blueprintCount,
      mondaiList: secMondai
    };
  });

  const totalBankQuestions = enrichedSections.reduce((s, sec) => s + sec.totalInBank, 0);
  const totalBlueprintQuestions = enrichedSections.reduce((s, sec) => s + sec.blueprintCount, 0);
  const totalExamMinutes = enrichedSections.reduce((s, sec) => s + sec.minutes, 0);

  return {
    lesson_ids: loadedBanks.map((b) => b.lessonId),
    level,
    sections: enrichedSections,
    mondai: enrichedMondai.filter((m) => m.isActive),
    blueprint: mergedBlueprint,
    stats: {
      selectedLessonCount: loadedBanks.length,
      totalBankQuestions,
      totalBlueprintQuestions,
      totalExamMinutes,
      totalPassages
    }
  };
}

/**
 * Build a shuffled IN-LESSON question set + passages dictionary for any of the 4 cards.
 */
function buildJlptTestSet(lessonId, options = {}) {
  const bankData = loadLessonBank(lessonId);
  if (!bankData) return null;

  const parsedLessonId = parseInt(lessonId, 10) || bankData.lesson_id || 1;
  const meta = buildBankMetadata(bankData);
  const allQuestions = (Array.isArray(bankData.questions) ? bankData.questions : []).map((q) => ({
    ...q,
    lesson_id: q.lesson_id || parsedLessonId
  }));
  const allPassages = Array.isArray(bankData.passages) ? bankData.passages : [];

  const passageMap = new Map();
  for (const p of allPassages) {
    passageMap.set(p.id, p);
  }

  const card = options.card || 'full_exam';
  const scope = options.scope || 'blueprint';
  const requestedIds = Array.isArray(options.ids)
    ? options.ids
    : typeof options.ids === 'string' && options.ids.trim()
      ? options.ids.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

  const selectedQuestions = [];

  if (card === 'custom_ids' || requestedIds.length > 0) {
    const idSet = new Set(requestedIds);
    for (const sec of meta.sections) {
      for (const m of sec.mondaiList) {
        const matching = allQuestions.filter((q) => q.mondai === m.key && idSet.has(q.id));
        const picked = selectMondaiQuestions(matching, matching.length, true, passageMap);
        for (const q of picked) {
          selectedQuestions.push({
            ...q,
            section: sec.key,
            section_ja: sec.ja,
            section_name: sec.name,
            mondai_no: m.no,
            mondai_ja: m.ja,
            mondai_name: m.name,
            mondai_instr: m.instr
          });
        }
      }
    }
  } else {
    const targetSections =
      card === 'full_exam'
        ? meta.sections
        : meta.sections.filter((sec) => sec.key === card);

    for (const sec of targetSections) {
      for (const m of sec.mondaiList) {
        if (scope !== 'blueprint' && scope !== 'all' && m.key !== scope) {
          continue;
        }

        const pool = allQuestions.filter((q) => q.mondai === m.key);
        const useAll = card !== 'full_exam' && (scope === 'all' || scope === m.key);
        const targetCount = m.blueprintCount;

        const picked = selectMondaiQuestions(pool, targetCount, useAll, passageMap);
        for (const q of picked) {
          selectedQuestions.push({
            ...q,
            section: sec.key,
            section_ja: sec.ja,
            section_name: sec.name,
            mondai_no: m.no,
            mondai_ja: m.ja,
            mondai_name: m.name,
            mondai_instr: m.instr
          });
        }
      }
    }
  }

  const usedPassages = {};
  for (const q of selectedQuestions) {
    const pId = q.passage || (q.audio && q.audio.passage);
    if (pId && passageMap.has(pId)) {
      usedPassages[pId] = passageMap.get(pId);
    }
  }

  return {
    ...meta,
    card,
    scope,
    questions: selectedQuestions,
    passages: usedPassages
  };
}

/**
 * Parse a comma-separated string or array of lesson IDs into a clean sorted list within 1..50.
 */
function parseLessonIdList(rawLessons) {
  const list = Array.isArray(rawLessons)
    ? rawLessons
    : typeof rawLessons === 'string'
      ? rawLessons.split(',')
      : [];

  const unique = new Set();
  for (const item of list) {
    const id = parseInt(String(item).trim(), 10);
    if (!isNaN(id) && id >= 1 && id <= 50) {
      unique.add(id);
    }
  }
  return Array.from(unique).sort((a, b) => a - b);
}

/**
 * Build a multi-lesson GLOBAL JLPT question set + passages dictionary from _global banks
 * across all user-selected lessons (1..50).
 */
function buildGlobalJlptTestSet(rawLessons, options = {}) {
  const requestedLessonIds = parseLessonIdList(rawLessons);
  const requestedIds = Array.isArray(options.ids)
    ? options.ids
    : typeof options.ids === 'string' && options.ids.trim()
      ? options.ids.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

  // If retrying wrong question IDs (e.g. "L12-global-KY-003"), auto-include their source lessons
  const targetLessonSet = new Set(requestedLessonIds);
  if (options.card === 'custom_ids' || requestedIds.length > 0) {
    for (const qId of requestedIds) {
      const match = /^L(\d+)-global-/i.exec(qId);
      if (match) {
        const parsedId = parseInt(match[1], 10);
        if (parsedId >= 1 && parsedId <= 50) targetLessonSet.add(parsedId);
      }
    }
  }

  const candidateIds = Array.from(targetLessonSet).sort((a, b) => a - b);
  const loadedBanks = [];
  const missingLessonIds = [];

  for (const id of candidateIds) {
    const bankData = loadGlobalBank(id);
    if (bankData) {
      loadedBanks.push({ lessonId: id, bankData });
    } else {
      missingLessonIds.push(id);
    }
  }

  if (loadedBanks.length === 0) {
    return null;
  }

  const meta = buildGlobalBanksMetadata(loadedBanks);
  const passageMap = new Map();
  for (const { bankData } of loadedBanks) {
    for (const p of bankData.passages || []) {
      passageMap.set(p.id, p);
    }
  }

  if (options.metaOnly) {
    return {
      ...meta,
      requestedLessonIds,
      effectiveLessonIds: loadedBanks.map((b) => b.lessonId),
      missingLessonIds
    };
  }

  const card = options.card || 'full_exam';
  const scope = options.scope || 'blueprint';
  const selectedQuestions = [];

  if (card === 'custom_ids' || requestedIds.length > 0) {
    const idSet = new Set(requestedIds);
    const allMergedQuestions = [];
    for (const { lessonId, bankData } of loadedBanks) {
      for (const q of bankData.questions || []) {
        if (idSet.has(q.id)) {
          allMergedQuestions.push({ ...q, lesson_id: q.lesson_id || lessonId });
        }
      }
    }

    for (const sec of meta.sections) {
      for (const m of sec.mondaiList) {
        const matching = allMergedQuestions.filter((q) => q.mondai === m.key);
        const picked = selectMondaiQuestions(matching, matching.length, true, passageMap);
        for (const q of picked) {
          selectedQuestions.push({
            ...q,
            section: sec.key,
            section_ja: sec.ja,
            section_name: sec.name,
            mondai_no: m.no,
            mondai_ja: m.ja,
            mondai_name: m.name,
            mondai_instr: m.instr
          });
        }
      }
    }
  } else {
    const targetSections =
      card === 'full_exam'
        ? meta.sections
        : meta.sections.filter((sec) => sec.key === card);

    for (const sec of targetSections) {
      for (const m of sec.mondaiList) {
        if (scope !== 'blueprint' && scope !== 'all' && m.key !== scope) {
          continue;
        }

        const useAll = card !== 'full_exam' && (scope === 'all' || scope === m.key);
        const targetCount = m.blueprintCount;

        const picked = selectGlobalMondaiQuestionsRoundRobin(
          loadedBanks,
          m.key,
          targetCount,
          useAll,
          passageMap
        );

        for (const q of picked) {
          selectedQuestions.push({
            ...q,
            section: sec.key,
            section_ja: sec.ja,
            section_name: sec.name,
            mondai_no: m.no,
            mondai_ja: m.ja,
            mondai_name: m.name,
            mondai_instr: m.instr
          });
        }
      }
    }
  }

  const usedPassages = {};
  for (const q of selectedQuestions) {
    const pId = q.passage || (q.audio && q.audio.passage);
    if (pId && passageMap.has(pId)) {
      usedPassages[pId] = passageMap.get(pId);
    }
  }

  return {
    ...meta,
    requestedLessonIds,
    effectiveLessonIds: loadedBanks.map((b) => b.lessonId),
    missingLessonIds,
    card,
    scope,
    questions: selectedQuestions,
    passages: usedPassages
  };
}

module.exports = {
  getAvailableJlptLessons,
  getAvailableGlobalJlptLessons,
  loadLessonBank,
  loadGlobalBank,
  buildBankMetadata,
  buildGlobalBanksMetadata,
  buildJlptTestSet,
  buildGlobalJlptTestSet
};
