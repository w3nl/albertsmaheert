// Hoofdstuk 2: zaterdagochtend op de hooizolder. De overloop met de gebinten (zolder) en de drie kamers Thedema, Alma
// en Folkerda (kamer: één tekening, met per kamer ander behang, een andere prent en andere dingen). Geladen door js/boot.js.

const KAMER_NAAM = { thedema: 'Thedema', alma: 'Alma', folkerda: 'Folkerda' };
const KAMER_BEDSPREI = { thedema: 'url(#kmBedThedema)', alma: 'url(#kmPlaid)', folkerda: 'url(#kmBedFolkerda)' };
/* Het teken dat Harm in elke kamer in het gebint kerfde: telmerken (I = 1, Λ = 5, X = 10), en wat ze betekenen. */
const MERK = { thedema: ['ΛII', 7], alma: ['IIII', 4], folkerda: ['XI', 11] };

Object.assign(ITEMS, {
  oudesleutel: { name:'Oude sleutel', desc:'Een zware ijzeren sleutel met een krul, honderd jaar verstopt in het gebint. Voor het kistje van Thedema.',
    svg:'<svg viewBox="0 0 44 44"><circle cx="11" cy="22" r="7" fill="none" stroke="#5a5f66" stroke-width="4"/><circle cx="11" cy="22" r="2.5" fill="#5a5f66"/><path d="M18 22 h20 M30 22 v7 M35 22 v5 M38 22 v8" stroke="#5a5f66" stroke-width="4" stroke-linecap="round"/></svg>' }
});
PAARDJE_SAY[2] = ["Op de baal stro staat het hobbelpaardje! Ditty heeft het vanochtend vast hier neergezet.",
  "Het knikt alweer. Je stopt het in je rugzak: laat het iets zien als je vastzit."];

function applyZolder(){
  const f = F(2), here = S.ch === 2;
  veil('zolder', .3);
  vis('#zl-roelof', !!f.katrol && here); vis('#hit-zlroelof', !!f.katrol && here);
  vis('#zl-kist', !!f.katrol); vis('#hit-zlkist', !!f.katrol);
  vis('#zl-rope', !f.katrol); vis('#zl-hook', !f.katrol);
  vis('#zl-kast', !f.kast); vis('#zl-kastopen', !!f.kast);
  vis('#zl-paardje', !f.paardjeTaken); vis('#hit-zlpaardje', !f.paardjeTaken);
}
function applyKamer(){
  const f = F(2), k = S.kamer || 'thedema';
  veil('kamer', .3);
  ['thedema', 'alma', 'folkerda'].forEach(n => vis('#km-wall-' + n, k === n));
  $('#km-bedspread').setAttribute('fill', KAMER_BEDSPREI[k] || KAMER_BEDSPREI.thedema);
  const hung = !!f.prenten;
  vis('#km-print', hung); vis('#km-print-empty', !hung);
  $('#km-print-use').setAttribute('href', '#km-borg-' + k);
  $('#km-print-cap').textContent = { thedema: 'Thedema in 1622', alma: 'Alma te Noordwolde', folkerda: 'Folkerda te Dijkshorn' }[k];
  vis('#km-loose', k === 'alma' && !f.behang); vis('#hit-loose', k === 'alma' && !f.behang);
  vis('#km-rieten', k === 'alma' || k === 'folkerda'); vis('#hit-rieten', k === 'alma' || k === 'folkerda');
  vis('#km-prints-bed', k === 'folkerda' && !hung); vis('#hit-printsbed', k === 'folkerda' && !hung);
  vis('#km-ditty', k === 'folkerda' && S.ch === 2); vis('#hit-ditty', k === 'folkerda' && S.ch === 2);
  const found = { thedema: f.telmerk, alma: f.behang, folkerda: f.prenten }[k];
  vis('#km-mark', !!found);
  $('#km-marktxt').textContent = MERK[k][0];
}
function toKamer(k){ S.kamer = k; save(); go('kamer'); }

