'use client';

import React from 'react';
import { speakJapaneseNote } from '../sections/noteUtils';

/* ============================================================================
 * 1. VECTOR SVG ICONS (1.8px stroke, zero emojis, aria-hidden by default)
 * ============================================================================ */

export function SpeakerSvg({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

export function ChevronDownSvg({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ArrowRightSvg({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function MenuSvg({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function CloseSvg({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function RefreshSvg({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

export function SlidersSvg({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="2" x2="6" y1="14" y2="14" />
      <line x1="10" x2="14" y1="8" y2="8" />
      <line x1="18" x2="22" y1="16" y2="16" />
    </svg>
  );
}

export function ClockSvg({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function AlertCircleSvg({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

export function TrophySvg({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

export type SidebarNavIconId = 'dashboard' | 'roadmap' | 'vocab' | 'kanji' | 'practice' | 'jlpt';

export function SidebarNavSvg({
  id,
  className = 'w-4 h-4 shrink-0',
}: {
  id: SidebarNavIconId;
  className?: string;
}) {
  switch (id) {
    case 'dashboard':
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      );
    case 'roadmap':
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
        </svg>
      );
    case 'vocab':
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      );
    case 'kanji':
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M4 7h16" />
          <path d="M12 3v4" />
          <path d="M7 12h10" />
          <path d="M5 16h14" />
          <path d="M12 12v9" />
        </svg>
      );
    case 'practice':
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" />
        </svg>
      );
    case 'jlpt':
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
  }
}

/* ============================================================================
 * 2. SHARED MINIMALIST NOTEBOOK SHEET PRIMITIVES
 * ============================================================================ */

export function SheetSection({
  id,
  children,
  className = '',
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 sm:space-y-5 ${className}`}
    >
      {children}
    </section>
  );
}

export function SheetHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-slate-200/90 dark:border-slate-800">
      <div className="min-w-0">
        <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-snug">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="self-start sm:self-center min-h-[40px] px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-blue-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 hover:text-blue-700 dark:text-slate-200 dark:hover:text-blue-300 inline-flex items-center gap-1.5 shrink-0 cursor-pointer touch-manipulation transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span>{actionLabel}</span>
          <ArrowRightSvg />
        </button>
      )}
    </div>
  );
}

export type SemanticTone = 'default' | 'mutation' | 'exception' | 'accent';

export function StatusTag({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: SemanticTone;
}) {
  const toneClass =
    tone === 'exception'
      ? 'bg-rose-700 text-white dark:bg-rose-600 dark:text-white'
      : tone === 'mutation'
      ? 'bg-amber-700 text-white dark:bg-amber-600 dark:text-white'
      : tone === 'accent'
      ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800'
      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold leading-tight shrink-0 ${toneClass}`}
    >
      {label}
    </span>
  );
}

export function AudioReadingPill({
  reading,
  tts,
  tone = 'default',
  className = '',
}: {
  reading: string;
  tts?: string;
  tone?: SemanticTone;
  className?: string;
}) {
  const toneStyle =
    tone === 'exception'
      ? 'bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/45 dark:hover:bg-rose-950/70 border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200'
      : tone === 'mutation'
      ? 'bg-amber-50/80 hover:bg-amber-100/80 dark:bg-amber-950/35 dark:hover:bg-amber-950/60 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200'
      : tone === 'accent'
      ? 'bg-blue-50/80 hover:bg-blue-100/80 dark:bg-blue-950/45 dark:hover:bg-blue-950/70 border-blue-200 dark:border-blue-800/80 text-blue-800 dark:text-blue-200'
      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100';

  return (
    <button
      type="button"
      onClick={() => speakJapaneseNote(tts ?? reading)}
      aria-label={`Nghe phát âm ${reading}`}
      title={`Nghe: ${reading}`}
      className={`min-h-[38px] px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold cursor-pointer touch-manipulation transition-colors duration-150 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${toneStyle} ${className}`}
    >
      <SpeakerSvg className="w-3.5 h-3.5 shrink-0 opacity-75" />
      <span className="truncate">{reading}</span>
    </button>
  );
}

export function AudioIconButton({
  tts,
  label,
  className = '',
}: {
  tts: string;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => speakJapaneseNote(tts)}
      aria-label={label ?? `Nghe phát âm ${tts}`}
      title={label ?? 'Nghe phát âm'}
      className={`min-h-[40px] min-w-[40px] rounded-full border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 flex items-center justify-center shrink-0 cursor-pointer touch-manipulation transition-colors duration-150 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${className}`}
    >
      <SpeakerSvg className="w-4 h-4" />
    </button>
  );
}

export function CalloutBar({
  children,
  tone = 'blue',
}: {
  children: React.ReactNode;
  tone?: 'blue' | 'amber' | 'rose';
}) {
  const borderClass =
    tone === 'rose'
      ? 'border-rose-600 dark:border-rose-400 bg-rose-50/55 dark:bg-rose-950/25'
      : tone === 'amber'
      ? 'border-amber-600 dark:border-amber-400 bg-amber-50/55 dark:bg-amber-950/25'
      : 'border-blue-600 dark:border-blue-400 bg-blue-50/55 dark:bg-slate-900/90';

  return (
    <div
      className={`border-l-[3px] rounded-r-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed ${borderClass}`}
    >
      {children}
    </div>
  );
}
