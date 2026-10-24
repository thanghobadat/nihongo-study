import { PracticeQuestion } from '../types';

export const LESSON_03_QUESTIONS: PracticeQuestion[] = [
  // =========================================================================
  // 1. Ko-so-a-do địa điểm thông thường: ここ, そこ, あそこ, どこ (l3_kosoado_koko) — 40 CÂU HỎI
  // =========================================================================
  ...Array.from({ length: 40 }).map((_, i): PracticeQuestion => {
    const templates = [
      {
        q_k: 'Khi muốn chỉ địa điểm ở GẦN NGƯỜI NÓI ("Ở đây", "Chỗ này"), ta dùng từ nào?',
        q_j: 'Khi chỉ địa điểm ở GẦN NGƯỜI NÓI ("Ở đây"), ta dùng từ nào?',
        opt: ['ここ (koko)', 'そこ (soko)', 'あそこ (asoko)', 'どこ (doko)'],
        corr: 0,
        exp: '「ここ (koko)」 dùng để chỉ vị trí, địa điểm ở gần người nói: 「ここは 教室です。」 (Đây là phòng học).',
        audio: 'ここは きょうしつです',
        fmt: 'grammar_rule',
        fmtLbl: 'Chỉ địa điểm gần'
      },
      {
        q_k: 'Khi muốn chỉ địa điểm ở GẦN NGƯỜI NGHE ("Ở đó", "Chỗ đó"), ta dùng từ nào?',
        q_j: 'Khi chỉ địa điểm ở GẦN NGƯỜI NGHE ("Ở đó"), ta dùng từ nào?',
        opt: ['そこ (soko)', 'ここ (koko)', 'あそこ (asoko)', 'どこ (doko)'],
        corr: 0,
        exp: '「そこ (soko)」 dùng để chỉ vị trí gần người nghe: 「そこは 事務所です。」 (Đó là văn phòng).',
        audio: 'そこは じむしょです',
        fmt: 'grammar_rule',
        fmtLbl: 'Chỉ địa điểm người nghe'
      },
      {
        q_k: 'Khi muốn chỉ địa điểm ở XA CẢ HAI NGƯỜI ("Ở đằng kia"), ta dùng từ nào?',
        q_j: 'Khi chỉ địa điểm ở XA CẢ HAI NGƯỜI ("Ở đằng kia"), ta dùng từ nào?',
        opt: ['あそこ (asoko)', 'ここ (koko)', 'そこ (soko)', 'どこ (doko)'],
        corr: 0,
        exp: '「あそこ (asoko)」 dùng để chỉ vị trí xa cả hai người: 「あそこは 食堂です。」 (Đằng kia là nhà ăn).',
        audio: 'あそこは しょくどうです',
        fmt: 'grammar_rule',
        fmtLbl: 'Chỉ địa điểm đằng xa'
      },
      {
        q_k: 'Từ để hỏi nghi vấn địa điểm thông thường "Ở đâu?", "Chỗ nào?" trong tiếng Nhật là gì?',
        q_j: 'Từ để hỏi địa điểm "Ở đâu?" trong tiếng Nhật là gì?',
        opt: ['どこ (doko)', 'どれ (dore)', 'だれ (dare)', 'どう (dou)'],
        corr: 0,
        exp: '「どこ (doko)」 là từ để hỏi vị trí/địa điểm: 「お手洗いは どこですか。」 (Nhà vệ sinh ở đâu vậy?).',
        audio: 'おてあらいは どこですか',
        fmt: 'grammar_form',
        fmtLbl: 'Từ nghi vấn địa điểm'
      },
      {
        q_k: 'Hội thoại: A: 「電話は どこですか。」 — B chỉ tay về phía xa xa: 「【 ? 】です。」',
        q_j: 'Hội thoại: A: 「電話は どこですか。」 — B chỉ tay về phía xa: 「【 ? 】です。」',
        opt: ['あそこ', 'ここ', 'そこ', 'どれ'],
        corr: 0,
        exp: 'Vị trí ở đằng xa cả hai người ➔ dùng 「あそこ」.',
        audio: 'あそこです',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại ngữ cảnh'
      },
      {
        q_k: 'Hội thoại: Khách đến quầy lễ tân: 「すみません、会議室は 【 ? 】ですか。」 — 「2階です。」',
        q_j: 'Hội thoại: 「すみません、会議室は 【 ? 】ですか。」 — 「2階です。」',
        opt: ['どこ', 'だれ', 'どれ', 'なん'],
        corr: 0,
        exp: 'Hỏi phòng họp ở đâu dùng từ nghi vấn địa điểm 「どこ」.',
        audio: 'かいぎしつは どこですか',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại hỏi địa điểm'
      },
      {
        q_k: 'Điền từ: 「ここは 【 ? 】の 部屋です。」 (Đây là phòng của giám đốc).',
        q_j: 'Điền từ: 「ここは 【 ? 】の 部屋です。」',
        opt: ['社長 (しゃちょう)', 'だれ', 'どこ', 'なん'],
        corr: 0,
        exp: '「ここは 社長の 部屋です」 (Đây là phòng của Giám đốc).',
        audio: 'ここは しゃちょうの へやです',
        fmt: 'fill_word',
        fmtLbl: 'Điền từ thích hợp'
      },
      {
        q_k: 'Cặp từ tương ứng: これ tương ứng với đại từ địa điểm nào?',
        q_j: 'これ tương ứng với đại từ địa điểm nào?',
        opt: ['ここ (koko)', 'そこ (soko)', 'あそこ (asoko)', 'どこ (doko)'],
        corr: 0,
        exp: 'Hệ thống Ko-so-a-do: これ (đồ vật gần) tương ứng với ここ (địa điểm gần).',
        audio: 'ここ',
        fmt: 'special',
        fmtLbl: 'Đối chiếu hệ thống'
      },
      {
        q_k: 'Hội thoại: A đang đứng cùng B tại phòng lễ tân, A nói: 「【 ? 】は ロビーです。」',
        q_j: 'Hội thoại: Đang đứng tại sảnh lễ tân: 「【 ? 】は ロビーです。」',
        opt: ['ここ', 'そこ', 'あそこ', 'どこ'],
        corr: 0,
        exp: 'Khi cả hai người cùng ở trong một không gian địa điểm, nơi hai người đang đứng được gọi là 「ここ」.',
        audio: 'ここは ロビーです',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại ngữ cảnh'
      },
      {
        q_k: 'Chọn câu dịch ĐÚNG cho: "Nhà vệ sinh ở đằng kia."',
        q_j: 'Chọn câu dịch ĐÚNG cho: "Nhà vệ sinh ở đằng kia."',
        opt: ['トイレは あそこです。', 'トイレは ここです。', 'トイレは そこです。', 'トイレは どこです。'],
        corr: 0,
        exp: '"Ở đằng kia" = あそこ ➔ 「トイレは あそこです。」',
        audio: 'トイレは あそこです',
        fmt: 'translation',
        fmtLbl: 'Dịch câu đúng'
      }
    ];
    const t = templates[i % templates.length];
    return {
      id: `l3_q_koko_${i + 1}`,
      lesson: 3,
      unitId: 'l3_kosoado_koko',
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
  // 2. Ko-so-a-do phương hướng & lịch sự: こちら, そちら, あちら, どちら (l3_kosoado_kochira) — 40 CÂU HỎI
  // =========================================================================
  ...Array.from({ length: 40 }).map((_, i): PracticeQuestion => {
    const templates = [
      {
        q_k: 'Từ chỉ phương hướng hoặc cách nói LỊCH SỰ của 「ここ (ở đây)」 là gì?',
        q_j: 'Từ chỉ phương hướng / cách nói LỊCH SỰ của 「ここ」 là gì?',
        opt: ['こちら (kochira)', 'そちら (sochira)', 'あちら (achira)', 'どちら (dochira)'],
        corr: 0,
        exp: '「こちら」 là từ chỉ hướng này ("phía này") đồng thời là thể lịch sự (kính ngữ) của 「ここ」.',
        audio: 'こちら',
        fmt: 'grammar_rule',
        fmtLbl: 'Lịch sự / Phương hướng'
      },
      {
        q_k: 'Từ chỉ phương hướng hoặc cách nói LỊCH SỰ của 「そこ (ở đó)」 là gì?',
        q_j: 'Từ chỉ phương hướng / cách nói LỊCH SỰ của 「そこ」 là gì?',
        opt: ['そちら (sochira)', 'こちら (kochira)', 'あちら (achira)', 'どちら (dochira)'],
        corr: 0,
        exp: '「そちら」 là từ chỉ "phía đó" và là thể lịch sự của 「そこ」.',
        audio: 'そちら',
        fmt: 'grammar_rule',
        fmtLbl: 'Lịch sự / Phương hướng'
      },
      {
        q_k: 'Từ chỉ phương hướng hoặc cách nói LỊCH SỰ của 「あそこ (ở đằng kia)」 là gì?',
        q_j: 'Từ chỉ phương hướng / cách nói LỊCH SỰ của 「あそこ」 là gì?',
        opt: ['あちら (achira)', 'こちら (kochira)', 'そちら (sochira)', 'どちら (dochira)'],
        corr: 0,
        exp: '「あちら」 là từ chỉ "phía đằng kia" và là thể lịch sự của 「あそこ」.',
        audio: 'あちら',
        fmt: 'grammar_rule',
        fmtLbl: 'Lịch sự / Phương hướng'
      },
      {
        q_k: 'Từ để hỏi lịch sự cho "Ở đâu?", hoặc dùng để hỏi "Quý quốc của bạn là nước nào?" là gì?',
        q_j: 'Từ để hỏi lịch sự cho "Ở đâu?" / "Nước của bạn là nước nào?" là gì?',
        opt: ['どちら (dochira)', 'どこ (doko)', 'だれ (dare)', 'どれ (dore)'],
        corr: 0,
        exp: '「どちら (dochira)」 là dạng lịch sự của 「どこ」. Thường dùng trong câu lịch sự: 「お国は どちらですか。」 (Quý quốc của bạn là nước nào?).',
        audio: 'おくには どちらですか',
        fmt: 'grammar_form',
        fmtLbl: 'Từ nghi vấn lịch sự'
      },
      {
        q_k: 'Hội thoại khách hàng vào khách sạn: 「エレベーターは 【 ? 】ですか。」 — Nhân viên cúi đầu: 「あちらで ございます。」',
        q_j: 'Hội thoại: 「エレベーターは 【 ? 】ですか。」 — 「あちらで ございます。」',
        opt: ['どちら', 'どれ', 'だれ', 'なん'],
        corr: 0,
        exp: 'Nhân viên trả lời dùng kính ngữ 「あちらでございます」 nên câu hỏi lịch sự tương ứng dùng 「どちら」.',
        audio: 'エレベーターは どちらですか',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại kính ngữ'
      },
      {
        q_k: 'Khi giới thiệu người khác trong giao tiếp lịch sự: 「【 ? 】は ミラーさんです。」 (Đây là anh Miller).',
        q_j: 'Khi giới thiệu người khác: 「【 ? 】は ミラーさんです。」',
        opt: ['こちら', 'これ', 'ここ', 'この'],
        corr: 0,
        exp: 'Khi giới thiệu người khác, người Nhật không dùng 「これは」 (bất lịch sự coi người như đồ vật) mà bắt buộc dùng 「こちらは ミラーさんです」.',
        audio: 'こちらは ミラーさんです',
        fmt: 'special',
        fmtLbl: 'Văn hóa giới thiệu người'
      },
      {
        q_k: 'Hỏi công ty của ai đó một cách trang trọng: 「会社は 【 ? 】ですか。」 — 「IMCです。」',
        q_j: 'Hỏi công ty một cách trang trọng: 「会社は 【 ? 】ですか。」 — 「IMCです。」',
        opt: ['どちら', 'どこ', 'だれ', 'どれ'],
        corr: 0,
        exp: 'Hỏi tên công ty hoặc trường học một cách trang trọng dùng 「どちら」 (không dùng だれ hay なん).',
        audio: 'かいしゃは どちらですか',
        fmt: 'dialogue',
        fmtLbl: 'Hỏi tên công ty'
      },
      {
        q_k: 'Hội thoại nghe điện thoại: 「はい、IMCの ミラーです。【 ? 】は サクラ大学ですか。」',
        q_j: 'Hội thoại nghe điện thoại: 「はい、IMCの ミラーです。【 ? 】は サクラ大学ですか。」',
        opt: ['そちら', 'こちら', 'あちら', 'どちら'],
        corr: 0,
        exp: 'Trong đàm thoại điện thoại, "bên phía bạn / bên quý cơ quan" được gọi là 「そちら」.',
        audio: 'そちらは さくらだいがくですか',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại điện thoại'
      },
      {
        q_k: 'Trong đàm thoại điện thoại, "bên phía chúng tôi" tự xưng là gì?',
        q_j: 'Trong điện thoại, "bên phía chúng tôi" tự xưng là gì?',
        opt: ['こちら (kochira)', 'そちら (sochira)', 'あちら (achira)', 'どちら (dochira)'],
        corr: 0,
        exp: 'Phía người đang nói trên điện thoại tự xưng là 「こちら」.',
        audio: 'こちら',
        fmt: 'grammar_rule',
        fmtLbl: 'Hội thoại điện thoại'
      },
      {
        q_k: 'Chọn câu hỏi lịch sự ĐÚNG để hỏi quê quán / đất nước của người đối diện:',
        q_j: 'Chọn câu hỏi lịch sự ĐÚNG để hỏi đất nước của người đối diện:',
        opt: ['お国は どちらですか。', '国は どれですか。', '国は だれですか。', 'お国は なんですか。'],
        corr: 0,
        exp: 'Mẫu câu lịch sự chuẩn mực: 「お国は どちらですか。」 (Đất nước của bạn ở đâu / là nước nào?).',
        audio: 'おくには どちらですか',
        fmt: 'special',
        fmtLbl: 'Mẫu câu chuẩn'
      }
    ];
    const t = templates[i % templates.length];
    return {
      id: `l3_q_kochira_${i + 1}`,
      lesson: 3,
      unitId: 'l3_kosoado_kochira',
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
  // 3. Số đếm lớn: Hàng trăm, Hàng nghìn, Hàng vạn (l3_num_100_100m) — 20 CÂU HỎI
  // =========================================================================
  {
    id: 'l3_q_num_100',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'num_to_reading',
    formatLabel: 'Nhìn số chọn đọc',
    question_kana: 'Số 「 100 」 trong tiếng Nhật đọc là gì?',
    question_kanji: 'Số 「 100 」 trong tiếng Nhật đọc là gì?',
    options: ['ひゃく (hyaku)', 'いちひゃく (ichihyaku)', 'せん (sen)', 'まん (man)'],
    correctIndex: 0,
    explanation: '100 đọc là 「ひゃく (hyaku)」, tuyệt đối không có chữ いち phía trước.',
    audioText: 'ひゃく'
  },
  {
    id: 'l3_q_num_300',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'special',
    formatLabel: 'Biến âm âm đục',
    question_kana: 'Số 「 300 」 trong tiếng Nhật có biến âm âm đục là gì?',
    question_kanji: 'Số 「 300 」 trong tiếng Nhật có biến âm âm đục là gì?',
    options: ['さんびゃく (sanbyaku)', 'さんひゃく (sanhyaku)', 'さんぴゃく (sanpyaku)', 'さんぜん (sanzen)'],
    correctIndex: 0,
    explanation: '300 biến âm đục thành 「さんびゃく (sanbyaku)」.',
    audioText: 'さんびゃく'
  },
  {
    id: 'l3_q_num_600',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'special',
    formatLabel: 'Biến âm âm ngắt & bán đục',
    question_kana: 'Số 「 600 」 trong tiếng Nhật có biến âm là gì?',
    question_kanji: 'Số 「 600 」 trong tiếng Nhật có biến âm là gì?',
    options: ['ろっぴゃく (roppyaku)', 'ろくひゃく (rokuhyaku)', 'ろくびゃく (rokubyaku)', 'ろっひゃく (rohhyaku)'],
    correctIndex: 0,
    explanation: '600 biến âm thành âm ngắt và âm bán đục: 「ろっぴゃく (roppyaku)」.',
    audioText: 'ろっぴゃく'
  },
  {
    id: 'l3_q_num_800',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'special',
    formatLabel: 'Biến âm âm ngắt & bán đục',
    question_kana: 'Số 「 800 」 trong tiếng Nhật có biến âm là gì?',
    question_kanji: 'Số 「 800 」 trong tiếng Nhật có biến âm là gì?',
    options: ['はっぴゃく (happyaku)', 'はちひゃく (hachihyaku)', 'はちびゃく (hachibyaku)', 'はっひゃく (hahhyaku)'],
    correctIndex: 0,
    explanation: '800 biến âm thành 「はっぴゃく (happyaku)」.',
    audioText: 'はっぴゃく'
  },
  {
    id: 'l3_q_num_1000',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'num_to_reading',
    formatLabel: 'Nhìn số chọn đọc',
    question_kana: 'Số 「 1.000 」 (Một nghìn) trong tiếng Nhật đọc là gì?',
    question_kanji: 'Số 「 1,000 」 trong tiếng Nhật đọc là gì?',
    options: ['せん (sen)', 'いちせん (ichisen)', 'ひゃく (hyaku)', 'まん (man)'],
    correctIndex: 0,
    explanation: '1.000 đọc là 「せん (sen)」, không đọc là ichisen.',
    audioText: 'せん'
  },
  {
    id: 'l3_q_num_3000',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'special',
    formatLabel: 'Biến âm âm đục',
    question_kana: 'Số 「 3.000 」 (Ba nghìn) trong tiếng Nhật có biến âm là gì?',
    question_kanji: 'Số 「 3,000 」 trong tiếng Nhật có biến âm là gì?',
    options: ['さんぜん (sanzen)', 'さんせん (sansen)', 'さんびゃく (sanbyaku)', 'さんぜんぜん (sanzenzen)'],
    correctIndex: 0,
    explanation: '3.000 biến âm đục thành 「さんぜん (sanzen)」.',
    audioText: 'さんぜん'
  },
  {
    id: 'l3_q_num_8000',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'special',
    formatLabel: 'Biến âm âm ngắt',
    question_kana: 'Số 「 8.000 」 (Tám nghìn) trong tiếng Nhật có biến âm là gì?',
    question_kanji: 'Số 「 8,000 」 trong tiếng Nhật có biến âm là gì?',
    options: ['はっせん (hassen)', 'はちせん (hachisen)', 'はちぜん (hachizen)', 'はっぜん (hazzen)'],
    correctIndex: 0,
    explanation: '8.000 biến âm thành âm ngắt: 「はっせん (hassen)」.',
    audioText: 'はっせん'
  },
  {
    id: 'l3_q_num_10000',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'special',
    formatLabel: 'Hàng Vạn (Man)',
    question_kana: 'Số 「 10.000 」 (Mười nghìn / 1 Vạn) trong tiếng Nhật đọc là gì?',
    question_kanji: 'Số 「 10,000 」 (1 Vạn) trong tiếng Nhật đọc là gì?',
    options: ['いちまん (ichiman)', 'まん (man)', 'じゅうせん (juusen)', 'じゅうまん (juuman)'],
    correctIndex: 0,
    explanation: 'Khác với 100 (hyaku) và 1.000 (sen), hàng Vạn bắt buộc phải có chữ いち: 「いちまん (ichiman)」.',
    audioText: 'いちまん'
  },
  {
    id: 'l3_q_num_100k',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'special',
    formatLabel: 'Quy tắc ngắt 4 số 0',
    question_kana: 'Số 「 100.000 」 (Một trăm nghìn / 10 Vạn) trong tiếng Nhật đọc là gì?',
    question_kanji: 'Số 「 100,000 」 trong tiếng Nhật đọc là gì?',
    options: ['じゅうまん (juuman)', 'ひゃくせん (hyakusen)', 'いちひゃくせん (ichihyakusen)', 'ひゃくまん (hyakuman)'],
    correctIndex: 0,
    explanation: 'Tiếng Nhật ngắt đơn vị 4 chữ số 0 (Vạn = 10^4). 100.000 = 10 Vạn ➔ 「じゅうまん (juuman)」.',
    audioText: 'じゅうまん'
  },
  {
    id: 'l3_q_num_1m',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'special',
    formatLabel: 'Hàng Triệu (100 Vạn)',
    question_kana: 'Số 「 1.000.000 」 (Một triệu / 100 Vạn) trong tiếng Nhật đọc là gì?',
    question_kanji: 'Số 「 1,000,000 」 trong tiếng Nhật đọc là gì?',
    options: ['ひゃくまん (hyakuman)', 'いっせんまん (issenman)', 'いちまんまん (ichimanman)', 'じゅうまん (juuman)'],
    correctIndex: 0,
    explanation: '1.000.000 = 100 Vạn ➔ 「ひゃくまん (hyakuman)」.',
    audioText: 'ひゃくまん'
  },
  {
    id: 'l3_q_num_10m',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'special',
    formatLabel: 'Hàng Chục Triệu (1.000 Vạn)',
    question_kana: 'Số 「 10.000.000 」 (Mười triệu / 1.000 Vạn) trong tiếng Nhật đọc là gì?',
    question_kanji: 'Số 「 10,000,000 」 trong tiếng Nhật đọc là gì?',
    options: ['いっせんまん (issenman)', 'せんまん (senman)', 'ひゃくまん (hyakuman)', 'いちおく (ichioku)'],
    correctIndex: 0,
    explanation: '10.000.000 = 1.000 Vạn biến âm thành 「いっせんまん (issenman)」.',
    audioText: 'いっせんまん'
  },
  {
    id: 'l3_q_num_100m',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'special',
    formatLabel: 'Hàng Trăm Triệu (1 Ức)',
    question_kana: 'Số 「 100.000.000 」 (Một trăm triệu / 1 Ức - 10^8) trong tiếng Nhật đọc là gì?',
    question_kanji: 'Số 「 100,000,000 」 (1 Ức) trong tiếng Nhật đọc là gì?',
    options: ['いちおく (ichioku)', 'おく (oku)', 'じゅっせんまん (jussenman)', 'ひゃくまん (hyakuman)'],
    correctIndex: 0,
    explanation: '100.000.000 tương ứng 1 Ức (億) ➔ 「いちおく (ichioku)」.',
    audioText: 'いちおく'
  },
  {
    id: 'l3_q_num_380',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'num_to_reading',
    formatLabel: 'Số kết hợp',
    question_kana: 'Số 「 380 」 trong tiếng Nhật đọc là gì?',
    question_kanji: 'Số 「 380 」 trong tiếng Nhật đọc là gì?',
    options: ['さんびゃくはちじゅう (sanbyakuhachijuu)', 'さんひゃくはちじゅう (sanhyakuhachijuu)', 'さんぴゃくはちじゅう (sanpyakuhachijuu)', 'さんびゃくはち (sanbyakuhachi)'],
    correctIndex: 0,
    explanation: '300 biến âm (さんびゃく) + 80 (はちじゅう) ➔ 「さんびゃくはちじゅう」.',
    audioText: 'さんびゃくはちじゅう'
  },
  {
    id: 'l3_q_num_650',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'num_to_reading',
    formatLabel: 'Số kết hợp',
    question_kana: 'Số 「 650 」 trong tiếng Nhật đọc là gì?',
    question_kanji: 'Số 「 650 」 trong tiếng Nhật đọc là gì?',
    options: ['ろっぴゃくごじゅう (roppyakugojuu)', 'ろくひゃくごじゅう (rokuhyakugojuu)', 'ろくびゃくごじゅう (rokubyakugojuu)', 'ろっひゃくごじゅう (rohhyakugojuu)'],
    correctIndex: 0,
    explanation: '600 biến âm (ろっぴゃく) + 50 (ごじゅう) ➔ 「ろっぴゃくごじゅう」.',
    audioText: 'ろっぴゃくごじゅう'
  },
  {
    id: 'l3_q_num_840',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'num_to_reading',
    formatLabel: 'Số kết hợp',
    question_kana: 'Số 「 840 」 trong tiếng Nhật đọc là gì?',
    question_kanji: 'Số 「 840 」 trong tiếng Nhật đọc là gì?',
    options: ['はっぴゃくよんじゅう (happyakuyonjuu)', 'はちひゃくよんじゅう (hachihyakuyonjuu)', 'はっぴゃくしじゅう (happyakushijuu)', 'はちびゃくしじゅう (hachibyakushijuu)'],
    correctIndex: 0,
    explanation: '800 biến âm (はっぴゃく) + 40 (よんじゅう) ➔ 「はっぴゃくよんじゅう」.',
    audioText: 'はっぴゃくよんじゅう'
  },
  {
    id: 'l3_q_num_3500',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'num_to_reading',
    formatLabel: 'Số kết hợp',
    question_kana: 'Số 「 3.500 」 trong tiếng Nhật đọc là gì?',
    question_kanji: 'Số 「 3,500 」 trong tiếng Nhật đọc là gì?',
    options: ['さんぜんごひゃく (sanzengohyaku)', 'さんせんごひゃく (sansengohyaku)', 'さんぜんごびゃく (sanzengobyaku)', 'さんせんごびゃく (sansengobyaku)'],
    correctIndex: 0,
    explanation: '3.000 biến âm (さんぜん) + 500 (ごひゃく) ➔ 「さんぜんごひゃく」.',
    audioText: 'さんぜんごひゃく'
  },
  {
    id: 'l3_q_num_8800',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'num_to_reading',
    formatLabel: 'Số kết hợp',
    question_kana: 'Số 「 8.800 」 trong tiếng Nhật đọc là gì?',
    question_kanji: 'Số 「 8,800 」 trong tiếng Nhật đọc là gì?',
    options: ['はっせんはっぴゃく (hassenhappyaku)', 'はちせんはちひゃく (hachisenhachihyaku)', 'はっせんはちひゃく (hassenhachihyaku)', 'はちせんはっぴゃく (hachisenhappyaku)'],
    correctIndex: 0,
    explanation: '8.000 biến âm (はっせん) + 800 biến âm (はっぴゃく) ➔ 「はっせんはっぴゃく」.',
    audioText: 'はっせんはっぴゃく'
  },
  {
    id: 'l3_q_num_yen_price',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'dialogue',
    formatLabel: 'Hỏi giá tiền (Ikura)',
    question_kana: 'Hội thoại: 「すみません、この ネクタイは 【 ? 】ですか。」 — 「1,500円です。」',
    question_kanji: 'Hội thoại: 「すみません、この ネクタイは 【 ? 】ですか。」 — 「1,500円です。」',
    options: ['いくら (ikura)', 'いくつ (ikutsu)', 'どれ (dore)', 'どちら (dochira)'],
    correctIndex: 0,
    explanation: 'Từ để hỏi giá tiền trong tiếng Nhật là 「いくら (ikura)」: 「いくらですか。」 (Bao nhiêu tiền?).',
    audioText: 'いくらですか'
  },
  {
    id: 'l3_q_num_price_1500',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'dialogue',
    formatLabel: 'Đọc giá tiền',
    question_kana: 'Giá tiền 「 1,500円 」 được đọc bằng tiếng Nhật là gì?',
    question_kanji: 'Giá tiền 「 1,500 円 」 được đọc là gì?',
    options: ['せんごひゃくえん (sengohyaku-en)', 'いちせんごひゃくえん (ichisengohyaku-en)', 'せんごびゃくえん (sengobyaku-en)', 'ひゃくごじゅうえん (hyakugojuu-en)'],
    correctIndex: 0,
    explanation: '1.500円 = 1.000 (せん) + 500 (ごひゃく) + 円 (えん) ➔ 「せんごひゃくえん」.',
    audioText: 'せんごひゃくえん'
  },
  {
    id: 'l3_q_num_price_28000',
    lesson: 3,
    unitId: 'l3_num_100_100m',
    format: 'dialogue',
    formatLabel: 'Đọc giá tiền',
    question_kana: 'Giá tiền 「 28,000円 」 được đọc bằng tiếng Nhật là gì?',
    question_kanji: 'Giá tiền 「 28,000 円 」 được đọc là gì?',
    options: ['にまんはっせんえん (niman-hassen-en)', 'にじゅうはちせんえん (nijuuhachisen-en)', 'にまんはちせんえん (niman-hachisen-en)', 'にじゅうまんはっせんえん (nijuuman-hassen-en)'],
    correctIndex: 0,
    explanation: '28.000 = 2 Vạn (にまん) + 8.000 biến âm (はっせん) ➔ 「にまんはっせんえん」.',
    audioText: 'にまんはっせんえん'
  },

  // =========================================================================
  // 4. Đơn vị đếm tầng lầu: 〜階 (l3_counter_floor) — 20 CÂU HỎI
  // =========================================================================
  {
    id: 'l3_q_fl_01',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'special',
    formatLabel: 'Biến âm âm ngắt',
    question_kana: '「 Tầng 1 」 trong tiếng Nhật có biến âm âm ngắt là gì?',
    question_kanji: '「 1 階 」 trong tiếng Nhật đọc là gì?',
    options: ['いっかい (ikkai)', 'いちかい (ichikai)', 'ひとがい (hitogai)', 'いちがい (ichigai)'],
    correctIndex: 0,
    explanation: 'Tầng 1 biến âm âm ngắt: 「いっかい (ikkai)」.',
    audioText: 'いっかい'
  },
  {
    id: 'l3_q_fl_02',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'num_to_reading',
    formatLabel: 'Nhìn số chọn đọc',
    question_kana: '「 Tầng 2 」 trong tiếng Nhật đọc là gì?',
    question_kanji: '「 2 階 」 trong tiếng Nhật đọc là gì?',
    options: ['にかい (nikai)', 'にっかい (nikkai)', 'ふたかい (futakai)', 'にがい (nigai)'],
    correctIndex: 0,
    explanation: 'Tầng 2 đọc bình thường: 「にかい (nikai)」.',
    audioText: 'にかい'
  },
  {
    id: 'l3_q_fl_03',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'special',
    formatLabel: 'Biến âm âm đục',
    question_kana: '「 Tầng 3 」 trong tiếng Nhật BẮT BUỘC biến âm đục thành gì?',
    question_kanji: '「 3 階 」 trong tiếng Nhật đọc là gì?',
    options: ['さんがい (sangai)', 'さんかい (sankai)', 'みっかい (mikkai)', 'さんばい (sanbai)'],
    correctIndex: 0,
    explanation: 'Tầng 3 bắt buộc biến âm đục: 「さんがい (sangai)」.',
    audioText: 'さんがい'
  },
  {
    id: 'l3_q_fl_04',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'special',
    formatLabel: 'Số đặc biệt',
    question_kana: '「 Tầng 4 」 trong tiếng Nhật đọc là gì?',
    question_kanji: '「 4 階 」 trong tiếng Nhật đọc là gì?',
    options: ['よんかい (yonkai)', 'しかい (shikai)', 'よっかい (yokkai)', 'よんがい (yongai)'],
    correctIndex: 0,
    explanation: 'Tầng 4 đọc là 「よんかい (yonkai)」.',
    audioText: 'よんかい'
  },
  {
    id: 'l3_q_fl_05',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'num_to_reading',
    formatLabel: 'Nhìn số chọn đọc',
    question_kana: '「 Tầng 5 」 trong tiếng Nhật đọc là gì?',
    question_kanji: '「 5 階 」 trong tiếng Nhật đọc là gì?',
    options: ['ごかい (gokai)', 'ごっかい (gokkai)', 'いつかい (itsukai)', 'ごがい (gogai)'],
    correctIndex: 0,
    explanation: 'Tầng 5 đọc là 「ごかい (gokai)」.',
    audioText: 'ごかい'
  },
  {
    id: 'l3_q_fl_06',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'special',
    formatLabel: 'Biến âm âm ngắt',
    question_kana: '「 Tầng 6 」 trong tiếng Nhật có biến âm âm ngắt là gì?',
    question_kanji: '「 6 階 」 trong tiếng Nhật đọc là gì?',
    options: ['ろっかい (rokkai)', 'ろくかい (rokukai)', 'ろくがい (rokugai)', 'ろっがい (roggai)'],
    correctIndex: 0,
    explanation: 'Tầng 6 biến âm thành 「ろっかい (rokkai)」.',
    audioText: 'ろっかい'
  },
  {
    id: 'l3_q_fl_07',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'special',
    formatLabel: 'Số đặc biệt',
    question_kana: '「 Tầng 7 」 trong tiếng Nhật đọc chuẩn là gì?',
    question_kanji: '「 7 階 」 trong tiếng Nhật đọc chuẩn là gì?',
    options: ['ななかい (nanakai)', 'しちかい (shichikai)', 'なながい (nanagai)', 'しちがい (shichigai)'],
    correctIndex: 0,
    explanation: 'Tầng 7 đọc là 「ななかい (nanakai)」.',
    audioText: 'ななかい'
  },
  {
    id: 'l3_q_fl_08',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'special',
    formatLabel: 'Biến âm âm ngắt',
    question_kana: '「 Tầng 8 」 trong tiếng Nhật có biến âm âm ngắt là gì?',
    question_kanji: '「 8 階 」 trong tiếng Nhật đọc là gì?',
    options: ['はっかい (hakkai)', 'はちかい (hachikai)', 'はちがい (hachigai)', 'はっがい (haggai)'],
    correctIndex: 0,
    explanation: 'Tầng 8 biến âm thành 「はっかい (hakkai)」.',
    audioText: 'はっかい'
  },
  {
    id: 'l3_q_fl_09',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'num_to_reading',
    formatLabel: 'Nhìn số chọn đọc',
    question_kana: '「 Tầng 9 」 trong tiếng Nhật đọc là gì?',
    question_kanji: '「 9 階 」 trong tiếng Nhật đọc là gì?',
    options: ['きゅうかい (kyuukai)', 'くかい (kukai)', 'きゅっかい (kyukkai)', 'きゅうがい (kyuugai)'],
    correctIndex: 0,
    explanation: 'Tầng 9 đọc là 「きゅうかい (kyuukai)」.',
    audioText: 'きゅうかい'
  },
  {
    id: 'l3_q_fl_10',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'special',
    formatLabel: 'Biến âm âm ngắt',
    question_kana: '「 Tầng 10 」 trong tiếng Nhật đọc là gì?',
    question_kanji: '「 10 階 」 trong tiếng Nhật đọc là gì?',
    options: ['じゅっかい / じっかい (jukkai/jikkai)', 'じゅうかい (juukai)', 'とおかい (tookai)', 'じゅうがい (juugai)'],
    correctIndex: 0,
    explanation: 'Tầng 10 biến âm thành 「じゅっかい (jukkai)」 hoặc 「じっかい (jikkai)」.',
    audioText: 'じゅっかい'
  },
  {
    id: 'l3_q_fl_ask',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'dialogue',
    formatLabel: 'Hỏi tầng mấy (Nangai)',
    question_kana: 'Từ để hỏi "Tầng mấy?" trong tiếng Nhật thường được phát âm biến âm đục là gì?',
    question_kanji: 'Từ để hỏi "Tầng mấy?" (何階) đọc là gì?',
    options: ['なんがい (nangai)', 'なんか (nanka)', 'なんかい (nankai - ít tự nhiên hơn)', 'いくつかい (ikutsukai)'],
    correctIndex: 0,
    explanation: 'Từ để hỏi tầng mấy thường biến âm đục thành 「なんがい (nangai)」 (hoặc nankai nhưng nangai phổ biến hơn nhiều trong đàm thoại).',
    audioText: 'なんがいですか'
  },
  {
    id: 'l3_q_fl_dialogue_wine',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'dialogue',
    formatLabel: 'Hội thoại mua sắm',
    question_kana: 'Hội thoại trong trung tâm thương mại: 「ワイン売り場は 【 ? 】ですか。」 — 「地下1階 (B1) です。」',
    question_kanji: 'Hội thoại: 「ワイン売り場は 【 ? 】ですか。」 — 「地下1階です。」',
    options: ['何階 (なんがい)', 'どれ', 'だれ', 'いくら'],
    correctIndex: 0,
    explanation: 'Câu trả lời là tầng hầm B1 (ちかいっかい) nên câu hỏi là 「なんがいですか」.',
    audioText: 'ワインうりばは なんがいですか'
  },
  {
    id: 'l3_q_fl_b1',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'special',
    formatLabel: 'Tầng hầm (Chika)',
    question_kana: '「 Tầng hầm 1 (B1) 」 trong tiếng Nhật được đọc là gì?',
    question_kanji: '「 地下1階 」 trong tiếng Nhật đọc là gì?',
    options: ['ちかいっかい (chika-ikkai)', 'ちかいちかい (chika-ichikai)', 'じかいっかい (jika-ikkai)', 'ちかいちがい (chika-ichigai)'],
    correctIndex: 0,
    explanation: 'Tầng hầm gọi là 地下 (chika). B1 đọc là 「ちかいっかい (chika-ikkai)」.',
    audioText: 'ちかいっかい'
  },
  {
    id: 'l3_q_fl_b2',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'special',
    formatLabel: 'Tầng hầm (Chika)',
    question_kana: '「 Tầng hầm 2 (B2) 」 trong tiếng Nhật được đọc là gì?',
    question_kanji: '「 地下2階 」 trong tiếng Nhật đọc là gì?',
    options: ['ちかにかい (chika-nikai)', 'ちかふたかい (chika-futakai)', 'じかにかい (jika-nikai)', 'ちかにっかい (chika-nikkai)'],
    correctIndex: 0,
    explanation: 'B2 đọc là 「ちかにかい (chika-nikai)」.',
    audioText: 'ちかにかい'
  },
  {
    id: 'l3_q_fl_11',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'num_to_reading',
    formatLabel: 'Tầng kết hợp',
    question_kana: '「 Tầng 11 」 trong tiếng Nhật đọc là gì?',
    question_kanji: '「 11 階 」 trong tiếng Nhật đọc là gì?',
    options: ['じゅういっかい (juuikkai)', 'じゅういちかい (juuichikai)', 'じゅっかい (jukkai)', 'じゅういっがい (juuiggai)'],
    correctIndex: 0,
    explanation: '11階 = 10 (じゅう) + 1階 biến âm (いっかい) ➔ 「じゅういっかい」.',
    audioText: 'じゅういっかい'
  },
  {
    id: 'l3_q_fl_13',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'special',
    formatLabel: 'Tầng kết hợp biến âm',
    question_kana: '「 Tầng 13 」 trong tiếng Nhật có biến âm đục là gì?',
    question_kanji: '「 13 階 」 trong tiếng Nhật đọc là gì?',
    options: ['じゅうさんがい (juusangai)', 'じゅうさんかい (juusankai)', 'じゅっさんがい (jussangai)', 'じゅうみっかい (juumikkai)'],
    correctIndex: 0,
    explanation: '13階 = 10 (じゅう) + 3階 biến âm đục (さんがい) ➔ 「じゅうさんがい」.',
    audioText: 'じゅうさんがい'
  },
  {
    id: 'l3_q_fl_16',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'num_to_reading',
    formatLabel: 'Tầng kết hợp',
    question_kana: '「 Tầng 16 」 trong tiếng Nhật đọc là gì?',
    question_kanji: '「 16 階 」 trong tiếng Nhật đọc là gì?',
    options: ['じゅうろっかい (juurokkai)', 'じゅうろくかい (juurokukai)', 'じゅっろっかい (jurrokkai)', 'じゅうろくがい (juurokugai)'],
    correctIndex: 0,
    explanation: '16階 = 10 (じゅう) + 6階 biến âm (ろっかい) ➔ 「じゅうろっかい」.',
    audioText: 'じゅうろっかい'
  },
  {
    id: 'l3_q_fl_18',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'num_to_reading',
    formatLabel: 'Tầng kết hợp',
    question_kana: '「 Tầng 18 」 trong tiếng Nhật đọc là gì?',
    question_kanji: '「 18 階 」 trong tiếng Nhật đọc là gì?',
    options: ['じゅうはっかい (juuhakkai)', 'じゅうはちかい (juuhachikai)', 'じゅうはちがい (juuhachigai)', 'じゅっはっかい (juhhakkai)'],
    correctIndex: 0,
    explanation: '18階 = 10 (じゅう) + 8階 biến âm (はっかい) ➔ 「じゅうはっかい」.',
    audioText: 'じゅうはっかい'
  },
  {
    id: 'l3_q_fl_dialogue_lift',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'dialogue',
    formatLabel: 'Hội thoại thang máy',
    question_kana: 'Trong thang máy: 「何階ですか。」 — 「【 ? 】をお願いします。」 (Làm ơn cho tôi lên tầng 8).',
    question_kanji: 'Trong thang máy: 「何階ですか。」 — 「【 ? 】をお願いします。」',
    options: ['8階 (はっかい)', '8階 (はちかい)', '8階 (はちがい)', '8つ'],
    correctIndex: 0,
    explanation: 'Tầng 8 đọc là 「はっかい」: 「8階をお願いします。」',
    audioText: 'はっかいを おねがいします'
  },
  {
    id: 'l3_q_fl_summary_rule',
    lesson: 3,
    unitId: 'l3_counter_floor',
    format: 'special',
    formatLabel: 'Tổng kết quy tắc biến âm',
    question_kana: 'Những tầng nào sau đây có biến âm ngắt (っかい) hoặc biến âm đục (がい)?',
    question_kanji: 'Những tầng nào sau đây có biến âm?',
    options: ['Tầng 1, 3, 6, 8, 10', 'Tầng 2, 4, 5, 7, 9', 'Chỉ có tầng 3 duy nhất', 'Tất cả các tầng đều không biến âm'],
    correctIndex: 0,
    explanation: 'Quy tắc vàng biến âm tầng lầu: 1 (いっかい), 3 (さんがい - âm đục), 6 (ろっかい), 8 (はっかい), 10 (じゅっかい).',
    audioText: 'いっかい さんがい ろっかい はっかい じゅっかい'
  }
];
