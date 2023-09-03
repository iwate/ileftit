export function afterDays(days: number, now: Date = new Date()) {
    const h = days * 24;
    const m = h * 60;
    const s = m * 60;
    const ms = s * 1000;
    const date = new Date(now.getTime() + ms);
    return date.toISOString();
}