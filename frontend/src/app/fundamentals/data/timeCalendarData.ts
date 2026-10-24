export interface TimeCalendarItem {
  number?: number;
  kanji: string;
  kana: string;
  romaji: string;
  meaning: string;
  isSpecial?: boolean;
  note?: string;
}

export const HOURS_DATA: TimeCalendarItem[] = [
  { number: 1, kanji: '一時', kana: 'いちじ', romaji: 'ichiji', meaning: '1 giờ' },
  { number: 2, kanji: '二時', kana: 'にじ', romaji: 'niji', meaning: '2 giờ' },
  { number: 3, kanji: '三時', kana: 'さんじ', romaji: 'sanji', meaning: '3 giờ' },
  { number: 4, kanji: '四時', kana: 'よじ', romaji: 'yoji', meaning: '4 giờ', isSpecial: true, note: 'Bắt buộc đọc là "yoji" (không đọc yonji / shiji)' },
  { number: 5, kanji: '五時', kana: 'ごじ', romaji: 'goji', meaning: '5 giờ' },
  { number: 6, kanji: '六時', kana: 'ろくじ', romaji: 'rokuji', meaning: '6 giờ' },
  { number: 7, kanji: '七時', kana: 'しちじ', romaji: 'shichiji', meaning: '7 giờ', isSpecial: true, note: 'Thường đọc là "shichiji"' },
  { number: 8, kanji: '八時', kana: 'はちじ', romaji: 'hachiji', meaning: '8 giờ' },
  { number: 9, kanji: '九時', kana: 'くじ', romaji: 'kuji', meaning: '9 giờ', isSpecial: true, note: 'Bắt buộc đọc là "kuji" (không đọc kyuuji)' },
  { number: 10, kanji: '十時', kana: 'じゅうじ', romaji: 'juuji', meaning: '10 giờ' },
  { number: 11, kanji: '十一時', kana: 'じゅういちじ', romaji: 'juuichiji', meaning: '11 giờ' },
  { number: 12, kanji: '十二時', kana: 'じゅうにじ', romaji: 'juuniji', meaning: '12 giờ' },
];

export const MINUTES_DATA: TimeCalendarItem[] = [
  { number: 1, kanji: '一分', kana: 'いっぷん', romaji: 'ippun', meaning: '1 phút', isSpecial: true, note: 'Âm ngắt ぷん' },
  { number: 2, kanji: '二分', kana: 'にふん', romaji: 'nifun', meaning: '2 phút' },
  { number: 3, kanji: '三分', kana: 'さんぷん', romaji: 'sanpun', meaning: '3 phút', isSpecial: true, note: 'Biến âm ぷん' },
  { number: 4, kanji: '四分', kana: 'よんぷん', romaji: 'yonpun', meaning: '4 phút', isSpecial: true, note: 'Biến âm ぷん' },
  { number: 5, kanji: '五分', kana: 'ごふん', romaji: 'gofun', meaning: '5 phút' },
  { number: 6, kanji: '六分', kana: 'ろっぷん', romaji: 'roppun', meaning: '6 phút', isSpecial: true, note: 'Âm ngắt ぷん' },
  { number: 7, kanji: '七分', kana: 'ななふん', romaji: 'nanafun', meaning: '7 phút' },
  { number: 8, kanji: '八分', kana: 'はっぷん / はちふん', romaji: 'happun / hachifun', meaning: '8 phút', isSpecial: true, note: 'Thường dùng はっぷん' },
  { number: 9, kanji: '九分', kana: 'きゅうふん', romaji: 'kyuufun', meaning: '9 phút' },
  { number: 10, kanji: '十分', kana: 'じゅっぷん / じっぽん', romaji: 'juppun / jippun', meaning: '10 phút', isSpecial: true, note: 'Âm ngắt ぷん' },
  { number: 15, kanji: '十五分', kana: 'じゅうごふん', romaji: 'juugofun', meaning: '15 phút' },
  { number: 30, kanji: '三十分 / 半', kana: 'さんじゅっぷん / はん', romaji: 'sanjuppun / han', meaning: '30 phút (rưỡi)', isSpecial: true, note: '1 giờ rưỡi = いちじはん' },
];

