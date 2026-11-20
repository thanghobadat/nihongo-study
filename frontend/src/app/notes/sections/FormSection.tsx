'use client';

import React from 'react';
import { AudioIconButton, SheetHeader, SheetSection } from '../components/NotesUI';

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
    name: 'Mời rủ lịch sự ("Cùng làm ~ nhé?")',
    exampleKanji: 'いっしょに 京都へ 行きませんか。',
    exampleHira: 'いっしょに きょうとへ いきませんか。',
    meaning: 'Cùng đi Kyoto với tôi nhé?',
  },
  {
    lesson: 'Bài 6',
    formula: 'V-ましょう',
    name: 'Đề nghị / hưởng ứng ("Hãy cùng ~ nào!")',
    exampleKanji: 'ちょっと 休みましょう。',
    exampleHira: 'ちょっと やすみましょう。',
    meaning: 'Chúng mình nghỉ giải lao một chút thôi!',
  },
];

export default function FormSection() {
  return (
    <div className="space-y-5">
      <SheetSection>
        <SheetHeader
          title="Các dạng đuôi động từ lịch sự (Hệ ～ます)"
          subtitle="Đến Bài 6, gốc trước ます giữ nguyên và biến đổi phần đuôi theo mục đích câu."
        />

        <div className="divide-y divide-slate-200/80 dark:divide-slate-800 border-t border-b border-slate-200/80 dark:border-slate-800">
          {LEARNED_SENTENCE_FORMS.map((item) => (
            <div
              key={item.formula}
              className="py-3.5 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center"
            >
              <div className="md:col-span-5 flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium shrink-0">
                  {item.lesson}
                </span>
                <code className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-bold">
                  {item.formula}
                </code>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {item.name}
                </span>
              </div>

              <div className="md:col-span-7 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {item.exampleKanji}{' '}
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                      ({item.exampleHira})
                    </span>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {item.meaning}
                  </p>
                </div>

                <AudioIconButton
                  tts={item.exampleHira}
                  label={`Nghe ví dụ ${item.exampleHira}`}
                />
              </div>
            </div>
          ))}
        </div>
      </SheetSection>

      <div className="rounded-2xl bg-white/80 dark:bg-[#0f172a]/70 border border-dashed border-slate-300 dark:border-slate-800 p-6 text-center space-y-1.5">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Khung chờ các thể biến đổi gốc động từ ở các bài tiếp theo
        </p>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Các bảng chia thể tiếp theo (Thể て, Thể ない, Thể Từ điển, Thể た...) sẽ được bổ sung lần lượt khi bạn học tới bài tương ứng.
        </p>
      </div>
    </div>
  );
}
