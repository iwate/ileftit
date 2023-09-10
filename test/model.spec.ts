import {test, expect} from '@playwright/test'
import { listSubscriptionsNecessaryToPushPredicator } from '../src/server/model';

function f(h: number) {
    const now = new Date().getTime();
    const openAt = now + 60 * 60 * 1000 * h;
    return listSubscriptionsNecessaryToPushPredicator(now, openAt);
}

test.describe('Notification',() => {
    const targets = [
        1,2,3,4,5,6,8,10,12,18,24,
        2 * 24, 
        3 * 24, 
        4 * 24,
        5 * 24,
        6 * 24,
        7 * 24,
    ]
    const notTargets = [
        7,9,11,13,14,15,16,17,19,20,21,22,23,
        1.5 * 24,
        2.5 * 24,
        3.5 * 24, 
        4.5 * 24,
        5.5 * 24,
        6.5 * 24,
        7.5 * 24,
    ]
    for (const h of targets) {
        test(`before ${h}h, it should notify`, () => {
            expect(f(h)).toBe(true);
        })
    }
    for (const h of notTargets) {
        test(`before ${h}h, it should not notify`, () => {
            expect(f(h)).toBe(false);
        })
    }
    
})