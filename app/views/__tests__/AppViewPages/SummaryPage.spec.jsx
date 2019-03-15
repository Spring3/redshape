import React from 'react';
import _ from 'lodash';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { render, fireEvent, cleanup, wait } from 'react-testing-library';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';

import SummaryPage from '../../AppViewPages/SummaryPage';

const mockStore = configureStore([thunk]);

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
  afterEach(() => {
    cleanup();
    fetch.resetMocks();
  });

  it('should match the snapshot', () => {
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
      }
    });
    const tree = renderer.create(
      <Provider store={store}>
        <HashRouter><SummaryPage /></HashRouter>
      </Provider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  describe('[integration] - App View -> Summary Page', () => {
    it('render issues in the table', () => {
      const { issues, expectedHeaders, valueMapping } = fixtures;
      fetch.mockResponse(JSON.stringify({ issues }));
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
            data: issues
          }
        }
      });
      const wrapper = mount(
        <Provider store={store}>
          <HashRouter><SummaryPage /></HashRouter>
        </Provider>
      );

      const summaryPage = wrapper.find('SummaryPage');
      expect(summaryPage.state('issues')).toEqual(issues);

      const tableRows = wrapper.find('tr');
      expect(tableRows.length).toBe(issues.length + 1); // because table headers take 1 tr

      const tableHeaders = tableRows.at(0).children();

      for (let i = 0; i < expectedHeaders.length; i++) {
        expect(tableHeaders.at(i).text()).toBe(expectedHeaders[i]);
      }

      // -1 to not include the title row
      for (let i = 0; i < tableRows.length - 1; i++) {
        const tableData = tableRows.at(i + 1).children();
        for (let j = 0; j < tableData.length; j++) {
          expect(tableData.at(j).text()).toBe(_.get(issues[i], valueMapping[expectedHeaders[j]]));
        }
      }
    });

    it('should be able to search the items in the issues table', () => {
      const { issues, expectedHeaders, valueMapping } = fixtures;
      fetch.mockResponse(JSON.stringify({ issues }));
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
            data: issues
          }
        }
      });
      const wrapper = mount(
        <Provider store={store}>
          <HashRouter><SummaryPage /></HashRouter>
        </Provider>
      );

      let summaryPage = wrapper.find('SummaryPage');
      expect(summaryPage.state('issues')).toEqual(issues);
      const input = wrapper.find('input[name="search"]');
      expect(input.exists()).toBeTruthy();

      input.simulate('change', { target: { value: issues[1].subject } });
      wrapper.update();

      summaryPage = wrapper.find('SummaryPage');
      expect(summaryPage.state('issues')).toEqual(issues.slice(1, 2));

      const tableRows = wrapper.find('tr');
      expect(tableRows.length).toBe(2); // because table headers take 1 tr + 1 row with result

      // starting at 1 to not include the title row
      const tableData = tableRows.at(1).children();
      for (let j = 0; j < tableData.length; j++) {
        expect(tableData.at(j).text()).toBe(_.get(issues[1], valueMapping[expectedHeaders[j]]));
      }
    });

    it('should be able to include closed tasks in the table', () => {
      const { issues } = fixtures;
      fetch.mockResponse(JSON.stringify({ issues }));
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
            data: issues
          }
        }
      });
      const wrapper = mount(
        <Provider store={store}>
          <HashRouter><SummaryPage /></HashRouter>
        </Provider>
      );

      const summaryPage = wrapper.find('SummaryPage');
      expect(summaryPage.state('issues')).toEqual(issues);
      expect(summaryPage.state('showClosed')).toBe(false);

      const checkbox = wrapper.find('input[name="showClosed"]');
      expect(checkbox.exists()).toBeTruthy();

      checkbox.simulate('change', { target: { checked: true } });
      wrapper.update();

      expect(summaryPage.state('showClosed')).toBe(true);
      expect(store.getActions().length).toBe(2);
    });
  });
});
