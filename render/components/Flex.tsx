import React, { ReactNode } from 'react';
import { css } from '@emotion/react';

type FlexAlignment = 'center' | 'flex-start' | 'flex-end' | 'space-around' | 'space-between' | 'stretch';

type FlexProps = {
  id?: string;
  children?: ReactNode;
  className?: string;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: FlexAlignment;
  alignItems?: FlexAlignment;
  gap?: string;
  grow?: string;
};

const Flex = ({
  children, className, id, direction = 'row', justifyContent = 'flex-start', alignItems = 'flex-start', gap = 'initial', grow,
}: FlexProps) => (
  <div
    id={id}
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