const H1 = { roelof: H.roelof };   // Roelof op het erf (hoofdstuk 1); hier komen de andere kamers bij
Object.assign(H, {
  /* ---- de overloop ---- */
  trap(){ go('hal'); },
  thedema(){ toKamer('thedema'); },
  alma(){ toKamer('alma'); },
  folkerda(){ toKamer('folkerda'); },
  luik(){
    if(F(2).katrol) return say(["Door het oude hooiluik kijk je over de tuin en de weilanden naar de stad Groningen. De Martinitoren staat hemelsbreed maar 7,5 kilometer weg.", "Hier ging vroeger het hooi naar binnen, met de katrol aan de hijsbalk."]);
    say([['roelof', "Hé, daarboven! Kun je me even helpen?"],
         ['roelof', "Mijn gereedschapskist moet naar boven, en de trap is te smal. Hij weegt 40 kilo. We doen het zoals vroeger met het hooi: met de katrol!"]], () => openKatrol());
  },
  katrol(){ F(2).katrol ? say("Een ijzeren katrol aan de oude hijsbalk. Hij draait nog als een zonnetje.") : H.luik(); },
  kast(){
    if(F(2).kast) return say("Het kastje in de stijl staat open. Leeg nu: de sleutel heb jij.");
    openKast();
  },
  gebint(){ say(["Een eiken gebint: twee zware stijlen, een ankerbalk erdoorheen en schuine korbelen. Het draagt het hele dak.", "Er zijn streepjes in het hout gehakt: III op deze stijl, ΛI op de andere. Wat zouden die betekenen?"]); },
  ankerbalk(){ say("De ankerbalk, dik als een boomstam. Er zitten houten pennen in, geen spijkers. Zo bouwden ze vroeger."); },
  nest(){ beep(3200, .04); setTimeout(() => beep(3600, .04), 80); gag('#zl-nest', 'peep', 900); say("Een zwaluwnest onder de balk. Twee kopjes piepen: tjiep tjiep! Ze wonen hier al langer dan de gasten."); },
  vork(){ say(["Een oude hooivork met drie tanden. Roelof heeft hem laten hangen, als herinnering.", "Of als kapstok. Dat weet je bij Roelof nooit."]); },
  folders(){ say(["Een koelkastje voor de gasten, met koude drankjes. Bovenop een rek vol folders: fietsroutes, musea, de borgen, de scheve toren van Bedum.", "Je pakt de folder van de B&B."], () => openFolder()); },
  quiltzl(){ say("Een quilt met rode en groene lapjes, met de hand gemaakt. Ditty houdt van mooie dingen aan de muur."); },
  luchter(h){ gag('#km-luchter', 'tinkle', 1500); beep(2400, .05, 'sine', .03); setTimeout(() => beep(2800, .05, 'sine', .03), 90); toggleLamp('km-luchter', h); },
  baal(){ say("Een baal stro, als bankje. Het prikt een beetje."); },
  zlkist(){ say("Roelofs rode gereedschapskist. Hamer, schroevendraaiers, behanglijm, en een pakje stroopwafels."); },
  roelof(h){
    if(S.scene !== 'zolder') return H1.roelof(h);
    {
      if(S.f.kast) return say([['roelof', "Een sleutel uit het gebint! Honderd jaar heeft hij hier gezeten, vlak naast de kamers. Op naar het museum!"]]);
      const todo = [];
      if(!S.f.telmerk) todo.push('Thedema'); if(!S.f.behang) todo.push('Alma'); if(!S.f.prenten) todo.push('Folkerda');
      return say([['roelof', "\"Daar waar de drie borgen elk een teken geven\", schreef Harm. Drie borgen: dat zijn onze drie kamers!"],
        todo.length ? ['roelof', tx('Kijk eens goed rond in {k}. Ik help je wel als je iets nodig hebt.', { k: todo.join(', ').replace(/, ([^,]*)$/, ' en $1') })]
                    : ['roelof', "Je hebt alle drie de tekens! En dat kastje in de stijl daar… dat heb ik nooit open gekregen."]]);
    }
  },
  /* ---- de kamers ---- */
  kamerdeur(){ go('zolder'); },
  kmtafel(){ if(S.kamer === 'thedema' && !F(2).telmerk) return say(["Een tafel van steigerhout met verse bloemen. Er ligt een opengeslagen werkboekje van Roelof: \"Verbouwing 2012\".", "Er staat iets in over de korbelen en de stijl."], () => openTelmerk());
    say("Een tafel van steigerhout, met een vaas bloemen en twee stoelen met roze kussens."); },
  stijl(){
    const k = S.kamer || 'thedema';
    if(k === 'thedema' && !F(2).telmerk) return openTelmerk();
    const found = { thedema: F(2).telmerk, alma: F(2).behang, folkerda: F(2).prenten }[k];
    if(found) return say(tx('Op de stijl staat het teken van Harm: {m}, met een H ernaast.', { m: MERK[k][0] }));
    say(k === 'alma' ? "De eiken stijl van het gebint. Naast de stijl laat het behang los…" : "De eiken stijl van het gebint. Er zit nog geen teken op dat je kunt zien.");
  },
  korbeel(){ say(["Een korbeel: een schuine balk die de stijl en de ankerbalk stevig aan elkaar houdt, als een driehoek.", "Een driehoek kan niet scheef zakken. Daarom staan deze balken hier al honderden jaren."]); },
  prent(){
    if(!S.f.prenten) return say("Hier hing een prent: je ziet een lichtere plek op het behang. Roelof heeft vanochtend alle prenten van de muur gehaald om de lijstjes te poetsen.");
    const k = S.kamer || 'thedema';
    say({ thedema: ["Borg Thedema, getekend in 1622: een steenhuis met een hoge, ronde toren.", "Deze boerderij hoorde vroeger bij borg Thedema. Een borg was het grote huis van een rijke familie in Groningen."],
          alma: ["Borg Alma, te Noordwolde: een borg met een brug over de gracht.", "Bijna alle Groninger borgen zijn verdwenen. Hun namen leven voort, ook in deze kamers."],
          folkerda: ["Borg Folkerda, te Dijkshorn bij Bedum: drie trapgevels naast elkaar, en een spitse toren."] }[k]);
  },
  behang(){
    if(F(2).behang) return say("Het behang zit weer strak. Je ziet de naad niet eens.");
    if(!F(2).katrol) return say(["Een baan behang laat los, van boven tot bijna onder.", "Daar heb je gereedschap en lijm voor nodig. Waar is Roelof?"]);
    openBehang();
  },
  kmbed(){
    S.f.kbed = (S.f.kbed || 0) + 1; save(); beep(260, .08, 'sine', .05);
    if(S.f.kbed >= 3){ S.ach.bed = true; save(); return say("Je ploft languit op het bed. Extra lang, met een topper erop. Je zou zo weer in slaap vallen."); }
    say("Twee extra lange boxsprings tegen elkaar, met een geruit dekbed. Ditty heeft ze strak opgemaakt.");
  },
  prenten(){ openPrenten(); },
  dakraam(){ S.ach.martini = true; save(); say(["Door het dakraam kijk je naar het zuiden, naar de stad Groningen: de tuin, de weilanden, 4 kilometer verderop de eerste huizen van de stad, en 7,5 kilometer weg de Martinitoren.", "Alle kamers op de hooizolder liggen aan de zuidkant. Zon de hele dag!"]); },
  kmrieten(){ beep(180, .2, 'triangle', .03); say("Een rieten stoel bij het raam. Kraak. Hier zou je een boek kunnen lezen. Of de reeën tellen."); },
  ditty(){
    if(S.scene === 'kamer'){
      S.f.koffie = (S.f.koffie || 0) + 1; save();
      if(S.f.koffie >= 3){ S.ach.koffie = true; save(); return say([['ditty', "Nog een kopje? Dat is je derde! Je bent nu echt een Groninger: koffie, koffie, en dan nog een bakje."]]); }
      if(!S.f.prenten) return say([['ditty', "Kopje koffie? Ik zet net een verse pot."], ['ditty', "Kijk eens, Roelof heeft de drie prenten van de muur gehaald om de lijstjes te poetsen. En nu weet hij niet meer welke waar hing! Mannen…"], ['ditty', "Ik was vroeger juf, dus ik heb er een kaartje bij geschreven. Lees goed, dan kom je er wel uit."]]);
      return say([['ditty', "Kopje koffie? Het ontbijt was toch lekker? Het brood komt van de bakker in Bedum, en de eitjes van de buren."]]);
    }
  }
});

