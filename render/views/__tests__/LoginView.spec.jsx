import React from 'react';
import { HashRouter, Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { render, cleanup, wait } from '@testing-library/react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
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

  it('should match the snapshot', () => {
    const store = mockStore({ user: {} });
    const tree = renderer.create(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <LoginView />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match the snapshot when using api key', () => {
    const store = mockStore({ user: {} });
    const wrapper = mount(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <LoginView />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    );

    let inputs = wrapper.find('input');
    const checkbox = inputs.at(1);
    checkbox.simulate('change', { target: { checked: true } });
    inputs = wrapper.find('input');
    expect(inputs.length).toBe(3);
    const apiKeyInput = wrapper.find('input[name="apiKey"]');
    expect(apiKeyInput).toBeTruthy();

    expect(wrapper).toMatchSnapshot();
  });

  it('should validate the username', () => {
    const store = mockStore({ user: {} });
    const wrapper = mount(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <LoginView />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    );

    const usernameInput = wrapper.find('input[name="username"]');
    expect(usernameInput).toBeTruthy();
    usernameInput.simulate('focus');
    usernameInput.simulate('blur');
    let error = wrapper.findWhere((item) => item.text() === '"username" is not allowed to be empty');
    expect(error).toBeTruthy();
    usernameInput.simulate('change', { target: { value: 'username' }, preventDefault: () => {} });
    usernameInput.simulate('blur');
    error = wrapper.findWhere((item) => item.text() === '"username" is not allowed to be empty');
    expect(error.exists()).toBeFalsy();
    expect(store.getActions().length).toBe(0);
  });

  it('should validate the password', () => {
    const store = mockStore({ user: {} });
    const wrapper = mount(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <LoginView />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    );
    const passwordInput = wrapper.find('input[type="password"]');
    expect(passwordInput).toBeTruthy();
    passwordInput.simulate('focus');
    passwordInput.simulate('blur');
    let error = wrapper.findWhere((item) => item.text() === '"password" is not allowed to be empty');
    expect(error).toBeTruthy();
    passwordInput.simulate('change', { target: { value: 'password' } });
    error = wrapper.findWhere((item) => item.text() === '"password" is not allowed to be empty');
    expect(error.exists()).toBeFalsy();
    expect(store.getActions().length).toBe(0);
  });

  it('should validate the redmine domain input', () => {
    const store = mockStore({ user: {} });
    const wrapper = mount(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <LoginView />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    );
    const redmineInput = wrapper.find('input[name="redmineEndpoint"]');
    expect(redmineInput).toBeTruthy();
    redmineInput.simulate('focus');
    redmineInput.simulate('blur');
    let error = wrapper.findWhere((item) => item.text() === '"redmineEndpoint" is not allowed to be empty');
    expect(error).toBeTruthy();
    redmineInput.simulate('change', { target: { value: 'url' } });
    error = wrapper.findWhere((item) => item.text() === '"redmineEndpoint" must be a valid uri');
    expect(error).toBeTruthy();
    redmineInput.simulate('change', { target: { value: 'https://redmine.domain' } });
    expect(error.exists()).toBeFalsy();
    expect(store.getActions().length).toBe(0);
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
      expect(store.getActions().length).toBe(0);
      store.clearActions();
    });
  });
});

