'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../utils/api';
import SidebarSettings from '../../components/SidebarSettings';
import {
  LESSON_NOTES_LIST,
  TOTAL_MINNA_LESSONS,
  getLessonNoteConfig,
  hasLessonNoteContent,
} from '../data/lessonNotesData';

interface LessonMeta {
  id: number;
  title: string;
  description?: string;
}

function extractLessonSubtitle(lessonId: number, rawTitle?: string): string {
  if (!rawTitle) return '';
  const cleaned = rawTitle
    .replace(new RegExp(`^Bài\\s*${lessonId}\\s*[:：\\-]\\s*`, 'i'), '')
    .trim();
  if (!cleaned || cleaned.toLowerCase() === `bài ${lessonId}`) return '';
  return cleaned;
}

export default function LessonNoteDetailPage() {
  const params = useParams();
  const router = useRouter();

  const rawLessonId = Array.isArray(params?.lessonId)
    ? params.lessonId[0]
    : params?.lessonId;
  const lessonId = Number(rawLessonId);
  const noteConfig = Number.isInteger(lessonId)
    ? getLessonNoteConfig(lessonId)
    : undefined;
  const isValidLesson = Boolean(noteConfig);

  const [lessons, setLessons] = useState<LessonMeta[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Redirect invalid lesson IDs cleanly back to the /notes summary hub
  useEffect(() => {
    if (!isValidLesson) {
      router.replace('/notes');
    }
  }, [isValidLesson, router]);

  // Hydrate lesson titles from cache + API
  useEffect(() => {
    let cancelled = false;
    async function loadLessons() {
      const lessonsPath = '/api/user/lessons?course=minna';
      const cached = api.peekCache(lessonsPath);
      if (Array.isArray(cached) && !cancelled) {
        setLessons(cached);
      }
      try {
        const fresh = await api.get(lessonsPath);
        if (Array.isArray(fresh) && !cancelled) {
          setLessons(fresh);
        }
      } catch {
        // Offline / fallback title still works cleanly
      }
    }
    loadLessons();
    return () => {
      cancelled = true;
    };
  }, []);

  const lessonTitleMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const item of lessons) {
      if (item && typeof item.id === 'number') {
        map[item.id] = item.title || '';
      }
    }
    return map;
  }, [lessons]);

  if (!isValidLesson || !noteConfig) {
    return null;
  }

  const currentIdx = LESSON_NOTES_LIST.findIndex((item) => item.lessonId === lessonId);
  const prevItem = currentIdx > 0 ? LESSON_NOTES_LIST[currentIdx - 1] : undefined;
  const nextItem =
    currentIdx >= 0 && currentIdx < LESSON_NOTES_LIST.length - 1
      ? LESSON_NOTES_LIST[currentIdx + 1]
      : undefined;

  const CustomComponent = noteConfig.Component;
  const hasContent = hasLessonNoteContent(noteConfig);
  const subtitle = extractLessonSubtitle(lessonId, lessonTitleMap[lessonId]);

  const menuItems = [
    { name: 'Tiến độ học', id: 'dashboard', icon: '📊' },
    { name: 'Ngữ pháp', id: 'roadmap', icon: '🗺️' },
    { name: 'Từ vựng', id: 'vocab', icon: '📚' },
    { name: 'Chữ Hán (Kanji)', id: 'kanji', icon: '🉐' },
    { name: 'Ôn tập từ vựng', id: 'practice', icon: '✏️' },
    { name: 'Luyện đề JLPT', id: 'jlpt', icon: '🎓' },
  ];

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/50 dark:from-[#0b1329] dark:via-[#090d1a] dark:to-[#050811] text-slate-800 dark:text-slate-100 font-sans relative">
      {/* Mobile Hamburger toggle button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Mở menu điều hướng"
        className="lg:hidden absolute top-4 left-4 z-40 p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer backdrop-blur-md active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar backdrop overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/20 z-40 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* 1. Left Sidebar Navigation Menu */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-slate-950/95 shadow-lg shadow-slate-200/40 border-r border-slate-200 dark:border-slate-800 dark:border-r-slate-900/50 flex flex-col justify-between p-6 backdrop-blur-xl shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-8 px-2 shrink-0">
            <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Minna Nihongo
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xl p-1 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <nav className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-0 select-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-100 hover:[&::-webkit-scrollbar-thumb]:bg-slate-450 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {menuItems.map((item) => {
              const targetHref =
                item.id === 'dashboard'
                  ? '/dashboard'
                  : item.id === 'roadmap'
                  ? '/roadmap'
                  : `/lessons/${lessonId}?tab=${item.id}`;
              return (
                <Link
                  key={item.id}
                  href={targetHref}
                  prefetch
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:bg-slate-900/40 dark:shadow-none"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <SidebarSettings />
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-20 lg:p-10 space-y-6 md:space-y-8 relative">
        {/* Top Action & Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/85 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/notes?level=${noteConfig.level}`}
              prefetch
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <span>←</span>
              <span>Trang tổng kết</span>
            </Link>

            {/* Prev / Selector / Next */}
            <div className="inline-flex items-center rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 gap-1">
              {prevItem ? (
                <Link
                  href={`/notes/${prevItem.lessonId}`}
                  prefetch
                  title={`Bài ${prevItem.lessonId}`}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  ← Bài {prevItem.lessonId}
                </Link>
              ) : (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-300 dark:text-slate-700 select-none">
                  ← Đầu
                </span>
              )}

              <select
                aria-label="Chọn bài học"
                value={lessonId}
                onChange={(e) => router.push(`/notes/${e.target.value}`)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer"
              >
                {LESSON_NOTES_LIST.map((item) => {
                  const sub = extractLessonSubtitle(
                    item.lessonId,
                    lessonTitleMap[item.lessonId]
                  );
                  return (
                    <option key={item.lessonId} value={item.lessonId}>
                      {sub
                        ? `Bài ${item.lessonId}: ${sub}`
                        : `Bài ${item.lessonId} (${item.level})`}
                    </option>
                  );
                })}
              </select>

              {nextItem ? (
                <Link
                  href={`/notes/${nextItem.lessonId}`}
                  prefetch
                  title={`Bài ${nextItem.lessonId}`}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  Bài {nextItem.lessonId} →
                </Link>
              ) : (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-300 dark:text-slate-700 select-none">
                  Cuối →
                </span>
              )}
            </div>
          </div>

          {/* Secondary Button: Open Main Lesson Page */}
          <Link
            href={`/lessons/${lessonId}`}
            prefetch
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors"
          >
            <span>📚</span>
            <span>Mở trang học Bài {lessonId} ➔</span>
          </Link>
        </div>

        {/* Lesson Header Banner */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold">
              JLPT {noteConfig.level}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
              Bài {lessonId} / {TOTAL_MINNA_LESSONS}
            </span>
            {noteConfig.updatedAt && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                • Cập nhật: {noteConfig.updatedAt}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
            KIẾN THỨC CẦN NHỚ — BÀI {lessonId}
            {subtitle ? `: ${subtitle}` : ''}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tổng hợp các quy tắc trọng tâm, bảng biến đổi và mẹo ghi nhớ riêng của Bài {lessonId}.
          </p>
        </div>

        {/* Lesson Custom Content or Clean Empty Frame */}
        {CustomComponent ? (
          <div className="pb-10">
            <CustomComponent />
          </div>
        ) : hasContent ? (
          <div className="space-y-4 pb-10">
            {noteConfig.highlights.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {item.tag && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 text-xs font-bold">
                      {item.tag}
                    </span>
                  )}
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h2>
                </div>
                {item.brief && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.brief}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-dashed border-slate-300 dark:border-slate-800 p-8 sm:p-12 text-center space-y-4 shadow-sm max-w-2xl mx-auto my-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/60 flex items-center justify-center text-2xl mx-auto">
              📌
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              Bài {lessonId} hiện chưa có mục kiến thức cần nhớ nào
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Khung trang riêng cho <strong className="text-slate-700 dark:text-slate-200">Bài {lessonId}</strong> đã sẵn sàng. Khi cần thêm bảng chia thể, sơ đồ ngữ pháp, mẹo phân biệt hoặc lưu ý đặc biệt cho bài này, bạn chỉ cần mô tả nội dung để hệ thống gắn trực tiếp vào đây.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href={`/notes?level=${noteConfig.level}`}
                prefetch
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-colors"
              >
                ← Quay về Trang tổng kết
              </Link>
              <Link
                href={`/lessons/${lessonId}`}
                prefetch
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors"
              >
                📚 Đi tới học Bài {lessonId} ➔
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

