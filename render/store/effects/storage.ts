import { ipcRenderer, remote } from 'electron';
import type { Context } from 'overmind';
import { Response, StorageAction } from '../../../types';

const crypto = remote.require('crypto');

type SaveArgs = {
  settings: Context['state']['settings'];
  currentUser: Context['state']['users']['currentUser'];
};

const saveActiveSession = ({ settings, currentUser }: SaveArgs): Promise<Response> => {
  const id = crypto.randomBytes(10).toString('hex');
  const { endpoint, ...appSettings } = settings;

  return new Promise((resolve) => {
    ipcRenderer.send('storage', JSON.stringify({
      action: StorageAction.SAVE,
      payload: {
        user: {
          id: currentUser?.id,
          firstName: currentUser?.firstName,
          lastName: currentUser?.lastName,
          createdOn: currentUser?.createdOn
        },
        endpoint,
        settings: {
          ...appSettings
        }
      },
      id
    }));

    ipcRenderer.once(`storage:${id}`, (event, response) => {
      console.log('storage:save', response);
      resolve(response);
    });
  });
};

type GetSessionArgs = {
  token: string;
  endpoint: string;
};

const getSession = (payload: GetSessionArgs): Promise<Response<Context['state']['settings'] | undefined>> => {
  const id = crypto.randomBytes(10).toString('hex');

  return new Promise((resolve) => {
    ipcRenderer.send('storage', JSON.stringify({ action: StorageAction.READ, payload, id }));

    ipcRenderer.once(`storage:${id}`, (event, response) => {
      console.log('storage:read', response);
      const settings = response.success
        ? {
          endpoint: response.payload.redmine.endpoint,
          ...response.payload.settings
        }
        : undefined;

      resolve({
        success: response.success,
        error: response.error,
        payload: settings
      });
    });
  });
};

const resetActiveSession = (): Promise<Response> => {
  const id = crypto.randomBytes(10).toString('hex');

  return new Promise((resolve) => {
    ipcRenderer.send('storage', JSON.stringify({ action: StorageAction.RESET, id }));

    ipcRenderer.once(`storage:${id}`, (event, response) => {
      console.log('storage:reset', response);
      resolve(response);
    });
  });
};

export {
  saveActiveSession,
  getSession,
  resetActiveSession
};
