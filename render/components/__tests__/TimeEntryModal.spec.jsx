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
import { initialize, getInstance, reset } from '../../../common/request';
import TimeEntryModal from '../TimeEntryModal';

let axiosMock;
const mockStore = configureStore([thunk]);

describe('TimeEntryModal Component', () => {
  beforeAll(() => {
    reset();
    initialize('redmine.test.test', 'multipass');
    axiosMock = new MockAdapter(getInstance());
  });

  afterEach(() => {
    axiosMock.reset();
  });

  afterAll(() => {
    axiosMock.restore();
    reset();
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
        duration: '10',
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
    // TODO (BUG): this test gives 'JavaScript heap out of memory' (never finishes) due to
    // the Modal/Dialog functionality inside the TimeEntryModal
    // expect(toJSON(wrapper)).toMatchSnapshot();
  });

  it('should set wasModified to true if any of the editable data was modified', () => {
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
        duration: '10',
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
    modal.onDurationChange({ target: { value: '15.2' } });
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
        duration: '10',
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

    expect(wrapper.find('Input[name="duration"]').prop('disabled')).toBe(true);
    expect(wrapper.find('DatePicker[name="date"]').prop('isDisabled')).toBe(true);
  });

  it('should add a new time entry', (done) => {
    axiosMock.onPost('/time_entries.json').reply(() => Promise.resolve([200, {}]));
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
        duration: '10',
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
      },
      user: {
        id: 1
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
    modal.setState({ wasModified: true });
    wrapper.find('#btn-add').hostNodes().simulate('click');
    setTimeout(() => {
      // validation passed, time_entry_publish - start, time_entry_publish - ok
      expect(store.getActions().length).toBe(3);
      expect(store.getActions()[0].type).toEqual(actions.TIME_ENTRY_PUBLISH_VALIDATION_PASSED);
      expect(store.getActions()[1].type).toEqual(actions.TIME_ENTRY_PUBLISH);

      expect(actionSpy).toHaveBeenCalled();
      expect(axiosMock.history.post.length).toBe(1);
      done();
    }, 50);
  });

  it('should update the existing time entry', (done) => {
    axiosMock.onPut('/time_entries/1.json').reply(() => Promise.resolve([200, {}]));
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
        duration: '10',
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
      wasModified: true,
      timeEntry: {
        isFetching: false,
        error: undefined
      },
      user: {
        id: 1
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
    setTimeout(() => {
      // validation passed, time_entry_update - start, time_entry_update - ok
      expect(store.getActions().length).toBe(3);
      expect(store.getActions()[0].type).toBe(actions.TIME_ENTRY_UPDATE_VALIDATION_PASSED);
      expect(store.getActions()[1].type).toBe(actions.TIME_ENTRY_UPDATE);

      expect(actionSpy).toHaveBeenCalled();
      expect(axiosMock.history.put.length).toBe(1);
      done();
    }, 50);
  });

  it('should not update the time entry was not modified', (done) => {
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
        duration: '10',
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
    setTimeout(() => {
      expect(store.getActions().length).toBe(0);

      expect(actionSpy).not.toHaveBeenCalled();
      expect(axiosMock.history.put.length).toBe(0);
      done();
    }, 50);
  });

  it('should disable the UI if user is not the author', () => {
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
        duration: '10',
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

    expect(wrapper.find('Select').prop('isDisabled')).toBe(true);
    expect(wrapper.find('input[name="duration"]').prop('disabled')).toBe(true);
    expect(wrapper.find('DatePicker[name="date"]').prop('isDisabled')).toBe(true);
    expect(wrapper.find('MarkdownEditor').prop('isDisabled')).toBe(true);
    expect(wrapper.exists('#btn-add')).toBe(false);
    expect(wrapper.exists('#btn-update')).toBe(true);
  });

  it('should not add if validation failed', (done) => {
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
        duration: '10',
        hours: 10,
        issue: {
          id: 1,
          name: 'Cover a modal with tests'
        },
        project: {
          id: 1,
          name: 'Testing Project'
        },
        spent_on: new Date(),
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

    expect(wrapper.exists('#btn-add')).toBe(true);
    wrapper.find('#btn-add').hostNodes().simulate('click');
    setTimeout(() => {
      expect(store.getActions().length).toBe(1);
      expect(store.getActions()[0].type).toBe(actions.TIME_ENTRY_PUBLISH_VALIDATION_FAILED);
      expect(axiosMock.history.post.length).toBe(0);
      done();
    }, 50);
  });

  it('should not update if validation failed', (done) => {
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
        duration: '10',
        hours: 10,
        issue: {
          id: 1,
          name: 'Cover a modal with tests'
        },
        project: {
          id: 1,
          name: 'Testing Project'
        },
        spent_on: new Date(),
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
    wrapper.find('#btn-update').hostNodes().simulate('click');
    setTimeout(() => {
      expect(store.getActions().length).toBe(1);
      expect(store.getActions()[0].type).toBe(actions.TIME_ENTRY_UPDATE_VALIDATION_FAILED);
      expect(axiosMock.history.put.length).toBe(0);
      done();
    }, 50);
  });

  it('should reset time entry on unmount', () => {
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
        duration: '10',
        hours: 10,
        issue: {
          id: 1,
          name: 'Cover a modal with tests'
        },
        project: {
          id: 1,
          name: 'Testing Project'
        },
        spent_on: new Date(),
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

    const actionSpy = jest.spyOn(actions.default, 'reset');
    wrapper.unmount();
    expect(actionSpy).toHaveBeenCalled();
    expect(store.getActions().pop().type).toBe(actions.TIME_ENTRY_RESET);
  });
});
