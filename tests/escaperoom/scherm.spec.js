// Alles past in één scherm: geen scrollbalk op computers, laptops, tablets, tv's en telefoons (liggend en rechtop).
const { test, expect } = require('@playwright/test');
const { seed, skip } = require('./helpers');

const SIZES = [
  [1920, 1080], [1536, 864], [1366, 768], [1280, 720], [1280, 800], [1024, 768], [960, 540],
  [915, 412], [844, 390], [740, 360], [768, 1024], [412, 915], [390, 844], [375, 667],
];

for (const [width, height] of SIZES) {
  test(`past zonder scrollen in ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await seed(page);
    await page.locator('#btn-new').click();
    await skip(page, 3);
    const m = await page.evaluate(() => {
      const r = s => document.querySelector(s).getBoundingClientRect();
      return { page: document.documentElement.scrollHeight, wide: document.documentElement.scrollWidth,
        stage: r('.stage').height, tray: r('.tray').bottom, foot: r('.site-foot').bottom };
    });
    expect(m.page, 'de pagina is hoger dan het scherm').toBeLessThanOrEqual(height);
    expect(m.wide, 'de pagina is breder dan het scherm').toBeLessThanOrEqual(width);
    expect(m.foot).toBeLessThanOrEqual(height);
    // en het speelveld krijgt de ruimte: bijna de hele breedte, of een flink deel van de hoogte (op een lage telefoon
    // minder); rechtop op een tablet is de breedte de grens, want het speelveld is 16:9
    const room = Math.min(height * (height < 700 ? .3 : .45), (width - 40) * 9 / 16);
    expect(m.stage).toBeGreaterThan(room);
  });
}
