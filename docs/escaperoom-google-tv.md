# Het Geheim van de Albertsmaheert op de tv (Google TV)

Er zijn vier manieren om op de tv te spelen. Alle vier werken met de afstandsbediening (pijltjes, OK en Terug) en met
een controller (PlayStation, Xbox, Stadia).

| | Wat | Nodig |
|---|---|---|
| 1 | De Android-app uit Google Play | Google Play op de tv (de app met Android TV aan, zie [escaperoom-android.md](escaperoom-android.md)) |
| 2 | De app van GitHub, met de app Downloader | één keer Downloader instellen |
| 3 | In een browser-app op de tv | een browser-app, en de site online |
| 4 | Casten vanaf een laptop, telefoon of tablet | Chrome of de Google Home-app |

## Besturing op de tv

| | Afstandsbediening | Controller |
|---|---|---|
| Naar een ander klikvlak of een andere knop | pijltjes | stick of d-pad |
| Klikken / gesprek verder | OK | A (✕) |
| Terug (close-up dicht, ding uit je hand, menu) | Terug | B (○) |
| Hint | – | X (□) |
| Toon alle klikvlakken | – | Y (△) |
| Ding uit de rugzak kiezen | – | LB / RB |
| Menu | – | Start |

Er staat altijd een gouden rand om het klikvlak of de knop die je kiest, met de naam erbij. Op het titelscherm sluit
**Terug** de app.

## Een controller koppelen aan de Google TV

1. Instellingen → **Afstandsbedieningen en accessoires** → **Accessoire koppelen**.
2. **PlayStation-controller:** houd **Share** (of **Create**) en de **PS-knop** ingedrukt tot het lampje snel knippert.
   Kies hem in de lijst.
3. **Xbox-controller:** houd de **koppelknop** bovenop ingedrukt tot het Xbox-lampje snel knippert.

## 1. Uit Google Play

Zoek op de tv in de Play Store naar **Het Geheim van de Albertsmaheert**, of installeer hem vanaf een computer via
[Google Play](https://play.google.com/store/apps/details?id=nl.albertsmaheert.escaperoom) (kies de tv als toestel).
Updates komen vanzelf. De app staat op het startscherm met een eigen tegel (de banner).

## 2. Met Downloader (zonder Google Play)

De workflow *Escaperoom: Android-app* bouwt bij elke spelversie `albertsmaheert.apk`. Met `ESCAPEROOM_RELEASE` aan
staat die bij de release **escaperoom-android-v1.&lt;versie&gt;.0** op
[github.com/w3nl/albertsmaheert/releases](https://github.com/w3nl/albertsmaheert/releases).

**Eén keer op de Google TV:**

1. Zet de ontwikkelaarsopties aan: Instellingen → Systeem → Over → klik **7 keer** op **Build van Android TV-besturingssysteem**.
2. Installeer **Downloader** (van AFTVnews) uit de Play Store.
3. Instellingen → Apps → **Beveiliging en beperkingen** → **Onbekende bronnen** → zet **Downloader** aan.

**Installeren of bijwerken:** open Downloader, ga naar de releases hierboven, kies de nieuwste *Escaperoom Android-app*
en `albertsmaheert.apk`, en dan **Installeren**. De app is ondertekend met de vaste sleutel, dus een nieuwe versie
installeert over de oude heen en je spel blijft bewaard. Meng de twee manieren niet: Google Play ondertekent zijn
versie met de sleutel van Google, dus een `.apk` van GitHub past niet over een app uit Google Play (en andersom).

## 3. In een browser-app

1. Installeer een browser uit de Play Store op de Google TV, bijvoorbeeld **TV Bro**.
2. Open **albertsmaheert.nl/escaperoom** en speel met de afstandsbediening.

Of een controller werkt in zo'n browser, hangt van de browser af. Werkt hij niet, gebruik dan de afstandsbediening of de
app (1 of 2).

## 4. Casten

- **Vanaf een laptop:** open de escaperoom in Chrome, kies **⋮ → Casten → Tabblad casten** en de Google TV. Je speelt op
  de laptop en kijkt op de tv, met een kleine vertraging.
- **Vanaf een Android-telefoon of -tablet:** open de **Google Home-app**, kies de Google TV en **Mijn scherm casten**.
- **iPhone en iPad** casten niet naar een Google TV; gebruik dan AirPlay naar een Apple TV, of manier 1 of 2.

## Hoe de app werkt

`apps/escaperoom/android/` is een kleine Android-app (Java) met één WebView. Het spel zit in de app en wordt geladen van
`https://appassets.androidplatform.net/assets/game/index.html`, zodat opslaan werkt. De afstandsbediening stuurt gewone
pijltjes en Enter. Een controller geeft de app door als `window.__nativePad`; de Terug-knop roept `window.tvBack()` aan
(`js/gamepad.js`). Zie [escaperoom-apps.md](escaperoom-apps.md).
