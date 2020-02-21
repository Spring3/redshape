import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Copyrights from '../Copyrights';

describe('Copyrights Component', () => {
  it('should match the snapshot', () => {
    const { queryByText, getByTestId } = render(<Copyrights />);
    expect(queryByText('Created by')).toBeInTheDOM();
    const copyrightsLink = getByTestId('copyrights-link');
    expect(copyrightsLink).toBeInTheDOM();
    expect(copyrightsLink).toHaveAttribute('href', 'https://www.dvasylenko.com');
  });
});
