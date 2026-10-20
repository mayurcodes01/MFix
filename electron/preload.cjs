const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('mfix', {
  call: (name, ...args) => ipcRenderer.invoke('mfix', name, ...args),
  open: (url) => ipcRenderer.invoke('open', url),
  glass: (on) => ipcRenderer.invoke('glass', !!on),
  desktop: true,
});
