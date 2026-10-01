const fs = require('fs');
const path = require('path');
const supabase = require('../db/supabase');
const { getVietnamDateStr } = require('../utils/vietnamTime');

const DB_PATH = path.resolve(__dirname, '../db/user_study_time.json');

function isSupabaseConfigured() {
  return (
    process.env.SUPABASE_URL &&
    !process.env.SUPABASE_URL.includes('placeholder') &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
  );
}

function loadStudyTime() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(content) || {};
    }
  } catch (err) {
    console.warn('[studyTimeService] Error reading database:', err.message);
  }
  return {};
}

function saveStudyTime(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[studyTimeService] Error saving database:', err.message);
  }
}

/**
 * Định dạng số giây học thực tế sang chuỗi tiếng Việt dễ đọc
 * @param {number} totalSeconds 
 * @returns {string} ví dụ: "45 phút", "1 giờ 15 phút", "Dưới 1 phút", "0 phút"
 */
function formatStudyTime(totalSeconds) {
  const sec = Math.max(0, parseInt(totalSeconds, 10) || 0);
  if (sec === 0) return '0 phút';
  if (sec < 60) return 'Dưới 1 phút';

  const mins = Math.floor(sec / 60);
  if (mins < 60) return `${mins} phút`;

  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (remMins === 0) return `${hours} giờ`;
  return `${hours} giờ ${remMins} phút`;
}

/**
 * Cộng dồn thời gian học thực tế (Delta Increment Sync)
 * Đảm bảo đồng bộ an toàn từ nhiều thiết bị (Laptop, iPhone, v.v.)
 */
async function addStudyTime(userId, dateStr, deltaSeconds) {
  if (!userId) throw new Error('userId is required');

  const validDate = dateStr || getVietnamDateStr();
  const delta = Math.min(Math.max(1, parseInt(deltaSeconds, 10) || 0), 600); // Tối đa 10 phút mỗi lần gửi delta

  const data = loadStudyTime();
  if (!data[userId]) data[userId] = {};

  const current = data[userId][validDate] || 0;
  const newTotal = current + delta;
  data[userId][validDate] = newTotal;

  saveStudyTime(data);

  // Cố gắng đồng bộ lên Supabase nếu có cấu hình
  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('user_study_time')
        .upsert(
          {
            user_id: userId,
            date: validDate,
            total_seconds: newTotal,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id,date' }
        );
    } catch (e) {
      // Supabase table có thể chưa tạo, fallback dùng JSON cục bộ an toàn
    }
  }

  return {
    date: validDate,
    totalSeconds: newTotal,
    formatted: formatStudyTime(newTotal)
  };
}

/**
 * Lấy tổng thời gian học của người dùng trong một ngày cụ thể
 */
function getStudyTime(userId, dateStr) {
  if (!userId) return { totalSeconds: 0, formatted: '0 phút' };
  const validDate = dateStr || getVietnamDateStr();
  const data = loadStudyTime();
  const userTimes = data[userId] || {};
  const totalSeconds = userTimes[validDate] || 0;
  return {
    date: validDate,
    totalSeconds,
    formatted: formatStudyTime(totalSeconds)
  };
}

/**
 * Lấy toàn bộ bản đồ thời gian học của người dùng ({ [dateStr]: seconds })
 */
function getUserStudyTimeMap(userId) {
  if (!userId) return {};
  const data = loadStudyTime();
  return data[userId] || {};
}

/**
 * Đồng bộ dữ liệu từ Supabase về (khi server khởi động hoặc user đăng nhập)
 */
async function syncFromSupabase(userId) {
  if (!isSupabaseConfigured() || !userId) return;
  try {
    const { data: rows, error } = await supabase
      .from('user_study_time')
      .select('date, total_seconds')
      .eq('user_id', userId);

    if (!error && Array.isArray(rows)) {
      const data = loadStudyTime();
      if (!data[userId]) data[userId] = {};
      let changed = false;

      for (const row of rows) {
        const current = data[userId][row.date] || 0;
        if (row.total_seconds > current) {
          data[userId][row.date] = row.total_seconds;
          changed = true;
        }
      }

      if (changed) {
        saveStudyTime(data);
      }
    }
  } catch (e) {
    // Graceful fallback
  }
}

module.exports = {
  addStudyTime,
  getStudyTime,
  getUserStudyTimeMap,
  formatStudyTime,
  syncFromSupabase
};
