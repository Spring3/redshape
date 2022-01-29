import React from 'react';
import { css } from '@emotion/react';

import { Link } from './Link';

const Copyrights = () => (
  <p css={css`color: #FF7079`}>
    Created by&nbsp;
    <Link
      external
      href="https://www.dvasylenko.com/redshape"
      testId="copyrights-link"
    >
      danv
    </Link>
  </p>
);

export {
  Copyrights
};
