import { PracticeQuestion } from '../types';

export const LESSON_09_QUESTIONS: PracticeQuestion[] = [
  // =========================================================================
  // 1. Trợ từ が chỉ đối tượng của sở thích, năng lực, sở hữu (l9_particle_ga_state) — 40 CÂU HỎI
  // =========================================================================
  ...Array.from({ length: 40 }).map((_, i): PracticeQuestion => {
    const templates = [
      {
        q_k: 'Khi diễn tả SỞ THÍCH ("Thích", "Ghét") với các tính từ 好き (suki), 嫌い (kirai), trợ từ nào đứng sau danh từ đối tượng?',
        q_j: 'Trợ từ đứng trước 好き (suki) / 嫌い (kirai) là gì?',
        opt: ['が (ga)', 'を (o)', 'で (de)', 'に (ni)'],
        corr: 0,
        exp: 'Trong tiếng Nhật, đối tượng của sở thích (好き, 嫌い) bắt buộc đi với trợ từ 「が」: 「わたしは 音楽が 好きです。」 (Tôi thích âm nhạc).',
        audio: 'おんがくが すきです',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc sở thích が'
      },
      {
        q_k: 'Khi diễn tả NĂNG LỰC ("Giỏi", "Kém") với các tính từ 上手 (jouzu), 下手 (heta), trợ từ nào đứng sau danh từ đối tượng?',
        q_j: 'Trợ từ đứng trước 上手 (jouzu) / 下手 (heta) là gì?',
        opt: ['が (ga)', 'を (o)', 'で (de)', 'に (ni)'],
        corr: 0,
        exp: 'Đối tượng của năng lực (上手, 下手, 得意, 苦手) đi với trợ từ 「が」: 「ミラーさんは 料理が 上手です。」 (Anh Miller giỏi nấu ăn).',
        audio: 'りょうりが じょうずです',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc năng lực が'
      },
      {
        q_k: 'Với động từ chỉ sự hiểu biết 「分かります (hiểu)」 và động từ sở hữu 「あります (có)」, trợ từ nào đứng trước đối tượng?',
        q_j: 'Trợ từ đứng trước 分かります và あります là gì?',
        opt: ['が (ga)', 'を (o)', 'で (de)', 'に (ni)'],
        corr: 0,
        exp: '分かります (hiểu) và あります (có sở hữu) là các động từ trạng thái, đối tượng đi với trợ từ 「が」: 「日本語が 分かります」 (Hiểu tiếng Nhật), 「車が あります」 (Có ô tô).',
        audio: 'にほんごが わかります',
        fmt: 'grammar_rule',
        fmtLbl: 'Trạng thái 分かります・あります'
      },
      {
        q_k: 'Điền trợ từ: 「わたしは イタリア料理【 ? 】好きです。」 (Tôi thích món Ý).',
        q_j: 'Điền trợ từ: 「わたしは イタリア料理【 ? 】好きです。」',
        opt: ['が', 'を', 'で', 'に'],
        corr: 0,
        exp: 'Đối tượng của 好きです là món ăn Ý ➔ dùng trợ từ 「が」.',
        audio: 'イタリアりょうりが すきです',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ sở thích'
      },
      {
        q_k: 'Điền trợ từ: 「サントスさんは サッカー【 ? 】上手です。」 (Anh Santos chơi bóng đá giỏi).',
        q_j: 'Điền trợ từ: 「サントスさんは サッカー【 ? 】上手です。」',
        opt: ['が', 'を', 'で', 'に'],
        corr: 0,
        exp: 'Đối tượng của 上手です ➔ dùng 「が」.',
        audio: 'サッカーが じょうずです',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ năng lực'
      },
      {
        q_k: 'Điền trợ từ: 「英語【 ? 】分かりますか。」 — 「いいえ、あまり 分かりません。」',
        q_j: 'Điền trợ từ: 「英語【 ? 】分かりますか。」',
        opt: ['が', 'を', 'で', 'に'],
        corr: 0,
        exp: 'Đối tượng của 分かります là tiếng Anh ➔ dùng trợ từ 「が」: 「英語が 分かりますか。」',
        audio: 'えいごが わかりますか',
        fmt: 'fill_particle',
        fmtLbl: 'Hiểu biết 分かります'
      },
      {
        q_k: 'Điền trợ từ: 「時間【 ? 】ありませんから、タクシーで 行きます。」 (Vì không có thời gian nên đi taxi).',
        q_j: 'Điền trợ từ: 「時間【 ? 】ありませんから、タクシーで行きます。」',
        opt: ['が', 'を', 'で', 'に'],
        corr: 0,
        exp: 'Sở hữu thời gian đi với あります/ありません ➔ dùng 「が」: 「時間が ありません」.',
        audio: 'じかんが ありません',
        fmt: 'fill_particle',
        fmtLbl: 'Sở hữu あります'
      },
      {
        q_k: 'Có được tự khen mình 「わたしは 日本語が 上手です」 không?',
        q_j: 'Có được tự khen mình là 上手 không?',
        opt: ['KHÔNG NÊN (Người Nhật coi việc tự khen mình là 上手 là thiếu khiêm tốn)', 'Được nói thoải mái', 'Chỉ dùng khi phỏng vấn', 'Chỉ dùng với người lạ'],
        corr: 0,
        exp: 'Văn hóa khiêm nhường Nhật Bản: Tuyệt đối không tự khen mình là 上手. Thay vào đó khi được khen, nên nói 「いいえ、まだまだです」 (Dạ, tôi còn kém lắm).',
        audio: 'まだまだです',
        fmt: 'special',
        fmtLbl: 'Văn hóa khiêm nhường'
      },
      {
        q_k: 'Hội thoại: 「スポーツは 何【 ? 】好きですか。」 — 「テニスが 好きです。」',
        q_j: 'Hội thoại: 「スポーツは 何【 ? 】好きですか。」 — 「テニスが好きです。」',
        opt: ['が', 'を', 'で', 'に'],
        corr: 0,
        exp: 'Hỏi thích môn thể thao nào: 「何が 好きですか。」 (Thích cái gì?).',
        audio: 'なにが すきですか',
        fmt: 'dialogue',
        fmtLbl: 'Hỏi thích cái gì'
      },
      {
        q_k: 'Chọn câu viết ĐÚNG ngữ pháp tiếng Nhật:',
        q_j: 'Chọn câu viết ĐÚNG ngữ pháp:',
        opt: ['わたしは お金が あります。', 'わたしは お金を あります。(Sai)', 'わたしは お金で あります。(Sai)', 'わたしは お金に あります。(Sai)'],
        corr: 0,
        exp: 'Có tiền = 「お金が あります」 (dùng trợ từ が, không dùng を).',
        audio: 'おかねが あります',
        fmt: 'special',
        fmtLbl: 'Chọn câu đúng'
      }
    ];
    const t = templates[i % templates.length];
    return {
      id: `l9_q_state_${i + 1}`,
      lesson: 9,
      unitId: 'l9_particle_ga_state',
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
  // 2. Phó từ chỉ tần suất và mức độ: よく, だいたい, すこし, あまり, ぜんぜん (l9_adv_frequency) — 40 CÂU HỎI
  // =========================================================================
  ...Array.from({ length: 40 }).map((_, i): PracticeQuestion => {
    const templates = [
      {
        q_k: 'Phó từ 「よく (yoku)」 khi đi kèm động từ 「分かります」 mang ý nghĩa gì?',
        q_j: '「よく 分かります」 nghĩa là gì?',
        opt: ['Hiểu RẤT RÕ / Hiểu tường tận', 'Hiểu đại khái', 'Hầu như không hiểu', 'Hoàn toàn không hiểu'],
        corr: 0,
        exp: '「よく 分かります」 = Hiểu rất rõ, hiểu tường tận. (Còn khi đi với động từ hành động thì mang nghĩa "Thường xuyên").',
        audio: 'よく わかります',
        fmt: 'grammar_rule',
        fmtLbl: 'Phó từ よく'
      },
      {
        q_k: 'Phó từ 「だいたい (daitai)」 mang nghĩa là gì?',
        q_j: 'Phó từ 「だいたい」 mang nghĩa là gì?',
        opt: ['Đại khái / Hầu hết (Khoảng 70-80%)', 'Chính xác 100%', 'Hoàn toàn không', 'Hiếm khi'],
        corr: 0,
        exp: '「だいたい」 = Đại khái, phần lớn: 「だいたい 分かります。」 (Tôi hiểu đại khái).',
        audio: 'だいたい わかります',
        fmt: 'grammar_rule',
        fmtLbl: 'Phó từ だいたい'
      },
      {
        q_k: 'Phó từ 「たくさん (takusan)」 dùng để chỉ số lượng mang nghĩa là gì?',
        q_j: 'Phó từ 「たくさん」 nghĩa là gì?',
        opt: ['Nhiều (Số lượng lớn)', 'Ít ỏi', 'Vừa đủ', 'Không có gì'],
        corr: 0,
        exp: '「たくさん」 = Nhiều: 「お金が たくさん あります。」 (Có nhiều tiền).',
        audio: 'たくさん あります',
        fmt: 'grammar_rule',
        fmtLbl: 'Phó từ たくさん'
      },
      {
        q_k: 'Điền phó từ: 「日本語が 【 ? 】分かります。日常会話は 問題ありません。」 (Hiểu rất rõ tiếng Nhật).',
        q_j: 'Điền phó từ: 「日本語が 【 ? 】分かります。」 (Hiểu rất rõ).',
        opt: ['よく (yoku)', 'あまり (amari)', 'ぜんぜん (zenzen)', '少し (sukoshi)'],
        corr: 0,
        exp: 'Hiểu rất rõ dùng 「よく 分かります」.',
        audio: 'よく わかります',
        fmt: 'fill_word',
        fmtLbl: 'Điền phó từ'
      },
      {
        q_k: 'Điền phó từ: 「英語が 【 ? 】分かりません。難しいです。」 (Không hiểu tiếng Anh lắm).',
        q_j: 'Điền phó từ: 「英語が 【 ? 】分かりません。」 (Không... lắm).',
        opt: ['あまり (amari)', 'よく (yoku)', 'だいたい (daitai)', 'たくさん (takusan)'],
        corr: 0,
        exp: 'Đuôi phủ định 「分かりません」 với nghĩa "không... lắm" ➔ bắt buộc dùng 「あまり」.',
        audio: 'あまり わかりません',
        fmt: 'fill_word',
        fmtLbl: 'Phủ định あまり'
      },
      {
        q_k: 'Hội thoại: 「漢字が 分かりますか。」 — 「いいえ、【 ? 】分かりません。」 (Hoàn toàn không hiểu chữ nào).',
        q_j: 'Hội thoại: 「いいえ、【 ? 】分かりません。」 (Hoàn toàn không).',
        opt: ['ぜんぜん (zenzen)', 'よく (yoku)', '少し (sukoshi)', 'だいたい (daitai)'],
        corr: 0,
        exp: 'Hoàn toàn không hiểu ➔ dùng 「ぜんぜん 分かりません」.',
        audio: 'ぜんぜん わかりません',
        fmt: 'dialogue',
        fmtLbl: 'Phủ định hoàn toàn'
      },
      {
        q_k: 'Xếp theo thứ tự mức độ hiểu từ CAO nhất đến THẤP nhất:',
        q_j: 'Xếp mức độ hiểu từ CAO đến THẤP:',
        opt: ['よく ➔ だいたい ➔ 少し ➔ あまり (phủ định) ➔ ぜんぜん (phủ định)', 'だいたい ➔ よく ➔ 少し ➔ ぜんぜん ➔ あまり', 'ぜんぜん ➔ あまり ➔ 少し ➔ よく', '少し ➔ だいたい ➔ よく ➔ ぜんぜん'],
        corr: 0,
        exp: 'Thang đo: よく (100% hiểu rõ) ➔ だいたい (~80%) ➔ 少し (~50%) ➔ あまり...ない (~20%) ➔ ぜんぜん...ない (0%).',
        audio: 'よく だいたい すこし あまり ぜんぜん',
        fmt: 'special',
        fmtLbl: 'Thang đo mức độ'
      },
      {
        q_k: 'Hội thoại: 「チケットが ありますか。」 — 「はい、【 ? 】あります。」 (Có rất nhiều vé).',
        q_j: 'Hội thoại: 「はい、【 ? 】あります。」 (Có nhiều).',
        opt: ['たくさん', 'あまり', 'ぜんぜん', 'どう'],
        corr: 0,
        exp: 'Số lượng nhiều đi với あります dùng 「たくさん あります」.',
        audio: 'たくさん あります',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại số lượng'
      },
      {
        q_k: 'Dịch câu sau: "Tôi hiểu tiếng Nhật một chút."',
        q_j: 'Dịch câu sau: "Tôi hiểu tiếng Nhật một chút."',
        opt: ['日本語が 少し 分かります。', '日本語が よく 分かりません。', '日本語が ぜんぜん 分かります。', '日本語が あまり 分かります。'],
        corr: 0,
        exp: '"Một chút" = 少し ➔ 「日本語が 少し 分かります。」',
        audio: 'にほんごが すこし わかります',
        fmt: 'translation',
        fmtLbl: 'Dịch câu đúng'
      },
      {
        q_k: 'Hội thoại: 「約束が ありますか。」 — 「いいえ、時間が 【 ? 】ありますから、大丈夫です。」 (Có nhiều thời gian).',
        q_j: 'Hội thoại: 「いいえ、時間が 【 ? 】ありますから、大丈夫です。」',
        opt: ['たくさん', 'あまり', 'ぜんぜん', 'すこしも'],
        corr: 0,
        exp: 'Nhiều thời gian: 「時間が たくさん あります」.',
        audio: 'じかんが たくさん あります',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại ngữ cảnh'
      }
    ];
    const t = templates[i % templates.length];
    return {
      id: `l9_q_freq_${i + 1}`,
      lesson: 9,
      unitId: 'l9_adv_frequency',
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
  // 3. Phân biệt cặp trợ từ を vs が (l9_pair_o_vs_ga) — 40 CÂU HỎI
  // =========================================================================
  ...Array.from({ length: 40 }).map((_, i): PracticeQuestion => {
    const templates = [
      {
        q_k: 'Điền cặp trợ từ thích hợp: 「わたしは コーヒー【 ? 】飲みます。でも、紅茶【 ? 】好きです。」',
        q_j: 'Điền trợ từ: 「コーヒー【 ? 】飲みます。紅茶【 ? 】好きです。」',
        opt: ['を / が', 'が / を', 'を / を', 'が / が'],
        corr: 0,
        exp: 'Động từ hành động 飲みます đi với 「を」; tính từ sở thích 好きです đi với 「が」.',
        audio: 'コーヒーを のみます こうちゃが すきです',
        fmt: 'pair_contrast',
        fmtLbl: 'Đối chiếu を vs が'
      },
      {
        q_k: 'Điền cặp trợ từ thích hợp: 「車【 ? 】買います。でも、今 お金【 ? 】ありません。」',
        q_j: 'Điền trợ từ: 「車【 ? 】買います。お金【 ? 】ありません。」',
        opt: ['を / が', 'が / を', 'を / を', 'で / に'],
        corr: 0,
        exp: 'Hành động mua xe: 車を 買います. Trạng thái sở hữu tiền: お金が ありません.',
        audio: 'くるまを かいます おかねが ありません',
        fmt: 'pair_contrast',
        fmtLbl: 'Đối chiếu を vs が'
      },
      {
        q_k: 'Điền trợ từ: 「日本語の 歌【 ? 】歌います。」 vs 「日本語の 歌【 ? 】上手です。」',
        q_j: 'Điền: 「歌【 ? 】歌います」 vs 「歌【 ? 】上手です」',
        opt: ['を / が', 'が / を', 'を / を', 'が / が'],
        corr: 0,
        exp: 'Hành động hát bài hát: 歌を 歌います. Năng lực hát giỏi: 歌が 上手です.',
        audio: 'うたを うたいます うたが じょうずです',
        fmt: 'pair_contrast',
        fmtLbl: 'Hành động vs Năng lực'
      },
      {
        q_k: 'Điền trợ từ: 「本【 ? 】読みます。」 vs 「本【 ? 】あります。」',
        q_j: 'Điền: 「本【 ? 】読みます」 vs 「本【 ? 】あります」',
        opt: ['を / が', 'が / を', 'を / を', 'で / に'],
        corr: 0,
        exp: 'Đọc sách là hành động tác động lên tân ngữ: 本を 読みます. Có sách là trạng thái sở hữu: 本が あります.',
        audio: 'ほんを よみます ほんが あります',
        fmt: 'pair_contrast',
        fmtLbl: 'Tân ngữ vs Tồn tại'
      },
      {
        q_k: 'Chọn câu viết ĐÚNG khi nói "Tôi thích bóng đá và tôi chơi bóng đá vào cuối tuần":',
        q_j: 'Chọn câu viết ĐÚNG:',
        opt: ['サッカーが 好きです。週末 サッカーを します。', 'サッカーを 好きです。週末 サッカーが します。(Sai trợ từ)', 'サッカーが 好きです。週末 サッカーが します。(Sai)', 'サッカーを 好きです。週末 サッカーを します。(Sai)'],
        corr: 0,
        exp: 'Sở thích đi với が (サッカーが 好きです); hành động chơi thể thao đi với を (サッカーを します).',
        audio: 'サッカーが すきです サッカーを します',
        fmt: 'special',
        fmtLbl: 'Chọn câu đúng'
      },
      {
        q_k: 'Quy tắc tổng quát: Nhóm từ nào sau đây BẮT BUỘC dùng trợ từ 「が」 mà không dùng 「を」?',
        q_j: 'Nhóm từ nào BẮT BUỘC dùng trợ từ 「が」?',
        opt: ['好き, 嫌い, 上手, 下手, 分かります, あります', '食べます, 飲みます, 買います, 読みます', '行きます, 来ます, 帰ります', '起きます, 寝ます, 働きます'],
        corr: 0,
        exp: 'Tính từ sở thích/năng lực (好き, 嫌い, 上手, 下手) và động từ trạng thái/năng lực (分かります, あります) luôn đi với trợ từ 「が」.',
        audio: 'すき きらい じょうず へた わかります あります',
        fmt: 'grammar_rule',
        fmtLbl: 'Tổng kết quy tắc'
      },
      {
        q_k: 'Điền trợ từ: 「わたしは 猫【 ? 】大好きです。」 (Tôi rất thích mèo).',
        q_j: 'Điền trợ từ: 「わたしは 猫【 ? 】大好きです。」',
        opt: ['が', 'を', 'で', 'に'],
        corr: 0,
        exp: 'Đại từ sở thích 大好き (rất thích) đi với trợ từ 「が」: 「猫が 大好きです」.',
        audio: 'ねこが だいすきです',
        fmt: 'fill_particle',
        fmtLbl: 'Trợ từ 大好き'
      },
      {
        q_k: 'Điền cặp trợ từ: 「テレビ【 ? 】見ます。」 vs 「テレビ【 ? 】ありません。」',
        q_j: 'Điền: 「テレビ【 ? 】見ます」 vs 「テレビ【 ? 】ありません」',
        opt: ['を / が', 'が / を', 'を / を', 'が / が'],
        corr: 0,
        exp: 'Xem TV (hành động): テレビを 見ます; Không có TV (sở hữu): テレビが ありません.',
        audio: 'テレビを みます テレビが ありません',
        fmt: 'pair_contrast',
        fmtLbl: 'Xem vs Có'
      },
      {
        q_k: 'Dịch câu sau: "Tôi không hiểu tiếng Nhật, nhưng tôi thích nước Nhật."',
        q_j: 'Dịch câu sau: "Tôi không hiểu tiếng Nhật, nhưng tôi thích nước Nhật."',
        opt: ['日本語が 分かりませんが、日本が 好きです。', '日本語を 分かりませんが、日本を 好きです。', '日本語が 分かりませんが、日本を 好きです。', '日本語を 分かりませんが、日本が 好きです。'],
        corr: 0,
        exp: 'Cả hai vế đều là trạng thái (hiểu) và sở thích (thích) nên CẢ HAI VẾ ĐỀU DÙNG 「が」.',
        audio: 'にほんごが わかりませんが にほんが すきです',
        fmt: 'translation',
        fmtLbl: 'Dịch câu đúng'
      },
      {
        q_k: 'Hội thoại: 「料理【 ? 】作りますか。」 — 「いいえ、料理【 ? 】下手ですから、作りません。」',
        q_j: 'Hội thoại: 「料理【 ? 】作りますか。」 — 「料理【 ? 】下手ですから。」',
        opt: ['を / が', 'が / を', 'を / を', 'が / が'],
        corr: 0,
        exp: 'Nấu ăn (hành động 作ります) dùng を; kém nấu ăn (năng lực 下手です) dùng が ➔ 「を / が」.',
        audio: 'りょうりを つくりますか りょうりが へたですから',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại đối chiếu'
      }
    ];
    const t = templates[i % templates.length];
    return {
      id: `l9_q_pair_${i + 1}`,
      lesson: 9,
      unitId: 'l9_pair_o_vs_ga',
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
