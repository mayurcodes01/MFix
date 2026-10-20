const { app, BrowserWindow, ipcMain, shell, screen } = require('electron');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const fs = require('fs');

const root = app.isPackaged ? process.resourcesPath : path.join(__dirname, '..');
const backend = path.join(root, 'backend', 'mfix_backend.py');
// Installed builds ship a bundled backend exe, so users do not need Python. Dev mode falls back to Python.
const exe = path.join(root, 'backend', 'mfix_backend.exe');
const bundled = fs.existsSync(exe);
const pythons = [process.env.MFIX_PYTHON, 'python', 'py'].filter(Boolean);

function callBackend(args) {
  return new Promise((resolve) => {
    if (bundled) {
      return execFile(exe, args, { windowsHide: true, maxBuffer: 1 << 26 }, (err, out) => {
        try { resolve(JSON.parse(out)); } catch { resolve({ ok: false, error: err ? err.message : 'The backend returned no data.' }); }
      });
    }
    const attempt = (i) => {
      if (i >= pythons.length) return resolve({ ok: false, error: 'Python was not found. Install Python 3 and add it to PATH.' });
      execFile(pythons[i], [backend, ...args], { windowsHide: true, maxBuffer: 1 << 26 }, (err, out) => {
        if (err && err.code === 'ENOENT') return attempt(i + 1);
        try { resolve(JSON.parse(out)); } catch { resolve({ ok: false, error: err ? err.message : 'The backend returned no data.' }); }
      });
    };
    attempt(0);
  });
}

const api = {
  boot: () => ['boot'],
  run: (id) => ['run', String(id)],
  snapCreate: (label) => ['snap_create', String(label || '').slice(0, 60)],
  snapDiff: (a, b) => ['snap_diff', String(a), String(b)],
  snapDelete: (id) => ['snap_delete', String(id)],
  set: (k, v) => ['set', String(k), String(v)],
};
ipcMain.handle('mfix', (_e, name, ...args) => (api[name] ? callBackend(api[name](...args)) : { ok: false, error: 'Unknown call.' }));
ipcMain.handle('open', (_e, url) => {
  if (/^https:\/\/(github\.com|www\.linkedin\.com)\//.test(url)) shell.openExternal(url);
});

const icon = path.join(__dirname, '..', 'build', 'icon.png');
// Acrylic (see-through frosted window) needs Windows 11 22H2 or newer. Older systems keep the in-app gradient.
const canGlass = process.platform === 'win32' && parseInt(os.release().split('.')[2] || '0', 10) >= 22621;
const SPLASH_MS = 3000;
let main = null;

ipcMain.handle('glass', (_e, on) => {
  if (!canGlass || !main || main.isDestroyed()) return false;
  main.setBackgroundMaterial(on ? 'acrylic' : 'none');
  return true;
});

function load(win, hash) {
  if (process.env.MFIX_DEV) win.loadURL('http://localhost:5173/' + (hash ? '#' + hash : ''));
  else win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), hash ? { hash } : undefined);
}

function createMain() {
  main = new BrowserWindow({
    width: 1280, height: 820, minWidth: 1000, minHeight: 640, show: false,
    backgroundColor: canGlass ? '#00000000' : '#0a0a1f',
    ...(canGlass ? { backgroundMaterial: 'acrylic' } : {}),
    titleBarStyle: 'hidden', titleBarOverlay: { color: '#00000000', symbolColor: '#ffffff', height: 40 },
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false },
  });
  main.setMenuBarVisibility(false);
  fs.existsSync(icon) && main.setIcon(icon);
  load(main, '');
  return main;
}

// Full screen welcome window that covers the whole display for 3 seconds, then hands over to the app.
function createSplash() {
  const { bounds } = screen.getPrimaryDisplay();
  const sp = new BrowserWindow({
    x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height,
    frame: false, resizable: false, movable: false, skipTaskbar: true, alwaysOnTop: true, fullscreenable: false,
    backgroundColor: '#0a0a1f', show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false },
  });
  sp.once('ready-to-show', () => sp.show());
  load(sp, 'splash');
  return sp;
}

app.setAppUserModelId('com.mayur.mfix');
app.whenReady().then(() => {
  const sp = createSplash();
  const win = createMain();
  const started = Date.now();
  let ready = false;
  win.webContents.once('did-finish-load', () => { ready = true; });
  const finish = () => {
    if (!ready && Date.now() - started < 8000) return setTimeout(finish, 150);
    win.show(); win.focus();
    if (!sp.isDestroyed()) sp.close();
  };
  setTimeout(finish, SPLASH_MS);
});
app.on('window-all-closed', () => app.quit());
