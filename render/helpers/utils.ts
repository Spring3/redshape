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

const toHours = (time = '') => {
  const [hours, minutes, seconds] = time.split(':');
  const hoursInt = parseInt(hours || '0', 10);
  const minutesInt = parseInt(minutes || '0', 10);
  const secondsInt = parseInt(seconds || '0', 10);

  return parseFloat(((hoursInt * 3600 + minutesInt * 60 + secondsInt) / 3600).toFixed(3));
};

const toTimeSpent = (hoursSpent?: number) => {
  if (!hoursSpent) {
    return undefined;
  }

  const hours = Math.floor(parseInt(`${hoursSpent}`, 10));
  const minutesAndSeconds = (hoursSpent % 1) * 60;
  const minutes = Math.floor(parseInt(`${minutesAndSeconds}`, 10));
  const seconds = Math.floor((minutesAndSeconds % 1) * 60);

  const data = {
    hours: hours < 10 ? `0${hours}` : `${hours}`,
    minutes: minutes < 10 ? `0${minutes}` : `${minutes}`,
    seconds: seconds < 10 ? `0${seconds}` : `${seconds}`
  };

  return `${data.hours}:${data.minutes}:${data.seconds}`;
};

export {
  getStoredToken,
  toNumber,
  toHours,
  toTimeSpent
};
