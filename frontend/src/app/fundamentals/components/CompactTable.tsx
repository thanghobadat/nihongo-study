'use client';

import React from 'react';
import { speakTTS } from '../../utils/audioHelper';

export interface CompactTableRow {
  id?: string | number;
  col1: string; // Primary label / Kanji / Number
  col2: string; // Kana reading
  col3: string; // Romaji or Meaning or Note
  isSpecial?: boolean; // Highlight with amber
  specialNote?: string;
  audioText?: string;
}

interface CompactTableProps {
  headers?: [string, string, string, string];
  rows: CompactTableRow[];
  emptyMessage?: string;
}

export default function CompactTable({
  headers = ['Mục', 'Cách đọc (Kana)', 'Ý nghĩa / Romaji', 'Nghe'],
  rows,
  emptyMessage = 'Không có dữ liệu'
}: CompactTableProps) {
  const handlePlayAudio = (text: string) => {
    speakTTS(text);
  };

  if (!rows || rows.length === 0) {
    return <div className="text-xs text-slate-400 py-3 text-center">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
      <table className="w-full text-xs text-left border-collapse min-w-[340px]">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold">
            <th className="py-2 px-3 w-1/4">{headers[0]}</th>
            <th className="py-2 px-3 w-1/3">{headers[1]}</th>
            <th className="py-2 px-3">{headers[2]}</th>
            <th className="py-2 px-2 text-center w-10">{headers[3]}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {rows.map((r, idx) => (
            <tr
              key={r.id || idx}
              className={`transition-colors group ${
                r.isSpecial
                  ? 'bg-amber-50/70 dark:bg-amber-950/25 border-l-3 border-amber-500'
                  : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
              }`}
            >
              <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">
                {r.col1}
              </td>
              <td className="py-2 px-3 font-semibold text-indigo-600 dark:text-indigo-400">
                {r.col2}
              </td>
              <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                <span>{r.col3}</span>
                {r.specialNote && (
                  <span className="ml-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-medium block sm:inline">
                    ({r.specialNote})
                  </span>
                )}
              </td>
              <td className="py-2 px-2 text-center">
                <button
                  type="button"
                  onClick={() => handlePlayAudio(r.audioText || r.col2.split('/')[0].trim())}
                  className="w-6 h-6 inline-flex items-center justify-center rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                  title="Nghe phát âm"
                >
                  🔊
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
