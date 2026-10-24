'use client';

import React, { useState } from 'react';
import { KnowledgeUnit } from '../data/knowledgeUnits';
import UnitContent from './UnitContent';

interface KnowledgeUnitCardProps {
  unit: KnowledgeUnit;
  defaultExpanded?: boolean;
  onPractice?: (unitId: string) => void;
}

export default function KnowledgeUnitCard({
  unit,
  defaultExpanded = false,
  onPractice,
}: KnowledgeUnitCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isExpanded
          ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/60 shadow-md'
          : 'bg-white/80 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
      }`}
    >
      {/* Header bar */}
      <div className="w-full p-3.5 sm:p-4 flex items-start justify-between gap-3 group">
        {/* Clickable accordion toggle area */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-start space-x-2.5 min-w-0 flex-1 cursor-pointer select-none"
        >
          {/* Chevron indicator */}
          <span
            className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-transform duration-200 shrink-0 ${
              isExpanded
                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rotate-90'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-600'
            }`}
          >
            ▸
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                {unit.topicLabel}
              </span>
              {unit.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    unit.hasSoundChange || unit.hasException
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300'
                      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                  }`}
                >
                  {unit.badge}
                </span>
              )}
            </div>

            <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {unit.title}
            </h3>

            {!isExpanded && (
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {unit.summary}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons (independent, not nested) */}
        <div className="shrink-0 flex items-center space-x-2 pt-0.5">
          {onPractice && (
            <button
              type="button"
              onClick={() => onPractice(unit.id)}
              title="Luyện tập trắc nghiệm riêng cho đơn vị kiến thức này"
              className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60 rounded-xl text-[11px] font-black transition-all shadow-2xs flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <span>🎯</span>
              <span>Luyện thẻ</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer p-0.5"
          >
            {isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
          </button>
        </div>
      </div>

      {/* Expanded Body Content */}
      {isExpanded && (
        <div className="px-3.5 sm:px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/60 animate-fade-in space-y-3">
          <UnitContent unit={unit} />
          {onPractice && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => onPractice(unit.id)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>🎯</span>
                <span>Luyện tập sâu thẻ này</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
