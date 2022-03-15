import React from 'react';
import { useTheme } from 'styled-components';
import { css } from '@emotion/react';

import { Tooltip } from './Tooltip';
import { Flex } from './Flex';
import { theme as Theme } from '../theme';

type ProgressbarProps = {
  percent?: number;
  className?: string;
}

const Progressbar = ({
  percent = 0, className
}: ProgressbarProps) => {
  const theme = useTheme() as typeof Theme;
  // eslint-disable-next-line
  const percentage = (isFinite(percent) && !isNaN(percent)) ? percent : 0;
  const percentageText = `${percentage.toFixed(0)}%`;

  return (
    <Flex
      direction="column"
      justifyContent='center'
      alignItems='center'
      className={className}
    >
      <Tooltip text={percentageText}>
        <div
          css={css`
            background: ${theme.bgDark};
            position: relative;
            border-radius: 5px;
            height: 5px;
          `}
        >
          <div
            css={css`
              border-radius: 5px;
              max-width: 100%;
              width: 0;
              transition: width ease ${theme.transitionTime};
              width: ${percent}% !important;
              height: 5px;
              background: ${theme.mainDark};
            `}
          />
        </div>
      </Tooltip>
    </Flex>
  );
};

export {
  Progressbar
};
