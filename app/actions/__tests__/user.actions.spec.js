import MockAdapter from 'axios-mock-adapter';
import * as axios from '../../../modules/request';
import * as userActions from '../user.actions';
import { notify } from '../helper';

const redmineEndpoint = 'redmine.test.com';
const token = 'multipass';
let axiosInstanceMock;
let axiosMock;

describe('User actions', () => {
  beforeAll(() => {
    axiosMock = new MockAdapter(axios.default);
    axios.initialize(redmineEndpoint, token);
    expect(axios.getInstance()).toBeTruthy();
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
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith(notify.start(userActions.USER_LOGIN));
      expect(dispatch).toBeCalledWith(notify.ok(userActions.USER_LOGIN, {
        user: {
          ...response.user,
          redmineEndpoint
        }
      }));

      // resetting, because checkLogin creates a new instance of axios if fullfilled
      axiosInstanceMock.restore();
      axios.reset();
      axios.initialize(redmineEndpoint, token);
      axiosInstanceMock = new MockAdapter(axios.getInstance());
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
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith(notify.start(userActions.USER_LOGIN));
      expect(dispatch).toBeCalledWith(notify.nok(userActions.USER_LOGIN, response));
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
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith(notify.start(userActions.USER_GET_CURRENT));
      expect(dispatch).toBeCalledWith(notify.ok(userActions.USER_GET_CURRENT, response));
    });

    it('should pass the error further with dispatch', async () => {
      const response = new Error('Whoops');
      response.status = 500;
      const dispatch = jest.fn();
      axiosInstanceMock.onGet('/users/current.json').replyOnce(() => Promise.reject(response));
      await userActions.default.getCurrent()(dispatch);
      expect(axiosInstanceMock.history.get.length).toBe(1);
      expect(axiosInstanceMock.history.get[0].url).toBe(`${redmineEndpoint}/users/current.json`);
      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith(notify.start(userActions.USER_GET_CURRENT));
      expect(dispatch).toBeCalledWith(notify.nok(userActions.USER_GET_CURRENT, new Error(`Error ${response.status} (${response.message})`)));
    });
  });

  describe('logout action', () => {
    it('should make request and return the response with correct actions', () => {
      const resetMock = jest.spyOn(axios, 'reset');
      expect(userActions.default.logout()).toEqual({ type: userActions.USER_LOGOUT });
      expect(resetMock).toHaveBeenCalled();
    });
  });
});
