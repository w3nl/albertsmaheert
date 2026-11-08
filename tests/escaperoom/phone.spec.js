const { test, expect } = require('@playwright/test');
const { seed, skip } = require('./helpers');

const noSideScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
const panelFits = page => page.locator('.panel').evaluate(e => e.scrollWidth <= e.clientWidth + 1);

test('rechtop: melding om te draaien, een kamer om door te vegen, klikvlakken om op te tikken', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('#rotate')).toBeVisible();
  await expect(page.locator('#rot-line')).not.toBeEmpty();
  expect(await noSideScroll(page)).toBe(true);
  await page.locator('#btn-new').tap();
  await skip(page);
  await expect(page.locator('.swipe')).toBeVisible();
  await page.locator('#pan').evaluate(e => e.scrollLeft = 100);
  const box = await page.locator('#sc-erf [data-hs="roelof"]').boundingBox();
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator('#d-txt')).toContainText('Moi!', { timeout: 5_000 });
  await expect(page.locator('#d-more')).toContainText('tik');
});

/* Elke close-up, rechtop en in de breedte: niets mag breder zijn dan het scherm. */
const CLOSEUPS = [
  [{ ch: 1, scene: 'erf', f: { introDone: true, goot: true } }, [], ['openGoot()', 'openKastje()', 'openHoef()', 'openFotos()', 'openBrief()', 'openFolder()', 'openScores()']],
  [{ ch: 2, scene: 'zolder', f: { introDone: true } }, ['-ch2'], ['openKatrol()', 'openTelmerk()', 'openBehang()', 'openPrenten()', 'openKast()']],
  [{ ch: 3, scene: 'museum', f: { introDone: true } }, ['-ch2', '-ch3'], ['openHarm3()', 'openBascule()', 'openKarn()', 'openSpreuk()', 'openAkkers()', 'openWoord()']],
  [{ ch: 4, scene: 'zaal', f: { introDone: true } }, ['-ch2', '-ch3', '-ch4'], ['openLampjes()', 'openTafel()', 'openPool()', 'openSporen()', 'openFoto()', 'H.gastenboek()']]
];
for (const [w, h] of [[412, 915], [915, 412]]) {
  test(`elke close-up past op een telefoon zonder zijwaarts scrollen (${w}×${h})`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    for (const [state, unlocked, opens] of CLOSEUPS) {
      await seed(page, state, unlocked);
      await page.locator('#btn-cont').tap();
      await skip(page);
      for (const open of opens) {
        await page.evaluate(open);
        await page.waitForTimeout(120);
        expect(await panelFits(page), `${open} is breder dan het scherm`).toBe(true);
        await page.locator('#m-close').tap();
        expect(await noSideScroll(page), `${open} laat de pagina zijwaarts scrollen`).toBe(true);
      }
    }
  });
}
