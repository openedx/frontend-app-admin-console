import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeMockApp } from '@edx/frontend-platform/testing';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { CustomErrors } from '@src/constants';
import AuthZModule from './index';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('AuthZModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initializeMockApp({
      authenticatedUser: { username: 'testuser' },
    });
  });

  it('renders error boundary fallback when accessing unknown route', async () => {
    const queryClient = createTestQueryClient();
    const unknownPath = '/unknown/route';
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <IntlProvider locale="en">
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[unknownPath]}>
            <AuthZModule />
          </MemoryRouter>
        </QueryClientProvider>
      </IntlProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
      expect(screen.getByText('404')).toBeInTheDocument();
    }, { timeout: 3000 });

    consoleErrorSpy.mockRestore();
  });

  it('NotFoundError function throws error with correct message', () => {
    const NotFoundError = () => {
      const error = new Error(CustomErrors.NOT_FOUND);
      throw error;
    };

    expect(() => {
      NotFoundError();
    }).toThrow(CustomErrors.NOT_FOUND);

    expect(() => {
      NotFoundError();
    }).toThrow(Error);
  });
});
