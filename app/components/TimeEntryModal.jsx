import _ from 'lodash';
import Joi from 'joi';
import React, { Component, Fragment } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Modal from 'react-responsive-modal';
import Select from 'react-select';
import styled, { withTheme } from 'styled-components';

import { Input, Label } from '../components/Input';
import Button from '../components/Button';
import MarkdownEditor from '../components/MarkdownEditor';
import ErrorMessage from '../components/ErrorMessage';
import DatePicker from '../components/DatePicker';

import actions from '../actions';

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const OptionButtons = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid ${props => props.theme.bgLight};
  display: flex;
  justify-content: space-between;
  
  button {
    padding: 8px 15px;
  }
`;

const selectStyles = {
  container: (base, state) => {
    return { ...base };
  }
};

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
      const { timeEntry, selectedIssue, projects, tracking, userName, userId } = this.props;

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
              id: userId,
              name: userName
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
              id: userId,
              name: userName
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
      }).then(() => onClose());
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
        onClose();
      })
    } else {
      onClose();
    }
  };

  onDelete = () => {
    const { onClose, removeTimeEntry, userId } = this.props;
    const { timeEntry } = this.state;
    const result = this.validateTimeEntry({
      id: id => Joi.validate(id, Joi.number().integer().positive().required())
    });

    if (!result.hasErrors && timeEntry.user.id === userId) {
      removeTimeEntry(timeEntry.id, timeEntry.issue.id).then(() => {
        onClose();
      });
    }
  };

  render() {
    const { userId, isOpen, isEditable, onClose, theme } = this.props;
    const { timeEntry, projectActivities, validationErrors } = this.state;
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
              styles={selectStyles}
              value={defaultActivity}
              onChange={this.onActivityChange}
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
          <ErrorMessage show={validationErrors.activity}>
            {validationErrors.activity}
          </ErrorMessage>
          <FlexRow>
            <div>
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
            </div>
            <div>
              <Label htmlFor="spent_on" label="Date">
                <DatePicker
                  name="date"
                  value={new Date(spent_on)}
                  isDisabled={!isEditable}
                  onChange={this.onDateChange}
                />
              </Label>
              <ErrorMessage show={validationErrors.spent_on}>
                {validationErrors.spent_on}
              </ErrorMessage>
            </div>
          </FlexRow>
          <Label label="Comments" htmlFor="comments">
            <MarkdownEditor
              onChange={this.onCommentsChange}
              initialValue={comments}
            />
          </Label>
          {timeEntry.id && userId === timeEntry.user.id
            ? (
              <OptionButtons>
                <Button
                  onClick={this.onUpdate}
                  palette='success'
                >
                Submit
                </Button>
                <Button
                  onClick={this.onDelete}
                  palette='danger'
                >
                Delete
                </Button>
              </OptionButtons>
            )
            : (
              <OptionButtons>
                <Button
                  onClick={this.onAdd}
                  palette='success'
                >
                Submit
                </Button>
              </OptionButtons>
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
  userName: PropTypes.string.isRequired,
  userId: PropTypes.number.isRequired,
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
  userName: state.user.name,
  userId: state.user.id,
  selectedIssue: state.issues.selected.data,
  tracking: state.tracking,
  time: state.timeEntry
});

const mapDispatchToProps = dispatch => ({
  addTimeEntry: timeEntry => dispatch(actions.timeEntry.add(timeEntry)),
  updateTimeEntry: (timeEntry, changes) => dispatch(actions.timeEntry.update(timeEntry, changes)),
  removeTimeEntry: (timeEntryId, issueId) => dispatch(actions.timeEntry.remove(timeEntryId, issueId))
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(TimeEntryModal));
