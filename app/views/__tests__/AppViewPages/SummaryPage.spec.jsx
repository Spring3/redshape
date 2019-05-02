import React from 'react';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import MockAdapter from 'axios-mock-adapter';
import { ThemeProvider } from 'styled-components';

import { initialize, getInstance, reset } from '../../../../modules/request';
import theme from '../../../theme';
import SummaryPage from '../../AppViewPages/SummaryPage';
import { ISSUES_GET_ALL } from '../../../actions/issues.actions';

const mockStore = configureStore([thunk]);
const redmineEndpoint = 'redmine.test.test';
const token = 'multipass';

let axiosMock;

const fixtures = {
  issues: [
    {
      id: '1',
      project: { name: 'Test Project 1' },
      tracker: { name: 'Test Tracker 1' },
      status: { name: 'Open' },
      subject: 'Task #1',
      priority: { name: 'High' },
      estimated_hours: '10',
      due_date: new Date().toISOString()
    },
    {
      id: '2',
      project: { name: 'Test Project 2' },
      tracker: { name: 'Test Tracker 2' },
      status: { name: 'Open' },
      subject: 'Task #2',
      priority: { name: 'Normal' },
      estimated_hours: '5',
      due_date: new Date().toISOString()
    },
    {
      id: '3',
      project: { name: 'Test Project 3' },
      tracker: { name: 'Test Tracker 3' },
      status: { name: 'Open' },
      subject: 'Task #3',
      priority: { name: 'Low' },
      estimated_hours: '2',
      due_date: new Date().toISOString()
    }
  ], // Id and Subject are fixed, so they go first
  expectedHeaders: ['Id', 'Subject', 'Project', 'Tracker', 'Status', 'Priority', 'Estimation', 'Due Date'],
  valueMapping: {
    Id: 'id',
    Project: 'project.name',
    Tracker: 'tracker.name',
    Status: 'status.name',
    Subject: 'subject',
    Priority: 'priority.name',
    Estimation: 'estimated_hours',
    'Due Date': 'due_date'
  }
};

