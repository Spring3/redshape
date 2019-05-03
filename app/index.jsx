import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { HashRouter, Route, Switch } from 'react-router-dom';

import './index.css';
import AppView from './views/AppView';
import LoginView from './views/LoginView';
import store from './store';
import theme from './theme';

if (module.hot) {
  module.hot.accept();
}

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <HashRouter>
        <Switch>
          <Route path="/" exact component={LoginView} />
          <Route path="/app" component={AppView} />
        </Switch>
      </HashRouter>
    </Provider>
  </ThemeProvider>,
  document.getElementById('root')
);
