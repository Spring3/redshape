import storage from '../../common/storage';

import { version } from '../../package.json';
const VERSION = version.split('.').map(el => Number(el));

import { availableOptions } from "../settings";

import {
  SETTINGS_IDLE_TIME_DISCARD,
  SETTINGS_IDLE_BEHAVIOR,
  SETTINGS_PROGRESS_SLIDER,
  SETTINGS_UI_STYLE,
  SETTINGS_SHOW_ADVANCED_TIMER_CONTROLS,
  SETTINGS_SHOW_CLOSED_ISSUES,
  SETTINGS_ISSUE_HEADERS,
  SETTINGS_BACKUP,
  SETTINGS_RESTORE,
} from '../actions/settings.actions';

export const initialState = {
  showAdvancedTimerControls: false,
  progressSlider: '10%',
  idleBehavior: 'none',
  idleTimeDiscard: false,
  showClosedIssues: false,
  uiStyle: 'default',
  issueHeaders: [
    { label: 'Id', isFixed: true, value: 'id', format: 'id' },
    { label: 'Subject', isFixed: true, value: 'subject' },
    { label: 'Project', value: 'project.name' },
    { label: 'Tracker', value: 'tracker.name', format: 'tracker' },
    { label: 'Status', value: 'status.name', format: 'status' },
    { label: 'Priority', value: 'priority.name', format: 'priority' },
    { label: 'Estimation', value: 'estimated_hours', format: 'hours' },
    { label: 'Due Date', value: 'due_date', format: 'date' }
  ],
  version,
};

/**
 *  This method should be extended when we alter the names/valid values of the settings
 *  Check the const `initialState` and also the Component `ColumnHeadersSelect.jsx`
 */
const migrateSettings = (s) => {
  const migration = s.version
  if (migration === version) {
    return s;
  } else if (migration){
    const [major, minor, patch] = migration.split('.').map(el => Number(el));
    if (major >= 0 && minor >= 0 && patch >= 0){
      const [vmajor, vminor, vpatch] = VERSION;
      if (vmajor === major && vminor === minor && vpatch === patch) {
        return s;
      }else{
        console.error(`[Settings] Migration from version ${migration} to ${version} not implemented. Resetting to the new version.`);
        return initialState;
      }
    }else{
      console.error(`[Settings] Invalid version ${migration}. Resetting to the new version.`);
      return initialState;
    }
  } // else: previous to version 1.3.0

  let settings = {...s};

  const migrations = [
    ['showAdvancedTimerControls', 'advancedTimerControls', 'boolean', 'boolean', value => value],
    ['idleTimeDiscard', 'discardIdleTime', 'boolean', 'boolean', value => value],
    ['uiStyle', 'useColors', 'string', 'boolean', value => (value ? 'colors' : 'default')],
    ['progressSlider', 'progressWithStep1', 'string', 'boolean', value => (value ? '1%' : '10%')],
    ['idleBehavior', 'idleBehavior', 'string', 'number', value => {
      switch(value){
        default:
        case 0: return 'none'; break;
        case 5: return '5m'; break;
        case 10: return '10m'; break;
        case 15: return '15m'; break;
      }
    }],
  ];

  for (let [to, from, toExpectType, fromExpectType, cb] of migrations){
    let setting;
    let toType = typeof settings[to];
    if (toType !== toExpectType){
      setting = settings[from];
      let fromType = typeof setting;
      if (fromType === fromExpectType){
        delete settings[from];
        settings[to] = cb(setting);
      }else{
        if (setting != null) {
          console.error(`[Settings] Cannot migrate setting '${from}' with value '${setting}' to new setting '${to}'. Default value applied.`);
        }else {
          delete settings[from];
        }
        settings[to] = initialState[to];
      }
    }
  }

  const { issueHeaders } = settings;
  if (issueHeaders){
    const available = availableOptions.issueHeaders;
    const headers = issueHeaders.map(el => {
      return available.find(it => it.value === el.value);
    }).filter(el => el != null);
    settings.issueHeaders = headers;
  }

  settings.version = version;

  // the migration does not remove the previous non-conflicting settings (user can still recover them)

  return settings;
}

const orderTableHeaders = (headers) => {
  const fixed = [];
  const unfixed = [];
  for (const header of headers) { // eslint-disable-line
    if (header.isFixed) {
      fixed.push(header);
    } else {
      unfixed.push(header);
    }
  }
  return [...fixed, ...unfixed];
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SETTINGS_SHOW_ADVANCED_TIMER_CONTROLS: {
      const { userId, redmineEndpoint, showAdvancedTimerControls } = action.data;
      const nextState = {
        ...state,
        showAdvancedTimerControls,
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    case SETTINGS_PROGRESS_SLIDER: {
      const { userId, redmineEndpoint, progressSlider } = action.data;
      const nextState = {
        ...state,
        progressSlider,
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    case SETTINGS_IDLE_TIME_DISCARD: {
      const { userId, redmineEndpoint, idleTimeDiscard } = action.data;
      const nextState = {
        ...state,
        idleTimeDiscard,
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    case SETTINGS_IDLE_BEHAVIOR: {
      const { userId, redmineEndpoint, idleBehavior } = action.data;
      const nextState = {
        ...state,
        idleBehavior,
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    case SETTINGS_SHOW_CLOSED_ISSUES: {
      const { userId, redmineEndpoint, showClosedIssues } = action.data;
      const nextState = {
        ...state,
        showClosedIssues: !!showClosedIssues
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    case SETTINGS_UI_STYLE: {
      const { userId, redmineEndpoint, uiStyle } = action.data;
      const nextState = {
        ...state,
        uiStyle,
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    case SETTINGS_ISSUE_HEADERS: {
      const { userId, redmineEndpoint, issueHeaders } = action.data;
      const nextState = {
        ...state,
        issueHeaders: issueHeaders ? orderTableHeaders(issueHeaders) : state.issueHeaders
      };
      storage.set(`settings.${redmineEndpoint}.${userId}`, nextState);
      return nextState;
    }
    case SETTINGS_BACKUP: {
      const { userId, redmineEndpoint } = action.data;
      storage.set(`settings.${redmineEndpoint}.${userId}`, state);
      return state;
    }
    case SETTINGS_RESTORE: {
      const { userId, redmineEndpoint } = action.data;
      return storage.get(`settings.${redmineEndpoint}.${userId}`, initialState);
    }
    default:
      let newSettings = migrateSettings(state);
      return newSettings;
  }
};
