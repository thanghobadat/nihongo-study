export interface CombinedWord {
  id: number;
  word: string;
  romaji: string;
  meaning: string;
  difficulty: 'easy' | 'medium' | 'hard';
  length: number;
}

export const combinedWordsData: CombinedWord[] = [
  {
    "id": 1,
    "word": "じむしょのコピーき",
    "romaji": "jimusho no kopii ki",
    "meaning": "Máy photocopy của văn phòng",
    "difficulty": "medium",
    "length": 9
  },
  {
    "id": 2,
    "word": "いかせます",
    "romaji": "ikasemasu",
    "meaning": "cho đi, bắt đi (sai khiến của いきます)",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 3,
    "word": "けんきゅうしゃ",
    "romaji": "kenkyuusha",
    "meaning": "Nhà nghiên cứu",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 4,
    "word": "とまります",
    "romaji": "tomarimasu",
    "meaning": "trọ lại, ngủ lại [khách sạn]",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 5,
    "word": "うけつけ",
    "romaji": "uketsuke",
    "meaning": "quầy tiếp tân, thường trực",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 6,
    "word": "おります",
    "romaji": "orimasu",
    "meaning": "gấp, bẻ gãy",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 7,
    "word": "れんらくします",
    "romaji": "renrakushimasu",
    "meaning": "liên lạc",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 8,
    "word": "たしかめます",
    "romaji": "tashikamemasu",
    "meaning": "xác nhận, kiểm tra",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 9,
    "word": "ことしのじゅういちがつ",
    "romaji": "kotoshi no juuichigatsu",
    "meaning": "Tháng 11 của năm nay",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 10,
    "word": "やります",
    "romaji": "yarimasu",
    "meaning": "cho (động vật, cây, cấp dưới)",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 11,
    "word": "すみませんでした",
    "romaji": "sumimasendeshita",
    "meaning": "Tôi vô cùng xin lỗi (quá khứ)",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 12,
    "word": "にほんのごはん",
    "romaji": "nihon no gohan",
    "meaning": "Cơm ăn kiểu Nhật Bản",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 13,
    "word": "てれび",
    "romaji": "terebi",
    "meaning": "tivi",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 14,
    "word": "みじかい",
    "romaji": "mijikai",
    "meaning": "ngắn",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 15,
    "word": "めしあがります",
    "romaji": "meshiagarimasu",
    "meaning": "ăn, uống (tôn kính của たべます/のみます)",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 16,
    "word": "つくえ",
    "romaji": "tsukue",
    "meaning": "bàn",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 17,
    "word": "としょかんのとしょカード",
    "romaji": "toshokan no tosho kaado",
    "meaning": "Thẻ thư viện đọc sách",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 18,
    "word": "アメリカのコンピューター",
    "romaji": "amerika no konpyuutaa",
    "meaning": "Máy tính xuất xứ Mỹ",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 19,
    "word": "アメリカ",
    "romaji": "amerika",
    "meaning": "Nước Mỹ",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 20,
    "word": "らじお",
    "romaji": "rajio",
    "meaning": "đài",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 21,
    "word": "えいごのじしょ",
    "romaji": "eigo no jisho",
    "meaning": "Từ điển tiếng Anh",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 22,
    "word": "ごはん",
    "romaji": "gohan",
    "meaning": "cơm, bữa ăn",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 23,
    "word": "びょういんのかんごし",
    "romaji": "byouin no kangoshi",
    "meaning": "Y tá chăm sóc ở bệnh viện",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 24,
    "word": "うりば",
    "romaji": "uriba",
    "meaning": "quầy bán hàng",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 25,
    "word": "あしたのよるしちじはん",
    "romaji": "ashita no yoru shichijihan",
    "meaning": "7 giờ rưỡi tối ngày mai",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 26,
    "word": "のりかえます",
    "romaji": "norikaemasu",
    "meaning": "chuyển [tàu, xe]",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 27,
    "word": "おせわになりました",
    "romaji": "osewaninarimashita",
    "meaning": "cảm ơn vì đã giúp đỡ thời gian qua",
    "difficulty": "medium",
    "length": 9
  },
  {
    "id": 28,
    "word": "ちょこれーと",
    "romaji": "chokorēto",
    "meaning": "sô-cô-la",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 29,
    "word": "こーひー",
    "romaji": "kōhī",
    "meaning": "cà phê",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 30,
    "word": "しゅっぱつします",
    "romaji": "shuppatsushimasu",
    "meaning": "xuất phát, khởi hành",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 31,
    "word": "しごと",
    "romaji": "shigoto",
    "meaning": "công việc, việc làm",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 32,
    "word": "どうぞよろしく",
    "romaji": "douzo yoroshiku",
    "meaning": "Rất mong được sự giúp đỡ",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 33,
    "word": "わたし",
    "romaji": "watashi",
    "meaning": "Tôi",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 34,
    "word": "おんなのひと",
    "romaji": "onna no hito",
    "meaning": "người phụ nữ",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 35,
    "word": "ところ",
    "romaji": "tokoro",
    "meaning": "đúng lúc, thời điểm",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 36,
    "word": "ほめます",
    "romaji": "homemasu",
    "meaning": "khen ngợi",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 37,
    "word": "じどうしゃのキー",
    "romaji": "jidousha no kii",
    "meaning": "Chìa khóa xe ô tô",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 38,
    "word": "かんじ",
    "romaji": "kanji",
    "meaning": "chữ Hán",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 39,
    "word": "スーパーマーケット",
    "romaji": "suupaamaaketto",
    "meaning": "Siêu thị (từ mượn)",
    "difficulty": "medium",
    "length": 9
  },
  {
    "id": 40,
    "word": "します",
    "romaji": "shimasu",
    "meaning": "làm, chơi [thể thao]",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 41,
    "word": "いってきます",
    "romaji": "ittekimasu",
    "meaning": "Tôi đi đây (người đi nói)",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 42,
    "word": "におい",
    "romaji": "nioi",
    "meaning": "mùi hương",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 43,
    "word": "わいん",
    "romaji": "wain",
    "meaning": "rượu vang",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 44,
    "word": "かたろぐ",
    "romaji": "katarogu",
    "meaning": "danh mục sản phẩm",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 45,
    "word": "ならいます",
    "romaji": "naraimasu",
    "meaning": "học, được dạy",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 46,
    "word": "どようび",
    "romaji": "doyoubi",
    "meaning": "thứ bảy",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 47,
    "word": "わかります",
    "romaji": "wakarimasu",
    "meaning": "hiểu, biết",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 48,
    "word": "こんしゅうのどようび",
    "romaji": "konshuu no doyoubi",
    "meaning": "Thứ bảy tuần này",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 49,
    "word": "はかります",
    "romaji": "hakarimasu",
    "meaning": "đo, cân [chiều cao/nặng]",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 50,
    "word": "にほんごのほん",
    "romaji": "nihongo no hon",
    "meaning": "Sách tiếng Nhật",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 51,
    "word": "えいごのべんきょうのへや",
    "romaji": "eigo no benkyou no heya",
    "meaning": "Phòng học tiếng Anh",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 52,
    "word": "けいさつかんのしごと",
    "romaji": "keisatsukan no shigoto",
    "meaning": "Công việc của một chiến sĩ cảnh sát",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 53,
    "word": "すいようび",
    "romaji": "suiyoubi",
    "meaning": "thứ tư",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 54,
    "word": "だします",
    "romaji": "dashimasu",
    "meaning": "lấy ra, nộp [báo cáo]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 55,
    "word": "えれべーたー",
    "romaji": "erebeetaa",
    "meaning": "thang máy",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 56,
    "word": "ひきます",
    "romaji": "hikimasu",
    "meaning": "chơi [nhạc cụ dây: piano, guitar]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 57,
    "word": "つくえのうえのカメラ",
    "romaji": "tsukue no ue no kamera",
    "meaning": "Máy ảnh để trên mặt bàn",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 58,
    "word": "おなか",
    "romaji": "onaka",
    "meaning": "bụng",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 59,
    "word": "らいしゅうのにちようびのあさ",
    "romaji": "raishuu no nichiyoubi no asa",
    "meaning": "Sáng chủ nhật tuần sau",
    "difficulty": "hard",
    "length": 14
  },
  {
    "id": 60,
    "word": "しつれいですが",
    "romaji": "shitsurei desuga",
    "meaning": "Xin lỗi (khi hỏi chuyện riêng tư)",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 61,
    "word": "あんないします",
    "romaji": "annaishimasu",
    "meaning": "hướng dẫn, dẫn đường",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 62,
    "word": "ゆうびんきょくのポスト",
    "romaji": "yuubinkyoku no posuto",
    "meaning": "Hòm thư của bưu điện",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 63,
    "word": "ゆうびんきょく",
    "romaji": "yuubinkyoku",
    "meaning": "bưu điện",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 64,
    "word": "かけます",
    "romaji": "kakemasu",
    "meaning": "gọi [điện thoại]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 65,
    "word": "はじまります",
    "romaji": "hajimarimasu",
    "meaning": "bắt đầu [buổi lễ]",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 66,
    "word": "としょかんのなか",
    "romaji": "toshokan no naka",
    "meaning": "Trong thư viện",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 67,
    "word": "らいしゅうのげつようび",
    "romaji": "raishuu no getsuyoubi",
    "meaning": "Thứ hai tuần sau nữa",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 68,
    "word": "ゆうびんきょくのとなり",
    "romaji": "yuubinkyoku no tonari",
    "meaning": "Bên cạnh bưu điện thành phố",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 69,
    "word": "くるまのキー",
    "romaji": "kuruma no kii",
    "meaning": "Chìa khóa xe hơi",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 70,
    "word": "へります",
    "romaji": "herimasu",
    "meaning": "giảm đi [nhập khẩu]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 71,
    "word": "こんげつのあさ",
    "romaji": "kongetsu no asa",
    "meaning": "Bữa sáng tháng này",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 72,
    "word": "おっしゃいます",
    "romaji": "osshaimasu",
    "meaning": "nói (tôn kính của いいます)",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 73,
    "word": "かいぎしつのエアコン",
    "romaji": "kaigishitsu no eakon",
    "meaning": "Máy điều hòa phòng họp",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 74,
    "word": "もくようび",
    "romaji": "mokuyoubi",
    "meaning": "thứ năm",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 75,
    "word": "しんぱいします",
    "romaji": "shinpaishimasu",
    "meaning": "lo lắng",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 76,
    "word": "いくら",
    "romaji": "ikura",
    "meaning": "bao nhiêu tiền",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 77,
    "word": "かいしゃ",
    "romaji": "kaisha",
    "meaning": "công ty",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 78,
    "word": "はじめまして",
    "romaji": "hajimemashite",
    "meaning": "Rất vui được gặp bạn",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 79,
    "word": "つかいます",
    "romaji": "tsukaimasu",
    "meaning": "sử dụng, dùng",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 80,
    "word": "からきました",
    "romaji": "kara kimashita",
    "meaning": "Đến từ...",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 81,
    "word": "せんたくします",
    "romaji": "sentakushimasu",
    "meaning": "giặt giũ [quần áo]",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 82,
    "word": "さわります",
    "romaji": "sawarimasu",
    "meaning": "chạm, sờ vào [đồ vật]",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 83,
    "word": "きのうのよる",
    "romaji": "kinou no yoru",
    "meaning": "Tối ngày hôm qua",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 84,
    "word": "おなまえは？",
    "romaji": "onamae wa",
    "meaning": "Tên bạn là gì?",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 85,
    "word": "さらりーまん",
    "romaji": "sarariiman",
    "meaning": "nhân viên văn phòng",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 86,
    "word": "かんがえます",
    "romaji": "kangaemasu",
    "meaning": "suy nghĩ, cân nhắc [vấn đề]",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 87,
    "word": "せいひん",
    "romaji": "seihin",
    "meaning": "sản phẩm, thành phẩm",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 88,
    "word": "います",
    "romaji": "imasu",
    "meaning": "có [tồn tại người/động vật]",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 89,
    "word": "つきます",
    "romaji": "tsukimasu",
    "meaning": "đến [nơi chốn, khách sạn]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 90,
    "word": "はっきり",
    "romaji": "hakkiri",
    "meaning": "rõ ràng",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 91,
    "word": "じどうしゃのこうじょう",
    "romaji": "jidousha no koujou",
    "meaning": "Nhà máy sản xuất xe hơi",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 92,
    "word": "らいしゅうのどようびのあさ",
    "romaji": "raishuu no doyoubi no asa",
    "meaning": "Sáng thứ bảy tuần sau",
    "difficulty": "hard",
    "length": 13
  },
  {
    "id": 93,
    "word": "てんきよほうによると",
    "romaji": "tenkiyohou ni yoru to",
    "meaning": "Theo như dự báo thời tiết thì",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 94,
    "word": "にほんごのきょうしつ",
    "romaji": "nihongo no kyoushitsu",
    "meaning": "Lớp học tiếng Nhật Bản",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 95,
    "word": "どうぞよろしくおねがいします",
    "romaji": "douzoyoroshikuonegaishimasu",
    "meaning": "Rất mong nhận được sự giúp đỡ của bạn",
    "difficulty": "hard",
    "length": 14
  },
  {
    "id": 96,
    "word": "きます",
    "romaji": "kimasu",
    "meaning": "đến",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 97,
    "word": "からい",
    "romaji": "karai",
    "meaning": "cay",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 98,
    "word": "なおします",
    "romaji": "naoshimasu",
    "meaning": "sửa chữa, sửa lỗi chính tả",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 99,
    "word": "ようじ",
    "romaji": "youji",
    "meaning": "việc bận, công chuyện",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 100,
    "word": "せんげつのあき",
    "romaji": "sengetsu no aki",
    "meaning": "Mùa thu tháng trước",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 101,
    "word": "つけます",
    "romaji": "tsukemasu",
    "meaning": "bật [điện, điều hòa]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 102,
    "word": "せんもん",
    "romaji": "senmon",
    "meaning": "chuyên môn, chuyên ngành",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 103,
    "word": "せんせい",
    "romaji": "sensei",
    "meaning": "Giáo viên / Thầy cô",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 104,
    "word": "おげんきですか",
    "romaji": "ogenkidesuka",
    "meaning": "Bạn có khỏe không?",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 105,
    "word": "そうじします",
    "romaji": "soujishimasu",
    "meaning": "dọn dẹp vệ sinh",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 106,
    "word": "にほんのじどうしゃがいしゃ",
    "romaji": "nihon no jidoushagaisha",
    "meaning": "Công ty sản xuất ô tô Nhật Bản",
    "difficulty": "hard",
    "length": 13
  },
  {
    "id": 107,
    "word": "まがります",
    "romaji": "magarimasu",
    "meaning": "rẽ, quẹo [phải/trái]",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 108,
    "word": "かいます",
    "romaji": "kaimasu",
    "meaning": "mua",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 109,
    "word": "せんげつのじゅうごにちのあさ",
    "romaji": "sengetsu no juugonichi no asa",
    "meaning": "Sáng ngày 15 tháng trước",
    "difficulty": "hard",
    "length": 14
  },
  {
    "id": 110,
    "word": "はやい",
    "romaji": "hayai",
    "meaning": "nhanh, sớm",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 111,
    "word": "しゃいん",
    "romaji": "shain",
    "meaning": "Nhân viên (công ty cụ thể)",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 112,
    "word": "たります",
    "romaji": "tarimasu",
    "meaning": "đủ, đầy đủ",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 113,
    "word": "きかい",
    "romaji": "kikai",
    "meaning": "máy móc, thiết bị",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 114,
    "word": "こんげつ",
    "romaji": "kongetsu",
    "meaning": "tháng này",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 115,
    "word": "つくえのうえのじしょ",
    "romaji": "tsukue no ue no jisho",
    "meaning": "Quyển từ điển ở trên bàn",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 116,
    "word": "いれます",
    "romaji": "iremasu",
    "meaning": "cho vào, pha [trà/cà phê]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 117,
    "word": "きょうだい",
    "romaji": "kyoudai",
    "meaning": "anh chị em",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 118,
    "word": "おおきい",
    "romaji": "ookii",
    "meaning": "to, lớn",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 119,
    "word": "きれます",
    "romaji": "kiremasu",
    "meaning": "đứt [dây]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 120,
    "word": "だいがくのとしょかん",
    "romaji": "daigaku no toshokan",
    "meaning": "Thư viện của trường đại học",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 121,
    "word": "といれ",
    "romaji": "toire",
    "meaning": "nhà vệ sinh",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 122,
    "word": "ぶっか",
    "romaji": "bukka",
    "meaning": "giá cả, vật giá",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 123,
    "word": "としょかんのべんきょうしつ",
    "romaji": "toshokan no benkyoushitsu",
    "meaning": "Phòng tự học của thư viện",
    "difficulty": "hard",
    "length": 13
  },
  {
    "id": 124,
    "word": "デパートのエスカレーター",
    "romaji": "depaato no esukareetaa",
    "meaning": "Thang cuốn bách hóa",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 125,
    "word": "かえります",
    "romaji": "kaerimasu",
    "meaning": "trở về",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 126,
    "word": "えすかれーたー",
    "romaji": "esukareetaa",
    "meaning": "thang cuốn",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 127,
    "word": "よういします",
    "romaji": "youishimasu",
    "meaning": "chuẩn bị sẵn",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 128,
    "word": "ひろいます",
    "romaji": "hiroimasu",
    "meaning": "nhặt, nhặt lên",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 129,
    "word": "みっつ",
    "romaji": "mittsu",
    "meaning": "ba cái",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 130,
    "word": "もらいます",
    "romaji": "moraimasu",
    "meaning": "nhận",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 131,
    "word": "きっさてんのなか",
    "romaji": "kissaten no naka",
    "meaning": "Trong quán nước/cà phê",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 132,
    "word": "とうちゃくします",
    "romaji": "touchakushimasu",
    "meaning": "đến nơi, cập bến",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 133,
    "word": "めーる",
    "romaji": "meer",
    "meaning": "thư điện tử",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 134,
    "word": "じゅうしょ",
    "romaji": "juusho",
    "meaning": "địa chỉ",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 135,
    "word": "こちら",
    "romaji": "kochira",
    "meaning": "phía này, đằng này (kính ngữ)",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 136,
    "word": "えいごのてがみ",
    "romaji": "eigo no tegami",
    "meaning": "Bức thư tiếng Anh",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 137,
    "word": "しまります",
    "romaji": "shimarimasu",
    "meaning": "đóng [cửa]",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 138,
    "word": "けーたい",
    "romaji": "keetai",
    "meaning": "điện thoại di động",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 139,
    "word": "せつめいします",
    "romaji": "setsumeishimasu",
    "meaning": "giải thích, thuyết minh",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 140,
    "word": "おなじ",
    "romaji": "onaji",
    "meaning": "giống nhau, tương đồng",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 141,
    "word": "あたたかい",
    "romaji": "atatakai",
    "meaning": "ấm áp [thời tiết/cảm giác]",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 142,
    "word": "でんわばんごう",
    "romaji": "denwa bangou",
    "meaning": "Số điện thoại",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 143,
    "word": "いらっしゃいませ",
    "romaji": "irasshaimase",
    "meaning": "Chào mừng quý khách",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 144,
    "word": "ぎんこうのしゃいん",
    "romaji": "ginkou no shain",
    "meaning": "Nhân viên ngân hàng",
    "difficulty": "medium",
    "length": 9
  },
  {
    "id": 145,
    "word": "あうます",
    "romaji": "aumasu",
    "meaning": "gặp [tai nạn]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 146,
    "word": "でんき",
    "romaji": "denki",
    "meaning": "Điện / Bóng đèn / Công ty điện",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 147,
    "word": "えきいんさん",
    "romaji": "ekiinsan",
    "meaning": "Nhân viên nhà ga thân mến",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 148,
    "word": "すもう",
    "romaji": "sumou",
    "meaning": "đấu vật Sumo",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 149,
    "word": "にほんごのじしょ",
    "romaji": "nihongo no jisho",
    "meaning": "Từ điển tiếng Nhật",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 150,
    "word": "べんきょうします",
    "romaji": "benkyoushimasu",
    "meaning": "học, học tập",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 151,
    "word": "デパートのちかのしょくどう",
    "romaji": "depaato no chika no shokudou",
    "meaning": "Nhà ăn dưới tầng hầm trung tâm thương mại",
    "difficulty": "hard",
    "length": 13
  },
  {
    "id": 152,
    "word": "だいがくのきょうじゅ",
    "romaji": "daigaku no kyouju",
    "meaning": "Giáo sư giảng dạy ở đại học",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 153,
    "word": "さくらだいがくのせんせい",
    "romaji": "sakuradaigaku no sensei",
    "meaning": "Giảng viên của trường Đại học Sakura",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 154,
    "word": "うけつけのスタッフ",
    "romaji": "uketsuke no sutaffu",
    "meaning": "Nhân viên lễ tân",
    "difficulty": "medium",
    "length": 9
  },
  {
    "id": 155,
    "word": "すずしい",
    "romaji": "suzushii",
    "meaning": "mát mẻ [thời tiết]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 156,
    "word": "はたらきます",
    "romaji": "hatarakimasu",
    "meaning": "làm việc",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 157,
    "word": "きょうしつのせんせい",
    "romaji": "kyoushitsu no sensei",
    "meaning": "Giáo viên trong phòng học",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 158,
    "word": "じむしょのコンピューター",
    "romaji": "jimusho no konpyuutar",
    "meaning": "Máy vi tính văn phòng",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 159,
    "word": "しつれいしますおじゃまします",
    "romaji": "shitsureishimasuojamashimasu",
    "meaning": "Xin phép tôi vào nhà làm phiền nhé",
    "difficulty": "hard",
    "length": 14
  },
  {
    "id": 160,
    "word": "うちのテレビ",
    "romaji": "uchi no terebi",
    "meaning": "Tivi nhà tôi",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 161,
    "word": "すきー",
    "romaji": "sukii",
    "meaning": "trượt tuyết",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 162,
    "word": "そうです",
    "romaji": "soudesu",
    "meaning": "nghe nói [truyền đạt tin đồn]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 163,
    "word": "うります",
    "romaji": "urimasu",
    "meaning": "bán",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 164,
    "word": "いつつ",
    "romaji": "itsutsu",
    "meaning": "năm cái",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 165,
    "word": "きのうのばんごはんのとき",
    "romaji": "kinou no bangohan no toki",
    "meaning": "Thời điểm ăn tối hôm qua",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 166,
    "word": "よやくします",
    "romaji": "yoyakushimasu",
    "meaning": "đặt trước, hẹn trước",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 167,
    "word": "あのひと",
    "romaji": "ano hito",
    "meaning": "Người kia / Người đó",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 168,
    "word": "おもいます",
    "romaji": "omoimasu",
    "meaning": "nghĩ rằng [suy nghĩ/ý kiến]",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 169,
    "word": "びじゅつかん",
    "romaji": "bijutsukan",
    "meaning": "Bảo tàng mỹ thuật",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 170,
    "word": "かいだん",
    "romaji": "kaidan",
    "meaning": "cầu thang bộ",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 171,
    "word": "はなします",
    "romaji": "hanashimasu",
    "meaning": "nói chuyện, trò chuyện",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 172,
    "word": "いいえ",
    "romaji": "iie",
    "meaning": "Không / Không phải",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 173,
    "word": "くれます",
    "romaji": "kuremasu",
    "meaning": "cho tôi, tặng tôi [hành động cho mình]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 174,
    "word": "きょうしつのなか",
    "romaji": "kyoushitsu no naka",
    "meaning": "Trong lớp học",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 175,
    "word": "やきゅう",
    "romaji": "yakyuu",
    "meaning": "bóng chày",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 176,
    "word": "きょうのよるはちじはん",
    "romaji": "kyou no yoru hachijihan",
    "meaning": "8 giờ rưỡi tối ngày hôm nay",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 177,
    "word": "いけん",
    "romaji": "iken",
    "meaning": "ý kiến, quan điểm",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 178,
    "word": "かんこく",
    "romaji": "kankoku",
    "meaning": "Nước Hàn Quốc",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 179,
    "word": "サントスさんのじどうしゃ",
    "romaji": "santosu san no jidousha",
    "meaning": "Xe hơi của anh Santos",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 180,
    "word": "にほんごのがくせい",
    "romaji": "nihongo no gakusei",
    "meaning": "Học sinh tiếng Nhật",
    "difficulty": "medium",
    "length": 9
  },
  {
    "id": 181,
    "word": "おじゃまします",
    "romaji": "ojamashimasu",
    "meaning": "Xin lỗi đã làm phiền (khi vào nhà)",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 182,
    "word": "どういたしましていいえ",
    "romaji": "douitashimashite iie",
    "meaning": "Không có chi, không sao đâu mà",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 183,
    "word": "われます",
    "romaji": "waremasu",
    "meaning": "vỡ [cốc]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 184,
    "word": "ききましゅ",
    "romaji": "kikimasu",
    "meaning": "nghe",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 185,
    "word": "デパートのちかのスーパー",
    "romaji": "depaato no chika no suupaa",
    "meaning": "Siêu thị dưới tầng hầm bách hóa",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 186,
    "word": "びじゅつかんのロビー",
    "romaji": "bijutsukan no robii",
    "meaning": "Sảnh chờ của bảo tàng mỹ thuật",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 187,
    "word": "よみます",
    "romaji": "yomimasu",
    "meaning": "đọc",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 188,
    "word": "がくせいのべんきょうべや",
    "romaji": "gakusei no benkyoubeya",
    "meaning": "Phòng học tập của học sinh",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 189,
    "word": "おわります",
    "romaji": "owarimasu",
    "meaning": "hết, kết thúc",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 190,
    "word": "おもいだします",
    "romaji": "omoidashimasu",
    "meaning": "nhớ ra, hồi tưởng lại",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 191,
    "word": "いけん",
    "romaji": "iken",
    "meaning": "ý kiến",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 192,
    "word": "おじいさん",
    "romaji": "ojiisan",
    "meaning": "ông nội, ông ngoại, cụ già",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 193,
    "word": "でんしゃのなかのひと",
    "romaji": "densha no naka no hito",
    "meaning": "Người ngồi ở trong tàu điện",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 194,
    "word": "のみもの",
    "romaji": "nomimono",
    "meaning": "đồ uống",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 195,
    "word": "けっせきします",
    "romaji": "kessekishimasu",
    "meaning": "vắng mặt, nghỉ",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 196,
    "word": "えきビルのなかのショップ",
    "romaji": "ekibiru no naka no shoppu",
    "meaning": "Cửa hàng trong tòa nhà nhà ga",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 197,
    "word": "しゃちょうのじどうしゃ",
    "romaji": "shachou no jidousha",
    "meaning": "Xe ô tô của giám đốc",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 198,
    "word": "ぎんこうのしょくいん",
    "romaji": "ginkou no shokuin",
    "meaning": "Nhân viên làm việc tại ngân hàng",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 199,
    "word": "フランス",
    "romaji": "furansu",
    "meaning": "Nước Pháp",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 200,
    "word": "だいがくのせんせい",
    "romaji": "daigaku no sensei",
    "meaning": "Giáo viên đại học",
    "difficulty": "medium",
    "length": 9
  },
  {
    "id": 201,
    "word": "よるのごはん",
    "romaji": "yoru no gohan",
    "meaning": "Bữa cơm tối",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 202,
    "word": "ひとつ",
    "romaji": "hitotsu",
    "meaning": "một cái [đồ vật]",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 203,
    "word": "おします",
    "romaji": "oshimasu",
    "meaning": "bấm, ấn [nút]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 204,
    "word": "びっくりします",
    "romaji": "bikkurishimasu",
    "meaning": "ngạc nhiên, giật mình",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 205,
    "word": "にゅういんします",
    "romaji": "nyuuinshimasu",
    "meaning": "nhập viện",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 206,
    "word": "えきのちかくのホテル",
    "romaji": "eki no chikaku no hoteru",
    "meaning": "Khách sạn nằm gần khu vực nhà ga",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 207,
    "word": "おげんきでいらっしゃいますか",
    "romaji": "ogenkideirasshaimasuka",
    "meaning": "Anh/chị có khỏe không ạ? (Kính ngữ)",
    "difficulty": "hard",
    "length": 14
  },
  {
    "id": 208,
    "word": "いなか",
    "romaji": "inaka",
    "meaning": "quê hương, nông thôn, quê nhà",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 209,
    "word": "いらっしゃいます",
    "romaji": "irasshaimasu",
    "meaning": "đi, đến, ở (tôn kính của いきます/きます/います)",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 210,
    "word": "おたんじょうびおめでとう",
    "romaji": "otanjoubiomedetou",
    "meaning": "Chúc mừng sinh nhật",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 211,
    "word": "いってらっしゃい",
    "romaji": "itterasshai",
    "meaning": "Anh/chị đi nhé (người ở lại nói)",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 212,
    "word": "はきます",
    "romaji": "hakimasu",
    "meaning": "đi [giày, tất], mặc [quần, váy]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 213,
    "word": "てんき",
    "romaji": "tenki",
    "meaning": "thời tiết",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 214,
    "word": "エアコンのスイッチ",
    "romaji": "eakon no suicchi",
    "meaning": "Công tắc máy điều hòa",
    "difficulty": "medium",
    "length": 9
  },
  {
    "id": 215,
    "word": "せんげつ",
    "romaji": "sengetsu",
    "meaning": "tháng trước",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 216,
    "word": "じむしょのしょくいん",
    "romaji": "jimusho no shokuin",
    "meaning": "Nhân viên văn phòng hành chính",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 217,
    "word": "こまります",
    "romaji": "komarimasu",
    "meaning": "khốn đốn, khó khăn",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 218,
    "word": "よっつ",
    "romaji": "yottsu",
    "meaning": "bốn cái",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 219,
    "word": "スーパーのレジのスタッフ",
    "romaji": "suupaa no reji no sutaffu",
    "meaning": "Nhân viên quầy thu ngân siêu thị",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 220,
    "word": "じゅんびします",
    "romaji": "junbishimasu",
    "meaning": "chuẩn bị",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 221,
    "word": "ふべん",
    "romaji": "fuben",
    "meaning": "bất tiện",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 222,
    "word": "でかけます",
    "romaji": "dekakemasu",
    "meaning": "ra ngoài, đi ra ngoài",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 223,
    "word": "ゆうびんきょくのしょくいん",
    "romaji": "yuubinkyoku no shokuin",
    "meaning": "Nhân viên bưu điện",
    "difficulty": "hard",
    "length": 13
  },
  {
    "id": 224,
    "word": "さむい",
    "romaji": "samui",
    "meaning": "lạnh [thời tiết]",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 225,
    "word": "おちます",
    "romaji": "ochimasu",
    "meaning": "rụng, rơi [đồ]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 226,
    "word": "もってきます",
    "romaji": "mottekimasu",
    "meaning": "mang đến",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 227,
    "word": "たちます",
    "romaji": "tachimasu",
    "meaning": "đứng dậy",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 228,
    "word": "くらい",
    "romaji": "kurai",
    "meaning": "tối tăm, u ám",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 229,
    "word": "むかえます",
    "romaji": "mukaemasu",
    "meaning": "đón [người]",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 230,
    "word": "ぎんこうのじむしょのなか",
    "romaji": "ginkou no jimusho no naka",
    "meaning": "Bên trong văn phòng ngân hàng",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 231,
    "word": "えいごのじしょのページ",
    "romaji": "eigo no jisho no peeji",
    "meaning": "Trang từ điển tiếng Anh",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 232,
    "word": "じしょ",
    "romaji": "jisho",
    "meaning": "từ điển",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 233,
    "word": "じてんしゃ",
    "romaji": "jitensha",
    "meaning": "xe đạp",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 234,
    "word": "としょかん",
    "romaji": "toshokan",
    "meaning": "thư viện",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 235,
    "word": "びょういんのロビーのいす",
    "romaji": "byouin no robii no isu",
    "meaning": "Ghế ở sảnh chờ bệnh viện",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 236,
    "word": "すぽーつ",
    "romaji": "supootsu",
    "meaning": "thể thao",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 237,
    "word": "どういたしまして",
    "romaji": "douitashimashite",
    "meaning": "Không có chi / Đừng khách sáo",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 238,
    "word": "さきます",
    "romaji": "sakimasu",
    "meaning": "nở [hoa]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 239,
    "word": "どうぞおげんきで",
    "romaji": "douzoogenkide",
    "meaning": "chúc anh/chị luôn mạnh khỏe [lời chúc đi xa]",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 240,
    "word": "さしあげます",
    "romaji": "sashiagemasu",
    "meaning": "tặng, biếu (kính ngữ của あげます)",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 241,
    "word": "かいぎしつのなか",
    "romaji": "kaigishitsu no naka",
    "meaning": "Trong phòng họp",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 242,
    "word": "あそびます",
    "romaji": "asobimasu",
    "meaning": "chơi, vui chơi",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 243,
    "word": "きます",
    "romaji": "kimasu",
    "meaning": "mặc [áo sơ mi, áo khoác]",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 244,
    "word": "あさごはん",
    "romaji": "asagohan",
    "meaning": "cơm sáng",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 245,
    "word": "たいしかん",
    "romaji": "taishikan",
    "meaning": "đại sứ quán",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 246,
    "word": "かばんのなか",
    "romaji": "kaban no naka",
    "meaning": "Bên trong cặp sách học tập",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 247,
    "word": "おじゃましました",
    "romaji": "ojamashimashita",
    "meaning": "Tôi đã làm phiền nhiều (khi về)",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 248,
    "word": "かいしゃのしょくいん",
    "romaji": "kaisha no shokuin",
    "meaning": "Nhân viên của công ty",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 249,
    "word": "りょうり",
    "romaji": "ryouri",
    "meaning": "món ăn, nấu ăn",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 250,
    "word": "さそいます",
    "romaji": "sasoimasu",
    "meaning": "rủ rê, mời mọc",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 251,
    "word": "たおれます",
    "romaji": "taoremasu",
    "meaning": "đổ, ngã [nhà/cây]",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 252,
    "word": "エレベーター",
    "romaji": "erebeetaa",
    "meaning": "Thang máy di chuyển",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 253,
    "word": "かります",
    "romaji": "karimasu",
    "meaning": "mượn, vay",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 254,
    "word": "いいます",
    "romaji": "iimasu",
    "meaning": "nói",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 255,
    "word": "にほんごのクラスルーム",
    "romaji": "nihongo no kurasuruumu",
    "meaning": "Lớp học tiếng Nhật",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 256,
    "word": "しょくどうのなか",
    "romaji": "shokudou no naka",
    "meaning": "Trong nhà ăn",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 257,
    "word": "としょかんのしょくどう",
    "romaji": "toshokan no shokudou",
    "meaning": "Nhà ăn của thư viện",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 258,
    "word": "かえします",
    "romaji": "kaeshimasu",
    "meaning": "trả lại [đồ vật]",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 259,
    "word": "そのままにします",
    "romaji": "sonomananishimasu",
    "meaning": "để nguyên như thế",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 260,
    "word": "こんしゅうのきんようびのよる",
    "romaji": "konshuu no kinyoubi no yoru",
    "meaning": "Tối thứ sáu tuần này",
    "difficulty": "hard",
    "length": 14
  },
  {
    "id": 261,
    "word": "やすい",
    "romaji": "yasui",
    "meaning": "dễ làm gì đó",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 262,
    "word": "とおります",
    "romaji": "toorimasu",
    "meaning": "đi qua [đường]",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 263,
    "word": "ちゅうごく",
    "romaji": "chuugoku",
    "meaning": "Nước Trung Quốc",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 264,
    "word": "はじめまして",
    "romaji": "hajimemashite",
    "meaning": "Rất hân hạnh được gặp bạn",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 265,
    "word": "ろびー",
    "romaji": "robii",
    "meaning": "hành lang, đại sảnh",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 266,
    "word": "がっこうのしょくどう",
    "romaji": "gakkou no shokudou",
    "meaning": "Nhà ăn của trường học",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 267,
    "word": "きょうし",
    "romaji": "kyoushi",
    "meaning": "Nhà giáo (chỉ nghề nghiệp)",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 268,
    "word": "かけます",
    "romaji": "kakemasu",
    "meaning": "khóa [cửa], treo",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 269,
    "word": "でんしゃのなかのえきいん",
    "romaji": "densha no naka no ekiin",
    "meaning": "Nhân viên tàu điện trong toa",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 270,
    "word": "うけます",
    "romaji": "ukemasu",
    "meaning": "dự thi, nhận [kỳ thi]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 271,
    "word": "はいしゃ",
    "romaji": "haisha",
    "meaning": "nha sĩ",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 272,
    "word": "はります",
    "romaji": "harimasu",
    "meaning": "dán, treo",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 273,
    "word": "きっぷ",
    "romaji": "kippu",
    "meaning": "vé",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 274,
    "word": "らいねんのじゅうにがつ",
    "romaji": "rainen no juunigatsu",
    "meaning": "Tháng 12 của năm sau",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 275,
    "word": "ねむい",
    "romaji": "nemui",
    "meaning": "buồn ngủ",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 276,
    "word": "ミラーさんのコンピューター",
    "romaji": "miraa san no konpyuutaa",
    "meaning": "Máy tính của anh Miller",
    "difficulty": "hard",
    "length": 13
  },
  {
    "id": 277,
    "word": "きょうのよる",
    "romaji": "kyou no yoru",
    "meaning": "Tối ngày hôm nay",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 278,
    "word": "ここのつ",
    "romaji": "kokonotsu",
    "meaning": "chín cái",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 279,
    "word": "ひこうき",
    "romaji": "hikouki",
    "meaning": "máy bay",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 280,
    "word": "けっこんします",
    "romaji": "kekkonshimasu",
    "meaning": "kết hôn, cưới",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 281,
    "word": "けいさつかんのパトカー",
    "romaji": "keisatsukan no patokaa",
    "meaning": "Xe tuần tra của cảnh sát",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 282,
    "word": "えいごのべんきょうのじかん",
    "romaji": "eigo no benkyou no jikan",
    "meaning": "Thời gian học tiếng Anh",
    "difficulty": "hard",
    "length": 13
  },
  {
    "id": 283,
    "word": "せいこうします",
    "romaji": "seikoushimasu",
    "meaning": "thành công",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 284,
    "word": "おめでとうございます",
    "romaji": "omedetougozaimasu",
    "meaning": "Xin chúc mừng bạn",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 285,
    "word": "からだ",
    "romaji": "karada",
    "meaning": "cơ thể, người",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 286,
    "word": "ごうかくします",
    "romaji": "goukakushimasu",
    "meaning": "đỗ, vượt qua [kỳ thi]",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 287,
    "word": "たいいんします",
    "romaji": "taiinshimasu",
    "meaning": "xuất viện",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 288,
    "word": "えあこん",
    "romaji": "eakon",
    "meaning": "máy điều hòa",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 289,
    "word": "にくい",
    "romaji": "nikui",
    "meaning": "khó làm gì đó",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 290,
    "word": "とれます",
    "romaji": "toremasu",
    "meaning": "tuột [cúc áo]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 291,
    "word": "デパートのレストラン",
    "romaji": "depaato no resutoran",
    "meaning": "Nhà hàng ở cửa hàng bách hóa",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 292,
    "word": "かぞえます",
    "romaji": "kazoemasu",
    "meaning": "đếm",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 293,
    "word": "げつようび",
    "romaji": "getsuyoubi",
    "meaning": "thứ hai",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 294,
    "word": "なくします",
    "romaji": "nakushimasu",
    "meaning": "mất, đánh mất",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 295,
    "word": "かざります",
    "romaji": "kazarimasu",
    "meaning": "trang trí",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 296,
    "word": "おやすみなさい",
    "romaji": "oyasuminasai",
    "meaning": "Chúc ngủ ngon",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 297,
    "word": "まにあいます",
    "romaji": "maniaimasu",
    "meaning": "kịp [giờ]",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 298,
    "word": "せんしゅう",
    "romaji": "senshuu",
    "meaning": "tuần trước",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 299,
    "word": "しょうがっこう",
    "romaji": "shougakkou",
    "meaning": "Trường tiểu học",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 300,
    "word": "せいりします",
    "romaji": "seirishimasu",
    "meaning": "sắp xếp, chỉnh đốn",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 301,
    "word": "いそぎます",
    "romaji": "isogimasu",
    "meaning": "vội, vội vã, gấp rút",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 302,
    "word": "くみたてます",
    "romaji": "kumitatemasu",
    "meaning": "lắp ráp, lắp đặt",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 303,
    "word": "あきらめます",
    "romaji": "akiramemasu",
    "meaning": "từ bỏ, bỏ cuộc",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 304,
    "word": "ぼーるぺん",
    "romaji": "bōrupen",
    "meaning": "bút bi",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 305,
    "word": "てつだいます",
    "romaji": "tetsudaimasu",
    "meaning": "giúp đỡ [công việc]",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 306,
    "word": "びじゅつかんのうけつけ",
    "romaji": "bijutsukan no uketsuke",
    "meaning": "Quầy lễ tân bảo tàng mỹ thuật",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 307,
    "word": "てちょう",
    "romaji": "techō",
    "meaning": "sổ tay",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 308,
    "word": "かめら",
    "romaji": "kamera",
    "meaning": "máy ảnh",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 309,
    "word": "めいし",
    "romaji": "meishi",
    "meaning": "danh thiếp",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 310,
    "word": "うんどうします",
    "romaji": "undoushimasu",
    "meaning": "vận động, tập thể dục",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 311,
    "word": "ごちそうさま",
    "romaji": "gochisousama",
    "meaning": "Cảm ơn vì bữa ăn",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 312,
    "word": "だいがくのじむしょのひと",
    "romaji": "daigaku no jimusho no hito",
    "meaning": "Người ở văn phòng đại học",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 313,
    "word": "でんきのがいしゃ",
    "romaji": "denki no gaisha",
    "meaning": "Công ty điện lực",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 314,
    "word": "ゆうびんきょく",
    "romaji": "yuubinkyoku",
    "meaning": "Bưu điện",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 315,
    "word": "やすみます",
    "romaji": "yasumimasu",
    "meaning": "nghỉ, nghỉ ngơi",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 316,
    "word": "あしたのひるごはんのじかん",
    "romaji": "ashita no hirugohan no jikan",
    "meaning": "Giờ ăn trưa của ngày mai",
    "difficulty": "hard",
    "length": 13
  },
  {
    "id": 317,
    "word": "じこくひょう",
    "romaji": "jikokuhyou",
    "meaning": "bảng giờ chạy xe/tàu",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 318,
    "word": "うしろ",
    "romaji": "ushiro",
    "meaning": "sau, phía sau",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 319,
    "word": "えいごのせんせい",
    "romaji": "eigo no sensei",
    "meaning": "Giáo viên tiếng Anh",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 320,
    "word": "こうとうがっこう",
    "romaji": "koutougakkou",
    "meaning": "Trường trung học phổ thông",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 321,
    "word": "しっぱいします",
    "romaji": "shippaishimasu",
    "meaning": "thất bại, trượt [kỳ thi]",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 322,
    "word": "せつめいしょ",
    "romaji": "setsumeisho",
    "meaning": "bản hướng dẫn sử dụng",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 323,
    "word": "つくえのうえのペンとノート",
    "romaji": "tsukue no ue no pen to nooto",
    "meaning": "Bút và vở ở trên mặt bàn",
    "difficulty": "hard",
    "length": 13
  },
  {
    "id": 324,
    "word": "つかれます",
    "romaji": "tsukaremasu",
    "meaning": "mệt mỏi",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 325,
    "word": "どうぞよろしくおねがいします",
    "romaji": "douzo yoroshiku onegaishimasu",
    "meaning": "Rất mong nhận được sự giúp đỡ",
    "difficulty": "hard",
    "length": 14
  },
  {
    "id": 326,
    "word": "しかります",
    "romaji": "shikarimasu",
    "meaning": "mắng mỏ, trách mắng",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 327,
    "word": "あります",
    "romaji": "arimasu",
    "meaning": "có [sở hữu/tồn tại đồ vật]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 328,
    "word": "かわります",
    "romaji": "kawarimasu",
    "meaning": "thay đổi [màu sắc]",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 329,
    "word": "うんてんします",
    "romaji": "untenshimasu",
    "meaning": "lái xe",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 330,
    "word": "いただきます",
    "romaji": "itadakemasu",
    "meaning": "ăn, uống, nhận (khiêm nhường của たべます/のみます/もらいます)",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 331,
    "word": "としょかんのほん",
    "romaji": "toshokan no hon",
    "meaning": "Sách mượn ở thư viện",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 332,
    "word": "しりょう",
    "romaji": "shiryou",
    "meaning": "tài liệu, dữ liệu",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 333,
    "word": "りゅうがくします",
    "romaji": "ryuugakushimasu",
    "meaning": "du học, học nước ngoài",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 334,
    "word": "ふるい",
    "romaji": "furui",
    "meaning": "cũ, cổ",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 335,
    "word": "としょかんのじむしょ",
    "romaji": "toshokan no jimusho",
    "meaning": "Văn phòng quản lý thư viện",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 336,
    "word": "かいしゃいん",
    "romaji": "kaishain",
    "meaning": "Nhân viên công ty",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 337,
    "word": "ふやす",
    "romaji": "fuyasu",
    "meaning": "làm tăng lên",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 338,
    "word": "ほんやくします",
    "romaji": "honyakushimasu",
    "meaning": "dịch thuật [viết]",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 339,
    "word": "ねます",
    "romaji": "nemasu",
    "meaning": "ngủ, đi ngủ",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 340,
    "word": "しんせつ",
    "romaji": "shinsetsu",
    "meaning": "thân thiện, tốt bụng",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 341,
    "word": "あしたのあさごはんのメニュー",
    "romaji": "ashita no asagohan no menyuu",
    "meaning": "Thực đơn bữa sáng mai",
    "difficulty": "hard",
    "length": 14
  },
  {
    "id": 342,
    "word": "インドネシア",
    "romaji": "indoneshia",
    "meaning": "Nước Indonesia",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 343,
    "word": "しゅみ",
    "romaji": "shuumi",
    "meaning": "sở thích",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 344,
    "word": "らいげつのにじゅうにちのよる",
    "romaji": "raigetsu no nijuunichi no yoru",
    "meaning": "Tối ngày 20 tháng sau",
    "difficulty": "hard",
    "length": 14
  },
  {
    "id": 345,
    "word": "ずいぶん",
    "romaji": "zuibun",
    "meaning": "khá, tương đối",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 346,
    "word": "ゆうびんきょくのロビー",
    "romaji": "yuubinkyoku no robii",
    "meaning": "Sảnh chờ của bưu điện",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 347,
    "word": "ちゅうがっこう",
    "romaji": "chuugakkou",
    "meaning": "Trường trung học cơ sở",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 348,
    "word": "かばんのなかのじしょとほん",
    "romaji": "kaban no naka no jisho to hon",
    "meaning": "Từ điển và sách trong cặp",
    "difficulty": "hard",
    "length": 13
  },
  {
    "id": 349,
    "word": "かけます",
    "romaji": "kakemasu",
    "meaning": "treo [áo]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 350,
    "word": "あさのごはん",
    "romaji": "asa no gohan",
    "meaning": "Bữa cơm sáng",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 351,
    "word": "かいものします",
    "romaji": "kaimonoshimasu",
    "meaning": "mua sắm",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 352,
    "word": "きそく",
    "romaji": "kisoku",
    "meaning": "quy tắc, luật lệ",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 353,
    "word": "かみます",
    "romaji": "kamimasu",
    "meaning": "nhai, cắn",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 354,
    "word": "かばんのなかのケータイ",
    "romaji": "kaban no naka no keitai",
    "meaning": "Điện thoại di động trong túi xách",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 355,
    "word": "らいげつのにじゅうにち",
    "romaji": "raigetsu no nijuunichi",
    "meaning": "Ngày 20 của tháng sau",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 356,
    "word": "ざっし",
    "romaji": "zasshi",
    "meaning": "tạp chí",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 357,
    "word": "わたしのカメラ",
    "romaji": "watashi no kamera",
    "meaning": "Máy ảnh của tôi",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 358,
    "word": "おくに",
    "romaji": "okuni",
    "meaning": "đất nước (của bạn)",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 359,
    "word": "おおい",
    "romaji": "ooi",
    "meaning": "nhiều [người]",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 360,
    "word": "にほんごのがくしゅうしゃ",
    "romaji": "nihongo no gakushuusha",
    "meaning": "Người học tiếng Nhật Bản",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 361,
    "word": "どなたですか",
    "romaji": "donata de su ka",
    "meaning": "Ai thế ạ?",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 362,
    "word": "いきます",
    "romaji": "ikimasu",
    "meaning": "đi",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 363,
    "word": "いたします",
    "romaji": "itashimasu",
    "meaning": "làm (khiêm nhường của します)",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 364,
    "word": "しまいます",
    "romaji": "shimaimasu",
    "meaning": "cất vào, để vào",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 365,
    "word": "あきます",
    "romaji": "akimasu",
    "meaning": "mở [cửa]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 366,
    "word": "のります",
    "romaji": "norimasu",
    "meaning": "lên [tàu, xe]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 367,
    "word": "でます",
    "romaji": "demasu",
    "meaning": "ra, tốt nghiệp [đại học]",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 368,
    "word": "かします",
    "romaji": "kashimasu",
    "meaning": "cho mượn, cho vay",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 369,
    "word": "なんじ",
    "romaji": "nanji",
    "meaning": "mấy giờ",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 370,
    "word": "わたります",
    "romaji": "watarimasu",
    "meaning": "qua, băng qua [đường/cầu]",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 371,
    "word": "ちかい",
    "romaji": "chikai",
    "meaning": "gần",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 372,
    "word": "わすれます",
    "romaji": "wasuremasu",
    "meaning": "quên",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 373,
    "word": "けんきゅうします",
    "romaji": "kenkyuushimasu",
    "meaning": "nghiên cứu",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 374,
    "word": "すいます",
    "romaji": "suimasu",
    "meaning": "hút [thuốc lá]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 375,
    "word": "しょうかいします",
    "romaji": "shoukaishimasu",
    "meaning": "giới thiệu [người/việc]",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 376,
    "word": "きせつ",
    "romaji": "kisetsu",
    "meaning": "mùa, thời tiết",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 377,
    "word": "まちます",
    "romaji": "machimasu",
    "meaning": "đợi, chờ đợi",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 378,
    "word": "みます",
    "romaji": "mimasu",
    "meaning": "xem, khám bệnh",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 379,
    "word": "えきまえのひろば",
    "romaji": "ekimae no hiroba",
    "meaning": "Quảng trường trước nhà ga",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 380,
    "word": "まもります",
    "romaji": "mamorimasu",
    "meaning": "bảo vệ, tuân thủ [luật]",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 381,
    "word": "ひとり",
    "romaji": "hitori",
    "meaning": "một người",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 382,
    "word": "あけましておめでとう",
    "romaji": "akemashiteomedetou",
    "meaning": "Chúc mừng năm mới",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 383,
    "word": "うけつけのひと",
    "romaji": "uketsuke no hito",
    "meaning": "Người lễ tân",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 384,
    "word": "としょかんのかしだしカード",
    "romaji": "toshokan no kashidashi kaado",
    "meaning": "Thẻ mượn sách thư viện",
    "difficulty": "hard",
    "length": 13
  },
  {
    "id": 385,
    "word": "やっつ",
    "romaji": "yattsu",
    "meaning": "tám cái",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 386,
    "word": "しにます",
    "romaji": "shinimasu",
    "meaning": "chết",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 387,
    "word": "びじゅつかんのしょくいん",
    "romaji": "bijutsukan no shokuin",
    "meaning": "Nhân viên bảo tàng nghệ thuật",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 388,
    "word": "なんさいですか",
    "romaji": "nan sai de su ka",
    "meaning": "Bạn bao nhiêu tuổi?",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 389,
    "word": "びじゅつ",
    "romaji": "bijutsu",
    "meaning": "mỹ thuật",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 390,
    "word": "むっつ",
    "romaji": "muttsu",
    "meaning": "sáu cái",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 391,
    "word": "いただきます",
    "romaji": "itadakemasu",
    "meaning": "nhận (khiêm nhường của もらいます)",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 392,
    "word": "ぱすぽーと",
    "romaji": "pasupooto",
    "meaning": "hộ chiếu",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 393,
    "word": "きょうしつ",
    "romaji": "kyoushitsu",
    "meaning": "lớp học, phòng học",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 394,
    "word": "ぎんこういん",
    "romaji": "ginkouin",
    "meaning": "Nhân viên ngân hàng",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 395,
    "word": "ひとりで",
    "romaji": "hitoride",
    "meaning": "một mình",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 396,
    "word": "つくえのうえ",
    "romaji": "tsukue no ue",
    "meaning": "Ở trên mặt bàn",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 397,
    "word": "すみます",
    "romaji": "sumimasu",
    "meaning": "sống, cư trú [ở đâu]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 398,
    "word": "やめます",
    "romaji": "yamemasu",
    "meaning": "bỏ, thôi [làm việc]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 399,
    "word": "とじます",
    "romaji": "tojimasu",
    "meaning": "đóng, nhắm [mắt, sách]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 400,
    "word": "とめます",
    "romaji": "tomemasu",
    "meaning": "dừng [xe], đỗ [xe]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 401,
    "word": "しんじる",
    "romaji": "shinjiru",
    "meaning": "tin tưởng",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 402,
    "word": "すわります",
    "romaji": "suwarimasu",
    "meaning": "ngồi xuống",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 403,
    "word": "もしかしたら",
    "romaji": "moshikashitara",
    "meaning": "có thể, biết đâu là",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 404,
    "word": "うたいます",
    "romaji": "utaimasu",
    "meaning": "hát",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 405,
    "word": "そふと",
    "romaji": "sofuto",
    "meaning": "phần mềm máy tính",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 406,
    "word": "おくにはどちら",
    "romaji": "o ku ni wa do chi ra",
    "meaning": "Đất nước của bạn ở đâu?",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 407,
    "word": "すーぱー",
    "romaji": "suupaa",
    "meaning": "siêu thị",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 408,
    "word": "むかえます",
    "romaji": "mukaemasu",
    "meaning": "đón tiếp",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 409,
    "word": "しゅっちょうします",
    "romaji": "shucchoushimasu",
    "meaning": "đi công tác",
    "difficulty": "medium",
    "length": 9
  },
  {
    "id": 410,
    "word": "としょかんのほんのたな",
    "romaji": "toshokan no hon no tana",
    "meaning": "Giá sách của thư viện",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 411,
    "word": "のぼります",
    "romaji": "noborimasu",
    "meaning": "leo [núi]",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 412,
    "word": "しつれいします",
    "romaji": "shitsureishimasu",
    "meaning": "Thất lễ / Xin lỗi làm phiền",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 413,
    "word": "あしたのあさ",
    "romaji": "ashita no asa",
    "meaning": "Sáng ngày mai",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 414,
    "word": "れいぞうこ",
    "romaji": "reizouko",
    "meaning": "tủ lạnh",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 415,
    "word": "そちら",
    "romaji": "sochira",
    "meaning": "phía đó, đằng đó (kính ngữ)",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 416,
    "word": "そだてます",
    "romaji": "sodatemasu",
    "meaning": "nuôi nấng, dạy dỗ",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 417,
    "word": "せんげつのじゅうごにち",
    "romaji": "sengetsu no juugonichi",
    "meaning": "Ngày 15 của tháng trước",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 418,
    "word": "わるい",
    "romaji": "warui",
    "meaning": "xấu, tồi",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 419,
    "word": "みがきます",
    "romaji": "migakimasu",
    "meaning": "đánh [răng], mài bóng",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 420,
    "word": "スーパーのなか",
    "romaji": "suupaa no naka",
    "meaning": "Trong siêu thị",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 421,
    "word": "おくにはどちら",
    "romaji": "okuni wa dochira",
    "meaning": "Đất nước của bạn ở đâu?",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 422,
    "word": "けんきゅうじょのけんきゅうしゃ",
    "romaji": "kenkyuujono kenkyuusha",
    "meaning": "Nhà nghiên cứu tại viện nghiên cứu",
    "difficulty": "hard",
    "length": 15
  },
  {
    "id": 423,
    "word": "おかえりなさい",
    "romaji": "okaerinasai",
    "meaning": "Anh/chị đã về rồi ạ",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 424,
    "word": "ななつ",
    "romaji": "nanatsu",
    "meaning": "bảy cái",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 425,
    "word": "きのうのあさろくじはん",
    "romaji": "kinou no asa rokujihan",
    "meaning": "6 giờ rưỡi sáng hôm qua",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 426,
    "word": "コンピューターのがいしゃ",
    "romaji": "konpyuutaano gaisha",
    "meaning": "Công ty về máy tính",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 427,
    "word": "しつれいですが",
    "romaji": "shitsurei de su ga",
    "meaning": "Xin lỗi (khi muốn hỏi thông tin)...",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 428,
    "word": "えきいんのしごと",
    "romaji": "ekiin no shigoto",
    "meaning": "Công việc của nhân viên nhà ga",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 429,
    "word": "しゅっせきします",
    "romaji": "shussekishimasu",
    "meaning": "tham gia, có mặt",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 430,
    "word": "つづけます",
    "romaji": "tuduketemasu",
    "meaning": "tiếp tục",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 431,
    "word": "ロビーのいす",
    "romaji": "robii no isu",
    "meaning": "Chiếc ghế tại sảnh chờ",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 432,
    "word": "おげんきですか",
    "romaji": "o gen ki de su ka",
    "meaning": "Bạn có khỏe không?",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 433,
    "word": "にほんごのレッスンのへや",
    "romaji": "nihongo no ressun no heya",
    "meaning": "Phòng học tiết tiếng Nhật",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 434,
    "word": "おくります",
    "romaji": "okurimasu",
    "meaning": "tiễn đưa [người], đưa về nhà",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 435,
    "word": "います",
    "romaji": "imasu",
    "meaning": "có, nuôi [con cái, thú cưng]",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 436,
    "word": "くださいます",
    "romaji": "kudasaimasu",
    "meaning": "cho (tôn kính của くれます)",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 437,
    "word": "ぎんこうのロビーのまどくち",
    "romaji": "ginkou no robii no madoguchi",
    "meaning": "Quầy giao dịch ở sảnh ngân hàng",
    "difficulty": "hard",
    "length": 13
  },
  {
    "id": 438,
    "word": "おなまえは",
    "romaji": "o na ma e wa",
    "meaning": "Tên bạn là gì?",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 439,
    "word": "びょういんのいしゃのしごと",
    "romaji": "byouin no isha no shigoto",
    "meaning": "Công việc bác sĩ bệnh viện",
    "difficulty": "hard",
    "length": 13
  },
  {
    "id": 440,
    "word": "にほんごのべんきょう",
    "romaji": "nihongo no benkyou",
    "meaning": "Việc học tập tiếng Nhật",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 441,
    "word": "だいがくいん",
    "romaji": "daigakuin",
    "meaning": "Cao học / Sau đại học",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 442,
    "word": "どうもありがとうございました",
    "romaji": "doumo arigatou gozaimashita",
    "meaning": "Xin chân thành cảm ơn rất nhiều",
    "difficulty": "hard",
    "length": 14
  },
  {
    "id": 443,
    "word": "はこびます",
    "romaji": "hakobimasu",
    "meaning": "vận chuyển, chở đi",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 444,
    "word": "しょくじします",
    "romaji": "shokujishimasu",
    "meaning": "ăn cơm, dùng bữa",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 445,
    "word": "やくそく",
    "romaji": "yakusoku",
    "meaning": "cuộc hẹn, lời hứa",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 446,
    "word": "ひるのごはん",
    "romaji": "hiru no gohan",
    "meaning": "Bữa cơm trưa",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 447,
    "word": "つれてきます",
    "romaji": "tsuretekimasu",
    "meaning": "dẫn đến, đưa đến cùng [người]",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 448,
    "word": "エスカレーター",
    "romaji": "esukareetaa",
    "meaning": "Thang cuốn tự động",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 449,
    "word": "しめきり",
    "romaji": "shimekiri",
    "meaning": "hạn cuối, đóng sổ",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 450,
    "word": "なさいます",
    "romaji": "nasaimasu",
    "meaning": "làm (tôn kính của します)",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 451,
    "word": "こんしゅうのげつようびのよる",
    "romaji": "konshuu no getsuyoubi no yoru",
    "meaning": "Tối thứ hai tuần này",
    "difficulty": "hard",
    "length": 14
  },
  {
    "id": 452,
    "word": "どなた",
    "romaji": "donata",
    "meaning": "Vị nào (kính ngữ)",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 453,
    "word": "おこします",
    "romaji": "okoshimasu",
    "meaning": "đánh thức ai dậy",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 454,
    "word": "とこや",
    "romaji": "tokoya",
    "meaning": "tiệm cắt tóc [cho nam]",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 455,
    "word": "デパートのエレベーター",
    "romaji": "depaato no erebeetaa",
    "meaning": "Thang máy của bách hóa",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 456,
    "word": "あしたのあさしちじはん",
    "romaji": "ashita no asa shichijihan",
    "meaning": "7 giờ rưỡi sáng ngày mai",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 457,
    "word": "だいがく",
    "romaji": "daigaku",
    "meaning": "Trường đại học",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 458,
    "word": "じどうしゃのなか",
    "romaji": "jidousha no naka",
    "meaning": "Bên trong chiếc xe hơi",
    "difficulty": "medium",
    "length": 8
  },
  {
    "id": 459,
    "word": "きのうのばんごはん",
    "romaji": "kinou no bangohan",
    "meaning": "Bữa tối hôm qua",
    "difficulty": "medium",
    "length": 9
  },
  {
    "id": 460,
    "word": "おみやげ",
    "romaji": "omiyage",
    "meaning": "quà lưu niệm",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 461,
    "word": "はじめましてどうぞよろしく",
    "romaji": "hajimemashite douzo yoroshiku",
    "meaning": "Rất hân hạnh được làm quen với bạn",
    "difficulty": "hard",
    "length": 13
  },
  {
    "id": 462,
    "word": "さがします",
    "romaji": "sagashimasu",
    "meaning": "tìm, tìm kiếm",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 463,
    "word": "ふたり",
    "romaji": "futari",
    "meaning": "hai người",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 464,
    "word": "ともだち",
    "romaji": "tomodachi",
    "meaning": "bạn, bạn bè",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 465,
    "word": "こんしゅう",
    "romaji": "konshuu",
    "meaning": "tuần này",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 466,
    "word": "ようです",
    "romaji": "youdesu",
    "meaning": "hình như là [phán đoán cảm giác]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 467,
    "word": "もっていきます",
    "romaji": "motteikimasu",
    "meaning": "mang đi, mang theo",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 468,
    "word": "おそい",
    "romaji": "osoi",
    "meaning": "chậm, muộn",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 469,
    "word": "どうぞよろしく",
    "romaji": "douzo yoroshiku",
    "meaning": "Rất mong nhận được sự giúp đỡ",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 470,
    "word": "さんぽします",
    "romaji": "sanposhimasu",
    "meaning": "đi dạo",
    "difficulty": "medium",
    "length": 6
  },
  {
    "id": 471,
    "word": "ふえます",
    "romaji": "fuemasu",
    "meaning": "tăng lên [xuất khẩu]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 472,
    "word": "あしたのあさごはん",
    "romaji": "ashita no asagohan",
    "meaning": "Bữa sáng ngày mai",
    "difficulty": "medium",
    "length": 9
  },
  {
    "id": 473,
    "word": "スーパーのしょくりょうひん",
    "romaji": "suupaa no shokuryouhin",
    "meaning": "Thực phẩm của siêu thị",
    "difficulty": "hard",
    "length": 13
  },
  {
    "id": 474,
    "word": "ぬぎます",
    "romaji": "nugimasu",
    "meaning": "cởi [quần áo, giày dép]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 475,
    "word": "おふろ",
    "romaji": "ofuro",
    "meaning": "bồn tắm",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 476,
    "word": "いります",
    "romaji": "irimasu",
    "meaning": "cần [visa, tiền]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 477,
    "word": "ふります",
    "romaji": "furimasu",
    "meaning": "rơi [mưa, tuyết]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 478,
    "word": "はらいます",
    "romaji": "haraimasu",
    "meaning": "trả tiền, thanh toán",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 479,
    "word": "くすり",
    "romaji": "kusuri",
    "meaning": "thuốc, dược phẩm",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 480,
    "word": "だいがくのきょうしつ",
    "romaji": "daigaku no kyoushitsu",
    "meaning": "Phòng học của trường đại học",
    "difficulty": "hard",
    "length": 10
  },
  {
    "id": 481,
    "word": "とけい",
    "romaji": "tokei",
    "meaning": "đồng hồ",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 482,
    "word": "どちら",
    "romaji": "dochira",
    "meaning": "phía nào, đằng nào (kính ngữ)",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 483,
    "word": "すくない",
    "romaji": "sukunai",
    "meaning": "ít [người]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 484,
    "word": "きます",
    "romaji": "kimasu",
    "meaning": "đến [ga, nơi chốn]",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 485,
    "word": "らいねんのなつ",
    "romaji": "rainen no natsu",
    "meaning": "Mùa hè năm sau",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 486,
    "word": "つれていきます",
    "romaji": "tsureteikimasu",
    "meaning": "dẫn đi, đưa đi cùng [người]",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 487,
    "word": "ねくたい",
    "romaji": "nekutai",
    "meaning": "cà vạt",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 488,
    "word": "ふたつ",
    "romaji": "futatsu",
    "meaning": "hai cái",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 489,
    "word": "けします",
    "romaji": "keshimasu",
    "meaning": "tắt [điện, điều hòa]",
    "difficulty": "easy",
    "length": 4
  },
  {
    "id": 490,
    "word": "おとこのこ",
    "romaji": "otoko no ko",
    "meaning": "cậu bé, bé trai",
    "difficulty": "easy",
    "length": 5
  },
  {
    "id": 491,
    "word": "じかん",
    "romaji": "jikan",
    "meaning": "thời gian, thời giờ",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 492,
    "word": "どうもありがとうございました",
    "romaji": "doumoarigatougozaimashita",
    "meaning": "Xin chân thành cảm ơn ông/bà rất nhiều",
    "difficulty": "hard",
    "length": 14
  },
  {
    "id": 493,
    "word": "としょかんのしょくいん",
    "romaji": "toshokan no shokuin",
    "meaning": "Nhân viên thư viện trường học",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 494,
    "word": "あたま",
    "romaji": "atama",
    "meaning": "đầu, trí óc",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 495,
    "word": "じゅんびします",
    "romaji": "junbishimasu",
    "meaning": "chuẩn bị",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 496,
    "word": "かるい",
    "romaji": "karui",
    "meaning": "nhẹ",
    "difficulty": "easy",
    "length": 3
  },
  {
    "id": 497,
    "word": "でんしゃのなか",
    "romaji": "densha no naka",
    "meaning": "Bên trong tàu điện ngầm",
    "difficulty": "medium",
    "length": 7
  },
  {
    "id": 498,
    "word": "きのうのよるのパーティー",
    "romaji": "kinou no yoru no paatii",
    "meaning": "Bữa tiệc tối hôm qua",
    "difficulty": "hard",
    "length": 12
  },
  {
    "id": 499,
    "word": "こうじょうのエンジニア",
    "romaji": "koujou no enjinia",
    "meaning": "Kỹ sư làm việc ở nhà máy",
    "difficulty": "hard",
    "length": 11
  },
  {
    "id": 500,
    "word": "じむしょのひと",
    "romaji": "jimusho no hito",
    "meaning": "Nhân viên văn phòng",
    "difficulty": "medium",
    "length": 7
  }
];
