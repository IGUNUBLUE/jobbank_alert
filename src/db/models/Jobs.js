const mongoose = require('mongoose')

const eventsSchema = new mongoose.Schema(
  {
    jobBankId: String, //
    articleId: String, //
    position: String, //
    postDate: String, //
    startDate: String, //
    business: String, //
    location: String, //
    salary: String, //
    employmentType: String, //
    vacancies: String, //
    status: String, //
    advertisedUntilDate: String, //
    linkDetails: String, //
    postState: Boolean //
  },
  { collection: 'jobs' },
  { timestamps: true }
)

const EventModel = mongoose.model('Events', eventsSchema)

module.exports = EventModel
