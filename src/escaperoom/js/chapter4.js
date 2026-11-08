// Hoofdstuk 4: zaterdagavond, het feest in de zaal (de oude koestal) en de tuin op het zuiden. Onder de grup ligt de
// schat van Harm. Geladen door js/boot.js.

Object.assign(ITEMS, {
  dopsleutel: { name:'Dopsleutel', desc:'Roelofs dopsleutel, maat 19. Hij lag al weken in het zakje van de pooltafel.',
    svg:'<svg viewBox="0 0 44 44"><path d="M8 36 L30 14" stroke="#9aa0a6" stroke-width="6" stroke-linecap="round"/><circle cx="33" cy="11" r="7" fill="#7d868f" stroke="#4a4e54" stroke-width="2"/><circle cx="33" cy="11" r="3" fill="#2a2a2a"/></svg>' },
  koevoet: { name:'Koevoet', desc:'Een rode koevoet. Om zware dingen open te wrikken. Roelof vergat hem bij de schommels.',
    svg:'<svg viewBox="0 0 44 44"><path d="M8 38 L34 10 q4 -4 0 -6" stroke="#c4302b" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M8 38 l-2 -6" stroke="#c4302b" stroke-width="6" stroke-linecap="round"/></svg>' }
});
PAARDJE_SAY[4] = ["Op de bar staat het hobbelpaardje, tussen de glazen. Feestelijk!", "Het knikt, alsof het zegt: nog één keer, dan heb je het. Je stopt het in je rugzak."];

const BULBS = 16, BROKEN = 11;   // de slinger: 16 lampjes in serie; lampje 11 is stuk
function buildZaal(){
  const cols = ['#ffd27a', '#e2483d', '#7ad1e8', '#9bd17a'];
  let g = '';
  for(let i = 0; i < BULBS; i++){
    const t = (i + .5) / BULBS * 4, seg = Math.floor(t), u = t - seg;
    const x0 = seg * 400, x = x0 + u * 400, y = 190 + 2 * u * (1 - u) * 60;
    g += `<g class="za-bulb" style="animation-delay:-${(i * .37).toFixed(2)}s"><path d="M${x.toFixed(0)} ${y.toFixed(0)} v8" stroke="#2a2a2a" stroke-width="3"/><ellipse cx="${x.toFixed(0)}" cy="${(y + 16).toFixed(0)}" rx="7" ry="10" data-c="${cols[i % 4]}"/></g>`;
  }
  $('#za-bulbs').innerHTML = g;
}
function applyZaal(){
  const f = S.f;
  if(!$('#za-bulbs').children.length) buildZaal();
  $('#za-bulbs').querySelectorAll('ellipse').forEach(e => e.setAttribute('fill', f.lampjes ? e.dataset.c : '#6a6a6a'));
  $('#sc-zaal').classList.toggle('za-on', !!f.lampjes);
  vis('#za-dark', !f.lampjes);
  vis('#za-gasten', !f.tafel); vis('#hit-gasten', !f.tafel);
  vis('#za-gastenzit', !!f.tafel); vis('#za-benenzit', !!f.tafel); vis('#hit-gastenzit', !!f.tafel);
  vis('#za-bouten', !f.bouten);
  vis('#za-plaat', !f.grupOpen);
  vis('#za-grupblik', !!f.grupOpen && !f.out4);
  vis('#za-foto', !!f.out4); vis('#hit-foto', !!f.out4);
  vis('#za-paardje', !f.paardjeTaken); vis('#hit-zapaardje', !f.paardjeTaken);
}
function applyTuin(){
  vis('#tn-koevoet', !!S.f.sporen && !S.f.koevoetTaken); vis('#hit-koevoet', !!S.f.sporen && !S.f.koevoetTaken);
}

