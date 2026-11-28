// Spelen zonder muis: met een controller (Gamepad API, standaardindeling: Xbox, PlayStation, Stadia, Switch Pro…),
// met de afstandsbediening van een tv (pijltjes, OK en Terug) en met alleen een toetsenbord (pijltjes, Enter, Esc).
// Je springt van klikvlak naar klikvlak in de richting die je kiest; een kader en het label laten zien wat je kiest.
//
//   Stick of pijltjes  kiezen (in de kamer, in de rugzak, in een close-up of een menu)
//   A / ✕ / Enter / OK  klikken, of het gesprek verder lezen
//   B / ○ / Esc / Terug  terug: close-up dicht, ding weer in de rugzak, gesprek verder, of naar het menu
//   X / □               een hint            Y / △   laat zien wat je kunt aanklikken
//   LB / RB              vorig / volgend ding uit de rugzak kiezen
//   Start                 het menu (op het titelscherm: verder spelen of een nieuw spel)
//
// In de Android-app geeft de app de controller zelf door als window.__nativePad (de WebView doet dat niet op elk toestel),
// en vraagt de Terug-knop window.tvBack(): false betekent "sluit de app". Geladen na app.js door js/boot.js.

const PAD = { prev: [], dir: null, t: 0, repeat: false, ctx: '', last: null };
const PB = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, SELECT: 8, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };
/* Waarmee is het laatst gespeeld? Alleen met toetsenbord, afstandsbediening of controller zetten we de focus zelf ergens. */
let lastInput = 'pointer';
addEventListener('pointerdown', () => { lastInput = 'pointer'; padTip(null); }, true);

/* ---------- wat je nu kunt kiezen ---------- */
const shown = el => { if(!el || !el.isConnected) return false; const r = el.getBoundingClientRect(); if(r.width < 2 || r.height < 2) return false;
  for(let e = el; e && e !== document.body; e = e.parentElement || e.parentNode){ if(e.hidden || (e.style && e.style.display === 'none')) return false; }
  return getComputedStyle(el).visibility !== 'hidden'; };
function padContext(){
  if($('#booking')) return 'booking';   // het reserveringsformulier over het hele scherm (app.js openBooking)
  if(!$('#modal').hidden) return 'modal';
  if(!$('#title').hidden) return 'title';
  if(!$('#win').hidden) return 'win';
  return 'room:' + S.scene;
}
function padItems(){
  const ctx = padContext();
  let list;
  if(ctx === 'booking') list = [$('#booking-close')];
  else if(ctx === 'modal'){
    // knoppen, keuzelijsten, links, en wat een close-up zelf klikbaar maakt (onclick), zoals de lampjes van de slinger
    list = [...$('#modal').querySelectorAll('*')].filter(el => el.matches('button, select, input, a[href]') || typeof el.onclick === 'function');
  } else if(ctx === 'title' || ctx === 'win'){
    list = [...$('#' + ctx).querySelectorAll('button, a[href]')];
  } else {
    list = [...document.querySelectorAll('.scene.on .hit'), ...document.querySelectorAll('#slots .slot.filled'), ...document.querySelectorAll('#d-stay:not([hidden])')];
  }
  return list.filter(el => !el.disabled && shown(el));
}
function padCurrent(){ const a = document.activeElement; return a && padItems().includes(a) ? a : null; }
/* Waar de focus begint: in een close-up het eerste ding om mee te puzzelen (niet de sluitknop), in de kamer het klikvlak
   waar je was, of het dichtst bij het midden. */
