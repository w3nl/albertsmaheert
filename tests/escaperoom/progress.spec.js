const { test, expect } = require('@playwright/test');
const { KEY, seed, startChapter, hs, walk, skip } = require('./helpers');

test('je voortgang wordt bewaard en blijft na herladen', async ({ page }) => {
  await seed(page);
  await page.locator('#btn-new').click();
  await skip(page);
  await hs(page, 'paardje');
  await skip(page);
  await page.reload();
  await expect(page.locator('#btn-cont')).toBeVisible();
  await page.locator('#btn-cont').click();
  await expect(page.locator('.slot[title="Hobbelpaardje"]')).toBeVisible();
  await expect(page.locator('#d-who')).toHaveText('Vrijdagavond · Wolddijk 60');
  await expect(page.locator('#d-txt')).toContainText('Terug op het erf', { timeout: 5_000 });
});

test('een geopend overloopkastje met sleutel rondt hoofdstuk 2 na hervatten af', async ({ page }) => {
  await seed(page, { ch: 2, scene: 'zolder', inv: [], f: { introDone: true, katrol: true, telmerk: true, behang: true, prenten: true, kast: true } });
  await expect(page.locator('#zl-kastopen')).toBeVisible();
  await expect(page.locator('#btn-cont')).toHaveText('Door naar hoofdstuk 3');
  expect(await page.evaluate(() => S.inv.includes('oudesleutel'))).toBe(true);
  expect(await page.evaluate(() => stage2())).toBeNull();
  await page.locator('#btn-cont').click();
  await skip(page);
  await expect(page.locator('#chap')).toHaveText('Hoofdstuk 3 · Het museum van Roelof');
});

test('half ingevulde puzzels blijven zoals je ze achterliet', async ({ page }) => {
  await seed(page, { ch: 1, scene: 'erf', f: { introDone: true, goot: true } });
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'kastje');
  for (const k of ['9', '7']) await page.locator(`[data-k="${k}"]`).click();
  await page.locator('#m-close').click();
  await page.reload();
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'kastje');
  await expect(page.locator('#k-lcd')).toHaveText('97··');
  // hoofdstuk 2: de schijfjes van het kastje
  await seed(page, { ch: 2, scene: 'zolder', f: { introDone: true } }, ['-ch2']);
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'kast');
  await page.locator('[data-i="0"][data-d="1"]').click();
  await page.locator('#m-close').click();
  expect(await page.evaluate(KEY => JSON.parse(localStorage.getItem(KEY)).kst2, KEY)).toEqual([1, 0, 0]);
});

test('hints geven eerst een duwtje en dan het antwoord, en worden geteld; het hobbelpaardje is gratis', async ({ page }) => {
  await seed(page);
  await page.locator('#btn-new').click();
  await skip(page);
  await page.locator('#btn-hint').click();
  await expect(page.locator('#d-txt')).toContainText('Hint: Roelof', { timeout: 5_000 });
  await skip(page);
  await page.locator('#btn-hint').click();
  await expect(page.locator('#d-txt')).toContainText('Grote hint: 3 millimeter', { timeout: 5_000 });
  await skip(page);
  await expect(page.locator('#hint-count')).toHaveText('2');
  await hs(page, 'paardje'); await skip(page);
  await page.locator('.slot[title="Hobbelpaardje"]').click();
  await hs(page, 'goot');
  await expect(page.locator('#d-txt')).toContainText('Klok, klok', { timeout: 5_000 });
  await skip(page);
  await expect(page.locator('#hint-count')).toHaveText('2');
});

test('elke stap van elk hoofdstuk heeft twee hints', async ({ page }) => {
  await seed(page);
  const bad = await page.evaluate(() => Object.entries(HINTS).filter(([, h]) => !Array.isArray(h) || h.length !== 2 || h.some(t => !t)).map(([k]) => k));
  expect(bad).toEqual([]);
});

test('scores bewaren het beste resultaat, en hoofdstukken blijven vrijgespeeld', async ({ page }) => {
  await seed(page, { f: { out1: true }, t: 300, hints: 3 });
  await page.evaluate(() => { recordScore(1, 300, 3); recordScore(1, 400, 1); setUnlocked(2); });
  await page.reload();
  await expect(page.locator('#chapters')).toBeVisible();
  await expect(page.locator('#btn-ch2')).toBeVisible();
  await expect(page.locator('#btn-cont')).toHaveText('Door naar hoofdstuk 2');
  await page.locator('#btn-scores').click();
  await expect(page.locator('.scores tbody tr').first()).toContainText('05:00');
  await expect(page.locator('.scores tbody tr').first()).toContainText('1');
});

