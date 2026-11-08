// Hoofdstukken en eindschermen, de knoppen (hint, toon, geluid, beweging), de klok, prestaties, scores, het titelmenu,
// de installeerbare app en het opstarten. Geladen op volgorde door js/boot.js; alle spelbestanden delen dezelfde ruimte.

/* ---------- hoofdstukken ---------- */
const LAST_CH = 4;   // het nieuwste hoofdstuk; verhoog het als je er een toevoegt
/* Een hoofdstuk openen (menu, "Door naar hoofdstuk N"): in de stand waarin je het achterliet, of vers als je er nog
   nooit was. Opnieuw spelen (FRESH) begint een hoofdstuk echt opnieuw; Nieuw spel (resetAll) wist alles. */
const FRESH = { 1: () => startNew(), 2: () => startCh(2), 3: () => startCh(3), 4: () => startCh(4) };
const START = { 1: () => openChapter(1), 2: () => openChapter(2), 3: () => openChapter(3), 4: () => openChapter(4) };
function openChapter(n, scene){
  const st = loadChapter(n);
  if(!st) return FRESH[n]();
  const ach = Object.assign({}, st.ach, S.ach);
  S = Object.assign(fresh(), st, { ach, started: true }); sel = null;
  if(scene) S.scene = scene;
  recoverPendingChapter2();
  if(n > 1) setUnlocked(n);
  $('#title').hidden = true; $('#win').hidden = true; renderInv(); applyVisuals(); $('#timer').textContent = fmt(S.t); save();
  exitLabels();
  say([['sys', chapterDone() ? tx(STAY[n] || STAY[1], { n: n + 1 }) : contLine()]]);
}
function resetChapters(){ for(let n = 1; n <= LAST_CH; n++){ try{ localStorage.removeItem(KEY + '-st' + n); }catch(e){} } }
/* Waar elk hoofdstuk begint, en het gesprekje waarmee het opent (introN in chapterN.js). */
const CH_START = { 2: ['zolder', () => intro2()], 3: ['museum', () => intro3()], 4: ['zaal', () => intro4()] };
function chapterDone(){ return !!S.f['out' + S.ch]; }
function recoverPendingChapter2(){
  if(S.ch !== 2 || !S.f.kast || S.f.out2) return;
  if(!has('oudesleutel')) S.inv.push('oudesleutel');
  S.f.out2 = true;
  setUnlocked(3);
  save();
}
function nextChapter(){ const f = START[S.ch + 1]; if(f) f(); }
function startCh(n){
  const [scene, intro] = CH_START[n];
  S = Object.assign(fresh(), { ch: n, scene, ach: S.ach || {}, started: true }); sel = null; setUnlocked(n);
  $('#title').hidden = true; $('#win').hidden = true; renderInv(); applyVisuals(); $('#timer').textContent = '00:00'; save(); intro();
}
/* Deuren naar een kamer van een ander hoofdstuk (enterRoom): de close-up bij de keuze, en wat je hoort als hij nog dicht is. */
const DOORS = {
  stal: ['De Paardenstal', 'Jouw kamer van vrijdagavond', "Je kamer, met de oude ruif, de stalbordjes en het extra lange bed."],
  zolder: ['De trap naar de hooizolder', 'Thedema, Alma en Folkerda', "Een smalle, steile trap naar de oude hooizolder, met de gebinten en de drie kamers."],
  museum: ['Het museum van Roelof', 'Achter de grote deeldeuren', "Daarachter staan Roelofs trekkers, de karntonnen, de melkbussen en het kistje van Thedema."],
  dak: ['Het platte dak', 'Door het luik in de dakramen', "Boven de zaal ligt het platte dak, tussen de twee schuren, met uitzicht tot aan de stad."],
  zaal: ['De zaal', 'De oude koestal', "De zaal, waar vroeger de koeien stonden. Zaterdagavond is hier het feest."]
};
const CLOSED = {
  2: "De hooizolder is voor morgenochtend. Nu slapen daar andere gasten: sst!",
  3: () => S.ch === 2 ? [['roelof', "Eerst de sleutel van het kistje vinden! Harm schreef: begin boven."]] : [['roelof', "Mijn museum? Dat laat ik je later dit weekend zien. Nog even geduld!"]],
  4: [['ditty', "Nog niet in de zaal kijken! Het feest is pas zaterdagavond."]]
};
/* Naar een kamer lopen. Kamers van dit en eerdere hoofdstukken zijn open; het volgende hoofdstuk alleen als dit klaar is. */
function enterRoom(scene){
  const n = ROOMS[scene].ch;
  if(n <= S.ch) return go(scene);
  const [title, sub, text] = DOORS[scene], go2 = () => openChapter(n, scene);
  if(n === S.ch + 1 && chapterDone()) return openExit(title, sub, text, [[tx('Door naar hoofdstuk {n}', { n }), CH_NAMES[n - 1], go2]]);
  const c = CLOSED[n];
  say(typeof c === 'function' ? c() : c);
}
const DOOR_LABELS = [['#sc-hal [data-hs="hlstal"]', 'De deur van de Paardenstal', 'stal'], ['#sc-hal [data-hs="hltrap"]', 'De trap naar de hooizolder', 'zolder'],
  ['#sc-hal [data-hs="hlzaal"]', 'De deuren naar de zaal', 'zaal'], ['#sc-erf [data-hs="deeldeur"]', 'De deeldeuren: het museum van Roelof', 'museum'],
  ['#sc-dak [data-hs="naarzaal"]', 'Het luik naar de zaal', 'zaal'], ['#sc-zaal [data-hs="dakraamza"]', 'De dakramen, met het luik naar het platte dak', 'dak']];
