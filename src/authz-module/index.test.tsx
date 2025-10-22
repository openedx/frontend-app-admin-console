import { ComponentType, lazy } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeMockApp } from '@edx/frontend-platform/testing';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import AuthZModule from './index';

jest.mock('./libraries-manager', () => ({
  // eslint-disable-next-line no-promise-executor-return
  LibrariesLayout: lazy(() => new Promise<{ default: ComponentType<any> }>(resolve => setTimeout(() => resolve({ default: () => <div data-testid="layout"><Outlet /></div> }), 100))),
  LibrariesTeamManager: () => <div data-testid="libraries-manager">Libraries Team Page</div>,
  LibrariesUserManager: () => <div data-testid="libraries-user-manager">Libraries User Page</div>,
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

    expect(screen.getByTestId('loading-page')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('libraries-manager')).toBeInTheDocument();
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
      expect(screen.getByTestId('libraries-user-manager')).toBeInTheDocument();
    });
  });
});
