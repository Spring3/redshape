import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

const TooltipText = styled.p`
  position: absolute;
  display: none;
  border-radius: 3px;
  width: auto;
  padding: 5px;
  background: ${props => props.theme.bg};
  color: ${props => props.theme.mainDark};
  text-align: center;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0px 2px 7px ${props => props.theme.minorText};
  z-index: 99;

  &::after {
    content: ' ';
    position: absolute;
    width: auto;    
    border: 2px solid black;
    border-width: 5px;
    border-color: ${props => props.theme.bg} transparent transparent transparent;
  }
  
  ${props => props.position === 'top' ? css`
    transform: translateX(-50%);
    // transform: translate(-50%, -50%);
    // top: calc(-250% + 5px);
    // top: -50px;
    bottom: 75%;
    left: 50%;
    
    &::after {
      top: 100%;
      left: 50%; 
      transform: translateX(-50%);
    }
  ` : css`
    left: 30px;
    transform: translateY(-50%);
    top: calc(-50% + 5px);
    
    &::after {
      top: calc(50% - 5px);
      left: -10px; 
      transform: rotate(90deg);
    }
  `}
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

const TooltipMultiline = styled.div`
  display: flex;
  flex-direction: column;
`

class Tooltip extends Component {
  render() {
    const { className, children, text, position } = this.props;
    const lines = text.split('\\n');
    return (
      <TooltipContainer
        className={className}
      >
        {children}
        <TooltipText position={position || 'top'} className="tooltip">{ lines.length > 1 ? (<TooltipMultiline>{ lines.map(el => (<span>{el}</span>))}</TooltipMultiline>) : text }</TooltipText>
      </TooltipContainer>
    );
  }
}

Tooltip.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  position: PropTypes.string,
};

Tooltip.defaultProps = {
  className: null
};

export default Tooltip;
