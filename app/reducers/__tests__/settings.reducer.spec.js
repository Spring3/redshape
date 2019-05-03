import reducer, { initialState } from '../settings.reducer';
import actions from '../../actions';

describe('Settings reducer', () => {
  it('should return the initial state by default', () => {
    expect(reducer(undefined, { type: 'NONE' })).toEqual(initialState);
  });
});
