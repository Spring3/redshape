import React from 'react';
import styled, { withTheme, css } from 'styled-components';
import PropTypes from 'prop-types';

import Tooltip from './Tooltip';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Background = styled.div`
  background: ${(props) => props.theme.bgDark};
  position: relative;
  border-radius: 5px;
  height: ${(props) => props.height}px;
`;

export const Progress = styled.div`
  border-radius: 5px;
  max-width: 100%;
  width: 0;
  ${(props) => css`
    float: ${props.float || 'left'};
    transition: width ease ${props.transitionTime};
    width: ${props.percent}% !important;
    height: ${props.height}px;
    background: ${props.background};
  `}
`;

const Progressbar = ({
  percent, background, id, className, height, mode, theme
}) => {
  let percentage = (isFinite(percent) && !isNaN(percent)) ? percent : 0;
  let percentageOver;
  const percentageText = `${percentage.toFixed(0)}%`;
  if (mode === 'progress-gradient') {
    const colors = ['red', 'yellow-red', 'yellow', 'yellow-green', 'green'];
    const ranges = [20, 40, 60, 80, 100];
    const colorIdx = ranges.findIndex((el) => el >= percentage);
    const color = colors[colorIdx] || 'green';
    background = theme[color];
  } else if (mode === 'time-tracking') {
    background = theme.green;
    if (percentage >= 75.0) {
      background = theme['yellow-green'];
    }
    if (percentage >= 100.0) {
      percentageOver = percentage - 100;
      percentageOver = (percentageOver / percentage) * 100;
      percentage = (100 / percentage) * 100;
    }
  }

  return (
    <Wrapper
      id={id}
      className={className}
    >
      <Tooltip text={percentageText}>
        <Background
          height={height}
        >
          <Progress
            percent={percentage}
            background={background}
            height={height}
          />
          {
          percentageOver > 0 && (
            <Progress
              float="right"
              percent={percentageOver}
              background={theme.red}
              height={height}
            />
          )
        }
        </Background>
      </Tooltip>
    </Wrapper>
  );
};

Progressbar.propTypes = {
  percent: PropTypes.number.isRequired,
  background: PropTypes.string.isRequired,
  className: PropTypes.string,
  id: PropTypes.string,
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  mode: PropTypes.string
};

Progressbar.defaultProps = {
  className: undefined,
  id: undefined,
  height: 5,
  mode: 'default'
};

export default withTheme(Progressbar);
