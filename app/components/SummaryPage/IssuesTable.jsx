import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styled, { withTheme, css } from 'styled-components';
import SortAscendingIcon from 'mdi-react/SortAscendingIcon';
import SortDescendingIcon from 'mdi-react/SortDescendingIcon';

import Table from '../Table';

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
  'open': 'green',
  'low': 'green',
  'pending': 'yellow',
  'normal': 'yellow'
};

class IssuesTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sortBy: undefined,
      sortDirection: undefined
    };
  }

  sortTable = (by) => { 
    return () => {
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
    };
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

  render() {
    const { issueHeaders, userTasks } = this.props;
    const { sortBy, sortDirection } = this.state;
    return (
      <Table>
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
                  {this.paint(task, header.value)}
                </td>
              ))
            }
          </tr>
        ))}
      </Table>
    );
  }
}

IssuesTable.propTypes = {
  userTasks: PropTypes.arrayOf(PropTypes.object).isRequired,
  useColors: PropTypes.bool.isRequired,
  issueHeaders: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    isFixed: PropTypes.bool
  }).isRequired).isRequired,
  onSort: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  useColors: state.settings.useColors,
  userTasks: state.issues.all.data,
  issueHeaders: state.settings.issueHeaders,
});

export default withRouter(withTheme(connect(mapStateToProps)(IssuesTable)));
