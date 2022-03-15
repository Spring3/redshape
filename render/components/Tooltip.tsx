import React, { ReactNode } from 'react';
import { css } from '@emotion/react';
import { useTheme } from 'styled-components';

import { theme as Theme } from '../theme';

const styles = {
  container: css`
    display: inline-block;
    position: relative;

    &:hover {
      & > p {
        display: block;
      }
    }
  `,
  text: (theme: typeof Theme) => css`
    position: absolute;
    display: none;
    border-radius: 3px;
    top: -50px;
    left: 50%;
    width: auto;
    transform: translateX(-50%);
    padding: 5px;
    background: ${theme.bg};
    color: ${theme.mainDark};
    text-align: center;
    font-size: 12px;
    white-space: nowrap;

    &::after {
      content: ' ';
      position: absolute;
      top: 100%;
      left: 50%; 
      width: auto;    
      transform: translateX(-50%);
      border: 2px solid black;
      border-width: 5px;
      border-color: ${theme.bg} transparent transparent transparent;
    }
  `
};

type TooltipProps = {
  className?: string;
  children: ReactNode;
  text?: string;
};

const Tooltip = ({ className, children, text }: TooltipProps) => {
  const theme = useTheme() as typeof Theme;

  return (
    <div
      css={styles.container}
      className={className}
    >
      {children}
      <p css={styles.text(theme)} className="tooltip">{text}</p>
    </div>
  );
};

export {
  Tooltip
};
