/**
 * Script to update production Supabase database with corrected vocabulary spellings.
 * This runs when the user explicitly requests deploy/sync.
 */
const dbClient = require('../src/db/supabase');
require('dotenv').config();


// Real mapping:
const cleanMap = {
  "おnaまえは": "おなまえは",
  "のーt": "のーと",
  "えんpiつ": "えんぴつ",
  "しゃーpぺんしる": "しゃーぷぺんしる",
  "かsa": "かさ",
  "かban": "かばん",
  "こんpiゅーた": "こんぴゅーた",
  "じどうsha": "じどうしゃ",
  "えいgo": "えいご",
  "にhonご": "にほんご",
  "しょくdoう": "しょくどう",
  "deんわ": "でんわ",
  "niちようび": "にちようび",
  "toります": "とります",
  "niku": "にく",
  "きらい[na]": "きらい[な]",
  "じょうず[na]": "じょうず[な]",
  "おtokoのひと": "おとこのひと",
  "toい": "とおい",
  "ざんgyouします": "ざんぎょうします"
};

async function updateDb() {
  console.log('Starting production database vocabulary update...');
  
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('placeholder')) {
    console.log('Running in local mock mode, skipping database update.');
    return;
  }

  let successCount = 0;
  for (const [target, replacement] of Object.entries(cleanMap)) {
    try {
      // Find rows with the target spelling in the 'vocabulary' table
      const { data, error } = await dbClient
        .from('vocabulary')
        .update({ hiragana: replacement })
        .eq('hiragana', target)
        .select();

      if (error) {
        console.error(`Error updating '${target}':`, error.message);
      } else if (data && data.length > 0) {
        console.log(`Updated '${target}' to '${replacement}' in ${data.length} rows.`);
        successCount += data.length;
      } else {
        console.log(`No rows found for '${target}'. Already updated?`);
      }
    } catch (err) {
      console.error(`Unexpected error updating '${target}':`, err);
    }
  }

  console.log(`Database update completed. Total updated rows: ${successCount}`);
}

updateDb().catch(console.error);
