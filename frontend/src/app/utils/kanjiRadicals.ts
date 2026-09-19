export interface RadicalInfo {
  character: string;       // Ký tự bộ thủ (ví dụ: 人 hoặc 亻)
  sinoVietnamese: string;  // Tên Hán Việt (ví dụ: Nhân)
  meaning: string;         // Nghĩa tiếng Việt (ví dụ: Người)
  description: string;     // Mẹo ghi nhớ hình ảnh chi tiết
  lessonId?: string;       // Thuộc bài học nào (ví dụ: '1-1', '1-2'...)
  examples: { char: string; meaning: string; romaji: string }[]; // Ví dụ Kanji thực tế
  origin?: string;         // Nguồn gốc hình ảnh tượng hình cổ xưa
  kanjiRole?: string;      // Ý nghĩa & vai trò biểu thị khi cấu tạo chữ Kanji
}

export interface RadicalLesson {
  id: string; // 'intro', '1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2', '5-1', '5-2', '6', '7', '8', '9'
  lessonNumber: string; // 'Mở đầu', 'Bài 1.1', 'Bài 1.2', ...
  title: string;
  strokesDescription: string;
  youtubeUrl: string;
  keyIdeas: string[];
  memoryMethod: string;
  radicals: string[]; // Danh sách ký tự bộ thủ trong bài
}

export const RADICAL_LESSONS: RadicalLesson[] = [
  {
    id: 'intro',
    lessonNumber: 'Mở đầu',
    title: 'Bài mở đầu QUAN TRỌNG: Nền tảng & Phương pháp',
    strokesDescription: 'Tổng quan chiết tự',
    youtubeUrl: 'https://www.youtube.com/watch?v=MXB94hGzpR8',
    keyIdeas: [
      'Bộ thủ chính là "bảng chữ cái" cấu thành nên toàn bộ hàng ngàn chữ Hán (Kanji).',
      'Thay vì phải học vẹt 214 bộ thủ cổ, bạn chỉ cần nắm vững ~170 bộ phổ biến nhất trong thực tế.',
      'Nắm các vị trí xuất hiện của bộ thủ trong chữ Kanji: bên trái (bàng), bên phải (tiết), trên đầu (quang), dưới đáy (cước), hoặc bao bọc xung quanh (khung).'
    ],
    memoryMethod: 'Phương pháp "Xây nhà từ móng": Coi mỗi chữ Kanji như một khối nhà lego được ghép từ các khối bộ thủ nhỏ. Hãy hiểu bản chất hình tượng và câu chuyện chiết tự thay vì chép phạt nhiều lần.',
    radicals: []
  },
  {
    id: '1-1',
    lessonNumber: 'Bài 1.1',
    title: '1 nét & 2 nét (Phần 1): 15 Bộ thủ sơ khởi',
    strokesDescription: '1 nét & 2 nét (15 bộ)',
    youtubeUrl: 'https://www.youtube.com/watch?v=y8PcrYSOXkA',
    keyIdeas: [
      '6 nét viết cơ bản sơ khởi cấu thành mọi chữ Hán: nét ngang (Nhất), sổ thẳng (Cổn), dấu chấm (Chủ), phẩy cong (Phiệt), gập ngoặc (Ất), móc ngược (Quyết).',
      '9 bộ 2 nét đầu tiên về con người, sự phân chia và không gian bao bọc.',
      'Phân biệt rõ 3 dáng đứng của con người: Người đứng dang chân (Nhân 人), Người đứng thẳng nghiêm trang (Nhân đứng 亻), Người chạy bước chân (Nhân đi 儿).'
    ],
    memoryMethod: 'Phương pháp "Vần điệu & Ngón tay": Thuộc lòng câu vần "Chủ chấm - Phiệt phẩy - Quyết móc". Giơ 1 ngón tay là Nhất (一), 2 ngón tay là Nhị (二). Đội nắp vung che chắn bảo vệ là Đầu (亠).',
    radicals: ['一', '丨', '丶', '丿', '乙', '亅', '二', '亠', '人', '亻', '儿', '入', '八', '冂', '冖']
  },
  {
    id: '1-2',
    lessonNumber: 'Bài 1.2',
    title: '2 nét (Phần 2): Vũ khí, Công cụ & Con số',
    strokesDescription: '2 nét (15 bộ)',
    youtubeUrl: 'https://www.youtube.com/watch?v=GNu5TNSJJQ4',
    keyIdeas: [
      'Nhóm vũ khí và sức mạnh: Đao 刀 (con dao), Đao đứng 刂 (lưỡi chém), Lực 力 (bắp tay cơ bắp tạo sức mạnh).',
      'Nhóm đồ vật và không gian: Bàn nhỏ (Kỷ 几), Hố lõm (Khảm 凵), Tủ đựng đồ (Phương 匚), Vách núi che chở (Hán 厂).',
      'Con số và khái niệm: Số 10 hoàn chỉnh (Thập 十), Bói toán tương lai (Bốc 卜), Đốt tre liên kết mùa màng (Tiết 卩), Riêng tư cá nhân (Tư 厶), Lặp lại (Hựu 又).'
    ],
    memoryMethod: 'Phương pháp "Hành động & Vũ khí": Cầm Dao (刀/刂) chém dứt khoát cái cũ để bắt đầu cái mới; Dùng Lực (力) bắp tay siêng năng nỗ lực; Vòng tay mẹ mang bầu che chở (Bao 勹); Thập (十) là chữ thập đỏ tròn vẹn số 10.',
    radicals: ['冫', '几', '凵', '刀', '刂', '力', '勹', '匕', '匚', '十', '卜', '卩', '厂', '厶', '又']
  },
  {
    id: '2-1',
    lessonNumber: 'Bài 2.1',
    title: '3 nét (Phần 1): Con người, Gia đình & Xã hội',
    strokesDescription: '3 nét (15 bộ)',
    youtubeUrl: 'https://www.youtube.com/watch?v=1qRxLPtsMok',
    keyIdeas: [
      'Phân biệt các cặp bộ thủ đối xứng dễ nhầm: Khẩu 口 (miệng nhỏ mở ra) vs Vi 囗 (khung vuông lớn bao trọn vương quốc); Thổ 土 (đất, nét dưới dài hơn) vs Sĩ 士 (kẻ sĩ học rộng, nét trên dài hơn).',
      'Tình mẫu tử và gia đình: Mẹ (Nữ 女) ôm Con (Tử 子) dưới Mái nhà ấm áp (Miên 宀) tạo nên chữ Hảo 好 (thích).',
      'Thời gian và sự sống: Đêm tối tĩnh lặng (Tịch 夕), Mầm sống non nớt đang vươn mình (Triệt 屮), Xác chết vô hồn (Thi 尸).'
    ],
    memoryMethod: 'Phương pháp "Gia đình & Nhân sinh": Đất (Thổ) nâng đỡ vạn vật; Kẻ sĩ (Sĩ) học 1 biết 10, nuôi chí lớn từ trong tâm; Mẹ bế con dưới mái nhà; Ninja rùa đi lùng kẻ đánh lén phía sau (Truy 夂).',
    radicals: ['口', '囗', '土', '士', '夂', '夕', '大', '女', '子', '宀', '寸', '小', '尢', '尸', '屮']
  },
  {
    id: '2-2',
    lessonNumber: 'Bài 2.2',
    title: '3 nét (Phần 2): Địa lý, Lao động & Bước chân',
    strokesDescription: '3 nét (16 bộ)',
    youtubeUrl: 'https://www.youtube.com/watch?v=u2VobDFexds',
    keyIdeas: [
      'Thiên nhiên địa lý: Núi cao ba ngọn vững chãi (Sơn 山), Dòng sông uốn lượn (Xuyên 巛) và dòng nước chảy xuôi (川).',
      'Công cụ và lao động: Cái đe người thợ (Công 工), Khăn vải (Cân 巾), Phơi khô 10 lần (Can 干), Cây cung kéo căng (Cung 弓).',
      'Chuyển động và không gian: Mái nhà lớn đồ sộ (Nghiễm 广), Bước tiến dài đi xa (Dẫn 廴), Bước chân chậm rãi chờ đợi (Xích 彳).'
    ],
    memoryMethod: 'Phương pháp "Địa lý & Chuyển động": Núi Tam Đảo sừng sững (Sơn); Nước chảy êm đềm mang thuận lợi (Xuyên); Thợ thủ công (Công) dùng sức tạo thành công; So sánh Dẫn 廴 (bước dài) vs Xích 彳 (chân bị xích đi chậm).',
    radicals: ['山', '巛', '川', '工', '己', '巾', '干', '幺', '广', '廴', '廾', '弋', '弓', '彐', '彡', '彳']
  },
  {
    id: '3-1',
    lessonNumber: 'Bài 3.1',
    title: '4 nét (Phần 1): Cảm xúc, Vũ trụ & Tự nhiên',
    strokesDescription: '4 nét (16 bộ)',
    youtubeUrl: 'https://www.youtube.com/watch?v=-D8WQvz1mxI',
    keyIdeas: [
      'Tâm tư và hành động: Con tim rung động (Tâm 忄), Bàn tay hành động thao tác (Thủ 扌), Cánh cửa gia đình (Hộ 戶).',
      'Vũ trụ và tự nhiên: Mặt trời ban ngày (Nhật 日), Mặt trăng ban đêm hay miếng thịt cơ thể (Nguyệt 月), Cây cối xanh tươi (Mộc 木).',
      'Quy tắc và vũ lực: Cây giáo chiến đấu (Qua 戈), Cái rìu chặt đốn (Cân 斤), Phương hướng quy tắc (Phương 方), Đấu đong (Đẩu 斗).'
    ],
    memoryMethod: 'Phương pháp "Cảm xúc & Thiên nhiên": Con tim (忄) luôn cảm nhận sâu sắc; Bàn tay (扌) nắm bắt tương lai; Mặt trời (日) kết hợp Mặt trăng (月) tạo nên ánh sáng Sáng tỏ (Minh 明); Cây cối (Mộc) vươn cành đón nắng.',
    radicals: ['心', '戈', '戶', '手', '支', '攴', '文', '斗', '斤', '方', '无', '日', '月', '木', '欠', '止']
  },
  {
    id: '3-2',
    lessonNumber: 'Bài 3.2',
    title: '4 nét (Phần 2): Ngũ hành, Muông thú & Sinh tồn',
    strokesDescription: '4 nét (17 bộ)',
    youtubeUrl: 'https://www.youtube.com/watch?v=dIJ35Yg1rCo',
    keyIdeas: [
      'Năng lượng tự nhiên: 3 giọt nước tuôn chảy (Thủy 氵), 4 chấm lửa đun nấu (Hỏa 灬), Luồng không khí hơi thở (Khí 气).',
      'Động vật và loài thú: Chó săn nhanh nhẹn (Khuyển 犭), Trâu cày siêng năng (Ngưu 牜), Móng vuốt cào vồ (Trảo 爪).',
      'Gia đình và sự tương phản: Người cha trụ cột cầm roi nghiêm khắc (Phụ 父), Xương tàn chết chóc (Đãi 歹), Hai nửa mảnh ván gỗ (Tường 爿 & Phiến 片).'
    ],
    memoryMethod: 'Phương pháp "Ngũ hành & Muông thú": Nước dập tắt Lửa; Chó săn trung thành bên đàn Trâu cày; Người cha nghiêm khắc rèn luyện con cái; Móng vuốt loài thú giữ chặt con mồi.',
    radicals: ['歹', '殳', '毋', '比', '毛', '氏', '气', '水', '火', '爪', '父', '爻', '爿', '片', '牙', '牛', '犬']
  },
  {
    id: '4-1',
    lessonNumber: 'Bài 4.1',
    title: '5 nét (Phần 1): Nông nghiệp, Mùa màng & Bệnh tật',
    strokesDescription: '5 nét (11 bộ)',
    youtubeUrl: 'https://www.youtube.com/watch?v=W3uqSBHOo5A',
    keyIdeas: [
      'Đời sống nông thôn: Ruộng lúa 4 ô bờ vùng vẫy (Điền 田), Quả dưa bầu bí trên giàn (Qua 瓜), Ngói đất nung (Ngõa 瓦).',
      'Sinh sôi và ngọc báu: Vua đeo thêm viên ngọc chấm bên hông (Ngọc 玉), Mầm sống sinh sôi nảy nở (Sinh 生), Vị ngọt ngào cam chịu (Cam 甘).',
      'Sức khỏe con người: Người ốm nằm trên giường bệnh sốt toát mồ hôi (Nạch 疒), Sử dụng đồ dùng (Dụng 用), Bàn chân bước đạp (Bát 癶).'
    ],
    memoryMethod: 'Phương pháp "Ruộng đồng & Trị liệu": Vua (王) đeo ngọc bên hông thành Ngọc (玉); Đất đai làm Ruộng (Điền) trù phú; Bệnh tật (Nạch 疒) cần tựa lưng nghỉ ngơi tĩnh dưỡng.',
    radicals: ['玄', '玉', '瓜', '瓦', '甘', '生', '用', '田', '疋', '疒', '癶']
  },
  {
    id: '4-2',
    lessonNumber: 'Bài 4.2',
    title: '5 nét (Phần 2): Giác quan, Tâm linh & Vũ khí',
    strokesDescription: '5 nét (12 bộ)',
    youtubeUrl: 'https://www.youtube.com/watch?v=0uxVBpZIjyQ',
    keyIdeas: [
      'Giác quan và thân thể: Con mắt có con ngươi ở giữa (Mục 目), Đứng thẳng độc lập (Lập 立), Da dẻ trắng trẻo (Bạch 白 & Bì 皮).',
      'Vũ khí và đá tảng: Ngọn giáo đâm mâu (Mâu 矛), Mũi tên bắn trúng đích (Thỉ 矢), Hòn đá rơi dưới sườn núi (Thạch 石).',
      'Tín ngưỡng và mùa gặt: Bàn thờ cúng tế thần linh (Thị/Kỳ 礻), Cây lúa uốn cong trĩu hạt (Hòa 禾), Hang hốc đá che chở (Huyệt 穴).'
    ],
    memoryMethod: 'Phương pháp "Tín ngưỡng & Giác quan": Mắt (Mục) ngắm bắn Mũi tên (Thỉ) chính xác; Thần linh (Thị 礻) phù hộ Lúa (Hòa) trĩu bông; Đĩa bát (Mãnh 皿) đựng đồ cúng trang nghiêm.',
    radicals: ['白', '皮', '皿', '目', '矛', '矢', '石', '示', '禹', '禾', '穴', '立']
  },
  {
    id: '5-1',
    lessonNumber: 'Bài 5.1',
    title: '6 nét (Phần 1): Thủ công, Văn hóa & Trưởng thành',
    strokesDescription: '6 nét (14 bộ)',
    youtubeUrl: 'https://www.youtube.com/watch?v=vEEee_Ti4ik',
    keyIdeas: [
      'Vật liệu và sản vật: Cây tre lá tre (Trúc ⺮), Hạt gạo ngọc thực (Mễ 米), Cuộn tơ dệt lụa (Mịch 糸), Vò bình sành (Phẫu 缶), Lưới đánh cá (Võng 罒).',
      'Sinh vật hiền hòa: Con cừu hiền lành cát tường (Dương 羊), Lông vũ cánh chim bay (Vũ 羽).',
      'Kính lão và học hỏi: Ông lão chống gậy từng trải (Lão 老), Lắng nghe thấu hiểu (Nhĩ 耳), Cây bút lông ghi chép (Duật 聿), Vị quan cận thần trung thành (Thần 臣).'
    ],
    memoryMethod: 'Phương pháp "Văn hóa & Kính lão": Hai cành tre (Trúc) đung đưa; Hạt gạo (Mễ) nuôi sống đời người; Ông lão (Lão) râu dài chống gậy lắng tai (Nhĩ) nghe lời dạy của bề trên.',
    radicals: ['竹', '米', '糸', '缶', '网', '羊', '羽', '老', '而', '耒', '耳', '聿', '肉', '臣']
  },
  {
    id: '5-2',
    lessonNumber: 'Bài 5.2',
    title: '6 nét (Phần 2): Sinh vật, Cơ thể & Giao thông',
    strokesDescription: '6 nét (15 bộ)',
    youtubeUrl: 'https://www.youtube.com/watch?v=Nd9etXjAmpE',
    keyIdeas: [
      'Thế giới sinh vật: Thảo mộc hoa cỏ xanh rì (Thảo 艹), Chúa sơn lâm oai phong (Hô 虍), Sâu bọ côn trùng (Trùng 虫).',
      'Cơ thể và sinh mệnh: Tự trỏ vào mũi mình (Tự 自), Cái lưỡi nếm vị (Thiệt 舌), Giọt máu sinh mệnh (Huyết 血), Tấm áo vạt chéo (Y 衤).',
      'Chuyển động và địa lý: Con thuyền lướt sóng (Chu 舟), Ngã tư đường tấp nập (Hành 行), Dừng lại quẻ Cấn (Cấn 艮), Đến đích tột cùng (Chí 至).'
    ],
    memoryMethod: 'Phương pháp "Sinh thái học & Y phục": Cỏ cây (Thảo 艹) nơi Côn trùng (Trùng) sinh sống; Con hổ (Hô) gầm vang núi rừng; Mặc Áo (Y 衤) đi ra Ngã tư đường (Hành) bước lên Thuyền (Chu).',
    radicals: ['自', '至', '臼', '舌', '舛', '舟', '艮', '色', '艸', '虍', '虫', '血', '行', '衣', '襾']
  },
  {
    id: '6',
    lessonNumber: 'Bài 6',
    title: '7 nét: Giao tiếp, Tiền tệ & Di chuyển',
    strokesDescription: '7 nét (20 bộ)',
    youtubeUrl: 'https://www.youtube.com/watch?v=2P0orXefwsM',
    keyIdeas: [
      'Ngôn ngữ và tài chính: Lời nói từ miệng phát ra (Ngôn 言), Vỏ sò tiền tệ của cải (Bối 貝), Bình rượu lên men thơm nồng (Dậu 酉).',
      'Chuyển động thân thể: Bước chân chạy mau (Tẩu 走), Bàn chân đứng vững (Túc 足), Thân thể vóc dáng (Thân 身), Xe cộ bánh lăn (Xa 車), Con đường bước đi (Sước 辶).',
      'Làng quê và xã hội: Khe núi thung lũng (Cốc 谷), Hạt đậu (Đậu 豆), Heo béo nuôi nhà (Thỉ 豕), Làng xóm đất phong (Ấp 阝 bên phải), Làng quê dặm đường (Lý 里).'
    ],
    memoryMethod: 'Phương pháp "Thương mại & Hành trình": Dùng Lời nói (Ngôn) đổi lấy Vỏ sò (Bối = tiền); Lên Xe (Xa) phóng trên Con đường (Sước 辶); Chạy bộ (Tẩu) bằng Chân (Túc) về thăm Làng quê (Lý). Phân biệt 阝 bên phải là Làng xóm (Ấp).',
    radicals: ['見', '角', '言', '谷', '豆', '豕', '豸', '貝', '赤', '走', '足', '身', '車', '辛', '辰', '辶', '邑', '酉', '釆', '里']
  },
  {
    id: '7',
    lessonNumber: 'Bài 7',
    title: '8 nét: Kiến trúc, Thời tiết & Kim loại',
    strokesDescription: '8 nét (8 bộ)',
    youtubeUrl: 'https://www.youtube.com/watch?v=EXOhWcNwuFU',
    keyIdeas: [
      'Công trình và đất đai: Cánh cổng làng 2 cánh lớn (Môn 門), Đồi núi che chắn bên trái (Phụ 阝), Chim đuôi ngắn đậu trên cành (Chuy 隹).',
      'Khí hậu và kim loại: Mưa rào từ trời tuôn rơi (Vũ 雨), Vàng kim loại quý giá (Kim 金), Màu xanh thanh xuân (Thanh 青), Trái ngược sai quấy (Phi 非), Dài lâu lớn tuổi (Trường 長).'
    ],
    memoryMethod: 'Phương pháp "Kiến trúc & Khí tượng": Cổng làng (Môn) bằng Vàng (Kim) sáng chói; Cơn mưa (Vũ) đổ xuống Đồi núi (Phụ 阝 bên trái); Cây cối khoác màu Xanh (Thanh) biếc. Ghi nhớ sâu sắc: 阝 bên trái là Gò núi (Phụ), 阝 bên phải là Làng quê (Ấp).',
    radicals: ['金', '長', '門', '阜', '隹', '雨', '青', '非']
  },
  {
    id: '8',
    lessonNumber: 'Bài 8',
    title: '9 nét: Cảm quan, Ẩm thực & Thời vận',
    strokesDescription: '9 nét (11 bộ)',
    youtubeUrl: 'https://www.youtube.com/watch?v=WpgSFyI15aA',
    keyIdeas: [
      'Ăn uống và cảm giác: Ăn uống thức ăn nuôi sống (Thực 食), Mùi thơm lúa chín tỏa ngát (Hương 香), Âm thanh khúc nhạc (Âm 音), Khuôn mặt diện mạo (Diện 面).',
      'Chuyển động và tự nhiên: Cơn gió thổi tung bay (Phong 風), Đôi cánh bay lượn trên trời (Phi 飛), Da thuộc cải cách (Cách 革), Trang sách trang giấy (Hiệp 頁), Cái đầu thủ lĩnh (Thủ 首).'
    ],
    memoryMethod: 'Phương pháp "Cảm quan & Ẩm thực": Người ngồi dưới mái nhà ăn Thức ăn (Thực); Cây lúa phơi nắng tỏa Hương thơm (Hương); Cơn gió (Phong) thổi lật từng Trang sách (Hiệp); Lắng nghe Âm thanh (Âm) rộn ràng từ xa.',
    radicals: ['面', '革', '韋', '韭', '音', '頁', '風', '飛', '食', '首', '香']
  },
  {
    id: '9',
    lessonNumber: 'Bài 9',
    title: '10-17 nét: Muông thú phức tạp & Linh vật',
    strokesDescription: '10 nét - 17 nét (16 bộ)',
    youtubeUrl: 'https://www.youtube.com/watch?v=1f8NeaRKM-E',
    keyIdeas: [
      'Muông thú và linh vật: Con ngựa phi nước đại (Mã 馬), Cá bơi dưới nước (Ngư 魚), Chim đuôi dài có mắt (Điểu 鳥), Hươu nai trong rừng (Lộc 鹿), Chuột gặm nhấm (Thử 鼠), Rồng thần thoại oai phong (Long 龍), Rùa biển trường thọ (Quy 龜).',
      'Cơ thể chuyên biệt và màu sắc: Khung xương cứng cáp (Cốt 骨), Cái mũi để thở (Tị 鼻), Hàm răng bền chắc (Xỉ 齒), Màu vàng vua chúa (Hoàng 黃), Màu đen bồ hóng (Hắc 黑), Tòa lầu cao vút (Cao 高), Ma quỷ biến hóa (Quỷ 鬼).'
    ],
    memoryMethod: 'Phương pháp "Hình ảnh Muông thú & Linh vật": Chiêm ngưỡng trọn vẹn bức tranh tượng hình: Ngựa (Mã) có bờm dài và 4 chân phi; Cá (Ngư) có vây đuôi uốn lượn; Chim (Điểu) có mỏ nhọn và mắt sáng; Rồng (Long) và Rùa (Quy) biểu tượng trường thọ uy quyền.',
    radicals: ['馬', '骨', '高', '鬼', '魚', '鳥', '鹿', '麥', '麻', '黃', '黑', '鼠', '鼻', '齒', '龍', '龜']
  }
];

