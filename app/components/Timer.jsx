import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import styled, { withTheme } from 'styled-components';
import PlayIcon from 'mdi-react/PlayIcon';
import PauseIcon from 'mdi-react/PauseIcon';
import StopIcon from 'mdi-react/StopIcon';

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
    console.log('STOP', this.state);
    this.props.onStop(this.state.value);
    this.setState({
      isPaused: false,
      value: 0
    });
  }

  render() {
    const { value, isPaused } = this.state;
    const { isEnabled, text, theme } = this.props;
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
            <span>{text}</span>
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

export default withTheme(Timer);
