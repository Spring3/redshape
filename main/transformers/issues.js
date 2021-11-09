const transform = (route, responseBody) => {
  const { issues } = responseBody;

  switch (route) {
    case 'issues.json': {
      return {
        issues: issues.map((issue) => ({
          id: issue.id,
          project: issue.project,
          tracker: issue.tracker,
          status: issue.status,
          proprity: issue.priority,
          author: issue.author,
          assignee: issue.assigned_to,
          subject: issue.subject,
          description: issue.description,
          startDate: issue.start_date,
          dueDate: issue.due_date,
          doneRatio: issue.done_ratio,
          isPrivate: issue.is_private,
          estimatedHours: issue.estimated_hours,
          createdOn: issue.created_on,
          updatedOn: issue.updated_on,
          closedOn: issue.closed_on
        })),
        total: responseBody.total_count,
        offset: responseBody.offset,
        limit: responseBody.limit
      };
    }
    default:
      return responseBody;
  }
};

module.exports = {
  transform
};