// Bảng tra cứu nguồn gốc tượng hình và vai trò biểu thị ngữ nghĩa khi cấu tạo chữ Kanji
export const RADICAL_SEMANTIC_ROLES: Record<string, { origin: string; kanjiRole: string }> = {
  '一': { origin: 'Vẽ một ngón tay giơ ngang hoặc một vạch phân định ranh giới đất trời.', kanjiRole: 'Thường biểu thị số một, sự khởi đầu nguyên sơ, ranh giới, mặt đất hoặc vòm trời.' },
  '丨': { origin: 'Nét sổ thẳng đứng từ trên xuyên suốt xuống dưới.', kanjiRole: 'Biểu thị sự kết nối trời - đất, xuyên qua tâm điểm, tính chính trực hoặc đường trục.' },
  '丶': { origin: 'Dấu chấm đọng lại của ngọn lửa hoặc giọt sương nhỏ.', kanjiRole: 'Biểu thị đốm lửa, giọt nước nhỏ, mầm sống hoặc điểm nhấn phân biệt nghĩa.' },
  '丿': { origin: 'Nét phẩy cong vát từ trên sang trái như ngọn cỏ ngả nghiêng.', kanjiRole: 'Biểu thị chuyển động lướt qua, chém vạt, dòng chảy nhẹ hoặc sợi tóc.' },
  '乙': { origin: 'Hình dáng mầm non uốn lượn ngoằn ngoèo đang vươn lên khỏi mặt đất.', kanjiRole: 'Biểu thị sự gập ghềnh, uốn cong, nhẫn nại hoặc can thứ hai trong thiên can.' },
  '亅': { origin: 'Hình lưỡi câu uốn cong có ngạnh ngược lên để móc giữ.', kanjiRole: 'Biểu thị sự giữ lại, móc câu, kéo lên hoặc sự dứt khoát dồn lực.' },
  '二': { origin: 'Hai ngón tay giơ ngang hoặc hai vạch tượng trưng Trời và Đất.', kanjiRole: 'Biểu thị số 2, sự lặp lại, đôi lứa, tương hỗ hoặc hai thái cực đối lập.' },
  '亠': { origin: 'Hình cái nắp vung có núm cầm hoặc mái che phủ phía trên.', kanjiRole: 'Biểu thị sự che phủ, bảo vệ phía trên, đỉnh cao hoặc kinh thành rộng lớn.' },
  '人': { origin: 'Hình dáng con người nhìn nghiêng hai chân đang sải bước vững vàng.', kanjiRole: 'Biểu thị con người, hành vi, mối quan hệ xã hội hoặc phẩm chất nhân văn.' },
  '亻': { origin: 'Biến thể của bộ Nhân khi đứng bên trái (thiên bàng) chữ Hán.', kanjiRole: 'Chuyên biểu thị thân thể, hành vi, năng lực và chức nghiệp của con người (体, 休, 働, 作, 促).' },
  '儿': { origin: 'Hình hai cẳng chân người đang chạy hoặc dáng đi thoăn thoắt của trẻ nhỏ.', kanjiRole: 'Biểu thị sự vận động của đôi chân, bước đi, thị giác (mắt có chân: 見) hoặc con trẻ.' },
  '入': { origin: 'Hình mũi nhọn đi sâu vào bên trong hoặc mái lều hé mở.', kanjiRole: 'Biểu thị sự tiến vào, thâm nhập, gia nhập hoặc thu nhận vào bên trong.' },
  '八': { origin: 'Hai nét vạch xòe sang hai phía ngược nhau mở rộng.', kanjiRole: 'Biểu thị số 8, sự chia tách đôi ngả, tỏa rộng sang hai bên hoặc phân phát chia đều.' },
  '冂': { origin: 'Khung rào vây bọc ba phía như đường biên giới lãnh thổ bờ cõi.', kanjiRole: 'Biểu thị vùng biên cương, không gian bên trong, chu vi hoặc sự bao hàm.' },
  '冖': { origin: 'Tấm khăn hoặc bạt phủ chụp trùm lên đồ vật cất giữ.', kanjiRole: 'Biểu thị sự che đậy, giấu kín, giữ gìn khoảnh khắc hoặc mũ miện trên đầu.' },
  '冫': { origin: 'Hình các mảnh băng giá tuyết nứt nẻ đông cứng xếp chồng.', kanjiRole: 'Biểu thị băng tuyết, nhiệt độ buốt giá, sự đông kết hoặc mùa đông lạnh lẽo (冬, 冷, 凍).' },
  '几': { origin: 'Hình chiếc ghế thấp hoặc bàn nhỏ quỳ chân thời xưa.', kanjiRole: 'Biểu thị vật dụng nâng đỡ, đồ đạc nội thất hoặc cơ thể được nâng đỡ thư thái.' },
  '凵': { origin: 'Hình hố đất đào sâu hoặc miệng há rộng hứng đồ vật rơi vào.', kanjiRole: 'Biểu thị vùng trũng sâu, cái hố, lòng chứa đựng hoặc vượt qua nghịch cảnh (出).' },
  '刀': { origin: 'Hình con dao găm hoặc thanh gươm kim loại sắc bén có cán.', kanjiRole: 'Biểu thị vũ khí, công cụ cắt gọt, sự chia rẽ, phán quyết dứt khoát.' },
  '刂': { origin: 'Biến thể của bộ Đao khi đứng ở bên phải (tiết) chữ Hán.', kanjiRole: 'Xuất hiện trong các chữ biểu thị hành động chia cắt, phân tách, hình phạt hoặc lưỡi chém (切, 割, 判, 別).' },
  '力': { origin: 'Hình bắp tay gân guốc đang co lại vận dụng sức mạnh cơ bắp.', kanjiRole: 'Biểu thị sức lực, cơ bắp, sự siêng năng, nỗ lực lao động hoặc năng lượng.' },
  '勹': { origin: 'Hình người cúi lưng ôm bọc một đứa trẻ hoặc bọc đồ vật quý.', kanjiRole: 'Biểu thị sự bao bọc, ôm lấy, gói ghém, che chở ấm áp yêu thương.' },
  '匕': { origin: 'Hình cái muỗng múc canh nhỏ hoặc con dao găm nhỏ tiện dụng.', kanjiRole: 'Biểu thị dụng cụ ăn uống, sự biến hóa hoặc so sánh.' },
  '匚': { origin: 'Hình chiếc hòm, tráp gỗ có nắp mở bên sườn để cất đồ quý.', kanjiRole: 'Biểu thị đồ chứa đựng, hòm tủ, sự cất giấu hoặc bảo quản đồ đạc.' },
  '十': { origin: 'Hai vạch ngang dọc cắt nhau biểu thị sự chu toàn bốn phương tám hướng.', kanjiRole: 'Biểu thị số 10, sự tròn vẹn, viên mãn, hoàn thiện tuyệt đối.' },
  '卜': { origin: 'Hình vết rạn nứt trên mai rùa hoặc xương thú khi nung lửa bói toán.', kanjiRole: 'Biểu thị bói toán, dự đoán tương lai, linh cảm hoặc chức vụ quan sát.' },
  '卩': { origin: 'Hình người đang quỳ gối phục tùng hoặc thẻ tre chia đôi làm tín vật.', kanjiRole: 'Biểu thị tiết khí, đốt tre, tín vật, sự gập lại hoặc tư thế quỳ phục.' },
  '厂': { origin: 'Hình vách núi đá dựng đứng che chở phía dưới sườn núi.', kanjiRole: 'Biểu thị sườn núi, vách đá, mái hiên che chắn hoặc công xưởng sơ khởi.' },
  '厶': { origin: 'Hình cánh tay co gập về phía lòng mình thể hiện cái của riêng mình.', kanjiRole: 'Biểu thị sự riêng tư, tính cá nhân, bí mật hoặc cái tôi độc lập.' },
  '又': { origin: 'Hình bàn tay phải nắm lại đang vươn ra cầm nắm đồ vật.', kanjiRole: 'Biểu thị hành động lặp lại, sự liên kết, bàn tay phải hoặc tiếp tục.' },
  '口': { origin: 'Hình khuôn miệng người đang mở ra nói chuyện hoặc ăn uống.', kanjiRole: 'Biểu thị miệng, lời nói, phát âm, nếm vị, ăn uống, lối ra vào hoặc tiếng động (味, 呼, 叫, 吸).' },
  '囗': { origin: 'Khung viền vuông khép kín hoàn toàn như tường thành bao bọc quốc gia.', kanjiRole: 'Biểu thị sự bao vây, giam giữ, tường thành, bờ cõi đất nước hoặc toàn vẹn lãnh thổ (国, 園, 囲).' },
  '土': { origin: 'Hình ụ đất đắp cao mọc lên từ nền đất bằng phẳng.', kanjiRole: 'Biểu thị đất đai, bùn đất, gò đất, công trình xây dựng hoặc địa lý (地, 坂, 城, 培).' },
  '士': { origin: 'Hình người đàn ông trưởng thành có tri thức hoặc cầm vũ khí bảo vệ xã hội.', kanjiRole: 'Biểu thị kẻ sĩ, học giả, người trí thức, người có chí khí hoặc chiến binh.' },
  '夂': { origin: 'Hình bàn chân đi ngược hướng hoặc bước đi chậm chạp phía sau.', kanjiRole: 'Biểu thị sự đi theo sau, chậm trễ, lùi lại hoặc theo đuổi.' },
  '夕': { origin: 'Hình mảnh trăng khuyết lấp ló vừa mới mọc lúc hoàng hôn.', kanjiRole: 'Biểu thị buổi chiều tối, màn đêm, thời gian chạng vạng hoặc giấc mộng (夜, 夢, 多).' },
  '大': { origin: 'Hình con người trưởng thành dang rộng hai tay hai chân hiên ngang.', kanjiRole: 'Biểu thị sự to lớn, vĩ đại, sự mở rộng hoặc vị thế vượt trội.' },
  '女': { origin: 'Hình người phụ nữ đoan trang đang quỳ gối chắp tay.', kanjiRole: 'Biểu thị phái nữ, người mẹ, vẻ đẹp, sự dịu dàng hoặc quan hệ hôn nhân gia đình (好, 妹, 姉, 始).' },
  '子': { origin: 'Hình đứa trẻ sơ sinh quấn tã vẫy vẫy hai tay mũm mĩm.', kanjiRole: 'Biểu thị đứa con, con cái, thế hệ sau, sự sinh sôi hoặc học trò.' },
  '宀': { origin: 'Hình mái nhà ngói có đỉnh nhọn và hai bên tường vững chãi.', kanjiRole: 'Biểu thị ngôi nhà, nơi cư trú, nơi sinh sống an toàn, gia đình ấm cúng (家, 安, 室, 宿).' },
  '寸': { origin: 'Hình bàn tay có dấu chấm ở cổ tay nơi đo mạch đập (khoảng cách 1 tấc).', kanjiRole: 'Biểu thị thước đo chiều dài, sự chuẩn xác, quy tắc mực thước hoặc cẩn trọng (寺, 専, 尊).' },
  '小': { origin: 'Hình ba hạt bụi nhỏ hoặc một vật thể được chia tách thành những mảnh vụn.', kanjiRole: 'Biểu thị sự nhỏ bé, ít ỏi, khiêm tốn hoặc thu hẹp (少, 尖, 省).' },
  '尢': { origin: 'Hình người có chân đi khập khiễng hoặc cơ thể biến dạng.', kanjiRole: 'Biểu thị sự yếu đuối, què quặt hoặc đặc điểm cơ thể đặc biệt.' },
  '尸': { origin: 'Hình người nằm bất động như xác ướp hoặc tư thế nằm.', kanjiRole: 'Biểu thị thi thể, xác thịt, tư thế nằm hoặc lớp vỏ bên ngoài (屋, 履, 局).' },
  '屮': { origin: 'Hình mầm cỏ non mới đâm chồi nhú lên khỏi mặt đất.', kanjiRole: 'Biểu thị sự sinh sôi non nớt, đâm chồi, khởi nguồn sức sống.' },
  '山': { origin: 'Hình ba ngọn núi nhô cao sừng sững liên tiếp nhau.', kanjiRole: 'Biểu thị núi non, địa hình đồi dốc, cảnh quan thiên nhiên hùng vĩ (島, 岩, 岳).' },
  '川': { origin: 'Hình các dòng nước uốn lượn chảy cuồn cuộn qua bờ bãi.', kanjiRole: 'Biểu thị dòng sông, dòng nước chảy xuôi, sự thông suốt hoặc kênh rạch (州, 順).' },
  '巛': { origin: 'Biến thể nét lượn của dòng sông nước chảy cuồn cuộn.', kanjiRole: 'Biểu thị dòng sông, dòng nước chảy êm đềm, sự thuận buồm xuôi gió.' },
  '工': { origin: 'Hình cái đe, cái thước thợ hoặc dụng cụ mộc của nghệ nhân.', kanjiRole: 'Biểu thị nghề thủ công, kỹ nghệ, công trình, sự khéo léo hoặc lao động (巧, 左, 功).' },
  '己': { origin: 'Hình sợi dây thừng cuộn lại uốn lượn gọn gàng.', kanjiRole: 'Biểu thị chính bản thân mình, sự tự chủ, kỷ cương hoặc can Kỷ.' },
  '巾': { origin: 'Hình tấm vải dệt treo rủ xuống hoặc khăn tay lau mặt.', kanjiRole: 'Biểu thị khăn, vải vóc, lụa là, cờ hiệu hoặc trang phục (布, 希, 帯).' },
  '干': { origin: 'Hình cây gậy phòng thủ có nhánh chẽ hoặc cọc phơi đồ.', kanjiRole: 'Biểu thị sự chống cự, bảo vệ, phơi khô, can thiệp hoặc sự cạn kiệt (乾, 刊).' },
  '幺': { origin: 'Hình cuộn sợi tơ tằm nhỏ sơ khai mới se lại.', kanjiRole: 'Biểu thị sự nhỏ bé, yếu ớt, non nớt hoặc thứ tự sau cùng (幼, 幻).' },
  '广': { origin: 'Hình mái nhà lớn xây tựa vào vách núi có một bên tường hở.', kanjiRole: 'Biểu thị ngôi nhà lớn, dinh thự, sảnh đường, kho chứa đồ sộ (店, 広, 庫, 席).' },
  '廴': { origin: 'Hình bước chân dài đang sải bước tiến về phía trước.', kanjiRole: 'Biểu thị sự kéo dài, bước tiến xa, phát triển không ngừng (延, 建).' },
  '弓': { origin: 'Hình cây cung uốn cong có buộc dây cung sẵn sàng bắn tên.', kanjiRole: 'Biểu thị cung tên, vũ khí tầm xa, sự căng thẳng, uốn cong hoặc đàn hồi (引, 張, 強).' },
  '彳': { origin: 'Hình nửa bên trái của ngã tư đường (chữ Hành 行).', kanjiRole: 'Biểu thị bước chân đi bộ, di chuyển, con đường, hành động dạo bước (行, 待, 律, 徒).' },
  '心': { origin: 'Hình quả tim với các ngăn mạch máu và nhịp đập cảm xúc.', kanjiRole: 'Biểu thị trái tim, cảm xúc, tâm trạng, tư duy, sự trăn trở hay phẩm hạnh (思, 忘, 愛, 念).' },
  '忄': { origin: 'Biến thể của bộ Tâm khi đứng bên trái (thiên bàng) chữ Hán.', kanjiRole: 'Chuyên xuất hiện trong chữ diễn tả tâm trạng, xúc cảm nội tâm (忙, 快, 怖, 性, 慢).' },
  '戈': { origin: 'Hình ngọn kích hoặc mũi giáo có lưỡi ngang để đâm chém.', kanjiRole: 'Biểu thị vũ khí, chiến tranh, binh đao, phòng thủ hoặc xâm lược (成, 戦, 我).' },
  '戶': { origin: 'Hình một cánh cửa đơn bằng gỗ khép mở.', kanjiRole: 'Biểu thị cánh cửa, ngôi nhà, hộ gia đình, căn phòng riêng (所, 房, 戻).' },
  '手': { origin: 'Hình bàn tay với năm ngón xòe ra thao tác linh hoạt.', kanjiRole: 'Biểu thị bàn tay, hành vi cầm nắm, tác động vật lý, kỹ năng thủ công (手, 挙, 掌).' },
  '扌': { origin: 'Biến thể của bộ Thủ khi đứng bên trái (thiên bàng) chữ Hán.', kanjiRole: 'Chuyên biểu thị các động tác của bàn tay: đánh, nhặt, giữ, chỉ, đẩy (打, 拾, 持, 指, 押).' },
  '日': { origin: 'Hình mặt trời tròn sáng có điểm chấm ở tâm vũ trụ.', kanjiRole: 'Biểu thị mặt trời, ban ngày, thời gian, ánh sáng rực rỡ, ngày tháng (明, 時, 映, 晴).' },
  '月': { origin: 'Hình vầng trăng lưỡi liềm trên bầu trời đêm hoặc hình miếng thịt sườn (chữ Nhục).', kanjiRole: 'Biểu thị mặt trăng, chu kỳ tháng, hoặc các bộ phận cơ thể người (thịt): não, vai, tay, chân (朝, 期, 服, 腕, 脳).' },
  '木': { origin: 'Hình cây cối có tán lá xòe bên trên và rễ bám sâu vào lòng đất.', kanjiRole: 'Biểu thị cây cối, gỗ, rừng, các loại quả hoặc đồ dùng chế tạo từ gỗ (本, 林, 森, 机, 校).' },
  '欠': { origin: 'Hình người há to miệng ngáp vì mệt mỏi hoặc thở dài.', kanjiRole: 'Biểu thị sự thiếu hụt, ngáp, há miệng thở, khao khát hoặc ca hát (次, 歌, 欲).' },
  '止': { origin: 'Hình bàn chân dừng lại trên mặt đất không bước tiếp.', kanjiRole: 'Biểu thị sự dừng lại, đứng yên, ngăn cản hoặc điểm kết thúc (正, 歩, 歴).' },
  '水': { origin: 'Hình dòng nước chảy cuồn cuộn với các giọt nước bắn tung tóe.', kanjiRole: 'Biểu thị nước, chất lỏng, sông hồ biển cả, thời tiết mưa ẩm hoặc rửa sạch.' },
  '氵': { origin: 'Biến thể (Ba chấm thủy) của bộ Thủy khi đứng bên trái chữ Hán.', kanjiRole: 'Chuyên biểu thị sông nước, chất lỏng, sự trôi chảy, ẩm ướt (海, 泳, 洗, 酒, 湖).' },
  '火': { origin: 'Hình ngọn lửa đang bùng cháy rực rỡ với các tia lửa bắn ra.', kanjiRole: 'Biểu thị lửa, hơi nóng, năng lượng, thiêu đốt, nấu nướng hoặc sự rực rỡ (焼, 灯, 煙).' },
  '灬': { origin: 'Biến thể của bộ Hỏa (Bốn chấm hỏa) khi nằm ở dưới đáy chữ Hán.', kanjiRole: 'Biểu thị nguồn nhiệt đun nấu bên dưới, sự nóng rực, nung nấu (熱, 照, 点, 然).' },
  '牛': { origin: 'Hình đầu con trâu bò nhìn thẳng với hai sừng cong vút và đôi tai.', kanjiRole: 'Biểu thị trâu bò, gia súc, động vật ăn cỏ, sức kéo hoặc vật tế lễ (物, 特, 牧).' },
  '犬': { origin: 'Hình dáng con chó với cái đuôi cong vểnh và đôi tai nhọn.', kanjiRole: 'Biểu thị loài chó, sự trung thành hoặc muông thú.' },
  '犭': { origin: 'Biến thể của bộ Khuyển khi đứng bên trái chữ Hán.', kanjiRole: 'Chuyên biểu thị muông thú hoang dã, động vật săn mồi, bản tính thú (猫, 犯, 狩, 狂).' },
  '王': { origin: 'Hình lưỡi rìu ngọc nghi lễ đại diện cho quyền lực tối cao của thiên tử.', kanjiRole: 'Biểu thị vua chúa, người cai trị, sự cao quý tột bậc (皇, 旺).' },
  '玉': { origin: 'Hình ba viên ngọc quý được xâu luồn qua một sợi dây kết nối.', kanjiRole: 'Biểu thị ngọc quý, châu báu, vẻ đẹp lấp lánh, sự tinh khiết (国, 宝, 理, 現).' },
  '田': { origin: 'Hình thửa ruộng vuông vắn được chia thành bốn ô bờ ngăn nước.', kanjiRole: 'Biểu thị đồng ruộng, canh tác nông nghiệp, đất đai sản xuất (町, 画, 界, 男).' },
  '目': { origin: 'Hình con mắt người nhìn thẳng với đồng tử và con ngươi rõ nét.', kanjiRole: 'Biểu thị đôi mắt, thị giác, sự quan sát, cái nhìn hoặc mục tiêu (見, 相, 省, 着).' },
  '石': { origin: 'Hình hòn đá lăn rơi từ vách núi đá dựng đứng xuống chân bờ.', kanjiRole: 'Biểu thị đá, sỏi, khoáng sản, sự cứng rắn, kiên định (砂, 破, 研, 磨).' },
  '示': { origin: 'Hình chiếc bàn tế lễ thần linh bằng đá với các giọt rượu cúng nhỏ xuống.', kanjiRole: 'Biểu thị thần linh, cúng tế, tôn giáo, phước lành hoặc tai họa (祭, 禁).' },
  '礻': { origin: 'Biến thể của bộ Thị khi đứng bên trái chữ Hán.', kanjiRole: 'Chuyên biểu thị thần linh, điềm lành, lễ nghi, chúc tụng (神, 社, 祝, 礼, 福).' },
  '禾': { origin: 'Hình cây lúa chín trĩu hạt uốn cong ngọn bông xuống đất.', kanjiRole: 'Biểu thị cây lúa, ngũ cốc, mùa màng thu hoạch, nông nghiệp hoặc tài sản (秋, 私, 利, 和, 科).' },
  '穴': { origin: 'Hình hang động đào sâu trong lòng đất có mái vòm che chở.', kanjiRole: 'Biểu thị hang hốc, lỗ thủng, không gian ngầm hoặc chui rúc (空, 究, 突).' },
  '立': { origin: 'Hình người đứng vững vàng hai chân trên mặt đất.', kanjiRole: 'Biểu thị sự đứng thẳng, độc lập, thiết lập, dựng xây hoặc khởi đầu (親, 端, 産).' },
  '竹': { origin: 'Hình hai nhánh lá tre rủ xuống xanh mướt.', kanjiRole: 'Biểu thị cây tre, đốt tre, sự dẻo dai kiên cường.' },
  '⺮': { origin: 'Biến thể của bộ Trúc khi nằm ở phía trên đầu chữ Hán.', kanjiRole: 'Chuyên biểu thị các vật dụng chế tạo bằng tre: bút lông, rổ rá, sọt, nhạc cụ sáo (筆, 答, 笑, 箱).' },
  '米': { origin: 'Hình những hạt gạo tẻ tỏa ra từ bông lúa khi đập.', kanjiRole: 'Biểu thị hạt gạo, lương thực, thực phẩm nuôi sống con người hoặc tinh túy (料, 粉, 精, 粒).' },
  '糸': { origin: 'Hình bó tơ tằm mềm mại được se thành sợi chỉ dài.', kanjiRole: 'Biểu thị sợi tơ, dây nhợ, sự gắn kết, dệt may, mối quan hệ ràng buộc (終, 約, 紙, 組, 結).' },
  '纟': { origin: 'Dạng giản thể của bộ Mịch (sợi tơ chỉ).', kanjiRole: 'Biểu thị dây sợi, sự liên kết, ràng buộc, may mặc.' },
  '耳': { origin: 'Hình vành tai người với các nếp sụn đón nhận âm thanh.', kanjiRole: 'Biểu thị đôi tai, thính giác, sự lắng nghe, hiểu biết thấu đáo (聞, 職, 声, 取).' },
  '艸': { origin: 'Hình hai khóm cỏ non nhú mọc vươn lên đón nắng.', kanjiRole: 'Biểu thị thực vật, cỏ cây, hoa lá thảo mộc.' },
  '艹': { origin: 'Biến thể của bộ Thảo khi nằm trên đầu (quán) chữ Hán.', kanjiRole: 'Chuyên biểu thị hoa cỏ, cây cỏ, thảo mộc, rau quả và vị thuốc thiên nhiên (花, 茶, 草, 薬, 苦).' },
  '言': { origin: 'Hình khuôn miệng phát ra âm thanh và lời nói từ tận đáy lòng.', kanjiRole: 'Biểu thị lời nói, ngôn ngữ, đàm thoại, giao tiếp, kế hoạch, tính toán (語, 話, 読, 計, 認).' },
  '讠': { origin: 'Dạng giản thể của bộ Ngôn khi làm thiên bàng bên trái.', kanjiRole: 'Chuyên biểu thị lời nói, chữ viết, bàn luận, cam kết.' },
  '貝': { origin: 'Hình vỏ sò quý xòe mép được dùng làm tiền tệ giao thương thời cổ.', kanjiRole: 'Biểu thị tiền bạc, của cải, buôn bán, tài sản, giá trị hoặc quý giá (買, 貸, 費, 財, 質).' },
  '車': { origin: 'Hình cỗ xe ngựa nhìn từ trên cao với hai bánh xe, trục xe và thùng xe.', kanjiRole: 'Biểu thị xe cộ, phương tiện bánh lăn, vận chuyển, chuyên chở (転, 輪, 輸, 軽).' },
  '辶': { origin: 'Hình bàn chân bước đi trên con đường dài rộng mở.', kanjiRole: 'Biểu thị sự di chuyển, con đường, đi xa, tiến tới, gặp gỡ hoặc thời gian trôi qua (道, 通, 進, 近, 返).' },
  '⻌': { origin: 'Biến thể của bộ Xước (quai xước) bao quanh bên trái và dưới đáy chữ Hán.', kanjiRole: 'Biểu thị hành trình, đường sá, chuyển động di chuyển hoặc tiếp cận.' },
  '邑': { origin: 'Hình vùng đất phong có người quỳ gối sinh sống yên bình.', kanjiRole: 'Biểu thị làng mạc, thôn xóm, thành phố, đô thị (khi đứng bên phải chữ Hán viết thành 阝: 都, 部, 郷).' },
  '阜': { origin: 'Hình gò đồi đất cao có từng bậc thang nhấp nhô nối tiếp nhau.', kanjiRole: 'Biểu thị núi non, gò đồi hiểm trở, cản trở hoặc bậc thềm (khi đứng bên trái chữ Hán viết thành 阝: 阪, 防, 陽, 院).' },
  '金': { origin: 'Hình các thỏi vàng, kim loại quý được nung đúc ẩn sâu dưới lòng đất.', kanjiRole: 'Biểu thị kim loại, vàng, tiền bạc, chuông sắt hoặc công cụ sắt nhọn (銀, 鉄, 銅, 鏡, 針).' },
  '門': { origin: 'Hình hai cánh cổng gỗ lớn khép mở của phủ đệ, làng xóm.', kanjiRole: 'Biểu thị cửa ngõ, lối vào, sự ngăn cách, gia môn hoặc hỏi han thăm viếng (開, 閉, 問, 間, 関).' },
  '雨': { origin: 'Hình những hạt mưa từ vòm trời mây đen rơi rớt xuống mặt đất.', kanjiRole: 'Biểu thị mưa, bão tuyết, sấm chớp, thời tiết khí tượng bầu trời (雪, 雲, 電, 雷, 霜).' },
  '食': { origin: 'Hình chiếc vạc có nắp đậy bên trên chứa thức ăn ấm nóng.', kanjiRole: 'Biểu thị thức ăn, việc ăn uống, nuôi nấng dưỡng dục, bữa cơm (飯, 飲, 館, 養).' },
  '飠': { origin: 'Biến thể của bộ Thực khi đứng bên trái chữ Hán.', kanjiRole: 'Chuyên biểu thị việc ăn uống, các món ăn, bánh trái, no đủ.' }
};

