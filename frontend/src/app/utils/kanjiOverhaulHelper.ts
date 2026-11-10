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
  '三人': { chars: ['三', '人'], readings: ['さん', 'にん'] },
  '勉強': { chars: ['勉', '強'], readings: ['べん', 'きょう'] },
  '野菜': { chars: ['野', '菜'], readings: ['や', 'さい'] },
  '写真': { chars: ['写', '真'], readings: ['しゃ', 'しん'] },
  '牛乳': { chars: ['牛', '乳'], readings: ['ぎゅう', 'にゅう'] },
  '専門': { chars: ['専', '門'], readings: ['せん', 'もん'] },
  '病気': { chars: ['病', '気'], readings: ['びょう', 'き'] },
  '問題': { chars: ['問', '題'], readings: ['もん', 'だい'] },
  '運転': { chars: ['運', '転'], readings: ['うん', 'てん'] },
  '首相': { chars: ['首', '相'], readings: ['しゅ', 'しょう'] },
  '説明': { chars: ['説', '明'], readings: ['せつ', 'めい'] },
  '生産': { chars: ['生', '産'], readings: ['せい', 'さん'] },
  '場所': { chars: ['場', '所'], readings: ['ば', 'しょ'] },
  '到頭': { chars: ['到', '頭'], readings: ['とう', 'とう'] },
  '主人公': { chars: ['主', '人', '公'], readings: ['しゅ', 'じん', 'こう'] },
  '森林': { chars: ['森', '林'], readings: ['しん', 'りん'] },
  '引き出し': { chars: ['引', 'き', '出', 'し'], readings: ['ひ', 'き', 'だ', 'し'] },
  '電池': { chars: ['電', '池'], readings: ['でん', 'ち'] },
  '都合': { chars: ['都', '合'], readings: ['つ', 'ごう'] },
  '都会': { chars: ['都', '会'], readings: ['と', 'かい'] },
  '乗り物': { chars: ['乗', 'り', '物'], readings: ['の', 'り', 'もの'] },
  '研究室': { chars: ['研', '究', '室'], readings: ['けん', 'きゅう', 'しつ'] },
  '市民': { chars: ['市', '民'], readings: ['し', 'みん'] },
  '地区': { chars: ['地', '区'], readings: ['ち', 'く'] },
  '格好': { chars: ['格', '好'], readings: ['かっ', 'こう'] },
  '試験': { chars: ['試', '験'], readings: ['し', 'けん'] },
  '遠慮': { chars: ['遠', '慮'], readings: ['えん', 'りょ'] },
  '洗濯物': { chars: ['洗', '濯', '物'], readings: ['せん', 'たく', 'もの'] },
  '宅配便': { chars: ['宅', '配', '便'], readings: ['たく', 'はい', 'びん'] },
  '知り合う': { chars: ['知', 'り', '合', 'う'], readings: ['し', 'り', 'あ', 'う'] },
  '世界': { chars: ['世', '界'], readings: ['せ', 'かい'] }
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
  // Bài 1 (13 chữ)
  '1_私': 'watashi', '1_人': 'jin', '1_先': 'sen', '1_生': 'sei', '1_学': 'gaku',
  '1_大': 'dai', '1_会': 'kai', '1_社': 'sha', '1_員': 'in', '1_日': 'nichi',
  '1_本': 'hon', '1_国': 'kuni', '1_銀': 'gin',
  // Bài 2 (11 chữ)
  '2_何': 'nan', '2_名': 'mei', '2_時': 'ji', '2_計': 'kei', '2_書': 'sho',
  '2_新': 'shin', '2_聞': 'bun', '2_語': 'go', '2_英': 'ei', '2_車': 'sha', '2_手': 'te',
  // Bài 3 (9 chữ)
  '3_一': 'ichi', '3_十': 'juu', '3_百': 'hyaku', '3_千': 'sen', '3_万': 'man',
  '3_円': 'en', '3_電': 'den', '3_食': 'shoku', '3_下': 'ka',
  // Bài 4 (16 chữ)
  '4_今': 'ima', '4_分': 'fun', '4_半': 'han', '4_午': 'go', '4_毎': 'mai',
  '4_休': 'yasu', '4_働': 'hatara', '4_勉': 'ben', '4_強': 'kyou', '4_曜': 'you',
  '4_月': 'getsu', '4_火': 'ka', '4_水': 'sui', '4_木': 'moku', '4_金': 'kin', '4_土': 'do',
  // Bài 5 (9 chữ)
  '5_行': 'i', '5_来': 'ki', '5_帰': 'kae', '5_校': 'kou', '5_駅': 'eki',
  '5_友': 'tomo', '5_週': 'shuu', '5_年': 'nen', '5_去': 'kyo',
  // Bài 6 (12 chữ)
  '6_飲': 'no', '6_見': 'mi', '6_読': 'yo', '6_買': 'ka', '6_写': 'sha', '6_真': 'shin',
  '6_店': 'mise', '6_朝': 'asa', '6_牛': 'gyuu', '6_魚': 'sakana', '6_菜': 'sai', '6_花': 'hana',
  // Bài 7 (5 chữ)
  '7_父': 'chichi', '7_母': 'haha', '7_紙': 'kami', '7_貸': 'ka', '7_借': 'ka',
  // Bài 8 (8 chữ)
  '8_山': 'yama', '8_白': 'shiro', '8_安': 'yasu', '8_古': 'furu',
  '8_小': 'chii', '8_低': 'hiku', '8_暑': 'atsu', '8_寒': 'samu',
  // Bài 9 (5 chữ)
  '9_上': 'jou', '9_少': 'suko', '9_漢': 'kan', '9_野': 'ya', '9_主': 'shu',
  // Bài 10 (12 chữ)
  '10_男': 'otoko', '10_女': 'onna', '10_犬': 'inu', '10_中': 'naka',
  '10_後': 'ushi', '10_右': 'migi', '10_左': 'hidari', '10_県': 'ken',
  '10_東': 'higashi', '10_西': 'nishi', '10_南': 'minami', '10_北': 'kita',
  // Bài 11 (12 chữ)
  '11_二': 'ni', '11_三': 'san', '11_四': 'yon', '11_五': 'go',
  '11_六': 'roku', '11_七': 'nana', '11_八': 'hachi', '11_九': 'kyuu',
  '11_兄': 'ani', '11_姉': 'ane', '11_弟': 'otouto', '11_妹': 'imouto',
  // Bài 12 (10 chữ)
  '12_天': 'ten', '12_気': 'ki', '12_雨': 'ame', '12_空': 'sora', '12_京': 'kyou',
  '12_春': 'haru', '12_夏': 'natsu', '12_秋': 'aki', '12_冬': 'fuyu', '12_軽': 'karu',
  // Bài 13 (4 chữ)
  '13_川': 'kawa', '13_入': 'hai', '13_歩': 'aru', '13_別': 'betsu',
  // Bài 14 (4 chữ)
  '14_前': 'mae', '14_待': 'ma', '14_住': 'su', '14_図': 'to',
  // Bài 15 (5 chữ)
  '15_出': 'da', '15_高': 'taka', '15_使': 'tsuka', '15_族': 'zoku', '15_門': 'mon',
  // Bài 16 (7 chữ)
  '16_長': 'naga', '16_目': 'me', '16_耳': 'mimi', '16_足': 'ashi', '16_顔': 'kao', '16_暗': 'kura', '16_口': 'kuchi',
  // Bài 17 (5 chữ)
  '17_病': 'byou', '17_院': 'in', '17_薬': 'kusuri', '17_問': 'mon', '17_題': 'dai',
  // Bài 18 (4 chữ)
  '18_歌': 'uta', '18_運': 'un', '18_転': 'ten', '18_集': 'atsu',
  // Bài 19 (4 chữ)
  '19_体': 'karada', '19_子': 'ko', '19_字': 'ji', '19_弱': 'yowa',
  // Bài 20 (4 chữ)
  '20_言': 'i', '20_話': 'wa', '20_始': 'haji', '20_終': 'o',
  // Bài 21 (5 chữ)
  '21_思': 'omo', '21_同': 'ona', '21_多': 'oo', '21_立': 'ta', '21_首': 'shu',
  // Bài 22 (4 chữ)
  '22_仕': 'shi', '22_室': 'shitsu', '22_間': 'kan', '22_広': 'hiro',
  // Bài 23 (4 chữ)
  '23_外': 'gai', '23_道': 'michi', '23_建': 'ta', '23_正': 'tada',
  // Bài 24 (3 chữ)
  '24_堂': 'dou', '24_説': 'setsu', '24_産': 'san',
  // Bài 25 (4 chữ)
  '25_考': 'kanga', '25_着': 'tsu', '25_田': 'da', '25_館': 'kan',
  // Bài 26 (5 chữ)
  '26_場': 'ba', '26_所': 'sho', '26_度': 'do', '26_悪': 'waru', '26_頭': 'atama',
  // Bài 27 (7 chữ)
  '27_公': 'kou', '27_昼': 'hiru', '27_走': 'hashi', '27_鳥': 'tori',
  '27_声': 'koe', '27_林': 'hayashi', '27_森': 'mori',
  // Bài 28 (4 chữ)
  '28_売': 'u', '28_通': 'kayo', '28_品': 'shina', '28_色': 'iro',
  // Bài 29 (5 chữ)
  '29_開': 'a', '29_事': 'ji', '29_物': 'mono', '29_地': 'chi', '29_茶': 'cha',
  // Bài 30 (4 chữ)
  '30_習': 'nara', '30_業': 'gyou', '30_引': 'hi', '30_池': 'ike',
  // Bài 31 (4 chữ)
  '31_映': 'ei', '31_画': 'ga', '31_自': 'ji', '31_村': 'mura',
  // Bài 32 (3 chữ)
  '32_夕': 'yuu', '32_方': 'kata', '32_飯': 'han',
  // Bài 33 (3 chữ)
  '33_急': 'iso', '33_明': 'mei', '33_短': 'mijika',
  // Bài 34 (6 chữ)
  '34_夜': 'yoru', '34_肉': 'niku', '34_赤': 'aka', '34_青': 'ao', '34_黒': 'kuro', '34_質': 'shitsu',
  // Bài 35 (5 chữ)
  '35_旅': 'ryo', '35_屋': 'ya', '35_海': 'umi', '35_近': 'chika', '35_都': 'tsu',
  // Bài 36 (4 chữ)
  '36_乗': 'no', '36_太': 'futo', '36_特': 'toku', '36_工': 'kou',
  // Bài 37 (4 chữ)
  '37_家': 'ie', '37_者': 'mono', '37_料': 'ryou', '37_起': 'o',
  // Bài 38 (5 chữ)
  '38_研': 'ken', '38_究': 'kyuu', '38_市': 'shi', '38_区': 'ku', '38_民': 'min',
  // Bài 39 (6 chữ)
  '39_早': 'haya', '39_好': 'su', '39_服': 'fuku', '39_台': 'tai', '39_風': 'kaze', '39_死': 'shi',
  // Bài 40 (4 chữ)
  '40_試': 'shi', '40_験': 'ken', '40_動': 'ugo', '40_重': 'omo',
  // Bài 41 (4 chữ)
  '41_楽': 'tano', '41_文': 'bun', '41_有': 'yuu', '41_町': 'machi',
  // Bài 42 (3 chữ)
  '42_教': 'oshi', '42_音': 'oto', '42_進': 'susu',
  // Bài 43 (4 chữ)
  '43_切': 'ki', '43_不': 'fu', '43_味': 'aji', '43_光': 'hikari',
  // Bài 44 (4 chữ)
  '44_洗': 'ara', '44_遠': 'too', '44_理': 'ri', '44_洋': 'you',
  // Bài 45 (4 chữ)
  '45_止': 'to', '45_答': 'kota', '45_用': 'you', '45_以': 'i',
  // Bài 46 (4 chữ)
  '46_知': 'shi', '46_注': 'chuu', '46_親': 'oya', '46_便': 'bin',
  // Bài 47 (4 chữ)
  '47_医': 'i', '47_発': 'hatsu', '47_回': 'mawa', '47_合': 'a',
  // Bài 48 (3 chữ)
  '48_元': 'gen', '48_代': 'ka', '48_意': 'i',
  // Bài 49 (4 chữ)
  '49_作': 'tsuku', '49_持': 'mo', '49_世': 'se', '49_界': 'kai',
  // Bài 50 (3 chữ)
  '50_送': 'oku', '50_心': 'kokoro', '50_力': 'chikara'
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
      const kWord = (v.kanji_word || v.kanji_form || v.kanji || '').trim();
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

