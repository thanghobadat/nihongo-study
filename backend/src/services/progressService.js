const fs = require('fs');
const path = require('path');
const supabase = require('../db/supabase');
const mockDb = require('../db/mockDb');

const USER_PROGRESS_FILE = path.join(__dirname, '../db/user_progress.json');
const USER_REVIEW_SESSIONS_FILE = path.join(__dirname, '../db/user_review_sessions.json');
const STUDY_PLANS_FILE = path.join(__dirname, '../db/study_plans.json');

const PROGRESS_SYNC_TTL_MS = 5000;
const REVIEW_SESSIONS_SYNC_TTL_MS = 30000;
const progressSyncInFlight = new Map();
const masteredSyncInFlight = new Map();
const progressLastSyncAt = new Map();
const masteredLastSyncAt = new Map();
const reviewSessionsLastSyncAt = new Map();
const progressHydratedUsers = new Set();
let saveProgressTimer = null;
let saveReviewSessionsTimer = null;

/**
 * Load user progress from local JSON file (once at startup or fallback)
 */
function loadPersistentProgress() {
  try {
    if (fs.existsSync(USER_PROGRESS_FILE)) {
      const content = fs.readFileSync(USER_PROGRESS_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('[ProgressService] Error loading user_progress.json:', err.message);
  }
  return {};
}

/**
 * Save user progress to local JSON file asynchronously (debounced, non-blocking)
 */
function savePersistentProgress(progress) {
  if (process.env.VERCEL) return;
  if (saveProgressTimer) clearTimeout(saveProgressTimer);
  saveProgressTimer = setTimeout(() => {
    saveProgressTimer = null;
    fs.promises.writeFile(USER_PROGRESS_FILE, JSON.stringify(progress || mockDb.userProgress || {}), 'utf8')
      .catch(err => console.error('[ProgressService] Error saving user_progress.json:', err.message));
  }, 500);
  if (saveProgressTimer.unref) saveProgressTimer.unref();
}

/**
 * Load user review sessions from local JSON file
 */
function loadPersistentReviewSessions() {
  try {
    if (fs.existsSync(USER_REVIEW_SESSIONS_FILE)) {
      const content = fs.readFileSync(USER_REVIEW_SESSIONS_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('[ProgressService] Error loading user_review_sessions.json:', err.message);
  }
  return {};
}

/**
 * Save user review sessions to local JSON file asynchronously (debounced, non-blocking)
 */
function savePersistentReviewSessions(sessions) {
  if (process.env.VERCEL) return;
  if (saveReviewSessionsTimer) clearTimeout(saveReviewSessionsTimer);
  saveReviewSessionsTimer = setTimeout(() => {
    saveReviewSessionsTimer = null;
    fs.promises.writeFile(USER_REVIEW_SESSIONS_FILE, JSON.stringify(sessions || mockDb.userReviewSessions || {}), 'utf8')
      .catch(err => console.error('[ProgressService] Error saving user_review_sessions.json:', err.message));
  }, 500);
  if (saveReviewSessionsTimer.unref) saveReviewSessionsTimer.unref();
}

// Initialize mockDb.userProgress and mockDb.userReviewSessions on module load
if (!mockDb.userProgress) mockDb.userProgress = {};
try {
  const loaded = loadPersistentProgress();
  mockDb.userProgress = { ...mockDb.userProgress, ...loaded };
} catch (e) {}

if (!mockDb.userReviewSessions) mockDb.userReviewSessions = {};
try {
  const loadedSessions = loadPersistentReviewSessions();
  mockDb.userReviewSessions = { ...mockDb.userReviewSessions, ...loadedSessions };
} catch (e) {}

/**
 * Check if running with real Supabase database or mock mode
 */
function isSupabaseConfigured() {
  return (
    process.env.SUPABASE_URL &&
    !process.env.SUPABASE_URL.includes('placeholder') &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
  );
}

/**
 * Immediately invalidate coalescing sync cache for a user after full reset / external bust
 */
function invalidateUserSyncCache(userId) {
  if (!userId) {
    progressLastSyncAt.clear();
    masteredLastSyncAt.clear();
    reviewSessionsLastSyncAt.clear();
    progressHydratedUsers.clear();
    return;
  }
  const uid = String(userId);
  progressLastSyncAt.delete(uid);
  masteredLastSyncAt.delete(uid);
  reviewSessionsLastSyncAt.delete(uid);
  progressHydratedUsers.delete(uid);
  try {
    const studyTimeService = require('./studyTimeService');
    if (typeof studyTimeService.invalidateStudyTimeCache === 'function') {
      studyTimeService.invalidateStudyTimeCache(uid);
    }
  } catch (_) {}
}

/**
 * Invalidate only review-sessions cache (without wiping vocabulary/kanji/grammar progress cache)
 */
function invalidateReviewSessionsCache(userId) {
  if (!userId) {
    reviewSessionsLastSyncAt.clear();
    return;
  }
  reviewSessionsLastSyncAt.delete(String(userId));
}

/**
 * Return known local item status if user's progress cache is hydrated in memory, or undefined if unknown (cold start)
 */
function getKnownLocalItemStatus(userId, itemType, itemId) {
  if (!userId) return undefined;
  const uid = String(userId);
  if (isSupabaseConfigured() && !progressHydratedUsers.has(uid)) {
    return undefined;
  }
  const val = mockDb.userProgress && mockDb.userProgress[`${uid}:${itemType}:${itemId}`];
  return val || 'not_learned';
}

/**
 * Record an already-validated progress mutation in RAM without wiping warm sync caches
 */
function recordLocalProgressMutation(userId, itemType, itemIds, status) {
  if (!userId || !itemType) return;
  const uid = String(userId);
  const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
  if (!mockDb.userProgress) mockDb.userProgress = {};

  for (const id of ids) {
    const key = `${uid}:${itemType}:${id}`;
    if (status === 'not_learned') {
      delete mockDb.userProgress[key];
    } else {
      mockDb.userProgress[key] = status;
    }
  }

  // If cache was already warm within TTL, keep it warm since RAM now reflects the latest write
  const now = Date.now();
  const lastFull = progressLastSyncAt.get(uid) || 0;
  if (lastFull > 0 && now - lastFull < PROGRESS_SYNC_TTL_MS) {
    progressLastSyncAt.set(uid, now);
  }
  const lastMastered = masteredLastSyncAt.get(uid) || 0;
  if (lastMastered > 0 && now - lastMastered < PROGRESS_SYNC_TTL_MS) {
    masteredLastSyncAt.set(uid, now);
  }

  savePersistentProgress(mockDb.userProgress);
}

/**
 * Synchronize user review sessions from Supabase into memory and disk cache
 */
async function syncUserReviewSessionsFromSupabase(userId, options = {}) {
  if (!userId || !isSupabaseConfigured()) {
    return;
  }
  const uid = String(userId);
  const now = Date.now();
  if (!options.force) {
    const lastSync = reviewSessionsLastSyncAt.get(uid) || 0;
    if (now - lastSync < REVIEW_SESSIONS_SYNC_TTL_MS) {
      return;
    }
  }
  try {
    const { data, error } = await supabase
      .from('user_review_sessions')
      .select('storage_key, session_data')
      .eq('user_id', userId);

    if (error) {
      console.warn('[ProgressService] Supabase review session sync warning:', error.message);
      return;
    }

    if (data && Array.isArray(data)) {
      if (!mockDb.userReviewSessions) mockDb.userReviewSessions = {};
      for (const row of data) {
        mockDb.userReviewSessions[`${userId}:${row.storage_key}`] = row.session_data;
      }
      savePersistentReviewSessions(mockDb.userReviewSessions);
    }
    reviewSessionsLastSyncAt.set(uid, Date.now());
  } catch (err) {
    console.warn('[ProgressService] Error during Supabase review session sync:', err.message);
  }
}

/**
 * Lightweight sync exclusively for Study Plan auto-tracking:
 * Only fetches 'mastered' rows from user_progress (skips heavy JLPT review_sessions JSONB and study_time).
 */
async function syncMasteredProgressForTracking(userId, options = {}) {
  if (!userId || !isSupabaseConfigured()) {
    return;
  }
  const uid = String(userId);
  const now = Date.now();
  if (!options.force) {
    const lastMastered = masteredLastSyncAt.get(uid) || 0;
    const lastFull = progressLastSyncAt.get(uid) || 0;
    if (now - Math.max(lastMastered, lastFull) < PROGRESS_SYNC_TTL_MS) {
      return;
    }
  }

  // If a full sync is already in flight, piggyback on it
  const existingFull = progressSyncInFlight.get(uid);
  if (existingFull) {
    return existingFull;
  }

  let inFlight = masteredSyncInFlight.get(uid);
  if (inFlight) {
    return inFlight;
  }

  inFlight = (async () => {
    try {
      const allMasteredRows = [];
      let from = 0;
      const pageSize = 1000;
      let fetchErr = null;

      while (true) {
        const { data, error } = await supabase
          .from('user_progress')
          .select('item_type, item_id')
          .eq('user_id', userId)
          .eq('status', 'mastered')
          .range(from, from + pageSize - 1);

        if (error) {
          fetchErr = error;
          break;
        }
        if (!data || data.length === 0) break;
        allMasteredRows.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }

      if (fetchErr) {
        console.warn('[ProgressService] Supabase mastered sync warning:', fetchErr.message);
        return;
      }

      if (!mockDb.userProgress) mockDb.userProgress = {};
      const prefix = `${uid}:`;
      const remoteMasteredKeys = new Set(
        allMasteredRows.map(row => `${uid}:${row.item_type}:${row.item_id}`)
      );

      // Clear any stale 'mastered' flags unmarked on another device while preserving 'learning'/'wrong' in RAM
      for (const k of Object.keys(mockDb.userProgress)) {
        if (k.startsWith(prefix) && mockDb.userProgress[k] === 'mastered' && !remoteMasteredKeys.has(k)) {
          delete mockDb.userProgress[k];
        }
      }
      for (const k of remoteMasteredKeys) {
        mockDb.userProgress[k] = 'mastered';
      }

      progressHydratedUsers.add(uid);
      masteredLastSyncAt.set(uid, Date.now());
      savePersistentProgress(mockDb.userProgress);
    } catch (err) {
      console.warn('[ProgressService] Error during mastered progress sync:', err.message);
    } finally {
      masteredSyncInFlight.delete(uid);
    }
  })();

  masteredSyncInFlight.set(uid, inFlight);
  return inFlight;
}

/**
 * Synchronize user progress, review sessions, and study time from Supabase in parallel,
 * coalescing concurrent requests for the same userId.
 */
async function syncUserProgressFromSupabase(userId, options = {}) {
  if (!userId || !isSupabaseConfigured()) {
    return;
  }
  const uid = String(userId);
  const now = Date.now();
  if (!options.force) {
    const lastSync = progressLastSyncAt.get(uid) || 0;
    if (now - lastSync < PROGRESS_SYNC_TTL_MS) {
      return;
    }
  }

  let inFlight = progressSyncInFlight.get(uid);
  if (inFlight) {
    return inFlight;
  }

  inFlight = (async () => {
    const syncProgressTask = (async () => {
      try {
        const allRows = [];
        let from = 0;
        const pageSize = 1000;
        let fetchErr = null;

        while (true) {
          const { data, error } = await supabase
            .from('user_progress')
            .select('item_type, item_id, status')
            .eq('user_id', userId)
            .range(from, from + pageSize - 1);

          if (error) {
            fetchErr = error;
            break;
          }
          if (!data || data.length === 0) break;
          allRows.push(...data);
          if (data.length < pageSize) break;
          from += pageSize;
        }

        if (fetchErr) {
          console.warn('[ProgressService] Supabase sync warning:', fetchErr.message);
        } else {
          if (!mockDb.userProgress) mockDb.userProgress = {};
          const prefix = `${userId}:`;
          for (const k of Object.keys(mockDb.userProgress)) {
            if (k.startsWith(prefix)) {
              delete mockDb.userProgress[k];
            }
          }
          for (const row of allRows) {
            mockDb.userProgress[`${userId}:${row.item_type}:${row.item_id}`] = row.status;
          }
          progressHydratedUsers.add(uid);
          savePersistentProgress(mockDb.userProgress);
        }
      } catch (err) {
        console.warn('[ProgressService] Error during Supabase sync:', err.message);
      }
    })();

    const syncStudyTimeTask = options.skipStudyTime
      ? Promise.resolve()
      : (async () => {
          try {
            const studyTimeService = require('./studyTimeService');
            await studyTimeService.syncFromSupabase(userId);
          } catch (_) {}
        })();

    const syncReviewTask = options.skipReviewSessions
      ? Promise.resolve()
      : syncUserReviewSessionsFromSupabase(userId, { force: !!options.force });

    await Promise.all([
      syncProgressTask,
      syncReviewTask,
      syncStudyTimeTask
    ]);

    const completedAt = Date.now();
    progressLastSyncAt.set(uid, completedAt);
    masteredLastSyncAt.set(uid, completedAt);
  })().finally(() => {
    progressSyncInFlight.delete(uid);
  });

  progressSyncInFlight.set(uid, inFlight);
  return inFlight;
}

/**
 * Helper to extract mastered item IDs from completed tasks in a study plan
 */
function extractMasteredItemsFromPlan(plan, masteredVocabIds, masteredKanjiIds, masteredGrammarIds, userProgressMap = null, userId = null) {
  if (!plan) return;
  const allDays = [
    ...(Array.isArray(plan.days) ? plan.days : []),
    ...(Array.isArray(plan.archivedPastDays) ? plan.archivedPastDays : [])
  ];
  for (const day of allDays) {
    if (Array.isArray(day.tasks)) {
      for (const task of day.tasks) {
        if (task.completed && !task.rescheduled && Array.isArray(task.itemIds) && task.itemIds.length > 0) {
          for (const id of task.itemIds) {
            const numId = Number(id);
            if (userProgressMap && userId) {
              const status = userProgressMap[`${userId}:${task.itemType}:${numId}`];
              if (status !== 'mastered') {
                continue;
              }
            }
            if (task.itemType === 'vocabulary') masteredVocabIds.add(numId);
            else if (task.itemType === 'kanji') masteredKanjiIds.add(numId);
            else if (task.itemType === 'grammar') masteredGrammarIds.add(numId);
          }
        }
      }
    }
  }
}

/**
 * Retrieve sets of mastered/learned item IDs for a user (DB-First with Local Cache Fallback)
 */
async function getMasteredItemIds(userId, currentPlan = null) {
  const masteredVocabIds = new Set();
  const masteredKanjiIds = new Set();
  const masteredGrammarIds = new Set();

  if (!userId) {
    if (currentPlan) {
      extractMasteredItemsFromPlan(currentPlan, masteredVocabIds, masteredKanjiIds, masteredGrammarIds);
    }
    return { masteredVocabIds, masteredKanjiIds, masteredGrammarIds };
  }

  // 1. If Supabase is configured, fetch from Supabase in parallel
  if (isSupabaseConfigured()) {
    await Promise.all([
      (async () => {
        try {
          const allMasteredRows = [];
          let from = 0;
          const pageSize = 1000;
          let fetchErr = null;

          while (true) {
            const { data, error } = await supabase
              .from('user_progress')
              .select('item_type, item_id, status')
              .eq('user_id', userId)
              .eq('status', 'mastered')
              .range(from, from + pageSize - 1);

            if (error) {
              fetchErr = error;
              break;
            }
            if (!data || data.length === 0) break;
            allMasteredRows.push(...data);
            if (data.length < pageSize) break;
            from += pageSize;
          }

          if (!fetchErr && Array.isArray(allMasteredRows)) {
            if (!mockDb.userProgress) mockDb.userProgress = {};
            for (const row of allMasteredRows) {
              const itemId = Number(row.item_id);
              if (row.item_type === 'vocabulary') masteredVocabIds.add(itemId);
              else if (row.item_type === 'kanji') masteredKanjiIds.add(itemId);
              else if (row.item_type === 'grammar') masteredGrammarIds.add(itemId);

              mockDb.userProgress[`${userId}:${row.item_type}:${row.item_id}`] = row.status;
            }
            savePersistentProgress(mockDb.userProgress);
          }
        } catch (dbErr) {
          console.warn('[ProgressService] Supabase fetch warning, falling back to local cache:', dbErr.message);
        }
      })(),
      (async () => {
        try {
          const { data: sp, error: spErr } = await supabase
            .from('user_study_plans')
            .select('plan_data')
            .eq('user_id', String(userId))
            .maybeSingle();

          if (!spErr && sp && sp.plan_data) {
            extractMasteredItemsFromPlan(sp.plan_data, masteredVocabIds, masteredKanjiIds, masteredGrammarIds, mockDb.userProgress, userId);
          }
        } catch (spErr) {
          console.warn('[ProgressService] Supabase user_study_plans fetch warning:', spErr.message);
        }
      })()
    ]);
  }

  // 2. Merge from in-memory userProgress (hydrated from disk at startup)
  const userProgress = mockDb.userProgress || {};
  const prefix = `${userId}:`;
  for (const k of Object.keys(userProgress)) {
    if (k.startsWith(prefix) && userProgress[k] === 'mastered') {
      const parts = k.split(':');
      const itemType = parts[1];
      const itemId = parseInt(parts[2], 10);
      if (itemType === 'vocabulary') masteredVocabIds.add(itemId);
      else if (itemType === 'kanji') masteredKanjiIds.add(itemId);
      else if (itemType === 'grammar') masteredGrammarIds.add(itemId);
    }
  }

  // 3. Extract from explicit currentPlan if provided by caller
  if (currentPlan) {
    extractMasteredItemsFromPlan(currentPlan, masteredVocabIds, masteredKanjiIds, masteredGrammarIds, userProgress, userId);
  }

  // 4. Inspect active study plan in memory (fallback to disk only if memory empty)
  try {
    let userPlan = mockDb.studyPlans && mockDb.studyPlans[userId];
    if (!userPlan && fs.existsSync(STUDY_PLANS_FILE)) {
      const plans = JSON.parse(fs.readFileSync(STUDY_PLANS_FILE, 'utf8'));
      userPlan = plans[userId];
    }
    if (userPlan) {
      extractMasteredItemsFromPlan(userPlan, masteredVocabIds, masteredKanjiIds, masteredGrammarIds, userProgress, userId);
    }
  } catch (planErr) {
    console.warn('[ProgressService] Error reading completed tasks from study_plans:', planErr.message);
  }

  return { masteredVocabIds, masteredKanjiIds, masteredGrammarIds };
}

/**
 * Update single item progress in DB and local cache
 */
async function setItemProgress(userId, itemType, itemId, status) {
  if (isSupabaseConfigured()) {
    try {
      if (status === 'not_learned') {
        await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', userId)
          .eq('item_type', itemType)
          .eq('item_id', Number(itemId));
      } else {
        await supabase.from('user_progress').upsert({
          user_id: userId,
          item_type: itemType,
          item_id: Number(itemId),
          status,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,item_type,item_id' });
      }
    } catch (e) {
      console.warn('[ProgressService] Supabase upsert error:', e.message);
    }
  }
  recordLocalProgressMutation(userId, itemType, [itemId], status);
}

/**
 * Batch update progress for multiple item IDs
 */
async function setItemProgressBatch(userId, itemType, itemIds, status) {
  if (!Array.isArray(itemIds) || itemIds.length === 0) return;

  if (isSupabaseConfigured()) {
    try {
      if (status === 'not_learned') {
        await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', userId)
          .eq('item_type', itemType)
          .in('item_id', itemIds.map(Number));
      } else {
        const rows = itemIds.map(id => ({
          user_id: userId,
          item_type: itemType,
          item_id: Number(id),
          status,
          updated_at: new Date().toISOString()
        }));
        await supabase.from('user_progress').upsert(rows, { onConflict: 'user_id,item_type,item_id' });
      }
    } catch (e) {
      console.warn('[ProgressService] Supabase batch upsert error:', e.message);
    }
  }

  recordLocalProgressMutation(userId, itemType, itemIds, status);
}

/**
 * Synchronous version of getMasteredItemIds using in-memory cache and study plans
 */
function getMasteredItemIdsSync(userId, currentPlan = null) {
  const masteredVocabIds = new Set();
  const masteredKanjiIds = new Set();
  const masteredGrammarIds = new Set();

  const userProgress = mockDb.userProgress || {};
  if (userId) {
    const prefix = `${userId}:`;
    for (const k of Object.keys(userProgress)) {
      if (k.startsWith(prefix) && userProgress[k] === 'mastered') {
        const parts = k.split(':');
        const itemType = parts[1];
        const itemId = parseInt(parts[2], 10);
        if (itemType === 'vocabulary') masteredVocabIds.add(itemId);
        else if (itemType === 'kanji') masteredKanjiIds.add(itemId);
        else if (itemType === 'grammar') masteredGrammarIds.add(itemId);
      }
    }
  }

  if (currentPlan) {
    extractMasteredItemsFromPlan(currentPlan, masteredVocabIds, masteredKanjiIds, masteredGrammarIds, userProgress, userId);
  }

  const userPlan = mockDb.studyPlans && mockDb.studyPlans[userId];
  if (userPlan) {
    extractMasteredItemsFromPlan(userPlan, masteredVocabIds, masteredKanjiIds, masteredGrammarIds, userProgress, userId);
  }

  return { masteredVocabIds, masteredKanjiIds, masteredGrammarIds };
}

module.exports = {
  loadPersistentProgress,
  savePersistentProgress,
  loadPersistentReviewSessions,
  savePersistentReviewSessions,
  isSupabaseConfigured,
  invalidateUserSyncCache,
  invalidateReviewSessionsCache,
  getKnownLocalItemStatus,
  recordLocalProgressMutation,
  syncMasteredProgressForTracking,
  syncUserProgressFromSupabase,
  syncUserReviewSessionsFromSupabase,
  getMasteredItemIds,
  getMasteredItemIdsSync,
  setItemProgress,
  setItemProgressBatch
};
