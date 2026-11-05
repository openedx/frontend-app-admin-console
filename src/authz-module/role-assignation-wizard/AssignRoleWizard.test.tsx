import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/testUtils';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import { getAuthenticatedUser } from '@openedx/frontend-base';
import {
  useValidateUsers, useAssignTeamMembersRole, useScopes, useOrgs,
} from '@src/authz-module/data/hooks';
import useScopePermissions from './hooks/useScopePermissions';
import { courseRolesMetadata, libraryRolesMetadata } from '@src/authz-module/roles-permissions';
import AssignRoleWizard from './AssignRoleWizard';

const allRolesMetadata = [...courseRolesMetadata, ...libraryRolesMetadata];

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAuthenticatedUser: jest.fn(),
}));

const mockIntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
(globalThis as any).IntersectionObserver = mockIntersectionObserver;

jest.mock('@src/authz-module/hooks/useViewTeamPermissions', () => ({
  useViewTeamPermissions: () => ({
    isCourseViewAllowed: true,
    isLibraryViewAllowed: true,
    isLoading: false,
  }),
}));

jest.mock('@src/authz-module/hooks/useCourseAuthoringFlag', () => ({
  useCourseAuthoringFlag: () => ({
    isCourseAuthoringEnabled: true,
    isCourseEnabled: () => true,
    isOrgAuthoringEnabled: () => true,
    isLoading: false,
  }),
}));

jest.mock('../data/hooks', () => ({
  useValidateUsers: jest.fn(),
  useAssignTeamMembersRole: jest.fn(),
  useScopes: jest.fn(),
  useOrgs: jest.fn(),
}));

jest.mock('./hooks/useScopePermissions');

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

const mockScopeItem = {
  externalKey: 'lib:org1/lib1',
  displayName: 'Library One',
  org: { id: 1, name: 'Organization One', shortName: 'org1' },
};

const oneScopeReturn = {
  data: {
    pages: [{
      results: [mockScopeItem], count: 1, next: null, previous: null,
    }],
  },
  hasNextPage: false,
  fetchNextPage: jest.fn(),
  isFetchingNextPage: false,
  isLoading: false,
  isError: false,
};

const oneOrg = [
  {
    id: 1, name: 'Organization One', shortName: 'org1', description: '', logo: null, active: true,
  },
];

const wizard = (props = {}) => (
  <ToastManagerProvider>
    <AssignRoleWizard isOpen onClose={jest.fn()} roles={allRolesMetadata} {...props} />
  </ToastManagerProvider>
);

const renderWizard = (props = {}) => renderWrapper(wizard(props));

const getUsersInput = () => screen.getByLabelText(/Add users by username or email/i);
const getRoleRadio = (name: RegExp) => screen.getByRole('radio', { name });
const getNextButton = () => screen.getByRole('button', { name: /^Next$/i });
const getCancelButton = () => screen.getByRole('button', { name: /^Cancel$/i });

// Failures report inside the modal, so they are reachable without `hidden: true`.
const getErrorAlert = () => screen.getByRole('alert');
const getRetryButton = () => screen.getByRole('button', { name: /retry/i });

