import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled, { withTheme } from 'styled-components';
import showdown from 'showdown';
import throttle from 'lodash/throttle';
import FormatBoldIcon from 'mdi-react/FormatBoldIcon';
import FormatItalicIcon from 'mdi-react/FormatItalicIcon';
import FormatUnderlineIcon from 'mdi-react/FormatUnderlineIcon';
import FormatStrikethroughIcon from 'mdi-react/FormatStrikethroughIcon';
import CodeTagsIcon from 'mdi-react/CodeTagsIcon';
import FormatHeader1Icon from 'mdi-react/FormatHeader1Icon';
import FormatHeader2Icon from 'mdi-react/FormatHeader2Icon';
import FormatHeader3Icon from 'mdi-react/FormatHeader3Icon';
import FormatListBulletedIcon from 'mdi-react/FormatListBulletedIcon';
import FormatListNumberedIcon from 'mdi-react/FormatListNumberedIcon';
import FormatQuoteCloseIcon from 'mdi-react/FormatQuoteCloseIcon';
import LinkVariantIcon from 'mdi-react/LinkVariantIcon';
import ImageOutlineIcon from 'mdi-react/ImageOutlineIcon';

import { openExternalUrl, xssFilter } from '../../modules/utils';

import TextArea from './TextArea';
import Button from './Button';

const MarkdownOptionsList = styled.ul`
  list-style-type: none;
  margin: 0px 0px 10px 0px;
  padding: 5px 0px;
  width: 100%;

  li:first-child {
    margin-left: 0;
  }

  li:last-child {
    float: right;
    margin-right: 0;
  }
`;

const MarkdownOption = styled.li`
  display: inline;
  margin-right: 10px;
  position: relative;
  cursor: pointer;

  span.tooltip {
    position: absolute;
    display: inline-block;
    width: 100px;
    border-radius: 3px;
    left: -40px;
    top: -35px;
    padding: 5px;
    background: ${props => props.theme.bg};
    color: ${props => props.theme.mainDark};
    text-align: center;
    font-size: 12px;
    opacity: 0;
    transition: opacity ease ${props => props.theme.transitionTime};
    box-shadow: 0px 2px 7px ${props => props.theme.minorText};
  }

  span.tooltip::after {
    content: ' ';
    position: absolute;
    top: 100%;
    left: 50px;
    border: 2px solid black;
    border-width: 5px;
    border-color: ${props => props.theme.bg} transparent transparent transparent;
  }

  &:hover {
    svg {
      color: ${props => props.theme.main} !important;
    }

    span.tooltip {
      opacity: 1;
    }
  }
`;

const ModifiedTextArea = styled(TextArea)`
  padding: 10px;
  border-radius: 3px;
  outline: none;
  border: 1px solid ${props => props.theme.minorText};

  &:hover {
    border-color: ${props => props.theme.main};
  }

  &:focus {
    border: 2px solid ${props => props.theme.main};
  }
`;

const converter = new showdown.Converter({
  strikethrough: true,
  tables: true,
  tasklists: true,
  smoothLivePreview: true,
  disableForced4SpacesIndentedSublists: true,
  simpleLineBreaks: true,
  emoji: true,
  simplifiedAutoLink: true
});

const KEY_ENTER = 13;

class MarkdownEditor extends PureComponent {
  constructor (props) {
    super(props);

    this.state = {
      value: props.initialValue,
      showPreview: props.preview
    };

    this.textareaRef = React.createRef();
  }

  componentDidUpdate(oldProps, oldState) {
    if (this.props.initialValue !== oldProps.initialValue) {
      this.setState({
        value: this.props.initialValue
      });
    }

    if (oldState.value !== this.state.value
      || ((oldState.showPreview !== this.state.showPreview) && !this.state.showPreview)) {
      this.adjustTextAreaHeight();
    }
  }

  componentDidMount() {
    this.adjustTextAreaHeight();
  }

