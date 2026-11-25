// Maakt de plaatjes voor de winkels uit het spel zelf. Draai: npm run store:escaperoom (de spelserver start vanzelf).
// docs/escaperoom-store/play/   Google Play: feature-graphic.png (1024×500), tv-banner.png (1280×720) en
//                               screenshot-*.png (1920×1080; voor telefoon, tablet en tv)
// docs/escaperoom-store/chrome/ Chrome Web Store: store-icon.png (128×128), screenshot-*.jpg (1280×800),
//                               small-promo-tile.jpg (440×280), marquee-promo-tile.jpg (1400×560)
// docs/escaperoom-store/snap/   Snap Store: featured-banner.png (720×240); schermafbeeldingen: die van play/
const { chromium } = require('@playwright/test');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..'), game = path.join(root, 'src', 'escaperoom');
const out = path.join(root, 'docs', 'escaperoom-store');
const base = 'http://127.0.0.1:4174/escaperoom/', KEY = 'amh-v1';
const svg = fs.readFileSync(path.join(game, 'icons', 'icon.svg'), 'utf8');
const font = (name, w) => 'data:font/woff2;base64,' + fs.readFileSync(path.join(game, 'fonts', `${name}-latin-${w}-normal.woff2`)).toString('base64');

// Welke kamers: [bestandsnaam, hoofdstuk, kamer]
const SHOTS = [['1-erf', 1, 'erf'], ['2-stal', 1, 'stal'], ['3-zolder', 2, 'zolder'], ['4-museum', 3, 'museum'], ['5-zaal', 4, 'zaal'], ['6-tuin', 4, 'tuin']];

async function room(page, ch, scene) {
  await page.goto(base);
  await page.evaluate(([KEY, ch]) => {
    localStorage.clear();
    localStorage.setItem(KEY + '-norotate', '1');
    for (let n = 2; n <= ch; n++) localStorage.setItem(KEY + '-ch' + n, '1');
  }, [KEY, ch]);
  await page.reload();
  await page.waitForFunction(() => !document.querySelector('#title').classList.contains('loading'));
  await page.click(ch === 1 ? '#btn-new' : '#btn-ch' + ch);
  await page.evaluate(async scene => {
    const d = document.querySelector('#dialog');
    for (let i = 0; i < 60 && !d.hidden; i++) { d.click(); await new Promise(r => setTimeout(r, 15)); }
    if (S.scene !== scene) go(scene);
  }, scene);
  await page.waitForTimeout(1400);
  await page.evaluate(() => { const d = document.querySelector('#dialog'); if (!d.hidden) d.click(); document.querySelector('#tip').hidden = true; });
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.fonts.ready);
}

