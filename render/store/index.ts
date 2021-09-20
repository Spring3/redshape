import { IContext } from 'overmind';
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

type RootState = typeof overmindStoreConfig.state;
type Context = IContext<{
  state: typeof overmindStoreConfig.state,
  effects: typeof overmindStoreConfig.effects,
  actions: typeof overmindStoreConfig.actions
}>;

const useOvermindActions = createActionsHook<Context>();
const useOvermindState = createStateHook<Context>();
const useOvermindEffects = createEffectsHook<Context>();
const useOvermindReaction = createReactionHook<Context>();

export {
  useOvermindEffects,
  useOvermindActions,
  useOvermindState,
  useOvermindReaction,
  overmindStoreConfig
};

export type {
  RootState,
  Context
};
