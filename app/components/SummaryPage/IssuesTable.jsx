import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styled, { withTheme, css } from 'styled-components';
import SortAscendingIcon from 'mdi-react/SortAscendingIcon';
import SortDescendingIcon from 'mdi-react/SortDescendingIcon';

import InfiniteScroll from '../InfiniteScroll';
import ProcessIndicator from '../ProcessIndicator';
import Table from '../Table';
import Date from '../Date';

const ColorfulSpan = styled.span`
  ${
    props => props.color
    ? css `
      padding-bottom: 2px;
      background: linear-gradient(to bottom,transparent 0,transparent 90%,${props.color} 90%,${props.color} 100%);
    `
    : null
  }
`;

const colorMap = {
  'closed': 'red',
  'high': 'red',
  'immediate': 'red',
  'critical': 'red',
  'open': 'green',
  'low': 'green',
  'pending': 'yellow',
  'normal': 'yellow'
};

const TableProcessIndicator = styled.tr`
  position: relative;
  div {
    position: absolute;
    left: 46%;
    bottom: -15px;

    span {
      position: relative;
      top: 10px;
      left: 70px;
    }
  }
`;

class IssuesTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sortBy: undefined,
      sortDirection: undefined
    };

    this.tableRef = React.createRef();
  }

  sortTable = (by) => () => {
    const { onSort } = this.props;
    const { sortBy, sortDirection } = this.state;
    if (sortBy !== by) {
      this.setState({
        sortBy: by,
        sortDirection: 'asc'
      }, () => onSort(by, 'asc'));
    } else {
      const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      this.setState({ sortDirection: newSortDirection }, () => onSort(by, newSortDirection));
    }
  }

  showIssueDetails(id) {
    this.props.history.push(`/app/issue/${id}/`);
  }

  paint = (item, mapping) => {
    const { theme, useColors } = this.props;
    const textValue = _get(item, mapping);
    
    const color = (useColors && typeof textValue === 'string'
      ? colorMap[textValue.toLowerCase()]
      : undefined);
    return (
      <ColorfulSpan color={theme[color]}>{textValue}</ColorfulSpan>
    );
  }

  loadIssuePage = (pg) => {
    const { issues, fetchIssuePage } = this.props;
    const { page } = issues;
    fetchIssuePage(page + 1);
  }

  render() {
    const { issueHeaders, issues } = this.props;
    const { sortBy, sortDirection } = this.state;
    const userTasks = issues.data;
    return (
      <Table ref={this.tableRef}>
        <InfiniteScroll
          load={this.loadIssuePage}
          isEnd={issues.data.length === issues.totalCount}
          hasMore={!issues.isFetching && !issues.error && issues.data.length < issues.totalCount}
          loadIndicator={<TableProcessIndicator><ProcessIndicator /></TableProcessIndicator>}
          container={this.tableRef.current}
          immediate={true}
        >
          <tr>
            {issueHeaders.map(header => (
              <th
                key={header.value}
                className={header.value === 'due_date' ? 'due-date' : ''}
                onClick={this.sortTable(header.value)}
              >
                {header.label}&nbsp;
                {sortBy === header.value && sortDirection === 'asc' && (
                  <SortAscendingIcon size={14} />
                )}
                {sortBy === header.value && sortDirection === 'desc' && (
                  <SortDescendingIcon size={14} />
                )}
              </th>
            ))}
          </tr>
          {userTasks.map(task => (
            <tr key={task.id} onClick={this.showIssueDetails.bind(this, task.id)}>
              {
                issueHeaders.map(header => (
                  <td key={header.value}>
                    {header.value === 'due_date'
                      ? <Date date={_get(task, header.value)} />
                      : this.paint(task, header.value)
                    }
                  </td>
                ))
              }
            </tr>
          ))}
        </InfiniteScroll>
      </Table>
    );
  }
}

IssuesTable.propTypes = {
  issues: PropTypes.shape({
    userTasks: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  useColors: PropTypes.bool.isRequired,
  issueHeaders: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    isFixed: PropTypes.bool
  }).isRequired).isRequired,
  onSort: PropTypes.func.isRequired,
  fetchIssuePage: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  useColors: state.settings.useColors,
  issues: state.issues.all,
  issueHeaders: state.settings.issueHeaders,
});

export default withRouter(withTheme(connect(mapStateToProps)(IssuesTable)));
