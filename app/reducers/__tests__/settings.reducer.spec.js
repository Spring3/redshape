import reducer from '../settings.reducer';
import actions from '../../actions';

describe('Settings reducer', () => {
  it('should return the initial state by default', () => {
    expect(reducer(undefined, { type: 'NONE' })).toEqual({});
  });

  it('should update the state in UPDATE_SETTINGS action', () => {
    const data = { CORS: true };
    expect(reducer({ theme: 'DARK' }, actions.settings.update(data))).toEqual({ theme: 'DARK', CORS: true });
  });
});
