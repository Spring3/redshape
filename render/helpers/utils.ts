const getStoredToken = () => {
  const token = localStorage.getItem('token');

  if (!token || token === 'undefined') {
    return undefined;
  }

  return token;
};

export {
  getStoredToken
};
