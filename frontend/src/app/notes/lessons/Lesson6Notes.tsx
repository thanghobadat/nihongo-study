'use client';

import React, { useCallback, useRef, useState } from 'react';
import Lesson6PracticeArena from './Lesson6PracticeArena';
import { Lesson6Topic } from './lesson6PracticeGenerator';

interface ParticleRuleRow {
  id: string;
  particleBadge: string;
  roleTitle: string;
  questionWord: string;
  formula: string;
  exampleKanji: string;
  exampleHira: string;
  exampleTts: string;
  exampleVn: string;
  exceptionTitle: string;
  exceptionGoodKanji: string;
  exceptionGoodHira: string;
  exceptionGoodTts: string;
  exceptionBad: string;
  exceptionNote: string;
}

interface NanNaniRuleItem {
  kanji: string;
  reading: string;
  tts: string;
  meaning: string;
  reason: string;
  caution?: string;
}

interface TwinPairItem {
  id: string;
  title: string;
  leftKanji: string;
  leftReading: string;
  leftMeaning: string;
  leftExample: string;
  leftTts: string;
  rightKanji: string;
  rightReading: string;
  rightMeaning: string;
  rightExample: string;
  rightTts: string;
}

const LESSON6_PARTICLE_RULES: ParticleRuleRow[] = [
  {
    id: 'wo',
    particleBadge: 'Danh từ + を',
    roleTitle: '1. Tân ngữ trực tiếp của Ngoại động từ & Mẫu 「N を します」',
    questionWord: '何を / なにを (Cái gì? / Làm gì?)',
    formula: 'N (Vật / Môn thể thao / Sự kiện / Công việc) を ＋ Ngoại động từ / します',
    exampleKanji: 'ジュースを 飲みます。 ／ 土曜日 サッカーを します。',
    exampleHira: 'ジュースを のみます。 ／ どようび サッカーを します。',
    exampleTts: 'ジュースを のみます。 どようび サッカーを します。',
    exampleVn: 'Tôi uống nước trái cây. / Thứ Bảy tôi chơi bóng đá.',
    exceptionTitle: '⚠️ Bẫy số 1 JLPT: Gặp ai đó (会います) bắt buộc dùng に!',
    exceptionGoodKanji: 'あした 友達に 会います。',
    exceptionGoodHira: 'あした ともだちに あいます。 (Hỏi: だれに 会いますか)',
    exceptionGoodTts: 'あした ともだちに あいます。',
    exceptionBad: '❌ 友達を 会います ／ ❌ だれを 会いますか',
    exceptionNote:
      'Tiếng Việt nói "gặp bạn" dễ ngỡ là tân ngữ, nhưng trong tiếng Nhật 会います luôn đi với trợ từ に!',
  },
  {
    id: 'de',
    particleBadge: 'Địa điểm + で',
    roleTitle: '2. Địa điểm nơi diễn ra hành động (Làm gì TẠI ĐÂU?)',
    questionWord: 'どこで (Ở đâu?)',
    formula: 'N (Địa điểm) で ＋ N を ＋ Động từ hành động',
    exampleKanji: '駅で 新聞を 買います。',
    exampleHira: 'えきで しんぶんを かいます。',
    exampleTts: 'えきで しんぶんを かいます。',
    exampleVn: 'Tôi mua báo ở nhà ga.',
    exceptionTitle: '⚠️ Bẫy số 2: Phân biệt 「Địa điểm + で」 và 「Địa điểm + へ」',
    exceptionGoodKanji: 'スーパーへ 行きます。 → スーパーで 肉を 買います。',
    exceptionGoodHira: 'スーパーへ いきます (Đi đến) ≠ スーパーで かいます (Mua tại đó)',
    exceptionGoodTts: 'スーパーへ いきます。 スーパーで にくを かいます。',
    exceptionBad: '❌ 駅へ 新聞を 買います ／ ❌ スーパーで 行きます',
    exceptionNote:
      'Đi với 3 động từ di chuyển (行きます・来ます・帰ります) dùng へ; còn thực hiện hành động tại địa điểm đó dùng で.',
  },
  {
    id: 'nanimo',
    particleBadge: '何も + ∅ + V-ません',
    roleTitle: '3. Phủ định hoàn toàn tân ngữ ("Không ăn / mua / làm gì cả")',
    questionWord: '何を V-ましたか → 何も V-ませんでした',
    formula: '何（なに）も ＋ Động từ chia phủ định (～ません / ～ませんでした)',
    exampleKanji: 'けさ 何も 食べませんでした。',
    exampleHira: 'けさ なにも たべませんでした。',
    exampleTts: 'けさ なにも たべませんでした。',
    exampleVn: 'Sáng nay tôi đã không ăn gì cả.',
    exceptionTitle: '⚠️ Bẫy số 3: Trợ từ も NUỐT MẤT trợ từ を!',
    exceptionGoodKanji: '日曜日は 何も しません。',
    exceptionGoodHira: 'にちようびは なにも しません。',
    exceptionGoodTts: 'にちようびは なにも しません。',
    exceptionBad: '❌ 何をも しません ／ ❌ 何もを しません ／ ❌ 何を しません',
    exceptionNote:
      'Khác với どこ［へ］も (có thể giữ へ), trợ từ を bắt buộc phải lược bỏ hoàn toàn khi đứng cạnh も!',
  },
  {
    id: 'to_isshoni',
    particleBadge: 'Người + と / いっしょに',
    roleTitle: '4. Làm cùng với ai (と) & Rủ cùng nhau làm (いっしょに)',
    questionWord: 'だれと (Cùng với ai?)',
    formula: 'N (Người) と ＋ V  ｜  いっしょに ＋ V-ませんか / V-ましょう',
    exampleKanji: '家族と 晩ごはんを 食べます。',
    exampleHira: 'かぞくと ばんごはんを たべます。',
    exampleTts: 'かぞくと ばんごはんを たべます。',
    exampleVn: 'Tôi ăn tối cùng với gia đình.',
    exceptionTitle: '⚠️ Bẫy số 4: Làm một mình dùng 一人で (ひとりで)',
    exceptionGoodKanji: '昼ごはんは 一人で 食べます。',
    exceptionGoodHira: 'ひるごはんは ひとりで たべます。',
    exceptionGoodTts: 'ひるごはんは ひとりで たべます。',
    exceptionBad: '❌ 一人と 食べます ／ ❌ いっしょと 行きます',
    exceptionNote:
      'Làm một mình luôn dùng 一人で (cấm 一人と). Phó từ いっしょに đã có sẵn に nên không gắn と phía sau.',
  },
  {
    id: 'invite_wa',
    particleBadge: '～ませんか • は',
    roleTitle: '5. Đuôi câu mời rủ lịch sự (か・ね) & Trợ từ は khi từ chối khéo',
    questionWord: 'V-ませんか (Cùng làm ~ nhé?)',
    formula: 'Đồng ý: ええ、いいですね / V-ましょう ｜ Từ chối khéo: [Thời gian] は ちょっと…',
    exampleKanji: 'いっしょに 京都へ 行きませんか。 ー ええ、いいですね。',
    exampleHira: 'いっしょに きょうとへ いきませんか。 ー ええ、いいですね。',
    exampleTts: 'いっしょに きょうとへ いきませんか。 ええ、いいですね。',
    exampleVn: 'Cùng đi Kyoto với tôi nhé? — Vâng, hay quá nhỉ.',
    exceptionTitle: '⚠️ Văn hóa giao tiếp Nhật: Từ chối khéo bằng trợ từ は',
    exceptionGoodKanji: 'すみません、あしたは ちょっと…。',
    exceptionGoodHira: 'すみません、あしたは ちょっと…。 (Ngày mai thì hơi kẹt một chút...)',
    exceptionGoodTts: 'すみません、あしたは ちょっと。',
    exceptionBad: '❌ いいえ、行きません (Quá thẳng thừng, gây mất lịch sự)',
    exceptionNote:
      'Trợ từ は đặt sau mốc thời gian (あしたは / 日曜日は) giúp nhấn mạnh sự bất tiện riêng vào lúc đó để từ chối tinh tế.',
  },
];

