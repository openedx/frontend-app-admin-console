import { screen, waitFor, render as rtlRender } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { ToastManagerProvider, useToastManager } from './ToastManagerContext';

const render = (ui: React.ReactElement) => rtlRender(
  <IntlProvider locale="en">
    {ui}
  </IntlProvider>,
);

const TestComponent = () => {
  const { handleShowToast, handleDiscardToast } = useToastManager();

  return (
    <div>
      <button type="button" onClick={() => handleShowToast('Test toast message')}>
        Show Toast
      </button>
      <button type="button" onClick={() => handleShowToast('Another message')}>
        Show Another Toast
      </button>
      <button type="button" onClick={handleDiscardToast}>
        Discard Toast
      </button>
    </div>
  );
};

describe('ToastManagerContext', () => {
  describe('ToastManagerProvider', () => {
    it('does not show toast initially', () => {
      render(
        <ToastManagerProvider>
          <TestComponent />
        </ToastManagerProvider>,
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows toast when handleShowToast is called', async () => {
      const user = userEvent.setup();
      render(
        <ToastManagerProvider>
          <TestComponent />
        </ToastManagerProvider>,
      );

      // handleShowToast is called on button click
      const showButton = screen.getByText('Show Toast');
      await user.click(showButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Test toast message')).toBeInTheDocument();
      });
    });

    it('updates toast message when handleShowToast is called with different message', async () => {
      const user = userEvent.setup();
      render(
        <ToastManagerProvider>
          <TestComponent />
        </ToastManagerProvider>,
      );

      // Show first toast
      const showButton = screen.getByText('Show Toast');
      await user.click(showButton);

      await waitFor(() => {
        expect(screen.getByText('Test toast message')).toBeInTheDocument();
      });

      // Show another toast
      const showAnotherButton = screen.getByText('Show Another Toast');
      await user.click(showAnotherButton);

      await waitFor(() => {
        expect(screen.getByText('Another message')).toBeInTheDocument();
        expect(screen.queryByText('Test toast message')).not.toBeInTheDocument();
      });
    });

    it('hides toast when handleDiscardToast is called', async () => {
      const user = userEvent.setup();
      render(
        <ToastManagerProvider>
          <TestComponent />
        </ToastManagerProvider>,
      );

      const showButton = screen.getByText('Show Toast');
      await user.click(showButton);

      await waitFor(() => {
        expect(screen.getByText('Test toast message')).toBeInTheDocument();
      });

      // handleDiscardToast is called on button click
      const discardButton = screen.getByText('Discard Toast');
      await user.click(discardButton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('hides toast when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
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
      });
    });

    it('calls handleClose callback when toast is closed', async () => {
      const user = userEvent.setup();
      const mockHandleClose = jest.fn();

      render(
        <ToastManagerProvider handleClose={mockHandleClose}>
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
        expect(mockHandleClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('useToastManager hook', () => {
    it('throws error when used outside ToastManagerProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const TestComponentWithoutProvider = () => {
        useToastManager();
        return <div>Test</div>;
      };

      expect(() => {
        render(<TestComponentWithoutProvider />);
      }).toThrow('useToastManager must be used within an ToastManagerProvider');

      consoleSpy.mockRestore();
    });
  });
});
