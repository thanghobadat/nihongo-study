import React from 'react';
import { getPitchAccentStates, getPitchAccentLabel } from '../utils/pitchAccentHelper';

interface PitchAccentDisplayProps {
  kana: string;
  accent: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PitchAccentDisplay({
  kana,
  accent,
  className = '',
  size = 'md'
}: PitchAccentDisplayProps) {
  if (!kana) return null;

  const states = getPitchAccentStates(kana, accent);
  const labelInfo = getPitchAccentLabel(accent, kana);

  // Size mapping
  const sizeClasses = {
    sm: 'text-sm px-0.5 pt-2',
    md: 'text-base px-1 pt-3',
    lg: 'text-2xl px-1.5 pt-4'
  };

  const borderHeight = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10'
  };

  return (
    <div className={`inline-flex flex-col items-center group relative cursor-help ${className}`}>
      {/* Visual Pitch Line Render */}
      <div className="flex items-end font-medium tracking-wider">
        {states.map((state, idx) => {
          const isHigh = state.pitch === 'H';
          const hasDrop = state.hasDrop;

          return (
            <span
              key={idx}
              className={`relative inline-block ${sizeClasses[size]} select-none transition-colors duration-200 text-slate-700 dark:text-slate-200`}
              style={{ minWidth: '1.2em', textAlign: 'center' }}
            >
              {/* Pitch accent line (top border) */}
              {isHigh && (
                <span className="absolute top-0 left-0 right-0 border-t-2 border-rose-500 dark:border-rose-400" />
              )}
              
              {/* Pitch accent drop (right border) */}
              {hasDrop && (
                <span className={`absolute top-0 right-0 w-0 border-r-2 border-rose-500 dark:border-rose-400 ${borderHeight[size]}`} />
              )}

              {/* Mora character */}
              {state.text}
            </span>
          );
        })}
      </div>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 transition-opacity duration-200">
        <div className="bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg py-1.5 px-3 shadow-xl max-w-xs w-48 text-center border border-slate-700">
          <div className="font-bold text-rose-400 mb-0.5">{labelInfo.name}</div>
          <div className="text-slate-300 leading-relaxed scale-95 origin-center">{labelInfo.description}</div>
          <div className="text-[10px] text-slate-400 mt-1">Chỉ số hạt nhân: N = {accent}</div>
        </div>
        <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
      </div>
    </div>
  );
}
