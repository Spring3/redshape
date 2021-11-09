import type { IContext } from 'overmind';
import {
  createActionsHook, createEffectsHook, createStateHook, createReactionHook
} from 'overmind-react';
import { merge, namespaced } from 'overmind/config';

import * as settings from './settings';
import * as users from './users';
import * as issues from './issues';

import { mainProcess } from './effects';

const overmindStoreConfig = merge(
  {
    state: {},
    actions: {},
    effects: {
      mainProcess,
    }
  },
  namespaced({
    issues,
    settings,
    users
  })
);

type OvermindConfig = IContext<typeof overmindStoreConfig>;
declare module 'overmind' {
  // eslint-disable-next-line no-unused-vars
  type Context = OvermindConfig
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
