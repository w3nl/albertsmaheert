// Hoofdstuk 1: vrijdagavond, je komt aan op het erf van de Albertsmaheert en slaapt in kamer Paardenstal.
// Hier staat ook H, de tabel met klikvlakken die elk hoofdstuk aanvult. Geladen op volgorde door js/boot.js.

Object.assign(ITEMS, {
  zaklamp: { name:'Zaklamp', desc:'De zaklamp van Roelof. "In de oude stal is het in de hoeken pikdonker."',
    svg:'<svg viewBox="0 0 44 44"><rect x="6" y="18" width="22" height="10" rx="3" fill="#3a3f46" stroke="#1f2328" stroke-width="2"/><path d="M28 16 l8 -4 v20 l-8 -4z" fill="#d6a640" stroke="#8a6a20" stroke-width="2"/><path d="M38 14 l4 -3 M39 22 h4 M38 30 l4 3" stroke="#f6e2a0" stroke-width="2" stroke-linecap="round"/><rect x="12" y="20" width="6" height="3" fill="#e2483d"/></svg>' },
  sleutel: { name:'Sleutel Paardenstal', desc:'De sleutel van jouw kamer, aan een hangertje met een hoefijzer en het woord PAARDENSTAL.',
    svg:'<svg viewBox="0 0 44 44"><circle cx="13" cy="22" r="8" fill="none" stroke="#c9a24a" stroke-width="4"/><path d="M21 22 h18 M33 22 v6 M38 22 v5" stroke="#c9a24a" stroke-width="4" stroke-linecap="round"/><path d="M6 32 a6 6 0 1 0 12 0" fill="none" stroke="#7d868f" stroke-width="3"/></svg>' },
  hoefijzer: { name:'Hoefijzer', desc:'Een oud, roestig hoefijzer uit het gras bij de wagen. Er zitten nog nagelgaatjes in.',
    svg:'<svg viewBox="0 0 44 44"><path d="M10 10 v12 a12 12 0 0 0 24 0 v-12" fill="none" stroke="#7d868f" stroke-width="7" stroke-linecap="round"/><g fill="#2a2a2a"><circle cx="10" cy="16" r="1.4"/><circle cx="34" cy="16" r="1.4"/><circle cx="12" cy="26" r="1.4"/><circle cx="32" cy="26" r="1.4"/></g></svg>' }
});

/* ---------- de kamers tekenen ---------- */
function buildErf(){}
function applyErf(){
  const f = S.f;
  vis('#ef-ladder', !f.goot); vis('#ef-roelof', !f.goot);
  vis('#sc-erf [data-hs="roelof"]', !f.goot); vis('#sc-erf [data-hs="ladder"]', !f.goot);
  vis('#ef-drip', !f.goot);
  vis('#ef-hoef', !f.hoefTaken); vis('#hit-hoef', !f.hoefTaken);
  vis('#ef-paardje', !f.paardjeTaken); vis('#sc-erf #hit-paardje', !f.paardjeTaken);
  $('#ef-kastled').setAttribute('fill', f.post ? '#5fd36a' : '#e2483d');
}
function applyStal(){
  const f = S.f;
  vis('#ps-shoe', !!f.hoef);
  vis('#ps-plankcover', !f.hoef);
  vis('#ps-carve', !!f.hoef);
  vis('#ps-prins', !f.schoft);
  vis('#ps-hole', !!f.schoft);
  vis('#ps-tin', !!f.schoft && !f.brief);
  vis('#ps-torchglow', !!f.licht && !f.brief);
  vis('#ps-dark', !f.licht);
  $('#sc-stal').classList.toggle('ps-lit', S.lampUit !== true);
  vis('#ps-lampglow', S.lampUit !== true);
}

/* Het hobbelpaardje (de gratis hint) zit in elk hoofdstuk ergens anders; dit zeg je als je het pakt. */
const PAARDJE_SAY = {
  1: ["Een klein houten hobbelpaardje, met een rood zadeltje. Het staat op de wagen, tussen de bloemen.",
      "Als je het aanraakt, hobbelt het heen en weer. Het lijkt wel te knikken. Ja… ja… die kant op!",
      "Je stopt het in je rugzak. Laat het iets zien als je vastzit: het knikt je dan gratis de goede kant op."]
};

