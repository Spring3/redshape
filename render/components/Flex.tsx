import React, { ReactNode } from 'react';
import { css } from '@emotion/react';

type FlexAlignment = 'center' | 'flex-start' | 'flex-end' | 'space-around' | 'space-between';

type FlexProps = {
  children?: ReactNode;
  className?: string;
  direction?: 'horizontal' | 'vertical';
  justifyContent?: FlexAlignment;
  alignItems?: FlexAlignment;
  gap?: string;
};

const styles = {
  flexbox: (props: Omit<FlexProps, 'children' | 'className'>) => css`
    display: flex;
    direction: ${props.direction};
    justifyContent: ${props.justifyContent};
    alignItems: ${props.alignItems};
    gap: ${props.gap};
  `
};

const Flex = ({
  children, className, direction = 'horizontal', justifyContent = 'flex-start', alignItems = 'flex-start', gap = 'auto'
}: FlexProps) => (
  <div
    className={className}
    css={styles.flexbox({
      direction, justifyContent, alignItems, gap
    })}
  >
    {children}
  </div>
);

export { Flex };
