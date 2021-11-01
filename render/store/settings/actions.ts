import type { IAction, Context } from 'overmind';
import type { SettingsState } from './state';

import { Response } from '../../../types';

const update: IAction<SettingsState, Promise<Response>> = ({ state, effects }: Context, settings) => {
  state.settings = {
    ...settings
  };

  return effects.storage.saveActiveSession({
    settings,
    currentUser: state.users.currentUser
  });
};

const restore: IAction<Partial<string>, Promise<{ success: boolean }>> = async ({ state, effects }: Context, token) => {
  const response = await effects.storage.getSession(token || localStorage.getItem('token') as string);

  if (response.success && response.payload) {
    const saveResponse = await effects.storage.saveActiveSession({ settings: response.payload, currentUser: state.users.currentUser });

    if (!saveResponse.success) {
      return { success: false };
    }

    state.settings = {
      ...response.payload
    };
  }

  return { success: response.success };
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
  update,
  restore,
  reset
};
