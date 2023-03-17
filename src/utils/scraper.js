const axios = require('axios')
const cheerio = require('cheerio')

const { Bot } = require('../lib/telegrafBot')
const { channelLogsId } = require('../config')
const { errorLog } = require('../messages')

const allJobs = []

function paginationGenerator(pageNum = 1) {
  return `https://www.jobbank.gc.ca/jobsearch/jobsearch?page=${pageNum}&sort=D&fsrc=32&fskl=101020`
}

function generateDetailsLink(id) {
  return `https://www.jobbank.gc.ca/jobsearch/jobpostingtfw/${id}?source=searchresults`
}

function applyTrim(text) {
  return text.text().trim()
}

function extractText(el) {
  const text = applyTrim(el.contents().filter((_, el) => el.nodeType === 3))

  return text
}

function generateJobs(data) {
  const $ = cheerio.load(data)
  const unprocessedJobs = $('.results-jobs').find("[id*='article-']")

  unprocessedJobs.each((_, job) => {
    const id = $(job).attr('id').split('-')[1]
    const verified = applyTrim(
      $(job).find(
        'a h3 span.noctitle span.job-marker span.verified span.wb-inv'
      )
    )
    const linkDetails = generateDetailsLink(id)
    const title = extractText($(job).find('a h3 span.noctitle'))
    const date = applyTrim($(job).find('a ul li.date'))
    const business = applyTrim($(job).find('a ul li.business'))
    const location = extractText($(job).find('a ul li.location'))
    const salary = extractText($(job).find('a ul li.salary'))
      .split('Salary:')[1]
      .trim()

    allJobs.push({
      id,
      linkDetails,
      verified,
      title,
      date,
      business,
      location,
      salary
    })
  })
}

async function startScraper() {
  console.log('########### scraper process started ###########')
  const missingPages = []
  const axiosConfig = {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    }
  }

  try {
    const firstRes = await axios.get(paginationGenerator(), axiosConfig)

    const $ = cheerio.load(firstRes.data)
    const jobPerPage = $('.results-jobs').find("[id*='article-']").length
    const totalResultsTextJobs = $('.found').text()
    const resultIntText = totalResultsTextJobs.replace(/[,.]/g, '')
    const totalJobs = Number(resultIntText)
    // first page job results
    generateJobs(firstRes.data)

    const totalPages = Math.ceil(totalJobs / jobPerPage)
    // Missing pages by total pages, job result
    if (typeof totalPages === 'number') {
      for (let index = 2; index <= totalPages; index++) {
        console.log(
          `########### ${Math.ceil(
            (index / totalPages) * 100
          )}% of 100% ###########`
        )
        const { data } = await axios.get(
          paginationGenerator(index),
          axiosConfig
        )

        missingPages.push(data)
      }

      missingPages.forEach((data) => {
        generateJobs(data)
      })
    }

    if (allJobs.length === totalJobs) {
      console.log('## all jobs scraped ##')
    } else {
      console.log(`## All processed jobs: ${allJobs.length}`)
      console.log(`## Scraped total result jobs: ${totalJobs}`)
    }

    return allJobs
  } catch (err) {
    console.error(err.message)
    Bot.telegram.sendMessage(channelLogsId, errorLog, {
      parse_mode: 'HTML'
    })

    return null
  }
}

module.exports = startScraper
