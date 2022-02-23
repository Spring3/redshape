import moment from 'moment';
import type { IAction, Context } from 'overmind';
import { PaginatedActionResponse, Response, TimeEntry } from '../../../types';
import { indexById } from '../helpers';

type GetManyTimeEntriesParams = {
  filters: {
    issueId: number;
    projectId: number;
  },
  offset?: number;
  limit?: number;
}

const getMany: IAction<GetManyTimeEntriesParams, Promise<PaginatedActionResponse<any>>> = async ({ effects, state }: Context, { filters, offset, limit = 20 }) => {
  const response = await effects.mainProcess.request({
    payload: {
      method: 'GET',
      route: 'time_entries.json',
      query: {
        limit: limit ? Math.abs(limit) : undefined,
        offset: offset || 0,
        project_id: filters.projectId,
        issue_id: filters.issueId
      }
    }
  });

  if (response.success) {
    state.timeEntries.mapByIssueId = {
      ...state.timeEntries.mapByIssueId,
      [filters.issueId]: {
        ...(state.timeEntries.mapByIssueId[filters.issueId] || {}),
        ...indexById(response.data.timeEntries)
      }
    };

    return {
      success: true,
      data: {
        items: response.data.timeEntries,
        total: response.data.total,
        limit: response.data.limit,
        offset: response.data.offset ?? 0
      },
      hasMore: response.data.total > (response.data.offset + response.data.timeEntries.length),
    };
  }

  return {
    success: false,
    data: {
      items: [],
      total: 0,
      limit,
      offset: offset ?? 0
    },
    hasMore: false,
    error: response.error
  };
};

const remove: IAction<TimeEntry, Promise<Response<void>>> = async ({ effects, state }: Context, timeEntry) => {
  const response = await effects.mainProcess.request({
    payload: {
      method: 'DELETE',
      route: `time_entries/${timeEntry.id}.json`
    }
  });

  if (response.success) {
    const existingEntriesForIssue = state.timeEntries.mapByIssueId[timeEntry.issue.id] || {};
    delete existingEntriesForIssue[timeEntry.id];

    state.timeEntries.mapByIssueId = {
      ...state.timeEntries.mapByIssueId,
      [timeEntry.issue.id]: existingEntriesForIssue,
    };

    return {
      success: true,
    };
  }

  return {
    success: false,
    error: response.error
  };
};

const create: IAction<Omit<TimeEntry, 'id' | 'createdOn' | 'updatedOn'>, Promise<Response<TimeEntry>>> = async ({ effects, state }: Context, timeEntry) => {
  const response = await effects.mainProcess.request({
    payload: {
      method: 'POST',
      route: 'time_entries.json',
      body: {
        time_entry: {
          issue_id: timeEntry.issue.id,
          spent_on: moment(timeEntry.spentOn).format('YYYY-MM-DD'),
          hours: timeEntry.hours,
          activity_id: timeEntry.activity.id,
          comments: timeEntry.comments,
          user_id: timeEntry.user.id
        }
      }
    }
  });

  if (response.success) {
    const createdTimeEntry = response.data.timeEntry as TimeEntry;
    const timeEntriesForCurrentIssue = state.timeEntries.mapByIssueId[timeEntry.issue.id] ?? {};

    state.timeEntries.mapByIssueId = {
      ...state.timeEntries.mapByIssueId,
      [timeEntry.issue.id]: {
        ...timeEntriesForCurrentIssue,
        [createdTimeEntry.id]: createdTimeEntry
      }
    };

    return {
      success: true,
      data: response.data.timeEntry
    };
  }

  return {
    success: false,
    error: response.error
  };
};

const update: IAction<TimeEntry, Promise<Response<TimeEntry>>> = async ({ effects }: Context, timeEntry) => {
  const response = await effects.mainProcess.request({
    payload: {
      method: 'PUT',
      route: `time_entries/${timeEntry.id}.json`,
      body: {
        time_entry: timeEntry
      }
    }
  });

  if (response.success) {
    return {
      success: true,
      data: response.data.timeEntry
    };
  }

  return {
    success: false,
    error: response.error
  };
};

export {
  create,
  getMany,
  remove,
  update
};
