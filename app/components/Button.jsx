import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

const StyledButton = styled.button`
  padding: 10px 5px;
  border-radius: 5px;
  border: 2px solid transparent;
  box-shadow: 0px 0px 0px 2px #FF7079;
  color: #FF7079;
  font-weight: bold;
  font-size: 14px;
  outline: none;

  ${props => css`
    width: ${props.block ? '100%' : 'auto'};
    margin: 25px auto 0px auto;
  `}

  &:hover,
  &:focus {
    cursor: pointer;
    background: #FF7079;
    border: 2px solid #FF7079;
    box-shadow: 0px 0px 0px 2px #EF6069;
    color: white;
  }

  &:active {
    background: #EF6069;
  }
`;

const Button = ({ children, type, disabled, block, onClick }) => (
  <StyledButton
    onClick={onClick}
    type={type}
    disabled={disabled}
    block={block}
  >
    {children}
  </StyledButton>
);

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit']),
  disabled: PropTypes.bool,
  block: PropTypes.bool,
  onClick: PropTypes.func
};

Button.defaultProps = {
  type: 'button',
  disabled: false,
  block: false,
  onClick: undefined
};

export default Button;
