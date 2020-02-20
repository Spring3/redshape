import React from 'react';
import styled, { keyframes } from 'styled-components';
import PropTypes from 'prop-types';

const flipAnimation = keyframes`
  50% {
    transform: rotateY(180deg);
  }
  100% {
    transform: rotateY(180deg) rotateX(180deg);
  }
`;

const ProcessIndicator = styled.div`
  display: flex;
  align-items: center;

  span {
    white-space: nowrap;
    padding-left: 20px;
    vertical-align: middle;
  }
`;

const Square = styled.div`
  width: 2em;
  height: 2em;
  background-color: ${(props) => props.theme.main};
  transform: rotate(0);
  animation: ${flipAnimation} 1s infinite;
`;

const ProcessIndicatorComponent = ({ className }) => (
  <ProcessIndicator className={className}>
    <Square />
    <span>
      Please Wait...
    </span>
  </ProcessIndicator>
);

ProcessIndicatorComponent.propTypes = {
  className: PropTypes.string
};

ProcessIndicatorComponent.defaultProps = {
  className: null
};

export const OverlayProcessIndicator = styled(ProcessIndicatorComponent)`
  justify-content: center;
  position: absolute;
  top: 45%;
  left: 45%;
  z-index: 5;
  background: ${(props) => props.theme.bg};
  box-shadow: 0px 0px 10px ${(props) => props.theme.shadow};
  padding: 20px;
  border-radius: 3px;
`;

export default ProcessIndicatorComponent;
