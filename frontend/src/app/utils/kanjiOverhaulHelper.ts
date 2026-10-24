// website/frontend/src/app/utils/kanjiOverhaulHelper.ts
import { KanjiItemData, shuffleArray } from './kanjiPracticeHelper';

/**
 * Bản đồ phân rã từ ghép Hán tự N5/N4 sang các chữ Hán cấu thành và âm đọc tương ứng.
 * Phục vụ cơ chế sinh từ bán Kanji lũy tiến (Progressive Kanji).
 */
export const KANJI_COMPOUND_BREAKDOWN: Record<string, { chars: string[]; readings: string[] }> = {
  // Bài 1 & 2
  '私': { chars: ['私'], readings: ['わたし'] },
  '先生': { chars: ['先', '生'], readings: ['せん', 'せい'] },
  '学生': { chars: ['学', '生'], readings: ['がく', 'せい'] },
  '大学': { chars: ['大', '学'], readings: ['だい', 'がく'] },
  '学校': { chars: ['学', '校'], readings: ['がっ', 'こう'] },
  '留学生': { chars: ['留', '学', '生'], readings: ['りゅう', 'がく', 'せい'] },
  '会社': { chars: ['会', '社'], readings: ['かい', 'しゃ'] },
  '社員': { chars: ['社', '員'], readings: ['しゃ', 'いん'] },
  '会社員': { chars: ['会', '社', '員'], readings: ['かい', 'しゃ', 'いん'] },
  '銀行': { chars: ['銀', '行'], readings: ['ぎん', 'こう'] },
  '銀行員': { chars: ['銀', '行', '員'], readings: ['ぎん', 'こう', 'いん'] },
  '医者': { chars: ['医', '者'], readings: ['い', 'しゃ'] },
  '研究者': { chars: ['研', '究', '者'], readings: ['けん', 'きゅう', 'しゃ'] },
  '本': { chars: ['本'], readings: ['ほん'] },
  '辞書': { chars: ['辞', '書'], readings: ['じ', 'しょ'] },
  '雑誌': { chars: ['雑', '誌'], readings: ['ざっ', 'し'] },
  '新聞': { chars: ['新', '聞'], readings: ['しん', 'ぶん'] },
  '手帳': { chars: ['手', '帳'], readings: ['て', 'ちょう'] },
  '名刺': { chars: ['名', '刺'], readings: ['めい', 'し'] },
  '鉛筆': { chars: ['鉛', '筆'], readings: ['えん', 'ぴつ'] },
  '時計': { chars: ['時', '計'], readings: ['と', 'けい'] },
  '傘': { chars: ['傘'], readings: ['かさ'] },
  '鞄': { chars: ['鞄'], readings: ['かばん'] },
  '自動車': { chars: ['自', '動', '車'], readings: ['じ', 'どう', 'しゃ'] },
  '机': { chars: ['机'], readings: ['つくえ'] },
  '日本語': { chars: ['日', '本', '語'], readings: ['に', 'ほん', 'ご'] },
  '英語': { chars: ['英', '語'], readings: ['えい', 'ご'] },
  '何': { chars: ['何'], readings: ['なん'] },

  // Bài 3
  '教室': { chars: ['教', '室'], readings: ['きょう', 'しつ'] },
  '食堂': { chars: ['食', '堂'], readings: ['しょく', 'どう'] },
  '事務所': { chars: ['事', '務', '所'], readings: ['じ', 'む', 'しょ'] },
  '会議室': { chars: ['会', '議', '室'], readings: ['かい', 'ぎ', 'しつ'] },
  '会議': { chars: ['会', '議'], readings: ['かい', 'ぎ'] },
  '受付': { chars: ['受', '付'], readings: ['うけ', 'つけ'] },
  '部屋': { chars: ['部', '屋'], readings: ['へ', 'や'] },
  '本屋': { chars: ['本', '屋'], readings: ['ほん', 'や'] },
  '階段': { chars: ['階', '段'], readings: ['かい', 'だん'] },
  '国': { chars: ['国'], readings: ['くに'] },
  'お国': { chars: ['国'], readings: ['くに'] },
  '外国': { chars: ['外', '国'], readings: ['がい', 'こく'] },
  '駅': { chars: ['駅'], readings: ['えき'] },
  '電話': { chars: ['電', '話'], readings: ['でん', 'わ'] },
  '靴': { chars: ['靴'], readings: ['くつ'] },
  '地下': { chars: ['地', '下'], readings: ['ち', 'か'] },

  // Bài 4 & 5
  '時間': { chars: ['時', '間'], readings: ['じ', 'かん'] },
  '何時': { chars: ['何', '時'], readings: ['なん', 'じ'] },
  '何分': { chars: ['何', '分'], readings: ['なん', 'ぷん'] },
  '午前': { chars: ['午', '前'], readings: ['ご', 'ぜん'] },
  '午後': { chars: ['午', '後'], readings: ['ご', 'ご'] },
  '朝': { chars: ['朝'], readings: ['あさ'] },
  '昼': { chars: ['昼'], readings: ['ひる'] },
  '晩': { chars: ['晩'], readings: ['ばん'] },
  '夜': { chars: ['夜'], readings: ['よる'] },
  '毎日': { chars: ['毎', '日'], readings: ['まい', 'にち'] },
  '毎朝': { chars: ['毎', '朝'], readings: ['まい', 'あさ'] },
  '毎晩': { chars: ['毎', '晩'], readings: ['まい', 'ばん'] },
  '休み': { chars: ['休', 'み'], readings: ['やす', 'み'] },
  '昼休み': { chars: ['昼', '休', 'み'], readings: ['ひる', 'やす', 'み'] },
  '郵便局': { chars: ['郵', '便', '局'], readings: ['ゆう', 'びん', 'きょく'] },
  '図書館': { chars: ['図', '書', '館'], readings: ['と', 'しょ', 'かん'] },
  '美術館': { chars: ['美', '術', '館'], readings: ['び', 'じゅつ', 'かん'] },
  '今': { chars: ['今'], readings: ['いま'] },
  '電車': { chars: ['電', '車'], readings: ['でん', 'しゃ'] },
  '地下鉄': { chars: ['地', '下', '鉄'], readings: ['ち', 'か', 'てつ'] },
  '新幹線': { chars: ['新', '幹', '線'], readings: ['しん', 'かん', 'せん'] },
  '自転車': { chars: ['自', '転', '車'], readings: ['じ', 'てん', 'しゃ'] },
  '飛行機': { chars: ['飛', '行', '機'], readings: ['ひ', 'こう', 'き'] },
  '船': { chars: ['船'], readings: ['ふね'] },
  '友達': { chars: ['友', '達'], readings: ['とも', 'だち'] },
  '誕生日': { chars: ['誕', '生', '日'], readings: ['たん', 'じょう', 'び'] },
  '家族': { chars: ['家', '族'], readings: ['か', 'ぞく'] },
  '一人': { chars: ['一', '人'], readings: ['ひと', 'り'] },
  '二人': { chars: ['二', '人'], readings: ['ふた', 'り'] },
  '三人': { chars: ['三', '人'], readings: ['さん', 'にん'] }
};

