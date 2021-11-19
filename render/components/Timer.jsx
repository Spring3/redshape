import React, { Component } from 'react';
// eslint-disable-next-line
import { remote, ipcRenderer } from 'electron';
import moment from 'moment';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import PlayIcon from 'mdi-react/PlayIcon';
import PauseIcon from 'mdi-react/PauseIcon';
import StopIcon from 'mdi-react/StopIcon';
import Rewind5Icon from 'mdi-react/Rewind5Icon';
import FastForward5Icon from 'mdi-react/FastForward5Icon';
import { Input } from './Input';
import Rewind1Icon from './icons/Rewind1Icon';
import FastForward1Icon from './icons/FastForward1Icon';

import actions from '../actions';

import { GhostButton } from './GhostButton';
import { animationSlideUp } from '../animations';
import Link from './Link';

const { powerMonitor } = remote.require('electron');

const ActiveTimer = styled.div`
  animation: ${animationSlideUp} .7s ease-in;
  max-width: 100%;
  box-sizing: border-box;
  padding: 20px;
  position: fixed;
  bottom: 0;
  width: 100%;
  background: ${(props) => props.theme.bg};
  display: ${(props) => (props.isEnabled ? 'flex' : 'none')};
  align-items: center;
  box-shadow: 0px -2px 20px ${(props) => props.theme.bgDark};
  border-top: 2px solid ${(props) => props.theme.bgDark};
  
  div.panel {
    flex-grow: 0;
    min-width: 520px;
    display: flex;
    align-items: center;
    max-width: ${(props) => (props.advancedTimerControls ? '900px' : '1800px')};
  }
  
  div.buttons {
    margin: 0 20px;
    display: flex;
  }
  
  div.time {
    margin: 0 20px;
    font-size: 16px;
    font-weight: bold;
  }

  div.buttons {
    a {
      padding: 10px 0px;

      &:hover {
        background: ${(props) => props.theme.bgDark};
      }
    }

    a:first-child {
      margin-right: 20px;
    }
  }
  
  div.buttons.buttons-advanced {
    a {
      margin-right: 5px;
    }
    a:last-child {
      margin-right: initial;
    }
  }
  
  div.issueName {
    padding: 0 20px;
    max-width: 500px;
  }

  div.time {
    color: ${(props) => props.theme.main};
  }
  
  input[name="comment"] {
    flex-grow: 2;
    margin-left: 20px;
    width: initial;
    border: none;
    border-radius: 0;
    border-bottom: 1px ${(props) => props.theme.bgDark} solid;
    color: #A4A4A4;
    &:focus {
      border: none;
      border-radius: 0;
      border-bottom: 1px ${(props) => props.theme.main} solid;
      box-shadow: none;
    }
  }
  
`;

const StyledButton = styled(GhostButton)`
  padding: 0px;
`;

const MaskedLink = styled(Link)`
  color: inherit;
  padding: 0;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
`;