function padDefault(list){
  const ctx = padContext();
  if(ctx === 'modal') return list.find(el => el.id !== 'm-close') || list[0];
  if(ctx === 'title') return list.find(el => el.id === 'btn-cont' ) || list.find(el => el.id === 'btn-new') || list[0];
  if(ctx === 'win') return list.find(el => el.id === 'btn-next') || list[0];
  if(PAD.last && list.includes(PAD.last)) return PAD.last;
  const r = $('#stage').getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  let best = list[0], bd = Infinity;
  for(const el of list.filter(e => e.classList.contains('hit'))){
    const q = el.getBoundingClientRect(); if(q.width * q.height > r.width * r.height * .25) continue;   // geen enorme achtergrondvlakken
    const d = Math.hypot(q.left + q.width / 2 - cx, q.top + q.height / 2 - cy); if(d < bd){ bd = d; best = el; }
  }
  return best;
}

/* ---------- de focus zetten en laten zien ---------- */
function padFocus(el){
  if(!el) return;
  document.querySelectorAll('.pad-focus').forEach(e => e.classList.remove('pad-focus'));
  el.classList.add('pad-focus');
  try{ el.focus({ preventScroll: true }); }catch(e){}
  try{ el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }catch(e){}
  if(el.classList.contains('hit')){ PAD.last = el; padTip(el); } else padTip(null);
}
/* Het label boven het gekozen klikvlak: op een tv of met een controller is er geen muis om eroverheen te gaan. */
function padTip(el){
  const tip = $('#tip');
  if(!el){ if(tip.dataset.pad){ tip.hidden = true; delete tip.dataset.pad; } return; }
  const st = $('#stage').getBoundingClientRect(), r = el.getBoundingClientRect();
  tip.dataset.pad = '1'; tip.hidden = false;
  tip.textContent = sel ? tx('{item} gebruiken op: {spot}', { item: ITEMS[sel].name, spot: el.dataset.label }) : el.dataset.label;
  tip.style.left = Math.min(Math.max(r.left + r.width / 2 - st.left, 90), st.width - 90) + 'px';
  tip.style.top = Math.max(r.top - st.top, 34) + 'px';
}
addEventListener('focusout', e => { if(e.target.classList) e.target.classList.remove('pad-focus'); });

/* ---------- bewegen: naar het dichtstbijzijnde ding in een richting ---------- */
function padMove(dir){
  const list = padItems(); if(!list.length) return;
  const cur = padCurrent();
  if(!cur) return padFocus(padDefault(list));
  // in een keuzelijst kiezen links en rechts een andere waarde; boven en onder gaan naar het volgende ding
  if(cur.tagName === 'SELECT' && (dir === 'left' || dir === 'right')){
    const n = cur.options.length; if(!n) return;
    cur.selectedIndex = Math.max(0, Math.min(n - 1, cur.selectedIndex + (dir === 'left' ? -1 : 1)));
    cur.dispatchEvent(new Event('change', { bubbles: true })); beep(700, .03); return;
  }
  const r = cur.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  let best = null, bestScore = Infinity;
  for(const el of list){
    if(el === cur) continue;
    const q = el.getBoundingClientRect();
    // afstand tot de dichtstbijzijnde rand (niet het midden): grote vlakken naast kleine dingen werken dan ook goed
    const nx = Math.max(q.left, Math.min(cx, q.right)), ny = Math.max(q.top, Math.min(cy, q.bottom));
    const x = (q.left + q.width / 2) - cx, y = (q.top + q.height / 2) - cy;
    const main = dir === 'left' ? cx - q.right : dir === 'right' ? q.left - cx : dir === 'up' ? cy - q.bottom : q.top - cy;
    const centre = dir === 'left' ? -x : dir === 'right' ? x : dir === 'up' ? -y : y;
    if(centre <= 4) continue;
    const side = dir === 'left' || dir === 'right' ? Math.abs(ny - cy) : Math.abs(nx - cx);
    const score = Math.max(main, 0) + side * 2.2 + centre * .15;
    if(score < bestScore){ bestScore = score; best = el; }
  }
  if(best){ padFocus(best); beep(520, .02, 'sine', .02); }
}

