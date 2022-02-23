import React, { useCallback } from 'react';
import { TimeEntry } from '../../types';
import { useModalContext } from '../contexts/ModalContext';
import { usePaginatedFetch } from '../hooks/usePaginatedFetch';
import { useOvermindActions, useOvermindState } from '../store';
import { Flex } from './Flex';
import { TimeEntryCard } from './TimeEntryCard';

type TimeEntriesSectionProps = {
  issueId: number;
  timeEntries: TimeEntry[];
}

const TimeEntriesSection = ({ issueId, timeEntries } : TimeEntriesSectionProps) => {
  const actions = useOvermindActions();
  const state = useOvermindState();
  const modalContext = useModalContext();

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
    <Flex justifyContent='stretch' direction='column'>
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
