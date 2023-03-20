const axios = require('axios')
const cheerio = require('cheerio')

const errorLog = require('./logs/errorLog')
const warningLog = require('./logs/warningLog')

const axiosConfig = {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
  }
}

function createLinkPage({ page }) {
  return `https://www.jobbank.gc.ca/jobsearch/jobsearch?page=${page}&sort=D&fsrc=32&fskl=101020`
}

function createArticules({ pagesData }) {
  const articules = []

  pagesData.forEach((data) => {
    const $ = cheerio.load(data)
    const unprocessedJobs = $('.results-jobs').find("[id*='article-']")

    unprocessedJobs.each((_, job) => {
      const articleId = $(job).attr('id').split('-')[1]
      const position = $(job)
        .find('a ul li.location')
        .contents()
        .filter((_, el) => el.nodeType === 3)
        .text()
        .trim()
      const linkDetails = `https://www.jobbank.gc.ca/jobsearch/jobpostingtfw/${articleId}?source=searchresults`
      const business = $(job).find('a ul li.business').text().trim()

      articules.push({
        articleId,
        position,
        business,
        linkDetails
      })
    })
  })

  return articules
}

async function getMissingPages({ totalPages, firstPage }) {
  try {
    const allData = []

    allData.push(firstPage)
    // generate new array from page 2, the value of each item is the number page
    const missingPages = Array.from(
      { length: totalPages - 1 },
      (_, index) => index + 2
    )

    for (const page of missingPages) {
      console.log(
        `Data page process ${Math.ceil((page / totalPages) * 100)}% of 100%`
      )
      const { data } = await axios.get(createLinkPage({ page }), axiosConfig)

      allData.push(data)
    }

    return allData
  } catch (err) {
    errorLog({ err, functionName: 'getMissingPages' })

    return null
  }
}

async function getJobDetails({ articleId, position, linkDetails, business }) {
  try {
    const jobDetails = {}
    const { data } = await axios.get(linkDetails, axiosConfig)
    const $ = cheerio.load(data)

    jobDetails.postDate = $('.date-business')
      .find('span.date')
      .text()
      .trim()
      .split('Posted on ')[1]
    jobDetails.advertisedUntilDate = $('#applynow')
      .find('p')
      .contents()
      .filter((_, el) => el.nodeType === 3)
      .text()
      .trim()

    $('ul.job-posting-brief')
      .children()
      .each((i, el) => {
        const text = $(el)
          .text()
          .replaceAll(/[\t\n]/g, '')
          .trim()
          .toLowerCase()

        if (text.includes('location')) {
          jobDetails.location = text.split('location')[1]
        }
        if (text.includes('salary')) {
          jobDetails.salary = text.split('salary')[1]
        }
        if (text.includes('terms of employment')) {
          jobDetails.employmentType = text.split('terms of employment')[1]
        }
        if (text.includes('start date')) {
          jobDetails.startDate = text.split('start date')[1]
        }
        if (text.includes('vacancies')) {
          jobDetails.vacancies = text.split('vacancies')[1]
        }
        if (text.includes('verified')) {
          jobDetails.status = 'Verified'
        }
        if (text.includes('job bank')) {
          jobDetails.jobBankId = text.split('#')[1]
        }
      })

    jobDetails.position = position
    jobDetails.articleId = articleId
    jobDetails.linkDetails = linkDetails
    jobDetails.business = business

    return jobDetails
  } catch (err) {
    errorLog({ err, functionName: 'getJobDetails' })

    return null
  }
}

async function startScraper() {
  console.log('########### scraper process started ###########')

  try {
    const { data } = await axios.get(createLinkPage({ page: 1 }), axiosConfig)
    const $ = cheerio.load(data)
    const jobPerPage = $('.results-jobs').find("[id*='article-']").length
    const totalResultsTextJobs = $('.found').text()
    const resultIntText = totalResultsTextJobs.replace(/[,.]/g, '')
    const totalJobs = Number(resultIntText)
    const totalPages = Math.ceil(totalJobs / jobPerPage)

    if (typeof totalPages === 'number') {
      const pagesData = await getMissingPages({ totalPages, firstPage: data })

      if (!pagesData) throw new Error('Get page data failed')
      // all articules from all pages (id and job link)
      const articules = createArticules({ pagesData })

      if (articules.length) {
        console.log(`## all jobs scraped: ${articules.length} ##`)

        return articules
      }

      console.log('## Articules creation failed ##')

      return null
    }

    warningLog({
      message: 'Could not get all results',
      functionName: 'startScraper'
    })

    return null
  } catch (err) {
    errorLog({ err, functionName: 'startScraper' })

    return null
  }
}

module.exports = { startScraper, getJobDetails }