/* ---------- klikvlakken ---------- */
const H = {
  paardje(){
    if(S.scene === 'stal') { gag('#ps-paardje', 'rocking', 2400); beep(300, .06, 'triangle', .04); setTimeout(() => beep(260, .06, 'triangle', .04), 300);
      return say("Het hobbelpaardje in het boograam hobbelt heen en weer. Klok, klok. Het staat er al jaren en kijkt elke ochtend naar de zon."); }
    S.f.paardjeTaken = true; give('paardje'); applyVisuals(); say(PAARDJE_SAY[S.ch] || PAARDJE_SAY[1]);
  },
  /* ---- het erf ---- */
  roelof(){
    if(!S.f.introDone) return;
    if(!S.f.goot) return say([['roelof', "Moi! Jij bent zeker de gast voor de Paardenstal. Ik ben Roelof. Ditty doet de B&B, ik doe de klusjes. En die zijn er altijd."],
      ['roelof', "Deze dakgoot loopt over, zie je die druppels aan het eind? Het water stroomt de verkeerde kant op. Help je even mee rekenen?"]], () => openGoot());
    say([['roelof', "Dank je wel!"]]);
  },
  ladder(){ say(S.f.goot ? "De ladder is weg." : ["Een lange aluminium ladder, tegen de dakgoot. Roelof staat erop.", "Hij staat precies voor het sleutelkastje. Daar kom je dus niet bij zolang Roelof bezig is."]); },
  goot(){
    if(S.f.goot) return say("De dakgoot loopt nu mooi schuin af naar de regenpijp. Geen druppel loopt er meer over.");
    say(["Een zinken dakgoot langs het voorhuis. Aan het rechter eind druppelt het water over de rand.", "De regenpijp zit aan de linkerkant."]);
  },
  voordeur(){
    if(!S.f.post) return say(["Je drukt op de bel. Ding dong… Niemand.", "Op de deur hangt een briefje."]);
    say("De voordeur van het voorhuis. Daar wonen Ditty en Roelof. Jouw kamer heeft een eigen deur: de staldeur, bij de schuur.");
  },
  briefje(){ openModal('Een briefje op de deur', 'Met een punaise, in sierlijk handschrift', `
    <div class="note-paper">Moi, en welkom op de Albertsmaheert!<br><br>
      Ik ben even boodschappen doen in Bedum. Je sleutel ligt in het sleutelkastje naast de deur.<br>
      De code? Die staat op elke brief die bij ons in de bus valt. Alleen de cijfers!<br><br>
      Roelof is er ook, ergens op een ladder denk ik.
      <div class="sig">Tot straks! Ditty</div></div>`); },
  huisnr(){ say(["Huisnummer 60. Wolddijk 60.", "De Wolddijk is een van de oudste wegen van de stad Groningen naar het noorden, het Hogeland."]); },
  kastje(){
    if(S.f.post) return say("Het sleutelkastje staat open. Leeg: jouw sleutel heb je al.");
    if(!S.f.goot) return say(["Het sleutelkastje, met zes knopjes en een rood lampje.", "De ladder van Roelof staat ervoor. Daar kun je niet bij zonder hem eraf te duwen. En dat doe je natuurlijk niet."]);
    openKastje();
  },
  brievenbus(){
    say(["Een blauwe brievenbus op een paal. Op de klep: Wolddijk 60, 9784 TE Noordwolde.", "Er steekt een folder uit."], () => openFolder());
  },
  ramen(){ say("Witte ramen met kleine ruitjes en groene luiken. In de vensterbank staan bloemen. Ditty houdt van bloemen, dat zie je overal."); },
  schoorsteen(){ say("Er komt een dun rookpluimpje uit de schoorsteen. Er staat vast koffie, of een pan soep."); },
  dakramen(){ say(["Drie dakramen in het grote dak van de schuur. Daar was vroeger de hooizolder.", "Nu zijn het drie B&B-kamers, genoemd naar borgen die hier vroeger in de buurt stonden: Thedema, Alma en Folkerda."]); },
  deeldeur(){ say(["De grote deeldeuren van de schuur. Hier reden vroeger de hooiwagens naar binnen.", "Daarachter is nu de zaal, waar de koeien stonden. Morgenavond is daar een feest, zegt een briefje op de deur."]); },
  stalraam(){ say("Een boograam met een hobbelpaardje in de vensterbank. Dat moet jouw kamer zijn: de Paardenstal."); },
  stal(){
    if(S.f.stalOpen) return go('stal');
    if(!has('sleutel')) return say(["De staldeur van de oude paardenstal. Op het bordje ernaast staat: Paardenstal.", "Op slot. Je sleutel ligt in het sleutelkastje bij de voordeur, zegt Ditty's briefje."]);
    take('sleutel'); S.f.stalOpen = true; save(); beep(500, .06); setTimeout(() => beep(700, .08), 120);
    say("Klik, klak. De staldeur gaat open, de bovenste helft eerst. Je stapt naar binnen…", () => go('stal'));
  },
  bord(){
    S.f.moi = (S.f.moi || 0) + 1; save();
    if(S.f.moi >= 2 && !S.ach.moi){ S.ach.moi = true; save(); return say(["Je zegt hardop: \"Moi!\"", "Een zwaluw scheert langs. Je bent nu officieel een beetje Gronings."]); }
    say(["Het welkomsbord op de wagen. Met krijt: Albertsmaheert. B&B, zaal, museum. Moi!", "Moi is Gronings voor hallo. En voor dag. Je zegt het de hele dag, bij komen én gaan."]);
  },
  bnbbord(){ say(["Het bord van de B&B aan de weg: een dakje van zwarte pannen, foto's van de kamers, en een bak vol rode geraniums.", "Ernaast wappert de Groninger vlag: rood, blauw, en een groen kruis met wit. Hier ben je echt in Groningen."]); },
  geiten(){ gag('#ef-geiten', 'mek', 1400); beep(420, .25, 'sawtooth', .03); setTimeout(() => beep(380, .3, 'sawtooth', .03), 260);
    say(["Mèèèh! Drie geitjes in het veld voor de boerderij. Een witte, een bruine en een zwarte.", ['roelof', "Vroeger hadden we koeien en schapen. De laatste jaren houden de geitjes het gras kort. En ze eten alles, ook de bloemen van Ditty."]]); },
  ballon(){ gag('#ef-balloons', 'bob', 1200); beep(700, .05, 'sine', .04); say("Rode ballonnen aan de wagen. Morgen is er feest in de zaal."); },
  wiel(){ gag('#ef-wheel', 'spin', 2200); beep(200, .1, 'triangle', .04); say(["Je geeft het wagenwiel een zetje. Het draait knarsend een rondje.", "Een houten wiel met een ijzeren band eromheen. Die band zette de smid er gloeiend heet om: als hij afkoelt, krimpt hij, en dan zit alles muurvast."]); },
  hoef(){ S.f.hoefTaken = true; give('hoefijzer'); applyVisuals(); say(["In het gras onder de wagen glimt iets. Een oud hoefijzer!", "Roestig, met nog een paar nagelgaatjes. Dat bewaar je."]); },
  fiets(){ say(["Jouw fiets, met fietstassen. Je bent hier langs de knooppunten naartoe gefietst, over de dijkjes en langs de weilanden.", "De laatste kilometers ging het vanzelf. Het is hier zo plat als een pannenkoek."]); },
  knoop(){ say(["Een groen-wit bordje van de fietsknooppunten. Je fietst van nummer naar nummer, zonder kaart.", "Vanaf hier rijd je zo naar oude kerkjes, wierden, molens en de scheve toren van Bedum."]); },
  martini(){ S.ach.martini = true; save(); say(["Ver weg aan de horizon steekt een torentje boven de bomen uit.", "Dat is de Martinitoren, in de stad Groningen: hemelsbreed 7,5 kilometer hiervandaan. Die zie je zo ver omdat het land zo plat is."]); },
  ree(h){
    if(!gag('#ef-ree', 'flee', 5200)) return;
    S.ach.ree = true; save(); beep(900, .05, 'sine', .04);
    say(["Een ree! Hij kijkt je even aan… en springt dan met een paar grote sprongen weg, achter de schuur.", "Ditty zegt dat ze er bijna elke dag zijn, in de tuin aan de zuidkant."]);
  },
  zwaluw(){
    S.f.zw = (S.f.zw || 0) + 1; save(); gag('#sc-erf .ef-swallows', 'swoop', 1600);
    if(S.f.zw >= 3){ S.ach.zwaluw = true; save(); return say("Een, twee, drie… elf zwaluwen! Ze wonen in de schuur. Elk voorjaar komen ze terug uit Afrika, naar precies hetzelfde nest."); }
    say("Zwaluwen scheren over het erf en vangen muggen. Hoeveel zijn het er?");
  },
  /* ---- de Paardenstal ---- */
  uitstal(){
    if(S.f.out1) return nextChapter();
    go('erf');
  },
  haak(){
    if(S.f.hoef) return say("Het hoefijzer hangt aan de spijker, met de open kant naar boven. Zo blijft het geluk erin.");
    say(["Boven de deur zit een dikke spijker in een oude plank. Daar hing vroeger vast iets aan.", has('hoefijzer') ? "Je denkt aan het hoefijzer in je rugzak." : "Er hangt niets aan."]);
  },
  plank(){
    if(S.f.hoef) return say(["Er is iets in de plank gekerfd, heel oud: Kiek bie de schoft. H.", "Kiek bie de schoft is Gronings voor: kijk bij de schoft. En H… wie is H?"]);
    say("Een oude plank boven de deur, met een spijker erin. Hij zit een beetje los.");
  },
  ruif(){
    if(S.f.brief) return say("De oude ruif. Hier trokken de paarden vroeger hun hooi uit. Nu is het versiering, en een heel goede verstopplek.");
    say(["Een oude ruif, het rek waar de paarden hun hooi uit plukten. Eronder de voerbak.", "Roelof heeft hem laten zitten toen de stal een kamer werd. Er ligt nog wat stro in."]);
  },
  bordjes(){ say(["Stalbordjes met de namen van de paarden die hier stonden: Bles, Mina, Dirk en Prins.", "Elk paard had zijn eigen plek, met zijn naam erboven."]); },
  prins(){
    if(!S.f.schoft) return say("Het stalbordje van Prins. Het zit een beetje scheef.");
    if(S.f.brief) return say("Achter het bordje van Prins zit een gat in de muur. Leeg nu.");
    if(!S.f.licht) return say(["Achter het bordje van Prins zit een gat in de muur. Pikdonker.", "Je steekt je hand niet zomaar in een gat van honderd jaar oud. Had je maar licht…"]);
    openBlik();
  },
  fotos(){ openFotos(); },
  raam1(){ say(["Een boograam, zoals in een echte paardenstal. Buiten wordt het donker; de maan komt op.", "De ramen liggen op het oosten. Morgenvroeg schijnt de zon hier als eerste naar binnen: lekker koel in de zomer, zegt Ditty."]); },
  raam2(){ say(["Achter in de wei staat een ree te grazen, een donker silhouet tegen de lucht.", "Hij kijkt niet eens op."]); },
  hooglander(){ beep(150, .5, 'sawtooth', .03); say(["Een schilderij van een koe met lange horens en een rode pony.", "Moeeeh, zegt ze niet. Maar je hoort het toch."]); },
  bed(){
    S.f.bed = (S.f.bed || 0) + 1; save(); gag('#ps-bed', 'boing', 600); beep(260, .08, 'sine', .05);
    if(S.f.bed >= 3){ S.ach.bed = true; save(); return say(["Boing, boing, BOING. Je ligt languit, en je voeten komen niet eens bij het eind.", "Extra lange boxsprings, met toppers erop. Ditty denkt aan iedereen, ook aan lange mensen."]); }
    say("Een groot bed met een okergele sprei. Het veert heerlijk.");
  },
  welkom(){
    openModal('Een kaartje op het bed', 'Van Ditty', `
      <div class="note-paper">Welkom in de Paardenstal!<br><br>
        Ontbijt is morgen in de eetzaal, vanaf half negen. Er is wifi, en in de recreatiezaal staan een pooltafel, een voetbaltafel en een tafeltennistafel.<br><br>
        Morgenavond is er feest in de zaal. Je bent van harte welkom!
        <div class="sig">Slaap lekker, Ditty</div></div>
      <div class="row" style="margin-top:12px"><a class="btn ghost" href="${SITE}accommodation/paardenstal/" target="_blank" rel="noopener">De echte Paardenstal</a></div>`);
  },
  wekker(){
    beep(523, .1); setTimeout(() => beep(659, .1), 150); setTimeout(() => beep(784, .14), 300);
    gag('#ps-notes', 'notes', 1600);
    say(["Je drukt op de wekkerradio. Er klinkt een liedje van Radio Noord, en dan het weerbericht:", "\"Morgen zonnig, met af en toe een wolkje boven het Hogeland.\""]);
  },
  lamp(){ S.lampUit = !S.lampUit; save(); applyVisuals(); beep(S.lampUit ? 300 : 600, .04); say(S.lampUit ? "Klik. Het licht is uit. Nu zie je de maan door de boogramen." : "Klik. Het licht is weer aan."); },
  bloemen(){ say("Een vaas met verse bloemen op het tafeltje. Die zet Ditty in elke kamer."); },
  rieten(){ beep(180, .2, 'triangle', .03); say("Je gaat even zitten in de rieten stoel. Kraak. Hij zit heerlijk."); }
};

