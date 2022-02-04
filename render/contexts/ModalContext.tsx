import React, {
  createContext, ReactNode, useContext, useState
} from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { ThemeProvider, useTheme } from 'styled-components';
import { ConfirmationModal, ConfirmationModalProps } from '../components/ConfirmationModal';
import { Portals } from '../components/Portal';

const ModalContext = createContext<ReturnType<typeof useModalContextApi>>({
  openConfirmationModal: () => Promise.resolve({ confirmed: false })
});

enum ModalTypes {
  CONFIRMATION = 'confirmation'
}

type ActiveModal = {
  type: ModalTypes;
  resolve: (value: any) => void;
}

const useModalContextApi = () => {
  const [activeModal, setActiveModal] = useState<ActiveModal>();
  const theme = useTheme();

  const onConfirmationModalClose = () => {
    if (activeModal) {
      activeModal.resolve({ confirmed: false });
    }
  };

  const resolveExistingModals = () => {
    if (activeModal) {
      if (activeModal.type === ModalTypes.CONFIRMATION) {
        onConfirmationModalClose();
      }
      setActiveModal(undefined);
      unmountComponentAtNode(document.getElementById(Portals.MODALS) as HTMLElement);
    }
  };

  const openConfirmationModal = (props: Omit<ConfirmationModalProps, 'onClose'>): Promise<{ confirmed: boolean }> => new Promise(
    (resolve) => {
      resolveExistingModals();
      const onRender = () => {
        setActiveModal({ type: ModalTypes.CONFIRMATION, resolve });
      };

      render(
        <ThemeProvider theme={theme}>
          <ConfirmationModal
            title={props.title}
            description={props.description}
            onClose={({ confirmed }) => {
              resolve({ confirmed });
              resolveExistingModals();
            }}
          />
        </ThemeProvider>,
        document.getElementById(Portals.MODALS),
        onRender
      );
    }
  );

  return {
    openConfirmationModal
  };
};

type ModalContextProviderProps = {
  children: ReactNode;
};

const ModalContextProvider = ({ children }: ModalContextProviderProps) => {
  const value = useModalContextApi();
  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

const useModalContext = () => useContext(ModalContext);

export {
  ModalContextProvider,
  useModalContext
};
