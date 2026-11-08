// De instelling Beweging: auto (volgt het apparaat), aan, uit. Alles wat beweegt is een CSS-animatie.
const { test, expect } = require('@playwright/test');
const { KEY, seed, skip } = require('./helpers');

const moving = page => page.evaluate(() => [...document.querySelectorAll('.scene.on *')].filter(e => getComputedStyle(e).animationName !== 'none').length);
const ROOMS = [[1, 'erf'], [1, 'hal'], [1, 'stal'], [2, 'zolder'], [2, 'kamer'], [3, 'museum'], [3, 'dak'], [4, 'zaal'], [4, 'tuin']];

test('de ree op het erf keert om zonder tussendoor in te klappen', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await seed(page, { ch: 1, scene: 'erf', f: { introDone: true } });
  await page.locator('#btn-cont').click();
  await skip(page);
  await page.evaluate(() => { motionPref = 'on'; applyMotion(); });
  const frames = await page.locator('#ef-ree .ree-walk').evaluate(el => el.getAnimations()[0].effect.getKeyframes());
  expect(frames[1].easing).toBe('steps(1)');
  expect(frames[2].transform).toContain('scaleX(-1)');
  expect(frames[3].easing).toBe('steps(1)');
});

test('de ree door het stalraam loopt met stappende poten en knikt met zijn hoofd', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await seed(page);
  await page.locator('#btn-new').click();
  await skip(page);
  await page.evaluate(() => { S.scene = 'stal'; applyVisuals(); });
  await expect(page.locator('#sc-stal')).toHaveClass(/(^|\s)on(\s|$)/);
  await page.evaluate(() => { motionPref = 'on'; applyMotion(); });
  expect(await page.locator('#ps-ree').evaluate(el => getComputedStyle(el.parentElement).animationName)).toBe('reeWalk');
  expect(await page.locator('#ps-ree').evaluate(el => el.parentElement.style.getPropertyValue('--walk'))).toBe('180px');
  expect(await page.locator('.ps-ree-head').evaluate(el => getComputedStyle(el).animationName)).toBe('psReeGraze');
  await expect(page.locator('.ps-ree-leg')).toHaveCount(4);
  expect(await page.locator('.ps-ree-leg').first().evaluate(el => getComputedStyle(el).animationName)).toBe('rlegStep');
});

test('beweging staat standaard aan; Auto en Uit volgen hun instelling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page, { f: { introDone: true } });
  await page.locator('#btn-cont').click();
  await skip(page);
  await expect(page.locator('#btn-motion')).toHaveText('Beweging aan');
  await expect.poll(() => moving(page)).toBeGreaterThan(5);
  await page.locator('#btn-motion').click();
  await expect(page.locator('#btn-motion')).toHaveText('Beweging uit');
  expect(await moving(page)).toBe(0);
  await page.locator('#btn-motion').click();
  await expect(page.locator('#btn-motion')).toHaveText('Beweging auto');
  expect(await moving(page)).toBe(0);
  await page.locator('#btn-motion').click();
  await expect(page.locator('#btn-motion')).toHaveText('Beweging aan');
  await expect.poll(() => moving(page)).toBeGreaterThan(5);
  expect(await page.evaluate(KEY => localStorage.getItem(KEY + '-motion'), KEY)).toBe('on');
});

test('elke kamer leeft, en "Beweging uit" zet alles stil', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await seed(page, { f: { introDone: true } });
  await page.locator('#btn-cont').click();
  await skip(page);
  await page.evaluate(() => { motionPref = 'on'; applyMotion(); });
  for (const [ch, scene] of ROOMS) {
    await page.evaluate(([ch, scene]) => { S.ch = ch; S.scene = scene; S.f = { introDone: true, lampjes: true }; applyVisuals(); }, [ch, scene]);
    expect(await moving(page), scene).toBeGreaterThan(0);
  }
  await page.locator('#btn-motion').click();
  await expect(page.locator('#btn-motion')).toHaveText('Beweging uit');
  for (const [ch, scene] of ROOMS) {
    await page.evaluate(([ch, scene]) => { S.ch = ch; S.scene = scene; applyVisuals(); }, [ch, scene]);
    expect(await moving(page), scene).toBe(0);
  }
});
