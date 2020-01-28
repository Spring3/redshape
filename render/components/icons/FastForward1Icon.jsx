import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

class FastForward1Icon extends Component {
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
        <path d="m 12.777097,12 v 10 h -2 V 14 H 8.7770974 V 12 H 12.777097 M 11.5,3 c 2.65,0 5.05,1 6.9,2.6 L 21,3 v 7 H 14 L 16.62,7.38 C 15.23,6.22 13.46,5.5 11.5,5.5 7.96,5.5 4.95,7.81 3.9,11 L 1.53,10.22 C 2.92,6.03 6.85,3 11.5,3 Z" />
      </svg>
    );
  }
}

FastForward1Icon.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
  color: PropTypes.string,
};

FastForward1Icon.defaultProps = {
  className: null,
  size: 24,
  color: null
};

export default FastForward1Icon;
