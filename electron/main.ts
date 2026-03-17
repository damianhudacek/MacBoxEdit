import { app, BrowserWindow, ipcMain, dialog, nativeTheme, shell, Menu } from 'electron'

process.title = 'MacBoxEdit'
import path from 'node:path'
import fs from 'node:fs'

app.name = 'MacBoxEdit'
app.setName('MacBoxEdit')

if (process.platform === 'darwin') {
  app.on('will-finish-launching', () => {
    app.setName('MacBoxEdit')
  })
}

// The built directory structure
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    title: 'MacBoxEdit',
    icon: path.join(process.env.VITE_PUBLIC || '', 'icon.png'),
    width: 1200,
    height: 800,
    titleBarStyle: 'hiddenInset', // Mac-like title bar
    vibrancy: 'under-window', // Better Apple Silicon frosted glass effect for whole app
    visualEffectState: 'active', // Keeps vibrancy running actively
    backgroundColor: '#00000000', // Truly transparent to let OS handle dark/light
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST || '', 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Force Electron to follow system theme continuously
nativeTheme.themeSource = 'system'

import { autoUpdater } from 'electron-updater'

// ... existing code ...

app.whenReady().then(() => {
  createWindow()
  
  // Check for updates
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify()
  }

  if (process.platform === 'darwin') {
    const template: any[] = [
      {
        label: 'MacBoxEdit',
        submenu: [
          { role: 'about', label: 'O MacBoxEdit' },
          { type: 'separator' },
          { role: 'services', label: 'Služby' },
          { type: 'separator' },
          { role: 'hide', label: 'Skryť MacBoxEdit' },
          { role: 'hideOthers', label: 'Skryť ostatné' },
          { role: 'unhide', label: 'Zobraziť všetko' },
          { type: 'separator' },
          { role: 'quit', label: 'Ukončiť MacBoxEdit' }
        ]
      },
      {
        label: 'Úpravy',
        submenu: [
          { role: 'undo', label: 'Späť' },
          { role: 'redo', label: 'Znova' },
          { type: 'separator' },
          { role: 'cut', label: 'Vystrihnúť' },
          { role: 'copy', label: 'Kopírovať' },
          { role: 'paste', label: 'Prilepiť' },
          { role: 'selectAll', label: 'Vybrať všetko' }
        ]
      },
      {
        label: 'Okno',
        submenu: [
          { role: 'minimize', label: 'Minimalizovať' },
          { role: 'zoom', label: 'Zväčšiť' },
          { type: 'separator' },
          { role: 'front', label: 'Presunúť všetko do popredia' }
        ]
      }
    ]
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }
})

import { downloadSettings, uploadSettings } from './ftp'
import { parseLamedb, parseBouquets, saveBouquets } from './parser'

// FTP Handler Setup
ipcMain.handle('ftp-download', async (_event, config) => {
  return await downloadSettings({ ...config, userDataPath: app.getPath('userData') })
})

ipcMain.handle('ftp-upload', async (_event, { config, localDir }) => {
  return await uploadSettings(config, localDir)
})

ipcMain.handle('parse-lamedb', async (_event, localDir: string) => {
  return await parseLamedb(localDir)
})

ipcMain.handle('parse-bouquets', async (_event, localDir: string) => {
  return await parseBouquets(localDir)
})

ipcMain.handle('save-bouquets', async (_event, { localDir, bouquets }) => {
  return await saveBouquets(localDir, bouquets)
})

// Picon support: serves a local image as base64 data URI
ipcMain.handle('get-picon', async (_event, { localDir, reference }) => {
  if (!localDir || !reference) return null
  try {
    // Standard Enigma2 reference format uses colons: "1:0:19:1E15:C82:3:EB0000:0:0:0:"
    // Picon file format uses underscores: "1_0_19_1E15_C82_3_EB0000_0_0_0.png"
    const baseName = reference.replace(/:/g, '_').replace(/_$/, '')
    
    const piconDir = path.join(localDir, 'picon')
    if (!fs.existsSync(piconDir)) return null

    // Try multiple variations: exact, uppercase, lowercase
    const variations = [
      baseName + '.png',
      baseName.toUpperCase() + '.png',
      baseName.toLowerCase() + '.png'
    ]

    for (const fileName of variations) {
      const piconPath = path.join(piconDir, fileName)
      if (fs.existsSync(piconPath)) {
        const data = fs.readFileSync(piconPath)
        const base64 = data.toString('base64')
        return `data:image/png;base64,${base64}`
      }
    }
  } catch (err) {
    console.error('[Main] get-picon error:', err)
  }
  return null
})

ipcMain.handle('export-settings', async (_event, localDir: string) => {
  if (!win || !localDir) return { success: false, error: 'No active session.' }
  
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Select Folder to Save Settings',
    properties: ['openDirectory', 'createDirectory']
  })

  if (canceled || filePaths.length === 0) {
    return { success: false, canceled: true }
  }

  const targetDir = filePaths[0]
  try {
    fs.cpSync(localDir, targetDir, { recursive: true })
    return { success: true, path: targetDir }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('import-settings', async (_event) => {
  if (!win) return { success: false, error: 'No active session.' }
  
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Select Folder with Enigma2 Settings',
    properties: ['openDirectory']
  })

  if (canceled || filePaths.length === 0) {
    return { success: false, canceled: true }
  }

  const sourceDir = filePaths[0]
  // We can do a quick check if it looks like a valid Enigma2 folder
  const hasLamedb = fs.existsSync(path.join(sourceDir, 'lamedb')) || fs.existsSync(path.join(sourceDir, 'lamedb5'))
  if (!hasLamedb) {
    return { success: false, error: 'Directory does not contain a valid lamedb or lamedb5 file.' }
  }

  return { success: true, path: sourceDir }
})

ipcMain.handle('open-external', async (_event, url: string) => {
  if (url) {
    await shell.openExternal(url)
  }
})

ipcMain.handle('restart-gui', async (_event, config) => {
  const { host, port = 80 } = config
  try {
    // OpenWebif powerstate 3 = GUI Restart
    const url = `http://${host}:${port}/web/powerstate?newstate=3`
    console.log(`[Main] Restarting GUI at ${url}`)
    const response = await fetch(url)
    return { success: response.ok }
  } catch (err: any) {
    console.error('[Main] Restart GUI failed:', err)
    return { success: false, error: err.message }
  }
})

ipcMain.handle('reload-servicelist', async (_event, config) => {
  const { host, port = 80 } = config
  try {
    // Mode 0 = Reload everything (lamedb + bouquets)
    const url = `http://${host}:${port}/web/servicelistreload?mode=0`
    console.log(`[Main] Reloading servicelist at ${url}`)
    const response = await fetch(url)
    return { success: response.ok }
  } catch (err: any) {
    console.error('[Main] Reload servicelist failed:', err)
    return { success: false, error: err.message }
  }
})

ipcMain.handle('open-network-settings', async () => {
  // Opens the Privacy & Security preferences
  await shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_LocalNetwork')
})
