import React, { Fragment, Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import PlayIcon from 'mdi-react/PlayIcon';
import PauseIcon from 'mdi-react/PauseIcon';
import StopIcon from 'mdi-react/StopIcon';

import actions from '../actions';

import { GhostButton } from './Button';
import { animationSlideUp } from '../animations';
import Link from './Link';

import { setupTimerIPC, sendTimerIPC } from '../ipc';

const ActiveTimer = styled.div`
  animation: ${animationSlideUp} .7s ease-in;
  max-width: 100%;
  box-sizing: border-box;
  padding: 20px;
  position: fixed;
  bottom: 0;
  width: 100%;
  background: ${props => props.theme.bg};
  display: ${props => props.isEnabled ? 'flex' : 'none'};
  align-items: center;
  box-shadow: 0px -2px 20px ${props => props.theme.bgDark};
  border-top: 2px solid ${props => props.theme.bgDark};

  div.buttons {
    margin: 0 20px;
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
        background: ${props => props.theme.bgDark};
      }
    }

    a:first-child {
      margin-right: 20px;
    }
  }

  div.time {
    color: ${props => props.theme.main};
  }
`;

const StyledButton = styled(GhostButton)`
  padding: 0px;
`;

const MaskedLink = styled(Link)`
  color: inherit;
  padding: 0;
  margin: 0 20px;
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
    };

    setupTimerIPC(this);

    const { isEnabled, isPaused, trackedIssue } = this.props;
    if (isEnabled){
      sendTimerIPC('timer-info', {isEnabled, isPaused, issue: trackedIssue})
    }

    this.interval = props.isEnabled && !props.isPaused
     ? setInterval(this.tick, 1000)
     : undefined;
  }
  /* stop time interval and store tracked time + current datetime */
  storeToTimestamp(){
    const { timestamp } = this.state;
    const { isEnabled, isPaused, trackedIssue } = this.props;
    if (isEnabled && !isPaused){
      this.setState({
        timestamp: {
          value: this.state.value,
          datetime: moment()
        }
      });
      this.stopInterval()
    }
    sendTimerIPC('timer-info', {isEnabled, isPaused, issue: trackedIssue})
  }
  /* restore time interval based on stored tracked time + diff datetimes */
  restoreFromTimestamp(enableInterval = true){
    const { timestamp } = this.state;
    const { isEnabled, isPaused } = this.props;
    if (timestamp && isEnabled && !isPaused){
      const { value, datetime } = timestamp;
      const newValue = moment().diff(datetime, 'ms') + value;
      this.setState({ timestamp: null, value: newValue });
      if (enableInterval) {
        this.interval = setInterval(this.tick, 1000);
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
  }

  cleanup = () => {
    const { isEnabled, isPaused } = this.props;
    if (isEnabled && !isPaused) {
      this.onPause();
    }
    this.stopInterval();
    window.removeEventListener('beforeunload', this.cleanup);
  }

  saveState = () => {
    const { isEnabled, isPaused } = this.props;
    if (isEnabled && !isPaused) {
      const { continueTimer } = this.props;
      continueTimer(this.state.value);
    }
    this.stopInterval();
  }

  componentWillMount() {
    window.addEventListener('beforeunload', this.cleanup);
  }

  componentWillUnmount() {
    this.saveState();
  }

  componentDidUpdate(oldProps) {
    const { isEnabled, isPaused, trackedIssue } = this.props;
    if (isEnabled !== oldProps.isEnabled) {
      this.stopInterval();
      // if was disabled, but now is enabled
      if (isEnabled) {
        this.interval = setInterval(this.tick, 1000);
        sendTimerIPC('timer-info', {isEnabled, isPaused, issue: trackedIssue });
      }
      // otherwise, if was enabled, but now it's disabled, we don't do anything
      // because the interval was already cleared above
    }
  }

  onPause = () => {
    this.stopInterval();
    const { onPause, trackedIssue, pauseTimer } = this.props;
    const { value } = this.state;
    pauseTimer(value);
    if (onPause) {
      onPause(value, trackedIssue)
    }
    sendTimerIPC('timer-info', {isEnabled: true, isPaused: true, issue: trackedIssue})
  }

  onContinue = () => {
    this.interval = setInterval(this.tick, 1000);
    const { onContinue, trackedIssue, continueTimer } = this.props;
    const { value } = this.state;
    continueTimer(value);
    if (onContinue) {
      onContinue(trackedIssue, value);
    }
    sendTimerIPC('timer-info', {isEnabled: true, isPaused: false, issue: trackedIssue})
  }

  onStop = () => {
    this.stopInterval();
    const { value } = this.state;
    const { onStop, trackedIssue, stopTimer } = this.props;
    stopTimer(value);
    if (onStop) {
      onStop(value, trackedIssue);
    }
    this.setState({ value: 0 });
    sendTimerIPC('timer-info', {isEnabled: false, issue: trackedIssue})
  }

  redirectToTrackedLink = (event) => {
    event.preventDefault();
    this.props.history.push(`/app/issue/${this.props.trackedIssue.id}`);
  }

  componentWillReceiveProps(newProps) {
    const { trackedTime } = newProps;
    this.setState({ value: trackedTime })
  }

  render() {
    const { value } = this.state;
    const { isEnabled, trackedIssue, isPaused } = this.props;
    const timeString = moment.utc(value).format('HH:mm:ss');
    return (
      <Fragment>
      <ActiveTimer isEnabled={isEnabled}>
        <div className="buttons">
          <StyledButton
            onClick={this.onStop}
          >
            <StopIcon size={35} />
          </StyledButton>
          { isPaused && (
              <StyledButton
                onClick={this.onContinue}
              >
                <PlayIcon size={35} />
              </StyledButton>
            )
          }
          { !isPaused && (
              <StyledButton
                onClick={this.onPause}
              >
                <PauseIcon size={35} />
              </StyledButton>
            )
          }
        </div>
        <div className="issueName">
          { (isEnabled ?
          <MaskedLink
            href='#'
            onClick={this.redirectToTrackedLink}
          >
            {trackedIssue.subject}
          </MaskedLink>
            : null)}
        </div>
        <div className="time">
          <span>{timeString}</span>
        </div>
      </ActiveTimer>
      </Fragment>
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
  onStop: PropTypes.func,
  onPause: PropTypes.func,
  onContinue: PropTypes.func,
  pauseTimer: PropTypes.func.isRequired,
  continueTimer: PropTypes.func.isRequired,
  stopTimer: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};

Timer.defaultProps = {
  initialValue: 0,
  isEnabled: false,
  isPaused: false,
  issueTitle: ''
};

const mapStateToProps = state => ({
  isEnabled: state.tracking.isEnabled,
  isPaused: state.tracking.isPaused,
  trackedTime: state.tracking.duration,
  trackedIssue: state.tracking.issue,
});

const mapDispatchToProps = dispatch => ({
  pauseTimer: value => dispatch(actions.tracking.trackingPause(value)),
  continueTimer: value => dispatch(actions.tracking.trackingContinue(value)),
  stopTimer: value => dispatch(actions.tracking.trackingStop(value))
});

export default connect(mapStateToProps, mapDispatchToProps)(Timer);