/* ---------- puzzel 1: de katrol (een losse katrol halveert de kracht, maar je trekt twee keer zoveel touw) ---------- */
function openKatrol(){
  const pic = (n, x) => {
    // n touwen dragen de kist
    const rope = n === 1 ? `<path d="M${x - 20} 40 V150 M${x + 20} 40 V170" stroke="#b8925a" stroke-width="3"/>`
      : n === 2 ? `<path d="M${x - 30} 30 V120 M${x - 10} 40 V120 M${x + 10} 40 V120 M${x + 30} 40 V170" stroke="#b8925a" stroke-width="3"/><circle cx="${x - 20}" cy="124" r="12" fill="#5a5f66"/><path d="M${x - 30} 124 a10 10 0 0 0 20 0" stroke="#b8925a" stroke-width="3" fill="none"/>`
      : `<path d="M${x - 40} 30 V120 M${x - 24} 40 V120 M${x - 8} 40 V120 M${x + 8} 40 V120 M${x + 30} 40 V170" stroke="#b8925a" stroke-width="3"/><rect x="${x - 46}" y="116" width="44" height="14" rx="6" fill="#5a5f66"/>`;
    const wheel = n === 1 ? `<circle cx="${x}" cy="40" r="20" fill="#5a5f66"/>` : n === 2 ? `<circle cx="${x + 10}" cy="40" r="20" fill="#5a5f66"/>` : `<rect x="${x - 30}" y="26" width="60" height="26" rx="10" fill="#5a5f66"/>`;
    const boxX = n === 1 ? x - 40 : x - 46;
    return `<path d="M${x - 60} 22 H${x + 60}" stroke="#7a5a3a" stroke-width="10"/>${rope}${wheel}
      <rect x="${boxX}" y="${n === 1 ? 150 : 130}" width="40" height="30" rx="4" fill="#c4302b"/><text x="${boxX + 20}" y="${n === 1 ? 170 : 150}" fill="#fff" font-size="11" text-anchor="middle" font-family="IBM Plex Mono, monospace">40kg</text>
      <path d="M${x + 30} 170 v8" stroke="#b8925a" stroke-width="3"/><circle cx="${x + 30}" cy="182" r="5" fill="#f6cfae"/>`;
  };
  openModal('De katrol aan de hijsbalk', 'Het oude hooiluik · de kist van Roelof moet naar boven', `
    <p>De kist weegt <b>40 kilo</b>. Jij kunt hooguit <b>25 kilo</b> trekken. Het luik zit <b>5 meter</b> boven de grond, en het touw is <b>12 meter</b> lang. Hoe hang je het touw op?</p>
    <svg viewBox="0 0 540 200" class="pz-svg" aria-hidden="true">${pic(1, 90)}${pic(2, 270)}${pic(4, 450)}
      <g fill="#f8f0e0" font-family="IBM Plex Mono, monospace" font-size="12" text-anchor="middle"><text x="90" y="198">A: 1 touw</text><text x="270" y="198">B: 2 touwen</text><text x="450" y="198">C: 4 touwen</text></g></svg>
    <div class="opts">
      <button type="button" class="opt" data-v="1"><b>A</b><small>Eén vaste katrol: de kist hangt aan één touw</small></button>
      <button type="button" class="opt" data-v="2"><b>B</b><small>Een losse katrol: de kist hangt aan twee touwen</small></button>
      <button type="button" class="opt" data-v="4"><b>C</b><small>Een takel: de kist hangt aan vier touwen</small></button>
    </div><div class="feedback" id="kt-fb"></div>`, body => {
    body.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const v = b.dataset.v;
      if(v === '2'){ b.classList.add('ok'); S.f.katrol = true; save(); fb('#kt-fb', 'Twee touwen dragen samen 40 kilo: jij trekt maar 20. En je haalt 2 × 5 = 10 meter touw binnen. Dat past!', 'good'); return solved(katrolDone, 2200); }
      nope();
      fb('#kt-fb', v === '1' ? 'Met één touw trek je de hele 40 kilo zelf. De kist komt geen centimeter van de grond.'
        : 'Lekker licht, maar 10 kilo… Elk touw moet 5 meter korter worden: 4 × 5 = 20 meter touw. Je hebt er maar 12.', 'bad');
    });
  });
}
function katrolDone(){
  applyVisuals(); beep(300, .2, 'triangle', .04);
  say(["Hijs… hijs… de katrol piept, en daar komt de rode kist door het luik naar binnen.",
       ['roelof', "Zo! Precies zoals mijn opa het hooi omhoog haalde. Wat je aan kracht wint, loop je aan touw: dat is de truc van de katrol."],
       ['sys', "Even later stommelt Roelof de trap op."],
       S.f.telmerk || S.f.prenten
         ? ['roelof', "Heb je in de kamers al een teken van Harm gevonden? Goed zo! In Alma laat het behang los: daar heb ik mijn kist voor nodig."]
         : ['roelof', "\"Daar waar de drie borgen elk een teken geven.\" Drie borgen… dat zijn onze kamers! Thedema, Alma en Folkerda."]]);
}

