import _cloneDeep from 'lodash/cloneDeep';
import reducer, { initialState } from '../issues.reducer';
import { ISSUES_GET_ALL } from '../../actions/issues.actions';
import { notify } from '../../actions/helper';

describe('issues reducer', () => {
  it('should return state if a given action does not match the filters', () => {
    expect(reducer(undefined, { type: 'WEIRD' })).toEqual({
      data: [],
      fetchedOffset: 0,
      isFetching: false,
      error: undefined
    });
  });

  describe('ISSUES_GET_ALL action', () => {
    it('should process ISSUES_GET_ALL with status START', () => {
      expect(
        reducer(
          _cloneDeep(initialState),
          notify.start(ISSUES_GET_ALL)
        )
      ).toEqual({
        data: [],
        fetchedOffset: 0,
        isFetching: true,
        error: undefined
      });
    });

    it('should process ISSUES_GET_ALL with status OK', () => {
      const data = { issues: ['1', '2', '3'] };
      expect(
        reducer(
          _cloneDeep(initialState),
          notify.ok(ISSUES_GET_ALL, data)
        )
      ).toEqual({
        data: data.issues,
        fetchedOffset: 0,
        isFetching: false,
        error: undefined
      });
    });

    it('should process ISSUES_GET_ALL with status NOK', () => {
      const data = new Error('Whoops');
      expect(
        reducer(
          _cloneDeep(initialState),
          notify.nok(ISSUES_GET_ALL, data)
        )
      ).toEqual({
        data: [],
        fetchedOffset: 0,
        isFetching: false,
        error: data
      });
    });

    it('should return the same state if ISSUES_GET_ALL comes with an unknown status', () => {
      expect(
        reducer(
          _cloneDeep(initialState),
          {
            type: ISSUES_GET_ALL,
            status: 'UNKNOWN',
            data: {
              issues: ['1', '2']
            }
          }
        )
      ).toEqual(initialState);
    });

    it('should reset error on OK after NOK', () => {
      const error = new Error('Oh my!');
      const nokState = reducer(
        _cloneDeep(initialState),
        notify.nok(ISSUES_GET_ALL, error)
      );
      expect(nokState.error).toEqual(error);

      const okData = {
        issues: ['12', '123']
      };
      const okState = reducer(nokState, notify.ok(ISSUES_GET_ALL, okData));
      expect(okState.error).toBe(undefined);
      expect(okState.data).toEqual(okData.issues);
    });

    it('should not reset error or issues after START', () => {
      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            error: new Error('WRONG!'),
            data: [1, 2, 3, 4, 5]
          },
          notify.start(ISSUES_GET_ALL)
        )
      ).toEqual({
        ...initialState,
        error: new Error('WRONG!'),
        data: [1, 2, 3, 4, 5],
        isFetching: true
      });
    });
  });
});
