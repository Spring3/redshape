import React from 'react';
import { HashRouter, Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { render, cleanup, fireEvent, wait } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureStore from 'redux-mock-store';
import { ThemeProvider } from 'styled-components';
import MockAdapter from 'axios-mock-adapter';

import actions from '../../actions';
import { USER_LOGIN } from '../../actions/user.actions';
import { notify } from '../../actions/helper';
import storage from '../../../common/storage';
import axios from '../../../common/request';

import theme from '../../theme';
import LoginView from '../LoginView';

let axiosMock;

const mockStore = configureStore([thunk]);

describe('Login view', () => {
  beforeAll(() => {
    axiosMock = new MockAdapter(axios.default);
  });

  afterEach(() => {
    cleanup();
    axiosMock.reset();
    storage.clear();
  });

  afterAll(() => {
    axiosMock.restore();
    axios.reset();
  });

  it('should redirect to the AppView if user credentials already exist', async () => {
    const storeData = {
      user: {
        id: 1,
        firstname: 'firstname',
        lastname: 'lastname',
        api_key: 'api_key',
        redmineEndpoint: 'https://redmine.domain'
      }
    };
    const store = mockStore(storeData);
    const historyMock = {
      location: {
        pathname: '/'
      },
      listen: () => () => {},
      push: jest.fn()
    };

    render(
      <Provider store={store}>
        <Router history={historyMock}>
          <ThemeProvider theme={theme}>
            <LoginView />
          </ThemeProvider>
        </Router>
      </Provider>
    );
    await wait(() => {
      expect(store.getActions()).toHaveLength(0);
      store.clearActions();
    });
  });

  it('should not make a redmine api request if the form has errors', (done) => {
    const store = mockStore({ user: {} });
    const storageSetSpy = jest.spyOn(storage, 'set');
    axiosMock.onGet('/users/current.json').reply(() => Promise.resolve([200]));
    const { getAllByText } = render(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <LoginView />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    );
    const form = document.querySelector('form');
    expect(form).toBeDefined();
    const submitButton = document.querySelector('button[type="submit"]');
    expect(submitButton).toBeTruthy();
    fireEvent.submit(submitButton);
    setTimeout(() => {
      expect(getAllByText(/is not allowed to be empty$/).length).toBeGreaterThan(0);
      expect(storageSetSpy).not.toHaveBeenCalled();
      expect(store.getActions()).toHaveLength(0);
      storageSetSpy.mockRestore();
      done();
    }, 100);
  });

  it('should make a redmine api request on submit', (done) => {
    const store = mockStore({ user: {} });
    const { queryAllByText } = render(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <LoginView />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    );
    const form = document.querySelector('form');
    expect(form).toBeTruthy();

    const userData = {
      id: '123',
      firstname: 'test',
      lastname: 'user',
      api_key: 'api_key'
    };

    expect(document.querySelector('button[type="submit"]')).toBeDefined();

    const inputs = document.querySelectorAll('input');
    expect(inputs).toHaveLength(4);
    const redmineEndpointInput = inputs[0];
    const checkbox = inputs[1];
    const usernameInput = inputs[2];
    const passwordInput = inputs[3];
    expect(checkbox).toHaveAttribute('name', 'loginMode');
    expect(usernameInput).toHaveAttribute('name', 'username');
    expect(passwordInput).toHaveAttribute('name', 'password');
    expect(redmineEndpointInput).toHaveAttribute('name', 'redmineEndpoint');

    const returnedValues = {
      username: 'username',
      password: 'password',
      redmineEndpoint: 'https://redmine.domain'
    };

    axiosMock.onGet('/users/current.json').reply(() => Promise.resolve([200, { user: userData }]));

    fireEvent.change(usernameInput, { persist: () => {}, target: { value: returnedValues.username, name: 'username' } });
    fireEvent.change(passwordInput, { persist: () => {}, target: { value: returnedValues.password, name: 'password' } });
    fireEvent.change(redmineEndpointInput, { persist: () => {}, target: { name: 'redmineEndpoint', value: returnedValues.redmineEndpoint } });
    expect(usernameInput).toHaveValue(returnedValues.username);
    expect(passwordInput).toHaveValue(returnedValues.password);
    expect(redmineEndpointInput).toHaveValue(returnedValues.redmineEndpoint);
    fireEvent.submit(document.querySelector('button[type="submit"]'), { preventDefault: () => {} });

    setTimeout(() => {
      expect(queryAllByText('is not allowed to be empty')).toHaveLength(0);

      expect(axiosMock.history.get).toHaveLength(1);
      expect(axiosMock.history.get[0].url).toBe('/users/current.json');
      expect(axiosMock.history.get[0].headers.Authorization).toBe(`Basic ${btoa(`${returnedValues.username}:${returnedValues.password}`)}`);

      expect(store.getActions()).toHaveLength(3);
      expect(store.getActions()[0]).toEqual(notify.start(USER_LOGIN));
      expect(store.getActions()[1]).toEqual(notify.ok(USER_LOGIN, {
        user: {
          ...userData,
          redmineEndpoint: returnedValues.redmineEndpoint
        }
      }));

      store.clearActions();
      done();
    }, 200);
  });

  it('should make a redmine api request on submit using api token', (done) => {
    const store = mockStore({ user: {} });
    const { queryAllByText } = render(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <LoginView />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    );
    const form = document.querySelector('form');
    expect(form).toBeTruthy();

    const userData = {
      id: '123',
      firstname: 'test',
      lastname: 'user',
      api_key: 'api_key'
    };

    expect(document.querySelector('button[type="submit"]')).toBeDefined();

    fireEvent.click(document.querySelector('input[name="loginMode"]'));

    const inputs = document.querySelectorAll('input');
    expect(inputs).toHaveLength(3);
    const redmineEndpointInput = inputs[0];
    const checkboxMode = inputs[1];
    const apiKeyInput = inputs[2];
    expect(redmineEndpointInput).toHaveAttribute('name', 'redmineEndpoint');
    expect(apiKeyInput).toHaveAttribute('name', 'apiKey');
    expect(checkboxMode).toHaveAttribute('name', 'loginMode');

    const returnedValues = {
      apiKey: '123',
      useApiKey: true,
      username: 'username',
      password: 'password',
      redmineEndpoint: 'https://redmine.domain'
    };

    axiosMock.onGet('/users/current.json').reply(() => Promise.resolve([200, { user: userData }]));

    fireEvent.change(apiKeyInput, { persist: () => {}, target: { value: returnedValues.apiKey, name: 'apiKey' } });
    fireEvent.change(redmineEndpointInput, { persist: () => {}, target: { name: 'redmineEndpoint', value: returnedValues.redmineEndpoint } });
    expect(apiKeyInput).toHaveValue(returnedValues.apikey);
    expect(redmineEndpointInput).toHaveValue(returnedValues.redmineEndpoint);
    fireEvent.submit(document.querySelector('button[type="submit"]'), { preventDefault: () => {} });

    setTimeout(() => {
      expect(queryAllByText('is not allowed to be empty')).toHaveLength(0);

      expect(axiosMock.history.get).toHaveLength(1);
      expect(axiosMock.history.get[0].url).toBe('/users/current.json');
      expect(axiosMock.history.get[0].headers['X-Redmine-API-Key']).toBe(returnedValues.apiKey);
      expect(store.getActions()).toHaveLength(3);
      expect(store.getActions()[0]).toEqual(notify.start(USER_LOGIN));
      expect(store.getActions()[1]).toEqual(notify.ok(USER_LOGIN, {
        user: {
          ...userData,
          redmineEndpoint: returnedValues.redmineEndpoint
        }
      }));

      store.clearActions();
      done();
    }, 200);
  });

  it('should display the error if one raised during the request', (done) => {
    // simulating error since reducers are not called
    const store = mockStore({ user: { loginError: new Error('Something went wrong') } });
    const loginActionSpy = jest.spyOn(actions.user, 'checkLogin');
    const { queryAllByText } = render(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <LoginView />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    );
    const form = document.querySelector('form');
    expect(form).toBeTruthy();

    const expectedError = new Error('Something went wrong');

    const returnedValues = {
      apiKey: '',
      useApiKey: false,
      username: 'username',
      password: 'password',
      redmineEndpoint: 'https://redmine.domain'
    };

    axiosMock.onGet('/users/current.json').reply(() => Promise.reject(expectedError));

    fireEvent.change(document.querySelector('input[name="username"]'), { persist: () => {}, target: { value: returnedValues.username, name: 'username' } });
    fireEvent.change(document.querySelector('input[name="password"]'), { persist: () => {}, target: { value: returnedValues.password, name: 'password' } });
    fireEvent.change(document.querySelector('input[name="redmineEndpoint"]'), { persist: () => {}, target: { name: 'redmineEndpoint', value: returnedValues.redmineEndpoint } });
    expect(document.querySelector('input[name="username"]')).toHaveValue(returnedValues.username);
    expect(document.querySelector('input[name="password"]')).toHaveValue(returnedValues.password);
    expect(document.querySelector('input[name="redmineEndpoint"]')).toHaveValue(returnedValues.redmineEndpoint);

    fireEvent.click(document.querySelector('button[type="submit"]'), { preventDefault: () => {} });

    setTimeout(() => {
      expect(loginActionSpy).toHaveBeenCalledWith(returnedValues);
      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe('/users/current.json');
      expect(axiosMock.history.get[0].headers.Authorization).toBe(`Basic ${btoa(`${returnedValues.username}:${returnedValues.password}`)}`);

      expect(queryAllByText('Something went wrong').length).toBeGreaterThan(0);
      const reduxActions = store.getActions();
      expect(reduxActions).toHaveLength(2);
      expect(reduxActions[0]).toEqual(notify.start(USER_LOGIN));
      expect(reduxActions[1]).toEqual(notify.nok(USER_LOGIN, new Error(`Error (${expectedError.message})`)));

      store.clearActions();
      loginActionSpy.mockRestore();
      done();
    }, 200);
  });
});
