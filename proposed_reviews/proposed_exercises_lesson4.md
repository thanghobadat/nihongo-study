# Ngân Hàng Bài Tập Ôn Tập Tổng Hợp Đề Xuất - Bài 4 (Minna no Nihongo)

Tổng cộng: **160 Bài Tập Độc Nhất** (80 câu Dịch, 40 đoạn Điền khuyết, 40 bài Nghe hiểu dài, 40 câu Chính tả).

---

## Dạng 1: Dịch câu hai chiều (80 câu)
```json
[
  {
    "id": 1,
    "direction": "ja-to-vi",
    "question_kana": "いま なんじ ですか。",
    "question_kanji": "今 何時 ですか。",
    "answers": [
      "Bây giờ là mấy giờ",
      "Bây giờ là mấy giờ thế",
      "Bây giờ mấy giờ rồi"
    ]
  },
  {
    "id": 2,
    "direction": "ja-to-vi",
    "question_kana": "いま 7じ10ふん です。",
    "question_kanji": "今 7時10分 です。",
    "answers": [
      "Bây giờ là 7 giờ 10 phút",
      "Bây giờ là 7h10"
    ]
  },
  {
    "id": 3,
    "direction": "ja-to-vi",
    "question_kana": "わたしは まいにち 6じはん に おきます。",
    "question_kanji": "私は 毎日 6時半 に 起きます。",
    "answers": [
      "Tôi thức dậy lúc 6 giờ rưỡi mỗi ngày",
      "Hàng ngày tôi thức dậy lúc 6 giờ 30 phút",
      "Mỗi ngày tôi dậy lúc 6 rưỡi"
    ]
  },
  {
    "id": 4,
    "direction": "ja-to-vi",
    "question_kana": "きのうの ばん 11じ に ねました。",
    "question_kanji": "昨日の 晩 11時 に 寝ました。",
    "answers": [
      "Tối qua tôi đã đi ngủ lúc 11 giờ",
      "Tối hôm qua tôi ngủ lúc 11h"
    ]
  },
  {
    "id": 5,
    "direction": "ja-to-vi",
    "question_kana": "あした べんきょうします。",
    "question_kanji": "明日 勉強します。",
    "answers": [
      "Ngày mai tôi sẽ học bài",
      "Ngày mai tôi học",
      "Mai tớ học"
    ]
  }
]
... (Tổng cộng 80 câu)
```

---

