// Hulpjes om de escaperoom te spelen in de tests.
const { expect } = require('@playwright/test');

const KEY = 'amh-v1';

/** Begin met een schone browser, eventueel met een opgeslagen spel en vrijgespeelde hoofdstukken (bijv. ['-ch2', '-ch3']). */
async function seed(page, state = null, unlocked = []) {
  await page.goto('./');
  await page.evaluate(([KEY, state, unlocked]) => {
    localStorage.clear();
    localStorage.setItem(KEY + '-norotate', '1');
    unlocked.forEach(k => localStorage.setItem(KEY + k, '1'));
    if (state) localStorage.setItem(KEY, JSON.stringify({ v: 1, inv: [], hl: {}, hints: 0, t: 0, ach: {}, started: true, f: {}, ...state }));
  }, [KEY, state, unlocked]);
  await page.reload();
  await expect(page.locator('#title')).not.toHaveClass(/loading/);
}

/** Begin een hoofdstuk vanaf het titelscherm (hoofdstuk 1 via Nieuw spel). */
async function startChapter(page, n) {
  const unlocked = n > 1 ? Array.from({ length: n - 1 }, (_, i) => '-ch' + (i + 2)) : [];
  await seed(page, null, unlocked);
  await page.locator(n === 1 ? '#btn-new' : '#btn-ch' + n).click();
  await skip(page);
}

/** Klik op een klikvlak (op zijn data-hs) in de kamer die nu te zien is. */
async function hs(page, id) {
  await page.evaluate(id => {
    const scene = [...document.querySelectorAll('.scene')].find(s => s.classList.contains('on'));
    const el = scene && scene.querySelector(`[data-hs="${id}"]`);
    if (!el) throw new Error(`Geen klikvlak "${id}" in deze kamer`);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, id);
  await page.waitForTimeout(120);
}

/** Naar een andere kamer (go() heeft een korte overgang). */
async function walk(page, id, scene) {
  await hs(page, id);
  await expect(page.locator('#sc-' + scene)).toHaveClass(/\bon\b/);
  await page.waitForTimeout(150);
}

/** Klik door de gesprekken tot ze dicht zijn (stopt als er een close-up opengaat). Draait in de pagina zelf. */
async function skip(page, max = 40) {
  await page.evaluate(async max => {
    const dlg = document.querySelector('#dialog'), modal = document.querySelector('#modal');
    for (let i = 0; i < max * 2; i++) {
      if (dlg.hidden || !modal.hidden) return;
      dlg.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise(r => setTimeout(r, 10));
    }
  }, max);
}

/** Kies een ding in je rugzak, op zijn naam. */
async function useSlot(page, name) {
  await page.locator(`.slot[title="${name}"]`).click();
}

/** Wacht tot een close-up vanzelf dichtgaat (na een opgeloste puzzel) en lees dan het gesprek. */
async function waitModalClosed(page) {
  await expect(page.locator('#modal')).toBeHidden({ timeout: 15_000 });
  await skip(page);
}

/** Lees het gesprek aan het eind van een hoofdstuk en controleer het eindscherm. */
async function expectWin(page, eyebrow) {
  await expect(page.locator('#modal')).toBeHidden({ timeout: 15_000 });
  await skip(page);
  await expect(page.locator('#win')).toBeVisible();
  await expect(page.locator('#w-eyebrow')).toHaveText(eyebrow);
  await expect(page.locator('#w-promo a').first()).toHaveAttribute('href', /albertsmaheert\.nl/);
}

module.exports = { KEY, seed, startChapter, hs, walk, skip, useSlot, waitModalClosed, expectWin };
