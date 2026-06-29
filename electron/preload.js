const { contextBridge, ipcRenderer } = require('electron')

// Expose safe APIs to renderer (update.html)
contextBridge.exposeInMainWorld('electronAPI', {
  // Update actions
  downloadUpdate: () => ipcRenderer.send('download-update'),
  installUpdate: () => ipcRenderer.send('install-update'),
  skipUpdate: () => ipcRenderer.send('skip-update'),
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),

  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  openExternal: (url) => ipcRenderer.send('open-external', url),

  // Listen for events from main process
  onUpdateInfo: (cb) => ipcRenderer.on('update-info', (_, data) => cb(data)),
  onDownloadProgress: (cb) => ipcRenderer.on('download-progress', (_, percent) => cb(percent)),
  onUpdateDownloaded: (cb) => ipcRenderer.on('update-downloaded', () => cb()),
})
