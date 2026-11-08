# De escaperoom: Het Geheim van de Albertsmaheert

Aantekeningen voor iedereen (en elke AI-agent) die aan de escaperoom werkt. Het spel staat op [albertsmaheert.nl/escaperoom/](https://albertsmaheert.nl/escaperoom/). Het algemene recept, gedeeld met *Hello, IT*, *Villa Kakelbont* en *Sinterklaas*, staat in [escape-room-blueprint.md](escape-room-blueprint.md); de motor is die van [w3nl/sinterklaas](https://github.com/w3nl/sinterklaas).

> **Spoilers:** hieronder staan de oplossingen van alle puzzels. Die heb je nodig om te testen.

## Wat dit is

Een point-and-click escaperoom in de browser, over en op de echte boerderij: B&B Albertsmaheert, Wolddijk 60, Noordwolde. Voor families en gasten, en tegelijk een uitnodiging om te komen logeren: elk eindscherm, de titel en de folder linken naar de site en naar reserveren.

- **Het verhaal:** je komt op vrijdagavond als gast aan. In de Paardenstal vind je een brief van **Harm**, knecht op de boerderij in 1921 (verzonnen). Hij verstopte de schat uit het kistje van borg Thedema. Je zoekt op de hooizolder, in het museum en op het platte dak, en op zaterdagavond vind je op het feest in de zaal, onder de oude grup, een foto van de boerderij in 1921 en Harms boodschap: het mooiste van een boerderij zijn de mensen aan tafel.
- 4 hoofdstukken, 8 kamers, 22 puzzels. Gewone HTML, CSS, JavaScript en SVG: **geen build, geen framework**. Alleen Google Fonts.
- **Alleen Nederlands** (net als het Sinterklaas-spel). `tx(tekst, { naam })` vult alleen `{naam}` in.
- Installeerbaar als app en offline speelbaar (service worker met bereik `/escaperoom/`). **Moet via http(s)** draaien.

## Hoe het in de site zit

- Alles van het spel staat in `src/escaperoom/`. `eleventy.config.cjs` **negeert** die map als template en **kopieert** hem ongewijzigd naar `_site/escaperoom/` (anders zou Nunjucks de HTML aanraken). De CI-workflow controleert met `diff` dat de kopie gelijk is.
- De homepage (`src/index.html`, en `src/en/index.html` in het Engels) heeft een blok dat naar het spel linkt. **Dat blok is nog verborgen** (`hidden`), en het spel heeft `noindex`, tot Ditty en Roelof akkoord zijn. Haal dan `hidden` uit beide homepages en de `robots`-regel uit `src/escaperoom/index.html`. Dat blok staat in de HTML, niet in `homepage.json` (die tekst is van de CMS).
- `tests/escaperoom/` (Playwright), `playwright.config.cjs`, `tools/escaperoom/personages.py` en dit bestand worden niet gepubliceerd.

```bash
npm ci
npm run start:escaperoom        # http://127.0.0.1:4174/escaperoom/
npx playwright install chromium # alleen de eerste keer
npm run test:escaperoom         # alle hoofdstukken uitspelen, plus opslaan, app, telefoon en beweging
npm run validate                # de hele site bouwen
```

## Kaart

| Pad (in `src/escaperoom/`) | Wat |
|---|---|
| `index.html` | De pagina: kop, speelveld, titel- en eindscherm (met de reclame `#w-promo`), rugzak, close-up, voettekst met links |
| `css/` | `base` (tokens: eikenhout, baksteenrood, strogoud; gedeelde puzzelonderdelen `.opts`, `.note-paper`, `.keypad`, `.dial`), `chapter1` … `chapter4`, `phone`, `animations` (als laatste: de noodstop) |
| `scenes/*.svg` | `erf` (`ef-`), `stal` (`ps-`), `zolder` (`zl-`), `kamer` (`km-`, één tekening voor Thedema, Alma en Folkerda), `museum` (`mu-`), `dak` (`dk-`), `zaal` (`za-`), `tuin` (`tn-`). Klikvlakken staan als laatste |
| `js/boot.js` | Haalt de kamers op, laadt de scripts; `GAME_VERSION` |
| `js/core.js` | Motor: `S`, opslaan, `unlocked`/`setUnlocked`, geluid, `say()`, `WHO`/`FACES`/`NARRATOR`, `ITEMS`, `vis()`, `ROOMS`, `go()`, `gag()`, `openModal()`, `fb()`, `solved()` |
| `js/chapter1.js` … `chapter4.js` | Per hoofdstuk: dingen, `applyX()`, klikvlakken (`H`, in hoofdstuk 1 aangemaakt), puzzels, `introN()`, `winN()` |
| `js/items.js`, `js/hints.js` | `useItem` (hoofdstuk 4 via `useItem4`), `HINTS` en `stage1()` … `stage4()` |
| `js/app.js` | Hoofdstukken (`startCh(n)`, `CH_START`), eindschermen (`CH_END`, `PROMO`), scores, prestaties (`ACH`), de folder (`openFolder()`), titelmenu, app |
| `js/ambience.js`, `js/voice.js` | Achtergrondgeluid per kamer (Web Audio), stemmen (Web Speech) |
| `portraits/*.svg` | `you`, `roelof`, `ditty`, `harm` (sepia), `paardje`, `gast`: gemaakt door `tools/escaperoom/personages.py` |

### Personages

- `tools/escaperoom/personages.py` tekent Roelof (blauwe boerenkiel, klompen, gereedschapsriem), Ditty (vest en schort met bloemetjes), de gasten, het hobbelpaardje, de ree en de portretten. In de kamers staan ze tussen `<!-- @personage naam -->` en `<!-- @einde naam -->`; pas die stukken niet met de hand aan, maar verander het script en draai `python3 tools/escaperoom/personages.py`.
- **Ditty en Roelof zijn echt** en getekend naar foto's. Ditty: kort grijs haar, een rode bril, een taupe blouse met witte bloemen, een lichte broek, een gouden kettinkje; zij doet de B&B (koffie, bloemen, ontbijt, "Moi!") en was vroeger juf op een basisschool (de schoolplaat, de tafelschikking, het kaartje bij de prenten). Roelof: kaal met een grijze rand, een donkere ronde bril; bij het klussen een groene overall, op het feest (`tool='glas'`) een blauw overhemd met print en een beige broek. Hij doet de klusjes en het museum, en knapte de International-trekkers (D-326, 633, Hydro 84) en de meeste machines zelf op.
- Wat klopt over de boerderij: Roelof verbouwde kool (wit en rood), graan en suikerbieten; vroeger waren er koeien en schapen, de laatste jaren geitjes in het veld voor de boerderij. Vanuit de kamers kijk je naar de stad Groningen: de rand van de stad ligt hemelsbreed 4 km weg, de Martinitoren 7,5 km.
- **Harm is verzonnen**, net als het kistje, de brieven, de schat, tante Grietje, buurman Jan en neef Sjoerd.

### Waar in de echte boerderij op gebaseerd

De kamers en hun ligging (Paardenstal beneden met ramen op het oosten; Thedema, Alma en Folkerda op de hooizolder aan de zuidkant met gebinten en uitzicht op de Martinitoren), extra lange boxsprings, de eetzaal, de zaal in de vroegere koestal, de recreatiezaal met pooltafel, de tuin op het zuiden met trampoline, schommels en reeën, de welkomswagen met krijtbord en rode ballonnen, het B&B-bord aan de weg met de Groninger vlag, de overloop met koelkastje, folders en quilt, de kroonluchters, de zaal (vurenhouten wanden, donkere balken met dakramen, grijze betonvloer, donkere tafels met rode en zwarte stoelen, palen op gemetselde voeten, de bar met krukken, de zithoek met kachel en de witte buffetkast), de borgprenten, de knooppuntenroute en de scheve toren van Bedum komen van de site en de foto's. Het museum is getekend naar foto's van het echte museum: een rode International-trekker met crèmekleurige wielen (Roelof heeft de D-326, de 633 en de Hydro 84 zelf opgeknapt; de 633 heeft hij al veertig jaar), de balenlift, de gereedschapswand, karntonnen, melkbussen, het juk, de rode katrollen, de schoolplaat en de groene strohakselaar.

## Opslaan en de hoofdstukken

- `S` is het hele spel, in `localStorage['amh-v1']`. `save()` bewaart daarnaast de stand van het huidige hoofdstuk in `amh-v1-st1` … `-st4`.
- **Een hoofdstuk houdt zijn stand.** Open je een hoofdstuk via het menu of met "Door naar hoofdstuk N" (`openChapter(n)` in `app.js`), dan kom je terug in de stand waarin je het verliet: een opgelost hoofdstuk blijft opgelost, met alle deuren open, en de uitgang leidt weer naar het volgende hoofdstuk. Bestaat er nog geen stand, dan begint het hoofdstuk vers (`FRESH[n]`).
- **"Opnieuw spelen"** op het eindscherm begint alleen dat hoofdstuk opnieuw. **"Nieuw spel"** wist de stand van alle hoofdstukken (`resetChapters()`); de vrijgespeelde hoofdstukken (`-ch2` … `-ch4`), de scores en de prestaties blijven.

## Oplossingen (spoilers)

Hoofdstuk 1, vrijdagavond (erf en Paardenstal):

| Puzzel (echt idee) | Oplossing | Vlaggen |
|---|---|---|
| Dakgoot (afschot: 3 mm per meter) | Klik op Roelof: 12 m × 3 mm = **36 mm**. Je krijgt de zaklamp | `goot` |
| Sleutelkastje (een postcode) | Briefje op de deur + brievenbus: **9784** | `post` |
| Staldeur | Sleutel op de staldeur | `stalOpen` |
| Hoefijzer (bijgeloof) | In het gras onder de wagen; op de haak boven de staldeur, **open kant boven** | `hoefTaken`, `hoef` |
| Stokmaat (een paard meet je aan de schoft) | **Prins** (168 cm, graast met zijn hoofd omlaag) | `schoft` |
| De brief | Zaklamp op het gat achter het bordje van Prins, dan het trommeltje | `licht`, `brief`, `out1` |

Hoofdstuk 2, zaterdagochtend (hooizolder en de drie kamers):

| Puzzel | Oplossing | Vlaggen |
|---|---|---|
| Katrol (losse katrol: halve kracht, dubbel touw) | Hooiluik: **B**, twee touwen (20 kg, 10 m touw) | `katrol` |
| Telmerken (I = 1, Λ = 5, X = 10) | Thedema, stijl of werkboekje: ΛIII 8, IIII 4, XI 11, ΛI 6 → teken **ΛII = 7** | `telmerk` |
| Behang (het rapport) | Alma (na de katrol): **baan C** → teken **IIII = 4** | `behang` |
| Borgprenten | Folkerda: **P Thedema, Q Folkerda, R Alma** → teken **XI = 11** | `prenten` |
| Kastje in de stijl | Overloop: **7, 4, 11** → oude sleutel | `kast`, `out2` |

Hoofdstuk 3, zaterdagmiddag (museum en platte dak):

| Puzzel | Oplossing | Vlaggen |
|---|---|---|
| Kistje van Thedema | Oude sleutel op het kistje → briefje en akkerkaart | `kistOpen` |
| Decimaalbascule (1 kg houdt 10 kg in evenwicht) | **5 + 2 kg** op het schaaltje; een mud aardappelen weegt **70 kg** → **G** | `bascule` |
| Karnton (van melk naar boter) | Melken, nacht laten staan, room afscheppen, karnen, karnemelk eruit, kneden en zouten → **R** | `karn` |
| Spreukenbord (Gronings) | Moi = hallo en dag; Nait soez'n, moi doun = niet zeuren, gewoon doen; Kop d'r veur = zet door; Wicht = meisje → **P** | `spreuk` |
| Akkers (vruchtwisseling) | Dak, kaart op de akkers (kool, graan en suikerbieten: wat Roelof zelf verbouwde): 1922 **A graan, B kool, C suikerbieten**; 1923 **A suikerbieten, B graan, C kool** → **U** | `akkers` |
| Het woord | Kistje: **GRUP** (de mestgoot in de koestal) | `out3` |

Hoofdstuk 4, zaterdagavond (zaal en tuin):

| Puzzel | Oplossing | Vlaggen |
|---|---|---|
| Lampjes in serie (zoeken door halveren) | Meet tot 8, 12, 10, 11: **lampje 11** vervangen | `lampjes` |
| Tafelschikking (logica) | **Ditty, Roelof, Jij, Tante Grietje, Buurman Jan** | `tafel` |
| Pool (hoek in = hoek uit) | **Ruit 2** → dopsleutel | `pool` |
| Sporen (dierensporen) | Tuin: **spoor 1** (ree, twee puntige teentjes) → koevoet bij de schommels | `sporen`, `koevoetTaken` |
| De grup | Dopsleutel op de glazen plaat, dan de koevoet → de foto van 1921 en Harms brief | `bouten`, `grupOpen`, `out4` |

Prestaties (`ACH`): `paardje`, `ree`, `haas`, `moi` (het welkomsbord 2×, of het spreukenbord), `koffie` (3× bij Ditty of het koffieapparaat), `martini`, `bed` (3× springen), `zwaluw` (3×), `tractor`, `scheef`, `pool`, `trampoline`, `gastenboek`.

## Grapjes en beweging

- **Elk klikvlak doet iets.** Naast de puzzels zijn er in elke kamer veel dingen die bewegen, geluid maken en vertellen wat ze zijn (de Martinitoren, de scheve toren van Bedum, de reeën, de geitjes, de trekker…). `poke(sel, klasse, woordje, toon)` in `core.js` laat iets kort bewegen met een klasse uit `css/base.css` (`g-wiggle`, `g-jump`, `g-spin`, `g-pop`, `g-swing`, `g-shake`, `g-tilt`, `g-glow`), met een woordje erboven (`gagText`). Gebruik het op een groep **zonder** eigen `transform`-attribuut, en niet op iets dat al een eigen animatieklasse heeft (die wint).
- **Dieren lopen vooruit.** De reeën lopen (`.ree-walk.walking`) over het erf, door de wei achter het raam van de kamers, op het land vanaf het dak en door de tuin; hun poten (`.rleg`) stappen. Hazen huppelen (`.ree-walk` met `.haas-hop`) over het erf, door de tuin en op het land; een egel scharrelt door de tuin, en er staan geitjes in het veld. Elke tekening kijkt naar rechts: `--walk` is de afstand en `--walkt` de tijd, en bij een negatieve afstand (eerst naar links) hoort `--dir:-1`, anders loopt het dier achteruit. Verder wapperen de Groninger vlag en de gordijnen.
- **Mensen leven een beetje, heel subtiel:** ze knipperen af en toe met hun ogen (`.eyes`, uit `face()`) en ademen licht (`.idle`, met `alive()` in `personages.py`), elk op een eigen moment. **De kachel in de zaal brandt**: vlammen (`.flame`), gloeiende kolen, vonkjes en een flakkerende gloed op de muur en de vloer.
- Een klikvlak dat in twee hoofdstukken bestaat (`wolk`, `bomen`, `roelof`, `ditty`, `paardje`) bewaart de handler van het eerdere hoofdstuk en geeft door als de kamer niet de zijne is.

## Valkuilen

Alles uit de blueprint en het Sinterklaas-spel geldt. Vooral:
- **Klikvlak-ids delen één naamruimte.** `roelof`, `ditty` en `paardje` bestaan in meer kamers: elk volgend hoofdstuk bewaart de vorige handler (`H1`, `H2`, `H3`) en geeft door als de kamer niet de zijne is.
- **SVG-ids en CSS-klassen zijn globaal:** gebruik het voorvoegsel van de kamer.
- **Volgorde in een SVG = wat ervoor staat.** De vloer van het museum staat vroeg in het bestand, anders bedekt hij de karntonnen.
- Animeer nooit een groep met een eigen `transform`-attribuut; zet er een groep omheen.
- Een nieuwe kamer: `scenes/<naam>.svg`, `scenes` in `boot.js`, `CORE` in `sw.js`, `ROOMS` in `core.js` (met een `applyX()`), `ambKey()`, `contLine()`, en `tests/escaperoom/motion.spec.js`.
- **Verhoog `CACHE` in `sw.js` (`amh-vN`) en `GAME_VERSION` in `js/boot.js` samen** bij elke wijziging; de test controleert het. De service worker wist alleen zijn eigen oude caches (`amh-`).
- Elke puzzel heeft twee hints in `HINTS`: een duwtje en het antwoord. Elk fout antwoord krijgt een grapje én een duwtje.
- Geen `alert/confirm/prompt`; knoppen hebben `type="button"`; close-ups passen op 412×915 en 915×412 (`phone.spec.js`).

## Ideeën

- Een Engelse (of Duitse) versie voor buitenlandse gasten, met het vertaalsysteem van *Hello, IT* (`lang/en/*.txt`).
- Een hoofdstuk met een fietstocht langs de knooppunten, de wierden en de scheve toren van Bedum.
- Echte foto's van Roelof en Ditty als voorbeeld voor `personages.py`.
