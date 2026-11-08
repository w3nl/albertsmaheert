const { test, expect } = require('@playwright/test');
const { skip } = require('./helpers');
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..', 'src', 'escaperoom');

test('de escaperoom is een installeerbare app die offline werkt', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(500);
  const cdp = await context.newCDPSession(page);
  const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
  expect(installabilityErrors.filter(e => e.errorId !== 'in-incognito')).toEqual([]);
  const { errors } = await cdp.send('Page.getAppManifest');
  expect(errors).toEqual([]);

  const cached = await page.evaluate(async () => { const keys = await caches.keys(); const c = await caches.open(keys.find(k => k.startsWith('amh-'))); return (await c.keys()).map(r => new URL(r.url).pathname); });
  expect(cached).toEqual(expect.arrayContaining(['/escaperoom/', '/escaperoom/index.html', '/escaperoom/js/core.js', '/escaperoom/scenes/erf.svg', '/escaperoom/scenes/tuin.svg', '/escaperoom/portraits/roelof.svg']));

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#sc-erf')).toBeAttached();
  await page.locator('#btn-new').click();
  await skip(page);
  await expect(page.locator('#chap')).toHaveText('Hoofdstuk 1 · Welkom op de Wolddijk');
  await context.setOffline(false);
});

test('elk bestand in de offline-lijst bestaat, en elk spelbestand staat erin', async () => {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const core = [...sw.match(/const CORE = \[([\s\S]*?)\];/)[1].matchAll(/'\.\/([^']*)'/g)].map(m => m[1]).filter(Boolean);
  for (const f of core) expect(fs.existsSync(path.join(root, f)), f).toBe(true);
  for (const dir of ['js', 'css', 'scenes', 'portraits'])
    for (const f of fs.readdirSync(path.join(root, dir))) expect(core, `${dir}/${f} staat niet in sw.js`).toContain(`${dir}/${f}`);
});

test('het titelscherm toont de versie, en een nieuwere versie biedt herladen aan', async ({ page }) => {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const v = +sw.match(/const CACHE = 'amh-v(\d+)'/)[1];
  await page.goto('./');
  await expect(page.locator('#title')).not.toHaveClass(/loading/);
  await expect(page.locator('#version')).toHaveText('v' + v);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(500);
  await expect(page.locator('#update-bar')).toBeHidden();
  await page.evaluate(v => swVersion('amh-v' + (v + 1)), v);
  await expect(page.locator('#update-bar')).toBeVisible();
});

test('index.html openen vanaf de schijf legt uit dat er een webserver nodig is', async ({ page }) => {
  await page.goto('file://' + path.join(root, 'index.html'));
  await expect(page.locator('#title p.keep')).toContainText('webserver');
  await expect(page.locator('#btn-new')).toBeHidden();
});
