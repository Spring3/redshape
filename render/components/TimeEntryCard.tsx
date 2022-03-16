import { css } from '@emotion/react';
import React from 'react';
import CloseIcon from 'mdi-react/CloseIcon';
import ClockOutlineIcon from 'mdi-react/ClockOutlineIcon';
import CalendarIcon from 'mdi-react/CalendarIcon';
import AccountIcon from 'mdi-react/AccountIcon';
import EditOutlineIcon from 'mdi-react/EditOutlineIcon';
import { useTheme } from 'styled-components';
import ReactTimeAgo from 'react-time-ago';
import { TimeEntry } from '../../types';
import { Flex } from './Flex';
import { MarkdownText } from './MarkdownEditor';
import { theme as Theme } from '../theme';
import { GhostButton } from './GhostButton';

type TimeEntryCardProps = {
  timeEntry: TimeEntry;
  currentUserId: number;
  waitForConfirmation: () => Promise<boolean>;
  onDelete: (timeEntry: TimeEntry) => Promise<any>;
  onEdit: (timeEntry: TimeEntry) => Promise<any>;
};

const styles = {
  username: (theme: typeof Theme) => css`
    font-weight: bold;
    color: ${theme.normalText};
  `
};

const TimeEntryCard = ({
  timeEntry, currentUserId, waitForConfirmation, onDelete, onEdit
}: TimeEntryCardProps) => {
  const theme = useTheme() as typeof Theme;

  const handleDelete = async () => {
    const confirmed = await waitForConfirmation();
    if (confirmed) {
      await onDelete(timeEntry);
    }
  };

  const handleEdit = () => {
    onEdit(timeEntry);
  };

  return (
    <Flex direction='column'>
      <Flex alignItems='center'>
        <ClockOutlineIcon size={18} />
        <h4>
          {timeEntry.hours}
          {' '}
          hours
        </h4>
        <CalendarIcon size={18} />
        <ReactTimeAgo date={new Date(timeEntry.spentOn)} />
        <AccountIcon size={18} />
        <span css={styles.username(theme)}>{timeEntry.user.name}</span>
        { currentUserId === timeEntry.user.id ? <GhostButton onClick={handleEdit}><EditOutlineIcon /></GhostButton> : null }
        <GhostButton onClick={handleDelete}><CloseIcon /></GhostButton>
      </Flex>
      <MarkdownText name={`time-entry-${timeEntry.id}`} markdownText={timeEntry.comments} />
    </Flex>
  );
};

export {
  TimeEntryCard
};
