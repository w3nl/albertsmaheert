// Drukwerk voor de B&B: een A4-poster en een A4-vel met vier kaartjes (A6) voor op de kamers, met een QR-code naar
// de escaperoom. Maakt docs/escaperoom-print/poster-a4.pdf en kaartjes-a4.pdf. Draai: npm run print:escaperoom
// De QR-code (docs/escaperoom-print/qr-escaperoom.svg) leidt naar https://albertsmaheert.nl/escaperoom/ en is één keer
// gemaakt met het npm-pakket qrcode (zie docs/escaperoom-print/README.md).
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..'), game = path.join(root, 'src', 'escaperoom'), out = path.join(root, 'docs', 'escaperoom-print');
const data = (file, type) => `data:${type};base64,${fs.readFileSync(file).toString('base64')}`;
const font = (name, w) => data(path.join(game, 'fonts', `${name}-latin-${w}-normal.woff2`), 'font/woff2');
const QR = data(path.join(out, 'qr-escaperoom.svg'), 'image/svg+xml');
const ICON = data(path.join(game, 'icons', 'icon.svg'), 'image/svg+xml');
const HERO = data(path.join(root, 'docs', 'escaperoom-store', 'play', 'feature-graphic.png'), 'image/png');
const URL_TEXT = 'albertsmaheert.nl/escaperoom';

const base = `
  @font-face{font-family:F;font-weight:400;src:url(${font('fredoka', 400)})}
  @font-face{font-family:F;font-weight:600;src:url(${font('fredoka', 600)})}
  @font-face{font-family:F;font-weight:700;src:url(${font('fredoka', 700)})}
  @font-face{font-family:H;font-weight:700;src:url(${font('caveat', 700)})}
  @font-face{font-family:M;font-weight:600;src:url(${font('ibm-plex-mono', 600)})}
  *{box-sizing:border-box} html,body{margin:0;padding:0}
  body{font-family:F;color:#24120a;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .qr{background:#fff;padding:3mm;border-radius:2mm}
  .qr img{display:block;width:100%;height:auto}
  .url{font-family:M;font-weight:600;letter-spacing:.04em}
`;

const poster = `<!doctype html><html lang="nl"><head><meta charset="utf-8"><style>${base}
  @page{size:A4;margin:0}
  .page{width:210mm;height:297mm;display:flex;flex-direction:column;background:#f8f0e0}
  .hero{width:100%;height:103mm;background:url(${HERO}) center/cover}
  .body{flex:1;padding:12mm 16mm 10mm;display:flex;flex-direction:column}
  .eyebrow{font-family:M;font-weight:600;font-size:10pt;letter-spacing:.18em;text-transform:uppercase;color:#b4513a}
  h1{font-size:31pt;line-height:1.05;margin:3mm 0 4mm;font-weight:700}
  p{font-size:13pt;line-height:1.45;margin:0 0 3mm}
  .scan{display:flex;gap:9mm;align-items:center;margin-top:auto;background:#2e2218;color:#f8f0e0;border-radius:4mm;padding:7mm}
  .scan .qr{width:66mm;flex:none}
  .scan b{display:block;font-size:22pt;line-height:1.1;margin-bottom:2mm;color:#e8b04a}
  .scan .hand{font-family:H;font-weight:700;font-size:20pt;color:#f8f0e0;margin:2mm 0}
  .scan .url{font-size:12pt;color:#e8b04a}
  .scan small{display:block;font-size:10pt;color:#c9b393;margin-top:3mm;line-height:1.4}
  .foot{margin-top:6mm;font-size:10pt;color:#5e4632;text-align:center}
</style></head><body><div class="page">
  <div class="hero"></div>
  <div class="body">
    <div class="eyebrow">B&amp;B Albertsmaheert · Wolddijk 60 · Noordwolde</div>
    <h1>Speel de escaperoom over deze boerderij!</h1>
    <p><b>Het Geheim van de Albertsmaheert.</b> In de oude paardenstal ligt al honderd jaar een brief van knecht Harm.
      Zoek zijn schat: van de Paardenstal en de hooizolder tot het museum van Roelof, het platte dak en het feest in de zaal.</p>
    <p>Vier hoofdstukken vol puzzels en grapjes, voor het hele gezin. Gratis, zonder reclame, in het Nederlands.
      Speel met je telefoon, tablet of computer, of thuis op de tv.</p>
    <div class="scan">
      <div class="qr"><img src="${QR}" alt=""></div>
      <div><b>Scan en speel</b>
        <div class="hand">Richt de camera van je telefoon op de code</div>
        <div class="url">${URL_TEXT}</div>
        <small>Ook als app voor telefoon, tablet, Chromebook en Linux: kies in het spel <i>Installeren</i>.</small></div>
    </div>
    <div class="foot">Veel plezier! Ditty en Roelof · albertsmaheert.nl</div>
  </div>
</div></body></html>`;

const card = `<div class="card">
  <img class="icon" src="${ICON}" alt="">
  <div class="eyebrow">Een escaperoom over deze boerderij</div>
  <h2>Het Geheim van de Albertsmaheert</h2>
  <div class="qr"><img src="${QR}" alt=""></div>
  <div class="hand">Scan en speel!</div>
  <div class="url">${URL_TEXT}</div>
  <div class="sig">Veel plezier, Ditty en Roelof</div>
</div>`;
const cards = `<!doctype html><html lang="nl"><head><meta charset="utf-8"><style>${base}
  @page{size:A4;margin:0}
  .sheet{width:210mm;height:297mm;display:grid;grid-template-columns:105mm 105mm;grid-template-rows:148.5mm 148.5mm}
  .card{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;padding:9mm 9mm 7mm;background:#f8f0e0;
    outline:.2mm dashed #b9a88f;outline-offset:-.1mm}
  .icon{width:17mm;height:17mm}
  .eyebrow{font-family:M;font-weight:600;font-size:7pt;letter-spacing:.14em;text-transform:uppercase;color:#b4513a;margin-top:3mm}
  h2{font-size:17pt;line-height:1.08;margin:2mm 0 4mm;font-weight:700}
  .qr{width:50mm;border:.4mm solid #e3d8c3}
  .hand{font-family:H;font-weight:700;font-size:19pt;margin-top:3mm;color:#b4513a}
  .url{font-size:8.5pt;margin-top:1mm}
  .sig{margin-top:auto;font-size:9pt;color:#5e4632}
</style></head><body><div class="sheet">${card.repeat(4)}</div></body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [html, file] of [[poster, 'poster-a4.pdf'], [cards, 'kaartjes-a4.pdf']]) {
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: path.join(out, file), format: 'A4', printBackground: true, preferCSSPageSize: true });
    await page.setViewportSize({ width: 794, height: 1123 });
    await page.screenshot({ path: path.join(out, file.replace('.pdf', '.png')), fullPage: false });
  }
  await browser.close();
  console.log('Gemaakt: docs/escaperoom-print/poster-a4.pdf en kaartjes-a4.pdf (met een voorbeeld als .png)');
})();