/* ---------- puzzel 1: de dakgoot (afschot: een paar millimeter per meter) ---------- */
function openGoot(){
  const opts = [['3', '3 mm'], ['4', '4 mm'], ['12', '12 mm'], ['36', '36 mm'], ['360', '360 mm']];
  openModal('De dakgoot', 'Roelof op de ladder · "Hoeveel hoger moet het rechter eind?"', `
    <svg viewBox="0 0 520 170" class="pz-svg" aria-hidden="true">
      <rect x="0" y="0" width="520" height="170" fill="#2a3a4a" rx="6"/>
      <path d="M40 60 L480 60" stroke="#c8ced4" stroke-width="3" stroke-dasharray="6 6"/>
      <path d="M40 80 L480 52" stroke="#9aa4ae" stroke-width="14" stroke-linecap="round"/>
      <rect x="30" y="80" width="16" height="80" fill="#9aa4ae"/>
      <text x="38" y="40" fill="#f8f0e0" font-family="IBM Plex Mono, monospace" font-size="12" text-anchor="middle">regenpijp</text>
      <path d="M480 52 v-30 M40 80 v-58" stroke="#e8b04a" stroke-width="1.5"/>
      <text x="260" y="110" fill="#f8f0e0" font-family="IBM Plex Mono, monospace" font-size="13" text-anchor="middle">goot: 12 meter lang</text>
      <path d="M40 120 H480 M40 114 v12 M480 114 v12" stroke="#f8f0e0" stroke-width="2"/>
      <text x="492" y="40" fill="#e8b04a" font-family="IBM Plex Mono, monospace" font-size="14">?</text>
      <g fill="#6aa8d8"><circle cx="300" cy="65" r="3"/><circle cx="200" cy="72" r="3"/><circle cx="120" cy="76" r="3"/></g>
    </svg>
    <p>Roelof: "Een dakgoot moet een beetje schuin hangen, anders blijft het water staan. Dat heet <b>afschot</b>. Ik houd <b>3 millimeter per meter</b> aan. De goot is <b>12 meter</b>. Hoeveel hoger moet de beugel aan het rechter eind zitten dan bij de regenpijp?"</p>
    <div class="opts">${opts.map(([v, l]) => `<button type="button" class="opt" data-v="${v}"><b>${l}</b></button>`).join('')}</div>
    <div class="feedback" id="g-fb"></div>`, body => {
    body.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const v = b.dataset.v;
      if(v === '36'){ b.classList.add('ok'); fb('#g-fb', '12 meter × 3 millimeter = 36 millimeter. Roelof schuift de beugel omhoog…', 'good');
        S.f.goot = true; save(); return solved(gootDone); }
      nope();
      fb('#g-fb', { '3': 'Dat is het afschot per meter. Maar de goot is 12 meter lang…', '4': '12 gedeeld door 3? Roelof fronst. Het is niet "hoeveel keer", het is elke meter 3 millimeter erbij.',
        '12': 'Dat is de lengte van de goot. Hoeveel millimeter komt er bij als het elke meter 3 millimeter hoger wordt?', '360': '36 centimeter? Dan wordt het een glijbaan. Het water spuit er aan de andere kant uit!' }[v], 'bad');
    });
  });
}
function gootDone(){
  applyVisuals(); give('zaklamp');
  say([['roelof', "Hè hè. Hoor je het? Het water klatert nu netjes naar de regenpijp. Dank je wel!"],
       ['roelof', "Hier, neem mijn zaklamp mee. In de oude paardenstal is het 's avonds in de hoeken pikdonker."],
       ['roelof', "Ditty is even naar Bedum. Je sleutel ligt in het kastje bij de voordeur. O, en vind je ergens een hoefijzer: hang het met de open kant naar boven. Anders valt het geluk eruit."],
       ['sys', "Roelof klimt van de ladder en sjouwt hem naar de schuur."]]);
}

