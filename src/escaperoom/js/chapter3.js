// Hoofdstuk 3: zaterdagmiddag in het boerenleven-museum van Roelof (museum) en op het platte dak tussen de twee
// schuren (dak). Vier letters, verstopt in vier dingen van het boerenleven. Geladen door js/boot.js.

Object.assign(ITEMS, {
  kaart: { name:'Akkerkaart', desc:'Een kaart van Harm met de drie akkers A, B en C, en wat erop groeide. Vergeeld, en met potlood volgeschreven.',
    svg:'<svg viewBox="0 0 44 44"><path d="M6 8 l10 -3 l12 3 l10 -3 v30 l-10 3 l-12 -3 l-10 3z" fill="#e9d9b0" stroke="#8a6a3a" stroke-width="1.5"/><path d="M16 5 v30 M28 8 v30" stroke="#8a6a3a" stroke-width="1"/><path d="M8 14 h6 M18 18 h8 M30 12 h6" stroke="#6a8a3a" stroke-width="3"/><text x="11" y="30" font-size="7" fill="#5a3a1a" font-family="sans-serif">A</text><text x="21" y="30" font-size="7" fill="#5a3a1a" font-family="sans-serif">B</text><text x="32" y="30" font-size="7" fill="#5a3a1a" font-family="sans-serif">C</text></svg>' }
});
PAARDJE_SAY[3] = ["Bovenop de strobalen staat het hobbelpaardje. Hoe komt dat nou hier?", "Ditty knipoogt naar je door het raam. Je stopt het in je rugzak."];

/* De vier letters en waar ze vandaan komen. */
const LETTERS = [['bascule', 'G'], ['karn', 'R'], ['akkers', 'U'], ['spreuk', 'P']];
function applyMuseum(){
  const f = S.f;
  vis('#mu-kistje', !f.kistOpen); vis('#mu-kistopen', !!f.kistOpen);
  vis('#mu-paardje', !f.paardjeTaken); vis('#hit-mupaardje', !f.paardjeTaken);
  const got = LETTERS.filter(([k]) => f[k]).map(([, l]) => l);
  $('#mu-letters').innerHTML = got.map((l, i) => `<text x="${1068 + i * 18}" y="545">${l}</text>`).join('');
  $('#sc-museum').classList.toggle('mu-running', !!f.tractor);
}
function applyDak(){}

