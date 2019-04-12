import React from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

const Wrapper = styled.div`
  background: ${props => props.theme.bgLight};
  position: relative;
  border-radius: 5px;
  height: ${props => props.height}px;
`;

const Progress = styled.div`
  border-radius: 5px;
  max-width: 100%;
  ${props => css`
    width: ${props.percent}% !important;
    height: ${props.height}px;
    background: ${props.background};
  `}
`;

const Progressbar = ({ percent, color, background, id, className, fontSize, height }) => (
  <Wrapper
    id={id}
    className={className}
    height={height}
  >
    <Progress
      percent={percent}
      background={background}
      height={height}
    >
    </Progress>
  </Wrapper>
);

Progressbar.propTypes = {
  percent: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  color: PropTypes.string.isRequired,
  background: PropTypes.string.isRequired,
  className: PropTypes.string,
  id: PropTypes.string,
  fontSize: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ])
};

Progressbar.defaultProps = {
  className: undefined,
  id: undefined,
  fontSize: 12,
  height: 10
};

export default Progressbar;
