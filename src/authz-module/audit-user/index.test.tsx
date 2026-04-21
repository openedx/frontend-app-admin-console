import {
  render, screen, waitFor, act,
} from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import AuditUserPage from './index';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
  configure: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

// Mock StudioHeader to avoid prop validation errors in tests
jest.mock('@edx/frontend-component-header', () => ({
  StudioHeader: ({ children, ...props }: any) => <div data-testid="mocked-studio-header" {...props}>{children}</div>,
}));

// Mock the useRevokeUserRoles hook
const mockRevokeUserRoles = jest.fn();
jest.mock('@src/authz-module/data/hooks', () => ({
  ...jest.requireActual('@src/authz-module/data/hooks'),
  useRevokeUserRoles: () => ({
    mutate: mockRevokeUserRoles,
    isPending: false,
  }),
}));

const mockUser = {
  username: 'johndoe',
  email: 'john@example.com',
  profile_image: { has_image: false },
};
const mockAssignments = {
  count: 1,
  results: [
    {
      id: '1',
      role: 'library_admin',
      org: 'Test Org',
      scope: 'lib:test',
      permissionCount: 5,
    },
  ],
  next: null,
  previous: null,
};

const renderWithRouter = (route = '/audit/johndoe') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const mockAppContext = {
    authenticatedUser: {
      username: 'testuser',
      email: 'testuser@example.com',
      userId: 1,
    },
    config: {
      LMS_BASE_URL: 'http://localhost:18000',
      STUDIO_BASE_URL: 'http://localhost:18010',
      AUTHZ_MICROFRONTEND_URL: 'http://localhost:18012',
      ACCESS_TOKEN_COOKIE_NAME: 'edx-jwt-cookie-header-payload',
      BASE_URL: 'http://localhost:18012',
      ENVIRONMENT: 'test',
      LANGUAGE_PREFERENCE_COOKIE_NAME: 'openedx-language-preference',
      ...process.env,
    },
  };

  return render(
    <AppContext.Provider value={mockAppContext}>
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale="en">
          <ToastManagerProvider>
            <MemoryRouter initialEntries={[route]}>
              <Routes>
                <Route path="/audit/:username" element={<AuditUserPage />} />
                <Route path="/authz" element={<div>Home Page</div>} />
              </Routes>
            </MemoryRouter>
          </ToastManagerProvider>
        </IntlProvider>
      </QueryClientProvider>
    </AppContext.Provider>,
  );
};

