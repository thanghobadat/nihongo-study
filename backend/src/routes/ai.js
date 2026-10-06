const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const aiQuotaService = require('../services/aiQuotaService');
const aiGradingService = require('../services/aiGradingService');
const progressService = require('../services/progressService');

/**
 * Helper to get a stable user identifier synchronously
 * Supports req.user.id, mock token, Supabase JWT payload decoding, and IP fallback
 */
function getUserId(req) {
  if (req.user && req.user.id) {
    return req.user.id;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token.startsWith('mock-token-')) {
      return token.replace('mock-token-', '').replace('-admin', '');
    }
    // Attempt decoding Supabase JWT payload directly
    if (token.includes('.')) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
          const payload = JSON.parse(payloadJson);
          if (payload && payload.sub) {
            return payload.sub;
          }
        }
      } catch (err) {
        // Fallback to IP below
      }
    }
  }
  // Fallback to client IP or demo_user
  const ip = req.ip || req.headers['x-forwarded-for'] || 'demo_user';
  return String(ip).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 32) || 'demo_user';
}

/**
 * Asynchronous helper to get authenticated user identifier
 * Verifies Supabase JWT token via Supabase Auth when available, with fast payload fallback
 */
async function getUserIdAsync(req) {
  if (req.user && req.user.id) {
    return req.user.id;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token.startsWith('mock-token-')) {
      return token.replace('mock-token-', '').replace('-admin', '');
    }

    // Supabase JWT verification
    if (token.includes('.')) {
      try {
        if (supabase && supabase.auth && typeof supabase.auth.getUser === 'function') {
          const { data, error } = await supabase.auth.getUser(token);
          if (!error && data?.user?.id) {
            return data.user.id;
          }
        }
      } catch (err) {
        // Non-blocking, fallback to decoding JWT payload sub
      }

      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
          const payload = JSON.parse(payloadJson);
          if (payload && payload.sub) {
            return payload.sub;
          }
        }
      } catch (err) {
        console.warn('[AI Route] Error decoding JWT token payload:', err.message);
      }
    }
  }

  return getUserId(req);
}

/**
 * GET /api/ai/quota
 * Retrieve the current AI quota and usage for the requesting user
 */
