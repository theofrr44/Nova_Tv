/* NOVA TV Shell : ouvre NOVA TV en plein écran, sandbox obligatoire.
   Le vrai site (YouTube, etc.) s'affiche dans la même fenêtre. Aucune fenêtre ni programme externe ne peut être lancé. */
const { app, BrowserWindow, session } = require('electron');
const path = require('path'), http = require('http'), fs = require('fs');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };

function serve(cb) { // petit serveur local : les lecteurs intégrés exigent une adresse http
  const root = path.resolve(__dirname, '..');
  http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (p === '/') p = '/index.html';
    const f = path.join(root, p);
    if (!f.startsWith(root) || f.startsWith(__dirname)) { r.writeHead(403); return r.end(); }
    fs.readFile(f, (e, d) => {
      if (e) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(d);
    });
  }).listen(0, '127.0.0.1', function () { cb('http://127.0.0.1:' + this.address().port + '/'); });
}

function start(home) {
  const win = new BrowserWindow({
    fullscreen: true, autoHideMenuBar: true, backgroundColor: '#090C1A',
    webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, preload: path.join(__dirname, 'preload.js') }
  });
  const wc = win.webContents, web = u => /^https?:/i.test(u);
  wc.setWindowOpenHandler(() => ({ action: 'deny' }));                       // pas de nouvelle fenêtre
  ['will-navigate', 'will-redirect'].forEach(ev => wc.on(ev, (e, u) => { if (!web(u)) e.preventDefault(); })); // pas de lien vers une application
  wc.on('before-input-event', (e, i) => { if (i.type === 'keyDown' && (i.key === 'Home' || i.key === 'F1')) { e.preventDefault(); win.loadURL(home); } });
  session.defaultSession.setPermissionRequestHandler((w, perm, cb) => cb(perm === 'fullscreen'));
  win.loadURL(home);
}

app.whenReady().then(() => process.env.NOVA_URL ? start(process.env.NOVA_URL) : serve(start));
app.on('window-all-closed', () => app.quit());
