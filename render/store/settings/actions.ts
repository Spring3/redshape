import type { IAction, Context } from 'overmind';
import type { State } from './state';
import type { SettingsReadArgs } from './effects';

const update: IAction<State, void> = ({ state }: Context, settings) => {
  state.settings = {
    ...settings
  };
};

const onInitializeOvermind: IAction<Context, void> = ({ effects }, instance) => {
  instance.reaction(
    (state) => state.settings,
    (settings) => {
      console.log(settings);
      effects.storage.save(settings);
    },
    { nested: true }
  );
};

const restore: IAction<SettingsReadArgs, Promise<void>> = async ({ state, effects }: Context, { userId, endpoint }) => {
  const settings = await effects.settings.read({ userId, endpoint });
  state.settings = { ...settings };
};

export {
  update,
  restore,
  onInitializeOvermind
};
