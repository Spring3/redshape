import type { IAction, Context } from 'overmind';
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
    state.users.currentUser = response.data;
  }

  return response;
};

const logout = () => {

};

export {
  login,
  logout
};