router.get('/quota', (req, res) => {
  try {
    const userId = getUserId(req);
    const quota = aiQuotaService.getQuotaStatus(userId);
    return res.json({
      success: true,
      quota
    });
  } catch (err) {
    console.error('[AI Route] Error getting quota:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/grade
 * Grade a student's answer using Gemini AI with 4-layer token protection
 */
router.post('/grade', async (req, res) => {
  try {
    const {
      direction = 'vi-to-ja',
      question,
      userAnswer,
      correctAnswer = '',
      lessonTitle = '',
      context = ''
    } = req.body;

    // 1. Basic validation
    if (!question || !userAnswer) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp đầy đủ đề bài (question) và câu trả lời của học viên (userAnswer).'
      });
    }

    const userId = getUserId(req);

    // 2. LAYER 1: Check in-memory/disk Cache (0 Token consumed!)
    const cachedResult = aiQuotaService.getCachedGrading(direction, question, userAnswer);
    if (cachedResult) {
      return res.json({
        success: true,
        cached: true,
        data: cachedResult,
        quota: aiQuotaService.getQuotaStatus(userId)
      });
    }

    // 3. LAYER 2 & 3: Check Daily Quota & Global Circuit Breaker
    const check = aiQuotaService.checkCanUseAI(userId);
    if (!check.canUse) {
      return res.json({
        success: false,
        fallbackToLocal: true,
        error: check.reason,
        quota: aiQuotaService.getQuotaStatus(userId)
      });
    }

    // 4. LAYER 4: Call Gemini API with optimized prompt & maxOutputTokens
    const { result, usageMetadata } = await aiGradingService.gradeJapaneseAnswer({
      direction,
      question,
      userAnswer,
      correctAnswer,
      lessonTitle,
      context
    });

    // 5. Update quota & save to cache
    const updatedQuota = aiQuotaService.recordUsage(userId, usageMetadata);
    aiQuotaService.setCachedGrading(direction, question, userAnswer, result);

    return res.json({
      success: true,
      cached: false,
      data: result,
      quota: updatedQuota,
      tokensConsumed: usageMetadata.totalTokenCount || 0
    });
  } catch (err) {
    console.error('[AI Route] Error grading answer:', err);
    return res.json({
      success: false,
      fallbackToLocal: true,
      error: 'Dịch vụ AI đang bận hoặc gián đoạn. Đã chuyển sang bộ chấm điểm cục bộ.',
      details: err.message
    });
  }
});

/**
 * POST /api/ai/grade-radical
 * Grade handwriting of a radical drawing using Gemini Multimodal Vision AI
 */
router.post('/grade-radical', async (req, res) => {
  try {
    const {
      targetRadical,
      sinoVietnamese = '',
      meaning = '',
      imageBase64
    } = req.body;

    if (!targetRadical || !imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp đầy đủ bộ thủ mục tiêu (targetRadical) và hình ảnh nét vẽ (imageBase64).'
      });
    }

    const userId = getUserId(req);

    // Check Daily Quota & Circuit Breaker
    const check = aiQuotaService.checkCanUseAI(userId);
    if (!check.canUse) {
      return res.json({
        success: false,
        fallbackToLocal: true,
        error: check.reason,
        quota: aiQuotaService.getQuotaStatus(userId)
      });
    }

    // Call Gemini Multimodal Vision via aiGradingService
    const { result, usageMetadata } = await aiGradingService.gradeRadicalHandwriting({
      targetRadical,
      sinoVietnamese,
      meaning,
      imageBase64
    });

    const updatedQuota = aiQuotaService.recordUsage(userId, usageMetadata);

    return res.json({
      success: true,
      data: result,
      quota: updatedQuota,
      tokensConsumed: usageMetadata.totalTokenCount || 0
    });
  } catch (err) {
    console.error('[AI Route] Error grading radical handwriting:', err);
    return res.json({
      success: false,
      fallbackToLocal: true,
      error: 'Dịch vụ AI đang bận hoặc gián đoạn. Đã chuyển sang bộ chấm điểm cục bộ.',
      details: err.message
    });
  }
});

/**
 * POST /api/ai/grade-radical-full
 * Grade full radical review (Sino-Vietnamese name + Vietnamese Meaning with partial recall support)
 */
router.post('/grade-radical-full', async (req, res) => {
  try {
    const {
      character,
      sinoVietnamese = '',
      meaning = '',
      description = '',
      userSino = '',
      userMeaning = ''
    } = req.body;

    if (!character) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp bộ thủ cần chấm (character).'
      });
    }

    const userId = getUserId(req);

    // 1. LAYER 1: Check in-memory/disk Cache (0 Token consumed!)
    const cacheQuestionKey = character;
    const cacheAnswerKey = `${(userSino || '').trim()}___${(userMeaning || '').trim()}`;
    const cachedResult = aiQuotaService.getCachedGrading('radical_full', cacheQuestionKey, cacheAnswerKey);
    if (cachedResult) {
      return res.json({
        success: true,
        cached: true,
        data: cachedResult,
        quota: aiQuotaService.getQuotaStatus(userId)
      });
    }

    // 2. LAYER 2 & 3: Check Daily Quota & Circuit Breaker
    const check = aiQuotaService.checkCanUseAI(userId);
    if (!check.canUse) {
      return res.json({
        success: false,
        fallbackToLocal: true,
        error: check.reason,
        quota: aiQuotaService.getQuotaStatus(userId)
      });
    }

    // 3. LAYER 4: Call Gemini via aiGradingService
    const { result, usageMetadata } = await aiGradingService.gradeRadicalFull({
      character,
      sinoVietnamese,
      meaning,
      description,
      userSino,
      userMeaning
    });

    // 4. Update quota & save to cache
    const updatedQuota = aiQuotaService.recordUsage(userId, usageMetadata);
    aiQuotaService.setCachedGrading('radical_full', cacheQuestionKey, cacheAnswerKey, result);

    return res.json({
      success: true,
      cached: false,
      data: result,
      quota: updatedQuota,
      tokensConsumed: usageMetadata.totalTokenCount || 0
    });
  } catch (err) {
    console.error('[AI Route] Error grading radical full:', err);
    return res.json({
      success: false,
      fallbackToLocal: true,
      error: 'Dịch vụ AI đang bận hoặc gián đoạn. Vui lòng thử lại sau.',
      details: err.message
    });
  }
});

