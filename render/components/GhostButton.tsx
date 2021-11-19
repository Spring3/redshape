import React, { MouseEventHandler, ReactNode } from 'react';
import { useTheme } from 'styled-components';
import { css as emotionCss } from '@emotion/react';
import { theme as Theme } from '../theme';

type GhostButtonProps = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  id?: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const GhostButton = ({
  onClick, id, children, disabled, className, fullWidth
}: GhostButtonProps) => {
  const theme = useTheme() as typeof Theme;
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
      className={className}
    >
      {children}
    </button>
  );
};

export { GhostButton };
