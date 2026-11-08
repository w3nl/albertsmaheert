// Stemmen: leest elke regel voor met de spraak van de browser (Web Speech API). Staat standaard uit; de knop Stemmen
// zet hem aan (bewaard als KEY-voice). core.js roept speakLine() aan voor elke regel. In browsers zonder spraak blijft
// de knop verborgen. Geladen op volgorde door js/boot.js.

const VOICE_KEY = KEY + '-voice';
const canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let voiceOn = (() => { try{ return localStorage.getItem(VOICE_KEY) === '1'; }catch(e){ return false; } })();

/* Hoe iedereen klinkt. Toonhoogte en snelheid maken de stem; slot kiest een van de Nederlandse stemmen op het apparaat. */
const VOICE_STYLE = {
  sys:     { pitch: 1,    rate: 1,    slot: 0 },   // de verteller
  you:     { pitch: 1.1,  rate: 1.05, slot: 1 },
  roelof:  { pitch: .75,  rate: .95,  slot: 2 },   // rustig, weet alles van oude dingen
  ditty:   { pitch: 1.2,  rate: 1.05, slot: 5 },   // hartelijk, altijd koffie
  harm:    { pitch: .6,   rate: .85,  slot: 3 },   // de brief uit 1921
  paardje: { pitch: 1.8,  rate: .9,   slot: 1 },
  gast:    { pitch: 1.3,  rate: 1.1,  slot: 4 },
  ree:     { pitch: 2,    rate: 1.2,  slot: 4 }
};
function voicesFor(){ return speechSynthesis.getVoices().filter(v => /^nl/i.test(v.lang)); }

function speakLine(who, text){
  if(!canSpeak || !voiceOn) return;
  speechSynthesis.cancel();
  const clean = String(text).replace(/[♪▸▶✕★✓]/g, ' ').replace(/…/g, '... ').replace(/\s+/g, ' ').trim();
  if(!/[A-Za-z0-9]/.test(clean)) return;   // de "…" van het hobbelpaardje blijft stil
  const u = new SpeechSynthesisUtterance(clean), st = VOICE_STYLE[who] || VOICE_STYLE.sys, vs = voicesFor();
  u.lang = 'nl-NL';
  if(vs.length) u.voice = vs[st.slot % vs.length];
  u.pitch = st.pitch; u.rate = st.rate; u.volume = .9;
  speechSynthesis.speak(u);
}
function stopSpeaking(){ if(canSpeak) speechSynthesis.cancel(); }

function showVoice(){
  const b = $('#btn-voice');
  b.hidden = !canSpeak;
  b.textContent = voiceOn ? 'Stemmen aan' : 'Stemmen uit';
  b.title = 'Leest de gesprekken voor met de stemmen op je apparaat.';
}
$('#btn-voice').onclick = () => {
  voiceOn = !voiceOn;
  try{ localStorage.setItem(VOICE_KEY, voiceOn ? '1' : '0'); }catch(e){}
  showVoice(); beep(700, .04);
  if(voiceOn) say([['ditty', "Stemmen aan! Hoor je mij? Moi!"]]);
  else { stopSpeaking(); if(!$('#dialog').hidden && queue.length === 0) $('#dialog').hidden = true; }
};
if(canSpeak) speechSynthesis.getVoices();   // sommige browsers laden hun stemmen pas na de eerste vraag
showVoice();