const H3 = { roelof: H.roelof, ditty: H.ditty, pool: H.pool };
Object.assign(H, {
  roelof(h){
    if(S.scene !== 'zaal') return H3.roelof(h);
    const f = S.f;
    if(f.out4) return say([['roelof', "Op Harm! En op iedereen die hier ooit aan tafel zat."]]);
    if(!f.lampjes) return say([['roelof', "De slinger met lampjes doet het niet. Ze zitten in serie: één lampje stuk en de hele slinger is donker."], ['roelof', "Ik heb een tester. Help je zoeken? Klik maar op de lampjes."]]);
    if(!f.tafel) return say([['roelof', "Ditty is druk met de tafel. Ik blijf er maar even uit de buurt, haha."]]);
    if(!f.grupOpen) return say([['roelof', "Zie je die glazen plaat in de vloer? Daaronder ligt een stukje van de oude grup, de mestgoot achter de koeien."],
      ['roelof', 'Vier bouten en een zware plaat. ' + gereedschap()]]);
    say([['roelof', "Open! Kijk, daar in de grup…"]]);
  },
  ditty(h){
    if(S.scene !== 'zaal') return H3.ditty(h);
    S.f.koffie = (S.f.koffie || 0) + 1; save();
    if(S.f.koffie >= 3){ S.ach.koffie = true; save(); }
    if(S.f.out4) return say([['ditty', "Wat een avond! Je bent altijd welkom, hoor. Kom gauw echt logeren. Dan zet ik de koffie klaar."]]);
    if(!S.f.tafel) return say([['ditty', "Help je even met de tafelschikking? Ik heb een lijstje gemaakt, net als vroeger in de klas. Toen ik nog juf was, zette ik ook altijd de kinderen die te veel kletsten niet naast elkaar."]], () => openTafel());
    say([['ditty', "Kopje koffie? Of een glaasje? Het is feest!"]]);
  },
  lampjes(){ if(S.f.lampjes) return say("De lampjes branden in alle kleuren. Gezellig!"); openLampjes(); },
  tafel(){ if(S.f.tafel) return say("De tafel is gedekt en iedereen zit goed. Behalve buurman Jan, die staat steeds op voor een praatje."); openTafel(); },
  gasten(){ say(S.f.tafel ? [['gast', "Proost! Wat een mooie zaal, hè? Hier stonden vroeger de koeien!"]] : [['gast', "Waar moeten we zitten? Ditty is nog aan het puzzelen."]]); },
  koeien(){ say(["Bordjes met koeiennamen: Klaske, Bertha, Trijntje, Grietje, Dina.", "Hier stond elke koe op haar eigen plek, met haar naam erboven. Net als de paarden in de Paardenstal.", ['roelof', "Koeien en schapen hadden we hier vroeger. Later werd het akkerbouw: kool, graan en suikerbieten."]]); },
  stalraam(){ say("Een klein stalraampje met ijzeren roeden. Buiten is het donker; de eerste sterren komen op."); },
  tuindeur(){ go('tuin'); },
  naarhal(){ go('hal'); },
  koffie(){ S.f.koffie = (S.f.koffie || 0) + 1; save(); beep(300, .3, 'sawtooth', .02); if(S.f.koffie >= 3){ S.ach.koffie = true; save(); } say("Het koffieapparaat pruttelt. Een kop koffie, met een koekje erbij. In Groningen hoort dat zo."); },
  gastenboek(){
    S.ach.gastenboek = true; save();
    openModal('Het gastenboek', 'Op de bar · vol met tekeningen en bedankjes', `
      <div class="note-paper" style="font-size:19px"><i>"Heerlijk geslapen in de Paardenstal, en de reeën gezien bij het ontbijt!"</i><br><br><i>"De fietstochten langs de wierden waren prachtig. Tot volgend jaar!"</i><br><br><i>"Thedema is onze favoriete kamer. Die balken!"</i></div>
      <p style="margin-top:10px">Op de site van de Albertsmaheert staat het echte gastenboek. Schrijf jij er ook iets in, als je er geweest bent?</p>
      <div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn" href="${SITE}gastenboek/" target="_blank" rel="noopener">Het echte gastenboek</a><a class="btn ghost" href="${SITE}reserveer/" target="_blank" rel="noopener">Reserveren</a></div>`);
  },
  pool(){ if(S.ch !== 4) return H3.pool(); if(S.f.pool) return say("De pooltafel. De ballen liggen klaar voor een nieuw potje."); openPool(); },
  grup(){
    const f = S.f;
    if(f.out4 || f.grupOpen) return f.out4 ? say("De oude grup, onder het glas. Hier lag Harms schat honderd jaar lang.") : openFoto();
    if(!f.lampjes || !f.tafel) return say(["Een glazen plaat in de vloer. Daaronder zie je een oude goot van stenen.", ['roelof', "Daar komen we zo op. Eerst het feest op gang!"]]);
    say(!f.bouten ? ["Een glazen plaat over de oude grup, met vier dikke bouten.", has('dopsleutel') ? "Gebruik de dopsleutel." : "Daar heb je een dopsleutel voor nodig. Roelof legt zijn spullen altijd ergens neer… en vergeet ze dan."]
      : ["De bouten zijn eruit, maar de plaat is zwaar en zit vast.", has('koevoet') ? "Gebruik de koevoet." : "Daar heb je een koevoet voor nodig. Roelof was vanmiddag in de tuin aan het klussen."]);
  },
  foto(){ openFoto(); },
  /* ---- de tuin ---- */
  naarbinnen(){ go('zaal'); },
  sporen(){ if(S.f.sporen) return say("Spoor 1, het hartjesspoor van de ree, loopt naar de schommels."); openSporen(); },
  koevoet(){ S.f.koevoetTaken = true; give('koevoet'); applyVisuals(); say("In het gras bij de schommels ligt een rode koevoet. Die van Roelof!"); },
  schommel(){ gag('#tn-schommel', 'swing', 3000); say("De schommels. Je geeft er een zetje: ze zwaaien heen en weer, de lange touwen precies even snel als de korte. Nee wacht… dat klopt niet. Het korte touw gaat sneller!"); },
  tramp(){ S.ach.trampoline = true; save(); gag('#tn-tramp', 'boing', 1200); beep(300, .1, 'sine', .05); setTimeout(() => beep(500, .1, 'sine', .05), 300); say("Boing! Boing! BOING! Je springt zo hoog dat je even de Martinitoren ziet."); },
  tnree(){ S.ach.ree = true; save(); gag('#tn-ree', 'look', 2400); say(["De ree staat aan de rand van de tuin, in het maanlicht. Hij kijkt even op, en graast dan rustig verder.", "Ditty zei het al: in de tuin zie je ze bijna elke dag."]); },
  maan(){ say("Een volle, ronde maan boven de weilanden. Geen enkel huis in de weg."); },
  stad2(){ S.ach.martini = true; save(); say("In de verte de lichtjes van Groningen, en de Martinitoren erboven uit."); },
  border(){ say("Een border vol bloemen: lavendel, goudsbloemen, rozen. Ditty's trots. Ook in het donker ruik je ze."); },
  bomen(){ say("Oude fruitbomen met lampjes erin. Appels en peren. Morgen bij het ontbijt misschien appelmoes?"); }
});

