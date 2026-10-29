const fs = require('fs');
const path = require('path');

const BACKEND_LESSON_DATA_DIR = path.join(__dirname, '../data/jlpt_lessons');
const WORKSPACE_DOCS_DIR = path.join(__dirname, '../../../../tai_lieu/bai_tap');

// LRU-bounded parsed bank cache (protects Render Free 512MB RAM when 25-50 lessons are active)
const MAX_CACHED_BANKS = 15;
const bankCache = new Map();

// Ultra-lightweight summary cache (< 5 KB for all 50 lessons) for instant /available scans
const metaSummaryCache = new Map();

/**
 * Put parsed bank in LRU cache, evicting least-recently-used entry when exceeding MAX_CACHED_BANKS.
 */
function setBankCacheLRU(cacheKey, signature, data) {
  if (bankCache.has(cacheKey)) {
    bankCache.delete(cacheKey);
  } else if (bankCache.size >= MAX_CACHED_BANKS) {
    const oldestKey = bankCache.keys().next().value;
    if (oldestKey !== undefined) {
      bankCache.delete(oldestKey);
    }
  }
  bankCache.set(cacheKey, { signature, data });
}

/**
 * Resolve unified file path(s) for a lesson's single shared JLPT question bank (1..50).
 * Used identically by BOTH per-lesson JLPT practice (/lessons/[id]?tab=jlpt)
 * AND multi-lesson global JLPT practice (/knowledge?tab=jlpt_exam).
 *
 * Priority:
 * 1. If workspace tai_lieu/bai_tap/ has file(s) for lessonId whose newest mtime >= backend lesson_{id}.json:
 *    - If bo_cau_hoi_bai{id}.json is newest, use that single unified file.
 *    - If legacy split files (_full_lesson / _full_global / _full) were newly pasted into tai_lieu/bai_tap/,
 *      return all newer split files so loadUnifiedBank merges them seamlessly on the fly!
 * 2. Otherwise use website/backend/src/data/jlpt_lessons/lesson_{id}.json (Cloud/Render deployment path).
 */
function resolveUnifiedBankPaths(lessonId) {
  const id = parseInt(lessonId, 10);
  if (isNaN(id) || id < 1 || id > 50) return [];

  const canonicalDocPath = path.join(WORKSPACE_DOCS_DIR, `bo_cau_hoi_bai${id}.json`);
  const backendPath = path.join(BACKEND_LESSON_DATA_DIR, `lesson_${id}.json`);

  const legacyDocCandidates = [
    path.join(WORKSPACE_DOCS_DIR, `bo_cau_hoi_bai${id}_full.json`),
    path.join(WORKSPACE_DOCS_DIR, `bo_cau_hoi_bai${id}_full_lesson.json`),
    path.join(WORKSPACE_DOCS_DIR, `bo_cau_hoi_bai${id}_lesson.json`),
    path.join(WORKSPACE_DOCS_DIR, `bo_cau_hoi_bai${id}_full_global.json`),
    path.join(WORKSPACE_DOCS_DIR, `bo_cau_hoi_bai${id}_global.json`)
  ];

  const getMtime = (p) => {
    try {
      return fs.existsSync(p) ? fs.statSync(p).mtimeMs : -1;
    } catch {
      return -1;
    }
  };

  const canonicalDocMtime = getMtime(canonicalDocPath);
  const backendMtime = getMtime(backendPath);

  const existingLegacyDocs = [];
  let newestLegacyMtime = -1;
  for (const p of legacyDocCandidates) {
    const mt = getMtime(p);
    if (mt > 0) {
      existingLegacyDocs.push({ path: p, mtimeMs: mt });
      if (mt > newestLegacyMtime) newestLegacyMtime = mt;
    }
  }

  // If newly dropped split files in tai_lieu/bai_tap are newer than canonical & backend files, auto-merge them
  if (newestLegacyMtime > canonicalDocMtime && newestLegacyMtime > backendMtime) {
    return existingLegacyDocs.map((x) => x.path);
  }

  if (canonicalDocMtime >= backendMtime && canonicalDocMtime > 0) {
    return [canonicalDocPath];
  }

  if (backendMtime > 0) {
    return [backendPath];
  }

  if (existingLegacyDocs.length > 0) {
    return existingLegacyDocs.map((x) => x.path);
  }

  return [];
}

/**
 * Merge 1 or more JSON bank objects of the same lesson into a single unified bank object.
 */
function mergeParsedLessonBanks(lessonId, parsedBanks) {
  if (!parsedBanks || parsedBanks.length === 0) return null;
  if (parsedBanks.length === 1) {
    const single = parsedBanks[0];
    return {
      ...single,
      lesson_id: single.lesson_id || lessonId,
      bank: 'unified'
    };
  }

  const base = parsedBanks[0];
  const mondaiMap = new Map();
  const mergedBlueprint = {};
  const passageMap = new Map();
  const questionMap = new Map();

  for (const data of parsedBanks) {
    for (const m of data.mondai || []) {
      if (!mondaiMap.has(m.key)) mondaiMap.set(m.key, m);
    }
    for (const [k, v] of Object.entries(data.blueprint || {})) {
      if (typeof v === 'number') {
        mergedBlueprint[k] = Math.max(mergedBlueprint[k] || 0, v);
      }
    }
    for (const p of data.passages || []) {
      if (!passageMap.has(p.id)) passageMap.set(p.id, p);
    }
    for (const q of data.questions || []) {
      if (!questionMap.has(q.id)) questionMap.set(q.id, q);
    }
  }

  return {
    lesson_id: lessonId,
    level: base.level || (lessonId <= 25 ? 'N5' : 'N4'),
    bank: 'unified',
    mode: base.mode || 'DAY_DU',
    sections: base.sections || [],
    mondai: Array.from(mondaiMap.values()),
    blueprint: mergedBlueprint,
    passages: Array.from(passageMap.values()),
    questions: Array.from(questionMap.values())
  };
}