/* De deuren zeggen erbij of ze naar een ander hoofdstuk gaan; het bed in de Paardenstal gaat naar hoofdstuk 2. */
function exitLabels(){
  const done = chapterDone();
  DOOR_LABELS.forEach(([sel, label, scene]) => { const m = ROOMS[scene].ch;
    setLabel(sel, label + (m === S.ch + 1 && done ? tx(' · door naar hoofdstuk {m}', { m }) : '')); });
  setLabel('#sc-stal [data-hs="bed"]', done && S.ch === 1 ? 'Het bed: slapen en door naar hoofdstuk 2' : 'Het bed');
}
/* Een uitgang: kies waarheen. opts = [[label, uitleg, actie], …]; "Blijven" (of stay) komt er altijd bij. */
function openExit(title, sub, text, opts, stay = 'Blijven'){
  openModal(title, sub, `<p>${esc(text)}</p><div class="opts" style="grid-template-columns:1fr">${opts.map(([l, s], i) =>
    `<button type="button" class="opt" data-x="${i}"><b>${esc(l)}</b>${s ? `<small>${esc(s)}</small>` : ''}</button>`).join('')}
    <button type="button" class="opt" data-x=""><b>${esc(stay)}</b></button></div>`, body => {
    body.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { const o = opts[b.dataset.x]; closeModal(); if(o) o[2](); });
  });
}
function refreshMenu(){
  const fin = chapterDone();
  $('#btn-cont').hidden = !S.started || (fin && S.ch >= LAST_CH);
  $('#btn-cont').textContent = fin ? tx('Door naar hoofdstuk {n}', { n: S.ch + 1 }) : 'Verder spelen';
  $('#chapters').hidden = !unlocked(2);
  for(let n = 2; n <= LAST_CH; n++) $('#btn-ch' + n).hidden = !unlocked(n);
}

