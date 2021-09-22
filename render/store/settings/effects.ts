import { ipcRenderer } from 'electron';
import type { Context } from 'overmind';
import type { State } from './state';

// TODO: move into some proper file to store all these
const ipcChannel = 'storage';

enum StorageAction {
  READ = 'READ',
  SAVE = 'SAVE'
}

type SettingsReadArgs = {
  userId: string;
  endpoint: string;
};

const save = (data: Context['state']['settings']) => {
  ipcRenderer.send(ipcChannel, {
    action: StorageAction.SAVE,
    data,
  });
};

const read = (payload: SettingsReadArgs): Promise<State> => new Promise((resolve) => {
  ipcRenderer.send(ipcChannel, {
    action: StorageAction.READ,
    payload
  });

  ipcRenderer.once(
    ipcChannel,
    (event, data: Context['state']['settings']) => {
      resolve(data);
    }
  );
});

export { save, read };
export type { SettingsReadArgs };
