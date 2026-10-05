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

/**
 * Đánh giá mức độ nỗ lực học tập theo số giây học trong ngày
 * @param {number} seconds
 */
function evaluateStudyTime(seconds) {
  const sec = Math.max(0, parseInt(seconds, 10) || 0);
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

/**
 * Lấy lịch sử thời gian học theo từng ngày kèm đánh giá nỗ lực và thống kê tổng quan
 * @param {string} userId
 */
function getStudyTimeHistory(userId) {
  if (!userId) {
    return {
      history: [],
      summary: {
        totalSeconds: 0,
        totalHours: 0,
        totalHoursFormatted: '0 giờ',
        activeDays: 0,
        averageHoursPerActiveDay: 0,
        recordDay: null,
        standardDays: 0,
        standardRate: 0
      }
    };
  }

  const userMap = getUserStudyTimeMap(userId);
  const dates = Object.keys(userMap).sort((a, b) => b.localeCompare(a)); // Mới nhất lên đầu

  let totalSeconds = 0;
  let activeDays = 0;
  let standardDays = 0;
  let recordSeconds = 0;
  let recordDate = null;

  const history = dates.map(dateStr => {
    const sec = userMap[dateStr] || 0;
    const hours = Number((sec / 3600).toFixed(1));
    totalSeconds += sec;

    if (sec > 0) {
      activeDays++;
      if (sec >= 3600) standardDays++;
      if (sec > recordSeconds) {
        recordSeconds = sec;
        recordDate = dateStr;
      }
    }

    const evaluation = evaluateStudyTime(sec);
    // Mục tiêu khuyến nghị: 1.5 giờ = 5400 giây
    const targetSeconds = 5400;
    const progressPct = Math.min(100, Math.round((sec / targetSeconds) * 100));

    return {
      date: dateStr,
      totalSeconds: sec,
      hours,
      formatted: formatStudyTime(sec),
      hoursLabel: `${hours} giờ`,
      progressPct,
      evaluation
    };
  });

  const totalHours = Number((totalSeconds / 3600).toFixed(1));
  const averageHoursPerActiveDay = activeDays > 0 ? Number((totalHours / activeDays).toFixed(1)) : 0;
  const standardRate = activeDays > 0 ? Math.round((standardDays / activeDays) * 100) : 0;

  return {
    history,
    summary: {
      totalSeconds,
      totalHours,
      totalHoursFormatted: formatStudyTime(totalSeconds),
      activeDays,
      averageHoursPerActiveDay,
      recordDay: recordDate ? {
        date: recordDate,
        seconds: recordSeconds,
        hours: Number((recordSeconds / 3600).toFixed(1)),
        formatted: formatStudyTime(recordSeconds)
      } : null,
      standardDays,
      standardRate
    }
  };
}

module.exports = {
  addStudyTime,
  getStudyTime,
  getUserStudyTimeMap,
  formatStudyTime,
  evaluateStudyTime,
  getStudyTimeHistory,
  syncFromSupabase
};
