module.exports = {
  newJob: ({
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
  }) => `
<b>Position:</b>  ${position}
<b>Post on:</b>  ${postDate}
<b>Business:</b>  ${business}
<b>Location:</b>  ${location}
<b>Salary:</b>  ${salary}
<b>Status:</b>  ${status || 'No verified'}
<b>Vacancies:</b>  ${vacancies}
<b>Contract type:</b>  ${employmentType}
<b>Start date:</b>  ${startDate}
<b>Advertised until:</b>  ${advertisedUntilDate}
`
}
