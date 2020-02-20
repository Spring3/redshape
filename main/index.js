const dotenv = require('dotenv');
const crypto = require('crypto');
const fs = require('fs');
const url = require('url');
const path = require('path');
const {
  app, BrowserWindow, Menu, Notification, ipcMain
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('electron');
const { autoUpdater } = require('electron-updater');
const electronUtils = require('electron-util');
const isDev = require('electron-is-dev');
const logger = require('electron-log');

const Tray = require('./tray');

const utils = require('./utils');
require('./exceptionCatcher')();

app.setAppUserModelId('app.spring3.redshape');
autoUpdater.logger = logger;
autoUpdater.logger.transports.file.level = 'info';


let mainWindow;
let aboutWindow;
let PORT;

const updateSettings = ({
  idleBehavior, discardIdleTime, advancedTimerControls, progressWithStep1
}, settings) => {
  const settingsCopy = { ...settings };
  if (idleBehavior >= 0) {
    settingsCopy.idleBehavior = idleBehavior;
    mainWindow.webContents.send('settings', { key: 'IDLE_BEHAVIOR', value: idleBehavior });
  }
  if (discardIdleTime != null) {
    settingsCopy.discardIdleTime = discardIdleTime;
    mainWindow.webContents.send('settings', { key: 'IDLE_TIME_DISCARD', value: discardIdleTime });
  }
  if (advancedTimerControls != null) {
    settingsCopy.advancedTimerControls = advancedTimerControls;
    mainWindow.webContents.send('settings', { key: 'ADVANCED_TIMER_CONTROLS', value: advancedTimerControls });
  }
  if (progressWithStep1 != null) {
    settingsCopy.progressWithStep1 = progressWithStep1;
    mainWindow.webContents.send('settings', { key: 'PROGRESS_SLIDER_STEP_1', value: progressWithStep1 });
  }
  generateMenu({ settings: settingsCopy });
};

const generateMenu = (config = {}) => {
  const { settings } = config;
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
      label: app.name,
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
          { label: 'Hide in tray', role: 'close' }
        ])
      ]
    },
    ...(settings ? [
      {
        label: 'Settings',
        submenu: [
          {
            label: 'Idle behavior',
            submenu: [
              {
                label: 'Do nothing',
                type: 'radio',
                checked: !settings.idleBehavior,
                click: () => updateSettings({ idleBehavior: 0 }, settings)
              },
              {
                label: 'Pause if idle for 5m',
                type: 'radio',
                checked: settings.idleBehavior === 5,
                click: () => updateSettings({ idleBehavior: 5 }, settings)
              },
              {
                label: 'Pause if idle for 10m',
                type: 'radio',
                checked: settings.idleBehavior === 10,
                click: () => updateSettings({ idleBehavior: 10 }, settings)
              },
              {
                label: 'Pause if idle for 15m',
                type: 'radio',
                checked: settings.idleBehavior === 15,
                click: () => updateSettings({ idleBehavior: 15 }, settings)
              },
              { type: 'separator' },
              {
                label: 'Auto discard idle time from timer',
                type: 'checkbox',
                enabled: !!settings.idleBehavior,
                checked: settings.discardIdleTime,
                click: (el) => updateSettings({ discardIdleTime: el.checked }, settings)
              },
            ]
          },
          {
            label: 'Use advanced timer controls',
            type: 'checkbox',
            checked: settings.advancedTimerControls,
            click: (el) => updateSettings({ advancedTimerControls: el.checked }, settings),
          },
          {
            label: 'Use progress slider with 1% steps',
            type: 'checkbox',
            checked: settings.progressWithStep1,
            click: (el) => updateSettings({ progressWithStep1: el.checked }, settings),
          },
        ]
      },
    ] : []),
    {
      role: 'help',
      submenu: [
        {
          label: 'Report An Issue',
          click: () => electronUtils.openNewGitHubIssue({
            user: 'Spring3',
            repo: 'redshape',
            // eslint-disable-next-line max-len
            body: `Please describe the issue as detailed as you can\n\n---\n### Debug Info:\n \`\`\`\n${electronUtils.debugInfo()}\n\`\`\``
          })
        }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);
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

  const tray = Tray.getInstance(windowConfig, mainWindow);

  app.on('before-quit', () => {
    tray.setHideWhenClosed(false);
  });

  mainWindow.on('close', (e) => {
    if (tray.willHideWhenClosed()) {
      e.preventDefault();
      mainWindow.hide();
      e.returnValue = false;
    } else {
      mainWindow.webContents.send('window', { action: 'quit' });
    }
  });

  mainWindow.on('show', () => {
    mainWindow.webContents.send('window', { action: 'show' });
    tray.setAppWindowVisibility(true);
    tray.update();
  });

  mainWindow.on('hide', () => {
    mainWindow.webContents.send('window', { action: 'hide' });
    tray.setAppWindowVisibility(false);
    tray.update();
  });

  tray.setup();

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.once('closed', () => {
    mainWindow = null;
  });

  ipcMain.on('notify', (ev, { message, critical, keep }) => {
    const notification = new Notification({
      title: 'System is idle',
      body: message || 'Timer will be paused if system continues idle',
      icon: windowConfig.icon,
      timeoutType: keep ? 'never' : 'default',
      urgency: critical ? 'critical' : 'normal',
      silent: false,
    });
    notification.show();
  });

  ipcMain.on('menu', (ev, { settings }) => {
    generateMenu({ settings });
  });
};

app.once('ready', () => {
  const configFilePath = isDev
    ? path.join(__dirname, '../.env')
    : path.join(app.getPath('userData'), '.env');

  const env = dotenv.config({ path: configFilePath });
  if (env.error || !process.env.ENCRYPTION_KEY) {
    const key = crypto.randomBytes(32).toString('hex');
    const writeToFile = isDev ? fs.appendFileSync : fs.writeFileSync;
    writeToFile(configFilePath, `ENCRYPTION_KEY=${key}`, {});
    dotenv.config({ path: configFilePath });
  }

  // eslint-disable-next-line global-require
  const config = require('../common/config');
  PORT = config.PORT;
  // eslint-disable-next-line global-require
  require('../common/request'); // to initialize from storage

  initialize();
  generateMenu();
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
