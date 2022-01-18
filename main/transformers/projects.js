const transform = ({ route }, responseBody) => {
  if (route === 'projects.json') {
    const { projects } = responseBody;
    return {
      projects: projects.map((project) => ({
        id: project.id,
        name: project.name,
        identifier: project.identifier,
        description: project.description,
        status: project.status,
        isPublic: project.isPublic,
        inheritMembers: project.inheritMembers,
        timeEntryActivities: project.time_entry_activities,
        createdOn: project.created_on,
        updatedOn: project.updated_on
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
