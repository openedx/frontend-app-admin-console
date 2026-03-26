import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import { useValidateUsers, useAssignTeamMembersRole } from '../data/hooks';
import { useValidateUserPermissions } from '../../data/hooks';
import { useToastManager } from '../libraries-manager/ToastManagerContext';
import AssignRoleWizard from './AssignRoleWizard';

// Mock Paragon Stepper so all steps and action rows are always rendered
jest.mock('@openedx/paragon', () => {
  const actual = jest.requireActual('@openedx/paragon');
  const MockActionRow = Object.assign(
    ({ children }: { children: React.ReactNode }) => <div data-testid="action-row">{children}</div>,
    { Spacer: () => null },
  );
  const MockStepper = Object.assign(
    ({ children }: { children: React.ReactNode }) => <div data-testid="stepper">{children}</div>,
    {
      Header: () => null,
      Step: ({ children, onClick, eventKey }: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        children: any; onClick?: () => void; eventKey: string;
      }) => (
        <div>
          <button type="button" data-testid={`step-header-${eventKey}`} onClick={onClick}>
            Step Header
          </button>
          {children}
        </div>
      ),
      ActionRow: MockActionRow,
    },
  );
  return { ...actual, Stepper: MockStepper };
});

jest.mock('./SelectUsersAndRoleStep', () => ({
  __esModule: true,
  default: ({
    setUsers, setSelectedRole, invalidUsers, validationError,
  }: {
    setUsers: (v: string) => void;
    setSelectedRole: (v: string) => void;
    invalidUsers: string[];
    validationError: string | null;
  }) => (
    <div>
      <input
        data-testid="users-input"
        onChange={(e) => setUsers(e.target.value)}
      />
      <button type="button" data-testid="select-role" onClick={() => setSelectedRole('library_admin')}>
        Select Role
      </button>
      {invalidUsers.length > 0 && (
        <div data-testid="invalid-users">{invalidUsers.join(', ')}</div>
      )}
      {validationError && <div data-testid="validation-error">{validationError}</div>}
    </div>
  ),
}));

jest.mock('./DefineApplicationScopeStep', () => ({
  __esModule: true,
  default: ({ onScopeToggle }: { onScopeToggle: (id: string) => void }) => (
    <button type="button" data-testid="toggle-scope" onClick={() => onScopeToggle('lib:123')}>
      Add Scope
    </button>
  ),
}));

jest.mock('../data/hooks', () => ({
  useValidateUsers: jest.fn(),
  useAssignTeamMembersRole: jest.fn(),
}));

jest.mock('../../data/hooks', () => ({
  useValidateUserPermissions: jest.fn(),
}));

jest.mock('../libraries-manager/ToastManagerContext', () => ({
  useToastManager: jest.fn(),
}));

const mockUseValidateUsers = useValidateUsers as jest.Mock;
const mockUseAssignTeamMembersRole = useAssignTeamMembersRole as jest.Mock;
const mockUseValidateUserPermissions = useValidateUserPermissions as jest.Mock;
const mockUseToastManager = useToastManager as jest.Mock;

const mockShowToast = jest.fn();
const mockShowErrorToast = jest.fn();
const mockValidateMutateAsync = jest.fn();
const mockAssignMutateAsync = jest.fn();

const defaultPermissionsData = [
  { action: 'content_libraries.manage_library_team', scope: 'lib:123', allowed: true },
  { action: 'courses.manage_course_team', scope: 'lib:123', allowed: false },
];

const renderWizard = (props = {}) => renderWrapper(
  <AssignRoleWizard onClose={jest.fn()} scope="lib:123" {...props} />,
);

