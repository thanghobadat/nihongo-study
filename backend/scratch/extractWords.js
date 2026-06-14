const mockDb = require('../src/db/mockDb');

// Helper to check if string contains dakuten, handakuten, or yoon characters
const yoonChars = /[ゃゅょャュョ]/;
const dakutenChars = /[がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴばびぶべぼぱぴぷぺぽ]/;
// Note: yoon are small letters, dakuten/handakuten are letters with voicing marks.

const words = [];
mockDb.vocabulary.forEach(v => {
  const text = v.hiragana.trim();
  const romaji = v.romaji.trim();
  const meaning = v.vietnamese_meaning.trim();
  const len = text.length;

  if (len >= 3 && len <= 15) {
    // Check if it's pure kana (hiragana or katakana)
    // RegExp for hiragana and katakana (including small letters, prolonged sound mark ー, etc.)
    const isKana = /^[\u3040-\u309F\u30A0-\u30FF\u30FC\u30FD\u30FE]+$/.test(text);
    if (isKana) {
      const hasYoon = yoonChars.test(text);
      const hasDakuten = dakutenChars.test(text);
      
      words.push({
        id: v.id,
        word: text,
        romaji: romaji,
        meaning: meaning,
        length: len,
        hasYoon,
        hasDakuten
      });
    }
  }
});

console.log('Total fitting Kana words found in mockDb:', words.length);
console.log('Sample of 10 items:', words.slice(0, 10));

// Group by length
const easy = words.filter(w => w.length >= 3 && w.length <= 5);
const medium = words.filter(w => w.length >= 6 && w.length <= 9);
const hard = words.filter(w => w.length >= 10 && w.length <= 15);

console.log(`Easy (3-5): ${easy.length}`);
console.log(`Medium (6-9): ${medium.length}`);
console.log(`Hard (10-15): ${hard.length}`);
