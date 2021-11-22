import type { IAction, Context } from 'overmind';
import { PaginatedActionResponse } from '../../../types';
import { indexById } from '../helpers';

type GetManyProjectsArgs = {
  offset?: number;
  limit?: number;
}

const getManyProjects: IAction<GetManyProjectsArgs, Promise<PaginatedActionResponse<any>>> = async ({ state, effects }: Context, { offset = 0, limit = 20 }) => {
  const response = await effects.mainProcess.request({
    payload: {
      route: 'projects.json',
      method: 'GET',
      query: {
        offset: offset ? Math.abs(offset) : 0,
        include: 'time_entry_activities',
        limit: limit ? Math.abs(limit) : undefined
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
      limit,
      offset
    },
    hasMore: false,
    error: response.error
  };
};

export {
  getManyProjects
};
