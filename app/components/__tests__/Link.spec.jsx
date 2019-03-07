import React from 'react';
import { render, cleanup } from 'react-testing-library';
import Link from '../Link';

afterEach(cleanup);

describe('Link Component', () => {
  it('should render an hyperlink', () => {
    const { getByText } = render(<Link href="https://google.com">Google</Link>);
    const item = getByText('Google');
    expect(item).toBeTruthy();
    expect(item.getAttribute('href')).toBe('https://google.com');
    expect(item.innerHTML).toBe('Google');
  });
});
