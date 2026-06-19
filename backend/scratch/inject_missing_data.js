const fs = require('fs');
const path = require('path');

const mockDbPath = path.join(__dirname, '../src/db/mockDb.js');
const backupPath = path.join(__dirname, 'mockDb_backup.js');
const generatedDataPath = path.join(__dirname, 'mnn_generated_data.json');

function backup() {
  console.log(`Creating backup of mockDb.js to ${backupPath}...`);
  fs.copyFileSync(mockDbPath, backupPath);
  console.log('Backup created successfully.');
}

function inject() {
  if (!fs.existsSync(generatedDataPath)) {
    console.error('Error: mnn_generated_data.json not found!');
    process.exit(1);
  }

  // Load existing database
  const mockDb = require(mockDbPath);
  const existingVocab = [...mockDb.vocabulary];
  console.log(`Current vocabulary count in mockDb.js: ${existingVocab.length}`);

  // Load generated new words
  const generatedData = JSON.parse(fs.readFileSync(generatedDataPath, 'utf8'));
  
  let addedCount = 0;
  
  // Loop through all lessons in the generated file
  for (const lessonKey of Object.keys(generatedData)) {
    const lessonId = parseInt(lessonKey.replace('lesson_', ''));
    const newWords = generatedData[lessonKey];
    console.log(`Processing new words for Lesson ${lessonId} (${newWords.length} words)...`);
    
    const existingHiraganas = new Set(
      existingVocab.filter(v => v.lesson_id === lessonId).map(v => v.hiragana.trim())
    );

    newWords.forEach(word => {
      if (!existingHiraganas.has(word.hiragana.trim())) {
        existingVocab.push({
          id: 0, // temporary
          lesson_id: word.lesson_id,
          hiragana: word.hiragana,
          romaji: word.romaji,
          vietnamese_meaning: word.vietnamese_meaning,
          word_type: word.word_type,
          japanese_example: word.japanese_example,
          example_meaning: word.example_meaning,
          mnemonic_tip: word.mnemonic_tip,
          image_url: word.image_url || ''
        });
        addedCount++;
      }
    });
  }

  console.log(`Merged database. Added ${addedCount} new words.`);
  
  if (addedCount === 0) {
    console.log('No new words to add. Aborting file write.');
    return;
  }

  // Sort vocabulary by lesson_id and then reindex
  existingVocab.sort((a, b) => a.lesson_id - b.lesson_id);
  existingVocab.forEach((word, idx) => {
    word.id = idx + 1;
  });

  console.log(`Total vocabulary items after merge & re-indexing: ${existingVocab.length}`);

  // Read mockDb.js as text to replace only the vocabulary array block
  const originalCode = fs.readFileSync(mockDbPath, 'utf8');
  
  const vocabStartRegex = /const vocabulary\s*=\s*\[/;
  const kanjiStartRegex = /const kanji\s*=\s*\[/;
  
  const startIndex = originalCode.search(vocabStartRegex);
  const endIndex = originalCode.search(kanjiStartRegex);
  
  if (startIndex === -1 || endIndex === -1) {
    console.error('Error: Could not locate markers in mockDb.js. Injection failed.');
    process.exit(1);
  }
  
  const part1 = originalCode.substring(0, startIndex);
  const part2 = originalCode.substring(endIndex);
  
  // Format the vocabulary array
  const formattedVocab = `const vocabulary = ${JSON.stringify(existingVocab, null, 4)};\n\n`;
  
  const newCode = part1 + formattedVocab + part2;
  
  // Save backup before writing
  backup();
  
  console.log(`Writing updated database back to ${mockDbPath}...`);
  fs.writeFileSync(mockDbPath, newCode, 'utf8');
  console.log('Injection completed successfully!');
}

inject();
