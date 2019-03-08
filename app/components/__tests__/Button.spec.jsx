import React from 'react';
import { render, cleanup, fireEvent } from 'react-testing-library';
import Button from '../Button';

afterEach(cleanup);

describe('Button Component', () => {
  it('should render the given value as text', () => {
    const { getByText } = render(<Button>Submit</Button>);
    const button = getByText('Submit');
    expect(button).toBeTruthy();
    expect(button.getAttribute('type')).toBe('button');
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveStyleRule('width', 'auto');
  });

  it('should be of differnt types', () => {
    const { getByText, rerender } = render(<Button type="submit">Submit</Button>);
    const button = getByText('Submit');
    expect(button).toBeTruthy();
    expect(button.getAttribute('type')).toBe('submit');
    rerender(<Button type="button">Submit</Button>);
    expect(button.getAttribute('type')).toBe('button');
  });

  it('should click the given function', () => {
    const clickHandler = jest.fn();
    const { getByText } = render(<Button onClick={clickHandler}>Click me</Button>);
    const button = getByText('Click me');
    expect(button).toBeTruthy();
    fireEvent(button, new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    }));
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });

  it('should become disabled by a disabled prop', () => {
    const clickHandler = jest.fn();
    const { getByText, rerender } = render(<Button onClick={clickHandler}>Click me</Button>);
    const button = getByText('Click me');

    expect(button).toBeTruthy();
    expect(button).not.toHaveAttribute('disabled');
    fireEvent(button, new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    }));
    expect(clickHandler).toHaveBeenCalled();
    clickHandler.mockReset();

    rerender(<Button disabled={true} onClick={clickHandler}>Click me</Button>);
    expect(button).toHaveAttribute('disabled');
    fireEvent(button, new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    }));
    expect(clickHandler).not.toHaveBeenCalled();
    clickHandler.mockRestore();
  });

  it('should be full width when set to be a block', () => {
    const { getByText, rerender } = render(<Button>Click me</Button>);
    const button = getByText('Click me');
    expect(button).toHaveStyleRule('width', 'auto');
    rerender(<Button block={true}>Click me</Button>);
    expect(button).toHaveStyleRule('width', '100%');
  });
});
