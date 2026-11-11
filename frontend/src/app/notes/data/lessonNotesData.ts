import React from 'react';
import Lesson1Notes from '../lessons/Lesson1Notes';
import Lesson3Notes from '../lessons/Lesson3Notes';
import Lesson4Notes from '../lessons/Lesson4Notes';
import Lesson5Notes from '../lessons/Lesson5Notes';
import Lesson6Notes from '../lessons/Lesson6Notes';

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
        tag: 'Bài tập thực hành',
        title: 'Bài tập thực hành Chia Thì & Thể + Đáp câu hỏi (Hiragana & Kanji)',
        brief: 'Luyện chọn đuôi động từ đúng không giới hạn thời gian và chống bẫy ませんだった / そうです.',
      },
    ],
    Component: Lesson4Notes,
  },
  5: {
    updatedAt: '10/11/2026',
    highlights: [
      {
        id: 'l5-dates-combined',
        tag: 'Ngày & Tháng',
        title: 'Đếm Tháng (1月–12月), Ngày (1日–31日) & Công thức kết hợp Ngày–Tháng (～月～日)',
        brief: '3 tháng đặc biệt (4月 しがつ, 7月 しちがつ, 9月 くがつ), Mùng 1–10 thuần Nhật & 14/20/24日.',
      },
      {
        id: 'l5-particles',
        tag: 'Trợ từ & Ngoại lệ',
        title: 'Trợ từ di chuyển (へ・で・と・に) & 4 ngoại lệ gài bẫy (歩いて, 一人で, どこへも)',
        brief: 'Đi bộ (歩いて) cấm dùng で; Đi một mình (一人で) cấm dùng と; thời gian tương đối cấm に.',
      },
      {
        id: 'l5-practice',
        tag: 'Bài tập thực hành',
        title: 'Luyện tập Kết hợp Ngày–Tháng (2 chiều) & Trợ từ / Ngoại lệ (Không giới hạn giờ)',
        brief: '36 tổ hợp Tháng + Ngày gài bẫy chéo và 24 câu thực chiến trợ từ へ・で・と・に.',
      },
    ],
    Component: Lesson5Notes,
  },
  6: {
    updatedAt: '11/11/2026',
    highlights: [
      {
        id: 'l6-particles',
        tag: 'Trợ từ Bài 6',
        title: 'Hệ thống Trợ từ hành động (を・で・に・も・と) & Bẫy phân biệt (で vs へ, に vs を)',
        brief: 'Ngoại động từ dùng を (riêng 会います dùng に); nơi diễn ra hành động dùng で; 何も nuốt mất を.',
      },
      {
        id: 'l6-nan-nani',
        tag: 'Quy tắc 何',
        title: 'Quy tắc đọc chữ 何: Khi nào đọc なん (nan), khi nào đọc なに (nani)?',
        brief: 'Đọc なん trước âm hàng た・だ・な (T-D-N: です・で・の・と) & hậu tố đếm; đọc なに trước を・も・か.',
      },
      {
        id: 'l6-practice',
        tag: 'Bài tập thực hành',
        title: 'Luyện tập Trợ từ Bài 6 & Phân biệt なん / なに (Không giới hạn thời gian)',
        brief: '28 câu gài bẫy trợ từ (を・で・に・へ・も・と) và 24 câu phản xạ chọn cách đọc 何 (なん vs なに).',
      },
    ],
    Component: Lesson6Notes,
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
