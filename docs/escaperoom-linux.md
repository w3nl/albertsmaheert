# Het Geheim van de Albertsmaheert voor Linux (Snap Store)

De Linux-app is een **snap**: het pakketformaat van de Snap Store, waar het *App Center* van Ubuntu zijn apps vandaan
haalt. Net als de Android-app is het een klein jasje om dezelfde spelbestanden als op de website:

- `apps/escaperoom/linux/main.js` opent één venster met het spel. Het draait op Electron, dezelfde browsermotor als de
  tests (Chromium), dus toetsenbord, muis, controller, geluid en stemmen werken zoals in Chrome.
- Het spel komt van `app://albertsmaheert/`, zodat het opgeslagen spel een eigen vaste plek heeft, los van de website.
- Links naar albertsmaheert.nl (de B&B, reserveren, contact) openen in je gewone browser. Het menu **Albertsmaheert**
  heeft **Volledig scherm** (**F11**) en **Afsluiten** (**Ctrl+Q**). In volledig scherm: **Ctrl+Q** om te stoppen, of
  **F11** terug naar het venster met het menu.
- `apps/escaperoom/linux/package.json` bevat de instellingen van de snap voor electron-builder: de naam
  `albertsmaheert`, de samenvatting, de categorie *Game* en de rechten. *joystick* is erbij voor controllers; de rest is
  de standaardset (scherm, geluid, netwerk).

## Installeren uit de Snap Store

