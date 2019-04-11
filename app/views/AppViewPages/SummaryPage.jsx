import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Select from 'react-select';
import { connect } from 'react-redux';
import makeAnimated from 'react-select/lib/animated';
import styled, { withTheme, css } from 'styled-components';
import SortAscendingIcon from 'mdi-react/SortAscendingIcon';
import SortDescendingIcon from 'mdi-react/SortDescendingIcon';

import actions from '../../actions';
import { IssueFilter } from '../../actions/helper';
import { Input, Label } from '../../components/Input';
import Table from '../../components/Table';

const Grid = styled.div`
  display: grid;
  padding: 20px;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  grid-auto-rows: 100px;
  grid-auto-flow: dense;
  grid-gap: 20px;
`;

const Section = styled.section`
  background: white;
  padding: 0px 20px 20px 20px;
  border-radius: 5px;
`;

const IssuesSection = styled(Section)`
  grid-column: span 8;
  grid-row: span 6;
`;

const ActivitySection = styled(Section)`
  grid-column: span 3;
  grid-row: span 4;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(200px, auto) 1fr;
  grid-template-rows: auto;
  grid-row-gap: 20px;
  grid-column-gap: 20px;
  margin-bottom: 20px;
`;

const GridRow = styled.div`
  grid-column: 1/-1;
`;

const MarginedDiv = styled.div`
  margin-top: 10px;
`;

const selectStyles = {
  container: (base, state) => {
    return { ...base };
  },
  multiValue: (base, state) => {
    return state.data.isFixed
      ? { ...base, backgroundColor: '#FAFAFA', border: '1px solid #A4A4A4' }
      : { ...base, backgroundColor: 'transparent', border: '1px solid #3F3844' };
  },
  multiValueLabel: (base, state) => {
    return state.data.isFixed
      ? { ...base, paddingRight: 6, color: '#A4A4A4' }
      : base;
  },
  multiValueRemove: (base, state) => {
    return state.data.isFixed ? { ...base, display: 'none' } : base;
  }
};

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

class SummaryPage extends Component {
  constructor(props) {
    super(props);

    this.issuesHeaders = [
      { label: 'Id', isFixed: true, value: 'id' },
      { label: 'Project', value: 'project.name' },
      { label: 'Tracker', value: 'tracker.name' },
      { label: 'Status', value: 'status.name' },
      { label: 'Subject', isFixed: true, value: 'subject' },
      { label: 'Priority', value: 'priority.name' },
      { label: 'Estimation', value: 'estimated_hours' },
      { label: 'Due Date', value: 'due_date' }
    ];

    
    this.state = {
      issues: props.issues,
      search: undefined,
      sortBy: undefined,
      sortDirection: undefined
    };
  }

  componentDidUpdate(oldProps) {
    if (oldProps.settings.showClosedIssues !== this.props.settings.showClosedIssues) {
      this.fetchIssues();
    }
  }

  componentWillMount() {
    this.fetchIssues();
  }

  fetchIssues = () => {
    const { fetchIssues, user, settings } = this.props;
    const { showClosedIssues } = settings;
    const queryFilter = new IssueFilter()
      .assignee(user.id)
      .status({ open: true, closed: showClosedIssues })
      .build();
    fetchIssues(queryFilter).then(() => this.setState({ issues: this.props.issues }));
  }

  toggleClosedIssuesDisplay = () => {
    const { settingsShowClosedIssues, settings } = this.props;
    const { showClosedIssues } = settings;
    settingsShowClosedIssues(!showClosedIssues);
  }

  toggleUseColors = () => {
    const { settingsUseColors, settings } = this.props;
    const { useColors } = settings;
    settingsUseColors(!useColors);
  }

  onSearchChange = (e) => {
    const value = e.target.value;
    const { issues, settings } = this.props;
    const { issueHeaders } = settings;
    if (value) {
      this.setState({
        issues: issues.filter((issue) => {
          const testedString = issueHeaders.map(header => _.get(issue, header.value)).join(' ');
          return new RegExp(value, 'gi').test(testedString);
        })
      })
    } else {
      this.setState({ issues });
    }
  }

  onHeadersSelectChange = (value, { action, removedValue }) => {
    switch (action) {
      case 'remove-value':
      case 'pop-value':
        if (removedValue.isFixed) {
          return;
        }
        break;
    }

    this.props.settingsChangeIssueHeaders(value);
  }

