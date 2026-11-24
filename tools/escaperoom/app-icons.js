// Maakt de pictogrammen van de escaperoom-apps uit src/escaperoom/icons/icon.svg: de Android-pictogrammen, de banner
// voor het startscherm van Google TV (320×180) en de pictogrammen van de Chrome-extensie. Draai: npm run icons:escaperoom
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..'), game = path.join(root, 'src', 'escaperoom');
const res = path.join(root, 'apps', 'escaperoom', 'android', 'app', 'src', 'main', 'res');
const svg = fs.readFileSync(path.join(game, 'icons', 'icon.svg'), 'utf8');
const font = w => 'data:font/woff2;base64,' + fs.readFileSync(path.join(game, 'fonts', `fredoka-latin-${w}-normal.woff2`)).toString('base64');

const icon = size => `<body style="margin:0;background:transparent"><div style="width:${size}px;height:${size}px">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</div></body>`;
const banner = `<style>
  @font-face{font-family:F;font-weight:600;src:url(${font(600)})} @font-face{font-family:F;font-weight:400;src:url(${font(400)})}
  body{margin:0} .b{width:320px;height:180px;background:#1e1610;display:flex;align-items:center;gap:10px;padding:0 14px;box-sizing:border-box;font-family:F;color:#f8f0e0}
  .b svg{width:96px;height:96px;flex:none} h1{margin:0;font-size:24px;font-weight:600;line-height:1} p{margin:6px 0 0;font-size:15px;color:#e8b04a}
</style><div class="b">${svg}<div><h1>Albertsmaheert</h1><p>de escaperoom</p></div></div>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const shot = async (html, file, w, h) => {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(html);
    await page.evaluate(() => document.fonts.ready);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    await page.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
  };
  for (const [dir, size] of [['mipmap-mdpi', 48], ['mipmap-hdpi', 72], ['mipmap-xhdpi', 96], ['mipmap-xxhdpi', 144], ['mipmap-xxxhdpi', 192]])
    await shot(icon(size), path.join(res, dir, 'ic_launcher.png'), size, size);
  await shot(banner, path.join(res, 'drawable-xhdpi', 'banner.png'), 320, 180);
  for (const size of [16, 32, 48, 128])
    await shot(icon(size), path.join(root, 'apps', 'escaperoom', 'chrome', 'icons', `icon-${size}.png`), size, size);
  await browser.close();
  console.log('Pictogrammen gemaakt in apps/escaperoom/android/app/src/main/res/ en apps/escaperoom/chrome/icons/');
})();
