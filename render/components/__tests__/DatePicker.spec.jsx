import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import DatePicker from '../DatePicker';
import theme from '../../theme';

describe('Date Picker', () => {
  afterEach(cleanup);
  it('should render the date picker', () => {
    render(
      <DatePicker
        theme={theme}
        value={123456789}
        onChange={() => {}}
      />
    );
    const input = document.querySelector('input');
    expect(input).toHaveAttribute('value', '123456789');
  });
});
