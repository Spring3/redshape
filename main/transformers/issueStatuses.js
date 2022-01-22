const transform = ({ route }, responseBody) => {
  if (route === 'issue_statuses.json') {
    const { issue_statuses: issueStatuses } = responseBody;
    return {
      issueStatuses: issueStatuses.map((issueStatus) => ({
        id: issueStatus.id,
        name: issueStatus.name,
        isClosed: issueStatus.is_closed
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