// Hàm trích xuất toàn diện các chi tiết ý nghĩa của một bộ thủ
export function getRadicalSemanticDetails(
  character: string,
  meaning: string,
  description: string
): { origin: string; kanjiRole: string; meaningBadges: string[] } {
  // 1. Tách các nét nghĩa cốt lõi thành danh sách badge
  const cleanedMeaning = meaning.replace(/[\(\)\[\]\{\}]/g, '');
  const rawParts = cleanedMeaning.split(/[,;\/•\n]+/).map(s => s.trim()).filter(Boolean);
  const meaningBadges = rawParts.length > 0 ? Array.from(new Set(rawParts)) : [meaning];

  // 2. Tra cứu nguồn gốc & vai trò ghép Kanji
  const baseChar = character.split(' ')[0] || character;
  const semanticData = RADICAL_SEMANTIC_ROLES[baseChar] || RADICAL_SEMANTIC_ROLES[character];

  let origin = semanticData?.origin;
  let kanjiRole = semanticData?.kanjiRole;

  // Fallback thông minh nếu bộ thủ chưa có trong từ điển mở rộng
  if (!origin) {
    origin = description || `Mô phỏng hình tượng tượng hình của "${meaningBadges[0] || meaning}", bắt nguồn từ đời sống và thiên nhiên cổ xưa.`;
  }
  if (!kanjiRole) {
    const mainMeaning = meaningBadges[0] || meaning;
    kanjiRole = `Khi xuất hiện trong cấu tạo chữ Hán, bộ thủ này thường đóng vai trò chỉ ngữ nghĩa (biểu nghĩa), gợi mở chữ Kanji đó liên quan đến "${mainMeaning}".`;
  }

  return { origin, kanjiRole, meaningBadges };
}

