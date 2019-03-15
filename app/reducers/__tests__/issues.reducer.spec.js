import reducer from '../issues.reducer';
import { ISSUES_GET_ALL } from '../../actions/issues.actions';
import { notify } from '../../actions/helper';

describe('issues reducer', () => {
  it('should return state if a given action does not match the filters', () => {
    expect(reducer(undefined, { type: 'WEIRD' })).toEqual({
      all: {
        data: [],
        fetchedOffset: 0,
        isFetching: false,
        error: undefined
      }
    });
  });

  describe('ISSUES_GET_ALL action', () => {
    const initialState = {
      all: {
        data: [],
        fetchedOffset: 0,
        isFetching: false,
        error: undefined
      }
    };

    it('should process ISSUES_GET_ALL with status START', () => {
      expect(reducer(initialState, notify.start(ISSUES_GET_ALL))).toEqual({
        all: {
          data: [],
          fetchedOffset: 0,
          isFetching: true,
          error: undefined
        }
      });
    });

    it('should process ISSUES_GET_ALL with status OK', () => {
      const data = { issues: ['1', '2', '3'] };
      expect(reducer(initialState, notify.ok(ISSUES_GET_ALL, data))).toEqual({
        all: {
          data: data.issues,
          fetchedOffset: 0,
          isFetching: false,
          error: undefined
        }
      });
    });

    it('should process ISSUES_GET_ALL with status NOK', () => {
      const data = new Error('Whoops');
      expect(reducer(initialState, notify.nok(ISSUES_GET_ALL, data))).toEqual({
        all: {
          data: [],
          fetchedOffset: 0,
          isFetching: false,
          error: data
        }
      });
    });

    it('should return the same state if ISSUES_GET_ALL comes with an unknown status', () => {
      expect(reducer(initialState, {
        type: ISSUES_GET_ALL,
        status: 'UNKNOWN',
        data: {
          issues: ['1', '2']
        }
      })).toEqual(initialState);
    });

    it('should reset error on OK after NOK', () => {
      const error = new Error('Oh my!');
      const nokState = reducer(initialState, notify.nok(ISSUES_GET_ALL, error));
      expect(nokState.all.error).toEqual(error);

      const okData = {
        issues: ['12', '123']
      };
      const okState = reducer(nokState, notify.ok(ISSUES_GET_ALL, okData));
      expect(okState.all.error).toBe(undefined);
      expect(okState.all.data).toEqual(okData.issues);
    });

    it('should not reset error or issues after START', () => {
      const defaultState = {
        all: {
          ...initialState.all,
          error: new Error('WRONG!'),
          data: [1, 2, 3, 4, 5]
        }
      };
      expect(reducer(defaultState, notify.start(ISSUES_GET_ALL))).toEqual({
        all: {
          ...defaultState.all,
          isFetching: true
        }
      });
    });
  });
});
