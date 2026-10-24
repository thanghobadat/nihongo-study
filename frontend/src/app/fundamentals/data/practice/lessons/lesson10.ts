import { PracticeQuestion } from '../types';

export const LESSON_10_QUESTIONS: PracticeQuestion[] = [
  // =========================================================================
  // 1. Trợ từ に chỉ nơi chốn tồn tại (あります / います) (l10_particle_ni_exist) — 40 CÂU HỎI
  // =========================================================================
  ...Array.from({ length: 40 }).map((_, i): PracticeQuestion => {
    const templates = [
      {
        q_k: 'Khi diễn tả sự TỒN TẠI của người hoặc vật ở một địa điểm ("Ở phòng học CÓ cái bàn", "Ở công viên CÓ con chó"), trợ từ nào đứng sau danh từ nơi chốn?',
        q_j: 'Trợ từ chỉ nơi chốn tồn tại (với あります / います) là gì?',
        opt: ['に (ni)', 'で (de)', 'を (o)', 'へ (e)'],
        corr: 0,
        exp: 'Trợ từ 「に」 đứng sau nơi chốn biểu thị địa điểm tồn tại của người hoặc vật (đi với động từ あります hoặc います): 「部屋に 机が あります。」',
        audio: 'へやに つくえが あります',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc tồn tại に'
      },
      {
        q_k: 'Động từ tồn tại 「あります」 và 「います」 khác nhau căn bản ở điểm nào?',
        q_j: '「あります」 và 「います」 khác nhau ở điểm nào?',
        opt: ['あります dùng cho đồ vật/thực vật vô tri; います dùng cho người và động vật có chuyển động', 'あります dùng cho người; います dùng cho vật', 'Hai từ dùng thay thế lẫn nhau bình thường', 'います chỉ dùng cho người trong gia đình'],
        corr: 0,
        exp: 'Quy tắc: あります dùng cho vật vô tri, thực vật, sự kiện. います dùng cho con người và động vật chuyển động được.',
        audio: 'あります います',
        fmt: 'grammar_rule',
        fmtLbl: 'Phân biệt あります vs います'
      },
      {
        q_k: 'Điền động từ: 「庭に 犬が 【 ? 】。」 (Trong sân có con chó).',
        q_j: 'Điền động từ: 「庭に 犬が 【 ? 】。」',
        opt: ['います (imasu)', 'あります (arimasu)', 'します (shimasu)', '行きます (ikimasu)'],
        corr: 0,
        exp: '犬 (con chó) là động vật có chuyển động sống ➔ dùng 「います」.',
        audio: 'にわに いぬが います',
        fmt: 'grammar_form',
        fmtLbl: 'Động từ cho động vật'
      },
      {
        q_k: 'Điền động từ: 「机の 上に 写真が 【 ? 】。」 (Trên bàn có bức ảnh).',
        q_j: 'Điền động từ: 「机の 上に 写真が 【 ? 】。」',
        opt: ['あります (arimasu)', 'います (imasu)', 'します (shimasu)', '見ます (mimasu)'],
        corr: 0,
        exp: '写真 (bức ảnh) là vật vô tri ➔ dùng 「あります」.',
        audio: 'つくえの うえに しゃしんが あります',
        fmt: 'grammar_form',
        fmtLbl: 'Động từ cho đồ vật'
      },
      {
        q_k: 'Điền trợ từ: 「教室【 ? 】佐藤さんが います。」 (Anh Sato đang ở trong lớp học).',
        q_j: 'Điền trợ từ: 「教室【 ? 】佐藤さんが います。」',
        opt: ['に', 'で', 'を', 'へ'],
        corr: 0,
        exp: 'Địa điểm tồn tại đi với います dùng trợ từ 「に」: 「教室に 佐藤さんが います。」',
        audio: 'きょうしつに さとうさんが います',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ nơi tồn tại'
      },
      {
        q_k: 'Hội thoại: 「あそこに だれが 【 ? 】。」 — 「ミラーさんが います。」',
        q_j: 'Hội thoại: 「あそこに だれが 【 ? 】。」 — 「ミラーさんが います。」',
        opt: ['いますか (imasu ka)', 'ありますか (arimasu ka)', 'しますか (shimasu ka)', '行きますか (ikimasu ka)'],
        corr: 0,
        exp: 'Hỏi về con người (だれ) ở đằng kia ➔ dùng 「いますか」: 「あそこに だれが いますか。」',
        audio: 'あそこに だれが いますか',
        fmt: 'dialogue',
        fmtLbl: 'Hỏi người ở đâu'
      },
      {
        q_k: 'Hội thoại: 「箱の 中に 何が 【 ? 】。」 — 「時計が あります。」',
        q_j: 'Hội thoại: 「箱の 中に 何が 【 ? 】。」 — 「時計が あります。」',
        opt: ['ありますか (arimasu ka)', 'いますか (imasu ka)', 'ですか (desu ka)', 'しますか (shimasu ka)'],
        corr: 0,
        exp: 'Hỏi trong hộp có đồ vật gì (何) ➔ dùng 「ありますか」.',
        audio: 'はこの なかに なにが ありますか',
        fmt: 'dialogue',
        fmtLbl: 'Hỏi vật ở đâu'
      },
      {
        q_k: 'Các từ chỉ vị trí tương đối: 「上 (trên)」, 「下 (dưới)」, 「前 (trước)」, 「後ろ (sau)」, 「中 (trong)」, 「隣 (bên cạnh)」 kết nối với danh từ bằng trợ từ nào?',
        q_j: 'Từ chỉ vị trí (上, 下, 前...) kết nối với danh từ bằng trợ từ gì?',
        opt: ['の (Ví dụ: 机の 上, ドアの 前)', 'に', 'で', 'は'],
        corr: 0,
        exp: 'Công thức vị trí: [Danh từ] の [Vị trí]: 「机の 上 (trên bàn)」, 「箱の 中 (trong hộp)」, 「銀行の 隣 (bên cạnh ngân hàng)」.',
        audio: 'つくえの うえ',
        fmt: 'grammar_rule',
        fmtLbl: 'Cấu trúc vị trí'
      },
      {
        q_k: 'Điền trợ từ: 「銀行は ポストの 隣【 ? 】あります。」 (Ngân hàng nằm ở bên cạnh hòm thư).',
        q_j: 'Điền trợ từ: 「銀行は ポストの 隣【 ? 】あります。」',
        opt: ['に', 'で', 'を', 'へ'],
        corr: 0,
        exp: 'Vị trí tồn tại của ngân hàng ➔ dùng trợ từ 「に」.',
        audio: 'ぎんこうは ポストの となりに あります',
        fmt: 'fill_particle',
        fmtLbl: 'Vị trí tồn tại'
      },
      {
        q_k: 'Chọn câu viết ĐÚNG ngữ pháp tiếng Nhật:',
        q_j: 'Chọn câu viết ĐÚNG ngữ pháp:',
        opt: ['公園に 子供が います。', '公園に 子供が あります。(Sai vì dùng arimasu cho người)', '公園で 子供が います。(Sai vì dùng de cho imasu)', '公園を 子供が います。(Sai)'],
        corr: 0,
        exp: 'Trẻ em là người sống ở công viên ➔ 「公園に 子供が います。」',
        audio: 'こうえんに こどもが います',
        fmt: 'special',
        fmtLbl: 'Chọn câu đúng'
      }
    ];
    const t = templates[i % templates.length];
    return {
      id: `l10_q_exist_${i + 1}`,
      lesson: 10,
      unitId: 'l10_particle_ni_exist',
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
  // 2. Phân biệt cặp trợ từ に (Tồn tại) vs で (Hành động) (l10_pair_ni_vs_de) — 40 CÂU HỎI
  // =========================================================================
  ...Array.from({ length: 40 }).map((_, i): PracticeQuestion => {
    const templates = [
      {
        q_k: 'Điền cặp trợ từ thích hợp: 「部屋【 ? 】テレビが あります。」 vs 「部屋【 ? 】テレビを 見ます。」',
        q_j: 'Điền cặp trợ từ: 「部屋【 ? 】テレビが あります」 vs 「部屋【 ? 】テレビを 見ます」',
        opt: ['に / で', 'で / に', 'に / に', 'で / で'],
        corr: 0,
        exp: 'Tồn tại (có TV) dùng trợ từ 「に」: 部屋に テレビが あります. Nơi diễn ra hành động xem TV dùng trợ từ 「で」: 部屋で テレビを 見ます.',
        audio: 'へやに テレビが あります へやで テレビを みます',
        fmt: 'pair_contrast',
        fmtLbl: 'Đối chiếu に vs で'
      },
      {
        q_k: 'Điền cặp trợ từ: 「図書館【 ? 】本が あります。」 vs 「図書館【 ? 】本を 読みます。」',
        q_j: 'Điền: 「図書館【 ? 】本が あります」 vs 「図書館【 ? 】本を 読みます」',
        opt: ['に / で', 'で / に', 'に / に', 'で / で'],
        corr: 0,
        exp: 'Ở thư viện có sách (tồn tại): 図書館に. Đọc sách tại thư viện (hành động): 図書館で.',
        audio: 'としょかんに ほんが あります としょかんで ほんを よみます',
        fmt: 'pair_contrast',
        fmtLbl: 'Đối chiếu に vs で'
      },
      {
        q_k: 'Điền cặp trợ từ: 「公園【 ? 】子供が います。」 vs 「公園【 ? 】サッカーを します。」',
        q_j: 'Điền: 「公園【 ? 】子供が います」 vs 「公園【 ? 】サッカーを します」',
        opt: ['に / で', 'で / に', 'に / に', 'で / で'],
        corr: 0,
        exp: 'Có trẻ em ở công viên (tồn tại): 公園に. Chơi bóng đá ở công viên (hành động): 公園で.',
        audio: 'こうえんに こどもが います こうえんで サッカーを します',
        fmt: 'pair_contrast',
        fmtLbl: 'Đối chiếu に vs で'
      },
      {
        q_k: 'Điền cặp trợ từ: 「デパート【 ? 】スーパーが あります。」 vs 「デパート【 ? 】買い物を します。」',
        q_j: 'Điền: 「デパート【 ? 】スーパーが あります」 vs 「デパート【 ? 】買い物を します」',
        opt: ['に / で', 'で / に', 'に / に', 'で / で'],
        corr: 0,
        exp: 'Có siêu thị trong trung tâm thương mại: に. Mua sắm tại trung tâm: で.',
        audio: 'デパートに スーパーが あります デパートで かいものを します',
        fmt: 'pair_contrast',
        fmtLbl: 'Đối chiếu に vs で'
      },
      {
        q_k: 'Quy tắc phân biệt cốt lõi giữa 「Nơi chốn + に」 và 「Nơi chốn + で」 là gì?',
        q_j: 'Khác biệt cốt lõi giữa 「場所 + に」 và 「場所 + で」 là gì?',
        opt: ['に đi với あります/います (chỉ sự tồn tại); で đi với động từ hành động (nơi làm việc/hoạt động)', 'に chỉ nơi ngoài trời; で chỉ nơi trong nhà', 'Hai trợ từ hoàn toàn giống nhau', 'で chỉ dùng với người'],
        corr: 0,
        exp: 'Cốt lõi: [Địa điểm + に] + あります/います (Ở đâu có cái gì). [Địa điểm + で] + [Hành động] (Làm gì ở đâu).',
        audio: 'ばしょに ばしょで',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc cốt lõi'
      },
      {
        q_k: 'Điền trợ từ: 「食堂【 ? 】ラーメンが あります。」 (Ở nhà ăn có món mì ramen).',
        q_j: 'Điền trợ từ: 「食堂【 ? 】ラーメンが あります。」',
        opt: ['に', 'で', 'を', 'へ'],
        corr: 0,
        exp: 'Tồn tại món ăn đi với あります ➔ dùng 「に」.',
        audio: 'しょくどうに ラーメンが あります',
        fmt: 'fill_particle',
        fmtLbl: 'Tồn tại に'
      },
      {
        q_k: 'Điền trợ từ: 「食堂【 ? 】ラーメンを 食べます。」 (Ăn mì ramen ở nhà ăn).',
        q_j: 'Điền trợ từ: 「食堂【 ? 】ラーメンを食べます。」',
        opt: ['で', 'に', 'を', 'へ'],
        corr: 0,
        exp: 'Hành động ăn mì ➔ dùng 「で」.',
        audio: 'しょくどうで ラーメンを たべます',
        fmt: 'fill_particle',
        fmtLbl: 'Hành động で'
      },
      {
        q_k: 'Chọn câu viết ĐÚNG ngữ pháp:',
        q_j: 'Chọn câu viết ĐÚNG ngữ pháp:',
        opt: ['教室に 机が あります。', '教室で 机が あります。(Sai)', '教室を 机が あります。(Sai)', '教室へ 机が あります。(Sai)'],
        corr: 0,
        exp: 'Tồn tại cái bàn ở trong lớp học ➔ 「教室に 机が あります。」',
        audio: 'きょうしつに つくえが あります',
        fmt: 'special',
        fmtLbl: 'Chọn câu đúng'
      },
      {
        q_k: 'Chọn câu viết ĐÚNG ngữ pháp:',
        q_j: 'Chọn câu viết ĐÚNG ngữ pháp:',
        opt: ['教室で 日本語を 勉強します。', '教室に 日本語を 勉強します。(Sai)', '教室へ 日本語を 勉強します。(Sai)', '教室を 日本語を 勉強します。(Sai)'],
        corr: 0,
        exp: 'Hành động học tiếng Nhật trong lớp ➔ 「教室で 日本語を 勉強します。」',
        audio: 'きょうしつで にほんごを べんきょうします',
        fmt: 'special',
        fmtLbl: 'Chọn câu đúng'
      },
      {
        q_k: 'Hội thoại: 「ミラーさんは どこ【 ? 】いますか。」 — 「事務所【 ? 】仕事を しています。」',
        q_j: 'Hội thoại: 「ミラーさんは どこ【 ? 】いますか。」 — 「事務所【 ? 】仕事をしています。」',
        opt: ['に / で', 'で / に', 'に / に', 'で / で'],
        corr: 0,
        exp: 'Ở đâu (tồn tại います) ➔ どこに. Làm việc ở văn phòng (hành động 仕事をします) ➔ 事務所で.',
        audio: 'どこに いますか じむしょで しごとを しています',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại đối chiếu に vs で'
      }
    ];
    const t = templates[i % templates.length];
    return {
      id: `l10_q_pair_${i + 1}`,
      lesson: 10,
      unitId: 'l10_pair_ni_vs_de',
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
  // 3. Trợ từ や liệt kê không hoàn chỉnh (N1 や N2 [など]) (l10_particle_ya) — 40 CÂU HỎI
  // =========================================================================
  ...Array.from({ length: 40 }).map((_, i): PracticeQuestion => {
    const templates = [
      {
        q_k: 'Khi muốn LIỆT KÊ TIÊU BIỂU vài đồ vật (không liệt kê toàn bộ, mang nghĩa "như là... và... vân vân"), ta dùng trợ từ nào giữa các danh từ?',
        q_j: 'Trợ từ liệt kê tiêu biểu, không đầy đủ là gì?',
        opt: ['や (ya)', 'と (to)', 'も (mo)', 'の (no)'],
        corr: 0,
        exp: 'Trợ từ 「や」 dùng để liệt kê không hoàn chỉnh (tiêu biểu 2-3 vật đại diện): 「箱の 中に 手紙や 写真が あります。」 (Trong hộp có những thứ như thư từ, ảnh chụp...).',
        audio: 'てがみや しゃしん',
        fmt: 'grammar_rule',
        fmtLbl: 'Quy tắc liệt kê や'
      },
      {
        q_k: 'Từ 「など (nado)」 thường đặt ở đâu khi đi cùng với trợ từ 「や」 và mang nghĩa là gì?',
        q_j: 'Từ 「など」 đặt ở đâu và nghĩa là gì?',
        opt: ['Đặt sau danh từ cuối cùng, mang nghĩa "Vân vân..."', 'Đặt trước danh từ đầu tiên', 'Đặt giữa hai danh từ', 'Thay thế cho động từ'],
        corr: 0,
        exp: '「N1 や N2 など」 = N1, N2 vân vân: 「机の 上に 本や ペンなどが あります。」 (Trên bàn có những thứ như sách, bút, vân vân).',
        audio: 'ほんや ペンなど',
        fmt: 'grammar_rule',
        fmtLbl: 'Hậu tố など'
      },
      {
        q_k: 'Sự khác biệt căn bản giữa trợ từ 「と」 và trợ từ 「や」 khi liệt kê là gì?',
        q_j: 'Khác biệt giữa 「と」 và 「や」 là gì?',
        opt: ['と dùng để liệt kê TOÀN BỘ (chỉ có từng đó thứ); や dùng để liệt kê TIÊU BIỂU (còn có những thứ khác nữa)', 'と chỉ dùng cho người; や chỉ dùng cho vật', 'や chỉ dùng trong câu phủ định', 'Hai trợ từ hoàn toàn giống nhau'],
        corr: 0,
        exp: 'Khác biệt: [A と B] nghĩa là CHỈ CÓ A và B (liệt kê hết). Còn [A や B] nghĩa là CÓ A, B VÀ CÒN NHỮNG THỨ KHÁC NỮA (liệt kê tượng trưng).',
        audio: 'ほんと ペン ほんや ペン',
        fmt: 'special',
        fmtLbl: 'Phân biệt と vs や'
      },
      {
        q_k: 'Điền trợ từ: 「箱の 中に 手紙【 ? 】写真などが あります。」',
        q_j: 'Điền trợ từ: 「箱の 中に 手紙【 ? 】写真などが あります。」',
        opt: ['や', 'と', 'も', 'で'],
        corr: 0,
        exp: 'Có など ở vế sau biểu thị liệt kê tượng trưng ➔ dùng trợ từ 「や」: 「手紙や 写真など」.',
        audio: 'てがみや しゃしんなど',
        fmt: 'fill_particle',
        fmtLbl: 'Điền trợ từ や'
      },
      {
        q_k: 'Điền trợ từ: 「かばんの 中に 鍵【 ? 】財布が あります。」 (Trong cặp có chìa khóa, ví tiền... tiêu biểu).',
        q_j: 'Điền trợ từ: 「かばんの 中に 鍵【 ? 】財布が あります。」',
        opt: ['や (hoặc と)', 'で', 'に', 'へ'],
        corr: 0,
        exp: 'Liệt kê các đồ vật trong cặp ➔ dùng 「や」.',
        audio: 'かぎや さいふが あります',
        fmt: 'fill_particle',
        fmtLbl: 'Liệt kê đồ vật'
      },
      {
        q_k: 'Hội thoại: 「部屋に 何が ありますか。」 — 「ベッド【 ? 】机などが あります。」',
        q_j: 'Hội thoại: 「部屋に 何が ありますか。」 — 「ベッド【 ? 】机などが あります。」',
        opt: ['や', 'と', 'で', 'に'],
        corr: 0,
        exp: 'Liệt kê tượng trưng đồ đạc trong phòng có など ➔ dùng 「や」.',
        audio: 'ベッドや つくえなどが あります',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại đồ đạc'
      },
      {
        q_k: 'Có bắt buộc phải có chữ 「など」 ở phía sau trợ từ 「や」 không?',
        q_j: 'Có bắt buộc phải có 「など」 sau 「や」 không?',
        opt: ['KHÔNG BẮT BUỘC (Có thể dùng A や B mà không cần など)', 'Bắt buộc luôn luôn phải có など', 'Chỉ dùng など khi liệt kê trên 5 thứ', 'Chỉ dùng など trong văn viết'],
        corr: 0,
        exp: 'Không bắt buộc. Ta có thể nói 「A や B が あります」 hoặc nói đầy đủ 「A や B などが あります」 đều chuẩn ngữ pháp.',
        audio: 'ほんや ペンが あります',
        fmt: 'grammar_rule',
        fmtLbl: 'Tính tùy chọn của など'
      },
      {
        q_k: 'Chọn câu viết ĐÚNG khi nói "Trong tủ lạnh có thịt, trứng vân vân":',
        q_j: 'Chọn câu viết ĐÚNG:',
        opt: ['冷蔵庫の 中に 肉や 卵などが あります。', '冷蔵庫の 中に 肉と 卵などが あります。(Sai vì dùng と với など)', '冷蔵庫の 中に 肉も 卵などが あります。(Sai)', '冷蔵庫の 中に 肉で 卵などが あります。(Sai)'],
        corr: 0,
        exp: 'Mẫu câu chuẩn: 「肉や 卵などが あります。」',
        audio: 'にくや たまごなどが あります',
        fmt: 'special',
        fmtLbl: 'Chọn câu đúng'
      },
      {
        q_k: 'Dịch câu sau: "Ở cửa hàng này có bánh mì, sữa vân vân."',
        q_j: 'Dịch câu sau: "Ở cửa hàng này có bánh mì, sữa vân vân."',
        opt: ['この 店に パンや 牛乳などが あります。', 'この 店で パンと 牛乳などが あります。', 'この 店に パンも 牛乳などが あります。', 'この 店へ パンや 牛乳などが あります。'],
        corr: 0,
        exp: 'Bánh mì, sữa vân vân = 「パンや 牛乳など」.',
        audio: 'このみせに パンや ぎゅうにゅうなどが あります',
        fmt: 'translation',
        fmtLbl: 'Dịch câu đúng'
      },
      {
        q_k: 'Hội thoại: 「公園に だれが いますか。」 — 「子供【 ? 】犬などが います。」',
        q_j: 'Hội thoại: 「公園に だれが いますか。」 — 「子供【 ? 】犬などが います。」',
        opt: ['や', 'と', 'で', 'に'],
        corr: 0,
        exp: 'Liệt kê đối tượng sống ở công viên có など ➔ dùng 「や」.',
        audio: 'こどもや いぬなどが います',
        fmt: 'dialogue',
        fmtLbl: 'Hội thoại đối tượng sống'
      }
    ];
    const t = templates[i % templates.length];
    return {
      id: `l10_q_ya_${i + 1}`,
      lesson: 10,
      unitId: 'l10_particle_ya',
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
