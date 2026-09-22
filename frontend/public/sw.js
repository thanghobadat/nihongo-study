// Nihongo Flow Service Worker for Web Push Notifications (iPhone iOS 16.4+ and Desktop)

self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Nihongo Flow', body: event.data.text() };
    }
  }

  const title = data.title || '🇯🇵 Nihongo Flow - Nhắc nhở học tập';
  const options = {
    body: data.body || 'Đã đến giờ hoàn thành bài học tiếng Nhật hôm nay!',
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/dashboard'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) 
    ? event.notification.data.url 
    : '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