const H2 = { roelof: H.roelof, paardje: H.paardje };
Object.assign(H, {
  roelof(h){
    if(S.scene !== 'museum') return H2.roelof(h);
    if(!S.f.kistOpen) return say([['roelof', "Welkom in mijn museum! Alles wat hier staat, is ooit gebruikt op een boerderij hier in de buurt. Veel ervan op deze boerderij."], ['roelof', "En daar, op de witte tafel: het kistje van Thedema. Probeer de sleutel maar!"]]);
    const left = LETTERS.filter(([k]) => !S.f[k]).length;
    if(left) return say([['roelof', tx('Nog {n} letters te gaan. Harm kende het boerenleven, en ik ook: vraag maar raak!', { n: left })]]);
    say([['roelof', "Alle vier! Leg ze in het kistje. Wat voor woord is het?"]]);
  },
  kistje(){
    if(!S.f.kistOpen) return say(has('oudesleutel') ? "Het kistje van Thedema, van donker hout met koperen banden. Het slot heeft een sleutelgat met een krul. Gebruik de oude sleutel." : "Op slot.");
    if(LETTERS.every(([k]) => S.f[k])) return openWoord();
    openHarm3();
  },
  bascule(){ if(S.f.bascule) return say("De bascule staat in evenwicht. Onder het schaaltje lag het koperen plaatje met de G."); openBascule(); },
  karn(){ if(S.f.karn) return say("De karntonnen. Op de bodem van de grootste is een R gebrand."); openKarn(); },
  spreuk(){ if(S.f.spreuk) return say("Nait soez'n, moi doun: niet zeuren, gewoon doen. Achter het bord zat de P."); openSpreuk(); },
  trekker(){
    S.f.tractor = !S.f.tractor; save(); applyVisuals();
    if(S.f.tractor){ S.ach.tractor = true; save(); beep(80, .4, 'sawtooth', .05); setTimeout(() => beep(90, .3, 'sawtooth', .05), 300);
      return say([['roelof', "Hoor je dat? Tuf, tuf, tuf! Een echte oude dieseltrekker. Ik heb hem zelf weer opgeknapt."], "De hele schuur trilt een beetje mee."]); }
    say("Je zet de trekker weer uit. Pfff. Stilte.");
  },
  lift(){ gag('#mu-bale', 'lift', 3000); beep(200, .1, 'triangle', .03); say(["Een balenlift: een lopende band van hout, schuin omhoog. Zo gingen de balen hooi en stro naar de zolder.", "Vroeger tilde je alles met de hand, of met de katrol."]); },
  wand(){ say(["Een hele wand oud gereedschap: spaden, rieken, een zeis, een hooivork, een schoffel.", "Elk ding heeft een kaartje met zijn naam. Roelof weet van elk stuk wie ermee werkte."]); },
  plaat(){ say("Een oude schoolplaat: koeien, schapen en een boerderij. Daar leerden kinderen vroeger van in de klas."); },
  katrollen(){ say("Rode katrollen aan de paal. Weet je nog, op de hooizolder? Twee touwen, de halve kracht."); },
  juk(){ say(["Een juk: een gebogen stuk hout over je schouders, met aan elke kant een emmer.", "Zo droeg je twee volle emmers melk tegelijk, zonder dat je rug knakte."]); },
  bussen(){ say(["Melkbussen, met nummers erop. Elke boer had zijn eigen nummer.", "De melkrijder haalde de bussen op en bracht ze naar de zuivelfabriek. Lege bussen kwamen terug."]); },
  balen(){ say("Balen stro, met touw eromheen. Ze kriebelen."); },
  haksel(){ gag('#mu-vlieg', 'spin', 2200); beep(300, .1, 'square', .02); setTimeout(() => beep(300, .1, 'square', .02), 200);
    say(["Een groene strohakselaar met een groot vliegwiel. Je draait aan de slinger: tsjak, tsjak, tsjak!", "Het mes hakt stro in kleine stukjes, als voer of strooisel voor de koeien."]); },
  muladder(){ go('dak'); },
  /* ---- het dak ---- */
  naarmuseum(){ go('museum'); },
  naarzaal(){
    if(S.f.out3) return nextChapter();
    say(["Het luik naar de zaal, de oude koestal. Je hoort beneden stoelen schuiven.", ['ditty', "Nog niet naar binnen kijken! Het feest is pas vanavond!"]]);
  },
  akkers(){
    if(S.f.akkers) return say("De drie akkers: A, B en C. Harm wist precies wat er elk jaar moest groeien.");
    if(!has('kaart')) return say("Drie akkers in de verte: A, B en C. Je ziet strepen van ploegen in de grond.");
    openAkkers();
  },
  stad(){ S.ach.martini = true; save(); say(["De stad Groningen, met de Martinitoren erboven uit. De Groningers noemen hem d'Olle Grieze: de oude grijze.", "Ongeveer 8 kilometer hiervandaan. Je kunt er zo naartoe fietsen."]); },
  scheef(){ S.ach.scheef = true; save(); say(["Een scheve kerktoren, net boven de bomen uit. Dat is de toren van de Walfriduskerk in Bedum.", "Volgens de folder van de B&B de scheefste toren van Europa. Toch staat hij er al eeuwen."]); },
  molen(){ gag('#dk-molen', 'fast', 3000); say("Een molen in de verte. De wieken draaien rustig in de wind."); },
  dkree(){ S.ach.ree = true; save(); say("Twee reeën in de wei, vlak bij de akkers. Ze grazen gewoon door."); },
  kijker(){ S.ach.martini = true; save(); say(["Je kijkt door de verrekijker van Roelof. Zuid: de Martinitoren. Noord: de scheve toren van Bedum. Overal: koeien, schapen en weilanden.", "Op het platte dak zie je kilometers ver. Daarom heet dit het Hogeland, al is het helemaal niet hoog."]); },
  dakpannen(){ say("Rode dakpannen op het dak van de schuur met de zaal. Onder dit dak stonden vroeger de koeien."); },
  riet(){ say("Het rieten dak van het museum. Riet houdt het in de zomer koel en in de winter warm."); },
  leeuwerik(){ beep(3600, .05); setTimeout(() => beep(4000, .05), 90); setTimeout(() => beep(3800, .05), 180); say("Een leeuwerik, hoog in de lucht. Hij zingt en zingt en houdt maar niet op."); }
});

