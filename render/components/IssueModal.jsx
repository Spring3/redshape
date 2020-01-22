import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled, { withTheme } from 'styled-components';

import { Input, Label } from './Input';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import Modal from './Modal';
import ProcessIndicator from './ProcessIndicator';
import Tooltip from "./Tooltip";
import ClockIcon from "mdi-react/ClockIcon";
import HelpCircleIcon from "mdi-react/HelpCircleIcon";
import DatePicker from './DatePicker';

import Select from 'react-select';

import RawSlider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './styles/rc-slider.css';

import 'rc-slider/assets/index.css'
import actions from '../actions';

import { durationToHours, hoursToDuration } from '../datetime'

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Slider = RawSlider;

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

const Title = styled.h4`
  margin: 0;
  font-size: 1rem;
`;

const DurationField = styled.div`
  max-width: 350px;
`;
const FieldAdjacentInfo = styled.div`
  align-self: center;
  color: gray;
  margin-left: 0.5rem;
  min-width: 10rem;
`;

const ClockIconStyled = styled(ClockIcon)`
  padding-bottom: 1px;
`;
const HelpIconStyled = styled(HelpCircleIcon)`
  padding-bottom: 1px;
`;
const LabelIcon = styled.span`
  margin-left: 0.2rem;
  color: #A0A0A0;
`
const DurationIcon = (<LabelIcon><Tooltip text="hours (3.23) or durations (3h 14m, 194 mins)"><ClockIconStyled size={14}/></Tooltip></LabelIcon>);

const compSelectStyles = {
  container: (base, state) => {
    return { ...base, minWidth: 185, borderColor: state.isDisabled ? '#E9E9E9' : '#A0A0A0' };
  },
  control: (base, state) => {
    return { ...base, borderColor: state.isDisabled ? '#E9E9E9' : '#A0A0A0' };
  },
};

const extractStatusTransitions = (transitions) => {
  const status = transitions && transitions.status;
  let statuses;
  if (status){
    statuses = status.sort((a, b) => a.position - b.position)
      .map(el => ({value: el.id, label: el.name}));
  }
  return statuses;
}

class IssueModal extends Component {
  constructor(props) {
    super(props);
    let propsIssueEntry = props.issueEntry;
    let issueEntry = {};
    let statusTransitions;
    if (propsIssueEntry){
      const { estimated_hours, done_ratio, due_date, children, transitions, status } = propsIssueEntry;
      statusTransitions = extractStatusTransitions(transitions);
      issueEntry = {
        estimated_duration: hoursToDuration(estimated_hours),
        progress: done_ratio,
        due_date: due_date || '',
        children: children ? children.length : 0,
        status: {value: status.id, label: status.name},
      };
    }
    this.state = {
      issueEntry,
      instance: new Date().getTime(),
      progress_info: issueEntry.progress || 0,
      wasModified: false,
      statusTransitions,
    };
  }

  componentDidUpdate(oldProps) {
    if (oldProps.isOpen !== this.props.isOpen && this.props.isOpen) {
      const { issueEntry } = this.props;

      if (issueEntry) {
        const { estimated_hours, done_ratio, due_date, children, transitions, status } = issueEntry;
        let statusTransitions = extractStatusTransitions(transitions);
        this.setState({
          // issueEntry,
          issueEntry: {
            estimated_duration: hoursToDuration(estimated_hours),
            progress: done_ratio,
            due_date: due_date || '',
            children: children ? children.length : 0,
            status: {value: status.id, label: status.name},
          },
          instance: new Date().getTime(),
          progress_info: done_ratio,
          wasModified: false,
          statusTransitions,
        });
      }
    } else if (oldProps.isOpen !== this.props.isOpen && !this.props.isOpen) {
      this.props.resetValidation();
    }
  }

  componentWillUnmount() {
    this.props.resetValidation();
  }

  runValidation = (checkFields) => {
    const { validateBeforeUpdate } = this.props;
    const { issueEntry } = this.state;

    validateBeforeUpdate({
      progress: issueEntry.progress,
      estimated_duration: issueEntry.estimated_duration,
      due_date: issueEntry.due_date,
    }, checkFields);
  }

