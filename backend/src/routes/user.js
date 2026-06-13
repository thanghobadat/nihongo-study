const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { requireAuth } = require('../middlewares/auth');
const mockDb = require('../db/mockDb');

// Apply auth middleware to all user routes
router.use(requireAuth);

/**
 * GET /api/user/progress-summary
 * Fetch overall vocabulary and kanji study progress for dashboard
 */
router.get('/progress-summary', async (req, res) => {
  try {
    const userId = req.user.id;

    // Return mock data for local testing
    if (req.user.isMock) {
      const vocabList = mockDb.vocabulary;
      const kanjiList = mockDb.kanji;
      const progressKeys = Object.keys(mockDb.userProgress).filter(k => k.startsWith(`${userId}:`));

      const masteredVocab = progressKeys.filter(k => k.includes(':vocabulary:') && mockDb.userProgress[k] === 'mastered').length;
      const masteredKanji = progressKeys.filter(k => k.includes(':kanji:') && mockDb.userProgress[k] === 'mastered').length;

      return res.json({
        vocabulary: {
          total: vocabList.length,
          mastered: masteredVocab,
          percentage: vocabList.length ? parseFloat(((masteredVocab / vocabList.length) * 100).toFixed(1)) : 0
        },
        kanji: {
          total: kanjiList.length,
          mastered: masteredKanji,
          percentage: kanjiList.length ? parseFloat(((masteredKanji / kanjiList.length) * 100).toFixed(1)) : 0
        }
      });
    }

    // Get total vocabulary and kanji counts
    const { count: totalVocab, error: errV } = await supabase
      .from('vocabulary')
      .select('*', { count: 'exact', head: true });

    const { count: totalKanji, error: errK } = await supabase
      .from('kanji')
      .select('*', { count: 'exact', head: true });

    if (errV || errK) {
      throw new Error(errV?.message || errK?.message);
    }

    // Get user's mastered counts
    const { data: progressData, error: errP } = await supabase
      .from('user_progress')
      .select('item_type, status')
      .eq('user_id', userId)
      .eq('status', 'mastered');

    if (errP) throw errP;

    const masteredVocab = progressData.filter(p => p.item_type === 'vocabulary').length;
    const masteredKanji = progressData.filter(p => p.item_type === 'kanji').length;

    res.json({
      vocabulary: {
        total: totalVocab || 0,
        mastered: masteredVocab,
        percentage: totalVocab ? parseFloat(((masteredVocab / totalVocab) * 100).toFixed(1)) : 0
      },
      kanji: {
        total: totalKanji || 0,
        mastered: masteredKanji,
        percentage: totalKanji ? parseFloat(((masteredKanji / totalKanji) * 100).toFixed(1)) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching progress summary:', error);
    res.status(500).json({ error: 'Failed to fetch progress summary' });
  }
});

/**
 * GET /api/user/target-plan
 * Fetch user target setting details
 */
router.get('/target-plan', async (req, res) => {
  try {
    // Return mock data for local testing
    if (req.user.isMock) {
      const plan = mockDb.targetPlan[req.user.id] || { message: 'No target plan configured' };
      return res.json(plan);
    }

    const { data, error } = await supabase
      .from('target_plans')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    res.json(data || { message: 'No target plan configured' });
  } catch (error) {
    console.error('Error fetching target plan:', error);
    res.status(500).json({ error: 'Failed to fetch target plan' });
  }
});

/**
 * POST /api/user/target-plan
 * Set or update user target planning
 */
router.post('/target-plan', async (req, res) => {
  try {
    const { start_date, end_date, vocabulary_target, kanji_target, self_evaluation } = req.body;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const userId = req.user.id;

    // Return mock data for local testing
    if (req.user.isMock) {
      const updatedPlan = {
        user_id: userId,
        start_date,
        end_date,
        vocabulary_target: vocabulary_target || 0,
        kanji_target: kanji_target || 0,
        self_evaluation: self_evaluation || null,
        updated_at: new Date().toISOString()
      };
      mockDb.targetPlan[userId] = updatedPlan;
      return res.json({
        message: 'Target plan updated successfully (Mock Mode)',
        plan: updatedPlan
      });
    }

    // Upsert target plan
    const { data, error } = await supabase
      .from('target_plans')
      .upsert({
        user_id: userId,
        start_date,
        end_date,
        vocabulary_target: vocabulary_target || 0,
        kanji_target: kanji_target || 0,
        self_evaluation: self_evaluation || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Target plan updated successfully', plan: data });
  } catch (error) {
    console.error('Error updating target plan:', error);
    res.status(500).json({ error: 'Failed to update target plan' });
  }
});

/**
 * GET /api/lessons
 * Get list of lessons
 */
router.get('/lessons', async (req, res) => {
  try {
    // Return mock data for local testing
    if (req.user.isMock) {
      return res.json(mockDb.lessons);
    }

    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

/**
 * GET /api/lessons/:id/vocabulary
 * Fetch vocabulary items for a lesson, joined with user progress status
 */
router.get('/lessons/:lessonId/vocabulary', async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    const userId = req.user.id;

    // Return mock data for local testing
    if (req.user.isMock) {
      const mergedList = mockDb.vocabulary
        .filter(item => item.lesson_id === parseInt(lessonId))
        .map(item => {
          const status = mockDb.userProgress[`${userId}:vocabulary:${item.id}`] || 'not_learned';
          return {
            ...item,
            status
          };
        });
      return res.json(mergedList);
    }

    // Fetch vocabulary
    const { data: vocabList, error: vError } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('lesson_id', lessonId);

    if (vError) throw vError;

    // Fetch user progress for this lesson's vocabularies
    const { data: userProgress, error: pError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('item_type', 'vocabulary');

    if (pError) throw pError;

    // Merge progress into list
    const mergedList = vocabList.map(item => {
      const progress = userProgress.find(p => p.item_id === item.id);
      return {
        ...item,
        status: progress ? progress.status : 'not_learned'
      };
    });

    res.json(mergedList);
  } catch (error) {
    console.error('Error fetching lesson vocabulary:', error);
    res.status(500).json({ error: 'Failed to fetch vocabulary' });
  }
});

/**
 * GET /api/lessons/:id/kanji
 * Fetch Kanji items for a lesson, joined with user progress status
 */
router.get('/lessons/:lessonId/kanji', async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    const userId = req.user.id;

    // Return mock data for local testing
    if (req.user.isMock) {
      const mergedList = mockDb.kanji
        .filter(item => item.lesson_id === parseInt(lessonId))
        .map(item => {
          const status = mockDb.userProgress[`${userId}:kanji:${item.id}`] || 'not_learned';
          return {
            ...item,
            status
          };
        });
      return res.json(mergedList);
    }

    const { data: kanjiList, error: kError } = await supabase
      .from('kanji')
      .select('*')
      .eq('lesson_id', lessonId);

    if (kError) throw kError;

    const { data: userProgress, error: pError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('item_type', 'kanji');

    if (pError) throw pError;

    const mergedList = kanjiList.map(item => {
      const progress = userProgress.find(p => p.item_id === item.id);
      return {
        ...item,
        status: progress ? progress.status : 'not_learned'
      };
    });

    res.json(mergedList);
  } catch (error) {
    console.error('Error fetching lesson kanji:', error);
    res.status(500).json({ error: 'Failed to fetch kanji' });
  }
});

/**
 * GET /api/lessons/:id/grammar
 * Fetch Grammar points
 */
router.get('/lessons/:lessonId/grammar', async (req, res) => {
  try {
    const lessonId = req.params.lessonId;

    // Return mock data for local testing
    if (req.user.isMock) {
      const filtered = mockDb.grammar.filter(item => item.lesson_id === parseInt(lessonId));
      return res.json(filtered);
    }

    const { data, error } = await supabase
      .from('grammar')
      .select('*')
      .eq('lesson_id', lessonId);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching lesson grammar:', error);
    res.status(500).json({ error: 'Failed to fetch grammar points' });
  }
});

/**
 * POST /api/user/progress
 * Update user progress (Zebra status mapping)
 */
router.post('/progress', async (req, res) => {
  try {
    const { item_type, item_id, status } = req.body;

    if (!item_type || !item_id || !status) {
      return res.status(400).json({ error: 'item_type, item_id, and status are required' });
    }

    if (!['vocabulary', 'kanji'].includes(item_type)) {
      return res.status(400).json({ error: 'item_type must be either vocabulary or kanji' });
    }

    if (!['not_learned', 'learning', 'mastered'].includes(status)) {
      return res.status(400).json({ error: 'status must be: not_learned, learning, or mastered' });
    }

    const userId = req.user.id;

    // Return mock data for local testing
    if (req.user.isMock) {
      const key = `${userId}:${item_type}:${item_id}`;
      mockDb.userProgress[key] = status;
      return res.json({
        message: 'Progress updated successfully (Mock Mode)',
        progress: {
          user_id: userId,
          item_type,
          item_id,
          status,
          updated_at: new Date().toISOString()
        }
      });
    }

    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        item_type,
        item_id,
        status,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,item_type,item_id' })
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Progress updated successfully', progress: data });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

module.exports = router;