/* ---------- puzzel 1: de lampjes (in serie: zoek het kapotte lampje door steeds te halveren) ---------- */
function openLampjes(){
  const st = S.lmp || (S.lmp = { lo: 1, hi: BULBS, n: 0, sel: 0 });
  const draw = () => {
    let g = '';
    for(let i = 1; i <= BULBS; i++){
      const ok = i < st.lo || i > st.hi, x = 14 + (i - 1) * 31;
      g += `<g data-b="${i}" style="cursor:pointer"><rect x="${x - 13}" y="6" width="26" height="62" fill="transparent"/><path d="M${x} 10 v10" stroke="#2a2a2a" stroke-width="3"/><ellipse cx="${x}" cy="32" rx="9" ry="13" fill="${ok ? '#9bd17a' : '#8a8a8a'}" stroke="${st.sel === i ? '#e8b04a' : '#2a2a2a'}" stroke-width="${st.sel === i ? 4 : 2}"/><text x="${x}" y="64" font-size="11" fill="#f8f0e0" text-anchor="middle" font-family="IBM Plex Mono, monospace">${i}</text></g>`;
    }
    return `<svg viewBox="0 0 500 72" class="pz-svg" style="max-width:640px"><path d="M0 10 H500" stroke="#2a2a2a" stroke-width="3"/>${g}</svg>`;
  };
  openModal('De feestverlichting', 'Zestien lampjes in serie · Roelofs tester', `
    <p>Roelof: <i>"In een serieschakeling loopt de stroom door alle lampjes achter elkaar. Is er één stuk, dan is alles donker. Met de tester meet ik of de stroom tot een bepaald lampje komt. Mijn batterij is bijna leeg: hooguit <b>vier</b> metingen!"</i></p>
    <div id="lp-pic">${draw()}</div>
    <p style="font-size:13px;color:var(--muted)">Kies een lampje, en meet of de stroom tot en met dat lampje komt. Groen: daar zit de fout niet.</p>
    <div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn" id="lp-meet">Meten tot hier</button><button type="button" class="btn ghost" id="lp-vervang">Dit lampje vervangen</button></div>
    <div class="feedback" id="lp-fb">${tx('Metingen: {n}', { n: st.n })}</div>`, body => {
    const redraw = () => { $('#lp-pic').innerHTML = draw(); bind(); };
    const bind = () => body.querySelectorAll('[data-b]').forEach(b => b.onclick = () => { st.sel = +b.dataset.b; save(); beep(700, .02); redraw(); });
    bind();
    body.querySelector('#lp-meet').onclick = () => {
      if(!st.sel) return fb('#lp-fb', 'Kies eerst een lampje om tot te meten.', 'bad');
      st.n++; beep(900, .05);
      if(st.n > 4){ st.lo = 1; st.hi = BULBS; st.n = 0; st.sel = 0; save(); redraw(); nope();
        return fb('#lp-fb', 'Piep… de batterij is leeg. Roelof pakt een nieuwe. Probeer het slimmer: meet steeds in het midden, dan halveer je de lampjes die nog kunnen.', 'bad'); }
      if(BROKEN > st.sel){ st.lo = Math.max(st.lo, st.sel + 1); fb('#lp-fb', tx('Piep! De stroom komt tot en met lampje {s}. De fout zit verderop. (Metingen: {n})', { s: st.sel, n: st.n }), ''); }
      else { st.hi = Math.min(st.hi, st.sel); fb('#lp-fb', tx('Stil… de stroom komt niet tot lampje {s}. De fout zit hier of ervoor. (Metingen: {n})', { s: st.sel, n: st.n }), ''); }
      save(); redraw();
    };
    body.querySelector('#lp-vervang').onclick = () => {
      if(!st.sel) return fb('#lp-fb', 'Kies eerst een lampje.', 'bad');
      if(st.sel === BROKEN){ S.f.lampjes = true; save(); fb('#lp-fb', tx('Lampje {s} was het! Roelof draait er een nieuw in…', { s: BROKEN }), 'good'); return solved(lampjesDone, 1600); }
      nope(); fb('#lp-fb', 'Nieuw lampje erin… nog steeds donker. Dat was hem niet. Meet eerst!', 'bad');
    };
  });
}
function lampjesDone(){
  applyVisuals(); chord([523, 659, 784, 1046], 90);
  say(["Floep! De hele slinger springt aan, rood, geel, blauw en groen. De oude koestal glanst.",
       ['roelof', "Zestien lampjes, en in vier keer meten wist je het. Steeds halveren: 16, 8, 4, 2, 1. Zo zoek je alles!"],
       S.f.tafel ? ['ditty', "Prachtig! En de tafel is ook al klaar. Nu kan het feest echt beginnen!"] : ['ditty', "Prachtig! Nu de tafel nog. Help je mij even?"]]);
}
/* Wat Roelof nog mist voor de grup; de puzzels in de zaal en de tuin kunnen in elke volgorde. */
function gereedschap(){
  const sleutel = S.f.bouten || has('dopsleutel'), koevoet = S.f.grupOpen || has('koevoet');
  if(sleutel && koevoet) return "Je hebt mijn dopsleutel en mijn koevoet al gevonden. Dan kan die plaat eraf!";
  if(sleutel) return "Mijn dopsleutel heb je al. Nu mijn koevoet nog: waar heb ik die toch gelaten?";
  if(koevoet) return "Mijn koevoet heb je al. Nu mijn dopsleutel nog: waar heb ik die toch gelaten?";
  return "Ik heb mijn dopsleutel en mijn koevoet nodig, en ik weet niet meer waar ik ze heb gelaten. Vanmiddag was ik in de tuin, en daarvoor aan het poolen in de hal…";
}

