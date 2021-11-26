import React, {
  useState, useMemo, useCallback
} from 'react';
import { css } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'styled-components';

import { get } from 'lodash';
import { theme as Theme } from '../../theme';
import { ProcessIndicator, OverlayProcessIndicator } from '../ProcessIndicator';
import Date from '../Date';
import { useOvermindActions, useOvermindState } from '../../store';
import { IssueFilter } from '../../actions/helper';
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch';
import { issueHeaders } from '../constants';
import { IssuesTableHead } from './IssuesTableHead';
import { IssueHeader, SortingDirection, Ticket } from '../../../types';
import { IssuesTableEmptyState } from './IssuesTableEmptyState';
import { IssuesTableEmptySearchState } from './IssuesTableEmptySearchState';

const styles = {
  processIndicatorText: css`
    white-space: nowrap;
    padding-left: 20px;
    vertical-align: middle;
  `,
  tableBody: css`
    text-align: center;
    font-size: 14px;
    overflow-y: scroll;
    max-height: 60vh;
  `,
  processIndicatorWrapper: css`
    position: absolute;
    width: 100%;
    display: flex;
    margin-top: 1.5rem;
  `,
  processIndicatorContainer: css`
    margin: 0 auto;
  `
};

const IssuesTable = ({ search }: { search?: string }) => {
  const [sortBy, setSortBy] = useState<IssueHeader['value']>();
  const [sortDirection, setSortDirection] = useState<SortingDirection>('asc');

  const navigate = useNavigate();
  const state = useOvermindState();
  const actions = useOvermindActions();

  const theme = useTheme() as typeof Theme;

  const filters = useMemo(
    () => new IssueFilter()
      .assignee(state.users.currentUser?.id)
      .status({ open: true, closed: state.settings.showClosedIssues })
      .title(search)
      .sort(sortBy, sortDirection)
      .build(),
    [state.users.currentUser, state.settings.showClosedIssues, search, sortBy, sortDirection]
  );

  const {
    isFetching, items: tickets, error, fetchTriggerElementRef
  } = usePaginatedFetch<Ticket>({
    request: actions.tickets.getMany,
    filters,
  });

  const sortTable = useCallback((by: IssueHeader['value']) => {
    if (sortBy !== by) {
      setSortBy(by);
      setSortDirection('asc');
    } else {
      setSortDirection(sortDir => (sortDir === 'asc' ? 'desc' : 'asc'));
    }
  }, [sortBy]);

  const showIssueDetails = (id: number) => {
    navigate(`${id}`);
  };

  if (!tickets.length && isFetching) {
    return (
      <OverlayProcessIndicator>
        <span css={styles.processIndicatorText}>Please wait...</span>
      </OverlayProcessIndicator>
    );
  }

  if (!tickets.length && !search) {
    return (
      <>
        <table css={css`
          position: relative;
          width: 100%;
          margin-top: 0.5rem;
          border: 2px solid ${theme.bgDark};
          border-spacing: 0px;
        `}
        >
          <IssuesTableHead />
        </table>
        <IssuesTableEmptyState />
      </>
    );
  }

  if (!tickets.length && search) {
    return (
      <>
        <table css={css`
          position: relative;
          width: 100%;
          margin-top: 0.5rem;
          border: 2px solid ${theme.bgDark};
          border-spacing: 0px;
        `}
        >
          <IssuesTableHead />
        </table>
        <IssuesTableEmptySearchState />
      </>
    );
  }

  return (
    <table css={css`
    position: relative;
    width: 100%;
    margin-top: 0.5rem;
    border: 2px solid ${theme.bgDark};
    border-spacing: 0px;
  `}>
      <IssuesTableHead sortBy={sortBy} sortDirection={sortDirection} onSort={sortTable} />
      <tbody css={styles.tableBody}>
        {tickets.map((task, index) => (
          <tr
            css={css`
              &:hover {
                cursor: pointer;
          
                td {
                  background: ${theme.bgDark};
                }
              }
            `}
            ref={index === tickets.length - 1 ? fetchTriggerElementRef : null}
            key={task.id}
            onClick={() => showIssueDetails(task.id)}
          >
            {issueHeaders.map(header => {
              const date = header.value === 'due_date' && get(task, header.value);
              let forcedValue;
              const estimated_hours = header.value === 'estimated_hours' && get(task, header.value);
              if (estimated_hours) {
                forcedValue = Number(estimated_hours.toFixed(2));
              }
              return (
                <td
                  css={
                  css`
                    cursor: pointer;
                    border-bottom: 2px solid ${theme.bgDark};
                    padding: 15px 5px;
                    transition: background ease ${theme.transitionTime};
                    ${header.value === 'due_date' ? 'white-space: nowrap' : ''};
                    ${header.value === 'subject' ? 'text-align: start' : ''};
                  `
                }
                  key={header.value}
                >
                  {date ? (
                    <Date date={date} />
                  ) : (
                    <span>{forcedValue || get(task, header.value)}</span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
        {isFetching ? (
          <tr css={styles.processIndicatorWrapper}>
            <td css={styles.processIndicatorContainer}>
              <ProcessIndicator className="container">
                <span css={styles.processIndicatorText}>Fetching more...</span>
              </ProcessIndicator>
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
};

export { IssuesTable };