// Bảng ánh xạ Kana -> Romaji chuẩn Hepburn (offline)
const KANA_ROM_MAP: Record<string, string> = {
  // Âm ghép
  'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
  'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
  'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
  'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
  'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
  'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
  'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
  'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
  'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
  'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
  'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
  // Âm cơ bản
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
  'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
  'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  'わ': 'wa', 'を': 'wo', 'ん': 'n',
  // Biến âm
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po'
};

export function kanaToRomaji(kana: string): string {
  if (!kana) return '';
  let res = '';
  let i = 0;
  while (i < kana.length) {
    if (kana[i] === 'っ' || kana[i] === 'ッ') {
      const nextPair = kana.slice(i + 1, i + 3);
      const nextSingle = kana.slice(i + 1, i + 2);
      const nextRom = KANA_ROM_MAP[nextPair] || KANA_ROM_MAP[nextSingle] || '';
      if (nextRom) {
        res += nextRom[0];
      }
      i++;
      continue;
    }
    const two = kana.slice(i, i + 2);
    if (KANA_ROM_MAP[two]) {
      res += KANA_ROM_MAP[two];
      i += 2;
      continue;
    }
    const one = kana[i];
    if (KANA_ROM_MAP[one]) {
      res += KANA_ROM_MAP[one];
    } else {
      res += one;
    }
    i++;
  }
  return res;
}

/**
 * Bản đồ tra cứu Romaji chuẩn xác theo từng bài học (Lesson-specific Romaji Mapping).
 * Đảm bảo khi một chữ Hán có nhiều âm đọc, hệ thống sẽ ưu tiên chọn đúng âm đọc
 * được dùng trong các từ vựng cốt lõi của bài học đó.
 * Khóa dạng: `${lessonId}_${character}`
 */
export const LESSON_KANJI_ROMAJI_MAP: Record<string, string> = {
  // Bài 1
  '1_私': 'watashi',
  '1_人': 'jin',     // 日本人, 社員, アメリカ人
  '1_先': 'sen',     // 先生
  '1_生': 'sei',     // 先生, 学生
  '1_学': 'gaku',    // 学生, 大学, 学校
  '1_校': 'kou',     // 学校
  '1_日': 'nichi',   // 日本 (ni), 日曜日 (nichi)
  '1_本': 'hon',     // 日本, 本
  '1_会': 'kai',     // 会社, 会社員
  '1_社': 'sha',     // 会社, 社員, 会社員
  '1_員': 'in',      // 会社員, 社員, 銀行員
  '1_一': 'ichi',
  '1_二': 'ni',
  '1_三': 'san',

  // Bài 2
  '2_本': 'hon',     // 本
  '2_語': 'go',      // 日本語, 英語
  '2_何': 'nan',     // 何
  '2_時': 'ji',      // 時計, 何時
  '2_計': 'kei',     // 時計
  '2_車': 'sha',     // 自動車
  '2_机': 'tsukue',  // 机
  '2_傘': 'kasa',    // 傘
  '2_鞄': 'kaban',   // 鞄
  '2_新': 'shin',    // 新聞
  '2_聞': 'bun',     // 新聞
  '2_読': 'doku',    // 読書
  '2_書': 'sho',     // 辞書
  '2_辞': 'ji',      // 辞書
  '2_雑': 'zatsu',   // 雑誌
  '2_誌': 'shi',     // 雑誌
  '2_鍵': 'kagi',    // 鍵
  '2_英': 'ei',      // 英語

  // Bài 3
  '3_室': 'shitsu',  // 教室, 会議室
  '3_食': 'shoku',   // 食堂
  '3_堂': 'dou',     // 食堂
  '3_所': 'sho',     // 事務所
  '3_屋': 'ya',      // 部屋, 本屋
  '3_国': 'koku',    // 外国, お国
  '3_議': 'gi',      // 会議, 会議室
  '3_駅': 'eki',     // 駅
  '3_電': 'den',     // 電話
  '3_靴': 'kutsu',   // 靴
  '3_地': 'chi',     // 地下
  '3_下': 'ka',      // 地下

  // Bài 4
  '4_分': 'fun',     // 何分 (pun/fun), 分
  '4_半': 'han',     // 半
  '4_午': 'go',      // 午前, 午後
  '4_前': 'zen',     // 午前 (zen) / mae
  '4_後': 'go',      // 午後 (go) / ushiro
  '4_今': 'ima',     // 今 (ima), 今朝 (kesa), 今晩 (konban)
  '4_朝': 'asa',     // 朝, 毎朝
  '4_昼': 'hiru',    // 昼, 昼休み
  '4_夜': 'yoru',    // 夜
  '4_晩': 'ban',     // 晩, 毎晩
  '4_毎': 'mai',     // 毎日, 毎朝, 毎晩
  '4_休': 'yasu',    // 休み
  '4_銀': 'gin',     // 銀行
  '4_間': 'kan',     // 時間

  // Bài 5
  '5_行': 'i',       // 行きます (i), 銀行/飛行機 (kou)
  '5_来': 'ki',      // 来ます (ki), 来週 (rai)
  '5_帰': 'kae',     // 帰ります
  '5_動': 'dou',     // 自動車
  '5_自': 'ji',      // 自動車, 自転車
  '5_転': 'ten',     // 自転車
  '5_車': 'sha',     // 電車, 自転車
  '5_駅': 'eki',     // 駅
  '5_飛': 'hi',      // 飛行機
  '5_機': 'ki',      // 飛行機
  '5_船': 'fune',    // 船
  '5_先': 'sen',     // 先週
  '5_週': 'shuu',    // 今週, 来週, 先週
  '5_誕': 'tan',     // 誕生日
  '5_年': 'nen',     // 去年, 今年, 来年

  // Bài 6
  '6_食': 'ta',      // 食べます
  '6_飲': 'no',      // 飲みます
  '6_吸': 'su',      // 吸います
  '6_見': 'mi',      // 見ます
  '6_聞': 'ki',      // 聞きます
  '6_読': 'yo',      // 読みます
  '6_書': 'ka',      // 書きます
  '6_買': 'ka',      // 買います
  '6_撮': 'to',      // 撮ります
  '6_友': 'tomo',    // 友達
  '6_達': 'dachi',   // 友達
  '6_酒': 'sake',    // お酒
  '6_店': 'mise',    // 店

  // Bài 7
  '7_切': 'ki',      // 切ります
  '7_送': 'oku',     // 送ります
  '7_手': 'te',      // 手
  '7_紙': 'kami',    // 手紙
  '7_花': 'hana',    // 花
  '7_荷': 'ni',      // 荷物
  '7_物': 'motsu',   // 荷物
  '7_父': 'chichi',  // 父
  '7_母': 'haha',    // 母
  '7_教': 'oshi',    // 教えます
  '7_習': 'nara',    // 習います
  '7_貸': 'ka',      // 貸します
  '7_借': 'ka',      // 借ります

  // Bài 8
  '8_親': 'shin',    // 親切
  '8_切': 'setsu',   // 親切
  '8_便': 'ben',     // 便利
  '8_利': 'ri',      // 便利
  '8_有': 'yuu',     // 有名
  '8_名': 'mei',     // 有名
  '8_白': 'shiro',   // 白い
  '8_黒': 'kuro',    // 黒い
  '8_赤': 'aka',     // 赤い
  '8_青': 'ao',      // 青い
  '8_町': 'machi',   // 町
  '8_山': 'yama',    // 山
  '8_静': 'shizu',   // 静か
  '8_高': 'taka',    // 高い
  '8_安': 'yasu',    // 安い
  '8_新': 'atara',   // 新しい
  '8_古': 'furu',    // 古い

  // Bài 9
  '9_好': 'su',      // 好き
  '9_嫌': 'kira',    // 嫌い
  '9_上': 'jou',     // 上手
  '9_手': 'zu',      // 上手
  '9_下': 'he',      // 下手
  '9_歌': 'uta',     // 歌
  '9_絵': 'e',       // 絵
  '9_字': 'ji',      // 漢字, 字
  '9_肉': 'niku',    // 肉
  '9_魚': 'sakana',  // 魚
  '9_野': 'ya',      // 野菜
  '9_菜': 'sai',     // 野菜
  '9_音': 'on',      // 音楽
  '9_楽': 'gaku',    // 音楽
  '9_料': 'ryou',    // 料理
  '9_理': 'ri',      // 料理

  // Bài 10
  '10_男': 'otoko',  // 男
  '10_女': 'onna',   // 女
  '10_子': 'ko',     // 子
  '10_犬': 'inu',    // 犬
  '10_猫': 'neko',   // 猫
  '10_木': 'ki',     // 木
  '10_家': 'ie',     // 家
  '10_箱': 'bako',   // 箱
  '10_棚': 'tana',   // 棚
  '10_中': 'naka',   // 中
  '10_外': 'soto',   // 外
  '10_隣': 'tonari', // 隣
  '10_近': 'chika',  // 近く
  '10_間': 'aida',   // 間
  '10_段': 'dan'     // 階段
};

