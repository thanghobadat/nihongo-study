export type Lesson4Topic = 'conjugation' | 'qa_reply';
export type Lesson4Mode = 'hira' | 'kanji' | 'mixed';
export type Lesson4ConcretePrompt = 'hira' | 'kanji';

export interface Lesson4Option {
  id: string;
  label: string;
}

export interface Lesson4PracticeQuestion {
  topic: Lesson4Topic;
  promptType: Lesson4ConcretePrompt;
  badgeText: string;
  badgeTone: 'affirmative' | 'negative';
  promptHira: string;
  promptKanji: string;
  contextHint: string;
  ttsFullAnswer: string;
  correctId: string;
  correctDisplay: string;
  fullSentenceKanji: string;
  fullSentenceHira: string;
  options: Lesson4Option[];
  trapNote: string;
}

interface VerbFormPair {
  id: string;
  hira: string;
  kanji: string;
}

interface ConjugationBankItem {
  id: string;
  polarity: 'affirmative' | 'negative';
  promptHira: string;
  promptKanji: string;
  baseVerbLabel: string;
  vnMeaning: string;
  ttsFullAnswer: string;
  fullSentenceKanji: string;
  fullSentenceHira: string;
  correct: VerbFormPair;
  traps: [VerbFormPair, VerbFormPair, VerbFormPair];
  trapNote: string;
}

