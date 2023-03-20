const mongoose = require('mongoose')

const config = require('../config')
const Jobs = require('../db/models/Jobs')
const errorLog = require('../services/logs/errorLog')

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

async function connect() {
  try {
    mongoose.connect(config.dbUrl, options)
    console.log('Connected to MongoDB...')
  } catch (err) {
    errorLog({ err, functionName: 'connect' })
  }
}

async function disconnect() {
  try {
    await mongoose.disconnect(config.dbUrl, options)
    console.log('Disconnected from MongoDB...')
  } catch (err) {
    errorLog({ err, functionName: 'disconnect' })
  }
}

module.exports = {
  connect,
  disconnect,
  models: { Jobs }
}