/**
 * Trích xuất Romaji chuẩn xác của một chữ Hán theo bài học tương ứng.
 */
export function getLessonKanjiRomaji(
  kanji: KanjiItemData,
  lessonId: number,
  vocabItems: any[] = []
): string {
  if (!kanji || !kanji.character) return '';

  // 1. Tra cứu trực tiếp từ bảng chuẩn bài học
  const key = `${lessonId}_${kanji.character}`;
  if (LESSON_KANJI_ROMAJI_MAP[key]) {
    return LESSON_KANJI_ROMAJI_MAP[key];
  }

  // 2. Tra cứu từ vựng của bài học kết hợp KANJI_COMPOUND_BREAKDOWN
  if (vocabItems && vocabItems.length > 0) {
    for (const v of vocabItems) {
      if (!v) continue;
      const kWord = v.kanji_form || v.kanji || '';
      if (kWord && KANJI_COMPOUND_BREAKDOWN[kWord]) {
        const bd = KANJI_COMPOUND_BREAKDOWN[kWord];
        const idx = bd.chars.indexOf(kanji.character);
        if (idx !== -1 && bd.readings[idx]) {
          const rom = kanaToRomaji(bd.readings[idx]);
          if (rom) return rom;
        }
      }
    }
  }

  // 3. Tra cứu từ compounds của Kanji nếu có
  if (kanji.compounds) {
    const parts = kanji.compounds.split(/[;\n]/);
    for (const p of parts) {
      const m = p.match(/^([^\(:\s]+)(?:\s*\(([^)]+)\))?\s*[:：]/);
      if (m) {
        const word = m[1].trim();
        const reading = m[2]?.trim() || '';
        if (word === kanji.character && reading) {
          const rom = kanaToRomaji(reading);
          if (rom) return rom;
        }
        if (KANJI_COMPOUND_BREAKDOWN[word]) {
          const bd = KANJI_COMPOUND_BREAKDOWN[word];
          const idx = bd.chars.indexOf(kanji.character);
          if (idx !== -1 && bd.readings[idx]) {
            const rom = kanaToRomaji(bd.readings[idx]);
            if (rom) return rom;
          }
        }
      }
    }
  }

  // 4. Fallback trích xuất từ onyomi hoặc kunyomi
  const extractRomajiFromField = (field?: string): string => {
    if (!field) return '';
    const match = field.match(/\(([a-zA-Z\s,.-]+)\)/);
    if (match) {
      const parts = match[1].split(/[\s,.]+/).filter(Boolean);
      if (parts[0]) return parts[0].toLowerCase();
    }
    const clean = field.replace(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '').trim();
    const parts = clean.split(/[\s,()（）.]+/).filter(Boolean);
    if (parts[0]) return parts[0].toLowerCase();
    return '';
  };

  const kunRom = extractRomajiFromField(kanji.kunyomi);
  if (kunRom) return kunRom;

  const onRom = extractRomajiFromField(kanji.onyomi);
  if (onRom) return onRom;

  return '';
}

/**
 * Bản đồ tra cứu chữ Hán: Âm Hán, Nghĩa tiếng Việt và Bài học giới thiệu.
 */
