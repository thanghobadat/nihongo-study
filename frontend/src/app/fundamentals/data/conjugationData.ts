export interface VerbGroupRule {
  group: string;
  name: string;
  identification: string;
  description: string;
  examples: {
    dictionary: string;
    kanji: string;
    reading: string;
    meaning: string;
  }[];
}

export interface VerbConjugationForm {
  formId: string;
  formName: string;
  description: string;
  group1Rule: string;
  group2Rule: string;
  group3Rule: string;
  exampleGroup1: { jisho: string; conjugated: string; meaning: string };
  exampleGroup2: { jisho: string; conjugated: string; meaning: string };
  exampleGroup3: { jisho: string; conjugated: string; meaning: string };
}

export const VERB_GROUPS: VerbGroupRule[] = [
  {
    group: 'group1',
    name: 'Nhóm 1 (Động từ Ngũ đoạn - Godan)',
    identification: 'Tận cùng bằng các âm thuộc cột U (u, ku, su, tsu, nu, bu, mu, ru) TRỪ các từ thuộc Nhóm 2.',
    description: 'Chiếm đa số động từ tiếng Nhật. Khi chia, âm đuôi sẽ biến đổi qua lại giữa 5 cột: A, I, U, E, O.',
    examples: [
      { dictionary: 'kaku', kanji: '書く', reading: 'かく', meaning: 'Viết' },
      { dictionary: 'nomu', kanji: '飲む', reading: 'のむ', meaning: 'Uống' },
      { dictionary: 'hanasu', kanji: '話す', reading: 'はなす', meaning: 'Nói chuyện' },
      { dictionary: 'matsu', kanji: '待つ', reading: 'まつ', meaning: 'Chờ đợi' },
      { dictionary: 'kau', kanji: '買う', reading: 'かう', meaning: 'Mua' },
      { dictionary: 'toru', kanji: '取る', reading: 'とる', meaning: 'Lấy, chụp' }
    ]
  },
  {
    group: 'group2',
    name: 'Nhóm 2 (Động từ Nhất đoạn - Ichidan)',
    identification: 'Tận cùng bằng る (ru) và đứng ngay trước る là âm thuộc cột I (i-ru) hoặc cột E (e-ru).',
    description: 'Cách chia cực kỳ đơn giản: Chỉ việc BỎ る rồi ghép trực tiếp đuôi mới vào.',
    examples: [
      { dictionary: 'taberu', kanji: '食べる', reading: 'たべる', meaning: 'Ăn (Cột E)' },
      { dictionary: 'miru', kanji: '見る', reading: 'みる', meaning: 'Xem, nhìn (Cột I)' },
      { dictionary: 'neru', kanji: '寝る', reading: 'ねる', meaning: 'Ngủ (Cột E)' },
      { dictionary: 'okiru', kanji: '起きる', reading: 'おきる', meaning: 'Thức dậy (Cột I)' },
      { dictionary: 'oshieru', kanji: '教える', reading: 'おしえる', meaning: 'Dạy học (Cột E)' }
    ]
  },
  {
    group: 'group3',
    name: 'Nhóm 3 (Động từ Bất quy tắc)',
    identification: 'Chỉ gồm duy nhất 2 động từ cơ bản: する (làm) và 来る (đến - kuru).',
    description: 'Cùng các danh động từ ghép dạng Noun + する (như 勉強する, 散歩する). Cách chia riêng biệt cần học thuộc lòng.',
    examples: [
      { dictionary: 'suru', kanji: 'する', reading: 'する', meaning: 'Làm' },
      { dictionary: 'kuru', kanji: '来る', reading: 'くる', meaning: 'Đến' },
      { dictionary: 'benkyou suru', kanji: '勉強する', reading: 'べんきょうする', meaning: 'Học bài' },
      { dictionary: 'kekkon suru', kanji: '結婚する', reading: 'けっこんする', meaning: 'Kết hôn' }
    ]
  }
];

