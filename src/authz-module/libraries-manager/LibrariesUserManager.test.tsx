import { useParams } from 'react-router-dom';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import LibrariesUserManager from './LibrariesUserManager';
import { useLibraryAuthZ } from './context';
import { useLibrary, useTeamMembers, useRevokeUserRoles } from '../data/hooks';
import { ToastManagerProvider } from './ToastManagerContext';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('./context', () => ({
  useLibraryAuthZ: jest.fn(),
}));

jest.mock('../data/hooks', () => ({
  useLibrary: jest.fn(),
  useTeamMembers: jest.fn(),
  useRevokeUserRoles: jest.fn(),
}));

jest.mock('../components/RoleCard', () => ({
  __esModule: true,
  default: ({
    title,
    description,
    handleDelete,
  }: {
    title: string;
    description: string;
    handleDelete?: () => void;
  }) => (
    <div>
      <div>{title}</div>
      <div>{description}</div>
      {handleDelete && (
        <button type="button" onClick={handleDelete}>
          {`delete-role-${title}`}
        </button>
      )}
    </div>
  ),
}));

jest.mock('./components/AssignNewRoleModal', () => ({
  AssignNewRoleTrigger: () => <button type="button">Assign Role</button>,
}));

describe('LibrariesUserManager', () => {
  const mockMutate = jest.fn();
  const defaultMockData = {
    libraryId: 'lib:123',
    permissions: [{ key: 'view' }, { key: 'reuse' }],
    roles: [
      {
        role: 'admin',
        name: 'Admin',
        description: 'Administrator Role',
        permissions: ['view', 'reuse'],
        userCount: 5,
      },
      {
        role: 'instructor',
        name: 'Instructor',
        description: 'Instructor Role',
        permissions: ['view'],
        userCount: 10,
      },
    ],
    resources: [{ key: 'library', label: 'Library', description: '' }],
    canManageTeam: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock route params
    (useParams as jest.Mock).mockReturnValue({ username: 'testuser' });

    // Mock library authz context
    (useLibraryAuthZ as jest.Mock).mockReturnValue(defaultMockData);

    // Mock library data
    (useLibrary as jest.Mock).mockReturnValue({
      data: {
        title: 'Test Library',
        org: 'Test Org',
      },
    });

    // Mock team members
    (useTeamMembers as jest.Mock).mockReturnValue({
      data: {
        results: [
          {
            username: 'testuser',
            email: 'testuser@example.com',
            roles: ['admin', 'instructor'],
          },
        ],
      },
      isLoading: false,
      isFetching: false,
    });

    // Mock revoke user roles
    (useRevokeUserRoles as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  const renderComponent = () => {
    renderWrapper(
      <ToastManagerProvider>
        <LibrariesUserManager />
      </ToastManagerProvider>,
    );
  };

  it('renders the user roles correctly', () => {
    renderComponent();

    // Breadcrumb check
    expect(screen.getByText('Manage Access')).toBeInTheDocument();
    expect(screen.getByText('Library Team Management')).toBeInTheDocument();
    expect(screen.getByRole('listitem', { current: 'page' })).toHaveTextContent('testuser');
    // Page title and subtitle
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('testuser');
    expect(screen.getByRole('paragraph')).toHaveTextContent('testuser@example.com');

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Instructor')).toBeInTheDocument();

    defaultMockData.roles.forEach((role) => {
      expect(screen.getByText(role.name)).toBeInTheDocument();
      expect(screen.getByText(role.description)).toBeInTheDocument();
    });
  });

  it('renders assign role trigger when user has canManageTeam permission', () => {
    renderComponent();

    expect(screen.getByText('Assign Role')).toBeInTheDocument();
  });

  describe('Revoking User Role Flow', () => {
    it('opens confirmation modal when delete role button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const deleteButton = screen.getByText('delete-role-Admin');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Remove role?')).toBeInTheDocument();
      });
    });

    it('displays correct confirmation modal content', async () => {
      const user = userEvent.setup();
      renderComponent();

      const deleteButton = screen.getByText('delete-role-Admin');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Remove role?')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to remove the Admin role from/)).toBeInTheDocument();
        expect(screen.getByText(/Test Library/)).toBeInTheDocument();
      });
    });

    it('closes confirmation modal when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const deleteButton = screen.getByText('delete-role-Admin');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Remove role?')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Remove role?')).not.toBeInTheDocument();
      });
    });

    it('calls revokeUserRoles mutation when Remove button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const deleteButton = screen.getByText('delete-role-Admin');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Remove role?')).toBeInTheDocument();
      });

      const removeButton = screen.getByText('Remove');
      await user.click(removeButton);

      expect(mockMutate).toHaveBeenCalledWith(
        {
          data: {
            users: 'testuser',
            role: 'admin',
            scope: 'lib:123',
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      );
    });

    it('shows success toast when role is revoked successfully with multiple roles remaining', async () => {
      const user = userEvent.setup();
      renderComponent();

      const deleteButton = screen.getByText('delete-role-Admin');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Remove role?')).toBeInTheDocument();
      });

      const removeButton = screen.getByText('Remove');
      await user.click(removeButton);

      const onSuccessCallback = mockMutate.mock.calls[0][1].onSuccess;
      onSuccessCallback();

      await waitFor(() => {
        expect(screen.getByText(/The Admin role has been successfully removed/)).toBeInTheDocument();
      });
    });

    it('shows success toast with user removal message when last role is revoked', async () => {
      const user = userEvent.setup();

      (useTeamMembers as jest.Mock).mockReturnValue({
        data: {
          results: [
            {
              username: 'testuser',
              email: 'testuser@example.com',
              roles: ['admin'],
            },
          ],
        },
        isLoading: false,
        isFetching: false,
      });

      renderComponent();

      const deleteButton = screen.getByText('delete-role-Admin');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Remove role?')).toBeInTheDocument();
      });

      const removeButton = screen.getByText('Remove');
      await user.click(removeButton);

      const onSuccessCallback = mockMutate.mock.calls[0][1].onSuccess;
      onSuccessCallback();

      await waitFor(() => {
        expect(screen.getByText(/The user no longer has access to this library/)).toBeInTheDocument();
      });
    });

    it('shows error toast when role revocation fails', async () => {
      const user = userEvent.setup();
      renderComponent();

      const deleteButton = screen.getByText('delete-role-Admin');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Remove role?')).toBeInTheDocument();
      });

      const removeButton = screen.getByText('Remove');
      await user.click(removeButton);

      const onErrorCallback = mockMutate.mock.calls[0][1].onError;
      onErrorCallback(new Error('Network error'));

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong on our end/)).toBeInTheDocument();
      });
    });

    it('closes confirmation modal after successful role revocation', async () => {
      const user = userEvent.setup();
      renderComponent();

      const deleteButton = screen.getByText('delete-role-Admin');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Remove role?')).toBeInTheDocument();
      });

      const removeButton = screen.getByText('Remove');
      await user.click(removeButton);

      const onSuccessCallback = mockMutate.mock.calls[0][1].onSuccess;
      onSuccessCallback();

      await waitFor(() => {
        expect(screen.queryByText('Remove role?')).not.toBeInTheDocument();
      });
    });

    it('disables delete action when revocation is in progress', async () => {
      const user = userEvent.setup();

      (useRevokeUserRoles as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      renderComponent();

      const deleteButton = screen.getByText('delete-role-Admin');
      await user.click(deleteButton);

      expect(screen.queryByText('Remove role?')).not.toBeInTheDocument();
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('passes correct context to confirmation modal', async () => {
      const user = userEvent.setup();
      renderComponent();

      const deleteButton = screen.getByText('delete-role-Instructor');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Remove role?')).toBeInTheDocument();
      });

      const modal = screen.getByRole('dialog');
      expect(within(modal).getByText(/Instructor role/)).toBeInTheDocument();
      expect(within(modal).getByText(/testuser/)).toBeInTheDocument();
      expect(within(modal).getByText(/Test Library/)).toBeInTheDocument();
    });
  });
});
