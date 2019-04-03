import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Modal from 'react-responsive-modal';
import Select from 'react-select';
import DatePicker from 'react-date-picker';

import { Input, Label } from '../components/Input';
import Button from '../components/Button';
import MarkdownEditor from '../components/MarkdownEditor';

class TimeEntryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: _.get(props, 'timeEntry.user', props.user || {}),
      issue: _.get(props, 'timeEntry.issue', props.issue || {}),
      activity: _.get(props, 'timeEntry.activity', {}),
      hours: _.get(props, 'timeEntry.hours'),
      comments: _.get(props, 'timeEntry.comments'),
      spent_on: _.get(props, 'timeEntry.spent_on', Date.now())
    };

    const { projects,  projectId } = props;
    const project = projects[projectId];
    this.projectActivities = _.get(project, 'activities', []).map(({ id, name }) => ({ value: id, label: name }));
  }

  onDateChange = date => this.setState({ spent_on: date });
  onHoursChange = e => this.setState({ hours: e.target.value });
  onCommentChange = comment => this.setState({ comment });

  render() {
    const { projectActivities, onCancel, show, onUpdate, onDelete, onAdd } = this.props;
    const { user, issue, activity, hours, comments, spent_on } = this.state;
    return (
      <Modal
        open={!!show}
        onClose={onCancel}
        center={true}
      >
        <div>
          <Label htmlFor="author" label="Author">
            <div name="author">{user.name}</div>
          </Label>
          <Label htmlFor="issue" label="Issue">
            <div name="issue">#{issue.id}&nbsp;{issue.name}</div>
          </Label>
          <Label htmlFor="activity" label="Activity">
            <Select
              options={this.projectActivities}
              defaultValue={this.projectActivities.find(option => option.value === activity.id)}
            />
          </Label>
          <Label htmlFor="time" label="Time">
            <Input
              type="number"
              name="time"
              value={hours}
              onChange={this.onHoursChange}
            />
          </Label>
          <Label htmlFor="date" label="Date">
            <DatePicker
              name="date"
              value={new Date(spent_on)}
              onChange={this.onDateChange}
            />
          </Label>
          <h3>Comment</h3>
          <MarkdownEditor
            onChange={this.onCommentChange}
            initialValue={comments}
            preview={true}
          />
          {this.props.timeEntry && user.id === this.props.timeEntry.user.id && (
            <div>
              <Button onClick={onUpdate}>Update</Button>
              <Button onclick={onDelete}>Delete</Button>
            </div>
          )}
          { !this.props.timeEntry && (
            <div>
              <Button onClick={onAdd}>Add</Button>
            </div>
          )}
        </div>
      </Modal>
    );
  }
}

TimeEntryModal.propTypes = {
  projects: PropTypes.object.isRequired,
  projectId: PropTypes.number.isRequired,
  timeEntry: PropTypes.shape({
    activity: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    comments: PropTypes.string,
    created_on: PropTypes.string.isRequired,
    hours: PropTypes.number.isRequired,
    id: PropTypes.number.isRequired,
    issue: PropTypes.shape({
      id: PropTypes.number.isRequired
    }).isRequired,
    project: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    spent_on: PropTypes.string.isRequired,
    updated_on: PropTypes.string.isRequired,
    user: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired
  }),
  show: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  onAdd: PropTypes.func
};

const mapStateToProps = state => ({
  projects: state.projects.data
});

export default connect(mapStateToProps)(TimeEntryModal);