De escaperoom staat in de [Snap Store](https://snapcraft.io/albertsmaheert):

```bash
sudo snap install albertsmaheert
```

Staat de nieuwste versie nog alleen op het kanaal **edge** (zie *Publiceren* hieronder), installeer dan die:

```bash
sudo snap install albertsmaheert --edge
```

Een bestaande installatie bijwerken gaat vanzelf; meteen kan met `sudo snap refresh albertsmaheert` (met `--edge` voor
edge). Sluit de app daarna en open hem opnieuw.

Speel je met een controller en reageert die niet, sluit dan de joystick aan (tot de Snap Store dat vanzelf doet, zie
stap 6 hieronder):

```bash
sudo snap connect albertsmaheert:joystick
```

## Bouwen

De workflow **Escaperoom: Linux-app** (`.github/workflows/escaperoom-linux.yml`) bouwt de snap bij elke pull request
die het spel of `apps/escaperoom/linux/` verandert, en op `main`. Ook met de hand te starten (Actions → Run workflow),
of vanaf je eigen computer met `npm run build:escaperoom-snap` (start de workflow, wacht en haalt de snap op).

- De snap staat 30 dagen als artefact `escaperoom-linux` bij de run.
- Met de repository-variabele `ESCAPEROOM_RELEASE` op `true` krijgt op `main` elke nieuwe spelversie een eigen release,
  `escaperoom-linux-v1.<GAME_VERSION>.0`, met de snap erbij. Dezelfde spelversie opnieuw bouwen laat die release zoals
  hij is.
- Met daarnaast het secret `SNAPCRAFT_STORE_CREDENTIALS` zet de workflow elke versie op `main` in de Snap Store, in het
  kanaal **edge**. Zet de repository-variabele `SNAP_CHANNEL` op `stable` om meteen naar iedereen te publiceren.

Het versienummer volgt het spel: `GAME_VERSION` 66 wordt `1.66.0`. Een nieuwe spelversie is dus altijd een nieuwere snap.

Verander je alleen het jasje (`apps/escaperoom/linux/`), dan blijft `GAME_VERSION` gelijk. Een nieuwe upload heeft dan
hetzelfde versienummer, maar een nieuwe **revisie** in de Snap Store; updates volgen revisies, niet het nummer. Het
titelscherm toont dan nog steeds hetzelfde `v`-nummer.

Zelf bouwen op Linux:

```bash
npm run build:escaperoom-linux
```

De snap staat dan in `apps/escaperoom/linux/dist/`. Alleen proberen, zonder snap (ook op Mac of Windows):

```bash
npm run start:escaperoom-linux
```

## De snap uit de release installeren (zonder de store)

```bash
sudo snap install --dangerous ./albertsmaheert.snap
```

`--dangerous` is nodig omdat een snap van buiten de store niet door de store is ondertekend. Liever uit de store: dan
komen updates vanzelf.

## Publiceren in de Snap Store, stap voor stap

1. **Een account:** log in op [snapcraft.io](https://snapcraft.io/) met een Ubuntu One-account (maak er daar een aan als
   dat nodig is).
2. **De naam:** installeer op een Linux-computer de hulpmiddelen en reserveer de naam `albertsmaheert`:
   ```bash
   sudo snap install snapcraft --classic
   ```
   ```bash
   snapcraft login
   ```
   ```bash
   snapcraft register albertsmaheert
   ```
3. **Een login voor GitHub Actions:** een login die alleen deze snap mag uploaden, als secret. Via een bestand, zodat je
   ziet dat het gelukt is (zie ook [escaperoom-sleutels.md](escaperoom-sleutels.md)):
   ```bash
   snapcraft export-login --snaps=albertsmaheert --channels=edge,stable albertsmaheert-snap.login
   ```
   ```bash
   gh secret set SNAPCRAFT_STORE_CREDENTIALS --repo w3nl/albertsmaheert < albertsmaheert-snap.login
   ```
   ```bash
   rm albertsmaheert-snap.login
   ```
   Zo'n login verloopt na een jaar; doe dan deze stap opnieuw.
4. **De eerste upload:** zet `ESCAPEROOM_RELEASE` op `true` (pas als de escaperoom openbaar mag) en draai de workflow
   *Escaperoom: Linux-app* op `main` (Actions → Run workflow). De snap gaat naar het kanaal *edge*. Probeer hem:
   ```bash
   sudo snap install albertsmaheert --edge
   ```
5. **De winkelpagina** (snapcraft.io → *My snaps* → albertsmaheert → *Listing*):
   - **Titel:** Het Geheim van de Albertsmaheert
   - **Samenvatting:** Een escaperoom op de boerderij en B&B Albertsmaheert
   - **Beschrijving:** bijvoorbeeld: *Je komt op vrijdagavond met de fiets aan bij B&B Albertsmaheert aan de Wolddijk.
     Ditty en Roelof heten je welkom, maar in de oude paardenstal ligt al honderd jaar een brief van knecht Harm. Zoek
     zijn schat: van de Paardenstal en de hooizolder tot het boerenmuseum van Roelof, het platte dak en het feest in de
     zaal. Vier hoofdstukken vol puzzels, grapjes en dieren op het erf. Speel met muis, toetsenbord of controller. Geen
     reclame, niets te kopen, niets verzameld.*
   - **Categorie:** Games
   - **Pictogram:** `src/escaperoom/icons/icon-512.png`
   - **Featured banner:** [featured-banner.png](escaperoom-store/snap/featured-banner.png) (720 × 240 pixels). Opnieuw
     maken met `npm run store:escaperoom`.
   - **Schermafbeeldingen:** die uit [escaperoom-store/play/](escaperoom-store/play/) (1920×1080)
   - **Website:** `https://albertsmaheert.nl/`. **Broncode:** `https://github.com/w3nl/albertsmaheert`.
     **Licentie:** GPL-3.0 (zie `LICENSE`)
6. **Controller vanzelf:** vraag in het forum van de Snap Store ([forum.snapcraft.io](https://forum.snapcraft.io/),
   categorie *store-requests*) om **auto-connect** van de interface `joystick` voor `albertsmaheert`, met als reden dat
   het een spel is dat met een controller te spelen is. Tot dat is goedgekeurd: `sudo snap connect albertsmaheert:joystick`.
7. **Uitbrengen:** werkt de versie op edge, zet hem dan in *Releases* van *edge* naar *stable*, of met
   `snapcraft release albertsmaheert <revisie> stable`. Dan staat hij voor iedereen in het App Center.

## Goed om te weten

- **Grootte:** ongeveer 105 MB, omdat Electron een eigen browser meeneemt. Updates komen vanzelf via snapd.
- **Basis:** electron-builder gebruikt een kant-en-klaar `core20`-sjabloon (ondersteund tot 2030), dus bouwen kan
  gewoon in GitHub Actions, zonder LXD.
- **Alleen amd64** (gewone laptops en pc's). Een arm64-snap (Raspberry Pi, sommige laptops) vraagt een arm64-runner.
