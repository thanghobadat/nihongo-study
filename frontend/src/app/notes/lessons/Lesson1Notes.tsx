'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  AudioIconButton,
  AudioReadingPill,
  CalloutBar,
  SheetHeader,
  SheetSection,
  StatusTag,
} from '../components/NotesUI';
import Lesson1PracticeArena from './Lesson1PracticeArena';
import { PracticeTopic } from './lesson1PracticeGenerator';

interface BaseNumberRow {
  num: string;
  kanji: string;
  reading: string;
  tts: string;
  preferred?: string;
  note: string;
}

interface AgeRow {
  label: string;
  kanji: string;
  ageReading: string;
  tts: string;
  ordinalReading: string;
  type: 'normal' | 'geminate' | 'special' | 'caution' | 'question';
  note: string;
}

const BASE_NUMBERS: BaseNumberRow[] = [
  {
    num: '0',
    kanji: '零 / 〇',
    reading: 'ゼロ / れい',
    tts: 'ゼロ',
    preferred: 'ゼロ',
    note: 'Giao tiếp dùng ゼロ; れい gặp trong điểm số, nhiệt độ, thông báo.',
  },
  { num: '1', kanji: '一', reading: 'いち', tts: 'いち', note: 'Số đếm gốc chuẩn.' },
  { num: '2', kanji: '二', reading: 'に', tts: 'に', note: 'Số đếm gốc chuẩn.' },
  { num: '3', kanji: '三', reading: 'さん', tts: 'さん', note: 'Số đếm gốc chuẩn.' },
  {
    num: '4',
    kanji: '四',
    reading: 'よん / し',
    tts: 'よん',
    preferred: 'よん',
    note: 'Ưu tiên よん khi ghép lượng từ; し cố định trong tháng 4 (しがつ).',
  },
  { num: '5', kanji: '五', reading: 'ご', tts: 'ご', note: 'Số đếm gốc chuẩn.' },
  { num: '6', kanji: '六', reading: 'ろく', tts: 'ろく', note: 'Số đếm gốc chuẩn.' },
  {
    num: '7',
    kanji: '七',
    reading: 'なな / しち',
    tts: 'なな',
    preferred: 'なな',
    note: 'Ưu tiên なな để tránh nhầm với いち (1); しち dùng trong tháng 7, 7 giờ.',
  },
  { num: '8', kanji: '八', reading: 'はち', tts: 'はち', note: 'Số đếm gốc chuẩn.' },
  {
    num: '9',
    kanji: '九',
    reading: 'きゅう / く',
    tts: 'きゅう',
    preferred: 'きゅう',
    note: 'Ưu tiên きゅう; く dùng cố định trong tháng 9 (くがつ), 9 giờ (くじ).',
  },
  { num: '10', kanji: '十', reading: 'じゅう', tts: 'じゅう', note: 'Mốc tròn chục đầu tiên.' },
];

