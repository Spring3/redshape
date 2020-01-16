import React from 'react';
import moment from 'moment';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { HashRouter } from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';

import theme from '../../../theme';
import IssueDetailsPage from '../../AppViewPages/IssueDetailsPage';
import { ISSUE_RESET } from '../../../actions/issue.actions';
import { ISSUES_GET, ISSUES_RESET_SELECTION } from '../../../actions/issues.actions';
import { getInstance, reset, initialize } from '../../../../common/request';

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
        data: [],
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
  });

  afterAll(() => {
    axiosMock.restore();
    reset();
  });

  it('should match the snapshot', () => {
    axiosMock.onAny().reply(() => Promise.resolve([200, {}]));
    const store = mockStore(state);
    const tree = renderer.create(
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
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should fetch the info about a selected issue', () => {
    axiosMock.onAny().reply(() => Promise.resolve([200, {}]));
    const store = mockStore(state);
    const wrapper = mount(
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

    expect(store.getActions()[0].type).toBe(ISSUES_GET);
  });

  it('should reset the selected issue on unmount', () => {
    axiosMock.onAny().reply(() => Promise.resolve([200, {}]));
    const store = mockStore(state);
    const wrapper = mount(
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

    wrapper.unmount();

    const actions = store.getActions();
    actions.pop()
    expect(actions.pop().type).toBe(ISSUES_RESET_SELECTION);
  });

  it('should show the selected time entry in a modal', () => {
    axiosMock.onAny().reply(() => Promise.resolve([200, {}]));
    const store = mockStore({
      ...state,
      timeEntry: {}
    });
    const wrapper = mount(
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

    const page = wrapper.find('IssueDetailsPage').instance();
    expect(page).toBeTruthy();
    const timeEntry = {
      user: {
        id: 1,
        name: 'John Wayne'
      },
      issue: {
        id: 1
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
    };

    page.showTimeEntryModal(timeEntry);

    expect(page.state.showTimeEntryModal).toBe(true);
    expect(page.state.selectedTimeEntry).toEqual(
      Object.assign({}, timeEntry, {
        issue: {
          id: 1,
          name: state.issues.selected.data.subject
        }
      })
    );
    expect(page.state.activities).toEqual([
      { value: 1, label: 'Development' },
      { value: 2, label: 'Testing' }
    ]);
  });

  it('should show a template for the time entry in a modal', () => {
    axiosMock.onAny().reply(() => Promise.resolve([200, {}]));
    const store = mockStore({
      ...state,
      timeEntry: {}
    });
    const wrapper = mount(
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

    const page = wrapper.find('IssueDetailsPage').instance();
    expect(page).toBeTruthy();
    const timeEntry = {
      user: {
        id: state.user.id,
        name: state.user.name
      },
      issue: {
        id: state.issues.selected.data.id
      },
      activity: {},
      project: {
        id: state.issues.selected.data.project.id,
        name: state.issues.selected.data.project.name
      },
      duration: '',
      hours: undefined,
      spent_on: moment().format('YYYY-MM-DD')
    };

    page.showTimeEntryModal();

    expect(page.state.showTimeEntryModal).toBe(true);
    expect(page.state.selectedTimeEntry).toEqual(
      Object.assign({}, timeEntry, {
        issue: {
          id: 1,
          name: state.issues.selected.data.subject
        }
      })
    );
    expect(page.state.activities).toEqual([
      { value: 1, label: 'Development' },
      { value: 2, label: 'Testing' }
    ]);
  });

  it('should close the time entry modal', () => {
    axiosMock.onAny().reply(() => Promise.resolve([200, {}]));
    const store = mockStore({
      ...state,
      timeEntry: {}
    });
    const wrapper = mount(
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

    const page = wrapper.find('IssueDetailsPage').instance();
    expect(page).toBeTruthy();

    page.showTimeEntryModal();
    expect(page.state.showTimeEntryModal).toBe(true);

    page.closeTimeEntryModal();
    expect(page.state.showTimeEntryModal).toBe(false);

    expect(page.state.selectedTimeEntry).toBe(undefined);
    expect(page.state.activities).toEqual([]);
  });
});
