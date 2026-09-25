const webpush = require('web-push');
const fs = require('fs');
const path = require('path');
const mockDb = require('../db/mockDb');
const supabase = require('../db/supabase');

const VAPID_FILE = path.join(__dirname, '../../vapid_keys.json');
const SUBSCRIPTIONS_FILE = path.join(__dirname, '../db/push_subscriptions.json');

function isSupabaseConfigured() {
  return (
    process.env.SUPABASE_URL &&
    !process.env.SUPABASE_URL.includes('placeholder') &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
  );
}

function loadPersistentSubscriptions() {
  try {
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8'));
      return data || {};
    }
  } catch (e) {
    console.error('[PushNotification] Error reading push_subscriptions.json:', e.message);
  }
  return {};
}

function savePersistentSubscriptions(subs) {
  try {
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2), 'utf8');
  } catch (e) {
    console.error('[PushNotification] Error writing push_subscriptions.json:', e.message);
  }
}

// Ensure subscriptions store exists on mockDb and initialize from persistent disk storage
if (!mockDb.pushSubscriptions) {
  mockDb.pushSubscriptions = {};
}
try {
  const loadedSubs = loadPersistentSubscriptions();
  mockDb.pushSubscriptions = { ...loadedSubs, ...mockDb.pushSubscriptions };
} catch (e) {}

/**
 * Synchronize subscriptions from Supabase into memory & local disk cache
 */
async function syncSubscriptionsFromSupabase() {
  if (!isSupabaseConfigured()) return;
  try {
    const { data, error } = await supabase.from('user_push_subscriptions').select('*');
    if (error) {
      console.warn('[PushNotification] Could not query user_push_subscriptions from Supabase:', error.message);
      return;
    }
    if (Array.isArray(data) && data.length > 0) {
      if (!mockDb.pushSubscriptions) mockDb.pushSubscriptions = {};
      for (const row of data) {
        if (row.user_id && row.subscription) {
          mockDb.pushSubscriptions[row.user_id] = {
            subscription: row.subscription,
            deviceName: row.device_name || 'iPhone / Mobile',
            updatedAt: row.updated_at || new Date().toISOString()
          };
        }
      }
      savePersistentSubscriptions(mockDb.pushSubscriptions);
      console.log(`[PushNotification] Successfully synced ${data.length} push subscription(s) from Supabase.`);
    }
  } catch (err) {
    console.warn('[PushNotification] Error syncing subscriptions from Supabase:', err.message);
  }
}

// Auto-sync on startup
syncSubscriptionsFromSupabase().catch(() => {});


let vapidKeys = null;

function initVapidKeys() {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    vapidKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY
    };
  } else if (fs.existsSync(VAPID_FILE)) {
    try {
      vapidKeys = JSON.parse(fs.readFileSync(VAPID_FILE, 'utf8'));
    } catch (e) {
      console.warn('[PushNotification] Error reading vapid_keys.json, generating new keys:', e.message);
    }
  }

  if (!vapidKeys || !vapidKeys.publicKey || !vapidKeys.privateKey) {
    vapidKeys = webpush.generateVAPIDKeys();
    try {
      fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys, null, 2), 'utf8');
      console.log('[PushNotification] Generated new VAPID keys and saved to vapid_keys.json');
    } catch (e) {
      console.warn('[PushNotification] Could not persist vapid_keys.json:', e.message);
    }
  }

  const subject = process.env.VAPID_SUBJECT || 'mailto:hoangthanh01022000@gmail.com';
  webpush.setVapidDetails(subject, vapidKeys.publicKey, vapidKeys.privateKey);
  console.log('[PushNotification] WebPush VAPID configured successfully');
}

// Initialize on module load
try {
  initVapidKeys();
} catch (e) {
  console.error('[PushNotification] Failed to initialize VAPID:', e.message);
}

function getVapidPublicKey() {
  return vapidKeys ? vapidKeys.publicKey : '';
}

