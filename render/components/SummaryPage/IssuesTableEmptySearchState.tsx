import { css } from '@emotion/react';
import React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-next-line
import EmptySearchStateImage from '../../assets/empty-search-state.png';
import { Flex } from '../Flex';

const styles = {
  container: css`
    margin-top: 7%;
    width: 100%;
  `,
  image: css`
    position: relative;
    top: 2rem;
    left: 2rem;
    z-index: -1;
    border-radius: 50%;
  `,
  header: css`
    margin-bottom: 0;
  `
};

const IssuesTableEmptySearchState = () => (
  <Flex alignItems="center" css={styles.container} direction="column">
    <Flex
      css={css`
      background: #FDF3EC;
      border-radius: 50%;
      z-index: -1;
      height: 500px;
    `}
      alignItems="center"
    >
      <img css={styles.image} src={EmptySearchStateImage} alt="Abstract painted plants" height={350} />
      <Flex direction="column">
        <h1 css={styles.header}>Not found!</h1>
        <p>There are no tasks matching your search query.</p>
      </Flex>
    </Flex>
  </Flex>
);

export {
  IssuesTableEmptySearchState
};