// Từ điển bộ thủ chi tiết chuẩn hóa theo 15 bài học
export const RADICALS_DICT: Record<string, RadicalInfo> = {
  // === BÀI 1.1: 1 NÉT & 2 NÉT (15 BỘ) ===
  '一': {
    character: '一',
    sinoVietnamese: 'Nhất',
    meaning: 'Số một, khởi đầu',
    description: 'Một nét gạch ngang tượng trưng cho một ngón tay giơ ngang, sự khởi đầu của vạn vật và số 1.',
    lessonId: '1-1',
    examples: [
      { char: '一', meaning: 'Số một', romaji: 'ichi' },
      { char: '三', meaning: 'Số ba', romaji: 'san' },
      { char: '上', meaning: 'Ở trên', romaji: 'ue' }
    ]
  },
  '丨': {
    character: '丨',
    sinoVietnamese: 'Cổn',
    meaning: 'Nét sổ thẳng đứng',
    description: 'Một đường thẳng kéo từ trên xuống dưới, thể hiện sự đứng thẳng, thông suốt từ trời xuống đất.',
    lessonId: '1-1',
    examples: [
      { char: '中', meaning: 'Ở giữa, bên trong', romaji: 'naka' },
      { char: '串', meaning: 'Xiên que nướng', romaji: 'kushi' }
    ]
  },
  '丶': {
    character: '丶',
    sinoVietnamese: 'Chủ',
    meaning: 'Điểm chấm, dấu chấm',
    description: 'Một dấu chấm nhỏ từ trên xuống dưới. Nhớ vần: Chủ kết thúc bằng CH -> nghĩa là Chấm.',
    lessonId: '1-1',
    examples: [
      { char: '丸', meaning: 'Hình tròn, viên tròn', romaji: 'maru' },
      { char: '主', meaning: 'Chủ nhân, ông chủ', romaji: 'omo' }
    ]
  },
  '丿': {
    character: '丿',
    sinoVietnamese: 'Phiệt',
    meaning: 'Nét phẩy cong',
    description: 'Nét phẩy từ trên vát nhẹ sang trái như sợi tóc bay trong gió. Nhớ vần: Phiệt bắt đầu bằng PH -> Phẩy.',
    lessonId: '1-1',
    examples: [
      { char: '千', meaning: 'Một nghìn', romaji: 'sen' },
      { char: '毛', meaning: 'Lông, sợi tóc', romaji: 'ke' }
    ]
  },
  '乙': {
    character: '乙',
    sinoVietnamese: 'Ất',
    meaning: 'Can thứ 2 trong 10 can, gập khúc',
    description: 'Hình dáng gập uốn lượn như mầm non uốn mình trồi lên khỏi mặt đất, can thứ hai (Giáp, Ất...).',
    lessonId: '1-1',
    examples: [
      { char: '九', meaning: 'Số chín', romaji: 'kyuu' },
      { char: '乞', meaning: 'Cầu xin, khất thực', romaji: 'ko(u)' }
    ]
  },
  '亅': {
    character: '亅',
    sinoVietnamese: 'Quyết',
    meaning: 'Nét sổ có móc ngược',
    description: 'Nét thẳng kéo từ trên xuống dưới và móc ngược lên như lưỡi câu. Nhớ vần: Quyết móc.',
    lessonId: '1-1',
    examples: [
      { char: '了', meaning: 'Kết thúc, liễu', romaji: 'ryou' },
      { char: '予', meaning: 'Dự đoán trước', romaji: 'yo' }
    ]
  },
  '二': {
    character: '二',
    sinoVietnamese: 'Nhị',
    meaning: 'Số hai, sự cân bằng, đôi lứa',
    description: 'Hai ngón tay hoặc hai nét gạch ngang, biểu thị số hai, sự ghép cặp, đối xứng cân bằng.',
    lessonId: '1-1',
    examples: [
      { char: '二', meaning: 'Số hai', romaji: 'ni' },
      { char: '云', meaning: 'Mây trôi, nói', romaji: 'un' },
      { char: '互', meaning: 'Lẫn nhau, tương hỗ', romaji: 'taga(i)' }
    ]
  },
  '亠': {
    character: '亠',
    sinoVietnamese: 'Đầu',
    meaning: 'Nắp vung, mái che bảo vệ',
    description: 'Hình cái nắp vung có núm cầm phía trên, biểu tượng cho sự che phủ, bảo vệ hoặc mái nhà.',
    lessonId: '1-1',
    examples: [
      { char: '京', meaning: 'Kinh đô (Tokyo)', romaji: 'kyou' },
      { char: '亭', meaning: 'Đình chỉ, dừng nghỉ', romaji: 'tei' },
      { char: '市', meaning: 'Thị trấn, chợ', romaji: 'shi' }
    ]
  },
  '人': {
    character: '人',
    sinoVietnamese: 'Nhân',
    meaning: 'Con người, dáng người đứng',
    description: 'Hình con người hai chân bước đi vững vàng, thể hiện con người và các hoạt động xã hội.',
    lessonId: '1-1',
    examples: [
      { char: '休', meaning: 'Nghỉ ngơi (người tựa gốc cây)', romaji: 'yasu(mu)' },
      { char: '会', meaning: 'Gặp gỡ', romaji: 'a(u)' },
      { char: '今', meaning: 'Bây giờ', romaji: 'ima' }
    ]
  },
  '亻': {
    character: '亻',
    sinoVietnamese: 'Nhân đứng',
    meaning: 'Người đứng thẳng, chính trực',
    description: 'Biến thể của bộ Nhân khi đứng bên trái chữ Hán, mô phỏng dáng người đứng thẳng hiên ngang, đoan chính.',
    lessonId: '1-1',
    examples: [
      { char: '体', meaning: 'Cơ thể', romaji: 'karada' },
      { char: '何', meaning: 'Cái gì', romaji: 'nani' },
      { char: '作', meaning: 'Chế tạo, làm ra', romaji: 'tsuku(ru)' }
    ]
  },
  '儿': {
    character: '儿',
    sinoVietnamese: 'Nhân đi (Nhi)',
    meaning: 'Đôi chân người, bước đi, trẻ thơ',
    description: 'Hình ảnh hai cẳng chân đang thoăn thoắt bước đi, biểu thị sự chuyển động, tuổi trẻ hoặc con trẻ.',
    lessonId: '1-1',
    examples: [
      { char: '先', meaning: 'Người đi trước (Tiên sinh)', romaji: 'saki' },
      { char: '見', meaning: 'Nhìn thấy (mắt có chân)', romaji: 'mi(ru)' },
      { char: '元', meaning: 'Gốc rễ, khỏe mạnh', romaji: 'gen' }
    ]
  },
  '入': {
    character: '入',
    sinoVietnamese: 'Nhập',
    meaning: 'Đi vào, tham gia vào',
    description: 'Ngược với bộ Nhân: nét dài bên trái che chở đi vào lều, biểu thị hành động gia nhập, bước vào.',
    lessonId: '1-1',
    examples: [
      { char: '入', meaning: 'Đi vào', romaji: 'hai(ru)' },
      { char: '込', meaning: 'Đông đúc, dồn vào', romaji: 'ko(mu)' }
    ]
  },
  '八': {
    character: '八',
    sinoVietnamese: 'Bát',
    meaning: 'Số tám, phân tách, mở rộng tỏa ra',
    description: 'Hai nét vát xòe sang hai hướng như miệng mở rộng, biểu thị sự phát triển, phát tài, tỏa rộng.',
    lessonId: '1-1',
    examples: [
      { char: '八', meaning: 'Số tám', romaji: 'hachi' },
      { char: '公', meaning: 'Công cộng, chia đều', romaji: 'kou' },
      { char: '六', meaning: 'Số sáu', romaji: 'roku' }
    ]
  },
  '冂': {
    character: '冂',
    sinoVietnamese: 'Quynh',
    meaning: 'Vùng biên cương, khung bao bọc',
    description: 'Khung viền rào ba phía như biên giới bờ cõi lãnh thổ bao bọc người dân bên trong.',
    lessonId: '1-1',
    examples: [
      { char: '内', meaning: 'Bên trong, nội bộ', romaji: 'uchi' },
      { char: '円', meaning: 'Đồng Yên Nhật, tròn', romaji: 'en' },
      { char: '同', meaning: 'Giống nhau, cùng', romaji: 'ona(ji)' }
    ]
  },
  '冖': {
    character: '冖',
    sinoVietnamese: 'Mịch',
    meaning: 'Khăn trùm, nắp đậy che phủ',
    description: 'Tấm bạt hoặc khăn trùm úp xuống che phủ, biểu thị sự bảo hộ, che giấu hoặc giữ gìn kỷ niệm.',
    lessonId: '1-1',
    examples: [
      { char: '写', meaning: 'Chụp ảnh, sao chép (giữ lại khoảnh khắc)', romaji: 'utsu(su)' },
      { char: '冠', meaning: 'Vương miện đội đầu', romaji: 'kanmuri' }
    ]
  },

  // === BÀI 1.2: 2 NÉT (15 BỘ) ===
  '冫': {
    character: '冫',
    sinoVietnamese: 'Băng',
    meaning: 'Băng giá, cái lạnh, đông cứng',
    description: 'Hình hai viên đá tuyết lạnh xếp chồng lên nhau, thể hiện nhiệt độ lạnh buốt hoặc đông cứng.',
    lessonId: '1-2',
    examples: [
      { char: '冬', meaning: 'Mùa đông', romaji: 'fuyu' },
      { char: '冷', meaning: 'Lạnh (nước, đồ ăn)', romaji: 'tsumeta(i)' },
      { char: '次', meaning: 'Tiếp theo', romaji: 'tsugi' }
    ]
  },
  '几': {
    character: '几',
    sinoVietnamese: 'Kỷ',
    meaning: 'Cái ghế nhỏ, bàn nhỏ nâng đỡ',
    description: 'Hình chiếc ghế đẩu hoặc bàn nhỏ chân quỳ, biểu tượng của vật dụng nâng đỡ cơ thể.',
    lessonId: '1-2',
    examples: [
      { char: '肌', meaning: 'Da dẻ cơ thể (thịt trên ghế nâng đỡ)', romaji: 'hada' },
      { char: '机', meaning: 'Cái bàn học bằng gỗ', romaji: 'tsukue' }
    ]
  },
  '凵': {
    character: '凵',
    sinoVietnamese: 'Khảm',
    meaning: 'Cái hố, vùng lõm sâu, há miệng',
    description: 'Hình một hốc đất lõm sâu hoặc cái miệng há rộng để đón nhận đồ vật rơi vào.',
    lessonId: '1-2',
    examples: [
      { char: '出', meaning: 'Đi ra (vượt qua 2 cái hố)', romaji: 'de(ru)' },
      { char: '画', meaning: 'Bức tranh, nét vẽ', romaji: 'ga' }
    ]
  },
  '刀': {
    character: '刀',
    sinoVietnamese: 'Đao',
    meaning: 'Con dao, thanh gươm, cắt đứt',
    description: 'Hình con dao có cán cầm và lưỡi sắc bén, biểu thị sự chia cắt, quyết đoán dứt khoát.',
    lessonId: '1-2',
    examples: [
      { char: '切', meaning: 'Cắt đứt', romaji: 'ki(ru)' },
      { char: '初', meaning: 'Lần đầu tiên (nhát cắt mở đầu)', romaji: 'haji(me)' },
      { char: '分', meaning: 'Chia ra, hiểu biết', romaji: 'wa(karu)' }
    ]
  },
  '刂': {
    character: '刂',
    sinoVietnamese: 'Đao đứng',
    meaning: 'Lưỡi dao chém, hình phạt, chế độ',
    description: 'Dạng biến thể của bộ Đao khi đứng bên phải chữ, giống như 2 nhát chém sắc lẹm thiết lập trật tự.',
    lessonId: '1-2',
    examples: [
      { char: '制', meaning: 'Chế độ, kiểm soát', romaji: 'sei' },
      { char: '利', meaning: 'Tiện lợi, lợi ích', romaji: 'ri' },
      { char: '前', meaning: 'Phía trước', romaji: 'mae' }
    ]
  },
  '力': {
    character: '力',
    sinoVietnamese: 'Lực',
    meaning: 'Sức mạnh, năng lượng cơ bắp',
    description: 'Hình bắp tay lực sĩ gập lại gồng lên, biểu tượng cho năng lượng, sự nỗ lực làm việc bền bỉ.',
    lessonId: '1-2',
    examples: [
      { char: '男', meaning: 'Đàn ông (dùng sức làm ruộng)', romaji: 'otoko' },
      { char: '勉', meaning: 'Cố gắng (trong học tập)', romaji: 'tsuto(meru)' },
      { char: '動', meaning: 'Chuyển động', romaji: 'ugo(ku)' }
    ]
  },
  '勹': {
    character: '勹',
    sinoVietnamese: 'Bao',
    meaning: 'Bao bọc, ôm lấy nâng niu',
    description: 'Hình người mẹ khom lưng ôm lấy bụng bầu tròn trĩnh, biểu tượng cho sự chở che đầy yêu thương.',
    lessonId: '1-2',
    examples: [
      { char: '包', meaning: 'Gói bọc thức ăn', romaji: 'tsutsu(mu)' },
      { char: '抱', meaning: 'Ôm vào lòng bằng tay', romaji: 'da(ku)' }
    ]
  },
  '匕': {
    character: '匕',
    sinoVietnamese: 'Chủy',
    meaning: 'Cái thìa, muỗng múc, vật nhỏ',
    description: 'Hình chiếc muôi múc cơm hoặc chiếc thìa nhỏ, biểu thị việc soi xét những chi tiết nhỏ để so sánh.',
    lessonId: '1-2',
    examples: [
      { char: '比', meaning: 'So sánh (2 cái thìa đặt cạnh nhau)', romaji: 'kura(beru)' },
      { char: '北', meaning: 'Hướng Bắc (2 người quay lưng)', romaji: 'kita' }
    ]
  },
  '匚': {
    character: '匚',
    sinoVietnamese: 'Phương',
    meaning: 'Tủ đựng, hộp chứa, bảo quản',
    description: 'Hình chiếc tủ hoặc chiếc hộp mở nắp bên phải, dùng để cất giữ thuốc men hoặc đồ vật quý giá.',
    lessonId: '1-2',
    examples: [
      { char: '医', meaning: 'Y học (hộp giữ mũi tên và thuốc)', romaji: 'i' },
      { char: '区', meaning: 'Khu vực hành chính', romaji: 'ku' }
    ]
  },
  '十': {
    character: '十',
    sinoVietnamese: 'Thập',
    meaning: 'Số mười, trọn vẹn, đầy đủ',
    description: 'Ký hiệu chữ thập đan chéo ngang dọc, biểu thị số mười tròn vẹn, thập toàn thập mỹ.',
    lessonId: '1-2',
    examples: [
      { char: '十', meaning: 'Số mười', romaji: 'juu' },
      { char: '南', meaning: 'Hướng Nam (kim chỉ nam trọn vẹn)', romaji: 'minami' },
      { char: '古', meaning: 'Cũ, cổ xưa (10 đời truyền miệng)', romaji: 'furu(i)' }
    ]
  },
  '卜': {
    character: '卜',
    sinoVietnamese: 'Bốc',
    meaning: 'Xem bói, tiên đoán tương lai',
    description: 'Hình que gậy cắm xuống đất hoặc vết nứt trên mai rùa khi người xưa đốt lửa để bói quẻ.',
    lessonId: '1-2',
    examples: [
      { char: '占', meaning: 'Bói toán (miệng nói quẻ bói)', romaji: 'urana(u)' },
      { char: '外', meaning: 'Bên ngoài (chiều tối xem bói ở ngoài)', romaji: 'soto' }
    ]
  },
  '卩': {
    character: '卩',
    sinoVietnamese: 'Tiết',
    meaning: 'Đốt tre, khớp nối, thời tiết',
    description: 'Hình một đốt thân cây tre phân nhánh, biểu thị sự liên kết nhịp nhàng giữa các mùa hoặc các khớp xương.',
    lessonId: '1-2',
    examples: [
      { char: '節', meaning: 'Khớp, mùa thời tiết', romaji: 'fushi' },
      { char: '印', meaning: 'Con dấu đóng nối', romaji: 'shirushi' }
    ]
  },
  '厂': {
    character: '厂',
    sinoVietnamese: 'Hán',
    meaning: 'Sườn núi, vách đá che chở tự nhiên',
    description: 'Vách đá dốc đứng che chắn gió bão, tạo ra vùng đất bình yên dưới chân núi cho con người sinh sống.',
    lessonId: '1-2',
    examples: [
      { char: '原', meaning: 'Thảo nguyên, đồng bằng chân núi', romaji: 'hara' },
      { char: '厚', meaning: 'Dày dặn, nồng hậu', romaji: 'atsu(i)' }
    ]
  },
  '厶': {
    character: '厶',
    sinoVietnamese: 'Tư',
    meaning: 'Riêng tư, bản thân mình',
    description: 'Giống số 4 viết nghiêng, biểu tượng cho cái tôi cá nhân độc lập, không gian kín đáo riêng biệt.',
    lessonId: '1-2',
    examples: [
      { char: '私', meaning: 'Tôi, bản thân tôi', romaji: 'watashi' },
      { char: '去', meaning: 'Đã qua, quá khứ', romaji: 'sa(ru)' }
    ]
  },
  '又': {
    character: '又',
    sinoVietnamese: 'Hựu',
    meaning: 'Lại, lần nữa, bàn tay làm việc',
    description: 'Hình bàn tay phải đưa ra lặp lại hành động, biểu thị sự tiếp diễn hoặc cặp đôi song hành.',
    lessonId: '1-2',
    examples: [
      { char: '友', meaning: 'Bạn bè (hai bàn tay bắt lấy nhau)', romaji: 'tomo' },
      { char: '双', meaning: 'Song sinh, một đôi', romaji: 'sou' },
      { char: '取', meaning: 'Cầm lấy, lấy đi', romaji: 'to(ru)' }
    ]
  },

  // === BÀI 2.1: 3 NÉT (15 BỘ) ===
  '口': {
    character: '口',
    sinoVietnamese: 'Khẩu',
    meaning: 'Cái miệng, lời nói, lối ra vào',
    description: 'Vẽ cái miệng mở ra nói chuyện hoặc ăn uống, sau viết thành ô vuông nhỏ.',
    lessonId: '2-1',
    examples: [
      { char: '口', meaning: 'Cái miệng, cửa', romaji: 'kuchi' },
      { char: '名', meaning: 'Tên (chiều tối dùng miệng xưng tên)', romaji: 'namae' },
      { char: '問', meaning: 'Hỏi han', romaji: 'to(u)' }
    ]
  },
  '囗': {
    character: '囗',
    sinoVietnamese: 'Vi',
    meaning: 'Vây quanh, bao bọc biên cương',
    description: 'Khung vuông lớn bao quanh bốn phía, khác với Khẩu (nhỏ hơn, thường đứng một mình hoặc góc chữ).',
    lessonId: '2-1',
    examples: [
      { char: '国', meaning: 'Quốc gia (vua ngọc trong bờ cõi)', romaji: 'kuni' },
      { char: '回', meaning: 'Quay vòng, lần lượt', romaji: 'mawa(ru)' },
      { char: '四', meaning: 'Số bốn', romaji: 'yon' }
    ]
  },
  '土': {
    character: '土',
    sinoVietnamese: 'Thổ',
    meaning: 'Đất cát, nền móng vững chắc',
    description: 'Cây mọc trên mặt đất: nét ngang dưới DÀI HƠN nét trên, biểu thị nền đất nâng đỡ vạn vật.',
    lessonId: '2-1',
    examples: [
      { char: '土', meaning: 'Đất, thứ Bảy', romaji: 'tsuchi' },
      { char: '地', meaning: 'Địa cầu, mặt đất', romaji: 'chi' },
      { char: '城', meaning: 'Tòa lâu đài thành quách', romaji: 'shiro' }
    ]
  },
  '士': {
    character: '士',
    sinoVietnamese: 'Sĩ',
    meaning: 'Kẻ sĩ, người quân tử, học giả',
    description: 'Học 1 biết 10: nét ngang trên DÀI HƠN nét dưới, biểu thị người có học thức và ý chí kiên định.',
    lessonId: '2-1',
    examples: [
      { char: '志', meaning: 'Ý chí (kẻ sĩ nuôi chí từ trong tâm)', romaji: 'kokorozashi' },
      { char: '声', meaning: 'Tiếng nói, âm thanh', romaji: 'koe' }
    ]
  },
  '夂': {
    character: '夂',
    sinoVietnamese: 'Truy',
    meaning: 'Đi theo sau, bước chân sau',
    description: 'Hình dáng bước chân chậm rãi đi lùng kẻ theo sau (như Ninja Rùa), biểu thị sự nối tiếp tuần tự.',
    lessonId: '2-1',
    examples: [
      { char: '条', meaning: 'Điều khoản pháp luật nối tiếp', romaji: 'jou' },
      { char: '各', meaning: 'Mỗi người, từng người', romaji: 'ono-ono' }
    ]
  },
  '夕': {
    character: '夕',
    sinoVietnamese: 'Tịch',
    meaning: 'Chiều tối, màn đêm tĩnh lặng',
    description: 'Vầng trăng khuyết ló dạng lúc hoàng hôn buông xuống, giống chữ Katakana タ (Ta).',
    lessonId: '2-1',
    examples: [
      { char: '夕', meaning: 'Hoàng hôn, chiều tà', romaji: 'yuu' },
      { char: '夜', meaning: 'Ban đêm (người dưới mái nhà lúc tối)', romaji: 'yoru' },
      { char: '多', meaning: 'Nhiều (hai buổi tối chồng lên)', romaji: 'oo(i)' }
    ]
  },
  '大': {
    character: '大',
    sinoVietnamese: 'Đại',
    meaning: 'To lớn, vĩ đại, quan trọng',
    description: 'Người dang rộng hai tay hai chân hết cỡ để khoe tầm vóc to lớn, đại ca.',
    lessonId: '2-1',
    examples: [
      { char: '大', meaning: 'To lớn', romaji: 'oo(kii)' },
      { char: '天', meaning: 'Bầu trời (trên đầu người lớn)', romaji: 'ten' },
      { char: '太', meaning: 'Béo tốt, mập mạp', romaji: 'futo(i)' }
    ]
  },
  '女': {
    character: '女',
    sinoVietnamese: 'Nữ',
    meaning: 'Phụ nữ, mẹ, dịu dàng',
    description: 'Hình người phụ nữ xưa đoan trang khoanh tay trước ngực, tượng trưng cho phái đẹp và sự yêu thương.',
    lessonId: '2-1',
    examples: [
      { char: '女', meaning: 'Phụ nữ, con gái', romaji: 'onna' },
      { char: '好', meaning: 'Thích (mẹ ôm con yêu thương)', romaji: 'su(ki)' },
      { char: '安', meaning: 'An toàn, rẻ (người nữ trong nhà)', romaji: 'yasu(i)' }
    ]
  },
  '子': {
    character: '子',
    sinoVietnamese: 'Tử',
    meaning: 'Con cái, đứa trẻ thơ ngây',
    description: 'Em bé sơ sinh quấn tã vung hai tay chào cha mẹ, biểu thị thế hệ con cháu và việc học tập.',
    lessonId: '2-1',
    examples: [
      { char: '子', meaning: 'Đứa con, đứa trẻ', romaji: 'ko' },
      { char: '学', meaning: 'Học tập (trẻ em dưới mái trường)', romaji: 'mana(bu)' },
      { char: '字', meaning: 'Chữ viết', romaji: 'ji' }
    ]
  },
  '宀': {
    character: '宀',
    sinoVietnamese: 'Miên',
    meaning: 'Mái nhà gia đình có ống khói',
    description: 'Mái nhà có ống khói phía trên, biểu tượng cho mái ấm gia đình, nơi chốn che mưa nắng bình yên.',
    lessonId: '2-1',
    examples: [
      { char: '家', meaning: 'Ngôi nhà (dưới mái ấm nuôi heo)', romaji: 'ie' },
      { char: '宿', meaning: 'Trọ lại, nhà nghỉ', romaji: 'yado' },
      { char: '室', meaning: 'Căn phòng kín', romaji: 'shitsu' }
    ]
  },
  '寸': {
    character: '寸',
    sinoVietnamese: 'Thốn',
    meaning: 'Tấc đo, đơn vị đo lường nhỏ',
    description: 'Hình bàn tay đo một tấc (từ mạch cổ tay đến ngón tay), biểu thị sự tính toán chính xác tỉ mỉ.',
    lessonId: '2-1',
    examples: [
      { char: '村', meaning: 'Làng thôn nhỏ bằng cây cối', romaji: 'mura' },
      { char: '寺', meaning: 'Ngôi chùa (đất có tôn ti đo lường)', romaji: 'tera' },
      { char: '対', meaning: 'Đối chiếu, đối xử', romaji: 'tai' }
    ]
  },
  '小': {
    character: '小',
    sinoVietnamese: 'Tiểu',
    meaning: 'Nhỏ bé, ít ỏi, khiêm tốn',
    description: 'Mầm cây nhỏ có hai chồi lá tán nhẹ sang hai bên, biểu thị sự nhỏ nhắn, khiêm nhường.',
    lessonId: '2-1',
    examples: [
      { char: '小', meaning: 'Nhỏ bé', romaji: 'chii(sai)' },
      { char: '少', meaning: 'Ít ỏi', romaji: 'suku(nai)' },
      { char: '光', meaning: 'Ánh sáng lung linh', romaji: 'hikari' }
    ]
  },
  '尢': {
    character: '尢',
    sinoVietnamese: 'Uông',
    meaning: 'Yếu đuối, tàn tật, bất toàn',
    description: 'Người lớn (Đại) bị gãy cong một bên chân, biểu thị sự khiếm khuyết nhưng thôi thúc ý chí vươn lên.',
    lessonId: '2-1',
    examples: [
      { char: '就', meaning: 'Thành tựu (đạt được từ gian khó)', romaji: 'tsu(ku)' }
    ]
  },
  '尸': {
    character: '尸',
    sinoVietnamese: 'Thi',
    meaning: 'Thi thể, xác chết, nơi chốn ngụ',
    description: 'Hình lưỡi hái tử thần hoặc cơ thể bất động không còn sự sống, thể hiện xác thịt hoặc nhà cửa chú ngụ.',
    lessonId: '2-1',
    examples: [
      { char: '居', meaning: 'Ngồi ở, sinh sống cư trú', romaji: 'i(ru)' },
      { char: '屋', meaning: 'Cửa hàng, mái nhà', romaji: 'ya' },
      { char: '尾', meaning: 'Cái đuôi con thú', romaji: 'o' }
    ]
  },
  '屮': {
    character: '屮',
    sinoVietnamese: 'Triệt',
    meaning: 'Mầm non vươn lên, khởi đầu',
    description: 'Mầm cây đâm hai lá chồi vươn thẳng lên bầu trời như đinh ba, biểu tượng của sức sống mãnh liệt.',
    lessonId: '2-1',
    examples: [
      { char: '出', meaning: 'Xuất hiện, đi ra', romaji: 'de(ru)' }
    ]
  },

  // === BÀI 2.2: 3 NÉT (16 BỘ) ===
  '山': {
    character: '山',
    sinoVietnamese: 'Sơn',
    meaning: 'Núi non, sừng sững vững chắc',
    description: 'Vẽ ba ngọn núi trùng điệp nhô lên, biểu tượng cho độ cao hùng vĩ và sự kiên định bền vững.',
    lessonId: '2-2',
    examples: [
      { char: '山', meaning: 'Ngọn núi', romaji: 'yama' },
      { char: '岩', meaning: 'Đá tảng núi', romaji: 'iwa' },
      { char: '島', meaning: 'Hòn đảo trên biển', romaji: 'shima' }
    ]
  },
  '巛': {
    character: '巛',
    sinoVietnamese: 'Xuyên',
    meaning: 'Sông ngòi uốn lượn',
    description: 'Dòng nước chảy uốn khúc quanh co giữa hai bờ sông, biểu thị sự lưu thông mềm mại.',
    lessonId: '2-2',
    examples: [
      { char: '巡', meaning: 'Tuần tra dọc bờ sông', romaji: 'megu(ru)' }
    ]
  },
  '川': {
    character: '川',
    sinoVietnamese: 'Xuyên',
    meaning: 'Dòng sông chảy thẳng, thuận lợi',
    description: 'Ba dòng nước chảy xiết thẳng hàng từ nguồn ra biển, biểu thị sự suôn sẻ, hanh thông.',
    lessonId: '2-2',
    examples: [
      { char: '川', meaning: 'Dòng sông', romaji: 'kawa' },
      { char: '順', meaning: 'Thuận lợi, trật tự', romaji: 'jun' },
      { char: '州', meaning: 'Tiểu bang, châu lục', romaji: 'shuu' }
    ]
  },
  '工': {
    character: '工',
    sinoVietnamese: 'Công',
    meaning: 'Người thợ, công sức, xây dựng',
    description: 'Cái đe của người thợ rèn (giống chữ E Katakana), biểu thị sự lao động thủ công tạo ra thành quả.',
    lessonId: '2-2',
    examples: [
      { char: '工', meaning: 'Công nghiệp, công trường', romaji: 'kou' },
      { char: '左', meaning: 'Bên trái (tay cầm dụng cụ thợ)', romaji: 'hidari' },
      { char: '差', meaning: 'Khác biệt, chênh lệch', romaji: 'sa' }
    ]
  },
  '己': {
    character: '己',
    sinoVietnamese: 'Kỷ',
    meaning: 'Bản thân, hoàn tất một chu kỳ',
    description: 'Hình con cá ngựa hoặc số 5 lộn ngược, thể hiện sự hoàn thành trọn vẹn một giai đoạn (như thập kỷ).',
    lessonId: '2-2',
    examples: [
      { char: '記', meaning: 'Ghi nhật ký cuối ngày', romaji: 'ki' },
      { char: '配', meaning: 'Phân phát, lo lắng', romaji: 'hai' }
    ]
  },
  '巾': {
    character: '巾',
    sinoVietnamese: 'Cân',
    meaning: 'Khăn vải, vải vóc trang phục',
    description: 'Khăn voan trùm đầu cô dâu rủ xuống hai bên, biểu thị các loại vải vóc, đồ dệt may quý giá.',
    lessonId: '2-2',
    examples: [
      { char: '市', meaning: 'Chợ mua bán vải vóc', romaji: 'ichi' },
      { char: '布', meaning: 'Vải vóc', romaji: 'nuno' },
      { char: '帯', meaning: 'Thắt lưng Obi', romaji: 'obi' }
    ]
  },
  '干': {
    character: '干',
    sinoVietnamese: 'Can',
    meaning: 'Khô ráo, can thiệp phơi khô',
    description: 'Thập (10) cộng thêm một nét: can thiệp phơi 10 lần cho khô ráo, chống ẩm ướt.',
    lessonId: '2-2',
    examples: [
      { char: '干', meaning: 'Phơi khô quần áo', romaji: 'ho(su)' },
      { char: '汗', meaning: 'Mồ hôi (nước cơ thể chống khô)', romaji: 'ase' }
    ]
  },
  '幺': {
    character: '幺',
    sinoVietnamese: 'Yêu',
    meaning: 'Nhỏ nhắn, yếu đuối, ấu thơ',
    description: 'Sợi tơ non nhỏ xíu hoặc đứa trẻ sơ sinh mềm yếu, biểu thị giai đoạn còn non nớt cần bảo vệ.',
    lessonId: '2-2',
    examples: [
      { char: '幼', meaning: 'Ấu thơ (sức lực còn nhỏ)', romaji: 'osana(i)' },
      { char: '幽', meaning: 'U tối, huyền ảo', romaji: 'yuu' }
    ]
  },
  '广': {
    character: '广',
    sinoVietnamese: 'Nghiễm',
    meaning: 'Mái nhà lớn đồ sộ, nhà kho rộng',
    description: 'Khác với Miên 宀 (nhà nhỏ gia đình), Nghiễm dựa vào sườn núi dựng nên tòa kho rộng mênh mông.',
    lessonId: '2-2',
    examples: [
      { char: '店', meaning: 'Cửa hàng buôn bán', romaji: 'mise' },
      { char: '府', meaning: 'Phủ huyện, cơ quan lớn', romaji: 'fu' },
      { char: '広', meaning: 'Rộng rãi', romaji: 'hiro(i)' }
    ]
  },
  '廴': {
    character: '廴',
    sinoVietnamese: 'Dẫn',
    meaning: 'Bước chân dài, đi xa, kéo dài',
    description: 'Hình bàn chân bước sải dài dứt khoát trên con đường rộng, biểu thị sự tiến xa và duyên số gắn kết.',
    lessonId: '2-2',
    examples: [
      { char: '延', meaning: 'Kéo dài, trì hoãn', romaji: 'en' },
      { char: '建', meaning: 'Xây dựng (bước dài dựng nhà)', romaji: 'ta(teru)' }
    ]
  },
  '廾': {
    character: '廾',
    sinoVietnamese: 'Củng',
    meaning: 'Chắp hai tay, chung sức cùng nhau',
    description: 'Hai bàn tay chắp lại nâng niu vật quý hoặc cùng nhau chung tay hiệp lực gánh vác.',
    lessonId: '2-2',
    examples: [
      { char: '共', meaning: 'Cùng nhau (chắp tay chung sức)', romaji: 'tomo' },
      { char: '弄', meaning: 'Chơi đùa trên tay', romaji: 'rou' }
    ]
  },
  '弋': {
    character: '弋',
    sinoVietnamese: 'Dặc',
    meaning: 'Khẩu súng, bắn chiếm lấy, quy củ',
    description: 'Cây cọc gỗ cắm cọc hoặc hình khẩu súng ngắm chuẩn vào mục tiêu, giữ trật tự nghi thức.',
    lessonId: '2-2',
    examples: [
      { char: '式', meaning: 'Nghi thức, công thức chuẩn', romaji: 'shiki' },
      { char: '弐', meaning: 'Số hai cổ điển', romaji: 'ni' }
    ]
  },
  '弓': {
    character: '弓',
    sinoVietnamese: 'Cung',
    meaning: 'Cây cung bắn tên, đàn hồi mạnh mẽ',
    description: 'Cánh cung uốn cong kéo căng dây, biểu tượng của sự dẻo dai đàn hồi và vũ khí chiến đấu.',
    lessonId: '2-2',
    examples: [
      { char: '弓', meaning: 'Cây cung tên', romaji: 'yumi' },
      { char: '強', meaning: 'Mạnh mẽ, cường thịnh', romaji: 'tsuyo(i)' },
      { char: '引', meaning: 'Kéo (kéo dây cung)', romaji: 'hi(ku)' }
    ]
  },
  '彐': {
    character: '彐',
    sinoVietnamese: 'Kệ',
    meaning: 'Cái giá đỡ, kệ xếp đồ, nâng đỡ',
    description: 'Chiếc giá để sách nhiều tầng (như chữ E lộn ngược), dùng để lưu trữ hồ sơ tài liệu.',
    lessonId: '2-2',
    examples: [
      { char: '書', meaning: 'Sách vở, viết lách', romaji: 'sho' },
      { char: '彗', meaning: 'Sao chổi', romaji: 'sui' }
    ]
  },
  '彡': {
    character: '彡',
    sinoVietnamese: 'Sam',
    meaning: 'Ba cọng tóc dài, mềm mại, bóng hình',
    description: 'Ba nét phẩy cong mềm mại như sợi tóc bay hoặc hoa văn ánh sáng lung linh tạo bóng đổ.',
    lessonId: '2-2',
    examples: [
      { char: '形', meaning: 'Hình dáng, hoa văn', romaji: 'katachi' },
      { char: '影', meaning: 'Bóng hình dưới ánh nắng', romaji: 'kage' },
      { char: '彩', meaning: 'Sắc thái lộng lẫy', romaji: 'irodo(ru)' }
    ]
  },
  '彳': {
    character: '彳',
    sinoVietnamese: 'Xích',
    meaning: 'Bước chân trái, đi chậm chạp chờ đợi',
    description: 'Người đứng có thêm mắt xích ở chân: bước đi chậm rãi từng bước một, vừa đi vừa chờ.',
    lessonId: '2-2',
    examples: [
      { char: '待', meaning: 'Chờ đợi (vừa đi chậm vừa chờ)', romaji: 'ma(tsu)' },
      { char: '行', meaning: 'Đi lại ngã tư', romaji: 'i(ku)' },
      { char: '役', meaning: 'Vai trò, phục vụ', romaji: 'yaku' }
    ]
  },

  // === BÀI 3.1: 4 NÉT (16 BỘ) ===
  '心': {
    character: '心 (忄)',
    sinoVietnamese: 'Tâm',
    meaning: 'Trái tim, tâm tư, cảm xúc',
    description: 'Hình quả tim với các tâm thất tâm nhĩ, biểu thị thế giới nội tâm, tình cảm và suy nghĩ con người.',
    lessonId: '3-1',
    examples: [
      { char: '心', meaning: 'Trái tim, tấm lòng', romaji: 'kokoro' },
      { char: '思', meaning: 'Suy nghĩ (tâm trên ruộng đất)', romaji: 'omo(u)' },
      { char: '情', meaning: 'Tình cảm sâu sắc', romaji: 'jou' }
    ]
  },
  '戈': {
    character: '戈',
    sinoVietnamese: 'Qua',
    meaning: 'Cây giáo, vũ khí chiến trận',
    description: 'Vũ khí cổ có mũi nhọn và lưỡi rìu ngang, dùng trong chiến trận bảo vệ bờ cõi.',
    lessonId: '3-1',
    examples: [
      { char: '戦', meaning: 'Chiến tranh, thi đấu', romaji: 'tataka(u)' },
      { char: '成', meaning: 'Thành tựu, trở thành', romaji: 'na(ru)' }
    ]
  },
  '戶': {
    character: '戶',
    sinoVietnamese: 'Hộ',
    meaning: 'Cánh cửa một cánh, hộ gia đình',
    description: 'Hình cánh cửa gỗ đơn mở vào nhà, biểu thị gia đình đơn vị hộ dân.',
    lessonId: '3-1',
    examples: [
      { char: '戸', meaning: 'Cánh cửa', romaji: 'to' },
      { char: '所', meaning: 'Nơi chốn (cửa nhà có rìu đẽo)', romaji: 'tokoro' },
      { char: '戻', meaning: 'Quay trở lại cửa nhà', romaji: 'modo(ru)' }
    ]
  },
  '手': {
    character: '手 (扌)',
    sinoVietnamese: 'Thủ',
    meaning: 'Bàn tay, thao tác hành động',
    description: 'Hình bàn tay với 5 ngón đang cầm nắm, biểu thị các hành động dùng tay cầm, nhấc, ném.',
    lessonId: '3-1',
    examples: [
      { char: '手', meaning: 'Bàn tay', romaji: 'te' },
      { char: '持', meaning: 'Cầm nắm bằng tay', romaji: 'mo(tsu)' },
      { char: '打', meaning: 'Đánh, gõ', romaji: 'u(tsu)' }
    ]
  },
  '支': {
    character: '支',
    sinoVietnamese: 'Chi',
    meaning: 'Cành cây, chống đỡ, chi nhánh',
    description: 'Bàn tay nắm lấy cành cây để chống đỡ thân thể, biểu thị sự hỗ trợ, chi nhánh.',
    lessonId: '3-1',
    examples: [
      { char: '支', meaning: 'Chống đỡ, chi viện', romaji: 'sasa(eru)' }
    ]
  },
  '攴': {
    character: '攴 (攵)',
    sinoVietnamese: 'Phộc',
    meaning: 'Đánh nhẹ, rèn luyện kỷ luật',
    description: 'Tay cầm chiếc roi nhỏ gõ nhẹ răn dạy học trò, biểu thị sự giáo dục, tu sửa.',
    lessonId: '3-1',
    examples: [
      { char: '教', meaning: 'Dạy học (gõ roi dạy con)', romaji: 'oshi(eru)' },
      { char: '政', meaning: 'Chính trị, phép nước', romaji: 'sei' },
      { char: '改', meaning: 'Cải cách, sửa đổi', romaji: 'arata(meru)' }
    ]
  },
  '文': {
    character: '文',
    sinoVietnamese: 'Văn',
    meaning: 'Văn tự, hoa văn, chữ viết',
    description: 'Hình người xăm hoa văn trước ngực, sau chuyển nghĩa thành chữ viết, văn học.',
    lessonId: '3-1',
    examples: [
      { char: '文', meaning: 'Câu văn, chữ viết', romaji: 'bun' }
    ]
  },
  '斗': {
    character: '斗',
    sinoVietnamese: 'Đẩu',
    meaning: 'Cái đấu đong rượu gạo, chòm sao',
    description: 'Cái muôi có cán dài dùng để múc đong rượu thóc gạo, chòm sao Bắc Đẩu.',
    lessonId: '3-1',
    examples: [
      { char: '料', meaning: 'Nguyên liệu, phí tổn', romaji: 'ryou' },
      { char: '斜', meaning: 'Nghiêng nghiêng dốc', romaji: 'naname' }
    ]
  },
  '斤': {
    character: '斤',
    sinoVietnamese: 'Cân',
    meaning: 'Cái rìu đốn củi, cân nặng',
    description: 'Hình chiếc rìu chặt cây, dùng làm đơn vị cân đo trọng lượng thời xưa.',
    lessonId: '3-1',
    examples: [
      { char: '新', meaning: 'Mới mẻ (dùng rìu đẵn cây mới)', romaji: 'atara(shii)' },
      { char: '断', meaning: 'Cắt đứt, từ chối', romaji: 'kotowa(ru)' }
    ]
  },
  '方': {
    character: '方',
    sinoVietnamese: 'Phương',
    meaning: 'Phương hướng, hình vuông, quy tắc',
    description: 'Hai chiếc thuyền buộc song song hướng về một phía, biểu thị hướng đi và quy tắc xử sự.',
    lessonId: '3-1',
    examples: [
      { char: '方', meaning: 'Cách thức, hướng, vị', romaji: 'kata' },
      { char: '旅', meaning: 'Du lịch (theo cờ chỉ phương)', romaji: 'tabi' },
      { char: '族', meaning: 'Gia tộc, dòng dõi', romaji: 'zoku' }
    ]
  },
  '无': {
    character: '无',
    sinoVietnamese: 'Vô',
    meaning: 'Không có, trống không',
    description: 'Ký tự cổ biểu thị sự hư vô, không tồn tại, trống rỗng.',
    lessonId: '3-1',
    examples: [
      { char: '既', meaning: 'Đã rồi, vừa mới', romaji: 'sude(ni)' }
    ]
  },
  '日': {
    character: '日',
    sinoVietnamese: 'Nhật',
    meaning: 'Mặt trời, ban ngày, ánh sáng',
    description: 'Vòng tròn mặt trời có nhân ở giữa tỏa nhiệt, sau viết vuông lại, biểu thị thời gian.',
    lessonId: '3-1',
    examples: [
      { char: '日', meaning: 'Ngày, Chủ Nhật', romaji: 'hi' },
      { char: '明', meaning: 'Sáng tỏ (Nhật + Nguyệt)', romaji: 'aka(rui)' },
      { char: '早', meaning: 'Sớm (mặt trời mọc)', romaji: 'haya(i)' }
    ]
  },
  '月': {
    character: '月',
    sinoVietnamese: 'Nguyệt (Nhục)',
    meaning: 'Mặt trăng, tháng, thịt cơ thể',
    description: 'Vầng trăng khuyết; khi nằm bên trái thường là biến thể của bộ Nhục 肉 (bắp thịt, tạng phủ).',
    lessonId: '3-1',
    examples: [
      { char: '月', meaning: 'Mặt trăng, thứ Hai', romaji: 'tsuki' },
      { char: '服', meaning: 'Quần áo', romaji: 'fuku' },
      { char: '朝', meaning: 'Buổi sáng', romaji: 'asa' }
    ]
  },
  '木': {
    character: '木',
    sinoVietnamese: 'Mộc',
    meaning: 'Cây cối, gỗ, thực vật',
    description: 'Thân cây có cành lá vươn lên và rễ cắm sâu vào lòng đất.',
    lessonId: '3-1',
    examples: [
      { char: '木', meaning: 'Cây cối, thứ Năm', romaji: 'ki' },
      { char: '林', meaning: 'Rừng thưa (2 cây)', romaji: 'hayashi' },
      { char: '森', meaning: 'Rừng rậm (3 cây)', romaji: 'mori' }
    ]
  },
  '欠': {
    character: '欠',
    sinoVietnamese: 'Khiếm',
    meaning: 'Há miệng ngáp, thiếu hụt, thở dài',
    description: 'Người há to miệng ngáp vì mệt mỏi, biểu thị sự thiếu thốn, khuyết điểm.',
    lessonId: '3-1',
    examples: [
      { char: '次', meaning: 'Tiếp theo', romaji: 'tsugi' },
      { char: '歌', meaning: 'Bài hát (miệng ngân nga)', romaji: 'uta' },
      { char: '飲', meaning: 'Uống nước', romaji: 'no(mu)' }
    ]
  },
  '止': {
    character: '止',
    sinoVietnamese: 'Chỉ',
    meaning: 'Dừng lại, đình chỉ bước chân',
    description: 'Dấu chân dừng lại trên mặt đất không tiến thêm, biểu thị sự ngừng nghỉ.',
    lessonId: '3-1',
    examples: [
      { char: '止', meaning: 'Dừng lại', romaji: 'to(maru)' },
      { char: '正', meaning: 'Chính trực (dừng ở ranh giới đúng)', romaji: 'tada(shii)' },
      { char: '歩', meaning: 'Bước đi bộ', romaji: 'aru(ku)' }
    ]
  },

  // === BÀI 3.2: 4 NÉT (17 BỘ) ===
  '歹': {
    character: '歹',
    sinoVietnamese: 'Đãi',
    meaning: 'Xương tàn, chết chóc, tai ương',
    description: 'Mẩu xương vụn còn sót lại sau cái chết, biểu thị tai họa hoặc sự tàn lụi.',
    lessonId: '3-2',
    examples: [
      { char: '死', meaning: 'Cái chết', romaji: 'shi' },
      { char: '残', meaning: 'Còn sót lại, tàn dư', romaji: 'noko(ru)' }
    ]
  },
  '殳': {
    character: '殳',
    sinoVietnamese: 'Thù',
    meaning: 'Binh khí giáo nhọn, tấn công',
    description: 'Binh khí bằng tre nứa nhọn đầu để đâm đánh đối thủ.',
    lessonId: '3-2',
    examples: [
      { char: '段', meaning: 'Giai đoạn, bậc thang', romaji: 'dan' },
      { char: '殺', meaning: 'Sát hại', romaji: 'koro(su)' }
    ]
  },
  '毋': {
    character: '毋 (母)',
    sinoVietnamese: 'Vô (Mẫu)',
    meaning: 'Đừng (cấm đoán), người mẹ bầu vú',
    description: 'Người mẹ cho con bú với hai điểm sữa, biểu thị người mẹ sinh thành.',
    lessonId: '3-2',
    examples: [
      { char: '母', meaning: 'Người mẹ ruột', romaji: 'haha' },
      { char: '毎', meaning: 'Mỗi ngày (mẹ sinh con hàng ngày)', romaji: 'mai' }
    ]
  },
  '比': {
    character: '比',
    sinoVietnamese: 'Tỷ',
    meaning: 'So sánh, đặt liền kề',
    description: 'Hai người hoặc hai chiếc thìa đặt sát cạnh nhau để so đo hơn kém.',
    lessonId: '3-2',
    examples: [
      { char: '比', meaning: 'So sánh', romaji: 'kura(beru)' },
      { char: '皆', meaning: 'Mọi người (ai ai cũng so sánh)', romaji: 'mina' }
    ]
  },
  '毛': {
    character: '毛',
    sinoVietnamese: 'Mao',
    meaning: 'Lông thú, sợi tóc, mềm',
    description: 'Sợi lông uốn cong mềm mại của động vật.',
    lessonId: '3-2',
    examples: [
      { char: '毛', meaning: 'Lông, tóc', romaji: 'ke' }
    ]
  },
  '氏': {
    character: '氏',
    sinoVietnamese: 'Thị',
    meaning: 'Họ tộc, dòng dõi, gốc tích',
    description: 'Cành cây gia phả đâm rễ, biểu thị dòng họ danh giá thời cổ.',
    lessonId: '3-2',
    examples: [
      { char: '氏', meaning: 'Dòng họ, ông/bà', romaji: 'shi' },
      { char: '民', meaning: 'Thường dân trong nước', romaji: 'tami' }
    ]
  },
  '气': {
    character: '气',
    sinoVietnamese: 'Khí',
    meaning: 'Không khí, hơi nước, khí sắc',
    description: 'Luồng hơi nước bốc lên cuồn cuộn thành mây trời, biểu thị năng lượng sống.',
    lessonId: '3-2',
    examples: [
      { char: '気', meaning: 'Khí chất, tinh thần, thời tiết', romaji: 'ki' }
    ]
  },
  '水': {
    character: '水 (氵)',
    sinoVietnamese: 'Thủy',
    meaning: 'Nước, chất lỏng, dòng chảy',
    description: 'Dòng nước chảy xiết có các bọt nước bắn ra; dạng 3 chấm Thủy (氵) rất phổ biến.',
    lessonId: '3-2',
    examples: [
      { char: '水', meaning: 'Nước uống', romaji: 'mizu' },
      { char: '海', meaning: 'Biển cả', romaji: 'umi' },
      { char: '洗', meaning: 'Rửa tay', romaji: 'ara(u)' }
    ]
  },
  '火': {
    character: '火 (灬)',
    sinoVietnamese: 'Hỏa',
    meaning: 'Lửa, sức nóng, ánh lửa',
    description: 'Ngọn lửa bốc cháy dữ dội; dạng bốn chấm Hỏa (灬) nằm ở đáy biểu thị ngọn lửa đang đun nấu.',
    lessonId: '3-2',
    examples: [
      { char: '火', meaning: 'Ngọn lửa, thứ Ba', romaji: 'hi' },
      { char: '点', meaning: 'Điểm số, chấm lửa', romaji: 'ten' },
      { char: '然', meaning: 'Tự nhiên, cháy tự nhiên', romaji: 'zen' }
    ]
  },
  '爪': {
    character: '爪 (爫)',
    sinoVietnamese: 'Trảo',
    meaning: 'Móng vuốt động vật, cào vồ',
    description: 'Bàn chân có móng vuốt nhọn của loài thú đang vồ lấy con mồi.',
    lessonId: '3-2',
    examples: [
      { char: '争', meaning: 'Tranh giành (móng vuốt giành)', romaji: 'araso(u)' },
      { char: '妥', meaning: 'Thỏa đáng, êm xuôi', romaji: 'da' }
    ]
  },
  '父': {
    character: '父',
    sinoVietnamese: 'Phụ',
    meaning: 'Người cha, chủ gia đình',
    description: 'Người cha tay cầm roi nghiêm nghị dạy dỗ con cái nên người.',
    lessonId: '3-2',
    examples: [
      { char: '父', meaning: 'Người cha ruột', romaji: 'chichi' }
    ]
  },
  '爻': {
    character: '爻',
    sinoVietnamese: 'Hào',
    meaning: 'Quẻ bói đan chéo, biến hóa',
    description: 'Hai vạch đan chéo nhau như que tính bói Kinh Dịch.',
    lessonId: '3-2',
    examples: [
      { char: '学', meaning: 'Học tập (quẻ hào trên đầu trẻ)', romaji: 'mana(bu)' }
    ]
  },
  '爿': {
    character: '爿',
    sinoVietnamese: 'Tường',
    meaning: 'Nửa tấm ván bên trái, giường ngủ',
    description: 'Mảnh thân cây xẻ dọc lấy nửa bên trái làm tấm ván nằm ngủ.',
    lessonId: '3-2',
    examples: [
      { char: '壮', meaning: 'Tráng kiện, khỏe mạnh', romaji: 'sou' }
    ]
  },
  '片': {
    character: '片',
    sinoVietnamese: 'Phiến',
    meaning: 'Mảnh ván bên phải, thẻ mỏng',
    description: 'Mảnh thân cây xẻ dọc bên phải, một tấm thẻ hoặc lát cắt mỏng.',
    lessonId: '3-2',
    examples: [
      { char: '片', meaning: 'Một bên, phiến mỏng', romaji: 'kata' },
      { char: '版', meaning: 'Bản in, xuất bản', romaji: 'han' }
    ]
  },
  '牙': {
    character: '牙',
    sinoVietnamese: 'Nha',
    meaning: 'Răng nanh thú, khớp cắn',
    description: 'Hai chiếc răng nanh trên dưới đan khớp vào nhau của dã thú.',
    lessonId: '3-2',
    examples: [
      { char: '牙', meaning: 'Răng nanh, ngà voi', romaji: 'kiba' }
    ]
  },
  '牛': {
    character: '牛 (牜)',
    sinoVietnamese: 'Ngưu',
    meaning: 'Con bò, con trâu, siêng năng',
    description: 'Đầu con trâu bò có hai sừng nhọn và tai vểnh, biểu tượng sức kéo cần cù.',
    lessonId: '3-2',
    examples: [
      { char: '牛', meaning: 'Con bò', romaji: 'ushi' },
      { char: '物', meaning: 'Đồ vật (con bò khác lạ)', romaji: 'mono' },
      { char: '特', meaning: 'Đặc biệt (bò chùa)', romaji: 'toku' }
    ]
  },
  '犬': {
    character: '犬 (犭)',
    sinoVietnamese: 'Khuyển',
    meaning: 'Con chó săn, trung thành',
    description: 'Con chó vẫy đuôi mừng chủ; dạng Khuyển đứng (犭) mô phỏng chó săn lao nhanh.',
    lessonId: '3-2',
    examples: [
      { char: '犬', meaning: 'Con chó', romaji: 'inu' },
      { char: '猫', meaning: 'Con mèo', romaji: 'neko' },
      { char: '犯', meaning: 'Phạm nhân (như chó săn đuổi bắt)', romaji: 'han' }
    ]
  },

  // === BÀI 4.1: 5 NÉT (11 BỘ) ===
  '玄': {
    character: '玄',
    sinoVietnamese: 'Huyền',
    meaning: 'Màu đen huyền ảo, sâu thẳm',
    description: 'Sợi tơ nhuộm màu đen sâu thẳm huyền bí.',
    lessonId: '4-1',
    examples: [
      { char: '玄', meaning: 'Huyền quan (cửa vào)', romaji: 'gen' }
    ]
  },
  '玉': {
    character: '玉 (王)',
    sinoVietnamese: 'Ngọc (Vương)',
    meaning: 'Viên ngọc quý, nhà vua, báu vật',
    description: 'Ba viên ngọc xâu chuỗi (Vương 王) đeo thêm viên ngọc chấm nhỏ bên hông thành Ngọc (玉).',
    lessonId: '4-1',
    examples: [
      { char: '玉', meaning: 'Viên ngọc, bóng tròn', romaji: 'tama' },
      { char: '国', meaning: 'Quốc gia', romaji: 'kuni' },
      { char: '宝', meaning: 'Bảo vật', romaji: 'takara' }
    ]
  },
  '瓜': {
    character: '瓜',
    sinoVietnamese: 'Qua',
    meaning: 'Quả dưa, bầu bí dây leo',
    description: 'Dây leo trĩu quả bầu dưa lòng thòng trên giàn.',
    lessonId: '4-1',
    examples: [
      { char: '西瓜', meaning: 'Quả dưa hấu', romaji: 'suika' }
    ]
  },
  '瓦': {
    character: '瓦',
    sinoVietnamese: 'Ngõa',
    meaning: 'Ngói đất nung, sành sứ',
    description: 'Tấm ngói đất sét uốn cong đan úp vào nhau trên mái nhà.',
    lessonId: '4-1',
    examples: [
      { char: '瓦', meaning: 'Viên ngói', romaji: 'kawara' }
    ]
  },
  '甘': {
    character: '甘',
    sinoVietnamese: 'Cam',
    meaning: 'Vị ngọt ngào, cam chịu',
    description: 'Trong miệng ngậm một miếng đồ ăn ngon ngọt.',
    lessonId: '4-1',
    examples: [
      { char: '甘', meaning: 'Ngọt ngào, chiều chuộng', romaji: 'ama(i)' }
    ]
  },
  '生': {
    character: '生',
    sinoVietnamese: 'Sinh',
    meaning: 'Sinh sôi, cuộc sống, sinh ra',
    description: 'Mầm cây non đâm chồi vươn lên từ mặt đất, biểu tượng của sự sống sinh sôi.',
    lessonId: '4-1',
    examples: [
      { char: '生', meaning: 'Sống, sinh ra', romaji: 'i(kiru)' },
      { char: '先', meaning: 'Tiên sinh, đi trước', romaji: 'sen' },
      { char: '産', meaning: 'Sản xuất, sinh nở', romaji: 'san' }
    ]
  },
  '用': {
    character: '用',
    sinoVietnamese: 'Dụng',
    meaning: 'Sử dụng, công dụng hữu ích',
    description: 'Cái giỏ đựng đồ đan bằng nan tre có thể mang ra sử dụng làm việc.',
    lessonId: '4-1',
    examples: [
      { char: '用', meaning: 'Công việc, sử dụng', romaji: 'mochi(iru)' }
    ]
  },
  '田': {
    character: '田',
    sinoVietnamese: 'Điền',
    meaning: 'Ruộng đồng, đất canh tác',
    description: 'Khu ruộng vuông vức chia bốn ô bờ ngăn nước.',
    lessonId: '4-1',
    examples: [
      { char: '田', meaning: 'Ruộng lúa', romaji: 'ta' },
      { char: '町', meaning: 'Thị trấn (đường bên ruộng)', romaji: 'machi' },
      { char: '男', meaning: 'Đàn ông làm ruộng', romaji: 'otoko' }
    ]
  },
  '疋': {
    character: '疋',
    sinoVietnamese: 'Thất',
    meaning: 'Cuộn vải, bàn chân đo',
    description: 'Bàn chân bước đi dừng lại, dùng làm đơn vị đo cuộn vải tơ.',
    lessonId: '4-1',
    examples: [
      { char: '匹', meaning: 'Con (đếm động vật)', romaji: 'hiki' }
    ]
  },
  '疒': {
    character: '疒',
    sinoVietnamese: 'Nạch',
    meaning: 'Bệnh tật, ốm đau nằm liệt giường',
    description: 'Người bệnh sốt nằm tựa vào giường nghiêng đổ mồ hôi.',
    lessonId: '4-1',
    examples: [
      { char: '病', meaning: 'Căn bệnh', romaji: 'byou' },
      { char: '痛', meaning: 'Đau đớn', romaji: 'ita(i)' },
      { char: '疲', meaning: 'Mệt mỏi', romaji: 'tsuka(reru)' }
    ]
  },
  '癶': {
    character: '癶',
    sinoVietnamese: 'Bát',
    meaning: 'Hai bàn chân đạp ra hai bên',
    description: 'Hai bàn chân quay ngược hướng đạp bước lên phía trước.',
    lessonId: '4-1',
    examples: [
      { char: '発', meaning: 'Xuất phát, phát biểu', romaji: 'hatsu' },
      { char: '登', meaning: 'Leo núi bằng hai chân', romaji: 'nobo(ru)' }
    ]
  },

  // === BÀI 4.2: 5 NÉT (12 BỘ) ===
  '白': {
    character: '白',
    sinoVietnamese: 'Bạch',
    meaning: 'Màu trắng, trong sáng, sáng rõ',
    description: 'Tia sáng mặt trời ló rạng rực rỡ màu trắng tinh khôi.',
    lessonId: '4-2',
    examples: [
      { char: '白', meaning: 'Màu trắng', romaji: 'shiro' },
      { char: '百', meaning: 'Một trăm', romaji: 'hyaku' }
    ]
  },
  '皮': {
    character: '皮',
    sinoVietnamese: 'Bì',
    meaning: 'Da dẻ, vỏ ngoài động vật',
    description: 'Bàn tay cầm dao lột tấm da thú để thuộc da làm áo ấm.',
    lessonId: '4-2',
    examples: [
      { char: '皮', meaning: 'Lớp da, vỏ quả', romaji: 'kawa' },
      { char: '波', meaning: 'Sóng biển nhấp nhô da nước', romaji: 'nami' }
    ]
  },
  '皿': {
    character: '皿',
    sinoVietnamese: 'Mãnh',
    meaning: 'Cái đĩa, bát đựng đồ ăn',
    description: 'Cái bát đĩa nông lòng có chân đỡ vững chãi đựng thức ăn cúng tế.',
    lessonId: '4-2',
    examples: [
      { char: '皿', meaning: 'Cái đĩa', romaji: 'sara' },
      { char: '盆', meaning: 'Chậu cảnh, lễ Obon', romaji: 'bon' }
    ]
  },
  '目': {
    character: '目',
    sinoVietnamese: 'Mục',
    meaning: 'Con mắt, cái nhìn, mục tiêu',
    description: 'Con mắt tròn có hai vạch tròng mắt nhìn thẳng, sau dựng đứng lại.',
    lessonId: '4-2',
    examples: [
      { char: '目', meaning: 'Con mắt', romaji: 'me' },
      { char: '看', meaning: 'Trông nom (tay che mắt nhìn xa)', romaji: 'kan' },
      { char: '着', meaning: 'Mặc áo, đến nơi', romaji: 'ki(ru)' }
    ]
  },
  '矛': {
    character: '矛',
    sinoVietnamese: 'Mâu',
    meaning: 'Cây giáo mâu đâm thủng',
    description: 'Ngọn giáo mâu dài có móc nhọn dùng để đâm xuyên áo giáp đối thủ.',
    lessonId: '4-2',
    examples: [
      { char: '矛', meaning: 'Cây giáo mâu', romaji: 'hoko' },
      { char: '柔', meaning: 'Mềm mại (cây mâu bằng gỗ dẻo)', romaji: 'yawa(rakai)' }
    ]
  },
  '矢': {
    character: '矢',
    sinoVietnamese: 'Thỉ',
    meaning: 'Mũi tên bay thẳng chính xác',
    description: 'Mũi tên có đầu nhọn, thân thẳng và lông đuôi bay thẳng tới bia ngắm.',
    lessonId: '4-2',
    examples: [
      { char: '矢', meaning: 'Mũi tên', romaji: 'ya' },
      { char: '知', meaning: 'Hiểu biết (lời nói sắc như tên)', romaji: 'shi(ru)' },
      { char: '短', meaning: 'Ngắn (ngắn như mũi tên)', romaji: 'mijika(i)' }
    ]
  },
  '石': {
    character: '石',
    sinoVietnamese: 'Thạch',
    meaning: 'Hòn đá, tảng đá kiên cố',
    description: 'Hòn đá vuông vức rơi dưới chân sườn núi (Hán 厂).',
    lessonId: '4-2',
    examples: [
      { char: '石', meaning: 'Hòn đá', romaji: 'ishi' },
      { char: '研', meaning: 'Mài giũa, nghiên cứu', romaji: 'to(gu)' }
    ]
  },
  '示': {
    character: '示 (礻)',
    sinoVietnamese: 'Thị (Kỳ)',
    meaning: 'Thần linh, hiển thị, bàn thờ cúng',
    description: 'Chiếc bàn thờ bằng đá cúng tế thần linh để xin mưa thuận gió hòa.',
    lessonId: '4-2',
    examples: [
      { char: '社', meaning: 'Đền thần, công ty', romaji: 'sha' },
      { char: '神', meaning: 'Thần linh', romaji: 'kami' },
      { char: '礼', meaning: 'Lễ nghi, cảm ơn', romaji: 'rei' }
    ]
  },
  '禹': {
    character: '禹',
    sinoVietnamese: 'Vũ',
    meaning: 'Dấu chân con thú bò sát',
    description: 'Vết chân bò sát để lại trên bùn lầy thời vua Vũ trị thủy.',
    lessonId: '4-2',
    examples: [
      { char: '禽', meaning: 'Gia cầm, loài chim', romaji: 'kin' }
    ]
  },
  '禾': {
    character: '禾',
    sinoVietnamese: 'Hòa',
    meaning: 'Cây lúa trĩu hạt, mùa màng',
    description: 'Cây lúa nước có bông lúa trĩu cong xuống sẵn sàng thu hoạch.',
    lessonId: '4-2',
    examples: [
      { char: '私', meaning: 'Tôi (lúa gạo của riêng mình)', romaji: 'watashi' },
      { char: '秋', meaning: 'Mùa thu (lúa chín vàng như lửa)', romaji: 'aki' },
      { char: '科', meaning: 'Khoa học, phân khoa', romaji: 'ka' }
    ]
  },
  '穴': {
    character: '穴',
    sinoVietnamese: 'Huyệt',
    meaning: 'Hang hốc, lỗ thủng trong vách đá',
    description: 'Mái che trên vách núi bị khoét rỗng thành cái hang cho thú cư ngụ.',
    lessonId: '4-2',
    examples: [
      { char: '穴', meaning: 'Cái lỗ, cái hang', romaji: 'ana' },
      { char: '空', meaning: 'Bầu trời, trống rỗng', romaji: 'sora' }
    ]
  },
  '立': {
    character: '立',
    sinoVietnamese: 'Lập',
    meaning: 'Đứng thẳng, độc lập, thiết lập',
    description: 'Một người đứng dang hai chân thẳng thắn hiên ngang trên mặt đất.',
    lessonId: '4-2',
    examples: [
      { char: '立', meaning: 'Đứng dậy', romaji: 'ta(tsu)' },
      { char: '音', meaning: 'Âm thanh (đứng hát)', romaji: 'oto' },
      { char: '親', meaning: 'Cha mẹ thân thiết (đứng trên cây nhìn)', romaji: 'oya' }
    ]
  },

  // === BÀI 5.1: 6 NÉT (14 BỘ) ===
  '竹': {
    character: '竹 (⺮)',
    sinoVietnamese: 'Trúc',
    meaning: 'Cây tre, ống tre, thẻ tre',
    description: 'Hai nhánh lá tre rủ xuống, biểu thị đồ đan lát hoặc thẻ tre viết sách thời xưa.',
    lessonId: '5-1',
    examples: [
      { char: '竹', meaning: 'Cây tre', romaji: 'take' },
      { char: '答', meaning: 'Trả lời (viết lên thẻ tre)', romaji: 'kota(eru)' },
      { char: '筆', meaning: 'Cây bút cán tre', romaji: 'fude' }
    ]
  },
  '米': {
    character: '米',
    sinoVietnamese: 'Mễ',
    meaning: 'Hạt gạo, thóc lúa, nước Mỹ',
    description: 'Bông lúa đập ra hạt gạo văng ra bốn hướng, hạt ngọc thực nuôi sống người.',
    lessonId: '5-1',
    examples: [
      { char: '米', meaning: 'Hạt gạo', romaji: 'kome' },
      { char: '料', meaning: 'Nguyên liệu ẩm thực', romaji: 'ryou' }
    ]
  },
  '糸': {
    character: '糸',
    sinoVietnamese: 'Mịch',
    meaning: 'Sợi tơ, sợi chỉ, dệt may kết nối',
    description: 'Cuộn tơ tằm óng ả có nhiều sợi tơ buông dài, biểu thị sự liên kết bền chặt.',
    lessonId: '5-1',
    examples: [
      { char: '糸', meaning: 'Sợi chỉ', romaji: 'ito' },
      { char: '紙', meaning: 'Giấy viết từ sợi tơ', romaji: 'kami' },
      { char: '終', meaning: 'Kết thúc sợi chỉ', romaji: 'owa(ru)' }
    ]
  },
  '缶': {
    character: '缶',
    sinoVietnamese: 'Phẫu',
    meaning: 'Bình sành, vò gốm, lon hộp',
    description: 'Bình gốm nung có nắp đậy kín để ủ rượu ủ nước.',
    lessonId: '5-1',
    examples: [
      { char: '缶', meaning: 'Lon nước hộp thiếc', romaji: 'kan' }
    ]
  },
  '网': {
    character: '网 (罒)',
    sinoVietnamese: 'Võng',
    meaning: 'Lưới đánh cá, bắt giữ',
    description: 'Tấm lưới đan mắt cáo dùng để giăng bắt chim thú hoặc cá tôm dưới nước.',
    lessonId: '5-1',
    examples: [
      { char: '買', meaning: 'Mua bán (lưới gom tiền sò)', romaji: 'ka(u)' },
      { char: '置', meaning: 'Đặt để vị trí', romaji: 'o(ku)' }
    ]
  },
  '羊': {
    character: '羊',
    sinoVietnamese: 'Dương',
    meaning: 'Con cừu, con dê, hiền lành',
    description: 'Đầu con cừu có hai sừng uốn cong, biểu tượng của sự mỹ lệ và cát tường may mắn.',
    lessonId: '5-1',
    examples: [
      { char: '羊', meaning: 'Con cừu', romaji: 'hitsuji' },
      { char: '美', meaning: 'Xinh đẹp (con cừu to lớn)', romaji: 'utsuku(shii)' },
      { char: '着', meaning: 'Mặc áo ấm lông cừu', romaji: 'ki(ru)' }
    ]
  },
  '羽': {
    character: '羽',
    sinoVietnamese: 'Vũ',
    meaning: 'Lông vũ, đôi cánh chim bay',
    description: 'Đôi cánh chim dang rộng với các sợi lông vũ mượt mà giúp bay lượn.',
    lessonId: '5-1',
    examples: [
      { char: '羽', meaning: 'Lông chim, đếm con chim', romaji: 'hane' },
      { char: '習', meaning: 'Học tập (chim tập vỗ cánh)', romaji: 'nara(u)' }
    ]
  },
  '老': {
    character: '老',
    sinoVietnamese: 'Lão',
    meaning: 'Người già, tóc bạc chống gậy',
    description: 'Ông lão tóc bạc lưng còng chống gậy đi từng bước chậm rãi.',
    lessonId: '5-1',
    examples: [
      { char: '老', meaning: 'Già nua, người cao tuổi', romaji: 'o(iru)' },
      { char: '考', meaning: 'Suy nghĩ (như bậc trưởng lão)', romaji: 'kanga(eru)' }
    ]
  },
  '而': {
    character: '而',
    sinoVietnamese: 'Nhi',
    meaning: 'Râu mép, và, mà lại',
    description: 'Hàng râu mép rủ xuống dưới cằm của người đàn ông.',
    lessonId: '5-1',
    examples: [
      { char: '耐', meaning: 'Nhẫn nại chịu đựng', romaji: 'ta(eru)' }
    ]
  },
  '耒': {
    character: '耒',
    sinoVietnamese: 'Lỗi',
    meaning: 'Cái cày gỗ, nông cụ xới đất',
    description: 'Chiếc cày tay bằng gỗ dùng để cày xới đất tơi xốp trước khi gieo hạt.',
    lessonId: '5-1',
    examples: [
      { char: '耕', meaning: 'Cày cấy ruộng nương', romaji: 'tagaya(su)' }
    ]
  },
  '耳': {
    character: '耳',
    sinoVietnamese: 'Nhĩ',
    meaning: 'Cái tai, lắng nghe thấu suốt',
    description: 'Vành tai con người với các nếp sụn, biểu thị thính giác và sự lắng nghe.',
    lessonId: '5-1',
    examples: [
      { char: '耳', meaning: 'Cái tai', romaji: 'mimi' },
      { char: '聞', meaning: 'Nghe ngóng tại cửa cổng', romaji: 'ki(ku)' },
      { char: '取', meaning: 'Lấy tai quân giặc', romaji: 'to(ru)' }
    ]
  },
  '聿': {
    character: '聿',
    sinoVietnamese: 'Duật',
    meaning: 'Cây bút lông ghi chép',
    description: 'Bàn tay nắm thân bút lông thẳng đứng để viết chữ lên thẻ tre.',
    lessonId: '5-1',
    examples: [
      { char: '書', meaning: 'Viết sách', romaji: 'ka(ku)' }
    ]
  },
  '肉': {
    character: '肉',
    sinoVietnamese: 'Nhục',
    meaning: 'Miếng thịt, cơ bắp, thân thể',
    description: 'Miếng thịt tươi có thớ gân sọc chéo; thường biến thành bộ Nguyệt 月 khi ghép chữ.',
    lessonId: '5-1',
    examples: [
      { char: '肉', meaning: 'Thịt ăn', romaji: 'niku' },
      { char: '育', meaning: 'Nuôi dưỡng lớn khôn', romaji: 'soda(tsu)' }
    ]
  },
  '臣': {
    character: '臣',
    sinoVietnamese: 'Thần',
    meaning: 'Bề tôi, quan lại, trung thần',
    description: 'Mắt người cận thần cúi đầu kính cẩn trước mặt nhà vua.',
    lessonId: '5-1',
    examples: [
      { char: '臣', meaning: 'Thần tử, bộ trưởng', romaji: 'shin' }
    ]
  },

  // === BÀI 5.2: 6 NÉT (15 BỘ) ===
  '自': {
    character: '自',
    sinoVietnamese: 'Tự',
    meaning: 'Bản thân, tự mình, cái mũi',
    description: 'Người Á Đông thường trỏ ngón tay vào mũi mình để nói "Chính tôi!".',
    lessonId: '5-2',
    examples: [
      { char: '自', meaning: 'Tự mình', romaji: 'mizuka(ra)' },
      { char: '息', meaning: 'Hơi thở (từ mũi tim)', romaji: 'iki' }
    ]
  },
  '至': {
    character: '至',
    sinoVietnamese: 'Chí',
    meaning: 'Đến nơi, tột cùng, đạt tới',
    description: 'Mũi tên bay từ trên trời cắm thẳng xuống đất: đã đến nơi đích.',
    lessonId: '5-2',
    examples: [
      { char: '至', meaning: 'Đến tột cùng', romaji: 'ita(ru)' },
      { char: '屋', meaning: 'Mái nhà đến trọ', romaji: 'ya' }
    ]
  },
  '臼': {
    character: '臼',
    sinoVietnamese: 'Cữu',
    meaning: 'Cái cối giã gạo',
    description: 'Cối đá khoét sâu lòng có các vạch chống dính để giã thóc làm bánh mochi.',
    lessonId: '5-2',
    examples: [
      { char: '臼', meaning: 'Cái cối', romaji: 'usu' }
    ]
  },
  '舌': {
    character: '舌',
    sinoVietnamese: 'Thiệt',
    meaning: 'Cái lưỡi, nếm vị, lời nói',
    description: 'Chiếc lưỡi thè ra từ miệng để nếm vị hoặc uốn lời phát âm.',
    lessonId: '5-2',
    examples: [
      { char: '舌', meaning: 'Cái lưỡi', romaji: 'shita' },
      { char: '話', meaning: 'Nói chuyện (ngôn từ cái lưỡi)', romaji: 'hana(su)' }
    ]
  },
  '舛': {
    character: '舛',
    sinoVietnamese: 'Suyễn',
    meaning: 'Hai chân ngược hướng, sai lệch',
    description: 'Hai bàn chân quay lưng vào nhau bước về hai phía đối nghịch.',
    lessonId: '5-2',
    examples: [
      { char: '舞', meaning: 'Múa lượn (hai chân đổi bước)', romaji: 'ma(u)' }
    ]
  },
  '舟': {
    character: '舟',
    sinoVietnamese: 'Chu',
    meaning: 'Chiếc thuyền độc mộc, bè trôi',
    description: 'Thân thuyền gỗ thon dài trôi bồng bềnh trên mặt nước có mái chèo.',
    lessonId: '5-2',
    examples: [
      { char: '舟', meaning: 'Chiếc thuyền con', romaji: 'fune' },
      { char: '船', meaning: 'Con tàu lớn', romaji: 'fune' }
    ]
  },
  '艮': {
    character: '艮',
    sinoVietnamese: 'Cấn',
    meaning: 'Quẻ Cấn, dừng lại, cứng cỏi',
    description: 'Mắt trừng nhìn thẳng dừng chân ngoảnh lại quan sát.',
    lessonId: '5-2',
    examples: [
      { char: '良', meaning: 'Tốt đẹp', romaji: 'yo(i)' },
      { char: '銀', meaning: 'Kim loại bạc sáng', romaji: 'gin' }
    ]
  },
  '色': {
    character: '色',
    sinoVietnamese: 'Sắc',
    meaning: 'Màu sắc, sắc thái nét mặt',
    description: 'Sắc mặt con người thay đổi khi biểu lộ cảm xúc yêu ghét.',
    lessonId: '5-2',
    examples: [
      { char: '色', meaning: 'Màu sắc', romaji: 'iro' }
    ]
  },
  '艸': {
    character: '艸 (艹)',
    sinoVietnamese: 'Thảo',
    meaning: 'Cỏ cây hoa lá, thảo mộc',
    description: 'Hai mầm cỏ non đâm chồi xanh tốt trên mặt đất mượt mà.',
    lessonId: '5-2',
    examples: [
      { char: '草', meaning: 'Cỏ dại', romaji: 'kusa' },
      { char: '花', meaning: 'Bông hoa tươi', romaji: 'hana' },
      { char: '茶', meaning: 'Lá trà xanh', romaji: 'cha' }
    ]
  },
  '虍': {
    character: '虍',
    sinoVietnamese: 'Hô',
    meaning: 'Vằn lông cọp, chúa sơn lâm oai phong',
    description: 'Đầu và những vệt vằn oai vệ của con hổ chúa sơn lâm.',
    lessonId: '5-2',
    examples: [
      { char: '虎', meaning: 'Con hổ', romaji: 'tora' },
      { char: '虚', meaning: 'Hư vô trống rỗng', romaji: 'kyo' }
    ]
  },
  '虫': {
    character: '虫',
    sinoVietnamese: 'Trùng',
    meaning: 'Côn trùng, sâu bọ, rắn rết',
    description: 'Con sâu bọ đầu to đuôi dài bò ngoằn ngoèo dưới lớp cỏ ẩm ướt.',
    lessonId: '5-2',
    examples: [
      { char: '虫', meaning: 'Côn trùng', romaji: 'mushi' },
      { char: '蛍', meaning: 'Con đom đóm phát sáng', romaji: 'hotaru' }
    ]
  },
  '血': {
    character: '血',
    sinoVietnamese: 'Huyết',
    meaning: 'Máu, giọt máu sinh mệnh',
    description: 'Một giọt máu tươi rỏ vào chiếc đĩa cúng (Mãnh 皿) tế thần.',
    lessonId: '5-2',
    examples: [
      { char: '血', meaning: 'Giọt máu', romaji: 'chi' }
    ]
  },
  '行': {
    character: '行',
    sinoVietnamese: 'Hành',
    meaning: 'Đi lại, ngã tư đường, thực hành',
    description: 'Ngã tư đường giao lộ tấp nập người và xe qua lại.',
    lessonId: '5-2',
    examples: [
      { char: '行', meaning: 'Đi tới', romaji: 'i(ku)' },
      { char: '街', meaning: 'Phố xá ngã tư', romaji: 'machi' }
    ]
  },
  '衣': {
    character: '衣 (衤)',
    sinoVietnamese: 'Y',
    meaning: 'Áo quần, y phục che thân',
    description: 'Tấm áo vạt chéo thời xưa với cổ áo và hai vạt buông phủ.',
    lessonId: '5-2',
    examples: [
      { char: '衣', meaning: 'Y phục', romaji: 'koromo' },
      { char: '袋', meaning: 'Túi đựng đồ', romaji: 'fukuro' }
    ]
  },
  '襾': {
    character: '襾',
    sinoVietnamese: 'Á',
    meaning: 'Che phủ, úp xuống, hướng Tây',
    description: 'Tấm nắp úp phủ chụp lên chiếc hũ kín.',
    lessonId: '5-2',
    examples: [
      { char: '西', meaning: 'Hướng Tây', romaji: 'nishi' },
      { char: '要', meaning: 'Quan trọng, yêu cầu', romaji: 'kaname' }
    ]
  },

  // === BÀI 6: 7 NÉT (20 BỘ) ===
  '見': {
    character: '見',
    sinoVietnamese: 'Kiến',
    meaning: 'Nhìn thấy, trông thấy, kiến thức',
    description: 'Mắt to (Mục 目) gắn trên đôi chân (Nhi 儿) đi khắp nơi để quan sát học hỏi.',
    lessonId: '6',
    examples: [
      { char: '見', meaning: 'Nhìn thấy', romaji: 'mi(ru)' },
      { char: '親', meaning: 'Cha mẹ', romaji: 'oya' },
      { char: '覚', meaning: 'Nhớ, tỉnh giấc', romaji: 'obo(eru)' }
    ]
  },
  '角': {
    character: '角',
    sinoVietnamese: 'Giác',
    meaning: 'Sừng thú nhọn, góc cạnh',
    description: 'Chiếc sừng nhọn hoắt trên đầu trâu bò dùng để tự vệ và chiến đấu.',
    lessonId: '6',
    examples: [
      { char: '角', meaning: 'Góc, sừng thú', romaji: 'kado' }
    ]
  },
  '言': {
    character: '言 (訁)',
    sinoVietnamese: 'Ngôn',
    meaning: 'Lời nói, ngôn ngữ, phát biểu',
    description: 'Những đợt sóng âm thanh phát ra từ khuôn miệng thành lời nói rõ ràng.',
    lessonId: '6',
    examples: [
      { char: '言', meaning: 'Nói', romaji: 'i(u)' },
      { char: '話', meaning: 'Kể chuyện', romaji: 'hana(su)' },
      { char: '語', meaning: 'Ngôn ngữ', romaji: 'go' }
    ]
  },
  '谷': {
    character: '谷',
    sinoVietnamese: 'Cốc',
    meaning: 'Khe núi, thung lũng sâu',
    description: 'Nước chảy len lỏi từ hai sườn đồi thoát ra miệng thung lũng.',
    lessonId: '6',
    examples: [
      { char: '谷', meaning: 'Thung lũng', romaji: 'tani' }
    ]
  },
  '豆': {
    character: '豆',
    sinoVietnamese: 'Đậu',
    meaning: 'Hạt đậu, đĩa cúng chân cao',
    description: 'Chiếc chén chân cao thời xưa đựng những hạt đậu thơm ngon cúng tế.',
    lessonId: '6',
    examples: [
      { char: '豆', meaning: 'Hạt đậu', romaji: 'mame' },
      { char: '頭', meaning: 'Cái đầu người', romaji: 'atama' }
    ]
  },
  '豕': {
    character: '豕',
    sinoVietnamese: 'Thỉ',
    meaning: 'Con heo, con lợn béo tốt',
    description: 'Con lợn béo tròn có bốn chân ngắn và cái đuôi ngoe nguẩy.',
    lessonId: '6',
    examples: [
      { char: '豚', meaning: 'Thịt lợn', romaji: 'buta' },
      { char: '家', meaning: 'Ngôi nhà (dưới mái nhà nuôi lợn)', romaji: 'ie' }
    ]
  },
  '豸': {
    character: '豸',
    sinoVietnamese: 'Trĩ',
    meaning: 'Thú không chân, sâu bọ bò sát',
    description: 'Con sâu bọ dài thân trườn bò rập rình săn mồi.',
    lessonId: '6',
    examples: [
      { char: '貌', meaning: 'Dung mạo, hình thái', romaji: 'bou' }
    ]
  },
  '貝': {
    character: '貝',
    sinoVietnamese: 'Bối',
    meaning: 'Vỏ sò, tiền bạc, của cải quý giá',
    description: 'Con sò biển hé miệng: thời cổ con người dùng vỏ sò làm tiền tệ buôn bán.',
    lessonId: '6',
    examples: [
      { char: '貝', meaning: 'Con sò', romaji: 'kai' },
      { char: '買', meaning: 'Mua sắm tiền bạc', romaji: 'ka(u)' },
      { char: '貸', meaning: 'Cho vay mượn tiền', romaji: 'ka(su)' }
    ]
  },
  '赤': {
    character: '赤',
    sinoVietnamese: 'Xích',
    meaning: 'Màu đỏ rực, chân thật',
    description: 'Ngọn lửa (Hỏa) bừng cháy trên mặt đất tạo màu đỏ rực rỡ.',
    lessonId: '6',
    examples: [
      { char: '赤', meaning: 'Màu đỏ', romaji: 'aka' }
    ]
  },
  '走': {
    character: '走',
    sinoVietnamese: 'Tẩu',
    meaning: 'Chạy nhanh, phi nước đại',
    description: 'Người vung tay cất bước chân lao nhanh về phía trước trên đất.',
    lessonId: '6',
    examples: [
      { char: '走', meaning: 'Chạy', romaji: 'hashi(ru)' },
      { char: '起', meaning: 'Thức dậy (chạy dậy)', romaji: 'o(kiru)' }
    ]
  },
  '足': {
    character: '足 (⻊)',
    sinoVietnamese: 'Túc',
    meaning: 'Bàn chân, đầy đủ, bước chân',
    description: 'Ống chân gắn liền với bàn chân đứng vững chãi trên đất.',
    lessonId: '6',
    examples: [
      { char: '足', meaning: 'Bàn chân, đầy đủ', romaji: 'ashi' },
      { char: '路', meaning: 'Con đường bước chân đi', romaji: 'michi' }
    ]
  },
  '身': {
    character: '身',
    sinoVietnamese: 'Thân',
    meaning: 'Thân thể, vóc dáng, mang bầu',
    description: 'Thân hình người mẹ có bụng lớn nhô ra đang mang thai đứa con.',
    lessonId: '6',
    examples: [
      { char: '身', meaning: 'Bản thân, cơ thể', romaji: 'mi' }
    ]
  },
  '車': {
    character: '車',
    sinoVietnamese: 'Xa',
    meaning: 'Xe cộ, bánh xe lăn, vận tải',
    description: 'Nhìn từ trên cao: chiếc xe gỗ có hai bánh hai bên và trục xe ở giữa.',
    lessonId: '6',
    examples: [
      { char: '車', meaning: 'Chiếc xe hơi, xe bò', romaji: 'kuruma' },
      { char: '転', meaning: 'Ngã lăn, chuyển bánh', romaji: 'koro(bu)' },
      { char: '輸', meaning: 'Vận chuyển', romaji: 'yu' }
    ]
  },
  '辛': {
    character: '辛',
    sinoVietnamese: 'Tân',
    meaning: 'Vị cay đắng, cay nghiệt, gian nan',
    description: 'Mũi dao nhọn xăm trừng phạt lên trán tù nhân, biểu thị sự cay đắng đớn đau.',
    lessonId: '6',
    examples: [
      { char: '辛', meaning: 'Cay xè, vất vả', romaji: 'kara(i)' }
    ]
  },
  '辰': {
    character: '辰',
    sinoVietnamese: 'Thần',
    meaning: 'Con rồng (Thìn), sấm sét mùa xuân',
    description: 'Con trai hé vỏ thò chân vươn ra vào buổi sáng sớm đón nắng.',
    lessonId: '6',
    examples: [
      { char: '農', meaning: 'Nông nghiệp (theo thời khắc Thần)', romaji: 'nou' }
    ]
  },
  '辶': {
    character: '辶',
    sinoVietnamese: 'Sước',
    meaning: 'Con đường, bước đi rồi dừng lại',
    description: 'Bàn chân bước đi trên con đường ngoằn ngoèo, biểu thị sự di chuyển khoảng cách.',
    lessonId: '6',
    examples: [
      { char: '道', meaning: 'Con đường, đạo đức', romaji: 'michi' },
      { char: '通', meaning: 'Đi thông qua', romaji: 'too(ru)' },
      { char: '近', meaning: 'Gần gũi', romaji: 'chika(i)' }
    ]
  },
  '邑': {
    character: '邑 (阝 phải)',
    sinoVietnamese: 'Ấp',
    meaning: 'Làng xóm, vùng đất phong (阝 bên phải)',
    description: 'Người dân quỳ gối sinh sống trong vùng đất được phong; đứng BÊN PHẢI chữ.',
    lessonId: '6',
    examples: [
      { char: '都', meaning: 'Thủ đô đông dân cư', romaji: 'miyako' },
      { char: '部', meaning: 'Bộ phận, câu lạc bộ', romaji: 'bu' }
    ]
  },
  '酉': {
    character: '酉',
    sinoVietnamese: 'Dậu',
    meaning: 'Bình rượu ủ lên men, giờ Dậu',
    description: 'Chiếc hũ gốm chứa đầy nước nho lên men thành rượu cay nồng.',
    lessonId: '6',
    examples: [
      { char: '酒', meaning: 'Rượu Sake', romaji: 'sake' },
      { char: '配', meaning: 'Phân chia rượu', romaji: 'hai' }
    ]
  },
  '釆': {
    character: '釆',
    sinoVietnamese: 'Biện',
    meaning: 'Phân biệt, móng vuốt lựa chọn',
    description: 'Móng vuốt động vật cào xới để chọn lọc thức ăn.',
    lessonId: '6',
    examples: [
      { char: '釈', meaning: 'Giải thích thấu đáo', romaji: 'shaku' }
    ]
  },
  '里': {
    character: '里',
    sinoVietnamese: 'Lý',
    meaning: 'Làng quê, dặm đường (ruộng + đất)',
    description: 'Khu ruộng đất canh tác (Điền 田 + Thổ 土) nơi dân làng lập nghiệp.',
    lessonId: '6',
    examples: [
      { char: '里', meaning: 'Làng quê', romaji: 'sato' },
      { char: '野', meaning: 'Cánh đồng hoang dã', romaji: 'no' },
      { char: '理', meaning: 'Lý lẽ (ngọc trong đất làng)', romaji: 'ri' }
    ]
  },

  // === BÀI 7: 8 NÉT (8 BỘ) ===
  '金': {
    character: '金',
    sinoVietnamese: 'Kim',
    meaning: 'Vàng, kim loại, tiền bạc',
    description: 'Trong lòng đất núi chứa những hạt quặng vàng phát sáng lấp lánh.',
    lessonId: '7',
    examples: [
      { char: '金', meaning: 'Tiền bạc, thứ Sáu, vàng', romaji: 'kane' },
      { char: '銀', meaning: 'Bạc trắng', romaji: 'gin' },
      { char: '鉄', meaning: 'Sắt thép', romaji: 'tetsu' }
    ]
  },
  '長': {
    character: '長',
    sinoVietnamese: 'Trường',
    meaning: 'Dài, lâu năm, người trưởng thành',
    description: 'Người già tóc dài buông xõa uy nghiêm dẫn dắt thế hệ sau.',
    lessonId: '7',
    examples: [
      { char: '長', meaning: 'Dài, thủ trưởng', romaji: 'naga(i)' }
    ]
  },
  '門': {
    character: '門',
    sinoVietnamese: 'Môn',
    meaning: 'Cánh cổng làng hai cánh mở ra',
    description: 'Hai cánh cổng lớn của đền chùa mở rộng đón chào người vào.',
    lessonId: '7',
    examples: [
      { char: '門', meaning: 'Cánh cổng', romaji: 'mon' },
      { char: '間', meaning: 'Khoảng thời gian (nắng lọt qua cổng)', romaji: 'aida' },
      { char: '開', meaning: 'Mở cửa', romaji: 'a(keru)' }
    ]
  },
  '阜': {
    character: '阜 (阝 trái)',
    sinoVietnamese: 'Phụ',
    meaning: 'Gò đất cao, đồi núi (阝 bên trái)',
    description: 'Bậc thang đắp đất lên sườn gò núi; khi ghép đứng ở BÊN TRÁI chữ.',
    lessonId: '7',
    examples: [
      { char: '防', meaning: 'Phòng thủ sau gò đất', romaji: 'fuse(gu)' },
      { char: '階', meaning: 'Bậc cầu thang', romaji: 'kai' },
      { char: '限', meaning: 'Giới hạn', romaji: 'kagi(ru)' }
    ]
  },
  '隹': {
    character: '隹',
    sinoVietnamese: 'Chuy',
    meaning: 'Con chim đuôi ngắn đậu trên cành',
    description: 'Con chim đuôi ngắn cụt mỏ nhỏ đang đậu bình yên trên cành cây.',
    lessonId: '7',
    examples: [
      { char: '集', meaning: 'Tập trung (nhiều chim đậu trên cây)', romaji: 'atsu(maru)' },
      { char: '難', meaning: 'Khó khăn gian nan', romaji: 'muzuka(shii)' },
      { char: '進', meaning: 'Tiến lên phía trước', romaji: 'susu(mu)' }
    ]
  },
  '雨': {
    character: '雨',
    sinoVietnamese: 'Vũ',
    meaning: 'Cơn mưa rào, giọt nước rơi từ mây',
    description: 'Bầu trời mây đen trút bốn hạt mưa rào rạt xuống mặt đất.',
    lessonId: '7',
    examples: [
      { char: '雨', meaning: 'Cơn mưa', romaji: 'ame' },
      { char: '雪', meaning: 'Tuyết trắng (mưa lạnh quét được)', romaji: 'yuki' },
      { char: '電', meaning: 'Điện năng, tia sét trong mưa', romaji: 'den' }
    ]
  },
  '青': {
    character: '青',
    sinoVietnamese: 'Thanh',
    meaning: 'Màu xanh biếc, thanh xuân',
    description: 'Cây cỏ mầm non mọc xanh tươi bên giếng nước trong vắt.',
    lessonId: '7',
    examples: [
      { char: '青', meaning: 'Màu xanh da trời', romaji: 'ao' },
      { char: '晴', meaning: 'Trời nắng quang đãng', romaji: 'ha(reru)' },
      { char: '静', meaning: 'Yên tĩnh thanh tịnh', romaji: 'shizu(ka)' }
    ]
  },
  '非': {
    character: '非',
    sinoVietnamese: 'Phi',
    meaning: 'Sai trái, bất phi, hai cánh ngược',
    description: 'Hai chiếc cánh chim quay lưng đập ngược chiều nhau: trái ngược quy chuẩn.',
    lessonId: '7',
    examples: [
      { char: '非', meaning: 'Phi lý, sai trái', romaji: 'hi' },
      { char: '悲', meaning: 'Buồn bã đau lòng', romaji: 'kana(shii)' }
    ]
  },

  // === BÀI 8: 9 NÉT (11 BỘ) ===
  '面': {
    character: '面',
    sinoVietnamese: 'Diện',
    meaning: 'Khuôn mặt, bề mặt, diện mạo',
    description: 'Khung khuôn mặt người với lông mày, mắt và mũi rõ nét.',
    lessonId: '8',
    examples: [
      { char: '面', meaning: 'Mặt, bề mặt', romaji: 'men' }
    ]
  },
  '革': {
    character: '革',
    sinoVietnamese: 'Cách',
    meaning: 'Tấm da thuộc, cải cách, đổi mới',
    description: 'Bộ da thú đã căng ra cạo sạch lông để thuộc thành tấm da mịn màng.',
    lessonId: '8',
    examples: [
      { char: '革', meaning: 'Da thuộc', romaji: 'kawa' },
      { char: '靴', meaning: 'Đôi giày da', romaji: 'kutsu' }
    ]
  },
  '韋': {
    character: '韋',
    sinoVietnamese: 'Vi',
    meaning: 'Da mềm bọc ngoài, phòng ngự',
    description: 'Tấm da thuộc mềm dẻo bao bọc quanh tường thành để phòng ngự.',
    lessonId: '8',
    examples: [
      { char: '偉', meaning: 'Vĩ đại, xuất chúng', romaji: 'era(i)' }
    ]
  },
  '韭': {
    character: '韭',
    sinoVietnamese: 'Cửu',
    meaning: 'Cây rau hẹ, mọc lại xanh tốt',
    description: 'Luống rau hẹ sau khi cắt lại đâm chồi xanh mướt bền bỉ.',
    lessonId: '8',
    examples: [
      { char: '韮', meaning: 'Rau hẹ thơm', romaji: 'nira' }
    ]
  },
  '音': {
    character: '音',
    sinoVietnamese: 'Âm',
    meaning: 'Âm thanh, tiếng hát, lời ca',
    description: 'Người đứng (Lập 立) mở miệng (Khẩu 口) cất tiếng hát vang thành âm điệu.',
    lessonId: '8',
    examples: [
      { char: '音', meaning: 'Âm thanh', romaji: 'oto' },
      { char: '暗', meaning: 'Tối tăm (mặt trời tắt âm thanh)', romaji: 'kura(i)' },
      { char: '楽', meaning: 'Âm nhạc vui vẻ', romaji: 'tano(shii)' }
    ]
  },
  '頁': {
    character: '頁',
    sinoVietnamese: 'Hiệp',
    meaning: 'Trang sách, đầu người trang trọng',
    description: 'Cái đầu người đăm chiêu nhìn vào trang sách vở mở ra.',
    lessonId: '8',
    examples: [
      { char: '頂', meaning: 'Đỉnh đầu, nhận lấy', romaji: 'itada(ku)' },
      { char: '頭', meaning: 'Cái đầu', romaji: 'atama' },
      { char: '題', meaning: 'Đề tài trang sách', romaji: 'dai' }
    ]
  },
  '風': {
    character: '風',
    sinoVietnamese: 'Phong',
    meaning: 'Cơn gió thổi lồng lộng, phong cách',
    description: 'Côn trùng (Trùng 虫) cuốn bay theo luồng gió lốc thổi qua ô cửa.',
    lessonId: '8',
    examples: [
      { char: '風', meaning: 'Cơn gió, cảm cúm', romaji: 'kaze' }
    ]
  },
  '飛': {
    character: '飛',
    sinoVietnamese: 'Phi',
    meaning: 'Bay lượn trên bầu trời',
    description: 'Cánh chim vỗ mạnh bay vút lên bầu trời cao xanh thẳm.',
    lessonId: '8',
    examples: [
      { char: '飛', meaning: 'Bay lượn', romaji: 'to(bu)' },
      { char: '機', meaning: 'Máy bay phi cơ', romaji: 'ki' }
    ]
  },
  '食': {
    character: '食 (飠)',
    sinoVietnamese: 'Thực',
    meaning: 'Ăn uống, lương thực nuôi sống',
    description: 'Bát cơm đậy nắp dưới mái che mời mọc mọi người ngồi ăn.',
    lessonId: '8',
    examples: [
      { char: '食', meaning: 'Ăn uống', romaji: 'ta(beru)' },
      { char: '飲', meaning: 'Uống nước', romaji: 'no(mu)' },
      { char: '飯', meaning: 'Bữa cơm gạo', romaji: 'meshi' }
    ]
  },
  '首': {
    character: '首',
    sinoVietnamese: 'Thủ',
    meaning: 'Cái cổ, đầu thủ lĩnh, đứng đầu',
    description: 'Chiếc đầu người có tóc và cổ, biểu thị người thủ lĩnh lãnh đạo.',
    lessonId: '8',
    examples: [
      { char: '首', meaning: 'Cái cổ, thủ tướng', romaji: 'kubi' },
      { char: '道', meaning: 'Con đường dẫn lối', romaji: 'michi' }
    ]
  },
  '香': {
    character: '香',
    sinoVietnamese: 'Hương',
    meaning: 'Mùi thơm nức, hương thơm lúa chín',
    description: 'Cây lúa (Hòa 禾) phơi dưới ánh mặt trời (Nhật 日) tỏa mùi thơm ngào ngạt.',
    lessonId: '8',
    examples: [
      { char: '香', meaning: 'Mùi hương thơm tho', romaji: 'kao(ri)' }
    ]
  },

  // === BÀI 9: 10 NÉT ĐẾN 17 NÉT (16 BỘ) ===
  '馬': {
    character: '馬',
    sinoVietnamese: 'Mã',
    meaning: 'Con ngựa, phi nước đại',
    description: 'Hình con ngựa có bờm tung bay trong gió và bốn vó đang phi nước đại.',
    lessonId: '9',
    examples: [
      { char: '馬', meaning: 'Con ngựa', romaji: 'uma' },
      { char: '駅', meaning: 'Nhà ga (trạm đổi ngựa)', romaji: 'eki' }
    ]
  },
  '骨': {
    character: '骨',
    sinoVietnamese: 'Cốt',
    meaning: 'Khung xương, cốt cách cứng cỏi',
    description: 'Khung xương người nâng đỡ bắp thịt, biểu tượng của sự cứng rắn.',
    lessonId: '9',
    examples: [
      { char: '骨', meaning: 'Khung xương', romaji: 'hone' }
    ]
  },
  '高': {
    character: '高',
    sinoVietnamese: 'Cao',
    meaning: 'Cao ráo, đắt đỏ, tòa lầu cao',
    description: 'Tòa lâu đài nguy nga cao vút có nhiều tầng mái ngói.',
    lessonId: '9',
    examples: [
      { char: '高', meaning: 'Cao, đắt tiền', romaji: 'taka(i)' }
    ]
  },
  '鬼': {
    character: '鬼',
    sinoVietnamese: 'Quỷ',
    meaning: 'Ma quỷ, linh hồn biến ảo',
    description: 'Con quái vật đội sừng quỷ chân thoăn thoắt di chuyển trong đêm.',
    lessonId: '9',
    examples: [
      { char: '鬼', meaning: 'Con quỷ, yêu quái', romaji: 'oni' }
    ]
  },
  '魚': {
    character: '魚',
    sinoVietnamese: 'Ngư',
    meaning: 'Con cá bơi dưới nước, thủy sản',
    description: 'Hình con cá có đầu nhọn, thân vảy lấp lánh và vây đuôi uốn lượn dưới nước.',
    lessonId: '9',
    examples: [
      { char: '魚', meaning: 'Con cá', romaji: 'sakana' },
      { char: '鮮', meaning: 'Tươi sống (cá cừu)', romaji: 'aza(yaka)' }
    ]
  },
  '鳥': {
    character: '鳥',
    sinoVietnamese: 'Điểu',
    meaning: 'Con chim đuôi dài, cánh bay',
    description: 'Con chim có mỏ nhọn, mắt sáng và chiếc đuôi dài duyên dáng.',
    lessonId: '9',
    examples: [
      { char: '鳥', meaning: 'Con chim', romaji: 'tori' },
      { char: '鳴', meaning: 'Chim hót líu lo', romaji: 'na(ku)' }
    ]
  },
  '鹿': {
    character: '鹿',
    sinoVietnamese: 'Lộc',
    meaning: 'Con hươu nai trong rừng',
    description: 'Con hươu sao có cặp sừng phân nhánh tuyệt đẹp và đôi chân nhanh nhẹn.',
    lessonId: '9',
    examples: [
      { char: '鹿', meaning: 'Con hươu nai', romaji: 'shika' }
    ]
  },
  '麥': {
    character: '麥 (麦)',
    sinoVietnamese: 'Mạch',
    meaning: 'Cây lúa mì, đại mạch',
    description: 'Cây lúa mì có râu dài đung đưa trong gió mùa hè.',
    lessonId: '9',
    examples: [
      { char: '麦', meaning: 'Lúa mì', romaji: 'mugi' }
    ]
  },
  '麻': {
    character: '麻',
    sinoVietnamese: 'Ma',
    meaning: 'Cây gai dầu, cây lanh dệt vải',
    description: 'Cây gai dầu phơi dưới mái nhà sườn núi để tước sợi dệt vải bố.',
    lessonId: '9',
    examples: [
      { char: '麻', meaning: 'Vải lanh, cây gai', romaji: 'asa' }
    ]
  },
  '黃': {
    character: '黃 (黄)',
    sinoVietnamese: 'Hoàng',
    meaning: 'Màu vàng hoàng gia, ruộng đất phì nhiêu',
    description: 'Màu vàng của ruộng lúa chín rộ và đất màu mỡ mùa màng.',
    lessonId: '9',
    examples: [
      { char: '黄', meaning: 'Màu vàng', romaji: 'ki' }
    ]
  },
  '黑': {
    character: '黑 (黒)',
    sinoVietnamese: 'Hắc',
    meaning: 'Màu đen, bồ hóng bếp lửa',
    description: 'Bồ hóng than củi bám đen kịt quanh miệng lò lửa bốc cháy.',
    lessonId: '9',
    examples: [
      { char: '黒', meaning: 'Màu đen', romaji: 'kuro' }
    ]
  },
  '鼠': {
    character: '鼠',
    sinoVietnamese: 'Thử',
    meaning: 'Con chuột gặm nhấm',
    description: 'Con chuột nhỏ có ria mép, răng sắc nhọn và cái đuôi dài.',
    lessonId: '9',
    examples: [
      { char: '鼠', meaning: 'Con chuột', romaji: 'nezumi' }
    ]
  },
  '鼻': {
    character: '鼻',
    sinoVietnamese: 'Tị',
    meaning: 'Cái mũi con người, thở hít',
    description: 'Bộ Tự (mũi) kết hợp với cấu trúc hai lỗ mũi hít thở khí trời.',
    lessonId: '9',
    examples: [
      { char: '鼻', meaning: 'Cái mũi', romaji: 'hana' }
    ]
  },
  '齒': {
    character: '齒 (歯)',
    sinoVietnamese: 'Xỉ',
    meaning: 'Hàm răng, độ tuổi',
    description: 'Hàng răng đều tăm tắp trong khuôn miệng, biểu thị tuổi tác và độ nhai.',
    lessonId: '9',
    examples: [
      { char: '歯', meaning: 'Răng', romaji: 'ha' }
    ]
  },
  '龍': {
    character: '龍 (竜)',
    sinoVietnamese: 'Long',
    meaning: 'Con rồng thần thoại, uy quyền',
    description: 'Con rồng thần thoại uốn lượn mình trên chín tầng mây xanh.',
    lessonId: '9',
    examples: [
      { char: '竜', meaning: 'Con rồng', romaji: 'ryuu' }
    ]
  },
  '龜': {
    character: '龜 (亀)',
    sinoVietnamese: 'Quy',
    meaning: 'Con rùa biển, trường thọ',
    description: 'Con rùa có mai cứng cáp hoa văn lục giác, biểu tượng sống lâu trăm tuổi.',
    lessonId: '9',
    examples: [
      { char: '亀', meaning: 'Con rùa', romaji: 'kame' }
    ]
  }
};

