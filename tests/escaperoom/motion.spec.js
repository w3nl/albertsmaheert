// De instelling Beweging: auto (volgt het apparaat), aan, uit. Alles wat beweegt is een CSS-animatie.
const { test, expect } = require('@playwright/test');
const { KEY, seed, skip } = require('./helpers');

const moving = page => page.evaluate(() => [...document.querySelectorAll('.scene.on *')].filter(e => getComputedStyle(e).animationName !== 'none').length);
const ROOMS = [[1, 'erf'], [1, 'stal'], [2, 'zolder'], [2, 'kamer'], [3, 'museum'], [3, 'dak'], [4, 'zaal'], [4, 'tuin']];

test('apparaten die minder beweging willen staan stil, tenzij je "Beweging aan" kiest', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page, { f: { introDone: true } });
  await page.locator('#btn-cont').click();
  await skip(page);
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
  for (const [ch, scene] of ROOMS) {
    await page.evaluate(([ch, scene]) => { S.ch = ch; S.scene = scene; S.f = { introDone: true, lampjes: true }; applyVisuals(); }, [ch, scene]);
    expect(await moving(page), scene).toBeGreaterThan(0);
  }
  await page.locator('#btn-motion').click();
  await page.locator('#btn-motion').click();
  await expect(page.locator('#btn-motion')).toHaveText('Beweging uit');
  for (const [ch, scene] of ROOMS) {
    await page.evaluate(([ch, scene]) => { S.ch = ch; S.scene = scene; applyVisuals(); }, [ch, scene]);
    expect(await moving(page), scene).toBe(0);
  }
});
