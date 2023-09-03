import { test, expect } from '@playwright/test'
import { afterDays } from '../src/server/date';

test('afterDays', async () => {
    const now = new Date('2023-08-01T00:00:00.000Z');

    expect(afterDays(0.5, now)).toBe('2023-08-01T12:00:00.000Z');
    expect(afterDays(1, now)).toBe('2023-08-02T00:00:00.000Z');
    expect(afterDays(2, now)).toBe('2023-08-03T00:00:00.000Z');
});