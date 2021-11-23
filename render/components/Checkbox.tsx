import React, {
  ChangeEventHandler,
  FocusEventHandler,
  FocusEvent,
  useCallback,
  useRef,
  KeyboardEventHandler
} from 'react';
import { css } from '@emotion/react';
import { useTheme } from 'styled-components';
import CheckIcon from 'mdi-react/CheckIcon';
import { theme as Theme } from '../theme';

const styles = {
  container: css`
    display: inline-block;
    vertical-align: middle;
  `,
  hiddenCheckbox: css`
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
  `,
  fakeCheckbox: css`
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 3px;
    cursor: pointer;
  `,
  svg: css`
    position: relative;
    vertical-align: middle;
    bottom: 3px;
  `,
  label: css`
    margin-left: 0.5rem;
    cursor: pointer;
  `
};

type CheckboxProps = {
  checked?: boolean;
  className?: string;
  onChange?: ChangeEventHandler<HTMLElement>;
  onBlur?: FocusEventHandler<HTMLElement>;
  id?: string;
  name?: string;
  label: string;
  disabled?: boolean;
};

const Checkbox = ({
  checked,
  className,
  onChange,
  onBlur,
  id,
  name,
  label,
  disabled
}: CheckboxProps) => {
  const theme = useTheme() as typeof Theme;
  const hiddenCheckboxRef = useRef(null);

  const moveFocusToCustomCheckbox = useCallback((e: FocusEvent<HTMLElement>) => {
    (e.target.nextSibling as HTMLElement)?.focus();
  }, []);

  const toggleCheckbox: KeyboardEventHandler<HTMLDivElement> = useCallback((e) => {
    if (e.key === ' ' && onChange) {
      (hiddenCheckboxRef.current as HTMLInputElement | null)?.click();
    }
  }, [onChange]);

  return (
    <div
      tabIndex={0}
      role="checkbox"
      aria-checked={checked}
      onKeyPress={toggleCheckbox}
      onBlur={onBlur}
      onFocusCapture={moveFocusToCustomCheckbox}
      css={styles.container}
      className={className}
    >
      <input
        ref={hiddenCheckboxRef}
        css={[
          styles.hiddenCheckbox,
          css`
            &:not(:disabled):hover + div,
            &:focus + div {
              border-color: ${theme.main};
            }
          `
        ]}
        type="checkbox"
        onChange={onChange}
        checked={checked}
        tabIndex={-1}
        disabled={disabled}
        id={id}
        name={name}
      />
      <label>
        <div
          css={[
            styles.fakeCheckbox,
            css`
              transition: background ${theme.transitionTime};
              border: 2px solid ${theme.main};
            `,
            disabled
              ? css`
                  background: ${theme.bgDark};
                  border-color: lightgrey;
                `
              : css``,
            checked
              ? css`
                background: ${theme.main};
                border-color: ${theme.main};
              `
              : css`
                background: ${theme.bgDark};
                border-color: grey;
              `
          ]}
        >
          <CheckIcon
            css={[styles.svg, css`visibility: ${checked ? 'visible' : 'hidden'}`]}
            size="18"
            color="white"
          />
        </div>

        <span css={styles.label}>{label}</span>
      </label>
    </div>
  );
};

export { Checkbox };