/* ---------- het kistje: de sleutel en Harms tweede briefje ---------- */
function openHarm3(){
  openModal('In het kistje van Thedema', 'Een briefje van Harm, en een kaart', `
    <div class="note-paper old">Wat erin hoort, ligt waar deze boerderij vroeger het rijkst was. Ik heb het woord in vier letters verstopt, in vier dingen van het boerenleven:<br>
      · waar één kilo er tien weegt<br>
      · waar de melk boter wordt<br>
      · op het land, waar elk jaar iets anders groeit<br>
      · en waar de Grunneger zegt wat hij denkt.<br>
      Leg de letters in het kistje.
      <div class="sig">H.</div></div>`);
}
function kistOpen(){
  take('oudesleutel'); S.f.kistOpen = true; save(); applyVisuals(); give('kaart'); beep(400, .1); setTimeout(() => beep(600, .1), 150);
  say(["Krrrrr… klak. De oude sleutel draait, en het deksel gaat open.", "Het kistje is leeg, op een briefje en een opgevouwen kaart na.",
       ['roelof', "Al die jaren… en er zit bijna niks in!"]], () => openHarm3());
}

/* ---------- puzzel: de decimaalbascule (1 kilo op het schaaltje houdt 10 kilo op de brug in evenwicht) ---------- */
function openBascule(){
  const on = S.bsc || {};
  const W = [1, 2, 5, 10];
  const draw = () => {
    const sum = W.filter(w => on[w]).reduce((a, b) => a + b, 0), tilt = Math.max(-1, Math.min(1, (sum * 10 - 70) / 40));
    return `<svg viewBox="0 0 460 190" class="pz-svg" aria-hidden="true">
      <rect width="460" height="190" fill="#2a3a2a" rx="6"/>
      <rect x="40" y="150" width="200" height="16" fill="#5a6a4a"/>
      <path d="M70 150 c-10 -60 110 -64 120 0z" fill="#b8925a" stroke="#7a5a30" stroke-width="2"/><text x="130" y="130" fill="#3a2614" font-size="14" text-anchor="middle" font-family="IBM Plex Mono, monospace">mud aardappelen</text>
      <path d="M60 150 V70 M300 150 V60" stroke="#9aa89a" stroke-width="6"/>
      <g transform="rotate(${(tilt * 8).toFixed(1)} 300 60)"><path d="M60 70 L380 60" stroke="#c9d4c9" stroke-width="6"/><path d="M380 60 v20 M350 82 h60" stroke="#c9d4c9" stroke-width="4"/>
        <g>${W.filter(w => on[w]).map((w, i) => `<rect x="${354 + i * 14}" y="${70 - w}" width="12" height="${8 + w}" fill="#2a2a2a"/>`).join('')}</g></g>
      <text x="380" y="140" fill="#f8f0e0" font-size="13" text-anchor="middle" font-family="IBM Plex Mono, monospace">${tx('schaaltje: {n} kg', { n: sum })}</text>
      <text x="230" y="30" fill="${tilt === 0 ? '#9bd17a' : '#e8b04a'}" font-size="14" text-anchor="middle" font-family="IBM Plex Mono, monospace">${tilt === 0 ? 'in evenwicht!' : tilt > 0 ? 'het schaaltje zakt' : 'de zak is zwaarder'}</text>
    </svg>`;
  };
  openModal('De bascule', 'Een decimaalbascule · voor zakken aardappelen en graan', `
    <p>Op de brug staat een zak van één <b>mud</b> aardappelen. Op het bordje van de bascule staat: <i>"1 kilo op het schaaltje houdt 10 kilo op de brug in evenwicht."</i> Roelof wil weten hoeveel een mud aardappelen weegt. Leg gewichtjes op het schaaltje.</p>
    <div id="bs-pic">${draw()}</div>
    <div class="opts">${W.map(w => `<button type="button" class="opt ${on[w] ? 'on' : ''}" data-w="${w}"><b>${w} kg</b><small>gewichtje</small></button>`).join('')}</div>
    <p style="margin-top:12px">Hoeveel weegt de zak?</p>
    <div class="opts">${[7, 17, 70, 700].map(n => `<button type="button" class="opt" data-a="${n}"><b>${n} kg</b></button>`).join('')}</div>
    <div class="feedback" id="bs-fb"></div>`, body => {
    body.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { const w = +b.dataset.w; on[w] = !on[w]; S.bsc = on; save(); b.classList.toggle('on', !!on[w]); beep(500, .03); $('#bs-pic').innerHTML = draw(); });
    body.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const sum = W.filter(w => on[w]).reduce((a, c) => a + c, 0);
      if(sum * 10 !== 70){ nope(); return fb('#bs-fb', 'Eerst de bascule in evenwicht krijgen: leg gewichtjes op het schaaltje tot hij recht hangt.', 'bad'); }
      if(b.dataset.a === '70'){ b.classList.add('ok'); S.f.bascule = true; save(); fb('#bs-fb', '7 kilo op het schaaltje, dus 70 kilo op de brug. Een mud aardappelen weegt 70 kilo! Onder het schaaltje glimt iets…', 'good'); return solved(() => { applyVisuals(); say(["Onder het schaaltje zit een koperen plaatje. Er staat een letter op: G.", ['roelof', "De eerste letter! G."]]); }, 2200); }
      nope(); fb('#bs-fb', b.dataset.a === '7' ? 'Op het schaaltje ligt 7 kilo. Maar elke kilo daar houdt 10 kilo op de brug in evenwicht…' : 'Reken het na: 7 kilo op het schaaltje, keer 10.', 'bad');
    });
  });
}