/* ---------- puzzel 2: het sleutelkastje (een postcode: vier cijfers en twee letters) ---------- */
function openKastje(){
  let code = S.kst || '';
  openModal('Het sleutelkastje', 'Naast de voordeur · vier cijfers', `
    <div class="pz-row"><div>
      <div class="lcd" id="k-lcd">${code.padEnd(4, '·')}</div>
      <div class="keypad">${[1,2,3,4,5,6,7,8,9,'C',0,'OK'].map(k => `<button type="button" data-k="${k}">${k}</button>`).join('')}</div>
    </div><p style="flex:1 1 220px;margin:0">Op het kastje staat een sticker: <i>"Vier cijfers."</i> Daaronder, in Ditty's handschrift: <i>"Je weet hem wel!"</i></p></div>
    <div class="feedback" id="k-fb"></div>`, body => {
    body.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
      const k = b.dataset.k; beep(700, .03);
      if(k === 'C') code = '';
      else if(k === 'OK'){
        if(code === '9784'){ fb('#k-fb', 'Piep! Het lampje wordt groen. 9784 is de postcode van de Albertsmaheert.', 'good'); S.f.post = true; S.kst = ''; save(); return solved(postDone); }
        nope();
        fb('#k-fb', code === '0060' || code === '60' ? 'Dat is het huisnummer. Maar op een envelop staan nog meer cijfers…' : code.length < 4 ? 'Het moeten vier cijfers zijn.' : 'Bzzzt. Rood. Wat staat er op elke brief die bij Ditty in de bus valt?', 'bad');
        code = '';
      } else if(code.length < 4) code += k;
      S.kst = code; save();
      $('#k-lcd').textContent = code.padEnd(4, '·');
    });
  });
}
function postDone(){
  applyVisuals(); give('sleutel');
  say(["Het klepje springt open. Aan een haakje hangt een sleutel met een hoefijzertje en het woord PAARDENSTAL.",
       "9784: de postcode. Een Nederlandse postcode heeft vier cijfers en twee letters. Hoe lager het eerste cijfer, hoe westelijker; met een 9 zit je helemaal in het noorden, in Groningen, Friesland of Drenthe."]);
}

