import { PracticeQuestion } from '../types';

export const LESSON_07_QUESTIONS: PracticeQuestion[] = [
  // =========================================================================
  // 1. Trợ từ で chỉ công cụ, phương tiện, ngôn ngữ (l7_particle_de_tool) — 40 CÂU HỎI
  // =========================================================================
  ...Array.from({ length: 40 }).map((_, i): PracticeQuestion => {
    const templates = [
      {
        q_k: 'Khi thực hiện hành động BẰNG một công cụ, phương tiện cầm tay (Ví dụ: "Ăn cơm BẰNG đũa", "Cắt giấy BẰNG kéo"), ta dùng trợ từ nào?',
        q_j: 'Trợ từ chỉ công cụ thực hiện hành động là gì?',
        opt: ['で (de)', 'を (o)', 'に (ni)', 'と (to)'],
        corr: 0,
        exp: 'Trợ từ 「で」 đứng sau danh từ chỉ công cụ, dụng cụ: 「はしで 食べます。」 (Ăn bằng đũa), 「はさみで 切ります。」 (Cắt bằng kéo).',
        audio: 'はしで たべます',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc công cụ で'
      },
      {
        q_k: 'Khi nói hoặc viết BẰNG một thứ tiếng / ngôn ngữ nào đó (Ví dụ: "Viết báo cáo BẰNG tiếng Nhật"), ta dùng trợ từ nào?',
        q_j: 'Trợ từ đứng sau danh từ ngôn ngữ là gì?',
        opt: ['で (de)', 'を (o)', 'に (ni)', 'へ (e)'],
        corr: 0,
        exp: 'Trợ từ 「で」 đứng sau ngôn ngữ để chỉ phương tiện giao tiếp: 「日本語で レポートを 書きます。」 (Viết báo cáo bằng tiếng Nhật).',
        audio: 'にほんごで レポートを かきます',
        fmt: 'grammar_rule',
        fmtLbl: 'Ngôn ngữ で'
      },
      {
        q_k: 'Điền trợ từ: 「はさみ【 ? 】紙を 切ります。」 (Cắt giấy bằng kéo).',
        q_j: 'Điền trợ từ: 「はさみ【 ? 】紙を切ります。」',
        opt: ['で', 'を', 'に', 'と'],
        corr: 0,
        exp: 'Kéo (はさみ) là công cụ cắt ➔ dùng trợ từ 「で」.',
        audio: 'はさみで かみを きります',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ công cụ'
      },
      {
        q_k: 'Hội thoại: 「『Thank you』は 日本語【 ? 】何ですか。」 — 「『ありがとう』です。」',
        q_j: 'Hội thoại: 「『Thank you』は 日本語【 ? 】何ですか。」 — 「『ありがとう』です。」',
        opt: ['で', 'に', 'を', 'は'],
        corr: 0,
        exp: 'Mẫu câu hỏi từ vựng trong ngôn ngữ: 「〜は [ngôn ngữ] で 何ですか。」 (Từ này trong tiếng Nhật là gì?).',
        audio: 'にほんごで なんですか',
        fmt: 'dialogue',
        fmtLbl: 'Hỏi từ vựng bằng ngôn ngữ'
      },
      {
        q_k: 'Điền trợ từ: 「スプーン【 ? 】アイスクリームを 食べます。」 (Ăn kem bằng thìa).',
        q_j: 'Điền trợ từ: 「スプーン【 ? 】アイスクリームを食べます。」',
        opt: ['で', 'を', 'に', 'と'],
        corr: 0,
        exp: 'Thìa/muỗng (スプーン) là dụng cụ ăn ➔ dùng 「で」.',
        audio: 'スプーンで アイスクリームを たべます',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ dụng cụ'
      },
      {
        q_k: 'Điền trợ từ: 「手【 ? 】ごはんを 食べます。」 (Ăn cơm bằng tay).',
        q_j: 'Điền trợ từ: 「手【 ? 】ごはんを食べます。」',
        opt: ['で', 'を', 'に', 'と'],
        corr: 0,
        exp: 'Bằng tay (手 - て) ➔ dùng 「手で」.',
        audio: 'てで ごはんを たべます',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ bộ phận'
      },
      {
        q_k: 'Hội thoại: 「何【 ? 】手紙を 書きましたか。」 — 「パソコンで 書きました。」',
        q_j: 'Hội thoại: 「何【 ? 】手紙を書きましたか。」 — 「パソコンで 書きました。」',
        opt: ['で (なんで)', 'に', 'を', 'へ'],
        corr: 0,
        exp: 'Hỏi viết thư bằng công cụ gì: 「何で (なんで) 手紙を 書きましたか。」',
        audio: 'なんで てがみを かきましたか',
        fmt: 'dialogue',
        fmtLbl: 'Hỏi viết bằng gì'
      },
      {
        q_k: 'Điền trợ từ: 「ケータイ【 ? 】写真を 撮ります。」 (Chụp ảnh bằng điện thoại).',
        q_j: 'Điền trợ từ: 「ケータイ【 ? 】写真を撮ります。」',
        opt: ['で', 'を', 'に', 'と'],
        corr: 0,
        exp: 'Điện thoại di động là phương tiện chụp ➔ 「ケータイで」.',
        audio: 'ケータイで しゃしんを とります',
        fmt: 'fill_particle',
        fmtLbl: 'Công cụ chụp ảnh'
      },
      {
        q_k: 'Chọn câu dịch ĐÚNG cho: "Hãy nói bằng tiếng Nhật."',
        q_j: 'Chọn câu dịch ĐÚNG cho: "Hãy nói bằng tiếng Nhật."',
        opt: ['日本語で 話してください。', '日本語を 話してください。', '日本語に 話してください。', '日本語へ 話してください。'],
        corr: 0,
        exp: 'Bằng tiếng Nhật = 「日本語で」.',
        audio: 'にほんごで はなしてください',
        fmt: 'translation',
        fmtLbl: 'Dịch câu đúng'
      },
      {
        q_k: 'Hội thoại: 「これは 英語で 何ですか。」 — 「【 ? 】です。」',
        q_j: 'Hội thoại: 「これは 英語で 何ですか。」 — 「【 ? 】です。」',
        opt: ['『Book』です。', '『ほん』です。', '本で ございます。', '英語を 話します。'],
        corr: 0,
        exp: 'Hỏi "Cái này trong tiếng Anh là gì?" ➔ Trả lời bằng từ tiếng Anh: 「『Book』です。」',
        audio: 'ブックです',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại ngôn ngữ'
      }
    ];
    const t = templates[i % templates.length];
    return {
      id: `l7_q_de_${i + 1}`,
      lesson: 7,
      unitId: 'l7_particle_de_tool',
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
  // 2. Trợ từ に chỉ đối tượng tiếp nhận hành động (l7_particle_ni_receiver) — 40 CÂU HỎI
  // =========================================================================
  ...Array.from({ length: 40 }).map((_, i): PracticeQuestion => {
    const templates = [
      {
        q_k: 'Với các động từ trao tặng, cho mượn, dạy dỗ (あげます, かします, おしえます), trợ từ nào đứng sau người tiếp nhận hành động (Tặng CHO ai)?',
        q_j: 'Trợ từ đứng sau người tiếp nhận hành động (Cho / Tặng ai) là gì?',
        opt: ['に (ni)', 'で (de)', 'を (o)', 'と (to)'],
        corr: 0,
        exp: 'Trợ từ 「に」 đứng sau người nhận hành động: 「友達に プレゼントを あげます。」 (Tặng quà cho bạn bè).',
        audio: 'ともだちに プレゼントを あげます',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc cho tặng に'
      },
      {
        q_k: 'Với các động từ nhận, mượn, học (もらいます, かります, ならいます), trợ từ nào đứng sau người mà ta nhận được hành động từ họ (Nhận TỪ ai)?',
        q_j: 'Trợ từ đứng sau người mình nhận/mượn từ họ là gì?',
        opt: ['に (hoặc から)', 'で', 'を', 'へ'],
        corr: 0,
        exp: 'Với もらいます, かります, ならいます: Người cho mình đi với trợ từ 「に」 hoặc 「から」: 「先生に 本を もらいました。」 (Nhận sách từ thầy giáo).',
        audio: 'せんせいに ほんを もらいました',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc nhận もらいます'
      },
      {
        q_k: 'Điền trợ từ: 「山田さんは 木村さん【 ? 】花を あげました。」 (Anh Yamada đã tặng hoa cho chị Kimura).',
        q_j: 'Điền trợ từ: 「山田さんは 木村さん【 ? 】花を あげました。」',
        opt: ['に', 'で', 'を', 'から'],
        corr: 0,
        exp: 'Chị Kimura là người nhận hoa ➔ đi với trợ từ 「に」.',
        audio: 'きむらさんに はなを あげました',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ tặng'
      },
      {
        q_k: 'Điền trợ từ: 「わたしは 田中さん【 ? 】CDを 借りました。」 (Tôi đã mượn đĩa CD từ anh Tanaka).',
        q_j: 'Điền trợ từ: 「わたしは 田中さん【 ? 】CDを 借りました。」',
        opt: ['に (hoặc から)', 'で', 'を', 'と'],
        corr: 0,
        exp: 'Mượn từ anh Tanaka: 「田中さんに (田中さんから) CDを 借りました。」',
        audio: 'たなかさんに シーディーを かりました',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ mượn'
      },
      {
        q_k: 'Khi nhận được quà hoặc tiền từ một CÔNG TY / CƠ QUAN / NGÂN HÀNG (không phải cá nhân con người), ta bắt buộc dùng trợ từ nào thay cho 「に」?',
        q_j: 'Nhận từ cơ quan/ngân hàng bắt buộc dùng trợ từ gì?',
        opt: ['から (kara)', 'に (ni)', 'で (de)', 'へ (e)'],
        corr: 0,
        exp: 'Quy tắc đặc biệt: Khi đối tác cho là một tổ chức, công ty hoặc ngân hàng thì BẮT BUỘC dùng 「から」, không dùng に: 「銀行から お金を 借りました。」 (Vay tiền từ ngân hàng).',
        audio: 'ぎんこうから おかねを かりました',
        fmt: 'special',
        fmtLbl: 'Tổ chức đi với から'
      },
      {
        q_k: 'Điền trợ từ: 「母【 ? 】電話を かけます。」 (Gọi điện thoại cho mẹ).',
        q_j: 'Điền trợ từ: 「母【 ? 】電話を かけます。」',
        opt: ['に', 'で', 'を', 'へ'],
        corr: 0,
        exp: 'Gọi điện cho ai đi với trợ từ 「に」: 「ははに でんわを かけます」.',
        audio: 'ははに でんわを かけます',
        fmt: 'fill_particle',
        fmtLbl: 'Gọi điện cho ai'
      },
      {
        q_k: 'Hội thoại: 「だれ【 ? 】英語を 習いましたか。」 — 「ワット先生に 習いました。」',
        q_j: 'Hội thoại: 「だれ【 ? 】英語を 習いましたか。」 — 「ワット先生に 習いました。」',
        opt: ['に (hoặc から)', 'で', 'を', 'と'],
        corr: 0,
        exp: 'Học tiếng Anh từ ai: 「だれに 習いましたか。」',
        audio: 'だれに えいごを ならいましたか',
        fmt: 'dialogue',
        fmtLbl: 'Hỏi học từ ai'
      },
      {
        q_k: 'Điền trợ từ: 「ワンさんは 友達【 ? 】プレゼントを もらいました。」',
        q_j: 'Điền trợ từ: 「ワンさんは 友達【 ? 】プレゼントを もらいました。」',
        opt: ['に (hoặc から)', 'で', 'を', 'へ'],
        corr: 0,
        exp: 'Nhận quà từ bạn bè: 「ともだちに もらいました」.',
        audio: 'ともだちに プレゼントを もらいました',
        fmt: 'fill_particle',
        fmtLbl: 'Nhận quà'
      },
      {
        q_k: 'Chọn câu viết ĐÚNG ngữ pháp:',
        q_j: 'Chọn câu viết ĐÚNG ngữ pháp:',
        opt: ['銀行から お金を 借りました。', '銀行に お金を 借りました。(Ít chuẩn khi là tổ chức)', '銀行で お金を 借りました。(Chỉ nơi diễn ra)', '銀行へ お金を 借りました。'],
        corr: 0,
        exp: 'Tổ chức/ngân hàng cho vay ➔ dùng 「銀行から 借りました」.',
        audio: 'ぎんこうから おかねを かりました',
        fmt: 'special',
        fmtLbl: 'Vay ngân hàng'
      },
      {
        q_k: 'Dịch câu sau: "Tôi đã cho bạn bè mượn sách."',
        q_j: 'Dịch câu sau: "Tôi đã cho bạn bè mượn sách."',
        opt: ['友達に 本を 貸しました。', '友達に 本を 借りました。', '友達から 本を 貸しました。', '友達で 本を 貸しました。'],
        corr: 0,
        exp: 'Cho mượn = 貸しました (かしました), cho ai mượn = 友達に ➔ 「友達に 本を 貸しました。」',
        audio: 'ともだちに ほんを かしました',
        fmt: 'translation',
        fmtLbl: 'Dịch câu đúng'
      }
    ];
    const t = templates[i % templates.length];
    return {
      id: `l7_q_ni_${i + 1}`,
      lesson: 7,
      unitId: 'l7_particle_ni_receiver',
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
