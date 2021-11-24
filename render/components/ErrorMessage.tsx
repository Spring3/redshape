import React, { ReactNode } from 'react';
import { css } from '@emotion/react';

const errorMessageStypes = css`
  margin: 0px;
  font-size: 14px;
  background: #FF7079;
  color: white;
  padding: 2px;
  display: inline-block;
`;

type ErrorMessageProps = {
  children: ReactNode;
  show?: boolean;
}

const ErrorMessage = ({ children, show }: ErrorMessageProps) => {
  if (show) {
    return (
      <p css={errorMessageStypes}>
        {children}
      </p>
    );
  }

  return null;
};

export { ErrorMessage };
