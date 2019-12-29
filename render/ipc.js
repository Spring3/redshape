import { ipcRenderer } from 'electron';

let currentTimer;

ipcRenderer.on('window', (event, {action}) => {
  if (!currentTimer){ return; }
  switch(action){
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

ipcRenderer.on('timer', (ev, {action, mainWindowHidden}) => {
  if (!currentTimer){ return; }
  if (mainWindowHidden) {
    currentTimer.restoreFromTimestamp(false);
  }
  if (action === 'resume'){
    currentTimer.onContinue();
  }else if (action === 'pause'){
    currentTimer.onPause();
  }
  if (mainWindowHidden){
    currentTimer.storeToTimestamp();
  }
});

export function setupTimerIPC(timer){
  currentTimer = timer;
}

export function sendTimerIPC(channel, ...args) {
  ipcRenderer.send(channel, ...args);
}
