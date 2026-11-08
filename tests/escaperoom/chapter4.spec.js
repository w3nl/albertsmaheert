const { test, expect } = require('@playwright/test');
const { startChapter, hs, walk, skip, useSlot, waitModalClosed, expectWin } = require('./helpers');

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
  const seats = async names => { for (let i = 0; i < 5; i++) await sel.nth(i).selectOption(names[i]); await page.locator('#tf-ok').click(); };
  await seats(['Ditty', 'Roelof', 'Tante Grietje', 'Jij', 'Buurman Jan']);
  await expect(page.locator('#tf-fb')).toContainText('Regel 5');
  await seats(['Ditty', 'Roelof', 'Jij', 'Tante Grietje', 'Buurman Jan']);
  await waitModalClosed(page);

  // de grup kan nog niet open
  await hs(page, 'grup');
  await expect(page.locator('#d-txt')).toContainText('vier dikke bouten', { timeout: 5_000 });
  await skip(page);

  // pool: ruit 2
  await hs(page, 'pool');
  await page.locator('[data-h="200"]').click();
  await expect(page.locator('#pl-fb')).toHaveClass(/bad/);
  await page.locator('[data-h="100"]').click();
  await waitModalClosed(page);
  await expect(page.locator('.slot[title="Dopsleutel"]')).toBeVisible();

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
