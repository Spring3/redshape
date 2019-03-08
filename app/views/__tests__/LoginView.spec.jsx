import React from 'react';
import { HashRouter, Router } from 'react-router-dom';
import { render, fireEvent, cleanup, wait, prettyDOM } from 'react-testing-library';
import RedmineAPI from '../../redmine/api';

jest.mock('electron-store');

import storage from '../../../modules/storage';
import LoginView from '../LoginView';

const userData = {
  id: '123',
  firstname: 'test',
  lastname: 'user',
  api_key: 'api_key'
};

afterEach(() => {
  cleanup();
  fetch.resetMocks();
  storage.__reset();

  if (RedmineAPI.instance()) {
    RedmineAPI.instance().logout();
  }
});

describe('Login view', () => {
  it('should check the storage for user credentials', () => {
    const storageGetSpy = jest.spyOn(storage, 'get');
    render(<HashRouter><LoginView /></HashRouter>);
    expect(storageGetSpy).toHaveBeenCalledWith('user');
    storageGetSpy.mockRestore();
  });

  it('should render the link to github', () => {
    render(<HashRouter><LoginView /></HashRouter>);
    const link = document.querySelector('a[href="https://github.com/Spring3/redtime"]');
    expect(link).toBeTruthy();
  });

  it('should render the form', () => {
    render(<HashRouter><LoginView /></HashRouter>);
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
  });

  it('should render the copyrights', () => {
    const { getByText } = render(<HashRouter><LoginView /></HashRouter>);
    const copyrights = getByText('Created by');
    expect(copyrights).toBeTruthy();
    const link = copyrights.querySelector('a');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBeTruthy();
    expect(link.innerHTML).toBe('Daniyil Vasylenko');
  });

  it('should validate the username', () => {
    const { getByText } = render(<HashRouter><LoginView /></HashRouter>);
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
    }));
  });

  it('should validate the password', () => {
    const { getByText } = render(<HashRouter><LoginView /></HashRouter>);
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
    }));
  });

  it('should validate the redmine domain input', () => {
    const { getByText } = render(<HashRouter><LoginView /></HashRouter>);
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
    })));
  });

  it('should not make a redmine api request if a form has errors', async () => {
    const storageSetSpy = jest.spyOn(storage, 'set');
    const redmineInitializeSpy = jest.spyOn(RedmineAPI, 'initialize');
    const { getByText } = render(<HashRouter><LoginView /></HashRouter>);
    const submitButton = document.querySelector('button[type="submit"]');
    expect(submitButton).toBeTruthy();
    fireEvent.click(submitButton);
    await wait(() => {
      getByText(/is not allowed to be empty/);
      expect(redmineInitializeSpy).not.toHaveBeenCalled();
      expect(storageSetSpy).not.toHaveBeenCalled();
      expect(RedmineAPI.instance()).toBeFalsy();
      redmineInitializeSpy.mockRestore();
      storageSetSpy.mockRestore();
    });
  });

  it('should make a redmine api request on submit', async () => {
    const storageSetSpy = jest.spyOn(storage, 'set');
    const redmineInitializeSpy = jest.spyOn(RedmineAPI, 'initialize');
    fetch.mockResponseOnce(JSON.stringify({ user: userData }));
    const { getByText } = render(<HashRouter><LoginView /></HashRouter>);
    const inputs = document.querySelectorAll('input');
    const submit = getByText('Submit');
    expect(inputs.length).toBe(3);
    const [usernameInput, passwordInput, redmineDomainInput] = inputs;
    expect(usernameInput.getAttribute('name')).toBe('username');
    expect(passwordInput.getAttribute('name')).toBe('password');
    expect(redmineDomainInput.getAttribute('name')).toBe('redmineDomain');
    const returnedValues = {
      username: 'username',
      password: 'password',
      redmineDomain: 'https://redmine.domain'
    };
    fireEvent.change(usernameInput, { target: { value: returnedValues.username } });
    fireEvent.change(passwordInput, { target: { value: returnedValues.password } });
    fireEvent.change(redmineDomainInput, { target: { value: returnedValues.redmineDomain } });
    fireEvent.click(submit);
    await wait(() => {
      expect(redmineInitializeSpy).toHaveBeenCalledWith(returnedValues.redmineDomain);
      expect(fetch.mock.calls.length).toBe(1);
      expect(fetch.mock.calls[0][0]).toBe(`${returnedValues.redmineDomain}/users/current.json`);
      expect(fetch.mock.calls[0][1].headers.Authorization).toBe(`Basic ${btoa(`${returnedValues.username}:${returnedValues.password}`)}`);
      expect(fetch.mock.calls[0][1].method).toBe('GET');
      expect(storageSetSpy).toHaveBeenCalledWith('user', {
        redmineDomain: returnedValues.redmineDomain,
        ...userData
      });
      expect(RedmineAPI.instance()).toBeTruthy();
      redmineInitializeSpy.mockRestore();
      storageSetSpy.mockRestore();
    });
  });

  it('should display the error if one raised during the request', async () => {
    const storageSetSpy = jest.spyOn(storage, 'set');
    const redmineInitializeSpy = jest.spyOn(RedmineAPI, 'initialize');
    fetch.mockResponses([
      new Error('Something went wrong'), { status: 500 }
    ]);
    const { getByText } = render(<HashRouter><LoginView /></HashRouter>);
    const inputs = document.querySelectorAll('input');
    const submit = getByText('Submit');
    expect(inputs.length).toBe(3);
    const [usernameInput, passwordInput, redmineDomainInput] = inputs;
    expect(usernameInput.getAttribute('name')).toBe('username');
    expect(passwordInput.getAttribute('name')).toBe('password');
    expect(redmineDomainInput.getAttribute('name')).toBe('redmineDomain');
    const returnedValues = {
      username: 'username',
      password: 'password',
      redmineDomain: 'https://redmine.domain'
    };
    fireEvent.change(usernameInput, { target: { value: returnedValues.username } });
    fireEvent.change(passwordInput, { target: { value: returnedValues.password } });
    fireEvent.change(redmineDomainInput, { target: { value: returnedValues.redmineDomain } });
    fireEvent.click(submit);
    await wait(() => {
      expect(redmineInitializeSpy).toHaveBeenCalledWith(returnedValues.redmineDomain);
      expect(fetch.mock.calls.length).toBe(1);
      expect(fetch.mock.calls[0][0]).toBe(`${returnedValues.redmineDomain}/users/current.json`);
      expect(fetch.mock.calls[0][1].headers.Authorization).toBe(`Basic ${btoa(`${returnedValues.username}:${returnedValues.password}`)}`);
      expect(fetch.mock.calls[0][1].method).toBe('GET');
      expect(storageSetSpy).not.toHaveBeenCalled();
      expect(RedmineAPI.instance()).toBeTruthy();
      const error = getByText(/Error 500/);
      expect(error.innerHTML).toBeTruthy();
      redmineInitializeSpy.mockRestore();
      storageSetSpy.mockRestore();
    });
  });

  it('should redirect to the AppView if user credentials already exist', async () => {
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
        redmineDomain: 'https://redmine.domain',
        api_key: 'api_key'
      }
    };
    storage.set('user', { ...storeData.user });
    fetch.mockResponseOnce(JSON.stringify({ user: {} }));
    render(<Router history={historyMock}><LoginView /></Router>);
    await wait(() => {
      expect(storageGetSpy).toHaveBeenCalledWith('user');
      expect(fetch.mock.calls.length).toBe(1);
      expect(fetch.mock.calls[0][0]).toBe(`${storeData.user.redmineDomain}/users/current.json`);
      expect(fetch.mock.calls[0][1].headers['X-Redmine-API-Key']).toBe(storeData.user.api_key);
      expect(fetch.mock.calls[0][1].method).toBe('GET');
      storageGetSpy.mockRestore();
    });
  });
});
