export type FundamentalTopicId = 'numbers' | 'time' | 'particles' | 'conjugation' | 'kosoado' | 'conjunctions';

export interface KnowledgeUnit {
  id: string;
  lesson: number; // Lesson ID: 1 to 50
  topic: FundamentalTopicId;
  topicLabel: string;
  title: string;
  summary: string;
  badge?: string;
  hasSoundChange?: boolean;
  hasException?: boolean;
  kind:
    | 'number_table_0_99'
    | 'number_table_100_100m'
    | 'counter_single'
    | 'counter_group'
    | 'time_hours'
    | 'time_minutes'
    | 'time_days'
    | 'time_weekdays'
    | 'time_months'
    | 'time_relative'
    | 'particle_detail'
    | 'confusable_pair'
    | 'verb_groups'
    | 'verb_exceptions'
    | 'conjugation_form'
    | 'adj_conjugation'
    | 'kosoado_rows'
    | 'question_compounds'
    | 'conjunctions_group'
    | 'adverbs_group';
  refId: string;
}

export const KNOWLEDGE_UNITS: KnowledgeUnit[] = [
  // ===================== BÀI 1 =====================
  {
    id: 'l1_num_0_99',
    lesson: 1,
    topic: 'numbers',
    topicLabel: 'Số đếm',
    title: 'Số đếm cơ bản: 0 ➔ 99',
    summary: 'Cách đếm từ 0 đến 99, quy tắc số 4 (yon/shi), số 7 (nana/shichi), số 9 (kyuu/ku)',
    badge: 'Cơ bản',
    kind: 'number_table_0_99',
    refId: '0_99'
  },
  {
    id: 'l1_counter_sai',
    lesson: 1,
    topic: 'numbers',
    topicLabel: 'Đơn vị đếm',
    title: 'Đếm tuổi tác: 〜歳 (sai) & Ngoại lệ 20 tuổi (はたち)',
    summary: 'Biến âm 1 tuổi (いっさい), 8 tuổi (はっさい), 10 tuổi (じゅっさい) và 20 tuổi đặc biệt',
    badge: 'Biến âm',
    hasSoundChange: true,
    hasException: true,
    kind: 'counter_single',
    refId: 'sai'
  },
  {
    id: 'l1_particle_wa',
    lesson: 1,
    topic: 'particles',
    topicLabel: 'Trợ từ',
    title: 'Trợ từ は (Wa) — Chủ đề câu (Topic Marker)',
    summary: 'Đánh dấu chủ đề câu chuyện: Tôi là..., Bạn là...',
    badge: 'JLPT N5',
    kind: 'particle_detail',
    refId: 'wa'
  },
  {
    id: 'l1_particle_mo',
    lesson: 1,
    topic: 'particles',
    topicLabel: 'Trợ từ',
    title: 'Trợ từ も (Mo) — Cũng (Đồng nhất)',
    summary: 'Thay thế cho は/が biểu thị nghĩa "cũng là..."',
    badge: 'JLPT N5',
    kind: 'particle_detail',
    refId: 'mo'
  },
  {
    id: 'l1_particle_no_possession',
    lesson: 1,
    topic: 'particles',
    topicLabel: 'Trợ từ',
    title: 'Trợ từ の (No) — Sở hữu & Trực thuộc',
    summary: 'Nối hai danh từ: Sở hữu của ai, nhân viên của công ty nào',
    badge: 'JLPT N5',
    kind: 'particle_detail',
    refId: 'no'
  },

  // ===================== BÀI 2 =====================
  {
    id: 'l2_kosoado_kore',
    lesson: 2,
    topic: 'kosoado',
    topicLabel: 'Ko-so-a-do',
    title: 'Đại từ chỉ vật: これ / それ / あれ / どれ',
    summary: 'Cái này, cái đó, cái kia, cái nào (Đại từ độc lập làm chủ ngữ)',
    badge: 'Vật thể',
    kind: 'kosoado_rows',
    refId: 'kore_row'
  },
  {
    id: 'l2_kosoado_kono',
    lesson: 2,
    topic: 'kosoado',
    topicLabel: 'Ko-so-a-do',
    title: 'Bổ nghĩa danh từ: この / その / あの / どの + N',
    summary: 'Cái ... này, cái ... đó (Bắt buộc có danh từ đi liền phía sau)',
    badge: 'Định ngữ',
    kind: 'kosoado_rows',
    refId: 'kono_row'
  },

  // ===================== BÀI 3 =====================
  {
    id: 'l3_kosoado_koko',
    lesson: 3,
    topic: 'kosoado',
    topicLabel: 'Ko-so-a-do',
    title: 'Nơi chốn: ここ / そこ / あそこ / どこ',
    summary: 'Ở đây, ở đó, ở đằng kia, ở đâu',
    badge: 'Địa điểm',
    kind: 'kosoado_rows',
    refId: 'koko_row'
  },
  {
    id: 'l3_kosoado_kochira',
    lesson: 3,
    topic: 'kosoado',
    topicLabel: 'Ko-so-a-do',
    title: 'Phương hướng & Lịch sự: こちら / そちら / あちら / どちら',
    summary: 'Phía này, phía đó, hoặc đại từ lịch sự thay thế cho người/địa điểm',
    badge: 'Lịch sự',
    kind: 'kosoado_rows',
    refId: 'kochira_row'
  },
  {
    id: 'l3_num_100_100m',
    lesson: 3,
    topic: 'numbers',
    topicLabel: 'Số đếm',
    title: 'Bảng số 100 ➔ 100 Triệu & Biến âm hàng trăm / nghìn',
    summary: 'Biến âm 300 (sanbyaku), 600 (roppyaku), 800 (happyaku), 3000 (sanzen), 8000 (hassen), đơn vị Vạn (万) & Ức (億)',
    badge: 'Biến âm lớn',
    hasSoundChange: true,
    kind: 'number_table_100_100m',
    refId: '100_100m'
  },
  {
    id: 'l3_counter_floor',
    lesson: 3,
    topic: 'numbers',
    topicLabel: 'Đơn vị đếm',
    title: 'Đếm tầng nhà: 〜階 (kai / gai)',
    summary: 'Biến âm âm ngắt 1, 6, 8, 10 và đặc biệt tầng 3: さんがい (sangai)',
    badge: 'Biến âm',
    hasSoundChange: true,
    kind: 'counter_single',
    refId: 'kai_floor'
  },

  // ===================== BÀI 4 =====================
  {
    id: 'l4_time_hours',
    lesson: 4,
    topic: 'time',
    topicLabel: 'Thời gian',
    title: 'Bảng 12 Giờ: 〜時 (ji)',
    summary: 'Quy tắc 12 giờ, đặc biệt: 4 giờ (よじ - yoji), 9 giờ (くじ - kuji), 7 giờ (しちじ)',
    badge: 'Đặc biệt',
    hasException: true,
    kind: 'time_hours',
    refId: 'hours'
  },
  {
    id: 'l4_time_minutes',
    lesson: 4,
    topic: 'time',
    topicLabel: 'Thời gian',
    title: 'Bảng Phút biến âm: 〜分 (fun / pun)',
    summary: 'Quy tắc fun vs pun: 1, 3, 4, 6, 8, 10 là pun; 30 phút là 半 (han - rưỡi)',
    badge: 'Biến âm',
    hasSoundChange: true,
    kind: 'time_minutes',
    refId: 'minutes'
  },
  {
    id: 'l4_time_weekdays',
    lesson: 4,
    topic: 'time',
    topicLabel: 'Thời gian',
    title: 'Các thứ trong tuần: 曜日 (youbi)',
    summary: 'Thứ 2 (Nguyệt) đến Chủ Nhật (Nhật): げつ, か, すい, もく, きん, ど, にち',
    badge: 'Thứ tuần',
    kind: 'time_weekdays',
    refId: 'weekdays'
  },
  {
    id: 'l4_particle_kara_made',
    lesson: 4,
    topic: 'particles',
    topicLabel: 'Trợ từ',
    title: 'Cặp trợ từ から (Kara) & まで (Made) — Từ ... Đến ...',
    summary: 'Mốc bắt đầu và mốc kết thúc về mặt thời gian hoặc không gian',
    badge: 'Thời gian',
    kind: 'particle_detail',
    refId: 'kara'
  },
  {
    id: 'l4_particle_ni_time',
    lesson: 4,
    topic: 'particles',
    topicLabel: 'Trợ từ',
    title: 'Trợ từ に (Ni) — Thời điểm xác định có số',
    summary: 'Đi kèm các mốc thời gian có con số cụ thể (lúc 6h, vào ngày mồng 5...)',
    badge: 'Thời điểm',
    kind: 'particle_detail',
    refId: 'ni'
  },

  // ===================== BÀI 5 =====================
  {
    id: 'l5_time_days_month',
    lesson: 5,
    topic: 'time',
    topicLabel: 'Thời gian',
    title: 'Bảng Ngày trong tháng (1 ➔ 31) — Các ngày đặc biệt thuần Nhật',
    summary: 'Mồng 1 (ついたち) đến mồng 10 (とおか), ngày 14 (じゅうよっか), 20 (はつか), 24 (にじゅうよっか)',
    badge: 'Thuần Nhật',
    hasException: true,
    kind: 'time_days',
    refId: 'days_month'
  },
  {
    id: 'l5_time_months',
    lesson: 5,
    topic: 'time',
    topicLabel: 'Thời gian',
    title: 'Bảng 12 Tháng trong năm: 〜月 (gatsu)',
    summary: 'Chú ý bắt buộc: Tháng 4 (しがつ), Tháng 7 (しちがつ), Tháng 9 (くがつ)',
    badge: 'Đặc biệt',
    hasException: true,
    kind: 'time_months',
    refId: 'months'
  },
  {
    id: 'l5_time_relative',
    lesson: 5,
    topic: 'time',
    topicLabel: 'Thời gian',
    title: 'Ma trận mốc thời gian tương đối (Hôm qua ➔ Hôm nay ➔ Ngày mai)',
    summary: 'Hệ thống từ chỉ thời gian: Ngày, Tuần, Tháng, Năm (không đi kèm trợ từ に)',
    badge: 'Mốc thời gian',
    kind: 'time_relative',
    refId: 'relative'
  },
  {
    id: 'l5_particle_e',
    lesson: 5,
    topic: 'particles',
    topicLabel: 'Trợ từ',
    title: 'Trợ từ へ (E) — Phương hướng chuyển động',
    summary: 'Viết là He phát âm là E, chỉ hướng di chuyển về phía địa điểm',
    badge: 'Phương hướng',
    kind: 'particle_detail',
    refId: 'e'
  },
  {
    id: 'l5_particle_de_transport',
    lesson: 5,
    topic: 'particles',
    topicLabel: 'Trợ từ',
    title: 'Trợ từ で (De) — Phương tiện di chuyển & đi lại',
    summary: 'Đi bằng xe máy, tàu điện ngầm, xe buýt (Chú ý: đi bộ 歩いて không dùng で)',
    badge: 'Phương tiện',
    kind: 'particle_detail',
    refId: 'de'
  },
  {
    id: 'l5_particle_dokoemo',
    lesson: 5,
    topic: 'kosoado',
    topicLabel: 'Nghi vấn',
    title: 'Tổ hợp phủ định: どこへも + Phủ định (Chẳng đi đâu cả)',
    summary: 'Nghi vấn từ nơi chốn + へも + 行きません',
    badge: 'Phủ định',
    kind: 'question_compounds',
    refId: 'doko_compound'
  },

  // ===================== BÀI 6 =====================
  {
    id: 'l6_particle_o',
    lesson: 6,
    topic: 'particles',
    topicLabel: 'Trợ từ',
    title: 'Trợ từ を (O) — Bổ ngữ trực tiếp của Tha động từ',
    summary: 'Tác động lên sự vật: Ăn cơm, uống nước, đọc sách',
    badge: 'Tha động từ',
    kind: 'particle_detail',
    refId: 'o'
  },
  {
    id: 'l6_particle_de_action',
    lesson: 6,
    topic: 'particles',
    topicLabel: 'Trợ từ',
    title: 'Trợ từ で (De) — Địa điểm diễn ra hành động tích cực',
    summary: 'Học ở thư viện, ăn cơm ở nhà hàng (Khác với に tồn tại tĩnh)',
    badge: 'Hành động',
    kind: 'particle_detail',
    refId: 'de'
  },
  {
    id: 'l6_particle_nanimo',
    lesson: 6,
    topic: 'kosoado',
    topicLabel: 'Nghi vấn',
    title: 'Tổ hợp phủ định: なにも + Phủ định (Chẳng ăn/làm gì cả)',
    summary: 'Phủ định hoàn toàn: Sáng nay tôi chẳng ăn gì cả',
    badge: 'Phủ định',
    kind: 'question_compounds',
    refId: 'nani_compound'
  },

  // ===================== BÀI 7 =====================
  {
    id: 'l7_particle_de_tool',
    lesson: 7,
    topic: 'particles',
    topicLabel: 'Trợ từ',
    title: 'Trợ từ で (De) — Công cụ, Phương tiện & Ngôn ngữ',
    summary: 'Ăn bằng đũa, viết bằng bút chì, nói bằng tiếng Nhật',
    badge: 'Công cụ',
    kind: 'particle_detail',
    refId: 'de'
  },
  {
    id: 'l7_particle_ni_receiver',
    lesson: 7,
    topic: 'particles',
    topicLabel: 'Trợ từ',
    title: 'Trợ từ に (Ni) — Đối tượng tiếp nhận hành động (Cho / Nhận)',
    summary: 'Tặng quà cho bạn bè, gọi điện thoại cho giáo viên',
    badge: 'Cho / Nhận',
    kind: 'particle_detail',
    refId: 'ni'
  },

  // ===================== BÀI 8 =====================
  {
    id: 'l8_adj_present',
    lesson: 8,
    topic: 'conjugation',
    topicLabel: 'Tính từ',
    title: 'Biến đổi Tính từ đuôi い và đuôi な (Hiện tại khẳng định & phủ định)',
    summary: 'Tính từ đuôi い bỏ い + くない; Tính từ đuôi な + じゃありません',
    badge: 'Tính từ',
    kind: 'adj_conjugation',
    refId: 'present'
  },
  {
    id: 'l8_adv_degree',
    lesson: 8,
    topic: 'conjunctions',
    topicLabel: 'Phó từ',
    title: 'Phó từ mức độ: とても (Rất) & あまり + Phủ định (Không ... lắm)',
    summary: 'とても đi với khẳng định; あまり BẮT BUỘC đi với phủ định',
    badge: 'Mức độ',
    kind: 'adverbs_group',
    refId: 'degree'
  },
  {
    id: 'l8_conj_soshite',
    lesson: 8,
    topic: 'conjunctions',
    topicLabel: 'Liên từ',
    title: 'Liên từ nối câu: そして (Và, rồi thì)',
    summary: 'Nối hai câu độc lập chỉ tính chất cùng chiều hoặc chuỗi hành động',
    badge: 'Nối tiếp',
    kind: 'conjunctions_group',
    refId: 'soshite'
  },
  {
    id: 'l8_kosoado_donna',
    lesson: 8,
    topic: 'kosoado',
    topicLabel: 'Ko-so-a-do',
    title: 'Hàng tính chất: こんな / そんな / あんな / どんな + N',
    summary: 'Người như thế nào, thị trấn như thế nào',
    badge: 'Tính chất',
    kind: 'kosoado_rows',
    refId: 'donna_row'
  },

  // ===================== BÀI 9 =====================
  {
    id: 'l9_particle_ga_state',
    lesson: 9,
    topic: 'particles',
    topicLabel: 'Trợ từ',
    title: 'Trợ từ が (Ga) — Đối tượng của Sở thích, Năng lực & Sở hữu',
    summary: 'Đi với: 好き, 嫌い, 上手, 下手, ほしい, わかる, できる, あります, います',
    badge: 'Sở thích / Khả năng',
    kind: 'particle_detail',
    refId: 'ga'
  },
  {
    id: 'l9_adv_frequency',
    lesson: 9,
    topic: 'conjunctions',
    topicLabel: 'Phó từ',
    title: 'Thang đo tần suất & Mức độ: いつも ➔ よく ➔ ときどき ➔ ぜんぜん',
    summary: 'Tần suất từ 100% đến 0%. Lưu ý ぜんぜん bắt buộc đi với phủ định',
    badge: 'Tần suất',
    kind: 'adverbs_group',
    refId: 'frequency'
  },
  {
    id: 'l9_pair_o_vs_ga',
    lesson: 9,
    topic: 'particles',
    topicLabel: 'So sánh cặp',
    title: 'So sánh cặp: を vs が (Hành động trực tiếp vs Năng lực / Sở thích)',
    summary: '水を飲む (Uống nước) vs 水が飲みたい (Muốn uống) / 水が好き (Thích nước)',
    badge: 'Dễ nhầm',
    kind: 'confusable_pair',
    refId: 'o_vs_ga'
  },

  // ===================== BÀI 10 =====================
  {
    id: 'l10_particle_ni_exist',
    lesson: 10,
    topic: 'particles',
    topicLabel: 'Trợ từ',
    title: 'Trợ từ に (Ni) — Nơi tồn tại của sự vật & người (Có ở đâu)',
    summary: 'Đi với あります (đồ vật/cây cối) và います (người/động vật)',
    badge: 'Tồn tại',
    kind: 'particle_detail',
    refId: 'ni'
  },
  {
    id: 'l10_pair_ni_vs_de',
    lesson: 10,
    topic: 'particles',
    topicLabel: 'So sánh cặp',
    title: 'So sánh cặp kinh điển: に vs で chỉ nơi chốn',
    summary: 'に chỉ nơi TỒN TẠI tĩnh (ở yên đó); で chỉ nơi diễn ra HÀNH ĐỘNG tích cực',
    badge: 'Cốt lõi N5',
    kind: 'confusable_pair',
    refId: 'ni_vs_de'
  },
  {
    id: 'l10_particle_ya',
    lesson: 10,
    topic: 'particles',
    topicLabel: 'Trợ từ',
    title: 'Trợ từ や (Ya) — Liệt kê không đầy đủ (Và... vân vân)',
    summary: 'Khác với と (100%), や hàm ý ngoài A và B vẫn còn những thứ khác nữa',
    badge: 'Liệt kê',
    kind: 'particle_detail',
    refId: 'ya'
  },

  // ===================== BÀI 11 =====================
  {
    id: 'l11_counter_tsu',
    lesson: 11,
    topic: 'numbers',
    topicLabel: 'Đơn vị đếm',
    title: 'Đếm đồ vật chung thuần Nhật 1-10: ひとつ ➔ とお',
    summary: 'Cái, chiếc, quả chung; từ để hỏi là いくつ',
    badge: 'Thuần Nhật',
    hasSoundChange: true,
    kind: 'counter_single',
    refId: 'tsu'
  },
  {
    id: 'l11_counter_nin',
    lesson: 11,
    topic: 'numbers',
    topicLabel: 'Đơn vị đếm',
    title: 'Đếm người: 〜人 (nin)',
    summary: '1 người (ひとり), 2 người (ふたり) là thuần Nhật; 4 người là よにん (không n)',
    badge: 'Người',
    hasException: true,
    kind: 'counter_single',
    refId: 'nin'
  },
  {
    id: 'l11_counter_dai',
    lesson: 11,
    topic: 'numbers',
    topicLabel: 'Đơn vị đếm',
    title: 'Đếm máy móc, xe cộ: 〜台 (dai)',
    summary: 'Ô tô, xe máy, máy tính, ti vi (Hoàn toàn không có biến âm)',
    badge: 'Xe cộ',
    kind: 'counter_single',
    refId: 'dai'
  },
  {
    id: 'l11_counter_mai',
    lesson: 11,
    topic: 'numbers',
    topicLabel: 'Đơn vị đếm',
    title: 'Đếm vật mỏng phẳng: 〜枚 (mai)',
    summary: 'Giấy, vé tàu, ảnh, áo sơ mi (Hoàn toàn không có biến âm)',
    badge: 'Vật mỏng',
    kind: 'counter_single',
    refId: 'mai'
  },
  {
    id: 'l11_counter_extended',
    lesson: 11,
    topic: 'numbers',
    topicLabel: 'Đơn vị đếm',
    title: 'Bảng mở rộng các đơn vị đếm thông dụng: 本, 杯, 匹, 冊, 個, 回, 足, 軒, 着',
    summary: 'Biến âm chi tiết của các đơn vị đếm vật dài, động vật, sách vở, cốc ly...',
    badge: 'Mở rộng N5',
    hasSoundChange: true,
    kind: 'counter_group',
    refId: 'extended_counters'
  },
  {
    id: 'l11_particle_dake',
    lesson: 11,
    topic: 'particles',
    topicLabel: 'Trợ từ',
    title: 'Trợ từ だけ (Dake) — Chỉ (Giới hạn số lượng/phạm vi)',
    summary: 'Đi với cả khẳng định lẫn phủ định, diễn tả giới hạn trung tính',
    badge: 'Giới hạn',
    kind: 'particle_detail',
    refId: 'dake'
  },

  // ===================== BÀI 12 =====================
  {
    id: 'l12_adj_past',
    lesson: 12,
    topic: 'conjugation',
    topicLabel: 'Tính từ',
    title: 'Quá khứ tính từ & Ngoại lệ いい ➔ よかった',
    summary: 'Tính từ đuôi い bỏ い + かった; Tính từ いい chuyển thành よかった',
    badge: 'Ngoại lệ',
    hasException: true,
    kind: 'adj_conjugation',
    refId: 'past'
  },
  {
    id: 'l12_particle_yori',
    lesson: 12,
    topic: 'particles',
    topicLabel: 'Trợ từ',
    title: 'Trợ từ より (Yori) — So sánh hơn (Hơn so với...)',
    summary: 'A は B より Tính từ です (A thì hơn B)',
    badge: 'So sánh',
    kind: 'particle_detail',
    refId: 'yori'
  },

  // ===================== BÀI 13 =====================
  {
    id: 'l13_particle_ni_purpose',
    lesson: 13,
    topic: 'particles',
    topicLabel: 'Trợ từ',
    title: 'Trợ từ に (Ni) — Mục đích của hành động di chuyển',
    summary: 'Công thức: Địa điểm + へ + V(bỏ ます) / Danh từ + に + 行きます (Đi để làm gì)',
    badge: 'Mục đích',
    kind: 'particle_detail',
    refId: 'ni'
  },

  // ===================== BÀI 14 =====================
  {
    id: 'l14_verb_groups',
    lesson: 14,
    topic: 'conjugation',
    topicLabel: 'Chia động từ',
    title: 'Nhận diện 3 Nhóm Động Từ Tiếng Nhật',
    summary: 'Phân loại Nhóm 1 (Godan), Nhóm 2 (Ichidan), Nhóm 3 (Bất quy tắc する / くる)',
    badge: 'Nền tảng',
    kind: 'verb_groups',
    refId: 'groups'
  },
  {
    id: 'l14_verb_exceptions',
    lesson: 14,
    topic: 'conjugation',
    topicLabel: 'Chia động từ',
    title: 'Hộp cảnh báo: Động từ ngoại lệ Nhóm 1 đuôi iru / eru',
    summary: '帰る (về), 知る (biết), 切る (cắt), 入る (vào), 走る (chạy)... trông như Nhóm 2 nhưng chia Nhóm 1!',
    badge: 'Cực quan trọng',
    hasException: true,
    kind: 'verb_exceptions',
    refId: 'exceptions'
  },
  {
    id: 'l14_verb_form_te',
    lesson: 14,
    topic: 'conjugation',
    topicLabel: 'Chia động từ',
    title: 'Quy tắc chia Thể Te (て) — Nối câu & Nhờ vả',
    summary: 'Biến âm đuôi: いちり ➔ って, みびに ➔ んで, き ➔ いて, ぎ ➔ いで, し ➔ して',
    badge: 'Thể Te',
    hasSoundChange: true,
    kind: 'conjugation_form',
    refId: 'te'
  },

  // ===================== BÀI 17 =====================
  {
    id: 'l17_verb_form_nai',
    lesson: 17,
    topic: 'conjugation',
    topicLabel: 'Chia động từ',
    title: 'Quy tắc chia Thể Nai (ない) — Phủ định thông thường',
    summary: 'Nhóm 1 đổi cột U sang cột A + ない (Đặc biệt u ➔ wa: 買う ➔ 買わない)',
    badge: 'Thể Nai',
    kind: 'conjugation_form',
    refId: 'nai'
  },
  {
    id: 'l17_pair_made_vs_madeni',
    lesson: 17,
    topic: 'particles',
    topicLabel: 'So sánh cặp',
    title: 'So sánh cặp: まで vs までに (Liên tục vs Hạn chót hoàn tất)',
    summary: 'まで: Hành động kéo dài liên tục tới mốc đó; までに: Hạn chót phải làm xong trước mốc đó',
    badge: 'Bẫy thi cử',
    kind: 'confusable_pair',
    refId: 'made_vs_madeni'
  },

  // ===================== BÀI 18 =====================
  {
    id: 'l18_verb_form_jisho',
    lesson: 18,
    topic: 'conjugation',
    topicLabel: 'Chia động từ',
    title: 'Thể Từ Điển (辞書形 - Jisho-kei) — Nguyên mẫu',
    summary: 'Dạng gốc trong từ điển, dùng cho mẫu khả năng (〜ことができる) và trước khi (〜まえに)',
    badge: 'Từ điển',
    kind: 'conjugation_form',
    refId: 'masu'
  },

  // ===================== BÀI 19 =====================
  {
    id: 'l19_verb_form_ta',
    lesson: 19,
    topic: 'conjugation',
    topicLabel: 'Chia động từ',
    title: 'Quy tắc chia Thể Ta (た) — Quá khứ thông thường',
    summary: 'Cách chia giống hệt thể Te (chỉ thay te ➔ ta, de ➔ da), dùng cho mẫu kinh nghiệm (〜たことがある)',
    badge: 'Thể Ta',
    kind: 'conjugation_form',
    refId: 'ta'
  },

  // ===================== BÀI 22 =====================
  {
    id: 'l22_pair_wa_vs_ga',
    lesson: 22,
    topic: 'particles',
    topicLabel: 'So sánh cặp',
    title: 'So sánh cặp cốt lõi: は vs が trong câu phức & mệnh đề phụ',
    summary: 'は nhấn mạnh vị ngữ; が nhấn mạnh chủ ngữ và BẮT BUỘC làm chủ ngữ trong mệnh đề định ngữ',
    badge: 'Ngữ pháp sâu',
    kind: 'confusable_pair',
    refId: 'wa_vs_ga'
  },

  // ===================== BÀI 27 =====================
  {
    id: 'l27_verb_form_potential',
    lesson: 27,
    topic: 'conjugation',
    topicLabel: 'Chia động từ',
    title: 'Quy tắc chia Thể Khả Năng (可能形 - Potential Form)',
    summary: 'Nhóm 1 đổi U sang E + る; Nhóm 2 bỏ る + られる; Nhóm 3: する ➔ できる, くる ➔ こられる',
    badge: 'N4 Khả năng',
    kind: 'conjugation_form',
    refId: 'potential'
  },
  {
    id: 'l27_particle_shika',
    lesson: 27,
    topic: 'particles',
    topicLabel: 'Trợ từ',
    title: 'Trợ từ しか (Shika) — Chỉ (Luôn luôn đi với Phủ định)',
    summary: 'Bắt buộc đi với động từ phủ định (〜ません), mang sắc thái tiếc nuối và ít ỏi',
    badge: 'N4 Trợ từ',
    kind: 'particle_detail',
    refId: 'shika'
  },

  // ===================== BÀI 28 =====================
  {
    id: 'l28_conj_soreni_sorede',
    lesson: 28,
    topic: 'conjunctions',
    topicLabel: 'Liên từ',
    title: 'Liên từ nâng cao: それに (Hơn nữa) & それで (Vì thế mà)',
    summary: 'Bổ sung thông tin cùng chiều và giải thích hệ quả tự nhiên',
    badge: 'Liên từ',
    kind: 'conjunctions_group',
    refId: 'soreni_sorede'
  },

  // ===================== BÀI 31 =====================
  {
    id: 'l31_verb_form_volitional',
    lesson: 31,
    topic: 'conjugation',
    topicLabel: 'Chia động từ',
    title: 'Quy tắc chia Thể Ý Chí (意向形 - Volitional Form)',
    summary: 'Rủ rê thân mật hoặc biểu thị dự định: Nhóm 1 đổi U sang O + う; Nhóm 2 bỏ る + よう',
    badge: 'N4 Ý chí',
    kind: 'conjugation_form',
    refId: 'volitional'
  },

  // ===================== BÀI 32 =====================
  {
    id: 'l32_adv_conjecture',
    lesson: 32,
    topic: 'conjunctions',
    topicLabel: 'Phó từ',
    title: 'Phó từ phỏng đoán: たぶん, きっと, もしかしたら',
    summary: 'Các mức độ phỏng đoán: きっと (chắc chắn), たぶん (có lẽ), もしかしたら (biết đâu chừng)',
    badge: 'Phỏng đoán',
    kind: 'adverbs_group',
    refId: 'conjecture'
  },

  // ===================== BÀI 35 =====================
  {
    id: 'l35_verb_form_ba',
    lesson: 35,
    topic: 'conjugation',
    topicLabel: 'Chia động từ',
    title: 'Quy tắc chia Thể Điều Kiện (ば形 - Conditional Form)',
    summary: 'Nếu... thì: Nhóm 1 đổi U sang E + ば; Nhóm 2 bỏ る + れば; する ➔ すれば',
    badge: 'N4 Điều kiện',
    kind: 'conjugation_form',
    refId: 'ba'
  },

  // ===================== BÀI 37 =====================
  {
    id: 'l37_verb_form_passive',
    lesson: 37,
    topic: 'conjugation',
    topicLabel: 'Chia động từ',
    title: 'Quy tắc chia Thể Bị Động (受身形 - Passive Form)',
    summary: 'Bị / Được: Nhóm 1 đổi U sang A + れる; Nhóm 2 bỏ る + られる; する ➔ される',
    badge: 'N4 Bị động',
    kind: 'conjugation_form',
    refId: 'passive'
  },

  // ===================== BÀI 39 =====================
  {
    id: 'l39_pair_kara_vs_node',
    lesson: 39,
    topic: 'particles',
    topicLabel: 'So sánh cặp',
    title: 'So sánh cặp: から vs ので chỉ nguyên nhân lý do',
    summary: 'から mang tính chủ quan cá nhân/mệnh lệnh; ので mang tính khách quan, lịch sự, nhã nhặn',
    badge: 'Lý do',
    kind: 'confusable_pair',
    refId: 'kara_vs_node'
  },

  // ===================== BÀI 48 =====================
  {
    id: 'l48_verb_form_causative',
    lesson: 48,
    topic: 'conjugation',
    topicLabel: 'Chia động từ',
    title: 'Quy tắc chia Thể Sai Khiến (使役形 - Causative Form)',
    summary: 'Bắt / Cho phép: Nhóm 1 đổi U sang A + せる; Nhóm 2 bỏ る + させる; する ➔ させる',
    badge: 'N4 Sai khiến',
    kind: 'conjugation_form',
    refId: 'causative'
  }
];

// Helper: Get all unique lesson numbers that have knowledge units
export const AVAILABLE_FUNDAMENTAL_LESSONS = Array.from(
  new Set(KNOWLEDGE_UNITS.map(u => u.lesson))
).sort((a, b) => a - b);
