import _ from 'lodash';
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
  border-top: 2px solid ${props => props.theme.bgDark};
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
      timeEntry: props.timeEntry || {
        activity: {},
        user: {},
        issue: {},
        hours: undefined,
        comments: undefined,
        spent_on: moment().format('YYYY-MM-DD')
      },
      wasModified: false
    };
  }

  componentDidUpdate(oldProps) {
    if (oldProps.isOpen !== this.props.isOpen && this.props.isOpen) {
      const { timeEntry } = this.props;

      if (timeEntry) {
        this.setState({
          timeEntry,
          wasModified: false
        });
      }
    }
  }

  runValidation = () => {
    const { validateBeforePublish, validateBeforeUpdate } = this.props;
    const { timeEntry } = this.state;
    if (timeEntry.id) {
      validateBeforeUpdate({
        comments: timeEntry.comments,
        hours: timeEntry.hours,
        spent_on: timeEntry.spent_on,
        activity: timeEntry.activity
      });
    } else {
      validateBeforePublish({
        activity: timeEntry.activity,
        comments: timeEntry.comments,
        hours: timeEntry.hours,
        issue: timeEntry.issue,
        spent_on: timeEntry.spent_on
      });
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
      hours: e.target.value ? parseFloat(e.target.value.replace(',', '.')) : e.target.value
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

  onAdd = () => {
    const { timeEntry } = this.state;
    this.props.publishTimeEntry({
      activity: timeEntry.activity,
      comments: timeEntry.comments,
      hours: timeEntry.hours,
      issue: timeEntry.issue,
      spent_on: timeEntry.spent_on
    }).then(() => {
      if (!this.props.time.error) {
        this.props.onClose()
      }
    });
  };

  onUpdate = () => {
    const { wasModified, timeEntry } = this.state;
    if (wasModified) {
      this.props.updateTimeEntry(timeEntry, {
        comments: timeEntry.comments,
        hours: timeEntry.hours,
        spent_on: timeEntry.spent_on,
        activity: timeEntry.activity
      }).then(() => {
        if (!this.props.time.error) {
          this.props.onClose();
        }
      })
    } else {
      this.props.onClose();
    }
  };

  getErrorMessage = (error) => {
    if (!error) return null;
    return error.message.replace(new RegExp(error.context.key, 'g'), error.path[0]);
  }

  render() {
    const { activities, isUserAuthor, isOpen, isEditable, onClose, theme, time } = this.props;
    const { timeEntry, wasModified } = this.state;
    const { hours, comments, spent_on, activity } = timeEntry;
    const selectedActivity = { id: activity.id, label: activity.name }; 
    const validationErrors = time.error && time.error.isJoi
      ? {
        activity: time.error.details.find(error => error.path[0] === 'activity'),
        hours: time.error.details.find(error => error.path[0] === 'hours'),
        spentOn: time.error.details.find(error => error.path[0] === 'spent_on')
      }
      : {};
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
              options={activities}
              styles={selectStyles}
              value={selectedActivity}
              onBlur={this.runValidation}
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
          <ErrorMessage show={!!validationErrors.activity}>
            {this.getErrorMessage(validationErrors.activity)}
          </ErrorMessage>
          <FlexRow>
            <div>
              <Label htmlFor="hours" label="Hours">
                <Input
                  type="number"
                  name="hours"
                  value={hours}
                  onBlur={this.runValidation}
                  disabled={!isEditable}
                  onChange={this.onHoursChange}
                />
              </Label>
              <ErrorMessage show={!!validationErrors.hours}>
                {this.getErrorMessage(validationErrors.hours)}
              </ErrorMessage>
            </div>
            <div>
              <Label htmlFor="spent_on" label="Date">
                <DatePicker
                  name="date"
                  value={new Date(spent_on)}
                  isDisabled={!isEditable}
                  onBlur={this.runValidation}
                  onChange={this.onDateChange}
                />
              </Label>
              <ErrorMessage show={!!validationErrors.spentOn}>
                {this.getErrorMessage(validationErrors.spentOn)}
              </ErrorMessage>
            </div>
          </FlexRow>
          <Label label="Comments" htmlFor="comments">
            <MarkdownEditor
              onChange={this.onCommentsChange}
              initialValue={comments}
            />
          </Label>
          {timeEntry.id && isUserAuthor
            ? (
              <OptionButtons>
                <Button
                  id="btn-update"
                  disabled={!wasModified}
                  onClick={this.onUpdate}
                  palette='success'
                >
                Submit
                </Button>
              </OptionButtons>
            )
            : (
              <OptionButtons>
                <Button
                  id="btn-add"
                  disabled={!wasModified}
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
  activities: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired).isRequired,
  isUserAuthor: PropTypes.bool.isRequired,
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
  time: PropTypes.shape({
    isFetching: PropTypes.bool.isRequired,
    error: PropTypes.instanceOf(Error)
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isEditable: PropTypes.bool,
  publishTimeEntry: PropTypes.func.isRequired,
  updateTimeEntry: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  time: state.timeEntry
});

const mapDispatchToProps = dispatch => ({
  publishTimeEntry: timeEntry => dispatch(actions.timeEntry.publish(timeEntry)),
  updateTimeEntry: (timeEntry, changes) => dispatch(actions.timeEntry.update(timeEntry, changes)),
  validateBeforePublish: timeEntry => dispatch(actions.timeEntry.validateBeforePublish(timeEntry)),
  validateBeforeUpdate: changes => dispatch(actions.timeEntry.validateBeforeUpdate(changes))
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(TimeEntryModal));
