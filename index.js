// const cron = require('node-cron')

const { Markup, Bot } = require('./src/lib/telegrafBot')
const { channelId, channelLogsId } = require('./src/config')
const { newJob, notFoundJobs } = require('./src/messages')
const processJobs = require('./src/utils/processJobs')

async function sendInfo() {
  const newJobs = await processJobs()

  if (Array.isArray(newJobs)) {
    newJobs.forEach(
      // eslint-disable-next-line space-before-function-paren
      async ({
        linkDetails,
        verified,
        title,
        date,
        business,
        location,
        salary
      }) => {
        const message = newJob({
          verified,
          title,
          date,
          business,
          location,
          salary
        })
        const buttonUrl = Markup.button.url('🔗 Apply now', `${linkDetails}`)

        await Bot.telegram.sendMessage(channelId, message, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[buttonUrl]]
          }
        })
      }
    )

    return null
  }

  Bot.telegram.sendMessage(channelLogsId, notFoundJobs, {
    parse_mode: 'HTML'
  })

  return null
}

// cron.schedule('0 8,14 * * *', () => sendInfo())
// cron.schedule('*/1 * * * *', () => sendInfo())
sendInfo()
