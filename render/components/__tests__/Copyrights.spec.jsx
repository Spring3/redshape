import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Copyrights from '../Copyrights';

describe('Copyrights Component', () => {
  it('should render the ref to the website', () => {
    const { queryByText, getByTestId } = render(<Copyrights />);
    expect(queryByText('Created by')).toBeDefined();
    const copyrightsLink = getByTestId('copyrights-link');
    expect(copyrightsLink).toBeInTheDOM();
    expect(copyrightsLink).toHaveAttribute('href', 'https://www.dvasylenko.com');
  });
});
