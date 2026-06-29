const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const log = require('electron-log')

// ─── Logging setup ───────────────────────────────────────────────────────────
log.transports.file.level = 'info'
autoUpdater.logger = log
autoUpdater.autoDownload = false       // we ask user first
autoUpdater.autoInstallOnAppQuit = true

// ─── Config ──────────────────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV === 'development'
const VERCEL_URL = 'https://ai-agent-sample.vercel.app/'  // ← replace with your Vercel URL

let mainWindow = null
let updateWindow = null

// ─── Main window ─────────────────────────────────────────────────────────────
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'My App',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false, // wait for ready-to-show
  })

  // Dev → local Next.js | Production → Vercel
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : VERCEL_URL)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    if (!isDev) checkForUpdates()
  })

  mainWindow.on('closed', () => { mainWindow = null })
}

// ─── Update notification window ──────────────────────────────────────────────
function createUpdateWindow(info) {
  updateWindow = new BrowserWindow({
    width: 460,
    height: 280,
    resizable: false,
    title: 'Update Available',
    parent: mainWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  updateWindow.loadFile(path.join(__dirname, 'update.html'))

  updateWindow.webContents.once('did-finish-load', () => {
    updateWindow.webContents.send('update-info', {
      version: info.version,
      releaseNotes: info.releaseNotes || 'Bug fixes and improvements.',
    })
  })

  updateWindow.on('closed', () => { updateWindow = null })
}

// ─── Auto updater logic ──────────────────────────────────────────────────────
function checkForUpdates() {
  log.info('Checking for updates...')
  autoUpdater.checkForUpdates().catch(err => {
    log.error('Update check failed:', err)
  })
}
autoUpdater.on('update-available', (info) => {
  log.info('Update found:', info); // Log the entire info object
  log.info('Version found in metadata:', info.version);
  createUpdateWindow(info);
})

autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...')
})

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info.version)
  createUpdateWindow(info)
})

autoUpdater.on('update-not-available', () => {
  log.info('App is up to date.')
})

autoUpdater.on('download-progress', (progress) => {
  const percent = Math.round(progress.percent)
  log.info(`Download progress: ${percent}%`)
  if (updateWindow) {
    updateWindow.webContents.send('download-progress', percent)
  }
  mainWindow?.setProgressBar(progress.percent / 100)
})

autoUpdater.on('update-downloaded', () => {
  log.info('Update downloaded.')
  mainWindow?.setProgressBar(-1)
  if (updateWindow) {
    updateWindow.webContents.send('update-downloaded')
  }
})

autoUpdater.on('error', (err) => {
  log.error('Updater error:', err)
  mainWindow?.setProgressBar(-1)
})

// ─── IPC handlers (from renderer via preload) ────────────────────────────────
ipcMain.on('download-update', () => {
  log.info('User accepted update — downloading...')
  autoUpdater.downloadUpdate()
})

ipcMain.on('install-update', () => {
  log.info('User requested install — quitting and installing...')
  autoUpdater.quitAndInstall()
})

ipcMain.on('skip-update', () => {
  log.info('User skipped update.')
  if (updateWindow) updateWindow.close()
})

ipcMain.on('check-for-updates', () => {
  checkForUpdates()
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.on('open-external', (_, url) => {
  shell.openExternal(url)
})

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
