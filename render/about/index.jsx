import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';

import AboutPage from './AboutPage';
import { theme } from '../theme';

try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  require('electron-reloader')(module);
} catch (_e) { /* noop */ }

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <AboutPage />
  </ThemeProvider>,
  document.getElementById('root')
);
