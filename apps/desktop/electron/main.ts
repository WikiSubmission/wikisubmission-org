import fs from 'node:fs'
import path from 'node:path'
import { app, BrowserWindow, dialog, Menu, session, shell, type MenuItemConstructorOptions } from 'electron'
import { startSidecar, type Sidecar } from '../host/sidecar.mts'
import { APP_ORIGIN, handleAppProtocol, registerAppScheme } from './app-protocol'
import { LogFile } from './log'
import { resolveAppPaths } from './paths'
import { splashHtml } from './splash'

app.setName('WikiSubmission')
registerAppScheme()

let sidecar: Sidecar | null = null
let mainWindow: BrowserWindow | null = null
let log: LogFile | null = null
let quitting = false

// One instance per user: two would fight over the same database folder.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  })
  app.whenReady().then(start)
}

async function start(): Promise<void> {
  let paths
  try {
    paths = resolveAppPaths()
  } catch (err) {
    dialog.showErrorBox('WikiSubmission', (err as Error).message)
    app.quit()
    return
  }

  log = new LogFile(paths.logDir, 'wikisubmission.log')
  log.info(`starting ${app.getVersion()} (${process.platform}-${process.arch})`)
  hardenSession()
  Menu.setApplicationMenu(buildMenu())

  const splash = new BrowserWindow({
    width: 420,
    height: 260,
    frame: false,
    resizable: false,
    show: true,
    backgroundColor: '#14110E',
    webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, javascript: false },
  })
  void splash.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(splashHtml()))

  try {
    sidecar = await startSidecar({
      binary: paths.sidecarBinary,
      dataDir: paths.dataDir,
      pgArchiveDir: paths.pgArchiveDir,
      snapshotDir: paths.snapshotDir,
      onLog: (line) => log?.write(line),
    })
    log.info(`backend ready on 127.0.0.1:${sidecar.port}`)
  } catch (err) {
    log.info(`backend failed to start: ${(err as Error).message}`)
    splash.destroy()
    await showStartupError(err as Error, log.path)
    app.quit()
    return
  }

  void sidecar.exited.then((code) => {
    if (quitting) return
    log?.info(`backend exited unexpectedly (code ${code})`)
    dialog.showErrorBox(
      'WikiSubmission',
      `The library stopped unexpectedly. Please restart the app.\n\nDetails are in ${log?.path}`,
    )
    app.quit()
  })

  handleAppProtocol(paths.outDir, sidecar)
  mainWindow = createMainWindow()
  mainWindow.once('ready-to-show', () => {
    splash.destroy()
    mainWindow?.show()
  })
  void mainWindow.loadURL(`${APP_ORIGIN}/quran/`)
}

function createMainWindow(): BrowserWindow {
  const state = loadWindowState()
  const win = new BrowserWindow({
    ...state,
    minWidth: 720,
    minHeight: 500,
    show: false,
    title: 'WikiSubmission',
    backgroundColor: '#14110E',
    autoHideMenuBar: true,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      spellcheck: false,
    },
  })
  if (state.maximized) win.maximize()

  const wc = win.webContents

  // Stay on the app. Web links open in the system browser; anything else is
  // dropped.
  wc.on('will-navigate', (event, url) => {
    if (url.startsWith(APP_ORIGIN + '/')) return
    event.preventDefault()
    openExternal(url)
  })
  wc.setWindowOpenHandler(({ url }) => {
    openExternal(url)
    return { action: 'deny' }
  })
  wc.on('will-attach-webview', (event) => event.preventDefault())

  // Mouse back and forward buttons (Windows and Linux).
  win.on('app-command', (_event, command) => {
    if (command === 'browser-backward' && wc.navigationHistory.canGoBack()) wc.navigationHistory.goBack()
    if (command === 'browser-forward' && wc.navigationHistory.canGoForward()) wc.navigationHistory.goForward()
  })

  win.on('close', () => saveWindowState(win))
  win.on('closed', () => {
    mainWindow = null
  })
  return win
}

