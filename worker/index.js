self.addEventListener('push', (event) => {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    const data = event.data?.json() ?? {};
    const title = data.title || 'I left it';
    const body = data.body || 'Do you extend open time for your data?';
    const icon = data.icon || '/apple-touch-icon.png';
    const actions = data.actions;

    event.waitUntil(
        registration.showNotification(title, {
            body,
            icon,
            actions,
        })
    )
});

self.addEventListener('notificationclick', function (ev) {
    ev.notification.close();
    clients.openWindow('/');
});
