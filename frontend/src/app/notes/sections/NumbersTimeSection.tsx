'use client';

import React from 'react';
import Lesson1Notes from '../lessons/Lesson1Notes';
import Lesson3Notes from '../lessons/Lesson3Notes';
import Lesson5Notes from '../lessons/Lesson5Notes';

export type NumbersSubTab = 'lesson1' | 'lesson3' | 'lesson5';

export const NUMBERS_SUB_OPTIONS: { id: NumbersSubTab; label: string }[] = [
  { id: 'lesson1', label: 'Bài 1: Số đếm (0–99) & Đếm tuổi (～歳)' },
  { id: 'lesson3', label: 'Bài 3: Số lớn (百・千・万), Tiền & Tầng lầu' },
  { id: 'lesson5', label: 'Bài 5: Tháng (1月–12月) & Ngày (1日–31日)' },
];

interface NumbersTimeSectionProps {
  subTab: NumbersSubTab;
}

export default function NumbersTimeSection({ subTab }: NumbersTimeSectionProps) {
  return (
    <div>
      {subTab === 'lesson1' && <Lesson1Notes />}
      {subTab === 'lesson3' && <Lesson3Notes />}
      {subTab === 'lesson5' && <Lesson5Notes />}
    </div>
  );
}
