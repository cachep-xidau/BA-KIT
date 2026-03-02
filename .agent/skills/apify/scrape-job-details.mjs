import { ApifyClient } from 'apify-client'
import fs from 'fs'

const client = new ApifyClient({ token: process.env.APIFY_TOKEN })

// Load existing data
const data = JSON.parse(fs.readFileSync('linkedin-jobs-vietnam.json', 'utf8'))

// Get top 30 most recent jobs
const recentJobs = data.jobs
  .filter(j => j.postedDate)
  .sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate))
  .slice(0, 30)

console.log('🔍 Scraping detailed info for top 30 most recent jobs...\n')
console.log(`Selected jobs posted: ${recentJobs[0].postedDate} to ${recentJobs[29].postedDate}\n`)

const detailedJobs = []

for (let i = 0; i < recentJobs.length; i++) {
  const job = recentJobs[i]
  console.log(`${i + 1}/30: ${job.title} @ ${job.company}`)
  console.log(`      URL: ${job.url}`)
  
  try {
    // Scrape job detail page
    const run = await client.actor('apify/web-scraper').call({
      startUrls: [{ url: job.url }],
      pageFunction: async function pageFunction(context) {
        const { $, request } = context
        
        // Extract detailed info
        const description = $('.description__text').text().trim() || 
                           $('.show-more-less-html__markup').text().trim() ||
                           $('.jobs-description__content').text().trim() ||
                           $('.jobs-box__html-content').text().trim() ||
                           $('[class*="description"]').first().text().trim()
        
        // Extract skills
        const skills = []
        $('.job-details-skill-match-status-list__skill').each((i, el) => {
          skills.push($(el).text().trim())
        })
        
        // Extract seniority/level
        const seniority = $('.job-details-jobs-unified-top-card__job-insight').text().trim() ||
                         $('.jobs-unified-top-card__job-insight-text').text().trim()
        
        // Extract salary
        const salary = $('.compensation__salary').text().trim() ||
                      $('[class*="salary"]').text().trim() ||
                      (description.match(/\$[\d,]+ ?- ?\$[\d,]+|USD [\d,]+-[\d,]+|\d+[kK] ?- ?\d+[kK]/gi) || [])[0]
        
        // Extract employment type
        const employmentType = $('.jobs-unified-top-card__workplace-type').text().trim()
        
        return {
          url: request.url,
          description: description.substring(0, 2000), // Limit for token efficiency
          skills: skills.length > 0 ? skills : null,
          seniority: seniority,
          salary: salary || null,
          employmentType: employmentType || null
        }
      },
      maxRequestsPerCrawl: 1,
      maxConcurrency: 1
    }, {
      timeout: 120,
      memory: 512
    })
    
    console.log(`      ⏳ Waiting...`)
    
    const finalRun = await client.run(run.id).waitForFinish({ waitSecs: 120 })
    
    if (finalRun.status === 'SUCCEEDED') {
      const { items } = await client.dataset(finalRun.defaultDatasetId).listItems()
      
      if (items && items.length > 0) {
        const details = items[0]
        
        detailedJobs.push({
          ...job,
          fullDescription: details.description,
          skills: details.skills,
          seniority: details.seniority,
          salary: details.salary,
          employmentType: details.employmentType,
          scrapedAt: new Date().toISOString()
        })
        
        const hasDesc = details.description && details.description.length > 50
        const hasSalary = details.salary ? `💰 ${details.salary}` : '❌ No salary'
        console.log(`      ✓ ${hasDesc ? '✓ Description' : '❌ No desc'} | ${hasSalary}`)
      } else {
        console.log(`      ✗ No data`)
        detailedJobs.push({ ...job, error: 'No data' })
      }
    } else {
      console.log(`      ✗ Failed: ${finalRun.status}`)
      detailedJobs.push({ ...job, error: finalRun.status })
    }
    
    // Delay to avoid rate limiting
    if (i < recentJobs.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
    
  } catch (error) {
    console.log(`      ✗ Error: ${error.message}`)
    detailedJobs.push({ ...job, error: error.message })
  }
  
  console.log()
}

console.log('\n' + '='.repeat(70))
console.log(`✅ Completed: ${detailedJobs.length} jobs scraped`)
console.log('='.repeat(70))

// Count successful scrapes
const successful = detailedJobs.filter(j => j.fullDescription && j.fullDescription.length > 50).length
const withSalary = detailedJobs.filter(j => j.salary).length
const withSkills = detailedJobs.filter(j => j.skills && j.skills.length > 0).length

console.log(`\n📊 Results:`)
console.log(`   - Total scraped: ${detailedJobs.length}`)
console.log(`   - Got full description: ${successful}`)
console.log(`   - Found salary info: ${withSalary}`)
console.log(`   - Found skills: ${withSkills}`)

// Save detailed results
fs.writeFileSync('linkedin-jobs-detailed.json', JSON.stringify({
  scrapedAt: new Date().toISOString(),
  totalJobs: detailedJobs.length,
  successful: successful,
  withSalary: withSalary,
  withSkills: withSkills,
  jobs: detailedJobs
}, null, 2))

console.log(`\n💾 Saved to: linkedin-jobs-detailed.json`)

// Display top jobs with details
console.log(`\n${'='.repeat(70)}`)
console.log('📋 DETAILED JOB PREVIEW (Top 10 with description)')
console.log('='.repeat(70) + '\n')

const jobsWithDesc = detailedJobs.filter(j => j.fullDescription && j.fullDescription.length > 50)

jobsWithDesc.slice(0, 10).forEach((job, i) => {
  console.log(`${i + 1}. ${job.title}`)
  console.log(`   🏢 ${job.company} - ${job.location}`)
  console.log(`   📅 Posted: ${job.postedDate}`)
  
  if (job.salary) {
    console.log(`   💰 Salary: ${job.salary}`)
  }
  
  if (job.seniority) {
    console.log(`   🎯 Level: ${job.seniority}`)
  }
  
  if (job.employmentType) {
    console.log(`   📋 Type: ${job.employmentType}`)
  }
  
  if (job.skills && job.skills.length > 0) {
    console.log(`   🔧 Skills: ${job.skills.slice(0, 5).join(', ')}${job.skills.length > 5 ? ` +${job.skills.length - 5} more` : ''}`)
  }
  
  if (job.fullDescription) {
    const preview = job.fullDescription.substring(0, 300).replace(/\s+/g, ' ').trim()
    console.log(`   📄 ${preview}...`)
  }
  
  console.log(`   🔗 ${job.url}\n`)
})

console.log(`\n🎯 Summary: ${successful} jobs with full details out of ${detailedJobs.length} attempted`)

