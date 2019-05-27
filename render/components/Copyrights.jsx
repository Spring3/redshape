import React from 'react';
import styled from 'styled-components';

import Link from './Link';

const Copyrights = styled.p`
  color: #FF7079;
`;

export default () => (
  <Copyrights>
    Created by&nbsp;
    <Link
      type="external"
      href="https://spring3.github.io/website/"
    >
      Daniyil Vasylenko
    </Link>
  </Copyrights>
);
