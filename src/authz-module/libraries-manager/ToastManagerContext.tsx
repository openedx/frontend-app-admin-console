import {
  createContext, useContext, useMemo, useState,
} from 'react';
import { Toast } from '@openedx/paragon';

type ToastManagerContextType = {
  handleShowToast: (message: string) => void;
  handleDiscardToast: () => void;
};

const ToastManagerContext = createContext<ToastManagerContextType | undefined>(undefined);

interface ToastManagerProviderProps {
  handleClose?: () => void
  children: React.ReactNode | React.ReactNode[];
}

export const ToastManagerProvider = ({ handleClose, children }: ToastManagerProviderProps) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleShowToast = (message: string) => {
    setToastMessage(message);
  };

  const handleDiscardToast = () => {
    setToastMessage(null);
  };

  const value = useMemo((): ToastManagerContextType => ({
    handleShowToast,
    handleDiscardToast,
  }), []);

  return (
    <ToastManagerContext.Provider value={value}>
      {children}

      {toastMessage && (
        <Toast
          onClose={() => {
            if (handleClose) { handleClose(); }
            setToastMessage(null);
          }}
          show={!!toastMessage}
        >
          {toastMessage}
        </Toast>
      )}
    </ToastManagerContext.Provider>
  );
};

export const useToastManager = (): ToastManagerContextType => {
  const context = useContext(ToastManagerContext);
  if (context === undefined) {
    throw new Error('useToastManager must be used within an ToastManagerProvider');
  }
  return context;
};
