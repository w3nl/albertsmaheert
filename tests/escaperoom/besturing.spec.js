// Spelen zonder muis: toetsenbord, afstandsbediening (pijltjes + OK + Terug) en controller.
const { test, expect } = require('@playwright/test');
const { seed } = require('./helpers');

const focusLabel = page => page.evaluate(() => {
  const el = document.querySelector('.pad-focus');
  return el ? (el.dataset.label || el.id || el.textContent.trim()) : null;
});

/** Doe alsof de Android-app een controllerknop doorgeeft (window.__nativePad telt de keren dat een knop is ingedrukt). */
async function padPress(page, button) {
  await page.evaluate(b => {
    const n = window.__nativePad || (window.__nativePad = { buttons: Array(17).fill(0), presses: Array(17).fill(0), axes: [0, 0] });
    n.presses[b] = (n.presses[b] || 0) + 1;
  }, button);
  await page.waitForTimeout(200);
}

test('met pijltjes en Enter van het titelscherm de kamer in en rondkijken', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await seed(page);
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#title .pad-focus')).toHaveCount(1);
  // naar "Nieuw spel" en starten
  await page.evaluate(() => document.querySelector('#btn-new').focus());
  await page.keyboard.press('Enter');
  await expect(page.locator('#title')).toBeHidden();
  // het openingsgesprek met Enter wegklikken
  for (let i = 0; i < 20 && await page.locator('#dialog').isVisible(); i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(80);
  }
  await expect(page.locator('#dialog')).toBeHidden();
  await page.keyboard.press('ArrowRight');
  const first = await focusLabel(page);
  expect(first).toBeTruthy();
  await page.keyboard.press('ArrowRight');
  const second = await focusLabel(page);
  expect(second).toBeTruthy();
  expect(second).not.toBe(first);
  await expect(page.locator('#tip')).toBeVisible();
  expect(errors).toEqual([]);
});

test('controller van de Android-app: Start opent het menu, B gaat terug', async ({ page }) => {
  await seed(page, { scene: 'erf' });
  await page.locator('#btn-cont').click();
  await page.evaluate(() => { const d = document.querySelector('#dialog'); for (let i = 0; i < 40 && !d.hidden; i++) d.click(); });
  await padPress(page, 15); // pijltje rechts
  await expect(page.locator('.scene.on .hit.pad-focus')).toHaveCount(1);
  await expect(page.locator('#gp-status')).toContainText('verbonden');
  await padPress(page, 9); // Start
  await expect(page.locator('#title')).toBeVisible();
  // op het titelscherm sluit Terug de app (tvBack geeft dan false)
  expect(await page.evaluate(() => window.tvBack())).toBe(false);
});

test('Terug sluit een close-up', async ({ page }) => {
  await seed(page, { scene: 'erf' });
  await page.locator('#btn-cont').click();
  await page.evaluate(() => { const d = document.querySelector('#dialog'); for (let i = 0; i < 40 && !d.hidden; i++) d.click(); });
  await page.evaluate(() => openModal('Test', '', '<p>Test</p><button>ok</button>'));
  await expect(page.locator('#modal')).toBeVisible();
  expect(await page.evaluate(() => window.tvBack())).toBe(true);
  await expect(page.locator('#modal')).toBeHidden();
});
