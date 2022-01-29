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
      ...indexById(response.data.issueStatuses)
    };

    return {
      success: true,
      data: {
        items: response.data.issueStatuses,
        total: response.data.total,
        limit: response.data.limit,
        offset: response.data.offset
      },
      hasMore: response.data.total > (response.data.offset + response.data.issueStatuses.length)
    };
  }

  return {
    success: false,
    data: {
      items: [],
      total: 0,
      limit: response.data.limit,
      offset: response.data.offset
    },
    hasMore: false,
    error: response.error
  };
};

export {
  getAll
};