/**
 * POST /api/ai/radical-explain
 * Explain in-depth meaning, cultural origin, and Kanji roles for a radical
 */
router.post('/radical-explain', async (req, res) => {
  try {
    const {
      character,
      sinoVietnamese = '',
      meaning = '',
      description = ''
    } = req.body;

    if (!character) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp ký tự bộ thủ (character).'
      });
    }

    const userId = getUserId(req);

    // 1. LAYER 1: Check Cache (0 tokens consumed!)
    const cacheKey = character.trim();
    const cachedResult = aiQuotaService.getCachedGrading('radical_explain', cacheKey, 'details');
    if (cachedResult) {
      return res.json({
        success: true,
        cached: true,
        data: cachedResult,
        quota: aiQuotaService.getQuotaStatus(userId)
      });
    }

    // 2. LAYER 2 & 3: Check Quota & Circuit Breaker
    const check = aiQuotaService.checkCanUseAI(userId);
    if (!check.canUse) {
      return res.json({
        success: false,
        fallbackToLocal: true,
        error: check.reason,
        quota: aiQuotaService.getQuotaStatus(userId)
      });
    }

    // 3. LAYER 4: Call Gemini via aiGradingService
    const { result, usageMetadata } = await aiGradingService.explainRadicalMeaning({
      character,
      sinoVietnamese,
      meaning,
      description
    });

    // 4. Update quota & save to cache
    const updatedQuota = aiQuotaService.recordUsage(userId, usageMetadata);
    aiQuotaService.setCachedGrading('radical_explain', cacheKey, 'details', result);

    return res.json({
      success: true,
      cached: false,
      data: result,
      quota: updatedQuota,
      tokensConsumed: usageMetadata.totalTokenCount || 0
    });
  } catch (err) {
    console.error('[AI Route] Error explaining radical meaning:', err);
    return res.json({
      success: false,
      fallbackToLocal: true,
      error: 'Dịch vụ AI đang bận hoặc gián đoạn. Vui lòng thử lại sau.',
      details: err.message
    });
  }
});

/**
 * POST /api/ai/kanji-explain
 * Explain in-depth Kanji character etymology, component radicals, and synthesis logic
 */
