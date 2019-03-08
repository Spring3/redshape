import React from 'react';
import { render, cleanup } from 'react-testing-library';
import ErrorMessage from '../ErrorMessage';

afterEach(cleanup);

describe('ErrorMessage component', () => {
  it('should not dispay it by default', () => {
    const { getByText } = render(<ErrorMessage>Error</ErrorMessage>);
    const error = getByText('Error');
    expect(error).toBeTruthy();
    expect(error).toHaveStyleRule('display', 'none');
  });

  it('should be displayed if show property is set to true', () => {
    const { getByText } = render(<ErrorMessage show={true}>Error</ErrorMessage>);
    const error = getByText('Error');
    expect(error).toBeTruthy();
    expect(error).toHaveStyleRule('display', 'inline-block');
  });
});