export const DAYS_OF_MONTH: TimeCalendarItem[] = [
  { number: 1, kanji: '一日', kana: 'ついたち', romaji: 'tsuitachi', meaning: 'Mồng 1', isSpecial: true, note: 'Thuần Nhật (Gốc: trăng mọc - tsukitachi)' },
  { number: 2, kanji: '二日', kana: 'ふつか', romaji: 'futsuka', meaning: 'Mồng 2 (hoặc 2 ngày)', isSpecial: true, note: 'Thuần Nhật' },
  { number: 3, kanji: '三日', kana: 'みっか', romaji: 'mikka', meaning: 'Mồng 3 (hoặc 3 ngày)', isSpecial: true, note: 'Âm ngắt Thuần Nhật' },
  { number: 4, kanji: '四日', kana: 'よっか', romaji: 'yokka', meaning: 'Mồng 4 (hoặc 4 ngày)', isSpecial: true, note: 'Âm ngắt Thuần Nhật' },
  { number: 5, kanji: '五日', kana: 'いつか', romaji: 'itsuka', meaning: 'Mồng 5 (hoặc 5 ngày)', isSpecial: true, note: 'Thuần Nhật' },
  { number: 6, kanji: '六日', kana: 'むいか', romaji: 'muika', meaning: 'Mồng 6 (hoặc 6 ngày)', isSpecial: true, note: 'Thuần Nhật' },
  { number: 7, kanji: '七日', kana: 'なのか', romaji: 'nanoka', meaning: 'Mồng 7 (hoặc 7 ngày)', isSpecial: true, note: 'Thuần Nhật' },
  { number: 8, kanji: '八日', kana: 'ようか', romaji: 'youka', meaning: 'Mồng 8 (hoặc 8 ngày)', isSpecial: true, note: 'Thuần Nhật trường âm' },
  { number: 9, kanji: '九日', kana: 'ここのか', romaji: 'kokonoka', meaning: 'Mồng 9 (hoặc 9 ngày)', isSpecial: true, note: 'Thuần Nhật' },
  { number: 10, kanji: '十日', kana: 'とおか', romaji: 'tooka', meaning: 'Mồng 10 (hoặc 10 ngày)', isSpecial: true, note: 'Thuần Nhật trường âm' },
  { number: 14, kanji: '十四日', kana: 'じゅうよっか', romaji: 'juuyokka', meaning: 'Ngày 14', isSpecial: true, note: 'Đuôi よっか (không đọc juuyon-nichi)' },
  { number: 20, kanji: '二十日', kana: 'はつか', romaji: 'hatsuka', meaning: 'Ngày 20', isSpecial: true, note: 'Đặc biệt: はつか' },
  { number: 24, kanji: '二十四日', kana: 'にじゅうよっか', romaji: 'nijuuyokka', meaning: 'Ngày 24', isSpecial: true, note: 'Đuôi よっか' },
  { number: 11, kanji: '十一日', kana: 'じゅういちにち', romaji: 'juuichinichi', meaning: 'Ngày 11' },
  { number: 17, kanji: '十七日', kana: 'じゅうしちにち', romaji: 'juushichinichi', meaning: 'Ngày 17', isSpecial: true, note: 'Đọc là juu-shichi-nichi' },
  { number: 19, kanji: '十九日', kana: 'じゅうくにち', romaji: 'juukunichi', meaning: 'Ngày 19', isSpecial: true, note: 'Đọc là juu-ku-nichi' },
  { number: 27, kanji: '二十七日', kana: 'にじゅうしちにち', romaji: 'nijuushichinichi', meaning: 'Ngày 27' },
  { number: 29, kanji: '二十九日', kana: 'にじゅうくにち', romaji: 'nijuukunichi', meaning: 'Ngày 29' },
];

export const DAYS_OF_WEEK: TimeCalendarItem[] = [
  { kanji: '月曜日', kana: 'げつようび', romaji: 'getsuyoubi', meaning: 'Thứ Hai', note: 'Nguyệt (Mặt trăng 🌙)' },
  { kanji: '火曜日', kana: 'かようび', romaji: 'kayoubi', meaning: 'Thứ Ba', note: 'Hỏa (Lửa 🔥)' },
  { kanji: '水曜日', kana: 'すいようび', romaji: 'suiyoubi', meaning: 'Thứ Tư', note: 'Thủy (Nước 💧)' },
  { kanji: '木曜日', kana: 'もくようび', romaji: 'mokuyoubi', meaning: 'Thứ Năm', note: 'Mộc (Cây 🌲)' },
  { kanji: '金曜日', kana: 'きんようび', romaji: 'kinyoubi', meaning: 'Thứ Sáu', note: 'Kim (Vàng/Tiền 💰)' },
  { kanji: '土曜日', kana: 'どようび', romaji: 'doyoubi', meaning: 'Thứ Bảy', note: 'Thổ (Đất ⛰️)' },
  { kanji: '日曜日', kana: 'にちようび', romaji: 'nichiyoubi', meaning: 'Chủ Nhật', note: 'Nhật (Mặt trời ☀️)' },
];

