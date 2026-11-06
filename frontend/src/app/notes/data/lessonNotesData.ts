import React from 'react';
import Lesson1Notes from '../lessons/Lesson1Notes';
import Lesson3Notes from '../lessons/Lesson3Notes';
import Lesson4Notes from '../lessons/Lesson4Notes';

export interface LessonNoteHighlight {
  id: string;
  title: string;
  tag?: string;
  brief?: string;
}

export interface LessonNoteConfig {
  lessonId: number;
  level: 'N5' | 'N4';
  updatedAt?: string;
  highlights: LessonNoteHighlight[];
  Component?: React.ComponentType;
}

export const TOTAL_MINNA_LESSONS = 50;

/**
 * Danh sách các bài học không có kiến thức mở rộng riêng (ẩn hoàn toàn khỏi /notes)
 */
export const EXCLUDED_NOTE_LESSONS = new Set<number>([2]);

/**
 * Nơi đăng ký nội dung "Kiến thức cần nhớ" riêng cho từng bài.
 */
const CUSTOM_LESSON_NOTES: Partial<
  Record<number, Omit<LessonNoteConfig, 'lessonId' | 'level'>>
> = {
  1: {
    updatedAt: '06/11/2026',
    highlights: [
      {
        id: 'l1-numbers',
        tag: 'Số đếm',
        title: 'Hệ thống số đếm cơ bản (0 – 99) & quy tắc ghép số hai chữ số',
        brief: 'Ưu tiên dùng よん (4), なな (7), きゅう (9) khi ghép hàng chục và lượng từ.',
      },
      {
        id: 'l1-age',
        tag: 'Đếm tuổi',
        title: 'Cách đếm tuổi (～歳 / ～さい), biến âm っ (1, 8, 10) & ngoại lệ 20 tuổi (はたち)',
        brief: 'Đối chiếu với số thứ tự ～ばん (không biến âm) và mẫu hỏi なんさい / おいくつ.',
      },
      {
        id: 'l1-reflex-practice',
        tag: 'Phản xạ 10s',
        title: 'Luyện phản xạ trắc nghiệm gài bẫy (Hira / Kanji / Nghe / Kết hợp)',
        brief: 'Giảm 10% thời gian mỗi chuỗi 3 câu đúng cho cả Số đếm (1–99) & Đếm tuổi.',
      },
    ],
    Component: Lesson1Notes,
  },
  3: {
    updatedAt: '06/11/2026',
    highlights: [
      {
        id: 'l3-money',
        tag: 'Đếm tiền',
        title: 'Số lớn (百・千・万), 5 biến âm (300/600/800/3000/8000) & quy tắc tách 4 số 0 (～円)',
        brief: 'Chống nhầm hàng Vạn まん (10,000 = いちまん, 100,000 = じゅうまん) và 6,000 = ろくせん.',
      },
      {
        id: 'l3-floors',
        tag: 'Đếm tầng',
        title: 'Cách đếm tầng lầu (～階 / ～かい・～がい), tầng 3 (さんがい) & tầng hầm (ちか)',
        brief: 'Biến âm 1F (いっかい), 3F (さんがい), 6F (ろっかい), 8F (はっかい), 10F (じゅっかい) & hỏi なんがい.',
      },
      {
        id: 'l3-reflex-practice',
        tag: 'Phản xạ 10s',
        title: 'Luyện phản xạ Đếm tiền (¥) & Đếm tầng lầu gài bẫy (Hira / Kanji / Nghe / Kết hợp)',
        brief: 'Rèn tốc độ đọc giá tiền mua sắm & tầng lầu dưới áp lực thời gian giảm dần.',
      },
    ],
    Component: Lesson3Notes,
  },
  4: {
    updatedAt: '06/11/2026',
    highlights: [
      {
        id: 'l4-tense-table',
        tag: 'Thì & Thể',
        title: 'Bảng chia 3 Thì (Quá khứ • Hiện tại • Tương lai) & Thể động từ ～ます',
        brief: 'Đối chiếu trực diện Khẳng định, Phủ định, Nghi vấn (ます・ません・ました・ませんでした).',
      },
      {
        id: 'l4-reflex-practice',
        tag: 'Bài tập 10s',
        title: 'Bài tập phản xạ Chia Thì & Thể + Đáp câu hỏi (Hiragana & Kanji)',
        brief: 'Rèn tốc độ chọn đuôi động từ đúng và chống bẫy ませんだった / そうです.',
      },
    ],
    Component: Lesson4Notes,
  },
};

export const LESSON_NOTES_LIST: LessonNoteConfig[] = Array.from(
  { length: TOTAL_MINNA_LESSONS },
  (_, index) => index + 1
)
  .filter((lessonId) => !EXCLUDED_NOTE_LESSONS.has(lessonId))
  .map((lessonId) => {
    const level: 'N5' | 'N4' = lessonId <= 25 ? 'N5' : 'N4';
    const custom = CUSTOM_LESSON_NOTES[lessonId];
    return {
      lessonId,
      level,
      updatedAt: custom?.updatedAt,
      highlights: custom?.highlights ?? [],
      Component: custom?.Component,
    };
  });

export const LESSON_NOTES_MAP: Record<number, LessonNoteConfig> = Object.fromEntries(
  LESSON_NOTES_LIST.map((item) => [item.lessonId, item])
);

export function getLessonNoteConfig(lessonId: number): LessonNoteConfig | undefined {
  return LESSON_NOTES_MAP[lessonId];
}

export function hasLessonNoteContent(config?: LessonNoteConfig): boolean {
  if (!config) return false;
  return config.highlights.length > 0 || Boolean(config.Component);
}
