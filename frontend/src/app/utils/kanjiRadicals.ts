export interface RadicalInfo {
  character: string;       // Ký tự bộ thủ (ví dụ: 人 hoặc 亻)
  sinoVietnamese: string;  // Tên Hán Việt (ví dụ: Nhân)
  meaning: string;         // Nghĩa tiếng Việt (ví dụ: Người)
  description: string;     // Mẹo ghi nhớ hình ảnh chi tiết
  examples: { char: string; meaning: string; romaji: string }[]; // Ví dụ Kanji thực tế
}

// Từ điển 50 bộ thủ cốt lõi nhất phục vụ học Kanji N5 & N4
export const RADICALS_DICT: Record<string, RadicalInfo> = {
  '人': {
    character: '人 (亻)',
    sinoVietnamese: 'Nhân',
    meaning: 'Người',
    description: 'Hình ảnh con người đang đứng dang chân bước đi vững chãi. Ở dạng biến thể đứng bên trái (亻), nó gọi là bộ Nhân đứng.',
    examples: [
      { char: '休', meaning: 'Nghỉ ngơi', romaji: 'yasu(mu)' },
      { char: '会', meaning: 'Gặp gỡ', romaji: 'a(u)' },
      { char: '体', meaning: 'Cơ thể', romaji: 'karada' }
    ]
  },
  '女': {
    character: '女',
    sinoVietnamese: 'Nữ',
    meaning: 'Phụ nữ, con gái',
    description: 'Mô phỏng hình ảnh người phụ nữ xưa đang quỳ gối, khoanh tay trước ngực thể hiện sự thùy mị, đoan trang.',
    examples: [
      { char: '好', meaning: 'Thích', romaji: 'su(ki)' },
      { char: '安', meaning: 'Yên bình/Rẻ', romaji: 'yasu(i)' },
      { char: '妹', meaning: 'Em gái', romaji: 'imouto' }
    ]
  },
  '子': {
    character: '子',
    sinoVietnamese: 'Tử',
    meaning: 'Con cái, đứa trẻ',
    description: 'Hình vẽ một đứa trẻ sơ sinh đang quấn tã, hai tay dang rộng vẫy chào cha mẹ.',
    examples: [
      { char: '学', meaning: 'Học tập', romaji: 'mana(bu)' },
      { char: '好', meaning: 'Thích', romaji: 'su(ki)' },
      { char: '字', meaning: 'Chữ viết', romaji: 'ji' }
    ]
  },
  '口': {
    character: '口',
    sinoVietnamese: 'Khẩu',
    meaning: 'Cái miệng, lối vào',
    description: 'Hình tròn vẽ cái miệng mở ra để nói ăn hoặc chào hỏi, sau viết thành hình ô vuông.',
    examples: [
      { char: '言', meaning: 'Nói', romaji: 'i(u)' },
      { char: '名', meaning: 'Tên', romaji: 'namae' },
      { char: '問', meaning: 'Hỏi', romaji: 'to(u)' }
    ]
  },
  '日': {
    character: '日',
    sinoVietnamese: 'Nhật',
    meaning: 'Mặt trời, ngày',
    description: 'Vẽ hình mặt trời hình tròn có một dấu chấm ở giữa (tượng trưng cho năng lượng), sau viết vuông vức lại.',
    examples: [
      { char: '明', meaning: 'Sáng tỏ', romaji: 'aka(rui)' },
      { char: '時', meaning: 'Thời gian', romaji: 'toki' },
      { char: '早', meaning: 'Sớm', romaji: 'haya(i)' }
    ]
  },
  '月': {
    character: '月',
    sinoVietnamese: 'Nguyệt',
    meaning: 'Mặt trăng, tháng, thịt',
    description: 'Vẽ vầng trăng khuyết có hai đám mây che. Trong nhiều chữ liên quan đến cơ thể, nó đóng vai trò biến thể bộ Nhục (thịt).',
    examples: [
      { char: '明', meaning: 'Sáng tỏ', romaji: 'aka(rui)' },
      { char: '朝', meaning: 'Buổi sáng', romaji: 'asa' },
      { char: '服', meaning: 'Quần áo', romaji: 'fuku' }
    ]
  },
  '山': {
    character: '山',
    sinoVietnamese: 'Sơn',
    meaning: 'Núi, ngọn núi',
    description: 'Vẽ hình ba ngọn núi trùng điệp nhô lên, ngọn ở giữa cao nhất.',
    examples: [
      { char: '川', meaning: 'Sông', romaji: 'kawa' },
      { char: '岩', meaning: 'Đá tảng', romaji: 'iwa' },
      { char: '炭', meaning: 'Than đá', romaji: 'sumi' }
    ]
  },
  '川': {
    character: '川',
    sinoVietnamese: 'Xuyên',
    meaning: 'Sông, dòng sông',
    description: 'Hình ảnh dòng nước chảy cuồn cuộn giữa hai bờ sông dựng đứng.',
    examples: [
      { char: '山', meaning: 'Núi', romaji: 'yama' },
      { char: '順', meaning: 'Thuận lợi', romaji: 'jun' },
      { char: '州', meaning: 'Tỉnh/Bang', romaji: 'shuu' }
    ]
  },
  '水': {
    character: '水 (氵)',
    sinoVietnamese: 'Thủy',
    meaning: 'Nước, chất lỏng',
    description: 'Hình dòng nước chảy tràn lan và các giọt nước bắn ra. Khi đứng bên trái chữ thường biến đổi thành bộ Chấm thủy (氵).',
    examples: [
      { char: '海', meaning: 'Biển', romaji: 'umi' },
      { char: '漢', meaning: 'Chữ Hán/Hán tộc', romaji: 'kan' },
      { char: '洗', meaning: 'Rửa', romaji: 'ara(u)' }
    ]
  },
  '火': {
    character: '火 (灬)',
    sinoVietnamese: 'Hỏa',
    meaning: 'Lửa, nhiệt độ',
    description: 'Hình ảnh ngọn lửa đang bùng cháy dữ dội từ củi khô. Khi nằm ở đáy chữ thường biến thành bốn dấu chấm (灬) gọi là bộ Hỏa nằm.',
    examples: [
      { char: '秋', meaning: 'Mùa thu', romaji: 'aki' },
      { char: '黒', meaning: 'Màu đen', romaji: 'kuro(i)' },
      { char: '焼', meaning: 'Nướng', romaji: 'ya(ku)' }
    ]
  },
  '土': {
    character: '土',
    sinoVietnamese: 'Thổ',
    meaning: 'Đất, mặt đất',
    description: 'Hình ảnh mầm cây đang nhú lên sinh trưởng từ lòng đất màu mỡ.',
    examples: [
      { char: '地', meaning: 'Đất đai', romaji: 'chi' },
      { char: '場', meaning: 'Địa điểm', romaji: 'ba' },
      { char: '赤', meaning: 'Màu đỏ', romaji: 'aka(i)' }
    ]
  },
  '木': {
    character: '木',
    sinoVietnamese: 'Mộc',
    meaning: 'Cây cối, gỗ',
    description: 'Hình vẽ một cái cây thẳng đứng có cành lá xum xuê phía trên và rễ cắm sâu xuống lòng đất.',
    examples: [
      { char: '林', meaning: 'Rừng thưa', romaji: 'hayashi' },
      { char: '森', meaning: 'Rừng rậm', romaji: 'mori' },
      { char: '校', meaning: 'Trường học', romaji: 'kou' }
    ]
  },
  '金': {
    character: '金',
    sinoVietnamese: 'Kim',
    meaning: 'Vàng, kim loại, tiền bạc',
    description: 'Hình ảnh mái nhà che chở các hạt vàng quý giá ẩn sâu trong lòng đất.',
    examples: [
      { char: '銀', meaning: 'Bạc', romaji: 'gin' },
      { char: '鉄', meaning: 'Sắt', romaji: 'tetsu' },
      { char: '銭', meaning: 'Tiền xu', romaji: 'sen' }
    ]
  },
  '力': {
    character: '力',
    sinoVietnamese: 'Lực',
    meaning: 'Sức mạnh, dùng sức',
    description: 'Mô phỏng hình ảnh cánh tay gồng lên cơ bắp hoặc cái cày nông nghiệp cần dùng nhiều sức lực để đẩy.',
    examples: [
      { char: '男', meaning: 'Đàn ông', romaji: 'otoko' },
      { char: '動', meaning: 'Chuyển động', romaji: 'ugo(ku)' },
      { char: '勉', meaning: 'Cố gắng', romaji: 'tsuto(meru)' }
    ]
  },
  '言': {
    character: '言',
    sinoVietnamese: 'Ngôn',
    meaning: 'Nói, lời nói, ngôn từ',
    description: 'Hình ảnh cái miệng (口) đang phát ra âm thanh, phía trên là các nét ngang tượng trưng cho làn sóng âm thanh truyền đi.',
    examples: [
      { char: '話', meaning: 'Nói chuyện', romaji: 'hana(su)' },
      { char: '読', meaning: 'Đọc', romaji: 'yo(mu)' },
      { char: '語', meaning: 'Ngôn ngữ', romaji: 'go' }
    ]
  },
  '行': {
    character: '行 (彳)',
    sinoVietnamese: 'Hành',
    meaning: 'Đi, thực hành, bước đi',
    description: 'Hình ảnh ngã tư đường lớn nơi mọi người qua lại. Biến thể bên trái (彳) gọi là bộ Xích (bước chân trái).',
    examples: [
      { char: '行', meaning: 'Đi', romaji: 'i(ku)' },
      { char: '律', meaning: 'Luật lệ', romaji: 'ritsu' },
      { char: '徒', meaning: 'Học trò', romaji: 'to' }
    ]
  },
  '見': {
    character: '見',
    sinoVietnamese: 'Kiến',
    meaning: 'Nhìn, trông thấy',
    description: 'Phía trên là con mắt (目 - Mục), phía dưới là đôi chân đang đi đứng để quan sát vạn vật.',
    examples: [
      { char: '覚', meaning: 'Nhớ ra', romaji: 'obo(eru)' },
      { char: '親', meaning: 'Bố mẹ', romaji: 'oya' },
      { char: '観', meaning: 'Xem/Quan sát', romaji: 'kan' }
    ]
  },
  '門': {
    character: '門',
    sinoVietnamese: 'Môn',
    meaning: 'Cổng lớn, cánh cửa',
    description: 'Hình ảnh một cánh cổng lớn hai cánh mở ra ở lối vào của cung điện hoặc ngôi nhà truyền thống.',
    examples: [
      { char: '間', meaning: 'Khoảng cách/Giữa', romaji: 'aida' },
      { char: '聞', meaning: 'Nghe', romaji: 'ki(ku)' },
      { char: '開', meaning: 'Mở', romaji: 'a(keru)' }
    ]
  },
  '車': {
    character: '車',
    sinoVietnamese: 'Xa',
    meaning: 'Xe cộ, phương tiện',
    description: 'Hình ảnh chiếc xe ngựa kéo từ trên cao nhìn xuống: có hai bánh xe hai bên, trục xe ở giữa và buồng lái.',
    examples: [
      { char: '転', meaning: 'Lăn/Chuyển', romaji: 'koro(garu)' },
      { char: '軽', meaning: 'Nhẹ', romaji: 'karu(i)' },
      { char: '輸', meaning: 'Vận chuyển', romaji: 'yu' }
    ]
  },
  '貝': {
    character: '貝',
    sinoVietnamese: 'Bối',
    meaning: 'Con sò, tiền tệ',
    description: 'Hình con sò mở vỏ. Thời cổ đại con sò được dùng làm tiền tệ giao dịch → các chữ chứa bộ Bối đều liên quan đến tiền bạc, mua bán.',
    examples: [
      { char: '買', meaning: 'Mua', romaji: 'ka(u)' },
      { char: '員', meaning: 'Thành viên', romaji: 'in' },
      { char: '貸', meaning: 'Cho vay', romaji: 'ka(su)' }
    ]
  },
  '糸': {
    character: '糸',
    sinoVietnamese: 'Mịch',
    meaning: 'Sợi chỉ, tơ lụa',
    description: 'Hình ảnh một bó tơ tằm đã được se sợi buộc thắt nút ở giữa.',
    examples: [
      { char: '終', meaning: 'Kết thúc', romaji: 'o(waru)' },
      { char: '紙', meaning: 'Giấy', romaji: 'kami' },
      { char: '結', meaning: 'Liên kết', romaji: 'mubu(bu)' }
    ]
  },
  '宀': {
    character: '宀',
    sinoVietnamese: 'Miên',
    meaning: 'Mái nhà',
    description: 'Hình ảnh mái nhà có ống khói nhô lên ở giữa và hai bức tường bao che hai bên.',
    examples: [
      { char: '安', meaning: 'An toàn/Rẻ', romaji: 'yasu(i)' },
      { char: '室', meaning: 'Căn phòng', romaji: 'shitsu' },
      { char: '家', meaning: 'Ngôi nhà', romaji: 'ie' }
    ]
  },
  '手': {
    character: '手 (手 / 扌)',
    sinoVietnamese: 'Thủ',
    meaning: 'Cái tay',
    description: 'Vẽ bàn tay năm ngón xòe ra. Khi đứng bên trái chữ thường biến đổi thành bộ Sa tay (扌).',
    examples: [
      { char: '持', meaning: 'Cầm/Nắm', romaji: 'mo(tsu)' },
      { char: '指', meaning: 'Ngón tay', romaji: 'yubi' },
      { char: '打', meaning: 'Đánh/Gõ', romaji: 'u(tsu)' }
    ]
  },
  '足': {
    character: '足',
    sinoVietnamese: 'Túc',
    meaning: 'Cái chân, đầy đủ',
    description: 'Phần trên là khớp gối (口), phần dưới là cẳng chân và bàn chân đang nâng đỡ cơ thể.',
    examples: [
      { char: '走', meaning: 'Chạy', romaji: 'hashi(ru)' },
      { char: '路', meaning: 'Con đường', romaji: 'ji' },
      { char: '踏', meaning: 'Giẫm lên', romaji: 'fu(mu)' }
    ]
  },
  '心': {
    character: '心 (忄)',
    sinoVietnamese: 'Tâm',
    meaning: 'Trái tim, tâm trí, cảm xúc',
    description: 'Mô phỏng hình quả tim sinh học của con người. Khi đứng bên trái chữ biến thành bộ Tâm đứng (忄).',
    examples: [
      { char: '思', meaning: 'Suy nghĩ', romaji: 'omo(u)' },
      { char: '情', meaning: 'Tình cảm', romaji: 'jou' },
      { char: '忙', meaning: 'Bận rộn', romaji: 'isoga(shii)' }
    ]
  },
  '目': {
    character: '目',
    sinoVietnamese: 'Mục',
    meaning: 'Con mắt',
    description: 'Vẽ hình con mắt nằm ngang có con ngươi ở giữa, sau xoay dọc lại để dễ ghép chữ viết.',
    examples: [
      { char: '見', meaning: 'Nhìn', romaji: 'mi(ru)' },
      { char: '着', meaning: 'Mặc áo/Đến nơi', romaji: 'ki(ru)' },
      { char: '省', meaning: 'Tỉnh/Cắt giảm', romaji: 'shou' }
    ]
  },
  '耳': {
    character: '耳',
    sinoVietnamese: 'Nhĩ',
    meaning: 'Cái tai',
    description: 'Vẽ hình vành tai ngoài và các nếp gấp bên trong tai để đón nhận âm thanh.',
    examples: [
      { char: '聞', meaning: 'Nghe', romaji: 'ki(ku)' },
      { char: '職', meaning: 'Nghề nghiệp', romaji: 'shoku' },
      { char: '聖', meaning: 'Thánh thiện', romaji: 'sei' }
    ]
  },
  '食': {
    character: '食 (飠)',
    sinoVietnamese: 'Thực',
    meaning: 'Ăn, thực phẩm',
    description: 'Vẽ hình chiếc nồi cơm có nắp đậy (bên trên) và cái bát đựng thức ăn bên dưới.',
    examples: [
      { char: '飲', meaning: 'Uống', romaji: 'no(mu)' },
      { char: '飯', meaning: 'Cơm', romaji: 'meshi' },
      { char: '館', meaning: 'Tòa nhà/Hội quán', romaji: 'kan' }
    ]
  },
  '父': {
    character: '父',
    sinoVietnamese: 'Phụ',
    meaning: 'Người bố, người cha',
    description: 'Hình ảnh hai bàn tay đang cầm hai chiếc roi/công cụ để răn dạy con cái và làm chủ gia đình.',
    examples: [
      { char: '交', meaning: 'Giao lưu', romaji: 'maji(waru)' },
      { char: '釜', meaning: 'Cái nồi lớn', romaji: 'kama' }
    ]
  },
  '母': {
    character: '母',
    sinoVietnamese: 'Mẫu',
    meaning: 'Người mẹ',
    description: 'Hình ảnh bầu vú người mẹ với hai chấm hai bên tượng trưng cho dòng sữa ngọt lành nuôi lớn con cái.',
    examples: [
      { char: '毎', meaning: 'Mỗi/Hàng ngày', romaji: 'mai' },
      { char: '毒', meaning: 'Chất độc', romaji: 'doku' }
    ]
  },
  '雨': {
    character: '雨',
    sinoVietnamese: 'Vũ',
    meaning: 'Mưa, thời tiết',
    description: 'Mái vòm bầu trời, bên dưới là những hạt nước mưa đang rơi rớt xuống mặt đất.',
    examples: [
      { char: '雪', meaning: 'Tuyết', romaji: 'yuki' },
      { char: '電', meaning: 'Điện lực', romaji: 'den' },
      { char: '雲', meaning: 'Mây', romaji: 'kumo' }
    ]
  },
  '刀': {
    character: '刀 (刂)',
    sinoVietnamese: 'Đao',
    meaning: 'Con dao, thanh kiếm',
    description: 'Hình thanh đao có độ cong sắc bén. Khi đứng bên phải chữ thường biến đổi thành bộ Đao đứng (刂).',
    examples: [
      { char: '切', meaning: 'Cắt', romaji: 'ki(ru)' },
      { char: '分', meaning: 'Phút/Chia ra', romaji: 'wa(karu)' },
      { char: '別', meaning: 'Tách biệt', romaji: 'waka(reru)' }
    ]
  },
  '辶': {
    character: '辶',
    sinoVietnamese: 'Sước',
    meaning: 'Đường đi, bước đi dài',
    description: 'Hình ảnh bàn chân đang bước đi trên con đường, liên quan đến di chuyển, khoảng cách.',
    examples: [
      { char: '道', meaning: 'Con đường', romaji: 'michi' },
      { char: '近', meaning: 'Gần', romaji: 'chika(i)' },
      { char: '送', meaning: 'Gửi đi', romaji: 'oku(ru)' }
    ]
  },
  '示': {
    character: '示 (礻)',
    sinoVietnamese: 'Thị',
    meaning: 'Thần linh, cúng bái',
    description: 'Hình chiếc bàn thờ ba chân dùng để bày đồ tế lễ thần linh. Biến thể bên trái viết là (礻).',
    examples: [
      { char: '社', meaning: 'Đền thờ/Công ty', romaji: 'yashiro' },
      { char: '神', meaning: 'Thần linh', romaji: 'kami' },
      { char: '祝', meaning: 'Chúc mừng', romaji: 'iwa(u)' }
    ]
  },
  '广': {
    character: '广',
    sinoVietnamese: 'Quảng',
    meaning: 'Mái nhà lớn, tòa nhà',
    description: 'Mái hiên của ngôi nhà tựa lưng vào sườn núi, chỉ các tòa nhà to lớn hoặc công trình công cộng.',
    examples: [
      { char: '店', meaning: 'Cửa hàng', romaji: 'mise' },
      { char: '度', meaning: 'Mức độ/Lần', romaji: 'tabi' },
      { char: '広', meaning: 'Rộng rãi', romaji: 'hiro(i)' }
    ]
  },
  '田': {
    character: '田',
    sinoVietnamese: 'Điền',
    meaning: 'Ruộng lúa',
    description: 'Hình vẽ mảnh ruộng lúa nước được chia ô vuông bàn cờ bởi các bờ đất.',
    examples: [
      { char: '男', meaning: 'Đàn ông', romaji: 'otoko' },
      { char: '町', meaning: 'Thành thị/Phố', romaji: 'machi' },
      { char: '思', meaning: 'Suy nghĩ', romaji: 'omo(u)' }
    ]
  },
  '竹': {
    character: '竹 (⺮)',
    sinoVietnamese: 'Trúc',
    meaning: 'Tre, trúc',
    description: 'Hình vẽ hai cành tre lá rủ xuống. Khi nằm ở đầu chữ thường thu nhỏ thành bộ Trúc đầu (⺮).',
    examples: [
      { char: '答', meaning: 'Trả lời', romaji: 'kota(eru)' },
      { char: '算', meaning: 'Tính toán', romaji: 'san' },
      { char: '筆', meaning: 'Bút viết', romaji: 'fude' }
    ]
  },
  '疒': {
    character: '疒',
    sinoVietnamese: 'Nạch',
    meaning: 'Bệnh tật, đau yếu',
    description: 'Hình ảnh một người đang ốm mệt mỏi tựa giường, liên quan đến sức khỏe, bệnh tật.',
    examples: [
      { char: '病', meaning: 'Ốm đau', romaji: 'byou' },
      { char: '疲', meaning: 'Mệt mỏi', romaji: 'tsuka(reru)' },
      { char: '痛', meaning: 'Đau đớn', romaji: 'ita(i)' }
    ]
  },
  '犬': {
    character: '犬 (犭)',
    sinoVietnamese: 'Khuyển',
    meaning: 'Con chó, thú bốn chân',
    description: 'Hình ảnh chú chó đang đứng sủa. Biến thể bên trái viết là bộ Thú (犭).',
    examples: [
      { char: '猫', meaning: 'Con mèo', romaji: 'neko' },
      { char: '犯', meaning: 'Phạm nhân', romaji: 'han' }
    ]
  },
  '魚': {
    character: '魚',
    sinoVietnamese: 'Ngư',
    meaning: 'Con cá',
    description: 'Vẽ đầu cá (phần trên), vảy thân cá (điền ở giữa) và đuôi vây cá (bốn chấm hỏa nằm dưới đáy).',
    examples: [
      { char: '漁', meaning: 'Đánh cá', romaji: 'gyo' },
      { char: '鮮', meaning: 'Tươi sống', romaji: 'sen' }
    ]
  },
  '鳥': {
    character: '鳥',
    sinoVietnamese: 'Điểu',
    meaning: 'Con chim',
    description: 'Vẽ hình chú chim có mỏ, mắt, cánh và móng vuốt bên dưới.',
    examples: [
      { char: '島', meaning: 'Hòn đảo (nơi chim đậu)', romaji: 'shima' },
      { char: '鳴', meaning: 'Chim hót', romaji: 'na(ku)' }
    ]
  },
  '馬': {
    character: '馬',
    sinoVietnamese: 'Mã',
    meaning: 'Con ngựa',
    description: 'Vẽ chú ngựa có bờm dài dựng đứng, chân thon và bốn dấu chấm là chiếc đuôi đang ngoáy.',
    examples: [
      { char: '駅', meaning: 'Nhà ga (nơi đổi ngựa xưa)', romaji: 'eki' },
      { char: '駐', meaning: 'Đỗ xe/Trú lại', romaji: 'chuu' }
    ]
  },
  '白': {
    character: '白',
    sinoVietnamese: 'Bạch',
    meaning: 'Màu trắng, nói rõ',
    description: 'Hình mặt trời nhô lên tỏa ra ánh sáng rực rỡ chói lòa màu trắng.',
    examples: [
      { char: '百', meaning: 'Trăm', romaji: 'hyaku' },
      { char: '的な', meaning: 'Mục tiêu/Đích', romaji: 'teki' }
    ]
  },
  '赤': {
    character: '赤',
    sinoVietnamese: 'Xích',
    meaning: 'Màu đỏ',
    description: 'Cảnh tượng đốt lửa (Hỏa) trên mặt đất (Thổ) tạo ra tàn tro rực cháy màu đỏ hồng.',
    examples: [
      { char: '赤字', meaning: 'Thâm hụt', romaji: 'akaji' }
    ]
  },
  '青': {
    character: '青',
    sinoVietnamese: 'Thanh',
    meaning: 'Màu xanh',
    description: 'Hình ảnh mầm cây non xanh tốt mọc lên từ giếng nước trong vắt.',
    examples: [
      { char: '青年', meaning: 'Thanh niên', romaji: 'seinen' }
    ]
  },
  '黒': {
    character: '黒',
    sinoVietnamese: 'Hắc',
    meaning: 'Màu đen',
    description: 'Lửa (Hỏa 灬) đốt cháy củi bụi trong nhà tạo ra các lớp khói bồ hóng màu đen kịt.',
    examples: [
      { char: '黒板', meaning: 'Bảng đen', romaji: 'kokuban' }
    ]
  },
  '里': {
    character: '里',
    sinoVietnamese: 'Lý',
    meaning: 'Làng quê, dặm',
    description: 'Ruộng lúa (Điền) nằm bên trên mặt đất (Thổ) tạo thành quê hương, bản làng cư ngụ.',
    examples: [
      { char: '重い', meaning: 'Nặng', romaji: 'omoi' },
      { char: '野原', meaning: 'Cánh đồng', romaji: 'nohara' }
    ]
  }
};

