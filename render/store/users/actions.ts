import type { IAction, Context } from 'overmind';
import { Response } from '../../../types';
import { getStoredToken } from '../../helpers/utils';
import { defaultSettingsState } from '../settings/state';

type LoginActionProps = {
  useApiKey: boolean;
  apiKey?: string;
  username: string;
  password: string;
  redmineEndpoint?: string;
};

const login: IAction<LoginActionProps, Promise<Response>> = async ({ actions, effects, state }: Context, {
  apiKey, username, password, redmineEndpoint
}) => {
  if (!redmineEndpoint) {
    throw new Error('Unable to send a request to an undefined redmine endpoint');
  }

  const token = apiKey || getStoredToken() || undefined;

  const headers: Record<any, string> = token ? {
    'X-Redmine-API-Key': token
  } : {
    Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
  };

  const loginResponse = await effects.mainProcess.system({
    action: 'login',
    payload: {
      headers,
      endpoint: redmineEndpoint,
      token
    }
  });

  if (loginResponse.success) {
    state.users.currentUser = loginResponse.data;
    localStorage.setItem('token', loginResponse.data.token);

    const restoreResponse = await actions.settings.restore(loginResponse.data.token);

    if (!restoreResponse.success) {
      await actions.settings.update({ ...defaultSettingsState, endpoint: redmineEndpoint });
    }
  }

  return loginResponse;
};

const logout: IAction<void, Promise<void>> = async ({ state, effects }: Context) => {
  const response = await effects.mainProcess.system({
    action: 'logout',
    payload: {}
  });

  if (response.success) {
    localStorage.removeItem('token');
    state.users.currentUser = undefined;
  }
};

export {
  login,
  logout
};
