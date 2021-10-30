import type { IAction, Context } from 'overmind';
import type { State } from './state';

import { Response } from '../../../types';

const save: IAction<State, Promise<Response>> = ({ state, effects }: Context, settings) => {
  state.settings = {
    ...settings
  };

  return effects.storage.saveActiveSession({
    settings,
    currentUser: state.users.currentUser
  });
};

const restore: IAction<void, Promise<void>> = async ({ state, effects }: Context) => {
  const response = await effects.storage.getSession({
    userId: state.users.currentUser?.id as string,
    endpoint: state.settings.endpoint as string
  });

  if (response.success && response.payload) {
    state.settings = {
      ...response.payload
    };
  }
};

const reset: IAction<void, Promise<Response>> = async ({ effects, state }: Context) => {
  state.settings = {
    showClosedIssues: false,
    issueHeaders: [
      { label: 'Id', isFixed: true, value: 'id' },
      { label: 'Subject', isFixed: true, value: 'subject' },
      { label: 'Project', isFixed: false, value: 'project.name' },
      { label: 'Tracker', isFixed: false, value: 'tracker.name' },
      { label: 'Status', isFixed: false, value: 'status.name' },
      { label: 'Priority', isFixed: false, value: 'priority.name' },
      { label: 'Estimation', isFixed: false, value: 'estimated_hours' },
      { label: 'Due Date', isFixed: false, value: 'due_date' }
    ],
    endpoint: undefined
  };

  return effects.storage.resetActiveSession();
};

export {
  save,
  restore,
  reset
};
