import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getAuthenticatedUser } from '@openedx/frontend-base';
import { renderWithAllProviders } from '@src/testUtils';
import { MANAGE_TEAM_ACTIONS, SCOPE_TYPES } from '@src/authz-module/constants';
import { authzCatalog, buildCatalogRole, mockAuthzCatalog } from '@src/authz-module/catalog/testUtils';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import {
  useAssignTeamMembersRole, useOrgs, useScopes, useValidateUsers,
} from '@src/authz-module/data/hooks';
import useScopePermissions from '@src/authz-module/role-assignation-wizard/hooks/useScopePermissions';
import RolesPermissionsTable from './RolesPermissionsTable';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAuthenticatedUser: jest.fn(),
}));

jest.mock('@src/authz-module/catalog/data/hooks', () => ({
  useAuthzCatalog: jest.fn(),
}));

jest.mock('@src/data/hooks', () => ({
  ...jest.requireActual('@src/data/hooks'),
  useValidateUserPermissionsNonSuspense: jest.fn(),
}));

jest.mock('@src/authz-module/hooks/useCourseAuthoringFlag', () => ({
  useCourseAuthoringFlag: jest.fn(),
}));

jest.mock('@src/authz-module/data/hooks', () => ({
  useValidateUsers: jest.fn(),
  useAssignTeamMembersRole: jest.fn(),
  useScopes: jest.fn(),
  useOrgs: jest.fn(),
}));

jest.mock('@src/authz-module/role-assignation-wizard/hooks/useScopePermissions');

(globalThis as any).IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

const mockValidateMutateAsync = jest.fn();
const mockAssignMutateAsync = jest.fn();

const allowManaging = (...scopeTypes: string[]) => ({
  data: [SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY].map((scopeType) => ({
    action: MANAGE_TEAM_ACTIONS[scopeType],
    allowed: scopeTypes.includes(scopeType),
  })),
});

const libraryScope = {
  externalKey: 'lib:org1/lib1',
  displayName: 'Library One',
  org: { id: 1, name: 'Organization One', shortName: 'org1' },
};

const renderTable = () => renderWithAllProviders(
  <ToastManagerProvider>
    <RolesPermissionsTable />
  </ToastManagerProvider>,
);

const catalogWithCustomRole = {
  ...authzCatalog,
  roles: [
    ...authzCatalog.roles,
    buildCatalogRole('library_reviewer', {
      displayName: 'Library reviewer',
      definitionKind: 'user_defined',
      permissions: ['content_libraries.view_library'],
      scopeTypes: [SCOPE_TYPES.LIBRARY],
    }),
  ],
};

const getRow = (roleName: string) => screen.getByText(roleName).closest('tr') as HTMLElement;
const roleNames = () => screen.getAllByRole('row').slice(1)
  .map((row) => within(row).getAllByRole('cell')[0].querySelector('span')?.textContent);

// A user who can view and manage every team, with course authoring on.
const setUpMocks = () => {
  jest.clearAllMocks();
  mockAuthzCatalog({ catalog: catalogWithCustomRole });
  (useValidateUserPermissionsNonSuspense as jest.Mock).mockReturnValue(
    allowManaging(SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY),
  );
  (useCourseAuthoringFlag as jest.Mock).mockReturnValue({
    isCourseAuthoringEnabled: true,
    isCourseEnabled: () => true,
    isOrgAuthoringEnabled: () => true,
    isLoading: false,
  });
  (useValidateUsers as jest.Mock).mockReturnValue({ mutateAsync: mockValidateMutateAsync, isPending: false });
  (useAssignTeamMembersRole as jest.Mock).mockReturnValue({ mutateAsync: mockAssignMutateAsync, isPending: false });
  (useScopes as jest.Mock).mockReturnValue({
    data: {
      pages: [{
        results: [libraryScope], count: 1, next: null, previous: null,
      }],
    },
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    isFetchingNextPage: false,
    isLoading: false,
    isError: false,
  });
  (useOrgs as jest.Mock).mockReturnValue({
    data: {
      results: [{
        id: 1, name: 'Organization One', shortName: 'org1', description: '', logo: null, active: true,
      }],
    },
  });
  (useScopePermissions as jest.Mock).mockReturnValue({ hasPlatformPermission: false, orgHasPermission: { org1: true } });
  (getAuthenticatedUser as jest.Mock).mockReturnValue({ administrator: true });
};

