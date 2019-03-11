import React from 'react';
import { HashRouter, Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { render, fireEvent, cleanup, wait } from 'react-testing-library';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';

import actions from '../../actions';

jest.mock('electron-store');

import storage from '../../../modules/storage';
import LoginView from '../LoginView';

const mockStore = configureStore();

describe('Login view', () => {
  afterEach(() => {
    cleanup();
    fetch.resetMocks();
    storage.clear();
  });

  it('should check the storage for user credentials', () => {
    const store = mockStore({ user: {} });
    const storageGetSpy = jest.spyOn(storage, 'get');
    render(
      <Provider store={store}>
        <HashRouter><LoginView /></HashRouter>
      </Provider>
    );
    expect(storageGetSpy).toHaveBeenCalledWith('user');

    storageGetSpy.mockRestore();
    store.clearActions();
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

    const redmineDomainInput = form.querySelector('input[name="redmineDomain"]');
    expect(redmineDomainInput).toBeTruthy();
    expect(redmineDomainInput.getAttribute('type')).toBe('text');

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
    const redmineInput = document.querySelector('input[name="redmineDomain"]');
    expect(redmineInput).toBeTruthy();
    fireEvent.focus(redmineInput);
    fireEvent.blur(redmineInput);
    let error;
    return wait(() => {
      error = getByText('"redmineDomain" is not allowed to be empty');
      expect(error).toBeTruthy();
      fireEvent.change(redmineInput, { target: { value: 'url' } });
    }).then(() => wait(() => {
      error = getByText('"redmineDomain" must be a valid uri');
      expect(error).toBeTruthy();
      fireEvent.change(redmineInput, { target: { value: 'https://redmine.domain' } });
    }).then(() => wait(() => {
      expect(error.innerHTML).toBeFalsy();
      expect(store.getActions().length).toBe(0);

      store.clearActions();
    })));
  });

  it('should redirect to the AppView if user credentials already exist', async () => {
    const store = mockStore({
      user: {
        id: 1,
        firstname: 'firstname',
        lastname: 'lastname',
        api_key: '123abc',
        redmineDomain: 'https://redmine.domain'
      }
    });
    const storageGetSpy = jest.spyOn(storage, 'get');
    const historyMock = {
      location: {
        pathname: '/'
      },
      listen: () => () => {},
      push: jest.fn()
    };
    const storeData = {
      user: {
        id: 1,
        firstname: 'firstname',
        lastname: 'lastname',
        api_key: 'api_key',
        redmineDomain: 'https://redmine.domain'
      }
    };
    storage.set('user', { ...storeData.user });
    render(
      <Provider store={store}>
        <Router history={historyMock}><LoginView /></Router>
      </Provider>
    );
    await wait(() => {
      expect(storageGetSpy).toHaveBeenCalledWith('user');
      expect(store.getActions().length).toBe(0);

      storageGetSpy.mockRestore();
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
    expect(form.prop('redmineApi')).toBe(undefined);
    expect(form.prop('initializeRedmineApi')).toBeTruthy();
    const redmineInitializeSpy = jest.spyOn(form.props(), 'initializeRedmineApi');
    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.exists()).toBeTruthy();
    submitButton.simulate('submit');
    setTimeout(() => {
      const error = wrapper.find('ErrorMessage').findWhere(item => /is not allowed to be empty/.test(item.text()));
      expect(error.exists()).toBeTruthy();
      expect(redmineInitializeSpy).not.toHaveBeenCalled();
      expect(storageSetSpy).not.toHaveBeenCalled();
      expect(form.prop('redmineApi')).toBe(undefined);
      expect(store.getActions().length).toBe(0);

      redmineInitializeSpy.mockRestore();
      storageSetSpy.mockRestore();
      store.clearActions();
      done();
    }, 100);
  });

  it('should make a redmine api request on submit', (done) => {
    const store = mockStore({ user: {} });
    const wrapper = mount(
      <Provider store={store}>
        <HashRouter><LoginView /></HashRouter>
      </Provider>
    );
    const form = wrapper.find('LoginView');
    expect(form.exists()).toBeTruthy();
    expect(form.prop('redmineApi')).toBe(undefined);
    expect(form.prop('initializeRedmineApi')).toBeTruthy();

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
    const redmineDomainInput = inputs.at(2);
    expect(usernameInput.prop('name')).toBe('username');
    expect(passwordInput.prop('name')).toBe('password');
    expect(redmineDomainInput.prop('name')).toBe('redmineDomain');

    const returnedValues = {
      username: 'username',
      password: 'password',
      redmineDomain: 'https://redmine.domain'
    };

    usernameInput.simulate('change', { persist: () => {}, target: { value: returnedValues.username, name: 'username' } });
    passwordInput.simulate('change', { persist: () => {}, target: { value: returnedValues.password, name: 'password' } });
    redmineDomainInput.simulate('change', { persist: () => {}, target: { name: 'redmineDomain', value: returnedValues.redmineDomain } });
    expect(wrapper.find('input[name="username"]').prop('value')).toBe(returnedValues.username);
    expect(wrapper.find('input[name="password"]').prop('value')).toBe(returnedValues.password);
    expect(wrapper.find('input[name="redmineDomain"]').prop('value')).toBe(returnedValues.redmineDomain);

    submit.simulate('submit');

    setTimeout(() => {
      wrapper.update();
      const errors = wrapper.find('ErrorMessage').findWhere(item => /is not allowed to be empty/.test(item.text()));
      expect(errors.exists()).toBeFalsy();
      expect(fetch.mock.calls.length).toBe(1);
      expect(fetch.mock.calls[0][0]).toBe(`${returnedValues.redmineDomain}/users/current.json`);
      expect(fetch.mock.calls[0][1].headers.Authorization).toBe(`Basic ${btoa(`${returnedValues.username}:${returnedValues.password}`)}`);
      expect(fetch.mock.calls[0][1].method).toBe('GET');
      expect(wrapper.find('LoginView').prop('redmineApi')).toBeTruthy();

      const reduxActions = store.getActions();
      expect(reduxActions.length).toBe(1);
      expect(reduxActions[0]).toEqual(actions.user.login({
        ...userData,
        redmineDomain: returnedValues.redmineDomain
      }));

      store.clearActions();
      done();
    }, 100);
  });

  it('should display the error if one raised during the request', async () => {
    const store = mockStore({ user: {} });
    const storageSetSpy = jest.spyOn(storage, 'set');
    const wrapper = mount(
      <Provider store={store}>
        <HashRouter><LoginView /></HashRouter>
      </Provider>
    );
    const form = wrapper.find('LoginView');
    expect(form.exists()).toBeTruthy();
    expect(form.prop('redmineApi')).toBe(undefined);
    expect(form.prop('initializeRedmineApi')).toBeTruthy();

    fetch.mockResponses([
      new Error('Something went wrong'), { status: 500 }
    ]);

    const inputs = wrapper.find('input');
    expect(inputs.length).toBe(3);
    const usernameInput = inputs.at(0);
    const passwordInput = inputs.at(1);
    const redmineDomainInput = inputs.at(2);
    expect(usernameInput.prop('name')).toBe('username');
    expect(passwordInput.prop('name')).toBe('password');
    expect(redmineDomainInput.prop('name')).toBe('redmineDomain');

    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.exists()).toBeTruthy();

    const returnedValues = {
      username: 'username',
      password: 'password',
      redmineDomain: 'https://redmine.domain'
    };

    usernameInput.simulate('change', { persist: () => {}, target: { value: returnedValues.username, name: 'username' } });
    passwordInput.simulate('change', { persist: () => {}, target: { value: returnedValues.password, name: 'password' } });
    redmineDomainInput.simulate('change', { persist: () => {}, target: { name: 'redmineDomain', value: returnedValues.redmineDomain } });
    expect(wrapper.find('input[name="username"]').prop('value')).toBe(returnedValues.username);
    expect(wrapper.find('input[name="password"]').prop('value')).toBe(returnedValues.password);
    expect(wrapper.find('input[name="redmineDomain"]').prop('value')).toBe(returnedValues.redmineDomain);

    submitButton.simulate('submit');

    await wait(() => {
      wrapper.update();
      expect(fetch.mock.calls.length).toBe(1);
      expect(fetch.mock.calls[0][0]).toBe(`${returnedValues.redmineDomain}/users/current.json`);
      expect(fetch.mock.calls[0][1].headers.Authorization).toBe(`Basic ${btoa(`${returnedValues.username}:${returnedValues.password}`)}`);
      expect(fetch.mock.calls[0][1].method).toBe('GET');
      expect(storageSetSpy).not.toHaveBeenCalled();
      expect(wrapper.find('LoginView').prop('redmineApi')).toBeTruthy();
      const error = wrapper.find('ErrorMessage').findWhere(item => /Error 500/.test(item.text()));
      expect(error.exists()).toBeTruthy();
      expect(store.getActions().length).toBe(0);

      store.clearActions();
      storageSetSpy.mockRestore();
    });
  });
});
