const getStoredToken = () => localStorage.getItem('token');

const toNumber = (typedValue: string | number | undefined) => {
  if (typeof typedValue === 'string') {
    if (/,|./.test(typedValue)) {
      return parseFloat(typedValue.replace(',', '.'));
    }
    return parseInt(typedValue, 10);
  }

  if (Number.isNaN(typedValue) || !Number.isFinite(typedValue)) {
    return undefined;
  }
  return typedValue;
};

export {
  getStoredToken,
  toNumber
};
