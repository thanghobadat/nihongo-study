// In-memory Mock Database generated from Excel workbooks in tai_lieu/
// Generated on: 2026-06-13 13:52:17
// Serves as the mock database for local API Console testing.

const lessons = [{
    "id":  1,
    "title":  "Bài 1: Hajimemashite",
    "description":  "Bai hoc tu dong nhap tu tep Bai1_Hajimemashite.xlsx"
}];

const vocabulary = [
    {
        "id":  1,
        "lesson_id":  1,
        "hiragana":  "わたし",
        "romaji":  "watashi",
        "vietnamese_meaning":  "Tôi",
        "word_type":  "pronoun",
        "japanese_example":  "私は ミラー です。",
        "example_meaning":  "Tôi là Miller.",
        "mnemonic_tip":  "Mẹo nhớ: Liên tưởng \u0027hoa ta đi\u0027 - Tôi đi hái hoa của ta.",
        "image_url":  ""
    },
    {
        "id":  2,
        "lesson_id":  1,
        "hiragana":  "あなた",
        "romaji":  "anata",
        "vietnamese_meaning":  "Bạn / Anh / Chị",
        "word_type":  "pronoun",
        "japanese_example":  "あなたは 学生 ですか。",
        "example_meaning":  "Bạn là học sinh phải không?",
        "mnemonic_tip":  "Mẹo nhớ: \u0027A, na ta\u0027 - À, nãy ta nói chuyện với Bạn.",
        "image_url":  ""
    },
    {
        "id":  3,
        "lesson_id":  1,
        "hiragana":  "あのひと",
        "romaji":  "ano hito",
        "vietnamese_meaning":  "Người kia / Người đó",
        "word_type":  "pronoun",
        "japanese_example":  "あの人は だれ ですか。",
        "example_meaning":  "Người kia là ai vậy?",
        "mnemonic_tip":  "Mẹo nhớ: \u0027À, nó hí ta\u0027 - Người kia đang hí hửng nhìn ta.",
        "image_url":  ""
    },
    {
        "id":  4,
        "lesson_id":  1,
        "hiragana":  "あのかた",
        "romaji":  "ano kata",
        "vietnamese_meaning":  "Vị kia (kính ngữ)",
        "word_type":  "pronoun",
        "japanese_example":  "あの方は どなた ですか。",
        "example_meaning":  "Vị kia là vị nào vậy?",
        "mnemonic_tip":  "Mẹo nhớ: \u0027À, nó ca ta\u0027 - Vị kia đang ca ngợi ta.",
        "image_url":  ""
    },
    {
        "id":  5,
        "lesson_id":  1,
        "hiragana":  "せんせい",
        "romaji":  "sensei",
        "vietnamese_meaning":  "Giáo viên / Thầy cô",
        "word_type":  "noun",
        "japanese_example":  "ワットさんは 先生 です。",
        "example_meaning":  "Ông Watt là giáo viên.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Sên sấy\u0027 - Thầy giáo sấy con sên trên bảng.",
        "image_url":  ""
    },
    {
        "id":  6,
        "lesson_id":  1,
        "hiragana":  "きょうし",
        "romaji":  "kyoushi",
        "vietnamese_meaning":  "Nhà giáo (chỉ nghề nghiệp)",
        "word_type":  "noun",
        "japanese_example":  "私は 教師 です。",
        "example_meaning":  "Tôi là nhà giáo.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Kiêu sĩ\u0027 - Người nhà giáo không được kiêu ngạo.",
        "image_url":  ""
    },
    {
        "id":  7,
        "lesson_id":  1,
        "hiragana":  "がくせい",
        "romaji":  "gakusei",
        "vietnamese_meaning":  "Học sinh / Sinh viên",
        "word_type":  "noun",
        "japanese_example":  "サントスさんは 学生 です。",
        "example_meaning":  "Anh Santos là sinh viên.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Gác sấy\u0027 - Học sinh gác sách đem đi sấy.",
        "image_url":  ""
    },
    {
        "id":  8,
        "lesson_id":  1,
        "hiragana":  "かいしゃいん",
        "romaji":  "kaishain",
        "vietnamese_meaning":  "Nhân viên công ty",
        "word_type":  "noun",
        "japanese_example":  "ミラーさんは 会社員 です。",
        "example_meaning":  "Anh Miller là nhân viên công ty.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Kai\u0027 (gặp) + \u0027sha\u0027 (xã hội) + \u0027in\u0027 (thành viên).",
        "image_url":  ""
    },
    {
        "id":  9,
        "lesson_id":  1,
        "hiragana":  "しゃいん",
        "romaji":  "shain",
        "vietnamese_meaning":  "Nhân viên (công ty cụ thể)",
        "word_type":  "noun",
        "japanese_example":  "私は IMCの 社員 です。",
        "example_meaning":  "Tôi là nhân viên của công ty IMC.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Sa in\u0027 - Nhân viên bị sa thải vì in ấn sai tài liệu.",
        "image_url":  ""
    },
    {
        "id":  10,
        "lesson_id":  1,
        "hiragana":  "ぎんこういん",
        "romaji":  "ginkouin",
        "vietnamese_meaning":  "Nhân viên ngân hàng",
        "word_type":  "noun",
        "japanese_example":  "山川さんは 銀行員 です。",
        "example_meaning":  "Anh Yamakawa là nhân viên ngân hàng.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Gìn của in\u0027 - Nhân viên gìn giữ của cải in ra ở ngân hàng.",
        "image_url":  ""
    },
    {
        "id":  11,
        "lesson_id":  1,
        "hiragana":  "いしゃ",
        "romaji":  "isha",
        "vietnamese_meaning":  "Bác sĩ",
        "word_type":  "noun",
        "japanese_example":  "あの人は 医者 です。",
        "example_meaning":  "Người kia là bác sĩ.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Y xá\u0027 - Bác sĩ ở y xá chữa bệnh.",
        "image_url":  ""
    },
    {
        "id":  12,
        "lesson_id":  1,
        "hiragana":  "けんきゅうしゃ",
        "romaji":  "kenkyuusha",
        "vietnamese_meaning":  "Nhà nghiên cứu",
        "word_type":  "noun",
        "japanese_example":  "イーさんは 研究者 です。",
        "example_meaning":  "Anh Lee là nhà nghiên cứu.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Kén cự xá\u0027 - Nhà nghiên cứu kén chọn ký túc xá.",
        "image_url":  ""
    },
    {
        "id":  13,
        "lesson_id":  1,
        "hiragana":  "エンジニア",
        "romaji":  "enjinia",
        "vietnamese_meaning":  "Kỹ sư",
        "word_type":  "noun",
        "japanese_example":  "ワンさんは エンジニア です。",
        "example_meaning":  "Anh Wang là kỹ sư.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Em dí bia\u0027 - Kỹ sư công trình bắt em dí ly bia.",
        "image_url":  ""
    },
    {
        "id":  14,
        "lesson_id":  1,
        "hiragana":  "だいがく",
        "romaji":  "daigaku",
        "vietnamese_meaning":  "Trường đại học",
        "word_type":  "noun",
        "japanese_example":  "ここは さくら 大学 です。",
        "example_meaning":  "Đây là trường đại học Sakura.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Đại gác\u0027 - Trường đại học có cái gác lớn.",
        "image_url":  ""
    },
    {
        "id":  15,
        "lesson_id":  1,
        "hiragana":  "びょういん",
        "romaji":  "byouin",
        "vietnamese_meaning":  "Bệnh viện",
        "word_type":  "noun",
        "japanese_example":  "あそこは 神戸 病院 です。",
        "example_meaning":  "Chỗ kia là bệnh viện Kobe.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Biu in\u0027 - Bệnh viện in bill tiền thuốc.",
        "image_url":  ""
    },
    {
        "id":  16,
        "lesson_id":  1,
        "hiragana":  "でんき",
        "romaji":  "denki",
        "vietnamese_meaning":  "Điện / Bóng đèn / Công ty điện",
        "word_type":  "noun",
        "japanese_example":  "パワー 電気の 社員 です。",
        "example_meaning":  "Là nhân viên của công ty Điện lực Power.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Đèn kỳ\u0027 - Bóng đèn này kỳ lạ, lúc sáng lúc tắt.",
        "image_url":  ""
    },
    {
        "id":  17,
        "lesson_id":  1,
        "hiragana":  "だれ",
        "romaji":  "dare",
        "vietnamese_meaning":  "Ai (Hỏi người)",
        "word_type":  "pronoun",
        "japanese_example":  "あの人は 誰 ですか。",
        "example_meaning":  "Người kia là ai?",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Da dê\u0027 - Ai lấy da dê của tôi?",
        "image_url":  ""
    },
    {
        "id":  18,
        "lesson_id":  1,
        "hiragana":  "どなた",
        "romaji":  "donata",
        "vietnamese_meaning":  "Vị nào (kính ngữ)",
        "word_type":  "pronoun",
        "japanese_example":  "あの方は どなた ですか。",
        "example_meaning":  "Vị kia là vị nào vậy?",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Đô na ta\u0027 - Vị nào cho ta tiền đô la?",
        "image_url":  ""
    },
    {
        "id":  19,
        "lesson_id":  1,
        "hiragana":  "さい",
        "romaji":  "sai",
        "vietnamese_meaning":  "...tuổi",
        "word_type":  "noun",
        "japanese_example":  "私は 28 歳 です。",
        "example_meaning":  "Tôi 28 tuổi.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Sai\u0027 - Đếm tuổi sai rồi bạn ơi.",
        "image_url":  ""
    },
    {
        "id":  20,
        "lesson_id":  1,
        "hiragana":  "なんさい",
        "romaji":  "nansai",
        "vietnamese_meaning":  "Mấy tuổi / Bao nhiêu tuổi",
        "word_type":  "pronoun",
        "japanese_example":  "お子さんは 何歳 ですか。",
        "example_meaning":  "Con của bạn mấy tuổi rồi?",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Nản sai\u0027 - Hỏi tuổi hoài nản ghê.",
        "image_url":  ""
    },
    {
        "id":  21,
        "lesson_id":  1,
        "hiragana":  "はい",
        "romaji":  "hai",
        "vietnamese_meaning":  "Vâng / Dạ",
        "word_type":  "greeting",
        "japanese_example":  "はい、そうです。",
        "example_meaning":  "Vâng, đúng vậy.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Hai\u0027 - Vâng, có hai cái.",
        "image_url":  ""
    },
    {
        "id":  22,
        "lesson_id":  1,
        "hiragana":  "いいえ",
        "romaji":  "iie",
        "vietnamese_meaning":  "Không / Không phải",
        "word_type":  "greeting",
        "japanese_example":  "いいえ、そうじゃありません。",
        "example_meaning":  "Không, không phải vậy.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Y y\u0027 - Không, đừng y y chủ quan thế.",
        "image_url":  ""
    },
    {
        "id":  23,
        "lesson_id":  1,
        "hiragana":  "はじめまして",
        "romaji":  "hajimemashite",
        "vietnamese_meaning":  "Rất vui được gặp bạn",
        "word_type":  "greeting",
        "japanese_example":  "初めまして、ミラー です。",
        "example_meaning":  "Rất vui được gặp bạn, tôi là Miller.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Hà giờ mê má chị\u0027 - Lần đầu gặp đã chào hỏi mê luôn.",
        "image_url":  ""
    },
    {
        "id":  24,
        "lesson_id":  1,
        "hiragana":  "からきました",
        "romaji":  "kara kimashita",
        "vietnamese_meaning":  "Đến từ...",
        "word_type":  "greeting",
        "japanese_example":  "ベトナム から来ました。",
        "example_meaning":  "Tôi đến từ Việt Nam.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Cá ra ký tá\u0027 - Đến từ vùng biển xa xôi.",
        "image_url":  ""
    },
    {
        "id":  25,
        "lesson_id":  1,
        "hiragana":  "どうぞよろしく",
        "romaji":  "douzo yoroshiku",
        "vietnamese_meaning":  "Rất mong được sự giúp đỡ",
        "word_type":  "greeting",
        "japanese_example":  "どうぞよろしくお願いします。",
        "example_meaning":  "Rất mong nhận được sự giúp đỡ.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Đỗ rổ vô lịch\u0027 - Rất mong được giúp đỡ xếp rổ đỗ lịch sự.",
        "image_url":  ""
    },
    {
        "id":  26,
        "lesson_id":  1,
        "hiragana":  "しつれいですが",
        "romaji":  "shitsurei desuga",
        "vietnamese_meaning":  "Xin lỗi (khi hỏi chuyện riêng tư)",
        "word_type":  "greeting",
        "japanese_example":  "失礼ですが、お名前は？",
        "example_meaning":  "Xin lỗi, tên bạn là gì?",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Sứt răng đi gà\u0027 - Xin lỗi nha, đi nha sĩ vì sứt răng.",
        "image_url":  ""
    },
    {
        "id":  27,
        "lesson_id":  1,
        "hiragana":  "おnaまえは",
        "romaji":  "onamae wa",
        "vietnamese_meaning":  "Tên bạn là gì?",
        "word_type":  "greeting",
        "japanese_example":  "お名前は 何ですか。",
        "example_meaning":  "Tên của bạn là gì?",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Ổ nằm đây\u0027 - Xin hỏi tên bạn nằm ở đâu?",
        "image_url":  ""
    },
    {
        "id":  28,
        "lesson_id":  1,
        "hiragana":  "こちら",
        "romaji":  "kochira",
        "vietnamese_meaning":  "Đây là / Vị này là",
        "word_type":  "pronoun",
        "japanese_example":  "こちらは ミラーさん です。",
        "example_meaning":  "Đây là anh Miller.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Cô chia ra\u0027 - Vị này là người cô chia quà cho.",
        "image_url":  ""
    },
    {
        "id":  29,
        "lesson_id":  1,
        "hiragana":  "アメリカ",
        "romaji":  "amerika",
        "vietnamese_meaning":  "Nước Mỹ",
        "word_type":  "noun",
        "japanese_example":  "アメリカ からきました。",
        "example_meaning":  "Tôi đến từ nước Mỹ.",
        "mnemonic_tip":  "Âm tương tự America.",
        "image_url":  ""
    },
    {
        "id":  30,
        "lesson_id":  1,
        "hiragana":  "イギリス",
        "romaji":  "igirisu",
        "vietnamese_meaning":  "Nước Anh",
        "word_type":  "noun",
        "japanese_example":  "イギリス人 です。",
        "example_meaning":  "Tôi là người Anh.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Y ghi lịch\u0027 - Nước Anh ghi lịch sử y học.",
        "image_url":  ""
    },
    {
        "id":  31,
        "lesson_id":  1,
        "hiragana":  "インド",
        "romaji":  "indo",
        "vietnamese_meaning":  "Nước Ấn Độ",
        "word_type":  "noun",
        "japanese_example":  "インドから 来ました。",
        "example_meaning":  "Đến từ Ấn Độ.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027In đô\u0027 - Ấn Độ tự in tiền đô la.",
        "image_url":  ""
    },
    {
        "id":  32,
        "lesson_id":  1,
        "hiragana":  "インドネシア",
        "romaji":  "indoneshia",
        "vietnamese_meaning":  "Nước Indonesia",
        "word_type":  "noun",
        "japanese_example":  "インドネシア人 です。",
        "example_meaning":  "Tôi là người Indonesia.",
        "mnemonic_tip":  "Âm tương tự Indonesia.",
        "image_url":  ""
    },
    {
        "id":  33,
        "lesson_id":  1,
        "hiragana":  "かんこく",
        "romaji":  "kankoku",
        "vietnamese_meaning":  "Nước Hàn Quốc",
        "word_type":  "noun",
        "japanese_example":  "韓国 から来ました。",
        "example_meaning":  "Đến từ Hàn Quốc.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Canh cốc\u0027 - Người Hàn Quốc thích ăn canh bằng cốc.",
        "image_url":  ""
    },
    {
        "id":  34,
        "lesson_id":  1,
        "hiragana":  "タイ",
        "romaji":  "tai",
        "vietnamese_meaning":  "Nước Thái Lan",
        "word_type":  "noun",
        "japanese_example":  "タイ人 です。",
        "example_meaning":  "Tôi là người Thái Lan.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Tay\u0027 - Người Thái Lan múa tay dẻo dai.",
        "image_url":  ""
    },
    {
        "id":  35,
        "lesson_id":  1,
        "hiragana":  "ちゅうごく",
        "romaji":  "chuugoku",
        "vietnamese_meaning":  "Nước Trung Quốc",
        "word_type":  "noun",
        "japanese_example":  "中国 から来ました。",
        "example_meaning":  "Tôi đến từ Trung Quốc.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Chung gốc\u0027 - Trung Quốc và Nhật Bản chung gốc chữ Hán.",
        "image_url":  ""
    },
    {
        "id":  36,
        "lesson_id":  1,
        "hiragana":  "ドイツ",
        "romaji":  "doitsu",
        "vietnamese_meaning":  "Nước Đức",
        "word_type":  "noun",
        "japanese_example":  "ドイツの 車 です。",
        "example_meaning":  "Xe hơi của nước Đức.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Đôi giày\u0027 - Nước Đức sản xuất đôi giày da rất bền.",
        "image_url":  ""
    },
    {
        "id":  37,
        "lesson_id":  1,
        "hiragana":  "にほん",
        "romaji":  "nihon",
        "vietnamese_meaning":  "Nước Nhật Bản",
        "word_type":  "noun",
        "japanese_example":  "日本 から来ました。",
        "example_meaning":  "Tôi đến từ Nhật Bản.",
        "mnemonic_tip":  "Mẹo nhớ: \u0027Đi hôn\u0027 - Sang Nhật Bản đi hôn mọi người.",
        "image_url":  ""
    },
    {
        "id":  38,
        "lesson_id":  1,
        "hiragana":  "フランス",
        "romaji":  "furansu",
        "vietnamese_meaning":  "Nước Pháp",
        "word_type":  "noun",
        "japanese_example":  "フランス からきました。",
        "example_meaning":  "Tôi đến từ Pháp.",
        "mnemonic_tip":  "Âm tương tự France.",
        "image_url":  ""
    },
    {
        "id":  39,
        "lesson_id":  1,
        "hiragana":  "ブラジル",
        "romaji":  "burajiru",
        "vietnamese_meaning":  "Nước Brazil",
        "word_type":  "noun",
        "japanese_example":  "ブラジル人 です。",
        "example_meaning":  "Tôi là người Brazil.",
        "mnemonic_tip":  "Âm tương tự Brazil.",
        "image_url":  ""
    },
    {
        "id":  40,
        "lesson_id":  1,
        "hiragana":  "ベトナム",
        "romaji":  "betonamu",
        "vietnamese_meaning":  "Nước Việt Nam",
        "word_type":  "noun",
        "japanese_example":  "ベトナム からきました。",
        "example_meaning":  "Tôi đến từ Việt Nam.",
        "mnemonic_tip":  "Đồng âm Việt Nam.",
        "image_url":  ""
    }
];

