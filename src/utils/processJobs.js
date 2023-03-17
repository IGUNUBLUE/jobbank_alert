const fs = require('fs')
const path = require('path')

// const startScraper = require('./scraper')
const { Bot } = require('../lib/telegrafBot')
const { channelLogsId } = require('../config')
const { errorLog } = require('../messages')
const oldJobs = require('../db/old_scrapedJobs.json')
const dbDir = path.join(__dirname, '..', 'db/old_scrapedJobs.json')
const falseScrapedJobs = require('../db/falseScraped.json')

async function processJobs() {
  try {
    // const scrapedJobs = await startScraper()
    const scrapedJobs = falseScrapedJobs

    if (!Array.isArray(scrapedJobs)) {
      throw new Error('Not scraper elements')
    }

    if (!oldJobs) {
      fs.truncate(dbDir, 0, (err) => {
        if (err) throw err

        fs.writeFile(dbDir, JSON.stringify(scrapedJobs), (err) => {
          if (err) throw err
        })
      })

      return scrapedJobs
    }

    const newJobs = scrapedJobs.filter(({ id: idScrapedJob }) => {
      return !oldJobs.find(({ id: idOlsJob }) => idScrapedJob === idOlsJob)
    })

    fs.truncate(dbDir, 0, (err) => {
      if (err) throw err

      fs.writeFile(dbDir, JSON.stringify([...oldJobs, ...newJobs]), (err) => {
        if (err) throw err
      })
    })

    return newJobs
  } catch (err) {
    Bot.telegram.sendMessage(channelLogsId, errorLog, {
      parse_mode: 'HTML'
    })

    return console.log(err)
  }
}

module.exports = processJobs
