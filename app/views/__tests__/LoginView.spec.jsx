import React from 'react';
import { HashRouter, Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { render, fireEvent, cleanup, wait } from 'react-testing-library';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';

import actions from '../../actions';
import { USER_LOGIN } from '../../actions/user.actions';
import { notify } from '../../actions/helper';

jest.mock('electron-store');

import storage from '../../../modules/storage';
import LoginView from '../LoginView';

const mockStore = configureStore([thunk]);

describe('Login view', () => {
  afterEach(() => {
    cleanup();
    fetch.resetMocks();
    storage.clear();
  });

  it('should render the link to github', () => {
    const store = mockStore({ user: {} });
    render(
      <Provider store={store}>
        <HashRouter><LoginView /></HashRouter>
      </Provider>
    );
    const link = document.querySelector('a[href="https://github.com/Spring3/redtime"]');
    expect(link).toBeTruthy();
    expect(store.getActions().length).toBe(0);

    store.clearActions();
  });

  it('should render the form', () => {
    const store = mockStore({ user: {} });
    render(
      <Provider store={store}>
        <HashRouter><LoginView /></HashRouter>
      </Provider>
    );
    const form = document.querySelector('form');
    expect(form).toBeTruthy();

    const usernameInput = form.querySelector('input[name="username"]');
    expect(usernameInput).toBeTruthy();
    expect(usernameInput.getAttribute('type')).toBe('text');

    const passwordInput = form.querySelector('input[type="password"]');
    expect(passwordInput).toBeTruthy();
    expect(passwordInput.getAttribute('name')).toBe('password');

    const redmineEndpointInput = form.querySelector('input[name="redmineEndpoint"]');
    expect(redmineEndpointInput).toBeTruthy();
    expect(redmineEndpointInput.getAttribute('type')).toBe('text');

    const submitButton = form.querySelector('button[type="submit"]');
    expect(submitButton).toBeTruthy();
    expect(submitButton.innerHTML).toBe('Submit');
    expect(store.getActions().length).toBe(0);

    store.clearActions();
  });

  it('should render the copyrights', () => {
    const store = mockStore({ user: {} });
    const { getByText } = render(
      <Provider store={store}>
        <HashRouter><LoginView /></HashRouter>
      </Provider>
    );
    const copyrights = getByText('Created by');
    expect(copyrights).toBeTruthy();
    const link = copyrights.querySelector('a');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBeTruthy();
    expect(link.innerHTML).toBe('Daniyil Vasylenko');
    expect(store.getActions().length).toBe(0);

    store.clearActions();
  });

  it('should validate the username', () => {
    const store = mockStore({ user: {} });
    const { getByText } = render(
      <Provider store={store}>
        <HashRouter><LoginView /></HashRouter>
      </Provider>
    );
    const usernameInput = document.querySelector('input[name="username"]');
    expect(usernameInput).toBeTruthy();
    fireEvent.focus(usernameInput);
    fireEvent.blur(usernameInput);
    let error;
    return wait(() => {
      error = getByText('"username" is not allowed to be empty');
      expect(error).toBeTruthy();
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }).then(() => wait(() => {
      expect(error.innerHTML).toBeFalsy();
      expect(store.getActions().length).toBe(0);

      store.clearActions();
    }));
  });

  it('should validate the password', () => {
    const store = mockStore({ user: {} });
    const { getByText } = render(
      <Provider store={store}>
        <HashRouter><LoginView /></HashRouter>
      </Provider>
    );
    const passwordInput = document.querySelector('input[type="password"]');
    expect(passwordInput).toBeTruthy();
    fireEvent.focus(passwordInput);
    fireEvent.blur(passwordInput);
    let error;
    return wait(() => {
      error = getByText('"password" is not allowed to be empty');
      expect(error).toBeTruthy();
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    }).then(() => wait(() => {
      expect(error.innerHTML).toBeFalsy();
      expect(store.getActions().length).toBe(0);

      store.clearActions();
    }));
  });

  it('should validate the redmine domain input', () => {
    const store = mockStore({ user: {} });
    const { getByText } = render(
      <Provider store={store}>
        <HashRouter><LoginView /></HashRouter>
      </Provider>
    );
    const redmineInput = document.querySelector('input[name="redmineEndpoint"]');
    expect(redmineInput).toBeTruthy();
    fireEvent.focus(redmineInput);
    fireEvent.blur(redmineInput);
    let error;
    return wait(() => {
      error = getByText('"redmineEndpoint" is not allowed to be empty');
      expect(error).toBeTruthy();
      fireEvent.change(redmineInput, { target: { value: 'url' } });
    }).then(() => wait(() => {
      error = getByText('"redmineEndpoint" must be a valid uri');
      expect(error).toBeTruthy();
      fireEvent.change(redmineInput, { target: { value: 'https://redmine.domain' } });
    }).then(() => wait(() => {
      expect(error.innerHTML).toBeFalsy();
      expect(store.getActions().length).toBe(0);

      store.clearActions();
    })));
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
        <Router history={historyMock}><LoginView /></Router>
      </Provider>
    );
    await wait(() => {
      expect(store.getActions().length).toBe(0);
      store.clearActions();
    });
  });
});

