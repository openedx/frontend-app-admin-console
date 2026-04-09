import { ComponentType, lazy } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeMockApp } from '@edx/frontend-platform/testing';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { CustomErrors } from '@src/constants';
import AuthZModule from './index';

jest.mock('./libraries-manager', () => ({
  // eslint-disable-next-line no-promise-executor-return
  LibrariesLayout: lazy(() => new Promise<{ default: ComponentType<any> }>(resolve => setTimeout(
    () => resolve({ default: () => <div><Outlet /></div> }),
    100,
  ))),
  LibrariesTeamManager: () => <div>Libraries Team Page</div>,
  LibrariesUserManager: () => <div>Libraries User Page</div>,
}));

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
  it('renders LoadingPage then LibrariesTeamManager when route matches', async () => {
    const queryClient = createTestQueryClient();
    const path = '/libraries/lib:123';

    render(
      <IntlProvider locale="en">
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[path]}>
            <AuthZModule />
          </MemoryRouter>
        </QueryClientProvider>
      </IntlProvider>,
    );

    expect(document.querySelector('.spinner-border')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Libraries Team Page')).toBeInTheDocument();
    });
  });

  it('renders LoadingPage then LibrariesUserManager when user route matches', async () => {
    const queryClient = createTestQueryClient();
    const path = '/libraries/lib:123/testuser';

    render(
      <IntlProvider locale="en">
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[path]}>
            <AuthZModule />
          </MemoryRouter>
        </QueryClientProvider>
      </IntlProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText('Libraries User Page')).toBeInTheDocument();
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
