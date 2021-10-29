import type { IAction, Context } from 'overmind';
import type { State } from './state';

const update: IAction<State, void> = ({ state, effects }: Context, settings) => {
  state.settings = {
    ...settings
  };
  effects.storage.save(state.settings);
};

const restore: IAction<void, Promise<void>> = async ({ state, effects }: Context) => {
  const settings = await effects.storage.read({
    userId: state.users.currentUser?.id as string,
    endpoint: state.settings.endpoint as string
  });
  state.settings = { ...settings };
};

export {
  update,
  restore
};
