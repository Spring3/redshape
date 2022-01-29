import _cloneDeep from 'lodash/cloneDeep';

import { notify } from '../../actions/helper';
import {
  ISSUES_TIME_ENTRY_GET
} from '../../actions/issues.actions';
import {
  TIME_ENTRY_PUBLISH,
  TIME_ENTRY_UPDATE,
  TIME_ENTRY_DELETE
} from '../../actions/timeEntry.actions';
import reducer, { initialState } from '../issue.selected.reducer';

describe('Selected issue reducer', () => {
  it('should return the initial state if the action was not recognized', () => {
    expect(reducer(undefined, { type: 'WEIRD' })).toEqual(initialState);
  });

  describe('ISSUES_TIME_ENTRY_GET', () => {
    it('status START', () => {
      const state = _cloneDeep(initialState);
      expect(
        reducer(
          _cloneDeep(initialState),
          notify.start(ISSUES_TIME_ENTRY_GET)
        )
      ).toEqual({
        ...state,
        spentTime: {
          ...state.spentTime,
          isFetching: true
        }
      });

      expect(
        reducer(
          _cloneDeep(initialState),
          notify.start(ISSUES_TIME_ENTRY_GET, { page: 1 })
        )
      ).toEqual({
        ...state,
        spentTime: {
          ...state.spentTime,
          isFetching: true,
          page: 1
        }
      });
    });

    it('status OK', () => {
      const state = _cloneDeep(initialState);
      const error = new Error('Whoops');
      const data = {
        time_entries: [
          1, 2, 3, 4
        ],
        total_count: 4
      };
      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            spentTime: {
              ...state.spentTime,
              isFetching: true,
              error
            }
          },
          notify.ok(ISSUES_TIME_ENTRY_GET, data)
        )
      ).toEqual({
        ...state,
        spentTime: {
          ...state.spentTime,
          isFetching: false,
          data: data.time_entries,
          totalCount: data.total_count,
          error: undefined
        }
      });

      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            spentTime: {
              ...state.spentTime,
              data: [-1, -2, -3],
              isFetching: true,
              error
            }
          },
          notify.ok(ISSUES_TIME_ENTRY_GET, data, { page: 2 })
        )
      ).toEqual({
        ...state,
        spentTime: {
          ...state.spentTime,
          isFetching: false,
          data: [-1, -2, -3, ...data.time_entries],
          totalCount: data.total_count,
          error: undefined
        }
      });
    });

    it('status NOK', () => {
      const state = _cloneDeep(initialState);
      const error = new Error('Whoops');
      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            spentTime: {
              ...state.spentTime,
              isFetching: true
            }
          },
          notify.nok(ISSUES_TIME_ENTRY_GET, error)
        )
      ).toEqual({
        ...state,
        spentTime: {
          ...state.spentTime,
          isFetching: false,
          error
        }
      });
    });
  });

  describe('TIME_ENTRY_PUBLISH', () => {
    it('status OK - time entry id matches the selected issue', () => {
      const issueData = {
        id: 1,
        spent_hours: 5,
        total_spent_hours: 5
      };
      const data = {
        time_entry: {
          hours: 3,
          issue: {
            id: issueData.id
          }
        }
      };
      const state = _cloneDeep(initialState);
      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            data: { ...issueData },
            spentTime: {
              ...state.spentTime,
              data: [1, 2, 3]
            }
          },
          notify.ok(TIME_ENTRY_PUBLISH, data)
        )
      ).toEqual({
        ...state,
        data: {
          ...issueData,
          spent_hours: issueData.spent_hours + data.time_entry.hours,
          total_spent_hours: issueData.total_spent_hours + data.time_entry.hours
        },
        spentTime: {
          ...state.spentTime,
          data: [
            data.time_entry,
            1, 2, 3
          ]
        }
      });
    });

    it('status OK - time entry id not matches the selected issue', () => {
      const issueData = {
        id: 1,
        spent_hours: 5,
        total_spent_hours: 5
      };
      const data = {
        time_entry: {
          hours: 3,
          issue: {
            id: -issueData.id
          }
        }
      };

      const state = _cloneDeep(initialState);
      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            data: { ...issueData },
            spentTime: {
              ...state.spentTime,
              data: [1, 2, 3]
            }
          },
          notify.ok(TIME_ENTRY_PUBLISH, data)
        )
      ).toEqual({
        ...state,
        data: { ...issueData },
        spentTime: {
          ...state.spentTime,
          data: [1, 2, 3]
        }
      });
    });
  });

  describe('TIME_ENTRY_UPDATE', () => {
    it('status OK - time entry id matches the selected issue id', () => {
      const issueData = {
        id: 1,
        spent_hours: 6,
        total_spent_hours: 6
      };
      const data = {
        id: 1,
        issue: {
          id: issueData.id,
        },
        hours: 7
      };
      const state = _cloneDeep(initialState);
      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            data: { ...issueData },
            spentTime: {
              ...state.spentTime,
              data: [
                { id: 1, hours: 1 },
                { id: 2, hours: 2 },
                { id: 3, hours: 3 }
              ]
            }
          },
          notify.ok(TIME_ENTRY_UPDATE, data)
        )
      ).toEqual({
        ...state,
        data: {
          ...issueData,
          spent_hours: 12,
          total_spent_hours: 12
        },
        spentTime: {
          ...state.spentTime,
          data: [
            data,
            { id: 2, hours: 2 },
            { id: 3, hours: 3 }
          ]
        }
      });
    });

    it('status OK - time entry id not matches the selected issue id', () => {
      const issueData = {
        id: 1,
        spent_hours: 6,
        total_spent_hours: 6
      };
      const data = {
        hours: 3,
        issue: {
          id: -issueData.id
        }
      };

      const state = _cloneDeep(initialState);
      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            data: { ...issueData },
            spentTime: {
              ...state.spentTime,
              data: [
                { id: 1, hours: 1 },
                { id: 2, hours: 2 },
                { id: 3, hours: 3 }
              ]
            }
          },
          notify.ok(TIME_ENTRY_UPDATE, data)
        )
      ).toEqual({
        ...state,
        data: { ...issueData },
        spentTime: {
          ...state.spentTime,
          data: [
            { id: 1, hours: 1 },
            { id: 2, hours: 2 },
            { id: 3, hours: 3 }
          ]
        }
      });
    });
  });

  describe('TIME_ENTRY_DELETE', () => {
    it('status OK - time entry id matches the selected issue id', () => {
      const issueData = {
        id: 1,
        spent_hours: 6,
        total_spent_hours: 6
      };
      const data = {
        issueId: issueData.id,
        timeEntryId: 1
      };
      const state = _cloneDeep(initialState);
      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            data: { ...issueData },
            spentTime: {
              ...state.spentTime,
              data: [
                { id: 1, hours: 1 },
                { id: 2, hours: 2 },
                { id: 3, hours: 3 }
              ]
            }
          },
          notify.ok(TIME_ENTRY_DELETE, data)
        )
      ).toEqual({
        ...state,
        data: {
          ...issueData,
          spent_hours: 5,
          total_spent_hours: 5
        },
        spentTime: {
          ...state.spentTime,
          data: [
            { id: 2, hours: 2 },
            { id: 3, hours: 3 }
          ]
        }
      });
    });

    it('status OK - time entry id not matches the selected issue id', () => {
      const issueData = {
        id: 1,
        spent_hours: 6,
        total_spent_hours: 6
      };
      const data = {
        issueId: -issueData.id,
        timeEntryId: -1
      };

      const state = _cloneDeep(initialState);
      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            data: { ...issueData },
            spentTime: {
              ...state.spentTime,
              data: [
                { id: 1, hours: 1 },
                { id: 2, hours: 2 },
                { id: 3, hours: 3 }
              ]
            }
          },
          notify.ok(TIME_ENTRY_DELETE, data)
        )
      ).toEqual({
        ...state,
        data: { ...issueData },
        spentTime: {
          ...state.spentTime,
          data: [
            { id: 1, hours: 1 },
            { id: 2, hours: 2 },
            { id: 3, hours: 3 }
          ]
        }
      });
    });
  });
});
