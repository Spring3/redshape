import type { Context, IAction } from 'overmind';
import { Issue, PaginatedActionResponse } from '../../../types';
import { indexById } from '../helpers';

type GetManyIssueArgs = {
  filters: {
    assigned_to_id?: number | string;
    status_id?: '*' | 'open' | 'closed';
    subject?: string;
    sort?: string;
  },
  offset?: number;
  limit?: number;
}

const getMany: IAction<GetManyIssueArgs, Promise<PaginatedActionResponse<Issue>>> = async ({ effects, state }: Context, { filters, offset = 0, limit = 20 }) => {
  const query = {
    limit: limit ? Math.abs(limit) : undefined,
    offset: offset ? Math.abs(offset) : 0,
    include: 'attachments,children,relations,journals',
    ...filters
  };

  const response = await effects.mainProcess.request({
    payload: {
      route: 'issues.json',
      method: 'GET',
      query
    }
  });

  if (response.success) {
    state.issues.byId = {
      ...state.issues.byId,
      ...indexById(response.payload.issues)
    };

    console.log('payload', response.payload);

    return {
      success: true,
      data: {
        items: response.payload.issues,
        total: response.payload.total,
        limit: response.payload.limit,
        offset: response.payload.offset
      },
      hasMore: response.payload.total > response.payload.issues.length,
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
  getMany
};