function saveSubscription(userId, subscription, deviceName = 'iPhone / Mobile') {
  if (!mockDb.pushSubscriptions) {
    mockDb.pushSubscriptions = {};
  }
  mockDb.pushSubscriptions[userId] = {
    subscription,
    deviceName,
    updatedAt: new Date().toISOString()
  };
  savePersistentSubscriptions(mockDb.pushSubscriptions);

  // Database-first: Persist to Supabase so tokens survive container restarts
  if (isSupabaseConfigured()) {
    supabase.from('user_push_subscriptions').upsert({
      user_id: String(userId),
      subscription: subscription,
      device_name: deviceName,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' }).then(({ error }) => {
      if (error) console.warn('[PushNotification] Supabase subscription upsert warning:', error.message);
    }).catch(e => console.warn('[PushNotification] Supabase subscription upsert error:', e.message));
  }

  return mockDb.pushSubscriptions[userId];
}

function getSubscription(userId) {
  if (!mockDb.pushSubscriptions || !mockDb.pushSubscriptions[userId]) {
    const loaded = loadPersistentSubscriptions();
    if (loaded && loaded[userId]) {
      if (!mockDb.pushSubscriptions) mockDb.pushSubscriptions = {};
      mockDb.pushSubscriptions[userId] = loaded[userId];
    }
  }
  return mockDb.pushSubscriptions ? (mockDb.pushSubscriptions[userId] || null) : null;
}

function getSubscriptionStatus(userId) {
  const userSub = getSubscription(userId);
  if (!userSub || !userSub.subscription) {
    return {
      hasSubscription: false,
      deviceName: null,
      updatedAt: null
    };
  }
  return {
    hasSubscription: true,
    deviceName: userSub.deviceName || 'iPhone / Mobile',
    updatedAt: userSub.updatedAt || null
  };
}

async function getSubscriptionStatusAsync(userId) {
  let userSub = getSubscription(userId);
  if ((!userSub || !userSub.subscription) && isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('user_push_subscriptions').select('*').eq('user_id', String(userId)).maybeSingle();
      if (data && data.subscription) {
        if (!mockDb.pushSubscriptions) mockDb.pushSubscriptions = {};
        mockDb.pushSubscriptions[userId] = {
          subscription: data.subscription,
          deviceName: data.device_name || 'iPhone / Mobile',
          updatedAt: data.updated_at || new Date().toISOString()
        };
        savePersistentSubscriptions(mockDb.pushSubscriptions);
        userSub = mockDb.pushSubscriptions[userId];
      }
    } catch (e) {}
  }
  if (!userSub || !userSub.subscription) {
    const allSubs = mockDb.pushSubscriptions || loadPersistentSubscriptions();
    const subKeys = Object.keys(allSubs);
    if (subKeys.length === 1 && allSubs[subKeys[0]]?.subscription) {
      userSub = allSubs[subKeys[0]];
    } else if (userId !== 'demo_user' && allSubs['demo_user']?.subscription) {
      userSub = allSubs['demo_user'];
    }
  }

  if (!userSub || !userSub.subscription) {
    return {
      hasSubscription: false,
      deviceName: null,
      updatedAt: null
    };
  }
  return {
    hasSubscription: true,
    deviceName: userSub.deviceName || 'iPhone / Mobile',
    updatedAt: userSub.updatedAt || null
  };
}

async function sendNotification(userId, payload) {
  let userSub = getSubscription(userId);
  // If not found in cache, attempt one synchronous-like fetch from Supabase if online
  if ((!userSub || !userSub.subscription) && isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('user_push_subscriptions').select('*').eq('user_id', String(userId)).maybeSingle();
      if (data && data.subscription) {
        if (!mockDb.pushSubscriptions) mockDb.pushSubscriptions = {};
        mockDb.pushSubscriptions[userId] = {
          subscription: data.subscription,
          deviceName: data.device_name || 'iPhone / Mobile',
          updatedAt: data.updated_at || new Date().toISOString()
        };
        savePersistentSubscriptions(mockDb.pushSubscriptions);
        userSub = mockDb.pushSubscriptions[userId];
      }
    } catch (e) {}
  }

  // Fallback: If not found for current userId, check demo_user or single active device on system
  if (!userSub || !userSub.subscription) {
    const allSubs = mockDb.pushSubscriptions || loadPersistentSubscriptions();
    const subKeys = Object.keys(allSubs);
    if (subKeys.length === 1 && allSubs[subKeys[0]]?.subscription) {
      console.log(`[PushNotification] Fallback using single active device subscription (${subKeys[0]}) for ${userId}`);
      userSub = allSubs[subKeys[0]];
    } else if (userId !== 'demo_user' && allSubs['demo_user']?.subscription) {
      userSub = allSubs['demo_user'];
    }
  }

  if (!userSub || !userSub.subscription) {
    throw new Error('Chưa tìm thấy thiết bị đăng ký nhận thông báo cho tài khoản này.');
  }

  const stringPayload = typeof payload === 'string' ? payload : JSON.stringify({
    title: payload.title || 'Nihongo Flow',
    body: payload.body || 'Đã đến giờ học tiếng Nhật hôm nay!',
    icon: payload.icon || '/favicon.ico',
    badge: payload.badge || '/favicon.ico',
    url: payload.url || '/dashboard',
    data: payload.data || {}
  });

  try {
    const res = await webpush.sendNotification(userSub.subscription, stringPayload);
    return { success: true, statusCode: res.statusCode };
  } catch (err) {
    console.error(`[PushNotification] Error sending push to user ${userId}:`, err.message);
    // If subscription is expired/unsubscribed (410 or 404), clean it up
    if (err.statusCode === 404 || err.statusCode === 410) {
      delete mockDb.pushSubscriptions[userId];
      savePersistentSubscriptions(mockDb.pushSubscriptions);
      if (isSupabaseConfigured()) {
        supabase.from('user_push_subscriptions').delete().eq('user_id', String(userId)).catch(() => {});
      }
    }
    throw err;
  }
}

