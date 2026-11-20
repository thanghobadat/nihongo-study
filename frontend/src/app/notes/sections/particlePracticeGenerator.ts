import { fisherYatesShuffle } from './noteUtils';
import type { ParticleFilterId } from './ParticleSection';

export type ParticleQuizScope = ParticleFilterId;
export type ParticleQuizMode = 'hira' | 'kanji' | 'mixed';
export type ConcreteParticlePrompt = 'hira' | 'kanji';

export interface ParticleChoicePair {
  id: string;
  hira: string;
  kanji: string;
}

export interface ParticleQuizBankItem {
  id: string;
  group: Exclude<ParticleFilterId, 'all'>;
  lessonTag: string;
  promptHira: string;
  promptKanji: string;
  vnMeaning: string;
  ttsFullAnswer: string;
  fullSentenceKanji: string;
  fullSentenceHira: string;
  correct: ParticleChoicePair;
  traps: [ParticleChoicePair, ParticleChoicePair, ParticleChoicePair];
  trapNote: string;
}

export interface ParticleQuizOption {
  id: string;
  label: string;
}

export interface ParticleQuizQuestion {
  id: string;
  group: Exclude<ParticleFilterId, 'all'>;
  promptType: ConcreteParticlePrompt;
  lessonTag: string;
  promptText: string;
  vnMeaning: string;
  ttsFullAnswer: string;
  correctId: string;
  correctDisplay: string;
  fullSentenceKanji: string;
  fullSentenceHira: string;
  options: ParticleQuizOption[];
  trapNote: string;
}

/**
 * Ngân hàng 40 câu trắc nghiệm phân biệt Trợ từ & Ngoại lệ (Bài 1 → Bài 7)
 */
