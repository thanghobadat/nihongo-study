export interface ConjunctionItem {
  word: string;
  romaji: string;
  category: string;
  meaning: string;
  usageNote: string;
  exampleJp: string;
  exampleVn: string;
}

export interface AdverbItem {
  word: string;
  romaji: string;
  category: 'frequency' | 'degree' | 'conjecture';
  meaning: string;
  levelPercent?: number; // 0-100% for frequency
  patternRequired?: string; // e.g. "Đi với thể Phủ định"
  exampleJp: string;
  exampleVn: string;
}

export const CONJUNCTIONS_LIST: ConjunctionItem[] = [
  {
    word: 'そして',
    romaji: 'soshite',
    category: 'Nối tiếp / Bổ sung',
    meaning: 'Và, rồi thì',
    usageNote: 'Dùng để nối hai câu độc lập chỉ chuỗi hành động hoặc tính chất cùng hướng.',
    exampleJp: '彼は 親切です。そして、ハンサムです。',
    exampleVn: 'Anh ấy tốt bụng. Và lại còn đẹp trai nữa.'
  },
  {
    word: 'それから',
    romaji: 'sorekara',
    category: 'Trình tự thời gian',
    meaning: 'Sau đó, tiếp theo là',
    usageNote: 'Diễn tả hành động tiếp theo theo trình tự thời gian.',
    exampleJp: '晩ごはんを 食べました。それから、テレビを 見ました。',
    exampleVn: 'Tôi đã ăn tối. Sau đó, tôi xem tivi.'
  },
  {
    word: 'それに',
    romaji: 'soreni',
    category: 'Nối tiếp / Thêm vào',
    meaning: 'Hơn nữa, vả lại',
    usageNote: 'Bổ sung thêm một lý do hoặc ưu điểm/nhược điểm cùng chiều.',
    exampleJp: 'この店は 安いです。それに、おいしいです。',
    exampleVn: 'Quán này rẻ. Hơn nữa, đồ ăn lại rất ngon.'
  },
  {
    word: 'しかし',
    romaji: 'shikashi',
    category: 'Tương phản / Nghịch đối',
    meaning: 'Tuy nhiên, nhưng mà',
    usageNote: 'Văn phong trang trọng, đứng ở đầu câu chuyển ý ngược lại hoàn toàn.',
    exampleJp: '一生懸命 勉強しました。しかし、合格できませんでした。',
    exampleVn: 'Tôi đã học hành chăm chỉ. Tuy nhiên, tôi vẫn không đỗ.'
  },
  {
    word: 'でも',
    romaji: 'demo',
    category: 'Tương phản / Nghịch đối',
    meaning: 'Nhưng (Khẩu ngữ)',
    usageNote: 'Phổ biến trong đàm thoại hàng ngày, đứng đầu câu.',
    exampleJp: '日本料理は おいしいです。でも、高いです。',
    exampleVn: 'Món ăn Nhật rất ngon. Nhưng mà đắt.'
  },
  {
    word: 'だから',
    romaji: 'dakara',
    category: 'Nguyên nhân / Hệ quả',
    meaning: 'Vì vậy, cho nên (Khẩu ngữ)',
    usageNote: 'Nêu kết quả của lý do ở câu trước. Văn trang trọng dùng: ですから / そのため.',
    exampleJp: '雨が 降っています。だから、傘を 持って行きます。',
    exampleVn: 'Trời đang mưa. Cho nên tôi mang theo ô.'
  },
  {
    word: 'それで',
    romaji: 'sorede',
    category: 'Nguyên nhân / Hệ quả',
    meaning: 'Thế là, vì thế mà',
    usageNote: 'Diễn tả hệ quả tự nhiên hoặc dùng để hỏi tiếp chuyện đối phương ("Thế rồi sao nữa?").',
    exampleJp: '寝坊しました。それで、遅刻しました。',
    exampleVn: 'Tôi ngủ quên. Thế là tôi đã bị muộn giờ.'
  },
  {
    word: 'ところで',
    romaji: 'tokorode',
    category: 'Chuyển chủ đề',
    meaning: 'Nhân tiện, tiện đây thì...',
    usageNote: 'Dùng để cắt câu chuyện cũ và bất ngờ chuyển sang một đề tài hoàn toàn mới.',
    exampleJp: 'もうすぐ 試験ですね。ところで、昨日の 試合 見ましたか。',
    exampleVn: 'Sắp thi rồi nhỉ. Nhân tiện thì, bạn đã xem trận đấu hôm qua chưa?'
  },
  {
    word: 'それとも',
    romaji: 'soretomo',
    category: 'Lựa chọn',
    meaning: 'Hay là, hoặc là',
    usageNote: 'Đứng giữa hai câu hỏi nghi vấn để đối phương lựa chọn A hay B.',
    exampleJp: 'コーヒーに しますか。それとも、紅茶に しますか。',
    exampleVn: 'Bạn muốn dùng cà phê? Hay là dùng hồng trà?'
  }
];

