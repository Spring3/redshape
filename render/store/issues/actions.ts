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
  const normalizedOffset = offset ? Math.abs(offset) : 0;
  const normalizedLimit = limit ? Math.abs(limit) : undefined;

  const query = {
    limit: normalizedLimit,
    offset: normalizedOffset,
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
      limit: response.payload.limit,
      offset: response.payload.offset
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

type UpdateIssueArgs = {
  id: number;
  projectId?: number;
  trackerId?: number;
  statusId?: number;
  priorityId?: number;
  assigneeId?: number;
  subject?: string;
  description?: string;
  dueDate?: Date | string;
  doneRatio?: number;
  estimatedHours?: number;
  spentHours?: number;
  closedOn?: Date | string;
}

const update: IAction<UpdateIssueArgs, Promise<Response<Issue>>> = async ({ effects, state }: Context, { id, ...updates }) => {
  const response = await effects.mainProcess.request({
    payload: {
      route: `issues/${id}.json`,
      method: 'PUT',
      body: {
        tracker_id: updates.trackerId,
        project_id: updates.projectId,
        status_id: updates.statusId,
        priority_id: updates.priorityId,
        assigned_to_id: updates.assigneeId,
        subject: updates.subject,
        description: updates.description,
        due_date: updates.dueDate,
        done_ratio: updates.doneRatio,
        estimated_hours: updates.estimatedHours,
        spent_hours: updates.spentHours,
        closed_on: updates.closedOn
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
  getMany,
  update
};
