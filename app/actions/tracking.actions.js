export const TRACKING_START = 'TRACKING_START';
export const TRACKING_STOP = 'TRACKING_STOP';
export const TRACKING_PAUSE = 'TRACKING_PAUSE';
export const TRACKING_CONTINUE = 'TRACKING_CONTINUE';

const trackingStart = issue => ({ type: TRACKING_START, data: { issue } });
const trackingStop = duration => ({ type: TRACKING_STOP, data: { duration } });
const trackingPause = duration => ({ type: TRACKING_PAUSE, data: { duration } });
const trackingContinue = () => ({ type: TRACKING_CONTINUE });

export default {
  trackingStart,
  trackingStop,
  trackingPause,
  trackingContinue
};
