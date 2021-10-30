import type { IAction, Context, IReaction } from 'overmind';
import { Response } from '../../../types';

type LoginActionProps = {
  useApiKey: boolean;
  apiKey?: string;
  username: string;
  password: string;
  redmineEndpoint?: string;
};

const login: IAction<LoginActionProps, Promise<Response>> = async ({ effects, state }: Context, {
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

  const response = await effects.request.query({
    payload: {
      headers,
      route: 'users/current.json',
    },
    config: {
      endpoint: redmineEndpoint,
      token: apiKey
    }
  });

  if (response.success) {
    state.users.currentUser = response.payload;
    sessionStorage.setItem('token', response.payload.api_key);
  }

  return response;
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
        sessionStorage.removeItem('token');
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
