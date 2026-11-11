export type Lesson6Topic = 'particles' | 'nan_nani';
export type Lesson6ParticleMode = 'hira' | 'kanji' | 'mixed';
export type Lesson6NanMode = 'reading' | 'fill_question' | 'mixed';

export interface Lesson6Option {
  id: string;
  label: string;
  subLabel?: string;
}

export interface Lesson6PracticeQuestion {
  topic: Lesson6Topic;
  promptBadge: string;
  badgeText: string;
  badgeTone: 'indigo' | 'amber' | 'emerald' | 'rose';
  promptMain: string;
  promptSub: string;
  contextHint: string;
  ttsFullAnswer: string;
  correctId: string;
  correctDisplay: string;
  fullExplanationTitle: string;
  fullExplanationSub: string;
  options: Lesson6Option[];
  trapNote: string;
}

interface ParticlePair {
  id: string;
  hira: string;
  kanji: string;
}

export interface Lesson6ParticleBankItem {
  id: string;
  categoryBadge: string;
  badgeTone: 'indigo' | 'amber' | 'emerald' | 'rose';
  promptHira: string;
  promptKanji: string;
  vnMeaning: string;
  ttsFullAnswer: string;
  fullSentenceKanji: string;
  fullSentenceHira: string;
  correct: ParticlePair;
  traps: [ParticlePair, ParticlePair, ParticlePair];
  trapNote: string;
}

export interface Lesson6NanNaniBankItem {
  id: string;
  subType: 'reading' | 'fill_question';
  categoryBadge: string;
  badgeTone: 'indigo' | 'amber' | 'emerald' | 'rose';
  promptMain: string;
  promptSub: string;
  contextHint: string;
  ttsFullAnswer: string;
  fullSentenceKanji: string;
  fullSentenceHira: string;
  correct: Lesson6Option;
  traps: [Lesson6Option, Lesson6Option, Lesson6Option];
  trapNote: string;
}

export function fisherYatesShuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Ngân hàng 28 câu trắc nghiệm Trợ từ Bài 6 & Đối chiếu ngoại lệ Bài 1–6
 * Phủ kín: N を V, N を します, 友達に 会います (cấm を), Địa điểm で vs Đích đến へ vs Phương tiện で,
 * 何も + ∅ + V-ません (cấm を), Người と vs 一人で, Thời gian có số に vs Thời gian tương đối ∅, câu ghép 2 trợ từ.
 */
