import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Modal from 'react-responsive-modal';
import Select from 'react-select';
import DatePickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';

import { Input, Label } from '../components/Input';
import Button from '../components/Button';
import MarkdownEditor from '../components/MarkdownEditor';

class TimeEntryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
  onCommentsChange = comment => this.setState({ comments });
  onActivityChange = activity => this.setState({ activity: { id: activity.value, name: activity.label } });

  onAdd = () => {};
  onUpdate = () => {};
  onDelete = () => {};

  renderBlankForm() {
    const { user, selectedIssue } = this.props;
    return (
      <Fragment>
        <Label htmlFor="author" label="Author">
            <div name="author">{user.name}</div>
          </Label>
          <Label htmlFor="issue" label="Issue">
            <div name="issue">#{selectedIssue.id}&nbsp;{selectedIssue.subject}</div>
          </Label>
          <Label htmlFor="activity" label="Activity">
            <Select
              options={this.projectActivities}
              onChange={this.onActivityChange}
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
            <DatePickerInput
              name="date"
              value={new Date(spent_on)}
              onChange={this.onDateChange}
            />
          </Label>
          <h3>Comment</h3>
          <MarkdownEditor
            onChange={this.onCommentsChange}
            initialValue={comments}
            preview={true}
          />
          <div>
            <Button onClick={this.onAdd}>Add</Button>
          </div>
      </Fragment>
    );
  }

  renderTimeEntry() {
    const { timeEntry, user } = this.props;
    const { activity, hours, comments, spent_on } = this.state;
    return (
      <Fragment>
        <Label htmlFor="author" label="Author">
            <div name="author">{user.name}</div>
          </Label>
          <Label htmlFor="issue" label="Issue">
            <div name="issue">#{timeEntry.issue.id}&nbsp;{timeEntry.issue.name}</div>
          </Label>
          <Label htmlFor="activity" label="Activity">
            <Select
              options={this.projectActivities}
              defaultValue={this.projectActivities.find(option => option.value === activity.id)}
              onChange={this.onActivityChange}
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
            <DatePickerInput
              name="date"
              value={new Date(spent_on)}
              onChange={this.onDateChange}
            />
          </Label>
          <h3>Comment</h3>
          <MarkdownEditor
            onChange={this.onCommentsChange}
            initialValue={comments}
            preview={true}
          />
          {timeEntry && user.id === timeEntry.user.id && (
            <div>
              <Button onClick={this.onUpdate}>Update</Button>
              <Button onclick={this.onDelete}>Delete</Button>
            </div>
          )}
      </Fragment>
    );
  }

  renderEntrySubmitionForm() {
    const { user, tracking } = this.props;
    const { issue, duration, created_on } = tracking;
    const durationHours = (duration / 3600000).toFixed(2);
    return (
      <Fragment>
        <Label htmlFor="author" label="Author">
            <div name="author">{user.name}</div>
          </Label>
          <Label htmlFor="issue" label="Issue">
            <div name="issue">#{issue.id}&nbsp;{issue.subject}</div>
          </Label>
          <Label htmlFor="activity" label="Activity">
            <Select
              options={this.projectActivities}
              onChange={this.onActivityChange}
            />
          </Label>
          <Label htmlFor="time" label="Time">
            <Input
              type="number"
              name="time"
              disabled={true}
              value={durationHours}
              onChange={this.onHoursChange}
            />
          </Label>
          <Label htmlFor="date" label="Date">
            <DatePickerInput
              name="date"
              value={new Date(created_on)}
              disabled={true}
              onChange={this.onDateChange}
            />
          </Label>
          <h3>Comment</h3>
          <MarkdownEditor
            onChange={this.onCommentsChange}
            preview={true}
          />
          <div>
            <Button onClick={this.onAdd}>Add</Button>
          </div>
      </Fragment>
    );
  }

  render() {
    const { show, tracking, timeEntry, selectedIssue, onClose } = this.props;
    const hasTimeEntrySelected = !!(selectedIssue && timeEntry);
    const finishedTracking = !hasTimeEntrySelected && tracking.duration && !tracking.isTracking && !tracking.isPaused;
    const open = show || hasTimeEntrySelected || finishedTracking;
    return (
      <Modal
        open={!!open}
        onClose={onClose}
        center={true}
      >
        <div>
          {hasTimeEntrySelected && !finishedTracking && this.renderTimeEntry()}
          {finishedTracking && !hasTimeEntrySelected && this.renderEntrySubmitionForm()}
          {show && !hasTimeEntrySelected && !finishedTracking && this.renderBlankForm()}
        </div>
      </Modal>
    );
  }
}

TimeEntryModal.propTypes = {
  projects: PropTypes.shape({
    activities: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired).isRequired
  }).isRequired,
  tracking: PropTypes.shape({
    issue: PropTypes.shape({
      id: PropTypes.number,
      journals: PropTypes.arrayOf(PropTypes.shape({
        created_on: PropTypes.string,
        details: PropTypes.arrayOf(PropTypes.object),
        id: PropTypes.number.isRequired,
        notes: PropTypes.string,
        private_notes: PropTypes.bool,
        usr: PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired
        }).isRequired
      }))
    }).isRequired,
    isTracking: PropTypes.bool.isRequired,
    isPaused: PropTypes.bool.isRequired,
    duration: PropTypes.number.isRequired
  }).isRequired,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
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
  selectedIssue: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  }),
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired
  // onUpdate: PropTypes.func,
  // onDelete: PropTypes.func,
  // onAdd: PropTypes.func
};

const mapStateToProps = state => ({
  projects: state.projects.data,
  tracking: state.tracking,
  user: state.user,
  selectedIssue: state.issues.selected.data,
  spentTime: state.issues.selected.spentTime
});

export default connect(mapStateToProps)(TimeEntryModal);