/* ---------- puzzel 3: het hoefijzer (de open kant naar boven) ---------- */
function openHoef(){
  openModal('Het hoefijzer ophangen', 'Boven de staldeur · een dikke spijker', `
    <p>Hoe hang je het hoefijzer aan de spijker?</p>
    <div class="opts">
      <button type="button" class="opt" data-v="op"><svg viewBox="0 0 60 60" width="60"><path d="M14 14 v16 a16 16 0 0 0 32 0 v-16" fill="none" stroke="#9aa4ae" stroke-width="7" stroke-linecap="round"/></svg><b>Open kant naar boven</b></button>
      <button type="button" class="opt" data-v="neer"><svg viewBox="0 0 60 60" width="60"><path d="M14 46 v-16 a16 16 0 0 1 32 0 v16" fill="none" stroke="#9aa4ae" stroke-width="7" stroke-linecap="round"/></svg><b>Open kant naar beneden</b></button>
      <button type="button" class="opt" data-v="zij"><svg viewBox="0 0 60 60" width="60"><path d="M46 14 h-16 a16 16 0 0 0 0 32 h16" fill="none" stroke="#9aa4ae" stroke-width="7" stroke-linecap="round"/></svg><b>Op zijn kant</b></button>
    </div><div class="feedback" id="h-fb"></div>`, body => {
    body.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      if(b.dataset.v === 'op'){ b.classList.add('ok'); take('hoefijzer'); S.f.hoef = true; save(); fb('#h-fb', 'Het hoefijzer hangt. Krak… de spijker zakt een stukje, en de oude plank kantelt!', 'good'); return solved(hoefDone, 1600); }
      nope(); fb('#h-fb', b.dataset.v === 'neer' ? 'Zo valt het geluk eruit, zeggen ze op het platteland. Roelof zei er ook iets over…' : 'Een hoefijzer op zijn kant? Dan rolt het geluk eruit. Hoe zei Roelof het ook alweer?', 'bad');
    });
  });
}
function hoefDone(){
  applyVisuals(); beep(200, .2, 'triangle', .05);
  say(["De plank boven de deur is een stukje gedraaid. Aan de achterkant, waar het hout nooit licht zag, staat iets gekerfd:",
       "\"Kiek bie de schoft. H.\"",
       "Kiek bie de schoft: Gronings voor \"kijk bij de schoft\". Maar wat is een schoft? En wie is H?"]);
}

