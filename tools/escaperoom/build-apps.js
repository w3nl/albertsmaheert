// Zet het spel (src/escaperoom) klaar voor de apps, en maakt de Chrome-extensie. Draai:
//   node tools/escaperoom/build-apps.js android   → apps/escaperoom/android/app/src/main/assets/game/
//   node tools/escaperoom/build-apps.js linux     → apps/escaperoom/linux/game/ (en zet het versienummer van de snap)
//   node tools/escaperoom/build-apps.js chrome    → dist/escaperoom-chrome/ en dist/albertsmaheert-chrome.zip
// Zonder sw.js: een service worker werkt alleen op http(s), en in een app zit het spel er al in (offline).
// Zie docs/escaperoom-apps.md.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.resolve(__dirname, '..', '..'), game = path.join(root, 'src', 'escaperoom'), apps = path.join(root, 'apps', 'escaperoom');
const gameVersion = +fs.readFileSync(path.join(game, 'js', 'boot.js'), 'utf8').match(/const GAME_VERSION = (\d+);/)[1];
const version = `1.${gameVersion}.0`;   // GAME_VERSION 63 wordt 1.63.0: elke nieuwe spelversie is een nieuwere app

function copyGame(to) {
  fs.rmSync(to, { recursive: true, force: true });
  fs.cpSync(game, to, { recursive: true, filter: src => path.basename(src) !== 'sw.js' });
  return to;
}

const targets = {
  android() {
    copyGame(path.join(apps, 'android', 'app', 'src', 'main', 'assets', 'game'));
    console.log(`Android: spel v${gameVersion} in apps/escaperoom/android/app/src/main/assets/game/`);
  },
  linux() {
    copyGame(path.join(apps, 'linux', 'game'));
    const pkg = path.join(apps, 'linux', 'package.json'), json = JSON.parse(fs.readFileSync(pkg, 'utf8'));
    json.version = version;
    fs.writeFileSync(pkg, JSON.stringify(json, null, 2) + '\n');
    console.log(`Linux: spel v${gameVersion} in apps/escaperoom/linux/game/, snap-versie ${version}`);
  },
  chrome() {
    const dist = path.join(root, 'dist'), out = path.join(dist, 'escaperoom-chrome');
    copyGame(out);
    fs.copyFileSync(path.join(apps, 'chrome', 'background.js'), path.join(out, 'background.js'));
    fs.cpSync(path.join(apps, 'chrome', 'icons'), path.join(out, 'chrome-icons'), { recursive: true });
    const icons = Object.fromEntries([16, 32, 48, 128].map(s => [s, `chrome-icons/icon-${s}.png`]));
    fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify({
      manifest_version: 3,
      name: 'Het Geheim van de Albertsmaheert',
      short_name: 'Albertsmaheert',
      version,
      description: 'Een escaperoom op B&B Albertsmaheert aan de Wolddijk: van de Paardenstal tot het feest in de zaal.',
      homepage_url: 'https://albertsmaheert.nl/',
      icons,
      action: { default_title: 'Speel de escaperoom van de Albertsmaheert', default_icon: icons },
      background: { service_worker: 'background.js' },
    }, null, 2) + '\n');
    const zip = path.join(dist, 'albertsmaheert-chrome.zip');
    fs.writeFileSync(zip, makeZip(out));
    console.log(`Chrome-extensie ${version}: dist/albertsmaheert-chrome.zip (uitgepakt in dist/escaperoom-chrome/)`);
  },
};

const which = process.argv.slice(2);
if (!which.length || which.some(t => !targets[t])) {
  console.error('Gebruik: node tools/escaperoom/build-apps.js android|linux|chrome …');
  process.exit(1);
}
which.forEach(t => targets[t]());

/** Een gewone ZIP (deflate) van alle bestanden in dir, met de bestanden in de hoofdmap, zoals de Chrome Web Store wil. */
function makeZip(dir) {
  const files = [], walk = d => fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
    .forEach(e => e.isDirectory() ? walk(path.join(d, e.name)) : files.push(path.join(d, e.name)));
  walk(dir);
  const parts = [], central = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(path.relative(dir, file).split(path.sep).join('/'));
    const data = fs.readFileSync(file), packed = zlib.deflateRawSync(data, { level: 9 }), crc = zlib.crc32(data);
    const head = (sig, central) => {
      const b = Buffer.alloc(central ? 46 : 30);
      let o = 0; const u32 = v => { b.writeUInt32LE(v >>> 0, o); o += 4; }, u16 = v => { b.writeUInt16LE(v, o); o += 2; };
      u32(sig); if (central) u16(20); u16(20); u16(0x0800); u16(8); u16(0); u16(0x21);   // versie, UTF-8-namen, deflate, 1-1-1980
      u32(crc); u32(packed.length); u32(data.length); u16(name.length); u16(0);
      if (central) { u16(0); u16(0); u16(0); u32(0); u32(offset); }
      return b;
    };
    central.push(head(0x02014b50, true), name);
    parts.push(head(0x04034b50, false), name, packed);
    offset += 30 + name.length + packed.length;
  }
  const cd = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, cd, end]);
}
