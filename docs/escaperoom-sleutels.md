# Escaperoom-apps: de secrets maken

De workflows **Escaperoom: Android-app**, **Linux-app** en **Chrome-extensie** werken zonder secrets: ze bouwen dan de
`.apk`, de snap en de Chrome-extensie als artefact. Met deze secrets kan hij meer. Dezelfde namen als in w3nl/tripscouts, dus de commando's zijn bijna gelijk.

Secrets zet je één keer; niemand kan ze teruglezen (ook jij niet), en ze komen nooit in de logs.

Je hebt nodig: een terminal en de GitHub CLI `gh`, ingelogd:

```bash
gh auth login
```

Bekijk achteraf welke er staan (alleen de namen):

```bash
gh secret list --repo w3nl/albertsmaheert
```

---

## 1. De Android-sleutel: `ANDROID_KEYSTORE_BASE64` en `ANDROID_KEYSTORE_PASSWORD`

Waarvoor: elke nieuwe `.apk` installeert dan over de oude heen (anders eerst de oude verwijderen), en de workflow maakt
ook de bundel (`.aab`) voor Google Play. Je hebt Java's `keytool` nodig (Ubuntu: `sudo apt install openjdk-21-jre-headless`;
Mac/Windows: Temurin van adoptium.net).

**Maak de sleutel**, in een map buiten de repository (bijvoorbeeld je thuismap):

```bash
keytool -genkeypair -v -keystore albertsmaheert.jks -alias albertsmaheert -keyalg RSA -keysize 2048 -validity 10000
```

- Kies een sterk wachtwoord en schrijf het op. Vraagt hij een tweede wachtwoord (voor de sleutel): Enter, of hetzelfde.
- Naam, organisatie, plaats: wordt niet gecontroleerd en niet getoond. "Albertsmaheert" en `NL` is genoeg. Eindig met `yes`.

**Controleer** (vraagt het wachtwoord; je ziet `albertsmaheert, …, PrivateKeyEntry`):

```bash
keytool -list -keystore albertsmaheert.jks -alias albertsmaheert
```

**Bewaar** `albertsmaheert.jks` en het wachtwoord veilig (wachtwoordmanager en een USB-stick). Nooit in de repository,
een mail of een chat. Kwijt = geen updates meer in Google Play (Google kan hem op verzoek vervangen, maar dat duurt).

**Zet hem in GitHub**, in de map met `albertsmaheert.jks`:

- Linux:
  ```bash
  base64 -w0 albertsmaheert.jks | gh secret set ANDROID_KEYSTORE_BASE64 --repo w3nl/albertsmaheert
  ```
- Mac:
  ```bash
  base64 -i albertsmaheert.jks | tr -d '\n' | gh secret set ANDROID_KEYSTORE_BASE64 --repo w3nl/albertsmaheert
  ```
- Windows (PowerShell):
  ```powershell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("albertsmaheert.jks")) | gh secret set ANDROID_KEYSTORE_BASE64 --repo w3nl/albertsmaheert
  ```

En het wachtwoord (`gh` vraagt erom, zodat het niet in je geschiedenis komt):

```bash
gh secret set ANDROID_KEYSTORE_PASSWORD --repo w3nl/albertsmaheert
```

**De sleutel van TripScouts hergebruiken?** Kan (Google accepteert één uploadsleutel voor meer apps), maar je hebt dan
het bestand `cabinweek.jks` en het wachtwoord nodig: GitHub geeft secrets nooit terug. Zet ze zoals hierboven, en
vertel de workflow de alias:

```bash
gh variable set ANDROID_KEY_ALIAS --body cabinweek --repo w3nl/albertsmaheert
```

Een eigen sleutel per app is netter: lekt er één, dan geldt dat maar voor één app.