export const GLOBAL_KANJI_META: Record<string, { sino: string; meaning: string; lesson: number }> = {
  // Bài 1
  '私': { sino: 'TƯ', meaning: 'Tôi, riêng tư', lesson: 1 },
  '人': { sino: 'NHÂN', meaning: 'Người', lesson: 1 },
  '先': { sino: 'TIÊN', meaning: 'Trước, đi đầu', lesson: 1 },
  '生': { sino: 'SINH', meaning: 'Sống, sinh ra', lesson: 1 },
  '学': { sino: 'HỌC', meaning: 'Học tập', lesson: 1 },
  '校': { sino: 'HIỆU', meaning: 'Trường học', lesson: 1 },
  '日': { sino: 'NHẬT', meaning: 'Mặt trời, ngày', lesson: 1 },
  '本': { sino: 'BẢN', meaning: 'Sách, gốc rễ', lesson: 1 },
  '会': { sino: 'HỘI', meaning: 'Hội họp, gặp gỡ', lesson: 1 },
  '社': { sino: 'XÃ', meaning: 'Công ty, đền thờ', lesson: 1 },
  '員': { sino: 'VIÊN', meaning: 'Thành viên, nhân viên', lesson: 1 },
  '一': { sino: 'NHẤT', meaning: 'Một, số một', lesson: 1 },
  '二': { sino: 'NHỊ', meaning: 'Hai, số hai', lesson: 1 },
  '三': { sino: 'TAM', meaning: 'Ba, số ba', lesson: 1 },

  // Bài 2
  '語': { sino: 'NGỮ', meaning: 'Ngôn ngữ, tiếng', lesson: 2 },
  '何': { sino: 'HÀ', meaning: 'Cái gì', lesson: 2 },
  '時': { sino: 'THỜI', meaning: 'Thời gian, giờ', lesson: 2 },
  '計': { sino: 'KẾ', meaning: 'Kế hoạch, đo lường', lesson: 2 },
  '車': { sino: 'XA', meaning: 'Xe cộ, ô tô', lesson: 2 },
  '机': { sino: 'KỶ', meaning: 'Cái bàn', lesson: 2 },
  '傘': { sino: 'TẢN', meaning: 'Cái ô, cái dù', lesson: 2 },
  '鞄': { sino: 'BẠC', meaning: 'Cặp sách, túi xách', lesson: 2 },
  '新': { sino: 'TÂN', meaning: 'Mới', lesson: 2 },
  '聞': { sino: 'VĂN', meaning: 'Nghe, hỏi', lesson: 2 },
  '読': { sino: 'ĐỘC', meaning: 'Đọc', lesson: 2 },
  '書': { sino: 'THƯ', meaning: 'Viết, cuốn sách', lesson: 2 },
  '辞': { sino: 'TỪ', meaning: 'Từ ngữ, từ điển', lesson: 2 },
  '雑': { sino: 'TẠP', meaning: 'Tạp nham, pha trộn', lesson: 2 },
  '誌': { sino: 'CHÍ', meaning: 'Tạp chí, ghi chép', lesson: 2 },
  '鍵': { sino: 'KIỆN', meaning: 'Chìa khóa', lesson: 2 },
  '英': { sino: 'ANH', meaning: 'Nước Anh, anh hùng', lesson: 2 },

  // Bài 3
  '室': { sino: 'THẤT', meaning: 'Phòng, lớp học', lesson: 3 },
  '食': { sino: 'THỰC', meaning: 'Ăn, đồ ăn', lesson: 3 },
  '堂': { sino: 'ĐƯỜNG', meaning: 'Nhà lớn, chính đường', lesson: 3 },
  '所': { sino: 'SỞ', meaning: 'Nơi chốn, văn phòng', lesson: 3 },
  '屋': { sino: 'ỐC', meaning: 'Căn nhà, hiệu buôn', lesson: 3 },
  '国': { sino: 'QUỐC', meaning: 'Đất nước, quốc gia', lesson: 3 },
  '議': { sino: 'NGHỊ', meaning: 'Nghị luận, bàn bạc', lesson: 3 },
  '駅': { sino: 'DỊCH', meaning: 'Nhà ga', lesson: 3 },
  '電': { sino: 'ĐIỆN', meaning: 'Điện lực, sấm chớp', lesson: 3 },

  // Bài 4
  '分': { sino: 'PHÂN', meaning: 'Phút, phân chia', lesson: 4 },
  '半': { sino: 'BÁN', meaning: 'Nửa, một nửa', lesson: 4 },
  '午': { sino: 'NGỌ', meaning: 'Buổi trưa', lesson: 4 },
  '前': { sino: 'TIỀN', meaning: 'Trước, phía trước', lesson: 4 },
  '後': { sino: 'HẬU', meaning: 'Sau, phía sau', lesson: 4 },
  '今': { sino: 'KIM', meaning: 'Bây giờ, hiện tại', lesson: 4 },
  '朝': { sino: 'TRIỀU', meaning: 'Buổi sáng', lesson: 4 },
  '昼': { sino: 'TRÚ', meaning: 'Buổi trưa', lesson: 4 },
  '夜': { sino: 'DẠ', meaning: 'Ban đêm', lesson: 4 },
  '晩': { sino: 'VÃN', meaning: 'Buổi tối', lesson: 4 },
  '毎': { sino: 'MỖI', meaning: 'Mỗi ngày, hàng ngày', lesson: 4 },
  '休': { sino: 'HƯU', meaning: 'Nghỉ ngơi', lesson: 4 },
  '銀': { sino: 'NGÂN', meaning: 'Bạc, tiền bạc', lesson: 4 },
  '間': { sino: 'GIAN', meaning: 'Khoảng cách, thời gian', lesson: 4 },

  // Bài 5 & các bài tiếp theo
  '行': { sino: 'HÀNH', meaning: 'Đi', lesson: 5 },
  '来': { sino: 'LAI', meaning: 'Đến', lesson: 5 },
  '帰': { sino: 'QUY', meaning: 'Trở về', lesson: 5 },
  '動': { sino: 'ĐỘNG', meaning: 'Chuyển động', lesson: 5 },
  '自': { sino: 'TỰ', meaning: 'Bản thân, tự mình', lesson: 5 },
  '転': { sino: 'CHUYỂN', meaning: 'Chuyển động, lăn', lesson: 5 },
  '下': { sino: 'HẠ', meaning: 'Dưới, phía dưới', lesson: 6 },
  '友': { sino: 'HỮU', meaning: 'Bạn bè', lesson: 6 },
  '達': { sino: 'ĐẠT', meaning: 'Đạt được, bạn bè', lesson: 6 },
  '教': { sino: 'GIÁO', meaning: 'Dạy học, tôn giáo', lesson: 7 },
  '手': { sino: 'THỦ', meaning: 'Tay, bàn tay', lesson: 8 },
  '帳': { sino: 'TRƯỚNG', meaning: 'Sổ sách, trướng', lesson: 8 },
  '名': { sino: 'DANH', meaning: 'Tên, danh tiếng', lesson: 8 },
  '刺': { sino: 'THÍCH', meaning: 'Đâm, danh thiếp', lesson: 8 },
  '鉛': { sino: 'DUYÊN', meaning: 'Chì, than chì', lesson: 8 },
  '筆': { sino: 'BÚT', meaning: 'Bút viết', lesson: 8 },
  '家': { sino: 'GIA', meaning: 'Nhà, gia đình', lesson: 10 },
  '族': { sino: 'TỘC', meaning: 'Gia tộc, dân tộc', lesson: 10 },
  '外': { sino: 'NGOẠI', meaning: 'Bên ngoài, nước ngoài', lesson: 11 },
  '郵': { sino: 'BƯU', meaning: 'Bưu điện, gửi thư', lesson: 11 },
  '便': { sino: 'TIỆN', meaning: 'Thuận tiện, bưu kiện', lesson: 11 },
  '局': { sino: 'CỤC', meaning: 'Cục, cơ quan', lesson: 11 },
  '図': { sino: 'ĐỒ', meaning: 'Bản đồ, sơ đồ', lesson: 11 },
  '館': { sino: 'QUÁN', meaning: 'Nhà lớn, hội quán', lesson: 11 },
  '美': { sino: 'MỸ', meaning: 'Đẹp, mỹ thuật', lesson: 11 },
  '術': { sino: 'THUẬT', meaning: 'Kỹ thuật, nghệ thuật', lesson: 11 },
  '医': { sino: 'Y', meaning: 'Y học, bác sĩ', lesson: 12 },
  '者': { sino: 'GIẢ', meaning: 'Người, học giả', lesson: 12 },
  '地': { sino: 'ĐỊA', meaning: 'Đất, mặt đất', lesson: 13 },
  '鉄': { sino: 'THIẾT', meaning: 'Sắt, đường sắt', lesson: 13 },
  '幹': { sino: 'CÁN', meaning: 'Thân cây, cán bộ', lesson: 13 },
  '線': { sino: 'TUYẾN', meaning: 'Đường dây, tuyến đường', lesson: 13 },
  '飛': { sino: 'PHI', meaning: 'Bay', lesson: 13 },
  '機': { sino: 'CƠ', meaning: 'Máy móc, cơ hội', lesson: 13 },
  '船': { sino: 'THUYỀN', meaning: 'Thuyền, tàu thủy', lesson: 13 },
  '誕': { sino: 'ĐẢN', meaning: 'Sinh ra, sinh nhật', lesson: 13 },
  '話': { sino: 'THOẠI', meaning: 'Nói chuyện, đối thoại', lesson: 14 },
  '研': { sino: 'NGHIÊN', meaning: 'Nghiên cứu, mài', lesson: 15 },
  '究': { sino: 'CỨU', meaning: 'Nghiên cứu, tìm hiểu', lesson: 15 },
  '階': { sino: 'GIAI', meaning: 'Cầu thang, giai cấp', lesson: 18 },
  '段': { sino: 'ĐOẠN', meaning: 'Bậc thang, đoạn', lesson: 18 },
  '靴': { sino: 'NGOA', meaning: 'Giày dép', lesson: 19 },
  '事': { sino: 'SỰ', meaning: 'Sự việc, việc', lesson: 20 },
  '部': { sino: 'BỘ', meaning: 'Bộ phận, phòng ban', lesson: 23 },
  '務': { sino: 'VỤ', meaning: 'Nhiệm vụ, công việc', lesson: 24 },
  '受': { sino: 'THỤ', meaning: 'Nhận, tiếp nhận', lesson: 37 },
  '付': { sino: 'PHÓ', meaning: 'Gắn vào, đính kèm', lesson: 37 }
};