interface QaReplyBankItem {
  id: string;
  replyLead: 'はい' | 'いいえ';
  questionHira: string;
  questionKanji: string;
  vnMeaning: string;
  ttsFullAnswer: string;
  fullSentenceKanji: string;
  fullSentenceHira: string;
  correct: VerbFormPair;
  traps: [VerbFormPair, VerbFormPair, VerbFormPair];
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

function resolvePromptType(mode: Lesson4Mode): Lesson4ConcretePrompt {
  if (mode !== 'mixed') return mode;
  return Math.random() < 0.5 ? 'hira' : 'kanji';
}

/**
 * Ngân hàng 18 câu luyện phản xạ Chia Thì (Quá khứ / Hiện tại / Tương lai) & Thể
 * Bao phủ đủ 6 động từ Bài 4 (おきます, ねます, はたらきます, やすみます, べんきょうします, おわります).
 */
export const CONJUGATION_TRAP_BANK: ConjugationBankItem[] = [
  {
    id: 'c1',
    polarity: 'negative',
    promptHira: 'きのう 11じに 【 ？ 】。',
    promptKanji: '昨日 11時に 【 ？ 】。',
    baseVerbLabel: 'ねます (寝ます • đi ngủ)',
    vnMeaning: 'Hôm qua tôi đã không ngủ lúc 11 giờ.',
    ttsFullAnswer: 'きのう じゅういちじに ねませんでした。',
    fullSentenceKanji: '昨日 11時に 寝ませんでした。',
    fullSentenceHira: 'きのう 11じに ねませんでした。',
    correct: { id: 'nemasendeshita', hira: 'ねませんでした', kanji: '寝ませんでした' },
    traps: [
      { id: 'nemasen', hira: 'ねません', kanji: '寝ません' },
      { id: 'nemashita', hira: 'ねました', kanji: '寝ました' },
      { id: 'nemasendatta', hira: 'ねませんだった', kanji: '寝ませんだった' },
    ],
    trapNote:
      'きのう (hôm qua) là Quá khứ + Phủ định → ねませんでした (tuyệt đối KHÔNG ghép ねませんだった!).',
  },
  {
    id: 'c2',
    polarity: 'affirmative',
    promptHira: 'きのう 9じから 5じまで 【 ？ 】。',
    promptKanji: '昨日 9時から 5時まで 【 ？ 】。',
    baseVerbLabel: 'はたらきます (働きます • làm việc)',
    vnMeaning: 'Hôm qua tôi đã làm việc từ 9 giờ đến 5 giờ.',
    ttsFullAnswer: 'きのう くじから ごじまで はたらきました。',
    fullSentenceKanji: '昨日 9時から 5時まで 働きました。',
    fullSentenceHira: 'きのう 9じから 5じまで はたらきました。',
    correct: { id: 'hatarakimashita', hira: 'はたらきました', kanji: '働きました' },
    traps: [
      { id: 'hatarakimasu', hira: 'はたらきます', kanji: '働きます' },
      { id: 'hatarakimasendeshita', hira: 'はたらきませんでした', kanji: '働きませんでした' },
      { id: 'hatarakimasen', hira: 'はたらきません', kanji: '働きません' },
    ],
    trapNote:
      'きのう (hôm qua) bắt buộc chia Quá khứ + Khẳng định → はたらきました (働きました).',
  },
  {
    id: 'c3',
    polarity: 'negative',
    promptHira: 'おととい にほんごを 【 ？ 】。',
    promptKanji: '一昨日 日本語を 【 ？ 】。',
    baseVerbLabel: 'べんきょうします (勉強します • học tập)',
    vnMeaning: 'Hôm kia tôi đã không học tiếng Nhật.',
    ttsFullAnswer: 'おととい にほんごを べんきょうしませんでした。',
    fullSentenceKanji: '一昨日 日本語を 勉強しませんでした。',
    fullSentenceHira: 'おととい にほんごを べんきょうしませんでした。',
    correct: {
      id: 'benkyoushimasendeshita',
      hira: 'べんきょうしませんでした',
      kanji: '勉強しませんでした',
    },
    traps: [
      { id: 'benkyoushimasen', hira: 'べんきょうしません', kanji: '勉強しません' },
      { id: 'benkyoushimashita', hira: 'べんきょうしました', kanji: '勉強しました' },
      {
        id: 'benkyoushimasendatta',
        hira: 'べんきょうしませんだった',
        kanji: '勉強しませんだった',
      },
    ],
    trapNote:
      'おととい (hôm kia) là Quá khứ + Phủ định → べんきょうしませんでした (ません + でした).',
  },
  {
    id: 'c4',
    polarity: 'affirmative',
    promptHira: 'あした 6じに 【 ？ 】。',
    promptKanji: '明日 6時に 【 ？ 】。',
    baseVerbLabel: 'おきます (起きます • thức dậy)',
    vnMeaning: 'Ngày mai tôi sẽ thức dậy lúc 6 giờ.',
    ttsFullAnswer: 'あした ろくじに おきます。',
    fullSentenceKanji: '明日 6時に 起きます。',
    fullSentenceHira: 'あした 6じに おきます。',
    correct: { id: 'okimasu', hira: 'おきます', kanji: '起きます' },
    traps: [
      { id: 'okimashita', hira: 'おきました', kanji: '起きました' },
      { id: 'okimasen', hira: 'おきません', kanji: '起きません' },
      { id: 'okimasendeshita', hira: 'おきませんでした', kanji: '起きませんでした' },
    ],
    trapNote:
      'あした (ngày mai) là Tương lai → chia giống hệt Hiện tại: おきます.',
  },
  {
    id: 'c5',
    polarity: 'affirmative',
    promptHira: 'あさって かいしゃを 【 ？ 】。',
    promptKanji: '明後日 会社を 【 ？ 】。',
    baseVerbLabel: 'やすみます (休みます • nghỉ)',
    vnMeaning: 'Ngày kia tôi sẽ nghỉ làm ở công ty.',
    ttsFullAnswer: 'あさって かいしゃを やすみます。',
    fullSentenceKanji: '明後日 会社を 休みます。',
    fullSentenceHira: 'あさって かいしゃを やすみます。',
    correct: { id: 'yasumimasu', hira: 'やすみます', kanji: '休みます' },
    traps: [
      { id: 'yasumimashita', hira: 'やすみました', kanji: '休みました' },
      { id: 'yasumimasen', hira: 'やすみません', kanji: '休みません' },
      { id: 'yasumimasendeshita', hira: 'やすみませんでした', kanji: '休みませんでした' },
    ],
    trapNote:
      'あさって (ngày kia) là Tương lai + Khẳng định → dùng đuôi ます: やすみます.',
  },
  {
    id: 'c6',
    polarity: 'negative',
    promptHira: 'あしたは にちようびですから、【 ？ 】。',
    promptKanji: '明日は 日曜日ですから、【 ？ 】。',
    baseVerbLabel: 'はたらきます (働きます • làm việc)',
    vnMeaning: 'Ngày mai là Chủ nhật nên tôi sẽ không làm việc.',
    ttsFullAnswer: 'あしたは にちようびですから、はたらきません。',
    fullSentenceKanji: '明日は 日曜日ですから、働きません。',
    fullSentenceHira: 'あしたは にちようびですから、はたらきません。',
    correct: { id: 'hatarakimasen', hira: 'はたらきません', kanji: '働きません' },
    traps: [
      { id: 'hatarakimasendeshita', hira: 'はたらきませんでした', kanji: '働きませんでした' },
      { id: 'hatarakimasu', hira: 'はたらきます', kanji: '働きます' },
      { id: 'hatarakimashita', hira: 'はたらきました', kanji: '働きました' },
    ],
    trapNote:
      'あした (tương lai) + Phủ định → dùng đuôi ません: はたらきません (không thêm でした!).',
  },
  {
    id: 'c7',
    polarity: 'affirmative',
    promptHira: 'まいあさ 6じはんに 【 ？ 】。',
    promptKanji: '毎朝 6時半に 【 ？ 】。',
    baseVerbLabel: 'おきます (起きます • thức dậy)',
    vnMeaning: 'Mỗi sáng tôi đều thức dậy lúc 6 giờ rưỡi.',
    ttsFullAnswer: 'まいあさ ろくじはんに おきます。',
    fullSentenceKanji: '毎朝 6時半に 起きます。',
    fullSentenceHira: 'まいあさ 6じはんに おきます。',
    correct: { id: 'okimasu', hira: 'おきます', kanji: '起きます' },
    traps: [
      { id: 'okimashita', hira: 'おきました', kanji: '起きました' },
      { id: 'okimasen', hira: 'おきません', kanji: '起きません' },
      { id: 'okimasendeshita', hira: 'おきませんでした', kanji: '起きませんでした' },
    ],
    trapNote:
      'まいあさ (mỗi sáng) là Hiện tại thói quen + Khẳng định → おきます.',
  },
  {
    id: 'c8',
    polarity: 'affirmative',
    promptHira: 'まいばん 11じはんに 【 ？ 】。',
    promptKanji: '毎晩 11時半に 【 ？ 】。',
    baseVerbLabel: 'ねます (寝ます • đi ngủ)',
    vnMeaning: 'Mỗi tối tôi đi ngủ lúc 11 giờ rưỡi.',
    ttsFullAnswer: 'まいばん じゅういちじはんに ねます。',
    fullSentenceKanji: '毎晩 11時半に 寝ます。',
    fullSentenceHira: 'まいばん 11じはんに ねます。',
    correct: { id: 'nemasu', hira: 'ねます', kanji: '寝ます' },
    traps: [
      { id: 'nemashita', hira: 'ねました', kanji: '寝ました' },
      { id: 'nemasen', hira: 'ねません', kanji: '寝ません' },
      { id: 'nemasendeshita', hira: 'ねませんでした', kanji: '寝ませんでした' },
    ],
    trapNote:
      'まいばん (mỗi tối) là Hiện tại thường nhật + Khẳng định → ねます.',
  },
  {
    id: 'c9',
    polarity: 'affirmative',
    promptHira: 'まいにち にほんごを 【 ？ 】。',
    promptKanji: '毎日 日本語を 【 ？ 】。',
    baseVerbLabel: 'べんきょうします (勉強します • học tập)',
    vnMeaning: 'Mỗi ngày tôi đều học tiếng Nhật.',
    ttsFullAnswer: 'まいにち にほんごを べんきょうします。',
    fullSentenceKanji: '毎日 日本語を 勉強します。',
    fullSentenceHira: 'まいにち にほんごを べんきょうします。',
    correct: { id: 'benkyoushimasu', hira: 'べんきょうします', kanji: '勉強します' },
    traps: [
      { id: 'benkyoushimashita', hira: 'べんきょうしました', kanji: '勉強しました' },
      { id: 'benkyoushimasen', hira: 'べんきょうしません', kanji: '勉強しません' },
      {
        id: 'benkyoushimasendeshita',
        hira: 'べんきょうしませんでした',
        kanji: '勉強しませんでした',
      },
    ],
    trapNote:
      'まいにち (mỗi ngày) là Hiện tại lặp lại → chia べんきょうします.',
  },
  {
    id: 'c10',
    polarity: 'affirmative',
    promptHira: '（Nói lúc tối）けさ 7じに 【 ？ 】。',
    promptKanji: '（Nói lúc tối）今朝 7時に 【 ？ 】。',
    baseVerbLabel: 'おきます (起きます • thức dậy)',
    vnMeaning: '(Kể vào buổi tối) Sáng nay tôi đã dậy lúc 7 giờ.',
    ttsFullAnswer: 'けさ しちじに おきました。',
    fullSentenceKanji: '今朝 7時に 起きました。',
    fullSentenceHira: 'けさ 7じに おきました。',
    correct: { id: 'okimashita', hira: 'おきました', kanji: '起きました' },
    traps: [
      { id: 'okimasu', hira: 'おきます', kanji: '起きます' },
      { id: 'okimasendeshita', hira: 'おきませんでした', kanji: '起きませんでした' },
      { id: 'okimasen', hira: 'おきません', kanji: '起きません' },
    ],
    trapNote:
      'けさ (今朝 - sáng nay) khi nói lúc tối đã trôi qua → chia Quá khứ: おきました!',
  },
  {
    id: 'c11',
    polarity: 'negative',
    promptHira: '（Nói lúc chiều）けさ 【 ？ 】。',
    promptKanji: '（Nói lúc chiều）今朝 【 ？ 】。',
    baseVerbLabel: 'べんきょうします (勉強します • học tập)',
    vnMeaning: '(Kể vào buổi chiều) Sáng nay tôi đã không học bài.',
    ttsFullAnswer: 'けさ べんきょうしませんでした。',
    fullSentenceKanji: '今朝 勉強しませんでした。',
    fullSentenceHira: 'けさ べんきょうしませんでした。',
    correct: {
      id: 'benkyoushimasendeshita',
      hira: 'べんきょうしませんでした',
      kanji: '勉強しませんでした',
    },
    traps: [
      { id: 'benkyoushimasen', hira: 'べんきょうしません', kanji: '勉強しません' },
      { id: 'benkyoushimashita', hira: 'べんきょうしました', kanji: '勉強しました' },
      {
        id: 'benkyoushimasendatta',
        hira: 'べんきょうしませんだった',
        kanji: '勉強しませんだった',
      },
    ],
    trapNote:
      'Buổi chiều nhìn lại けさ (sáng nay đã qua) + Phủ định → べんきょうしませんでした.',
  },
  {
    id: 'c12',
    polarity: 'affirmative',
    promptHira: '（Nói lúc sáng）こんばん 10じに 【 ？ 】。',
    promptKanji: '（Nói lúc sáng）今晩 10時に 【 ？ 】。',
    baseVerbLabel: 'ねます (寝ます • đi ngủ)',
    vnMeaning: '(Nói vào buổi sáng) Tối nay tôi sẽ ngủ lúc 10 giờ.',
    ttsFullAnswer: 'こんばん じゅうじに ねます。',
    fullSentenceKanji: '今晩 10時に 寝ます。',
    fullSentenceHira: 'こんばん 10じに ねます。',
    correct: { id: 'nemasu', hira: 'ねます', kanji: '寝ます' },
    traps: [
      { id: 'nemashita', hira: 'ねました', kanji: '寝ました' },
      { id: 'nemasen', hira: 'ねません', kanji: '寝ません' },
      { id: 'nemasendeshita', hira: 'ねませんでした', kanji: '寝ませんでした' },
    ],
    trapNote:
      'こんばん (今晩 - tối nay) chưa diễn ra → chia Tương lai giống Hiện tại: ねます.',
  },
  {
    id: 'c13',
    polarity: 'negative',
    promptHira: 'こんばん 【 ？ 】。',
    promptKanji: '今晩 【 ？ 】。',
    baseVerbLabel: 'はたらきます (働きます • làm việc)',
    vnMeaning: 'Tối nay tôi sẽ không làm việc.',
    ttsFullAnswer: 'こんばん はたらきません。',
    fullSentenceKanji: '今晩 働きません。',
    fullSentenceHira: 'こんばん はたらきません。',
    correct: { id: 'hatarakimasen', hira: 'はたらきません', kanji: '働きません' },
    traps: [
      { id: 'hatarakimasendeshita', hira: 'はたらきませんでした', kanji: '働きませんでした' },
      { id: 'hatarakimasu', hira: 'はたらきます', kanji: '働きます' },
      { id: 'hatarakimashita', hira: 'はたらきました', kanji: '働きました' },
    ],
    trapNote:
      'こんばん (tối nay — sắp tới) + Phủ định → chia はたらきません.',
  },
  {
    id: 'c14',
    polarity: 'affirmative',
    promptHira: 'きのう かいぎは 5じに 【 ？ 】。',
    promptKanji: '昨日 会議は 5時に 【 ？ 】。',
    baseVerbLabel: 'おわります (終わります • kết thúc)',
    vnMeaning: 'Hôm qua cuộc họp đã kết thúc lúc 5 giờ.',
    ttsFullAnswer: 'きのう かいぎは ごじに おわりました。',
    fullSentenceKanji: '昨日 会議は 5時に 終わりました。',
    fullSentenceHira: 'きのう かいぎは 5じに おわりました。',
    correct: { id: 'owarimashita', hira: 'おわりました', kanji: '終わりました' },
    traps: [
      { id: 'owarimasu', hira: 'おわります', kanji: '終わります' },
      { id: 'owarimasendeshita', hira: 'おわりませんでした', kanji: '終わりませんでした' },
      { id: 'owarimasen', hira: 'おわりません', kanji: '終わりません' },
    ],
    trapNote:
      'きのう (hôm qua) + Khẳng định → chia Quá khứ: おわりました (終わりました).',
  },
  {
    id: 'c15',
    polarity: 'negative',
    promptHira: 'きのう しごとは 6じに 【 ？ 】。',
    promptKanji: '昨日 仕事は 6時に 【 ？ 】。',
    baseVerbLabel: 'おわります (終わります • kết thúc)',
    vnMeaning: 'Hôm qua công việc đã không kết thúc lúc 6 giờ.',
    ttsFullAnswer: 'きのう しごとは ろくじに おわりませんでした。',
    fullSentenceKanji: '昨日 仕事は 6時に 終わりませんでした。',
    fullSentenceHira: 'きのう しごとは 6じに おわりませんでした。',
    correct: {
      id: 'owarimasendeshita',
      hira: 'おわりませんでした',
      kanji: '終わりませんでした',
    },
    traps: [
      { id: 'owarimasen', hira: 'おわりません', kanji: '終わりません' },
      { id: 'owarimashita', hira: 'おわりました', kanji: '終わりました' },
      { id: 'owarimasendatta', hira: 'おわりませんだった', kanji: '終わりませんだった' },
    ],
    trapNote:
      'きのう (quá khứ) + Phủ định → おわりませんでした (không dùng おわりません hay おわりませんだった!).',
  },
  {
    id: 'c16',
    polarity: 'affirmative',
    promptHira: 'おととい かいしゃを 【 ？ 】。',
    promptKanji: '一昨日 会社を 【 ？ 】。',
    baseVerbLabel: 'やすみます (休みます • nghỉ)',
    vnMeaning: 'Hôm kia tôi đã nghỉ làm.',
    ttsFullAnswer: 'おととい かいしゃを やすみました。',
    fullSentenceKanji: '一昨日 会社を 休みました。',
    fullSentenceHira: 'おととい かいしゃを やすみました。',
    correct: { id: 'yasumimashita', hira: 'やすみました', kanji: '休みました' },
    traps: [
      { id: 'yasumimasu', hira: 'やすみます', kanji: '休みます' },
      { id: 'yasumimasendeshita', hira: 'やすみませんでした', kanji: '休みませんでした' },
      { id: 'yasumimasen', hira: 'やすみません', kanji: '休みません' },
    ],
    trapNote:
      'おととい (hôm kia) là Quá khứ + Khẳng định → やすみました.',
  },
  {
    id: 'c17',
    polarity: 'affirmative',
    promptHira: 'あさって しごとは 4じに 【 ？ 】。',
    promptKanji: '明後日 仕事は 4時に 【 ？ 】。',
    baseVerbLabel: 'おわります (終わります • kết thúc)',
    vnMeaning: 'Ngày kia công việc sẽ kết thúc lúc 4 giờ.',
    ttsFullAnswer: 'あさって しごとは よじに おわります。',
    fullSentenceKanji: '明後日 仕事は 4時に 終わります。',
    fullSentenceHira: 'あさって しごとは 4じに おわります。',
    correct: { id: 'owarimasu', hira: 'おわります', kanji: '終わります' },
    traps: [
      { id: 'owarimashita', hira: 'おわりました', kanji: '終わりました' },
      { id: 'owarimasen', hira: 'おわりません', kanji: '終わりません' },
      { id: 'owarimasendeshita', hira: 'おわりませんでした', kanji: '終わりませんでした' },
    ],
    trapNote:
      'あさって (ngày kia) là Tương lai → chia giống Hiện tại: おわります.',
  },
  {
    id: 'c18',
    polarity: 'negative',
    promptHira: 'どようびと にちようびは 【 ？ 】。',
    promptKanji: '土曜日と 日曜日は 【 ？ 】。',
    baseVerbLabel: 'はたらきます (働きます • làm việc)',
    vnMeaning: 'Thứ Bảy và Chủ nhật hàng tuần tôi không làm việc.',
    ttsFullAnswer: 'どようびと にちようびは はたらきません。',
    fullSentenceKanji: '土曜日と 日曜日は 働きません。',
    fullSentenceHira: 'どようびと にちようびは はたらきません。',
    correct: { id: 'hatarakimasen', hira: 'はたらきません', kanji: '働きません' },
    traps: [
      { id: 'hatarakimasendeshita', hira: 'はたらきませんでした', kanji: '働きませんでした' },
      { id: 'hatarakimasu', hira: 'はたらきます', kanji: '働きます' },
      { id: 'hatarakimashita', hira: 'はたらきました', kanji: '働きました' },
    ],
    trapNote:
      'Lịch nghỉ thường lệ Thứ Bảy & Chủ nhật là Hiện tại + Phủ định → はたらきません.',
  },
];

/**
 * Ngân hàng 14 câu luyện phản xạ Trả lời câu hỏi Động từ (～ますか / ～ましたか)
 */
export const QA_REPLY_TRAP_BANK: QaReplyBankItem[] = [
  {
    id: 'q1',
    replyLead: 'いいえ',
    questionHira: 'きのう べんきょうしましたか。',
    questionKanji: '昨日 勉強しましたか。',
    vnMeaning: 'Hôm qua bạn đã học bài phải không? → Không, tôi đã không học.',
    ttsFullAnswer: 'きのう べんきょうしましたか。いいえ、べんきょうしませんでした。',
    fullSentenceKanji: '昨日 勉強しましたか。— いいえ、勉強しませんでした。',
    fullSentenceHira: 'きのう べんきょうしましたか。— いいえ、べんきょうしませんでした。',
    correct: {
      id: 'benkyoushimasendeshita',
      hira: 'べんきょうしませんでした',
      kanji: '勉強しませんでした',
    },
    traps: [
      { id: 'benkyoushimasen', hira: 'べんきょうしません', kanji: '勉強しません' },
      { id: 'soujaarimasen', hira: 'そうじゃありません', kanji: 'そうじゃありません' },
      { id: 'benkyoushimashita', hira: 'べんきょうしました', kanji: '勉強しました' },
    ],
    trapNote:
      'Câu động từ CẤM đáp そうじゃありません; câu hỏi ở Quá khứ (ましたか) khi đáp いいえ phải giữ Quá khứ: べんきょうしませんでした!',
  },
  {
    id: 'q2',
    replyLead: 'はい',
    questionHira: 'きのう はたらきましたか。',
    questionKanji: '昨日 働きましたか。',
    vnMeaning: 'Hôm qua bạn đã làm việc phải không? → Vâng, tôi đã làm việc.',
    ttsFullAnswer: 'きのう はたらきましたか。はい、はたらきました。',
    fullSentenceKanji: '昨日 働きましたか。— はい、働きました。',
    fullSentenceHira: 'きのう はたらきましたか。— はい、はたらきました。',
    correct: { id: 'hatarakimashita', hira: 'はたらきました', kanji: '働きました' },
    traps: [
      { id: 'soudesu', hira: 'そうです', kanji: 'そうです' },
      { id: 'hatarakimasu', hira: 'はたらきます', kanji: '働きます' },
      { id: 'hatarakimasendeshita', hira: 'はたらきませんでした', kanji: '働きませんでした' },
    ],
    trapNote:
      'Câu hỏi Động từ KHÔNG trả lời はい、そうです! Lặp lại đúng động từ ở Quá khứ: はい、はたらきました。',
  },
  {
    id: 'q3',
    replyLead: 'いいえ',
    questionHira: 'まいあさ 6じに おきますか。',
    questionKanji: '毎朝 6時に 起きますか。',
    vnMeaning: 'Mỗi sáng bạn dậy lúc 6 giờ phải không? → Không, tôi không dậy lúc đó.',
    ttsFullAnswer: 'まいあさ ろくじに おきますか。いいえ、おきません。',
    fullSentenceKanji: '毎朝 6時に 起きますか。— いいえ、起きません。',
    fullSentenceHira: 'まいあさ 6じに おきますか。— いいえ、おきません。',
    correct: { id: 'okimasen', hira: 'おきません', kanji: '起きません' },
    traps: [
      { id: 'soujaarimasen', hira: 'そうじゃありません', kanji: 'そうじゃありません' },
      { id: 'okimasendeshita', hira: 'おきませんでした', kanji: '起きませんでした' },
      { id: 'okimasu', hira: 'おきます', kanji: '起きます' },
    ],
    trapNote:
      'まいあさ (Hiện tại) hỏi おきますか → đáp いいえ、おきません (không dùng そうじゃありません!).',
  },
  {
    id: 'q4',
    replyLead: 'はい',
    questionHira: 'まいばん にほんごを べんきょうしますか。',
    questionKanji: '毎晩 日本語を 勉強しますか。',
    vnMeaning: 'Mỗi tối bạn học tiếng Nhật phải không? → Vâng, tôi có học.',
    ttsFullAnswer: 'まいばん にほんごを べんきょうしますか。はい、べんきょうします。',
    fullSentenceKanji: '毎晩 日本語を 勉強しますか。— はい、勉強します。',
    fullSentenceHira: 'まいばん にほんごを べんきょうしますか。— はい、べんきょうします。',
    correct: { id: 'benkyoushimasu', hira: 'べんきょうします', kanji: '勉強します' },
    traps: [
      { id: 'soudesu', hira: 'そうです', kanji: 'そうです' },
      { id: 'benkyoushimashita', hira: 'べんきょうしました', kanji: '勉強しました' },
      { id: 'benkyoushimasen', hira: 'べんきょうしません', kanji: '勉強しません' },
    ],
    trapNote:
      'Hỏi Hiện tại まいばん … しますか → đáp はい、べんきょうします (cấm trả lời はい、そうです!).',
  },
  {
    id: 'q5',
    replyLead: 'いいえ',
    questionHira: 'あした やすみますか。',
    questionKanji: '明日 休みますか。',
    vnMeaning: 'Ngày mai bạn sẽ nghỉ phải không? → Không, tôi sẽ không nghỉ.',
    ttsFullAnswer: 'あした やすみますか。いいえ、やすみません。',
    fullSentenceKanji: '明日 休みますか。— いいえ、休みません。',
    fullSentenceHira: 'あした やすみますか。— いいえ、やすみません。',
    correct: { id: 'yasumimasen', hira: 'やすみません', kanji: '休みません' },
    traps: [
      { id: 'yasumimasendeshita', hira: 'やすみませんでした', kanji: '休みませんでした' },
      { id: 'soujaarimasen', hira: 'そうじゃありません', kanji: 'そうじゃありません' },
      { id: 'yasumimasu', hira: 'やすみます', kanji: '休みます' },
    ],
    trapNote:
      'あした (Tương lai) hỏi やすみますか → đáp いいえ、やすみません (không thêm でした!).',
  },
  {
    id: 'q6',
    replyLead: 'はい',
    questionHira: 'あした はたらきますか。',
    questionKanji: '明日 働きますか。',
    vnMeaning: 'Ngày mai bạn sẽ làm việc phải không? → Vâng, ngày mai tôi sẽ làm việc.',
    ttsFullAnswer: 'あした はたらきますか。はい、はたらきます。',
    fullSentenceKanji: '明日 働きますか。— はい、働きます。',
    fullSentenceHira: 'あした はたらきますか。— はい、はたらきます。',
    correct: { id: 'hatarakimasu', hira: 'はたらきます', kanji: '働きます' },
    traps: [
      { id: 'soudesu', hira: 'そうです', kanji: 'そうです' },
      { id: 'hatarakimashita', hira: 'はたらきました', kanji: '働きました' },
      { id: 'hatarakimasen', hira: 'はたらきません', kanji: '働きません' },
    ],
    trapNote:
      'Hỏi Tương lai あした はたらきますか → đáp はい、はたらきます.',
  },
  {
    id: 'q7',
    replyLead: 'いいえ',
    questionHira: 'おととい やすみましたか。',
    questionKanji: '一昨日 休みましたか。',
    vnMeaning: 'Hôm kia bạn đã nghỉ phải không? → Không, tôi đã không nghỉ.',
    ttsFullAnswer: 'おととい やすみましたか。いいえ、やすみませんでした。',
    fullSentenceKanji: '一昨日 休みましたか。— いいえ、休みませんでした。',
    fullSentenceHira: 'おととい やすみましたか。— いいえ、やすみませんでした。',
    correct: { id: 'yasumimasendeshita', hira: 'やすみませんでした', kanji: '休みませんでした' },
    traps: [
      { id: 'yasumimasen', hira: 'やすみません', kanji: '休みません' },
      { id: 'yasumimasendatta', hira: 'やすみませんだった', kanji: '休みませんだった' },
      { id: 'soujaarimasen', hira: 'そうじゃありません', kanji: 'そうじゃありません' },
    ],
    trapNote:
      'おととい (Quá khứ) hỏi やすみましたか → phủ định phải là いいえ、やすみませんでした.',
  },
  {
    id: 'q8',
    replyLead: 'いいえ',
    questionHira: 'けさ 7じに おきましたか。',
    questionKanji: '今朝 7時に 起きましたか。',
    vnMeaning: 'Sáng nay bạn đã dậy lúc 7 giờ phải không? → Không, tôi đã không dậy lúc 7 giờ.',
    ttsFullAnswer: 'けさ しちじに おきましたか。いいえ、おきませんでした。',
    fullSentenceKanji: '今朝 7時に 起きましたか。— いいえ、起きませんでした。',
    fullSentenceHira: 'けさ 7じに おきましたか。— いいえ、おきませんでした。',
    correct: { id: 'okimasendeshita', hira: 'おきませんでした', kanji: '起きませんでした' },
    traps: [
      { id: 'okimasen', hira: 'おきません', kanji: '起きません' },
      { id: 'soujaarimasen', hira: 'そうじゃありません', kanji: 'そうじゃありません' },
      { id: 'okimashita', hira: 'おきました', kanji: '起きました' },
    ],
    trapNote:
      'Câu hỏi ở Quá khứ おきましたか → trả lời いいえ bắt buộc giữ Quá khứ: いいえ、おきませんでした。',
  },
  {
    id: 'q9',
    replyLead: 'はい',
    questionHira: 'けさ べんきょうしましたか。',
    questionKanji: '今朝 勉強しましたか。',
    vnMeaning: 'Sáng nay bạn đã học bài phải không? → Vâng, tôi đã học.',
    ttsFullAnswer: 'けさ べんきょうしましたか。はい、べんきょうしました。',
    fullSentenceKanji: '今朝 勉強しましたか。— はい、勉強しました。',
    fullSentenceHira: 'けさ べんきょうしましたか。— はい、べんきょうしました。',
    correct: { id: 'benkyoushimashita', hira: 'べんきょうしました', kanji: '勉強しました' },
    traps: [
      { id: 'soudesu', hira: 'そうです', kanji: 'そうです' },
      { id: 'benkyoushimasu', hira: 'べんきょうします', kanji: '勉強します' },
      {
        id: 'benkyoushimasendeshita',
        hira: 'べんきょうしませんでした',
        kanji: '勉強しませんでした',
      },
    ],
    trapNote:
      'Câu hỏi けさ べんきょうしましたか ở Quá khứ → đáp はい、べんきょうしました.',
  },
  {
    id: 'q10',
    replyLead: 'いいえ',
    questionHira: 'きのう 11じに ねましたか。',
    questionKanji: '昨日 11時に 寝ましたか。',
    vnMeaning: 'Hôm qua bạn đã ngủ lúc 11 giờ phải không? → Không, tôi đã không ngủ lúc đó.',
    ttsFullAnswer: 'きのう じゅういちじに ねましたか。いいえ、ねませんでした。',
    fullSentenceKanji: '昨日 11時に 寝ましたか。— いいえ、寝ませんでした。',
    fullSentenceHira: 'きのう 11じに ねましたか。— いいえ、ねませんでした。',
    correct: { id: 'nemasendeshita', hira: 'ねませんでした', kanji: '寝ませんでした' },
    traps: [
      { id: 'nemasen', hira: 'ねません', kanji: '寝ません' },
      { id: 'nemasendatta', hira: 'ねませんだった', kanji: '寝ませんだった' },
      { id: 'soujaarimasen', hira: 'そうじゃありません', kanji: 'そうじゃありません' },
    ],
    trapNote:
      'Hỏi Quá khứ ねましたか → phủ định chuẩn duy nhất là いいえ、ねませんでした.',
  },
  {
    id: 'q11',
    replyLead: 'はい',
    questionHira: 'きのう しごとは 5じに おわりましたか。',
    questionKanji: '昨日 仕事は 5時に 終わりましたか。',
    vnMeaning: 'Hôm qua công việc đã kết thúc lúc 5 giờ phải không? → Vâng, đã kết thúc.',
    ttsFullAnswer: 'きのう しごとは ごじに おわりましたか。はい、おわりました。',
    fullSentenceKanji: '昨日 仕事は 5時に 終わりましたか。— はい、終わりました。',
    fullSentenceHira: 'きのう しごとは 5じに おわりましたか。— はい、おわりました。',
    correct: { id: 'owarimashita', hira: 'おわりました', kanji: '終わりました' },
    traps: [
      { id: 'soudesu', hira: 'そうです', kanji: 'そうです' },
      { id: 'owarimasu', hira: 'おわります', kanji: '終わります' },
      { id: 'owarimasendeshita', hira: 'おわりませんでした', kanji: '終わりませんでした' },
    ],
    trapNote:
      'Hỏi Quá khứ おわりましたか → lặp lại đúng động từ ở Quá khứ: はい、おわりました。',
  },
  {
    id: 'q12',
    replyLead: 'いいえ',
    questionHira: 'かいぎは 4じに おわりますか。',
    questionKanji: '会議は 4時に 終わりますか。',
    vnMeaning: 'Cuộc họp kết thúc lúc 4 giờ phải không? → Không, không kết thúc lúc 4 giờ.',
    ttsFullAnswer: 'かいぎは よじに おわりますか。いいえ、おわりません。',
    fullSentenceKanji: '会議は 4時に 終わりますか。— いいえ、終わりません。',
    fullSentenceHira: 'かいぎは 4じに おわりますか。— いいえ、おわりません。',
    correct: { id: 'owarimasen', hira: 'おわりません', kanji: '終わりません' },
    traps: [
      { id: 'soujaarimasen', hira: 'そうじゃありません', kanji: 'そうじゃありません' },
      { id: 'owarimasendeshita', hira: 'おわりませんでした', kanji: '終わりませんでした' },
      { id: 'owarimasu', hira: 'おわります', kanji: '終わります' },
    ],
    trapNote:
      'Câu hỏi おわりますか → đáp いいえ、おわりません (không dùng そうじゃありません!).',
  },
  {
    id: 'q13',
    replyLead: 'いいえ',
    questionHira: 'こんばん べんきょうしますか。',
    questionKanji: '今晩 勉強しますか。',
    vnMeaning: 'Tối nay bạn có học bài không? → Không, tối nay tôi sẽ không học.',
    ttsFullAnswer: 'こんばん べんきょうしますか。いいえ、べんきょうしません。',
    fullSentenceKanji: '今晩 勉強しますか。— いいえ、勉強しません。',
    fullSentenceHira: 'こんばん べんきょうしますか。— いいえ、べんきょうしません。',
    correct: { id: 'benkyoushimasen', hira: 'べんきょうしません', kanji: '勉強しません' },
    traps: [
      {
        id: 'benkyoushimasendeshita',
        hira: 'べんきょうしませんでした',
        kanji: '勉強しませんでした',
      },
      { id: 'soujaarimasen', hira: 'そうじゃありません', kanji: 'そうじゃありません' },
      { id: 'benkyoushimasu', hira: 'べんきょうします', kanji: '勉強します' },
    ],
    trapNote:
      'こんばん (Tương lai) hỏi bằng しますか → đáp いいえ、べんきょうしません.',
  },
  {
    id: 'q14',
    replyLead: 'いいえ',
    questionHira: 'にちようび はたらきますか。',
    questionKanji: '日曜日 働きますか。',
    vnMeaning: 'Chủ nhật bạn có làm việc không? → Không, tôi không làm việc.',
    ttsFullAnswer: 'にちようび はたらきますか。いいえ、はたらきません。',
    fullSentenceKanji: '日曜日 働きますか。— いいえ、働きません。',
    fullSentenceHira: 'にちようび はたらきますか。— いいえ、はたらきません。',
    correct: { id: 'hatarakimasen', hira: 'はたらきません', kanji: '働きません' },
    traps: [
      { id: 'soujaarimasen', hira: 'そうじゃありません', kanji: 'そうじゃありません' },
      { id: 'hatarakimasendeshita', hira: 'はたらきませんでした', kanji: '働きませんでした' },
      { id: 'hatarakimasu', hira: 'はたらきます', kanji: '働きます' },
    ],
    trapNote:
      'Hỏi Hiện tại はたらきますか → đáp いいえ、はたらきません (tránh nhầm sang そうじゃありません).',
  },
];

function buildOptionsForPrompt(
  correct: VerbFormPair,
  traps: readonly VerbFormPair[],
  promptType: Lesson4ConcretePrompt
): Lesson4Option[] {
  const allPairs = fisherYatesShuffle([correct, ...traps]);
  return allPairs.map((pair) => ({
    id: pair.id,
    label: promptType === 'kanji' ? pair.kanji : pair.hira,
  }));
}

export function buildConjugationPracticeQuestion(
  item: ConjugationBankItem,
  mode: Lesson4Mode
): Lesson4PracticeQuestion {
  const promptType = resolvePromptType(mode);
  const isAff = item.polarity === 'affirmative';
  const badgeText = isAff ? '➕ Thể khẳng định' : '➖ Thể phủ định';

  return {
    topic: 'conjugation',
    promptType,
    badgeText,
    badgeTone: item.polarity,
    promptHira: item.promptHira,
    promptKanji: item.promptKanji,
    contextHint: `${item.baseVerbLabel} • ${item.vnMeaning}`,
    ttsFullAnswer: item.ttsFullAnswer,
    correctId: item.correct.id,
    correctDisplay: `${item.correct.kanji}（${item.correct.hira}）`,
    fullSentenceKanji: item.fullSentenceKanji,
    fullSentenceHira: item.fullSentenceHira,
    options: buildOptionsForPrompt(item.correct, item.traps, promptType),
    trapNote: item.trapNote,
  };
}

export function buildQaReplyPracticeQuestion(
  item: QaReplyBankItem,
  mode: Lesson4Mode
): Lesson4PracticeQuestion {
  const promptType = resolvePromptType(mode);
  const isHai = item.replyLead === 'はい';
  const badgeText = isHai ? '⭕ Đáp lại: はい、＿＿' : '✖️ Đáp lại: いいえ、＿＿';

  return {
    topic: 'qa_reply',
    promptType,
    badgeText,
    badgeTone: isHai ? 'affirmative' : 'negative',
    promptHira: `${item.questionHira}  ➔  ${item.replyLead}、【 ？ 】。`,
    promptKanji: `${item.questionKanji}  ➔  ${item.replyLead}、【 ？ 】。`,
    contextHint: item.vnMeaning,
    ttsFullAnswer: item.ttsFullAnswer,
    correctId: item.correct.id,
    correctDisplay: `${item.replyLead}、${item.correct.kanji}（${item.correct.hira}）`,
    fullSentenceKanji: item.fullSentenceKanji,
    fullSentenceHira: item.fullSentenceHira,
    options: buildOptionsForPrompt(item.correct, item.traps, promptType),
    trapNote: item.trapNote,
  };
}