/* ---------- puzzel 4: de stokmaat (een paard meet je bij de schoft, niet bij het hoofd) ---------- */
const HORSES = [
  // naam, schofthoogte (cm), hoofd: hoe hoog de neus is (cm), kleur, bles
  ['Bles', 156, 196, '#8a5a32', true],
  ['Mina', 150, 172, '#c9a070', false],
  ['Dirk', 161, 182, '#3a2a20', false],
  ['Prins', 168, 118, '#6a4a30', false]
];
function horseSvg(h, x, scale){
  const [name, sh, nose, col, bles] = h, y0 = 200, k = scale;
  const top = y0 - sh * k, back = top + 6, nx = nose < sh ? 1 : 0;
  // het lijf, de schoft (een bultje boven de voorbenen) en de hals naar het hoofd
  const neckTopX = x + 46, headY = y0 - nose * k;
  return `<g>
    <path d="M${x - 40} ${back + 6} C${x - 44} ${back + 50} ${x + 36} ${back + 54} ${x + 40} ${back + 6} Z" fill="${col}"/>
    <path d="M${x - 40} ${back + 4} Q${x} ${back + 12} ${x + 30} ${top + 2}" stroke="${col}" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M${x + 26} ${top + 6} L${neckTopX + 14} ${headY + 8}" stroke="${col}" stroke-width="18" stroke-linecap="round"/>
    <ellipse cx="${neckTopX + 20}" cy="${headY + 8}" rx="16" ry="9" fill="${col}" transform="rotate(${nx ? 50 : 20} ${neckTopX + 20} ${headY + 8})"/>
    ${bles ? `<ellipse cx="${neckTopX + 24}" cy="${headY + 8}" rx="9" ry="2.6" fill="#f3efe6" transform="rotate(20 ${neckTopX + 24} ${headY + 8})"/>` : ''}
    <path d="M${x + 18} ${back + 30} L${x + 20} ${y0} M${x + 28} ${back + 30} L${x + 30} ${y0} M${x - 26} ${back + 30} L${x - 28} ${y0} M${x - 34} ${back + 30} L${x - 36} ${y0}" stroke="${col}" stroke-width="7" stroke-linecap="round"/>
    <path d="M${x - 42} ${back + 10} q-12 16 -8 34" stroke="#2a1a10" stroke-width="5" fill="none"/>
    <circle cx="${x + 30}" cy="${top + 1}" r="3" fill="#e8b04a" opacity=".0"/>
    <text x="${x}" y="${y0 + 18}" fill="#f8f0e0" font-family="Caveat, cursive" font-size="20" text-anchor="middle">${name}</text>
  </g>`;
}
function openFotos(){
  const k = .9, scale = y => 200 - y * k;
  const ticks = [];
  for(let cm = 100; cm <= 200; cm += 10) ticks.push(`<path d="M8 ${scale(cm)} h${cm % 50 ? 8 : 14}" stroke="#3a2a1a" stroke-width="2"/>${cm % 20 === 0 ? `<text x="26" y="${scale(cm) + 4}" font-family="IBM Plex Mono, monospace" font-size="10" fill="#3a2a1a">${cm}</text>` : ''}`);
  openModal('Oude paardenfoto\'s', 'Bles, Mina, Dirk en Prins · ze stonden hier ooit, elk op zijn eigen plek', `
    <svg viewBox="0 0 560 230" class="pz-svg" aria-hidden="true" style="max-width:640px">
      <rect width="560" height="230" fill="#4a3a2a" rx="6"/>
      <rect x="4" y="4" width="48" height="222" fill="#e9dcb8"/>${ticks.join('')}
      ${[100, 120, 140, 160, 180].map(cm => `<path d="M52 ${scale(cm)} H556" stroke="#f8f0e0" stroke-width=".6" opacity=".25"/>`).join('')}
      <path d="M52 200 H556" stroke="#c9b393" stroke-width="2"/>
      ${HORSES.map((h, i) => horseSvg(h, 120 + i * 120, k)).join('')}
    </svg>
    <p>Naast de foto's hangt een oude houten meetlat: de <b>stokmaat</b>. Op de achterkant van een foto staat met potlood: <i>"Een paard meet je aan de schoft: de bult boven de voorbenen, waar de hals overgaat in de rug. Een hoofd gaat op en neer."</i></p>
    <p>Welk paard was het grootst?</p>
    <div class="opts">${HORSES.map(([n]) => `<button type="button" class="opt" data-v="${n}"><b>${n}</b></button>`).join('')}</div>
    <div class="feedback" id="f-fb"></div>`, body => {
    body.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const v = b.dataset.v;
      if(S.f.schoft) return fb('#f-fb', 'Prins was het grootst: 168 centimeter aan de schoft.', 'good');
      if(v === 'Prins'){ b.classList.add('ok'); S.f.schoft = true; save(); fb('#f-fb', 'Prins: 168 centimeter aan de schoft, ook al graast hij met zijn hoofd omlaag. Er klinkt iets bij de ruif…', 'good'); return solved(schoftDone, 1800); }
      nope();
      fb('#f-fb', v === 'Bles' ? 'Bles steekt zijn hoofd het hoogst in de lucht. Maar dat zegt niks: kijk naar de schoft.'
        : v === 'Dirk' ? 'Dirk is groot, 161 centimeter aan de schoft. Maar er is er een die nog groter is, al zie je dat niet meteen.'
        : 'Mina is juist de kleinste: 150 centimeter aan de schoft.', 'bad');
    });
  });
}
function schoftDone(){
  applyVisuals(); beep(240, .2, 'triangle', .05);
  say(["Boven de ruif valt het stalbordje van Prins scheef naar beneden. Het hangt nog aan één spijker.",
       "Achter het bordje zit een donker gat in de muur."]);
}

