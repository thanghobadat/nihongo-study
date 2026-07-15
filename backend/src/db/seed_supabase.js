const supabase = require('./supabase');
const mockDb = require('./mockDb');

async function seedTable(tableName, dataList, matchKeys = ['id']) {
  if (!dataList || dataList.length === 0) {
    console.log(`⚠️ No data to seed for table: ${tableName}`);
    return;
  }

  console.log(`🚀 Seeding ${dataList.length} items into table: ${tableName} (Bulk)...`);

  const { error } = await supabase
    .from(tableName)
    .upsert(dataList, { onConflict: matchKeys.join(',') });

  if (error) {
    console.error(`❌ Error seeding table ${tableName}:`, error.message);
    throw error;
  }

  console.log(`✅ Completed seeding table: ${tableName}`);
}

async function runSeed() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
    console.warn('\n========================================================================');
    console.warn('⚠️ WARNING: Using placeholder credentials. Cannot connect to Supabase.');
    console.warn('Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.');
    console.warn('========================================================================\n');
    return;
  }

  try {
    console.log('🏁 Starting Supabase database seeding process...');

    // 1. Seed lessons
    await seedTable('lessons', mockDb.lessons, ['id']);

    // 2. Seed vocabulary
    // Map image_url to empty string if missing
    const vocabData = mockDb.vocabulary.map(v => ({
      id: v.id,
      lesson_id: v.lesson_id,
      hiragana: v.hiragana,
      romaji: v.romaji,
      vietnamese_meaning: v.vietnamese_meaning,
      word_type: v.word_type,
      japanese_example: v.japanese_example,
      example_meaning: v.example_meaning,
      mnemonic_tip: v.mnemonic_tip,
      image_url: v.image_url || '',
      pitch_accent: v.pitch_accent || 0
    }));
    await seedTable('vocabulary', vocabData, ['id']);

    // 3. Seed kanji
    const kanjiData = mockDb.kanji.map(k => ({
      id: k.id,
      lesson_id: k.lesson_id,
      character: k.character,
      stroke_count: k.stroke_count,
      onyomi: k.onyomi,
      kunyomi: k.kunyomi,
      sino_vietnamese: k.sino_vietnamese,
      vietnamese_meaning: k.vietnamese_meaning,
      mnemonic_tip: k.mnemonic_tip,
      compounds: k.compounds
    }));
    await seedTable('kanji', kanjiData, ['id']);

    // 4. Seed grammar
    const grammarData = mockDb.grammar.map(g => ({
      id: g.id,
      lesson_id: g.lesson_id,
      title: g.title,
      meaning: g.meaning,
      structure: g.structure,
      vietnamese_explanation: g.vietnamese_explanation,
      japanese_example: g.japanese_example,
      example_meaning: g.example_meaning,
      romaji_example: g.romaji_example,
      notes: g.notes
    }));
    await seedTable('grammar', grammarData, ['id']);

    // 5. Seed kaiwa_dialog
    const kaiwaData = mockDb.kaiwaDialog.map(d => ({
      id: d.id,
      lesson_id: d.lesson_id,
      speaker: d.speaker,
      japanese: d.japanese,
      romaji: d.romaji,
      vietnamese: d.vietnamese
    }));
    await seedTable('kaiwa_dialog', kaiwaData, ['id']);

    // 6. Seed cando_checks
    const candoData = mockDb.candoChecks.map(c => ({
      id: c.id,
      lesson_id: c.lesson_id,
      text: c.text,
      text_vi: c.text_vi
    }));
    await seedTable('cando_checks', candoData, ['id']);

    // 7. Seed culture_topics
    const cultureData = mockDb.cultureTopics.map(cu => ({
      id: cu.id,
      lesson_id: cu.lesson_id,
      title: cu.title,
      content: cu.content,
      image_url: cu.image_url
    }));
    await seedTable('culture_topics', cultureData, ['id']);

    // 8. Seed lesson_reviews
    const reviewData = mockDb.lessonReviews.map(r => ({
      lesson_id: r.lesson_id,
      translations: r.translations || [],
      dialogues: r.dialogues || [],
      listenings: r.listenings || [],
      dictations: r.dictations || []
    }));
    await seedTable('lesson_reviews', reviewData, ['lesson_id']);

    console.log('\n🎉 Supabase database seeded successfully!');
  } catch (error) {
    console.error('\n❌ Seeding process failed:', error.message);
    throw error;
  }
}

if (require.main === module) {
  runSeed().catch(error => {
    console.error('\n❌ Script execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runSeed };
