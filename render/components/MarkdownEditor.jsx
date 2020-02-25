import React, { PureComponent, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled, { css, withTheme } from 'styled-components';
import showdown from 'showdown';
import showdownHighlight from 'showdown-highlight';
import throttle from 'lodash/throttle';
import { remote } from 'electron';
import highlightStyles from '!!raw-loader!highlight.js/styles/default.css';

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
import CardBulletedOutlineIcon from 'mdi-react/CardBulletedOutlineIcon';
import CloseIcon from 'mdi-react/CloseIcon';
import { openExternalUrl, xssFilter } from '../../common/utils';

import { GhostButton } from './Button';
import Dialog from './Dialog';
import TextArea from './TextArea';
import Tooltip from './Tooltip';

import actions from '../actions';

const MarkdownOption = styled.li`
  display: inline;
  margin-right: 10px;
  position: relative;
  cursor: pointer;

  &:hover {
    svg {
      color: ${props => props.theme.main} !important;
    }
  }
`;

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
    display: flex;
    a:last-child {
      margin-left: 1rem;
    }
  }

  ${MarkdownOption}:last-child {
    bottom: 1px;
    a {
      display: flex;
      align-items: center;
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
  simplifiedAutoLink: true,
  ghCodeBlocks: true,
  extensions: [showdownHighlight]
});

const KEY_ENTER = 13;

