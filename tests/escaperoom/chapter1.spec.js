const { test, expect } = require('@playwright/test');
const { seed, startChapter, hs, walk, skip, useSlot, waitModalClosed, expectWin } = require('./helpers');

test('hoofdstuk 1: Roelof helpt ook als je de intro onderbreekt', async ({ page }) => {
  await seed(page);
  await page.locator('#btn-new').click();
  await expect(page.locator('#dialog')).toBeVisible();
  await page.locator('#btn-menu').click();
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'roelof'); await skip(page);
  await expect(page.locator('#modal')).toContainText('De dakgoot');
});

test('de wekkerradio volgt de tijd van het verhaal', async ({ page }) => {
  for (const [chapter, time, daypart] of [[1, '19:12', 'avond'], [2, '08:12', 'ochtend'], [3, '14:12', 'middag'], [4, '21:12', 'nacht']]) {
    await startChapter(page, chapter);
    await expect(page.locator('#ps-time')).toHaveText(time);
    await expect(page.locator('#sc-stal')).toHaveClass(new RegExp(`(^|\\s)t-${daypart}(\\s|$)`));
  }
});

test('hoofdstuk 1: van het erf naar de brief van Harm in de Paardenstal', async ({ page }) => {
  await startChapter(page, 1);
  await expect(page.locator('#chap')).toHaveText('Hoofdstuk 1 · Welkom op de Wolddijk');

  // de ladder staat voor het sleutelkastje
  await hs(page, 'kastje');
  await expect(page.locator('#d-txt')).toContainText('Het sleutelkastje', { timeout: 5_000 });
  await skip(page);

  // de dakgoot: 12 meter × 3 mm
  await hs(page, 'roelof'); await skip(page);
  await page.locator('.opt[data-v="3"]').click();
  await expect(page.locator('#g-fb')).toContainText('per meter');
  await page.locator('.opt[data-v="36"]').click();
  await waitModalClosed(page);
  await expect(page.locator('.slot[title="Zaklamp"]')).toBeVisible();

  // het hobbelpaardje en het hoefijzer
  await hs(page, 'paardje'); await skip(page);
  await hs(page, 'hoef'); await skip(page);

  // het sleutelkastje: de postcode
  await hs(page, 'kastje');
  for (const k of ['6', '0', 'OK']) await page.locator(`[data-k="${k}"]`).click();
  await expect(page.locator('#k-fb')).toContainText('huisnummer');
  for (const k of ['9', '7', '8', '4', 'OK']) await page.locator(`[data-k="${k}"]`).click();
  await waitModalClosed(page);

  // naar binnen
  await useSlot(page, 'Sleutel Paardenstal');
  await hs(page, 'stal'); await skip(page);
  await expect(page.locator('#sc-hal')).toHaveClass(/(^|\s)on(\s|$)/);
  await page.waitForTimeout(400);
  // de zaal is voor zaterdagavond
  await hs(page, 'hlzaal');
  await expect(page.locator('#d-txt')).toContainText('zaterdagavond', { timeout: 5_000 });
  await skip(page);
  await walk(page, 'hlstal', 'stal');

  // het hoefijzer, open kant boven
  await useSlot(page, 'Hoefijzer');
  await hs(page, 'haak');
  await page.locator('.opt[data-v="neer"]').click();
  await expect(page.locator('#h-fb')).toContainText('geluk');
  await page.locator('.opt[data-v="op"]').click();
  await waitModalClosed(page);
  await expect(page.locator('#ps-carve')).toBeVisible();

  // de stokmaat: Prins
  await hs(page, 'fotos');
  await expect(page.locator('.horse-photo')).toHaveCount(4);
  await expect(page.locator('.horse-photo figcaption')).toHaveText(['Bles', 'Mina', 'Dirk', 'Prins']);
  await expect(page.locator('.horse-photo use[href="scenes/stal.svg#ps-horse-photo"]')).toHaveCount(4);
  await page.locator('.opt[data-v="Bles"]').click();
  await expect(page.locator('#f-fb')).toContainText('schoft');
  await page.locator('.opt[data-v="Prins"]').click();
  await waitModalClosed(page);

  // eerst donker, dan de zaklamp
  await hs(page, 'prins');
  await expect(page.locator('#d-txt')).toContainText('Pikdonker', { timeout: 5_000 });
  await skip(page);
  await useSlot(page, 'Zaklamp');
  await hs(page, 'prins'); await skip(page);
  await hs(page, 'prins');
  await page.locator('#b-read').click();
  await expect(page.locator('.note-paper')).toContainText('Begin boven');
  await page.locator('#m-close').click();
  await expectWin(page, 'Vrijdagavond · hoofdstuk 1 klaar');
});
