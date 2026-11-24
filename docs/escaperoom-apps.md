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

Drie workflows, elk bij een wijziging aan het spel of aan die app, en ook met de hand te starten (*Actions* → de
workflow → **Run workflow**). Ze bewaren de app een maand als artefact (*een run → Artifacts*):

| Workflow | Bestand | Artefact |
|---|---|---|
| **Escaperoom: Android-app** | `.github/workflows/escaperoom-android.yml` | `escaperoom-android` (`albertsmaheert.apk`); met een vaste sleutel ook `escaperoom-google-play` (de `.aab`, versleuteld) |
| **Escaperoom: Linux-app** | `.github/workflows/escaperoom-linux.yml` | `escaperoom-linux` (`albertsmaheert.snap`); met een login ook naar de Snap Store |
| **Escaperoom: Chrome-extensie** | `.github/workflows/escaperoom-chrome.yml` | `escaperoom-chrome` (`albertsmaheert-chrome.zip`) |

Met `ESCAPEROOM_RELEASE=true` krijgt elke spelversie per app een release: `escaperoom-android-v1.63.0`,
`escaperoom-linux-v1.63.0` en `escaperoom-chrome-v1.63.0`.

| Map | Wat |
|---|---|
| `apps/escaperoom/android/` | Android-app: één WebView die het spel laat zien vanaf `https://appassets.androidplatform.net/assets/game/index.html` (zodat opslaan werkt). Geeft de controller door als `window.__nativePad` en de Terug-knop als `window.tvBack()`. |
| `apps/escaperoom/linux/` | Linux-app (Electron, als snap): één venster met het spel vanaf `app://albertsmaheert/`. |
| `apps/escaperoom/chrome/` | Chrome-extensie (Manifest V3): de knop in de werkbalk opent het spel in een tabblad. |
| `tools/escaperoom/build-apps.js` | Zet het spel in een app (`android`, `linux`) of maakt de extensie (`chrome`). Laat `sw.js` weg: in een app zit alles er al in. |
| `tools/escaperoom/gh-build.js` | Laat GitHub een app bouwen en haalt hem op (`build:escaperoom-apk`, `-aab`, `-snap`). |
| `tools/escaperoom/app-icons.js` | Maakt de pictogrammen en de Google TV-banner uit `src/escaperoom/icons/icon.svg`. |
| `tools/escaperoom/store.js` | Maakt de winkelplaatjes in `docs/escaperoom-store/` uit het spel zelf. |

Het versienummer volgt het spel: `GAME_VERSION` 63 wordt app-versie **1.63.0**. De pakketnaam van Android en de snap is
`nl.albertsmaheert.escaperoom` (de snap heet `albertsmaheert`); die is blijvend zodra de app in een winkel staat.

### Commando's

| Commando | Wat |
|---|---|
| `npm run build:escaperoom-chrome` | De Chrome-extensie, op je eigen computer: `dist/albertsmaheert-chrome.zip` (en uitgepakt in `dist/escaperoom-chrome/`, voor *Uitgepakte extensie laden*). |
| `npm run build:escaperoom-apk` | Laat GitHub de Android-app bouwen en haalt `albertsmaheert.apk` op naar `dist/escaperoom-apk-<run>/`. |
| `npm run build:escaperoom-aab` | Hetzelfde, maar de bundel voor Google Play: vraagt je sleutelwachtwoord en zet `albertsmaheert.aab` in `dist/escaperoom-aab-<run>/`. Nodig: 7-Zip (`7z`) en de sleutel-secrets. |
| `npm run build:escaperoom-snap` | Laat GitHub de snap bouwen en haalt `albertsmaheert.snap` op naar `dist/escaperoom-snap-<run>/`. |
| `npm run build:escaperoom-linux` | De snap op je eigen Linux-computer (`apps/escaperoom/linux/dist/`). |
| `npm run start:escaperoom-linux` | De Linux-app starten zonder te installeren (Linux, Mac of Windows). |
| `npm run build:escaperoom-android` | Het spel in de Android-app zetten; daarna `apps/escaperoom/android` openen in Android Studio. |
| `npm run icons:escaperoom` | De pictogrammen en de banner opnieuw maken (na een nieuw `icon.svg`). |
| `npm run store:escaperoom` | De winkelplaatjes opnieuw maken (na veranderingen aan de kamers). |

De `build:escaperoom-apk/-aab/-snap`-commando's gebruiken de GitHub CLI (`gh auth login`) en starten de workflow op
`main`; een andere tak: `npm run build:escaperoom-apk -- --ref <tak>`.

### Winkelplaatjes

`npm run store:escaperoom` maakt ze uit het spel zelf, in `docs/escaperoom-store/`:

| Map | Voor | Wat |
|---|---|---|
| `play/` | Google Play (en de Snap Store) | `feature-graphic.png` (1024×500), `tv-banner.png` (1280×720), `screenshot-*.png` (1920×1080, voor telefoon, tablet en tv) |
| `chrome/` | Chrome Web Store | `store-icon.png` (128×128), `screenshot-*.jpg` (1280×800), `small-promo-tile.jpg` (440×280), `marquee-promo-tile.jpg` (1400×560) |
| `snap/` | Snap Store | `featured-banner.png` (720×240); als schermafbeeldingen die uit `play/` |

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

Nodig zodra de escaperoom openbaar mag. Stap voor stap, met de commando's om de secrets te maken en in GitHub te zetten:
[escaperoom-sleutels.md](escaperoom-sleutels.md).

| Secret / variabele | Waarvoor |
|---|---|
| `ANDROID_KEYSTORE_BASE64` + `ANDROID_KEYSTORE_PASSWORD` | vaste Android-sleutel: updates installeren over de oude app heen, en de bundel (`.aab`) voor Google Play |
| `ANDROID_KEY_ALIAS` (variabele, optioneel) | alleen als je sleutel een andere alias heeft dan `albertsmaheert` |
| `SNAPCRAFT_STORE_CREDENTIALS` | de snap uploaden naar de Snap Store |
| `SNAP_CHANNEL` (variabele, optioneel) | `stable` in plaats van `edge` |
| `ESCAPEROOM_RELEASE` (variabele) | `true`: release met de apps, en uploaden naar de Snap Store |

De Chrome Web Store heeft geen secret nodig: daar upload je `albertsmaheert-chrome.zip` zelf.

## Valkuilen

- **Het spel mag niets van andere websites laden**, anders werkt het niet zonder internet (en de Chrome-extensie staat
  het niet eens toe). `tests/escaperoom/pwa.spec.js` controleert dat.
- **Geen scripts in de HTML zelf** (`<script>…</script>` of `onclick="…"` in `index.html`): de Chrome-extensie
  (Manifest V3) voert die niet uit. Scripts horen in `js/`.
- Een nieuwe toets of knop in het spel: test hem ook met de pijltjes en Enter (`tests/escaperoom/besturing.spec.js`).
