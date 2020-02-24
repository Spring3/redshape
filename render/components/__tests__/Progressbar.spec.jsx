import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Progressbar from '../Progressbar';
import theme from '../../theme';


describe('Progressbar component', () => {
  afterEach(cleanup);
  it('should display the progressbar', () => {
    const { getByText } = render(
      <Progressbar percent={25} background="yellow" height={10} />
    );
    expect(getByText('25%')).toBeDefined();
  });

  it('should fallback in case infinite number was given as percentage', () => {
    const { getAllByText } = render(
      <div>
        <Progressbar theme={theme} percent={Infinity} />
        <Progressbar theme={theme} percent={NaN} />
      </div>
    );
    expect(getAllByText('0%')).toHaveLength(2);
  });

  it('should allow the height to be customized', () => {
    render(
      <Progressbar theme={theme} height={20} background="salmon" />
    );
    expect(document.querySelectorAll('div[height="20"]')).toHaveLength(2);
  });
});