  applyMarkdown = (symbolStart, symbolEnd) => {
    const { onChange } = this.props;
    const textarea = this.textareaRef.current;
    const currentValue = this.state.value;
    let newValue;
    if (textarea.selectionStart === textarea.selectionEnd) {
      newValue = `${currentValue.substring(0, textarea.selectionStart)}${symbolStart}${symbolEnd}${currentValue.substring(textarea.selectionStart)}`;
      this.setState({
        value: newValue 
      });
      onChange(newValue);
    } else {
      newValue = `${currentValue.substring(0, textarea.selectionStart)}${symbolStart}${currentValue.substring(textarea.selectionStart, textarea.selectionEnd)}${symbolEnd}${currentValue.substring(textarea.selectionEnd)}`;
      this.setState({
        value: newValue
      });
      onChange(newValue);
    }
  }

  makeBold = () => {
    this.applyMarkdown('**', '**');
  }

  makeItalic = () => {
    this.applyMarkdown('*', '*');
  }

  makeUnderlined = () => {
    this.applyMarkdown('_', '_');
  }

  makeStrikethrough = () => {
    this.applyMarkdown('~~', '~~');
  }
  
  makeCode = () => {
    this.applyMarkdown('\r\n```\r\n', '\r\n```\r\n');
  }

  makeh1 = () => {
    this.applyMarkdown('# ', '');
  }

  makeh2 = () => {
    this.applyMarkdown('## ', '');
  }

  makeh3 = () => {
    this.applyMarkdown('### ', '');
  }

  makeBulletedList = () => {
    this.applyMarkdown('- ', '');
  }

  makeNumberedList = () => {
    this.applyMarkdown('1. ', '');
  }

  makeQuote = () => {
    this.applyMarkdown('> ', '');
  }

  makeLink = () => {
    this.applyMarkdown('[', '](url)');
  }

  makeImage = () => {
    this.applyMarkdown('![', '](image-url)');
  }

  adjustTextAreaHeight = () => {
    const element = this.textareaRef.current;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight + 5}px`;
  }

  onTextAreaTyped = (e) => {
    this.setState({
      value: e.target.value
    });
    const { onChange } = this.props;
    if (onChange) {
      onChange(e.target.value);
    }
  }

  togglePreview = () => {
    this.setState({
      showPreview: !this.state.showPreview
    });
  }

  onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.keyCode === KEY_ENTER) {
      const { onSubmit } = this.props;
      if (onSubmit) {
        onSubmit(xssFilter(this.state.value));
        this.setState({
          value: undefined
        });
      }
    }
  }


  // https://github.com/showdownjs/showdown/wiki/Showdown's-Markdown-syntax
  render() {
    const { className, id } = this.props;
    const { value, showPreview } = this.state;
    return (
      <div
        className={className}
        id={id}
      >
        <MarkdownOptionsList>
          <MarkdownOption onClick={this.makeBold}>
            <FormatBoldIcon />
            <span className="tooltip">Bold text</span>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeItalic}>
            <FormatItalicIcon />
            <span className="tooltip">Italic text</span>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeUnderlined}>
            <FormatUnderlineIcon />
            <span className="tooltip">Underlined text</span>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeStrikethrough}>
            <FormatStrikethroughIcon />
            <span className="tooltip">Crossed out text</span>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeCode}>
            <CodeTagsIcon />
            <span className="tooltip">Code block</span>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeh1}>
            <FormatHeader1Icon />
            <span className="tooltip">XL Header</span>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeh2}>
            <FormatHeader2Icon />
            <span className="tooltip">L Header</span>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeh3}>
            <FormatHeader3Icon />
            <span className="tooltip">M Header</span>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeBulletedList}>
            <FormatListBulletedIcon />
            <span className="tooltip">Bulleted List</span>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeNumberedList}>
            <FormatListNumberedIcon />
            <span className="tooltip">Ordered List</span>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeQuote}>
            <FormatQuoteCloseIcon />
            <span className="tooltip">Quote block</span>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeLink}>
            <LinkVariantIcon />
            <span className="tooltip">Hyperlink</span>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeImage}>
            <ImageOutlineIcon />
            <span className="tooltip">Embeded Image</span>
          </MarkdownOption>
          <MarkdownOption>
            <Button onClick={this.togglePreview}>
              Preview
            </Button>
          </MarkdownOption>
        </MarkdownOptionsList>
        { showPreview
          ? (
            <MarkdownText markdownText={value} />
          )
          : (
            <ModifiedTextArea
              ref={this.textareaRef}
              onChange={this.onTextAreaTyped}
              onKeyDown={this.onKeyDown}
              value={value}
            />
          )
        }
      </div>
    );
  }
}

MarkdownEditor.propTypes = {
  onChange: PropTypes.func,
  className: PropTypes.string,
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  initialValue: PropTypes.string,
  preview: PropTypes.bool,
  onSubmit: PropTypes.func
};

MarkdownEditor.defaultProps = {
  className: undefined,
  id: undefined,
  initialValue: '',
  preview: false
};

const Iframe = styled.iframe`
  box-sizing: border-box;
  overflow: hidden;
`;

class MarkdownText extends PureComponent {
  constructor(props) {
    super(props);
    this.iframeRef = React.createRef();

    const { theme } = props;
    this.genericStyles = `
      body {
        margin: 0;
        font-family: Roboto,-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,sans-serif;
        font-size: 14px;
        font-weight: 500;
        color: ${theme.normalText};
      }

