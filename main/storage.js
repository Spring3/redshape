const os = require('os');
const Store = require('electron-store');
const isDev = require('electron-is-dev');
const crypto = require('crypto');

const { ENCRYPTION_KEY } = require('./env');

const TOKEN_FALLBACK = '';

const storage = new Store({
  name: isDev ? 'config-dev' : 'config',
  encryptionKey: ENCRYPTION_KEY
});

const hashToken = (token) => crypto.createHash('sha256').update(token || TOKEN_FALLBACK, 'utf8').digest('hex');

console.log(JSON.stringify(storage.get('activeSession'), null, 2));
console.log(JSON.stringify(storage.get('persistedSessions'), null, 2));

const upsertSavedSession = (persistedSessions, activeSession) => {
  const savedActiveSessionIndex = persistedSessions.findIndex((session) => session.hash === activeSession.hash);

  if (savedActiveSessionIndex !== -1) {
    const persistedSessionsCopy = [...persistedSessions];
    persistedSessionsCopy[savedActiveSessionIndex] = activeSession;
    storage.set('persistedSessions', persistedSessionsCopy);
  } else {
    const updatedPersistedSessions = [...persistedSessions, activeSession];
    storage.set('persistedSessions', updatedPersistedSessions);
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

const getSession = (token) => {
  const { activeSession, persistedSessions } = getAllSettings();
  const hash = hashToken(token);

  if (hash === activeSession?.hash) {
    return getActiveSession();
  }

  const targetSession = persistedSessions.find(session => session.hash === hash);

  return targetSession;
};

const resetActiveSession = () => {
  storage.delete('activeSession');
};

const saveSession = (session) => {
  const sessionHash = hashToken(session.token);

  const sessionObject = {
    hash: sessionHash,
    user: {
      id: session.user.id,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      createdOn: session.user.createdOn
    },
    endpoint: session.endpoint,
    settings: {
      ...session.settings
    }
  };

  storage.set('activeSession', sessionObject);
  upsertSavedSession(storage.get('persistedSessions', []), sessionObject);
};

const eventHandlers = (event, message) => {
  const { action, payload, id } = JSON.parse(message);

  console.log('Received session event', message);

  switch (action) {
    case 'READ': {
      const session = getSession(payload.token);

      if (!session) {
        event.reply(`session-response:${id}`, {
          success: false
        });
        break;
      }

      const { hash, ...sessionWithoutHash } = session;

      event.reply(`session-response:${id}`, {
        success: true,
        payload: sessionWithoutHash
      });
      break;
    }
    case 'SAVE': {
      saveSession(payload);
      event.reply(`session-response:${id}`, { success: true });
      break;
    }
    default: {
      event.reply(`session-response:${id}`, {
        success: false,
        error: new Error('Unable to process the requested action', action)
      });
    }
  }
};

const initializeSessionEvents = (ipcMain) => {
  ipcMain.on('session-request', eventHandlers);
};

const disposeSessionEvents = (ipcMain) => {
  ipcMain.off('session-request', eventHandlers);
};

module.exports = {
  getActiveSession,
  getAllSettings,
  resetActiveSession,
  initializeSessionEvents,
  disposeSessionEvents
};
