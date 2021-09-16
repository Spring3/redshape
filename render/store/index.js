import {
  createActionsHook, createEffectsHook, createStateHook, createReactionHook
} from 'overmind-react';
import { merge, namespaced } from 'overmind/config';

const createStoreConfig = () => merge(
  {
    state: {},
    actions: {},
    effects: {}
  },
  namespaced({})
);

const useOvermindActions = createActionsHook();
const useOvermindState = createStateHook();
const useOvermindEffects = createEffectsHook();
const useOvermindReaction = createReactionHook();

export {
  useOvermindEffects,
  useOvermindActions,
  useOvermindState,
  useOvermindReaction,
  createStoreConfig
};
