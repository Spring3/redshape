import React from 'react';
import { render, cleanup, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ThemeProvider } from 'styled-components';
import MarkdownEditor, { MarkdownText } from '../MarkdownEditor';
import utils from '../../../common/utils';
import theme from '../../theme';

describe('MarkdownEditor component', () => {
  afterEach(cleanup);

  it('should display a menu and a text area', () => {
    const onChange = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <MarkdownEditor onChange={onChange} />
      </ThemeProvider>
    );
    expect(document.querySelector('ul')).toBeDefined();
    const textarea = document.querySelector('textarea');
    expect(textarea).toBeDefined();

    act(() => {
      fireEvent.change(textarea, { target: { value: 'test' }, persist: () => {} });
    });
    expect(textarea).toHaveValue('test');
    expect(onChange).toHaveBeenCalled();
    onChange.mockReset();

    const options = document.querySelectorAll('li');
    options.forEach((option) => {
      if (option.querySelector('.tooltip')) {
        fireEvent.click(option);
      }
    });

    let newLine;
    if (process.platform === 'darwin' || process.platform === 'linux') {
      newLine = '\n';
    } else {
      newLine = '\r\n';
    }

    // it does not update the caret position, so the markdown items during tests are prepended, not appended
    // in reality, the value will be 'test******__~~~~\n```\n\n```\n# ## ### - 1. > [](url)![](image-url)'
    // eslint-disable-next-line
    expect(textarea).toHaveValue('![](image-url)[](url)> 1. - ### ## # ' + newLine + '```' + newLine + newLine + '```' + newLine + '~~~~__******test');
  });

  it('should display the preview when such option was clicked', () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <MarkdownEditor initialValue="Lorem ipsum dolor" />
      </ThemeProvider>
    );
    const button = queryByText('Preview');
    expect(button).toBeDefined();
    act(() => {
      fireEvent.click(button.parentElement);
    });

    expect(document.querySelector('textarea')).toBeNull();
  });

  it('should submit and reset the state after it', () => {
    const onSubmit = jest.fn();
    const xssSpy = jest.spyOn(utils, 'xssFilter');
    render(
      <ThemeProvider theme={theme}>
        <MarkdownEditor initialValue="Lorem ipsum dolor" onSubmit={onSubmit} />
      </ThemeProvider>
    );

    const KEY_ENTER = 13;
    fireEvent.keyDown(document.querySelector('textarea'), { keyCode: KEY_ENTER, metaKey: true, ctrlKey: true });
    expect(onSubmit).toHaveBeenCalled();
    expect(xssSpy).toHaveBeenCalled();
  });

  it('should add a newline on macos if ctrl+enter was pressed', () => {
    render(
      <ThemeProvider theme={theme}>
        <MarkdownEditor initialValue="Lorem ipsum dolor" />
      </ThemeProvider>
    );

    const KEY_ENTER = 13;
    fireEvent.keyDown(document.querySelector('textarea'), { keyCode: KEY_ENTER, ctrlKey: true });
    expect(document.querySelector('textarea')).toHaveValue('\nLorem ipsum dolor');
  });
});

describe('MarkdownText component', () => {
  it('should apply xss filter to the output', () => {
    const xssSpy = jest.spyOn(utils, 'xssFilter');
    render(
      <MarkdownText theme={theme} markdownText="Hello <a href='javascript::alert(\'Hello\')' />" />
    );
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeDefined();
    expect(xssSpy).toHaveBeenCalled();
    expect(iframe.getAttribute('srcDoc').indexOf('javascript::alert(\'Hello\')')).toBe(-1); // eslint-disable-line
  });
});
