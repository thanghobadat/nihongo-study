export interface ParticleFunction {
  usage: string;
  explanation: string;
  exampleJp: string;
  exampleRomaji: string;
  exampleVn: string;
}

export interface ParticleItem {
  id: string;
  character: string;
  romaji: string;
  primaryRole: string;
  functions: ParticleFunction[];
  tips?: string;
}

export interface ConfusablePair {
  id: string;
  title: string;
  particles: [string, string];
  coreDistinction: string;
  cases: {
    particle: string;
    condition: string;
    exampleJp: string;
    exampleVn: string;
  }[];
  mnemonic: string;
}

export const PARTICLES_LIST: ParticleItem[] = [
  {
    id: 'wa',
    character: 'は',
    romaji: 'wa',
    primaryRole: 'Trợ từ chủ đề (Topic Marker) & Nhấn mạnh / Đối chiếu',
    tips: 'Tuy viết bằng chữ "Ha" nhưng khi làm trợ từ bắt buộc phát âm là "Wa". Nó đưa đối tượng lên làm trung tâm câu chuyện.',
    functions: [
      {
        usage: 'Đánh dấu chủ đề câu chuyện (Cái đang nói tới)',
        explanation: 'Nhắc tới một đối tượng đã biết để đưa ra lời bình luận phía sau.',
        exampleJp: 'わたしは ベトナム人です。',
        exampleRomaji: 'Watashi wa betonamujin desu.',
        exampleVn: 'Tôi là người Việt Nam.'
      },
      {
        usage: 'Đối chiếu, tương phản hai vế',
        explanation: 'Nhấn mạnh cái này thì có/làm được, còn cái kia thì không.',
        exampleJp: 'ひらがなは 読めますが、漢字は 読めません。',
        exampleRomaji: 'Hiragana wa yomemasu ga, kanji wa yomemasen.',
        exampleVn: 'Hiragana thì tôi đọc được, nhưng chữ Hán thì tôi không đọc được.'
      }
    ]
  },
  {
    id: 'ga',
    character: 'が',
    romaji: 'ga',
    primaryRole: 'Trợ từ chủ ngữ ngữ pháp (Subject) & Đối tượng của trạng thái',
    tips: 'Khác với は (nhấn mạnh vị ngữ), が nhấn mạnh chính CHỦ NGỮ đứng trước nó. Trả lời cho câu hỏi: Ai? Cái gì?',
    functions: [
      {
        usage: 'Chủ ngữ của hành động / Hiện tượng tự nhiên khách quan',
        explanation: 'Mô tả hiện tượng đập vào mắt hoặc thông tin mới xuất hiện.',
        exampleJp: '雨が 降っています。',
        exampleRomaji: 'Ame ga futte imasu.',
        exampleVn: 'Trời đang mưa.'
      },
      {
        usage: 'Đối tượng của Tính từ, Sở thích, Khả năng, Sở hữu',
        explanation: 'Đi với 好き, 嫌い, 上手, 下手, ほしい, わかる, できる, あります, います.',
        exampleJp: 'わたしは 日本語が わかります。',
        exampleRomaji: 'Watashi wa nihongo ga wakarimasu.',
        exampleVn: 'Tôi hiểu tiếng Nhật.'
      },
      {
        usage: 'Chủ ngữ trong mệnh đề phụ (Noun Clause)',
        explanation: 'Trong câu định ngữ bổ nghĩa cho danh từ, chủ ngữ bắt buộc dùng が thay vì は.',
        exampleJp: '母が 作った ケーキは おいしいです。',
        exampleRomaji: 'Haha ga tsukutta keeki wa oishii desu.',
        exampleVn: 'Chiếc bánh mà mẹ tôi làm rất ngon.'
      },
      {
        usage: 'Liên từ nối hai vế tương phản (Nhưng)',
        explanation: 'Đứng giữa câu đóng vai trò liên kết "nhưng".',
        exampleJp: '日本の 食べ物は おいしいですが、高いです。',
        exampleRomaji: 'Nihon no tabemono wa oishii desu ga, takai desu.',
        exampleVn: 'Món ăn Nhật Bản ngon nhưng đắt.'
      }
    ]
  },
  {
    id: 'o',
    character: 'を',
    romaji: 'o / wo',
    primaryRole: 'Bổ ngữ trực tiếp của Tha động từ & Rời khỏi / Xuyên qua',
    tips: 'Chỉ đi với Tha động từ (hành động có chủ ý tác động lên vật). Ngoài ra còn chỉ địa điểm rời khỏi hoặc băng qua.',
    functions: [
      {
        usage: 'Chỉ đối tượng trực tiếp chịu tác động',
        explanation: 'Ai đó làm cái gì (Ăn cơm, uống nước, đọc sách).',
        exampleJp: '毎朝 コーヒーを 飲みます。',
        exampleRomaji: 'Maiasa koohii o nomimasu.',
        exampleVn: 'Mỗi sáng tôi đều uống cà phê.'
      },
      {
        usage: 'Chỉ điểm xuất phát, rời khỏi',
        explanation: 'Rời khỏi nhà, bước xuống xe buýt, tốt nghiệp trường.',
        exampleJp: '７時に 家を 出ます。',
        exampleRomaji: 'Shichiji ni ie o demasu.',
        exampleVn: 'Tôi rời khỏi nhà lúc 7 giờ.'
      },
      {
        usage: 'Chỉ không gian di chuyển xuyên qua, dọc theo',
        explanation: 'Đi dạo trong công viên, bay qua bầu trời, băng qua đường.',
        exampleJp: '公園を 散歩します。',
        exampleRomaji: 'Kouen o sanpo shimasu.',
        exampleVn: 'Tôi đi dạo trong công viên.'
      }
    ]
  },
  {
    id: 'ni',
    character: 'に',
    romaji: 'ni',
    primaryRole: 'Thời điểm cụ thể, Nơi tồn tại, Đích đến, Tác nhân, Mục đích',
    tips: 'Trợ từ đa năng nhất trong tiếng Nhật. Ghi nhớ 5 vai trò cốt lõi dưới đây.',
    functions: [
      {
        usage: 'Thời điểm xác định có con số',
        explanation: 'Vào lúc mấy giờ, ngày mấy, tháng mấy (Không dùng cho hôm nay, ngày mai, tuần sau).',
        exampleJp: '６時半に 起きます。',
        exampleRomaji: 'Rokujihan ni okimasu.',
        exampleVn: 'Tôi thức dậy vào lúc 6 giờ rưỡi.'
      },
      {
        usage: 'Nơi tồn tại của người / vật (Có ở đâu)',
        explanation: 'Đi với あります (đồ vật/cây cối) và います (người/con vật).',
        exampleJp: '机の 上に 本が あります。',
        exampleRomaji: 'Tsukue no ue ni hon ga arimasu.',
        exampleVn: 'Trên bàn có quyển sách.'
      },
      {
        usage: 'Đích đến của hành động di chuyển',
        explanation: 'Đi đến đâu, bước vào phòng, lên tàu (学校に 行きます, 電車に 乗ります).',
        exampleJp: '日本に 行きたいです。',
        exampleRomaji: 'Nihon ni ikitai desu.',
        exampleVn: 'Tôi muốn đi Nhật Bản.'
      },
      {
        usage: 'Đối tượng tiếp nhận hành động (Cho / Nhận)',
        explanation: 'Tặng quà cho ai, gọi điện thoại cho ai.',
        exampleJp: '友達に プレゼントを あげました。',
        exampleRomaji: 'Tomodachi ni purezento o agemashita.',
        exampleVn: 'Tôi đã tặng quà cho bạn bè.'
      },
      {
        usage: 'Mục đích của hành động di chuyển (Đi đâu để làm gì)',
        explanation: 'Công thức: Địa điểm + へ + V(bỏ ます) / Danh từ + に + 行きます.',
        exampleJp: 'スーパーへ 買い物に 行きます。',
        exampleRomaji: 'Suupaa e kaimono ni ikimasu.',
        exampleVn: 'Tôi đi siêu thị để mua sắm.'
      },
      {
        usage: 'Tần suất trong một khoảng thời gian',
        explanation: 'Một tháng 2 lần, một ngày 3 lần.',
        exampleJp: '１か月に ２回 映画を 見ます。',
        exampleRomaji: 'Ikkagetsu ni nikai eiga o mimasu.',
        exampleVn: 'Một tháng tôi xem phim 2 lần.'
      }
    ]
  },
  {
    id: 'de',
    character: 'で',
    romaji: 'de',
    primaryRole: 'Địa điểm hành động, Phương tiện/Công cụ, Nguyên nhân, Phạm vi',
    tips: 'Phân biệt sâu sắc với に: で là nơi xảy ra HÀNH ĐỘNG tích cực (ăn, học, chơi), に là nơi TỒN TẠI tĩnh.',
    functions: [
      {
        usage: 'Địa điểm diễn ra hành động',
        explanation: 'Làm việc gì ở đâu.',
        exampleJp: '図書館で 勉強します。',
        exampleRomaji: 'Toshokan de benkyou shimasu.',
        exampleVn: 'Tôi học bài ở thư viện.'
      },
      {
        usage: 'Phương tiện, công cụ, ngôn ngữ, nguyên liệu',
        explanation: 'Đi bằng xe máy, ăn bằng đũa, viết bằng bút chì, nói bằng tiếng Nhật.',
        exampleJp: 'はしで ごはんを 食べます。',
        exampleRomaji: 'Hashi de gohan o tabemasu.',
        exampleVn: 'Tôi ăn cơm bằng đũa.'
      },
      {
        usage: 'Nguyên nhân, lý do (thiên tai, bệnh tật, sự cố)',
        explanation: 'Nghỉ làm vì bị ốm, tàu trễ vì bão tuyết.',
        exampleJp: '風邪で 学校を 休みました。',
        exampleRomaji: 'Kaze de gakkou o yasumimashita.',
        exampleVn: 'Tôi đã nghỉ học vì bị cảm cúm.'
      },
      {
        usage: 'Phạm vi giới hạn (Trong số, cao nhất)',
        explanation: 'Trong gia đình ai cao nhất, trong một ngày làm xong.',
        exampleJp: 'クラスで ナムさんが いちばん 背が 高いです。',
        exampleRomaji: 'Kurasu de Namu-san ga ichiban se ga takai desu.',
        exampleVn: 'Trong lớp học bạn Nam là người cao nhất.'
      }
    ]
  },
  {
    id: 'e',
    character: 'へ',
    romaji: 'e',
    primaryRole: 'Chỉ hướng di chuyển (Direction)',
    tips: 'Viết bằng chữ "He" nhưng đọc là "E". Nhấn mạnh về PHƯƠNG HƯỚNG đang tiến về phía đó.',
    functions: [
      {
        usage: 'Hướng di chuyển tới một địa điểm',
        explanation: 'Đi về phía trước, hướng về nước Nhật.',
        exampleJp: 'あした 東京へ 行きます。',
        exampleRomaji: 'Ashita Toukyou e ikimasu.',
        exampleVn: 'Ngày mai tôi sẽ đi về phía Tokyo.'
      }
    ]
  },
  {
    id: 'to',
    character: 'と',
    romaji: 'to',
    primaryRole: 'Và (Liệt kê trọn vẹn), Cùng với ai, Trích dẫn',
    tips: 'Khi nối hai danh từ, と ngụ ý chỉ có bấy nhiêu thôi (không còn cái khác).',
    functions: [
      {
        usage: 'Nối danh từ: Và (Trọn vẹn 100%)',
        explanation: 'Chỉ có A và B, không có đối tượng thứ ba.',
        exampleJp: 'パンと 卵を 買いました。',
        exampleRomaji: 'Pan to tamago o kaimashita.',
        exampleVn: 'Tôi đã mua bánh mì và trứng (chỉ 2 thứ này).'
      },
      {
        usage: 'Cùng với ai làm việc gì',
        explanation: 'Thực hiện hành động cùng với người khác.',
        exampleJp: '友達と 映画を 見ました。',
        exampleRomaji: 'Tomodachi to eiga o mimashita.',
        exampleVn: 'Tôi đã đi xem phim cùng với bạn.'
      },
      {
        usage: 'Trích dẫn lời nói hoặc suy nghĩ',
        explanation: 'Đi với と思います (nghĩ rằng) hoặc と言いました (nói rằng).',
        exampleJp: 'あしたは いい 天気だと 思います。',
        exampleRomaji: 'Ashita wa ii tenki da to omoimasu.',
        exampleVn: 'Tôi nghĩ rằng ngày mai trời sẽ đẹp.'
      }
    ]
  },
  {
    id: 'mo',
    character: 'も',
    romaji: 'mo',
    primaryRole: 'Cũng (Đồng nhất), Đến mức/Tận, Hoàn toàn không',
    tips: 'Thay thế cho は, が, を khi mang nghĩa "cũng".',
    functions: [
      {
        usage: 'Cũng (Mang tính đồng nhất với đối tượng trước)',
        explanation: 'Tôi cũng là học sinh, bạn cũng thích trà sữa.',
        exampleJp: 'わたしも ベトナム人です。',
        exampleRomaji: 'Watashi mo betonamujin desu.',
        exampleVn: 'Tôi cũng là người Việt Nam.'
      },
      {
        usage: 'Phủ định hoàn toàn: Nghi vấn từ + も + Phủ định',
        explanation: 'Không có ai cả, không ăn gì cả, không đi đâu cả.',
        exampleJp: 'きのう どこへも 行きませんでした。',
        exampleRomaji: 'Kinou doko e mo ikimasen deshita.',
        exampleVn: 'Hôm qua tôi chẳng đi đâu cả.'
      },
      {
        usage: 'Nhấn mạnh số lượng nhiều bất ngờ (Đến tận)',
        explanation: 'Uống tận 5 cốc bia, đợi tận 3 tiếng.',
        exampleJp: 'ビールを ５杯も 飲みました。',
        exampleRomaji: 'Biiru o gohai mo nomimashita.',
        exampleVn: 'Tôi đã uống đến tận 5 cốc bia.'
      }
    ]
  },
  {
    id: 'no',
    character: 'の',
    romaji: 'no',
    primaryRole: 'Sở hữu, Xuất xứ, Thuộc tính, Danh từ hóa',
    tips: 'Quy tắc: Cái lớn đứng trước, cái nhỏ đứng sau (Công ty の Tôi, Xe hơi の Bố).',
    functions: [
      {
        usage: 'Sở hữu của người / vật',
        explanation: 'Sách của tôi, xe của bạn.',
        exampleJp: 'これは わたしの 辞書です。',
        exampleRomaji: 'Kore wa watashi no jisho desu.',
        exampleVn: 'Đây là cuốn từ điển của tôi.'
      },
      {
        usage: 'Xuất xứ, nơi sản xuất, thuộc tổ chức',
        explanation: 'Ô tô của Nhật Bản, học sinh trường Sakura.',
        exampleJp: '日本の 車を 買いました。',
        exampleRomaji: 'Nihon no kuruma o kaimashita.',
        exampleVn: 'Tôi đã mua một chiếc ô tô của Nhật Bản.'
      },
      {
        usage: 'Thay thế cho danh từ đã nhắc phía trước',
        explanation: 'Quyển sách đỏ và quyển (sách) xanh.',
        exampleJp: 'あかいのを ください。',
        exampleRomaji: 'Akai no o kudasai.',
        exampleVn: 'Xin hãy cho tôi cái màu đỏ.'
      }
    ]
  },
  {
    id: 'kara',
    character: 'から',
    romaji: 'kara',
    primaryRole: 'Từ (Địa điểm, Thời gian, Người), Vì (Lý do chủ quan)',
    tips: 'Đi với まで để tạo thành cặp "Từ... Đến...".',
    functions: [
      {
        usage: 'Điểm khởi đầu thời gian, không gian',
        explanation: 'Từ mấy giờ, từ đâu đến đâu.',
        exampleJp: '会社は ８時半からです。',
        exampleRomaji: 'Kaisha wa hachijihan kara desu.',
        exampleVn: 'Công ty bắt đầu từ 8 giờ rưỡi.'
      },
      {
        usage: 'Chỉ nguyên nhân, lý do chủ quan',
        explanation: 'Vì trời nóng nên tôi bật điều hòa.',
        exampleJp: '暑いですから、エアコンを つけました。',
        exampleRomaji: 'Atsui desu kara, eakon o tsukemashita.',
        exampleVn: 'Vì trời nóng nên tôi đã bật điều hòa.'
      }
    ]
  },
  {
    id: 'made',
    character: 'まで',
    romaji: 'made',
    primaryRole: 'Đến (Mốc kết thúc của hành động liên tục)',
    tips: 'Hành động kéo dài liên tục xuyên suốt cho đến mốc thời gian đó (Làm việc đến 5 giờ).',
    functions: [
      {
        usage: 'Mốc kết thúc không gian hoặc thời gian',
        explanation: 'Học đến 10 giờ đêm, đi bộ đến ga.',
        exampleJp: '５時まで 働きます。',
        exampleRomaji: 'Goji made hatarakimasu.',
        exampleVn: 'Tôi làm việc liên tục đến 5 giờ.'
      }
    ]
  },
  {
    id: 'madeni',
    character: 'までに',
    romaji: 'madeni',
    primaryRole: 'Trước khi / Muộn nhất là (Hạn chót hoàn tất hành động)',
    tips: 'Cực kỳ hay thi JLPT! Khác với まで, までに chỉ yêu cầu hành động xong TRƯỚC thời hạn (như nộp báo cáo, trả sách).',
    functions: [
      {
        usage: 'Chỉ hạn chót hành động phải hoàn thành',
        explanation: 'Nộp báo cáo trước thứ 6, trả sách trước ngày mai.',
        exampleJp: '金曜日までに レポートを 出してください。',
        exampleRomaji: 'Kinyoubi madeni repooto o dashite kudasai.',
        exampleVn: 'Hãy nộp báo cáo trước (muộn nhất là) ngày thứ Sáu.'
      }
    ]
  },
  {
    id: 'ya',
    character: 'や',
    romaji: 'ya',
    primaryRole: 'Và (Liệt kê tượng trưng, không đầy đủ)',
    tips: 'Khác với と (toàn bộ 100%), や hàm ý ngoài A và B ra thì vẫn còn những thứ khác nữa. Thường đi kèm など.',
    functions: [
      {
        usage: 'Liệt kê danh từ không đầy đủ (Ví dụ tiêu biểu)',
        explanation: 'Trong phòng có bàn, ghế... (và nhiều đồ khác).',
        exampleJp: '部屋に 机や いすが あります。',
        exampleRomaji: 'Heya ni tsukue ya isu ga arimasu.',
        exampleVn: 'Trong phòng có bàn và ghế (và những thứ khác nữa).'
      }
    ]
  },
  {
    id: 'shika',
    character: 'しか',
    romaji: 'shika',
    primaryRole: 'Chỉ (Bắt buộc đi cùng Động từ PHỦ ĐỊNH)',
    tips: 'Quy tắc vàng: Đã dùng しか thì đuôi câu luôn luôn là PHỦ ĐỊNH (〜ません / 〜ない). Diễn tả cảm giác ít ỏi, tiếc nuối.',
    functions: [
      {
        usage: 'Chỉ có bấy nhiêu thôi (Cảm giác thiếu thốn)',
        explanation: 'Tôi chỉ có 100 yên (không đủ tiền mua nước).',
        exampleJp: '財布に １００円しか ありません。',
        exampleRomaji: 'Saifu ni hyakuen shika arimasen.',
        exampleVn: 'Trong ví chỉ có mỗi 100 yên (chẳng còn gì hơn).'
      }
    ]
  },
  {
    id: 'dake',
    character: 'だけ',
    romaji: 'dake',
    primaryRole: 'Chỉ (Đi với cả Khẳng định và Phủ định)',
    tips: 'Mang tính trung tính, chỉ giới hạn số lượng đơn thuần, không mang nặng cảm xúc tiếc nuối như しか.',
    functions: [
      {
        usage: 'Giới hạn số lượng hoặc phạm vi',
        explanation: 'Chỉ nghỉ một ngày, chỉ có bạn Nam đến.',
        exampleJp: '１日だけ 休みました。',
        exampleRomaji: 'Ichinichi dake yasumimashita.',
        exampleVn: 'Tôi chỉ nghỉ đúng một ngày.'
      }
    ]
  }
];

