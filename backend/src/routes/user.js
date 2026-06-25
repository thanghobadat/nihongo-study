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
      const grammarList = mockDb.grammar;
      const progressKeys = Object.keys(mockDb.userProgress).filter(k => k.startsWith(`${userId}:`));

      const masteredVocab = progressKeys.filter(k => k.includes(':vocabulary:') && mockDb.userProgress[k] === 'mastered').length;
      const masteredKanji = progressKeys.filter(k => k.includes(':kanji:') && mockDb.userProgress[k] === 'mastered').length;
      const masteredGrammar = progressKeys.filter(k => k.includes(':grammar:') && mockDb.userProgress[k] === 'mastered').length;

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
        },
        grammar: {
          total: grammarList.length,
          mastered: masteredGrammar,
          percentage: grammarList.length ? parseFloat(((masteredGrammar / grammarList.length) * 100).toFixed(1)) : 0
        }
      });
    }

    // Get total vocabulary, kanji and grammar counts
    const { count: totalVocab, error: errV } = await supabase
      .from('vocabulary')
      .select('*', { count: 'exact', head: true });

    const { count: totalKanji, error: errK } = await supabase
      .from('kanji')
      .select('*', { count: 'exact', head: true });

    const { count: totalGrammar, error: errG } = await supabase
      .from('grammar')
      .select('*', { count: 'exact', head: true });

    if (errV || errK || errG) {
      throw new Error(errV?.message || errK?.message || errG?.message);
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
    const masteredGrammar = progressData.filter(p => p.item_type === 'grammar').length;

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
      },
      grammar: {
        total: totalGrammar || 0,
        mastered: masteredGrammar,
        percentage: totalGrammar ? parseFloat(((masteredGrammar / totalGrammar) * 100).toFixed(1)) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching progress summary:', error);
    res.status(500).json({ error: error.message || error, details: error });
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
    res.status(500).json({ error: error.message || error, details: error });
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
    res.status(500).json({ error: error.message || error, details: error });
  }
});

/**
 * GET /api/user/course-summary
 * Fetch overall summary data for a course (syllabus items, user progress and custom items)
 */
router.get('/course-summary', async (req, res) => {
  try {
    const course = req.query.course || 'minna';
    const userId = req.user.id;

    if (req.user.isMock) {
      const filteredLessons = mockDb.lessons.filter(l => (l.course || 'minna') === course);
      const lessonIds = filteredLessons.map(l => l.id);

      const vocabList = mockDb.vocabulary
        .filter(v => lessonIds.includes(v.lesson_id))
        .map(v => {
          const status = mockDb.userProgress[`${userId}:vocabulary:${v.id}`] || 'not_learned';
          return { ...v, status };
        });

      const kanjiList = mockDb.kanji
        .filter(k => lessonIds.includes(k.lesson_id))
        .map(k => {
          const status = mockDb.userProgress[`${userId}:kanji:${k.id}`] || 'not_learned';
          return { ...k, status };
        });

      const grammarList = mockDb.grammar
        .filter(g => lessonIds.includes(g.lesson_id))
        .map(g => {
          const status = mockDb.userProgress[`${userId}:grammar:${g.id}`] || 'not_learned';
          return { ...g, status };
        });

      const customData = readCustomItems();
      const customVocab = (customData.vocabulary || []).filter(v => v.user_id === userId && lessonIds.includes(v.lesson_id));
      const customKanji = (customData.kanji || []).filter(k => k.user_id === userId && lessonIds.includes(k.lesson_id));
      const customGrammar = (customData.grammar || []).filter(g => g.user_id === userId && lessonIds.includes(g.lesson_id));

      return res.json({
        lessons: filteredLessons,
        vocabulary: vocabList,
        kanji: kanjiList,
        grammar: grammarList,
        customVocabulary: customVocab,
        customKanji: customKanji,
        customGrammar: customGrammar
      });
    }

    // --- REAL DATABASE SUPABASE MODE ---
    const { data: lessons, error: lErr } = await supabase
      .from('lessons')
      .select('*')
      .eq('course', course)
      .order('id', { ascending: true });
    if (lErr) throw lErr;
    const lessonIds = lessons.map(l => l.id);

    const [vocabRes, kanjiRes, grammarRes] = await Promise.all([
      supabase.from('vocabulary').select('*').in('lesson_id', lessonIds),
      supabase.from('kanji').select('*').in('lesson_id', lessonIds),
      supabase.from('grammar').select('*').in('lesson_id', lessonIds)
    ]);
    if (vocabRes.error) throw vocabRes.error;
    if (kanjiRes.error) throw kanjiRes.error;
    if (grammarRes.error) throw grammarRes.error;

    const { data: userProgress, error: pErr } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);
    if (pErr) throw pErr;

    const vocabList = vocabRes.data.map(v => {
      const p = userProgress.find(progress => progress.item_type === 'vocabulary' && progress.item_id === v.id);
      return { ...v, status: p ? p.status : 'not_learned' };
    });
    const kanjiList = kanjiRes.data.map(k => {
      const p = userProgress.find(progress => progress.item_type === 'kanji' && progress.item_id === k.id);
      return { ...k, status: p ? p.status : 'not_learned' };
    });
    const grammarList = grammarRes.data.map(g => {
      const p = userProgress.find(progress => progress.item_type === 'grammar' && progress.item_id === g.id);
      return { ...g, status: p ? p.status : 'not_learned' };
    });

    const [customVocabRes, customKanjiRes, customGrammarRes] = await Promise.all([
      supabase.from('user_custom_vocabulary').select('*').eq('user_id', userId).in('lesson_id', lessonIds),
      supabase.from('user_custom_kanji').select('*').eq('user_id', userId).in('lesson_id', lessonIds),
      supabase.from('user_custom_grammar').select('*').eq('user_id', userId).in('lesson_id', lessonIds)
    ]);
    if (customVocabRes.error) throw customVocabRes.error;
    if (customKanjiRes.error) throw customKanjiRes.error;
    if (customGrammarRes.error) throw customGrammarRes.error;

    res.json({
      lessons,
      vocabulary: vocabList,
      kanji: kanjiList,
      grammar: grammarList,
      customVocabulary: customVocabRes.data,
      customKanji: customKanjiRes.data,
      customGrammar: customGrammarRes.data
    });
  } catch (error) {
    console.error('Error fetching course summary:', error);
    res.status(500).json({ error: error.message || error });
  }
});

