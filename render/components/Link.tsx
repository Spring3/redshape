import React, { MouseEventHandler, ReactNode, MouseEvent } from 'react';
import { useTheme } from 'styled-components';
import { css } from '@emotion/react';

import { useOvermindEffects } from '../store';
import { theme as Theme } from '../theme';

type LinkProps = {
  className?: string;
  children: ReactNode;
  external?: boolean;
  href: string;
  onClick?: MouseEventHandler;
  testId?: string;
}

const Link = ({
  onClick, external = false, href, children, className, testId
}: LinkProps) => {
  const theme = useTheme() as typeof Theme;
  const effects = useOvermindEffects();

  const clickHandler = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (external) {
      return effects.mainProcess.system({
        payload: {
          url: href
        },
        action: 'open-url'
      });
    }

    if (onClick) {
      onClick(event);
    }
  };

  return (
    <a
      css={css`
        color: ${theme.main};
        font-size: 14px;
        padding: 2px;
        cursor: pointer;
        
        &:hover {
          background: ${theme.main};
          color: ${theme.hoverText};
        }
      `}
      className={className}
      href={href}
      rel="noopener noreferer"
      onClick={clickHandler}
      data-testid={testId}
    >
      {children}
    </a>
  );
};

export { Link };
