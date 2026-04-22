import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import {
  useValidateUsers, useAssignTeamMembersRole, useScopes, useOrgs,
} from '../data/hooks';
import AssignRoleWizard from './AssignRoleWizard';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(),
}));

const mockIntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
(globalThis as any).IntersectionObserver = mockIntersectionObserver;

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('../data/hooks', () => ({
  useValidateUsers: jest.fn(),
  useAssignTeamMembersRole: jest.fn(),
  useScopes: jest.fn(),
  useOrgs: jest.fn(),
}));

const mockUseValidateUsers = useValidateUsers as jest.Mock;
const mockUseAssignTeamMembersRole = useAssignTeamMembersRole as jest.Mock;
const mockUseScopes = useScopes as jest.Mock;
const mockUseOrgs = useOrgs as jest.Mock;
const mockValidateMutateAsync = jest.fn();
const mockAssignMutateAsync = jest.fn();

const emptyScopesReturn = {
  data: { pages: [] },
  hasNextPage: false,
  fetchNextPage: jest.fn(),
  isFetchingNextPage: false,
  isLoading: false,
  isError: false,
};

const renderWizard = (props = {}) => renderWrapper(
  <ToastManagerProvider>
    <AssignRoleWizard onClose={jest.fn()} {...props} />
  </ToastManagerProvider>,
);

const getUsersInput = () => screen.getByLabelText(/Add users by username or email/i);
const getRoleRadio = (name: RegExp) => screen.getByRole('radio', { name });
const getNextButton = () => screen.getByRole('button', { name: /^Next$/i });
const getCancelButton = () => screen.getByRole('button', { name: /^Cancel$/i });

describe('AssignRoleWizard — Step 1', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseValidateUsers.mockReturnValue({ mutateAsync: mockValidateMutateAsync, isPending: false });
    mockUseAssignTeamMembersRole.mockReturnValue({ mutateAsync: mockAssignMutateAsync, isPending: false });
    mockUseScopes.mockReturnValue(emptyScopesReturn);
    mockUseOrgs.mockReturnValue({ data: { results: [] } });
    (getAuthenticatedUser as jest.Mock).mockReturnValue({ administrator: true });
  });

  it('Cancel returns to the previous view', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderWizard({ onClose });
    await user.click(getCancelButton());
    expect(onClose).toHaveBeenCalled();
  });

  it('opens with the user pre-populated when provided via initialUsers', () => {
    renderWizard({ initialUsers: 'alice' });
    expect(getUsersInput()).toHaveValue('alice');
  });

  it('Next button is disabled without both users and a role', () => {
    renderWizard();
    expect(getNextButton()).toBeDisabled();
  });

  it('selecting a different role replaces the previous selection', async () => {
    const user = userEvent.setup();
    renderWizard();
    await user.click(getRoleRadio(/Library Admin/i));
    await user.click(getRoleRadio(/Course Admin/i));
    expect(getRoleRadio(/Course Admin/i)).toBeChecked();
    expect(getRoleRadio(/Library Admin/i)).not.toBeChecked();
  });

  it('blocks progression and highlights the unknown user', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync.mockResolvedValue({ invalidUsers: ['ghost'], validUsers: [] });
    renderWizard();
    await user.type(getUsersInput(), 'ghost');
    await user.click(getRoleRadio(/Library Admin/i));
    await user.click(getNextButton());
    await waitFor(() => {
      expect(screen.getByText(/not associated with an account/i)).toBeInTheDocument();
      expect(screen.queryByTestId('toggle-scope-*')).not.toBeInTheDocument();
    });
  });

  it('advances to Step 2 when all users are valid', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync.mockResolvedValue({ invalidUsers: [], validUsers: ['alice'] });
    renderWizard();
    await user.type(getUsersInput(), 'alice');
    await user.click(getRoleRadio(/Library Admin/i));
    await user.click(getNextButton());
    await waitFor(() => {
      expect(screen.getByTestId('toggle-scope-*')).toBeInTheDocument();
    });
  });

  it('shows a network error and blocks progression when the validation call fails', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync.mockRejectedValue(new Error('Network error'));
    renderWizard();
    await user.type(getUsersInput(), 'alice');
    await user.click(getRoleRadio(/Library Admin/i));
    await user.click(getNextButton());
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.queryByTestId('toggle-scope-*')).not.toBeInTheDocument();
    });
  });

  it('clears the invalid user highlights when the input is edited', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync.mockResolvedValue({ invalidUsers: ['ghost'], validUsers: [] });
    renderWizard();
    await user.type(getUsersInput(), 'ghost');
    await user.click(getRoleRadio(/Library Admin/i));
    await user.click(getNextButton());
    await waitFor(() => expect(screen.getByText(/not associated with an account/i)).toBeInTheDocument());
    await user.type(getUsersInput(), 'x');
    await waitFor(() => expect(screen.queryByText(/not associated with an account/i)).not.toBeInTheDocument());
  });

  it('allows retry when validation call fails', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ invalidUsers: [], validUsers: ['alice'] });
    renderWizard();
    await user.type(getUsersInput(), 'alice');
    await user.click(getRoleRadio(/Library Admin/i));
    await user.click(getNextButton());
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /retry/i }));
    await waitFor(() => {
      expect(screen.getByTestId('toggle-scope-*')).toBeInTheDocument();
    });
  });
});

