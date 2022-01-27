import { ipcRenderer, remote } from 'electron';
import { Response } from '../../../types';

const crypto = remote.require('crypto');

type SystemRequestEventPayload = {
  payload: Record<string, any>;
  action: 'open-url' | 'login' | 'logout';
}

type SessionRequestEventPayload = {
  payload: Record<string, any>;
  action: 'READ' | 'SAVE';
}

type MainProcessRequestEventPayoad = {
  payload: {
    route: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>,
    body?: Record<string, any>;
    query?: Record<string, any>;
  }
}

type MainProcessEventTags = {
  reqEvent: string;
  resEvent: string;
}

const query = <T>({ reqEvent, resEvent }: MainProcessEventTags, payload: T): Promise<Response> => {
  const id = crypto.randomBytes(10).toString('hex');

  return new Promise((resolve) => {
    console.log('sending', payload);
    ipcRenderer.send(reqEvent, JSON.stringify({ ...payload, id }));

    ipcRenderer.once(`${resEvent}:${id}`, (event, response) => {
      console.log(resEvent, response);
      resolve(response);
    });
  });
};

const request = (payload: MainProcessRequestEventPayoad) => query<MainProcessRequestEventPayoad>({ reqEvent: 'request', resEvent: 'response' }, payload);
const system = (payload: SystemRequestEventPayload) => query<SystemRequestEventPayload>({ reqEvent: 'system-request', resEvent: 'system-response' }, payload);
const session = (payload: SessionRequestEventPayload) => query<SessionRequestEventPayload>({ reqEvent: 'session-request', resEvent: 'session-response' }, payload);

export {
  request,
  system,
  session
};