export const LESSON6_PARTICLE_BANK: Lesson6ParticleBankItem[] = [
  {
    id: 'l6_p1',
    categoryBadge: '🍞 Ngoại động từ + を',
    badgeTone: 'indigo',
    promptHira: 'まいあさ パン 【 ？ 】 たべます。',
    promptKanji: '毎朝 パン 【 ？ 】 食べます。',
    vnMeaning: 'Mỗi sáng tôi ăn bánh mì.',
    ttsFullAnswer: 'まいあさ パンを たべます。',
    fullSentenceKanji: '毎朝 パンを 食べます。',
    fullSentenceHira: 'まいあさ パンを たべます。',
    correct: { id: 'wo', hira: 'を', kanji: 'を' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
    ],
    trapNote:
      'パン (bánh mì) là tân ngữ trực tiếp chịu tác động của ngoại động từ 食べます (ăn) → bắt buộc dùng trợ từ を.',
  },
  {
    id: 'l6_p2',
    categoryBadge: '⚠️ Bẫy số 1: 会います',
    badgeTone: 'rose',
    promptHira: 'あした ともだち 【 ？ 】 あいます。',
    promptKanji: 'あした 友達 【 ？ 】 会います。',
    vnMeaning: 'Ngày mai tôi gặp bạn.',
    ttsFullAnswer: 'あした ともだちに あいます。',
    fullSentenceKanji: 'あした 友達に 会います。',
    fullSentenceHira: 'あした ともだちに あいます。',
    correct: { id: 'ni', hira: 'に', kanji: 'に' },
    traps: [
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
    ],
    trapNote:
      'Bẫy kinh điển Bài 6: Động từ 会います (gặp ai đó) BẮT BUỘC đi với trợ từ に (友達に 会います), tuyệt đối KHÔNG dùng を!',
  },
  {
    id: 'l6_p3',
    categoryBadge: '📍 Nơi diễn ra hành động',
    badgeTone: 'emerald',
    promptHira: 'えき 【 ？ 】 しんぶんを かいます。',
    promptKanji: '駅 【 ？ 】 新聞を 買います。',
    vnMeaning: 'Tôi mua báo ở nhà ga.',
    ttsFullAnswer: 'えきで しんぶんを かいます。',
    fullSentenceKanji: '駅で 新聞を 買います。',
    fullSentenceHira: 'えきで しんぶんを かいます。',
    correct: { id: 'de', hira: 'で', kanji: 'で' },
    traps: [
      { id: 'he', hira: 'へ', kanji: 'へ' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'wo', hira: 'を', kanji: 'を' },
    ],
    trapNote:
      'Hành động "mua báo" (新聞を 買います) diễn ra bên trong địa điểm "nhà ga" (駅) → dùng trợ từ で (còn 駅へ chỉ dùng với 行きます・来ます・帰ります).',
  },
  {
    id: 'l6_p4',
    categoryBadge: '🧭 Phân biệt へ vs で',
    badgeTone: 'amber',
    promptHira: 'にちようび きょうと 【 ？ 】 いきます。',
    promptKanji: '日曜日 京都 【 ？ 】 行きます。',
    vnMeaning: 'Chủ nhật tôi đi Kyoto.',
    ttsFullAnswer: 'にちようび きょうとへ いきます。',
    fullSentenceKanji: '日曜日 京都へ 行きます。',
    fullSentenceHira: 'にちようび きょうとへ いきます。',
    correct: { id: 'he', hira: 'へ', kanji: 'へ' },
    traps: [
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'to', hira: 'と', kanji: 'と' },
    ],
    trapNote:
      'Động từ phía sau là 行きます (di chuyển tới đích đến 京都) → dùng trợ từ chỉ hướng へ (không dùng で vì 京都 không phải phương tiện hay nơi diễn ra ngoại động từ).',
  },
  {
    id: 'l6_p5',
    categoryBadge: '⚠️ Phủ định hoàn toàn',
    badgeTone: 'rose',
    promptHira: 'けさ なに 【 ？ 】 たべませんでした。',
    promptKanji: 'けさ 何 【 ？ 】 食べませんでした。',
    vnMeaning: 'Sáng nay tôi đã không ăn gì cả.',
    ttsFullAnswer: 'けさ なにも たべませんでした。',
    fullSentenceKanji: 'けさ 何も 食べませんでした。',
    fullSentenceHira: 'けさ なにも たべませんでした。',
    correct: { id: 'mo', hira: 'も', kanji: 'も' },
    traps: [
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'womo', hira: 'をも', kanji: 'をも' },
      { id: 'ni', hira: 'に', kanji: 'に' },
    ],
    trapNote:
      'Mẫu phủ định hoàn toàn: 何も (なにも) + V-ません = "không ... gì cả". Trợ từ も thay thế hoàn toàn を (cấm viết 何を hay 何をも!).',
  },
  {
    id: 'l6_p6',
    categoryBadge: '⚠️ Bẫy dư を sau 何も',
    badgeTone: 'rose',
    promptHira: 'にちようびは なにも 【 ？ 】 しません。',
    promptKanji: '日曜日は 何も 【 ？ 】 しません。',
    vnMeaning: 'Chủ nhật tôi không làm gì cả.',
    ttsFullAnswer: 'にちようびは なにも しません。',
    fullSentenceKanji: '日曜日は 何も しません。',
    fullSentenceHira: 'にちようびは なにも しません。',
    correct: { id: 'none', hira: '∅ (Không dùng trợ từ)', kanji: '∅ (Không dùng trợ từ)' },
    traps: [
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'ni', hira: 'に', kanji: 'に' },
    ],
    trapNote:
      'Trong cụm 何も しません, trợ từ も đã nuốt mất trợ từ を → tuyệt đối KHÔNG chèn thêm を vào sau 何も!',
  },
  {
    id: 'l6_p7',
    categoryBadge: '⚽ Mẫu N を します',
    badgeTone: 'indigo',
    promptHira: 'どようび サッカー 【 ？ 】 します。',
    promptKanji: '土曜日 サッカー 【 ？ 】 します。',
    vnMeaning: 'Thứ Bảy tôi chơi bóng đá.',
    ttsFullAnswer: 'どようび サッカーを します。',
    fullSentenceKanji: '土曜日 サッカーを します。',
    fullSentenceHira: 'どようび サッカーを します。',
    correct: { id: 'wo', hira: 'を', kanji: 'を' },
    traps: [
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
    ],
    trapNote:
      'Các danh từ chỉ môn thể thao / trò chơi (サッカー, テニス...) đi với します luôn dùng trợ từ を: サッカーを します.',
  },
  {
    id: 'l6_p8',
    categoryBadge: '🌸 Sự kiện + を します',
    badgeTone: 'indigo',
    promptHira: 'ともだちと おはなみ 【 ？ 】 します。',
    promptKanji: '友達と お花見 【 ？ 】 します。',
    vnMeaning: 'Tôi ngắm hoa anh đào cùng với bạn.',
    ttsFullAnswer: 'ともだちと おはなみを します。',
    fullSentenceKanji: '友達と お花見を します。',
    fullSentenceHira: 'ともだちと おはなみを します。',
    correct: { id: 'wo', hira: 'を', kanji: 'を' },
    traps: [
      { id: 'he', hira: 'へ', kanji: 'へ' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'de', hira: 'で', kanji: 'で' },
    ],
    trapNote:
      'お花見 (ngắm hoa anh đào), パーティー (bữa tiệc), 会議 (cuộc họp) là danh từ chỉ sự kiện → kết hợp thành お花見を します.',
  },
  {
    id: 'l6_p9',
    categoryBadge: '📍 Hành động tại đâu',
    badgeTone: 'emerald',
    promptHira: 'にわ 【 ？ 】 しゃしんを とります。',
    promptKanji: '庭 【 ？ 】 写真を 撮ります。',
    vnMeaning: 'Tôi chụp ảnh ở sân vườn.',
    ttsFullAnswer: 'にわで しゃしんを とります。',
    fullSentenceKanji: '庭で 写真を 撮ります。',
    fullSentenceHira: 'にわで しゃしんを とります。',
    correct: { id: 'de', hira: 'で', kanji: 'で' },
    traps: [
      { id: 'he', hira: 'へ', kanji: 'へ' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'wo', hira: 'を', kanji: 'を' },
    ],
    trapNote:
      '庭 (sân vườn) là địa điểm nơi hành động chụp ảnh diễn ra → dùng 庭で (hỏi bằng どこで 写真を 撮りますか).',
  },
  {
    id: 'l6_p10',
    categoryBadge: '📷 Tân ngữ + を',
    badgeTone: 'indigo',
    promptHira: 'こうえんで しゃしん 【 ？ 】 とりました。',
    promptKanji: '公園で 写真 【 ？ 】 撮りました。',
    vnMeaning: 'Tôi đã chụp ảnh ở công viên.',
    ttsFullAnswer: 'こうえんで しゃしんを とりました。',
    fullSentenceKanji: '公園で 写真を 撮りました。',
    fullSentenceHira: 'こうえんで しゃしんを とりました。',
    correct: { id: 'wo', hira: 'を', kanji: 'を' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'to', hira: 'と', kanji: 'と' },
    ],
    trapNote:
      'Cụm cố định Bài 6: 写真を 撮ります (chụp ảnh). 公園で chỉ nơi diễn ra hành động, còn 写真 là tân ngữ nên đi với を.',
  },
  {
    id: 'l6_p11',
    categoryBadge: '⚠️ Hỏi gặp ai (会います)',
    badgeTone: 'rose',
    promptHira: 'えきで だれ 【 ？ 】 あいましたか。',
    promptKanji: '駅で だれ 【 ？ 】 会いましたか。',
    vnMeaning: 'Bạn đã gặp ai ở nhà ga vậy?',
    ttsFullAnswer: 'えきで だれに あいましたか。',
    fullSentenceKanji: '駅で だれに 会いましたか。',
    fullSentenceHira: 'えきで だれに あいましたか。',
    correct: { id: 'ni', hira: 'に', kanji: 'に' },
    traps: [
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
    ],
    trapNote:
      'Vì 会います đi với trợ từ に (友達に 会います), nên khi đặt câu hỏi "gặp ai" bắt buộc dùng だれに 会いましたか (cấm dùng だれを!).',
  },
  {
    id: 'l6_p12',
    categoryBadge: '👨‍👩‍👧 Cùng với ai (と)',
    badgeTone: 'emerald',
    promptHira: 'まいばん かぞく 【 ？ 】 ばんごはんを たべます。',
    promptKanji: '毎晩 家族 【 ？ 】 晩ごはんを 食べます。',
    vnMeaning: 'Mỗi tối tôi ăn cơm tối cùng với gia đình.',
    ttsFullAnswer: 'まいばん かぞくと ばんごはんを たべます。',
    fullSentenceKanji: '毎晩 家族と 晩ごはんを 食べます。',
    fullSentenceHira: 'まいばん かぞくと ばんごはんを たべます。',
    correct: { id: 'to', hira: 'と', kanji: 'と' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'wo', hira: 'を', kanji: 'を' },
    ],
    trapNote:
      'Danh từ chỉ người (家族 - gia đình) thực hiện hành động cùng mình → dùng trợ từ と (cùng với).',
  },
  {
    id: 'l6_p13',
    categoryBadge: '⚠️ Ngoại lệ Một mình',
    badgeTone: 'rose',
    promptHira: 'ひるごはんは ひとり 【 ？ 】 たべます。',
    promptKanji: '昼ごはんは 一人 【 ？ 】 食べます。',
    vnMeaning: 'Bữa trưa tôi ăn một mình.',
    ttsFullAnswer: 'ひるごはんは ひとりで たべます。',
    fullSentenceKanji: '昼ごはんは 一人で 食べます。',
    fullSentenceHira: 'ひるごはんは ひとりで たべます。',
    correct: { id: 'de', hira: 'で', kanji: 'で' },
    traps: [
      { id: 'to', hira: 'と', kanji: 'と' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'wo', hira: 'を', kanji: 'を' },
    ],
    trapNote:
      'Làm / ăn / đi một mình luôn cố định là 一人で (ひとりで), tuyệt đối KHÔNG dùng trợ từ と!',
  },
  {
    id: 'l6_p14',
    categoryBadge: '⚠️ Ngoại lệ Đi bộ',
    badgeTone: 'rose',
    promptHira: 'まいにち あるいて 【 ？ 】 かいしゃへ いきます。',
    promptKanji: '毎日 歩いて 【 ？ 】 会社へ 行きます。',
    vnMeaning: 'Mỗi ngày tôi đi bộ đến công ty.',
    ttsFullAnswer: 'まいにち あるいて かいしゃへ いきます。',
    fullSentenceKanji: '毎日 歩いて 会社へ 行きます。',
    fullSentenceHira: 'まいにち あるいて かいしゃへ いきます。',
    correct: { id: 'none', hira: '∅ (Không dùng trợ từ)', kanji: '∅ (Không dùng trợ từ)' },
    traps: [
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
      { id: 'ni', hira: 'に', kanji: 'に' },
    ],
    trapNote:
      'Ôn bẫy Bài 5–6: 歩いて (あるいて - đi bộ) KHÔNG thêm trợ từ で phía sau (khác với 電車で, バスで, 自転車で).',
  },
  {
    id: 'l6_p15',
    categoryBadge: '🚆 Phương tiện + で',
    badgeTone: 'amber',
    promptHira: 'わたしは でんしゃ 【 ？ 】 とうきょうへ いきます。',
    promptKanji: 'わたしは 電車 【 ？ 】 東京へ 行きます。',
    vnMeaning: 'Tôi đi Tokyo bằng tàu điện.',
    ttsFullAnswer: 'わたしは でんしゃで とうきょうへ いきます。',
    fullSentenceKanji: 'わたしは 電車で 東京へ 行きます。',
    fullSentenceHira: 'わたしは でんしゃで とうきょうへ いきます。',
    correct: { id: 'de', hira: 'で', kanji: 'で' },
    traps: [
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'to', hira: 'と', kanji: 'と' },
    ],
    trapNote:
      'Trợ từ で ở đây mang chức năng chỉ phương tiện giao thông (Bài 5): 電車で = bằng tàu điện (khác với 駅で 買います = tại nhà ga ở Bài 6).',
  },
  {
    id: 'l6_p16',
    categoryBadge: '❓ Hỏi nơi hành động',
    badgeTone: 'emerald',
    promptHira: '【 ？ 】 ひるごはんを たべますか。 ー かいしゃの しょくどうです。',
    promptKanji: '【 ？ 】 昼ごはんを 食べますか。 ー 会社の 食堂です。',
    vnMeaning: 'Bạn ăn trưa ở đâu? — Ở nhà ăn của công ty.',
    ttsFullAnswer: 'どこで ひるごはんを たべますか。 かいしゃの しょくどうです。',
    fullSentenceKanji: 'どこで 昼ごはんを 食べますか。',
    fullSentenceHira: 'どこで ひるごはんを たべますか。',
    correct: { id: 'dokode', hira: 'どこで', kanji: 'どこで' },
    traps: [
      { id: 'dokohe', hira: 'どこへ', kanji: 'どこへ' },
      { id: 'naniwo', hira: 'なにを', kanji: '何を' },
      { id: 'itsuni', hira: 'いつに', kanji: 'いつに' },
    ],
    trapNote:
      'Hỏi địa điểm diễn ra hành động "ăn trưa" bắt buộc dùng どこで (ở đâu), không dùng どこへ (đi đâu).',
  },
  {
    id: 'l6_p17',
    categoryBadge: '⏰ Thời điểm có số + に',
    badgeTone: 'indigo',
    promptHira: 'まいあさ 7じ 【 ？ 】 あさごはんを たべます。',
    promptKanji: '毎朝 7時 【 ？ 】 朝ごはんを 食べます。',
    vnMeaning: 'Mỗi sáng tôi ăn sáng vào lúc 7 giờ.',
    ttsFullAnswer: 'まいあさ しちじに あさごはんを たべます。',
    fullSentenceKanji: '毎朝 7時に 朝ごはんを 食べます。',
    fullSentenceHira: 'まいあさ 7じに あさごはんを たべます。',
    correct: { id: 'ni', hira: 'に', kanji: 'に' },
    traps: [
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
    ],
    trapNote:
      '7時 (7 giờ) là mốc thời gian xác định có con số cụ thể → bắt buộc dùng trợ từ に (7時に).',
  },
  {
    id: 'l6_p18',
    categoryBadge: '⚠️ Thời gian không dùng に',
    badgeTone: 'rose',
    promptHira: 'あした 【 ？ 】 デパートで くつを かいます。',
    promptKanji: 'あした 【 ？ 】 デパートで 靴を 買います。',
    vnMeaning: 'Ngày mai tôi sẽ mua giày ở trung tâm thương mại.',
    ttsFullAnswer: 'あした デパートで くつを かいます。',
    fullSentenceKanji: 'あした デパートで 靴を 買います。',
    fullSentenceHira: 'あした デパートで くつを かいます。',
    correct: { id: 'none', hira: '∅ (Không dùng trợ từ)', kanji: '∅ (Không dùng trợ từ)' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'wo', hira: 'を', kanji: 'を' },
    ],
    trapNote:
      'あした (ngày mai), きのう, きょう, まいにち, らいしゅう, いつ là các từ chỉ thời gian tương đối → KHÔNG thêm trợ từ に!',
  },
  {
    id: 'l6_p19',
    categoryBadge: '💬 Từ chối khéo (は)',
    badgeTone: 'amber',
    promptHira: 'A: あした えいがを みませんか。 B: すみません、あした 【 ？ 】 ちょっと…。',
    promptKanji: 'A: あした 映画を 見ませんか。 B: すみません、あした 【 ？ 】 ちょっと…。',
    vnMeaning: 'A: Mai cùng xem phim nhé? — B: Xin lỗi, ngày mai thì hơi bất tiện một chút...',
    ttsFullAnswer: 'すみません、あしたは ちょっと。',
    fullSentenceKanji: 'すみません、あしたは ちょっと…。',
    fullSentenceHira: 'すみません、あしたは ちょっと…。',
    correct: { id: 'wa', hira: 'は', kanji: 'は' },
    traps: [
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
    ],
    trapNote:
      'Mẫu giao tiếp văn hóa Nhật ở Bài 6: Khi từ chối lời mời V-ませんか, người Nhật dùng 「すみません、[thời gian] は ちょっと…」 để từ chối khéo thay vì nói thẳng 行きません.',
  },
  {
    id: 'l6_p20',
    categoryBadge: '🤝 Mời rủ lịch sự',
    badgeTone: 'indigo',
    promptHira: 'いっしょに こうべへ いきません 【 ？ 】。',
    promptKanji: 'いっしょに 神戸へ 行きません 【 ？ 】。',
    vnMeaning: 'Anh/chị cùng đi Kobe với tôi nhé?',
    ttsFullAnswer: 'いっしょに こうべへ いきませんか。',
    fullSentenceKanji: 'いっしょに 神戸へ 行きませんか。',
    fullSentenceHira: 'いっしょに こうべへ いきませんか。',
    correct: { id: 'ka', hira: 'か', kanji: 'か' },
    traps: [
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'ni', hira: 'に', kanji: 'に' },
    ],
    trapNote:
      'Mẫu mời rủ lịch sự tôn trọng ý kiến người nghe ở Bài 6: V-ませんか (いっしょに 神戸へ 行きませんか).',
  },
  {
    id: 'l6_p21',
    categoryBadge: '🔗 N1 の N2 (Nội dung)',
    badgeTone: 'indigo',
    promptHira: 'うちで にほんご 【 ？ 】 てがみを かきます。',
    promptKanji: 'うちで 日本語 【 ？ 】 手紙を 書きます。',
    vnMeaning: 'Ở nhà tôi viết bức thư bằng tiếng Nhật (thư tiếng Nhật).',
    ttsFullAnswer: 'うちで にほんごの てがみを かきます。',
    fullSentenceKanji: 'うちで 日本語の 手紙を 書きます。',
    fullSentenceHira: 'うちで にほんごの てがみを かきます。',
    correct: { id: 'no', hira: 'の', kanji: 'の' },
    traps: [
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'ni', hira: 'に', kanji: 'に' },
    ],
    trapNote:
      'Hai danh từ 日本語 (tiếng Nhật) và 手紙 (bức thư) nối trực tiếp với nhau tạo cụm danh từ "bức thư tiếng Nhật" → dùng trợ từ の (日本語の 手紙).',
  },
  {
    id: 'l6_p22',
    categoryBadge: '🛍️ Giao tiếp mua hàng',
    badgeTone: 'emerald',
    promptHira: 'すみません、その ワイン 【 ？ 】 ください。',
    promptKanji: 'すみません、その ワイン 【 ？ 】 ください。',
    vnMeaning: 'Xin lỗi, cho tôi lấy chai rượu vang đó.',
    ttsFullAnswer: 'すみません、その ワインを ください。',
    fullSentenceKanji: 'すみません、その ワインを ください。',
    fullSentenceHira: 'すみません、その ワインを ください。',
    correct: { id: 'wo', hira: 'を', kanji: 'を' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
    ],
    trapNote:
      'Mẫu gọi món / mua hàng N を ください (Bài 3 & Bài 6): Danh từ món đồ cần mua đi với trợ từ tân ngữ を.',
  },
  {
    id: 'l6_p23',
    categoryBadge: '🧩 Ghép 2 trợ từ: で + を',
    badgeTone: 'emerald',
    promptHira: 'レストラン 【 ① 】 ばんごはん 【 ② 】 たべます。',
    promptKanji: 'レストラン 【 ① 】 晩ごはん 【 ② 】 食べます。',
    vnMeaning: 'Tôi ăn tối ở nhà hàng.',
    ttsFullAnswer: 'レストランで ばんごはんを たべます。',
    fullSentenceKanji: 'レストランで 晩ごはんを 食べます。',
    fullSentenceHira: 'レストランで ばんごはんを たべます。',
    correct: { id: 'de_wo', hira: '① で ／ ② を', kanji: '① で ／ ② を' },
    traps: [
      { id: 'he_wo', hira: '① へ ／ ② を', kanji: '① へ ／ ② を' },
      { id: 'ni_wo', hira: '① に ／ ② を', kanji: '① に ／ ② を' },
      { id: 'de_ni', hira: '① で ／ ② に', kanji: '① で ／ ② に' },
    ],
    trapNote:
      'レストラン (nhà hàng = nơi diễn ra hành động) + で; 晩ごはん (bữa tối = tân ngữ của 食べます) + を.',
  },
  {
    id: 'l6_p24',
    categoryBadge: '🧩 Phân biệt へ và で',
    badgeTone: 'amber',
    promptHira: 'デパート 【 ① 】 いきます。それから、デパート 【 ② 】 くつを かいます。',
    promptKanji: 'デパート 【 ① 】 行きます。それから、デパート 【 ② 】 靴を 買います。',
    vnMeaning: 'Tôi đi đến trung tâm thương mại. Sau đó, tôi mua giày ở trung tâm thương mại.',
    ttsFullAnswer: 'デパートへ いきます。それから、デパートで くつを かいます。',
    fullSentenceKanji: 'デパートへ 行きます。それから、デパートで 靴を 買います。',
    fullSentenceHira: 'デパートへ いきます。それから、デパートで くつを かいます。',
    correct: { id: 'he_de', hira: '① へ ／ ② で', kanji: '① へ ／ ② で' },
    traps: [
      { id: 'de_he', hira: '① で ／ ② へ', kanji: '① で ／ ② へ' },
      { id: 'de_de', hira: '① で ／ ② で', kanji: '① で ／ ② で' },
      { id: 'ni_wo', hira: '① に ／ ② を', kanji: '① に ／ ② を' },
    ],
    trapNote:
      'Cùng một từ デパート nhưng câu 1 đi với 行きます (di chuyển tới đích) nên dùng へ; câu 2 đi với 靴を 買います (mua sắm tại đó) nên dùng で!',
  },
  {
    id: 'l6_p25',
    categoryBadge: '🧩 Ghép で + に (会います)',
    badgeTone: 'rose',
    promptHira: 'ロビー 【 ① 】 ミラーさん 【 ② 】 あいました。',
    promptKanji: 'ロビー 【 ① 】 ミラーさん 【 ② 】 会いました。',
    vnMeaning: 'Tôi đã gặp anh Miller ở sảnh.',
    ttsFullAnswer: 'ロビーで ミラーさんに あいました。',
    fullSentenceKanji: 'ロビーで ミラーさんに 会いました。',
    fullSentenceHira: 'ロビーで ミラーさんに あいました。',
    correct: { id: 'de_ni', hira: '① で ／ ② に', kanji: '① で ／ ② に' },
    traps: [
      { id: 'de_wo', hira: '① で ／ ② を', kanji: '① で ／ ② を' },
      { id: 'he_ni', hira: '① へ ／ ② に', kanji: '① へ ／ ② に' },
      { id: 'ni_wo', hira: '① に ／ ② を', kanji: '① に ／ ② を' },
    ],
    trapNote:
      'ロビー (sảnh = nơi cuộc gặp diễn ra) + で; ミラーさん (người mình gặp với động từ 会いました) + に (tuyệt đối không dùng を!).',
  },
  {
    id: 'l6_p26',
    categoryBadge: '🧩 Ghép と + を',
    badgeTone: 'indigo',
    promptHira: 'ともだち 【 ① 】 テニス 【 ② 】 します。',
    promptKanji: '友達 【 ① 】 テニス 【 ② 】 します。',
    vnMeaning: 'Tôi chơi quần vợt cùng với bạn.',
    ttsFullAnswer: 'ともだちと テニスを します。',
    fullSentenceKanji: '友達と テニスを します。',
    fullSentenceHira: 'ともだちと テニスを します。',
    correct: { id: 'to_wo', hira: '① と ／ ② を', kanji: '① と ／ ② を' },
    traps: [
      { id: 'ni_wo', hira: '① に ／ ② を', kanji: '① に ／ ② を' },
      { id: 'de_wo', hira: '① で ／ ② を', kanji: '① で ／ ② を' },
      { id: 'to_de', hira: '① と ／ ② で', kanji: '① と ／ ② で' },
    ],
    trapNote:
      '友達 (người chơi cùng) + と; テニス (môn thể thao đi với します) + を → 友達と テニスを します.',
  },
  {
    id: 'l6_p27',
    categoryBadge: '🔄 Đối chiếu どこへも (B.5)',
    badgeTone: 'amber',
    promptHira: 'きのうは どこへ 【 ？ 】 いきませんでした。',
    promptKanji: 'きのうは どこへ 【 ？ 】 行きませんでした。',
    vnMeaning: 'Hôm qua tôi đã không đi đâu cả.',
    ttsFullAnswer: 'きのうは どこへも いきませんでした。',
    fullSentenceKanji: 'きのうは どこへも 行きませんでした。',
    fullSentenceHira: 'きのうは どこへも いきませんでした。',
    correct: { id: 'mo', hira: 'も', kanji: 'も' },
    traps: [
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'de', hira: 'で', kanji: 'で' },
    ],
    trapNote:
      'Đối chiếu Bài 5 & Bài 6: Với どこへ có thể giữ へ + thêm も (どこへも 行きませんでした), còn với tân ngữ Bài 6 thì も nuốt hẳn を (何も 食べませんでした).',
  },
  {
    id: 'l6_p28',
    categoryBadge: '🧩 Thời điểm に + Tân ngữ を',
    badgeTone: 'indigo',
    promptHira: 'まいばん 10じ 【 ① 】 ぎゅうにゅう 【 ② 】 のみます。',
    promptKanji: '毎晩 10時 【 ① 】 牛乳 【 ② 】 飲みます。',
    vnMeaning: 'Mỗi tối vào lúc 10 giờ tôi uống sữa bò.',
    ttsFullAnswer: 'まいばん じゅうじに ぎゅうにゅうを のみます。',
    fullSentenceKanji: '毎晩 10時に 牛乳を 飲みます。',
    fullSentenceHira: 'まいばん 10じに ぎゅうにゅうを のみます。',
    correct: { id: 'ni_wo', hira: '① に ／ ② を', kanji: '① に ／ ② を' },
    traps: [
      { id: 'de_wo', hira: '① で ／ ② を', kanji: '① で ／ ② を' },
      { id: 'none_wo', hira: '① ∅ ／ ② を', kanji: '① ∅ ／ ② を' },
      { id: 'ni_de', hira: '① に ／ ② で', kanji: '① に ／ ② で' },
    ],
    trapNote:
      '10時 (mốc giờ có con số cụ thể) bắt buộc đi với に; 牛乳 (sữa bò = thức uống chịu tác động của 飲みます) đi với を.',
  },
];