router.post('/kanji-explain', async (req, res) => {
  try {
    const {
      character,
      sinoVietnamese = '',
      meaning = '',
      strokeCount = '',
      radicals = []
    } = req.body;

    if (!character) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp ký tự chữ Hán (character).'
      });
    }

    const userId = getUserId(req);

    // 1. LAYER 1: Check Cache (0 tokens consumed!)
    const cacheKey = character.trim();
    const cachedResult = aiQuotaService.getCachedGrading('kanji_explain', cacheKey, 'details');
    if (cachedResult) {
      return res.json({
        success: true,
        cached: true,
        data: cachedResult,
        quota: aiQuotaService.getQuotaStatus(userId)
      });
    }

    // 2. LAYER 2 & 3: Check Quota & Circuit Breaker
    const check = aiQuotaService.checkCanUseAI(userId);
    if (!check.canUse) {
      return res.json({
        success: false,
        fallbackToLocal: true,
        error: check.reason,
        quota: aiQuotaService.getQuotaStatus(userId)
      });
    }

    // 3. LAYER 4: Call Gemini via aiGradingService
    const { result, usageMetadata } = await aiGradingService.explainKanjiStructure({
      character,
      sinoVietnamese,
      meaning,
      strokeCount,
      radicals
    });

    // 4. Update quota & save to cache
    const updatedQuota = aiQuotaService.recordUsage(userId, usageMetadata);
    aiQuotaService.setCachedGrading('kanji_explain', cacheKey, 'details', result);

    return res.json({
      success: true,
      cached: false,
      data: result,
      quota: updatedQuota,
      tokensConsumed: usageMetadata.totalTokenCount || 0
    });
  } catch (err) {
    console.error('[AI Route] Error explaining kanji structure:', err);
    return res.json({
      success: false,
      fallbackToLocal: true,
      error: 'Dịch vụ AI đang bận hoặc gián đoạn. Vui lòng thử lại sau.',
      details: err.message
    });
  }
});

/**
 * Helper to get or create disk cache for Kanji Writing Riddles
 */
const RIDDLES_CACHE_FILE = path.resolve(__dirname, '../../data/kanji_riddles_cache.json');
function getRiddlesDiskCache() {
  try {
    if (fs.existsSync(RIDDLES_CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(RIDDLES_CACHE_FILE, 'utf8'));
    }
  } catch (e) {
    console.warn('[AI Route] Error reading riddles cache file:', e.message);
  }
  return {};
}

