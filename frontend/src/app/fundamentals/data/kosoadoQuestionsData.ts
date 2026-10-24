export interface KosoadoRow {
  category: string;
  ko: { word: string; romaji: string; meaning: string };
  so: { word: string; romaji: string; meaning: string };
  a: { word: string; romaji: string; meaning: string };
  do: { word: string; romaji: string; meaning: string };
  usageRule: string;
}

export interface QuestionCompound {
  questionWord: string;
  romaji: string;
  basicMeaning: string;
  withKa: { word: string; meaning: string; example: string };
  withMo: { word: string; meaning: string; example: string };
  withDemo: { word: string; meaning: string; example: string };
}

export const KOSOADO_MATRIX: KosoadoRow[] = [
  {
    category: 'Vật thể (Đại từ độc lập)',
    ko: { word: 'これ', romaji: 'kore', meaning: 'Cái này' },
    so: { word: 'それ', romaji: 'sore', meaning: 'Cái đó' },
    a: { word: 'あれ', romaji: 'are', meaning: 'Cái kia' },
    do: { word: 'どれ', romaji: 'dore', meaning: 'Cái nào' },
    usageRule: 'Đóng vai trò là một Danh từ độc lập, thường đi với trợ từ は hoặc が (これ/それ/あれ は〜).'
  },
  {
    category: 'Bổ nghĩa cho Danh từ (+ N)',
    ko: { word: 'この', romaji: 'kono', meaning: '... này' },
    so: { word: 'その', romaji: 'sono', meaning: '... đó' },
    a: { word: 'あの', romaji: 'ano', meaning: '... kia' },
    do: { word: 'どの', romaji: 'dono', meaning: '... nào' },
    usageRule: 'BẮT BUỘC phải có Danh từ đi liền phía sau (この本, その人, あの車, どの傘).'
  },
  {
    category: 'Nơi chốn / Địa điểm',
    ko: { word: 'ここ', romaji: 'koko', meaning: 'Chỗ này / Ở đây' },
    so: { word: 'そこ', romaji: 'soko', meaning: 'Chỗ đó / Ở đó' },
    a: { word: 'あそこ', romaji: 'asoko', meaning: 'Chỗ kia / Ở đằng kia' },
    do: { word: 'どこ', romaji: 'doko', meaning: 'Chỗ nào / Ở đâu' },
    usageRule: 'Chỉ vị trí không gian địa lý. Chú ý từ hàng A là あそこ (không phải あこ).'
  },
  {
    category: 'Phương hướng / Lịch sự',
    ko: { word: 'こちら', romaji: 'kochira', meaning: 'Phía này / Chỗ này (Lịch sự)' },
    so: { word: 'そちら', romaji: 'sochira', meaning: 'Phía đó / Chỗ đó (Lịch sự)' },
    a: { word: 'あちら', romaji: 'achira', meaning: 'Phía kia / Chỗ kia (Lịch sự)' },
    do: { word: 'どちら', romaji: 'dochira', meaning: 'Phía nào / Đâu (Lịch sự)' },
    usageRule: 'Dùng chỉ hướng đi hoặc thay thế cho Người/Nơi chốn trong văn cảnh lịch sự, trang trọng.'
  },
  {
    category: 'Cách thức / Phương pháp',
    ko: { word: 'こう', romaji: 'kou', meaning: 'Như thế này' },
    so: { word: 'そう', romaji: 'sou', meaning: 'Như thế đó' },
    a: { word: 'ああ', romaji: 'aa', meaning: 'Như thế kia' },
    do: { word: 'どう', romaji: 'dou', meaning: 'Như thế nào' },
    usageRule: 'Bổ nghĩa cho động từ: Làm như thế này (こうします), nghĩ như thế đó (そう思います).'
  },
  {
    category: 'Tính chất / Tình trạng (+ N)',
    ko: { word: 'こんな', romaji: 'konna', meaning: '... như thế này' },
    so: { word: 'そんな', romaji: 'sonna', meaning: '... như thế đó' },
    a: { word: 'あんな', romaji: 'anna', meaning: '... như thế kia' },
    do: { word: 'どんな', romaji: 'donna', meaning: '... như thế nào' },
    usageRule: 'Định nghĩa tính chất của sự vật, đứng trước danh từ (どんな人: người như thế nào).'
  }
];

