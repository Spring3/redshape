import React from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

const StyledLink = styled.a`
  color: #FF7079;
  font-size: 14px;
  padding: 2px;

  ${props => css`
    ${typeof props.children === 'string' ? '&:hover { background: #FF7079; color: white; }' : ''}
  `}
`;

const Link = ({ children, type, href }) => (
  <StyledLink
    type={type}
    href={href}
    rel="noopener noreferer"
  >
    {children}
  </StyledLink>
);

Link.propTypes = {
  children: PropTypes.node,
  type: PropTypes.string,
  href: PropTypes.string.isRequired
};

Link.defaultProps = {
  children: undefined,
  type: undefined
};

export default Link;
