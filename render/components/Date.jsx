import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes, css } from 'styled-components';
import moment from 'moment';

const verticalSlideFadeOut = keyframes`
  0%: {
    transform: translateY(0px);
    opacity: 1;
  }

  100% {
    transform: translateY(-30px);
    opacity: 0;
  }
`;

const fadeIn = keyframes`
  0%: {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
`;

const StyledDate = styled.span`
  position: relative;
  display: inline-grid;
  grid-template-rows: 1fr;

  span {
    float: left;
    grid-row: 1;
    grid-column: 1;
  }
  ${props => props.align && css`
    text-align: ${props.align};
  `}

  span:last-child {
    opacity: 0;
    display: ${props => (props.animated ? 'inherit' : 'none')};
  }

  ${props => props.animated && css`
    &:focus > span:first-child,
    &:hover > span:first-child {
      animation: ${verticalSlideFadeOut} .5s ease forwards;
    }

    &:focus > span:first-child,
    &:hover > span:last-child {
      animation: ${fadeIn} .5s ease forwards;
    }
  `}
`;

class DateComponent extends PureComponent {
  render() {
    const { date, className, align } = this.props;
    if (date) {
      const daysAgo = moment().endOf('day').diff(moment(date).endOf('day'), 'days');
      const precision = (daysAgo === 0
        ? 'today'
        : daysAgo > 1
          ? `${daysAgo} days ago`
          : 'yesterday'
      );
      const shouldBeAnimated = (daysAgo >= 0 && daysAgo <= 30);
      const displayedValue = shouldBeAnimated
        ? precision
        : moment(date).format('MMM DD YYYY');
      return (
        <StyledDate animated={shouldBeAnimated}>
          <span className={className} align={align}>{displayedValue}</span>
          <span className={className}>{moment(date).format('MMM DD YYYY')}</span>
        </StyledDate>
      );
    }
    return null;
  }
}

DateComponent.propTypes = {
  className: PropTypes.string,
  date: PropTypes.string.isRequired
};

DateComponent.defaultProps = {
  className: undefined
};

export default DateComponent;
