import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { SETTINGS_ISSUE_HEADERS } from '../../../actions/settings.actions';
import ColumnHeadersSelect from '../ColumnHeadersSelect';
import theme from '../../../theme';

const mockStore = configureStore([thunk]);

describe('SummaryPage => ColumnHeadersSelect componnet', () => {
  it('should match the snapshot', () => {
    const state = {
      settings: {
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
      }
    };
    const store = mockStore(state);
    const tree = renderer.create(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ColumnHeadersSelect />
        </ThemeProvider>
      </Provider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should emit an action when the issue headers are changed', () => {
    const state = {
      settings: {
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
      user: {
        id: 1,
        redmineEndpoint: 'https://redmine.redmine'
      }
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ColumnHeadersSelect />
        </ThemeProvider>
      </Provider>
    );
    const section = wrapper.find('ColumnHeadersSelect').instance();
    expect(section).toBeTruthy();

    section.onHeadersSelectChange('due_date', {});
    expect(store.getActions().length).toBe(1);
    expect(store.getActions()[0].type).toBe(SETTINGS_ISSUE_HEADERS);
  });
});
