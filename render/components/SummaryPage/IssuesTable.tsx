import React, { useState, useEffect, useCallback } from 'react';
import { css as emotionCss } from '@emotion/react';
import { useHistory } from 'react-router-dom';
import styled, { css } from 'styled-components';
import SortAscendingIcon from 'mdi-react/SortAscendingIcon';
import SortDescendingIcon from 'mdi-react/SortDescendingIcon';

import { debounce, get } from 'lodash';
import InfiniteScroll from '../InfiniteScroll';
import { ProcessIndicator, OverlayProcessIndicator } from '../ProcessIndicator';
import Date from '../Date';
import { useOvermindActions, useOvermindState } from '../../store';
import { IssueFilter } from '../../actions/helper';

const Table = styled.table`
  position: relative;
  min-height: 200px;
  width: 100%;
  border: 2px solid ${props => props.theme.bgDark};
  border-spacing: 0px;

  tbody {
    text-align: center;
    font-size: 14px;
    overflow-y: scroll;
    max-height: 60vh;

    tr {
      td {
        border-bottom: 2px solid ${props => props.theme.bgDark};
        padding: 15px 5px;
        transition: background ease ${props => props.theme.transitionTime};
      }

      &:hover {
        cursor: pointer;

        td {
          background: ${props => props.theme.bgDark};
        }
      }

      td.due_date {
        white-space: nowrap;
      }
    }
  }

  thead {
    z-index: 1;
    tr {
      th {
        padding: 15px 5px;
        background: ${props => props.theme.bgDark};
        border-bottom: 2px solid ${props => props.theme.bgDarker};
        transition: color ease ${props => props.theme.transitionTime};
        &:hover {
          cursor: pointer;
          color: ${props => props.theme.main};
        }

        svg {
          vertical-align: middle;
        }
      }
    }
  }
`;

const ProcessIndicatorContainer = styled.tr`
  position: absolute;
  width: 100%;
  text-align: center;

  div.container {
    position: absolute;
    top: 15px;
    left: 45%;
  }
`;

const ColorfulSpan = styled.span`
  ${props => (props.color
    ? css`
          padding-bottom: 2px;
          background: linear-gradient(
            to bottom,
            transparent 0,
            transparent 90%,
            ${props.color} 90%,
            ${props.color} 100%
          );
        `
    : null)}
`;

const styles = {
  processIndicatorText: emotionCss`
    white-space: nowrap;
    padding-left: 20px;
    vertical-align: middle;
  `
};

const colorMap = {
  closed: 'red',
  high: 'yellow',
  urgent: 'red',
  immediate: 'red',
  critical: 'red',
  open: 'green',
  low: 'green',
  pending: 'yellow',
  normal: 'yellow'
};

type SortingDirection = 'asc' | 'desc';

const IssuesTable = ({ search }: { search?: string }) => {
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<Error>();
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<SortingDirection>('asc');

  const history = useHistory();
  const state = useOvermindState();
  const actions = useOvermindActions();
  const issues = state.issues.list;

  const isFetching = state.issues.status === 'fetching';

  const onSort = (sortingBy: string, sortingDirection: SortingDirection) => {
    setSortBy(sortingBy);
    setSortDirection(sortingDirection);
  };

  const sendFetchIssues = useCallback(async () => {
    const queryFilter = new IssueFilter()
      .assignee(state.users.currentUser?.id as string)
      .status({ open: true, closed: state.settings.showClosedIssues })
      .title(search)
      .sort(sortBy, sortDirection)
      .build();

    const res = await actions.issues.getMany({
      filters: queryFilter,
      offset: issues.length
    });

    setHasMore(res.hasMore);

    if (res.success) {
      setError(undefined);
      return res.data;
    }

    setError(res.error);
    return null;
  }, [issues.length, state.settings.showClosedIssues]);

  useEffect(() => {
    sendFetchIssues();
  }, []);

  const deboucedFetch = debounce(sendFetchIssues, 500);

  useEffect(() => {
    deboucedFetch();
  }, [search, sortBy, sortDirection]);

  const sortTable = (by: string) => {
    if (sortBy !== by) {
      setSortBy(by);
      setSortDirection('asc');
    } else {
      setSortDirection((sortDir) => (sortDir === 'asc' ? 'desc' : 'asc'));
    }
  };

  useEffect(() => {
    onSort(sortBy, sortDirection);
  }, [sortBy, sortDirection]);

  const showIssueDetails = (id: string) => {
    history.push(`/app/issue/${id}/`);
  };

  const { issueHeaders } = state.settings;

  if (!issues.length && isFetching) {
    return (
      <OverlayProcessIndicator>
        <span css={styles.processIndicatorText}>Please wait...</span>
      </OverlayProcessIndicator>
    );
  }

  return (
    <Table>
      <thead>
        <tr>
          {issueHeaders.map(header => (
            <th key={header.value} onClick={() => sortTable(header.value)}>
              {header.label}
              &nbsp;
              {sortBy === header.value && sortDirection === 'asc' && (
                <SortAscendingIcon size={14} />
              )}
              {sortBy === header.value && sortDirection === 'desc' && (
                <SortDescendingIcon size={14} />
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <InfiniteScroll
          load={sendFetchIssues}
          isEnd={!hasMore}
          hasMore={!isFetching && !error && hasMore}
          container={window}
          loadIndicator={(
            <ProcessIndicatorContainer>
              <td>
                <ProcessIndicator className="container">
                  <span css={styles.processIndicatorText}>Please wait...</span>
                </ProcessIndicator>
              </td>
            </ProcessIndicatorContainer>
          )}
          immediate={true}
        >
          {issues.map(task => (
            <tr key={task.id} onClick={() => showIssueDetails(task.id)}>
              {issueHeaders.map(header => {
                const date = header.value === 'due_date' && get(task, header.value);
                let forcedValue;
                const estimated_hours = header.value === 'estimated_hours' && get(task, header.value);
                if (estimated_hours) {
                  forcedValue = Number(estimated_hours.toFixed(2));
                }
                return (
                  <td
                    key={header.value}
                    className={header.value === 'due_date' ? header.value : ''}
                  >
                    {date ? (
                      <Date date={date} />
                    ) : (
                      <ColorfulSpan>{forcedValue || get(task, header.value)}</ColorfulSpan>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </InfiniteScroll>
      </tbody>
    </Table>
  );
};

export { IssuesTable };
