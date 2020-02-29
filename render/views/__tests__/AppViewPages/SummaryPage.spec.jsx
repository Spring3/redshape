import React from 'react';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureStore from 'redux-mock-store';
import MockAdapter from 'axios-mock-adapter';
import { ThemeProvider } from 'styled-components';

import theme from '../../../theme';
import SummaryPage from '../../AppViewPages/SummaryPage';
import issueActions, { ISSUES_GET_PAGE } from '../../../actions/issues.actions';
import { initialize, getInstance, reset } from '../../../../common/request';

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
    cleanup();
  });

  afterAll(() => {
    axiosMock.restore();
    reset();
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
    render(
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
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <HashRouter>
            <SummaryPage />
          </HashRouter>
        </ThemeProvider>
      </Provider>
    );

    fireEvent.change(document.querySelector('input[name="search"]', {
      target: {
        value: 'search'
      }
    }));

    setTimeout(() => {
      expect(store.getActions().length).toBe(2);
      expect(store.getActions().filter((action) => action.type === ISSUES_GET_PAGE).length).toBe(2);
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
    const { getAllByText } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <HashRouter>
            <SummaryPage />
          </HashRouter>
        </ThemeProvider>
      </Provider>
    );

    fireEvent.click(getAllByText('Id').pop());
    setTimeout(() => {
      expect(store.getActions().length).toBe(2);
      expect(store.getActions().filter((action) => action.type === ISSUES_GET_PAGE).length).toBe(2);
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
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <HashRouter>
            <SummaryPage />
          </HashRouter>
        </ThemeProvider>
      </Provider>
    );

    fireEvent.click(document.querySelector('#queryOptions input:first-child'));
    setTimeout(() => {
      expect(store.getActions().length).toBe(3);
      expect(store.getActions().filter((action) => action.type === ISSUES_GET_PAGE).length).toBe(2);
      done();
    }, 1);
  });
});
