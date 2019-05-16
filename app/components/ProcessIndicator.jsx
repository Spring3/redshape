import React from 'react';
import styled, { keyframes } from 'styled-components';

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
  background-color: ${props => props.theme.main};
  transform: rotate(0);
  animation: ${flipAnimation} 1s infinite;
`;

export default () => (
  <ProcessIndicator>
    <Square />
    <span>
      Please Wait...
    </span>
  </ProcessIndicator>
);
