import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MockAdapter from 'axios-mock-adapter';
import thunk from 'redux-thunk';
import { ThemeProvider } from 'styled-components';
import toJSON from 'enzyme-to-json';
import { mount } from 'enzyme';

import * as actions from '../../actions/timeEntry.actions';
import theme from '../../theme';
import TimeEntryModal from '../TimeEntryModal';
import { initialize, getInstance } from '../../../modules/request';

let axiosMock;
const mockStore = configureStore([thunk]);

describe('TimeEntryModal Component', () => {
  beforeAll(() => {
    initialize('redmine.test.test', 'multipass');
    axiosMock = new MockAdapter(getInstance());
    axiosMock.onAny().reply(() => Promise.resolve([200, { }]));
  });

  afterEach(() => {
    axiosMock.reset();
  });

  afterAll(() => {
    axiosMock.restore();
  });


  it('it should match the snapshot', () => {
    const props = {
      activities: [{
        id: 1,
        name: 'Development'
      }, {
        id: 2,
        name: 'Testing'
      }],
      isUserAuthor: true,
      timeEntry: {
        activity: {
          id: 1,
          name: 'Development'
        },
        comments: 'Hello world',
        created_on: '2011-01-01',
        hours: 10,
        id: 1,
        issue: {
          id: 1,
          name: 'Cover a modal with tests'
        },
        project: {
          id: 1,
          name: 'Testing Project'
        },
        spent_on: '2011-01-01',
        user: {
          id: 1,
          name: 'John Wayne'
        }
      },
      onClose: jest.fn(),
      isOpen: true,
      isEditable: true
    };
    const state = {
      timeEntry: {
        isFetching: false,
        error: undefined
      }
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TimeEntryModal {...props} />
        </ThemeProvider>
      </Provider>
    );
    expect(toJSON(wrapper)).toMatchSnapshot();
  });

  it('should set wasModified to true if date was modified', () => {
    const props = {
      activities: [{
        id: 1,
        name: 'Development'
      }, {
        id: 2,
        name: 'Testing'
      }],
      isUserAuthor: true,
      timeEntry: {
        activity: {
          id: 1,
          name: 'Development'
        },
        comments: 'Hello world',
        created_on: '2011-01-01',
        hours: 10,
        id: 1,
        issue: {
          id: 1,
          name: 'Cover a modal with tests'
        },
        project: {
          id: 1,
          name: 'Testing Project'
        },
        spent_on: '2011-01-01',
        user: {
          id: 1,
          name: 'John Wayne'
        }
      },
      onClose: jest.fn(),
      isOpen: true,
      isEditable: true
    };
    const state = {
      timeEntry: {
        isFetching: false,
        error: undefined
      }
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TimeEntryModal {...props} />
        </ThemeProvider>
      </Provider>
    );

    const modal = wrapper.find('TimeEntryModal').instance();
    expect(modal).toBeTruthy();

    expect(modal.state.wasModified).toBe(false);
    modal.onDateChange(new Date());
    expect(modal.state.wasModified).toBe(true);
    modal.setState({ wasModified: false });
    expect(modal.state.wasModified).toBe(false);
    modal.onHoursChange({ target: { value: '15.2' } });
    expect(modal.state.wasModified).toBe(true);
    modal.setState({ wasModified: false });
    expect(modal.state.wasModified).toBe(false);
    modal.onCommentsChange('For Science');
    expect(modal.state.wasModified).toBe(true);
    modal.setState({ wasModified: false });
    expect(modal.state.wasModified).toBe(false);
    modal.onActivityChange({ value: 1, label: 'Development' });
    expect(modal.state.wasModified).toBe(true);
  });

  it('should disable editable components if isEditable is false', () => {
    const props = {
      activities: [{
        id: 1,
        name: 'Development'
      }, {
        id: 2,
        name: 'Testing'
      }],
      isUserAuthor: true,
      timeEntry: {
        activity: {
          id: 1,
          name: 'Development'
        },
        comments: 'Hello world',
        created_on: '2011-01-01',
        hours: 10,
        id: 1,
        issue: {
          id: 1,
          name: 'Cover a modal with tests'
        },
        project: {
          id: 1,
          name: 'Testing Project'
        },
        spent_on: '2011-01-01',
        user: {
          id: 1,
          name: 'John Wayne'
        }
      },
      onClose: jest.fn(),
      isOpen: true,
      isEditable: false
    };
    const state = {
      timeEntry: {
        isFetching: false,
        error: undefined
      }
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TimeEntryModal {...props} />
        </ThemeProvider>
      </Provider>
    );

    expect(wrapper.find('Input[name="hours"]').prop('disabled')).toBe(true);
    expect(wrapper.find('DatePicker[name="date"]').prop('isDisabled')).toBe(true);
  });

  it('should add a new time entry', () => {
    const props = {
      activities: [{
        id: 1,
        name: 'Development'
      }, {
        id: 2,
        name: 'Testing'
      }],
      isUserAuthor: true,
      timeEntry: {
        activity: {
          id: 1,
          name: 'Development'
        },
        comments: 'Hello world',
        created_on: '2011-01-01',
        hours: 10,
        issue: {
          id: 1,
          name: 'Cover a modal with tests'
        },
        project: {
          id: 1,
          name: 'Testing Project'
        },
        spent_on: '2011-01-01',
        user: {
          id: 1,
          name: 'John Wayne'
        }
      },
      onClose: jest.fn(),
      isOpen: true,
      isEditable: true
    };
    const state = {
      timeEntry: {
        isFetching: false,
        error: undefined
      }
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TimeEntryModal {...props} />
        </ThemeProvider>
      </Provider>
    );

    const modal = wrapper.find('TimeEntryModal').instance();
    expect(modal).toBeTruthy();

    expect(wrapper.exists('#btn-add')).toBe(true);
    const actionSpy = jest.spyOn(actions.default, 'publish');
    wrapper.find('#btn-add').hostNodes().simulate('click');
    expect(store.getActions().length).toBe(1);
    expect(store.getActions()[0].type).toEqual(actions.TIME_ENTRY_PUBLISH);

    expect(actionSpy).toHaveBeenCalled();
  });

  it('should update the existing time entry', () => {
    const props = {
      activities: [{
        id: 1,
        name: 'Development'
      }, {
        id: 2,
        name: 'Testing'
      }],
      isUserAuthor: true,
      timeEntry: {
        id: 1,
        activity: {
          id: 1,
          name: 'Development'
        },
        comments: 'Hello world',
        created_on: '2011-01-01',
        hours: 10,
        issue: {
          id: 1,
          name: 'Cover a modal with tests'
        },
        project: {
          id: 1,
          name: 'Testing Project'
        },
        spent_on: '2011-01-01',
        user: {
          id: 1,
          name: 'John Wayne'
        }
      },
      onClose: jest.fn(),
      isOpen: true,
      isEditable: true
    };
    const state = {
      timeEntry: {
        isFetching: false,
        error: undefined
      }
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TimeEntryModal {...props} />
        </ThemeProvider>
      </Provider>
    );

    const modal = wrapper.find('TimeEntryModal').instance();
    expect(modal).toBeTruthy();
    modal.setState({ wasModified: true });

    expect(wrapper.exists('#btn-update')).toBe(true);
    const actionSpy = jest.spyOn(actions.default, 'update');
    wrapper.find('#btn-update').hostNodes().simulate('click');
    expect(store.getActions().length).toBe(1);
    expect(store.getActions()[0].type).toEqual(actions.TIME_ENTRY_UPDATE);

    expect(actionSpy).toHaveBeenCalled();
  });

  it('should not update the time entry was not modified', () => {
    const props = {
      activities: [{
        id: 1,
        name: 'Development'
      }, {
        id: 2,
        name: 'Testing'
      }],
      isUserAuthor: true,
      timeEntry: {
        id: 1,
        activity: {
          id: 1,
          name: 'Development'
        },
        comments: 'Hello world',
        created_on: '2011-01-01',
        hours: 10,
        issue: {
          id: 1,
          name: 'Cover a modal with tests'
        },
        project: {
          id: 1,
          name: 'Testing Project'
        },
        spent_on: '2011-01-01',
        user: {
          id: 1,
          name: 'John Wayne'
        }
      },
      onClose: jest.fn(),
      isOpen: true,
      isEditable: true
    };
    const state = {
      timeEntry: {
        isFetching: false,
        error: undefined
      }
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TimeEntryModal {...props} />
        </ThemeProvider>
      </Provider>
    );

    const modal = wrapper.find('TimeEntryModal').instance();
    expect(modal).toBeTruthy();
    modal.setState({ wasModified: false });

    expect(wrapper.exists('#btn-update')).toBe(true);
    const actionSpy = jest.spyOn(actions.default, 'update');
    wrapper.find('#btn-update').hostNodes().simulate('click');
    expect(store.getActions().length).toBe(0);

    expect(actionSpy).not.toHaveBeenCalled();
  });

  it('should not display the update buttons if user is not the author', () => {
    const props = {
      activities: [{
        id: 1,
        name: 'Development'
      }, {
        id: 2,
        name: 'Testing'
      }],
      isUserAuthor: false,
      timeEntry: {
        id: 1,
        activity: {
          id: 1,
          name: 'Development'
        },
        comments: 'Hello world',
        created_on: '2011-01-01',
        hours: 10,
        issue: {
          id: 1,
          name: 'Cover a modal with tests'
        },
        project: {
          id: 1,
          name: 'Testing Project'
        },
        spent_on: '2011-01-01',
        user: {
          id: 1,
          name: 'John Wayne'
        }
      },
      onClose: jest.fn(),
      isOpen: true,
      isEditable: true
    };
    const state = {
      timeEntry: {
        isFetching: false,
        error: undefined
      }
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TimeEntryModal {...props} />
        </ThemeProvider>
      </Provider>
    );

    expect(wrapper.exists('#btn-add')).toBe(true);
    expect(wrapper.exists('#btn-update')).toBe(false);
  });
});
