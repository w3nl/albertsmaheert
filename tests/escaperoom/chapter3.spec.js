const { test, expect } = require('@playwright/test');
const { startChapter, hs, walk, skip, useSlot, waitModalClosed, expectWin } = require('./helpers');

test('de Hydro 84 rijdt achter de boerderij heen en terug en keert om', async ({ page }) => {
  await startChapter(page, 3);
  await page.evaluate(() => { S.scene = 'erf'; applyVisuals(); });
  await expect(page.locator('#ef-hydro84')).toBeVisible();
  await page.evaluate(() => { motionPref = 'on'; applyMotion(); });
  const poseAt = seconds => page.locator('.ef-hydro84-drive').evaluate(async (el, time) => {
    const facing = el.querySelector('.ef-hydro84-facing');
    const driveAnimation = el.getAnimations()[0], faceAnimation = facing.getAnimations()[0];
    driveAnimation.pause(); faceAnimation.pause();
    driveAnimation.currentTime = time * 1000; faceAnimation.currentTime = time * 1000;
    await new Promise(requestAnimationFrame);
    const position = new DOMMatrix(getComputedStyle(el).transform).m41;
    const direction = new DOMMatrix(getComputedStyle(facing).transform).a;
    return { position, facing: direction, opacity: Number(getComputedStyle(el).opacity) };
  }, seconds);
  const rightEnd = await poseAt(.1);
  const outbound = await poseAt(8);
  const leftEnd = await poseAt(18);
  const returnTrip = await poseAt(31);
  expect(rightEnd.position).toBeGreaterThan(150);
  expect(rightEnd.position).toBeLessThan(220);
  expect(rightEnd.facing).toBeGreaterThan(0);
  expect(rightEnd.opacity).toBe(0);
  expect(outbound.position).toBeLessThan(0);
  expect(leftEnd.position).toBe(-1700);
  expect(leftEnd.facing).toBeLessThan(0);
  expect(leftEnd.opacity).toBe(0);
  expect(returnTrip.position).toBeGreaterThan(outbound.position);
  expect(outbound.facing).toBeGreaterThan(0);
  expect(returnTrip.facing).toBeLessThan(0);
  await page.evaluate(() => { S.ch = 4; applyVisuals(); });
  await expect(page.locator('#ef-hydro84')).toBeHidden();
});

test('hoofdstuk 3: het kistje, vier letters en het woord GRUP', async ({ page }) => {
  await startChapter(page, 3);
  await expect(page.locator('#chap')).toHaveText('Hoofdstuk 3 · Het museum van Roelof');
  const floorContacts = await page.evaluate(() => {
    const bottom = el => el.getBBox().y + el.getBBox().height;
    const cans = document.querySelector('#mu-melk'), cansBox = cans.getBBox();
    const cansShift = cans.transform.baseVal.consolidate().matrix.f;
    return {
      floor: document.querySelector('#mu-floor-edge').getBBox().y,
      hay: bottom(document.querySelector('#mu-balen')),
      ladder: bottom(document.querySelector('#mu-ladder')),
      cans: bottom(cans) + cansShift
    };
  });
  expect(floorContacts.hay).toBe(floorContacts.floor);
  expect(floorContacts.ladder).toBe(floorContacts.floor);
  expect(floorContacts.cans).toBe(floorContacts.floor);
  const rockingHorseContact = await page.evaluate(() => {
    const horse = document.querySelector('#mu-paardje');
    const box = horse.getBBox();
    const matrix = horse.transform.baseVal.consolidate().matrix;
    const horseBottom = matrix.f + (box.y + box.height) * matrix.d;
    const baleTop = Math.min(...[...document.querySelectorAll('#mu-balen rect')].map(rect => rect.getBBox().y));
    return { horseBottom, baleTop };
  });
  expect(Math.abs(rockingHorseContact.horseBottom - rockingHorseContact.baleTop)).toBeLessThan(1);
  await expect(page.locator('#mu-stuurwiel')).toHaveAttribute('aria-label', 'Stuurwiel met drie spaken');
  await expect(page.locator('#mu-stuurwiel path')).toHaveCount(3);
  await expect(page.locator('#mu-hydro84-pass')).toBeVisible();
  expect(await page.locator('#mu-hydro84-pass .mu-hydro84-drive').evaluate(el => getComputedStyle(el).animationName)).toBe('muHydroPass');

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