export const GROUP1_EXCEPTIONS = [
  { kanji: '帰る', reading: 'かえる', romaji: 'kaeru', meaning: 'Trở về', whySpecial: 'Tận cùng là eru nhưng chia theo Nhóm 1 (かえります, かえって)' },
  { kanji: '知る', reading: 'しる', romaji: 'shiru', meaning: 'Biết', whySpecial: 'Tận cùng là iru nhưng chia theo Nhóm 1 (しります, しって)' },
  { kanji: '切る', reading: 'きる', romaji: 'kiru', meaning: 'Cắt', whySpecial: 'Tận cùng là iru nhưng chia theo Nhóm 1 (きります, きって)' },
  { kanji: '入る', reading: 'はいる', romaji: 'hairu', meaning: 'Đi vào', whySpecial: 'Tận cùng là iru nhưng chia theo Nhóm 1 (はいります, はいって)' },
  { kanji: '走る', reading: 'はしる', romaji: 'hashiru', meaning: 'Chạy', whySpecial: 'Tận cùng là iru nhưng chia theo Nhóm 1 (はしります, はしって)' },
  { kanji: 'しゃべる', reading: 'しゃべる', romaji: 'shaberu', meaning: 'Nói chuyện, tán gẫu', whySpecial: 'Tận cùng là eru nhưng chia theo Nhóm 1 (しゃべります, しゃべって)' },
  { kanji: '要る', reading: 'いる', romaji: 'iru', meaning: 'Cần', whySpecial: 'Tận cùng là iru nhưng chia theo Nhóm 1 (いります, いって)' },
  { kanji: '減る', reading: 'へる', romaji: 'heru', meaning: 'Giảm bớt', whySpecial: 'Tận cùng là eru nhưng chia theo Nhóm 1 (へります, へって)' },
];