export interface KanjiCompoundCandidate {
  word: string;
  reading: string;
  meaning: string;
  isMultiChar: boolean;
}

/**
 * Thu thập danh sách từ ghép / từ vựng chứa chữ Hán mục tiêu của bài học.
 * Ưu tiên từ ghép đa ký tự (>= 2 ký tự không tính dấu ～/~) từ:
 * 1. Danh sách từ vựng của bài học (vocabItems)
 * 2. Trường compounds của chữ Hán mục tiêu & các chữ Hán cùng bài
 * 3. Bảng phân rã KANJI_COMPOUND_BREAKDOWN
 * 4. Fallback an toàn về từ đơn chứa chữ Hán nếu không có từ đa ký tự
 */
export function getLessonCompoundCandidatesForKanji(
  targetKanji: KanjiItemData,
  vocabItems: any[] = [],
  allLessonKanji: KanjiItemData[] = []
): KanjiCompoundCandidate[] {
  if (!targetKanji || !targetKanji.character) return [];
  const targetChar = targetKanji.character.trim();

  const multiCharList: KanjiCompoundCandidate[] = [];
  const singleCharList: KanjiCompoundCandidate[] = [];
  const seenWords = new Set<string>();

  const pushCandidate = (rawWord: string, rawReading: string, rawMeaning: string) => {
    const word = (rawWord || '').trim();
    if (!word || !word.includes(targetChar)) return;
    if (seenWords.has(word)) return;
    seenWords.add(word);

    const coreWord = word.replace(/[～~・\s]/g, '');
    const isMultiChar = coreWord.length >= 2;
    const item: KanjiCompoundCandidate = {
      word,
      reading: (rawReading || '').trim(),
      meaning: (rawMeaning || '').trim(),
      isMultiChar
    };

    if (isMultiChar) {
      multiCharList.push(item);
    } else {
      singleCharList.push(item);
    }
  };

  // 1. Ưu tiên từ vựng trong chính bài học hiện tại
  for (const v of vocabItems || []) {
    if (!v) continue;
    const kWord = (v.kanji_word || v.kanji_form || v.kanji || '').trim();
    const hira = (v.hiragana || '').trim();
    if (!kWord || kWord === hira) continue;
    if (kWord.includes(targetChar)) {
      pushCandidate(kWord, hira, v.vietnamese_meaning || '');
    }
  }

  // Helper tách trường compounds dạng "会社 (かいしゃ): Công ty; 社員 (しゃいん): Nhân viên"
  const parseCompoundsField = (compoundsStr?: string) => {
    if (!compoundsStr) return;
    const parts = compoundsStr.split(/[;\n]/);
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const m = trimmed.match(/^([^\(（:：\s]+)(?:\s*[\(（]([^\)）]+)[\)）])?\s*(?:[:：]\s*(.+))?$/);
      if (m) {
        const word = (m[1] || '').trim();
        const reading = (m[2] || '').trim();
        const meaning = (m[3] || '').trim();
        if (word && word.includes(targetChar)) {
          pushCandidate(word, reading, meaning);
        }
      }
    }
  };

  // 2. Từ trường compounds của chính chữ Hán mục tiêu
  parseCompoundsField(targetKanji.compounds);

  // 3. Từ trường compounds của các chữ Hán khác trong cùng bài
  for (const k of allLessonKanji || []) {
    if (!k || k.character === targetChar) continue;
    parseCompoundsField(k.compounds);
  }

  // 4. Từ bảng KANJI_COMPOUND_BREAKDOWN (chỉ lấy từ có các chữ Hán thuộc bài <= bài hiện tại)
  if (multiCharList.length === 0) {
    const maxLid = targetKanji.lesson_id || 50;
    for (const [kWord, bd] of Object.entries(KANJI_COMPOUND_BREAKDOWN)) {
      if (kWord.length >= 2 && kWord.includes(targetChar)) {
        const kanjiChars = kWord.match(/[\u4E00-\u9FAF]/g) || [];
        const withinScope = kanjiChars.every(c => (GLOBAL_KANJI_META[c]?.lesson || 999) <= maxLid);
        if (withinScope) {
          pushCandidate(kWord, bd.readings.join(''), '');
        }
      }
    }
  }

  if (multiCharList.length > 0) {
    return multiCharList;
  }

  if (singleCharList.length > 0) {
    return singleCharList;
  }

  // 5. Fallback an toàn tuyệt đối
  const fallbackKana = (
    (targetKanji.kunyomi || targetKanji.onyomi || '')
      .split(/[\s,()（）.]+/)
      .find(tok => /[\u3040-\u309F\u30A0-\u30FF]/.test(tok)) || ''
  ).trim();

  return [
    {
      word: targetChar,
      reading: fallbackKana,
      meaning: targetKanji.vietnamese_meaning || '',
      isMultiChar: false
    }
  ];
}

