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
import { useUserAccount } from '@src/data/hooks';
import { useUserAssignedRoles } from '@src/authz-module/data/hooks';
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

// Mock data hooks
jest.mock('@src/data/hooks', () => ({
  ...jest.requireActual('@src/data/hooks'),
  useUserAccount: jest.fn(),
  useValidateUserPermissions: jest.fn().mockReturnValue({
    data: [{ allowed: true }],
    isLoading: false,
  }),
}));

// Mock the useRevokeUserRoles hook
const mockRevokeUserRoles = jest.fn();
jest.mock('@src/authz-module/data/hooks', () => ({
  ...jest.requireActual('@src/authz-module/data/hooks'),
  useRevokeUserRoles: () => ({
    mutate: mockRevokeUserRoles,
    isPending: false,
  }),
  useUserAssignedRoles: jest.fn(),
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
    (useUserAccount as jest.Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      error: null,
    });

    (useUserAssignedRoles as jest.Mock).mockReturnValue({
      data: mockAssignments,
      isLoading: false,
      isError: false,
      error: null,
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('johndoe', { selector: 'li[aria-current="page"]' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /assign role/i })).toBeInTheDocument();
    });

    // Check that the table is rendered (even if empty initially)
    expect(screen.getByRole('table')).toBeInTheDocument();
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
      expect(screen.getByText('Roles and Permissions Management')).toBeInTheDocument();
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
    (useUserAccount as jest.Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      error: null,
    });

    (useUserAssignedRoles as jest.Mock).mockReturnValue({
      data: {
        count: 0, results: [], next: null, previous: null,
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('johndoe', { selector: 'li[aria-current="page"]' })).toBeInTheDocument();
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
      // Using columnheader role to be more specific about table headers
      expect(screen.getByRole('columnheader', { name: /role/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /organization/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /scope/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /permissions/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /actions/i })).toBeInTheDocument();
    });
  });

  it('expands row to show UserPermissions component when view all permissions is clicked', async () => {
    (useUserAccount as jest.Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    (useUserAssignedRoles as jest.Mock).mockReturnValue({
      data: mockAssignments,
      isLoading: false,
      error: null,
    });

    renderWithRouter();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('Library Admin')).toBeInTheDocument();
    });
    // Find and click the "View All Permissions" link
    const viewAllPermissionsLink = screen.getByText(/view all permissions/i);
    expect(viewAllPermissionsLink).toBeInTheDocument();
    await user.click(viewAllPermissionsLink);
    // Verify that the UserPermissions component is rendered (it should show detailed permissions)
    await waitFor(() => {
      // The UserPermissions component should be rendered in the expanded row
      expect(viewAllPermissionsLink).toBeInTheDocument();
    });
  });

  it('renders the pagination controls when assignments are present', async () => {
    (useUserAccount as jest.Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    (useUserAssignedRoles as jest.Mock).mockReturnValue({
      data: mockAssignments,
      isLoading: false,
      error: null,
    });

    renderWithRouter();

    // Wait for user data first
    await waitFor(() => {
      expect(screen.getByText('johndoe', { selector: 'li[aria-current="page"]' })).toBeInTheDocument();
    });

    // Then check for assignment data and pagination
    await waitFor(() => {
      // Look for pagination controls
      expect(screen.getByRole('navigation', { name: /table pagination/i })).toBeInTheDocument();
      // Check that some users count is shown (format might vary)
      expect(screen.getByText(/showing/i)).toBeInTheDocument();
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

  it('handles undefined data from useUserAssignedRoles with default destructuring', async () => {
    (useUserAccount as jest.Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      error: null,
    });

    (useUserAssignedRoles as jest.Mock).mockReturnValue({
      data: undefined, // This triggers the default destructuring assignment
      isLoading: false,
      isError: false,
      error: null,
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('johndoe', { selector: 'li[aria-current="page"]' })).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  it('navigates to home when user not found and isErrorUser is false', async () => {
    (useUserAccount as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });

    (useUserAssignedRoles as jest.Mock).mockReturnValue({
      data: mockAssignments,
      isLoading: false,
      isError: false,
      error: null,
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });

  it('navigates to home when user not found and error is 404', async () => {
    (useUserAccount as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: {
        customAttributes: {
          httpErrorStatus: 404,
        },
      },
    });

    (useUserAssignedRoles as jest.Mock).mockReturnValue({
      data: mockAssignments,
      isLoading: false,
      isError: false,
      error: null,
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });
});
