import _cloneDeep from 'lodash/cloneDeep';

import reducer, { initialState } from '../settings.reducer';
import storage from '../../../common/storage';
import * as actions from '../../actions/settings.actions';

let storageSpy;

describe('Settings reducer', () => {
  beforeAll(() => {
    storageSpy = jest.spyOn(storage, 'set');
  });

  afterEach(() => {
    storageSpy.mockReset();
  });

  afterAll(() => {
    storageSpy.mockRestore();
  });

  it('should return the initial state by default', () => {
    expect(reducer(undefined, { type: 'NONE' })).toEqual(initialState);
  });

  it('should handle SETTINGS_SHOW_CLOSED_ISSUES action', () => {
    const data = {
      showClosedIssues: true,
      redmineEndpoint: 'https://redmine.redmine',
      userId: 1
    };
    const expectedNextState = {
      ...initialState,
      showClosedIssues: data.showClosedIssues
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
    expect(storageSpy).toHaveBeenCalledWith(
      `settings.${data.redmineEndpoint}.${data.userId}`,
      expectedNextState
    );
  });

  it('should handle SETTINGS_UI_STYLE action', () => {
    const data = {
      uiStyle: 'colors',
      redmineEndpoint: 'https://redmine.redmine',
      userId: 1
    };
    const expectedNextState = {
      ...initialState,
      uiStyle: data.uiStyle
    };

    expect(
      reducer(
        _cloneDeep(initialState),
        {
          type: actions.SETTINGS_UI_STYLE,
          data
        }
      )
    ).toEqual(expectedNextState);
    expect(storageSpy).toHaveBeenCalledWith(
      `settings.${data.redmineEndpoint}.${data.userId}`,
      expectedNextState
    );
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
    expect(storageSpy).toHaveBeenCalledWith(
      `settings.${data.redmineEndpoint}.${data.userId}`,
      expectedNextState
    );
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
    expect(storageSpy).toHaveBeenCalledWith(`settings.${data.redmineEndpoint}.${data.userId}`, initialState);
  });

  it('should handle SETTINGS_RESTORE action', () => {
    const data = {
      redmineEndpoint: 'https://redmine.redmine',
      userId: 1
    };
    const storageGetSpy = jest.spyOn(storage, 'get').mockReturnValue(_cloneDeep(initialState));
    expect(
      reducer(
        _cloneDeep(initialState),
        {
          type: actions.SETTINGS_RESTORE,
          data
        }
      )
    ).toEqual(initialState);
    expect(storageGetSpy).toHaveBeenCalledWith(`settings.${data.redmineEndpoint}.${data.userId}`, initialState);
  });
});