const NAN_TDN_ITEMS: NanNaniRuleItem[] = [
  {
    kanji: '何ですか',
    reading: 'なんですか',
    tts: 'それは なんですか',
    meaning: 'Là cái gì? / Có việc gì thế ạ?',
    reason: 'Đứng trước です (bắt đầu bằng âm d — hàng だ)',
    caution: '❌ Cấm đọc なにですか',
  },
  {
    kanji: '何で',
    reading: 'なんで',
    tts: 'なんで いきますか',
    meaning: 'Bằng phương tiện gì? (Bài 5)',
    reason: 'Đứng trước trợ từ で (bắt đầu bằng âm d — hàng だ)',
    caution: '❌ Cấm đọc なにで',
  },
  {
    kanji: '何の + N',
    reading: 'なんの',
    tts: 'なんの ざっしですか',
    meaning: 'Của cái gì / Về chủ đề gì? (Bài 2)',
    reason: 'Đứng trước trợ từ の (bắt đầu bằng âm n — hàng な)',
    caution: '❌ Cấm đọc なにの',
  },
  {
    kanji: '何と',
    reading: 'なんと',
    tts: 'なんと かきますか',
    meaning: 'Viết / nói là gì? (Trích dẫn)',
    reason: 'Đứng trước trợ từ と (bắt đầu bằng âm t — hàng た)',
  },
];

