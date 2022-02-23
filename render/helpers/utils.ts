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

type ToHoursType = { hours?: string, minutes?: string, seconds?: string };
const toHours = ({ hours, minutes, seconds }: ToHoursType = {}) => {
  const hoursInt = parseInt(hours || '0', 10);
  const minutesInt = parseInt(minutes || '0', 10);
  const secondsInt = parseInt(seconds || '0', 10);

  return parseFloat(((hoursInt * 3600 + minutesInt * 60 + secondsInt) / 3600).toFixed(2));
};

export {
  getStoredToken,
  toNumber,
  toHours
};
