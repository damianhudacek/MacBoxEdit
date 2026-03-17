import * as fs from 'node:fs'
import * as path from 'node:path'

export interface E2Service {
  reference: string // The derived short key (sid:tsid:onid:ns)
  fullReference: string // The reconstructed Enigma2 reference (1:0:1:...)
  name: string
  provider?: string
  type: 'tv' | 'radio'
  frequency?: string
  symbolRate?: string
  polarization?: string
}

export interface E2BouquetService {
  reference: string
  name?: string
}

export interface E2Bouquet {
  filename: string
  name: string
  services: E2BouquetService[] // List of services with optional custom names
  type: 'tv' | 'radio'
}

export interface E2Settings {
  services: Record<string, E2Service>
  bouquets: E2Bouquet[]
}

// Normalize a hex fragment: strips leading zeros, uppercase
function normHex(s: string): string {
  return parseInt(s, 16).toString(16).toUpperCase()
}

// Build a lookup key from the 4 identifying parts of a service reference
function refToKey(ref: string): string | null {
  const parts = ref.split(':')
  if (parts.length < 7) return null
  try {
    const sid  = normHex(parts[3])
    const tsid = normHex(parts[4])
    const onid = normHex(parts[5])
    const ns   = normHex(parts[6])
    return `${sid}:${tsid}:${onid}:${ns}`
  } catch {
    return null
  }
}

// Parse lamedb (v4 or v5) and store services keyed by normalized sid:tsid:onid:ns
export async function parseLamedb(localDir: string): Promise<Record<string, E2Service>> {
  let lamedbPath = path.join(localDir, 'lamedb')
  if (!fs.existsSync(lamedbPath)) {
    lamedbPath = path.join(localDir, 'lamedb5')
  }
  
  const services: Record<string, E2Service> = {}

  if (!fs.existsSync(lamedbPath)) {
    console.error(`[Parser] No lamedb or lamedb5 found in ${localDir}`)
    return services
  }

  // Enigma2 files are sometimes not perfectly UTF-8 (e.g. ISO-8859-1)
  // We read as buffer first to be safe or just use 'latin1' if it fails
  let content = ''
  try {
    content = fs.readFileSync(lamedbPath, 'utf8')
  } catch (e) {
    content = fs.readFileSync(lamedbPath, 'latin1')
  }
  const lines = content.split('\n').map(l => l.trim())

  const transponders: Record<string, { f: string, s: string, p: string }> = {}

  let mode: 'none' | 'transponders' | 'services' = 'none'
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === 'transponders') { mode = 'transponders'; continue }
    if (line === 'services') { mode = 'services'; continue }
    if (line === 'end') { 
      if (mode === 'services') break
      mode = 'none'
      continue 
    }
    if (!line) continue

    if (mode === 'transponders') {
      const parts = line.split(':')
      if (parts.length >= 3) {
        const ns = normHex(parts[0])
        const tsid = normHex(parts[1])
        const onid = normHex(parts[2])
        const key = `${ns}:${tsid}:${onid}`
        
        const dataLine = lines[i + 1]
        if (dataLine && dataLine.startsWith('s')) {
          const d = dataLine.substring(2).split(':')
          // s frequency:symbolrate:polarization:fec:satellite_position:inversion:flags:system:modulation:roll_off:pilot
          const freqMHz = (parseInt(d[0], 10) / 1000).toFixed(0)
          const sr = (parseInt(d[1], 10) / 1000).toFixed(0)
          const pol = d[2] === '0' ? 'H' : d[2] === '1' ? 'V' : d[2] === '2' ? 'L' : 'R'
          transponders[key] = { f: freqMHz, s: sr, p: pol }
        }
        i += 2 // Skip data line and /
      }
    } else if (mode === 'services') {
      const refParts = line.split(':')
      if (refParts.length >= 4) {
        try {
          const sid  = normHex(refParts[0])
          const ns   = normHex(refParts[1])
          const tsid = normHex(refParts[2])
          const onid = normHex(refParts[3])
          const key  = `${sid}:${tsid}:${onid}:${ns}`
          
          const tpKey = `${ns}:${tsid}:${onid}`
          const tp = transponders[tpKey]

          const stype = normHex(refParts[4] || '1')
          const type: 'tv' | 'radio' = stype === '2' ? 'radio' : 'tv'
          const fullReference = `1:0:${stype}:${sid}:${tsid}:${onid}:${ns}:0:0:0:`

          const name = lines[i + 1] || 'Unknown'
          const provLine = lines[i + 2] || ''
          const provider = provLine.startsWith('p:') ? provLine.substring(2).split(',')[0] : undefined

          services[key] = { 
            reference: key, 
            fullReference, 
            name, 
            provider, 
            type,
            frequency: tp?.f,
            symbolRate: tp?.s,
            polarization: tp?.p
          }
          i += 2 
        } catch {}
      }
    }
  }
  return services
}

