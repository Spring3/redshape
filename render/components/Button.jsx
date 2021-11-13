import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled, { css, withTheme, useTheme } from 'styled-components';
import { css as emotionCss } from '@emotion/react';

const StyledButton = styled.button`
  border-radius: 3px;
  font-weight: bold;
  font-size: 14px;
  outline: none;
  text-align: center;

  ${props => css`
    background: ${props.theme.bg};
    transition: color ease ${props.theme.transitionTime};
    transition: background ease ${props.theme.transitionTime};
    width: ${props.block ? '100%' : 'auto'};
  `}

  ${props => {
    if (!props.disabled) {
      return css`
        border: 2px solid ${props.palette.light};
        color: ${props.palette.light};
        cursor: pointer;

        &:hover,
        &:focus {
          background: ${props.palette.light};
          color: ${props.theme.hoverText} !important;

          svg {
            fill: ${props.theme.hoverText};
          }
        }
        &:active {
          background: ${props.palette.dark};
        }
      `;
    }
    return css`
      border: 2px solid ${props.theme.minorText};
      background: ${props.theme.bg};
      color: ${props.theme.minorText};

      svg {
        fill: ${props.theme.minorText};
      }
    `;
  }}
`;

class Button extends Component {
  getColorPalette = () => {
    const { palette, theme } = this.props;
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
  };

  render() {
    const { id, children, type, disabled, block, onClick, theme, className } = this.props;
    return (
      <StyledButton
        id={id}
        palette={this.getColorPalette()}
        onClick={onClick}
        type={type}
        theme={theme}
        disabled={disabled}
        block={block}
        className={className}>
        {children}
      </StyledButton>
    );
  }
}

Button.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  theme: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit']),
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

const GhostButton = ({ onClick, id, children, disabled, className, fullWidth }) => {
  const theme = useTheme();
  return (
    <button
      type="button"
      css={emotionCss`
        background: transparent;
        transition: color ease ${theme.transitionTime};
        transition: background ease ${theme.transitionTime};
        width: ${fullWidth ? '100%' : 'auto'};
        border: none;
        cursor: ${disabled ? 'not-allowed' : 'pointer'};
        font-size: .85rem;
        color: ${theme.main};
      `}
      id={id}
      onClick={onClick}
      disabled={disabled}
      className={className}>
      {children}
    </button>
  );
};

export { GhostButton };

export default withTheme(Button);
