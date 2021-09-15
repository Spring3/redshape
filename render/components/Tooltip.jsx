import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const TooltipText = styled.p`
  position: absolute;
  display: none;
  border-radius: 3px;
  top: -50px;
  left: 50%;
  width: auto;
  transform: translateX(-50%);
  padding: 5px;
  background: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.mainDark};
  text-align: center;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0px 2px 7px ${(props) => props.theme.minorText};

  &::after {
    content: ' ';
    position: absolute;
    top: 100%;
    left: 50%; 
    width: auto;    
    transform: translateX(-50%);
    border: 2px solid black;
    border-width: 5px;
    border-color: ${(props) => props.theme.bg} transparent transparent transparent;
  }
`;

const TooltipContainer = styled.div`
  display: inline-block;
  position: relative;

  &:hover {
    ${TooltipText} {
      display: block;
    }
  }
`;

const Tooltip = ({ className, children, text }) => (
  <TooltipContainer
    className={className}
  >
    {children}
    <TooltipText className="tooltip">{text}</TooltipText>
  </TooltipContainer>
);

Tooltip.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired
};

Tooltip.defaultProps = {
  className: null
};

export default Tooltip;
