import * as settingsActions from '../settings.actions';

describe('Settings actions', () => {
  it('should expose all the necessary actions', () => {
    expect(settingsActions).toBeTruthy();
    expect(settingsActions.SETTINGS_SHOW_CLOSED_ISSUES).toBeTruthy();
    expect(settingsActions.SETTINGS_UI_STYLE).toBeTruthy();
    expect(settingsActions.SETTINGS_ISSUE_HEADERS).toBeTruthy();
    expect(settingsActions.SETTINGS_BACKUP).toBeTruthy();
    expect(settingsActions.SETTINGS_RESTORE).toBeTruthy();

    expect(settingsActions.default.setShowClosedIssues).toBeTruthy();
    expect(settingsActions.default.setUiStyle).toBeTruthy();
    expect(settingsActions.default.setIssueHeaders).toBeTruthy();
    expect(settingsActions.default.restore).toBeTruthy();
    expect(settingsActions.default.backup).toBeTruthy();
  });

  it('SHOW_CLOSED_ISSUES action', () => {
    const state = {
      user: {
        id: 1,
        redmineEndpoint: 'https://redmine.redmine'
      }
    };
    const dispatch = jest.fn();
    const getState = jest.fn().mockReturnValue(state);
    settingsActions.default.setShowClosedIssues(true)(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith({
      type: settingsActions.SETTINGS_SHOW_CLOSED_ISSUES,
      data: {
        userId: state.user.id,
        redmineEndpoint: state.user.redmineEndpoint,
        showClosedIssues: true
      }
    });
  });

  it('USE_COLORS action', () => {
    const state = {
      user: {
        id: 1,
        redmineEndpoint: 'https://redmine.redmine'
      }
    };
    const dispatch = jest.fn();
    const getState = jest.fn().mockReturnValue(state);
    settingsActions.default.setUiStyle('default')(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith({
      type: settingsActions.SETTINGS_UI_STYLE,
      data: {
        userId: state.user.id,
        redmineEndpoint: state.user.redmineEndpoint,
        uiStyle: 'default'
      }
    });
  });

  it('ISSUE_HEADERS action', () => {
    const state = {
      user: {
        id: 1,
        redmineEndpoint: 'https://redmine.redmine'
      }
    };
    const dispatch = jest.fn();
    const getState = jest.fn().mockReturnValue(state);
    settingsActions.default.setIssueHeaders([])(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith({
      type: settingsActions.SETTINGS_ISSUE_HEADERS,
      data: {
        userId: state.user.id,
        redmineEndpoint: state.user.redmineEndpoint,
        issueHeaders: []
      }
    });
  });

  it('BACKUP actions', () => {
    const state = {
      user: {
        id: 1,
        redmineEndpoint: 'https://redmine.redmine'
      }
    };
    const dispatch = jest.fn();
    const getState = jest.fn().mockReturnValue(state);
    settingsActions.default.backup([])(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith({
      type: settingsActions.SETTINGS_BACKUP,
      data: {
        userId: state.user.id,
        redmineEndpoint: state.user.redmineEndpoint
      }
    });
  });

  it('RESTORE action', () => {
    const state = {
      user: {
        id: 1,
        redmineEndpoint: 'https://redmine.redmine'
      }
    };
    const dispatch = jest.fn();
    const getState = jest.fn().mockReturnValue(state);
    settingsActions.default.restore([])(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith({
      type: settingsActions.SETTINGS_RESTORE,
      data: {
        userId: state.user.id,
        redmineEndpoint: state.user.redmineEndpoint
      }
    });
  });
});
