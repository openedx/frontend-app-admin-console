import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import { useLibraryAuthZ } from '@src/authz-module/libraries-manager/context';
import { useAssignTeamMembersRole } from '@src/authz-module/data/hooks';
import { ToastManagerProvider } from '@src/authz-module/libraries-manager/ToastManagerContext';
import AssignNewRoleTrigger from './AssignNewRoleTrigger';

jest.mock('@edx/frontend-platform/logging');

jest.mock('@src/authz-module/libraries-manager/context', () => ({
  useLibraryAuthZ: jest.fn(),
}));

jest.mock('@src/authz-module/data/hooks', () => ({
  useAssignTeamMembersRole: jest.fn(),
}));

jest.mock('./AssignNewRoleModal', () => {
  const MockAssignNewRoleModal = ({
    isOpen,
    close,
    onSave,
    isLoading,
    roleOptions,
    selectedRole,
    handleChangeSelectedRole,
  }: any) => (isOpen ? (
    <div role="dialog" aria-label="Assign New Role">
      <h2>Add New Role</h2>
      <select value={selectedRole} onChange={handleChangeSelectedRole} aria-label="Select role">
        <option value="">Select a role</option>
        {roleOptions.map((role: any) => (
          <option key={role.role} value={role.role}>
            {role.name}
          </option>
        ))}
      </select>
      <button type="button" onClick={onSave} disabled={isLoading} aria-label="Save role assignment">
        {isLoading ? 'Saving...' : 'Save'}
      </button>
      <button type="button" onClick={close} aria-label="Cancel role assignment">
        Cancel
      </button>
    </div>
  ) : null);
  MockAssignNewRoleModal.displayName = 'AssignNewRoleModal';
  return MockAssignNewRoleModal;
});

const mockUseLibraryAuthZ = useLibraryAuthZ as jest.Mock;
const mockUseAssignTeamMembersRole = useAssignTeamMembersRole as jest.Mock;

