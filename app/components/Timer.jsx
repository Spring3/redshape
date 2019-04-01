import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import PlayIcon from 'mdi-react/PlayIcon';
import PauseIcon from 'mdi-react/PauseIcon';
import StopIcon from 'mdi-react/StopIcon';

import Button from './Button';

const ActiveTimer = styled.div`
  display: block;
  background: sandybrown;
`;

class Timer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.initialValue,
      isPaused: props.isPaused
    };
  }

  componentWillMount() {
    this.interval = setInterval(() => {
      const { isEnabled } = this.props;
      const { value, isPaused } = this.state;
      if (!isPaused && isEnabled) {
        this.setState({ value: value + 1000 });
      }
    }, 1000);
  }

  componentWillUnmount() {
    const { isEnabled } = this.state;
    const { onPause } = this.props;
    if (isEnabled) {
      this.setState({
        isPaused: true
      });
      onPause();
    }
    clearInterval(this.interval);
  }

  onPause = () => {
    this.setState({
      isPaused: true
    });
    this.props.onPause(this.state.value);
  }

  onContinue = () => {
    this.setState({
      isPaused: false
    });
    this.props.onContinue();
  }

  onStop = () => {
    this.props.onStop(this.state.value);
    this.setState({
      isPaused: false,
      value: 0
    });
  }

  render() {
    const { value } = this.state;
    const { isEnabled, text } = this.props;
    const timeString = moment.utc(value).format('HH:mm:ss');
    return isEnabled
      ? (
        <ActiveTimer>
          <span>{text}</span>
          <span>{timeString}</span>
          <div>
            <Button
              onClick={this.onPause}
            >
              <PauseIcon />
            </Button>
            <Button
              onClick={this.onStop}
            >
              <StopIcon />
            </Button>
            <Button
              onClick={this.onContinue}
            >
              <PlayIcon />
            </Button>
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
  text: PropTypes.string,
  onStop: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired
};

Timer.defaultProps = {
  initialValue: 0,
  isEnabled: false,
  isPaused: false,
  text: ''
};

export default Timer;