export const CONJUGATION_FORMS: VerbConjugationForm[] = [
  {
    formId: 'masu',
    formName: 'Thể Masu (Thể Lịch Sự - ます)',
    description: 'Dùng trong giao tiếp xã hội hàng ngày, thể hiện sự tôn trọng và lịch thiệp.',
    group1Rule: 'Đổi âm đuôi cột U ➔ cột I + ます (u➔i, ku➔ki, su➔shi, mu➔mi...)',
    group2Rule: 'Bỏ る + ます',
    group3Rule: 'する ➔ します / 来る（くる） ➔ 来ます（きます）',
    exampleGroup1: { jisho: '書く (kaku)', conjugated: '書きます (kakimasu)', meaning: 'Viết' },
    exampleGroup2: { jisho: '食べる (taberu)', conjugated: '食べます (tabemasu)', meaning: 'Ăn' },
    exampleGroup3: { jisho: 'する (suru)', conjugated: 'します (shimasu)', meaning: 'Làm' }
  },
  {
    formId: 'te',
    formName: 'Thể Te (Nối câu / Nhờ vả - て)',
    description: 'Dùng để nối các hành động liên tiếp, nhờ vả lịch sự (てください), xin phép (てもいいです)...',
    group1Rule: '• い・ち・り ➔ って | • み・び・に ➔ んで | • き ➔ いて (ngoại lệ: 行く➔行って) | • ぎ ➔ いで | • し ➔ して',
    group2Rule: 'Bỏ る + て',
    group3Rule: 'する ➔ して / 来る ➔ 来て（きて）',
    exampleGroup1: { jisho: '待つ (matsu)', conjugated: '待って (matte)', meaning: 'Chờ' },
    exampleGroup2: { jisho: '食べる (taberu)', conjugated: '食べて (tabete)', meaning: 'Ăn' },
    exampleGroup3: { jisho: '来る (kuru)', conjugated: '来て (kite)', meaning: 'Đến' }
  },
  {
    formId: 'ta',
    formName: 'Thể Ta (Quá khứ thông thường - た)',
    description: 'Dùng trong đàm thoại thân mật chỉ hành động quá khứ, cấu trúc kinh nghiệm (たことがある)...',
    group1Rule: 'Chia giống hệt thể Te, chỉ cần đổi [te ➔ ta] và [de ➔ da]',
    group2Rule: 'Bỏ る + た',
    group3Rule: 'する ➔ した / 来る ➔ 来た（きた）',
    exampleGroup1: { jisho: '飲む (nomu)', conjugated: '飲んだ (nonda)', meaning: 'Đã uống' },
    exampleGroup2: { jisho: '見る (miru)', conjugated: '見た (mita)', meaning: 'Đã xem' },
    exampleGroup3: { jisho: 'する (suru)', conjugated: 'した (shita)', meaning: 'Đã làm' }
  },
  {
    formId: 'nai',
    formName: 'Thể Nai (Phủ định thông thường - ない)',
    description: 'Dùng trong đàm thoại thân mật chỉ việc không làm gì, khuyên nhủ (ないでください), bắt buộc (なければならない)...',
    group1Rule: 'Đổi âm đuôi cột U ➔ cột A + ない (Đặc biệt: u ➔ wa, ku ➔ ka, su ➔ sa...)',
    group2Rule: 'Bỏ る + ない',
    group3Rule: 'する ➔ しない / 来る ➔ 来ない（こない） / [Đặc biệt: ある ➔ ない]',
    exampleGroup1: { jisho: '買う (kau)', conjugated: '買わない (kawanai)', meaning: 'Không mua' },
    exampleGroup2: { jisho: '教える (oshieru)', conjugated: '教えない (oshienai)', meaning: 'Không dạy' },
    exampleGroup3: { jisho: '来る (kuru)', conjugated: '来ない (konai)', meaning: 'Không đến' }
  },
  {
    formId: 'potential',
    formName: 'Thể Khả Năng (Có thể làm - 可能形)',
    description: 'Diễn tả năng lực có thể làm một việc gì đó hoặc điều kiện cho phép thực hiện.',
    group1Rule: 'Đổi âm đuôi cột U ➔ cột E + る (u➔e, ku➔keru, su➔seru, mu➔meru...)',
    group2Rule: 'Bỏ る + られる (Văn nói thường giản lược: れる)',
    group3Rule: 'する ➔ できる / 来る ➔ 来られる（こられる）',
    exampleGroup1: { jisho: '話す (hanasu)', conjugated: '話せる (hanaseru)', meaning: 'Có thể nói' },
    exampleGroup2: { jisho: '食べる (taberu)', conjugated: '食べられる (taberareru)', meaning: 'Có thể ăn' },
    exampleGroup3: { jisho: 'する (suru)', conjugated: 'できる (dekiru)', meaning: 'Có thể làm' }
  },
  {
    formId: 'volitional',
    formName: 'Thể Ý Chí (Rủ rê / Dự định - 意向形)',
    description: 'Dùng để rủ rê thân mật (Cùng làm nào!) hoặc biểu thị dự định (ようと思っています).',
    group1Rule: 'Đổi âm đuôi cột U ➔ cột O + う (ku➔kou, su➔sou, mu➔mou...)',
    group2Rule: 'Bỏ る + よう',
    group3Rule: 'する ➔ しよう / 来る ➔ 来よう（こよう）',
    exampleGroup1: { jisho: '行く (iku)', conjugated: '行こう (ikou)', meaning: 'Đi thôi!' },
    exampleGroup2: { jisho: '寝る (neru)', conjugated: '寝よう (neyou)', meaning: 'Ngủ thôi!' },
    exampleGroup3: { jisho: 'する (suru)', conjugated: 'しよう (shiyou)', meaning: 'Làm thôi!' }
  },
  {
    formId: 'ba',
    formName: 'Thể Điều Kiện (Nếu thì - ば形)',
    description: 'Diễn tả điều kiện giả định "Nếu ... thì sẽ ...".',
    group1Rule: 'Đổi âm đuôi cột U ➔ cột E + ば (ku➔keba, su➔seba, ru➔reba...)',
    group2Rule: 'Bỏ る + れば',
    group3Rule: 'する ➔ すれば / 来る ➔ 来れば（くれば）',
    exampleGroup1: { jisho: '読む (yomu)', conjugated: '読めば (yomeba)', meaning: 'Nếu đọc' },
    exampleGroup2: { jisho: '起きる (okiru)', conjugated: '起きれば (okireba)', meaning: 'Nếu dậy' },
    exampleGroup3: { jisho: 'する (suru)', conjugated: 'すれば (sureba)', meaning: 'Nếu làm' }
  },
  {
    formId: 'passive',
    formName: 'Thể Bị Động (Bị / Được - 受身形)',
    description: 'Diễn tả hành động bị tác động (bị mắng, bị giẫm chân) hoặc được công nhận.',
    group1Rule: 'Đổi âm đuôi cột U ➔ cột A + れる (ku➔kareru, su➔sareru, mu➔mareru...)',
    group2Rule: 'Bỏ る + られる',
    group3Rule: 'する ➔ される / 来る ➔ 来られる（こられる）',
    exampleGroup1: { jisho: '叱る (shikaru)', conjugated: '叱られる (shikarareru)', meaning: 'Bị mắng' },
    exampleGroup2: { jisho: '褒める (homeru)', conjugated: '褒められる (homerareru)', meaning: 'Được khen' },
    exampleGroup3: { jisho: 'する (suru)', conjugated: 'される (sareru)', meaning: 'Bị/Được làm' }
  },
  {
    formId: 'causative',
    formName: 'Thể Sai Khiến (Bắt / Cho phép làm - 使役形)',
    description: 'Diễn tả việc cấp trên/cha mẹ bắt hoặc cho phép người dưới làm việc gì.',
    group1Rule: 'Đổi âm đuôi cột U ➔ cột A + せる (ku➔kaseru, su➔saseru, mu➔maseru...)',
    group2Rule: 'Bỏ る + させる',
    group3Rule: 'する ➔ させる / 来る ➔ 来させる（こさせる）',
    exampleGroup1: { jisho: '書く (kaku)', conjugated: '書かせる (kakaseru)', meaning: 'Bắt viết' },
    exampleGroup2: { jisho: '食べる (taberu)', conjugated: '食べさせる (tabesaseru)', meaning: 'Bắt/Cho ăn' },
    exampleGroup3: { jisho: '来る (kuru)', conjugated: '来させる (kosaseru)', meaning: 'Bắt đến' }
  }
];

