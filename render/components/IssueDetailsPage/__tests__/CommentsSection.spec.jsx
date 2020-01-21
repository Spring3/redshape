import React from 'react';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';

import CommentsSection from '../CommentsSection';
import theme from '../../../theme';

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

describe('IssueDetails => CommentsSEction componnet', () => {
  it('should match the snapshot', () => {
    const props = {
      issueId: 1,
      journalEntries: [
        {
          notes: 'Hello there',
          user: {
            id: 1,
            name: 'John Wayne'
          },
          created_on: '2011-01-01'
        },
        {
          notes: 'Does your town need a hero?',
          user: {
            id: 1,
            name: 'John Wayne'
          },
          created_on: '2011-01-02'
        }
      ],
      publishComments: jest.fn()
    };
    const state = {
      settings: {
        uiStyle: 'colors',
      },
    };
    const store = mockStore(state);
    const tree = renderer.create(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CommentsSection {...props} />
        </ThemeProvider>
      </Provider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should invoke publishComments function only if the comments are not empty', () => {
    const props = {
      issueId: 1,
      journalEntries: [
        {
          notes: 'Hello there',
          user: {
            id: 1,
            name: 'John Wayne'
          },
          created_on: '2011-01-01'
        },
        {
          notes: 'Does your town need a hero?',
          user: {
            id: 1,
            name: 'John Wayne'
          },
          created_on: '2011-01-02'
        }
      ],
      publishComments: jest.fn()
    };
    const state = {
      settings: {
        uiStyle: 'colors',
      },
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CommentsSection {...props} />
        </ThemeProvider>
      </Provider>
    );
    const section = wrapper.find('CommentsSection').instance();
    expect(section).toBeTruthy();
    section.sendComments('');
    expect(props.publishComments).not.toHaveBeenCalled();
    section.sendComments('Comments');
    expect(props.publishComments).toHaveBeenCalledWith(props.issueId, 'Comments');
  });
});
