const transform = (route, responseBody) => {
  const { user } = responseBody;

  switch (route) {
    case 'users/current.json': {
      const {
        // eslint-disable-next-line camelcase
        login, admin, last_login_on, ...userPayload
      } = user;
      return {
        id: userPayload.id,
        firstName: userPayload.firstname,
        lastName: userPayload.lastname,
        createdOn: userPayload.created_on,
        token: userPayload.api_key
      };
    }
    default:
      return responseBody;
  }
};

module.exports = {
  transform
};