const kanji = [
    {
        "id":  1,
        "lesson_id":  1,
        "character":  "私",
        "stroke_count":  "7",
        "onyomi":  "シ (shi)",
        "kunyomi":  "わたし (watashi)",
        "sino_vietnamese":  "TƯ",
        "vietnamese_meaning":  "Tôi, riêng tư",
        "mnemonic_tip":  "Mẹo nhớ: Bên trái là cây lúa (禾), bên phải là bộ khư (厶 - riêng tư). Lúa của riêng tôi.",
        "compounds":  "私 (わたし): Tôi; 私立 (しりつ): Tư lập"
    },
    {
        "id":  2,
        "lesson_id":  1,
        "character":  "人",
        "stroke_count":  "2",
        "onyomi":  "ジン (jin), ニン (nin)",
        "kunyomi":  "ひと (hito)",
        "sino_vietnamese":  "NHÂN",
        "vietnamese_meaning":  "Người",
        "mnemonic_tip":  "Mẹo nhớ: Hình ảnh hai chân người đang đứng dang rộng trên đất.",
        "compounds":  "あの人 (あのひと): Người kia; 日本人 (nihonjin): Người Nhật"
    },
    {
        "id":  3,
        "lesson_id":  1,
        "character":  "先",
        "stroke_count":  "6",
        "onyomi":  "セン (sen)",
        "kunyomi":  "さき (saki)",
        "sino_vietnamese":  "TIÊN",
        "vietnamese_meaning":  "Trước, đi đầu",
        "mnemonic_tip":  "Mẹo nhớ: Đi bộ (bộ nhi ⼉ ở dưới) trên đất (bộ thổ 土 ở trên) thì phải đi Trước.",
        "compounds":  "先生 (せんせい): Giáo viên; 先月 (せんげつ): Tháng trước"
    },
    {
        "id":  4,
        "lesson_id":  1,
        "character":  "生",
        "stroke_count":  "5",
        "onyomi":  "セイ (sei), ショウ (shou)",
        "kunyomi":  "う.まれる (u.mareru)",
        "sino_vietnamese":  "SINH",
        "vietnamese_meaning":  "Sống, sinh ra, học sinh",
        "mnemonic_tip":  "Mẹo nhớ: Hình ảnh một mầm cây nhỏ sinh trưởng trồi lên từ mặt đất.",
        "compounds":  "学生 (がくせい): Học sinh; 先生 (せんせい): Giáo viên"
    },
    {
        "id":  5,
        "lesson_id":  1,
        "character":  "学",
        "stroke_count":  "8",
        "onyomi":  "ガク (gaku)",
        "kunyomi":  "まな.bu (mana.bu)",
        "sino_vietnamese":  "HỌC",
        "vietnamese_meaning":  "Học, học vấn, trường học",
        "mnemonic_tip":  "Mẹo nhớ: Đứa trẻ (子) ở dưới mái nhà (宀) đang học bài.",
        "compounds":  "学生 (がくせい): Học sinh; 大学 (daigaku): Đại học"
    },
    {
        "id":  6,
        "lesson_id":  1,
        "character":  "会",
        "stroke_count":  "6",
        "onyomi":  "カイ (kai), エ (e)",
        "kunyomi":  "あ.u (a.u)",
        "sino_vietnamese":  "HỘI",
        "vietnamese_meaning":  "Hội họp, gặp gỡ",
        "mnemonic_tip":  "Mẹo nhớ: 3 người (bộ nhân 人 và nhị 二) cùng gặp gỡ dưới một mái nhà.",
        "compounds":  "会社 (かいしゃ): Công ty; 会う (a.u): Gặp gỡ"
    },
    {
        "id":  7,
        "lesson_id":  1,
        "character":  "社",
        "stroke_count":  "7",
        "onyomi":  "シャ (sha)",
        "kunyomi":  "yashiro",
        "sino_vietnamese":  "XÃ",
        "vietnamese_meaning":  "Đền thờ, xã hội, công ty",
        "mnemonic_tip":  "Mẹo nhớ: Bộ thị (礻- thần linh) đứng cạnh bộ thổ (土 - đất đai) chỉ đền thờ đất đai công xã.",
        "compounds":  "会社員 (kaishain): Nhân viên công ty; 社会 (shakai): Xã hội"
    },
    {
        "id":  8,
        "lesson_id":  1,
        "character":  "員",
        "stroke_count":  "10",
        "onyomi":  "イン (in)",
        "kunyomi":  "-",
        "sino_vietnamese":  "VIÊN",
        "vietnamese_meaning":  "Thành viên, nhân viên",
        "mnemonic_tip":  "Mẹo nhớ: Miệng (口) của người làm việc quản lý tiền vỏ sò (貝 - bối) là nhân viên.",
        "compounds":  "会社員 (kaishain): Nhân viên công ty; 銀行員 (ginkouin): Nhân viên ngân hàng"
    },
    {
        "id":  9,
        "lesson_id":  1,
        "character":  "日",
        "stroke_count":  "4",
        "onyomi":  "ニチ (nichi), ジツ (jitsu)",
        "kunyomi":  "ひ (hi), か (ka)",
        "sino_vietnamese":  "NHẬT",
        "vietnamese_meaning":  "Ngày, mặt trời, nước Nhật",
        "mnemonic_tip":  "Mẹo nhớ: Hình vẽ mặt trời tròn trịa có một gạch ở giữa.",
        "compounds":  "日本 (にほん): Nhật Bản; 日曜日 (nichiyoubi): Chủ nhật"
    },
    {
        "id":  10,
        "lesson_id":  1,
        "character":  "本",
        "stroke_count":  "5",
        "onyomi":  "ホン (hon)",
        "kunyomi":  "moto",
        "sino_vietnamese":  "BẢN",
        "vietnamese_meaning":  "Sách, cội nguồn, bản chất",
        "mnemonic_tip":  "Mẹo nhớ: Chữ Mộc (木 - cây) thêm một gạch ngang ở gốc chỉ cội nguồn gốc rễ.",
        "compounds":  "本 (ほん): Sách; 日本 (にほん): Nhật Bản"
    },
    {
        "id":  11,
        "lesson_id":  1,
        "character":  "国",
        "stroke_count":  "8",
        "onyomi":  "コク (koku)",
        "kunyomi":  "くに (kuni)",
        "sino_vietnamese":  "QUỐC",
        "vietnamese_meaning":  "Đất nước, quốc gia",
        "mnemonic_tip":  "Mẹo nhớ: Viên ngọc quý (玉) được bao quanh bảo vệ bởi bốn bức tường thành (囗) là đất nước.",
        "compounds":  "外国人 (gaikokujin): Người nước ngoài; Quốc gia (kokka): Quốc gia"
    }
];

