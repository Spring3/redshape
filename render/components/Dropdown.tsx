import React, {
  ReactNode,
  Children,
  useState,
  useCallback,
  MouseEvent,
  MouseEventHandler
} from 'react';
import { css } from '@emotion/react';
import { useTheme } from 'styled-components';
import { theme as Theme } from '../theme';

type DropdownProps = {
  className?: string;
  children: ReactNode;
  getDropdownToggleElement: ({ toggle, isOpen }: { toggle: MouseEventHandler<HTMLElement>, isOpen: boolean }) => JSX.Element;
};

const Dropdown = ({ className, children, getDropdownToggleElement }: DropdownProps) => {
  const [isOpen, setOpen] = useState(false);
  const theme = useTheme() as typeof Theme;

  const toggle = useCallback((e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setOpen(isOpenNow => !isOpenNow);
  }, []);

  return (
    <div
      className={className}
      css={css`
        position: relative;
      `}
    >
      <div className="dropdown-header">{getDropdownToggleElement({ toggle, isOpen })}</div>
      {isOpen ? (
        <div
          css={css`
            background: white;
            padding: 0.7rem 0rem;
            border: 1px solid ${theme.bgDarker};
            border-radius: 3px;
            display: flex;
            flex-direction: column;
            position: absolute;
            width: 100%;
            top: 2rem;
          `}
        >
          {Children.map(children, child => (
            <button
              css={css`
                padding: 0.5rem 0.2rem;
                background: transparent;
                border: none;

                &:hover {
                  background: ${theme.bgDarker};
                }
              `}
              type="button"
              onClick={toggle}
              className="dropdown-list-item"
            >
              {child}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export { Dropdown };