/* ---------- puzzel 2: telmerken (de streepjes waarmee timmerlieden de balken nummerden) ---------- */
const TEL = [['ΛIII', 8], ['IIII', 4], ['XI', 11], ['ΛI', 6]];
function openTelmerk(){
  const pick = S.tlm || {};
  openModal('Het werkboekje van Roelof', 'Kamer Thedema · "Verbouwing 2012: korbelen terugzetten"', `
    <p>Roelof: <i>"De korbelen van Thedema moesten even los. Ik heb er nummers op geplakt: 4, 6, 8 en 11. Maar welke hoort waar? Op de stijl staan oude streepjes in het hout…"</i></p>
    <div class="note-paper" style="font-size:18px">Telmerken: zo nummerden timmerlieden vroeger de balken van een gebint, zodat ze wisten wat bij elkaar hoorde. Met een beitel hakten ze: <b>I = 1</b>, <b>Λ = 5</b> (een omgekeerde V), <b>X = 10</b>. Tel ze op, van links naar rechts.</div>
    <div class="opts" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">${TEL.map(([m], i) => `
      <label class="opt"><b style="font-family:var(--f-mono);font-size:22px">${m}</b><small>Korbeel nummer</small>
        <select data-i="${i}" aria-label="${tx('Korbeel bij telmerk {m}', { m })}"><option value="">?</option>${[4, 6, 8, 11].map(n => `<option ${pick[i] == n ? 'selected' : ''}>${n}</option>`).join('')}</select></label>`).join('')}
    </div>
    <button type="button" class="btn" id="tl-ok" style="margin-top:12px">Zet de korbelen terug</button>
    <div class="feedback" id="tl-fb"></div>`, body => {
    body.querySelectorAll('select').forEach(s => s.onchange = () => { pick[s.dataset.i] = s.value; S.tlm = pick; save(); });
    body.querySelector('#tl-ok').onclick = () => {
      const wrong = TEL.filter(([, n], i) => +pick[i] !== n);
      if(!wrong.length){ S.f.telmerk = true; save(); fb('#tl-fb', 'Alles past! En onder het stof op de stijl zie je nog een teken…', 'good'); return solved(telmerkDone, 1800); }
      nope();
      const w = wrong[0][0];
      fb('#tl-fb', w === 'IIII' ? 'IIII: vier streepjes. Bij telmerken is er geen aftrekken, dus geen IV.'
        : w === 'XI' ? 'XI: een X (10) en nog een streepje.' : tx('{m}: begin met de Λ, dat is 5, en tel de streepjes erbij.', { m: w }), 'bad');
    };
  });
}
function telmerkDone(){
  applyVisuals();
  // Roelof is pas boven na de katrol
  if(!S.f.katrol) return say(["Je zet de korbelen terug, klop klop, elk op zijn nummer. Dan blaas je het stof van de stijl.",
       "Hier staat nog een teken, dat niet bij een korbeel hoort: ΛII… en een H. Van Harm!",
       "ΛII: een Λ en twee streepjes. Dat is 5 + 2 = 7. Het teken van Thedema."]);
  say(["Roelof zet de korbelen terug, klop klop. Dan blaast hij het stof van de stijl.",
       ['roelof', "Kijk! Hier staat nog een teken, dat niet bij een korbeel hoort. ΛII… en een H. Van Harm!"],
       "ΛII: een Λ en twee streepjes. Dat is 5 + 2 = 7. Het teken van Thedema."]);
}

