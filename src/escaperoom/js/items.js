// Dingen uit je rugzak gebruiken op iets in de kamer (useItem), voor alle hoofdstukken.
// Geladen op volgorde door js/boot.js; alle spelbestanden delen dezelfde globale ruimte.

function useItem(item, hs){
  if(item === 'paardje'){
    const st = stage_(), arr = HINTS[st];
    if(chapterDone() || !arr) return say([['paardje', "…"], "Het hobbelpaardje hobbelt tevreden heen en weer. Het heeft niets te zeggen."]);
    S.ach.paardje = true; save();
    return say([['paardje', "Klok, klok…"], ['sys', tx('Het hobbelpaardje knikt naar iets: {hint}', { hint: arr[0] })]]);
  }
  /* hoofdstuk 1 */
  if(item === 'zaklamp'){
    if(hs === 'prins' || hs === 'ruif' || hs === 'bordjes') return shineTorch();
    if(S.scene === 'erf') return say("Het is nog licht genoeg buiten. Bewaar de zaklamp voor de donkere hoeken van de stal.");
    return say("Je schijnt in het rond. Alles is al goed te zien; de lamp brandt. Waar is het hier echt donker?");
  }
  if(item === 'sleutel'){
    if(hs === 'stal') return H.stal();
    if(hs === 'voordeur') return say("Deze sleutel past niet in de voordeur. Op het hangertje staat PAARDENSTAL.");
    return say("De sleutel van de Paardenstal. Die deur is bij de schuur, met een bordje ernaast.");
  }
  if(item === 'hoefijzer'){
    if(S.scene !== 'stal') return say(hs === 'ree' ? "De ree is niet van ijzer beslagen. Die loopt op zijn eigen hoefjes." : "Een hoefijzer hang je boven een deur, voor geluk. Maar welke deur?");
    if(hs === 'haak' || hs === 'plank' || hs === 'uitstal') return openHoef();
    return say("Boven de staldeur zit een spijker. Daar hoort een hoefijzer, voor geluk.");
  }
  /* hoofdstuk 3 */
  if(item === 'oudesleutel'){
    if(hs === 'kistje') return kistOpen();
    return say(hs === 'kast' ? "Dat kastje is al open." : "Een zware oude sleutel met een krul. Die hoort bij het kistje van Thedema, in het museum.");
  }
  if(item === 'kaart'){
    if(hs === 'akkers') return openAkkers();
    return say(S.scene === 'museum' ? "Een kaart van drie akkers. Van hieruit zie je geen akkers: daarvoor moet je hoog zitten. Het platte dak misschien?" : "Harms kaart hoort bij de akkers. Kijk eens over het land.");
  }
  if(typeof useItem4 === 'function'){ const r = useItem4(item, hs); if(r !== false) return; }
  say(hs === 'ree' ? "De ree snuffelt eraan en kijkt je verbaasd aan." : "Dat werkt hier niet. Probeer het ergens anders.");
}
