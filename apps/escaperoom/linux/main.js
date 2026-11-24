// Het Geheim van de Albertsmaheert voor Linux (een snap voor de Snap Store en het App Center van Ubuntu). Eén venster
// met het spel erin, net als de Android-app: dezelfde bestanden als op de website (de workflow "Escaperoom: Linux-app" zet
// src/escaperoom in game/, zie docs/escaperoom-apps.md). Geladen vanaf app://albertsmaheert/, zodat het opgeslagen spel
// een vaste plek heeft. Links naar albertsmaheert.nl openen in de gewone browser.
const { app, BrowserWindow, Menu, net, protocol, shell } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

const GAME = path.join(__dirname, 'game');
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }]);

// één venster: de app nog eens starten haalt het open venster naar voren
if (!app.requestSingleInstanceLock()) app.quit();

const external = url => { if (/^https?:\/\//.test(url)) shell.openExternal(url); };

function open() {
  const win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 640, minHeight: 400,
    backgroundColor: '#1e1610', title: 'Het Geheim van de Albertsmaheert', icon: path.join(GAME, 'icons', 'icon-512.png'),
    webPreferences: { contextIsolation: true, sandbox: true }
  });
  win.webContents.setWindowOpenHandler(({ url }) => { external(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('app://')) { e.preventDefault(); external(url); } });
  win.loadURL('app://albertsmaheert/index.html');
  app.on('second-instance', () => { if (win.isMinimized()) win.restore(); win.focus(); });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate([{
    label: 'Albertsmaheert',
    submenu: [
      { role: 'togglefullscreen', label: 'Volledig scherm', accelerator: 'F11' },
      { type: 'separator' },
      { role: 'quit', label: 'Afsluiten', accelerator: 'Control+Q' }
    ]
  }]));
  // app://albertsmaheert/<bestand> geeft de bestanden van het spel, en niets buiten game/
  protocol.handle('app', req => {
    let p = decodeURIComponent(new URL(req.url).pathname);
    if (p === '/' || p === '') p = '/index.html';
    const file = path.normalize(path.join(GAME, p));
    if (!file.startsWith(GAME + path.sep)) return new Response('Niet gevonden', { status: 404 });
    return net.fetch(pathToFileURL(file).toString());
  });
  open();
});
app.on('window-all-closed', () => app.quit());
