import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import { logError } from '@edx/frontend-platform/logging';
import { ToastManagerProvider, useToastManager } from './ToastManagerContext';

jest.mock('@edx/frontend-platform/logging');
const TestComponent = () => {
  const { showToast } = useToastManager();

  const handleShowToast = () => showToast({ message: 'Test toast message', type: 'error' });
  const handleShowAnotherToast = () => showToast({ message: 'Another message', type: 'success' });

  return (
    <div>
      <button type="button" onClick={handleShowToast}>Show Toast</button>
      <button type="button" onClick={handleShowAnotherToast}>Show Another Toast</button>
    </div>
  );
};

describe('ToastManagerContext', () => {
  describe('ToastManagerProvider', () => {
    it('does not show toast initially', () => {
      renderWrapper(
        <ToastManagerProvider>
          <TestComponent />
        </ToastManagerProvider>,
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows toast when showToast is called', async () => {
      const user = userEvent.setup();
      renderWrapper(
        <ToastManagerProvider>
          <TestComponent />
        </ToastManagerProvider>,
      );

      const showButton = screen.getByText('Show Toast');
      await user.click(showButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Test toast message')).toBeInTheDocument();
      });
    });

    it('adds multiple toasts when showToast is called multiple times', async () => {
      const user = userEvent.setup();
      renderWrapper(
        <ToastManagerProvider>
          <TestComponent />
        </ToastManagerProvider>,
      );

      const showButton = screen.getByText('Show Toast');
      const showAnotherButton = screen.getByText('Show Another Toast');

      await user.click(showButton);
      await user.click(showAnotherButton);

      await waitFor(() => {
        expect(screen.getByText('Test toast message')).toBeInTheDocument();
        expect(screen.getByText('Another message')).toBeInTheDocument();
      });
    });

    it('hides toast when close button is clicked', async () => {
      const user = userEvent.setup();
      renderWrapper(
        <ToastManagerProvider>
          <TestComponent />
        </ToastManagerProvider>,
      );

      const showButton = screen.getByText('Show Toast');
      await user.click(showButton);

      await waitFor(() => {
        expect(screen.getByText('Test toast message')).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText('Close');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      }, { timeout: 500 });
    });
  });

  describe('useToastManager hook', () => {
    it('throws error when used outside ToastManagerProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      const TestComponentWithoutProvider = () => {
        useToastManager();
        return <div>Test</div>;
      };

      expect(() => {
        renderWrapper(<TestComponentWithoutProvider />);
      }).toThrow('useToastManager must be used within a ToastManagerProvider');

      consoleSpy.mockRestore();
    });
  });

  it('calls retry function when retry button is clicked', async () => {
    const user = userEvent.setup();
    const retryFn = jest.fn();

    const ErrorTestComponent = () => {
      const { showErrorToast } = useToastManager();
      return (
        <button
          type="button"
          onClick={() => showErrorToast({ customAttributes: { httpErrorStatus: 500 } }, retryFn)}
        >Retry Error
        </button>
      );
    };

    renderWrapper(
      <ToastManagerProvider>
        <ErrorTestComponent />
      </ToastManagerProvider>,
    );

    await user.click(screen.getByText('Retry Error'));
    const retryButton = await screen.findByText('Retry');
    await user.click(retryButton);

    expect(logError).toHaveBeenCalled();
    expect(retryFn).toHaveBeenCalled();
  });

  it('respects custom delay when provided', async () => {
    const user = userEvent.setup();

    const DelayTestComponent = () => {
      const { showToast } = useToastManager();

      const handleShowToastWithDelay = () => showToast({
        message: 'Custom delay toast',
        type: 'success',
        delay: 1000, // Custom 1 second delay
      });

      return (
        <button type="button" onClick={handleShowToastWithDelay}>Show Toast With Custom Delay</button>
      );
    };

    renderWrapper(
      <ToastManagerProvider>
        <DelayTestComponent />
      </ToastManagerProvider>,
    );

    const showButton = screen.getByText('Show Toast With Custom Delay');
    await user.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('Custom delay toast')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Custom delay toast')).toBeInTheDocument();
    }, { timeout: 600 });

    // Toast should disappear after the custom delay (1000ms)
    await waitFor(() => {
      expect(screen.queryByText('Custom delay toast')).not.toBeInTheDocument();
    }, { timeout: 1200 });
  });

  it('uses default delay when delay prop is not provided', async () => {
    const user = userEvent.setup();

    const DefaultDelayTestComponent = () => {
      const { showToast } = useToastManager();

      const handleShowToastWithoutDelay = () => showToast({
        message: 'Default delay toast',
        type: 'success',
      // No delay prop provided
      });

      return (
        <button type="button" onClick={handleShowToastWithoutDelay}>Show Toast With Default Delay</button>
      );
    };

    renderWrapper(
      <ToastManagerProvider>
        <DefaultDelayTestComponent />
      </ToastManagerProvider>,
    );

    const showButton = screen.getByText('Show Toast With Default Delay');
    await user.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('Default delay toast')).toBeInTheDocument();
    });

    // DEFAULT_TOAST_DELAY is 5000ms
    await waitFor(() => {
      expect(screen.queryByText('Default delay toast')).not.toBeInTheDocument();
    }, { timeout: 5050 });
  }, 5100);

  it('uses longer delay for error toasts with retry functionality', async () => {
    const user = userEvent.setup();
    const retryFn = jest.fn();

    const RetryErrorDelayTestComponent = () => {
      const { showErrorToast } = useToastManager();

      const handleShowRetryErrorToast = () => showErrorToast(
        { customAttributes: { httpErrorStatus: 500 } },
        retryFn,
      );

      return (
        <button type="button" onClick={handleShowRetryErrorToast}>
          Show Retry Error Toast
        </button>
      );
    };

    renderWrapper(
      <ToastManagerProvider>
        <RetryErrorDelayTestComponent />
      </ToastManagerProvider>,
    );

    const showButton = screen.getByText('Show Retry Error Toast');
    await user.click(showButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    }, { timeout: 5050 });

    expect(logError).toHaveBeenCalled();
  });
});