export const ADVERBS_LIST: AdverbItem[] = [
  // Frequency
  {
    word: 'いつも',
    romaji: 'itsumo',
    category: 'frequency',
    meaning: 'Luôn luôn, lúc nào cũng',
    levelPercent: 100,
    exampleJp: '毎朝 いつも ６時に 起きます。',
    exampleVn: 'Mỗi sáng tôi luôn luôn dậy lúc 6 giờ.'
  },
  {
    word: 'たいてい',
    romaji: 'taitei',
    category: 'frequency',
    meaning: 'Thông thường, hầu như',
    levelPercent: 80,
    exampleJp: '休みの日は たいてい 家に います。',
    exampleVn: 'Ngày nghỉ tôi hầu như ở nhà.'
  },
  {
    word: 'よく',
    romaji: 'yoku',
    category: 'frequency',
    meaning: 'Thường xuyên / Rất rõ',
    levelPercent: 70,
    exampleJp: 'よく この レストランに 来ます。',
    exampleVn: 'Tôi thường xuyên đến nhà hàng này.'
  },
  {
    word: 'ときどき',
    romaji: 'tokidoki',
    category: 'frequency',
    meaning: 'Thỉnh thoảng, đôi khi',
    levelPercent: 50,
    exampleJp: 'ときどき 映画館へ 行きます。',
    exampleVn: 'Thỉnh thoảng tôi có đến rạp chiếu phim.'
  },
  {
    word: 'あまり',
    romaji: 'amari',
    category: 'frequency',
    meaning: 'Không ... lắm',
    levelPercent: 20,
    patternRequired: 'BẮT BUỘC đi với Thể Phủ Định (〜ません / 〜ない)',
    exampleJp: 'お酒は あまり 飲みません。',
    exampleVn: 'Tôi không uống rượu bia nhiều lắm.'
  },
  {
    word: 'ぜんぜん',
    romaji: 'zenzen',
    category: 'frequency',
    meaning: 'Hoàn toàn không ...',
    levelPercent: 0,
    patternRequired: 'BẮT BUỘC đi với Thể Phủ Định (〜ません / 〜ない)',
    exampleJp: '英語が ぜんぜん わかりません。',
    exampleVn: 'Tôi hoàn toàn không hiểu tiếng Anh.'
  },
  // Degree
  {
    word: 'とても',
    romaji: 'totemo',
    category: 'degree',
    meaning: 'Rất, cực kỳ',
    exampleJp: '富士山は とても きれいです。',
    exampleVn: 'Núi Phú Sĩ rất đẹp.'
  },
  {
    word: 'すこし / ちょっと',
    romaji: 'sukoshi / chotto',
    category: 'degree',
    meaning: 'Một chút, hơi...',
    exampleJp: '日本語が すこし 話せます。',
    exampleVn: 'Tôi có thể nói được một chút tiếng Nhật.'
  },
  {
    word: 'ちょうど',
    romaji: 'choudo',
    category: 'degree',
    meaning: 'Vừa đúng, vừa vặn',
    exampleJp: 'いま ちょうど ３時です。',
    exampleVn: 'Bây giờ vừa vặn đúng 3 giờ.'
  },
  {
    word: 'もっと',
    romaji: 'motto',
    category: 'degree',
    meaning: 'Hơn nữa, thêm nữa',
    exampleJp: 'もっと ゆっくり 話してください。',
    exampleVn: 'Xin hãy nói chậm hơn một chút nữa ạ.'
  },
  // Conjecture
  {
    word: 'きっと',
    romaji: 'kitto',
    category: 'conjecture',
    meaning: 'Chắc chắn sẽ... (Tin tưởng cao)',
    exampleJp: 'あしたは きっと 晴れるでしょう。',
    exampleVn: 'Ngày mai chắc chắn trời sẽ nắng ráo.'
  },
  {
    word: 'たぶん',
    romaji: 'tabun',
    category: 'conjecture',
    meaning: 'Có lẽ, có thể... (~70-80%)',
    exampleJp: '彼は たぶん 来ないでしょう。',
    exampleVn: 'Có lẽ anh ấy sẽ không đến đâu.'
  },
  {
    word: 'もしかしたら',
    romaji: 'moshikashitara',
    category: 'conjecture',
    meaning: 'Biết đâu chừng, có khả năng là...',
    patternRequired: 'Thường đi với đuôi câu 〜かもしれません',
    exampleJp: 'もしかしたら あした 雨が 降るかもしれません。',
    exampleVn: 'Biết đâu chừng ngày mai trời có thể sẽ mưa.'
  }
];
