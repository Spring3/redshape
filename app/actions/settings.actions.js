export const SETTINGS_USE_CORS = 'SETTINGS_SET_CORS';
export const SETTINGS_SHOW_CLOSED_ISSUES = 'SETTINGS_SHOW_CLOSED_ISSUES';
export const SETTINGS_USE_COLORS = 'SETTINGS_USE_COLORS';

const setCors = data => ({ type: SETTINGS_USE_CORS, data });
const setShowClosedIssues = data => ({ type: SETTINGS_SHOW_CLOSED_ISSUES, data });
const setUseColors = data => ({ type: SETTINGS_USE_COLORS, data });

export default {
  setCors,
  setShowClosedIssues,
  setUseColors
};
