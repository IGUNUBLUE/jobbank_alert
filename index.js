const cron = require('node-cron')

const { newJob } = require('./src/messages')
const processJobs = require('./src/services/processJobs')
const errorLog = require('./src/services/logs/errorLog')
const warningLog = require('./src/services/logs/warningLog')
const newJobNotification = require('./src/services/notifications/newJob')
const successLog = require('./src/services/logs/successLog')

async function sendInfo() {
  try {
    const newJobs = await processJobs()

    if (Array.isArray(newJobs)) {
      for (const job of newJobs) {
        const {
          position,
          postDate,
          startDate,
          business,
          location,
          salary,
          employmentType,
          vacancies,
          status,
          advertisedUntilDate,
          linkDetails
        } = job

        const message = newJob({
          position,
          postDate,
          startDate,
          business,
          location,
          salary,
          employmentType,
          vacancies,
          status,
          advertisedUntilDate
        })

        await newJobNotification({ message, linkDetails })
      }

      return successLog()
    }

    warningLog({
      message: '<b>Could not process the jobs</b>',
      functionName: 'sendInfo'
    })

    return null
  } catch (err) {
    errorLog({ err, functionName: 'sendInfo' })
  }
}

cron.schedule('0 8 * * *', () =>
  sendInfo().finally(() => console.log('Finish cron job'))
)
