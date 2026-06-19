const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeLesson(lessonId) {
  const url = `https://learnjapaneseaz.com/minna-no-nihongo-lesson-${lessonId}-vocabulary.html`;
  
  console.log(`Scraping Lesson ${lessonId} from ${url}...`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const tables = $('table');
  if (tables.length === 0) {
    throw new Error(`No tables found on Lesson ${lessonId} page!`);
  }
  
  // Find vocabulary table (usually the first table or one with rows)
  const vocabTable = tables.first();
  const words = [];
  
  vocabTable.find('tr').each((i, row) => {
    if (i === 0) return; // skip header row
    const cells = $(row).find('td');
    if (cells.length < 4) return; // invalid row
    
    const no = $(cells[0]).text().trim();
    const vocabulary = $(cells[1]).text().trim();
    const kanji = $(cells[2]).text().trim();
    const english = $(cells[3]).text().trim();
    
    if (!vocabulary) return;
    
    words.push({
      no: parseInt(no) || (words.length + 1),
      hiragana: vocabulary,
      kanji: kanji === '-' || kanji === '' ? null : kanji,
      english: english
    });
  });
  
  console.log(`Scraped ${words.length} words for Lesson ${lessonId}`);
  return words;
}

async function main() {
  const args = process.argv.slice(2);
  const lessonsToScrape = args.length > 0 ? args.map(Number) : [4]; // Default to Lesson 4 for testing
  
  const outputFile = path.join(__dirname, 'mnn_raw_data.json');
  let existingData = {};
  
  if (fs.existsSync(outputFile)) {
    try {
      existingData = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    } catch (e) {
      console.warn('Could not parse existing raw data, starting fresh:', e.message);
    }
  }
  
  for (const lessonId of lessonsToScrape) {
    try {
      const words = await scrapeLesson(lessonId);
      existingData[`lesson_${lessonId}`] = words;
    } catch (err) {
      console.error(`Failed to scrape Lesson ${lessonId}:`, err.message);
    }
  }
  
  fs.writeFileSync(outputFile, JSON.stringify(existingData, null, 2), 'utf8');
  console.log(`Saved raw scraped data to ${outputFile}`);
}

main();