test('de folder in de brievenbus linkt naar de echte B&B', async ({ page }) => {
  await seed(page, { f: { introDone: true } });
  await page.locator('#btn-cont').click();
  await skip(page);
  await hs(page, 'brievenbus');
  await skip(page);
  await expect(page.locator('.folder')).toContainText('Thedema');
  await expect(page.locator('.folder a.btn').first()).toHaveAttribute('href', 'https://albertsmaheert.nl/reserveer/');
  // elke link naar de echte site opent in een nieuw tabblad, met een pijltje erachter
  const links = await page.evaluate(() => [...document.querySelectorAll('a[href^="https://albertsmaheert.nl"]')]
    .map(a => [a.textContent.trim(), a.target, getComputedStyle(a, '::after').maskImage || getComputedStyle(a, '::after').webkitMaskImage]));
  for (const [text, target, mask] of links) { expect(target, text).toBe('_blank'); expect(mask, text).toContain('svg'); }
});

test('een hoofdstuk houdt zijn stand: terug via het menu is alles nog opgelost; alleen Nieuw spel wist het', async ({ page }) => {
  // hoofdstuk 1 is uitgespeeld (in de Paardenstal), daarna ben je aan hoofdstuk 2 begonnen
  await seed(page, { ch: 1, scene: 'stal', f: { introDone: true, goot: true, post: true, stalOpen: true, hoef: true, schoft: true, licht: true, brief: true, out1: true } });
  await page.evaluate(() => { save(); });
  await page.locator('#btn-cont').click();          // "Door naar hoofdstuk 2"
  await skip(page);
  await expect(page.locator('#chap')).toHaveText('Hoofdstuk 2 · Op de hooizolder');
  await hs(page, 'luik'); await skip(page);
  await page.locator('.opt[data-v="2"]').click();    // de katrol, in hoofdstuk 2
  await expect(page.locator('#modal')).toBeHidden({ timeout: 15_000 });
  await skip(page);

  // terug naar hoofdstuk 1 via het menu: nog steeds opgelost, en je loopt vrij tussen de kamers
  await page.locator('#btn-menu').click();
  await page.locator('#btn-ch1').click();
  await expect(page.locator('#sc-stal')).toHaveClass(/(^|\s)on(\s|$)/);
  await expect(page.locator('#d-txt')).toContainText('Kijk maar rustig rond', { timeout: 5_000 });
  await skip(page);
  expect(await page.evaluate(() => S.f.out1 && S.f.hoef)).toBe(true);
  await expect(page.locator('#ps-carve')).toBeVisible();
  await walk(page, 'uitstal', 'hal');                // na het hoofdstuk loop je vrij: de hal, het erf…
  await walk(page, 'hlbuiten', 'erf');
  await walk(page, 'stal', 'hal');
  await hs(page, 'hltrap');                          // …en de trap in de hal gaat naar hoofdstuk 2
  await page.locator('#m-body .opt', { hasText: 'Door naar hoofdstuk 2' }).click();
  await skip(page);
  // …en daar staat de katrol nog steeds opgelost
  await expect(page.locator('#chap')).toHaveText('Hoofdstuk 2 · Op de hooizolder');
  expect(await page.evaluate(() => S.f.katrol)).toBe(true);

  // Nieuw spel: eerst een vraag, dan alles weer op nul, en hoofdstuk 2 is weer op slot
  await page.evaluate(() => { S.ach.ree = true; save(); });
  await page.locator('#btn-menu').click();
  await page.locator('#btn-new').click();
  await page.locator('#m-body .opt', { hasText: 'Nee' }).click();
  await expect(page.locator('#title')).toBeVisible();
  await page.locator('#btn-new').click();
  await page.locator('#m-body .opt', { hasText: 'Ja, nieuw spel' }).click();
  await skip(page);
  expect(await page.evaluate(() => [S.ch, !!S.f.goot, Object.keys(S.ach).length])).toEqual([1, false, 0]);
  await page.locator('#btn-menu').click();
  await expect(page.locator('#btn-ch2')).toBeHidden();
  await expect(page.locator('#chapters')).toBeHidden();
  expect(await page.evaluate(KEY => [localStorage.getItem(KEY + '-ch2'), localStorage.getItem(KEY + '-st2')], KEY)).toEqual([null, null]);
});

