import React from 'react';
import { render, cleanup, fireEvent, wait } from 'react-testing-library';
import Button, { GhostButton } from '../Button';
import styled from 'styled-components';

afterEach(cleanup);

describe('Button Component', () => {
  it('should render the given value as text', () => {
    const { getByText } = render(<Button>Submit</Button>);
    const button = getByText('Submit');
    expect(button).toBeTruthy();
    expect(button).not.toHaveStyleRule('id');
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

  it('should support css overwriting', () => {
    const GreenButton = styled(Button)`
      color: green;
    `;
    const { getByText } = render(
      <div>
        <Button>Click me</Button>
        <GreenButton>Or better me</GreenButton>
      </div>
    );
    const redButton = getByText('Click me');
    const greenButton = getByText('Or better me');
    expect(redButton).toHaveStyleRule('color', '#FF7079');
    expect(greenButton).toHaveStyleRule('color', 'green');
  });

  it('should apply the given id', () => {
    const { getByText } = render(
      <div>
        <Button id="test">Click me</Button>
      </div>
    );
    const button = getByText('Click me');
    expect(button.getAttribute('id')).toBe('test');
  });

  describe('Ghost button', () => {
    it('should be a link', async () => {
      const clickHandler = jest.fn();
      const { getByText } = render(<GhostButton onClick={clickHandler}>Click me</GhostButton>);
      const button = getByText('Click me');
      expect(button.tagName).toBe('A');
      expect(button.getAttribute('href')).toBe('#');
      fireEvent(button, new MouseEvent('click', {
        bubbles: true,
        cancelable: false
      }));
      expect(clickHandler).toHaveBeenCalled();
    });

    it('should support css overwriting', () => {
      const YellowButton = styled(GhostButton)`
      color: yellow;
    `;
      const { getByText } = render(
        <div>
          <GhostButton>Click me</GhostButton>
          <YellowButton>Or better me</YellowButton>
        </div>
      );
      const ghostButton = getByText('Click me');
      const yellowButton = getByText('Or better me');
      expect(ghostButton).toHaveStyleRule('color', undefined);
      expect(yellowButton).toHaveStyleRule('color', 'yellow');
    });

    it('should apply the given id', () => {
      const { getByText } = render(
        <div>
          <GhostButton id="test">Click me</GhostButton>
        </div>
      );
      const button = getByText('Click me');
      expect(button.getAttribute('id')).toBe('test');
    });
  });
});
