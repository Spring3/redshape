import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled, { css, withTheme } from 'styled-components';

const StyledButton = styled.button`
  border-radius: 3px;
  font-weight: bold;
  font-size: 14px;
  outline: none;

  ${props => css`
    border: 2px solid ${props.palette.light};    
    color: ${props.palette.light};
    transition: color ease ${props.theme.transitionTime};
    transition: background ease ${props.theme.transitionTime};
    width: ${props.block ? '100%' : 'auto'};

    &:hover,
    &:focus {
      cursor: pointer;
      background: ${props.palette.light}; 
      color: ${props.theme.hoverText};
    }
    &:active {
      background: ${props.palette.dark};
    }
  `}

`;

const StyledLink = styled.a`
  text-decoration: none;
  color: ${props => props.theme.mainLight};
  transition: color ease ${props => props.theme.transitionTime};

  &:hover {
    color: ${props => props.theme.main};
  }

  &:active,
  &:focus,
  &:visited {
    background: transparent;
  }
`;


const getColorPalette = (palette, theme) => {
  switch (palette) {
    case 'success':
      return {
        light: theme.green,
        dark: theme.darkGreen
      };
    case 'warning':
      return {
        light: theme.yellow,
        dark: theme.darkYellow
      };
    case 'danger':
      return {
        light: theme.red,
        dark: theme.darkRed
      };
    default:
      return {
        light: theme.main,
        dark: theme.mainDark
      };
  }
}


const Button = ({ theme, id, children, type, disabled, block, onClick, className, palette }) => {
  return (
    <StyledButton
      id={id}
      palette={getColorPalette(palette, theme)}
      onClick={onClick}
      type={type}
      disabled={disabled} 
      block={block}
      className={className}
    >
      {children}
    </StyledButton>
  );
};

Button.propTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  theme: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit' ]),
  disabled: PropTypes.bool,
  block: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  palette: PropTypes.oneOf(['success', 'warning', 'danger'])
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
    const { id, children, disabled, className, tabIndex } = this.props;
    return (
      <StyledLink
        id={id}
        onClick={this.preventDefault}
        href="#"
        disabled={disabled}
        className={className}
        tabIndex={tabIndex}
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
  className: PropTypes.string,
  tabIndex: PropTypes.number
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

export default withTheme(Button);