function openExternal(url: string): void {
  if (/^https?:\/\//i.test(url)) void shell.openExternal(url)
}

/** Deny every device and permission prompt except copying to the clipboard. */
function hardenSession(): void {
  const allowed = new Set(['clipboard-sanitized-write', 'fullscreen'])
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(allowed.has(permission))
  })
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => allowed.has(permission))

  // Backups download as files; offer the Documents folder in the save dialog.
  session.defaultSession.on('will-download', (_event, item) => {
    item.setSaveDialogOptions({
      defaultPath: path.join(app.getPath('documents'), item.getFilename()),
    })
  })
}

function buildMenu(): Menu {
  const isMac = process.platform === 'darwin'
  const template: MenuItemConstructorOptions[] = [
    ...(isMac ? [{ role: 'appMenu' as const }] : []),
    { role: 'editMenu' },
    {
      label: 'Go',
      submenu: [
        {
          label: 'Back',
          accelerator: isMac ? 'Cmd+[' : 'Alt+Left',
          click: () => mainWindow?.webContents.navigationHistory.goBack(),
        },
        {
          label: 'Forward',
          accelerator: isMac ? 'Cmd+]' : 'Alt+Right',
          click: () => mainWindow?.webContents.navigationHistory.goForward(),
        },
        { type: 'separator' },
        { label: 'Quran', accelerator: 'CmdOrCtrl+1', click: () => go('/quran/') },
        { label: 'Index', accelerator: 'CmdOrCtrl+2', click: () => go('/quran/index/') },
        { label: 'Word Lab', accelerator: 'CmdOrCtrl+3', click: () => go('/quran/words/') },
        { label: 'Appendices', accelerator: 'CmdOrCtrl+4', click: () => go('/appendices/') },
        { label: 'Your study', accelerator: 'CmdOrCtrl+5', click: () => go('/me/') },
        { label: 'Settings', accelerator: 'CmdOrCtrl+,', click: () => go('/me/settings/') },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        ...(app.isPackaged ? [] : [{ role: 'toggleDevTools' as const }]),
      ],
    },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [
        {
          label: 'Open log folder',
          click: () => {
            if (log) void shell.openPath(path.dirname(log.path))
          },
        },
      ],
    },
  ]
  return Menu.buildFromTemplate(template)
}

function go(route: string): void {
  void mainWindow?.loadURL(APP_ORIGIN + route)
}

async function showStartupError(err: Error, logPath: string): Promise<void> {
  const { response } = await dialog.showMessageBox({
    type: 'error',
    title: 'WikiSubmission',
    message: 'The Quran library could not be opened.',
    detail: `${err.message}\n\nDetails are in ${logPath}`,
    buttons: ['Open log folder', 'Quit'],
    defaultId: 1,
  })
  if (response === 0) await shell.openPath(path.dirname(logPath))
}

// ── Window size and position across launches ────────────────────────────────

interface WindowState {
  width: number
  height: number
  x?: number
  y?: number
  maximized?: boolean
}

function windowStatePath(): string {
  return path.join(app.getPath('userData'), 'window-state.json')
}

function loadWindowState(): WindowState {
  try {
    const s = JSON.parse(fs.readFileSync(windowStatePath(), 'utf8')) as WindowState
    if (s.width >= 720 && s.height >= 500) return s
  } catch {
    // First launch or unreadable file.
  }
  return { width: 1280, height: 860 }
}

function saveWindowState(win: BrowserWindow): void {
  try {
    const b = win.getNormalBounds()
    const state: WindowState = { ...b, maximized: win.isMaximized() }
    fs.writeFileSync(windowStatePath(), JSON.stringify(state))
  } catch {
    // Not worth failing a quit over.
  }
}

// ── Shutdown ────────────────────────────────────────────────────────────────

app.on('window-all-closed', () => app.quit())

// Stop the backend (and with it Postgres) before exiting. The quit is held
// until it has shut down cleanly.
app.on('before-quit', (event) => {
  if (quitting || !sidecar) return
  quitting = true
  event.preventDefault()
  log?.info('stopping backend')
  void sidecar
    .stop()
    .catch(() => {})
    .finally(async () => {
      log?.info('stopped')
      await log?.close()
      app.quit()
    })
})
