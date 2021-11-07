import React from 'react';
import { css } from '@emotion/react';
import { ProcessIndicator } from './ProcessIndicator';

const styles = {
  wrapper: css`
    display: flex;
    height: 100%;
    width: 100%;
    justify-content: center;
  `,
  text: css`
    margin-left: 1rem;
  `
};

const LoadingOverlay = () => (
  <div css={styles.wrapper}>
    <ProcessIndicator size="4em">
      <h2 css={styles.text}>Initializing...</h2>
    </ProcessIndicator>
  </div>
);

export {
  LoadingOverlay
};
