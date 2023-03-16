const cron = require('node-cron')
const { Telegraf } = require('telegraf')

const processJobs = require('./src/processJobs')

const bot = new Telegraf('6207808284:AAGz3HRnpeN0OD4tSv6CM8lIHP8tiCNrpPY')
const canalId = '@foreigncanadajobbackwithlmia'

async function sendInfo(newJobs) {
  if (Array.isArray(newJobs)) {
    newJobs.forEach(
      ({ linkDetails, verified, title, date, business, location, salary }) => {
        const msg = `
        <b>${title}</b>
        <i>${date}</i>
        <i>${business}</i>
        <i>${location}</i>
        <i>${salary}</i>
        <i>${verified}</i>
        a href=${linkDetails}>Job details</a>
        `

        bot.telegram.sendMessage(canalId, msg, { parse_mode: 'HTML' })
      }
    )

    return null
  }

  await bot.telegram.sendMessage(canalId, 'no new jobs', { parse_mode: 'HTML' })
}

async function findNewJobs() {
  const newJobs = await processJobs()

  sendInfo(newJobs)
}

// cron.schedule('0 8,14 * * *', () => findNewJobs())
bot.launch()
cron.schedule('*/10 * * * *', () => findNewJobs())
