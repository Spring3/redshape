import * as settingsActions from '../settings.actions';

describe('Settings actions', () => {
  it('should expose all the necessary actions', () => {
    expect(settingsActions).toBeTruthy();
    expect(settingsActions.SETTINGS_USE_CORS).toBeTruthy();
    expect(settingsActions.SETTINGS_SHOW_CLOSED_ISSUES).toBeTruthy();
    expect(settingsActions.SETTINGS_USE_COLORS).toBeTruthy();
    expect(settingsActions.SETTINGS_ISSUE_HEADERS).toBeTruthy();
    expect(settingsActions.SETTINGS_BACKUP).toBeTruthy();
    expect(settingsActions.SETTINGS_RESTORE).toBeTruthy();

    expect(settingsActions.default.setCors).toBeTruthy();
    expect(settingsActions.default.setShowClosedIssues).toBeTruthy();
    expect(settingsActions.default.setUseColors).toBeTruthy();
    expect(settingsActions.default.setIssueHeaders).toBeTruthy();
    expect(settingsActions.default.restore).toBeTruthy();
    expect(settingsActions.default.backup).toBeTruthy();
  });

  it('USE_CORS action', () => {
    const state = {
      user: {
        id: 1,
        redmineEndpoint: 'https://redmine.redmine'
      }
    };
    const dispatch = jest.fn();
    const getState = jest.fn().mockReturnValue(state);
    settingsActions.default.setCors(true)(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith({
      type: settingsActions.SETTINGS_USE_CORS,
      data: {
        userId: state.user.id,
        redmineEndpoint: state.user.redmineEndpoint,
        useCors: true
      }
    });
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
        showClosed: true
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
    settingsActions.default.setUseColors(true)(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith({
      type: settingsActions.SETTINGS_USE_COLORS,
      data: {
        userId: state.user.id,
        redmineEndpoint: state.user.redmineEndpoint,
        useColors: true
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
