import reducer from '../user.reducer';
import { USER_LOGIN, USER_LOGOUT } from '../../actions/user.actions';
import actions from '../../actions';
import { notify } from '../../actions/helper';

jest.mock('electron-store');

import storage from '../../../common/storage';

describe('User reducer', () => {
  const initialState = {
    isFetching: false,
    loginError: undefined,
    id: undefined,
    firstname: undefined,
    lastname: undefined,
    redmineEndpoint: undefined,
    api_key: undefined
  };

  it('should return the initial state by default', () => {
    expect(reducer(undefined, { type: 'NONE' })).toEqual(initialState);
  });

  describe('USER_LOGIN action', () => {
    afterEach(storage.clear);

    it('should set isFetching to true during status START', () => {
      expect(reducer(initialState, notify.start(USER_LOGIN))).toEqual({
        ...initialState,
        isFetching: true
      });
    });

    it('should get user data and put it in storage on OK', () => {
      const storageSetSpy = jest.spyOn(storage, 'set');
      const data = {
        user: {
          id: 1,
          firstname: 'firstname',
          lastname: 'lastname',
          redmineEndpoint: 'https://redmine.domain',
          api_key: '123abc'
        }
      };
      expect(reducer(initialState, notify.ok(USER_LOGIN, data))).toEqual({
        ...initialState,
        id: data.user.id,
        name: `${data.user.firstname} ${data.user.lastname}`,
        redmineEndpoint: data.user.redmineEndpoint,
        api_key: data.user.api_key
      });
      expect(storageSetSpy).toHaveBeenCalledWith('user', {
        id: data.user.id,
        name: `${data.user.firstname} ${data.user.lastname}`,
        redmineEndpoint: data.user.redmineEndpoint,
        api_key: data.user.api_key
      });

      storageSetSpy.mockRestore();
    });

    it('should set error on NOK', () => {
      const error = new Error('ERROR');
      expect(reducer(initialState, notify.nok(USER_LOGIN, error))).toEqual({
        ...initialState,
        loginError: error
      });
    });
  });

  describe('USER_LOGOUT action', () => {
    it('should wipe the storage leaving only settings', () => {
      const storageGetSpy = jest.spyOn(storage, 'get').mockImplementation(() => ({
        cors: true,
        theme: 'dark'
      }));
      const storageSetSpy = jest.spyOn(storage, 'set');
      const storageClearSpy = jest.spyOn(storage, 'clear');

      const defaultState = {
        isFetching: false,
        loginError: undefined,
        id: 1,
        firstname: 'firstname',
        lastname: 'lastname',
        redmineEndpoint: 'https://redmine.domain',
        api_key: '123abc'
      };
      expect(
        reducer(
          defaultState,
          {
            type: USER_LOGOUT
          }
        )
      );

      expect(storageGetSpy).toHaveBeenCalledWith('settings');
      expect(storageClearSpy).toHaveBeenCalled();
      expect(storageSetSpy).toHaveBeenCalledWith('settings', {
        cors: true,
        theme: 'dark'
      });

      storageGetSpy.mockRestore();
      storageClearSpy.mockRestore();
      storageSetSpy.mockRestore();
    });
  });
});
