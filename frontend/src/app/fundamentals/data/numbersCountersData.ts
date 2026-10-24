export interface CounterItem {
  number: number;
  kana: string;
  kanji: string;
  romaji: string;
  isSpecial?: boolean; // Biến âm (âm đục, âm ngắt) hoặc cách đọc đặc biệt
  note?: string;
}

export interface CounterCategory {
  id: string;
  name: string;
  kanji: string;
  meaning: string;
  targetObjects: string;
  questionWord: {
    kana: string;
    kanji: string;
    meaning: string;
  };
  items: CounterItem[];
  tips?: string;
}

export const BASIC_NUMBERS = [
  { num: 0, kanji: '零 / 〇', kana: 'ぜろ / れい', romaji: 'zero / rei', note: 'Thường đọc là zero' },
  { num: 1, kanji: '一', kana: 'いち', romaji: 'ichi' },
  { num: 2, kanji: '二', kana: 'に', romaji: 'ni' },
  { num: 3, kanji: '三', kana: 'さん', romaji: 'san' },
  { num: 4, kanji: '四', kana: 'よん / し', romaji: 'yon / shi', isSpecial: true, note: 'Tránh "shi" (tử - chết) khi đếm lẻ' },
  { num: 5, kanji: '五', kana: 'ご', romaji: 'go' },
  { num: 6, kanji: '六', kana: 'ろく', romaji: 'roku' },
  { num: 7, kanji: '七', kana: 'なな / しち', romaji: 'nana / shichi', isSpecial: true, note: 'Thường dùng "nana" để tránh nhầm với "ichi"' },
  { num: 8, kanji: '八', kana: 'はち', romaji: 'hachi' },
  { num: 9, kanji: '九', kana: 'きゅう / く', romaji: 'kyuu / ku', isSpecial: true, note: 'Tránh "ku" (khổ) khi đếm lẻ' },
  { num: 10, kanji: '十', kana: 'じゅう', romaji: 'juu' },
  { num: 100, kanji: '百', kana: 'ひゃく', romaji: 'hyaku' },
  { num: 300, kanji: '三百', kana: 'さんびゃく', romaji: 'sanbyaku', isSpecial: true, note: 'Biến âm đục: hyaku ➔ byaku' },
  { num: 600, kanji: '六百', kana: 'ろっぴゃく', romaji: 'roppyaku', isSpecial: true, note: 'Biến âm ngắt: roku + hyaku ➔ roppyaku' },
  { num: 800, kanji: '八百', kana: 'はっぴゃく', romaji: 'happyaku', isSpecial: true, note: 'Biến âm ngắt: hachi + hyaku ➔ happyaku' },
  { num: 1000, kanji: '千', kana: 'せん', romaji: 'sen' },
  { num: 3000, kanji: '三千', kana: 'さんぜん', romaji: 'sanzen', isSpecial: true, note: 'Biến âm đục: sen ➔ zen' },
  { num: 8000, kanji: '八千', kana: 'はっせん', romaji: 'hassen', isSpecial: true, note: 'Biến âm ngắt: hachi + sen ➔ hassen' },
  { num: 10000, kanji: '一万', kana: 'いちまん', romaji: 'ichiman', note: 'Từ 10,000 tiếng Nhật bắt đầu bằng đơn vị 万 (vạn)' },
  { num: 100000000, kanji: '一億', kana: 'いちおく', romaji: 'ichioku', note: '100 triệu = 1 億 (ức)' },
];

