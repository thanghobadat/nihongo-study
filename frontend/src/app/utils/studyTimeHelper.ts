/**
 * Helper định dạng thời gian học thực tế & chuẩn hóa Múi giờ Việt Nam (GMT+7)
 */

export function getVietnamDateString(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date());
  } catch {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}

export function formatStudyTime(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds || 0));
  if (sec === 0) return '0 phút';
  if (sec < 60) return 'Dưới 1 phút';

  const mins = Math.floor(sec / 60);
  if (mins < 60) return `${mins} phút`;

  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (remMins === 0) return `${hours} giờ`;
  return `${hours} giờ ${remMins} phút`;
}

export function formatStudyTimeShort(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds || 0));
  if (sec === 0) return '0m';
  if (sec < 60) return '<1m';

  const mins = Math.floor(sec / 60);
  if (mins < 60) return `${mins}m`;

  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (remMins === 0) return `${hours}h`;
  return `${hours}h${remMins}m`;
}

export function formatStudyHours(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = (sec / 3600).toFixed(1);
  return `${hours} giờ`;
}

export interface StudyTimeEvaluation {
  level: 'excellent' | 'standard' | 'moderate' | 'starter' | 'none';
  label: string;
  badge: string;
  color: string;
  score: number;
  comment: string;
}

export function evaluateStudyTime(totalSeconds: number): StudyTimeEvaluation {
  const sec = Math.max(0, Math.floor(totalSeconds || 0));
  if (sec >= 7200) {
    return {
      level: 'excellent',
      label: 'Xuất sắc (≥ 2h)',
      badge: '🔥',
      color: 'emerald',
      score: 100,
      comment: 'Nỗ lực học tập phi thường, vượt chỉ tiêu ngày!'
    };
  }
  if (sec >= 3600) {
    return {
      level: 'standard',
      label: 'Đạt chuẩn (1h - 2h)',
      badge: '🟢',
      color: 'teal',
      score: 80,
      comment: 'Đạt thời lượng khuyến nghị lý tưởng cho kỳ thi JLPT.'
    };
  }
  if (sec >= 1800) {
    return {
      level: 'moderate',
      label: 'Duy trì (30p - 1h)',
      badge: '🟡',
      color: 'amber',
      score: 60,
      comment: 'Giữ vững nhịp độ và thói quen học tập hàng ngày.'
    };
  }
  if (sec > 0) {
    return {
      level: 'starter',
      label: 'Khởi động (< 30p)',
      badge: '⚡',
      color: 'cyan',
      score: 30,
      comment: 'Đã có nỗ lực khởi động, hãy tăng tốc học thêm nhé!'
    };
  }
  return {
    level: 'none',
    label: 'Chưa học (0h)',
    badge: '💤',
    color: 'slate',
    score: 0,
    comment: 'Chưa ghi nhận thời gian học trong ngày.'
  };
}