async function title(page) {
  await page.goto(base);
  await page.evaluate(KEY => { localStorage.clear(); localStorage.setItem(KEY + '-norotate', '1'); }, KEY);
  await page.reload();
  await page.waitForFunction(() => !document.querySelector('#title').classList.contains('loading'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
}

/** Een banner: het pictogram, de naam en een regel tekst, op een kamer uit het spel als achtergrond. */
const banner = (w, h, bg, sub) => { const k = Math.min(h, w * .4); return `<style>
  @font-face{font-family:F;font-weight:600;src:url(${font('fredoka', 600)})}
  @font-face{font-family:H;font-weight:700;src:url(${font('caveat', 700)})}
  body{margin:0} .b{position:relative;width:${w}px;height:${h}px;overflow:hidden;font-family:F;color:#f8f0e0}
  .bg{position:absolute;inset:0;background:url(${bg}) center/cover} .sh{position:absolute;inset:0;background:linear-gradient(90deg,rgba(20,14,9,.92) 0%,rgba(20,14,9,.75) 45%,rgba(20,14,9,.05) 80%)}
  .t{position:absolute;left:${k * .1}px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:${k * .07}px}
  .t svg{width:${k * .42}px;height:${k * .42}px;flex:none}
  h1{margin:0;font-size:${k * .15}px;line-height:1;font-weight:600} p{margin:${k * .03}px 0 0;font:700 ${k * .1}px H;color:#e8b04a}
</style><div class="b"><div class="bg"></div><div class="sh"></div><div class="t">${svg}<div><h1>Het Geheim van de<br>Albertsmaheert</h1><p>${sub}</p></div></div></div>`; };

(async () => {
  // de spelserver (dezelfde als voor de tests), als hij nog niet draait
  let server = null;
  try { await fetch(base); } catch (e) {
    server = spawn(process.execPath, [path.join(root, 'tests', 'escaperoom', 'serve.js')], { stdio: 'ignore' });
    for (let i = 0; i < 50; i++) { try { await fetch(base); break; } catch (e) { await new Promise(r => setTimeout(r, 100)); } }
  }
  const dirs = { play: path.join(out, 'play'), chrome: path.join(out, 'chrome'), snap: path.join(out, 'snap') };
  Object.values(dirs).forEach(d => fs.mkdirSync(d, { recursive: true }));
  const browser = await chromium.launch();
  try {
    // Schermafbeeldingen in 1920×1080 (Google Play en de Snap Store) en 1280×800 (Chrome Web Store)
    const big = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
    const small = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
    await title(big); await big.screenshot({ path: path.join(dirs.play, 'screenshot-0-titel.png') });
    await title(small); await small.screenshot({ path: path.join(dirs.chrome, 'screenshot-0-titel.jpg'), quality: 90 });
    for (const [name, ch, scene] of SHOTS) {
      await room(big, ch, scene);
      await big.screenshot({ path: path.join(dirs.play, `screenshot-${name}.png`) });
      if (['1-erf', '3-zolder', '4-museum', '5-zaal'].includes(name)) {
        await room(small, ch, scene);
        await small.screenshot({ path: path.join(dirs.chrome, `screenshot-${name}.jpg`), quality: 90 });
      }
    }

    // Banners, met de kamer zelf (alleen het plaatje, zonder knoppen) als achtergrond
    await room(big, 1, 'erf');
    const bg = 'data:image/png;base64,' + (await big.locator('#sc-erf').screenshot()).toString('base64');
    const art = await browser.newPage({ deviceScaleFactor: 1 });
    const shot = async (html, file, w, h, opts = {}) => {
      await art.setViewportSize({ width: w, height: h });
      await art.setContent(html);
      await art.evaluate(() => document.fonts.ready);
      await art.screenshot({ path: file, clip: { x: 0, y: 0, width: w, height: h }, ...opts });
    };
    await shot(banner(1024, 500, bg, 'de escaperoom op de boerderij'), path.join(dirs.play, 'feature-graphic.png'), 1024, 500);
    await shot(banner(1280, 720, bg, 'de escaperoom op de boerderij'), path.join(dirs.play, 'tv-banner.png'), 1280, 720);
    await shot(banner(720, 240, bg, 'de escaperoom'), path.join(dirs.snap, 'featured-banner.png'), 720, 240);
    await shot(banner(440, 280, bg, 'de escaperoom'), path.join(dirs.chrome, 'small-promo-tile.jpg'), 440, 280, { type: 'jpeg', quality: 90 });
    await shot(banner(1400, 560, bg, 'de escaperoom op de boerderij'), path.join(dirs.chrome, 'marquee-promo-tile.jpg'), 1400, 560, { type: 'jpeg', quality: 90 });
    // Het winkelpictogram van Chrome: 96×96 tekening met 16 px doorzichtige rand
    await shot(`<body style="margin:0;background:transparent"><div style="padding:16px">${svg.replace('<svg ', '<svg width="96" height="96" ')}</div></body>`,
      path.join(dirs.chrome, 'store-icon.png'), 128, 128, { omitBackground: true });
  } finally {
    await browser.close();
    if (server) server.kill();
  }
  console.log('Winkelplaatjes gemaakt in docs/escaperoom-store/ (play, chrome, snap)');
})();
