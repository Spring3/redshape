const users = require('./users');
const issues = require('./issues');
const issueStatuses = require('./issueStatuses');
const projects = require('./projects');
const timeEntries = require('./timeEntries');

const transform = ({ route, method }, responseBody) => {
  const [entity] = route.split('/')[0].split('.');

  console.log('entity', entity);

  switch (entity) {
    case 'users':
      return users.transform({ route, method }, responseBody);
    case 'issues':
      return issues.transform({ route, method }, responseBody);
    case 'issue_statuses':
      return issueStatuses.transform({ route, method }, responseBody);
    case 'projects':
      return projects.transform({ route, method }, responseBody);
    case 'time_entries':
      return timeEntries.transform({ route, method }, responseBody);
    default:
      return responseBody;
  }
};

module.exports = {
  transform
};