/**
 * Bản đồ tra cứu chữ Hán: Âm Hán, Nghĩa tiếng Việt và Bài học giới thiệu.
 */
export const GLOBAL_KANJI_META: Record<string, { sino: string; meaning: string; lesson: number }> = {
  '人': { sino: 'NHÂN', meaning: 'Người', lesson: 1 },
  '先': { sino: 'TIÊN', meaning: 'Trước, đi đầu', lesson: 1 },
  '国': { sino: 'QUỐC', meaning: 'Đất nước, quốc gia', lesson: 1 },
  '大': { sino: 'ĐẠI', meaning: 'Lớn, to lớn', lesson: 1 },
  '学': { sino: 'HỌC', meaning: 'Học, học vấn, trường học', lesson: 1 },
  '日': { sino: 'NHẬT', meaning: 'Ngày, mặt trời, nước Nhật', lesson: 1 },
  '本': { sino: 'BẢN', meaning: 'Sách, cội nguồn, bản chất', lesson: 1 },
  '生': { sino: 'SINH', meaning: 'Sống, sinh ra, học sinh', lesson: 1 },
  '会': { sino: 'HỘI', meaning: 'Hội họp, gặp gỡ', lesson: 1 },
  '員': { sino: 'VIÊN', meaning: 'Thành viên, nhân viên', lesson: 1 },
  '社': { sino: 'XÃ', meaning: 'Đền thờ, xã hội, công ty', lesson: 1 },
  '私': { sino: 'TƯ', meaning: 'Tôi, riêng tư', lesson: 1 },
  '銀': { sino: 'NGÂN', meaning: 'Bạc, ngân hàng', lesson: 1 },
  '何': { sino: 'HÀ', meaning: 'Cái gì', lesson: 2 },
  '名': { sino: 'DANH', meaning: 'Tên, danh tiếng', lesson: 2 },
  '時': { sino: 'THỜI', meaning: 'thời gian, giờ', lesson: 2 },
  '書': { sino: 'THƯ', meaning: 'viết, sách', lesson: 2 },
  '聞': { sino: 'VĂN', meaning: 'nghe, hỏi', lesson: 2 },
  '語': { sino: 'NGỮ', meaning: 'ngôn ngữ, kể', lesson: 2 },
  '車': { sino: 'XA', meaning: 'xe cộ, ô tô', lesson: 2 },
  '手': { sino: 'THỦ', meaning: 'Bàn tay, thủ lĩnh', lesson: 2 },
  '新': { sino: 'TÂN', meaning: 'mới', lesson: 2 },
  '英': { sino: 'ANH', meaning: 'Anh quốc, xuất sắc', lesson: 2 },
  '計': { sino: 'KẾ', meaning: 'kế hoạch, đo lường', lesson: 2 },
  '一': { sino: 'NHẤT', meaning: 'Một, số một', lesson: 3 },
  '万': { sino: 'VẠN', meaning: 'Vạn, mười nghìn', lesson: 3 },
  '下': { sino: 'HẠ', meaning: 'Dưới, xuống', lesson: 3 },
  '円': { sino: 'YÊN', meaning: 'Yên, hình tròn', lesson: 3 },
  '十': { sino: 'THẬP', meaning: 'Mười, số mười', lesson: 3 },
  '千': { sino: 'THIÊN', meaning: 'Nghìn, số nghìn', lesson: 3 },
  '百': { sino: 'BÁCH', meaning: 'Trăm, số một trăm', lesson: 3 },
  '電': { sino: 'ĐIỆN', meaning: 'Điện lực, sấm chớp', lesson: 3 },
  '食': { sino: 'THỰC', meaning: 'Ăn, đồ ăn', lesson: 3 },
  '今': { sino: 'KIM', meaning: 'Bây giờ, hiện tại', lesson: 4 },
  '休': { sino: 'HƯU', meaning: 'Nghỉ ngơi', lesson: 4 },
  '午': { sino: 'NGỌ', meaning: 'Buổi trưa', lesson: 4 },
  '半': { sino: 'BÁN', meaning: 'Nửa, một nửa, rưỡi', lesson: 4 },
  '土': { sino: 'THỔ', meaning: 'Đất, thổ nhưỡng, thứ bảy', lesson: 4 },
  '月': { sino: 'NGUYỆT', meaning: 'Mặt trăng, tháng', lesson: 4 },
  '木': { sino: 'MỘC', meaning: 'Cây, gỗ, thứ năm', lesson: 4 },
  '毎': { sino: 'MỖI', meaning: 'Mỗi, hằng (ngày/tháng)', lesson: 4 },
  '水': { sino: 'THỦY', meaning: 'Nước', lesson: 4 },
  '火': { sino: 'HỎA', meaning: 'Lửa, thứ ba', lesson: 4 },
  '金': { sino: 'KIM', meaning: 'Vàng, tiền, kim loại', lesson: 4 },
  '勉': { sino: 'MIỄN', meaning: 'Cố gắng, chăm chỉ', lesson: 4 },
  '強': { sino: 'CƯỜNG', meaning: 'Mạnh mẽ, cố chấp', lesson: 4 },
  '曜': { sino: 'DIỆU', meaning: 'Thứ trong tuần, ánh sáng', lesson: 4 },
  '分': { sino: 'PHÂN', meaning: 'Phút; chia, hiểu', lesson: 4 },
  '働': { sino: 'ĐỘNG', meaning: 'Làm việc, lao động', lesson: 4 },
  '友': { sino: 'HỮU', meaning: 'Bạn bè, hữu hảo', lesson: 5 },
  '年': { sino: 'NIÊN', meaning: 'Năm, tuổi', lesson: 5 },
  '来': { sino: 'LAI', meaning: 'Đến, tương lai', lesson: 5 },
  '校': { sino: 'HIỆU', meaning: 'Trường học, hiệu đính', lesson: 5 },
  '行': { sino: 'HÀNH', meaning: 'Đi, tiến hành', lesson: 5 },
  '去': { sino: 'KHỨ', meaning: 'Quá khứ, rời đi', lesson: 5 },
  '帰': { sino: 'QUY', meaning: 'Trở về, quy tụ', lesson: 5 },
  '週': { sino: 'CHU', meaning: 'Tuần, vòng quanh', lesson: 5 },
  '駅': { sino: 'DỊCH', meaning: 'Nhà ga', lesson: 5 },
  '見': { sino: 'KIẾN', meaning: 'Nhìn, xem, ý kiến', lesson: 6 },
  '読': { sino: 'ĐỘC', meaning: 'Đọc', lesson: 6 },
  '写': { sino: 'TẢ', meaning: 'Chép lại, chụp (ảnh)', lesson: 6 },
  '店': { sino: 'ĐIẾM', meaning: 'cửa hàng, tiệm', lesson: 6 },
  '朝': { sino: 'TRIỀU', meaning: 'Buổi sáng, triều đại', lesson: 6 },
  '牛': { sino: 'NGƯU', meaning: 'Con bò', lesson: 6 },
  '真': { sino: 'CHÂN', meaning: 'Thật, chân thật', lesson: 6 },
  '花': { sino: 'HOA', meaning: 'Bông hoa', lesson: 6 },
  '買': { sino: 'MÃI', meaning: 'Mua', lesson: 6 },
  '飲': { sino: 'ẨM', meaning: 'Uống, ẩm thực', lesson: 6 },
  '魚': { sino: 'NGƯ', meaning: 'Con cá', lesson: 6 },
  '菜': { sino: 'THÁI', meaning: 'Rau', lesson: 6 },
  '母': { sino: 'MẪU', meaning: 'Mẹ', lesson: 7 },
  '父': { sino: 'PHỤ', meaning: 'Bố, cha', lesson: 7 },
  '借': { sino: 'TÁ', meaning: 'Mượn, vay', lesson: 7 },
  '紙': { sino: 'CHỈ', meaning: 'Giấy', lesson: 7 },
  '貸': { sino: 'THẢI', meaning: 'Cho mượn, cho vay', lesson: 7 },
  '小': { sino: 'TIỂU', meaning: 'Nhỏ, bé', lesson: 8 },
  '山': { sino: 'SƠN', meaning: 'Núi, ngọn núi', lesson: 8 },
  '白': { sino: 'BẠCH', meaning: 'Màu trắng, sáng', lesson: 8 },
  '古': { sino: 'CỔ', meaning: 'Cũ, cổ xưa', lesson: 8 },
  '安': { sino: 'AN', meaning: 'Rẻ, an tâm, yên ổn', lesson: 8 },
  '低': { sino: 'ĐÊ', meaning: 'Thấp', lesson: 8 },
  '寒': { sino: 'HÀN', meaning: 'Lạnh (thời tiết)', lesson: 8 },
  '暑': { sino: 'THỬ', meaning: 'Nóng (thời tiết)', lesson: 8 },
  '上': { sino: 'THƯỢNG', meaning: 'Trên, lên trên', lesson: 9 },
  '主': { sino: 'CHỦ', meaning: 'Chủ nhân, nhân vật chính', lesson: 9 },
  '少': { sino: 'THIỂU', meaning: 'Ít', lesson: 9 },
  '漢': { sino: 'HÁN', meaning: 'Hán, chữ Hán', lesson: 9 },
  '野': { sino: 'DÃ', meaning: 'cánh đồng, hoang dã', lesson: 9 },
  '中': { sino: 'TRUNG', meaning: 'Trong, ở giữa', lesson: 10 },
  '右': { sino: 'HỮU', meaning: 'Bên phải, phía phải', lesson: 10 },
  '女': { sino: 'NỮ', meaning: 'Phụ nữ, nữ giới', lesson: 10 },
  '左': { sino: 'TẢ', meaning: 'Bên trái, phía trái', lesson: 10 },
  '後': { sino: 'HẬU', meaning: 'Sau, phía sau', lesson: 10 },
  '男': { sino: 'NAM', meaning: 'Đàn ông, nam giới', lesson: 10 },
  '犬': { sino: 'KHUYỂN', meaning: 'Con chó', lesson: 10 },
  '県': { sino: 'HUYỆN', meaning: 'Tỉnh (của Nhật)', lesson: 10 },
  '北': { sino: 'BẮC', meaning: 'Phía bắc', lesson: 10 },
  '南': { sino: 'NAM', meaning: 'Phía nam, phương nam', lesson: 10 },
  '東': { sino: 'ĐÔNG', meaning: 'Phía đông, phương đông', lesson: 10 },
  '西': { sino: 'TÂY', meaning: 'Phía tây, phương tây', lesson: 10 },
  '七': { sino: 'THẤT', meaning: 'Bảy, số bảy', lesson: 11 },
  '三': { sino: 'TAM', meaning: 'Ba, số ba', lesson: 11 },
  '九': { sino: 'CỬU', meaning: 'Chín, số chín', lesson: 11 },
  '二': { sino: 'NHỊ', meaning: 'Hai, số hai', lesson: 11 },
  '五': { sino: 'NGŨ', meaning: 'Năm, số năm', lesson: 11 },
  '八': { sino: 'BÁT', meaning: 'Tám, số tám', lesson: 11 },
  '六': { sino: 'LỤC', meaning: 'Sáu, số sáu', lesson: 11 },
  '四': { sino: 'TỨ', meaning: 'Bốn, số bốn', lesson: 11 },
  '兄': { sino: 'HUYNH', meaning: 'Anh trai', lesson: 11 },
  '妹': { sino: 'MUỘI', meaning: 'Em gái', lesson: 11 },
  '姉': { sino: 'TỶ', meaning: 'Chị gái', lesson: 11 },
  '弟': { sino: 'ĐỆ', meaning: 'Em trai', lesson: 11 },
  '天': { sino: 'THIÊN', meaning: 'Trời, thiên nhiên', lesson: 12 },
  '気': { sino: 'KHÍ', meaning: 'Không khí, khí chất, tinh thần', lesson: 12 },
  '雨': { sino: 'VŨ', meaning: 'Mưa', lesson: 12 },
  '京': { sino: 'KINH', meaning: 'kinh đô, to lớn', lesson: 12 },
  '冬': { sino: 'ĐÔNG', meaning: 'Mùa đông', lesson: 12 },
  '夏': { sino: 'HẠ', meaning: 'Mùa hè', lesson: 12 },
  '春': { sino: 'XUÂN', meaning: 'Mùa xuân', lesson: 12 },
  '秋': { sino: 'THU', meaning: 'Mùa thu', lesson: 12 },
  '空': { sino: 'KHÔNG', meaning: 'Bầu trời, trống rỗng', lesson: 12 },
  '軽': { sino: 'KHINH', meaning: 'Nhẹ', lesson: 12 },
  '入': { sino: 'NHẬP', meaning: 'Vào, đi vào', lesson: 13 },
  '川': { sino: 'XUYÊN', meaning: 'Sông, dòng sông', lesson: 13 },
  '別': { sino: 'BIỆT', meaning: 'Chia ly, khác biệt, đặc biệt', lesson: 13 },
  '歩': { sino: 'BỘ', meaning: 'Đi bộ, bước chân', lesson: 13 },
  '前': { sino: 'TIỀN', meaning: 'Trước, phía trước', lesson: 14 },
  '住': { sino: 'TRÚ', meaning: 'Sống, cư trú', lesson: 14 },
  '図': { sino: 'ĐỒ', meaning: 'Bản đồ, đồ án', lesson: 14 },
  '待': { sino: 'ĐÃI', meaning: 'Chờ đợi, đối đãi', lesson: 14 },
  '出': { sino: 'XUẤT', meaning: 'Ra ngoài, xuất phát', lesson: 15 },
  '高': { sino: 'CAO', meaning: 'Cao, đắt tiền', lesson: 15 },
  '使': { sino: 'SỬ', meaning: 'Sử dụng, sứ giả', lesson: 15 },
  '族': { sino: 'TỘC', meaning: 'Gia tộc, chủng tộc', lesson: 15 },
  '門': { sino: 'MÔN', meaning: 'Cổng; chuyên môn', lesson: 15 },
  '長': { sino: 'TRƯỜNG, TRƯỞNG', meaning: 'Dài, trưởng phòng', lesson: 16 },
  '目': { sino: 'MỤC', meaning: 'Mắt, hạng mục', lesson: 16 },
  '足': { sino: 'TÚC', meaning: 'Chân, đầy đủ', lesson: 16 },
  '耳': { sino: 'NHĨ', meaning: 'Cái tai', lesson: 16 },
  '顔': { sino: 'NHAN', meaning: 'Khuôn mặt', lesson: 16 },
  '暗': { sino: 'ÁM', meaning: 'Tối', lesson: 16 },
  '口': { sino: 'KHẨU', meaning: 'Miệng, cổng, lối vào', lesson: 16 },
  '問': { sino: 'VẤN', meaning: 'Hỏi, câu hỏi', lesson: 17 },
  '病': { sino: 'BỆNH', meaning: 'Bệnh tật, ốm đau', lesson: 17 },
  '院': { sino: 'VIỆN', meaning: 'Tòa nhà, bệnh viện, học viện', lesson: 17 },
  '題': { sino: 'ĐỀ', meaning: 'Đề tài, vấn đề', lesson: 17 },
  '薬': { sino: 'DƯỢC', meaning: 'Thuốc', lesson: 17 },
  '歌': { sino: 'CA', meaning: 'Hát, bài hát', lesson: 18 },
  '転': { sino: 'CHUYỂN', meaning: 'Xoay tròn, ngã, chuyển đổi', lesson: 18 },
  '運': { sino: 'VẬN', meaning: 'Vận chuyển, vận mệnh', lesson: 18 },
  '集': { sino: 'TẬP', meaning: 'Tập hợp, thu thập', lesson: 18 },
  '子': { sino: 'TỬ', meaning: 'Đứa con, em bé', lesson: 19 },
  '体': { sino: 'THỂ', meaning: 'Cơ thể, thân thể', lesson: 19 },
  '字': { sino: 'TỰ', meaning: 'Chữ viết, ký tự', lesson: 19 },
  '弱': { sino: 'NHƯỢC', meaning: 'Yếu', lesson: 19 },
  '話': { sino: 'THOẠI', meaning: 'Nói chuyện, hội thoại', lesson: 20 },
  '始': { sino: 'THỦY', meaning: 'Bắt đầu, khởi đầu', lesson: 20 },
  '終': { sino: 'CHUNG', meaning: 'Kết thúc, điểm cuối', lesson: 20 },
  '言': { sino: 'NGÔN', meaning: 'Nói, ngôn ngữ', lesson: 20 },
  '同': { sino: 'ĐỒNG', meaning: 'Giống nhau, cùng', lesson: 21 },
  '多': { sino: 'ĐA', meaning: 'Nhiều', lesson: 21 },
  '思': { sino: 'TƯ', meaning: 'Suy nghĩ, ý nghĩ, tư tưởng', lesson: 21 },
  '立': { sino: 'LẬP', meaning: 'Đứng, thiết lập', lesson: 21 },
  '首': { sino: 'THỦ', meaning: 'Cổ; người đứng đầu', lesson: 21 },
  '間': { sino: 'GIAN', meaning: 'Ở giữa, khoảng gian', lesson: 22 },
  '仕': { sino: 'SĨ', meaning: 'Làm việc, phục vụ', lesson: 22 },
  '室': { sino: 'THẤT', meaning: 'Phòng, lớp học', lesson: 22 },
  '広': { sino: 'QUẢNG', meaning: 'Rộng rãi, quảng cáo', lesson: 22 },
  '外': { sino: 'NGOẠI', meaning: 'Ngoài, bên ngoài, ngoại quốc', lesson: 23 },
  '建': { sino: 'KIẾN', meaning: 'Xây dựng, dựng nên', lesson: 23 },
  '正': { sino: 'CHÍNH', meaning: 'đúng đắn, chính xác', lesson: 23 },
  '道': { sino: 'ĐẠO', meaning: 'Con đường, đạo', lesson: 23 },
  '堂': { sino: 'ĐƯỜNG', meaning: 'Nhà lớn, chính đường', lesson: 24 },
  '説': { sino: 'THUYẾT', meaning: 'Giải thích', lesson: 24 },
  '産': { sino: 'SẢN', meaning: 'Sản xuất, đặc sản', lesson: 24 },
  '田': { sino: 'ĐIỀN', meaning: 'ruộng lúa', lesson: 25 },
  '着': { sino: 'TRƯỚC', meaning: 'Mặc quần áo, đến nơi', lesson: 25 },
  '考': { sino: 'KHẢO', meaning: 'Suy nghĩ, khảo sát', lesson: 25 },
  '館': { sino: 'QUÁN', meaning: 'Tòa nhà, hội quán', lesson: 25 },
  '場': { sino: 'TRƯỜNG', meaning: 'Nơi chốn, quảng trường', lesson: 26 },
  '度': { sino: 'ĐỘ', meaning: 'Lần, mức độ, nhiệt độ', lesson: 26 },
  '悪': { sino: 'ÁC', meaning: 'Xấu, ác, độc', lesson: 26 },
  '所': { sino: 'SỞ', meaning: 'Nơi chốn, địa điểm', lesson: 26 },
  '頭': { sino: 'ĐẦU', meaning: 'Cái đầu', lesson: 26 },
  '公': { sino: 'CÔNG', meaning: 'công cộng, chung', lesson: 27 },
  '昼': { sino: 'TRÚ', meaning: 'Buổi trưa', lesson: 27 },
  '走': { sino: 'TẨU', meaning: 'Chạy', lesson: 27 },
  '鳥': { sino: 'ĐIỂU', meaning: 'Con chim', lesson: 27 },
  '声': { sino: 'THANH', meaning: 'Giọng nói', lesson: 27 },
  '林': { sino: 'LÂM', meaning: 'Rừng cây thưa', lesson: 27 },
  '森': { sino: 'SÂM', meaning: 'Rừng rậm', lesson: 27 },
  '品': { sino: 'PHẨM', meaning: 'Sản phẩm, phẩm chất, hàng hóa', lesson: 28 },
  '売': { sino: 'MẠI', meaning: 'Bán', lesson: 28 },
  '色': { sino: 'SẮC', meaning: 'Màu sắc, sắc thái', lesson: 28 },
  '通': { sino: 'THÔNG', meaning: 'Đi qua, đi lại, thông suốt', lesson: 28 },
  '事': { sino: 'SỰ', meaning: 'Sự việc, công việc', lesson: 29 },
  '地': { sino: 'ĐỊA', meaning: 'Đất đai, mặt đất', lesson: 29 },
  '物': { sino: 'VẬT', meaning: 'Đồ vật, sự vật', lesson: 29 },
  '茶': { sino: 'TRÀ', meaning: 'Trà, chè', lesson: 29 },
  '開': { sino: 'KHAI', meaning: 'Mở ra, khai mạc', lesson: 29 },
  '業': { sino: 'NGHIỆP', meaning: 'Công việc, nghề nghiệp', lesson: 30 },
  '習': { sino: 'TẬP', meaning: 'Học tập, luyện tập', lesson: 30 },
  '引': { sino: 'DẪN', meaning: 'Kéo, ngăn kéo', lesson: 30 },
  '池': { sino: 'TRÌ', meaning: 'Cái ao; pin', lesson: 30 },
  '映': { sino: 'ÁNH', meaning: 'phản chiếu, chiếu bóng', lesson: 31 },
  '画': { sino: 'HỌA', meaning: 'bức tranh, kế hoạch', lesson: 31 },
  '自': { sino: 'TỰ', meaning: 'Tự bản thân, tự động', lesson: 31 },
  '村': { sino: 'THÔN', meaning: 'Ngôi làng', lesson: 31 },
  '夕': { sino: 'TỊCH', meaning: 'chiều tối, hoàng hôn', lesson: 32 },
  '方': { sino: 'PHƯƠNG', meaning: 'Phương hướng, cách thức', lesson: 32 },
  '飯': { sino: 'PHẠN', meaning: 'cơm, bữa ăn', lesson: 32 },
  '急': { sino: 'CẤP', meaning: 'Khẩn cấp, vội vã', lesson: 33 },
  '明': { sino: 'MINH', meaning: 'Sáng sủa, thông minh', lesson: 33 },
  '短': { sino: 'ĐOẢN', meaning: 'Ngắn', lesson: 33 },
  '夜': { sino: 'DẠ', meaning: 'Buổi tối, ban đêm', lesson: 34 },
  '肉': { sino: 'NHỤC', meaning: 'Thịt', lesson: 34 },
  '質': { sino: 'CHẤT', meaning: 'chất lượng, chất vấn', lesson: 34 },
  '赤': { sino: 'XÍCH', meaning: 'màu đỏ', lesson: 34 },
  '青': { sino: 'THANH', meaning: 'màu xanh lam', lesson: 34 },
  '黒': { sino: 'HẮC', meaning: 'màu đen', lesson: 34 },
  '屋': { sino: 'ỐC', meaning: 'Căn nhà, hiệu buôn', lesson: 35 },
  '旅': { sino: 'LỮ', meaning: 'Du lịch, lữ khách', lesson: 35 },
  '海': { sino: 'HẢI', meaning: 'Biển, đại dương', lesson: 35 },
  '近': { sino: 'CẬN', meaning: 'Gần', lesson: 35 },
  '都': { sino: 'ĐÔ', meaning: 'Đô thị, kinh đô', lesson: 35 },
  '工': { sino: 'CÔNG', meaning: 'thợ, công việc', lesson: 36 },
  '特': { sino: 'ĐẶC', meaning: 'Đặc biệt', lesson: 36 },
  '太': { sino: 'THÁI', meaning: 'To, béo; mặt trời', lesson: 36 },
  '乗': { sino: 'THỪA', meaning: 'Lên xe, phương tiện', lesson: 36 },
  '家': { sino: 'GIA', meaning: 'Nhà, gia đình', lesson: 37 },
  '料': { sino: 'LIỆU', meaning: 'Nguyên liệu, chi phí', lesson: 37 },
  '者': { sino: 'GIẢ', meaning: 'Người, học giả', lesson: 37 },
  '起': { sino: 'KHỞI', meaning: 'Thức dậy, khởi hành', lesson: 37 },
  '研': { sino: 'NGHIÊN', meaning: 'Mài, nghiên cứu', lesson: 38 },
  '究': { sino: 'CỨU', meaning: 'Nghiên cứu, điều tra', lesson: 38 },
  '市': { sino: 'THỊ', meaning: 'Thành phố', lesson: 38 },
  '民': { sino: 'DÂN', meaning: 'Nhân dân', lesson: 38 },
  '区': { sino: 'KHU', meaning: 'Quận, khu vực', lesson: 38 },
  '台': { sino: 'ĐÀI', meaning: 'Cái bệ, xe/máy móc', lesson: 39 },
  '早': { sino: 'TẢO', meaning: 'Sớm, nhanh chóng', lesson: 39 },
  '服': { sino: 'PHỤC', meaning: 'Quần áo, y phục', lesson: 39 },
  '死': { sino: 'TỬ', meaning: 'Chết, qua đời', lesson: 39 },
  '風': { sino: 'PHONG', meaning: 'Gió, phong cảnh', lesson: 39 },
  '好': { sino: 'HẢO', meaning: 'Thích, tốt', lesson: 39 },
  '動': { sino: 'ĐỘNG', meaning: 'Di chuyển, hoạt động', lesson: 40 },
  '試': { sino: 'THÍ', meaning: 'Thử nghiệm, thi cử', lesson: 40 },
  '重': { sino: 'TRỌNG', meaning: 'Nặng, quan trọng, trùng lặp', lesson: 40 },
  '験': { sino: 'NGHIỆM', meaning: 'Kiểm nghiệm, trải nghiệm', lesson: 40 },
  '文': { sino: 'VĂN', meaning: 'Văn chương, câu văn', lesson: 41 },
  '有': { sino: 'HỮU', meaning: 'Có, sở hữu', lesson: 41 },
  '楽': { sino: 'LẠC, NHẠC', meaning: 'Vui vẻ, âm nhạc', lesson: 41 },
  '町': { sino: 'ĐINH', meaning: 'Thị trấn, khu phố', lesson: 41 },
  '教': { sino: 'GIÁO', meaning: 'Dạy học, tôn giáo', lesson: 42 },
  '音': { sino: 'ÂM', meaning: 'Âm thanh, tiếng động', lesson: 42 },
  '進': { sino: 'TIẾN', meaning: 'Tiến lên, phát triển', lesson: 42 },
  '不': { sino: 'BẤT', meaning: 'chẳng, không', lesson: 43 },
  '切': { sino: 'THIẾT', meaning: 'Cắt, khẩn thiết', lesson: 43 },
  '味': { sino: 'VỊ', meaning: 'Mùi vị, ý vị', lesson: 43 },
  '光': { sino: 'QUANG', meaning: 'Ánh sáng, lấp lánh', lesson: 43 },
  '洋': { sino: 'DƯƠNG', meaning: 'Đại dương, phương Tây', lesson: 44 },
  '理': { sino: 'LÝ', meaning: 'Lý do, vật lý, quản lý', lesson: 44 },
  '遠': { sino: 'VIỄN', meaning: 'Xa; khách sáo', lesson: 44 },
  '洗': { sino: 'TẨY', meaning: 'Rửa, giặt', lesson: 44 },
  '以': { sino: 'DĨ', meaning: 'lấy, bằng, mốc', lesson: 45 },
  '止': { sino: 'CHỈ', meaning: 'Dừng lại, đình chỉ', lesson: 45 },
  '用': { sino: 'DỤNG', meaning: 'Sử dụng, công dụng', lesson: 45 },
  '答': { sino: 'ĐÁP', meaning: 'Trả lời, đáp án', lesson: 45 },
  '注': { sino: 'CHÚ', meaning: 'Rót, chú ý, tập trung', lesson: 46 },
  '知': { sino: 'TRI', meaning: 'Biết, tri thức', lesson: 46 },
  '親': { sino: 'THÂN', meaning: 'cha mẹ, thân thiết', lesson: 46 },
  '便': { sino: 'TIỆN', meaning: 'Tiện lợi; chuyển phát', lesson: 46 },
  '医': { sino: 'Y', meaning: 'Y học, thầy thuốc', lesson: 47 },
  '発': { sino: 'PHÁT', meaning: 'Xuất phát, phát minh', lesson: 47 },
  '回': { sino: 'HỒI', meaning: 'Xoay, quay; số lần', lesson: 47 },
  '合': { sino: 'HỢP', meaning: 'Hợp lại, gặp gỡ', lesson: 47 },
  '代': { sino: 'ĐẠI', meaning: 'Thay thế, thời đại', lesson: 48 },
  '元': { sino: 'NGUYÊN', meaning: 'gốc, ban đầu', lesson: 48 },
  '意': { sino: 'Ý', meaning: 'Ý kiến, ý nghĩa, ý chí', lesson: 48 },
  '世': { sino: 'THẾ', meaning: 'Thế giới, thế hệ', lesson: 49 },
  '作': { sino: 'TÁC', meaning: 'Chế tạo, sáng tác', lesson: 49 },
  '持': { sino: 'TRÌ', meaning: 'Cầm, nắm, mang theo', lesson: 49 },
  '界': { sino: 'GIỚI', meaning: 'Thế giới, giới hạn', lesson: 49 },
  '力': { sino: 'LỰC', meaning: 'sức mạnh, năng lực', lesson: 50 },
  '心': { sino: 'TÂM', meaning: 'Trái tim, tâm trí', lesson: 50 },
  '送': { sino: 'TỐNG', meaning: 'Gửi, tiễn đưa', lesson: 50 },
};

