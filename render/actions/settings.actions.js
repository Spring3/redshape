export const SETTINGS_ADVANCED_TIMER_CONTROLS = 'SETTINGS_ADVANCED_TIMER_CONTROLS';
export const SETTINGS_DISCARD_IDLE_TIME = 'SETTINGS_DISCARD_IDLE_TIME';
export const SETTINGS_IDLE_BEHAVIOR = 'SETTINGS_IDLE_BEHAVIOR';
export const SETTINGS_SHOW_CLOSED_ISSUES = 'SETTINGS_SHOW_CLOSED_ISSUES';
export const SETTINGS_USE_COLORS = 'SETTINGS_USE_COLORS';
export const SETTINGS_ISSUE_HEADERS = 'SETTINGS_ISSUE_HEADERS';
export const SETTINGS_BACKUP = 'SETTINGS_BACKUP';
export const SETTINGS_RESTORE = 'SETTINGS_RESTORE';

const setAdvancedTimerControls = advancedTimerControls => (dispatch, getState) => {
  const { user } = getState();
  dispatch({
    type: SETTINGS_ADVANCED_TIMER_CONTROLS,
    data: {
      userId: user.id,
      redmineEndpoint: user.redmineEndpoint,
      advancedTimerControls
    }
  });
};
const setDiscardIdleTime = discardIdleTime => (dispatch, getState) => {
  const { user } = getState();
  dispatch({
    type: SETTINGS_DISCARD_IDLE_TIME,
    data: {
      userId: user.id,
      redmineEndpoint: user.redmineEndpoint,
      discardIdleTime
    }
  });
};
const setIdleBehavior = idleBehavior => (dispatch, getState) => {
  const { user } = getState();
  dispatch({
    type: SETTINGS_IDLE_BEHAVIOR,
    data: {
      userId: user.id,
      redmineEndpoint: user.redmineEndpoint,
      idleBehavior
    }
  });
};
const setShowClosedIssues = showClosed => (dispatch, getState) => {
  const { user } = getState();
  dispatch({
    type: SETTINGS_SHOW_CLOSED_ISSUES,
    data: {
      userId: user.id,
      redmineEndpoint: user.redmineEndpoint,
      showClosed
    }
  });
};
const setUseColors = useColors => (dispatch, getState) => {
  const { user } = getState();
  dispatch({
    type: SETTINGS_USE_COLORS,
    data: {
      userId: user.id,
      redmineEndpoint: user.redmineEndpoint,
      useColors
    }
  });
};
const setIssueHeaders = data => (dispatch, getState) => {
  const { user } = getState();
  dispatch({
    type: SETTINGS_ISSUE_HEADERS,
    data: {
      userId: user.id,
      redmineEndpoint: user.redmineEndpoint,
      issueHeaders: data
    }
  });
};
const backup = () => (dispatch, getState) => {
  const { user } = getState();
  dispatch({
    type: SETTINGS_BACKUP,
    data: {
      userId: user.id,
      redmineEndpoint: user.redmineEndpoint
    }
  });
};
const restore = () => (dispatch, getState) => {
  const { user } = getState();
  dispatch({
    type: SETTINGS_RESTORE,
    data: {
      userId: user.id,
      redmineEndpoint: user.redmineEndpoint
    }
  });
};

export default {
  setAdvancedTimerControls,
  setDiscardIdleTime,
  setIdleBehavior,
  setShowClosedIssues,
  setUseColors,
  setIssueHeaders,
  backup,
  restore
};
