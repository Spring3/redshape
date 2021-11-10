import React, {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode
} from 'react';
import { css as emotionCss } from '@emotion/react';
import styled, { css, useTheme } from 'styled-components';
import CheckIcon from 'mdi-react/CheckIcon';
import { theme as Theme } from '../theme';

const StyledInput = styled.input`
  display: block;
  width: 100%;
  border-radius: 3px;
  padding: 5px 10px;
  box-sizing: border-box;
  font-size: 14px;
  min-height: 35px;
  outline: none;
  font-weight: bold;

  ${({ theme }) => css`
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
  `}}

  ${props => props.disabled
    && css`
      background: ${props.theme.bgDisabled};
      border-color: ${props.theme.bgDarker};
      color: ${props.theme.minorText};

      &:hover {
        border-color: ${props.theme.bgDarker};
      }
    `}
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const StyledCheckbox = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  transition: background ${props => props.theme.transitionTime};
  border: 2px solid transparent;
  border-radius: 3px;
  cursor: pointer;

  svg {
    position: relative;
    vertical-align: middle;
    bottom: 3px;
  }

  ${HiddenCheckbox}:not(:disabled):hover + &,
  ${HiddenCheckbox}:focus + & {
    box-shadow: 0px 0px 5px 1px ${props => props.theme.mainLight};
  }

  ${HiddenCheckbox}:disabled + & {
    background: ${props => props.theme.bgDark};
    border-color: lightgrey;
  }
`;

const CheckboxContainer = styled.div`
  display: inline-block;
  vertical-align: middle;

  & + span {
    margin-left: 10px;
    vertical-align: middle;
  }
`;

const FormGroup = styled.div`
  h4 {
    margin-bottom: 10px;
    color: ${props => props.theme.minorText};
  }
`;

type LabelProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
  inline?: boolean;
  rightToLeft?: boolean;
  rightOfLabel?: boolean;
};

const Label = ({
  label,
  htmlFor,
  children,
  className,
  inline = false,
  rightToLeft = false,
  rightOfLabel
}: LabelProps) => {
  const theme = useTheme() as typeof Theme;
  return (
    <FormGroup className={`form-group ${className}`}>
      {rightToLeft === true && children}
      {inline === false ? (
        <label
          css={emotionCss`
          color: ${theme.minorText} !important;
          font-weight: bold !important;
          margin-bottom: 0.25rem !important;
        `}
          htmlFor={htmlFor}
        >
          {label}
          {rightOfLabel}
        </label>
      ) : (
        <label css={emotionCss`color: ${theme.minorText}; margin-bottom: 0.25rem !important;`} htmlFor={htmlFor}>
          {label}
          {rightOfLabel}
        </label>
      )}
      {rightToLeft === false && children}
    </FormGroup>
  );
};

type InputProps = {
  maxWidth?: string;
  type?: 'email' | 'checkbox' | 'text' | 'number' | 'password';
  checked?: boolean;
  className?: string;
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
  checked,
  className,
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

  if (type === 'checkbox') {
    return (
      <CheckboxContainer className={className}>
        <HiddenCheckbox
          onChange={onChange}
          onBlur={onBlur}
          checked={checked}
          disabled={disabled}
          id={id}
          name={name}
        />
        <StyledCheckbox
          css={emotionCss`
          background: ${checked ? theme.main : theme.bgDark};
          border: 2px solid ${theme.minorText} !important;
          ${
            checked
              ? emotionCss`
          background: ${theme.main} !important;
          border-color: ${theme.main} !important;
        `
              : emotionCss`
        background: white !important;
        border-color: ${theme.main} !important;
        `
          }
        `}
        >
          <CheckIcon
            css={emotionCss`visibility: ${checked ? 'visible' : 'hidden'}`}
            size="18"
            color="white"
          />
        </StyledCheckbox>
      </CheckboxContainer>
    );
  }

  return (
    <StyledInput
      type={type}
      css={emotionCss`
        max-width: ${maxWidth};
      `}
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

export { Input, Label };