const SITE = 'https://albertsmaheert.nl/';
const CH_END = {
  1: ['Vrijdagavond · hoofdstuk 1 klaar', 'Welkom', "Je hebt de brief van knecht Harm gevonden, uit 1921. Er is ergens op de boerderij iets verstopt… Volgende: zaterdagochtend, op de hooizolder, in de kamers Thedema, Alma en Folkerda.", 'Door naar hoofdstuk 2'],
  2: ['Zaterdagochtend · hoofdstuk 2 klaar', 'Gevonden', "De oude sleutel lag al honderd jaar in het gebint. Volgende: het kistje in het museum van Roelof, en het platte dak tussen de twee schuren.", 'Door naar hoofdstuk 3'],
  3: ['Zaterdagmiddag · hoofdstuk 3 klaar', 'De grup', "Het geheim ligt in de oude koestal, waar nu de zaal is. En vanavond is daar feest… Volgende: hoofdstuk 4.", 'Door naar hoofdstuk 4'],
  4: ['Zaterdagavond · alle hoofdstukken klaar', 'Proost', "De schat van de Albertsmaheert is gevonden! Ditty en Roelof hopen je snel echt te zien, aan de Wolddijk 60 in Noordwolde. Moi!", '']
};
function showWin(){
  if(S.ch < LAST_CH) setUnlocked(S.ch + 1);
  const [eb, ti, note, next] = CH_END[S.ch] || CH_END[1];
  $('#btn-next').hidden = !next; $('#btn-next').textContent = next;
  $('#w-eyebrow').textContent = eb;
  $('#w-title').innerHTML = esc(ti) + '<span class="cursor">!</span>';
  $('#w-note').textContent = note;
  $('#w-promo').hidden = false;
  $('#w-promo-txt').textContent = PROMO[S.ch] || PROMO[1];
  $('#w-time').textContent = fmt(S.t); $('#w-hints').textContent = S.hints;
  $('#w-rank').textContent = rankFor(S.hints);
  recordScore(S.ch, S.t, S.hints);
  $('#w-ach').innerHTML = ACH.map(([k, l]) => `<span class="${S.ach[k] ? 'got' : ''}">${S.ach[k] ? '✓ ' : ''}${l}</span>`).join('');
  $('#win').hidden = false;
}
/* Op elk eindscherm een uitnodiging om echt te komen logeren. */
const PROMO = {
  1: 'De Paardenstal bestaat echt: een B&B-kamer op de begane grond, met de ramen op het oosten.',
  2: 'Thedema, Alma en Folkerda bestaan echt: drie kamers op de oude hooizolder, met de gebinten en uitzicht op de Martinitoren.',
  3: 'Rond het museum van Roelof fiets je zo de knooppuntenroutes in, naar wierden, kerkjes en molens.',
  4: 'Kom echt logeren, of geef je eigen feest in de zaal. Ontbijt inbegrepen, de reeën gratis.'
};

/* ---------- scores: het beste resultaat per hoofdstuk, ook na een nieuw spel (KEY-scores) ---------- */
const SCORES_KEY = KEY + '-scores';
const CH_NAMES = ['Welkom op de Wolddijk', 'Op de hooizolder', 'Het museum van Roelof', 'Feest in de zaal'];
const rankFor = hints => hints === 0 ? 'Grootgrondbezitter' : hints <= 2 ? 'Herenboer' : hints <= 5 ? 'Boerenknecht' : 'Logé';
let scoresMem = null;   // werkt ook als de browser opslaan blokkeert (dan alleen voor dit bezoek)
function getScores(){
  if(!scoresMem){ try{ scoresMem = JSON.parse(localStorage.getItem(SCORES_KEY) || '{}') || {}; }catch(e){ scoresMem = {}; } }
  return scoresMem;
}
/* De snelste tijd en de minste hints worden los bewaard: een snellere ronde met meer hints verbetert toch de tijd. */
function recordScore(ch, t, hints){
  const all = getScores(), old = all[ch];
  all[ch] = { t: old ? Math.min(old.t, t) : t, hints: old ? Math.min(old.hints, hints) : hints };
  try{ localStorage.setItem(SCORES_KEY, JSON.stringify(all)); }catch(e){}
}
function openScores(){
  const all = getScores();
  const rows = CH_NAMES.map((n, i) => { const r = all[i + 1];
    return `<tr class="${r ? '' : 'todo'}"><td><b>${i + 1}</b> ${n}</td>` + (r ? `<td>${fmt(r.t)}</td><td>${r.hints}</td><td>${rankFor(r.hints)}</td>` : `<td colspan="3">Nog niet gespeeld</td>`) + '</tr>'; }).join('');
  const got = ACH.filter(([k]) => S.ach[k]).length;
  openModal('Scores', 'Je beste resultaat per hoofdstuk. Ook een nieuw spel houdt ze.', `
    <table class="scores"><thead><tr><th>Hoofdstuk</th><th>Snelste tijd</th><th>Minste hints</th><th>Rang</th></tr></thead><tbody>${rows}</tbody></table>
    ${Object.keys(all).length ? '' : '<div class="feedback">Nog geen hoofdstuk uitgespeeld. Speel er een uit, dan zie je hier je tijd.</div>'}
    <h4 class="scores-h">${tx('Prestaties ({n} van {m})', { n: got, m: ACH.length })}</h4>
    <div class="ach">${ACH.map(([k, l]) => `<span class="${S.ach[k] ? 'got' : ''}">${S.ach[k] ? '✓ ' : ''}${l}</span>`).join('')}</div>`);
}
$('#btn-scores').onclick = openScores;

