import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { ThemeProvider } from 'styled-components';
import { version } from '../../../package.json';

import AboutPage from '../AboutPage';
import theme from '../../theme';

describe('About page', () => {
  afterEach(cleanup);
  it('[tab1]', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <AboutPage />
      </ThemeProvider>
    );
    const tabs = document.querySelectorAll('li[role="tab"]');
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(document.querySelector('a[href="https://www.dvasylenko.com/redshape/"]')).toBeDefined();
    expect(getByText('Redshape')).toBeDefined();
    expect(getByText(`v${version}`)).toBeDefined();
    expect(getByText('Time tracker for Redmine')).toBeDefined();
    expect(document.querySelector('a[href="mailto:redshape.app@gmail.com"]')).toBeDefined();
  });

  it('[tab2]', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <AboutPage />
      </ThemeProvider>
    );
    const tabs = document.querySelectorAll('li[role="tab"]');
    fireEvent.click(tabs[1]);
    expect(getByText('GNU GENERAL PUBLIC LICENSE')).toBeDefined();
  });
});