describe('AssignRoleWizard — Step 2', () => {
  const advanceToStep2 = async (user: ReturnType<typeof userEvent.setup>) => {
    mockValidateMutateAsync.mockResolvedValue({ invalidUsers: [], validUsers: ['alice'] });
    await user.type(getUsersInput(), 'alice');
    await user.click(getRoleRadio(/Library Admin/i));
    await user.click(getNextButton());
    await waitFor(() => {
      expect(screen.getByTestId('toggle-scope-*')).toBeInTheDocument();
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseValidateUsers.mockReturnValue({ mutateAsync: mockValidateMutateAsync, isPending: false });
    mockUseAssignTeamMembersRole.mockReturnValue({ mutateAsync: mockAssignMutateAsync, isPending: false });
    mockUseScopes.mockReturnValue(emptyScopesReturn);
    mockUseOrgs.mockReturnValue({ data: { results: [] } });
    (getAuthenticatedUser as jest.Mock).mockReturnValue({ administrator: true });
  });

  it('Back button returns to Step 1', async () => {
    const user = userEvent.setup();
    renderWizard();
    await advanceToStep2(user);
    await user.click(screen.getByRole('button', { name: /^Back$/i }));
    await waitFor(() => {
      expect(getUsersInput()).toBeInTheDocument();
    });
  });

  it('Save button is disabled when no scopes are selected', async () => {
    const user = userEvent.setup();
    renderWizard();
    await advanceToStep2(user);
    expect(screen.getByRole('button', { name: /^Save$/i })).toBeDisabled();
  });

  it('saves role assignment successfully and closes the wizard', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    mockAssignMutateAsync.mockResolvedValue({
      completed: [{ userIdentifier: 'alice', scope: 'lib:test:123', status: 'role_added' }],
      errors: [],
    });
    renderWizard({ onClose });
    await advanceToStep2(user);
    await user.click(screen.getByTestId('toggle-scope-*'));
    await user.click(screen.getByRole('button', { name: /^Save$/i }));
    await waitFor(() => {
      expect(mockAssignMutateAsync).toHaveBeenCalledWith({
        data: { users: ['alice'], role: 'library_admin', scopes: ['*'] },
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows error toast and inline alert when the API returns assignment errors', async () => {
    const user = userEvent.setup();
    mockAssignMutateAsync.mockResolvedValue({
      completed: [],
      errors: [{ userIdentifier: 'alice', scope: 'lib:test:123', error: 'user_already_has_role' }],
    });
    renderWizard();
    await advanceToStep2(user);
    await user.click(screen.getByTestId('toggle-scope-*'));
    await user.click(screen.getByRole('button', { name: /^Save$/i }));
    await waitFor(() => {
      expect(screen.getByText(/Some assignments could not be completed/i)).toBeInTheDocument();
      expect(screen.getByText(/The following errors occurred/i)).toBeInTheDocument();
      expect(screen.getByText(/alice already has this role in lib:test:123/i)).toBeInTheDocument();
    });
  });

  it('shows error toast when save throws a network error', async () => {
    const user = userEvent.setup();
    mockAssignMutateAsync.mockRejectedValue(new Error('Network error'));
    renderWizard();
    await advanceToStep2(user);
    await user.click(screen.getByTestId('toggle-scope-*'));
    await user.click(screen.getByRole('button', { name: /^Save$/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
