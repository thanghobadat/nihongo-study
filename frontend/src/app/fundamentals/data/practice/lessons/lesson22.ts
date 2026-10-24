import { PracticeQuestion } from '../types';

export const LESSON_22_QUESTIONS: PracticeQuestion[] = [
  {
    "id": "l22_q_pair_01",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "topic_vs_subject",
    "formatLabel": "Trọng tâm thông tin は vs が",
    "question_kana": "[Câu 1] Khi phân biệt trợ từ 「は」 và 「が」, đâu là sự khác biệt cơ bản về TRỌNG TÂM THÔNG TIN trong câu?",
    "question_kanji": "[Câu 1] Phân biệt trọng tâm thông tin giữa 「は」 và 「が」?",
    "options": [
      "「は」 trọng tâm thông tin nằm ở VỊ NGỮ phía sau; 「が」 trọng tâm thông tin nằm ở CHỦ NGỮ phía trước",
      "「は」 nhấn mạnh chủ ngữ; 「が」 nhấn mạnh vị ngữ",
      "Không có sự khác nhau về trọng tâm",
      "Cả hai đều nhấn mạnh tân ngữ"
    ],
    "correctIndex": 0,
    "explanation": "Quy tắc kinh điển: Với 「A は B です」, thông tin quan trọng nằm ở B (vị ngữ). Với 「A が B です」, thông tin quan trọng muốn làm rõ chính là đối tượng A (chủ ngữ).",
    "audioText": "わたしは がくせいです"
  },
  {
    "id": "l22_q_pair_02",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "question_words",
    "formatLabel": "Từ để hỏi làm chủ ngữ",
    "question_kana": "[Câu 2] Khi từ để hỏi (誰, 何, どこ...) đóng vai trò là CHỦ NGỮ ở đầu câu, BẮT BUỘC dùng trợ từ nào?",
    "question_kanji": "[Câu 2] Từ để hỏi làm chủ ngữ đứng đầu câu đi với trợ từ nào?",
    "options": [
      "Bắt buộc dùng trợ từ が (Ví dụ: だれが 来ましたか)",
      "Bắt buộc dùng trợ từ は",
      "Dùng trợ từ を",
      "Dùng trợ từ も"
    ],
    "correctIndex": 0,
    "explanation": "Từ để hỏi chưa xác định danh tính nên KHÔNG THỂ LÀM CHỦ ĐỀ với 「は」, mà BẮT BUỘC phải đi với 「が」: 「だれが 来ましたか」, 「なにが 落ちましたか」.",
    "audioText": "だれが きましたか"
  },
  {
    "id": "l22_q_pair_03",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "question_words",
    "formatLabel": "Hỏi và trả lời chủ thể",
    "question_kana": "[Câu 3] Hội thoại: 「だれ【 ? 】このケーキを 作りましたか。」 — 「田中さん【 ? 】作りました。」 Điền trợ từ:",
    "question_kanji": "[Câu 3] 「だれ【 ? 】このケーキを作りましたか。」 — 「田中さん【 ? 】作りました。」",
    "options": [
      "が / が",
      "は / は",
      "が / は",
      "は / が"
    ],
    "correctIndex": 0,
    "explanation": "Câu hỏi dùng が (だれが) để hỏi ai làm, thì câu trả lời chỉ đích danh chủ thể cũng dùng が: 「たなかさんが つくりました」.",
    "audioText": "だれが つくりましたか"
  },
  {
    "id": "l22_q_pair_04",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "subordinate_clause",
    "formatLabel": "Chủ ngữ trong mệnh đề định ngữ",
    "question_kana": "[Câu 4] Trong MỆNH ĐỀ PHỤ / MỆNH ĐỀ ĐỊNH NGỮ bổ nghĩa cho danh từ, chủ ngữ của mệnh đề phụ BẮT BUỘC dùng trợ từ nào?",
    "question_kanji": "[Câu 4] Chủ ngữ trong mệnh đề định ngữ dùng trợ từ nào?",
    "options": [
      "Bắt buộc dùng trợ từ が (Không dùng は)",
      "Bắt buộc dùng trợ từ は",
      "Dùng trợ từ を",
      "Dùng trợ từ で"
    ],
    "correctIndex": 0,
    "explanation": "Trong mệnh đề bổ nghĩa cho danh từ, chủ ngữ của hành động bổ nghĩa BẮT BUỘC dùng 「が」: 「わたし【が】作った ケーキ」 (Chiếc bánh tôi làm), 「彼【が】住んでいる 町」.",
    "audioText": "わたしが つくった ケーキ"
  },
  {
    "id": "l22_q_pair_05",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "subordinate_clause",
    "formatLabel": "Mệnh đề bổ nghĩa danh từ",
    "question_kana": "[Câu 5] Điền trợ từ: 「これは わたし【 ? 】きのう 買った 本です。」 (Đây là cuốn sách mà hôm qua tôi đã mua).",
    "question_kanji": "[Câu 5] 「これは 私【 ? 】昨日 買った 本です。」",
    "options": [
      "が",
      "は",
      "を",
      "に"
    ],
    "correctIndex": 0,
    "explanation": "Mệnh đề bổ nghĩa 「わたしが きのう かった」 bổ nghĩa cho 本 ➔ Chủ ngữ trong mệnh đề định ngữ dùng 「が」.",
    "audioText": "わたしが きのう かった 本"
  },
  {
    "id": "l22_q_pair_06",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "natural_phenomenon",
    "formatLabel": "Hiện tượng tự nhiên",
    "question_kana": "[Câu 6] Khi miêu tả hiện tượng tự nhiên hoặc một sự việc mới diễn ra trước mắt người nói (hiện tượng khách quan), dùng trợ từ nào?",
    "question_kanji": "[Câu 6] Miêu tả hiện tượng tự nhiên trước mắt dùng trợ từ nào?",
    "options": [
      "Trợ từ が (Ví dụ: 雨が 降っています, 桜が 咲きました)",
      "Trợ từ は",
      "Trợ từ を",
      "Trợ từ で"
    ],
    "correctIndex": 0,
    "explanation": "Hiện tượng tự nhiên hoặc sự việc đập vào mắt người nói dùng 「が」: 「あめが ふっています」 (Mưa đang rơi), 「でんしゃが きました」 (Tàu điện đã đến rồi).",
    "audioText": "あめが ふっています"
  },
  {
    "id": "l22_q_pair_07",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "contrast_wa",
    "formatLabel": "Đối chiếu hai vế (は...は...)",
    "question_kana": "[Câu 7] Điền trợ từ diễn tả đối chiếu 2 vế: 「りんご【 A 】すきですが、バナナ【 B 】きらいです。」",
    "question_kanji": "[Câu 7] 「りんご【 A 】好きですが、バナナ【 B 】嫌いです。」",
    "options": [
      "A: は , B: は",
      "A: が , B: が",
      "A: を , B: を",
      "A: に , B: に"
    ],
    "correctIndex": 0,
    "explanation": "Khi đối chiếu, so sánh sự tương phản giữa 2 đối tượng, cả 2 vế đều dùng trợ từ 「は」: 「りんごは すきですが、バナナは きらいです」.",
    "audioText": "りんごは すきですが バナナは きらいです"
  },
  {
    "id": "l22_q_pair_08",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "adjective_object",
    "formatLabel": "Đối tượng của tính từ / khả năng",
    "question_kana": "[Câu 8] Trợ từ 「が」 đi kèm để chỉ tân ngữ/đối tượng của tính từ cảm xúc/khả năng nào sau đây?",
    "question_kanji": "[Câu 8] Trợ từ 「が」 đi với nhóm từ nào?",
    "options": [
      "好き (thích), 嫌い (ghét), 上手 (giỏi), 下手 (kém), 欲しい (muốn có)",
      "勉強します (học), 食べます (ăn)",
      "行きます (đi), 帰ります (về)",
      "話します (nói), 待ちます (đợi)"
    ],
    "correctIndex": 0,
    "explanation": "Các tính từ biểu thị sở thích, mong muốn, khả năng luôn đòi hỏi đối tượng đi với trợ từ 「が」: すき, きらい, じょうず, へた, ほしい, わかります, あります.",
    "audioText": "にほんごが わかります"
  },
  {
    "id": "l22_q_pair_09",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "adjective_object",
    "formatLabel": "Đi với ほしい",
    "question_kana": "[Câu 9] Điền trợ từ: 「わたしは あたらしい カメラ【 ? 】ほしいです。」 (Tôi muốn có một chiếc máy ảnh mới).",
    "question_kanji": "[Câu 9] 「私は 新しい カメラ【 ? 】欲しいです。」",
    "options": [
      "が",
      "を",
      "は",
      "で"
    ],
    "correctIndex": 0,
    "explanation": "ほしい (muốn có) là tính từ biểu thị ước muốn ➔ Đối tượng đi với trợ từ 「が」.",
    "audioText": "あたらしい カメラが ほしいです"
  },
  {
    "id": "l22_q_pair_10",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "subordinate_clause",
    "formatLabel": "Mệnh đề định ngữ",
    "question_kana": "[Câu 10] Điền trợ từ: 「母【 ? 】作った りょうりは いつも おいしいです。」 (Món ăn mẹ nấu lúc nào cũng ngon).",
    "question_kanji": "[Câu 10] 「母【 ? 】作った 料理は いつも 美味しいです。」",
    "options": [
      "が",
      "は",
      "を",
      "に"
    ],
    "correctIndex": 0,
    "explanation": "「母が 作った」 là mệnh đề định ngữ bổ nghĩa cho 料理 ➔ Chủ ngữ trong mệnh đề phụ bắt buộc dùng 「が」.",
    "audioText": "ははが つくった りょうり"
  },
  {
    "id": "l22_q_pair_11",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "subordinate_clause",
    "formatLabel": "Bổ nghĩa cho danh từ",
    "question_kana": "[Câu 11] Hội thoại: 「あそこに いる 人は だれですか。」 — 「あの 白い シャツを （ ? ）人ですか。ミラーさんです。」",
    "question_kanji": "[Câu 11] 「あの 白い シャツを （ ? ）人ですか。ミラーさんです。」 Điền 着ます:",
    "options": [
      "着ている (きている)",
      "着ます (きます)",
      "着た (きた)",
      "着て (きて)"
    ],
    "correctIndex": 0,
    "explanation": "Mệnh đề bổ nghĩa cho 人: 「しろい シャツを きている ひと」 (Người đang mặc chiếc áo sơ mi trắng).",
    "audioText": "白いシャツを 着ている人"
  },
  {
    "id": "l22_q_pair_12",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "subordinate_clause",
    "formatLabel": "Chọn câu đúng định ngữ",
    "question_kana": "[Câu 12] Chọn câu viết ĐÚNG ngữ pháp tiếng Nhật:",
    "question_kanji": "[Câu 12] Chọn câu viết ĐÚNG ngữ pháp tiếng Nhật:",
    "options": [
      "わたしが 住んでいる アパートは 駅から 近いです。",
      "わたしは 住んでいる アパートは 駅から 近いです。",
      "わたしを 住んでいる アパートは 駅から 近いです。",
      "わたしで 住んでいる アパートは 駅から 近いです。"
    ],
    "correctIndex": 0,
    "explanation": "Trong mệnh đề bổ nghĩa 「わたしが すんでいる」 thì chủ ngữ わたし phải đi với 「が」. Chủ đề của cả câu là アパートは.",
    "audioText": "わたしが すんでいる アパート"
  },
  {
    "id": "l22_q_pair_13",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "topic_vs_subject",
    "formatLabel": "Trọng tâm thông tin は vs が",
    "question_kana": "[Câu 13] Khi phân biệt trợ từ 「は」 và 「が」, đâu là sự khác biệt cơ bản về TRỌNG TÂM THÔNG TIN trong câu?",
    "question_kanji": "[Câu 13] Phân biệt trọng tâm thông tin giữa 「は」 và 「が」?",
    "options": [
      "「は」 trọng tâm thông tin nằm ở VỊ NGỮ phía sau; 「が」 trọng tâm thông tin nằm ở CHỦ NGỮ phía trước",
      "「は」 nhấn mạnh chủ ngữ; 「が」 nhấn mạnh vị ngữ",
      "Không có sự khác nhau về trọng tâm",
      "Cả hai đều nhấn mạnh tân ngữ"
    ],
    "correctIndex": 0,
    "explanation": "Quy tắc kinh điển: Với 「A は B です」, thông tin quan trọng nằm ở B (vị ngữ). Với 「A が B です」, thông tin quan trọng muốn làm rõ chính là đối tượng A (chủ ngữ).",
    "audioText": "わたしは がくせいです"
  },
  {
    "id": "l22_q_pair_14",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "question_words",
    "formatLabel": "Từ để hỏi làm chủ ngữ",
    "question_kana": "[Câu 14] Khi từ để hỏi (誰, 何, どこ...) đóng vai trò là CHỦ NGỮ ở đầu câu, BẮT BUỘC dùng trợ từ nào?",
    "question_kanji": "[Câu 14] Từ để hỏi làm chủ ngữ đứng đầu câu đi với trợ từ nào?",
    "options": [
      "Bắt buộc dùng trợ từ が (Ví dụ: だれが 来ましたか)",
      "Bắt buộc dùng trợ từ は",
      "Dùng trợ từ を",
      "Dùng trợ từ も"
    ],
    "correctIndex": 0,
    "explanation": "Từ để hỏi chưa xác định danh tính nên KHÔNG THỂ LÀM CHỦ ĐỀ với 「は」, mà BẮT BUỘC phải đi với 「が」: 「だれが 来ましたか」, 「なにが 落ちましたか」.",
    "audioText": "だれが きましたか"
  },
  {
    "id": "l22_q_pair_15",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "question_words",
    "formatLabel": "Hỏi và trả lời chủ thể",
    "question_kana": "[Câu 15] Hội thoại: 「だれ【 ? 】このケーキを 作りましたか。」 — 「田中さん【 ? 】作りました。」 Điền trợ từ:",
    "question_kanji": "[Câu 15] 「だれ【 ? 】このケーキを作りましたか。」 — 「田中さん【 ? 】作りました。」",
    "options": [
      "が / が",
      "は / は",
      "が / は",
      "は / が"
    ],
    "correctIndex": 0,
    "explanation": "Câu hỏi dùng が (だれが) để hỏi ai làm, thì câu trả lời chỉ đích danh chủ thể cũng dùng が: 「たなかさんが つくりました」.",
    "audioText": "だれが つくりましたか"
  },
  {
    "id": "l22_q_pair_16",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "subordinate_clause",
    "formatLabel": "Chủ ngữ trong mệnh đề định ngữ",
    "question_kana": "[Câu 16] Trong MỆNH ĐỀ PHỤ / MỆNH ĐỀ ĐỊNH NGỮ bổ nghĩa cho danh từ, chủ ngữ của mệnh đề phụ BẮT BUỘC dùng trợ từ nào?",
    "question_kanji": "[Câu 16] Chủ ngữ trong mệnh đề định ngữ dùng trợ từ nào?",
    "options": [
      "Bắt buộc dùng trợ từ が (Không dùng は)",
      "Bắt buộc dùng trợ từ は",
      "Dùng trợ từ を",
      "Dùng trợ từ で"
    ],
    "correctIndex": 0,
    "explanation": "Trong mệnh đề bổ nghĩa cho danh từ, chủ ngữ của hành động bổ nghĩa BẮT BUỘC dùng 「が」: 「わたし【が】作った ケーキ」 (Chiếc bánh tôi làm), 「彼【が】住んでいる 町」.",
    "audioText": "わたしが つくった ケーキ"
  },
  {
    "id": "l22_q_pair_17",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "subordinate_clause",
    "formatLabel": "Mệnh đề bổ nghĩa danh từ",
    "question_kana": "[Câu 17] Điền trợ từ: 「これは わたし【 ? 】きのう 買った 本です。」 (Đây là cuốn sách mà hôm qua tôi đã mua).",
    "question_kanji": "[Câu 17] 「これは 私【 ? 】昨日 買った 本です。」",
    "options": [
      "が",
      "は",
      "を",
      "に"
    ],
    "correctIndex": 0,
    "explanation": "Mệnh đề bổ nghĩa 「わたしが きのう かった」 bổ nghĩa cho 本 ➔ Chủ ngữ trong mệnh đề định ngữ dùng 「が」.",
    "audioText": "わたしが きのう かった 本"
  },
  {
    "id": "l22_q_pair_18",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "natural_phenomenon",
    "formatLabel": "Hiện tượng tự nhiên",
    "question_kana": "[Câu 18] Khi miêu tả hiện tượng tự nhiên hoặc một sự việc mới diễn ra trước mắt người nói (hiện tượng khách quan), dùng trợ từ nào?",
    "question_kanji": "[Câu 18] Miêu tả hiện tượng tự nhiên trước mắt dùng trợ từ nào?",
    "options": [
      "Trợ từ が (Ví dụ: 雨が 降っています, 桜が 咲きました)",
      "Trợ từ は",
      "Trợ từ を",
      "Trợ từ で"
    ],
    "correctIndex": 0,
    "explanation": "Hiện tượng tự nhiên hoặc sự việc đập vào mắt người nói dùng 「が」: 「あめが ふっています」 (Mưa đang rơi), 「でんしゃが きました」 (Tàu điện đã đến rồi).",
    "audioText": "あめが ふっています"
  },
  {
    "id": "l22_q_pair_19",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "contrast_wa",
    "formatLabel": "Đối chiếu hai vế (は...は...)",
    "question_kana": "[Câu 19] Điền trợ từ diễn tả đối chiếu 2 vế: 「りんご【 A 】すきですが、バナナ【 B 】きらいです。」",
    "question_kanji": "[Câu 19] 「りんご【 A 】好きですが、バナナ【 B 】嫌いです。」",
    "options": [
      "A: は , B: は",
      "A: が , B: が",
      "A: を , B: を",
      "A: に , B: に"
    ],
    "correctIndex": 0,
    "explanation": "Khi đối chiếu, so sánh sự tương phản giữa 2 đối tượng, cả 2 vế đều dùng trợ từ 「は」: 「りんごは すきですが、バナナは きらいです」.",
    "audioText": "りんごは すきですが バナナは きらいです"
  },
  {
    "id": "l22_q_pair_20",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "adjective_object",
    "formatLabel": "Đối tượng của tính từ / khả năng",
    "question_kana": "[Câu 20] Trợ từ 「が」 đi kèm để chỉ tân ngữ/đối tượng của tính từ cảm xúc/khả năng nào sau đây?",
    "question_kanji": "[Câu 20] Trợ từ 「が」 đi với nhóm từ nào?",
    "options": [
      "好き (thích), 嫌い (ghét), 上手 (giỏi), 下手 (kém), 欲しい (muốn có)",
      "勉強します (học), 食べます (ăn)",
      "行きます (đi), 帰ります (về)",
      "話します (nói), 待ちます (đợi)"
    ],
    "correctIndex": 0,
    "explanation": "Các tính từ biểu thị sở thích, mong muốn, khả năng luôn đòi hỏi đối tượng đi với trợ từ 「が」: すき, きらい, じょうず, へた, ほしい, わかります, あります.",
    "audioText": "にほんごが わかります"
  },
  {
    "id": "l22_q_pair_21",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "adjective_object",
    "formatLabel": "Đi với ほしい",
    "question_kana": "[Câu 21] Điền trợ từ: 「わたしは あたらしい カメラ【 ? 】ほしいです。」 (Tôi muốn có một chiếc máy ảnh mới).",
    "question_kanji": "[Câu 21] 「私は 新しい カメラ【 ? 】欲しいです。」",
    "options": [
      "が",
      "を",
      "は",
      "で"
    ],
    "correctIndex": 0,
    "explanation": "ほしい (muốn có) là tính từ biểu thị ước muốn ➔ Đối tượng đi với trợ từ 「が」.",
    "audioText": "あたらしい カメラが ほしいです"
  },
  {
    "id": "l22_q_pair_22",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "subordinate_clause",
    "formatLabel": "Mệnh đề định ngữ",
    "question_kana": "[Câu 22] Điền trợ từ: 「母【 ? 】作った りょうりは いつも おいしいです。」 (Món ăn mẹ nấu lúc nào cũng ngon).",
    "question_kanji": "[Câu 22] 「母【 ? 】作った 料理は いつも 美味しいです。」",
    "options": [
      "が",
      "は",
      "を",
      "に"
    ],
    "correctIndex": 0,
    "explanation": "「母が 作った」 là mệnh đề định ngữ bổ nghĩa cho 料理 ➔ Chủ ngữ trong mệnh đề phụ bắt buộc dùng 「が」.",
    "audioText": "ははが つくった りょうり"
  },
  {
    "id": "l22_q_pair_23",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "subordinate_clause",
    "formatLabel": "Bổ nghĩa cho danh từ",
    "question_kana": "[Câu 23] Hội thoại: 「あそこに いる 人は だれですか。」 — 「あの 白い シャツを （ ? ）人ですか。ミラーさんです。」",
    "question_kanji": "[Câu 23] 「あの 白い シャツを （ ? ）人ですか。ミラーさんです。」 Điền 着ます:",
    "options": [
      "着ている (きている)",
      "着ます (きます)",
      "着た (きた)",
      "着て (きて)"
    ],
    "correctIndex": 0,
    "explanation": "Mệnh đề bổ nghĩa cho 人: 「しろい シャツを きている ひと」 (Người đang mặc chiếc áo sơ mi trắng).",
    "audioText": "白いシャツを 着ている人"
  },
  {
    "id": "l22_q_pair_24",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "subordinate_clause",
    "formatLabel": "Chọn câu đúng định ngữ",
    "question_kana": "[Câu 24] Chọn câu viết ĐÚNG ngữ pháp tiếng Nhật:",
    "question_kanji": "[Câu 24] Chọn câu viết ĐÚNG ngữ pháp tiếng Nhật:",
    "options": [
      "わたしが 住んでいる アパートは 駅から 近いです。",
      "わたしは 住んでいる アパートは 駅から 近いです。",
      "わたしを 住んでいる アパートは 駅から 近いです。",
      "わたしで 住んでいる アパートは 駅から 近いです。"
    ],
    "correctIndex": 0,
    "explanation": "Trong mệnh đề bổ nghĩa 「わたしが すんでいる」 thì chủ ngữ わたし phải đi với 「が」. Chủ đề của cả câu là アパートは.",
    "audioText": "わたしが すんでいる アパート"
  },
  {
    "id": "l22_q_pair_25",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "topic_vs_subject",
    "formatLabel": "Trọng tâm thông tin は vs が",
    "question_kana": "[Câu 25] Khi phân biệt trợ từ 「は」 và 「が」, đâu là sự khác biệt cơ bản về TRỌNG TÂM THÔNG TIN trong câu?",
    "question_kanji": "[Câu 25] Phân biệt trọng tâm thông tin giữa 「は」 và 「が」?",
    "options": [
      "「は」 trọng tâm thông tin nằm ở VỊ NGỮ phía sau; 「が」 trọng tâm thông tin nằm ở CHỦ NGỮ phía trước",
      "「は」 nhấn mạnh chủ ngữ; 「が」 nhấn mạnh vị ngữ",
      "Không có sự khác nhau về trọng tâm",
      "Cả hai đều nhấn mạnh tân ngữ"
    ],
    "correctIndex": 0,
    "explanation": "Quy tắc kinh điển: Với 「A は B です」, thông tin quan trọng nằm ở B (vị ngữ). Với 「A が B です」, thông tin quan trọng muốn làm rõ chính là đối tượng A (chủ ngữ).",
    "audioText": "わたしは がくせいです"
  },
  {
    "id": "l22_q_pair_26",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "question_words",
    "formatLabel": "Từ để hỏi làm chủ ngữ",
    "question_kana": "[Câu 26] Khi từ để hỏi (誰, 何, どこ...) đóng vai trò là CHỦ NGỮ ở đầu câu, BẮT BUỘC dùng trợ từ nào?",
    "question_kanji": "[Câu 26] Từ để hỏi làm chủ ngữ đứng đầu câu đi với trợ từ nào?",
    "options": [
      "Bắt buộc dùng trợ từ が (Ví dụ: だれが 来ましたか)",
      "Bắt buộc dùng trợ từ は",
      "Dùng trợ từ を",
      "Dùng trợ từ も"
    ],
    "correctIndex": 0,
    "explanation": "Từ để hỏi chưa xác định danh tính nên KHÔNG THỂ LÀM CHỦ ĐỀ với 「は」, mà BẮT BUỘC phải đi với 「が」: 「だれが 来ましたか」, 「なにが 落ちましたか」.",
    "audioText": "だれが きましたか"
  },
  {
    "id": "l22_q_pair_27",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "question_words",
    "formatLabel": "Hỏi và trả lời chủ thể",
    "question_kana": "[Câu 27] Hội thoại: 「だれ【 ? 】このケーキを 作りましたか。」 — 「田中さん【 ? 】作りました。」 Điền trợ từ:",
    "question_kanji": "[Câu 27] 「だれ【 ? 】このケーキを作りましたか。」 — 「田中さん【 ? 】作りました。」",
    "options": [
      "が / が",
      "は / は",
      "が / は",
      "は / が"
    ],
    "correctIndex": 0,
    "explanation": "Câu hỏi dùng が (だれが) để hỏi ai làm, thì câu trả lời chỉ đích danh chủ thể cũng dùng が: 「たなかさんが つくりました」.",
    "audioText": "だれが つくりましたか"
  },
  {
    "id": "l22_q_pair_28",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "subordinate_clause",
    "formatLabel": "Chủ ngữ trong mệnh đề định ngữ",
    "question_kana": "[Câu 28] Trong MỆNH ĐỀ PHỤ / MỆNH ĐỀ ĐỊNH NGỮ bổ nghĩa cho danh từ, chủ ngữ của mệnh đề phụ BẮT BUỘC dùng trợ từ nào?",
    "question_kanji": "[Câu 28] Chủ ngữ trong mệnh đề định ngữ dùng trợ từ nào?",
    "options": [
      "Bắt buộc dùng trợ từ が (Không dùng は)",
      "Bắt buộc dùng trợ từ は",
      "Dùng trợ từ を",
      "Dùng trợ từ で"
    ],
    "correctIndex": 0,
    "explanation": "Trong mệnh đề bổ nghĩa cho danh từ, chủ ngữ của hành động bổ nghĩa BẮT BUỘC dùng 「が」: 「わたし【が】作った ケーキ」 (Chiếc bánh tôi làm), 「彼【が】住んでいる 町」.",
    "audioText": "わたしが つくった ケーキ"
  },
  {
    "id": "l22_q_pair_29",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "subordinate_clause",
    "formatLabel": "Mệnh đề bổ nghĩa danh từ",
    "question_kana": "[Câu 29] Điền trợ từ: 「これは わたし【 ? 】きのう 買った 本です。」 (Đây là cuốn sách mà hôm qua tôi đã mua).",
    "question_kanji": "[Câu 29] 「これは 私【 ? 】昨日 買った 本です。」",
    "options": [
      "が",
      "は",
      "を",
      "に"
    ],
    "correctIndex": 0,
    "explanation": "Mệnh đề bổ nghĩa 「わたしが きのう かった」 bổ nghĩa cho 本 ➔ Chủ ngữ trong mệnh đề định ngữ dùng 「が」.",
    "audioText": "わたしが きのう かった 本"
  },
  {
    "id": "l22_q_pair_30",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "natural_phenomenon",
    "formatLabel": "Hiện tượng tự nhiên",
    "question_kana": "[Câu 30] Khi miêu tả hiện tượng tự nhiên hoặc một sự việc mới diễn ra trước mắt người nói (hiện tượng khách quan), dùng trợ từ nào?",
    "question_kanji": "[Câu 30] Miêu tả hiện tượng tự nhiên trước mắt dùng trợ từ nào?",
    "options": [
      "Trợ từ が (Ví dụ: 雨が 降っています, 桜が 咲きました)",
      "Trợ từ は",
      "Trợ từ を",
      "Trợ từ で"
    ],
    "correctIndex": 0,
    "explanation": "Hiện tượng tự nhiên hoặc sự việc đập vào mắt người nói dùng 「が」: 「あめが ふっています」 (Mưa đang rơi), 「でんしゃが きました」 (Tàu điện đã đến rồi).",
    "audioText": "あめが ふっています"
  },
  {
    "id": "l22_q_pair_31",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "contrast_wa",
    "formatLabel": "Đối chiếu hai vế (は...は...)",
    "question_kana": "[Câu 31] Điền trợ từ diễn tả đối chiếu 2 vế: 「りんご【 A 】すきですが、バナナ【 B 】きらいです。」",
    "question_kanji": "[Câu 31] 「りんご【 A 】好きですが、バナナ【 B 】嫌いです。」",
    "options": [
      "A: は , B: は",
      "A: が , B: が",
      "A: を , B: を",
      "A: に , B: に"
    ],
    "correctIndex": 0,
    "explanation": "Khi đối chiếu, so sánh sự tương phản giữa 2 đối tượng, cả 2 vế đều dùng trợ từ 「は」: 「りんごは すきですが、バナナは きらいです」.",
    "audioText": "りんごは すきですが バナナは きらいです"
  },
  {
    "id": "l22_q_pair_32",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "adjective_object",
    "formatLabel": "Đối tượng của tính từ / khả năng",
    "question_kana": "[Câu 32] Trợ từ 「が」 đi kèm để chỉ tân ngữ/đối tượng của tính từ cảm xúc/khả năng nào sau đây?",
    "question_kanji": "[Câu 32] Trợ từ 「が」 đi với nhóm từ nào?",
    "options": [
      "好き (thích), 嫌い (ghét), 上手 (giỏi), 下手 (kém), 欲しい (muốn có)",
      "勉強します (học), 食べます (ăn)",
      "行きます (đi), 帰ります (về)",
      "話します (nói), 待ちます (đợi)"
    ],
    "correctIndex": 0,
    "explanation": "Các tính từ biểu thị sở thích, mong muốn, khả năng luôn đòi hỏi đối tượng đi với trợ từ 「が」: すき, きらい, じょうず, へた, ほしい, わかります, あります.",
    "audioText": "にほんごが わかります"
  },
  {
    "id": "l22_q_pair_33",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "adjective_object",
    "formatLabel": "Đi với ほしい",
    "question_kana": "[Câu 33] Điền trợ từ: 「わたしは あたらしい カメラ【 ? 】ほしいです。」 (Tôi muốn có một chiếc máy ảnh mới).",
    "question_kanji": "[Câu 33] 「私は 新しい カメラ【 ? 】欲しいです。」",
    "options": [
      "が",
      "を",
      "は",
      "で"
    ],
    "correctIndex": 0,
    "explanation": "ほしい (muốn có) là tính từ biểu thị ước muốn ➔ Đối tượng đi với trợ từ 「が」.",
    "audioText": "あたらしい カメラが ほしいです"
  },
  {
    "id": "l22_q_pair_34",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "subordinate_clause",
    "formatLabel": "Mệnh đề định ngữ",
    "question_kana": "[Câu 34] Điền trợ từ: 「母【 ? 】作った りょうりは いつも おいしいです。」 (Món ăn mẹ nấu lúc nào cũng ngon).",
    "question_kanji": "[Câu 34] 「母【 ? 】作った 料理は いつも 美味しいです。」",
    "options": [
      "が",
      "は",
      "を",
      "に"
    ],
    "correctIndex": 0,
    "explanation": "「母が 作った」 là mệnh đề định ngữ bổ nghĩa cho 料理 ➔ Chủ ngữ trong mệnh đề phụ bắt buộc dùng 「が」.",
    "audioText": "ははが つくった りょうり"
  },
  {
    "id": "l22_q_pair_35",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "subordinate_clause",
    "formatLabel": "Bổ nghĩa cho danh từ",
    "question_kana": "[Câu 35] Hội thoại: 「あそこに いる 人は だれですか。」 — 「あの 白い シャツを （ ? ）人ですか。ミラーさんです。」",
    "question_kanji": "[Câu 35] 「あの 白い シャツを （ ? ）人ですか。ミラーさんです。」 Điền 着ます:",
    "options": [
      "着ている (きている)",
      "着ます (きます)",
      "着た (きた)",
      "着て (きて)"
    ],
    "correctIndex": 0,
    "explanation": "Mệnh đề bổ nghĩa cho 人: 「しろい シャツを きている ひと」 (Người đang mặc chiếc áo sơ mi trắng).",
    "audioText": "白いシャツを 着ている人"
  },
  {
    "id": "l22_q_pair_36",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "subordinate_clause",
    "formatLabel": "Chọn câu đúng định ngữ",
    "question_kana": "[Câu 36] Chọn câu viết ĐÚNG ngữ pháp tiếng Nhật:",
    "question_kanji": "[Câu 36] Chọn câu viết ĐÚNG ngữ pháp tiếng Nhật:",
    "options": [
      "わたしが 住んでいる アパートは 駅から 近いです。",
      "わたしは 住んでいる アパートは 駅から 近いです。",
      "わたしを 住んでいる アパートは 駅から 近いです。",
      "わたしで 住んでいる アパートは 駅から 近いです。"
    ],
    "correctIndex": 0,
    "explanation": "Trong mệnh đề bổ nghĩa 「わたしが すんでいる」 thì chủ ngữ わたし phải đi với 「が」. Chủ đề của cả câu là アパートは.",
    "audioText": "わたしが すんでいる アパート"
  },
  {
    "id": "l22_q_pair_37",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "topic_vs_subject",
    "formatLabel": "Trọng tâm thông tin は vs が",
    "question_kana": "[Câu 37] Khi phân biệt trợ từ 「は」 và 「が」, đâu là sự khác biệt cơ bản về TRỌNG TÂM THÔNG TIN trong câu?",
    "question_kanji": "[Câu 37] Phân biệt trọng tâm thông tin giữa 「は」 và 「が」?",
    "options": [
      "「は」 trọng tâm thông tin nằm ở VỊ NGỮ phía sau; 「が」 trọng tâm thông tin nằm ở CHỦ NGỮ phía trước",
      "「は」 nhấn mạnh chủ ngữ; 「が」 nhấn mạnh vị ngữ",
      "Không có sự khác nhau về trọng tâm",
      "Cả hai đều nhấn mạnh tân ngữ"
    ],
    "correctIndex": 0,
    "explanation": "Quy tắc kinh điển: Với 「A は B です」, thông tin quan trọng nằm ở B (vị ngữ). Với 「A が B です」, thông tin quan trọng muốn làm rõ chính là đối tượng A (chủ ngữ).",
    "audioText": "わたしは がくせいです"
  },
  {
    "id": "l22_q_pair_38",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "question_words",
    "formatLabel": "Từ để hỏi làm chủ ngữ",
    "question_kana": "[Câu 38] Khi từ để hỏi (誰, 何, どこ...) đóng vai trò là CHỦ NGỮ ở đầu câu, BẮT BUỘC dùng trợ từ nào?",
    "question_kanji": "[Câu 38] Từ để hỏi làm chủ ngữ đứng đầu câu đi với trợ từ nào?",
    "options": [
      "Bắt buộc dùng trợ từ が (Ví dụ: だれが 来ましたか)",
      "Bắt buộc dùng trợ từ は",
      "Dùng trợ từ を",
      "Dùng trợ từ も"
    ],
    "correctIndex": 0,
    "explanation": "Từ để hỏi chưa xác định danh tính nên KHÔNG THỂ LÀM CHỦ ĐỀ với 「は」, mà BẮT BUỘC phải đi với 「が」: 「だれが 来ましたか」, 「なにが 落ちましたか」.",
    "audioText": "だれが きましたか"
  },
  {
    "id": "l22_q_pair_39",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "question_words",
    "formatLabel": "Hỏi và trả lời chủ thể",
    "question_kana": "[Câu 39] Hội thoại: 「だれ【 ? 】このケーキを 作りましたか。」 — 「田中さん【 ? 】作りました。」 Điền trợ từ:",
    "question_kanji": "[Câu 39] 「だれ【 ? 】このケーキを作りましたか。」 — 「田中さん【 ? 】作りました。」",
    "options": [
      "が / が",
      "は / は",
      "が / は",
      "は / が"
    ],
    "correctIndex": 0,
    "explanation": "Câu hỏi dùng が (だれが) để hỏi ai làm, thì câu trả lời chỉ đích danh chủ thể cũng dùng が: 「たなかさんが つくりました」.",
    "audioText": "だれが つくりましたか"
  },
  {
    "id": "l22_q_pair_40",
    "lesson": 22,
    "unitId": "l22_pair_wa_vs_ga",
    "format": "subordinate_clause",
    "formatLabel": "Chủ ngữ trong mệnh đề định ngữ",
    "question_kana": "[Câu 40] Trong MỆNH ĐỀ PHỤ / MỆNH ĐỀ ĐỊNH NGỮ bổ nghĩa cho danh từ, chủ ngữ của mệnh đề phụ BẮT BUỘC dùng trợ từ nào?",
    "question_kanji": "[Câu 40] Chủ ngữ trong mệnh đề định ngữ dùng trợ từ nào?",
    "options": [
      "Bắt buộc dùng trợ từ が (Không dùng は)",
      "Bắt buộc dùng trợ từ は",
      "Dùng trợ từ を",
      "Dùng trợ từ で"
    ],
    "correctIndex": 0,
    "explanation": "Trong mệnh đề bổ nghĩa cho danh từ, chủ ngữ của hành động bổ nghĩa BẮT BUỘC dùng 「が」: 「わたし【が】作った ケーキ」 (Chiếc bánh tôi làm), 「彼【が】住んでいる 町」.",
    "audioText": "わたしが つくった ケーキ"
  }
];
