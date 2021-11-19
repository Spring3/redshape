import React from 'react';
import { useTheme } from 'styled-components';
import SortAscendingIcon from 'mdi-react/SortAscendingIcon';
import SortDescendingIcon from 'mdi-react/SortDescendingIcon';
import { css } from '@emotion/react';

import { theme as Theme } from '../../theme';
import { issueHeaders } from '../constants';
import { IssueHeader, SortingDirection } from '../../../types';

type IssuesTableHeadProps = {
  onSort?: (by: IssueHeader['value']) => void;
  sortBy?: IssueHeader['value'];
  sortDirection?: SortingDirection;
}

const styles = {
  tableHead: css`
    z-index: 1;
  `,
  icon: css`
    vertical-align: middle;
  `,
};

const NonInteractiveTableHead = () => {
  const theme = useTheme() as typeof Theme;

  return (
    <thead css={styles.tableHead}>
      <tr>
        {issueHeaders.map(header => (
          <th
            css={css`
              padding: 15px 5px;
              background: ${theme.bgDark};
              border-bottom: 2px solid ${theme.bgDarker};
              transition: color ease ${theme.transitionTime};
            `}
            key={header.value}
          >
            {header.label}
                &nbsp;
          </th>
        ))}
      </tr>
    </thead>
  );
};

const IssuesTableHead = ({ onSort, sortBy, sortDirection } : IssuesTableHeadProps) => {
  const theme = useTheme() as typeof Theme;

  if (!onSort) {
    return <NonInteractiveTableHead />;
  }

  return (
    <thead css={styles.tableHead}>
      <tr>
        {issueHeaders.map(header => (
          <th
            css={css`
              padding: 15px 5px;
              background: ${theme.bgDark};
              border-bottom: 2px solid ${theme.bgDarker};
              transition: color ease ${theme.transitionTime};
              &:hover {
                cursor: pointer;
                color: ${theme.main};
              }
            `}
            key={header.value}
            onClick={() => onSort(header.value)}
          >
            {header.label}
                &nbsp;
            {sortBy === header.value && sortDirection === 'asc' && (
              <SortAscendingIcon css={styles.icon} size={14} />
            )}
            {sortBy === header.value && sortDirection === 'desc' && (
              <SortDescendingIcon css={styles.icon} size={14} />
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export {
  IssuesTableHead
};
