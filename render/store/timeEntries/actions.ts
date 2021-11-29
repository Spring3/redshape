import type { IAction, Context } from 'overmind';
import { Response } from '../../../types';

type GetManyTimeEntriesParams = {
  filters: {
    issueId: number;
    projectId: number;
  },
  offset?: number;
  limit?: number;
}

const getManyTimeEntries: IAction<GetManyTimeEntriesParams, Promise<Response<any>>> = async ({ effects, state }: Context, { filters, offset, limit }) => {
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
    return {
      success: true,
      data: {
        items: response.payload.timeEntries,
        total: response.payload.total,
        limit: response.payload.limit,
        offset: response.payload.offset
      },
      hasMore: response.payload.total > (response.payload.offset + response.payload.issues.length),
    };
  }

  return {
    success: false,
    data: {
      items: [],
      total: 0,
      limit,
      offset
    },
    hasMore: false,
    error: response.error
  };
};

export {
  getManyTimeEntries
};
