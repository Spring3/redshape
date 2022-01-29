import React, {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
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
  maxWidth?: string;
  type?: 'email' | 'text' | 'number' | 'password';
  placeholder?: string;
  onChange?: ChangeEventHandler<HTMLElement>;
  onBlur?: FocusEventHandler<HTMLElement>;
  onFocus?: FocusEventHandler<HTMLElement>;
  onKeyUp?: KeyboardEventHandler<HTMLElement>;
  onClick?: MouseEventHandler<HTMLElement>;
  value?: string | number;
  id?: string;
  name?: string;
  disabled?: boolean;
};

const Input = ({
  maxWidth,
  type = 'text',
  placeholder,
  onChange,
  onBlur,
  onFocus,
  onKeyUp,
  onClick,
  value,
  id,
  name,
  disabled
}: InputProps) => {
  const theme = useTheme() as typeof Theme;

  const ensureNumber = (typedValue: string | number | undefined) => {
    if (typeof typedValue === 'string') {
      if (/,|./.test(typedValue)) {
        return parseFloat(typedValue.replace(',', '.'));
      }
      return parseInt(typedValue, 10);
    }

    if (Number.isNaN(typedValue) || !Number.isFinite(typedValue)) {
      return undefined;
    }
    return typedValue;
  };

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
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      onKeyUp={onKeyUp}
      onClick={onClick}
      disabled={disabled}
      value={type === 'number' ? ensureNumber(value) : value}
      id={id}
      name={name}
    />
  );
};

export { Input };