const KANJI_CHAR_REGEX = /[\u4E00-\u9FAF\u3400-\u4DBF]/;
const KANJI_GLOBAL_REGEX = /[\u4E00-\u9FAF\u3400-\u4DBF]/g;

/**
 * Xác định giới hạn bài học Kanji tối đa theo phạm vi cấp độ hiện tại:
 * - Khi học Bài 1..25 (N5): Phạm vi cho phép là Bài 1..25 (179 chữ Kanji).
 * - Khi học Bài 26..50 (N4): Phạm vi cho phép là toàn bộ Bài 1..50 (285 chữ Kanji).
 */
export function getMaxKanjiLessonForScope(lessonId: number): number {
  const id = Number(lessonId) || 1;
  return id <= 25 ? 25 : 50;
}

/**
 * Kiểm tra 1 chữ Hán đơn lẻ có nằm trong phạm vi cấp độ của bài học hiện tại không.
 */
export function isKanjiCharInScope(char: string, lessonId: number): boolean {
  const meta = GLOBAL_KANJI_META[char];
  if (!meta || !meta.lesson) return false;
  return meta.lesson <= getMaxKanjiLessonForScope(lessonId);
}

/**
 * Kiểm tra 1 từ hoặc cụm từ có toàn bộ chữ Hán nằm trong phạm vi cấp độ của bài học hiện tại không.
 * Nếu chuỗi không chứa chữ Hán nào -> true.
 */
