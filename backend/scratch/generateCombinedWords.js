const fs = require('fs');
const path = require('path');
const mockDb = require('../src/db/mockDb');

// Helper to check for yoon or dakuten/handakuten
const yoonChars = /[ゃゅょャュョ]/;
const dakutenChars = /[がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴばびぶべぼぱぴぷぺぽ]/;

// Extract matching words from mockDb
const dbWords = [];
mockDb.vocabulary.forEach(v => {
  const text = v.hiragana.trim();
  const romaji = v.romaji.trim();
  const meaning = v.vietnamese_meaning.trim();
  const len = text.length;

  if (len >= 3 && len <= 15) {
    const isKana = /^[\u3040-\u309F\u30A0-\u30FF\u30FC\u30FD\u30FE]+$/.test(text);
    if (isKana) {
      dbWords.push({
        word: text,
        romaji: romaji,
        meaning: meaning,
        length: len
      });
    }
  }
});

// Predefined high-quality medium phrases/words (6-9 chars)
const customMedium = [
  { word: "おひさしぶりです", romaji: "ohisahiburidesu", meaning: "Lâu rồi không gặp bạn", length: 8 },
  { word: "おげんきですか", romaji: "ogenkidesuka", meaning: "Bạn có khỏe không?", length: 7 },
  { word: "ごちそうさま", romaji: "gochisousama", meaning: "Cảm ơn vì bữa ăn", length: 6 },
  { word: "おじゃまします", romaji: "ojamashimasu", meaning: "Xin lỗi đã làm phiền (khi vào nhà)", length: 7 },
  { word: "いってらっしゃい", romaji: "itterasshai", meaning: "Anh/chị đi nhé (người ở lại nói)", length: 8 },
  { word: "おかえりなさい", romaji: "okaerinasai", meaning: "Anh/chị đã về rồi ạ", length: 7 },
  { word: "しょうがっこう", romaji: "shougakkou", meaning: "Trường tiểu học", length: 7 },
  { word: "ちゅうがっこう", romaji: "chuugakkou", meaning: "Trường trung học cơ sở", length: 7 },
  { word: "こうとうがっこう", romaji: "koutougakkou", meaning: "Trường trung học phổ thông", length: 8 },
  { word: "だいがくいん", romaji: "daigakuin", meaning: "Cao học / Sau đại học", length: 6 },
  { word: "きょうしつのなか", romaji: "kyoushitsu no naka", meaning: "Trong lớp học", length: 8 },
  { word: "しょくどうのなか", romaji: "shokudou no naka", meaning: "Trong nhà ăn", length: 8 },
  { word: "かいぎしつのなか", romaji: "kaigishitsu no naka", meaning: "Trong phòng họp", length: 8 },
  { word: "うけつけのひと", romaji: "uketsuke no hito", meaning: "Người lễ tân", length: 7 },
  { word: "じむしょのひと", romaji: "jimusho no hito", meaning: "Nhân viên văn phòng", length: 7 },
  { word: "でんわばんごう", romaji: "denwa bangou", meaning: "Số điện thoại", length: 7 },
  { word: "なんさいですか", romaji: "nan sai de su ka", meaning: "Bạn bao nhiêu tuổi?", length: 7 },
  { word: "おくにはどちら", romaji: "okuni wa dochira", meaning: "Đất nước của bạn ở đâu?", length: 7 },
  { word: "どなたですか", romaji: "donata de su ka", meaning: "Ai thế ạ?", length: 6 },
  { word: "しつれいですが", romaji: "shitsurei de su ga", meaning: "Xin lỗi (khi muốn hỏi thông tin)...", length: 7 },
  { word: "おなまえは？", romaji: "onamae wa", meaning: "Tên bạn là gì?", length: 6 },
  { word: "はじめまして", romaji: "hajimemashite", meaning: "Rất hân hạnh được gặp bạn", length: 6 },
  { word: "どうぞよろしく", romaji: "douzo yoroshiku", meaning: "Rất mong nhận được sự giúp đỡ", length: 7 },
  { word: "おやすみなさい", romaji: "oyasuminasai", meaning: "Chúc ngủ ngon", length: 7 },
  { word: "どういたしまして", romaji: "douitashimashite", meaning: "Không có chi / Đừng khách sáo", length: 8 },
  { word: "しつれいします", romaji: "shitsureishimasu", meaning: "Thất lễ / Xin lỗi làm phiền", length: 7 },
  { word: "いってきます", romaji: "ittekimasu", meaning: "Tôi đi đây (người đi nói)", length: 6 },
  { word: "おじゃましました", romaji: "ojamashimashita", meaning: "Tôi đã làm phiền nhiều (khi về)", length: 8 },
  { word: "いらっしゃいませ", romaji: "irasshaimase", meaning: "Chào mừng quý khách", length: 8 },
  { word: "すみませんでした", romaji: "sumimasendeshita", meaning: "Tôi vô cùng xin lỗi (quá khứ)", length: 8 },
  { word: "おげんきですか", romaji: "o gen ki de su ka", meaning: "Bạn có khỏe không?", length: 7 },
  { word: "おくにはどちら", romaji: "o ku ni wa do chi ra", meaning: "Đất nước của bạn ở đâu?", length: 7 },
  { word: "おなまえは", romaji: "o na ma e wa", meaning: "Tên bạn là gì?", length: 5 },
  { word: "にほんごのがくせい", romaji: "nihongo no gakusei", meaning: "Học sinh tiếng Nhật", length: 9 },
  { word: "えいごのせんせい", romaji: "eigo no sensei", meaning: "Giáo viên tiếng Anh", length: 8 },
  { word: "だいがくのせんせい", romaji: "daigaku no sensei", meaning: "Giáo viên đại học", length: 9 },
  { word: "ぎんこうのしゃいん", romaji: "ginkou no shain", meaning: "Nhân viên ngân hàng", length: 9 },
  { word: "かいしゃのしゃちょう", romaji: "kaisha no shachou", meaning: "Giám đốc công ty", length: 9 },
  { word: "きのうのばんごはん", romaji: "kinou no bangohan", meaning: "Bữa tối hôm qua", length: 9 },
  { word: "あしたのあさごはん", romaji: "ashita no asagohan", meaning: "Bữa sáng ngày mai", length: 9 },
  { word: "としょかんのなか", romaji: "toshokan no naka", meaning: "Trong thư viện", length: 8 },
  { word: "スーパーのなか", romaji: "suupaa no naka", meaning: "Trong siêu thị", length: 7 },
  { word: "きっさてんのなか", romaji: "kissaten no naka", meaning: "Trong quán nước/cà phê", length: 8 },
  { word: "えきまえのひろば", romaji: "ekimae no hiroba", meaning: "Quảng trường trước nhà ga", length: 8 },
  { word: "でんきのがいしゃ", romaji: "denki no gaisha", meaning: "Công ty điện lực", length: 8 },
  { word: "えきいんのしごと", romaji: "ekiin no shigoto", meaning: "Công việc của nhân viên nhà ga", length: 8 },
  { word: "うけつけのスタッフ", romaji: "uketsuke no sutaffu", meaning: "Nhân viên lễ tân", length: 9 },
  { word: "じどうしゃのキー", romaji: "jidousha no kii", meaning: "Chìa khóa xe ô tô", length: 8 },
  { word: "にほんごのじしょ", romaji: "nihongo no jisho", meaning: "Từ điển tiếng Nhật", length: 8 },
  { word: "えいごのてがみ", romaji: "eigo no tegami", meaning: "Bức thư tiếng Anh", length: 7 },
  // Adding 25 more custom medium words to make sure we reach 150 items easily
  { word: "にほんごのほん", romaji: "nihongo no hon", meaning: "Sách tiếng Nhật", length: 7 },
  { word: "えいごのじしょ", romaji: "eigo no jisho", meaning: "Từ điển tiếng Anh", length: 7 },
  { word: "くるまのキー", romaji: "kuruma no kii", meaning: "Chìa khóa xe hơi", length: 6 },
  { word: "うちのテレビ", romaji: "uchi no terebi", meaning: "Tivi nhà tôi", length: 6 },
  { word: "わたしのカメラ", romaji: "watashi no kamera", meaning: "Máy ảnh của tôi", length: 7 },
  { word: "あしたのあさ", romaji: "ashita no asa", meaning: "Sáng ngày mai", length: 6 },
  { word: "きょうのよる", romaji: "kyou no yoru", meaning: "Tối ngày hôm nay", length: 6 },
  { word: "きのうのよる", romaji: "kinou no yoru", meaning: "Tối ngày hôm qua", length: 6 },
  { word: "こんげつのあさ", romaji: "kongetsu no asa", meaning: "Bữa sáng tháng này", length: 7 },
  { word: "らいねんのなつ", romaji: "rainen no natsu", meaning: "Mùa hè năm sau", length: 7 },
  { word: "せんげつのあき", romaji: "sengetsu no aki", meaning: "Mùa thu tháng trước", length: 7 },
  { word: "ゆうびんきょく", romaji: "yuubinkyoku", meaning: "Bưu điện", length: 7 },
  { word: "びじゅつかん", romaji: "bijutsukan", meaning: "Bảo tàng mỹ thuật", length: 6 },
  { word: "えきいんさん", romaji: "ekiinsan", meaning: "Nhân viên nhà ga thân mến", length: 6 },
  { word: "スーパーマーケット", romaji: "suupaamaaketto", meaning: "Siêu thị (từ mượn)", length: 9 },
  { word: "エレベーター", romaji: "erebeetaa", meaning: "Thang máy di chuyển", length: 6 },
  { word: "エスカレーター", romaji: "esukareetaa", meaning: "Thang cuốn tự động", length: 7 },
  { word: "エアコンのスイッチ", romaji: "eakon no suicchi", meaning: "Công tắc máy điều hòa", length: 9 },
  { word: "つくえのうえ", romaji: "tsukue no ue", meaning: "Ở trên mặt bàn", length: 6 },
  { word: "かばんのなか", romaji: "kaban no naka", meaning: "Bên trong cặp sách học tập", length: 6 },
  { word: "でんしゃのなか", romaji: "densha no naka", meaning: "Bên trong tàu điện ngầm", length: 7 },
  { word: "じどうしゃのなか", romaji: "jidousha no naka", meaning: "Bên trong chiếc xe hơi", length: 8 },
  { word: "としょかんのほん", romaji: "toshokan no hon", meaning: "Sách mượn ở thư viện", length: 8 },
  { word: "ロビーのいす", romaji: "robii no isu", meaning: "Chiếc ghế tại sảnh chờ", length: 6 },
  { word: "にほんのごはん", romaji: "nihon no gohan", meaning: "Cơm ăn kiểu Nhật Bản", length: 7 },
  { word: "あさのごはん", romaji: "asa no gohan", meaning: "Bữa cơm sáng", length: 6 },
  { word: "ひるのごはん", romaji: "hiru no gohan", meaning: "Bữa cơm trưa", length: 6 },
  { word: "よるのごはん", romaji: "yoru no gohan", meaning: "Bữa cơm tối", length: 6 }
];

