export interface QuizQuestion {
  id: string;
  lesson: number; // Lesson ID: 1 to 50
  category: 'counters' | 'time' | 'particles' | 'conjugation' | 'kosoado' | 'conjunctions';
  categoryLabel: string;
  question: string;
  subtext?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const FUNDAMENTALS_QUIZ_DATA: QuizQuestion[] = [
  // ===================== Bài 1 =====================
  {
    id: 'q_l1_age',
    lesson: 1,
    category: 'counters',
    categoryLabel: 'Số đếm & Đơn vị',
    question: 'Trong tiếng Nhật, "20 tuổi" có cách đọc đặc biệt thuần Nhật là gì?',
    options: ['にじゅっさい (nijussai)', 'はたち (hatachi)', 'はったい (hattai)', 'にじゅうさい (nijuusai)'],
    correctIndex: 1,
    explanation: '20 tuổi là cột mốc trưởng thành tại Nhật, có cách đọc thuần Nhật đặc biệt là「はたち (hatachi)」.'
  },
  {
    id: 'q_l1_wa_mo',
    lesson: 1,
    category: 'particles',
    categoryLabel: 'Trợ từ',
    question: 'Để nói "Tôi CŨNG là người Việt Nam", ta dùng trợ từ nào?',
    options: ['わたし は ベトナム人です。', 'わたし も ベトナム人です。', 'わたし の ベトナム人です。', 'わたし が ベトナム人です。'],
    correctIndex: 1,
    explanation: 'Trợ từ「も (mo)」thay thế cho「は」để biểu thị sự đồng nhất "cũng là...".'
  },

  // ===================== Bài 2 =====================
  {
    id: 'q_l2_kono',
    lesson: 2,
    category: 'kosoado',
    categoryLabel: 'Ko-so-a-do',
    question: 'Điền từ thích hợp:「【 ? 】傘は 田中さんのですか。」',
    options: ['これ', 'この', 'ここ', 'こちら'],
    correctIndex: 1,
    explanation: 'Đứng ngay trước một Danh từ (傘 - cái ô) để bổ nghĩa thì bắt buộc phải dùng nhóm KO-NO / SO-NO / A-NO / DO-NO ➔「この傘」.'
  },

  // ===================== Bài 3 =====================
  {
    id: 'q_l3_floor',
    lesson: 3,
    category: 'counters',
    categoryLabel: 'Số đếm & Đơn vị',
    question: 'Hãy chọn cách đọc đúng của cụm từ:「 ３階 」(Tầng 3)',
    options: ['さんかい (sankai)', 'さんがい (sangai)', 'みっかい (mikkai)', 'さんばい (sanbai)'],
    correctIndex: 1,
    explanation: 'Tầng 3 trong tiếng Nhật có biến âm đục:「さんがい (sangai)」. Từ để hỏi cũng thường dùng なんがい.'
  },
  {
    id: 'q_l3_num300',
    lesson: 3,
    category: 'counters',
    categoryLabel: 'Số đếm',
    question: 'Số "300" trong tiếng Nhật đọc là gì?',
    options: ['さんひゃく (sanhyaku)', 'さんびゃく (sanbyaku)', 'さんぴゃく (sanpyaku)', 'さんぜん (sanzen)'],
    correctIndex: 1,
    explanation: 'Số 300 bắt buộc biến âm thành âm đục:「さんびゃく (sanbyaku)」.'
  },

  // ===================== Bài 4 =====================
  {
    id: 'q_l4_hours4',
    lesson: 4,
    category: 'time',
    categoryLabel: 'Thời gian',
    question: 'Chọn cách đọc đúng của「 ４時 」(4 giờ):',
    options: ['よんじ (yonji)', 'よじ (yoji)', 'しじ (shiji)', 'よっじ (yojji)'],
    correctIndex: 1,
    explanation: '4 giờ bắt buộc đọc là「よじ (yoji)」(chỉ có 2 âm tiết, không có n).'
  },
  {
    id: 'q_l4_hours9',
    lesson: 4,
    category: 'time',
    categoryLabel: 'Thời gian',
    question: 'Chọn cách đọc đúng của「 ９時 」(9 giờ):',
    options: ['きゅうじ (kyuuji)', 'くじ (kuji)', 'こじ (koji)', 'きゅじ (kyuji)'],
    correctIndex: 1,
    explanation: '9 giờ bắt buộc đọc là「くじ (kuji)」. Không đọc là kyuuji.'
  },

  // ===================== Bài 5 =====================
  {
    id: 'q_l5_day1',
    lesson: 5,
    category: 'time',
    categoryLabel: 'Thời gian',
    question: 'Ngày「 mồng 1 」trong tháng được đọc là gì?',
    options: ['いちにち (ichinichi)', 'ついたち (tsuitachi)', 'ふつか (futsuka)', 'ひとつひ (hitotsuhi)'],
    correctIndex: 1,
    explanation: 'Ngày mồng 1 đọc là「ついたち (tsuitachi)」(nguồn gốc từ tsukitachi: trăng mọc). Lưu ý「いちにち」là khoảng thời gian 1 ngày.'
  },
  {
    id: 'q_l5_day14',
    lesson: 5,
    category: 'time',
    categoryLabel: 'Thời gian',
    question: 'Ngày「 １４日 」(ngày 14) được đọc là gì?',
    options: ['じゅうよんにち (juuyonnichi)', 'じゅうよっか (juuyokka)', 'じゅうしちにち (juushichinichi)', 'じゅうしにち (juushinichi)'],
    correctIndex: 1,
    explanation: 'Ngày 14 kế thừa cách đọc của mồng 4 (よっか) ➔ đọc là「じゅうよっか (juuyokka)」.'
  },
  {
    id: 'q_l5_months',
    lesson: 5,
    category: 'time',
    categoryLabel: 'Thời gian',
    question: 'Tháng 4 và Tháng 7 trong tiếng Nhật đọc lần lượt là:',
    options: ['よんがつ & なながつ', 'しがつ & しちがつ', 'しがつ & なながつ', 'よんがつ & しちがつ'],
    correctIndex: 1,
    explanation: 'Tháng 4 đọc là「しがつ (shigatsu)」và Tháng 7 đọc là「しちがつ (shichigatsu)」.'
  },

  // ===================== Bài 6 =====================
  {
    id: 'q_l6_place_action',
    lesson: 6,
    category: 'particles',
    categoryLabel: 'Trợ từ',
    question: 'Chọn trợ từ thích hợp điền vào chỗ trống:「 図書館【 ? 】本を 読みます。」',
    options: ['に', 'で', 'へ', 'を'],
    correctIndex: 1,
    explanation: 'Đọc sách là một HÀNH ĐỘNG tích cực diễn ra tại địa điểm ➔ Bắt buộc dùng trợ từ「で」.'
  },
  {
    id: 'q_l6_nanimo',
    lesson: 6,
    category: 'kosoado',
    categoryLabel: 'Ko-so-a-do',
    question: 'Để diễn đạt câu: "Sáng nay tôi không ăn gì cả", ta chọn cụm từ nào?',
    options: ['朝は なにか 食べませんでした。', '朝は なにも 食べませんでした。', '朝は なんでも 食べました。', '朝は どこも 食べませんでした。'],
    correctIndex: 1,
    explanation: 'Công thức phủ định hoàn toàn: [Từ để hỏi + も + Động từ Phủ định] ➔「なにも 食べませんでした」(Chẳng ăn gì cả).'
  },

  // ===================== Bài 8 =====================
  {
    id: 'q_l8_amari',
    lesson: 8,
    category: 'conjunctions',
    categoryLabel: 'Liên từ & Phó từ',
    question: 'Phó từ「 あまり (amari) 」khi dùng trong câu bắt buộc phải đi với dạng nào?',
    options: ['Khẳng định (〜ます / 〜です)', 'Phủ định (〜ません / 〜ない)', 'Quá khứ (〜ました)', 'Mệnh lệnh (〜てください)'],
    correctIndex: 1,
    explanation: 'Phó từ「あまり」mang nghĩa "không ... lắm", BẮT BUỘC phải đi cùng đuôi câu Phủ định (Ví dụ: あまり わかりません).'
  },

  // ===================== Bài 9 =====================
  {
    id: 'q_l9_ga_like',
    lesson: 9,
    category: 'particles',
    categoryLabel: 'Trợ từ',
    question: 'Chọn trợ từ thích hợp:「 わたしは 日本料理【 ? 】好きです。」',
    options: ['を', 'に', 'が', 'で'],
    correctIndex: 2,
    explanation: 'Với tính từ chỉ sở thích (好き, 嫌い) hoặc khả năng (できる, わかる) ➔ Đối tượng đi với trợ từ「が」.'
  },

  // ===================== Bài 10 =====================
  {
    id: 'q_l10_ni_exist',
    lesson: 10,
    category: 'particles',
    categoryLabel: 'Trợ từ',
    question: 'Chọn trợ từ thích hợp điền vào chỗ trống:「 庭【 ? 】猫が います。」',
    options: ['で', 'に', 'を', 'へ'],
    correctIndex: 1,
    explanation: 'Động từ「います / あります」chỉ sự TỒN TẠI tĩnh tại một địa điểm ➔ Bắt buộc dùng trợ từ「に」.'
  },

  // ===================== Bài 11 =====================
  {
    id: 'q_l11_hon',
    lesson: 11,
    category: 'counters',
    categoryLabel: 'Số đếm & Đơn vị',
    question: 'Hãy chọn cách đọc đúng của cụm từ:「 ３本 」(3 chai / 3 cây bút)',
    options: ['さんほん (sanhon)', 'さんぽん (sanpon)', 'さんぼん (sanbon)', 'みっほん (mihhon)'],
    correctIndex: 2,
    explanation: 'Quy tắc biến âm đuôi 本 (ほん): Số 3 và từ để hỏi (何本) bắt buộc biến âm thành âm đục [〜ぼん] ➔ さんぼん (sanbon).'
  },
  {
    id: 'q_l11_yonin',
    lesson: 11,
    category: 'counters',
    categoryLabel: 'Số đếm & Đơn vị',
    question: 'Hãy chọn cách đọc đúng của cụm từ:「 ４人 」(4 người)',
    options: ['よんにん (yonnin)', 'よにん (yonin)', 'しにん (shinin)', 'よっにん (yonnin)'],
    correctIndex: 1,
    explanation: '4 người bắt buộc đọc là「よにん (yonin)」(rút gọn âm n). Tuyệt đối không đọc là yon-nin hoặc shi-nin.'
  },
  {
    id: 'q_l11_mai',
    lesson: 11,
    category: 'counters',
    categoryLabel: 'Số đếm & Đơn vị',
    question: 'Chọn đơn vị đếm thích hợp cho「 áo sơ mi, vé tàu, bức ảnh 」:',
    options: ['台 (だい)', '本 (ほん)', '枚 (まい)', '冊 (さつ)'],
    correctIndex: 2,
    explanation: 'Đơn vị「枚 (まい)」chuyên dùng để đếm các vật mỏng phẳng như giấy tờ, vé tàu, áo quần, đĩa CD.'
  },

  // ===================== Bài 12 =====================
  {
    id: 'q_l12_yokatta',
    lesson: 12,
    category: 'conjugation',
    categoryLabel: 'Chia động từ & Tính từ',
    question: 'Dạng quá khứ của tính từ「 いい (Tốt) 」là gì?',
    options: ['いかった (ikatta)', 'よかった (yokatta)', 'いくなかった (ikunakatta)', 'いいでした (iideshita)'],
    correctIndex: 1,
    explanation: 'Tính từ「いい」là ngoại lệ độc nhất, mọi biến đổi đều lấy từ gốc cổ「よい」➔ Quá khứ là「よかった (yokatta)」.'
  },

  // ===================== Bài 14 =====================
  {
    id: 'q_l14_kaeru',
    lesson: 14,
    category: 'conjugation',
    categoryLabel: 'Chia động từ',
    question: 'Động từ「 帰る (かえる - về) 」thuộc nhóm nào và chia sang thể Masu như thế nào?',
    options: [
      'Nhóm 2 ➔ かえます (kaemasu)',
      'Nhóm 1 (Ngoại lệ) ➔ かえります (kaerimasu)',
      'Nhóm 3 ➔ かえします (kaeshimasu)',
      'Nhóm 2 ➔ かえれます (kaeremasu)'
    ],
    correctIndex: 1,
    explanation: '「帰る」tận cùng là eru nhưng là ĐỘNG TỪ NGOẠI LỆ thuộc Nhóm 1 ➔ Chia đổi ru thành ri:「かえります (kaerimasu)」.'
  },
  {
    id: 'q_l14_itte',
    lesson: 14,
    category: 'conjugation',
    categoryLabel: 'Chia động từ',
    question: 'Thể Te của động từ「 行く (いく - đi) 」là gì?',
    options: ['行いて (iite)', '行って (itte)', '行いで (iide)', '行きて (ikite)'],
    correctIndex: 1,
    explanation: 'Mặc dù đuôi「く」thường biến thành「いて」, nhưng riêng động từ「行く」là ngoại lệ độc nhất biến thành âm ngắt「行って (itte)」.'
  },

  // ===================== Bài 17 =====================
  {
    id: 'q_l17_kawanai',
    lesson: 17,
    category: 'conjugation',
    categoryLabel: 'Chia động từ',
    question: 'Thể Nai (Phủ định thông thường) của động từ「 買う (かう - mua) 」là gì?',
    options: ['買かない (kakanai)', '買わない (kawanai)', '買いない (kainai)', '買あない (kaanai)'],
    correctIndex: 1,
    explanation: 'Động từ Nhóm 1 tận cùng bằng âm「う (u)」khi chuyển sang thể Nai đổi thành「わ (wa) + ない」➔「買わない (kawanai)」.'
  },
  {
    id: 'q_l17_madeni',
    lesson: 17,
    category: 'particles',
    categoryLabel: 'Trợ từ',
    question: 'Chọn trợ từ thích hợp:「 ５時【 ? 】レポートを 出してください。」(Nộp trước 5 giờ)',
    options: ['まで', 'までに', 'から', 'で'],
    correctIndex: 1,
    explanation: 'Hạn chót hành động phải hoàn tất trước thời điểm đó ➔ Dùng「までに」.'
  },

  // ===================== Bài 27 =====================
  {
    id: 'q_l27_shika',
    lesson: 27,
    category: 'particles',
    categoryLabel: 'Trợ từ',
    question: 'Điền trợ từ đúng:「 財布に １００円【 ? 】ありません。」(Chỉ có mỗi 100 yên)',
    options: ['だけ', 'しか', 'も', 'でも'],
    correctIndex: 1,
    explanation: 'Đuôi câu là thể PHỦ ĐỊNH (ありません) và mang sắc thái ít ỏi, thiếu thốn ➔ Đi với trợ từ「しか」.'
  },

  // ===================== Bài 28 =====================
  {
    id: 'q_l28_dakara',
    lesson: 28,
    category: 'conjunctions',
    categoryLabel: 'Liên từ & Phó từ',
    question: 'Điền liên từ thích hợp:「 昨日は 寒かったです。【 ? 】風邪を ひきました。」',
    options: ['しかし', 'だから / それで', 'ところで', 'それとも'],
    correctIndex: 1,
    explanation: 'Câu sau là kết quả của lý do ở câu trước ➔ Dùng liên từ chỉ nguyên nhân/kết quả「だから (vì vậy) / それで (thế là)」.'
  }
];
