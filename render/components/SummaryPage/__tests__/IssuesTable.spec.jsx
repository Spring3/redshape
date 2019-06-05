import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { HashRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';

import IssuesTable from '../IssuesTable';
import { getInstance, reset, initialize } from '../../../../common/request';
import theme from '../../../theme';

const redmineEndpoint = 'redmint.test.test';
const token = 'multipass';
const mockStore = configureStore([thunk]);
const state = {
  settings: {
    useColors: true,
    issueHeaders: [
      { label: 'Id', isFixed: true, value: 'id' },
      { label: 'Project', value: 'project.name' },
      { label: 'Tracker', value: 'tracker.name' },
      { label: 'Status', value: 'status.name' },
      { label: 'Subject', isFixed: true, value: 'subject' },
      { label: 'Priority', value: 'priority.name' },
      { label: 'Estimation', value: 'estimated_hours' },
      { label: 'Due Date', value: 'due_date' }
    ]
  },
  issues: {
    all: {
      data: [
        {
          id: 1,
          project: { name: 'Test Project 1' },
          tracker: { name: 'Test Tracker 1' },
          status: { name: 'Open' },
          subject: 'Task #1',
          priority: { name: 'High' },
          estimated_hours: '10',
          due_date: '2011-01-01'
        },
        {
          id: 2,
          project: { name: 'Test Project 2' },
          tracker: { name: 'Test Tracker 2' },
          status: { name: 'Open' },
          subject: 'Task #2',
          priority: { name: 'Normal' },
          estimated_hours: '5',
          due_date: '2011-01-01'
        },
        {
          id: 3,
          project: { name: 'Test Project 3' },
          tracker: { name: 'Test Tracker 3' },
          status: { name: 'Open' },
          subject: 'Task #3',
          priority: { name: 'Low' },
          estimated_hours: '2',
          due_date: '2011-01-01'
        }
      ]
    }
  }
};

let axiosMock;

describe('SummaryPage => IssuesTable component', () => {
  beforeAll(() => {
    initialize(redmineEndpoint, token);
    axiosMock = new MockAdapter(getInstance());
    axiosMock.onAny('*').reply(() => Promise.resolve([200]));
  });

  afterEach(() => {
    axiosMock.reset();
  });

  afterAll(() => {
    axiosMock.restore();
    reset();
  });

  it('should match the snapshot', () => {
    const store = mockStore(state);
    const onSort = jest.fn();
    const tree = renderer.create(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <IssuesTable onSort={onSort} />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('allow the table to be sorted', (done) => {
    const store = mockStore(state);
    const onSort = jest.fn();
    const wrapper = mount(
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider theme={theme}>
            <IssuesTable onSort={onSort} />
          </ThemeProvider>
        </HashRouter>
      </Provider>
    );
    // 1st row, 1st column
    wrapper.find('tr').at(0).find('th').at(0).simulate('click');
    setImmediate(() => {
      expect(onSort).toHaveBeenCalledWith('id', 'asc');
      done();
    });
  });
});