const AGE_TABLE: AgeRow[] = [
  {
    label: '1',
    kanji: '一歳',
    ageReading: 'いっさい',
    tts: 'いっさい',
    ordinalReading: 'いちばん',
    type: 'geminate',
    note: 'Biến âm いち → いっさい (số thứ tự vẫn là いちばん).',
  },
  {
    label: '2',
    kanji: '二歳',
    ageReading: 'にさい',
    tts: 'にさい',
    ordinalReading: 'にばん',
    type: 'normal',
    note: 'Ghép thẳng số gốc + さい.',
  },
  {
    label: '3',
    kanji: '三歳',
    ageReading: 'さんさい',
    tts: 'さんさい',
    ordinalReading: 'さんばん',
    type: 'normal',
    note: 'Ghép thẳng số gốc + さい.',
  },
  {
    label: '4',
    kanji: '四歳',
    ageReading: 'よんさい',
    tts: 'よんさい',
    ordinalReading: 'よんばん',
    type: 'caution',
    note: 'Chỉ dùng よんさい (không đọc しさい).',
  },
  {
    label: '5',
    kanji: '五歳',
    ageReading: 'ごさい',
    tts: 'ごさい',
    ordinalReading: 'ごばん',
    type: 'normal',
    note: 'Ghép thẳng số gốc + さい.',
  },
  {
    label: '6',
    kanji: '六歳',
    ageReading: 'ろくさい',
    tts: 'ろくさい',
    ordinalReading: 'ろくばん',
    type: 'caution',
    note: 'Giữ nguyên ろくさい — không biến âm thành ろっさい.',
  },
  {
    label: '7',
    kanji: '七歳',
    ageReading: 'ななさい',
    tts: 'ななさい',
    ordinalReading: 'ななばん',
    type: 'caution',
    note: 'Dùng ななさい (không đọc しちさい).',
  },
  {
    label: '8',
    kanji: '八歳',
    ageReading: 'はっさい',
    tts: 'はっさい',
    ordinalReading: 'はちばん',
    type: 'geminate',
    note: 'Biến âm はち → はっさい (số thứ tự vẫn là はちばん).',
  },
  {
    label: '9',
    kanji: '九歳',
    ageReading: 'きゅうさい',
    tts: 'きゅうさい',
    ordinalReading: 'きゅうばん',
    type: 'caution',
    note: 'Chỉ dùng きゅうさい (không đọc くさい).',
  },
  {
    label: '10',
    kanji: '十歳',
    ageReading: 'じゅっさい',
    tts: 'じゅっさい',
    ordinalReading: 'じゅうばん',
    type: 'geminate',
    note: 'Biến âm じゅう → じゅっさい (hoặc じっさい).',
  },
  {
    label: '11',
    kanji: '十一歳',
    ageReading: 'じゅういっさい',
    tts: 'じゅういっさい',
    ordinalReading: 'じゅういちばん',
    type: 'geminate',
    note: 'Hàng đơn vị là 1 nên vẫn biến âm → いっさい.',
  },
  {
    label: '18',
    kanji: '十八歳',
    ageReading: 'じゅうはっさい',
    tts: 'じゅうはっさい',
    ordinalReading: 'じゅうはちばん',
    type: 'geminate',
    note: 'Hàng đơn vị là 8 nên vẫn biến âm → はっさい.',
  },
  {
    label: '20',
    kanji: '二十歳',
    ageReading: 'はたち',
    tts: 'はたち',
    ordinalReading: 'にじゅうばん',
    type: 'special',
    note: 'Ngoại lệ duy nhất: không đọc にじゅっさい và không thêm さい sau はたち.',
  },
  {
    label: '21',
    kanji: '二十一歳',
    ageReading: 'にじゅういっさい',
    tts: 'にじゅういっさい',
    ordinalReading: 'にじゅういちばん',
    type: 'geminate',
    note: 'Từ 21 tuổi quay lại quy tắc ghép bình thường + biến âm ở số 1.',
  },
  {
    label: '30',
    kanji: '三十歳',
    ageReading: 'さんじゅっさい',
    tts: 'さんじゅっさい',
    ordinalReading: 'さんじゅうばん',
    type: 'geminate',
    note: 'Các mốc tròn chục (30, 40, 50...) đều biến âm → じゅっさい.',
  },
  {
    label: 'Hỏi',
    kanji: '何歳 / おいくつ',
    ageReading: 'なんさい / おいくつ',
    tts: 'おいくつですか',
    ordinalReading: 'なんばん',
    type: 'question',
    note: 'なんさい (thông thường) · おいくつ (lịch sự với người lớn, người mới quen).',
  },
];

const TWO_DIGIT_EXAMPLES = [
  { num: '14', reading: 'じゅうよん', desc: '10 + 4' },
  { num: '19', reading: 'じゅうきゅう', desc: '10 + 9' },
  { num: '20', reading: 'にじゅう', desc: '2 × 10' },
  { num: '40', reading: 'よんじゅう', desc: 'Không đọc しじゅう' },
  { num: '75', reading: 'ななじゅうご', desc: '70 + 5' },
  { num: '99', reading: 'きゅうじゅうきゅう', desc: '90 + 9' },
];

