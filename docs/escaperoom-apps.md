# Escaperoom-apps

*Het Geheim van de Albertsmaheert* draait overal waar een browser is, en ook als app. In elke app zit het spel zelf
(`src/escaperoom`), dus spelen kan zonder internet. Alleen de links naar albertsmaheert.nl openen de browser.

| Waar | Hoe | Besturing |
|---|---|---|
| Computer (Windows, Mac, Linux) | browser, of installeren als web-app (installeer-knop in de adresbalk) | muis, toetsenbord, controller |
| Linux | snap (`albertsmaheert.snap`) | muis, toetsenbord, controller |
| Chromebook | Chrome-extensie, of de Android-app uit Google Play | muis, touchpad, aanraken, controller |
| Android-telefoon en -tablet | Android-app (`albertsmaheert.apk`), of de web-app via Chrome → *Toevoegen aan startscherm* | aanraken, controller |
| Google TV / Android TV | Android-app | afstandsbediening, controller |
| iPhone en iPad | web-app: Safari → Deel → *Zet op beginscherm* | aanraken, controller |
| Andere smart-tv's | de browser van de tv | afstandsbediening (pijltjes + OK) |

> **Nog niet openbaar.** Net als op de site blijft de escaperoom verborgen tot Ditty en Roelof akkoord zijn. De workflow
> bouwt de apps wel bij elke wijziging (als artefact), maar maakt pas een release als de repository-variabele
> `ESCAPEROOM_RELEASE` op `true` staat (*Settings → Secrets and variables → Actions → Variables*).

## Besturing

| | Toetsenbord | Afstandsbediening | Controller |
|---|---|---|---|
| Naar een ander klikvlak of een andere knop | pijltjes | pijltjes | stick of d-pad |
| Klikken / gesprek verder | Enter | OK | A (✕) |
| Terug (close-up dicht, ding uit je hand, menu) | Backspace | Terug | B (○) |
| Hint | – | – | X (□) |
| Toon alle klikvlakken | – | – | Y (△) of Select |
| Ding uit de rugzak kiezen | (klik op de rugzak) | – | LB / RB |
| Menu | – | – | Start |

