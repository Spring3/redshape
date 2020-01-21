export const SETTINGS_SHOW_ADVANCED_TIMER_CONTROLS = 'SETTINGS_SHOW_ADVANCED_TIMER_CONTROLS';
export const SETTINGS_IDLE_TIME_DISCARD = 'SETTINGS_IDLE_TIME_DISCARD';
export const SETTINGS_IDLE_BEHAVIOR = 'SETTINGS_IDLE_BEHAVIOR';
export const SETTINGS_SHOW_CLOSED_ISSUES = 'SETTINGS_SHOW_CLOSED_ISSUES';
export const SETTINGS_PROGRESS_SLIDER = 'SETTINGS_PROGRESS_SLIDER';
export const SETTINGS_UI_STYLE = 'SETTINGS_UI_STYLE';
export const SETTINGS_ISSUE_HEADERS = 'SETTINGS_ISSUE_HEADERS';
export const SETTINGS_BACKUP = 'SETTINGS_BACKUP';
export const SETTINGS_RESTORE = 'SETTINGS_RESTORE';

const setShowAdvancedTimerControls = showAdvancedTimerControls => (dispatch, getState) => {
  const { user } = getState();
  dispatch({
    type: SETTINGS_SHOW_ADVANCED_TIMER_CONTROLS,
    data: {
      userId: user.id,
      redmineEndpoint: user.redmineEndpoint,
      showAdvancedTimerControls
    }
  });
};
const setProgressSlider = progressSlider => (dispatch, getState) => {
  const { user } = getState();
  dispatch({
    type: SETTINGS_PROGRESS_SLIDER,
    data: {
      userId: user.id,
      redmineEndpoint: user.redmineEndpoint,
      progressSlider
    }
  });
};
const setIdleTimeDiscard = idleTimeDiscard => (dispatch, getState) => {
  const { user } = getState();
  dispatch({
    type: SETTINGS_IDLE_TIME_DISCARD,
    data: {
      userId: user.id,
      redmineEndpoint: user.redmineEndpoint,
      idleTimeDiscard
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
const setShowClosedIssues = showClosedIssues => (dispatch, getState) => {
  const { user } = getState();
  dispatch({
    type: SETTINGS_SHOW_CLOSED_ISSUES,
    data: {
      userId: user.id,
      redmineEndpoint: user.redmineEndpoint,
      showClosedIssues
    }
  });
};
const setUiStyle = uiStyle => (dispatch, getState) => {
  const { user } = getState();
  dispatch({
    type: SETTINGS_UI_STYLE,
    data: {
      userId: user.id,
      redmineEndpoint: user.redmineEndpoint,
      uiStyle
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
  setShowAdvancedTimerControls,
  setProgressSlider,
  setIdleTimeDiscard,
  setIdleBehavior,
  setShowClosedIssues,
  setUiStyle,
  setIssueHeaders,
  backup,
  restore
};