$('#btn-hint').onclick = () => {
  if(!$('#title').hidden || chapterDone()) return;
  const st = stage_(); const lv = S.hl[st] || 0; const arr = HINTS[st];
  if(!st || !arr) return;
  S.hints++; S.hl[st] = lv + 1; save(); applyVisuals();
  say([['sys', tx(lv >= arr.length - 1 ? 'Grote hint: {hint}' : 'Hint: {hint}', { hint: arr[Math.min(lv, arr.length - 1)] })]]);
};
const rev = $('#btn-reveal');
rev.onclick = () => { stage.classList.add('reveal'); setTimeout(() => stage.classList.remove('reveal'), 1600); };
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') closeModal();
  if(e.code === 'Space' && $('#modal').hidden && document.activeElement && !/^(INPUT|BUTTON|SELECT|A|TEXTAREA)$/.test(document.activeElement.tagName) && !document.activeElement.classList.contains('hit')){ e.preventDefault(); stage.classList.add('reveal'); }
});
document.addEventListener('keyup', e => { if(e.code === 'Space') stage.classList.remove('reveal'); });
const showSound = () => $('#btn-sound').textContent = soundOn ? 'Geluid aan' : 'Geluid uit';
showSound();
$('#btn-sound').onclick = () => { soundOn = !soundOn; showSound();
  try{ localStorage.setItem(KEY + '-sound', soundOn ? '1' : '0'); }catch(e){}
  ambUpdate(); };

/* ---------- de klok ---------- */
const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
setInterval(() => { if(S.started && !chapterDone() && $('#title').hidden && document.visibilityState === 'visible'){ S.t++; $('#timer').textContent = fmt(S.t); if(S.t % 5 === 0) save(); } }, 1000);

/* ---------- prestaties (verborgen extraatjes) ---------- */
const ACH = [['paardje', 'Raad gevraagd aan het hobbelpaardje'], ['ree', 'Een ree gezien'], ['haas', 'Een haas zien huppelen'], ['moi', 'Moi gezegd'], ['koffie', 'Drie kopjes koffie van Ditty'],
  ['martini', 'De Martinitoren gespot'], ['bed', 'Op een extra lang bed gesprongen'], ['zwaluw', 'De zwaluwen geteld'],
  ['tractor', 'De oude trekker laten tuffen'], ['scheef', 'De scheve toren van Bedum gezien'],
  ['pool', 'Een bal in één keer gepot'], ['trampoline', 'Gesprongen op de trampoline'], ['gastenboek', 'Het gastenboek getekend']];

