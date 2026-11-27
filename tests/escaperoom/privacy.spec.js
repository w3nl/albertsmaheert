// Het privacybeleid van de escaperoom (voor Google Play en de Chrome Web Store): een gewone pagina in het spel.
const { test, expect } = require('@playwright/test');
const { seed } = require('./helpers');

test('het titelscherm linkt naar het privacybeleid, en dat linkt terug naar het spel', async ({ page }) => {
  const outside = [];
  page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1')) outside.push(r.url()); });
  await seed(page);
  await page.locator('#title-privacy').click();
  await expect(page).toHaveURL(/privacy\.html$/);
  await expect(page.locator('h1')).toHaveText('Privacybeleid');
  await expect(page.locator('.box')).toContainText('het spel verzamelt niets');
  await expect(page.locator('main')).toContainText('bedandbreakfast.nl');
  await expect(page.locator('main')).toContainText('Wolddijk 60');
  expect(outside).toEqual([]);
  await page.locator('a.back').first().click();
  await expect(page.locator('#title')).toBeVisible();
});

test('ook vanuit Logeren → Contact en de voetregel', async ({ page }) => {
  await seed(page);
  await expect(page.locator('.site-foot a[href="privacy.html"]')).toBeVisible();
  await page.evaluate(() => openBnB('contact'));
  await expect(page.locator('#modal a[href="privacy.html"]')).toBeVisible();
});
