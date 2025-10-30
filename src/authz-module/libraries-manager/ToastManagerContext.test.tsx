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
});
