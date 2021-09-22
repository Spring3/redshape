import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';
import { Provider as OvermindProvider } from 'overmind-react';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import { createOvermind } from 'overmind';
import store from './reduxStore';
import theme from './theme';
import App from './App';
import { overmindStoreConfig } from './store/index';

if (module.hot) {
  module.hot.accept();
}

const overmindStore = createOvermind(overmindStoreConfig);

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <HashRouter>
        <OvermindProvider value={overmindStore}>
          <App dispatch={store.dispatch} />
        </OvermindProvider>
      </HashRouter>
    </Provider>
  </ThemeProvider>,
  document.getElementById('root')
);
