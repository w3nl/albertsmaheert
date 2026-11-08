// Puzzels die niet op elkaar wachten, kun je in een andere volgorde spelen. Het spel moet dan nog kloppen.
const { test, expect } = require('@playwright/test');
const { startChapter, hs, walk, useSlot, waitModalClosed, expectWin } = require('./helpers');

/** Lees het hele gesprek (spreker: tekst per regel) en klik het weg. */
async function readAll(page) {
  await expect(page.locator('#modal')).toBeHidden({ timeout: 15_000 });
  await expect(page.locator('#dialog')).toBeVisible({ timeout: 5_000 });
  return page.evaluate(async () => {
    const dlg = document.querySelector('#dialog'), seen = [];
    const line = () => document.querySelector('#d-who').textContent + ': ' + document.querySelector('#d-txt').textContent;
    seen.push(line());
    for (let i = 0; i < 80 && !dlg.hidden; i++) {
      dlg.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise(r => setTimeout(r, 10));
      if (!dlg.hidden) seen.push(line());
    }
    return seen.join('\n');
  });
}

test('hoofdstuk 2 andersom: eerst Thedema en Folkerda, dan de katrol', async ({ page }) => {
  await startChapter(page, 2);

  await walk(page, 'thedema', 'kamer');
  await hs(page, 'stijl');
  const sel = page.locator('#m-body select');
  for (const [i, v] of [[0, '8'], [1, '4'], [2, '11'], [3, '6']]) await sel.nth(i).selectOption(v);
  await page.locator('#tl-ok').click();
  // Roelof is nog buiten
  let talk = await readAll(page);
  expect(talk).toContain('ΛII');
  expect(talk).not.toContain('Roelof');

  await walk(page, 'kamerdeur', 'zolder');
  await walk(page, 'folkerda', 'kamer');
  await hs(page, 'prenten');
  const ps = page.locator('#m-body select');
  for (const [i, v] of [[0, 'thedema'], [1, 'folkerda'], [2, 'alma']]) await ps.nth(i).selectOption(v);
  await page.locator('#pr-ok').click();
  talk = await readAll(page);
  expect(talk).toContain('XI');
  expect(talk).not.toMatch(/^Roelof:/m);

  // het kastje gaat nog niet open, ook niet met de goede code
  await walk(page, 'kamerdeur', 'zolder');
  await hs(page, 'kast');
  for (let i = 0; i < 7; i++) await page.locator('[data-i="0"][data-d="1"]').click();
  for (let i = 0; i < 4; i++) await page.locator('[data-i="1"][data-d="1"]').click();
  for (let i = 0; i < 2; i++) await page.locator('[data-i="2"][data-d="-1"]').click();
  await page.locator('#ks-ok').click();
  await expect(page.locator('#ks-fb')).toContainText('alle drie de borgen');
  await page.locator('#m-close').click();

  await hs(page, 'luik'); await readAll(page);
  await page.locator('.opt[data-v="2"]').click();
  talk = await readAll(page);
  expect(talk).toContain('behang');

  await walk(page, 'alma', 'kamer');
  await hs(page, 'behang');
  await page.locator('.opt[data-v="C"]').click();
  await waitModalClosed(page);

  await walk(page, 'kamerdeur', 'zolder');
  await hs(page, 'kast');
  await page.locator('#ks-ok').click();
  await expectWin(page, 'Zaterdagochtend · hoofdstuk 2 klaar');
});

test('hoofdstuk 4 andersom: eerst het gereedschap, dan de tafel, dan de lampjes', async ({ page }) => {
  await startChapter(page, 4);

  await walk(page, 'tuindeur', 'tuin');
  await hs(page, 'sporen');
  await page.locator('.opt[data-v="1"]').click();
  await waitModalClosed(page);
  await hs(page, 'koevoet'); await readAll(page);
  await walk(page, 'naarbinnen', 'zaal');

  await walk(page, 'naarhal', 'hal');
  await hs(page, 'pool');
  await page.locator('[data-h="100"]').click();
  await waitModalClosed(page);
  await walk(page, 'hlzaal', 'zaal');

  // de grup wacht op het feest
  await useSlot(page, 'Dopsleutel');
  await hs(page, 'grup');
  expect(await readAll(page)).toContain('Eerst het feest');

  await hs(page, 'tafel');
  const sel = page.locator('#m-body select');
  for (const [i, n] of ['Ditty', 'Roelof', 'Jij', 'Tante Grietje', 'Buurman Jan'].entries()) await sel.nth(i).selectOption(n);
  await page.locator('#tf-ok').click();
  expect(await readAll(page)).toContain('Nu de lampjes nog');

  await hs(page, 'lampjes');
  for (const b of [8, 12, 10, 11]) { await page.locator(`[data-b="${b}"]`).click(); await page.locator('#lp-meet').click(); }
  await page.locator('#lp-vervang').click();
  const talk = await readAll(page);
  expect(talk).toContain('tafel is ook al klaar');
  expect(talk).not.toContain('Nu de tafel nog');

  await hs(page, 'roelof');
  expect(await readAll(page)).toContain('dopsleutel en mijn koevoet al gevonden');

  await useSlot(page, 'Dopsleutel');
  await hs(page, 'grup');
  expect(await readAll(page)).toContain('Pak mijn koevoet maar');
  await useSlot(page, 'Koevoet');
  await hs(page, 'grup'); await readAll(page);
  await expect(page.locator('.note-paper')).toContainText('Zet de koffie aan');
  await page.locator('#m-close').click();
  await expectWin(page, 'Zaterdagavond · alle hoofdstukken klaar');
  await expect(page.locator('#za-foto')).toBeVisible();
});
