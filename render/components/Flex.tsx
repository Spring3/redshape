import React, { ReactNode } from 'react';
import { css } from '@emotion/react';

type FlexAlignment = 'center' | 'flex-start' | 'flex-end' | 'space-around' | 'space-between';

type FlexProps = {
  children?: ReactNode;
  className?: string;
  direction?: 'row' | 'column';
  justifyContent?: FlexAlignment;
  alignItems?: FlexAlignment;
  gap?: string;
  grow?: string;
};

const Flex = ({
  children, className, direction = 'row', justifyContent = 'flex-start', alignItems = 'flex-start', gap = 'auto', grow,
}: FlexProps) => (
  <div
    className={className}
    css={css`
      display: flex;
      flex-direction: ${direction};
      justify-content: ${justifyContent};
      align-items: ${alignItems};
      gap: ${gap};
      flex-grow: ${grow};
    `}
  >
    {children}
  </div>
);

export { Flex };
