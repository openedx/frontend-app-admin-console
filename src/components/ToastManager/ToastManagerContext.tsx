import {
  createContext, useContext, useState, useMemo, useCallback, useEffect, useRef,
} from 'react';
import { logError, useIntl } from '@openedx/frontend-base';
import { Toast } from '@openedx/paragon';
import messages from '@src/authz-module/messages';
import { DEFAULT_TOAST_DELAY, RETRY_TOAST_DELAY } from '@src/authz-module/constants';
import { getHttpErrorStatus } from '@src/data/utils';

type ToastType = 'success' | 'error' | 'error-retry';

export const ERROR_TOAST_MAP: Record<number | string, { type: ToastType; messageId: string }> = {
  // Transient (retryable) server errors
  500: { type: 'error-retry', messageId: 'authz.team.toast.500.error.message' },
  502: { type: 'error-retry', messageId: 'authz.team.toast.502.error.message' },
  503: { type: 'error-retry', messageId: 'authz.team.toast.503.error.message' },
  408: { type: 'error-retry', messageId: 'authz.team.toast.408.error.message' },

  // Generic fallback error
  DEFAULT: { type: 'error-retry', messageId: 'authz.team.toast.default.error.message' },
};

export interface AppToast {
  id: string;
  message: string | React.ReactNode;
  type: ToastType;
  onRetry?: () => void;
  delay?: number;
}

const Bold = (chunks: React.ReactNode[]) => <b>{chunks}</b>;
const Br = () => <br />;

/**
 * Keeps a press on a toast from reaching the document, so an open modal or sheet does not
 * read it as a click on the page behind and close itself.
 *
 * Paragon renders toasts in a `#toast-root` appended to `body`, a sibling of the modal's
 * own portal, while `react-focus-on` watches `document` for `mousedown`/`touchstart`
 * outside the modal to fire its `onClickOutside`. It exempts nodes passed to it as
 * `shards`, but Paragon does not forward that prop, so the toast cannot be declared part
 * of the modal and every press on one counts as a press outside. In this app that would
 * discard the role wizard, which resets its form when it closes. Stopping propagation
 * here is enough because the toast is a React child of this container even though it is
 * portalled elsewhere in the DOM, so this runs before the event reaches `document`. Note
 * that it has to be `stopPropagation` and not `preventDefault`: the latter would also
 * suppress `react-focus-on`'s handler, but it would stop the toast's own buttons taking
 * focus when pressed.
 *
 * Workaround while Paragon settles how toasts should behave over modals and sheets:
 * https://github.com/openedx/paragon/issues/3654
 */
const stopPointerEventPropagation = (event: React.SyntheticEvent) => event.stopPropagation();

interface ToastManagerContextType {
  showToast: (toast: Omit<AppToast, 'id'>) => void;
  showErrorToast: (error: unknown, retryFn?: () => void) => void;
  Bold: (chunks: React.ReactNode[]) => JSX.Element;
  Br: () => JSX.Element;
}

const ToastManagerContext = createContext<ToastManagerContextType | undefined>(undefined);

interface ToastManagerProviderProps {
  children: React.ReactNode | React.ReactNode[];
}

export const ToastManagerProvider = ({ children }: ToastManagerProviderProps) => {
  const intl = useIntl();
  const [toasts, setToasts] = useState<(AppToast & { visible: boolean })[]>([]);
  const removalTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const showToast = useCallback((toast: Omit<AppToast, 'id'>) => {
    const id = `toast-notification-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const newToast = { ...toast, id, visible: true };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const discardToast = useCallback((id: string) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, visible: false } : t)));

    // If a removal is already pending for this id, don't stack another.
    if (removalTimers.current.has(id)) {
      return;
    }

    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      removalTimers.current.delete(id);
    }, DEFAULT_TOAST_DELAY);
    removalTimers.current.set(id, timer);
  }, []);

  // Clear any pending removal timers when the provider unmounts.
  useEffect(() => () => {
    removalTimers.current.forEach(clearTimeout);
  }, []);

  const value = useMemo<ToastManagerContextType>(() => {
    const showErrorToast = (error: unknown, retryFn?: () => void) => {
      logError(error as Error);
      const errorStatus = getHttpErrorStatus(error);
      const toastConfig = (errorStatus !== undefined && ERROR_TOAST_MAP[errorStatus]) || ERROR_TOAST_MAP.DEFAULT;
      const message = intl.formatMessage(messages[toastConfig.messageId], { Bold, Br });
      /**
       * For retryable errors, we set a longer delay to give users more time to read the message
       * and decide to retry, while for non-retryable errors we use the default delay.
       * Since current toast implementation does not allow disabling the autohide prop,
       * we use a longer delay for retryable errors to give users more time to read the message.
       */
      const delay = toastConfig.type === 'error-retry' && retryFn ? RETRY_TOAST_DELAY : DEFAULT_TOAST_DELAY;

      showToast({
        message,
        type: toastConfig.type,
        onRetry: toastConfig.type === 'error-retry' && retryFn ? retryFn : undefined,
        delay,
      });
    };

    return ({
      showToast,
      showErrorToast,
      Bold,
      Br,
    });
  }, [intl, showToast]);

  return (
    <ToastManagerContext.Provider value={value}>
      {children}

      <div
        className="toast-container"
        onMouseDown={stopPointerEventPropagation}
        onTouchStart={stopPointerEventPropagation}
      >
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            show={toast.visible}
            onClose={() => discardToast(toast.id)}
            delay={toast.delay ?? DEFAULT_TOAST_DELAY}
            action={toast.onRetry ? {
              onClick: () => {
                discardToast(toast.id);
                toast.onRetry?.();
              },
              label: intl.formatMessage(messages['authz.team.toast.retry.label']),
            } : undefined}
          >
            {toast.message as string}
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
