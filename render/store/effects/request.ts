import { ipcRenderer, remote } from 'electron';
import { Response } from '../../../types';

const crypto = remote.require('crypto');

type Config = {
  endpoint: string;
  token?: string;
}

type QueryConfig = {
  payload: Record<string, any>;
  config?: Config;
}

const query = (config: QueryConfig): Promise<Response> => {
  const id = crypto.randomBytes(10).toString('hex');

  return new Promise((resolve) => {
    ipcRenderer.send('request', JSON.stringify({ ...config, id }));

    ipcRenderer.once(`response:${id}`, (event, response) => {
      console.log('response:', response);
      resolve(response);
    });
  });
};

export {
  query,
};

export type {
  QueryConfig
};
