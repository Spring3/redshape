import React, { PureComponent } from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import actions from '../actions';

import { openExternalUrl } from '../../common/utils';

const StyledLink = styled.a`
  color: ${props => props.theme.main};
  font-size: ${props => (props.fontSize ? props.fontSize : '14px')};
  padding: 2px;
  cursor: ${props => (props.clickable ? 'pointer' : 'inherit')};

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

  interceptHover = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.setStatusBar(e.target.getAttribute('href') || e.target.innerText);
  }

  interceptHoverEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.setStatusBar();
  }

  render() {
    const {
      children, type, href, className, onClick, fontSize
    } = this.props;
    const external = type === 'external';
    return (
      <StyledLink
        className={className}
        type={type}
        href={href}
        rel="noopener noreferer"
        clickable={href || onClick}
        fontSize={fontSize}
        onClick={this.onClick}
        onMouseEnter={external ? this.interceptHover : undefined}
        onMouseLeave={external ? this.interceptHoverEnd : undefined}
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
  href: PropTypes.string,
  onClick: PropTypes.func,
  setStatusBar: PropTypes.func.isRequired,
};

Link.defaultProps = {
  className: undefined,
  type: undefined
};

const mapDispatchToProps = dispatch => ({
  setStatusBar: value => dispatch(actions.session.setStatusBar(value))
});

// export default Link;
export default connect(null, mapDispatchToProps)(Link);
