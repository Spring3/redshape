require('./exceptionCatcher')();
const dotenv = require('dotenv');
const crypto = require('crypto');
const fs = require('fs');
const url = require('url');
const path = require('path');
const {
  app, BrowserWindow, Menu, Notification, ipcMain
} = require('electron');
const { autoUpdater } = require('electron-updater');
const electronUtils = require('electron-util');
const isDev = require('electron-is-dev');
const logger = require('electron-log');

const { setupTray } = require('./tray');

const NAME = 'Redshape';

const utils = require('./utils');

app.setAppUserModelId('app.spring3.redshape');
autoUpdater.logger = logger;
autoUpdater.logger.transports.file.level = 'info';

const configFilePath = isDev
  ? path.join(__dirname, '../.env')
  : path.join(app.getPath('userData'), '.env');

const env = dotenv.config({ silent: true, path: configFilePath });

if (env.error || !process.env.ENCRYPTION_KEY) {
  const key = crypto.randomBytes(32).toString('hex');
  fs.appendFileSync(configFilePath, `ENCRYPTION_KEY=${key}`);
  dotenv.config({ silent: true, path: configFilePath });
}

const config = require('../common/config');

const { PORT } = config;
require('../common/request'); // to initialize from storage

let mainWindow;
let aboutWindow;

const installExtensions = () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
  ];

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log);
};

const generateMenu = () => {
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
      if (isDev || process.env.DEV_TOOLS) {
        aboutWindow.webContents.on('did-frame-finish-load', (/* e, isMainFrame, frameProcessId, frameRoutingId */) => {
          aboutWindow.webContents.openDevTools();
        });
      }
    }
  };
  const menu = Menu.buildFromTemplate([
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: NAME,
      submenu: [
        aboutSubmenu,
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
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
    ...(isDev || process.env.DEV_TOOLS
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
          { label: 'Hide in tray', role: 'close' }
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

const initializeMenu = () => {
  generateMenu({});
};

const createAboutWindow = () => {
  const windowConfig = utils.fixIcon({
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
  });

  aboutWindow = new BrowserWindow(windowConfig);

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
  const windowConfig = utils.fixIcon({
    width: 1024,
    height: 768,
    minWidth: 744,
    show: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true
    }
  });

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

  mainWindow = new BrowserWindow(windowConfig);
  mainWindow.loadURL(indexPath);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.on('did-frame-finish-load', (/* e, isMainFrame, frameProcessId, frameRoutingId */) => {
        mainWindow.webContents.openDevTools();
      });
    }
  });

  mainWindow.once('closed', () => {
    mainWindow = null;
  });

  setupTray({
    app, mainWindow, NAME, windowConfig
  });

  ipcMain.on('notify', (ev, { message, critical, keep }) => {
    const notification = new Notification({
      title: 'Redshape Time Tracking',
      body: message || 'Timer will be paused if system continues idle',
      icon: windowConfig.icon,
      timeoutType: keep ? 'never' : 'default',
      urgency: critical ? 'critical' : 'normal',
      silent: false,
    });
    notification.show();
  });
  ipcMain.on('menu', () => {
    generateMenu();
  });
};


app.once('ready', () => {
  if (isDev || process.env.DEV_TOOLS) {
    installExtensions();
  }
  initialize();
  initializeMenu();
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
  const { powerMonitor } = require('electron');
  powerMonitor.on('suspend', () => {
    mainWindow.webContents.send('timer', { action: 'pause' });
  });
  powerMonitor.on('shutdown', () => {
    mainWindow.webContents.send('timer', { action: 'pause' });
  });
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
