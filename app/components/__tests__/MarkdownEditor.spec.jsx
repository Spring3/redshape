import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { ThemeProvider } from 'styled-components';
import MarkdownEditor, { MarkdownText } from '../MarkdownEditor';
import utils from '../../../modules/utils';
import theme from '../../theme';

describe('MarkdownEditor component', () => {
  it('should match the snapshot', () => {
    const tree = renderer.create(
      <ThemeProvider theme={theme}>
        <MarkdownEditor />
      </ThemeProvider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should display a menu and a text area', () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <ThemeProvider theme={theme}>
        <MarkdownEditor onChange={onChange} />
      </ThemeProvider>
    );
    expect(wrapper.find('ul')).toBeTruthy();
    expect(wrapper.find('textarea')).toBeTruthy();

    wrapper.find('textarea').simulate('change', { target: { value: 'test' }, persist: () => {} });
    wrapper.update();
    expect(wrapper.find('textarea').prop('value')).toBe('test');
    expect(wrapper.find(MarkdownEditor).state('value')).toBe('test');
    expect(onChange).toHaveBeenCalled();
    onChange.mockReset();

    const options = wrapper.find('li');
    options.forEach((option) => {
      if (option.exists('.tooltip')) {
        option.simulate('click');
      }
    });
    wrapper.update();
    // enzyme does not update the caret position, so the markdown items during tests are prepended, not appended
    // in reality, the value will be 'test******__~~~~\r\n```\r\n\r\n```\r\n# ## ### - 1. > [](url)![](image-url)'
    expect(wrapper.find('textarea').prop('value')).toBe('![](image-url)[](url)> 1. - ### ## # \r\n```\r\n\r\n```\r\n~~~~__******test');
  });

  it('should display the preview when such option was clicked', () => {
    const wrapper = mount(
      <ThemeProvider theme={theme}>
        <MarkdownEditor initialValue="Lorem ipsum dolor" />
      </ThemeProvider>
    );
    expect(wrapper.exists('button'));
    expect(wrapper.find(MarkdownEditor).state('showPreview')).toBe(false);
    wrapper.find('GhostButton').simulate('click');
    wrapper.update();
    expect(wrapper.find(MarkdownEditor).state('showPreview')).toBe(true);

    expect(wrapper.exists('textarea')).toBe(false);
    expect(wrapper.exists(MarkdownText)).toBe(true);
    expect(wrapper.find(MarkdownText).prop('markdownText')).toBe(wrapper.find(MarkdownEditor).state('value'));
  });

  it('should submit and reset the state after it', () => {
    const onSubmit = jest.fn();
    const xssSpy = jest.spyOn(utils, 'xssFilter');
    const wrapper = mount(
      <ThemeProvider theme={theme}>
        <MarkdownEditor initialValue="Lorem ipsum dolor" onSubmit={onSubmit} />
      </ThemeProvider>
    );

    const KEY_ENTER = 13;
    wrapper.find('textarea').simulate('keyDown', { keyCode: KEY_ENTER, metaKey: true, ctrlKey: true });
    wrapper.update();
    expect(onSubmit).toHaveBeenCalled();
    expect(xssSpy).toHaveBeenCalled();
    expect(wrapper.find(MarkdownEditor).state('value')).toBe('');
  });
});

describe('MarkdownText component', () => {
  it('should match the snapshot', () => {
    const tree = renderer.create(<MarkdownText theme={theme} markdownText="Lorem ipsum" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should apply xss filter to the output', () => {
    const xssSpy = jest.spyOn(utils, 'xssFilter');
    const wrapper = mount(
      <MarkdownText theme={theme} markdownText="Hello <a href='javascript::alert(\'Hello\')' />" />
    );
    expect(wrapper.exists('iframe'));
    expect(xssSpy).toHaveBeenCalled();
    expect(wrapper.find('iframe').prop('srcDoc').indexOf('javascript::alert(\'Hello\')')).toBe(-1); // eslint-disable-line
  });
});
