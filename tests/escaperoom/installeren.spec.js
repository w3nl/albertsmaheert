// De knop Installeren: alleen de keuzes die bij het apparaat passen (web-app, Chrome-extensie, Android-app, Linux-app).
const { test, expect } = require('@playwright/test');
const { seed } = require('./helpers');

const UA = {
  windowsChrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  linuxChrome: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  linuxFirefox: 'Mozilla/5.0 (X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0',
  chromebook: 'Mozilla/5.0 (X11; CrOS x86_64 16181.61.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  android: 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1',
  macSafari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Safari/605.1.15',
};

/** Doe alsof de browser installeren aanbiedt (beforeinstallprompt), zoals Chrome en Edge doen. */
async function offerWebApp(page, outcome = 'accepted') {
  await page.evaluate(outcome => {
    const e = new Event('beforeinstallprompt');
    e.prompt = () => { window.__prompted = true; };
    e.userChoice = Promise.resolve({ outcome });
    window.dispatchEvent(e);
  }, outcome);
}
const options = page => page.locator('#modal .inst b').allTextContents();

const CASES = [
  ['Chrome op Windows', 'windowsChrome', true, ['Web-app', 'Chrome-extensie']],
  ['Chrome op Linux', 'linuxChrome', true, ['Web-app', 'Chrome-extensie', 'Linux-app']],
  ['Firefox op Linux', 'linuxFirefox', false, ['Linux-app']],
  ['Chromebook', 'chromebook', true, ['Web-app', 'Chrome-extensie', 'Android-app']],
  ['Android', 'android', false, ['Web-app', 'Android-app']],
  ['iPhone', 'iphone', false, ['Web-app']],
];
for (const [name, ua, web, expected] of CASES) {
  test.describe(name, () => {
    test.use({ userAgent: UA[ua] });
    test(`toont ${expected.join(', ')}`, async ({ page }) => {
      await seed(page);
      if (web) await offerWebApp(page);
      await expect(page.locator('#btn-install')).toBeVisible();
      await page.locator('#btn-install').click();
      await expect(page.locator('#modal')).toBeVisible();
      expect(await options(page)).toEqual(expected);
      // elke winkel-link gaat naar de echte winkel, in een nieuw tabblad
      for (const a of await page.locator('#modal .inst a').all()) {
        expect(await a.getAttribute('href')).toMatch(/^https:\/\/(play\.google\.com|chromewebstore\.google\.com|snapcraft\.io)\//);
        expect(await a.getAttribute('target')).toBe('_blank');
      }
    });
  });
}

test.describe('Safari op een Mac', () => {
  test.use({ userAgent: UA.macSafari });
  test('alleen de web-app, met uitleg (Voeg toe aan Dock)', async ({ page }) => {
    await seed(page);
    await page.locator('#btn-install').click();
    expect(await options(page)).toEqual(['Web-app']);
    await expect(page.locator('#modal .inst')).toContainText('Dock');
  });
});

test.describe('Firefox op Windows', () => {
  test.use({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0' });
  test('niets te installeren: geen knop', async ({ page }) => {
    await seed(page);
    await expect(page.locator('#btn-install')).toBeHidden();
  });
});

test.describe('de web-app installeren', () => {
  test.use({ userAgent: UA.windowsChrome });
  test('de knop vraagt de browser om te installeren en sluit dan', async ({ page }) => {
    await seed(page);
    await offerWebApp(page);
    await page.locator('#btn-install').click();
    await page.locator('#modal [data-install]').click();
    await expect(page.locator('#modal')).toBeHidden();
    expect(await page.evaluate(() => window.__prompted)).toBe(true);
  });
});
