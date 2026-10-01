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
