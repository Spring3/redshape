import reducer, { initialState } from '../settings.reducer';

describe('Settings reducer', () => {
  it('should return the initial state by default', () => {
    expect(reducer(undefined, { type: 'NONE' })).toEqual(initialState);
  });
});
