const dotenv = require('dotenv');
const crypto = require('crypto');
const fs = require('fs');
const url = require('url');
const path = require('path').posix;
const { app, BrowserWindow, ipcMain, session } = require('electron');

dotenv.load({ silent: true });

if (!process.env.ENCRYPTION_KEY) {
  const key = crypto.randomBytes(32).toString('hex');
  fs.appendFileSync(path.resolve(__dirname, './.env'), `ENCRYPTION_KEY=${key}`);
  dotenv.load({ silent: true });
}
const { PORT, redmineDomain } = require('./common/config');

let mainWindow;
const isDev = !!(process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath));

const initialize = () => {
  const windowConfig = {
    width: 1024,
    height: 768,
    show: false,
    webPreferences: {
      webSecurity: false // to disable cors
    }
  };

  let indexPath;
  if (isDev && process.argv.indexOf('--noDevServer') === -1) {
    indexPath = url.format({
      protocol: 'http:',
      host: `localhost:${PORT}`,
      pathname: 'index.html',
      slashes: true
    });
  } else {
    windowConfig.webPreferences.nodeIntegration = false;
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.resolve(__dirname, 'dist', 'index.html'),
      slashes: true
    });
  }
  mainWindow = new BrowserWindow(windowConfig);
  mainWindow.loadURL(indexPath);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.once('closed', () => {
    mainWindow = null;
  });
};

if (redmineDomain) {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [`script-src 'self' ${redmineDomain}`]
      }
    });
  });
}

app.once('ready', initialize);
app.once('quit', () => ipcMain.removeAllListeners('action'));
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    initialize();
  }
});
