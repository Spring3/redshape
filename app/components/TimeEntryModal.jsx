import _ from 'lodash';
import Joi from 'joi';
import React, { Component, Fragment } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Modal from 'react-responsive-modal';
import Select from 'react-select';
import DatePickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';

import { Input, Label } from '../components/Input';
import Button from '../components/Button';
import MarkdownEditor from '../components/MarkdownEditor';
import ErrorMessage from '../components/ErrorMessage';
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
        spent_on: moment().format('YYYY-MM-DD')
      },
      wasModified: false,
      hasErrors: false,
      validationErrors: {}
    };
  }

  componentDidUpdate(oldProps) {
    if (oldProps.isOpen !== this.props.isOpen && this.props.isOpen) {
      const { timeEntry, selectedIssue, projects, tracking, currentUser } = this.props;

      // viewing existing time entry
      if (timeEntry) {
        const project = projects[timeEntry.project.id];
        this.setState({
          projectActivities: _.get(project, 'activities', []).map(({ id, name }) => ({ value: id, label: name })),
          timeEntry,
          wasModified: false,
          hasErrors: false,
          validationErrors: {}
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
            spent_on: moment().format('YYYY-MM-DD'),
            user: {
              id: currentUser.id,
              name: currentUser.name
            }
          },
          wasModified: false,
          hasErrors: false,
          validationErrors: {}
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
            spent_on: moment().format('YYYY-MM-DD'),
            user: {
              id: currentUser.id,
              name: currentUser.name
            }
          },
          wasModified: false,
          hasErrors: false,
          validationErrors: {}
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
      hours: parseFloat(e.target.value.replace(',', '.'))
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

  validateTimeEntry = (schema) => {
    const { timeEntry } = this.state;
    const errors = {};
    let hasErrors = false;
    for (const [prop, validate] of Object.entries(schema)) {
      const value = timeEntry[prop];
      const validation = validate(value);
      if (validation.error) {
        errors[prop] = validation.error.message.replace('value', prop);
        hasErrors = true;
      }
    }
    const result = {
      hasErrors,
      validationErrors: errors
    };

    this.setState(result);
    return result;
  }

  onAdd = () => {
    const { timeEntry } = this.state;
    const { addTimeEntry, onClose } = this.props;
    const result = this.validateTimeEntry({
      activity: activity => Joi.validate(activity.id, Joi.number().integer().positive().required()),
      hours: hours => Joi.validate(hours, Joi.number().positive().precision(2).required()),
      comments: comments => Joi.validate(comments, Joi.string().required().allow('')),
      spent_on: spent_on => Joi.validate(spent_on, Joi.string().required())
    });
    if (!result.hasErrors) {
      addTimeEntry({
        activity: timeEntry.activity,
        comments: timeEntry.comments,
        hours: timeEntry.hours,
        issue: timeEntry.issue,
        spent_on: timeEntry.spent_on,
        user: timeEntry.user
      }).then(() => {
        console.log('Added');
        onClose();
      });
    }
  };

  onUpdate = () => {
    const { wasModified, timeEntry } = this.state;
    const { onClose, updateTimeEntry } = this.props;
    const result = this.validateTimeEntry({
      activity: activity => Joi.validate(activity.id, Joi.number().integer().positive().required()),
      hours: hours => Joi.validate(hours, Joi.number().positive().precision(2).required()),
      comments: comments => Joi.validate(comments, Joi.string().required().allow('')),
      spent_on: spent_on => Joi.validate(spent_on, Joi.string().required())
    });
    if (!result.hasErrors && wasModified) {
      updateTimeEntry(this.props.timeEntry, {
        comments: timeEntry.comments,
        hours: timeEntry.hours,
        spent_on: timeEntry.spent_on,
        activity: timeEntry.activity
      }).then(() => {
        console.log('Updated');
        onClose();
      })
    } else {
      onClose();
    }
  };

  onDelete = () => {
    const { onClose, removeTimeEntry, currentUser } = this.props;
    const { timeEntry } = this.state;
    const result = this.validateTimeEntry({
      id: id => Joi.validate(id, Joi.number().integer().positive().required())
    });

    if (!result.hasErrors && timeEntry.user.id === currentUser.id) {
      removeTimeEntry(timeEntry.id, timeEntry.issue.id).then(() => {
        console.log('Removed');
        onClose();
      });
    }
  };

  render() {
    const { currentUser, isOpen, isEditable, onClose } = this.props;
    const { timeEntry, projectActivities, validationErrors, hasErrors } = this.state;
    const { hours, comments, spent_on } = timeEntry;
    const defaultActivity = projectActivities.find(option => option.value === timeEntry.activity.id) || null;
    return (
      <Modal
        open={!!isOpen}
        onClose={onClose}
        center={true}
      >
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
          <ErrorMessage show={validationErrors.activity}>
            {validationErrors.activity}
          </ErrorMessage>
          <Label htmlFor="hours" label="Hours">
            <Input
              type="number"
              name="hours"
              value={hours}
              disabled={!isEditable}
              onChange={this.onHoursChange}
            />
          </Label>
          <ErrorMessage show={validationErrors.hours}>
            {validationErrors.hours}
          </ErrorMessage>
          <Label htmlFor="spent_on" label="Date">
            <DatePickerInput
              name="date"
              value={new Date(spent_on)}
              disabled={!isEditable}
              onChange={this.onDateChange}
            />
          </Label>
          <ErrorMessage show={validationErrors.spent_on}>
            {validationErrors.spent_on}
          </ErrorMessage>
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
                <Button onClick={this.onDelete}>Delete</Button>
              </div>
            )
            : (
              <div>
                <Button onClick={this.onAdd}>Submit</Button>
              </div>
            )
          }
        </Fragment>
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
  time: PropTypes.shape({
    isFetching: PropTypes.bool.isRequired,
    error: PropTypes.instanceOf(Error)
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isEditable: PropTypes.bool,
  addTimeEntry: PropTypes.func.isRequired,
  updateTimeEntry: PropTypes.func.isRequired,
  removeTimeEntry: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  projects: state.projects.data,
  currentUser: state.user,
  selectedIssue: state.issues.selected.data,
  tracking: state.tracking,
  time: state.time
});

const mapDispatchToProps = dispatch => ({
  addTimeEntry: timeEntry => dispatch(actions.time.add(timeEntry)),
  updateTimeEntry: (timeEntry, changes) => dispatch(actions.time.update(timeEntry, changes)),
  removeTimeEntry: (timeEntryId, issueId) => dispatch(actions.time.remove(timeEntryId, issueId))
});

export default connect(mapStateToProps, mapDispatchToProps)(TimeEntryModal);
