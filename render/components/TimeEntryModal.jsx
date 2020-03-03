import _debounce from 'lodash/debounce';
import React, { Component, Fragment } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Select from 'react-select';
import styled, { withTheme } from 'styled-components';

import ClockIcon from 'mdi-react/ClockIcon';
import HelpCircleIcon from 'mdi-react/HelpCircleIcon';
import { Input, Label } from './Input';
import Button from './Button';
import MarkdownEditor from './MarkdownEditor';
import ErrorMessage from './ErrorMessage';
import DatePicker from './DatePicker';
import Modal from './Modal';
import ProcessIndicator from './ProcessIndicator';
import Tooltip from './Tooltip';
import CustomFields from './CustomFields';

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
  border-top: 2px solid ${props => props.theme.bgDark};
  display: flex;

  button {
    padding: 8px 15px;
  }

  div {
    margin-left: 20px;
  }
`;

const inputStyle = { width: 250, minHeight: 38 };

const Grid = styled.div`
  display: grid;
  grid-template-columns: 250px 250px;
  grid-column-gap: 40px;

  > .grid-row {
    grid-column: 1 / -1;
  }
`;

const DurationInfo = styled.div`
  color: gray;

  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 87px;
  height: 36px;
  border: 1px solid #A0A0A0;
  border-radius: 0 3px 3px 0;
  border-left: 0;
  margin-left: -1px;

  &.disabled {
    border-color: #E9E9E9;
  }
`;
const CombinedInput = styled.div`
  background: #EFEFEF;
  height: 38px;
  display: flex;
  justify-content: left;
  align-items: center;
  border-radius: 3px;
`;

const ClockIconStyled = styled(ClockIcon)`
  padding-bottom: 1px;
`;
const LabelIcon = styled.span`
  margin-left: 0.2rem;
  color: #A0A0A0;
`;
const DurationIcon = (<LabelIcon><Tooltip text="hours (3.23) or durations (3h 14m, 194 mins)"><ClockIconStyled size={14} /></Tooltip></LabelIcon>);

const Title = styled.h4`
  margin: 0;
  font-size: 1rem;
`;
const HelpIconStyled = styled(HelpCircleIcon)`
  padding-bottom: 1px;