/* ---------- puzzel: de karnton (van melk naar boter, stap voor stap) ---------- */
const KARN = ['De koeien melken', 'De melk een nacht laten staan: de room drijft bovenop', 'De room eraf scheppen', 'Karnen, karnen, karnen tot er boterkorrels komen', 'De karnemelk eruit laten lopen', 'De boter kneden en zouten'];
const KARN_MIX = [3, 0, 5, 2, 4, 1];
function openKarn(){
  let done = 0;
  openModal('De karnton', 'Van melk naar boter · Roelof laat het je zien', `
    <p>Roelof: <i>"Mijn oma maakte hier haar eigen boter. Weet jij hoe dat ging? Klik de stappen in de goede volgorde."</i></p>
    <ol id="kr-list" style="margin:6px 0 0 20px;min-height:1.5em"></ol>
    <div class="opts" style="grid-template-columns:1fr">${KARN_MIX.map(i => `<button type="button" class="opt" data-i="${i}">${KARN[i]}</button>`).join('')}</div>
    <div class="feedback" id="kr-fb"></div>`, body => {
    body.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const i = +b.dataset.i;
      if(b.disabled) return;
      if(i === done){
        b.disabled = true; b.classList.add('ok'); done++; beep(500 + done * 60, .06);
        $('#kr-list').insertAdjacentHTML('beforeend', `<li>${KARN[i]}</li>`);
        if(done === KARN.length){ S.f.karn = true; save(); fb('#kr-fb', 'Boter! En karnemelk als extraatje. Roelof kantelt de karnton…', 'good'); return solved(() => { applyVisuals(); say(["Op de bodem van de grote karnton is een letter in het hout gebrand: R.", ['roelof', "R! Die heb ik nooit gezien. Ik heb die ton nooit omgedraaid."]]); }, 2000); }
        return fb('#kr-fb', '');
      }
      nope();
      fb('#kr-fb', i === 3 && done < 3 ? 'Karnen met gewone melk duurt eeuwen. Eerst moet de room eraf.' : i === 5 ? 'Eerst moet er boter zijn voordat je kunt kneden.' : 'Dat komt later. Wat moet er eerst gebeuren?', 'bad');
    });
  });
}