describe('AssignRoleWizard — Step 1', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseValidateUsers.mockReturnValue({ mutateAsync: mockValidateMutateAsync, isPending: false });
    mockUseAssignTeamMembersRole.mockReturnValue({ mutateAsync: mockAssignMutateAsync, isPending: false });
    mockUseScopes.mockReturnValue(emptyScopesReturn);
    mockUseOrgs.mockReturnValue({ data: { results: [] } });
    (getAuthenticatedUser as jest.Mock).mockReturnValue({ administrator: true });
    (useScopePermissions as jest.Mock).mockReturnValue({
      hasPlatformPermission: false,
      orgHasPermission: {},
    });
  });

  it('presents the wizard as a modal titled "Assign Role"', () => {
    renderWizard();
    expect(screen.getByRole('dialog', { name: 'Assign Role' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Assign Role' })).toBeInTheDocument();
  });

  it('renders nothing while closed', () => {
    renderWizard({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Add users by username or email/i)).not.toBeInTheDocument();
  });

  it('Cancel returns to the previous view', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderWizard({ onClose });
    await user.click(getCancelButton());
    expect(onClose).toHaveBeenCalled();
  });

  it('closes from the modal header close button', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderWizard({ onClose });
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('opens with the user pre-populated when provided via initialUsers', () => {
    renderWizard({ initialUsers: 'alice' });
    expect(getUsersInput()).toHaveValue('alice');
  });

  // The host mounts the wizard only while it is open, so "opening again" is a new
  // instance rather than a prop flip. These cases follow that lifecycle.
  it('seeds the users field from the value the host held when it opened', () => {
    const { unmount } = renderWrapper(wizard({ initialUsers: '' }));
    expect(getUsersInput()).toHaveValue('');
    unmount();

    renderWrapper(wizard({ initialUsers: 'alice' }));

    expect(getUsersInput()).toHaveValue('alice');
  });

  it('discards what was typed when the wizard is closed and opened again', async () => {
    const user = userEvent.setup();
    const { unmount } = renderWrapper(wizard({ initialUsers: 'alice' }));

    await user.clear(getUsersInput());
    await user.type(getUsersInput(), 'bob');
    expect(getUsersInput()).toHaveValue('bob');
    unmount();

    renderWrapper(wizard({ initialUsers: 'alice' }));

    expect(getUsersInput()).toHaveValue('alice');
  });

  it('Next button is disabled without both users and a role', () => {
    renderWizard();
    expect(getNextButton()).toBeDisabled();
  });

  it('renders no role options and keeps Next disabled when roles is empty', () => {
    renderWizard({ roles: [] });
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
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
      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    });
  });

  it('focuses the users field when validation rejects a name', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync.mockResolvedValue({ invalidUsers: ['ghost'], validUsers: [] });
    renderWizard();
    await user.type(getUsersInput(), 'ghost');
    await user.click(getRoleRadio(/Library Admin/i));
    await user.click(getNextButton());

    await waitFor(() => expect(getUsersInput()).toHaveFocus());
  });

  it('hands focus to the new step on advancing, not to the footer', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync.mockResolvedValue({ invalidUsers: [], validUsers: ['alice'] });
    renderWizard();
    await user.type(getUsersInput(), 'alice');
    await user.click(getRoleRadio(/Library Admin/i));

    getNextButton().focus();
    await user.keyboard('{Enter}');

    const stepTwo = await waitFor(() => {
      const content = screen.getByPlaceholderText('Search').closest('.assign-role-wizard__step');
      expect(content).toBeInTheDocument();
      return content;
    });
    expect(stepTwo).toHaveFocus();
  });

  // A toast would portal outside the dialog, hidden from screen readers and Retry untabbable.
  it('reports a failed validation inside the dialog and blocks progression', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync.mockRejectedValue(new Error('Network error'));
    renderWizard();
    await user.type(getUsersInput(), 'alice');
    await user.click(getRoleRadio(/Library Admin/i));
    await user.click(getNextButton());

    await waitFor(() => expect(getErrorAlert()).toBeInTheDocument());
    const dialog = screen.getByRole('dialog', { name: 'Assign Role' });
    expect(dialog).toContainElement(getErrorAlert());
    // Between the body and the footer, so it sits by the button that failed and cannot
    // be scrolled out of view.
    expect(dialog.querySelector('.pgn__modal-body')).not.toContainElement(getErrorAlert());
    expect(getErrorAlert()).toHaveFocus();
    expect(getErrorAlert()).toHaveTextContent(/something went wrong on our end/i);
    expect(getRetryButton()).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Search')).not.toBeInTheDocument();
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

  it('retries from the error alert without losing the form', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    mockValidateMutateAsync
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ invalidUsers: [], validUsers: ['alice'] });
    renderWizard({ onClose });
    await user.type(getUsersInput(), 'alice');
    await user.click(getRoleRadio(/Library Admin/i));
    await user.click(getNextButton());
    await waitFor(() => expect(getErrorAlert()).toBeInTheDocument());

    await user.click(getRetryButton());

    await waitFor(() => expect(screen.getByPlaceholderText('Search')).toBeInTheDocument());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('dismisses the error alert and leaves the form ready to submit again', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync.mockRejectedValue(new Error('Network error'));
    renderWizard();
    await user.type(getUsersInput(), 'alice');
    await user.click(getRoleRadio(/Library Admin/i));
    await user.click(getNextButton());
    await waitFor(() => expect(getErrorAlert()).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /dismiss/i }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(getUsersInput()).toHaveValue('alice');
    expect(getRoleRadio(/Library Admin/i)).toBeChecked();
    expect(getNextButton()).toBeEnabled();
  });
});

