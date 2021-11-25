import _debounce from 'lodash/debounce';
import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Select from 'react-select';
import styled, { withTheme } from 'styled-components';
import { css } from '@emotion/react';

import ClockIcon from 'mdi-react/ClockIcon';
import { Input } from './Input';
import { FormField } from './FormField';
import Button from './Button';
import MarkdownEditor from './MarkdownEditor';
import { ErrorMessage } from './ErrorMessage';
import DatePicker from './DatePicker';
import { Modal } from './Modal';
import { ProcessIndicator } from './ProcessIndicator';
import Tooltip from './Tooltip';

import actions from '../actions';

import { durationToHours, hoursToDuration } from '../datetime';

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const OptionButtons = styled.div`
  position: relative;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid ${(props) => props.theme.bgDark};
  display: flex;
  
  button {
    padding: 8px 15px;
  }

  div {
    margin-left: 20px;
  }
`;

const DurationField = styled.div`
  max-width: 350px;
`;
const DurationInfo = styled.div`
  align-self: center;
  color: gray;
  margin-left: 0.5rem;
  min-width: 10rem;
`;

const ClockIconStyled = styled(ClockIcon)`
  padding-bottom: 1px;
`;
const LabelIcon = styled.span`
  margin-left: 0.2rem;
`;
const DurationIcon = (
  <LabelIcon>
    <Tooltip text="hours (3.23) or durations (3h 14m, 194 mins)">
      <ClockIconStyled size={14} />
    </Tooltip>
  </LabelIcon>
);

const styles = {
  processIndicatorText: css`
    white-space: nowrap;
    padding-left: 20px;
    vertical-align: middle;
  `
};

const selectStyles = {
  container: (base) => ({ ...base })
};

class TimeEntryModal extends Component {
  constructor(props) {
    super(props);
    const tEntry = props.timeEntry;
    if (tEntry) {
      if (tEntry.duration == null && tEntry.hours) {
        tEntry.duration = hoursToDuration(tEntry.hours);
      }
    }
    this.state = {
      timeEntry: props.timeEntry || {
        activity: {},
        user: {},
        issue: {},
        hours: undefined,
        duration: undefined,
        comments: undefined,
        spent_on: moment().format('YYYY-MM-DD')
      },
      wasModified: false
    };
    if (props.initialVolatileContent) { // TimeEntry filled with duration (from Timer)
      this.state.wasModified = true;
    }

    this.debouncedCommentsChange = _debounce(this.onCommentsChange, 300);
    this.debouncedDurationConversionChange = _debounce(this.onDurationConversionChange, 300);
  }

  componentDidUpdate(oldProps) {
    const { isOpen } = this.props;
    if (oldProps.isOpen !== isOpen && isOpen) {
      const { timeEntry, initialVolatileContent } = this.props;

      if (timeEntry) {
        // eslint-disable-next-line
        this.setState({
          timeEntry,
          wasModified: !!initialVolatileContent
        });
      }
    }
  }

  runValidation = (checkFields) => {
    const { validateBeforePublish, validateBeforeUpdate } = this.props;

    const { timeEntry } = this.state;

    if (timeEntry.id) {
      validateBeforeUpdate({
        comments: timeEntry.comments,
        hours: timeEntry.hours,
        duration: timeEntry.duration,
        spent_on: timeEntry.spent_on,
        activity: timeEntry.activity
      }, checkFields);
    } else {
      validateBeforePublish({
        activity: timeEntry.activity,
        comments: timeEntry.comments,
        hours: timeEntry.hours,
        duration: timeEntry.duration,
        issue: timeEntry.issue,
        spent_on: timeEntry.spent_on
      }, checkFields);
    }
  }

  onDateChange = (date) => {
    const { timeEntry } = this.state;
    this.setState({
      timeEntry: {
        ...timeEntry,
        spent_on: date != null ? date.toISOString().split('T')[0] : null,
      },
      wasModified: true
    });
  }

  onDurationChange = ({ target: { value } }) => {
    const { timeEntry } = this.state;
    const durationValue = `${value}`.replace(',', '.');
    this.setState({
      timeEntry: {
        ...timeEntry,
        duration: durationValue,
      },
      wasModified: true
    });

    this.debouncedDurationConversionChange(value);
  }

  onDurationConversionChange = (value) => {
    const { timeEntry } = this.state;
    this.setState({
      timeEntry: {
        ...timeEntry,
        hours: durationToHours(value)
      }
    });
  }

  onCommentsChange = (comments) => {
    const { timeEntry } = this.state;
    this.setState({
      timeEntry: {
        ...timeEntry,
        comments
      },
      wasModified: true
    });
  }

  onActivityChange = (activity) => {
    const { timeEntry } = this.state;
    this.setState({
      timeEntry: {
        ...timeEntry,
        activity: { id: activity.value, name: activity.label }
      },
      wasModified: true
    });
  };

  onAdd = () => {
    const { publishTimeEntry, time, onClose } = this.props;
    const { timeEntry } = this.state;
    publishTimeEntry({
      activity: timeEntry.activity,
      comments: timeEntry.comments,
      hours: timeEntry.hours,
      duration: timeEntry.duration,
      issue: timeEntry.issue,
      spent_on: timeEntry.spent_on
    }).then(() => {
      if (!time.error) {
        onClose();
      }
    });
  };

