// Logeren bij de Albertsmaheert: de B&B in het spel (de kamers, contact en het ECHTE reserveringsformulier).
const { test, expect } = require('@playwright/test');
const { seed } = require('./helpers');

const BOOK = /bedandbreakfast\.nl\/ibook/;

test('Kom logeren opent Reserveren: de melding dat het echt is, en het formulier van bedandbreakfast.nl', async ({ page }) => {
  const outside = [];
  await page.route(BOOK, route => { outside.push(route.request().url()); route.fulfill({ contentType: 'text/html', body: '<p>formulier</p>' }); });
  await seed(page);
  expect(outside).toEqual([]);   // niets geladen voordat je Reserveren opent
  await page.locator('#title [data-bnb="reserveren"]').click();
  await expect(page.locator('#modal .tab.on')).toHaveText('Reserveren');
  await expect(page.locator('#modal .real')).toContainText('dit is echt, geen spel');
  await expect(page.locator('#modal .real')).toContainText('echte overnachting');
  await expect(page.locator('#modal .book-label')).toContainText('Echte boeking');
  await expect(page.locator('#modal iframe')).toHaveAttribute('src', 'https://www.bedandbreakfast.nl/ibook/v2/66793/nl/black/transparent');
  await expect.poll(() => outside.length).toBe(1);
});

test('De B&B toont de vier kamers met foto, en de tabbladen wisselen', async ({ page }) => {
  await seed(page);
  await page.evaluate(() => openFolder());
  await expect(page.locator('#modal .room')).toHaveCount(4);
  await expect(page.locator('#modal .room b')).toHaveText(['Thedema', 'Alma', 'Folkerda', 'Paardenstal']);
  await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('#modal .room img')].every(i => i.complete && i.naturalWidth > 0))).toBe(true);
  await page.locator('#modal .tab', { hasText: 'Contact' }).click();
  await expect(page.locator('#modal a[href^="mailto:"]')).toHaveText('ditty@albertsmaheert.nl');
  await expect(page.locator('#modal a[href^="tel:"]')).toHaveText('06 12212622');
  await page.locator('#modal .tab', { hasText: 'De B&B' }).click();
  // een andere close-up daarna reageert niet meer op de klikken van dit venster
  await page.evaluate(() => openModal('Test', '', '<button data-tab="contact">x</button>'));
  await page.locator('#modal [data-tab]').click();
  await expect(page.locator('#modal')).toContainText('Test');
});

test('de voetregel: contact opent het tabblad Contact', async ({ page }) => {
  await seed(page);
  await page.locator('.site-foot [data-bnb="contact"]').click();
  await expect(page.locator('#modal .tab.on')).toHaveText('Contact');
});

test('zonder internet: uitleg in plaats van het formulier', async ({ page, context }) => {
  await seed(page);
  await context.setOffline(true);
  await page.evaluate(() => openBnB('reserveren'));
  await expect(page.locator('#modal iframe')).toHaveCount(0);
  await expect(page.locator('#modal')).toContainText('niet online');
  await context.setOffline(false);
});

const { startChapter, hs, skip, walk } = require('./helpers');

test('het kaartje op tafel in de kamer: alles over die kamer, en dan reserveren', async ({ page }) => {
  await startChapter(page, 2);
  await page.evaluate(() => { S.kamer = 'thedema'; go('kamer'); });
  await expect(page.locator('#sc-kamer')).toHaveClass(/(^|\s)on(\s|$)/);
  await page.waitForTimeout(500);
  await hs(page, 'kmkaart');
  await skip(page);
  await expect(page.locator('#m-title')).toHaveText('Kamer Thedema');
  await expect(page.locator('#modal .roominfo')).toContainText('Martinitoren');
  await expect(page.locator('#modal .facs')).toContainText('Bad');
  await expect(page.locator('#modal .facs')).toContainText('Minimaal 2 nachten');
  await page.locator('#modal [data-tab="reserveren"]').click();
  await expect(page.locator('#modal .real')).toContainText('dit is echt');
});

test('De B&B: een kamer aanklikken toont die kamer (Alma heeft geen bad)', async ({ page }) => {
  await seed(page);
  await page.evaluate(() => openBnB('bnb'));
  await page.locator('#modal [data-room="alma"]').click();
  await expect(page.locator('#m-title')).toHaveText('Kamer Alma');
  await expect(page.locator('#modal .facs')).not.toContainText(/\bBad\b/);
});

test('buiten: het fietsknooppunt op het erf toont de omgeving', async ({ page }) => {
  await seed(page, { f: { introDone: true } });
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'knoop');
  await skip(page);
  await expect(page.locator('#modal .tab.on')).toHaveText('Omgeving');
  await expect(page.locator('#modal')).toContainText('Walfriduskerk in Bedum');
  await expect(page.locator('#modal')).toContainText('Menkemaborg');
});

test('in gesprek met Roelof of Ditty: het knopje Echt komen logeren?', async ({ page }) => {
  await seed(page, { f: { introDone: true } });
  await page.locator('#btn-cont').click();
  await skip(page);
  await page.evaluate(() => say([['you', 'Hallo!'], ['roelof', 'Moi!']]));
  await expect(page.locator('#d-txt')).toHaveText('Hallo!');
  await expect(page.locator('#d-stay')).toBeHidden();
  await page.locator('#dialog').click();
  await expect(page.locator('#d-txt')).toHaveText('Moi!');
  await expect(page.locator('#d-stay')).toBeVisible();
  await page.locator('#d-stay').click();
  await expect(page.locator('#modal .tab.on')).toHaveText('Reserveren');
});

test('buiten op het dak: de verrekijker toont de omgeving', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await startChapter(page, 3);
  await page.evaluate(() => go('dak'));
  await expect(page.locator('#sc-dak')).toHaveClass(/(^|\s)on(\s|$)/);
  await expect(page.locator('#fade')).not.toHaveClass(/(^|\s)on(\s|$)/);
  await hs(page, 'kijker');
  await skip(page);
  await expect(page.locator('#modal .tab.on')).toHaveText('Omgeving');
  expect(errors).toEqual([]);
});

test('Reserveren: een QR-code om op de telefoon verder te gaan (ook zonder internet)', async ({ page, context }) => {
  await page.route(/bedandbreakfast\.nl/, route => route.fulfill({ contentType: 'text/html', body: '<p>formulier</p>' }));
  await seed(page);
  await page.evaluate(() => openBnB('reserveren'));
  const img = page.locator('#modal .qr img');
  await expect(img).toBeVisible();
  await expect(img).toHaveAttribute('src', 'img/qr-reserveren.svg');
  await expect.poll(() => img.evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
  await expect(page.locator('#modal .qr')).toContainText('albertsmaheert.nl/reserveer');
  await context.setOffline(true);
  await page.evaluate(() => openBnB('reserveren'));
  await expect(page.locator('#modal .qr img')).toBeVisible();
  await expect(page.locator('#modal')).toContainText('Scan de code');
  await context.setOffline(false);
});

test.describe('op een telefoon', () => {
  test.use({ viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true });
  test('geen QR-code (je bent al op je telefoon)', async ({ page }) => {
    await page.route(/bedandbreakfast\.nl/, route => route.fulfill({ contentType: 'text/html', body: '<p>formulier</p>' }));
    await seed(page);
    await page.evaluate(() => openBnB('reserveren'));
    await expect(page.locator('#modal .real')).toBeVisible();
    await expect(page.locator('#modal .qr')).toBeHidden();
  });
});