// Predefined high-quality hard phrases/words (10-15 chars)
const customHard = [
  { word: "おたんじょうびおめでとう", romaji: "otanjoubiomedetou", meaning: "Chúc mừng sinh nhật", length: 12 },
  { word: "あけましておめでとう", romaji: "akemashiteomedetou", meaning: "Chúc mừng năm mới", length: 10 },
  { word: "おめでとうございます", romaji: "omedetougozaimasu", meaning: "Xin chúc mừng bạn", length: 10 },
  { word: "どうもありがとうございました", romaji: "doumoarigatougozaimashita", meaning: "Xin chân thành cảm ơn ông/bà rất nhiều", length: 13 },
  { word: "どうぞよろしくおねがいします", romaji: "douzoyoroshikuonegaishimasu", meaning: "Rất mong nhận được sự giúp đỡ của bạn", length: 14 },
  { word: "しつれいしますおじゃまします", romaji: "shitsureishimasuojamashimasu", meaning: "Xin phép tôi vào nhà làm phiền nhé", length: 14 },
  { word: "てんきよほうによると", romaji: "tenkiyohou ni yoru to", meaning: "Theo như dự báo thời tiết thì", length: 10 },
  { word: "コンピューターのがいしゃ", romaji: "konpyuutaano gaisha", meaning: "Công ty về máy tính", length: 12 },
  { word: "けんきゅうじょのけんきゅうしゃ", romaji: "kenkyuujono kenkyuusha", meaning: "Nhà nghiên cứu tại viện nghiên cứu", length: 15 },
  { word: "じどうしゃのこうじょう", romaji: "jidousha no koujou", meaning: "Nhà máy sản xuất xe hơi", length: 11 },
  { word: "じむしょのしょくいん", romaji: "jimusho no shokuin", meaning: "Nhân viên văn phòng hành chính", length: 10 },
  { word: "けいさつかんのしごと", romaji: "keisatsukan no shigoto", meaning: "Công việc của một chiến sĩ cảnh sát", length: 10 },
  { word: "にほんごのべんきょう", romaji: "nihongo no benkyou", meaning: "Việc học tập tiếng Nhật", length: 10 },
  { word: "あしたのあさしちじはん", romaji: "ashita no asa shichijihan", meaning: "7 giờ rưỡi sáng ngày mai", length: 11 },
  { word: "きょうのよるはちじはん", romaji: "kyou no yoru hachijihan", meaning: "8 giờ rưỡi tối ngày hôm nay", length: 10 },
  { word: "らいしゅうのげつようび", romaji: "raishuu no getsuyoubi", meaning: "Thứ hai tuần sau nữa", length: 11 },
  { word: "こんしゅうのどようび", romaji: "konshuu no doyoubi", meaning: "Thứ bảy tuần này", length: 10 },
  { word: "せんげつのじゅうごにち", romaji: "sengetsu no juugonichi", meaning: "Ngày 15 của tháng trước", length: 11 },
  { word: "らいげつのにじゅうにち", romaji: "raigetsu no nijuunichi", meaning: "Ngày 20 của tháng sau", length: 11 },
  { word: "びじゅつかんのロビー", romaji: "bijutsukan no robii", meaning: "Sảnh chờ của bảo tàng mỹ thuật", length: 10 },
  { word: "としょかんのしょくどう", romaji: "toshokan no shokudou", meaning: "Nhà ăn của thư viện", length: 11 },
  { word: "ゆうびんきょくのとなり", romaji: "yuubinkyoku no tonari", meaning: "Bên cạnh bưu điện thành phố", length: 11 },
  { word: "えきのちかくのホテル", romaji: "eki no chikaku no hoteru", meaning: "Khách sạn nằm gần khu vực nhà ga", length: 11 },
  { word: "デパートのちかのしょくどう", romaji: "depaato no chika no shokudou", meaning: "Nhà ăn dưới tầng hầm trung tâm thương mại", length: 13 },
  { word: "かいしゃのしょくいん", romaji: "kaisha no shokuin", meaning: "Nhân viên của công ty", length: 10 },
  { word: "だいがくのきょうじゅ", romaji: "daigaku no kyouju", meaning: "Giáo sư giảng dạy ở đại học", length: 10 },
  { word: "びょういんのかんごし", romaji: "byouin no kangoshi", meaning: "Y tá chăm sóc ở bệnh viện", length: 10 },
  { word: "ゆうびんきょくのしょくいん", romaji: "yuubinkyoku no shokuin", meaning: "Nhân viên bưu điện", length: 12 },
  { word: "ぎんこうのしょくいん", romaji: "ginkou no shokuin", meaning: "Nhân viên làm việc tại ngân hàng", length: 10 },
  { word: "としょかんのしょくいん", romaji: "toshokan no shokuin", meaning: "Nhân viên thư viện trường học", length: 10 },
  { word: "びじゅつかんのしょくいん", romaji: "bijutsukan no shokuin", meaning: "Nhân viên bảo tàng nghệ thuật", length: 11 },
  { word: "どういたしましていいえ", romaji: "douitashimashite iie", meaning: "Không có chi, không sao đâu mà", length: 11 },
  { word: "あしたのよるしちじはん", romaji: "ashita no yoru shichijihan", meaning: "7 giờ rưỡi tối ngày mai", length: 11 },
  { word: "きのうのあさろくじはん", romaji: "kinou no asa rokujihan", meaning: "6 giờ rưỡi sáng hôm qua", length: 11 },
  { word: "らいねんのじゅうにがつ", romaji: "rainen no juunigatsu", meaning: "Tháng 12 của năm sau", length: 11 },
  { word: "ことしのじゅういちがつ", romaji: "kotoshi no juuichigatsu", meaning: "Tháng 11 của năm nay", length: 11 },
  { word: "きょうしつのせんせい", romaji: "kyoushitsu no sensei", meaning: "Giáo viên trong phòng học", length: 10 },
  { word: "がっこうのしょくどう", romaji: "gakkou no shokudou", meaning: "Nhà ăn của trường học", length: 10 },
  { word: "かいぎしつのエアコン", romaji: "kaigishitsu no eakon", meaning: "Máy điều hòa phòng họp", length: 10 },
  { word: "じむしょのコンピューター", romaji: "jimusho no konpyuutar", meaning: "Máy vi tính văn phòng", length: 13 },
  { word: "しゃちょうのじどうしゃ", romaji: "shachou no jidousha", meaning: "Xe ô tô của giám đốc", length: 11 },
  { word: "つくえのうえのカメラ", romaji: "tsukue no ue no kamera", meaning: "Máy ảnh để trên mặt bàn", length: 10 },
  { word: "にほんごのクラスルーム", romaji: "nihongo no kurasuruumu", meaning: "Lớp học tiếng Nhật", length: 11 },
  { word: "サントスさんのじどうしゃ", romaji: "santosu san no jidousha", meaning: "Xe hơi của anh Santos", length: 12 },
  { word: "ミラーさんのコンピューター", romaji: "miraa san no konpyuutaa", meaning: "Máy tính của anh Miller", length: 14 },
  { word: "がくせいのべんきょうべや", romaji: "gakusei no benkyoubeya", meaning: "Phòng học tập của học sinh", length: 12 },
  { word: "ゆうびんきょくのロビー", romaji: "yuubinkyoku no robii", meaning: "Sảnh chờ của bưu điện", length: 11 },
  { word: "デパートのレストラン", romaji: "depaato no resutoran", meaning: "Nhà hàng ở cửa hàng bách hóa", length: 10 },
  { word: "にほんのじどうしゃがいしゃ", romaji: "nihon no jidoushagaisha", meaning: "Công ty sản xuất ô tô Nhật Bản", length: 13 },
  { word: "アメリカ의コンピューター", word: "アメリカのコンピューター", romaji: "amerika no konpyuutaa", meaning: "Máy tính xuất xứ Mỹ", length: 12 },
  { word: "さくらだいがくのせんせい", romaji: "sakuradaigaku no sensei", meaning: "Giảng viên của trường Đại học Sakura", length: 12 },
  { word: "だいがくのじむしょのひと", romaji: "daigaku no jimusho no hito", meaning: "Người ở văn phòng đại học", length: 12 },
  { word: "こうじょうのエンジニア", romaji: "koujou no enjinia", meaning: "Kỹ sư làm việc ở nhà máy", length: 11 },
  { word: "びょういんのいしゃのしごと", romaji: "byouin no isha no shigoto", meaning: "Công việc bác sĩ bệnh viện", length: 12 },
  { word: "けいさつかんのパトカー", romaji: "keisatsukan no patokaa", meaning: "Xe tuần tra của cảnh sát", length: 11 },
  { word: "ぎんこうのじむしょのなか", romaji: "ginkou no jimusho no naka", meaning: "Bên trong văn phòng ngân hàng", length: 12 },
  { word: "としょかんのべんきょうしつ", romaji: "toshokan no benkyoushitsu", meaning: "Phòng tự học của thư viện", length: 12 },
  { word: "スーパーのレジのスタッフ", romaji: "suupaa no reji no sutaffu", meaning: "Nhân viên quầy thu ngân siêu thị", length: 12 },
  { word: "つくえのうえのじしょ", romaji: "tsukue no ue no jisho", meaning: "Quyển từ điển ở trên bàn", length: 10 },
  { word: "かばんのなかのケータイ", romaji: "kaban no naka no keitai", meaning: "Điện thoại di động trong túi xách", length: 11 },
  { word: "でんしゃのなかのひと", romaji: "densha no naka no hito", meaning: "Người ngồi ở trong tàu điện", length: 10 },
  { word: "デパートのエレベーター", romaji: "depaato no erebeetaa", meaning: "Thang máy của bách hóa", length: 11 },
  { word: "としょかんのとしょカード", romaji: "toshokan no tosho kaado", meaning: "Thẻ thư viện đọc sách", length: 12 },
  { word: "にほんごのきょうしつ", romaji: "nihongo no kyoushitsu", meaning: "Lớp học tiếng Nhật Bản", length: 10 },
  { word: "えいごのべんきょうのへや", romaji: "eigo no benkyou no heya", meaning: "Phòng học tiếng Anh", length: 11 },
  { word: "あしたのひるごはんのじかん", romaji: "ashita no hirugohan no jikan", meaning: "Giờ ăn trưa của ngày mai", length: 13 },
  { word: "きのうのばんごはんのとき", romaji: "kinou no bangohan no toki", meaning: "Thời điểm ăn tối hôm qua", length: 12 },
  { word: "らいしゅうのどようびのあさ", romaji: "raishuu no doyoubi no asa", meaning: "Sáng thứ bảy tuần sau", length: 13 },
  { word: "こんしゅうのげつようびのよる", romaji: "konshuu no getsuyoubi no yoru", meaning: "Tối thứ hai tuần này", length: 14 },
  { word: "せんげつのじゅうごにchinoasa", word: "せんげつのじゅうごにちのあさ", romaji: "sengetsu no juugonichi no asa", meaning: "Sáng ngày 15 tháng trước", length: 14 },
  { word: "らいげつのにじゅうにちのよる", romaji: "raigetsu no nijuunichi no yoru", meaning: "Tối ngày 20 tháng sau", length: 14 },
  { word: "びじゅつかんのうけつけ", romaji: "bijutsukan no uketsuke", meaning: "Quầy lễ tân bảo tàng mỹ thuật", length: 11 },
  { word: "としょかんのじむしょ", romaji: "toshokan no jimusho", meaning: "Văn phòng quản lý thư viện", length: 10 },
  { word: "ゆうびんきょくのポスト", romaji: "yuubinkyoku no posuto", meaning: "Hòm thư của bưu điện", length: 11 },
  { word: "えきビルのなかのショップ", romaji: "ekibiru no naka no shoppu", meaning: "Cửa hàng trong tòa nhà nhà ga", length: 12 },
  { word: "デパートのちかのスーパー", romaji: "depaato no chika no suupaa", meaning: "Siêu thị dưới tầng hầm bách hóa", length: 12 },
  { word: "じむしょのコピーき", romaji: "jimusho no kopii ki", meaning: "Máy photocopy của văn phòng", length: 10 },
  { word: "だいがくのとしょかん", romaji: "daigaku no toshokan", meaning: "Thư viện của trường đại học", length: 10 },
  { word: "びょういんのロビーのいす", romaji: "byouin no robii no isu", meaning: "Ghế ở sảnh chờ bệnh viện", length: 12 },
  { word: "にほんごのがくしゅうしゃ", romaji: "nihongo no gakushuusha", meaning: "Người học tiếng Nhật Bản", length: 12 },
  { word: "えいごのじしょのページ", romaji: "eigo no jisho no peeji", meaning: "Trang từ điển tiếng Anh", length: 11 },
  { word: "だいがくのきょうしつ", romaji: "daigaku no kyoushitsu", meaning: "Phòng học của trường đại học", length: 10 },
  { word: "ぎんこうのロビーのまどくち", romaji: "ginkou no robii no madoguchi", meaning: "Quầy giao dịch ở sảnh ngân hàng", length: 14 },
  { word: "としょかんのほんのたな", romaji: "toshokan no hon no tana", meaning: "Giá sách của thư viện", length: 11 },
  { word: "スーパーのしょくりょうひん", romaji: "suupaa no shokuryouhin", meaning: "Thực phẩm của siêu thị", length: 13 },
  { word: "つくえのうえのペンとノート", romaji: "tsukue no ue no pen to nooto", meaning: "Bút và vở ở trên mặt bàn", length: 13 },
  { word: "かばんのなかのじしょとほん", romaji: "kaban no naka no jisho to hon", meaning: "Từ điển và sách trong cặp", length: 14 },
  { word: "でんしゃのなかのえきいん", romaji: "densha no naka no ekiin", meaning: "Nhân viên tàu điện trong toa", length: 11 },
  { word: "デパートのエスカレーター", romaji: "depaato no esukareetaa", meaning: "Thang cuốn bách hóa", length: 12 },
  { word: "としょかんのかしだしカード", romaji: "toshokan no kashidashi kaado", meaning: "Thẻ mượn sách thư viện", length: 14 },
  { word: "にほんごのレッスンのへや", romaji: "nihongo no ressun no heya", meaning: "Phòng học tiết tiếng Nhật", length: 12 },
  { word: "えいごのべんきょうのじかん", romaji: "eigo no benkyou no jikan", meaning: "Thời gian học tiếng Anh", length: 12 },
  { word: "あしたのあさごはんのメニュー", romaji: "ashita no asagohan no menyuu", meaning: "Thực đơn bữa sáng mai", length: 14 },
  { word: "きのうのよるのパーティー", romaji: "kinou no yoru no paatii", meaning: "Bữa tiệc tối hôm qua", length: 12 },
  { word: "らいしゅうのにちようびのあさ", romaji: "raishuu no nichiyoubi no asa", meaning: "Sáng chủ nhật tuần sau", length: 14 },
  { word: "こんしゅうのきんようびのよる", romaji: "konshuu no kinyoubi no yoru", meaning: "Tối thứ sáu tuần này", length: 14 },
  { word: "おげんきでいらっしゃいますか", romaji: "ogenkideirasshaimasuka", meaning: "Anh/chị có khỏe không ạ? (Kính ngữ)", length: 14 },
  { word: "どうもありがとうございました", romaji: "doumo arigatou gozaimashita", meaning: "Xin chân thành cảm ơn rất nhiều", length: 13 },
  { word: "どうぞよろしくおねがいします", romaji: "douzo yoroshiku onegaishimasu", meaning: "Rất mong nhận được sự giúp đỡ", length: 14 },
  { word: "はじめましてどうぞよろしく", romaji: "hajimemashite douzo yoroshiku", meaning: "Rất hân hạnh được làm quen với bạn", length: 13 }
];

