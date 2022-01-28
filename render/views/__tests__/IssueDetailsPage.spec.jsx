import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { HashRouter } from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter';
import {
  render, cleanup, fireEvent
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { theme } from '../../theme';
import { IssueDetailsPage } from '../IssueDetailsPage';
import { getInstance, reset, initialize } from '../../../common/request';

const mockStore = configureStore([thunk]);
const redmineEndpoint = 'redmine.test.test';
const token = 'multipass';

let axiosMock;

const state = {
  projects: {
    data: {
      1: {
        activities: [
          { id: 1, name: 'Development' },
          { id: 2, name: 'Testing' }
        ]
      }
    }
  },
  user: {
    id: 1,
    name: 'John Wayne'
  },
  issue: {
    isFetching: false,
    error: undefined
  },
  issues: {
    selected: {
      data: {
        id: 1,
        subject: 'Test',
        journals: [],
        description: 'Fixture test issue',
        priority: {
          id: 1,
          name: 'Low'
        },
        project: {
          id: 1,
          name: 'Project 1'
        },
        author: {
          id: 1,
          name: 'Author 1'
        },
        done_ratio: 0.5,
        start_date: '2011-01-01',
        due_date: '2011-01-01',
        total_estimated_hours: 15,
        spent_hours: 2,
        status: {
          id: 1,
          name: 'Open'
        },
        tracker: {
          id: 1,
          name: 'Issue'
        },
        assigned_to: {
          id: 1,
          name: 'John Wayne'
        }
      },
      spentTime: {
        data: [{
          id: 1,
          user: {
            id: 1,
            name: 'John Wayne'
          },
          issue: {
            id: 1,
            name: 'Issue-1'
          },
          activity: {
            id: 1,
            name: 'Testing'
          },
          project: {
            id: 1,
            name: 'Test'
          },
          hours: 1.5,
          spent_on: '2011-01-01'
        },
        {
          id: 1,
          activity: {
            id: 1,
            name: 'activity-1'
          },
          comments: 'Comment',
          created_on: '2011-02-02',
          hours: 1.5,
          issue: {
            id: 1
          },
          project: {
            id: 1,
            name: 'Project-1'
          },
          spent_on: '2011-02-02',
          user: {
            id: 1,
            name: 'Username'
          }
        }],
        isFetching: false,
        error: undefined
      }
    }
  },
  tracking: {
    issue: {
      id: 2
    },
    isEnabled: false,
    duration: 0
  },
  settings: {
    idleBehavior: 0,
    discardIdleTime: true,
    advancedTimerControls: false,
    progressWithStep1: false,
  }
};

describe('IssueDetails page', () => {
  beforeAll(() => {
    initialize(redmineEndpoint, token);
    axiosMock = new MockAdapter(getInstance());
  });

  afterEach(() => {
    axiosMock.reset();
    cleanup();
  });

  afterAll(() => {
    axiosMock.restore();
    reset();
  });

  it('should fetch the info about a selected issue', () => {
    axiosMock.onAny().reply(() => Promise.resolve([200, {}]));
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <IssueDetailsPage
              match={{
                params: {
                  id: 1
                }
              }}
              history={{
                goBack: jest.fn()
              }}
            />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    );
  });

  it('should reset the selected issue on unmount', () => {
    axiosMock.onAny().reply(() => Promise.resolve([200, {}]));
    const store = mockStore(state);
    const { unmount } = render(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <IssueDetailsPage
              match={{
                params: {
                  id: 1
                }
              }}
              history={{
                goBack: jest.fn()
              }}
            />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    );

    unmount();

    const actions = store.getActions();
    actions.pop();
  });

  it('should show the selected time entry in a modal', () => {
    axiosMock.onAny().reply(() => Promise.resolve([200, {}]));
    const store = mockStore({
      ...state,
      timeEntry: {}
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <IssueDetailsPage
              match={{
                params: {
                  id: 1
                }
              }}
              history={{
                goBack: jest.fn()
              }}
            />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    );

    fireEvent.click(getByTestId('time-entries').querySelector('[data-testId="time-entry"]'));
    expect(getByTestId('time-entry-modal-title').textContent).toEqual('#1Test');
  });

  it('should show a template for the time entry in a modal', () => {
    axiosMock.onAny().reply(() => Promise.resolve([200, {}]));
    const store = mockStore({
      ...state,
      timeEntry: {}
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <IssueDetailsPage
              match={{
                params: {
                  id: 1
                }
              }}
              history={{
                goBack: jest.fn()
              }}
            />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    );

    fireEvent.click(document.querySelector('#openModal'));
    expect(getByTestId('time-entry-modal-title')).toBeDefined();
  });
});
