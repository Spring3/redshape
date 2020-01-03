import React from 'react';
import moment from 'moment';
import { HashRouter, Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { ThemeProvider } from 'styled-components';

import { USER_LOGOUT } from '../../actions/user.actions';
import { PROJECT_GET_ALL } from '../../actions/project.actions';
import { TRACKING_RESET } from '../../actions/tracking.actions';
import * as axios from '../../../common/request';
import theme from '../../theme';

import AppView from '../AppView';

jest.mock('electron-store');

import storage from '../../../common/storage';

import { hoursToDuration } from '../../actions/timeEntry.actions'

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
  });

  afterAll(() => {
    axiosMock.restore();
    getInstanceStub.restore();
  });

  it('should match the snapshot', () => {
    axiosMock.onGet('/projects.json').reply(() => Promise.resolve([200, { projects: [], totalCount: 10, offset: 0, limit: 10 }]));
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
      }
    });
    const tree = renderer.create(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <HashRouter>
            <AppView
              match={
                {
                  isExact: false,
                  params: {},
                  path: undefined,
                  url: '/app'
                }
              }
            />
          </HashRouter>
        </ThemeProvider>
      </Provider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  describe('[integration] AppView', () => {
    it('should fetch projects data on mount', () => {
      axiosMock.onGet('/projects.json').reply(() => Promise.resolve([200, { projects: [], totalCount: 10, offset: 0, limit: 10 }]));
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
        }
      });

      const historyMock = {
        location: {
          pathname: '/app'
        },
        listen: () => () => {},
        push: jest.fn(),
        createHref: () => {
          historyMock.push('/');
          window.location.path = '/';
        }
      };

      const wrapper = mount(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <Router history={historyMock}>
              <AppView
                match={
                  {
                    isExact: false,
                    params: {},
                    path: undefined,
                    url: '/app'
                  }
                }
              />
            </Router>
          </ThemeProvider>
        </Provider>
      );

      expect(store.getActions().length).toBeGreaterThan(0);
      expect(store.getActions()[0].type).toBe(PROJECT_GET_ALL);
    });

    it('should logout when a user clicks the button', () => {
      axiosMock.onGet('/projects.json').reply(() => Promise.resolve([200, { projects: [], totalCount: 10, offset: 0, limit: 10 }]));
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
        }
      });

      const historyMock = {
        location: {
          pathname: '/app'
        },
        listen: () => () => {},
        push: jest.fn(),
        createHref: () => {
          historyMock.push('/');
          window.location.path = '/';
        }
      };

      const wrapper = mount(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <Router history={historyMock}>
              <AppView
                match={
                  {
                    isExact: false,
                    params: {},
                    path: undefined,
                    url: '/app'
                  }
                }
              />
            </Router>
          </ThemeProvider>
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

    it('should open the modal with a new timeEntry if timer stops and wipe the storage', () => {
      axiosMock.onGet('/projects.json').reply(() => Promise.resolve([200, { projects: [], totalCount: 10, offset: 0, limit: 10 }]));
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
        }
      };
      const store = mockStore(state);

      const historyMock = {
        location: {
          pathname: '/app'
        },
        listen: () => () => {},
        push: jest.fn(),
        createHref: () => {
          historyMock.push('/');
          window.location.path = '/';
        }
      };

      const storageSpy = jest.spyOn(storage, 'delete');

      const wrapper = mount(
        <Provider store={store}>
          <Router history={historyMock}>
            <ThemeProvider theme={theme}>
              <AppView
                match={
                  {
                    isExact: false,
                    params: {},
                    path: undefined,
                    url: '/app'
                  }
                }
              />
            </ThemeProvider>
          </Router>
        </Provider>
      );

      const view = wrapper.find('AppView').instance();
      expect(view).toBeTruthy();

      const hours = Number((state.tracking.ms / 3600000).toFixed(3));
      const duration = hoursToDuration(hours);

      view.onTrackingStop(state.tracking.issue, state.tracking.ms);
      expect(view.state.showTimeEntryModal).toBe(true);
      expect(view.state.timeEntry).toEqual({
        activity: {},
        issue: {
          id: state.tracking.issue.id,
          name: state.tracking.issue.subject
        },
        hours,
        duration,
        comments: '',
        project: {
          id: state.tracking.issue.project.id,
          name: state.tracking.issue.project.name
        },
        spent_on: moment().format('YYYY-MM-DD'),
        user: {
          id: state.user.id,
          name: state.user.name
        }
      });
      expect(storageSpy).toHaveBeenCalledWith('time_tracking');

      view.closeTimeEntryModal();
      expect(view.state.showTimeEntryModal).toBe(false);
      expect(view.state.timeEntry).toBe(null);
      expect(store.getActions().find(action => action.type === TRACKING_RESET)).toBeDefined();

      storageSpy.mockRestore();
    });
  });
});
