const cron = require('node-cron')
const TelegramBot = require('node-telegram-bot-api')

const processJobs = require('./src/processJobs')

const bot = new TelegramBot('6207808284:AAGz3HRnpeN0OD4tSv6CM8lIHP8tiCNrpPY')
const canalId = '-1001911571641'

function sendInfo(newJobs) {
  if (Array.isArray(newJobs)) {
    newJobs.map((job) => bot.sendMessage(canalId, job, { parse_mode: 'HTML' }))

    return null
  }

  return bot.sendMessage(canalId, 'no new jobs', { parse_mode: 'HTML' })
}

async function findNewJobs() {
  const newJobs = await processJobs()

  sendInfo(newJobs)
}

cron.schedule('0 8,14 * * *', () => findNewJobs())
// cron.schedule('*/1 * * * *', () => findNewJobs())
