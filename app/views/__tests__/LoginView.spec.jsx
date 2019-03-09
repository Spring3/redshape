import React from 'react';
import { HashRouter, Router } from 'react-router-dom';
import { render, fireEvent, cleanup, wait } from 'react-testing-library';
import { mount } from 'enzyme';

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

  describe('integration', () => {
    it('should not make a redmine api request if the form has errors', (done) => {
      const storageSetSpy = jest.spyOn(storage, 'set');
      const wrapper = mount(<HashRouter><LoginView /></HashRouter>);
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
        redmineInitializeSpy.mockRestore();
        storageSetSpy.mockRestore();
        done();
      }, 100);
    });

    it('should make a redmine api request on submit', (done) => {
      const storageSetSpy = jest.spyOn(storage, 'set');
      const wrapper = mount(<HashRouter><LoginView /></HashRouter>);
      const form = wrapper.find('LoginView');
      expect(form.exists()).toBeTruthy();
      expect(form.prop('redmineApi')).toBe(undefined);
      expect(form.prop('initializeRedmineApi')).toBeTruthy();

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
        expect(storageSetSpy).toHaveBeenCalledWith('user', {
          redmineDomain: returnedValues.redmineDomain,
          ...userData
        });
        expect(wrapper.find('LoginView').prop('redmineApi')).toBeTruthy();
        storageSetSpy.mockRestore();
        done();
      }, 100);
    });

    it('should display the error if one raised during the request', async () => {
      const storageSetSpy = jest.spyOn(storage, 'set');
      const wrapper = mount(<HashRouter><LoginView /></HashRouter>);
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
        storageSetSpy.mockRestore();
      });
    });
  });
});
