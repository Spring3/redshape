import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Select from 'react-select';
import withApi from '../../redmine/Api';
import storage from '../../../modules/storage';
import { Input, Labeled } from '../../components/Input';
import Table from '../../components/Table';

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
        { label: 'Id', value: 'id' },
        { label: 'Project', value: 'project' },
        { label: 'Tracker', value: 'tracker' },
        { label: 'Status', value: 'status' },
        { label: 'Subject', value: 'subject' },
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
      <div>
        <section>
          <h2>Issues assigned to me</h2>
          <Labeled
            htmlFor="showClosed"
            label="Show Closed"
          >
            <Input
              name="showClosed"
              type="checkbox"
              checked={showClosed}
              onChange={() => {}}
            />
          </Labeled>
          <Select
            options={issuesHeaders}
            value={issuesHeaders}
            isMulti={true}
          />
          <Input
            type="text"
            name="search"
            onChange={() => {}}
          />
        </section>
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
      </div>
    );
  }
}

SummaryPage.propTypes = {
  redmineApi: PropTypes.object.isRequired
};

export default withApi(SummaryPage);