/* ---------- de zaklamp in het gat, en de brief van Harm ---------- */
function shineTorch(){
  if(!S.f.schoft) return say("Je schijnt met de zaklamp in de ruif. Stro, spinnenwebben en een heel oude haverkorrel. Verder niks.");
  S.f.licht = true; save(); applyVisuals(); beep(800, .05);
  say(["Je schijnt met de zaklamp in het gat achter het bordje van Prins.", "Daar staat een groen blikken trommeltje, onder het stof."]);
}
function openBlik(){
  openModal('Een blikken trommeltje', 'Achter het stalbordje van Prins', `
    <p>Het deksel zit vast van de roest, maar met een beetje wrikken… krrr… gaat het open. Er zit een opgevouwen brief in, geel van ouderdom.</p>
    <button class="btn" type="button" id="b-read">Lees de brief</button>`, body => { body.querySelector('#b-read').onclick = () => { closeModal(); openBrief(); }; });
}
function openBrief(){
  const first = !S.f.brief;
  openModal('De brief van Harm', 'Noordwolde, 12 september 1921', `
    <div class="note-paper old">Aan wie dit vindt,<br><br>
      Ik ben Harm, knecht op deze boerderij. Deze boerderij hoorde vroeger bij de borg Thedema. Toen de borg verdween, kreeg de boer een kistje uit de borg. Wat erin hoort, is het mooiste wat deze boerderij heeft.<br><br>
      Ik heb het verstopt, voor wie hier na ons komt. Het kistje staat ergens anders dan wat erin hoort, en de sleutel ligt in het hout waar het hooi lag: daar waar de drie borgen elk een teken geven.<br><br>
      Begin boven.
      <div class="sig">Harm</div></div>
    <p style="margin-top:10px;color:var(--muted)">Onderaan staat nog een tekeningetje: een kistje met een slot, en vier streepjes.</p>`,
    null, first ? () => { S.f.brief = true; save(); win1(); } : null);
}

