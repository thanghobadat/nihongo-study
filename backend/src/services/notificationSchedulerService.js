const fs = require('fs');
const path = require('path');
const pushNotificationService = require('./pushNotificationService');

const LOG_FILE = path.join(__dirname, '../db/notification_sent_log.json');
const STUDY_PLANS_FILE = path.join(__dirname, '../db/study_plans.json');
const SUBSCRIPTIONS_FILE = path.join(__dirname, '../db/push_subscriptions.json');

let schedulerTimer = null;

function loadSentLog() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')) || {};
    }
  } catch (e) {
    console.error('[NotificationScheduler] Error reading sent log:', e.message);
  }
  return {};
}

function saveSentLog(log) {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2), 'utf8');
  } catch (e) {
    console.error('[NotificationScheduler] Error writing sent log:', e.message);
  }
}

function loadJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8')) || {};
    }
  } catch (e) {
    console.error(`[NotificationScheduler] Error reading ${filePath}:`, e.message);
  }
  return {};
}

/**
 * Core periodic check running in background on the server
 */
async function checkAndSendNotifications() {
  const subscriptions = loadJsonFile(SUBSCRIPTIONS_FILE);
  const userIds = Object.keys(subscriptions);
  if (userIds.length === 0) return;

  const plans = loadJsonFile(STUDY_PLANS_FILE);
  const sentLog = loadSentLog();

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const curHours = now.getHours();
  const curMins = now.getMinutes();
  const curTimeStr = `${String(curHours).padStart(2, '0')}:${String(curMins).padStart(2, '0')}`;
  const nowTotalMins = curHours * 60 + curMins;

  // Clean up log entries older than 3 days
  const cutoffDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  let logChanged = false;
  for (const k of Object.keys(sentLog)) {
    const parts = k.split(':');
    if (parts.length >= 2 && parts[1] < cutoffDate) {
      delete sentLog[k];
      logChanged = true;
    }
  }

  for (const userId of userIds) {
    const userSub = subscriptions[userId];
    if (!userSub || !userSub.subscription) continue;

    const userPlan = plans[userId];
    if (!userPlan || !Array.isArray(userPlan.days)) continue;

    const todayDay = userPlan.days.find(d => d.date === todayStr);
    if (!todayDay || !Array.isArray(todayDay.tasks) || todayDay.tasks.length === 0) continue;

    const tasks = todayDay.tasks;
    const uncompletedTasks = tasks.filter(t => !t.completed);

    // 1. Morning Study Plan Notification (07:30 - 09:30)
    const morningKey = `${userId}:${todayStr}:morning`;
    if (!sentLog[morningKey] && nowTotalMins >= (7 * 60 + 30) && nowTotalMins <= (9 * 60 + 30)) {
      try {
        await pushNotificationService.sendNewDayNotification(userId, {
          date: todayStr,
          todayTasks: tasks
        });
        sentLog[morningKey] = new Date().toISOString();
        logChanged = true;
        console.log(`[NotificationScheduler] Sent morning briefing push to ${userId}`);
      } catch (err) {
        console.warn(`[NotificationScheduler] Failed morning push to ${userId}:`, err.message);
      }
    }

    // 2. Pre-due & Overdue alerts for tasks with due_time
    for (const t of uncompletedTasks) {
      if (!t.due_time) continue;
      const parts = t.due_time.split(':').map(Number);
      if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) continue;

      const dueTotalMins = parts[0] * 60 + parts[1];
      const diffMins = dueTotalMins - nowTotalMins;

      // 2a. Pre-due reminder (10 to 30 mins before deadline)
      const predueKey = `${userId}:${todayStr}:predue:${t.id}`;
      if (!sentLog[predueKey] && diffMins >= 10 && diffMins <= 30) {
        try {
          await pushNotificationService.sendPreDueReminderNotification(userId, {
            task: t,
            diffMins
          });
          sentLog[predueKey] = new Date().toISOString();
          logChanged = true;
          console.log(`[NotificationScheduler] Sent pre-due push for task ${t.id} to ${userId}`);
        } catch (err) {
          console.warn(`[NotificationScheduler] Failed pre-due push for task ${t.id}:`, err.message);
        }
      }

      // 2b. Overdue alert (10 to 45 mins after deadline)
      const overdueMins = nowTotalMins - dueTotalMins;
      const overdueKey = `${userId}:${todayStr}:overdue:${t.id}`;
      if (!sentLog[overdueKey] && overdueMins >= 10 && overdueMins <= 45) {
        try {
          await pushNotificationService.sendOverdueReminderNotification(userId, {
            task: t,
            overdueMins
          });
          sentLog[overdueKey] = new Date().toISOString();
          logChanged = true;
          console.log(`[NotificationScheduler] Sent overdue push for task ${t.id} to ${userId}`);
        } catch (err) {
          console.warn(`[NotificationScheduler] Failed overdue push for task ${t.id}:`, err.message);
        }
      }
    }

    // 3. Evening Streak Alert (20:30 - 22:00) if tasks remain uncompleted
    const streakKey = `${userId}:${todayStr}:streak`;
    if (!sentLog[streakKey] && uncompletedTasks.length > 0 && nowTotalMins >= (20 * 60 + 30) && nowTotalMins <= (22 * 60)) {
      try {
        await pushNotificationService.sendStreakAlertNotification(userId, {
          remainingTasks: uncompletedTasks
        });
        sentLog[streakKey] = new Date().toISOString();
        logChanged = true;
        console.log(`[NotificationScheduler] Sent streak alert push to ${userId}`);
      } catch (err) {
        console.warn(`[NotificationScheduler] Failed streak push to ${userId}:`, err.message);
      }
    }
  }

  if (logChanged) {
    saveSentLog(sentLog);
  }
}

function startNotificationScheduler(intervalMs = 60 * 1000) {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
  }
  console.log('[NotificationScheduler] Background push notification daemon started (runs every 60s)');
  // Run first check after 3 seconds
  setTimeout(() => {
    checkAndSendNotifications().catch(e => console.error('[NotificationScheduler] Run error:', e.message));
  }, 3000);

  schedulerTimer = setInterval(() => {
    checkAndSendNotifications().catch(e => console.error('[NotificationScheduler] Run error:', e.message));
  }, intervalMs);
}

function stopNotificationScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    console.log('[NotificationScheduler] Background push notification daemon stopped');
  }
}

module.exports = {
  checkAndSendNotifications,
  startNotificationScheduler,
  stopNotificationScheduler
};