test('in hoofdstuk 4 kom je overal: de hal, het erf, het museum, het dak, de hooizolder en de Paardenstal, zoals aan het eind van hun hoofdstuk', async ({ page }) => {
  await startChapter(page, 4);
  const pick = text => page.locator('#m-body .opt', { hasText: text }).click();
  const say = async text => { await expect(page.locator('#d-txt')).toContainText(text, { timeout: 5_000 }); await skip(page); };

  await walk(page, 'naarhal', 'hal');
  await expect(page.locator('#chap')).toHaveText('Hoofdstuk 4 · De hal');
  // elke lamp kan aan en uit
  await hs(page, 'hllamp');
  await expect(page.locator('#lamp-hl')).toHaveClass(/\boff\b/);
  await expect(page.locator('#sc-hal .hl-glow')).toBeHidden();
  await hs(page, 'hllamp');
  await expect(page.locator('#lamp-hl')).not.toHaveClass(/\boff\b/);
  await expect(page.locator('#sc-hal .hl-glow')).toBeVisible();
  await walk(page, 'hlbuiten', 'erf');
  await expect(page.locator('#sc-erf [data-hs="roelof"]')).toBeHidden();
  await expect(page.locator('#ef-note')).toBeHidden();

  // het museum, met het kistje open en zonder Roelof (die is op het feest)
  await walk(page, 'deeldeur', 'museum');
  await expect(page.locator('#chap')).toHaveText('Hoofdstuk 4 · Het museum van Roelof');
  await expect(page.locator('#mu-kistopen')).toBeVisible();
  await expect(page.locator('#mu-roelof')).toBeHidden();
  await hs(page, 'kistje'); await say('De grup');
  await hs(page, 'bascule'); await say('koperen plaatje');
  await walk(page, 'muladder', 'dak');
  await walk(page, 'naarmuseum', 'museum');
  await walk(page, 'mudeur', 'erf');

  // de hooizolder en de kamers: alles opgelost
  await walk(page, 'stal', 'hal');
  await walk(page, 'hltrap', 'zolder');
  await expect(page.locator('#chap')).toHaveText('Hoofdstuk 4 · Op de hooizolder');
  await expect(page.locator('#zl-roelof')).toBeHidden();
  await hs(page, 'kast'); await say('staat open');
  await walk(page, 'folkerda', 'kamer');
  await expect(page.locator('#km-print')).toBeVisible();
  await expect(page.locator('#km-ditty')).toBeHidden();
  await walk(page, 'kamerdeur', 'zolder');
  await walk(page, 'trap', 'hal');

  // de Paardenstal
  await walk(page, 'hlstal', 'stal');
  await expect(page.locator('#ps-carve')).toBeVisible();
  await hs(page, 'prins'); await say('Leeg nu');
  await walk(page, 'uitstal', 'hal');
  await walk(page, 'hlzaal', 'zaal');
  expect(await page.evaluate(() => S.ch)).toBe(4);

  // en helemaal naar huis
  await walk(page, 'naarhal', 'hal');
  await walk(page, 'hlbuiten', 'erf');
  await hs(page, 'fiets');
  await pick('Terug naar het beginscherm');
  await expect(page.locator('#title')).toBeVisible();
});

test('in hoofdstuk 2 zijn het erf en de Paardenstal open, maar het museum nog niet', async ({ page }) => {
  await startChapter(page, 2);
  await walk(page, 'trap', 'hal');
  await walk(page, 'hlstal', 'stal');
  await expect(page.locator('#chap')).toHaveText('Hoofdstuk 2 · Kamer Paardenstal');
  await walk(page, 'uitstal', 'hal');
  await walk(page, 'hlbuiten', 'erf');
  // het rode bordje en de deeldeuren zelf zijn aanklikbaar, ook al staat het B&B-bord er deels voor
  const sign = await page.locator('#sc-erf text', { hasText: /^Museum$/ }).boundingBox();
  expect(await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.dataset.hs, [sign.x + sign.width / 2, sign.y + sign.height / 2])).toBe('deeldeur');
  expect(await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.dataset.hs, [sign.x + sign.width / 2, sign.y + sign.height * 4])).toBe('deeldeur');
  await page.mouse.click(sign.x + sign.width / 2, sign.y + sign.height / 2);
  await expect(page.locator('#d-txt')).toContainText('Eerst de sleutel', { timeout: 5_000 });
  await skip(page);
  await walk(page, 'stal', 'hal');
  await hs(page, 'hlzaal');
  await expect(page.locator('#d-txt')).toContainText('zaterdagavond', { timeout: 5_000 });
});
