const RedmineAPI = (redmineDomain) => {
  const json = res => res.json();
  const handleError = msg => error => console.error(msg, error);
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  this.login = async ({ username, password, token }) => {
    if (token) {
      headers['X-Redmine-API-Key'] = token;
      return Promise.resolve();
    }
    const result = await fetch(`${redmineDomain}/login`, {
      method: 'post',
      headers,
      mode: 'no-cors',
      body: {
        username,
        password,
        login: 'Login'
      }
    }).then(json)
      .catch(handleError(`Failed to login to ${redmineDomain}`));
    console.log(result);
    return result;
  };

  this.logout = async () => {
    if (headers['X-Redmine-API-Key']) {
      delete headers['X-Redmine-API-Key'];
      return Promise.resolve();
    }
    const result = await fetch(`${redmineDomain}/logout`, {
      method: 'post',
      headers,
      mode: 'no-cors'
    }).then(res => res.json())
      .catch(handleError(`Failed to log out from ${redmineDomain}`));
    console.log(result);
    return result;
  };
};

let api;

module.exports = {
  initialize: (redmineDomain) => {
    api = new RedmineAPI(redmineDomain);
    return api;
  },
  instance: () => api
};
