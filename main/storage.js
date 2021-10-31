const os = require('os');
const Store = require('electron-store');
const isDev = require('electron-is-dev');
const { ENCRYPTION_KEY } = require('./env');

const storage = new Store({
  name: isDev ? 'config-dev' : 'config',
  encryptionKey: ENCRYPTION_KEY
});

console.log(JSON.stringify(storage.get('activeSession'), null, 2));
console.log(JSON.stringify(storage.get('persistedSessions'), null, 2));

const updateSavedSession = (persistedSessions, activeSession) => {
  const savedActiveSessionIndex = persistedSessions.findIndex((session) => session.token === activeSession.token
      && session.endpoint === activeSession.endpoint);

  if (savedActiveSessionIndex !== -1) {
    const persistedSessionsCopy = [...persistedSessions];
    persistedSessionsCopy[savedActiveSessionIndex] = activeSession;
    storage.set('persistedSessions', persistedSessionsCopy);
  }
};

const getActiveSession = () => {
  const activeSession = storage.get('activeSession');
  if (activeSession) {
    return {
      ...activeSession,
      platforn: os.platform
    };
  }

  return activeSession;
};

const getAllSettings = () => {
  const activeSession = getActiveSession();
  const persistedSessions = storage.get('persistedSessions', []);
  return {
    activeSession,
    persistedSessions
  };
};

const getSession = ({ token, endpoint }) => {
  const { activeSession, persistedSessions } = getAllSettings();

  if (token === activeSession?.token) {
    return getActiveSession();
  }

  const targetSession = persistedSessions.find(session => session.token === token && session.endpoint === endpoint);

  return targetSession;
};

const resetActiveSession = () => {
  storage.delete('activeSession');
};

const saveSession = (session) => {
  const sessionObject = {
    user: {
      id: session.user.id,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      createdOn: session.user.createdOn
    },
    endpoint: session.endpoint,
    token: session.token,
    settings: {
      ...session.settings
    }
  };

  storage.set('activeSession', sessionObject);
  updateSavedSession(storage.get('persistedSessions', []), sessionObject);
};

const eventHandlers = (event, message) => {
  const { action, payload, id } = JSON.parse(message);

  console.log('Received storage event', message);

  switch (action) {
    case 'READ': {
      const session = getSession({
        token: payload.token,
        endpoint: payload.endpoint
      });

      if (!session) {
        event.reply(`storage:${id}`, {
          success: false
        });
        break;
      }

      const { token, ...sessionWithoutToken } = session;

      event.reply(`storage:${id}`, {
        success: true,
        payload: sessionWithoutToken
      });
      break;
    }
    case 'SAVE': {
      saveSession(payload);
      event.reply(`storage:${id}`, { success: true });
      break;
    }
    case 'RESET': {
      resetActiveSession();
      event.reply(`storage:${id}`, { success: true });
      break;
    }
    default: {
      event.reply(`storage:${id}`, {
        success: false,
        error: new Error('Unable to process the requested action', action)
      });
    }
  }
};

const initializeStorageEvents = (ipcMain) => {
  ipcMain.on('storage', eventHandlers);
};

const disposeStorageEvents = (ipcMain) => {
  ipcMain.off('storage', eventHandlers);
};

module.exports = {
  getActiveSession,
  getAllSettings,
  resetActiveSession,
  initializeStorageEvents,
  disposeStorageEvents
};