## Dạng 2: Hoàn thiện đoạn hội thoại (40 đoạn)
```json
[
  {
    "id": 1,
    "context": "Hỏi giờ hiện tại (Mẫu 1)",
    "lines": [
      {
        "speaker": "A",
        "text_kana": "すみません、いま なんじ[blank1]ですか。",
        "text_kanji": "すみません、今 何時[blank1]ですか。"
      },
      {
        "speaker": "B",
        "text_kana": "ごぜん 9じはん[blank2]です。",
        "text_kanji": "午前 9時半[blank2]です。"
      }
    ],
    "blanks": {
      "blank1": {
        "correct": "です",
        "options": [
          "です",
          "ます",
          "でした",
          "ですか"
        ],
        "options_translations": {
          "です": "là (thì hiện tại lịch sự)",
          "ます": "làm (động từ hiện tại)",
          "でした": "đã là (quá khứ)",
          "ですか": "phải không (câu hỏi)"
        }
      },
      "blank2": {
        "correct": "です",
        "options": [
          "です",
          "から",
          "まで",
          "に"
        ],
        "options_translations": {
          "です": "là (khẳng định hiện tại)",
          "から": "từ (thời điểm bắt đầu)",
          "まで": "đến (thời điểm kết thúc)",
          "に": "vào lúc (mốc thời gian)"
        }
      }
    }
  },
  {
    "id": 2,
    "context": "Hỏi giờ giấc làm việc ngân hàng (Mẫu 2)",
    "lines": [
      {
        "speaker": "A",
        "text_kana": "ぎんこうは なんじ[blank1]なんじまでですか。",
        "text_kanji": "銀行は 何時[blank1]何時までですか。"
      },
      {
        "speaker": "B",
        "text_kana": "9じから 3じ[blank2]です。",
        "text_kanji": "9時から 3時[blank2]です。"
      }
    ],
    "blanks": {
      "blank1": {
        "correct": "から",
        "options": [
          "から",
          "まで",
          "に",
          "と"
        ],
        "options_translations": {
          "から": "từ (mốc bắt đầu)",
          "まで": "đến (mốc kết thúc)",
          "に": "vào lúc",
          "と": "và"
        }
      },
      "blank2": {
        "correct": "まで",
        "options": [
          "まで",
          "から",
          "に",
          "ね"
        ],
        "options_translations": {
          "まで": "đến (mốc kết thúc)",
          "から": "từ (mốc bắt đầu)",
          "に": "vào lúc",
          "ね": "nhé/nhỉ"
        }
      }
    }
  },
  {
    "id": 3,
    "context": "Hỏi thời gian học tập (Mẫu 3)",
    "lines": [
      {
        "speaker": "A",
        "text_kana": "まいあさ なんじ[blank1]おきますか。",
        "text_kanji": "毎朝 何時[blank1]起きますか。"
      },
      {
        "speaker": "B",
        "text_kana": "6じ[blank2]おきます。",
        "text_kanji": "6時[blank2]起きます。"
      }
    ],
    "blanks": {
      "blank1": {
        "correct": "に",
        "options": [
          "に",
          "から",
          "まで",
          "は"
        ],
        "options_translations": {
          "に": "vào lúc (chỉ mốc thời gian)",
          "から": "từ",
          "まで": "đến",
          "は": "chủ ngữ"
        }
      },
      "blank2": {
        "correct": "に",
        "options": [
          "に",
          "と",
          "で",
          "へ"
        ],
        "options_translations": {
          "に": "vào lúc (chỉ mốc thời gian)",
          "と": "và",
          "で": "tại/bằng",
          "へ": "hướng tới"
        }
      }
    }
  }
]
... (Tổng cộng 40 đoạn)
```

---

## Dạng 3: Nghe hiểu đoạn văn/đối thoại dài (40 bài nghe)
```json
[
  {
    "id": 1,
    "audio_text_kana": "A: ミラーさん、まいあさ なんじに おきますか。 B: 6じに おきます。 A: かいしゃは なんじから なんじまでですか。 B: 8じから 4じまで です。 A: きのうの ばん べんきょうしましたか。 B: はい、10じから 12じまで べんきょうしました。",
    "audio_text_kanji": "A: ミラーさん、毎朝 何時に 起きますか。 B: 6時に 起きます。 A: 会社は 何時から 何時までですか。 B: 8時から 4時まで です。 A: 昨日の 晩 勉強しましたか。 B: はい、10時から 12時まで 勉強しました。",
    "questions": [
      {
        "q": "Anh Miller mỗi sáng thức dậy lúc mấy giờ?",
        "opts": [
          "6 giờ",
          "7 giờ",
          "7 giờ",
          "8 giờ"
        ],
        "corr": "6 giờ",
        "explanation": "Trong hội thoại Miller nói '6じに おきます'"
      },
      {
        "q": "Giờ làm việc của công ty anh Miller từ mấy giờ đến mấy giờ?",
        "opts": [
          "8 giờ đến 4 giờ chiều",
          "8 giờ đến 5 giờ chiều",
          "9 giờ đến 6 giờ chiều",
          "7 giờ đến 4 giờ chiều"
        ],
        "corr": "8 giờ đến 4 giờ chiều",
        "explanation": "Trong hội thoại Miller nói '8じから 4じまで'"
      },
      {
        "q": "Tối qua anh Miller học bài trong khoảng thời gian nào?",
        "opts": [
          "Từ 10 giờ đến 12 giờ",
          "Từ 9 giờ đến 11 giờ",
          "Không học",
          "Từ 8 giờ đến 10 giờ"
        ],
        "corr": "Từ 10 giờ đến 12 giờ",
        "explanation": "Miller nói 'はい、10じから 12じまで べんきょうしました'"
      }
    ]
  },
  {
    "id": 2,
    "audio_text_kana": "A: ミラーさん、まいあさ なんじに おきますか。 B: 7じに おきます。 A: かいしゃは なんじから なんじまでですか。 B: 9じから 5じまで です。 A: きのうの ばん べんきょうしましたか。 B: はい、10じから 12じまで べんきょうしました。",
    "audio_text_kanji": "A: ミラーさん、毎朝 何時に 起きますか。 B: 7時に 起きます。 A: 会社は 何時から 何時までですか。 B: 9時から 5時まで です。 A: 昨日の 晩 勉強しましたか。 B: はい、10時から 12時まで 勉強しました。",
    "questions": [
      {
        "q": "Anh Miller mỗi sáng thức dậy lúc mấy giờ?",
        "opts": [
          "7 giờ",
          "8 giờ",
          "7 giờ",
          "8 giờ"
        ],
        "corr": "7 giờ",
        "explanation": "Trong hội thoại Miller nói '7じに おきます'"
      },
      {
        "q": "Giờ làm việc của công ty anh Miller từ mấy giờ đến mấy giờ?",
        "opts": [
          "9 giờ đến 5 giờ chiều",
          "8 giờ đến 5 giờ chiều",
          "9 giờ đến 6 giờ chiều",
          "7 giờ đến 4 giờ chiều"
        ],
        "corr": "9 giờ đến 5 giờ chiều",
        "explanation": "Trong hội thoại Miller nói '9じから 5じまで'"
      },
      {
        "q": "Tối qua anh Miller học bài trong khoảng thời gian nào?",
        "opts": [
          "Từ 10 giờ đến 12 giờ",
          "Từ 9 giờ đến 11 giờ",
          "Không học",
          "Từ 8 giờ đến 10 giờ"
        ],
        "corr": "Từ 10 giờ đến 12 giờ",
        "explanation": "Miller nói 'はい、10じから 12じまで べんきょうしました'"
      }
    ]
  }
]
... (Tổng cộng 40 bài nghe)
```