/* ---------- puzzel: het spreukenbord (Gronings) ---------- */
const GRONINGS = [['Moi', 'Hallo, en ook: dag!'], ["Nait soez'n, moi doun", 'Niet zeuren, gewoon doen'], ["Kop d'r veur", 'Zet door, niet opgeven'], ['Wicht', 'Meisje']];
function openSpreuk(){
  const pick = S.spk || {};
  const answers = GRONINGS.map(g => g[1]).slice().sort();
  openModal('Het spreukenbord', 'Groninger wijsheden · "wat de Grunneger zegt"', `
    <p>Naast het bord hangt een lijstje van Roelof, met de vertalingen door elkaar. Wat hoort bij wat?</p>
    <div class="opts" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${GRONINGS.map(([g], i) => `
      <label class="opt"><b>${g}</b><select data-i="${i}" aria-label="${tx('Betekenis van {g}', { g })}"><option value="">Betekent…</option>${answers.map(a => `<option ${pick[i] === a ? 'selected' : ''}>${a}</option>`).join('')}</select></label>`).join('')}</div>
    <button type="button" class="btn" id="sp-ok" style="margin-top:12px">Klopt dit?</button>
    <div class="feedback" id="sp-fb"></div>`, body => {
    body.querySelectorAll('select').forEach(s => s.onchange = () => { pick[s.dataset.i] = s.value; S.spk = pick; save(); });
    body.querySelector('#sp-ok').onclick = () => {
      const wrong = GRONINGS.filter(([, d], i) => pick[i] !== d);
      if(!wrong.length){ S.f.spreuk = true; S.ach.moi = true; save(); fb('#sp-fb', 'Goud! Roelof tilt het bord van de spijker…', 'good'); return solved(() => { applyVisuals(); say(["Achter het spreukenbord is een letter op de muur geschilderd: P.", ['roelof', "P! Nait soez'n, moi doun: dat zei mijn vader ook altijd."]]); }, 1800); }
      nope();
      const [g] = wrong[0];
      fb('#sp-fb', g === 'Moi' ? 'Moi zeg je in Groningen de hele dag, bij komen én gaan.' : g === 'Wicht' ? 'Een wicht is een jong… wat? (Een jongen is een "jong".)' : g === "Kop d'r veur" ? '"Kop d\'r veur": hoofd ervoor, niet achteruit kijken.' : '"Moi doun" betekent hier: gewoon doen.', 'bad');
    };
  });
}

/* ---------- puzzel: de akkers (vruchtwisseling: elk jaar iets anders op het land) ---------- */
const CROPS = { a: 'aardappels', b: 'suikerbieten', g: 'graan' };
const AKKER_OK = { '1922': 'gab', '1923': 'bga' };
function openAkkers(){
  const pick = S.akr || {};
  const sel = (y, i) => `<select data-k="${y}${i}" aria-label="${tx('Akker {a} in {y}', { a: 'ABC'[i], y })}"><option value="">?</option>${Object.entries(CROPS).map(([k, n]) => `<option value="${k}" ${pick[y + i] === k ? 'selected' : ''}>${n}</option>`).join('')}</select>`;
  openModal('Harms akkerkaart', 'Op het platte dak · de akkers A, B en C', `
    <div class="note-paper old" style="font-size:18px">Elk jaar iets anders op elke akker, en elk gewas één keer per jaar. Nooit twee jaar hetzelfde op dezelfde grond: dan wordt de grond moe en komen er ziektes, zoals aaltjes in de aardappels. En na de aardappels altijd graan.</div>
    <table class="scores" style="margin-top:10px"><thead><tr><th></th><th>Akker A</th><th>Akker B</th><th>Akker C</th></tr></thead><tbody>
      <tr><td><b>1921</b></td><td>aardappels</td><td>suikerbieten</td><td>graan</td></tr>
      <tr><td><b>1922</b></td><td>${sel('1922', 0)}</td><td>${sel('1922', 1)}</td><td>${sel('1922', 2)}</td></tr>
      <tr><td><b>1923</b></td><td>${sel('1923', 0)}</td><td>${sel('1923', 1)}</td><td>${sel('1923', 2)}</td></tr>
    </tbody></table>
    <button type="button" class="btn" id="ak-ok" style="margin-top:12px">Zo gaan we zaaien</button>
    <div class="feedback" id="ak-fb"></div>`, body => {
    body.querySelectorAll('select').forEach(s => s.onchange = () => { pick[s.dataset.k] = s.value; S.akr = pick; save(); });
    body.querySelector('#ak-ok').onclick = () => {
      const row = y => [0, 1, 2].map(i => pick[y + i] || '').join('');
      const r2 = row('1922'), r3 = row('1923');
      if(r2 === AKKER_OK['1922'] && r3 === AKKER_OK['1923']){ S.f.akkers = true; save(); fb('#ak-fb', 'Een goed plan! Drie jaar, drie gewassen, en de grond blijft gezond.', 'good'); return solved(() => { applyVisuals(); say(["Achter op de kaart, naast 1923, heeft Harm iets geschreven: een dikke letter U.", "Vruchtwisseling: elk jaar iets anders. Boeren doen het nog steeds."]); }, 1800); }
      nope();
      const all = r2 + r3;
      fb('#ak-fb', all.length < 6 ? 'Vul alle zes de vakjes in.'
        : !(new Set(r2).size === 3 && new Set(r3).size === 3) ? 'Elk jaar moet elk gewas één keer: aardappels, suikerbieten en graan.'
        : [0, 1, 2].some(i => r2[i] === 'abg'[i] || r3[i] === r2[i] || r3[i] === 'abg'[i]) ? 'Op een akker staat hetzelfde gewas twee keer. Dan wordt de grond moe.'
        : 'Na de aardappels moet er graan komen. Waar stonden in 1921 de aardappels?', 'bad');
    };
  });
}

