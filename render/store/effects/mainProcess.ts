import { ipcRenderer, remote } from 'electron';
import { Response } from '../../../types';

const crypto = remote.require('crypto');

type MainProcessEventData = {
  payload: Record<string, any>;
  action: string;
}

type MainProcessEventTags = {
  reqEvent: string;
  resEvent: string;
}

const query = ({ reqEvent, resEvent }: MainProcessEventTags, payload: MainProcessEventData): Promise<Response> => {
  const id = crypto.randomBytes(10).toString('hex');

  return new Promise((resolve) => {
    ipcRenderer.send(reqEvent, JSON.stringify({ ...payload, id }));

    ipcRenderer.once(`${resEvent}:${id}`, (event, response) => {
      console.log(resEvent, response);
      resolve(response);
    });
  });
};

const request = (payload: MainProcessEventData) => query({ reqEvent: 'request', resEvent: 'response' }, payload);
const system = (payload: MainProcessEventData) => query({ reqEvent: 'system-request', resEvent: 'system-response' }, payload);
const session = (payload: MainProcessEventData) => query({ reqEvent: 'session-request', resEvent: 'session-response' }, payload);

export {
  request,
  system,
  session
};