const grammar = [
    {
        "id":  1,
        "lesson_id":  1,
        "title":  "N1 は N2 です",
        "meaning":  "N1 là N2",
        "structure":  "Danh từ 1 + は (wa) + Danh từ 2 + です",
        "vietnamese_explanation":  "Mẫu câu khẳng định cơ bản nhất, dùng 100% khi giới thiệu thông tin cá nhân.",
        "japanese_example":  "わたしは マイク・ミラー です。",
        "example_meaning":  "Tôi là Mike Miller.",
        "notes":  "🔊 Nghe"
    },
    {
        "id":  2,
        "lesson_id":  1,
        "title":  "N1 は N2 じゃありません",
        "meaning":  "N1 không phải là N2",
        "structure":  "Danh từ 1 + は + Danh từ 2 + じゃありません / では ありません",
        "vietnamese_explanation":  "Mẫu câu phủ định cơ bản của danh từ, sử dụng liên tục trong đời sống.",
        "japanese_example":  "サントスさんは 学生 じゃありません。",
        "example_meaning":  "Anh Santos không phải là sinh viên.",
        "notes":  "🔊 Nghe"
    },
    {
        "id":  3,
        "lesson_id":  1,
        "title":  "N1 は N2 ですか",
        "meaning":  "N1 có phải là N2 không?",
        "structure":  "Danh từ 1 + は + Danh từ 2 + ですか",
        "vietnamese_explanation":  "Dùng để xác nhận thông tin của người đối diện, cấu trúc hỏi đáp sơ cấp điển hình.",
        "japanese_example":  "ミラーさんは 会社員 ですか。",
        "example_meaning":  "Anh Miller có phải là nhân viên công ty không?",
        "notes":  "🔊 Nghe"
    },
    {
        "id":  4,
        "lesson_id":  1,
        "title":  "N1 も N2 です",
        "meaning":  "N1 cũng là N2",
        "structure":  "Danh từ 1 + も + Danh từ 2 + です",
        "vietnamese_explanation":  "Ứng dụng rất cao khi nói về sự giống nhau giữa các đối tượng trong hội thoại nhóm.",
        "japanese_example":  "わたしも 会社員 です。",
        "example_meaning":  "Tôi cũng là nhân viên công ty.",
        "notes":  "🔊 Nghe"
    },
    {
        "id":  5,
        "lesson_id":  1,
        "title":  "N1 の N2",
        "meaning":  "N2 của N1 / N2 thuộc N1",
        "structure":  "Danh từ 1 + の + Danh từ 2",
        "vietnamese_explanation":  "Mẫu câu nối danh từ cốt lõi, dùng khi giới thiệu công ty hoặc trường học sở tại của mình.",
        "japanese_example":  "わたしは IMCの 社員 です。",
        "example_meaning":  "Tôi là nhân viên của công ty IMC.",
        "notes":  "🔊 Nghe"
    }
];