describe('AppView -> Summary Page', () => {
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
    axiosMock.onGet('/issues.json').reply(() => Promise.resolve([200, {}]));
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
      },
      settings: {
        issueHeaders: [
          { label: 'Id', isFixed: true, value: 'id' },
          { label: 'Subject', isFixed: true, value: 'subject' }
        ]
      }
    });
    const tree = renderer.create(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <SummaryPage />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should fetch the issues on mount', () => {
    axiosMock.onGet('/issues.json').reply(() => Promise.resolve([200, {}]));
    const state = {
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
      },
      settings: {
        issueHeaders: [
          { label: 'Id', isFixed: true, value: 'id' },
          { label: 'Subject', isFixed: true, value: 'subject' }
        ]
      }
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <HashRouter>
            <SummaryPage />  
          </HashRouter>
        </ThemeProvider>
      </Provider>
    );

    expect(store.getActions()[0].type).toBe(ISSUES_GET_ALL);
  });

  it('should fetch issues on search', (done) => {
    axiosMock.onGet('/issues.json').reply(() => Promise.resolve([200, {}]));
    const state = {
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
      },
      settings: {
        issueHeaders: [
          { label: 'Id', isFixed: true, value: 'id' },
          { label: 'Subject', isFixed: true, value: 'subject' }
        ]
      }
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <HashRouter>
            <SummaryPage />
          </HashRouter>
        </ThemeProvider>
      </Provider>
    );

    const page = wrapper.find('SummaryPage').instance();
    expect(page).toBeTruthy();

    page.onSearchChange({ target: { value: 'search' } });
    expect(page.state.search).toBe('search');
    setTimeout(() => {
      expect(store.getActions().length).toBe(2);
      expect(store.getActions().filter(action => action.type === ISSUES_GET_ALL).length).toBe(2);
      done();
    }, 1);
  });

  it('should set the sorting properties', (done) => {
    axiosMock.onGet('/issues.json').reply(() => Promise.resolve([200, {}]));
    const state = {
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
      },
      settings: {
        issueHeaders: [
          { label: 'Id', isFixed: true, value: 'id' },
          { label: 'Subject', isFixed: true, value: 'subject' }
        ]
      }
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <HashRouter>
            <SummaryPage />
          </HashRouter>
        </ThemeProvider>
      </Provider>
    );

    const page = wrapper.find('SummaryPage').instance();
    expect(page).toBeTruthy();

    page.onSort('id', 'desc');
    setTimeout(() => {
      expect(page.state.sortBy).toBe('id');
      expect(page.state.sortDirection).toBe('desc');
      expect(store.getActions().length).toBe(2);
      expect(store.getActions().filter(action => action.type === ISSUES_GET_ALL).length).toBe(2);
      done();
    }, 1);
  });

  it('should fetch the issues when showClosedIssues state changes', (done) => {
    axiosMock.onGet('/issues.json').reply(() => Promise.resolve([200, {}]));
    const state = {
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
      },
      settings: {
        issueHeaders: [
          { label: 'Id', isFixed: true, value: 'id' },
          { label: 'Subject', isFixed: true, value: 'subject' }
        ]
      }
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <HashRouter>
            <SummaryPage />
          </HashRouter>
        </ThemeProvider>
      </Provider>
    );

    const page = wrapper.find('SummaryPage').instance();
    expect(page).toBeTruthy();

    page.setState({ showClosedIssues: true });
    setTimeout(() => {
      expect(page.state.showClosedIssues).toBe(true);
      expect(store.getActions().length).toBe(2);
      expect(store.getActions().filter(action => action.type === ISSUES_GET_ALL).length).toBe(2);
      done();
    }, 1);
  });
    // it('render issues in the table', () => {
    //   const { issues, expectedHeaders, valueMapping } = fixtures;
    //   axiosMock.onGet('/issues.json').reply(() => Promise.resolve([200, { issues }]));
    //   const store = mockStore({
    //     user: {
    //       id: 1,
    //       firstname: 'firstname',
    //       lastname: 'lastname',
    //       redmineEndpoint: 'https://redmine.domain',
    //       api_key: '123abc'
    //     },
    //     issues: {
    //       all: {
    //         data: issues
    //       }
    //     },
    //     settings: {
    //       issueHeaders: [
    //         { label: 'Id', isFixed: true, value: 'id' },
    //         { label: 'Subject', isFixed: true, value: 'subject' }
    //       ]
    //     }
    //   });
    //   const wrapper = mount(
    //     <Provider store={store}>
    //       <HashRouter>
    //         <ThemeProvider theme={theme}>
    //           <SummaryPage />
    //         </ThemeProvider>
    //       </HashRouter>
    //     </Provider>
    //   );

    //   const summaryPage = wrapper.find('SummaryPage');
    //   expect(summaryPage.state('issues')).toEqual(issues);

    //   const tableRows = wrapper.find('tr');
    //   expect(tableRows.length).toBe(issues.length + 1); // because table headers take 1 tr

    //   const tableHeaders = tableRows.at(0).children();

    //   for (let i = 0; i < expectedHeaders.length; i++) {
    //     expect(tableHeaders.at(i).text()).toBe(expectedHeaders[i]);
    //   }

    //   // -1 to not include the title row
    //   for (let i = 0; i < tableRows.length - 1; i++) {
    //     const tableData = tableRows.at(i + 1).children();
    //     for (let j = 0; j < tableData.length; j++) {
    //       expect(tableData.at(j).text()).toBe(_.get(issues[i], valueMapping[expectedHeaders[j]]));
    //     }
    //   }
    // });

    // it('should be able to search the items in the issues table', () => {
    //   const { issues, expectedHeaders, valueMapping } = fixtures;
    //   fetch.mockResponse(JSON.stringify({ issues }));
    //   const store = mockStore({
    //     user: {
    //       id: 1,
    //       firstname: 'firstname',
    //       lastname: 'lastname',
    //       redmineEndpoint: 'https://redmine.domain',
    //       api_key: '123abc'
    //     },
    //     issues: {
    //       all: {
    //         data: issues
    //       }
    //     }
    //   });
    //   const wrapper = mount(
    //     <Provider store={store}>
    //       <HashRouter><SummaryPage /></HashRouter>
    //     </Provider>
    //   );

    //   let summaryPage = wrapper.find('SummaryPage');
    //   expect(summaryPage.state('issues')).toEqual(issues);
    //   const input = wrapper.find('input[name="search"]');
    //   expect(input.exists()).toBeTruthy();

    //   input.simulate('change', { target: { value: issues[1].subject } });
    //   wrapper.update();

    //   summaryPage = wrapper.find('SummaryPage');
    //   expect(summaryPage.state('issues')).toEqual(issues.slice(1, 2));

    //   const tableRows = wrapper.find('tr');
    //   expect(tableRows.length).toBe(2); // because table headers take 1 tr + 1 row with result

    //   // starting at 1 to not include the title row
    //   const tableData = tableRows.at(1).children();
    //   for (let j = 0; j < tableData.length; j++) {
    //     expect(tableData.at(j).text()).toBe(_.get(issues[1], valueMapping[expectedHeaders[j]]));
    //   }
    // });

    // it('should be able to include closed tasks in the table', () => {
    //   const { issues } = fixtures;
    //   fetch.mockResponse(JSON.stringify({ issues }));
    //   const store = mockStore({
    //     user: {
    //       id: 1,
    //       firstname: 'firstname',
    //       lastname: 'lastname',
    //       redmineEndpoint: 'https://redmine.domain',
    //       api_key: '123abc'
    //     },
    //     issues: {
    //       all: {
    //         data: issues
    //       }
    //     }
    //   });
    //   const wrapper = mount(
    //     <Provider store={store}>
    //       <HashRouter><SummaryPage /></HashRouter>
    //     </Provider>
    //   );

    //   const summaryPage = wrapper.find('SummaryPage');
    //   expect(summaryPage.state('issues')).toEqual(issues);
    //   expect(summaryPage.state('showClosed')).toBe(false);

    //   const checkbox = wrapper.find('input[name="showClosed"]');
    //   expect(checkbox.exists()).toBeTruthy();

    //   checkbox.simulate('change', { target: { checked: true } });
    //   wrapper.update();

    //   expect(summaryPage.state('showClosed')).toBe(true);
    //   expect(store.getActions().length).toBe(2);
    // });
});
