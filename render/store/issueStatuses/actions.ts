import { IAction, Context } from 'overmind';
import { IssueStatus, PaginatedActionResponse } from '../../../types';
import { indexById } from '../helpers';

type GetAllIssueStatusesArgs = {
  offset?: number;
  limit?: number;
};

const getAll: IAction<GetAllIssueStatusesArgs, Promise<PaginatedActionResponse<IssueStatus>>> = async ({ effects, state }: Context, { offset, limit }) => {
  const normalizedOffset = offset ? Math.abs(offset) : 0;
  const normalizedLimit = limit ? Math.abs(limit) : undefined;

  const response = await effects.mainProcess.request({
    payload: {
      method: 'GET',
      route: 'issue_statuses.json',
      query: {
        offset: normalizedOffset,
        limit: normalizedLimit
      }
    }
  });

  if (response.success) {
    state.issueStatuses.byId = {
      ...state.issueStatuses,
      ...indexById(response.payload.issueStatuses)
    };

    return {
      success: true,
      data: {
        items: response.payload.issueStatuses,
        total: response.payload.total,
        limit: response.payload.limit,
        offset: response.payload.offset
      },
      hasMore: response.payload.total > (response.payload.offset + response.payload.issueStatuses.length)
    };
  }

  return {
    success: false,
    data: {
      items: [],
      total: 0,
      limit: response.payload.limit,
      offset: response.payload.offset
    },
    hasMore: false,
    error: response.error
  };
};

export {
  getAll
};
