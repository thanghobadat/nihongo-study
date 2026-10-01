/**
 * Utility module for Vietnam Timezone (Asia/Ho_Chi_Minh - GMT+7)
 * Ensures consistency across local dev and Render/Cloud deployments.
 */

/**
 * Format a Date object or timestamp into YYYY-MM-DD in Asia/Ho_Chi_Minh timezone
 * @param {Date|string|number} d 
 * @returns {string} e.g. "2026-10-01"
 */
function getVietnamDateStr(d = new Date()) {
  const dateObj = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  }
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj);
}

/**
 * Format time into HH:mm in Asia/Ho_Chi_Minh timezone
 * @param {Date|string|number} d 
 * @returns {string} e.g. "09:30"
 */
function getVietnamTimeStr(d = new Date()) {
  const dateObj = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(dateObj);
}

/**
 * Get detailed time parts in Asia/Ho_Chi_Minh timezone
 * @param {Date|string|number} d 
 * @returns {{ todayStr: string, curHours: number, curMins: number, nowTotalMins: number, year: string, month: string, day: string }}
 */
function getVietnamTimeParts(d = new Date()) {
  const dateObj = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(dateObj);
  const map = {};
  parts.forEach(p => { map[p.type] = p.value; });
  const todayStr = `${map.year}-${map.month}-${map.day}`;
  const curHours = parseInt(map.hour, 10);
  const curMins = parseInt(map.minute, 10);
  const nowTotalMins = curHours * 60 + curMins;
  return {
    todayStr,
    curHours,
    curMins,
    nowTotalMins,
    year: map.year,
    month: map.month,
    day: map.day
  };
}

/**
 * Add or subtract days from a YYYY-MM-DD date string safely in Vietnam context
 * @param {string} dateStr 
 * @param {number} days 
 * @returns {string} YYYY-MM-DD
 */
function addVietnamDays(dateStr, days) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    dateStr = getVietnamDateStr();
  }
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return getVietnamDateStr(date);
}

/**
 * Get yesterday's date string YYYY-MM-DD in Vietnam timezone
 * @returns {string}
 */
function getYesterdayVietnamDateStr() {
  const todayStr = getVietnamDateStr();
  return addVietnamDays(todayStr, -1);
}

/**
 * Get tomorrow's date string YYYY-MM-DD in Vietnam timezone
 * @returns {string}
 */
function getTomorrowVietnamDateStr() {
  const todayStr = getVietnamDateStr();
  return addVietnamDays(todayStr, 1);
}

module.exports = {
  getVietnamDateStr,
  getVietnamTimeStr,
  getVietnamTimeParts,
  addVietnamDays,
  getYesterdayVietnamDateStr,
  getTomorrowVietnamDateStr
};
