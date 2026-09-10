import { screen } from '@testing-library/react';
import { useTeamMembersAssignments, useOrgs, useScopes } from '@src/authz-module/data/hooks';
import { renderWithAllProviders } from '@src/setupTest';
import userEvent from '@testing-library/user-event';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import { useViewTeamPermissions } from '@src/authz-module/hooks/useViewTeamPermissions';
import { CustomErrors } from '@src/constants';
import AuthzHome from './index';
import messages from './messages';

jest.mock('@src/authz-module/hooks/useCourseAuthoringFlag', () => ({
  useCourseAuthoringFlag: () => ({
    isCourseAuthoringEnabled: true,
    isCourseEnabled: () => true,
    isLoading: false,
  }),
}));

jest.mock('@src/authz-module/hooks/useViewTeamPermissions', () => ({
  useViewTeamPermissions: jest.fn(),
}));

jest.mock('@src/authz-module/data/hooks', () => ({
  useTeamMembersAssignments: jest.fn(),
  useOrgs: jest.fn(),
  useScopes: jest.fn(),
}));

const emptyResponse = {
  data: {
    results: [], count: 0, next: null, previous: null,
  },
  error: null,
  isLoading: false,
  refetch: jest.fn(),
};

const emptyScopesResponse = {
  data: { pages: [] },
  error: null,
  isLoading: false,
  hasNextPage: false,
  fetchNextPage: jest.fn(),
  isFetchingNextPage: false,
};

// Nothing is allowed while the check is in flight; cases override only what they are about.
const permissionsInFlight = {
  isCourseViewAllowed: false,
  isLibraryViewAllowed: false,
  isLoading: true,
};

const mockViewTeamPermissions = (overrides: Partial<typeof permissionsInFlight> = {}) => {
  (useViewTeamPermissions as jest.Mock).mockReturnValue({ ...permissionsInFlight, ...overrides });
};

const renderAuthzHome = () => renderWithAllProviders(
  <ToastManagerProvider>
    <AuthzHome />
  </ToastManagerProvider>,
);

describe('AuthzHome', () => {
  beforeEach(() => {
    // Call history is asserted on below, so it must not carry over between cases.
    jest.clearAllMocks();
    mockViewTeamPermissions({ isCourseViewAllowed: true, isLibraryViewAllowed: true, isLoading: false });
    (useTeamMembersAssignments as jest.Mock).mockReturnValue(emptyResponse);
    (useOrgs as jest.Mock).mockReturnValue(emptyResponse);
    (useScopes as jest.Mock).mockReturnValue(emptyScopesResponse);
  });

  it('renders without crashing', () => {
    renderAuthzHome();
  });

  it('renders the main layout and tabs', () => {
    renderAuthzHome();
    expect(screen.getByText(messages['authz.manage.page.title'].defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages['authz.tabs.permissionsRoles'].defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages['authz.tabs.team'].defaultMessage)).toBeInTheDocument();
  });

  it('renders both tab panels', () => {
    renderAuthzHome();
    expect(screen.getByText(messages['authz.tabs.permissionsRoles'].defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages['authz.tabs.team'].defaultMessage)).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3); // 2 + tab invisible for more...
  });

  it('renders the RolesPermissions component in the permissions tab', async () => {
    const user = userEvent.setup();
    renderAuthzHome();
    await user.click(screen.getByText(messages['authz.tabs.permissionsRoles'].defaultMessage));
    expect(screen.getByRole('button', { name: 'Courses' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Libraries' })).toBeInTheDocument();
  });

  it('denies access to the whole page when the user may view neither courses nor libraries', () => {
    mockViewTeamPermissions({ isLoading: false });

    // Neither tab has anything to show, so the page hands off to the error boundary.
    expect(() => renderAuthzHome()).toThrow(CustomErrors.NO_ACCESS);
  });

  it('shows a loader instead of the page while the permission check is in flight', () => {
    mockViewTeamPermissions();

    renderAuthzHome();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading')).toBeInTheDocument();
    // Nothing behind the gate renders yet, so no listing request is fired for a user
    // who may turn out to be denied.
    expect(screen.queryByText(messages['authz.manage.page.title'].defaultMessage)).not.toBeInTheDocument();
    expect(useTeamMembersAssignments).not.toHaveBeenCalled();
  });

  it('renders the page when only library roles may be viewed', () => {
    mockViewTeamPermissions({ isLibraryViewAllowed: true, isLoading: false });

    renderAuthzHome();

    expect(screen.getByText(messages['authz.manage.page.title'].defaultMessage)).toBeInTheDocument();
  });

  it('renders the TeamMembersTable component in the team members tab', () => {
    renderAuthzHome();
    expect(screen.getByText(messages['authz.manage.page.title'].defaultMessage)).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Assigned roles')).toBeInTheDocument();
    // Org, scope and role are filter controls only — they are no longer column headers.
    expect(screen.getAllByText('Organization').length).toBe(1);
    expect(screen.getAllByText('Scope').length).toBe(1);
    expect(screen.getAllByText('Role').length).toBe(1);
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});