/* ---------- puzzel 3: behang (het patroon moet doorlopen: het rapport) ---------- */
function openBehang(){
  // de linkerbaan heeft halve bloemen op de rand bij 30, 130, 230; elke kandidaat heeft ze op een andere hoogte
  const cand = [['A', 80], ['B', 50], ['C', 30], ['D', 0]];
  const strip = (x, off, side, label) => {
    let g = `<rect x="${x}" y="0" width="80" height="300" fill="#f4f1ea" stroke="#c9c5bb"/>`;
    for(let y = off - 100; y < 320; y += 100){
      const cx = side === 'r' ? x + 80 : x;
      g += `<path d="M${cx} ${y - 16} a16 16 0 0 ${side === 'r' ? 0 : 1} 0 32z" fill="#c9708a" stroke="#8a3a50" stroke-width="1.5"/>`;
      g += `<path d="M${x + 40} ${y + 40} c4 -20 -6 -30 0 -50" stroke="#c9c5bb" stroke-width="2" fill="none"/><ellipse cx="${x + 40}" cy="${y - 14}" rx="10" ry="8" fill="#c9c5bb"/>`;
    }
    return g + (label ? `<text x="${x + 40}" y="318" fill="#f8f0e0" font-family="IBM Plex Mono, monospace" font-size="14" text-anchor="middle">${label}</text>` : '');
  };
  openModal('Het behang in Alma', 'Een losse baan · Roelof pakt de lijmkwast', `
    <p>Roelof: <i>"Deze baan laat los, en hij is gescheurd. Ik heb nog een rol. Maar welk stuk past? Het patroon moet doorlopen over de naad: de halve bloemen moeten hele bloemen worden. Dat heet het <b>rapport</b>: na hoeveel centimeter het patroon zich herhaalt."</i></p>
    <svg viewBox="0 0 520 330" class="pz-svg" aria-hidden="true">
      <clipPath id="bhClip"><rect x="0" y="0" width="520" height="300"/></clipPath>
      <g clip-path="url(#bhClip)">${strip(10, 30, 'r')}${cand.map(([l, o], i) => strip(130 + i * 96, o, 'l', l)).join('')}</g>
      <g fill="#f8f0e0" font-family="IBM Plex Mono, monospace" font-size="14" text-anchor="middle">${cand.map(([l], i) => `<text x="${170 + i * 96}" y="320">${l}</text>`).join('')}<text x="50" y="320">muur</text></g>
    </svg>
    <div class="opts">${cand.map(([l]) => `<button type="button" class="opt" data-v="${l}"><b>Baan ${l}</b></button>`).join('')}</div>
    <div class="feedback" id="bh-fb"></div>`, body => {
    body.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      if(b.dataset.v === 'C'){ b.classList.add('ok'); S.f.behang = true; save(); fb('#bh-fb', 'Baan C: de halve bloemen sluiten precies aan. Roelof trekt de oude baan los… en daaronder, op de stijl, staat iets!', 'good'); return solved(behangDone, 2000); }
      nope(); fb('#bh-fb', 'Leg de baan in gedachten tegen de muur: komen de halve bloemen op dezelfde hoogte uit? Bij deze niet.', 'bad');
    });
  });
}
function behangDone(){
  applyVisuals();
  say(["Roelof smeert lijm, plakt de nieuwe baan en strijkt hem glad. Maar eerst wijst hij naar de stijl, waar het oude behang zat.",
       ['roelof', "Weer zo'n teken! IIII, en een H. Dat heeft hier al die tijd onder het behang gezeten."],
       "IIII: vier streepjes. Dat is 4. Het teken van Alma."]);
}