class Timer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.trackedTime || props.initialValue || 0,
      timestamp: null, // used only when store/restore to/from timestamp (window hidden)
      comments: props.trackedComments || '',
    };

    this.interval = null;
    this.idleCheckInterval = null;
    this.warningTimeout = null;
  }

  // eslint-disable-next-line
  UNSAFE_componentWillMount() {
    window.addEventListener('beforeunload', this.cleanup);
  }

  componentDidMount() {
    ipcRenderer.on('timer', this.timerEventHandler);
    ipcRenderer.on('tray-action', this.trayActionHandler);
    ipcRenderer.on('window', this.windowEventHandler);

    const { isEnabled, isPaused, trackedIssue } = this.props;

    if (isEnabled) {
      ipcRenderer.send('timer-info', { isEnabled, isPaused, issue: trackedIssue });
    }

    if (isEnabled && !isPaused) {
      this.startTimer();
      this.setIntervalIdle();
    }
  }

  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(newProps) {
    const {
      trackedTime,
      trackedComments,
      isEnabled,
      isPaused
    } = newProps;
    this.setState({ value: trackedTime, comments: trackedComments });
    if (isEnabled && !isPaused) {
      this.onContinue();
    }
  }

  componentWillUnmount() {
    this.cleanup();
  }

  timerEventHandler = (ev, { action, mainWindowHidden }) => {
    if (mainWindowHidden) {
      this.restoreFromTimestamp(false);
    }
    if (action === 'resume') {
      this.onContinue();
    } else if (action === 'pause') {
      this.onPause();
    }
    if (mainWindowHidden) {
      this.storeToTimestamp();
    }
  }

  trayActionHandler = (data) => {
    if (data.action === 'continue') {
      this.onContinue();
    } else if (data.action === 'pause') {
      this.onPause();
    }
  };

  windowEventHandler = (event, { action }) => {
    switch (action) {
      case 'show':
        this.restoreFromTimestamp();
        break;
      case 'hide':
        this.storeToTimestamp();
        break;
      case 'quit':
        this.restoreFromTimestamp(false);
        break;
      default:
        break;
    }
  }

  pauseByIdle = (idleTime) => {
    const { discardIdleTime } = this.props;
    let discardedMessage = '';
    if (discardIdleTime) {
      const { value } = this.state;
      const min = 0;
      const nvalue = value - idleTime;
      if (nvalue > min) {
        this.setState({ value: nvalue });
      }
      discardedMessage = '(discarded from timer)';
    }
    const idleTimeMinutes = (idleTime / 60000).toFixed(2);
    ipcRenderer.send('notify', {
      message: `Timer is paused because the system was idle for ${idleTimeMinutes} minutes ${discardedMessage}`,
      critical: true,
      keep: true
    });
    this.onPause();
  }

  startTimer = () => {
    if (!this.interval) {
      this.interval = setInterval(this.tick, 1000);
    }
  }

  setIntervalIdle = () => {
    const { idleBehavior } = this.props;
    if (!idleBehavior) {
      return;
    }
    const checkTime = 60; // every minute
    const warnTime = 15; // at least for 15 s.
    const maxIdleTime = idleBehavior * 60;
    this.idleCheckInterval = setInterval(() => {
      if (this.warningTimeout) { return; }
      const idle = powerMonitor.getSystemIdleTime();
      if (idle >= maxIdleTime) {
        ipcRenderer.send('notify', {
          message: `Timer will be paused if system continues idle for another ${warnTime} seconds.`,
          critical: true
        });
        this.warningTimeout = setTimeout(() => {
          const idleTime = powerMonitor.getSystemIdleTime();
          if (idleTime >= maxIdleTime) {
            this.pauseByIdle(Number(idleTime.toFixed(0)) * 1000);
          }
          clearTimeout(this.warningTimeout);
          this.warningTimeout = null;
        }, warnTime * 1000);
      }
    }, checkTime * 1000);
  }

  /* stop time interval and store tracked time + current datetime */
  storeToTimestamp = () => {
    const { isEnabled, isPaused, trackedIssue } = this.props;
    const { value } = this.state;
    if (isEnabled && !isPaused) {
      this.setState({
        timestamp: {
          value,
          datetime: moment()
        }
      });
      this.stopInterval();
    }
    ipcRenderer.send('timer-info', { isEnabled, isPaused, issue: trackedIssue });
  }

  /* restore time interval based on stored tracked time + diff datetimes */
  restoreFromTimestamp = (enableInterval = true) => {
    const { timestamp } = this.state;
    const { isEnabled, isPaused } = this.props;
    if (timestamp && isEnabled && !isPaused) {
      const { value, datetime } = timestamp;
      const newValue = moment().diff(datetime, 'ms') + value;
      this.setState({ timestamp: null, value: newValue });
      if (enableInterval) {
        this.startTimer();
      }
    }
  }

  tick = () => {
    const { value } = this.state;
    this.setState({ value: value + 1000 });
  }

  stopInterval = () => {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
      this.idleCheckInterval = undefined;
    }
    if (this.warningTimeout) {
      clearTimeout((this.warningTimeout));
      this.warningTimeout = undefined;
    }
  }

  cleanup = () => {
    const { isEnabled, isPaused, saveTimer } = this.props;
    const { value, comments } = this.state;
    if (isEnabled) {
      if (!isPaused) {
        this.onPause();
      } else {
        saveTimer(value, comments);
      }
    }
    this.stopInterval();
    ipcRenderer.removeListener('timer', this.timerEventHandler);
    ipcRenderer.removeListener('tray-action', this.trayActionHandler);
    ipcRenderer.removeListener('window', this.windowEventHandler);
    window.removeEventListener('beforeunload', this.cleanup);
  }

  onPause = () => {
    this.stopInterval();
    const { trackedIssue, pauseTimer, onPause } = this.props;
    const { value, comments } = this.state;
    pauseTimer(value, comments);
    if (onPause) {
      onPause(trackedIssue, value, comments);
    }
    ipcRenderer.send('timer-info', { isEnabled: true, isPaused: true, issue: trackedIssue });
  }

  onContinue = () => {
    this.startTimer();
    this.setIntervalIdle();
    const { onContinue, trackedIssue, continueTimer } = this.props;
    const { value, comments } = this.state;
    continueTimer(value, comments);
    if (onContinue) {
      onContinue(trackedIssue, value, comments);
    }
    ipcRenderer.send('timer-info', { isEnabled: true, isPaused: false, issue: trackedIssue });
  }

  onStop = () => {
    this.stopInterval();
    const { value, comments } = this.state;
    const { onStop, trackedIssue, stopTimer } = this.props;
    stopTimer(value, comments);
    if (onStop) {
      onStop(trackedIssue, value, comments);
    }
    this.setState({ value: 0, comments: '' });
    ipcRenderer.send('timer-info', { isEnabled: false, issue: trackedIssue });
  }

  onBackward = (minutes) => {
    const { value } = this.state;
    const min = 0;
    const nvalue = value - (minutes * 60 * 1000);
    this.setState({ value: nvalue < min ? 0 : nvalue });
  }

  onForward = (minutes) => {
    const { value } = this.state;
    const max = 24 * 3600 * 1000;
    const nvalue = value + (minutes * 60 * 1000);
    if (nvalue < max) {
      this.setState({ value: nvalue });
    }
  }

  redirectToTrackedLink = (event) => {
    event.preventDefault();
    const { history, trackedIssue } = this.props;
    history.push(`/app/issue/${trackedIssue.id}`);
  }

  onCommentsChange = (ev) => {
    this.setState({ comments: ev.target.value });
  }

  render() {
    const { value, comments } = this.state;
    const {
      isEnabled, trackedIssue, isPaused, advancedTimerControls, saveTimer
    } = this.props;
    const timeString = moment.utc(value).format('HH:mm:ss');
    return (
      <>
        <ActiveTimer isEnabled={isEnabled}>
          <div className="panel">
            <div className="buttons">
              <StyledButton
                id="stop-timer"
                onClick={this.onStop}
              >
                <StopIcon size={35} />
              </StyledButton>
              { isPaused
                ? (
                  <StyledButton
                    id="continue-timer"
                    onClick={this.onContinue}
                  >
                    <PlayIcon size={35} />
                  </StyledButton>
                )
                : (
                  <StyledButton
                    id="pause-timer"
                    onClick={this.onPause}
                  >
                    <PauseIcon size={35} />
                  </StyledButton>
                )}
            </div>
            <div className="issueName">
              { isEnabled
                ? (
                  <MaskedLink
                    href="#"
                    onClick={this.redirectToTrackedLink}
                  >
                    {trackedIssue.subject}
                  </MaskedLink>
                )
                : null}
            </div>
            <div className="time">
              <span>{timeString}</span>
            </div>
            { advancedTimerControls && (
              <div className="buttons buttons-advanced">
                <StyledButton
                  onClick={() => this.onBackward(5)}
                >
                  <Rewind5Icon size={25} />
                </StyledButton>
                <StyledButton
                  onClick={() => this.onBackward(1)}
                >
                  <Rewind1Icon size={25} />
                </StyledButton>
                <StyledButton
                  onClick={() => this.onForward(1)}
                >
                  <FastForward1Icon size={25} />
                </StyledButton>
                <StyledButton
                  onClick={() => this.onForward(5)}
                >
                  <FastForward5Icon size={25} />
                </StyledButton>
              </div>
            )}
          </div>
          { advancedTimerControls && isEnabled && (
            <Input
              type="text"
              name="comment"
              value={comments}
              placeholder="Leave your WIP comment here"
              onChange={this.onCommentsChange}
              onBlur={() => {
                saveTimer(value, comments);
              }}
              maxLength={255}
            />
          )}
        </ActiveTimer>
      </>
    );
  }
}

