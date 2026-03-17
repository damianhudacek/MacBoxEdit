import { parseLamedb, parseBouquets, refToKey } from './electron/parser'

async function run() {
  const services = await parseLamedb('/tmp/mock_e2')
  const bouquets = await parseBouquets('/tmp/mock_e2')
  
  console.log('--- LAMEDB MOCK SERVICES ---')
  console.log(services)
  
  const bq = bouquets[0]
  console.log('\n--- FIRST BOUQUET ---')
  console.log(bq)
  
  const ref = bq.services[0]
  const key = refToKey(ref)
  const match = services[key!]
  
  console.log('\n--- MATCHING LOGIC ---')
  console.log('Raw Bouqet Ref:', ref)
  console.log('Derived Key:', key)
  console.log('Match Found:', match ? match.name : 'NO MATCH')
}
run()
