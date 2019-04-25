import React, { Component } from 'react';
import moment from 'moment';
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
  display: ${props => props.isEnabled ? 'flex' : 'none'};
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
      value: props.trackedTime || props.initialValue || 0
    };

    this.interval = props.isEnabled && !props.isPaused
     ? setInterval(this.tick, 1000)
     : undefined;
  }

  tick = () => {
    const { value } = this.state;
    this.setState({ value: value + 1000 });
  }

  stopInterval = () => {
    clearInterval(this.interval);
    this.interval = undefined;
  }

  cleanup = () => {
    const { isEnabled, isPaused } = this.props;
    if (isEnabled && !isPaused) {
      this.props.onPause(this.state.value);
    }
    this.stopInterval();
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
      this.stopInterval();
      // if was disabled, but now is enabled
      if (isEnabled) {
        this.interval = setInterval(this.tick, 1000);
      }
      // otherwise, if was enabled, but now it's disabled, we don't do anything
      // because the interval was already cleared above
    }
  }

  onPause = () => {
    this.stopInterval();
    const { value } = this.state;
    this.props.onPause(value);
  }

  onContinue = () => { 
    this.interval = setInterval(this.tick, 1000);
    this.props.onContinue();
  }

  onStop = () => {
    this.stopInterval();
    const { value } = this.state;
    this.props.onStop(value);
    this.setState({ value: 0 });
  }

  render() {
    const { value } = this.state;
    const { isEnabled, issueTitle, isPaused } = this.props;
    const timeString = moment.utc(value).format('HH:mm:ss');
    return (
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
          <span>{issueTitle}</span>
        </div>
        <div className="time">
          <span>{timeString}</span>
        </div>
      </ActiveTimer>
    );
  }
}

Timer.propTypes = {
  isEnabled: PropTypes.bool,
  isPaused: PropTypes.bool,
  initialValue: PropTypes.number,
  issueTitle: PropTypes.string,
  trackedTime: PropTypes.number,
  onStop: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired
};

Timer.defaultProps = {
  initialValue: 0,
  isEnabled: false,
  isPaused: false,
  issueTitle: ''
};

export default Timer;
