export function toBase64(data: Uint8Array) {
  return btoa([...data].map((n) => String.fromCharCode(n)).join('')).replaceAll(
    '=',
    ''
  );
}

export function fromBase64(data: string) {
  const padding = '='.repeat((4 - (data.length % 4)) % 4);
  const b64 = (data + padding).replace(/-/g, '+').replace(/_/g, '/');

  return new Uint8Array([...atob(b64)].map((s) => s.charCodeAt(0)));
}
