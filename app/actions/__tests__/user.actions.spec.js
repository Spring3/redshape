import MockAdapter from 'axios-mock-adapter';
import * as axios from '../../../modules/request';
import * as userActions from '../user.actions';
import { notify } from '../helper';
import settingsActions from '../settings.actions';

const redmineEndpoint = 'redmine.test.com';
const token = 'multipass';
let axiosInstanceMock;
let axiosMock;

describe('User actions', () => {
  beforeAll(() => {
    axiosMock = new MockAdapter(axios.default);
    axios.initialize(redmineEndpoint, token);
    axiosInstanceMock = new MockAdapter(axios.getInstance());
  });

  afterAll(() => {
    axiosInstanceMock.restore();
    axiosMock.restore();
    axios.reset();
  });

  afterEach(() => {
    axiosInstanceMock.reset();
    axiosMock.reset();
  });

  it('should expose all the necessary actions', () => {
    expect(userActions).toBeTruthy();
    expect(userActions.USER_LOGIN).toBeTruthy();
    expect(userActions.USER_LOGOUT).toBeTruthy();
    expect(userActions.USER_GET_CURRENT).toBeTruthy();

    expect(userActions.default.checkLogin).toBeTruthy();
    expect(userActions.default.getCurrent).toBeTruthy();
    expect(userActions.default.logout).toBeTruthy();
  });

  describe('checkLogin action', () => {
    it('should make request and return the response with correct actions', async () => {
      const response = {
        user: {}
      };
      const username = 'usernae';
      const password = 'password';

      const settingsRestoreSpy = jest.spyOn(settingsActions, 'restore');
      const dispatch = jest.fn();
      axiosMock.onGet('/users/current.json').replyOnce(() => Promise.resolve([200, response]));

      await userActions.default.checkLogin({
        username,
        password,
        redmineEndpoint
      })(dispatch);
      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe(`${redmineEndpoint}/users/current.json`);
      expect(axiosMock.history.get[0].headers.Authorization).toBe(`Basic ${btoa(`${username}:${password}`)}`);
      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch).toHaveBeenCalledWith(notify.start(userActions.USER_LOGIN));
      expect(dispatch).toHaveBeenCalledWith(notify.ok(userActions.USER_LOGIN, {
        user: {
          ...response.user,
          redmineEndpoint
        }
      }));
      expect(settingsRestoreSpy).toHaveBeenCalled();

      // resetting, because checkLogin creates a new instance of axios if fullfilled
      axiosInstanceMock.restore();
      axios.reset();
      axios.initialize(redmineEndpoint, token);
      axiosInstanceMock = new MockAdapter(axios.getInstance());
      settingsRestoreSpy.mockRestore();
    });

    it('should pass the error further with dispatch', async () => {
      const response = new Error('Whoops');
      response.status = 500;
      const username = 'username';
      const password = 'password';
      const dispatch = jest.fn();
      axiosMock.onGet('/users/current.json').replyOnce(() => Promise.reject(response));
      await userActions.default.checkLogin({ redmineEndpoint, username, password })(dispatch);
      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe(`${redmineEndpoint}/users/current.json`);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenCalledWith(notify.start(userActions.USER_LOGIN));
      expect(dispatch).toHaveBeenCalledWith(notify.nok(userActions.USER_LOGIN, response));
    });
  });

  describe('getCurrent action', () => {
    it('should make request and return the response with correct actions', async () => {
      const response = {
        user: {}
      };
      const dispatch = jest.fn();
      expect(axios.getInstance());
      axiosInstanceMock.onGet('/users/current.json').replyOnce(() => Promise.resolve([200, response]));
      await userActions.default.getCurrent()(dispatch);
      expect(axiosInstanceMock.history.get.length).toBe(1);
      expect(axiosInstanceMock.history.get[0].url).toBe(`${redmineEndpoint}/users/current.json`);
      expect(axiosInstanceMock.history.get[0].headers['X-Redmine-API-Key']).toBe(token);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenCalledWith(notify.start(userActions.USER_GET_CURRENT));
      expect(dispatch).toHaveBeenCalledWith(notify.ok(userActions.USER_GET_CURRENT, response));
    });

    it('should pass the error further with dispatch', async () => {
      const response = new Error('Whoops');
      response.status = 500;
      const dispatch = jest.fn();
      axiosInstanceMock.onGet('/users/current.json').replyOnce(() => Promise.reject(response));
      await userActions.default.getCurrent()(dispatch);
      expect(axiosInstanceMock.history.get.length).toBe(1);
      expect(axiosInstanceMock.history.get[0].url).toBe(`${redmineEndpoint}/users/current.json`);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenCalledWith(notify.start(userActions.USER_GET_CURRENT));
      expect(dispatch).toHaveBeenCalledWith(notify.nok(userActions.USER_GET_CURRENT, new Error(`Error ${response.status} (${response.message})`)));
    });
  });

  describe('logout action', () => {
    it('should make request and return the response with correct actions', () => {
      const resetSpy = jest.spyOn(axios, 'reset');
      const dispatch = jest.fn();
      const settingsBackupSpy = jest.spyOn(settingsActions, 'backup');
      userActions.default.logout()(dispatch);
      expect(dispatch).toHaveBeenCalledWith({ type: userActions.USER_LOGOUT });
      expect(settingsBackupSpy).toHaveBeenCalled();
      expect(resetSpy).toHaveBeenCalled();
      resetSpy.mockRestore();
      settingsBackupSpy.mockRestore();
    });
  });
});
