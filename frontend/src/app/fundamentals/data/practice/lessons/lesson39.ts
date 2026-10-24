import { PracticeQuestion } from '../types';

export const LESSON_39_QUESTIONS: PracticeQuestion[] = [
  {
    "id": "l39_q_pair_01",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "meaning_kara",
    "formatLabel": "Khác biệt cốt lõi から vs ので",
    "question_kana": "[Câu 1] Khi giải thích nguyên nhân lý do, đâu là sự khác biệt cốt lõi giữa 「から (Kara)」 và 「ので (Node)」?",
    "question_kanji": "[Câu 1] Sự khác biệt cốt lõi giữa 「から」 và 「ので」 là gì?",
    "options": [
      "「から」 nhấn mạnh lý do chủ quan cá nhân (cho phép mệnh lệnh, rủ rê); 「ので」 nhấn mạnh lý do khách quan, lịch sự, nhẹ nhàng (không đi với mệnh lệnh trực tiếp)",
      "「から」 dùng cho người lớn; 「ので」 dùng cho bạn bè",
      "「ので」 mang tính cấm đoán mạnh hơn 「から」",
      "Hai từ hoàn toàn giống nhau 100%"
    ],
    "correctIndex": 0,
    "explanation": "「から」: Nguyên nhân mang tính chủ quan. Vế sau ĐƯỢC DÙNG câu mệnh lệnh, rủ rê, cấm đoán (〜てください, 〜ましょう...). 「ので」: Nguyên nhân mang tính khách quan, tự nhiên, nhã nhặn và lịch sự. Vế sau KHÔNG DÙNG câu mệnh lệnh trực tiếp.",
    "audioText": "あぶないですから さわらないでください"
  },
  {
    "id": "l39_q_pair_02",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "grammar_connection",
    "formatLabel": "Quy tắc kết nối 〜な ので",
    "question_kana": "[Câu 2] Quy tắc kết nối ngữ pháp: Trước 「ので」, tính từ đuôi な và Danh từ ở dạng khẳng định hiện tại BẮT BUỘC biến đổi như thế nào?",
    "question_kanji": "[Câu 2] Trước 「ので」, tính từ đuôi な và Danh từ kết nối như thế nào?",
    "options": [
      "Bắt buộc thêm 「な」 (Ví dụ: 暇なので, 雨なので)",
      "Thêm だ (Ví dụ: 暇だので - SAI)",
      "Bỏ đuôi hoàn toàn",
      "Thêm に (Ví dụ: 暇にので)"
    ],
    "correctIndex": 0,
    "explanation": "QUY TẮC BẪY THI CỬ: Trước 「ので」, Tính từ đuôi な và Danh từ BẮT BUỘC LÀ 「〜な ので」 (Ví dụ: ひまな ので, びょうきな ので). Tuyệt đối KHÔNG ĐƯỢC NÓI 「だので」.",
    "audioText": "ひまなので びょうきなので"
  },
  {
    "id": "l39_q_pair_03",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "meaning_kara",
    "formatLabel": "Đi với câu nhờ vả / cấm đoán",
    "question_kana": "[Câu 3] Điền từ nối: 「あぶない（ ? ）、きかいに さわらないで ください。」 (Vì nguy hiểm nên xin đừng chạm vào máy móc).",
    "question_kanji": "[Câu 3] 「危ない（ ? ）、機械に 触らないで ください。」",
    "options": [
      "から (Chủ quan + câu cấm đoán/nhờ vả)",
      "ので",
      "のに",
      "ても"
    ],
    "correctIndex": 0,
    "explanation": "Vế sau là câu cấm đoán nhờ vả 「〜ないで ください」 ➔ BẮT BUỘC DÙNG 「から」, không dùng ので.",
    "audioText": "あぶないですから さわらないでください"
  },
  {
    "id": "l39_q_pair_04",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "meaning_node",
    "formatLabel": "Xin phép trang trọng (ので)",
    "question_kana": "[Câu 4] Điền từ nối: 「きぶんが わるい（ ? ）、きょうは はやく かえっても いいですか。」 (Vì em thấy trong người không khỏe, hôm nay em có thể về sớm được không ạ?).",
    "question_kanji": "[Câu 4] 「気分が 悪い（ ? ）、今日は 早く 帰っても いいですか。」",
    "options": [
      "ので (Lịch sự, giải thích lý do xin phép)",
      "から",
      "のに",
      "でも"
    ],
    "correctIndex": 0,
    "explanation": "Khi xin phép cấp trên một cách trang trọng, nhã nhặn và khách quan ➔ Dùng 「ので」.",
    "audioText": "きぶんが わるいので"
  },
  {
    "id": "l39_q_pair_05",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "grammar_connection",
    "formatLabel": "Danh từ + なので",
    "question_kana": "[Câu 5] Điền dạng đúng: 「あしたは （ ? ）ので、かいものに 行きます。」 (Vì mai là ngày nghỉ nên tôi đi mua sắm). Điền やすみ (danh từ):",
    "question_kanji": "[Câu 5] 「明日は （ ? ）ので、買い物に 行きます。」 Điền 休み:",
    "options": [
      "休みな (やすみな)",
      "休みだ",
      "休み",
      "休みの"
    ],
    "correctIndex": 0,
    "explanation": "休み là danh từ, đứng trước ので phải thêm な ➔ 「休みな ので」.",
    "audioText": "やすみなので"
  },
  {
    "id": "l39_q_pair_06",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "grammar_connection",
    "formatLabel": "Tính từ な + なので",
    "question_kana": "[Câu 6] Điền dạng đúng: 「この へやは （ ? ）ので、べんきょうしやすいです。」 (Vì căn phòng này yên tĩnh nên rất dễ học). Điền しずか (tính từ đuôi な):",
    "question_kanji": "[Câu 6] 「この 部屋は （ ? ）ので、勉強しやすいです。」 Điền 静か:",
    "options": [
      "静かな (しずかな)",
      "静かだ",
      "静か",
      "静かに"
    ],
    "correctIndex": 0,
    "explanation": "静か là tính từ đuôi な, trước ので phải có な ➔ 「静かな ので」.",
    "audioText": "しずかなので"
  },
  {
    "id": "l39_q_pair_07",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "dialogue",
    "formatLabel": "Giải thích lý do đi muộn",
    "question_kana": "[Câu 7] Hội thoại: 「どうして ちこくしたんですか。」 — 「じこで でんしゃが （ ? ）ので、おくれました。」 (Vì tai nạn làm xe điện dừng lại nên tôi bị muộn).",
    "question_kanji": "[Câu 7] 「事故で 電車が （ ? ）ので、遅れました。」 Điền とまります:",
    "options": [
      "止まった (とまった)",
      "止まる (とまる)",
      "止まって",
      "止まります"
    ],
    "correctIndex": 0,
    "explanation": "Sự việc đã xảy ra trong quá khứ ➔ Chia thể ngắn quá khứ (thể Ta) trước ので: 「とまった ので」.",
    "audioText": "でんしゃが とまったので"
  },
  {
    "id": "l39_q_pair_08",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "grammar_connection",
    "formatLabel": "Bẫy だので",
    "question_kana": "[Câu 8] Câu nào sau đây SAI ngữ pháp nghiêm trọng?",
    "question_kanji": "[Câu 8] Câu nào sau đây SAI ngữ pháp nghiêm trọng?",
    "options": [
      "暇だので、遊びに行きましょう。 (SAI vì だので)",
      "暇なので、遊びに行きましょう。",
      "暇ですから、遊びに行きましょう。",
      "頭が 痛いので、病院へ行きます。"
    ],
    "correctIndex": 0,
    "explanation": "Tuyệt đối KHÔNG CÓ 「だので」. Tính từ đuôi な và danh từ phải là 「な ので」.",
    "audioText": "ひまなので"
  },
  {
    "id": "l39_q_pair_09",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "meaning_kara",
    "formatLabel": "Đi với câu rủ rê 〜ましょう",
    "question_kana": "[Câu 9] Hội thoại rủ rê: 「時間が ありません（ ? ）、急ぎましょう。」 (Vì không còn thời gian nữa, chúng ta hãy nhanh lên nào).",
    "question_kanji": "[Câu 9] 「時間が ありません（ ? ）、急ぎましょう。」",
    "options": [
      "から (Đi với câu rủ rê 〜ましょう)",
      "ので",
      "のに",
      "ても"
    ],
    "correctIndex": 0,
    "explanation": "Vế sau là câu rủ rê mang ý chí người nói 「〜ましょう」 ➔ Dùng 「から」.",
    "audioText": "じかんが ありませんから いそぎましょう"
  },
  {
    "id": "l39_q_pair_10",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "dialogue",
    "formatLabel": "Xin phép về trước công ty",
    "question_kana": "[Câu 10] Chọn câu viết ĐÚNG ngữ pháp và lịch sự nhất:",
    "question_kanji": "[Câu 10] Chọn câu viết ĐÚNG ngữ pháp và lịch sự nhất:",
    "options": [
      "用事が ありますので、お先に 失礼します。",
      "用事が あるだので、お先に 失礼します。",
      "用事ですから、お先に 失礼してください。",
      "用事なのに、お先に 失礼します。"
    ],
    "correctIndex": 0,
    "explanation": "Xin phép về trước một cách trang trọng: 「用事がありますので、お先に失礼します」.",
    "audioText": "ようじが ありますので おさきに しつれいします"
  },
  {
    "id": "l39_q_pair_11",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "meaning_kara",
    "formatLabel": "Khác biệt cốt lõi から vs ので",
    "question_kana": "[Câu 11] Khi giải thích nguyên nhân lý do, đâu là sự khác biệt cốt lõi giữa 「から (Kara)」 và 「ので (Node)」?",
    "question_kanji": "[Câu 11] Sự khác biệt cốt lõi giữa 「から」 và 「ので」 là gì?",
    "options": [
      "「から」 nhấn mạnh lý do chủ quan cá nhân (cho phép mệnh lệnh, rủ rê); 「ので」 nhấn mạnh lý do khách quan, lịch sự, nhẹ nhàng (không đi với mệnh lệnh trực tiếp)",
      "「から」 dùng cho người lớn; 「ので」 dùng cho bạn bè",
      "「ので」 mang tính cấm đoán mạnh hơn 「から」",
      "Hai từ hoàn toàn giống nhau 100%"
    ],
    "correctIndex": 0,
    "explanation": "「から」: Nguyên nhân mang tính chủ quan. Vế sau ĐƯỢC DÙNG câu mệnh lệnh, rủ rê, cấm đoán (〜てください, 〜ましょう...). 「ので」: Nguyên nhân mang tính khách quan, tự nhiên, nhã nhặn và lịch sự. Vế sau KHÔNG DÙNG câu mệnh lệnh trực tiếp.",
    "audioText": "あぶないですから さわらないでください"
  },
  {
    "id": "l39_q_pair_12",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "grammar_connection",
    "formatLabel": "Quy tắc kết nối 〜な ので",
    "question_kana": "[Câu 12] Quy tắc kết nối ngữ pháp: Trước 「ので」, tính từ đuôi な và Danh từ ở dạng khẳng định hiện tại BẮT BUỘC biến đổi như thế nào?",
    "question_kanji": "[Câu 12] Trước 「ので」, tính từ đuôi な và Danh từ kết nối như thế nào?",
    "options": [
      "Bắt buộc thêm 「な」 (Ví dụ: 暇なので, 雨なので)",
      "Thêm だ (Ví dụ: 暇だので - SAI)",
      "Bỏ đuôi hoàn toàn",
      "Thêm に (Ví dụ: 暇にので)"
    ],
    "correctIndex": 0,
    "explanation": "QUY TẮC BẪY THI CỬ: Trước 「ので」, Tính từ đuôi な và Danh từ BẮT BUỘC LÀ 「〜な ので」 (Ví dụ: ひまな ので, びょうきな ので). Tuyệt đối KHÔNG ĐƯỢC NÓI 「だので」.",
    "audioText": "ひまなので びょうきなので"
  },
  {
    "id": "l39_q_pair_13",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "meaning_kara",
    "formatLabel": "Đi với câu nhờ vả / cấm đoán",
    "question_kana": "[Câu 13] Điền từ nối: 「あぶない（ ? ）、きかいに さわらないで ください。」 (Vì nguy hiểm nên xin đừng chạm vào máy móc).",
    "question_kanji": "[Câu 13] 「危ない（ ? ）、機械に 触らないで ください。」",
    "options": [
      "から (Chủ quan + câu cấm đoán/nhờ vả)",
      "ので",
      "のに",
      "ても"
    ],
    "correctIndex": 0,
    "explanation": "Vế sau là câu cấm đoán nhờ vả 「〜ないで ください」 ➔ BẮT BUỘC DÙNG 「から」, không dùng ので.",
    "audioText": "あぶないですから さわらないでください"
  },
  {
    "id": "l39_q_pair_14",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "meaning_node",
    "formatLabel": "Xin phép trang trọng (ので)",
    "question_kana": "[Câu 14] Điền từ nối: 「きぶんが わるい（ ? ）、きょうは はやく かえっても いいですか。」 (Vì em thấy trong người không khỏe, hôm nay em có thể về sớm được không ạ?).",
    "question_kanji": "[Câu 14] 「気分が 悪い（ ? ）、今日は 早く 帰っても いいですか。」",
    "options": [
      "ので (Lịch sự, giải thích lý do xin phép)",
      "から",
      "のに",
      "でも"
    ],
    "correctIndex": 0,
    "explanation": "Khi xin phép cấp trên một cách trang trọng, nhã nhặn và khách quan ➔ Dùng 「ので」.",
    "audioText": "きぶんが わるいので"
  },
  {
    "id": "l39_q_pair_15",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "grammar_connection",
    "formatLabel": "Danh từ + なので",
    "question_kana": "[Câu 15] Điền dạng đúng: 「あしたは （ ? ）ので、かいものに 行きます。」 (Vì mai là ngày nghỉ nên tôi đi mua sắm). Điền やすみ (danh từ):",
    "question_kanji": "[Câu 15] 「明日は （ ? ）ので、買い物に 行きます。」 Điền 休み:",
    "options": [
      "休みな (やすみな)",
      "休みだ",
      "休み",
      "休みの"
    ],
    "correctIndex": 0,
    "explanation": "休み là danh từ, đứng trước ので phải thêm な ➔ 「休みな ので」.",
    "audioText": "やすみなので"
  },
  {
    "id": "l39_q_pair_16",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "grammar_connection",
    "formatLabel": "Tính từ な + なので",
    "question_kana": "[Câu 16] Điền dạng đúng: 「この へやは （ ? ）ので、べんきょうしやすいです。」 (Vì căn phòng này yên tĩnh nên rất dễ học). Điền しずか (tính từ đuôi な):",
    "question_kanji": "[Câu 16] 「この 部屋は （ ? ）ので、勉強しやすいです。」 Điền 静か:",
    "options": [
      "静かな (しずかな)",
      "静かだ",
      "静か",
      "静かに"
    ],
    "correctIndex": 0,
    "explanation": "静か là tính từ đuôi な, trước ので phải có な ➔ 「静かな ので」.",
    "audioText": "しずかなので"
  },
  {
    "id": "l39_q_pair_17",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "dialogue",
    "formatLabel": "Giải thích lý do đi muộn",
    "question_kana": "[Câu 17] Hội thoại: 「どうして ちこくしたんですか。」 — 「じこで でんしゃが （ ? ）ので、おくれました。」 (Vì tai nạn làm xe điện dừng lại nên tôi bị muộn).",
    "question_kanji": "[Câu 17] 「事故で 電車が （ ? ）ので、遅れました。」 Điền とまります:",
    "options": [
      "止まった (とまった)",
      "止まる (とまる)",
      "止まって",
      "止まります"
    ],
    "correctIndex": 0,
    "explanation": "Sự việc đã xảy ra trong quá khứ ➔ Chia thể ngắn quá khứ (thể Ta) trước ので: 「とまった ので」.",
    "audioText": "でんしゃが とまったので"
  },
  {
    "id": "l39_q_pair_18",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "grammar_connection",
    "formatLabel": "Bẫy だので",
    "question_kana": "[Câu 18] Câu nào sau đây SAI ngữ pháp nghiêm trọng?",
    "question_kanji": "[Câu 18] Câu nào sau đây SAI ngữ pháp nghiêm trọng?",
    "options": [
      "暇だので、遊びに行きましょう。 (SAI vì だので)",
      "暇なので、遊びに行きましょう。",
      "暇ですから、遊びに行きましょう。",
      "頭が 痛いので、病院へ行きます。"
    ],
    "correctIndex": 0,
    "explanation": "Tuyệt đối KHÔNG CÓ 「だので」. Tính từ đuôi な và danh từ phải là 「な ので」.",
    "audioText": "ひまなので"
  },
  {
    "id": "l39_q_pair_19",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "meaning_kara",
    "formatLabel": "Đi với câu rủ rê 〜ましょう",
    "question_kana": "[Câu 19] Hội thoại rủ rê: 「時間が ありません（ ? ）、急ぎましょう。」 (Vì không còn thời gian nữa, chúng ta hãy nhanh lên nào).",
    "question_kanji": "[Câu 19] 「時間が ありません（ ? ）、急ぎましょう。」",
    "options": [
      "から (Đi với câu rủ rê 〜ましょう)",
      "ので",
      "のに",
      "ても"
    ],
    "correctIndex": 0,
    "explanation": "Vế sau là câu rủ rê mang ý chí người nói 「〜ましょう」 ➔ Dùng 「から」.",
    "audioText": "じかんが ありませんから いそぎましょう"
  },
  {
    "id": "l39_q_pair_20",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "dialogue",
    "formatLabel": "Xin phép về trước công ty",
    "question_kana": "[Câu 20] Chọn câu viết ĐÚNG ngữ pháp và lịch sự nhất:",
    "question_kanji": "[Câu 20] Chọn câu viết ĐÚNG ngữ pháp và lịch sự nhất:",
    "options": [
      "用事が ありますので、お先に 失礼します。",
      "用事が あるだので、お先に 失礼します。",
      "用事ですから、お先に 失礼してください。",
      "用事なのに、お先に 失礼します。"
    ],
    "correctIndex": 0,
    "explanation": "Xin phép về trước một cách trang trọng: 「用事がありますので、お先に失礼します」.",
    "audioText": "ようじが ありますので おさきに しつれいします"
  },
  {
    "id": "l39_q_pair_21",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "meaning_kara",
    "formatLabel": "Khác biệt cốt lõi から vs ので",
    "question_kana": "[Câu 21] Khi giải thích nguyên nhân lý do, đâu là sự khác biệt cốt lõi giữa 「から (Kara)」 và 「ので (Node)」?",
    "question_kanji": "[Câu 21] Sự khác biệt cốt lõi giữa 「から」 và 「ので」 là gì?",
    "options": [
      "「から」 nhấn mạnh lý do chủ quan cá nhân (cho phép mệnh lệnh, rủ rê); 「ので」 nhấn mạnh lý do khách quan, lịch sự, nhẹ nhàng (không đi với mệnh lệnh trực tiếp)",
      "「から」 dùng cho người lớn; 「ので」 dùng cho bạn bè",
      "「ので」 mang tính cấm đoán mạnh hơn 「から」",
      "Hai từ hoàn toàn giống nhau 100%"
    ],
    "correctIndex": 0,
    "explanation": "「から」: Nguyên nhân mang tính chủ quan. Vế sau ĐƯỢC DÙNG câu mệnh lệnh, rủ rê, cấm đoán (〜てください, 〜ましょう...). 「ので」: Nguyên nhân mang tính khách quan, tự nhiên, nhã nhặn và lịch sự. Vế sau KHÔNG DÙNG câu mệnh lệnh trực tiếp.",
    "audioText": "あぶないですから さわらないでください"
  },
  {
    "id": "l39_q_pair_22",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "grammar_connection",
    "formatLabel": "Quy tắc kết nối 〜な ので",
    "question_kana": "[Câu 22] Quy tắc kết nối ngữ pháp: Trước 「ので」, tính từ đuôi な và Danh từ ở dạng khẳng định hiện tại BẮT BUỘC biến đổi như thế nào?",
    "question_kanji": "[Câu 22] Trước 「ので」, tính từ đuôi な và Danh từ kết nối như thế nào?",
    "options": [
      "Bắt buộc thêm 「な」 (Ví dụ: 暇なので, 雨なので)",
      "Thêm だ (Ví dụ: 暇だので - SAI)",
      "Bỏ đuôi hoàn toàn",
      "Thêm に (Ví dụ: 暇にので)"
    ],
    "correctIndex": 0,
    "explanation": "QUY TẮC BẪY THI CỬ: Trước 「ので」, Tính từ đuôi な và Danh từ BẮT BUỘC LÀ 「〜な ので」 (Ví dụ: ひまな ので, びょうきな ので). Tuyệt đối KHÔNG ĐƯỢC NÓI 「だので」.",
    "audioText": "ひまなので びょうきなので"
  },
  {
    "id": "l39_q_pair_23",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "meaning_kara",
    "formatLabel": "Đi với câu nhờ vả / cấm đoán",
    "question_kana": "[Câu 23] Điền từ nối: 「あぶない（ ? ）、きかいに さわらないで ください。」 (Vì nguy hiểm nên xin đừng chạm vào máy móc).",
    "question_kanji": "[Câu 23] 「危ない（ ? ）、機械に 触らないで ください。」",
    "options": [
      "から (Chủ quan + câu cấm đoán/nhờ vả)",
      "ので",
      "のに",
      "ても"
    ],
    "correctIndex": 0,
    "explanation": "Vế sau là câu cấm đoán nhờ vả 「〜ないで ください」 ➔ BẮT BUỘC DÙNG 「から」, không dùng ので.",
    "audioText": "あぶないですから さわらないでください"
  },
  {
    "id": "l39_q_pair_24",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "meaning_node",
    "formatLabel": "Xin phép trang trọng (ので)",
    "question_kana": "[Câu 24] Điền từ nối: 「きぶんが わるい（ ? ）、きょうは はやく かえっても いいですか。」 (Vì em thấy trong người không khỏe, hôm nay em có thể về sớm được không ạ?).",
    "question_kanji": "[Câu 24] 「気分が 悪い（ ? ）、今日は 早く 帰っても いいですか。」",
    "options": [
      "ので (Lịch sự, giải thích lý do xin phép)",
      "から",
      "のに",
      "でも"
    ],
    "correctIndex": 0,
    "explanation": "Khi xin phép cấp trên một cách trang trọng, nhã nhặn và khách quan ➔ Dùng 「ので」.",
    "audioText": "きぶんが わるいので"
  },
  {
    "id": "l39_q_pair_25",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "grammar_connection",
    "formatLabel": "Danh từ + なので",
    "question_kana": "[Câu 25] Điền dạng đúng: 「あしたは （ ? ）ので、かいものに 行きます。」 (Vì mai là ngày nghỉ nên tôi đi mua sắm). Điền やすみ (danh từ):",
    "question_kanji": "[Câu 25] 「明日は （ ? ）ので、買い物に 行きます。」 Điền 休み:",
    "options": [
      "休みな (やすみな)",
      "休みだ",
      "休み",
      "休みの"
    ],
    "correctIndex": 0,
    "explanation": "休み là danh từ, đứng trước ので phải thêm な ➔ 「休みな ので」.",
    "audioText": "やすみなので"
  },
  {
    "id": "l39_q_pair_26",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "grammar_connection",
    "formatLabel": "Tính từ な + なので",
    "question_kana": "[Câu 26] Điền dạng đúng: 「この へやは （ ? ）ので、べんきょうしやすいです。」 (Vì căn phòng này yên tĩnh nên rất dễ học). Điền しずか (tính từ đuôi な):",
    "question_kanji": "[Câu 26] 「この 部屋は （ ? ）ので、勉強しやすいです。」 Điền 静か:",
    "options": [
      "静かな (しずかな)",
      "静かだ",
      "静か",
      "静かに"
    ],
    "correctIndex": 0,
    "explanation": "静か là tính từ đuôi な, trước ので phải có な ➔ 「静かな ので」.",
    "audioText": "しずかなので"
  },
  {
    "id": "l39_q_pair_27",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "dialogue",
    "formatLabel": "Giải thích lý do đi muộn",
    "question_kana": "[Câu 27] Hội thoại: 「どうして ちこくしたんですか。」 — 「じこで でんしゃが （ ? ）ので、おくれました。」 (Vì tai nạn làm xe điện dừng lại nên tôi bị muộn).",
    "question_kanji": "[Câu 27] 「事故で 電車が （ ? ）ので、遅れました。」 Điền とまります:",
    "options": [
      "止まった (とまった)",
      "止まる (とまる)",
      "止まって",
      "止まります"
    ],
    "correctIndex": 0,
    "explanation": "Sự việc đã xảy ra trong quá khứ ➔ Chia thể ngắn quá khứ (thể Ta) trước ので: 「とまった ので」.",
    "audioText": "でんしゃが とまったので"
  },
  {
    "id": "l39_q_pair_28",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "grammar_connection",
    "formatLabel": "Bẫy だので",
    "question_kana": "[Câu 28] Câu nào sau đây SAI ngữ pháp nghiêm trọng?",
    "question_kanji": "[Câu 28] Câu nào sau đây SAI ngữ pháp nghiêm trọng?",
    "options": [
      "暇だので、遊びに行きましょう。 (SAI vì だので)",
      "暇なので、遊びに行きましょう。",
      "暇ですから、遊びに行きましょう。",
      "頭が 痛いので、病院へ行きます。"
    ],
    "correctIndex": 0,
    "explanation": "Tuyệt đối KHÔNG CÓ 「だので」. Tính từ đuôi な và danh từ phải là 「な ので」.",
    "audioText": "ひまなので"
  },
  {
    "id": "l39_q_pair_29",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "meaning_kara",
    "formatLabel": "Đi với câu rủ rê 〜ましょう",
    "question_kana": "[Câu 29] Hội thoại rủ rê: 「時間が ありません（ ? ）、急ぎましょう。」 (Vì không còn thời gian nữa, chúng ta hãy nhanh lên nào).",
    "question_kanji": "[Câu 29] 「時間が ありません（ ? ）、急ぎましょう。」",
    "options": [
      "から (Đi với câu rủ rê 〜ましょう)",
      "ので",
      "のに",
      "ても"
    ],
    "correctIndex": 0,
    "explanation": "Vế sau là câu rủ rê mang ý chí người nói 「〜ましょう」 ➔ Dùng 「から」.",
    "audioText": "じかんが ありませんから いそぎましょう"
  },
  {
    "id": "l39_q_pair_30",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "dialogue",
    "formatLabel": "Xin phép về trước công ty",
    "question_kana": "[Câu 30] Chọn câu viết ĐÚNG ngữ pháp và lịch sự nhất:",
    "question_kanji": "[Câu 30] Chọn câu viết ĐÚNG ngữ pháp và lịch sự nhất:",
    "options": [
      "用事が ありますので、お先に 失礼します。",
      "用事が あるだので、お先に 失礼します。",
      "用事ですから、お先に 失礼してください。",
      "用事なのに、お先に 失礼します。"
    ],
    "correctIndex": 0,
    "explanation": "Xin phép về trước một cách trang trọng: 「用事がありますので、お先に失礼します」.",
    "audioText": "ようじが ありますので おさきに しつれいします"
  },
  {
    "id": "l39_q_pair_31",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "meaning_kara",
    "formatLabel": "Khác biệt cốt lõi から vs ので",
    "question_kana": "[Câu 31] Khi giải thích nguyên nhân lý do, đâu là sự khác biệt cốt lõi giữa 「から (Kara)」 và 「ので (Node)」?",
    "question_kanji": "[Câu 31] Sự khác biệt cốt lõi giữa 「から」 và 「ので」 là gì?",
    "options": [
      "「から」 nhấn mạnh lý do chủ quan cá nhân (cho phép mệnh lệnh, rủ rê); 「ので」 nhấn mạnh lý do khách quan, lịch sự, nhẹ nhàng (không đi với mệnh lệnh trực tiếp)",
      "「から」 dùng cho người lớn; 「ので」 dùng cho bạn bè",
      "「ので」 mang tính cấm đoán mạnh hơn 「から」",
      "Hai từ hoàn toàn giống nhau 100%"
    ],
    "correctIndex": 0,
    "explanation": "「から」: Nguyên nhân mang tính chủ quan. Vế sau ĐƯỢC DÙNG câu mệnh lệnh, rủ rê, cấm đoán (〜てください, 〜ましょう...). 「ので」: Nguyên nhân mang tính khách quan, tự nhiên, nhã nhặn và lịch sự. Vế sau KHÔNG DÙNG câu mệnh lệnh trực tiếp.",
    "audioText": "あぶないですから さわらないでください"
  },
  {
    "id": "l39_q_pair_32",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "grammar_connection",
    "formatLabel": "Quy tắc kết nối 〜な ので",
    "question_kana": "[Câu 32] Quy tắc kết nối ngữ pháp: Trước 「ので」, tính từ đuôi な và Danh từ ở dạng khẳng định hiện tại BẮT BUỘC biến đổi như thế nào?",
    "question_kanji": "[Câu 32] Trước 「ので」, tính từ đuôi な và Danh từ kết nối như thế nào?",
    "options": [
      "Bắt buộc thêm 「な」 (Ví dụ: 暇なので, 雨なので)",
      "Thêm だ (Ví dụ: 暇だので - SAI)",
      "Bỏ đuôi hoàn toàn",
      "Thêm に (Ví dụ: 暇にので)"
    ],
    "correctIndex": 0,
    "explanation": "QUY TẮC BẪY THI CỬ: Trước 「ので」, Tính từ đuôi な và Danh từ BẮT BUỘC LÀ 「〜な ので」 (Ví dụ: ひまな ので, びょうきな ので). Tuyệt đối KHÔNG ĐƯỢC NÓI 「だので」.",
    "audioText": "ひまなので びょうきなので"
  },
  {
    "id": "l39_q_pair_33",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "meaning_kara",
    "formatLabel": "Đi với câu nhờ vả / cấm đoán",
    "question_kana": "[Câu 33] Điền từ nối: 「あぶない（ ? ）、きかいに さわらないで ください。」 (Vì nguy hiểm nên xin đừng chạm vào máy móc).",
    "question_kanji": "[Câu 33] 「危ない（ ? ）、機械に 触らないで ください。」",
    "options": [
      "から (Chủ quan + câu cấm đoán/nhờ vả)",
      "ので",
      "のに",
      "ても"
    ],
    "correctIndex": 0,
    "explanation": "Vế sau là câu cấm đoán nhờ vả 「〜ないで ください」 ➔ BẮT BUỘC DÙNG 「から」, không dùng ので.",
    "audioText": "あぶないですから さわらないでください"
  },
  {
    "id": "l39_q_pair_34",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "meaning_node",
    "formatLabel": "Xin phép trang trọng (ので)",
    "question_kana": "[Câu 34] Điền từ nối: 「きぶんが わるい（ ? ）、きょうは はやく かえっても いいですか。」 (Vì em thấy trong người không khỏe, hôm nay em có thể về sớm được không ạ?).",
    "question_kanji": "[Câu 34] 「気分が 悪い（ ? ）、今日は 早く 帰っても いいですか。」",
    "options": [
      "ので (Lịch sự, giải thích lý do xin phép)",
      "から",
      "のに",
      "でも"
    ],
    "correctIndex": 0,
    "explanation": "Khi xin phép cấp trên một cách trang trọng, nhã nhặn và khách quan ➔ Dùng 「ので」.",
    "audioText": "きぶんが わるいので"
  },
  {
    "id": "l39_q_pair_35",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "grammar_connection",
    "formatLabel": "Danh từ + なので",
    "question_kana": "[Câu 35] Điền dạng đúng: 「あしたは （ ? ）ので、かいものに 行きます。」 (Vì mai là ngày nghỉ nên tôi đi mua sắm). Điền やすみ (danh từ):",
    "question_kanji": "[Câu 35] 「明日は （ ? ）ので、買い物に 行きます。」 Điền 休み:",
    "options": [
      "休みな (やすみな)",
      "休みだ",
      "休み",
      "休みの"
    ],
    "correctIndex": 0,
    "explanation": "休み là danh từ, đứng trước ので phải thêm な ➔ 「休みな ので」.",
    "audioText": "やすみなので"
  },
  {
    "id": "l39_q_pair_36",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "grammar_connection",
    "formatLabel": "Tính từ な + なので",
    "question_kana": "[Câu 36] Điền dạng đúng: 「この へやは （ ? ）ので、べんきょうしやすいです。」 (Vì căn phòng này yên tĩnh nên rất dễ học). Điền しずか (tính từ đuôi な):",
    "question_kanji": "[Câu 36] 「この 部屋は （ ? ）ので、勉強しやすいです。」 Điền 静か:",
    "options": [
      "静かな (しずかな)",
      "静かだ",
      "静か",
      "静かに"
    ],
    "correctIndex": 0,
    "explanation": "静か là tính từ đuôi な, trước ので phải có な ➔ 「静かな ので」.",
    "audioText": "しずかなので"
  },
  {
    "id": "l39_q_pair_37",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "dialogue",
    "formatLabel": "Giải thích lý do đi muộn",
    "question_kana": "[Câu 37] Hội thoại: 「どうして ちこくしたんですか。」 — 「じこで でんしゃが （ ? ）ので、おくれました。」 (Vì tai nạn làm xe điện dừng lại nên tôi bị muộn).",
    "question_kanji": "[Câu 37] 「事故で 電車が （ ? ）ので、遅れました。」 Điền とまります:",
    "options": [
      "止まった (とまった)",
      "止まる (とまる)",
      "止まって",
      "止まります"
    ],
    "correctIndex": 0,
    "explanation": "Sự việc đã xảy ra trong quá khứ ➔ Chia thể ngắn quá khứ (thể Ta) trước ので: 「とまった ので」.",
    "audioText": "でんしゃが とまったので"
  },
  {
    "id": "l39_q_pair_38",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "grammar_connection",
    "formatLabel": "Bẫy だので",
    "question_kana": "[Câu 38] Câu nào sau đây SAI ngữ pháp nghiêm trọng?",
    "question_kanji": "[Câu 38] Câu nào sau đây SAI ngữ pháp nghiêm trọng?",
    "options": [
      "暇だので、遊びに行きましょう。 (SAI vì だので)",
      "暇なので、遊びに行きましょう。",
      "暇ですから、遊びに行きましょう。",
      "頭が 痛いので、病院へ行きます。"
    ],
    "correctIndex": 0,
    "explanation": "Tuyệt đối KHÔNG CÓ 「だので」. Tính từ đuôi な và danh từ phải là 「な ので」.",
    "audioText": "ひまなので"
  },
  {
    "id": "l39_q_pair_39",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "meaning_kara",
    "formatLabel": "Đi với câu rủ rê 〜ましょう",
    "question_kana": "[Câu 39] Hội thoại rủ rê: 「時間が ありません（ ? ）、急ぎましょう。」 (Vì không còn thời gian nữa, chúng ta hãy nhanh lên nào).",
    "question_kanji": "[Câu 39] 「時間が ありません（ ? ）、急ぎましょう。」",
    "options": [
      "から (Đi với câu rủ rê 〜ましょう)",
      "ので",
      "のに",
      "ても"
    ],
    "correctIndex": 0,
    "explanation": "Vế sau là câu rủ rê mang ý chí người nói 「〜ましょう」 ➔ Dùng 「から」.",
    "audioText": "じかんが ありませんから いそぎましょう"
  },
  {
    "id": "l39_q_pair_40",
    "lesson": 39,
    "unitId": "l39_pair_kara_vs_node",
    "format": "dialogue",
    "formatLabel": "Xin phép về trước công ty",
    "question_kana": "[Câu 40] Chọn câu viết ĐÚNG ngữ pháp và lịch sự nhất:",
    "question_kanji": "[Câu 40] Chọn câu viết ĐÚNG ngữ pháp và lịch sự nhất:",
    "options": [
      "用事が ありますので、お先に 失礼します。",
      "用事が あるだので、お先に 失礼します。",
      "用事ですから、お先に 失礼してください。",
      "用事なのに、お先に 失礼します。"
    ],
    "correctIndex": 0,
    "explanation": "Xin phép về trước một cách trang trọng: 「用事がありますので、お先に失礼します」.",
    "audioText": "ようじが ありますので おさきに しつれいします"
  }
];
