import React from 'react';
import { HashRouter, Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { render, fireEvent, cleanup, wait } from 'react-testing-library';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { USER_LOGOUT } from '../../actions/user.actions';

import AppView from '../AppView';

const mockStore = configureStore([thunk]);

describe('AppView', () => {
  afterEach(() => {
    cleanup();
    fetch.resetMocks();
  });

  it('should match the snapshot', () => {
    const store = mockStore({
      user: {
        id: 1,
        firstname: 'firstname',
        lastname: 'lastname',
        redmineEndpoint: 'https://redmine.domain',
        api_key: '123abc'
      },
      issues: {
        all: {
          data: []
        }
      }
    });
    const tree = renderer.create(
      <Provider store={store}>
        <HashRouter><AppView /></HashRouter>
      </Provider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  describe('[integration] AppView', () => {
    it('should open / close the side bar', () => {
      fetch.mockResponse(JSON.stringify({ ok: false, status: 400, statusText: 'Bad Request' }));
      const store = mockStore({
        user: {
          id: 1,
          firstname: 'firstname',
          lastname: 'lastname',
          redmineEndpoint: 'https://redmine.domain',
          api_key: '123abc'
        },
        issues: {
          all: {
            data: []
          }
        }
      });
      const wrapper = mount(
        <Provider store={store}>
          <HashRouter>
            <AppView />
          </HashRouter>
        </Provider>
      );

      let view = wrapper.find('AppView');
      expect(view.exists()).toBeTruthy();
      expect(view.state('showSidebar')).toBe(false);
      expect(view.state('showFooter')).toBe(false);

      let aside = wrapper.find('aside');
      expect(aside.exists()).toBeTruthy();
      expect(aside).toHaveStyleRule('display', 'none');

      let hamburgerButton = wrapper.find('li#hamburger').childAt(0);
      expect(hamburgerButton.exists()).toBeTruthy();

      hamburgerButton.simulate('click');
      wrapper.update();

      view = wrapper.find('AppView');
      aside = wrapper.find('aside');
      hamburgerButton = wrapper.find('li#hamburger').childAt(0);

      expect(aside).not.toHaveStyleRule('display', 'none');
      expect(view.state('showSidebar')).toBe(true);

      hamburgerButton.simulate('click');
      wrapper.update();

      view = wrapper.find('AppView');
      aside = wrapper.find('aside');
      expect(aside).toHaveStyleRule('display', 'none');
      expect(view.state('showSidebar')).toBe(false);
    });

    it('should have a button to log out', () => {
      fetch.mockResponse(JSON.stringify({ ok: false, status: 400, statusText: 'Bad Request' }));
      const store = mockStore({
        user: {
          id: 1,
          firstname: 'firstname',
          lastname: 'lastname',
          redmineEndpoint: 'https://redmine.domain',
          api_key: '123abc'
        },
        issues: {
          all: {
            data: []
          }
        }
      });

      const historyMock = {
        location: {
          pathname: '/app'
        },
        listen: () => () => {},
        push: jest.fn()
      };

      const wrapper = mount(
        <Provider store={store}>
          <Router history={historyMock}>
            <AppView />
          </Router>
        </Provider>
      );

      const signoutButton = wrapper.find('#signout').hostNodes();
      expect(signoutButton.exists()).toBeTruthy();

      signoutButton.simulate('click');
      wrapper.update();

      expect(historyMock.push).toHaveBeenCalledWith('/');
      const actions = store.getActions();
      expect(actions.length).toBeGreaterThan(0);
      expect(actions.pop()).toEqual({ type: USER_LOGOUT });
    });
  });
});
