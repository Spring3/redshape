import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Button, { GhostButton } from '../Button';
import theme from '../../theme';

// using mount instead of shallow due to https://github.com/airbnb/enzyme/issues/1908

describe('Button Component', () => {
  afterEach(cleanup);

  it('should render the given value as text', () => {
    const { getByText } = render(
      <Button theme={theme}>Submit</Button>
    );
    const btn = getByText('Submit');
    expect(btn).toBeDefined();
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveAttribute('type', 'button');
    expect(btn).not.toHaveAttribute('disabled', true);
  });

  it('should be of differnt types', () => {
    render(
      <>
        <Button theme={theme} type="submit">Submit</Button>
        <Button theme={theme} type="button">Submit</Button>
      </>
    );
    const buttons = document.querySelectorAll('button');
    expect(buttons[0]).toHaveAttribute('type', 'submit');
    expect(buttons[1]).toHaveAttribute('type', 'button');
  });

  it('should click the given function', () => {
    const clickHandler = jest.fn();
    render(
      <Button theme={theme} onClick={clickHandler}>Click me</Button>
    );
    fireEvent.click(document.querySelector('button'));
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });

  it('should become disabled by a disabled prop', () => {
    const clickHandler = jest.fn();
    render(
      <Button theme={theme} disabled={true} onClick={clickHandler}>Click me</Button>
    );

    fireEvent.click(document.querySelector('button'));
    expect(clickHandler).not.toHaveBeenCalled();
    clickHandler.mockRestore();
  });

  it('should apply the given id', () => {
    const { getByText } = render(
      <Button id="test" theme={theme}>Click me</Button>
    );
    const button = getByText('Click me');
    expect(button).toHaveAttribute('id', 'test');
  });

  describe('Ghost button', () => {
    it('should be a link', async () => {
      const clickHandler = jest.fn();
      const { getByText } = render(
        <GhostButton
          theme={theme}
          onClick={clickHandler}
        >
          Click me
        </GhostButton>
      );
      const button = getByText('Click me');
      expect(button).toBeDefined();
      expect(button.tagName).toBe('A');
      expect(button).toHaveAttribute('href', '#');
      fireEvent.click(button);
      expect(clickHandler).toHaveBeenCalled();
    });

    it('should apply the given id', () => {
      const { getByText } = render(
        <GhostButton id="test">Click me</GhostButton>
      );
      const button = getByText('Click me');
      expect(button).toHaveAttribute('id', 'test');
    });

    it('should become disabled', () => {
      const clickHandler = jest.fn();
      const { getByText } = render(
        <GhostButton
          disabled={true}
          theme={theme}
          onClick={clickHandler}
        >
          Click me
        </GhostButton>
      );
      const button = getByText('Click me');
      fireEvent.click(button);
      expect(clickHandler).not.toHaveBeenCalled();
    });
  });
});
