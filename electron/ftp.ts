import { Client } from 'basic-ftp'
import * as fs from 'node:fs'
import * as path from 'node:path'

export interface FtpConfig {
  host: string
  user?: string
  password?: string
  port?: number
  downloadPicons?: boolean
}

// Generates a directory for downloaded settings
export function getSettingsDir(basePath: string) {
  const settingsDir = path.join(basePath, 'temp_settings')
  if (!fs.existsSync(settingsDir)) {
    fs.mkdirSync(settingsDir, { recursive: true })
  }
  return settingsDir
}

export async function downloadSettings(config: FtpConfig & { userDataPath: string }): Promise<{ success: boolean; path?: string; error?: string }> {
  const client = new Client()
  // client.ftp.verbose = true
  const localDir = getSettingsDir(config.userDataPath)

  try {
    await client.access({
      host: config.host,
      user: config.user || 'root',
      password: config.password || '',
      port: config.port || 21,
      secure: false,
    })

    // Download /etc/enigma2
    await client.downloadToDir(localDir, '/etc/enigma2')
    
    // Attempt to download picons if requested
    if (config.downloadPicons) {
      const piconPaths = [
        '/usr/share/enigma2/picon',
        '/media/hdd/picon',
        '/media/usb/picon',
        '/picon'
      ]
      
      const localPiconDir = path.join(localDir, 'picon')
      if (!fs.existsSync(localPiconDir)) {
        fs.mkdirSync(localPiconDir, { recursive: true })
      }

      // Try finding the first valid picon directory that has files
      for (const remotePicon of piconPaths) {
        try {
          const list = await client.list(remotePicon)
          if (list.length > 0) {
            console.log(`[FTP] Found picons at ${remotePicon}, downloading...`)
            await client.downloadToDir(localPiconDir, remotePicon)
            break // Stop searching once we found and downloaded them
          }
        } catch (e) {
          // Path doesn't exist or no permission, try next
        }
      }
    } else {
      // If not downloading picons, ensure the local picon directory is cleared 
      // so we don't show old icons
      const localPiconDir = path.join(localDir, 'picon')
      if (fs.existsSync(localPiconDir)) {
        console.log('[FTP] Clearing local picon directory...')
        fs.rmSync(localPiconDir, { recursive: true, force: true })
      }
    }

    client.close()
    return { success: true, path: localDir }
  } catch (err: any) {
    console.error('[FTP] Error during download:', err)
    client.close()
    // Return more detailed error
    let message = err.message || 'Unknown error'
    if (err.code === 'ECONNREFUSED') message = 'Connection refused (Check IP and Port)'
    if (err.code === 'ETIMEDOUT') message = 'Connection timed out (Check network)'
    if (err.code === 'ENOTFOUND') message = 'Host not found (Check IP address)'
    return { success: false, error: `${message} (${err.code || 'No Code'})` }
  }
}

export async function uploadSettings(config: FtpConfig, localDir: string): Promise<{ success: boolean; error?: string }> {
  const client = new Client()
  try {
    await client.access({
      host: config.host,
      user: config.user || 'root',
      password: config.password || '',
      port: config.port || 21,
      secure: false,
    })

    // List remote userbouquets and delete orphaned ones
    // This ensures that if a user deletes a bouquet in the app, it's also gone from the receiver
    console.log('[FTP] Syncing bouquets...')
    const remoteFiles = await client.list('/etc/enigma2')
    // FileType.File is 1 in basic-ftp
    const remoteBouquets = remoteFiles
      .filter(f => f.type === 1 && f.name.startsWith('userbouquet.'))
      .map(f => f.name)

    const localFiles = fs.readdirSync(localDir)
    const localBouquets = localFiles.filter(f => f.startsWith('userbouquet.'))
    
    console.log(`[FTP] Local bouquets: ${localBouquets.join(', ')}`)
    console.log(`[FTP] Remote bouquets found: ${remoteBouquets.join(', ')}`)

    for (const rb of remoteBouquets) {
      if (!localBouquets.includes(rb)) {
        console.log(`[FTP] DELETING orphaned remote bouquet: ${rb}`)
        try {
          await client.remove(`/etc/enigma2/${rb}`)
        } catch (e) {
          console.warn(`[FTP] Could not delete ${rb}:`, e)
        }
      }
    }

    // Upload files back to /etc/enigma2
    await client.uploadFromDir(localDir, '/etc/enigma2')
    
    client.close()
    return { success: true }
  } catch (err: any) {
    client.close()
    return { success: false, error: err.message }
  }
}
