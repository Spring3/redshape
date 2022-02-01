import { css } from '@emotion/react';
import React from 'react';
import { useTheme } from 'styled-components';
import { TimeEntry } from '../../types';
import { DateComponent } from './Date';
import { Flex } from './Flex';
import { MarkdownText } from './MarkdownEditor';
import { theme as Theme } from '../theme';

type TimeEntryCardProps = {
  timeEntry: TimeEntry
};

const styles = {
  username: (theme: typeof Theme) => css`
    font-weight: bold;
    color: ${theme.normalText};
  `
};

const TimeEntryCard = ({ timeEntry }: TimeEntryCardProps) => {
  const theme = useTheme() as typeof Theme;

  return (
    <Flex direction='column'>
      <Flex alignItems='center'>
        <h4>
          {timeEntry.hours}
          {' '}
          hours
        </h4>
        <DateComponent date={timeEntry.spentOn} />
        by
        <span css={styles.username(theme)}>{timeEntry.user.name}</span>
      </Flex>
      <MarkdownText name={`time-entry-${timeEntry.id}`} markdownText={timeEntry.comments} />
    </Flex>
  );
};

export {
  TimeEntryCard
};
