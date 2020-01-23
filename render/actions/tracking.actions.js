export const TRACKING_START = 'TRACKING_START';
export const TRACKING_STOP = 'TRACKING_STOP';
export const TRACKING_PAUSE = 'TRACKING_PAUSE';
export const TRACKING_CONTINUE = 'TRACKING_CONTINUE';
export const TRACKING_SAVE = 'TRACKING_SAVE';
export const TRACKING_RESET = 'TRACKING_RESET';

const trackingStart = issue => ({ type: TRACKING_START, data: { issue } });
const trackingStop = (duration, comments) => ({ type: TRACKING_STOP, data: { duration, comments } });
const trackingPause = (duration, comments) => ({ type: TRACKING_PAUSE, data: { duration, comments } });
const trackingContinue = (duration, comments) => ({ type: TRACKING_CONTINUE, data: { duration, comments } });
const trackingSave = (duration, comments) => ({ type: TRACKING_SAVE, data: { duration, comments } });
const trackingReset = () => ({ type: TRACKING_RESET });

export default {
  trackingStart,
  trackingStop,
  trackingPause,
  trackingContinue,
  trackingSave,
  trackingReset
};