/* ---------- drukken, terug en de andere knoppen ---------- */
function padPress(){
  const ctx = padContext();
  // in de kamer leest A eerst het gesprek verder, zoals een klik op de tekst
  if(ctx.startsWith('room') && !$('#dialog').hidden && padCurrent() !== $('#d-stay')){ $('#dialog').dispatchEvent(new MouseEvent('click', { bubbles: true })); return; }
  const list = padItems(), cur = padCurrent();
  if(!cur) return padFocus(padDefault(list));
  if(cur.tagName === 'SELECT'){ return padMove('right'); }
  if(cur.tagName === 'A' && cur.href){ cur.click(); return; }
  if(cur.classList.contains('hit')) cur.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  else if(typeof cur.click === 'function' && cur instanceof HTMLElement) cur.click();
  else cur.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  requestAnimationFrame(() => { if(cur.classList.contains('hit') && padContext().startsWith('room') && shown(cur)) padTip(cur); });
}
/* Een stap terug. Geeft false als er niets meer terug te gaan is (dan sluit de Android-app). */
function padBack(){
  const ctx = padContext();
  if(ctx === 'booking') return closeBooking();
  if(ctx === 'modal'){ closeModal(); return true; }
  if(sel){ sel = null; renderInv(); const c = padCurrent(); if(c && c.classList.contains('hit')) padTip(c); return true; }
  if(ctx.startsWith('room')){
    if(!$('#dialog').hidden){ $('#dialog').dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; }
    $('#btn-menu').click(); return true;
  }
  if(ctx === 'win'){ $('#btn-stay').click(); return true; }
  return false;   // het titelscherm
}
/* Een ding uit de rugzak kiezen met LB en RB, zonder de focus uit de kamer te halen. */
function padItem(step){
  if(!padContext().startsWith('room') || !S.inv.length) return;
  const i = sel ? S.inv.indexOf(sel) : (step > 0 ? -1 : S.inv.length);
  const j = i + step;
  sel = j < 0 || j >= S.inv.length ? null : S.inv[j];
  renderInv(); beep(880, .04);
  const c = padCurrent(); if(c && c.classList.contains('hit')) padTip(c);
}
function padStart(){
  const ctx = padContext();
  if(ctx === 'title'){ const b = !$('#btn-cont').hidden ? $('#btn-cont') : $('#btn-new'); b.click(); return; }
  if(ctx === 'modal') closeModal();
  if(ctx === 'win'){ (!$('#btn-next').hidden ? $('#btn-next') : $('#btn-stay')).click(); return; }
  $('#btn-menu').click();
}
window.tvBack = () => { lastInput = 'pad'; return padBack(); };

/* ---------- toetsenbord en tv-afstandsbediening ---------- */
const PAD_KEYS = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
document.addEventListener('keydown', e => {
  if(e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName) && e.target.type !== 'range') return;
  const dir = PAD_KEYS[e.key];
  if(dir){ e.preventDefault(); lastInput = 'key'; padMove(dir); return; }
  if(e.key === 'Enter' || e.key === 'OK' || e.key === 'Select'){
    // een klikvlak drukt zichzelf al in (core.js); een knop doet dat ook. Alleen de rest (gesprek, keuzelijst) hier.
    const cur = padCurrent();
    if(cur && (cur.classList.contains('hit') || cur.tagName === 'BUTTON' || cur.tagName === 'A') && ($('#dialog').hidden || padContext() !== 'room:' + S.scene)) return;
    e.preventDefault(); e.stopImmediatePropagation(); lastInput = 'key'; padPress(); return;
  }
  if(e.key === 'GoBack' || e.key === 'BrowserBack' || e.key === 'Backspace'){ e.preventDefault(); lastInput = 'key'; padBack(); return; }
  if(e.key === 'Escape' && $('#modal').hidden && sel){ sel = null; renderInv(); }
}, true);

