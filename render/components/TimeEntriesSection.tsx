import React, { useCallback, useEffect } from 'react';
import { TimeEntry } from '../../types';
import { usePaginatedFetch } from '../hooks/usePaginatedFetch';
import { useOvermindActions, useOvermindState } from '../store';
import { Flex } from './Flex';
import { TimeEntryCard } from './TimeEntryCard';

type TimeEntriesSectionProps = {
  issueId: number;
}

const TimeEntriesSection = ({ issueId } : TimeEntriesSectionProps) => {
  const actions = useOvermindActions();
  const state = useOvermindState();

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

  const { items: timeEntries } = usePaginatedFetch<TimeEntry>({
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
        <TimeEntryCard key={timeEntry.id} timeEntry={timeEntry} />
      ))}
    </Flex>
  );
};

export {
  TimeEntriesSection
};
