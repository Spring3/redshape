import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter, Route, Switch } from 'react-router-dom';
import './index.css';
import AppView from './views/AppView';
import LoginView from './views/LoginView';
import store from './store';

if (module.hot) {
  module.hot.accept();
}

ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <Switch>
        <Route path="/" exact component={LoginView} />
        <Route path="/app" component={AppView} />
      </Switch>
    </HashRouter>
  </Provider>,
  document.getElementById('root')
);