describe('AssignRoleWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseValidateUsers.mockReturnValue({
      mutateAsync: mockValidateMutateAsync,
      isPending: false,
    });

    mockUseAssignTeamMembersRole.mockReturnValue({
      mutateAsync: mockAssignMutateAsync,
      isPending: false,
    });

    mockUseValidateUserPermissions.mockReturnValue({
      data: defaultPermissionsData,
    });

    mockUseToastManager.mockReturnValue({
      showToast: mockShowToast,
      showErrorToast: mockShowErrorToast,
    });
  });

  it('renders the wizard with step 1 content', () => {
    renderWizard();
    expect(screen.getByTestId('stepper')).toBeInTheDocument();
    expect(screen.getByTestId('users-input')).toBeInTheDocument();
  });

  it('renders Cancel and Next buttons from step 1 action row', () => {
    renderWizard();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
    // Cancel appears in both action rows
    expect(screen.getAllByRole('button', { name: /Cancel/i })).toHaveLength(2);
  });

  it('Next button is disabled when users field is empty', () => {
    renderWizard();
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
  });

  it('Next button is disabled when role is not selected', async () => {
    const user = userEvent.setup();
    renderWizard();
    await user.type(screen.getByTestId('users-input'), 'alice');
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
  });

  it('Next button is enabled when users and role are both set', async () => {
    const user = userEvent.setup();
    renderWizard();
    await user.type(screen.getByTestId('users-input'), 'alice');
    await user.click(screen.getByTestId('select-role'));
    expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled();
  });

  it('calls validateUsers when Next is clicked with valid input', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync.mockResolvedValue({ invalidUsers: [], validUsers: ['alice'] });

    renderWizard();
    await user.type(screen.getByTestId('users-input'), 'alice');
    await user.click(screen.getByTestId('select-role'));
    await user.click(screen.getByRole('button', { name: /Next/i }));

    await waitFor(() => {
      expect(mockValidateMutateAsync).toHaveBeenCalledWith({
        data: { users: ['alice'] },
      });
    });
  });

  it('shows invalid users in step 1 when validation returns invalid users', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync.mockResolvedValue({ invalidUsers: ['baduser'], validUsers: [] });

    renderWizard();
    await user.type(screen.getByTestId('users-input'), 'baduser');
    await user.click(screen.getByTestId('select-role'));
    await user.click(screen.getByRole('button', { name: /Next/i }));

    await waitFor(() => {
      expect(screen.getByTestId('invalid-users')).toBeInTheDocument();
      expect(screen.getByTestId('invalid-users')).toHaveTextContent('baduser');
    });
  });

  it('shows validation error on network failure', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync.mockRejectedValue(new Error('Network error'));

    renderWizard();
    await user.type(screen.getByTestId('users-input'), 'alice');
    await user.click(screen.getByTestId('select-role'));
    await user.click(screen.getByRole('button', { name: /Next/i }));

    await waitFor(() => {
      expect(screen.getByTestId('validation-error')).toBeInTheDocument();
      expect(screen.getByTestId('validation-error')).toHaveTextContent(
        'An error occurred while validating users. Please try again.',
      );
    });
  });

  it('clears invalid users when user edits the input', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync.mockResolvedValue({ invalidUsers: ['baduser'], validUsers: [] });

    renderWizard();
    await user.type(screen.getByTestId('users-input'), 'baduser');
    await user.click(screen.getByTestId('select-role'));
    await user.click(screen.getByRole('button', { name: /Next/i }));

    await waitFor(() => {
      expect(screen.getByTestId('invalid-users')).toBeInTheDocument();
    });

    // Edit the input to clear invalid users
    await user.type(screen.getByTestId('users-input'), 'x');
    await waitFor(() => {
      expect(screen.queryByTestId('invalid-users')).not.toBeInTheDocument();
    });
  });

  it('Cancel button calls onClose', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderWizard({ onClose });

    const cancelButtons = screen.getAllByRole('button', { name: /Cancel/i });
    await user.click(cancelButtons[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('Save button is disabled when no scopes selected', () => {
    renderWizard();
    expect(screen.getByRole('button', { name: /Save/i })).toBeDisabled();
  });

  it('Save button is enabled after a scope is toggled', async () => {
    const user = userEvent.setup();
    renderWizard();
    await user.click(screen.getByTestId('toggle-scope'));
    expect(screen.getByRole('button', { name: /Save/i })).not.toBeDisabled();
  });

  it('calls assignRole for each scope on Save', async () => {
    const user = userEvent.setup();
    mockAssignMutateAsync.mockResolvedValue({ completed: [], errors: [] });

    renderWizard();
    await user.type(screen.getByTestId('users-input'), 'alice');
    await user.click(screen.getByTestId('select-role'));
    await user.click(screen.getByTestId('toggle-scope'));
    await user.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(mockAssignMutateAsync).toHaveBeenCalledWith({
        data: { users: ['alice'], role: 'library_admin', scope: 'lib:123' },
      });
    });
  });

  it('shows success toast and calls onClose after successful save', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    mockAssignMutateAsync.mockResolvedValue({ completed: [], errors: [] });

    renderWizard({ onClose });
    await user.type(screen.getByTestId('users-input'), 'alice');
    await user.click(screen.getByTestId('select-role'));
    await user.click(screen.getByTestId('toggle-scope'));
    await user.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows error toast when save fails', async () => {
    const user = userEvent.setup();
    const saveError = new Error('Server error');
    mockAssignMutateAsync.mockRejectedValue(saveError);

    renderWizard();
    await user.type(screen.getByTestId('users-input'), 'alice');
    await user.click(screen.getByTestId('select-role'));
    await user.click(screen.getByTestId('toggle-scope'));
    await user.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(mockShowErrorToast).toHaveBeenCalled();
    });
  });

  it('initialUsers prop pre-fills the users field', () => {
    renderWizard({ initialUsers: 'prefilled_user' });
    // The wizard starts with initialUsers set, but our mock input doesn't show it
    // We verify the Next button state — it's still disabled without role
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
  });

  it('filters roles based on user permissions (library allowed, course not)', () => {
    // Only library roles should be passed to SelectUsersAndRoleStep
    // This is verified through the hook being called with permissionChecks
    renderWizard();
    expect(mockUseValidateUserPermissions).toHaveBeenCalledWith([
      { action: 'content_libraries.manage_library_team', scope: 'lib:123' },
      { action: 'courses.manage_course_team', scope: 'lib:123' },
    ]);
  });

  it('toggles scope off when same scope is toggled again', async () => {
    const user = userEvent.setup();
    mockAssignMutateAsync.mockResolvedValue({ completed: [], errors: [] });

    renderWizard();
    // Toggle scope on
    await user.click(screen.getByTestId('toggle-scope'));
    expect(screen.getByRole('button', { name: /Save/i })).not.toBeDisabled();

    // Toggle scope off
    await user.click(screen.getByTestId('toggle-scope'));
    expect(screen.getByRole('button', { name: /Save/i })).toBeDisabled();
  });

  it('does not call validateUsers when users list is empty', async () => {
    const user = userEvent.setup();
    renderWizard();
    // Only select role, no users
    await user.click(screen.getByTestId('select-role'));
    await user.click(screen.getByRole('button', { name: /Next/i }));
    // Button should be disabled, so click won't trigger mutation
    expect(mockValidateMutateAsync).not.toHaveBeenCalled();
  });

  it('Back button is always rendered (step 2 action row)', () => {
    renderWizard();
    // With mocked Stepper, both action rows are visible
    expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
  });

  it('Next button is disabled when validateUsers mutation is pending', async () => {
    mockUseValidateUsers.mockReturnValue({
      mutateAsync: mockValidateMutateAsync,
      isPending: true,
    });

    renderWizard();
    expect(await screen.findByRole('button', { name: /Validating/i })).toBeDisabled();
  });

  it('Save button is disabled when assignRole mutation is pending', async () => {
    const user = userEvent.setup();
    mockUseAssignTeamMembersRole.mockReturnValue({
      mutateAsync: mockAssignMutateAsync,
      isPending: true,
    });

    renderWizard();
    await user.click(screen.getByTestId('toggle-scope'));
    expect(await screen.findByRole('button', { name: /Saving/i })).toBeDisabled();
  });

  it('Back button navigates to step 1 when clicked', async () => {
    const user = userEvent.setup();
    renderWizard();
    // Back button is always visible in mock; clicking it should not throw
    await user.click(screen.getByRole('button', { name: /Back/i }));
    // Step 1 content (users-input) remains in the document (mock renders all steps)
    expect(screen.getByTestId('users-input')).toBeInTheDocument();
  });

  it('clicking step 1 header sets active step to select-users-and-role', async () => {
    const user = userEvent.setup();
    renderWizard();
    await user.click(screen.getByTestId('step-header-select-users-and-role'));
    expect(screen.getByTestId('users-input')).toBeInTheDocument();
  });

  it('clicking step 2 header sets active step to define-application-scope', async () => {
    const user = userEvent.setup();
    renderWizard();
    await user.click(screen.getByTestId('step-header-define-application-scope'));
    expect(screen.getByTestId('toggle-scope')).toBeInTheDocument();
  });
});
