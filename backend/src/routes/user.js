const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const supabase = require('../db/supabase');
const { requireAuth } = require('../middlewares/auth');
const mockDb = require('../db/mockDb');
const pushNotificationService = require('../services/pushNotificationService');
const aiPlannerService = require('../services/aiPlannerService');

const STUDY_PLANS_FILE = path.join(__dirname, '../db/study_plans.json');

function loadPersistentPlans() {
  try {
    if (fs.existsSync(STUDY_PLANS_FILE)) {
      return JSON.parse(fs.readFileSync(STUDY_PLANS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('[StudyPlan] Error reading study_plans.json:', e.message);
  }
  return {};
}

function savePersistentPlans(plans) {
  try {
    fs.writeFileSync(STUDY_PLANS_FILE, JSON.stringify(plans, null, 2), 'utf8');
  } catch (e) {
    console.error('[StudyPlan] Error writing study_plans.json:', e.message);
  }
}

// Initialize mockDb.studyPlans from persistent disk storage
if (!mockDb.studyPlans) mockDb.studyPlans = {};
try {
  const loaded = loadPersistentPlans();
  mockDb.studyPlans = { ...loaded, ...mockDb.studyPlans };
} catch (e) {}

/**
 * Sync Supabase user_progress table into local auto-tracking cache for online users
 */
async function syncUserProgressFromSupabase(userId) {
  try {
    if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('placeholder')) {
      return;
    }
    const { data, error } = await supabase
      .from('user_progress')
      .select('item_type, item_id, status')
      .eq('user_id', userId);
    if (data && Array.isArray(data)) {
      if (!mockDb.userProgress) mockDb.userProgress = {};
      for (const row of data) {
        mockDb.userProgress[`${userId}:${row.item_type}:${row.item_id}`] = row.status;
      }
    }
  } catch (err) {
    console.warn('[AutoTracking] Supabase sync warning:', err.message);
  }
}

function getLocalDateStr(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
 * GET /api/user/daily-report-status
 * Get the last date the user viewed the daily progress report
 */
router.get('/daily-report-status', async (req, res) => {
  try {
    const userId = req.user.id;
    if (req.user.isMock) {
      if (!mockDb.dailyReportStatus) mockDb.dailyReportStatus = {};
      return res.json({ last_daily_report_date: mockDb.dailyReportStatus[userId] || null });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('last_daily_report_date')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    res.json({ last_daily_report_date: data?.last_daily_report_date || null });
  } catch (error) {
    console.error('Error fetching daily report status:', error);
    res.status(500).json({ error: error.message || error });
  }
});

/**
 * POST /api/user/daily-report-ack
 * Acknowledge viewing today's daily progress report
 */
router.post('/daily-report-ack', async (req, res) => {
  try {
    const userId = req.user.id;
    const reportDate = req.body.date || getLocalDateStr();

    if (req.user.isMock) {
      if (!mockDb.dailyReportStatus) mockDb.dailyReportStatus = {};
      mockDb.dailyReportStatus[userId] = reportDate;
      return res.json({ message: 'Daily report acknowledged (Mock)', last_daily_report_date: reportDate });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ last_daily_report_date: reportDate, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
    res.json({ message: 'Daily report acknowledged', last_daily_report_date: reportDate });
  } catch (error) {
    console.error('Error updating daily report status:', error);
    res.status(500).json({ error: error.message || error });
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

    if (!['vocabulary', 'kanji', 'grammar', 'hiragana', 'katakana', 'cando', 'radical'].includes(item_type)) {
      return res.status(400).json({ error: 'item_type must be either vocabulary, kanji, grammar, hiragana, katakana, cando or radical' });
    }

    if (!['not_learned', 'learning', 'mastered', 'wrong'].includes(status)) {
      return res.status(400).json({ error: 'status must be: not_learned, learning, mastered, or wrong' });
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

    // Mirror to in-memory for instant auto-tracking reflection
    if (!mockDb.userProgress) mockDb.userProgress = {};
    mockDb.userProgress[`${userId}:${item_type}:${item_id}`] = status;

    res.json({ message: 'Progress updated successfully', progress: data });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: error.message || error, details: error });
  }
});

/**
 * POST /api/user/progress/clear-wrong
 * Batch clear all 'wrong' progress items for a user back to 'learning'
 */
router.post('/progress/clear-wrong', async (req, res) => {
  try {
    const { item_type } = req.body;
    const targetType = item_type || 'vocabulary';
    const userId = req.user.id;

    if (req.user.isMock) {
      const prefix = `${userId}:${targetType}:`;
      Object.keys(mockDb.userProgress).forEach(k => {
        if (k.startsWith(prefix) && mockDb.userProgress[k] === 'wrong') {
          mockDb.userProgress[k] = 'learning';
        }
      });
      return res.json({ message: 'Cleared wrong items successfully (Mock Mode)' });
    }

    const { error } = await supabase
      .from('user_progress')
      .update({ status: 'learning', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('item_type', targetType)
      .eq('status', 'wrong');

    if (error) throw error;
    res.json({ message: 'Cleared wrong items successfully' });
  } catch (error) {
    console.error('Error clearing wrong items:', error);
    res.status(500).json({ error: error.message || error });
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

/**
 * GET /api/user/lessons/available-reviews
 * Dynamically scan highest available lesson with review data
 */
router.get('/lessons/available-reviews', async (req, res) => {
  try {
    let availableLessonIds = [];
    
    // Check mockDb
    if (mockDb.lesson_reviews) {
      availableLessonIds = Object.keys(mockDb.lesson_reviews).map(id => parseInt(id)).filter(id => !isNaN(id));
    } else if (Array.isArray(mockDb.lessonReviews)) {
      availableLessonIds = mockDb.lessonReviews.map(r => r.lesson_id);
    }

    // Check Supabase if connected
    if (supabase && (!req.user || !req.user.isMock)) {
      try {
        const { data } = await supabase.from('lesson_reviews').select('lesson_id');
        if (data && data.length > 0) {
          const sbIds = data.map(d => d.lesson_id);
          availableLessonIds = Array.from(new Set([...availableLessonIds, ...sbIds]));
        }
      } catch (e) {
        // Fallback to mockDb IDs
      }
    }

    const maxLessonId = availableLessonIds.length > 0 ? Math.max(...availableLessonIds) : 3;
    res.json({ maxLessonId, availableLessonIds: availableLessonIds.sort((a, b) => a - b) });
  } catch (error) {
    res.json({ maxLessonId: 3, availableLessonIds: [1, 2, 3] });
  }
});

/**
 * GET /api/user/lessons/:lessonId/review
 * Fetch shuffle review questions for a lesson
 */
router.get('/lessons/:lessonId/review', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId);
    let reviewData = null;

    // Local Mode
    const getMockReview = (id) => {
      if (mockDb.lesson_reviews && (mockDb.lesson_reviews[id] || mockDb.lesson_reviews[String(id)])) {
        return mockDb.lesson_reviews[id] || mockDb.lesson_reviews[String(id)];
      }
      return (mockDb.lessonReviews || []).find(item => item.lesson_id === id);
    };

    if (req.user.isMock) {
      reviewData = getMockReview(lessonId);
    } else {
      // Cloud Supabase Mode
      const { data, error } = await supabase
        .from('lesson_reviews')
        .select('*')
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (error) {
        console.warn('lesson_reviews read error, falling back to mockDb:', error.message);
      }
      reviewData = data || getMockReview(lessonId);
    }

    if (!reviewData) {
      return res.status(404).json({ error: 'Không tìm thấy dữ liệu ôn tập cho bài này.' });
    }

    // Thực hiện thuật toán Fisher-Yates shuffle (tráo ngẫu nhiên tuyệt đối) động ở backend
    const shuffleArray = (arr) => {
      if (!Array.isArray(arr)) return [];
      const newArr = [...arr];
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    };

    // Dạng 1: Dịch câu hai chiều (Trả về toàn bộ 80 câu đã tráo ngẫu nhiên)
    const translationsPool = reviewData.translations || [];
    const jaToVi = shuffleArray(translationsPool.filter(t => t.direction === 'ja-to-vi'));
    const viToJa = shuffleArray(translationsPool.filter(t => t.direction === 'vi-to-ja'));
    const selectedTranslations = shuffleArray([...jaToVi, ...viToJa]);

    // Dạng 2: Hoàn thiện hội thoại (Trả về toàn bộ 40 đoạn đã tráo ngẫu nhiên) và tráo ngẫu nhiên đáp án A, B, C, D
    const selectedDialogues = shuffleArray(reviewData.dialogues || []);
    const shuffledDialogues = selectedDialogues.map(d => {
      if (!d.blanks) return d;
      const shuffledBlanks = {};
      Object.keys(d.blanks).forEach(bKey => {
        const b = d.blanks[bKey];
        shuffledBlanks[bKey] = {
          ...b,
          options: shuffleArray(b.options || [])
        };
      });
      return { ...d, blanks: shuffledBlanks };
    });

    // Dạng 3: Nghe hiểu đoạn văn/đối thoại dài (Trả về toàn bộ 40 bài nghe đã tráo ngẫu nhiên) và tráo ngẫu nhiên đáp án
    const selectedListenings = shuffleArray(reviewData.listenings || []);
    const shuffledListenings = selectedListenings.map(l => {
      if (!Array.isArray(l.questions)) return l;
      const shuffledQuestions = l.questions.map(q => {
        if (!Array.isArray(q.opts)) return q;
        return {
          ...q,
          opts: shuffleArray(q.opts)
        };
      });
      return { ...l, questions: shuffledQuestions };
    });

    // Dạng 4: Nghe viết chính tả (Trả về toàn bộ 40 câu đã tráo ngẫu nhiên)
    const selectedDictations = shuffleArray(reviewData.dictations || []);

    res.json({
      lesson_id: lessonId,
      translations: selectedTranslations,
      dialogues: shuffledDialogues,
      listenings: shuffledListenings,
      dictations: selectedDictations
    });
  } catch (error) {
    console.error('Error fetching lesson reviews:', error);
    res.status(500).json({ error: error.message || error, details: error });
  }
});

/**
 * GET /api/user/reviews/combined
 * Fetch all available lesson reviews aggregated, filterable by level (N5: 1-25, N4: 26-50) and course (default 'minna')
 */
router.get('/reviews/combined', async (req, res) => {
  try {
    const level = req.query.level || 'N5';
    const course = req.query.course || 'minna';
    let reviewData = null;

    // Load independent combined review bank (tách biệt hoàn toàn khỏi ôn tập theo bài)
    if (req.user.isMock) {
      reviewData = (mockDb.combinedReviews && (mockDb.combinedReviews[`${course}_${level.toLowerCase()}`] || mockDb.combinedReviews.minna_n5)) || mockDb.combinedReviews;
    } else {
      const { data, error } = await supabase
        .from('combined_reviews')
        .select('*')
        .eq('course', course)
        .eq('level', level)
        .maybeSingle();

      if (error) {
        console.warn('combined_reviews read error, falling back to mockDb:', error.message);
      }
      reviewData = data || (mockDb.combinedReviews && (mockDb.combinedReviews[`${course}_${level.toLowerCase()}`] || mockDb.combinedReviews.minna_n5)) || mockDb.combinedReviews;
    }

    if (!reviewData) {
      return res.status(404).json({ error: 'Không tìm thấy dữ liệu ôn tập tổng hợp.' });
    }

    // Extract independent arrays
    const combinedTranslations = reviewData.translations || reviewData.type1_translation || [];
    const combinedDialogues = reviewData.dialogues || reviewData.type2_fill_blank || [];
    const combinedListenings = reviewData.listenings || reviewData.type3_listening || [];
    const combinedDictations = reviewData.dictations || reviewData.type4_dictation || [];

    // Fisher-Yates shuffle helper
    const shuffleArray = (arr) => {
      if (!Array.isArray(arr)) return [];
      const newArr = [...arr];
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    };

    // Dạng 1 translations pool direction shuffle
    const jaToVi = shuffleArray(combinedTranslations.filter(t => t.direction === 'ja-to-vi'));
    const viToJa = shuffleArray(combinedTranslations.filter(t => t.direction === 'vi-to-ja'));
    const selectedTranslations = shuffleArray([...jaToVi, ...viToJa]);

    // Tráo ngẫu nhiên đáp án A, B, C, D cho Dialogues
    const shuffledDialogues = shuffleArray(combinedDialogues).map(d => {
      if (!d.blanks) return d;
      const shuffledBlanks = {};
      Object.keys(d.blanks).forEach(bKey => {
        const b = d.blanks[bKey];
        shuffledBlanks[bKey] = {
          ...b,
          options: shuffleArray(b.options || [])
        };
      });
      return { ...d, blanks: shuffledBlanks };
    });

    // Tráo ngẫu nhiên đáp án cho Listenings
    const shuffledListenings = shuffleArray(combinedListenings).map(l => {
      if (!Array.isArray(l.questions)) return l;
      const shuffledQuestions = l.questions.map(q => {
        if (!Array.isArray(q.opts)) return q;
        return {
          ...q,
          opts: shuffleArray(q.opts)
        };
      });
      return { ...l, questions: shuffledQuestions };
    });

    res.json({
      translations: selectedTranslations,
      dialogues: shuffledDialogues,
      listenings: shuffledListenings,
      dictations: shuffleArray(combinedDictations)
    });
  } catch (error) {
    console.error('Error fetching combined reviews:', error);
    res.status(500).json({ error: error.message || error, details: error });
  }
});



// --- HELPER FUNCTIONS FOR LOCAL MOCK CUSTOM ITEMS ---
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
    const userId = req.user ? req.user.id : 'demo_user';
    const { course, range_start, range_end, score, total_questions, time_spent, questions_data } = req.body || {};

    if (!course || range_start === undefined || range_end === undefined || score === undefined || total_questions === undefined || time_spent === undefined || !questions_data) {
      return res.status(400).json({ error: 'Missing required exam results fields' });
    }

    const saveMock = () => {
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
      return newExam.id;
    };

    if (req.user && req.user.isMock) {
      const examId = saveMock();
      return res.json({ message: 'Exam results saved successfully (Mock)', examId });
    }

    try {
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
      return res.json({ message: 'Exam results saved successfully', examId: data.id });
    } catch (sbErr) {
      console.warn('Supabase insert user_exam_results failed, falling back to mock:', sbErr.message);
      const examId = saveMock();
      return res.json({ message: 'Exam results saved successfully (Fallback)', examId });
    }
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
    const userId = req.user ? req.user.id : 'demo_user';
    const { course } = req.query;

    const getMockList = () => {
      const data = readMockExams();
      let list = data.exams || [];
      list = list.filter(e => e.user_id === userId);
      if (course) {
        list = list.filter(e => e.course === course);
      }
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return list;
    };

    if (req.user && req.user.isMock) {
      return res.json(getMockList());
    }

    try {
      let query = supabase
        .from('user_exam_results')
        .select('id, course, range_start, range_end, score, total_questions, time_spent, created_at')
        .eq('user_id', userId);

      if (course) {
        query = query.eq('course', course);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return res.json(data || []);
    } catch (sbErr) {
      console.warn('Supabase fetch user_exam_results failed, falling back to mock:', sbErr.message);
      return res.json(getMockList());
    }
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
    const userId = req.user ? req.user.id : 'demo_user';
    const examId = req.params.id;

    const getMockDetail = () => {
      const data = readMockExams();
      return (data.exams || []).find(e => e.id === examId && e.user_id === userId);
    };

    if (req.user && req.user.isMock) {
      const exam = getMockDetail();
      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }
      return res.json(exam);
    }

    try {
      const { data, error } = await supabase
        .from('user_exam_results')
        .select('*')
        .eq('id', examId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data) return res.json(data);
      const fallbackExam = getMockDetail();
      if (fallbackExam) return res.json(fallbackExam);
      return res.status(404).json({ error: 'Exam not found' });
    } catch (sbErr) {
      console.warn('Supabase fetch exam detail failed, falling back to mock:', sbErr.message);
      const fallbackExam = getMockDetail();
      if (fallbackExam) return res.json(fallbackExam);
      return res.status(404).json({ error: 'Exam not found' });
    }
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

// ----------------------------------------------------
// WRONG EXAM QUESTIONS CLOUD SYNC ENDPOINTS
// ----------------------------------------------------
const wrongExamsFile = path.join(__dirname, '../db/wrong_exam_questions.json');

function readMockWrongExamQuestions() {
  try {
    if (!fs.existsSync(wrongExamsFile)) {
      fs.writeFileSync(wrongExamsFile, JSON.stringify({ wrong_questions: [] }, null, 2), 'utf8');
      return { wrong_questions: [] };
    }
    const content = fs.readFileSync(wrongExamsFile, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading wrong_exam_questions.json:", err);
    return { wrong_questions: [] };
  }
}

function writeMockWrongExamQuestions(data) {
  try {
    fs.writeFileSync(wrongExamsFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing wrong_exam_questions.json:", err);
  }
}

function getQuestionKey(q) {
  if (!q) return 'unknown';
  const lId = q.lesson_id || '0';
  const type = q.item_type || 'unknown';
  const idStr = q.id !== undefined && q.id !== null ? String(q.id) : (q.question_kana || q.question_kanji || q.audio_text_kana || q.context || q.question || '').slice(0, 40);
  return `${lId}:${type}:${idStr}`;
}

/**
 * GET /api/user/exams/wrong-questions/list
 * Fetch list of user's wrong exam questions
 */
router.get('/exams/wrong-questions/list', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'demo_user';
    const data = readMockWrongExamQuestions();
    const list = (data.wrong_questions || []).filter(q => q.user_id === userId);
    res.json(list);
  } catch (error) {
    console.error('Error fetching wrong exam questions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/user/exams/wrong-questions/sync
 * Sync wrong exam questions (Add new wrong ones, remove corrected ones)
 */
router.post('/exams/wrong-questions/sync', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'demo_user';
    const { newWrongQuestions = [], correctedQuestions = [] } = req.body || {};

    const data = readMockWrongExamQuestions();
    if (!data.wrong_questions) data.wrong_questions = [];

    let userWrongList = data.wrong_questions.filter(q => q.user_id === userId);

    // 1. Remove corrected questions
    if (Array.isArray(correctedQuestions) && correctedQuestions.length > 0) {
      const correctedKeys = new Set(correctedQuestions.map(getQuestionKey));
      userWrongList = userWrongList.filter(q => !correctedKeys.has(getQuestionKey(q)));
    }

    // 2. Add new wrong questions (deduplicating by getQuestionKey)
    if (Array.isArray(newWrongQuestions) && newWrongQuestions.length > 0) {
      newWrongQuestions.forEach(nq => {
        const key = getQuestionKey(nq);
        const exists = userWrongList.some(q => getQuestionKey(q) === key);
        if (!exists) {
          userWrongList.unshift({
            ...nq,
            user_id: userId,
            created_at: new Date().toISOString()
          });
        }
      });
    }

    data.wrong_questions = [
      ...data.wrong_questions.filter(q => q.user_id !== userId),
      ...userWrongList
    ];

    writeMockWrongExamQuestions(data);
    res.json({ message: 'Wrong exam questions synced successfully', wrong_questions: userWrongList });
  } catch (error) {
    console.error('Error syncing wrong exam questions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/user/exams/wrong-questions/clear
 * Clear all wrong exam questions for user
 */
router.delete('/exams/wrong-questions/clear', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'demo_user';
    const data = readMockWrongExamQuestions();
    data.wrong_questions = (data.wrong_questions || []).filter(q => q.user_id !== userId);
    writeMockWrongExamQuestions(data);
    res.json({ message: 'Cleared wrong exam questions successfully' });
  } catch (error) {
    console.error('Error clearing wrong exam questions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/user/review-sessions?storage_key=...
 * Fetch user's review session state for a given storage_key
 */
router.get('/review-sessions', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'demo_user';
    const { storage_key } = req.query;
    if (!storage_key) {
      return res.status(400).json({ error: 'storage_key is required' });
    }

    if (!req.user || req.user.isMock) {
      const key = `${userId}:${storage_key}`;
      const session = mockDb.userReviewSessions ? mockDb.userReviewSessions[key] : null;
      return res.json({ session_data: session || null });
    }

    try {
      const { data, error } = await supabase
        .from('user_review_sessions')
        .select('session_data')
        .eq('user_id', userId)
        .eq('storage_key', storage_key)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Warning fetching review session from Supabase:', error.message);
      }

      return res.json({ session_data: data ? data.session_data : null });
    } catch (dbErr) {
      console.warn('Fallback to local session on error:', dbErr.message);
      const key = `${userId}:${storage_key}`;
      const session = mockDb.userReviewSessions ? mockDb.userReviewSessions[key] : null;
      return res.json({ session_data: session || null });
    }
  } catch (error) {
    console.error('Error in review session handler:', error);
    res.json({ session_data: null });
  }
});

/**
 * POST /api/user/review-sessions
 * Save user's review session state for a given storage_key
 */
router.post('/review-sessions', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'demo_user';
    const { storage_key, session_data } = req.body;
    if (!storage_key) {
      return res.status(400).json({ error: 'storage_key is required' });
    }

    if (!req.user || req.user.isMock) {
      if (!mockDb.userReviewSessions) mockDb.userReviewSessions = {};
      const key = `${userId}:${storage_key}`;
      if (!session_data || Object.keys(session_data).length === 0) {
        delete mockDb.userReviewSessions[key];
      } else {
        mockDb.userReviewSessions[key] = session_data;
      }
      return res.json({ message: 'Session saved successfully' });
    }

    try {
      if (!session_data || Object.keys(session_data).length === 0) {
        await supabase
          .from('user_review_sessions')
          .delete()
          .eq('user_id', userId)
          .eq('storage_key', storage_key);
        return res.json({ message: 'Session cleared successfully' });
      }

      const { error } = await supabase
        .from('user_review_sessions')
        .upsert({
          user_id: userId,
          storage_key: storage_key,
          session_data: session_data,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,storage_key' });

      if (error) {
        console.warn('Supabase upsert review session error, saving to in-memory fallback:', error.message);
        if (!mockDb.userReviewSessions) mockDb.userReviewSessions = {};
        mockDb.userReviewSessions[`${userId}:${storage_key}`] = session_data;
        return res.json({ message: 'Session saved to cache (fallback)' });
      }

      return res.json({ message: 'Session saved successfully' });
    } catch (dbErr) {
      console.warn('Supabase review session catch, saving to in-memory fallback:', dbErr.message);
      if (!mockDb.userReviewSessions) mockDb.userReviewSessions = {};
      mockDb.userReviewSessions[`${userId}:${storage_key}`] = session_data;
      return res.json({ message: 'Session saved to cache (fallback)' });
    }
  } catch (error) {
    console.error('Error saving review session:', error);
    // Never fail with 500 to keep UI completely responsive
    res.json({ message: 'Session saved locally' });
  }
});

/**
 * Auto-tracking Helper: Scans database for mastered status and automatically marks tasks as completed
 */
function applyAutoTracking(plan, userId) {
  if (!plan || !plan.days) return plan;

  const userProgress = mockDb.userProgress || {};
  const userReviewSessions = mockDb.userReviewSessions || {};

  for (const day of plan.days) {
    if (!day.tasks) continue;
    let dayCompleted = 0;

    for (const task of day.tasks) {
      const lesson = task.lesson || 1;
      let count = 0;

      if (task.itemType === 'vocabulary') {
        const vocabList = (mockDb.vocabulary || []).filter(v => v.lesson_id === lesson);
        const targetItems = (task.itemIds && task.itemIds.length > 0)
          ? vocabList.filter(v => task.itemIds.includes(v.id))
          : vocabList;
        count = targetItems.filter(v => {
          const s = userProgress[`${userId}:vocabulary:${v.id}`];
          return s === 'mastered' || s === 'learning';
        }).length;
      } else if (task.itemType === 'kanji') {
        const kanjiList = (mockDb.kanji || []).filter(k => k.lesson_id === lesson);
        const targetItems = (task.itemIds && task.itemIds.length > 0)
          ? kanjiList.filter(k => task.itemIds.includes(k.id))
          : kanjiList;
        count = targetItems.filter(k => {
          const s = userProgress[`${userId}:kanji:${k.id}`];
          return s === 'mastered' || s === 'learning';
        }).length;
      } else if (task.itemType === 'grammar') {
        const grammarList = (mockDb.grammar || []).filter(g => g.lesson_id === lesson);
        const targetItems = (task.itemIds && task.itemIds.length > 0)
          ? grammarList.filter(g => task.itemIds.includes(g.id))
          : grammarList;
        count = targetItems.filter(g => {
          const s = userProgress[`${userId}:grammar:${g.id}`];
          return s === 'mastered' || s === 'learning';
        }).length;
      } else if (task.itemType === 'single_review') {
        const key = `${userId}:review_session_lesson_${lesson}`;
        count = userReviewSessions[key] ? 1 : 0;
      } else if (task.itemType === 'cumulative_review') {
        const key = `${userId}:combined_review_level_N5`;
        count = userReviewSessions[key] ? 1 : 0;
      }

      task.currentCount = count;
      const target = task.targetCount || 1;
      task.progressPct = Math.min(100, Math.round((count / target) * 100));

      if (count >= target && target > 0) {
        task.completed = true;
        if (!task.completed_at) {
          task.completed_at = '✓ Tự động ghi nhận';
        }
      }

      if (task.completed) {
        dayCompleted++;
      }
    }

    day.completedCount = dayCompleted;
    day.completionRate = day.plannedCount > 0 ? Math.round((dayCompleted / day.plannedCount) * 100) : 100;
  }

  return plan;
}

/**
 * GET /api/user/study-debt
 * Check yesterday's unfinished debt
 */
router.get('/study-debt', (req, res) => {
  try {
    const userId = req.user.id;
    if (!mockDb.studyPlans) mockDb.studyPlans = {};
    let plan = mockDb.studyPlans[userId];
    if (plan) {
      plan = applyAutoTracking(plan, userId);
    }
    const debt = aiPlannerService.getUnfinishedDebt({ userId, plan });
    return res.json({ success: true, ...debt });
  } catch (err) {
    console.error('Error getting study debt:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/user/replan-debt
 * Rebalance debt over future days while strictly keeping endDate
 */
router.post('/replan-debt', async (req, res) => {
  try {
    const userId = req.user.id;
    if (!mockDb.studyPlans) mockDb.studyPlans = {};
    let plan = mockDb.studyPlans[userId];
    if (!plan) {
      return res.status(400).json({ success: false, error: 'Không tìm thấy kế hoạch để replan.' });
    }

    const updatedPlan = await aiPlannerService.refineStudyPlan({
      currentPlan: plan,
      userComment: 'Học bù nợ bài hôm qua, dời vào các ngày tới',
      startDate: plan.startDate,
      endDate: plan.endDate,
      currentProgress: {}
    });

    mockDb.studyPlans[userId] = updatedPlan;
    savePersistentPlans(mockDb.studyPlans);

    // Scenario 2: Send debt replan push notification
    if (updatedPlan && updatedPlan.days) {
      const todayStr = getLocalDateStr();
      const todayTasks = updatedPlan.days.find(d => d.date === todayStr)?.tasks || [];
      const debtInfo = aiPlannerService.getUnfinishedDebt({ userId, plan });
      const debtCount = debtInfo?.debtItems?.length || 1;
      pushNotificationService.sendDebtReplanNotification(userId, {
        debtCount,
        todayTasks
      }).catch(e => console.warn('[PushNotification] Debt replan push failed:', e.message));
    }

    return res.json({ success: true, plan: updatedPlan, message: 'Đã phân bổ lại bài nợ thành công và giữ nguyên hạn chót!' });
  } catch (err) {
    console.error('Error replanning debt:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/user/study-plan
 * Get active study plan with auto-tracking applied (auto-upgrade old plan if missing granular scopeDetails)
 */
router.get('/study-plan', async (req, res) => {
  try {
    const userId = req.user.id;
    if (!mockDb.studyPlans) mockDb.studyPlans = {};
    if (!mockDb.studyPlans[userId]) {
      const persisted = loadPersistentPlans();
      if (persisted[userId]) mockDb.studyPlans[userId] = persisted[userId];
    }

    let plan = mockDb.studyPlans[userId];

    // Restore from Supabase target_plans if online and memory was cleared by cloud sleep
    if (!plan && !req.user.isMock) {
      try {
        const { data: tp } = await supabase
          .from('target_plans')
          .select('start_date, end_date')
          .eq('user_id', userId)
          .maybeSingle();
        if (tp && tp.start_date && tp.end_date) {
          plan = aiPlannerService.generateAlgorithmicPlan({
            startDate: tp.start_date,
            endDate: tp.end_date,
            targetLevel: 'All',
            currentLesson: 1
          });
          mockDb.studyPlans[userId] = plan;
          savePersistentPlans(mockDb.studyPlans);
        }
      } catch (e) {
        console.warn('[StudyPlan] Could not restore from Supabase target_plans:', e.message);
      }
    }

    // Check if plan is missing or was created with old format
    const maxLessonCovered = plan?.days ? Math.max(0, ...plan.days.flatMap(d => (d.tasks || []).map(t => t.lesson || 0))) : 0;
    const isOldPlan = !plan || !plan.days || !plan.days[0]?.dayRationale ||
      maxLessonCovered < 50 ||
      !plan.isBalancedPacing ||
      plan.days.some(d => d.isDedicatedPracticeDay || d.tasks?.some(t => !t.scopeDetails || t.title.includes('25-35') || (t.itemType === 'vocabulary' && t.estimatedMinutes < 50) || t.title.includes('Hoàn thành lý thuyết'))) ||
      plan.workloadRationale?.includes('1 Ngày Thực Hành Chuyên Biệt');

    if (isOldPlan) {
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(today.getDate() + 30);
      const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      plan = aiPlannerService.generateAlgorithmicPlan({
        startDate: plan?.startDate || fmt(today),
        endDate: plan?.endDate || fmt(nextMonth),
        targetLevel: 'All',
        currentLesson: 1
      });
      mockDb.studyPlans[userId] = plan;
      savePersistentPlans(mockDb.studyPlans);
    }

    // Synchronize Supabase user_progress before auto-tracking
    await syncUserProgressFromSupabase(userId);

    // Apply auto-tracking from database
    plan = applyAutoTracking(plan, userId);

    return res.json({ success: true, plan });
  } catch (err) {
    console.error('Error fetching study plan:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/user/study-plan
 * Save or update active study plan
 */
router.post('/study-plan', async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan } = req.body;
    if (!plan || !plan.startDate || !plan.endDate) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin kế hoạch (startDate, endDate).' });
    }
    if (!mockDb.studyPlans) mockDb.studyPlans = {};
    mockDb.studyPlans[userId] = plan;
    savePersistentPlans(mockDb.studyPlans);

    // If online with Supabase, sync target_plans table as well
    if (!req.user.isMock && plan.startDate && plan.endDate) {
      try {
        await supabase.from('target_plans').upsert({
          user_id: userId,
          start_date: plan.startDate,
          end_date: plan.endDate,
          vocabulary_target: plan.totalLessons ? plan.totalLessons * 40 : 2000,
          kanji_target: plan.totalLessons ? plan.totalLessons * 10 : 500,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      } catch (e) {
        console.warn('[StudyPlan] Supabase target_plans sync warning:', e.message);
      }
    }

    return res.json({ success: true, message: 'Đã lưu kế hoạch học tập thành công', plan });
  } catch (err) {
    console.error('Error saving study plan:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/user/daily-tasks/schedule
 * Update task due_time and completed status
 */
router.post('/daily-tasks/schedule', async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId, due_time, completed, date } = req.body;
    if (!taskId) {
      return res.status(400).json({ success: false, error: 'taskId is required' });
    }

    if (!mockDb.studyPlans) mockDb.studyPlans = {};
    if (!mockDb.studyPlans[userId]) {
      const persisted = loadPersistentPlans();
      if (persisted[userId]) mockDb.studyPlans[userId] = persisted[userId];
    }
    const plan = mockDb.studyPlans[userId];
    if (plan && plan.days) {
      for (const day of plan.days) {
        if (!date || day.date === date) {
          const task = day.tasks ? day.tasks.find(t => t.id === taskId) : null;
          if (task) {
            if (due_time !== undefined) task.due_time = due_time;
            if (completed !== undefined) {
              task.completed = completed;
              if (completed) {
                task.completed_at = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                const dayTasks = day.tasks || [];
                const completedCount = dayTasks.filter(t => t.completed).length;
                const totalCount = dayTasks.length;
                const isAllDoneToday = completedCount >= totalCount && totalCount > 0;

                // Scenario 5: Task Completed Notification
                pushNotificationService.sendTaskCompletedNotification(userId, {
                  completedTask: task,
                  isAllDoneToday,
                  completedCount,
                  totalCount
                }).catch(e => console.warn('[PushNotification] Task completed push failed:', e.message));

                // Scenario 8: Milestone Achievement (Lesson 25 or Lesson 50)
                if (task.lesson === 25 && isAllDoneToday) {
                  pushNotificationService.sendMilestoneNotification(userId, {
                    milestoneTitle: '🏆 Tốt nghiệp Minna no Nihongo N5 (Bài 25)!',
                    milestoneMessage: 'Chúc mừng bạn đã hoàn thành xuất sắc toàn bộ 25 bài N5! Hãy sẵn sàng bứt phá lên N4 nhé!'
                  }).catch(e => console.warn('[PushNotification] Milestone push failed:', e.message));
                } else if (task.lesson === 50 && isAllDoneToday) {
                  pushNotificationService.sendMilestoneNotification(userId, {
                    milestoneTitle: '🏆 Chinh phục toàn bộ 50 bài Minna no Nihongo (N4)!',
                    milestoneMessage: 'Kỳ tích! Bạn đã làm chủ hoàn toàn 50 bài Minna no Nihongo N5 và N4. Bạn đã sẵn sàng tự tin bước vào kỳ thi JLPT!'
                  }).catch(e => console.warn('[PushNotification] Milestone push failed:', e.message));
                }
              } else {
                delete task.completed_at;
              }
            }
            day.completedCount = day.tasks.filter(t => t.completed).length;
            break;
          }
        }
      }
      savePersistentPlans(mockDb.studyPlans);
    }

    return res.json({ success: true, message: 'Đã cập nhật nhiệm vụ thành công' });
  } catch (err) {
    console.error('Error scheduling daily task:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/user/check-daily-notification
 * Check and trigger scheduled / event-based push notifications:
 * 1. Scenario 1: New Day (with or without debt)
 * 2. Scenario 6: Pre-due Reminder (15-30 mins before due_time)
 * 3. Scenario 4: Overdue Reminder (past due_time)
 * 4. Scenario 7: Streak Alert (evening 20:30 - 23:59 if no task done today)
 */
router.post('/check-daily-notification', async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, localTimeStr } = req.body;
    const todayStr = date || getLocalDateStr();

    if (!mockDb.studyPlans) mockDb.studyPlans = {};
    if (!mockDb.studyPlans[userId]) {
      const persisted = loadPersistentPlans();
      if (persisted[userId]) mockDb.studyPlans[userId] = persisted[userId];
    }
    const plan = mockDb.studyPlans[userId];
    if (!plan || !Array.isArray(plan.days)) {
      return res.json({ success: true, message: 'No active plan found' });
    }

    let modified = false;
    const todayDay = plan.days.find(d => d.date === todayStr);
    const todayTasks = todayDay?.tasks || [];

    // 1. Scenario 1: Qua ngày mới (New Day Notification)
    if (plan.lastNewDayNotifiedDate !== todayStr) {
      const debtInfo = aiPlannerService.getUnfinishedDebt({ userId, plan });
      const yesterdayDebtItems = debtInfo?.debtItems || [];

      pushNotificationService.sendNewDayNotification(userId, {
        yesterdayDebtItems,
        todayTasks
      }).catch(e => console.warn('[PushNotification] New day push failed:', e.message));

      plan.lastNewDayNotifiedDate = todayStr;
      modified = true;
    }

    // Determine current time in minutes
    let currentHours, currentMinutes;
    if (localTimeStr && localTimeStr.includes(':')) {
      const parts = localTimeStr.split(':');
      currentHours = parseInt(parts[0], 10);
      currentMinutes = parseInt(parts[1], 10);
    } else {
      const now = new Date();
      currentHours = now.getHours();
      currentMinutes = now.getMinutes();
    }
    const totalCurrentMinutes = currentHours * 60 + currentMinutes;

    // Check tasks for Pre-due (Scenario 6) and Overdue (Scenario 4)
    for (const task of todayTasks) {
      if (task.completed || !task.due_time || !task.due_time.includes(':')) continue;

      const [dHours, dMins] = task.due_time.split(':').map(Number);
      const totalDueMinutes = dHours * 60 + dMins;
      const diffMinutes = totalDueMinutes - totalCurrentMinutes;

      // Scenario 6: Pre-due (15 to 30 mins before deadline)
      if (diffMinutes > 0 && diffMinutes <= 30 && !task.preDueNotified) {
        pushNotificationService.sendPreDueReminderNotification(userId, {
          task,
          minutesLeft: diffMinutes
        }).catch(e => console.warn('[PushNotification] Pre-due push failed:', e.message));

        task.preDueNotified = true;
        modified = true;
      }

      // Scenario 4: Overdue (past deadline)
      if (diffMinutes < 0 && !task.overdueNotified) {
        pushNotificationService.sendOverdueReminderNotification(userId, {
          task
        }).catch(e => console.warn('[PushNotification] Overdue push failed:', e.message));

        task.overdueNotified = true;
        modified = true;
      }
    }

    // Scenario 7: Streak Alert (between 20:30 and 23:59 if no tasks done today)
    if (todayDay && totalCurrentMinutes >= 20 * 60 + 30 && totalCurrentMinutes <= 23 * 60 + 59) {
      const completedCount = (todayDay.tasks || []).filter(t => t.completed).length;
      if (completedCount === 0 && (todayDay.tasks || []).length > 0 && !todayDay.streakAlertNotified) {
        pushNotificationService.sendStreakAlertNotification(userId, {
          currentStreak: 3,
          remainingTasksCount: todayDay.tasks.length
        }).catch(e => console.warn('[PushNotification] Streak alert push failed:', e.message));

        todayDay.streakAlertNotified = true;
        modified = true;
      }
    }

    if (modified) {
      savePersistentPlans(mockDb.studyPlans);
    }

    return res.json({ success: true, message: 'Daily notification check completed', checkedDate: todayStr });
  } catch (err) {
    console.error('Error checking daily notifications:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/user/daily-tasks/rebatch
 * Re-batch daily tasks (e.g. 1 batch or N batches) for vocabulary, kanji, or grammar
 */
router.post('/daily-tasks/rebatch', async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, configs } = req.body;

    if (!mockDb.studyPlans) mockDb.studyPlans = {};
    if (!mockDb.studyPlans[userId]) {
      const persisted = loadPersistentPlans();
      if (persisted[userId]) mockDb.studyPlans[userId] = persisted[userId];
    }

    let plan = mockDb.studyPlans[userId];
    if (!plan || !Array.isArray(plan.days)) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy kế hoạch học tập' });
    }

    const targetDate = date || getLocalDateStr();
    const result = aiPlannerService.rebatchDayTasks({
      plan,
      date: targetDate,
      configs
    });

    // Run auto-tracking so mastered items are immediately updated on new batches
    plan = applyAutoTracking(result.plan, userId);
    mockDb.studyPlans[userId] = plan;
    savePersistentPlans(mockDb.studyPlans);

    const updatedDay = plan.days.find(d => d.date === targetDate);

    return res.json({
      success: true,
      message: 'Đã phân chia lại công việc thành công',
      updatedDay,
      plan
    });
  } catch (err) {
    console.error('Error rebatching daily tasks:', err);
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/user/daily-tasks/auto-allocate-slots
 * Auto-allocate daily tasks into 3 time slots (8-12h, 12-18h, 18-22h overflow)
 */
router.post('/daily-tasks/auto-allocate-slots', async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, timeSlots } = req.body;

    if (!mockDb.studyPlans) mockDb.studyPlans = {};
    if (!mockDb.studyPlans[userId]) {
      const persisted = loadPersistentPlans();
      if (persisted[userId]) mockDb.studyPlans[userId] = persisted[userId];
    }

    let plan = mockDb.studyPlans[userId];
    if (!plan || !Array.isArray(plan.days)) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy kế hoạch học tập' });
    }

    const targetDate = date || getLocalDateStr();
    const result = aiPlannerService.autoAllocateDailyTimeSlots({
      plan,
      date: targetDate,
      timeSlots: timeSlots || {},
      userId
    });

    plan = applyAutoTracking(result.plan, userId);
    mockDb.studyPlans[userId] = plan;
    savePersistentPlans(mockDb.studyPlans);

    const updatedDay = plan.days.find(d => d.date === targetDate);

    return res.json({
      success: true,
      message: 'AI đã tự động phân bổ công việc theo các mốc thời gian rảnh',
      updatedDay,
      plan,
      configs: result.configs
    });
  } catch (err) {
    console.error('Error auto-allocating time slots:', err);
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/user/study-overview
 * Overview of completed knowledge, current position, Pace status, and Milestones
 */
router.get('/study-overview', async (req, res) => {
  try {
    const userId = req.user.id;
    if (!mockDb.studyPlans) mockDb.studyPlans = {};
    if (!mockDb.studyPlans[userId]) {
      const persisted = loadPersistentPlans();
      if (persisted[userId]) mockDb.studyPlans[userId] = persisted[userId];
    }

    // Sync Supabase progress before computing overview
    await syncUserProgressFromSupabase(userId);

    const plan = mockDb.studyPlans[userId];

    const vocabList = mockDb.vocabulary || [];
    const kanjiList = mockDb.kanji || [];
    const grammarList = mockDb.grammar || [];
    const progressKeys = Object.keys(mockDb.userProgress || {}).filter(k => k.startsWith(`${userId}:`));

    const masteredVocab = progressKeys.filter(k => k.includes(':vocabulary:') && mockDb.userProgress[k] === 'mastered').length;
    const masteredKanji = progressKeys.filter(k => k.includes(':kanji:') && mockDb.userProgress[k] === 'mastered').length;
    const masteredGrammar = progressKeys.filter(k => k.includes(':grammar:') && mockDb.userProgress[k] === 'mastered').length;

    let currentLesson = 1;
    let todayLessonsDetails = [];
    if (plan && plan.days) {
      const todayStr = getLocalDateStr();
      const currentDay = plan.days.find(d => d.date === todayStr) || plan.days[0];
      if (currentDay && currentDay.tasks && currentDay.tasks.length > 0) {
        currentLesson = currentDay.tasks[0].lesson || 1;
        const lessonIds = [...new Set(currentDay.tasks.map(t => t.lesson).filter(Boolean))];
        todayLessonsDetails = lessonIds.map(lessonId => {
          const counts = aiPlannerService.getLessonCounts(lessonId);
          const tasksForLesson = currentDay.tasks.filter(t => t.lesson === lessonId);
          const isPractice = currentDay.isPracticeDay || tasksForLesson.some(t => t.itemType === 'single_review' || t.itemType === 'cumulative_review' || t.type === 'practice');

          return {
            lesson: lessonId,
            title: `Bài ${lessonId}: Minna no Nihongo`,
            vocabCount: counts.vocabCount,
            vocabScope: counts.vocabScope,
            kanjiCount: counts.kanjiCount,
            kanjiScope: counts.kanjiScope,
            kanjiChars: counts.kanjiChars,
            grammarCount: counts.grammarCount,
            grammarScope: counts.grammarScope,
            grammarTitlesList: counts.grammarTitlesList,
            firstVocab: counts.firstVocab,
            lastVocab: counts.lastVocab,
            isPracticeDay: isPractice,
            tasksToday: tasksForLesson.map(t => ({
              id: t.id,
              type: t.itemType || t.type,
              title: t.title,
              scopeDetails: t.scopeDetails || t.scope,
              estimatedMinutes: t.estimatedMinutes,
              due_time: t.due_time,
              completed: t.completed
            }))
          };
        });
      }
    }

    if (todayLessonsDetails.length === 0) {
      const counts = aiPlannerService.getLessonCounts(currentLesson);
      todayLessonsDetails = [{
        lesson: currentLesson,
        title: `Bài ${currentLesson}: Minna no Nihongo`,
        vocabCount: counts.vocabCount,
        vocabScope: counts.vocabScope,
        kanjiCount: counts.kanjiCount,
        kanjiScope: counts.kanjiScope,
        kanjiChars: counts.kanjiChars,
        grammarCount: counts.grammarCount,
        grammarScope: counts.grammarScope,
        grammarTitlesList: counts.grammarTitlesList,
        firstVocab: counts.firstVocab,
        lastVocab: counts.lastVocab,
        isPracticeDay: false,
        tasksToday: []
      }];
    }

    const startDate = plan?.originalStartDate || plan?.startDate || getLocalDateStr();
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);
    const endDate = plan?.endDate || getLocalDateStr(nextMonth);

    const completedLessonCount = Math.max(0, currentLesson - 1, plan?.completedLessonsCount || 0);

    const pace = aiPlannerService.calculatePaceDeviation({
      startDate,
      endDate,
      totalLessons: 50,
      completedLessons: completedLessonCount,
      currentProgress: { currentLesson, masteredVocab, masteredGrammar, masteredKanji }
    });

    const milestones = [
      {
        id: 'm1',
        title: 'N5 Cơ bản',
        lessons: 'Bài 1 - 10',
        targetLessons: 10,
        completedLessons: Math.min(10, Math.max(0, completedLessonCount)),
        percentage: Math.min(100, Math.round((Math.min(10, Math.max(0, completedLessonCount)) / 10) * 100)),
        status: completedLessonCount >= 10 ? 'completed' : (completedLessonCount >= 1 || currentLesson >= 1 ? 'in_progress' : 'locked')
      },
      {
        id: 'm2',
        title: 'N5 Nâng cao',
        lessons: 'Bài 11 - 25',
        targetLessons: 15,
        completedLessons: Math.min(15, Math.max(0, completedLessonCount - 10)),
        percentage: completedLessonCount < 10 ? 0 : Math.min(100, Math.round((Math.min(15, Math.max(0, completedLessonCount - 10)) / 15) * 100)),
        status: completedLessonCount >= 25 ? 'completed' : (completedLessonCount >= 11 || currentLesson >= 11 ? 'in_progress' : 'locked')
      },
      {
        id: 'm3',
        title: 'N4 Khởi động',
        lessons: 'Bài 26 - 37',
        targetLessons: 12,
        completedLessons: Math.min(12, Math.max(0, completedLessonCount - 25)),
        percentage: completedLessonCount < 25 ? 0 : Math.min(100, Math.round((Math.min(12, Math.max(0, completedLessonCount - 25)) / 12) * 100)),
        status: completedLessonCount >= 37 ? 'completed' : (completedLessonCount >= 26 || currentLesson >= 26 ? 'in_progress' : 'locked')
      },
      {
        id: 'm4',
        title: 'N4 Về đích',
        lessons: 'Bài 38 - 50',
        targetLessons: 13,
        completedLessons: Math.min(13, Math.max(0, completedLessonCount - 37)),
        percentage: completedLessonCount < 37 ? 0 : Math.min(100, Math.round((Math.min(13, Math.max(0, completedLessonCount - 37)) / 13) * 100)),
        status: completedLessonCount >= 50 ? 'completed' : (completedLessonCount >= 38 || currentLesson >= 38 ? 'in_progress' : 'locked')
      }
    ];

    return res.json({
      success: true,
      overview: {
        totalVocab: vocabList.length || 1500,
        masteredVocab,
        vocabPercentage: vocabList.length ? parseFloat(((masteredVocab / vocabList.length) * 100).toFixed(1)) : 0,
        totalKanji: kanjiList.length || 255,
        masteredKanji,
        kanjiPercentage: kanjiList.length ? parseFloat(((masteredKanji / kanjiList.length) * 100).toFixed(1)) : 0,
        totalGrammar: grammarList.length || 204,
        masteredGrammar,
        grammarPercentage: grammarList.length ? parseFloat(((masteredGrammar / grammarList.length) * 100).toFixed(1)) : 0,
        totalLessons: 50,
        currentLesson
      },
      current_position: {
        lesson: currentLesson,
        title: `Bài ${currentLesson}: Minna no Nihongo`,
        progressRatio: parseFloat(((currentLesson / 50) * 100).toFixed(1))
      },
      pace,
      milestones,
      todayLessonsDetails,
      planMetadata: {
        startDate,
        endDate,
        totalDays: pace.totalDays,
        daysRemaining: pace.daysRemaining
      }
    });
  } catch (err) {
    console.error('Error fetching study overview:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/user/daily-history
 * Daily History Overview for progress tracking and detail inspection
 */
router.get('/daily-history', async (req, res) => {
  try {
    const userId = req.user.id;
    if (!mockDb.studyPlans) mockDb.studyPlans = {};
    let plan = mockDb.studyPlans[userId];

    const isOldPlan = !plan || !plan.days || !plan.days[0]?.dayRationale || !plan.isBalancedPacing || plan.days.some(d => d.tasks?.some(t => !t.scopeDetails || t.title.includes('25-35') || (t.itemType === 'vocabulary' && t.estimatedMinutes < 50) || t.title.includes('Hoàn thành lý thuyết')));
    if (isOldPlan) {
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(today.getDate() + 30);
      const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      plan = aiPlannerService.generateAlgorithmicPlan({
        startDate: plan?.startDate || fmt(today),
        endDate: plan?.endDate || fmt(nextMonth),
        targetLevel: plan?.targetLevel || 'All',
        currentLesson: 1
      });
      mockDb.studyPlans[userId] = plan;
    }

    plan = applyAutoTracking(plan, userId);

    const todayStr = getLocalDateStr();

    const allDays = [
      ...(plan.archivedPastDays || []),
      ...(plan.days || [])
    ];

    const history = allDays.map((day) => {
      const planned = day.plannedCount || (day.tasks ? day.tasks.length : 0);
      const completed = day.completedCount || (day.tasks ? day.tasks.filter(t => t.completed).length : 0);
      const completionRate = planned > 0 ? Math.round((completed / planned) * 100) : 100;

      let pace_status = 'on_track';
      let pace_label = 'Đạt 100% 🟢';

      const isPast = day.date < todayStr;
      const isToday = day.date === todayStr;

      if (isPast) {
        if (completionRate >= 120) {
          pace_status = 'ahead';
          pace_label = `Vượt ${completionRate}% 🚀`;
        } else if (completionRate >= 100) {
          pace_status = 'on_track';
          pace_label = 'Hoàn thành 100% 🟢';
        } else if (completionRate >= 60) {
          pace_status = 'behind';
          pace_label = `Chậm nhẹ (${completionRate}%) ⚠️`;
        } else {
          pace_status = 'behind';
          pace_label = `Chậm trễ (${completionRate}%) ⚠️`;
        }
      } else if (isToday) {
        if (completionRate >= 100) {
          pace_status = 'on_track';
          pace_label = 'Đã hoàn thành hôm nay 🟢';
        } else {
          pace_status = 'on_track';
          pace_label = `Đang học hôm nay (${completionRate}%) ⚡`;
        }
      } else {
        pace_status = 'scheduled';
        pace_label = 'Sắp tới 📅';
      }

      return {
        date: day.date,
        dayIndex: day.dayIndex,
        isBufferDay: day.isBufferDay,
        isPracticeDay: day.isDedicatedPracticeDay,
        planned_count: planned,
        completed_count: completed,
        completion_rate: completionRate,
        pace_status,
        pace_label,
        dayRationale: day.dayRationale,
        workloadPoints: day.workloadPoints,
        tasks_detail: day.tasks || []
      };
    });

    return res.json({ success: true, history });
  } catch (err) {
    console.error('Error fetching daily history:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/user/vapid-public-key
 */
router.get('/vapid-public-key', (req, res) => {
  try {
    const key = pushNotificationService.getVapidPublicKey();
    return res.json({ success: true, publicKey: key });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/user/push-subscription-status
 */
router.get('/push-subscription-status', (req, res) => {
  try {
    const userId = req.user.id;
    const status = pushNotificationService.getSubscriptionStatus(userId);
    return res.json({ success: true, ...status });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/user/push-subscription
 */
router.post('/push-subscription', (req, res) => {
  try {
    const userId = req.user.id;
    const { subscription, deviceName } = req.body;
    if (!subscription) {
      return res.status(400).json({ success: false, error: 'Subscription data required' });
    }
    const saved = pushNotificationService.saveSubscription(userId, subscription, deviceName);
    return res.json({ success: true, message: 'Đã lưu token thông báo cho thiết bị', data: saved });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/user/send-test-push
 */
router.post('/send-test-push', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pushNotificationService.sendTestNotification(userId);
    return res.json({ success: true, message: 'Đã gửi thông báo thử nghiệm thành công!', result });
  } catch (err) {
    console.error('Error sending test push:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/user/send-study-plan-notification
 */
router.post('/send-study-plan-notification', async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStr = getLocalDateStr(new Date());
    let todayTasks = [];
    let userPlan = mockDb.studyPlans ? mockDb.studyPlans[userId] : null;

    if (!userPlan) {
      const allPlans = loadPersistentPlans();
      userPlan = allPlans[userId] || null;
    }

    if (req.body && Array.isArray(req.body.tasks) && req.body.tasks.length > 0) {
      todayTasks = req.body.tasks;
    } else if (userPlan && Array.isArray(userPlan.days)) {
      const todayDay = userPlan.days.find(d => d.date === todayStr);
      if (todayDay && Array.isArray(todayDay.tasks)) {
        todayTasks = todayDay.tasks;
      }
    }

    const result = await pushNotificationService.sendStudyPlanNotification(userId, todayTasks);
    return res.json({ 
      success: true, 
      message: 'Đã gửi thông báo kế hoạch học tập hôm nay về điện thoại thành công!', 
      result 
    });
  } catch (err) {
    console.error('Error sending study plan push:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;