/* ---------- puzzel 4: de prenten (drie borgen herkennen aan hun beschrijving) ---------- */
const PRINTS = [['thedema', 'P'], ['folkerda', 'Q'], ['alma', 'R']];   // op het bed: P, Q, R
function openPrenten(){
  if(F(2).prenten) return say("De prenten hangen weer in hun eigen kamer.");
  const pick = S.prn || {};
  openModal('Drie prenten op het bed', 'Kamer Folkerda · welke borg is welke?', `
    <div class="note-paper" style="font-size:18px">Ditty's kaartje voor de gasten:<br>
      <b>Thedema</b>: een steenhuis met een hoge, ronde toren, getekend in 1622. Deze boerderij hoorde bij Thedema.<br>
      <b>Alma</b>: een borg met een stenen brug over de gracht, naar een poortje.<br>
      <b>Folkerda</b>: een lange borg met drie trapgevels naast elkaar, en een spitse toren.</div>
    <div class="opts" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">${PRINTS.map(([b, l], i) => `
      <label class="opt"><svg viewBox="0 0 160 110" width="100%"><use href="#km-borg-${b}"/></svg><b>Prent ${l}</b>
        <select data-i="${i}" aria-label="${tx('Prent {l} hoort in kamer', { l })}"><option value="">Welke kamer?</option>${['thedema', 'alma', 'folkerda'].map(n => `<option value="${n}" ${pick[i] === n ? 'selected' : ''}>${KAMER_NAAM[n]}</option>`).join('')}</select></label>`).join('')}
    </div>
    <button type="button" class="btn" id="pr-ok" style="margin-top:12px">Hang ze op</button>
    <div class="feedback" id="pr-fb"></div>`, body => {
    body.querySelectorAll('select').forEach(s => s.onchange = () => { pick[s.dataset.i] = s.value; S.prn = pick; save(); });
    body.querySelector('#pr-ok').onclick = () => {
      const wrong = PRINTS.filter(([b], i) => pick[i] !== b);
      if(!wrong.length){ S.f.prenten = true; save(); fb('#pr-fb', 'Alle drie goed! Roelof draait de prent van Folkerda om…', 'good'); return solved(prentenDone, 1800); }
      nope();
      const [b, l] = wrong[0];
      fb('#pr-fb', b === 'thedema' ? tx('Kijk naar prent {l}: zie je die hoge, ronde toren?', { l }) : b === 'alma' ? tx('Kijk naar prent {l}: loopt er een brug over het water?', { l }) : tx('Kijk naar prent {l}: tel de trapgevels.', { l }), 'bad');
    };
  });
}
function prentenDone(){
  applyVisuals();
  if(!S.f.katrol) return say([['ditty', "Knap! Dat zal Roelof leuk vinden. Hij is buiten, bij het oude hooiluik."],
       ['ditty', "Wacht eens… op de achterkant van Folkerda, op het oude hout van de lijst, staat iets gekerfd. XI, en een H."],
       "XI: een X (10) en een streepje. Dat is 11. Het teken van Folkerda. Ditty hangt de prent terug, vlak naast de stijl."]);
  say([['ditty', "Knap! Roelof, hoor je dat? De prenten zijn terug."],
       ['roelof', "Wacht eens… op de achterkant van Folkerda, op het oude hout van de lijst, staat iets gekerfd. XI, en een H."],
       "XI: een X (10) en een streepje. Dat is 11. Het teken van Folkerda. Roelof hangt de prent terug, vlak naast de stijl."]);
}