describe('[integration] LoginView', () => {
  afterEach(() => {
    fetch.resetMocks();
    storage.clear();
  });

  it('should not make a redmine api request if the form has errors', (done) => {
    const store = mockStore({ user: {} });
    const storageSetSpy = jest.spyOn(storage, 'set');
    const wrapper = mount(
      <Provider store={store}>
        <HashRouter><LoginView /></HashRouter>
      </Provider>
    );
    const form = wrapper.find('LoginView');
    expect(form.exists()).toBeTruthy();
    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.exists()).toBeTruthy();
    submitButton.simulate('submit');
    setTimeout(() => {
      const error = wrapper.find('ErrorMessage').findWhere(item => /is not allowed to be empty/.test(item.text()));
      expect(error.exists()).toBeTruthy();
      expect(storageSetSpy).not.toHaveBeenCalled();
      expect(store.getActions().length).toBe(0);

      storageSetSpy.mockRestore();
      store.clearActions();
      done();
    }, 100);
  });

  it('should make a redmine api request on submit', (done) => {
    const store = mockStore({ user: {} });
    const loginActionSpy = jest.spyOn(actions.user, 'checkLogin');
    const wrapper = mount(
      <Provider store={store}>
        <HashRouter><LoginView /></HashRouter>
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
    fetch.mockResponseOnce(JSON.stringify({ user: userData }));

    const submit = wrapper.find('button[type="submit"]');
    expect(submit.exists()).toBeTruthy();

    const inputs = wrapper.find('input');
    expect(inputs.length).toBe(3);
    const usernameInput = inputs.at(0);
    const passwordInput = inputs.at(1);
    const redmineEndpointInput = inputs.at(2);
    expect(usernameInput.prop('name')).toBe('username');
    expect(passwordInput.prop('name')).toBe('password');
    expect(redmineEndpointInput.prop('name')).toBe('redmineEndpoint');

    const returnedValues = {
      username: 'username',
      password: 'password',
      redmineEndpoint: 'https://redmine.domain'
    };

    usernameInput.simulate('change', { persist: () => {}, target: { value: returnedValues.username, name: 'username' } });
    passwordInput.simulate('change', { persist: () => {}, target: { value: returnedValues.password, name: 'password' } });
    redmineEndpointInput.simulate('change', { persist: () => {}, target: { name: 'redmineEndpoint', value: returnedValues.redmineEndpoint } });
    expect(wrapper.find('input[name="username"]').prop('value')).toBe(returnedValues.username);
    expect(wrapper.find('input[name="password"]').prop('value')).toBe(returnedValues.password);
    expect(wrapper.find('input[name="redmineEndpoint"]').prop('value')).toBe(returnedValues.redmineEndpoint);

    submit.simulate('submit');

    setTimeout(() => {
      wrapper.update();
      const errors = wrapper.find('ErrorMessage').findWhere(item => /is not allowed to be empty/.test(item.text()));
      expect(errors.exists()).toBeFalsy();

      expect(fetch.mock.calls.length).toBe(1);
      expect(fetch.mock.calls[0][0]).toBe(`${returnedValues.redmineEndpoint}/users/current.json`);
      expect(fetch.mock.calls[0][1].headers.Authorization).toBe(`Basic ${btoa(`${returnedValues.username}:${returnedValues.password}`)}`);
      expect(fetch.mock.calls[0][1].method).toBe('GET');

      expect(loginActionSpy).toHaveBeenCalledWith(returnedValues);
      const reduxActions = store.getActions();
      expect(reduxActions.length).toBe(2);
      expect(reduxActions[0]).toEqual(notify.start(USER_LOGIN));
      expect(reduxActions[1]).toEqual(notify.ok(USER_LOGIN, {
        user: {
          ...userData,
          redmineEndpoint: returnedValues.redmineEndpoint
        }
      }));

      store.clearActions();
      loginActionSpy.mockRestore();
      done();
    }, 100);
  });

  it('should display the error if one raised during the request', async () => {
    // simulating error since reducers are not called
    const store = mockStore({ user: { loginError: new Error('Something went wrong') } });
    const loginActionSpy = jest.spyOn(actions.user, 'checkLogin');
    const wrapper = mount(
      <Provider store={store}>
        <HashRouter><LoginView /></HashRouter>
      </Provider>
    );
    const form = wrapper.find('LoginView');
    expect(form.exists()).toBeTruthy();

    const expectedError = new Error('Something went wrong');

    fetch.mockReject(expectedError);

    const inputs = wrapper.find('input');
    expect(inputs.length).toBe(3);
    const usernameInput = inputs.at(0);
    const passwordInput = inputs.at(1);
    const redmineEndpointInput = inputs.at(2);
    expect(usernameInput.prop('name')).toBe('username');
    expect(passwordInput.prop('name')).toBe('password');
    expect(redmineEndpointInput.prop('name')).toBe('redmineEndpoint');

    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.exists()).toBeTruthy();

    const returnedValues = {
      username: 'username',
      password: 'password',
      redmineEndpoint: 'https://redmine.domain'
    };

    usernameInput.simulate('change', { persist: () => {}, target: { value: returnedValues.username, name: 'username' } });
    passwordInput.simulate('change', { persist: () => {}, target: { value: returnedValues.password, name: 'password' } });
    redmineEndpointInput.simulate('change', { persist: () => {}, target: { name: 'redmineEndpoint', value: returnedValues.redmineEndpoint } });
    expect(wrapper.find('input[name="username"]').prop('value')).toBe(returnedValues.username);
    expect(wrapper.find('input[name="password"]').prop('value')).toBe(returnedValues.password);
    expect(wrapper.find('input[name="redmineEndpoint"]').prop('value')).toBe(returnedValues.redmineEndpoint);

    submitButton.simulate('submit');

    await wait(() => {
      wrapper.update();
      expect(loginActionSpy).toHaveBeenCalledWith(returnedValues);
      expect(fetch.mock.calls.length).toBe(1);
      expect(fetch.mock.calls[0][0]).toBe(`${returnedValues.redmineEndpoint}/users/current.json`);
      expect(fetch.mock.calls[0][1].headers.Authorization).toBe(`Basic ${btoa(`${returnedValues.username}:${returnedValues.password}`)}`);
      expect(fetch.mock.calls[0][1].method).toBe('GET');

      const error = wrapper.find('ErrorMessage').findWhere(item => /Something went wrong/.test(item.text()));
      expect(error.exists()).toBeTruthy();
      const reduxActions = store.getActions();
      expect(reduxActions.length).toBe(2);
      expect(reduxActions[0]).toEqual(notify.start(USER_LOGIN));
      expect(reduxActions[1]).toEqual(notify.nok(USER_LOGIN, expectedError));

      store.clearActions();
      loginActionSpy.mockRestore();
    });
  });
});
