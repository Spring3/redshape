import { css } from '@emotion/react';
import React from 'react';
import ClockOutlineIcon from 'mdi-react/ClockOutlineIcon';
import CalendarIcon from 'mdi-react/CalendarIcon';
import ThreeDotIcon from 'mdi-react/MoreHorizIcon';
import AccountIcon from 'mdi-react/AccountIcon';
import { useTheme } from 'styled-components';
import ReactTimeAgo from 'react-time-ago';
import { TimeEntry } from '../../types';
import { Flex } from './Flex';
import { MarkdownText } from './MarkdownEditor';
import { theme as Theme } from '../theme';
import { GhostButton } from './GhostButton';
import { Dropdown } from './Dropdown';

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
  `,
  background: css`
    background: white;
    width: 100%;
  `,
  actionBar: css`
    width: 100%;
  `
};

const TimeEntryCard = ({
  timeEntry,
  currentUserId,
  waitForConfirmation,
  onDelete,
  onEdit
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
    <Flex css={styles.background} direction="column">
      <Flex css={styles.actionBar} alignItems="center">
        <div>
          <CalendarIcon size={18} />
          <ReactTimeAgo date={new Date(timeEntry.spentOn)} />
        </div>
        <div>
          <ClockOutlineIcon size={18} />
          <span>
            {timeEntry.hours}
            {' '}
            hours
          </span>
        </div>
        <Flex alignItems='center'>
          <div>
            <AccountIcon size={18} />
            <span css={styles.username(theme)}>{timeEntry.user.name}</span>
          </div>
          {currentUserId === timeEntry.user.id ? (
            <Dropdown getDropdownToggleElement={({ toggle }) => (
              <GhostButton onClick={toggle}><ThreeDotIcon /></GhostButton>
            )}
            >
              <GhostButton fullWidth onClick={handleEdit}>Edit</GhostButton>
              <GhostButton fullWidth onClick={handleDelete}>Delete</GhostButton>
            </Dropdown>
          ) : null}
        </Flex>
      </Flex>
      <MarkdownText name={`time-entry-${timeEntry.id}`} markdownText={timeEntry.comments} />
    </Flex>
  );
};

export { TimeEntryCard };
