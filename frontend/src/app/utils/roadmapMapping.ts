// Utility mapping vocabulary and Kanji to grammar patterns for Japanese lessons

export interface GrammarMappingResult {
  associatedItems: any[]; // The full list of items linked to this grammar pattern
  newItems: any[];        // The items that are introduced in this pattern and not in previous ones
  copiedItems: any[];     // The items that are shared with previous patterns
}

export interface SubstitutionSlot {
  id: string;
  label: string;
  options: { ja: string; vi: string; romaji: string }[];
}

export interface SubstitutionTemplate {
  grammarTitle: string;
  templateParts: string[]; // Text fragments surrounding the placeholders
  slots: SubstitutionSlot[];
  // Logic to synthesize translation & romaji
  getSynthesis: (slotValues: Record<string, { ja: string; vi: string; romaji: string }>) => { 
    ja: string; 
    vi: string; 
    romaji: string;
    questionJa?: string;
    questionRomaji?: string;
    questionVi?: string;
  };
}

const SlotOption = { ja: '', vi: '', romaji: '' };

// Map vocabulary by romaji/hiragana patterns for Lesson 2
const LESSON_2_VOCAB_GROUPS = [
  // 1. これ / それ / あれ
  ["kore", "sore", "are", "hon", "jisho", "zasshi", "no-to", "techou", "meishi", "ka-do", "enpitsu", "bo-rupen", "sha-pupenshiru", "kagi", "tokei", "kasa", "kaban", "terebi", "rajio", "kamera", "konpyu-ta-", "jidousha", "tsukue", "isu", "chokore-to", "ko-hi-"],
  // 2. この / その / あの N
  ["kono", "sono", "ano", "hon", "jisho", "zasshi", "no-to", "techou", "meishi", "ka-do", "enpitsu", "bo-rupen", "sha-pupenshiru", "kagi", "tokei", "kasa", "kaban", "terebi", "rajio", "kamera", "konpyu-ta-", "jidousha", "tsukue", "isu", "chokore-to", "ko-hi-"],
  // 3. そう です / そう じゃ ありません
  ["sou", "chigaimasu", "sou desu ka", "hai", "iie", "anou"],
  // 4. S1 ですか、S2 ですか / なん
  ["nan", "hon", "jisho", "zasshi", "no-to", "techou", "meishi", "ka-do", "enpitsu", "bo-rupen", "sha-pupenshiru", "kagi", "tokei", "kasa", "kaban", "terebi", "rajio", "kamera", "konpyu-ta-", "jidousha", "tsukue", "isu", "chokore-to", "ko-hi-"],
  // 5. N1 の N2 (Sở hữu / Xuất xứ / Quà tặng)
  ["watashi", "anata", "no", "eigo", "nihongo", "go", "omiyage", "honno kimochi desu", "douzo", "doumo", "korekara osewani narimasu", "kochirakoso yoroshiku onegaishimasu"]
];

// Map Kanji for Lesson 2
const LESSON_2_KANJI_GROUPS = [
  ["書", "紙", "車", "時", "傘"],
  ["書", "紙", "車", "時", "傘", "机"],
  [],
  ["何"],
  ["本", "語", "英", "日", "私"]
];

// Map vocabulary by romaji/hiragana patterns for Lesson 1
const LESSON_1_VOCAB_GROUPS = [
  ["watashi", "anata", "ano hito", "ano kata", "sensei", "kyoushi", "gakusei", "kaishain", "shain", "ginkouin", "isha", "kenkyuusha", "enjinia", "sai"],
  ["watashi", "anata", "ano hito", "ano kata", "sensei", "kyoushi", "gakusei", "kaishain", "shain", "ginkouin", "isha", "kenkyuusha", "enjinia", "sai"],
  ["dare", "donata", "nansai", "hai", "iie"],
  ["watashi", "anata", "ano hito", "ano kata", "sensei", "kyoushi", "gakusei", "kaishain", "shain", "ginkouin", "isha", "kenkyuusha", "enjinia", "mo"],
  ["daigaku", "byouin", "denki", "shain", "no"],
  ["hajimemashite", "kara kimashita", "douzo yoroshiku", "shitsurei desuga", "onamae wa", "kochira", "amerika", "igirisu", "indo", "indoneshia", "kankoku", "tai", "chuugoku", "doitsu", "nihon", "betonamu", "brazil", "sakura daigaku", "fuji daigaku", "imc", "akc", "power denki"]
];

const LESSON_1_KANJI_GROUPS = [
  ["私", "生"],
  ["私", "生"],
  ["何", "歳"],
  ["私", "生"],
  ["大", "学", "病", "院", "電", "気"],
  ["日", "本", "国", "名", "英"]
];

