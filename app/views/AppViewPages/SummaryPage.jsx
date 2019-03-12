import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Select from 'react-select';
import { connect } from 'react-redux';
import makeAnimated from 'react-select/lib/animated';
import styled from 'styled-components';

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

const TimeSpentSection = styled(Section)`
  grid-column: span 3;
  grid-row: span 2;
`;

const ActivitySection = styled(Section)`
  grid-column: span 3;
  grid-row: span 4;
`;


const FlexRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MarginedDiv = styled.div`
  margin: 20px 10px 20px 0px;
  flex-grow: 1
`;

class SummaryPage extends Component {
  constructor(props) {
    super(props);

    this.issuesHeaders = [
      { label: 'Id', isFixed: true, value: 'id' },
      { label: 'Project', value: 'project' },
      { label: 'Tracker', value: 'tracker' },
      { label: 'Status', value: 'status' },
      { label: 'Subject', isFixed: true, value: 'subject' },
      { label: 'Priority', value: 'priority' },
      { label: 'Estimation', value: 'estimation' },
      { label: 'Due Date', value: 'dueDate' }
    ];

    this.issueMapping = {
      id: 'id',
      project: 'project.name',
      tracker: 'tracker.name',
      status: 'status.name',
      subject: 'subject',
      priority: 'priority.name',
      estimation: 'estimated_hours',
      dueDate: 'due_date'
    };
    
    this.state = {
      showClosed: false,
      issues: props.issues,
      // issues: storage.get(`${id}.issuesAssignedToMe`, []),
      selectedHeaders: this.orderTableHeaders(this.issuesHeaders),
      search: undefined
    };
  }

  componentWillMount() {
    if (this.props.user.id) {
      this.fetchIssues();
    } else {
      this.props.history.push('/');
    }
  }

  fetchIssues = () => {
    const { dispatch, user } = this.props;
    const { showClosed } = this.state;
    const queryFilter = new IssueFilter()
      .assignee(user.id)
      .status({ open: true, closed: showClosed })
      .build();
    console.log(queryFilter);
    dispatch(actions.issues.getAll(queryFilter))
    .then(() => {
      this.setState({
        issues: this.props.issues
      });
    });
    // redmineApi.issues.getAll(queryFilter)
    //   .then(({ data }) => {
    //     const { issues } = data;
    //     console.log(issues);
    //     if (Array.isArray(issues) && issues.length) {
    //       this.setState({
    //         issues: [...issues]
    //       });
    //       // storage.set(`${userId}.issuesAssignedToMe`, issues);
    //     }
    //   });
  }

  toggleClosedIssuesDisplay = () => {
    const { showClosed } = this.state;
    this.setState({
      showClosed: !showClosed
    }, this.fetchIssues);
  }

  onSearchChange = (e) => {
    const value = e.target.value;
    const { issues } = this.props;
    const { selectedHeaders } = this.state;
    if (value) {
      this.setState({
        issues: issues.filter((issue) => {
          const testedString = selectedHeaders.map(header => _.get(issue, this.issueMapping[header.value])).join(' ');
          return new RegExp(value, 'gi').test(testedString);
        })
      })
    } else {
      this.setState({
        issues
      });
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

  render() {
    const { issues, selectedHeaders, showClosed } = this.state;
    return (
      <Grid>
        <IssuesSection>
          <h2>Issues assigned to me</h2>
          <div>
            <Label htmlFor="headers" label="Table Columns">
              <Select
                name="headers"
                components={makeAnimated()}
                options={this.issuesHeaders}
                defaultValue={selectedHeaders}
                value={selectedHeaders}
                onChange={this.onHeadersSelectChange}
                isMulti={true}
              />
            </Label>
            <FlexRow>
              <MarginedDiv>
                <Input
                  type="text"
                  name="search"
                  placeholder="Search"
                  onChange={this.onSearchChange}
                />
              </MarginedDiv>
              <div>
                <Label
                  htmlFor="showClosed"
                  label="Show Closed"
                  inline={true}
                  rightToLeft={true}
                >
                  <Input
                    name="showClosed"
                    type="checkbox"
                    checked={showClosed}
                    onChange={this.toggleClosedIssuesDisplay}
                  />
                </Label>
              </div>
            </FlexRow>
          </div>
          <Table>
            <tr>
              {selectedHeaders.map(header => (
                <th key={header.value}>{header.label}</th>
              ))}
            </tr>
            {issues.map(item => (
              <tr key={item.id}>
                {
                  selectedHeaders.map(header => (
                    <td key={header.value}>{_.get(item, this.issueMapping[header.value])}</td>
                  ))
                }
              </tr>
            ))}
          </Table>
        </IssuesSection>
        <TimeSpentSection>
          <h2>Time spent</h2>
        </TimeSpentSection>
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
    firstname: PropTypes.string.isRequired,
    lastname: PropTypes.string.isRequired,
    redmineEndpoint: PropTypes.string.isRequired
  }).isRequired
};

const mapStateToprops = state => ({
  user: state.user,
  issues: state.issues.all.data
});

const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToprops, mapDispatchToProps)(SummaryPage);
