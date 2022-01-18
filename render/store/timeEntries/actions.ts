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
        ...indexById(response.payload.timeEntries)
      }
    };

    return {
      success: true,
      data: {
        items: response.payload.timeEntries,
        total: response.payload.total,
        limit: response.payload.limit,
        offset: response.payload.offset ?? 0
      },
      hasMore: response.payload.total > (response.payload.offset + response.payload.timeEntries.length),
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

type RemoveTimeEntryArgs = {
  id: number;
}

const remove: IAction<RemoveTimeEntryArgs, Promise<Response<void>>> = async ({ effects }: Context, { id }) => {
  const response = await effects.mainProcess.request({
    payload: {
      method: 'DELETE',
      route: `time_entries/${id}.json`
    }
  });

  if (response.success) {
    return {
      success: true,
    };
  }

  return {
    success: false,
    error: response.error
  };
};

const publish: IAction<TimeEntry, Promise<Response<TimeEntry>>> = async ({ effects }: Context, timeEntry) => {
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
    return {
      success: true,
      payload: response.payload.timeEntry
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
      payload: response.payload.timeEntry
    };
  }

  return {
    success: false,
    error: response.error
  };
};

export {
  publish,
  getMany,
  remove,
  update
};
