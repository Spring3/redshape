import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import PlayIcon from 'mdi-react/PlayIcon';
import PauseIcon from 'mdi-react/PauseIcon';
import StopIcon from 'mdi-react/StopIcon';

import actions from '../actions';

import { GhostButton } from './Button';

const ActiveTimer = styled.div`
  max-width: 100%;
  box-sizing: border-box;
  padding: 20px;
  position: fixed;
  bottom: 0;
  width: 100%;
  background: ${props => props.theme.bg};
  display: flex;
  align-items: center;
  box-shadow: 0px 0px 15px ${props => props.theme.bgLight};

  div.buttons {
    margin: 0 20px;
  }

  div.issueName,
  div.time {
    margin: 0 20px;
    font-size: 16px;
    font-weight: bold;
  }

  div.buttons {
    a {
      padding: 10px 0px;

      &:hover {
        background: ${props => props.theme.bgLight};
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

class Timer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.trackedDuration || props.initialValue
    };

    this.interval = props.isEnabled && !props.isPaused
     ? setInterval(this.tick, 1000)
     : undefined;
  }

  tick = () => {
    const { value } = this.state;
    this.setState({ value: value + 1000 });
  }

  cleanup = () => {
    const { isEnabled, isPaused } = this.props;
    if (isEnabled && !isPaused) {
      this.props.pauseTimer(this.state.value);
    }
    clearInterval(this.interval);
    window.removeEventListener('beforeunload', this.cleanup);
  }

  componentWillMount() {
    window.addEventListener('beforeunload', this.cleanup);
  }

  componentWillUnmount() {
    this.cleanup();
  }

  componentDidUpdate(oldProps) {
    const { isEnabled } = this.props;
    if (isEnabled !== oldProps.isEnabled) {
      clearInterval(this.interval);
      // if was disabled, but now is enabled
      if (isEnabled) {
        this.interval = setInterval(this.tick, 1000);
      }
      // otherwise, if was enabled, but now it's disabled, we don't do anything
      // because the interval was already cleared above
    }
  }

  onPause = () => {
    clearInterval(this.interval);
    this.props.pauseTimer(this.state.value);
  }

  onContinue = () => {
    this.props.continueTimer();
    this.interval = setInterval(this.tick, 1000);
  }

  onStop = () => {
    clearInterval(this.interval);
    const { value } = this.state;
    const { stopTimer, onStop } = this.props;
    stopTimer(value);
    if (onStop) {
      onStop(value);
    }
    this.setState({ value: 0 });
  }

  render() {
    const { value } = this.state;
    const { isEnabled, issueTitle, isPaused } = this.props;
    const timeString = moment.utc(value).format('HH:mm:ss');
    return isEnabled
      ? (
        <ActiveTimer>
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
            <span>{issueTitle}</span>
          </div>
          <div className="time">
            <span>{timeString}</span>
          </div>
        </ActiveTimer>
      )
      : null;
  }
}

Timer.propTypes = {
  isEnabled: PropTypes.bool,
  isPaused: PropTypes.bool,
  initialValue: PropTypes.number,
  issueTitle: PropTypes.string,
  trackedDuration: PropTypes.number,
  onStop: PropTypes.func.isRequired,
  pauseTimer: PropTypes.func.isRequired,
  continueTimer: PropTypes.func.isRequired,
  stopTimer: PropTypes.func.isRequired
};

Timer.defaultProps = {
  initialValue: 0,
  isEnabled: false,
  isPaused: false,
  text: ''
};

const mapStateToProps = state => ({
  isEnabled: state.tracking.isTracking,
  isPaused: state.tracking.isPaused,
  issueTitle: state.tracking.issue.subject,
  trackedDuration: state.tracking.duration
});

const mapDispatchToProps = dispatch => ({
  pauseTimer: value => dispatch(actions.tracking.trackingPause(value)),
  continueTimer: () => dispatch(actions.tracking.trackingContinue()),
  stopTimer: value => dispatch(actions.tracking.trackingStop(value))
});

export default connect(mapStateToProps, mapDispatchToProps)(Timer);
