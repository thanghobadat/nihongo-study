'use client';

import React from 'react';
import { speakJapaneseNote } from './noteUtils';

const LEARNED_SENTENCE_FORMS = [
  {
    lesson: 'Bài 4',
    formula: 'V-ます',
    name: 'Khẳng định lịch sự',
    exampleKanji: '毎日 働きます。',
    exampleHira: 'まいにち はたらきます。',
    meaning: 'Mỗi ngày tôi làm việc.',
  },
  {
    lesson: 'Bài 4',
    formula: 'V-ません',
    name: 'Phủ định lịch sự',
    exampleKanji: 'あした 働きません。',
    exampleHira: 'あした はたらきません。',
    meaning: 'Ngày mai tôi không làm việc.',
  },
  {
    lesson: 'Bài 4',
    formula: 'V-ますか',
    name: 'Nghi vấn lịch sự',
    exampleKanji: '毎朝 何時に 起きますか。',
    exampleHira: 'まいあさ なんじに おきますか。',
    meaning: 'Mỗi sáng bạn thức dậy lúc mấy giờ?',
  },
  {
    lesson: 'Bài 6',
    formula: 'V-ませんか',
    name: 'Thể mời rủ lịch sự ("Cùng làm ~ nhé?")',
    exampleKanji: 'いっしょに 京都へ 行きませんか。',
    exampleHira: 'いっしょに きょうとへ いきませんか。',
    meaning: 'Cùng đi Kyoto với tôi nhé?',
  },
  {
    lesson: 'Bài 6',
    formula: 'V-ましょう',
    name: 'Thể đề nghị / hưởng ứng ("Hãy cùng ~ nào!")',
    exampleKanji: 'ちょっと 休みましょう。',
    exampleHira: 'ちょっと やすみましょう。',
    meaning: 'Chúng mình nghỉ giải lao một chút thôi!',
  },
];

export default function FormSection() {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Các thể câu động từ đã học đến Bài 6 */}
      <section className="rounded-2xl bg-white dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 text-xs font-extrabold mb-1.5">
            Phạm vi đã học • Bài 1 → Bài 6
          </span>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
            Các dạng đuôi động từ lịch sự (Hệ ～ます) đã học đến Bài 6
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Đến Bài 6, động từ giữ nguyên phần gốc trước <strong>ます</strong> và biến đổi phần đuôi:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
          {LEARNED_SENTENCE_FORMS.map((item) => (
            <div
              key={item.formula}
              className="rounded-xl bg-slate-50/80 dark:bg-slate-950/65 border border-slate-200 dark:border-slate-800 p-3.5 flex items-start justify-between gap-2.5"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-xs font-black">
                    {item.formula}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.lesson}
                  </span>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                    {item.name}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white pt-0.5">
                  {item.exampleKanji}{' '}
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    ({item.exampleHira})
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  → {item.meaning}
                </p>
              </div>

              <button
                type="button"
                onClick={() => speakJapaneseNote(item.exampleHira)}
                className="min-h-[36px] min-w-[36px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-indigo-50 cursor-pointer touch-manipulation shrink-0"
                title="Nghe ví dụ"
              >
                🔊
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Khung chờ cho các thể biến đổi gốc động từ từ Bài 14 trở đi */}
      <div className="rounded-2xl bg-white/85 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 p-6 sm:p-8 text-center space-y-2">
        <p className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200">
          📌 Khung chờ các thể biến đổi động từ ở các bài tiếp theo
        </p>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Các bảng chia thể tiếp theo (như Thể て, Thể ない, Thể Từ điển, Thể た...) hiện đang để
          trống và sẽ được bổ sung lần lượt khi bạn học tới bài tương ứng.
        </p>
      </div>
    </div>
  );
}