export default function Lesson1Notes() {
  const [practiceTopic, setPracticeTopic] = useState<PracticeTopic>('numbers');
  const practiceRef = useRef<HTMLDivElement | null>(null);

  const jumpToPractice = useCallback((targetTopic: PracticeTopic) => {
    setPracticeTopic(targetTopic);
    setTimeout(() => {
      practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  }, []);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. HỆ THỐNG SỐ ĐẾM CƠ BẢN (0 - 99) */}
      <SheetSection>
        <SheetHeader
          title="Hệ thống số đếm cơ bản (0 – 99)"
          subtitle="Thuộc các số 0–10 và ưu tiên よん (4), なな (7), きゅう (9) khi ghép số."
          actionLabel="Luyện phản xạ Số đếm"
          onAction={() => jumpToPractice('numbers')}
        />

        {/* Bảng kẻ dòng phẳng 0 - 10 */}
        <div className="divide-y divide-slate-200/80 dark:divide-slate-800 border-t border-b border-slate-200/80 dark:border-slate-800 tabular-nums">
          {BASE_NUMBERS.map((row) => {
            const showNote = row.note !== 'Số đếm gốc chuẩn.';
            return (
              <div
                key={row.num}
                className="py-2.5 grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
              >
                <div className="md:col-span-4 flex items-center justify-between md:justify-start gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 font-mono text-sm font-bold text-slate-900 dark:text-white shrink-0">
                      {row.num}
                    </span>
                    <span className="w-16 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {row.kanji}
                    </span>
                    {row.preferred && (
                      <StatusTag label={`Ưu tiên ${row.preferred}`} tone="accent" />
                    )}
                  </div>

                  <div className="md:hidden">
                    <AudioReadingPill
                      reading={row.reading}
                      tts={row.tts}
                      tone={row.preferred ? 'accent' : 'default'}
                    />
                  </div>
                </div>

                <div className="hidden md:flex md:col-span-3">
                  <AudioReadingPill
                    reading={row.reading}
                    tts={row.tts}
                    tone={row.preferred ? 'accent' : 'default'}
                  />
                </div>

                {showNote ? (
                  <p className="md:col-span-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {row.note}
                  </p>
                ) : (
                  <p className="hidden md:block md:col-span-5 text-xs text-slate-400 dark:text-slate-500">
                    Số gốc chuẩn
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Công thức ghép 11 - 99 */}
        <div className="space-y-3 pt-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Công thức ghép số từ 11 đến 99
          </h3>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 grid grid-cols-1 md:grid-cols-3 text-xs sm:text-sm">
            <div className="p-3.5 space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">Từ 11 – 19</p>
              <code className="block font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold">
                じゅう + [đơn vị]
              </code>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                11 = じゅういち · 14 = じゅうよん
              </p>
            </div>
            <div className="p-3.5 space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">Tròn chục 20 – 90</p>
              <code className="block font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold">
                [chục] + じゅう
              </code>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                40 = よんじゅう · 70 = ななじゅう · 90 = きゅうじゅう
              </p>
            </div>
            <div className="p-3.5 space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">Số lẻ 2 chữ số</p>
              <code className="block font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold">
                [chục] + じゅう + [đơn vị]
              </code>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                25 = にじゅうご · 48 = よんじゅうはち
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {TWO_DIGIT_EXAMPLES.map((ex) => (
              <AudioReadingPill
                key={ex.num}
                reading={`${ex.num} · ${ex.reading}`}
                tts={ex.reading}
              />
            ))}
          </div>
        </div>
      </SheetSection>

      {/* 2. CÁCH ĐẾM TUỔI (～歳) */}
      <SheetSection>
        <SheetHeader
          title="Cách đếm tuổi (～歳)"
          subtitle="Biến âm っ ở đuôi 1, 8, 10; ngoại lệ 20 tuổi (はたち); số thứ tự (～ばん) giữ nguyên."
          actionLabel="Luyện phản xạ Đếm tuổi"
          onAction={() => jumpToPractice('age')}
        />

        <CalloutBar tone="blue">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <div>
              <strong className="text-slate-900 dark:text-white">Biến âm っ (1, 8, 10):</strong>{' '}
              いっさい (1), はっさい (8), じゅっさい (10).
            </div>
            <div>
              <strong className="text-rose-700 dark:text-rose-300">Ngoại lệ 20 tuổi:</strong>{' '}
              Đọc <strong>はたち</strong> (không thêm さい phía sau).
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white">Chống nhầm:</strong> 6 tuổi ={' '}
              <strong>ろくさい</strong> (giữ nguyên); số 4, 7, 9 dùng よん・なな・きゅう.
            </div>
          </div>
        </CalloutBar>

        {/* Danh sách kẻ dòng chuẩn thiết kế Sổ tay */}
        <div className="divide-y divide-slate-200/80 dark:divide-slate-800 border-t border-b border-slate-200/80 dark:border-slate-800 tabular-nums">
          {AGE_TABLE.map((row) => {
            const pillTone =
              row.type === 'special'
                ? 'exception'
                : row.type === 'geminate'
                ? 'mutation'
                : row.type === 'question'
                ? 'accent'
                : 'default';

            return (
              <div
                key={row.label}
                className="py-2.5 grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
              >
                <div className="md:col-span-5 flex items-center justify-between md:justify-start gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                    <span className="w-8 font-mono text-sm font-bold text-slate-900 dark:text-white shrink-0">
                      {row.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {row.kanji}
                    </span>
                    {row.type === 'geminate' && <StatusTag label="Biến âm" tone="mutation" />}
                    {row.type === 'special' && <StatusTag label="Ngoại lệ" tone="exception" />}
                  </div>

                  <div className="md:hidden shrink-0">
                    <AudioReadingPill
                      reading={row.ageReading}
                      tts={row.tts}
                      tone={pillTone}
                    />
                  </div>
                </div>

                <div className="hidden md:flex md:col-span-3">
                  <AudioReadingPill reading={row.ageReading} tts={row.tts} tone={pillTone} />
                </div>

                <div className="md:col-span-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <span className="text-slate-400 dark:text-slate-500 mr-1.5">
                    [{row.ordinalReading}]
                  </span>
                  {row.note}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3 Mẫu câu hỏi & trả lời tuổi */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800 grid grid-cols-1 lg:grid-cols-3 text-xs sm:text-sm">
          <div className="p-3.5 flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Hỏi thông thường
              </span>
              <p className="font-bold text-slate-900 dark:text-white">
                たろうちゃんは なんさいですか。
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                → 8さい（はっさい）です。
              </p>
            </div>
            <AudioIconButton
              tts="たろうちゃんは なんさいですか。はっさいです。"
              label="Nghe câu hỏi tuổi thông thường"
            />
          </div>

          <div className="p-3.5 flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Hỏi lịch sự
              </span>
              <p className="font-bold text-slate-900 dark:text-white">
                ミラーさんは おいくつですか。
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                → 28さい（にじゅうはっさい）です。
              </p>
            </div>
            <AudioIconButton
              tts="ミラーさんは おいくつですか。にじゅうはっさいです。"
              label="Nghe câu hỏi tuổi lịch sự"
            />
          </div>

          <div className="p-3.5 flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-xs font-medium text-rose-700 dark:text-rose-300">
                Mốc 20 tuổi
              </span>
              <p className="font-bold text-slate-900 dark:text-white">
                わたしは はたちです。
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-400">
                Sai: はたちさい / にじゅっさい
              </p>
            </div>
            <AudioIconButton tts="わたしは はたちです。" label="Nghe câu 20 tuổi" />
          </div>
        </div>
      </SheetSection>

      {/* 3. PHÒNG LUYỆN PHẢN XẠ */}
      <div ref={practiceRef} className="scroll-mt-4">
        <Lesson1PracticeArena topic={practiceTopic} onTopicChange={setPracticeTopic} />
      </div>
    </div>
  );
}
