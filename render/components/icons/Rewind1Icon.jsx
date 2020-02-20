import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

class Rewind1Icon extends Component {
  render() {
    const { className, size, color } = this.props;
    const classes = `mdi-icon ${className || ''}`;
    const fillColor = (color == null ? 'currentColor' : color);
    return (
      <svg
        className={classes}
        size={size}
        fill={fillColor}
        width={size}
        height={size}
        viewBox="0 0 24 24"
      >
        <path d="m 12.777097,12 v 10 h -2 V 14 H 8.777098 v -2 h 3.999999 M 11.5,3 C 8.85,3 6.45,4 4.6,5.6 L 2,3 v 7 H 9 L 6.38,7.38 C 7.77,6.22 9.54,5.5 11.5,5.5 c 3.54,0 6.55,2.31 7.6,5.5 l 2.37,-0.78 C 20.08,6.03 16.15,3 11.5,3 Z" />
      </svg>
    );
  }
}

Rewind1Icon.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
  color: PropTypes.string,
};

Rewind1Icon.defaultProps = {
  className: null,
  size: 24,
  color: null
};

export default Rewind1Icon;
