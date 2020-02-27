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
  percent, background, id, className, height
}) => {
  // eslint-disable-next-line
  const percentage = (isFinite(percent) && !isNaN(percent)) ? percent : 0;
  const percentageText = `${percentage.toFixed(0)}%`;

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
  ])
};

Progressbar.defaultProps = {
  className: undefined,
  id: undefined,
  height: 5
};

export default withTheme(Progressbar);
