const transform = (route, responseBody) => {
  const { user } = responseBody;

  switch (route) {
    case 'users/current.json':
      const {
        login, admin, api_key, ...userPayload
      } = user;
      return userPayload;
    default:
      return responseBody;
  }
};

module.exports = {
  transform
};
