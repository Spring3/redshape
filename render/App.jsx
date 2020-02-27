import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _debounce from 'lodash/debounce';
import { Route, Switch } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import cleanStack from 'clean-stack';

import AppView from './views/AppView';
import LoginView from './views/LoginView';
import Notification from './components/Notification';
import actions from './actions';

toast.configure({
  autoClose: 3000,
  position: 'bottom-right',
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true
});

class Routes extends Component {
  constructor(props) {
    super(props);

    this.errorHandler = _debounce(this.handleError, 200);
    this.rejectionHandler = _debounce(this.handleRejection, 200);
  }

  componentWillMount() {
    window.addEventListener('error', this.errorHandler);
    window.addEventListener('unhandledrejection', this.rejectionHandler);
    window.addEventListener('settings', this.settingsEventHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.errorHandler);
    window.removeEventListener('unhandledrejection', this.rejectionHandler);
    window.removeEventListener('settings', this.settingsEventHandler);
  }

  handleRejection = (event) => {
    event.preventDefault();
    if (event.reason) {
      // eslint-disable-next-line
      event.reason.stack = cleanStack(event.reason.stack);
    }
    toast.error(<Notification error={event.reason} />);
  }

  handleError = (event) => {
    event.preventDefault();
    if (event.error) {
      // eslint-disable-next-line
      event.error.stack = cleanStack(event.error.stack);
    }
    toast.error(<Notification error={event.error} />);
  }

  settingsEventHandler = (event, { key, value }) => {
    const { dispatch } = this.props;
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
  }

  render() {
    return (
      <Switch>
        <Route path="/" exact component={(props) => <LoginView {...props} />} />
        <Route path="/app" component={(props) => <AppView {...props} />} />
      </Switch>
    );
  }
}

Routes.propTypes = {
  dispatch: PropTypes.func.isRequired
};

export default Routes;