export function getGrammarVocabMapping(
  lessonId: number,
  grammarIndex: number,
  allVocab: any[]
): GrammarMappingResult {
  let mappedKeys: string[] = [];

  if (lessonId === 1 && LESSON_1_VOCAB_GROUPS[grammarIndex]) {
    mappedKeys = LESSON_1_VOCAB_GROUPS[grammarIndex];
  } else if (lessonId === 2 && LESSON_2_VOCAB_GROUPS[grammarIndex]) {
    mappedKeys = LESSON_2_VOCAB_GROUPS[grammarIndex];
  } else {
    // Fallback: divide vocabulary list across available grammar patterns with overlap
    const totalGrammar = Math.max(3, allVocab.length > 0 ? 5 : 1);
    const segmentSize = Math.max(5, Math.ceil(allVocab.length / 2));
    const start = Math.max(0, Math.floor((grammarIndex / totalGrammar) * allVocab.length) - 3);
    const end = Math.min(allVocab.length, start + segmentSize);
    
    const associatedItems = allVocab.slice(start, end);
    const previousItems = new Set<number>();
    for (let prevIdx = 0; prevIdx < grammarIndex; prevIdx++) {
      const pStart = Math.max(0, Math.floor((prevIdx / totalGrammar) * allVocab.length) - 3);
      const pEnd = Math.min(allVocab.length, pStart + segmentSize);
      allVocab.slice(pStart, pEnd).forEach(item => previousItems.add(item.id));
    }
    
    const newItems = associatedItems.filter(item => !previousItems.has(item.id));
    const copiedItems = associatedItems.filter(item => previousItems.has(item.id));
    
    return { associatedItems, newItems, copiedItems };
  }

  const associatedItems = allVocab.filter(vocab => {
    const romajiClean = vocab.romaji.toLowerCase().replace(/\s+/g, '').replace(/\([^)]*\)/g, '').replace(/ō/g, 'o').replace(/ū/g, 'u');
    return mappedKeys.some(key => {
      const keyClean = key.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
      return (
        romajiClean.includes(keyClean) ||
        keyClean.includes(romajiClean) ||
        vocab.hiragana.includes(key)
      );
    });
  });

  const allPreviousKeys = [];
  if (lessonId === 1) {
    for (let i = 0; i < grammarIndex; i++) {
      allPreviousKeys.push(...(LESSON_1_VOCAB_GROUPS[i] || []));
    }
  } else if (lessonId === 2) {
    for (let i = 0; i < grammarIndex; i++) {
      allPreviousKeys.push(...(LESSON_2_VOCAB_GROUPS[i] || []));
    }
  }

  const prevKeysClean = allPreviousKeys.map(k => k.toLowerCase().replace(/\s+/g, '').replace(/-/g, ''));
  const copiedItems = associatedItems.filter(vocab => {
    const romajiClean = vocab.romaji.toLowerCase().replace(/\s+/g, '').replace(/\([^)]*\)/g, '').replace(/ō/g, 'o').replace(/ū/g, 'u');
    return prevKeysClean.some(key => {
      return (
        romajiClean.includes(key) ||
        key.includes(romajiClean) ||
        vocab.hiragana.includes(key)
      );
    });
  });

  const copiedIds = new Set(copiedItems.map(item => item.id));
  const newItems = associatedItems.filter(item => !copiedIds.has(item.id));

  return { associatedItems, newItems, copiedItems };
}

export function getGrammarKanjiMapping(
  lessonId: number,
  grammarIndex: number,
  allKanji: any[]
): GrammarMappingResult {
  let mappedCharacters: string[] = [];

  if (lessonId === 1 && LESSON_1_KANJI_GROUPS[grammarIndex]) {
    mappedCharacters = LESSON_1_KANJI_GROUPS[grammarIndex];
  } else if (lessonId === 2 && LESSON_2_KANJI_GROUPS[grammarIndex]) {
    mappedCharacters = LESSON_2_KANJI_GROUPS[grammarIndex];
  } else {
    // Fallback: distribute kanji items
    const totalGrammar = 5;
    const segmentSize = Math.max(3, Math.ceil(allKanji.length / 2));
    const start = Math.max(0, Math.floor((grammarIndex / totalGrammar) * allKanji.length) - 1);
    const end = Math.min(allKanji.length, start + segmentSize);
    
    const associatedItems = allKanji.slice(start, end);
    const previousItems = new Set<number>();
    for (let prevIdx = 0; prevIdx < grammarIndex; prevIdx++) {
      const pStart = Math.max(0, Math.floor((prevIdx / totalGrammar) * allKanji.length) - 1);
      const pEnd = Math.min(allKanji.length, pStart + segmentSize);
      allKanji.slice(pStart, pEnd).forEach(item => previousItems.add(item.id));
    }
    
    const newItems = associatedItems.filter(item => !previousItems.has(item.id));
    const copiedItems = associatedItems.filter(item => previousItems.has(item.id));
    
    return { associatedItems, newItems, copiedItems };
  }

  const associatedItems = allKanji.filter(kanji => 
    mappedCharacters.includes(kanji.character)
  );

  const allPreviousCharacters: string[] = [];
  if (lessonId === 1) {
    for (let i = 0; i < grammarIndex; i++) {
      allPreviousCharacters.push(...(LESSON_1_KANJI_GROUPS[i] || []));
    }
  } else if (lessonId === 2) {
    for (let i = 0; i < grammarIndex; i++) {
      allPreviousCharacters.push(...(LESSON_2_KANJI_GROUPS[i] || []));
    }
  }

  const copiedItems = associatedItems.filter(kanji => 
    allPreviousCharacters.includes(kanji.character)
  );

  const copiedIds = new Set(copiedItems.map(item => item.id));
  const newItems = associatedItems.filter(item => !copiedIds.has(item.id));

  return { associatedItems, newItems, copiedItems };
}

