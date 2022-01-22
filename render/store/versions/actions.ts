import type { IAction, Context } from 'overmind';
import { PaginatedActionResponse, Version } from '../../../types';
import { indexById } from '../helpers';

type GetProjectVersionsArgs = {
  projectId: number | string; // can be either project.id or project.identifier
}

const getForProject: IAction<GetProjectVersionsArgs, Promise<PaginatedActionResponse<Version>>> = async ({ effects, state }: Context, { projectId }) => {
  const response = await effects.mainProcess.request({
    payload: {
      method: 'GET',
      route: `projects/${projectId}/verisons.json`
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
        ...indexById(response.payload.versions)
      }
    };

    return {
      success: true,
      data: {
        items: response.payload.versions,
        total: response.payload.total,
        limit: response.payload.limit,
        offset: response.payload.offset,
      },
      hasMore: response.payload.total > (response.payload.offset + response.payload.versions.length)
    };
  }

  return {
    success: false,
    data: {
      items: [],
      total: 0,
      limit: response.payload.limit,
      offset: response.payload.offset,
    },
    hasMore: false,
    error: response.error
  };
};

export {
  getForProject
};
