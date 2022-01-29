import type { IAction, Context } from 'overmind';
import { PaginatedActionResponse } from '../../../types';
import { indexById } from '../helpers';

type GetManyProjectsArgs = {
  offset?: number;
  limit?: number;
}

const getManyProjects: IAction<GetManyProjectsArgs, Promise<PaginatedActionResponse<any>>> = async ({ state, effects }: Context, { offset = 0, limit = 20 }) => {
  const normalizedOffset = offset ? Math.abs(offset) : 0;
  const normalizedLimit = limit ? Math.abs(limit) : undefined;

  const response = await effects.mainProcess.request({
    payload: {
      route: 'projects.json',
      method: 'GET',
      query: {
        offset: normalizedOffset,
        include: 'time_entry_activities',
        limit: normalizedLimit
      }
    }
  });

  if (response.success) {
    state.projects.byId = {
      ...state.projects.byId,
      ...indexById(response.data.projects)
    };

    console.log('payload', response.data);

    return {
      success: true,
      data: {
        items: response.data.projects,
        total: response.data.total,
        limit: response.data.limit,
        offset: response.data.offset
      },
      hasMore: response.data.total > response.data.projects.length
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
  getManyProjects
};
