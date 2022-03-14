import React, {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
  KeyboardEvent,
  MouseEventHandler,
  useCallback,
} from 'react';
import { css } from '@emotion/react';
import { useTheme } from 'styled-components';
import { theme as Theme } from '../theme';

const inputStyles = (theme: typeof Theme) => css`
  display: block;
  width: 100%;
  border-radius: 3px;
  padding: 5px 10px;
  box-sizing: border-box;
  font-size: 14px;
  min-height: 35px;
  outline: none;
  font-weight: bold;

  transition: background ${theme.transitionTime};
  border: 1px solid ${theme.minorText};
  color: ${theme.main};
  background: white;

  &:hover {
    border: 1px solid ${theme.main};
  }

  &:focus {
    border-color: ${theme.main};
    box-shadow: 0px 0px 0px 1px ${theme.main};
  }

  &::placeholder {
    color: ${theme.minorText};
    font-weight: 500;
  }

  &:disabled {
    background: ${theme.bgDisabled};
    border-color: ${theme.bgDarker};
    color: ${theme.minorText};

    &:hover {
      border-color: ${theme.bgDarker};
    }
  }
`;

type InputProps = {
  title?: string;
  maxWidth?: string;
  maxLength?: number;
  max?: string;
  min?: string;
  type?: 'email' | 'text' | 'number' | 'password';
  placeholder?: string;
  onChange?: ChangeEventHandler<HTMLElement>;
  onBlur?: FocusEventHandler<HTMLElement>;
  onFocus?: FocusEventHandler<HTMLElement>;
  onKeyUp?: KeyboardEventHandler<HTMLElement>;
  onClick?: MouseEventHandler<HTMLElement>;
  pattern?: string;
  value?: string | number;
  id?: string;
  name?: string;
  disabled?: boolean;
  editable?: boolean;
};

const Input = ({
  title,
  maxWidth,
  maxLength,
  max,
  min,
  type = 'text',
  pattern,
  placeholder,
  onChange,
  onBlur,
  onFocus,
  onKeyUp,
  onClick,
  value,
  id,
  name,
  disabled,
  editable,
}: InputProps) => {
  const theme = useTheme() as typeof Theme;

  const keyEvent = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if ((!e.ctrlKey || !e.metaKey) && !['c', 'v', 'a'].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  }, []);

  return (
    <input
      type={type}
      css={[
        inputStyles(theme),
        css`
          max-width: ${maxWidth};
        `
      ]}
      placeholder={placeholder}
      title={title}
      max={max}
      min={min}
      maxLength={maxLength}
      pattern={pattern}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      onKeyUp={editable ? onKeyUp : keyEvent}
      onKeyDown={editable ? undefined : keyEvent}
      onKeyPress={editable ? undefined : keyEvent}
      onClick={onClick}
      disabled={disabled}
      value={value}
      id={id}
      name={name}
    />
  );
};

export { Input };
