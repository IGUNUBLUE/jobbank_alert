module.exports = {
  newJob: ({ verified, title, date, business, location, salary }) => `
<b>Position:</b>  ${title}
<b>Date:</b>  ${date}
<b>Company:</b>  ${business}
<b>Location:</b>  ${location}
<b>Salary:</b>  ${salary}
<b>State:</b>  ${verified || 'No verified'}
`,
  notFoundJobs: '<b>No found new jobs</b>'
}
