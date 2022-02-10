import React, { ChangeEventHandler, FocusEventHandler, forwardRef, KeyboardEventHandler } from 'react';
import { css } from '@emotion/react';
import { useTheme } from 'styled-components';
import { theme as Theme } from '../theme';

const styles = {
  textArea: (theme: typeof Theme) => css`
    font-size: 14px;
    resize: none;
    overflow: hidden;
    height: auto;
    font-family: inherit;
    width: 100%;
    line-height: 1.5rem;
    box-sizing: border-box;
    background: ${theme.bg};
    border: 1px solid ${theme.minorText};
    border-radius: 3px;

    &:hover {
      border: 1px solid ${theme.main};
    }

    &:active,
    &:focus {
      border: 1px solid ${theme.main};
      box-shadow: 0px 0px 0px 1px ${theme.main};
      outline: none;
    }
  `,
  disabled: (theme: typeof Theme) => css`
    background: ${theme.bgDisabled};
    border: 1px solid ${theme.bgDarker} !important;
    color: ${theme.minorText};

    &:hover {
      border: 1px solid ${theme.bgDarker} !important;
    }
  `
};

type TextAreaProps = {
  name?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  rows?: number;
  disabled?: boolean;
  id?: string;
  value?: string;
  className?: string;
  maxLength?: number;
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  name,
  onChange,
  onBlur,
  rows = 1,
  disabled = false,
  id,
  value,
  className,
  maxLength,
  onKeyDown
}: TextAreaProps, ref) => {
  const theme = useTheme() as typeof Theme;
  return (
    <textarea
      ref={ref}
      css={[
        styles.textArea(theme),
        disabled ? styles.disabled(theme) : ''
      ]}
      name={name}
      onChange={onChange}
      onBlur={onBlur}
      rows={rows}
      maxLength={maxLength}
      disabled={disabled}
      id={id}
      className={className}
      value={value}
      onKeyDown={onKeyDown}
    />
  );
});

export {
  TextArea
};
