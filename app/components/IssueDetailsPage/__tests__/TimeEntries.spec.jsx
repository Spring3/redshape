import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';

import { TIME_ENTRY_GET_ALL, TIME_ENTRY_DELETE } from '../../../actions/timeEntry.actions';
import { TRACKING_START } from '../../../actions/tracking.actions';
import { getInstance, reset, initialize } from '../../../../modules/request';
import theme from '../../../theme';
import TimeEntries from '../TimeEntries';

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
  });

  afterAll(() => {
    axiosMock.restore();
    reset();
  });

  it('should match the snapshot', () => {
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
              },
              {
                id: 2,
                user: {
                  id: 2,
                  name: 'John Snow'
                },
                activity: {
                  id: 1,
                  name: 'Testing'
                },
                hours: 3.2,
                spent_on: '2011-01-01',
                comments: 'I know nothing'
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
    const tree = renderer.create(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TimeEntries />
        </ThemeProvider>
      </Provider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
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
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TimeEntries />
        </ThemeProvider>
      </Provider>
    );
    expect(store.getActions().length).toBe(1);
    expect(store.getActions()[0].type).toBe(TIME_ENTRY_GET_ALL);
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
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TimeEntries showTimeEntryModal={showTimeEntry} />
        </ThemeProvider>
      </Provider>
    );
    const section = wrapper.find('TimeEntries').instance();
    expect(section).toBeTruthy();

    section.openModal()();
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
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TimeEntries />
        </ThemeProvider>
      </Provider>
    );
    wrapper.find('TimeEntries__FlexButton').at(1).simulate('click');
    expect(store.getActions().pop().type).toBe(TRACKING_START);
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
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TimeEntries showTimeEntryModal={showTimeEntryModal} />
        </ThemeProvider>
      </Provider>
    );
    wrapper.find('TimeEntries').instance().removeTimeEntry(1)({
      preventDefault: () => {},
      stopPropagation: () => {}
    });
    expect(store.getActions().pop().type).toBe(TIME_ENTRY_DELETE);
  });
});
