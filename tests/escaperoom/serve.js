// Een kleine webserver voor de escaperoom, zodat de tests via http:// draaien (nodig voor de service worker).
// Hij serveert de map src/, dus het spel staat op /escaperoom/, net als op albertsmaheert.nl.
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..', 'src');
const port = Number(process.env.PORT) || 4174;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (urlPath === '/' ) { res.writeHead(302, { Location: '/escaperoom/' }); return res.end(); }
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  const file = path.join(root, urlPath);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`Het Geheim van de Albertsmaheert draait op http://127.0.0.1:${port}/escaperoom/`));
