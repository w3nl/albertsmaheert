# Het Geheim van de Albertsmaheert in de Chrome Web Store

De Chrome-extensie is een klein jasje om dezelfde spelbestanden als op de website, net als de Android- en Linux-app:

- Installeren: [Het Geheim van de Albertsmaheert in de Chrome Web Store](https://chromewebstore.google.com/detail/het-geheim-van-de-alberts/menijigcnfkinaebpnbciflmhehijjnp)
  → **Toevoegen aan Chrome**. In het spel staat die link onder **Installeren** als je Chrome gebruikt.
- `apps/escaperoom/chrome/background.js` opent het spel in een tabblad als je op de knop in de werkbalk klikt (en één
  keer meteen na het installeren). Is het spel al open, dan komt dat tabblad naar voren.
- Het spel zit **in de extensie**, dus het werkt zonder internet, ook op een Chromebook. Er is geen service worker: die
  werkt alleen op http(s), en de extensie heeft hem niet nodig.
- De extensie vraagt **geen rechten** en draait geen code van elders. De lettertypen zitten er ook in.
- Je voortgang staat in de extensie, los van de website.
- De pictogrammen staan in `apps/escaperoom/chrome/icons/` (16, 32, 48 en 128 px), gemaakt met `npm run icons:escaperoom`.

## Bouwen

```bash
npm run build:escaperoom-chrome
```

Dat maakt `dist/albertsmaheert-chrome.zip` (om te uploaden) en `dist/escaperoom-chrome/` (dezelfde bestanden
uitgepakt). De workflow *Escaperoom: Chrome-extensie* maakt dezelfde zip bij elke wijziging (artefact
`escaperoom-chrome`). De versie volgt het spel: `GAME_VERSION` wordt `1.<GAME_VERSION>.0`. De Web Store neemt alleen
een hogere versie dan de vorige upload, dus verhoog `GAME_VERSION` voor je opnieuw uploadt.

Eerst proberen: open `chrome://extensions`, zet **Ontwikkelaarsmodus** aan, kies **Uitgepakte extensie laden** en
selecteer `dist/escaperoom-chrome/`.

## Publiceren, stap voor stap

1. Log in op het [ontwikkelaarsdashboard van de Chrome Web Store](https://chromewebstore.google.com/devconsole)
   (eenmalig registratiegeld; een bestaand account van TripScouts kan ook).
2. **Nieuw item** → sleep `dist/albertsmaheert-chrome.zip` in het vak.
3. **Winkelvermelding:** de beschrijving uit [escaperoom-linux.md](escaperoom-linux.md) (stap 5), categorie *Games*,
   taal Nederlands. De plaatjes staan in [escaperoom-store/chrome/](escaperoom-store/chrome/), gemaakt met
   `npm run store:escaperoom`:
   - **Winkelpictogram:** `store-icon.png` (128×128: de tekening 96×96 met 16 px doorzichtige rand, zoals Google vraagt)
   - **Schermafbeeldingen:** de `screenshot-*.jpg` (1280×800, JPEG, dus zonder doorzichtigheid)
   - **Kleine promotegel:** `small-promo-tile.jpg` (440×280)
   - **Marquee-promotegel** (optioneel): `marquee-promo-tile.jpg` (1400×560)
4. **Privacy:** één doel: "een escaperoom om in een tabblad te spelen"; geen rechten om uit te leggen; geen gegevens
   verzameld. Privacybeleid: `https://albertsmaheert.nl/privacyverklaring/` (zie de opmerking daarover in
   [escaperoom-android.md](escaperoom-android.md)).
5. **Distributie:** openbaar (pas na het akkoord van Ditty en Roelof) of eerst **verborgen** of **privé** voor testers;
   alle regio's. Verzenden voor beoordeling.

**Een update:** bouw opnieuw met een hogere `GAME_VERSION`, en kies bij het item in het dashboard **Pakket → Nieuw
pakket uploaden**.