async function sendTestNotification(userId) {
  return sendNotification(userId, {
    title: '🇯🇵 Nihongo Flow - Thông báo nhắc học',
    body: 'Ting ting! Kết nối thành công với iPhone của bạn. Bạn sẽ nhận được thông báo nhắc bài học đúng giờ deadline!',
    url: '/dashboard'
  });
}

function getTaskDisplayName(task) {
  if (!task) return 'Nhiệm vụ học tập';
  const batchLabel = task.batchIndex ? `Đợt ${task.batchIndex}: ` : '';
  const count = task.targetCount || 1;
  const lesson = task.lesson ? ` Bài ${task.lesson}` : '';
  if (task.itemType === 'vocabulary') return `${batchLabel}${count} từ vựng${lesson}`;
  if (task.itemType === 'kanji') return `${batchLabel}${count} chữ Kanji${lesson}`;
  if (task.itemType === 'grammar') return `${batchLabel}${count} mẫu ngữ pháp${lesson}`;
  if (task.itemType === 'single_review') return `${batchLabel}Ôn tập tổng hợp${lesson}`;
  if (task.itemType === 'cumulative_review') return `${batchLabel}Ôn tập lũy tích${lesson}`;
  return `${batchLabel}${task.title || 'Nhiệm vụ học tập'}`;
}

function formatTasksDetailed(tasks = []) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return 'Không có nhiệm vụ mới';
  }
  return tasks.map(t => {
    const name = getTaskDisplayName(t);
    const due = t.due_time ? ` (hạn ${t.due_time})` : '';
    return `${name}${due}`;
  }).join(', ');
}

function formatDebtDetailed(debtItems = []) {
  if (!Array.isArray(debtItems) || debtItems.length === 0) {
    return '';
  }
  const parts = [];
  const vocabDebt = debtItems.filter(i => i.type === 'vocabulary');
  const kanjiDebt = debtItems.filter(i => i.type === 'kanji');
  const grammarDebt = debtItems.filter(i => i.type === 'grammar');
  const reviewDebt = debtItems.filter(i => i.type === 'single_review' || i.type === 'cumulative_review');

  if (vocabDebt.length > 0) {
    const count = vocabDebt.reduce((s, i) => s + (i.count || 1), 0);
    parts.push(`${count} từ vựng`);
  }
  if (kanjiDebt.length > 0) {
    const count = kanjiDebt.reduce((s, i) => s + (i.count || 1), 0);
    parts.push(`${count} chữ Kanji`);
  }
  if (grammarDebt.length > 0) {
    const count = grammarDebt.reduce((s, i) => s + (i.count || 1), 0);
    parts.push(`${count} mẫu ngữ pháp`);
  }
  if (reviewDebt.length > 0) {
    parts.push(`${reviewDebt.length} bài ôn tập`);
  }
  return parts.length > 0 ? parts.join(', ') : `${debtItems.length} mục`;
}

async function safeDispatchNotification(userId, payload) {
  if (typeof module.exports.sendNotification === 'function') {
    return module.exports.sendNotification(userId, payload);
  }
  return sendNotification(userId, payload);
}