const NAN_COUNTER_ITEMS: { kanji: string; reading: string; vn: string; lesson: string }[] = [
  { kanji: '何歳', reading: 'なんさい', vn: 'Mấy tuổi', lesson: 'Bài 1' },
  { kanji: '何番', reading: 'なんばん', vn: 'Số mấy', lesson: 'Bài 1' },
  { kanji: '何階', reading: 'なんがい', vn: 'Tầng mấy', lesson: 'Bài 3' },
  { kanji: '何時', reading: 'なんじ', vn: 'Mấy giờ', lesson: 'Bài 4' },
  { kanji: '何分', reading: 'なんぷん', vn: 'Mấy phút', lesson: 'Bài 4' },
  { kanji: '何曜日', reading: 'なんようび', vn: 'Thứ mấy', lesson: 'Bài 4' },
  { kanji: '何月', reading: 'なんがつ', vn: 'Tháng mấy', lesson: 'Bài 5' },
  { kanji: '何日', reading: 'なんにち', vn: 'Ngày mấy', lesson: 'Bài 5' },
  { kanji: '何人', reading: 'なんにん', vn: 'Mấy người', lesson: 'Đếm người' },
];

const NANI_ITEMS: NanNaniRuleItem[] = [
  {
    kanji: '何を + V',
    reading: 'なにを',
    tts: 'なにを たべますか',
    meaning: 'Ăn / uống / mua / làm cái gì? (Trọng tâm Bài 6)',
    reason: 'Trước trợ từ を (hàng わ — không thuộc た・だ・な)',
    caution: '❌ Tuyệt đối cấm đọc なんを!',
  },
  {
    kanji: '何も + V-ません',
    reading: 'なにも',
    tts: 'なにも かいませんでした',
    meaning: 'Không (mua / ăn / làm) gì cả (Bài 6)',
    reason: 'Trước trợ từ も (hàng ま — không thuộc た・だ・な)',
    caution: '❌ Văn chuẩn N5 không đọc なんも',
  },
  {
    kanji: '何か / 何が',
    reading: 'なにか / なにが',
    tts: 'なにか のみますか',
    meaning: 'Thứ gì đó (何か) / Cái gì (何が)',
    reason: 'Trước trợ từ か, が (hàng か/が — không thuộc た・だ・な)',
  },
  {
    kanji: '何？ / 何色 / 何人',
    reading: 'なに / なにいろ / なにじん',
    tts: 'ミラーさんは なにじんですか',
    meaning: 'Cái gì cơ? / Màu gì? / Người nước nào?',
    reason: 'Khi đứng độc lập một mình hoặc ghép danh từ đặc thù',
  },
];

