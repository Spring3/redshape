import React from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Background = styled.div`
  background: ${props => props.theme.bgLight};
  position: relative;
  border-radius: 5px;
  height: ${props => props.height}px;
`;

const Progress = styled.div`
  border-radius: 5px;
  max-width: 100%;
  width: 0;
  ${props => css`
    transition: width ease ${props.transitionTime};
    width: ${props.percent}% !important;
    height: ${props.height}px;
    background: ${props.background};
  `}
`;

const Progressbar = ({ percent, background, id, className, height }) => {
  const percentage = (isFinite(percent) && !isNaN(percent)) ? percent : 0;
  return (
    <Wrapper
      id={id}
      className={className}
    >
      <Background
        height={height}
      >
        <Progress
          percent={percentage}
          background={background}
          height={height}
        />
      </Background>
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

export default Progressbar;