---

## Dạng 4: Nghe viết chính tả (40 câu)
```json
[
  {
    "id": 1,
    "question_audio": "いま なんじ ですか",
    "correct_answers": [
      "いまなんじですか",
      "いま なんじ ですか",
      "ima nanji desu ka"
    ],
    "vietnamese_answers": [
      "Bây giờ là mấy giờ?"
    ],
    "vietnamese_meaning": "Bây giờ là mấy giờ?"
  },
  {
    "id": 2,
    "question_audio": "いま 9じはん です",
    "correct_answers": [
      "いま9じはんです",
      "いま 9じはん です",
      "ima 9-ji han desu"
    ],
    "vietnamese_answers": [
      "Bây giờ là 9 giờ rưỡi."
    ],
    "vietnamese_meaning": "Bây giờ là 9 giờ rưỡi."
  },
  {
    "id": 3,
    "question_audio": "わたしは まいにち 6じに おきます",
    "correct_answers": [
      "わたしはまいにち6じにおきます",
      "わたしは まいにち 6じに おきます",
      "watashi wa mainichi 6-ji ni okimasu"
    ],
    "vietnamese_answers": [
      "Mỗi ngày tôi dậy lúc 6 giờ."
    ],
    "vietnamese_meaning": "Mỗi ngày tôi dậy lúc 6 giờ."
  },
  {
    "id": 4,
    "question_audio": "きのうの ばん 11じに ねました",
    "correct_answers": [
      "きのうのばん11じにねました",
      "きのうの ばん 11じに ねました",
      "kinou no ban 11-ji ni nemashita"
    ],
    "vietnamese_answers": [
      "Tối qua tôi ngủ lúc 11 giờ."
    ],
    "vietnamese_meaning": "Tối qua tôi ngủ lúc 11 giờ."
  },
  {
    "id": 5,
    "question_audio": "あした べんきょうします",
    "correct_answers": [
      "あしたべんきょうします",
      "あした べんきょうします",
      "ashita benkyoushimasu"
    ],
    "vietnamese_answers": [
      "Ngày mai tôi sẽ học bài."
    ],
    "vietnamese_meaning": "Ngày mai tôi sẽ học bài."
  }
]
... (Tổng cộng 40 câu)
```
