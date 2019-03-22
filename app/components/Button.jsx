import React, { Component } from 'react';
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

const StyledLink = styled.a`
  outline: none;
  &:active,
  &:focus,
  &:visited {
    background: transparent;
  }

  svg {
    vertical-align: middle;
  }
`;


const Button = ({ id, children, type, disabled, block, onClick, className }) => (
  <StyledButton
    id={id}
    onClick={onClick}
    type={type}
    disabled={disabled} 
    block={block}
    className={className}
  >
    {children}
  </StyledButton>
);

Button.propTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'ghost']),
  disabled: PropTypes.bool,
  block: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string
};

Button.defaultProps = {
  id: undefined,
  type: 'button',
  disabled: false,
  block: false,
  onClick: undefined,
  className: undefined
};

class GhostButton extends Component {
  preventDefault = (e) => {
    e.preventDefault();
    e.persist();
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  }

  render() {
    const { id, children, disabled, className } = this.props;
    return (
      <StyledLink
        id={id}
        onClick={this.preventDefault}
        href="#"
        disabled={disabled}
        className={className}
      >
        {children}
      </StyledLink>
    );
  }
};

GhostButton.propTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string
};

GhostButton.defaultProps = {
  id: undefined,
  disabled: false,
  onClick: undefined,
  className: undefined
};

export {
  GhostButton
};

export default Button;