const NAN_NANI_TWINS: TwinPairItem[] = [
  {
    id: 'twin_de_wo',
    title: 'Cặp 1: Phương tiện (Bài 5) ↔ Tân ngữ hành động (Bài 6)',
    leftKanji: '何で 行きますか',
    leftReading: 'なんで いきますか',
    leftMeaning: 'Đi bằng phương tiện gì?',
    leftExample: '→ 電車で 行きます。 (Đi bằng tàu điện)',
    leftTts: 'なんで いきますか。 でんしゃで いきます。',
    rightKanji: '何を しますか',
    rightReading: 'なにを しますか',
    rightMeaning: 'Làm cái gì?',
    rightExample: '→ テニスを します。 (Chơi quần vợt)',
    rightTts: 'なにを しますか。 テニスを します。',
  },
  {
    id: 'twin_no_mo',
    title: 'Cặp 2: Hỏi chủ đề danh từ (Bài 2) ↔ Phủ định hoàn toàn (Bài 6)',
    leftKanji: '何の 本ですか',
    leftReading: 'なんの ほんですか',
    leftMeaning: 'Sách về chủ đề gì? (Trước の đọc なん)',
    leftExample: '→ 日本語の 本です。 (Sách tiếng Nhật)',
    leftTts: 'なんの ほんですか。 にほんごの ほんです。',
    rightKanji: '何も 買いましたか',
    rightReading: 'なにも かいましたか → なにも かいませんでした',
    rightMeaning: 'Không mua gì cả (Trước も đọc なに)',
    rightExample: '→ けさ 何も 食べませんでした。',
    rightTts: 'けさ なにも たべませんでした。',
  },
  {
    id: 'twin_nanijin',
    title: 'Cặp 3 (Bẫy kinh điển JLPT): Cùng viết 「何人」 nhưng 2 cách đọc khác hẳn nghĩa!',
    leftKanji: '何人 (Đếm số người)',
    leftReading: 'なんにん',
    leftMeaning: 'Mấy người? (Ghép hậu tố đếm ～人)',
    leftExample: '家族は 何人（なんにん）ですか。 → 4人です。',
    leftTts: 'かぞくは なんにんですか。 よにんです。',
    rightKanji: '何人 (Hỏi quốc tịch)',
    rightReading: 'なにじん',
    rightMeaning: 'Người nước nào? (Đối ứng ～じん)',
    rightExample: 'ミラーさんは 何人（なにじん）ですか。 → アメリカ人です。',
    rightTts: 'ミラーさんは なにじんですか。 アメリカじんです。',
  },
];

