import type { IAction, Context } from 'overmind';
import { Response } from '../../../types';
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

  const headers: Record<any, string> = apiKey ? {
    'X-Redmine-API-Key': apiKey
  } : {
    Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
  };

  const loginResponse = await effects.request.query({
    payload: {
      headers,
      route: 'users/current.json',
    },
    config: {
      endpoint: redmineEndpoint,
      token: apiKey
    }
  });

  if (loginResponse.success) {
    state.users.currentUser = loginResponse.payload;
    localStorage.setItem('token', loginResponse.payload.token);

    const restoreResponse = await actions.settings.restore({
      endpoint: redmineEndpoint,
      token: loginResponse.payload.token
    });

    if (!restoreResponse.success) {
      await actions.settings.update({ ...defaultSettingsState });
    }
  }

  return loginResponse;
};

const logout: IAction<void, void> = ({ state, actions }: Context) => {
  state.users.currentUser = undefined;
  actions.settings.reset();
};

const onInitializeOvermind: IAction<Context, void> = ({ effects }: Context, overmind) => {
  overmind.reaction(
    (state) => state.users.currentUser,
    async (user) => {
      if (user === undefined) {
        localStorage.removeItem('token');
        await effects.storage.resetActiveSession();
      }
    }
  );
};

export {
  login,
  logout,
  onInitializeOvermind
};
