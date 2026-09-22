const webpush = require('web-push');
const fs = require('fs');
const path = require('path');
const mockDb = require('../db/mockDb');

const VAPID_FILE = path.join(__dirname, '../../vapid_keys.json');

// Ensure subscriptions store exists on mockDb
if (!mockDb.pushSubscriptions) {
  mockDb.pushSubscriptions = {};
}

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

  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@nihongoflow.local';
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
  return mockDb.pushSubscriptions[userId];
}

function getSubscription(userId) {
  if (!mockDb.pushSubscriptions) return null;
  return mockDb.pushSubscriptions[userId] || null;
}

async function sendNotification(userId, payload) {
  const userSub = getSubscription(userId);
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

module.exports = {
  getVapidPublicKey,
  saveSubscription,
  getSubscription,
  sendNotification,
  sendTestNotification
};
