import { css } from '@emotion/react';
import React, { useCallback } from 'react';
import { useTheme } from 'styled-components';
import { TimeEntry } from '../../types';
import { useModalContext } from '../contexts/ModalContext';
import { usePaginatedFetch } from '../hooks/usePaginatedFetch';
import { useOvermindActions, useOvermindState } from '../store';
import { Flex } from './Flex';
import { TimeEntryCard } from './TimeEntryCard';
import { theme as Theme } from '../theme';

type TimeEntriesSectionProps = {
  issueId: number;
  timeEntries: TimeEntry[];
}

const styles = {
  section: (theme: typeof Theme) => css`
    background: ${theme.bgDark};
  `
};

const TimeEntriesSection = ({ issueId, timeEntries } : TimeEntriesSectionProps) => {
  const actions = useOvermindActions();
  const state = useOvermindState();
  const modalContext = useModalContext();
  const theme = useTheme() as typeof Theme;

  const issue = state.issues.byId[issueId];
  const projectId = issue.project.id;

  const requestTimeEntries = useCallback(
    (params) => actions.timeEntries.getMany({
      filters: {
        issueId,
        projectId,
        ...params.filters
      },
      limit: params.limit,
      offset: params.offset
    }),
    [issueId, projectId]
  );

  const waitForConfirmation = useCallback(async () => {
    const result = await modalContext.openConfirmationModal({
      title: 'Are you sure you want to delete the time entry?',
      description: 'Deleting a time entry can not be reverted.'
    });

    return result.confirmed;
  }, [modalContext.openConfirmationModal]);

  usePaginatedFetch<TimeEntry>({
    request: requestTimeEntries
  });

  if (!timeEntries.length) {
    return (
      <Flex>
        No time entries recorded yet
      </Flex>
    );
  }

  return (
    <Flex justifyContent='stretch' direction='column' css={styles.section(theme)}>
      {timeEntries.map((timeEntry) => (
        <TimeEntryCard
          key={timeEntry.id}
          timeEntry={timeEntry}
          waitForConfirmation={waitForConfirmation}
          onDelete={actions.timeEntries.remove}
        />
      ))}
    </Flex>
  );
};

export {
  TimeEntriesSection
};
