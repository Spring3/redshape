const dotenv = require('dotenv');
const crypto = require('crypto');
const fs = require('fs');
const url = require('url');
const path = require('path');
const { app, BrowserWindow, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const electronUtils = require('electron-util');
const isDev = require('electron-is-dev');

const utils = require('./utils');
require('./exceptionCatcher')();

app.setAppUserModelId('app.spring3.redshape');

const configFilePath = isDev
  ? path.join(__dirname, '../.env')
  : path.join(app.getPath('userData'), '.env');

const env = dotenv.load({ silent: true, path: configFilePath });

if (env.error || !process.env.ENCRYPTION_KEY) {
  const key = crypto.randomBytes(32).toString('hex');
  fs.appendFileSync(configFilePath, `ENCRYPTION_KEY=${key}`);
  dotenv.load({ silent: true, path: configFilePath });
}

const { PORT } = require('../common/config');
require('../common/request'); // to initialize from storage

let mainWindow;
let aboutWindow;

const initializeMenu = () => {
  const isMac = process.platform === 'darwin';
  const aboutSubmenu = {
    label: 'About Redshape',
    click: () => {
      if (!aboutWindow || (aboutWindow instanceof BrowserWindow) === false) {
        createAboutWindow();
      } else {
        aboutWindow.focus();
      }
      aboutWindow.show();
      if (isDev) {
        aboutWindow.webContents.openDevTools();
      }
    }
  };
  const menu = Menu.buildFromTemplate([
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: 'Redshape',
      submenu: [
        aboutSubmenu,
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        ...(!isMac ? [aboutSubmenu] : []),
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startspeaking' },
              { role: 'stopspeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    // { role: 'viewMenu' }
    ...(isDev
      ? [{
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forcereload' },
          { role: 'toggledevtools' },
          { type: 'separator' }
        ]
      }]
      : []
    ),
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Report An Issue',
          click: () => electronUtils.openNewGitHubIssue({
            user: 'Spring3',
            repo: 'redshape',
            body: `Please describe the issue as detailed as you can\n\n---\n### Debug Info:\n \`\`\`\n${electronUtils.debugInfo()}\n\`\`\``
          })
        }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);
};

const createAboutWindow = () => {
  const windowConfig = {
    width: 480,
    height: 400,
    minWidth: 480,
    minHeight: 400,
    maxWidth: 600,
    maxHeight: 520,
    useContentSize: true,
    titleBarStyle: 'hidden',
    show: false,
    webPreferences: {
      nodeIntegration: true
    },
  };

  aboutWindow = new BrowserWindow(utils.fixIcon(windowConfig));

  aboutWindow.loadURL(
    isDev
      ? url.format({
        protocol: 'http:',
        host: `localhost:${PORT}`,
        pathname: 'about.html',
        slashes: true
      })
      : url.format({
        protocol: 'file:',
        pathname: path.join(__dirname, '../dist/about.html'),
        slashes: true
      })
  );

  aboutWindow.once('closed', () => {
    aboutWindow = null;
  });

  aboutWindow.setMenu(null);
};

const initialize = () => {
  const windowConfig = {
    width: 1024,
    height: 768,
    minWidth: 744,
    show: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true
    }
  };

  const indexPath = isDev
    ? url.format({
      protocol: 'http:',
      host: `localhost:${PORT}`,
      pathname: 'index.html',
      slashes: true
    })
    : url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, '../dist/index.html'),
      slashes: true
    });

  mainWindow = new BrowserWindow(utils.fixIcon(windowConfig));
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

app.once('ready', () => {
  initialize();
  initializeMenu();
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

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