// ----------------------------------------------------
// SUBSTITUTION TEMPLATE DEFINITIONS FOR LESSONS 1 & 2
// ----------------------------------------------------

export function getSubstitutionTemplate(
  lessonId: number,
  grammarIndex: number,
  lessonVocab: any[],
  grammarItemsOrCount?: number | any[]
): SubstitutionTemplate {
  
  let grammarItemsCount = 0;
  let grammarItems: any[] = [];
  if (Array.isArray(grammarItemsOrCount)) {
    grammarItems = grammarItemsOrCount;
    grammarItemsCount = grammarItemsOrCount.length;
  } else if (typeof grammarItemsOrCount === 'number') {
    grammarItemsCount = grammarItemsOrCount;
  }

  // Communication / Supplemental items block fallback
  if (grammarItemsCount > 0 && grammarIndex === grammarItemsCount) {
    if (lessonId === 1) {
      const defaultPeople = [
        { ja: "わたし", vi: "Tôi", romaji: "watashi" },
        { ja: "あなた", vi: "Bạn", romaji: "anata" },
        { ja: "あの人", vi: "Người kia", romaji: "ano hito" },
        { ja: "あの方", vi: "Vị kia", romaji: "ano kata" },
        { ja: "ナムさん", vi: "Anh Nam", romaji: "Namu-san" }
      ];
      const defaultCountries = [
        { ja: "ベトナム", vi: "Việt Nam", romaji: "Betonamu" },
        { ja: "日本", vi: "Nhật Bản", romaji: "Nihon" },
        { ja: "アメリカ", vi: "Mỹ", romaji: "Amerika" },
        { ja: "イギリス", vi: "Anh", romaji: "Igirisu" },
        { ja: "ブラジル", vi: "Brazil", romaji: "Burajiru" },
        { ja: "フランス", vi: "Pháp", romaji: "Fransu" }
      ];
      return {
        grammarTitle: "Giao tiếp: Chào hỏi & Giới thiệu bản thân",
        templateParts: ["はじめまして。 ", " です。 ", " から来ました。どうぞよろしく。"],
        slots: [
          { id: "s1", label: "Tên (N1)", options: defaultPeople },
          { id: "s2", label: "Đất nước (N2)", options: defaultCountries }
        ],
        getSynthesis: (vals) => {
          if (!vals.s1 || !vals.s2) return { ja: '', vi: '', romaji: '' };
          return {
            ja: `はじめまして。${vals.s1.ja}です。${vals.s2.ja}から来ました。どうぞよろしく。`,
            romaji: `Hajimemashite. ${vals.s1.romaji} desu. ${vals.s2.romaji} kara kimashita. Douzo yoroshiku.`,
            vi: `Rất vui được gặp bạn. Tôi là ${vals.s1.vi}. Tôi đến từ ${vals.s2.vi}. Rất mong được giúp đỡ.`
          };
        }
      };
    } else {
      const associatedIds = new Set<number>();
      for (let idx = 0; idx < grammarItemsCount; idx++) {
        const mapping = getGrammarVocabMapping(lessonId, idx, lessonVocab);
        mapping.associatedItems.forEach(item => associatedIds.add(item.id));
      }
      const supplementalItems = lessonVocab.filter(item => !associatedIds.has(item.id));
      const options = supplementalItems.length > 0
        ? supplementalItems.map(v => ({
            ja: v.hiragana,
            vi: v.vietnamese_meaning,
            romaji: v.romaji
          }))
        : [{ ja: "すみません", vi: "Xin lỗi / Cho hỏi", romaji: "sumimasen" }];

      return {
        grammarTitle: "Giao tiếp: Các cụm từ & Từ vựng khác",
        templateParts: ["Từ / Cụm từ: ", ""],
        slots: [
          { id: "s1", label: "Chọn cụm từ giao tiếp", options }
        ],
        getSynthesis: (vals) => {
          if (!vals.s1) return { ja: '', vi: '', romaji: '' };
          return {
            ja: `${vals.s1.ja}。`,
            romaji: `${vals.s1.romaji}.`,
            vi: `${vals.s1.vi}.`
          };
        }
      };
    }
  }

  // --- LESSON 1 HAND-CODED PATTERNS ---
  if (lessonId === 1) {
    const defaultPeople = [
      { ja: "わたし", vi: "Tôi", romaji: "watashi" },
      { ja: "あなた", vi: "Bạn", romaji: "anata" },
      { ja: "あの人", vi: "Người kia", romaji: "ano hito" },
      { ja: "あの方", vi: "Vị kia", romaji: "ano kata" },
      { ja: "ナムさん", vi: "Anh Nam", romaji: "Namu-san" }
    ];
    const defaultJobs = [
      { ja: "学生", vi: "học sinh", romaji: "gakusei" },
      { ja: "教師", vi: "nhà giáo", romaji: "kyoushi" },
      { ja: "エンジニア", vi: "kỹ sư", romaji: "enjinia" },
      { ja: "医者", vi: "bác sĩ", romaji: "isha" },
      { ja: "銀行員", vi: "nhân viên ngân hàng", romaji: "ginkouin" }
    ];

    if (grammarIndex === 0) { // N1 は N2 です
      return {
        grammarTitle: "N1 は N2 です (N1 là N2)",
        templateParts: ["", " は ", " です。"],
        slots: [
          { id: "s1", label: "Chủ ngữ (N1)", options: defaultPeople },
          { id: "s2", label: "Danh từ (N2)", options: defaultJobs }
        ],
        getSynthesis: (vals) => {
          if (!vals.s1 || !vals.s2) return { ja: '', vi: '', romaji: '' };
          return {
            ja: `${vals.s1.ja}は${vals.s2.ja}es.`,
            romaji: `${vals.s1.romaji} wa ${vals.s2.romaji} desu.`,
            vi: `${vals.s1.vi} là ${vals.s2.vi}.`
          };
        }
      };
    } else if (grammarIndex === 1) { // N1 は N2 じゃありません
      return {
        grammarTitle: "N1 は N2 じゃありません (N1 không phải là N2)",
        templateParts: ["", " は ", " じゃありません。"],
        slots: [
          { id: "s1", label: "Chủ ngữ (N1)", options: defaultPeople },
          { id: "s2", label: "Danh từ (N2)", options: defaultJobs }
        ],
        getSynthesis: (vals) => {
          if (!vals.s1 || !vals.s2) return { ja: '', vi: '', romaji: '' };
          return {
            ja: `${vals.s1.ja}は${vals.s2.ja}じゃありません。`,
            romaji: `${vals.s1.romaji} wa ${vals.s2.romaji} ja arimasen.`,
            vi: `${vals.s1.vi} không phải là ${vals.s2.vi}.`
          };
        }
      };
    } else if (grammarIndex === 2) { // S wa N desu ka (Q&A)
      return {
        grammarTitle: "S は N ですか (S là N phải không?)",
        templateParts: ["はい、", " は ", " です。"],
        slots: [
          { id: "s1", label: "Chủ ngữ", options: defaultPeople },
          { id: "s2", label: "Danh từ", options: defaultJobs }
        ],
        getSynthesis: (vals) => {
          if (!vals.s1 || !vals.s2) return { ja: '', vi: '', romaji: '' };
          let qS1Ja = vals.s1.ja;
          let qS1Rom = vals.s1.romaji;
          let qS1Vi = vals.s1.vi;
          if (vals.s1.ja === 'わたし') {
            qS1Ja = 'あなた'; qS1Rom = 'anata'; qS1Vi = 'Bạn';
          } else if (vals.s1.ja === 'あなた') {
            qS1Ja = 'わたし'; qS1Rom = 'watashi'; qS1Vi = 'Tôi';
          }
          return {
            ja: `はい、${vals.s1.ja}は${vals.s2.ja}です。`,
            romaji: `Hai, ${vals.s1.romaji} wa ${vals.s2.romaji} desu.`,
            vi: `Vâng, ${vals.s1.vi} là ${vals.s2.vi}.`,
            questionJa: `${qS1Ja}は${vals.s2.ja}ですか。`,
            questionRomaji: `${qS1Rom} wa ${vals.s2.romaji} desu ka.`,
            questionVi: `${qS1Vi} là ${vals.s2.vi} phải không?`
          };
        }
      };
    } else if (grammarIndex === 3) { // N mo desu
      return {
        grammarTitle: "N も です (Cũng là N)",
        templateParts: ["ミラーさんは会社員です。 ", " も 会社員 です。"],
        slots: [
          { id: "s1", label: "Người khác", options: defaultPeople.slice(0, 4) }
        ],
        getSynthesis: (vals) => {
          if (!vals.s1) return { ja: '', vi: '', romaji: '' };
          return {
            ja: `ミラーさんは会社員です。${vals.s1.ja}も会社員です。`,
            romaji: `Mira-san wa kaishain desu. ${vals.s1.romaji} mo kaishain desu.`,
            vi: `Anh Miller là nhân viên công ty. ${vals.s1.vi} cũng là nhân viên công ty.`
          };
        }
      };
    } else { // N1 no N2
      const companies = [
        { ja: "IMC", vi: "công ty IMC", romaji: "IMC" },
        { ja: "パワー電気", vi: "Điện lực Power", romaji: "Pawaa denki" },
        { ja: "さくら大学", vi: "Đại học Sakura", romaji: "Sakura daigaku" }
      ];
      return {
        grammarTitle: "N1 の N2 (N2 của N1 / Thuộc N1)",
        templateParts: ["わたしha ", " の ", " です。"],
        slots: [
          { id: "s1", label: "Tổ chức (N1)", options: companies },
          { id: "s2", label: "Vai trò (N2)", options: defaultJobs }
        ],
        getSynthesis: (vals) => {
          if (!vals.s1 || !vals.s2) return { ja: '', vi: '', romaji: '' };
          return {
            ja: `私は${vals.s1.ja}の${vals.s2.ja}です。`,
            romaji: `Watashi wa ${vals.s1.romaji} no ${vals.s2.romaji} desu.`,
            vi: `Tôi là ${vals.s2.vi} của ${vals.s1.vi}.`
          };
        }
      };
    }
  }

  // --- LESSON 2 HAND-CODED PATTERNS ---
  const objects = [
    { ja: "本", vi: "sách", romaji: "hon" },
    { ja: "辞書", vi: "từ điển", romaji: "jisho" },
    { ja: "雑誌", vi: "tạp chí", romaji: "zasshi" },
    { ja: "ノート", vi: "vở", romaji: "no-to" },
    { ja: "手帳", vi: "sổ tay", romaji: "techou" },
    { ja: "鍵", vi: "chìa khóa", romaji: "kagi" },
    { ja: "時計", vi: "đồng hồ", romaji: "tokei" },
    { ja: "傘", vi: "ô/dù", romaji: "kasa" },
    { ja: "カバン", vi: "túi xách", romaji: "kaban" },
    { ja: "カメラ", vi: "máy ảnh", romaji: "kamera" },
    { ja: "自動車", vi: "xe hơi", romaji: "jidousha" }
  ];

  if (lessonId === 2) {
    if (grammarIndex === 0) { // これ/それ/あれ は N です (Q&A)
      return {
        grammarTitle: "これ/それ/あれ は N です (Đây/Kia/Kìa là N)",
        templateParts: ["はい、", " は ", " です。"],
        slots: [
          {
            id: "s1",
            label: "Chỉ thị từ",
            options: [
              { ja: "これ", vi: "Đây", romaji: "Kore" },
              { ja: "それ", vi: "Đó", romaji: "Sore" },
              { ja: "あれ", vi: "Kìa", romaji: "Are" }
            ]
          },
          { id: "s2", label: "Đồ vật (N)", options: objects }
        ],
        getSynthesis: (vals) => {
          if (!vals.s1 || !vals.s2) return { ja: '', vi: '', romaji: '' };
          let qS1Ja = vals.s1.ja;
          let qS1Rom = vals.s1.romaji;
          let qS1Vi = vals.s1.vi;
          if (vals.s1.ja === 'これ') {
            qS1Ja = 'それ'; qS1Rom = 'Sore'; qS1Vi = 'Đó';
          } else if (vals.s1.ja === 'それ') {
            qS1Ja = 'これ'; qS1Rom = 'Kore'; qS1Vi = 'Đây';
          }
          return {
            ja: `はい、${vals.s1.ja}は${vals.s2.ja}です。`,
            romaji: `Hai, ${vals.s1.romaji} wa ${vals.s2.romaji} desu.`,
            vi: `Vâng, ${vals.s1.vi} là cái ${vals.s2.vi}.`,
            questionJa: `${qS1Ja}は${vals.s2.ja}ですか。`,
            questionRomaji: `${qS1Rom} wa ${vals.s2.romaji} desu ka.`,
            questionVi: `${qS1Vi} có phải là cái ${vals.s2.vi} không?`
          };
        }
      };
    } else if (grammarIndex === 1) { // この/その/あの N1 は N2 です (Q&A)
      return {
        grammarTitle: "この/その/あの N1 は N2 です (Cái N1 này/kia là N2)",
        templateParts: ["はい、", " ", " は ", " の です。"],
        slots: [
          {
            id: "s1",
            label: "Định từ chỉ thị",
            options: [
              { ja: "この", vi: "này", romaji: "Kono" },
              { ja: "その", vi: "đó", romaji: "Sono" },
              { ja: "あの", vi: "kia", romaji: "Ano" }
            ]
          },
          { id: "s2", label: "Đồ vật (N1)", options: objects.slice(0, 8) },
          {
            id: "s3",
            label: "Người sở hữu (N2)",
            options: [
              { ja: "私", vi: "tôi", romaji: "watashi" },
              { ja: "あなた", vi: "bạn", romaji: "anata" },
              { ja: "ミラーさん", vi: "anh Miller", romaji: "Mira-san" }
            ]
          }
        ],
        getSynthesis: (vals) => {
          if (!vals.s1 || !vals.s2 || !vals.s3) return { ja: '', vi: '', romaji: '' };
          let qS1Ja = vals.s1.ja;
          let qS1Rom = vals.s1.romaji;
          let qS1Vi = vals.s1.vi;
          if (vals.s1.ja === 'この') {
            qS1Ja = 'その'; qS1Rom = 'Sono'; qS1Vi = 'đó';
          } else if (vals.s1.ja === 'その') {
            qS1Ja = 'この'; qS1Rom = 'Kono'; qS1Vi = 'này';
          }
          
          let qS3Ja = vals.s3.ja;
          let qS3Rom = vals.s3.romaji;
          let qS3Vi = vals.s3.vi;
          if (vals.s3.ja === '私') {
            qS3Ja = 'あなた'; qS3Rom = 'anata'; qS3Vi = 'bạn';
          } else if (vals.s3.ja === 'あなた') {
            qS3Ja = '私'; qS3Rom = 'watashi'; qS3Vi = 'tôi';
          }
          
          return {
            ja: `はい、${vals.s1.ja}${vals.s2.ja}は${vals.s3.ja}のです。`,
            romaji: `Hai, ${vals.s1.romaji} ${vals.s2.romaji} wa ${vals.s3.romaji} no desu.`,
            vi: `Vâng, cái ${vals.s2.vi} ${vals.s1.vi} là của ${vals.s3.vi}.`,
            questionJa: `${qS1Ja}${vals.s2.ja}は${qS3Ja}のですか。`,
            questionRomaji: `${qS1Rom} ${vals.s2.romaji} wa ${qS3Rom} no desu ka.`,
            questionVi: `Cái ${vals.s2.vi} ${qS1Vi} có phải là của ${qS3Vi} không?`
          };
        }
      };
    } else if (grammarIndex === 2) { // そう です / そう じゃ ありません (Q&A)
      return {
        grammarTitle: "そう です / そう じゃ ありません (Xác nhận đúng sai)",
        templateParts: ["", "。それは ", " です。"],
        slots: [
          {
            id: "s2",
            label: "Câu trả lời",
            options: [
              { ja: "はい、そうです", vi: "Vâng, đúng vậy", romaji: "Hai, sou desu" },
              { ja: "いいえ、違います", vi: "Không, không phải (sai rồi)", romaji: "Iie, chigaimasu" }
            ]
          },
          { id: "s1", label: "Đồ vật", options: objects.slice(0, 7) }
        ],
        getSynthesis: (vals) => {
          if (!vals.s1 || !vals.s2) return { ja: '', vi: '', romaji: '' };
          const isYes = vals.s2.ja === 'はい、そうです';
          const jaA = isYes ? `${vals.s2.ja}。それは${vals.s1.ja}です。` : `${vals.s2.ja}。それは${vals.s1.ja}じゃありません。`;
          const romA = isYes ? `${vals.s2.romaji}. Sore wa ${vals.s1.romaji} desu.` : `${vals.s2.romaji}. Sore wa ${vals.s1.romaji} ja arimasen.`;
          const viA = isYes ? `${vals.s2.vi}. Đó là cái ${vals.s1.vi}.` : `${vals.s2.vi}. Đó không phải là cái ${vals.s1.vi}.`;
          
          return {
            ja: jaA,
            romaji: romA,
            vi: viA,
            questionJa: `それは${vals.s1.ja}ですか。`,
            questionRomaji: `Sore wa ${vals.s1.romaji} desu ka.`,
            questionVi: `Đó có phải là cái ${vals.s1.vi} không?`
          };
        }
      };
    } else if (grammarIndex === 3) { // S1 desu ka, S2 desu ka
      return {
        grammarTitle: "S1 ですか、S2 ですか (Là S1 hay S2?)",
        templateParts: ["これは ", " ですか、", " ですか。"],
        slots: [
          { id: "s1", label: "Lựa chọn 1", options: objects.slice(6, 9) },
          { id: "s2", label: "Lựa chọn 2", options: objects.slice(0, 4) }
        ],
        getSynthesis: (vals) => {
          if (!vals.s1 || !vals.s2) return { ja: '', vi: '', romaji: '' };
          return {
            ja: `これは${vals.s1.ja}ですか、${vals.s2.ja}ですか。`,
            romaji: `Kore wa ${vals.s1.romaji} desu ka, ${vals.s2.romaji} desu ka?`,
            vi: `Đây là cái ${vals.s1.vi} hay là cái ${vals.s2.vi}?`
          };
        }
      };
    } else { // N1 no N2 (Sở hữu/Chủ đề)
      const topics = [
        { ja: "日本語", vi: "tiếng Nhật", romaji: "nihongo" },
        { ja: "英語", vi: "tiếng Anh", romaji: "eigo" },
        { ja: "コンピューター", vi: "máy tính", romaji: "konpyu-ta-" },
        { ja: "自動車", vi: "xe hơi", romaji: "jidousha" }
      ];
      return {
        grammarTitle: "N1 の N2 (N2 của N1 / N2 về N1)",
        templateParts: ["これは ", " の ", " です。"],
        slots: [
          { id: "s1", label: "Chủ đề / Nguồn gốc (N1)", options: topics },
          { id: "s2", label: "Sách/Tài liệu (N2)", options: objects.slice(0, 3) }
        ],
        getSynthesis: (vals) => {
          if (!vals.s1 || !vals.s2) return { ja: '', vi: '', romaji: '' };
          return {
            ja: `これは${vals.s1.ja}の${vals.s2.ja}です。`,
            romaji: `Kore wa ${vals.s1.romaji} no ${vals.s2.romaji} desu.`,
            vi: `Đây là quyển ${vals.s2.vi} ${vals.s1.vi}.`
          };
        }
      };
    }
  }

  // --- DYNAMIC TEMPLATE ENGINE FOR LESSONS 3 TO 50 ---
  if (Array.isArray(grammarItems) && grammarItems[grammarIndex]) {
    const activeGrammar = grammarItems[grammarIndex];
    const rawJa = activeGrammar.japanese_example || "";
    const rawVi = activeGrammar.example_meaning || "";
    const rawRomaji = activeGrammar.romaji_example || "";
    
    // Hàm chuyển Hiragana sang Katakana để đối chiếu các từ ngoại lai (như toilet -> トイレ)
    const toKatakana = (src: string): string => {
      return src.replace(/[\u3041-\u3096]/g, (match: string) => {
        return String.fromCharCode(match.charCodeAt(0) + 0x60);
      });
    };
    
    // Hàm sinh Romaji tự động cho câu (fallback)
    const getRomajiForSentence = (jaText: string, vocabList: any[]): string => {
      let rom = jaText;
      const sortedVocab = [...vocabList]
        .filter(v => v.hiragana && v.romaji)
        .sort((a, b) => b.hiragana.length - a.hiragana.length);
        
      for (const v of sortedVocab) {
        let cleanRomaji = v.romaji;
        if (cleanRomaji.includes('(')) {
          cleanRomaji = cleanRomaji.split('(')[0].trim();
        }
        if (rom.includes(v.hiragana)) {
          rom = rom.replace(new RegExp(v.hiragana, 'g'), ' ' + cleanRomaji + ' ');
        }
        const kata = toKatakana(v.hiragana);
        if (rom.includes(kata)) {
          rom = rom.replace(new RegExp(kata, 'g'), ' ' + cleanRomaji + ' ');
        }
      }
      
      const commonMap = {
        "ここは": " Koko wa ", "そこは": " Soko wa ", "あそこは": " Asoko wa ",
        "こちらは": " Kochira wa ", "そちらは": " Sochira wa ", "あちらは": " Achira wa ",
        "教室": "kyoushitsu", "食堂": "shokudou", "事務所": "jimusho", "会議室": "kaigishitsu",
        "受付": "uketsuke", "部屋": "heya", "お国": "okuni", "日本": "nihon", "車": "kuruma",
        "ベトナム": "Betonamu", "アメリカ": "Amerika", "イギリス": "Igirisu", "ブラジル": "Burajiru",
        "フランス": "Furansu", "タイ": "Tai", "中国": "Chuugoku", "韓国": "Kankoku",
        "ミラー": "Mira-", "サントス": "Santosu", "ワット": "Watto", "山田": "Yamada",
        "じゃありません": " ja arimasen ", "ですか": " desu ka ", "です": " desu ",
        "は": " wa ", "の": " no ", "も": " mo ", "に": " ni ", "で": " de ", "を": " o ", "が": " ga ",
        "どこ": " doko ", "どちら": " dochira ", "だれ": " dare ", "どなた": " donata ",
        "はい": " Hai, ", "いいえ": " Iie, ", "そうです": " sou desu ",
        "ー": " - ", "。": ". ", "？": "? "
      };
      
      for (const [key, val] of Object.entries(commonMap)) {
        rom = rom.replace(new RegExp(key, 'g'), val);
      }
      
      return rom.replace(/\s+/g, ' ').trim();
    };

    // 1. Tách Q&A
    let questionJa = undefined;
    let questionVi = undefined;
    let answerJa = rawJa;
    let answerVi = rawVi;
    
    // Kiểm tra xem có dấu phân tách đối thoại
    const dialogSeparators = ["ー", "―", "—", "->", "→", "\n"];
    let separatorUsed = "";
    for (const sep of dialogSeparators) {
      if (rawJa.includes(sep)) {
        separatorUsed = sep;
        break;
      }
    }
    
    if (separatorUsed) {
      const partsJa = rawJa.split(separatorUsed);
      const partsVi = rawVi.split(separatorUsed);
      if (partsJa.length >= 2) {
        questionJa = partsJa[0].trim().replace(/^Q:\s*/i, "");
        answerJa = partsJa[1].trim().replace(/^A:\s*/i, "");
      }
      if (partsVi.length >= 2) {
        questionVi = partsVi[0].trim().replace(/^Q:\s*/i, "");
        answerVi = partsVi[1].trim().replace(/^A:\s*/i, "");
      }
    } else if (rawJa.endsWith("か。") || rawJa.endsWith("か")) {
      // Nếu là câu hỏi đơn lẻ kết thúc bằng "か", biến thành câu hỏi Q, tự sinh câu trả lời ngắn phù hợp
      questionJa = rawJa;
      questionVi = rawVi;
      if (rawJa.includes("どこ")) {
        answerJa = rawJa.replace(/y?どこ/g, "ここ").replace(/ですか。?/g, "です。").replace(/\s+/g, " ");
        answerVi = rawVi.replace(/ở đâu\s*(vậy)?\??/gi, "ở đây.");
      } else if (rawJa.includes("どちら")) {
        answerJa = rawJa.replace(/どちら/g, "こちら").replace(/ですか。?/g, "です。").replace(/\s+/g, " ");
        answerVi = rawVi.replace(/phía nào\s*\??/gi, "phía này.").replace(/đằng nào\s*\??/gi, "đằng này.").replace(/ở đâu\s*(vậy)?\??/gi, "ở đây.");
      } else {
        answerJa = "はい、そうです。";
        answerVi = "Vâng, đúng vậy.";
      }
    }

    // Tách Q&A cho Romaji tương ứng
    let questionRomaji = undefined;
    let templateRomaji = "";
    
    if (rawRomaji) {
      let romajiSep = "";
      const romSeparators = [" ̄", "̄", " - ", " -", "- ", "—", "–", "ー"];
      for (const sep of romSeparators) {
        if (rawRomaji.includes(sep)) {
          romajiSep = sep;
          break;
        }
      }
      if (romajiSep) {
        const partsRom = rawRomaji.split(romajiSep);
        if (partsRom.length >= 2) {
          questionRomaji = partsRom[0].trim().replace(/^Q:\s*/i, "");
          templateRomaji = partsRom[1].trim().replace(/^A:\s*/i, "");
        } else {
          templateRomaji = rawRomaji;
        }
      } else if (rawJa.endsWith("か。") || rawJa.endsWith("か")) {
        questionRomaji = rawRomaji;
        if (rawJa.includes("どこ")) {
          templateRomaji = rawRomaji.replace(/doko/gi, "koko").replace(/desu\s*ka/gi, "desu").replace(/\s+/g, " ");
        } else if (rawJa.includes("どちら")) {
          templateRomaji = rawRomaji.replace(/dochira/gi, "kochira").replace(/desu\s*ka/gi, "desu").replace(/\s+/g, " ");
        } else {
          templateRomaji = "Hai, sou desu.";
        }
      } else {
        templateRomaji = rawRomaji;
      }
    } else {
      templateRomaji = getRomajiForSentence(answerJa, lessonVocab);
      questionRomaji = questionJa ? getRomajiForSentence(questionJa, lessonVocab) : undefined;
    }
    
    // 2. Tìm kiếm từ vựng so khớp để làm Slot Placeholder
    const sortedVocab = [...lessonVocab]
      .filter(v => v.hiragana || v.romaji)
      .sort((a, b) => (b.hiragana?.length || 0) - (a.hiragana?.length || 0));
      
    let matchedVocab = null;
    for (const v of sortedVocab) {
      if (v.hiragana) {
        if (answerJa.includes(v.hiragana)) {
          matchedVocab = v;
          break;
        }
        // Thử chuyển sang Katakana và kiểm tra
        const kata = toKatakana(v.hiragana);
        if (answerJa.includes(kata)) {
          // Ghi đè trường hiragana tạm thời để split chính xác
          matchedVocab = { ...v, hiragana: kata };
          break;
        }
      }
    }
    
    // 3. Xây dựng Slots & templateParts
    let templateParts = ["", ""];
    let slots: SubstitutionSlot[] = [];
    
    if (matchedVocab) {
      const parts = answerJa.split(matchedVocab.hiragana);
      templateParts = [parts[0], parts.slice(1).join(matchedVocab.hiragana)];
      
      // Tìm các từ vựng cùng loại làm options dropdown
      const sameTypeVocabs = lessonVocab
        .filter(v => v.word_type === matchedVocab.word_type && v.hiragana)
        .slice(0, 8)
        .map(v => ({
          ja: v.hiragana,
          vi: v.vietnamese_meaning,
          romaji: v.romaji
        }));
        
      if (!sameTypeVocabs.some(o => o.ja === matchedVocab.hiragana)) {
        sameTypeVocabs.unshift({
          ja: matchedVocab.hiragana,
          vi: matchedVocab.vietnamese_meaning,
          romaji: matchedVocab.romaji
        });
      }
      
      slots = [
        {
          id: "s1",
          label: matchedVocab.word_type || "Từ vựng",
          options: sameTypeVocabs
        }
      ];
    } else {
      // Fallback nếu không có từ vựng so khớp
      templateParts = [answerJa, ""];
    }
    
    return {
      grammarTitle: activeGrammar.title || `Ngữ Pháp ${grammarIndex + 1}`,
      templateParts,
      slots,
      getSynthesis: (vals) => {
        if (!vals.s1 || !matchedVocab) {
          return {
            ja: answerJa,
            romaji: templateRomaji,
            vi: answerVi,
            questionJa,
            questionVi,
            questionRomaji
          };
        }
        
        const finalJa = answerJa.replace(new RegExp(matchedVocab.hiragana, 'g'), vals.s1.ja);
        const finalVi = answerVi.replace(new RegExp(matchedVocab.vietnamese_meaning, 'gi'), vals.s1.vi);
        const finalRomaji = templateRomaji.replace(new RegExp(matchedVocab.romaji, 'gi'), vals.s1.romaji);
        
        let finalQJa = questionJa;
        let finalQVi = questionVi;
        let finalQRomaji = questionRomaji;
        if (questionJa && questionJa.includes(matchedVocab.hiragana)) {
          finalQJa = questionJa.replace(new RegExp(matchedVocab.hiragana, 'g'), vals.s1.ja);
        }
        if (questionVi) {
          finalQVi = questionVi.replace(new RegExp(matchedVocab.vietnamese_meaning, 'gi'), vals.s1.vi);
        }
        if (questionRomaji) {
          finalQRomaji = questionRomaji.replace(new RegExp(matchedVocab.romaji, 'gi'), vals.s1.romaji);
        }
        
        return {
          ja: finalJa,
          romaji: finalRomaji,
          vi: finalVi,
          questionJa: finalQJa,
          questionVi: finalQVi,
          questionRomaji: finalQRomaji
        };
      }
    };
  }

  // --- GENERAL STATIC FALLBACK (Nếu không load được DB) ---
  const nouns = lessonVocab.filter(v => v.word_type === 'noun' || !v.word_type).slice(0, 10).map(v => ({
    ja: v.hiragana,
    vi: v.vietnamese_meaning,
    romaji: v.romaji
  }));

  const placeholderOptions = nouns.length > 0 ? nouns : [{ ja: "本", vi: "sách", romaji: "hon" }];

  return {
    grammarTitle: `Mẫu Ngữ Pháp ${grammarIndex + 1}`,
    templateParts: ["Tôi đang học câu mẫu với từ: ", " trong Bài học này."],
    slots: [
      { id: "s1", label: "Danh từ", options: placeholderOptions }
    ],
    getSynthesis: (vals) => {
      if (!vals.s1) return { ja: '', vi: '', romaji: '' };
      return {
        ja: `${vals.s1.ja}です。`,
        romaji: `${vals.s1.romaji} desu.`,
        vi: `Đây là ${vals.s1.vi}.`
      };
    }
  };
}
