import { PracticeQuestion } from '../types';

export const LESSON_06_QUESTIONS: PracticeQuestion[] = [
  // =========================================================================
  // 1. Trợ từ を (O) chỉ tân ngữ trực tiếp (l6_particle_o) — 40 CÂU HỎI
  // =========================================================================
  ...Array.from({ length: 40 }).map((_, i): PracticeQuestion => {
    const templates = [
      {
        q_k: 'Khi một ngoại động từ tác động trực tiếp lên một danh từ tân ngữ (Ví dụ: "Uống nước", "Ăn cơm"), trợ từ nào đứng giữa Danh từ và Động từ?',
        q_j: 'Trợ từ chỉ đối tượng tác động trực tiếp của ngoại động từ là gì?',
        opt: ['を (đọc là o)', 'で (de)', 'に (ni)', 'が (ga)'],
        corr: 0,
        exp: 'Trợ từ 「を」 (viết chữ を nhưng phát âm là 「o」) dùng để đánh dấu tân ngữ trực tiếp chịu tác động của hành động: 「ごはんを 食べます。」 (Ăn cơm).',
        audio: 'ごはんを たべます',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc trợ từ を'
      },
      {
        q_k: 'Trợ từ tân ngữ 「を」 được viết bằng chữ Hiragana nào và phát âm là gì?',
        q_j: 'Trợ từ tân ngữ 「を」 viết chữ gì và phát âm là gì?',
        opt: ['Viết chữ を và phát âm là 「o」', 'Viết chữ お và phát âm là 「o」', 'Viết chữ を và phát âm là 「wo」', 'Viết chữ お và phát âm là 「wo」'],
        corr: 0,
        exp: 'Ký tự 「を」 trong tiếng Nhật hiện đại CHỈ DÙNG làm trợ từ chỉ tân ngữ và luôn phát âm chuẩn là 「o」.',
        audio: 'を',
        fmt: 'special',
        fmtLbl: 'Quy tắc phát âm'
      },
      {
        q_k: 'Điền trợ từ: 「ジュース【 ? 】飲みます。」 (Uống nước hoa quả).',
        q_j: 'Điền trợ từ: 「ジュース【 ? 】飲みます。」',
        opt: ['を', 'で', 'に', 'へ'],
        corr: 0,
        exp: 'ジュース (nước ngọt/nước ép) là tân ngữ của động từ 飲みます ➔ đi với 「を」.',
        audio: 'ジュースを のみます',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ'
      },
      {
        q_k: 'Hội thoại: 「毎朝 何【 ? 】食べますか。」 — 「パンと 卵を 食べます。」',
        q_j: 'Hội thoại: 「毎朝 何【 ? 】食べますか。」 — 「パンと 卵を食べます。」',
        opt: ['を (なん + を ➔ なにを)', 'で', 'に', 'が'],
        corr: 0,
        exp: 'Hỏi ăn cái gì: 「なにを 食べますか (何を食べますか)」.',
        audio: 'なにを たべますか',
        fmt: 'dialogue',
        fmtLbl: 'Hỏi làm cái gì'
      },
      {
        q_k: 'Điền trợ từ: 「新聞【 ? 】読みます。」 (Đọc báo).',
        q_j: 'Điền trợ từ: 「新聞【 ? 】読みます。」',
        opt: ['を', 'で', 'に', 'は'],
        corr: 0,
        exp: 'Đọc báo: 「しんぶんを よみます」.',
        audio: 'しんぶんを よみます',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ'
      },
      {
        q_k: 'Điền trợ từ: 「手紙【 ? 】書きます。」 (Viết thư).',
        q_j: 'Điền trợ từ: 「手紙【 ? 】書きます。」',
        opt: ['を', 'で', 'に', 'と'],
        corr: 0,
        exp: 'Tân ngữ bức thư ➔ 「てがみを かきます」.',
        audio: 'てがみを かきます',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ'
      },
      {
        q_k: 'Điền trợ từ: 「サッカー【 ? 】します。」 (Chơi bóng đá).',
        q_j: 'Điền trợ từ: 「サッカー【 ? 】します。」',
        opt: ['を', 'で', 'に', 'へ'],
        corr: 0,
        exp: 'Các môn thể thao / hoạt động đi với động từ します dùng trợ từ を: 「サッカーを します」.',
        audio: 'サッカーを します',
        fmt: 'fill_particle',
        fmtLbl: 'Chơi thể thao'
      },
      {
        q_k: 'Điền trợ từ: 「音楽【 ? 】聞きます。」 (Nghe nhạc).',
        q_j: 'Điền trợ từ: 「音楽【 ? 】聞きます。」',
        opt: ['を', 'で', 'に', 'と'],
        corr: 0,
        exp: 'Nghe nhạc ➔ 「おんがくを ききます」.',
        audio: 'おんがくを ききます',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ'
      },
      {
        q_k: 'Hội thoại: 「日曜日 何を しましたか。」 — 「映画【 ? 】見ました。」',
        q_j: 'Hội thoại: 「日曜日 何を しましたか。」 — 「映画【 ? 】見ました。」',
        opt: ['を', 'で', 'に', 'へ'],
        corr: 0,
        exp: 'Xem phim ➔ 「えいがを みました」.',
        audio: 'えいがを みました',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại quá khứ'
      },
      {
        q_k: 'Chọn câu viết ĐÚNG ngữ pháp tiếng Nhật:',
        q_j: 'Chọn câu viết ĐÚNG ngữ pháp:',
        opt: ['たばこを 吸います。', 'たばこで 吸います。', 'たばこに 吸います。', 'たばこへ 吸います。'],
        corr: 0,
        exp: 'Hút thuốc lá: 「たばこを すいます (吸います)」.',
        audio: 'たばこを すいます',
        fmt: 'translation',
        fmtLbl: 'Chọn câu đúng'
      }
    ];
    const t = templates[i % templates.length];
    return {
      id: `l6_q_o_${i + 1}`,
      lesson: 6,
      unitId: 'l6_particle_o',
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
  // 2. Trợ từ で chỉ địa điểm hành động (l6_particle_de_action) — 40 CÂU HỎI
  // =========================================================================
  ...Array.from({ length: 40 }).map((_, i): PracticeQuestion => {
    const templates = [
      {
        q_k: 'Khi một HÀNH ĐỘNG diễn ra tại một địa điểm (Ví dụ: "Ăn cơm Ở nhà hàng", "Học Ở thư viện"), trợ từ nào đứng sau danh từ nơi chốn?',
        q_j: 'Trợ từ chỉ địa điểm diễn ra hành động là gì?',
        opt: ['で (de)', 'に (ni)', 'へ (e)', 'を (o)'],
        corr: 0,
        exp: 'Trợ từ 「で」 đứng sau nơi chốn biểu thị địa điểm diễn ra hành động cụ thể: 「レストランで 食べます。」 (Ăn ở nhà hàng).',
        audio: 'レストランで たべます',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc địa điểm hành động'
      },
      {
        q_k: 'Điền trợ từ: 「図書館【 ? 】本を 読みます。」 (Đọc sách ở thư viện).',
        q_j: 'Điền trợ từ: 「図書館【 ? 】本を 読みます。」',
        opt: ['で', 'に', 'へ', 'を'],
        corr: 0,
        exp: 'Hành động đọc sách diễn ra tại thư viện ➔ dùng trợ từ 「で」.',
        audio: 'としょかんで ほんを よみます',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ'
      },
      {
        q_k: 'Hội thoại: 「どこ【 ? 】その シャツを 買いましたか。」 — 「デパートで 買いました。」',
        q_j: 'Hội thoại: 「どこ【 ? 】その シャツを買いましたか。」 — 「デパートで 買いました。」',
        opt: ['で', 'に', 'へ', 'を'],
        corr: 0,
        exp: 'Hỏi mua áo ở đâu (nơi diễn ra hành động mua): 「どこで 買いましたか。」',
        audio: 'どこで かいましたか',
        fmt: 'dialogue',
        fmtLbl: 'Hỏi nơi mua đồ'
      },
      {
        q_k: 'Điền trợ từ: 「食堂【 ? 】昼ごはんを 食べました。」 (Tôi đã ăn trưa ở nhà ăn).',
        q_j: 'Điền trợ từ: 「食堂【 ? 】昼ごはんを食べました。」',
        opt: ['で', 'に', 'へ', 'から'],
        corr: 0,
        exp: 'Ăn cơm ở nhà ăn ➔ 「しょくどうで たべました」.',
        audio: 'しょくどうで ひるごはんを たべました',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ'
      },
      {
        q_k: 'Điền trợ từ: 「うち【 ? 】テレビを 見ます。」 (Xem TV ở nhà).',
        q_j: 'Điền trợ từ: 「うち【 ? 】テレビを 見ます。」',
        opt: ['で', 'に', 'へ', 'を'],
        corr: 0,
        exp: 'Hành động xem TV diễn ra tại nhà ➔ 「うちで」.',
        audio: 'うちで テレビを みます',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ'
      },
      {
        q_k: 'Phân biệt: Điểm đến của động từ di chuyển dùng 「へ」, còn nơi diễn ra hành động dùng trợ từ nào?',
        q_j: 'Nơi diễn ra hành động dùng trợ từ gì?',
        opt: ['で (de)', 'へ (e)', 'に (ni)', 'を (o)'],
        corr: 0,
        exp: 'So sánh: 「スーパーへ 行きます」 (Đi ĐẾN siêu thị) vs 「スーパーで 買います」 (Mua TẠI siêu thị).',
        audio: 'スーパーで かいます',
        fmt: 'special',
        fmtLbl: 'Phân biệt へ vs で'
      },
      {
        q_k: 'Điền trợ từ: 「公園【 ? 】サッカーを しました。」 (Đã chơi bóng đá ở công viên).',
        q_j: 'Điền trợ từ: 「公園【 ? 】サッカーを しました。」',
        opt: ['で', 'に', 'へ', 'と'],
        corr: 0,
        exp: 'Chơi bóng đá tại công viên ➔ 「こうえんで」.',
        audio: 'こうえんで サッカーを しました',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ'
      },
      {
        q_k: 'Hội thoại: 「いつも どこで 勉強しますか。」 — 「うち【 ? 】勉強します。」',
        q_j: 'Hội thoại: 「いつも どこで 勉強しますか。」 — 「うち【 ? 】勉強します。」',
        opt: ['で', 'に', 'へ', 'を'],
        corr: 0,
        exp: 'Học tại nhà ➔ 「うちで べんきょうします」.',
        audio: 'うちで べんきょうします',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại nơi chốn'
      },
      {
        q_k: 'Chọn câu dịch ĐÚNG cho: "Tôi gặp bạn bè ở nhà ga."',
        q_j: 'Chọn câu dịch ĐÚNG cho: "Tôi gặp bạn bè ở nhà ga."',
        opt: ['駅で 友達に 会います。', '駅へ 友達に 会います。', '駅に 友達を 会います。', '駅を 友達に 会います。'],
        corr: 0,
        exp: 'Gặp bạn ở ga: địa điểm hành động là 駅で, gặp ai là 友達に 会います ➔ 「駅で 友達に 会います。」',
        audio: 'えきで ともだちに あいます',
        fmt: 'translation',
        fmtLbl: 'Dịch câu đúng'
      },
      {
        q_k: 'Điền trợ từ: 「教室【 ? 】日本語を 勉強します。」 (Học tiếng Nhật trong lớp học).',
        q_j: 'Điền trợ từ: 「教室【 ? 】日本語を 勉強します。」',
        opt: ['で', 'に', 'へ', 'を'],
        corr: 0,
        exp: 'Địa điểm học ➔ 「きょうしつで」.',
        audio: 'きょうしつで にほんごを べんきょうします',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ'
      }
    ];
    const t = templates[i % templates.length];
    return {
      id: `l6_q_de_${i + 1}`,
      lesson: 6,
      unitId: 'l6_particle_de_action',
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
  // 3. Phủ định hoàn toàn: なにも ＋ V phủ định (l6_particle_nanimo) — 40 CÂU HỎI
  // =========================================================================
  ...Array.from({ length: 40 }).map((_, i): PracticeQuestion => {
    const templates = [
      {
        q_k: 'Để biểu thị PHỦ ĐỊNH HOÀN TOÀN đồ vật/sự việc "Không ăn cái gì cả", ta dùng mẫu câu nào?',
        q_j: 'Mẫu phủ định hoàn toàn "Không ăn cái gì cả" là gì?',
        opt: ['なにも 食べません (nanimo tabemasen)', 'なにを 食べません', 'なにも 食べます', 'なんの 食べません'],
        corr: 0,
        exp: 'Mẫu phủ định hoàn toàn tân ngữ: 「なにも + V-phủ định」: 「なにも 食べません。」 (Không ăn gì cả). Chú ý trợ từ を bị thay thế hoàn toàn bởi も.',
        audio: 'なにも たべません',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc なにも'
      },
      {
        q_k: 'Trong câu phủ định hoàn toàn 「なにも 買いませんでした」, trợ từ tân ngữ 「を」 có xuất hiện không?',
        q_j: 'Trong 「なにも 買いませんでした」, trợ từ を có xuất hiện không?',
        opt: ['Bị trợ từ も thay thế hoàn toàn (Không dùng を)', 'Vẫn phải viết là 何をも', 'Chỉ dùng khi hỏi', 'Tùy người nói'],
        corr: 0,
        exp: 'Trợ từ 「も」 thay thế hoàn toàn cho 「を」. Tuyệt đối không dùng 「なにをも」.',
        audio: 'なにも かいませんでした',
        fmt: 'special',
        fmtLbl: 'Lỗi cấm kỵ'
      },
      {
        q_k: 'Hội thoại: 「朝 何を 食べましたか。」 — 「朝は 忙しかったですから、【 ? 】食べませんでした。」',
        q_j: 'Hội thoại: 「朝 何を食べましたか。」 — 「【 ? 】食べませんでした。」',
        opt: ['なにも (nanimo)', 'なにを (nani o)', 'なんの (nan no)', 'なにか (nanika)'],
        corr: 0,
        exp: 'Không ăn gì cả: 「なにも 食べませんでした」.',
        audio: 'なにも たべませんでした',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại phủ định hoàn toàn'
      },
      {
        q_k: 'Hội thoại: 「デパートで 何を 買いましたか。」 — 「いいものが ありませんでしたから、【 ? 】。」',
        q_j: 'Hội thoại: 「デパートで 何を買いましたか。」 — 「いい物がありませんでしたから、【 ? 】。」',
        opt: ['なにも 買いませんでした', 'なにも 買いました', 'なにを 買いませんでした', 'なにか 買いました'],
        corr: 0,
        exp: 'Không có đồ tốt nên tôi ĐÃ KHÔNG MUA GÌ CẢ ➔ 「なにも 買いませんでした」.',
        audio: 'なにも かいませんでした',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại phủ định quá khứ'
      },
      {
        q_k: 'Điền từ: 「きのうの 晩は 疲れていましたから、【 ? 】しませんでした。」 (Tối qua mệt quá nên chẳng làm gì cả).',
        q_j: 'Điền từ: 「きのうの 晩は 疲れていましたから、【 ? 】しませんでした。」',
        opt: ['なにも', 'なにを', 'どこへも', 'だれとも'],
        corr: 0,
        exp: 'Không làm gì cả ➔ 「なにも しませんでした」.',
        audio: 'なにも しませんでした',
        fmt: 'fill_word',
        fmtLbl: 'Điền từ phủ định'
      },
      {
        q_k: 'Hội thoại: 「今 喉が 渇きましたか。」 — 「いいえ、お腹が いっぱいですから、【 ? 】飲みません。」',
        q_j: 'Hội thoại: 「いいえ、【 ? 】飲みません。」 (Không uống gì cả).',
        opt: ['なにも', 'なにを', 'なにか', 'どれも'],
        corr: 0,
        exp: 'Không uống gì cả ➔ 「なにも 飲みません」.',
        audio: 'なにも のみません',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại ngữ cảnh'
      },
      {
        q_k: 'Chọn câu viết ĐÚNG ngữ pháp tiếng Nhật:',
        q_j: 'Chọn câu viết ĐÚNG ngữ pháp:',
        opt: ['今朝 なにも 食べませんでした。', '今朝 なにを 食べませんでした。', '今朝 なにもを 食べませんでした。', '今朝 なには 食べませんでした。'],
        corr: 0,
        exp: 'Phủ định hoàn toàn: 「なにも 食べませんでした」.',
        audio: 'けさ なにも たべませんでした',
        fmt: 'special',
        fmtLbl: 'Chọn câu đúng'
      },
      {
        q_k: 'Dịch câu sau: "Tôi không nhìn thấy cái gì cả."',
        q_j: 'Dịch câu sau: "Tôi không nhìn thấy cái gì cả."',
        opt: ['なにも 見えません / 見ませんでした。', 'なにを 見えません。', 'なにもを 見えません。', 'なには 見えません。'],
        corr: 0,
        exp: '"Không ... cái gì cả" ➔ dùng 「なにも」.',
        audio: 'なにも みえません',
        fmt: 'translation',
        fmtLbl: 'Dịch câu đúng'
      },
      {
        q_k: 'Phân biệt: 「なにか 食べますか」 và 「なにも 食べません」 khác nhau ở điểm nào?',
        q_j: '「なにか」 và 「なにも」 khác nhau ở điểm nào?',
        opt: ['なにか là nghi vấn "cái gì đó" đi với khẳng định; なにも là phủ định hoàn toàn "không gì cả"', 'Hai từ giống hệt nhau', 'なにも chỉ dùng trong câu hỏi', 'なにか chỉ dùng với người'],
        corr: 0,
        exp: 'なにか (cái gì đó - câu khẳng định/nghi vấn) vs なにも (không cái gì cả - câu phủ định).',
        audio: 'なにか なにも',
        fmt: 'grammar_rule',
        fmtLbl: 'Phân biệt なにか vs なにも'
      },
      {
        q_k: 'Hội thoại: 「お茶を 飲みますか。」 — 「いいえ、けっこうです。【 ? 】。」 (Không, tôi không uống gì cả).',
        q_j: 'Hội thoại: 「いいえ、けっこうです。【 ? 】。」',
        opt: ['なにも 飲みません', 'なにも 飲みます', 'なにを 飲みません', 'なにか 飲みます'],
        corr: 0,
        exp: 'Từ chối lịch sự: 「いいえ、けっこうです。なにも 飲みません。」',
        audio: 'なにも のみません',
        fmt: 'dialogue',
        fmtLbl: 'Giao tiếp hàng ngày'
      }
    ];
    const t = templates[i % templates.length];
    return {
      id: `l6_q_nanimo_${i + 1}`,
      lesson: 6,
      unitId: 'l6_particle_nanimo',
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
