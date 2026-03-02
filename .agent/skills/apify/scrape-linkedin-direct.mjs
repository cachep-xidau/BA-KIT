/**
 * Use general web scraper to scrape LinkedIn job listings
 * Free tier compatible
 */
import { ApifyClient } from 'apify-client'
import fs from 'fs'

const client = new ApifyClient({ token: process.env.APIFY_TOKEN })

console.log('🔍 Scraping LinkedIn Jobs via Web Scraper...\n')

// Build LinkedIn job search URLs
const searches = [
  {
    city: 'Hanoi',
    urls: [
      'https://www.linkedin.com/jobs/search/?keywords=Business%20Analyst&location=Hanoi%2C%20Vietnam',
      'https://www.linkedin.com/jobs/search/?keywords=System%20Analyst&location=Hanoi%2C%20Vietnam',
      'https://www.linkedin.com/jobs/search/?keywords=Technical%20Business%20Analyst&location=Hanoi%2C%20Vietnam'
    ]
  },
  {
    city: 'Ho Chi Minh City',
    urls: [
      'https://www.linkedin.com/jobs/search/?keywords=Business%20Analyst&location=Ho%20Chi%20Minh%20City%2C%20Vietnam',
      'https://www.linkedin.com/jobs/search/?keywords=System%20Analyst&location=Ho%20Chi%20Minh%20City%2C%20Vietnam',
      'https://www.linkedin.com/jobs/search/?keywords=Technical%20Business%20Analyst&location=Ho%20Chi%20Minh%20City%2C%20Vietnam'
    ]
  }
]

const allJobs = []

for (const search of searches) {
  console.log(`📍 Scraping ${search.city}...\n`)
  
  for (const url of search.urls) {
    console.log(`  🔗 ${url}`)
    
    try {
      // Use Apify's web scraper
      const run = await client.actor('apify/web-scraper').call({
        startUrls: [{ url }],
        linkSelector: 'a[href*="/jobs/view/"]',
        pageFunction: async function pageFunction(context) {
          const { request, log, jQuery: $ } = context
          
          // Extract job data
          const jobs = []
          
          $('.base-card').each((i, el) => {
            const $el = $(el)
            jobs.push({
              title: $el.find('.base-search-card__title').text().trim(),
              company: $el.find('.base-search-card__subtitle').text().trim(),
              location: $el.find('.job-search-card__location').text().trim(),
              postedDate: $el.find('time').attr('datetime') || $el.find('.job-search-card__listdate').text().trim(),
              url: $el.find('a.base-card__full-link').attr('href')
            })
          })
          
          return { jobs, url: request.url }
        },
        maxRequestsPerCrawl: 5,
        maxConcurrency: 1
      }, {
        timeout: 300,
        memory: 512
      })
      
      console.log(`  ⏳ Waiting for scraper...`)
      
      const finalRun = await client.run(run.id).waitForFinish({ waitSecs: 180 })
      
      if (finalRun.status === 'SUCCEEDED') {
        const { items } = await client.dataset(finalRun.defaultDatasetId).listItems()
        
        items.forEach(item => {
          if (item.jobs && Array.isArray(item.jobs)) {
            allJobs.push(...item.jobs.map(j => ({...j, city: search.city})))
          }
        })
        
        console.log(`  ✓ Scraped successfully\n`)
      } else {
        console.log(`  ✗ Failed: ${finalRun.status}\n`)
      }
      
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}\n`)
    }
  }
}

console.log(`\n${'='.repeat(60)}`)
console.log(`🎯 Total Jobs Scraped: ${allJobs.length}`)
console.log('='.repeat(60) + '\n')

// Filter
const filtered = allJobs.filter(job => 
  job.title && job.company && job.title.length > 0
)

const hanoi = filtered.filter(j => j.city === 'Hanoi')
const hcm = filtered.filter(j => j.city === 'Ho Chi Minh City')

console.log(`📊 Distribution:`)
console.log(`   Hanoi: ${hanoi.length}`)
console.log(`   Ho Chi Minh: ${hcm.length}\n`)

// Display sample
console.log('📋 Sample Jobs:\n')
filtered.slice(0, 20).forEach((job, i) => {
  console.log(`${i + 1}. ${job.title}`)
  console.log(`   ${job.company} - ${job.location}`)
  console.log(`   ${job.postedDate}`)
  console.log(`   ${job.url}\n`)
})

// Save
fs.writeFileSync('linkedin-jobs-vietnam.json', JSON.stringify({
  timestamp: new Date().toISOString(),
  total: filtered.length,
  hanoi: hanoi.length,
  hcm: hcm.length,
  jobs: filtered
}, null, 2))

console.log('💾 Saved to: linkedin-jobs-vietnam.json')
