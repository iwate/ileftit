/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
self.addEventListener('push', event => {
  var _event$data$json, _event$data;
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }
  const data = (_event$data$json = (_event$data = event.data) === null || _event$data === void 0 ? void 0 : _event$data.json()) !== null && _event$data$json !== void 0 ? _event$data$json : {};
  const title = data.title || 'I left it';
  const body = data.body || 'Do you extend open time for your data?';
  const icon = data.icon || '/apple-touch-icon.png';
  const actions = data.actions;
  event.waitUntil(registration.showNotification(title, {
    body,
    icon,
    actions
  }));
});
self.addEventListener('notificationclick', function (ev) {
  ev.notification.close();
  clients.openWindow('/');
});
/******/ })()
;