export const QUESTION_COMPOUNDS: QuestionCompound[] = [
  {
    questionWord: 'なに / なん (何)',
    romaji: 'nani / nan',
    basicMeaning: 'Cái gì?',
    withKa: {
      word: 'なにか (何か)',
      meaning: 'Cái gì đó (Chưa xác định)',
      example: 'なにか 食べたいです。(Tôi muốn ăn cái gì đó.)'
    },
    withMo: {
      word: 'なにも + Phủ định (何も)',
      meaning: 'Không cái gì cả (Hoàn toàn không)',
      example: '朝は なにも 食べませんでした。(Sáng nay tôi chẳng ăn gì cả.)'
    },
    withDemo: {
      word: 'なんでも (何でも)',
      meaning: 'Bất cứ cái gì / Cái gì cũng',
      example: 'わたしは なんでも 食べられます。(Cái gì tôi cũng ăn được.)'
    }
  },
  {
    questionWord: 'だれ / どなた (誰)',
    romaji: 'dare / donata',
    basicMeaning: 'Ai? (Lịch sự: どなた)',
    withKa: {
      word: 'だれか (誰か)',
      meaning: 'Ai đó (Có người nào đó)',
      example: '部屋に だれか いますか。(Trong phòng có ai đó không?)'
    },
    withMo: {
      word: 'だれも + Phủ định (誰も)',
      meaning: 'Không có ai cả',
      example: '教室には だれも いません。(Trong lớp học chẳng có ai cả.)'
    },
    withDemo: {
      word: 'だれでも (誰でも)',
      meaning: 'Bất cứ ai / Ai cũng',
      example: 'この問題は だれでも 解けます。(Câu hỏi này ai cũng giải được.)'
    }
  },
  {
    questionWord: 'どこ (何処)',
    romaji: 'doko',
    basicMeaning: 'Ở đâu?',
    withKa: {
      word: 'どこか (何処か)',
      meaning: 'Đâu đó (Nơi nào đó)',
      example: '週末 どこかへ 行きましたか。(Cuối tuần bạn có đi đâu đó không?)'
    },
    withMo: {
      word: 'どこも / どこへも + Phủ định',
      meaning: 'Không đâu cả',
      example: 'きのう どこへも 行きませんでした。(Hôm qua tôi chẳng đi đâu cả.)'
    },
    withDemo: {
      word: 'どこでも (何処でも)',
      meaning: 'Bất cứ nơi đâu',
      example: '日本なら どこでも 行きたいです。(Nếu là Nhật Bản thì nơi nào tôi cũng muốn đến.)'
    }
  },
  {
    questionWord: 'いつ',
    romaji: 'itsu',
    basicMeaning: 'Khi nào? Bao giờ?',
    withKa: {
      word: 'いつか',
      meaning: 'Một lúc nào đó / Một ngày nào đó',
      example: 'いつか 日本へ 行きたいです。(Một ngày nào đó tôi muốn đi Nhật.)'
    },
    withMo: {
      word: 'いつも',
      meaning: 'Luôn luôn / Lúc nào cũng',
      example: '彼は いつも 図書館で 勉強しています。(Anh ấy lúc nào cũng học ở thư viện.)'
    },
    withDemo: {
      word: 'いつでも',
      meaning: 'Bất cứ lúc nào',
      example: 'いつでも 連絡してください。(Hãy liên lạc với tôi bất cứ lúc nào nhé.)'
    }
  },
  {
    questionWord: 'いくら / いくつ',
    romaji: 'ikura / ikutsu',
    basicMeaning: 'Bao nhiêu tiền? / Bao nhiêu cái?',
    withKa: {
      word: 'いくらか',
      meaning: 'Một ít, một số tiền nhỏ',
      example: 'いくらか お金を 持っています。(Tôi có giữ một ít tiền.)'
    },
    withMo: {
      word: 'いくら + Vても',
      meaning: 'Dù có bao nhiêu chăng nữa',
      example: 'いくら 勉強しても、わかりません。(Dù có học bao nhiêu cũng chưa hiểu.)'
    },
    withDemo: {
      word: 'いくらでも',
      meaning: 'Bao nhiêu cũng được',
      example: 'ビールなら いくらでも 飲めます。(Nếu là bia thì bao nhiêu tôi cũng uống được.)'
    }
  }
];
