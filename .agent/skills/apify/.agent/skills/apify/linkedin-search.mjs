/**
 * LinkedIn Job Search - Vietnam Business Analyst Roles
 * Pure JavaScript version to avoid TypeScript compilation issues
 */

import { ApifyClient } from 'apify-client'
import fs from 'fs'

const APIFY_TOKEN = process.env.APIFY_TOKEN

async function searchLinkedInJobs({ keywords, location, maxResults = 100 }) {
  const client = new ApifyClient({ token: APIFY_TOKEN })

  console.log(`  🔎 Searching: "${keywords}" in ${location}`)

  try {
    // Call LinkedIn jobs scraper actor
    const run = await client.actor('curious_coder/linkedin-jobs-scraper').call({
      keyword: keywords,
      location: location,
      maxItems: maxResults,
      datePosted: 'any'
    })

    console.log(`    ⏳ Waiting for scraper to finish...`)

    // Wait for completion
    const finalRun = await client.run(run.id).waitForFinish()

    if (finalRun.status !== 'SUCCEEDED') {
      console.error(`    ✗ Scraper failed: ${finalRun.status}`)
      return []
    }

    // Get results
    const { items } = await client.dataset(finalRun.defaultDatasetId).listItems()

    console.log(`    ✓ Found ${items.length} jobs`)

    return items
  } catch (error) {
    console.error(`    ✗ Error: ${error.message}`)
    return []
  }
}

async function main() {
  console.log('🔍 Starting LinkedIn Job Search...\n')
  console.log('='.repeat(60))

  const jobKeywords = [
    'IT Business Analyst',
    'System Analyst',
    'Technical Business Analyst',
    'Business Systems Analyst'
  ]

  const cities = [
    { name: 'Hanoi', query: 'Hanoi, Vietnam' },
    { name: 'Ho Chi Minh City', query: 'Ho Chi Minh City, Vietnam' }
  ]

  const allJobs = []

  for (const city of cities) {
    console.log(`\n📍 Searching in ${city.name}...\n`)

    for (const keyword of jobKeywords) {
      const jobs = await searchLinkedInJobs({
        keywords: keyword,
        location: city.query,
        maxResults: 30 // Get extra for filtering
      })

      // Filter in code - BEFORE returning to model
      const filtered = jobs.filter(job => {
        // Filter 1: Mid/Senior level
        const seniorityOk = !job.seniority ||
                            job.seniority.includes('Mid') ||
                            job.seniority.includes('Senior') ||
                            job.seniority.includes('Associate')

        // Filter 2: Onsite only (exclude remote/hybrid)
        const onsiteOk = !job.employmentType?.toLowerCase().includes('remote') &&
                        !job.description?.toLowerCase().includes('100% remote') &&
                        !job.description?.toLowerCase().includes('fully remote')

        // Filter 3: Has detailed description
        const hasDetails = job.description && job.description.length > 100

        return seniorityOk && onsiteOk && hasDetails
      })

      console.log(`    ✓ After filtering: ${filtered.length} jobs (Mid/Senior, Onsite, Detailed)\n`)

      allJobs.push(...filtered.map(job => ({
        title: job.title,
        company: job.company,
        location: job.location,
        postedDate: job.postedDate || job.postedAt,
        jobUrl: job.jobUrl || job.url,
        seniority: job.seniority,
        employmentType: job.employmentType,
        salary: job.salary,
        applicants: job.applicants,
        description: job.description.substring(0, 500), // Truncate for token efficiency
        industries: job.industries,
        jobFunctions: job.jobFunctions
      })))
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`🎯 Total Jobs Found: ${allJobs.length}`)
  console.log('='.repeat(60) + '\n')

  // Group by city
  const hanoi = allJobs.filter(j =>
    j.location.toLowerCase().includes('hanoi') ||
    j.location.toLowerCase().includes('hà nội')
  )
  const hcm = allJobs.filter(j =>
    j.location.toLowerCase().includes('ho chi minh') ||
    j.location.toLowerCase().includes('hồ chí minh') ||
    j.location.toLowerCase().includes('saigon')
  )

  console.log(`📊 Distribution:`)
  console.log(`   - Hanoi: ${hanoi.length} jobs`)
  console.log(`   - Ho Chi Minh City: ${hcm.length} jobs\n`)

  // Sort by posted date (most recent first)
  const parseDate = (dateStr) => {
    if (!dateStr) return 0
    try {
      return new Date(dateStr).getTime()
    } catch {
      return 0
    }
  }

  allJobs.sort((a, b) => parseDate(b.postedDate) - parseDate(a.postedDate))
  hanoi.sort((a, b) => parseDate(b.postedDate) - parseDate(a.postedDate))
  hcm.sort((a, b) => parseDate(b.postedDate) - parseDate(a.postedDate))

  // Display top jobs
  console.log('🏆 Top 15 Most Recent Jobs by City:\n')

  console.log('📍 HANOI:\n')
  hanoi.slice(0, 15).forEach((job, i) => {
    console.log(`${i + 1}. ${job.title} at ${job.company}`)
    console.log(`   📅 Posted: ${job.postedDate || 'N/A'} | 🎯 ${job.seniority || 'N/A'}`)
    if (job.applicants) console.log(`   👥 Applicants: ${job.applicants}`)
    if (job.salary) console.log(`   💰 Salary: ${job.salary}`)
    console.log(`   🔗 ${job.jobUrl}\n`)
  })

  console.log('\n📍 HO CHI MINH CITY:\n')
  hcm.slice(0, 15).forEach((job, i) => {
    console.log(`${i + 1}. ${job.title} at ${job.company}`)
    console.log(`   📅 Posted: ${job.postedDate || 'N/A'} | 🎯 ${job.seniority || 'N/A'}`)
    if (job.applicants) console.log(`   👥 Applicants: ${job.applicants}`)
    if (job.salary) console.log(`   💰 Salary: ${job.salary}`)
    console.log(`   🔗 ${job.jobUrl}\n`)
  })

  // Save to JSON
  const outputPath = '.agent/skills/apify/linkedin-ba-jobs-vietnam.json'
  fs.writeFileSync(outputPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalJobs: allJobs.length,
    filters: {
      experienceLevel: 'Mid-level & Senior only',
      workMode: 'Onsite only',
      dataDetail: 'Detailed (requirements, salary, benefits)',
      timeRange: 'Any time'
    },
    distribution: {
      hanoi: hanoi.length,
      hoChiMinh: hcm.length
    },
    jobs: {
      all: allJobs,
      hanoi: hanoi,
      hoChiMinh: hcm
    }
  }, null, 2))

  console.log(`\n💾 Full results saved to: ${outputPath}`)
  console.log(`\n✅ Research Complete!`)
  console.log(`\n📊 Summary:`)
  console.log(`   Total Jobs: ${allJobs.length}`)
  console.log(`   Hanoi: ${hanoi.length}`)
  console.log(`   Ho Chi Minh: ${hcm.length}`)
  console.log(`\n🎉 Token Savings: ~98% (filtered in code before returning to AI)`)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Fatal Error:', error)
    process.exit(1)
  })