/**
 * Ngân hàng 24 câu trắc nghiệm Quy tắc đọc chữ 何: なん (nan) vs なに (nani)
 * - 14 câu 'reading': Nhìn câu có cụm 【何...】 -> Chọn cách đọc chuẩn xác (なん hay なに).
 * - 10 câu 'fill_question': Nhìn hội thoại Hỏi – Đáp -> Chọn cụm nghi vấn chuẩn theo ngữ cảnh & cách đọc.
 */
export const LESSON6_NAN_NANI_BANK: Lesson6NanNaniBankItem[] = [
  // ==================== NHÓM 1: CHỌN CÁCH ĐỌC CHỮ 何 (14 CÂU) ====================
  {
    id: 'nn_r1',
    subType: 'reading',
    categoryBadge: '🔤 Đọc 何 trước を',
    badgeTone: 'indigo',
    promptMain: '毎朝 【何を】 食べますか。',
    promptSub: 'Nghĩa: "Mỗi sáng bạn ăn cái gì?"',
    contextHint: 'Chọn cách đọc đúng cho cụm 【何を】 trong câu trên:',
    ttsFullAnswer: 'まいあさ なにを たべますか。',
    fullSentenceKanji: '毎朝 何を 食べますか。',
    fullSentenceHira: 'まいあさ なにを たべますか。',
    correct: { id: 'naniwo', label: 'なにを', subLabel: 'Đọc là なに (trước trợ từ を)' },
    traps: [
      { id: 'nanwo', label: 'なんを', subLabel: 'Sai quy tắc phát âm' },
      { id: 'nanimo', label: 'なにも', subLabel: 'Nhầm trợ từ も' },
      { id: 'nande', label: 'なんで', subLabel: 'Nhầm sang phương tiện' },
    ],
    trapNote:
      'Trợ từ を (hàng わ) KHÔNG thuộc 3 hàng た・だ・な (T-D-N) → chữ 何 bắt buộc đọc là なに (なにを 食べますか, tuyệt đối cấm đọc なんを!).',
  },
  {
    id: 'nn_r2',
    subType: 'reading',
    categoryBadge: '🔤 Đọc 何 trước も',
    badgeTone: 'emerald',
    promptMain: 'けさ 【何も】 食べませんでした。',
    promptSub: 'Nghĩa: "Sáng nay tôi đã không ăn gì cả."',
    contextHint: 'Chọn cách đọc đúng cho cụm 【何も】:',
    ttsFullAnswer: 'けさ なにも たべませんでした。',
    fullSentenceKanji: 'けさ 何も 食べませんでした。',
    fullSentenceHira: 'けさ なにも たべませんでした。',
    correct: { id: 'nanimo', label: 'なにも', subLabel: 'Đọc là なに (trước trợ từ も)' },
    traps: [
      { id: 'nanmo', label: 'なんも', subLabel: 'Không dùng trong văn chuẩn N5' },
      { id: 'naniwo', label: 'なにを', subLabel: 'Nhầm trợ từ を' },
      { id: 'nanno', label: 'なんの', subLabel: 'Nhầm trợ từ の' },
    ],
    trapNote:
      'Trợ từ も bắt đầu bằng âm ま (m), KHÔNG thuộc hàng た・だ・な → chữ 何 trong 何も đọc chuẩn là なにも.',
  },
  {
    id: 'nn_r3',
    subType: 'reading',
    categoryBadge: '⚡ Quy tắc T-D-N (Hàng だ)',
    badgeTone: 'amber',
    promptMain: '毎日 【何で】 会社へ 行きますか。',
    promptSub: 'Nghĩa: "Mỗi ngày bạn đi đến công ty bằng phương tiện gì?"',
    contextHint: 'Chọn cách đọc đúng cho cụm 【何で】:',
    ttsFullAnswer: 'まいにち なんで かいしゃへ いきますか。',
    fullSentenceKanji: '毎日 何で 会社へ 行きますか。',
    fullSentenceHira: 'まいにち なんで かいしゃへ いきますか。',
    correct: { id: 'nande', label: 'なんで', subLabel: 'Đọc là なん (trước âm d của で)' },
    traps: [
      { id: 'nanide', label: 'なにで', subLabel: 'Sai vì で thuộc hàng だ' },
      { id: 'naniwo', label: 'なにを', subLabel: 'Nhầm sang tân ngữ' },
      { id: 'nanno', label: 'なんの', subLabel: 'Nhầm sang trợ từ の' },
    ],
    trapNote:
      'Trợ từ で bắt đầu bằng âm d (hàng だ — nằm trong nhóm T-D-N: た・だ・な) → chữ 何 bắt buộc biến âm thành なん: 何で = なんで!',
  },
  {
    id: 'nn_r4',
    subType: 'reading',
    categoryBadge: '⚡ Quy tắc T-D-N (Hàng だ)',
    badgeTone: 'amber',
    promptMain: 'それは 【何ですか】。',
    promptSub: 'Nghĩa: "Cái đó là cái gì vậy?"',
    contextHint: 'Chọn cách đọc đúng cho cụm 【何ですか】:',
    ttsFullAnswer: 'それは なんですか。',
    fullSentenceKanji: 'それは 何ですか。',
    fullSentenceHira: 'それは なんですか。',
    correct: { id: 'nandesuka', label: 'なんですか', subLabel: 'Đọc là なん (trước です)' },
    traps: [
      { id: 'nanidesuka', label: 'なにですか', subLabel: 'Sai vì です bắt đầu bằng d' },
      { id: 'nandedesuka', label: 'なんでですか', subLabel: 'Dư chữ で (tại sao)' },
      { id: 'nanika', label: 'なにか', subLabel: 'Thiếu です' },
    ],
    trapNote:
      'です bắt đầu bằng âm d (hàng だ — nhóm T-D-N) → chữ 何 đứng trước です luôn đọc là なん: 何ですか (なんですか), cấm đọc なにですか!',
  },
  {
    id: 'nn_r5',
    subType: 'reading',
    categoryBadge: '⚡ Quy tắc T-D-N (Hàng な)',
    badgeTone: 'amber',
    promptMain: 'これは 【何の】 雑誌ですか。',
    promptSub: 'Nghĩa: "Đây là tạp chí về chủ đề gì?"',
    contextHint: 'Chọn cách đọc đúng cho cụm 【何の】:',
    ttsFullAnswer: 'これは なんの ざっしですか。',
    fullSentenceKanji: 'これは 何の 雑誌ですか。',
    fullSentenceHira: 'これは なんの ざっしですか。',
    correct: { id: 'nanno', label: 'なんの', subLabel: 'Đọc là なん (trước âm n của の)' },
    traps: [
      { id: 'nanino', label: 'なにの', subLabel: 'Sai vì の thuộc hàng な' },
      { id: 'naniwo', label: 'なにを', subLabel: 'Sai trợ từ' },
      { id: 'nande', label: 'なんで', subLabel: 'Sai trợ từ' },
    ],
    trapNote:
      'Trợ từ の bắt đầu bằng âm n (hàng な — nhóm T-D-N: た・だ・な) → chữ 何 đứng trước の luôn đọc là なん: 何の = なんの (cấm đọc なにの!).',
  },
  {
    id: 'nn_r6',
    subType: 'reading',
    categoryBadge: '🔤 Đọc 何 trước を',
    badgeTone: 'indigo',
    promptMain: '日曜日 【何を】 しますか。',
    promptSub: 'Nghĩa: "Chủ nhật bạn sẽ làm gì?"',
    contextHint: 'Chọn cách đọc đúng cho cụm 【何を】:',
    ttsFullAnswer: 'にちようび なにを しますか。',
    fullSentenceKanji: '日曜日 何を しますか。',
    fullSentenceHira: 'にちようび なにを しますか。',
    correct: { id: 'naniwo', label: 'なにを', subLabel: 'Mẫu trọng tâm Bài 6' },
    traps: [
      { id: 'nanwo', label: 'なんを', subLabel: 'Sai quy tắc đọc 何' },
      { id: 'nande', label: 'なんで', subLabel: 'Nhầm sang phương tiện' },
      { id: 'nanimo', label: 'なにも', subLabel: 'Chỉ dùng với phủ định' },
    ],
    trapNote:
      'Mẫu câu cốt lõi Bài 6: 何を しますか đọc là なにを しますか (vì đứng trước trợ từ を).',
  },
  {
    id: 'nn_r7',
    subType: 'reading',
    categoryBadge: '🔢 Hậu tố đếm giờ',
    badgeTone: 'emerald',
    promptMain: '今 【何時】 ですか。',
    promptSub: 'Nghĩa: "Bây giờ là mấy giờ?"',
    contextHint: 'Chọn cách đọc đúng cho từ 【何時】:',
    ttsFullAnswer: 'いま なんじですか。',
    fullSentenceKanji: '今 何時ですか。',
    fullSentenceHira: 'いま なんじですか。',
    correct: { id: 'nanji', label: 'なんじ', subLabel: '何 + hậu tố đếm giờ ～時' },
    traps: [
      { id: 'naniji', label: 'なにじ', subLabel: 'Sai vì đi với hậu tố đếm' },
      { id: 'nannichi', label: 'なんにち', subLabel: 'Nhầm sang 何日 (ngày mấy)' },
      { id: 'nanpun', label: 'なんぷん', subLabel: 'Nhầm sang 何分 (mấy phút)' },
    ],
    trapNote:
      'Khi chữ 何 ghép trước các hậu tố đếm / đơn vị đo lường (～時, ～分, ～歳, ～番, ～階, ～月, ～日...) → luôn đọc là なん (何時 = なんじ).',
  },
  {
    id: 'nn_r8',
    subType: 'reading',
    categoryBadge: '🔢 Đơn vị Tháng & Ngày',
    badgeTone: 'emerald',
    promptMain: '誕生日は 【何月何日】 ですか。',
    promptSub: 'Nghĩa: "Sinh nhật của bạn là ngày mấy tháng mấy?"',
    contextHint: 'Chọn cách đọc đúng cho cụm 【何月何日】:',
    ttsFullAnswer: 'たんじょうびは なんがつ なんにちですか。',
    fullSentenceKanji: '誕生日は 何月何日ですか。',
    fullSentenceHira: 'たんじょうびは なんがつ なんにちですか。',
    correct: { id: 'nangatsu_nannichi', label: 'なんがつ なんにち', subLabel: 'Cả 2 đều đọc là なん' },
    traps: [
      { id: 'nanigatsu_naninichi', label: 'なにがつ なににち', subLabel: 'Sai cả 2 vế' },
      { id: 'nangatsu_naninichi', label: 'なんがつ なににち', subLabel: 'Sai vế 何日' },
      { id: 'nanigatsu_nannichi', label: 'なにがつ なんにち', subLabel: 'Sai vế 何月' },
    ],
    trapNote:
      '～月 (tháng) và ～日 (ngày) đều là đơn vị đếm thời gian (và 日 còn bắt đầu bằng âm n!) → đọc là なんがつ なんにち.',
  },
  {
    id: 'nn_r9',
    subType: 'reading',
    categoryBadge: '🔢 Đơn vị Thứ trong tuần',
    badgeTone: 'emerald',
    promptMain: 'あしたは 【何曜日】 ですか。',
    promptSub: 'Nghĩa: "Ngày mai là thứ mấy?"',
    contextHint: 'Chọn cách đọc đúng cho từ 【何曜日】:',
    ttsFullAnswer: 'あしたは なんようびですか。',
    fullSentenceKanji: 'あしたは 何曜日ですか。',
    fullSentenceHira: 'あしたは なんようびですか。',
    correct: { id: 'nanyoubi', label: 'なんようび', subLabel: 'Hỏi thứ mấy (Bài 4)' },
    traps: [
      { id: 'naniyoubi', label: 'なにようび', subLabel: 'Sai quy tắc hậu tố' },
      { id: 'nannichi', label: 'なんにち', subLabel: 'Nhầm sang ngày mấy' },
      { id: 'nanji', label: 'なんじ', subLabel: 'Nhầm sang mấy giờ' },
    ],
    trapNote:
      '何曜日 (thứ mấy) hỏi thứ tự ngày trong tuần nên luôn đọc là なんようび (không đọc なにようび).',
  },
  {
    id: 'nn_r10',
    subType: 'reading',
    categoryBadge: '🔢 Hậu tố đếm tầng',
    badgeTone: 'emerald',
    promptMain: 'レストランは 【何階】 ですか。',
    promptSub: 'Nghĩa: "Nhà hàng ở tầng mấy?"',
    contextHint: 'Chọn cách đọc đúng cho từ 【何階】:',
    ttsFullAnswer: 'レストランは なんがいですか。',
    fullSentenceKanji: 'レストランは 何階ですか。',
    fullSentenceHira: 'レストランは なんがいですか。',
    correct: { id: 'nangai', label: 'なんがい', subLabel: '何 + 階 (biến âm がい)' },
    traps: [
      { id: 'nanigai', label: 'なにがい', subLabel: 'Sai cách đọc 何' },
      { id: 'nanikai', label: 'なにかい', subLabel: 'Sai cả 何 lẫn 階' },
      { id: 'nanban', label: 'なんばん', subLabel: 'Nhầm sang số mấy' },
    ],
    trapNote:
      'Ghép 何 với hậu tố đếm tầng ～階 (Bài 3): đọc là なんがい (vừa đọc 何 là なん, vừa biến âm か → が).',
  },
  {
    id: 'nn_r11',
    subType: 'reading',
    categoryBadge: '🔢 Hậu tố đếm tuổi',
    badgeTone: 'emerald',
    promptMain: '太郎くんは 【何歳】 ですか。',
    promptSub: 'Nghĩa: "Bé Taro mấy tuổi rồi?"',
    contextHint: 'Chọn cách đọc đúng cho từ 【何歳】:',
    ttsFullAnswer: 'たろうくんは なんさいですか。',
    fullSentenceKanji: '太郎くんは 何歳ですか。',
    fullSentenceHira: 'たろうくんは なんさいですか。',
    correct: { id: 'nansai', label: 'なんさい', subLabel: 'Hỏi tuổi (Bài 1)' },
    traps: [
      { id: 'nanisai', label: 'なにさい', subLabel: 'Sai vì ～歳 là hậu tố đếm' },
      { id: 'nanijin', label: 'なにじん', subLabel: 'Nhầm sang người nước nào' },
      { id: 'nanban', label: 'なんばん', subLabel: 'Nhầm sang số mấy' },
    ],
    trapNote:
      '～歳 (tuổi) là hậu tố đếm số lượng tuổi → 何歳 luôn đọc là なんさい.',
  },
  {
    id: 'nn_r12',
    subType: 'reading',
    categoryBadge: '🔤 Đọc 何 trước か',
    badgeTone: 'indigo',
    promptMain: 'スーパーで 【何か】 買いましたか。',
    promptSub: 'Nghĩa: "Bạn có mua thứ gì đó ở siêu thị không?"',
    contextHint: 'Chọn cách đọc chuẩn lịch sự cho cụm 【何か】:',
    ttsFullAnswer: 'スーパーで なにか かいましたか。',
    fullSentenceKanji: 'スーパーで 何か 買いましたか。',
    fullSentenceHira: 'スーパーで なにか かいましたか。',
    correct: { id: 'nanika', label: 'なにか', subLabel: 'Thứ gì đó / cái gì đó' },
    traps: [
      { id: 'nanno', label: 'なんの', subLabel: 'Nhầm sang trợ từ の' },
      { id: 'nande', label: 'なんで', subLabel: 'Nhầm sang phương tiện' },
      { id: 'nanwo', label: 'なんを', subLabel: 'Cách đọc không tồn tại' },
    ],
    trapNote:
      'Trợ từ か bắt đầu bằng âm k (hàng か, không thuộc nhóm T-D-N) → 何か đọc chuẩn là なにか ("cái gì đó / thứ gì đó").',
  },
  {
    id: 'nn_r13',
    subType: 'reading',
    categoryBadge: '🔥 Cặp sinh đôi 何人 (Đếm người)',
    badgeTone: 'rose',
    promptMain: '家族は 【何人】 ですか。 ー 4人です。',
    promptSub: 'Nghĩa: "Gia đình bạn có mấy người? — 4 người."',
    contextHint: 'Chú ý câu trả lời là số lượng người (4人) — chọn cách đọc 【何人】:',
    ttsFullAnswer: 'かぞくは なんにんですか。 よにんです。',
    fullSentenceKanji: '家族は 何人（なんにん）ですか。',
    fullSentenceHira: 'かぞくは なんにんですか。',
    correct: { id: 'nannin', label: 'なんにん', subLabel: 'Mấy người (đếm số người)' },
    traps: [
      { id: 'nanijin', label: 'なにじん', subLabel: 'Người nước nào (quốc tịch)' },
      { id: 'naninin', label: 'なににん', subLabel: 'Sai cách đọc' },
      { id: 'nanjin', label: 'なんじん', subLabel: 'Sai cách đọc' },
    ],
    trapNote:
      'Cặp bẫy nổi tiếng nhất của chữ 何: Cùng viết là 何人 nhưng khi ĐẾM SỐ NGƯỜI ("mấy người") bắt buộc đọc là なんにん!',
  },
  {
    id: 'nn_r14',
    subType: 'reading',
    categoryBadge: '🔥 Cặp sinh đôi 何人 (Quốc tịch)',
    badgeTone: 'rose',
    promptMain: 'ミラーさんは 【何人】 ですか。 ー アメリカ人です。',
    promptSub: 'Nghĩa: "Anh Miller là người nước nào? — Người Mỹ."',
    contextHint: 'Chú ý câu trả lời là quốc tịch (アメリカ人) — chọn cách đọc 【何人】:',
    ttsFullAnswer: 'ミラーさんは なにじんですか。 アメリカじんです。',
    fullSentenceKanji: 'ミラーさんは 何人（なにじん）ですか。',
    fullSentenceHira: 'ミラーさんは なにじんですか。',
    correct: { id: 'nanijin', label: 'なにじん', subLabel: 'Người nước nào (quốc tịch)' },
    traps: [
      { id: 'nannin', label: 'なんにん', subLabel: 'Mấy người (đếm số lượng)' },
      { id: 'nanjin', label: 'なんじん', subLabel: 'Không đọc なんじん' },
      { id: 'naninin', label: 'なににん', subLabel: 'Sai âm Hán của 人' },
    ],
    trapNote:
      'Khi hỏi QUỐC TỊCH ("người nước nào" — đối ứng với アメリカじん, ベトナムじん), từ 何人 đọc là なにじん (khác hẳn なんにん = mấy người!).',
  },

  // ==================== NHÓM 2: ĐIỀN CỤM NGHI VẤN THEO HỘI THOẠI (10 CÂU) ====================
  {
    id: 'nn_f1',
    subType: 'fill_question',
    categoryBadge: '💬 Hỏi – Đáp Tân ngữ',
    badgeTone: 'indigo',
    promptMain: 'A: 昼 【 ？ 】 食べますか。\nB: パンと 卵を 食べます。',
    promptSub: 'A: Buổi trưa bạn ăn gì? — B: Tôi ăn bánh mì và trứng.',
    contextHint: 'Chọn cụm nghi vấn đúng cả ngữ pháp lẫn cách đọc (なん / なに):',
    ttsFullAnswer: 'ひる なにを たべますか。 パンと たまごを たべます。',
    fullSentenceKanji: '昼 何（なに）を 食べますか。',
    fullSentenceHira: 'ひる なにを たべますか。',
    correct: { id: 'naniwo', label: 'なにを (何を)', subLabel: 'Hỏi tân ngữ + đọc なに' },
    traps: [
      { id: 'nande', label: 'なんで (何で)', subLabel: 'Hỏi phương tiện' },
      { id: 'nanwo', label: 'なんを (何を)', subLabel: 'Sai cách đọc なん trước を' },
      { id: 'nanno', label: 'なんの (何の)', subLabel: 'Phải đứng trước danh từ' },
    ],
    trapNote:
      'Câu trả lời nêu món ăn kèm trợ từ を (パンと 卵を) → hỏi bằng 何を, và trước を bắt buộc đọc là なにを.',
  },
  {
    id: 'nn_f2',
    subType: 'fill_question',
    categoryBadge: '💬 Hỏi – Đáp Phương tiện',
    badgeTone: 'amber',
    promptMain: 'A: 毎朝 【 ？ 】 学校へ 行きますか。\nB: バスで 行きます。',
    promptSub: 'A: Mỗi sáng bạn đến trường bằng gì? — B: Tôi đi bằng xe buýt.',
    contextHint: 'Dựa vào câu trả lời 「バスで 行きます」, chọn từ để hỏi đúng:',
    ttsFullAnswer: 'まいあさ なんで がっこうへ いきますか。 バスで いきます。',
    fullSentenceKanji: '毎朝 何（なん）で 学校へ 行きますか。',
    fullSentenceHira: 'まいあさ なんで がっこうへ いきますか。',
    correct: { id: 'nande', label: 'なんで (何で)', subLabel: 'Bằng phương tiện gì (đọc なん)' },
    traps: [
      { id: 'nanide', label: 'なにで (何で)', subLabel: 'Sai cách đọc trước で' },
      { id: 'naniwo', label: 'なにを (何を)', subLabel: 'Nhầm sang tân ngữ' },
      { id: 'dokode', label: 'どこで', subLabel: 'Nhầm sang địa điểm' },
    ],
    trapNote:
      'Hỏi phương tiện giao thông dùng 何で, và vì で bắt đầu bằng âm d (hàng だ: T-D-N) nên bắt buộc đọc là なんで (cấm đọc なにで!).',
  },
  {
    id: 'nn_f3',
    subType: 'fill_question',
    categoryBadge: '💬 Hỏi – Đáp Chủ đề sách',
    badgeTone: 'amber',
    promptMain: 'A: それは 【 ？ 】 本ですか。\nB: 日本語の 本です。',
    promptSub: 'A: Đó là sách về cái gì? — B: Là sách tiếng Nhật.',
    contextHint: 'Đứng ngay trước danh từ 「本」, chọn cụm từ hỏi đúng:',
    ttsFullAnswer: 'それは なんの ほんですか。 にほんごの ほんです。',
    fullSentenceKanji: 'それは 何（なん）の 本ですか。',
    fullSentenceHira: 'それは なんの ほんですか。',
    correct: { id: 'nanno', label: 'なんの (何の)', subLabel: 'Về cái gì (trước の đọc なん)' },
    traps: [
      { id: 'nanino', label: 'なにの (何の)', subLabel: 'Sai vì の thuộc hàng な' },
      { id: 'naniwo', label: 'なにを (何を)', subLabel: 'Không nối trực tiếp với 本' },
      { id: 'nande', label: 'なんで (何で)', subLabel: 'Sai trợ từ' },
    ],
    trapNote:
      'Hỏi nội dung/loại danh từ (日本語の 本) dùng 何の + Danh từ. Vì の thuộc hàng な (T-D-N) nên đọc là なんの.',
  },
  {
    id: 'nn_f4',
    subType: 'fill_question',
    categoryBadge: '💬 Hỏi – Đáp Hoạt động',
    badgeTone: 'indigo',
    promptMain: 'A: きのうの 晩 【 ？ 】 しましたか。\nB: うちで 勉強しました。',
    promptSub: 'A: Tối hôm qua bạn đã làm gì? — B: Tôi đã học bài ở nhà.',
    contextHint: 'Chọn cụm nghi vấn đi với động từ 「しましたか」:',
    ttsFullAnswer: 'きのうの ばん なにを しましたか。 うちで べんきょうしました。',
    fullSentenceKanji: 'きのうの 晩 何（なに）を しましたか。',
    fullSentenceHira: 'きのうの ばん なにを しましたか。',
    correct: { id: 'naniwo', label: 'なにを (何を)', subLabel: 'Làm cái gì (đọc なに)' },
    traps: [
      { id: 'nanwo', label: 'なんを (何を)', subLabel: 'Sai cách đọc trước を' },
      { id: 'nande', label: 'なんで (何で)', subLabel: 'Nhầm sang phương tiện' },
      { id: 'nanno', label: 'なんの (何の)', subLabel: 'Thiếu danh từ theo sau' },
    ],
    trapNote:
      'Hỏi hoạt động tổng quát "đã làm gì" dùng mẫu 何を しましたか → đọc là なにを しましたか.',
  },
  {
    id: 'nn_f5',
    subType: 'fill_question',
    categoryBadge: '⚠️ Đáp phủ định hoàn toàn',
    badgeTone: 'rose',
    promptMain: 'A: デパートで 何を 買いましたか。\nB: 【 ？ 】 買いませんでした。',
    promptSub: 'A: Bạn đã mua gì ở trung tâm thương mại? — B: Tôi đã không mua gì cả.',
    contextHint: 'Chọn cụm từ phủ định hoàn toàn chuẩn cả trợ từ lẫn cách đọc:',
    ttsFullAnswer: 'デパートで なにを かいましたか。 なにも かいませんでした。',
    fullSentenceKanji: '何（なに）も 買いませんでした。',
    fullSentenceHira: 'なにも かいませんでした。',
    correct: { id: 'nanimo', label: 'なにも (何も)', subLabel: 'Không gì cả (bỏ を, đọc なに)' },
    traps: [
      { id: 'naniwo', label: 'なにを (何を)', subLabel: 'Sai vì câu phủ định hoàn toàn' },
      { id: 'nanmo', label: 'なんも (何も)', subLabel: 'Sai cách đọc chuẩn trước も' },
      { id: 'nanimowo', label: 'なにもを (何もを)', subLabel: 'Bẫy thừa trợ từ を' },
    ],
    trapNote:
      'Bẫy kép: (1) Đuôi phủ định 買いませんでした cần 何も (bỏ hẳn を); (2) Trước trợ từ も (âm m) chữ 何 đọc là なに → なにも 買いませんでした.',
  },
  {
    id: 'nn_f6',
    subType: 'fill_question',
    categoryBadge: '💬 Phản hồi khi được gọi tên',
    badgeTone: 'amber',
    promptMain: 'A: あのう、ミラーさん。\nB: はい、【 ？ 】。',
    promptSub: 'A: À, anh Miller ơi. — B: Vâng, có chuyện gì thế ạ?',
    contextHint: 'Chọn câu đáp tự nhiên trong từ vựng giao tiếp Bài 6:',
    ttsFullAnswer: 'あのう、ミラーさん。 はい、なんですか。',
    fullSentenceKanji: 'はい、何（なん）ですか。',
    fullSentenceHira: 'はい、なんですか。',
    correct: { id: 'nandesuka', label: 'なんですか (何ですか)', subLabel: 'Vâng, có việc gì ạ?' },
    traps: [
      { id: 'nanidesuka', label: 'なにですか (何ですか)', subLabel: 'Sai vì trước です đọc なん' },
      { id: 'naniwodesuka', label: 'なにをですか', subLabel: 'Sai ngữ pháp' },
      { id: 'nanno', label: 'なんのですか', subLabel: 'Sai ngữ cảnh' },
    ],
    trapNote:
      'Từ vựng giao tiếp Bài 6: Khi người khác gọi tên mình, đáp lại lịch sự bằng 「はい、なんですか」 (trước です bắt buộc đọc なん).',
  },
  {
    id: 'nn_f7',
    subType: 'fill_question',
    categoryBadge: '💬 Phân biệt なんで vs なにを',
    badgeTone: 'indigo',
    promptMain: 'A: 休みの 日 【 ？ 】 しますか。\nB: 友達と サッカーを します。',
    promptSub: 'A: Ngày nghỉ bạn thường làm gì? — B: Tôi chơi bóng đá với bạn.',
    contextHint: 'Chọn từ để hỏi khớp với câu trả lời 「サッカーを します」:',
    ttsFullAnswer: 'やすみの ひ なにを しますか。 ともだちと サッカーを します。',
    fullSentenceKanji: '休みの 日 何（なに）を しますか。',
    fullSentenceHira: 'やすみの ひ なにを しますか。',
    correct: { id: 'naniwo', label: 'なにを (何を)', subLabel: 'Làm cái gì' },
    traps: [
      { id: 'nande', label: 'なんで (何で)', subLabel: 'Bằng phương tiện gì' },
      { id: 'nanwo', label: 'なんを (何を)', subLabel: 'Sai cách đọc trước を' },
      { id: 'dokohe', label: 'どこへ', subLabel: 'Đi đâu' },
    ],
    trapNote:
      'Đối chiếu cặp dễ nhầm: Hỏi hoạt động dùng なにを しますか; hỏi phương tiện đi lại dùng なんで 行きますか.',
  },
  {
    id: 'nn_f8',
    subType: 'fill_question',
    categoryBadge: '💬 Phân biệt なんで vs なにで',
    badgeTone: 'amber',
    promptMain: 'A: 京都へ 【 ？ 】 行きますか。\nB: 新幹線で 行きます。',
    promptSub: 'A: Bạn đi Kyoto bằng gì? — B: Tôi đi bằng tàu Shinkansen.',
    contextHint: 'Chọn từ để hỏi phương tiện đi lại đúng cách đọc:',
    ttsFullAnswer: 'きょうとへ なんで いきますか。 しんかんせんで いきます。',
    fullSentenceKanji: '京都へ 何（なん）で 行きますか。',
    fullSentenceHira: 'きょうとへ なんで いきますか。',
    correct: { id: 'nande', label: 'なんで (何で)', subLabel: 'Trước で (hàng だ) → đọc なん' },
    traps: [
      { id: 'nanide', label: 'なにで (何で)', subLabel: 'Sai cách đọc trước で' },
      { id: 'naniwo', label: 'なにを (何を)', subLabel: 'Nhầm sang tân ngữ' },
      { id: 'dokode', label: 'どこで', subLabel: 'Nhầm sang nơi hành động' },
    ],
    trapNote:
      '新幹線で 行きます trả lời về phương tiện → hỏi bằng 何で (なんで). Vì で thuộc hàng だ nên luôn đọc là なんで!',
  },
  {
    id: 'nn_f9',
    subType: 'fill_question',
    categoryBadge: '💬 Đã có 駅で → Hỏi tân ngữ',
    badgeTone: 'indigo',
    promptMain: 'A: 駅で 【 ？ 】 買いましたか。\nB: 新聞と 水を 買いました。',
    promptSub: 'A: Ở nhà ga bạn đã mua cái gì? — B: Tôi đã mua báo và nước.',
    contextHint: 'Địa điểm 「駅で」 đã có sẵn, chọn cụm nghi vấn đúng:',
    ttsFullAnswer: 'えきで なにを かいましたか。 しんぶんと みずを かいました。',
    fullSentenceKanji: '駅で 何（なに）を 買いましたか。',
    fullSentenceHira: 'えきで なにを かいましたか。',
    correct: { id: 'naniwo', label: 'なにを (何を)', subLabel: 'Mua cái gì (đọc なに)' },
    traps: [
      { id: 'nanwo', label: 'なんを (何を)', subLabel: 'Sai cách đọc trước を' },
      { id: 'dokode', label: 'どこで', subLabel: 'Trùng địa điểm 駅で' },
      { id: 'nande', label: 'なんで (何で)', subLabel: 'Nhầm sang phương tiện' },
    ],
    trapNote:
      'Câu hỏi đã có sẵn nơi chốn 駅で và câu trả lời là vật mua (新聞と 水を) → điền なにを (cấm đọc なんを).',
  },
  {
    id: 'nn_f10',
    subType: 'fill_question',
    categoryBadge: '💬 Hỏi đồ vật với ですか',
    badgeTone: 'amber',
    promptMain: 'A: かばんの 中は 【 ？ 】。\nB: カメラと ノートです。',
    promptSub: 'A: Bên trong cặp là cái gì vậy? — B: Là máy ảnh và vở.',
    contextHint: 'Chọn vị ngữ nghi vấn đứng cuối câu đúng cách đọc:',
    ttsFullAnswer: 'かばんの なかは なんですか。 カメラと ノートです。',
    fullSentenceKanji: 'かばんの 中は 何（なん）ですか。',
    fullSentenceHira: 'かばんの なかは なんですか。',
    correct: { id: 'nandesuka', label: 'なんですか (何ですか)', subLabel: 'Trước です → đọc なん' },
    traps: [
      { id: 'nanidesuka', label: 'なにですか (何ですか)', subLabel: 'Sai cách đọc trước です' },
      { id: 'naniwo', label: 'なにをですか', subLabel: 'Thừa trợ từ を' },
      { id: 'dokodesuka', label: 'どこですか', subLabel: 'Nhầm sang hỏi địa điểm' },
    ],
    trapNote:
      'Cấu trúc N は 何ですか hỏi danh tính đồ vật: đứng ngay trước です (âm d thuộc hàng だ) nên chữ 何 bắt buộc đọc là なんですか!',
  },
];

