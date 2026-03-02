import { ApifyClient } from 'apify-client'
import fs from 'fs'

const client = new ApifyClient({ token: process.env.APIFY_TOKEN })

console.log('🔍 Scraping VietnamWorks for Business Analyst jobs...\n')

const searches = [
  'https://www.vietnamworks.com/it-business-analyst-jobs-i35-en',
  'https://www.vietnamworks.com/system-analyst-jobs-i35-en',
  'https://www.vietnamworks.com/business-analyst-jobs-i35-en'
]

const allJobs = []

for (const url of searches) {
  console.log(`📍 Scraping: ${url}`)

  try {
    const run = await client.actor('apify/web-scraper').call({
      startUrls: [{ url }],
      linkSelector: 'a[href*="/job/"]',
      pageFunction: async function pageFunction(context) {
        const { request, $ } = context

        const jobs = []

        // Try different selectors for job cards
        const jobCards = $('.job-item, .job-card, [class*="job"]').toArray()

        jobCards.forEach(card => {
          const $card = $(card)

          const title = $card.find('h2, .job-title, [class*="title"]').first().text().trim()
          const company = $card.find('.company-name, [class*="company"]').first().text().trim()
          const salary = $card.find('.salary, [class*="salary"]').text().trim()
          const location = $card.find('.location, [class*="location"]').text().trim()

          const skills = []
          $card.find('.skill, .tag, [class*="skill"]').each((i, el) => {
            const skill = $(el).text().trim()
            if (skill) skills.push(skill)
          })

          const jobUrl = $card.find('a').first().attr('href')

          if (title && title.length > 3) {
            jobs.push({
              title,
              company: company || 'Unknown',
              salary: salary || null,
              location: location || null,
              skills: skills.length > 0 ? skills : null,
              url: jobUrl && !jobUrl.startsWith('http') ? `https://www.vietnamworks.com${jobUrl}` : jobUrl
            })
          }
        })

        return { jobs, sourceUrl: request.url }
      },
      maxRequestsPerCrawl: 50,
      maxConcurrency: 1
    }, {
      timeout: 180,
      memory: 1024
    })

    console.log(`   ⏳ Waiting for scraper...`)

    const finalRun = await client.run(run.id).waitForFinish({ waitSecs: 200 })

    if (finalRun.status === 'SUCCEEDED') {
      const { items } = await client.dataset(finalRun.defaultDatasetId).listItems()

      console.log(`   ✓ Scraped ${items.length} pages`)

      let jobCount = 0
      items.forEach(item => {
        if (item.jobs && Array.isArray(item.jobs)) {
          item.jobs.forEach(job => {
            allJobs.push({ ...job, source: 'vietnamworks' })
            jobCount++
          })
        }
      })

      console.log(`   ✓ Found ${jobCount} jobs\n`)
    } else {
      console.log(`   ✗ Failed: ${finalRun.status}\n`)
    }

  } catch (error) {
    console.log(`   ✗ Error: ${error.message}\n`)
  }
}

const sep = '='.repeat(70)
console.log('\n' + sep)
console.log(`🎯 VietnamWorks Results: ${allJobs.length} total jobs`)
console.log(sep)

// Deduplicate
const uniqueJobs = []
const seen = new Set()

allJobs.forEach(job => {
  const key = `${job.title}-${job.company}`.toLowerCase()
  if (!seen.has(key)) {
    seen.add(key)
    uniqueJobs.push(job)
  }
})

console.log(`\n📊 After deduplication: ${uniqueJobs.length} unique jobs`)

const withSalary = uniqueJobs.filter(j => j.salary).length
const withSkills = uniqueJobs.filter(j => j.skills).length
const withLocation = uniqueJobs.filter(j => j.location).length

console.log(`\nData Quality:`)
console.log(`   - With salary: ${withSalary}`)
console.log(`   - With skills: ${withSkills}`)
console.log(`   - With location: ${withLocation}`)

// Save
fs.writeFileSync('vietnamworks-jobs.json', JSON.stringify({
  scrapedAt: new Date().toISOString(),
  source: 'vietnamworks',
  total: uniqueJobs.length,
  jobs: uniqueJobs
}, null, 2))

console.log(`\n💾 Saved to: vietnamworks-jobs.json`)

// Display
console.log(`\n${sep}`)
console.log('📋 SAMPLE JOBS')
console.log(sep + '\n')

uniqueJobs.slice(0, 20).forEach((job, i) => {
  console.log(`${i + 1}. ${job.title}`)
  console.log(`   🏢 ${job.company}`)

  if (job.location) console.log(`   📍 ${job.location}`)
  if (job.salary) console.log(`   💰 ${job.salary}`)
  if (job.skills) console.log(`   🔧 ${job.skills.join(', ')}`)
  if (job.url) console.log(`   🔗 ${job.url}`)

  console.log()
})

console.log(`\n✅ Scraping complete!`)
