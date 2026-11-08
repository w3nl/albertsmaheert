const { test, expect } = require('@playwright/test');
const { startChapter, hs, walk, skip, waitModalClosed, expectWin } = require('./helpers');

test('hoofdstuk 2: de katrol, drie tekens in drie kamers en het kastje in de stijl', async ({ page }) => {
  await startChapter(page, 2);
  await expect(page.locator('#chap')).toHaveText('Hoofdstuk 2 · Op de hooizolder');

  // in Alma kan het behang pas als Roelof boven is
  await walk(page, 'alma', 'kamer');
  await hs(page, 'behang');
  await expect(page.locator('#d-txt')).toContainText('Een baan behang laat los', { timeout: 5_000 });
  await skip(page);
  await walk(page, 'kamerdeur', 'zolder');

  // de katrol
  await hs(page, 'luik'); await skip(page);
  await page.locator('.opt[data-v="4"]').click();
  await expect(page.locator('#kt-fb')).toContainText('20 meter');
  await page.locator('.opt[data-v="2"]').click();
  await waitModalClosed(page);
  await expect(page.locator('#zl-roelof')).toBeVisible();

  // Thedema: telmerken
  await walk(page, 'thedema', 'kamer');
  await expect(page.locator('#chap')).toHaveText('Hoofdstuk 2 · Kamer Thedema');
  await hs(page, 'stijl');
  const sel = page.locator('#m-body select');
  for (const [i, v] of [[0, '8'], [1, '4'], [2, '6'], [3, '11']]) await sel.nth(i).selectOption(v);
  await page.locator('#tl-ok').click();
  await expect(page.locator('#tl-fb')).toContainText('XI');
  await sel.nth(2).selectOption('11');
  await sel.nth(3).selectOption('6');
  await page.locator('#tl-ok').click();
  await waitModalClosed(page);
  await expect(page.locator('#km-marktxt')).toHaveText('ΛII');

  // Alma: het behang
  await walk(page, 'kamerdeur', 'zolder');
  await walk(page, 'alma', 'kamer');
  await hs(page, 'behang');
  await page.locator('.opt[data-v="A"]').click();
  await expect(page.locator('#bh-fb')).toHaveClass(/bad/);
  await page.locator('.opt[data-v="C"]').click();
  await waitModalClosed(page);

  // Folkerda: de prenten
  await walk(page, 'kamerdeur', 'zolder');
  await walk(page, 'folkerda', 'kamer');
  await hs(page, 'prenten');
  const ps = page.locator('#m-body select');
  for (const [i, v] of [[0, 'thedema'], [1, 'folkerda'], [2, 'alma']]) await ps.nth(i).selectOption(v);
  await page.locator('#pr-ok').click();
  await waitModalClosed(page);
  await expect(page.locator('#km-print')).toBeVisible();

  // het kastje: 7, 4, 11
  await walk(page, 'kamerdeur', 'zolder');
  await hs(page, 'kast');
  for (let i = 0; i < 7; i++) await page.locator('[data-i="0"][data-d="1"]').click();
  for (let i = 0; i < 4; i++) await page.locator('[data-i="1"][data-d="1"]').click();
  await page.locator('#ks-ok').click();
  await expect(page.locator('#ks-fb')).toHaveClass(/bad/);
  for (let i = 0; i < 2; i++) await page.locator('[data-i="2"][data-d="-1"]').click();
  await page.locator('#ks-ok').click();
  await expectWin(page, 'Zaterdagochtend · hoofdstuk 2 klaar');
});

test('de kamers op de hooizolder hebben eigen behang en dekbed', async ({ page }) => {
  await startChapter(page, 2);
  const rooms = [
    ['thedema', 'kmBedThedema', false],
    ['alma', 'kmPlaid', true],
    ['folkerda', 'kmBedFolkerda', true]
  ];
  for (const [room, bedspread, hasWickerChair] of rooms) {
    await page.evaluate(room => { S.kamer = room; S.scene = 'kamer'; applyVisuals(); }, room);
    await expect(page.locator('#km-wall-' + room)).toBeVisible();
    await expect(page.locator('#km-bedspread')).toHaveAttribute('fill', `url(#${bedspread})`);
    if (hasWickerChair) await expect(page.locator('#km-rieten')).toBeVisible();
    else await expect(page.locator('#km-rieten')).toBeHidden();
  }
});
