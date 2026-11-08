const { test, expect } = require('@playwright/test');
const { KEY, seed, hs, skip } = require('./helpers');

test('je voortgang wordt bewaard en blijft na herladen', async ({ page }) => {
  await seed(page);
  await page.locator('#btn-new').click();
  await skip(page);
  await hs(page, 'paardje');
  await skip(page);
  await page.reload();
  await expect(page.locator('#btn-cont')).toBeVisible();
  await page.locator('#btn-cont').click();
  await expect(page.locator('.slot[title="Hobbelpaardje"]')).toBeVisible();
  await expect(page.locator('#d-who')).toHaveText('Vrijdagavond · Wolddijk 60');
  await expect(page.locator('#d-txt')).toContainText('Terug op het erf', { timeout: 5_000 });
});

test('half ingevulde puzzels blijven zoals je ze achterliet', async ({ page }) => {
  await seed(page, { ch: 1, scene: 'erf', f: { introDone: true, goot: true } });
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'kastje');
  for (const k of ['9', '7']) await page.locator(`[data-k="${k}"]`).click();
  await page.locator('#m-close').click();
  await page.reload();
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'kastje');
  await expect(page.locator('#k-lcd')).toHaveText('97··');
  // hoofdstuk 2: de schijfjes van het kastje
  await seed(page, { ch: 2, scene: 'zolder', f: { introDone: true } }, ['-ch2']);
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'kast');
  await page.locator('[data-i="0"][data-d="1"]').click();
  await page.locator('#m-close').click();
  expect(await page.evaluate(KEY => JSON.parse(localStorage.getItem(KEY)).kst2, KEY)).toEqual([1, 0, 0]);
});

test('hints geven eerst een duwtje en dan het antwoord, en worden geteld; het hobbelpaardje is gratis', async ({ page }) => {
  await seed(page);
  await page.locator('#btn-new').click();
  await skip(page);
  await page.locator('#btn-hint').click();
  await expect(page.locator('#d-txt')).toContainText('Hint: Roelof', { timeout: 5_000 });
  await skip(page);
  await page.locator('#btn-hint').click();
  await expect(page.locator('#d-txt')).toContainText('Grote hint: 3 millimeter', { timeout: 5_000 });
  await skip(page);
  await expect(page.locator('#hint-count')).toHaveText('2');
  await hs(page, 'paardje'); await skip(page);
  await page.locator('.slot[title="Hobbelpaardje"]').click();
  await hs(page, 'goot');
  await expect(page.locator('#d-txt')).toContainText('Klok, klok', { timeout: 5_000 });
  await skip(page);
  await expect(page.locator('#hint-count')).toHaveText('2');
});

test('elke stap van elk hoofdstuk heeft twee hints', async ({ page }) => {
  await seed(page);
  const bad = await page.evaluate(() => Object.entries(HINTS).filter(([, h]) => !Array.isArray(h) || h.length !== 2 || h.some(t => !t)).map(([k]) => k));
  expect(bad).toEqual([]);
});

test('scores bewaren het beste resultaat, en hoofdstukken blijven vrijgespeeld', async ({ page }) => {
  await seed(page, { f: { out1: true }, t: 300, hints: 3 });
  await page.evaluate(() => { recordScore(1, 300, 3); recordScore(1, 400, 1); setUnlocked(2); });
  await page.reload();
  await expect(page.locator('#chapters')).toBeVisible();
  await expect(page.locator('#btn-ch2')).toBeVisible();
  await expect(page.locator('#btn-cont')).toHaveText('Door naar hoofdstuk 2');
  await page.locator('#btn-scores').click();
  await expect(page.locator('.scores tbody tr').first()).toContainText('05:00');
  await expect(page.locator('.scores tbody tr').first()).toContainText('1');
});

test('de folder in de brievenbus linkt naar de echte B&B', async ({ page }) => {
  await seed(page, { f: { introDone: true } });
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'brievenbus');
  await skip(page);
  await expect(page.locator('.folder')).toContainText('Thedema');
  await expect(page.locator('.folder a.btn').first()).toHaveAttribute('href', 'https://albertsmaheert.nl/reserveer/');
});