export function isWordInKanjiScope(word: string, lessonId: number): boolean {
  if (!word) return true;
  const chars = word.match(KANJI_GLOBAL_REGEX);
  if (!chars || chars.length === 0) return true;
  return chars.every((ch) => isKanjiCharInScope(ch, lessonId));
}

/**
 * Từ điển đối chiếu nhanh các từ/tên riêng chứa chữ Hán ngoài phạm vi N5 (Bài 26-50)
 * hoặc ngoài phạm vi 50 bài để chuyển đổi độc lập khi không có chuỗi kana song song.
 */
const STANDALONE_SCOPED_LEXICON: Array<{
  kanji: string;
  kana: string;
  scopedN5: string;
  scopedN4: string;
}> = [
  // Cụm kết hợp giữa địa danh ngoài 50 bài + danh từ trong N5 (病院 thuộc Bài 17)
  { kanji: '神戸病院', kana: 'こうべびょういん', scopedN5: 'こうべ病院', scopedN4: 'こうべ病院' },
  { kanji: '神戸', kana: 'こうべ', scopedN5: 'こうべ', scopedN4: 'こうべ' },
  // Từ vựng có Kanji thuộc Bài 26..50 (Ngoài N5, nhưng Trong N4/50 bài)
  { kanji: '研究者', kana: 'けんきゅうしゃ', scopedN5: 'けんきゅうしゃ', scopedN4: '研究者' },
  { kanji: '医者', kana: 'いしゃ', scopedN5: 'いしゃ', scopedN4: '医者' },
  { kanji: '自動車', kana: 'じどうしゃ', scopedN5: 'じどうしゃ', scopedN4: '自動車' },
  { kanji: '自転車', kana: 'じてんしゃ', scopedN5: 'じてんしゃ', scopedN4: '自転車' },
  { kanji: '教室', kana: 'きょうしつ', scopedN5: 'きょうしつ', scopedN4: '教室' },
  { kanji: '本屋', kana: 'ほんや', scopedN5: 'ほんや', scopedN4: '本屋' },
  { kanji: '家族', kana: 'かぞく', scopedN5: 'かぞく', scopedN4: '家族' },
  { kanji: '昼休み', kana: 'ひるやすみ', scopedN5: 'ひる休み', scopedN4: '昼休み' },
  { kanji: 'あの方', kana: 'あのかた', scopedN5: 'あのかた', scopedN4: 'あの方' },
  { kanji: '木村', kana: 'きむら', scopedN5: 'きむら', scopedN4: '木村' },
  { kanji: '太郎', kana: 'たろう', scopedN5: 'たろう', scopedN4: '太郎' },
  { kanji: '方は', kana: 'かたは', scopedN5: 'かたは', scopedN4: '方は' },
  { kanji: '方も', kana: 'かたも', scopedN5: 'かたも', scopedN4: '方も' },
  { kanji: '方の', kana: 'かたの', scopedN5: 'かたの', scopedN4: '方の' },
  { kanji: '方', kana: 'かた', scopedN5: 'かた', scopedN4: '方' },
  // Từ vựng & tên riêng có chữ Hán nằm ngoài 50 bài (Chuyển sang Hiragana ở cả N5 và N4)
  { kanji: '韓国人', kana: 'かんこくじん', scopedN5: 'かんこくじん', scopedN4: 'かんこくじん' },
  { kanji: '韓国', kana: 'かんこく', scopedN5: 'かんこく', scopedN4: 'かんこく' },
  { kanji: '郵便局', kana: 'ゆうびんきょく', scopedN5: 'ゆうびんきょく', scopedN4: 'ゆうびんきょく' },
  { kanji: '美術館', kana: 'びじゅつかん', scopedN5: 'びじゅつかん', scopedN4: 'びじゅつかん' },
  { kanji: '会議室', kana: 'かいぎしつ', scopedN5: 'かいぎしつ', scopedN4: 'かいぎしつ' },
  { kanji: '事務所', kana: 'じむしょ', scopedN5: 'じむしょ', scopedN4: 'じむしょ' },
  { kanji: '新幹線', kana: 'しんかんせん', scopedN5: 'しんかんせん', scopedN4: 'しんかんせん' },
  { kanji: '地下鉄', kana: 'ちかてつ', scopedN5: 'ちかてつ', scopedN4: 'ちかてつ' },
  { kanji: '飛行機', kana: 'ひこうき', scopedN5: 'ひこうき', scopedN4: 'ひこうき' },
  { kanji: '誕生日', kana: 'たんじょうび', scopedN5: 'たんじょうび', scopedN4: 'たんじょうび' },
  { kanji: '友達', kana: 'ともだち', scopedN5: 'ともだち', scopedN4: 'ともだち' },
  { kanji: '辞書', kana: 'じしょ', scopedN5: 'じしょ', scopedN4: 'じしょ' },
  { kanji: '雑誌', kana: 'ざっし', scopedN5: 'ざっし', scopedN4: 'ざっし' },
  { kanji: '手帳', kana: 'てちょう', scopedN5: 'てちょう', scopedN4: 'てちょう' },
  { kanji: '名刺', kana: 'めいし', scopedN5: 'めいし', scopedN4: 'めいし' },
  { kanji: '鉛筆', kana: 'えんぴつ', scopedN5: 'えんぴつ', scopedN4: 'えんぴつ' },
  { kanji: '会議', kana: 'かいぎ', scopedN5: 'かいぎ', scopedN4: 'かいぎ' },
  { kanji: '受付', kana: 'うけつけ', scopedN5: 'うけつけ', scopedN4: 'うけつけ' },
  { kanji: '部屋', kana: 'へや', scopedN5: 'へや', scopedN4: 'へや' },
  { kanji: '階段', kana: 'かいだん', scopedN5: 'かいだん', scopedN4: 'かいだん' },
  { kanji: '毎晩', kana: 'まいばん', scopedN5: 'まいばん', scopedN4: 'まいばん' },
  { kanji: '牛乳', kana: 'ぎゅうにゅう', scopedN5: 'ぎゅうにゅう', scopedN4: 'ぎゅうにゅう' },
  { kanji: '地下', kana: 'ちか', scopedN5: 'ちか', scopedN4: '地下' },
  { kanji: '教師', kana: 'きょうし', scopedN5: 'きょうし', scopedN4: 'きょうし' },
  { kanji: '何歳', kana: 'なんさい', scopedN5: 'なんさい', scopedN4: 'なんさい' },
  { kanji: '皆さん', kana: 'みなさん', scopedN5: 'みなさん', scopedN4: 'みなさん' },
  { kanji: '佐藤', kana: 'さとう', scopedN5: 'さとう', scopedN4: 'さとう' },
  { kanji: '鈴木', kana: 'すずき', scopedN5: 'すずき', scopedN4: 'すずき' },
  { kanji: '松本', kana: 'まつもと', scopedN5: 'まつもと', scopedN4: 'まつもと' },
  { kanji: '失礼', kana: 'しつれい', scopedN5: 'しつれい', scopedN4: 'しつれい' },
  { kanji: '初めまして', kana: 'はじめまして', scopedN5: 'はじめまして', scopedN4: 'はじめまして' },
  { kanji: 'よろしくお願いします', kana: 'よろしくおねがいします', scopedN5: 'よろしくおねがいします', scopedN4: 'よろしくおねがいします' },
  { kanji: 'お巡りさん', kana: 'おまわりさん', scopedN5: 'おまわりさん', scopedN4: 'おまわりさん' },
  { kanji: '警官', kana: 'けいかん', scopedN5: 'けいかん', scopedN4: 'けいかん' },
  { kanji: '交番', kana: 'こうばん', scopedN5: 'こうばん', scopedN4: '交番' },
  { kanji: '場所', kana: 'ばしょ', scopedN5: 'ばしょ', scopedN4: '場所' },
  { kanji: '明日', kana: 'あした', scopedN5: 'あした', scopedN4: '明日' },
  { kanji: 'お子さん', kana: 'おこさん', scopedN5: 'お子さん', scopedN4: 'お子さん' },
  { kanji: '誰', kana: 'だれ', scopedN5: 'だれ', scopedN4: 'だれ' },
  { kanji: '歳', kana: 'さい', scopedN5: 'さい', scopedN4: 'さい' },
  { kanji: '皆', kana: 'みな', scopedN5: 'みな', scopedN4: 'みな' },
  { kanji: '君', kana: 'くん', scopedN5: 'くん', scopedN4: 'くん' },
  { kanji: '傘', kana: 'かさ', scopedN5: 'かさ', scopedN4: 'かさ' },
  { kanji: '鞄', kana: 'かばん', scopedN5: 'かばん', scopedN4: 'かばん' },
  { kanji: '机', kana: 'つくえ', scopedN5: 'つくえ', scopedN4: 'つくえ' },
  { kanji: '靴', kana: 'くつ', scopedN5: 'くつ', scopedN4: 'くつ' },
  { kanji: '船', kana: 'ふね', scopedN5: 'ふね', scopedN4: 'ふね' },
];

