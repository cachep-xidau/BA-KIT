import { ApifyClient } from 'apify-client'
import fs from 'fs'

const client = new ApifyClient({ token: process.env.APIFY_TOKEN })

console.log('🔍 Scraping ITviec for Business Analyst jobs...\n')

const searches = [
  {
    city: 'Hanoi',
    url: 'https://itviec.com/it-jobs/business-analyst-ha-noi'
  },
  {
    city: 'Ho Chi Minh',
    url: 'https://itviec.com/it-jobs/business-analyst-ho-chi-minh-hcm'
  }
]

const allJobs = []

for (const search of searches) {
  console.log(`📍 Scraping ${search.city}...`)
  console.log(`   URL: ${search.url}\n`)
  
  try {
    const run = await client.actor('apify/web-scraper').call({
      startUrls: [{ url: search.url }],
      linkSelector: 'a.job-details__link, a[href*="/jobs/"]',
      pseudoUrls: [
        {
          purl: 'https://itviec.com/it-jobs/[.*]'
        }
      ],
      pageFunction: async function pageFunction(context) {
        const { request, $, log } = context
        
        // Check if this is a job listing page or detail page
        const isListPage = $('.job').length > 0 || $('.job-card').length > 0
        
        if (isListPage) {
          // Extract from listing page
          const jobs = []
          $('.job, .job-card').each((i, el) => {
            const $job = $(el)
            
            const title = $job.find('.title a, h2 a, .job-title').text().trim()
            const company = $job.find('.company-name, .employer').text().trim()
            const salary = $job.find('.salary, .itviec-salary').text().trim()
            const skills = []
            
            $job.find('.tag, .skill-tag').each((i, tag) => {
              skills.push($(tag).text().trim())
            })
            
            const jobUrl = $job.find('a.job-details__link, h2 a').attr('href')
            
            if (title && company) {
              jobs.push({
                title,
                company,
                salary: salary || null,
                skills: skills.length > 0 ? skills : null,
                url: jobUrl ? `https://itviec.com${jobUrl}` : null
              })
            }
          })
          
          return { type: 'listing', jobs, url: request.url }
        } else {
          // Extract from detail page
          const title = $('h1.job-title, .job-details__title').text().trim()
          const company = $('.company-name, .employer-name').text().trim()
          const location = $('.job-details__location, .job-location').text().trim()
          const salary = $('.salary, .itviec-salary').text().trim()
          
          const description = $('.job-details__description, .job-description').text().trim()
          
          const skills = []
          $('.tag, .skill-tag, .job-skills .tag').each((i, tag) => {
            skills.push($(tag).text().trim())
          })
          
          const benefits = []
          $('.benefit-item, .job-benefits li').each((i, item) => {
            benefits.push($(item).text().trim())
          })
          
          // Extract requirements
          const requirements = $('.job-details__requirements, .job-requirement').text().trim()
          
          return {
            type: 'detail',
            title,
            company,
            location,
            salary: salary || null,
            description: description.substring(0, 1500),
            skills: skills.length > 0 ? skills : null,
            benefits: benefits.length > 0 ? benefits : null,
            requirements: requirements.substring(0, 1000),
            url: request.url
          }
        }
      },
      maxRequestsPerCrawl: 100,
      maxConcurrency: 2
    }, {
      timeout: 300,
      memory: 1024
    })
    
    console.log(`   ⏳ Waiting for scraper...`)
    
    const finalRun = await client.run(run.id).waitForFinish({ waitSecs: 300 })
    
    if (finalRun.status === 'SUCCEEDED') {
      const { items } = await client.dataset(finalRun.defaultDatasetId).listItems()
      
      console.log(`   ✓ Scraped ${items.length} pages`)
      
      // Process results
      items.forEach(item => {
        if (item.type === 'listing' && item.jobs) {
          item.jobs.forEach(job => {
            allJobs.push({ ...job, city: search.city, source: 'itviec' })
          })
        } else if (item.type === 'detail') {
          allJobs.push({ ...item, city: search.city, source: 'itviec' })
        }
      })
      
      console.log(`   ✓ Found ${allJobs.filter(j => j.city === search.city).length} jobs\n`)
    } else {
      console.log(`   ✗ Failed: ${finalRun.status}\n`)
    }
    
  } catch (error) {
    console.log(`   ✗ Error: ${error.message}\n`)
  }
}

console.log(`\n${'='.repeat(70)}`)
console.log(`🎯 ITviec Results: ${allJobs.length} total jobs`)
console.log('='.repeat(70)}`)

// Remove duplicates
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

const hanoi = uniqueJobs.filter(j => j.city === 'Hanoi')
const hcm = uniqueJobs.filter(j => j.city === 'Ho Chi Minh')

console.log(`   - Hanoi: ${hanoi.length}`)
console.log(`   - Ho Chi Minh: ${hcm.length}`)

const withSalary = uniqueJobs.filter(j => j.salary).length
const withSkills = uniqueJobs.filter(j => j.skills && j.skills.length > 0).length
const withDescription = uniqueJobs.filter(j => j.description).length

console.log(`\n📈 Data Quality:`)
console.log(`   - With salary: ${withSalary} (${(withSalary/uniqueJobs.length*100).toFixed(1)}%)`)
console.log(`   - With skills: ${withSkills} (${(withSkills/uniqueJobs.length*100).toFixed(1)}%)`)
console.log(`   - With description: ${withDescription} (${(withDescription/uniqueJobs.length*100).toFixed(1)}%)`)

// Save results
fs.writeFileSync('itviec-jobs.json', JSON.stringify({
  scrapedAt: new Date().toISOString(),
  source: 'itviec',
  total: uniqueJobs.length,
  hanoi: hanoi.length,
  hcm: hcm.length,
  jobs: uniqueJobs
}, null, 2))

console.log(`\n💾 Saved to: itviec-jobs.json`)

// Display sample
console.log(`\n${'='.repeat(70)}`)
console.log('📋 SAMPLE JOBS (Top 15)')
console.log('='.repeat(70) + '\n')

uniqueJobs.slice(0, 15).forEach((job, i) => {
  console.log(`${i + 1}. ${job.title}`)
  console.log(`   🏢 ${job.company}`)
  console.log(`   📍 ${job.city}`)
  
  if (job.salary) {
    console.log(`   💰 ${job.salary}`)
  }
  
  if (job.skills && job.skills.length > 0) {
    console.log(`   🔧 Skills: ${job.skills.slice(0, 5).join(', ')}${job.skills.length > 5 ? '...' : ''}`)
  }
  
  if (job.description) {
    const preview = job.description.substring(0, 150).replace(/\s+/g, ' ')
    console.log(`   📄 ${preview}...`)
  }
  
  if (job.url) {
    console.log(`   🔗 ${job.url}`)
  }
  
  console.log()
})

