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

/* ---------- Logeren bij de Albertsmaheert: de B&B in het spel ----------
   De folder van de B&B (in elk hoofdstuk ergens te vinden, H.folder) en de links Kom logeren, Reserveren en contact
   openen dit venster, zodat je niet uit het spel (of de app) hoeft. Drie tabbladen: De B&B (met de kamers), Reserveren
   en Contact. Reserveren is ECHT: het tabblad toont bovenaan een duidelijke melding en daaronder het formulier van
   bedandbreakfast.nl (dezelfde iframe als op albertsmaheert.nl/reserveer), met internet. Het laadt pas als je dat tabblad
   opent; verder laadt het spel niets van andere sites. */
const BOOK_URL = 'https://www.bedandbreakfast.nl/ibook/v2/66793/nl/black/transparent';
const BNB_ROOMS = [
  ['thedema', 'Thedema', '28 m²', 'Op de oude hooizolder, met een schitterend uitzicht: in de verte de Martinitoren van Groningen. Albertsmaheert hoorde vroeger bij borg Thedema.'],
  ['alma', 'Alma', '26 m²', 'Op de zuidkant van de boerderij, met de oorspronkelijke gebinten en ook uitzicht op de Martinitoren.'],
  ['folkerda', 'Folkerda', '27 m²', 'Uitzicht op de tuin, met in de verte de stad Groningen. Ook hier zie je de oude gebinten.'],
  ['paardenstal', 'Paardenstal', '20 m²', 'Beneden, in de oude paardenstal: fijn als traplopen lastig is. De ramen zitten op het oosten, dus lekker koel in de zomer.'],
];
/* Wat op de kamerpagina's van de site staat (albertsmaheert.nl/accommodation/<kamer>/). */
const ROOM_INFO = {
  thedema: { text: ['Kamer Thedema ligt, net als Alma en Folkerda, op de voormalige hooizolder. Het uitzicht is schitterend: je ziet in de verte de Martinitoren van de stad Groningen.', 'De kamers zijn genoemd naar borgen die vroeger in de buurt stonden. Albertsmaheert hoorde bij borg Thedema.'], bath: ['Douche', 'Bad', 'Toilet', 'Wastafel'] },
  alma: { text: ['Kamer Alma ligt, net als de andere kamers, op de zuidkant van de boerderij. De oorspronkelijke gebinten komen hier goed naar voren.', 'Het uitzicht is schitterend: je ziet in de verte de Martinitoren van de stad Groningen.'], bath: ['Douche', 'Toilet', 'Wastafel'] },
  folkerda: { text: ['Kamer Folkerda kijkt uit op de tuin, met in de verte de stad Groningen.', 'Ook hier zijn de oude gebinten zichtbaar gelaten.'], bath: ['Douche', 'Toilet', 'Wastafel'] },
  paardenstal: { text: ['De Paardenstal is een nieuwe kamer beneden, in de oude paardenstal: heel geschikt voor mensen die traplopen lastig vinden.', 'De ramen zitten aan de oostkant, dus het is er lekker koel in de zomer.'], bath: ['Douche', 'Toilet', 'Wastafel'] },
};
const ROOM_ALL = ['Privé badkamer', 'Gebruik van het gezamenlijke terras en gazon op het zuiden, met onder meer een trampoline en schommels', 'Gebruik van de gezamenlijke recreatiezaal, met onder meer een koffieapparaat, waterkoker, koelkast, tafeltennistafel en pooltafel'];
const ROOM_RULES = ['Inclusief ontbijt', 'Niet roken', 'Huisdieren niet toegestaan', 'Minimaal 2 nachten'];
const ROOM_FEAT = ['TV', 'Zitje', 'Eethoek', 'Verwarming', 'Internet'];
/* Een kamer, zoals op de site: foto, beschrijving, faciliteiten en voorwaarden, en meteen reserveren. */
function openRoom(slug){
  const r = BNB_ROOMS.find(x => x[0] === slug) || BNB_ROOMS[0], [id, name, size] = r, info = ROOM_INFO[id];
  const list = items => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
  openModal('Kamer ' + name, `${size} · 2 personen · B&B Albertsmaheert`, `
    <div class="roominfo">
      <img src="img/kamer-${id}.jpg" alt="Kamer ${name}" width="480" height="329">
      <div>${info.text.map(t => `<p>${t}</p>`).join('')}</div>
    </div>
    <div class="facs">
      <div><h4>Kamer</h4>${list(['Kamergrootte ' + size, ...ROOM_FEAT])}</div>
      <div><h4>Badkamer</h4>${list(info.bath)}</div>
      <div><h4>Voorwaarden</h4>${list(ROOM_RULES)}</div>
      <div><h4>Voor alle gasten</h4>${list(ROOM_ALL)}</div>
    </div>
    <div class="row"><button class="btn" type="button" data-tab="reserveren">Reserveer deze kamer</button>
      <button class="btn ghost" type="button" data-tab="bnb">Alle kamers</button>
      <a class="btn ghost" href="${SITE}accommodation/${id}/" target="_blank" rel="noopener">Meer foto's</a></div>`,
    body => { body.onclick = e => { const t = e.target.closest('[data-tab]'); if(t) openBnB(t.dataset.tab); }; });
}
function bnbTab(tab){
  if(tab === 'reserveren') return `
    <div class="real" role="note"><b>Let op: dit is echt, geen spel</b>
      <p>Hier boek je een <b>echte overnachting</b> bij B&B Albertsmaheert in Noordwolde. Het reserveringsformulier is van
      bedandbreakfast.nl: je aanvraag gaat naar Ditty en Roelof, je krijgt een bevestiging per e-mail, en je betaalt voor je
      verblijf. In het spel verandert er niets door, en je krijgt er geen punten voor.</p></div>
    <div id="book-area">${navigator.onLine === false
      ? '<p class="muted">Je bent nu niet online. Reserveren kan zodra je weer internet hebt, of bel of mail Ditty en Roelof (Contact).</p>'
      : `<div class="book"><div class="book-label">Echte boeking · formulier van bedandbreakfast.nl</div>
        <iframe src="${BOOK_URL}" title="Reserveringsformulier van B&B Albertsmaheert (echte boeking)"></iframe></div>`}
      <p class="muted">Zie je geen formulier? <a href="${SITE}reserveer/" target="_blank" rel="noopener">Reserveer dan op de website</a>, of mail of bel Ditty en Roelof (<button class="linkbtn" type="button" data-tab="contact">Contact</button>).</p>
    </div>`;
  if(tab === 'omgeving') return `
    <div class="folder">
      <p>De omgeving van de Albertsmaheert heeft veel te bieden voor de stille genieter: het fraaie landschap met zijn
      vergezichten, de dijken en de wierden. De boerderij ligt aan een knooppuntenroute en is een mooie uitvalsbasis voor
      fietstochten langs oude waterlopen, hoogholtjes, molens en dijken, over fietspaden dwars door de weilanden. Het
      centrum van Groningen is ongeveer 8 km verderop.</p>
      <h4>Uitstapjes in de buurt</h4>
      <ul>
        <li>Shoppen in de stad Groningen (binnen 10 km sta je in het centrum)</li>
        <li>Tuincentrum Eldorado in Zuidwolde</li>
        <li>De scheefste toren van Europa: de Walfriduskerk in Bedum</li>
        <li>Kanoën over het Boterdiep, het Winsumerdiep of de Oude Ae</li>
        <li>IJs- en zorgboerderij De Golden Raand</li>
      </ul>
      <h4>Wat verder weg</h4>
      <ul>
        <li>Openluchtmuseum Het Hogeland in Warffum</li>
        <li>Museum Het Behouden Blik</li>
        <li>Landgoed De Fraeylemaborg in Slochteren</li>
        <li>Landgoed De Menkemaborg in Uithuizen</li>
        <li>Museum Wierdenland in Ezinge</li>
        <li>Blik-, Trommel- en Oudhedenmuseum in Niezijl</li>
        <li>Schilder Henk Helmantel in Westeremden</li>
        <li>Botanische tuin Domies Toen in Pieterburen</li>
        <li>Abraham's Mosterdmakerij in Eenrum</li>
        <li>Kaarsenmakerij Wilhelmina in Eenrum</li>
        <li>Avonturenpark Waddenfun in Wehe-den Hoorn</li>
      </ul>
      <div class="row"><button class="btn" type="button" data-tab="reserveren">Kom logeren</button>
        <a class="btn ghost" href="${SITE}de-omgeving/" target="_blank" rel="noopener">Op de website</a></div>
    </div>`;
  if(tab === 'contact') return `
    <p>Vragen over een kamer, een feest in de zaal, of de weg? Ditty en Roelof helpen je graag.</p>
    <dl class="contact">
      <dt>E-mail</dt><dd><a href="mailto:ditty@albertsmaheert.nl">ditty@albertsmaheert.nl</a></dd>
      <dt>Telefoon</dt><dd><a href="tel:+31612212622">06 12212622</a></dd>
      <dt>Gastheer en -vrouw</dt><dd>Roelof en Ditty Wigboldus</dd>
      <dt>Adres</dt><dd>Wolddijk 60, 9784 TE Noordwolde (gemeente Het Hogeland), bij Bedum en Groningen</dd>
    </dl>
    <div class="row"><a class="btn ghost" href="https://www.google.com/maps/search/?api=1&query=Wolddijk+60+9784+TE+Noordwolde" target="_blank" rel="noopener">Route</a>
      <a class="btn ghost" href="${SITE}gastenboek/" target="_blank" rel="noopener">Gastenboek</a>
      <button class="btn ghost" type="button" data-tab="omgeving">De omgeving</button></div>
    <p class="muted">Het spel verzamelt niets: zie het <a href="privacy.html">privacybeleid</a>.</p>`;
  return `
    <div class="folder">
      <p>Een boerderij waar al meer dan een eeuw de familie Wigboldus woont. Op de oude hooizolder zijn drie kamers gemaakt, genoemd naar de borgen die hier vroeger in de buurt stonden: <b>Thedema</b>, <b>Alma</b> en <b>Folkerda</b>. Beneden, in de oude paardenstal, is kamer <b>Paardenstal</b>: handig als traplopen lastig is.</p>
      <ul>
        <li>Elke kamer met eigen badkamer, tv en wifi, en extra lange boxsprings</li>
        <li>Ontbijt in de eetzaal; een recreatiezaal met pooltafel, voetbaltafel en tafeltennis</li>
        <li>Een terras op het zuiden met een groot grasveld, een trampoline en schommels. Vaak zie je er reeën</li>
        <li>Aan een knooppuntenroute, ongeveer 8 km van het centrum van Groningen</li>
        <li>De zaal (de vroegere koestal) kun je ook huren voor een feest</li>
      </ul>
      <div class="rooms">${BNB_ROOMS.map(([slug, name, size, text]) => `<button class="room" type="button" data-room="${slug}">
        <img src="img/kamer-${slug}.jpg" alt="Kamer ${name}" loading="lazy" width="480" height="329">
        <div><b>${name}</b> <small>${size} · 2 personen</small><span>${text}</span><em>Meer over ${name} ▸</em></div></button>`).join('')}</div>
      <p>Ditty en Roelof zien je komst met veel plezier tegemoet.</p>
      <div class="row"><button class="btn" type="button" data-tab="reserveren">Kom logeren</button>
        <a class="btn ghost" href="${SITE}bnb/" target="_blank" rel="noopener">Meer foto's</a></div>
    </div>`;
}
function openBnB(tab = 'bnb'){
  const tabs = [['bnb', 'De B&B'], ['omgeving', 'Omgeving'], ['reserveren', 'Reserveren'], ['contact', 'Contact']];
  openModal('Logeren bij de Albertsmaheert', 'Wolddijk 60 · 9784 TE Noordwolde · bij Bedum en Groningen', `
    <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button class="tab${k === tab ? ' on' : ''}" type="button" role="tab" aria-selected="${k === tab}" data-tab="${k}">${l}</button>`).join('')}</div>
    <div class="tab-body" id="bnb-body">${bnbTab(tab)}</div>`, body => {
    // onclick (niet addEventListener): #m-body blijft hetzelfde element als je van tabblad wisselt
    body.onclick = e => {
      const t = e.target.closest('[data-tab]');
      if(t) openBnB(t.dataset.tab);
    };
  });
}
/* Plekken in het spel die naar Logeren leiden (naast de folder, de titel, het eindscherm en de voetregel):
   het bord van de B&B op het erf, het gastenboek in de zaal, het kaartje op de tafel in de kamer en het kaartje op het
   bed van de Paardenstal (de kamer zelf, openRoom), het fietsknooppunt op het erf en de verrekijker op het dak (de
   omgeving), en het knopje "Echt komen logeren?" in het gesprek als Ditty of Roelof praat. */
H.kmkaart = () => {
  poke('#km-kaart', 'g-wiggle', null, 500);
  const k = ['thedema', 'alma', 'folkerda'].includes(S.kamer) ? S.kamer : 'thedema';
  say([`Een kaartje op tafel, in het handschrift van Ditty: "Welkom in ${k[0].toUpperCase() + k.slice(1)}! Hier lees je alles over deze kamer."`], () => openRoom(k));
};
$('#d-stay').onclick = e => { e.stopPropagation(); openBnB('reserveren'); };
/* De oude naam: de folder in de hoofdstukken (H.folder) opent het tabblad De B&B. */
function openFolder(){ openBnB('bnb'); }
/* Links in het spel met data-bnb (Kom logeren, Reserveren, contact) openen het venster in plaats van de website. */
document.addEventListener('click', e => {
  const r = e.target.closest('[data-room]');
  if(r){ e.preventDefault(); openRoom(r.dataset.room); return; }
  const a = e.target.closest('[data-bnb]');
  if(!a) return;
  e.preventDefault();
  openBnB(a.dataset.bnb);
});

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
/* ---------- Installeren: de web-app en de apps, alleen wat past bij dit apparaat ----------
   De knop Installeren (en de link Speel als app op het titelscherm) opent een close-up met de keuzes, zoals de
   installeerbalk van TripScouts en Ardennen:
   - Web-app: een knop als de browser installeren aanbiedt; anders uitleg: Chrome en Edge op de computer en Chromebook
     (het menu ⋮ of …), Android (Toevoegen aan startscherm), Safari op een Mac (Voeg toe aan Dock), Firefox op Windows
     (de taakbalk), en op iPhone/iPad de knop Zo doe je het met de stappen voor dat toestel en die browser
   - Chrome-extensie: in Chrome op een computer of Chromebook (Chrome Web Store)
   - Android-app: op Android en Chromebooks (Google Play; ook Google TV)
   - Linux-app: op een Linux-computer (Snap Store)
   In een app zelf (Android, Linux, de extensie, of de geïnstalleerde web-app) is er niets te installeren: dan geen knop.
   Met een controller of afstandsbediening is de klik nagebootst; dan weigert de browser zijn installeervraag, en leggen
   we het menu van de browser uit. */
const APP_LINKS = {
  play: 'https://play.google.com/store/apps/details?id=nl.albertsmaheert.escaperoom',
  chrome: 'https://chromewebstore.google.com/detail/het-geheim-van-de-alberts/menijigcnfkinaebpnbciflmhehijjnp',
  snap: 'https://snapcraft.io/albertsmaheert',
};
const UA = navigator.userAgent;
const IS_IOS = /iPad|iPhone|iPod/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const IS_IPHONE = /iPhone|iPod/.test(UA);
/** Op iPhone/iPad: in welke browser. "inapp" is een browser in een andere app (WhatsApp, Instagram, Gmail): die kan niets op het beginscherm zetten. */
const IOS_BROWSER = !IS_IOS ? '' : /CriOS\//.test(UA) ? 'chrome' : /FxiOS\/|EdgiOS\/|OPiOS\//.test(UA) ? 'other' : /Safari\//.test(UA) ? 'safari' : 'inapp';
const IS_ANDROID = /Android/i.test(UA);
const IS_CHROMEOS = /\bCrOS\b/.test(UA);
const IS_MAC_SAFARI = /Macintosh/.test(UA) && /Version\/\d+.*Safari\//.test(UA) && !IS_IOS && !/(?:Chrome|Chromium)\//.test(UA);
// Firefox op Windows kan sinds versie 143 een site als web-app aan de taakbalk zetten (op Linux nog niet standaard)
const IS_FIREFOX_WIN = /Windows/.test(UA) && +((UA.match(/Firefox\/(\d+)/) || [])[1] || 0) >= 143;
const IS_LINUX = /Linux/.test(UA) && !IS_ANDROID && !IS_CHROMEOS;
/** Chrome, Edge en andere Chromium-browsers op de computer of Chromebook: die kunnen een web-app installeren. */
const IS_CHROMIUM = /(?:Chrome|Chromium)\//.test(UA) && !IS_ANDROID && !IS_IOS;
/** Alleen Chrome zelf (voor de Chrome Web Store). */
const IS_CHROME = IS_CHROMIUM && !/(?:Edg\/|OPR\/|SamsungBrowser)/.test(UA);
const IN_APP = () => location.hostname === 'appassets.androidplatform.net' || /^(app|chrome-extension):$/.test(location.protocol)
  || matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;
const MENU_HOW = 'Open het menu van de browser (⋮ of …) en kies Installeren (of Toevoegen aan startscherm). Staat hij er al op, dan kies je daar Openen in app.';
let installEvt = null;
/** De keuzes voor dit apparaat, in volgorde: [soort, titel, uitleg, knop] (knop: een link, 'web' of 'how'). */
function installOptions(){
  const o = [];
  if(installEvt) o.push(['web', 'Web-app', 'Op je ' + (IS_ANDROID ? 'startscherm' : IS_CHROMEOS ? 'Chromebook' : 'computer') + ', met een eigen icoon en ook zonder internet. Klein en snel.', 'web']);
  else if(IS_IOS) o.push(['web', 'Web-app', IOS_BROWSER === 'inapp' ? 'Open het spel eerst in Safari; dan zet je het op je beginscherm, met een eigen icoon en ook zonder internet.'
    : 'Op je beginscherm, met een eigen icoon, op volledig scherm en ook zonder internet. Geen App Store nodig.', 'how']);
  else if(IS_ANDROID) o.push(['web', 'Web-app', 'Open het menu van je browser (⋮) en kies Toevoegen aan startscherm of App installeren.', null]);
  else if(IS_CHROMIUM) o.push(['web', 'Web-app', MENU_HOW, null]);
  else if(IS_FIREFOX_WIN) o.push(['web', 'Web-app', 'Klik in de adresbalk van Firefox op het pictogram om de site aan je taakbalk toe te voegen. Dan start hij als eigen app.', null]);
  else if(IS_MAC_SAFARI) o.push(['web', 'Web-app', 'Kies in Safari Archief → Voeg toe aan Dock. Dan start hij als app, ook zonder internet.', null]);
  if(IS_CHROME) o.push(['chrome', 'Chrome-extensie', 'Uit de Chrome Web Store: met één klik vanuit de werkbalk van Chrome, ook zonder internet.', APP_LINKS.chrome]);
  if(IS_ANDROID || IS_CHROMEOS) o.push(['android', 'Android-app', 'Uit Google Play, voor telefoon, tablet' + (IS_CHROMEOS ? ', Chromebook' : '') + ' en Google TV. Speel ook met een controller.', APP_LINKS.play]);
  if(IS_LINUX) o.push(['linux', 'Linux-app', 'Uit de Snap Store (of het App Center van Ubuntu). Speel ook met een controller.', APP_LINKS.snap]);
  return o;
}
function installButton(){
  const can = !IN_APP() && installOptions().length > 0;
  $('#btn-install').hidden = !can;
  const t = $('#title-install'); if(t) t.hidden = !can;
}
/* iPhone en iPad: de stappen, passend bij het toestel en de browser (naar Ardennen Avontuur) */
const ICO_SHARE = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 9H6a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1h-2"/><path d="M12 15V3M8 7l4-4 4 4"/></svg>';
const ICO_ADD = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
function installHowSteps(phone = IS_IPHONE, browser = IOS_BROWSER){
  const where = phone ? 'onderin het scherm. Zie je hem niet? Tik dan eerst op <b>⋯</b> rechtsonder, of veeg een beetje omhoog'
    : 'rechtsboven, naast de adresbalk. Zie je hem niet? Tik dan eerst op <b>⋯</b> naast de adresbalk';
  const share = browser === 'chrome' ? `Tik op <b>Deel</b> ${ICO_SHARE} rechts in de adresbalk.`
    : browser === 'other' ? `Open het menu van je browser en tik op <b>Deel</b> ${ICO_SHARE}. Lukt dat niet? Open <b>albertsmaheert.nl/escaperoom</b> dan in <b>Safari</b>.`
    : `Tik op <b>Deel</b> ${ICO_SHARE}. Die zit ${where}.`;
  const steps = browser === 'inapp' ? [
    `Je hebt het spel geopend vanuit een andere app (zoals WhatsApp). Tik daar op <b>⋯</b> of het kompasje ${phone ? '(bovenin of onderin)' : '(bovenin)'} en kies <b>Open in Safari</b>.`,
    `Tik in Safari op <b>Deel</b> ${ICO_SHARE}. Die zit ${where}.`,
  ] : [share];
  steps.push(
    `Scrol omlaag in het lijstje en tik op <b>Zet op beginscherm</b> ${ICO_ADD}. Staat het er niet? Tik dan eerst op <b>Meer</b> of <b>Bewerk acties</b>.`,
    `Zie je een schakelaar <b>Open als webapp</b>? Laat die aan. Tik dan rechtsboven op <b>Voeg toe</b>.`,
    `Klaar! Open het spel voortaan met het icoon <b>Albertsmaheert</b> op je beginscherm.`);
  return `<ol class="how">${steps.map(s => `<li>${s}</li>`).join('')}</ol>`;
}
function openInstallHow(){
  const dev = IS_IPHONE ? 'iPhone' : 'iPad';
  openModal('Op je beginscherm', dev + ' · één keer doen', `${installHowSteps()}
    <p class="how-tip">Tip: wat je in Safari speelde, staat niet altijd in de app op je beginscherm. Speel na het installeren dus via het icoon.</p>
    <div class="row"><button class="btn ghost" type="button" data-back>Terug</button></div>`,
    body => { body.querySelector('[data-back]').onclick = openInstall; });
}
function openInstall(){
  const label = { android: 'Google Play', linux: 'Snap Store', chrome: 'Chrome Web Store' };
  const rows = installOptions().map(([kind, title, text, act]) => `<div class="inst inst-${kind}"><div><b>${title}</b><span>${text}</span></div>${
    act === 'web' ? '<button class="btn" type="button" data-install>Installeren</button>'
    : act === 'how' ? '<button class="btn" type="button" data-how>Zo doe je het</button>'
    : act ? `<a class="btn" href="${act}" target="_blank" rel="noopener">${label[kind]}</a>` : ''}</div>`).join('');
  openModal('Speel als app', 'Kies wat bij je apparaat past', `<div class="insts">${rows}</div><div class="feedback" id="inst-fb"></div>`, body => {
    const how = body.querySelector('[data-how]');
    if(how) how.onclick = openInstallHow;
    const b = body.querySelector('[data-install]');
    if(b) b.onclick = async e => {
      if(!installEvt) return;
      // met een controller of afstandsbediening weigert de browser zijn installeervraag: leg het menu uit
      if(!e.isTrusted){ fb('#inst-fb', MENU_HOW, ''); return; }
      installEvt.prompt();
      let ok = false;
      try{ ok = (await installEvt.userChoice).outcome === 'accepted'; }catch(err){}
      installEvt = null;
      if(ok) closeModal(); else { b.remove(); fb('#inst-fb', 'Later kan het ook via het menu van je browser.', ''); }
      installButton();
    };
  });
}
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; installButton(); });
window.addEventListener('appinstalled', () => { installEvt = null; installButton(); say([['ditty', "Geïnstalleerd! Nu staat de boerderij gewoon op je apparaat. Maar in het echt is het koffie lekkerder, hoor."]]); });
$('#btn-install').onclick = openInstall;
if($('#title-install')) $('#title-install').onclick = openInstall;
installButton();

start();
