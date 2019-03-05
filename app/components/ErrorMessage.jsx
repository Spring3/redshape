import React from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

const StyledError = styled.p`
  margin: 15px auto 5px auto;
  font-size: 14px;
  background: #FF7079;
  color: white;
  padding: 2px;

  ${props => css`
    display: ${props.show ? 'inline-block' : 'none'};
  `}
`;

const ErrorMessage = ({ children, show }) => (
  <StyledError show={show}>
    {children}
  </StyledError>
);

ErrorMessage.propTypes = {
  children: PropTypes.node,
  show: PropTypes.bool
};

ErrorMessage.defaultProps = {
  children: undefined,
  show: false
};

export default ErrorMessage;
