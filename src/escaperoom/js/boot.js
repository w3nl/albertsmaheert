// Opstarten: zet de tekeningen van de kamers (scenes/*.svg) in het speelveld en laadt daarna de spelbestanden op volgorde.
// De tekeningen worden opgehaald, dus het spel moet via http(s) draaien: GitHub Pages, `npm start` of een andere webserver.
const GAME_VERSION = 6;   // staat op het titelscherm; hetzelfde getal als CACHE in sw.js
(async () => {
  const scenes = ['erf', 'stal', 'zolder', 'kamer', 'museum', 'dak', 'zaal', 'tuin'];
  const scripts = ['core', 'chapter1', 'chapter2', 'chapter3', 'chapter4', 'items', 'hints', 'ambience', 'voice', 'app'];
  const title = document.getElementById('title');
  try {
    if (location.protocol === 'file:') throw new Error('file');
    const svgs = await Promise.all(scenes.map(n => fetch(`scenes/${n}.svg`).then(r => { if (!r.ok) throw new Error(n); return r.text(); })));
    const fade = document.getElementById('fade');
    svgs.forEach(svg => fade.insertAdjacentHTML('beforebegin', svg));
    for (const name of scripts) {
      await new Promise((resolve, reject) => {
        const el = document.createElement('script');
        el.src = `js/${name}.js`; el.async = false; el.onload = resolve; el.onerror = () => reject(new Error(name));
        document.body.appendChild(el);
      });
    }
    title.classList.remove('loading');
  } catch (e) {
    title.classList.remove('loading');
    title.querySelectorAll('.row').forEach(el => el.hidden = true);
    const p = title.querySelector('p.keep');
    p.innerHTML = e.message === 'file'
      ? 'Roelof zegt: dit spel heeft een webserver nodig, dubbelklikken werkt niet. Typ <b>npm start</b> en open het adres dat erbij staat.'
      : `Roelof zegt: <b>${String(e.message).replace(/[<&]/g, '')}</b> kon niet geladen worden. Herlaad de pagina, of kijk of de webserver nog draait.`;
    console.error('De escaperoom kon niet starten:', e);
  }
})();