**Klopt het?** Draai de workflow (Actions → *Escaperoom: Android-app* → Run workflow). De stap *Vaste sleutel* zegt
wat er mis is: geen geldige base64, een wachtwoord dat niet past, of een alias die niet in het bestand zit (hij noemt
dan de aliassen die er wél in zitten). Daarna staat onder Artifacts ook `escaperoom-google-play`:
een 7z-bestand met de `.aab`, op slot met je sleutelwachtwoord (`7z x albertsmaheert-google-play.7z`). Die `.aab` upload je
in de [Play Console](https://play.google.com/console); de eerste upload legt je uploadsleutel vast bij Google.

Of in één keer vanaf je eigen computer (start de workflow, wacht, downloadt en pakt uit met je wachtwoord):

```bash
npm run build:escaperoom-aab
```

---

## 2. De Snap Store: `SNAPCRAFT_STORE_CREDENTIALS`

Waarvoor: de workflow zet elke nieuwe versie op `main` in de Snap Store (kanaal `edge`), zodra ook
`ESCAPEROOM_RELEASE` op `true` staat. Dit gaat op een Linux-computer (of in een Ubuntu-VM / WSL op Windows).

1. Maak een account op [snapcraft.io](https://snapcraft.io/) (Ubuntu One) en installeer snapcraft:
   ```bash
   sudo snap install snapcraft --classic
   ```
2. Log in en reserveer de naam (eenmalig; de snap heet `albertsmaheert`, zoals in `apps/escaperoom/linux/package.json`):
   ```bash
   snapcraft login
   ```
   ```bash
   snapcraft register albertsmaheert
   ```
3. Maak een login die alleen deze snap mag uploaden, en zet die meteen in GitHub:
   ```bash
   snapcraft export-login --snaps=albertsmaheert --channels=edge,stable - | gh secret set SNAPCRAFT_STORE_CREDENTIALS --repo w3nl/albertsmaheert
   ```
   Zo'n login verloopt na een jaar; doe dan stap 3 opnieuw.
4. Na de eerste upload: test met `sudo snap install albertsmaheert --edge`, en vul op snapcraft.io → *My snaps* →
   albertsmaheert → *Listing* de titel, beschrijving en schermafbeeldingen in. Vraag daar ook de automatische
   aansluiting van `joystick` aan (voor de controller), anders: `sudo snap connect albertsmaheert:joystick`.
5. Rechtstreeks naar iedereen in plaats van `edge`:
   ```bash
   gh variable set SNAP_CHANNEL --body stable --repo w3nl/albertsmaheert
   ```

**Gaat het mis?** Bij *Credentials could not be parsed* staat er iets anders dan de login in het secret, bijvoorbeeld
een foutmelding omdat `snapcraft login` of `snapcraft register` nog niet gedaan was (dan schrijft `export-login` niets
naar de pijp). Zet hem dan via een bestand, zodat je eerst ziet of het gelukt is:

```bash
snapcraft export-login --snaps=albertsmaheert --channels=edge,stable albertsmaheert-snap.login
```

```bash
gh secret set SNAPCRAFT_STORE_CREDENTIALS --repo w3nl/albertsmaheert < albertsmaheert-snap.login
```

```bash
rm albertsmaheert-snap.login
```

Een login van TripScouts werkt niet: die mag alleen de snap `tripscouts` uploaden.

---

## 3. Pas na goedkeuring: `ESCAPEROOM_RELEASE`

Zolang de escaperoom verborgen is, maakt de workflow geen release en uploadt hij niets. Als Ditty en Roelof akkoord zijn:

```bash
gh variable set ESCAPEROOM_RELEASE --body true --repo w3nl/albertsmaheert
```

Vanaf dan krijgt elke nieuwe spelversie op `main` per app een release (`escaperoom-android-v1.<versie>.0`,
`escaperoom-linux-…` en `escaperoom-chrome-…`), en gaat de snap naar de Snap Store (als dat secret er is). Haal ook `hidden` weg uit het blok op de
homepage en de `robots`-regel uit het spel (zie [escaperoom.md](escaperoom.md)).

---

## Iets mis?

| Melding in de workflow | Wat te doen |
|---|---|
| `ANDROID_KEYSTORE_BASE64 is geen geldige base64-tekst` | Het secret bevat iets anders dan de sleuteltekst. Zet hem opnieuw met het `base64 … \| gh secret set`-commando. |
| `De sleutel gaat niet open` + `password was incorrect` | `ANDROID_KEYSTORE_PASSWORD` past niet bij dit sleutelbestand. Controleer met `keytool -list -keystore <bestand>` en zet het wachtwoord opnieuw. |
| `heeft geen sleutel met de alias …` | De melding noemt de aliassen in het bestand: zet `ANDROID_KEY_ALIAS` op die naam (de sleutel van TripScouts: `cabinweek`). |
| `SNAPCRAFT_STORE_CREDENTIALS is niet de uitvoer van 'snapcraft export-login'` | Zie *Gaat het mis?* bij de Snap Store hierboven. |
| Geen artefact `escaperoom-google-play` | De sleutel-secrets ontbreken, of het artefact is na 7 dagen verlopen: draai de workflow opnieuw. |

