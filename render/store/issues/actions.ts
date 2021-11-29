import type { Context, IAction } from 'overmind';
import { Issue, PaginatedActionResponse, Response } from '../../../types';
import { indexById } from '../helpers';

type GetManyIssuesArgs = {
  filters: {
    assigned_to_id?: number | string;
    status_id?: '*' | 'open' | 'closed';
    subject?: string;
    sort?: string;
  },
  offset?: number;
  limit?: number;
}

const getMany: IAction<GetManyIssuesArgs, Promise<PaginatedActionResponse<Issue>>> = async ({ effects, state }: Context, { filters, offset = 0, limit = 20 }) => {
  const query = {
    limit: limit ? Math.abs(limit) : undefined,
    offset: offset ? Math.abs(offset) : 0,
    include: 'attachments,relations',
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

type GetOneIssueArgs = {
  id: string;
}

const getOne: IAction<GetOneIssueArgs, Promise<Response<Issue>>> = async ({ effects, state }: Context, { id }) => {
  const response = await effects.mainProcess.request({
    payload: {
      route: `issues/${id}.json`,
      method: 'GET',
      query: {
        include: 'attachments,children,relations,journals',
      }
    }
  });

  if (response.success) {
    const issue = response.payload as Issue;
    state.issues.byId[id] = issue;
    return {
      success: true,
      data: issue
    };
  }

  return {
    success: false,
    error: response.error
  };
};

export {
  getOne,
  getMany
};
