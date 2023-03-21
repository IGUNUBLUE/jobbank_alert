const { startScraper, getJobDetails } = require('./scraper')
const {
  connect,
  disconnect,
  models: { Jobs: JobsModel }
} = require('../db/client')
const errorLog = require('./logs/errorLog')

async function processJobs() {
  const newJobs = []

  try {
    const scrapedJobs = await startScraper()

    if (!Array.isArray(scrapedJobs)) {
      throw new Error('Not scraper elements')
    }

    await connect()
    let counter = 1
    for (const scrapedJob of scrapedJobs) {
      console.log(`Processing ${counter} of ${scrapedJobs.length}`)
      const { articleId, position, linkDetails, business, location, salary } =
        scrapedJob
      const found = await JobsModel.findOne({
        articleId: scrapedJob.articleId
      }).exec()

      if (!found) {
        const job = await getJobDetails({
          linkDetails,
          position,
          articleId,
          business,
          location,
          salary
        })

        if (!job) throw new Error(`Could not process this job: ${articleId}`)

        const fullJob = {
          jobBankId: job.jobBankId || 'unknown',
          articleId: job.articleId || 'unknown',
          position: job.position || 'unknown',
          postDate: job.postDate || 'unknown',
          startDate: job.startDate || 'unknown',
          business: job.business || 'unknown',
          location: job.location || 'unknown',
          salary: job.salary || 'unknown',
          employmentType: job.employmentType || 'unknown',
          vacancies: job.vacancies || 'unknown',
          status: job.status || 'unknown',
          advertisedUntilDate: job.advertisedUntilDate || 'unknown',
          linkDetails: job.linkDetails || 'unknown',
          postState: true
        }

        const collection = new JobsModel(fullJob)
        await collection.save()
        newJobs.push(fullJob)
      }

      counter = counter + 1
    }
    await disconnect()

    return newJobs
  } catch (err) {
    errorLog({ err, functionName: 'processJobs' })
    await disconnect()
    return null
  }
}

module.exports = processJobs