/* ---------- de controller: elk beeld uitlezen ---------- */
function padsNow(){
  const n = window.__nativePad;
  if(n){
    const seen = PAD.presses || [], cnt = n.presses || [];
    PAD.presses = cnt.slice();
    return [{ id: 'Android controller', axes: n.axes || [0, 0],
      buttons: (n.buttons || []).map((v, i) => { const on = !!v || (cnt[i] || 0) !== (seen[i] || 0); return { pressed: on, value: on ? 1 : 0 }; }) }];
  }
  try{ return [...(navigator.getGamepads ? navigator.getGamepads() : [])].filter(p => p && p.connected); }catch(e){ return []; }
}
function padName(id = ''){
  if(/054c|playstation|dualshock|dualsense|wireless controller/i.test(id)) return 'PlayStation-controller';
  if(/xbox|045e|xinput/i.test(id)) return 'Xbox-controller';
  if(/stadia|18d1/i.test(id)) return 'Stadia-controller';
  if(/057e|nintendo|pro controller/i.test(id)) return 'Switch-controller';
  return 'Controller';
}
function padStatus(){
  const pads = padsNow(), el = $('#gp-status');
  document.documentElement.classList.toggle('gp-on', pads.length > 0);
  if(!el) return;
  el.hidden = !pads.length;
  if(pads.length) el.textContent = tx('{pad} verbonden. Stick of pijltjes kiezen · A klikken · B terug · X hint · Y toon alles · LB/RB rugzak · Start menu', { pad: padName(pads[0].id) });
}
addEventListener('gamepadconnected', () => { lastInput = 'pad'; padStatus(); });
addEventListener('gamepaddisconnected', padStatus);

function padLoop(){
  const pads = padsNow();
  let dir = null;
  pads.forEach((p, i) => {
    const now = p.buttons.map(b => !!b && (b.pressed || b.value > .5));
    const prev = PAD.prev[i] || [];
    const down = k => !!now[k] && !prev[k];
    const ax = p.axes[0] || 0, ay = p.axes[1] || 0;
    if(now.some(Boolean) || Math.abs(ax) > .5 || Math.abs(ay) > .5){ if(lastInput !== 'pad'){ lastInput = 'pad'; padStatus(); } }
    if(now[PB.LEFT] || ax < -.5) dir = 'left'; else if(now[PB.RIGHT] || ax > .5) dir = 'right';
    else if(now[PB.UP] || ay < -.5) dir = 'up'; else if(now[PB.DOWN] || ay > .5) dir = 'down';
    if(down(PB.A)) padPress();
    else if(down(PB.B)) padBack();
    if(down(PB.X)) $('#btn-hint').click();
    if(down(PB.Y) || down(PB.SELECT)) $('#btn-reveal').click();
    if(down(PB.LB) || down(PB.LT)) padItem(-1);
    if(down(PB.RB) || down(PB.RT)) padItem(1);
    if(down(PB.START)) padStart();
    PAD.prev[i] = now;
  });
  // één stap per duw, en bij vasthouden na een korte pauze herhalen
  const t = performance.now();
  if(!dir) PAD.dir = null;
  else if(dir !== PAD.dir){ PAD.dir = dir; PAD.t = t; PAD.repeat = false; padMove(dir); }
  else if(t - PAD.t > (PAD.repeat ? 150 : 400)){ PAD.t = t; PAD.repeat = true; padMove(dir); }
  // als er iets anders op het scherm komt (een close-up, het menu, een andere kamer), de focus meteen meenemen
  const ctx = padContext();
  if(ctx !== PAD.ctx){
    const wasModal = PAD.ctx === 'modal';
    PAD.ctx = ctx;
    if(lastInput !== 'pointer'){
      requestAnimationFrame(() => {
        const list = padItems();
        if(!padCurrent()) padFocus(wasModal && PAD.last && list.includes(PAD.last) ? PAD.last : padDefault(list));
      });
    } else padTip(null);
  }
  requestAnimationFrame(padLoop);
}
padStatus();
requestAnimationFrame(padLoop);