export const ADJECTIVE_CONJUGATION = {
  iAdj: {
    name: 'Tính từ đuôi い (i-Adjective)',
    rule: 'Mọi biến đổi đều tác động trực tiếp vào chữ い cuối cùng.',
    forms: [
      { form: 'Hiện tại khẳng định', rule: 'Giữ nguyên い (+ です)', example: '高い (takai) ➔ Đắt, cao' },
      { form: 'Hiện tại phủ định', rule: 'Bỏ い ➔ くない (kunai)', example: '高くない (takakunai) ➔ Không đắt' },
      { form: 'Quá khứ khẳng định', rule: 'Bỏ い ➔ かった (katta)', example: '高かった (takakatta) ➔ Đã đắt' },
      { form: 'Quá khứ phủ định', rule: 'Bỏ い ➔ くなかった (kunakatta)', example: '高くなかった (takakunakatta) ➔ Đã không đắt' },
      { form: 'Nối câu (Thể Te)', rule: 'Bỏ い ➔ くて (kute)', example: '高くて、買えません ➔ Đắt quá nên không mua được' }
    ],
    specialNote: 'Ngoại lệ duy nhất cực kỳ quan trọng: いい (Tốt) ➔ chuyển thành gốc よい trước khi chia: よくない (Không tốt), よかった (Đã tốt), よくなかった (Đã không tốt), よくて (Tốt và...).'
  },
  naAdj: {
    name: 'Tính từ đuôi な (na-Adjective)',
    rule: 'Khi làm vị ngữ đứng cuối câu thì bỏ な và chia tương tự như Danh từ.',
    forms: [
      { form: 'Hiện tại khẳng định', rule: 'Bỏ な + です / だ', example: '静かです (shizuka desu) ➔ Yên tĩnh' },
      { form: 'Hiện tại phủ định', rule: 'Bỏ な + じゃありません / ではない', example: '静かじゃありません ➔ Không yên tĩnh' },
      { form: 'Quá khứ khẳng định', rule: 'Bỏ な + でした / だった', example: '静かでした ➔ Đã yên tĩnh' },
      { form: 'Quá khứ phủ định', rule: 'Bỏ な + じゃありませんでした', example: '静かじゃありませんでした ➔ Đã không yên tĩnh' },
      { form: 'Nối câu (Thể Te)', rule: 'Bỏ な + で', example: '静かで、きれいです ➔ Yên tĩnh và sạch đẹp' }
    ]
  }
};
