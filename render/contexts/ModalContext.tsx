import React, {
  createContext, ReactNode, useContext, useState
} from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { ThemeProvider, useTheme } from 'styled-components';
import { ConfirmationModal, ConfirmationModalProps } from '../components/ConfirmationModal';
import { CreateTimeEntryModal, CreateTimeEntryModalProps } from '../components/CreateTimeEntryModal';
import { Portals } from '../components/Portal';

const ModalContext = createContext<ReturnType<typeof useModalContextApi>>({
  openConfirmationModal: () => Promise.resolve({ confirmed: false }),
  openTimeEntryCreationModal: () => Promise.resolve({ timeEntryData: null })
});

enum ModalTypes {
  CONFIRMATION = 'confirmation',
  NEW_TIME_ENTRY = 'newTimeEntry'
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

  const onTimeEntryCreationClosed = () => {
    if (activeModal) {
      activeModal.resolve({ timeEntry: null });
    }
  };

  const resolveExistingModals = () => {
    if (activeModal) {
      switch (activeModal.type) {
        case ModalTypes.CONFIRMATION:
          onConfirmationModalClose();
          break;
        case ModalTypes.NEW_TIME_ENTRY:
          onTimeEntryCreationClosed();
          break;
        default:
          break;
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

  const openTimeEntryCreationModal = ({ activities, issue, user }: Omit<CreateTimeEntryModalProps, 'onClose'>) => new Promise((resolve) => {
    resolveExistingModals();
    const onRender = () => {
      setActiveModal({ type: ModalTypes.NEW_TIME_ENTRY, resolve });
    };

    render(
      <ThemeProvider theme={theme}>
        <CreateTimeEntryModal
          onClose={({ timeEntryData }) => {
            resolve({ timeEntryData });
            resolveExistingModals();
          }}
          activities={activities}
          issue={issue}
          user={user}
        />
      </ThemeProvider>,
      document.getElementById(Portals.MODALS),
      onRender
    );
  });

  return {
    openConfirmationModal,
    openTimeEntryCreationModal
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
