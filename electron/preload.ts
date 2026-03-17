import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})

// Custom API for Enigma2
contextBridge.exposeInMainWorld('enigmaAPI', {
  ftpDownload: (config: any) => ipcRenderer.invoke('ftp-download', config),
  ftpUpload: (config: any, localDir: string) => ipcRenderer.invoke('ftp-upload', { config, localDir }),
  parseLamedb: (localDir: string) => ipcRenderer.invoke('parse-lamedb', localDir),
  parseBouquets: (localDir: string) => ipcRenderer.invoke('parse-bouquets', localDir),
  saveBouquets: (localDir: string, bouquets: any[]) => ipcRenderer.invoke('save-bouquets', { localDir, bouquets }),
  getPicon: (localDir: string, reference: string) => ipcRenderer.invoke('get-picon', { localDir, reference }),
  exportSettings: (localDir: string) => ipcRenderer.invoke('export-settings', localDir),
  importSettings: () => ipcRenderer.invoke('import-settings'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  restartGUI: (config: any) => ipcRenderer.invoke('restart-gui', config),
  reloadServicelist: (config: any) => ipcRenderer.invoke('reload-servicelist', config),
  openNetworkSettings: () => ipcRenderer.invoke('open-network-settings')
})