export const PARTICLE_QUIZ_BANK: ParticleQuizBankItem[] = [
  // ================= NHÓM 1: で (8 câu — Bài 5, 6, 7) =================
  {
    id: 'pq_de_1',
    group: 'de',
    lessonTag: 'Bài 5 · Phương tiện',
    promptHira: 'まいあさ でんしゃ [  ？  ] かいしゃへ いきます。',
    promptKanji: '毎朝 電車 [  ？  ] 会社へ 行きます。',
    vnMeaning: 'Mỗi sáng tôi đi đến công ty bằng tàu điện.',
    ttsFullAnswer: 'まいあさ でんしゃで かいしゃへ いきます。',
    fullSentenceKanji: '毎朝 電車で 会社へ 行きます。',
    fullSentenceHira: 'まいあさ でんしゃで かいしゃへ いきます。',
    correct: { id: 'de', hira: 'で', kanji: 'で' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
      { id: 'to', hira: 'と', kanji: 'と' },
    ],
    trapNote: '電車 (tàu điện) là phương tiện giao thông → dùng trợ từ で.',
  },
  {
    id: 'pq_de_2',
    group: 'de',
    lessonTag: 'Bài 5 · Ngoại lệ Đi bộ',
    promptHira: 'まいにち あるいて [  ？  ] がっこうへ いきます。',
    promptKanji: '毎日 歩いて [  ？  ] 学校へ 行きます。',
    vnMeaning: 'Mỗi ngày tôi đi bộ đến trường.',
    ttsFullAnswer: 'まいにち あるいて がっこうへ いきます。',
    fullSentenceKanji: '毎日 歩いて 学校へ 行きます。',
    fullSentenceHira: 'まいにち あるいて がっこうへ いきます。',
    correct: { id: 'none', hira: '∅ (Không dùng trợ từ)', kanji: '∅ (Không dùng trợ từ)' },
    traps: [
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
      { id: 'ni', hira: 'に', kanji: 'に' },
    ],
    trapNote: '歩いて (đi bộ) đứng độc lập, tuyệt đối không gắn thêm trợ từ で ở sau.',
  },
  {
    id: 'pq_de_3',
    group: 'de',
    lessonTag: 'Bài 5 · Ngoại lệ 1 mình',
    promptHira: 'せんげつ ひとり [  ？  ] にほんへ きました。',
    promptKanji: '先月 一人 [  ？  ] 日本へ 来ました。',
    vnMeaning: 'Tháng trước tôi đã đến Nhật một mình.',
    ttsFullAnswer: 'せんげつ ひとりで にほんへ きました。',
    fullSentenceKanji: '先月 一人で 日本へ 来ました。',
    fullSentenceHira: 'せんげつ ひとりで にほんへ きました。',
    correct: { id: 'de', hira: 'で', kanji: 'で' },
    traps: [
      { id: 'to', hira: 'と', kanji: 'と' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'none', hira: '∅ (Không dùng trợ từ)', kanji: '∅ (Không dùng trợ từ)' },
    ],
    trapNote: 'Đi một mình dùng 一人で (ひとりで), không dùng trợ từ と.',
  },
  {
    id: 'pq_de_4',
    group: 'de',
    lessonTag: 'Bài 6 · Nơi hành động',
    promptHira: 'きのう スーパー [  ？  ] パンと ぎゅうにゅうを かいました。',
    promptKanji: '昨日 スーパー [  ？  ] パンと 牛乳を 買いました。',
    vnMeaning: 'Hôm qua tôi đã mua bánh mì và sữa ở siêu thị.',
    ttsFullAnswer: 'きのう スーパーで パンと ぎゅうにゅうを かいました。',
    fullSentenceKanji: '昨日 スーパーで パンと 牛乳を 買いました。',
    fullSentenceHira: 'きのう スーパーで パンと ぎゅうにゅうを かいました。',
    correct: { id: 'de', hira: 'で', kanji: 'で' },
    traps: [
      { id: 'he', hira: 'へ', kanji: 'へ' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'wo', hira: 'を', kanji: 'を' },
    ],
    trapNote: 'スーパー là nơi diễn ra hành động mua (買いました) → dùng で (khác へ chỉ hướng đi).',
  },
  {
    id: 'pq_de_5',
    group: 'de',
    lessonTag: 'Bài 6 · Phân biệt へ / で',
    promptHira: 'えき [  ？  ] しんぶんを かいます。',
    promptKanji: '駅 [  ？  ] 新聞を 買います。',
    vnMeaning: 'Tôi mua báo tại nhà ga.',
    ttsFullAnswer: 'えきで しんぶんを かいます。',
    fullSentenceKanji: '駅で 新聞を 買います。',
    fullSentenceHira: 'えきで しんぶんを かいます。',
    correct: { id: 'de', hira: 'で', kanji: 'で' },
    traps: [
      { id: 'he', hira: 'へ', kanji: 'へ' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'kara', hira: 'から', kanji: 'から' },
    ],
    trapNote: 'Động từ cuối là 買います (mua tại ga) nên dùng で; chỉ khi cuối câu là 行きます/来ます/帰ります mới dùng へ.',
  },
  {
    id: 'pq_de_6',
    group: 'de',
    lessonTag: 'Bài 7 · Công cụ',
    promptHira: 'はさみ [  ？  ] かみを きります。',
    promptKanji: 'はさみ [  ？  ] 紙を 切ります。',
    vnMeaning: 'Tôi cắt giấy bằng kéo.',
    ttsFullAnswer: 'はさみで かみを きります。',
    fullSentenceKanji: 'はさみで 紙を 切ります。',
    fullSentenceHira: 'はさみで かみを きります。',
    correct: { id: 'de', hira: 'で', kanji: 'で' },
    traps: [
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'to', hira: 'と', kanji: 'と' },
    ],
    trapNote: 'はさみ (kéo) là công cụ thực hiện hành động cắt → dùng trợ từ で.',
  },
  {
    id: 'pq_de_7',
    group: 'de',
    lessonTag: 'Bài 7 · Thiết bị gửi',
    promptHira: 'けさ ファクス [  ？  ] レポートを おくりました。',
    promptKanji: '今朝 ファクス [  ？  ] レポートを 送りました。',
    vnMeaning: 'Sáng nay tôi đã gửi báo cáo bằng máy fax.',
    ttsFullAnswer: 'けさ ファクスで レポートを おくりました。',
    fullSentenceKanji: '今朝 ファクスで レポートを 送りました。',
    fullSentenceHira: 'けさ ファクスで レポートを おくりました。',
    correct: { id: 'de', hira: 'で', kanji: 'で' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
      { id: 'kara', hira: 'から', kanji: 'から' },
    ],
    trapNote: 'ファクス / メール là phương thức gửi → dùng で; người/công ty nhận mới dùng に.',
  },
  {
    id: 'pq_de_8',
    group: 'de',
    lessonTag: 'Bài 7 · Ngôn ngữ',
    promptHira: '「ありがとう」は えいご [  ？  ] なんですか。',
    promptKanji: '「ありがとう」は 英語 [  ？  ] 何ですか。',
    vnMeaning: '“Arigatou” trong tiếng Anh là gì?',
    ttsFullAnswer: 'ありがとうは えいごで なんですか。',
    fullSentenceKanji: '「ありがとう」は 英語で 何ですか。',
    fullSentenceHira: '「ありがとう」は えいごで なんですか。',
    correct: { id: 'de', hira: 'で', kanji: 'で' },
    traps: [
      { id: 'no', hira: 'の', kanji: 'の' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'wa', hira: 'は', kanji: 'は' },
    ],
    trapNote: 'Hỏi hoặc viết/nói bằng ngôn ngữ nào luôn dùng [Ngôn ngữ] + で.',
  },

  // ================= NHÓM 2: に (9 câu — Bài 4, 6, 7) =================
  {
    id: 'pq_ni_1',
    group: 'ni',
    lessonTag: 'Bài 4 · Giờ có số',
    promptHira: 'まいあさ 6じ [  ？  ] おきます。',
    promptKanji: '毎朝 6時 [  ？  ] 起きます。',
    vnMeaning: 'Mỗi sáng tôi thức dậy lúc 6 giờ.',
    ttsFullAnswer: 'まいあさ ろくじに おきます。',
    fullSentenceKanji: '毎朝 6時に 起きます。',
    fullSentenceHira: 'まいあさ 6じに おきます。',
    correct: { id: 'ni', hira: 'に', kanji: 'に' },
    traps: [
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'none', hira: '∅ (Không dùng に)', kanji: '∅ (Không dùng に)' },
      { id: 'wo', hira: 'を', kanji: 'を' },
    ],
    trapNote: '6時 là thời điểm chứa con số cụ thể → bắt buộc dùng trợ từ に.',
  },
  {
    id: 'pq_ni_2',
    group: 'ni',
    lessonTag: 'Bài 4 · Thời gian không số',
    promptHira: 'きのう [  ？  ] にほんごを べんきょうしました。',
    promptKanji: '昨日 [  ？  ] 日本語を 勉強しました。',
    vnMeaning: 'Hôm qua tôi đã học tiếng Nhật.',
    ttsFullAnswer: 'きのう にほんごを べんきょうしました。',
    fullSentenceKanji: '昨日 日本語を 勉強しました。',
    fullSentenceHira: 'きのう にほんごを べんきょうしました。',
    correct: { id: 'none', hira: '∅ (Không dùng に)', kanji: '∅ (Không dùng に)' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'no', hira: 'の', kanji: 'の' },
    ],
    trapNote: 'きのう, きょう, あした, 毎朝, 来週... không chứa con số → bỏ trợ từ に.',
  },
  {
    id: 'pq_ni_3',
    group: 'ni',
    lessonTag: 'Bài 5 · Từ hỏi いつ',
    promptHira: 'いつ [  ？  ] にほんへ きましたか。',
    promptKanji: 'いつ [  ？  ] 日本へ 来ましたか。',
    vnMeaning: 'Bạn đã đến Nhật khi nào?',
    ttsFullAnswer: 'いつ にほんへ きましたか。',
    fullSentenceKanji: 'いつ 日本へ 来ましたか。',
    fullSentenceHira: 'いつ にほんへ きましたか。',
    correct: { id: 'none', hira: '∅ (Không dùng に)', kanji: '∅ (Không dùng に)' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
    ],
    trapNote: 'Từ để hỏi いつ (khi nào) không bao giờ đi kèm trợ từ に (không có いつに).',
  },
  {
    id: 'pq_ni_4',
    group: 'ni',
    lessonTag: 'Bài 6 · Bẫy 会います',
    promptHira: 'あした ともだち [  ？  ] あいます。',
    promptKanji: '明日 友達 [  ？  ] 会います。',
    vnMeaning: 'Ngày mai tôi gặp bạn.',
    ttsFullAnswer: 'あした ともだちに あいます。',
    fullSentenceKanji: '明日 友達に 会います。',
    fullSentenceHira: 'あした ともだちに あいます。',
    correct: { id: 'ni', hira: 'に', kanji: 'に' },
    traps: [
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
    ],
    trapNote: 'Động từ 会います (gặp ai) bắt buộc đi với trợ từ に (友達に 会います), không dùng を.',
  },
  {
    id: 'pq_ni_5',
    group: 'ni',
    lessonTag: 'Bài 7 · Người nhận quà',
    promptHira: 'わたしは きむらさん [  ？  ] はなを あげました。',
    promptKanji: 'わたしは 木村さん [  ？  ] 花を あげました。',
    vnMeaning: 'Tôi đã tặng hoa cho chị Kimura.',
    ttsFullAnswer: 'わたしは きむらさんに はなを あげました。',
    fullSentenceKanji: 'わたしは 木村さんに 花を あげました。',
    fullSentenceHira: 'わたしは きむらさんに はなを あげました。',
    correct: { id: 'ni', hira: 'に', kanji: 'に' },
    traps: [
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'kara', hira: 'から', kanji: 'から' },
      { id: 'de', hira: 'で', kanji: 'で' },
    ],
    trapNote: 'Với あげます / 貸します / 教えます, người nhận đứng trước に (không dùng から cho あげます).',
  },
  {
    id: 'pq_ni_6',
    group: 'ni',
    lessonTag: 'Bài 7 · Gọi điện cho ai',
    promptHira: 'まいばん はは [  ？  ] でんわを かけます。',
    promptKanji: '毎晩 母 [  ？  ] 電話を かけます。',
    vnMeaning: 'Mỗi tối tôi gọi điện thoại cho mẹ.',
    ttsFullAnswer: 'まいばん ははに でんわを かけます。',
    fullSentenceKanji: '毎晩 母に 電話を かけます。',
    fullSentenceHira: 'まいばん ははに でんわを かけます。',
    correct: { id: 'ni', hira: 'に', kanji: 'に' },
    traps: [
      { id: 'to', hira: 'と', kanji: 'と' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'wo', hira: 'を', kanji: 'を' },
    ],
    trapNote: 'Gọi điện cho ai dùng cấu trúc: [Người nhận] + に + 電話をかけます.',
  },
  {
    id: 'pq_ni_7',
    group: 'ni',
    lessonTag: 'Bài 7 · Nhận quà từ ai',
    promptHira: 'たんじょうびに ちち [  ？  ] とけいを もらいました。',
    promptKanji: '誕生日に 父 [  ？  ] 時計を もらいました。',
    vnMeaning: 'Vào ngày sinh nhật, tôi đã nhận được đồng hồ từ bố.',
    ttsFullAnswer: 'たんじょうびに ちちに とけいを もらいました。',
    fullSentenceKanji: '誕生日に 父に 時計を もらいました。',
    fullSentenceHira: 'たんじょうびに ちちに とけいを もらいました。',
    correct: { id: 'ni', hira: 'に', kanji: 'に' },
    traps: [
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
    ],
    trapNote: 'Động từ cuối là もらいました (nhận) → 父に mang nghĩa nhận "từ bố".',
  },
  {
    id: 'pq_ni_8',
    group: 'ni',
    lessonTag: 'Bài 7 · Học từ ai',
    promptHira: 'わたしは ワットせんせい [  ？  ] えいごを ならいます。',
    promptKanji: 'わたしは ワット先生 [  ？  ] 英語を 習います。',
    vnMeaning: 'Tôi học tiếng Anh từ thầy Watt.',
    ttsFullAnswer: 'わたしは ワットせんせいに えいごを ならいます。',
    fullSentenceKanji: 'わたしは ワット先生に 英語を 習います。',
    fullSentenceHira: 'わたしは ワットせんせいに えいごを ならいます。',
    correct: { id: 'ni', hira: 'に', kanji: 'に' },
    traps: [
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
    ],
    trapNote: 'Học có thầy hướng dẫn (習います) → người dạy đứng trước に (hoặc から).',
  },
  {
    id: 'pq_ni_9',
    group: 'ni',
    lessonTag: 'Bài 7 · Cấm わたしに あげます',
    promptHira: 'わたしは ミラーさんに はなを [  ？  ]。',
    promptKanji: 'わたしは ミラーさんに 花を [  ？  ]。',
    vnMeaning: 'Tôi đã nhận được hoa từ anh Miller.',
    ttsFullAnswer: 'わたしは ミラーさんに はなを もらいました。',
    fullSentenceKanji: 'わたしは ミラーさんに 花を もらいました。',
    fullSentenceHira: 'わたしは ミラーさんに はなを もらいました。',
    correct: { id: 'moraimashita', hira: 'もらいました', kanji: 'もらいました' },
    traps: [
      { id: 'watashi_ni_age', hira: '(ミラーさんは わたしに) あげました', kanji: '(わたしに) あげました' },
      { id: 'kashimashita', hira: 'かしました', kanji: '貸しました' },
      { id: 'oshiemashita', hira: 'おしえました', kanji: '教えました' },
    ],
    trapNote: 'Ở Bài 7 không nói "ミラーさんは わたしに あげました"; khi mình là người nhận, lấy わたし làm chủ ngữ + もらいました.',
  },

  // ================= NHÓM 3: から・まで (5 câu — Bài 4, 7) =================
  {
    id: 'pq_km_1',
    group: 'kara_made',
    lessonTag: 'Bài 4 · Từ ... đến ...',
    promptHira: 'ぎんこうは 9じ [  ①  ] 3じ [  ②  ] です。',
    promptKanji: '銀行は 9時 [  ①  ] 3時 [  ②  ] です。',
    vnMeaning: 'Ngân hàng làm việc từ 9 giờ đến 3 giờ.',
    ttsFullAnswer: 'ぎんこうは くじから さんじまでです。',
    fullSentenceKanji: '銀行は 9時から 3時までです。',
    fullSentenceHira: 'ぎんこうは 9じから 3じまでです。',
    correct: { id: 'kara_made', hira: '① から ／ ② まで', kanji: '① から ／ ② まで' },
    traps: [
      { id: 'made_kara', hira: '① まで ／ ② から', kanji: '① まで ／ ② から' },
      { id: 'ni_made', hira: '① に ／ ② まで', kanji: '① に ／ ② まで' },
      { id: 'kara_ni', hira: '① から ／ ② に', kanji: '① から ／ ② に' },
    ],
    trapNote: 'Điểm bắt đầu đi với から (từ), điểm kết thúc đi với まで (đến).',
  },
  {
    id: 'pq_km_2',
    group: 'kara_made',
    lessonTag: 'Bài 7 · Tổ chức cho vay',
    promptHira: 'ぎんこう [  ？  ] おかねを かりました。',
    promptKanji: '銀行 [  ？  ] お金を 借りました。',
    vnMeaning: 'Tôi đã vay tiền từ ngân hàng.',
    ttsFullAnswer: 'ぎんこうから おかねを かりました。',
    fullSentenceKanji: '銀行から お金を 借りました。',
    fullSentenceHira: 'ぎんこうから おかねを かりました。',
    correct: { id: 'kara', hira: 'から', kanji: 'から' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
    ],
    trapNote: '銀行 (ngân hàng) là cơ quan / tổ chức chứ không phải cá nhân → bắt buộc dùng から, không dùng に!',
  },
  {
    id: 'pq_km_3',
    group: 'kara_made',
    lessonTag: 'Bài 7 · Nhận quà từ tổ chức',
    promptHira: 'だいがく [  ？  ] プレゼントを もらいました。',
    promptKanji: '大学 [  ？  ] プレゼントを もらいました。',
    vnMeaning: 'Tôi đã nhận được quà từ trường đại học.',
    ttsFullAnswer: 'だいがくから プレゼントを もらいました。',
    fullSentenceKanji: '大学から プレゼントを もらいました。',
    fullSentenceHira: 'だいがくから プレゼントを もらいました。',
    correct: { id: 'kara', hira: 'から', kanji: 'から' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'to', hira: 'と', kanji: 'と' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
    ],
    trapNote: '大学 (trường đại học) là tổ chức → khi nhận từ tổ chức phải dùng から thay cho に.',
  },
  {
    id: 'pq_km_4',
    group: 'kara_made',
    lessonTag: 'Bài 4 · Khoảng làm việc',
    promptHira: 'ひるやすみは 12じ [  ？  ] 1じまでです。',
    promptKanji: '昼休みは 12時 [  ？  ] 1時までです。',
    vnMeaning: 'Giờ nghỉ trưa từ 12 giờ đến 1 giờ.',
    ttsFullAnswer: 'ひるやすみは じゅうにじから いちじまでです。',
    fullSentenceKanji: '昼休みは 12時から 1時までです。',
    fullSentenceHira: 'ひるやすみは 12じから 1じまでです。',
    correct: { id: 'kara', hira: 'から', kanji: 'から' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'to', hira: 'と', kanji: 'と' },
    ],
    trapNote: 'Phía sau có 1時まで (đến 1 giờ) → phía trước dùng 12時から (từ 12 giờ).',
  },
  {
    id: 'pq_km_5',
    group: 'kara_made',
    lessonTag: 'Bài 5 · Đến từ nước nào',
    promptHira: 'わたしは ベトナム [  ？  ] きました。',
    promptKanji: 'わたしは ベトナム [  ？  ] 来ました。',
    vnMeaning: 'Tôi đến từ Việt Nam.',
    ttsFullAnswer: 'わたしは ベトナムから きました。',
    fullSentenceKanji: 'わたしは ベトナムから 来ました。',
    fullSentenceHira: 'わたしは ベトナムから きました。',
    correct: { id: 'kara', hira: 'から', kanji: 'から' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'no', hira: 'の', kanji: 'の' },
    ],
    trapNote: 'Xuất phát từ quốc gia / quê hương nào dùng [Tên nước] + から 来ました.',
  },

  // ================= NHÓM 4: を (5 câu — Bài 3, 6, 7) =================
  {
    id: 'pq_wo_1',
    group: 'wo',
    lessonTag: 'Bài 3 · Mua hàng',
    promptHira: 'すみません、その ワイン [  ？  ] ください。',
    promptKanji: 'すみません、その ワイン [  ？  ] ください。',
    vnMeaning: 'Xin lỗi, cho tôi lấy chai rượu vang đó.',
    ttsFullAnswer: 'すみません、そのワインを ください。',
    fullSentenceKanji: 'すみません、その ワインを ください。',
    fullSentenceHira: 'すみません、その ワインを ください。',
    correct: { id: 'wo', hira: 'を', kanji: 'を' },
    traps: [
      { id: 'wa', hira: 'は', kanji: 'は' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'de', hira: 'で', kanji: 'で' },
    ],
    trapNote: 'Khi chọn mua hoặc xin đồ vật dùng mẫu cố định: N + を + ください.',
  },
  {
    id: 'pq_wo_2',
    group: 'wo',
    lessonTag: 'Bài 6 · Ngoại động từ',
    promptHira: 'まいばん うちで しんぶん [  ？  ] よみます。',
    promptKanji: '毎晩 うちで 新聞 [  ？  ] 読みます。',
    vnMeaning: 'Mỗi tối tôi đọc báo ở nhà.',
    ttsFullAnswer: 'まいばん うちで しんぶんを よみます。',
    fullSentenceKanji: '毎晩 うちで 新聞を 読みます。',
    fullSentenceHira: 'まいばん うちで しんぶんを よみます。',
    correct: { id: 'wo', hira: 'を', kanji: 'を' },
    traps: [
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'no', hira: 'の', kanji: 'の' },
    ],
    trapNote: '新聞 (tờ báo) là đối tượng trực tiếp của 読みます (đọc) → dùng trợ từ を.',
  },
  {
    id: 'pq_wo_3',
    group: 'wo',
    lessonTag: 'Bài 6 · N を します',
    promptHira: 'にちようびに ともだちと サッカー [  ？  ] します。',
    promptKanji: '日曜日に 友達と サッカー [  ？  ] します。',
    vnMeaning: 'Chủ nhật tôi chơi bóng đá cùng bạn.',
    ttsFullAnswer: 'にちようびに ともだちと サッカーを します。',
    fullSentenceKanji: '日曜日に 友達と サッカーを します。',
    fullSentenceHira: 'にちようびに ともだちと サッカーを します。',
    correct: { id: 'wo', hira: 'を', kanji: 'を' },
    traps: [
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'he', hira: 'へ', kanji: 'へ' },
    ],
    trapNote: 'Các môn thể thao, trò chơi, sự kiện đi với を + します (サッカーを します).',
  },
  {
    id: 'pq_wo_4',
    group: 'wo',
    lessonTag: 'Bài 6 · Bẫy 何も',
    promptHira: 'けさ なにも [  ？  ] たべませんでした。',
    promptKanji: '今朝 何も [  ？  ] 食べませんでした。',
    vnMeaning: 'Sáng nay tôi đã không ăn gì cả.',
    ttsFullAnswer: 'けさ なにも たべませんでした。',
    fullSentenceKanji: '今朝 何も 食べませんでした。',
    fullSentenceHira: 'けさ なにも たべませんでした。',
    correct: { id: 'none', hira: '∅ (Không thêm を)', kanji: '∅ (Không thêm を)' },
    traps: [
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'ni', hira: 'に', kanji: 'に' },
    ],
    trapNote: 'Trong 何も + V-ません, trợ từ も đã thay thế hoàn toàn trợ từ を (cấm nói 何もを).',
  },
  {
    id: 'pq_wo_5',
    group: 'wo',
    lessonTag: 'Bài 7 · Khung に ... を',
    promptHira: 'カリナさん [  ①  ] CD [  ②  ] かしました。',
    promptKanji: 'カリナさん [  ①  ] CD [  ②  ] 貸しました。',
    vnMeaning: 'Tôi đã cho chị Karina mượn đĩa CD.',
    ttsFullAnswer: 'カリナさんに シーディーを かしました。',
    fullSentenceKanji: 'カリナさんに CDを 貸しました。',
    fullSentenceHira: 'カリナさんに CDを かしました。',
    correct: { id: 'ni_wo', hira: '① に ／ ② を', kanji: '① に ／ ② を' },
    traps: [
      { id: 'wo_ni', hira: '① を ／ ② に', kanji: '① を ／ ② に' },
      { id: 'to_wo', hira: '① と ／ ② を', kanji: '① と ／ ② を' },
      { id: 'ni_de', hira: '① に ／ ② で', kanji: '① に ／ ② で' },
    ],
    trapNote: 'Khung cố định Bài 7: [Người] + に + [Đồ vật] + を + 貸しました / あげました / もらいました.',
  },

  // ================= NHÓM 5: へ (3 câu — Bài 5, 7) =================
  {
    id: 'pq_he_1',
    group: 'he',
    lessonTag: 'Bài 5 · Hướng đi',
    promptHira: 'らいしゅう きょうと [  ？  ] いきます。',
    promptKanji: '来週 京都 [  ？  ] 行きます。',
    vnMeaning: 'Tuần sau tôi sẽ đi Kyoto.',
    ttsFullAnswer: 'らいしゅう きょうとへ いきます。',
    fullSentenceKanji: '来週 京都へ 行きます。',
    fullSentenceHira: 'らいしゅう きょうとへ いきます。',
    correct: { id: 'he', hira: 'へ', kanji: 'へ' },
    traps: [
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'to', hira: 'と', kanji: 'と' },
    ],
    trapNote: 'Đích di chuyển với 行きます / 来ます / 帰ります dùng trợ từ へ (đọc là "e").',
  },
  {
    id: 'pq_he_2',
    group: 'he',
    lessonTag: 'Bài 5 · Phủ định どこへも',
    promptHira: 'にちようびは どこ [  ？  ] いきませんでした。',
    promptKanji: '日曜日は どこ [  ？  ] 行きませんでした。',
    vnMeaning: 'Chủ nhật tôi đã không đi đâu cả.',
    ttsFullAnswer: 'にちようびは どこへも いきませんでした。',
    fullSentenceKanji: '日曜日は どこへも 行きませんでした。',
    fullSentenceHira: 'にちようびは どこへも いきませんでした。',
    correct: { id: 'hemo', hira: 'へも', kanji: 'へも' },
    traps: [
      { id: 'he', hira: 'へ', kanji: 'へ' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'ni', hira: 'に', kanji: 'に' },
    ],
    trapNote: 'Phủ định hoàn toàn hướng đi: どこへも (hoặc どこも) + 行きませんでした.',
  },
  {
    id: 'pq_he_3',
    group: 'he',
    lessonTag: 'Bài 7 · Gửi hàng sang nước nào',
    promptHira: 'ゆうびんきょくで インドネシア [  ？  ] にもつを おくりました。',
    promptKanji: '郵便局で インドネシア [  ？  ] 荷物を 送りました。',
    vnMeaning: 'Tôi đã gửi kiện hàng sang Indonesia ở bưu điện.',
    ttsFullAnswer: 'ゆうびんきょくで インドネシアへ にもつを おくりました。',
    fullSentenceKanji: '郵便局で インドネシアへ 荷物を 送りました。',
    fullSentenceHira: 'ゆうびんきょくで インドネシアへ にもつを おくりました。',
    correct: { id: 'he', hira: 'へ', kanji: 'へ' },
    traps: [
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'to', hira: 'と', kanji: 'と' },
    ],
    trapNote: 'Gửi đồ sang quốc gia / địa danh nào chỉ phương hướng → dùng へ (còn người nhận dùng に).',
  },

  // ================= NHÓM 6: と (3 câu — Bài 4, 5) =================
  {
    id: 'pq_to_1',
    group: 'to',
    lessonTag: 'Bài 4 · Nối danh từ',
    promptHira: 'やすみは どようび [  ？  ] にちようびです。',
    promptKanji: '休みは 土曜日 [  ？  ] 日曜日です。',
    vnMeaning: 'Ngày nghỉ là thứ Bảy và Chủ nhật.',
    ttsFullAnswer: 'やすみは どようびと にちようびです。',
    fullSentenceKanji: '休みは 土曜日と 日曜日です。',
    fullSentenceHira: 'やすみは どようびと にちようびです。',
    correct: { id: 'to', hira: 'と', kanji: 'と' },
    traps: [
      { id: 'no', hira: 'の', kanji: 'の' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'ni', hira: 'に', kanji: 'に' },
    ],
    trapNote: 'Nối liệt kê đầy đủ 2 danh từ ("và") dùng trợ từ と.',
  },
  {
    id: 'pq_to_2',
    group: 'to',
    lessonTag: 'Bài 5 · Làm cùng ai',
    promptHira: 'かぞく [  ？  ] にほんへ きました。',
    promptKanji: '家族 [  ？  ] 日本へ 来ました。',
    vnMeaning: 'Tôi đã đến Nhật cùng với gia đình.',
    ttsFullAnswer: 'かぞくと にほんへ きました。',
    fullSentenceKanji: '家族と 日本へ 来ました。',
    fullSentenceHira: 'かぞくと にほんへ きました。',
    correct: { id: 'to', hira: 'と', kanji: 'と' },
    traps: [
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'wo', hira: 'を', kanji: 'を' },
    ],
    trapNote: 'Thực hiện hành động cùng ai (家族 - gia đình) → dùng trợ từ と.',
  },
  {
    id: 'pq_to_3',
    group: 'to',
    lessonTag: 'Bài 5 · Bẫy đáp câu hỏi だれと',
    promptHira: 'だれと ひろしまへ いきますか。 ── ひとり [  ？  ] いきます。',
    promptKanji: 'だれと 広島へ 行きますか。 ── 一人 [  ？  ] 行きます。',
    vnMeaning: 'Bạn đi Hiroshima với ai? ── Tôi đi một mình.',
    ttsFullAnswer: 'だれと ひろしまへ いきますか。 ひとりで いきます。',
    fullSentenceKanji: 'だれと 広島へ 行きますか。 ── 一人で 行きます。',
    fullSentenceHira: 'だれと ひろしまへ いきますか。 ── ひとりで いきます。',
    correct: { id: 'de', hira: 'で', kanji: 'で' },
    traps: [
      { id: 'to', hira: 'と', kanji: 'と' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'none', hira: '∅ (Không dùng trợ từ)', kanji: '∅ (Không dùng trợ từ)' },
    ],
    trapNote: 'Dù câu hỏi là だれと, khi trả lời "một mình" bắt buộc đổi sang 一人で (không lặp と).',
  },

  // ================= NHÓM 7: の (3 câu — Bài 1, 2, 3, 5) =================
  {
    id: 'pq_no_1',
    group: 'no',
    lessonTag: 'Bài 1 · Thuộc tổ chức',
    promptHira: 'ミラーさんは IMC [  ？  ] しゃいんです。',
    promptKanji: 'ミラーさんは IMC [  ？  ] 社員です。',
    vnMeaning: 'Anh Miller là nhân viên của công ty IMC.',
    ttsFullAnswer: 'ミラーさんは アイエムシーの しゃいんです。',
    fullSentenceKanji: 'ミラーさんは IMCの 社員です。',
    fullSentenceHira: 'ミラーさんは IMCの しゃいんです。',
    correct: { id: 'no', hira: 'の', kanji: 'の' },
    traps: [
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'to', hira: 'と', kanji: 'と' },
    ],
    trapNote: 'Chỉ sự trực thuộc cơ quan / trường học (nhân viên của IMC) dùng N1 の N2.',
  },
  {
    id: 'pq_no_2',
    group: 'no',
    lessonTag: 'Bài 2–3 · Bố nghĩa danh từ',
    promptHira: 'これは にほんご [  ？  ] じしょです。',
    promptKanji: 'これは 日本語 [  ？  ] 辞書です。',
    vnMeaning: 'Đây là cuốn từ điển tiếng Nhật.',
    ttsFullAnswer: 'これは にほんごの じしょです。',
    fullSentenceKanji: 'これは 日本語の 辞書です。',
    fullSentenceHira: 'これは にほんごの じしょです。',
    correct: { id: 'no', hira: 'の', kanji: 'の' },
    traps: [
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'wo', hira: 'を', kanji: 'を' },
      { id: 'ni', hira: 'に', kanji: 'に' },
    ],
    trapNote: 'Nối 2 danh từ chỉ nội dung của sách/từ điển dùng の (còn viết/nói bằng tiếng Nhật với động từ mới dùng で!).',
  },
  {
    id: 'pq_no_3',
    group: 'no',
    lessonTag: 'Bài 5 · Nối Năm + Tháng',
    promptHira: 'らいねん [  ？  ] 3がつに くにへ かえります。',
    promptKanji: '来年 [  ？  ] 3月に 国へ 帰ります。',
    vnMeaning: 'Tháng 3 năm sau tôi sẽ về nước.',
    ttsFullAnswer: 'らいねんの さんがつに くにへ かえります。',
    fullSentenceKanji: '来年の 3月に 国へ 帰ります。',
    fullSentenceHira: 'らいねんの 3がつに くにへ かえります。',
    correct: { id: 'no', hira: 'の', kanji: 'の' },
    traps: [
      { id: 'ni', hira: 'に', kanji: 'に' },
      { id: 'de', hira: 'で', kanji: 'で' },
      { id: 'to', hira: 'と', kanji: 'と' },
    ],
    trapNote: 'Ghép 2 danh từ thời gian (Tháng 3 của năm sau) dùng の ở giữa: 来年の 3月に.',
  },

  // ================= NHÓM 8: は・も (4 câu — Bài 1, 7) =================
  {
    id: 'pq_wm_1',
    group: 'wa_mo',
    lessonTag: 'Bài 1 · Tương đồng も',
    promptHira: 'やまださんは かいしゃいんです。サントスさん [  ？  ] かいしゃいんです。',
    promptKanji: '山田さんは 会社員です。サントスさん [  ？  ] 会社員です。',
    vnMeaning: 'Anh Yamada là nhân viên công ty. Anh Santos cũng là nhân viên công ty.',
    ttsFullAnswer: 'やまださんは かいしゃいんです。サントスさんも かいしゃいんです。',
    fullSentenceKanji: '山田さんは 会社員です。サントスさんも 会社員です。',
    fullSentenceHira: 'やまださんは かいしゃいんです。サントスさんも かいしゃいんです。',
    correct: { id: 'mo', hira: 'も', kanji: 'も' },
    traps: [
      { id: 'wa', hira: 'は', kanji: 'は' },
      { id: 'to', hira: 'と', kanji: 'と' },
      { id: 'no', hira: 'の', kanji: 'の' },
    ],
    trapNote: 'Khi vị ngữ lặp lại giống câu trước ("cũng là..."), dùng も thay cho は.',
  },
  {
    id: 'pq_wm_2',
    group: 'wa_mo',
    lessonTag: 'Bài 7 · Trợ từ ghép にも',
    promptHira: 'まいばん ははに でんわを かけます。にちようびは ちち [  ？  ] かけます。',
    promptKanji: '毎晩 母に 電話を かけます。日曜日は 父 [  ？  ] かけます。',
    vnMeaning: 'Tối nào tôi cũng gọi cho mẹ. Chủ nhật tôi gọi cho cả bố nữa.',
    ttsFullAnswer: 'まいばん ははに でんわを かけます。にちようびは ちちにも かけます。',
    fullSentenceKanji: '毎晩 母に 電話を かけます。日曜日は 父にも かけます。',
    fullSentenceHira: 'まいばん ははに でんわを かけます。にちようびは ちちにも かけます。',
    correct: { id: 'nimo', hira: 'にも', kanji: 'にも' },
    traps: [
      { id: 'mo', hira: 'も', kanji: 'も' },
      { id: 'dewa', hira: 'では', kanji: 'では' },
      { id: 'womo', hira: 'をも', kanji: 'をも' },
    ],
    trapNote: 'Gọi cho ai dùng に + cộng thêm "cả bố nữa" (も) → ghép thành 父にも (giữ nguyên に, không bỏ に!).',
  },
  {
    id: 'pq_wm_3',
    group: 'wa_mo',
    lessonTag: 'Bài 7 · Trợ từ ghép には',
    promptHira: 'ちちに おちゃを おくります。はは [  ？  ] チョコレートです。',
    promptKanji: '父に お茶を 送ります。母 [  ？  ] チョコレートです。',
    vnMeaning: 'Tôi gửi trà cho bố. Còn riêng cho mẹ thì là sô-cô-la.',
    ttsFullAnswer: 'ちちに おちゃを おくります。ははには チョコレートです。',
    fullSentenceKanji: '父に お茶を 送ります。母には チョコレートです。',
    fullSentenceHira: 'ちちに おちゃを おくります。ははには チョコレートです。',
    correct: { id: 'niwa', hira: 'には', kanji: 'には' },
    traps: [
      { id: 'nimo', hira: 'にも', kanji: 'にも' },
      { id: 'woni', hira: 'をに', kanji: 'をに' },
      { id: 'tono', hira: 'との', kanji: 'との' },
    ],
    trapNote: 'Nhấn mạnh đối lập người nhận thứ hai ("còn đối với mẹ thì...") dùng に + は → 母には.',
  },
  {
    id: 'pq_wm_4',
    group: 'wa_mo',
    lessonTag: 'Bài 7 · もう vs まだ',
    promptHira: 'もう ばんごはんを たべましたか。 ── いいえ、[  ？  ]。',
    promptKanji: 'もう 晩ご飯を 食べましたか。 ── いいえ、[  ？  ]。',
    vnMeaning: 'Bạn đã ăn tối chưa? ── Không, vẫn chưa.',
    ttsFullAnswer: 'もう ばんごはんを たべましたか。いいえ、まだです。',
    fullSentenceKanji: 'もう 晩ご飯を 食べましたか。 ── いいえ、まだです。',
    fullSentenceHira: 'もう ばんごはんを たべましたか。 ── いいえ、まだです。',
    correct: { id: 'madadesu', hira: 'まだです', kanji: 'まだです' },
    traps: [
      { id: 'tabemasendeshita', hira: 'たべませんでした', kanji: '食べませんでした' },
      { id: 'moudesu', hira: 'もうです', kanji: 'もうです' },
      { id: 'souja', hira: 'そうじゃありません', kanji: 'そうじゃありません' },
    ],
    trapNote: 'Câu hỏi có もう ("đã ... chưa?") khi trả lời "chưa" dùng いいえ、まだです (không dùng 食べませんでした).',
  },
];

