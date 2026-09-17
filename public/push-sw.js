// Web Push service worker for the admin portal (Android/Chrome — see src/core/push). Scoped to
// "/" but only ever registered from within /admin, and only received pushes are new-order
// notifications, so it deliberately does nothing else (no caching/offline support — that's a
// separate concern this file isn't trying to solve).
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  const { title, body, url } = payload;
  event.waitUntil(
    self.registration.showNotification(title || 'New order received', {
      body: body || '',
      icon: '/favicon.ico',
      data: { url: url || '/admin/orders' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/admin/orders';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    }),
  );
});