/* ---------- puzzel 5: het kastje in de stijl (drie tekens, drie getallen) ---------- */
function openKast(){
  const v = S.kst2 || [0, 0, 0];
  const names = ['Thedema', 'Alma', 'Folkerda'];
  const draw = () => names.map((n, i) => `<div class="dial"><button type="button" data-i="${i}" data-d="1" aria-label="${tx('{n} omhoog', { n })}">▲</button><div class="face">${v[i]}</div><button type="button" data-i="${i}" data-d="-1" aria-label="${tx('{n} omlaag', { n })}">▼</button><small>${n}</small></div>`).join('');
  openModal('Een kastje in de stijl', 'Op de overloop · drie houten schijfjes met getallen', `
    <p>In de eiken stijl zit een klein deurtje, met drie draaischijfjes van 0 tot 12. Eronder is gekerfd: <i>"Elke borg zijn teken."</i></p>
    <div id="ks-dials">${draw()}</div>
    <button type="button" class="btn" id="ks-ok" style="margin-top:12px">Trek aan het deurtje</button>
    <div class="feedback" id="ks-fb"></div>`, body => {
    const bind = () => body.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const i = +b.dataset.i; v[i] = (v[i] + +b.dataset.d + 13) % 13; S.kst2 = v; save(); beep(600, .03); $('#ks-dials').innerHTML = draw(); bind(); });
    bind();
    body.querySelector('#ks-ok').onclick = () => {
      const known = [S.f.telmerk, S.f.behang, S.f.prenten].filter(Boolean).length;
      // pas open met alle drie de tekens: anders mis je de katrol, en Roelof
      if(v[0] === 7 && v[1] === 4 && v[2] === 11 && known === 3){ S.f.kast = true; save(); fb('#ks-fb', 'Klik! Het deurtje springt open.', 'good'); return solved(kastDone, 1500); }
      nope();
      fb('#ks-fb', known < 3 ? 'Het deurtje geeft niet mee. Heb je de tekens van alle drie de borgen al gevonden? Kijk in de kamers.' : 'Het deurtje geeft niet mee. Zet de telmerken om in getallen: ΛII, IIII en XI.', 'bad');
    };
  });
}
function kastDone(){
  S.f.out2 = true; setUnlocked(3);
  give('oudesleutel'); applyVisuals();
  say(["In het kastje ligt een zware ijzeren sleutel met een krul, en een opgerold briefje.",
       ['harm', "Goed gezocht. Dit is de sleutel van het kistje. Maar wat erin hoort, ligt er niet in. Wie het boerenleven kent, vindt het. H."],
       ['roelof', "Het kistje staat in mijn museum, achter de deeldeuren op het erf. Kom mee!"]], win2);
}

