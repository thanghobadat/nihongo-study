const express = require('express');
const router = express.Router();
const aiQuotaService = require('../services/aiQuotaService');
const aiGradingService = require('../services/aiGradingService');

/**
 * Helper to get a stable user identifier (logged in user ID, or IP-based fallback)
 */
function getUserId(req) {
  if (req.user && req.user.id) {
    return req.user.id;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer mock-token-')) {
    return authHeader.replace('Bearer mock-token-', '').replace('-admin', '');
  }
  // Fallback to client IP or demo_user
  const ip = req.ip || req.headers['x-forwarded-for'] || 'demo_user';
  return String(ip).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 32) || 'demo_user';
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

const aiPlannerService = require('../services/aiPlannerService');
const pushNotificationService = require('../services/pushNotificationService');

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

    const userId = getUserId(req);
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

    const userId = getUserId(req);
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



