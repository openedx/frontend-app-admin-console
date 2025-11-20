import React, { act } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import { useAssignTeamMembersRole } from '@src/authz-module/data/hooks';
import { ToastManagerProvider } from '@src/authz-module/libraries-manager/ToastManagerContext';
import AddNewTeamMemberTrigger from './AddNewTeamMemberTrigger';

jest.mock('@edx/frontend-platform/logging');

const mockMutate = jest.fn();

// Mock the hooks module
jest.mock('@src/authz-module/data/hooks', () => ({
  useAssignTeamMembersRole: jest.fn(),
}));

jest.mock('./AddNewTeamMemberModal', () => {
  /* eslint-disable react/prop-types */
  const MockModal = ({
    isOpen, close, onSave, isLoading, formValues, handleChangeForm,
  }) => (
    isOpen ? (
      <div data-testid="add-team-member-modal" role="dialog" aria-label="Add New Team Member">
        <button type="button" onClick={close} aria-label="Close modal" data-testid="close-modal">Close</button>
        <button type="button" onClick={onSave} aria-label="Save team member" data-testid="save-modal">Save</button>
        <textarea
          name="users"
          value={formValues?.users || ''}
          onChange={handleChangeForm}
          data-testid="users-input"
          aria-label="Enter user emails or usernames"
          placeholder="Enter emails or usernames"
        />
        <select
          name="role"
          value={formValues?.role || ''}
          onChange={handleChangeForm}
          data-testid="role-select"
          aria-label="Select role"
        >
          <option value="">Select role</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
        </select>
        {isLoading && <div data-testid="loading-indicator">Loading...</div>}
      </div>
    ) : null
  );
  /* eslint-enable react/prop-types */
  return MockModal;
});