// Bản đồ ánh xạ Kanji sang bộ thủ cấu thành của 50 bài Minna no Nihongo (Kanji N5 & một số N4)
export const KANJI_TO_RADICALS: Record<string, string[]> = {
  // Bài 1
  '人': ['人'],
  '学': ['宀', '子'],
  '生': ['土'],
  '先': ['人'],
  '会': ['人', '口'],
  '社': ['示', '土'],
  '員': ['口', '貝'],
  '医': ['刀'],
  '者': ['土', '日'],

  // Bài 2
  '本': ['木'],
  '中': ['口'],
  '国': ['囗', '日'], // Sử dụng viền ngoài và các chi tiết

  // Bài 3
  '駅': ['馬'],
  '何': ['人', '口'],

  // Bài 4
  '時': ['日', '土'],
  '分': ['刀'],
  '半': ['土'],
  '今': ['人'],

  // Bài 5
  '行': ['行'],
  '来': ['木'],
  '帰': ['刀', '宀'],

  // Bài 6
  '食': ['食'],
  '飲': ['食', '口'],
  '見': ['見'],
  '聞': ['門', '耳'],
  '読': ['言', '貝'],
  '书': ['口'],
  '書': ['口'],
  '買': ['貝'],

  // Bài 7
  '手': ['手'],
  '紙': ['糸'],
  '切': ['刀'],
  '送': ['辶', '火'],

  // Bài 8
  '好': ['女', '子'],
  '安': ['宀', '女'],
  '高': ['口'],
  '新': ['木'],
  '古': ['口', '土'],
  '白': ['白'],
  '赤': ['土', '火'],
  '青': ['月'],
  '黒': ['土', '火'],

  // Bài 9
  '友': ['人'],
  '雨': ['雨'],
  '水': ['水'],

  // Bài 10
  '上': ['人'],
  '下': ['人'],
  '左': ['手'],
  '右': ['口'],
  '前': ['刀', '月'],
  '後': ['行'],
  '門': ['門'],

  // Bài 11
  '男': ['田', '力'],
  '女': ['女'],
  '子': ['子'],

  // Bài 12
  '秋': ['火'],
  '春': ['日', '木'],
  '夏': ['足'],
  '冬': ['水'],

  // Bài 13
  '魚': ['魚'],
  '肉': ['月'],
  '茶': ['木'],

  // Bài 14
  '川': ['川'],
  '海': ['水', '女'],
  '車': ['車'],

  // Bài 15
  '住': ['人'],
  '所': ['戸'],

  // Bài 16
  '休': ['人', '木'],
  '体': ['人', '本'],

  // Bài 17
  '病': ['疒', '火'],
  '院': ['宀'],

  // Bài 18
  '電': ['雨', '田'],
  '話': ['言', '口'],

  // Bài 19
  '山': ['山'],

  // Bài 20
  '校': ['木'],
  '大': ['人'],

  // Bài 21
  '思': ['田', '心'],
  '言': ['言'],

  // Bài 22
  '着': ['目'],
  '服': ['月'],

  // Bài 23
  '道': ['辶'],
  '近': ['辶'],

  // Bài 24
  '手': ['手'],

  // Bài 25
  '金': ['金'],
  '銀': ['金'],
  '度': ['广'],
};

