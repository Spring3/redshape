import type { IAction, Context } from 'overmind';
import { defaultSettingsState, SettingsState } from './state';

import { Response, SessionAction, User } from '../../../types';
import { getStoredToken } from '../../helpers/utils';

const update: IAction<SettingsState, Promise<Response>> = ({ state, effects }: Context, settings) => {
  state.settings = {
    ...settings
  };

  const { endpoint, ...appSettings } = settings;
  const currentUser = state.users.currentUser as User;

  return effects.mainProcess.session({
    action: SessionAction.SAVE,
    payload: {
      user: {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        createdOn: currentUser.createdOn
      },
      endpoint,
      token: getStoredToken(),
      settings: {
        ...appSettings
      }
    }
  });
};

const restore: IAction<string, Promise<Response<Context['state']['settings']>>> = async ({ state, effects }: Context, token) => {
  const response = await effects.mainProcess.session({
    action: SessionAction.READ,
    payload: {
      token
    }
  });

  if (response.success && response.payload) {
    const { endpoint, settings } = response.payload;
    const currentUser = response.payload.user as User;

    // replacing the active session
    const saveResponse = await effects.mainProcess.session({
      action: SessionAction.SAVE,
      payload: {
        user: {
          id: currentUser.id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          createdOn: currentUser.createdOn
        },
        endpoint,
        token: getStoredToken(),
        settings
      }
    });

    if (!saveResponse.success) {
      return { success: false, error: saveResponse.error };
    }

    state.users.currentUser = { ...currentUser };

    state.settings = {
      endpoint: response.payload.endpoint,
      ...settings
    };
  }

  return { success: response.success, payload: response.payload };
};

const reset: IAction<void, Promise<Response>> = async ({ effects, state }: Context) => {
  state.settings = { ...defaultSettingsState };

  const { endpoint, ...appSettings } = defaultSettingsState;
  const currentUser = state.users.currentUser as User;

  return effects.mainProcess.session({
    action: SessionAction.SAVE,
    payload: {
      user: {
        id: currentUser?.id,
        firstName: currentUser?.firstName,
        lastName: currentUser?.lastName,
        createdOn: currentUser?.createdOn
      },
      endpoint,
      token: getStoredToken(),
      settings: {
        ...appSettings
      }
    }
  });
};

export {
  update,
  restore,
  reset
};
