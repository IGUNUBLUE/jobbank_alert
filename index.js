const axios = require('axios')
const cheerio = require('cheerio')

const allJobs = []

function paginationGenerator(pageNum = 1) {
  return `https://www.jobbank.gc.ca/jobsearch/jobsearch?page=${pageNum}&sort=D&fsrc=32&fskl=101020`
}

function generateDetailsLink(id) {
  return `https://www.jobbank.gc.ca/jobsearch/jobpostingtfw/${
    id.split('-')[1]
  }?source=searchresults`
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
    const verified = applyTrim(
      $(job).find(
        'a h3 span.noctitle span.job-marker span.verified span.wb-inv'
      )
    )
    const linkDetails = generateDetailsLink($(job).attr('id'))
    const title = extractText($(job).find('a h3 span.noctitle'))
    const date = applyTrim($(job).find('a ul li.date'))
    const business = applyTrim($(job).find('a ul li.business'))
    const location = extractText($(job).find('a ul li.location'))
    const salary = extractText($(job).find('a ul li.salary'))
      .split('Salary:')[1]
      .trim()

    allJobs.push({
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

async function start() {
  console.log('########### scraper process started ###########')
  const missingPages = []

  try {
    const firstRes = await axios.get(paginationGenerator(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      }
    })

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
        const { data } = await axios.get(paginationGenerator(index), {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
          }
        })

        missingPages.push(data)
      }

      missingPages.forEach((data) => {
        generateJobs(data)
      })
    }

    allJobs.forEach((job) => {
      console.log(job)
    })

    if (allJobs.length === totalJobs) {
      console.log('## all jobs scraped ##')
    } else {
      console.log(`## All processed jobs: ${allJobs.length}`)
      console.log(`## Scraped total result jobs: ${totalJobs}`)
    }
  } catch (err) {
    return console.error(err)
  }
}

start()