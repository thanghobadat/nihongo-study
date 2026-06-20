// Utility to map Hiragana/Katakana words to their corresponding Kanji form.
// Used for Kanji mode in writing/vocabulary practice.

export const HIRAGANA_TO_KANJI: Record<string, string> = {
  // Lesson 1 & General
  'わたし': '私',
  'あなた': 'あなた',
  'あのひと': 'あの人',
  'あのかた': 'あの方',
  'せんせい': '先生',
  'がくせい': '学生',
  'かいしゃいん': '会社員',
  'ぎんこういん': '銀行員',
  'いしゃ': '医者',
  'けんきゅうしゃ': '研究者',
  'だいがく': '大学',
  'びょういん': '病院',
  'だれ': '誰',
  'どなた': '何方',
  'さい': '歳',
  'なんさい': '何歳',
  'おいくつ': 'お幾つ',
  'はい': 'はい',
  'いいえ': 'いいえ',

  // Lesson 2
  'ほん': '本',
  'じしょ': '辞書',
  'ざっし': '雑誌',
  'しんぶん': '新聞',
  'てちょう': '手帳',
  'めいし': '名刺',
  'えんぴつ': '鉛筆',
  'かぎ': '鍵',
  'とけい': '時計',
  'かsa': '傘',
  'かさ': '傘',
  'かばん': '鞄',
  'つくえ': '机',
  'いす': '椅子',
  'おみやげ': 'お土産',
  'えいご': '英語',
  'にほんご': '日本語',

  // Lesson 3
  'きょうしつ': '教室',
  'しょくどう': '食堂',
  'じむしょ': '事務所',
  'かいぎしつ': '会議室',
  'うけつけ': '受付',
  'へ야': '部屋',
  'へya': '部屋',
  'へや': '部屋',
  'といれ': 'トイレ',
  'おてあらい': 'お手洗い',
  'かいだん': '階段',
  'おくに': 'お国',
  'うち': '家',
  'いえ': '家',
  'ぎんこう': '銀行',
  'ゆうびんきょく': '郵便局',
  'としょかん': '図書館',
  'えき': '駅',
  'でんわ': '電話',
  'くつ': '靴',
  'ねくたい': 'ネクタイ',
  'うりば': '売り場',
  'ちか': '地下',
  'かい': '階',
  'なんがい': '何階',
  'えん': '円',
  'いくら': 'いくら',
  'ひゃく': '百',
  'せん': '千',
  'まん': '万',

  // Lesson 4
  'おきます': '起きます',
  'ねます': '寝ます',
  'はたらきます': '働きます',
  'やすみます': '休みます',
  'べんきょうします': '勉強します',
  'おわります': '終わります',
  'いま': '今',
  'じ': '時',
  'ふん': '分',
  'ぷん': '分',
  'はん': '半',
  'なんじ': '何時',
  'なんぷん': '何分',
  'ごぜん': '午前',
  'ごご': '午後',
  'あさ': '朝',
  'ひる': '昼',
  'ばん': '晩',
  'よる': '夜',
  'おとtoi': '一昨日',
  'おととい': '一昨日',
  'きのう': '昨日',
  'きょう': '今日',
  'あした': '明日',
  'あさって': '明後日',
  'けさ': '今朝',
  'こんばん': '今晩',
  'やすみ': '休み',
  'ひるやすみ': '昼休み',
  'まいあさ': '毎朝',
  'まいばん': '毎晩',
  'まいにch': '毎日',
  'まいにち': '毎日',
  'げつようび': '月曜日',
  'かようび': '火曜日',
  'すいようび': '水曜日',
  'もくようび': '木曜日',
  'きんようび': '金曜日',
  'どようび': '土曜日',
  'にchようび': '日曜日',
  'にちようび': '日曜日',
  'なんようび': '何曜日',
  'ばんごう': '番号',
  'なんばん': '何番',

  // Lesson 5
  'いきます': '行きます',
  'きます': '来ます',
  'かえります': '帰ります',
  'がっこう': '学校',
  'ひこうき': '飛行機',
  'ふね': '船',
  'でんしゃ': '電車',
  'chかてつ': '地下鉄',
  'ちかてつ': '地下鉄',
  'しんかんせん': '新幹線',
  'じてんしゃ': '自転車',
  'あるいて': '歩いて',
  'ひと': '人',
  'ともだち': '友達',
  'かれ': '彼',
  'かのじょ': '彼女',
  'かぞく': '家族',
  'ひとり': '一人',
  'ひとりで': '一人で',
  'せんしゅう': '先週',
  'こんしゅう': '今週',
  'らいしゅう': '来週',
  'せんげつ': '先月',
  'こんげつ': '今月',
  'らいげつ': '来月',
  'きょねん': '去年',
  'ことし': '今年',
  'らいねん': '来年',
  'がつ': '月',
  'なんがつ': '何月',
  'ついたち': '1日',
  'ふつか': '2日',
  'みっか': '3日',
  'よっか': '4日',
  'いつか': '5日',
  'むいか': '6日',
  'なのか': '7日',
  'ようか': '8日',
  'ここのか': '9日',
  'とおか': '10日',
  'じゅうよっか': '14日',
  'はつか': '20日',
  'にじゅうよっか': '24日',
  'にち': '日',
  'なにち': '何日',
  'いつ': 'いつ',
  'たんじょうび': '誕生日',

  // Lesson 6
  'たべます': '食べます',
  'みます': '見ます',
  'ききます': '聞きます',
  'よみます': '読みます',
  'かきます': '書きます',
  'かいます': '買います',
  'とります': '撮ります',
  'あいます': '会います',
  'ごはん': 'ご飯',
  'あさごはん': '朝ご飯',
  'ひるごはん': '昼ご飯',
  'ばんごはん': '晩ご飯',
  'たまご': '卵',
  'にく': '肉',
  'さkana': '魚',
  'さかな': '魚',
  'やさい': '野菜',
  'くだもの': '果物',
  'みず': '水',
  'おchya': 'お茶',
  'おちゃ': 'お茶',
  'こうちゃ': '紅茶',
  'ぎゅうにゅう': '牛乳',
  'えいが': '映画',
  'しゅくだい': '宿題',
  'おはなみ': 'お花見',
  'なに': '何',
  'いっしょに': '一緒に',
  'ときどき': '時々',
  'こうえん': '公園',
  'にわ': '庭',
};

