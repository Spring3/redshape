import { IAction, Context } from 'overmind';
import { IssueStatus, PaginatedActionResponse } from '../../../types';
import { indexById } from '../helpers';

const getAll: IAction<void, Promise<PaginatedActionResponse<IssueStatus>>> = async ({ effects, state }: Context) => {
  const response = await effects.mainProcess.request({
    payload: {
      method: 'GET',
      route: 'issue_statuses.json'
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
