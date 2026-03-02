/**
 * LinkedIn Job Search - Vietnam Business Analyst Roles
 *
 * Research: IT BA, System Analyst, Technical BA jobs in Hanoi & Ho Chi Minh City
 * Filters: Mid-level & Senior, Onsite only, Detailed info
 */
import { searchLinkedInJobs } from './actors/social-media/linkedin.js';
async function searchBAJobsInVietnam() {
    console.log('🔍 Starting LinkedIn Job Search...\n');
    const jobTitles = [
        'IT Business Analyst',
        'System Analyst',
        'Technical Business Analyst',
        'Business Analyst IT'
    ];
    const cities = [
        { name: 'Hanoi', query: 'Hanoi, Vietnam' },
        { name: 'Ho Chi Minh City', query: 'Ho Chi Minh City, Vietnam' }
    ];
    const allJobs = [];
    for (const city of cities) {
        console.log(`📍 Searching in ${city.name}...\n`);
        for (const title of jobTitles) {
            console.log(`  🔎 Keyword: "${title}"`);
            try {
                const jobs = await searchLinkedInJobs({
                    keywords: title,
                    location: city.query,
                    maxResults: 30, // Fetch extra to allow filtering
                    datePosted: 'any', // User wants any time
                    experienceLevel: ['Mid-Senior level', 'Entry level'] // Include both for filtering
                });
                console.log(`    ✓ Found ${jobs.length} jobs`);
                // Filter in code - BEFORE returning to model context
                const filtered = jobs.filter(job => {
                    // Filter 1: Mid-level & Senior only (exclude pure Entry level)
                    const isMidOrSenior = job.seniority && (job.seniority.includes('Mid') ||
                        job.seniority.includes('Senior') ||
                        job.seniority.includes('Associate') ||
                        !job.seniority.includes('Entry'));
                    // Filter 2: Onsite only (exclude Remote/Hybrid if mentioned)
                    const isOnsite = !job.employmentType?.toLowerCase().includes('remote') &&
                        !job.description?.toLowerCase().includes('remote') &&
                        !job.description?.toLowerCase().includes('hybrid');
                    // Filter 3: Has description (detailed info)
                    const hasDetails = job.description && job.description.length > 100;
                    return (isMidOrSenior || !job.seniority) && isOnsite && hasDetails;
                });
                console.log(`    ✓ After filtering: ${filtered.length} jobs (Mid/Senior, Onsite, Detailed)\n`);
                allJobs.push(...filtered.map(job => ({
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    postedDate: job.postedDate,
                    jobUrl: job.jobUrl,
                    seniority: job.seniority,
                    employmentType: job.employmentType,
                    salary: job.salary,
                    applicants: job.applicants,
                    description: job.description,
                    industries: job.industries
                })));
            }
            catch (error) {
                console.error(`    ✗ Error searching "${title}": ${error.message}`);
            }
        }
    }
    console.log('\n' + '='.repeat(60));
    console.log(`🎯 Total Jobs Found: ${allJobs.length}`);
    console.log('='.repeat(60) + '\n');
    // Group by city
    const hanoi = allJobs.filter(j => j.location.toLowerCase().includes('hanoi') || j.location.toLowerCase().includes('hà nội'));
    const hcm = allJobs.filter(j => j.location.toLowerCase().includes('ho chi minh') || j.location.toLowerCase().includes('hồ chí minh'));
    console.log(`📊 Distribution:`);
    console.log(`   - Hanoi: ${hanoi.length} jobs`);
    console.log(`   - Ho Chi Minh City: ${hcm.length} jobs\n`);
    // Sort by posted date (most recent first)
    allJobs.sort((a, b) => {
        const dateA = new Date(a.postedDate).getTime();
        const dateB = new Date(b.postedDate).getTime();
        return dateB - dateA;
    });
    // Top jobs by city
    console.log('🏆 Top 10 Most Recent Jobs by City:\n');
    console.log('📍 HANOI:');
    hanoi.slice(0, 10).forEach((job, i) => {
        console.log(`${i + 1}. ${job.title} at ${job.company}`);
        console.log(`   Posted: ${job.postedDate} | ${job.seniority || 'N/A'}`);
        console.log(`   ${job.applicants ? `Applicants: ${job.applicants} | ` : ''}${job.salary || 'Salary not listed'}`);
        console.log(`   URL: ${job.jobUrl}\n`);
    });
    console.log('\n📍 HO CHI MINH CITY:');
    hcm.slice(0, 10).forEach((job, i) => {
        console.log(`${i + 1}. ${job.title} at ${job.company}`);
        console.log(`   Posted: ${job.postedDate} | ${job.seniority || 'N/A'}`);
        console.log(`   ${job.applicants ? `Applicants: ${job.applicants} | ` : ''}${job.salary || 'Salary not listed'}`);
        console.log(`   URL: ${job.jobUrl}\n`);
    });
    // Save full results to JSON
    const fs = await import('fs');
    const outputPath = './linkedin-ba-jobs-vietnam.json';
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
        jobs: allJobs
    }, null, 2));
    console.log(`\n💾 Full results saved to: ${outputPath}`);
    console.log(`\n✅ Research Complete!`);
    return allJobs;
}
// Execute
searchBAJobsInVietnam()
    .then(jobs => {
    console.log(`\n🎉 Successfully researched ${jobs.length} Business Analyst jobs in Vietnam`);
})
    .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});