/**
 * Converts a Hiragana/Katakana word into its Kanji form using hardcoded lookup
 * and dynamic search in current lesson's Kanji list.
 * Fallbacks to the original hiragana if no Kanji match is found.
 */
export function getKanjiForm(hiragana: string, kanjiItems: any[] = []): string {
  if (!hiragana) return '';

  // 1. Check hardcoded dictionary
  const trimmed = hiragana.trim();
  if (HIRAGANA_TO_KANJI[trimmed]) {
    return HIRAGANA_TO_KANJI[trimmed];
  }

  // 2. Try to resolve using current lesson's Kanji items dynamically
  if (Array.isArray(kanjiItems) && kanjiItems.length > 0) {
    for (const kanji of kanjiItems) {
      if (!kanji.kunyomi || !kanji.character) continue;

      // Kunyomi readings (can be comma-separated, e.g. "い.く, おこな.う")
      const readings = kanji.kunyomi.split(',').map((r: string) => r.trim());

      for (const r of readings) {
        if (r.includes('.')) {
          const [base, tail] = r.split('.');
          
          // Match verbs/adjectives inflection (e.g. starts with base "い" and ends with "ます" / "て" / "た")
          if (trimmed.startsWith(base) && (trimmed.endsWith('ます') || trimmed.endsWith('ました') || trimmed.endsWith('て') || trimmed.endsWith('た') || trimmed.endsWith('ない'))) {
            return kanji.character + trimmed.slice(base.length);
          }
          
          // Match base form (e.g. "いく")
          const fullReading = r.replace('.', '');
          if (trimmed === fullReading) {
            return kanji.character + trimmed.slice(base.length);
          }
        } else {
          // Solid noun readings (e.g. "みず", "いぬ")
          if (trimmed === r) {
            return kanji.character;
          }
          // Partial match for prefixes
          if (trimmed.startsWith(r) && r.length >= 2) {
            return kanji.character + trimmed.slice(r.length);
          }
        }
      }
    }
  }

  // 3. Fallback to original Hiragana/Katakana form
  return hiragana;
}
