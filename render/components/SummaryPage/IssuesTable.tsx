import React, {
  useState, useEffect, useCallback, useMemo, useRef
} from 'react';
import { css } from '@emotion/react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import SortAscendingIcon from 'mdi-react/SortAscendingIcon';
import SortDescendingIcon from 'mdi-react/SortDescendingIcon';

import { get } from 'lodash';
import { ProcessIndicator, OverlayProcessIndicator } from '../ProcessIndicator';
import Date from '../Date';
import { useOvermindActions, useOvermindState } from '../../store';
import { IssueFilter } from '../../actions/helper';
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch';

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

const styles = {
  processIndicatorText: css`
    white-space: nowrap;
    padding-left: 20px;
    vertical-align: middle;
  `
};

type SortingDirection = 'asc' | 'desc';

const IssuesTable = ({ search }: { search?: string }) => {
  const containerRef = useRef(null);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<SortingDirection>('asc');

  const history = useHistory();
  const state = useOvermindState();
  const actions = useOvermindActions();

  const onSort = (sortingBy: string, sortingDirection: SortingDirection) => {
    setSortBy(sortingBy);
    setSortDirection(sortingDirection);
  };

  const filters = useMemo(
    () => new IssueFilter()
      .assignee(state.users.currentUser?.id as string)
      .status({ open: true, closed: state.settings.showClosedIssues })
      .title(search)
      .sort(sortBy, sortDirection)
      .build(),
    [state.users.currentUser, state.settings.showClosedIssues, search, sortBy, sortDirection]
  );

  const { isFetching, items: issues, error } = usePaginatedFetch({
    request: actions.issues.getMany,
    filters,
    containerRef
  });

  const sortTable = (by: string) => {
    if (sortBy !== by) {
      setSortBy(by);
      setSortDirection('asc');
    } else {
      setSortDirection(sortDir => (sortDir === 'asc' ? 'desc' : 'asc'));
    }
  };

  useEffect(() => {
    onSort(sortBy, sortDirection);
  }, [sortBy, sortDirection]);

  const showIssueDetails = (id: number) => {
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
      <tbody ref={containerRef}>
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
                <td key={header.value} className={header.value === 'due_date' ? header.value : ''}>
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
          <ProcessIndicatorContainer>
            <td>
              <ProcessIndicator className="container">
                <span css={styles.processIndicatorText}>Please wait...</span>
              </ProcessIndicator>
            </td>
          </ProcessIndicatorContainer>
        ) : null}
      </tbody>
    </Table>
  );
};

export { IssuesTable };