const kaiwaDialog = [
    {
        "id":  1,
        "lesson_id":  1,
        "speaker":  "ナム",
        "japanese":  "はじめまして。私は ナム です。ベトナム からきました。どうぞよろしく。",
        "romaji":  "🙈 Đang ẩn (Tích chọn hiện)",
        "vietnamese":  "Rất vui được gặp bạn. Tôi là ナム. Tôi đến từ nước ベトナム. Rất mong nhận được sự giúp đỡ."
    },
    {
        "id":  2,
        "lesson_id":  1,
        "speaker":  "ミラー",
        "japanese":  "はじめまして。ミラー です。こちらこそどうぞよろしく。",
        "romaji":  "🙈 Đang ẩn (Tích chọn hiện)",
        "vietnamese":  "Rất vui được gặp bạn. Tôi là ミラー. Chính tôi mới là người cần nhận sự giúp đỡ."
    },
    {
        "id":  3,
        "lesson_id":  1,
        "speaker":  "ナム",
        "japanese":  "失礼 nhưng、ミラーさんは おいくつ（何歳）ですか。",
        "romaji":  "🙈 Đang ẩn (Tích chọn hiện)",
        "vietnamese":  "Xin lỗi bạn ミラー mấy tuổi rồi?"
    },
    {
        "id":  4,
        "lesson_id":  1,
        "speaker":  "ミラー",
        "japanese":  "私は 30歳 です。ナムさんは 学生 ですか。",
        "romaji":  "🙈 Đang ẩn (Tích chọn hiện)",
        "vietnamese":  "Tôi 30 tuổi. Có phải bạn ナム là 学生 không?"
    },
    {
        "id":  5,
        "lesson_id":  1,
        "speaker":  "ナム",
        "japanese":  "いいえ、私は 学生 じゃありません。エンジニア です。",
        "romaji":  "🙈 Đang ẩn (Tích chọn hiện)",
        "vietnamese":  "Không, tôi không phải là 学生. Tôi là kỹ sư."
    },
    {
        "id":  6,
        "lesson_id":  1,
        "speaker":  "ナム",
        "japanese":  "あの人は どなた ですか。",
        "romaji":  "🙈 Đang ẩn (Tích chọn hiện)",
        "vietnamese":  "Người kia là vị nào vậy?"
    },
    {
        "id":  7,
        "lesson_id":  1,
        "speaker":  "ミラー",
        "japanese":  "あの人は サントスさん です。ブラジル人 です。",
        "romaji":  "🙈 Đang ẩn (Tích chọn hiện)",
        "vietnamese":  "Người kia là anh Santos. Anh ấy là người Brazil."
    },
    {
        "id":  8,
        "lesson_id":  1,
        "speaker":  "2. KHU VỰC THIẾT LẬP THÔNG TIN CHỦ ĐỀ 2:",
        "japanese":  "",
        "romaji":  "",
        "vietnamese":  ""
    },
    {
        "id":  9,
        "lesson_id":  1,
        "speaker":  "Tên người thoại C:",
        "japanese":  "ワット",
        "romaji":  "",
        "vietnamese":  ""
    },
    {
        "id":  10,
        "lesson_id":  1,
        "speaker":  "Tên người thoại D:",
        "japanese":  "ワン",
        "romaji":  "",
        "vietnamese":  ""
    }
];

