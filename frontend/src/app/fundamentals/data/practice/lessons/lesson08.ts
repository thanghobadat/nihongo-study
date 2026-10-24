import { PracticeQuestion } from '../types';

export const LESSON_08_QUESTIONS: PracticeQuestion[] = [
  // =========================================================================
  // 1. Chia tính từ い và な ở hiện tại (l8_adj_present) — 20 CÂU HỎI
  // =========================================================================
  {
    id: 'l8_q_adj_i_neg_rule',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'special',
    formatLabel: 'Quy tắc phủ định tính từ đuôi い',
    question_kana: 'Để chuyển tính từ đuôi 「い」 sang dạng phủ định hiện tại lịch sự (Ví dụ: 高い - đắt ➔ không đắt), ta bỏ い và đổi thành gì?',
    question_kanji: 'Để chuyển tính từ đuôi 「い」 sang phủ định, ta đổi thành gì?',
    options: ['〜くないです (〜kunai desu)', '〜じゃないです (〜janai desu)', '〜くないでした (〜kunaideshita)', '〜ないです (〜naidesu)'],
    correctIndex: 0,
    explanation: 'Tính từ đuôi い khi phủ định bỏ đuôi い và thêm 「〜くないです」: 「高くないです」 (Không đắt).',
    audioText: 'たかくないです'
  },
  {
    id: 'l8_q_adj_ii_special',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'special',
    formatLabel: 'Ngoại lệ tính từ いい (Tốt)',
    question_kana: 'Tính từ 「いい (Tốt)」 khi chuyển sang phủ định biến đổi đặc biệt thành gì?',
    question_kanji: 'Tính từ 「いい」 phủ định thành gì?',
    options: ['よくないです (yokunai desu)', 'いくないです (ikunai desu)', 'いいじゃないです (iijanai desu)', 'よきないです (yokinai desu)'],
    correctIndex: 0,
    explanation: 'Tính từ 「いい」 có gốc cổ là 「よい」. Khi chia bất kỳ dạng biến đổi nào, bắt buộc đổi stem từ 「よ」 ➔ Phủ định là 「よくないです」.',
    audioText: 'よくないです'
  },
  {
    id: 'l8_q_adj_na_neg_rule',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'special',
    formatLabel: 'Quy tắc phủ định tính từ đuôi な',
    question_kana: 'Để chuyển tính từ đuôi 「な」 sang phủ định hiện tại lịch sự (Ví dụ: 暇 - rảnh ➔ không rảnh), ta dùng đuôi nào?',
    question_kanji: 'Phủ định tính từ đuôi な dùng đuôi nào?',
    options: ['〜じゃ ありません (〜dewa arimasen)', '〜くないです (〜kunai desu)', '〜ないです (〜naidesu)', '〜くありませんでした'],
    correctIndex: 0,
    explanation: 'Tính từ đuôi な chia đuôi phủ định giống hệt như danh từ: 「暇じゃ ありません」 (Không rảnh rỗi).',
    audioText: 'ひまじゃ ありません'
  },
  {
    id: 'l8_q_adj_kirei_trap',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'special',
    formatLabel: 'Bẫy tính từ きれい (Đẹp/Sạch)',
    question_kana: 'Từ 「きれい (Kirei - Đẹp/Sạch sẽ)」 có chữ い ở cuối nhưng thuộc loại tính từ nào?',
    question_kanji: 'Từ 「きれい」 thuộc loại tính từ nào?',
    options: ['Tính từ đuôi な (な形容詞)', 'Tính từ đuôi い (い形容詞)', 'Động từ', 'Phó từ'],
    correctIndex: 0,
    explanation: 'Bẫy kinh điển: きれい chữ Hán là 綺麗, âm i cuối cùng là âm ei trong kanji 麗 (rei). Nó là TÍNH TỪ ĐUÔI NA ➔ Bổ nghĩa danh từ: きれいな 人; Phủ định: きれいじゃありません.',
    audioText: 'きれいな ひと'
  },
  {
    id: 'l8_q_adj_yuumei_trap',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'special',
    formatLabel: 'Bẫy tính từ 有名 (Nổi tiếng)',
    question_kana: 'Từ 「ゆうめい (有名 - Nổi tiếng)」 thuộc loại tính từ nào?',
    question_kanji: 'Từ 「有名 (ゆうめい)」 thuộc loại tính từ nào?',
    options: ['Tính từ đuôi な (な形容詞)', 'Tính từ đuôi い (い形容詞)', 'Danh từ thuần túy', 'Động từ'],
    correctIndex: 0,
    explanation: 'Bẫy: ゆうめい kết thúc bằng âm ei (めい - minh). Nó là TÍNH TỪ ĐUÔI NA ➔ Phủ định là 「有名じゃ ありません」.',
    audioText: 'ゆうめいじゃ ありません'
  },
  {
    id: 'l8_q_adj_samui_neg',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'num_to_reading',
    formatLabel: 'Phủ định tính từ さむい',
    question_kana: 'Phủ định của tính từ 「さむい (Lạnh)」 là gì?',
    question_kanji: 'Phủ định của 「寒い」 là gì?',
    options: ['さむくないです (samukunai desu)', 'さむいじゃないです (samuijanai desu)', 'さむないです (samunaidesu)', 'さむくなかったです'],
    correctIndex: 0,
    explanation: 'さむい bỏ い + くないです ➔ 「さむくないです」.',
    audioText: 'さむくないです'
  },
  {
    id: 'l8_q_adj_atsui_neg',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'num_to_reading',
    formatLabel: 'Phủ định tính từ あつい',
    question_kana: 'Phủ định của tính từ 「あつい (Nóng)」 là gì?',
    question_kanji: 'Phủ định của 「暑い」 là gì?',
    options: ['あつくないです (atsukunai desu)', 'あつじゃないです (atsujanai desu)', 'あつないです (atsunaidesu)', 'あつくありませんでした'],
    correctIndex: 0,
    explanation: 'あつい bỏ い + くないです ➔ 「あつくないです」.',
    audioText: 'あつくないです'
  },
  {
    id: 'l8_q_adj_shizuka_neg',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'num_to_reading',
    formatLabel: 'Phủ định tính từ 静か',
    question_kana: 'Phủ định của tính từ 「しずか (静か - Yên tĩnh)」 là gì?',
    question_kanji: 'Phủ định của 「静か」 là gì?',
    options: ['しずかじゃ ありません (shizuka ja arimasen)', 'しずかくないです (shizukakunai desu)', 'しずかないです (shizukanaidesu)', 'しずかでした'],
    correctIndex: 0,
    explanation: 'Tính từ đuôi な: 「しずかじゃ ありません」.',
    audioText: 'しずかじゃ ありません'
  },
  {
    id: 'l8_q_adj_benri_neg',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'num_to_reading',
    formatLabel: 'Phủ định tính từ 便利',
    question_kana: 'Phủ định của tính từ 「べんり (便利 - Tiện lợi)」 là gì?',
    question_kanji: 'Phủ định của 「便利」 là gì?',
    options: ['べんりじゃ ありません (benri ja arimasen)', 'べんりくないです (benrikunai desu)', 'べんりないです (benrinaidesu)', 'べんりでした'],
    correctIndex: 0,
    explanation: '便利 là tính từ đuôi な ➔ 「べんりじゃ ありません」.',
    audioText: 'べんりじゃ ありません'
  },
  {
    id: 'l8_q_adj_modify_noun_i',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'special',
    formatLabel: 'Bổ nghĩa danh từ (Tính từ đuôi い)',
    question_kana: 'Khi tính từ đuôi 「い」 đứng trực tiếp trước một Danh từ để bổ nghĩa (Ví dụ: Núi cao), ta kết nối thế nào?',
    question_kanji: 'Tính từ đuôi い bổ nghĩa danh từ như thế nào?',
    options: ['Giữ nguyên đuôi い + Danh từ (高い 山)', 'Thêm の (高いの 山)', 'Thêm な (高きな 山)', 'Bỏ い (高 山)'],
    correctIndex: 0,
    explanation: 'Tính từ đuôi い giữ nguyên đuôi い đặt trực tiếp trước danh từ: 「たかい やま (高い 山)」.',
    audioText: 'たかい やま'
  },
  {
    id: 'l8_q_adj_modify_noun_na',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'special',
    formatLabel: 'Bổ nghĩa danh từ (Tính từ đuôi な)',
    question_kana: 'Khi tính từ đuôi 「な」 đứng trực tiếp trước một Danh từ để bổ nghĩa (Ví dụ: Thành phố yên tĩnh), ta kết nối thế nào?',
    question_kanji: 'Tính từ đuôi な bổ nghĩa danh từ như thế nào?',
    options: ['Bắt buộc thêm chữ 「な」 trước Danh từ (静かな 町)', 'Không cần thêm gì', 'Thêm trợ từ の', 'Thêm trợ từ で'],
    correctIndex: 0,
    explanation: 'Tính từ đuôi な khi đứng trước danh từ BẮT BUỘC phải có chữ 「な」: 「しずかな まち (静かな 町)」.',
    audioText: 'しずかな まち'
  },
  {
    id: 'l8_q_adj_modify_kirei_person',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'special',
    formatLabel: 'Bổ nghĩa: Người đẹp (Kireina hito)',
    question_kana: 'Cụm từ "Người đẹp / Cô gái xinh đẹp" trong tiếng Nhật nói đúng chuẩn là gì?',
    question_kanji: '"Người xinh đẹp" nói đúng là gì?',
    options: ['きれいな 人 (kireina hito)', 'きれい 人 (kirei hito)', 'きれいの 人 (kireino hito)', 'きれいい 人 (kireii hito)'],
    correctIndex: 0,
    explanation: 'きれい là tính từ đuôi な nên khi bổ nghĩa danh từ bắt buộc có な ➔ 「きれいな 人」.',
    audioText: 'きれいな ひと'
  },
  {
    id: 'l8_q_adj_modify_fuji',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'special',
    formatLabel: 'Núi Phú Sĩ là ngọn núi cao',
    question_kana: 'Chọn câu dịch ĐÚNG cho: "Núi Phú Sĩ là một ngọn núi cao."',
    question_kanji: 'Chọn câu dịch ĐÚNG cho: "Núi Phú Sĩ là một ngọn núi cao."',
    options: ['富士山は 高い 山です。', '富士山は 高いな 山です。', '富士山は 高いの 山です。', '富士山は 高 山です。'],
    correctIndex: 0,
    explanation: '高い là tính từ đuôi い giữ nguyên ➔ 「たかい やま」.',
    audioText: 'ふじさんは たかい やまです'
  },
  {
    id: 'l8_q_adj_dialogue_japanese',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'dialogue',
    formatLabel: 'Hội thoại tiếng Nhật khó không',
    question_kana: 'Hội thoại: 「日本語は 難しいですか。」 — 「いいえ、【 ? 】。」 (Không, không khó).',
    question_kanji: 'Hội thoại: 「日本語は 難しいですか。」 — 「いいえ、【 ? 】。」',
    options: ['難しくないです (むずかしくないです)', '難しいです (むずかしいです)', '難しかったです (むずかしかったです)', '難しくありませんでした'],
    correctIndex: 0,
    explanation: 'むずかしい phủ định hiện tại ➔ 「むずかしくないです」.',
    audioText: 'いいえ むずかしくないです'
  },
  {
    id: 'l8_q_adj_dialogue_room',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'dialogue',
    formatLabel: 'Hội thoại phòng ký túc xá',
    question_kana: 'Hội thoại: 「寮の 部屋は 静かですか。」 — 「いいえ、【 ? 】。」 (Không, không yên tĩnh).',
    question_kanji: 'Hội thoại: 「寮の 部屋は 静かですか。」 — 「いいえ、【 ? 】。」',
    options: ['静かじゃ ありません (しずかじゃありません)', '静かくないです (しずか welcomes)', '静かでした', '静かな町です'],
    correctIndex: 0,
    explanation: '静か là tính từ đuôi な phủ định ➔ 「しずかじゃ ありません」.',
    audioText: 'いいえ しずかじゃ ありません'
  },
  {
    id: 'l8_q_adj_shinsetsu_person',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'num_to_reading',
    formatLabel: 'Bổ nghĩa: Người tốt bụng',
    question_kana: 'Cụm từ "Người tốt bụng / thân thiện" trong tiếng Nhật là gì?',
    question_kanji: '"Người thân thiện / tốt bụng" là gì?',
    options: ['親切な 人 (しんせつな ひと)', '親切 人 (しんせつ ひと)', '親切の 人 (しんせつの ひと)', '親切い 人 (しんせつい ひと)'],
    correctIndex: 0,
    explanation: '親切 (しんせつ) là tính từ đuôi な ➔ 「親切な 人」.',
    audioText: 'しんせつな ひと'
  },
  {
    id: 'l8_q_adj_new_car',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'num_to_reading',
    formatLabel: 'Bổ nghĩa: Xe ô tô mới',
    question_kana: 'Cụm từ "Xe ô tô mới" trong tiếng Nhật là gì?',
    question_kanji: '"Xe ô tô mới" là gì?',
    options: ['新しい 車 (あたらしい くるま)', '新しな 車 (あたらしな くるま)', '新しいの 車 (あたらしいの くるま)', '新しの 車 (あたらしの くるま)'],
    correctIndex: 0,
    explanation: '新しい là tính từ đuôi い giữ nguyên ➔ 「新しい 車」.',
    audioText: 'あたらしい くるま'
  },
  {
    id: 'l8_q_adj_old_book',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'num_to_reading',
    formatLabel: 'Bổ nghĩa: Cuốn sách cũ',
    question_kana: 'Cụm từ "Cuốn sách cũ" trong tiếng Nhật là gì?',
    question_kanji: '"Cuốn sách cũ" là gì?',
    options: ['古い 本 (ふるい ほん)', '古な 本 (ふるな ほん)', '古いの 本 (ふるいの ほん)', '古 本 (ふる ほん)'],
    correctIndex: 0,
    explanation: '古い là tính từ đuôi い giữ nguyên ➔ 「古い 本」.',
    audioText: 'ふるい ほん'
  },
  {
    id: 'l8_q_adj_famous_place',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'special',
    formatLabel: 'Bổ nghĩa: Nơi nổi tiếng',
    question_kana: 'Cụm từ "Nơi nổi tiếng / Địa điểm nổi tiếng" trong tiếng Nhật là gì?',
    question_kanji: '"Nơi nổi tiếng" là gì?',
    options: ['有名な 所 (ゆうめいな ところ)', '有名 所 (ゆうめい ところ)', '有名い 所 (ゆうめいい ところ)', '有名の 所 (ゆうめいの ところ)'],
    correctIndex: 0,
    explanation: '有名 là tính từ đuôi な ➔ 「有名な 所」.',
    audioText: 'ゆうめいな ところ'
  },
  {
    id: 'l8_q_adj_white_car',
    lesson: 8,
    unitId: 'l8_adj_present',
    format: 'num_to_reading',
    formatLabel: 'Bổ nghĩa: Xe ô tô màu trắng',
    question_kana: 'Cụm từ "Xe ô tô màu trắng" trong tiếng Nhật là gì?',
    question_kanji: '"Xe ô tô màu trắng" là gì?',
    options: ['白い 車 (しろい くるま)', '白な 車 (しろな くるま)', '白の 車 (しろの くるま)', '白いな 車 (しろいな くるま)'],
    correctIndex: 0,
    explanation: '白い là tính từ đuôi い ➔ 「白い 車」.',
    audioText: 'しろい くるま'
  },

  // =========================================================================
  // 2. Phó từ chỉ mức độ: とても, あまり...ない, ぜんぜん...ない (l8_adv_degree) — 40 CÂU HỎI
  // =========================================================================
  ...Array.from({ length: 40 }).map((_, i): PracticeQuestion => {
    const templates = [
      {
        q_k: 'Phó từ 「とても (totemo)」 mang nghĩa là gì và đi với dạng khẳng định hay phủ định?',
        q_j: 'Phó từ 「とても」 mang nghĩa là gì và đi với câu nào?',
        opt: ['Nghĩa là "Rất" và đi với câu KHẲNG ĐỊNH', 'Nghĩa là "Không lắm" và đi với phủ định', 'Nghĩa là "Hoàn toàn không" và đi với phủ định', 'Đi với cả hai bình thường'],
        corr: 0,
        exp: '「とても」 = Rất, cực kỳ. Đi với câu khẳng định: 「とても 暑いです。」 (Rất nóng).',
        audio: 'とても あついです',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc とても'
      },
      {
        q_k: 'Phó từ 「あまり (amari)」 mang nghĩa là gì và BẮT BUỘC phải đi với dạng câu nào?',
        q_j: 'Phó từ 「あまり」 đi với dạng câu nào?',
        opt: ['Nghĩa là "Không... lắm" và BẮT BUỘC đi với đuôi PHỦ ĐỊNH', 'Nghĩa là "Rất" và đi với câu khẳng định', 'Đi với câu hỏi khẳng định', 'Đi với câu quá khứ'],
        corr: 0,
        exp: 'Quy tắc vàng: 「あまり」 luôn luôn đi cùng với đuôi PHỦ ĐỊNH (〜ない / 〜じゃありません) biểu thị ý "Không... lắm": 「あまり 寒くないです。」 (Không lạnh lắm).',
        audio: 'あまり さむくないです',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc あまり'
      },
      {
        q_k: 'Phó từ 「ぜんぜん (zenzen)」 mang nghĩa là "Hoàn toàn không..." thì đi với dạng đuôi nào?',
        q_j: 'Phó từ 「ぜんぜん」 đi với dạng câu nào?',
        opt: ['Bắt buộc đi với đuôi PHỦ ĐỊNH (ぜんぜん 〜ない)', 'Bắt buộc đi với đuôi khẳng định', 'Đi với câu khẳng định hiện tại', 'Đi với câu nghi vấn'],
        corr: 0,
        exp: '「ぜんぜん + Phủ định」 = Hoàn toàn không...: 「ぜんぜん わかりません。」 (Hoàn toàn không hiểu).',
        audio: 'ぜんぜん わかりません',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc ぜんぜん'
      },
      {
        q_k: 'Điền phó từ: 「ハノイの 夏は 【 ? 】暑いです。」 (Mùa hè ở Hà Nội RẤT nóng).',
        q_j: 'Điền phó từ: 「ハノイの 夏は 【 ? 】暑いです。」 (Rất).',
        opt: ['とても (totemo)', 'あまり (amari)', 'ぜんぜん (zenzen)', '少し (sukoshi)'],
        corr: 0,
        exp: 'Câu khẳng định (暑いです) biểu thị mức độ cao dùng 「とても」.',
        audio: 'とても あついです',
        fmt: 'fill_word',
        fmtLbl: 'Điền phó từ mức độ'
      },
      {
        q_k: 'Điền phó từ: 「この 本は 【 ? 】面白くないです。」 (Cuốn sách này KHÔNG HAY LẮM).',
        q_j: 'Điền phó từ: 「この 本は 【 ? 】面白くないです。」',
        opt: ['あまり (amari)', 'とても (totemo)', '大変 (taihen)', 'いつも (itsumo)'],
        corr: 0,
        exp: 'Đuôi phủ định (面白くないです) biểu thị mức độ không cao dùng 「あまり」.',
        audio: 'あまり おもしろくないです',
        fmt: 'fill_word',
        fmtLbl: 'Điền phó từ phủ định'
      },
      {
        q_k: 'Chọn câu viết ĐÚNG ngữ pháp tiếng Nhật:',
        q_j: 'Chọn câu viết ĐÚNG ngữ pháp:',
        opt: ['この 町は あまり 賑やかじゃ ありません。', 'この 町は あまり 賑やかです。(Sai vì あまり đi khẳng định)', 'この 町は とても 賑やかじゃありません。(Sai vì とても đi phủ định)', 'この 町は ぜんぜん 賑やかです。(Sai)'],
        corr: 0,
        exp: 'あまり bắt buộc đi với phủ định: 「あまり 賑やかじゃ ありません」 (Không náo nhiệt lắm).',
        audio: 'あまり にぎやかじゃ ありません',
        fmt: 'special',
        fmtLbl: 'Chọn câu đúng'
      },
      {
        q_k: 'Hội thoại: 「寮の 生活は どうですか。」 — 「【 ? 】楽しいです。」 (Rất vui vẻ).',
        q_j: 'Hội thoại: 「寮の 生活はどうですか。」 — 「【 ? 】楽しいです。」',
        opt: ['とても', 'あまり', 'ぜんぜん', 'どう'],
        corr: 0,
        exp: 'Rất vui vẻ: 「とても 楽しいです」.',
        audio: 'とても たのしいです',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại cảm nhận'
      },
      {
        q_k: 'Dịch câu sau: "Trời không lạnh lắm."',
        q_j: 'Dịch câu sau: "Trời không lạnh lắm."',
        opt: ['あまり 寒くないです。', 'とても 寒くないです。', 'あまり 寒いです。', 'ぜんぜん 寒いです。'],
        corr: 0,
        exp: '"Không... lắm" = あまり + 寒くないです.',
        audio: 'あまり さむくないです',
        fmt: 'translation',
        fmtLbl: 'Dịch câu đúng'
      },
      {
        q_k: 'Phó từ 「すこし (少し - sukoshi)」 mang nghĩa là gì?',
        q_j: 'Phó từ 「少し (すこし)」 mang nghĩa là gì?',
        opt: ['Một chút / Hơi hơi (Một ít)', 'Rất nhiều', 'Hoàn toàn không', 'Quá mức'],
        corr: 0,
        exp: '「少し (すこし)」 = một chút, một ít: 「少し 寒いです。」 (Hơi lạnh một chút).',
        audio: 'すこし さむいです',
        fmt: 'grammar_rule',
        fmtLbl: 'Phó từ すこし'
      },
      {
        q_k: 'Hội thoại: 「日本語は 難しいですか。」 — 「【 ? 】難しくないです。易しいです。」 (Hoàn toàn không khó chút nào).',
        q_j: 'Hội thoại: 「日本語は 難しいですか。」 — 「【 ? 】難しくないです。」 (Hoàn toàn không).',
        opt: ['ぜんぜん (zenzen)', 'とても (totemo)', '少し (sukoshi)', '大変 (taihen)'],
        corr: 0,
        exp: 'Hoàn toàn không khó: 「ぜんぜん 難しくないです」.',
        audio: 'ぜんぜん むずかしくないです',
        fmt: 'dialogue',
        fmtLbl: 'Phủ định hoàn toàn mức độ'
      }
    ];
    const t = templates[i % templates.length];
    return {
      id: `l8_q_adv_${i + 1}`,
      lesson: 8,
      unitId: 'l8_adv_degree',
      format: t.fmt,
      formatLabel: t.fmtLbl,
      question_kana: `[Câu ${i + 1}] ${t.q_k}`,
      question_kanji: `[Câu ${i + 1}] ${t.q_j}`,
      options: t.opt,
      correctIndex: t.corr,
      explanation: t.exp,
      audioText: t.audio
    };
  }),

  // =========================================================================
  // 3. Liên từ nối câu: そして (Và) vs が / でも (Nhưng) (l8_conj_soshite) — 40 CÂU HỎI
  // =========================================================================
  ...Array.from({ length: 40 }).map((_, i): PracticeQuestion => {
    const templates = [
      {
        q_k: 'Liên từ 「そして (soshite)」 dùng để nối hai câu có mối quan hệ gì?',
        q_j: 'Liên từ 「そして」 dùng để nối hai câu có quan hệ gì?',
        opt: ['Quan hệ thuận, bổ sung thêm ý ("Và", "Thêm nữa")', 'Quan hệ nghịch, tương phản ("Nhưng")', 'Quan hệ nguyên nhân kết quả', 'Quan hệ lựa chọn'],
        corr: 0,
        exp: '「そして」 mang nghĩa "Và / Thêm vào đó", dùng để nối 2 câu cùng chiều hướng tích cực hoặc cùng tiêu cực: 「日本の 食べ物は 美味しいです。そして、きれいです。」',
        audio: 'そして',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc そして'
      },
      {
        q_k: 'Trợ từ nối 「が (ga)」 hoặc liên từ 「でも (demo)」 dùng để nối hai vế/câu có quan hệ gì?',
        q_j: '「が」 hoặc 「でも」 dùng để nối hai vế câu có quan hệ gì?',
        opt: ['Quan hệ tương phản, đối nghịch ("Nhưng")', 'Quan hệ bổ sung đồng thuận ("Và")', 'Quan hệ nguyên nhân ("Vì")', 'Quan hệ song song'],
        corr: 0,
        exp: '「が」 (đặt ở cuối vế 1) và 「でも」 (đứng đầu câu 2) mang nghĩa là "Nhưng", biểu thị sự tương phản: 「日本の 食べ物は 美味しいですが、高いです。」 (Đồ ăn Nhật ngon nhưng đắt).',
        audio: 'おいしいですが たかいです',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc が và でも'
      },
      {
        q_k: 'Điền từ nối: 「日本の 食べ物は 美味しいです。【 ? 】、高いです。」 (Đồ ăn Nhật ngon. Nhưng mà đắt).',
        q_j: 'Điền từ nối: 「日本の 食べ物は 美味しいです。【 ? 】、高いです。」',
        opt: ['でも (demo)', 'そして (soshite)', 'ですから (desukara)', 'それから (sorekara)'],
        corr: 0,
        exp: 'Ngon (tích cực) tương phản với đắt (tiêu cực) ➔ dùng liên từ đối nghịch 「でも (nhưng)」.',
        audio: 'でも たかいです',
        fmt: 'fill_word',
        fmtLbl: 'Điền liên từ'
      },
      {
        q_k: 'Điền trợ từ nối: 「日本の 食べ物は 美味しいです【 ? 】、高いです。」 (Nối trực tiếp 2 vế trong cùng 1 câu).',
        q_j: 'Điền trợ từ nối: 「日本の 食べ物は 美味しいです【 ? 】、高いです。」',
        opt: ['が (ga)', 'そして (soshite)', 'でも (demo)', 'から (kara)'],
        corr: 0,
        exp: 'Nối 2 vế trong cùng 1 câu có dấu phẩy: 「〜ですが、〜」.',
        audio: 'おいしいですが たかいです',
        fmt: 'fill_particle',
        fmtLbl: 'Trợ từ nối が'
      },
      {
        q_k: 'Điền từ nối: 「あの 先生は 親切です。【 ? 】、面白いです。」 (Thầy giáo đó tốt bụng. Và lại còn thú vị nữa).',
        q_j: 'Điền từ nối: 「あの 先生は 親切です。【 ? 】、面白いです。」',
        opt: ['そして (soshite)', 'でも (demo)', 'が (ga)', 'ですから (desukara)'],
        corr: 0,
        exp: 'Cả hai tính từ đều mang nghĩa khen (tốt bụng + thú vị) ➔ dùng liên từ thuận 「そして (và)」.',
        audio: 'そして おもしろいです',
        fmt: 'fill_word',
        fmtLbl: 'Điền liên từ そして'
      },
      {
        q_k: 'Chọn câu viết ĐÚNG ngữ pháp tiếng Nhật:',
        q_j: 'Chọn câu viết ĐÚNG ngữ pháp:',
        opt: ['この 部屋は 狭いですが、きれいです。', 'この 部屋は 狭いそして、きれいです。', 'この 部屋は 狭いでも、きれいです。', 'この 部屋は 狭いですがそして きれいです。'],
        corr: 0,
        exp: 'Nối 2 vế đối nghịch (hẹp nhưng sạch sẽ) trong 1 câu dùng 「〜ですが、」.',
        audio: 'せまいですが きれいです',
        fmt: 'special',
        fmtLbl: 'Chọn câu đúng'
      },
      {
        q_k: 'Hội thoại: 「富士山は どうですか。」 — 「とても きれいです。【 ? 】、高いです。」',
        q_j: 'Hội thoại: 「富士山はどうですか。」 — 「とても きれいです。【 ? 】、高いです。」',
        opt: ['そして', 'でも', 'が', 'ですから'],
        corr: 0,
        exp: 'Núi Phú Sĩ rất đẹp và cao ➔ cùng hướng miêu tả bổ sung dùng 「そして」.',
        audio: 'そして たかいです',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại ngữ cảnh'
      },
      {
        q_k: 'Điền từ: 「タイ料理は 辛い（からい）です【 ? 】、美味しいです。」 (Món Thái cay nhưng ngon).',
        q_j: 'Điền từ: 「タイ料理は 辛いです【 ? 】、美味しいです。」',
        opt: ['が', 'そして', 'でも', 'から'],
        corr: 0,
        exp: 'Cay nhưng ngon ➔ dùng trợ từ nối 「が」: 「辛いですが、美味しいです」.',
        audio: 'からいですが おいしいです',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ が'
      },
      {
        q_k: 'Dịch câu sau: "Cái máy tính này tiện lợi nhưng đắt."',
        q_j: 'Dịch câu sau: "Cái máy tính này tiện lợi nhưng đắt."',
        opt: ['この パソコンは 便利ですが、高いです。', 'この パソコンは 便利そして、高いです。', 'この パソコンは 便利でも、高いです。', 'この パソコンは 便利ですが、安いです。'],
        corr: 0,
        exp: 'Tiện lợi nhưng đắt = 「便利ですが、高いです。」',
        audio: 'べんりですが たかいです',
        fmt: 'translation',
        fmtLbl: 'Dịch câu đúng'
      },
      {
        q_k: 'Hội thoại: 「京都は どんな 町ですか。」 — 「古い 町です。【 ? 】、静かな 町です。」',
        q_j: 'Hội thoại: 「京都は どんな 町ですか。」 — 「古い 町です。【 ? 】、静かな 町です。」',
        opt: ['そして', 'でも', 'が', 'ですから'],
        corr: 0,
        exp: 'Cổ kính và yên bình ➔ bổ sung ý dùng 「そして」.',
        audio: 'そして しずかな まちです',
        fmt: 'dialogue',
        fmtLbl: 'Bổ sung tính chất'
      }
    ];
    const t = templates[i % templates.length];
    return {
      id: `l8_q_conj_${i + 1}`,
      lesson: 8,
      unitId: 'l8_conj_soshite',
      format: t.fmt,
      formatLabel: t.fmtLbl,
      question_kana: `[Câu ${i + 1}] ${t.q_k}`,
      question_kanji: `[Câu ${i + 1}] ${t.q_j}`,
      options: t.opt,
      correctIndex: t.corr,
      explanation: t.exp,
      audioText: t.audio
    };
  }),

  // =========================================================================
  // 4. Mẫu câu hỏi cảm nhận và đặc điểm: どんな N & どうですか (l8_kosoado_donna) — 40 CÂU HỎI
  // =========================================================================
  ...Array.from({ length: 40 }).map((_, i): PracticeQuestion => {
    const templates = [
      {
        q_k: 'Khi muốn hỏi về TÍNH CHẤT, ĐẶC ĐIỂM của một Danh từ ("N như thế nào?"), ta dùng từ nghi vấn nào đứng ngay trước Danh từ đó?',
        q_j: 'Từ nghi vấn "Như thế nào" đứng trước Danh từ là gì?',
        opt: ['どんな (donna)', 'どう (dou)', 'どれ (dore)', 'どの (dono)'],
        corr: 0,
        exp: '「どんな + Danh từ」 dùng để hỏi về tính chất, đặc điểm hoặc thể loại của danh từ: 「どんな 町ですか。」 (Là thành phố như thế nào?).',
        audio: 'どんな まちですか',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc どんな'
      },
      {
        q_k: 'Khi muốn hỏi CẢM NHẬN, Ý KIẾN của người đối diện về một sự việc, trạng thái ("... thế nào rồi?"), ta dùng từ nghi vấn nào?',
        q_j: 'Từ nghi vấn hỏi cảm nhận "... như thế nào rồi?" là gì?',
        opt: ['どうですか (dou desu ka)', 'どんなですか (donna desu ka)', 'どれですか (dore desu ka)', 'どちらですか (dochira desu ka)'],
        corr: 0,
        exp: '「[Chủ đề] は どうですか。」 dùng để hỏi cảm nhận, ấn tượng của người nghe: 「日本の 生活は どうですか。」 (Cuộc sống ở Nhật thế nào rồi?).',
        audio: 'にほんの せいかつは どうですか',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc どうですか'
      },
      {
        q_k: 'Hội thoại: 「ハノイは 【 ? 】町ですか。」 — 「にぎやかな 町です。」',
        q_j: 'Hội thoại: 「ハノイは 【 ? 】町ですか。」 — 「にぎやかな 町です。」',
        opt: ['どんな (donna)', 'どう (dou)', 'どれ (dore)', 'どの (dono)'],
        corr: 0,
        exp: 'Đứng ngay trước danh từ 町 (thành phố) để hỏi tính chất ➔ dùng 「どんな」.',
        audio: 'ハノイは どんな まちですか',
        fmt: 'dialogue',
        fmtLbl: 'Hỏi tính chất danh từ'
      },
      {
        q_k: 'Hội thoại: 「新しい 車は 【 ? 】。」 — 「とても べんりです。」',
        q_j: 'Hội thoại: 「新しい 車は 【 ? 】。」 — 「とても 便利です。」',
        opt: ['どうですか (dou desu ka)', 'どんなですか (donna desu ka)', 'どれですか (dore desu ka)', 'どの車ですか (dono kuruma desu ka)'],
        corr: 0,
        exp: 'Hỏi cảm nhận về chiếc xe mới đứng làm vị ngữ ➔ dùng 「どうですか」.',
        audio: 'あたらしい くるまは どうですか',
        fmt: 'dialogue',
        fmtLbl: 'Hỏi cảm nhận'
      },
      {
        q_k: 'Khác biệt căn bản giữa 「どう」 và 「どんな」 là gì?',
        q_j: 'Khác biệt giữa 「どう」 và 「どんな」 là gì?',
        opt: ['どんな bắt buộc đứng trước Danh từ (どんな N); どう đứng làm vị ngữ độc lập (どうですか)', 'Hai từ dùng thay thế lẫn nhau hoàn toàn', 'どう chỉ dùng với người', 'どんな chỉ dùng trong quá khứ'],
        corr: 0,
        exp: 'Quy tắc: 「どんな + N」 luôn đi kèm danh từ phía sau. Còn 「どうですか」 đứng làm vị ngữ độc lập kết thúc câu hỏi.',
        audio: 'どんなまち どうですか',
        fmt: 'special',
        fmtLbl: 'Phân biệt どう vs どんな'
      },
      {
        q_k: 'Hội thoại: 「佐藤さんは 【 ? 】人ですか。」 — 「とても 親切な 人です。」',
        q_j: 'Hội thoại: 「佐藤さんは 【 ? 】人ですか。」 — 「とても 親切な 人です。」',
        opt: ['どんな', 'どう', 'どれ', 'だれ'],
        corr: 0,
        exp: 'Hỏi tính cách/đặc điểm của anh Sato: 「どんな 人ですか」 (Là người như thế nào?).',
        audio: 'さとうさんは どんな ひとですか',
        fmt: 'dialogue',
        fmtLbl: 'Hỏi tính cách người'
      },
      {
        q_k: 'Hội thoại mời uống nước: 「お茶は 【 ? 】。」 — 「ありがとうございます。いただきます。」',
        q_j: 'Hội thoại mời uống: 「お茶は 【 ? 】。」 (Mời bạn dùng trà/uống trà nhé).',
        opt: ['いかがですか / どうですか', 'どんなですか', 'どれですか', 'どこですか'],
        corr: 0,
        exp: '「〜は どうですか / いかがですか」 còn dùng trong mẫu câu ĐỀ NGHỊ, MỜI MỌC ai đó dùng món/đồ uống.',
        audio: 'おちゃは いかがですか',
        fmt: 'dialogue',
        fmtLbl: 'Lời mời lịch sự'
      },
      {
        q_k: 'Chọn câu viết ĐÚNG ngữ pháp tiếng Nhật:',
        q_j: 'Chọn câu viết ĐÚNG ngữ pháp:',
        opt: ['大学の 寮は どうですか。', '大学の 寮は どんなですか。(Sai ngữ pháp)', '大学の 寮は どう町ですか。(Sai)', '大学の 寮は どれですか。(Hỏi vị trí cái nào)'],
        corr: 0,
        exp: 'Hỏi cảm nhận về ký túc xá: 「大学の 寮は どうですか。」',
        audio: 'だいがくの りょうは どうですか',
        fmt: 'special',
        fmtLbl: 'Chọn câu đúng'
      },
      {
        q_k: 'Dịch câu sau: "Thầy Miller là người như thế nào?"',
        q_j: 'Dịch câu sau: "Thầy Miller là người như thế nào?"',
        opt: ['ミラー先生は どんな 人ですか。', 'ミラー先生は どう 人ですか。', 'ミラー先生は だれ 人ですか。', 'ミラー先生は どの 人ですか。'],
        corr: 0,
        exp: '"Là người như thế nào" = 「どんな 人ですか。」',
        audio: 'ミラーせんせいは どんな ひとですか',
        fmt: 'translation',
        fmtLbl: 'Dịch câu đúng'
      },
      {
        q_k: 'Hội thoại: 「ベトナムは 【 ? 】国ですか。」 — 「緑が 多くて、食べ物が 美味しい 国です。」',
        q_j: 'Hội thoại: 「ベトナムは 【 ? 】国ですか。」 — 「食べ物が 美味しい 国です。」',
        opt: ['どんな', 'どう', 'どれ', 'どこ'],
        corr: 0,
        exp: 'Việt Nam là đất nước như thế nào: 「どんな 国ですか」.',
        audio: 'ベトナムは どんな くにですか',
        fmt: 'dialogue',
        fmtLbl: 'Hỏi đặc điểm quốc gia'
      }
    ];
    const t = templates[i % templates.length];
    return {
      id: `l8_q_donna_${i + 1}`,
      lesson: 8,
      unitId: 'l8_kosoado_donna',
      format: t.fmt,
      formatLabel: t.fmtLbl,
      question_kana: `[Câu ${i + 1}] ${t.q_k}`,
      question_kanji: `[Câu ${i + 1}] ${t.q_j}`,
      options: t.opt,
      correctIndex: t.corr,
      explanation: t.exp,
      audioText: t.audio
    };
  })
];
