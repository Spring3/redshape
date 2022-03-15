import React, {
  createContext, ReactNode, useCallback, useContext, useState
} from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { ThemeProvider, useTheme } from 'styled-components';
import { Activity, TimeEntry } from '../../types';
import { ConfirmationModal, ConfirmationModalProps } from '../components/ConfirmationModal';
import { Portals } from '../components/Portal';
import { TimeEntryData, TimeEntryModal } from '../components/TimeEntryModal';

const ModalContext = createContext<ReturnType<typeof useModalContextApi>>({
  openConfirmationModal: () => Promise.resolve({ confirmed: false }),
  openCreateTimeEntryModal: () => Promise.resolve({ confirmed: false, timeEntryData: undefined }),
  openUpdateTimeEntryModal: () => Promise.resolve({ confirmed: false, timeEntryData: undefined }),
});

enum ModalTypes {
  CONFIRMATION = 'confirmation',
  TIME_ENTRY = 'time-entry'
}

type ActiveModal = {
  type: ModalTypes;
  resolve: (value: any) => void;
};

const useModalContextApi = () => {
  const [activeModal, setActiveModal] = useState<ActiveModal>();
  const theme = useTheme();

  const onConfirmationModalClose = (response = { confirm: false }) => {
    if (activeModal) {
      activeModal.resolve(response);
    }
  };

  const onTimeEntryModalClose = (response = { confirm: false }) => {
    if (activeModal) {
      activeModal.resolve(response);
    }
  };

  const resolveExistingModals = (response?: any) => {
    console.log('activeModal switch', activeModal);
    if (activeModal) {
      switch (activeModal.type) {
        case ModalTypes.CONFIRMATION:
          onConfirmationModalClose(response);
          break;
        case ModalTypes.TIME_ENTRY:
          onTimeEntryModalClose(response);
          break;
        default:
          break;
      }
    }
    setActiveModal(undefined);
    unmountComponentAtNode(document.getElementById(Portals.MODALS) as HTMLElement);
  };

  const openConfirmationModal = (
    props: Omit<ConfirmationModalProps, 'onClose'>
  ): Promise<{ confirmed: boolean }> => new Promise(resolve => {
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
            resolveExistingModals({ confirmed });
          }}
        />
      </ThemeProvider>,
      document.getElementById(Portals.MODALS),
      onRender
    );
  });

  const openCreateTimeEntryModal = ({
    activities
  }: {
    activities: Activity[];
  }) => new Promise<{ confirmed: boolean, timeEntryData?: TimeEntryData }>(resolve => {
    resolveExistingModals();
    const onRender = () => {
      setActiveModal({ type: ModalTypes.TIME_ENTRY, resolve });
    };

    render(
      <ThemeProvider theme={theme}>
        <TimeEntryModal
          activities={activities}
          onSubmit={(timeEntryData) => {
            resolve({ timeEntryData, confirmed: true });
          }}
          onClose={() => {
            resolveExistingModals({ confirmed: false });
          }}
        />
      </ThemeProvider>,
      document.getElementById(Portals.MODALS),
      onRender
    );
  });

  const openUpdateTimeEntryModal = ({
    activities,
    timeEntry
  }: {
    activities: Activity[];
    timeEntry: TimeEntry
  }) => new Promise<{ confirmed: boolean, timeEntryData?: TimeEntryData }>(resolve => {
    console.log('rendering');
    resolveExistingModals();
    const onRender = () => {
      console.log('onRender');
      setActiveModal({ type: ModalTypes.TIME_ENTRY, resolve });
    };

    render(
      <ThemeProvider theme={theme}>
        <TimeEntryModal
          timeEntry={timeEntry}
          activities={activities}
          onSubmit={(timeEntryData) => {
            resolve({ timeEntryData, confirmed: true });
          }}
          onClose={() => {
            resolveExistingModals({ confirmed: false });
          }}
        />
      </ThemeProvider>,
      document.getElementById(Portals.MODALS),
      onRender
    );
  });

  console.log('activeModal', activeModal);

  return {
    openConfirmationModal,
    openCreateTimeEntryModal,
    openUpdateTimeEntryModal
  };
};

type ModalContextProviderProps = {
  children: ReactNode;
};

const ModalContextProvider = ({ children }: ModalContextProviderProps) => {
  const value = useModalContextApi();
  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

const useModalContext = () => useContext(ModalContext);

export { ModalContextProvider, useModalContext };