/* ---------- begin en einde ---------- */
function intro2(){
  say([['sys', "Zaterdagochtend. De zon schijnt door de boogramen van de Paardenstal: ze liggen op het oosten, net als Ditty zei."],
       ['ditty', "Goedemorgen! Lekker geslapen? Het ontbijt staat klaar in de eetzaal: verse broodjes, eitjes, en koffie zoveel je wilt."],
       ['sys', "Na het ontbijt klim je de trap op naar de oude hooizolder. Harm schreef: begin boven."],
       ['you', "Wat een balken! En daar zijn de deuren van Thedema, Alma en Folkerda."]], () => { S.f.introDone = true; save(); });
}
function win2(){
  S.f.out2 = true; save(); applyVisuals(); chord([523,659,784,1046,1318], 120);
  showWin();
}

/* ---------- grapjes op de hooizolder en in de kamers ---------- */
Object.assign(H, {
  vork(){ poke('#zl-vork', 'g-swing', null, 400); say(["Een oude hooivork met drie tanden. Hij zwaait aan zijn spijker.", "Roelof heeft hem laten hangen, als herinnering. Of als kapstok. Dat weet je bij Roelof nooit."]); },
  baal(){ poke('#zl-baal', 'g-jump', 'Prik!'); say("Je gaat op de baal stro zitten. Au, het prikt! Een echte hooizolder zonder stro zou ook raar zijn."); },
  folders(){ poke('#zl-koelkast', 'g-shake', 'Brrr', 200); say(["Een koelkastje voor de gasten, met koude drankjes. Bovenop een rek vol folders: fietsroutes, musea, de borgen, de scheve toren van Bedum.", "Je pakt de folder van de B&B."], () => openFolder()); },
  gordijnen(){ poke('#km-gordijnen', 'g-shake', 'Swoesj'); say("Paarse gordijnen voor het raam van de dakkapel. Als ze dicht zijn, slaap je heerlijk donker. Als ze open zijn, zie je de stad."); },
  kmmartini(){ S.ach.martini = true; save(); poke('#km-martini', 'g-glow', "d'Olle Grieze"); say(["De Martinitoren, de hoogste toren van de stad Groningen. Hemelsbreed 7,5 kilometer hiervandaan.", "De eerste huizen van de stad liggen zelfs maar 4 kilometer weg. En toch zie je hier vooral weilanden."]); },
  kmree(){ S.ach.ree = true; save(); poke('#km-ree', 'g-jump', null, 900); say("Een ree loopt rustig door de wei, vlak achter de tuin. Hij kijkt even op naar het raam… en loopt dan verder."); },
  dakraam(){ S.ach.martini = true; save(); say(["Door het raam van de dakkapel kijk je naar het zuiden, naar de stad Groningen: de tuin, een kale boom, de weilanden, 4 kilometer verderop de eerste huizen van de stad, en 7,5 kilometer weg de Martinitoren.", "Alle kamers op de hooizolder liggen aan de zuidkant. Zon de hele dag!"]); },
  kmrieten(){ poke('#km-rieten', 'g-jump', 'Kraak'); beep(180, .2, 'triangle', .03); say("Een rieten stoel bij het raam. Kraak. Hier zou je een boek kunnen lezen. Of de reeën tellen."); },
  prent(){
    poke('#km-print', 'g-tilt');
    if(!F(2).prenten) return say("Hier hing een prent: je ziet een lichtere plek op het behang. Roelof heeft vanochtend alle prenten van de muur gehaald om de lijstjes te poetsen.");
    const k = S.kamer || 'thedema';
    say({ thedema: ["Borg Thedema, getekend in 1622: een steenhuis met een hoge, ronde toren. De prent hangt een beetje scheef; je zet hem recht.", "Deze boerderij hoorde vroeger bij borg Thedema. Een borg was het grote huis van een rijke familie in Groningen."],
          alma: ["Borg Alma, te Noordwolde: een borg met een brug over de gracht.", "Bijna alle Groninger borgen zijn verdwenen. Hun namen leven voort, ook in deze kamers."],
          folkerda: ["Borg Folkerda, te Dijkshorn bij Bedum: drie trapgevels naast elkaar, en een spitse toren."] }[k]);
  }
});
const kmbed0 = H.kmbed;
H.kmbed = () => { poke('#km-bed', 'g-jump'); kmbed0(); };
const katrol0 = H.katrol;
H.katrol = () => { if(S.f.katrol){ poke('#zl-katrol', 'g-spin', 'Piep!', 900); } katrol0(); };
