import React from 'react';
import ReactDOM from 'react-dom';
import { createHashHistory } from 'history';
import { HashRouter, Route, Switch } from 'react-router-dom';

import AppView from './views/AppView';
import LoginView from './views/LoginView';

const history = createHashHistory();

if (module.hot) {
  module.hot.accept();
}

ReactDOM.render(
  <HashRouter history={history}>
    <Switch>
      <Route path="/" exact component={LoginView} />
      <Route path="/app" component={AppView} />
    </Switch>
  </HashRouter>,
  document.getElementById('root')
);
