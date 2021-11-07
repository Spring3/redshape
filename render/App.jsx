import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { Route, Switch, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import cleanStack from 'clean-stack';
// eslint-disable-next-line
import { ipcRenderer } from "electron";

import AppView from './views/AppView';
import LoginView from './views/LoginView';
import Notification from './components/Notification';
import { useOvermindActions } from './store';
import { getStoredToken } from './helpers/utils';
import { LoadingOverlay } from './components/LoadingOverlay';

toast.configure({
  autoClose: 3000,
  position: 'bottom-right',
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
});

const Routes = ({ dispatch }) => {
  const [isReady, setIsReady] = useState(false);

  const actions = useOvermindActions();
  const history = useHistory();

  const handleRejection = useCallback(debounce((event) => {
    event.preventDefault();
    if (event.reason) {
      // eslint-disable-next-line
      event.reason.stack = cleanStack(event.reason.stack);
    }
    toast.error(<Notification error={event.reason} />);
  }, 200), []);

  const handleError = useCallback(debounce((event) => {
    event.preventDefault();
    if (event.error) {
      // eslint-disable-next-line
      event.error.stack = cleanStack(event.error.stack);
    }
    toast.error(<Notification error={event.error} />);
  }, 200), []);

  const settingsEventHandler = useCallback((event, { key, value }) => {
    switch (key) {
      case 'ADVANCED_TIMER_CONTROLS':
        dispatch(actions.settings.setAdvancedTimerControls(value));
        break;
      case 'PROGRESS_SLIDER_STEP_1':
        dispatch(actions.settings.setProgressWithStep1(value));
        break;
      case 'DISCARD_IDLE_TIME':
        dispatch(actions.settings.setDiscardIdleTime(value));
        break;
      case 'IDLE_BEHAVIOR':
        dispatch(actions.settings.setIdleBehavior(value));
        break;
      default:
        break;
    }
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    ipcRenderer.on('settings', settingsEventHandler);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      ipcRenderer.removeListener('settings', settingsEventHandler);
    };
  }, [handleError, handleRejection, settingsEventHandler]);

  useEffect(() => {
    const restoreLastSession = async () => {
      const response = await actions.settings.restore(getStoredToken());
      if (response.success) {
        history.replace('/app');
      }

      setIsReady(true);
    };

    restoreLastSession();
  }, []);

  if (!isReady) {
    return <LoadingOverlay />;
  }

  return (
    <Switch>
      <Route path="/" exact component={LoginView} />
      <Route path="/app" exact component={(props) => <AppView {...props} />} />
    </Switch>
  );
};

Routes.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default Routes;
