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
