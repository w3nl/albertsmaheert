# Het Geheim van de Albertsmaheert op Android (en in Google Play)

Eén Android-app voor telefoon, tablet, Google TV en Chromebook, met het spel erin: spelen kan zonder internet.
Pakketnaam `nl.albertsmaheert.escaperoom` (blijvend). Voor de tv: [escaperoom-google-tv.md](escaperoom-google-tv.md);
voor Chromebooks: [escaperoom-chromebook.md](escaperoom-chromebook.md).

## Installeren op een telefoon of tablet

In het spel toont **Installeren** (of **📲 Speel als app** op het titelscherm) twee keuzes:

- **Android-app** uit [Google Play](https://play.google.com/store/apps/details?id=nl.albertsmaheert.escaperoom):
  updates vanzelf, speelt ook met een controller.
- **Web-app:** een knop **Installeren** als de browser dat aanbiedt, anders via het menu van de browser (**⋮**) →
  **Toevoegen aan startscherm** of **App installeren**. Klein, en werkt via de website bij.

De app en de web-app bewaren hun spel elk apart.

**Zonder Google Play:** download `albertsmaheert.apk` van de nieuwste *Escaperoom Android-app* op
[github.com/w3nl/albertsmaheert/releases](https://github.com/w3nl/albertsmaheert/releases), open hem en sta
*installeren uit onbekende bronnen* toe. Meng dat niet met de versie uit Google Play (die heeft een andere ondertekening).

## Spelen

Tik op alles wat je ziet. Liggend zie je de hele kamer; rechtop veeg je door de kamer. **Terug** sluit een close-up,
legt een ding terug in je rugzak of opent het menu; op het titelscherm sluit hij de app. Een Bluetooth-controller werkt
ook: zie [escaperoom-apps.md](escaperoom-apps.md#besturing).

---

## Publiceren in Google Play, stap voor stap

Doe deel A tot en met C één keer, deel D bij elke nieuwe versie.

| Deel | Wat | Hoe vaak |
|---|---|---|
| A | De sleutel in GitHub | één keer |
| B | De app in de Google Play Console | één keer |
| C | De eerste versie, voor testers | één keer |
| D | Een nieuwe versie | bij elke update |
| E | Openbaar in Google Play | één keer |

### A. De sleutel in GitHub

Alles staat in [escaperoom-sleutels.md](escaperoom-sleutels.md): de sleutel maken (`keytool`), en
`ANDROID_KEYSTORE_BASE64` en `ANDROID_KEYSTORE_PASSWORD` als secrets zetten. Bewaar het sleutelbestand en het wachtwoord
goed: kwijt = geen updates meer.

### B. De app in de Google Play Console

1. **Account:** [play.google.com/console](https://play.google.com/console). Een bestaand account (van TripScouts of
   Ardennen) kan gewoon.
2. **App maken:** **Home → App maken**:
   - App-naam: `Het Geheim van de Albertsmaheert`
   - Standaardtaal: **Nederlands – nl-NL**
   - App of game: **Game**; gratis of betaald: **Gratis**
   - Vink de verklaringen aan → **App maken**.
3. **Google TV:** **Testen en releasen → Geavanceerde instellingen → Apparaattypen → Apparaattype toevoegen →
   Android TV**. Zonder dit staat de app niet in de Play Store op de tv.
4. **App-content** (**Beleid → App-content**), allemaal invullen:
   - **Privacybeleid:** `https://albertsmaheert.nl/escaperoom/privacy.html` (`src/escaperoom/privacy.html`). Google
     eist een beleid dat specifiek over de app gaat, op een openbare https-pagina, en een link ernaartoe in de app
     zelf (het titelscherm, de voetregel en Logeren → Contact).
   - **Toegang tot de app:** alles is zonder inloggen te gebruiken.
   - **Advertenties:** nee.
   - **Contentclassificatie:** vragenlijst invullen (een puzzelspel zonder geweld, chat of aankopen).
   - **Doelgroep:** kies de leeftijden die je wilt (bijvoorbeeld vanaf 9 jaar). Kies je ook kinderen onder 13, dan
     gelden de Families-regels; de app voldoet daaraan (geen reclame, niets verzameld).
   - **Gegevensveiligheid:** er worden geen gegevens verzameld of gedeeld. De app vraagt alleen internet, voor het
     reserveringsformulier van bedandbreakfast.nl (dat valt onder hun beleid).
   - Overheid, financiële functies, gezondheid: nee.
5. **Winkelvermelding** (**Groeien → Winkelvermelding**):
   - **Korte beschrijving** (80 tekens): *Een escaperoom op de boerderij: zoek de schat van knecht Harm.*
   - **Volledige beschrijving:** de tekst uit [escaperoom-linux.md](escaperoom-linux.md) (stap 5, *Beschrijving*).
   - **Pictogram** (512×512): `src/escaperoom/icons/icon-512.png`
   - **Feature graphic** (1024×500): [feature-graphic.png](escaperoom-store/play/feature-graphic.png)
   - **Schermafbeeldingen** (telefoon, tablet en tv): de `screenshot-*.png` in [escaperoom-store/play/](escaperoom-store/play/)
   - **Tv-banner** (1280×720): [tv-banner.png](escaperoom-store/play/tv-banner.png)
   - Categorie **Puzzel** (of **Avontuur**); website `https://albertsmaheert.nl/`

   Nieuwe plaatjes maken: `npm run store:escaperoom`.

### C. De eerste versie (interne test)

1. Haal de bundel op:
   ```bash
   npm run build:escaperoom-aab
   ```
   Dat start de workflow, wacht, en pakt `albertsmaheert.aab` uit in `dist/escaperoom-aab-<run>/` (met je
   sleutelwachtwoord).
2. **Testen en releasen → Testen → Interne test → Testers:** maak een lijst met de Google-accounts van de testers.
3. **Nieuwe release maken**, sta **Play App Signing** toe (Google bewaart de sleutel voor de winkel; jij houdt de
   uploadsleutel), upload `albertsmaheert.aab`, geef een releasenaam (bijv. `1.66`) en de releasenotes, en
   **Release uitrollen naar interne test**.
4. Stuur de testers de link **Deelnemen op internet** (onder *Testers*). Daarna vinden ze de app in Google Play.

### D. Een nieuwe versie

1. Verhoog `GAME_VERSION` (dat hoort bij elke wijziging aan het spel al), laat het op `main` samenvoegen.
2. `npm run build:escaperoom-aab` (een **nieuwe** run).
3. Upload de `.aab` als nieuwe release op hetzelfde testspoor (of productie).

Het **versionCode** is `GAME_VERSION × 1000 + runnummer` van de workflow. Google Play neemt alleen een hoger getal
dan de vorige upload. De melding *doesn't allow any existing users to upgrade* of *does not add or remove any app
bundles* betekent: deze bundel heeft geen hoger versionCode, bijvoorbeeld omdat het dezelfde `.aab` is, of een run die
opnieuw gedraaid is (*Re-run* houdt hetzelfde runnummer). Maak dan een nieuwe run met `npm run build:escaperoom-aab`.

### E. Openbaar

Werkt de test, promoveer de release dan naar **Productie** (of eerst een **gesloten test** met meer mensen; voor een
nieuw persoonlijk ontwikkelaarsaccount vraagt Google eerst een gesloten test met een aantal testers gedurende een paar
weken). Doe dit pas als Ditty en Roelof akkoord zijn, net als `ESCAPEROOM_RELEASE`.
