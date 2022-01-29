import React from 'react';
import { css, keyframes } from '@emotion/react';
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

const styles = {
  wrapper: css`
    position: relative;
    display: inline-grid;
    grid-template-rows: 1fr;
  `,
  wrapperAnimated: css`
    &:focus > span:first-child,
    &:hover > span:first-child {
      animation: ${verticalSlideFadeOut} 0.5s ease forwards;
    }

    &:focus > span:first-child,
    &:hover > span:last-child {
      animation: ${fadeIn} 0.5s ease forwards;
    }
  `,
  span: css`
    float: left;
    grid-row: 1;
    grid-column: 1;
  `,
  formattedDate: css`
    opacity: 0;
    display: none;
  `,
  formattedDateAnimated: css`
    display: 'inherit';
  `
};

type DateComponentProps = {
  date?: Date;
  className?: string;
};

const DateComponent = ({ date, className }: DateComponentProps) => {
  if (!date) {
    return null;
  }

  const daysAgo = moment()
    .endOf('day')
    .diff(moment(date).endOf('day'), 'days');
  // eslint-disable-next-line
  const precision = daysAgo === 0 ? 'today' : daysAgo > 1 ? `${daysAgo} days ago` : 'yesterday';
  const shouldBeAnimated = daysAgo >= 0 && daysAgo <= 30;
  const displayedValue = shouldBeAnimated ? precision : moment(date).format('MMM DD YYYY');
  return (
    <span css={shouldBeAnimated ? [styles.wrapper, styles.wrapperAnimated] : [styles.wrapper]}>
      <span css={[styles.span]} className={className}>
        {displayedValue}
      </span>
      <span
        css={
          shouldBeAnimated
            ? [styles.span, styles.formattedDate, styles.formattedDateAnimated]
            : [styles.span, styles.formattedDate]
        }
        className={className}>
        {moment(date).format('MMM DD YYYY')}
      </span>
    </span>
  );
};

export { DateComponent };
