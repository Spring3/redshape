const transform = (route, responseBody) => {
  if (route === 'issues.json') {
    const { issues } = responseBody;
    return {
      issues: issues.map((issue) => ({
        id: issue.id,
        project: issue.project,
        tracker: issue.tracker,
        status: issue.status,
        priority: issue.priority,
        author: issue.author,
        assignee: issue.assigned_to,
        subject: issue.subject,
        description: issue.description,
        startDate: issue.start_date,
        dueDate: issue.due_date,
        doneRatio: issue.done_ratio,
        isPrivate: issue.is_private,
        estimatedHours: issue.estimated_hours,
        totalEstimatedHours: issue.total_estimated_hours,
        spentHours: issue.spent_hours,
        totalSpentHours: issue.total_spent_hours,
        createdOn: issue.created_on,
        updatedOn: issue.updated_on,
        closedOn: issue.closed_on
      })),
      total: responseBody.total_count,
      offset: responseBody.offset,
      limit: responseBody.limit
    };
  }

  if (/issues\/\d{1,}\.json/.test(route)) {
    const { issue } = responseBody;
    return {
      id: issue.id,
      project: issue.project,
      tracker: issue.tracker,
      status: issue.status,
      priority: issue.priority,
      author: issue.author,
      assignee: issue.assigned_to,
      subject: issue.subject,
      description: issue.description,
      startDate: issue.start_date,
      dueDate: issue.due_date,
      doneRatio: issue.done_ratio,
      isPrivate: issue.is_private,
      estimatedHours: issue.estimated_hours,
      totalEstimatedHours: issue.total_estimated_hours,
      spentHours: issue.spent_hours,
      totalSpentHours: issue.total_spent_hours,
      createdOn: issue.created_on,
      updatedOn: issue.updated_on,
      subTasks: issue.children,
      customFields: issue.custom_fields || [],
      journals: issue.journals?.map((journal) => ({
        id: journal.id,
        user: journal.user,
        createdOn: journal.created_on,
        notes: journal.notes
      })) || [],
      closedOn: issue.closed_on
    };
  }

  return responseBody;
};

module.exports = {
  transform
};
