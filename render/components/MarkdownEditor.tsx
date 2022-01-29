import React, {
  useState, useEffect, createRef, useCallback, FocusEventHandler, KeyboardEventHandler
} from 'react';
import { useTheme } from 'styled-components';
import showdown from 'showdown';
import throttle from 'lodash/throttle';
// eslint-disable-next-line
import { remote } from 'electron';

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
import xss from 'xss';

import { css } from '@emotion/react';
import { TextArea } from './TextArea';
import { GhostButton } from './GhostButton';
import Tooltip from './Tooltip';
import { Iframe } from './Iframe';
import { theme as Theme } from '../theme';

const styles = {
  markdownOptionsList: css`
    list-style-type: none;
    margin: 0px 0px 10px 0px;
    padding: 5px 0px;
    width: 100%;
  `,
  markdownOptionFirst: css`
    margin-left: 0;
  `,
  markdownOptionLast: css`
    bottom: 1px;
    a {
      display: flex;
      align-items: center;
    }
  `,
  listItemLast: css`
    float: right;
    margin-right: 0;
  `
};

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

type MarkdownEditorProps = {
  initialValue?: string;
  preview?: boolean;
  className?: string;
  id?: string;
  name: string;
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  disabled?: boolean;
  maxLength?: number;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
}

const MarkdownEditor = ({
  initialValue = '', preview = false, className, id, name, onBlur, disabled, maxLength, onChange, onSubmit
}: MarkdownEditorProps) => {
  const [value, setValue] = useState(initialValue);
  const [showPreview, setPreview] = useState(preview);

  const textAreaRef = createRef<HTMLTextAreaElement>();
  const theme = useTheme() as typeof Theme;

  const markdownOptionStyles = css`
    display: inline;
    margin-right: 10px;
    position: relative;
    cursor: pointer;

    &:hover {
      svg {
        color: ${theme.main} !important;
      }
    }
  `;

  const throttledAdjustTextAreaHeight = useCallback(throttle(() => {
    const element = textAreaRef.current;
    if (element) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight + 5}px`;
    }
  }, 150), []);

  useEffect(() => () => {
    throttledAdjustTextAreaHeight();
  }, []);

  useEffect(() => {
    if (!showPreview) {
      throttledAdjustTextAreaHeight();
    }
  }, [showPreview]);

  const applyMarkdown = (symbolStart: string, symbolEnd = '') => {
    const textArea = textAreaRef.current;

    if (disabled || !textArea) {
      return;
    }

    let newValue: string;
    if (textArea.selectionStart === textArea.selectionEnd) {
      // eslint-disable-next-line max-len
      newValue = `${value.substring(
        0,
        textArea.selectionStart
      )}${symbolStart}${symbolEnd}${value.substring(textArea.selectionStart)}`;
    } else {
      // eslint-disable-next-line max-len
      newValue = `${value.substring(0, textArea.selectionStart)}${symbolStart}${value.substring(
        textArea.selectionStart,
        textArea.selectionEnd
      )}${symbolEnd}${value.substring(textArea.selectionEnd)}`;
    }

    setValue(newValue);

    if (onChange) {
      onChange(newValue);
    }
  };

  const makeBold = () => {
    applyMarkdown('**', '**');
  };

  const makeItalic = () => {
    applyMarkdown('*', '*');
  };

  const makeUnderlined = () => {
    applyMarkdown('_', '_');
  };

  const makeStrikethrough = () => {
    applyMarkdown('~~', '~~');
  };

  const makeCode = () => {
    applyMarkdown('\r\n```\r\n', '\r\n```\r\n');
  };

  const makeh1 = () => {
    applyMarkdown('# ');
  };

  const makeh2 = () => {
    applyMarkdown('## ');
  };

  const makeh3 = () => {
    applyMarkdown('### ');
  };

  const makeBulletedList = () => {
    applyMarkdown('- ');
  };

  const makeNumberedList = () => {
    applyMarkdown('1. ');
  };

  const makeQuote = () => {
    applyMarkdown('> ');
  };

  const makeLink = () => {
    applyMarkdown('[', '](url)');
  };

  const makeImage = () => {
    applyMarkdown('![', '](image-url)');
  };

  const onTextAreaTyped = (e) => {
    setValue(e.target.value);
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const togglePreview = () => {
    setPreview((showPreview) => !showPreview);
  };

  const onKeyDown = (e) => {
    if (remote.process.platform === 'darwin') {
      if (e.metaKey && e.keyCode === KEY_ENTER) {
        if (onSubmit) {
          onSubmit(xss(value));
        }
      } else if (e.ctrlKey && e.keyCode === KEY_ENTER) {
        applyMarkdown('\r\n');
      }
    } else if (e.ctrlKey && e.keyCode === KEY_ENTER) {
      if (onSubmit) {
        onSubmit(xss(value));
      }
    }
  };

  // https://github.com/showdownjs/showdown/wiki/Showdown's-Markdown-syntax

  return (
    <div className={className} id={id}>
      <ul css={styles.markdownOptionsList}>
        <li css={[styles.markdownOptionFirst, markdownOptionStyles]} onClick={makeBold}>
          <Tooltip text="Bold text">
            <FormatBoldIcon />
          </Tooltip>
        </li>
        <li css={markdownOptionStyles} onClick={makeItalic}>
          <Tooltip text="Italic text">
            <FormatItalicIcon />
          </Tooltip>
        </li>
        <li css={markdownOptionStyles} onClick={makeUnderlined}>
          <Tooltip text="Underlined text">
            <FormatUnderlineIcon />
          </Tooltip>
        </li>
        <li css={markdownOptionStyles} onClick={makeStrikethrough}>
          <Tooltip text="Crossed out text">
            <FormatStrikethroughIcon />
          </Tooltip>
        </li>
        <li css={markdownOptionStyles} onClick={makeCode}>
          <Tooltip text="Code block">
            <CodeTagsIcon />
          </Tooltip>
        </li>
        <li css={markdownOptionStyles} onClick={makeh1}>
          <Tooltip text="XL Header">
            <FormatHeader1Icon />
          </Tooltip>
        </li>
        <li css={markdownOptionStyles} onClick={makeh2}>
          <Tooltip text="L Header">
            <FormatHeader2Icon />
          </Tooltip>
        </li>
        <li css={markdownOptionStyles} onClick={makeh3}>
          <Tooltip text="M Header">
            <FormatHeader3Icon />
          </Tooltip>
        </li>
        <li css={markdownOptionStyles} onClick={makeBulletedList}>
          <Tooltip text="Bulleted List">
            <FormatListBulletedIcon />
          </Tooltip>
        </li>
        <li css={markdownOptionStyles} onClick={makeNumberedList}>
          <Tooltip text="Ordered List">
            <FormatListNumberedIcon />
          </Tooltip>
        </li>
        <li css={markdownOptionStyles} onClick={makeQuote}>
          <Tooltip text="Quote block">
            <FormatQuoteCloseIcon />
          </Tooltip>
        </li>
        <li css={markdownOptionStyles} onClick={makeLink}>
          <Tooltip text="Hyperlink">
            <LinkVariantIcon />
          </Tooltip>
        </li>
        <li css={[markdownOptionStyles, styles.markdownOptionLast]} onClick={makeImage}>
          <Tooltip text="Embeded Image">
            <ImageOutlineIcon />
          </Tooltip>
        </li>
        <li css={[markdownOptionStyles, styles.listItemLast]}>
          <GhostButton onClick={togglePreview}>
            <CardBulletedOutlineIcon size={27} />
            <span>&nbsp;Preview</span>
          </GhostButton>
        </li>
      </ul>
      {showPreview ? (
        <MarkdownText name={name} markdownText={value} />
      ) : (
        <TextArea
          css={css`
              padding: 10px;
              border-radius: 3px;
              outline: none;
              border: 1px solid ${theme.minorText};
            
              &:hover {
                border-color: ${theme.main};
              }
            
              &:focus {
                border: 2px solid ${theme.main};
              }
            `}
          disabled={disabled}
          ref={textAreaRef}
          onChange={onTextAreaTyped}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          value={value}
          maxLength={maxLength}
        />
      )}
    </div>
  );
};

type MarkdownTextProps = {
  markdownText: string;
  name: string;
  className?: string;
}

const MarkdownText = ({ markdownText, name, className }: MarkdownTextProps) => {
  const theme = useTheme() as typeof Theme;

  const genericIframeStyles = `
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
        line-height: 2;
      }

      pre {
        white-space: pre-wrap;
        word-break: keep-all;
      }
    `;

  const markdown = xss(converter.makeHtml(markdownText));

  return (
    <Iframe
      className={className}
      width="100%"
      name={name}
      html={markdown}
      cssCode={genericIframeStyles}
    />
  );
};

export { MarkdownText, MarkdownEditor };
