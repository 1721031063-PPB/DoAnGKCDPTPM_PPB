// Service Worker for SKYCAST AI Push Notifications
self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'SKYCAST AI';
  const options = {
    body: data.body || 'Cập nhật thời tiết mới',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    tag: 'weather-alert',
    requireInteraction: data.urgent || false,
    data: { url: data.url || '/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