      a {
        color: ${theme.main};
        font-size: 14px;
        padding: 2px;
        cursor: pointer;
      }

      a:hover {
        background: ${theme.main};
        color: ${theme.hoverText};
      }

      blockquote {
        border-left: 4px solid ${theme.mainLight};
        border-radius: 0px 3px 3px 0px;
        margin-left: 25px;
        padding: 3px 3px 3px 20px;
        background: ${theme.bg};
        color: ${theme.minorText};
      }

      p, pre {
        min-width: 100%;
        width: 0;
      }

      pre {
        white-space: pre-wrap;
        word-break: keep-all;
      }
    `;

    this.throttledAdjustIframeSize = throttle(this.adjustIframeSize, 300);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.throttledAdjustIframeSize);
  }

  interceptIframeRedirect = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openExternalUrl(e.target.href);
  }

  adjustIframeSize = () => {
    const iframe = this.iframeRef.current;
    if (iframe) {
      iframe.height = iframe.contentDocument.body.scrollHeight + 35;
    }
  }

  adjustIframe = () => {
    const iframe = this.iframeRef.current;
    if (iframe) {
      const css = document.createElement('style');
      css.type = 'text/css';
      css.innerText = this.genericStyles;
      iframe.contentDocument.head.appendChild(css);
      for (const elem of iframe.contentDocument.body.querySelectorAll(['a', 'img', 'button', 'input'])) {
        elem.removeEventListener('click', this.interceptIframeRedirect);
        elem.addEventListener('click', this.interceptIframeRedirect);
      }
      this.adjustIframeSize();
      window.addEventListener('resize', this.throttledAdjustIframeSize);
    }
  }

  render () {
    const { markdownText, className } = this.props;
    const markdown = xssFilter(converter.makeHtml(markdownText));
    return (
      <Iframe
        ref={this.iframeRef}
        className={className}
        frameBorder="0"
        width="100%"
        srcDoc={markdown}
        onLoad={this.adjustIframe}
      />
    );
  }
};

MarkdownText.propTypes = {
  markdownText: PropTypes.string,
  className: PropTypes.string
};

MarkdownText.defaultProps = {
  markdownText: undefined,
  className: undefined
};

MarkdownText = withTheme(MarkdownText);

export {
  MarkdownText
};

export default MarkdownEditor;
