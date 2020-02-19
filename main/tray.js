const {
  Tray, Menu, ipcMain, app, nativeImage
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('electron');
const { truncate } = require('lodash');

let instance;
let mainWindow;

const quitMenuItem = { role: 'quit' };
const sepMenuItem = { type: 'separator' };
const pauseTimerMenuItem = {
  label: 'Pause timer',
  click: () => mainWindow.webContents.send(
    'timer', { action: 'pause', mainWindowHidden: instance.getWindowVisibility() }
  )
};
const resumeTimerMenuItem = {
  label: 'Resume timer',
  click: () => mainWindow.webContents.send(
    'timer', { action: 'resume', mainWindowHidden: instance.getWindowVisibility() }
  )
};

function TrayHandler(windowConfig) {
  let hideWhenClosed = true;
  let appWindowOpen = false;
  let timerEnabled = false;
  let timerPaused = false;
  let timerLabel = '';
  let statusLabel = app.name;
  let tray;
  let contextMenu;

  const update = () => {
    const template = [];
    if (timerEnabled) {
      if (timerPaused) {
        resumeTimerMenuItem.label = timerLabel;
        template.push(resumeTimerMenuItem);
        tray.setImage(windowConfig.iconPause);
      } else {
        pauseTimerMenuItem.label = timerLabel;
        template.push(pauseTimerMenuItem);
        tray.setImage(windowConfig.iconPlay);
      }
      template.push(sepMenuItem);
    } else {
      tray.setImage(windowConfig.iconTray);
    }
    template.push(quitMenuItem);
    contextMenu = Menu.buildFromTemplate(template);
    tray.setContextMenu(contextMenu);
    tray.setToolTip(statusLabel);
  };

  const setupTimerListener = () => {
    ipcMain.on('timer-info', (ev, { isEnabled, isPaused, issue }) => {
      statusLabel = app.name;
      timerEnabled = false;
      if (isEnabled) {
        const trunkatedSubject = truncate(issue.subject, 20);
        timerEnabled = true;
        timerPaused = isPaused;
        timerLabel = `${isPaused ? 'Resume' : 'Pause'} #${issue.id} ${trunkatedSubject}`;
        statusLabel = `#${issue.id} ${trunkatedSubject} (${isPaused ? 'paused' : 'running'})`;
      }
      update();
    });
  };

  const api = {
    setHideWhenClosed: (val) => {
      hideWhenClosed = val;
    },
    willHideWhenClosed: () => hideWhenClosed,
    appWindowVisibilityToggled: () => {
      appWindowOpen = !appWindowOpen;
    },
    getWindowVisibility: () => appWindowOpen,
    setup: () => {
      tray = new Tray(nativeImage.createFromPath(windowConfig.iconTray));
      contextMenu = Menu.buildFromTemplate([quitMenuItem]);
      tray.setContextMenu(contextMenu);
      tray.setToolTip(statusLabel);
      tray.on('click', () => {
        if (!appWindowOpen) {
          mainWindow.show();
        }
      });
      setupTimerListener();
    },
    update
  };

  return api;
}

module.exports = {
  getInstance: (windowConfig, window) => {
    if (!instance) {
      mainWindow = window;
      instance = new TrayHandler(windowConfig);
    }
    return instance;
  }
};
