import React, { PureComponent } from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

import { openExternalUrl } from '../../common/utils';

const StyledLink = styled.a`
  color: ${props => props.theme.main};
  font-size: ${props => props.fontSize ? props.fontSize : '14px'};
  padding: 2px;
  cursor: ${props => props.clickable ? 'pointer' : 'inherit'};

  ${props => props.clickable && typeof props.children === 'string' && css`
    &:hover { background: ${props.theme.main}; color: ${props.theme.hoverText}; }
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
    const { children, type, href, className, onClick, fontSize } = this.props;
    return (
      <StyledLink
        className={className}
        type={type}
        href={href}
        rel="noopener noreferer"
        clickable={href || onClick}
        fontSize={fontSize}
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
