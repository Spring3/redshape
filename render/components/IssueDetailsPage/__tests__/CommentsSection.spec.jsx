import React from 'react';
import { ThemeProvider } from 'styled-components';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { noop } from 'lodash';

import CommentsSection from '../CommentsSection';
import theme from '../../../theme';

describe('IssueDetails => CommentsSEction componnet', () => {
  afterEach(cleanup);
  it('should render the comment section', () => {
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

    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <CommentsSection {...props} />
      </ThemeProvider>
    );
    expect(queryByText('Comments')).toBeDefined();
    expect(document.querySelectorAll('.commentsHeader')).toHaveLength(2);
    const usernames = document.querySelectorAll('.username');
    expect(usernames).toHaveLength(2);
    usernames.forEach((username, i) => expect(username.textContent).toBe(props.journalEntries[i].user.name));
    expect(queryByText(props.journalEntries[0].created_on)).toBeDefined();
    expect(queryByText(props.journalEntries[1].created_on)).toBeDefined();
    expect(document.querySelector('#commentsForm')).toBeDefined();
  });

  it('should invoke publishComments function only if the comments are not empty', () => {
    const props = {
      issueId: 1,
      journalEntries: [
        {
          id: 1,
          notes: 'Hello there',
          user: {
            id: 1,
            name: 'John Wayne'
          },
          created_on: '2011-01-01'
        },
        {
          id: 2,
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
    render(
      <ThemeProvider theme={theme}>
        <CommentsSection {...props} />
      </ThemeProvider>
    );
    const textarea = document.querySelector('textarea');
    fireEvent.change(textarea, { target: { value: '' }, preventDefault: noop });
    fireEvent.keyDown(textarea, { keyCode: 13, metaKey: true, ctrlKey: true });
    expect(props.publishComments).not.toHaveBeenCalled();
    fireEvent.change(textarea, { target: { value: 'Comments' }, preventDefault: noop });
    fireEvent.keyDown(textarea, { keyCode: 13, metaKey: true, ctrlKey: true });
    expect(props.publishComments).toHaveBeenCalledWith(props.issueId, 'Comments');
  });
});
