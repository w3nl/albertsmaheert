const { test, expect } = require('@playwright/test');
const { startChapter, hs, walk, skip, useSlot, waitModalClosed, expectWin } = require('./helpers');

test('de tuin heeft een haag en wilde bloemen langs het terras', async ({ page }) => {
  await startChapter(page, 4);
  await page.evaluate(() => { S.scene = 'tuin'; applyVisuals(); });
  await expect(page.locator('#tn-haag')).toBeVisible();
  await expect(page.locator('#tn-wildflowers')).toBeVisible();
  await expect(page.locator('#tn-terras-tafel')).toBeVisible();
  await expect(page.locator('#tn-terras-stoel')).toBeVisible();
  await expect(page.locator('.tn-table-leg')).toHaveCount(4);
  await expect(page.locator('.tn-chair-leg')).toHaveCount(4);
  const behindFlowers = await page.evaluate(() => !!(document.querySelector('#tn-haas').compareDocumentPosition(document.querySelector('#tn-wildflowers')) & Node.DOCUMENT_POSITION_FOLLOWING));
  expect(behindFlowers).toBe(true);
  await expect(page.locator('#tn-haas g[transform^="translate"]').first()).toHaveAttribute('transform', 'translate(500 690)');
});

test('de bloemenborder-hotspot overlapt de tuindeur niet', async ({ page }) => {
  await startChapter(page, 4);
  await page.evaluate(() => { S.scene = 'tuin'; applyVisuals(); });
  const [door, border] = await page.evaluate(() => [
    ...['naarbinnen', 'border'].map(name => {
      const { x, y, width, height } = document.querySelector(`#sc-tuin [data-hs="${name}"]`).getBBox();
      return { x, y, width, height };
    })
  ]);
  expect(border.x).toBeGreaterThanOrEqual(door.x + door.width);
});

test('hoofdstuk 4: lampjes, tafelschikking, pool, sporen en de schat onder de grup', async ({ page }) => {
  await startChapter(page, 4);
  await expect(page.locator('#chap')).toHaveText('Hoofdstuk 4 · Feest in de zaal');

  // de lampjes: halveren
  await hs(page, 'lampjes');
  for (const b of [8, 12, 10, 11]) { await page.locator(`[data-b="${b}"]`).click(); await page.locator('#lp-meet').click(); }
  await expect(page.locator('#lp-fb')).toContainText('Metingen: 4');
  await page.locator('#lp-vervang').click();
  await waitModalClosed(page);
  await expect(page.locator('#sc-zaal')).toHaveClass(/za-on/);

  // de tafel
  await hs(page, 'tafel');
  const sel = page.locator('#m-body select');
  const optionOrders = await sel.evaluateAll(selects => selects.map(select => [...select.options].slice(1).map(option => option.value)));
  const expectedGuests = ['Buurman Jan', 'Ditty', 'Jij', 'Roelof', 'Tante Grietje'];
  for (const order of optionOrders) expect([...order].sort()).toEqual(expectedGuests);
  expect(new Set(optionOrders.map(order => order.join('|'))).size).toBe(5);
  const seats = async names => { for (let i = 0; i < 5; i++) await sel.nth(i).selectOption(names[i]); await page.locator('#tf-ok').click(); };
  await seats(['Ditty', 'Roelof', 'Tante Grietje', 'Jij', 'Buurman Jan']);
  await expect(page.locator('#tf-fb')).toContainText('Regel 5');
  await seats(['Ditty', 'Roelof', 'Jij', 'Tante Grietje', 'Buurman Jan']);
  await waitModalClosed(page);

  // de grup kan nog niet open
  await hs(page, 'grup');
  await expect(page.locator('#d-txt')).toContainText('vier dikke bouten', { timeout: 5_000 });
  await skip(page);

  // pool, in de hal: ruit 2
  await walk(page, 'naarhal', 'hal');
  await hs(page, 'pool');
  await page.locator('[data-h="200"]').click();
  await expect(page.locator('#pl-fb')).toHaveClass(/bad/);
  await page.locator('[data-h="100"]').click();
  await waitModalClosed(page);
  await expect(page.locator('.slot[title="Dopsleutel"]')).toBeVisible();
  await walk(page, 'hlzaal', 'zaal');

  // de tuin: het spoor van de ree
  await walk(page, 'tuindeur', 'tuin');
  await hs(page, 'sporen');
  await page.locator('.opt[data-v="2"]').click();
  await expect(page.locator('#sr-fb')).toContainText('kat');
  await page.locator('.opt[data-v="1"]').click();
  await waitModalClosed(page);
  await hs(page, 'koevoet'); await skip(page);
  await walk(page, 'naarbinnen', 'zaal');

  // de koevoet eerst gaat niet, dan de dopsleutel en de koevoet
  await useSlot(page, 'Koevoet');
  await hs(page, 'grup');
  await expect(page.locator('#d-txt')).toContainText('bouten', { timeout: 5_000 });
  await skip(page);
  await useSlot(page, 'Dopsleutel');
  await hs(page, 'grup'); await skip(page);
  await useSlot(page, 'Koevoet');
  await hs(page, 'grup'); await skip(page);
  await expect(page.locator('.note-paper')).toContainText('Zet de koffie aan');
  await page.locator('#m-close').click();
  await expectWin(page, 'Zaterdagavond · alle hoofdstukken klaar');
  await expect(page.locator('#btn-next')).toBeHidden();
  await expect(page.locator('#za-foto')).toBeVisible();
});
