import type { Context, IAction } from 'overmind';
import { Ticket, PaginatedActionResponse, Response } from '../../../types';
import { indexById } from '../helpers';

type GetManyTicketsArgs = {
  filters: {
    assigned_to_id?: number | string;
    status_id?: '*' | 'open' | 'closed';
    subject?: string;
    sort?: string;
  },
  offset?: number;
  limit?: number;
}

const getMany: IAction<GetManyTicketsArgs, Promise<PaginatedActionResponse<Ticket>>> = async ({ effects, state }: Context, { filters, offset = 0, limit = 20 }) => {
  const query = {
    limit: limit ? Math.abs(limit) : undefined,
    offset: offset ? Math.abs(offset) : 0,
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
    state.tickets.byId = {
      ...state.tickets.byId,
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
      hasMore: response.payload.total > response.payload.issues.length,
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

type GetOneTicketArgs = {
  id: string;
}

const getOne: IAction<GetOneTicketArgs, Promise<Response<Ticket>>> = async ({ effects, state }: Context, { id }) => {
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
    const ticket = response.payload as Ticket;
    state.tickets.byId[id] = ticket;
    return {
      success: true,
      data: ticket
    };
  }

  return {
    success: false,
    error: response.error
  };
};

export {
  getOne,
  getMany
};