/**
 * Áp dụng thay thế từ điển phạm vi lên một chuỗi đơn lẻ (ví dụ: choices, pieces, speaker, câu ví dụ).
 */
export function applyStandaloneScopedReplacements(text: string, lessonId: number): string {
  if (!text || !KANJI_CHAR_REGEX.test(text)) return text;
  const isN5 = getMaxKanjiLessonForScope(lessonId) <= 25;
  let result = text;
  for (const entry of STANDALONE_SCOPED_LEXICON) {
    if (result.includes(entry.kanji)) {
      const replacement = isN5 ? entry.scopedN5 : entry.scopedN4;
      if (replacement !== entry.kanji) {
        result = result.split(entry.kanji).join(replacement);
      }
    }
  }
  return result;
}

/**
 * Chuyển đổi 1 từ vựng đơn lẻ sang dạng hiển thị theo phạm vi Kanji (N5: Bài 1-25, N4: Bài 1-50).
 */
export function convertWordToScopedKanji(
  kanjiWord?: string,
  kanaFallback?: string,
  lessonId: number = 1
): string {
  const kWord = (kanjiWord || '').trim();
  const hWord = (kanaFallback || '').trim();
  if (!kWord) return hWord;
  if (!KANJI_CHAR_REGEX.test(kWord)) return kWord;

  // Trường hợp từ ghép hỗn hợp đặc biệt như 神戸病院 -> こうべ病院 (giữ 病院 Bài 17)
  if (kWord.includes('神戸病院')) {
    return kWord.replace('神戸病院', 'こうべ病院');
  }

  if (isWordInKanjiScope(kWord, lessonId)) {
    return kWord;
  }

  if (hWord) {
    return hWord;
  }

  return applyStandaloneScopedReplacements(kWord, lessonId);
}