/**
 * Chuyển một từ vựng Hán tự sang dạng Bán Kanji lũy tiến (Progressive Kanji).
 * - Chữ Hán nào đã thuộc (có trong masteredKanjiSet) HOẶC đang học trong bài hiện tại: Giữ Kanji.
 * - Chữ Hán nào chưa thuộc: Chuyển sang Hiragana tương ứng!
 */
export function toProgressiveKanjiWord(
  kanjiWord: string,
  hiragana: string,
  masteredKanjiSet: Set<string>,
  lessonKanjiSet: Set<string>
): string {
  if (!kanjiWord) return hiragana || '';
  if (kanjiWord === hiragana) return hiragana;

  const breakdown = KANJI_COMPOUND_BREAKDOWN[kanjiWord];
  if (breakdown) {
    return breakdown.chars
      .map((char, idx) => {
        const isMastered = masteredKanjiSet.has(char);
        const isInCurrentLesson = lessonKanjiSet.has(char);
        if (isMastered || isInCurrentLesson) {
          return char;
        }
        return breakdown.readings[idx] || char;
      })
      .join('');
  }

  // Fallback cho từ đơn hoặc từ có okurigana (e.g. 食べる)
  let result = '';
  for (let i = 0; i < kanjiWord.length; i++) {
    const ch = kanjiWord[i];
    if (/[\u4E00-\u9FAF]/.test(ch)) {
      const isMastered = masteredKanjiSet.has(ch);
      const isInCurrentLesson = lessonKanjiSet.has(ch);
      if (isMastered || isInCurrentLesson) {
        result += ch;
      } else {
        // Nếu không có breakdown, cố gắng tìm fallback
        result += ch;
      }
    } else {
      result += ch;
    }
  }
  return result;
}

export type PracticeCategory = 'type1_vocab' | 'type2_partial' | 'type3_sentence';

