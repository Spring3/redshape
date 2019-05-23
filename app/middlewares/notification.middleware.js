import React from 'react';
import { toast } from 'react-toastify';

import Notification from '../components/Notification';

export default store => next => (action) => {
  if (action.status === 'NOK') {
    const error = action.data;
    if (error instanceof Error) {
      toast.error(<Notification error={error} />);
    }
  }
  next(action);
};
