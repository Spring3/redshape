import React from 'react';
import { render, cleanup, fireEvent } from 'react-testing-library';
import styled from 'styled-components';
import { Input, Label } from '../Input';
import theme from '../../theme';

afterEach(cleanup);

describe('Input component', () => {
  it('should be text input by default', () => {
    const changeHandler = jest.fn();
    render(<Input theme={theme} onChange={changeHandler} />);
    const input = document.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
    expect(input.getAttribute('type')).toBe('text');
    expect(input.getAttribute('placeholder')).toBeFalsy();
    expect(input.getAttribute('id')).toBeFalsy();
    expect(input.getAttribute('name')).toBeFalsy();
    expect(input.getAttribute('value')).toBeFalsy();
    expect(input.hasAttribute('disabled')).toBe(false);
  });

  it('should support different types', () => {
    const changeHandler = jest.fn();
    const { rerender } = render(<Input type="text" onChange={changeHandler} />);
    const input = document.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
    expect(input.getAttribute('type')).toBe('text');

    rerender(<Input theme={theme} type="email" onChange={changeHandler} />);
    expect(input.getAttribute('type')).toBe('email');

    rerender(<Input theme={theme} type="password" onChange={changeHandler} />);
    expect(input.getAttribute('type')).toBe('password');

    rerender(<Input theme={theme} type="checkbox" onChange={changeHandler} />);
    expect(document.querySelector('input[type="checkbox"]')).toBeTruthy();

    rerender(<Input theme={theme} type="number" onChange={changeHandler} />);
    expect(document.querySelector('input[type="number"]')).toBeTruthy();
  });

  it('should take the placeholder', () => {
    const changeHandler = jest.fn();
    const { getByPlaceholderText, rerender } = render(
      <Input
        theme={theme}
        placeholder="example text"
        onChange={changeHandler}
      />
    );
    const input = getByPlaceholderText('example text');
    expect(input).toBeTruthy();
    expect(input.getAttribute('placeholder')).toBe('example text');

    rerender(
      <Input
        theme={theme}
        placeholder="email@example.com"
        onChange={changeHandler}
      />
    );
    expect(input.getAttribute('placeholder')).toBe('email@example.com');
  });

  it('should set the name and id', () => {
    const changeHandler = jest.fn();
    const { rerender } = render(
      <Input
        theme={theme}
        name="test"
        id="id1"
        onChange={changeHandler}
      />
    );
    const input = document.querySelector('#id1');
    expect(input).toBeTruthy();
    expect(input.getAttribute('id')).toBe('id1');
    expect(input.getAttribute('name')).toBe('test');

    rerender(
      <Input
        theme={theme}
        name="another"
        id="id2"
        onChange={changeHandler}
      />
    );
    expect(input.getAttribute('id')).toBe('id2');
    expect(input.getAttribute('name')).toBe('another');
  });

  it('should set the value', () => {
    const changeHandler = jest.fn();
    const { rerender } = render(
      <Input
        theme={theme}
        value="email@example.com"
        onChange={changeHandler}
      />
    );
    const input = document.querySelector('input');
    expect(input).toBeTruthy();
    expect(input.getAttribute('value')).toBe('email@example.com');

    rerender(
      <Input
        theme={theme}
        value="test@example.com"
        onChange={changeHandler}
      />
    );
    expect(input.getAttribute('value')).toBe('test@example.com');
  });

  it('should become disabled', async () => {
    const changeHandler = jest.fn();
    const { rerender } = render(
      <Input
        theme={theme}
        onChange={changeHandler}
      />
    );
    const input = document.querySelector('input');
    expect(input).toBeTruthy();
    expect(input.hasAttribute('disabled')).toBe(false);
    rerender(
      <Input
        theme={theme}
        disabled={true}
        onChange={changeHandler}
      />
    );
    expect(input.hasAttribute('disabled')).toBe(true);
  });

  it('should call the onChange handler when the value is typed', () => {
    const changeHandler = jest.fn().mockImplementation((event) => {
      expect(event).toBeTruthy();
      expect(event.target.value).toBe('test');
    });
    render(<Input theme={theme} onChange={changeHandler} />);
    const input = document.querySelector('input');
    expect(input).toBeTruthy();
    fireEvent.change(input, { target: { value: 'test' } });
    expect(changeHandler).toHaveBeenCalledTimes(1);
  });

  it('should call the onBlur handler', () => {
    const changeHandler = jest.fn();
    const blurHandler = jest.fn();
    render(<Input theme={theme} onChange={changeHandler} onBlur={blurHandler} />);
    const input = document.querySelector('input');
    expect(input).toBeTruthy();
    fireEvent.blur(input);
    expect(blurHandler).toHaveBeenCalledTimes(1);
  });

  describe('label', () => {
    it('should wrap the input with label', () => {
      const changeHandler = jest.fn();
      render(
        <Label theme={theme} htmlFor="username" label="Username">
          <Input theme={theme} name="username" onChange={changeHandler} />
        </Label>
      );
      const results = document.querySelectorAll('.form-group');
      expect(results.length).toBe(1);
      const wrapper = results[0];
      expect(wrapper.classList.contains('form-group')).toBeTruthy();
      expect(wrapper.firstChild.nodeName).toBe('H4');
      const h4 = wrapper.firstChild;
      expect(h4.innerHTML).toBe('Username');
      expect(h4.getAttribute('for')).toBe('username');
      expect(wrapper.lastChild.nodeName).toBe('INPUT');
      expect(wrapper.lastChild.getAttribute('name')).toBe('username');
    });

    it('should be displayed either inline or as block', () => {
      const { rerender } = render(
        <Label theme={theme} htmlFor="test" label="Test" inline={true}>
          <button type="button">Click me</button>
        </Label>
      );
      const results = document.querySelectorAll('.form-group');
      expect(results.length).toBe(1);
      const wrapper = results[0];
      const label = wrapper.firstChild;
      const input = wrapper.lastChild;
      expect(label.nodeName).toBe('LABEL');
      expect(input.nodeName).toBe('BUTTON');

      rerender(
        <Label theme={theme} htmlFor="test" label="Test" inline={false}>
          <button type="button">Click me</button>
        </Label>
      );

      expect(wrapper.firstChild.nodeName).toBe('H4');
      expect(wrapper.lastChild.nodeName).toBe('BUTTON');
    });

    it('should be displayed either left to right or right to left', () => {
      const { rerender } = render(
        <Label theme={theme} htmlFor="test" label="Test" rightToLeft={true}>
          <button type="button">Click me</button>
        </Label>
      );
      const results = document.querySelectorAll('.form-group');
      expect(results.length).toBe(1);
      const wrapper = results[0];
      expect(wrapper.firstChild.nodeName).toBe('BUTTON');
      expect(wrapper.lastChild.nodeName).toBe('H4');
      expect(wrapper.lastChild.innerHTML).toBe('Test');

      rerender(
        <Label theme={theme} htmlFor="test" label="Test" rightToLeft={false}>
          <button type="button">Click me</button>
        </Label>
      );

      expect(wrapper.firstChild.nodeName).toBe('H4');
      expect(wrapper.firstChild.innerHTML).toBe('Test');
      expect(wrapper.lastChild.nodeName).toBe('BUTTON');
    });
  });
});
