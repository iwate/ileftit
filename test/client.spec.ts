import { test, expect, Page } from '@playwright/test'

async function loadLibs(page: Page) {
    await page.goto(`file:///${__dirname}/www/index.html`);
    await page.waitForSelector("#loaded");
}

test('CryptoService shoud out login password from generated secret', async ({page}) => {
    await loadLibs(page);

    const [pass1, pass2] = await page.evaluate(async () => {
        // @ts-ignore
        const { CryptoService } = Libs[0];

        const c1 = await CryptoService.create();
        const c2 = await CryptoService.create(c1.getSecret());

        return [c1.getLoginPassword(), c2.getLoginPassword()];
    });
    
    await expect(pass1).not.toBeUndefined();
    await expect(pass1).not.toBeNull();
    await expect(pass1).toBe(pass2);
})


test('CryptoService::decrypt should get plain text from encrypted text', async ({page}) => {
    await loadLibs(page);

    const expected = 'Hello, World!';
    const [cipher, actual, secret] = await page.evaluate(async (text) => {
        // @ts-ignore
        const { CryptoService } = Libs[0];

        const c = await CryptoService.create();
        const cipher = await c.encrypt(text);
        const actual = await c.decrypt(cipher);
        return [cipher, actual, c.getSecret()];
    }, expected);
    
    expect(cipher).not.toBe(expected);
    expect(actual).toBe(expected);
});

test('CryptoService should use secret generated at 2023-09', async ({page}) => {
    await loadLibs(page);

    const secret = 'eyJrIjoiQ21ZVklEd3Q5L2thY0FvYmtUM2dWSkExNVc2MHpMVkNvY0wvMy9nVzNhVSIsImMiOnsibmFtZSI6IkFFUy1HQ00iLCJsZW5ndGgiOjI1NiwiaXYiOiJGVGMxWlNxd2JmQ3NkSDVZYXdxYlZHODVBS3BjMVRDUmhCQzlqdXhIay9BIn0sImQiOnsibmFtZSI6IlBCS0RGMiIsInNhbHQiOiJSY0ErWkJSUzdMZnQ0WGMzTnJpSXNJczRyNTNsM014dEV2QWFCelcvMDFHVnRlTEhUdFR3Z3Y3dmdUVTZnRTJRSmM4NDJEZkpLUFdybXFOR2E5QXV5ZyIsIml0ZXJhdGlvbnMiOjEwMDAwMCwiaGFzaCI6IlNIQS01MTIifX0=';
    const cipher = 'IDMWFxyIbw3LCpC+0PptQxqFxUxyPUWL+op88E8';
    const [text, loginPassword] = await page.evaluate(async ({secret, cipher}) => {
        // @ts-ignore
        const { CryptoService } = Libs[0];

        const c = await CryptoService.create(secret);
        return [await c.decrypt(cipher), c.getLoginPassword()];
    }, {secret, cipher});
    
    expect(text).toBe('Hello, World!');
    expect(loginPassword).toBe('rDrxDQzvPqiEWAci21qdG9+SviGGEMTGofANNtgUasN7UyTD2mO36ehM+UlHsFZtNC00A3MR2zPwKYjc1pn3Aw');
});