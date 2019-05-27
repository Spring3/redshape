import _cloneDeep from 'lodash/cloneDeep';
import reducer, { initialState } from '../issues.reducer';
import { ISSUES_GET_PAGE } from '../../actions/issues.actions';
import { notify } from '../../actions/helper';

describe('issues reducer', () => {
  it('should return state if a given action does not match the filters', () => {
    expect(reducer(undefined, { type: 'WEIRD' })).toEqual({
      data: [],
      isFetching: false,
      limit: 20,
      page: 0,
      totalCount: 0,
      error: undefined
    });
  });

  describe('ISSUES_GET_PAGE action', () => {
    it('should process ISSUES_GET_PAGE with status START', () => {
      expect(
        reducer(
          _cloneDeep(initialState),
          notify.start(ISSUES_GET_PAGE, { page: 0 })
        )
      ).toEqual({
        data: [],
        isFetching: true,
        limit: 20,
        page: 0,
        totalCount: 0,
        error: undefined
      });
    });

    it('should process ISSUES_GET_PAGE with status OK', () => {
      const data = { issues: ['1', '2', '3'] };
      const error = new Error('Whoops');
      expect(
        reducer(
          {
            ..._cloneDeep(initialState),
            error
          },
          notify.ok(ISSUES_GET_PAGE, data)
        )
      ).toEqual({
        data: data.issues,
        isFetching: false,
        limit: 20,
        page: 0,
        totalCount: 0,
        error: undefined
      });
    });

    it('should append data when ISSUES_GET_PAGE action comes with a page > 0 and status OK', () => {
      const data = { issues: ['1', '2', '3'] };
      expect(
        reducer(
          Object.assign(_cloneDeep(initialState), { data: ['4', '5'], page: 1 }),
          notify.ok(ISSUES_GET_PAGE, data, { page: 1 })
        )
      ).toEqual({
        data: ['4', '5', ...data.issues],
        isFetching: false,
        limit: 20,
        page: 1,
        totalCount: 0,
        error: undefined
      });
    });

    it('should reset data when ISSUES_GET_PAGE action comes with a page = 0 and status OK', () => {
      const data = { issues: ['1', '2', '3'] };
      expect(
        reducer(
          Object.assign(_cloneDeep(initialState), { data: ['4', '5'] }),
          notify.ok(ISSUES_GET_PAGE, data, { page: 0 })
        )
      ).toEqual({
        data: data.issues,
        isFetching: false,
        limit: 20,
        page: 0,
        totalCount: 0,
        error: undefined
      });
    });

    it('should process ISSUES_GET_PAGE with status NOK', () => {
      const data = new Error('Whoops');
      expect(
        reducer(
          _cloneDeep(initialState),
          notify.nok(ISSUES_GET_PAGE, data)
        )
      ).toEqual({
        data: [],
        isFetching: false,
        limit: 20,
        page: 0,
        totalCount: 0,
        error: data
      });
    });

    it('should return the same state if ISSUES_GET_PAGE comes with an unknown status', () => {
      expect(
        reducer(
          _cloneDeep(initialState),
          {
            type: ISSUES_GET_PAGE,
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
        notify.nok(ISSUES_GET_PAGE, error)
      );
      expect(nokState.error).toEqual(error);

      const okData = {
        issues: ['12', '123']
      };
      const okState = reducer(nokState, notify.ok(ISSUES_GET_PAGE, okData));
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
          notify.start(ISSUES_GET_PAGE)
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