Het titelscherm laat zien welke controller verbonden is. Uitleg voor ontwikkelaars: [escaperoom.md](escaperoom.md#besturing).

## Hoe de apps gemaakt worden

De workflow **Escaperoom-apps** (`.github/workflows/escaperoom-apps.yml`) draait bij elke wijziging aan het spel of de
apps, en bewaart de apps een maand als artefact: *Actions → Escaperoom-apps → een run → Artifacts*.

| Map | Wat |
|---|---|
| `apps/escaperoom/android/` | Android-app: één WebView die het spel laat zien vanaf `https://appassets.androidplatform.net/assets/game/index.html` (zodat opslaan werkt). Geeft de controller door als `window.__nativePad` en de Terug-knop als `window.tvBack()`. |
| `apps/escaperoom/linux/` | Linux-app (Electron, als snap): één venster met het spel vanaf `app://albertsmaheert/`. |
| `apps/escaperoom/chrome/` | Chrome-extensie (Manifest V3): de knop in de werkbalk opent het spel in een tabblad. |
| `tools/escaperoom/build-apps.js` | Zet het spel in een app (`android`, `linux`) of maakt de extensie (`chrome`). Laat `sw.js` weg: in een app zit alles er al in. |
| `tools/escaperoom/app-icons.js` | Maakt de pictogrammen en de Google TV-banner uit `src/escaperoom/icons/icon.svg` (`npm run icons:escaperoom`). |

Het versienummer volgt het spel: `GAME_VERSION` 63 wordt app-versie **1.63.0**. De pakketnaam van Android en de snap is
`nl.albertsmaheert.escaperoom`; die is blijvend zodra de app in een winkel staat.

Zelf bouwen:

```bash
npm run build:escaperoom-chrome   # dist/albertsmaheert-chrome.zip en dist/escaperoom-chrome/
```

```bash
node tools/escaperoom/build-apps.js linux && cd apps/escaperoom/linux && npm ci && npm start
```

Voor Android is de Android SDK nodig (Android Studio): `node tools/escaperoom/build-apps.js android` en daarna de map
`apps/escaperoom/android` openen in Android Studio.

## Installeren

### Android-telefoon of -tablet
Download `albertsmaheert.apk` (artefact of release) op het toestel, open hem en sta *installeren uit onbekende bronnen* toe.

### Google TV / Android TV
1. Installeer de app **Downloader** (van AFTVnews) uit Google Play op de tv.
2. Instellingen → Systeem → Over → klik 7× op *Build van Android TV-besturingssysteem* (ontwikkelaarsopties aan), en
   sta bij *Apps → Beveiliging → Onbekende bronnen* Downloader toe.
3. Open in Downloader de link naar `albertsmaheert.apk` van de release.
4. De app staat daarna bij *Apps* met de banner van de Albertsmaheert. Een Bluetooth-controller koppel je via
   Instellingen → Afstandsbediening en accessoires.

### Chromebook
- **Chrome-extensie:** pak `albertsmaheert-chrome.zip` uit, open `chrome://extensions`, zet *Ontwikkelaarsmodus* aan en
  kies *Uitgepakte extensie laden*. Na publicatie in de Chrome Web Store kan het met één klik.
- Of de **Android-app** (Chromebooks met Google Play), of de web-app via de installeerknop in de adresbalk.

### Linux
```bash
sudo snap install --dangerous ./albertsmaheert.snap
```
`--dangerous` omdat de snap niet uit de Snap Store komt. Een controller werkt na `sudo snap connect albertsmaheert:joystick`.

### iPhone en iPad
Apple staat geen app buiten de App Store toe. Open de escaperoom in Safari en kies Deel → *Zet op beginscherm*: dan
start hij schermvullend als app, en werkt hij ook offline. Een PlayStation- of Xbox-controller werkt via Bluetooth.

## Naar de winkels (later)

Nodig zodra de escaperoom openbaar mag:

- **Google Play** (telefoon, tablet, Google TV, Chromebook): een ontwikkelaarsaccount, en een vaste sleutel zodat
  updates over de oude app heen installeren. Maak die één keer, en bewaar hem goed (kwijt = nooit meer een update):

  ```bash
  keytool -genkeypair -v -keystore albertsmaheert.jks -alias albertsmaheert -keyalg RSA -keysize 4096 -validity 10000
  ```

  ```bash
  base64 -w0 albertsmaheert.jks
  ```

  Zet de uitvoer in het repository-secret `ESCAPEROOM_KEYSTORE_BASE64` en het wachtwoord in
  `ESCAPEROOM_KEYSTORE_PASSWORD`. Dan maakt de workflow ook de bundel voor Google Play (`.aab`), als
  `escaperoom-google-play` in een 7z-bestand met dat wachtwoord (nooit in de release). Voor Google TV vraagt Google
  Play schermafbeeldingen in 1920×1080 en de banner (`res/drawable-xhdpi/banner.png`).
- **Chrome Web Store:** een ontwikkelaarsaccount; upload `albertsmaheert-chrome.zip`.
- **Snap Store:** een Ubuntu One-account, `snapcraft register albertsmaheert`, en dan `snapcraft upload` van de snap.

## Valkuilen

- **Het spel mag niets van andere websites laden**, anders werkt het niet zonder internet (en de Chrome-extensie staat
  het niet eens toe). `tests/escaperoom/pwa.spec.js` controleert dat.
- **Geen scripts in de HTML zelf** (`<script>…</script>` of `onclick="…"` in `index.html`): de Chrome-extensie
  (Manifest V3) voert die niet uit. Scripts horen in `js/`.
- Een nieuwe toets of knop in het spel: test hem ook met de pijltjes en Enter (`tests/escaperoom/besturing.spec.js`).
