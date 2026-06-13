const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { requireAuth, requireAdmin } = require('../middlewares/auth');

// Protect all admin routes with auth and admin privilege middlewares
router.use(requireAuth, requireAdmin);

/**
 * GET /api/admin/students
 * Fetch all students in the database
 */
router.get('/students', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, display_name, created_at')
      .eq('role', 'user')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching students list:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

/**
 * GET /api/admin/students/:id/progress
 * Get progress summary of a specific student
 */
router.get('/students/:studentId/progress', async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Verify student exists and has 'user' role
    const { data: student, error: sError } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .eq('id', studentId)
      .eq('role', 'user')
      .single();

    if (sError || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get total items counts
    const { count: totalVocab } = await supabase
      .from('vocabulary')
      .select('*', { count: 'exact', head: true });

    const { count: totalKanji } = await supabase
      .from('kanji')
      .select('*', { count: 'exact', head: true });

    // Get student's progress counts
    const { data: progressData, error: pError } = await supabase
      .from('user_progress')
      .select('item_type, status')
      .eq('user_id', studentId);

    if (pError) throw pError;

    const masteredVocab = progressData.filter(p => p.item_type === 'vocabulary' && p.status === 'mastered').length;
    const learningVocab = progressData.filter(p => p.item_type === 'vocabulary' && p.status === 'learning').length;
    const masteredKanji = progressData.filter(p => p.item_type === 'kanji' && p.status === 'mastered').length;
    const learningKanji = progressData.filter(p => p.item_type === 'kanji' && p.status === 'learning').length;

    // Get student's target plan
    const { data: targetPlan } = await supabase
      .from('target_plans')
      .select('*')
      .eq('user_id', studentId)
      .maybeSingle();

    res.json({
      student,
      progress: {
        vocabulary: {
          total: totalVocab || 0,
          mastered: masteredVocab,
          learning: learningVocab,
          not_learned: (totalVocab || 0) - masteredVocab - learningVocab
        },
        kanji: {
          total: totalKanji || 0,
          mastered: masteredKanji,
          learning: learningKanji,
          not_learned: (totalKanji || 0) - masteredKanji - learningKanji
        }
      },
      targetPlan: targetPlan || null
    });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({ error: 'Failed to fetch student progress' });
  }
});

/**
 * POST /api/admin/lessons
 * Create a new lesson
 */