/* ---------- spelverloop ---------- */
function startNew(){ S = Object.assign(fresh(), { ach: S.ach || {} }); S.started = true; sel = null; $('#title').hidden = true; $('#win').hidden = true; renderInv(); applyVisuals(); $('#timer').textContent = '00:00'; save(); intro1(); }
function contLine(){
  const f = S.f;
  if(S.scene === 'erf') return erfFlags().goot ? "Terug op het erf. De zwaluwen scheren laag over het gras." : "Terug op het erf. Roelof staat nog op de ladder en tikt tegen de dakgoot.";
  if(S.scene === 'stal') return "Terug in kamer Paardenstal. Het ruikt een beetje naar hooi, heel lang geleden.";
  if(S.scene === 'hal') return "Terug in de hal. Op de pooltafel liggen de ballen klaar.";
  if(S.scene === 'zolder') return "Terug op de hooizolder. De oude gebinten kraken zachtjes.";
  if(S.scene === 'kamer') return tx('Terug in kamer {k}.', { k: KAMER_NAAM[S.kamer || 'thedema'] });
  if(S.scene === 'museum') return "Terug in het museum van Roelof. De oude klok tikt.";
  if(S.scene === 'dak') return "Terug op het platte dak. Je ziet kilometers ver over het Groninger land.";
  if(S.scene === 'tuin') return "Terug in de tuin. De lampjes in de bomen branden.";
  return "Terug in de zaal. Het feest is in volle gang.";
}
function cont(){ $('#title').hidden = true; S.started = true; renderInv(); applyVisuals(); $('#timer').textContent = fmt(S.t); say([['sys', contLine()]]); }
/* Nieuw spel: alles terug naar het begin, ook de vrijgespeelde hoofdstukken en de prestaties. Alleen de beste tijden blijven. */
function resetAll(){
  resetChapters();
  for(let n = 2; n <= LAST_CH; n++){ try{ localStorage.removeItem(UNLOCK_KEY(n)); }catch(e){} }
  S.ach = {}; startNew();
}
$('#btn-new').onclick = () => {
  if(!S.started && !unlocked(2)) return resetAll();
  openExit('Nieuw spel', 'Alles weer vanaf het begin', "Je begint helemaal opnieuw: alle hoofdstukken, puzzels en prestaties gaan terug naar het begin, en je speelt de hoofdstukken weer een voor een vrij. Je beste tijden blijven bewaard.",
    [['Ja, nieuw spel', 'Alles wissen en beginnen bij vrijdagavond', resetAll]], 'Nee, terug naar het menu');
};
$('#btn-cont').onclick = () => chapterDone() ? nextChapter() : cont();
$('#btn-again').onclick = () => (FRESH[S.ch] || startNew)();
$('#btn-next').onclick = nextChapter;
for(let n = 1; n <= LAST_CH; n++) $('#btn-ch' + n).onclick = START[n];
const STAY = {
  1: "Kijk maar rustig rond, ook in de hal en op het erf. Klik op het bed om te gaan slapen, of neem in de hal de trap: door naar hoofdstuk {n}.",
  2: "Kijk maar rustig rond op de hooizolder. Het museum (hoofdstuk {n}) is achter de deeldeuren op het erf: de trap af, door de hal naar buiten.",
  3: "Kijk maar rustig rond. Het feest (hoofdstuk {n}) is in de zaal: door het luik op het platte dak, of via het erf en de hal.",
  4: "Kijk maar rustig rond. Het feest gaat nog wel even door, en de reeën kijken mee vanuit de tuin."
};
$('#btn-stay').onclick = () => { $('#win').hidden = true; exitLabels(); say([['sys', tx(STAY[S.ch] || STAY[1], { n: S.ch + 1 })]]); };
function toMenu(){ closeModal(); $('#dialog').hidden = true; queue = []; stopSpeaking(); $('#title').hidden = false; $('#win').hidden = true; refreshMenu(); }
$('#btn-menu').onclick = toMenu;

const ROT_LINES = [
  "Roelof zegt: een gebint staat ook niet op zijn kant. Draai je telefoon en zie de hele kamer.",
  "Het Groninger land is plat en breed. Je scherm mag dat ook zijn.",
  "Ditty heeft de kamer al klaargezet. In de breedte past alles beter.",
  "De ree kijkt ook altijd liggend naar de boerderij. Draai je telefoon maar."
];
function setupRotate(){
  const r = $('#rotate'); let off = false;
  try{ off = localStorage.getItem(KEY + '-norotate') === '1'; }catch(e){}
  r.hidden = off;
  $('#rot-line').textContent = ROT_LINES[Math.floor(Math.random() * ROT_LINES.length)];
  $('#rot-x').onclick = () => { r.hidden = true; beep(500, .04); try{ localStorage.setItem(KEY + '-norotate', '1'); }catch(e){} };
}
const MOTION_NEXT = { auto: 'on', on: 'off', off: 'auto' };
$('#btn-motion').onclick = () => {
  motionPref = MOTION_NEXT[motionPref] || 'auto';
  try{ localStorage.setItem(KEY + '-motion', motionPref); }catch(e){}
  applyMotion();
  say([['sys', motionPref === 'on' ? 'Beweging aan: de zwaluwen vliegen en de bomen wuiven, ook als je apparaat liever minder beweging wil.'
             : motionPref === 'off' ? 'Beweging uit: alles staat stil. Zelfs de ree. Nou ja, bijna.'
             : tx('Beweging auto: het spel volgt de instelling van je apparaat, en dat is nu {now}.', { now: deviceReducesMotion() ? '"minder beweging", dus alles staat stil' : 'alles beweegt' })]]);
};
matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', applyMotion);

