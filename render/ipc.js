import { ipcRenderer } from 'electron';
import store from './store';
import actions from './actions';

let currentTimer;

ipcRenderer.on('settings', (event, { key, value }) => {
  switch (key) {
    case 'ADVANCED_SHOW_ADVANCED_TIMER_CONTROLS':
      store.dispatch(actions.settings.setShowAdvancedTimerControls(value));
      break;
    case 'PROGRESS_PROGRESS_SLIDER':
      store.dispatch(actions.settings.setProgressSlider(value));
      break;
    case 'IDLE_TIME_DISCARD':
      store.dispatch(actions.settings.setIdleTimeDiscard(value));
      break;
    case 'IDLE_BEHAVIOR':
      store.dispatch(actions.settings.setIdleBehavior(value));
      if (currentTimer) {
        currentTimer.resetIntervalIdle();
      }
      break;
  }
});

ipcRenderer.on('window', (event, { action }) => {
  if (!currentTimer) { return; }
  currentTimer.stopIntervalIdleResumer();
  switch (action) {
    case 'show':
      currentTimer.restoreFromTimestamp();
      break;
    case 'hide':
      currentTimer.storeToTimestamp();
      break;
    case 'quit':
      currentTimer.restoreFromTimestamp(false);
      break;
  }
});

ipcRenderer.on('timer', (ev, { action }) => {
  if (!currentTimer) { return; }
  currentTimer.stopIntervalIdleResumer();
  const isTimestamped = currentTimer.isTimestamped(); // if timestamp != null, then mainWindowHidden
  if (isTimestamped) {
    currentTimer.restoreFromTimestamp(false);
  }
  if (action === 'resume') {
    currentTimer.onContinue();
  } else if (action === 'pause') {
    currentTimer.onPause();
  }
  if (isTimestamped) {
    currentTimer.storeToTimestamp();
  }
});

const IPC = {
  setupTimer(timer) {
    currentTimer = timer;
  },
  send(channel, ...args) {
    ipcRenderer.send(channel, ...args);
  }
};

export default IPC;
