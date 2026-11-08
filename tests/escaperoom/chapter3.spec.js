const { test, expect } = require('@playwright/test');
const { startChapter, hs, walk, skip, useSlot, waitModalClosed, expectWin } = require('./helpers');

test('hoofdstuk 3: het kistje, vier letters en het woord GRUP', async ({ page }) => {
  await startChapter(page, 3);
  await expect(page.locator('#chap')).toHaveText('Hoofdstuk 3 · Het museum van Roelof');

  await useSlot(page, 'Oude sleutel');
  await hs(page, 'kistje'); await skip(page);
  await expect(page.locator('.note-paper')).toContainText('vier letters');
  await page.locator('#m-close').click();
  await expect(page.locator('.slot[title="Akkerkaart"]')).toBeVisible();

  // de bascule: 7 kilo op het schaaltje, de zak weegt 70
  await hs(page, 'bascule');
  await page.locator('[data-a="70"]').click();
  await expect(page.locator('#bs-fb')).toContainText('evenwicht');
  await page.locator('[data-w="5"]').click();
  await page.locator('[data-w="2"]').click();
  await page.locator('[data-a="7"]').click();
  await expect(page.locator('#bs-fb')).toContainText('10 kilo op de brug');
  await page.locator('[data-a="70"]').click();
  await waitModalClosed(page);

  // de karnton
  await hs(page, 'karn');
  await page.locator('.opt[data-i="3"]').click();
  await expect(page.locator('#kr-fb')).toContainText('room');
  for (const i of [0, 1, 2, 3, 4, 5]) await page.locator(`.opt[data-i="${i}"]`).click();
  await waitModalClosed(page);

  // het spreukenbord
  await hs(page, 'spreuk');
  const sel = page.locator('#m-body select');
  for (const [i, v] of [[0, 'Hallo, en ook: dag!'], [1, 'Niet zeuren, gewoon doen'], [2, 'Zet door, niet opgeven'], [3, 'Meisje']]) await sel.nth(i).selectOption(v);
  await page.locator('#sp-ok').click();
  await waitModalClosed(page);

  // het platte dak: de akkers
  await walk(page, 'muladder', 'dak');
  await useSlot(page, 'Akkerkaart');
  await hs(page, 'akkers');
  const put = async (k, v) => page.locator(`select[data-k="${k}"]`).selectOption(v);
  for (const [k, v] of [['19220', 'b'], ['19221', 'g'], ['19222', 'k'], ['19230', 'g'], ['19231', 'k'], ['19232', 'b']]) await put(k, v);
  await page.locator('#ak-ok').click();
  await expect(page.locator('#ak-fb')).toContainText('graan');
  for (const [k, v] of [['19220', 'g'], ['19221', 'k'], ['19222', 'b'], ['19230', 'b'], ['19231', 'g'], ['19232', 'k']]) await put(k, v);
  await page.locator('#ak-ok').click();
  await waitModalClosed(page);

  // terug naar het kistje: GRUP
  await walk(page, 'naarmuseum', 'museum');
  await hs(page, 'kistje');
  for (const l of ['P', 'U', 'R', 'G']) await page.locator(`[data-l="${l}"]`).click();
  await expect(page.locator('#wd-fb')).toHaveClass(/bad/);
  await page.locator('#wd-c').click();
  for (const l of ['G', 'R', 'U', 'P']) await page.locator(`[data-l="${l}"]`).click();
  await expectWin(page, 'Zaterdagmiddag · hoofdstuk 3 klaar');
});