/**
 * GET /api/lessons
```,StartLine:178,TargetContent:
 * Get list of lessons
 */
router.get('/lessons', async (req, res) => {
  try {
    const { course } = req.query; // 'minna', 'marugoto', hoặc undefined

    // Return mock data for local testing
    if (req.user.isMock) {
      let data = mockDb.lessons;
      if (course) {
        data = data.filter(l => (l.course || 'minna') === course);
      }
      return res.json(data);
    }

    let query = supabase.from('lessons').select('*').order('id', { ascending: true });
    if (course) {
      query = query.eq('course', course);
    }
    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: error.message || error, details: error });
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
    res.status(500).json({ error: error.message || error, details: error });
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
    res.status(500).json({ error: error.message || error, details: error });
  }
});

/**
 * GET /api/lessons/:id/grammar
 * Fetch Grammar points
 */
router.get('/lessons/:lessonId/grammar', async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    const userId = req.user.id;

    // Return mock data for local testing
    if (req.user.isMock) {
      const mergedList = mockDb.grammar
        .filter(item => item.lesson_id === parseInt(lessonId))
        .map(item => {
          const status = mockDb.userProgress[`${userId}:grammar:${item.id}`] || 'not_learned';
          return {
            ...item,
            status
          };
        });
      return res.json(mergedList);
    }

    const { data: grammarList, error: gError } = await supabase
      .from('grammar')
      .select('*')
      .eq('lesson_id', lessonId);

    if (gError) throw gError;

    const { data: userProgress, error: pError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('item_type', 'grammar');

    if (pError) throw pError;

    const mergedList = grammarList.map(item => {
      const progress = userProgress.find(p => p.item_id === item.id);
      return {
        ...item,
        status: progress ? progress.status : 'not_learned'
      };
    });

    res.json(mergedList);
  } catch (error) {
    console.error('Error fetching lesson grammar:', error);
    res.status(500).json({ error: error.message || error, details: error });
  }
});

/**
 * GET /api/lessons/:lessonId/kaiwa
 * Fetch speaking dialogue for a lesson, filtering out metadata rows
 */