export default function Lesson6Notes() {
  const [practiceTopic, setPracticeTopic] = useState<Lesson6Topic>('particles');
  const practiceRef = useRef<HTMLDivElement | null>(null);

  const jumpToPractice = useCallback((targetTopic: Lesson6Topic) => {
    setPracticeTopic(targetTopic);
    setTimeout(() => {
      practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  }, []);

  const speakJapanese = useCallback((text: string) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.92;
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find((v) => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
    if (jaVoice) utterance.voice = jaVoice;

    const win = window as unknown as { _activeUtterances?: SpeechSynthesisUtterance[] };
    win._activeUtterances = win._activeUtterances || [];
    win._activeUtterances.push(utterance);
    const cleanup = () => {
      if (!win._activeUtterances) return;
      const idx = win._activeUtterances.indexOf(utterance);
      if (idx > -1) win._activeUtterances.splice(idx, 1);
    };
    utterance.onend = cleanup;
    utterance.onerror = cleanup;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.speak(utterance);
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* =====================================================================
          PHẦN 1: HỆ THỐNG TRỢ TỪ BÀI 6 (を・で・に・も・と) & BẪY PHÂN BIỆT
          ===================================================================== */}
      <section
        id="l6-particles"
        className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-7 shadow-sm space-y-5 sm:space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5 sm:pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-[11px] sm:text-xs font-extrabold mb-1.5">
              <span>🎯 Phần 1 • Trợ từ hành động &amp; Ngoại lệ</span>
            </div>
            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
              1. Hệ thống Trợ từ Bài 6 (を・で・に・も・と) &amp; Bẫy phân biệt dễ nhầm
            </h2>
          </div>

          <button
            type="button"
            onClick={() => jumpToPractice('particles')}
            className="w-full sm:w-auto min-h-[40px] px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-300 text-xs font-extrabold transition-colors cursor-pointer touch-manipulation shrink-0"
          >
            ⚡ Luyện Trợ từ Bài 6
          </button>
        </div>

        {/* 1.1. Danh sách 5 quy tắc trợ từ + Ngoại lệ đối xứng */}
        <div className="grid grid-cols-1 gap-3.5">
          {LESSON6_PARTICLE_RULES.map((rule) => (
            <div
              key={rule.id}
              className="rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden bg-slate-50/40 dark:bg-slate-950/40"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Cột Trái (7/12): Quy tắc chuẩn & Ví dụ */}
                <div className="lg:col-span-7 p-3.5 sm:p-4 space-y-2 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white text-xs font-black">
                        {rule.particleBadge}
                      </span>
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        {rule.roleTitle}
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-300">
                      Hỏi: {rule.questionWord}
                    </span>
                  </div>

                  <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                    {rule.formula}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        {rule.exampleKanji}
                      </div>
                      <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {rule.exampleHira}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        → {rule.exampleVn}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakJapanese(rule.exampleTts)}
                      className="min-h-[34px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 cursor-pointer touch-manipulation shrink-0"
                      title="Nghe ví dụ"
                    >
                      🔊
                    </button>
                  </div>
                </div>

                {/* Cột Phải (5/12): Ngoại lệ & Bẫy JLPT */}
                <div className="lg:col-span-5 p-3.5 sm:p-4 bg-rose-50/55 dark:bg-rose-950/25 space-y-1.5 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="text-xs font-black text-rose-700 dark:text-rose-300">
                      {rule.exceptionTitle}
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/60 px-3 py-2">
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-400">
                          ✅ {rule.exceptionGoodKanji}
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {rule.exceptionGoodHira}
                        </div>
                        <div className="text-[11px] font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                          {rule.exceptionBad}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakJapanese(rule.exceptionGoodTts)}
                        className="min-h-[34px] px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-xs font-bold text-rose-700 dark:text-rose-300 cursor-pointer touch-manipulation shrink-0"
                        title="Nghe câu đúng"
                      >
                        🔊
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug pt-0.5">
                    {rule.exceptionNote}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 1.2. Đối chiếu nhanh trợ từ đa nghĩa (で & に) + Sơ đồ Trật tự Vàng */}
        <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Hai nghĩa của で */}
            <div className="rounded-2xl bg-amber-50/65 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/60 p-3.5 space-y-2">
              <div className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200">
                🔍 Phân biệt 2 chức năng của trợ từ 「で」 (Bài 5 vs Bài 6)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-amber-200/70 dark:border-amber-900/50 p-2.5">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-[10px] font-black text-amber-800 dark:text-amber-300 mb-1">
                    Bài 5 • Phương tiện
                  </span>
                  <p className="font-extrabold text-slate-900 dark:text-white">
                    電車で 行きます。
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Bằng tàu điện (Hỏi: <strong>なんで</strong>)
                  </p>
                </div>
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-amber-200/70 dark:border-amber-900/50 p-2.5">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-[10px] font-black text-emerald-800 dark:text-emerald-300 mb-1">
                    Bài 6 • Nơi hành động
                  </span>
                  <p className="font-extrabold text-slate-900 dark:text-white">
                    駅で 買います。
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Mua tại nhà ga (Hỏi: <strong>どこで</strong>)
                  </p>
                </div>
              </div>
            </div>

            {/* Hai nghĩa của に */}
            <div className="rounded-2xl bg-indigo-50/65 dark:bg-indigo-950/25 border border-indigo-200/80 dark:border-indigo-800/60 p-3.5 space-y-2">
              <div className="text-xs sm:text-sm font-black text-indigo-900 dark:text-indigo-200">
                🔍 Phân biệt 2 chức năng của trợ từ 「に」 (Bài 4–5 vs Bài 6)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-indigo-200/70 dark:border-indigo-900/50 p-2.5">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-[10px] font-black text-indigo-800 dark:text-indigo-300 mb-1">
                    Bài 4–5 • Thời điểm có số
                  </span>
                  <p className="font-extrabold text-slate-900 dark:text-white">
                    7時に 起きます。
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Vào lúc 7 giờ (Cấm dùng với あした)
                  </p>
                </div>
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-indigo-200/70 dark:border-indigo-900/50 p-2.5">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-[10px] font-black text-rose-800 dark:text-rose-300 mb-1">
                    Bài 6 • Đối tượng gặp gỡ
                  </span>
                  <p className="font-extrabold text-slate-900 dark:text-white">
                    友達に 会います。
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Gặp bạn bè (Hỏi: <strong>だれに</strong>)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Thanh Công thức Trật tự Vàng khi ghép nhiều trợ từ */}
          <div className="rounded-2xl bg-gradient-to-r from-indigo-50/90 via-slate-50 to-emerald-50/80 dark:from-indigo-950/50 dark:via-slate-900 dark:to-emerald-950/40 border border-indigo-200/80 dark:border-indigo-800/60 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                📐 Trật tự Vàng khi ghép nhiều trợ từ trong 1 câu Bài 6:
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs font-extrabold">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                  Chủ đề は
                </span>
                <span className="text-slate-400">+</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200">
                  Thời gian に/∅
                </span>
                <span className="text-slate-400">+</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
                  Người đi cùng と
                </span>
                <span className="text-slate-400">+</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200">
                  Địa điểm で
                </span>
                <span className="text-slate-400">+</span>
                <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200">
                  Tân ngữ を
                </span>
                <span className="text-slate-400">+</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-white dark:bg-slate-700">
                  Động từ V
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 pt-0.5">
                VD:{' '}
                <strong>
                  わたしは 日曜日に 友達と デパートで 映画を 見ます。
                </strong>{' '}
                <span className="text-slate-500 dark:text-slate-400">
                  (Chủ nhật tôi xem phim ở trung tâm thương mại cùng với bạn.)
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                speakJapanese('わたしは にちようびに ともだちと デパートで えいがを みます。')
              }
              className="min-h-[38px] px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 text-xs font-extrabold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 cursor-pointer touch-manipulation shrink-0"
            >
              🔊 Nghe câu mẫu
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          PHẦN 2: QUY TẮC ĐỌC CHỮ HÁN 「何」 — KHI NÀO ĐỌC なん, KHI NÀO ĐỌC なに?
          ===================================================================== */}
      <section
        id="l6-nan-nani"
        className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-7 shadow-sm space-y-5 sm:space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5 sm:pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[11px] sm:text-xs font-extrabold mb-1.5">
              <span>🔤 Phần 2 • Quy tắc phát âm chữ 何</span>
            </div>
            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
              2. Quy tắc đọc chữ 「何」: Khi nào đọc là なん (nan), khi nào đọc là なに (nani)?
            </h2>
          </div>

          <button
            type="button"
            onClick={() => jumpToPractice('nan_nani')}
            className="w-full sm:w-auto min-h-[40px] px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold transition-colors cursor-pointer touch-manipulation shrink-0"
          >
            ⚡ Luyện phân biệt なん / なに
          </button>
        </div>

        {/* Mẹo tổng quát 1 dòng */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
          💡 <strong>Nguyên tắc quyết định:</strong> Cùng một chữ Hán{' '}
          <strong className="text-indigo-600 dark:text-indigo-400">何</strong> (cái gì / mấy), cách
          đọc phụ thuộc hoàn toàn vào <strong>âm tiết đứng ngay phía sau nó</strong>:
          <span className="block mt-1">
            • Đứng trước âm hàng <strong>た・だ・な (T - D - N: mẹo nhớ &ldquo;Tôi Đi Nhé&rdquo;)</strong>{' '}
            hoặc <strong>Hậu tố đếm</strong> ➔ đọc là{' '}
            <strong className="text-amber-700 dark:text-amber-300">なん (nan)</strong>.
          </span>
          <span className="block mt-0.5">
            • Đứng trước các trợ từ còn lại (<strong>を・も・か・が</strong>) hoặc đứng một mình ➔
            đọc là <strong className="text-indigo-600 dark:text-indigo-400">なに (nani)</strong>.
          </span>
        </div>

        {/* 2.1. Hai cột đối xứng: なん (nan) vs なに (nani) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* CỘT A: ĐỌC LÀ なん (NAN) */}
          <div className="rounded-2xl border-2 border-amber-200/90 dark:border-amber-800/70 overflow-hidden bg-white dark:bg-slate-950/60 flex flex-col">
            <div className="px-4 py-3 bg-amber-50/90 dark:bg-amber-950/60 border-b border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between gap-2">
              <div>
                <span className="text-sm sm:text-base font-black text-amber-900 dark:text-amber-200">
                  🅰️ Khi nào đọc là 「なん」 (nan)?
                </span>
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mt-0.5">
                  Trước hàng た・だ・な (T-D-N) &amp; Hậu tố đếm số lượng
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-xs font-black shrink-0">
                なん
              </span>
            </div>

            <div className="p-3.5 sm:p-4 space-y-3.5 flex-1">
              {/* Nhóm A1: Trước T-D-N */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  1️⃣ Trước từ bắt đầu bằng âm hàng た (t) • だ (d) • な (n):
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  {NAN_TDN_ITEMS.map((item) => (
                    <div
                      key={item.kanji}
                      className="p-2.5 sm:px-3 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {item.kanji}
                          </span>
                          <span className="text-sm font-extrabold text-amber-700 dark:text-amber-300">
                            {item.reading}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            — {item.meaning}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                          {item.reason}
                          {item.caution && (
                            <span className="ml-1.5 font-extrabold text-rose-600 dark:text-rose-400">
                              ({item.caution})
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakJapanese(item.tts)}
                        className="min-h-[34px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-50 cursor-pointer touch-manipulation shrink-0"
                      >
                        🔊
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nhóm A2: Trước Hậu tố đếm */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  2️⃣ Ghép trước Hậu tố đếm &amp; Đơn vị thời gian (Bài 1 → Bài 5):
                </div>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {NAN_COUNTER_ITEMS.map((c) => (
                    <button
                      key={c.kanji}
                      type="button"
                      onClick={() => speakJapanese(c.reading)}
                      className="text-left p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100/80 dark:hover:bg-amber-900/40 border border-amber-200/70 dark:border-amber-800/50 transition-colors cursor-pointer touch-manipulation"
                      title={`Nghe ${c.reading}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                          {c.kanji}
                        </span>
                        <span className="text-[10px] text-amber-700 dark:text-amber-300">🔊</span>
                      </div>
                      <div className="text-xs font-extrabold text-amber-700 dark:text-amber-300">
                        {c.reading}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {c.vn} ({c.lesson})
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CỘT B: ĐỌC LÀ なに (NANI) */}
          <div className="rounded-2xl border-2 border-indigo-200/90 dark:border-indigo-800/70 overflow-hidden bg-white dark:bg-slate-950/60 flex flex-col justify-between">
            <div>
              <div className="px-4 py-3 bg-indigo-50/90 dark:bg-indigo-950/60 border-b border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between gap-2">
                <div>
                  <span className="text-sm sm:text-base font-black text-indigo-900 dark:text-indigo-200">
                    🅱️ Khi nào đọc là 「なに」 (nani)?
                  </span>
                  <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">
                    Trước trợ từ を・も・か・が &amp; Khi đứng độc lập (Trọng tâm Bài 6)
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-black shrink-0">
                  なに
                </span>
              </div>

              <div className="p-3.5 sm:p-4 space-y-2.5">
                <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Các trường hợp bắt buộc đọc là なに:
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  {NANI_ITEMS.map((item) => (
                    <div
                      key={item.kanji}
                      className="p-3 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {item.kanji}
                          </span>
                          <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                            {item.reading}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                          {item.meaning}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.reason}
                          {item.caution && (
                            <span className="ml-1.5 font-extrabold text-rose-600 dark:text-rose-400">
                              ({item.caution})
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakJapanese(item.tts)}
                        className="min-h-[34px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 cursor-pointer touch-manipulation shrink-0"
                      >
                        🔊
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mẹo phản xạ nhanh 3 giây trong cột B */}
            <div className="m-3.5 sm:m-4 mt-0 rounded-xl bg-indigo-50/75 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 p-3 space-y-1">
              <div className="text-xs font-black text-indigo-900 dark:text-indigo-200">
                ⚡ Mẹo phản xạ 3 giây khi làm bài Bài 6:
              </div>
              <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Thấy chữ <strong>何</strong> đi với ngoại động từ có <strong>を</strong> (
                <strong>なにを</strong> 食べますか / <strong>なにを</strong> しますか) hoặc phủ định{' '}
                <strong>も</strong> (<strong>なにも</strong> しません) ➔ Chắc chắn 100% đọc là{' '}
                <strong className="text-indigo-700 dark:text-indigo-300">なに</strong>!
              </p>
            </div>
          </div>
        </div>

        {/* 2.2. Ba cặp "sinh đôi cùng chữ 何" dễ nhầm nhất */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            🔥 3 Cặp &ldquo;sinh đôi cùng chữ 何&rdquo; hay gài bẫy nhất trong đề thi N5:
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {NAN_NANI_TWINS.map((pair) => (
              <div
                key={pair.id}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50"
              >
                <div className="px-3.5 py-2 bg-slate-100/90 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 text-xs font-black text-slate-800 dark:text-slate-200">
                  {pair.title}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200/80 dark:divide-slate-800">
                  {/* Vế Trái: なん */}
                  <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2 bg-amber-50/35 dark:bg-amber-950/15">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[10px] font-black">
                          なん
                        </span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {pair.leftKanji}
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-amber-700 dark:text-amber-300">
                          ({pair.leftReading})
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                        {pair.leftMeaning}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {pair.leftExample}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakJapanese(pair.leftTts)}
                      className="min-h-[34px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-700 dark:text-amber-300 cursor-pointer touch-manipulation shrink-0"
                    >
                      🔊
                    </button>
                  </div>

                  {/* Vế Phải: なに */}
                  <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2 bg-indigo-50/35 dark:bg-indigo-950/15">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-black">
                          なに
                        </span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {pair.rightKanji}
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                          ({pair.rightReading})
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                        {pair.rightMeaning}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {pair.rightExample}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakJapanese(pair.rightTts)}
                      className="min-h-[34px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 cursor-pointer touch-manipulation shrink-0"
                    >
                      🔊
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          PHẦN 3: PHÒNG LUYỆN TẬP THỰC HÀNH (TRỢ TỪ BÀI 6 & なん / なに)
          ===================================================================== */}
      <div id="l6-practice" ref={practiceRef} className="scroll-mt-20">
        <Lesson6PracticeArena topic={practiceTopic} onTopicChange={setPracticeTopic} />
      </div>
    </div>
  );
}
