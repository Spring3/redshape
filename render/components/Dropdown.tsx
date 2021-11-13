import React, {
  ReactNode,
  Children,
  useState,
  useCallback,
  MouseEvent,
  MouseEventHandler,
  useMemo
} from 'react';
import { css } from '@emotion/react';
import { useTheme } from 'styled-components';
import { theme as Theme } from '../theme';

type DropdownProps = {
  className?: string;
  children: ReactNode;
  getDropdownToggleElement: ({
    toggle,
    isOpen
  }: {
    toggle: MouseEventHandler<HTMLElement>;
    isOpen: boolean;
  }) => JSX.Element;
};

const Dropdown = ({ className, children, getDropdownToggleElement }: DropdownProps) => {
  const [isOpen, setOpen] = useState(false);
  const theme = useTheme() as typeof Theme;

  const toggle = useCallback((e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setOpen(isOpenNow => !isOpenNow);
  }, []);

  const toggleViaChild = useCallback((e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (e.target.children.length) {
      e.target.children[0].click();
    }
    setOpen(isOpenNow => !isOpenNow);
  }, []);

  const Toggle = useMemo(() => getDropdownToggleElement({ toggle, isOpen }), []);

  return (
    <div
      className={className}
      css={css`
        position: relative;
      `}>
      <div className="dropdown-header">{Toggle}</div>
      <div
        css={css`
          background: white;
          padding: 0.7rem 0rem;
          border: 1px solid ${theme.bgDarker};
          border-radius: 5px;
          display: ${isOpen ? 'flex' : 'none'};
          flex-direction: column;
          position: absolute;
          box-shadow: 0px 2px 5px ${theme.bgDarker};
          width: 100%;
          top: 2rem;
        `}>
        {Children.map(children, child => (
          <div
            css={css`
              padding: 0.5rem 0.2rem;
              background: transparent;
              border: none;

              &:hover {
                cursor: pointer;
                background: ${theme.bgDarker};
              }
            `}
            type="button"
            onClick={toggleViaChild}
            className="dropdown-list-item">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export { Dropdown };
