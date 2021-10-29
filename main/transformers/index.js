const users = require('./users');

const transform = (route, responseBody) => {
  const [entity] = route.split('/');

  switch (entity) {
    case 'users':
      return users.transform(route, responseBody);
    default:
      return responseBody;
  }
};

module.exports = {
  transform
};
