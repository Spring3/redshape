import { derived } from 'overmind';
import { Ticket } from '../../../types';

type TicketsState = {
  list: Ticket[];
  byId: Record<string, Ticket>,
}

const state: TicketsState = {
  list: derived((ticketsState: TicketsState) => Object.values(ticketsState.byId)),
  byId: {},
};

export {
  state
};

export type {
  TicketsState
};
