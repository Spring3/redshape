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
      ...indexById(response.payload.projects)
    };

    console.log('payload', response.payload);

    return {
      success: true,
      data: {
        items: response.payload.projects,
        total: response.payload.total,
        limit: response.payload.limit,
        offset: response.payload.offset
      },
      hasMore: response.payload.total > response.payload.projects.length
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
  getManyProjects
};
