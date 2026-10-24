import { PracticeQuestion } from '../types';

export const LESSON_02_QUESTIONS: PracticeQuestion[] = [
  // =========================================================================
  // 1. Ko-so-a-do đồ vật đứng độc lập: これ, それ, あれ, どれ (l2_kosoado_kore) — 40 CÂU HỎI
  // =========================================================================
  ...Array.from({ length: 40 }).map((_, i): PracticeQuestion => {
    const templates = [
      {
        q_k: 'Khi người nói chỉ vào đồ vật ở GẦN MÌNH (ngay cạnh người nói), người Nhật dùng đại từ chỉ thị nào?',
        q_j: 'Khi chỉ vào đồ vật ở GẦN MÌNH, người Nhật dùng đại từ nào?',
        opt: ['これ (kore)', 'それ (sore)', 'あれ (are)', 'どれ (dore)'],
        corr: 0,
        exp: '「これ」 dùng để chỉ vật ở gần người nói: 「これは 本です。」 (Đây là quyển sách).',
        audio: 'これは ほんです',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc Ko-so-a-do'
      },
      {
        q_k: 'Khi người nói chỉ vào đồ vật ở GẦN NGƯỜI NGHE (đối phương đang cầm hoặc đứng cạnh), người Nhật dùng đại từ nào?',
        q_j: 'Khi chỉ vào đồ vật ở GẦN NGƯỜI NGHE, người Nhật dùng đại từ nào?',
        opt: ['それ (sore)', 'これ (kore)', 'あれ (are)', 'どれ (dore)'],
        corr: 0,
        exp: '「それ」 dùng để chỉ vật ở gần người nghe: 「それは なんですか。」 (Đó/Cái đó là cái gì vậy?).',
        audio: 'それは なんですか',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc Ko-so-a-do'
      },
      {
        q_k: 'Khi chỉ vào đồ vật ở XA CẢ HAI NGƯỜI (người nói và người nghe), người Nhật dùng đại từ nào?',
        q_j: 'Khi chỉ vào đồ vật ở XA CẢ HAI NGƯỜI, người Nhật dùng đại từ nào?',
        opt: ['あれ (are)', 'これ (kore)', 'それ (sore)', 'どれ (dore)'],
        corr: 0,
        exp: '「あれ」 dùng để chỉ vật ở xa cả người nói lẫn người nghe: 「あれは 時計です。」 (Kia là cái đồng hồ).',
        audio: 'あれは とけいです',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc Ko-so-a-do'
      },
      {
        q_k: 'Từ để hỏi nghi vấn "Cái nào?" trong nhóm đại từ chỉ thị đứng độc lập là gì?',
        q_j: 'Từ để hỏi nghi vấn "Cái nào?" trong nhóm đứng độc lập là gì?',
        opt: ['どれ (dore)', 'どの (dono)', 'どこ (doko)', 'どちら (dochira)'],
        corr: 0,
        exp: '「どれ (dore)」 là từ nghi vấn "cái nào" khi đứng độc lập làm chủ ngữ (thường đi với が: 「どれが 傘ですか」).',
        audio: 'どれですか',
        fmt: 'grammar_form',
        fmtLbl: 'Từ nghi vấn'
      },
      {
        q_k: 'Hội thoại: A cầm chiếc bút hỏi: 「【 ? 】は 先生の ボールペンですか。」 — B trả lời: 「はい、そうです。」',
        q_j: 'Hội thoại: A cầm chiếc bút hỏi: 「【 ? 】は 先生の ボールペンですか。」 — B: 「はい、そうです。」',
        opt: ['これ', 'それ', 'あれ', 'どれ'],
        corr: 0,
        exp: 'A đang cầm chiếc bút trên tay (gần A) nên A phải dùng 「これ」.',
        audio: 'これは せんせいの ボールペンですか',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại ngữ cảnh'
      },
      {
        q_k: 'Hội thoại: A thấy B đang cầm chiếc ô màu đen, A hỏi: 「【 ? 】は あなたの 傘ですか。」',
        q_j: 'Hội thoại: A hỏi B về chiếc ô B đang cầm: 「【 ? 】は あなたの 傘ですか。」',
        opt: ['それ', 'これ', 'あれ', 'どれ'],
        corr: 0,
        exp: 'Chiếc ô ở phía B (gần người nghe), nên A phải dùng 「それ」.',
        audio: 'それは あなたの かさですか',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại ngữ cảnh'
      },
      {
        q_k: 'Hội thoại: A và B cùng nhìn lên ngọn núi ở rất xa, A hỏi: 「【 ? 】は 富士山ですか。」',
        q_j: 'Hội thoại: Cùng nhìn ngọn núi ở xa: 「【 ? 】は 富士山ですか。」',
        opt: ['あれ', 'これ', 'それ', 'どれ'],
        corr: 0,
        exp: 'Vật ở xa cả hai người ➔ dùng 「あれ」.',
        audio: 'あれは ふじさんですか',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại ngữ cảnh'
      },
      {
        q_k: 'Điền đại từ: 「これ【 ? 】日本語の 辞書です。」',
        q_j: 'Điền trợ từ: 「これ【 ? 】日本語の 辞書です。」',
        opt: ['は', 'の', 'も', 'が'],
        corr: 0,
        exp: 'これ đứng độc lập làm chủ đề câu đi liền với trợ từ 「は」.',
        audio: 'これは にほんごの じしょです',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ'
      },
      {
        q_k: 'Hội thoại: A hỏi 「これは なんの ざっしですか。」 — B trả lời thế nào?',
        q_j: 'Hội thoại: A: 「これは なんの 雑誌ですか。」 — B trả lời thế nào?',
        opt: ['それは 自動車の 雑誌です。', 'これは 自動車の 雑誌です。', 'あれは 自動車の 雑誌です。', 'どれは 自動車の 雑誌です。'],
        corr: 0,
        exp: 'Khi A hỏi với 「これ」 (gần A), B trả lời (đối diện với vật) phải đổi thành 「それ」 (gần B là vật A vừa chỉ).',
        audio: 'それは じどうしゃの ざっしです',
        fmt: 'dialogue',
        fmtLbl: 'Quy tắc đáp lời'
      },
      {
        q_k: 'Đại từ 「これ / それ / あれ / どれ」 có được đi liền ngay trước một Danh từ không? (Ví dụ: これ ほん)',
        q_j: 'Đại từ 「これ / それ / あれ / どれ」 có được đi liền ngay trước một Danh từ không?',
        opt: ['Tuyệt đối không được (Phải dùng この / その / あの / どの)', 'Được đi bình thường', 'Chỉ dùng khi danh từ là người', 'Chỉ dùng trong văn thơ'],
        corr: 0,
        exp: 'Quy tắc: これ/それ/あれ/どれ là đại từ độc lập, KHÔNG ĐƯỢC đứng sát trước Danh từ. Đứng trước Danh từ bắt buộc phải dùng この/その/あの/どの.',
        audio: 'このほん',
        fmt: 'special',
        fmtLbl: 'Lỗi cấm kỵ'
      }
    ];
    const t = templates[i % templates.length];
    return {
      id: `l2_q_kore_${i + 1}`,
      lesson: 2,
      unitId: 'l2_kosoado_kore',
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
  // 2. Ko-so-a-do bổ nghĩa danh từ: この, その, あの, どの + N (l2_kosoado_kono) — 40 CÂU HỎI
  // =========================================================================
  ...Array.from({ length: 40 }).map((_, i): PracticeQuestion => {
    const templates = [
      {
        q_k: 'Khi muốn bổ nghĩa trực tiếp cho danh từ phía sau ("Cái ô NÀY", "Quyển sách NÀY"), ta dùng từ nào đứng trước Danh từ?',
        q_j: 'Khi muốn bổ nghĩa trực tiếp cho danh từ: "Quyển sách NÀY", ta dùng từ nào?',
        opt: ['この (kono)', 'これ (kore)', 'ここ (koko)', 'こちら (kochira)'],
        corr: 0,
        exp: '「この + Danh từ」 dùng để chỉ danh từ cụ thể ở gần người nói: 「この 傘 (cái ô này)」.',
        audio: 'このかさ',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc bổ nghĩa'
      },
      {
        q_k: 'Điền từ: 「【 ? 】本は わたしのです。」 (Quyển sách này là của tôi).',
        q_j: 'Điền từ: 「【 ? 】本は 私のです。」',
        opt: ['この', 'これ', 'ここ', 'こちら'],
        corr: 0,
        exp: 'Đứng ngay trước danh từ 本 (sách) bắt buộc phải dùng 「この」, không dùng これ.',
        audio: 'このほんは わたしのです',
        fmt: 'fill_word',
        fmtLbl: 'Điền từ thích hợp'
      },
      {
        q_k: 'Điền từ: 「【 ? 】傘は だれの ですか。」 (Cái ô kia - ở đằng xa là của ai vậy?).',
        q_j: 'Điền từ: 「【 ? 】傘は だれの ですか。」',
        opt: ['あの', 'あれ', 'あそこ', 'あちら'],
        corr: 0,
        exp: 'Đứng ngay trước danh từ 傘 (cái ô) ở xa cả hai người ➔ dùng 「あの」.',
        audio: 'あのかさは だれの ですか',
        fmt: 'fill_word',
        fmtLbl: 'Điền từ thích hợp'
      },
      {
        q_k: 'Khi muốn hỏi "Người NÀO là thầy Mira?", ta dùng từ nghi vấn nào trước Danh từ?',
        q_j: 'Khi muốn hỏi "Người NÀO là thầy Mira?", ta dùng từ nào trước Danh từ?',
        opt: ['どの (dono)', 'どれ (dore)', 'どこ (doko)', 'どちら (dochira)'],
        corr: 0,
        exp: '「どの + Danh từ」 là từ nghi vấn "Danh từ nào": 「どの 人 (người nào)」.',
        audio: 'どのひとですか',
        fmt: 'grammar_form',
        fmtLbl: 'Từ nghi vấn'
      },
      {
        q_k: 'Hội thoại: A: 「この かばんは あなたのですか。」 — B trả lời: 「いいえ、【 ? 】かばんは 田中さんのです。」',
        q_j: 'Hội thoại: A: 「この かばんは あなたのですか。」 — B: 「いいえ、【 ? 】かばんは 田中さんのです。」',
        opt: ['その', 'この', 'あの', 'どの'],
        corr: 0,
        exp: 'A chỉ vào cái cặp gần A dùng 「この」, B đối diện trả lời phải dùng 「その」 (cái cặp đó - gần A).',
        audio: 'そのかばんは たなかさんのです',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại ngữ cảnh'
      },
      {
        q_k: 'Chọn câu viết ĐÚNG ngữ pháp tiếng Nhật:',
        q_j: 'Chọn câu viết ĐÚNG ngữ pháp:',
        opt: ['この手帳は わたしのです。', 'これ手帳は わたしのです。', 'このは わたしの 手帳です。', 'これのは わたしの 手帳です。'],
        corr: 0,
        exp: 'Chỉ có 「この + 手帳 (danh từ)」 là đúng cấu trúc. Không dùng これ手帳.',
        audio: 'このてちょうは わたしのです',
        fmt: 'special',
        fmtLbl: 'Chọn câu đúng'
      },
      {
        q_k: 'Điền từ: 「ミラーさんの かばんは 【 ? 】ですか。」 — 「あの あおい かばんです。」',
        q_j: 'Điền từ: 「ミラーさんの かばんは 【 ? 】ですか。」 — 「あの 青い かばんです。」',
        opt: ['どれ', 'どの', 'これ', 'それ'],
        corr: 0,
        exp: 'Từ nghi vấn đứng độc lập làm vị ngữ: 「どれですか」 (Là cái nào vậy?). Không dùng どの vì phía sau không có danh từ.',
        audio: 'どれですか',
        fmt: 'special',
        fmtLbl: 'Phân biệt どれ vs どの'
      },
      {
        q_k: 'Điền từ: 「ミラーさんの かばんは 【 ? 】かばんですか。」',
        q_j: 'Điền từ: 「ミラーさんの かばんは 【 ? 】かばんですか。」',
        opt: ['どの', 'どれ', 'どこ', 'だれ'],
        corr: 0,
        exp: 'Đứng ngay trước danh từ かばん ➔ bắt buộc dùng 「どの」.',
        audio: 'どのかばんですか',
        fmt: 'special',
        fmtLbl: 'Phân biệt どれ vs どの'
      },
      {
        q_k: 'Hội thoại: 「その 辞書は だれの ですか。」 — 「【 ? 】辞書は 佐藤さんのです。」',
        q_j: 'Hội thoại: 「その 辞書は だれの ですか。」 — 「【 ? 】辞書は 佐藤さんのです。」',
        opt: ['この', 'その', 'あの', 'どの'],
        corr: 0,
        exp: 'Người hỏi dùng 「その」 (vật gần người nghe), người trả lời đang cầm cuốn từ điển đó nên đáp lại bằng 「この」.',
        audio: 'このじしょは さとうさんのです',
        fmt: 'dialogue',
        fmtLbl: 'Quy tắc đáp lời'
      },
      {
        q_k: 'Dịch câu sau: "Cái chìa khoá này là của tôi."',
        q_j: 'Dịch câu sau: "Cái chìa khoá này là của tôi."',
        opt: ['この かぎは わたしのです。', 'これ かぎは わたしのです。', 'このは かぎ わたしのです。', 'これの かぎは わたしのです。'],
        corr: 0,
        exp: '"Cái chìa khoá này" = この かぎ.',
        audio: 'このかぎは わたしのです',
        fmt: 'translation',
        fmtLbl: 'Dịch câu đúng'
      }
    ];
    const t = templates[i % templates.length];
    return {
      id: `l2_q_kono_${i + 1}`,
      lesson: 2,
      unitId: 'l2_kosoado_kono',
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
