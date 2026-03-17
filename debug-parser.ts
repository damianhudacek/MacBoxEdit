import { Client } from 'basic-ftp'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { parseLamedb, parseBouquets, refToKey } from './electron/parser'

async function debugParser() {
  const host = process.argv[2]
  const user = process.argv[3] || 'root'
  const pass = process.argv[4] || ''

  if (!host) {
    console.error('Usage: tsx debug-parser.ts <host> [user] [pass]')
    process.exit(1)
  }

  const localDir = path.join(os.tmpdir(), 'debug_macboxedit')
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true })
  }

  console.log(`Connecting to ${host}...`)
  const client = new Client()
  try {
    await client.access({ host, user, password: pass })
    console.log(`Downloading /etc/enigma2 to ${localDir}...`)
    await client.downloadToDir(localDir, '/etc/enigma2')
    client.close()
  } catch (err) {
    console.error('FTP Error:', err)
    process.exit(1)
  }

  console.log('Parsing lamedb...')
  const services = await parseLamedb(localDir)
  const serviceKeys = Object.keys(services)
  console.log(`Loaded ${serviceKeys.length} services. Samples:`)
  console.log(serviceKeys.slice(0, 3).map(k => `${k} -> ${services[k].name}`))

  console.log('\nParsing bouquets...')
  const bouquets = await parseBouquets(localDir)
  if (bouquets.length > 0) {
    const bq = bouquets[0]
    console.log(`Bouquet: ${bq.name} (${bq.services.length} services)`)
    console.log('Sample refs:')
    bq.services.slice(0, 5).forEach(rawRef => {
      const key = refToKey(rawRef)
      const found = key ? services[key] : undefined
      console.log(`  Raw: ${rawRef}`)
      console.log(`  Key: ${key || 'Invalid'}`)
      console.log(`  Match: ${found ? found.name : 'UNKNOWN SERVICE'}`)
    })
  } else {
    console.log('No bouquets found.')
  }
}

debugParser().catch(console.error)
