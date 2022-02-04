import { css } from '@emotion/react';
import React from 'react';
import CloseIcon from 'mdi-react/CloseIcon';
import { useTheme } from 'styled-components';
import { TimeEntry } from '../../types';
import { DateComponent } from './Date';
import { Flex } from './Flex';
import { MarkdownText } from './MarkdownEditor';
import { theme as Theme } from '../theme';
import { GhostButton } from './GhostButton';

type TimeEntryCardProps = {
  timeEntry: TimeEntry;
  waitForConfirmation: () => Promise<boolean>;
  onDelete: (timeEntry: TimeEntry) => Promise<any>;
};

const styles = {
  username: (theme: typeof Theme) => css`
    font-weight: bold;
    color: ${theme.normalText};
  `
};

const TimeEntryCard = ({ timeEntry, waitForConfirmation, onDelete }: TimeEntryCardProps) => {
  const theme = useTheme() as typeof Theme;

  const handleDelete = async () => {
    const confirmed = await waitForConfirmation();
    if (confirmed) {
      await onDelete(timeEntry);
    }
  };

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
        <GhostButton onClick={handleDelete}><CloseIcon /></GhostButton>
      </Flex>
      <MarkdownText name={`time-entry-${timeEntry.id}`} markdownText={timeEntry.comments} />
    </Flex>
  );
};

export {
  TimeEntryCard
};