describe('AddNewTeamMemberTrigger', () => {
  const mockLibraryId = 'lib:123';

  beforeEach(() => {
    jest.clearAllMocks();
    (useAssignTeamMembersRole as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      isSuccess: false,
    } as any);
  });

  it('renders the trigger button', () => {
    renderWrapper(<ToastManagerProvider><AddNewTeamMemberTrigger libraryId={mockLibraryId} /></ToastManagerProvider>);

    const button = screen.getByRole('button', { name: /add new team member/i });
    expect(button).toBeInTheDocument();
  });

  it('opens modal when trigger button is clicked', async () => {
    const user = userEvent.setup();
    renderWrapper(<ToastManagerProvider><AddNewTeamMemberTrigger libraryId={mockLibraryId} /></ToastManagerProvider>);

    const triggerButton = screen.getByRole('button', { name: /add new team member/i });
    await user.click(triggerButton);

    expect(screen.getByTestId('add-team-member-modal')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    renderWrapper(<ToastManagerProvider><AddNewTeamMemberTrigger libraryId={mockLibraryId} /></ToastManagerProvider>);

    const triggerButton = screen.getByRole('button', { name: /add new team member/i });
    await user.click(triggerButton);

    expect(screen.getByTestId('add-team-member-modal')).toBeInTheDocument();

    const closeButton = screen.getByTestId('close-modal');
    await user.click(closeButton);

    expect(screen.queryByTestId('add-team-member-modal')).not.toBeInTheDocument();
  });

  it('calls addTeamMember with correct data when save is clicked', async () => {
    const user = userEvent.setup();
    renderWrapper(<ToastManagerProvider><AddNewTeamMemberTrigger libraryId={mockLibraryId} /></ToastManagerProvider>);

    const triggerButton = screen.getByRole('button', { name: /add new team member/i });
    await user.click(triggerButton);

    const usersInput = screen.getByTestId('users-input');
    const roleSelect = screen.getByTestId('role-select');
    const saveButton = screen.getByTestId('save-modal');

    await user.type(usersInput, 'alice@example.com, bob@example.com');
    await user.selectOptions(roleSelect, 'editor');
    await user.click(saveButton);

    expect(mockMutate).toHaveBeenCalledWith(
      {
        data: {
          users: ['alice@example.com', 'bob@example.com'],
          role: 'editor',
          scope: mockLibraryId,
        },
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );
  });

  it('displays success toast and closes modal on successful addition with no errors', async () => {
    const user = userEvent.setup();
    renderWrapper(<ToastManagerProvider><AddNewTeamMemberTrigger libraryId={mockLibraryId} /></ToastManagerProvider>);

    const triggerButton = screen.getByRole('button', { name: /add new team member/i });
    await user.click(triggerButton);

    const saveButton = screen.getByTestId('save-modal');
    await user.click(saveButton);

    // Simulate successful response with no errors
    const [, { onSuccess }] = mockMutate.mock.calls[0];
    onSuccess({
      completed: [
        { userIdentifier: 'alice@example.com', status: 'role_added' },
        { userIdentifier: 'bob@example.com', status: 'added_to_team' },
      ],
      errors: [],
    });

    await waitFor(() => {
      expect(screen.queryByTestId('add-team-member-modal')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/2 team members added successfully/)).toBeInTheDocument();
  });

  it('displays mixed success and error toast on partial success', async () => {
    const user = userEvent.setup();
    renderWrapper(<ToastManagerProvider><AddNewTeamMemberTrigger libraryId={mockLibraryId} /></ToastManagerProvider>);

    const triggerButton = screen.getByRole('button', { name: /add new team member/i });
    await user.click(triggerButton);

    const saveButton = screen.getByTestId('save-modal');
    await user.click(saveButton);

    // Simulate partial success response
    const [, { onSuccess }] = mockMutate.mock.calls[0];
    onSuccess({
      completed: [
        { userIdentifier: 'alice@example.com', status: 'role_added' },
      ],
      errors: [
        { userIdentifier: 'unknown@example.com', error: 'user_not_found' },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText(/1 team member added successfully/)).toBeInTheDocument();
      expect(screen.getByText(/We couldn't find a user for 1 email address or username/)).toBeInTheDocument();
    });

    // Modal should remain open when there are errors
    expect(screen.getByTestId('add-team-member-modal')).toBeInTheDocument();
  });

  it('filters out successfully added users from error users list', async () => {
    const user = userEvent.setup();

    const mockPartialResponse = {
      completed: [
        { userIdentifier: 'alice@example.com' },
      ],
      errors: [
        { userIdentifier: 'bob@example.com', error: 'USER_NOT_FOUND' },
        { userIdentifier: 'charlie@example.com', error: 'USER_NOT_FOUND' },
      ],
    };

    (useAssignTeamMembersRole as jest.Mock).mockReturnValue({
      mutate: jest.fn((_variables, { onSuccess }) => {
        onSuccess(mockPartialResponse);
      }),
      isPending: false,
    });

    renderWrapper(<ToastManagerProvider><AddNewTeamMemberTrigger libraryId={mockLibraryId} /></ToastManagerProvider>);

    const triggerButton = screen.getByRole('button', { name: /add new team member/i });
    await user.click(triggerButton);

    const usersInput = screen.getByRole('textbox', { name: /Enter user emails or usernames/i });
    const roleSelect = screen.getByRole('combobox', { name: /Select role/i });
    const saveButton = screen.getByRole('button', { name: 'Save team member' });

    await user.type(usersInput, 'alice@example.com, bob@example.com, charlie@example.com');
    await user.selectOptions(roleSelect, 'editor');
    await user.click(saveButton);

    await waitFor(() => {
      expect(usersInput).toHaveValue('bob@example.com, charlie@example.com');
    });

    await user.type(usersInput, ', new@example.com');

    await waitFor(() => {
      expect(usersInput).toHaveValue('bob@example.com, charlie@example.com, new@example.com');
    });
  });

  it('displays only error toast when all additions fail', async () => {
    const user = userEvent.setup();
    renderWrapper(<ToastManagerProvider><AddNewTeamMemberTrigger libraryId={mockLibraryId} /></ToastManagerProvider>);

    const triggerButton = screen.getByRole('button', { name: /add new team member/i });
    await user.click(triggerButton);

    const saveButton = screen.getByTestId('save-modal');
    await user.click(saveButton);

    // Simulate all failed response
    const [, { onSuccess }] = mockMutate.mock.calls[0];
    onSuccess({
      completed: [],
      errors: [
        { userIdentifier: 'unknown1@example.com', error: 'user_not_found' },
        { userIdentifier: 'unknown2@example.com', error: 'user_not_found' },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText(/We couldn't find a user for 2 email addresses or usernames/)).toBeInTheDocument();
    });

    // Modal should remain open when there are errors
    expect(screen.getByTestId('add-team-member-modal')).toBeInTheDocument();
  });

  it('displays different error toast when different errors happen', async () => {
    const user = userEvent.setup();
    renderWrapper(<ToastManagerProvider><AddNewTeamMemberTrigger libraryId={mockLibraryId} /></ToastManagerProvider>);

    const triggerButton = screen.getByRole('button', { name: /add new team member/i });
    await user.click(triggerButton);

    const saveButton = screen.getByRole('button', { name: 'Save team member' });
    await user.click(saveButton);

    const [, { onSuccess }] = mockMutate.mock.calls[0];
    onSuccess({
      completed: [],
      errors: [
        { userIdentifier: 'unknown@example.com', error: 'user_not_found' },
        { userIdentifier: 'already@example.com', error: 'user_already_has_role' },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText(/We couldn't find a user for 1 email address or username \(unknown@example.com\)/)).toBeInTheDocument();
      expect(screen.getByText(/The user already has the role \(already@example.com\)/)).toBeInTheDocument();
    });

    expect(screen.getByRole('dialog', { name: 'Add New Team Member' })).toBeInTheDocument();
  });

  it('resets form values after successful addition with no errors', async () => {
    const user = userEvent.setup();
    renderWrapper(<ToastManagerProvider><AddNewTeamMemberTrigger libraryId={mockLibraryId} /></ToastManagerProvider>);

    const triggerButton = screen.getByRole('button', { name: /add new team member/i });
    await user.click(triggerButton);

    const usersInput = screen.getByTestId('users-input');
    const roleSelect = screen.getByTestId('role-select');
    const saveButton = screen.getByTestId('save-modal');

    await user.type(usersInput, 'alice@example.com');
    await user.selectOptions(roleSelect, 'editor');
    await user.click(saveButton);

    // Simulate successful response with no errors
    const [, { onSuccess }] = mockMutate.mock.calls[0];
    onSuccess({
      completed: [{ userIdentifier: 'alice@example.com', status: 'role_added' }],
      errors: [],
    });

    // Open modal again to check if form is reset
    await user.click(triggerButton);

    const newUsersInput = screen.getByTestId('users-input');
    const newRoleSelect = screen.getByTestId('role-select');

    expect(newUsersInput).toHaveValue('');
    expect(newRoleSelect).toHaveValue('');
  });

  it('allows closing the success/error toast message', async () => {
    const user = userEvent.setup();
    renderWrapper(<ToastManagerProvider><AddNewTeamMemberTrigger libraryId={mockLibraryId} /></ToastManagerProvider>);

    const triggerButton = screen.getByRole('button', { name: /add new team member/i });
    await user.click(triggerButton);

    const saveButton = screen.getByTestId('save-modal');
    await user.click(saveButton);

    // Simulate successful response
    const [, { onSuccess }] = mockMutate.mock.calls[0];
    onSuccess({
      completed: [{ userIdentifier: 'alice@example.com', status: 'role_added' }],
      errors: [],
    });

    // Toast should be visible
    await waitFor(() => {
      expect(screen.getByText(/1 team member added successfully/)).toBeInTheDocument();
    });

    // Find and close the toast
    const toastCloseButton = screen.getByLabelText(/close/i);
    await user.click(toastCloseButton);

    // Toast should be removed
    await waitFor(() => {
      expect(screen.queryByText('1 team member added successfully.')).not.toBeInTheDocument();
    });
  });

  it('shows retry toast on API failure and displays another toast when retry fails again', async () => {
    const user = userEvent.setup();

    const mockError = new Error('Network error');

    mockMutate.mockImplementationOnce((_vars, { onError }) => {
      onError(mockError, _vars);
    });

    renderWrapper(
      <ToastManagerProvider>
        <AddNewTeamMemberTrigger libraryId={mockLibraryId} />
      </ToastManagerProvider>,
    );

    const triggerButton = screen.getByRole('button', { name: /add new team member/i });
    await user.click(triggerButton);

    const saveButton = screen.getByTestId('save-modal');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    mockMutate.mockImplementationOnce((_vars, { onError }) => {
      onError(new Error('Network error'), _vars);
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    });

    // Ensure mutate was called twice (original + retry)
    expect(mockMutate).toHaveBeenCalledTimes(2);
  });

  it('displays loading state when adding team member', async () => {
    const user = userEvent.setup();

    const { rerender } = renderWrapper(
      <ToastManagerProvider>
        <AddNewTeamMemberTrigger libraryId="lib:123" />
      </ToastManagerProvider>,
    );

    const rerenderHook = () => rerender(
      <ToastManagerProvider>
        <AddNewTeamMemberTrigger libraryId="lib:123" />
      </ToastManagerProvider>,
    );

    let isPending = false;
    const mutateMock = jest.fn((_args, { onSuccess }) => {
      isPending = true;
      rerenderHook();
      setTimeout(() => {
        isPending = false;
        rerenderHook();
        onSuccess?.({
          completed: [{ userIdentifier: _args.data.users[0], status: 'role_added' }],
          errors: [],
        });
      }, 10);
    });

    (useAssignTeamMembersRole as jest.Mock).mockImplementation(() => ({
      mutate: mutateMock,
      isPending,
      isError: false,
      isSuccess: false,
    }));

    const triggerButton = screen.getByRole('button', { name: /add new team member/i });
    await user.click(triggerButton);

    const userInput = screen.getByTestId('users-input');
    const roleSelect = screen.getByTestId('role-select');
    await user.type(userInput, 'alice@example.com');
    await user.selectOptions(roleSelect, 'editor');

    const saveButton = screen.getByTestId('save-modal');
    await user.click(saveButton);

    // should now reflect isPending = true
    act(async () => {
      const loadingIndicator = await screen.findByRole('status', { name: 'Adding team member loader' });
      expect(loadingIndicator).toBeInTheDocument();
      expect(loadingIndicator).toHaveTextContent('Loading...');
    });

    expect(mutateMock).toHaveBeenCalledWith(
      {
        data: {
          users: ['alice@example.com'],
          role: 'editor',
          scope: 'lib:123',
        },
      },
      expect.any(Object),
    );
  });
});
