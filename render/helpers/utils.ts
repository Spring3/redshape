import moment from "moment";

const getStoredToken = () => localStorage.getItem('token');

const timeSpentToHours = (time = '') => {
  const [hours, minutes, seconds] = time.split(':');
  const hoursInt = parseInt(hours || '0', 10);
  const minutesInt = parseInt(minutes || '0', 10);
  const secondsInt = parseInt(seconds || '0', 10);

  return parseFloat(((hoursInt * 3600 + minutesInt * 60 + secondsInt) / 3600).toFixed(3));
};

const hoursToTimeSpent = (hoursSpent?: number) => {
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

const toTimerFormat = (time: number) => moment.utc(time).format('HH:mm:ss');

export {
  getStoredToken,
  timeSpentToHours,
  hoursToTimeSpent,
  toTimerFormat
};