/* De folder van de B&B: in elk hoofdstuk ergens te vinden (H.folder). */
function openFolder(){
  openModal('B&B Albertsmaheert', 'Wolddijk 60 · 9784 TE Noordwolde · bij Bedum en Groningen', `
    <div class="folder">
      <p>Een boerderij waar al meer dan een eeuw de familie Wigboldus woont. Op de oude hooizolder zijn drie kamers gemaakt, genoemd naar de borgen die hier vroeger in de buurt stonden: <b>Thedema</b>, <b>Alma</b> en <b>Folkerda</b>. Beneden, in de oude paardenstal, is kamer <b>Paardenstal</b>: handig als traplopen lastig is.</p>
      <ul>
        <li>Elke kamer met eigen badkamer, tv en wifi, en extra lange boxsprings</li>
        <li>Ontbijt in de eetzaal; een recreatiezaal met pooltafel, voetbaltafel en tafeltennis</li>
        <li>Een terras op het zuiden met een groot grasveld, een trampoline en schommels. Vaak zie je er reeën</li>
        <li>Aan een knooppuntenroute, ongeveer 8 km van het centrum van Groningen</li>
        <li>De zaal (de vroegere koestal) kun je ook huren voor een feest</li>
      </ul>
      <p>Ditty en Roelof zien je komst met veel plezier tegemoet.</p>
      <div class="row">
        <a class="btn" href="${SITE}reserveer/" target="_blank" rel="noopener">Reserveren</a>
        <a class="btn ghost" href="${SITE}bnb/" target="_blank" rel="noopener">De kamers</a>
        <a class="btn ghost" href="${SITE}de-omgeving/" target="_blank" rel="noopener">De omgeving</a>
      </div>
    </div>`);
}

function start(data){
  setupRotate();
  if(typeof buildErf === 'function') buildErf();
  applyMotion();
  const saved = (data && data.v === 1) ? data : load();
  if(saved){ S = Object.assign(fresh(), saved); }
  recoverPendingChapter2();
  refreshMenu();
  renderInv(); applyVisuals(); $('#timer').textContent = fmt(S.t);
}
/* ---------- installeerbare app (PWA) ---------- */
let gameSWRegistration = null;
function checkSWUpdate(){
  if(!gameSWRegistration || !navigator.onLine || document.visibilityState !== 'visible') return;
  gameSWRegistration.update().catch(() => {});
}
function watchSWRegistration(registration){
  gameSWRegistration = registration;
  window.addEventListener('online', checkSWUpdate);
  document.addEventListener('visibilitychange', checkSWUpdate);
}
if('serviceWorker' in navigator && document.querySelector('link[rel="manifest"]') && /^https?:$/.test(location.protocol)){
  navigator.serviceWorker.addEventListener('message', e => { if(e.data && e.data.type === 'version') swVersion(e.data.cache); });
  navigator.serviceWorker.register('sw.js').then(watchSWRegistration).catch(() => {});
  navigator.serviceWorker.ready.then(r => {
    watchSWRegistration(r);
    r.active && r.active.postMessage({ type: 'version?' });
  }).catch(() => {});
}
/* De service worker heeft een nieuwere versie dan de code op deze pagina: bied herladen aan (het spel is opgeslagen). */
function swVersion(cache){
  const n = +String(cache).replace(/\D/g, '');
  if(n > GAME_VERSION) $('#update-bar').hidden = false;
}
$('#btn-update').onclick = () => { save(); location.reload(); };
$('#version').textContent = 'v' + GAME_VERSION;
let installEvt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; $('#btn-install').hidden = false; });
window.addEventListener('appinstalled', () => { installEvt = null; $('#btn-install').hidden = true; say([['ditty', "Geïnstalleerd! Nu staat de boerderij gewoon op je apparaat. Maar in het echt is het koffie lekkerder, hoor."]]); });
$('#btn-install').onclick = async () => { if(!installEvt) return; installEvt.prompt(); try{ await installEvt.userChoice; }catch(e){} installEvt = null; $('#btn-install').hidden = true; };

start();
