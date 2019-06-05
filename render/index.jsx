import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import store from './store';
import theme from './theme';
import App from './App';

if (module.hot) {
  module.hot.accept();
}

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
  </ThemeProvider>,
  document.getElementById('root')
);
