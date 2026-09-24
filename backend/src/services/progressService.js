const fs = require('fs');
const path = require('path');
const supabase = require('../db/supabase');
const mockDb = require('../db/mockDb');

const USER_PROGRESS_FILE = path.join(__dirname, '../db/user_progress.json');
const STUDY_PLANS_FILE = path.join(__dirname, '../db/study_plans.json');

/**
 * Load user progress from local JSON file
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
 * Save user progress to local JSON file
 */
function savePersistentProgress(progress) {
  try {
    fs.writeFileSync(USER_PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf8');
  } catch (err) {
    console.error('[ProgressService] Error saving user_progress.json:', err.message);
  }
}

// Initialize mockDb.userProgress on module load
if (!mockDb.userProgress) mockDb.userProgress = {};
try {
  const loaded = loadPersistentProgress();
  mockDb.userProgress = { ...loaded, ...mockDb.userProgress };
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
 * Synchronize user progress from Supabase into memory and disk cache
 */
async function syncUserProgressFromSupabase(userId) {
  if (!userId || !isSupabaseConfigured()) {
    return;
  }
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('item_type, item_id, status')
      .eq('user_id', userId);

    if (error) {
      console.warn('[ProgressService] Supabase sync warning:', error.message);
      return;
    }

    if (data && Array.isArray(data)) {
      if (!mockDb.userProgress) mockDb.userProgress = {};
      for (const row of data) {
        mockDb.userProgress[`${userId}:${row.item_type}:${row.item_id}`] = row.status;
      }
      savePersistentProgress(mockDb.userProgress);
    }
  } catch (err) {
    console.warn('[ProgressService] Error during Supabase sync:', err.message);
  }
}

/**
 * Retrieve sets of mastered/learned item IDs for a user (DB-First with Local Cache Fallback)
 * Considers:
 * 1. Supabase user_progress table (if online) with status 'mastered' or 'learning'
 * 2. Local user_progress.json / mockDb.userProgress with status 'mastered' or 'learning'
 * 3. Completed tasks in study_plans.json (if task.completed is true, task.itemIds are mastered)
 */
async function getMasteredItemIds(userId) {
  const masteredVocabIds = new Set();
  const masteredKanjiIds = new Set();
  const masteredGrammarIds = new Set();

  if (!userId) {
    return { masteredVocabIds, masteredKanjiIds, masteredGrammarIds };
  }

  // 1. If Supabase is configured, fetch directly from Supabase DB
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('item_type, item_id, status')
        .eq('user_id', userId)
        .in('status', ['mastered', 'learning']);

      if (!error && Array.isArray(data)) {
        if (!mockDb.userProgress) mockDb.userProgress = {};
        for (const row of data) {
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
  }

  // 2. Fetch from local cache / file (covers local mock and offline)
  const diskProgress = loadPersistentProgress();
  const userProgress = { ...diskProgress, ...(mockDb.userProgress || {}) };
  mockDb.userProgress = userProgress;

  Object.keys(userProgress).forEach(k => {
    if (k.startsWith(`${userId}:`)) {
      const status = userProgress[k];
      if (status === 'mastered' || status === 'learning') {
        const parts = k.split(':');
        const itemType = parts[1];
        const itemId = parseInt(parts[2], 10);
        if (itemType === 'vocabulary') masteredVocabIds.add(itemId);
        else if (itemType === 'kanji') masteredKanjiIds.add(itemId);
        else if (itemType === 'grammar') masteredGrammarIds.add(itemId);
      }
    }
  });

  // 3. Inspect completed tasks in active study plans
  try {
    let plans = {};
    if (fs.existsSync(STUDY_PLANS_FILE)) {
      plans = JSON.parse(fs.readFileSync(STUDY_PLANS_FILE, 'utf8'));
    }
    const userPlan = plans[userId] || (mockDb.studyPlans && mockDb.studyPlans[userId]);
    if (userPlan && Array.isArray(userPlan.days)) {
      for (const day of userPlan.days) {
        if (Array.isArray(day.tasks)) {
          for (const task of day.tasks) {
            if (task.completed && Array.isArray(task.itemIds) && task.itemIds.length > 0) {
              for (const id of task.itemIds) {
                const numId = Number(id);
                if (task.itemType === 'vocabulary') masteredVocabIds.add(numId);
                else if (task.itemType === 'kanji') masteredKanjiIds.add(numId);
                else if (task.itemType === 'grammar') masteredGrammarIds.add(numId);
              }
            }
          }
        }
      }
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
  if (!mockDb.userProgress) mockDb.userProgress = {};
  const key = `${userId}:${itemType}:${itemId}`;
  mockDb.userProgress[key] = status;
  savePersistentProgress(mockDb.userProgress);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('user_progress').upsert({
        user_id: userId,
        item_type: itemType,
        item_id: Number(itemId),
        status,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,item_type,item_id' });
    } catch (e) {
      console.warn('[ProgressService] Supabase upsert error:', e.message);
    }
  }
}

/**
 * Batch update progress for multiple item IDs
 */
async function setItemProgressBatch(userId, itemType, itemIds, status) {
  if (!Array.isArray(itemIds) || itemIds.length === 0) return;

  if (!mockDb.userProgress) mockDb.userProgress = {};
  for (const id of itemIds) {
    const key = `${userId}:${itemType}:${id}`;
    if (status === 'not_learned') {
      delete mockDb.userProgress[key];
    } else {
      mockDb.userProgress[key] = status;
    }
  }
  savePersistentProgress(mockDb.userProgress);

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
}

/**
 * Synchronous version of getMasteredItemIds using local cache and study plans
 */
function getMasteredItemIdsSync(userId) {
  const masteredVocabIds = new Set();
  const masteredKanjiIds = new Set();
  const masteredGrammarIds = new Set();

  if (!userId) {
    return { masteredVocabIds, masteredKanjiIds, masteredGrammarIds };
  }

  const diskProgress = loadPersistentProgress();
  const userProgress = { ...diskProgress, ...(mockDb.userProgress || {}) };
  mockDb.userProgress = userProgress;

  Object.keys(userProgress).forEach(k => {
    if (k.startsWith(`${userId}:`)) {
      const status = userProgress[k];
      if (status === 'mastered' || status === 'learning') {
        const parts = k.split(':');
        const itemType = parts[1];
        const itemId = parseInt(parts[2], 10);
        if (itemType === 'vocabulary') masteredVocabIds.add(itemId);
        else if (itemType === 'kanji') masteredKanjiIds.add(itemId);
        else if (itemType === 'grammar') masteredGrammarIds.add(itemId);
      }
    }
  });

  try {
    let plans = {};
    if (fs.existsSync(STUDY_PLANS_FILE)) {
      plans = JSON.parse(fs.readFileSync(STUDY_PLANS_FILE, 'utf8'));
    }
    const userPlan = plans[userId] || (mockDb.studyPlans && mockDb.studyPlans[userId]);
    if (userPlan && Array.isArray(userPlan.days)) {
      for (const day of userPlan.days) {
        if (Array.isArray(day.tasks)) {
          for (const task of day.tasks) {
            if (task.completed && Array.isArray(task.itemIds) && task.itemIds.length > 0) {
              for (const id of task.itemIds) {
                const numId = Number(id);
                if (task.itemType === 'vocabulary') masteredVocabIds.add(numId);
                else if (task.itemType === 'kanji') masteredKanjiIds.add(numId);
                else if (task.itemType === 'grammar') masteredGrammarIds.add(numId);
              }
            }
          }
        }
      }
    }
  } catch (e) {}

  return { masteredVocabIds, masteredKanjiIds, masteredGrammarIds };
}

module.exports = {
  loadPersistentProgress,
  savePersistentProgress,
  isSupabaseConfigured,
  syncUserProgressFromSupabase,
  getMasteredItemIds,
  getMasteredItemIdsSync,
  setItemProgress,
  setItemProgressBatch
};
