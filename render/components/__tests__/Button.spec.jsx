import React from 'react';
import { render, mount } from 'enzyme';
import * as reactTesting from 'react-testing-library';
import styled from 'styled-components';
import Button, { GhostButton } from '../Button';
import theme from '../../theme';

// using mount instead of shallow due to https://github.com/airbnb/enzyme/issues/1908

describe('Button Component', () => {
  afterEach(reactTesting.cleanup);

  it('should render the given value as text', () => {
    const wrapper = render(
      <Button theme={theme}>Submit</Button>
    );
    expect(wrapper.text()).toBe('Submit');
    expect(wrapper.attr('type')).toBe('button');
    expect(wrapper.attr('disabled')).not.toBeDefined();
  });

  it('should be of differnt types', () => {
    let wrapper = render(
      <Button theme={theme} type="submit">Submit</Button>
    );
    expect(wrapper.attr('type')).toBe('submit');
    wrapper = render(
      <Button theme={theme} type="button">Submit</Button>
    );
    expect(wrapper.attr('type')).toBe('button');
  });

  it('should click the given function', () => {
    const clickHandler = jest.fn();
    const wrapper = mount(
      <Button theme={theme} onClick={clickHandler}>Click me</Button>
    );
    wrapper.simulate('click');
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });

  it('should become disabled by a disabled prop', () => {
    const clickHandler = jest.fn();
    let wrapper = mount(
      <Button theme={theme} onClick={clickHandler}>Click me</Button>
    );
    wrapper.simulate('click');
    expect(wrapper.prop('disabled')).not.toBeDefined();
    expect(clickHandler).toHaveBeenCalled();
    clickHandler.mockReset();

    wrapper = mount(
      <Button theme={theme} disabled={true} onClick={clickHandler}>Click me</Button>
    );
    expect(wrapper.prop('disabled')).toBe(true);
    wrapper.simulate('click');
    expect(clickHandler).not.toHaveBeenCalled();
    clickHandler.mockRestore();
  });

  it('should be full width when set to be a block', () => {
    const { getByText, rerender } = reactTesting.render(<Button theme={theme}>Click me</Button>);
    const button = getByText('Click me');
    expect(button).toHaveStyleRule('width', 'auto');
    rerender(<Button block={true} theme={theme}>Click me</Button>);
    expect(button).toHaveStyleRule('width', '100%');
  });

  it('should support css overwriting', () => {
    const GreenButton = styled(Button)`
      color: green;
    `;
    const { getByText } = reactTesting.render(
      <div>
        <Button theme={theme}>Click me</Button>
        <GreenButton theme={theme}>Or better me</GreenButton>
      </div>
    );
    const redButton = getByText('Click me');
    const greenButton = getByText('Or better me');
    expect(redButton).toHaveStyleRule('color', '#FF7079');
    expect(greenButton).toHaveStyleRule('color', 'green');
  });

  it('should apply the given id', () => {
    const wrapper = render(
      <Button id="test" theme={theme}>Click me</Button>
    );
    expect(wrapper.prop('id')).toBe('test');
  });

  it('should apply the requested color palette', () => {
    const { getByText } = reactTesting.render(
      <div>
        <Button theme={theme}>Default</Button>
        <Button theme={theme} palette="success">Success</Button>
        <Button theme={theme} palette="warning">Warning</Button>
        <Button theme={theme} palette="danger">Danger</Button>
      </div>
    );
    const buttons = {
      main: getByText('Default'),
      green: getByText('Success'),
      yellow: getByText('Warning'),
      red: getByText('Danger')
    };

    Object.entries(buttons).forEach(([color, button]) => {
      expect(button).toBeTruthy();
      expect(button).toHaveStyleRule('color', theme[color]);
    });
  });

  describe('Ghost button', () => {
    it('should be a link', async () => {
      const clickHandler = jest.fn();
      const wrapper = mount(
        <GhostButton
          theme={theme}
          onClick={clickHandler}
        >
        Click me
        </GhostButton>
      );
      expect(wrapper.find('a')).toBeTruthy();
      expect(wrapper.find('a').prop('href')).toBe('#');
      wrapper.simulate('click');
      expect(clickHandler).toHaveBeenCalled();
    });

    it('should support css overwriting', () => {
      const YellowButton = styled(GhostButton)`
        color: yellow;
      `;
      const { getByText } = reactTesting.render(
        <div>
          <GhostButton theme={theme}>Click me</GhostButton>
          <YellowButton theme={theme}>Or better me</YellowButton>
        </div>
      );
      const ghostButton = getByText('Click me');
      const yellowButton = getByText('Or better me');
      expect(ghostButton).toHaveStyleRule('color', undefined);
      expect(yellowButton).toHaveStyleRule('color', 'yellow');
    });

    it('should apply the given id', () => {
      const wrapper = render(
        <GhostButton id="test">Click me</GhostButton>
      );
      expect(wrapper.attr('id')).toBe('test');
    });

    it('should become disabled', () => {
      const clickHandler = jest.fn();
      const wrapper = mount(
        <GhostButton
          disabled={true}
          theme={theme}
          onClick={clickHandler}
        >
        Click me
        </GhostButton>
      );
      expect(wrapper.find('a').prop('disabled')).toBe(true);
      wrapper.simulate('click');
      expect(clickHandler).not.toHaveBeenCalled();
    });
  });
});
