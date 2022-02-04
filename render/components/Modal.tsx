import React, {
  ReactNode, useCallback, KeyboardEvent
} from 'react';
import { useTheme } from 'styled-components';
import { css } from '@emotion/react';
import ReactFocusLock from 'react-focus-lock';
import CloseIcon from 'mdi-react/CloseIcon';
import { theme as Theme } from '../theme';
import { Flex } from './Flex';
import { Portal } from './Portal';
import { GhostButton } from './GhostButton';

// eslint-disable-next-line no-shadow
enum ModalWidth {
  NARROW = '30%',
  DEFAULT = '50%',
  WIDE = '80%'
}

type ModalProps = {
  width?: ModalWidth;
  isOpen: boolean;
  title?: string;
  description?: string;
  children: ReactNode;
  closeIcon?: boolean;
  onClose: () => void;
}

const Modal = ({
  isOpen, width = ModalWidth.DEFAULT, description, children, onClose, title, closeIcon = true
} : ModalProps) => {
  const theme = useTheme() as typeof Theme;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  return (
    <Portal
      active={isOpen}
    >
      <ReactFocusLock>
        <Flex
          alignItems="center"
          justifyContent="center"
          css={css`
          background: rgba(55, 55, 55, 0.9);
          z-index: 98;
          position: absolute;
          
          top: ${window.scrollY};
          left: 0;
          right: 0;
          bottom: 0;
        `}
        >
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <div
            role="dialog"
            onKeyDown={handleKeyDown}
            css={css`
              background: ${theme.bg};
              border-radius: 3px;
              width: ${width};
              padding: 1.5rem 2rem;
            `}
          >
            <Flex direction="row-reverse" justifyContent="space-between">
              {closeIcon ? <GhostButton onClick={onClose}><CloseIcon color={theme.normalText} /></GhostButton> : null}
              {title ? <h2>{title}</h2> : null}
            </Flex>
            {description ? <div css={css`margin-bottom: 2rem;`}><p>{description}</p></div> : null}
            {children}
          </div>
        </Flex>
      </ReactFocusLock>
    </Portal>
  );
};

export {
  Modal
};
