const transform = (route, responseBody) => {
  if (route === 'time_entries.json') {
    const { time_entries } = responseBody;
    return {
      timeEntries: time_entries.map((timeEntry) => ({
        id: timeEntry.id,
        project: timeEntry.project,
        issue: timeEntry.issue,
        user: timeEntry.user,
        activity: timeEntry.activity,
        hours: timeEntry.hours,
        comments: timeEntry.comments,
        spentOn: timeEntry.spent_on,
        createdOn: timeEntry.created_on,
        updatedOn: timeEntry.updated_on,
      })),
      total: responseBody.total_count,
      offset: responseBody.offset,
      limit: responseBody.limit
    };
  }

  return responseBody;
};

module.exports = {
  transform
};
