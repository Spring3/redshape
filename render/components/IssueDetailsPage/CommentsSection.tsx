import React, { useMemo } from 'react';
import { css } from '@emotion/react';
// eslint-disable-next-line
import { remote } from 'electron';
import { useTheme } from 'styled-components';

import ReactTimeAgo from 'react-time-ago';
import { MarkdownEditor, MarkdownText } from '../MarkdownEditor';
import { Link } from '../Link';
import { useOvermindActions, useOvermindState } from '../../store';
import { theme as Theme } from '../../theme';
import type { Issue } from '../../../types';
import { Flex } from '../Flex';

const styles = {
  form: (theme: typeof Theme) => css`
    width: 100%;
    background: ${theme.bgDark};
    padding: .8rem 1rem;
    border-radius: 3px;
    box-sizing: border-box;
    border: 2px solid ${theme.bgDark};
    #comments-form {
      background: ${theme.bg};
      padding: 20px;
      border-radius: 3px;
      border: 1px solid ${theme.bgDarker};
    }
  `,
  smallNoticeLink: css`
    font-size: inherit !important;
    margin-right: 5px;
  `,
  smallNotice: (theme: typeof Theme) => css`
    font-size: 12px;
    margin-top: 30px;
    color: ${theme.minorText};
    font-weight: bold;
  `,
  commentsList: (theme: typeof Theme) => css`
    width: 100%;
    padding: 20px 0px;
    margin: 0px;
    border-radius: 3px;
    background: ${theme.bgDark};
  `,
  comment: css`
    flex-grow: 1;
    margin: 1rem 1rem 1rem 1rem;
  `,
  commentHeader: css`
    flex-grow: 1;
    min-width: 20%;
    margin-right: 1rem;
  `,
  commentAuthorName: (theme: typeof Theme) => css`
    margin-top: 0px;
    margin-bottom: 10px;
    color: ${theme.main};
  `,
  commentDate: (theme: typeof Theme) => css`
    color: ${theme.minorText};
    transition: color ease ${theme.transitionTime};
    text-align: left;

    &:hover {
      color: ${theme.normalText};
    }
    margin-bottom: 20px;
  `,
  markdown: (theme: typeof Theme) => css`
    iframe {
      margin-left: 20px;
      padding: 5px 20px 0px 20px;
      background: ${theme.bg};
      border: 1px solid ${theme.bgDarker};
      border-radius: 3px;
      width: 74%;
      min-height: 100px;
    }
  `
};

type CommentsSectionProps = {
  issueId: number;
}

const CommentsSection = ({ issueId }: CommentsSectionProps) => {
  const actions = useOvermindActions();
  const state = useOvermindState();
  const theme = useTheme() as typeof Theme;

  const currentIssue = state.issues.byId[issueId];

  const getJournalEntries = (issue: Issue) => issue.journals?.filter((entry) => entry.notes) || [];

  const sendComments = async (comments?: string) => {
    if (comments) {
      actions.issues.publishComments({ issueId, comments });
    }
  };

  const journalEntries = useMemo(() => getJournalEntries(currentIssue), [currentIssue]);

  return (
    <>
      <Flex alignItems="stretch" direction="column" css={styles.commentsList(theme)}>
        {journalEntries.map((entry) => (
          <Flex justifyContent="center" css={styles.comment} key={entry.id}>
            <Flex direction="column" css={styles.commentHeader}>
              <h4 css={styles.commentAuthorName(theme)}>{entry.user.name}</h4>
              <ReactTimeAgo className="date" date={new Date(entry.createdOn)} />
            </Flex>
            <MarkdownText css={styles.markdown(theme)} name={`comment-${entry.id}`} markdownText={entry.notes as string} />
          </Flex>
        ))}
      </Flex>
      <div css={styles.form(theme)}>
        <MarkdownEditor id="comments-form" name="comments-form" onSubmit={sendComments} />
        <div>
          <p css={styles.smallNotice(theme)}>
            Press&nbsp;
            {remote.process.platform === 'darwin' ? (
              <Link css={styles.smallNoticeLink} href="#">Cmd + Enter</Link>
            ) : (
              <Link css={styles.smallNoticeLink} href="#">Ctrl + Enter</Link>
            )}
            to send
          </p>
        </div>
      </div>
    </>
  );
};

export { CommentsSection };