router.get('/lessons/:lessonId/kaiwa', async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    const userId = req.user.id;

    // Return mock data for local testing
    if (req.user.isMock) {
      const dialogueList = mockDb.kaiwaDialog
        .filter(item => item.lesson_id === parseInt(lessonId))
        .filter(item => {
          // Filter out metadata rows
          if (!item.japanese || item.japanese.trim() === '') return false;
          if (item.speaker.includes('KHU VỰC') || item.speaker.includes('Tên người thoại') || item.speaker === 'Người nói' || item.speaker === 'Speaker' || item.japanese.includes('Tiếng Nhật')) return false;
          return true;
        });
      return res.json(dialogueList);
    }

    // In case Supabase has kaiwa_dialog table
    const { data: dialogueList, error: gError } = await supabase
      .from('kaiwa_dialog')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('id', { ascending: true });

    if (gError) {
      // Fallback to mockDb
      console.warn('kaiwa_dialog table read error, falling back to mockDb:', gError.message);
      const fallbackList = mockDb.kaiwaDialog
        .filter(item => item.lesson_id === parseInt(lessonId))
        .filter(item => {
          if (!item.japanese || item.japanese.trim() === '') return false;
          if (item.speaker.includes('KHU VỰC') || item.speaker.includes('Tên người thoại') || item.speaker === 'Người nói' || item.speaker === 'Speaker' || item.japanese.includes('Tiếng Nhật')) return false;
          return true;
        });
      return res.json(fallbackList);
    }

    const cleanedList = dialogueList.filter(item => {
      if (!item.japanese || item.japanese.trim() === '') return false;
      if (item.speaker.includes('KHU VỰC') || item.speaker.includes('Tên người thoại') || item.speaker === 'Người nói' || item.speaker === 'Speaker' || item.japanese.includes('Tiếng Nhật')) return false;
      return true;
    });

    res.json(cleanedList);
  } catch (error) {
    console.error('Error fetching lesson kaiwa:', error);
    res.status(500).json({ error: error.message || error, details: error });
  }
});

/**
 * GET /api/user/progress
 * Fetch user progress for a specific item_type ('hiragana', 'katakana', etc.)
 */
router.get('/progress', async (req, res) => {
  try {
    const { item_type } = req.query;
    if (!item_type) {
      return res.status(400).json({ error: 'item_type query parameter is required' });
    }
    const userId = req.user.id;

    if (req.user.isMock) {
      const prefix = `${userId}:${item_type}:`;
      const progressList = Object.keys(mockDb.userProgress)
        .filter(k => k.startsWith(prefix))
        .map(k => {
          const parts = k.split(':');
          const itemId = parseInt(parts[2]);
          return {
            user_id: userId,
            item_type,
            item_id: itemId,
            status: mockDb.userProgress[k]
          };
        });
      return res.json(progressList);
    }

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('item_type', item_type);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: error.message || error, details: error });
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

    if (!['vocabulary', 'kanji', 'grammar', 'hiragana', 'katakana', 'cando'].includes(item_type)) {
      return res.status(400).json({ error: 'item_type must be either vocabulary, kanji, grammar, hiragana, katakana or cando' });
    }

    if (!['not_learned', 'learning', 'mastered'].includes(status)) {
      return res.status(400).json({ error: 'status must be: not_learned, learning, or mastered' });
    }

    const userId = req.user.id;

    // Return mock data for local testing
    if (req.user.isMock) {
      if (Number(item_id) >= 100000) {
        const idNum = Number(item_id);
        let rangeStart = 100000;
        let rangeEnd = 199999;
        if (idNum >= 400000) {
          rangeStart = 400000;
          rangeEnd = 499999;
        } else if (idNum >= 300000) {
          rangeStart = 300000;
          rangeEnd = 399999;
        } else if (idNum >= 200000) {
          rangeStart = 200000;
          rangeEnd = 299999;
        }
        // Remove existing high scores in mock db
        const prefix = `${userId}:${item_type}:`;
        Object.keys(mockDb.userProgress).forEach(k => {
          if (k.startsWith(prefix)) {
            const parts = k.split(':');
            const id = parseInt(parts[2], 10);
            if (id >= rangeStart && id <= rangeEnd) {
              delete mockDb.userProgress[k];
            }
          }
        });
      }

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

    // If it's a high score, clean up existing high score records in that specific range first
    if (Number(item_id) >= 100000) {
      const idNum = Number(item_id);
      let rangeStart = 100000;
      let rangeEnd = 199999;
      if (idNum >= 400000) {
        rangeStart = 400000;
        rangeEnd = 499999;
      } else if (idNum >= 300000) {
        rangeStart = 300000;
        rangeEnd = 399999;
      } else if (idNum >= 200000) {
        rangeStart = 200000;
        rangeEnd = 299999;
      }
      const { error: delError } = await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', userId)
        .eq('item_type', item_type)
        .gte('item_id', rangeStart)
        .lte('item_id', rangeEnd);

      if (delError) throw delError;
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
    res.status(500).json({ error: error.message || error, details: error });
  }
});

/**
 * GET /api/lessons/:lessonId/cando
 * Fetch Can-do checklists for a lesson, joined with user progress status
 */
