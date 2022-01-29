const toExternalTimeEntry = (timeEntry) => ({
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
});

const transform = ({ route, method }, responseBody) => {
  if (route === 'time_entries.json') {
    if (method === 'GET') {
      const { time_entries } = responseBody;
      return {
        timeEntries: time_entries.map((timeEntry) => toExternalTimeEntry(timeEntry)),
        total: responseBody.total_count,
        offset: responseBody.offset,
        limit: responseBody.limit
      };
    }

    if (method === 'POST') {
      const { time_entry } = responseBody;
      return {
        timeEntry: toExternalTimeEntry(time_entry)
      };
    }
  }

  if (/time_entries\/\d{1,}\.json/.test(route)) {
    const { time_entry } = responseBody;

    return {
      timeEntry: toExternalTimeEntry(time_entry)
    };
  }

  return responseBody;
};

module.exports = {
  transform
};
