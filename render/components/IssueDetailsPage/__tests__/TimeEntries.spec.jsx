import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';

import { TIME_ENTRY_DELETE } from '../../../actions/timeEntry.actions';
import { ISSUES_TIME_ENTRY_GET } from '../../../actions/issues.actions';
import { getInstance, reset, initialize } from '../../../../common/request';
import { theme } from '../../../theme';
import { TimeEntries } from '../TimeEntries';

const redmineEndpoint = 'redmine.test.test';
const token = 'multipass';
const mockStore = configureStore([thunk]);

let axiosMock;

describe('IssueDetails => TimeEntries componnet', () => {
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

  it('should fetch the time entries for the selected issue on mount', () => {
    axiosMock.onGet('/time_entries.json').reply(() => Promise.resolve([200]));
    const state = {
      user: {
        id: 1,
        name: 'John Wayne'
      },
      issues: {
        selected: {
          data: {
            id: 1,
            subject: 'Test'
          },
          spentTime: {
            data: [
              {
                id: 1,
                user: {
                  id: 1,
                  name: 'John Wayne'
                },
                activity: {
                  id: 1,
                  name: 'Development'
                },
                hours: 3.2,
                spent_on: '2011-01-01',
                comments: 'Let\'s get this done'
              }
            ]
          }
        }
      },
      tracking: {
        isEnabled: false,
        issue: {
          id: 1
        }
      }
    };
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TimeEntries />
        </ThemeProvider>
      </Provider>
    );
    expect(store.getActions().length).toBe(1);
    expect(store.getActions()[0].type).toBe(ISSUES_TIME_ENTRY_GET);
  });

  it('should be able to request the time entry modal', () => {
    axiosMock.onGet('/time_entries.json').reply(() => Promise.resolve([200]));
    const state = {
      user: {
        id: 1,
        name: 'John Wayne'
      },
      issues: {
        selected: {
          data: {
            id: 1,
            subject: 'Test'
          },
          spentTime: {
            data: [
              {
                id: 1,
                user: {
                  id: 1,
                  name: 'John Wayne'
                },
                activity: {
                  id: 1,
                  name: 'Development'
                },
                hours: 3.2,
                spent_on: '2011-01-01',
                comments: 'Let\'s get this done'
              }
            ]
          }
        }
      },
      tracking: {
        isEnabled: false,
        issue: {
          id: 1
        }
      }
    };
    const store = mockStore(state);
    const showTimeEntry = jest.fn();
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TimeEntries showTimeEntryModal={showTimeEntry} />
        </ThemeProvider>
      </Provider>
    );
    fireEvent.click(document.querySelector('#openModal'));
    expect(showTimeEntry).toHaveBeenCalled();
  });

  it('should start the tracking on button click', () => {
    axiosMock.onGet('/time_entries.json').reply(() => Promise.resolve([200]));
    const state = {
      user: {
        id: 1,
        name: 'John Wayne'
      },
      issues: {
        selected: {
          data: {
            id: 1,
            subject: 'Test'
          },
          spentTime: {
            data: [
              {
                id: 1,
                user: {
                  id: 1,
                  name: 'John Wayne'
                },
                activity: {
                  id: 1,
                  name: 'Development'
                },
                hours: 3.2,
                spent_on: '2011-01-01',
                comments: 'Let\'s get this done'
              }
            ]
          }
        }
      },
      tracking: {
        isEnabled: false,
        issue: {
          id: 10
        }
      }
    };
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TimeEntries />
        </ThemeProvider>
      </Provider>
    );
    fireEvent.click(document.querySelector('#track'));
  });

  it('should remove the time entry if the button is clicked', () => {
    axiosMock.onGet('/time_entries.json').reply(() => Promise.resolve([200]));
    axiosMock.onDelete('/time_entries/1.json').reply(() => Promise.resolve([200]));
    const state = {
      user: {
        id: 1,
        name: 'John Wayne'
      },
      issues: {
        selected: {
          data: {
            id: 1,
            subject: 'Test'
          },
          spentTime: {
            data: [
              {
                id: 1,
                user: {
                  id: 1,
                  name: 'John Wayne'
                },
                activity: {
                  id: 1,
                  name: 'Development'
                },
                hours: 3.2,
                spent_on: '2011-01-01',
                comments: 'Let\'s get this done'
              }
            ]
          }
        }
      },
      tracking: {
        isEnabled: false,
        issue: {
          id: 10
        }
      }
    };
    const store = mockStore(state);
    const showTimeEntryModal = jest.fn();
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TimeEntries showTimeEntryModal={showTimeEntryModal} />
        </ThemeProvider>
      </Provider>
    );
    fireEvent.click(document.querySelector('#confirmDeletion'), {
      preventDefault: () => { /* noop */ },
      stopPropagation: () => { /* noop */ }
    });
    fireEvent.click(document.querySelector('#dialog-confirm'));
    expect(store.getActions().pop().type).toBe(TIME_ENTRY_DELETE);
  });
});