router.post('/lessons', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const { data, error } = await supabase
      .from('lessons')
      .insert({ title, description })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Lesson created successfully', lesson: data });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

/**
 * POST /api/admin/vocabulary
 * Add vocabulary to a lesson
 */
router.post('/vocabulary', async (req, res) => {
  try {
    const { lesson_id, hiragana, romaji, vietnamese_meaning, word_type, japanese_example, example_meaning, mnemonic_tip, image_url } = req.body;

    if (!lesson_id || !hiragana || !romaji || !vietnamese_meaning) {
      return res.status(400).json({ error: 'lesson_id, hiragana, romaji, and vietnamese_meaning are required' });
    }

    const { data, error } = await supabase
      .from('vocabulary')
      .insert({
        lesson_id,
        hiragana,
        romaji,
        vietnamese_meaning,
        word_type,
        japanese_example,
        example_meaning,
        mnemonic_tip,
        image_url
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Vocabulary added successfully', vocabulary: data });
  } catch (error) {
    console.error('Error adding vocabulary:', error);
    res.status(500).json({ error: 'Failed to add vocabulary' });
  }
});

/**
 * PUT /api/admin/vocabulary/:id
 * Edit vocabulary
 */
router.put('/vocabulary/:id', async (req, res) => {
  try {
    const vocabId = req.params.id;
    const updates = req.body;

    const { data, error } = await supabase
      .from('vocabulary')
      .update(updates)
      .eq('id', vocabId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Vocabulary updated successfully', vocabulary: data });
  } catch (error) {
    console.error('Error updating vocabulary:', error);
    res.status(500).json({ error: 'Failed to update vocabulary' });
  }
});

/**
 * DELETE /api/admin/vocabulary/:id
 * Delete vocabulary
 */
router.delete('/vocabulary/:id', async (req, res) => {
  try {
    const vocabId = req.params.id;

    const { error } = await supabase
      .from('vocabulary')
      .delete()
      .eq('id', vocabId);

    if (error) throw error;

    res.json({ message: 'Vocabulary deleted successfully' });
  } catch (error) {
    console.error('Error deleting vocabulary:', error);
    res.status(500).json({ error: 'Failed to delete vocabulary' });
  }
});

/**
 * POST /api/admin/kanji
 * Add Kanji to a lesson
 */
router.post('/kanji', async (req, res) => {
  try {
    const { lesson_id, character, stroke_count, onyomi, kunyomi, sino_vietnamese, vietnamese_meaning, mnemonic_tip, compounds } = req.body;

    if (!lesson_id || !character || !vietnamese_meaning) {
      return res.status(400).json({ error: 'lesson_id, character, and vietnamese_meaning are required' });
    }

    const { data, error } = await supabase
      .from('kanji')
      .insert({
        lesson_id,
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

    res.status(201).json({ message: 'Kanji added successfully', kanji: data });
  } catch (error) {
    console.error('Error adding Kanji:', error);
    res.status(500).json({ error: 'Failed to add Kanji' });
  }
});

/**
 * PUT /api/admin/kanji/:id
 * Edit Kanji
 */
router.put('/kanji/:id', async (req, res) => {
  try {
    const kanjiId = req.params.id;
    const updates = req.body;

    const { data, error } = await supabase
      .from('kanji')
      .update(updates)
      .eq('id', kanjiId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Kanji updated successfully', kanji: data });
  } catch (error) {
    console.error('Error updating Kanji:', error);
    res.status(500).json({ error: 'Failed to update Kanji' });
  }
});

/**
 * DELETE /api/admin/kanji/:id
 * Delete Kanji
 */
router.delete('/kanji/:id', async (req, res) => {
  try {
    const kanjiId = req.params.id;

    const { error } = await supabase
      .from('kanji')
      .delete()
      .eq('id', kanjiId);

    if (error) throw error;

    res.json({ message: 'Kanji deleted successfully' });
  } catch (error) {
    console.error('Error deleting Kanji:', error);
    res.status(500).json({ error: 'Failed to delete Kanji' });
  }
});

/**
 * POST /api/admin/grammar
 * Add Grammar point to a lesson
 */
router.post('/grammar', async (req, res) => {
  try {
    const { lesson_id, title, meaning, structure, vietnamese_explanation, japanese_example, example_meaning, notes } = req.body;

    if (!lesson_id || !title || !meaning) {
      return res.status(400).json({ error: 'lesson_id, title, and meaning are required' });
    }

    const { data, error } = await supabase
      .from('grammar')
      .insert({
        lesson_id,
        title,
        meaning,
        structure,
        vietnamese_explanation,
        japanese_example,
        example_meaning,
        notes
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Grammar point added successfully', grammar: data });
  } catch (error) {
    console.error('Error adding grammar point:', error);
    res.status(500).json({ error: 'Failed to add grammar point' });
  }
});

/**
 * PUT /api/admin/grammar/:id
 * Edit Grammar point
 */
router.put('/grammar/:id', async (req, res) => {
  try {
    const grammarId = req.params.id;
    const updates = req.body;

    const { data, error } = await supabase
      .from('grammar')
      .update(updates)
      .eq('id', grammarId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Grammar point updated successfully', grammar: data });
  } catch (error) {
    console.error('Error updating grammar point:', error);
    res.status(500).json({ error: 'Failed to update grammar point' });
  }
});

/**
 * DELETE /api/admin/grammar/:id
 * Delete Grammar point
 */
router.delete('/grammar/:id', async (req, res) => {
  try {
    const grammarId = req.params.id;

    const { error } = await supabase
      .from('grammar')
      .delete()
      .eq('id', grammarId);

    if (error) throw error;

    res.json({ message: 'Grammar point deleted successfully' });
  } catch (error) {
    console.error('Error deleting grammar point:', error);
    res.status(500).json({ error: 'Failed to delete grammar point' });
  }
});

module.exports = router;
