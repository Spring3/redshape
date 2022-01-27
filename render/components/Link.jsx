import React from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { noop } from 'lodash';

import { openExternalUrl } from '../../common/utils';
import { useOvermindEffects } from '../store';

const StyledLink = styled.a`
  color: ${(props) => props.theme.main};
  font-size: 14px;
  padding: 2px;
  cursor: pointer;

  ${(props) => css`
    ${typeof props.children === 'string'
    ? `&:hover { background: ${props.theme.main}; color: ${props.theme.hoverText}; }`
    : ''}
  `}
`;

const Link = ({
  onClick, type, href, children, className, testId
}) => {
  const effects = useOvermindEffects();
  const clickHandler = (event) => {
    event.preventDefault();
    if (type === 'external') {
      await effects.mainProcess.system({
        payload: {
          url: href
        },
        action: 'open-url'
      });
    } else if (onClick) {
      onClick(event);
    }
  };

  return (
    <StyledLink
      className={className}
      type={type}
      href={href}
      rel="noopener noreferer"
      onClick={clickHandler}
      data-testid={testId}
    >
      {children}
    </StyledLink>
  );
};

Link.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['external', undefined, null]),
  href: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  testId: PropTypes.string
};

Link.defaultProps = {
  className: undefined,
  type: undefined,
  onClick: noop,
  testId: 'link'
};

export default Link;
