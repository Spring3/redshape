import React, { PureComponent } from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

import { openExternalUrl } from '../../common/utils';

const StyledLink = styled.a`
  color: ${props => props.theme.main};
  font-size: 14px;
  padding: 2px;
  cursor: pointer;

  ${props => css`
    ${typeof props.children === 'string' ? `&:hover { background: ${props.theme.main}; color: ${props.theme.hoverText}; }` : ''}
  `}
`;

class Link extends PureComponent {
  onClick = (event) => {
    event.preventDefault();
    const { onClick, type, href } = this.props;
    if (type === 'external') {
      openExternalUrl(href);
    } else if (onClick) {
      onClick(event);
    }
  }
  render() {
    const { children, type, href, className } = this.props;
    return (
      <StyledLink
        className={className}
        type={type}
        href={href}
        rel="noopener noreferer"
        onClick={this.onClick}
      >
        {children}
      </StyledLink>
    );
  }
}

Link.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['external', undefined, null]),
  href: PropTypes.string.isRequired,
  onClick: PropTypes.func
};

Link.defaultProps = {
  className: undefined,
  type: undefined
};

export default Link;
