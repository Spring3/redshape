const {
  Tray, Menu, app, nativeImage
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('electron');

let instance;
let mainWindow;

const quitMenuItem = { role: 'quit' };

function TrayHandler(windowConfig) {
  const statusLabel = app.name;
  let hideWhenClosed = true;
  let appWindowOpen = false;
  let tray;
  let contextMenu;

  const api = {
    setHideWhenClosed: (val) => {
      hideWhenClosed = val;
    },
    willHideWhenClosed: () => hideWhenClosed,
    setAppWindowVisibility: (value) => {
      appWindowOpen = !!value;
    },
    isWindowOpen: () => appWindowOpen,
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
    },
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
