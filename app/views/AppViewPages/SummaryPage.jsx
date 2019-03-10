import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Select from 'react-select';
import makeAnimated from 'react-select/lib/animated';
import styled from 'styled-components';
import withApi from '../../redmine/Api';
import storage from '../../../modules/storage';
import { Input, Labeled } from '../../components/Input';
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
    const userData = storage.get('user');
    const { id } = userData;
    this.state = {
      userId: id,
      showClosed: false,
      issues: storage.get(`${id}.issuesAssignedToMe`, []),
      issuesHeaders: [
        { label: 'Id', isFixed: true, value: 'id' },
        { label: 'Project', value: 'project' },
        { label: 'Tracker', value: 'tracker' },
        { label: 'Status', value: 'status' },
        { label: 'Subject', isFixed: true, value: 'subject' },
        { label: 'Priority', value: 'priority' },
        { label: 'Estimation', value: 'estimation' }
      ]
    };

    this.issueMapping = {
      id: 'id',
      project: 'project.name',
      tracker: 'tracker.name',
      status: 'status.name',
      subject: 'subject',
      priority: 'priority.name',
      estimation: 'estimated_hours'
    };
  }

  componentWillMount() {
    const { redmineApi } = this.props;
    const { userId } = this.state;
    const queryFilter = redmineApi.issues.filter()
      .assignee(userId)
      .status({ open: true })
      .build();
    redmineApi.issues.getAll(queryFilter)
      .then(({ data }) => {
        const { issues } = data;
        console.log(issues);
        if (Array.isArray(issues) && issues.length) {
          this.setState({
            issues: [...issues]
          });
          storage.set(`${userId}.issuesAssignedToMe`, issues);
        }
      });
  }

  render() {
    const { issues, issuesHeaders, showClosed } = this.state;
    return (
      <Grid>
        <IssuesSection>
          <h2>Issues assigned to me</h2>
          <div>
            <Labeled htmlFor="headers" label="Table Columns">
              <Select
                name="headers"
                components={makeAnimated()}
                options={issuesHeaders}
                value={issuesHeaders}
                isMulti={true}
              />
            </Labeled>
            <FlexRow>
              <MarginedDiv>
                <Input
                  type="text"
                  name="search"
                  placeholder="Search"
                  onChange={() => {}}
                />
              </MarginedDiv>
              <div>
                <Labeled
                  htmlFor="showClosed"
                  label="Show Closed"
                  inline={true}
                  rightToLeft={true}
                >
                  <Input
                    name="showClosed"
                    type="checkbox"
                    checked={showClosed}
                    onChange={() => {}}
                  />
                </Labeled>
              </div>
            </FlexRow>
          </div>
          <Table>
            <tr>
              {issuesHeaders.map(header => (
                <th key={header.value}>{header.label}</th>
              ))}
            </tr>
            {issues.map(item => (
              <tr key={item.id}>
                {
                  issuesHeaders.map(header => (
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
          <h2>Activity</h2>
        </ActivitySection>
      </Grid>
    );
  }
}

SummaryPage.propTypes = {
  redmineApi: PropTypes.object.isRequired
};

export default withApi(SummaryPage);
