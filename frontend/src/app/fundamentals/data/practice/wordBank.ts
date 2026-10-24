export interface VerbEntry {
  dict_kana: string;
  dict_kanji: string;
  masu_kana: string;
  masu_kanji: string;
  meaning: string;
  group: 1 | 2 | 3;
  lesson: number;
  isSpecialException?: boolean; // e.g. かえります (G1), いきます (te: いって)
  te_kana: string;
  nai_kana: string;
  ta_kana: string;
  potential_kana?: string;
  volitional_kana?: string;
  ba_kana?: string;
  passive_kana?: string;
  causative_kana?: string;
}

export interface AdjEntry {
  kana: string;
  kanji: string;
  meaning: string;
  type: 'i' | 'na';
  lesson: number;
  isSpecialException?: boolean; // e.g. いい (よかった, よくない)
}

export const VERB_BANK: VerbEntry[] = [
  // Lesson 1 - 14
  { dict_kana: 'あう', dict_kanji: '会う', masu_kana: 'あいます', masu_kanji: '会います', meaning: 'gặp gỡ', group: 1, lesson: 4, te_kana: 'あって', nai_kana: 'あわない', ta_kana: 'あった', potential_kana: 'あえる', volitional_kana: 'あおう', ba_kana: 'あえば', passive_kana: 'あわれる', causative_kana: 'あわせる' },
  { dict_kana: 'いく', dict_kanji: '行く', masu_kana: 'いきます', masu_kanji: '行きます', meaning: 'đi', group: 1, lesson: 5, isSpecialException: true, te_kana: 'いって', nai_kana: 'いかない', ta_kana: 'いった', potential_kana: 'いける', volitional_kana: 'いこう', ba_kana: 'いけば', passive_kana: 'いかれる', causative_kana: 'いかせる' },
  { dict_kana: 'かえる', dict_kanji: '帰る', masu_kana: 'かえります', masu_kanji: '帰ります', meaning: 'trở về (nhóm 1 ngoại lệ)', group: 1, lesson: 5, isSpecialException: true, te_kana: 'かえって', nai_kana: 'かえらない', ta_kana: 'かえった', potential_kana: 'かえれる', volitional_kana: 'かえろう', ba_kana: 'かえれば', passive_kana: 'かえられる', causative_kana: 'かえらせる' },
  { dict_kana: 'のむ', dict_kanji: '飲む', masu_kana: 'のみます', masu_kanji: '飲みます', meaning: 'uống', group: 1, lesson: 6, te_kana: 'のんで', nai_kana: 'のまない', ta_kana: 'のんだ', potential_kana: 'のめる', volitional_kana: 'のもう', ba_kana: 'のめば', passive_kana: 'のまれる', causative_kana: 'のませる' },
  { dict_kana: 'たべる', dict_kanji: '食べる', masu_kana: 'たべます', masu_kanji: '食べます', meaning: 'ăn', group: 2, lesson: 6, te_kana: 'たべて', nai_kana: 'たべない', ta_kana: 'たべた', potential_kana: 'たべられる', volitional_kana: 'たべよう', ba_kana: 'たべれば', passive_kana: 'たべられる', causative_kana: 'たべさせる' },
  { dict_kana: 'みる', dict_kanji: '見る', masu_kana: 'みます', masu_kanji: '見ます', meaning: 'nhìn / xem', group: 2, lesson: 6, te_kana: 'みて', nai_kana: 'みない', ta_kana: 'みた', potential_kana: 'みられる', volitional_kana: 'みよう', ba_kana: 'みれば', passive_kana: 'みられる', causative_kana: 'みさせる' },
  { dict_kana: 'きく', dict_kanji: '聞く', masu_kana: 'ききます', masu_kanji: '聞きます', meaning: 'nghe / hỏi', group: 1, lesson: 6, te_kana: 'きいて', nai_kana: 'きかない', ta_kana: 'きいた', potential_kana: 'きける', volitional_kana: 'きこう', ba_kana: 'きけば', passive_kana: 'きかれる', causative_kana: 'きかせる' },
  { dict_kana: 'よむ', dict_kanji: '読む', masu_kana: 'よみます', masu_kanji: '読みます', meaning: 'đọc', group: 1, lesson: 6, te_kana: 'よんで', nai_kana: 'よまない', ta_kana: 'よんだ', potential_kana: 'よめる', volitional_kana: 'よもう', ba_kana: 'よめば', passive_kana: 'よまれる', causative_kana: 'よませる' },
  { dict_kana: 'かく', dict_kanji: '書く', masu_kana: 'かきます', masu_kanji: '書きます', meaning: 'viết', group: 1, lesson: 6, te_kana: 'かいて', nai_kana: 'かかない', ta_kana: 'かいた', potential_kana: 'かける', volitional_kana: 'かこう', ba_kana: 'かけば', passive_kana: 'かかれる', causative_kana: 'かかせる' },
  { dict_kana: 'かう', dict_kanji: '買う', masu_kana: 'かいます', masu_kanji: '買います', meaning: 'mua', group: 1, lesson: 6, te_kana: 'かって', nai_kana: 'かわない', ta_kana: 'かった', potential_kana: 'かえる', volitional_kana: 'かおう', ba_kana: 'かえば', passive_kana: 'かわれる', causative_kana: 'かわせる' },
  { dict_kana: 'する', dict_kanji: 'する', masu_kana: 'します', masu_kanji: 'します', meaning: 'làm', group: 3, lesson: 6, te_kana: 'して', nai_kana: 'しない', ta_kana: 'した', potential_kana: 'できる', volitional_kana: 'しよう', ba_kana: 'すれば', passive_kana: 'される', causative_kana: 'させる' },
  { dict_kana: 'くる', dict_kanji: '来る', masu_kana: 'きます', masu_kanji: '来ます', meaning: 'đến', group: 3, lesson: 5, te_kana: 'きて', nai_kana: 'こない', ta_kana: 'きた', potential_kana: 'こられる', volitional_kana: 'こよう', ba_kana: 'くれば', passive_kana: 'こられる', causative_kana: 'こさせる' },
  { dict_kana: 'きる', dict_kanji: '切る', masu_kana: 'きります', masu_kanji: '切ります', meaning: 'cắt (nhóm 1 ngoại lệ)', group: 1, lesson: 7, isSpecialException: true, te_kana: 'きって', nai_kana: 'きらない', ta_kana: 'きった', potential_kana: 'きれる', volitional_kana: 'きろう', ba_kana: 'きれば', passive_kana: 'きられる', causative_kana: 'きらせる' },
  { dict_kana: 'おくる', dict_kanji: '送る', masu_kana: 'おくります', masu_kanji: '送ります', meaning: 'gửi', group: 1, lesson: 7, te_kana: 'おくって', nai_kana: 'おくらない', ta_kana: 'おくった', potential_kana: 'おくれる', volitional_kana: 'おくろう', ba_kana: 'おくれば', passive_kana: 'おくられる', causative_kana: 'おくらせる' },
  { dict_kana: 'あげる', dict_kanji: 'あげる', masu_kana: 'あげます', masu_kanji: 'あげます', meaning: 'tặng', group: 2, lesson: 7, te_kana: 'あげて', nai_kana: 'あげない', ta_kana: 'あげた', potential_kana: 'あげられる', volitional_kana: 'あげよう', ba_kana: 'あげれば', passive_kana: 'あげられる', causative_kana: 'あげさせる' },
  { dict_kana: 'もらう', dict_kanji: 'もらう', masu_kana: 'もらいます', masu_kanji: 'もらいます', meaning: 'nhận', group: 1, lesson: 7, te_kana: 'もらって', nai_kana: 'もらわない', ta_kana: 'もらあった', potential_kana: 'もらえる', volitional_kana: 'もらおう', ba_kana: 'もらえば', passive_kana: 'もらわれる', causative_kana: 'もらわせる' },
  { dict_kana: 'かす', dict_kanji: '貸す', masu_kana: 'かします', masu_kanji: '貸します', meaning: 'cho mượn', group: 1, lesson: 7, te_kana: 'かして', nai_kana: 'かさない', ta_kana: 'かした', potential_kana: 'かせる', volitional_kana: 'かそう', ba_kana: 'かせば', passive_kana: 'かされる', causative_kana: 'かさせる' },
  { dict_kana: 'かりる', dict_kanji: '借りる', masu_kana: 'かります', masu_kanji: '借ります', meaning: 'mượn (nhóm 2)', group: 2, lesson: 7, isSpecialException: true, te_kana: 'かりて', nai_kana: 'かりない', ta_kana: 'かりた', potential_kana: 'かりられる', volitional_kana: 'かりよう', ba_kana: 'かりれば', passive_kana: 'かりられる', causative_kana: 'かりさせる' },
  { dict_kana: 'おしえる', dict_kanji: '教える', masu_kana: 'おしえます', masu_kanji: '教えます', meaning: 'dạy', group: 2, lesson: 7, te_kana: 'おしえて', nai_kana: 'おしえない', ta_kana: 'おしえた', potential_kana: 'おしえられる', volitional_kana: 'おしえよう', ba_kana: 'おしえれば', passive_kana: 'おしえられる', causative_kana: 'おしえさせる' },
  { dict_kana: 'ならう', dict_kanji: '習う', masu_kana: 'ならいます', masu_kanji: '習います', meaning: 'học', group: 1, lesson: 7, te_kana: 'ならって', nai_kana: 'ならわない', ta_kana: 'ならった', potential_kana: 'ならえる', volitional_kana: 'ならおう', ba_kana: 'ならえば', passive_kana: 'ならわれる', causative_kana: 'ならわせる' },
  { dict_kana: 'わかる', dict_kanji: '分かる', masu_kana: 'わかります', masu_kanji: '分かります', meaning: 'hiểu', group: 1, lesson: 9, te_kana: 'わかって', nai_kana: 'わからない', ta_kana: 'わかった', potential_kana: 'わかれる', volitional_kana: 'わかろう', ba_kana: 'わかれば', passive_kana: 'わかられる', causative_kana: 'わからせる' },
  { dict_kana: 'ある', dict_kanji: 'ある', masu_kana: 'あります', masu_kanji: 'あります', meaning: 'có (vật)', group: 1, lesson: 10, isSpecialException: true, te_kana: 'あって', nai_kana: 'ない', ta_kana: 'あった', potential_kana: 'ありえる', volitional_kana: 'あろう', ba_kana: 'あれば', passive_kana: 'あられる', causative_kana: 'あらせる' },
  { dict_kana: 'いる', dict_kanji: 'いる', masu_kana: 'います', masu_kanji: 'います', meaning: 'ở / có (người/vật sống)', group: 2, lesson: 10, te_kana: 'いて', nai_kana: 'いない', ta_kana: 'いた', potential_kana: 'いられる', volitional_kana: 'いよう', ba_kana: 'いれば', passive_kana: 'いられる', causative_kana: 'いさせる' },
  { dict_kana: 'かかる', dict_kanji: 'かかる', masu_kana: 'かかります', masu_kanji: 'かかります', meaning: 'mất (thời gian/tiền)', group: 1, lesson: 11, te_kana: 'かかって', nai_kana: 'かからない', ta_kana: 'かかった', potential_kana: 'かかれる', volitional_kana: 'かかろう', ba_kana: 'かかれば', passive_kana: 'かかられる', causative_kana: 'かからせる' },
  { dict_kana: 'あそぶ', dict_kanji: '遊ぶ', masu_kana: 'あそびます', masu_kanji: '遊びます', meaning: 'chơi', group: 1, lesson: 13, te_kana: 'あそんで', nai_kana: 'あそばない', ta_kana: 'あそんだ', potential_kana: 'あそべる', volitional_kana: 'あそぼう', ba_kana: 'あそべば', passive_kana: 'あそばれる', causative_kana: 'あそばせる' },
  { dict_kana: 'およぐ', dict_kanji: '泳ぐ', masu_kana: 'およぎます', masu_kanji: '泳ぎます', meaning: 'bơi', group: 1, lesson: 13, te_kana: 'およいで', nai_kana: 'およがない', ta_kana: 'およいだ', potential_kana: 'およげる', volitional_kana: 'およごう', ba_kana: 'およげば', passive_kana: 'およがれる', causative_kana: 'およがせる' },
  { dict_kana: 'まつ', dict_kanji: '待つ', masu_kana: 'まちます', masu_kanji: '待ちます', meaning: 'chờ', group: 1, lesson: 14, te_kana: 'まって', nai_kana: 'またない', ta_kana: 'まった', potential_kana: 'まてる', volitional_kana: 'まとう', ba_kana: 'まてば', passive_kana: 'またれる', causative_kana: 'またせる' },
  { dict_kana: 'いそぐ', dict_kanji: '急ぐ', masu_kana: 'いそぎます', masu_kanji: '急ぎます', meaning: 'vội vàng', group: 1, lesson: 14, te_kana: 'いそいで', nai_kana: 'いそがない', ta_kana: 'いそいだ', potential_kana: 'いそげる', volitional_kana: 'いそごう', ba_kana: 'いそげば', passive_kana: 'いそがれる', causative_kana: 'いそがせる' },
  { dict_kana: 'あける', dict_kanji: '開ける', masu_kana: 'あけます', masu_kanji: '開けます', meaning: 'mở', group: 2, lesson: 14, te_kana: 'あけて', nai_kana: 'あけない', ta_kana: 'あけた', potential_kana: 'あけられる', volitional_kana: 'あけよう', ba_kana: 'あければ', passive_kana: 'あけられる', causative_kana: 'あけさせる' },
  { dict_kana: 'しめる', dict_kanji: '閉める', masu_kana: 'しめます', masu_kanji: '閉めます', meaning: 'đóng', group: 2, lesson: 14, te_kana: 'しめて', nai_kana: 'しめない', ta_kana: 'しめた', potential_kana: 'しめられる', volitional_kana: 'しめよう', ba_kana: 'しめれば', passive_kana: 'しめられる', causative_kana: 'しめさせる' },
  { dict_kana: 'はいる', dict_kanji: '入る', masu_kana: 'はいります', masu_kanji: '入ります', meaning: 'vào (nhóm 1 ngoại lệ)', group: 1, lesson: 14, isSpecialException: true, te_kana: 'はいって', nai_kana: 'はいらない', ta_kana: 'はいった', potential_kana: 'はいれる', volitional_kana: 'はいろう', ba_kana: 'はいれば', passive_kana: 'はいられる', causative_kana: 'はいらせる' },
  { dict_kana: 'はしる', dict_kanji: '走る', masu_kana: 'はしります', masu_kanji: '走ります', meaning: 'chạy (nhóm 1 ngoại lệ)', group: 1, lesson: 14, isSpecialException: true, te_kana: 'はしって', nai_kana: 'はしらない', ta_kana: 'はしった', potential_kana: 'はしれる', volitional_kana: 'はしろう', ba_kana: 'はしれば', passive_kana: 'はしられる', causative_kana: 'はしらせる' },
];