  onUpdate = () => {
    const { wasModified, issueEntry } = this.state;
    if (wasModified) {
      this.props.updateIssueEntry(this.props.issueEntry, issueEntry)
        .then((ret) => {
          if (!this.props.issue.error) {
            const unchanged = ret && ret.unchanged;
            if (!unchanged){
              this.props.issueGet(this.props.issueEntry.id);
            }
            this.props.onClose();
          }
        });
    } else {
      this.props.onClose();
    }
  }

  onDueDateChange = date => this.setState({
    issueEntry: {
      ...this.state.issueEntry,
      due_date: date != null ? date.toISOString().split('T')[0] : null,
    },
    wasModified: true
  });

  onProgressChange = (progress) => {
    this.setState({
      issueEntry: {
        ...this.state.issueEntry,
        progress,
      },
      wasModified: true
    });
  }

  onEstimatedDurationChange = ({ target: { value } }) => {
    value = '' + value
    this.setState({
      issueEntry: {
        ...this.state.issueEntry,
        estimated_duration: value.replace(',', '.'),
      },
      wasModified: true
    });
  }

  onStatusChange = (status) => {
    this.setState({
      issueEntry: {
        ...this.state.issueEntry,
        status,
      },
      wasModified: true
    });
  }

  getErrorMessage = (error) => {
    if (!error) return null;
    return error.message.replace(new RegExp(error.context.key, 'g'), error.path[0]);
  }

  render() {
    const { isUserAuthor, isOpen, isEditable, onClose, theme, issue, issueEntry: propsIssueEntry, progressSlider, isIssueAlwaysEditable } = this.props;
    const { issueEntry, wasModified, progress_info, instance, statusTransitions } = this.state;
    const { progress, estimated_duration, due_date, children, status } = issueEntry;
    const validationErrors = issue.error && issue.error.isJoi
      ? {
        progress: issue.error.details.find(error => error.path[0] === 'progress'),
        estimated_duration: issue.error.details.find(error => error.path[0] === 'estimated_duration'),
        due_date: issue.error.details.find(error => error.path[0] === 'due_date'),
        status: issue.error.details.find(error => error.path[0] === 'status'),
      }
      : {};
    let estimatedDurationInfo = '';
    if (estimated_duration){
      let hours = durationToHours(estimated_duration);
      if (hours > 0){
        estimatedDurationInfo = `${Number(hours.toFixed(2))} hours`;
      }
    }
    const progressInfo = `${progress_info.toFixed(0)}%`;
    const disableField = isIssueAlwaysEditable ? false : (!isEditable || !isUserAuthor);
    const assigned_to = propsIssueEntry.assigned_to;
    return (
      <Modal
        open={!!isOpen}
        onClose={onClose}
        needConfirm={wasModified}
        center={true}
      >
        <Fragment>
          <FlexRow>
            <Title>Edit issue
              <LabelIcon><Tooltip text="- Parent tasks cannot edit 'Progress' and 'Due date'.\n- Field 'Status' needs server-side support (plugins).\n- Wrong permissions may show an error or not update the issue."><HelpIconStyled size={14}/></Tooltip></LabelIcon>
            </Title>
          </FlexRow>
          <FlexRow>
            <Label htmlFor="assignee" label="Assignee">
              <div name="assignee">{assigned_to && assigned_to.name}</div>
            </Label>
          </FlexRow>
          <Label htmlFor="issue" label="Issue">
            <div name="issue">#{propsIssueEntry.id}&nbsp;{propsIssueEntry.subject}</div>
          </Label>
          {
            status != null && (
              <Label htmlFor="status" label="Status">
                <FlexRow>
                  <Select
                    name="status"
                    options={statusTransitions}
                    styles={compSelectStyles}
                    value={status}
                    onChange={this.onStatusChange}
                    isClearable={false}
                    isDisabled={disableField}
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
                </FlexRow>
                <ErrorMessage show={!!validationErrors.status}>
                  {this.getErrorMessage(validationErrors.status)}
                </ErrorMessage>
              </Label>
            )
          }
          <FlexRow>
            <DurationField>
              <Label htmlFor="estimated_duration" label="Estimation" rightOfLabel={DurationIcon}>
                <FlexRow>
                  <Input
                    type="text"
                    name="estimated_duration"
                    value={estimated_duration}
                    onBlur={() => this.runValidation(['estimated_duration'])}
                    disabled={disableField}
                    onChange={this.onEstimatedDurationChange}
                  />
                  <FieldAdjacentInfo>{estimatedDurationInfo}</FieldAdjacentInfo>
                </FlexRow>
              </Label>
              <ErrorMessage show={!!validationErrors.estimated_duration}>
                {this.getErrorMessage(validationErrors.estimated_duration)}
              </ErrorMessage>
            </DurationField>
            {
              !children && (
              <div>
                <Label htmlFor="due_date" label="Due date">
                  <DatePicker
                    key={instance}
                    name="due_date"
                    value={due_date}
                    isDisabled={disableField}
                    onChange={(value) => this.onDueDateChange(value) && this.runValidation('due_date')}
                  />
                </Label>
                <ErrorMessage show={!!validationErrors.due_date}>
                  {this.getErrorMessage(validationErrors.due_date)}
                </ErrorMessage>
              </div>
              )}
          </FlexRow>
          {
            !children && (
              <FlexRow>
                <div>
                  <Label htmlFor="progress" label="Progress">
                    <FlexRow>
                      <Slider
                        style={{width:180}}
                        // bugfix: avoid sloppy dragging (value/onChange) using this key
                        key={instance}
                        name="progress"
                        tipProps={{placement:'right'}}
                        handleStyle={{borderColor:theme.green}}
                        onChange={(value) => this.setState({ progress_info: value, wasModified: true })}
                        trackStyle={{backgroundColor:theme.green}}
                        tipFormatter={(value) => `${value}%`}
                        min={0}
                        max={100}
                        step={progressSlider === '1%' ? 1 : 10}
                        defaultValue={progress}
                        disabled={disableField}
                        onAfterChange={(value) => this.onProgressChange(value) && this.runValidation('progress')}
                      />
                      <FieldAdjacentInfo>{progressInfo}</FieldAdjacentInfo>
                    </FlexRow>
                  </Label>
                  <ErrorMessage show={!!validationErrors.progress}>
                    {this.getErrorMessage(validationErrors.progress)}
                  </ErrorMessage>
                </div>
              </FlexRow>
            )}
          <OptionButtons>
            <Button
              id="btn-update"
              onClick={this.onUpdate}
              disabled={issue.isFetching}
              palette='success'
            >
              Submit
            </Button>
            { issue.isFetching && (<ProcessIndicator />) }
          </OptionButtons>
        </Fragment>
      </Modal>
    );
  }
}