class MarkdownEditor extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      value: props.initialValue,
      showPreview: props.preview
    };

    this.textareaRef = React.createRef();
    this.throttledAdjustTextAreaHeight = throttle(this.adjustTextAreaHeight, 150);
  }

  componentDidUpdate(oldProps, oldState) {
    if (this.props.initialValue !== oldProps.initialValue) {
      this.setState({ value: this.props.initialValue || '' });
    }

    if (oldState.value !== this.state.value
      || ((oldState.showPreview !== this.state.showPreview) && !this.state.showPreview)) {
      this.throttledAdjustTextAreaHeight();
    }
  }

  componentDidMount() {
    this.adjustTextAreaHeight();
  }

  applyMarkdown = (symbolStart, symbolEnd = '') => {
    const { onChange, isDisabled } = this.props;
    if (isDisabled) { return; }
    const textarea = this.textareaRef.current;
    const currentValue = this.state.value;
    let newValue;
    if (textarea.selectionStart === textarea.selectionEnd) {
      newValue = `${currentValue.substring(0, textarea.selectionStart)}${symbolStart}${symbolEnd}${currentValue.substring(textarea.selectionStart)}`;
    } else {
      newValue = `${currentValue.substring(0, textarea.selectionStart)}${symbolStart}${currentValue.substring(textarea.selectionStart, textarea.selectionEnd)}${symbolEnd}${currentValue.substring(textarea.selectionEnd)}`;
    }
    this.setState({
      value: newValue
    });
    if (onChange) {
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
    this.applyMarkdown('# ');
  }

  makeh2 = () => {
    this.applyMarkdown('## ');
  }

  makeh3 = () => {
    this.applyMarkdown('### ');
  }

  makeBulletedList = () => {
    this.applyMarkdown('- ');
  }

  makeNumberedList = () => {
    this.applyMarkdown('1. ');
  }

  makeQuote = () => {
    this.applyMarkdown('> ');
  }

  makeLink = () => {
    this.applyMarkdown('[', '](url)');
  }

  makeImage = () => {
    this.applyMarkdown('![', '](image-url)');
  }

  adjustTextAreaHeight = () => {
    const element = this.textareaRef.current;
    if (element) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight + 5}px`;
    }
  }

  onTextAreaTyped = (e) => {
    this.setState({ value: e.target.value });
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
    const { onSubmit } = this.props;
    let trySend = false;
    if (remote.process.platform === 'darwin') {
      if (e.metaKey && e.keyCode === KEY_ENTER) {
        trySend = true;
      } else if (e.ctrlKey && e.keyCode === KEY_ENTER) {
        this.applyMarkdown('\r\n');
      }
    } else if (e.ctrlKey && e.keyCode === KEY_ENTER) {
      trySend = true;
    }
    if (trySend && onSubmit) {
      const { value } = this.state;
      this.setState({
        value: ''
      });
      onSubmit(xssFilter(value));
    }
  }

  // https://github.com/showdownjs/showdown/wiki/Showdown's-Markdown-syntax
  render() {
    const {
      className, id, onBlur, onFocus, isDisabled, maxLength, editing, uiStyle
    } = this.props;
    const { value, showPreview } = this.state;
    const isEnhanced = uiStyle === 'enhanced';
    return (
      <div
        className={className}
        id={id}
      >
        <MarkdownOptionsList>
          <MarkdownOption onClick={this.makeBold}>
            <Tooltip text="Bold text">
              <FormatBoldIcon />
            </Tooltip>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeItalic}>
            <Tooltip text="Italic text">
              <FormatItalicIcon />
            </Tooltip>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeUnderlined}>
            <Tooltip text="Underlined text">
              <FormatUnderlineIcon />
            </Tooltip>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeStrikethrough}>
            <Tooltip text="Crossed out text">
              <FormatStrikethroughIcon />
            </Tooltip>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeCode}>
            <Tooltip text="Code block">
              <CodeTagsIcon />
            </Tooltip>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeh1}>
            <Tooltip text="XL Header">
              <FormatHeader1Icon />
            </Tooltip>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeh2}>
            <Tooltip text="L Header">
              <FormatHeader2Icon />
            </Tooltip>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeh3}>
            <Tooltip text="M Header">
              <FormatHeader3Icon />
            </Tooltip>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeBulletedList}>
            <Tooltip text="Bulleted List">
              <FormatListBulletedIcon />
            </Tooltip>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeNumberedList}>
            <Tooltip text="Ordered List">
              <FormatListNumberedIcon />
            </Tooltip>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeQuote}>
            <Tooltip text="Quote block">
              <FormatQuoteCloseIcon />
            </Tooltip>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeLink}>
            <Tooltip text="Hyperlink">
              <LinkVariantIcon />
            </Tooltip>
          </MarkdownOption>
          <MarkdownOption onClick={this.makeImage}>
            <Tooltip text="Embeded Image">
              <ImageOutlineIcon />
            </Tooltip>
          </MarkdownOption>
          <MarkdownOption>
            { editing && (
              <Dialog title="Please Confirm" message="Are you sure you want to delete the selected comment?">
                {
                  requestConfirmation => (
                    <GhostButton
                      onClick={requestConfirmation(() => this.props.onRemove(this.state.value))}
                    >
                      <CloseIcon size={27} />
                      <span>&nbsp;Remove</span>
                    </GhostButton>
                  )
                }
              </Dialog>
            )}
            <GhostButton onClick={this.togglePreview}>
              <CardBulletedOutlineIcon size={27} />
              { showPreview ? (<span>&nbsp;Edit</span>) : (<span>&nbsp;Preview</span>) }
            </GhostButton>
          </MarkdownOption>
        </MarkdownOptionsList>
        { showPreview
          ? (
            <MarkdownText className="framed" isEnhanced={isEnhanced} markdownText={value} />
          )
          : (
            <ModifiedTextArea
              disabled={isDisabled}
              ref={this.textareaRef}
              onChange={this.onTextAreaTyped}
              onKeyDown={this.onKeyDown}
              onBlur={onBlur}
              onFocus={onFocus}
              value={value}
              maxLength={maxLength}
            />
          )
        }
      </div>
    );
  }
}

MarkdownEditor.propTypes = {
  isDisabled: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  initialValue: PropTypes.string,
  maxLength: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  preview: PropTypes.bool,
  onSubmit: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  uiStyle: PropTypes.string.isRequired
};

MarkdownEditor.defaultProps = {
  isDisabled: false,
  className: undefined,
  maxLength: undefined,
  id: undefined,
  initialValue: '',
  preview: false,
  onBlur: undefined
};

const Iframe = styled.iframe`
  box-sizing: border-box;
  overflow: hidden;

  &.framed {
    ${props => props.isEnhanced && css`
    padding: 5px 20px 0px 20px;
    background: ${props => props.theme.bg};
    border: 1px solid ${props => props.theme.bgDarker};
    border-radius: 3px;
    min-height: 100px;
    `}
  }
`;

class MarkdownText extends PureComponent {
  constructor(props) {
    super(props);
    this.iframeRef = React.createRef();

    const { theme, isEnhanced } = props;
    this.genericStyles = `
      body {
        margin: 0;
        font-family: Roboto,-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,sans-serif;
        font-size: 14px;
        font-weight: 500;
        color: ${theme.normalText};
        word-break: break-word;
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
        line-height: 2;
      }

      pre {
        white-space: pre-wrap;
        // word-break: keep-all;
      }

      ${isEnhanced && css`
      code {
        background: #EEEEEE;
        border-radius: 3px;
        padding: 0 4px;
      }
      pre > code {
        background: initial;
        padding: initial;
        border-radius: initial;
        display: block;
        border-left: 3px solid #EEEEEE;
        padding-left: 6px;
      }

      ${highlightStyles}
      `}
    `;

    this.throttledAdjustIframeSize = throttle(this.adjustIframeSize, 300);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.throttledAdjustIframeSize);
  }

  interceptIframeRedirect = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openExternalUrl(e.target.getAttribute('href') || e.target.innerText);
  }

  interceptIframeHover = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.setStatusBar(e.target.getAttribute('href') || e.target.innerText);
  }

  interceptIframeHoverEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.setStatusBar();
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
        elem.removeEventListener('mouseenter', this.interceptIframeHover);
        elem.addEventListener('mouseenter', this.interceptIframeHover);
        elem.removeEventListener('mouseleave', this.interceptIframeHoverEnd);
        elem.addEventListener('mouseleave', this.interceptIframeHoverEnd);
      }
      this.adjustIframeSize();
      window.addEventListener('resize', this.throttledAdjustIframeSize);
    }
  }

  render() {
    const { markdownText, className, uiStyle } = this.props;
    const markdown = xssFilter(converter.makeHtml(markdownText));
    const isEnhanced = uiStyle === 'enhanced';
    return (
      <Iframe
        isEnhanced={isEnhanced}
        ref={this.iframeRef}
        className={className}
        frameBorder="0"
        width="100%"
        srcDoc={markdown}
        onLoad={this.adjustIframe}
      />
    );
  }
}

MarkdownText.propTypes = {
  markdownText: PropTypes.string,
  className: PropTypes.string,
  uiStyle: PropTypes.string.isRequired,
  setStatusBar: PropTypes.func.isRequired,
};

MarkdownText.defaultProps = {
  markdownText: undefined,
  className: undefined
};

let mapStateToProps = state => ({
  uiStyle: state.settings.uiStyle,
});

const mapDispatchToProps = dispatch => ({
  setStatusBar: value => dispatch(actions.session.setStatusBar(value))
});

MarkdownText = withTheme(connect(mapStateToProps, mapDispatchToProps)(MarkdownText));

export {
  MarkdownText
};

mapStateToProps = state => ({
  uiStyle: state.settings.uiStyle,
});

export default connect(mapStateToProps, null, null, { forwardRef: true })(MarkdownEditor);
