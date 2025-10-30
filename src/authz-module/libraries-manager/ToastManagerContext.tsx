import {
  createContext, useContext, useState, useMemo,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Toast } from '@openedx/paragon';
import messages from './messages';

type ToastType = 'success' | 'error' | 'error-retry';

export const ERROR_TOAST_MAP: Record<number | string, { type: ToastType; messageId: string }> = {
  // Transient (retryable) server errors
  500: { type: 'error-retry', messageId: 'library.authz.team.toast.500.error.message' },
  502: { type: 'error-retry', messageId: 'library.authz.team.toast.502.error.message' },
  503: { type: 'error-retry', messageId: 'library.authz.team.toast.503.error.message' },
  408: { type: 'error-retry', messageId: 'library.authz.team.toast.408.error.message' },

  // Generic fallback error
  DEFAULT: { type: 'error-retry', messageId: 'library.authz.team.toast.default.error.message' },
};

interface AppToast {
  id: string;
  message: string;
  type: ToastType;
  onRetry?: () => void;
}

const Bold = (chunk: string) => <b>{chunk}</b>;
const Br = () => <br />;

type ToastManagerContextType = {
  showToast: (toast: Omit<AppToast, 'id'>) => void;
  showErrorToast: (error, retryFn?: () => void) => void;
  Bold: (chunk: string) => JSX.Element;
  Br: () => JSX.Element;
};

const ToastManagerContext = createContext<ToastManagerContextType | undefined>(undefined);

interface ToastManagerProviderProps {
  children: React.ReactNode | React.ReactNode[];
}

export const ToastManagerProvider = ({ children }: ToastManagerProviderProps) => {
  const intl = useIntl();
  const [toasts, setToasts] = useState<(AppToast & { visible: boolean })[]>([]);

  const showToast = (toast: Omit<AppToast, 'id'>) => {
    const id = `toast-notification-${Date.now()}`;
    const newToast = { ...toast, id, visible: true };
    setToasts(prev => [...prev, newToast]);
  };

  const discardToast = (id: string) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, visible: false } : t)));

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const value = useMemo<ToastManagerContextType>(() => {
    const showErrorToast = (error, retryFn?: () => void) => {
      logError(error);
      const errorStatus = error?.customAttributes?.httpErrorStatus;
      const toastConfig = ERROR_TOAST_MAP[errorStatus] || ERROR_TOAST_MAP.DEFAULT;
      const message = intl.formatMessage(messages[toastConfig.messageId], { Bold, Br });

      showToast({
        message,
        type: toastConfig.type,
        onRetry: toastConfig.type === 'error-retry' && retryFn ? retryFn : undefined,
      });
    };

    return ({
      showToast,
      showErrorToast,
      Bold,
      Br,
    });
  }, [intl]);

  return (
    <ToastManagerContext.Provider value={value}>
      {children}

      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            show={toast.visible}
            onClose={() => discardToast(toast.id)}
            action={toast.onRetry ? {
              onClick: () => {
                discardToast(toast.id);
                toast.onRetry?.();
              },
              label: intl.formatMessage(messages['library.authz.team.toast.retry.label']),
            } : undefined}
          >
            {toast.message}
          </Toast>
        ))}
      </div>
    </ToastManagerContext.Provider>
  );
};

export const useToastManager = (): ToastManagerContextType => {
  const context = useContext(ToastManagerContext);
  if (!context) {
    throw new Error('useToastManager must be used within a ToastManagerProvider');
  }
  return context;
};
