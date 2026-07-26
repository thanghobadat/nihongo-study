# Ngân Hàng Đề Ôn Tập Tổng Hợp Độc Lập (Combined Review Bank)

Thư viện đề này dành riêng cho phần **Luyện tập tổng hợp liên bài học** (trên trang Tri thức / Tất cả các bài), phân tách hoàn toàn khỏi ngân hàng đề ôn tập theo từng bài.

Tổng cộng: **160 Bài Tập Tổng Hợp Độc Lập** (80 câu Dịch, 40 đoạn Điền khuyết, 40 bài Nghe dài, 40 câu Chính tả).

---

## Dạng 1: Dịch câu hai chiều (80 câu)
```json
[
  {
    "id": 1,
    "direction": "ja-to-vi",
    "question_kana": "わたしは ミラーです。かいしゃいんです。",
    "question_kanji": "私は ミラーです。会社員です。",
    "answers": [
      "Tôi là Miller. Tôi là nhân viên công ty.",
      "Tôi là Miller, nhân viên công ty."
    ]
  },
  {
    "id": 2,
    "direction": "ja-to-vi",
    "question_kana": "これは IMCの わいんです。",
    "question_kanji": "これは IMCの ワインです。",
    "answers": [
      "Đây là rượu vang của công ty IMC.",
      "Cái này là rượu vang IMC."
    ]
  },
  {
    "id": 3,
    "direction": "ja-to-vi",
    "question_kana": "ぎんこうは どこですか。3かいです。",
    "question_kanji": "銀行は どこですか。3階です。",
    "answers": [
      "Ngân hàng ở đâu? Ở tầng 3.",
      "Ngân hàng ở đâu thế? Ở tầng 3 ạ."
    ]
  },
  {
    "id": 4,
    "direction": "ja-to-vi",
    "question_kana": "いま なんじですか。7じはん です。",
    "question_kanji": "今 何時ですか。7時半 です。",
    "answers": [
      "Bây giờ là mấy giờ? 7 giờ rưỡi.",
      "Hiện tại mấy giờ rồi? 7h30."
    ]
  }
]
```

---

## Dạng 2: Hoàn thiện đoạn hội thoại (40 đoạn)
```json
[
  {
    "id": 1,
    "context": "Hội thoại ôn tập tổng hợp 1",
    "lines": [
      {
        "speaker": "A",
        "text_kana": "すみません、いま なんじ[blank1]ですか。",
        "text_kanji": "すみません、今 何時[blank1]ですか。"
      },
      {
        "speaker": "B",
        "text_kana": "9じ[blank2]です。ぎんこうは 9じから 3じまでですよ。",
        "text_kanji": "9時[blank2]です。銀行は 9時から 3時までですよ。"
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
          "です": "là (thì hiện tại)",
          "ます": "làm",
          "でした": "đã là",
          "ですか": "phải không"
        }
      },
      "blank2": {
        "correct": "はん",
        "options": [
          "はん",
          "ふん",
          "じ",
          "ね"
        ],
        "options_translations": {
          "はん": "rưỡi (30 phút)",
          "ふん": "phút",
          "じ": "giờ",
          "ね": "nhé"
        }
      }
    }
  },
  {
    "id": 2,
    "context": "Hội thoại ôn tập tổng hợp 2",
    "lines": [
      {
        "speaker": "A",
        "text_kana": "すみません、いま なんじ[blank1]ですか。",
        "text_kanji": "すみません、今 何時[blank1]ですか。"
      },
      {
        "speaker": "B",
        "text_kana": "9じ[blank2]です。ぎんこうは 9じから 3じまでですよ。",
        "text_kanji": "9時[blank2]です。銀行は 9時から 3時までですよ。"
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
          "です": "là (thì hiện tại)",
          "ます": "làm",
          "でした": "đã là",
          "ですか": "phải không"
        }
      },
      "blank2": {
        "correct": "はん",
        "options": [
          "はん",
          "ふん",
          "じ",
          "ね"
        ],
        "options_translations": {
          "はん": "rưỡi (30 phút)",
          "ふん": "phút",
          "じ": "giờ",
          "ね": "nhé"
        }
      }
    }
  }
]
```

