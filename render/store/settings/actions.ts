import type { IAction } from 'overmind';
import type { State } from './state';
import type { Context } from '../index';

const updateSettings: IAction<State, void> = ({ state }: Context, settings) => {
  state.settings = {
    ...settings
  };
};

const onInitializeOvermind: IAction<Context, void> = ({ effects }, instance) => {
  instance.reaction(
    (state) => state.settings,
    (settings) => effects.storage.save(settings),
    { nested: true }
  );
};

export {
  updateSettings,
  onInitializeOvermind
};
