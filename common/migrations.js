import { availableOptions } from '../render/settings';
import { initialState as initialStateSettings } from '../render/reducers/settings.reducer';
import { initialState as initialStateTracking } from '../render/reducers/tracking.reducer';
import { version } from '../package.json';

import storage from './storage';

const VERSION = version.split('.').map(el => Number(el));

const log = (...args) => {
  console.log('[Settings::Migration]', ...args);
};
const err = (...args) => {
  console.error('[Settings::Migration]', ...args);
};


const save = (settings, user) => {
  if (user) {
    const { id, redmineEndpoint } = user;
    if (id && redmineEndpoint) {
      log(`Saving settings in storage for ${redmineEndpoint}.${id}`);
      storage.set(`settings.${redmineEndpoint}.${id}`, settings);
    }
  }
  return settings;
};

/**
 * This method should be extended when we alter the names/valid values of the settings
 * Check the const `initialState` and also the Component `ColumnHeadersSelect.jsx`
 *
 * The migration does not remove the previous non-conflicting settings (user can still recover them)
 */
export const migrateSettings = (s, user) => {
  if (s == null) {
    log('No config file. Giving default settings.');
    return save(initialStateSettings, user);
  }
  const migration = s.version;
  if (migration === version) {
    return s;
  } if (migration) {
    const [major, minor, patch] = migration.split('.').map(el => Number(el));
    if (major >= 0 && minor >= 0 && patch >= 0) {
      const [vmajor, vminor, vpatch] = VERSION;
      if (vmajor === major && vminor === minor && vpatch === patch) { // same version
        return s;
      }
      if (vmajor === major && vmajor === 1) { // && vminor === minor) {
        if (minor === 3) {
          if (patch < 2) { // 1.3.0, 1.3.1: not public
            s.version = '1.3.2';
            log(`Migrating from ${migration} to ${s.version}`);
            const keys = ['areCommentsEditable', 'isIssueAlwaysEditable', 'timerCheckpoint'];
            keys.forEach(key => s[key] = initialStateSettings[key]);
          }
          if (patch < 3) {
            s.version = '1.3.3';
            log(`Migrating from ${migration} to ${s.version}`);
            const keys = ['areCustomFieldsEditable'];
            keys.forEach(key => s[key] = initialStateSettings[key]);
          }
          s.version = '1.4.0';
          log(`Migrating from ${migration} to ${s.version}`);
          const keys = ['isStrictWorkflow'];
          keys.forEach(key => s[key] = initialStateSettings[key]);
          return save(s, user);
        } if (minor === 4) {
          // unreachable in 1.4.0
          s.version = '1.4.0';
          return save(s, user);
        }
      }
      err(`Migration from version ${migration} to ${version} not implemented. Resetting to the new version.`);
      return save(initialStateSettings, user);
    }
    err(`Invalid version found: ${migration}. Resetting to the new version.`);
    return save(initialStateSettings, user);
  } // else: previous to version 1.3.0
  log(`Migrating from < 1.3.0 to ${version}.`);

  const settings = { ...s };

  const migrations = [
    ['showAdvancedTimerControls', 'advancedTimerControls', 'boolean', 'boolean', value => value],
    ['idleTimeDiscard', 'discardIdleTime', 'boolean', 'boolean', value => value],
    ['uiStyle', 'useColors', 'string', 'boolean', value => (value ? 'colors' : 'default')],
    ['progressSlider', 'progressWithStep1', 'string', 'boolean', value => (value ? '1%' : '10%')],
    ['idleBehavior', 'idleBehavior', 'string', 'number', (value) => {
      switch (value) {
        default:
        case 0: return 'none'; break;
        case 5: return '5m'; break;
        case 10: return '10m'; break;
        case 15: return '15m'; break;
      }
    }],
  ];

  for (const [to, from, toExpectType, fromExpectType, cb] of migrations) {
    let setting;
    const toType = typeof settings[to];
    if (toType !== toExpectType) {
      setting = settings[from];
      const fromType = typeof setting;
      if (fromType === fromExpectType) {
        delete settings[from];
        settings[to] = cb(setting);
      } else {
        if (setting != null) {
          err(`[Settings] Cannot migrate setting '${from}' with value '${setting}' to new setting '${to}'. Default value applied.`);
        } else {
          delete settings[from];
        }
        settings[to] = initialStateSettings[to];
      }
    }
  }

  const { issueHeaders } = settings;
  if (issueHeaders) {
    const available = availableOptions.issueHeaders;
    const headers = available.map((el) => {
      const found = issueHeaders.find(it => it.value === el.value);
      return found ? el : null;
    }).filter(el => el != null);
    settings.issueHeaders = headers;
  }

  let keys;
  // 1.3.2
  keys = ['areCommentsEditable', 'isIssueAlwaysEditable', 'timerCheckpoint'];
  keys.forEach(key => settings[key] = initialStateSettings[key]);
  // 1.3.3
  keys = ['areCustomFieldsEditable'];
  keys.forEach(key => settings[key] = initialStateSettings[key]);
  // 1.4.0
  keys = ['isStrictWorkflow'];
  keys.forEach(key => settings[key] = initialStateSettings[key]);

  settings.version = version;

  return save(settings, user);
};

export const migrateTracking = (s) => {
  if (s == null) {
    return initialStateTracking;
  }
  // after shutdown/sleep, it should be stopped
  // the user will check Redshape and will resume (or not)
  s.isPaused = true;
  return s;
};
