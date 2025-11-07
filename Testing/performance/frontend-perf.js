/**
 * Frontend Performance Testing with Lighthouse CI
 *
 * Script to run Lighthouse audits on all frontend applications
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Applications to test
const apps = [
  { name: 'web-cleaning', url: 'http://localhost:5174', port: 5174 },
  { name: 'web-maintenance', url: 'http://localhost:5175', port: 5175 },
  { name: 'web-customer', url: 'http://localhost:5176', port: 5176 },
  { name: 'web-worker', url: 'http://localhost:5178', port: 5178 },
  { name: 'guest-tablet', url: 'http://localhost:5179', port: 5179 },
]

// Pages to test for each app
const pagesMap = {
  'web-cleaning': ['/login', '/dashboard', '/cleaning-jobs', '/properties', '/customers'],
  'web-maintenance': ['/login', '/dashboard', '/maintenance-jobs', '/contractors'],
  'web-customer': ['/login', '/dashboard', '/properties', '/issues'],
  'web-worker': ['/login', '/dashboard', '/today', '/schedule'],
  'guest-tablet': ['/'],
}

// Performance thresholds
const thresholds = {
  performance: 0.9,      // 90%
  accessibility: 0.9,    // 90%
  'best-practices': 0.9, // 90%
  seo: 0.9,              // 90%
  pwa: 0.7,              // 70%
}

// Results directory
const resultsDir = path.join(__dirname, 'reports')
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true })
}

/**
 * Run Lighthouse audit for a specific URL
 */
function runLighthouse(app, page, url) {
  console.log(`\nRunning Lighthouse for ${app} - ${page}...`)

  const outputPath = path.join(resultsDir, `${app}${page.replace(/\//g, '-')}.json`)

  try {
    const command = `lighthouse ${url} \
      --output=json \
      --output-path="${outputPath}" \
      --chrome-flags="--headless --no-sandbox" \
      --quiet`

    execSync(command, { stdio: 'inherit' })

    // Read and parse results
    const results = JSON.parse(fs.readFileSync(outputPath, 'utf8'))

    return {
      app,
      page,
      url,
      scores: {
        performance: results.categories.performance.score,
        accessibility: results.categories.accessibility.score,
        bestPractices: results.categories['best-practices'].score,
        seo: results.categories.seo.score,
        pwa: results.categories.pwa ? results.categories.pwa.score : null,
      },
      metrics: {
        fcp: results.audits['first-contentful-paint'].numericValue,
        lcp: results.audits['largest-contentful-paint'].numericValue,
        tti: results.audits['interactive'].numericValue,
        tbt: results.audits['total-blocking-time'].numericValue,
        cls: results.audits['cumulative-layout-shift'].numericValue,
        speedIndex: results.audits['speed-index'].numericValue,
      },
    }
  } catch (error) {
    console.error(`Error running Lighthouse for ${app} - ${page}:`, error.message)
    return null
  }
}

/**
 * Check if scores meet thresholds
 */
function checkThresholds(result) {
  const failures = []

  Object.keys(thresholds).forEach((category) => {
    const score = result.scores[category] || result.scores[category.replace('-', '')]
    if (score !== null && score < thresholds[category]) {
      failures.push({
        category,
        threshold: thresholds[category],
        actual: score,
      })
    }
  })

  return failures
}

/**
 * Generate summary report
 */
function generateSummary(results) {
  console.log('\n' + '='.repeat(80))
  console.log('PERFORMANCE TEST SUMMARY')
  console.log('='.repeat(80))

  let totalFailures = 0

  results.forEach((result) => {
    if (!result) return

    console.log(`\n${result.app} - ${result.page} (${result.url})`)
    console.log('-'.repeat(80))

    console.log('Scores:')
    Object.keys(result.scores).forEach((category) => {
      const score = result.scores[category]
      if (score !== null) {
        const percentage = (score * 100).toFixed(0)
        const threshold = thresholds[category] || thresholds[category.replace(/([A-Z])/g, '-$1').toLowerCase()]
        const pass = threshold ? score >= threshold : true
        const status = pass ? '✓' : '✗'
        console.log(`  ${status} ${category}: ${percentage}%`)
      }
    })

    console.log('\nMetrics:')
    console.log(`  First Contentful Paint: ${result.metrics.fcp.toFixed(0)}ms`)
    console.log(`  Largest Contentful Paint: ${result.metrics.lcp.toFixed(0)}ms`)
    console.log(`  Time to Interactive: ${result.metrics.tti.toFixed(0)}ms`)
    console.log(`  Total Blocking Time: ${result.metrics.tbt.toFixed(0)}ms`)
    console.log(`  Cumulative Layout Shift: ${result.metrics.cls.toFixed(3)}`)
    console.log(`  Speed Index: ${result.metrics.speedIndex.toFixed(0)}`)

    const failures = checkThresholds(result)
    if (failures.length > 0) {
      console.log('\n❌ Threshold failures:')
      failures.forEach((failure) => {
        console.log(`  ${failure.category}: ${(failure.actual * 100).toFixed(0)}% (threshold: ${(failure.threshold * 100).toFixed(0)}%)`)
      })
      totalFailures += failures.length
    }
  })

  console.log('\n' + '='.repeat(80))
  console.log(`Total audits: ${results.filter(r => r !== null).length}`)
  console.log(`Threshold failures: ${totalFailures}`)
  console.log('='.repeat(80) + '\n')

  return totalFailures
}

/**
 * Main execution
 */
async function main() {
  console.log('Starting frontend performance tests...')

  const allResults = []

  // Run Lighthouse for each app and page
  for (const app of apps) {
    const pages = pagesMap[app.name] || ['/']

    for (const page of pages) {
      const url = `${app.url}${page}`
      const result = runLighthouse(app.name, page, url)
      if (result) {
        allResults.push(result)
      }
    }
  }

  // Generate summary
  const totalFailures = generateSummary(allResults)

  // Save summary to file
  const summaryPath = path.join(resultsDir, 'summary.json')
  fs.writeFileSync(summaryPath, JSON.stringify(allResults, null, 2))
  console.log(`\nSummary saved to: ${summaryPath}`)

  // Exit with error code if there are failures
  process.exit(totalFailures > 0 ? 1 : 0)
}

// Run main function
main().catch((error) => {
  console.error('Error running performance tests:', error)
  process.exit(1)
})