IssueModal.propTypes = {
  isUserAuthor: PropTypes.bool.isRequired,
  issue: PropTypes.shape({
    isFetching: PropTypes.bool.isRequired,
    error: PropTypes.instanceOf(Error)
  }).isRequired,
  issueEntry: PropTypes.shape({
    id: PropTypes.number.isRequired,
    subject: PropTypes.string.isRequired,
    journals: PropTypes.arrayOf(PropTypes.object).isRequired,
    description: PropTypes.string,
    project: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    priority: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    assigned_to: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }),
    done_ratio: PropTypes.number.isRequired,
    start_date: PropTypes.string.isRequired,
    due_date: PropTypes.string.isRequired,
    estimated_hours: PropTypes.number,
    estimated_duration: PropTypes.string,
    spent_hours: PropTypes.number,
    tracker: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    status: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    author: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    custom_fields: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })),
    tags: PropTypes.arrayOf(PropTypes.string.isRequired),
    transitions: PropTypes.shape({
      status: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        position: PropTypes.number.isRequired,
      })),
    }),
  }),
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isEditable: PropTypes.bool,
  issueGet: PropTypes.func.isRequired,
  updateIssueEntry: PropTypes.func.isRequired,
  validateBeforeUpdate: PropTypes.func.isRequired,
  resetValidation: PropTypes.func.isRequired,
  progressSlider: PropTypes.string.isRequired,
  isIssueAlwaysEditable: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  issue: state.issue,
  progressSlider: state.settings.progressSlider,
  isIssueAlwaysEditable: state.settings.isIssueAlwaysEditable,
});

const mapDispatchToProps = dispatch => ({
  issueGet: (id) => dispatch(actions.issues.get(id)),
  updateIssueEntry: (issueEntry, changes) => dispatch(actions.issue.update(issueEntry, changes)),
  validateBeforeUpdate: (changes, checkFields) => dispatch(actions.issue.validateBeforeUpdate(changes, checkFields)),
  resetValidation: () => dispatch(actions.issue.reset())
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(IssueModal));
