# Drukwerk: de escaperoom in de B&B

Om gasten de escaperoom te laten spelen: een QR-code naar **https://albertsmaheert.nl/escaperoom/**.

| Bestand | Wat | Printen |
|---|---|---|
| [poster-a4.pdf](poster-a4.pdf) | Poster met een plaatje van het erf, een korte uitleg en een grote QR-code | A4, *werkelijke grootte* (niet "passend maken") |
| [kaartjes-a4.pdf](kaartjes-a4.pdf) | Vier kaartjes (A6) voor op de kamers, de ontbijttafel of bij de sleutels | A4, en knippen langs de stippellijnen |
| [qr-escaperoom.svg](qr-escaperoom.svg) | Alleen de QR-code, voor eigen drukwerk (scherp op elke grootte) | |

De `.png`-bestanden zijn voorbeelden om te bekijken. Print op stevig papier (200 g of meer) voor de kaartjes; een
lijstje of plexi standaard houdt de poster mooi.

**Werkt de code?** Scan hem eerst met je eigen telefoon. Hij gaat naar albertsmaheert.nl/escaperoom en werkt zolang het
spel daar staat; het adres verandert niet, dus het drukwerk blijft bruikbaar.

## Opnieuw maken

Na een nieuwe tekst of een nieuw plaatje (`docs/escaperoom-store/play/feature-graphic.png`):

```bash
npm run print:escaperoom
```

Het script staat in `tools/escaperoom/print.js`. De QR-code zelf is één keer gemaakt (alleen opnieuw nodig als het adres
verandert):

```bash
npx qrcode@1.5.4 -t svg -e Q -q 0 -d 24120a -l 0000 -o docs/escaperoom-print/qr-escaperoom.svg https://albertsmaheert.nl/escaperoom/
```
