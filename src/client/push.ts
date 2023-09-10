import { fromBase64, toBase64 } from './base64';

const DAY = 24 * 60 * 60 * 1000;
export async function updateSubscriptionIfExist(
  publicKey: string
): Promise<[reg: ServiceWorkerRegistration, sub: PushSubscription | null]> {
  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    window['workbox'] !== undefined
  ) {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (
      sub &&
      sub.expirationTime &&
      !(Date.now() > sub.expirationTime - 7 * DAY)
    ) {
      sub = await subscribe(reg, publicKey);
      return [reg, sub];
    }

    const res = await fetch(`/api/sub/${encodeURIComponent(sub.endpoint)}`);
    if (res.ok) {
      return [reg, sub];
    }

    return [reg, null];
  }
  return [null, null];
}

export async function subscribe(
  registration: ServiceWorkerRegistration,
  publicKey: string
) {
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: fromBase64(publicKey),
  });
  const res = await fetch('/api/sub/', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subscription }),
  });
  return res.ok ? subscription : null;
}
