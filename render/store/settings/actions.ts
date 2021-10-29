import type { IAction, Context } from 'overmind';
import type { State } from './state';

const update: IAction<State, void> = ({ state, effects }: Context, settings) => {
  state.settings = {
    ...settings
  };
  effects.storage.save(state.settings);
};

type SettingsReadArgs = {
  userId: string;
  endpoint: string;
}

const restore: IAction<SettingsReadArgs, Promise<void>> = async ({ state, effects }: Context, { userId, endpoint }) => {
  const settings = await effects.storage.read({ userId, endpoint });
  state.settings = { ...settings };
};

export {
  update,
  restore
};
