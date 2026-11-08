// Geluid op de achtergrond: een zachte, gegenereerde geluidsomgeving per kamer, gemaakt met de Web Audio API (geen
// geluidsbestanden). Volgt de knop Geluid, is stil op het titelscherm en in een verborgen tabblad, en verandert met het
// verhaal mee. ambKey() bepaalt wat er nu moet klinken.

const AMB = { cur: null, master: null, nodes: [], timers: [] };
let noiseBuf = null;

function audioCtx(){ ac = ac || new (window.AudioContext || window.webkitAudioContext)(); return ac; }

/* Wat er nu moet klinken, als sleutel zoals 'erf+avond'. null is stilte. */
function ambKey(){
  if(!soundOn || !S.started || !$('#title').hidden || document.visibilityState !== 'visible') return null;
  const f = S.f;
  switch(S.scene){
    case 'erf': return 'erf';
    case 'stal': return 'stal';
    case 'zolder': case 'kamer': return 'zolder';
    case 'museum': return 'museum' + (f.tractor ? '+trekker' : '');
    case 'dak': return 'dak';
    case 'zaal': return 'zaal' + (f.lampjes ? '+feest' : '');
    case 'tuin': return 'tuin';
  }
  return null;
}
function ambUpdate(){
  let want = null;
  try{ want = ambKey(); }catch(e){}
  if(want === AMB.cur) return;
  ambStop();
  AMB.cur = want;
  if(want){ try{ ambStart(want); }catch(e){ AMB.cur = null; } }
}
function ambStop(){
  AMB.timers.forEach(clearTimeout); AMB.timers = [];
  const m = AMB.master, nodes = AMB.nodes;
  AMB.master = null; AMB.nodes = [];
  if(!m || !ac) return;
  m.gain.cancelScheduledValues(ac.currentTime);
  m.gain.setTargetAtTime(0, ac.currentTime, .25);
  setTimeout(() => { nodes.forEach(n => { try{ n.stop && n.stop(); }catch(e){} try{ n.disconnect(); }catch(e){} }); try{ m.disconnect(); }catch(e){} }, 1500);
}
function noise(ctx){
  if(noiseBuf) return noiseBuf;
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0); let last = 0;
  for(let i = 0; i < d.length; i++){ last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
  return noiseBuf;
}
/* bouwstenen: wind/ruis door een filter, een lage brom, en losse geluidjes op willekeurige momenten */
function ambNoise(ctx, out, freq, q, vol){
  const s = ctx.createBufferSource(); s.buffer = noise(ctx); s.loop = true;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain(); g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(out); s.start();
  AMB.nodes.push(s, f, g);
  return g;
}
function ambHum(ctx, out, freq, vol, type = 'sine'){
  const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
  const g = ctx.createGain(); g.gain.value = vol; o.connect(g); g.connect(out); o.start(); AMB.nodes.push(o, g);
  return o;
}
function ambEvery(min, max, fn){
  const tick = () => { if(!AMB.master) return; try{ fn(); }catch(e){} AMB.timers.push(setTimeout(tick, min + Math.random() * (max - min))); };
  AMB.timers.push(setTimeout(tick, min * Math.random() + 400));
}
function chirp(ctx, out, f0, f1, dur, vol){
  const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
  const t = ctx.currentTime; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + .05);
}
const SOUNDSCAPES = {
  // het erf: wind door de bomen, zwaluwen die tjirpen, af en toe een koe in de verte
  erf(ctx, out){ ambNoise(ctx, out, 500, .6, .05);
    ambEvery(1800, 5000, () => { for(let i = 0; i < 3; i++) setTimeout(() => chirp(ctx, out, 4200 + Math.random() * 800, 3000, .08, .012), i * 110); });
    ambEvery(14000, 26000, () => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(140, ctx.currentTime); o.frequency.linearRampToValueAtTime(110, ctx.currentTime + 1.4);
      const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 500; g.gain.setValueAtTime(0, ctx.currentTime); g.gain.linearRampToValueAtTime(.012, ctx.currentTime + .3); g.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      o.connect(fl); fl.connect(g); g.connect(out); o.start(); o.stop(ctx.currentTime + 1.6); }); },
  // de stal: een krekel buiten, het tikken van de wekkerradio
  stal(ctx, out){ ambNoise(ctx, out, 300, .5, .015);
    ambEvery(400, 900, () => chirp(ctx, out, 5200, 5000, .04, .006)); },
  // de hooizolder: het hout kraakt, vogels buiten
  zolder(ctx, out){ ambNoise(ctx, out, 700, .7, .02);
    ambEvery(3000, 7000, () => chirp(ctx, out, 2600 + Math.random() * 900, 1900, .18, .01));
    ambEvery(9000, 16000, () => chirp(ctx, out, 90, 70, .5, .02)); },
  // het museum: een oude klok tikt
  museum(ctx, out){ ambNoise(ctx, out, 250, .5, .012);
    ambEvery(1000, 1001, () => chirp(ctx, out, 1800, 1600, .03, .01)); },
  'museum+trekker'(ctx, out){ SOUNDSCAPES.museum(ctx, out); const o = ambHum(ctx, out, 38, .03, 'sawtooth'); },
  // het platte dak: wijde wind, een leeuwerik
  dak(ctx, out){ ambNoise(ctx, out, 400, .4, .07);
    ambEvery(2000, 4000, () => { for(let i = 0; i < 5; i++) setTimeout(() => chirp(ctx, out, 3000 + Math.random() * 1500, 3600, .07, .008), i * 90); }); },
  // de zaal: gezellig geroezemoes
  zaal(ctx, out){ ambNoise(ctx, out, 900, .8, .02); },
  'zaal+feest'(ctx, out){ ambNoise(ctx, out, 900, .8, .04); ambNoise(ctx, out, 1600, 1.2, .015);
    ambEvery(2500, 6000, () => chirp(ctx, out, 2600, 2600, .05, .01)); },
  // de tuin bij avond: krekels, een uil
  tuin(ctx, out){ ambNoise(ctx, out, 400, .5, .02);
    ambEvery(300, 700, () => chirp(ctx, out, 4800, 4700, .05, .006));
    ambEvery(12000, 22000, () => { chirp(ctx, out, 420, 380, .4, .02); setTimeout(() => chirp(ctx, out, 420, 360, .6, .02), 600); }); }
};
function ambStart(key){
  const ctx = audioCtx();
  if(ctx.state === 'suspended') ctx.resume().catch(() => {});
  const m = ctx.createGain(); m.gain.value = 0; m.connect(ctx.destination);
  AMB.master = m;
  (SOUNDSCAPES[key] || (() => {}))(ctx, m);
  m.gain.setTargetAtTime(1, ctx.currentTime, .6);
}
['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { if(ac && ac.state === 'suspended') ac.resume().catch(() => {}); }, { passive: true }));
document.addEventListener('visibilitychange', ambUpdate);
setInterval(ambUpdate, 700);