/* ---------- puzzel 2: de tafelschikking (logisch redeneren) ---------- */
const GUESTS = ['Ditty', 'Roelof', 'Jij', 'Tante Grietje', 'Buurman Jan'];
function openTafel(){
  const pick = S.tfl || {};
  openModal('De tafelschikking', 'Vijf stoelen op een rij · stoel 1 is bij de keuken', `
    <div class="note-paper" style="font-size:19px">Ditty's lijstje:<br>
      1. Ik zit het dichtst bij de keuken, op stoel 1.<br>
      2. Roelof zit naast mij.<br>
      3. Roelof en buurman Jan niet naast elkaar: dan gaat het de hele avond over trekkers.<br>
      4. Tante Grietje wil naast onze gast zitten.<br>
      5. Maar tante Grietje niet naast Roelof: zijn verhalen zijn haar te lang.<br>
      6. Onze gast zit niet aan het eind van de rij.</div>
    <div class="opts" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr))">${[0, 1, 2, 3, 4].map(i => `
      <label class="opt"><b>${tx('Stoel {n}', { n: i + 1 })}</b><select data-i="${i}" aria-label="${tx('Wie zit op stoel {n}', { n: i + 1 })}"><option value="">?</option>${GUESTS.map(g => `<option ${pick[i] === g ? 'selected' : ''}>${g}</option>`).join('')}</select></label>`).join('')}</div>
    <button type="button" class="btn" id="tf-ok" style="margin-top:12px">Aan tafel!</button>
    <div class="feedback" id="tf-fb"></div>`, body => {
    body.querySelectorAll('select').forEach(s => s.onchange = () => { pick[s.dataset.i] = s.value; S.tfl = pick; save(); });
    body.querySelector('#tf-ok').onclick = () => {
      const seat = n => [0, 1, 2, 3, 4].find(i => pick[i] === n);
      const vals = [0, 1, 2, 3, 4].map(i => pick[i]).filter(Boolean);
      const next = (a, b) => Math.abs(seat(a) - seat(b)) === 1;
      let err = '';
      if(vals.length < 5 || new Set(vals).size < 5) err = 'Iedereen moet precies één stoel hebben.';
      else if(seat('Ditty') !== 0) err = 'Regel 1: Ditty zit op stoel 1, bij de keuken.';
      else if(!next('Roelof', 'Ditty')) err = 'Regel 2: Roelof zit naast Ditty.';
      else if(next('Roelof', 'Buurman Jan')) err = 'Regel 3: Roelof en buurman Jan naast elkaar? Dan hoor je de hele avond alleen nog "pk" en "trekkracht".';
      else if(!next('Tante Grietje', 'Jij')) err = 'Regel 4: tante Grietje wil naast jou zitten.';
      else if(next('Tante Grietje', 'Roelof')) err = 'Regel 5: tante Grietje zit nu naast Roelof. Die verhalen…';
      else if(seat('Jij') === 4) err = 'Regel 6: jij zit aan het eind van de rij.';
      if(err){ nope(); return fb('#tf-fb', err, 'bad'); }
      S.f.tafel = true; save(); fb('#tf-fb', 'Iedereen tevreden! Ditty, Roelof, jij, tante Grietje en buurman Jan.', 'good'); solved(tafelDone, 1700);
    };
  });
}
function tafelDone(){
  applyVisuals();
  say([['ditty', "Zie je wel, dat past precies. Aan tafel, allemaal!"],
       ['gast', "Proost op Ditty en Roelof!"],
       S.f.lampjes ? ['roelof', 'En nu… de grup. Onder die glazen plaat in de vloer. ' + gereedschap()]
                   : ['roelof', "Nu de lampjes nog. In het donker vindt niemand zijn stoel… en ook de grup niet."]]);
}