export interface PracticeExerciseQuestion {
  id: string;
  category: PracticeCategory;
  subType: 'type1_vocab' | 'type2_partial' | 'type3_1_hira' | 'type3_2_blank';
  badgeLabel: string;
  prompt: string;
  displaySubject: string;
  sentenceContext?: string;
  sentenceTranslation?: string;
  targetWord: string;
  targetWordReading: string;
  targetWordMeaning: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GeneratePracticeParams {
  eligibleKanji: KanjiItemData[];
  vocabItems?: any[];
  grammarItems?: any[];
  allLessonKanji?: KanjiItemData[];
  selectedCategories?: PracticeCategory[];
  currentLessonId: number;
  limit?: number;
}

/**
 * Tra cứu metadata chữ Hán (Âm Hán, Nghĩa tiếng Việt, Bài học).
 */
export function getKanjiInfo(char: string, allLessonKanji: KanjiItemData[] = []) {
  const meta = GLOBAL_KANJI_META[char];
  if (meta) return meta;
  const foundK = (allLessonKanji || []).find(k => k.character === char);
  if (foundK) {
    return {
      sino: foundK.sino_vietnamese || '',
      meaning: foundK.vietnamese_meaning || '',
      lesson: foundK.lesson_id || 0
    };
  }
  return { sino: '', meaning: '', lesson: 0 };
}

/**
 * Trình tạo thẻ Giải thích chi tiết cấu tạo chữ Hán chuẩn hóa (bóc tách rõ từng chữ, âm Hán, nghĩa, bài học).
 */
export function buildVocabKanjiExplanation({
  sentenceMeaning,
  targetVocab,
  allLessonKanji = []
}: {
  sentenceMeaning?: string;
  targetVocab: {
    kanjiWord: string;
    hiragana: string;
    meaning: string;
    romaji?: string;
    kanjiChars?: string[];
  };
  allLessonKanji?: KanjiItemData[];
}): string {
  const parts: string[] = [];
  if (sentenceMeaning) {
    parts.push(`🇻🇳 Dịch nghĩa câu: "${sentenceMeaning}"`);
  }

  const wordRom = targetVocab.romaji || kanaToRomaji(targetVocab.hiragana);
  const romPart = wordRom ? ` • Romaji: ${wordRom}` : '';
  parts.push(`【Từ hoàn chỉnh】: ${targetVocab.kanjiWord} (${targetVocab.hiragana}${romPart}: ${targetVocab.meaning})`);

  const breakdown = KANJI_COMPOUND_BREAKDOWN[targetVocab.kanjiWord];
  if (breakdown && breakdown.chars.length > 0) {
    breakdown.chars.forEach((ch, idx) => {
      const info = getKanjiInfo(ch, allLessonKanji);
      const chKana = breakdown.readings[idx] || '';
      const chRom = kanaToRomaji(chKana);
      const chRomPart = chRom ? ` - Romaji: ${chRom}` : '';
      const lessonPrefix = info.lesson ? `Bài ${info.lesson}: ` : '';
      const sinoPart = info.sino ? `Âm Hán: ${info.sino}` : 'Hán tự';
      const meanPart = info.meaning ? ` - Nghĩa: ${info.meaning}` : '';
      parts.push(`• ${lessonPrefix}【${ch}】 (${sinoPart}${meanPart}${chRomPart})`);
    });
  } else {
    const chars = targetVocab.kanjiWord.split('').filter(c => /[\u4E00-\u9FAF]/.test(c));
    const uniqueChars = Array.from(new Set(chars.length > 0 ? chars : (targetVocab.kanjiChars || [])));
    uniqueChars.forEach(ch => {
      const info = getKanjiInfo(ch, allLessonKanji);
      const chRom = kanaToRomaji(targetVocab.hiragana);
      const chRomPart = chRom ? ` - Romaji: ${chRom}` : '';
      const lessonPrefix = info.lesson ? `Bài ${info.lesson}: ` : '';
      const sinoPart = info.sino ? `Âm Hán: ${info.sino}` : 'Hán tự';
      const meanPart = info.meaning ? ` - Nghĩa: ${info.meaning}` : '';
      parts.push(`• ${lessonPrefix}【${ch}】 (${sinoPart}${meanPart}${chRomPart})`);
    });
  }
  return parts.join('\n');
}

/**
 * Trình sinh câu hỏi Luyện tập thực chiến 3 dạng hoàn chỉnh.
 */
export function generatePracticeQuestions({
  eligibleKanji,
  vocabItems = [],
  grammarItems = [],
  allLessonKanji = [],
  selectedCategories = ['type1_vocab', 'type2_partial', 'type3_sentence'],
  currentLessonId,
  limit = 12
}: GeneratePracticeParams): PracticeExerciseQuestion[] {
  if (!eligibleKanji || eligibleKanji.length === 0) return [];

  // Tập hợp các chữ Kanji đã học thuộc (mastered)
  const masteredKanjiSet = new Set<string>();
  (allLessonKanji || []).forEach(k => {
    if (k && k.character && k.status === 'mastered') {
      masteredKanjiSet.add(k.character);
    }
  });

  // Tập hợp các chữ Kanji của bài học hiện tại đang luyện
  const lessonKanjiSet = new Set<string>(eligibleKanji.map(k => k.character));

  // Trình tạo thẻ Giải thích chi tiết dùng chung
  const buildKanjiExplanation = (params: any) => buildVocabKanjiExplanation({ ...params, allLessonKanji });

  // 1. Thu thập danh sách từ vựng của bài có chứa Kanji của bài
  const targetVocabs: Array<{
    kanjiWord: string;
    hiragana: string;
    meaning: string;
    example?: string;
    exampleMeaning?: string;
    kanjiChars: string[];
  }> = [];

  const seenVocabWords = new Set<string>();

  (vocabItems || []).forEach(v => {
    if (!v || !v.hiragana) return;
    const kWord = v.kanji_form || v.kanji;
    if (!kWord || kWord === v.hiragana) return;

    // Tìm các chữ Hán trong từ này có thuộc bài hiện tại không
    const matchingChars: string[] = [];
    for (const char of kWord) {
      if (lessonKanjiSet.has(char) && !matchingChars.includes(char)) {
        matchingChars.push(char);
      }
    }

    if (matchingChars.length > 0 && !seenVocabWords.has(kWord)) {
      seenVocabWords.add(kWord);
      targetVocabs.push({
        kanjiWord: kWord,
        hiragana: v.hiragana,
        meaning: v.vietnamese_meaning || '',
        example: v.japanese_example,
        exampleMeaning: v.example_meaning,
        kanjiChars: matchingChars
      });
    }
  });

  // Bổ sung các từ ghép từ compounds của Kanji nếu chưa có
  eligibleKanji.forEach(k => {
    if (!k || !k.compounds) return;
    const parts = k.compounds.split(/[;\n]/);
    for (const p of parts) {
      const m = p.match(/^([^\(:\s]+)(?:\s*\(([^)]+)\))?\s*[:：]\s*(.+)$/);
      if (m) {
        const word = m[1].trim();
        const reading = m[2]?.trim() || '';
        const meaning = m[3]?.trim() || '';
        if (word.includes(k.character) && !seenVocabWords.has(word)) {
          seenVocabWords.add(word);
          targetVocabs.push({
            kanjiWord: word,
            hiragana: reading,
            meaning: meaning,
            kanjiChars: [k.character]
          });
        }
      }
    }
  });

  // Nếu không có từ vựng nào, fallback bằng chính các chữ Hán
  if (targetVocabs.length === 0) {
    eligibleKanji.forEach(k => {
      targetVocabs.push({
        kanjiWord: k.character,
        hiragana: (k.kunyomi || k.onyomi || '').split(/[\s,()（）.]/)[0] || k.character,
        meaning: k.vietnamese_meaning,
        kanjiChars: [k.character]
      });
    });
  }

  // Thu thập kho câu ví dụ thực tế của bài
  const authenticSentences: Array<{ japanese: string; meaning: string; targetVocab: typeof targetVocabs[0] }> = [];
  targetVocabs.forEach(tv => {
    if (tv.example && tv.example.includes(tv.kanjiWord) || (tv.example && tv.example.includes(tv.hiragana))) {
      authenticSentences.push({
        japanese: tv.example,
        meaning: tv.exampleMeaning || tv.meaning,
        targetVocab: tv
      });
    }
  });

  (grammarItems || []).forEach(g => {
    if (g && g.japanese_example) {
      targetVocabs.forEach(tv => {
        if (g.japanese_example.includes(tv.kanjiWord) || g.japanese_example.includes(tv.hiragana)) {
          authenticSentences.push({
            japanese: g.japanese_example.split('\n')[0].replace(/^Khẳng định:\s*/, ''),
            meaning: (g.example_meaning || g.meaning || '').split('\n')[0].replace(/^Khẳng định:\s*/, ''),
            targetVocab: tv
          });
        }
      });
    }
  });

  const generatedQuestions: PracticeExerciseQuestion[] = [];
  const enabledSet = new Set(selectedCategories);

  // Sinh câu hỏi cho từng dạng bài
  let attempts = 0;
  const maxAttempts = limit * 6;

  while (generatedQuestions.length < limit && attempts < maxAttempts) {
    attempts++;
    const vIndex = attempts % targetVocabs.length;
    const currentVocab = targetVocabs[vIndex];
    const targetKanjiChar = currentVocab.kanjiChars[0] || eligibleKanji[0].character;

    // Chọn danh mục cần sinh
    const availableCats = ['type1_vocab', 'type2_partial', 'type3_sentence'].filter(c => enabledSet.has(c as PracticeCategory));
    if (availableCats.length === 0) break;
    const chosenCat = availableCats[attempts % availableCats.length] as PracticeCategory;

    // ------------------------------------------------------------------------
    // DẠNG 1: TỪ VỰNG TRONG BÀI (Hỏi nghĩa / Hiragana -> Chọn chữ Hán hoàn chỉnh 100% Kanji)
    // ------------------------------------------------------------------------
    if (chosenCat === 'type1_vocab') {
      const correctWord = currentVocab.kanjiWord;

      const isAskMeaning = attempts % 2 === 0;
      const promptText = isAskMeaning
        ? '👉 Chọn từ vựng chữ Hán tương ứng với ý nghĩa:'
        : '👉 Chọn từ vựng chữ Hán tương ứng với cách đọc:';
      const displaySub = isAskMeaning
        ? currentVocab.meaning
        : `「${currentVocab.hiragana}」`;

      // 3 đáp án sai: 100% từ vựng chữ Hán hoàn chỉnh, tuyệt đối KHÔNG chứa Hiragana
      const otherVocabs = targetVocabs
        .map(v => v.kanjiWord)
        .filter(w => w !== correctWord);

      const fallbackWrongs = [
        '車', '時計', '本', '机', '電話', '教室', '食堂', '会社',
        '部屋', '事務所', '会議', '受付', '外国', '駅', '時間', '毎日', '病院', '銀行'
      ];

      const uniqueWrongPool = Array.from(new Set([
        ...otherVocabs,
        ...fallbackWrongs
      ])).filter(w => w !== correctWord && !/[\u3040-\u309F]/.test(w)); // Triệt tiêu mọi từ dính Hiragana

      const wrongOpts = shuffleArray(uniqueWrongPool).slice(0, 3);

      while (wrongOpts.length < 3) {
        wrongOpts.push(`字_${wrongOpts.length + 1}`);
      }

      const allOptions = shuffleArray([correctWord, ...wrongOpts.slice(0, 3)]);
      const corrIdx = allOptions.indexOf(correctWord);

      // Xây dựng giải thích chi tiết theo format chuẩn hóa
      const explanationText = buildKanjiExplanation({
        targetVocab: currentVocab
      });

      generatedQuestions.push({
        id: `q_t1_${currentVocab.kanjiWord}_${attempts}`,
        category: 'type1_vocab',
        subType: 'type1_vocab',
        badgeLabel: 'Dạng 1: Từ vựng Hán tự',
        prompt: promptText,
        displaySubject: displaySub,
        targetWord: correctWord,
        targetWordReading: currentVocab.hiragana,
        targetWordMeaning: currentVocab.meaning,
        options: allOptions,
        correctIndex: corrIdx,
        explanation: explanationText.trim()
      });
    }

    // ------------------------------------------------------------------------
    // DẠNG 2: TỪ VỰNG NỬA VỜI (Điền khuyết từ ghép >= 2 chữ Kanji)
    // ------------------------------------------------------------------------
    else if (chosenCat === 'type2_partial') {
      const compoundVocabs = targetVocabs.filter(v => v.kanjiWord.length >= 2 && v.kanjiChars.length > 0);
      if (compoundVocabs.length === 0) continue;

      const cVocab = compoundVocabs[attempts % compoundVocabs.length];
      const targetChar = cVocab.kanjiChars[0] || eligibleKanji[0].character;

      // Tạo câu hỏi khuyết chữ: ví dụ 【 ? 】わ hoặc 電【 ? 】
      const chars = cVocab.kanjiWord.split('');
      const maskIdx = chars.indexOf(targetChar);
      if (maskIdx === -1) continue;

      const maskedWord = chars.map((ch, idx) => {
        if (idx === maskIdx) return '【 ? 】';
        const isKnown = masteredKanjiSet.has(ch) || lessonKanjiSet.has(ch);
        if (isKnown) return ch;
        // Chữ chưa học -> chuyển kana từ breakdown nếu có
        const bd = KANJI_COMPOUND_BREAKDOWN[cVocab.kanjiWord];
        return (bd && bd.readings[idx]) || ch;
      }).join('');

      const displayPrompt = `「${maskedWord}」＝ ${cVocab.hiragana}`;

      // 4 phương án là các chữ Hán đơn lẻ, khử trùng lặp tuyệt đối
      const otherChars = eligibleKanji
        .filter(k => k.character !== targetChar)
        .map(k => k.character);

      const fallbackSingles = ['本', '車', '食', '室', '会', '社', '時', '計', '国', '駅', '電', '所', '校', '店', '人', '先', '生', '学'];
      const uniqueWrongPool = Array.from(new Set([
        ...otherChars,
        ...fallbackSingles
      ])).filter(c => c !== targetChar && /[\u4E00-\u9FAF]/.test(c));

      const wrongChars = shuffleArray(uniqueWrongPool).slice(0, 3);

      while (wrongChars.length < 3) {
        wrongChars.push('人');
      }

      const allOptions = shuffleArray([targetChar, ...wrongChars.slice(0, 3)]);
      const corrIdx = allOptions.indexOf(targetChar);

      // Xây dựng giải thích chi tiết theo format chuẩn hóa
      const explanationText = buildKanjiExplanation({
        targetVocab: cVocab
      });

      generatedQuestions.push({
        id: `q_t2_${cVocab.kanjiWord}_${attempts}`,
        category: 'type2_partial',
        subType: 'type2_partial',
        badgeLabel: 'Dạng 2: Từ vựng nửa vời',
        prompt: '👉 Chọn chữ Hán thích hợp điền vào 【 ? 】 để hoàn thiện từ ghép:',
        displaySubject: displayPrompt,
        targetWord: targetChar,
        targetWordReading: cVocab.hiragana,
        targetWordMeaning: cVocab.meaning,
        options: allOptions,
        correctIndex: corrIdx,
        explanation: explanationText.trim()
      });
    }

    // ------------------------------------------------------------------------
    // DẠNG 3: NHẬN DIỆN CHỮ HÁN TRONG CÂU (50% 3.1 & 50% 3.2)
    // ------------------------------------------------------------------------
    else if (chosenCat === 'type3_sentence') {
      const sentenceItem = authenticSentences.length > 0
        ? authenticSentences[attempts % authenticSentences.length]
        : {
            japanese: `「これは だれの ${currentVocab.hiragana}ですか。」`,
            meaning: `Cái này là ${currentVocab.meaning} của ai?`,
            targetVocab: currentVocab
          };

      const isSubtype31 = attempts % 2 === 0;

      // 3.1: Cho câu Hiragana -> Tìm chữ Hán đơn lẻ xuất hiện
      if (isSubtype31) {
        const targetChar = sentenceItem.targetVocab.kanjiChars[0] || eligibleKanji[0].character;
        const bd = KANJI_COMPOUND_BREAKDOWN[sentenceItem.targetVocab.kanjiWord];
        let targetReading = sentenceItem.targetVocab.hiragana;
        let maskedWordInSentence = '';
        if (bd && bd.chars.length > 0) {
          const charIdx = bd.chars.indexOf(targetChar);
          if (charIdx !== -1) {
            targetReading = bd.readings[charIdx] || targetReading;
            maskedWordInSentence = bd.chars.map((ch, idx) => {
              if (idx === charIdx) return `【 ${targetReading} 】`;
              const isKnown = masteredKanjiSet.has(ch) || lessonKanjiSet.has(ch);
              return isKnown ? ch : (bd.readings[idx] || ch);
            }).join('');
          }
        }
        if (!maskedWordInSentence) {
          maskedWordInSentence = `【 ${sentenceItem.targetVocab.hiragana} 】`;
        }

        // Chuyển câu sang dạng chỉ khoanh âm đọc chữ Hán mục tiêu
        let hiraSentence = sentenceItem.japanese;
        if (hiraSentence.includes(sentenceItem.targetVocab.kanjiWord)) {
          hiraSentence = hiraSentence.replace(sentenceItem.targetVocab.kanjiWord, maskedWordInSentence);
        } else if (hiraSentence.includes(sentenceItem.targetVocab.hiragana)) {
          hiraSentence = hiraSentence.replace(sentenceItem.targetVocab.hiragana, maskedWordInSentence);
        } else {
          hiraSentence = `「これは ${maskedWordInSentence} ですか。」`;
        }

        const promptText = `👉 Chọn chữ Hán đúng của âm đọc trong dấu 【 】:`;

        // 4 options là các chữ Kanji đơn lẻ, khử trùng lặp tuyệt đối
        const otherChars = eligibleKanji
          .filter(k => k.character !== targetChar)
          .map(k => k.character);

        const fallbackSingles = ['本', '車', '食', '室', '会', '社', '時', '計', '国', '駅', '電', '所', '校', '店', '人', '先', '生', '学'];
        const uniqueWrongPool = Array.from(new Set([
          ...otherChars,
          ...fallbackSingles
        ])).filter(c => c !== targetChar && /[\u4E00-\u9FAF]/.test(c));

        const wrongChars = shuffleArray(uniqueWrongPool).slice(0, 3);

        while (wrongChars.length < 3) {
          wrongChars.push('人');
        }

        const allOptions = shuffleArray([targetChar, ...wrongChars.slice(0, 3)]);
        const corrIdx = allOptions.indexOf(targetChar);

        const explanationText = buildKanjiExplanation({
          sentenceMeaning: sentenceItem.meaning,
          targetVocab: sentenceItem.targetVocab
        });

        generatedQuestions.push({
          id: `q_t31_${attempts}`,
          category: 'type3_sentence',
          subType: 'type3_1_hira',
          badgeLabel: 'Dạng 3.1: Tìm Kanji trong câu',
          prompt: promptText,
          displaySubject: hiraSentence,
          sentenceContext: sentenceItem.japanese,
          sentenceTranslation: sentenceItem.meaning,
          targetWord: targetChar,
          targetWordReading: targetReading,
          targetWordMeaning: sentenceItem.targetVocab.meaning,
          options: allOptions,
          correctIndex: corrIdx,
          explanation: explanationText.trim()
        });
      }

      // 3.2: Điền khuyết từ ghép trong câu
      else {
        const targetChar = sentenceItem.targetVocab.kanjiChars[0] || eligibleKanji[0].character;
        const targetWord = sentenceItem.targetVocab.kanjiWord;

        // Điền khuyết trong câu: thay targetChar bằng 【 ? 】
        let maskedSentence = sentenceItem.japanese;
        if (maskedSentence.includes(targetWord)) {
          const maskedWord = targetWord.replace(targetChar, '【 ? 】');
          maskedSentence = maskedSentence.replace(targetWord, maskedWord);
        } else if (maskedSentence.includes(sentenceItem.targetVocab.hiragana)) {
          const maskedWord = targetWord.replace(targetChar, '【 ? 】');
          maskedSentence = maskedSentence.replace(sentenceItem.targetVocab.hiragana, maskedWord);
        } else {
          maskedSentence = `「これは 【 ? 】 ですか。」`;
        }

        // 4 lựa chọn chữ Hán đơn lẻ, khử trùng lặp tuyệt đối
        const otherChars = eligibleKanji
          .filter(k => k.character !== targetChar)
          .map(k => k.character);

        const fallbackSingles = ['本', '車', '食', '室', '会', '社', '時', '計', '国', '駅', '電', '所', '校', '店', '人', '先', '生', '学'];
        const uniqueWrongPool = Array.from(new Set([
          ...otherChars,
          ...fallbackSingles
        ])).filter(c => c !== targetChar && /[\u4E00-\u9FAF]/.test(c));

        const wrongChars = shuffleArray(uniqueWrongPool).slice(0, 3);

        while (wrongChars.length < 3) {
          wrongChars.push('人');
        }

        const allOptions = shuffleArray([targetChar, ...wrongChars.slice(0, 3)]);
        const corrIdx = allOptions.indexOf(targetChar);

        const explanationText = buildKanjiExplanation({
          sentenceMeaning: sentenceItem.meaning,
          targetVocab: sentenceItem.targetVocab
        });

        generatedQuestions.push({
          id: `q_t32_${attempts}`,
          category: 'type3_sentence',
          subType: 'type3_2_blank',
          badgeLabel: 'Dạng 3.2: Điền khuyết trong câu',
          prompt: '👉 Chọn chữ Hán thích hợp điền vào 【 ? 】 trong câu trên:',
          displaySubject: maskedSentence,
          sentenceContext: sentenceItem.japanese,
          sentenceTranslation: sentenceItem.meaning,
          targetWord: targetChar,
          targetWordReading: sentenceItem.targetVocab.hiragana,
          targetWordMeaning: sentenceItem.targetVocab.meaning,
          options: allOptions,
          correctIndex: corrIdx,
          explanation: explanationText.trim()
        });
      }
    }
  }

  return shuffleArray(generatedQuestions);
}