describe('RolesPermissionsTable', () => {
  beforeEach(() => {
    setUpMocks();
  });

  it('renders the columns from the design', () => {
    renderTable();

    const headers = screen.getAllByRole('columnheader').map(({ textContent }) => textContent);
    expect(headers).toEqual(['Role', 'Type of resource', 'Members', 'Permissions', 'Last updated', 'Actions']);
  });

  it('lists the catalog roles of every viewable scope type with their permission count', () => {
    renderTable();

    expect(roleNames()).toEqual([
      'Course Admin', 'Course Staff', 'Library Admin', 'Library Author', 'Library Contributor', 'Library User',
      'Library reviewer',
    ]);
    const courseAdmin = within(getRow('Course Admin'));
    expect(courseAdmin.getByText('Courses')).toBeInTheDocument();
    expect(courseAdmin.getByText('3 Granted')).toBeInTheDocument();
    expect(screen.getAllByText('Showing 7 roles of 7.')).toHaveLength(2);
  });

  it('marks custom roles and gives them the edit action, standard roles the view action', () => {
    renderTable();

    const customRow = within(getRow('Library reviewer'));
    expect(customRow.getByText('Custom Role')).toBeInTheDocument();
    expect(customRow.getByRole('button', { name: 'Edit role' })).toBeInTheDocument();

    const standardRow = within(getRow('Library Admin'));
    expect(standardRow.queryByText('Custom Role')).not.toBeInTheDocument();
    expect(standardRow.getByRole('button', { name: 'View role' })).toBeInTheDocument();
    expect(standardRow.getByRole('button', { name: 'More actions' })).toBeInTheDocument();
  });

  it('only lists the scope types the user can view', () => {
    mockAuthzCatalog({ catalog: catalogWithCustomRole, scopeTypes: [SCOPE_TYPES.LIBRARY] });
    renderTable();

    expect(screen.queryByText('Course Admin')).not.toBeInTheDocument();
    expect(screen.getByText('Library Admin')).toBeInTheDocument();
  });

  it('searches roles by name', async () => {
    const user = userEvent.setup();
    renderTable();

    await user.type(screen.getByPlaceholderText('Search'), 'staff');

    expect(roleNames()).toEqual(['Course Staff']);
  });

  it('filters by type of resource and shows the applied filter as a removable chip', async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole('button', { name: /Type of resource/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Courses' }));

    expect(roleNames()).toEqual(['Course Admin', 'Course Staff']);
    expect(screen.getByText('Filtered by:')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove Courses filter' }));

    expect(screen.queryByText('Filtered by:')).not.toBeInTheDocument();
    expect(roleNames()).toHaveLength(7);
  });

  it('shows an empty state when no role matches', async () => {
    const user = userEvent.setup();
    renderTable();

    await user.type(screen.getByPlaceholderText('Search'), 'nonexistent');

    expect(screen.getByText('No roles found.')).toBeInTheDocument();
  });

  it('shows a loading indicator while the catalog loads', () => {
    mockAuthzCatalog({ isLoading: true });
    renderTable();

    expect(screen.getByText('Loading roles and permissions')).toBeInTheDocument();
  });

  it('shows an error when the catalog cannot be loaded', () => {
    mockAuthzCatalog({ isError: true });
    renderTable();

    expect(screen.getByText('The roles and permissions could not be loaded. Please try again later.')).toBeInTheDocument();
  });
});

describe('RolesPermissionsTable — assign role', () => {
  const openRowMenu = async (user: ReturnType<typeof userEvent.setup>, roleName: string) => {
    await user.click(within(getRow(roleName)).getByRole('button', { name: 'More actions' }));
  };
  const queryAssignItem = () => screen.queryByRole('button', { name: 'Assign role' });

  beforeEach(() => {
    setUpMocks();
  });

  it('opens the wizard with the row role preselected', async () => {
    const user = userEvent.setup();
    renderTable();

    await openRowMenu(user, 'Library Author');
    await user.click(screen.getByRole('button', { name: 'Assign role' }));

    const wizard = screen.getByRole('dialog', { name: 'Assign Role' });
    expect(within(wizard).getByRole('radio', { name: /Library Author/ })).toBeChecked();
    expect(within(wizard).getByRole('radio', { name: /Library Admin/ })).not.toBeChecked();
  });

  it('assigns the role and shows a success toast', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync.mockResolvedValue({ invalidUsers: [], validUsers: ['alice'] });
    mockAssignMutateAsync.mockResolvedValue({
      completed: [{ userIdentifier: 'alice', scope: libraryScope.externalKey, status: 'role_added' }],
      errors: [],
    });
    renderTable();

    await openRowMenu(user, 'Library Author');
    await user.click(screen.getByRole('button', { name: 'Assign role' }));
    await user.type(screen.getByLabelText(/Add users by username or email/i), 'alice');
    await user.click(screen.getByRole('button', { name: /^Next$/i }));
    await user.click(await screen.findByLabelText('Library One'));
    await user.click(screen.getByRole('button', { name: /^Save$/i }));

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Assign Role' })).not.toBeInTheDocument());
    expect(mockAssignMutateAsync).toHaveBeenCalledWith({
      data: { users: ['alice'], role: 'library_author', scopes: [libraryScope.externalKey] },
    });
    expect(screen.getByText('Role assigned successfully.')).toBeInTheDocument();
  });

  it('hides the item for roles of a team the user cannot manage', async () => {
    const user = userEvent.setup();
    (useValidateUserPermissionsNonSuspense as jest.Mock).mockReturnValue(allowManaging(SCOPE_TYPES.LIBRARY));
    renderTable();

    await openRowMenu(user, 'Course Admin');
    expect(queryAssignItem()).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Duplicate' })).toBeInTheDocument();

    await openRowMenu(user, 'Library Admin');
    expect(queryAssignItem()).toBeInTheDocument();
  });

  it('hides the item for course roles while course authoring is disabled', async () => {
    const user = userEvent.setup();
    (useCourseAuthoringFlag as jest.Mock).mockReturnValue({
      isCourseAuthoringEnabled: false,
      isCourseEnabled: () => false,
      isOrgAuthoringEnabled: () => false,
      isLoading: false,
    });
    renderTable();

    await openRowMenu(user, 'Course Admin');

    expect(queryAssignItem()).not.toBeInTheDocument();
  });

  it('hides the item when the user cannot assign any role', async () => {
    const user = userEvent.setup();
    (useValidateUserPermissionsNonSuspense as jest.Mock).mockReturnValue(allowManaging());
    renderTable();

    await openRowMenu(user, 'Library Admin');

    expect(queryAssignItem()).not.toBeInTheDocument();
  });
});