router.get('/lessons/:lessonId/cando', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId);
    const userId = req.user.id;

    // Return mock data for local testing
    if (req.user.isMock) {
      const list = (mockDb.candoChecks || [])
        .filter(item => item.lesson_id === lessonId)
        .map(item => {
          const status = mockDb.userProgress[`${userId}:cando:${item.id}`] || 'not_learned';
          return {
            ...item,
            status
          };
        });
      return res.json(list);
    }

    // Fetch from Supabase
    const { data: candoList, error: cError } = await supabase
      .from('cando_checks')
      .select('*')
      .eq('lesson_id', lessonId);

    if (cError) {
      // Fallback to mockDb
      console.warn('cando_checks table read error, falling back to mockDb:', cError.message);
      const fallbackList = (mockDb.candoChecks || [])
        .filter(item => item.lesson_id === lessonId)
        .map(item => {
          const status = mockDb.userProgress[`${userId}:cando:${item.id}`] || 'not_learned';
          return {
            ...item,
            status
          };
        });
      return res.json(fallbackList);
    }

    const { data: userProgress, error: pError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('item_type', 'cando');

    if (pError) throw pError;

    const mergedList = candoList.map(item => {
      const progress = userProgress.find(p => p.item_id === item.id);
      return {
        ...item,
        status: progress ? progress.status : 'not_learned'
      };
    });

    res.json(mergedList);
  } catch (error) {
    console.error('Error fetching cando checklist:', error);
    res.status(500).json({ error: error.message || error, details: error });
  }
});

/**
 * GET /api/lessons/:lessonId/culture
 * Fetch Culture content for a lesson
 */
router.get('/lessons/:lessonId/culture', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId);

    // Return mock data for local testing
    if (req.user.isMock) {
      const cultureData = (mockDb.cultureTopics || []).filter(item => item.lesson_id === lessonId);
      return res.json(cultureData);
    }

    const { data, error } = await supabase
      .from('culture_topics')
      .select('*')
      .eq('lesson_id', lessonId);

    if (error) {
      // Fallback to mockDb
      console.warn('culture_topics table read error, falling back to mockDb:', error.message);
      const fallbackData = (mockDb.cultureTopics || []).filter(item => item.lesson_id === lessonId);
      return res.json(fallbackData);
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching culture content:', error);
    res.status(500).json({ error: error.message || error, details: error });
  }
});

// --- HELPER FUNCTIONS FOR LOCAL MOCK CUSTOM ITEMS ---
const fs = require('fs');
const path = require('path');
const customItemsPath = path.join(__dirname, '../db/custom_items.json');

