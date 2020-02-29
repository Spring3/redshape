import React from 'react';
import { toast } from 'react-toastify';

import Notification from '../components/Notification';

export default () => (next) => (action) => {
  if (action.status === 'NOK') {
    const error = action.data;
    if (error instanceof Error) {
      // eslint-disable-next-line react/jsx-filename-extension
      toast.error(<Notification error={error} />);
    }
  }
  next(action);
};
