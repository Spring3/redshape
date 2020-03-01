import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import ColumnHeadersSelect from '../ColumnHeadersSelect';
import theme from '../../../theme';

const mockStore = configureStore([thunk]);

describe('SummaryPage => ColumnHeadersSelect componnet', () => {
  afterEach(cleanup);
  it('should display the column header section', () => {
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
    const { getByText } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ColumnHeadersSelect />
        </ThemeProvider>
      </Provider>
    );
    state.settings.issueHeaders.forEach((header) => expect(getByText(header.label)).toBeDefined());
    expect(document.querySelectorAll('input[name="headers"]')).toHaveLength(state.settings.issueHeaders.length);
  });
});