  sortTable = (by) => { 
    return (e) => {
      const { sortBy, sortDirection, issues } = this.state;
      if (sortBy !== by) {
        this.setState({
          sortBy: by,
          sortDirection: 'asc',
          issues: _.orderBy(issues, [by], ['asc'])
        });
      } else {
        const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        this.setState({
          sortDirection: newSortDirection,
          issues: _.orderBy(issues, [sortBy], [newSortDirection])
        });
      }
    };
  }

  showIssueDetails(id) {
    this.props.history.push(`/app/issue/${id}/`);
  }

  paint = (item, mapping) => {
    const { theme, settings } = this.props;
    const textValue = _.get(item, mapping);
    
    const color = (settings.useColors && typeof textValue === 'string'
      ? colorMap[textValue.toLowerCase()]
      : undefined);
    return (
      <ColorfulSpan color={theme[color]}>{textValue}</ColorfulSpan>
    );
  }

  render() {
    const { theme, settings } = this.props;
    const { issues, sortBy, sortDirection } = this.state;
    const { showClosedIssues, useColors, issueHeaders } = settings;
    return (
      <Grid>
        <IssuesSection>
          <h2>Issues assigned to me</h2>
          <OptionsGrid>
            <div>
              <Label htmlFor="queryOptions" label="Options">
                <div id="queryOptions">
                  <label>
                    <Input
                      type="checkbox"
                      checked={showClosedIssues}
                      onChange={this.toggleClosedIssuesDisplay}
                    />
                    <span>Include Closed</span>
                  </label>
                </div>
              </Label>
              <MarginedDiv>
                <label>
                  <Input
                    type="checkbox"
                    checked={useColors}
                    onChange={this.toggleUseColors}
                  />
                  <span>Use Colors</span>
                </label>
              </MarginedDiv>
            </div>
            <Label htmlFor="headers" label="Table Columns">
              <Select
                name="headers"
                styles={selectStyles}
                components={makeAnimated()}
                options={this.issuesHeaders}
                defaultValue={issueHeaders}
                value={issueHeaders}
                onChange={this.onHeadersSelectChange}
                isMulti={true}
                isClearable={false}
                theme={(defaultTheme) => ({
                  ...defaultTheme,
                  borderRadius: 3,
                  colors: {
                  ...defaultTheme.colors,
                    primary: theme.main,
                  },
                })
              }
              />
            </Label>
            <GridRow>
              <Input
                type="text"
                name="search"
                placeholder="Search"
                onChange={this.onSearchChange}
              />
            </GridRow>
          </OptionsGrid>
          <Table>
            <tr>
              {issueHeaders.map(header => (
                <th
                  key={header.value}
                  className={header.value === 'due_date' ? 'due-date' : ''}
                  onClick={this.sortTable(header.value)}
                >
                  {header.label}&nbsp;
                  { sortBy === header.value && sortDirection === 'asc' && (  
                    <SortAscendingIcon size={14}/>
                  )}
                  { sortBy === header.value && sortDirection === 'desc' && (  
                    <SortDescendingIcon size={14}/>
                  )}
                </th>
              ))}
            </tr>
            {issues.map(item => (
              <tr key={item.id} onClick={this.showIssueDetails.bind(this, item.id)}>
                {
                  issueHeaders.map(header => (
                    <td key={header.value}>
                      {this.paint(item, header.value)}
                    </td>
                  ))
                }
              </tr>
            ))}
          </Table>
        </IssuesSection>
        <ActivitySection>
          <h2>Activity Stack</h2>
        </ActivitySection>
      </Grid>
    );
  }
}

SummaryPage.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    api_key: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    redmineEndpoint: PropTypes.string.isRequired
  }).isRequired,
  settings: PropTypes.shape({
    showClosedIssues: PropTypes.bool.isRequired,
    useColors: PropTypes.bool.isRequired,
    issueHeaders: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      isFixed: PropTypes.bool
    }).isRequired).isRequired,
  }).isRequired,
  settingsShowClosedIssues: PropTypes.func.isRequired,
  settingsUseColors: PropTypes.func.isRequired,
  settingsChangeIssueHeaders: PropTypes.func.isRequired,
  fetchIssues: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  user: state.user,
  issues: state.issues.assignedToMe.data,
  settings: state.settings
});

const mapDispatchToProps = dispatch => ({
  fetchIssues: filter => dispatch(actions.issues.getAll(filter)),
  settingsShowClosedIssues: value => dispatch(actions.settings.setShowClosedIssues(value)),
  settingsUseColors: value => dispatch(actions.settings.setUseColors(value)),
  settingsChangeIssueHeaders: issueHeaders => dispatch(actions.settings.setIssueHeaders(issueHeaders))
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(SummaryPage));
