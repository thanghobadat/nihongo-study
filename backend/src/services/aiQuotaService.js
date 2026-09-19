const fs = require('fs');
const path = require('path');

// Configuration
const DAILY_USER_LIMIT = null; // Unlimited AI grading requests per user
const DAILY_GLOBAL_TOKEN_LIMIT = 500000; // 500k tokens/day circuit breaker threshold

// Storage file paths
const DB_DIR = path.resolve(__dirname, '../db');
const CACHE_FILE = path.join(DB_DIR, 'ai_grading_cache.json');
const USER_USAGE_FILE = path.join(DB_DIR, 'ai_daily_usage.json');
const TOKEN_USAGE_FILE = path.join(DB_DIR, 'ai_token_usage.json');

// Helper to get current date string in YYYY-MM-DD
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// File I/O helpers
function loadJson(filePath, defaultVal = {}) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn(`[aiQuotaService] Warning: Failed to read ${filePath}:`, err.message);
  }
  return defaultVal;
}

function saveJson(filePath, data) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`[aiQuotaService] Error saving ${filePath}:`, err.message);
  }
}

// In-memory cache copies for instant lookups
let gradingCache = loadJson(CACHE_FILE, {});
let userDailyUsage = loadJson(USER_USAGE_FILE, {});
let tokenDailyUsage = loadJson(TOKEN_USAGE_FILE, {});

/**
 * Generate a deterministic hash/key for question + user answer
 */
function generateCacheKey(direction = '', question = '', userAnswer = '') {
  const normQ = (question || '').toLowerCase().replace(/[\s\u3000.,\/#!$%\^&\*;:{}=\-_\`~()?？!！。、・]/g, '').trim();
  const normA = (userAnswer || '').toLowerCase().replace(/[\s\u3000.,\/#!$%\^&\*;:{}=\-_\`~()?？!！。、・]/g, '').trim();
  return `${direction}_${normQ}_${normA}`;
}

/**
 * Get cached grading result
 */
function getCachedGrading(direction, question, userAnswer) {
  const key = generateCacheKey(direction, question, userAnswer);
  if (gradingCache && gradingCache[key]) {
    return gradingCache[key];
  }
  return null;
}

/**
 * Save grading result to cache
 */
function setCachedGrading(direction, question, userAnswer, result) {
  const key = generateCacheKey(direction, question, userAnswer);
  gradingCache[key] = {
    ...result,
    cachedAt: new Date().toISOString()
  };
  // Async save to avoid blocking
  setImmediate(() => {
    saveJson(CACHE_FILE, gradingCache);
  });
}

/**
 * Check if global token circuit breaker is active today
 */
function isCircuitBreakerActive() {
  const today = getTodayString();
  const todayTokens = tokenDailyUsage[today] || 0;
  return todayTokens >= DAILY_GLOBAL_TOKEN_LIMIT;
}

/**
 * Get current quota status for a user (Unlimited)
 */
function getQuotaStatus(userId = 'demo_user') {
  const today = getTodayString();
  const userTodayData = userDailyUsage[today] || {};
  const used = userTodayData[userId] || 0;
  const circuitBreaker = isCircuitBreakerActive();
  const todayTokens = tokenDailyUsage[today] || 0;

  return {
    today,
    isUnlimited: true,
    limit: null,
    used,
    remaining: 999999,
    circuitBreakerActive: circuitBreaker,
    todayTokensUsed: todayTokens,
    maxDailyTokens: DAILY_GLOBAL_TOKEN_LIMIT
  };
}

/**
 * Check if the user is allowed to make an AI call
 */
function checkCanUseAI(userId = 'demo_user') {
  if (isCircuitBreakerActive()) {
    return {
      canUse: false,
      reason: 'Hệ thống AI tạm thời ngắt an toàn do đã chạm ngưỡng bảo vệ token trong ngày. Vui lòng thử lại vào ngày mai hoặc sử dụng bộ chấm tự động có sẵn.'
    };
  }

  const quota = getQuotaStatus(userId);
  return { canUse: true, quota };
}

/**
 * Record AI usage for a user and record tokens consumed
 */
function recordUsage(userId = 'demo_user', tokenMetadata = {}) {
  const today = getTodayString();

  // 1. Update user daily count
  if (!userDailyUsage[today]) {
    userDailyUsage[today] = {};
  }
  userDailyUsage[today][userId] = (userDailyUsage[today][userId] || 0) + 1;

  // 2. Update global token usage
  const tokensConsumed = tokenMetadata.totalTokenCount || 150; // Fallback estimate ~150 tokens
  tokenDailyUsage[today] = (tokenDailyUsage[today] || 0) + tokensConsumed;

  // 3. Persist to disk
  setImmediate(() => {
    saveJson(USER_USAGE_FILE, userDailyUsage);
    saveJson(TOKEN_USAGE_FILE, tokenDailyUsage);
  });

  return getQuotaStatus(userId);
}

module.exports = {
  DAILY_USER_LIMIT,
  DAILY_GLOBAL_TOKEN_LIMIT,
  getCachedGrading,
  setCachedGrading,
  getQuotaStatus,
  checkCanUseAI,
  recordUsage
};