// 1. Kịch bản 1: Thông báo qua ngày mới
async function sendNewDayNotification(userId, { yesterdayDebtItems = [], todayTasks = [] } = {}) {
  const hasDebt = Array.isArray(yesterdayDebtItems) && yesterdayDebtItems.length > 0;
  const tasksStr = formatTasksDetailed(todayTasks);

  let title = '🌅 Chào ngày mới - Nihongo Flow';
  let body = '';

  if (hasDebt) {
    const debtStr = formatDebtDetailed(yesterdayDebtItems);
    body = `Hôm qua bạn còn tồn đọng: ${debtStr}. Nhiệm vụ hôm nay: ${tasksStr}. Cùng bứt phá nhé!`;
  } else {
    body = `Nhiệm vụ hôm nay của bạn: ${tasksStr}. Chúc bạn học tập hiệu quả!`;
  }

  return safeDispatchNotification(userId, {
    title,
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    url: '/dashboard',
    data: { scenario: 'new_day', hasDebt, timestamp: Date.now() }
  });
}

// 2. Kịch bản 2: Thông báo sau khi Replan bài nợ
async function sendDebtReplanNotification(userId, { debtCount = 0, todayTasks = [] } = {}) {
  const tasksStr = formatTasksDetailed(todayTasks);
  const title = '🔄 Đã điều chỉnh kế hoạch học tập';
  const body = `Do có bài học còn tồn đọng hôm qua, hệ thống đã điều chỉnh kế hoạch để bù đắp tiến độ. Kế hoạch mới hôm nay: ${tasksStr}. Bắt đầu học ngay nhé!`;

  return safeDispatchNotification(userId, {
    title,
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    url: '/dashboard',
    data: { scenario: 'debt_replan', debtCount, timestamp: Date.now() }
  });
}

// 3. Kịch bản 3: Replan tổng khi thay đổi Ngày bắt đầu / Ngày kết thúc
async function sendTimelineReplanNotification(userId, { startDate, endDate, todayTasks = [] } = {}) {
  const tasksStr = formatTasksDetailed(todayTasks);
  const timeRangeStr = (startDate && endDate) ? ` (${startDate} ➔ ${endDate})` : '';
  const title = '📅 Lộ trình học tập đã được cập nhật';
  const body = `Lộ trình học đã được cập nhật${timeRangeStr}. Kế hoạch mới hôm nay: ${tasksStr}. Cố gắng bám sát mục tiêu nhé!`;

  return safeDispatchNotification(userId, {
    title,
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    url: '/dashboard',
    data: { scenario: 'timeline_replan', startDate, endDate, timestamp: Date.now() }
  });
}

// 4. Kịch bản 4: Nhắc nhở khi quá hạn trong ngày
async function sendOverdueReminderNotification(userId, { task } = {}) {
  const taskName = getTaskDisplayName(task);
  const due = task?.due_time || 'hạn chót';
  const title = '⏰ Nhắc nhở quá hạn bài học!';
  const body = `Đã quá giờ (${due}) nhưng bạn chưa hoàn thành: ${taskName}. Hãy dành vài phút học ngay để không bị dồn bài nhé!`;

  return safeDispatchNotification(userId, {
    title,
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    url: '/dashboard',
    data: { scenario: 'overdue_reminder', taskId: task?.id, timestamp: Date.now() }
  });
}

// 5. Kịch bản 5: Thông báo hoàn thành task trong ngày
async function sendTaskCompletedNotification(userId, { completedTask, isAllDoneToday = false, completedCount = 0, totalCount = 0 } = {}) {
  const taskName = getTaskDisplayName(completedTask);
  let title = '';
  let body = '';

  if (isAllDoneToday) {
    title = '🎉 Xuất sắc! Hoàn thành mục tiêu hôm nay!';
    body = `Tuyệt vời! Bạn đã hoàn thành toàn bộ ${totalCount}/${totalCount} nhiệm vụ của ngày hôm nay. Hãy nghỉ ngơi và sẵn sàng cho ngày mai!`;
  } else {
    title = '✅ Đã hoàn thành nhiệm vụ!';
    body = `Chúc mừng bạn đã hoàn thành: ${taskName}! (Đã hoàn thành ${completedCount}/${totalCount} nhiệm vụ hôm nay). Tiếp tục phát huy nhé!`;
  }

  return safeDispatchNotification(userId, {
    title,
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    url: '/dashboard',
    data: { scenario: 'task_completed', isAllDoneToday, taskId: completedTask?.id, timestamp: Date.now() }
  });
}

