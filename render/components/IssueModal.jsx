import _debounce from 'lodash/debounce';
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
import DatePicker from './DatePicker';

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
const LabelIcon = styled.span`
  margin-left: 0.2rem;
`
const DurationIcon = (<LabelIcon><Tooltip text="hours (3.23) or durations (3h 14m, 194 mins)"><ClockIconStyled size={14}/></Tooltip></LabelIcon>);

class IssueModal extends Component {
  constructor(props) {
    super(props);
    let propsIssueEntry = props.issueEntry;
    let issueEntry = {};
    if (propsIssueEntry){
      const { estimated_hours, done_ratio, due_date, children } = propsIssueEntry;
      issueEntry = {
        estimated_duration: hoursToDuration(estimated_hours),
        progress: done_ratio,
        due_date: due_date || '',
        children: children ? children.length : 0
      };
    }
    this.state = {
      issueEntry,
      instance: new Date().getTime(),
      progress_info: issueEntry.progress || 0,
      wasModified: false
    };
  }

  componentDidUpdate(oldProps) {
    if (oldProps.isOpen !== this.props.isOpen && this.props.isOpen) {
      const { issueEntry } = this.props;

      if (issueEntry) {
        const { estimated_hours, done_ratio, due_date, children } = issueEntry;
        this.setState({
          // issueEntry,
          issueEntry: {
            estimated_duration: hoursToDuration(estimated_hours),
            progress: done_ratio,
            due_date: due_date || '',
            children: children ? children.length : 0
          },
          instance: new Date().getTime(),
          progress_info: done_ratio,
          wasModified: false
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

  getErrorMessage = (error) => {
    if (!error) return null;
    return error.message.replace(new RegExp(error.context.key, 'g'), error.path[0]);
  }

  render() {
    const { isUserAuthor, isOpen, isEditable, onClose, theme, issue, issueEntry: propsIssueEntry, progressWithStep1 } = this.props;
    const { issueEntry, wasModified, progress_info, instance } = this.state;
    const { progress, estimated_duration, due_date, children } = issueEntry;
    const validationErrors = issue.error && issue.error.isJoi
      ? {
        progress: issue.error.details.find(error => error.path[0] === 'progress'),
        estimated_duration: issue.error.details.find(error => error.path[0] === 'estimated_duration'),
        due_date: issue.error.details.find(error => error.path[0] === 'due_date'),
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
    return (
      <Modal
        open={!!isOpen}
        onClose={onClose}
        needConfirm={wasModified}
        center={true}
      >
        <Fragment>
          <Label htmlFor="assignee" label="Assignee">
            <div name="assignee">{propsIssueEntry.assigned_to.name}</div>
          </Label>
          <Label htmlFor="issue" label="Issue">
            <div name="issue">#{propsIssueEntry.id}&nbsp;{propsIssueEntry.subject}</div>
          </Label>
          <FlexRow>
            <DurationField>
              <Label htmlFor="estimated_duration" label="Estimation" rightOfLabel={DurationIcon}>
                <FlexRow>
                  <Input
                    type="text"
                    name="estimated_duration"
                    value={estimated_duration}
                    onBlur={() => this.runValidation(['estimated_duration'])}
                    disabled={!isEditable || !isUserAuthor}
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
                    isDisabled={!isEditable || !isUserAuthor}
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
                        step={progressWithStep1 ? 1 : 10}
                        defaultValue={progress}
                        disabled={!isEditable || !isUserAuthor}
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
    }).isRequired,
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
    }))
  }),
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isEditable: PropTypes.bool,
  issueGet: PropTypes.func.isRequired,
  updateIssueEntry: PropTypes.func.isRequired,
  validateBeforeUpdate: PropTypes.func.isRequired,
  resetValidation: PropTypes.func.isRequired,
  progressWithStep1: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  issue: state.issue,
  progressWithStep1: state.settings.progressWithStep1,
});

const mapDispatchToProps = dispatch => ({
  issueGet: (id) => dispatch(actions.issues.get(id)),
  updateIssueEntry: (issueEntry, changes) => dispatch(actions.issue.update(issueEntry, changes)),
  validateBeforeUpdate: (changes, checkFields) => dispatch(actions.issue.validateBeforeUpdate(changes, checkFields)),
  resetValidation: () => dispatch(actions.issue.reset())
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(IssueModal));
