import React, {
  useEffect, ReactNode, useMemo
} from 'react';
import ModalWindow from 'react-responsive-modal';
import { useTheme } from 'styled-components';
import { theme as Theme } from '../theme';

type ModalProps = {
  isShown?: boolean;
  children: ReactNode;
  onClose: () => void;

}

const Modal = ({ isShown = false, children, onClose } : ModalProps) => {
  const theme = useTheme() as typeof Theme;

  const modalStyles = useMemo(() => ({
    overlay: {
      background: 'rgba(55, 55, 55, 0.9)',
      zIndex: '98' // react-confirm-alert is 99
    },
    modal: {
      background: theme.bg,
      borderRadius: 3,
    }
  }), []);

  useEffect(() => {
    if (isShown) {
      const root = document.getElementById('root');
      if (root) {
        root.classList.add('react-confirm-alert-blur');
      }
    }

    return () => {
      const root = document.getElementById('root');
      if (root) {
        root.classList.remove('react-confirm-alert-blur');
      }
    };
  }, [isShown]);

  return (
    <ModalWindow
      open={isShown}
      styles={modalStyles}
      showCloseIcon={false}
      onClose={onClose}
      onEscKeyDown={onClose}
    >
      {children}
    </ModalWindow>
  );
};

export {
  Modal
};