async function parseBouquetIndex(localDir: string, indexFilename: string, type: 'tv' | 'radio'): Promise<E2Bouquet[]> {
  const indexPath = path.join(localDir, indexFilename)
  const results: E2Bouquet[] = []

  if (!fs.existsSync(indexPath)) return results

  const content = fs.readFileSync(indexPath, 'utf8')
  const lines = content.split('\n').map(l => l.trim())

  for (const line of lines) {
    if (!line.startsWith('#SERVICE')) continue
    const match = line.match(/FROM BOUQUET "(.*?)"/)
    if (!match || !match[1]) continue

    const bqFile = match[1]
    const bqPath = path.join(localDir, bqFile)
    if (!fs.existsSync(bqPath)) continue

    const bqContent = fs.readFileSync(bqPath, 'utf8')
    const bqLines = bqContent.split('\n').map(l => l.trim())
    let name = bqFile
    const services: E2BouquetService[] = []

    for (let j = 0; j < bqLines.length; j++) {
      const bLine = bqLines[j]
      if (bLine.startsWith('#NAME')) {
        name = bLine.substring(6).trim()
      } else if (bLine.startsWith('#SERVICE')) {
        const ref = bLine.substring(9).trim()
        if (ref.startsWith('1:7:')) continue
        if (ref.includes(':http')) continue
        const normalized = ref.endsWith(':') ? ref : ref + ':'
        
        let customName: string | undefined
        // Check next line for #DESCRIPTION
        if (j + 1 < bqLines.length && bqLines[j+1].startsWith('#DESCRIPTION')) {
          customName = bqLines[j+1].substring(12).trim()
          j++ // Skip the description line
        }
        
        services.push({ reference: normalized, name: customName })
      }
    }
    results.push({ filename: bqFile, name, services, type })
  }
  return results
}

export async function parseBouquets(localDir: string): Promise<E2Bouquet[]> {
  const tvBouquets = await parseBouquetIndex(localDir, 'bouquets.tv', 'tv')
  const radioBouquets = await parseBouquetIndex(localDir, 'bouquets.radio', 'radio')
  return [...tvBouquets, ...radioBouquets]
}

export async function saveBouquets(localDir: string, bouquets: E2Bouquet[]): Promise<void> {
  // First, clear any existing local userbouquet files in the temp directory
  // to prevent uploading old/deleted bouquets
  const existingFiles = fs.readdirSync(localDir)
  for (const f of existingFiles) {
    if (f.startsWith('userbouquet.')) {
      try {
        fs.unlinkSync(path.join(localDir, f))
      } catch (e) {
        console.warn(`[Parser] Could not delete local temp file ${f}:`, e)
      }
    }
  }

  const tvIndex: string[] = ['#NAME User bouquets (TV)']
  const radioIndex: string[] = ['#NAME User bouquets (Radio)']

  for (const bq of bouquets) {
    const bqPath = path.join(localDir, bq.filename)
    const lines = [`#NAME ${bq.name}`]
    for (const srv of bq.services) {
      lines.push(`#SERVICE ${srv.reference}`)
      if (srv.name) {
        lines.push(`#DESCRIPTION ${srv.name}`)
      }
    }
    fs.writeFileSync(bqPath, lines.join('\n') + '\n')

    // Add to index files
    const indexLine = `#SERVICE 1:7:1:0:0:0:0:0:0:0:FROM BOUQUET "${bq.filename}" ORDER BY bouquet`
    if (bq.type === 'tv') tvIndex.push(indexLine)
    else radioIndex.push(indexLine)
  }

  // Write index files
  fs.writeFileSync(path.join(localDir, 'bouquets.tv'), tvIndex.join('\n') + '\n')
  fs.writeFileSync(path.join(localDir, 'bouquets.radio'), radioIndex.join('\n') + '\n')
}

export { refToKey }