export const COUNTERS_LIST: CounterCategory[] = [
  {
    id: 'tsu',
    name: 'Đồ vật chung (Thuần Nhật 1-10)',
    kanji: 'つ',
    meaning: 'Cái, chiếc, củ, quả (dùng cho vật thể nói chung khi chưa rõ đơn vị chuyên biệt)',
    targetObjects: 'Táo, bánh, ghế, đồ đạc, ý tưởng, tuổi trẻ con (1-10)',
    questionWord: { kana: 'いくつ', kanji: '幾つ', meaning: 'Bao nhiêu cái? Mấy tuổi?' },
    tips: 'Chỉ đếm từ 1 đến 10 bằng cách đếm thuần Nhật. Từ 11 trở lên dùng số đếm thường (11 = じゅういち).',
    items: [
      { number: 1, kana: 'ひとつ', kanji: '一つ', romaji: 'hitotsu' },
      { number: 2, kana: 'ふたつ', kanji: '二つ', romaji: 'futatsu' },
      { number: 3, kana: 'みっつ', kanji: '三つ', romaji: 'mittsu', isSpecial: true, note: 'Âm ngắt' },
      { number: 4, kana: 'よっつ', kanji: '四つ', romaji: 'yottsu', isSpecial: true, note: 'Âm ngắt' },
      { number: 5, kana: 'いつつ', kanji: '五つ', romaji: 'itsutsu' },
      { number: 6, kana: 'むっつ', kanji: '六つ', romaji: 'muttsu', isSpecial: true, note: 'Âm ngắt' },
      { number: 7, kana: 'ななつ', kanji: '七つ', romaji: 'nanatsu' },
      { number: 8, kana: 'やっつ', kanji: '八つ', romaji: 'yattsu', isSpecial: true, note: 'Âm ngắt' },
      { number: 9, kana: 'ここのつ', kanji: '九つ', romaji: 'kokonotsu' },
      { number: 10, kana: 'とお', kanji: '十', romaji: 'too', isSpecial: true, note: 'Không có đuôi つ' },
    ]
  },
  {
    id: 'nin',
    name: 'Người (人)',
    kanji: '人',
    meaning: 'Người',
    targetObjects: 'Học sinh, giáo viên, bạn bè, gia đình, người ngoài',
    questionWord: { kana: 'なんにん', kanji: '何人', meaning: 'Mấy người? Bao nhiêu người?' },
    tips: 'Đặc biệt: 1 người (ひとり) và 2 người (ふたり) dùng từ thuần Nhật. 4 người là よにん (không đọc yon-nin hay shi-nin).',
    items: [
      { number: 1, kana: 'ひとり', kanji: '一人', romaji: 'hitori', isSpecial: true, note: 'Thuần Nhật đặc biệt' },
      { number: 2, kana: 'ふたり', kanji: '二人', romaji: 'futari', isSpecial: true, note: 'Thuần Nhật đặc biệt' },
      { number: 3, kana: 'さんにん', kanji: '三人', romaji: 'sannin' },
      { number: 4, kana: 'よにん', kanji: '四人', romaji: 'yonin', isSpecial: true, note: 'Đọc là yo-nin (không n)' },
      { number: 5, kana: 'ごにん', kanji: '五人', romaji: 'gonin' },
      { number: 6, kana: 'ろくにん', kanji: '六人', romaji: 'rokunin' },
      { number: 7, kana: 'しちにん / ななにん', kanji: '七人', romaji: 'shichinin / nananin' },
      { number: 8, kana: 'はちにん', kanji: '八人', romaji: 'hachinin' },
      { number: 9, kana: 'きゅうにん / くにん', kanji: '九人', romaji: 'kyuunin / kunin' },
      { number: 10, kana: 'じゅうにん', kanji: '十人', romaji: 'juunin' },
    ]
  },
  {
    id: 'hon',
    name: 'Vật dài thon (本)',
    kanji: '本',
    meaning: 'Cây, chiếc, que, bình, chai, ngòi, tuyến đường',
    targetObjects: 'Bút, ô (dù), chai nước, chuối, ngón tay, sợi dây, cây cối, chuyến tàu ngầm',
    questionWord: { kana: 'なんぼん', kanji: '何本', meaning: 'Mấy cây/chai?' },
    tips: 'Quy tắc phát âm ほん/ぽん/ぼん: 1, 6, 8, 10 ➔ ぽん (âm ngắt p); 3, なん ➔ ぼん (âm đục b); còn lại ➔ ほん (h).',
    items: [
      { number: 1, kana: 'いっぽん', kanji: '一本', romaji: 'ippon', isSpecial: true, note: 'Âm ngắt ぽん' },
      { number: 2, kana: 'にほん', kanji: '二本', romaji: 'nihon' },
      { number: 3, kana: 'さんぼん', kanji: '三本', romaji: 'sanbon', isSpecial: true, note: 'Âm đục ぼん' },
      { number: 4, kana: 'よんほん', kanji: '四本', romaji: 'yonhon' },
      { number: 5, kana: 'ごほん', kanji: '五本', romaji: 'gohon' },
      { number: 6, kana: 'ろっぽん', kanji: '六本', romaji: 'roppon', isSpecial: true, note: 'Âm ngắt ぽん' },
      { number: 7, kana: 'ななほん', kanji: '七本', romaji: 'nanahon' },
      { number: 8, kana: 'はっぽん', kanji: '八本', romaji: 'happon', isSpecial: true, note: 'Âm ngắt ぽん' },
      { number: 9, kana: 'きゅうほん', kanji: '九本', romaji: 'kyuuhon' },
      { number: 10, kana: 'じゅっぽん / じっぽん', kanji: '十本', romaji: 'juppon / jippon', isSpecial: true, note: 'Âm ngắt ぽん' },
    ]
  },
  {
    id: 'mai',
    name: 'Vật phẳng mỏng (枚)',
    kanji: '枚',
    meaning: 'Tờ, tấm, chiếc, lá, đĩa',
    targetObjects: 'Giấy, ảnh, áo sơ mi, vé tàu, đĩa CD, bánh pizza, khăn trải bàn',
    questionWord: { kana: 'なんまい', kanji: '何枚', meaning: 'Mấy tờ/tấm?' },
    tips: 'Rất dễ nhớ: Hoàn toàn KHÔNG có biến âm! Số đếm + まい.',
    items: [
      { number: 1, kana: 'いちまい', kanji: '一枚', romaji: 'ichimai' },
      { number: 2, kana: 'にまい', kanji: '二枚', romaji: 'nimai' },
      { number: 3, kana: 'さんまい', kanji: '三枚', romaji: 'sanmai' },
      { number: 4, kana: 'よんまい', kanji: '四枚', romaji: 'yonmai' },
      { number: 5, kana: 'ごまい', kanji: '五枚', romaji: 'gomai' },
      { number: 6, kana: 'ろくまい', kanji: '六枚', romaji: 'rokumai' },
      { number: 7, kana: 'ななまい', kanji: '七枚', romaji: 'nanamai' },
      { number: 8, kana: 'はちまい', kanji: '八枚', romaji: 'hachimai' },
      { number: 9, kana: 'きゅうまい', kanji: '九枚', romaji: 'kyuumai' },
      { number: 10, kana: 'じゅうまい', kanji: '十枚', romaji: 'juumai' },
    ]
  },
  {
    id: 'dai',
    name: 'Máy móc & Phương tiện (台)',
    kanji: '台',
    meaning: 'Chiếc, cái, cỗ',
    targetObjects: 'Ô tô, xe máy, xe đạp, máy tính, ti vi, máy giặt, đàn piano',
    questionWord: { kana: 'なんだい', kanji: '何台', meaning: 'Mấy chiếc máy/xe?' },
    tips: 'KHÔNG có biến âm: Số đếm + だい.',
    items: [
      { number: 1, kana: 'いちだい', kanji: '一台', romaji: 'ichidai' },
      { number: 2, kana: 'にだい', kanji: '二台', romaji: 'nidai' },
      { number: 3, kana: 'さんだい', kanji: '三台', romaji: 'sandai' },
      { number: 4, kana: 'よんだい', kanji: '四台', romaji: 'yondai' },
      { number: 5, kana: 'ごだい', kanji: '五台', romaji: 'godai' },
      { number: 6, kana: 'ろくだい', kanji: '六台', romaji: 'rokudai' },
      { number: 7, kana: 'ななだい', kanji: '七台', romaji: 'nanadai' },
      { number: 8, kana: 'はちだい', kanji: '八台', romaji: 'hachidai' },
      { number: 9, kana: 'きゅうだい', kanji: '九台', romaji: 'kyuudai' },
      { number: 10, kana: 'じゅうだい', kanji: '十台', romaji: 'juudai' },
    ]
  },
  {
    id: 'satsu',
    name: 'Sách vở đóng quyển (冊)',
    kanji: '冊',
    meaning: 'Cuốn, quyển',
    targetObjects: 'Sách, vở, từ điển, tạp chí, sổ tay, hộ chiếu',
    questionWord: { kana: 'なんさつ', kanji: '何冊', meaning: 'Mấy cuốn/quyển?' },
    tips: 'Biến âm xúc âm ở số 1 (いっさつ), 8 (はっさつ), 10 (じゅっさつ).',
    items: [
      { number: 1, kana: 'いっさつ', kanji: '一冊', romaji: 'issatsu', isSpecial: true, note: 'Âm ngắt' },
      { number: 2, kana: 'にさつ', kanji: '二冊', romaji: 'nisatsu' },
      { number: 3, kana: 'さんさつ', kanji: '三冊', romaji: 'sansatsu' },
      { number: 4, kana: 'よんさつ', kanji: '四冊', romaji: 'yonsatsu' },
      { number: 5, kana: 'ごさつ', kanji: '五冊', romaji: 'gosatsu' },
      { number: 6, kana: 'ろくさつ', kanji: '六冊', romaji: 'rokusatsu' },
      { number: 7, kana: 'ななさつ', kanji: '七冊', romaji: 'nanasatsu' },
      { number: 8, kana: 'はっさつ', kanji: '八冊', romaji: 'hassatsu', isSpecial: true, note: 'Âm ngắt' },
      { number: 9, kana: 'きゅうさつ', kanji: '九冊', romaji: 'kyuusatsu' },
      { number: 10, kana: 'じゅっさつ', kanji: '十冊', romaji: 'jussatsu', isSpecial: true, note: 'Âm ngắt' },
    ]
  },
  {
    id: 'hiki',
    name: 'Động vật nhỏ & Côn trùng (匹)',
    kanji: '匹',
    meaning: 'Con',
    targetObjects: 'Mèo, chó, cá, chuột, côn trùng, ếch (động vật lớn dùng 頭 - とう)',
    questionWord: { kana: 'なんびき', kanji: '何匹', meaning: 'Mấy con?' },
    tips: 'Biến âm tương tự 本: 1, 6, 8, 10 ➔ ぴき; 3, なん ➔ びき; còn lại ➔ ひき.',
    items: [
      { number: 1, kana: 'いっぴき', kanji: '一匹', romaji: 'ippiki', isSpecial: true, note: 'Âm ngắt ぴき' },
      { number: 2, kana: 'にひき', kanji: '二匹', romaji: 'nihiki' },
      { number: 3, kana: 'さんびき', kanji: '三匹', romaji: 'sanbiki', isSpecial: true, note: 'Âm đục びき' },
      { number: 4, kana: 'よんひき', kanji: '四匹', romaji: 'yonhiki' },
      { number: 5, kana: 'ごひき', kanji: '五匹', romaji: 'gohiki' },
      { number: 6, kana: 'ろっぴき', kanji: '六匹', romaji: 'roppiki', isSpecial: true, note: 'Âm ngắt ぴき' },
      { number: 7, kana: 'ななひき', kanji: '七匹', romaji: 'nanahiki' },
      { number: 8, kana: 'はっぴき', kanji: '八匹', romaji: 'happiki', isSpecial: true, note: 'Âm ngắt ぴき' },
      { number: 9, kana: 'きゅうひき', kanji: '九匹', romaji: 'kyuuhiki' },
      { number: 10, kana: 'じゅっぴき', kanji: '十匹', romaji: 'juppiki', isSpecial: true, note: 'Âm ngắt ぴき' },
    ]
  },
  {
    id: 'ko',
    name: 'Đồ vật nhỏ hình khối (個)',
    kanji: '個',
    meaning: 'Cái, quả, hạt, viên',
    targetObjects: 'Trứng, bóng, kẹo, xà phòng, táo, cục tẩy, xúc xắc',
    questionWord: { kana: 'なんこ', kanji: '何個', meaning: 'Mấy cái/quả?' },
    tips: 'Âm ngắt ở 1 (いっこ), 6 (ろっこ), 8 (はっこ), 10 (じゅっこ).',
    items: [
      { number: 1, kana: 'いっこ', kanji: '一個', romaji: 'ikko', isSpecial: true, note: 'Âm ngắt' },
      { number: 2, kana: 'にこ', kanji: '二個', romaji: 'niko' },
      { number: 3, kana: 'さんこ', kanji: '三個', romaji: 'sanko' },
      { number: 4, kana: 'よんこ', kanji: '四個', romaji: 'yonko' },
      { number: 5, kana: 'ごこ', kanji: '五個', romaji: 'goko' },
      { number: 6, kana: 'ろっこ', kanji: '六個', romaji: 'rokko', isSpecial: true, note: 'Âm ngắt' },
      { number: 7, kana: 'ななこ', kanji: '七個', romaji: 'nanako' },
      { number: 8, kana: 'はっこ', kanji: '八個', romaji: 'hakko', isSpecial: true, note: 'Âm ngắt' },
      { number: 9, kana: 'きゅうこ', kanji: '九個', romaji: 'kyuuko' },
      { number: 10, kana: 'じゅっこ', kanji: '十個', romaji: 'jukko', isSpecial: true, note: 'Âm ngắt' },
    ]
  },
  {
    id: 'hai',
    name: 'Cốc, ly, bát chứa đồ uống/thức ăn (杯)',
    kanji: '杯',
    meaning: 'Cốc, ly, chén, bát',
    targetObjects: 'Trà, cà phê, bia, mì ramen, cơm bát',
    questionWord: { kana: 'なんばい', kanji: '何杯', meaning: 'Mấy ly/cốc/bát?' },
    tips: 'Biến âm tương tự 本: 1, 6, 8, 10 ➔ ぱい; 3, なん ➔ ばい; còn lại ➔ はい.',
    items: [
      { number: 1, kana: 'いっぱい', kanji: '一杯', romaji: 'ippai', isSpecial: true, note: 'Âm ngắt ぱい' },
      { number: 2, kana: 'にはい', kanji: '二杯', romaji: 'nihai' },
      { number: 3, kana: 'さんばい', kanji: '三杯', romaji: 'sanbai', isSpecial: true, note: 'Âm đục ばい' },
      { number: 4, kana: 'よんはい', kanji: '四杯', romaji: 'yonhai' },
      { number: 5, kana: 'ごはい', kanji: '五杯', romaji: 'gohai' },
      { number: 6, kana: 'ろっぱい', kanji: '六杯', romaji: 'roppai', isSpecial: true, note: 'Âm ngắt ぱい' },
      { number: 7, kana: 'ななはい', kanji: '七杯', romaji: 'nanahai' },
      { number: 8, kana: 'はっぱい', kanji: '八杯', romaji: 'happai', isSpecial: true, note: 'Âm ngắt ぱい' },
      { number: 9, kana: 'きゅうはい', kanji: '九杯', romaji: 'kyuuhai' },
      { number: 10, kana: 'じゅっぱい', kanji: '十杯', romaji: 'juppai', isSpecial: true, note: 'Âm ngắt ぱい' },
    ]
  },
  {
    id: 'kai',
    name: 'Số lần / Tần suất (回)',
    kanji: '回',
    meaning: 'Lần, hiệp',
    targetObjects: 'Số lần đi du lịch, số lần uống thuốc, hiệp đấu',
    questionWord: { kana: 'なんかい', kanji: '何回', meaning: 'Mấy lần?' },
    tips: 'Âm ngắt ở 1 (いっかい), 6 (ろっかい), 8 (はっかい), 10 (じゅっかい).',
    items: [
      { number: 1, kana: 'いっかい', kanji: '一回', romaji: 'ikkai', isSpecial: true, note: 'Âm ngắt' },
      { number: 2, kana: 'にかい', kanji: '二回', romaji: 'nikai' },
      { number: 3, kana: 'さんかい', kanji: '三回', romaji: 'sankai' },
      { number: 4, kana: 'よんかい', kanji: '四回', romaji: 'yonkai' },
      { number: 5, kana: 'ごかい', kanji: '五回', romaji: 'gokai' },
      { number: 6, kana: 'ろっかい', kanji: '六回', romaji: 'rokkai', isSpecial: true, note: 'Âm ngắt' },
      { number: 7, kana: 'ななかい', kanji: '七回', romaji: 'nanakai' },
      { number: 8, kana: 'はっかい', kanji: '八回', romaji: 'hakkai', isSpecial: true, note: 'Âm ngắt' },
      { number: 9, kana: 'きゅうかい', kanji: '九回', romaji: 'kyuukai' },
      { number: 10, kana: 'じゅっかい', kanji: '十回', romaji: 'jukkai', isSpecial: true, note: 'Âm ngắt' },
    ]
  },
  {
    id: 'kai_floor',
    name: 'Tầng nhà (階)',
    kanji: '階',
    meaning: 'Tầng',
    targetObjects: 'Tầng 1, tầng hầm (地下 - ちか), tầng trên cao',
    questionWord: { kana: 'なんがい / なんかい', kanji: '何階', meaning: 'Tầng mấy?' },
    tips: 'Đặc biệt: Tầng 3 là さんがい (âm đục gai), từ để hỏi cũng thường dùng なんがい.',
    items: [
      { number: 1, kana: 'いっかい', kanji: '一階', romaji: 'ikkai', isSpecial: true, note: 'Âm ngắt' },
      { number: 2, kana: 'にかい', kanji: '二階', romaji: 'nikai' },
      { number: 3, kana: 'さんがい', kanji: '三階', romaji: 'sangai', isSpecial: true, note: 'Âm đục がい' },
      { number: 4, kana: 'よんかい', kanji: '四階', romaji: 'yonkai' },
      { number: 5, kana: 'ごかい', kanji: '五階', romaji: 'gokai' },
      { number: 6, kana: 'ろっかい', kanji: '六階', romaji: 'rokkai', isSpecial: true, note: 'Âm ngắt' },
      { number: 7, kana: 'ななかい', kanji: '七階', romaji: 'nanakai' },
      { number: 8, kana: 'はっかい', kanji: '八階', romaji: 'hakkai', isSpecial: true, note: 'Âm ngắt' },
      { number: 9, kana: 'きゅうかい', kanji: '九階', romaji: 'kyuukai' },
      { number: 10, kana: 'じゅっかい', kanji: '十階', romaji: 'jukkai', isSpecial: true, note: 'Âm ngắt' },
    ]
  },
  {
    id: 'sai',
    name: 'Tuổi tác (歳 / 才)',
    kanji: '歳',
    meaning: 'Tuổi',
    targetObjects: 'Tuổi của con người, thú cưng',
    questionWord: { kana: 'なんさい / おいくつ', kanji: '何歳', meaning: 'Mấy tuổi? (Lịch sự: おいくつ)' },
    tips: '1 tuổi: いっさい, 8 tuổi: はっさい, 20 tuổi ĐẶC BIỆT: はたち (Hatachi).',
    items: [
      { number: 1, kana: 'いっさい', kanji: '一歳', romaji: 'issai', isSpecial: true, note: 'Âm ngắt' },
      { number: 2, kana: 'にさい', kanji: '二歳', romaji: 'nisai' },
      { number: 3, kana: 'さんさい', kanji: '三歳', romaji: 'sansai' },
      { number: 4, kana: 'よんさい', kanji: '四歳', romaji: 'yonsai' },
      { number: 5, kana: 'ごさい', kanji: '五歳', romaji: 'gosai' },
      { number: 6, kana: 'ろくさい', kanji: '六歳', romaji: 'rokusai' },
      { number: 7, kana: 'ななさい', kanji: '七歳', romaji: 'nanasai' },
      { number: 8, kana: 'はっさい', kanji: '八歳', romaji: 'hassai', isSpecial: true, note: 'Âm ngắt' },
      { number: 9, kana: 'きゅうさい', kanji: '九歳', romaji: 'kyuusai' },
      { number: 10, kana: 'じゅっさい', kanji: '十歳', romaji: 'jussai', isSpecial: true, note: 'Âm ngắt' },
      { number: 20, kana: 'はたち', kanji: '二十歳', romaji: 'hatachi', isSpecial: true, note: 'Thuần Nhật đặc biệt tuổi 20' },
    ]
  },
  {
    id: 'soku',
    name: 'Đôi tất, giày dép (足)',
    kanji: '足',
    meaning: 'Đôi (giày, bít tất, dép)',
    targetObjects: 'Giày thể thao, bít tất, dép đi trong nhà',
    questionWord: { kana: 'なんぞく', kanji: '何足', meaning: 'Mấy đôi giày/tất?' },
    tips: '3 đôi: さんぞく (âm đục zoku). 1, 8, 10 là âm ngắt: いっそく, はっそく, じゅっそく.',
    items: [
      { number: 1, kana: 'いっそく', kanji: '一足', romaji: 'issoku', isSpecial: true, note: 'Âm ngắt' },
      { number: 2, kana: 'にそく', kanji: '二足', romaji: 'nisoku' },
      { number: 3, kana: 'さんぞく', kanji: '三足', romaji: 'sanzoku', isSpecial: true, note: 'Âm đục ぞく' },
      { number: 4, kana: 'よんそく', kanji: '四足', romaji: 'yonsoku' },
      { number: 5, kana: 'ごそく', kanji: '五足', romaji: 'gosoku' },
      { number: 6, kana: 'ろくそく', kanji: '六足', romaji: 'rokusoku' },
      { number: 7, kana: 'ななそく', kanji: '七足', romaji: 'nanasoku' },
      { number: 8, kana: 'はっそく', kanji: '八足', romaji: 'hassoku', isSpecial: true, note: 'Âm ngắt' },
      { number: 9, kana: 'きゅうそく', kanji: '九足', romaji: 'kyuusoku' },
      { number: 10, kana: 'じゅっそく', kanji: '十足', romaji: 'jussoku', isSpecial: true, note: 'Âm ngắt' },
    ]
  },
  {
    id: 'ken',
    name: 'Nhà, cửa tiệm độc lập (軒)',
    kanji: '軒',
    meaning: 'Căn, ngôi, tiệm',
    targetObjects: 'Nhà riêng, quán cà phê, cửa hàng tạp hóa',
    questionWord: { kana: 'なんげん', kanji: '何軒', meaning: 'Mấy căn nhà/quán?' },
    tips: '3 căn: さんげん (âm đục gen). 1, 6, 8, 10 là âm ngắt: いっけん, ろっけん, はっけん, じゅっけん.',
    items: [
      { number: 1, kana: 'いっけん', kanji: '一軒', romaji: 'ikken', isSpecial: true, note: 'Âm ngắt' },
      { number: 2, kana: 'にけん', kanji: '二軒', romaji: 'niken' },
      { number: 3, kana: 'さんげん', kanji: '三軒', romaji: 'sangen', isSpecial: true, note: 'Âm đục げん' },
      { number: 4, kana: 'よんけん', kanji: '四軒', romaji: 'yonken' },
      { number: 5, kana: 'ごけん', kanji: '五軒', romaji: 'goken' },
      { number: 6, kana: 'ろっけん', kanji: '六軒', romaji: 'rokken', isSpecial: true, note: 'Âm ngắt' },
      { number: 7, kana: 'ななけん', kanji: '七軒', romaji: 'nanaken' },
      { number: 8, kana: 'はっけん', kanji: '八軒', romaji: 'hakken', isSpecial: true, note: 'Âm ngắt' },
      { number: 9, kana: 'きゅうけん', kanji: '九軒', romaji: 'kyuuken' },
      { number: 10, kana: 'じゅっけん', kanji: '十軒', romaji: 'jukken', isSpecial: true, note: 'Âm ngắt' },
    ]
  },
  {
    id: 'chaku',
    name: 'Bộ quần áo (着)',
    kanji: '着',
    meaning: 'Bộ (đồ complet, vest, đầm dài)',
    targetObjects: 'Vest, comple, kimono, bộ quần áo',
    questionWord: { kana: 'なんちゃく', kanji: '何着', meaning: 'Mấy bộ quần áo?' },
    tips: '1 bộ: いっちゃく, 8 bộ: はっちゃく, 10 bộ: じゅっちゃく.',
    items: [
      { number: 1, kana: 'いっちゃく', kanji: '一着', romaji: 'icchaku', isSpecial: true, note: 'Âm ngắt' },
      { number: 2, kana: 'にちゃく', kanji: '二着', romaji: 'nichaku' },
      { number: 3, kana: 'さんちゃく', kanji: '三着', romaji: 'sanchaku' },
      { number: 4, kana: 'よんちゃく', kanji: '四着', romaji: 'yonchaku' },
      { number: 5, kana: 'ごちゃく', kanji: '五着', romaji: 'gochaku' },
      { number: 6, kana: 'ろくちゃく', kanji: '六着', romaji: 'rokuchaku' },
      { number: 7, kana: 'ななちゃく', kanji: '七着', romaji: 'nanachaku' },
      { number: 8, kana: 'はっちゃく', kanji: '八着', romaji: 'hacchaku', isSpecial: true, note: 'Âm ngắt' },
      { number: 9, kana: 'きゅうちゃく', kanji: '九着', romaji: 'kyuuchaku' },
      { number: 10, kana: 'じゅっちゃく', kanji: '十着', romaji: 'jucchaku', isSpecial: true, note: 'Âm ngắt' },
    ]
  }
];