function readCustomItems() {
  try {
    if (fs.existsSync(customItemsPath)) {
      return JSON.parse(fs.readFileSync(customItemsPath, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading custom items:', e);
  }
  return { vocabulary: [], kanji: [], grammar: [] };
}

function writeCustomItems(data) {
  try {
    fs.writeFileSync(customItemsPath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error writing custom items:', e);
  }
}

// --- USER CUSTOM VOCABULARY ENDPOINTS ---

router.get('/custom/vocabulary', async (req, res) => {
  try {
    const userId = req.user.id;
    const lessonId = req.query.lesson_id ? parseInt(req.query.lesson_id) : null;

    if (req.user.isMock) {
      const data = readCustomItems();
      let list = data.vocabulary.filter(v => v.user_id === userId);
      if (lessonId !== null) {
        list = list.filter(v => v.lesson_id === lessonId);
      }
      return res.json(list);
    }

    let query = supabase.from('user_custom_vocabulary').select('*').eq('user_id', userId);
    if (lessonId !== null) {
      query = query.eq('lesson_id', lessonId);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching custom vocabulary:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/custom/vocabulary', async (req, res) => {
  try {
    const userId = req.user.id;
    const { lesson_id, hiragana, romaji, vietnamese_meaning, word_type, japanese_example, example_meaning, mnemonic_tip } = req.body;

    if (!hiragana || !romaji || !vietnamese_meaning) {
      return res.status(400).json({ error: 'hiragana, romaji, and vietnamese_meaning are required' });
    }

    if (req.user.isMock) {
      const data = readCustomItems();
      const newItem = {
        id: Date.now(),
        user_id: userId,
        lesson_id: lesson_id ? parseInt(lesson_id) : null,
        hiragana,
        romaji,
        vietnamese_meaning,
        word_type: word_type || '',
        japanese_example: japanese_example || '',
        example_meaning: example_meaning || '',
        mnemonic_tip: mnemonic_tip || '',
        created_at: new Date().toISOString()
      };
      data.vocabulary.push(newItem);
      writeCustomItems(data);
      return res.status(201).json(newItem);
    }

    const { data, error } = await supabase
      .from('user_custom_vocabulary')
      .insert({
        user_id: userId,
        lesson_id: lesson_id ? parseInt(lesson_id) : null,
        hiragana,
        romaji,
        vietnamese_meaning,
        word_type,
        japanese_example,
        example_meaning,
        mnemonic_tip
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating custom vocabulary:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/custom/vocabulary/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = parseInt(req.params.id);
    const { lesson_id, hiragana, romaji, vietnamese_meaning, word_type, japanese_example, example_meaning, mnemonic_tip } = req.body;

    if (req.user.isMock) {
      const data = readCustomItems();
      const idx = data.vocabulary.findIndex(v => v.id === itemId && v.user_id === userId);
      if (idx === -1) {
        return res.status(404).json({ error: 'Item not found' });
      }
      data.vocabulary[idx] = {
        ...data.vocabulary[idx],
        lesson_id: lesson_id ? parseInt(lesson_id) : null,
        hiragana: hiragana !== undefined ? hiragana : data.vocabulary[idx].hiragana,
        romaji: romaji !== undefined ? romaji : data.vocabulary[idx].romaji,
        vietnamese_meaning: vietnamese_meaning !== undefined ? vietnamese_meaning : data.vocabulary[idx].vietnamese_meaning,
        word_type: word_type !== undefined ? word_type : data.vocabulary[idx].word_type,
        japanese_example: japanese_example !== undefined ? japanese_example : data.vocabulary[idx].japanese_example,
        example_meaning: example_meaning !== undefined ? example_meaning : data.vocabulary[idx].example_meaning,
        mnemonic_tip: mnemonic_tip !== undefined ? mnemonic_tip : data.vocabulary[idx].mnemonic_tip
      };
      writeCustomItems(data);
      return res.json(data.vocabulary[idx]);
    }

    const { data, error } = await supabase
      .from('user_custom_vocabulary')
      .update({
        lesson_id: lesson_id ? parseInt(lesson_id) : null,
        hiragana,
        romaji,
        vietnamese_meaning,
        word_type,
        japanese_example,
        example_meaning,
        mnemonic_tip
      })
      .eq('id', itemId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating custom vocabulary:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/custom/vocabulary/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = parseInt(req.params.id);

    if (req.user.isMock) {
      const data = readCustomItems();
      const initialLen = data.vocabulary.length;
      data.vocabulary = data.vocabulary.filter(v => !(v.id === itemId && v.user_id === userId));
      if (data.vocabulary.length === initialLen) {
        return res.status(404).json({ error: 'Item not found' });
      }
      writeCustomItems(data);
      return res.json({ message: 'Item deleted successfully' });
    }

    const { error } = await supabase
      .from('user_custom_vocabulary')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom vocabulary:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- USER CUSTOM KANJI ENDPOINTS ---

router.get('/custom/kanji', async (req, res) => {
  try {
    const userId = req.user.id;
    const lessonId = req.query.lesson_id ? parseInt(req.query.lesson_id) : null;

    if (req.user.isMock) {
      const data = readCustomItems();
      let list = data.kanji.filter(k => k.user_id === userId);
      if (lessonId !== null) {
        list = list.filter(k => k.lesson_id === lessonId);
      }
      return res.json(list);
    }

    let query = supabase.from('user_custom_kanji').select('*').eq('user_id', userId);
    if (lessonId !== null) {
      query = query.eq('lesson_id', lessonId);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching custom kanji:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/custom/kanji', async (req, res) => {
  try {
    const userId = req.user.id;
    const { lesson_id, character, stroke_count, onyomi, kunyomi, sino_vietnamese, vietnamese_meaning, mnemonic_tip, compounds } = req.body;

    if (!character || !vietnamese_meaning) {
      return res.status(400).json({ error: 'character and vietnamese_meaning are required' });
    }

    if (req.user.isMock) {
      const data = readCustomItems();
      const newItem = {
        id: Date.now(),
        user_id: userId,
        lesson_id: lesson_id ? parseInt(lesson_id) : null,
        character,
        stroke_count: stroke_count || '',
        onyomi: onyomi || '',
        kunyomi: kunyomi || '',
        sino_vietnamese: sino_vietnamese || '',
        vietnamese_meaning,
        mnemonic_tip: mnemonic_tip || '',
        compounds: compounds || '',
        created_at: new Date().toISOString()
      };
      data.kanji.push(newItem);
      writeCustomItems(data);
      return res.status(201).json(newItem);
    }

    const { data, error } = await supabase
      .from('user_custom_kanji')
      .insert({
        user_id: userId,
        lesson_id: lesson_id ? parseInt(lesson_id) : null,
        character,
        stroke_count,
        onyomi,
        kunyomi,
        sino_vietnamese,
        vietnamese_meaning,
        mnemonic_tip,
        compounds
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating custom kanji:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/custom/kanji/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = parseInt(req.params.id);
    const { lesson_id, character, stroke_count, onyomi, kunyomi, sino_vietnamese, vietnamese_meaning, mnemonic_tip, compounds } = req.body;

    if (req.user.isMock) {
      const data = readCustomItems();
      const idx = data.kanji.findIndex(k => k.id === itemId && k.user_id === userId);
      if (idx === -1) {
        return res.status(404).json({ error: 'Item not found' });
      }
      data.kanji[idx] = {
        ...data.kanji[idx],
        lesson_id: lesson_id ? parseInt(lesson_id) : null,
        character: character !== undefined ? character : data.kanji[idx].character,
        stroke_count: stroke_count !== undefined ? stroke_count : data.kanji[idx].stroke_count,
        onyomi: onyomi !== undefined ? onyomi : data.kanji[idx].onyomi,
        kunyomi: kunyomi !== undefined ? kunyomi : data.kanji[idx].kunyomi,
        sino_vietnamese: sino_vietnamese !== undefined ? sino_vietnamese : data.kanji[idx].sino_vietnamese,
        vietnamese_meaning: vietnamese_meaning !== undefined ? vietnamese_meaning : data.kanji[idx].vietnamese_meaning,
        mnemonic_tip: mnemonic_tip !== undefined ? mnemonic_tip : data.kanji[idx].mnemonic_tip,
        compounds: compounds !== undefined ? compounds : data.kanji[idx].compounds
      };
      writeCustomItems(data);
      return res.json(data.kanji[idx]);
    }

    const { data, error } = await supabase
      .from('user_custom_kanji')
      .update({
        lesson_id: lesson_id ? parseInt(lesson_id) : null,
        character,
        stroke_count,
        onyomi,
        kunyomi,
        sino_vietnamese,
        vietnamese_meaning,
        mnemonic_tip,
        compounds
      })
      .eq('id', itemId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating custom kanji:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/custom/kanji/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = parseInt(req.params.id);

    if (req.user.isMock) {
      const data = readCustomItems();
      const initialLen = data.kanji.length;
      data.kanji = data.kanji.filter(k => !(k.id === itemId && k.user_id === userId));
      if (data.kanji.length === initialLen) {
        return res.status(404).json({ error: 'Item not found' });
      }
      writeCustomItems(data);
      return res.json({ message: 'Item deleted successfully' });
    }

    const { error } = await supabase
      .from('user_custom_kanji')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom kanji:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- USER CUSTOM GRAMMAR ENDPOINTS ---

router.get('/custom/grammar', async (req, res) => {
  try {
    const userId = req.user.id;
    const lessonId = req.query.lesson_id ? parseInt(req.query.lesson_id) : null;

    if (req.user.isMock) {
      const data = readCustomItems();
      let list = data.grammar.filter(g => g.user_id === userId);
      if (lessonId !== null) {
        list = list.filter(g => g.lesson_id === lessonId);
      }
      return res.json(list);
    }

    let query = supabase.from('user_custom_grammar').select('*').eq('user_id', userId);
    if (lessonId !== null) {
      query = query.eq('lesson_id', lessonId);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching custom grammar:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/custom/grammar', async (req, res) => {
  try {
    const userId = req.user.id;
    const { lesson_id, title, meaning, structure, vietnamese_explanation, japanese_example, example_meaning, romaji_example, notes } = req.body;

    if (!title || !meaning) {
      return res.status(400).json({ error: 'title and meaning are required' });
    }

    if (req.user.isMock) {
      const data = readCustomItems();
      const newItem = {
        id: Date.now(),
        user_id: userId,
        lesson_id: lesson_id ? parseInt(lesson_id) : null,
        title,
        meaning,
        structure: structure || '',
        vietnamese_explanation: vietnamese_explanation || '',
        japanese_example: japanese_example || '',
        example_meaning: example_meaning || '',
        romaji_example: romaji_example || '',
        notes: notes || '',
        created_at: new Date().toISOString()
      };
      data.grammar.push(newItem);
      writeCustomItems(data);
      return res.status(201).json(newItem);
    }

    const { data, error } = await supabase
      .from('user_custom_grammar')
      .insert({
        user_id: userId,
        lesson_id: lesson_id ? parseInt(lesson_id) : null,
        title,
        meaning,
        structure,
        vietnamese_explanation,
        japanese_example,
        example_meaning,
        romaji_example,
        notes
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating custom grammar:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/custom/grammar/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = parseInt(req.params.id);
    const { lesson_id, title, meaning, structure, vietnamese_explanation, japanese_example, example_meaning, romaji_example, notes } = req.body;

    if (req.user.isMock) {
      const data = readCustomItems();
      const idx = data.grammar.findIndex(g => g.id === itemId && g.user_id === userId);
      if (idx === -1) {
        return res.status(404).json({ error: 'Item not found' });
      }
      data.grammar[idx] = {
        ...data.grammar[idx],
        lesson_id: lesson_id ? parseInt(lesson_id) : null,
        title: title !== undefined ? title : data.grammar[idx].title,
        meaning: meaning !== undefined ? meaning : data.grammar[idx].meaning,
        structure: structure !== undefined ? structure : data.grammar[idx].structure,
        vietnamese_explanation: vietnamese_explanation !== undefined ? vietnamese_explanation : data.grammar[idx].vietnamese_explanation,
        japanese_example: japanese_example !== undefined ? japanese_example : data.grammar[idx].japanese_example,
        example_meaning: example_meaning !== undefined ? example_meaning : data.grammar[idx].example_meaning,
        romaji_example: romaji_example !== undefined ? romaji_example : data.grammar[idx].romaji_example,
        notes: notes !== undefined ? notes : data.grammar[idx].notes
      };
      writeCustomItems(data);
      return res.json(data.grammar[idx]);
    }

    const { data, error } = await supabase
      .from('user_custom_grammar')
      .update({
        lesson_id: lesson_id ? parseInt(lesson_id) : null,
        title,
        meaning,
        structure,
        vietnamese_explanation,
        japanese_example,
        example_meaning,
        romaji_example,
        notes
      })
      .eq('id', itemId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating custom grammar:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/custom/grammar/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = parseInt(req.params.id);

    if (req.user.isMock) {
      const data = readCustomItems();
      const initialLen = data.grammar.length;
      data.grammar = data.grammar.filter(g => !(g.id === itemId && g.user_id === userId));
      if (data.grammar.length === initialLen) {
        return res.status(404).json({ error: 'Item not found' });
      }
      writeCustomItems(data);
      return res.json({ message: 'Item deleted successfully' });
    }

    const { error } = await supabase
      .from('user_custom_grammar')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom grammar:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- USER KNOWLEDGE HUB ENDPOINTS (PERSONAL REVIEW ROOM) ---

router.get('/knowledge-items', async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.isMock) {
      const data = readCustomItems();
      const list = (data.knowledge_items || []).filter(item => item.user_id === userId);
      return res.json(list);
    }

    const { data, error } = await supabase
      .from('user_knowledge_items')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching knowledge items:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/knowledge-items/add-bulk', async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required' });
    }

    if (req.user.isMock) {
      const data = readCustomItems();
      if (!data.knowledge_items) data.knowledge_items = [];

      const added = [];
      items.forEach(item => {
        const exists = data.knowledge_items.some(
          k => k.user_id === userId && k.item_type === item.item_type && k.item_id === parseInt(item.item_id)
        );
        if (!exists) {
          const newItem = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            user_id: userId,
            item_type: item.item_type,
            item_id: parseInt(item.item_id),
            created_at: new Date().toISOString()
          };
          data.knowledge_items.push(newItem);
          added.push(newItem);
        }
      });
      writeCustomItems(data);
      return res.status(201).json({ message: `Successfully added ${added.length} items to knowledge hub.`, added });
    }

    const rows = items.map(item => ({
      user_id: userId,
      item_type: item.item_type,
      item_id: parseInt(item.item_id)
    }));

    const { data, error } = await supabase
      .from('user_knowledge_items')
      .upsert(rows, { onConflict: 'user_id,item_type,item_id' })
      .select();

    if (error) throw error;
    res.status(201).json({ message: `Successfully added ${rows.length} items to knowledge hub.`, data });
  } catch (error) {
    console.error('Error adding knowledge items bulk:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/knowledge-items/:type/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const itemType = req.params.type;
    const itemId = parseInt(req.params.id);

    if (req.user.isMock) {
      const data = readCustomItems();
      if (!data.knowledge_items) data.knowledge_items = [];
      const initialLen = data.knowledge_items.length;
      data.knowledge_items = data.knowledge_items.filter(
        k => !(k.user_id === userId && k.item_type === itemType && k.item_id === itemId)
      );
      if (data.knowledge_items.length === initialLen) {
        return res.status(404).json({ error: 'Item not found in knowledge hub' });
      }
      writeCustomItems(data);
      return res.json({ message: 'Item removed from knowledge hub successfully' });
    }

    const { error } = await supabase
      .from('user_knowledge_items')
      .delete()
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq('item_id', itemId);

    if (error) throw error;
    res.json({ message: 'Item removed from knowledge hub successfully' });
  } catch (error) {
    console.error('Error removing knowledge item:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// EXAM ENDPOINTS (JLPT MOCK EXAMS & HISTORY)
// ----------------------------------------------------
const examsFile = path.join(__dirname, '../db/exams.json');

function readMockExams() {
  try {
    if (!fs.existsSync(examsFile)) {
      fs.writeFileSync(examsFile, JSON.stringify({ exams: [] }, null, 2), 'utf8');
      return { exams: [] };
    }
    const content = fs.readFileSync(examsFile, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading exams.json:", err);
    return { exams: [] };
  }
}

function writeMockExams(data) {
  try {
    fs.writeFileSync(examsFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing exams.json:", err);
  }
}

/**
 * POST /api/user/exams
 * Save new JLPT mock exam results
 */
router.post('/exams', async (req, res) => {
  try {
    const userId = req.user.id;
    const { course, range_start, range_end, score, total_questions, time_spent, questions_data } = req.body;

    if (!course || range_start === undefined || range_end === undefined || score === undefined || total_questions === undefined || time_spent === undefined || !questions_data) {
      return res.status(400).json({ error: 'Missing required exam results fields' });
    }

    if (req.user.isMock) {
      const data = readMockExams();
      if (!data.exams) data.exams = [];
      const newExam = {
        id: require('crypto').randomUUID(),
        user_id: userId,
        course,
        range_start: parseInt(range_start),
        range_end: parseInt(range_end),
        score: parseInt(score),
        total_questions: parseInt(total_questions),
        time_spent: parseInt(time_spent),
        questions_data,
        created_at: new Date().toISOString()
      };
      data.exams.push(newExam);
      writeMockExams(data);
      return res.json({ message: 'Exam results saved successfully (Mock)', examId: newExam.id });
    }

    const { data, error } = await supabase
      .from('user_exam_results')
      .insert({
        user_id: userId,
        course,
        range_start: parseInt(range_start),
        range_end: parseInt(range_end),
        score: parseInt(score),
        total_questions: parseInt(total_questions),
        time_spent: parseInt(time_spent),
        questions_data
      })
      .select('id')
      .single();

    if (error) throw error;
    res.json({ message: 'Exam results saved successfully', examId: data.id });
  } catch (error) {
    console.error('Error saving exam result:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/user/exams
 * Fetch list of user's past exams
 */
router.get('/exams', async (req, res) => {
  try {
    const userId = req.user.id;
    const { course } = req.query;

    if (req.user.isMock) {
      const data = readMockExams();
      let list = data.exams || [];
      list = list.filter(e => e.user_id === userId);
      if (course) {
        list = list.filter(e => e.course === course);
      }
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return res.json(list);
    }

    let query = supabase
      .from('user_exam_results')
      .select('id, course, range_start, range_end, score, total_questions, time_spent, created_at')
      .eq('user_id', userId);

    if (course) {
      query = query.eq('course', course);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching exam history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/user/exams/:id
 * Fetch detail of a specific past exam
 */
router.get('/exams/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const examId = req.params.id;

    if (req.user.isMock) {
      const data = readMockExams();
      const exam = (data.exams || []).find(e => e.id === examId && e.user_id === userId);
      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }
      return res.json(exam);
    }

    const { data, error } = await supabase
      .from('user_exam_results')
      .select('*')
      .eq('id', examId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching exam details:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/user/exams/:id
 * Delete a specific past exam
 */
router.delete('/exams/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const examId = req.params.id;

    if (req.user.isMock) {
      const data = readMockExams();
      const initialLength = (data.exams || []).length;
      data.exams = (data.exams || []).filter(e => !(e.id === examId && e.user_id === userId));

      if (data.exams.length === initialLength) {
        return res.status(404).json({ error: 'Exam not found or unauthorized' });
      }

      writeMockExams(data);
      return res.json({ message: 'Exam deleted successfully (Mock)' });
    }

    const { error } = await supabase
      .from('user_exam_results')
      .delete()
      .eq('id', examId)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