function saveRiddlesDiskCache(cache) {
  try {
    const dir = path.dirname(RIDDLES_CACHE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(RIDDLES_CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  } catch (e) {
    console.warn('[AI Route] Error saving riddles cache file:', e.message);
  }
}

/**
 * Helper to get or create disk cache for Kanji Recognition Quiz
 */
const QUIZ_CACHE_FILE = path.resolve(__dirname, '../../data/kanji_recognition_quiz_cache.json');
function getRecognitionQuizDiskCache() {
  try {
    if (fs.existsSync(QUIZ_CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(QUIZ_CACHE_FILE, 'utf8'));
    }
  } catch (e) {
    console.warn('[AI Route] Error reading quiz cache file:', e.message);
  }
  return {};
}

function saveRecognitionQuizDiskCache(cache) {
  try {
    const dir = path.dirname(QUIZ_CACHE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(QUIZ_CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  } catch (e) {
    console.warn('[AI Route] Error saving quiz cache file:', e.message);
  }
}

/**
 * POST /api/ai/grade-kanji-writing
 * Grade Kanji handwriting on Canvas using Gemini Multimodal Vision AI
 * Returns score, precision feedback, and actionable improvement tip
 */
router.post('/grade-kanji-writing', async (req, res) => {
  try {
    const {
      imageBase64,
      targetKanji,
      strokeCount,
      sinoVietnamese = '',
      meaning = '',
      radicals = []
    } = req.body;

    if (!imageBase64 || !targetKanji) {
      return res.status(400).json({
        success: false,
        error: 'imageBase64 and targetKanji are required'
      });
    }

    const userId = await getUserIdAsync(req);

    // Check quota
    const check = aiQuotaService.checkCanUseAI(userId);
    if (!check.canUse) {
      return res.json({
        success: false,
        fallbackToLocal: true,
        error: check.reason,
        quota: aiQuotaService.getQuotaStatus(userId)
      });
    }

    // Call Gemini Vision AI
    const { result, usageMetadata } = await aiGradingService.gradeKanjiHandwritingWithVision({
      imageBase64,
      targetKanji,
      strokeCount,
      sinoVietnamese,
      meaning,
      radicals
    });

    const updatedQuota = aiQuotaService.recordUsage(userId, usageMetadata);

    return res.json({
      success: true,
      result,
      quota: updatedQuota,
      tokensConsumed: usageMetadata?.totalTokenCount || 0
    });
  } catch (err) {
    console.error('[AI Route] Error grading kanji handwriting with vision:', err);
    return res.json({
      success: false,
      fallbackToLocal: true,
      error: 'Không thể kết nối đến Gemini Vision AI. Hệ thống chuyển sang chấm điểm cục bộ.',
      details: err.message
    });
  }
});

/**
 * POST /api/ai/kanji-writing-riddles
 * Generate characteristic-based Kanji Writing Riddles using Gemini with permanent disk cache
 */
router.post('/kanji-writing-riddles', async (req, res) => {
  try {
    const { lessonId, kanjis = [], vocabItems = [], forceRefresh = false } = req.body;

    if (!lessonId || !Array.isArray(kanjis) || kanjis.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'lessonId and kanjis array are required'
      });
    }

    const diskCache = getRiddlesDiskCache();
    const cacheKey = `lesson_${lessonId}_v2`;

    // 1. Check permanent disk cache (only if not forceRefresh)
    if (!forceRefresh && diskCache[cacheKey] && Array.isArray(diskCache[cacheKey].riddles) && diskCache[cacheKey].riddles.length > 0) {
      return res.json({
        success: true,
        cached: true,
        riddles: diskCache[cacheKey].riddles
      });
    }

    const userId = await getUserIdAsync(req);

    // 2. Check quota
    const check = aiQuotaService.checkCanUseAI(userId);
    if (!check.canUse) {
      return res.json({
        success: false,
        fallbackToLocal: true,
        error: check.reason
      });
    }

    // 3. Call Gemini to generate riddles
    const { result, usageMetadata } = await aiGradingService.generateKanjiWritingRiddles({
      lessonId,
      kanjis,
      vocabList: vocabItems
    });

    const riddles = result?.riddles || [];

    // 4. Save to permanent disk cache
    diskCache[cacheKey] = {
      lessonId,
      riddles,
      createdAt: new Date().toISOString()
    };
    saveRiddlesDiskCache(diskCache);

    const updatedQuota = aiQuotaService.recordUsage(userId, usageMetadata);

    return res.json({
      success: true,
      cached: false,
      riddles,
      quota: updatedQuota,
      tokensConsumed: usageMetadata?.totalTokenCount || 0
    });
  } catch (err) {
    console.error('[AI Route] Error generating kanji writing riddles:', err);
    return res.json({
      success: false,
      fallbackToLocal: true,
      error: 'Không thể sinh câu đố bằng AI lúc này. Hệ thống chuyển sang sinh câu đố cục bộ.',
      details: err.message
    });
  }
});

/**
 * POST /api/ai/kanji-recognition-quiz
 * Generate situational Kanji & Vocabulary recognition questions with permanent disk cache
 */
router.post('/kanji-recognition-quiz', async (req, res) => {
  try {
    const { lessonId, kanjis = [], vocabItems = [], forceRefresh = false } = req.body;

    if (!lessonId || !Array.isArray(kanjis) || kanjis.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'lessonId and kanjis array are required'
      });
    }

    const diskCache = getRecognitionQuizDiskCache();
    const charSig = kanjis.map(k => k.character || '').sort().join('');
    const cacheKey = `lesson_${lessonId}_quiz_${charSig || 'all'}_v1`;

    // 1. Check permanent disk cache (only if not forceRefresh)
    if (!forceRefresh && diskCache[cacheKey] && Array.isArray(diskCache[cacheKey].questions) && diskCache[cacheKey].questions.length > 0) {
      return res.json({
        success: true,
        cached: true,
        questions: diskCache[cacheKey].questions
      });
    }

    const userId = await getUserIdAsync(req);

    // 2. Check quota
    const check = aiQuotaService.checkCanUseAI(userId);
    if (!check.canUse) {
      return res.json({
        success: false,
        fallbackToLocal: true,
        error: check.reason
      });
    }

    // 3. Call Gemini to generate recognition questions
    const { result, usageMetadata } = await aiGradingService.generateKanjiRecognitionQuestions({
      lessonId,
      kanjis,
      vocabList: vocabItems
    });

    const questions = result?.questions || [];

    // 4. Save to permanent disk cache
    if (questions.length > 0) {
      diskCache[cacheKey] = {
        lessonId,
        charSig,
        questions,
        createdAt: new Date().toISOString()
      };
      saveRecognitionQuizDiskCache(diskCache);
    }

    const updatedQuota = aiQuotaService.recordUsage(userId, usageMetadata);

    return res.json({
      success: true,
      cached: false,
      questions,
      quota: updatedQuota,
      tokensConsumed: usageMetadata?.totalTokenCount || 0
    });
  } catch (err) {
    console.error('[AI Route] Error generating kanji recognition quiz:', err);
    return res.json({
      success: false,
      fallbackToLocal: true,
      error: 'Không thể sinh câu hỏi nhận diện bằng AI lúc này. Hệ thống chuyển sang sinh cục bộ.',
      details: err.message
    });
  }
});