/**
 * Chuyển đổi thông minh một câu văn / đoạn văn / phương án lựa chọn sang chế độ "🎯 Kanji trong phạm vi":
 * - Giữ nguyên các từ có toàn bộ chữ Hán thuộc phạm vi (Bài 1..25 cho N5; Bài 1..50 cho N4).
 * - Chuyển các từ có chữ Hán nằm ngoài phạm vi sang Hiragana tương ứng từ chuỗi kanaText (hoặc từ điển).
 */
export function convertTextToScopedKanji(
  kanjiText?: string,
  kanaText?: string,
  lessonId: number = 1,
  options?: { preserveBracketedTarget?: boolean }
): string {
  const kStr = kanjiText || kanaText || '';
  const hStr = kanaText || kanjiText || '';
  if (!kStr) return '';
  if (!KANJI_CHAR_REGEX.test(kStr)) return kStr;

  const splitRegex = /(\s+|、|。|「|」|（[^）]+）|【[^】]+】|：|\n)/;
  const kTokens = kStr.split(splitRegex);
  const hTokens = hStr.split(splitRegex);

  if (kTokens.length === hTokens.length) {
    const outTokens = kTokens.map((kTok, idx) => {
      const hTok = hTokens[idx];
      if (!kTok || !KANJI_CHAR_REGEX.test(kTok)) return kTok;

      // Xử lý cụm trong ngoặc 【...】 (Mondai 1 kanji_yomi / Mondai 2 hyouki)
      if (kTok.startsWith('【') && kTok.endsWith('】')) {
        if (options?.preserveBracketedTarget) {
          return kTok;
        }
        const innerK = kTok.slice(1, -1);
        const innerH = hTok.startsWith('【') && hTok.endsWith('】') ? hTok.slice(1, -1) : innerK;
        return `【${convertWordToScopedKanji(innerK, innerH, lessonId)}】`;
      }

      // Trường hợp 神戸病院 + trợ từ (ví dụ: 神戸病院の -> こうべ病院の)
      if (kTok.includes('神戸病院')) {
        return kTok.replace('神戸病院', 'こうべ病院');
      }

      // Nếu toàn bộ chữ Hán trong token đều thuộc phạm vi -> giữ nguyên Kanji!
      if (isWordInKanjiScope(kTok, lessonId)) {
        return kTok;
      }

      // Nếu token có chữ Hán ngoài phạm vi -> dùng token Hiragana tương ứng (hoặc fallback từ điển)
      if (hTok && hTok !== kTok && !KANJI_CHAR_REGEX.test(hTok)) {
        return hTok;
      }
      return applyStandaloneScopedReplacements(kTok, lessonId);
    });
    return outTokens.join('');
  }

  return applyStandaloneScopedReplacements(kStr, lessonId);
}

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
  scopeMode?: 'scoped' | 'full';
}

