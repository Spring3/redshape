const users = require('./users');
const issues = require('./issues');
const projects = require('./projects');
const timeEntries = require('./timeEntries');

const transform = (route, responseBody) => {
  const [entity] = route.split('/')[0].split('.');

  console.log('entity', entity);

  switch (entity) {
    case 'users':
      return users.transform(route, responseBody);
    case 'issues':
      return issues.transform(route, responseBody);
    case 'projects':
      return projects.transform(route, responseBody);
    case 'time_entries':
      return timeEntries.transform(route, responseBody);
    default:
      return responseBody;
  }
};

module.exports = {
  transform
};
