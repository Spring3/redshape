import { css } from '@emotion/react';
import React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-next-line
import CoffeeCup from '../../assets/coffee-cup.png';
import { Flex } from '../Flex';

const styles = {
  container: css`
    margin-top: 12rem;
    width: 100%;
  `,
  image: css`
    margin-right: 1.5rem;
  `,
  header: css`
    margin-bottom: 0;
  `
};

const IssuesTableEmptyState = () => (
  <Flex alignItems="center" css={styles.container} direction="column">
    <Flex>
      <img css={styles.image} src={CoffeeCup} alt="Coffee Cup" height={100} />
      <Flex direction="column">
        <h2 css={styles.header}>Well Done!</h2>
        <p>Looks like you don&apos;t have any more tasks. Time for a break?</p>
      </Flex>
    </Flex>
  </Flex>
);

export {
  IssuesTableEmptyState
};
