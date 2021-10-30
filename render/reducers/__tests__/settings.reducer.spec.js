import _cloneDeep from 'lodash/cloneDeep';

import reducer, { initialState } from '../settings.reducer';
import * as actions from '../../actions/settings.actions';

describe('Settings reducer', () => {
  it('should return the initial state by default', () => {
    expect(reducer(undefined, { type: 'NONE' })).toEqual(initialState);
  });

  it('should handle SETTINGS_SHOW_CLOSED_ISSUES action', () => {
    const data = {
      showClosed: true,
      redmineEndpoint: 'https://redmine.redmine',
      userId: 1
    };
    const expectedNextState = {
      ...initialState,
      showClosedIssues: data.showClosed
    };

    expect(
      reducer(
        _cloneDeep(initialState),
        {
          type: actions.SETTINGS_SHOW_CLOSED_ISSUES,
          data
        }
      )
    ).toEqual(expectedNextState);
  });

  it('should handle SETTINGS_USE_COLORS action', () => {
    const data = {
      useColors: true,
      redmineEndpoint: 'https://redmine.redmine',
      userId: 1
    };
    const expectedNextState = {
      ...initialState,
      useColors: data.useColors
    };

    expect(
      reducer(
        _cloneDeep(initialState),
        {
          type: actions.SETTINGS_USE_COLORS,
          data
        }
      )
    ).toEqual(expectedNextState);
  });

  it('should handle SETTINGS_ISSUE_HEADERS action', () => {
    const data = {
      issueHeaders: [
        { label: 'Id', isFixed: true, value: 'id' },
        { label: 'Subject', isFixed: true, value: 'subject' },
        { label: 'Project', value: 'project.name' },
        { label: 'Tracker', value: 'tracker.name' },
        { label: 'Status', value: 'status.name' }
      ],
      redmineEndpoint: 'https://redmine.redmine',
      userId: 1
    };
    const expectedNextState = {
      ...initialState,
      issueHeaders: data.issueHeaders
    };

    expect(
      reducer(
        _cloneDeep(initialState),
        {
          type: actions.SETTINGS_ISSUE_HEADERS,
          data
        }
      )
    ).toEqual(expectedNextState);
  });

  it('should handle SETTINGS_BACKUP action', () => {
    const data = {
      redmineEndpoint: 'https://redmine.redmine',
      userId: 1
    };
    expect(
      reducer(
        _cloneDeep(initialState),
        {
          type: actions.SETTINGS_BACKUP,
          data
        }
      )
    ).toEqual(initialState);
  });

  it('should handle SETTINGS_RESTORE action', () => {
    const data = {
      redmineEndpoint: 'https://redmine.redmine',
      userId: 1
    };

    expect(
      reducer(
        _cloneDeep(initialState),
        {
          type: actions.SETTINGS_RESTORE,
          data
        }
      )
    ).toEqual(initialState);
  });
});