/**
 * Tra cứu metadata chữ Hán (Âm Hán, Nghĩa tiếng Việt, Bài học).
 */
export function getKanjiInfo(char: string, allLessonKanji: KanjiItemData[] = []) {
  const foundK = (allLessonKanji || []).find(k => k.character === char);
  if (foundK) {
    return {
      sino: foundK.sino_vietnamese || GLOBAL_KANJI_META[char]?.sino || '',
      meaning: foundK.vietnamese_meaning || GLOBAL_KANJI_META[char]?.meaning || '',
      lesson: foundK.lesson_id || GLOBAL_KANJI_META[char]?.lesson || 0
    };
  }
  const meta = GLOBAL_KANJI_META[char];
  if (meta) return meta;
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
  limit = 12,
  scopeMode = 'scoped'
}: GeneratePracticeParams): PracticeExerciseQuestion[] {
  if (!eligibleKanji || eligibleKanji.length === 0) return [];
  const isScoped = scopeMode === 'scoped';

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
    const kWord = (v.kanji_word || v.kanji_form || v.kanji || '').trim();
    if (!kWord || kWord === v.hiragana) return;

    // Khi bật chế độ Kanji trong phạm vi: loại bỏ các từ ghép chứa chữ Hán ngoài phạm vi cấp độ (VD: 韓国 có chữ 韓 ngoài 50 bài)
    if (isScoped && !isWordInKanjiScope(kWord, currentLessonId)) return;

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
        example: isScoped && v.japanese_example
          ? applyStandaloneScopedReplacements(v.japanese_example, currentLessonId)
          : v.japanese_example,
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
        if (isScoped && !isWordInKanjiScope(word, currentLessonId)) continue;
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

      // 3 đáp án sai: ưu tiên tuyệt đối từ vựng trong chính bài học hiện tại trước;
      // chỉ bổ sung từ các bài đã học (<= currentLessonId) khi bài hiện tại có dưới 3 phương án nhiễu.
      const inLessonPureKanji = shuffleArray(
        Array.from(new Set(targetVocabs.map(v => v.kanjiWord)))
          .filter(w => w !== correctWord && !/[\u3040-\u309F]/.test(w))
      );
      const inLessonAnyKanji = shuffleArray(
        Array.from(new Set(targetVocabs.map(v => v.kanjiWord)))
          .filter(w => w !== correctWord && !inLessonPureKanji.includes(w))
      );
      const learnedCompoundFallbacks: string[] = [];
      for (const k of shuffleArray((allLessonKanji || []).filter(x => (x.lesson_id || 0) <= currentLessonId))) {
        if (!k?.compounds) continue;
        for (const p of k.compounds.split(/[;\n]+/)) {
          const m = p.trim().match(/^([^\(:\s]+)/);
          if (m && m[1] !== correctWord && !/[\u3040-\u309F]/.test(m[1])) {
            learnedCompoundFallbacks.push(m[1]);
          }
        }
      }
      const lesson1BasicWords = ['私', '人', '先生', '学生', '大学', '会社', '日本', '国'];
      const wrongOpts = Array.from(new Set([
        ...inLessonPureKanji,
        ...inLessonAnyKanji,
        ...learnedCompoundFallbacks,
        ...lesson1BasicWords.filter(w => w !== correctWord)
      ])).slice(0, 3);

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

      const inLessonWrong = shuffleArray(Array.from(new Set(otherChars)).filter(c => c !== targetChar && /[\u4E00-\u9FAF]/.test(c)));
      const learnedWrong = shuffleArray(
        (allLessonKanji || [])
          .filter(k => (k.lesson_id || 0) <= currentLessonId && k.character !== targetChar)
          .map(k => k.character)
      );
      const lesson1Basics = shuffleArray(['私', '人', '先', '生', '学', '大', '会', '社', '日', '本', '国'].filter(c => c !== targetChar));
      const wrongChars = Array.from(new Set([...inLessonWrong, ...learnedWrong, ...lesson1Basics])).slice(0, 3);

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

        const inLessonWrong = shuffleArray(Array.from(new Set(otherChars)).filter(c => c !== targetChar && /[\u4E00-\u9FAF]/.test(c)));
        const learnedWrong = shuffleArray(
          (allLessonKanji || [])
            .filter(k => (k.lesson_id || 0) <= currentLessonId && k.character !== targetChar)
            .map(k => k.character)
        );
        const lesson1Basics = shuffleArray(['私', '人', '先', '生', '学', '大', '会', '社', '日', '本', '国'].filter(c => c !== targetChar));
        const wrongChars = Array.from(new Set([...inLessonWrong, ...learnedWrong, ...lesson1Basics])).slice(0, 3);

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

        const inLessonWrong = shuffleArray(Array.from(new Set(otherChars)).filter(c => c !== targetChar && /[\u4E00-\u9FAF]/.test(c)));
        const learnedWrong = shuffleArray(
          (allLessonKanji || [])
            .filter(k => (k.lesson_id || 0) <= currentLessonId && k.character !== targetChar)
            .map(k => k.character)
        );
        const lesson1Basics = shuffleArray(['私', '人', '先', '生', '学', '大', '会', '社', '日', '本', '国'].filter(c => c !== targetChar));
        const wrongChars = Array.from(new Set([...inLessonWrong, ...learnedWrong, ...lesson1Basics])).slice(0, 3);

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