Timer.propTypes = {
  isEnabled: PropTypes.bool,
  isPaused: PropTypes.bool,
  initialValue: PropTypes.number,
  trackedIssue: PropTypes.shape({
    id: PropTypes.number.isRequired,
    subject: PropTypes.string.isRequired,
    author: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    project: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    activity: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  trackedTime: PropTypes.number,
  trackedComments: PropTypes.string,
  onStop: PropTypes.func,
  onPause: PropTypes.func,
  onContinue: PropTypes.func,
  pauseTimer: PropTypes.func.isRequired,
  continueTimer: PropTypes.func.isRequired,
  stopTimer: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  idleBehavior: PropTypes.number.isRequired,
  discardIdleTime: PropTypes.bool.isRequired,
  advancedTimerControls: PropTypes.bool.isRequired,
  saveTimer: PropTypes.func.isRequired
};

Timer.defaultProps = {
  initialValue: 0,
  isEnabled: false,
  isPaused: false
};

const mapStateToProps = (state) => ({
  isEnabled: state.tracking.isEnabled,
  isPaused: state.tracking.isPaused,
  trackedTime: state.tracking.duration,
  trackedIssue: state.tracking.issue,
  trackedComments: state.tracking.comments,
  idleBehavior: state.settings.idleBehavior,
  discardIdleTime: state.settings.discardIdleTime,
  advancedTimerControls: state.settings.advancedTimerControls,
});

const mapDispatchToProps = (dispatch) => ({
  pauseTimer: (duration, comments) => dispatch(actions.tracking.trackingPause(duration, comments)),
  continueTimer: (duration, comments) => dispatch(actions.tracking.trackingContinue(duration, comments)),
  stopTimer: (duration, comments) => dispatch(actions.tracking.trackingStop(duration, comments)),
  saveTimer: (duration, comments) => dispatch(actions.tracking.trackingSave(duration, comments))
});

export default connect(mapStateToProps, mapDispatchToProps)(Timer);
