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

const StyledProcessIndicator = styled.div`
  display: flex;
  align-items: center;
`;

const Square = styled.div`
  background-color: ${(props) => props.theme.main};
  transform: rotate(0);
  animation: ${flipAnimation} 1s infinite;
`;

type ProcessIndicatorProps = {
  className?: string;
  size?: string;
  children: JSX.Element;
}

const ProcessIndicator = ({ className, size = '2em', children }: ProcessIndicatorProps) => (
  <StyledProcessIndicator className={className}>
    <Square style={{ width: size, height: size }} />
    {children}
  </StyledProcessIndicator>
);

const OverlayProcessIndicator = styled(ProcessIndicator)`
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

export {
  ProcessIndicator,
  OverlayProcessIndicator
};
