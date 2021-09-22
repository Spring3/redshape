import type { IContext } from 'overmind';
import {
  createActionsHook, createEffectsHook, createStateHook, createReactionHook
} from 'overmind-react';
import { merge, namespaced } from 'overmind/config';

import * as settings from './settings';

const overmindStoreConfig = merge(
  {
    state: {},
    actions: {},
    effects: {}
  },
  namespaced({
    settings
  })
);

type OvermindConfig = IContext<typeof overmindStoreConfig>;
declare module 'overmind' {
  // eslint-disable-next-line no-unused-vars
  interface Context extends OvermindConfig {}
}

const useOvermindActions = createActionsHook<OvermindConfig>();
const useOvermindState = createStateHook<OvermindConfig>();
const useOvermindEffects = createEffectsHook<OvermindConfig>();
const useOvermindReaction = createReactionHook<OvermindConfig>();

export {
  useOvermindEffects,
  useOvermindActions,
  useOvermindState,
  useOvermindReaction,
  overmindStoreConfig
};
