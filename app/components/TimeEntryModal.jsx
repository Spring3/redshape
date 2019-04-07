import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Modal from 'react-responsive-modal';
import Select from 'react-select';
import DatePickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';

import { Input, Label } from '../components/Input';
import Button from '../components/Button';
import MarkdownEditor from '../components/MarkdownEditor';
import actions from '../actions';

class TimeEntryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectActivities: [],
      timeEntry: {
        activity: {},
        user: {},
        issue: {},
        hours: 0,
        comments: undefined,
        spent_on: Date.now()
      },
      wasModified: false
    };
  }

  componentDidUpdate(oldProps) {
    if (oldProps.isOpen !== this.props.isOpen && this.props.isOpen)
      // || this.props.projects !== oldProps.projects
      // || this.props.selectedIssue !== oldProps.selectedIssue
      // || this.props.tracking !== oldProps.tracking
      // || this.props.isEditable !== oldProps.isEditable
    {
      const { timeEntry, selectedIssue, projects, tracking, currentUser } = this.props;

      // viewing existing time entry
      if (timeEntry) {
        const project = projects[timeEntry.project.id];
        this.setState({
          projectActivities: _.get(project, 'activities', []).map(({ id, name }) => ({ value: id, label: name })),
          timeEntry,
          wasModified: false
        }); 
        // adding a new time entry when the timer has stopped
      } else if (!tracking.isTracking && !tracking.isPaused && tracking.duration) {
        const project = projects[tracking.issue.project.id];
        console.log('TRACKING', tracking);
        this.setState({
          projectActivities: _.get(project, 'activities', []).map(({ id, name }) => ({ value: id, label: name })),
          timeEntry: {
            activity: {},
            issue: {
              id: tracking.issue.id,
              name: tracking.issue.subject
            },
            hours: (tracking.duration / 3600000).toFixed(2),
            comments: '',
            project: {
              id: tracking.issue.project.id,
              name: tracking.issue.project.name
            },
            spent_on: Date.now(),
            user: {
              id: currentUser.id,
              name: currentUser.name
            }
          },
          wasModified: false
        });
        // adding a new time entry manually
      } else if (!timeEntry && selectedIssue) {
        const project = projects[selectedIssue.project.id];
        this.setState({
          projectActivities: _.get(project, 'activities', []).map(({ id, name }) => ({ value: id, label: name })),
          timeEntry: {
            activity: {},
            issue: {
              id: selectedIssue.id,
              name: selectedIssue.subject
            },
            hours: 0,
            comments: '',
            project: {
              id: selectedIssue.project.id,
              name: selectedIssue.project.name
            },
            spent_on: Date.now(),
            user: {
              id: currentUser.id,
              name: currentUser.name
            }
          },
          wasModified: false
        });
      }
    }
  }

  onDateChange = date => this.setState({
    timeEntry: {
      ...this.state.timeEntry,
      spent_on: date,
    },
    wasModified: true
  });
  onHoursChange = e => this.setState({
    timeEntry: {
      ...this.state.timeEntry,
      hours: e.target.value
    },
    wasModified: true
  });
  onCommentsChange = comments => this.setState({
    timeEntry: {
      ...this.state.timeEntry,
      comments
    },
    wasModified: true
  });
  onActivityChange = activity => {
    this.setState({
      timeEntry: {
        ...this.state.timeEntry,
        activity: { id: activity.value, name: activity.label }
      },
      wasModified: true
    });
  };

  onAdd = () => {};
  onUpdate = () => {};
  onDelete = () => {};

  render() {
    const { currentUser, isOpen, isEditable, onClose } = this.props;
    const { timeEntry, projectActivities } = this.state;
    const { hours, comments, spent_on } = timeEntry;
    const defaultActivity = projectActivities.find(option => option.value === timeEntry.activity.id) || null;
    console.log('timeEntry', timeEntry);
    console.log('defaultActivity', defaultActivity);
    return (
      <Modal
        open={!!isOpen}
        onClose={onClose}
        center={true}
      >
        <div>
          <Fragment>
            <Label htmlFor="author" label="Author">
                <div name="author">{timeEntry.user.name}</div>
              </Label>
              <Label htmlFor="issue" label="Issue">
                <div name="issue">#{timeEntry.issue.id}&nbsp;{timeEntry.issue.name}</div>
              </Label>
              <Label htmlFor="activity" label="Activity">
                <Select
                  options={projectActivities}
                  value={defaultActivity}
                  onChange={this.onActivityChange}
                />
              </Label>
              <Label htmlFor="time" label="Time">
                <Input
                  type="number"
                  name="time"
                  value={hours}
                  disabled={!isEditable}
                  onChange={this.onHoursChange}
                />
              </Label>
              <Label htmlFor="date" label="Date">
                <DatePickerInput
                  name="date"
                  value={new Date(spent_on)}
                  disabled={!isEditable}
                  onChange={this.onDateChange}
                />
              </Label>
              <h3>Comment</h3>
              <MarkdownEditor
                onChange={this.onCommentsChange}
                initialValue={comments}
                preview={true}
              />
              {timeEntry.id && currentUser.id === timeEntry.user.id
                ? (
                  <div>
                    <Button onClick={this.onUpdate}>Submit</Button>
                    <Button onclick={this.onDelete}>Delete</Button>
                  </div>
                )
                : (
                  <div>
                    <Button onClick={this.onAdd}>Submit</Button>
                  </div>
                )
              }
              
          </Fragment>
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
  currentUser: PropTypes.shape({
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
  tracking: PropTypes.shape({
    issue: PropTypes.shape({
      id: PropTypes.number,
      subject: PropTypes.string,
      project: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
      }),
    }).isRequired,
    isTracking: PropTypes.bool.isRequired,
    isPaused: PropTypes.bool.isRequired,
    duration: PropTypes.number.isRequired
  }),
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isEditable: PropTypes.bool
};

const mapStateToProps = state => ({
  projects: state.projects.data,
  currentUser: state.user,
  selectedIssue: state.issues.selected.data,
  tracking: state.tracking
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps)(TimeEntryModal);