// Hàm lấy thông tin chi tiết các bộ thủ cấu thành một chữ Kanji
export function getRadicalsForCharacter(char: string): RadicalInfo[] {
  const radicalChars = KANJI_TO_RADICALS[char];
  
  if (radicalChars && radicalChars.length > 0) {
    return radicalChars
      .map(r => RADICALS_DICT[r] || { character: r, sinoVietnamese: 'Chưa rõ', meaning: 'Nét cấu thành', description: 'Nét vẽ cấu thành chữ.', examples: [] })
      .filter(Boolean);
  }

  // Fallback: nếu chữ đó chính là một bộ thủ trong từ điển
  if (RADICALS_DICT[char]) {
    return [RADICALS_DICT[char]];
  }

  // Fallback 2: Trả về chính nó dạng rỗng
  return [{
    character: char,
    sinoVietnamese: 'Hán tự',
    meaning: 'Nghĩa của chữ',
    description: 'Chữ Hán độc lập chưa được phân tách chi tiết bộ thủ.',
    examples: []
  }];
}

// Hàm lấy chuỗi định dạng đẹp hiển thị nhanh bộ thủ
export function getRadicalsString(char: string): string {
  const details = getRadicalsForCharacter(char);
  return details.map(d => `${d.character} (${d.sinoVietnamese}: ${d.meaning})`).join(' + ');
}
