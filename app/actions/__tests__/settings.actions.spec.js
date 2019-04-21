import * as settingsActions from '../settings.actions';

describe('Settings actions', () => {
  it('should expose all the necessary actions', () => {
    expect(settingsActions).toBeTruthy();
    expect(settingsActions.SETTINGS_USE_CORS).toBeTruthy();
    expect(settingsActions.SETTINGS_SHOW_CLOSED_ISSUES).toBeTruthy();
    expect(settingsActions.SETTINGS_USE_COLORS).toBeTruthy();
    expect(settingsActions.SETTINGS_ISSUE_HEADERS).toBeTruthy();

    expect(settingsActions.default.setCors).toBeTruthy();
    expect(settingsActions.default.setShowClosedIssues).toBeTruthy();
    expect(settingsActions.default.setUseColors).toBeTruthy();
    expect(settingsActions.default.setIssueHeaders).toBeTruthy();

    expect(settingsActions.default.setCors(true)).toEqual({
      type: settingsActions.SETTINGS_USE_CORS,
      data: true
    });

    expect(settingsActions.default.setShowClosedIssues(true)).toEqual({
      type: settingsActions.SETTINGS_SHOW_CLOSED_ISSUES,
      data: true
    });

    expect(settingsActions.default.setUseColors(true)).toEqual({
      type: settingsActions.SETTINGS_USE_COLORS,
      data: true
    });

    expect(settingsActions.default.setIssueHeaders([])).toEqual({
      type: settingsActions.SETTINGS_ISSUE_HEADERS,
      data: []
    });
  });
});
