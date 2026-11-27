// De escaperoom is openbaar: de homepage (NL en EN) toont het blok met de link, en zoekmachines mogen het spel vinden.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', '..', 'src');

test('de homepages tonen het blok van de escaperoom (niet verborgen)', () => {
  for (const [file, link] of [['index.html', './escaperoom/'], ['en/index.html', '../escaperoom/']]) {
    const html = fs.readFileSync(path.join(src, file), 'utf8');
    const block = html.match(/<div class="escaperoom-promo"[^>]*>/);
    expect(block, file).toBeTruthy();
    expect(block[0], file).not.toMatch(/\shidden[\s>=]/);
    expect(html, file).toContain(`href="${link}"`);
  }
});

test('het spel en het privacybeleid mogen gevonden worden (geen noindex)', () => {
  for (const file of ['escaperoom/index.html', 'escaperoom/privacy.html'])
    expect(fs.readFileSync(path.join(src, file), 'utf8'), file).not.toContain('noindex');
});
