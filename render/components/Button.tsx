import React, { MouseEventHandler, ReactNode, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { css } from '@emotion/react';
import { theme as Theme } from '../theme';

const styles = {
  button: (theme: typeof Theme) => css`
    border-radius: 3px;
    font-weight: bold;
    font-size: 14px;
    outline: none;
    text-align: center;
    background: ${theme.bg};
    transition: color ease ${theme.transitionTime};
    transition: background ease ${theme.transitionTime};
    padding: 0.4rem 0.6rem;
  `,
  block: css`
    width: '100%';
  `,
  enabled: ({ theme, palette }: { theme: typeof Theme, palette: Record<string, string> }) => css`
    border: 2px solid ${palette.light};
    color: ${palette.light};
    cursor: pointer;

    &:hover,
    &:focus {
      background: ${palette.light};
      color: ${theme.hoverText} !important;

      svg {
        fill: ${theme.hoverText};
      }
    }
    &:active {
      background: ${palette.dark};
    }
  `,
  disabled: (theme: typeof Theme) => css`
    border: 2px solid ${theme.minorText};
    background: ${theme.bg};
    color: ${theme.minorText};
    svg {
      fill: ${theme.minorText};
    }
  `,
};

type ButtonProps = {
  id?: string;
  children: ReactNode;
  type?: HTMLButtonElement['type'];
  disabled?: boolean;
  block?: boolean;
  onClick?: MouseEventHandler;
  className?: string;
  palette?: 'success' | 'warning' | 'danger' | 'default' | 'mute';
};

const Button = ({
  id,
  children,
  type = 'button',
  disabled = false,
  block = false,
  onClick,
  className,
  palette = 'default'
}: ButtonProps) => {
  const theme = useTheme() as typeof Theme;

  const getColorPalette = (colorPalette: ButtonProps['palette']): Record<string, string> => {
    switch (colorPalette) {
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
      case 'mute':
        return {
          light: '#222222',
          dark: '#000'
        };
      default:
        return {
          light: theme.main,
          dark: theme.mainDark
        };
    }
  };

  const colors = useMemo(() => getColorPalette(palette), [palette, theme]);

  return (
    <button
      id={id}
      css={[styles.button(theme), ...(block ? [styles.block] : []), ...(disabled ? [styles.disabled(theme)] : [styles.enabled({ theme, palette: colors })])]}
      onClick={onClick}
      // eslint-disable-next-line react/button-has-type
      type={type}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
};

export {
  Button
};
