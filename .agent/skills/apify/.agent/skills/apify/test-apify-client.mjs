import { ApifyClient } from 'apify-client'

const client = new ApifyClient({ token: process.env.APIFY_TOKEN })

console.log('Searching for LinkedIn job scraper actors...\n')

// Search actors
const { items } = await client.actors().list({ limit: 50 })

const linkedinActors = items.filter(actor => 
  actor.name?.toLowerCase().includes('linkedin') && 
  actor.name?.toLowerCase().includes('job')
)

console.log(`Found ${linkedinActors.length} LinkedIn job actors:\n`)

linkedinActors.forEach((actor, i) => {
  console.log(`${i + 1}. ${actor.username}/${actor.name}`)
  console.log(`   Title: ${actor.title}`)
  console.log(`   Stats: ${actor.stats?.totalRuns || 0} runs`)
  console.log(`   ID: ${actor.id}\n`)
})
