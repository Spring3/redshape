import { ipcRenderer, remote } from 'electron';
import type { Context } from 'overmind';
import { StorageAction } from '../../../types';

const crypto = remote.require('crypto');

const save = (data: Context['state']['settings']) => {
  const id = crypto.randomBytes(10).toString('hex');

  return new Promise((resolve) => {
    ipcRenderer.send('storage', JSON.stringify({ action: StorageAction.SAVE, payload: data, id }));

    ipcRenderer.once(`storage:${id}`, (event, response) => {
      console.log('storage:save', response);
      resolve(response);
    });
  });
};

type ReadArgs = {
  userId: string;
  endpoint: string;
};

const read = (payload: ReadArgs): Promise<Context['state']['settings']> => {
  const id = crypto.randomBytes(10).toString('hex');

  return new Promise((resolve) => {
    ipcRenderer.send('storage', JSON.stringify({ action: StorageAction.READ, payload, id }));

    ipcRenderer.once(`storage:${id}`, (event, response) => {
      console.log('storage:read', response);
      resolve(response);
    });
  });
};

export {
  save,
  read
};