/* ---------- begin en einde ---------- */
function intro1(){
  say([['sys', "Vrijdagavond. Je fietst over de Wolddijk, een van de oudste wegen van de stad Groningen naar het noorden."],
       ['sys', "Links en rechts weilanden zo ver als je kunt kijken. En dan, achter een rij grote bomen: nummer 60. De Albertsmaheert."],
       ['you', "Hier is het! Daar hangt een bord met Moi! en rode ballonnen."],
       ['roelof', "Moi! Ik kom zo, hoor! Ik sta even op een ladder!"],
       ['sys', "Kijk rond en klik overal op. Een hint nodig? Klik op Hint, of zoek het houten hobbelpaardje."]], () => { S.f.introDone = true; save(); });
}
function win1(){
  S.f.out1 = true; save(); applyVisuals(); chord([523,659,784,1046,1318], 120);
  say([['ditty', "Moi! Daar ben ik weer, met de boodschappen. En jij bent er al! Welkom op de Albertsmaheert."],
       ['you', "Moi Ditty! Kijk eens wat ik heb gevonden. Achter het stalbordje van Prins…"],
       ['ditty', "Een brief? Van Harm, uit 1921? Roelof! Roelof, kom eens kijken!"],
       ['roelof', "Een kistje uit de borg Thedema… Ditty, dat kistje! Dat heb ik gevonden toen we de hooizolder verbouwden. Het staat in mijn museum. Niemand krijgt het open."],
       ['roelof', "\"Begin boven\". Dat is de hooizolder: daar zijn nu Thedema, Alma en Folkerda."],
       ['ditty', "Morgen na het ontbijt gaan we zoeken. Nu eerst slapen. Slaap lekker in de Paardenstal!"]], showWin);
}
