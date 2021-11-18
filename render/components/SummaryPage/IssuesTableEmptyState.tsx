import { css } from '@emotion/react';
import React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-next-line
import EmptyStateImg from '../../assets/empty-state.jpg';
import { Flex } from '../Flex';

const styles = {
  container: css`
    margin-top: 7%;
    width: 100%;
  `,
  image: css`
    position: relative;
    top: 5rem;
    left: 7rem;
    z-index: -1;
    border-radius: 50%;
  `,
  header: css`
    margin-bottom: 0;
  `
};

const IssuesTableEmptyState = () => (
  <Flex alignItems="center" css={styles.container} direction="column">
    <Flex alignItems="center">
      <img css={styles.image} src={EmptyStateImg} alt="A woman meditating in a lotus pose surrounded by plants" height={350} />
      <Flex direction="column">
        <h1 css={styles.header}>Well Done!</h1>
        <p>Looks like you don&apos;t have any more tasks. Time for a break?</p>
      </Flex>
    </Flex>
  </Flex>
);

export {
  IssuesTableEmptyState
};
