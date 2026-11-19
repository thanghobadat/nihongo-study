'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * Tương thích ngược cho các đường dẫn cũ /notes/[lessonId]
 * Điều hướng tự động về đúng Phần & Mục trên /notes
 */
export default function LessonNoteRedirectPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const raw = Array.isArray(params?.lessonId) ? params.lessonId[0] : params?.lessonId;
    const id = Number(raw);

    if (id === 1) {
      router.replace('/notes?tab=numbers&sub=lesson1');
    } else if (id === 3) {
      router.replace('/notes?tab=numbers&sub=lesson3');
    } else if (id === 5) {
      router.replace('/notes?tab=numbers&sub=lesson5');
    } else if (id === 4) {
      router.replace('/notes?tab=tenses');
    } else if (id === 6) {
      router.replace('/notes?tab=forms');
    } else {
      router.replace('/notes');
    }
  }, [params, router]);

  return null;
}