/* ---------- puzzel 3: de pooltafel (hoek van inval = hoek van terugkaatsing) ---------- */
function openPool(){
  const DIA = [50, 100, 150, 200, 250, 300, 350];
  const draw = h => {
    const path = h ? `<path d="M50 100 L${h} 0 L${Math.min(400, Math.max(0, 3 * h - 100))} 200" stroke="#f8f0e0" stroke-width="2" stroke-dasharray="6 4" fill="none"/>` : '';
    return `<svg viewBox="-20 -20 440 240" class="pz-svg" aria-hidden="true">
      <rect x="-20" y="-20" width="440" height="240" rx="14" fill="#5a3a20"/><rect x="0" y="0" width="400" height="200" fill="#2f8a4a"/>
      ${[[0, 0], [200, 0], [400, 0], [0, 200], [200, 200], [400, 200]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="#0a0a0a"/>`).join('')}
      ${DIA.map((x, i) => `<path d="M${x} -14 l4 6 l-4 6 l-4 -6z" fill="#f6e2a0"/><text x="${x}" y="-17" font-size="0">${i + 1}</text>`).join('')}
      <circle cx="125" cy="150" r="9" fill="#d6242f"/><circle cx="50" cy="100" r="9" fill="#f6f2ea"/>
      <path d="M200 200 m-14 0 a14 14 0 0 1 28 0" stroke="#e8b04a" stroke-width="3" fill="none"/>
      ${path}
      ${DIA.map((x, i) => `<text x="${x}" y="-24" fill="#f8f0e0" font-size="11" text-anchor="middle" font-family="IBM Plex Mono, monospace">${i + 1}</text>`).join('')}
    </svg>`;
  };
  openModal('De pooltafel', 'Neef Sjoerd daagt je uit · "Via de band, in het middenzakje!"', `
    <p>De witte bal moet in het <b>middenzakje onderaan</b>. Maar de rode bal ligt in de weg. Je moet <b>via de bovenband</b> spelen. Op welke ruit (1 tot 7) richt je?</p>
    <p style="font-size:13px;color:var(--muted)">Roelof: "Een bal kaatst van de band zoals licht van een spiegel: de hoek erin is de hoek eruit."</p>
    <div id="pl-pic">${draw(0)}</div>
    <div class="opts" style="grid-template-columns:repeat(7,1fr)">${DIA.map((x, i) => `<button type="button" class="opt" data-h="${x}" style="text-align:center"><b>${i + 1}</b></button>`).join('')}</div>
    <div class="feedback" id="pl-fb"></div>`, body => {
    body.querySelectorAll('[data-h]').forEach(b => b.onclick = () => {
      const h = +b.dataset.h; $('#pl-pic').innerHTML = draw(h); beep(400, .05);
      if(h === 100){ b.classList.add('ok'); S.f.pool = true; S.ach.pool = true; save(); fb('#pl-fb', 'Tok… tok… plop! In het middenzakje. En aan de andere kant rolt er iets uit het zakje…', 'good'); return solved(poolDone, 2200); }
      nope(); fb('#pl-fb', h < 100 ? 'Te steil: de bal komt te ver naar links uit.' : 'Te vlak: de bal schiet voorbij het middenzakje. Tip: spiegel het zakje in de bovenband.', 'bad');
    });
  });
}
function poolDone(){
  applyVisuals(); give('dopsleutel');
  say([['gast', "Wat een stoot! Hé, wat is dat?"],
       "Uit het hoekzakje valt een dopsleutel op de grond.",
       ['roelof', "Mijn dopsleutel! Die zocht ik al weken. Ik leg hem daar altijd even neer als ik ga poolen…"]]);
}

/* ---------- puzzel 4: de sporen in het gras (dierensporen herkennen) ---------- */
function openSporen(){
  const prints = [
    '<path d="M18 40 l6 -22 l6 22z M34 38 l6 -22 l6 22z" fill="#e9dcb8"/>',
    '<circle cx="32" cy="38" r="10" fill="#e9dcb8"/><circle cx="20" cy="22" r="5" fill="#e9dcb8"/><circle cx="28" cy="16" r="5" fill="#e9dcb8"/><circle cx="36" cy="16" r="5" fill="#e9dcb8"/><circle cx="44" cy="22" r="5" fill="#e9dcb8"/>',
    '<ellipse cx="24" cy="30" rx="6" ry="16" fill="#e9dcb8"/><ellipse cx="40" cy="30" rx="6" ry="16" fill="#e9dcb8"/><circle cx="32" cy="54" r="5" fill="#e9dcb8"/>',
    '<path d="M32 50 L16 22 Q32 30 48 22 Z" fill="#e9dcb8"/><path d="M32 50 V28 M24 40 L20 26 M40 40 L44 26" stroke="#c9b48a" stroke-width="2"/>'
  ];
  openModal('Sporen in het gras', 'De tuin, bij maanlicht · het gras is nat van de dauw', `
    <p>Roelof: <i>"Ik was vanmiddag de schommels aan het smeren, toen de ree kwam kijken. Ik schrok zo dat ik weg ben gegaan, en mijn koevoet heb ik laten liggen. Volg het spoor van de ree, dan vind je hem!"</i></p>
    <p style="font-size:14px">Ditty: <i>"Een ree heeft twee smalle, puntige teentjes: samen net een hartje."</i></p>
    <div class="opts" style="grid-template-columns:repeat(4,1fr)">${prints.map((p, i) => `<button type="button" class="opt" data-v="${i + 1}" style="text-align:center"><svg viewBox="0 0 64 64" width="56" height="56">${p}</svg><b>${tx('Spoor {n}', { n: i + 1 })}</b></button>`).join('')}</div>
    <div class="feedback" id="sr-fb"></div>`, body => {
    body.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const v = b.dataset.v;
      if(v === '1'){ b.classList.add('ok'); S.f.sporen = true; save(); fb('#sr-fb', 'Twee puntige teentjes: de ree! Het spoor loopt naar de schommels.', 'good'); return solved(() => { applyVisuals(); say("Je volgt het hartjesspoor door het natte gras, tot bij de schommels. Daar glimt iets roods in het maanlicht."); }, 1700); }
      nope(); fb('#sr-fb', { '2': 'Een rond kussentje met vier teentjes: een kat. Die woont bij de buren.', '3': 'Lange achterpoten en een klein voetje ervoor: een haas.', '4': 'Zwemvliezen: een eend, op weg naar de sloot.' }[v], 'bad');
    });
  });
}

/* ---------- de grup en de schat ---------- */
function grupBouten(){
  if(!S.f.lampjes || !S.f.tafel) return H.grup();
  take('dopsleutel'); S.f.bouten = true; save(); applyVisuals(); beep(500, .05); setTimeout(() => beep(450, .05), 200); setTimeout(() => beep(400, .05), 400); setTimeout(() => beep(350, .05), 600);
  say(["Krrr, krrr, krrr, krrr. Een voor een draai je de vier bouten los.", ['roelof', has('koevoet') ? "Nu nog die zware plaat. Pak mijn koevoet maar!" : "Nu nog die zware plaat. Waar is mijn koevoet…?"]]);
}
function grupOpen(){
  if(!S.f.bouten) return say("De plaat zit nog met vier bouten vast. Eerst die eruit.");
  take('koevoet'); S.f.grupOpen = true; save(); applyVisuals(); beep(200, .3, 'triangle', .05);
  say(["Met de koevoet wrik je de glazen plaat omhoog. Roelof en buurman Jan tillen hem opzij.",
       "In de oude grup, onder honderd jaar stof, staat een groen blikken trommeltje. Net zo een als in de Paardenstal.",
       ['ditty', "Doe open, doe open!"]], () => openFoto());
}
function openFoto(){
  const first = !S.f.out4;
  openModal('De schat van de Albertsmaheert', 'In het trommeltje · een oude foto en een brief', `
    <svg viewBox="0 0 520 260" class="pz-svg" aria-hidden="true" style="filter:sepia(.85) contrast(.95)">
      <rect width="520" height="260" fill="#e2d2a8"/><rect x="10" y="10" width="500" height="240" fill="#cbb98e"/>
      <path d="M10 190 H510 V250 H10Z" fill="#a8946a"/>
      <path d="M60 190 V110 L140 60 L220 110 V190Z" fill="#8a7656"/><rect x="120" y="140" width="34" height="50" fill="#5a4a36"/><rect x="80" y="120" width="26" height="24" fill="#c9b78c"/><rect x="170" y="120" width="26" height="24" fill="#c9b78c"/>
      <path d="M220 190 L260 80 H420 L470 190Z" fill="#7a6a4c"/>
      ${[0, 1, 2, 3, 4].map(i => `<g transform="translate(${250 + i * 26} 198)"><circle cx="0" cy="-46" r="7" fill="#5a4a36"/><path d="M-8 -38 h16 l2 30 h-20z" fill="#4a3a2a"/><path d="M-6 -8 v16 M6 -8 v16" stroke="#3a2a1a" stroke-width="4"/></g>`).join('')}
      <g transform="translate(272 152)"><path d="M-12 -52 C-12 -60 12 -60 12 -52 L22 -54 Q14 -64 -14 -58Z" fill="#2a2420"/></g>
      ${['Bles', 'Mina', 'Dirk', 'Prins'].map((n, i) => `<g transform="translate(${40 + i * 52} 236)"><path d="M-18 -8 c-2 -16 30 -18 32 -2 l6 -16 l6 2 l-4 18 v14 h-4 v-8 h-28 v8 h-4z" fill="#4a3a2a"/><text x="0" y="12" font-size="10" text-anchor="middle" font-family="Caveat, cursive" fill="#e9dcb8">${n}</text></g>`).join('')}
      <text x="440" y="240" font-size="13" font-family="Caveat, cursive" fill="#e9dcb8">Albertsmaheert, 1921</text>
    </svg>
    <div class="note-paper old" style="margin-top:10px">Aan wie hier na ons komt,<br><br>
      Dit is het mooiste wat deze boerderij heeft. Niet het geld en niet het land, maar de mensen aan tafel, de dieren in de stal, en iedereen die hier langskomt.<br><br>
      Zet de koffie aan en laat de deur open.
      <div class="sig">Harm, 1921</div></div>`, null, first ? () => win4() : null);
}

/* ---------- begin en einde ---------- */
function intro4(){
  say([['sys', "Zaterdagavond. De zaal, de oude koestal, staat vol met lange tafels en bloemen. Buiten wordt het donker."],
       ['ditty', "Welkom op ons feest! Familie, buren, gasten: iedereen is er."],
       ['roelof', "Alleen… de feestverlichting doet het niet. En de grup ligt daar maar te wachten, onder die glazen plaat."],
       ['ditty', "Eerst het feest, Roelof. Dan de schat!"]], () => { S.f.introDone = true; save(); });
}
function win4(){
  S.f.out4 = true; save(); applyVisuals(); chord([523,659,784,1046,1318,1568], 110);
  say([['roelof', "Een foto van de boerderij, in 1921. Kijk: de paarden! Bles, Mina, Dirk en Prins. En die man met de pet… dat moet Harm zijn."],
       ['ditty', "\"Zet de koffie aan en laat de deur open.\" Nou, Harm, dat doen we hier nog steeds."],
       ['sys', "Ditty hangt de foto aan de muur van de zaal, naast het stalraampje. Iedereen heft het glas."],
       ['roelof', "Op Harm! En op iedereen die hier aan tafel zit."],
       ['ditty', "En jij: kom gauw terug. Dan maak ik de Paardenstal voor je klaar. Of Thedema, Alma of Folkerda. Moi!"]], showWin);
}

/* Dingen uit je rugzak in hoofdstuk 4 (vanuit useItem in js/items.js). Geeft false als het hier niet over gaat. */
function useItem4(item, hs){
  if(item === 'dopsleutel'){
    if(hs === 'grup') return grupBouten();
    return say("Een dopsleutel, maat 19. Voor bouten. Waar zitten hier bouten?");
  }
  if(item === 'koevoet'){
    if(hs === 'grup') return grupOpen();
    return say(hs === 'pool' ? "Een koevoet als keu? Ditty kijkt je streng aan." : "Een koevoet, om iets zwaars open te wrikken. Iets in de vloer misschien?");
  }
  return false;
}

/* ---------- grapjes in de zaal en de tuin ---------- */
const bomenErf = H.bomen;   // de bomen op het erf (hoofdstuk 1)
Object.assign(H, {
  koeien(){ poke('#za-koeien', 'g-swing', 'Boe!', 160); say(["Bordjes met koeiennamen: Klaske, Bertha, Trijntje, Grietje, Dina. Ze schommelen aan de balk.", "Hier stond elke koe op haar eigen plek, met haar naam erboven. Net als de paarden in de Paardenstal.", ['roelof', "Koeien en schapen hadden we hier vroeger. Later werd het akkerbouw: kool, graan en suikerbieten."]]); },
  buffetkast(){ poke('#za-kast', 'g-shake', 'Rinkel!', 1400); say("De witte buffetkast met het mooie servies. Alles rinkelt als je ertegen stoot. Oei, voorzichtig!"); },
  quilt(){ poke('#za-quilt', 'g-swing'); say("Een quilt met rode en groene lapjes, met de hand gemaakt. Hij wappert even als je erlangs loopt."); },
  kachel(){ poke('#za-hoek', 'g-glow', 'Warm!'); say(["De zithoek: een zwarte bank, een rieten stoel en een kachel die zacht brandt.", "Na het feest is dit de beste plek in de zaal. Met een kop koffie, natuurlijk."]); },
  palen(){ gagText($('#sc-zaal [data-hs="palen"]'), 'Klop klop'); beep(160, .1, 'square', .03); say("Een zware, donkere houten paal op een gemetselde voet. Hij draagt de balken van de oude koestal. Klop klop: massief."); },
  dakraamza(){ poke('#za-dakramen', 'g-glow'); enterRoom('dak'); },
  bar(){ gagText($('#sc-zaal [data-hs="bar"]'), 'Proost!'); beep(1400, .08, 'sine', .04); setTimeout(() => beep(1700, .08, 'sine', .04), 90);
    say("De bar, met krukken en drie zwarte hanglampen. Hier staat de koffie, de thee, en vanavond ook iets feestelijkers."); },
  stalraam(){ say("Een klein stalraampje met een plantje in de vensterbank. Vroeger keken de koeien hierdoor naar buiten. Nu kijkt een geranium."); },
  border(){ poke('#tn-border', 'g-wiggle'); say("Een border vol bloemen: lavendel, goudsbloemen, rozen. Ditty's trots. Ook in het donker ruik je ze."); },
  bomen(h){
    if(S.scene !== 'tuin') return bomenErf(h);
    toggleLamp('tn-lampjes', h);
  },
  terras(){ gagText($('#sc-tuin [data-hs="terras"]'), 'Aaah'); say(["Het terras op het zuiden, met een tafeltje en een stoel. Hier ontbijt je in de zomer met uitzicht over de weilanden.", "Overdag zie je vanaf hier de stad Groningen liggen, 4 kilometer verderop."]); },
  sterren(){ [2400, 2800, 3200].forEach((f, i) => setTimeout(() => beep(f, .05, 'sine', .03), i * 120)); say("Zoveel sterren! Hier op het platteland is het 's nachts echt donker. Zie je de Grote Beer?"); },
  maan(){ poke('#tn-maan', 'g-pop'); say("Een volle, ronde maan boven de weilanden. Als je goed kijkt, knipoogt hij. Of was dat een wolkje?"); },
  egel(){ poke('#tn-egel', 'g-jump', 'Snuf snuf'); beep(900, .04); setTimeout(() => beep(1000, .04), 70);
    say("Een egel scharrelt door het gras, op zoek naar slakken. Hij rolt zich even op tot een stekelbal… en scharrelt dan verder."); },
  tnree(){ S.ach.ree = true; save(); poke('#tn-ree', 'g-jump', null, 900); say(["De ree loopt in het maanlicht door de tuin. Hij kijkt even op, en wandelt dan rustig verder.", "Ditty zei het al: in de tuin zie je ze bijna elke dag."]); },
  koffie(){ S.f.koffie = (S.f.koffie || 0) + 1; save(); poke('#za-koffie', 'g-shake', 'Pruttel'); beep(300, .3, 'sawtooth', .02); if(S.f.koffie >= 3){ S.ach.koffie = true; save(); } say("Het koffieapparaat pruttelt. Een kop koffie, met een koekje erbij. In Groningen hoort dat zo."); }
});