export const KANJI_TO_RADICALS: Record<string, string[]> = {
  '私': ['木'],
  '人': ['人'],
  '先': ['人', '土'],
  '生': ['人'],
  '学': ['宀', '子'],
  '会': ['人', '口'],
  '社': ['示', '土'],
  '員': ['口', '貝'],
  '日': ['日'],
  '本': ['木'],
  '国': ['口', '日'],
  '辞': ['立', '刀'],
  '書': ['口'],
  '雑': ['木', '白'],
  '誌': ['言', '心'],
  '新': ['人'],
  '聞': ['門', '耳'],
  '鍵': ['金'],
  '時': ['日', '土'],
  '計': ['言'],
  '傘': ['人'],
  '車': ['車'],
  '机': ['木'],
  '語': ['言', '口'],
  '何': ['人', '口'],
  '室': ['宀'],
  '食': ['食'],
  '堂': ['土', '口'],
  '所': ['門'],
  '屋': ['土'],
  '議': ['言'],
  '駅': ['馬'],
  '電': ['雨', '田'],
  '分': ['刀'],
  '半': ['土'],
  '午': ['土'],
  '前': ['刀', '月'],
  '後': ['行'],
  '今': ['人'],
  '朝': ['日', '月'],
  '昼': ['日'],
  '夜': ['月'],
  '行': ['行'],
  '来': ['木'],
  '帰': ['刀', '宀'],
  '校': ['木'],
  '週': ['辶'],
  '去': ['土'],
  '年': ['土'],
  '乗': ['木'],
  '自': ['目'],
  '飲': ['食', '口'],
  '見': ['見'],
  '読': ['言', '貝'],
  '買': ['貝'],
  '物': ['手'],
  '切': ['刀'],
  '送': ['辶', '火'],
  '貸': ['貝'],
  '借': ['人', '日'],
  '教': ['子'],
  '習': ['白'],
  '手': ['手'],
  '紙': ['糸'],
  '字': ['宀', '子'],
  '文': ['人'],
  '大': ['人'],
  '小': ['小'],
  '高': ['口'],
  '安': ['宀', '女'],
  '多': ['月'],
  '少': ['小'],
  '近': ['辶'],
  '遠': ['辶'],
  '古': ['口', '土'],
  '好': ['女', '子'],
  '歌': ['口'],
  '音': ['日'],
  '楽': ['木', '白'],
  '料': ['木'],
  '理': ['里'],
  '特': ['土'],
  '別': ['口', '刀'],
  '有': ['月'],
  '名': ['口'],
  '男': ['人'],
  '女': ['人'],
  '子': ['人'],
  '犬': ['犬'],
  '猫': ['犬', '田'],
  '主': ['土'],
  '箱': ['竹', '木', '目'],
  '冷': ['人'],
  '蔵': ['土'],
  '父': ['父'],
  '母': ['母'],
  '兄': ['口', '人'],
  '姉': ['女'],
  '弟': ['弓'],
  '妹': ['女'],
  '家': ['宀'],
  '族': ['人'],
  '友': ['人'],
  '両': ['口'],
  '春': ['日', '木'],
  '夏': ['足'],
  '秋': ['火'],
  '冬': ['水'],
  '雨': ['雨'],
  '雪': ['雨'],
  '風': ['風'],
  '天': ['人'],
  '気': ['人'],
  '晴': ['日', '青'],
  '歩': ['小'],
  '走': ['走'],
  '旅': ['人'],
  '館': ['食'],
  '宿': ['宀', '人'],
  '市': ['口'],
  '町': ['田'],
  '村': ['木'],
  '場': ['土', '日'],
  '度': ['广'],
  '立': ['立'],
  '待': ['行', '土'],
  '話': ['言', '口'],
  '言': ['言'],
  '売': ['人'],
  '急': ['心'],
  '止': ['止'],
  '作': ['人'],
  '使': ['人'],
  '住': ['人'],
  '知': ['口'],
  '用': ['用'],
  '事': ['人'],
  '図': ['口'],
  '官': ['宀'],
  '服': ['月'],
  '着': ['目'],
  '明': ['日', '月'],
  '暗': ['日'],
  '広': ['广'],
  '狭': ['犬'],
  '長': ['人'],
  '短': ['目'],
  '重': ['里'],
  '軽': ['車'],
  '体': ['人', '木'],
  '頭': ['目'],
  '痛': ['疒'],
  '薬': ['木', '白'],
  '院': ['宀'],
  '病': ['疒', '火'],
  '目': ['目'],
  '耳': ['耳'],
  '足': ['足'],
  '医': ['刀'],
  '者': ['土', '日'],
  '動': ['里', '力'],
  '登': ['目'],
  '泊': ['水', '白'],
  '思': ['田', '心'],
  '考': ['土'],
  '意': ['日', '心'],
  '間': ['門', '日'],
  '迎': ['辶'],
  '留': ['田'],
  '診': ['言'],
  '探': ['手'],
  '聞こ': ['門', '耳'],
  '建': ['人'],
  '通': ['辶'],
  '偉': ['人'],
  '開': ['門'],
  '閉': ['門'],
  '飾': ['食'],
  '置': ['目'],
  '始': ['女'],
  '続': ['糸'],
  '功': ['力'],
  '敗': ['貝'],
  '逃': ['辶'],
  '守': ['宀'],
  '磨': ['广', '木'],
  '説': ['言'],
  '咲': ['口'],
  '回': ['口'],
  '浴': ['水'],
  '落': ['水'],
  '褒': ['衣'],
  '盗': ['皿'],
  '育': ['月'],
  '運': ['辶', '車'],
  '答': ['竹', '口'],
  '死': ['人'],
  '数': ['女'],
  '確': ['石'],
  '呼': ['口'],
  '与': ['人'],
  '利': ['刀'],
  '増': ['土'],
  '減': ['水'],
  '輸': ['車'],
  '過': ['辶'],
  '濃': ['水'],
  '遭': ['辶'],
  '信': ['人', '言'],
  '訪': ['言'],
  '味': ['口'],
  '席': ['广'],
  '欠': ['人'],
  '敬': ['人'],
  '召': ['刀', '口'],
  '参': ['人'],
  '申': ['田'],
  '水': ['水'],
  '店': ['广', '口'],
  '中': ['口'],
  '月': ['月'],
  '火': ['火'],
  '木': ['木'],
  '右': ['口'],
  '左': ['工'],
  '道': ['辶'],
  '山': ['山'],
  '川': ['川'],
  '田': ['田'],
  '円': ['囗'],
  '千': ['十'],
  '万': ['一'],
  '海': ['水', '女'],
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


// Lấy bài học theo ID
export function getLessonById(id: string): RadicalLesson | undefined {
  return RADICAL_LESSONS.find(l => l.id === id);
}

// Lấy danh sách bộ thủ thuộc bài học
export function getRadicalsForLesson(lessonId: string): RadicalInfo[] {
  const lesson = getLessonById(lessonId);
  if (!lesson) return [];
  return lesson.radicals
    .map(char => RADICALS_DICT[char])
    .filter(Boolean);
}