describe('AssignRoleWizard — Step 2', () => {
  const advanceToStep2 = async (user: ReturnType<typeof userEvent.setup>) => {
    mockValidateMutateAsync.mockResolvedValue({ invalidUsers: [], validUsers: ['alice'] });
    await user.type(getUsersInput(), 'alice');
    await user.click(getRoleRadio(/Library Admin/i));
    await user.click(getNextButton());
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseValidateUsers.mockReturnValue({ mutateAsync: mockValidateMutateAsync, isPending: false });
    mockUseAssignTeamMembersRole.mockReturnValue({ mutateAsync: mockAssignMutateAsync, isPending: false });
    mockUseScopes.mockReturnValue(oneScopeReturn);
    mockUseOrgs.mockReturnValue({ data: { results: oneOrg } });
    (getAuthenticatedUser as jest.Mock).mockReturnValue({ administrator: true });
    (useScopePermissions as jest.Mock).mockReturnValue({
      hasPlatformPermission: false,
      orgHasPermission: { org1: true },
    });
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

  it('leaves a failed save behind when going Back', async () => {
    const user = userEvent.setup();
    mockAssignMutateAsync.mockRejectedValue(new Error('Network error'));
    renderWizard();
    await advanceToStep2(user);
    await user.click(screen.getByLabelText('Library One'));
    await user.click(screen.getByRole('button', { name: /^Save$/i }));
    await waitFor(() => expect(getErrorAlert()).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /^Back$/i }));

    // Retry is bound to the active step, so carrying it over would re-run validation.
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('offers Back and Save, and leaves dismissing to the header close button', async () => {
    const user = userEvent.setup();
    renderWizard();
    await advanceToStep2(user);

    expect(screen.getByRole('button', { name: /^Back$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Save$/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Cancel$/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  // The save's response still runs after an unmount, so letting the admin leave mid-save
  // would let it close a reopened wizard or drop a partial-failure report.
  it('cannot be closed or left while a save is in flight', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const { rerender } = renderWizard({ onClose });
    await advanceToStep2(user);
    await user.click(screen.getByLabelText('Library One'));

    mockUseAssignTeamMembersRole.mockReturnValue({ mutateAsync: mockAssignMutateAsync, isPending: true });
    rerender(wizard({ onClose }));

    expect(screen.getByRole('button', { name: /^Back$/i })).toBeDisabled();
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('Save button is disabled when no scopes are selected', async () => {
    const user = userEvent.setup();
    renderWizard();
    await advanceToStep2(user);
    expect(screen.getByRole('button', { name: /^Save$/i })).toBeDisabled();
  });

  it('deselecting a previously selected scope clears it and disables Save', async () => {
    const user = userEvent.setup();
    renderWizard();
    await advanceToStep2(user);
    const scopeCheckbox = screen.getByLabelText('Library One');

    await user.click(scopeCheckbox);
    expect(scopeCheckbox).toBeChecked();
    expect(screen.getByRole('button', { name: /^Save$/i })).toBeEnabled();

    await user.click(scopeCheckbox);
    expect(scopeCheckbox).not.toBeChecked();
    expect(screen.getByRole('button', { name: /^Save$/i })).toBeDisabled();
  });

  it('saves role assignment successfully and closes the wizard', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    mockAssignMutateAsync.mockResolvedValue({
      completed: [{ userIdentifier: 'alice', scope: 'lib:org1/lib1', status: 'role_added' }],
      errors: [],
    });
    renderWizard({ onClose });
    await advanceToStep2(user);
    await user.click(screen.getByLabelText('Library One'));
    await user.click(screen.getByRole('button', { name: /^Save$/i }));
    await waitFor(() => {
      expect(mockAssignMutateAsync).toHaveBeenCalledWith({
        data: { users: ['alice'], role: 'library_admin', scopes: ['lib:org1/lib1'] },
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  const saveWith = async (user: ReturnType<typeof userEvent.setup>, result: unknown) => {
    mockAssignMutateAsync.mockResolvedValue(result);
    await advanceToStep2(user);
    await user.click(screen.getByLabelText('Library One'));
    await user.click(screen.getByRole('button', { name: /^Save$/i }));
  };

  const aliceFailed = { userIdentifier: 'alice', scope: 'lib:org1/lib1', error: 'user_already_has_role' };

  it('reports that the rest of the save landed when only some assignments fail', async () => {
    const user = userEvent.setup();
    renderWizard();
    await saveWith(user, {
      completed: [{ userIdentifier: 'bob', scope: 'lib:org1/lib1', status: 'role_added' }],
      errors: [aliceFailed],
    });

    await waitFor(() => expect(screen.getByText('Some assignments could not be completed')).toBeInTheDocument());
    expect(screen.getByText(/alice already has this role in lib:org1\/lib1/i)).toBeInTheDocument();
    // Counted off the response: without it the admin cannot tell that bob got the role,
    // and would save again for everyone.
    expect(screen.getByText('1 assignment succeeded and 1 failed. See details below:')).toBeInTheDocument();
  });

  it('does not claim partial success when every assignment fails', async () => {
    const user = userEvent.setup();
    renderWizard();
    await saveWith(user, { completed: [], errors: [aliceFailed] });

    await waitFor(() => expect(screen.getByText('The role could not be assigned')).toBeInTheDocument());
    expect(screen.getByText(/alice already has this role in lib:org1\/lib1/i)).toBeInTheDocument();
    expect(screen.queryByText(/Some assignments could not be completed/i)).not.toBeInTheDocument();
  });

  it('reports a partial failure once, inside the dialog', async () => {
    const user = userEvent.setup();
    renderWizard();
    await saveWith(user, {
      completed: [{ userIdentifier: 'bob', scope: 'lib:org1/lib1', status: 'role_added' }],
      errors: [aliceFailed],
    });

    // A toast would portal outside the dialog and repeat the detail over the Save button.
    const summary = await waitFor(() => screen.getAllByText('Some assignments could not be completed'));
    expect(summary).toHaveLength(1);
    expect(screen.getByRole('dialog', { name: 'Assign Role' })).toContainElement(summary[0]);
  });

  it('re-reports the outcome of the latest save, not the previous one', async () => {
    const user = userEvent.setup();
    renderWizard();
    await saveWith(user, {
      completed: [{ userIdentifier: 'bob', scope: 'lib:org1/lib1', status: 'role_added' }],
      errors: [aliceFailed],
    });
    await waitFor(() => expect(screen.getByText('Some assignments could not be completed')).toBeInTheDocument());

    // Carrying the first outcome over would credit this save with bob's success.
    mockAssignMutateAsync.mockResolvedValue({ completed: [], errors: [aliceFailed] });
    await user.click(screen.getByRole('button', { name: /^Save$/i }));

    await waitFor(() => expect(screen.getByText('The role could not be assigned')).toBeInTheDocument());
    expect(screen.queryByText('Some assignments could not be completed')).not.toBeInTheDocument();
  });

  it('leaves a reported failure behind when going Back and returning', async () => {
    const user = userEvent.setup();
    renderWizard();
    await saveWith(user, { completed: [], errors: [aliceFailed] });
    await waitFor(() => expect(screen.getByText('The role could not be assigned')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /^Back$/i }));
    await waitFor(() => expect(getUsersInput()).toBeInTheDocument());
    await user.click(getNextButton());

    await waitFor(() => expect(screen.getByPlaceholderText('Search')).toBeInTheDocument());
    expect(screen.queryByText('The role could not be assigned')).not.toBeInTheDocument();
  });

  it('reports a failed save inside the dialog, with a working retry', async () => {
    const user = userEvent.setup();
    mockAssignMutateAsync
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ completed: [], errors: [] });
    renderWizard();
    await advanceToStep2(user);
    await user.click(screen.getByLabelText('Library One'));
    await user.click(screen.getByRole('button', { name: /^Save$/i }));

    await waitFor(() => expect(getErrorAlert()).toBeInTheDocument());
    expect(screen.getByRole('dialog', { name: 'Assign Role' })).toContainElement(getErrorAlert());

    await user.click(getRetryButton());

    await waitFor(() => expect(mockAssignMutateAsync).toHaveBeenCalledTimes(2));
  });
});