// 6. Kịch bản 6 (Mở rộng): Nhắc trước giờ Deadline 15-30 phút
async function sendPreDueReminderNotification(userId, { task, minutesLeft = 30 } = {}) {
  const taskName = getTaskDisplayName(task);
  const due = task?.due_time || 'hạn chót';
  const title = '⏳ Sắp đến giờ hạn chót bài học!';
  const body = `Còn ${minutesLeft} phút nữa là đến hạn ${due} cho nhiệm vụ: ${taskName}. Tranh thủ mở app hoàn thành nhé!`;

  return safeDispatchNotification(userId, {
    title,
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    url: '/dashboard',
    data: { scenario: 'pre_due_reminder', taskId: task?.id, timestamp: Date.now() }
  });
}

// 7. Kịch bản 7 (Mở rộng): Cảnh báo nguy cơ đứt chuỗi Streak buổi tối
async function sendStreakAlertNotification(userId, { currentStreak = 1, remainingTasksCount = 1 } = {}) {
  const title = '🔥 Cảnh báo: Nguy cơ đứt chuỗi học tập!';
  const body = `Bạn đang giữ chuỗi ${currentStreak} ngày học liên tiếp! Chỉ còn vài tiếng trước nửa đêm, hãy dành 10 phút hoàn thành ${remainingTasksCount} nhiệm vụ hôm nay để giữ chuỗi nhé!`;

  return safeDispatchNotification(userId, {
    title,
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    url: '/dashboard',
    data: { scenario: 'streak_alert', currentStreak, timestamp: Date.now() }
  });
}

// 8. Kịch bản 8 (Mở rộng): Vinh danh Cột mốc chặng
async function sendMilestoneNotification(userId, { milestoneTitle, milestoneMessage } = {}) {
  const title = milestoneTitle || '🏆 Chúc mừng cột mốc quan trọng!';
  const body = milestoneMessage || 'Chúc mừng bạn đã hoàn thành xuất sắc cột mốc lộ trình! Tiếp tục bứt phá cùng Nihongo Flow!';

  return safeDispatchNotification(userId, {
    title,
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    url: '/dashboard',
    data: { scenario: 'milestone_achievement', timestamp: Date.now() }
  });
}

// Generic summary notification backward compatibility
async function sendStudyPlanNotification(userId, todayTasks = [], planSummary = {}) {
  const activeTasks = Array.isArray(todayTasks) ? todayTasks : [];
  const incompleteTasks = activeTasks.filter(t => !t.completed);
  
  let title = '🇯🇵 Nihongo Flow - Kế hoạch học tập hôm nay';
  let body = '';

  if (activeTasks.length === 0) {
    body = 'Hôm nay bạn không có nhiệm vụ mới trong kế hoạch. Hãy tranh thủ ôn tập lại kiến thức nhé!';
  } else if (incompleteTasks.length === 0) {
    title = '🎉 Chúc mừng! Bạn đã hoàn thành bài hôm nay';
    body = `Tuyệt vời! Bạn đã hoàn tất toàn bộ ${activeTasks.length} nhiệm vụ của ngày hôm nay. Tiếp tục phát huy nhé!`;
  } else {
    const tasksStr = formatTasksDetailed(incompleteTasks);
    title = `🎯 Kế hoạch hôm nay (${incompleteTasks.length} nhiệm vụ)`;
    body = `Hôm nay cần học: ${tasksStr}. Cố lên nhé!`;
  }

  return sendNotification(userId, {
    title,
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    url: '/dashboard',
    data: {
      url: '/dashboard',
      timestamp: Date.now()
    }
  });
}

module.exports = {
  getVapidPublicKey,
  saveSubscription,
  getSubscription,
  getSubscriptionStatus,
  getSubscriptionStatusAsync,
  sendNotification,
  sendTestNotification,
  sendStudyPlanNotification,
  sendNewDayNotification,
  sendDebtReplanNotification,
  sendTimelineReplanNotification,
  sendOverdueReminderNotification,
  sendPreDueReminderNotification,
  sendTaskCompletedNotification,
  sendStreakAlertNotification,
  sendMilestoneNotification,
  getTaskDisplayName,
  formatTasksDetailed,
  formatDebtDetailed,
  syncSubscriptionsFromSupabase
};