`;

const compSelectStyles = {
  container: (base, state) => ({ ...base, minWidth: 250, borderColor: state.isDisabled ? '#E9E9E9' : '#A0A0A0' }),
  control: (base, state) => ({ ...base, borderColor: state.isDisabled ? '#E9E9E9' : '#A0A0A0' }),
};

class TimeEntryModal extends Component {
  constructor(props) {
    super(props);
    this.state = this.generateState(props);

    this.debouncedCommentsChange = _debounce((comments) => {
      this.onCommentsChange(comments);
      this.runValidation('comments');
    }, 300);
    this.debouncedDurationConversionChange = _debounce((duration) => {
      this.onDurationConversionChange(duration);
      this.runValidation(['duration', 'hours']);
    }, 300);
  }

  generateState({ timeEntry, initialVolatileContent }) {
    if (timeEntry) {
      const {
        id, activity, user, issue, hours, duration, comments, spent_on, custom_fields
      } = timeEntry;
      let customFieldsMap = {};
      if (custom_fields) {
        customFieldsMap = Object.fromEntries(custom_fields.map(el => [el.name, el.value]));
      } else {
        const { fieldsData } = this.props;
        if (fieldsData && fieldsData.time_entry) {
          customFieldsMap = Object.fromEntries(fieldsData.time_entry.map((el) => {
            const defValue = el.default_value;
            const value = el.multiple ? (defValue ? [defValue] : []) : el.default_value;
            return [el.name, value];
          }));
        }
      }

      timeEntry = {
        id,
        activity: { ...activity },
        user: { ...user },
        issue: { ...issue },
        hours,
        duration: (duration == null && hours) ? hoursToDuration(hours) : duration,
        comments,
        spent_on,
        customFieldsMap: {
          ...customFieldsMap
        }
      };
    } else {
      timeEntry = {
        activity: {},
        user: {},
        issue: {},
        hours: undefined,
        duration: undefined,
        comments: undefined,
        spent_on: moment().format('YYYY-MM-DD'),
        customFieldsMap: {}
      };
    }
    return {
      timeEntry,
      wasModified: !!initialVolatileContent
    };
  }

  componentDidUpdate(oldProps) {
    if (oldProps.isOpen !== this.props.isOpen && this.props.isOpen) {
      if (this.props.timeEntry) {
        this.setState(this.generateState(this.props));
      }
    } else if (oldProps.isOpen !== this.props.isOpen && !this.props.isOpen) {
      this.props.resetValidation();
    }
  }

  componentWillUnmount() {
    this.props.resetValidation();
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

  onDateChange = date => this.setState({
    timeEntry: {
      ...this.state.timeEntry,
      spent_on: date != null ? date.toISOString().split('T')[0] : null,
    },
    wasModified: true
  });

  onDurationChange = ({ target: { value } }) => {
    value = `${value}`;
    this.setState({
      timeEntry: {
        ...this.state.timeEntry,
        duration: value.replace(',', '.'),
      },
      wasModified: true
    });

    this.debouncedDurationConversionChange(value);
  }

  onDurationConversionChange = (value) => {
    this.setState({
      timeEntry: {
        ...this.state.timeEntry,
        hours: durationToHours(value)
      }
    });
  }

  onCommentsChange = (comments) => {
    this.setState({
      timeEntry: {
        ...this.state.timeEntry,
        comments
      },
      wasModified: true
    });
  }

  onActivityChange = (activity) => {
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
      duration: timeEntry.duration,
      issue: timeEntry.issue,
      spent_on: timeEntry.spent_on,
      customFieldsMap: timeEntry.customFieldsMap
    }, { fieldsData: this.props.fieldsData }).then(() => {
      if (!this.props.time.error) {
        this.props.onClose(true);
      }
    });
  };

  onUpdate = () => {
    const { wasModified, timeEntry } = this.state;
    if (wasModified) {
      this.props.updateTimeEntry(this.props.timeEntry, {
        comments: timeEntry.comments,
        hours: timeEntry.hours,
        duration: timeEntry.duration,
        spent_on: timeEntry.spent_on,
        activity: timeEntry.activity,
        customFieldsMap: timeEntry.customFieldsMap
      }).then(() => {
        if (!this.props.time.error) {
          this.props.onClose();
        }
      });
    } else {
      this.props.onClose();
    }
  };

  onFieldChange = (name, value) => {
    const { timeEntry } = this.state;
    const { customFieldsMap } = timeEntry;
    const newState = {
      timeEntry: {
        ...timeEntry,
      },
      wasModified: true
    };
    newState.timeEntry.customFieldsMap = {
      ...customFieldsMap,
      [name]: value
    };
    this.setState(newState);
  }

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
      duration, hours, comments, spent_on, activity, customFieldsMap
    } = timeEntry;
    const selectedActivity = { id: activity.id, label: activity.name };
    const validationErrors = time.error && time.error.isJoi
      ? {
        comments: time.error.details.find(error => error.path[0] === 'comments'),
        activity: time.error.details.find(error => error.path[0] === 'activity'),
        hours: time.error.details.find(error => error.path[0] === 'hours'),
        duration: time.error.details.find(error => error.path[0] === 'duration'),
        spentOn: time.error.details.find(error => error.path[0] === 'spent_on')
      }
      : {};
    let durationInfo = '';
    if (hours > 0) {
      durationInfo = `${Number(hours.toFixed(2))} hours`;
    }
    const hasEvenFields = (customFieldsMap && Object.keys(customFieldsMap).length % 2 === 0);
    const tooltipEntryModal = '- Custom Fields need server-side support (plugins).\n- Wrong permissions may show an error or not update the issue.';
    return (
      <Modal
        width={540}
        open={!!isOpen}
        onClose={onClose}
        needConfirm={wasModified}
        center={true}
      >
        <Fragment>
          <Title>
            { timeEntry.id ? 'Edit time entry' : 'New time entry' }
            <LabelIcon><Tooltip position="right" text={tooltipEntryModal}><HelpIconStyled size={14} /></Tooltip></LabelIcon>
          </Title>
          <Label htmlFor="issue" label="Issue">
            <div name="issue">{`#${timeEntry.issue.id} ${timeEntry.issue.name}`}</div>
          </Label>
          <Grid>
            <div className={hasEvenFields ? '' : 'grid-row'}>
              <Label htmlFor="author" label="Author">
                <div name="author">{timeEntry.user.name}</div>
              </Label>
            </div>
            <div className={hasEvenFields ? 'grid-row' : ''}>
              <Label htmlFor="activity" label="Activity">
                <Select
                  name="activity"
                  options={activities}
                  styles={compSelectStyles}
                  value={selectedActivity}
                  isDisabled={!isUserAuthor}
                  onBlur={() => this.runValidation('activity')}
                  onChange={this.onActivityChange}
                  isClearable={false}
                  theme={defaultTheme => ({
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
            </div>
            <div>
              <Label htmlFor="duration" label="Duration" rightOfLabel={DurationIcon}>
                <FlexRow>
                  <CombinedInput>
                    <Input
                      type="text"
                      name="duration"
                      style={{ ...inputStyle, width: 163 }}
                      value={duration}
                      disabled={!isEditable || !isUserAuthor}
                      onChange={this.onDurationChange}
                      // onBlur omitted on purpose
                    />
                    <DurationInfo className={(!isEditable || !isUserAuthor) ? 'disabled' : ''}>{durationInfo}</DurationInfo>
                  </CombinedInput>
                </FlexRow>
              </Label>
              <ErrorMessage show={!!validationErrors.duration || validationErrors.hours}>
                {this.getErrorMessage(validationErrors.duration || validationErrors.hours)}
              </ErrorMessage>
            </div>
            <div>
              <Label htmlFor="spent_on" label="Date">
                <DatePicker
                  style={inputStyle}
                  name="date"
                  value={new Date(spent_on)}
                  isDisabled={!isEditable || !isUserAuthor}
                  onBlur={() => this.runValidation('spent_on')}
                  onChange={this.onDateChange}
                />
              </Label>
              <ErrorMessage show={!!validationErrors.spentOn}>
                {this.getErrorMessage(validationErrors.spentOn)}
              </ErrorMessage>
            </div>
            <CustomFields
              type="time_entry"
              customFieldsMap={customFieldsMap}
              isDisabled={!isEditable || !isUserAuthor}
              onChange={this.onFieldChange}
            />
          </Grid>
          <Label label="Comments" htmlFor="comments">
            <MarkdownEditor
              isDisabled={!isUserAuthor}
              onChange={this.debouncedCommentsChange}
              // onBlur omitted on purpose
              initialValue={comments}
              maxLength={255}
            />
          </Label>
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
                { time.isFetching && (<ProcessIndicator />) }
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
                { time.isFetching && (<ProcessIndicator />) }
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
    }).isRequired,
    custom_fields: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired
    })),
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
  resetValidation: PropTypes.func.isRequired,
  initialVolatileContent: PropTypes.bool,
};

const mapStateToProps = state => ({
  time: state.timeEntry,
  fieldsData: state.fields.data,
});

const mapDispatchToProps = dispatch => ({
  publishTimeEntry: (timeEntry, data) => dispatch(actions.timeEntry.publish(timeEntry, data)),
  updateTimeEntry: (timeEntry, changes) => dispatch(actions.timeEntry.update(timeEntry, changes)),
  validateBeforePublish: (timeEntry, checkFields) => dispatch(actions.timeEntry.validateBeforePublish(timeEntry, checkFields)),
  validateBeforeUpdate: (changes, checkFields) => dispatch(actions.timeEntry.validateBeforeUpdate(changes, checkFields)),
  resetValidation: () => dispatch(actions.timeEntry.reset())
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(TimeEntryModal));