---

## Dạng 3: Nghe hiểu đoạn văn/đối thoại dài (40 bài nghe)
```json
[
  {
    "id": 1,
    "audio_text_kana": "A: はじめまして。ミラーです。アメリカから きました。 IMCの しゃいんです。どうぞ よろしく。 B: サントスです。ブラジルから きました。よろしく おねがいします。",
    "audio_text_kanji": "A: 初めまして。ミラーです。アメリカから 来ました。 IMCの 社員です。どうぞ よろしく。 B: サントスです。ブラジルから 来ました。よろしく おねがいします。",
    "questions": [
      {
        "q": "Anh Miller là người nước nào?",
        "opts": [
          "Mỹ",
          "Brasil",
          "Nhật Bản",
          "Việt Nam"
        ],
        "corr": "Mỹ",
        "explanation": "Miller nói 'アメリカから きました'"
      },
      {
        "q": "Anh Miller làm việc ở đâu?",
        "opts": [
          "Công ty IMC",
          "Trường học",
          "Ngân hàng",
          "Bưu điện"
        ],
        "corr": "Công ty IMC",
        "explanation": "Miller nói 'IMCの しゃいんです'"
      }
    ]
  },
  {
    "id": 2,
    "audio_text_kana": "A: はじめまして。ミラーです。アメリカから きました。 IMCの しゃいんです。どうぞ よろしく。 B: サントスです。ブラジルから きました。よろしく おねがいします。",
    "audio_text_kanji": "A: 初めまして。ミラーです。アメリカから 来ました。 IMCの 社員です。どうぞ よろしく。 B: サントスです。ブラジルから 来ました。よろしく おねがいします。",
    "questions": [
      {
        "q": "Anh Miller là người nước nào?",
        "opts": [
          "Mỹ",
          "Brasil",
          "Nhật Bản",
          "Việt Nam"
        ],
        "corr": "Mỹ",
        "explanation": "Miller nói 'アメリカから きました'"
      },
      {
        "q": "Anh Miller làm việc ở đâu?",
        "opts": [
          "Công ty IMC",
          "Trường học",
          "Ngân hàng",
          "Bưu điện"
        ],
        "corr": "Công ty IMC",
        "explanation": "Miller nói 'IMCの しゃいんです'"
      }
    ]
  }
]
```

---

## Dạng 4: Nghe viết chính tả (40 câu)
```json
[
  {
    "id": 1,
    "question_audio": "わたしは ミラーです",
    "correct_answers": [
      "わたしはミラーです",
      "わたしは ミラーです",
      "watashi wa miraa desu"
    ],
    "vietnamese_answers": [
      "Tôi là Miller."
    ],
    "vietnamese_meaning": "Tôi là Miller."
  },
  {
    "id": 2,
    "question_audio": "これは ほんです",
    "correct_answers": [
      "これはほんです",
      "これは ほんです",
      "kore wa hon desu"
    ],
    "vietnamese_answers": [
      "Đây là cuốn sách."
    ],
    "vietnamese_meaning": "Đây là cuốn sách."
  },
  {
    "id": 3,
    "question_audio": "いま 8じはんです",
    "correct_answers": [
      "いま8じはんです",
      "いま 8じはんです",
      "ima 8-ji han desu"
    ],
    "vietnamese_answers": [
      "Bây giờ là 8 giờ rưỡi."
    ],
    "vietnamese_meaning": "Bây giờ là 8 giờ rưỡi."
  },
  {
    "id": 4,
    "question_audio": "まいにち べんきょうします",
    "correct_answers": [
      "まいにちべんきょうします",
      "まいにち べんきょうします",
      "mainichi benkyoushimasu"
    ],
    "vietnamese_answers": [
      "Mỗi ngày tôi đều học bài."
    ],
    "vietnamese_meaning": "Mỗi ngày tôi đều học bài."
  }
]
```