const aiPlannerService = require('../services/aiPlannerService');
const pushNotificationService = require('../services/pushNotificationService');
const { getVietnamDateStr } = require('../utils/vietnamTime');

function getLocalDateString(d = new Date()) {
  return getVietnamDateStr(d);
}

/**
 * POST /api/ai/generate-study-plan
 * Generate an AI micro-learning plan based on startDate and endDate
 */
router.post('/generate-study-plan', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      targetLevel = 'All',
      restDays = [],
      currentProgress = {}
    } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp ngày bắt đầu (startDate) và ngày kết thúc (endDate).'
      });
    }

    const userId = await getUserIdAsync(req);
    await progressService.syncUserProgressFromSupabase(userId);
    const plan = await aiPlannerService.generateStudyPlan({
      startDate,
      endDate,
      targetLevel,
      restDays,
      currentProgress,
      userId
    });

    // Scenario 3: Timeline replan push notification
    if (plan && plan.days) {
      const todayStr = getLocalDateString();
      const todayTasks = plan.days.find(d => d.date === todayStr)?.tasks || [];
      pushNotificationService.sendTimelineReplanNotification(userId, {
        startDate: plan.startDate,
        endDate: plan.endDate,
        todayTasks
      }).catch(e => console.warn('[PushNotification] Timeline replan push failed:', e.message));
    }

    return res.json({
      success: true,
      plan
    });
  } catch (err) {
    console.error('[AI Route] Error generating study plan:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/refine-study-plan
 * Refine study plan based on user comments while strictly keeping endDate
 */
router.post('/refine-study-plan', async (req, res) => {
  try {
    const {
      currentPlan,
      userComment = '',
      startDate,
      endDate,
      currentProgress = {}
    } = req.body;

    if (!userComment && !currentPlan) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp kế hoạch hiện tại hoặc nội dung yêu cầu điều chỉnh.'
      });
    }

    const userId = await getUserIdAsync(req);
    await progressService.syncUserProgressFromSupabase(userId);
    const updatedPlan = await aiPlannerService.refineStudyPlan({
      currentPlan,
      userComment,
      startDate: startDate || currentPlan?.startDate,
      endDate: endDate || currentPlan?.endDate,
      currentProgress,
      userId
    });

    // Scenario 3: Timeline replan push notification
    if (updatedPlan && updatedPlan.days) {
      const todayStr = getLocalDateString();
      const todayTasks = updatedPlan.days.find(d => d.date === todayStr)?.tasks || [];
      pushNotificationService.sendTimelineReplanNotification(userId, {
        startDate: updatedPlan.startDate,
        endDate: updatedPlan.endDate,
        todayTasks
      }).catch(e => console.warn('[PushNotification] Timeline refine push failed:', e.message));
    }

    return res.json({
      success: true,
      plan: updatedPlan
    });
  } catch (err) {
    console.error('[AI Route] Error refining study plan:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;



