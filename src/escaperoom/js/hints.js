// Alle hints (twee per puzzel: eerst een duwtje, dan het antwoord) en hoe het spel bepaalt bij welke puzzel je bent.
// Geladen op volgorde door js/boot.js; alle spelbestanden delen dezelfde globale ruimte.

const HINTS = {
  /* hoofdstuk 1 */
  goot: ["Roelof staat op een ladder bij de dakgoot. Klik op hem: hij heeft hulp nodig met rekenen.", "3 millimeter per meter, en de goot is 12 meter: 12 × 3 = 36 millimeter."],
  post: ["Je sleutel zit in het sleutelkastje naast de voordeur. Lees het briefje op de deur: de code staat op elke brief die hier aankomt.", "Kijk op de brievenbus: Wolddijk 60, 9784 TE Noordwolde. De code is de postcode zonder letters: 9784."],
  stal: ["Je hebt de sleutel. Waar is jouw kamer?", "Klik op de staldeur van de schuur, met het bordje Paardenstal ernaast."],
  hoefijzer: ["Er moet iets boven de deur van de Paardenstal hangen. Heb je onder de welkomswagen op het erf goed gekeken?", "In het gras onder de wagen ligt een hoefijzer. Pak het, ga naar de Paardenstal en gebruik het op de haak boven de deur."],
  hoef: ["Hang het hoefijzer aan de spijker boven de staldeur. Weet je nog wat Roelof zei?", "Met de open kant naar boven, anders valt het geluk eruit."],
  schoft: ["\"Kiek bie de schoft\": kijk bij de schoft. Tussen de ramen hangen oude foto's van de paarden, met een stokmaat.", "Een paard meet je aan de schoft (boven de voorbenen), niet aan het hoofd. Prins graast, maar is het grootst: 168 cm."],
  licht: ["Achter het stalbordje van Prins is een gat. Het is daar pikdonker.", "Gebruik de zaklamp van Roelof op het gat achter het bordje van Prins, en klik er dan op."],
  brief: ["In het gat achter het bordje van Prins staat een trommeltje.", "Klik op het gat achter het bordje van Prins en lees de brief."],
  /* hoofdstuk 2 */
  katrol: ["Van buiten roept Roelof. Klik op het oude hooiluik.", "Kies B: een losse katrol. Twee touwen dragen de kist, dus je trekt 20 kilo, en je hebt 2 × 5 = 10 meter touw nodig."],
  telmerk: ["Ga naar kamer Thedema. Op de tafel ligt het werkboekje van Roelof, over de korbelen en de streepjes op de stijl.", "Λ = 5, I = 1, X = 10: ΛIII = 8, IIII = 4, XI = 11, ΛI = 6."],
  behang: ["In kamer Alma laat het behang los. Roelof helpt je, nu zijn kist boven is.", "Klik op de losse baan en kies baan C: daar komen de halve bloemen precies op dezelfde hoogte uit."],
  prenten: ["In kamer Folkerda liggen drie prenten op het bed. Ditty's kaartje beschrijft de drie borgen.", "Prent P is Thedema (de ronde toren), Q is Folkerda (drie trapgevels), R is Alma (de brug over de gracht)."],
  /* hoofdstuk 3 */
  kist: ["Het kistje van Thedema staat op de witte tafel in het museum. Je hebt de oude sleutel.", "Kies de oude sleutel in je rugzak en klik op het kistje."],
  bascule: ["\"Waar één kilo er tien weegt\": de bascule op de tafel.", "Leg 5 en 2 kilo op het schaaltje (7 kilo). Dat houdt 70 kilo in evenwicht: een mud aardappelen weegt 70 kilo."],
  karn: ["\"Waar de melk boter wordt\": de karntonnen.", "Melken, een nacht laten staan, de room afscheppen, karnen, de karnemelk eruit, kneden en zouten."],
  spreuk: ["\"Waar de Grunneger zegt wat hij denkt\": het spreukenbord naast de schoolplaat.", "Moi = hallo en dag; Nait soez'n, moi doun = niet zeuren, gewoon doen; Kop d'r veur = zet door; Wicht = meisje."],
  akkers: ["\"Op het land, waar elk jaar iets anders groeit\": klim met de ladder naar het platte dak en bekijk de akkers met Harms kaart.", "1922: A graan, B kool, C suikerbieten. 1923: A suikerbieten, B graan, C kool."],
  woord: ["Je hebt alle vier de letters: G, R, U en P. Klik op het kistje.", "Het woord is GRUP: de mestgoot achter de koeien in de koestal."],
  /* hoofdstuk 4 */
  lampjes: ["De feestverlichting doet het niet: de lampjes zitten in serie. Klik op de slinger en meet met Roelofs tester.", "Meet steeds in het midden (tot 8, dan 12, dan 10, dan 11). Lampje 11 is stuk: vervang het."],
  tafel: ["Ditty puzzelt met de tafelschikking. Klik op de tafel of op Ditty.", "Stoel 1 Ditty, 2 Roelof, 3 Jij, 4 tante Grietje, 5 buurman Jan."],
  pool: ["Roelof zoekt zijn dopsleutel. Neef Sjoerd daagt je uit aan de pooltafel.", "Richt op ruit 2: zo kaatst de witte bal via de bovenband in het middenzakje."],
  sporen: ["Roelof vergat zijn koevoet in de tuin. Ga door de glazen deuren naar buiten en bekijk de sporen in het gras.", "Spoor 1 (twee puntige teentjes, een hartje) is van de ree. Het loopt naar de schommels: pak daar de koevoet."],
  bouten: ["Op de glazen plaat in de vloer zitten vier bouten.", "Gebruik de dopsleutel op de glazen plaat."],
  wrik: ["De bouten zijn los. Nu de zware plaat nog.", "Gebruik de koevoet op de glazen plaat, en open het trommeltje."],
  kast: ["Op de overloop zit een kastje in de eiken stijl, met drie schijfjes. Elke borg gaf een teken: zet de telmerken om in getallen.", "Thedema ΛII = 7, Alma IIII = 4, Folkerda XI = 11."]
};
function stage1(){
  const f = S.f;
  if(!f.goot) return 'goot';
  if(!f.post) return 'post';
  if(!f.stalOpen) return 'stal';
  if(!f.hoef) return has('hoefijzer') ? 'hoef' : 'hoefijzer';
  if(!f.schoft) return 'schoft';
  if(!f.licht) return 'licht';
  return 'brief';
}
function stage2(){
  const f = S.f;
  if(!f.katrol) return 'katrol';
  if(!f.telmerk) return 'telmerk';
  if(!f.behang) return 'behang';
  if(!f.prenten) return 'prenten';
  return 'kast';
}
function stage3(){
  const f = S.f;
  if(!f.kistOpen) return 'kist';
  if(!f.bascule) return 'bascule';
  if(!f.karn) return 'karn';
  if(!f.spreuk) return 'spreuk';
  if(!f.akkers) return 'akkers';
  return 'woord';
}
function stage4(){
  const f = S.f;
  if(!f.lampjes) return 'lampjes';
  if(!f.tafel) return 'tafel';
  if(!f.pool && !f.bouten) return 'pool';
  if(!f.sporen && !f.grupOpen) return 'sporen';
  if(!f.bouten) return 'bouten';
  return 'wrik';
}
const STAGES = [stage1, stage2, stage3, stage4];
function stage_(){ return (STAGES[S.ch - 1] || stage1)(); }
