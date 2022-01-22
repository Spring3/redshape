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

  if (/projects\/\w{1,}\/versions\.json/.test(route)) {
    const { versions } = responseBody;
    return {
      versions: versions.map((version) => ({
        id: version.id,
        project: version.project,
        name: version.name,
        description: version.description,
        status: version.status,
        dueDate: version.due_date,
        sharing: version.sharing,
        createdOn: version.created_on,
        updatedOn: version.updated_on,
        wikiPageTitle: version.wiki_page_title
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
