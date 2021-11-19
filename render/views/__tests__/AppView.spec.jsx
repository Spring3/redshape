import React from 'react';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';
import {
  render, cleanup, fireEvent, act
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureStore from 'redux-mock-store';
import { ThemeProvider } from 'styled-components';

import { PROJECT_GET_ALL } from '../../actions/project.actions';
import { TRACKING_RESET } from '../../actions/tracking.actions';
import * as axios from '../../../common/request';
import { theme } from '../../theme';
import AppView from '../AppView';

jest.mock('electron-store');

const mockStore = configureStore([thunk]);
const redmineEndpoint = 'redmine.test.test';
const token = 'multipass';

let axiosMock;
let getInstanceStub;

describe('AppView', () => {
  beforeAll(() => {
    axios.reset();
    axios.initialize(redmineEndpoint, token);
    const stub = axios.getInstance();
    getInstanceStub = jest.spyOn(axios, 'getInstance').mockReturnValue(stub);
    axiosMock = new MockAdapter(stub);
  });

  afterEach(() => {
    axiosMock.reset();
    cleanup();
  });

  afterAll(() => {
    axiosMock.restore();
    getInstanceStub.restore();
  });

  it('should fetch projects data on mount', () => {
    axiosMock.onGet('/projects.json').reply(() => Promise.resolve([200, {
      projects: [],
      totalCount: 10,
      offset: 0,
      limit: 10
    }]));
    const store = mockStore({
      user: {
        id: 1,
        name: 'John Wayne',
        redmineEndpoint: 'https://redmine.domain',
        api_key: '123abc'
      },
      issues: {
        all: {
          data: []
        }
      },
      projects: {
        data: {
          activities: [
            { id: 1, name: 'Activity 1' },
            { id: 2, name: 'Activity 2' }
          ]
        }
      },
      tracking: {
        isEnabled: false,
        issue: {
          subject: 'Test issue'
        }
      },
      timeEntry: {
        isFetching: false,
        error: undefined
      },
      settings: {
        idleBehavior: 0,
        discardIdleTime: true,
        advancedTimerControls: false,
        progressWithStep1: false
      }
    });

    const historyMock = {
      location: {
        pathname: '/app'
      },
      listen: () => () => { /* noop */ },
      push: jest.fn(),
      createHref: () => {
        historyMock.push('/');
        window.location.path = '/';
      }
    };

    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <Router history={historyMock}>
            <AppView
              match={{
                isExact: false,
                params: {},
                path: undefined,
                url: '/app'
              }}
            />
          </Router>
        </ThemeProvider>
      </Provider>
    );

    expect(store.getActions().length).toBeGreaterThan(0);
    expect(store.getActions()[0].type).toBe(PROJECT_GET_ALL);
  });

  it('should logout when a user clicks the button', () => {
    axiosMock.onGet('/projects.json').reply(() => Promise.resolve([200, {
      projects: [],
      totalCount: 10,
      offset: 0,
      limit: 10
    }]));

    const store = mockStore({
      user: {
        id: 1,
        name: 'John Wayne',
        redmineEndpoint: 'https://redmine.domain',
        api_key: '123abc'
      },
      issues: {
        all: {
          data: []
        }
      },
      projects: {
        data: {
          activities: [
            { id: 1, name: 'Activity 1' },
            { id: 2, name: 'Activity 2' }
          ]
        }
      },
      tracking: {
        isEnabled: false,
        issue: {
          subject: 'Test issue'
        }
      },
      timeEntry: {
        isFetching: false,
        error: undefined
      },
      settings: {
        idleBehavior: 0,
        discardIdleTime: true,
        advancedTimerControls: false,
        progressWithStep1: false
      }
    });

    const historyMock = {
      location: {
        pathname: '/app'
      },
      listen: () => () => { /* noop */ },
      push: jest.fn(),
      createHref: () => {
        historyMock.push('/');
        window.location.path = '/';
      }
    };

    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <Router history={historyMock}>
            <AppView
              match={{
                isExact: false,
                params: {},
                path: undefined,
                url: '/app'
              }}
            />
          </Router>
        </ThemeProvider>
      </Provider>
    );

    const signoutButton = document.querySelector('#signout');
    expect(signoutButton).toBeDefined();

    act(() => {
      fireEvent.click(signoutButton);
    });

    expect(historyMock.push).toHaveBeenCalledWith('/');
    const actions = store.getActions();
    expect(actions.length).toBeGreaterThan(0);
  });

  it('should open the modal with a new timeEntry if timer stops and wipe the storage', (done) => {
    axiosMock.onGet('/projects.json').reply(() => Promise.resolve([200, {
      projects: [],
      totalCount: 10,
      offset: 0,
      limit: 10
    }]));

    const state = {
      user: {
        id: 1,
        name: 'John Wayne',
        redmineEndpoint: 'https://redmine.domain',
        api_key: '123abc'
      },
      issues: {
        all: {
          data: []
        }
      },
      projects: {
        data: {
          1: {
            activities: [
              { id: 1, name: 'Activity 1' },
              { id: 2, name: 'Activity 2' }
            ]
          }
        }
      },
      tracking: {
        isEnabled: false,
        ms: 41000,
        issue: {
          id: 321,
          subject: 'Test issue',
          project: {
            id: 1,
            name: 'Project 1'
          }
        }
      },
      timeEntry: {
        isFetching: false,
        error: undefined
      },
      settings: {
        idleBehavior: 0,
        discardIdleTime: true,
        advancedTimerControls: false,
        progressWithStep1: false
      }
    };
    const store = mockStore(state);

    const historyMock = {
      location: {
        pathname: '/app'
      },
      listen: () => () => { /* noop */ },
      push: jest.fn(),
      createHref: () => {
        historyMock.push('/');
        window.location.path = '/';
      }
    };

    render(
      <Provider store={store}>
        <Router history={historyMock}>
          <ThemeProvider theme={theme}>
            <AppView
              match={{
                isExact: false,
                params: {},
                path: undefined,
                url: '/app'
              }}
            />
          </ThemeProvider>
        </Router>
      </Provider>
    );

    fireEvent.click(document.querySelector('#stop-timer'));
    fireEvent.click(document.querySelector('#btn-add'));
    setTimeout(() => {
      expect(
        store.getActions().find((action) => action.type === TRACKING_RESET)
      ).toBeDefined();
      done();
    }, 1);
  });
});