/* ---------- het woord: G, R, U, P ---------- */
function openWoord(){
  let w = '';
  const draw = () => `<div class="lcd" style="letter-spacing:.5em">${(w + '····').slice(0, 4)}</div>`;
  openModal('Het kistje van Thedema', 'Vier letters · welk woord?', `
    <p>Je legt de vier letters in het kistje. Welk woord maak je ervan?</p>
    <div id="wd-lcd">${draw()}</div>
    <div class="keypad" style="grid-template-columns:repeat(4,56px)">${['P', 'U', 'G', 'R'].map(l => `<button type="button" data-l="${l}">${l}</button>`).join('')}</div>
    <button type="button" class="btn ghost" id="wd-c" style="margin-top:10px">Opnieuw</button>
    <div class="feedback" id="wd-fb"></div>`, body => {
    body.querySelector('#wd-c').onclick = () => { w = ''; $('#wd-lcd').innerHTML = draw(); body.querySelectorAll('[data-l]').forEach(b => b.disabled = false); };
    body.querySelectorAll('[data-l]').forEach(b => b.onclick = () => {
      w += b.dataset.l; b.disabled = true; beep(600, .03); $('#wd-lcd').innerHTML = draw();
      if(w.length < 4) return;
      if(w === 'GRUP'){ fb('#wd-fb', 'GRUP!', 'good'); return solved(win3, 1200); }
      nope(); fb('#wd-fb', w === 'PURG' ? 'Purg? Dat is geen woord, ook niet in het Gronings. Roelof zegt: "Waar stonden de koeien vroeger met hun achterkant?"' : 'Dat is geen woord. Roelof mompelt iets over koeien en mest…', 'bad');
    });
  });
}

/* ---------- begin en einde ---------- */
function intro3(){
  give('oudesleutel');
  say([['sys', "Zaterdagmiddag. Roelof neemt je mee naar de andere schuur, aan de overkant van het platte dak."],
       ['roelof', "Dit is mijn museum: het boerenleven van vroeger. Trekkers, karntonnen, melkbussen, alles wat ik kon vinden."],
       ['roelof', "En dit is het kistje uit de borg Thedema. Gevonden in 2012, toen we de hooizolder verbouwden. Nu hebben we eindelijk de sleutel!"]], () => { S.f.introDone = true; save(); });
}
function win3(){
  S.f.out3 = true; save(); applyVisuals(); chord([523,659,784,1046,1318], 120);
  say([['roelof', "GRUP? De grup! Dat is de mestgoot achter de koeien, in de koestal."],
       ['roelof', "\"Waar deze boerderij vroeger het rijkst was\": bij de koeien! Daar kwam het geld vandaan, van de melk."],
       ['roelof', "En de oude koestal… dat is nu de zaal. Waar vanavond het feest is! Ik heb een stukje van de oude grup bewaard, onder een plaat in de vloer."],
       ['sys', "Ditty roept vanuit de zaal: \"Het feest begint om zeven uur. En niet eerder binnenkomen!\""]], showWin);
}