/**
 * Load and parse a lesson's UNIFIED JLPT bank JSON (shared single source of truth).
 */
function loadUnifiedBank(lessonId) {
  const id = parseInt(lessonId, 10);
  if (isNaN(id) || id < 1 || id > 50) return null;

  const paths = resolveUnifiedBankPaths(id);
  if (paths.length === 0) return null;

  try {
    const sigParts = [];
    for (const p of paths) {
      const st = fs.statSync(p);
      sigParts.push(`${p}:${st.size}:${Math.floor(st.mtimeMs)}`);
    }
    const signature = sigParts.join('|');
    const cacheKey = `lesson_${id}`;

    const cached = bankCache.get(cacheKey);
    if (cached && cached.signature === signature) {
      // Refresh LRU position
      setBankCacheLRU(cacheKey, signature, cached.data);
      return cached.data;
    }

    const parsedBanks = paths.map((p) => JSON.parse(fs.readFileSync(p, 'utf8')));
    const unified = mergeParsedLessonBanks(id, parsedBanks);
    if (!unified) return null;

    setBankCacheLRU(cacheKey, signature, unified);
    metaSummaryCache.set(id, {
      signature,
      summary: {
        lesson_id: id,
        level: unified.level || (id <= 25 ? 'N5' : 'N4'),
        totalQuestions: Array.isArray(unified.questions) ? unified.questions.length : 0,
        totalPassages: Array.isArray(unified.passages) ? unified.passages.length : 0
      }
    });

    return unified;
  } catch (err) {
    console.error(`[JLPT Service] Failed to read unified JLPT bank for lesson ${id}:`, err.message);
    return null;
  }
}

// Backward-compatible aliases pointing to the exact same unified loader
const loadLessonBank = loadUnifiedBank;
const loadGlobalBank = loadUnifiedBank;

/**
 * Get lightweight summary stat for a single lesson without evicting active LRU banks unnecessarily.
 */
function getLessonBankSummary(lessonId) {
  const id = parseInt(lessonId, 10);
  if (isNaN(id) || id < 1 || id > 50) return null;

  const paths = resolveUnifiedBankPaths(id);
  if (paths.length === 0) return null;

  try {
    const sigParts = [];
    for (const p of paths) {
      const st = fs.statSync(p);
      sigParts.push(`${p}:${st.size}:${Math.floor(st.mtimeMs)}`);
    }
    const signature = sigParts.join('|');

    const cachedSummary = metaSummaryCache.get(id);
    if (cachedSummary && cachedSummary.signature === signature) {
      return cachedSummary.summary;
    }

    const bank = loadUnifiedBank(id);
    if (!bank) return null;
    return metaSummaryCache.get(id)?.summary || {
      lesson_id: id,
      level: bank.level || (id <= 25 ? 'N5' : 'N4'),
      totalQuestions: Array.isArray(bank.questions) ? bank.questions.length : 0,
      totalPassages: Array.isArray(bank.passages) ? bank.passages.length : 0
    };
  } catch {
    return null;
  }
}

/**
 * Scan lessons 1..50 to discover all lessons that currently have a unified JLPT bank JSON.
 */
function getAvailableJlptLessons() {
  const availableLessonIds = [];
  for (let id = 1; id <= 50; id++) {
    if (getLessonBankSummary(id)) {
      availableLessonIds.push(id);
    }
  }
  const maxLessonId = availableLessonIds.length > 0 ? Math.max(...availableLessonIds) : 1;
  return { availableLessonIds, maxLessonId };
}

/**
 * Scan lessons 1..50 for the Global Review Hub (/knowledge?tab=jlpt_exam) from the SAME unified source.
 */
function getAvailableGlobalJlptLessons() {
  const availableLessonIds = [];
  const lessonStats = {};

  for (let id = 1; id <= 50; id++) {
    const summary = getLessonBankSummary(id);
    if (summary) {
      availableLessonIds.push(id);
      lessonStats[id] = summary;
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
 * Compute aggregated structured metadata across MULTIPLE selected lessons from the unified banks.
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
 * Build a shuffled IN-LESSON question set + passages dictionary from the unified bank.
 */
function buildJlptTestSet(lessonId, options = {}) {
  const bankData = loadUnifiedBank(lessonId);
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
 * Build a multi-lesson GLOBAL JLPT question set + passages dictionary from the SAME unified banks
 * across all user-selected lessons (1..50).
 */
function buildGlobalJlptTestSet(rawLessons, options = {}) {
  const requestedLessonIds = parseLessonIdList(rawLessons);
  const requestedIds = Array.isArray(options.ids)
    ? options.ids
    : typeof options.ids === 'string' && options.ids.trim()
      ? options.ids.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

  // If retrying wrong question IDs (e.g. "L12-lesson-KY-003", "L12-global-KY-003", "L12-KY-003"),
  // automatically include their source lessons
  const targetLessonSet = new Set(requestedLessonIds);
  if (options.card === 'custom_ids' || requestedIds.length > 0) {
    for (const qId of requestedIds) {
      const match = /^L(\d+)-/i.exec(qId);
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
    const bankData = loadUnifiedBank(id);
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
  loadUnifiedBank,
  loadLessonBank,
  loadGlobalBank,
  buildBankMetadata,
  buildGlobalBanksMetadata,
  buildJlptTestSet,
  buildGlobalJlptTestSet
};
