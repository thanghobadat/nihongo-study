const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { requireAuth } = require('../middlewares/auth');

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
      return res.json({
        vocabulary: {
          total: 15,
          mastered: 5,
          percentage: 33.3
        },
        kanji: {
          total: 8,
          mastered: 2,
          percentage: 25.0
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
      return res.json({
        user_id: req.user.id,
        start_date: '2026-06-13',
        end_date: '2026-06-20',
        vocabulary_target: 30,
        kanji_target: 10,
        self_evaluation: 'Tốt'
      });
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
      return res.json({
        message: 'Target plan updated successfully (Mock Mode)',
        plan: {
          user_id: userId,
          start_date,
          end_date,
          vocabulary_target: vocabulary_target || 0,
          kanji_target: kanji_target || 0,
          self_evaluation: self_evaluation || null,
          updated_at: new Date().toISOString()
        }
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
      return res.json([
        { 
          id: 1, 
          title: 'Bài 1: Hajimemashite (Rất hân hạnh được làm quen)', 
          description: 'Học cách tự giới thiệu bản thân, các câu chào hỏi căn bản và cấu trúc câu khẳng định/phủ định.' 
        }
      ]);
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
      return res.json([
        { 
          id: 1, 
          lesson_id: parseInt(lessonId), 
          hiragana: 'わたし', 
          romaji: 'watashi', 
          vietnamese_meaning: 'tôi', 
          word_type: 'Danh từ', 
          japanese_example: 'わたしは学生です。', 
          example_meaning: 'Tôi là học sinh.', 
          mnemonic_tip: 'Mẹo nhớ: Vẽ hình bản thân chỉ tay vào mình.', 
          image_url: '',
          status: 'mastered' 
        },
        { 
          id: 2, 
          lesson_id: parseInt(lessonId), 
          hiragana: 'あなた', 
          romaji: 'anata', 
          vietnamese_meaning: 'bạn, anh, chị', 
          word_type: 'Danh từ', 
          japanese_example: 'あなたはだれですか。', 
          example_meaning: 'Bạn là ai?', 
          mnemonic_tip: 'Mẹo nhớ: Vẽ hình một người chỉ tay về phía trước.', 
          image_url: '',
          status: 'learning' 
        }
      ]);
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
      return res.json([
        { 
          id: 1, 
          lesson_id: parseInt(lessonId), 
          character: '私', 
          stroke_count: '7', 
          onyomi: 'シ', 
          kunyomi: 'watashi', 
          sino_vietnamese: 'TƯ', 
          vietnamese_meaning: 'tôi, cá nhân', 
          mnemonic_tip: 'Hình một người đang giữ đống lúa thóc của riêng mình.', 
          compounds: '私立 (しりつ - Tư lập)',
          status: 'mastered' 
        }
      ]);
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
      return res.json([
        { 
          id: 1, 
          lesson_id: parseInt(lessonId), 
          title: 'N1 wa N2 desu', 
          meaning: 'N1 là N2', 
          structure: 'N1 + は + N2 + です', 
          vietnamese_explanation: 'Trợ từ "は" đứng sau chủ ngữ N1 để biểu thị chủ đề của câu. "です" đứng ở cuối câu khẳng định để biểu thị thái độ lịch sự.', 
          japanese_example: 'わたしは学生です。', 
          example_meaning: 'Tôi là học sinh.', 
          notes: '"は" trong vai trò trợ từ phát âm là "wa".' 
        }
      ]);
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
