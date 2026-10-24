import { PracticeQuestion, UnitPracticeSummary } from './types';
export * from './types';
export * from './generators';
export * from './wordBank';

// Static question count map per lesson
export const LESSON_QUESTION_COUNTS: Record<number, number> = {
  1: 160,
  2: 80,
  3: 120,
  4: 140,
  5: 180,
  6: 120,
  7: 80,
  8: 140,
  9: 120,
  10: 120,
  11: 140,
  12: 60,
  13: 40,
  14: 60,
  17: 60,
  18: 20,
  19: 20,
  22: 40,
  27: 60,
  28: 40,
  31: 20,
  32: 40,
  35: 20,
  37: 20,
  39: 40,
  48: 20,
};

// Check if a lesson has practice data
export function hasLessonPractice(lessonId: number): boolean {
  return lessonId in LESSON_QUESTION_COUNTS;
}

// Get total question count for a lesson
export function getLessonQuestionCount(lessonId: number): number {
  return LESSON_QUESTION_COUNTS[lessonId] || 0;
}

// Dynamic loader for practice questions per lesson
export async function loadLessonPractice(lessonId: number): Promise<PracticeQuestion[]> {
  switch (lessonId) {
    case 1: {
      const mod = await import('./lessons/lesson01');
      return mod.LESSON_01_QUESTIONS;
    }
    case 2: {
      const mod = await import('./lessons/lesson02');
      return mod.LESSON_02_QUESTIONS;
    }
    case 3: {
      const mod = await import('./lessons/lesson03');
      return mod.LESSON_03_QUESTIONS;
    }
    case 4: {
      const mod = await import('./lessons/lesson04');
      return mod.LESSON_04_QUESTIONS;
    }
    case 5: {
      const mod = await import('./lessons/lesson05');
      return mod.LESSON_05_QUESTIONS;
    }
    case 6: {
      const mod = await import('./lessons/lesson06');
      return mod.LESSON_06_QUESTIONS;
    }
    case 7: {
      const mod = await import('./lessons/lesson07');
      return mod.LESSON_07_QUESTIONS;
    }
    case 8: {
      const mod = await import('./lessons/lesson08');
      return mod.LESSON_08_QUESTIONS;
    }
    case 9: {
      const mod = await import('./lessons/lesson09');
      return mod.LESSON_09_QUESTIONS;
    }
    case 10: {
      const mod = await import('./lessons/lesson10');
      return mod.LESSON_10_QUESTIONS;
    }
    case 11: {
      const mod = await import('./lessons/lesson11');
      return mod.LESSON_11_QUESTIONS;
    }
    case 12: {
      const mod = await import('./lessons/lesson12');
      return mod.LESSON_12_QUESTIONS;
    }
    case 13: {
      const mod = await import('./lessons/lesson13');
      return mod.LESSON_13_QUESTIONS;
    }
    case 14: {
      const mod = await import('./lessons/lesson14');
      return mod.LESSON_14_QUESTIONS;
    }
    case 17: {
      const mod = await import('./lessons/lesson17');
      return mod.LESSON_17_QUESTIONS;
    }
    case 18: {
      const mod = await import('./lessons/lesson18');
      return mod.LESSON_18_QUESTIONS;
    }
    case 19: {
      const mod = await import('./lessons/lesson19');
      return mod.LESSON_19_QUESTIONS;
    }
    case 22: {
      const mod = await import('./lessons/lesson22');
      return mod.LESSON_22_QUESTIONS;
    }
    case 27: {
      const mod = await import('./lessons/lesson27');
      return mod.LESSON_27_QUESTIONS;
    }
    case 28: {
      const mod = await import('./lessons/lesson28');
      return mod.LESSON_28_QUESTIONS;
    }
    case 31: {
      const mod = await import('./lessons/lesson31');
      return mod.LESSON_31_QUESTIONS;
    }
    case 32: {
      const mod = await import('./lessons/lesson32');
      return mod.LESSON_32_QUESTIONS;
    }
    case 35: {
      const mod = await import('./lessons/lesson35');
      return mod.LESSON_35_QUESTIONS;
    }
    case 37: {
      const mod = await import('./lessons/lesson37');
      return mod.LESSON_37_QUESTIONS;
    }
    case 39: {
      const mod = await import('./lessons/lesson39');
      return mod.LESSON_39_QUESTIONS;
    }
    case 48: {
      const mod = await import('./lessons/lesson48');
      return mod.LESSON_48_QUESTIONS;
    }
    default:
      return [];
  }
}

// Get unit summary from a list of questions
export function summarizeLessonUnits(questions: PracticeQuestion[]): UnitPracticeSummary[] {
  const map = new Map<string, {
    unitId: string;
    lesson: number;
    title: string;
    count: number;
    formats: Map<string, { id: string; label: string; count: number }>;
  }>();

  for (const q of questions) {
    if (!map.has(q.unitId)) {
      map.set(q.unitId, {
        unitId: q.unitId,
        lesson: q.lesson,
        title: q.unitId,
        count: 0,
        formats: new Map(),
      });
    }
    const item = map.get(q.unitId)!;
    item.count++;

    const fmt = item.formats.get(q.format) || { id: q.format, label: q.formatLabel, count: 0 };
    fmt.count++;
    item.formats.set(q.format, fmt);
  }

  return Array.from(map.values()).map(v => ({
    unitId: v.unitId,
    lesson: v.lesson,
    title: v.title,
    count: v.count,
    formats: Array.from(v.formats.values()),
  }));
}
