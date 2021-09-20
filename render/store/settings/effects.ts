import { ipcRenderer } from 'electron';
import { Context } from '../index';

// TODO: move into some proper file to store all these
const ipcChannel = 'storage';

enum StorageActions {
  READ = 'read',
  SAVE = 'save'
}

const save = (data: Context['state']['settings']) => {
  ipcRenderer.send(ipcChannel, {
    action: StorageActions.SAVE,
    data,
  });
};

const read = () => new Promise((resolve) => {
  ipcRenderer.send(ipcChannel, {
    action: StorageActions.READ,
  });

  ipcRenderer.once(
    ipcChannel,
    (event, data: Context['state']['settings']) => {
      resolve(data);
    }
  );
});

export { save, read };