export function getParticlePoolByScope(scope: ParticleQuizScope): ParticleQuizBankItem[] {
  if (scope === 'all') return PARTICLE_QUIZ_BANK;
  return PARTICLE_QUIZ_BANK.filter((item) => item.group === scope);
}

export function buildParticleQuizQuestion(
  item: ParticleQuizBankItem,
  mode: ParticleQuizMode
): ParticleQuizQuestion {
  const promptType: ConcreteParticlePrompt =
    mode === 'mixed' ? (Math.random() < 0.5 ? 'hira' : 'kanji') : mode;

  const rawOptions: ParticleQuizOption[] = [
    {
      id: item.correct.id,
      label: promptType === 'hira' ? item.correct.hira : item.correct.kanji,
    },
    ...item.traps.map((t) => ({
      id: t.id,
      label: promptType === 'hira' ? t.hira : t.kanji,
    })),
  ];

  return {
    id: item.id,
    group: item.group,
    promptType,
    lessonTag: item.lessonTag,
    promptText: promptType === 'hira' ? item.promptHira : item.promptKanji,
    vnMeaning: item.vnMeaning,
    ttsFullAnswer: item.ttsFullAnswer,
    correctId: item.correct.id,
    correctDisplay: promptType === 'hira' ? item.correct.hira : item.correct.kanji,
    fullSentenceKanji: item.fullSentenceKanji,
    fullSentenceHira: item.fullSentenceHira,
    options: fisherYatesShuffle(rawOptions),
    trapNote: item.trapNote,
  };
}