export const CONFUSABLE_PAIRS: ConfusablePair[] = [
  {
    id: 'wa_vs_ga',
    title: 'Phân biệt: は (Wa) vs が (Ga)',
    particles: ['は', 'が'],
    coreDistinction: 'は nhấn mạnh VỊ NGỮ phía sau (chủ đề đã biết); が nhấn mạnh CHỦ NGỮ phía trước (ai/cái gì làm, thông tin mới).',
    mnemonic: 'Muốn nhấn mạnh "làm cái gì, là ai" ➔ Dùng は. Muốn nhấn mạnh "chính ai, chính cái gì" ➔ Dùng が.',
    cases: [
      {
        particle: 'は',
        condition: 'Chủ đề quen thuộc đã biết, đưa ra nhận xét phía sau',
        exampleJp: '田中さんは 先生です。',
        exampleVn: 'Anh Tanaka (nói về anh ấy) là giáo viên.'
      },
      {
        particle: 'が',
        condition: 'Trả lời câu hỏi "Ai làm việc đó?" (Nhấn mạnh chủ thể)',
        exampleJp: 'だれが ケーキを 食べましたか。➔ 田中さんが 食べました。',
        exampleVn: 'Ai đã ăn bánh kem? ➔ Chính anh Tanaka đã ăn.'
      },
      {
        particle: 'が',
        condition: 'Hiện tượng tự nhiên đập vào mắt người nói',
        exampleJp: 'あ、雪が 降ってきました。',
        exampleVn: 'A, tuyết đang rơi kìa.'
      },
      {
        particle: 'が',
        condition: 'Chủ ngữ trong mệnh đề phụ bổ nghĩa',
        exampleJp: '彼が 住んでいる 町は 静かです。',
        exampleVn: 'Thị trấn mà anh ấy đang sống rất yên bình.'
      }
    ]
  },
  {
    id: 'ni_vs_de',
    title: 'Phân biệt: に (Ni) vs で (De) chỉ nơi chốn',
    particles: ['に', 'で'],
    coreDistinction: 'に chỉ nơi TỒN TẠI tĩnh (ở yên đó); で chỉ nơi diễn ra HÀNH ĐỘNG tích cực (làm gì đó ở đó).',
    mnemonic: 'Động từ tĩnh (あります, います, 住みます) ➔ Đi với に. Động từ hành động (勉強します, 食べます, 買います) ➔ Đi với で.',
    cases: [
      {
        particle: 'に',
        condition: 'Nơi có mặt / tồn tại của người hoặc vật',
        exampleJp: '庭に 犬が います。',
        exampleVn: 'Trong sân có một con chó (ở yên đó).'
      },
      {
        particle: 'で',
        condition: 'Nơi diễn ra hành vi, sự kiện',
        exampleJp: '庭で 犬と 遊びます。',
        exampleVn: 'Tôi chơi đùa với chó ở trong sân (hoạt động tích cực).'
      }
    ]
  },
  {
    id: 'made_vs_madeni',
    title: 'Phân biệt: まで (Made) vs までに (Madeni)',
    particles: ['まで', 'までに'],
    coreDistinction: 'まで: Hành động kéo dài LIÊN TỤC đến lúc đó; までに: HẠN CHÓT (hành động chỉ cần làm xong trước lúc đó).',
    mnemonic: 'Làm việc / học / ngủ liên tục ➔ Dùng まで. Nộp bài / trả tiền / đến nơi ➔ Dùng までに.',
    cases: [
      {
        particle: 'まで',
        condition: 'Hành động duy trì liên tục',
        exampleJp: '午後５時まで 働きます。',
        exampleVn: 'Tôi làm việc liên tục đến tận 5 giờ chiều.'
      },
      {
        particle: 'までに',
        condition: 'Thời hạn muộn nhất phải hoàn thành',
        exampleJp: '午後５時までに 書類を 出してください。',
        exampleVn: 'Xin hãy nộp tài liệu trước 5 giờ chiều (nộp lúc 2h, 3h, 4h đều được).'
      }
    ]
  },
  {
    id: 'o_vs_ga',
    title: 'Phân biệt: を (O) vs が (Ga) với mong muốn & năng lực',
    particles: ['を', 'が'],
    coreDistinction: 'Tha động từ thông thường dùng を; nhưng khi chuyển sang Thể Muốn (〜たい) hoặc Thể Khả Năng (〜できる/Khả năng) thì đối tượng ưu tiên dùng が.',
    mnemonic: 'Uống nước = 水を飲む. Muốn uống nước = 水が飲みたい (hoặc を). Có thể uống = 水が飲める.',
    cases: [
      {
        particle: 'を',
        condition: 'Tha động từ chỉ hành động thuần túy',
        exampleJp: '日本語を 勉強します。',
        exampleVn: 'Tôi học tiếng Nhật.'
      },
      {
        particle: 'が',
        condition: 'Đi với tính từ, năng lực, sở thích, khả năng',
        exampleJp: '日本語が 話せます。',
        exampleVn: 'Tôi có thể nói được tiếng Nhật.'
      },
      {
        particle: 'が',
        condition: 'Đi với Thể Muốn (たい)',
        exampleJp: '新しい 車が ほしいです / 買いたいです。',
        exampleVn: 'Tôi muốn có một chiếc xe mới / muốn mua một chiếc xe mới.'
      }
    ]
  },
  {
    id: 'kara_vs_node',
    title: 'Phân biệt: から (Kara) vs ので (Node) chỉ nguyên nhân',
    particles: ['から', 'ので'],
    coreDistinction: 'から mang cảm xúc CHỦ QUAN, có thể đi với mệnh lệnh/nhờ vả; ので mang tính KHÁCH QUAN, lịch sự, nhẹ nhàng.',
    mnemonic: 'Nhờ vả, rủ rê, cấm đoán ➔ Bắt buộc dùng から. Xin phép sếp, giải thích trang trọng ➔ Ưu tiên dùng ので.',
    cases: [
      {
        particle: 'から',
        condition: 'Ý kiến cá nhân, mệnh lệnh, rủ rê',
        exampleJp: '危ないですから、触らないでください。',
        exampleVn: 'Vì nguy hiểm đấy, xin đừng chạm vào (nhắc nhở trực tiếp).'
      },
      {
        particle: 'ので',
        condition: 'Lý do khách quan, xin phép lịch sự',
        exampleJp: '用事が ありますので、お先に 失礼します。',
        exampleVn: 'Vì có chút việc bận nên em xin phép về trước ạ (lịch sự, tự nhiên).'
      }
    ]
  }
];
