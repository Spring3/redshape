import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';

import AboutPage from './AboutPage';
import theme from '../theme';

if (module.hot) {
  module.hot.accept();
}

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <AboutPage />
  </ThemeProvider>,
  document.getElementById('root')
);
