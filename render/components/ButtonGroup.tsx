import React, { ReactNode } from 'react';
import { css } from '@emotion/react';
import { useTheme } from 'styled-components';
import { theme as Theme } from '../theme';
import { Flex } from './Flex';

const styles = {
  buttonContainer: css`
    & > button:first-child {
      border-radius: 3px 0px 0px 3px;
      border-right: none;
    }
    & > button:not(:first-child) {
      border-radius: 0px;
      border-right: none;
      border-left: none;
    }
  `,
  label: (theme: typeof Theme) => css`
    display: flex;
    align-items: center;
    margin: 0;
    border-radius: 0px 3px 3px 0px;
    border: 2px solid ${theme.main};
    border-left: 2px solid ${theme.mainLight};
    padding: 0.4rem 0.6rem;
  `
};

type ButtonGroupProps = {
  children: ReactNode;
  text?: string;
}

export const ButtonGroup = ({ children, text }: ButtonGroupProps) => {
  const theme = useTheme() as typeof Theme;

  return (
    <Flex css={styles.buttonContainer} alignItems='stretch'>
      {children}
      {text && (<p css={styles.label(theme)}>{text}</p>)}
    </Flex>
  );
};