export const MONTHS_DATA: TimeCalendarItem[] = [
  { number: 1, kanji: '一月', kana: 'いちがつ', romaji: 'ichigatsu', meaning: 'Tháng 1' },
  { number: 2, kanji: '二月', kana: 'にがつ', romaji: 'nigatsu', meaning: 'Tháng 2' },
  { number: 3, kanji: '三月', kana: 'さんがつ', romaji: 'sangatsu', meaning: 'Tháng 3' },
  { number: 4, kanji: '四月', kana: 'しがつ', romaji: 'shigatsu', meaning: 'Tháng 4', isSpecial: true, note: 'Bắt buộc đọc là "shigatsu" (mùa hoa anh đào)' },
  { number: 5, kanji: '五月', kana: 'ごがつ', romaji: 'gogatsu', meaning: 'Tháng 5' },
  { number: 6, kanji: '六月', kana: 'ろくがつ', romaji: 'rokugatsu', meaning: 'Tháng 6' },
  { number: 7, kanji: '七月', kana: 'しちがつ', romaji: 'shichigatsu', meaning: 'Tháng 7', isSpecial: true, note: 'Bắt buộc đọc là "shichigatsu"' },
  { number: 8, kanji: '八月', kana: 'はちがつ', romaji: 'hachigatsu', meaning: 'Tháng 8' },
  { number: 9, kanji: '九月', kana: 'くがつ', romaji: 'kugatsu', meaning: 'Tháng 9', isSpecial: true, note: 'Bắt buộc đọc là "kugatsu"' },
  { number: 10, kanji: '十月', kana: 'じゅうがつ', romaji: 'juugatsu', meaning: 'Tháng 10' },
  { number: 11, kanji: '十一月', kana: 'じゅういちがつ', romaji: 'juuichigatsu', meaning: 'Tháng 11' },
  { number: 12, kanji: '十二月', kana: 'じゅうにがつ', romaji: 'juunigatsu', meaning: 'Tháng 12' },
];

export const RELATIVE_TIME_MATRIX = [
  {
    category: 'Ngày (日)',
    minus2: { kanji: '一昨日', kana: 'おととい', meaning: 'Hôm kia' },
    minus1: { kanji: '昨日', kana: 'きのう', meaning: 'Hôm qua' },
    zero: { kanji: '今日', kana: 'きょう', meaning: 'Hôm nay' },
    plus1: { kanji: '明日', kana: 'あした', meaning: 'Ngày mai' },
    plus2: { kanji: '明後日', kana: 'あさって', meaning: 'Ngày kia' },
  },
  {
    category: 'Tuần (週)',
    minus2: { kanji: '先々週', kana: 'せんせんしゅう', meaning: 'Tuần trước nữa' },
    minus1: { kanji: '先週', kana: 'せんしゅう', meaning: 'Tuần trước' },
    zero: { kanji: '今週', kana: 'こんしゅう', meaning: 'Tuần này' },
    plus1: { kanji: '来週', kana: 'らいしゅう', meaning: 'Tuần sau' },
    plus2: { kanji: '再来週', kana: 'さらいしゅう', meaning: 'Tuần sau nữa' },
  },
  {
    category: 'Tháng (月)',
    minus2: { kanji: '先々月', kana: 'せんせんげつ', meaning: 'Tháng trước nữa' },
    minus1: { kanji: '先月', kana: 'せんげつ', meaning: 'Tháng trước' },
    zero: { kanji: '今月', kana: 'こんげつ', meaning: 'Tháng này' },
    plus1: { kanji: '来月', kana: 'らいげつ', meaning: 'Tháng sau' },
    plus2: { kanji: '再来月', kana: 'さらいげつ', meaning: 'Tháng sau nữa' },
  },
  {
    category: 'Năm (年)',
    minus2: { kanji: '一昨年', kana: 'おととし', meaning: 'Năm kia' },
    minus1: { kanji: '去年', kana: 'きょねん', meaning: 'Năm ngoái' },
    zero: { kanji: '今年', kana: 'ことし', meaning: 'Năm nay' },
    plus1: { kanji: '来年', kana: 'らいねん', meaning: 'Năm sau' },
    plus2: { kanji: '再来年', kana: 'さらいねん', meaning: 'Năm sau nữa' },
  }
];
