import React from 'react';
import { css } from '@emotion/react';

const styles = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 23px;
  z-index: 3;
  -webkit-app-region: drag
`;

const DragArea = () => (<div css={styles} />);

export {
  DragArea
};
