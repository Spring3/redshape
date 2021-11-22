const users = require('./users');
const issues = require('./issues');
const projects = require('./projects');

const transform = (route, responseBody) => {
  const [entity] = route.split('/');

  switch (entity) {
    case 'users':
      return users.transform(route, responseBody);
    case 'issues.json':
      return issues.transform(route, responseBody);
    case 'projects.json':
      return projects.transform(route, responseBody);
    default:
      return responseBody;
  }
};

module.exports = {
  transform
};
