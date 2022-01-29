import moment from 'moment';
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
      ...indexById(response.data.issues)
    };

    console.log('payload', response.data);

    return {
      success: true,
      data: {
        items: response.data.issues,
        total: response.data.total,
        limit: response.data.limit,
        offset: response.data.offset
      },
      hasMore: response.data.total > (response.data.offset + response.data.issues.length),
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

type GetOneIssueArgs = {
  id: number;
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
    const issue = response.data as Issue;
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
  dueDate?: string;
  doneRatio?: number;
  estimatedHours?: number;
  spentHours?: number;
  closedOn?: string;
}

const update: IAction<UpdateIssueArgs, Promise<Response<Issue>>> = async ({ effects, state, actions }: Context, { id, ...updates }) => {
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
    const refetchResponse = await actions.issues.getOne({ id });
    if (refetchResponse.success) {
      const issue = refetchResponse.data as Issue;
      state.issues.byId[id] = issue;

      return {
        success: true,
        data: issue
      };
    }
  }

  return {
    success: false,
    error: response.error
  };
};

type GetCommentsArgs = {
  issueId: number;
  comments: string;
}

const publishComments: IAction<GetCommentsArgs, Promise<Response<Issue>>> = async ({ effects, state, actions }: Context, { issueId, comments }) => {
  const response = await effects.mainProcess.request({
    payload: {
      route: `issues/${issueId}.json`,
      method: 'PUT',
      body: {
        issue: {
          notes: comments
        }
      }
    }
  });

  if (response.success) {
    const refetchResponse = await actions.issues.getOne({ id: issueId });
    if (refetchResponse.success) {
      const issue = refetchResponse.data as Issue;
      state.issues.byId[issueId] = issue;

      return {
        success: true,
        data: issue
      };
    }
  }

  return {
    success: false,
    error: response.error
  };
};

export {
  getOne,
  getMany,
  update,
  publishComments
};
