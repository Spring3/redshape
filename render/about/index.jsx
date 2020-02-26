import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';

import store from '../store';
import AboutPage from './AboutPage';
import theme from '../theme';

if (module.hot) {
  module.hot.accept();
}

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <AboutPage />
    </Provider>
  </ThemeProvider>,
  document.getElementById('root')
);