export function buildLesson6ParticleQuestion(
  item: Lesson6ParticleBankItem,
  mode: Lesson6ParticleMode
): Lesson6PracticeQuestion {
  const concrete: 'hira' | 'kanji' =
    mode === 'mixed' ? (Math.random() < 0.5 ? 'hira' : 'kanji') : mode;

  const rawOptions: Lesson6Option[] = [
    {
      id: item.correct.id,
      label: concrete === 'hira' ? item.correct.hira : item.correct.kanji,
    },
    ...item.traps.map((t) => ({
      id: t.id,
      label: concrete === 'hira' ? t.hira : t.kanji,
    })),
  ];

  const correctDisplay = concrete === 'hira' ? item.correct.hira : item.correct.kanji;

  return {
    topic: 'particles',
    promptBadge: concrete === 'hira' ? 'あ Hiragana' : '漢 Chữ Hán',
    badgeText: item.categoryBadge,
    badgeTone: item.badgeTone,
    promptMain: concrete === 'hira' ? item.promptHira : item.promptKanji,
    promptSub: `Nghĩa: "${item.vnMeaning}"`,
    contextHint: 'Chọn trợ từ hoặc phương án đúng để điền vào 【 ？ 】:',
    ttsFullAnswer: item.ttsFullAnswer,
    correctId: item.correct.id,
    correctDisplay,
    fullExplanationTitle: item.fullSentenceKanji,
    fullExplanationSub: `${item.fullSentenceHira} (${item.vnMeaning})`,
    options: fisherYatesShuffle(rawOptions),
    trapNote: item.trapNote,
  };
}

export function buildLesson6NanNaniQuestion(
  item: Lesson6NanNaniBankItem
): Lesson6PracticeQuestion {
  const rawOptions: Lesson6Option[] = [item.correct, ...item.traps];
  const correctDisplay = item.correct.subLabel
    ? `${item.correct.label} — ${item.correct.subLabel}`
    : item.correct.label;

  return {
    topic: 'nan_nani',
    promptBadge: item.subType === 'reading' ? '🔤 Chọn cách đọc 何' : '💬 Điền theo hội thoại',
    badgeText: item.categoryBadge,
    badgeTone: item.badgeTone,
    promptMain: item.promptMain,
    promptSub: item.promptSub,
    contextHint: item.contextHint,
    ttsFullAnswer: item.ttsFullAnswer,
    correctId: item.correct.id,
    correctDisplay,
    fullExplanationTitle: item.fullSentenceKanji,
    fullExplanationSub: item.fullSentenceHira,
    options: fisherYatesShuffle(rawOptions),
    trapNote: item.trapNote,
  };
}