const students = [
  { 
    id: 'user123', 
    email: 'user@nihongoflow.com', 
    display_name: 'H\u1ecdc Vi\u00ean A', 
    created_at: new Date().toISOString() 
  }
];

// In-memory store for user progress: key is "userId:itemType:itemId" -> status
const userProgress = {
  "user123:vocabulary:1": "mastered",
  "user123:vocabulary:2": "mastered",
  "user123:vocabulary:3": "mastered",
  "user123:vocabulary:4": "mastered",
  "user123:vocabulary:5": "mastered",
  "user123:vocabulary:6": "learning",
  "user123:vocabulary:7": "learning",
  "user123:vocabulary:8": "learning",
  "user123:kanji:1": "mastered",
  "user123:kanji:2": "mastered",
  "user123:kanji:3": "learning"
};

// In-memory store for target plans: key is userId -> targetPlanObject
const targetPlan = {
  "user123": {
    user_id: "user123",
    start_date: "2026-06-13",
    end_date: "2026-06-20",
    vocabulary_target: 30,
    kanji_target: 10,
    self_evaluation: "T\u1ed1t",
    updated_at: new Date().toISOString()
  }
};

module.exports = {
  lessons,
  vocabulary,
  kanji,
  grammar,
  kaiwaDialog,
  students,
  userProgress,
  targetPlan
};
