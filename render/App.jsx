import React, { Component } from 'react';
import _debounce from 'lodash/debounce';
import { Route, Switch, Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import cleanStack from 'clean-stack';

import AppView from './views/AppView';
import LoginView from './views/LoginView';
import Notification from './components/Notification';

toast.configure({
  autoClose: 3000,
  position: 'bottom-right',
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true
});

export default class Routes extends Component {
  constructor(props) {
    super(props);

    this.errorHandler = _debounce(this.handleError, 200);
    this.rejectionHandler = _debounce(this.handleRejection, 200);
  }

  handleError = (event) => {
    event.preventDefault();
    if (event.error) {
      event.error.stack = cleanStack(event.error.stack);
    }
    toast.error(<Notification error={event.error} />);
  }

  handleRejection = (event) => {
    event.preventDefault();
    if (event.reason) {
      event.reason.stack = cleanStack(event.reason.stack);
    }
    toast.error(<Notification error={event.reason} />);
  }

  componentWillMount() {
    window.addEventListener('error', this.errorHandler);
    window.addEventListener('unhandledrejection', this.rejectionHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.errorHandler);
    window.removeEventListener('unhandledrejection', this.rejectionHandler);
  }

  render() {
    return (
      <Switch>
        <Route path="/" exact component={props => <LoginView {...props} />} />
        <Route path="/app" component={props => <AppView {...props} />} />
        <Redirect to="/app" />
      </Switch>
    );
  }
}
