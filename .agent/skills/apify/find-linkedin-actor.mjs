// Try using the official Apify LinkedIn scraper
import { ApifyClient } from 'apify-client'

const client = new ApifyClient({ token: process.env.APIFY_TOKEN })

console.log('Testing LinkedIn Job Scraper...\n')

// Use a well-known LinkedIn scraper
const actorId = 'bebity/linkedin-jobs-scraper'

try {
  console.log(`Trying actor: ${actorId}`)
  
  const run = await client.actor(actorId).call({
    searches: [{
      keyword: 'Business Analyst',
      location: 'Hanoi, Vietnam',
      count: 10
    }]
  }, {
    timeout: 180
  })
  
  console.log('Run started, waiting...')
  
  const finalRun = await client.run(run.id).waitForFinish({ waitSecs: 180 })
  
  console.log(`Status: ${finalRun.status}`)
  
  if (finalRun.status === 'SUCCEEDED') {
    const { items } = await client.dataset(finalRun.defaultDatasetId).listItems()
    console.log(`\nFound ${items.length} jobs:`)
    items.slice(0, 3).forEach(job => {
      console.log(`- ${job.title} at ${job.company}`)
    })
  }
  
} catch (error) {
  console.error('Error:', error.message)
  console.log('\nTrying alternative search...')
  
  // List popular actors
  const { items } = await client.actors().list({ limit: 200 })
  const linkedin = items.filter(a => 
    a.title?.toLowerCase().includes('linkedin') && 
    a.title?.toLowerCase().includes('job')
  )
  
  console.log(`\nPopular LinkedIn job scrapers (${linkedin.length}):\n`)
  linkedin.slice(0, 5).forEach(a => {
    console.log(`- ${a.username}/${a.name}`)
    console.log(`  ${a.title}`)
    console.log(`  ID: ${a.id}\n`)
  })
}
