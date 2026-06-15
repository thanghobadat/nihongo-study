const fs = require('fs');
const path = require('path');
const db = require('./mockDb');

const cachePath = path.join(__dirname, 'grammar_romaji_cache.json');
let cache = {};
if (fs.existsSync(cachePath)) {
  try {
    cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch (e) {
    console.error('Error reading cache:', e);
  }
}

// Helper to normalize Romaji
function normalizeRomaji(romaji) {
  if (!romaji) return '';
  return romaji
    .replace(/ā/g, 'aa')
    .replace(/ī/g, 'ii')
    .replace(/ū/g, 'uu')
    .replace(/ē/g, 'ee')
    .replace(/ō/g, 'ou')
    .replace(/Ā/g, 'Aa')
    .replace(/Ī/g, 'Ii')
    .replace(/Ū/g, 'Uu')
    .replace(/Ē/g, 'Ee')
    .replace(/Ō/g, 'Ou')
    .replace(/desu/gi, ' desu')
    .replace(/kudasai/gi, ' kudasai')
    .replace(/imasu/gi, ' imasu')
    .replace(/shimasu/gi, ' shimasu')
    .replace(/arimasen/gi, ' arimasen')
    .replace(/mashita/gi, ' mashita')
    .replace(/  +/g, ' ')
    .trim();
}

async function translateToRomaji(text) {
  if (!text) return '';
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=rm&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data && data[0] && data[0][0] && data[0][0][3]) {
      return normalizeRomaji(data[0][0][3]);
    }
    return '';
  } catch (e) {
    console.error(`Error transliterating "${text}":`, e.message);
    return '';
  }
}

async function run() {
  console.log('Starting Romaji generation...');
  const grammarList = db.grammar || [];
  let updatedCount = 0;
  
  for (const item of grammarList) {
    const ja = item.japanese_example;
    if (!ja) continue;
    
    // Check if cache already has it
    if (cache[ja]) {
      continue;
    }
    
    console.log(`Transliterating [Lesson ${item.lesson_id}]: "${ja}"`);
    const romaji = await translateToRomaji(ja);
    if (romaji) {
      cache[ja] = romaji;
      updatedCount++;
      // Sleep slightly to avoid spamming Google
      await new Promise(r => setTimeout(r, 200));
    }
  }
  
  if (updatedCount > 0) {
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
    console.log(`Saved ${updatedCount} new translations to cache.`);
  } else {
    console.log('All examples already translated in cache.');
  }
}

run().catch(console.error);
