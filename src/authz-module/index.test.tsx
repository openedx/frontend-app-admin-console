import { ComponentType, lazy } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthZModule from './index';

// eslint-disable-next-line no-promise-executor-return
jest.mock('./libraries-manager/LibrariesTeamManager', () => lazy(() => new Promise<{ default: ComponentType<any> }>(resolve => setTimeout(() => resolve({ default: () => <div data-testid="libraries-manager">Loaded</div> }), 100))));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('AuthZModule', () => {
  it('renders LoadingPage then LibrariesTeamManager when route matches', async () => {
    const queryClient = createTestQueryClient();
    const path = '/libraries/lib:123';

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[path]}>
          <AuthZModule />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId('loading-page')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('libraries-manager')).toBeInTheDocument();
    });
  });
});
