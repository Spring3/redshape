export const SETTINGS_USE_CORS = 'SETTINGS_SET_CORS';
export const SETTINGS_SHOW_CLOSED_ISSUES = 'SETTINGS_SHOW_CLOSED_ISSUES';
export const SETTINGS_USE_COLORS = 'SETTINGS_USE_COLORS';
export const SETTINGS_ISSUE_HEADERS = 'SETTINGS_ISSUE_HEADERS';
export const SETTINGS_BACKUP = 'SETTINGS_BACKUP';
export const SETTINGS_RESTORE = 'SETTINGS_RESTORE';

const setCors = useCors => (dispatch, getState) => {
  const { user } = getState();
  dispatch({
    type: SETTINGS_USE_CORS,
    data: {
      userId: user.id,
      redmineEndpoint: user.redmineEndpoint,
      useCors
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
  setCors,
  setShowClosedIssues,
  setUseColors,
  setIssueHeaders,
  backup,
  restore
};
