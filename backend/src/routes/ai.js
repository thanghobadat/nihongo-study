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
      error: 'Dịch vụ AI đang bận hoặc gián đoạn. Đã chuyển sang bộ chấm điểm cục bộ.'
    });
  }
});

module.exports = router;