// Clean items helper
const cleanList = (list) => {
  return list.map(item => {
    const len = item.word.length;
    let diff = 'easy';
    if (len >= 6 && len <= 9) diff = 'medium';
    if (len >= 10) diff = 'hard';

    return {
      word: item.word,
      romaji: item.romaji.toLowerCase().trim(),
      meaning: item.meaning,
      difficulty: diff,
      length: len
    };
  });
};

const allDbWords = cleanList(dbWords);
const allCustomMedium = cleanList(customMedium);
const allCustomHard = cleanList(customHard);

// Separate pools
const easyPool = allDbWords.filter(w => w.difficulty === 'easy');
const mediumPool = [...allDbWords.filter(w => w.difficulty === 'medium'), ...allCustomMedium];
const hardPool = [...allDbWords.filter(w => w.difficulty === 'hard'), ...allCustomHard];

console.log('Easy Pool:', easyPool.length);
console.log('Medium Pool:', mediumPool.length);
console.log('Hard Pool:', hardPool.length);

// Shuffling helper
const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Select target distribution: 250 Easy, 150 Medium, 100 Hard -> Total exactly 500
const selectedEasy = shuffle(easyPool).slice(0, 250);
const selectedMedium = shuffle(mediumPool).slice(0, 150);
const selectedHard = shuffle(hardPool).slice(0, 100);

const finalWords = [...selectedEasy, ...selectedMedium, ...selectedHard];

// Shuffle the final list to mix them, then assign incremental IDs
const shuffledFinal = shuffle(finalWords).map((w, idx) => ({
  id: idx + 1,
  ...w
}));

console.log('Final Selected Count:', shuffledFinal.length);
console.log('Final Easy:', shuffledFinal.filter(w => w.difficulty === 'easy').length);
console.log('Final Medium:', shuffledFinal.filter(w => w.difficulty === 'medium').length);
console.log('Final Hard:', shuffledFinal.filter(w => w.difficulty === 'hard').length);

// Generate typescript file content
const fileContent = `export interface CombinedWord {
  id: number;
  word: string;
  romaji: string;
  meaning: string;
  difficulty: 'easy' | 'medium' | 'hard';
  length: number;
}

export const combinedWordsData: CombinedWord[] = ${JSON.stringify(shuffledFinal, null, 2)};
`;

const destPath = path.join(__dirname, '../../frontend/src/app/kana/combinedWords.ts');
fs.writeFileSync(destPath, fileContent, 'utf-8');
console.log('Successfully wrote combinedWords.ts to:', destPath);
