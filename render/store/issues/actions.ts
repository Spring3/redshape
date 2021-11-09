import type { Context, IAction } from 'overmind';

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

type ManyIssuesResponse = {
  success: boolean;
  data: [];
  hasMore: boolean;
  error?: Error;
}

const getMany: IAction<GetManyIssueArgs, Promise<ManyIssuesResponse>> = async ({ effects }: Context, { filters, offset = 0, limit = 20 }) => {
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
    return {
      success: true,
      data: response.payload.issues,
      hasMore: response.payload.total > response.payload.issues.length,
    };
  }

  return {
    success: false,
    data: [],
    hasMore: false,
    error: response.error
  };
};

export {
  getMany
};