describe('AssignNewRoleTrigger', () => {
  const defaultProps = {
    username: 'testuser',
    libraryId: 'lib:test-library',
    currentUserRoles: ['instructor'],
  };

  const mockRoles = [
    {
      role: 'instructor',
      name: 'Instructor',
      description: 'Can create and edit content',
    },
    {
      role: 'admin',
      name: 'Administrator',
      description: 'Full access to the library',
    },
    {
      role: 'viewer',
      name: 'Viewer',
      description: 'Can only view content',
    },
  ];

  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseLibraryAuthZ.mockReturnValue({
      roles: mockRoles,
    });

    mockUseAssignTeamMembersRole.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  const renderComponent = (props = {}) => {
    const finalProps = { ...defaultProps, ...props };
    return renderWrapper(<ToastManagerProvider><AssignNewRoleTrigger {...finalProps} /></ToastManagerProvider>);
  };

  describe('Initial Render', () => {
    it('renders the trigger button with correct text', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /add new role/i })).toBeInTheDocument();
    });

    it('does not show modal initially', () => {
      renderComponent();

      expect(screen.queryByRole('dialog', { name: 'Assign New Role' })).not.toBeInTheDocument();
    });

    it('does not show toast initially', () => {
      renderComponent();

      expect(screen.queryByText(/role added successfully/i)).not.toBeInTheDocument();
    });
  });

  describe('Modal Interaction', () => {
    it('opens modal when trigger button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const triggerButton = screen.getByRole('button', { name: /add new role/i });
      await user.click(triggerButton);

      expect(screen.getByRole('dialog', { name: 'Assign New Role' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /add new role/i })).toBeInTheDocument();
    });

    it('closes modal when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      // Open modal
      await user.click(screen.getByRole('button', { name: /add new role/i }));
      expect(screen.getByRole('dialog', { name: 'Assign New Role' })).toBeInTheDocument();

      // Close modal
      await user.click(screen.getByRole('button', { name: 'Cancel role assignment' }));
      expect(screen.queryByRole('dialog', { name: 'Assign New Role' })).not.toBeInTheDocument();
    });
  });

  describe('Role Selection and Assignment', () => {
    it('updates selected role when role select changes', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button', { name: /add new role/i }));

      const roleSelect = screen.getByRole('combobox', { name: 'Select role' });
      await user.selectOptions(roleSelect, 'admin');

      expect(roleSelect).toHaveValue('admin');
    });

    it('calls assignTeamMembersRole with correct data when save is clicked', async () => {
      const choosenRole = mockRoles[1].role; // 'admin'
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button', { name: /add new role/i }));

      // Select a role
      const roleSelect = screen.getByRole('combobox', { name: 'Select role' });
      await user.selectOptions(roleSelect, choosenRole);

      // Click save
      await user.click(screen.getByRole('button', { name: 'Save role assignment' }));

      expect(mockMutate).toHaveBeenCalledWith(
        {
          data: {
            users: [defaultProps.username],
            role: choosenRole,
            scope: defaultProps.libraryId,
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });

    it('does not call assignTeamMembersRole if user already has the selected role', async () => {
      const choosenRole = mockRoles[1].role; // 'admin'
      const user = userEvent.setup();
      renderComponent({ currentUserRoles: ['instructor', choosenRole] });

      await user.click(screen.getByRole('button', { name: /add new role/i }));

      // Select a role that user already has
      const roleSelect = screen.getByRole('combobox', { name: 'Select role' });
      await user.selectOptions(roleSelect, choosenRole);

      await user.click(screen.getByRole('button', { name: 'Save role assignment' }));

      // Should not call assignTeamMembersRole
      expect(mockMutate).not.toHaveBeenCalled();
      // Modal should be closed
      expect(screen.queryByRole('dialog', { name: 'Assign New Role' })).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading state in modal when assignment is pending', async () => {
      mockUseAssignTeamMembersRole.mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button', { name: /add new role/i }));

      expect(screen.getByRole('button', { name: 'Save role assignment' })).toBeDisabled();
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('Success Handling', () => {
    it('shows success toast after successful role assignment', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button', { name: /add new role/i }));

      const roleSelect = screen.getByRole('combobox', { name: 'Select role' });
      await user.selectOptions(roleSelect, 'admin');

      await user.click(screen.getByRole('button', { name: 'Save role assignment' }));

      // Simulate successful API call
      const onSuccessCallback = mockMutate.mock.calls[0][1].onSuccess;
      onSuccessCallback({ errors: [] });

      await waitFor(() => {
        expect(screen.getByText(/role added successfully/i)).toBeInTheDocument();
      });
    });

    it('closes modal and resets role after successful assignment', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByRole('button', { name: /add new role/i }));

      const roleSelect = screen.getByRole('combobox', { name: 'Select role' });
      await user.selectOptions(roleSelect, 'admin');

      await user.click(screen.getByRole('button', { name: 'Save role assignment' }));

      // Simulate successful API call
      const onSuccessCallback = mockMutate.mock.calls[0][1].onSuccess;
      onSuccessCallback({ errors: [] });

      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: 'Assign New Role' })).not.toBeInTheDocument();
      });

      // Open modal again to check if role is reset
      await user.click(screen.getByRole('button', { name: /add new role/i }));
      expect(screen.getByRole('combobox', { name: 'Select role' })).toHaveValue('');
    });
  });

  describe('Error handle', () => {
    it('shows error toast when API fails to assign a role', async () => {
      const user = userEvent.setup();

      renderComponent();

      await user.click(screen.getByRole('button', { name: /add new role/i }));
      await user.selectOptions(screen.getByRole('combobox', { name: 'Select role' }), 'admin');
      await user.click(screen.getByRole('button', { name: 'Save role assignment' }));

      const { onSuccess } = mockMutate.mock.calls[0][1];
      onSuccess({ errors: [{ error: 'role_assignment_error' }] });

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: 'Select role' })).toHaveValue(''); // role reset
      });
    });

    it('shows error toast on API failure and allows retry', async () => {
      const user = userEvent.setup();
      const mockError = new Error('Network error');

      // First call to mutate triggers onError
      mockMutate.mockImplementationOnce((_vars, { onError }) => {
        onError(mockError, _vars);
      });

      renderWrapper(
        <ToastManagerProvider>
          <AssignNewRoleTrigger
            username="testuser"
            libraryId="lib:test-library"
            currentUserRoles={['instructor']}
          />
        </ToastManagerProvider>,
      );

      // Open modal and select a role
      await user.click(screen.getByRole('button', { name: /add new role/i }));
      await user.selectOptions(screen.getByRole('combobox', { name: 'Select role' }), 'admin');
      await user.click(screen.getByRole('button', { name: 'Save role assignment' }));

      // Wait for the error toast to appear with a retry button
      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

      // Second call to mutate also fails
      mockMutate.mockImplementationOnce((_vars, { onError }) => {
        onError(new Error('Network error'), _vars);
      });

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      // The retry toast should appear again
      await waitFor(() => {
        expect(screen.getAllByText(/Something went wrong/i).length).toBeGreaterThanOrEqual(1);
      });

      // Ensure mutate was called twice (original + retry)
      expect(mockMutate).toHaveBeenCalledTimes(2);
    });
  });
});
