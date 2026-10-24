export interface PracticeQuestion {
  id: string;
  lesson: number;
  unitId: string;
  format: string;
  formatLabel: string;
  question_kana: string;
  question_kanji?: string;
  subtext?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  audioText?: string;
}

export interface UnitPracticeSummary {
  unitId: string;
  lesson: number;
  title: string;
  count: number;
  formats: { id: string; label: string; count: number }[];
}
