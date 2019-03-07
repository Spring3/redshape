import React from 'react';
import { render, cleanup } from 'react-testing-library';
import Copyrights from '../Copyrights';

afterEach(cleanup);

describe('Copyrights Component', () => {
  it('should display the link', () => {
    const { getByText } = render(<Copyrights />);
    const component = getByText('Created by');
    expect(component).toBeTruthy();
    const link = document.getElementsByTagName('a')[0];
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('https://github.com/Spring3');
    expect(link.innerHTML).toBe('Daniyil Vasylenko');
  });
});