export const ADJ_BANK: AdjEntry[] = [
  { kana: 'おおきい', kanji: '大きい', meaning: 'to lớn', type: 'i', lesson: 8 },
  { kana: 'ちいさい', kanji: '小さい', meaning: 'nhỏ bé', type: 'i', lesson: 8 },
  { kana: 'あたらしい', kanji: '新しい', meaning: 'mới', type: 'i', lesson: 8 },
  { kana: 'ふるい', kanji: '古い', meaning: 'cũ', type: 'i', lesson: 8 },
  { kana: 'いい', kanji: 'いい', meaning: 'tốt (ngoại lệ)', type: 'i', lesson: 8, isSpecialException: true },
  { kana: 'わるい', kanji: '悪い', meaning: 'xấu / tồi', type: 'i', lesson: 8 },
  { kana: 'あつい', kanji: '暑い', meaning: 'nóng', type: 'i', lesson: 8 },
  { kana: 'さむい', kanji: '寒い', meaning: 'lạnh', type: 'i', lesson: 8 },
  { kana: 'むずかしい', kanji: '難しい', meaning: 'khó', type: 'i', lesson: 8 },
  { kana: 'やさしい', kanji: '易しい', meaning: 'dễ', type: 'i', lesson: 8 },
  { kana: 'たかい', kanji: '高い', meaning: 'đắt / cao', type: 'i', lesson: 8 },
  { kana: 'やすい', kanji: '安い', meaning: 'rẻ', type: 'i', lesson: 8 },
  { kana: 'おいしい', kanji: 'おいしい', meaning: 'ngon', type: 'i', lesson: 8 },
  { kana: 'しずか', kanji: '静か', meaning: 'yên tĩnh', type: 'na', lesson: 8 },
  { kana: 'にぎやか', kanji: '賑やか', meaning: 'náo nhiệt', type: 'na', lesson: 8 },
  { kana: 'ゆうめい', kanji: '有名', meaning: 'nổi tiếng', type: 'na', lesson: 8 },
  { kana: 'しんせつ', kanji: '親切', meaning: 'tốt bụng', type: 'na', lesson: 8 },
  { kana: 'げんき', kanji: '元気', meaning: 'khoẻ mạnh', type: 'na', lesson: 8 },
  { kana: 'ひま', kanji: '暇', meaning: 'rảnh rỗi', type: 'na', lesson: 8 },
  { kana: 'べんり', kanji: '便利', meaning: 'tiện lợi', type: 'na', lesson: 8 },
];
