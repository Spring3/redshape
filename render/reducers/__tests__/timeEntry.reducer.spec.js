import _cloneDeep from 'lodash/cloneDeep';

import reducer, { initialState } from '../timeEntry.reducer';
import { notify } from '../../actions/helper';
import * as actions from '../../actions/timeEntry.actions';

describe('Time Entry reducer', () => {
  it('should return a default state if an unknown action comes in', () => {
    expect(
      reducer(
        _cloneDeep(initialState),
        { type: 'WEIRD' }
      )
    ).toEqual(initialState);
  });

  describe('TIME_ENTRY_DELETE, TIME_ENTRY_UPDATE, TIME_ENTRY_PUBLISH actions', () => {
    it('with status START', () => {
      expect(
        reducer(
          _cloneDeep(initialState),
          notify.start(actions.TIME_ENTRY_DELETE)
        )
      ).toEqual({
        ...initialState,
        isFetching: true
      });

      expect(
        reducer(
          _cloneDeep(initialState),
          notify.start(actions.TIME_ENTRY_PUBLISH)
        )
      ).toEqual({
        ...initialState,
        isFetching: true
      });

      expect(
        reducer(
          _cloneDeep(initialState),
          notify.start(actions.TIME_ENTRY_UPDATE)
        )
      ).toEqual({
        ...initialState,
        isFetching: true
      });
    });

    it('with status OK', () => {
      const error = new Error('Whoops');
      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            isFetching: true,
            error
          },
          notify.ok(actions.TIME_ENTRY_DELETE)
        )
      ).toEqual({
        ...initialState,
        isFetching: false,
        error: undefined
      });

      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            isFetching: true,
            error
          },
          notify.ok(actions.TIME_ENTRY_PUBLISH)
        )
      ).toEqual({
        ...initialState,
        isFetching: false,
        error: undefined
      });

      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            isFetching: true,
            error
          },
          notify.ok(actions.TIME_ENTRY_UPDATE)
        )
      ).toEqual({
        ...initialState,
        isFetching: false,
        error: undefined
      });
    });

    it('with status NOK', () => {
      const error = new Error('Whoops');
      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            isFetching: true
          },
          notify.nok(actions.TIME_ENTRY_DELETE, error)
        )
      ).toEqual({
        ...initialState,
        isFetching: false,
        error
      });

      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            isFetching: true
          },
          notify.nok(actions.TIME_ENTRY_PUBLISH, error)
        )
      ).toEqual({
        ...initialState,
        isFetching: false,
        error
      });

      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            isFetching: true
          },
          notify.nok(actions.TIME_ENTRY_UPDATE, error)
        )
      ).toEqual({
        ...initialState,
        isFetching: false,
        error
      });
    });
  });

  it('should handle TIME_ENTRY_PUBLISH_VALIDATION_FAILED, TIME_ENTRY_UPDATE_VALIDATION_FAILED actions', () => {
    const error = new Error('Whoops');
    expect(
      reducer(
        _cloneDeep(initialState),
        { type: actions.TIME_ENTRY_PUBLISH_VALIDATION_FAILED, data: error }
      )
    ).toEqual({
      ...initialState,
      error
    });

    expect(
      reducer(
        _cloneDeep(initialState),
        { type: actions.TIME_ENTRY_UPDATE_VALIDATION_FAILED, data: error }
      )
    ).toEqual({
      ...initialState,
      error
    });
  });
});
