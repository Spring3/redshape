import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Select from 'react-select';
import { connect } from 'react-redux';
import makeAnimated from 'react-select/lib/animated';
import styled, { withTheme } from 'styled-components';
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
  padding: 20px;
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

const styles = {
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
      showClosedIssues: props.settings.showClosedIssues,
      useColors: props.settings.useColors,
      issues: props.issues,
      selectedHeaders: this.orderTableHeaders(this.issuesHeaders),
      search: undefined,
      sortBy: undefined,
      sortDirection: undefined
    };
  }

  componentWillMount() {
    this.fetchIssues();
  }

  fetchIssues = () => {
    const { fetchIssues, user } = this.props;
    const { showClosedIssues } = this.state;
    const queryFilter = new IssueFilter()
      .assignee(user.id)
      .status({ open: true, closed: showClosedIssues })
      .build();
    fetchIssues(queryFilter).then(() => this.setState({ issues: this.props.issues }));
  }

  toggleClosedIssuesDisplay = () => {
    const { settingsShowClosedIssues } = this.props;
    const { showClosedIssues } = this.state;
    settingsShowClosedIssues(!showClosedIssues);
    this.setState({
      showClosedIssues: !showClosedIssues
    }, () => {
      this.fetchIssues();
    });
  }

  toggleUseColors = () => {
    const { settingsUseColors } = this.props;
    const { useColors } = this.state;
    settingsUseColors(!useColors);
    this.setState({
      useColors: !useColors
    });
  }

  onSearchChange = (e) => {
    const value = e.target.value;
    const { issues } = this.props;
    const { selectedHeaders } = this.state;
    if (value) {
      this.setState({
        issues: issues.filter((issue) => {
          const testedString = selectedHeaders.map(header => _.get(issue, header.value)).join(' ');
          return new RegExp(value, 'gi').test(testedString);
        })
      })
    } else {
      this.setState({ issues });
    }
  }

  orderTableHeaders = (headers) => {
    const fixed = [];
    const unfixed = [];
    for (const header of headers) {
      if (header.isFixed) {
        fixed.push(header);
      } else {
        unfixed.push(header);
      }
    }
    return [...fixed, ...unfixed];
  }

  onHeadersSelectChange = (value, { action, removedValue }) => {
    switch (action) {
      case 'remove-value':
      case 'pop-value':
        if (removedValue.isFixed) {
          return;
        }
        break;
      case 'clear':
        value = this.issuesHeaders.filter(header => header.isFixed);
        break;
    }

    const selectedHeaders = this.orderTableHeaders(value);
    this.setState({ selectedHeaders });
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

  render() {
    const { theme } = this.props;
    const { issues, selectedHeaders, sortBy, sortDirection, showClosedIssues, useColors } = this.state;
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
                styles={styles}
                components={makeAnimated()}
                options={this.issuesHeaders}
                defaultValue={selectedHeaders}
                value={selectedHeaders}
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
              {selectedHeaders.map(header => (
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
                  selectedHeaders.map(header => (
                    <td key={header.value}>{_.get(item, header.value)}</td>
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
    useColors: PropTypes.bool.isRequired
  }).isRequired,
  settingsShowClosedIssues: PropTypes.func.isRequired,
  settingsUseColors: PropTypes.func.isRequired,
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
  settingsUseColors: value => dispatch(actions.settings.setUseColors(value))   
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(SummaryPage));