describe('[integration] LoginView', () => {
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

  it('should not make a redmine api request if the form has errors', (done) => {
    const store = mockStore({ user: {} });
    const storageSetSpy = jest.spyOn(storage, 'set');
    axiosMock.onGet('/users/current.json').reply(() => Promise.resolve([200]));
    const wrapper = mount(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <LoginView />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    );
    const form = wrapper.find('LoginView');
    expect(form.exists()).toBeTruthy();
    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.exists()).toBeTruthy();
    submitButton.simulate('submit');
    setTimeout(() => {
      expect(wrapper.findWhere((item) => /is not allowed to be empty/.test(item.text())).exists()).toBe(true);
      expect(storageSetSpy).not.toHaveBeenCalled();
      expect(store.getActions().length).toBe(0);
      storageSetSpy.mockRestore();
      done();
    }, 100);
  });

  it('should make a redmine api request on submit', (done) => {
    const store = mockStore({ user: {} });
    const wrapper = mount(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <LoginView />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    );
    const form = wrapper.find('LoginView');
    expect(form.exists()).toBeTruthy();

    const userData = {
      id: '123',
      firstname: 'test',
      lastname: 'user',
      api_key: 'api_key'
    };

    expect(wrapper.exists('button[type="submit"]')).toBe(true);

    const inputs = wrapper.find('input');
    expect(inputs.length).toBe(4);
    const redmineEndpointInput = inputs.at(0);
    const checkbox = inputs.at(1);
    const usernameInput = inputs.at(2);
    const passwordInput = inputs.at(3);
    expect(checkbox.prop('name')).toBe('loginMode');
    expect(usernameInput.prop('name')).toBe('username');
    expect(passwordInput.prop('name')).toBe('password');
    expect(redmineEndpointInput.prop('name')).toBe('redmineEndpoint');

    const returnedValues = {
      username: 'username',
      password: 'password',
      redmineEndpoint: 'https://redmine.domain'
    };

    axiosMock.onGet('/users/current.json').reply(() => Promise.resolve([200, { user: userData }]));

    wrapper.find('input[name="username"]').simulate('change', { persist: () => {}, target: { value: returnedValues.username, name: 'username' } });
    wrapper.find('input[name="password"]').simulate('change', { persist: () => {}, target: { value: returnedValues.password, name: 'password' } });
    wrapper.find('input[name="redmineEndpoint"]').simulate('change', { persist: () => {}, target: { name: 'redmineEndpoint', value: returnedValues.redmineEndpoint } });
    expect(wrapper.find('input[name="username"]').prop('value')).toBe(returnedValues.username);
    expect(wrapper.find('input[name="password"]').prop('value')).toBe(returnedValues.password);
    expect(wrapper.find('input[name="redmineEndpoint"]').prop('value')).toBe(returnedValues.redmineEndpoint);
    wrapper.find('LoginView__LoginForm').simulate('submit', { preventDefault: () => {} });

    setTimeout(() => {
      wrapper.update();
      expect(wrapper.findWhere((item) => /is not allowed to be empty/.test(item.text())).length).toBe(0);

      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe(`${returnedValues.redmineEndpoint}/users/current.json`);
      expect(axiosMock.history.get[0].headers.Authorization).toBe(`Basic ${btoa(`${returnedValues.username}:${returnedValues.password}`)}`);

      expect(store.getActions().length).toBe(3);
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

  it('should display the error if one raised during the request', async () => {
    // simulating error since reducers are not called
    const store = mockStore({ user: { loginError: new Error('Something went wrong') } });
    const loginActionSpy = jest.spyOn(actions.user, 'checkLogin');
    const wrapper = mount(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <LoginView />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    );
    const form = wrapper.find('LoginView');
    expect(form.exists()).toBeTruthy();

    const expectedError = new Error('Something went wrong');

    const returnedValues = {
      username: 'username',
      password: 'password',
      redmineEndpoint: 'https://redmine.domain'
    };

    axiosMock.onGet(`${returnedValues}/users/current.json`).reply(() => Promise.reject(expectedError));

    wrapper.find('input[name="username"]').simulate('change', { persist: () => {}, target: { value: returnedValues.username, name: 'username' } });
    wrapper.find('input[name="password"]').simulate('change', { persist: () => {}, target: { value: returnedValues.password, name: 'password' } });
    wrapper.find('input[name="redmineEndpoint"]').simulate('change', { persist: () => {}, target: { name: 'redmineEndpoint', value: returnedValues.redmineEndpoint } });
    expect(wrapper.find('input[name="username"]').prop('value')).toBe(returnedValues.username);
    expect(wrapper.find('input[name="password"]').prop('value')).toBe(returnedValues.password);
    expect(wrapper.find('input[name="redmineEndpoint"]').prop('value')).toBe(returnedValues.redmineEndpoint);

    wrapper.find('button[type="submit"]').simulate('click', { preventDefault: () => {} });

    setTimeout(() => {
      wrapper.update();
      expect(loginActionSpy).toHaveBeenCalledWith(returnedValues);
      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe(`${returnedValues.redmineEndpoint}/users/current.json`);
      expect(axiosMock.history.get[0].headers.Authorization).toBe(`Basic ${btoa(`${returnedValues.username}:${returnedValues.password}`)}`);

      expect(wrapper.findWhere((item) => /Something went wrong/.test(item.text())).length).toBeGreaterThan(0);
      const reduxActions = store.getActions();
      expect(reduxActions.length).toBe(2);
      expect(reduxActions[0]).toEqual(notify.start(USER_LOGIN));
      expect(reduxActions[1]).toEqual(notify.nok(USER_LOGIN, expectedError));

      store.clearActions();
      loginActionSpy.mockRestore();
    }, 200);
  });
});
