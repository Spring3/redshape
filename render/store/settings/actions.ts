import type { IAction, Context } from 'overmind';
import type { State } from './state';

import { Response } from '../../../types';

const save: IAction<State, Promise<Response>> = ({ state, effects }: Context, settings) => {
  state.settings = {
    ...settings
  };

  return effects.storage.save({
    settings,
    currentUser: state.users.currentUser
  });
};

const restore: IAction<void, Promise<void>> = async ({ state, effects }: Context) => {
  const response = await effects.storage.read({
    userId: state.users.currentUser?.id as string,
    endpoint: state.settings.endpoint as string
  });

  if (response.success && response.payload) {
    state.settings = {
      ...response.payload
    };
  }
};

export {
  save,
  restore
};
