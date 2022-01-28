import type { IAction, Context } from 'overmind';
import { PaginatedActionResponse, Version } from '../../../types';
import { indexById } from '../helpers';

type GetProjectVersionsArgs = {
  projectId: number | string; // can be either project.id or project.identifier
  offset?: number;
  limit?: number;
}

const getForProject: IAction<GetProjectVersionsArgs, Promise<PaginatedActionResponse<Version>>> = async ({ effects, state }: Context, { projectId, offset, limit }) => {
  const response = await effects.mainProcess.request({
    payload: {
      method: 'GET',
      route: `projects/${projectId}/verisons.json`,
      query: {
        offset: offset ? Math.abs(offset) : 0,
        limit: limit ? Math.abs(limit) : undefined
      }
    }
  });

  if (response.success) {
    const targetProject = state.projects.list.find((project) => {
      if (typeof projectId === 'number') {
        return project.id === projectId;
      }

      return project.identifier === projectId;
    });

    const savedVersionMap = state.versions.byProjectId[targetProject!.id] ?? {};

    state.versions.byProjectId = {
      ...state.versions.byProjectId,
      [targetProject!.id]: {
        ...savedVersionMap,
        ...indexById(response.data.versions)
      }
    };

    return {
      success: true,
      data: {
        items: response.data.versions,
        total: response.data.total,
        limit: response.data.limit,
        offset: response.data.offset,
      },
      hasMore: response.data.total > (response.data.offset + response.data.versions.length)
    };
  }

  return {
    success: false,
    data: {
      items: [],
      total: 0,
      limit: limit || response.data.limit,
      offset: offset || response.data.offset,
    },
    hasMore: false,
    error: response.error
  };
};

export {
  getForProject
};
