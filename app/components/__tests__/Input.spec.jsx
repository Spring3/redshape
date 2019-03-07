import React from 'react';
import { render, cleanup, fireEvent } from 'react-testing-library';
import { Input, Labeled } from '../Input';

afterEach(cleanup);

describe('Input component', () => {
  it('should be text input by default', () => {
    const changeHandler = jest.fn();
    render(<Input onChange={changeHandler} />);
    const input = document.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
    expect(input.getAttribute('type')).toBe('text');
    expect(input.getAttribute('placeholder')).toBeFalsy();
    expect(input.getAttribute('id')).toBeFalsy();
    expect(input.getAttribute('name')).toBeFalsy();
    expect(input.getAttribute('value')).toBeFalsy();
  });

  it('should support different types', () => {
    const changeHandler = jest.fn();
    const { rerender } = render(<Input type="text" onChange={changeHandler} />);
    const input = document.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
    expect(input.getAttribute('type')).toBe('text');

    rerender(<Input type="email" onChange={changeHandler} />);
    expect(input.getAttribute('type')).toBe('email');

    rerender(<Input type="password" onChange={changeHandler} />);
    expect(input.getAttribute('type')).toBe('password');
  });

  it('should take the placeholder', () => {
    const changeHandler = jest.fn();
    const { getByPlaceholderText, rerender } = render(<Input placeholder="example text" onChange={changeHandler} />);
    const input = getByPlaceholderText('example text');
    expect(input).toBeTruthy();
    expect(input.getAttribute('placeholder')).toBe('example text');

    rerender(<Input placeholder="email@example.com" onChange={changeHandler} />);
    expect(input.getAttribute('placeholder')).toBe('email@example.com');
  });

  it('should set the name and id', () => {
    const changeHandler = jest.fn();
    const { rerender } = render(<Input name="test" id="id1" onChange={changeHandler} />);
    const input = document.querySelector('#id1');
    expect(input).toBeTruthy();
    expect(input.getAttribute('id')).toBe('id1');
    expect(input.getAttribute('name')).toBe('test');

    rerender(<Input name="another" id="id2" onChange={changeHandler} />);
    expect(input.getAttribute('id')).toBe('id2');
    expect(input.getAttribute('name')).toBe('another');
  });

  it('should set the value', () => {
    const changeHandler = jest.fn();
    const { rerender } = render(<Input value="email@example.com" onChange={changeHandler} />);
    const input = document.querySelector('input');
    expect(input).toBeTruthy();
    expect(input.getAttribute('value')).toBe('email@example.com');

    rerender(<Input value="test@example.com" onChange={changeHandler} />);
    expect(input.getAttribute('value')).toBe('test@example.com');
  });

  it('should call the onChange handler when the value is typed', () => {
    const changeHandler = jest.fn().mockImplementation((event) => {
      expect(event).toBeTruthy();
      expect(event.target.value).toBe('test');
    });
    render(<Input onChange={changeHandler} />);
    const input = document.querySelector('input');
    expect(input).toBeTruthy();
    fireEvent.change(input, { target: { value: 'test' } });
    expect(changeHandler).toHaveBeenCalledTimes(1);
  });

  it('should call the onBlur handler', () => {
    const changeHandler = jest.fn();
    const blurHandler = jest.fn();
    render(<Input onChange={changeHandler} onBlur={blurHandler} />);
    const input = document.querySelector('input');
    expect(input).toBeTruthy();
    fireEvent.blur(input);
    expect(blurHandler).toHaveBeenCalledTimes(1);
  });

  it('should wrap the input with label', () => {
    const changeHandler = jest.fn();
    render(
      <Labeled htmlFor="username" label="Username">
        <Input name="username" onChange={changeHandler} />
      </Labeled>
    );
    const formGroup = document.querySelectorAll('.form-group');
    expect(formGroup.length).toBe(1);
    const item = formGroup[0];
    expect(item.classList.contains('form-group')).toBeTruthy();
    expect(item.firstChild.nodeName).toBe('H4');
    const h4 = item.firstChild;
    expect(h4.innerHTML).toBe('Username');
    expect(h4.getAttribute('for')).toBe('username');
    expect(item.lastChild.nodeName).toBe('INPUT');
    expect(item.lastChild.getAttribute('name')).toBe('username');
  });
});
