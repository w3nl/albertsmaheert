// Laat GitHub een app van de escaperoom bouwen en haalt hem op naar dist/, zoals npm run build:aab in tripscouts.
//   npm run build:escaperoom-apk   → dist/escaperoom-apk-<run>/albertsmaheert.apk   (Android: telefoon, tablet, Google TV)
//   npm run build:escaperoom-aab   → dist/escaperoom-aab-<run>/albertsmaheert.aab   (Google Play; vraagt je sleutelwachtwoord)
//   npm run build:escaperoom-snap  → dist/escaperoom-snap-<run>/albertsmaheert.snap (Linux)
// Start de workflow op main (of een andere tak: -- --ref <tak>), wacht tot hij klaar is en downloadt het artefact.
// Nodig: de GitHub CLI (gh, ingelogd met gh auth login); voor de .aab ook 7-Zip (7z) en de secrets van de sleutel
// (docs/escaperoom-sleutels.md). De Chrome-extensie bouw je lokaal: npm run build:escaperoom-chrome.
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { setTimeout: delay } = require('timers/promises');

const root = path.resolve(__dirname, '..', '..');
const KINDS = {
  apk: { workflow: 'escaperoom-android.yml', artifact: 'escaperoom-android', file: 'albertsmaheert.apk' },
  aab: { workflow: 'escaperoom-android.yml', artifact: 'escaperoom-google-play', file: 'albertsmaheert.aab', archive: 'albertsmaheert-google-play.7z' },
  snap: { workflow: 'escaperoom-linux.yml', artifact: 'escaperoom-linux', file: 'albertsmaheert.snap' },
};

function run(command, args, { capture = false } = {}) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit' });
  if (result.error) {
    if (result.error.code === 'ENOENT') throw new Error(`"${command}" niet gevonden. Installeer het en probeer opnieuw.`);
    throw result.error;
  }
  if (result.status !== 0) {
    const details = capture ? result.stderr.trim() : '';
    throw new Error(`${command} stopte met status ${result.status}${details ? `: ${details}` : ''}`);
  }
  return capture ? result.stdout : '';
}

const runs = (workflow, ref) => JSON.parse(run('gh', ['run', 'list', '--workflow', workflow, '--branch', ref,
  '--event', 'workflow_dispatch', '--limit', '10', '--json', 'databaseId'], { capture: true }));

async function main() {
  const args = process.argv.slice(2), kind = KINDS[args[0]];
  const refAt = args.indexOf('--ref'), ref = refAt >= 0 ? args[refAt + 1] : 'main';
  if (!kind || !ref) throw new Error('Gebruik: node tools/escaperoom/gh-build.js apk|aab|snap [--ref <tak>]');

  run('gh', ['auth', 'status']);
  const before = Math.max(0, ...runs(kind.workflow, ref).map(r => Number(r.databaseId)));
  console.log(`Start ${kind.workflow} op ${ref}…`);
  run('gh', ['workflow', 'run', kind.workflow, '--ref', ref]);

  let id = null;
  for (const deadline = Date.now() + 60_000; !id && Date.now() < deadline; await delay(2_000))
    id = (runs(kind.workflow, ref).find(r => Number(r.databaseId) > before) || {}).databaseId;
  if (!id) throw new Error('De nieuwe run is niet gevonden. Kijk bij Actions op GitHub en probeer opnieuw.');

  run('gh', ['run', 'watch', String(id), '--exit-status']);

  const out = path.join(root, 'dist', `escaperoom-${args[0]}-${id}`);
  fs.mkdirSync(out, { recursive: true });
  try {
    run('gh', ['run', 'download', String(id), '--name', kind.artifact, '--dir', out]);
  } catch (e) {
    if (args[0] === 'aab') throw new Error('Geen bundel voor Google Play in deze run: staan ANDROID_KEYSTORE_BASE64 en ANDROID_KEYSTORE_PASSWORD als secrets? Zie docs/escaperoom-sleutels.md.');
    throw e;
  }

  if (kind.archive) {
    const archive = path.join(out, kind.archive);
    if (!fs.existsSync(archive)) throw new Error(`${kind.archive} zat niet in het artefact.`);
    console.log('\nTyp het wachtwoord van je sleutel als 7-Zip erom vraagt:');
    run('7z', ['x', archive, `-o${out}`]);
  }
  const file = path.join(out, kind.file);
  if (!fs.existsSync(file)) throw new Error(`${kind.file} is niet gevonden in ${path.relative(root, out)}.`);
  console.log(`\nKlaar: ${path.relative(root, file)}`);
}

main().catch(error => {
  console.error(`\nBouwen mislukt: ${error.message}`);
  process.exitCode = 1;
});