describe('AuditUserPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock behavior for useRevokeUserRoles
    mockRevokeUserRoles.mockImplementation((variables, { onSuccess }) => {
      // Simulate successful deletion by default
      onSuccess({ errors: [], completed: ['role1'] });
    });
  });

  beforeAll(() => {
  // @ts-ignore
    global.logError = jest.fn();
  });

  it('renders user info and table when data is loaded', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest
        .fn()
        .mockResolvedValueOnce({ data: mockUser })
        .mockResolvedValueOnce({ data: mockAssignments }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'johndoe' })).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /assign role/i })).toBeInTheDocument();
      expect(screen.getByText('Library Admin')).toBeInTheDocument();
      expect(screen.getByText('Test Org')).toBeInTheDocument();
      expect(screen.getByText('lib:test')).toBeInTheDocument();
      expect(screen.getByText('5 permissions available')).toBeInTheDocument();
    });
  });

  it('navigates to home if user is not found', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest
        .fn()
        .mockResolvedValueOnce({ data: null })
        .mockResolvedValueOnce({ data: mockAssignments }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });

  it('allows user to interact with Assign Role button', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest
        .fn()
        .mockResolvedValueOnce({ data: mockUser })
        .mockResolvedValueOnce({ data: mockAssignments }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /assign role/i })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: /assign role/i });
    await user.click(button);
    expect(button).not.toBeInTheDocument();
  });

  it('renders empty state when user has no assignments', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest
        .fn()
        .mockResolvedValueOnce({ data: mockUser })
        .mockResolvedValueOnce({
          data: {
            count: 0, results: [], next: null, previous: null,
          },
        }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'johndoe' })).toBeInTheDocument();
      expect(screen.queryByText('5 permissions available')).not.toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  it('renders correct table headers', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest
        .fn()
        .mockResolvedValueOnce({ data: mockUser })
        .mockResolvedValueOnce({ data: mockAssignments }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Organization')).toBeInTheDocument();
      expect(screen.getByText('Scope')).toBeInTheDocument();
      expect(screen.getByText('Permissions')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  it('renders the pagination controls when assignments are present', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest
        .fn()
        .mockResolvedValueOnce({ data: mockUser })
        .mockResolvedValueOnce({ data: mockAssignments }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Showing 1 of 1.')).toBeInTheDocument();
    });
  });

  it('renders the breadcrumb navigation with home link', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest
        .fn()
        .mockResolvedValueOnce({ data: mockUser })
        .mockResolvedValueOnce({ data: mockAssignments }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /roles and permissions management/i })).toBeInTheDocument();
      expect(screen.getByText(mockUser.username, { selector: 'li[aria-current="page"]' })).toBeInTheDocument();
    });
  });

  it('opens and closes the ConfirmDeletionModal when delete is clicked and cancel is pressed', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest
        .fn()
        .mockResolvedValueOnce({ data: mockUser })
        .mockResolvedValueOnce({ data: mockAssignments }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /delete role action/i })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const deleteButton = screen.getByRole('button', { name: /delete role action/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/remove role\?/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('calls onSave when confirming deletion in ConfirmDeletionModal', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest
        .fn()
        .mockResolvedValueOnce({ data: mockUser })
        .mockResolvedValueOnce({ data: mockAssignments }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /delete role action/i })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const deleteButton = screen.getByRole('button', { name: /delete role action/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: /remove/i });

    await act(async () => {
      await user.click(removeButton);
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/role has been successfully removed/i)).toBeInTheDocument();
    });
  });

  it('shows error toast when role revocation succeeds but returns errors', async () => {
    // Override mock for this specific test case
    mockRevokeUserRoles.mockImplementation((_, { onSuccess }) => {
      // Call onSuccess immediately with errors
      onSuccess({
        errors: ['Failed to revoke user role'],
        completed: [],
      });
    });

    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest
        .fn()
        .mockResolvedValueOnce({ data: mockUser })
        .mockResolvedValueOnce({ data: mockAssignments }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /delete role action/i })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const deleteButton = screen.getByRole('button', { name: /delete role action/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: /remove/i });

    await act(async () => {
      await user.click(removeButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('shows error toast with retry when role revocation fails', async () => {
    // Override mock for this specific test case
    mockRevokeUserRoles.mockImplementation((variables, { onError }) => {
      // Call onError immediately to simulate failure
      onError(new Error('Network error'));
    });

    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest
        .fn()
        .mockResolvedValueOnce({ data: mockUser })
        .mockResolvedValueOnce({ data: mockAssignments }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /delete role action/i })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const deleteButton = screen.getByRole('button', { name: /delete role action/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: /remove/i });

    await act(async () => {
      await user.click(removeButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/something went wrong on our end/i)).toBeInTheDocument();
      expect(screen.getByText(/try again later/i)).toBeInTheDocument();
    });
  });

  it('shows the extra warning when rolesCount is 1', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest
        .fn()
        .mockResolvedValueOnce({ data: mockUser })
        .mockResolvedValueOnce({
          data: {
            count: 1,
            results: [
              {
                id: '1',
                role: 'library_admin',
                org: 'Test Org',
                scope: 'lib:test',
                permissionCount: 5,
              },
            ],
            next: null,
            previous: null,
          },
        }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /delete role action/i })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const deleteButton = screen.getByRole('button', { name: /delete role action/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/this is the user's only role/i)).toBeInTheDocument();
    });
  });
});
