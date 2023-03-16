const fs = require('fs')
const path = require('path')

const startScraper = require('./scraper')

const dbDir = path.join(__dirname, 'db/old_scrapedJobs.json')

async function processJobs() {
  let resultJobs = []

  try {
    const scrapedJobs = await startScraper()

    if (!Array.isArray(scrapedJobs)) {
      throw new Error('Not scraper elements')
    }

    fs.readFile(dbDir, 'utf8', (err, data) => {
      if (err) throw err

      const oldJobs = data ? [...JSON.parse(data)] : []

      if (!oldJobs.length) {
        fs.truncate(dbDir, 0, (err) => {
          if (err) throw err

          fs.writeFile(dbDir, JSON.stringify(scrapedJobs), (err) => {
            if (err) throw err
          })
        })

        resultJobs = scrapedJobs

        return resultJobs
      }

      const newJobs = scrapedJobs.filter(({ id: idScrapedJob }) => {
        return !oldJobs.find(({ id: idOlsJob }) => idScrapedJob === idOlsJob)
      })
      console.log('🚀 ~ file: processJobs.js:41 ~ newJobs ~ newJobs', newJobs)

      fs.truncate(dbDir, 0, (err) => {
        if (err) throw err

        fs.writeFile(dbDir, JSON.stringify([...oldJobs, ...newJobs]), (err) => {
          if (err) throw err
        })
      })

      resultJobs = newJobs
    })

    return resultJobs
  } catch (err) {
    return console.log(err)
  }
}

module.exports = processJobs

processJobs()