  onUpdate = () => {
    const { updateTimeEntry, time, onClose } = this.props;
    const { wasModified, timeEntry } = this.state;
    if (wasModified) {
      updateTimeEntry(timeEntry, {
        comments: timeEntry.comments,
        hours: timeEntry.hours,
        duration: timeEntry.duration,
        spent_on: timeEntry.spent_on,
        activity: timeEntry.activity
      }).then(() => {
        if (!time.error) {
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  getErrorMessage = (error) => {
    if (!error) return null;
    return error.message.replace(new RegExp(error.context.key, 'g'), error.path[0]);
  }

  render() {
    const {
      activities, isUserAuthor, isOpen, isEditable, onClose, theme, time
    } = this.props;
    const { timeEntry, wasModified } = this.state;
    const {
      duration, hours, comments, spent_on, activity
    } = timeEntry;
    const selectedActivity = { id: activity.id, label: activity.name };
    const validationErrors = time.error && time.error.isJoi
      ? {
        comments: time.error.details.find((error) => error.path[0] === 'comments'),
        activity: time.error.details.find((error) => error.path[0] === 'activity'),
        hours: time.error.details.find((error) => error.path[0] === 'hours'),
        duration: time.error.details.find((error) => error.path[0] === 'duration'),
        spentOn: time.error.details.find((error) => error.path[0] === 'spent_on')
      }
      : {};
    let durationInfo = '';
    if (hours > 0) {
      durationInfo = `${Number(hours.toFixed(2))} hours`;
    }
    return (
      <Modal
        open={!!isOpen}
        onClose={onClose}
        needConfirm={wasModified}
        center={true}
      >
        <>
          <FormField htmlFor="author" label="Author">
            <div name="author">{timeEntry.user.name}</div>
          </FormField>
          <FormField htmlFor="issue" label="Issue">
            <div name="issue" data-testId="time-entry-modal-title">
              #
              {timeEntry.issue.id}
              {timeEntry.issue.name}
            </div>
          </FormField>
          <FormField htmlFor="activity" label="Activity">
            <Select
              name="activity"
              options={activities}
              styles={selectStyles}
              value={selectedActivity}
              isDisabled={!isUserAuthor}
              onBlur={() => this.runValidation('activity')}
              onChange={this.onActivityChange}
              isClearable={false}
              theme={(defaultTheme) => ({
                ...defaultTheme,
                borderRadius: 3,
                colors: {
                  ...defaultTheme.colors,
                  primary: theme.main,
                },
              })}
            />
          </FormField>
          <ErrorMessage show={!!validationErrors.activity}>
            {this.getErrorMessage(validationErrors.activity)}
          </ErrorMessage>
          <FlexRow>
            <DurationField>
              <FormField htmlFor="duration" label="Duration" rightOfLabel={DurationIcon}>
                <FlexRow>
                  <Input
                    type="text"
                    name="duration"
                    value={duration}
                    onBlur={() => this.runValidation(['duration', 'hours'])}
                    disabled={!isEditable || !isUserAuthor}
                    onChange={this.onDurationChange}
                  />
                  <DurationInfo>{durationInfo}</DurationInfo>
                </FlexRow>
              </FormField>
              <ErrorMessage show={!!validationErrors.duration || validationErrors.hours}>
                {this.getErrorMessage(validationErrors.duration || validationErrors.hours)}
              </ErrorMessage>
            </DurationField>
            <div>
              <FormField htmlFor="spent_on" label="Date">
                <DatePicker
                  name="date"
                  value={new Date(spent_on)}
                  isDisabled={!isEditable || !isUserAuthor}
                  onBlur={() => this.runValidation('spent_on')}
                  onChange={this.onDateChange}
                />
              </FormField>
              <ErrorMessage show={!!validationErrors.spentOn}>
                {this.getErrorMessage(validationErrors.spentOn)}
              </ErrorMessage>
            </div>
          </FlexRow>
          <FormField label="Comments" htmlFor="comments">
            <MarkdownEditor
              isDisabled={!isUserAuthor}
              onChange={this.debouncedCommentsChange}
              onBlur={() => this.runValidation('comments')}
              initialValue={comments}
              maxLength={255}
            />
          </FormField>
          <ErrorMessage show={!!validationErrors.comments}>
            {this.getErrorMessage(validationErrors.comments)}
          </ErrorMessage>
          {timeEntry.id
            ? (
              <OptionButtons>
                <Button
                  id="btn-update"
                  onClick={this.onUpdate}
                  disabled={time.isFetching}
                  palette="success"
                >
                  Submit
                </Button>
                { time.isFetching && (<ProcessIndicator><span css={styles.processIndicatorText}>Please wait...</span></ProcessIndicator>) }
              </OptionButtons>
            )
            : (
              <OptionButtons>
                <Button
                  id="btn-add"
                  disabled={!wasModified || time.isFetching}
                  onClick={this.onAdd}
                  palette="success"
                >
                  Submit
                </Button>
                { time.isFetching && (<ProcessIndicator><span css={styles.processIndicatorText}>Please wait...</span></ProcessIndicator>) }
              </OptionButtons>
            )}
        </>
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
    duration: PropTypes.string.isRequired,
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
  updateTimeEntry: PropTypes.func.isRequired,
  initialVolatileContent: PropTypes.bool,
  validateBeforePublish: PropTypes.func.isRequired,
  validateBeforeUpdate: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  time: state.timeEntry
});

const mapDispatchToProps = (dispatch) => ({
  publishTimeEntry: (timeEntry) => dispatch(actions.timeEntry.publish(timeEntry)),
  updateTimeEntry: (timeEntry, changes) => dispatch(actions.timeEntry.update(timeEntry, changes)),
  validateBeforePublish: (timeEntry, checkFields) => dispatch(
    actions.timeEntry.validateBeforePublish(timeEntry, checkFields)
  ),
  validateBeforeUpdate: (changes, checkFields) => dispatch(
    actions.timeEntry.validateBeforeUpdate(changes, checkFields)
  )
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(TimeEntryModal));
