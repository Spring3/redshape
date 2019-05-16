import React from 'react';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import MockAdapter from 'axios-mock-adapter';
import { ThemeProvider } from 'styled-components';

import theme from '../../../theme';
import SummaryPage from '../../AppViewPages/SummaryPage';
import issueActions, { ISSUES_GET_PAGE } from '../../../actions/issues.actions';
import { initialize, getInstance, reset } from '../../../../modules/request';

const mockStore = configureStore([thunk]);
const redmineEndpoint = 'redmine.test.test';
const token = 'multipass';

let axiosMock;

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
    const spy = jest.spyOn(issueActions, 'getPage');
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

    expect(spy).toHaveBeenCalled();
    expect(store.getActions()[0].type).toBe(ISSUES_GET_PAGE);
    expect(store.getActions()[0].info.page).toBe(0);
    spy.mockRestore();
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
      expect(store.getActions().filter(action => action.type === ISSUES_GET_PAGE).length).toBe(2);
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
      expect(store.getActions().filter(action => action.type === ISSUES_GET_PAGE).length).toBe(2);
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
      expect(store.getActions().filter(action => action.type === ISSUES_GET_PAGE).length).toBe(2);
      done();
    }, 1);
  });
});
